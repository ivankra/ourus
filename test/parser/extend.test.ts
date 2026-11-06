// Extensions through the public entry point (`ourus/extend`), as an extension's author writes them:
// two at once, each with a delimiter of its own.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MdTree, defineFlavor, gfmExtensions, type MdDelimiterRule, type MdExtension } from 'ourus/extend';

/** An extension whose delimiter `char`, a run of one, makes a node of `type`. */
function delimited(name: string, char: string, type: string): MdExtension {
  const delimiter: MdDelimiterRule = { char, match: () => ({ use: 1, type }) };
  return { name, delimiters: [delimiter], inlines: [{ name, triggers: char, parse: (parser) => parser.handleDelimiters(delimiter) }] };
}

/** The first block's inlines, each its type and range, children after their parent. */
function inlines(text: string, extensions: readonly MdExtension[]): [string, number, number][] {
  const tree = MdTree.parse(text, defineFlavor('test', [...gfmExtensions, ...extensions]));
  const out: [string, number, number][] = [];
  const walk = (nodes: readonly { type: string; from: number; to: number; children?: readonly unknown[] }[]): void => {
    for (const n of nodes) {
      out.push([n.type, n.from, n.to]);
      if (n.children) walk(n.children as typeof nodes);
    }
  };
  walk(tree.inlines(tree.rootAt.child(0)) as never);
  return out;
}

test('two extensions at once, each a delimiter of its own: an astral one keeps its surrogates together, neither is held to emphasis\'s rule of three (B255)', () => {
  const both = [delimited('spark', '💥', 'spark'), delimited('plus', '+', 'plus')];
  // (💥 is two UTF-16 units: the node is the whole of `💥x💥`, its text `x`)
  assert.deepEqual(inlines('💥x💥', both), [['spark', 0, 5], ['text', 2, 3]]);
  // (a run of two closing one of one: CommonMark's rule of three would keep them apart, as text)
  assert.ok(inlines('a+x++b', both).some(([type]) => type === 'plus'));
  // (both in one paragraph, inside each other)
  assert.deepEqual(inlines('+💥x💥+', both).map(([type]) => type), ['plus', 'spark', 'text']);
  // (emphasis keeps it: `*a**` makes no emphasis of `a`)
  assert.ok(!inlines('*a**b', both).some(([type]) => type === 'emphasis' || type === 'strong'));
});
