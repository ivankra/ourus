// Folds and the zoom, a CodeMirror host's side of them. The snapshot holds the
// view (`OurusDoc.folded`, `OurusDoc.zoom`); CodeMirror draws it:
//
// - a `foldService` answering from ourus's outline (`rowOwner`, `foldRange`), so CodeMirror's own
//   gutter and keys fold ourus's nodes, a heading's section, a paragraph's list, a quote;
// - CodeMirror's folds into the snapshot (a fold or unfold effect, by the row's node), and the
//   snapshot's into CodeMirror after a transaction (only `zoomFolded`, each fold's range exactly:
//   a range CodeMirror mapped through a rewrite is replaced), the one sync the commands need;
// - the zoom as two block-replace decorations around `zoomRange()`, atomic, a transaction filter
//   keeping the selection in it, and refusing an edit of CodeMirror's own that `leavesZoom`;
// - keys for the view's commands, and a breadcrumb panel naming the zoom root's ancestors.

import { foldEffect, foldService, foldedRanges, unfoldEffect } from '@codemirror/language';
import { Annotation, EditorSelection, EditorState, Prec, Transaction, type StateEffect, type StateEffectType, type StateField, type AnnotationType } from '@codemirror/state';
import { Decoration, EditorView, keymap, showPanel, type DecorationSet, type Panel } from '@codemirror/view';
import { executeCommand, leavesZoom, type OurusCommand, type OurusDoc, type OurusNode } from '../../src/index.ts';

/** Marks the transactions this module makes to bring CodeMirror's folds in line with the snapshot's. */
const syncing = Annotation.define<boolean>();

interface Wiring {
  /** The snapshot's field. */
  readonly field: StateField<OurusDoc>;
  /** Replaces the snapshot outright (a view command's result, a fold read from CodeMirror). */
  readonly setDoc: StateEffectType<OurusDoc>;
  /** The snapshot an ourus command planned, on the transaction that applies it. */
  readonly planned: AnnotationType<OurusDoc>;
}

/** The zoom root and its ancestors: their folds hide nothing while zoomed, and offer none. */
function suppressed(doc: OurusDoc): Set<number> {
  const ids = new Set<number>();
  for (let p: OurusNode | null = doc.zoom === null ? null : (doc.node(doc.zoom) ?? null); p && p.kind !== 'root'; p = p.parent) ids.add(p.id);
  return ids;
}

/**
 * The node whose fold CodeMirror holds at `range`: one whose `foldRange` it is, starting on its row or
 * ending its text there (a text of several lines folds from its last), the one folded already where
 * two are, else the row's.
 */
function nodeOfFold(doc: OurusDoc, range: { from: number; to: number }): OurusNode | null {
  const line = doc.lineAt(range.from).index;
  const row: OurusNode[] = [];
  for (let n: OurusNode | null = doc.rowOwner(line); n && n.startLine === line; n = n.children[0] ?? null) row.push(n);
  const ending: OurusNode[] = [];
  for (let n: OurusNode | null = doc.nodeAtLine(line) ?? null; n && n.kind !== 'root'; n = n.parent) if (n.textLastLine === line) ending.push(n);
  const exact = [...row, ...ending].filter((n) => {
    const r = doc.foldRange(n);
    return r && r.from === range.from && r.to === range.to;
  });
  return exact.find((n) => doc.folded.has(n.id)) ?? exact[0] ?? row[0] ?? null;
}

