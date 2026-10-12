// Model-based property test: random documents, random carets, random command sequences; ourus
// (as the player runs it, host defaults and settling included) against the reference model.
//
//   npm run test:model -- [runs=3000] [mode=md] [gen=all]
//
// Prints agreement per command, the Markdown rules the model needed, and one shrunk example per
// disagreement bucket.

import fc from 'fast-check';
import { settle, type Command } from '../../src/commands.ts';
import { OutlineDoc } from '../../src/doc.ts';
import { mapPos } from '../../src/text.ts';
import { drawState } from '../drawing.ts';
import { play } from '../player.ts';
import { lift } from './lift.ts';
import { apply, draw, fired, pathOf, shape, type Cmd, type Mode } from './model.ts';

const RUNS = Number(process.argv[2] ?? 3000);
const MODE = (process.argv[3] ?? 'md') as Mode;
const GEN = process.argv[4] ?? 'all';

const CMDS: Cmd[] = ['indent', 'outdent', 'moveBlockUp', 'moveBlockDown', 'enter', 'deleteContentBackward', 'deleteContentForward'];
const TEXTS = ['a', 'b c', 'x', 'long text', ''];
const MARKERS = ['- ', '- ', '* ', '1. ', '- [ ] ', '- [x] '];
const OTHER = ['', '', '# H', '## H2', '### H3', 'para', 'p q', '> q'];

type Line = string | readonly [number, string, string];
const arbLines = fc.array(
  fc.oneof(
    { weight: 6, arbitrary: fc.tuple(fc.integer({ min: 0, max: 3 }), fc.constantFrom(...MARKERS), fc.constantFrom(...TEXTS)) },
    { weight: 2, arbitrary: fc.constantFrom(...OTHER) },
  ),
  { minLength: 1, maxLength: 10 },
);

/** Tidy: an item nests at most one level deeper than the item above, in a consistent unit. */
const arbTidy = arbLines.chain((lines: Line[]) =>
  fc.constantFrom('  ', '\t').map((unit) => {
    let prev = -1;
    return (
      lines
        .map((l) => {
          if (typeof l === 'string') {
            prev = -1;
            return l;
          }
          const d = Math.min(l[0], prev + 1);
          prev = d;
          // CommonMark nests under a marker's content column: `1. ` needs three spaces
          return unit.repeat(d) + l[1] + l[2];
        })
        .join('\n') + '\n'
    );
  }),
);

/** Loose: any depth, units of 2, 3, 4 spaces or a tab (the repo's arbOutlineDoc, extended). */
const arbLoose = arbLines.chain((lines: Line[]) =>
  fc.constantFrom('  ', '\t', '   ', '    ').map((unit) => lines.map((l) => (typeof l === 'string' ? l : unit.repeat(l[0]) + l[1] + l[2])).join('\n') + '\n'),
);

const arbDocText = GEN === 'tidy' ? arbTidy : GEN === 'loose' ? arbLoose : fc.oneof(arbTidy, arbLoose);

/** A step: a command, and optionally where to put the caret first (node index, offset). */
const arbSteps = fc.array(fc.tuple(fc.constantFrom(...CMDS), fc.option(fc.tuple(fc.nat(), fc.nat()), { freq: 2 })), { minLength: 1, maxLength: 5 });

let skipped = 0;
let mdDecided = 0;
const oracle = { applied: 0, same: 0, differ: 0, modelRejects: 0 };

/** A first-cut category from what each side did; refined by hand in RESULTS.md. */
function category(cmd: Cmd, ourus: string, model: string, inText: boolean): string {
  if (ourus === 'rejected:encoding-failed') return 'A verification stepped in (planner gap)';
  if (ourus === 'notApplicable') return inText ? 'B raw edit (host default) inside text' : 'C host default at a node boundary';
  if (ourus.startsWith('rejected') && model === 'applied') return 'D ourus refuses, model applies';
  if (ourus === 'applied' && model.startsWith('rejected')) return 'E ourus applies, model refuses';
  return 'F both act, differently';
}

