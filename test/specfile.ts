// Reads the behavior spec (spec/*.md, format in spec/README.md) with ourus's own parser: fenced
// `buffer`, `clipboard` and `result` blocks are editor states, quotes the actions between them, and
// a config block before them (a `yaml` block) sets a test's options over the file's frontmatter, and
// the clipboard it starts with.

import { isMap, isScalar, parseDocument, Scalar } from 'yaml';
import { Config } from '../src/config.ts';
import { SyntaxTree } from '../src/parser/syntax.ts';
import type { Block, LineInfo } from '../src/parser/types.ts';

/** A parsed spec file: its text, block tree and line table. */
type Parsed = { readonly text: string; readonly root: Block; readonly lines: readonly LineInfo[] };

/** What a block says about the editor: drawn buffer, clipboard text, the last action's result. */
export interface State {
  buffer?: string;
  clipboard?: string;
  result?: string;
  /** How the buffer reads (`drawOutline`), where a case's point is a reading its bytes don't show. */
  outline?: string;
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
  /** Agreed behavior not implemented yet: `status: pending`. */
  readonly pending: boolean;
  /** Frontmatter, then the test's config block, which wins. */
  readonly options: Readonly<Record<string, string>>;
  /** What the case depends on, from `TAGS` (its config block's `tags`). */
  /** How often a user meets the case: the first word of its `tags`. */
  readonly rank: Rank;
  readonly tags: readonly Tag[];
  readonly initial: State & { buffer: string };
  readonly steps: Step[];
}

/**
 * Known options, so an unknown one is an error, not silently ignored: `status` (`pending` for
 * behavior agreed on but not built, or `ready`, the default), and the keys of ourus's config
 * (`src/config.ts`).
 */
const SPEC_OPTIONS: Readonly<Record<string, readonly string[]>> = { status: ['ready', 'pending'] };

/** How often a user meets a case, the first of its tags: review metadata, never an editor setting. */
export const RANKS = ['core', 'common', 'edge', 'rare'] as const;
export type Rank = (typeof RANKS)[number];

/**
 * A case's tags: facts about what it depends on, for runners to select cases by, never names of
 * editors or verdicts. A case has every tag that applies to it; spec/README.md says what each means.
 * The SxS (`sxs/lib/plan.ts`) skips a `free-form` case on block outliners, whose documents have no
 * form for that structure; a driver lists the `markup-` tags its app can't compare in `refuses`,
 * and the case is skipped there.
 */
export const TAGS = ['free-form', 'markup-heading', 'markup-task', 'markup-fence', 'quote-container'] as const;

export type Tag = (typeof TAGS)[number];

/** The ourus config a test's options set: every option but the spec's own, as values. */
export function specConfig(options: Readonly<Record<string, string>>): Partial<Config> {
  const set = Config.read(Object.fromEntries(Object.entries(options).filter(([key]) => !(key in SPEC_OPTIONS))));
  if (typeof set === 'string') throw new SpecError(set);
  return set;
}

export class SpecError extends Error {}

export function readSpec(file: string, source: string): SpecTest[] {
  const { body, options: fileOptions } = frontmatter(file, source);
  const syntax = SyntaxTree.parse(body);
  const tree: Parsed = { text: body, root: syntax.root, lines: syntax.lines };
  const fail = (line: number, message: string): never => {
    throw new SpecError(`${file}:${line + 1}: ${message}`);
  };

  const tests: SpecTest[] = [];
  /** A config block read, waiting for the test it starts. */
  let config: ({ line: number } & Read) | null = null;
  const headings: string[] = [];
  /** Every heading's anchor, so none is repeated: a heading names a test and links to it. */
  const anchors = new Map<string, number>();
  /** Whether the current heading's section already holds a test. */
  let sectionHasTest = false;
  let test: (SpecTest & { pending: boolean; options: Record<string, string>; tags: Tag[] }) | null = null;
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
    if (kind === 'clipboard-no-newline') fail(block.startLine, 'no "clipboard-no-newline" block: a clipboard is a literal block in the config, and "clipboard: |-" ends it without a line break');
    if (kind === 'config') fail(block.startLine, 'a config block is a `yaml` block');
    if (kind !== 'buffer' && kind !== 'clipboard' && kind !== 'result' && kind !== 'outline' && kind !== 'yaml') continue;
    if (block.fenceOffset) fail(block.startLine, 'an indented fence would change its content');
    if (words.length > 0) fail(block.startLine, `"${words.join(' ')}" after "${kind}": options go in a config block before the test's first block`);
    if (kind === 'yaml') {
      if (test) fail(block.startLine, "a config block goes before a test's first block");
      if (config) fail(block.startLine, 'a second config block for one test');
      config = { line: block.startLine, ...readConfig(fenceContent(tree, block), block.startLine + 1, (line, m) => fail(line, m), true) };
      continue;
    }
    if (!test) {
      if (sectionHasTest) fail(block.startLine, 'a second test under one heading: give each test a heading of its own');
      const name = headings.slice(1).filter(Boolean).join(' › ');
      if (!name) fail(block.startLine, "a test needs a heading of its own, below the file's title");
      sectionHasTest = true;
      const options = { ...fileOptions, ...config?.options };
      if (!config?.rank) return fail(config?.line ?? block.startLine, 'a test is ranked: its config block has "tags:", its rank first (core, common, edge or rare)');
      test = { file, line: config.line + 1, name, pending: options.status === 'pending', options, rank: config.rank, tags: config.tags ?? [], initial: { buffer: '' }, steps: [] };
      delete (test.initial as State).buffer;
      if (config?.clipboard !== undefined) test.initial.clipboard = config.clipboard;
      config = null;
      tests.push(test);
      group = test.initial;
    }
    if (kind === 'result' && group === test.initial) fail(block.startLine, 'a result before any action');
    // before the first action: the config, then the buffer, and nothing else
    if (kind === 'clipboard' && group === test.initial) fail(block.startLine, 'the clipboard a test starts with goes in its config block: "clipboard: |", its lines indented under it');
    if (group![kind] !== undefined) fail(block.startLine, `a second ${kind} block for one state (each test needs a heading of its own)`);
    const content = fenceContent(tree, block);
    group![kind] = kind === 'result' || kind === 'outline' ? content.trim() : content;
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
  const { options } = readConfig(m[1]!, 1, (line, msg) => {
    throw new SpecError(`${file}:${line + 1}: ${msg}`);
  });
  // blank lines in its place keep line numbers right
  return { body: m[0].replace(/[^\r\n]/g, '') + source.slice(m[0].length), options };
}

