// The view (`OurusView`) over a snapshot: what a fold hides and a zoom shows, the row a
// fold belongs to, which folds a zoom suppresses, and the folds and the zoom through a change.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { executeCommand, leavesZoom, OurusSuccess } from '../../src/commands/index.ts';
import { OurusDoc, type OurusNode } from '../../src/doc/index.ts';
import { OurusView } from '../../src/view/index.ts';
import { BLOCKS, arbDoc, arbEdit, changeOf } from '../parser/generators.ts';

/** The node whose text starts with `text`. */
function find(doc: OurusDoc, text: string): OurusNode {
  let found: OurusNode | undefined;
  const visit = (node: OurusNode): void => {
    if (!found && doc.textOf(node)?.text.startsWith(text)) found = node;
    node.children.forEach(visit);
  };
  visit(doc.rootNode);
  assert.ok(found, `no node ${text}`);
  return found;
}

const hidden = (doc: OurusDoc, range: { from: number; to: number } | null): string | null => (range ? doc.text.slice(range.from, range.to) : null);

test('a fold hides from the end of its node\'s text to the end of its subtree\'s last line, the blank lines after it shown', () => {
  const doc = OurusDoc.parse('- a\n  - b\n\n- c\n');
  assert.equal(hidden(doc, doc.foldRange(find(doc, 'a'))), '\n  - b');
  assert.equal(doc.foldRange(find(doc, 'b')), null, 'a childless node does not fold');
  // a heading's section, sub-headings included
  const section = OurusDoc.parse('# H\n\np\n\n## S\n\nq\n\n# I\n');
  assert.equal(hidden(section, section.foldRange(find(section, '# H'))), '\n\np\n\n## S\n\nq');
  // a container's lines past its last descendant's text: the quote's last `>`
  const quoted = OurusDoc.parse('- a\n  > b\n  >\n- c\n', { config: { quotes: 'container' } });
  assert.equal(hidden(quoted, quoted.foldRange(find(quoted, 'a'))), '\n  > b\n  >');
});

test('the row a fold belongs to is the outermost node starting on it, not `nodeAtLine`\'s innermost', () => {
  const doc = OurusDoc.parse('> a\n>\n> b\n', { config: { quotes: 'container' } });
  assert.equal(doc.rowOwner(0)?.kind, 'quote');
  assert.equal(doc.nodeAtLine(0)?.kind, 'paragraph');
  assert.equal(doc.rowOwner(1), null, 'no node starts on a line of the quote\'s alone');
  const nested = OurusDoc.parse('- - a\n    - b\n  - c\n');
  const outer = nested.rowOwner(0)!;
  assert.equal(outer.children.length, 2);
  assert.equal(nested.textOf(nested.rowOwner(1)!)?.text, 'b');
});

test('a zoom shows its root\'s lines, its descendants\' and its trailing gap', () => {
  const doc = OurusDoc.parse('- x\n- a\n  - b\n\n- c\n');
  const a = find(doc, 'a');
  const view = OurusView.of(doc);
  assert.equal(view.zoomRange(), null);
  const zoomed = view.withZoom(a.id);
  assert.equal(hidden(zoomed.doc, zoomed.zoomRange()), '- a\n  - b\n');
  assert.equal(zoomed.doc.coverEnd(a), 3);
  assert.throws(() => view.withZoom(0), /no node 0/);
  assert.throws(() => view.withZoom(99), /no node 99/);
});

test('zoomed, the folds of the root and its ancestors hide nothing; the folds inside it do', () => {
  const doc = OurusDoc.parse('- A\n  - B\n    - C\n      - D\n');
  const [A, B, C] = ['A', 'B', 'C'].map((t) => find(doc, t).id);
  const view = OurusView.of(doc).withFolded([A!, B!, C!]).withZoom(B!);
  assert.deepEqual([...view.folded].sort(), [A, B, C].sort(), 'every fold stays stored');
  assert.deepEqual([...view.zoomFolded], [C]);
  assert.equal(view.isHidden(find(view.doc, 'B')), false, 'the root under its folded ancestor');
  assert.equal(view.isHidden(find(view.doc, 'C')), false, 'the root\'s child, its fold suppressed');
  assert.equal(view.isHidden(find(view.doc, 'D')), true, 'under a fold inside the zoom');
  assert.equal(view.isHidden(find(view.doc, 'A')), true, 'outside the zoom');
  assert.deepEqual([...view.withZoom(null).zoomFolded].sort(), [A, B, C].sort());
});

