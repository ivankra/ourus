// The drop pass (dev/20-drag.md §6): at every start of the spec, every node picked up and dropped at
// every place its pickup lists, offered or not, and a few clipboards dragged in from outside, each
// dropped at every place its drag lists. A refusal is an outcome; a drop that fails to write,
// is `unsupported`, or is refused by the result check alone (a node moved that no rule names) is a gap,
// as is a place whose `converts` says otherwise than its drop's result, or an own place that changes
// something.
//
//   node test/drops.ts          # the report: each case's gaps

import { executeCommand, type CommandResult, type DropMap } from '../src/commands/index.ts';
import type { OurusDoc } from '../src/doc/index.ts';
import { docOf, nodesOf, readDrawing } from './drawing.ts';
import { flavorsOf } from './spec-run.ts';
import { readSpecFile, specConfig, specFiles, type SpecTest } from './specfile.ts';

/**
 * The starts whose drops have gaps yet, and why, each a writer's or a rule's to close: the drop pass
 * (`drops.test.ts`) fails on a new one and on one with none now, so the list only shrinks; the inverse
 * pairs report a write failure at one without failing on it.
 */
export const KNOWN: Readonly<Record<string, string>> = {
  // an indented code block, under `listParent: block`, adopting a list whose items aren't lined up: a
  // nested task moved first, where the code would be the task's (the seam check reads the task as
  // indented where it was)
  Regression60: 'a moved item read at its old indentation, the code after it its',
  // a heading dropped in between an item and its child, indented code a tab its item takes part of
  // starts: the draft lets it through, the writer's text reads otherwise (with spaces, refused as the
  // code joining the item, `not-expressible`)
  Indent45b: "a heading before a tab-indented code child, refused with spaces, written otherwise with tabs",
  Outdent22b: "a heading before a tab-indented code child, refused with spaces, written otherwise with tabs",
};

/** The clipboards dragged in at every start, each with the kind of its first node. */
const CLIPBOARDS: readonly (readonly [string, string])[] = [
  ['- x\n', 'item'],
  ['para\n', 'paragraph'],
  ['# H\nh\n', 'heading'],
  ['```\ncode\n```\n', 'atom'],
];

/** What is wrong with the drops at example `t`'s start: one line each. */
export function dropGaps(t: SpecTest): string[] {
  const start = readDrawing(t.initial.buffer);
  const flavor = flavorsOf(t)[0]!;
  const doc = docOf(start.text, start.placeholders, { flavor, ...specConfig(t.options) });
  const gaps: string[] = [];
  const pickups: { what: string; dropMap: DropMap; kind: (r: OurusDoc) => string | undefined; was: string }[] = [];
  for (const node of nodesOf(doc)) {
    const picked = executeCommand(doc, { type: 'drag', pressed: node.id }, start.selection);
    if (picked.status !== 'applied' || !picked.dropMap) continue;
    const first = doc.node(picked.dropMap.nodes[0]!)!;
    pickups.push({ what: `${first.kind} at line ${first.startLine + 1}`, dropMap: picked.dropMap, kind: (r) => r.node(first.id)?.kind, was: first.kind });
  }
  for (const [text, was] of CLIPBOARDS) {
    const picked = executeCommand(doc, { type: 'drag', clipboard: { 'text/plain': text } }, start.selection);
    if (picked.status !== 'applied' || !picked.dropMap) continue;
    // (the first node a drop placed, by its place: the node after `after`, or its parent's first)
    const kind = (r: OurusDoc, at: { parent: number | 'root'; after: number | null }): string | undefined => {
      const parent = at.parent === 'root' ? r.rootNode : r.node(at.parent);
      const k = at.after === null ? 0 : (parent?.children.findIndex((c) => c.id === at.after) ?? -2) + 1;
      return parent?.children[k]?.kind;
    };
    for (const seam of picked.dropMap.seams) for (const point of seam.points) pickups.push({ what: `${JSON.stringify(text)} dragged in`, dropMap: { ...picked.dropMap, seams: [{ ...seam, points: [point] }] }, kind: (r) => kind(r, point), was });
  }
  for (const { what, dropMap, kind, was } of pickups) {
    for (const seam of dropMap.seams) {
      for (const point of seam.points) {
        const where = `${what} to ${point.parent === 'root' ? 'the root' : `${doc.node(point.parent)!.kind} at line ${doc.node(point.parent)!.startLine + 1}`}, depth ${point.depth}`;
        let r: CommandResult;
        try {
          r = executeCommand(doc, point.drop, start.selection);
        } catch (e) {
          gaps.push(`${where}: throws ${(e as Error).message}`);
          continue;
        }
        if (r.status === 'rejected') {
          if (r.reason === 'write-failed' || r.reason === 'unsupported' || r.detail?.startsWith('result check')) gaps.push(`${where}: ${r.reason}${r.detail ? ` (${r.detail})` : ''}`);
          continue;
        }
        if (r.status !== 'applied') continue;
        if (point.current && r.changes.length) gaps.push(`${where}: its own place changes the text`);
        const landed = kind(r.doc);
        if (point.converts !== (landed !== was)) gaps.push(`${where}: converts says ${point.converts}, and it lands a ${landed}`);
      }
    }
  }
  return gaps;
}

/** Every example of the spec with gaps, by its name; one start read once, under the first case that has it. */
export function allDropGaps(): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const seen = new Set<string>();
  for (const file of specFiles()) {
    for (const t of readSpecFile(file)) {
      const key = `${flavorsOf(t)[0]} ${JSON.stringify(t.options)} ${readDrawing(t.initial.buffer).text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const gaps = dropGaps(t);
      if (gaps.length) out.set(t.name, gaps);
    }
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const gaps = allDropGaps();
  const total = [...gaps.values()].reduce((n, g) => n + g.length, 0);
  console.log(`${total} drops with gaps, in ${gaps.size} starts`);
  for (const [name, list] of gaps) {
    console.log(`\n${name}:`);
    for (const g of list) console.log(`  ${g}`);
  }
}
