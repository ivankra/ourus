// Reads the behaviour spec (spec/*.md, format in spec/README.md) with ourus's own parser: fenced
// `buffer`, `clipboard` and `result` blocks are editor states, quotes the actions between them, and
// a `config` block before them sets a test's options over the file's frontmatter.

import { readConfig, readSettings, type Config } from '../src/config.ts';
import { parseCommonMark } from '../src/syntax/commonmark.ts';
import type { Block, LineInfo } from '../src/block.ts';

/** A parsed spec file: its text, block tree and line table. */
type Parsed = { readonly text: string; readonly root: Block; readonly lines: readonly LineInfo[] };

/** What a block says about the editor: drawn buffer, clipboard text, the last action's result. */
export interface State {
  buffer?: string;
  clipboard?: string;
  result?: string;
}

export interface Step {
  /** Line (1-based) of the quote listing the actions. */
  readonly line: number;
  readonly actions: readonly string[];
  /** What must hold after the actions; empty when nothing is checked. */
  readonly expect: State;
}

export interface SpecTest {
  readonly file: string;
  /** Line (1-based) of the test's first block. */
  readonly line: number;
  /** The headings above it, below the file's title (`Enter › At the start of an item`). */
  readonly name: string;
  /** Agreed behaviour not implemented yet: `status: pending`. */
  readonly pending: boolean;
  /** Frontmatter, then the test's `config` block, which wins. */
  readonly options: Readonly<Record<string, string>>;
  readonly initial: State & { buffer: string };
  readonly steps: Step[];
}

/**
 * Known options, so an unknown one is an error, not silently ignored: `status` (`pending` for
 * behaviour agreed on but not built, or `ready`, the default), `editor`, whose behaviour a file draws
 * (`ourus`, the default, or `logseq`), and the keys of ourus's config (`src/config.ts`).
 */
const SPEC_OPTIONS: Readonly<Record<string, readonly string[]>> = { status: ['ready', 'pending'], editor: ['ourus', 'logseq'] };

/** The ourus config a test's options set: every option but the spec's own, as values. */
export function specConfig(options: Readonly<Record<string, string>>): Partial<Config> {
  const set = readSettings(Object.fromEntries(Object.entries(options).filter(([key]) => !(key in SPEC_OPTIONS))));
  if (typeof set === 'string') throw new SpecError(set);
  return set;
}

export class SpecError extends Error {}

export function readSpec(file: string, source: string): SpecTest[] {
  const { body, options: fileOptions } = frontmatter(file, source);
  const tree: Parsed = { text: body, ...parseCommonMark(body) };
  const fail = (line: number, message: string): never => {
    throw new SpecError(`${file}:${line + 1}: ${message}`);
  };

  const tests: SpecTest[] = [];
  /** A `config` block read, waiting for the test it starts. */
  let config: { line: number; options: Record<string, string> } | null = null;
  const headings: string[] = [];
  /** Every heading's anchor, so none is repeated: a heading names a test and links to it. */
  const anchors = new Map<string, number>();
  /** Whether the current heading's section already holds a test. */
  let sectionHasTest = false;
  let test: (SpecTest & { pending: boolean; options: Record<string, string> }) | null = null;
  /** The state blocks after the last action (or before the first) are filled in here. */
  let group: State | null = null;

  for (const block of tree.root.children) {
    if (block.type === 'thematic_break') fail(block.startLine, '--- no longer separates tests: give each test a heading of its own');
    // a heading ends a test; each test has one of its own, so it can be linked to
    if (block.type === 'heading') {
      const text = headingText(tree, block);
      const anchor = slug(text);
      const seen = anchors.get(anchor);
      if (seen !== undefined) fail(block.startLine, `duplicate heading "${text}" (as line ${seen + 1}): headings name tests and are their anchors, so each must be unique in its file`);
      anchors.set(anchor, block.startLine);
      headings.length = block.level! - 1;
      headings[block.level! - 1] = text;
      if (config) fail(config.line, 'a config block with no test after it');
      test = null;
      group = null;
      sectionHasTest = false;
      continue;
    }
    if (block.type === 'blockquote') {
      if (!test) fail(block.startLine, 'actions before any buffer');
      const actions = tokenize(quoteText(tree, block));
      if (actions.length === 0) fail(block.startLine, 'a quote with no actions');
      const step: Step = { line: block.startLine + 1, actions, expect: {} };
      test!.steps.push(step);
      group = step.expect;
      continue;
    }
    if (block.type !== 'code_block' || !block.fenced) continue;
    const [kind, ...words] = (block.info ?? '').trim().split(/\s+/);
    if (kind !== 'buffer' && kind !== 'clipboard' && kind !== 'result' && kind !== 'config') continue;
    if (block.fenceOffset) fail(block.startLine, 'an indented fence would change its content');
    if (words.length > 0) fail(block.startLine, `"${words.join(' ')}" after "${kind}": options go in a config block before the test's first block`);
    if (kind === 'config') {
      if (test) fail(block.startLine, "a config block goes before a test's first block");
      if (config) fail(block.startLine, 'a second config block for one test');
      config = { line: block.startLine, options: readOptions(fenceContent(tree, block), block.startLine + 1, (line, m) => fail(line, m)) };
      continue;
    }
    if (!test) {
      if (sectionHasTest) fail(block.startLine, 'a second test under one heading: give each test a heading of its own');
      const name = headings.slice(1).filter(Boolean).join(' › ');
      if (!name) fail(block.startLine, "a test needs a heading of its own, below the file's title");
      sectionHasTest = true;
      const options = { ...fileOptions, ...config?.options };
      test = { file, line: (config?.line ?? block.startLine) + 1, name, pending: options.status === 'pending', options, initial: { buffer: '' }, steps: [] };
      config = null;
      delete (test.initial as State).buffer;
      tests.push(test);
      group = test.initial;
    }
    if (kind === 'result' && group === test.initial) fail(block.startLine, 'a result before any action');
    if (group![kind] !== undefined) fail(block.startLine, `a second ${kind} block for one state (each test needs a heading of its own)`);
    const content = fenceContent(tree, block);
    group![kind] = kind === 'result' ? content.trim() : content;
  }

  if (config) fail(config.line, 'a config block with no test after it');
  for (const t of tests) if (t.initial.buffer === undefined) fail(t.line - 1, 'a test with no buffer to start from');
  for (const t of tests) if (t.steps.length === 0) fail(t.line - 1, 'a test with no actions');
  return tests;
}

