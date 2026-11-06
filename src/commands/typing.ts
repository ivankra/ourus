// Typing (spec/typing.md, spec/backtick.md): a character is the host's, but a
// backtick or a tilde where it opens, closes or changes a code fence. The command says what the text
// becomes; `done()` keeps a fence's runs past the code, or refuses what would unmake the block.

import { OurusProse, OurusAtom, blockIdsOf, type Located, type OurusNode, type OurusText } from '../doc/index.ts';
import { composeChanges, dominantEnding, lineOf, MarkSet, trimMd, type ChangeSpec } from '../text/index.ts';
import type { AutoCloseOpener } from '../config.ts';
import type { OurusDraft } from '../writer/index.ts';
import { CommandContext } from './context.ts';
import { CODE, breaksFence, codeAt, editInCode, lineBreakAtOpening, onDelimiterLine, type CodeAt } from './code.ts';
import { quoteLineTextFrom } from './quote.ts';
import { textEnd, textStart } from './util.ts';
import type { OurusResult } from './types.ts';
import { OurusRejected, OurusSuccess, OurusDeferred } from './types.ts';

/**
 * Typed text (`insertText`), a key's worth: a backtick or a tilde on a fence, on a code line, or
 * making its line open a fence; an opener `autoClose` lists, in text, pairs, its closer ours, or
 * wraps a selection on one line (a backtick in code); a closer before one of ours steps over it; any
 * other character the host's. Null where ourus doesn't do it yet: several characters with a backtick
 * over a selection, a fence's character in a container's prefix or a marker.
 */
export function insertTextCommand(ctx: CommandContext, typed: string): OurusResult | null {
  const fenceChar = /[`~]/.test(typed);
  const code = codeAt(ctx);
  if (!ctx.collapsed) {
    // over part of a closed block's fence run, any character breaks the fence (rule 5)
    if (overFence(ctx)) return breaksFence(ctx, 'the fence would break');
    // over a selection in code, what it leaves may make a fence (`X```` → ```` ``` ````)
    if (code) return (typed in BRACKETS && closes(ctx, typed as AutoCloseOpener) ? wrapInBrackets(ctx, typed) : null) ?? editInCode(ctx, code, code.offset, code.to, typed);
    // over a selection in one line of text, the host's but for an opener `autoClose` lists: a backtick
    // makes it code, a bracket wraps it
    if (ctx.doc.lineAt(ctx.selection.anchor).index !== ctx.doc.lineAt(ctx.selection.head).index) return new OurusDeferred();
    // (a bracket wraps it anywhere, as an editor's closeBrackets does; a backtick in code, math or a
    // comment, verbatim, is the host's)
    if (typed in BRACKETS && closes(ctx, typed as AutoCloseOpener)) return wrapInBrackets(ctx, typed) ?? new OurusDeferred();
    if (ctx.doc.verbatimSpanAt(Math.min(ctx.selection.anchor, ctx.selection.head))) return new OurusDeferred();
    if (!closes(ctx, '`') || !typed.includes('`')) return new OurusDeferred();
    return typed === '`' ? wrapInCode(ctx) : null;
  }
  if ([...typed].length > 1 && fenceChar) return typedOneByOne(ctx, typed);
  // a closer's character typed before one of ours in a block, not a fence's (`<!--┃-->`, a comment
  // auto-closed alone on its line, an atom): it steps over it, as in a text
  const at = ctx.from;
  if (at.zone === 'text' && at.text instanceof OurusAtom && (at.text.type !== 'fenced_code' || ')]}'.includes(typed)) && at.text.text[at.offset] === typed && at.text.marks.hasAutoAt(at.offset)) {
    const over = at.text.withMarks({ auto: at.text.marks.auto.filter((pos) => pos !== at.offset) });
    return ctx.apply(ctx.draft().setText(at.node, over).setCaret(at.node, at.offset + 1, 1));
  }
  // in code, the host's where it keeps the block (a line break in a container's code is ourus's, the
  // containers' prefix with it), a fence's character a fence's
  // (a line break at a block's opening delimiter's start: a blank line above it, as Enter there)
  const above = code ? lineBreakAtOpening(ctx, code, typed) : undefined;
  if (above !== undefined) return above ?? new OurusDeferred('a line break before the block: the host types it');
  if (code && (!fenceChar || code.text.type !== 'fenced_code')) return bracketTyped(ctx, typed) ?? editInCode(ctx, code, code.offset, code.offset, typed);
  const placed = placedText(ctx, typed);
  if (placed) return placed;
  const bracket = bracketTyped(ctx, typed) ?? delimiterTyped(ctx, typed) ?? bracketOnBlankLine(ctx, typed) ?? typedInEscapedPair(ctx, typed);
  if (bracket) return bracket;
  if (typed !== '`' && typed !== '~') return new OurusDeferred();
  // in a container's prefix or a marker (before a fence's indentation): not done yet
  if (ctx.from.zone === 'prefix' || ctx.from.zone === 'marker') return null;
  if (code) return fenceCharInCode(ctx, code, typed);
  // (a backtick `autoClose` lists, inside an empty pair: it steps over its closing one, before it
  // could make a fence of the two and itself)
  if (closes(ctx, '`') && typed === '`' && inEmptyPair(ctx)) return inlinePair(ctx);
  const opened = openFence(ctx, typed) ?? openFenceInQuote(ctx, typed);
  if (opened !== undefined) return opened;
  return closes(ctx, '`') && typed === '`' ? inlinePair(ctx) : new OurusDeferred();
}

