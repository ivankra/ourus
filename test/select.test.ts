// Reading a selection as subtrees (dev/22-select.md §4.2): `touchedSubtrees`, `selectedSubtrees` and
// `selectionOf`, on every spec start in two flavors, and on the cases the design names.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { OurusConfig } from '../src/config.ts';
import { Lineage, textEnd, textStart, type OurusDoc, type OurusNode } from '../src/doc/index.ts';
import type { OurusSelection } from '../src/text/index.ts';
import { executeCommand } from '../src/commands/index.ts';
import { docOf, drawDoc, drawnSelection, nodesOf, readDrawing } from './drawing.ts';
import { readSpecFile, specConfig, specFiles } from './specfile.ts';

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
        out.push(docOf(text, placeholders, config));
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
function ownText(doc: OurusDoc, node: OurusNode): [number, number] | null {
  const text = doc.textOf(node);
  if (!text) return null;
  const [from, to] = [doc.posOf(node, textStart(text), 1), doc.posOf(node, textEnd(text), -1)];
  return to > from ? [from, to] : null;
}

const DOCS = starts();

test('a caret in a node touches that node; with nothing to touch, nothing', () => {
  for (const doc of DOCS) {
    for (const node of nodesOf(doc)) {
      const text = doc.textOf(node);
      if (!text) continue;
      const at = doc.posOf(node, textStart(text), 1);
      assert.deepEqual(doc.touchedSubtrees({ anchor: at, head: at }), [node.id], `${JSON.stringify(doc.text)} at ${at}`);
      assert.equal(doc.selectedSubtrees({ anchor: at, head: at }), null);
    }
  }
  assert.deepEqual(docOf('').touchedSubtrees({ anchor: 0, head: 0 }), []);
  assert.deepEqual(docOf('\n\n- a\n').touchedSubtrees({ anchor: 0, head: 0 }), []);
});

test('selectionOf reads back as the closure of its ids, the outermost of nodes sharing its lines, in every whole-line shape', () => {
  let pairs = 0;
  for (const doc of DOCS) {
    const nodes = nodesOf(doc).filter((n) => !doc.isHidden(n));
    if (nodes.length > 40) continue;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i; j < nodes.length; j++) {
        const ids = i === j ? [nodes[i]!.id] : [nodes[j]!.id, nodes[i]!.id];
        const sel = doc.selectionOf(ids);
        const read = doc.selectedNodes(sel);
        const where = `${show(doc, sel)} of ${ids}`;
        assert.ok(read, `${where}: no subtree selection`);
        pairs++;
        // the same range: the closure, as whole lines
        assert.deepEqual(range(doc.selectionOf(read.map((n) => n.id))), range(sel), where);
        // the closure: what the range touches, lifted outward where a node's lines are theirs
        const touched = doc.touchedNodes(sel);
        assert.ok(touched.every((t) => read.some((r) => holds(r, t))), where);
        // every id in it
        for (const id of ids) assert.ok(read.some((r) => holds(r, doc.node(id)!)), `${where}: ${id} not in ${read.map((n) => n.id)}`);
        // upward, the same
        const up = doc.selectionOf(ids, 'up');
        assert.deepEqual(doc.selectedSubtrees(up), read.map((n) => n.id), `${where}, upward`);
        // drawn `««…»»` (`┃««…»»` upward), and read back as it
        // (but where no span names it: an empty last node, on an empty line, is touched by none)
        const tail: OurusNode = read[read.length - 1]!.lastDescendant;
        const empty: boolean = doc.isEmptyLine(tail.startLine);
        for (const s of [sel, up]) {
          const drawn = drawDoc(doc, s);
          assert.ok(drawn.includes('»»') || empty, `${where}: drawn ${JSON.stringify(drawn)}`);
          const back = readDrawing(drawn);
          assert.equal(back.text, doc.text);
          assert.deepEqual(drawnSelection(doc, back), s, `${where}: drawn ${JSON.stringify(drawn)}`);
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
          if (own && own[0] === from && own[1] === to) {
            assert.equal(doc.selectedSubtrees({ anchor: from, head: to }), null, `${where}: its own text, to ${to}`);
            continue;
          }
          assert.deepEqual(doc.selectedSubtrees({ anchor: from, head: to }), read.map((n) => n.id), `${where}: to ${to}`);
        }
      }
    }
  }
  assert.ok(pairs > 1000, `only ${pairs} pairs`);
});