interface Disagreement {
  key: string;
  report: string;
}

/** Runs one case; returns the first disagreement, or null. Tallies into `stats`. */
function runCase(text: string, steps: [Cmd, [number, number] | null][], stats?: Map<string, [number, number]>): Disagreement | null {
  let doc = OutlineDoc.parse(text);
  let pos = -1;
  for (let i = 0; i < steps.length; i++) {
    const [cmd, move] = steps[i]!;
    let l = lift(doc);
    if (move || pos < 0) {
      const [ni, off] = move ?? [0, 0];
      if (l.editable.length === 0) return null;
      const node = l.editable[ni % l.editable.length]!;
      pos = l.toPos({ node, offset: off % (node.text.length + 1) });
      const settled = settle(doc, pos);
      if (settled) {
        pos = mapPos(settled.changes, pos, 1);
        doc = settled.doc;
        l = lift(doc);
      }
    }
    const caret = l.toCaret(pos, true);
    if (!caret || caret.node.block) {
      skipped++;
      return null;
    }
    const firedBefore = [...fired.values()].reduce((a, b) => a + b, 0);
    const before = drawState(doc.text, { anchor: pos, head: pos }, doc.placeholders);
    const model = apply(l.root, caret, cmd, MODE);
    const state = play({ doc, selection: { anchor: pos, head: pos }, clipboard: '' }, [cmd]);
    const r = state.last!;
    const ourusStatus = r.status === 'rejected' ? `rejected:${r.reason}` : r.status;
    const after = lift(state.doc);
    const got = { tree: JSON.stringify(shape(after.root)), caret: caretKey(after.root, after.toCaret(state.selection.head)) };
    const want =
      model.status === 'applied'
        ? { tree: JSON.stringify(shape(model.root)), caret: caretKey(model.root, model.caret) }
        : { tree: JSON.stringify(shape(l.root)), caret: caretKey(l.root, caret) };
    const treeOk = got.tree === want.tree;
    const caretOk = got.caret === want.caret;
    if (stats) {
      if ([...fired.values()].reduce((a, b) => a + b, 0) > firedBefore) mdDecided++;
      if (r.status === 'applied') {
        oracle.applied++;
        if (model.status === 'applied' && treeOk) oracle.same++;
        else if (model.status === 'applied') oracle.differ++;
        else oracle.modelRejects++;
      }
    }
    const s = stats?.get(cmd) ?? [0, 0];
    s[0]++;
    if (treeOk && caretOk) s[1]++;
    stats?.set(cmd, s);
    if (!treeOk || !caretOk) {
      const parent = findKind(l.root, caret.node);
      const where = `${caret.node.kind}${caret.node.text === '' ? '(empty)' : ''}${caret.offset === 0 ? '@start' : caret.offset === caret.node.text.length ? '@end' : '@mid'} in ${parent}`;
      const inText = (cmd === 'deleteContentBackward' && caret.offset > 0) || (cmd === 'deleteContentForward' && caret.offset < caret.node.text.length);
      const key = `${category(cmd, ourusStatus, model.status === 'applied' ? 'applied' : 'rejected', inText)} | ${cmd} | ourus ${ourusStatus} | model ${model.status === 'applied' ? 'applied' : 'rejected:' + model.reason} | ${!treeOk ? (caretOk ? 'tree' : 'tree+caret') : 'caret'} | ${where}`;
      const report = [
        '```buffer',
        before.replace(/\n$/, ''),
        '```',
        `> ${cmd}   (step ${i + 1})`,
        'ourus:',
        '```buffer',
        drawState(state.doc.text, state.selection, state.doc.placeholders).replace(/\n$/, ''),
        '```',
        ...(treeOk ? [] : ['ourus outline:', ...draw(after.root).map((x) => '    ' + x), 'model outline:', ...draw(model.status === 'applied' ? model.root : l.root).map((x) => '    ' + x)]),
        ...(caretOk ? [] : [`caret: ourus ${got.caret}, model ${want.caret}`]),
      ].join('\n');
      return { key, report };
    }
    doc = state.doc;
    pos = state.selection.head;
  }
  return null;
}

