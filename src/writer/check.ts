// The check: whether a document reads as a draft meant, node by node. A node the
// document shares with the draft is equal by construction and skipped with its subtree; elsewhere the
// contract, exactly: kinds and nesting, ids, each text's type, its frame's meaning and its text, a
// verbatim block's code as it reads (kept, or edited, against the old context's reading), its block
// ids, its placeholders, gaps, and the lists `done()` fixed.

import { OurusProse, OurusAtom, blockIdsOf, verbatimLinesOf, type OurusNode, type OurusText, type PersistentNode, type OurusDoc } from '../doc/index.ts';
import type { ListPlace, NormalizedDraft } from './normalized.ts';

/**
 * Where a document doesn't read as a draft meant, as data: the node's `path` (`root › 0 › 1`), what of it
 * differs (`code`), and the two values, as text; `describeDifference` makes the sentence of them.
 */
export interface ReadbackDifference {
  readonly path: string;
  readonly code: 'kind' | 'id' | 'gap' | 'text-missing' | 'text-extra' | 'block-ids' | 'text-type' | 'text' | 'frame' | 'placeholders' | 'code' | 'list' | 'children';
  readonly expected: string;
  readonly actual: string;
}

/** `d` as a sentence: `root › 0: text "a", read as "b"`. */
export function describeDifference(d: ReadbackDifference): string {
  const { expected: e, actual: a } = d;
  const what =
    d.code === 'kind' ? `a ${e}, read as a ${a}`
    : d.code === 'gap' ? `${e} blank lines after its text, read as ${a}`
    : d.code === 'children' ? `${e} children, read as ${a}`
    : d.code === 'text-type' ? `a ${e} text, read as a ${a} one`
    : d.code === 'text-missing' ? 'its text missing'
    : d.code === 'text-extra' ? `a text ${a} it shouldn't have`
    : `${d.code === 'block-ids' ? 'block ids' : d.code} ${e}, read as ${a}`;
  return `${d.path}: ${what}`;
}

/** Where `doc` doesn't read as `draft` (done) meant, or null where it does. */
export function differenceFrom(doc: OurusDoc, draft: NormalizedDraft): ReadbackDifference | null {
  return node(doc, draft, draft.root, draft.from.rootNode, doc.rootNode, 'root');
}

/** A difference at `path`. */
const differs = (path: string, code: ReadbackDifference['code'], expected: unknown, actual: unknown): ReadbackDifference => ({ path, code, expected: String(expected), actual: String(actual) });

function node(doc: OurusDoc, draft: NormalizedDraft, expected: PersistentNode, origin: OurusNode | null, actual: OurusNode, at: string): ReadbackDifference | null {
  if (expected === actual.persistentNode) return null;
  if (expected.kind !== actual.kind) return differs(at, 'kind', expected.kind, actual.kind);
  if (expected.id !== actual.id) return differs(at, 'id', expected.id, actual.id);
  if (expected.gap !== actual.gap) return differs(at, 'gap', expected.gap, actual.gap);
  const want = draft.textOf(expected, origin);
  const text = texts(want, doc.textOf(actual));
  if (text) return { ...text, path: at };
  // (a verbatim block whose lines the draft kept, its body and its count of lines, moved, re-indented or
  // its fence respelled: its lines as read where it was, against as read where it is; the same spelling
  // at another column, or under a fence indented otherwise, can be other code, a tab-led line under a
  // fence indented one space: B294. A line added or taken, Enter in it, is an edit, checked as text)
  const had = origin && draft.from.textOf(origin);
  const lines = (t: OurusText): number => t.text.split('\n').length;
  if (origin && had && want && want.type === had.type && want.body === had.body && lines(want) === lines(had)) {
    const was = verbatimLinesOf(draft.from, origin);
    if (was) {
      const now = verbatimLinesOf(doc, actual);
      if (JSON.stringify(now) !== JSON.stringify(was)) return differs(at, 'code', JSON.stringify(was), JSON.stringify(now));
    }
  } else if (origin && had instanceof OurusAtom && want instanceof OurusAtom && verbatimLinesOf(draft.from, origin)) {
    // (code the draft edited: its text as the edit leaves it, read where the block was, at its old
    // column, against as read where it is: the edit is stated in the old context, which a move or a
    // re-indentation with it may change, a tab-led line under it then other code; read both in the new
    // context, it would compare the new reading with itself. Code made anew means what it spells)
    const pieces = draft.from.mdTree.line(origin.startLine).prefix;
    const meant = draft.from.verbatimLinesAt(want, pieces.length ? pieces[pieces.length - 1]!.toColumn : 0);
    const now = verbatimLinesOf(doc, actual);
    if (meant && now && JSON.stringify(now) !== JSON.stringify(meant)) return differs(at, 'code', JSON.stringify(meant), JSON.stringify(now));
  }
  const list = draft.lists.get(expected.id);
  if (list && expected.kind === 'item') {
    const read = listPlace(doc, actual);
    if (read.start !== list.start || read.type !== list.type || read.marker !== list.marker || (list.number !== null && read.number !== list.number)) {
      return differs(at, 'list', JSON.stringify(list), JSON.stringify(read));
    }
  }
  const n = expected.children.length;
  if (n !== actual.children.length) return differs(at, 'children', n, actual.children.length);
  for (let i = 0; i < n; i++) {
    const child = expected.children[i]!;
    // a read node under a read node is its own child in `from`; under a drafted one, where the draft says
    const childOrigin = expected.read && origin?.persistentNode === expected ? origin.child(i) : draft.originOf(child);
    const d = node(doc, draft, child, childOrigin, actual.child(i), `${at} › ${i}`);
    if (d) return d;
  }
  return null;
}

