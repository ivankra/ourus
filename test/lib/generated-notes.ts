// A generated corpus of start buffers: notes composed from the block shapes a user's notes hold (a
// list item with a quote or callout under it, a fence in an item, a table, a footnote, a block id)
// in the orders and with the separators real notes have. The spec draws the shapes one command needs;
// these are the shapes together, which is where commands meet blocks they weren't written beside.
//
// Deterministic: the same `seed` and `count` give the same buffers, so a baseline can hold counts on
// them. Used by `inverse.ts` and `conserve.ts`.

/** One generated start: its text, the config it is read in, and a name for reports. */
export interface GeneratedStart {
  readonly text: string;
  readonly config: Record<string, unknown>;
  readonly name: string;
}

const BLOCKS: readonly string[] = [
  '# Project plan\n',
  '## Notes\n',
  'Intro paragraph with a [[link]] and `code`.\n',
  'para one\nsecond line\n',
  '- item\n- [ ] task\n- [x] done\n',
  '- parent\n  - child one\n    - grandchild\n  - child two\n\n    second paragraph of child two\n  - child three\n',
  '1. first\n2. second\n   - nested bullet\n3. third\n',
  '- [ ] write spec\n  - [x] outline\n  - [ ] draft\n    continued line\n- [ ] review\n',
  '> a quote\n> over two lines\n',
  '> [!note] Title\n> body text\n> more\n',
  '- > quoted in item\n  > over two lines\n',
  '- sibling\n  > quoted in item\n  > - list in quote\n- last\n',
  '- > [!note] Title\n  > body text\n',
  '1. num\n2. > quote\n   > more\n',
  '- item\n  ```js\n  let x;\n  ```\n- next\n',
  '```js\nconst x = 1;\n\nconst y = 2;\n```\n',
  '$$\nx^2\n$$\n',
  '| a | b |\n|---|---|\n| 1 | 2 |\n',
  '[^1]: a footnote\n',
  'Final line ^blk\n',
  '- item ^id1\n- other\n',
  '%% comment %%\n',
  '---\n',
];

const FLAVORS = ['obsidian', 'gfm', 'commonmark'] as const;
const OPTIONS: readonly Record<string, unknown>[] = [{}, {}, { quotes: 'container' }, { quotes: 'atom' }, { listParent: 'container' }, { indentUnit: 'tab' }];

/** `count` start buffers from `seed`: two to five blocks each, joined by a blank line (mostly) or none. */
export function generatedStarts(count: number, seed = 1): GeneratedStart[] {
  let state = seed >>> 0;
  const next = (): number => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32;
  const below = (n: number): number => Math.floor(next() * n);
  const out: GeneratedStart[] = [];
  const seen = new Set<string>();
  for (let tries = 0; out.length < count && tries < count * 20; tries++) {
    const parts = Array.from({ length: 2 + below(4) }, () => BLOCKS[below(BLOCKS.length)]!);
    let text = '';
    for (const part of parts) text += (text && next() < 0.85 ? '\n' : '') + part;
    const config = { flavor: FLAVORS[below(FLAVORS.length)]!, ...OPTIONS[below(OPTIONS.length)]! };
    const key = JSON.stringify([text, config]);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text, config, name: `generated #${out.length}` });
  }
  return out;
}
