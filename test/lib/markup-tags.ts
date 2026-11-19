// The tags a case gets from what it does, never written in the spec: where a step is at markup an
// editor may hold as text or as a block's attribute, at which ourus has a boundary (spec/README.md,
// "tags"). A block app whose blocks hold that markup as their text, or as a property, has no such
// boundary to compare, and its driver refuses the tag (`Driver.refuses`).

import { OurusAtom, OurusProse, type OurusDoc, type OurusText } from '../../src/doc/index.ts';
import { textStart } from '../../src/doc/text.ts';
import type { OurusView } from '../../src/view/index.ts';
import { playActions } from './action-player.ts';
import { specTestFlavors, specTestStart } from './spec-runner.ts';
import type { SpecTest } from './spec-reader.ts';

export const MARKUP_TAGS = ['markup-heading', 'markup-task', 'markup-fence'] as const;
export type MarkupTag = (typeof MARKUP_TAGS)[number];

const FENCED = new Set(['fenced_code', 'math_block', 'comment_block']);
const BACKWARD = new Set([
  'deleteContentBackward',
  'deleteWordBackward',
  'deleteSoftLineBackward',
  'deleteHardLineBackward',
]);
const FORWARD = new Set([
  'deleteContentForward',
  'deleteWordForward',
  'deleteSoftLineForward',
  'deleteHardLineForward',
]);
const TO_LINE_START = new Set(['deleteSoftLineBackward', 'deleteHardLineBackward']);

/** The tag of the markup `text` has: a heading's `#`s or underline, a task's checkbox, a fenced block's fences. */
function tagOf(text: OurusText | null | undefined): MarkupTag | null {
  if (text instanceof OurusAtom) return FENCED.has(text.type) && text.delimiters ? 'markup-fence' : null;
  if (!(text instanceof OurusProse)) return null;
  if (text.frame.some((p) => p.part === 'task')) return 'markup-task';
  if (text.frame.some((p) => p.part === 'heading' || p.part === 'close' || p.part === 'underline'))
    return 'markup-heading';
  return null;
}

/** Whether `pos`'s line is a fence's: a fenced block's opening or closing one, a `$$` or `%%` line. */
export function onFenceLine(doc: OurusDoc, pos: number): boolean {
  const line = doc.lineAt(pos);
  const node = doc.nodeAtLine(line.index);
  const text = node && doc.textOf(node);
  const fences = text instanceof OurusAtom && FENCED.has(text.type) ? text.delimiters : null;
  if (!node || !fences) return false;
  const on = (offset: number): boolean => doc.lineAt(doc.posOf(node, offset)).index === line.index;
  return on(fences.open.from) || (!!fences.close && on(fences.close.from));
}

/** At `pos`: the tag of the text's markup, and whether `pos` is in that markup, at the text's start, or in an empty text. */
function markupAt(
  view: OurusView,
  pos: number,
): { tag: MarkupTag | null; inMarkup: boolean; atStart: boolean; empty: boolean } {
  const at = view.locate(pos);
  if (!('text' in at) || at.zone === 'blockIdLine' || !(at.text instanceof OurusProse))
    return { tag: null, inMarkup: false, atStart: false, empty: false };
  const inMarkup = at.zone === 'frame' && ['task', 'heading', 'close', 'underline'].includes(at.part);
  return { tag: tagOf(at.text), inMarkup, atStart: at.offset === textStart(at.text), empty: at.text.empty };
}

/** The fences of the fenced block the caret is in, as written; null outside one. */
function fencesAtCaret(view: OurusView): string | null {
  const at = view.locate(view.selection.head);
  if (!('text' in at) || !(at.text instanceof OurusAtom) || !FENCED.has(at.text.type) || !at.text.delimiters)
    return null;
  const { open, close } = at.text.delimiters;
  return `${at.text.text.slice(open.from, open.to)}|${close ? at.text.text.slice(close.from, close.to) : ''}`;
}

/**
 * The text next to `pos`'s line, past blank lines, below (`1`) or above (`-1`): the tag of its markup,
 * whether that line is a fence's, and whether the text is empty; null at the document's edge.
 */