test('`withFolded` keeps only nodes that fold; a fold changes nothing but the view', () => {
  const doc = OurusDoc.parse('- a\n  - b\n- c\n');
  const [a, c] = [find(doc, 'a').id, find(doc, 'c').id];
  const view = OurusView.of(doc);
  const folded = view.withFolded([a, c, 99]);
  assert.deepEqual([...folded.folded], [a]);
  assert.equal(folded.doc.text, doc.text);
  assert.equal(folded.doc.root, doc.root);
  assert.equal(view.folded.size, 0, 'the view it came from is as it was');
});

test('the folds and the zoom go through an update by id: dropped where their node goes or has no children left', () => {
  const doc = OurusDoc.parse('- a\n  - b\n- c\n  - d\n');
  const [a, c] = [find(doc, 'a').id, find(doc, 'c').id];
  const view = OurusView.of(doc).withFolded([a, c]).withZoom(c);
  // typing elsewhere
  const typed = view.update({ changes: [{ from: 3, to: 3, insert: 'x' }] });
  assert.deepEqual([...typed.folded].sort(), [a, c].sort());
  assert.equal(typed.zoom, c);
  // `b` deleted: `a` has nothing to hide
  const childless = view.update({ changes: [{ from: 3, to: 9, insert: '' }] });
  assert.deepEqual([...childless.folded], [c]);
  // `c` and `d` deleted: the zoom goes
  const gone = view.update({ changes: [{ from: 9, to: 20, insert: '' }] });
  assert.equal(gone.zoom, null);
});

test('an edit to a folded node\'s own markup that changes what it holds opens the fold', () => {
  // `## A` made `# A`: its section takes `## B`, which was shown and must not go hidden unseen
  const doc = OurusDoc.parse('## A\na\n\n## B\nb\n');
  const a = find(doc, '## A').id;
  const promoted = OurusView.of(doc).withFolded([a]).update({ changes: [{ from: 0, to: 1, insert: '' }] });
  assert.equal(promoted.doc.textOf(promoted.doc.node(a)!)?.text, '# A');
  assert.deepEqual([...promoted.folded], []);
  // typing in its title keeps it
  const typed = OurusView.of(doc).withFolded([a]).update({ changes: [{ from: 4, to: 4, insert: 'x' }] });
  assert.deepEqual([...typed.folded], [a]);
});

test('a folded node moved keeps its fold, the move writing its lines again (Fold4)', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n');
  const b = find(doc, 'b').id;
  const r = executeCommand(OurusView.of(doc).withFolded([b]), { type: 'moveSubtreeUp' }, { anchor: 7, head: 7 });
  assert.ok(r instanceof OurusSuccess);
  if (!(r instanceof OurusSuccess)) return;
  assert.equal(r.view.doc.text, '- b\n  - c\n- a\n');
  assert.deepEqual([...r.view.folded], [b]);
});

test('an undo that takes back the snapshot before the move (`withDoc`) keeps its nodes, and the moved node\'s fold (Fold16)', () => {
  const before = OurusDoc.parse('- a\n- b\n  - c\n');
  const b = find(before, 'b').id;
  const r = executeCommand(OurusView.of(before).withFolded([b]), { type: 'moveSubtreeUp' }, { anchor: 7, head: 7 });
  assert.ok(r instanceof OurusSuccess);
  if (!(r instanceof OurusSuccess)) return;
  const undone = r.view.withDoc(before);
  assert.equal(undone.doc.text, before.text);
  assert.equal(find(undone.doc, 'b').id, b);
  assert.deepEqual([...undone.folded], [b]);
  // no id given again: a node made after the undo has one past every node the move made
  const added = undone.update({ changes: [{ from: undone.doc.text.length, to: undone.doc.text.length, insert: '- d\n' }] });
  assert.ok(find(added.doc, 'd').id >= r.view.doc.nextId, 'no id given again');
  // the text given whole instead, the lines written again are new nodes, and the fold is lost
  assert.notEqual(find(r.view.doc.update({ text: before.text, setMarks: before.marks.marks }), 'b').id, b);
  // a snapshot of another document is no undo's
  const other = OurusDoc.parse(before.text);
  assert.equal(other.isSameLineage(before), false);
  assert.throws(() => r.view.withDoc(other), /another lineage/);
});