/** `text` with the closer at `offset` stepped over: typed by the author, so theirs, no auto mark on it. */
const typedOver = <T extends OurusProse | OurusAtom>(text: T, offset: number): T => text.withMarks({ auto: text.marks.auto.filter((pos) => pos !== offset) }) as T;

/**
 * Where brackets pair (`autoClose`): a text, prose, a quote atom's or code's (math and comments too),
 * and whether an offset in it is markup there, where none pairs: before a prose line's text (a frame, a
 * marker's padding), before a quote line's `>`s, on a fence's line. `prose`: `$` pairs, and the
 * callout guard, there alone.
 */
export interface PairPlace {
  readonly node: OurusNode;
  readonly text: OurusProse | OurusAtom;
  readonly prose: boolean;
  markup(offset: number): boolean;
}

/** The place brackets pair at `at`, a text's; null elsewhere (a table, HTML, a gap). */
export function pairPlace(ctx: CommandContext, at: Located): PairPlace | null {
  if (at.zone !== 'text') return null;
  const { node, text } = at;
  if (text instanceof OurusProse) return { node, text, prose: true, markup: (o) => o < text.textStart(lineOf(text.text, o)) };
  if (text.type === 'blockquote') return { node, text, prose: false, markup: (o) => o < quoteLineTextFrom(ctx, node, text, o) };
  if (CODE.has(text.type)) return { node, text, prose: false, markup: (o) => onDelimiterLine(text, o) };
  return null;
}

/** Each bracket opener's closer (`$`, inline math's, its own). */
const BRACKETS: Readonly<Record<string, string>> = { '(': ')', '[': ']', '{': '}', $: '$' };

/** Whether `autoClose` lists `opener`. */
const closes = (ctx: CommandContext, opener: AutoCloseOpener): boolean => ctx.config.autoClose.includes(opener);

/**
 * A bracket typed in a node's text (`autoClose`): a closer right before one of ours steps over it; an
 * opener listed, where the next character is a blank, the line's end or a closing bracket, is typed
 * with its closer, ours, the caret between (as an editor's closeBrackets has it, in code, math and
 * after a backslash too, as every app that pairs brackets does: Auto20, Auto26): two typed so make
 * the double (`[[┃]]`); a double listed alone (`[[`, `((`) closes the second of two typed. Null where
 * it does neither: the host's.
 */
function bracketTyped(ctx: CommandContext, typed: string): OurusResult | null {
  const at = ctx.from;
  const place = pairPlace(ctx, at);
  if (!place || at.zone !== 'text') return null;
  const { node, text, prose } = place;
  const { offset } = at;
  const s = text.text;
  // (stepped over, typed by the author: theirs now)
  // (a `$`, its own closer: in an empty pair of ours, `$┃$`, the double, as a bracket's is, below)
  const emptyMath = prose && typed === '$' && s[offset - 1] === '$' && s[offset] === '$';
  if ((prose ? ')]}$' : ')]}').includes(typed) && s[offset] === typed && text.marks.hasAutoAt(offset) && !emptyMath) return ctx.apply(ctx.draft().setText(node, typedOver(text, offset)).setCaret(node, offset + 1, 1));
  const closer = BRACKETS[typed];
  // (`$` math's in prose alone: in code it is a character, in a quote atom its lines' text)
  if (!closer || (!prose && typed === '$')) return null;
  // (a `$` where `$` itself is listed, and as it opens, at a word boundary: one after text closes
  // math, `$x┃`; `$$`, without it, the delimiter's, in the flavor that reads math)
  if (typed === '$' && (!closes(ctx, '$') || !(emptyMath || atBoundary(s[offset - 1] === '\n' ? '' : (s[offset - 1] ?? ''), '([{<\'"')))) return null;
  const single = closes(ctx, typed as AutoCloseOpener);
  const double = !single && closes(ctx, (typed + typed) as AutoCloseOpener) && s[offset - 1] === typed;
  if (!single && !double) return null;
  if (place.markup(offset)) return null;
  const after = s[offset];
  if (after !== undefined && after !== '\n' && after !== ' ' && after !== '\t' && !')]}'.includes(after) && !(emptyMath && after === '$')) return null;
  const close = double ? closer + closer : closer;
  const paired = text.splice(offset, offset, typed + close);
  // (a closer that would end a callout's type, `> [!note┃ Title`: a quote's paragraph made a callout's
  // title, which no keystroke here means; the host's, the bracket alone)
  const callout = /^\[![^\]\n]*\]/;
  if (prose && ctx.doc.config.flavor === 'obsidian' && node.parent?.kind === 'quote' && node.index === 0 && callout.test(paired.text) && !callout.test(s)) return null;
  return ctx.apply(ctx.draft().setText(node, paired.withMarks({ auto: [...paired.marks.auto, ...[...close].map((_, k) => offset + 1 + k)] })).setCaret(node, offset + 1, -1));
}

/**
 * A bracket `autoClose` lists on a blank line, where no text is yet (an empty note, a gap): typed as a
 * host types it, with its closer, ours, the caret between. Null elsewhere. Not `$`: `$$` alone on a line
 * opens a block.
 */
