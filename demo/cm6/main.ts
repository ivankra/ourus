// A minimal CodeMirror 6 outliner on top of ourus.
//
// The ourus snapshot lives in a StateField. Structural keys run ourus commands and dispatch
// the changes they return, with the planned snapshot attached so it isn't parsed again.
// Every other edit (typing, paste, undo) goes through Doc.apply.

import { markdown } from '@codemirror/lang-markdown';
import { Annotation, EditorSelection, EditorState, Prec, RangeSetBuilder, StateEffect, StateField, Transaction } from '@codemirror/state';
import { Decoration, EditorView, keymap, ViewPlugin, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { Doc, execute, homePosition, settle, type Change, type Command, type OutlineNode, type Result } from '../../src/index.ts';

/** The snapshot an ourus command planned, attached to the transaction that applies it. */
const planned = Annotation.define<Doc>();
/** Replaces the snapshot outright (settling provisional places can change no text at all). */
const setDoc = StateEffect.define<Doc>();

const ourusDoc = StateField.define<Doc>({
  create: (state) => Doc.parse(state.doc.toString()),
  update(doc, tr) {
    for (const e of tr.effects) if (e.is(setDoc)) return e.value;
    if (!tr.docChanged) return doc;
    const next = tr.annotation(planned);
    // another extension may have added changes to the transaction: then parse what committed
    if (next && next.text.length === tr.newDoc.length && next.text === tr.newDoc.toString()) return next;
    const changes: Change[] = [];
    tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => changes.push({ from: fromA, to: toA, insert: inserted.toString() }));
    return doc.apply(changes);
  },
});

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

/** Paste: Markdown placed as nodes where ourus applies; elsewhere CodeMirror pastes the text. */
const pasteHandler = EditorView.domEventHandlers({
  paste(event, view) {
    const text = event.clipboardData?.getData('text/plain');
    if (!text) return false;
    const { anchor, head } = view.state.selection.main;
    const result = execute(view.state.field(ourusDoc), { type: 'insertFromPaste', text }, { anchor, head });
    onResult('insertFromPaste', result);
    if (result.status === 'notApplicable') return false;
    event.preventDefault();
    if (result.status === 'applied') {
      view.dispatch({
        changes: [...result.changes],
        selection: result.selection,
        annotations: [planned.of(result.doc), Transaction.userEvent.of('ourus.insertFromPaste')],
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

const outlinerKeymap = Prec.highest(
  keymap.of([
    { key: 'Tab', run: command('formatIndent') },
    { key: 'Shift-Tab', run: command('formatOutdent') },
    { key: 'Alt-ArrowUp', run: command('moveUp') },
    { key: 'Alt-ArrowDown', run: command('moveDown') },
    { key: 'Enter', run: command('insertParagraph') },
    { key: 'Shift-Enter', run: command('insertLineBreak') },
    { key: 'Home', run: home(false), shift: home(true) },
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

function label(doc: Doc, n: OutlineNode): string {
  if (n.kind === 'heading') return `H${n.head!.level}`;
  if (n.kind === 'item') return /^\[[ xX]\]/.test(doc.headLines(n)[0] ?? '') ? '☐' : n.block.list!.type === 'ordered' ? '1.' : '•';
  if (n.kind === 'paragraph') return '¶';
  return n.block.type.replace('_block', '').replace('blockquote', 'quote').replace('thematic_break', 'hr');
}

function renderOutline(panel: HTMLElement, doc: Doc, current: OutlineNode | null): void {
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
            const provisional = doc.provisional.some((p) => p >= doc.lines[n.startLine]!.from && p <= doc.lines[n.headEndLine]!.to);
            return `<li><div class="node${n === current ? ' current' : ''}${provisional ? ' provisional' : ''}" data-pos="${pos}"><span class="kind kind-${n.kind}">${escapeHtml(label(doc, n))}</span><span class="text">${escapeHtml(text) || '<i>empty</i>'}</span><span class="id">#${n.id}</span></div>${list(n.children)}</li>`;
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

function main(): void {
  const panel = document.getElementById('outline')!;
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
        currentNode,
        EditorView.lineWrapping,
        EditorView.updateListener.of((u) => {
          if (u.docChanged || u.selectionSet) refresh(u.view);
          // a provisional place the caret has left is settled: dropped, or removed when the
          // text can't hold it (an empty item right after its parent's text)
          if (u.selectionSet && !u.view.composing) {
            const state = u.state;
            queueMicrotask(() => {
              if (u.view.state !== state) return;
              const r = settle(state.field(ourusDoc), state.selection.main.head);
              if (!r) return;
              u.view.dispatch({
                changes: r.changes,
                effects: setDoc.of(r.doc),
                annotations: [Transaction.addToHistory.of(false), Transaction.userEvent.of('ourus.settle')],
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
