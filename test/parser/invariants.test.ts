// The syntax layer is lossless, on every flavor and any string: the lines give the text back; prefix
// pieces run from the line start without gaps, in offsets and columns; blocks nest and keep their
// lines; a leaf's inline text maps character by character onto the source; inline nodes nest, and at
// the top they tile the inline text (every character is in exactly one node).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fc from 'fast-check';
import { MdTree } from '../../src/parser/syntax.ts';

import type { MdBlock, MdBlockAt, MdInline } from '../../src/parser/types.ts';

import { advanceColumns } from '../../src/text/index.ts';
import { FLAVORS } from './flavors.ts';
import { BLOCKS, INLINES, arbDoc } from './generators.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 300);

export function checkSyntax(syntax: MdTree): void {
  const { text, lines, root } = syntax;
  let rebuilt = '';
  for (const line of lines) rebuilt += text.slice(line.from, line.to) + line.ending;
  assert.equal(rebuilt, text, 'lines give the text back');
  for (const line of lines) {
    let pos = line.from;
    let col = 0;
    for (const p of line.prefix) {
      assert.equal(p.from, pos, `line ${line.index}: a piece starts where the previous ended`);
      assert.equal(p.fromColumn, col, `line ${line.index}: piece columns run on`);
      assert.ok(p.to >= p.from && p.to <= line.to, `line ${line.index}: piece in the line`);
      const natural = advanceColumns(text, line.from, p.to, 0);
      if (p.partialTab) assert.ok(p.toColumn > natural && text.charCodeAt(p.to) === 9, `line ${line.index}: a partial tab`);
      else assert.equal(p.toColumn, natural, `line ${line.index}: piece column matches its text`);
      assert.ok(line.containers.includes(p.container), `line ${line.index}: a piece's container is the line's`);
      pos = p.to;
      col = p.toColumn;
    }
    assert.equal(line.contentFrom, pos);
    assert.equal(line.container.block, line.containers[line.containers.length - 1]?.block ?? root);
    if (line.leaf) {
      assert.ok(line.leaf.line <= line.index && line.index <= line.leaf.lastLine, `line ${line.index} in its leaf`);
      assert.ok(line.container.block.children.includes(line.leaf.block), `line ${line.index}: its leaf is in its innermost container`);
    }
    // the line's markup and text: in its content, in order, apart, no mark in the text
    const { marks, textFrom, textTo } = syntax.markup(line.index);
    assert.ok(line.contentFrom <= textFrom && textFrom <= textTo && textTo <= line.to, `line ${line.index}: its text in its content`);
    let at = line.contentFrom;
    for (const m of marks) {
      assert.ok(at <= m.from && m.from <= m.to && m.to <= line.to, `line ${line.index}: ${m.kind} in order, in the line`);
      assert.ok(m.to <= textFrom || m.from >= textTo, `line ${line.index}: ${m.kind} outside the text`);
      at = m.to;
    }
  }
  // every block's content is declared: `blocks` for a container, and only for one
  const containers = new Set<MdBlock>([root, ...lines.flatMap((l) => l.containers.map((c) => c.block))]);
  const top = syntax.rootAt;
  for (const { block: b } of top.preorder()) assert.equal(syntax.flavor.content(b.type) === 'blocks', containers.has(b), `${b.type}: its content, ${syntax.flavor.content(b.type)}`);
  for (const at of top.preorder()) {
    const b = at.block;
    let prevEnd = b.type === 'document' ? -1 : at.line - 1;
    at.children().forEach((c, k) => {
      const sharesLine = k === 0 && c.line === at.line;
      assert.ok(c.line > prevEnd || sharesLine || b.type === 'table' || b.type === 'table_row', `${c.block.type} after its previous sibling`);
      assert.ok(c.block.lines >= 1, `${c.block.type} has lines`);
      if (b.type !== 'document') assert.ok(c.lastLine <= at.lastLine || b.type === 'blockquote', `${c.block.type} within ${b.type}`);
      prevEnd = c.lastLine;
    });
    checkInlines(syntax, at);
  }
}

function checkInlines(syntax: MdTree, at: MdBlockAt): void {
  const b = at.block;
  const t = syntax.inlineText(at);
  if (!t) return;
  const { text } = syntax;
  let prev = -1;
  for (let i = 0; i < t.text.length; i++) {
    const at = t.sourceAt(i);
    assert.ok(at >= prev, `${b.type}: the mapping runs forward`);
    const c: string = t.text[i]!;
    const s: string | undefined = text[at];
    if (c === '\n') assert.ok(s === '\n' || s === '\r', `${b.type}: a line break stands for a line ending`);
    else {
      assert.ok(c === s || (c === '�' && s === '\0'), `${b.type}: text ${JSON.stringify(c)} is source ${JSON.stringify(s)}`);
      assert.equal(t.textAt(at), i, `${b.type}: the mapping goes back`);
    }
    prev = at;
  }
  const nodes = syntax.inlines(at);
  let pos = 0;
  for (const n of nodes) {
    assert.equal(n.from, pos, `${b.type}: top-level inlines tile the text (${n.type} at ${n.from}, expected ${pos})`);
    pos = n.to;
    checkNode(n, t.text.length);
  }
  assert.equal(pos, t.text.length, `${b.type}: the inlines cover the text`);
}