test('`withConfig` carries the view: by id where the outline is read again, by line where the text is', () => {
  const doc = OurusDoc.parse('p\n- a\n  - b\n');
  const a = find(doc, 'a').id;
  const view = OurusView.of(doc).withFolded([a]).withZoom(a);
  const writing = view.withConfig({ indentUnit: 4 });
  assert.deepEqual([...writing.folded], [a]);
  const reread = view.withConfig({ listParent: 'container' });
  assert.deepEqual([...reread.folded], [a]);
  assert.equal(reread.zoom, a);
  // a flavor parses anew: the ids start over, the state goes by line (GFM reads the front matter as a
  // rule and a setext heading, Obsidian as front matter, no node: the same id would be another node)
  const gfm = OurusDoc.parse('---\nt: 1\n---\n- a\n  - b\n', { config: { flavor: 'gfm' } });
  const before = find(gfm, 'a').id;
  const parsed = OurusView.of(gfm).withFolded([before]).withZoom(before).withConfig({ flavor: 'obsidian' });
  const now = find(parsed.doc, 'a').id;
  assert.notEqual(now, before);
  assert.deepEqual([...parsed.folded], [now]);
  assert.equal(parsed.zoom, now);
});

// Properties over generated documents and host edits: `update`'s carry (for an edit nothing could
// refuse) and `leavesZoom` (for one a host can) apart, each against its rule recomputed from the two
// snapshots.

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 200);

/** Every node but the root, in document order. */
function all(doc: OurusDoc): OurusNode[] {
  const out: OurusNode[] = [];
  const visit = (n: OurusNode): void => {
    if (n.kind !== 'root') out.push(n);
    n.children.forEach(visit);
  };
  visit(doc.rootNode);
  return out;
}

const subtree = (n: OurusNode): Set<number> => new Set(all({ rootNode: n } as OurusDoc).map((m) => m.id).concat(n.id));

/**
 * `n`'s descendants, each by id, kind and text, in document order: what its fold hides, as nodes (but
 * the text of one all on `n`'s last line of text, which the fold shows).
 */
const descendants = (doc: OurusDoc, n: OurusNode): string =>
  JSON.stringify(all({ rootNode: n } as OurusDoc).filter((m) => m !== n).map((m) => [m.id, m.kind, m.textLastLine <= n.textLastLine ? null : (doc.textOf(m)?.text ?? null)]));

/** A view of `text` with folds and a zoom picked by `picks` (fractions). */
function viewed(text: string, picks: readonly number[], zoomAt: number | null): OurusView {
  const doc = OurusDoc.parse(text);
  const nodes = all(doc);
  const folds = nodes.filter((n, k) => doc.foldRange(n) && picks.some((p) => Math.floor(p * nodes.length) === k)).map((n) => n.id);
  const zoom = zoomAt === null || !nodes.length ? null : nodes[Math.floor(zoomAt * nodes.length)]!.id;
  return OurusView.of(doc).withFolded(folds).withZoom(zoom);
}

const fraction = fc.double({ min: 0, max: 0.999, noNaN: true });

