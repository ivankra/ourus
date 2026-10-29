// Typing (spec/typing.md, spec/backtick.md): a character is the host's, but a
// backtick or a tilde where it opens, closes or changes a code fence. The command says what the text
// becomes; `done()` keeps a fence's runs past the code, or refuses what would unmake the block.

import { OurusProse, OurusAtom, type OurusNode } from '../doc/index.ts';
import { composeChanges, lineOf, type ChangeSpec } from '../text/index.ts';
import { CommandContext, deferToHost, type CommandOutcome } from './context.ts';
import { breaksFence, codeAt, editInCode, type CodeAt } from './code.ts';
import { textEnd, textStart } from './util.ts';

/**
 * Typed text (`insertText`), a key's worth: a backtick or a tilde on a fence, on a code line, or
 * making its line open a fence; with `closeBackticks: all`, a backtick in text pairs, steps over a
 * closing run, or wraps a selection in code; any other character the host's. Null where ourus
 * doesn't do it yet: several characters with a backtick over a selection, a fence's character in a
 * container's prefix or a marker.
 */
export function insertTextCommand(ctx: CommandContext, typed: string): CommandOutcome {
  const fenceChar = /[`~]/.test(typed);
  const code = codeAt(ctx);
  if (!ctx.collapsed) {
    // over part of a closed block's fence run, any character breaks the fence (rule 5)
    if (overFence(ctx)) return breaksFence(ctx, 'the fence would break');
    // over a selection in code, what it leaves may make a fence (`X```` → ```` ``` ````)
    if (code) return editInCode(ctx, code, code.offset, code.to, typed);
    // over a selection in one line of text, the host's but for a backtick wrapping it in code
    if (ctx.config.closeBackticks !== 'all' || !typed.includes('`') || ctx.doc.lineAt(ctx.selection.anchor).index !== ctx.doc.lineAt(ctx.selection.head).index) return deferToHost();
    return typed === '`' ? wrapInCode(ctx) : null;
  }
  if ([...typed].length > 1 && fenceChar) return typedOneByOne(ctx, typed);
  // in code, the host's where it keeps the block (a line break in a container's code is ourus's, the
  // containers' prefix with it), a fence's character a fence's
  if (code && (!fenceChar || code.text.type !== 'fenced_code')) return editInCode(ctx, code, code.offset, code.offset, typed);
  if (typed !== '`' && typed !== '~') return deferToHost();
  // in a container's prefix or a marker (before a fence's indentation): not done yet
  if (ctx.from.zone === 'prefix' || ctx.from.zone === 'marker') return null;
  if (code) return fenceCharInCode(ctx, code, typed);
  // (`closeBackticks: all`, inside an empty pair: the backtick steps over its closing one, before it
  // could make a fence of the two and itself)
  if (ctx.config.closeBackticks === 'all' && typed === '`' && inEmptyPair(ctx)) return inlinePair(ctx);
  const opened = openFence(ctx, typed);
  if (opened !== undefined) return opened;
  return ctx.config.closeBackticks === 'all' && typed === '`' ? inlinePair(ctx) : deferToHost();
}

/**
 * Several characters typed at once (a text replacement's), a fence's among them: played a character
 * at a time, as keys type them, the host's typing each other one; one edit. The host's where it types
 * them all.
 */
function typedOneByOne(ctx: CommandContext, typed: string): CommandOutcome {
  let doc = ctx.doc;
  let selection = ctx.selection;
  let changes: readonly ChangeSpec[] = [];
  let ours = false;
  for (const char of typed) {
    const next = new CommandContext(doc, selection);
    const result = insertTextCommand(next, char);
    if (!result) return null;
    if (result.status === 'rejected') return result;
    const step: readonly ChangeSpec[] = result.status === 'applied' ? result.changes : [{ from: selection.head, to: selection.head, insert: char }];
    if (result.status === 'applied') {
      ours = true;
      doc = result.doc;
      selection = result.selection;
    } else {
      doc = doc.update({ changes: step });
      selection = { anchor: selection.head + char.length, head: selection.head + char.length };
    }
    changes = composeChanges(ctx.doc.text, changes, step);
  }
  if (!ours) return deferToHost();
  return { status: 'applied', doc, changes, selection };
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
  return slashes % 2 === 0 && !ctx.doc.codeSpanAt(ctx.selection.head);
}

/**
 * `closeBackticks: all`, a backtick in text: right before the closing backtick of an empty pair, or
 * before any of the closing run of the code span the caret is in, it steps over it; at a word boundary
 * outside code, it is typed as a pair, the caret between; anywhere else, the host's.
 */
function inlinePair(ctx: CommandContext): CommandOutcome {
  const at = ctx.from;
  if (at.zone !== 'text' || !(at.text instanceof OurusProse)) return deferToHost();
  const { node, text, offset } = at;
  const s = text.text;
  const pos = ctx.selection.head;
  const lineFrom = s.lastIndexOf('\n', offset - 1) + 1;
  const lineTo = s.indexOf('\n', offset) < 0 ? s.length : s.indexOf('\n', offset);
  if (offset < text.textStart(lineOf(s, offset))) return deferToHost();
  const before = offset > lineFrom ? s[offset - 1]! : '';
  const after = offset < lineTo ? s[offset]! : '';
  const span = ctx.doc.codeSpanAt(pos);
  const emptyPair = emptyPairAt(ctx, s, offset);
  const draft = ctx.draft();
  if (after === '`' && (span ? pos >= span.closer && pos < span.to : emptyPair)) return ctx.apply(draft.setCaret(node, offset + 1, 1));
  if (span || !atBoundary(before, '([{<\'"') || !atBoundary(after, ')]}>,.;:!?\'"')) return deferToHost();
  return ctx.apply(draft.setText(node, text.splice(offset, offset, '``')).setCaret(node, offset + 1, -1));
}

