// Reads the behavior spec (spec/*.md, format in spec/README.md) with ourus's own parser: a state is
// a fenced `buffer` block and a `yaml` block (its result, clipboard and outline), quotes the actions
// between states, and the first state's `yaml` block (its config block, before its buffer) sets the
// test's options, its tags, and the clipboard it starts with.

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isMap, isScalar, parseDocument, Scalar } from 'yaml';
import { OurusConfig } from '../src/config.ts';
import { MdTree } from '../src/parser/syntax.ts';

import { MdBlockAt } from '../src/parser/tree.ts';
import type { MdBlock, MdLine } from '../src/parser/types.ts';
import { drawsCaret, readDropLine } from './drawing.ts';

/** A parsed spec file: its text, block tree and line table. */
type Parsed = { readonly text: string; readonly root: MdBlock; readonly lines: readonly MdLine[] };

/**
 * The clipboard formats a case can give or check, named as a `DataTransfer` names them: a copy's text,
 * a Markdown app's own copy (Obsidian writes it, ourus will), a rendered copy's HTML, and the mark a
 * code editor's copy carries (VS Code's: its HTML is a picture of the text).
 */
export const CLIPBOARD_TYPES = ['text/plain', 'text/markdown', 'text/html', 'vscode-editor-data'] as const;
export type ClipboardType = (typeof CLIPBOARD_TYPES)[number];

/** A clipboard: each format it holds, drawn (`→`, `␍`, `⍽` for invisible characters). */
export type Clipboard = Readonly<Partial<Record<ClipboardType, string>>>;

/** What a state's blocks say about the editor: drawn buffer, clipboard, the last action's result. */
export interface State {
  buffer?: string;
  clipboard?: Clipboard;
  /** `success`, `deferredToHost`, or `rejected <reason>`. */
  result?: string;
  /** How the buffer reads (`drawOutline`), where a case's point is a reading its bytes don't show. */
  outline?: string;
  /** After a pickup (`drag`): the labels of the nodes it takes, and every place it offers, drawn (spec/drag.md). */
  dragNodes?: string;
  dropPoints?: string;
  /** The view after the step, by label: the folded nodes (none: `folded: none`), the node zoomed into (`zoom: none`). */
  folded?: string;
  zoom?: string;
}

/** The view a test starts in (its config block's): the folded nodes and the one zoomed into, by label, as the start's snapshot holds them (`OurusDoc.folded`, `OurusDoc.zoom`). */
export interface View {
  readonly folded?: string;
  readonly zoom?: string;
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
  /** Its own heading, its case's ID (`Enter1`): unique across the spec's files, the headings above it no part of it. */
  readonly name: string;
  /** Agreed behavior not implemented yet: the tag `pending`. */
  readonly pending: boolean;
  /** Its config block's: ourus's config. */
  readonly options: Readonly<Record<string, string>>;
  /** What the case depends on, from `TAGS` (its config block's `tags`). */
  /** How often a user meets the case: the first word of its `tags`. */
  readonly rank: Rank;
  readonly tags: readonly Tag[];
  readonly initial: State & { buffer: string };
  readonly view: View;
  readonly steps: Step[];
}

/** How often a user meets a case, the first of its tags: review metadata, never an editor setting. */
export const RANKS = ['core', 'common', 'edge', 'rare'] as const;
export type Rank = (typeof RANKS)[number];

/**
 * A case's tags: facts about what it depends on, for runners to select cases by, never names of
 * editors or verdicts, and `pending`, behavior agreed on but not built yet. A case has every tag that
 * applies to it; spec/README.md says what each means. The SxS (`sxs/lib/plan.ts`) skips a `free-form`
 * case on block outliners, whose documents have no form for that structure; a driver lists the
 * `markup-` tags its app can't compare in `refuses`, and the case is skipped there.
 */
export const TAGS = ['free-form', 'markup-heading', 'markup-task', 'markup-fence', 'enter-in-fence', 'pending'] as const;

export type Tag = (typeof TAGS)[number];

/** The ourus config a test's options set, as values. */
export function specConfig(options: Readonly<Record<string, string>>): Partial<OurusConfig> {
  const set = OurusConfig.read(options);
  if (typeof set === 'string') throw new SpecError(set);
  return set;
}

/** The spec's directory. */
export const SPEC_DIR = fileURLToPath(new URL('../spec/', import.meta.url));