test("a node's own text is text, but where it is its subtree's whole lines too (at the document's end)", () => {
  for (const doc of DOCS) {
    for (const node of nodesOf(doc)) {
      const own = ownText(doc, node);
      if (!own || doc.isHidden(node)) continue;
      const read = doc.selectedSubtrees({ anchor: own[0], head: own[1] });
      const whole = range(doc.selectionOf([node.id]));
      if (whole[0] === own[0] && whole[1] === own[1]) assert.notEqual(read, null, `${show(doc, { anchor: own[0], head: own[1] })}`);
      else assert.equal(read, null, `${show(doc, { anchor: own[0], head: own[1] })}`);
    }
  }
  const doc = docOf('alpha\n\nbeta');
  assert.equal(doc.selectedSubtrees({ anchor: 0, head: 5 }), null);
  assert.deepEqual(doc.selectedSubtrees({ anchor: 0, head: 6 }), [doc.rootNode.children[0]!.id]);
  assert.deepEqual(doc.selectedSubtrees({ anchor: 7, head: 11 }), [doc.rootNode.children[1]!.id]);
});

test('a selection that ends in a node, or starts past column 0, touches its nodes but is no subtree selection', () => {
  const doc = docOf('- one\n  - two\n    - deep\n  - three\n- four\n');
  const [one] = doc.rootNode.children;
  const [two, three] = one!.children;
  const deep = two!.children[0]!;
  // `- «two⏎    - deep⏎  - three»`: text start to text end
  const from = doc.posOf(two!, 0);
  const to = doc.posOf(three!, 5);
  assert.deepEqual(doc.touchedSubtrees({ anchor: from, head: to }), [two!.id, three!.id]);
  assert.equal(doc.selectedSubtrees({ anchor: from, head: to }), null);
  // a drag from `two`'s text into `deep`'s touches `two` alone
  assert.deepEqual(doc.touchedSubtrees({ anchor: doc.posOf(two!, 1), head: doc.posOf(deep, 2) }), [two!.id]);
  // `deep` and `three` at two depths, as whole lines
  const forest = doc.selectionOf([deep.id, three!.id]);
  assert.deepEqual(doc.selectedSubtrees(forest), [deep.id, three!.id]);
  // the whole document, where it is its nodes only, is them
  assert.deepEqual(doc.selectedSubtrees({ anchor: 0, head: doc.text.length }), [one!.id, doc.rootNode.children[1]!.id]);
});

test('selectionOf: everything between comes along; an ancestor takes its descendants in', () => {
  const doc = docOf('- p\n  - a\n  - b\n  - c\n- q\n');
  const [p, q] = doc.rootNode.children;
  const [a, , c] = p!.children;
  assert.deepEqual(doc.selectedSubtrees(doc.selectionOf([a!.id, c!.id])), p!.children.map((n) => n.id));
  assert.deepEqual(doc.selectedSubtrees(doc.selectionOf([a!.id, p!.id])), [p!.id]);
  assert.deepEqual(doc.selectionOf([p!.id]), { anchor: 0, head: doc.mdTree.starts[q!.startLine]! });
  assert.deepEqual(doc.selectionOf([q!.id], 'up'), { anchor: doc.text.length, head: doc.mdTree.starts[q!.startLine]! });
  // a paragraph between that owns the list the last is in comes with its whole list
  const owned = docOf('- a\n\npara\n\n- b\n- c\n', [], { listParent: 'paragraph' });
  const [a2, para] = owned.rootNode.children;
  const sel = owned.selectionOf([a2!.id, para!.children[0]!.id]);
  assert.deepEqual(sel, { anchor: 0, head: owned.text.length });
  assert.deepEqual(owned.selectedSubtrees(sel), [a2!.id, para!.id]);
});

test('nodes sharing a line: touched is the innermost, selected the outermost inside the zoom', () => {
  const doc = docOf('- x\n- - a\n  - b\n');
  const outer = doc.rootNode.children[1]!;
  const [a, b] = outer.children;
  const caret = doc.posOf(a!, 0);
  assert.deepEqual(doc.touchedSubtrees({ anchor: caret, head: caret }), [a!.id]);
  // `a` alone is its line, not the outer item's
  assert.deepEqual(doc.selectedSubtrees(doc.selectionOf([a!.id])), [a!.id]);
  // `a` and `b` are all of it
  assert.deepEqual(doc.selectedSubtrees(doc.selectionOf([a!.id, b!.id])), [outer.id]);
  // an only child: its lines are its parent's, but not past the zoom
  const only = docOf('- - a\n- y\n');
  const parent = only.rootNode.children[0]!;
  const inner = parent.children[0]!;
  assert.deepEqual(only.selectedSubtrees(only.selectionOf([inner.id])), [parent.id]);
  const zoomed = only.withZoom(inner.id);
  assert.deepEqual(zoomed.selectedSubtrees(zoomed.selectionOf([inner.id])), [inner.id]);
  // zoomed into the outer item, it is inside: the outer item
  const outerZoom = only.withZoom(parent.id);
  assert.deepEqual(outerZoom.selectedSubtrees(outerZoom.selectionOf([inner.id])), [parent.id]);
});

