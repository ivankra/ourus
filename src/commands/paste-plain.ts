// Plain paste (spec/paste-plain.md): the clipboard's text into the text of the node
// at the caret, its line breaks as Shift-Enter's, a blank line a paragraph break. The command says what
// the text becomes; `done()` escapes each line where it would read as a block, holds an empty line, and
// sets the paragraphs apart.

import { ProseText, AtomText, type OutlineNode, type OutlineNodeText } from '../doc/index.ts';
import { composeChanges, heldSpaceAt, isSpaceOrTab, trimMd, type ChangeSpec } from '../text/index.ts';
import { clipboardFragment } from './clipboard.ts';
import { CommandContext, deferToHost, reject, type CommandOutcome } from './context.ts';
import { linesInQuote, quoteAtomAt } from './quote.ts';
import { enterCommand } from './enter.ts';
import { pasteMarkdown } from './paste.ts';
import { textActedOnAt } from './util.ts';
import { codeAt, onDelimiterLine } from './code.ts';
import { afterDeleting } from './copy.ts';

/**
 * Plain paste (`pastePlainLines: text`): on a code line the lines are code, at the fence's indentation
 * (rule 1); a node holding one line refuses several (rule 3); on an empty item the text is its text
 * (rule 4); else the first line joins the text before the caret, each line break Shift-Enter's, a
 * blank line a paragraph break, a paragraph's first line without its leading spaces (rule 5). One
 * line, or the caret outside a node's text, the host's (rule 6). Null (unsupported) where ourus doesn't do it yet: the
 * other `pastePlainLines`, a clipboard starting with a line break (rule 2), a selection across lines,
 * held spaces.
 */
export function pastePlainCommand(ctx: CommandContext, clipboard: string): CommandOutcome {
  if (ctx.config.pastePlainLines === 'host') return deferToHost('plain paste is the host\'s');
  if (ctx.config.pastePlainLines === 'items') return itemLines(ctx, clipboard);
  if (ctx.config.pastePlainLines === 'enter') return enteredLines(ctx, clipboard);
  return plainLines(ctx, clipboard);
}

/**
 * `pastePlainLines: items`: each line a node, placed as paste places nodes; list items where every
 * line is one (PastePlain33), else each line's text, escaped where it would read as markup (PastePlain32).
 */
function itemLines(ctx: CommandContext, clipboard: string): CommandOutcome {
  const lines = clipboard.split(/\r\n|\r|\n/).filter((l) => trimMd(l) !== '');
  // (a line without a line break is inline text, as with every value; line breaks alone, plain's
  // refusal; in code, lines are code, as plain paste puts them)
  if (!lines.length || !/[\r\n]/.test(clipboard) || codeAt(ctx)) return plainLines(ctx, clipboard);
  const fragment = clipboardFragment(lines.join('\n'), ctx.config);
  if (fragment?.doc.rootNode.children.every((r) => r.kind === 'item') && fragment.doc.rootNode.children.length === lines.length) return pasteMarkdown(ctx, { markdown: lines.join('\n') + '\n', phrase: false }, true);
  const escaped: string[] = [];
  for (const line of lines) {
    const text = line.trim();
    const written = ctx.doc.escapeParagraph([text]);
    if (!written) return reject('not-expressible', `no escape keeps "${text}" text`);
    escaped.push(written[0]!);
  }
  // (each line a node: the clipboard has a line break, which ends the last as the others)
  return pasteMarkdown(ctx, { markdown: escaped.join('\n\n') + '\n', phrase: false }, true);
}

/**
 * `pastePlainLines: enter`: the text typed, each line break an Enter: the first line at the caret,
 * the text splitting at each break, the last line the text after the caret's (PastePlain31).
 */
function enteredLines(ctx: CommandContext, clipboard: string): CommandOutcome {
  if (!ctx.collapsed) return afterDeleting(ctx, (next) => enteredLines(next, clipboard));
  const lines = clipboard.split(/\r\n|\r|\n/);
  let next: CommandContext = ctx;
  let changes: readonly ChangeSpec[] = [];
  let result: CommandOutcome = null;
  for (const [k, line] of lines.entries()) {
    const at = line ? textActedOnAt(next, next.selection.head) : null;
    if (line && !at) return k === 0 ? deferToHost('the caret is outside a text') : null;
    // (at the text's start, without the spaces it starts with, which would be padding there)
    const typed = at && trimMd(at.text.text.slice(at.text.textStart(0), at.offset)) === '' ? line.replace(/^[ \t]+/, '') : line;
    if (at && typed) {
      result = next.apply(next.draft().setText(at.node, at.text.splice(at.offset, at.offset, typed)).setCaret(at.node, at.offset + typed.length, -1));
      if (!result || result.status !== 'applied') return result;
      changes = composeChanges(ctx.doc.text, changes, result.changes);
      next = new CommandContext(result.doc, result.selection);
    }
    if (k === lines.length - 1) break;
    result = enterCommand(next, false);
    if (!result || result.status !== 'applied') return result;
    changes = composeChanges(ctx.doc.text, changes, result.changes);
    next = new CommandContext(result.doc, result.selection);
  }
  return result && result.status === 'applied' ? { ...result, changes } : result;
}

