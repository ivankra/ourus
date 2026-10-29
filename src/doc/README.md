# Doc

A Markdown text read as an outline. `OurusDoc` is the snapshot a host keeps and commands take: the
text, its placeholders, its parse, and the outline read from it. For each node it gives the node's
text and that text's frame, and for each position, what is there. Editing a document is `writer/`'s
job.

Basic usage:

```ts
import { OurusDoc } from 'ourus';

let doc = OurusDoc.parse(text, { config: { flavor: 'obsidian' }, marks });
doc = doc.update({ changes, caret });       // after a host's edit: placeholders mapped, untouched nodes shared
for (const node of doc.rootNode.children) console.log(node.kind, doc.textOf(node)?.body);
const at = doc.locate(pos);                 // in a text, a frame, a marker, a prefix, a gap, ...
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
    starts.

  - `OurusDoc.isSameLineage(other: OurusDoc): boolean`<br>
    Whether `other` is a snapshot of the same document: the same `parse`'s, through any updates,
    drafts and `with…`s. A lineage gives each id once, whichever snapshot asks, so a snapshot taken
    back (an undo's) never shares an id with a node made since.

  - `OurusDoc.withConfig(config: Partial<OurusConfig>): OurusDoc`<br>
    The same document under other options (a host's setting changed). An option that says only how
    commands write (`indentUnit`, `markup`, ...) changes on the same snapshot, its outline and ids
    shared; `quotes` and `listParent` have the outline read again from the same parse, ids carried as
    an update carries them; `flavor` parses the text anew, the folds and the zoom carried by line.

  - `OurusDoc.folded: ReadonlySet<number>`, `OurusDoc.zoom: number | null`, `get OurusDoc.zoomFolded: ReadonlySet<number>`<br>
    The view's state, not the text's: the nodes whose children it hides, the node
    it is zoomed into, and the folds in effect within the zoom (those of nodes strictly inside its
    root; all of `folded` where not zoomed). An update carries them by id, a writer's edit as any: a
    fold goes with its node, and opens where what it hides changed or it has nothing left to hide;
    the zoom goes with its root, to its nearest ancestor left where the root went, and ends where a
    node left its subtree.

  - `OurusDoc.withFolded(ids: Iterable<number>): OurusDoc`, `OurusDoc.withZoom(id: number | null): OurusDoc`<br>
    The same snapshot with other folds (an id with nothing to hide dropped), or another zoom (no fold
    changed; throws for an id that is no node here, or the root).

  - `OurusDoc.foldRange(node: OurusNode)`, `OurusDoc.zoomRange()`: `{ from, to } | null`<br>
    What folding a node hides: from the end of its text to the end of its subtree's last line, the
    blank lines after it shown; null where it doesn't fold. What the zoom shows: its root's lines,
    its descendants' and its trailing gap (`coverEnd(node)`, the last of them); null where not zoomed.

  - `OurusDoc.rowOwner(line: number): OurusNode | null`, `OurusDoc.isHidden(node: OurusNode): boolean`<br>
    The node a row's fold is, the outermost starting on the line (`nodeAtLine` gives the innermost);
    whether the view hides a node, under a fold of `zoomFolded` or outside the zoom.

  - `OurusDoc.withViewOf(view: OurusDoc, changes?: ChangeSpec[]): OurusDoc`<br>
    This snapshot with the folds and zoom of `view`, another snapshot of its lineage, carried onto it
    by id through `changes` (`view`'s text to this one's; by default, the lines that differ), as an
    update carries them. A second pane takes the snapshot one view made (a command's `doc`, its
    `update`) rather than replaying the changes, whose replay gives the nodes the writer moved new
    ids, their folds lost. An undo takes back the snapshot from before the step, its nodes, ids and
    all: `like.withConfig(doc.config).withViewOf(doc)`, an undone move's node with its fold. Throws
    for a snapshot of another lineage.

  - `OurusDoc.zoomEscape(next: OurusDoc, removed?: boolean): string | null`<br>
    Where `next`, a later snapshot of this lineage, leaves this one's zoom, or null where it keeps
    it: the root keeps its id, parent and place; every node outside its subtree its id, parent, kind
    and text, none made outside it, none inside leaving it; the text before the root's Markdown and
    after its cover the same; the lists the root and its ancestors are items of the same items, and
    as tight. `removed`: the root went whole, which only `deleteSubtree` and `cut` may do. The
    commands check their results by it, and `leavesZoom` a host's edit.

  An update carries the view by id: a fold stays where its node has something to hide and, but for
  the zoom root's and its ancestors', where what it hides is the same nodes with the same texts (read
  only for a fold a change comes near: what it hides, or right after it); else it opens. The zoom
  stays where its root is there and none of its subtree left it; its root gone, it goes to the
  nearest ancestor left; a node gone out of it, it ends.

  - `OurusDoc.text: string`, `OurusDoc.marks: MarkSet`, `OurusDoc.mdTree: MdTree`, `OurusDoc.config: OurusConfig`, `OurusDoc.nextId: number`<br>
    The text; its placeholders (only those that still hold something); its parse; the config; the
    lineage's next id when this outline was read (a node with an id past it was made since).

  - `OurusDoc.root: PersistentNode`, `get OurusDoc.rootNode: OurusNode`<br>
    The outline's root: the stored node, and the same node with its position (see below).

  - `OurusDoc.node(id: number): OurusNode | undefined`<br>
    The node with an id. The index of ids is built on the first call, so keep it off hot paths.

  - `OurusDoc.nodeAtLine(line: number): OurusNode | null`<br>
    The node whose own text is on a line: the deepest one, where nested items share a line. Null on
    blank lines and in the preamble.

  - `OurusDoc.textOf(node: OurusNode): OurusText | null`<br>
    A node's text, read once per stored node. Null for a node without one: the root, a quote without
    a callout title, an item whose first line holds a quote or a list.

  - `OurusDoc.locate(pos: number): Located`<br>
    What is at `pos`, by zone: `text` (in a node's text, with the offset there), `frame` (a checkbox,
    `#`s, a fence, ...), `marker` (an item's indentation, marker or padding), `prefix` (a
    container's, like a quote's `>`), `gap` (a blank line, with the node above it as its owner),
    `preamble`, or `none`.

  - `OurusDoc.touchedSubtrees(sel: OurusSelection): readonly number[]`<br>
    The subtrees a selection touches: the topmost nodes whose own lines it touches, in document
    order, at whatever depths; a caret's node, the innermost where nodes share a line (`- - a`); a
    blank line the gap of the node above it; a selection ending at a line's very start not touching
    that line. What a key acts on. `[]` only where there is no node (the blank lines before the
    first, an empty document).

  - `OurusDoc.selectedSubtrees(sel: OurusSelection): readonly number[] | null`<br>
    The roots of a subtree selection, a selection that is exactly their subtrees as whole lines: from
    column 0 of the first's first line to the start of the line after the last's subtree, or its last
    line's end, or anywhere in the blank lines after it; where nodes share those lines, the outermost
    inside the zoom. Null for a caret, text, and a node's own text (but at the document's end, where
    it is the node too). What a host draws as blocks selected whole.

  - `OurusDoc.selectionOf(ids: readonly number[], direction?: 'down' | 'up'): OurusSelection`<br>
    The subtrees of `ids` as whole lines, their closure (every node the span touches, whole): the
    canonical subtree selection, the anchor at the top unless `up`. Throws for no ids, an unknown id,
    the root, an id outside the zoom or one a fold hides.

  - `OurusDoc.touchedNodes(sel)`, `OurusDoc.selectedNodes(sel)`<br>
    The same two answers as nodes. A snapshot keeps its last selection's answers.

  - `OurusDoc.posOf(node: OurusNode, offset: number, assoc = 1): number`, `OurusDoc.offsetOf(node: OurusNode, pos: number): number`<br>
    Converts an offset in a node's text to a position in the document, and back. Where the document
    has characters the text leaves out (a prefix, an escape), `assoc` picks which side of them.

  - `get OurusDoc.lineCount: number`, `OurusDoc.lineAt(pos: number): { index, from, to }`<br>
    The number of lines; the line `pos` is on.

  - `OurusDoc.textStart(i: number): number`<br>
    Where the text starts on line `i` (where Home goes): past its containers' prefixes, an item's
    marker, the node's frame, and the blanks after them. Hidden spaces (see `hiddenSpaces`) are
    text, so it stops before them.

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
    `gap` (the blank lines after its own text, before its first child or what follows), and
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

  - `PersistentNode.textLines(): { first, last }`<br>
    The lines of its text, counted from its first line.

