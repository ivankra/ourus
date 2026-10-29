// A minimal CodeMirror 6 outliner on top of ourus.
//
// The ourus snapshot lives in a StateField. Structural keys run ourus commands and dispatch
// the changes they return, with the planned snapshot attached so it isn't parsed again.
// Every other edit (typing, paste, undo) goes through OurusDoc.update, with the caret, so an edit that
// empties a node keeps it as a placeholder. The history keeps each step's placeholders, and the
// snapshot it left, so undo and redo bring them back, and its nodes: an undone move keeps its fold.
//
// The header picks the flavor ourus reads the text in, and the renderer of the middle pane: ourus's
// own (from the snapshot's parse) or a popular external one, set up for the flavor as far as it goes.
// Code blocks are highlighted (highlight.js) and math typeset (KaTeX) after any renderer. The pane
// shows the editor's caret and selection, scrolls along with the editor, and keeps the caret in view (mirror.ts).

import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { cursorLineDown, cursorLineUp, invertedEffects, redo, selectLineDown, selectLineUp, undo } from '@codemirror/commands';
import { Annotation, Compartment, EditorSelection, EditorState, Prec, RangeSetBuilder, StateEffect, StateField, Transaction, type StateEffectType } from '@codemirror/state';
import { Decoration, EditorView, keymap, ViewPlugin, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { tags } from '@lezer/highlight';
import { HtmlRenderer, Parser } from 'commonmark';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
import katex from 'katex';
import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import mark from 'markdown-it-mark';
import taskLists from 'markdown-it-task-lists';
import { Marked } from 'marked';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { math, mathHtml } from 'micromark-extension-math';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import showdown from 'showdown';
import { unified, type PluggableList } from 'unified';
import './hljs.css';
import 'katex/dist/katex.min.css';
import { Mirror } from './mirror.ts';
import { outlineView } from './view.ts';
import { ProseText, OurusDoc, createPlaceholder, executeCommand, mapPos, settlePlaceholders, type Config, type ChangeSpec, type Command, type OutlineNode, type CommandResult } from '../../src/index.ts';

type Flavor = Config['flavor'];

/** The flavor a new editor reads its text in; the header's select changes it. */
let initialFlavor: Flavor = 'obsidian';

/** The snapshot an ourus command planned, attached to the transaction that applies it. */
const planned = Annotation.define<OurusDoc>();
/** Replaces the snapshot outright (settling placeholders can change no text at all). */
const setDoc = StateEffect.define<OurusDoc>();
/** The placeholders a step of history returns to (positions in the text after the step), mapped along later edits. */
const setPlaceholders = StateEffect.define<readonly number[]>({ map: (value, mapping) => value.map((pos) => mapping.mapPos(pos, 1)) });
/** The snapshot a step of history returns to, whose nodes (ids and all) it takes back where its text is the one returned to. */
const returnTo = StateEffect.define<OurusDoc>();

/** The placeholders at `points` of `text`. */
const marksAt = (text: string, points: readonly number[]) => ({ setMarks: points.map((p) => createPlaceholder(p)) });

/** The value of a transaction's last effect of `type`. */
function lastOf<T>(tr: Transaction, type: StateEffectType<T>): T | undefined {
  let value: T | undefined;
  for (const e of tr.effects) if (e.is(type)) value = e.value;
  return value;
}

const ourusDoc = StateField.define<OurusDoc>({
  create: (state) => OurusDoc.parse(state.doc.toString(), { config: { flavor: initialFlavor } }),
  update(doc, tr) {
    for (const e of tr.effects) if (e.is(setDoc)) return e.value;
    // (a step of history that grouped several edits has each one's effects, the latest edit's first:
    // the state it returns to is the earliest's, the last)
    const restored = lastOf(tr, setPlaceholders);
    if (!tr.docChanged) return restored ? doc.update([], marksAt(doc.text, restored)) : doc;
    const next = tr.annotation(planned);
    // another extension may have added changes to the transaction: then parse what committed
    if (!restored && next && next.text.length === tr.newDoc.length && next.text === tr.newDoc.toString()) return next;
    const changes: ChangeSpec[] = [];
    tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => changes.push({ from: fromA, to: toA, insert: inserted.toString() }));
    // undo and redo restore the placeholders of the state they return to, and its nodes: an undone
    // move's node is the one it was, its fold kept (`replace`'s `like`)
    const like = lastOf(tr, returnTo);
    if (restored && like && like.text === tr.newDoc.toString()) return doc.replace(like.text, like.marks.marks, { like });
    if (restored) return doc.update(changes, marksAt(tr.newDoc.toString(), restored));
    const caret = tr.newSelection.main;
    return doc.update(changes, caret.empty ? { caret: caret.head } : {});
  },
});

