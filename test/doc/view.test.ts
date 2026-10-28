// The view a snapshot carries: what a fold hides and a zoom shows, the row a
// fold belongs to, which folds a zoom suppresses, and the folds and the zoom through a change.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { executeCommand, leavesZoom } from '../../src/commands/index.ts';
import { OurusDoc, type OutlineNode } from '../../src/doc/index.ts';
import { BLOCKS, arbDoc, arbEdit, changeOf } from '../parser/generators.ts';

/** The node whose text starts with `text`. */
function find(doc: OurusDoc, text: string): OutlineNode {
  let found: OutlineNode | undefined;
  const visit = (node: OutlineNode): void => {
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
  assert.equal(doc.zoomRange(), null);
  const zoomed = doc.withZoom(a.id);
  assert.equal(hidden(zoomed, zoomed.zoomRange()), '- a\n  - b\n');
  assert.equal(zoomed.coverEnd(a), 3);
  assert.throws(() => doc.withZoom(0), /no node 0/);
  assert.throws(() => doc.withZoom(99), /no node 99/);
});

test('zoomed, the folds of the root and its ancestors hide nothing; the folds inside it do', () => {
  const doc = OurusDoc.parse('- A\n  - B\n    - C\n      - D\n');
  const [A, B, C] = ['A', 'B', 'C'].map((t) => find(doc, t).id);
  const view = doc.withFolded([A!, B!, C!]).withZoom(B!);
  assert.deepEqual([...view.folded].sort(), [A, B, C].sort(), 'every fold stays stored');
  assert.deepEqual([...view.zoomFolded], [C]);
  assert.equal(view.isHidden(find(view, 'B')), false, 'the root under its folded ancestor');
  assert.equal(view.isHidden(find(view, 'C')), false, 'the root\'s child, its fold suppressed');
  assert.equal(view.isHidden(find(view, 'D')), true, 'under a fold inside the zoom');
  assert.equal(view.isHidden(find(view, 'A')), true, 'outside the zoom');
  assert.deepEqual([...view.withZoom(null).zoomFolded].sort(), [A, B, C].sort());
});

test('`withFolded` keeps only nodes that fold; a fold changes nothing but the view', () => {
  const doc = OurusDoc.parse('- a\n  - b\n- c\n');
  const [a, c] = [find(doc, 'a').id, find(doc, 'c').id];
  const folded = doc.withFolded([a, c, 99]);
  assert.deepEqual([...folded.folded], [a]);
  assert.equal(folded.text, doc.text);
  assert.equal(folded.root, doc.root);
  assert.equal(doc.folded.size, 0, 'the snapshot it came from is as it was');
});

test('the folds and the zoom go through an update by id: dropped where their node goes or has no children left', () => {
  const doc = OurusDoc.parse('- a\n  - b\n- c\n  - d\n');
  const [a, c] = [find(doc, 'a').id, find(doc, 'c').id];
  const view = doc.withFolded([a, c]).withZoom(c);
  // typing elsewhere
  const typed = view.update([{ from: 3, to: 3, insert: 'x' }]);
  assert.deepEqual([...typed.folded].sort(), [a, c].sort());
  assert.equal(typed.zoom, c);
  // `b` deleted: `a` has nothing to hide
  const childless = view.update([{ from: 3, to: 9, insert: '' }]);
  assert.deepEqual([...childless.folded], [c]);
  // `c` and `d` deleted: the zoom goes
  const gone = view.update([{ from: 9, to: 20, insert: '' }]);
  assert.equal(gone.zoom, null);
});

test('an edit to a folded node\'s own markup that changes what it holds opens the fold', () => {
  // `## A` made `# A`: its section takes `## B`, which was shown and must not go hidden unseen
  const doc = OurusDoc.parse('## A\na\n\n## B\nb\n');
  const a = find(doc, '## A').id;
  const promoted = doc.withFolded([a]).update([{ from: 0, to: 1, insert: '' }]);
  assert.equal(promoted.textOf(promoted.node(a)!)?.text, '# A');
  assert.deepEqual([...promoted.folded], []);
  // typing in its title keeps it
  const typed = doc.withFolded([a]).update([{ from: 4, to: 4, insert: 'x' }]);
  assert.deepEqual([...typed.folded], [a]);
});

test('a folded node moved keeps its fold, the move writing its lines again (Fold4)', () => {
  const doc = OurusDoc.parse('- a\n- b\n  - c\n');
  const b = find(doc, 'b').id;
  const r = executeCommand(doc.withFolded([b]), { type: 'moveSubtreeUp' }, { anchor: 7, head: 7 });
  assert.equal(r.status, 'applied');
  if (r.status !== 'applied') return;
  assert.equal(r.doc.text, '- b\n  - c\n- a\n');
  assert.deepEqual([...r.doc.folded], [b]);
});