function bracketOnBlankLine(ctx: CommandContext, typed: string): OurusResult | null {
  const { zone } = ctx.from;
  const closer = BRACKETS[typed];
  if (!ctx.collapsed || (zone !== 'gap' && zone !== 'none') || !closer || typed === '$' || !closes(ctx, typed as AutoCloseOpener)) return null;
  const head = ctx.selection.head;
  const line = ctx.doc.lineAt(head);
  if (trimMd(ctx.doc.text.slice(line.from, line.to)) !== '') return null;
  const paired = typed + closer;
  const after = (offsets: readonly number[]): number[] => offsets.map((pos) => (pos < head ? pos : pos + paired.length));
  const changes = [{ from: head, to: head, insert: paired }];
  const marks = { placeholders: after(ctx.doc.marks.placeholders), auto: [...after(ctx.doc.marks.auto), head + 1] };
  const caret = head + 1;
  return new OurusSuccess({ view: ctx.view.update({ changes, caret, marks }), changes });
}

/**
 * A character typed in an empty `$` pair of ours whose opener a backslash of ours keeps from opening a
 * math block (`- \\$┃$`): with something in it the pair is inline math, which needs no backslash. Null
 * elsewhere.
 */
function typedInEscapedPair(ctx: CommandContext, typed: string): OurusResult | null {
  const at = ctx.from;
  if (!ctx.collapsed || at.zone !== 'text' || !(at.text instanceof OurusProse) || typed === '$' || trimMd(typed) === '') return null;
  const { node, text, offset } = at;
  const ours = text.text.slice(offset - 2, offset + 1) === '\\$$' && text.marks.hasAutoAt(offset - 2) && text.marks.hasAutoAt(offset);
  if (!ours) return null;
  const filled = text.splice(offset, offset, typed).splice(offset - 2, offset - 1);
  return ctx.apply(ctx.draft().setText(node, filled).setCaret(node, offset - 1 + typed.length, -1));
}

/**
 * A bracket opener `autoClose` lists, over a selection in a text that pairs (`pairPlace`: prose, a
 * quote atom's, code's, as an editor's closeBrackets has it there too): the selection between it and
 * its closer, ours, and still selected. Null where it can't: across texts, from or to markup, `$` in
 * what isn't prose.
 */
function wrapInBrackets(ctx: CommandContext, opener: string): OurusResult | null {
  const [a, b] = [ctx.from, ctx.to];
  const place = pairPlace(ctx, a);
  if (!place || a.zone !== 'text' || b.zone !== 'text' || a.node.persistentNode !== b.node.persistentNode || (!place.prose && opener === '$')) return null;
  const from = Math.min(a.offset, b.offset);
  const to = Math.max(a.offset, b.offset);
  if (place.markup(from) || place.markup(to)) return null;
  const text = place.text;
  const spliced = text.splice(to, to, BRACKETS[opener]!).splice(from, from, opener);
  const wrapped = spliced.withMarks({ auto: [...spliced.marks.auto, to + 1] });
  const forward = ctx.selection.anchor <= ctx.selection.head;
  const [start, end] = [{ ref: a.node, offset: from + 1, assoc: 1 as const }, { ref: a.node, offset: to + 1, assoc: -1 as const }];
  return ctx.apply(ctx.draft().setText(a.node, wrapped).select(forward ? start : end, forward ? end : start));
}

/**
 * Typing on the blank line right after a line ending with a block id, which it would join, no block
 * id at its end then: on the line after a text whose string ends with one, at its column, a line of
 * the text, the block id at its end again (as Shift-Enter puts it); after a block-id line a text
 * carries, or a paragraph that is only one, a paragraph of its own, a blank line between. Null
 * elsewhere.
 */
function afterBlockIdLine(ctx: CommandContext, typed: string): OurusResult | null {
  if (!ctx.collapsed || ctx.from.zone !== 'gap' || /[\r\n]/.test(typed)) return null;
  const doc = ctx.doc;
  const head = ctx.selection.head;
  const line = doc.lineAt(head);
  const owner = line.index > 0 ? doc.nodeAtLine(line.index - 1) : null;
  if (!owner || owner.ownLastLine !== line.index - 1) return null;
  const ids = doc.blockIds().filter((b) => b.owner === owner && doc.lineAt(b.from).index === line.index - 1);
  if (!ids.length) return null;
  const text = doc.textOf(owner);
  const part = text instanceof OurusProse ? text.frame.find((p) => p.part === 'blockId') : undefined;
  // (a text with more than the block id: one that is only one, `- ^x`, has nothing to go on with)
  const more = text instanceof OurusProse && !!part && trimMd(text.text.slice(text.textStart(0), part.from)) !== '';
  if (part && more && !ids[0]!.carried && text instanceof OurusProse && doc.atTextColumn(head, owner) && !text.blockIdLines.length) {
    const id = text.text.slice(text.text.indexOf('^', part.from), part.to);
    // (the line typed on the text's now, the blank lines after it one fewer)
    return ctx.apply(ctx.draft().setText(owner, text.splice(part.from, part.to, `\n${typed} ${id}`)).gap(owner, Math.max(0, owner.gap - 1)).setCaret(owner, part.from + 1 + typed.length, -1));
  }
  // (a paragraph of its own: the line as written up to the caret, its prefix, again after a blank
  // line, the note's line ending)
  const lead = doc.text.slice(line.from, head);
  const insert = `${dominantEnding(doc.text)}${lead}${typed}`;
  const changes = [{ from: head, to: head, insert }];
  const caret = head + insert.length;
  return new OurusSuccess({ view: ctx.update({ changes, caret }), changes });
}