/**
 * `closeBackticks: all`, Backspace between the two backticks of an empty pair in a text: both go, as
 * they came (Backtick20). Null anywhere else.
 */
export function deleteEmptyPair(ctx: CommandContext, node: OurusNode, text: OurusProse, offset: number): CommandOutcome {
  const s = text.text;
  if (ctx.config.closeBackticks !== 'all' || !emptyPairAt(ctx, s, offset)) return null;
  if (offset - 1 < text.textStart(lineOf(s, offset))) return null;
  return ctx.apply(ctx.draft().setText(node, text.splice(offset - 1, offset + 1)).setCaret(node, offset - 1, -1));
}


/**
 * `closeBackticks: all`, a backtick over a selection in one line of a node's text: the selection
 * becomes code, with a run longer than any inside it on each side (and a space inside where it starts
 * or ends with a backtick), and stays selected.
 */
function wrapInCode(ctx: CommandContext): CommandOutcome {
  const [a, b] = [ctx.from, ctx.to];
  if (a.zone !== 'text' || b.zone !== 'text' || !(a.text instanceof OurusProse) || a.node.persistentNode !== b.node.persistentNode) return deferToHost();
  const text = a.text;
  if (a.offset < text.textStart(lineOf(text.text, a.offset))) return deferToHost();
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
function fenceCharInCode(ctx: CommandContext, at: CodeAt, char: string): CommandOutcome {
  const { node, text, offset } = at;
  const runs = text.delimiters;
  if (!runs) return deferToHost();
  const s = text.text;
  const draft = ctx.draft();
  const lineFrom = s.lastIndexOf('\n', offset - 1) + 1;
  const lineTo = s.indexOf('\n', offset) < 0 ? s.length : s.indexOf('\n', offset);
  const onOpen = runs.open.from >= lineFrom && runs.open.from <= lineTo;
  const onClose = !!runs.close && runs.close.from >= lineFrom && runs.close.from <= lineTo;
  if (onOpen || onClose) {
    const run = onOpen ? runs.open : runs.close!;
    if (s[run.from] === char && offset >= run.from && offset <= run.to) {
      if (!runs.close) return deferToHost('an unclosed block\'s fence: the host\'s');
      const grown = text.splice(runs.close.to, runs.close.to, char).splice(runs.open.to, runs.open.to, char);
      // where markup is decorated, not in the fence: from the closing one at the code's end, from inside
      // the opening one at its start (after it, the info string, is text)
      let caret = offset + (onOpen ? 1 : 2);
      if (ctx.config.markup === 'decorated' && (onClose || caret <= runs.open.to)) caret = onClose ? textEnd(grown) : textStart(grown);
      return ctx.apply(draft.setText(node, grown).setCaret(node, caret, -1));
    }
    // the host's where the fence stays one, closed as it was
    const spliced = text.splice(offset, offset, char);
    if (ctx.doc.readsAs(spliced) && spliced.closed === text.closed) return deferToHost();
    return breaksFence(ctx, `a ${char === '`' ? 'backtick' : 'tilde'} here would break the fence`);
  }
  const typed = text.splice(offset, offset, char);
  if (ctx.doc.readsAs(typed) || !runs.close) return deferToHost();
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
 * With `closeBackticks: none`, the host's. Undefined where the line opens no fence.
 */
function openFence(ctx: CommandContext, char: string): CommandOutcome | undefined {
  const at = ctx.from;
  if (at.zone !== 'text' || !(at.text instanceof OurusProse) || at.text.type !== 'paragraph' || at.text.frame.length) return undefined;
  const { node, text, offset } = at;
  if (node.kind !== 'paragraph' && node.kind !== 'item') return undefined;
  // a held space keeps its line from reading as a fence: not done yet
  const s = text.text;
  const lineFrom = s.lastIndexOf('\n', offset - 1) + 1;
  const lineTo = s.indexOf('\n', offset) < 0 ? s.length : s.indexOf('\n', offset);
  const line = s.slice(lineFrom, offset) + char + s.slice(offset, lineTo);
  // the line read as a fence's opening: the typed character in its run, closed by a run as long below it
  const run = new OurusAtom('fenced_code', false, line).delimiters?.open;
  if (!run || line[run.from] !== char || offset - lineFrom > run.to - 1) return undefined;
  const code = new OurusAtom('fenced_code', node.kind === 'item' && lineFrom === 0, `${line}\n${line.slice(run.from, run.to)}`);
  if (!ctx.doc.readsAs(code)) return undefined;
  if (ctx.config.closeBackticks === 'none') return deferToHost();
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
  // a paragraph's list, where no lines below took it, after the block: an atom holds no children
  if (!container && last && node.children.length) draft.remove(node.children).place('after', block, node.children);
  draft.setText(block, code).setCaret(block, run.to, -1);
  return ctx.apply(draft);
}
