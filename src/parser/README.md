# Parser

Parser of flavored Markdown to a lossless, incrementally updated syntax tree.
It knows nothing of outlines, commands or editors.
Users import it through `index.ts`; extension authors also import `extend.ts` (`ourus/extend`).

Basic usage:

```ts
import { MdTree, MdFlavor } from 'ourus';

let tree = MdTree.parse(text, MdFlavor.gfm);
for (const at of tree.rootAt.children()) console.log(at.block.type, at.line, at.lastLine);
const line = tree.line(3);                 // its prefix pieces (`>`, list markers), its containers, its leaf
const inlines = tree.inlines(line.leaf!);  // a leaf's inline nodes, parsed now and cached
tree = tree.update(changes);               // the snapshot after the changes, read again where needed
preview.innerHTML = tree.renderHtml();
```

## API

- Offsets are UTF-16 code units into the text, lines are 0-based, and a final line ending doesn't
  start an empty last line.

- **`MdTree`** is one immutable parse of one text: a block tree, a line table, and each leaf's
  inlines. The line table and the inlines are built lazily, when first asked for.

  - `static MdTree.parse(text: string, flavor = MdFlavor.commonmark, { sentinels? }): MdTree`<br>
    Parses a text. Never fails: every string is a document. **Sentinels** are offsets the parser
    reads as if a character had been typed there. `doc/` passes its placeholders as sentinels, so
    an empty item the user is about to fill still reads as an item.

  - `MdTree.update(changes: ChangeSpec[], { sentinels? }): MdTree`<br>
    The tree of the text after `changes` (given in this text's coordinates). Only the lines the
    changes can affect are parsed again; every block they didn't reach is shared with this tree.

  - `MdTree.text: string`, `MdTree.flavor: MdFlavor`<br>
    The text that was parsed, and the flavor it was parsed in.

  - `get MdTree.root: MdBlock`, `get MdTree.rootAt: MdBlockAt`<br>
    The root of the block tree (the `document` block), alone and as an `MdBlockAt` on line 0.

  - `get MdTree.lineCount: number`, `MdTree.line(i: number): MdLine`, `get MdTree.lines: MdLine[]`<br>
    The line table: for each line, its offsets, the prefix pieces of its containers, and its leaf.
    Each line is built when first asked for; `lines` builds them all.

  - `MdTree.starts: number[]`, `MdTree.ends: number[]`<br>
    Each line's start and end (before its line ending), for fast line lookups.

  - `MdTree.markup(i: number): MdLineMarkup`<br>
    The markup of line `i` past its containers' prefix, and where its text is. The markup is a list
    of `MdMark`s: `open` and `close` (a heading's `#`s, a fence's runs, `$$`, a callout's
    `[!type]`), `info`, `underline`, `rule` and `task`. The text is `[textFrom, textTo)`.

  - `MdTree.markerFrom(item: MdBlockAt): number`, `MdTree.markerTo(item: MdBlockAt): number`<br>
    Where a list item's marker (`-`, `1.`) starts and ends in the text.

  - `MdTree.inlines(leaf: MdBlockAt): MdInline[]`<br>
    A leaf's inline nodes (a paragraph's, a heading's, a table cell's, ...); empty for a block
    without inline content.

  - `MdTree.inlineText(leaf: MdBlockAt): MdInlineText | null`<br>
    The text a leaf's inlines are parsed from, and the map between its offsets and the document's.

  - `MdTree.inlineEscapeAt(pos: number): boolean`<br>
    Whether the backslash at `pos` is an inline escape: it is in its leaf's inline text, and not in
    a place where backslashes are literal (a code span, raw HTML, an autolink, math).

  - `MdTree.codeSpanAt(pos: number): { closer, to } | null`<br>
    The code span `pos` is inside: where its closing backtick run starts, and where the span ends.

  - `get MdTree.references`, `get MdTree.footnotes`<br>
    The link reference definitions and the footnote labels, by normalized label.

  - `MdTree.renderHtml({ softbreak?, escapeRawHtml? }): string`<br>
    HTML exactly as commonmark.js and cmark-gfm write it. Extensions render their own blocks and
    inlines.

  - `MdTree.reread: MdReread`<br>
    Which lines the last `update` parsed again (for tests and benchmarks).

  `leafLines` and `textStart` are public for the renderer and extensions; `records` and `states` for
  the incremental tests.