/** The lines into the text at the caret (`pastePlainLines: text`, and paste's plain lines). */
export function plainLines(ctx: CommandContext, clipboard: string): CommandOutcome {
  // in a quote read as an atom, over a selection in it too: its lines each a line of it (`> `)
  const quote = quoteAtomAt(ctx);
  if (quote) {
    const lines = clipboard.split(/\r\n|\r|\n/);
    // before its `>`, the line breaks the clipboard starts with go, as at any text's start (PastePlain25);
    // with nothing else, refused (PastePlain27)
    if (quote.offset === 0 && lines[0] === '') {
      while (lines.length && lines[0] === '') lines.shift();
      if (lines.every((l) => trimMd(l) === '')) return reject('not-expressible', 'nothing but line breaks at the text\'s start');
    }
    return linesInQuote(ctx, quote, lines);
  }
  // over a selection across lines, it goes first, as a cut takes it (PastePlain17)
  if (ctx.doc.lineAt(ctx.selection.anchor).index !== ctx.doc.lineAt(ctx.selection.head).index) return afterDeleting(ctx, (next) => plainLines(next, clipboard));
  const lines = clipboard.split(/\r\n|\r|\n/);
  if (lines.length < 2) return deferToHost('one line: the host pastes it');
  const code = codeAt(ctx);
  // on a delimiter's line (an opening's info, a closing fence), no code line: the host's
  if (code && onDelimiterLine(code.text, code.offset)) return deferToHost('a fence line: the host pastes');
  // in indented code's four columns, the host's
  if (code && code.text.frame.some((p) => p.part === 'indent' && p.from <= code.offset && code.offset < p.to)) return ctx.collapsed ? deferToHost('in the code\'s indentation') : reject('not-expressible', 'the selection takes part of the code\'s indentation');
  // (a line break first, before the block's text: the host's, as a new line above it)
  if (code && lines[0] === '' && code.offset === 0) return deferToHost('a line break before the block: the host pastes');
  if (code) {
    // in its block's text at its fence's indentation (its first line's)
    const indent = /^[ \t]*/.exec(code.text.text)![0];
    const pasted = lines.map((l, k) => (k === 0 || l === '' ? l : indent + l)).join('\n');
    const draft = ctx.draft().setText(code.node, code.text.splice(code.offset, code.to, pasted));
    return ctx.apply(draft.setCaret(code.node, code.offset + pasted.length, -1));
  }
  const [a, b] = [ctx.from, ctx.to];
  // on an empty item, past its marker or in its checkbox, where its text starts (before its marker, the host's);
  // in markup: where markup is text the user edits, the host's, else refused (a title holds one line,
  // a selection takes part of markup); at a line's very start, before it, the host's, but on a setext
  // underline, refused as Shift-Enter is there
  if (a.zone === 'frame' && a.text instanceof ProseText && !a.text.empty) {
    const inside = ctx.selection.head > ctx.doc.lineAt(ctx.selection.head).from;
    if (!inside && a.part !== 'underline') return deferToHost('the caret is before the text');
    if (inside && ctx.collapsed && ctx.config.markup === 'text') return deferToHost('the caret is in markup');
    return reject('not-expressible', a.text.heading ? 'the title holds one line' : 'the selection takes part of markup');
  }
  const at =
    (a.zone === 'marker' && a.part === 'padding') || (a.zone === 'frame' && a.text instanceof ProseText && a.text.empty) ? emptyTextAt(ctx, a.node)
    : a.zone === 'text' ? { node: a.node, text: a.text, offset: a.offset } : null;
  if (!at || !(at.text instanceof ProseText)) {
    // a table's row holds one line; another block's lines are the host's
    return a.zone === 'text' && at?.text instanceof AtomText && at.text.type === 'table' ? reject('not-expressible', 'a row holds one line') : deferToHost('the caret is outside a text');
  }
  const { node, text } = at;
  const from = at.offset;
  const to = ctx.collapsed ? from : b.zone === 'text' && b.node.persistentNode === node.persistentNode ? b.offset : -1;
  if (to < 0) return null;
  // line breaks the clipboard starts with, at the text's start, go: no line there is empty (PastePlain25);
  // with nothing else, refused (PastePlain27)
  if (lines[0] === '' && trimMd(text.text.slice(text.textStart(0), from)) === '') {
    while (lines.length && lines[0] === '') lines.shift();
    if (!lines.length || lines.every((l) => trimMd(l) === '')) return reject('not-expressible', 'nothing but line breaks at the text\'s start');
    if (lines.length === 1) return ctx.apply(ctx.draft().setText(node, text.splice(from, to, lines[0]!)).setCaret(node, from + lines[0]!.length, -1));
  }
  // a node holding one line: an ATX title, an Obsidian callout's
  if (text.heading?.form === 'atx' || (text.type === 'title' && ctx.config.flavor === 'obsidian')) return reject('not-expressible', 'the title holds one line');
  // the text with the paste in it; then each run of blank lines a paragraph break. A first line
  // starting the text loses its leading spaces, which would make it code
  const s0 = text.text;
  if (/^[ \t]*$/.test(s0.slice(text.textStart(0), from))) lines[0] = lines[0]!.replace(/^[ \t]+/, '');
  // before a held space, the space is text after what is pasted (PastePlain16)
  const held = heldSpaceAt(text.marks, text.text, from) && ctx.selection.head === ctx.doc.posOf(node, from, -1) && ctx.collapsed;
  // (in a quote's text a line of it `> ` too, but a blank line, which breaks it into two quotes; the
  // last one with the text's rest after it is none)
  const restOfLine = text.text.slice(to, text.text.indexOf('\n', to) < 0 ? text.text.length : text.text.indexOf('\n', to));
  const blank = (l: string, k: number): boolean => trimMd(l) === '' && (k < lines.length - 1 || trimMd(restOfLine) === '');
  const quoted = text.type === 'quote' ? lines.map((l, k) => (k === 0 || blank(l, k) ? l : `> ${l}`)) : lines;
  const pasted = quoted.join('\n') + (held ? ' ' : '');
  let current = text.splice(from, to, pasted);
  // (a setext title, which a blank line in it would end: an ATX one holds one line, above)
  if (text.type === 'heading' && /\n[ \t]*\n/.test(current.body)) return reject('not-expressible', 'a heading has no blank line in its title');
  let caret = from + pasted.length - (held ? 1 : 0);
  const draft = ctx.draft();
  let target: OutlineNode | number = node;
  const container = node.kind === 'item' || node.kind === 'quote';
  for (;;) {
    const s = current.text;
    // the first blank line inside what was pasted (not its first or last line)
    const m = /\n[ \t]*\n/.exec(s.slice(0, caret));
    if (!m || m.index + m[0].length > caret) break;
    let end = m.index + m[0].length;
    // more blank lines, one break; the next paragraph's first line without its leading spaces
    while (/^[ \t]*\n/.test(s.slice(end)) && end < caret) end += /^[ \t]*\n/.exec(s.slice(end))![0].length;
    let first = end;
    while (first < s.length && (s[first] === ' ' || s[first] === '\t')) first++;
    draft.setText(target, current);
    const [, rest] = draft.split(target, m.index, { to: first, kind: 'paragraph', children: container && target === node ? 'stay' : 'follow', into: container && target === node ? 'child' : 'sibling' });
    caret -= first;
    current = current.slice(first, s.length);
    target = rest;
  }
  // (ending with a line break: the caret before the spaces the new line starts with, as Shift-Enter's;
  // that line empty, and more of the text after it: two paragraphs, the caret on the blank line
  // between, as Shift-Enter makes them there)
  const after = current.text.indexOf('\n', caret);
  if (lines[lines.length - 1] === '' && caret > 0 && current.text[caret - 1] === '\n' && after >= 0 && trimMd(current.text.slice(caret, after)) === '') {
    let rest = after + 1;
    while (rest < current.text.length && isSpaceOrTab(current.text.charCodeAt(rest))) rest++;
    const into = container && target === node ? 'child' : 'sibling';
    draft.setText(target, current);
    draft.split(target, caret - 1, { to: rest, kind: 'paragraph', children: into === 'child' ? 'stay' : 'follow', into });
    return ctx.apply(draft.gap(target, 1).select({ blank: target, line: 0 }, { blank: target, line: 0 }));
  }
  // (a quote's first paragraph that would read as its callout's title)
  if (target === node && node.becomesTitle(current)) return reject('not-expressible', "the text would read as the quote's callout title");
  draft.setText(target, current).setCaret(target, caret, -1);
  return ctx.apply(draft);
}

/** An empty item's text, the caret where it starts (after its marker's space and a checkbox). */
function emptyTextAt(ctx: CommandContext, node: OutlineNode): { node: OutlineNode; text: OutlineNodeText | null; offset: number } | null {
  const text = ctx.doc.textOf(node);
  if (node.kind !== 'item' || !(text instanceof ProseText) || !text.empty) return null;
  return { node, text, offset: text.text.length };
}