/** Each step of history keeps the placeholders it replaced, and the snapshot it left, so undoing it brings them back. */
const placeholderHistory = invertedEffects.of((tr) => (tr.docChanged ? [setPlaceholders.of(tr.startState.field(ourusDoc).marks.points()), returnTo.of(tr.startState.field(ourusDoc))] : []));

let onResult: (type: Command['type'], result: CommandResult) => void = () => {};

function command(type: Command['type']) {
  return (view: EditorView): boolean => {
    const doc = view.state.field(ourusDoc);
    const { anchor, head } = view.state.selection.main;
    const result = executeCommand(doc, { type } as Command, { anchor, head });
    onResult(type, result);
    if (result.status === 'deferredToHost') return false; // let CodeMirror do its default
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

/**
 * Typing: ourus's `insertText` first (a backtick can open a code fence or change one), CodeMirror's
 * own input where it doesn't apply. Composition (IME) is left to CodeMirror.
 */
const typingHandler = EditorView.inputHandler.of((view, from, to, text) => {
  if (view.composing) return false;
  // input that replaces another range than the selection (a text replacement) is CodeMirror's
  const { anchor, head } = view.state.selection.main;
  if (from !== Math.min(anchor, head) || to !== Math.max(anchor, head)) return false;
  const result = executeCommand(view.state.field(ourusDoc), { type: 'insertText', text }, { anchor, head });
  if (result.status === 'deferredToHost') return false;
  onResult('insertText', result);
  if (result.status === 'applied') {
    view.dispatch({
      changes: [...result.changes],
      selection: result.selection,
      annotations: [planned.of(result.doc), Transaction.userEvent.of('ourus.insertText')],
      scrollIntoView: true,
    });
  }
  return true;
});

/** Set by Ctrl-Shift-V's keydown, for the paste event it fires: paste as plain text. */
let plainPaste = false;

/**
 * Copy and cut: the selection's Markdown, every format ourus gives (the node at a caret alone); a cut
 * takes it out. Where ourus steps aside, CodeMirror's (a caret's line).
 */
function copyOrCut(type: 'copy' | 'cut', event: ClipboardEvent, view: EditorView): boolean {
  const data = event.clipboardData;
  if (!data) return false;
  const { anchor, head } = view.state.selection.main;
  const result = executeCommand(view.state.field(ourusDoc), { type }, { anchor, head });
  onResult(type, result);
  if (result.status === 'deferredToHost') return false;
  event.preventDefault();
  if (result.status !== 'applied') return true;
  for (const [format, text] of Object.entries(result.clipboard ?? {})) data.setData(format, text);
  if (type === 'cut') {
    view.dispatch({
      changes: [...result.changes],
      selection: result.selection,
      annotations: [planned.of(result.doc), Transaction.userEvent.of('ourus.cut')],
      scrollIntoView: true,
    });
  }
  return true;
}

/**
 * Paste: Ctrl-V places Markdown as nodes where ourus applies, Ctrl-Shift-V pastes the text into the
 * node; elsewhere CodeMirror pastes the text. Copy and cut: `copyOrCut`.
 */
const pasteHandler = EditorView.domEventHandlers({
  copy: (event, view) => copyOrCut('copy', event, view),
  cut: (event, view) => copyOrCut('cut', event, view),
  keydown(event) {
    plainPaste = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'v';
    return false;
  },
  paste(event, view) {
    const type = plainPaste ? 'pastePlain' : 'paste';
    plainPaste = false;
    // Ctrl-V reads every format the clipboard has (a page's HTML, a Markdown app's `text/markdown`), Ctrl-Shift-V its text
    const data = event.clipboardData;
    const text = data?.getData('text/plain');
    if (!data || !text) return false;
    const clipboard = Object.fromEntries(['text/plain', 'text/markdown', 'text/html', 'vscode-editor-data'].flatMap((t) => (data.types.includes(t) ? [[t, data.getData(t)]] : [])));
    const { anchor, head } = view.state.selection.main;
    const result = executeCommand(view.state.field(ourusDoc), type === 'paste' ? { type, clipboard } : { type, text }, { anchor, head });
    onResult(type, result);
    if (result.status === 'deferredToHost') return false;
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
    const doc = view.state.field(ourusDoc);
    const start = doc.textStart(doc.lineAt(range.head).index);
    const target = range.head === start ? line.from : start;
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
      const start = doc.textStart(doc.lineAt(range.head).index);
      if (range.head >= start) return range;
      return range.empty ? EditorSelection.cursor(start, 0, undefined, range.goalColumn) : EditorSelection.range(range.anchor, start, range.goalColumn);
    });
    if (ranges.some((range, i) => range !== state.selection.ranges[i])) {
      view.dispatch({ selection: EditorSelection.create(ranges, state.selection.mainIndex), scrollIntoView: true, userEvent: 'select' });
    }
    return true;
  };
}

/**
 * Shift-Down and Shift-Up by node. Over a subtree selection, ourus's wherever the head is; otherwise a
 * wrapped line is CodeMirror's a row at a time until the head is on its last row (its first going
 * up), then ourus's, which is the host's line too inside a node's text but from its edge.
 */
function selectByNode(dir: 1 | -1) {
  const native = vertical(dir > 0 ? selectLineDown : selectLineUp);
  const run = command(dir > 0 ? 'selectNodeDown' : 'selectNodeUp');
  return (view: EditorView): boolean => {
    const range = view.state.selection.main;
    if (!view.state.field(ourusDoc).selectedSubtrees(range)) {
      const line = view.state.doc.lineAt(range.head);
      const rowEdge = view.moveToLineBoundary(range, dir > 0, true).head;
      if (dir > 0 ? rowEdge < line.to : rowEdge > line.from) return native(view);
    }
    return run(view) || native(view);
  };
}

const outlinerKeymap = Prec.highest(
  keymap.of([
    { key: 'Tab', run: command('indent') },
    { key: 'Shift-Tab', run: command('outdent') },
    { key: 'Alt-ArrowUp', run: command('moveSubtreeUp') },
    { key: 'Alt-ArrowDown', run: command('moveSubtreeDown') },
    { key: 'Enter', run: command('enter') },
    { key: 'Shift-Enter', run: command('shiftEnter') },
    { key: 'Home', run: home(false), shift: home(true) },
    { key: 'ArrowUp', run: vertical(cursorLineUp), shift: selectByNode(-1) },
    { key: 'ArrowDown', run: vertical(cursorLineDown), shift: selectByNode(1) },
    { key: 'Escape', run: command('selectNode') },
    { key: 'Mod-a', run: command('expandSelection') },
    { key: 'Backspace', run: command('deleteContentBackward') },
    { key: 'Delete', run: command('deleteContentForward') },
    { key: 'Mod-Backspace', run: command('deleteSoftLineBackward') },
  ]),
);

/**
 * Blocks selected whole: a subtree selection's roots (`selectedSubtrees`), each root's lines
 * (`rangeOf`) drawn as blocks, the native highlight hidden (`ourus-blocks` on the editor).
 */
const blockSelection = [
  EditorView.decorations.compute([ourusDoc, 'selection'], (state) => {
    const doc = state.field(ourusDoc);
    const roots = doc.selectedNodes(state.selection.main);
    if (!roots) return Decoration.none;
    const builder = new RangeSetBuilder<Decoration>();
    for (const root of roots) for (let l = root.startLine; l <= root.endLine; l++) builder.add(doc.mdTree.starts[l]!, doc.mdTree.starts[l]!, Decoration.line({ class: 'ourus-block' }));
    return builder.finish();
  }),
  EditorView.editorAttributes.compute([ourusDoc, 'selection'], (state): Record<string, string> => (state.field(ourusDoc).selectedNodes(state.selection.main) ? { class: 'ourus-blocks' } : {})),
];

/**
 * A drag that reaches past a node's text, its ends on different nodes' own lines or one on a blank
 * line (an end at a line's start on the line before), selects the subtrees it touches whole: the
 * union of the drag and their selection, never less than the drag. Behind the header's toggle.
 */
const escalation = new Compartment();
const escalateDrags = EditorState.transactionFilter.of((tr) => {
  if (!tr.isUserEvent('select.pointer') || tr.docChanged) return tr;
  const sel = tr.newSelection.main;
  if (sel.empty) return tr;
  const doc = tr.startState.field(ourusDoc);
  const where = (pos: number): unknown => {
    const line = doc.lineAt(pos);
    const at = doc.locate(pos === line.from && pos > 0 && pos === sel.to ? pos - 1 : pos);
    return at.zone === 'gap' ? 'gap' : 'node' in at ? at.node.persistentNode : at.zone;
  };
  const [a, b] = [where(sel.from), where(sel.to)];
  if (a === b && a !== 'gap') return tr;
  try {
    const cover = doc.selectionOf(doc.touchedSubtrees(sel));
    const [from, to] = [Math.min(sel.from, cover.anchor), Math.max(sel.to, cover.head)];
    return [tr, { selection: sel.head < sel.anchor ? EditorSelection.single(to, from) : EditorSelection.single(from, to), sequential: true }];
  } catch {
    return tr;
  }
});

/** Highlights the node at the caret: its own lines, and its descendants more faintly. */
const currentNode = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.selectionSet || u.startState.field(ourusDoc) !== u.state.field(ourusDoc)) this.decorations = this.build(u.view);
    }
    build(view: EditorView): DecorationSet {
      const doc = view.state.field(ourusDoc);
      const node = nodeAt(doc, view.state.selection.main.head);
      const builder = new RangeSetBuilder<Decoration>();
      if (!node) return builder.finish();
      for (let l = node.startLine; l <= node.endLine; l++) {
        const line = doc.mdTree.line(l);
        builder.add(line.from, line.from, Decoration.line({ class: l <= node.textLastLine ? 'ourus-head' : 'ourus-subtree' }));
      }
      return builder.finish();
    }
  },
  { decorations: (v) => v.decorations },
);

