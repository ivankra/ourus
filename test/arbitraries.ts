// Document generators for property tests.

import fc from 'fast-check';

/** Container-heavy, adversarial Markdown: tabs, odd indents, nested quotes, odd markers. */
export const WILD = {
  prefixes: ['', '', '', '> ', '>', '> > ', ' > ', '>\t'],
  indents: ['', '', '', ' ', '  ', '   ', '    ', '\t', '  \t', '      '],
  markers: ['', '', '- ', '* ', '+ ', '1. ', '2) ', '-', '-   ', '-\t', '10. ', '- [ ] '],
  contents: ['a', 'b c', '```', '~~~', '# h', '---', '===', '<div>', '- x', '[ ] t', '', '    code', '> q', '[a]: /u', '\tx', '<!--', '-->'],
};

/** What a tidy writer emits: one space after markers, 2-space nesting, blank-line seams. */
export const TIDY = {
  prefixes: [''],
  indents: ['', '', '  ', '    ', '      '],
  markers: ['', '- ', '- ', '1. ', '- [ ] '],
  contents: ['a', 'b c', '# h', 'x `code`', '[l](u)', ''],
};

export type Vocabulary = typeof WILD;

export function arbLine(v: Vocabulary): fc.Arbitrary<string> {
  return fc.oneof(
    { weight: 1, arbitrary: fc.constantFrom('', ' ', '\t') },
    {
      weight: 6,
      arbitrary: fc
        .tuple(fc.constantFrom(...v.prefixes), fc.constantFrom(...v.indents), fc.constantFrom(...v.markers), fc.constantFrom(...v.contents))
        .map(([p, i, m, c]) => p + i + m + c),
    },
  );
}

export function arbDoc(v: Vocabulary, options: { maxLines?: number; endings?: readonly string[] } = {}): fc.Arbitrary<string> {
  const endings = options.endings ?? ['\n'];
  return fc
    .tuple(
      fc.array(fc.tuple(arbLine(v), fc.constantFrom(...endings)), { minLength: 1, maxLength: options.maxLines ?? 12 }),
      fc.boolean(),
    )
    .map(([lines, finalNewline]) => {
      let s = '';
      lines.forEach(([line, ending], i) => {
        s += line;
        if (i < lines.length - 1 || finalNewline) s += ending;
      });
      return s;
    });
}
