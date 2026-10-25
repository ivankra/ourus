// A node's text read from the document: worked examples, in a notation of frame parts
// `⟦part:chars⟧`, placeholders `◌` and `⏎` a line break; and where its offsets are.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OurusDoc, type OutlineNode, type OutlineNodeText, type AtomText } from '../../src/doc/index.ts';
import { createPlaceholder } from '../../src/text/index.ts';

type Flavor = 'commonmark' | 'gfm' | 'obsidian';

function parse(text: string, flavor: Flavor = 'gfm', placeholders: number[] = []): OurusDoc {
  return OurusDoc.parse(text, { config: { flavor }, marks: placeholders.map((p) => createPlaceholder(p)) });
}

/** A text in the notation: its frame parts bracketed, its placeholders as `◌`, line breaks as `⏎`. */
function notation(text: OutlineNodeText | null): string | null {
  if (!text) return null;
  const s = text.text;
  const opens = new Map<number, string>();
  const closes = new Map<number, number>();
  for (const part of text.frame) {
    opens.set(part.from, part.part);
    closes.set(part.to, (closes.get(part.to) ?? 0) + 1);
  }
  const points = new Map<number, number>();
  for (const m of text.marks.marks) points.set(m.from, (points.get(m.from) ?? 0) + 1);
  let out = '';
  for (let i = 0; i <= s.length; i++) {
    out += '⟧'.repeat(closes.get(i) ?? 0);
    out += '◌'.repeat(points.get(i) ?? 0);
    if (opens.has(i)) out += `⟦${opens.get(i)}:`;
    if (i < s.length) out += s[i] === '\n' ? '⏎' : s[i];
  }
  return out;
}

/** Every node's kind and text in the notation, in document order. */
function texts(doc: OurusDoc): string[] {
  const out: string[] = [];
  const visit = (node: OutlineNode): void => {
    if (node.kind !== 'root') out.push(`${node.kind} ${notation(doc.textOf(node))}`);
    node.children.forEach(visit);
  };
  visit(doc.rootNode);
  return out;
}

test('1. prefix, frame, text: a task\'s rest is text', () => {
  assert.deepEqual(texts(parse('> - [ ] ## Title text')), ['quote null', 'item ⟦task:[ ] ⟧## Title text']);
  assert.equal(parse('> - [ ] ## Title text').textOf(parse('> - [ ] ## Title text').rootNode.children[0]!.children[0]!)!.body, '## Title text');
  // CommonMark reads a paragraph `[ ] ## Title text`; the convention gives it the same frame
  assert.deepEqual(texts(parse('> - [ ] ## Title text', 'commonmark')), ['quote null', 'item ⟦task:[ ] ⟧## Title text']);
});

test('2. nodes with no text; code as an item\'s text', () => {
  assert.deepEqual(texts(parse('- > * > - > line\n  >   >   > - ```', 'commonmark')), [
    'item null',
    'quote null',
    'item null',
    'quote null',
    'item null',
    'quote null',
    'paragraph line',
    'item ⟦open:```⟧',
  ]);
});

test('3. several lines, a lazy one', () => {
  assert.deepEqual(texts(parse('> - a\n>   b\nlazy')), ['quote null', 'item a⏎b⏎lazy']);
});

test('4. a text ends where its children begin', () => {
  assert.deepEqual(texts(parse('- [ ] foo\n  bar\n\n  # hello\n\n  - baz')), ['item ⟦task:[ ] ⟧foo⏎bar', 'heading ⟦heading:# ⟧hello', 'item baz']);
});

test('5. a setext title; text below a marker', () => {
  assert.deepEqual(texts(parse('- Title\n  continues\n  ===')), ['item Title⏎continues⟦underline:⏎===⟧']);
  assert.deepEqual(texts(parse('-\n  one')), ['item ⟦below:⏎⟧one']);
});

test('6. ATX closing; hard breaks', () => {
  const doc = parse('## Title ##  ');
  assert.deepEqual(texts(doc), ['heading ⟦heading:## ⟧Title⟦close: ##  ⟧']);
  assert.equal(doc.textOf(doc.rootNode.children[0]!)!.body, 'Title');
  assert.deepEqual(texts(parse('a  \nb')), ['paragraph a  ⏎b']);
});

