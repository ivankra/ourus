// Reading a selection as subtrees (dev/22-select.md §4.2): `touchedSubtrees`, `selectedSubtrees` and
// `selectionOf`, on every spec start in two flavors, and on the cases the design names.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { OurusConfig } from '../src/config.ts';
import { Lineage, textEnd, textStart, type OurusDoc, type OurusNode } from '../src/doc/index.ts';
import type { OurusSelection } from '../src/text/index.ts';
import { executeCommand, OurusDeferred, OurusRejected, OurusSuccess } from '../src/commands/index.ts';
import { OurusView } from '../src/view/index.ts';
import { parseWithMarks, drawDoc, drawnSelection, allNodes, readDrawing, readSpecFile, specConfig, specFiles, resultStatus } from './lib/index.ts';

/** Every spec start's document, once per flavor and config. */
function starts(): OurusDoc[] {
  const out: OurusDoc[] = [];
  const seen = new Set<string>();
  for (const file of specFiles()) {
    for (const t of readSpecFile(file)) {
      const { text, placeholders } = readDrawing(t.initial.buffer);
      for (const flavor of ['gfm', 'obsidian'] as const) {
        const config: Partial<OurusConfig> = { flavor, ...specConfig(t.options) };
        const key = `${JSON.stringify(config)} ${text} ${placeholders}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(parseWithMarks(text, placeholders, config));
      }
    }
  }
  return out;
}

const range = (s: OurusSelection): [number, number] => [Math.min(s.anchor, s.head), Math.max(s.anchor, s.head)];
const show = (doc: OurusDoc, s: OurusSelection): string => JSON.stringify(doc.text.slice(0, range(s)[0]) + '«' + doc.text.slice(...range(s)) + '»' + doc.text.slice(range(s)[1]));

/** Whether `a` is `b` or one of its ancestors. */
const holds = (a: OurusNode, b: OurusNode): boolean => {
  for (let p: OurusNode | null = b; p; p = p.parent) if (p === a) return true;
  return false;
};

/** A node's own text, from its text's start to its end, in offsets; null where it has none or it is empty. */
/** A node's own text, `[from, to]`, and where the frame closing it ends (a block id, closing `#`s), which a selection of the text may take too on the same line. */
function ownText(doc: OurusDoc, node: OurusNode): [number, number, number] | null {
  const text = doc.textOf(node);
  if (!text) return null;
  const [from, to] = [doc.posOf(node, textStart(text), 1), doc.posOf(node, textEnd(text), -1)];
  return to > from ? [from, to, doc.posOf(node, text.text.length, -1)] : null;
}

/** Every spec start, in a view of nothing folded and no zoom. */
const VIEWS = starts().map((doc) => OurusView.of(doc));

/** A reading's roots, by id; null for none. */
function idsOf(nodes: readonly OurusNode[]): number[];
function idsOf(nodes: readonly OurusNode[] | null): number[] | null;
function idsOf(nodes: readonly OurusNode[] | null): number[] | null {
  return nodes && nodes.map((n) => n.id);
}

test('a caret in a node touches that node; with nothing to touch, nothing', () => {
  for (const view of VIEWS) {
    const doc = view.doc;
    for (const node of allNodes(doc)) {
      const text = doc.textOf(node);
      if (!text) continue;
      const at = doc.posOf(node, textStart(text), 1);
      assert.deepEqual(idsOf(view.touchedSubtrees({ anchor: at, head: at })), [node.id], `${JSON.stringify(doc.text)} at ${at}`);
      assert.equal(idsOf(view.selectedSubtrees({ anchor: at, head: at })), null);
    }
  }
  assert.deepEqual(OurusView.of(parseWithMarks('')).touchedSubtrees({ anchor: 0, head: 0 }), []);
  assert.deepEqual(OurusView.of(parseWithMarks('\n\n- a\n')).touchedSubtrees({ anchor: 0, head: 0 }), []);
});

test('selectionOf reads back as the closure of its ids, the outermost of nodes sharing its lines, in every whole-line shape', () => {
  let pairs = 0;
  for (const view of VIEWS) {
    const doc = view.doc;
    const nodes = allNodes(doc).filter((n) => !view.isHidden(n));
    if (nodes.length > 40) continue;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i; j < nodes.length; j++) {
        const ids = i === j ? [nodes[i]!.id] : [nodes[j]!.id, nodes[i]!.id];
        const sel = view.selectionOf(ids);
        const read = view.selectedSubtrees(sel);
        const where = `${show(doc, sel)} of ${ids}`;
        assert.ok(read, `${where}: no subtree selection`);
        pairs++;
        // the same range: the closure, as whole lines
        assert.deepEqual(range(view.selectionOf(read.map((n) => n.id))), range(sel), where);
        // the closure: what the range touches, lifted outward where a node's lines are theirs
        const touched = view.touchedSubtrees(sel);
        assert.ok(touched.every((t) => read.some((r) => holds(r, t))), where);
        // every id in it
        for (const id of ids) assert.ok(read.some((r) => holds(r, doc.node(id)!)), `${where}: ${id} not in ${read.map((n) => n.id)}`);
        // upward, the same
        const up = view.selectionOf(ids, 'up');
        assert.deepEqual(idsOf(view.selectedSubtrees(up)), read.map((n) => n.id), `${where}, upward`);
        // drawn by its roots' lines (`⟦selected⟧`; upward, `┃` at the first one's line start), and read back as it
        for (const s of [sel, up]) {
          const drawn = drawDoc(view, s);
          // (but an inner node on a line it shares, which its line's mark would name the outer one of: at its offsets)
          const named: boolean = read.every((r) => allNodes(doc).filter((n) => n.startLine === r.startLine && !view.isHidden(n)).sort((a, b) => a.depth - b.depth)[0]?.id === r.id);
          assert.equal(drawn.split('⟦selected⟧').length - 1, named ? read.length : 0, `${where}: drawn ${JSON.stringify(drawn)}`);
          const back = readDrawing(drawn);
          assert.equal(back.text, doc.text);
          assert.deepEqual(drawnSelection(view, back), s, `${where}: drawn ${JSON.stringify(drawn)}`);
        }
        // the other whole-line shapes: before the last line's break, the gap's end, the next line's start past it
        const [from] = range(sel);
        const last = read[read.length - 1]!;
        const { starts, ends } = doc.mdTree;
        const gapEnd = doc.coverEnd(last);
        const own = read.length === 1 ? ownText(doc, read[0]!) : null;
        for (const to of [ends[last.endLine]!, ends[gapEnd]!, gapEnd + 1 < doc.lineCount ? starts[gapEnd + 1]! : doc.text.length]) {
          // (an empty last line ends where it starts: ending there doesn't touch it)
          if (to <= from || to === starts[last.endLine]) continue;
          // (one node's own text is text)
          if (own && own[0] === from && to >= own[1] && to <= own[2] && !doc.text.slice(own[1], to).includes('\n')) {
            assert.equal(idsOf(view.selectedSubtrees({ anchor: from, head: to })), null, `${where}: its own text, to ${to}`);
            continue;
          }
          assert.deepEqual(idsOf(view.selectedSubtrees({ anchor: from, head: to })), read.map((n) => n.id), `${where}: to ${to}`);
        }
      }
    }
  }
  assert.ok(pairs > 1000, `only ${pairs} pairs`);
});

test("a node's own text is text, but where it is its subtree's whole lines too (at the document's end)", () => {
  for (const view of VIEWS) {
    const doc = view.doc;
    for (const node of allNodes(doc)) {
      const own = ownText(doc, node);
      if (!own || view.isHidden(node)) continue;
      const read = idsOf(view.selectedSubtrees({ anchor: own[0], head: own[1] }));
      const whole = range(view.selectionOf([node.id]));
      if (whole[0] === own[0] && whole[1] === own[1]) assert.notEqual(read, null, `${show(doc, { anchor: own[0], head: own[1] })}`);
      else assert.equal(read, null, `${show(doc, { anchor: own[0], head: own[1] })}`);
    }
  }
  const doc = parseWithMarks('alpha\n\nbeta');
  const view = OurusView.of(doc);
  assert.equal(idsOf(view.selectedSubtrees({ anchor: 0, head: 5 })), null);
  assert.deepEqual(idsOf(view.selectedSubtrees({ anchor: 0, head: 6 })), [doc.rootNode.children[0]!.id]);
  assert.deepEqual(idsOf(view.selectedSubtrees({ anchor: 7, head: 11 })), [doc.rootNode.children[1]!.id]);
});

test('a selection that ends in a node, or starts past column 0, touches its nodes but is no subtree selection', () => {
  const doc = parseWithMarks('- one\n  - two\n    - deep\n  - three\n- four\n');
  const view = OurusView.of(doc);
  const [one] = doc.rootNode.children;
  const [two, three] = one!.children;
  const deep = two!.children[0]!;
  // `- «two⏎    - deep⏎  - three»`: text start to text end
  const from = doc.posOf(two!, 0);
  const to = doc.posOf(three!, 5);
  assert.deepEqual(idsOf(view.touchedSubtrees({ anchor: from, head: to })), [two!.id, three!.id]);
  assert.equal(idsOf(view.selectedSubtrees({ anchor: from, head: to })), null);
  // a drag from `two`'s text into `deep`'s touches `two` alone
  assert.deepEqual(idsOf(view.touchedSubtrees({ anchor: doc.posOf(two!, 1), head: doc.posOf(deep, 2) })), [two!.id]);
  // `deep` and `three` at two depths, as whole lines
  const forest = view.selectionOf([deep.id, three!.id]);
  assert.deepEqual(idsOf(view.selectedSubtrees(forest)), [deep.id, three!.id]);
  // the whole document, where it is its nodes only, is them
  assert.deepEqual(idsOf(view.selectedSubtrees({ anchor: 0, head: doc.text.length })), [one!.id, doc.rootNode.children[1]!.id]);
});

test('selectionOf: everything between comes along; an ancestor takes its descendants in', () => {
  const doc = parseWithMarks('- p\n  - a\n  - b\n  - c\n- q\n');
  const view = OurusView.of(doc);
  const [p, q] = doc.rootNode.children;
  const [a, , c] = p!.children;
  assert.deepEqual(idsOf(view.selectedSubtrees(view.selectionOf([a!.id, c!.id]))), p!.children.map((n) => n.id));
  assert.deepEqual(idsOf(view.selectedSubtrees(view.selectionOf([a!.id, p!.id]))), [p!.id]);
  assert.deepEqual(view.selectionOf([p!.id]), { anchor: 0, head: doc.mdTree.starts[q!.startLine]! });
  assert.deepEqual(view.selectionOf([q!.id], 'up'), { anchor: doc.text.length, head: doc.mdTree.starts[q!.startLine]! });
  // a paragraph between that owns the list the last is in comes with its whole list
  const owned = OurusView.of(parseWithMarks('- a\n\npara\n\n- b\n- c\n', [], { listParent: 'paragraph' }));
  const [a2, para] = owned.doc.rootNode.children;
  const sel = owned.selectionOf([a2!.id, para!.children[0]!.id]);
  assert.deepEqual(sel, { anchor: 0, head: owned.doc.text.length });
  assert.deepEqual(idsOf(owned.selectedSubtrees(sel)), [a2!.id, para!.id]);
});

test('nodes sharing a line: touched is the innermost, selected the outermost inside the zoom', () => {
  const doc = parseWithMarks('- x\n- - a\n  - b\n');
  const view = OurusView.of(doc);
  const outer = doc.rootNode.children[1]!;
  const [a, b] = outer.children;
  const caret = doc.posOf(a!, 0);
  assert.deepEqual(idsOf(view.touchedSubtrees({ anchor: caret, head: caret })), [a!.id]);
  // `a` alone is its line, not the outer item's
  assert.deepEqual(idsOf(view.selectedSubtrees(view.selectionOf([a!.id]))), [a!.id]);
  // `a` and `b` are all of it
  assert.deepEqual(idsOf(view.selectedSubtrees(view.selectionOf([a!.id, b!.id]))), [outer.id]);
  // an only child: its lines are its parent's, but not past the zoom
  const only = OurusView.of(parseWithMarks('- - a\n- y\n'));
  const parent = only.doc.rootNode.children[0]!;
  const inner = parent.children[0]!;
  assert.deepEqual(idsOf(only.selectedSubtrees(only.selectionOf([inner.id]))), [parent.id]);
  const zoomed = only.withZoom(inner.id);
  assert.deepEqual(idsOf(zoomed.selectedSubtrees(zoomed.selectionOf([inner.id]))), [inner.id]);
  // zoomed into the outer item, it is inside: the outer item
  const outerZoom = only.withZoom(parent.id);
  assert.deepEqual(idsOf(outerZoom.selectedSubtrees(outerZoom.selectionOf([inner.id]))), [parent.id]);
});

test('selectionOf throws for no ids, an unknown id, the root, an id outside the zoom, an id a fold hides', () => {
  const doc = parseWithMarks('- p\n  - a\n- q\n');
  const view = OurusView.of(doc);
  const [p, q] = doc.rootNode.children;
  const a = p!.children[0]!;
  assert.throws(() => view.selectionOf([]), Error);
  assert.throws(() => view.selectionOf([999]), /no node 999/);
  assert.throws(() => view.selectionOf([Lineage.ROOT]), /root/);
  assert.throws(() => view.withZoom(p!.id).selectionOf([q!.id]), /zoom/);
  assert.throws(() => view.withFolded([p!.id]).selectionOf([a.id]), /fold/);
  // the zoom root and a folded node itself are there to select
  assert.doesNotThrow(() => view.withZoom(p!.id).selectionOf([p!.id]));
  assert.doesNotThrow(() => view.withFolded([p!.id]).selectionOf([p!.id]));
});

test('a snapshot keeps its last answer', () => {
  const doc = parseWithMarks('- a\n- b\n');
  const view = OurusView.of(doc);
  const sel = view.selectionOf(doc.rootNode.children.map((n) => n.id));
  assert.equal(view.selectedSubtrees(sel), view.selectedSubtrees({ ...sel }));
  assert.equal(view.touchedSubtrees(sel), view.touchedSubtrees({ ...sel }));
});

test('the spec draws a subtree selection by its roots (`⟦selected⟧`), and any other selection as it is', () => {
  const doc = parseWithMarks('- one\n  - two\n    - deep\n  - three\n- four\n');
  const view = OurusView.of(doc);
  const two = doc.rootNode.children[0]!.children[0]!;
  const three = doc.rootNode.children[0]!.children[1]!;
  const deep = two.children[0]!;
  assert.equal(drawDoc(view, view.selectionOf([two.id])), '- one\n  - two⟦selected⟧\n    - deep\n  - three\n- four\n');
  assert.equal(drawDoc(view, view.selectionOf([two.id], 'up')), '- one\n┃  - two⟦selected⟧\n    - deep\n  - three\n- four\n');
  assert.equal(drawDoc(view, view.selectionOf([deep.id, three.id])), '- one\n  - two\n    - deep⟦selected⟧\n  - three⟦selected⟧\n- four\n');
  // the same roots in another whole-line shape (before the last break): drawn as they are
  const sel = view.selectionOf([two.id]);
  assert.equal(drawDoc(view, { anchor: sel.anchor, head: sel.head - 1 }), '- one\n«  - two\n    - deep»\n  - three\n- four\n');
  // read: the roots' lines, as whole lines; upward with `┃` at the first one's line start
  for (const [drawn, dir] of [['- one\n  - two⟦selected⟧\n    - deep\n', 'down'], ['- one\n┃  - two⟦selected⟧\n    - deep\n', 'up']] as const) {
    const d = readDrawing(drawn);
    const at = OurusView.of(parseWithMarks(d.text));
    assert.deepEqual(drawnSelection(at, d), at.selectionOf([at.doc.rootNode.children[0]!.children[0]!.id], dir), drawn);
  }
  // marks that aren't the roots (a child of a marked node), or a caret besides them: errors
  assert.throws(() => drawnSelection(OurusView.of(parseWithMarks('- one\n  - two\n')), readDrawing('- one⟦selected⟧\n  - two⟦selected⟧\n')));
  assert.throws(() => readDrawing('- o┃ne\n  - two⟦selected⟧\n'));
  // nodes sharing a line: the outer one by its line; the inner one alone at its offsets
  const shared = OurusView.of(parseWithMarks('- - a\n  - b\n- y\n'));
  const outer = shared.doc.rootNode.children[0]!;
  assert.equal(drawDoc(shared, shared.selectionOf([outer.id])), '- - a⟦selected⟧\n  - b\n- y\n');
  assert.equal(drawDoc(shared, shared.selectionOf([outer.children[0]!.id])), '«- - a\n»  - b\n- y\n');
});

test('the commands act on the selection\'s roots: a subtree selection\'s, else what it touches', () => {
  const doc = parseWithMarks('- x\n- - a\n  - b\n');
  const view = OurusView.of(doc);
  const outer = doc.rootNode.children[1]!;
  const a = outer.children[0]!;
  const caret = doc.posOf(a, 1);
  // a caret in `a`: indent acts on the inner item, which has no sibling above; fold folds the row's outer item
  const indented = executeCommand(view.withSelection(caret), { type: 'indent' });
  assert.equal(indented instanceof OurusRejected && indented.reason, 'no-previous-sibling');
  const folded = executeCommand(view.withSelection(caret), { type: 'fold' });
  assert.ok(folded instanceof OurusSuccess && folded.view.folded.has(outer.id));
  // the outer item selected whole: indented under `x`
  const whole = executeCommand(view.withSelection(view.selectionOf([outer.id])), { type: 'indent' });
  assert.equal(whole instanceof OurusSuccess && whole.view.doc.text, '- x\n  - - a\n    - b\n');
  // copy of a drag from a parent's text into its child's (`copySelection: nodes`): the parent, as nodes
  const tree = parseWithMarks('- one\n  - two\n    - deep\n- four\n', [], { copySelection: 'nodes' });
  const two = tree.rootNode.children[0]!.children[0]!;
  const copied = executeCommand(OurusView.of(tree, { selection: { anchor: tree.posOf(two, 1), head: tree.posOf(two.children[0]!, 2) } }), { type: 'copy' });
  assert.equal(copied instanceof OurusSuccess && copied.clipboard?.['text/plain'], '- two\n  - deep\n');
  // copy at a caret on a blank line: the host's
  const gap = parseWithMarks('- a\n\n- b\n');
  assert.ok(executeCommand(OurusView.of(gap, { selection: 4 }), { type: 'copy' }) instanceof OurusDeferred);
});

test('a structural command keeps a subtree selection on its nodes, in the shape it was given', () => {
  // a drop of the selected nodes (moveSubtree, by ids): the same nodes after, as whole lines
  const doc = parseWithMarks('- a\n- b\n  - c\n- d\n');
  const view = OurusView.of(doc);
  const [a, b] = doc.rootNode.children;
  const moved = executeCommand(view.withSelection(view.selectionOf([b!.id])), { type: 'moveSubtree', nodes: [b!.id], to: { parent: 'root', after: null } });
  assert.ok(moved instanceof OurusSuccess);
  assert.deepEqual(idsOf(moved.view.selectedSubtrees(moved.view.selection)), [b!.id]);
  assert.equal(moved.view.doc.text, '- b\n  - c\n- a\n- d\n');
  // true-outliner's cover, to the end of the gap: the same after a move
  const gapped = parseWithMarks('- a\n\n- b\n\n- d\n');
  const bb = gapped.rootNode.children[1]!;
  const cover = { anchor: gapped.mdTree.starts[bb.startLine]!, head: gapped.mdTree.ends[gapped.coverEnd(bb)]! };
  const up = executeCommand(OurusView.of(gapped, { selection: cover }), { type: 'moveSubtreeUp' });
  assert.ok(up instanceof OurusSuccess);
  const nb = up.view.doc.node(bb.id)!;
  assert.deepEqual(up.view.selection, { anchor: up.view.doc.mdTree.starts[nb.startLine]!, head: up.view.doc.mdTree.ends[up.view.doc.coverEnd(nb)]! });
  void a;
});

test('a fold that ends the document leaves a subtree selection of its node whole, its end not moved into the fold', () => {
  const doc = parseWithMarks('- a\n- b\n  - c');
  const b = doc.rootNode.children[1]!;
  const folded = OurusView.of(doc).withFolded([b.id]);
  const sel = folded.selectionOf([b.id]);
  assert.equal(sel.head, folded.doc.text.length);
  // (a command that changes no text: its selection only through the view's rule)
  const r = executeCommand(folded.withSelection(sel), { type: 'fold' });
  assert.ok(r instanceof OurusSuccess);
  assert.deepEqual(r.view.selection, sel);
  // a caret in the fold still goes to its start
  const caret = executeCommand(folded.withSelection(folded.doc.text.length), { type: 'fold' });
  assert.ok(caret instanceof OurusSuccess && caret.view.selection.head === folded.doc.foldRange(b)!.from);
});

test('a command given nodes acts on them, not on the subtree selection', () => {
  const doc = parseWithMarks('- a\n- b\n- c\n');
  const view = OurusView.of(doc);
  const [a, , c] = doc.rootNode.children;
  const copied = executeCommand(view.withSelection(view.selectionOf([a!.id])), { type: 'copy', nodes: [c!.id] });
  assert.equal(copied instanceof OurusSuccess && copied.clipboard?.['text/plain'], '- c\n');
  const deleted = executeCommand(view.withSelection(view.selectionOf([a!.id])), { type: 'deleteSubtree', nodes: [c!.id] });
  assert.equal(deleted instanceof OurusSuccess && deleted.view.doc.text, '- a\n- b\n');
});

test('selectNodeDown then as many selectNodeUp is the identity; the roots never get deeper along a selection', () => {
  let walks = 0;
  const shallowing = (view: OurusView, sel: OurusSelection, where: string): void => {
    const doc = view.doc;
    const roots = view.selectedSubtrees(sel);
    if (!roots) return;
    // (but a root on its parent's first line, `- > q`'s quote: the parent has no line of its own to touch)
    for (let i = 1; i < roots.length; i++) if (roots[i]!.parent!.startLine !== roots[i]!.startLine) assert.ok(roots[i]!.depth <= roots[i - 1]!.depth, `${where}: ${show(doc, sel)}: a later root deeper`);
  };
  for (const view of VIEWS.flatMap((v) => [v, v.withConfig({ selectNodeUp: 'sibling' })])) {
    const doc = view.doc;
    const nodes = allNodes(doc).filter((n) => !view.isHidden(n));
    if (nodes.length > 30) continue;
    for (const node of nodes) {
      const start = view.selectionOf([node.id]);
      let sel = start;
      let grown = 0;
      // (re-seated: roots that are all of a node on whose lines they are read as that node, `- - a⏎  - b`,
      // whose anchor's node is then that node; the range can't say it was `a`)
      let reseated = false;
      for (let k = 0; k < 4; k++) {
        const r = executeCommand(view.withSelection(sel), { type: 'selectNodeDown' });
        assert.ok(r instanceof OurusSuccess);
        if (!(r instanceof OurusSuccess) || idsOf(view.selectedSubtrees(r.view.selection))?.join() === idsOf(view.selectedSubtrees(sel))?.join()) break;
        sel = r.view.selection;
        grown++;
        shallowing(view, sel, `${node.id} down ${grown}`);
        if (view.selectedSubtrees(sel)!.some((n) => !view.touchedSubtrees(sel).includes(n))) reseated = true;
      }
      if (reseated) continue;
      for (let k = 0; k < grown; k++) {
        const r = executeCommand(view.withSelection(sel), { type: 'selectNodeUp' });
        assert.ok(r instanceof OurusSuccess);
        sel = r.view.selection;
        shallowing(view, sel, `${node.id} up`);
      }
      assert.deepEqual(idsOf(view.selectedSubtrees(sel)), idsOf(view.selectedSubtrees(start)), `${JSON.stringify(doc.text)}: from node ${node.id}, ${grown} down and up`);
      walks++;
    }
  }
  assert.ok(walks > 500, `only ${walks} walks`);
});

test('over a subtree selection the press is a node step wherever the head is, and every whole-line shape climbs alike', () => {
  // a two-line node selected: Shift-Up extends to the node above, not into the node
  const two = OurusView.of(parseWithMarks('- x\n- a\n  more\n- b\n'));
  const [x, a] = two.doc.rootNode.children;
  const up = executeCommand(two.withSelection(two.selectionOf([a!.id], 'up')), { type: 'selectNodeUp' });
  assert.ok(up instanceof OurusSuccess);
  assert.deepEqual(idsOf(two.selectedSubtrees(up.view.selection)), [x!.id, a!.id]);
  // expandSelection from each whole-line shape, either way: the same next rung
  for (const view of VIEWS.slice(0, 300)) {
    const doc = view.doc;
    for (const node of allNodes(doc).filter((n) => !view.isHidden(n)).slice(0, 8)) {
      const sel = view.selectionOf([node.id]);
      const want = executeCommand(view.withSelection(sel), { type: 'expandSelection' });
      const { starts, ends } = doc.mdTree;
      const last = view.selectedSubtrees(sel)!.at(-1)!;
      const gapEnd = ends[doc.coverEnd(last)]!;
      for (const to of [ends[last.endLine]!, gapEnd]) {
        if (to <= sel.anchor || to === starts[last.endLine]) continue;
        for (const shape of [{ anchor: sel.anchor, head: to }, { anchor: to, head: sel.anchor }]) {
          if (!view.selectedSubtrees(shape)) continue;
          const got = executeCommand(view.withSelection(shape), { type: 'expandSelection' });
          assert.equal(resultStatus(got), resultStatus(want), `${show(doc, shape)}`);
          if (got instanceof OurusSuccess && want instanceof OurusSuccess) assert.deepEqual(idsOf(view.selectedSubtrees(got.view.selection)) ?? got.view.selection, idsOf(view.selectedSubtrees(want.view.selection)) ?? want.view.selection, `${show(doc, shape)}`);
        }
      }
    }
  }
});

test('typing over the whole document (a select all) is the host\'s: the text replaced, no node kept', () => {
  for (const text of ['- a\n  - a1\n- b\n', '# T\n\nbody\n\n- a\n']) {
    const view = OurusView.of(parseWithMarks(text));
    const all = { anchor: 0, head: text.length };
    assert.ok(idsOf(view.selectedSubtrees(all)), 'a subtree selection still');
    assert.ok(executeCommand(view.withSelection(all), { type: 'insertText', text: 'x' }) instanceof OurusDeferred);
    assert.ok(executeCommand(view.withSelection(all), { type: 'pastePlain', text: 'x' }) instanceof OurusDeferred);
    // the keys that act on nodes still do
    const deleted = executeCommand(view.withSelection(all), { type: 'deleteContentForward' });
    assert.ok(deleted instanceof OurusSuccess && deleted.view.doc.blank);
  }
});