/**
 * Text typed or pasted at a caret, one line, where the host's insert would break what is there: right
 * before a block id (what is typed goes before it with a blank between, or the text would end in it, no
 * block id any more); on the blank line after one; at the end of a marker's line whose text starts
 * below it. Null where the host's insert is right.
 */
export function placedText(ctx: CommandContext, typed: string): OurusResult | null {
  // right before a block id with nothing before it (a text that is only one, `- ┃^x`): what is typed
  // goes before it with a blank between, or it would end in it, no block id any more
  const glued = gluedBlockId(ctx);
  if (glued && !/[ \t]$/.test(typed)) return ctx.apply(ctx.draft().setText(glued.node, glued.text.splice(glued.offset, glued.offset, `${typed} `) as OurusText).setCaret(glued.node, glued.offset + typed.length, -1));
  // on the blank line right after one that ends with a block id, which what is typed would join
  const after = afterBlockIdLine(ctx, typed);
  if (after) return after;
  // at the end of a marker's line, an item's text starting below it (`-┃⏎  a`): on that line, after a
  // space, the text's first line (typed right after the marker, it would be no item: `-z`)
  const at = ctx.from;
  if (at.zone === 'frame' && at.offset === 0 && at.text instanceof OurusProse && at.text.frame[0]?.part === 'below' && trimMd(typed.slice(0, 1)) !== '') {
    return ctx.apply(ctx.draft().setText(at.node, at.text.splice(0, 0, typed) as OurusText).setCaret(at.node, typed.length, -1));
  }
  return null;
}

/**
 * The caret right at the `^` of a block id in a text's string (`- ┃^x`, `p ┃^x`, `a⏎┃^x`, a quote
 * atom's `> ┃^x`), where what is typed would end in it: the text, and where.
 */
function gluedBlockId(ctx: CommandContext): { node: OurusNode; text: OurusText; offset: number } | null {
  const at = ctx.from;
  if ((at.zone !== 'text' && at.zone !== 'frame') || (at.zone === 'frame' && at.part !== 'blockId')) return null;
  const glued = blockIdsOf(at.text).some((b) => !b.carried && b.from === at.offset);
  return glued ? { node: at.node, text: at.text, offset: at.offset } : null;
}

/**
 * Several characters typed at once (a text replacement's), a fence's among them: played a character
 * at a time, as keys type them, the host's typing each other one; one edit. The host's where it types
 * them all.
 */
function typedOneByOne(ctx: CommandContext, typed: string): OurusResult | null {
  // (each character on the last's view, the view carried through each)
  let view = ctx.view;
  let changes: readonly ChangeSpec[] = [];
  let ours = false;
  for (const char of typed) {
    const result = insertTextCommand(new CommandContext(view), char);
    if (!result) return null;
    if (result instanceof OurusRejected) return result;
    const head = view.selection.head;
    const step: readonly ChangeSpec[] = result instanceof OurusSuccess ? result.changes : [{ from: head, to: head, insert: char }];
    if (result instanceof OurusSuccess) {
      ours = true;
      view = result.view;
    } else {
      view = view.update({ changes: step }).withSelection(head + char.length);
    }
    changes = composeChanges(ctx.doc.text, changes, step);
  }
  if (!ours) return new OurusDeferred();
  return new OurusSuccess({ view, changes });
}

/** Where a backtick may pair: next to nothing, a space or a tab, or the punctuation that opens (`before`) or closes (`after`) a phrase. */
const atBoundary = (c: string, punctuation: string): boolean => c === '' || c === ' ' || c === '\t' || punctuation.includes(c);

/** Whether the caret is between the two backticks of an empty pair in a text (`` `┃` ``). */
function inEmptyPair(ctx: CommandContext): boolean {
  const at = ctx.from;
  return at.zone === 'text' && at.text instanceof OurusProse && emptyPairAt(ctx, at.text.text, at.offset);
}

/**
 * Whether `offset` in text `s`, the caret, is between the two backticks of an empty pair: two alone,
 * the first not escaped (`\``), and no code's (`` ```x `┃` y``` ``).
 */
function emptyPairAt(ctx: CommandContext, s: string, offset: number): boolean {
  if (s[offset - 1] !== '`' || s[offset] !== '`' || s[offset - 2] === '`' || s[offset + 1] === '`') return false;
  let slashes = 0;
  while (s[offset - 2 - slashes] === '\\') slashes++;
  return slashes % 2 === 0 && !ctx.doc.verbatimSpanAt(ctx.selection.head);
}

/**
 * A backtick `autoClose` lists, in text: right before the closing backtick of an empty pair, or
 * before any of the closing run of the code span the caret is in, it steps over it; at a word boundary
 * outside code, it is typed as a pair, the caret between; anywhere else, the host's.
 */