test('7. escapes by place, character and inline role', () => {
  assert.deepEqual(texts(parse('\\- not a list\n2\\. x\n\\<div> y')), ['paragraph - not a list⏎2\\. x⏎\\<div> y']);
  assert.deepEqual(texts(parse('`a\n\\- b`')), ['paragraph `a⏎\\- b`'], 'a code span holds its backslash');
  assert.deepEqual(texts(parse('a \\- b')), ['paragraph a \\- b'], 'mid-line, text');
  assert.deepEqual(texts(parse('\\- x', 'gfm')).length, 1);
  assert.deepEqual(texts(parse('- [ ] \\- x')), ['item ⟦task:[ ] ⟧\\- x'], 'after a checkbox the line\'s rest is text: the backslash isn\'t needed');
});

test('8. placeholders: an empty line, a held space', () => {
  assert.deepEqual(texts(parse('- a\n- ', 'gfm', [6])), ['item a', 'item ◌']);
  assert.deepEqual(texts(parse('-  x', 'gfm', [2])), ['item ◌x']);
});

test('9. callouts by flavor', () => {
  assert.deepEqual(texts(parse('> [!tip]- Title\n> body', 'obsidian')), ['quote ⟦callout:[!tip]- ⟧Title', 'paragraph body']);
  assert.deepEqual(texts(parse('> [!tip]- Title\n> body', 'gfm')), ['quote ⟦callout:[!tip]- ⟧Title⏎body']);
});

test('10. code', () => {
  const doc = parse('- ```js\n  x = 1\n  ```');
  assert.deepEqual(texts(doc), ['item ⟦open:```⟧⟦info:js⟧⏎x = 1⏎⟦close:```⟧']);
  const code = doc.textOf(doc.rootNode.children[0]!) as AtomText;
  assert.equal(code.body, 'x = 1');
  assert.equal(code.info, 'js');
  assert.ok(code.closed);
});

test('11. a gap in a quote', () => {
  const doc = parse('> a\n>\n> b');
  const quote = doc.rootNode.children[0]!;
  assert.deepEqual(quote.children.map((n) => [doc.textOf(n)!.body, n.gap]), [['a', 1], ['b', 0]]);
});

test('positions: a text\'s offsets in the document, both sides of a character left out', () => {
  const held = parse('-  x', 'gfm', [2]);
  const item = held.rootNode.children[0]!;
  assert.equal(held.posOf(item, 0, -1), 2, 'before the held space');
  assert.equal(held.posOf(item, 0, 1), 3, 'after it');
  assert.equal(held.posOf(item, 1), 4);
  const escaped = parse('\\- x\ny');
  const para = escaped.rootNode.children[0]!;
  assert.equal(escaped.posOf(para, 0, -1), 0);
  assert.equal(escaped.posOf(para, 0, 1), 1);
  assert.equal(escaped.posOf(para, 4), 5, 'the next line');
  const nested = parse('> - a\n>   bc');
  const inner = nested.rootNode.children[0]!.children[0]!;
  assert.equal(nested.posOf(inner, 0), 4);
  assert.equal(nested.posOf(inner, 3), 11, '`c`');
});

import fc from 'fast-check';
import { BLOCKS, INLINES, arbDoc } from '../parser/generators.ts';

const RUNS = Number(process.env.OURUS_FUZZ_RUNS ?? 300);

/** For every node with a text: its frame agrees with the parser's reading, and its offsets map back to the document's characters. */
function assertReadsAsParser(doc: OurusDoc): void {
  const visit = (node: OutlineNode): void => {
    const text = doc.textOf(node);
    const head = node.kind === 'atom' ? node.block : node.head;
    const context = `${JSON.stringify(doc.text)}: the ${node.kind} at ${node.startLine}`;
    if (text && head) {
      const attrs = head.attrs;
      if ('heading' in text && head.type === 'heading') {
        assert.deepEqual(text.heading, { level: attrs.level, form: attrs.setext ? 'setext' : 'atx' }, `${context}: heading`);
      }
      if ('task' in text && node.kind === 'item' && node.block.attrs.task) {
        const box = node.block.attrs.task!;
        assert.equal(text.task !== null && text.task.status !== ' ', box.checked, `${context}: task`);
      }
      if ('callout' in text && node.kind === 'quote' && node.block.attrs.callout) {
        const callout = node.block.attrs.callout!;
        assert.deepEqual(text.callout && { type: text.callout.type.toLowerCase(), fold: text.callout.fold }, { type: callout.kind.toLowerCase(), fold: callout.fold ?? null }, `${context}: callout`);
      }
      if ('info' in text && head.type === 'code_block' && attrs.fenced) {
        assert.equal(text.info, attrs.info ?? '', `${context}: info`);
        assert.equal(text.closed, !!attrs.closed, `${context}: closed`);
      }
    }
    if (text) {
      // every character of the string is the document's at its position, but a tab's spaces
      const s = text.text;
      for (let k = 0; k < s.length; k++) {
        if (s[k] === '\n' || s[k] === ' ') continue;
        const pos = doc.posOf(node, k);
        assert.equal(doc.text[pos], s[k], `${context}: offset ${k} at ${pos}`);
      }
    }
    node.children.forEach(visit);
  };
  visit(doc.rootNode);
}