function nextText(
  doc: OurusDoc,
  pos: number,
  dir: 1 | -1,
): { tag: MarkupTag | null; fence: boolean; empty: boolean } | null {
  let line = doc.lineAt(pos);
  for (;;) {
    if (dir === 1 ? line.to + 1 > doc.text.length : line.from === 0) return null;
    line = doc.lineAt(dir === 1 ? line.to + 1 : line.from - 1);
    const node = doc.nodeAtLine(line.index);
    if (!node) continue;
    const text = doc.textOf(node);
    return { tag: tagOf(text), fence: onFenceLine(doc, line.from), empty: text instanceof OurusProse && text.empty };
  }
}

/** The markup tags of one action, played from `view` to `after`. */
function actionTags(view: OurusView, action: string, after: OurusView, tags: Set<MarkupTag>): void {
  const doc = view.doc;
  const { anchor, head } = view.selection;
  const collapsed = anchor === head;
  // the caret or the selection's ends: in a heading's or a task's markup, at its text's start, in an
  // empty one; on a fence's line
  for (const pos of new Set([anchor, head])) {
    const at = markupAt(view, pos);
    if (at.tag && (at.inMarkup || at.atStart || at.empty)) tags.add(at.tag);
    if (onFenceLine(doc, pos)) tags.add('markup-fence');
  }
  // a selection over some text's markup
  if (!collapsed) {
    const [from, to] = [Math.min(anchor, head), Math.max(anchor, head)];
    for (let l = doc.lineAt(from).index; l <= doc.lineAt(to).index; l++) {
      const node = doc.nodeAtLine(l);
      const text = node && doc.textOf(node);
      const tag = tagOf(text);
      if (tag && node && text!.frame.some((p) => doc.posOf(node, p.from, 1) >= from && doc.posOf(node, p.from, 1) < to))
        tags.add(tag);
    }
  }
  if (collapsed) {
    const line = doc.lineAt(head);
    // a join bringing up the text below, its markup with it: a heading, a task, code, a fence's line
    if (FORWARD.has(action) && head === line.to) {
      const below = nextText(doc, head, 1);
      if (below?.tag) tags.add(below.tag);
      if (below?.fence) tags.add('markup-fence');
    }
    // a join into the text above: into code or a fence's line, or right after an empty task's checkbox
    // or an empty heading's `#`s
    if (BACKWARD.has(action) && (head === line.from || markupAt(view, head).atStart)) {
      const above = nextText(doc, head, -1);
      if (above?.tag === 'markup-fence' || above?.fence) tags.add('markup-fence');
      if (above?.tag && above.tag !== 'markup-fence' && above.empty) tags.add(above.tag);
    }
    // Cmd-Backspace, up to a checkbox or `#`s
    if (TO_LINE_START.has(action)) {
      const at = markupAt(view, head);
      if (at.tag && at.tag !== 'markup-fence') tags.add(at.tag);
    }
  }
  // the caret after it: on a fence's line, in a heading's or a task's markup, in an empty one
  const end = after.selection.head;
  if (onFenceLine(after.doc, end)) tags.add('markup-fence');
  const at = markupAt(after, end);
  if (at.tag && (at.inMarkup || at.empty)) tags.add(at.tag);
  // fences typed or split into being, or a step changing the fences of the block the caret is in
  // (that grow past a run of backticks in the code)
  if (!/^(?:cursor|select)/.test(action)) {
    const [was, is] = [fencesAtCaret(view), fencesAtCaret(after)];
    if (is !== null && is !== was && (was !== null || /^"|^enter$|^shiftEnter$/.test(action))) tags.add('markup-fence');
  }
}

const computed = new WeakMap<SpecTest, readonly MarkupTag[]>();

/** The markup tags of case `t`, as ourus plays it in its first flavor; none where it can't be played. */
export function markupTags(t: SpecTest): readonly MarkupTag[] {
  let tags = computed.get(t);
  if (tags) return tags;
  const found = new Set<MarkupTag>();
  try {
    let state = specTestStart(t, specTestFlavors(t)[0]!);
    for (const action of t.steps.flatMap((s) => s.actions)) {
      const next = playActions(state, [action]);
      actionTags(state.view, action, next.view, found);
      state = next;
    }
  } catch {
    // (a case that doesn't play is no case of its markup)
  }
  tags = MARKUP_TAGS.filter((tag) => found.has(tag));
  computed.set(t, tags);
  return tags;
}

/** Every tag of case `t`: those the spec writes, and its markup tags. */
export const caseTags = (t: SpecTest): readonly string[] => [...t.tags, ...markupTags(t)];