test('an update carries the view by its rules: folds on nodes with something to hide, the zoom kept, moved up or ended', () => {
  fc.assert(
    fc.property(arbDoc(BLOCKS, { maxLines: 8 }), fc.array(fraction, { maxLength: 4 }), fc.option(fraction), arbEdit, (text, picks, zoomAt, edit) => {
      const view = viewed(text, picks, zoomAt);
      const doc = view.doc;
      const change = changeOf(doc.text, edit);
      const after = view.update({ changes: [change] });
      const next = after.doc;
      for (const id of after.folded) assert.ok(next.node(id) && next.foldRange(next.node(id)!), `fold ${id} hides nothing`);
      // a fold stays exactly where its node still hides something and, but for the zoom root's and
      // its ancestors', what it hides is the same nodes with the same texts, wherever the edit was
      const suppressed = new Set<number>();
      for (let p = view.zoom === null ? null : doc.node(view.zoom)!; p && p.kind !== 'root'; p = p.parent) suppressed.add(p.id);
      for (const id of view.folded) {
        const now = next.node(id);
        const stays = !!now && !!next.foldRange(now) && (suppressed.has(id) || descendants(doc, doc.node(id)!) === descendants(next, now));
        assert.equal(after.folded.has(id), stays, `fold ${id} ${stays ? 'opened' : 'kept'}`);
      }
      if (view.zoom === null) return assert.equal(after.zoom, null);
      const root = next.node(view.zoom);
      if (!root) {
        // its nearest ancestor left, or none
        const ancestors: number[] = [];
        for (let p = doc.node(view.zoom)!.parent; p && p.kind !== 'root'; p = p.parent) ancestors.push(p.id);
        return assert.equal(after.zoom, ancestors.find((id) => next.node(id)) ?? null);
      }
      const inside = subtree(root);
      const left = [...subtree(doc.node(view.zoom)!)].some((id) => next.node(id) && !inside.has(id));
      assert.equal(after.zoom, left ? null : view.zoom);
    }),
    { numRuns: RUNS },
  );
});

test('`leavesZoom` accepts a host\'s edit only where the text outside the zoom root\'s Markdown is the same', () => {
  fc.assert(
    fc.property(arbDoc(BLOCKS, { maxLines: 8 }), fraction, arbEdit, (text, zoomAt, edit) => {
      const view = viewed(text, [], zoomAt);
      const doc = view.doc;
      if (view.zoom === null) return;
      const next = view.update({ changes: [changeOf(doc.text, edit)] }).doc;
      if (leavesZoom(view, next)) return;
      const [root, now] = [doc.node(view.zoom)!, next.node(view.zoom)];
      if (!now) return;
      assert.equal(next.text.slice(0, next.markdownStart(now)), doc.text.slice(0, doc.markdownStart(root)));
      assert.equal(next.text.slice(next.mdTree.ends[next.coverEnd(now)]!), doc.text.slice(doc.mdTree.ends[doc.coverEnd(root)]!));
    }),
    { numRuns: RUNS },
  );
});

test('a second view takes a command\'s snapshot with its own folds, by the writer\'s ids, never a replay\'s', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n- d\n  - e\n');
  const [b, d] = [find(doc, 'b').id, find(doc, 'd').id];
  // view 1 moves `b` down; view 2 has `b` and `d` folded
  const moved = executeCommand(OurusView.of(doc), { type: 'moveSubtreeDown' }, { anchor: 6, head: 6 });
  assert.ok(moved instanceof OurusSuccess);
  if (!(moved instanceof OurusSuccess)) return;
  const other = OurusView.of(doc).withFolded([b, d]);
  const taken = other.withDoc(moved.view.doc, moved.changes);
  assert.deepEqual([...taken.folded].sort(), [b, d].sort());
  assert.equal(taken.doc.text, moved.view.doc.text);
  // a replay of the changes gives the moved nodes new ids: their folds would be lost
  const replayed = other.update({ changes: moved.changes });
  assert.ok(replayed.folded.size < 2, 'a replay keeps the folds only by luck');
});

test('a host\'s own edit: refused where it changes the tightness of a list with an item off the root\'s path, accepted where the list is the root\'s alone', () => {
  const doc = OurusDoc.parse('- a\n  - b\n- c\n');
  const zoomed = OurusView.of(doc).withZoom(find(doc, 'a').id);
  // a blank line before `b`: the outer list loose, `c` rendered otherwise
  assert.equal(leavesZoom(zoomed, zoomed.update({ changes: [{ from: 3, to: 3, insert: '\n' }] }).doc), true);
  const alone = OurusDoc.parse('- a\n  - b\n');
  const zoomedAlone = OurusView.of(alone).withZoom(find(alone, 'a').id);
  assert.equal(leavesZoom(zoomedAlone, zoomedAlone.update({ changes: [{ from: 3, to: 3, insert: '\n' }] }).doc), false);
  // a hidden sibling's text changed: refused as the host's own, kept by an update another view made
  const typed = zoomed.update({ changes: [{ from: 13, to: 13, insert: 'x' }] });
  assert.equal(leavesZoom(zoomed, typed.doc), true);
  assert.equal(typed.zoom, zoomed.zoom);
});