test('selectionOf throws for no ids, an unknown id, the root, an id outside the zoom, an id a fold hides', () => {
  const doc = docOf('- p\n  - a\n- q\n');
  const [p, q] = doc.rootNode.children;
  const a = p!.children[0]!;
  assert.throws(() => doc.selectionOf([]), Error);
  assert.throws(() => doc.selectionOf([999]), /no node 999/);
  assert.throws(() => doc.selectionOf([Lineage.ROOT]), /root/);
  assert.throws(() => doc.withZoom(p!.id).selectionOf([q!.id]), /zoom/);
  assert.throws(() => doc.withFolded([p!.id]).selectionOf([a.id]), /fold/);
  // the zoom root and a folded node itself are there to select
  assert.doesNotThrow(() => doc.withZoom(p!.id).selectionOf([p!.id]));
  assert.doesNotThrow(() => doc.withFolded([p!.id]).selectionOf([p!.id]));
});

test('a snapshot keeps its last answer', () => {
  const doc = docOf('- a\n- b\n');
  const sel = doc.selectionOf(doc.rootNode.children.map((n) => n.id));
  assert.equal(doc.selectedNodes(sel), doc.selectedNodes({ ...sel }));
  assert.equal(doc.touchedNodes(sel), doc.touchedNodes({ ...sel }));
});

test('the spec draws a subtree selection `««…»»`, the shortest span, and any other selection as it is', () => {
  const doc = docOf('- one\n  - two\n    - deep\n  - three\n- four\n');
  const two = doc.rootNode.children[0]!.children[0]!;
  const three = doc.rootNode.children[0]!.children[1]!;
  const deep = two.children[0]!;
  assert.equal(drawDoc(doc, doc.selectionOf([two.id])), '- one\n  - ««two»»\n    - deep\n  - three\n- four\n');
  assert.equal(drawDoc(doc, doc.selectionOf([two.id], 'up')), '- one\n  - ┃««two»»\n    - deep\n  - three\n- four\n');
  assert.equal(drawDoc(doc, doc.selectionOf([deep.id, three.id])), '- one\n  - two\n    - ««deep\n  - three»»\n- four\n');
  // the same roots in another whole-line shape (before the last break): drawn as they are
  const sel = doc.selectionOf([two.id]);
  assert.equal(drawDoc(doc, { anchor: sel.anchor, head: sel.head - 1 }), '- one\n«  - two\n    - deep»\n  - three\n- four\n');
  // read: the nodes the span touches, as whole lines; a longer span the same
  for (const drawn of ['- one\n  - ««two»»\n    - deep\n', '- one\n  - ««two\n    - deep»»\n', '- one\n  - t««w»»o\n    - deep\n']) {
    const d = readDrawing(drawn);
    const at = docOf(d.text);
    assert.deepEqual(drawnSelection(at, d), at.selectionOf([at.rootNode.children[0]!.children[0]!.id]), drawn);
  }
  // nodes sharing a line: drawn in the inner text
  const shared = docOf('- - a\n- y\n');
  assert.equal(drawDoc(shared, shared.selectionOf([shared.rootNode.children[0]!.id])), '- - ««a»»\n- y\n');
});