/** The editor's colours in the dark: CodeMirror's dark base theme with the page's gutter and selection, and code colours that read on it. */
const darkHighlight = HighlightStyle.define([
  { tag: tags.meta, color: '#8b949e' },
  { tag: tags.link, textDecoration: 'underline' },
  { tag: tags.heading, textDecoration: 'underline', fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.keyword, color: '#ff7b72' },
  { tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName], color: '#79c0ff' },
  { tag: [tags.literal, tags.inserted], color: '#7ee787' },
  { tag: [tags.string, tags.deleted], color: '#a5d6ff' },
  { tag: [tags.regexp, tags.escape, tags.special(tags.string)], color: '#ffa657' },
  { tag: tags.definition(tags.variableName), color: '#d2a8ff' },
  { tag: tags.local(tags.variableName), color: '#ffa657' },
  { tag: [tags.typeName, tags.namespace], color: '#ffa657' },
  { tag: tags.className, color: '#f0883e' },
  { tag: [tags.special(tags.variableName), tags.macroName], color: '#79c0ff' },
  { tag: tags.definition(tags.propertyName), color: '#79c0ff' },
  { tag: tags.comment, color: '#8b949e' },
  { tag: tags.invalid, color: '#f85149' },
]);
const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const theme = new Compartment();
const darkTheme = EditorView.theme(
  {
    '.cm-gutters': { backgroundColor: 'var(--bg)', color: 'var(--muted)', borderColor: 'var(--line)' },
    '.cm-selectionBackground': { background: 'var(--selection)' },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': { background: 'var(--selection-focused)' },
  },
  { dark: true },
);
const themeFor = (dark: boolean) => (dark ? [darkTheme, syntaxHighlighting(darkHighlight)] : []);

