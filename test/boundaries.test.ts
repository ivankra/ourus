// The component boundaries of `src/`: every import goes down the layers, and into
// another component only through its entry.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { test } from 'node:test';

const src = resolve(import.meta.dirname, '../src');

/** Components, lowest first. A component is a directory or a single file of `src/`. */
const LAYERS: Record<string, number> = { text: 0, parser: 1, config: 1, doc: 2, draft: 3, commands: 4, index: 5 };

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
      if (from === to) continue;
      if (!(to in LAYERS) || !(from in LAYERS)) out.push(`${edge}: not a known component`);
      else if (LAYERS[to]! >= LAYERS[from]!) out.push(`${edge}: imports up or across the layers (${from} → ${to})`);
      else if (!isEntry(target)) out.push(`${edge}: into ${to} past its entry`);
    }
  }
  return out;
}

test('imports go down the layers, through entries', () => {
  assert.deepEqual(violations(), []);
});