function checkNode(n: MdInline, length: number): void {
  assert.ok(n.from <= n.to && n.to <= length, `${n.type}: a range in the text`);
  if (n.type === 'text') assert.ok(n.from < n.to, 'no empty text');
  let pos = n.from;
  for (const c of n.children ?? []) {
    assert.ok(c.from >= pos && c.to <= n.to, `${c.type} inside ${n.type}, after its previous sibling`);
    pos = c.to;
    checkNode(c, length);
  }
}

const arbText = fc.oneof(
  fc.string({ unit: 'binary', maxLength: 60 }),
  fc.string({ unit: fc.constantFrom('\n', '\r', '\t', ' ', '>', '-', '*', '_', '`', '[', ']', '(', ')', '!', '<', '&', '#', '|', ':', '^', '$', '%', '=', '~', '\\', 'a', '1', '.', '\0', '\uD800'), maxLength: 80 }),
);

for (const [name, flavor] of Object.entries(FLAVORS)) {
  test(`${name}: lossless on block-heavy documents`, () => {
    fc.assert(fc.property(arbDoc(BLOCKS, { frontmatter: name === 'obsidian' }), (md) => checkSyntax(MdTree.parse(md, flavor))), { numRuns: RUNS });
  });
  test(`${name}: lossless on inline-heavy documents`, () => {
    fc.assert(fc.property(arbDoc(INLINES), (md) => checkSyntax(MdTree.parse(md, flavor))), { numRuns: RUNS });
  });
  test(`${name}: any string parses, renders and is lossless`, () => {
    fc.assert(
      fc.property(arbText, (md) => {
        const syntax = MdTree.parse(md, flavor);
        checkSyntax(syntax);
        syntax.renderHtml();
      }),
      { numRuns: RUNS },
    );
  });
}

test('the markup and text of a line', () => {
  const at = (flavor: keyof typeof FLAVORS, text: string, line: number): string => {
    const { marks, textFrom, textTo } = MdTree.parse(text, FLAVORS[flavor]).markup(line);
    return [...marks.map((m) => `${m.kind}:${JSON.stringify(text.slice(m.from, m.to))}`), JSON.stringify(text.slice(textFrom, textTo))].join(' ');
  };
  assert.equal(at('commonmark', '## Title ##  \n', 0), 'open:"##" close:"##" "Title"');
  assert.equal(at('commonmark', '#  Title  \n', 0), 'open:"#" "Title  "');
  assert.equal(at('commonmark', '> # a #b\n', 0), 'open:"#" "a #b"');
  assert.equal(at('commonmark', '## ##\n', 0), 'open:"##" close:"##" ""');
  assert.equal(at('commonmark', 'Title\n===\n', 1), 'underline:"===" ""');
  assert.equal(at('commonmark', '- ```js x\n  code\n  ```\n', 0), 'open:"```" info:"js x" ""');
  assert.equal(at('commonmark', '- ```js x\n  code\n  ```\n', 1), '"code"');
  assert.equal(at('commonmark', '- ```js x\n  code\n  ```\n', 2), 'close:"```" ""');
  assert.equal(at('commonmark', '***\n', 0), 'rule:"***" ""');
  assert.equal(at('commonmark', 'a  \nb\n', 0), '"a  "');
  assert.equal(at('gfm', '- [x] done\n', 0), 'task:"[x]" "done"');
  assert.equal(at('gfm', '- [ ] \n', 0), 'task:"[ ]" ""');
  assert.equal(at('commonmark', '- [x] done\n', 0), '"[x] done"');
  assert.equal(at('obsidian', '> [!tip]- Title\n> body\n', 0), 'open:"[!tip]-" "Title"');
  assert.equal(at('obsidian', '$$\nx\n$$\n', 0), 'open:"$$" ""');
  assert.equal(at('obsidian', '$$\nx\nx$$\n', 2), 'close:"$$" "x"');
  assert.equal(at('obsidian', '%%a%%\n', 0), 'open:"%%" close:"%%" "a"');
});

test('blocks opened and closed by delimiter lines', () => {
  const delimited = (flavor: keyof typeof FLAVORS, text: string): boolean[] => {
    const syntax = MdTree.parse(text, FLAVORS[flavor]);
    return syntax.root.children.map((b) => syntax.flavor.delimited(b));
  };
  assert.deepEqual(delimited('commonmark', '```\nx\n```\n\n    code\n\n<div>\n'), [true, false, false]);
  assert.deepEqual(delimited('obsidian', '$$\nx\n$$\n%%\nc\n%%\n~~~\n'), [true, true, true]);
  assert.deepEqual(delimited('commonmark', '$$\nx\n$$\n'), [false]);
});

test('an empty text, or an empty last line of one, maps to where it is', () => {
  // an empty item and an empty line a placeholder (a sentinel) holds; an empty heading
  const cases: [string, number[], string, number][] = [
    ['a\n- \n', [4], '', 4],
    ['- a\n  \n', [6], 'a\n', 6],
    ['p\n\n', [2], 'p\n', 2],
    ['a\n#\n', [], '', 3],
  ];
  for (const [text, sentinels, inline, end] of cases) {
    const syntax = MdTree.parse(text, FLAVORS.gfm!, { sentinels });
    const leaf = syntax.lines[syntax.lineCount - 1]!.leaf!;
    const t = syntax.inlineText(leaf)!;
    assert.equal(t.text, inline, JSON.stringify(text));
    assert.equal(t.sourceAt(t.text.length), end, `${JSON.stringify(text)}: its end`);
  }
});
