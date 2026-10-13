# `parser/`: Markdown to a syntax tree

The bottom layer above `text.ts`. It reads a Markdown text in a **flavor** (CommonMark, GFM,
Obsidian) into a **`SyntaxTree`**: a lossless block tree and line table, with each leaf's inlines
parsed when first asked for. After an edit, `update` reads again only the lines the edit can
affect. It knows nothing about outlines, commands or editors.

Design and history: [`10-parsing.md`](../../10-parsing.md). The layer's place among the others:
[`11-api.md`](../../11-api.md).

## Who uses it

- **`outline/`** builds the outline from `root` and `line(i)`, and reads `starts`/`ends` to carry
  ids across an edit.
- **`encoder/`** asks the flavor what counts as a block start (`Flavor.startsBlock`), to know what
  to escape.
- **A host** can use it alone: a preview (`renderHtml`), syntax highlighting (`root`, `inlines`).
- **Extension authors** define flavors with `parser/extend.ts` (`ourus/extend`).

## The API

```ts
import { SyntaxTree, Flavor, renderHtml } from 'ourus';

let tree = SyntaxTree.parse(text, Flavor.gfm);
for (const block of tree.root.children) console.log(block.type, block.startLine, block.endLine);
const line = tree.line(3);                    // its prefix pieces (`>`, list markers), its leaf block
const inlines = tree.inlines(paragraph);       // a leaf's inline nodes, parsed now and cached
tree = tree.update(changes);                   // the snapshot after the changes, re-read where needed
preview.innerHTML = renderHtml(tree);
```

### `SyntaxTree`: one immutable parse of one text

