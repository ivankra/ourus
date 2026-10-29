// The view, exhaustively: every distinct start buffer the spec draws, with each
// node that folds folded alone, each node as the zoom root, and each as the zoom root with every node
// that folds folded (the root's and its ancestors' folds suppressed, the ones inside in effect); every
// editing command at every line's text start, middle and end that the view shows. A run fails where
// the result breaks the view's rules, each read apart from the command's own checks:
//
//   hidden        the result's selection in lines the view hides
//   folded        a fold on a node with nothing to hide
//   escape        zoomed, an applied result that changes what is outside the zoom root: the text
//                 before its Markdown or after its cover, or the outline outside its subtree read
//                 without ids (each node's kind and text, where its list starts, and the tightness
//                 of every list with an item off the root's path)
//   deferred      zoomed, a deferral of a key whose default is a plain edit in every host (typing,
//                 Backspace, Delete, a soft line's Backspace), played here, that leaves the zoom
//                 (`leavesZoom`): ourus refuses those itself (`zoomed`'s guard). Enter's default
//                 differs by host (it continues the markup, or indents): the host's own guard
//   confined      zoomed, an editing command given a node outside the zoom and not refused
//                 `outside-zoom`, or a view command at one (zoom in, fold) not applied as a view's
//   write-failed  the writer failed, a bug
//   exception     the command threw
//
// Each group's count is held to a baseline (`view-exhaustive.baseline.json`) on the same corpus, so
// a new kind of failure, or more of one, fails the run; the baseline only shrinks.
//
//   node test/view-exhaustive.ts                 # the report, against the baseline
//   VIEW_UPDATE=1 node test/view-exhaustive.ts   # the same, then its counts as the new baseline
//   VIEW_EXAMPLES=8 node test/view-exhaustive.ts # examples per group (default 3)

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { executeCommand, leavesZoom, type OurusCommand } from '../src/commands/index.ts';
import { visibleSelection } from '../src/commands/view.ts';
import type { OurusDoc, OurusNode } from '../src/doc/index.ts';
import type { ChangeSpec } from '../src/text/index.ts';
import { docOf, drawDoc, readDrawing } from './drawing.ts';
import { readSpecFile, specConfig, specFiles } from './specfile.ts';

const COMMANDS: readonly OurusCommand[] = [
  { type: 'enter' },
  { type: 'shiftEnter' },
  { type: 'deleteContentBackward' },
  { type: 'deleteContentForward' },
  { type: 'deleteSoftLineBackward' },
  { type: 'indent' },
  { type: 'outdent' },
  { type: 'moveSubtreeUp' },
  { type: 'moveSubtreeDown' },
  { type: 'duplicateSubtree' },
  { type: 'deleteSubtree' },
  { type: 'cut' },
  { type: 'insertText', text: 'x' },
];

/** The editing commands that take `nodes`: given one outside the zoom, each refused before it runs. */
const WITH_NODES = ['indent', 'outdent', 'moveSubtreeUp', 'moveSubtreeDown', 'duplicateSubtree', 'deleteSubtree', 'cut'] as const;

const examples = Number(process.env.VIEW_EXAMPLES ?? 3);
const groups = new Map<string, { runs: number; examples: string[] }>();
const fail = (group: string, example: () => string): void => {
  const g = groups.get(group) ?? { runs: 0, examples: [] };
  g.runs++;
  if (g.examples.length < examples) g.examples.push(example());
  groups.set(group, g);
};

/** Every node but the root, in document order. */
function nodes(doc: OurusDoc): OurusNode[] {
  const out: OurusNode[] = [];
  const visit = (n: OurusNode): void => {
    if (n.kind !== 'root') out.push(n);
    n.children.forEach(visit);
  };
  visit(doc.rootNode);
  return out;
}

/** Whether `n` is `root` or inside it. */
const inside = (n: OurusNode | null, root: OurusNode): boolean => !!n && (n === root || inside(n.parent, root));

/**
 * The outline outside `root`'s subtree as a reader sees it, ids aside: each node's depth, kind and
 * text, where an item's list starts, and the tightness of each list with an item off the root's path
 * (one whose items are all on it renders nothing else differently); the root's subtree
 * one line.
 */
