// A minimal CodeMirror 6 outliner on top of ourus.
//
// The ourus snapshot lives in a StateField. Structural keys run ourus commands and dispatch
// the changes they return, with the planned snapshot attached so it isn't parsed again.
// Every other edit (typing, paste, undo) goes through OutlineDoc.apply, with the caret, so an edit that
// empties a node keeps it as a placeholder. The history keeps each step's placeholders, so undo
// and redo bring them back.

import { markdown } from '@codemirror/lang-markdown';
import { cursorLineDown, cursorLineUp, invertedEffects, selectLineDown, selectLineUp } from '@codemirror/commands';
import { Annotation, EditorSelection, EditorState, Prec, RangeSetBuilder, StateEffect, StateField, Transaction } from '@codemirror/state';
import { Decoration, EditorView, keymap, ViewPlugin, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { HtmlRenderer, Parser } from 'commonmark';
import { OutlineDoc, execute, homePosition, mapPos, settle, textStart, type TextChange, type Command, type OutlineNode, type Result } from '../../src/index.ts';

/** The snapshot an ourus command planned, attached to the transaction that applies it. */
const planned = Annotation.define<OutlineDoc>();
/** Replaces the snapshot outright (settling placeholders can change no text at all). */
const setDoc = StateEffect.define<OutlineDoc>();
/** The placeholders a step of history returns to (positions in the text after the step), mapped along later edits. */
const setPlaceholders = StateEffect.define<readonly number[]>({ map: (value, mapping) => value.map((pos) => mapping.mapPos(pos, 1)) });

const ourusDoc = StateField.define<OutlineDoc>({
  create: (state) => OutlineDoc.parse(state.doc.toString()),
  update(doc, tr) {
    for (const e of tr.effects) if (e.is(setDoc)) return e.value;
    const restored = tr.effects.find((e) => e.is(setPlaceholders))?.value as readonly number[] | undefined;
    if (!tr.docChanged) return restored ? doc.apply([], { drop: [...doc.placeholders], placeholders: restored }) : doc;
    const next = tr.annotation(planned);
    // another extension may have added changes to the transaction: then parse what committed
    if (!restored && next && next.text.length === tr.newDoc.length && next.text === tr.newDoc.toString()) return next;
    const changes: TextChange[] = [];
    tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => changes.push({ from: fromA, to: toA, insert: inserted.toString() }));
    // undo and redo restore the placeholders of the state they return to
    if (restored) return doc.apply(changes, { drop: [...doc.placeholders], placeholders: restored });
    const caret = tr.newSelection.main;
    return doc.apply(changes, caret.empty ? { caret: caret.head } : {});
  },
});

/** Each step of history keeps the placeholders it replaced, so undoing it brings them back. */
const placeholderHistory = invertedEffects.of((tr) => (tr.docChanged ? [setPlaceholders.of(tr.startState.field(ourusDoc).placeholders)] : []));

let onResult: (type: Command['type'], result: Result) => void = () => {};

function command(type: Command['type']) {
  return (view: EditorView): boolean => {
    const doc = view.state.field(ourusDoc);
    const { anchor, head } = view.state.selection.main;
    const result = execute(doc, { type } as Command, { anchor, head });
    onResult(type, result);
    if (result.status === 'notApplicable') return false; // let CodeMirror do its default
    if (result.status === 'rejected') return true; // swallow the key; the status bar says why
    view.dispatch({
      changes: [...result.changes],
      selection: result.selection,
      annotations: [planned.of(result.doc), Transaction.userEvent.of(`ourus.${type}`)],
      scrollIntoView: true,
    });
    return true;
  };
}

/** Set by Ctrl-Shift-V's keydown, for the paste event it fires: paste as plain text. */
let plainPaste = false;

/**
 * Paste: Ctrl-V places Markdown as nodes where ourus applies, Ctrl-Shift-V pastes the text into the
 * node; elsewhere CodeMirror pastes the text.
 */
const pasteHandler = EditorView.domEventHandlers({
  keydown(event) {
    plainPaste = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'v';
    return false;
  },
  paste(event, view) {
    const type = plainPaste ? 'pastePlain' : 'pasteStructured';
    plainPaste = false;
    const text = event.clipboardData?.getData('text/plain');
    if (!text) return false;
    const { anchor, head } = view.state.selection.main;
    const result = execute(view.state.field(ourusDoc), { type, text }, { anchor, head });
    onResult(type, result);
    if (result.status === 'notApplicable') return false;
    event.preventDefault();
    if (result.status === 'applied') {
      view.dispatch({
        changes: [...result.changes],
        selection: result.selection,
        annotations: [planned.of(result.doc), Transaction.userEvent.of(`ourus.${type}`)],
        scrollIntoView: true,
      });
    }
    return true;
  },
});