| Member | What it is |
| --- | --- |
| `static parse(text, flavor = Flavor.commonmark, { sentinels? })` | Parses a text. Never fails: every string is a document. |
| `update(changes, { sentinels? })` | The tree of the text after `changes` (`ChangeSpec[]`, in this text's coordinates). Shares every block an edit didn't reach. |
| `text`, `flavor` | What was parsed, and how. |
| `root: Block` | The block tree's root, the `document`. Built when first asked for. |
| `lineCount`, `line(i): LineInfo`, `lines` | The line table: each line's offsets, its containers' prefix pieces, its leaf. Built per line, when asked. |
| `markerFrom(item)`, `markerTo(item)` | Where a list item's marker (`-`, `1.`) is in the text. |
| `inlines(block): InlineNode[]` | A leaf's inlines (paragraphs, headings, table cells, ...). Empty for blocks without inlines. |
| `inlineText(block): InlineText \| null` | The text those inlines are parsed from, with the map between its offsets and the document's. |
| `references`, `footnotes` | Link reference definitions and footnote labels, by normalized label. |
| `starts`, `ends` | Each line's start and end offsets: what `outline/` uses for fast line lookups. |
| `reread: Reread` | Which lines the last `update` read again (for tests and benchmarks). |

`records`, `states`, `sentinels`, `extraLine`, `leafLines`, `textStart` and `offset` are public for
the renderer and extensions; consumers don't need them.

**Sentinels** are offsets read as if a character had been typed there: `outline/` uses them for
placeholders, so an empty item the user is about to fill reads as an item.

### `Flavor`: a Markdown dialect

`Flavor` is both a type and an object of the flavors ourus ships:

```ts
Flavor.commonmark                 // CommonMark 0.31.2
Flavor.gfm                        // GitHub Flavored Markdown, as cmark-gfm reads it
Flavor.obsidian                   // Obsidian: GFM plus callouts, wikilinks, tags, math, comments, ...
Flavor.named(config.flavor)       // the one a config names
```

What callers ask a flavor:

| Member | What it answers |
| --- | --- |
| `name`, `has(extension)` | Which flavor, and whether it includes an extension (`'footnotes'`). |
| `startsBlock(text, inParagraph)` | Whether `text` at a line's start opens a block instead of being text; with `inParagraph`, whether it would interrupt a paragraph above. |
| `readsAsReference(text)` | Whether `text` would read as a link reference definition. |

The two questions are the seam for flavor-aware escaping: today they answer for CommonMark's blocks
in every flavor, so a command that would put `$$` at a line's start in Obsidian is refused by
verification rather than escaped (10-parsing.md §13.3).

### `renderHtml(tree, { softbreak?, escapeRawHtml? })`

HTML exactly as commonmark.js and cmark-gfm write it. Extensions render their own blocks and inlines.

### The data types

- **`Block`**: a node of the block tree: `type` (`paragraph`, `item`, `table`, `callout_title`,
  ...), `startLine`/`endLine`, `children`, `parent`, and attributes by type (a heading's `level`,
  an item's `markerColumn` and `contentColumn`, a code block's `fenced`, ...). Blocks hold line
  numbers and offsets relative to their line's start, never absolute offsets: that is what lets an
  edit that keeps the structure keep the blocks.
- **`LineInfo`**: one line: `from`/`to`/`ending`, `prefix` (each container's `PrefixPiece`, with
  columns), `contentFrom`, `containers`, `leaf`, `lazy`, `blank`, `empty`.
- **`InlineNode`**: a node of a leaf's inline tree, with offsets into its `InlineText`.
- `ListData`, `TaskMarker`, `Callout`, `TableAlign`, `ParseOptions`, `Reread`, `HtmlOptions`.

## Invariants a caller relies on

- **Lossless:** every character of the text belongs to a prefix piece, a leaf, or a blank line;
  inline nodes map back to their source exactly.
- **Incremental equals full:** `tree.update(changes)` reads exactly as
  `SyntaxTree.parse(newText)` does.
- **Immutable:** a tree never changes; `update` returns a new one, sharing what it can.
- **Offsets are UTF-16 code units**, lines are 0-based, and a final line ending doesn't start an
  empty last line.

## For extension authors

`ourus/extend` (`extend.ts`) has `defineFlavor(name, extensions)`, the `Extension` shape (block
starts, leaf builders, inline rules, render rules), the line machine's and inline parser's rule
types, and every extension ourus ships (`gfmExtensions`, `obsidianExtensions`, `table`, `callouts`,
...) to build on:

```ts
import { defineFlavor, gfmExtensions, type Extension } from 'ourus/extend';
const mine = defineFlavor('mine', [...gfmExtensions, myExtension]);
```

Before changing the line machine, read 10-parsing.md §12: `frameEquals` and `sameRecord` decide
convergence and tree sharing, and any new frame or record field must be compared there.

## Files

`index.ts` (the public API) and `extend.ts`; `syntax.ts` (`SyntaxTree`, incremental update, the
tree and line table); `machine.ts` (the line machine); `blocks.ts` (CommonMark's blocks);
`flavor.ts` (`defineFlavor`) and `flavors.ts` (`Flavor`); `gfm.ts`, `obsidian.ts`;
`inlines.ts`, `inline-rules.ts`, `inline-text.ts`; `html.ts`; `refs.ts`, `chars.ts`, `walk.ts`,
`types.ts`, `entities-data.ts` (generated).

`tools/`, scripts run by hand, not part of the parser: `gen-entities.ts` writes `entities-data.ts`
from the WHATWG list of named character references, and `spec-fixtures.ts` turns a CommonMark-style
spec file (`spec.txt`) into the JSON fixture `test/parser/spec.test.ts` runs.

## Tests

`test/parser/`: `spec.test.ts` (the CommonMark spec 652/652, cmark-gfm's GFM spec, extension and
regression tests, exactly), `incremental.test.ts` (an update equals a full parse, in every
flavor), `invariants.test.ts` (losslessness), `structure.test.ts` (block structure against
commonmark.js), `obsidian.test.ts`, `pathological.test.ts`; `bench.ts` for speed.