function outsideShape(doc: OurusDoc, root: OurusNode): string {
  const path = new Set<OurusNode>();
  for (let p: OurusNode | null = root; p; p = p.parent) path.add(p);
  const out: string[] = [];
  const visit = (n: OurusNode, depth: number): void => {
    if (n === root) return void out.push(`${depth} the zoom root`);
    if (n.kind !== 'root') {
      let line = `${depth} ${n.kind} ${JSON.stringify(doc.textOf(n)?.text ?? null)}`;
      if (n.kind === 'item') {
        const list = doc.listOf(n)?.block;
        const items = n.parent!.children.filter((c) => c.kind === 'item' && doc.listOf(c)?.block === list);
        line += items[0] === n ? ', a list starts' : '';
        if (!items.every((c) => path.has(c))) line += list?.attrs.tight ? ', tight' : ', loose';
      }
      out.push(line);
    }
    n.children.forEach((c) => visit(c, depth + 1));
  };
  visit(doc.rootNode, 0);
  return out.join('\n');
}

/** What `next` changed outside `doc`'s zoom root (kept, not removed), or null. */
function outsideChange(doc: OurusDoc, next: OurusDoc): string | null {
  const root = doc.node(doc.zoom!)!;
  const now = next.node(root.id)!;
  if (doc.text.slice(0, doc.markdownStart(root)) !== next.text.slice(0, next.markdownStart(now))) return 'the text before the root';
  if (doc.text.slice(doc.mdTree.ends[doc.coverEnd(root)]!) !== next.text.slice(next.mdTree.ends[next.coverEnd(now)]!)) return 'the text after the cover';
  return outsideShape(doc, root) === outsideShape(next, now) ? null : 'the outline outside';
}

/** The default of a key at a caret where every host's is a plain edit: the change and the caret after. */
function hostDefault(doc: OurusDoc, type: OurusCommand['type'], pos: number): { change: ChangeSpec; caret: number } | null {
  switch (type) {
    case 'insertText':
      return { change: { from: pos, to: pos, insert: 'x' }, caret: pos + 1 };
    case 'deleteContentBackward':
      return pos > 0 ? { change: { from: pos - 1, to: pos, insert: '' }, caret: pos - 1 } : null;
    case 'deleteContentForward':
      return pos < doc.text.length ? { change: { from: pos, to: pos + 1, insert: '' }, caret: pos } : null;
    case 'deleteSoftLineBackward': {
      const from = doc.lineAt(pos).from < pos ? doc.lineAt(pos).from : pos - 1;
      return from >= 0 ? { change: { from, to: pos, insert: '' }, caret: from } : null;
    }
    default:
      return null;
  }
}

function play(doc: OurusDoc, view: string): number {
  let runs = 0;
  const positions = new Set<number>();
  for (let i = 0; i < doc.lineCount; i++) {
    const [start, end] = [doc.textStart(i), doc.mdTree.ends[i]!];
    positions.add(start).add(end);
    if (end - start > 1) positions.add(start + ((end - start) >> 1));
  }
  for (const pos of positions) {
    const selection = { anchor: pos, head: pos };
    if (visibleSelection(doc, selection) !== selection) continue;
    for (const command of COMMANDS) {
      runs++;
      const where = (): string => `${view}, ${command.type} at ${JSON.stringify(drawDoc(doc, selection))}`;
      let result;
      try {
        result = executeCommand(doc, command, selection);
      } catch (e) {
        fail('exception', () => `${where()}: ${(e as Error).message}`);
        continue;
      }
      if (result.status === 'rejected' && result.reason === 'write-failed') fail('write-failed', where);
      if (result.status === 'deferredToHost' && doc.zoom !== null) {
        const host = hostDefault(doc, command.type, pos);
        if (host && leavesZoom(doc, doc.update({ changes: [host.change], caret: host.caret }))) fail(`deferred ${command.type}`, where);
      }
      if (result.status !== 'applied') continue;
      const next = result.doc;
      if (visibleSelection(next, result.selection) !== result.selection) fail('hidden', () => `${where()} → ${JSON.stringify(drawDoc(next, result.selection))}`);
      if ([...next.folded].some((id) => !next.node(id) || !next.foldRange(next.node(id)!))) fail('folded', where);
      if (doc.zoom !== null && result.changes.length && next.node(doc.zoom)) {
        const changed = outsideChange(doc, next);
        if (changed) fail('escape', () => `${where()} → ${JSON.stringify(drawDoc(next, result.selection))}: ${changed}`);
      }
    }
  }
  if (doc.zoom !== null) runs += confined(doc, view);
  return runs;
}

