// Copy and cut (spec/copy.md): the selection's Markdown, written as the host's
// clipboard formats; a cut takes it out as Backspace or delete subtree would.

import { clipboardOf } from './clipboard.ts';
import { OurusProse, checkBlockIds, type OurusNode } from '../doc/index.ts';
import { deleteContentBackwardCommand } from './backspace.ts';
import { CommandContext, blockIdsDeclaredBy } from './context.ts';
import { composeChanges, lineOf, mapPos, trimMd } from '../text/index.ts';
import { deleteSubtreeCommand } from './delete-subtree.ts';
import { oneRun, operandsRefused, runsOf, selectionRoots } from './util.ts';
import type { OurusResult } from './types.ts';
import { OurusDeferred, OurusRejected, OurusSuccess } from './types.ts';

/**
 * Copy, or cut: what the selection takes, as Markdown out of its containers. A subtree selection's
 * roots, whatever `copySelection` says, each run of siblings out of its own containers, so roots at two
 * depths are copied as siblings. Within one node's text
 * (or across nodes with `copySelection: text`) the text; across nodes, the whole nodes it touches with
 * their subtrees, ending with a line break (one pastes as a node, not as a phrase); at a caret, the
 * node there with its subtree (`copyAtCaret: node`), else the host's. A cut deletes it as delete
 * subtree (whole nodes) or Backspace (text) does, within one node's text the text going. Null where
 * ourus doesn't do it yet: nodes delete subtree wouldn't take. Given nodes by id, those nodes, whole.
 */
export function copyOrCutCommand(ctx: CommandContext, type: 'copy' | 'cut'): OurusResult | null {
  const doc = ctx.doc;
  const view = ctx.view;
  const config = ctx.config;
  const from = Math.min(ctx.selection.anchor, ctx.selection.head);
  const to = Math.max(ctx.selection.anchor, ctx.selection.head);
  let nodes: readonly OurusNode[] | null = null;
  const subtrees = ctx.nodes ? null : view.selectedSubtrees(ctx.selection);
  if (subtrees) nodes = subtrees;
  else if (ctx.nodes) {
    const found = oneRun(ctx);
    if (!Array.isArray(found)) return operandsRefused(found);
    nodes = found;
  } else if (from === to) {
    if (config.copyAtCaret === 'host') return new OurusDeferred();
    // (the nodes delete subtree takes there: a folded row's owner, with what it hides)
    const line = doc.lineAt(from);
    const at = from <= line.to && doc.nodeAtLine(line.index) ? selectionRoots(view, ctx.selection) : [];
    if (!at.length) return new OurusDeferred();
    nodes = at;
  } else if (config.copySelection !== 'text' && nodesOnLines(ctx, from, to) > 1) {
    const found = oneRun(ctx);
    if (!Array.isArray(found)) return operandsRefused(found);
    nodes = found;
  }
  let markdown: string;
  if (nodes) {
    // each run of siblings out of its own containers: roots at two depths copied as siblings (a
    // deeper one before a shallower has no Markdown form), the blank lines between them kept
    const runs = runsOf(nodes);
    markdown = runs
      .map((run, k) => {
        const last = run.reduce((a, n) => (n.endLine > a.endLine ? n : a));
        const before = k ? run[0]!.startLine - runs[k - 1]!.reduce((a, n) => Math.max(a, n.endLine), 0) - 1 : 0;
        return '\n'.repeat(Math.max(0, before)) + doc.markdownOf(doc.markdownStart(run[0]!), doc.rangeOf(last).to);
      })
      .join('\n');
    if (!markdown.endsWith('\n')) markdown += '\n';
  } else markdown = doc.markdownOf(from, to);
  const clipboard = clipboardOf(markdown, ctx.config);
  if (type === 'copy') return new OurusSuccess({ view: ctx.view, changes: [], selection: ctx.selection, clipboard });
  const deleted = nodes ? deleteSubtreeCommand(ctx) : deleteSelected(ctx);
  // the text deleted as the host deletes it, where ourus doesn't: the clipboard is still ourus's
  if (!nodes && (!deleted || deleted instanceof OurusDeferred)) {
    const changes = [{ from, to, insert: '' }];
    return new OurusSuccess({ view: ctx.update({ changes }), changes, selection: { anchor: from, head: from }, clipboard });
  }
  if (!deleted) return null;
  return deleted instanceof OurusSuccess ? new OurusSuccess({ ...deleted, clipboard }) : deleted;
}

/**
 * The selection deleted, as Backspace over it deletes it; within one node's text, the text goes, the
 * blanks it leaves at a line's text start too (they would be padding), and a line it empties with its
 * line break. Null (unsupported) where ourus doesn't do it yet.
 */