/** What frontmatter or a config block says: options, and (a config block's) the clipboard a test starts with and its tags. */
type Read = { options: Record<string, string>; clipboard?: string; rank?: Rank; tags?: Tag[] };

/**
 * Frontmatter or a config block, read as YAML, every value a string (YAML's failsafe schema: `false`
 * is the word). Its options are checked: an unknown key or a value the option doesn't take is an
 * error. A config block's `clipboard` is a literal block, its lines indented two spaces under it:
 * `|` ends the text with a line break, `|-` without one, and an indentation indicator (`|2`) keeps
 * the spaces its lines all start with, which YAML would otherwise take for the block's indentation.
 * One line without a line break, which paste puts inline, is a double-quoted string instead
 * (`clipboard: "x"`), and only it: the two read differently at a glance.
 * A config block's `tags` are words from `TAGS`, separated by spaces, each at most once.
 * `first` is the 0-based line of the text's first line.
 */
function readConfig(text: string, first: number, fail: (line: number, message: string) => never, inTest = false): Read {
  const lineAt = (offset: number): number => first + (text.slice(0, offset).match(/\n/g)?.length ?? 0);
  const doc = parseDocument(text, { schema: 'failsafe' });
  const error = doc.errors[0];
  if (error) fail(lineAt(error.pos[0]), `not YAML: ${error.message.split('\n')[0]!.replace(/ at line \d+, column \d+:?$/, '')}`);
  const read: Read = { options: {} };
  if (doc.contents === null) return read;
  if (!isMap(doc.contents)) fail(first, 'options are "key: value" lines');
  for (const { key: k, value: v } of doc.contents.items) {
    const at = lineAt(isScalar(k) ? k.range![0] : 0);
    const key = isScalar(k) ? String(k.value) : fail(at, 'options are "key: value" lines');
    if (!isScalar(v) || typeof v.value !== 'string') fail(at, `option "${key}" takes one value`);
    const value = (v as Scalar<string>).value;
    if (key === 'clipboard') {
      if (!inTest) fail(at, "a clipboard is a test's: it goes in its config block");
      // one line without a line break, which paste puts inline, is a string; anything else a block
      if ((v as Scalar).type === Scalar.QUOTE_DOUBLE) {
        if (/[\r\n]/.test(value)) fail(at, 'a quoted clipboard is one line without a line break: lines go in a literal block, "clipboard: |"');
        read.clipboard = value;
        continue;
      }
      if ((v as Scalar).type !== Scalar.BLOCK_LITERAL) fail(at, 'a clipboard is a literal block, "clipboard: |", its lines indented two spaces under it, or one line without a line break, "clipboard: \"x\""');
      if (!/[\r\n]/.test(value)) fail(at, 'a clipboard of one line without a line break is a quoted string: "clipboard: \"x\""');
      // without an indicator, YAML takes the first line's indentation for the block's, and drops it from every line
      const [header, ...after] = text.slice((v as Scalar).range![0]).split('\n');
      const firstLine = after.find((l) => l.trim() !== '');
      // a clipboard of line breaks only has no line to take the indentation from
      if (!/\d/.test(header!) && firstLine !== undefined && /^ */.exec(firstLine)![0].length !== 2)
        fail(at + 1, `a clipboard's lines are indented two spaces under it; for spaces they all start with, an indentation indicator says where its text starts ("|2")`);
      read.clipboard = value;
      continue;
    }
    if (key === 'rank') fail(at, 'the rank is the first tag: "tags: edge", or "tags: edge free-form"');
    if (key === 'tags') {
      if (!inTest) fail(at, "tags are a test's: they go in its config block");
      // the rank first, then the tags, each a word
      const [rank, ...tags] = value.split(/\s+/).filter(Boolean);
      if (!(RANKS as readonly (string | undefined)[]).includes(rank)) fail(at, `the first tag is the rank: ${RANKS.join(', ')}, not "${rank ?? ''}"`);
      read.rank = rank as Rank;
      const unknown = tags.find((t) => !(TAGS as readonly string[]).includes(t));
      if (unknown !== undefined) fail(at, `no tag "${unknown}": tags are ${TAGS.join(', ')}`);
      const twice = tags.find((t, i) => tags.indexOf(t) !== i);
      if (twice !== undefined) fail(at, `tag "${twice}" given twice`);
      read.tags = tags as Tag[];
      continue;
    }
    const values = SPEC_OPTIONS[key];
    if (values) {
      if (!values.includes(value)) fail(at, `option "${key}" takes ${values.join(', ')}, not "${value}"`);
    } else {
      const set = Config.read({ [key]: value });
      if (typeof set === 'string') fail(at, set);
    }
    read.options[key] = value;
  }
  return read;
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