/** The spec files, by name, sorted (the README is none). */
export const specFiles = (): string[] => readdirSync(SPEC_DIR).filter((f) => f.endsWith('.md') && f !== 'README.md').sort();

/** A spec file's cases, by its name. */
export const readSpecFile = (file: string): SpecTest[] => readSpec(file, readFileSync(SPEC_DIR + file, 'utf8'));

export class SpecError extends Error {}

/** The first line of `drawn` with a `␠` that doesn't end it (`␠` draws a line's trailing spaces, and nothing else), or -1. */
const strayBlank = (drawn: string): number => drawn.split('\n').findIndex((l) => /␠(?!␠*$)/.test(l));
const STRAY_BLANK = '`␠` draws a line\'s trailing spaces only: write a space as a space elsewhere';

export function readSpec(file: string, source: string): SpecTest[] {
  const syntax = MdTree.parse(source);
  const tree: Parsed = { text: source, root: syntax.root, lines: syntax.lines };
  const fail = (line: number, message: string): never => {
    throw new SpecError(`${file}:${line + 1}: ${message}`);
  };
  if (/^---\r?\n/.test(source)) fail(0, "no frontmatter: a test's options go in its config block");

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
  /** The states whose `yaml` block has been read: one each. */
  const withYaml = new Set<State>();

  for (const at of new MdBlockAt(tree.root, 0).children()) {
    const { block, line: start } = at;
    if (block.type === 'thematic_break') fail(start, '--- no longer separates tests: give each test a heading of its own');
    // a heading ends a test; each test has one of its own, so it can be linked to
    if (block.type === 'heading') {
      const text = headingText(tree, at);
      const anchor = slug(text);
      const seen = anchors.get(anchor);
      if (seen !== undefined) fail(start, `duplicate heading "${text}" (as line ${seen + 1}): headings name tests and are their anchors, so each must be unique in its file`);
      anchors.set(anchor, start);
      headings.length = block.attrs.level! - 1;
      headings[block.attrs.level! - 1] = text;
      if (config) fail(config.line, 'a config block with no test after it');
      test = null;
      group = null;
      sectionHasTest = false;
      continue;
    }
    if (block.type === 'blockquote') {
      if (!test) fail(start, 'actions before any buffer');
      const actions = tokenize(quoteText(tree, at));
      if (actions.length === 0) fail(start, 'a quote with no actions');
      const step: Step = { line: start + 1, actions, expect: {} };
      test!.steps.push(step);
      group = step.expect;
      continue;
    }
    if (block.type !== 'code_block' || !block.attrs.fenced) continue;
    const [kind, ...words] = (block.attrs.info ?? '').trim().split(/\s+/);
    if (kind === 'config') fail(start, 'a config block is a `yaml` block');
    if (kind === 'result') fail(start, 'a result is a key of the state\'s `yaml` block: "result: deferredToHost", "result: rejected not-expressible"');
    if (kind === 'outline') fail(start, 'an outline is a key of the state\'s `yaml` block: "outline: |", its lines indented under it');
    if (kind === 'clipboard' || kind === 'clipboard-no-newline') fail(start, 'a clipboard is a key of the state\'s `yaml` block: "clipboard: |", its lines indented under it ("|-" ends it without a line break), or its formats under it ("text/plain: |")');
    if (kind !== 'buffer' && kind !== 'yaml') continue;
    if (block.attrs.fenceOffset) fail(start, 'an indented fence would change its content');
    if (words.length > 0) fail(start, `"${words.join(' ')}" after "${kind}": options go in a config block before the test's first block`);
    if (kind === 'yaml') {
      if (!test) {
        if (config) fail(start, 'a second config block for one test');
        config = { line: start, ...readConfig(fenceContent(tree, at), start + 1, (line, m) => fail(line, m), 'start') };
        continue;
      }
      if (group === test.initial) fail(start, "a config block goes before a test's first block");
      if (withYaml.has(group!)) fail(start, 'a second yaml block for one state (each test needs a heading of its own)');
      withYaml.add(group!);
      const read = readConfig(fenceContent(tree, at), start + 1, (line, m) => fail(line, m), 'step');
      if (read.result !== undefined) group!.result = read.result;
      if (read.clipboard !== undefined) group!.clipboard = read.clipboard;
      if (read.clipboard && Object.values(read.clipboard).some((c) => strayBlank(c) >= 0)) fail(start, STRAY_BLANK);
      if (read.outline !== undefined) group!.outline = read.outline;
      if (read.dragNodes !== undefined) group!.dragNodes = read.dragNodes;
      if (read.dropPoints !== undefined) group!.dropPoints = read.dropPoints;
      if (read.view.folded !== undefined) group!.folded = read.view.folded;
      if (read.view.zoom !== undefined) group!.zoom = read.view.zoom;
      continue;
    }
    if (!test) {
      if (sectionHasTest) fail(start, 'a second test under one heading: give each test a heading of its own');
      const name = headings.slice(1).filter(Boolean).pop() ?? '';
      if (!name) fail(start, "a test needs a heading of its own, below the file's title");
      sectionHasTest = true;
      if (!config?.rank) return fail(config?.line ?? start, 'a test is ranked: its config block has "tags:", its rank first (core, common, edge or rare)');
      test = { file, line: config.line + 1, name, pending: !!config.tags?.includes('pending'), options: config.options, rank: config.rank, tags: config.tags ?? [], initial: { buffer: '' }, view: config.view, steps: [] };
      delete (test.initial as State).buffer;
      if (config.clipboard !== undefined) test.initial.clipboard = config.clipboard;
      if (config.clipboard && Object.values(config.clipboard).some((c) => strayBlank(c) >= 0)) fail(config.line, STRAY_BLANK);
      if (config.outline !== undefined) test.initial.outline = config.outline;
      config = null;
      tests.push(test);
      group = test.initial;
    }
    if (group!.buffer !== undefined) fail(start, 'a second buffer block for one state (each test needs a heading of its own)');
    group!.buffer = fenceContent(tree, at);
    // (a step's buffer may leave the caret out, where it isn't checked; a start draws it)
    if (group === tests[tests.length - 1]?.initial && !drawsCaret(group!.buffer)) fail(start, "a test's start draws its caret (`┃`, or a selection); only a step's buffer may leave it out");
    const stray = strayBlank(group!.buffer);
    if (stray >= 0) fail(start + 1 + stray, STRAY_BLANK);
  }

  if (config) fail(config.line, 'a config block with no test after it');
  for (const t of tests) if (t.initial.buffer === undefined) fail(t.line - 1, 'a test with no buffer to start from');
  for (const t of tests) if (t.steps.length === 0) fail(t.line - 1, 'a test with no actions');
  for (const t of tests) checkDrop(t, (line, m) => fail(line, m));
  return tests;
}