- **`OurusNode`** is a node of one snapshot's outline, with its position: its lines, its parent and
  its siblings. It wraps a `PersistentNode`, which stores none of those so that snapshots can
  share it. An `OurusNode` is made when a query reaches it.

  - `OurusNode.persistentNode`, `get OurusNode.id`, `get OurusNode.kind`, `get OurusNode.block`, `get OurusNode.head`, `get OurusNode.gap`

  - `OurusNode.startLine`, `get OurusNode.textFirstLine`, `get OurusNode.textLastLine`, `get OurusNode.endLine`<br>
    Its first line; the first and last lines of its text; its last line, counting its descendants
    and blank lines.

  - `OurusNode.parent`, `OurusNode.index`, `OurusNode.depth`, `get OurusNode.children`, `OurusNode.child(i)`, `get OurusNode.prev`, `get OurusNode.next`

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
  whatever the parser reads inside them (code, math, HTML, a table).

- **`OurusProse`** is the text of a paragraph, a heading, or a quote's callout title (an item's too,
  where its first block is one of those): its lines without their containers' prefixes and without
  markup escapes, joined by `\n`, with its placeholders. Immutable.

  - `new OurusProse(type: OurusProseType, item: boolean, text: string, marks?: MarkSet)`

  - `OurusProse.type`, `OurusProse.item`, `OurusProse.text: string`, `OurusProse.marks: MarkSet`<br>
    The type: `paragraph`, `heading`, or `title` (a quote's callout title). Whether it is an item's
    text, which can start with a checkbox or below the marker. The whole string, frame and body.
    Its placeholders, in the text's offsets.

  - `get OurusProse.frame: FramePart[]`<br>
    The markup in the string around the body, computed from its characters: `task` (a checkbox),
    `heading` and `close` (an ATX heading's `#`s), `callout` (`[!type]` and its fold), `underline`
    (a setext heading's), `below` (the line breaks before an item's text that starts below its
    marker).

  - `get OurusProse.body: string`<br>
    The string without its frame: what the user edits, and what the draft's check compares.

  - `get OurusProse.task`, `get OurusProse.heading`, `get OurusProse.callout`, `get OurusProse.empty`<br>
    The checkbox's status; the heading's level and form; the callout's type and fold; whether the
    text holds nothing but Markdown's whitespace (a no-break space counts as text).

  - `OurusProse.textStart(line: number): number`<br>
    The first offset on a line past the frame.

  - `OurusProse.splice(from, to, insert?)`, `OurusProse.slice(from?, to?)`, `OurusProse.concat(...others)`<br>
    New texts, with the placeholders carried along.

  - `OurusProse.asItem(item: boolean)`, `OurusProse.normalize()`<br>
    The same string read as an item's text or not. The text after an edit, reread as what it now
    is: a heading that no longer reads as one becomes a paragraph, and so does a title that no
    longer reads as a callout.

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
  as stored, and `OurusNode`, a snapshot's, with its position); `outline.ts` (reading the outline
  from the parse, sharing nodes between snapshots); `text.ts` (`OurusProse`, `OurusAtom`, and where
  a text starts and ends, `textStart` and `textEnd`).
- `read.ts` (a node's text read from its lines, with its markup escapes left out, and the map
  between the text's offsets and the document's); `escapes.ts` (`markupEscapes` for reading,
  `escapeParagraph` for writing); `locate.ts` (what is at a position); `select.ts` (what a
  selection is of the outline: the subtrees it touches, the subtrees it is); `rules.ts` (which
  node kinds hold which, `outlineChildren`); `placeholders.ts` (which placeholders still hold
  something); `copy.ts` (a range's Markdown without its containers' prefixes).

Tests, in `test/doc/`: `doc.test.ts` (placeholders, updates), `outline.test.ts` (an update's outline
equals a fresh parse's), `text.test.ts`, `locate.test.ts`, `escapes.test.ts`; and
`test/placeholders.test.ts` (the placeholders' lifecycle).