for (const flavor of ['commonmark', 'gfm', 'obsidian'] as const) {
  test(`${flavor}: a text's frame agrees with the parser, and its offsets map back to the document`, () => {
    fc.assert(
      fc.property(fc.oneof(arbDoc(BLOCKS, { frontmatter: flavor === 'obsidian' }), arbDoc(INLINES)), (text) => assertReadsAsParser(parse(text, flavor))),
      { numRuns: RUNS },
    );
  });
}

import { ProseText as Text } from '../../src/doc/index.ts';
import { MarkSet } from '../../src/text/index.ts';

const itemText = (s: string): Text => new Text('paragraph', true, s);

test('12. `taskEditing: text`: a character spliced out of a checkbox, which reads as one again at its end', () => {
  const text = itemText('[ ] ');
  assert.equal(notation(text), '⟦task:[ ] ⟧');
  // Backspace at 4: the space before the caret, inside the frame
  assert.equal(notation(text.splice(3, 4)), '⟦task:[ ]⟧', '`- [ ]`: a task, its text empty');
  assert.equal(text.splice(3, 4).body, '');
});

test('13. a checkbox edited inside is none until it reads as one again', () => {
  const text = itemText('[ ] task');
  const emptied = text.splice(1, 2);
  assert.equal(notation(emptied), '[] task', '`[]` is text');
  assert.equal(notation(emptied.splice(1, 1, 'x')), '⟦task:[x] ⟧task');
});

test('14. toggling a checkbox changes one character, the brackets and the space as written', () => {
  const text = itemText('[X] done');
  assert.equal(text.task?.status, 'X');
  assert.equal(text.splice(1, 2, ' ').task?.status, ' ');
  assert.equal(notation(text.splice(1, 2, ' ')), '⟦task:[ ] ⟧done');
});

test('15. a heading\'s level is its `#`s; one that stops reading as a heading is a paragraph', () => {
  const text = new Text('heading', false, '## Title ##');
  assert.deepEqual(text.splice(0, 0, '#').heading, { level: 3, form: 'atx' });
  const unframed = text.splice(2, 3);
  assert.equal(unframed.normalize().type, 'paragraph', '`##Title ##`');
  assert.equal(text.normalize(), text, 'still a heading');
  // a paragraph never becomes a heading by its characters
  assert.equal(new Text('paragraph', false, '# b').frame.length, 0);
});

test('a text read as an item\'s or not; a join slices past the lower text\'s frame', () => {
  const para = new Text('paragraph', false, '[ ] x');
  assert.equal(para.task, null, 'a paragraph\'s `[ ]` is text');
  assert.equal(para.asItem(true).task?.status, ' ');
  const upper = itemText('[x] a');
  const lower = itemText('[ ] b');
  const joined = upper.concat(lower.slice(lower.textStart(0)));
  assert.equal(notation(joined), '⟦task:[x] ⟧ab', 'the upper\'s checkbox; the lower\'s gone with its frame');
});

test('placeholders ride along a splice: an empty line\'s mark, filled', () => {
  const empty = new Text('paragraph', true, '', MarkSet.of([createPlaceholder(0)]));
  assert.equal(notation(empty), '◌');
  assert.equal(notation(empty.splice(0, 0, 'x')), 'x◌', 'the mark moves past what is typed; the document drops it where its line has text');
});

test('slices that tile a text concat back to it, its placeholders each once', () => {
  const text = new Text('paragraph', true, 'a\n b\n', MarkSet.of([createPlaceholder(2), createPlaceholder(5)]));
  for (let k = 0; k <= text.text.length; k++) {
    const back = text.slice(0, k).concat(text.slice(k));
    assert.equal(back.text, text.text);
    assert.deepEqual(back.marks.marks, text.marks.marks);
  }
  assert.deepEqual(text.splice(0, 1, text.slice(2, 3)).marks.points(), [0, 2, 5], 'the insertion\'s mark at its place, the others where they were');
});
