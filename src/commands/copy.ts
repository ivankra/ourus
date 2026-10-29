// Copy and cut (spec/copy.md): the selection's Markdown, written as the host's
// clipboard formats; a cut takes it out as Backspace or delete subtree would.

import { clipboardOf } from './clipboard.ts';
import { OurusProse, type OurusNode } from '../doc/index.ts';
import { deleteContentBackwardCommand } from './backspace.ts';
import { CommandContext, deferToHost, type CommandOutcome } from './context.ts';
import { composeChanges, lineOf, trimMd } from '../text/index.ts';
import { deleteSubtreeCommand } from './delete-subtree.ts';
import { oneRun, operandsRefused, runsOf, selectionRoots } from './util.ts';

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
export function copyOrCutCommand(ctx: CommandContext, type: 'copy' | 'cut'): CommandOutcome {
  const doc = ctx.doc;
  const config = ctx.config;
  const from = Math.min(ctx.selection.anchor, ctx.selection.head);
  const to = Math.max(ctx.selection.anchor, ctx.selection.head);
  let nodes: readonly OurusNode[] | null = null;
  const subtrees = ctx.nodes ? null : doc.selectedNodes(ctx.selection);
  if (subtrees) nodes = subtrees;
  else if (ctx.nodes) {
    const found = oneRun(ctx);
    if (!Array.isArray(found)) return operandsRefused(found);
    nodes = found;
  } else if (from === to) {
    if (config.copyAtCaret === 'host') return deferToHost();
    // (the nodes delete subtree takes there: a folded row's owner, with what it hides)
    const line = doc.lineAt(from);
    const at = from <= line.to && doc.nodeAtLine(line.index) ? selectionRoots(doc, ctx.selection) : [];
    if (!at.length) return deferToHost();
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
  if (type === 'copy') return { status: 'applied', doc: ctx.doc, changes: [], selection: ctx.selection, clipboard };
  const deleted = nodes ? deleteSubtreeCommand(ctx) : deleteSelected(ctx);
  // the text deleted as the host deletes it, where ourus doesn't: the clipboard is still ourus's
  if (!nodes && (!deleted || deleted.status === 'deferredToHost')) {
    const changes = [{ from, to, insert: '' }];
    return { status: 'applied', doc: ctx.doc.update({ changes }), changes, selection: { anchor: from, head: from }, clipboard };
  }
  if (!deleted) return null;
  return deleted.status === 'applied' ? { ...deleted, clipboard } : deleted;
}

/**
 * The selection deleted, as Backspace over it deletes it; within one node's text, the text goes, the
 * blanks it leaves at a line's text start too (they would be padding), and a line it empties with its
 * line break. Null (unsupported) where ourus doesn't do it yet.
 */
export function deleteSelected(ctx: CommandContext): CommandOutcome {
  const deleted = deleteContentBackwardCommand(ctx);
  const [a, b] = [ctx.from, ctx.to];
  if (deleted?.status !== 'deferredToHost' || a.zone !== 'text' || b.zone !== 'text' || !(a.text instanceof OurusProse) || a.node.persistentNode !== b.node.persistentNode) return deleted;
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
export function afterDeleting(ctx: CommandContext, then: (ctx: CommandContext) => CommandOutcome): CommandOutcome {
  const deleted = deleteSelected(ctx);
  if (!deleted || deleted.status !== 'applied') return deleted;
  const next = then(new CommandContext(deleted.doc, deleted.selection));
  if (!next || next.status !== 'applied') return next;
  return { ...next, changes: composeChanges(ctx.doc.text, deleted.changes, next.changes) };
}