// ------------------------------------------------------------------ outline panel

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const ATOM_LABELS: Record<string, string> = { thematic_break: 'hr', footnote_definition: 'note', refdef: 'ref' };

/** How many nodes are under `node`. */
const countNodes = (node: OutlineNode): number => node.children.reduce((n, c) => n + 1 + countNodes(c), 0);

/** The node whose own text holds `pos`, or null. */
function nodeAt(doc: OurusDoc, pos: number): OutlineNode | null {
  const line = doc.lineAt(pos);
  return pos <= line.to ? doc.nodeAtLine(line.index) : null;
}

/** A node's kind as the outline shows it: tasks, callouts and atoms as the flavor reads them. */
function label(n: OutlineNode): string {
  const attrs = n.block.attrs;
  if (n.kind === 'heading') return `H${n.head!.attrs.level}`;
  if (n.kind === 'item') return attrs.task ? (attrs.task.checked ? '☑' : '☐') : attrs.list!.type === 'ordered' ? '1.' : '•';
  if (n.kind === 'paragraph') return '¶';
  if (n.kind === 'quote') return attrs.callout ? attrs.callout.kind : 'quote';
  return ATOM_LABELS[n.block.type] ?? n.block.type.replace('_block', '');
}

function renderOutline(panel: HTMLElement, doc: OurusDoc, current: OutlineNode | null): void {
  const points = doc.marks.points();
  const list = (nodes: readonly OutlineNode[]): string =>
    nodes.length === 0
      ? ''
      : `<ul>${nodes
          .map((n) => {
            const own = doc.textOf(n);
            const lines = (own instanceof ProseText ? own.body : (own?.text ?? '')).split('\n').map((l) => l.trim());
            // an atom shows its first line of content: past a fence
            const text = n.kind === 'atom' ? (lines.find((l) => l !== '' && !/^(`{3,}|~{3,})|^(\$\$|%%)$/.test(l)) ?? '') : lines.join(' ');
            const pos = own instanceof ProseText ? doc.posOf(n, own.textStart(0)) : own ? doc.posOf(n, 0) : doc.mdTree.line(n.startLine).to;
            const placeholders = points.some((p) => p >= doc.mdTree.line(n.startLine).from && p <= doc.mdTree.line(n.textLastLine).to);
            return `<li><div class="node${n.persistentNode === current?.persistentNode ? ' current' : ''}${placeholders ? ' placeholders' : ''}" data-pos="${pos}"><span class="kind kind-${n.kind}">${escapeHtml(label(n))}</span><span class="text">${escapeHtml(text) || '<i>empty</i>'}</span><span class="id">#${n.id}</span></div>${list(n.children)}</li>`;
          })
          .join('')}</ul>`;
  panel.innerHTML = list(doc.rootNode.children);
}

// ------------------------------------------------------------------ page

const SAMPLE = `---
title: ourus demo
tags: [demo]
---
# ourus demo