/**
 * A case's drop (spec/README.md): a drop line in its start and one drop action, or neither; never a
 * drop line in a step's buffer.
 */
function checkDrop(t: SpecTest, fail: (line: number, message: string) => never): void {
  const read = (drawn: string, line: number): boolean => {
    try {
      return readDropLine(drawn).drop !== null;
    } catch (e) {
      return fail(line, (e as Error).message);
    }
  };
  const drawn = read(t.initial.buffer, t.line - 1);
  for (const step of t.steps) if (step.expect.buffer !== undefined && read(step.expect.buffer, step.line - 1)) fail(step.line - 1, "a drop line (`▸`) is a start's: a step's buffer draws the state, not where a drop goes");
  const drops = t.steps.flatMap((step) => step.actions.filter((a) => /^(?:moveSubtree(?:\s|$)|pasteAt$)/.test(a)).map(() => step.line));
  if (drops.length > 1) fail(drops[1]! - 1, 'a second drop: a case drops once, at its start\'s drop line');
  if (drops.length && !drawn) fail(drops[0]! - 1, 'a drop with no drop line (`▸`) in the start to say where it lands');
  if (!drops.length && drawn) fail(t.line - 1, 'a drop line (`▸`) in the start with no drop');
}

/** A heading's anchor, as GitHub makes it: lower case, punctuation dropped, spaces as hyphens. */
export const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s/g, '-');

/** Actions are words, or quoted text (`"some text"`) that is typed; a word may name a node by its label (`moveSubtree ②`). */
export const tokenize = (s: string): string[] => s.match(/"[^"]*"|\S+(?:\s+[\u2460-\u2473\u3251-\u325f\u32b1-\u32bf](?!\S))?/gu) ?? [];

