// The component boundaries of `src/`: every import goes down the layers, and into
// another component only through its entry; inside a component with an order, down its files; and
// inside any other, round no cycle at run time.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { test } from 'node:test';

const src = resolve(import.meta.dirname, '../src');

/** Components, lowest first. A component is a directory or a single file of `src/`. */
const LAYERS: Record<string, number> = { text: 0, parser: 1, config: 1, doc: 2, writer: 3, view: 3, commands: 4, index: 5 };

/**
 * Components whose files are layered too, lowest first: an import between two of them goes down. The
 * writer's: the normalized draft (and its types) under all; the writer and the readback read a draft
 * only as one, never `draft.ts`.
 */
const ORDERS: Record<string, readonly string[]> = {
  writer: ['normalized.ts', 'lines.ts', 'check.ts', 'write.ts', 'draft.ts', 'settle.ts', 'index.ts'],
};

/**
 * Components whose files still import each other round a cycle at run time: the parser's, and the
 * commands', which call each other (Enter and Shift-Enter, cut and delete-subtree, paste, paste-plain,
 * move and drag).
 */
const CYCLES_LEFT = new Set(['parser', 'commands']);

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : name.endsWith('.ts') ? [path] : [];
  });
}

function componentOf(file: string): string {
  const rel = relative(src, file);
  const top = rel.split('/')[0]!;
  if (rel.includes('/')) return top;
  return top.replace(/\.ts$/, '');
}

/** Whether `file` is an entry of its component: a directory's `index.ts`, or a single-file component. */
function isEntry(file: string): boolean {
  const rel = relative(src, file);
  return !rel.includes('/') || /^[^/]+\/index\.ts$/.test(rel);
}

function violations(): string[] {
  const out: string[] = [];
  for (const file of files(src)) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/^(?:import|export)\s[^'"]*?from\s+'(\.[^']+)'/gm)) {
      const target = resolve(dirname(file), m[1]!);
      const from = componentOf(file);
      const to = componentOf(target);
      const edge = `${relative(src, file)} → ${relative(src, target)}`;
      if (from === to) {
        const order = ORDERS[from];
        if (!order) continue;
        const [a, b] = [order.indexOf(relative(join(src, from), file)), order.indexOf(relative(join(src, from), target))];
        if (a < 0 || b < 0) out.push(`${edge}: not in ${from}'s order`);
        else if (b >= a) out.push(`${edge}: imports up ${from}'s order`);
        continue;
      }
      if (!(to in LAYERS) || !(from in LAYERS)) out.push(`${edge}: not a known component`);
      else if (LAYERS[to]! >= LAYERS[from]!) out.push(`${edge}: imports up or across the layers (${from} → ${to})`);
      else if (!isEntry(target)) out.push(`${edge}: into ${to} past its entry`);
    }
  }
  return out;
}

test('imports go down the layers, through entries, and down a component\'s files where it has an order', () => {
  assert.deepEqual(violations(), []);
});

/**
 * The cycles of imports inside a component that run (a type-only import, `import type`, is erased),
 * each as its files; the components of `CYCLES_LEFT` not looked at.
 */
function runtimeCycles(): string[][] {
  const edges = new Map<string, string[]>();
  for (const file of files(src)) {
    const component = componentOf(file);
    if (CYCLES_LEFT.has(component)) continue;
    const text = readFileSync(file, 'utf8');
    const out: string[] = [];
    for (const m of text.matchAll(/^(?:import|export)(?!\s+type\b)\s[^'"]*?from\s+'(\.[^']+)'/gm)) {
      const target = resolve(dirname(file), m[1]!);
      if (componentOf(target) === component) out.push(relative(src, target));
    }
    edges.set(relative(src, file), out);
  }
  // (a walk from each file, its path on a stack: an import back onto the path closes a cycle)
  const cycles: string[][] = [];
  const done = new Set<string>();
  const path: string[] = [];
  const visit = (f: string): void => {
    const at = path.indexOf(f);
    if (at >= 0) return void cycles.push(path.slice(at));
    if (done.has(f)) return;
    path.push(f);
    for (const g of edges.get(f) ?? []) visit(g);
    path.pop();
    done.add(f);
  };
  for (const f of edges.keys()) visit(f);
  return cycles;
}

test('no component\'s files import each other round a cycle at run time, but those left (`CYCLES_LEFT`)', () => {
  assert.deepEqual(runtimeCycles(), []);
});