function caretKey(root: import('./model.ts').MNode, c: import('./model.ts').Caret | null): string {
  if (!c) return 'off-node';
  return `${JSON.stringify(pathOf(root, c.node))}+${c.offset}`;
}

function findKind(root: import('./model.ts').MNode, n: import('./model.ts').MNode): string {
  const walk = (p: import('./model.ts').MNode): string | null => {
    for (const c of p.children) {
      if (c === n) return p.kind;
      const r = walk(c);
      if (r) return r;
    }
    return null;
  };
  return walk(root) ?? '?';
}

// ---- survey: collect buckets
const stats = new Map<string, [number, number]>();
const buckets = new Map<string, { count: number; seed: [string, [Cmd, [number, number] | null][]] }>();
fc.assert(
  fc.property(arbDocText, arbSteps, (text, steps) => {
    const d = runCase(text, steps as never, stats);
    if (d) {
      const b = buckets.get(d.key);
      if (b) b.count++;
      else buckets.set(d.key, { count: 1, seed: [text, steps as never] });
    }
  }),
  { numRuns: RUNS, seed: Number(process.env.SEED ?? 42) },
);

let total = 0;
let agree = 0;
console.log(`# mode=${MODE} gen=${GEN} runs=${RUNS}\n\n## steps agreeing per command`);
for (const c of CMDS) {
  const [n, ok] = stats.get(c) ?? [0, 0];
  total += n;
  agree += ok;
  console.log(`${c.padEnd(24)} ${ok}/${n}  ${((100 * ok) / Math.max(n, 1)).toFixed(1)}%`);
}
console.log(`${'all'.padEnd(24)} ${agree}/${total}  ${((100 * agree) / Math.max(total, 1)).toFixed(1)}%`);
console.log(`\nsteps skipped (caret in whitespace or chrome the model can't address): ${skipped}`);
console.log(`steps where a Markdown rule decided the model's outcome: ${mdDecided}/${total} (${((100 * mdDecided) / total).toFixed(1)}%)`);
console.log(`model as the verifier's expected outline: of ${oracle.applied} steps ourus applied, the model's tree matches ${oracle.same}, differs ${oracle.differ}, model rejects ${oracle.modelRejects}`);
const cats = new Map<string, number>();
for (const [k, b] of buckets) cats.set(k.split(' | ')[0]!, (cats.get(k.split(' | ')[0]!) ?? 0) + b.count);
console.log('\n## disagreements by category (cases)');
for (const [k, v] of [...cats].sort()) console.log(`${k}: ${v}`);
console.log('\n## Markdown rules that decided an outcome in the model');
for (const [k, v] of [...fired].sort((a, b) => b[1] - a[1])) console.log(`${k}: ${v}`);

// ---- one shrunk example per bucket: search for it again and let fast-check shrink
const SHRINK = Number(process.env.SHRINK ?? 1500);
console.log(`\n## disagreement buckets (cases, first disagreement only): ${buckets.size}\n`);
for (const [key, b] of [...buckets].sort((a, z) => z[1].count - a[1].count)) {
  let report = runCase(b.seed[0], b.seed[1])!.report;
  const out = fc.check(
    fc.property(arbDocText, arbSteps, (text, steps) => runCase(text, steps as never)?.key !== key),
    { numRuns: SHRINK, seed: 7 },
  );
  if (out.failed && out.counterexample) report = runCase(out.counterexample[0], out.counterexample[1] as never)!.report;
  console.log(`### ${b.count}× ${key}\n\n${report}\n`);
}