/** Where two texts differ in what the check compares, or null (its path the node's, set by the caller). */
function texts(want: OurusText | null, got: OurusText | null): ReadbackDifference | null {
  if (!want || !got) return want === got ? null : want ? differs('', 'text-missing', '', '') : differs('', 'text-extra', '', JSON.stringify(got!.text));
  // (a text a command made from nothing, read in the document's flavor as the text written is)
  if (want instanceof OurusProse && got instanceof OurusProse) want = want.withBlockIds(got.blockIds);
  const wb = JSON.stringify(blockIdsOf(want).map((b) => [b.name, b.carried]));
  const gb = JSON.stringify(blockIdsOf(got).map((b) => [b.name, b.carried]));
  if (wb !== gb) return differs('', 'block-ids', wb, gb);
  if (want instanceof OurusProse !== got instanceof OurusProse || want.type !== got.type) return differs('', 'text-type', want.type, got.type);
  if (want.body !== got.body) return differs('', 'text', JSON.stringify(want.body), JSON.stringify(got.body));
  if (want instanceof OurusProse && got instanceof OurusProse) {
    const w = JSON.stringify([want.task, want.heading?.level, want.callout]);
    const g = JSON.stringify([got.task, got.heading?.level, got.callout]);
    if (w !== g) return differs('', 'frame', w, g);
  } else if (want instanceof OurusAtom && got instanceof OurusAtom) {
    const w = JSON.stringify([want.fence?.[0] ?? null, want.info, want.closed]);
    const g = JSON.stringify([got.fence?.[0] ?? null, got.info, got.closed]);
    if (w !== g) return differs('', 'frame', w, g);
  }
  const wp = placeholders(want);
  const gp = placeholders(got);
  return wp === gp ? null : differs('', 'placeholders', wp, gp);
}

/** A text's placeholders, by kind and offset in its text without its frame. */
function placeholders(text: OurusText): string {
  const frame = text instanceof OurusProse ? text.frame : [];
  const offset = (at: number): number => at - frame.filter((p) => p.to <= at).reduce((n, p) => n + p.to - p.from, 0);
  return text.marks.placeholders.map((pos) => `${text.marks.hasEmptyNodeAt(pos) ? 'empty-node' : 'held-space'}@${offset(pos)}`).join(',');
}

/** Where item `item` of `doc` is in its list, as the parser reads it. */
function listPlace(doc: OurusDoc, item: OurusNode): ListPlace {
  const list = item.block.attrs.list;
  const type = list?.type === 'ordered' ? 'ordered' : 'bullet';
  return {
    start: doc.listOf(item)?.block.children[0] === item.block,
    type,
    marker: type === 'ordered' ? (list?.delimiter ?? '.') : (list?.bulletChar ?? '-'),
    number: type === 'ordered' ? parseInt(doc.markerOf(item), 10) : null,
  };
}