function inlinePair(ctx: CommandContext): OurusResult | null {
  const at = ctx.from;
  if (at.zone !== 'text' || !(at.text instanceof OurusProse)) return new OurusDeferred();
  const { node, text, offset } = at;
  const s = text.text;
  const pos = ctx.selection.head;
  const lineFrom = s.lastIndexOf('\n', offset - 1) + 1;
  const lineTo = s.indexOf('\n', offset) < 0 ? s.length : s.indexOf('\n', offset);
  if (offset < text.textStart(lineOf(s, offset))) return new OurusDeferred();
  const before = offset > lineFrom ? s[offset - 1]! : '';
  const after = offset < lineTo ? s[offset]! : '';
  const span = ctx.doc.codeSpanAt(pos);
  const emptyPair = emptyPairAt(ctx, s, offset);
  const draft = ctx.draft();
  if (after === '`' && (span ? pos >= span.closer && pos < span.to : emptyPair)) return ctx.apply(draft.setText(node, typedOver(text, offset)).setCaret(node, offset + 1, 1));
  // (in math or a comment, verbatim as code is: the host's)
  if (span || ctx.doc.verbatimSpanAt(pos) || !atBoundary(before, '([{<\'"') || !atBoundary(after, ')]}>,.;:!?\'"')) return new OurusDeferred();
  // (the closing backtick ours: Backspace in the empty pair takes both)
  const paired = text.splice(offset, offset, '``');
  return ctx.apply(draft.setText(node, paired.withMarks({ auto: [...paired.marks.auto, offset + 1] })).setCaret(node, offset + 1, -1));
}

/**
 * Backspace between the two halves of an empty pair in a text, of an opener `autoClose` lists, whoever
 * typed it (as an editor's closeBrackets has it, and every app that pairs: Auto10, Auto18): both go
 * (Backtick20; a bracket's, `[[┃]]` one level; a delimiter's, `$$┃$$`, its last character with the
 * closer, `$┃`). Null anywhere else: the host's.
 */
export function deleteEmptyPair(ctx: CommandContext, place: PairPlace, offset: number): OurusResult | null {
  const { node, text, prose } = place;
  const s = text.text;
  // (with `$` listed, `$$┃$$` is a level of `$`'s, as a bracket's double: `$┃$`)
  const open = s[offset - 1]!;
  if (prose && open === '$' && s[offset] === '$' && closes(ctx, '$') && !place.markup(offset - 1)) return ctx.apply(ctx.draft().setText(node, text.splice(offset - 1, offset + 1)).setCaret(node, offset - 1, -1));
  // a delimiter's (`$$┃$$`): its last character and the closer, as the keystroke typed them
  // (one the flavor reads: elsewhere its characters are text, typed one at a time, as `delimiterTyped` has it)
  for (const { opener, closer, extension } of prose ? DELIMITERS : []) {
    if (!closes(ctx, opener) || (extension && !ctx.doc.mdTree.flavor.has(extension)) || s.slice(offset - opener.length, offset) !== opener || s.slice(offset, offset + closer.length) !== closer) continue;
    return ctx.apply(ctx.draft().setText(node, text.splice(offset - 1, offset + closer.length)).setCaret(node, offset - 1, -1));
  }
  // (a bracket's where its single is listed: with the double alone, WorkFlowy's, Backspace takes one)
  const listed = s[offset] === '`' ? prose && closes(ctx, '`') && emptyPairAt(ctx, s, offset) : BRACKETS[open] === s[offset] && open !== '$' && closes(ctx, open as AutoCloseOpener);
  // (in what isn't prose, a pair ours alone: there the author's brackets are characters)
  if (!listed || (!prose && !text.marks.hasAutoAt(offset))) return null;
  if (place.markup(offset - 1)) return null;
  return ctx.apply(ctx.draft().setText(node, text.splice(offset - 1, offset + 1)).setCaret(node, offset - 1, -1));
}


/**
 * A backtick `autoClose` lists, over a selection in one line of a node's text: the selection
 * becomes code, with a run longer than any inside it on each side (and a space inside where it starts
 * or ends with a backtick), and stays selected.
 */