/** What a state's `yaml` block says: options, tags and the rank (the config block's), the clipboard and the outline, the result (a step's). */
type Read = { options: Record<string, string>; clipboard?: Clipboard; outline?: string; result?: string; rank?: Rank; tags?: Tag[]; dragNodes?: string; dropPoints?: string; view: { folded?: string; zoom?: string } };

/** Where a `yaml` block is: a test's config block (its first state's), or a state after a step. */
type Where = 'start' | 'step';

/**
 * A state's `yaml` block, read as YAML, every value a string (YAML's failsafe schema: `false` is the
 * word). A test's config block holds options, its tags, the clipboard it starts with and the outline; a block after a step its result, clipboard and outline,
 * and no options. An unknown key or a value an option doesn't take is an error.
 *
 * A clipboard is its text (`text/plain` alone), or its formats under it, keyed by `CLIPBOARD_TYPES`;
 * the one a test starts with has a text, as every copy does. Each text, and an outline, is a literal
 * block, its lines indented two spaces under its key: `|` ends the text with a line break, `|-`
 * without one, and an indentation indicator (`|2`) keeps the spaces its lines all start with, which
 * YAML would otherwise take for the block's indentation. One line without a line break, which paste
 * puts inline, is a quoted string instead (`"x"`, `'<p class="a">x</p>'`), and only it: the two
 * read differently at a glance, and a bare one would lose what follows a ` #` to a comment.
 * A config block's `tags` are words from `TAGS`, separated by spaces, each at most once.
 * `first` is the 0-based line of the text's first line.
 */
