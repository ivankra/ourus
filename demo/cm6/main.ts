// A minimal CodeMirror 6 outliner on top of ourus.
//
// The ourus snapshot lives in a StateField. Structural keys run ourus commands and dispatch
// the changes they return, with the planned snapshot attached so it isn't parsed again.
// Every other edit (typing, paste, undo) goes through OutlineDoc.apply, with the caret, so an edit that
// empties a node keeps it as a placeholder. The history keeps each step's placeholders, so undo
// and redo bring them back.
//
// The header picks the flavor ourus reads the text in, and the renderer of the middle pane: ourus's
// own (from the snapshot's parse) or a popular external one, set up for the flavor as far as it goes.
// Code blocks are highlighted (highlight.js) and math typeset (KaTeX) after any renderer.

import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { cursorLineDown, cursorLineUp, invertedEffects, selectLineDown, selectLineUp } from '@codemirror/commands';
import { Annotation, EditorSelection, EditorState, Prec, RangeSetBuilder, StateEffect, StateField, Transaction } from '@codemirror/state';
import { Decoration, EditorView, keymap, ViewPlugin, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import { basicSetup } from 'codemirror';
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
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';
import { OutlineDoc, execute, homePosition, mapPos, renderHtml, settle, textStart, type Config, type TextChange, type Command, type OutlineNode, type Result } from '../../src/index.ts';

type Flavor = Config['flavor'];

/** The flavor a new editor reads its text in; the header's select changes it. */
let initialFlavor: Flavor = 'obsidian';

/** The snapshot an ourus command planned, attached to the transaction that applies it. */
const planned = Annotation.define<OutlineDoc>();
/** Replaces the snapshot outright (settling placeholders can change no text at all). */
const setDoc = StateEffect.define<OutlineDoc>();
/** The placeholders a step of history returns to (positions in the text after the step), mapped along later edits. */
const setPlaceholders = StateEffect.define<readonly number[]>({ map: (value, mapping) => value.map((pos) => mapping.mapPos(pos, 1)) });

const ourusDoc = StateField.define<OutlineDoc>({
  create: (state) => OutlineDoc.parse(state.doc.toString(), { config: { flavor: initialFlavor } }),
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
      if (u.docChanged || u.selectionSet || u.startState.field(ourusDoc) !== u.state.field(ourusDoc)) this.decorations = this.build(u.view);
    }
    build(view: EditorView): DecorationSet {
      const doc = view.state.field(ourusDoc);
      const node = doc.nodeAt(view.state.selection.main.head);
      const builder = new RangeSetBuilder<Decoration>();
      if (!node) return builder.finish();
      for (let l = node.startLine; l <= node.endLine; l++) {
        const line = doc.line(l);
        builder.add(line.from, line.from, Decoration.line({ class: l <= node.headEndLine ? 'ourus-head' : 'ourus-subtree' }));
      }
      return builder.finish();
    }
  },
  { decorations: (v) => v.decorations },
);

// ------------------------------------------------------------------ outline panel

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const ATOM_LABELS: Record<string, string> = { thematic_break: 'hr', footnote_definition: 'note', refdef: 'ref' };

/** A node's kind as the outline shows it: tasks, callouts and atoms as the flavor reads them. */
function label(n: OutlineNode): string {
  if (n.kind === 'heading') return `H${n.head!.level}`;
  if (n.kind === 'item') return n.block.task ? (n.block.task.checked ? '☑' : '☐') : n.block.list!.type === 'ordered' ? '1.' : '•';
  if (n.kind === 'paragraph') return '¶';
  if (n.kind === 'quote') return n.block.callout ? n.block.callout.kind : 'quote';
  return ATOM_LABELS[n.block.type] ?? n.block.type.replace('_block', '');
}

function renderOutline(panel: HTMLElement, doc: OutlineDoc, current: OutlineNode | null): void {
  const list = (nodes: readonly OutlineNode[]): string =>
    nodes.length === 0
      ? ''
      : `<ul>${nodes
          .map((n) => {
            const lines = doc.headLines(n).map((l) => l.trim());
            // an atom shows its first line of content: past a fence, without quote markers
            const text = n.kind === 'atom' ? (lines.find((l) => l !== '' && !/^(`{3,}|~{3,})|^(\$\$|%%)$/.test(l)) ?? '').replace(/^>\s?/, '') : lines.join(' ');
            const range = doc.headRange(n);
            const pos = range ? range.from : doc.line(n.startLine).to;
            const placeholders = doc.placeholders.some((p) => p >= doc.line(n.startLine).from && p <= doc.line(n.headEndLine).to);
            return `<li><div class="node${n === current ? ' current' : ''}${placeholders ? ' placeholders' : ''}" data-pos="${pos}"><span class="kind kind-${n.kind}">${escapeHtml(label(n))}</span><span class="text">${escapeHtml(text) || '<i>empty</i>'}</span><span class="id">#${n.id}</span></div>${list(n.children)}</li>`;
          })
          .join('')}</ul>`;
  panel.innerHTML = list(doc.outline.children);
}

// ------------------------------------------------------------------ page

const SAMPLE = `---
title: ourus demo
tags: [demo]
---
# ourus demo

A paragraph at the top level. Paragraphs are leaves; list items and headings hold children. The header picks the **flavor** ourus reads this text in, and the **renderer** of the middle pane.

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
  render(doc: OutlineDoc): string;
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
  ourus: { name: 'ourus', setup: (flavor) => ({ reads: FLAVOR_NAMES[flavor], render: (doc) => renderHtml(doc.syntax, { escapeRawHtml: true }) }) },
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
  const preview = document.getElementById('preview')!;
  const previewTitle = document.getElementById('preview-title')!;
  const flavorSelect = document.getElementById('flavor') as HTMLSelectElement;
  const rendererSelect = document.getElementById('renderer') as HTMLSelectElement;
  flavorSelect.value = initialFlavor;
  /** What the pane shows: the snapshot and renderer it was rendered from. */
  let rendered: { doc: OutlineDoc; renderer: Rendering } | null = null;
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
      const renderer = rendering(rendererSelect.value, doc.config.flavor);
      // an external renderer reads the text alone; ours, the snapshot's parse
      if (!rendered || rendered.renderer !== renderer || rendered.doc.syntax !== doc.syntax) {
        const t0 = performance.now();
        preview.innerHTML = renderer.render(doc);
        const ms = performance.now() - t0;
        decorate(preview);
        const name = RENDERERS[rendererSelect.value]?.name ?? 'ourus';
        previewTitle.textContent = `Rendered · ${name} · ${renderer.reads} · ${ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`;
        rendered = { doc, renderer };
      }
      stats.textContent = `${doc.syntax.lineCount} lines · ${doc.nodes.length - 1} nodes · ${FLAVOR_NAMES[doc.config.flavor]}`;
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
        markdown({ base: markdownLanguage }),
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

  // the flavor: the text read again, keeping its placeholders (node ids start over)
  flavorSelect.addEventListener('change', () => {
    initialFlavor = flavorSelect.value as Flavor;
    const doc = view.state.field(ourusDoc);
    const next = OutlineDoc.parse(doc.text, { placeholders: doc.placeholders, config: { ...doc.config, flavor: initialFlavor } });
    view.dispatch({ effects: setDoc.of(next) });
    refresh(view);
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