test('zoomed, a container\'s prefix on the root\'s lines is the root\'s writing where the outline reads the same, refused where it doesn\'t', () => {
  const doc = OurusDoc.parse('> - a\n>   - b\n> c\n> - z\n');
  const zoomed = OurusView.of(doc).withZoom(find(doc, 'b').id);
  // the `>` of `c`, a lazy line of `b`'s, dropped: every node the same, rendered the same
  const at = doc.text.indexOf('> c');
  assert.equal(leavesZoom(zoomed, zoomed.update({ changes: [{ from: at, to: at + 2, insert: '' }] }).doc), false);
  // the `>` of the blank line in a quote's gap dropped: the quote ends there, `z` in another
  const gap = OurusDoc.parse('> - a\n>   - b\n>\n> - z\n');
  const zoomedGap = OurusView.of(gap).withZoom(find(gap, 'a').id);
  const blank = gap.text.indexOf('>\n>');
  assert.equal(leavesZoom(zoomedGap, zoomedGap.update({ changes: [{ from: blank, to: blank + 1, insert: '' }] }).doc), true);
});

test('an edit in the node right after a folded one opens the fold exactly where what it hides changes', () => {
  // (the window a change is looked for in reaches past the line after the cover: an edit starting
  // inside it, `##` made `###`, a setext underline changed, can grow the fold's section)
  fc.assert(
    fc.property(arbDoc(BLOCKS, { maxLines: 8 }), (text) => {
      const base = OurusDoc.parse(text);
      for (const n of all(base)) {
        if (!base.foldRange(n)) continue;
        const view = OurusView.of(base).withFolded([n.id]);
        const doc = view.doc;
        for (let line = doc.coverEnd(n) + 1; line <= doc.coverEnd(n) + 2 && line < doc.lineCount; line++) {
          for (let at = doc.mdTree.starts[line]!; at <= doc.mdTree.ends[line]!; at++) {
            for (const change of [{ from: at, to: at, insert: '#' }, { from: at, to: Math.min(at + 1, doc.mdTree.ends[line]!), insert: '' }, { from: at, to: Math.min(at + 3, doc.mdTree.ends[line]!), insert: 'x' }]) {
              const after = view.update({ changes: [change] });
              const next = after.doc;
              const now = next.node(n.id);
              const stays = !!now && !!next.foldRange(now) && descendants(doc, n) === descendants(next, now);
              assert.equal(after.folded.has(n.id), stays, `${JSON.stringify(text)} ${JSON.stringify(change)}: fold ${stays ? 'opened' : 'kept'}`);
            }
          }
        }
      }
    }),
    { numRuns: RUNS },
  );
});

test('a fold on a row its first child shares stays through an edit of the row\'s text, and opens for one of what it hides', () => {
  const doc = OurusDoc.parse('- - a\n  - SECRET\n- KEEP');
  const folded = OurusView.of(doc).withFolded([doc.rootNode.children[0]!.id]);
  const typed = folded.update({ changes: [{ from: 5, to: 5, insert: 'x' }], caret: 6 });
  assert.equal(typed.doc.text, '- - ax\n  - SECRET\n- KEEP');
  assert.deepEqual([...typed.folded], [doc.rootNode.children[0]!.id]);
  const hidden = folded.update({ changes: [{ from: 14, to: 14, insert: 'x' }], caret: 15 });
  assert.deepEqual([...hidden.folded], []);
});

test('read anew, a zoom or a fold on a row nodes share stays on the node at its depth there', () => {
  const doc = OurusDoc.parse('- - a\n  - sibling\n- outside');
  const zoomed = OurusView.of(doc).withZoom(doc.nodeAtLine(0)!.id);
  assert.deepEqual(zoomed.zoomRange(), { from: 0, to: 5 });
  assert.deepEqual(zoomed.withConfig({ flavor: 'obsidian' }).zoomRange(), { from: 0, to: 5 });
  const nested = OurusDoc.parse('- - a\n    - x\n  - sibling');
  const inner = nested.nodeAtLine(0)!;
  const read = OurusView.of(nested).withFolded([inner.id]).withConfig({ flavor: 'obsidian' });
  assert.deepEqual([...read.folded].map((id) => read.doc.node(id)!.depth), [inner.depth]);
});