A paragraph at the top level. Headings and list items hold children, and so does a paragraph: the list right after it. The header picks the **flavor** ourus reads this text in, and the **renderer** of the rendered pane.

## Lists

- Tab and Shift-Tab indent and outdent the item at the caret
- Alt-Up and Alt-Down move it among its siblings, children included
  - like this child
  - and this one
    - a grandchild
- Enter splits an item; Backspace at its start joins it to the node above, Delete at its end joins the node below
- Shift-Enter breaks a line inside an item,
  which stays one item
- Home goes to the start of the text, again to the start of the line
- Escape selects the item at the caret with its children; Ctrl-A climbs: the text, the item, its siblings, its parent, everything
- Shift-Down and Shift-Up select a node a press, growing from where they started and shrinking back
- Ctrl-V pastes Markdown as nodes, Ctrl-Shift-V as plain text
- Ctrl-C and Ctrl-X copy and cut the selection as Markdown, at a caret its item with its children
- Enter on an empty item outdents it, or leaves the list (Enter twice ends a list)
- [ ] tasks are items too (GFM and Obsidian)
- [x] done
- [?] Obsidian reads any status

1. ordered lists
2. renumber when they start a nested list

## Sections

Tab on a heading demotes it, together with its section.

### A subsection

Some text: ~~struck~~, ==highlighted==, a #tag, a [[Note#Heading|wikilink]], math $e^{i\\pi} + 1 = 0$, a footnote[^1], a link to https://commonmark.org and a hidden %%comment%%.

\`\`\`js
// code blocks are atoms
const greet = (name) => \`hello, \${name}\`;
\`\`\`

| flavor | tables | callouts |
| --- | :-: | :-: |
| CommonMark | – | – |
| GFM | ✓ | – |
| Obsidian | ✓ | ✓ |

> [!tip] Callouts
> Obsidian's quotes with a type; elsewhere, a quote.

> quotes hold nodes
> - like this item

$$
\\int_0^1 x\\,dx = \\tfrac{1}{2}
$$

[^1]: Footnotes are GFM's (and Obsidian's).
`;

// ------------------------------------------------------------------ rendered panel

/** A renderer set up for a flavor: what it reads the text as, and the HTML it writes for it. */
interface Rendering {
  readonly reads: string;
  /** The document as HTML, raw HTML in it escaped, left out or sanitized. */
  render(doc: OurusDoc): string;
}