function readConfig(text: string, first: number, fail: (line: number, message: string) => never, where: Where): Read {
  const lineAt = (offset: number): number => first + (text.slice(0, offset).match(/\n/g)?.length ?? 0);
  const columnAt = (offset: number): number => offset - (text.lastIndexOf('\n', offset - 1) + 1);
  const doc = parseDocument(text, { schema: 'failsafe' });
  const error = doc.errors[0];
  if (error) fail(lineAt(error.pos[0]), `not YAML: ${error.message.split('\n')[0]!.replace(/ at line \d+, column \d+:?$/, '')}`);
  const read: Read = { options: {}, view: {} };
  if (doc.contents === null) return read;
  if (!isMap(doc.contents)) fail(first, 'options are "key: value" lines');
  /** A text: a literal block of lines under its key, at `keyColumn`, or one quoted line without a line break. */
  const textOf = (v: unknown, noun: string, keyColumn: number, at: number): string => {
    const what = `${/^[aeiou]/.test(noun) ? 'an' : 'a'} ${noun}`;
    const scalar = isScalar(v) && typeof v.value === 'string' ? (v as Scalar<string>) : null;
    const value = scalar?.value ?? '';
    if (scalar?.type === Scalar.QUOTE_DOUBLE || scalar?.type === Scalar.QUOTE_SINGLE) {
      if (/[\r\n]/.test(value)) fail(at, `a quoted ${noun} is one line without a line break: lines go in a literal block, "|"`);
      return value;
    }
    if (scalar?.type !== Scalar.BLOCK_LITERAL) fail(at, `${what} is a literal block, "|", its lines indented two spaces under it, or one line without a line break, quoted: "x"`);
    if (!/[\r\n]/.test(value)) fail(at, `${what} of one line without a line break is a quoted string: "x"`);
    // without an indicator, YAML takes the first line's indentation for the block's, and drops it from every line
    const [header, ...after] = text.slice(scalar!.range![0], scalar!.range![1]).split('\n');
    const firstLine = after.find((l) => l.trim() !== '');
    // a text of line breaks only has no line to take the indentation from
    if (!/\d/.test(header!) && firstLine !== undefined && /^ */.exec(firstLine)![0].length !== keyColumn + 2)
      fail(at + 1, `${what}'s lines are indented two spaces under it; for spaces they all start with, an indentation indicator says where its text starts ("|2")`);
    return value;
  };
  for (const { key: k, value: v } of doc.contents.items) {
    const at = lineAt(isScalar(k) ? k.range![0] : 0);
    const key = isScalar(k) ? String(k.value) : fail(at, 'options are "key: value" lines');
    const keyColumn = columnAt((k as Scalar).range![0]);
    if (key === 'clipboard') {
      if (!isMap(v)) {
        read.clipboard = { 'text/plain': textOf(v, 'clipboard', keyColumn, at) };
        continue;
      }
      const clipboard: Partial<Record<ClipboardType, string>> = {};
      for (const { key: fk, value: fv } of v.items) {
        const fat = lineAt(isScalar(fk) ? fk.range![0] : 0);
        const type = isScalar(fk) ? String(fk.value) : fail(fat, 'a clipboard\'s formats are "type: text" lines');
        if (!(CLIPBOARD_TYPES as readonly string[]).includes(type)) fail(fat, `no clipboard format "${type}": formats are ${CLIPBOARD_TYPES.join(', ')}`);
        clipboard[type as ClipboardType] = textOf(fv, `clipboard's ${type}`, columnAt((fk as Scalar).range![0]), fat);
      }
      if (Object.keys(clipboard).length === 0) fail(at, 'a clipboard with no formats');
      if (where === 'start' && clipboard['text/plain'] === undefined) fail(at, 'the clipboard a test starts with has a text/plain, as every copy does');
      read.clipboard = clipboard;
      continue;
    }
    if (key === 'outline') {
      read.outline = textOf(v, 'outline', keyColumn, at).trim();
      continue;
    }
    if (key === 'dropPoints') {
      if (where !== 'step') fail(at, "dropPoints are a pickup's: they go in the `yaml` block after a `drag`");
      read.dropPoints = textOf(v, 'dropPoints drawing', keyColumn, at);
      continue;
    }
    if (!isScalar(v) || typeof v.value !== 'string') fail(at, `option "${key}" takes one value`);
    const value = (v as Scalar<string>).value;
    if (key === 'dragNodes') {
      if (where !== 'step') fail(at, "dragNodes are a pickup's: they go in the `yaml` block after a `drag`");
      read.dragNodes = value;
      continue;
    }
    if (key === 'folded' || key === 'zoom') {
      // the view a test starts in (its config block), or the one a step leaves (its state's)
      if (where === 'start' && value.trim() === 'none') fail(at, `"${key}: none" is a step's: a test with no ${key} leaves the key out`);
      read.view[key] = value;
      continue;
    }
    if (key === 'result') {
      if (where !== 'step') fail(at, "a result is a step's: it goes in the `yaml` block after the step's actions");
      if (!/^(?:success|deferredToHost|rejected [a-z0-9-]+)$/.test(value)) fail(at, `a result is success, deferredToHost or "rejected <reason>", not "${value}"`);
      read.result = value;
      continue;
    }
    if (where === 'step') fail(at, `"${key}" in a state after a step, which holds its result, clipboard and outline: options go in the test's config block`);
    if (key === 'rank') fail(at, 'the rank is the first tag: "tags: edge", or "tags: edge free-form"');
    if (key === 'tags') {
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
    const set = OurusConfig.read({ [key]: value });
    if (typeof set === 'string') fail(at, set);
    read.options[key] = value;
  }
  return read;
}

function lineText(tree: Parsed, l: number): string {
  const line = tree.lines[l]!;
  return tree.text.slice(line.contentFrom, line.to);
}

function headingText(tree: Parsed, b: MdBlockAt): string {
  if (b.block.attrs.setext) return lineText(tree, b.line).trim();
  return lineText(tree, b.line).replace(/^[ \t]*#+[ \t]*/, '').replace(/[ \t]+#+[ \t]*$/, '').trim();
}

function quoteText(tree: Parsed, b: MdBlockAt): string {
  const out: string[] = [];
  for (let l = b.line; l <= b.lastLine; l++) out.push(lineText(tree, l));
  return out.join(' ');
}

/** A fenced block's lines with their endings, verbatim. A buffer's last line always ends in a newline. */
function fenceContent(tree: Parsed, b: MdBlockAt): string {
  const { fenceChar, fenceLength } = b.block.attrs;
  const end = b.lastLine;
  const last = tree.lines[end]!;
  const closed = end > b.line && new RegExp(`^ {0,3}\\${fenceChar}{${fenceLength},}[ \\t]*$`).test(tree.text.slice(last.from, last.to));
  const from = tree.lines[b.line + 1]?.from ?? tree.text.length;
  const to = closed ? last.from : last.to + last.ending.length;
  return end > b.line ? tree.text.slice(from, to) : '';
}