test('an undo given the snapshot before the move (`replace`\'s `like`) keeps its nodes, and the moved node\'s fold (Fold16)', () => {
  const before = OurusDoc.parse('- a\n- b\n  - c\n');
  const b = find(before, 'b').id;
  const r = executeCommand(before.withFolded([b]), { type: 'moveSubtreeUp' }, { anchor: 7, head: 7 });
  assert.equal(r.status, 'applied');
  if (r.status !== 'applied') return;
  const undone = r.doc.replace(before.text, before.marks.marks, { like: before });
  assert.equal(undone.text, before.text);
  assert.equal(find(undone, 'b').id, b);
  assert.deepEqual([...undone.folded], [b]);
  assert.ok(undone.nextId >= r.doc.nextId, 'no id given again');
  // without it, the lines written again are new nodes, and the fold is lost
  assert.notEqual(find(r.doc.replace(before.text, before.marks.marks), 'b').id, b);
  // a `like` of another text is no help: read as changes
  const other = OurusDoc.parse('- x\n');
  assert.equal(r.doc.replace(before.text, before.marks.marks, { like: other }).text, before.text);
});

test('`withConfig` carries the view: by id where the outline is read again, by line where the text is', () => {
  const doc = OurusDoc.parse('p\n- a\n  - b\n');
  const a = find(doc, 'a').id;
  const view = doc.withFolded([a]).withZoom(a);
  const writing = view.withConfig({ indentUnit: 4 });
  assert.deepEqual([...writing.folded], [a]);
  const reread = view.withConfig({ listParent: 'container' });
  assert.deepEqual([...reread.folded], [a]);
  assert.equal(reread.zoom, a);
  // a flavor parses anew: the ids start over, the state goes by line (GFM reads the front matter as a
  // rule and a setext heading, Obsidian as front matter, no node: the same id would be another node)
  const gfm = OurusDoc.parse('---\nt: 1\n---\n- a\n  - b\n', { config: { flavor: 'gfm' } });
  const before = find(gfm, 'a').id;
  const parsed = gfm.withFolded([before]).withZoom(before).withConfig({ flavor: 'obsidian' });
  const now = find(parsed, 'a').id;
  assert.notEqual(now, before);
  assert.deepEqual([...parsed.folded], [now]);
  assert.equal(parsed.zoom, now);
});

// Properties over generated documents and host edits: `update`'s carry (for an edit nothing could
// refuse) and `leavesZoom` (for one a host can) apart, each against its rule recomputed from the two
// snapshots.

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 200);

/** Every node but the root, in document order. */
function all(doc: OurusDoc): OutlineNode[] {
  const out: OutlineNode[] = [];
  const visit = (n: OutlineNode): void => {
    if (n.kind !== 'root') out.push(n);
    n.children.forEach(visit);
  };
  visit(doc.rootNode);
  return out;
}

const subtree = (n: OutlineNode): Set<number> => new Set(all({ rootNode: n } as OurusDoc).map((m) => m.id).concat(n.id));

/** `n`'s descendants, each by id, kind and text, in document order: what its fold hides, as nodes. */
const descendants = (doc: OurusDoc, n: OutlineNode): string =>
  JSON.stringify(all({ rootNode: n } as OurusDoc).filter((m) => m !== n).map((m) => [m.id, m.kind, doc.textOf(m)?.text ?? null]));

/** A snapshot of `text` with folds and a zoom picked by `picks` (fractions). */
function viewed(text: string, picks: readonly number[], zoomAt: number | null): OurusDoc {
  const doc = OurusDoc.parse(text);
  const nodes = all(doc);
  const folds = nodes.filter((n, k) => doc.foldRange(n) && picks.some((p) => Math.floor(p * nodes.length) === k)).map((n) => n.id);
  const zoom = zoomAt === null || !nodes.length ? null : nodes[Math.floor(zoomAt * nodes.length)]!.id;
  return doc.withFolded(folds).withZoom(zoom);
}

const fraction = fc.double({ min: 0, max: 0.999, noNaN: true });