export function outlineView({ field, setDoc, planned }: Wiring) {
  // ourus's folds, ahead of the Markdown language's (which folds headings by indentation)
  const service = Prec.highest(
    foldService.of((state, lineStart) => {
      const doc = state.field(field);
      const line = doc.lineAt(lineStart);
      const node = lineStart > line.to ? null : doc.rowOwner(line.index);
      if (!node || suppressed(doc).has(node.id)) return null;
      return doc.foldRange(node);
    }),
  );

  // CodeMirror's fold and unfold effects, from its gutter or keys, into the snapshot
  const fromEditor = EditorState.transactionExtender.of((tr) => {
    // (a fold with text changed in the same transaction: the snapshot after it is the update's)
    if (tr.annotation(syncing) || tr.docChanged) return null;
    const folds = tr.effects.filter((e) => e.is(foldEffect) || e.is(unfoldEffect));
    if (!folds.length) return null;
    let doc = tr.startState.field(field);
    const folded = new Set(doc.folded);
    for (const e of folds) {
      const node = nodeOfFold(doc, e.value as { from: number; to: number });
      if (!node) continue;
      if (e.is(foldEffect)) folded.add(node.id);
      else folded.delete(node.id);
    }
    doc = doc.withFolded(folded);
    return { effects: setDoc.of(doc) };
  });

  // the snapshot's folds into CodeMirror, after every transaction that changed the snapshot
  const toEditor = EditorView.updateListener.of((u) => {
    if (u.startState.field(field) === u.state.field(field) || u.transactions.some((tr) => tr.annotation(syncing))) return;
    const doc = u.state.field(field);
    const want = new Map<string, { from: number; to: number }>();
    for (const id of doc.zoomFolded) {
      const range = doc.foldRange(doc.node(id)!);
      if (range) want.set(`${range.from}:${range.to}`, range);
    }
    const effects: StateEffect<unknown>[] = [];
    const have = new Set<string>();
    foldedRanges(u.state).between(0, u.state.doc.length, (from, to) => {
      const key = `${from}:${to}`;
      have.add(key);
      if (!want.has(key)) effects.push(unfoldEffect.of({ from, to }));
    });
    for (const [key, range] of want) if (!have.has(key)) effects.push(foldEffect.of(range));
    if (effects.length) queueMicrotask(() => u.view.dispatch({ effects, annotations: syncing.of(true) }));
  });

  // the zoom: what it doesn't show replaced by nothing, the caret stepping over it
  const outside = (state: EditorState): DecorationSet => {
    const range = state.field(field).zoomRange();
    if (!range) return Decoration.none;
    const parts = [];
    const length = state.doc.length;
    if (range.from > 0) parts.push(Decoration.replace({ block: true }).range(0, range.from - 1));
    if (range.to < length) parts.push(Decoration.replace({ block: true }).range(range.to + 1, length));
    return Decoration.set(parts);
  };
  const hidden = EditorView.decorations.compute([field], outside);
  const atomic = EditorView.atomicRanges.of((view) => outside(view.state));

  // the selection kept in the zoom; an edit of the user's through CodeMirror (typing, its commands,
  // a default ourus deferred to: a transaction with a user event) refused where it would leave the
  // zoom. Let through: an undo, a redo, ourus's own command (its result keeps the zoom already), and
  // a change with no user event (a reload, a sync: nothing can refuse it, `doc.update` carries the
  // zoom or ends it)
  const confine = EditorState.transactionFilter.of((tr: Transaction) => {
    const doc = tr.startState.field(field);
    if (doc.zoom === null && !tr.effects.some((e) => e.is(setDoc))) return tr;
    const user = tr.annotation(Transaction.userEvent);
    if (doc.zoom !== null && tr.docChanged && user && !tr.annotation(planned) && !tr.isUserEvent('undo') && !tr.isUserEvent('redo')) {
      const changes: { from: number; to: number; insert: string }[] = [];
      tr.changes.iterChanges((fromA, toA, _b, _e, inserted) => changes.push({ from: fromA, to: toA, insert: inserted.toString() }));
      const caret = tr.newSelection.main;
      if (leavesZoom(doc, doc.update({ changes, caret: caret.empty ? caret.head : undefined }))) return [];
    }
    if (!tr.selection || tr.docChanged) return tr;
    // into the zoom the transaction leaves (a view command's changes it: its selection is already the
    // one the new zoom shows, which the old one's range would pull back)
    const range = tr.state.field(field).zoomRange();
    if (!range) return tr;
    const clamp = (pos: number): number => Math.min(Math.max(pos, range.from), range.to);
    const sel = tr.newSelection.main;
    if (clamp(sel.anchor) === sel.anchor && clamp(sel.head) === sel.head) return tr;
    return [tr, { selection: EditorSelection.single(clamp(sel.anchor), clamp(sel.head)) }];
  });

  /** A view command: its result's snapshot and selection, no text changed. */
  const view = (command: OurusCommand) => (editor: EditorView): boolean => {
    const { anchor, head } = editor.state.selection.main;
    const result = executeCommand(editor.state.field(field), command, { anchor, head });
    if (result.status !== 'applied') return true;
    editor.dispatch({ effects: [setDoc.of(result.doc), EditorView.scrollIntoView(result.selection.head, { y: 'start' })], selection: result.selection });
    return true;
  };
  const keys = Prec.high(
    keymap.of([
      { key: 'Mod-ArrowUp', run: view({ type: 'fold' }) },
      { key: 'Mod-ArrowDown', run: view({ type: 'unfold' }) },
      { key: 'Mod-.', run: view({ type: 'zoomIn' }) },
      { key: 'Mod-,', run: view({ type: 'zoomOut' }) },
      { key: 'Mod-Shift-,', run: view({ type: 'clearZoom' }) },
    ]),
  );

  // the zoom root's ancestors, each a link zooming out to it, the document first
  const crumbs = showPanel.compute([field], (state) => {
    const doc = state.field(field);
    if (doc.zoom === null) return null;
    return (editor: EditorView): Panel => {
      const dom = document.createElement('nav');
      dom.className = 'ourus-breadcrumbs';
      const path: OurusNode[] = [];
      for (let p = doc.node(doc.zoom!) ?? null; p && p.kind !== 'root'; p = p.parent) path.unshift(p);
      const link = (label: string, zoom: number | null): void => {
        const a = document.createElement('a');
        a.textContent = label;
        a.href = '#';
        // a command, not `withZoom`: zoomed out, the folds back in effect move the selection out of them;
        // the editor keeps the focus, the caret where the command put it
        a.onmousedown = (e) => e.preventDefault();
        a.onclick = (e) => {
          e.preventDefault();
          view(zoom === null ? { type: 'clearZoom' } : { type: 'zoomIn', nodes: [zoom] })(editor);
        };
        dom.append(a, ' › ');
      };
      link('Document', null);
      for (const n of path.slice(0, -1)) link(titleOf(doc, n), n.id);
      dom.append(titleOf(doc, path[path.length - 1]!));
      return { dom, top: true };
    };
  });

  return [service, fromEditor, toEditor, hidden, atomic, confine, keys, crumbs];
}

/** A node's text as a title: its first line, markup aside. */
function titleOf(doc: OurusDoc, node: OurusNode): string {
  const text = doc.textOf(node)?.text ?? '';
  return text.split('\n')[0]!.replace(/^#+\s*|^\[.\]\s*/, '').trim() || node.kind;
}
