// RemNote's documents without bullets (remnote/driver.ts), offline: an outline's free blocks are the
// document's children there, what they own beside them (`lift`), and read back nested as ourus's
// outline is (`own`).

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { draw, project, readOutline, type Outline, type Projection } from '../lib/block.ts';
import { bulletless, driver, lift, own } from './driver.ts';

const outline = (drawn: string): Outline => readOutline(drawn)!;

test("a paragraph's list and a heading's section come up beside it, and go back", () => {
  const nested = outline('¶ # H1\n  ¶ para\n    - x\n      - y\n  ¶ ## H2\n    - z\n¶ # Next\n');
  assert.equal(draw(lift(nested)), '¶ # H1\n¶ para\n- x\n  - y\n¶ ## H2\n- z\n¶ # Next\n');
  assert.deepEqual(own(lift(nested)), nested);
  // a heading of the same level ends a section, an atom owns no list
  const flat = outline('¶ # A\n¶ ```\n  x\n  ```\n- y\n¶ # B\n- z\n');
  assert.equal(draw(own(flat)), '¶ # A\n  ¶ ```\n    x\n    ```\n  - y\n¶ # B\n  - z\n');
});

test("a paragraph inside an item is refused: RemNote shows a bullet there", () => {
  assert.match(bulletless(outline('- a\n  ¶ b\n')) ?? '', /inside an item/);
  assert.equal(bulletless(outline('¶ a\n  - b\n')), undefined);
});

test("every spec buffer the setup holds goes there and back as it was", () => {
  const spec = new URL('../../spec/', import.meta.url);
  let held = 0;
  for (const f of readdirSync(spec).filter((f) => f.endsWith('.md'))) {
    for (const m of readFileSync(new URL(f, spec), 'utf8').matchAll(/```buffer\n([\s\S]*?)```/g)) {
      let p: Projection;
      try {
        p = project(m[1]!, 'gfm', { freeForm: true, ordered: true });
      } catch {
        continue;
      }
      // (what the setup refuses, a quote, isn't held)
      const o = p.outline;
      if (bulletless(o) || [...p.notes].some((n) => driver.refuses?.includes(n))) continue;
      assert.deepEqual(own(lift(o)).blocks, o.blocks, `${f}:\n${m[1]}`);
      held++;
    }
  }
  assert.ok(held > 1000, `only ${held} buffers held`);
});