test('an update carries the view by its rules: folds on nodes with something to hide, the zoom kept, moved up or ended', () => {
  fc.assert(
    fc.property(arbDoc(BLOCKS, { maxLines: 8 }), fc.array(fraction, { maxLength: 4 }), fc.option(fraction), arbEdit, (text, picks, zoomAt, edit) => {
      const doc = viewed(text, picks, zoomAt);
      const change = changeOf(doc.text, edit);
      const next = doc.update([change]);
      for (const id of next.folded) assert.ok(next.node(id) && next.foldRange(next.node(id)!), `fold ${id} hides nothing`);
      // a fold stays exactly where its node still hides something and, but for the zoom root's and
      // its ancestors', what it hides is the same nodes with the same texts, wherever the edit was
      const suppressed = new Set<number>();
      for (let p = doc.zoom === null ? null : doc.node(doc.zoom)!; p && p.kind !== 'root'; p = p.parent) suppressed.add(p.id);
      for (const id of doc.folded) {
        const now = next.node(id);
        const stays = !!now && !!next.foldRange(now) && (suppressed.has(id) || descendants(doc, doc.node(id)!) === descendants(next, now));
        assert.equal(next.folded.has(id), stays, `fold ${id} ${stays ? 'opened' : 'kept'}`);
      }
      if (doc.zoom === null) return assert.equal(next.zoom, null);
      const root = next.node(doc.zoom);
      if (!root) {
        // its nearest ancestor left, or none
        const ancestors: number[] = [];
        for (let p = doc.node(doc.zoom)!.parent; p && p.kind !== 'root'; p = p.parent) ancestors.push(p.id);
        return assert.equal(next.zoom, ancestors.find((id) => next.node(id)) ?? null);
      }
      const inside = subtree(root);
      const left = [...subtree(doc.node(doc.zoom)!)].some((id) => next.node(id) && !inside.has(id));
      assert.equal(next.zoom, left ? null : doc.zoom);
    }),
    { numRuns: RUNS },
  );
});

test('`leavesZoom` accepts a host\'s edit only where the text outside the zoom root\'s Markdown is the same', () => {
  fc.assert(
    fc.property(arbDoc(BLOCKS, { maxLines: 8 }), fraction, arbEdit, (text, zoomAt, edit) => {
      const doc = viewed(text, [], zoomAt);
      if (doc.zoom === null) return;
      const next = doc.update([changeOf(doc.text, edit)]);
      if (leavesZoom(doc, next)) return;
      const [root, now] = [doc.node(doc.zoom)!, next.node(doc.zoom)];
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
  const moved = executeCommand(doc, { type: 'moveSubtreeDown' }, { anchor: 6, head: 6 });
  assert.equal(moved.status, 'applied');
  if (moved.status !== 'applied') return;
  const other = doc.withFolded([b, d]);
  const taken = moved.doc.withViewOf(other, moved.changes);
  assert.deepEqual([...taken.folded].sort(), [b, d].sort());
  assert.equal(taken.text, moved.doc.text);
  // a replay of the changes gives the moved nodes new ids: their folds would be lost
  const replayed = other.update(moved.changes);
  assert.ok(replayed.folded.size < 2, 'a replay keeps the folds only by luck');
});

test('a host\'s own edit: refused where it changes the tightness of a list with an item off the root\'s path, accepted where the list is the root\'s alone', () => {
  const doc = OurusDoc.parse('- a\n  - b\n- c\n');
  const zoomed = doc.withZoom(find(doc, 'a').id);
  // a blank line before `b`: the outer list loose, `c` rendered otherwise
  assert.equal(leavesZoom(zoomed, zoomed.update([{ from: 3, to: 3, insert: '\n' }])), true);
  const alone = OurusDoc.parse('- a\n  - b\n');
  const zoomedAlone = alone.withZoom(find(alone, 'a').id);
  assert.equal(leavesZoom(zoomedAlone, zoomedAlone.update([{ from: 3, to: 3, insert: '\n' }])), false);
  // a hidden sibling's text changed: refused as the host's own, kept by an update another view made
  const typed = zoomed.update([{ from: 13, to: 13, insert: 'x' }]);
  assert.equal(leavesZoom(zoomed, typed), true);
  assert.equal(typed.zoom, zoomed.zoom);
});

test('zoomed, a container\'s prefix on the root\'s lines is the root\'s writing where the outline reads the same, refused where it doesn\'t', () => {
  const doc = OurusDoc.parse('> - a\n>   - b\n> c\n> - z\n');
  const zoomed = doc.withZoom(find(doc, 'b').id);
  // the `>` of `c`, a lazy line of `b`'s, dropped: every node the same, rendered the same
  const at = doc.text.indexOf('> c');
  assert.equal(leavesZoom(zoomed, zoomed.update([{ from: at, to: at + 2, insert: '' }])), false);
  // the `>` of the blank line in a quote's gap dropped: the quote ends there, `z` in another
  const gap = OurusDoc.parse('> - a\n>   - b\n>\n> - z\n');
  const zoomedGap = gap.withZoom(find(gap, 'a').id);
  const blank = gap.text.indexOf('>\n>');
  assert.equal(leavesZoom(zoomedGap, zoomedGap.update([{ from: blank, to: blank + 1, insert: '' }])), true);
});