- **`MdFlavor`** is a Markdown dialect. Ourus ships three: `MdFlavor.commonmark` (CommonMark
  0.31.2), `MdFlavor.gfm` (GitHub Flavored Markdown, as cmark-gfm reads it) and `MdFlavor.obsidian`
  (GFM plus callouts, wikilinks, tags, math, comments, ...). `MdFlavor.named(name)` gives one by
  name, as a config names it.

  - `MdFlavor.name: string`, `MdFlavor.has(extension: string): boolean`<br>
    The flavor's name, and whether it includes an extension (`'footnotes'`).

  - `MdFlavor.content(type: string): 'blocks' | 'inline' | 'verbatim' | 'none'`<br>
    What a block of the type holds: other blocks (containers), inline text (paragraphs, headings),
    lines kept as written (code, HTML, math), or nothing (a thematic break, a table, and any type
    no extension declares).

  - `MdFlavor.delimited(block: MdBlock): boolean`<br>
    Whether the block opens and closes with delimiter lines: fenced code, and in Obsidian `$$` math
    and `%%` comments.

  The next four tell where a paragraph's lines would stop reading as plain text, and which
  backslashes keep them text. They ask the parser itself, so they are exact in every flavor. A
  **place** says where the lines are written: `context` is `start` (a node's first lines),
  `continuation` (after `above`, a paragraph's line) or `quoteStart` (a quote's first lines, where
  a callout can start); `below` is the lines after, which can change how the last one reads.

  - `MdFlavor.firstNonParagraph(lines: string[], context = 'start', above?: string): number`<br>
    The index of the first of `lines` that isn't paragraph text where it is written: it starts a
    block, ends the paragraph, underlines it as a heading, or makes a reference definition. -1 when
    every line is paragraph text.

  - `MdFlavor.markupEscapeAt(line: string, at: number): boolean`<br>
    Whether a backslash at `at` is in a position where it can only matter to block syntax: a
    line's first `-`, `+`, `#`, `>` or `=`; the `.` or `)` after a number; a label's `:`; a table
    delimiter row's first `-`. Such a backslash is a **markup escape**: markup, not part of the text.

  - `MdFlavor.markupEscapes(lines: string[], place?: MdParagraphPlace): MdEscapeAt[]`<br>
    For reading: the backslashes in `lines`, as written at `place`, that are markup escapes. A
    backslash is one if it is in such a position, is an inline escape, and is needed there (without
    it, the line would read as markup). A reader leaves them out of the text.

  - `MdFlavor.escapeParagraph(lines: string[], place?: MdParagraphPlace): MdEscapedParagraph | null`<br>
    For writing: how to write a text's lines at `place` so they read back as that text. First, the
    backslashes in `lines` that would be markup escapes there are taken as markup (`absorbed`).
    Then each line that would read as markup gets an escape: a markup escape where one works,
    otherwise a backslash added to the text (`gained`). Null where no escape keeps the lines a
    paragraph.

- **`MdBlock`** is a node of the block tree, as stored:

  - `type` (`paragraph`, `item`, `table`, `callout_title`, ...) and `kind` (`container`, `leaf`,
    or `part`, as a table's rows and cells);
  - `attrs`, by type (`MdAttrs`: a heading's `level`, an item's `markerColumn` and `contentColumn`,
    a code block's `fenced`, ...);
  - `lines`, how many lines it spans, first to last (blank lines after it not included);
  - `children`, and `offsets`: each child's first line, counted from the block's own first line.

  A block holds no parent and no absolute line number, and the offsets in its attributes count from
  their line's start. So after an edit, every block outside the lines parsed again is the old one,
  shared between the two trees, and only the blocks on the path from the root to the edit are made
  anew. A block appears in a tree only once, so blocks can be compared by identity.

- **`MdBlockAt`** is a block together with its position in one tree: the `MdBlock`, plus the line it
  starts on (which the block itself doesn't store, so that trees can share it). It is made on
  demand, so compare two by their `block`, not by identity. A line's `containers` and `leaf` are
  `MdBlockAt`s.

  - `MdBlockAt.block: MdBlock`, `MdBlockAt.line: number`, `get MdBlockAt.lastLine: number`<br>
    The block, and its first and last lines.

  - `MdBlockAt.child(k: number): MdBlockAt`, `MdBlockAt.children(): MdBlockAt[]`<br>
    Its children, with their positions.

  - `MdBlockAt.preorder()`, `MdBlockAt.postorder()`<br>
    The block and every block inside it: in document order, or with each block after its
    descendants. Iterative, so deep trees don't overflow the stack.

- **`MdLine`** is one line: `from`, `to` and `ending`; `prefix` (one `MdPrefixPiece` per container,
  with its columns and the container it belongs to); `contentFrom`; `containers` and `leaf`; and
  whether it is `lazy` (it continues a paragraph without all its containers' markers), `blank`
  (whitespace only) or `empty` (whitespace only past the prefix).

- **`MdInline`** is a node of a leaf's inline tree, with offsets into its `MdInlineText`. Also
  exported: `MdList`, `MdTask`, `MdCallout`, `MdTableAlign`, `MdParseOptions`, `MdReread`,
  `MdHtmlOptions`.

- **`MdHtmlParser`** converts HTML (from a clipboard) to Markdown.

  - `static MdHtmlParser.parse(html: string): MdHtmlParsed`<br>
    `{ markdown, structured, formatted }`: the Markdown; whether it has structure (a list, a
    heading, code, a quote, a table, more than one line); whether it has inline formatting that its
    plain text would lose. It reads what browsers and apps put on the clipboard: a browser's copy,
    the outliners', Google Docs', Word's.

- **`mdCalloutAt(line: string): { kind, fold, from, to } | null`**<br>
  The callout opening (`[!type]` and its fold) at the start of `line`, after any blanks. `line` is
  a quote's first line, past its `>`. This is Obsidian's syntax, which the outline reads in every
  flavor.

Invariants a caller relies on:

- **Lossless**: every character of the text belongs to a prefix piece, a leaf, or a blank line;
  inline nodes map back to their source exactly.
- **Incremental equals full**: `tree.update(changes)` reads exactly as `MdTree.parse(newText)` does.
- **Immutable**: a tree never changes; `update` returns a new one, sharing every block it can.

For extension authors: `ourus/extend` (`extend.ts`) has `defineFlavor(name, extensions)`, the
`MdExtension` shape (block starts, leaf builders, inline rules, render rules), the line machine's and
inline parser's rule types, and every extension ourus ships (`gfmExtensions`, `obsidianExtensions`,
`table`, `callouts`, ...) to build on:

```ts
import { defineFlavor, gfmExtensions, type MdExtension } from 'ourus/extend';
const mine = defineFlavor('mine', [...gfmExtensions, myExtension]);
```

Before changing the line machine: `frameEquals` and `sameRecord` decide convergence and tree
sharing, and any new frame or record field must be compared there.

Files:

- `index.ts` (the public API) and `extend.ts`.
- `syntax.ts` (`MdTree`, incremental update, the tree and line table); `tree.ts` (the block tree:
  stored blocks, the incremental build, `MdBlockAt`); `machine.ts` (the line machine); `blocks.ts`
  (CommonMark's blocks); `markup.ts` (CommonMark's line markup); `readback.ts` (`firstNonParagraph`,
  escapes).
- `flavor.ts` (`defineFlavor`) and `flavors.ts` (`MdFlavor`); `gfm.ts`, `obsidian.ts`.
- `inlines.ts`, `inline-rules.ts`, `inline-text.ts`; `html.ts` (the renderer); `html-parser.ts`
  (`MdHtmlParser`); `refs.ts`, `chars.ts`, `walk.ts`, `types.ts`, `entities-data.ts` (generated).
- `tools/`, scripts run by hand: `gen-entities.ts` writes `entities-data.ts` from the WHATWG list of
  named character references, and `spec-fixtures.ts` turns a CommonMark-style spec file (`spec.txt`)
  into the JSON fixture `test/parser/spec.test.ts` runs.

Tests, in `test/parser/`: `spec.test.ts` (the CommonMark spec 652/652, cmark-gfm's GFM spec,
extension and regression tests, exactly), `incremental.test.ts` (an update equals a full parse, in
every flavor), `invariants.test.ts` (losslessness), `structure.test.ts` (block structure against
commonmark.js), `readback.test.ts` and `escapes.test.ts` (escapes, against the parser itself),
`obsidian.test.ts`, `pathological.test.ts`; `bench.ts` for speed.