interface Renderer {
  readonly name: string;
  setup(flavor: Flavor): Rendering;
}

const FLAVOR_NAMES: Record<Flavor, string> = { commonmark: 'CommonMark', gfm: 'GFM', obsidian: 'Obsidian' };

/** By flavor: nothing, GFM, GFM and math (as each renderer's plugins have it). */
const pick = <T,>(flavor: Flavor, commonmark: T, gfm: T, obsidian: T): T => (flavor === 'commonmark' ? commonmark : flavor === 'gfm' ? gfm : obsidian);

const RENDERERS: Record<string, Renderer> = {
  // from the snapshot's own parse: the blocks are already read, incrementally, as the text changed
  ourus: { name: 'ourus', setup: (flavor) => ({ reads: FLAVOR_NAMES[flavor], render: (doc) => doc.mdTree.renderHtml({ escapeRawHtml: true }) }) },
  commonmark: {
    name: 'commonmark.js',
    setup: () => {
      const reader = new Parser();
      const writer = new HtmlRenderer({ safe: true });
      return { reads: 'CommonMark, its only flavor', render: (doc) => writer.render(reader.parse(doc.text)) };
    },
  },
  'markdown-it': {
    name: 'markdown-it',
    setup: (flavor) => {
      const md = flavor === 'commonmark' ? new MarkdownIt('commonmark', { html: false }) : new MarkdownIt({ html: false, linkify: true }).use(taskLists).use(footnote);
      if (flavor === 'obsidian') md.use(mark);
      return { reads: pick(flavor, "preset 'commonmark'", 'default preset, task lists, footnotes', 'default preset, task lists, footnotes, mark'), render: (doc) => md.render(doc.text) };
    },
  },
  marked: {
    name: 'marked',
    setup: (flavor) => {
      const marked = new Marked({ gfm: flavor !== 'commonmark', renderer: { html: ({ text }) => escapeHtml(text) } });
      return { reads: `gfm: ${flavor !== 'commonmark'}`, render: (doc) => marked.parse(doc.text, { async: false }) };
    },
  },
  micromark: {
    name: 'micromark',
    setup: (flavor) => {
      const extensions = pick(flavor, [], [gfm()], [gfm(), math()]);
      const htmlExtensions = pick(flavor, [], [gfmHtml()], [gfmHtml(), mathHtml({ throwOnError: false })]);
      return { reads: pick(flavor, 'CommonMark', '+ gfm', '+ gfm, math'), render: (doc) => micromark(doc.text, { extensions, htmlExtensions }) };
    },
  },
  remark: {
    name: 'remark',
    setup: (flavor) => {
      const plugins: PluggableList = pick(flavor, [], [remarkGfm], [remarkGfm, remarkMath]);
      const processor = unified().use(remarkParse).use(plugins).use(remarkRehype).use(rehypeStringify);
      return { reads: pick(flavor, 'CommonMark', '+ remark-gfm', '+ remark-gfm, remark-math'), render: (doc) => String(processor.processSync(doc.text)) };
    },
  },
  showdown: {
    name: 'showdown',
    setup: (flavor) => {
      const converter = new showdown.Converter();
      converter.setFlavor(flavor === 'commonmark' ? 'vanilla' : 'github');
      return { reads: `flavor '${flavor === 'commonmark' ? 'vanilla' : 'github'}'`, render: (doc) => DOMPurify.sanitize(converter.makeHtml(doc.text)) };
    },
  },
};

const setups = new Map<string, Rendering>();
function rendering(key: string, flavor: Flavor): Rendering {
  let r = setups.get(`${key} ${flavor}`);
  if (!r) setups.set(`${key} ${flavor}`, (r = (RENDERERS[key] ?? RENDERERS.ourus!).setup(flavor)));
  return r;
}

/**
 * Math typeset and code highlighted, as the renderers mark them: `math-inline` / `math-display` /
 * `math-block` (ourus, micromark, remark's `code.language-math`) and `language-*` code.
 */
