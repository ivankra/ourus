// The config's docs against its values: each option's doc names its values, the default first.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { OurusConfig } from '../src/config.ts';

const source = readFileSync(new URL('../src/config.ts', import.meta.url), 'utf8');

test('the options are declared in the order of their values', () => {
  const declared = [...source.slice(source.indexOf('export interface OurusConfig {')).matchAll(/^ {2}readonly (\w+)\??:/gm)].map((m) => m[1]!);
  assert.deepEqual(declared.slice(0, Object.keys(OurusConfig.values).length), Object.keys(OurusConfig.values));
});

test("each option's doc lists its values, the default first", () => {
  const docs = new Map([...source.matchAll(/\/\*\*([\s\S]*?)\*\/\s*readonly (\w+)\??:/g)].map((m) => [m[2]!, m[1]!]));
  for (const [key, values] of Object.entries(OurusConfig.values)) {
    const doc = docs.get(key);
    assert.ok(doc, `${key} has a doc`);
    // a bullet list (`- \`value\``), or the values inline (`\`-\` (the default), \`*\` or \`+\``)
    const bullets = [...doc.matchAll(/^\s*\*\s+- `([^`]+)`/gm)].map((m) => m[1]!);
    const named = (bullets.length ? bullets : [...doc.matchAll(/`([^`]+)`/g)].map((m) => m[1]!)).filter((v) => values.map(String).includes(v));
    assert.equal(named[0], String(OurusConfig.defaults[key as keyof typeof OurusConfig.defaults]), `${key}: the default first`);
    for (const value of values) assert.ok(named.includes(String(value)), `${key}: its doc names \`${String(value)}\``);
  }
});

test('an option given as undefined is absent; an unknown option or value throws', async () => {
  const { OurusDoc } = await import('../src/index.ts');
  const doc = OurusDoc.parse('| a | b |\n|---|---|', { config: { flavor: undefined, indentUnit: undefined } });
  assert.equal(doc.config.flavor, 'gfm');
  assert.equal(doc.mdTree.flavor.name, 'gfm');
  assert.equal(doc.config.indentUnit, 'detect');
  assert.throws(() => OurusConfig.of({ flavor: 'Obsidian' as never }), /option "flavor" takes/);
  assert.throws(() => OurusConfig.of({ indentUnit: 3 as never }), /option "indentUnit" takes/);
  assert.throws(() => OurusConfig.of({ nope: 1 } as never), /unknown option "nope"/);
});