function wrapInCode(ctx: CommandContext): OurusResult | null {
  const [a, b] = [ctx.from, ctx.to];
  if (a.zone !== 'text' || b.zone !== 'text' || !(a.text instanceof OurusProse) || a.node.persistentNode !== b.node.persistentNode) return new OurusDeferred();
  const text = a.text;
  if (a.offset < text.textStart(lineOf(text.text, a.offset))) return new OurusDeferred();
  const selected = text.text.slice(a.offset, b.offset);
  const fence = '`'.repeat((selected.match(/`+/g) ?? []).reduce((m, r) => Math.max(m, r.length), 0) + 1);
  // (a space each side where a backtick ends it, or where it starts and ends with a space, which a code
  // span would strip, one each side: ` b ` written `  b  `)
  const pad = selected.startsWith('`') || selected.endsWith('`') || (/^[ \n][^]*[ \n]$/.test(selected) && /[^ \n]/.test(selected)) ? ' ' : '';
  const open = fence + pad;
  const wrapped = text.splice(b.offset, b.offset, pad + fence).splice(a.offset, a.offset, open);
  const forward = ctx.selection.anchor <= ctx.selection.head;
  const [from, to] = [{ ref: a.node, offset: a.offset + open.length, assoc: 1 as const }, { ref: a.node, offset: b.offset + open.length, assoc: -1 as const }];
  return ctx.apply(ctx.draft().setText(a.node, wrapped).select(forward ? from : to, forward ? to : from));
}

/** Whether the selection takes part of a closed fenced block's run, but not the whole block. */
function overFence(ctx: CommandContext): boolean {
  const ends = [ctx.from, ctx.to] as const;
  return ends.some((at, k) => {
    if ((at.zone !== 'text' && at.zone !== 'frame') || !(at.text instanceof OurusAtom) || at.text.type !== 'fenced_code') return false;
    const runs = at.text.delimiters;
    if (!runs?.close) return false;
    // what of this block's text the selection takes: from its start, or to its end, where the other end is outside it
    const other = ends[1 - k]!;
    const same = (other.zone === 'text' || other.zone === 'frame') && other.node.persistentNode === at.node.persistentNode;
    const [from, to] = same ? [(ctx.from as { offset: number }).offset, (ctx.to as { offset: number }).offset] : k === 0 ? [at.offset, at.text.text.length] : [0, at.offset];
    // (the whole block, its fences with it, breaks none)
    if (from === 0 && to === at.text.text.length) return false;
    return [runs.open, runs.close].some((r) => from < r.to && to > r.from);
  });
}

/**
 * A backtick or a tilde in fenced code (rules 1–3 of backtick.md):
 * - in a run of its character, or at either end of it, the run grows, and the other fence with it, so
 *   the two match; an unclosed block's fence is the host's;
 * - elsewhere on a fence's line, the host's where the fence stays one, else refused where markup is
 *   decorated (a backtick in a backtick fence's info string, text after a closing fence), the host's
 *   where it is text;
 * - on a code line, the host's where it stays code; where it would close the block, right above the
 *   closing fence it is that fence typed again (the old one goes, the caret after it), elsewhere the
 *   fences grow past it (`done()`).
 */
function fenceCharInCode(ctx: CommandContext, at: CodeAt, char: string): OurusResult | null {
  const { node, text, offset } = at;
  const runs = text.delimiters;
  if (!runs) return new OurusDeferred();
  const s = text.text;
  const draft = ctx.draft();
  const lineFrom = s.lastIndexOf('\n', offset - 1) + 1;
  const lineTo = s.indexOf('\n', offset) < 0 ? s.length : s.indexOf('\n', offset);
  const onOpen = runs.open.from >= lineFrom && runs.open.from <= lineTo;
  const onClose = !!runs.close && runs.close.from >= lineFrom && runs.close.from <= lineTo;
  if (onOpen || onClose) {
    const run = onOpen ? runs.open : runs.close!;
    if (s[run.from] === char && offset >= run.from && offset <= run.to) {
      if (!runs.close) return new OurusDeferred('an unclosed block\'s fence: the host\'s');
      // (the other fence's character ours: the closing one's where the opening one was typed in, and back)
      const spliced = text.splice(runs.close.to, runs.close.to, char).splice(runs.open.to, runs.open.to, char);
      const grown = spliced.withMarks({ auto: [...spliced.marks.auto, onOpen ? runs.close.to + 1 : runs.open.to] });
      // where markup is decorated, not in the fence: from the closing one at the code's end, from inside
      // the opening one at its start (after it, the info string, is text)
      let caret = offset + (onOpen ? 1 : 2);
      if (ctx.config.markup === 'decorated' && (onClose || caret <= runs.open.to)) caret = onClose ? textEnd(grown) : textStart(grown);
      return ctx.apply(draft.setText(node, grown).setCaret(node, caret, -1));
    }
    // the host's where the fence stays one, closed as it was
    const spliced = text.splice(offset, offset, char);
    if (ctx.doc.readsAs(spliced) && spliced.closed === text.closed) return new OurusDeferred();
    return breaksFence(ctx, `a ${char === '`' ? 'backtick' : 'tilde'} here would break the fence`);
  }
  const typed = text.splice(offset, offset, char);
  if (ctx.doc.readsAs(typed) || !runs.close) return new OurusDeferred();
  // right above the closing fence: the fence typed again, which takes the old one's place
  if (s.lastIndexOf('\n') === lineTo) {
    const retyped = typed.splice(lineTo + 1, s.length + 1);
    const close = retyped.delimiters?.close;
    // the caret after it, but where markup is decorated: at the code's end
    if (close && ctx.doc.readsAs(retyped)) return ctx.apply(draft.setText(node, retyped).setCaret(node, ctx.config.markup === 'decorated' ? textEnd(retyped) : close.to, -1));
  }
  return ctx.apply(draft.setText(node, typed).setCaret(node, offset + 1, -1));
}

/**
 * A backtick or a tilde that makes its line of a paragraph's or an item's text open a fence (the
 * third at its start): a code block on that line, closed by a fence as long on the line below, so it
 * takes in nothing after it; the rest of the line its info string, the caret after the opening run.
 * The lines above stay the node's text; those below are a paragraph of their own, its children
 * following them (an item's: its first child, as the block is, where the item keeps text above it).
 * Where `autoClose` lists no fence of its character, the host's. Undefined where the line opens no fence.
 */
function openFence(ctx: CommandContext, char: string): OurusResult | null | undefined {
  const at = ctx.from;
  if (at.zone !== 'text' || !(at.text instanceof OurusProse) || at.text.type !== 'paragraph' || at.text.frame.length) return undefined;
  const { node, text, offset } = at;
  if (node.kind !== 'paragraph' && node.kind !== 'item') return undefined;
  const s = text.text;
  const lineFrom = s.lastIndexOf('\n', offset - 1) + 1;
  const lineTo = s.indexOf('\n', offset) < 0 ? s.length : s.indexOf('\n', offset);
  // a held space before the caret settles as the line becomes the block's: its space no part of it (one
  // at the caret is the place the character fills, the space after it text)
  const held = text.marks.placeholders.find((pos) => pos >= lineFrom && pos < offset && text.marks.hasHeldSpaceAt(pos));
  const before = held === undefined ? s.slice(lineFrom, offset) : s.slice(lineFrom, held) + s.slice(held + 1, offset);
  const line = before + char + s.slice(offset, lineTo);
  // the line read as a fence's opening: the typed character in its run, closed by a run as long below it
  const run = new OurusAtom('fenced_code', false, line).delimiters?.open;
  if (!run || line[run.from] !== char || before.length > run.to - 1) return undefined;
  // (the closing fence ours, every character of its run)
  const closing = line.slice(run.from, run.to);
  const code = new OurusAtom('fenced_code', node.kind === 'item' && lineFrom === 0, MarkSet.of(`${line}\n${closing}`, { auto: [...closing].map((_, k) => line.length + 1 + k) }));
  if (!ctx.doc.readsAs(code)) return undefined;
  if (!closes(ctx, char === '`' ? '```' : '~~~')) return new OurusDeferred();
  return ctx.apply(lineToBlock(ctx, node, s, lineFrom, lineTo, code, run.to));
}

/**
 * `openFence` in a quote of one line read as a text (`> ``┃`, the default `quotes`): the quote a
 * container of the block, closed as anywhere else (spec/backtick.md: an open fence would swallow the
 * quote's lines below it); in an item whose text it is, the item's first block. Undefined where the
 * line opens none, or the quote has more lines (not done yet: the host's).
 */
function openFenceInQuote(ctx: CommandContext, char: string): OurusResult | null | undefined {
  const at = ctx.from;
  if (at.zone !== 'text' || !(at.text instanceof OurusProse) || at.text.type !== 'quote') return undefined;
  const { node, text, offset } = at;
  const prefix = text.frame[0];
  if (node.kind !== 'paragraph' && node.kind !== 'item') return undefined;
  if (text.frame.length !== 1 || prefix?.part !== 'quote' || prefix.from !== 0 || text.text.includes('\n') || text.blockIdLines.length || offset < prefix.to) return undefined;
  const s = text.text;
  const before = s.slice(prefix.to, offset);
  const line = before + char + s.slice(offset);
  const run = new OurusAtom('fenced_code', false, line).delimiters?.open;
  if (!run || line[run.from] !== char || before.length > run.to - 1) return undefined;
  const closing = line.slice(run.from, run.to);
  const code = new OurusAtom('fenced_code', false, MarkSet.of(`${line}\n${closing}`, { auto: [...closing].map((_, k) => line.length + 1 + k) }));
  if (!closes(ctx, char === '`' ? '```' : '~~~')) return new OurusDeferred();
  const draft = ctx.draft();
  const block = draft.create('atom', code);
  const quote = draft.create('quote', null);
  draft.append(quote, 'first', [block]);
  if (node.kind === 'paragraph') {
    // (a paragraph's list after it, out of the quote)
    if (node.children.length) draft.remove(node.children).place('after', node, node.children);
    draft.place('before', node, [quote]).gap(block, node.gap).remove([node]);
  } else {
    draft.setText(node, null).append(node, 'first', [quote]);
    // (the blank lines after the item's text, after the block now, where it is the item's last)
    if (!node.children.length) draft.gap(block, node.gap).gap(node, 0);
  }
  return ctx.apply(draft.setCaret(block, run.to, -1));
}

/**
 * Line `[lineFrom, lineTo)` of `node`'s text `s` made a block of lines (`atom`, the caret at `caret`
 * in it): the lines above stay the node's text, the block after them; the lines below a paragraph of
 * their own, its children following them (an item's: its first child, as the block is, where the item
 * keeps text above it). A paragraph's list, where no lines below took it, goes after the block.
 */
export function lineToBlock(ctx: CommandContext, node: OurusNode, s: string, lineFrom: number, lineTo: number, atom: OurusAtom, caret: number): OurusDraft {
  const draft = ctx.draft();
  const container = node.kind === 'item';
  // the lines below, a paragraph of their own
  if (lineTo < s.length) draft.split(node, lineTo, { to: lineTo + 1, kind: 'paragraph', children: container ? 'stay' : 'follow', into: container ? 'child' : 'sibling' });
  let block: OurusNode | number = node;
  const last = lineTo >= s.length;
  if (lineFrom > 0) {
    // the lines above stay the node's text, the block after them
    const [, rest] = draft.split(node, lineFrom - 1, { to: lineFrom, kind: 'paragraph', children: !container && last ? 'follow' : 'stay', into: container ? 'child' : 'sibling' });
    block = rest;
  }
  if (block !== node || node.kind !== 'item') draft.convert(block, 'atom');
  // (an atom holds no children)
  if (!container && last && node.children.length) draft.remove(node.children).place('after', block, node.children);
  return draft.setText(block, atom).setCaret(block, caret, -1);
}

/** The delimiters `autoClose` types as a pair on the caret's line, each with its closer, the extension of the flavor that reads it (none: every flavor), and the block it makes spread over lines. */
const DELIMITERS: readonly { readonly opener: AutoCloseOpener; readonly closer: string; readonly extension?: string; readonly block: string; readonly lineBlock?: true }[] = [
  { opener: '$$', closer: '$$', extension: 'mathBlocks', block: 'math_block' },
  { opener: '%%', closer: '%%', extension: 'commentBlocks', block: 'comment_block' },
  // (on a line alone a block even closed on it, as HTML is: `<!--┃-->` at a line's start)
  { opener: '<!--', closer: '-->', block: 'html_block', lineBlock: true },
];

/**
 * A delimiter's last character typed (`autoClose`: `$$`, `%%`, `<!--`) where the next character is a
 * blank or the line's end, outside code, not escaped, in the flavor that reads it: its closer typed
 * with it, on the line, ours, the caret between; a closer's character typed before one of ours steps
 * over it. Null elsewhere.
 */
function delimiterTyped(ctx: CommandContext, typed: string): OurusResult | null {
  const at = ctx.from;
  if (at.zone !== 'text' || !(at.text instanceof OurusProse)) return null;
  const { node, text, offset } = at;
  const s = text.text;
  if ('$%->'.includes(typed) && s[offset] === typed && text.marks.hasAutoAt(offset)) return ctx.apply(ctx.draft().setText(node, typedOver(text, offset)).setCaret(node, offset + 1, 1));
  for (const { opener, closer, extension, block, lineBlock } of DELIMITERS) {
    if (typed !== opener.at(-1) || !closes(ctx, opener) || (extension && !ctx.doc.mdTree.flavor.has(extension))) continue;
    const from = offset - opener.length + 1;
    // (the rest of it typed before, no longer run of it: `$$$`)
    if (from < text.textStart(lineOf(s, offset)) || s.slice(from, offset) !== opener.slice(0, -1) || s[from - 1] === opener[0]) continue;
    const after = s[offset];
    if (after !== undefined && after !== '\n' && after !== ' ' && after !== '\t') continue;
    let slashes = 0;
    while (s[from - 1 - slashes] === '\\') slashes++;
    if (slashes % 2 || ctx.doc.verbatimSpanAt(ctx.selection.head)) continue;
    // a line alone that is a block, its first: the line that block, as a fence typed makes one
    const lineFrom = s.lastIndexOf('\n', offset - 1) + 1;
    const lineTo = s.indexOf('\n', offset) < 0 ? s.length : s.indexOf('\n', offset);
    if (lineBlock && from === lineFrom && lineTo === offset && text.type === 'paragraph' && !text.frame.length && (node.kind === 'paragraph' || node.kind === 'item')) {
      const atom = new OurusAtom(block, node.kind === 'item' && lineFrom === 0, MarkSet.of(opener + closer, { auto: [...closer].map((_, k) => opener.length + k) }));
      if (!ctx.doc.readsAs(atom)) continue;
      return ctx.apply(lineToBlock(ctx, node, s, lineFrom, lineTo, atom, opener.length));
    }
    const paired = text.splice(offset, offset, typed + closer);
    return ctx.apply(ctx.draft().setText(node, paired.withMarks({ auto: [...paired.marks.auto, ...[...closer].map((_, k) => offset + 1 + k)] })).setCaret(node, offset + 1, -1));
  }
  return null;
}

/**
 * Enter between an empty pair of a delimiter ours (`$$┃$$`, `%%┃%%`, `<!--┃-->`), alone on its line
 * of a paragraph's or an item's text: the pair spread over lines, a block, the caret on its empty line
 * (as an editor spreads a pair of brackets). Null elsewhere.
 */
export function enterInPair(ctx: CommandContext): OurusResult | null {
  const at = ctx.from;
  if (!ctx.collapsed || at.zone !== 'text') return null;
  // a block that is the pair alone (`<!--┃-->`): its lines spread
  if (at.text instanceof OurusAtom) {
    const { node, text, offset } = at;
    for (const { opener, closer, block } of DELIMITERS) {
      if (text.type !== block || text.text !== opener + closer || offset !== opener.length) continue;
      if (![...closer].every((_, k) => text.marks.hasAutoAt(offset + k))) return null;
      const spread = new OurusAtom(block, text.item, MarkSet.of(`${opener}\n\n${closer}`, { auto: [...closer].map((_, k) => opener.length + 2 + k) }), text.blockIdLines);
      return ctx.doc.readsAs(spread) ? ctx.apply(ctx.draft().setText(node, spread).setCaret(node, opener.length + 1, -1)) : null;
    }
    return null;
  }
  if (!(at.text instanceof OurusProse) || at.text.type !== 'paragraph' || at.text.frame.length) return null;
  const { node, text, offset } = at;
  if (node.kind !== 'paragraph' && node.kind !== 'item') return null;
  const s = text.text;
  const lineFrom = s.lastIndexOf('\n', offset - 1) + 1;
  const lineTo = s.indexOf('\n', offset) < 0 ? s.length : s.indexOf('\n', offset);
  for (const { opener, closer, block } of DELIMITERS) {
    if (s.slice(lineFrom, offset) !== opener || s.slice(offset, lineTo) !== closer) continue;
    if (![...closer].every((_, k) => text.marks.hasAutoAt(offset + k))) continue;
    const lines = `${opener}\n\n${closer}`;
    const atom = new OurusAtom(block, node.kind === 'item' && lineFrom === 0, MarkSet.of(lines, { auto: [...closer].map((_, k) => opener.length + 2 + k) }));
    if (!ctx.doc.readsAs(atom)) return null;
    return ctx.apply(lineToBlock(ctx, node, s, lineFrom, lineTo, atom, opener.length + 1));
  }
  return null;
}