/** Home: the start of the node's text, then the start of the line. Wrapped rows keep CodeMirror's Home. */
function home(extend: boolean) {
  return (view: EditorView): boolean => {
    const range = view.state.selection.main;
    const line = view.state.doc.lineAt(range.head);
    const target = homePosition(view.state.field(ourusDoc), range.head);
    const rowStart = view.moveToLineBoundary(range, false, true).head;
    if (rowStart > line.from && rowStart > target) return false;
    view.dispatch({
      selection: EditorSelection.single(extend ? range.anchor : target, target),
      scrollIntoView: true,
      userEvent: 'select',
    });
    return true;
  };
}

/**
 * Up and Down: CodeMirror's, except that a column in a line's markers or indentation lands at the
 * start of its text. The goal column is kept, so moving on lands where CodeMirror would.
 */
function vertical(motion: (view: EditorView) => boolean) {
  return (view: EditorView): boolean => {
    if (!motion(view)) return false;
    const { state } = view;
    const doc = state.field(ourusDoc);
    const ranges = state.selection.ranges.map((range) => {
      const start = textStart(doc, state.doc.lineAt(range.head).from);
      if (range.head >= start) return range;
      return range.empty ? EditorSelection.cursor(start, 0, undefined, range.goalColumn) : EditorSelection.range(range.anchor, start, range.goalColumn);
    });
    if (ranges.some((range, i) => range !== state.selection.ranges[i])) {
      view.dispatch({ selection: EditorSelection.create(ranges, state.selection.mainIndex), scrollIntoView: true, userEvent: 'select' });
    }
    return true;
  };
}

const outlinerKeymap = Prec.highest(
  keymap.of([
    { key: 'Tab', run: command('indent') },
    { key: 'Shift-Tab', run: command('outdent') },
    { key: 'Alt-ArrowUp', run: command('moveBlockUp') },
    { key: 'Alt-ArrowDown', run: command('moveBlockDown') },
    { key: 'Enter', run: command('enter') },
    { key: 'Shift-Enter', run: command('shiftEnter') },
    { key: 'Home', run: home(false), shift: home(true) },
    { key: 'ArrowUp', run: vertical(cursorLineUp), shift: vertical(selectLineUp) },
    { key: 'ArrowDown', run: vertical(cursorLineDown), shift: vertical(selectLineDown) },
    { key: 'Backspace', run: command('deleteContentBackward') },
    { key: 'Delete', run: command('deleteContentForward') },
    { key: 'Mod-Backspace', run: command('deleteSoftLineBackward') },
  ]),
);

/** Highlights the node at the caret: its own lines, and its descendants more faintly. */
const currentNode = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.selectionSet) this.decorations = this.build(u.view);
    }
    build(view: EditorView): DecorationSet {
      const doc = view.state.field(ourusDoc);
      const node = doc.nodeAt(view.state.selection.main.head);
      const builder = new RangeSetBuilder<Decoration>();
      if (!node) return builder.finish();
      for (let l = node.startLine; l <= node.endLine; l++) {
        const line = doc.lines[l]!;
        builder.add(line.from, line.from, Decoration.line({ class: l <= node.headEndLine ? 'ourus-head' : 'ourus-subtree' }));
      }
      return builder.finish();
    }
  },
  { decorations: (v) => v.decorations },
);

// ------------------------------------------------------------------ outline panel

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function label(doc: OutlineDoc, n: OutlineNode): string {
  if (n.kind === 'heading') return `H${n.head!.level}`;
  if (n.kind === 'item') return /^\[[ xX]\]/.test(doc.headLines(n)[0] ?? '') ? '☐' : n.block.list!.type === 'ordered' ? '1.' : '•';
  if (n.kind === 'paragraph') return '¶';
  return n.block.type.replace('_block', '').replace('blockquote', 'quote').replace('thematic_break', 'hr');
}

function renderOutline(panel: HTMLElement, doc: OutlineDoc, current: OutlineNode | null): void {
  const list = (nodes: readonly OutlineNode[]): string =>
    nodes.length === 0
      ? ''
      : `<ul>${nodes
          .map((n) => {
            const lines = doc.headLines(n).map((l) => l.trim());
            // an atom shows its first line of content: past a fence, without quote markers
            const text = n.kind === 'atom' ? (lines.find((l) => l !== '' && !/^(`{3,}|~{3,})/.test(l)) ?? '').replace(/^>\s?/, '') : lines.join(' ');
            const range = doc.headRange(n);
            const pos = range ? range.from : doc.lines[n.startLine]!.to;
            const placeholders = doc.placeholders.some((p) => p >= doc.lines[n.startLine]!.from && p <= doc.lines[n.headEndLine]!.to);
            return `<li><div class="node${n === current ? ' current' : ''}${placeholders ? ' placeholders' : ''}" data-pos="${pos}"><span class="kind kind-${n.kind}">${escapeHtml(label(doc, n))}</span><span class="text">${escapeHtml(text) || '<i>empty</i>'}</span><span class="id">#${n.id}</span></div>${list(n.children)}</li>`;
          })
          .join('')}</ul>`;
  panel.innerHTML = list(doc.outline.children);
}

// ------------------------------------------------------------------ page

const SAMPLE = `# ourus demo