function decorate(pane: HTMLElement): void {
  for (const el of pane.querySelectorAll<HTMLElement>('.math-inline, .math-display, .math-block, code.language-math')) {
    if (el.querySelector('.katex')) continue; // typeset by the renderer
    const target = el.matches('code') && el.parentElement?.tagName === 'PRE' ? el.parentElement : el;
    const out = document.createElement(target.tagName === 'DIV' || target.tagName === 'PRE' ? 'div' : 'span');
    katex.render(el.textContent ?? '', out, { displayMode: el.matches('.math-display, .math-block'), throwOnError: false });
    target.replaceWith(out);
  }
  for (const el of pane.querySelectorAll<HTMLElement>('pre code[class*="language-"]')) {
    const language = /language-(\S+)/.exec(el.className)![1]!;
    if (hljs.getLanguage(language)) hljs.highlightElement(el);
  }
}

function main(): void {
  const panel = document.getElementById('outline')!;
  const previewPane = document.getElementById('preview-pane')!;
  const preview = document.getElementById('preview')!;
  const previewTitle = document.getElementById('preview-title')!;
  const flavorSelect = document.getElementById('flavor') as HTMLSelectElement;
  const rendererSelect = document.getElementById('renderer') as HTMLSelectElement;
  flavorSelect.value = initialFlavor;
  /** What the pane shows: the snapshot and renderer it was rendered from. */
  let rendered: { doc: OurusDoc; renderer: Rendering } | null = null;
  const status = document.getElementById('status')!;
  const stats = document.getElementById('stats')!;

  // on narrow screens the status is a notification, for a few seconds; none for a key left to
  // CodeMirror (most typing), which hides the last one
  let hideStatus = 0;
  onResult = (type, result) => {
    status.className = result.status;
    status.textContent =
      result.status === 'rejected'
        ? `${type}: rejected — ${result.reason}${result.detail && result.reason !== 'write-failed' ? ` (${result.detail.replace(/\.$/, '')})` : ''}`
        : `${type}: ${result.status === 'applied' ? 'applied' : 'not applicable (editor default)'}`;
    clearTimeout(hideStatus);
    if (result.status === 'deferredToHost') return;
    status.classList.add('shown');
    hideStatus = window.setTimeout(() => status.classList.remove('shown'), 3000);
  };

  let frame = 0;
  // the pane follows the editor scrolled by hand; when the editor scrolls to its caret, the pane only keeps its own in view
  let byHand = true;
  const refresh = (view: EditorView) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const doc = view.state.field(ourusDoc);
      renderOutline(panel, doc, nodeAt(doc, view.state.selection.main.head));
      stats.textContent = `${doc.lineCount} lines · ${countNodes(doc.rootNode)} nodes · ${FLAVOR_NAMES[doc.config.flavor]}`;
      // the renderer 'none': the pane hidden, nothing rendered
      previewPane.hidden = rendererSelect.value === 'none';
      if (previewPane.hidden) return;
      const renderer = rendering(rendererSelect.value, doc.config.flavor);
      // an external renderer reads the text alone; ours, the snapshot's parse
      if (!rendered || rendered.renderer !== renderer || rendered.doc.mdTree !== doc.mdTree) {
        const t0 = performance.now();
        preview.innerHTML = renderer.render(doc);
        const ms = performance.now() - t0;
        decorate(preview);
        mirror.realign(doc.text);
        const name = RENDERERS[rendererSelect.value]?.name ?? 'ourus';
        // 'micromark + gfm, math', 'marked (gfm: true)'
        const reads = renderer.reads.startsWith('+') ? ` ${renderer.reads}` : ` (${renderer.reads})`;
        previewTitle.textContent = `Rendered · ${name}${reads} · ${ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`;
        rendered = { doc, renderer };
      }
      mirror.draw();
      mirror.reveal();
    });
  };

  const view = new EditorView({
    parent: document.getElementById('editor')!,
    state: EditorState.create({
      doc: SAMPLE,
      extensions: [
        outlinerKeymap,
        typingHandler,
        pasteHandler,
        basicSetup,
        markdown({ base: markdownLanguage }),
        ourusDoc,
        outlineView({ field: ourusDoc, setDoc, planned }),
        placeholderHistory,
        currentNode,
        blockSelection,
        escalation.of(escalateDrags),
        theme.of(themeFor(darkScheme.matches)),
        EditorView.lineWrapping,
        EditorView.updateListener.of((u) => {
          if (u.docChanged || u.selectionSet || u.focusChanged) refresh(u.view);
          if (u.transactions.some((tr) => tr.scrollIntoView)) byHand = false;
          // a placeholder the caret has left is settled: dropped, or removed when the
          // text can't hold it (an empty item right after its parent's text)
          if (u.selectionSet && !u.view.composing) {
            const state = u.state;
            const left = u.startState.selection.main;
            queueMicrotask(() => {
              if (u.view.state !== state) return;
              const r = settlePlaceholders(state.field(ourusDoc), state.selection.main.head);
              if (!r) return;
              const to = state.selection.main;
              // the spec joins this edit to the step before it (undo.md's Undo3); CodeMirror's history
              // joins nothing to an event once the selection has moved after it, which is what
              // triggers this, so here leaving is an undo step of its own. History keeps the selection
              // before a step, so the caret goes back onto the placeholder first, outside history, and
              // undo returns there
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
  const mirror = new Mirror(view, previewPane, preview);
  darkScheme.addEventListener('change', (e) => view.dispatch({ effects: theme.reconfigure(themeFor(e.matches)) }));
  for (const type of ['wheel', 'mousedown', 'touchstart']) view.scrollDOM.addEventListener(type, () => (byHand = true), { passive: true });
  view.scrollDOM.addEventListener('scroll', () => byHand && !previewPane.hidden && mirror.scroll());
  // the pane's layout changes as it's resized, and as KaTeX's fonts arrive
  new ResizeObserver(() => refresh(view)).observe(preview);
  refresh(view);

  // the flavor: the text read again, keeping its placeholders (node ids start over)
  flavorSelect.addEventListener('change', () => {
    initialFlavor = flavorSelect.value as Flavor;
    const doc = view.state.field(ourusDoc);
    const next = OurusDoc.parse(doc.text, { marks: doc.marks.marks, config: { ...doc.config, flavor: initialFlavor } });
    view.dispatch({ effects: setDoc.of(next) });
    refresh(view);
    view.focus();
  });
  // drags selecting whole nodes where they reach past a node's text
  const escalateToggle = document.getElementById('escalate') as HTMLInputElement;
  escalateToggle.addEventListener('change', () => {
    view.dispatch({ effects: escalation.reconfigure(escalateToggle.checked ? escalateDrags : []) });
    view.focus();
  });
  rendererSelect.addEventListener('change', () => {
    refresh(view);
    view.focus();
  });
  // links in the preview go nowhere but to its own anchors (footnotes)
  preview.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a');
    if (!a) return;
    const href = a.getAttribute('href') ?? '';
    e.preventDefault();
    if (href.startsWith('#')) preview.querySelector(`[id="${CSS.escape(decodeURIComponent(href.slice(1)))}"]`)?.scrollIntoView({ block: 'nearest' });
  });

  panel.addEventListener('mousedown', (e) => {
    const el = (e.target as HTMLElement).closest('[data-pos]');
    if (!el) return;
    e.preventDefault();
    const pos = Number(el.getAttribute('data-pos'));
    view.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
    view.focus();
  });

  // buttons for the keys touch keyboards lack; pressing one leaves the focus (and the keyboard) in the editor
  const keys = document.getElementById('keys')!;
  for (const button of keys.querySelectorAll('button')) {
    button.addEventListener('mousedown', (e) => e.preventDefault());
    button.addEventListener('click', () => {
      const { history } = button.dataset;
      if (history) (history === 'redo' ? redo : undo)(view);
      else command(button.dataset.command as Command['type'])(view);
    });
    // pressed, as :active isn't on touch screens (iOS) or sticks (Chrome)
    button.addEventListener('pointerdown', () => button.classList.add('pressed'));
    for (const type of ['pointerup', 'pointercancel', 'pointerleave']) button.addEventListener(type, () => button.classList.remove('pressed'));
  }
  // iOS leaves the page under its keyboard (Android shrinks it): the bar stays at the bottom of what's visible
  const viewport = window.visualViewport;
  const lift = () => (keys.style.bottom = `${Math.max(0, innerHeight - viewport!.height - viewport!.offsetTop)}px`);
  viewport?.addEventListener('resize', lift);
  viewport?.addEventListener('scroll', lift);

  // a handle for scripted checks
  (window as unknown as { ourusDemo: unknown }).ourusDemo = {
    view,
    text: () => view.state.doc.toString(),
    // a new document: no folds, no zoom, as a reload has
    setText: (text: string, caret = 0) => {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text }, selection: { anchor: caret } });
      view.dispatch({ effects: setDoc.of(view.state.field(ourusDoc).withFolded([]).withZoom(null)) });
    },
    doc: () => view.state.field(ourusDoc),
  };
  view.focus();
}

main();