test('a view toggled shares its document; a view command\'s result too, a text command\'s not', () => {
  const view = OurusView.of(OurusDoc.parse('- a\n  - b\n- c\n'));
  const a = find(view.doc, 'a');
  const folded = view.withFolded([a.id]);
  assert.equal(folded.doc, view.doc);
  assert.notEqual(folded, view);
  assert.equal(folded.withFolded([a.id]), folded, 'the same folds: the same view');
  assert.equal(view.withZoom(null), view);
  const fold = executeCommand(view, { type: 'fold' }, { anchor: 2, head: 2 });
  assert.equal(fold instanceof OurusSuccess && fold.view.doc, view.doc);
  const indented = executeCommand(view, { type: 'indent' }, { anchor: 12, head: 12 });
  assert.ok(indented instanceof OurusSuccess && indented.view.doc !== view.doc);
});

test('an update given nothing to do is the same document, and the same view', () => {
  const doc = OurusDoc.parse('- a\n  - b\n');
  assert.equal(doc.update({}), doc);
  assert.equal(doc.update({ caret: 3 }), doc);
  assert.equal(doc.update({ text: doc.text }), doc);
  const view = OurusView.of(doc, { folded: [find(doc, 'a').id] });
  assert.equal(view.update({}), view);
  assert.equal(view.withDoc(doc), view);
});

test('a move that changes no character is another document, its ids swapped, a fold with its node', () => {
  const same = OurusView.of(OurusDoc.parse('- a\n- a\n'));
  const before = same.doc.rootNode.children.map((n) => n.id);
  const moved = executeCommand(same, { type: 'moveSubtreeDown' }, { anchor: 2, head: 2 });
  assert.ok(moved instanceof OurusSuccess);
  assert.deepEqual(moved.changes, []);
  assert.notEqual(moved.view.doc, same.doc);
  assert.equal(moved.view.doc.text, same.doc.text);
  assert.deepEqual(moved.view.doc.rootNode.children.map((n) => n.id), [...before].reverse());
  const doc = OurusDoc.parse('- a\n  - x\n- a\n  - x\n');
  const first = doc.rootNode.children[0]!.id;
  const r = executeCommand(OurusView.of(doc, { folded: [first] }), { type: 'moveSubtreeDown' }, { anchor: 2, head: 2 });
  assert.ok(r instanceof OurusSuccess);
  assert.deepEqual(r.changes, []);
  assert.equal(r.view.doc.rootNode.children[1]!.id, first);
  assert.deepEqual([...r.view.folded], [first]);
});

test('a selection command keeps the view and changes the selection alone', () => {
  const view = OurusView.of(OurusDoc.parse('- a\n'));
  const r = executeCommand(view, { type: 'selectNode' }, { anchor: 2, head: 2 });
  assert.ok(r instanceof OurusSuccess);
  assert.equal(r.view, view);
  assert.deepEqual(r.selection, { anchor: 0, head: 4 });
});

test('placeholders settled in two steps carry the view through each: the fold kept (Fold20)', async () => {
  const { settlePlaceholders } = await import('../../src/commands/index.ts');
  const { createPlaceholder } = await import('../../src/text/index.ts');
  const doc = OurusDoc.parse('\n# h\n> - \n> ^x\n', { config: { flavor: 'obsidian' }, marks: [createPlaceholder(0), createPlaceholder(9)] });
  const heading = find(doc, '# h');
  const view = OurusView.of(doc, { folded: [heading.id] });
  const settled = settlePlaceholders(view, 1);
  assert.ok(settled);
  assert.deepEqual([...settled.view.folded], [heading.id]);
  // (one carry over both steps, from the start to the end, would open it)
  assert.deepEqual([...view.withDoc(settled.view.doc, settled.changes).folded], []);
});
