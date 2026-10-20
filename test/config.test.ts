// The config's docs against its values: each option's doc names its values, the default first.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { Config } from '../src/config.ts';

const source = readFileSync(new URL('../src/config.ts', import.meta.url), 'utf8');

test('the options are declared in the order of their values', () => {
  const declared = [...source.slice(source.indexOf('export interface Config {')).matchAll(/^ {2}readonly (\w+)\??:/gm)].map((m) => m[1]!);
  assert.deepEqual(declared.slice(0, Object.keys(Config.values).length), Object.keys(Config.values));
});

test("each option's doc lists its values, the default first", () => {
  const docs = new Map([...source.matchAll(/\/\*\*([\s\S]*?)\*\/\s*readonly (\w+)\??:/g)].map((m) => [m[2]!, m[1]!]));
  for (const [key, values] of Object.entries(Config.values)) {
    const doc = docs.get(key);
    assert.ok(doc, `${key} has a doc`);
    // a bullet list (`- \`value\``), or the values inline (`\`-\` (the default), \`*\` or \`+\``)
    const bullets = [...doc.matchAll(/^\s*\*\s+- `([^`]+)`/gm)].map((m) => m[1]!);
    const named = (bullets.length ? bullets : [...doc.matchAll(/`([^`]+)`/g)].map((m) => m[1]!)).filter((v) => values.map(String).includes(v));
    assert.equal(named[0], String(Config.defaults[key as keyof typeof Config.defaults]), `${key}: the default first`);
    for (const value of values) assert.ok(named.includes(String(value)), `${key}: its doc names \`${String(value)}\``);
  }
});
