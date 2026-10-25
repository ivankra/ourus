// The check: whether a document reads as a draft meant, node by node. A node the
// document shares with the draft is equal by construction and skipped with its subtree; elsewhere the
// contract, exactly: kinds and nesting, ids, each text's type, its frame's meaning and its text, its
// placeholders, gaps, and the lists `done()` fixed.

import { ProseText, AtomText, type OutlineNode, type OutlineNodeText, type OutlineNodePersistent, type OurusDoc } from '../doc/index.ts';
import type { ListPlace, OurusDraft } from './draft.ts';
import { isEmptyNodePlaceholder, isPlaceholder } from '../text/index.ts';

/** Where `doc` doesn't read as `draft` (done) meant, or null where it does. */
export function differenceFrom(doc: OurusDoc, draft: OurusDraft): string | null {
  return node(doc, draft, draft.root, draft.from.rootNode, doc.rootNode, 'root');
}

function node(doc: OurusDoc, draft: OurusDraft, expected: OutlineNodePersistent, origin: OutlineNode | null, actual: OutlineNode, at: string): string | null {
  if (expected === actual.persistentNode) return null;
  if (expected.kind !== actual.kind) return `${at}: a ${expected.kind}, read as a ${actual.kind}`;
  if (expected.id !== actual.id) return `${at}: id ${expected.id}, read as ${actual.id}`;
  if (expected.gap !== actual.gap) return `${at}: ${expected.gap} blank lines after its text, read as ${actual.gap}`;
  const text = texts(draft.textOf(expected, origin), doc.textOf(actual));
  if (text) return `${at}: ${text}`;
  const list = draft.lists.get(expected.id);
  if (list && expected.kind === 'item') {
    const read = listPlace(doc, actual);
    if (read.start !== list.start || read.type !== list.type || read.marker !== list.marker || (list.number !== null && read.number !== list.number)) {
      return `${at}: list ${JSON.stringify(list)}, read as ${JSON.stringify(read)}`;
    }
  }
  const n = expected.children.length;
  if (n !== actual.children.length) return `${at}: ${n} children, read as ${actual.children.length}`;
  for (let i = 0; i < n; i++) {
    const child = expected.children[i]!;
    // a read node under a read node is its own child in `from`; under a drafted one, where the draft says
    const childOrigin = expected.read && origin?.persistentNode === expected ? origin.child(i) : draft.originOf(child);
    const d = node(doc, draft, child, childOrigin, actual.child(i), `${at} › ${i}`);
    if (d) return d;
  }
  return null;
}

/** Where two texts differ in what the check compares, or null. */
function texts(want: OutlineNodeText | null, got: OutlineNodeText | null): string | null {
  if (!want || !got) return want === got ? null : want ? 'its text missing' : `a text ${JSON.stringify(got!.text)} it shouldn't have`;
  if (want instanceof ProseText !== got instanceof ProseText || want.type !== got.type) return `a ${want.type} text, read as a ${got.type} one`;
  if (want.body !== got.body) return `text ${JSON.stringify(want.body)}, read as ${JSON.stringify(got.body)}`;
  if (want instanceof ProseText && got instanceof ProseText) {
    const w = JSON.stringify([want.task, want.heading?.level, want.callout]);
    const g = JSON.stringify([got.task, got.heading?.level, got.callout]);
    if (w !== g) return `frame ${w}, read as ${g}`;
  } else if (want instanceof AtomText && got instanceof AtomText) {
    const w = JSON.stringify([want.fence?.[0] ?? null, want.info, want.closed]);
    const g = JSON.stringify([got.fence?.[0] ?? null, got.info, got.closed]);
    if (w !== g) return `frame ${w}, read as ${g}`;
  }
  const wp = placeholders(want);
  const gp = placeholders(got);
  return wp === gp ? null : `placeholders ${wp}, read as ${gp}`;
}

/** A text's placeholders, by kind and offset in its text without its frame. */
function placeholders(text: OutlineNodeText): string {
  const frame = text instanceof ProseText ? text.frame : [];
  const offset = (at: number): number => at - frame.filter((p) => p.to <= at).reduce((n, p) => n + p.to - p.from, 0);
  return text.marks.marks
    .filter(isPlaceholder)
    .map((m) => `${isEmptyNodePlaceholder(m, text.text) ? 'empty-node' : 'held-space'}@${offset(m.from)}`)
    .join(',');
}

/** Where item `item` of `doc` is in its list, as the parser reads it. */
function listPlace(doc: OurusDoc, item: OutlineNode): ListPlace {
  const list = item.block.attrs.list;
  const type = list?.type === 'ordered' ? 'ordered' : 'bullet';
  return {
    start: doc.listOf(item)?.block.children[0] === item.block,
    type,
    marker: type === 'ordered' ? (list?.delimiter ?? '.') : (list?.bulletChar ?? '-'),
    number: type === 'ordered' ? parseInt(doc.markerOf(item), 10) : null,
  };
}