test('the commands act on the selection\'s roots: a subtree selection\'s, else what it touches', () => {
  const doc = docOf('- x\n- - a\n  - b\n');
  const outer = doc.rootNode.children[1]!;
  const a = outer.children[0]!;
  const caret = doc.posOf(a, 1);
  // a caret in `a`: indent acts on the inner item, which has no sibling above; fold folds the row's outer item
  const indented = executeCommand(doc, { type: 'indent' }, { anchor: caret, head: caret });
  assert.equal(indented.status === 'rejected' && indented.reason, 'no-previous-sibling');
  const folded = executeCommand(doc, { type: 'fold' }, { anchor: caret, head: caret });
  assert.ok(folded.status === 'applied' && folded.doc.folded.has(outer.id));
  // the outer item selected whole: indented under `x`
  const whole = executeCommand(doc, { type: 'indent' }, doc.selectionOf([outer.id]));
  assert.equal(whole.status === 'applied' && whole.doc.text, '- x\n  - - a\n    - b\n');
  // copy of a drag from a parent's text into its child's (`copySelection: nodes`): the parent, as nodes
  const tree = docOf('- one\n  - two\n    - deep\n- four\n', [], { copySelection: 'nodes' });
  const two = tree.rootNode.children[0]!.children[0]!;
  const copied = executeCommand(tree, { type: 'copy' }, { anchor: tree.posOf(two, 1), head: tree.posOf(two.children[0]!, 2) });
  assert.equal(copied.status === 'applied' && copied.clipboard?.['text/plain'], '- two\n  - deep\n');
  // copy at a caret on a blank line: the host's
  const gap = docOf('- a\n\n- b\n');
  assert.equal(executeCommand(gap, { type: 'copy' }, { anchor: 4, head: 4 }).status, 'deferredToHost');
});

test('a structural command keeps a subtree selection on its nodes, in the shape it was given', () => {
  // a drop of the selected nodes (moveSubtree, by ids): the same nodes after, as whole lines
  const doc = docOf('- a\n- b\n  - c\n- d\n');
  const [a, b] = doc.rootNode.children;
  const moved = executeCommand(doc, { type: 'moveSubtree', nodes: [b!.id], to: { parent: 'root', after: null } }, doc.selectionOf([b!.id]));
  assert.ok(moved.status === 'applied');
  assert.deepEqual(moved.doc.selectedSubtrees(moved.selection), [b!.id]);
  assert.equal(moved.doc.text, '- b\n  - c\n- a\n- d\n');
  // true-outliner's cover, to the end of the gap: the same after a move
  const gapped = docOf('- a\n\n- b\n\n- d\n');
  const bb = gapped.rootNode.children[1]!;
  const cover = { anchor: gapped.mdTree.starts[bb.startLine]!, head: gapped.mdTree.ends[gapped.coverEnd(bb)]! };
  const up = executeCommand(gapped, { type: 'moveSubtreeUp' }, cover);
  assert.ok(up.status === 'applied');
  const nb = up.doc.node(bb.id)!;
  assert.deepEqual(up.selection, { anchor: up.doc.mdTree.starts[nb.startLine]!, head: up.doc.mdTree.ends[up.doc.coverEnd(nb)]! });
  void a;
});

test('a fold that ends the document leaves a subtree selection of its node whole, its end not moved into the fold', () => {
  const doc = docOf('- a\n- b\n  - c');
  const b = doc.rootNode.children[1]!;
  const folded = doc.withFolded([b.id]);
  const sel = folded.selectionOf([b.id]);
  assert.equal(sel.head, folded.text.length);
  // (a command that changes no text: its selection only through the view's rule)
  const r = executeCommand(folded, { type: 'fold' }, sel);
  assert.ok(r.status === 'applied');
  assert.deepEqual(r.selection, sel);
  // a caret in the fold still goes to its start
  const caret = executeCommand(folded, { type: 'fold' }, { anchor: folded.text.length, head: folded.text.length });
  assert.ok(caret.status === 'applied' && caret.selection.head === folded.foldRange(b)!.from);
});

test('a command given nodes acts on them, not on the subtree selection', () => {
  const doc = docOf('- a\n- b\n- c\n');
  const [a, , c] = doc.rootNode.children;
  const copied = executeCommand(doc, { type: 'copy', nodes: [c!.id] }, doc.selectionOf([a!.id]));
  assert.equal(copied.status === 'applied' && copied.clipboard?.['text/plain'], '- c\n');
  const deleted = executeCommand(doc, { type: 'deleteSubtree', nodes: [c!.id] }, doc.selectionOf([a!.id]));
  assert.equal(deleted.status === 'applied' && deleted.doc.text, '- a\n- b\n');
});