export function deleteSelected(ctx: CommandContext): OurusResult | null {
  const deleted = deleteContentBackwardCommand(ctx);
  const [a, b] = [ctx.from, ctx.to];
  if (!(deleted instanceof OurusDeferred) || a.zone !== 'text' || b.zone !== 'text' || !(a.text instanceof OurusProse) || a.node.persistentNode !== b.node.persistentNode) return deleted;
  const s = a.text.text;
  let [from, end] = [a.offset, b.offset];
  const lineStart = s.lastIndexOf('\n', from - 1) + 1;
  const lineEnd = s.indexOf('\n', end) < 0 ? s.length : s.indexOf('\n', end);
  if (from <= Math.max(lineStart, a.text.textStart(lineOf(s, from)))) while (end < lineEnd && (s[end] === ' ' || s[end] === '\t')) end++;
  // (a line emptied: its line break with it, the one after it, or on the last line the one before)
  if (trimMd(s.slice(lineStart, from)) === '' && trimMd(s.slice(end, lineEnd)) === '' && (lineStart > 0 || lineEnd < s.length)) {
    if (lineEnd < s.length) [from, end] = [lineStart, lineEnd + 1];
    else [from, end] = [lineStart - 1, lineEnd];
  }
  return ctx.apply(ctx.draft().setText(a.node, a.text.splice(from, end)).setCaret(a.node, from, -1));
}

/** How many nodes own the lines `from`–`to` touches (a selection ending at a line's start doesn't take that line). */
function nodesOnLines(ctx: CommandContext, from: number, to: number): number {
  const lo = ctx.doc.lineAt(from).index;
  const end = ctx.doc.lineAt(to);
  const hi = end.index > lo && end.from === to ? end.index - 1 : end.index;
  const nodes = new Set<unknown>();
  for (let i = lo; i <= hi; i++) {
    const node = ctx.doc.nodeAtLine(i);
    if (node) nodes.add(node.persistentNode);
  }
  return nodes.size;
}

/**
 * The selection deleted (`deleteSelected`), then `then` from the caret it leaves, both one edit: the
 * host's where `then` is (the host replaces the selection), refused where either is. Null (unsupported)
 * where either is.
 */
export function afterDeleting(ctx: CommandContext, then: (ctx: CommandContext) => OurusResult | null): OurusResult | null {
  const from = Math.min(ctx.selection.anchor, ctx.selection.head);
  const to = Math.max(ctx.selection.anchor, ctx.selection.head);
  // within one text, what `then` puts in one line of it: the other way round, `then` at the
  // selection's end and the selection deleted after (the deletion alone would take the blank after a
  // selection from the text's start, `[p] q`, or empty a text a block id ends: `p` of `p ^x`)
  const oneText = ctx.from.zone === 'text' && ctx.to.zone === 'text' && ctx.from.node === ctx.to.node;
  if (oneText) {
    const reversed = thenDeleting(ctx, from, to, then, true);
    if (reversed) return reversed;
  }
  const deleted = deleteSelected(ctx);
  const forward = ((): OurusResult | null => {
    if (!deleted || !(deleted instanceof OurusSuccess)) return deleted;
    const next = then(new CommandContext(deleted.view, deleted.selection));
    if (!next || !(next instanceof OurusSuccess)) return next;
    return new OurusSuccess({ ...next, ...blockIdsDeclaredBy([deleted, next]), changes: composeChanges(ctx.doc.text, deleted.changes, next.changes) });
  })();
  // (and so where, the other way, a block id the selection doesn't take is lost: its text emptied
  // between the two, or the text then glued to it)
  if (!oneText || !ctx.doc.text.includes('^')) return forward;
  const loses = (r: OurusResult | null): boolean => r instanceof OurusRejected || (r instanceof OurusSuccess && !!checkBlockIds(ctx.doc, r.view.doc, r.changes, { declared: { moved: r.movedBlockIds ?? [], merged: r.mergedBlockIds ?? [] }, taken: { from, to } }));
  if (!loses(forward)) return forward;
  const reversed = thenDeleting(ctx, from, to, then, false);
  return reversed && (reversed instanceof OurusDeferred || !loses(reversed)) ? reversed : forward;
}

/**
 * `then` at `to`, then `[from, to)` deleted (`afterDeleting`'s other order); `inline`: only where
 * `then` puts text in the line `to` is on. Null where `then` changes the text before `to`, or the
 * deletion isn't applied.
 */
function thenDeleting(ctx: CommandContext, from: number, to: number, then: (ctx: CommandContext) => OurusResult | null, inline: boolean): OurusResult | null {
  const first = then(ctx.at(to));
  if (!first || !(first instanceof OurusSuccess)) return !inline && first instanceof OurusDeferred ? first : null;
  if (first.changes.some((c) => c.from < to)) return null;
  if (inline && first.changes.some((c) => /[\r\n]/.test(c.insert ?? '') || /[\r\n]/.test(ctx.doc.text.slice(c.from, c.to ?? c.from)))) return null;
  const deleted = deleteSelected(new CommandContext(first.view, { anchor: from, head: to }));
  if (!deleted || !(deleted instanceof OurusSuccess)) return null;
  const map = (pos: number): number => mapPos(deleted.changes, pos, 1);
  const selection = { anchor: map(first.selection.anchor), head: map(first.selection.head) };
  return new OurusSuccess({ ...deleted, ...blockIdsDeclaredBy([first, deleted]), selection, changes: composeChanges(ctx.doc.text, first.changes, deleted.changes) });
}
