// Generators for the parser's property tests: documents that reach the hard shapes of every flavor
// (containers, lazy lines, tabs, setext and table candidates under paragraphs, fences, HTML,
// definitions, footnotes, callouts, frontmatter, math and comment blocks), and edits to them.

import fc from 'fast-check';
import type { ChangeSpec } from '../../src/text/index.ts';

export interface Vocabulary {
  readonly prefixes: readonly string[];
  readonly indents: readonly string[];
  readonly markers: readonly string[];
  readonly contents: readonly string[];
}

export const BLOCKS: Vocabulary = {
  prefixes: ['', '', '', '> ', '>', '> > ', ' > ', '>\t'],
  indents: ['', '', '', ' ', '  ', '   ', '    ', '\t', '  \t', '      '],
  markers: ['', '', '', '- ', '* ', '+ ', '1. ', '2) ', '-', '-   ', '-\t', '10. ', '- [ ] ', '- [x] ', '[^1]: '],
  contents: [
    'a', 'b c', 'x *y* z', '`code`', '```', '```js', '~~~', '# h', '## h ##', '---', '===', '***', '<div>', '</div>', '<!--', '-->',
    '- x', '[ ] t', '', '    code', '> q', '[a]: /u', '[a]: /u "t"', '[a]', '\tx', '| a | b |', '|---|---|', 'a | b', '--- | ---',
    ':-:', '[^1]', '$$', '%%', '[!note] Title', '[[link|alias]]', '#tag', '==hi==', 'x ^block', 'www.a.com', '~~s~~',
  ],
};

/** Inline-heavy text. */
export const INLINES: Vocabulary = {
  prefixes: ['', '', '> '],
  indents: ['', ''],
  markers: ['', '', '- '],
  contents: [
    'a', '*', '**', '_', '__', '***', 'a*b', '[', ']', '](u)', '[a](b "c")', '![i](s)', '[a][b]', '[b]: /x', '<a>', '<http://x.y>', '`', '``',
    '\\*', '\\', '&amp;', '&#35;', '&nope;', '~', '~~', '==', '$x$', '$$', '%%', '#t', '[[n]]', '![[e]]', ' ^id', '[^1]', '^[f]', 'www.x.com',
    'a@b.co', 'http://x.y/z', '  ', ' ', '|', '\\|',
  ],
};

export function arbLine(v: Vocabulary): fc.Arbitrary<string> {
  return fc.oneof(
    { weight: 1, arbitrary: fc.constantFrom('', ' ', '\t', '    ') },
    {
      weight: 6,
      arbitrary: fc
        .tuple(fc.constantFrom(...v.prefixes), fc.constantFrom(...v.indents), fc.constantFrom(...v.markers), fc.array(fc.constantFrom(...v.contents), { minLength: 1, maxLength: 3 }))
        .map(([p, i, m, c]) => p + i + m + c.join(' ')),
    },
  );
}

export function arbDoc(v: Vocabulary, options: { maxLines?: number; endings?: readonly string[]; frontmatter?: boolean } = {}): fc.Arbitrary<string> {
  const endings = options.endings ?? ['\n', '\n', '\n', '\r\n', '\r'];
  return fc
    .tuple(
      fc.array(fc.tuple(arbLine(v), fc.constantFrom(...endings)), { minLength: 0, maxLength: options.maxLines ?? 14 }),
      fc.boolean(),
      fc.constantFrom('', '', '', '---\n', '---\na: 1\n---\n', '---\na: 1\n'),
    )
    .map(([lines, finalNewline, front]) => {
      let s = options.frontmatter ? front : '';
      lines.forEach(([line, ending], i) => {
        s += line;
        if (i < lines.length - 1 || finalNewline) s += ending;
      });
      return s;
    });
}

const SNIPPETS = [
  '\n', '\n', '\n\n', ' ', '  ', '\t', '>', '> ', '-', '- ', '*', '#', '# ', '`', '```', '~~~', '[', ']', '|', '|-|-|', '=', '===', '---', '~',
  'a', 'x y', '1. ', '.', ':', '^', '$$', '%%', '<', '<div>', '!', '[a]: /u\n', '    ', '[ ] ', '[^1]: ', '\\', '\r', '\r\n', '\0',
];

/** An edit of `text`: a replacement at a position given as fractions of the length. */
export interface Edit {
  readonly at: number;
  readonly remove: number;
  readonly insert: string;
}

export const arbEdit: fc.Arbitrary<Edit> = fc.record({
  at: fc.double({ min: 0, max: 1, noNaN: true }),
  remove: fc.oneof({ weight: 3, arbitrary: fc.constant(0) }, { weight: 2, arbitrary: fc.integer({ min: 1, max: 12 }) }),
  insert: fc.oneof({ weight: 1, arbitrary: fc.constant('') }, { weight: 4, arbitrary: fc.array(fc.constantFrom(...SNIPPETS), { minLength: 1, maxLength: 3 }).map((a) => a.join('')) }),
});

/** The change an edit makes to `text`. */
export function changeOf(text: string, edit: Edit): ChangeSpec {
  const from = Math.min(text.length, Math.floor(edit.at * (text.length + 1)));
  const to = Math.min(text.length, from + edit.remove);
  return { from, to, insert: edit.insert };
}

/** Several non-overlapping changes to `text`, from edits. */
export function changesOf(text: string, edits: readonly Edit[]): ChangeSpec[] {
  const out: ChangeSpec[] = [];
  let last = -1;
  for (const c of edits.map((e) => changeOf(text, e)).sort((a, b) => a.from - b.from)) {
    if (c.from <= last) continue;
    out.push(c);
    last = c.to;
  }
  return out;
}

/** Positions a sentinel can be read at: line ends, and spaces. */
export function sentinelSpots(text: string): number[] {
  const out: number[] = [];
  for (let i = 0; i <= text.length; i++) {
    const c = text.charCodeAt(i);
    if (i === text.length || c === 10 || c === 13 || c === 32 || c === 9) out.push(i);
  }
  return out;
}