/** A heading's anchor, as GitHub makes it: lower case, punctuation dropped, spaces as hyphens. */
export const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s/g, '-');

/** Actions are words, or quoted text (`"some text"`) that is typed. */
export const tokenize = (s: string): string[] => s.match(/"[^"]*"|\S+/g) ?? [];

function frontmatter(file: string, source: string): { body: string; options: Record<string, string> } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!m) return { body: source, options: {} };
  const options = readOptions(m[1]!, 1, (line, msg) => {
    throw new SpecError(`${file}:${line + 1}: ${msg}`);
  });
  // blank lines in its place keep line numbers right
  return { body: m[0].replace(/[^\r\n]/g, '') + source.slice(m[0].length), options };
}

/**
 * Options from `key: value` lines (frontmatter, a config block), checked: an unknown key or a value
 * the option doesn't take is an error. `first` is the 0-based line of the first one.
 */
function readOptions(text: string, first: number, fail: (line: number, message: string) => never): Record<string, string> {
  const options: Record<string, string> = {};
  text.split(/\r?\n/).forEach((line, i) => {
    if (line.trim() === '' || line.trimStart().startsWith('#')) return;
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!kv) fail(first + i, 'options are "key: value" lines');
    const [, key, raw] = kv!;
    const value = raw!.trim();
    const values = SPEC_OPTIONS[key!];
    if (values) {
      if (!values.includes(value)) fail(first + i, `option "${key}" takes ${values.join(', ')}, not "${value}"`);
    } else {
      const config = readConfig({ [key!]: value });
      if (typeof config === 'string') fail(first + i, config);
    }
    options[key!] = value;
  });
  return options;
}

function lineText(tree: Parsed, l: number): string {
  const line = tree.lines[l]!;
  return tree.text.slice(line.contentFrom, line.to);
}

function headingText(tree: Parsed, b: Block): string {
  if (b.setext) return lineText(tree, b.startLine).trim();
  return lineText(tree, b.startLine).replace(/^[ \t]*#+[ \t]*/, '').replace(/[ \t]+#+[ \t]*$/, '').trim();
}

function quoteText(tree: Parsed, b: Block): string {
  const out: string[] = [];
  for (let l = b.startLine; l <= b.endLine; l++) out.push(lineText(tree, l));
  return out.join(' ');
}

/** A fenced block's lines with their endings, verbatim. A buffer's last line always ends in a newline. */
function fenceContent(tree: Parsed, b: Block): string {
  const last = tree.lines[b.endLine]!;
  const closed =
    b.endLine > b.startLine && new RegExp(`^ {0,3}\\${b.fenceChar}{${b.fenceLength},}[ \\t]*$`).test(tree.text.slice(last.from, last.to));
  const from = tree.lines[b.startLine + 1]?.from ?? tree.text.length;
  const to = closed ? last.from : last.to + last.ending.length;
  return b.endLine > b.startLine ? tree.text.slice(from, to) : '';
}
