# Doc

A Markdown text read as an outline. `OurusDoc` is the snapshot of a text: the text, its
placeholders, its parse, and the outline read from it. For each node it gives the node's text and
that text's frame, and for each position, what is there. Editing a document is `writer/`'s job; what
a reader sees of it, folded and zoomed, `view/`'s (`OurusView`, which commands take).

Basic usage:

```ts
import { OurusDoc } from 'ourus';

let doc = OurusDoc.parse(text, { config: { flavor: 'obsidian' }, marks });
doc = doc.update({ changes, caret });       // after a host's edit: placeholders mapped, untouched nodes shared
for (const node of doc.rootNode.children) console.log(node.kind, doc.textOf(node)?.body);
const at = doc.locateRaw(pos);              // in a text, a frame, a marker, a prefix, a gap, ...
```

## API

- Positions are offsets into the document's text. A node's text has offsets of its own; `posOf` and
  `offsetOf` convert between the two.

- **`OurusDoc`** is one immutable snapshot: the text, its placeholders, its parse, its outline, and
  the config.

  - `static OurusDoc.parse(text: string, { config?: Partial<OurusConfig>, marks?: Mark[] }): OurusDoc`<br>
    Reads a text, with its placeholders (`PLACEHOLDER_MARK`s from `text/`). Reading uses only the
    config's `flavor`; the rest of the config is for the commands.

  - `OurusDoc.update(params?: OurusDocUpdate): OurusDoc`<br>
    The snapshot after `params.changes` (in this document's offsets), or with `params.text` in place
    of this one's (the file changed elsewhere: its changes the lines that differ), sharing every node
    the changes didn't reach. Its placeholders are this one's, mapped through the changes, without
    `params.dropMarks` (in this document's offsets) and with `params.addMarks` (in the new text's),
    for a host's edit; or exactly `params.setMarks`, for the writer's or an undo. `params.caret`: on
    a host's edit, a placeholder is kept at the caret where the deletion would otherwise change the
    outline there. `params.identity`: the ids the writer assigned, keyed by where each node it wrote
    starts. This snapshot where it is given nothing to do (no change, no placeholders to set, add or
    drop, no `identity`): another snapshot is another document, its text, placeholders, config or
    outline maybe changed, its ids too (a move of `- a⏎- a⏎`'s first item changes no character and
    swaps the two ids).

  - `OurusDoc.isSameLineage(other: OurusDoc): boolean`<br>
    Whether `other` is a snapshot of the same document: the same `parse`'s, through any updates,
    drafts and `with…`s. A lineage gives each id once, whichever snapshot asks, so a snapshot taken
    back (an undo's) never shares an id with a node made since.

  - `OurusDoc.withConfig(config: Partial<OurusConfig>): OurusDoc`<br>
    The same document under other options (a host's setting changed). An option that says only how
    commands write (`indentUnit`, `markup`, ...) changes on the same snapshot, its outline and ids
    shared; `quotes` and `listParent` have the outline read again from the same parse, ids carried as
    an update carries them; `flavor` parses the text anew, its ids anew.

  - `OurusDoc.foldRange(node: OurusNode)`: `{ from, to } | null`, `OurusDoc.coverEnd(node)`, `OurusDoc.coverRange(node)`: `{ from, to }`, `OurusDoc.rowOwner(line: number): OurusNode | null`<br>
    What folding a node would hide: from the end of its own lines to the end of its subtree's last
    line, the blank lines after it shown; null where it doesn't fold (`OurusNode.foldable`). A
    node's last line with its descendants' and the blank lines after them; what zooming into it
    would show, its lines through that one. The node a row's fold is, the outermost starting on the
    line (`nodeAtLine` gives the innermost). The outline's, whatever is folded: which folds are on
    is a view's.

  - `OurusDoc.text: string`, `OurusDoc.marks: MarkSet`, `OurusDoc.mdTree: MdTree`, `OurusDoc.config: OurusConfig`, `OurusDoc.nextId: number`<br>
    The text; its placeholders (only those that still hold something); its parse; the config; the
    lineage's next id when this outline was read (a node with an id past it was made since).

  - `OurusDoc.root: PersistentNode`, `get OurusDoc.rootNode: OurusNode`<br>
    The outline's root: the stored node, and the same node with its position (see below).

  - `OurusDoc.node(id: number): OurusNode | undefined`<br>
    The node with an id. The index of ids is built on the first call, so keep it off hot paths.

  - `OurusDoc.nodeAtLine(line: number): OurusNode | null`<br>
    The node whose own lines are on a line (its text's, its block-id lines' and the blank lines
    between them): the deepest one, where nested items share a line. Null on other blank lines and in
    the preamble.

  - `OurusDoc.blockIds(): readonly BlockId[]`<br>
    Every block id written in the document, in order, stray ones included, where the flavor has them
    (Obsidian's ` ^id`, and `^id` on a line of its own after a block); read on the first call. Each
    `BlockId` has its `name`; where it is (`from`, `to`: `^` through the name; `partFrom`, `partTo`:
    all of it, the blank or line break before it, a carried line's blank lines); `ownLine` and
    `carried` (on a line of its own; carried by its owner's text, outside its string); `owner`, the
    node it is written on; `target`, what Obsidian names by it: a node (an item for any block id
    inside one), a whole list (`{ list }`, by its first item), or nothing; `shadowed`, another block id
    for the same target being the one Obsidian counts (inside an item the first, else the last), so a
    link to this one finds nothing; `stray`, why the target is no node it is written on (`whole-list`,
    `item`, `quote`, `nothing-above`, `block-below`, `trailing-space`), else null; `syntax` (`caret`)
    and `implicit` (false). A link to a node uses the one not shadowed whose `target` is it; a host
    that keeps links in other notes right compares `blockIds()` before and after an edit.

  - `OurusDoc.textOf(node: OurusNode): OurusText | null`<br>
    A node's text, read once per stored node. Null for a node without one: the root, a quote without
    a callout title, an item whose first line holds a quote or a list.

  - `OurusDoc.locateRaw(pos: number): Located`<br>
    What is at `pos`, by zone: `text` (in a node's text, with the offset there), `frame` (a checkbox,
    `#`s, a fence, a block id ending the text, ...), `marker` (an item's indentation, marker or
    padding), `prefix` (a container's, like a quote's `>`), `blockIdLine` (a block-id line a text
    carries, or a blank line before one: which of them, `blank`, and the offset in it past its
    indentation), `gap` (a blank line, with the node above it as its owner, whatever is folded: the
    view's `locate` gives the node the reader sees there), `preamble`, or `none`.

  - `OurusDoc.posOf(node: OurusNode, offset: number, assoc = 1): number`, `OurusDoc.offsetOf(node: OurusNode, pos: number): number`<br>
    Converts an offset in a node's text to a position in the document, and back. Where the document
    has characters the text leaves out (a prefix, an escape), `assoc` picks which side of them.

  - `get OurusDoc.lineCount: number`, `OurusDoc.lineAt(pos: number): { index, from, to }`<br>
    The number of lines; the line `pos` is on.

  - `OurusDoc.textStart(i: number): number`<br>
    Where the text starts on line `i` (where Home goes): past its containers' prefixes, an item's
    marker, the node's frame, and the blanks after them. Hidden spaces (see `hiddenSpaces`) are
    text, so it stops before them. On a block-id line a text carries: under `markup: decorated`,
    the end of that text (the caret stays out of it); else past its indentation.

  - `OurusDoc.isBlankLine(i: number)`, `OurusDoc.isEmptyLine(i: number)`, `OurusDoc.isLazyLine(i: number)`<br>
    Whether a line holds nothing past its containers' prefix (a quote's `>` line is blank); whether
    it holds only whitespace, not even a `>`; whether it continues a paragraph lazily.

  - `OurusDoc.atTextColumn(pos: number, node: OurusNode): boolean`<br>
    Whether `pos` is on a blank line, at the column where `node`'s text starts. This is the line
    Shift-Enter makes at the end of a text.

  - `get OurusDoc.leadingBlankLines: number | null`, `get OurusDoc.blank: boolean`<br>
    How many blank lines are before the first node (null when something else is there, such as
    frontmatter); whether the document is nothing but blank lines.

  - `OurusDoc.hiddenSpaces(node: OurusNode): { from, to } | null`<br>
    The spaces before a node's text on its first line that Markdown doesn't show: an item's padding
    beyond the one space after its marker (or after its checkbox), or a paragraph's indentation, at
    most three columns. They are the user's whitespace, not markup, so a join gives them back as
    spaces.

  - `OurusDoc.markerOf(item: OurusNode): string`, `OurusDoc.listOf(item: OurusNode): MdBlockAt | null`<br>
    An item's marker as written (`-`, `1.`); the list block the parser puts it in.

  - `OurusDoc.codeSpanAt(pos: number): { closer, to } | null`<br>
    The code span `pos` is inside: where its closing backtick run starts, and where the span ends.

  - `OurusDoc.readsAs(text: OurusAtom): boolean`<br>
    Whether an atom text's lines, parsed alone, read as one block of its type, closed or not as
    the text is.

  - `OurusDoc.escapeParagraph(lines: string[]): string[] | null`<br>
    The lines of a paragraph's text, with the backslashes they need to read as a paragraph when
    written at the start of a block, in this document's flavor. Null where no escaping does it.

  - `OurusDoc.markdownOf(from: number, to: number): string`, `OurusDoc.markdownStart(node: OurusNode): number`, `OurusDoc.rangeOf(node: OurusNode): { from, to }`<br>
    A range's Markdown as written, without the prefixes of the containers that hold all of it (what
    copy puts on the clipboard); where a node's own Markdown starts (an item at its marker, a quote
    at its `>`); the range of a node's lines, its descendants' included.

- **`PersistentNode`** is a node of the outline as stored. Snapshots and drafts share it
  for as long as it stays the same. It has:

  - `id`, `kind` (`OurusNodeKind`: `root`, `heading`, `item`, `paragraph`, `quote`, `atom`),
    `gap` (the blank lines after its own lines, before its first child or what follows), and
    `children`;
  - for a node read from a document: its parser blocks (`block`, and `head`, the block holding its
    text), its extent in lines, up to the next node (`lines`), and each child's first line counted
    from its own (`offsets`).

  It holds no parent and no absolute line number, so an update only makes anew the nodes on the path
  from the root to the edit.

  - `get PersistentNode.read: boolean`, `PersistentNode.source`, `PersistentNode.text`<br>
    Whether the node was read from a document. A draft makes its nodes with `static drafted(...)`:
    for those, `source` is the read node it changes (null for a new one) and `text` is the text the
    draft set.

  - `PersistentNode.textLines(): { first, last }`, `PersistentNode.ownLines(): { first, last }`, `PersistentNode.blockIdCount`<br>
    The lines of its text, counted from its first line; its own lines, its text's and the block-id
    lines its text carries after them; how many lines those take, blank lines between included (0
    where it carries none). Reading a text uses its text's lines; the node's geometry its own.

- **`OurusNode`** is a node of one snapshot's outline, with its position: its lines, its parent and
  its siblings. It wraps a `PersistentNode`, which stores none of those so that snapshots can
  share it. An `OurusNode` is made when a query reaches it.

  - `OurusNode.persistentNode`, `get OurusNode.id`, `get OurusNode.kind`, `get OurusNode.block`, `get OurusNode.head`, `get OurusNode.gap`

  - `OurusNode.startLine`, `get OurusNode.textFirstLine`, `get OurusNode.textLastLine`, `get OurusNode.ownLastLine`, `get OurusNode.endLine`<br>
    Its first line; the first and last lines of its text; the last of its own lines (its text's, or
    its last block-id line); its last line, counting its descendants and blank lines.

  - `OurusNode.parent`, `OurusNode.index`, `OurusNode.depth`, `get OurusNode.children`, `OurusNode.child(i)`, `get OurusNode.prev`, `get OurusNode.next`

  - `OurusNode.ancestors()`, `OurusNode.isWithin(ancestor: OurusNode | number)`, `OurusNode.subtreeIds()`, `get OurusNode.foldable`<br>
    Its ancestors, its parent outward; whether it is `ancestor` or a descendant of it; its
    subtree's ids, its own included; whether it can fold, children on lines after its own.

  - `get OurusNode.lastDescendant`, `get OurusNode.preceding`, `get OurusNode.afterSubtree`<br>
    Its last descendant; the node before it in document order (its previous sibling's last
    descendant, or else its parent); the first node after its subtree.

  - `get OurusNode.ownsLists: boolean`<br>
    Whether a paragraph among its children owns the list right after it. That happens only in the
    document's own sections, not in an item or a quote.

  - `OurusNode.becomesTitle(text: OurusProse): boolean`<br>
    Whether setting `text` on it would make it its quote's callout title: it is a quote's first
    child, and the text's first line opens a callout.

  - `OurusNode.nodeAtLine(line: number): OurusNode | null`<br>
    The node in its subtree whose own text is on a line.

- **`OurusText`** is a node's text, of either kind: `OurusProse | OurusAtom`. A prose text is
  ourus's to edit as text (split, join, escape, normalize); an atom's lines are taken as written,
  whatever the parser reads inside them (code, math, HTML, a table). Either carries `blockIdLines`:
  the block-id lines after its string that its flavor names its node by (`{ blankLines, line }`, a
  table's `⏎⏎^t1`), which aren't in its string; `withBlockIdLines(lines)` gives the same text
  carrying others. `blockIdsOf(text)` reads a text's block ids (the one ending its string, then the
  carried ones); `withoutBlockIds(text, which?)` drops them all, or those `which` says (by where they are in
  `blockIdsOf`).

- **`OurusProse`** is the text of a paragraph, a heading, or a quote's callout title (an item's too,
  where its first block is one of those): its lines without their containers' prefixes and without
  markup escapes, joined by `\n`, with its placeholders. Immutable.

  - `new OurusProse(type: OurusProseType, item: boolean, text: string, marks?: MarkSet, blockIds?: 'caret' | null, blockIdLines?)`<br>
    `blockIds`: how its flavor writes a block id in it (Obsidian's ` ^id`), which its frame reads; a
    text a command makes from nothing has none, and is read in the document's (`withBlockIds`).

  - `OurusProse.type`, `OurusProse.item`, `OurusProse.text: string`, `OurusProse.marks: MarkSet`<br>
    The type: `paragraph`, `heading`, or `title` (a quote's callout title). Whether it is an item's
    text, which can start with a checkbox or below the marker. The whole string, frame and body.
    Its placeholders, in the text's offsets.

  - `get OurusProse.frame: FramePart[]`<br>
    The markup in the string around the body, computed from its characters: `task` (a checkbox),
    `heading` and `close` (an ATX heading's `#`s), `callout` (`[!type]` and its fold), `underline`
    (a setext heading's), `below` (the line breaks before an item's text that starts below its
    marker), `blockId` (a block id ending the text, with the blanks or the line break before it,
    before what else closes it: `## H ^x ##`, `Title ^x⏎===`).

  - `get OurusProse.body: string`<br>
    The string without its frame: what the user edits, and what the draft's check compares.

  - `get OurusProse.task`, `get OurusProse.heading`, `get OurusProse.callout`, `get OurusProse.empty`<br>
    The checkbox's status; the heading's level and form; the callout's type and fold; whether the
    text holds nothing but Markdown's whitespace (a no-break space counts as text, and so does a
    block id: `- ^x` is no empty item).

  - `OurusProse.textStart(line: number): number`<br>
    The first offset on a line past the frame.

  - `OurusProse.splice(from, to, insert?)`, `OurusProse.slice(from?, to?)`, `OurusProse.concat(...others)`<br>
    New texts, with the placeholders carried along, and the block-id lines but by `slice`, whose
    result is a `fragment`: it says nothing of them, and the draft refuses it as the text of a node
    that carries some until `withBlockIdLines` says what they are (a split or a join gives them to
    one node explicitly).

  - `OurusProse.asItem(item: boolean)`, `OurusProse.normalize()`<br>
    The same string read as an item's text or not. The text after an edit, reread as what it now
    is: a heading that no longer reads as one becomes a paragraph, and so does a title that no
    longer reads as a callout; a paragraph's block-id line right under it is a line of its string.

  - `closingFrameStart(text)`, `isClosingPart(part)`<br>
    Where a text's closing frame starts: the run of closing parts that ends it (a block id, an ATX
    closing sequence, a setext underline). A split keeps it with the first half, a join puts what it
    appends before it, and `textEnd` is there.

- **`OurusAtom`** is the text of an atom: code, math, a comment, HTML, a table, a definition, a
  thematic break, an extension's block (and code that is an item's text): its lines as written,
  without their containers' prefixes, with its placeholders. Immutable.

  - `new OurusAtom(type: string, item: boolean, text: string, marks?: MarkSet)`

  - `OurusAtom.type`, `OurusAtom.item`, `OurusAtom.text`, `OurusAtom.marks`<br>
    The parser's block type (for code, `fenced_code` or `indented_code`); whether it is an item's;
    the string; its placeholders.

  - `get OurusAtom.frame: AtomFramePart[]`<br>
    Computed from the characters: `open`, `info` and `close` (a fence's, `$$`, `%%`), `indent`
    (indented code's columns), `label` (a footnote's), `rule`.

  - `get OurusAtom.body`, `get OurusAtom.fence`, `get OurusAtom.info`, `get OurusAtom.delimiters`, `get OurusAtom.closed`<br>
    The content without the frame; the fence's run (or `$$`, `%%`); the fence's info string; where
    the opening and closing runs are; whether it is closed.

  - `OurusAtom.delimiterLine(k: number): boolean`, `OurusAtom.splice(from, to, insert?)`<br>
    Whether line `k` is a delimiter line; a new text.

- **`outlineChildren(flat: FlatChild[], paragraphsOwnLists: boolean): OutlineChild[]`**<br>
  Nests a container's children the way the outline has them, from the flat sequence Markdown lays
  them out in. A heading owns what follows it, up to the next heading of its level or higher. With
  `paragraphsOwnLists` (true at the root), a paragraph owns the items of a list right after it.
  Both reading a document and the draft's `done()` nest with it.

- **`escapeParagraph(flavor, type, item, lines, held): MdEscapedParagraph | null`**<br>
  The parser's `MdFlavor.escapeParagraph`, for a node's text. It passes the parser what it can't
  know on its own: the text's type and frame, the lines a placeholder holds (`held`), and leaving
  out a setext underline.

Files:

- `index.ts` (the API); `doc.ts` (`OurusDoc`); `node.ts` (`PersistentNode`, the node
  as stored, and `OurusNode`, a snapshot's, with its position); `extent.ts` (what a fold of a node
  would hide, a zoom into it show, the nodes a row starts); `outline.ts` (reading the outline
  from the parse, sharing nodes between snapshots, a block-id paragraph that names the block before
  it carried by that block); `text.ts` (`OurusProse`, `OurusAtom`, where a text starts and ends,
  `textStart` and `textEnd`, and a text's block ids); `block-ids.ts` (`OurusDoc.blockIds`, and
  `checkBlockIds`, the rule every command keeps: no block id loses what it names, read where the
  command's changes reached, down to where the outline is the nodes it was).
- `read.ts` (a node's text read from its lines, with its markup escapes left out, and the map
  between the text's offsets and the document's); `escapes.ts` (`markupEscapes` for reading,
  `escapeParagraph` for writing); `locate.ts` (what is at a position); `rules.ts` (which
  node kinds hold which, `outlineChildren`); `placeholders.ts` (which placeholders still hold
  something); `copy.ts` (a range's Markdown without its containers' prefixes).

Tests, in `test/doc/`: `doc.test.ts` (placeholders, updates), `outline.test.ts` (an update's outline
equals a fresh parse's), `text.test.ts`, `locate.test.ts`, `escapes.test.ts`, `block-ids.test.ts`
(each shape's frame parts, carried lines and own lines, strays, `locate` on a block-id line),
`block-id-shapes.test.ts` (obsidian-true-outliner's shapes measured in Obsidian: each block id's
owner, target, shadowing and stray reading); and
`test/placeholders.test.ts` (the placeholders' lifecycle).