test('selectNodeDown then as many selectNodeUp is the identity; the roots never get deeper along a selection', () => {
  let walks = 0;
  const shallowing = (doc: OurusDoc, sel: OurusSelection, where: string): void => {
    const roots = doc.selectedNodes(sel);
    if (!roots) return;
    // (but a root on its parent's first line, `- > q`'s quote: the parent has no line of its own to touch)
    for (let i = 1; i < roots.length; i++) if (roots[i]!.parent!.startLine !== roots[i]!.startLine) assert.ok(roots[i]!.depth <= roots[i - 1]!.depth, `${where}: ${show(doc, sel)}: a later root deeper`);
  };
  for (const doc of DOCS.flatMap((d) => [d, d.withConfig({ selectNodeUp: 'sibling' })])) {
    const nodes = nodesOf(doc).filter((n) => !doc.isHidden(n));
    if (nodes.length > 30) continue;
    for (const node of nodes) {
      const start = doc.selectionOf([node.id]);
      let sel = start;
      let grown = 0;
      // (re-seated: roots that are all of a node on whose lines they are read as that node, `- - a⏎  - b`,
      // whose anchor's node is then that node; the range can't say it was `a`)
      let reseated = false;
      for (let k = 0; k < 4; k++) {
        const r = executeCommand(doc, { type: 'selectNodeDown' }, sel);
        assert.equal(r.status, 'applied');
        if (r.status !== 'applied' || doc.selectedSubtrees(r.selection)?.join() === doc.selectedSubtrees(sel)?.join()) break;
        sel = r.selection;
        grown++;
        shallowing(doc, sel, `${node.id} down ${grown}`);
        if (doc.selectedNodes(sel)!.some((n) => !doc.touchedNodes(sel).includes(n))) reseated = true;
      }
      if (reseated) continue;
      for (let k = 0; k < grown; k++) {
        const r = executeCommand(doc, { type: 'selectNodeUp' }, sel);
        assert.ok(r.status === 'applied');
        sel = r.selection;
        shallowing(doc, sel, `${node.id} up`);
      }
      assert.deepEqual(doc.selectedSubtrees(sel), doc.selectedSubtrees(start), `${JSON.stringify(doc.text)}: from node ${node.id}, ${grown} down and up`);
      walks++;
    }
  }
  assert.ok(walks > 500, `only ${walks} walks`);
});

test('over a subtree selection the press is a node step wherever the head is, and every whole-line shape climbs alike', () => {
  // a two-line node selected: Shift-Up extends to the node above, not into the node
  const two = docOf('- x\n- a\n  more\n- b\n');
  const [x, a] = two.rootNode.children;
  const up = executeCommand(two, { type: 'selectNodeUp' }, two.selectionOf([a!.id], 'up'));
  assert.ok(up.status === 'applied');
  assert.deepEqual(two.selectedSubtrees(up.selection), [x!.id, a!.id]);
  // expandSelection from each whole-line shape, either way: the same next rung
  for (const doc of DOCS.slice(0, 300)) {
    for (const node of nodesOf(doc).filter((n) => !doc.isHidden(n)).slice(0, 8)) {
      const sel = doc.selectionOf([node.id]);
      const want = executeCommand(doc, { type: 'expandSelection' }, sel);
      const { starts, ends } = doc.mdTree;
      const last = doc.selectedNodes(sel)!.at(-1)!;
      const gapEnd = ends[doc.coverEnd(last)]!;
      for (const to of [ends[last.endLine]!, gapEnd]) {
        if (to <= sel.anchor || to === starts[last.endLine]) continue;
        for (const shape of [{ anchor: sel.anchor, head: to }, { anchor: to, head: sel.anchor }]) {
          if (!doc.selectedNodes(shape)) continue;
          const got = executeCommand(doc, { type: 'expandSelection' }, shape);
          assert.equal(got.status, want.status, `${show(doc, shape)}`);
          if (got.status === 'applied' && want.status === 'applied') assert.deepEqual(doc.selectedSubtrees(got.selection) ?? got.selection, doc.selectedSubtrees(want.selection) ?? want.selection, `${show(doc, shape)}`);
        }
      }
    }
  }
});

test('typing over the whole document (a select all) is the host\'s: the text replaced, no node kept', () => {
  for (const text of ['- a\n  - a1\n- b\n', '# T\n\nbody\n\n- a\n']) {
    const doc = docOf(text);
    const all = { anchor: 0, head: text.length };
    assert.ok(doc.selectedSubtrees(all), 'a subtree selection still');
    assert.equal(executeCommand(doc, { type: 'insertText', text: 'x' }, all).status, 'deferredToHost');
    assert.equal(executeCommand(doc, { type: 'pastePlain', text: 'x' }, all).status, 'deferredToHost');
    // the keys that act on nodes still do
    const deleted = executeCommand(doc, { type: 'deleteContentForward' }, all);
    assert.ok(deleted.status === 'applied' && deleted.doc.blank);
  }
});