/** Zoomed: the editing commands refuse a node outside the zoom; zoom in and fold take one, as a view's. */
function confined(doc: OurusDoc, view: string): number {
  let runs = 0;
  const root = doc.node(doc.zoom!)!;
  const caret = doc.textStart(root.startLine);
  const selection = { anchor: caret, head: caret };
  for (const n of nodes(doc).filter((m) => !inside(m, root))) {
    for (const type of WITH_NODES) {
      runs++;
      const result = executeCommand(doc, { type, nodes: [n.id] }, selection);
      if (result.status !== 'rejected' || result.reason !== 'outside-zoom') fail('confined', () => `${view}, ${type} of ${n.kind} ${n.id}: ${result.status}`);
    }
    for (const command of [{ type: 'zoomIn', nodes: [n.id] }, ...(doc.foldRange(n) ? [{ type: 'fold', nodes: [n.id] }] : [])] as OurusCommand[]) {
      runs++;
      const result = executeCommand(doc, command, selection);
      // (an ancestor of the root: its fold suppressed while zoomed, left alone)
      const folds = inside(root, n) ? doc.folded.has(n.id) : true;
      const ok = result.status === 'applied' && result.doc.text === doc.text && !result.changes.length && (command.type === 'zoomIn' ? result.doc.zoom === n.id : result.doc.folded.has(n.id) === folds);
      if (!ok) fail('confined', () => `${view}, ${command.type} at ${n.kind} ${n.id}: ${result.status}`);
    }
  }
  return runs;
}

const seen = new Set<string>();
let runs = 0;
let buffers = 0;
for (const file of specFiles()) {
  for (const t of readSpecFile(file)) {
    const start = readDrawing(t.initial.buffer);
    const config = { flavor: 'gfm' as const, ...specConfig(t.options) };
    const key = JSON.stringify([start.text, start.placeholders, config]);
    if (seen.has(key)) continue;
    seen.add(key);
    buffers++;
    const doc = docOf(start.text, start.placeholders, config);
    const foldable = nodes(doc).filter((n) => doc.foldRange(n)).map((n) => n.id);
    for (const n of nodes(doc)) {
      if (doc.foldRange(n)) runs += play(doc.withFolded([n.id]), `${t.name}, ${n.kind} ${n.id} folded`);
      runs += play(doc.withZoom(n.id), `${t.name}, zoomed into ${n.kind} ${n.id}`);
      if (foldable.length) runs += play(doc.withFolded(foldable).withZoom(n.id), `${t.name}, zoomed into ${n.kind} ${n.id}, every node folded`);
    }
  }
}

const here = resolve(import.meta.dirname, '..');
const corpus = createHash('sha256').update([...seen].join('\n')).digest('hex').slice(0, 16);
const baselineFile = join(here, 'test/view-exhaustive.baseline.json');
const baseline: { corpus: string; groups: Record<string, number> } | null = (() => {
  try {
    return JSON.parse(readFileSync(baselineFile, 'utf8'));
  } catch {
    return null;
  }
})();
console.log(`${buffers} buffers, ${runs} runs`);
const rose: string[] = [];
for (const [key, group] of [...groups].sort()) {
  const before = baseline?.corpus === corpus ? (baseline.groups[key] ?? 0) : null;
  console.log(`${String(group.runs).padStart(6)} runs  ${key}${before === null ? '' : ` (baseline ${before})`}`);
  for (const e of group.examples) console.log(`    ${e}`);
  if (before !== null && group.runs > before) rose.push(`${key} ${before} → ${group.runs}`);
  if (key === 'write-failed' || key === 'exception') rose.push(`${key}: always a failure`);
}
if (process.env.VIEW_UPDATE) writeFileSync(baselineFile, JSON.stringify({ corpus, groups: Object.fromEntries([...groups].map(([k, g]) => [k, g.runs])) }, null, 2) + '\n');
if (rose.length) {
  console.log(`\nmore than the baseline: ${rose.join('; ')}`);
  process.exitCode = 1;
}