A paragraph at the top level. Paragraphs are leaves; list items and headings hold children.

## Lists

- Tab and Shift-Tab indent and outdent the item at the caret
- Alt-Up and Alt-Down move it among its siblings, children included
  - like this child
  - and this one
    - a grandchild
- Enter splits an item; Backspace at its start joins it to the node above, Delete at its end joins the node below
- Shift-Enter breaks a line inside an item,
  which stays one item
- Enter on an empty item outdents it, or leaves the list (Enter twice ends a list)
- [ ] tasks are items too

1. ordered lists
2. renumber when they start a nested list

## Sections

Tab on a heading demotes it, together with its section.

### A subsection

Some text.

\`\`\`js
code blocks are atoms
\`\`\`

> quotes are atoms for now
`;

// ------------------------------------------------------------------ rendered panel

/** The document as a standard CommonMark reader renders it (commonmark.js), raw HTML escaped. */
const reader = new Parser();
const renderer = new HtmlRenderer({ safe: true });
const renderPreview = (pane: HTMLElement, text: string): void => {
  pane.innerHTML = renderer.render(reader.parse(text));
};

function main(): void {
  const panel = document.getElementById('outline')!;
  const preview = document.getElementById('preview')!;
  let rendered: string | null = null;
  const status = document.getElementById('status')!;
  const stats = document.getElementById('stats')!;

  onResult = (type, result) => {
    status.className = result.status;
    status.textContent =
      result.status === 'rejected'
        ? `${type}: rejected — ${result.reason}${result.detail && result.reason !== 'encoding-failed' ? ` (${result.detail})` : ''}`
        : `${type}: ${result.status === 'applied' ? 'applied' : 'not applicable (editor default)'}`;
  };

  let frame = 0;
  const refresh = (view: EditorView) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const doc = view.state.field(ourusDoc);
      renderOutline(panel, doc, doc.nodeAt(view.state.selection.main.head));
      if (doc.text !== rendered) {
        renderPreview(preview, doc.text);
        rendered = doc.text;
      }
      stats.textContent = `${doc.lines.length} lines · ${doc.nodes.length - 1} nodes`;
    });
  };

  const view = new EditorView({
    parent: document.getElementById('editor')!,
    state: EditorState.create({
      doc: SAMPLE,
      extensions: [
        outlinerKeymap,
        pasteHandler,
        basicSetup,
        markdown(),
        ourusDoc,
        placeholderHistory,
        currentNode,
        EditorView.lineWrapping,
        EditorView.updateListener.of((u) => {
          if (u.docChanged || u.selectionSet) refresh(u.view);
          // a placeholder the caret has left is settled: dropped, or removed when the
          // text can't hold it (an empty item right after its parent's text)
          if (u.selectionSet && !u.view.composing) {
            const state = u.state;
            const left = u.startState.selection.main;
            queueMicrotask(() => {
              if (u.view.state !== state) return;
              const r = settle(state.field(ourusDoc), state.selection.main.head);
              if (!r) return;
              const to = state.selection.main;
              // leaving is an undo step of its own; history keeps the selection before a step, so
              // the caret goes back onto the placeholder first, outside history, and undo returns there
              u.view.dispatch({ selection: left, annotations: Transaction.addToHistory.of(false) });
              u.view.dispatch({
                changes: r.changes,
                selection: EditorSelection.range(mapPos(r.changes, to.anchor), mapPos(r.changes, to.head)),
                effects: setDoc.of(r.doc),
                annotations: Transaction.userEvent.of('ourus.settle'),
              });
            });
          }
        }),
      ],
    }),
  });
  refresh(view);

  panel.addEventListener('mousedown', (e) => {
    const el = (e.target as HTMLElement).closest('[data-pos]');
    if (!el) return;
    e.preventDefault();
    const pos = Number(el.getAttribute('data-pos'));
    view.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
    view.focus();
  });

  // a handle for scripted checks
  (window as unknown as { ourusDemo: unknown }).ourusDemo = {
    view,
    text: () => view.state.doc.toString(),
    setText: (text: string, caret = 0) =>
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text }, selection: { anchor: caret } }),
    doc: () => view.state.field(ourusDoc),
  };
  view.focus();
}

main();

