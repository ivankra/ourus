# Block ids (2026-10-29)

A **block id** is a name written into a note's text that names one block, so that something else can
link to that block, embed it, or cross-reference it. Three formats ourus will read have them:

- **Obsidian**: `Some text ^abc123`, or `^abc123` on a line of its own after a table or a quote.
  Linked as `[[Note#^abc123]]`, embedded as `![[Note#^abc123]]`.
- **Logseq** (file-based): an `id:: <uuid>` property line inside a block. Referenced as `((uuid))`.
- **Pandoc and Quarto**: an attribute set, `## Results {#sec-results}`, ```` ```{#lst-x} ````,
  `::: {#fig-x}`. Referenced as `@sec-results` or `[text](#sec-results)`.

Before this design, a block id was plain text to ourus. The parser recognized Obsidian's ` ^id` at
the end of a block (`parser/obsidian.ts`, an inline `block_id`), but nothing after the parser used
it, and an `^id` on a line of its own was read as a paragraph. So the commands moved block ids off
their blocks, split them off, merged them into text and duplicated them, and each link then named
the wrong block or nothing (§3).

Obsidian's syntax is built first. Logseq and Pandoc come with their flavors. The model is shaped so
that each needs its own syntax and where that syntax sits in a node, but not new rules for the
commands.

## Contents

- [1. What hosts need](#1-what-hosts-need)
- [2. Block ids in each format](#2-block-ids-in-each-format)
  - [2.1 Obsidian](#21-obsidian)
  - [2.2 Logseq](#22-logseq)
  - [2.3 Pandoc and Quarto](#23-pandoc-and-quarto)
  - [2.4 Other formats](#24-other-formats)
- [3. What ourus did before](#3-what-ourus-did-before)
- [4. The model](#4-the-model)
- [5. Commands](#5-commands)
- [6. The API](#6-the-api)
- [7. The spec and the tests](#7-the-spec-and-the-tests)
- [8. Implementation log](#8-implementation-log)
- [9. Decided, and open](#9-decided-and-open)

## 1. What hosts need

- **obsidian-true-outliner** (TO)'s attempted ourus port lists this as its first High-priority gap.
  An `^id` on a line of its own is parsed as a separate paragraph, so moving the block above it leaves
  the block id behind. Fifteen of TO's tests were kept as expected failures until ourus supported this: 14
  in `tests/block-ids.test.ts` and one in `decorate.test.ts`. TO kept its own reading of block ids
  (`src/block-ids.ts`, `src/rules.ts`): it found block ids Obsidian can't attach to the right block,
  and offered fixes in a menu (`src/plugin/misplaced-ids.ts`). It also has block-id markers in the
  editor, and a backlink index. Now ourus reads them, and TO keeps only its menu (§5.6, §8).
  TO refuses a Backspace that would merge a node into its own block-id line.
- **obsidian-outliner** doesn't bother with block ids.
- **Following a link.** A host that zooms to the block a `#^id` link names needs to find the node by
  its block id, from one snapshot: in `blockIds()`, the one of that name not shadowed, its `target`.

Out of scope for ourus: which other notes link to a block id, resolving links and rendering embeds.
Those belong to the host, and in Obsidian to its metadata cache. A host that keeps links in other
notes right diffs `blockIds()` across a command's snapshots; a command's result also says what it
did on purpose: the block ids it moved or merged into another, and the nodes it removed (§6).

## 2. Block ids in each format

### 2.1 Obsidian

TO measured this in Obsidian 1.13.7, over 55 shapes of note and 17 embeds, by reading
`CachedMetadata.blocks`: `docs/research/lone-block-id.md`, with the shapes as test
fixtures in `tests/block-id-shapes.ts` (`RESEARCH_SHAPES`). A block id is `[A-Za-z0-9-]+`. The
rules:

- **At the end of a text.** ` ^id` ending a block's text names that block. So does `^id` on the line
  directly under a paragraph, because Markdown reads that line as part of the paragraph.
- **On a line of its own, outside a list.** It names the block that ends above it, of any kind
  (paragraph, heading, table, quote, callout, code fence, rule, HTML), skipping any number of blank
  lines between them. A heading and a fence take it even with no blank line between.
- **Outside a list item, what comes after the block-id line matters.** It must be a blank line or
  the end of the note. With a block directly under it, the block id names only its own line. Inside
  a list item it doesn't matter: a nested item, a quote or a heading directly under the block-id
  line still leaves it naming the item. Only text that joins the line makes it no block id.
- **Quotes are the exception.** A block id directly under a quote or a callout is read as part of
  the quote, so it names the quote whatever follows.
- **Inside a list item, every block id names the item.** This holds whichever block inside the item
  it ends: a paragraph, a table, a fence, a quote. The only exception is a block id indented to a
  nested item's column, which names that nested item.
- **Under a list.** Directly under the list's last item, a block id names that item. After a blank
  line, it names the whole list.
- **The block-id line must be exact.** With trailing spaces, or text on the line directly under it,
  no block id is registered at all.
- **Two block ids that would name one block.** Outside a list item the last one counts, inside one
  the first. Two block ids in a row on lines of their own (`^y1`, a blank line, `^y2`) are such a
  pair. Block ids in different containers are judged apart: an item's block id and a block id
  after its list both count.
- **What an embed shows.**
  - An item's block id shows the item with its children, which is how the outline reads an item too.
  - A heading's block id shows only the heading line.
  - For a list with a paragraph just above it, a block id after the list shows the list without the
    paragraph.

So there are two kinds of block-id lines:

- **Attachable**: the block id comes right after one node's own lines and Obsidian names that node.
  This covers a block at the top level or in a heading's section, a heading, a list item with the
  block id indented under its text, and the last item with the block id directly under it.
- **Stray**: Obsidian names something that is no node of the outline (a whole list), or names the
  item around the block the block id follows, or the quote above it where ourus reads the quote as a
  container, which can carry no line; or names nothing (a block id at the top of a note, one with a
  block directly under it, a line that only looks like a block id). The first of two block
  ids for one block isn't stray: both attach, and the one Obsidian doesn't count is shadowed (§4.5).

### 2.2 Logseq

**The format.** In Logseq's file-based version (OG), every block is a list item. Its block id is a
UUID kept as a block property: an `id:: <uuid>` line inside the block, after its first line. Logseq
writes it only once something references the block (`((uuid))`, `{{embed ((uuid))}}`, "Copy block
ref"). A block id names the block with its children, which is exactly an outline node, so Logseq has
nothing like Obsidian's stray block ids. Block ids are unique across the graph, not per note. The DB
version keeps uuids in its database and writes none to files.

**Measured** on 2026-10-29 on demo.logseq.com, through the SxS harness's Logseq drivers, OG and DB:

- one block references another (`see ((uuid))`; in OG with the `id::` line written as the editor
  writes it);
- one key is pressed;
- the tree is read back with each block's uuid and references.

The script was a scratch file, `uuid-probe.ts`, built on `sxs/lib/browser.ts` and the drivers.

| Action on the referenced block `b` | Logseq OG | Logseq DB |
| --- | --- | --- |
| Enter mid-text, `foo┃bar` | `foo` keeps the uuid; `bar` is new | the same |
| Enter at the text's start | the new empty block goes above; `foobar` keeps the uuid | the same |
| Enter at the end | the new block goes below; `foobar` keeps the uuid | the same |
| Move up | uuid kept | the same |
| Backspace at `b`'s start, merging it into an unreferenced `a` | `ab` **takes `b`'s uuid**; the reference holds | `ab` keeps `a`'s; **the reference breaks** |
| Delete at the end of an unreferenced `a`, merging `b` into it | the same as Backspace | the same as Backspace |
| Backspace on an unreferenced `b`, into a referenced `a` | `a`'s uuid kept | the same |
| Backspace on `b` into `a`, **both referenced** | `ab` keeps `b`'s uuid, and **references to `a` are rewritten** to point at it: none breaks | `ab` keeps `a`'s; references to `b` break |
| Copy, paste | the copy gets a new uuid | the same |
| Cut, paste | uuid kept | a new uuid: the reference breaks |
| Delete the block | **references are replaced by its text**: `see ((b))` becomes `see b` | references break |

OG never lets an edit break a reference: it moves block ids, rewrites references, or inlines the
text. DB breaks references on every merge, cut and delete. One caveat about OG: after a merge, its
database and its text disagree. The merged block took `b`'s uuid, but its text kept `a`'s `id::`
line, or none. Re-read from the file, those references would break. The demo graph saves nothing to
disk, so this was read from the block's content. For ourus the text is the only truth, so whatever a
command decides has to be written into it.

### 2.3 Pandoc and Quarto

A Pandoc/Quarto flavor is planned soon after this. This section is from memory of Pandoc's manual
and Quarto's cross-reference docs, and is to be checked against both, and against `pandoc -t json`,
before building.

Block ids are written in attribute sets, `{#id .class key=value}`:

| Block | Syntax | Where the block id is |
| --- | --- | --- |
| Heading (`header_attributes`) | `## Results {#sec-results}`; on a setext heading, on its text line | at the end of its text |
| Fenced div (`fenced_divs`) | `::: {#thm-main}` … `:::`, a container of any blocks; Quarto's figures, theorems and callouts are divs | in its opening fence |
| Fenced code (`fenced_code_attributes`) | ```` ```{#lst-x .python} ```` | in its opening fence |
| Quarto code cell | `#| label: fig-plot` among the options at the top of ```` ```{python} ```` | inside the code |
| Display math (Quarto) | `$$ … $$ {#eq-energy}` | after the closing `$$` |
| Figure (`implicit_figures`) | a paragraph that is only `![caption](plot.png){#fig-plot}` | at the end of its text |
| Table (`table_captions`) | a caption, `: Caption {#tbl-x}`, **before or after** the table | on a line attached to the table |
| Any block (`attributes`, in `commonmark_x`; djot is the same) | `{#id .class}` on a line of its own **before** the block | on a line attached to the block |
| Example list item (`example_lists`) | `(@label) text`, referenced as `(@label)` | in its marker |
| Span (`bracketed_spans`) | `[some text]{#id}` | inside text; not a block, so out of scope |

How this differs from Obsidian and Logseq:

- **People write the names, and they carry meaning.** Quarto reads the prefix (`sec-`, `fig-`,
  `tbl-`, `eq-`, `thm-`, `lst-`) as the kind of cross-reference. So ourus must never make one up.
- **An attribute set holds more than the block id.** When a command drops a block id, it takes out
  `#id` alone and keeps the classes and key-values. It removes the braces only if nothing is left in
  them.
- **Implicit block ids.** With `auto_identifiers`, a heading without a block id gets one from its
  text: `Results` becomes `#results`, and links can use it. Retyping the heading changes the block
  id, and a second heading with the same text gets `-1`.
- **References are mostly in the same document** (`@fig-plot`, `[text](#results)`). Quarto books
  also cross-reference between chapters. Unlike Obsidian's links across a vault, ourus can see
  these, so the Pandoc flavor may rewrite them itself after a merge (§8, what is left).
- **A block id can come before its block**: an attribute line, or a caption above a table. Neither
  Obsidian nor Logseq does this.
- **Block ids on containers.** A div with a block id names everything inside it. That needs the
  Pandoc flavor to read divs as containers, the way ourus reads quotes under `quotes: container`.
  That reading is the flavor's design, and a bigger question than block ids.
- **No block ids on list items or plain paragraphs**, except through a div around them, the
  `attributes` extension, or example lists. Most block ids are on headings, divs, code, math,
  figures and tables.

### 2.4 Other formats

From memory, unmeasured:

- **SiYuan** stores notes as JSON, with a block id on every block. Its older kramdown format wrote
  `{: id="…"}` on a line after each block, which works like Obsidian's block-id line.
- **Org-mode and org-roam** keep `:ID: <uuid>` in a `:PROPERTIES:` drawer under a heading, like
  Logseq's property line. Logseq's org-format graphs do the same.
- **AsciiDoc and reStructuredText** put block anchors on a line before the block, like Pandoc's
  attribute line.
- **Dendron** and **Markdown Oxide** use Obsidian's `^id` syntax.

None is planned. They only confirm the places §4.3 and §4.4 give a block id: in a node's own markup,
on a line after it, or on a line before it.

## 3. What ourus did before

Run with `npm run probe -- --flavor=obsidian` on main at e9d7218, before this design was built (first
run at 5596ebb, the same). Each row now keeps its block id, or refuses (`spec/block-ids.md`):

| Note | Action | Result | What a link to the block id then names |
| --- | --- | --- | --- |
| `Intro.`, a table, `^t1`, `Out┃ro.` (blank lines between) | `moveSubtreeUp` | `Outro.` moves above `^t1` | `Outro.`, not the table |
| `## H┃`, `^h2`, `body` (blank lines between) | `enter` | a new empty paragraph between `## H` and `^h2` | still the heading while the new line is blank; the new paragraph once anything is typed in it |
| `- a ^x` / `- ┃b ^y` | `deleteContentBackward` | `- a ^x┃b ^y` | `^y` names the merged item; `^x` is now plain text |
| `- foo ┃bar ^x` | `enter` | `- foo` / `- bar ^x` | the new item, not the one the caret was in |
| `- a ^x┃` | `duplicateSubtree` | two `- a ^x` | two blocks with one block id |
| `- a`, a blank line, `  ^x`, then `- ┃b` | `moveSubtreeUp` | the block id moves with `a` | `a`, correctly, but only because ourus reads the block-id line as a paragraph inside `a` |

The two `TO-BlockId` cases in `spec/obsidian-true-outliner.md` passed only because their block-id
lines sit directly under the text, so they are already part of it.

## 4. The model

### 4.1 Terms

- **Block id** and **node id**. A block id is a name written in the text, which a link uses. A node
  id is ourus's own number for an outline node (`node(id)`; folds and the zoom are carried by it),
  never written in the text. This doc never says "id" alone. The apps name block ids differently:
  Logseq and Roam a block UUID or UID, Pandoc an identifier, Quarto and LaTeX a label, Dendron an
  anchor. All of them are block ids here.
- **Owner**: the node a block id is written on. The block id is in its text, or on lines of their
  own that the node's text carries (§4.3).
- **Link target**: what the app takes the block id to name. It is almost always the owner. In
  Obsidian it differs in three cases:
  - a block id ending a block inside a list item names the item (§2.1);
  - a block id written directly under a quote of several paragraphs or a callout, under `quotes:
    text` or `container`, is part of its last paragraph's text, so that paragraph is its owner, but
    it names the whole quote;
  - a stray block id names a whole list, or nothing.

  Hosts use the link target for backlinks and embeds.
- **Frame**: ourus's existing word for the characters of a node's text that are markup rather than
  the text itself: a heading's `#`s, a checkbox, a fence, a setext underline. The text's `body`
  leaves them out. Each piece is a `FramePart`, a range in the text string, which can span lines.

### 4.2 The rule

**After a command, no block id loses what it names, unless the command declares it; or the command
refuses.** What it names is a node id, as the draft carries node ids through the command. Two
things are kept:

- the **owner**: the block id is still written on the node it was written on;
- the **link target**: the app still takes it to name the same node, and it is still the one that
  counts for that node (not `shadowed`, §4.5).

A block id loses what it names when it comes to name another node, or nothing, or becomes shadowed.
A gain is allowed, except a gain of a name the note already holds (below). The changes a command
may make, which the check lets through (a host diffs `blockIds()` across the snapshots; the
declared ones are in the result too, §6):

- **removed**: with its node, where the command says it removed that node (`removedNodes`:
  `deleteSubtree`, a cut of nodes, a deletion key over a subtree selection, a paste over one); or
  written wholly inside the text a command takes, the user's choice (a cut of `a ^x` takes `^x` with
  it; a subtree selection and the whole document typed over take all of theirs). A selection across
  nodes typed over or deleted is a merge of its first and last nodes (§5.3): the nodes wholly inside
  it go, their block ids with them, while the first node stays and keeps its own even where the
  selection covers it. `removeBlockId` removes one on purpose (§5.6).
- **moved**: written on another node, where the command declares it (the draft's `movedBlockIds`): a
  merge's node that stays taking the other node's block id, so links still find the text (§5.3); and
  `quirkEnterMidHeading: workflowy`, whose split gives the heading's closing frame and section to a
  new node (§5.2). A declaration is a claim the check verifies: the block id must be on that node,
  and name something where it did (what a block id written on that node names: the node, or the item
  around it).
- **merged**: dropped in favor of the other node's block id, in a merge where both had one (§5.3,
  `joinBlockIds: 'merge'`), declared and given in the result. The check verifies that the other is
  written, unshadowed, and names something where the merged one did.
- **added**: written by `addBlockId`; kept from what a paste brings in (§5.4); made by an edit
  that leaves ` ^x` at the end of a text, which the app now reads as a block id (§5.2); or come to
  life, naming a node where it named nothing or was shadowed (below).
- **narrowed**: a target that was an enclosing item becomes the block id's own owner. Take
  `inner prose ^x8` inside an item, which Obsidian takes to name the whole item. Moved out of the
  item by a drag or `moveSubtree`, the block id names the paragraph it is written on, which is what
  the user wrote it on. The reverse refuses: a block whose block id would come to name the item
  around it. That rarely comes up, since a block moved into an item becomes an item itself (§5.1).

A block id a paste drops was never in the document, so it is no change at all.

**Only losses need declaring.** A command can also bring a block id to life without meaning to:
deleting or moving the block directly under a stray `^x` (`block-below`) makes it name the block
above; removing the counted one of two block ids for a node makes the shadowed one count. A block
id that comes to name a node, where it named nothing or was shadowed, loses no link, so it is
allowed. A loss is refused unless declared. Two cases are refused for that reason:

- Moving a node with two block ids out of a list item, or into one, changes which of the two counts
  (the first inside an item, the last outside), so the counted one would become shadowed. That is
  rare; removing one of the two first (`removeBlockId`) lets the move through.
- A block id that comes to life can push out the one that counts. In `Para ^a`, a blank line,
  `^x`, then a heading directly under `^x`, deleting the heading attaches `^x` to `Para`. Outside an
  item the last counts, so `^x` would count and `^a` would become shadowed. The refusal's detail
  names the block id that would lose its links (`^a would be shadowed by another block id for what
  it names`); a host can remove `^x` first (`removeBlockId`).

**A gain of a name the note already holds is refused**, whatever it names. That keeps the check
independent of how Obsidian resolves a name written twice, which isn't measured (§4.5). The
commands that copy never make such a name: duplicate drops block ids from the copy, and paste keeps
only new ones (§5.4).

Owner and target are both kept because they can differ. Keeping only the owner lets a move silently
change what every link shows. Keeping only the target can't be checked node by node.

**Stray block ids are covered too** (§2.1, §4.4). A stray block id's owner is its own paragraph, and
its link target is whatever Obsidian names: a node, a whole list, or nothing. A command that would
take a stray block id's target away from it is refused, as for any block id. Moving away the quote
of several paragraphs above `^q` is one case. A host can attach the block id first (`removeBlockId`,
then `addBlockId` on the quote, §5.6), and then the node moves with it. A block id whose target goes
while it stays (orphaned) passes only where that target was removed on purpose (`removedNodes`), or
where it names its own node now; else it is a loss like any other.

A **whole list** as a target is kept while the stray paragraph still comes directly after a list
holding at least one of the items it held. So a new first item, a moved first item or a first item
turned into a paragraph keep it. Comparing the list by its first item would refuse all three.

### 4.3 Where a block id is held

A block id has one of two representations, depending on whether it is inside its owner's block.

**In the text, as a frame part.** A block id within the characters of the owner's block becomes a
new `FramePart`, `blockId`:

- at the end of the text: Obsidian's ` ^id`, a Pandoc heading's `{#sec-x}`, a figure's `{#fig-x}`,
  `$$ … $$ {#eq-x}`;
- on the line directly under a paragraph, which Markdown reads as part of the paragraph:
  `Lead.` / `^id1`;
- in an opening fence: ```` ```{#lst-x} ````, `::: {#thm-x}`;
- on a property line inside the node: Logseq's `id::`, Quarto's `#| label:`;
- in a marker: Pandoc's `(@label)`.

The part is the whole attribute set, property line or block-id line. The name is a range inside it,
so the writer keeps what stands beside it.

**Carried by the text, outside its string.** Block-id lines from separate blocks after the owner's
text (§4.4) are not put in the text string: `Prose.`, a blank line, `^p3`; a table, a blank line,
`^t1`; a heading and `^h2` under it. The text object carries them in a field of its own,
`blockIdLines: { blankLines: number; line: string }[]`. It is a list, because a run of block-id
lines (`^y1`, a blank line, `^y2`) is carried whole, and §4.5 says which of them counts. The read
node keeps how many lines they take after its text, blank lines included: `blockIdCount`. They start
right after the text's last line, so no offset is needed (an earlier draft had `blockIdOffset`). A
heading's block-id paragraph is a block of the heading's container, not of the heading's block, so
the heading's `head.lines` can't place it.

**How a text knows its flavor's syntax.** A frame is worked out from the text's characters alone,
with no flavor (callouts and Obsidian's task statuses are read in every flavor). A block id is not:
` ^x` is text in GFM. So `OurusProse` gains `blockIds: 'caret' | null`, set by `readText` from the
tree's flavor (`has('blockIds')`), carried by every method that makes a text from it, and read by
`frameOf`. A text a command builds from nothing has none; the writer's check reads the draft's text in
the document's syntax before comparing (`withBlockIds`), so such a text compares as written.

Keeping these lines out of the string is required. The frame is worked out from the string's
characters, and several rules read its last line:

- a fence's closing line is found only as the text's last line (`atomFrameOf`, `doc/text.ts`);
- a setext underline is found the same way (`frameOf`);
- a heading text of more than one line is read as setext, so `## H` followed by `\n\n^h2` would lose
  its `#`s and become a paragraph (`normalize`).

As a field, they leave `frameOf`, `atomFrameOf`, `body`, `readsAs` and `escapeParagraph` as they
are.

**Two line ranges.** A node's text and a node's own lines are no longer the same lines:

- `textLines()`: the lines of the text string, as before. The text is read from them
  (`readText`, `doc/read.ts`), and the writer writes them.
- `ownLines()`: the text's lines and its carried block-id lines. The node's geometry follows it.

The places in `src/` that use `textLines`, `textFirstLine` or `textLastLine` (65 lines in 16 files,
definitions included) each have to choose one. Roughly:

- **the string's lines** (`textLines`): reading the text (`read.ts`); the writer's reading of a
  node's own lines, its line endings and lazy lines (`writer/draft.ts`, `writer/write.ts`); paste's
  line arithmetic (`commands/paste.ts`);
- **the node's own lines** (`ownLines`, `ownLastLine`): `endLine` and `nodeAtLine` (`doc/node.ts`),
  the `gap` (`doc/outline.ts`), `foldRange` (`doc/view.ts`), `textStart` on a carried line
  (`doc/doc.ts`), the writer's copy of a node's lines and the blank lines after them
  (`copyNode`, `writer/write.ts`; `#readLines` in `writer/draft.ts`).

Most call sites stay on the string's lines; the ones above move. It is the same work a count of
extra lines on the node (`tail`) would have needed (§9).

**One rule for a split, whatever the syntax: a block id goes where the text's closing frame goes**
(§5.2). `split` keeps the closing frame with the upper node, which holds the start of the text, so
mid-text and at the end the block id stays with the node the caret was in, as Logseq keeps it. The
one command that puts the closing frame elsewhere, `quirkEnterMidHeading: workflowy`, takes the
block id along with it: the heading's closing frame and its carried lines both go to the node it
makes. Two mechanisms carry it:

- **A closing frame.** A block id at the end of a text is like an ATX heading's closing `#`s
  (`close`) and a setext underline (`underline`). The writer's `split` already keeps those with the
  upper node, and its `join` already puts the lower node's text before the upper node's closing
  frame (`writer/draft.ts`). The closing frame can be more than one part: `Title ^x` over `===` has
  the block id before the underline, and `## H ^x ##` has it before the closing `#`s, since the
  inline text excludes both. So the closing frame becomes the run of closing parts at the end of the
  text (`closingFrameStart`, with `isClosingPart` for a part that is one). The places that found a single closing
  part learn the run: `split` and `join` (`writer/draft.ts`), `textEnd` (`doc/text.ts`, the caret's
  placement), `locate`, Enter (`enter.ts`) and Shift-Enter (`shift-enter.ts`). The others find a
  heading's `#`s or underline in particular, and are left as they are. `join` kept the lower node's
  own closing frame in the text it appends, so a merge takes the lower node's block id out of it
  explicitly, and then keeps, moves or drops it (§5.3).
- **Carried lines.** `split` keeps `blockIdLines` with the upper node, and `join` with the node
  that stays (or takes the lower node's, §5.3). Logseq's `id::` line, a property after the first line, is in the text string but not
  at its end. A split in the first line would put it in the lower half's string, so a Logseq flavor
  needs the same explicit rule.

**Rebuilt texts.** Many places build a `OurusProse` or an `OurusAtom`. Each must carry `blockIdLines`
along or drop it on purpose, so a text is rebuilt through methods that carry the rest: `splice`,
`concat` (the first text's), `asItem`, `normalize`, `retyped` (another type), `withMarks` (other
placeholders). `slice` can't: a split and a join take pieces of a text and give its lines to one node
explicitly (`withBlockIdLines`), and a slice carrying them would give them to both halves. So a slice
is a **fragment** (`OurusProse.fragment`, and so is what is built on one): it says nothing of the
lines, and the draft refuses it as the text of a node that carries some (`write-failed`, a bug's
reason) until `withBlockIdLines` says what they are. A slice that silently dropped them is so caught
at the call site, not as a loss the check reports after.

**The caret.**

- In the text, `locate` says `frame`, part `blockId` (but at its start, which is the text's end, as
  at a setext underline's).
- On a block-id line, it says a new zone, `blockIdLine`, with the owner, which of its block-id lines
  (the one after, on a blank line, `blank`), and the offset in the line. `locate` calls `offsetOf`
  after `nodeAtLine`, and `offsetOf` throws for a position on no text line (`doc/doc.ts`), so
  `locate` handles this zone before it.
- With the caret in that zone, a command acts at the end of the owner's text (`executeCommand` moves
  the caret there first): Enter makes the new node after the block-id lines. Under `markup: text`,
  the keys that edit text on the block-id line itself (typing, Backspace, Delete, Cmd-Backspace,
  paste) are the host's, as in any markup there; but one that would delete the line break at its
  start or end acts at the text's end too. No command leaves the caret on a block-id line, so the
  draft's `setCaret` needs no form for one (Shift-Enter's blank line before the lines has its own
  anchor, `{ blank, line, carried }`).
- The same for a caret in a block id ending a text, or right after it (`p ^x┃`): a command acts at
  the text's end, before the block id; Backspace there deletes the character before the id.
- Under `markup: decorated`, the caret stays out of both, as it stays out of a checkbox: `textStart`
  on a block-id line gives the end of the owner's text. Under `markup: text`, both are editable, as a
  heading's `#`s are (§4.7).

**A text that is only a block id** (`- ^x`, or a stray `^p3` paragraph) has an empty `body`, so it
counted as an empty node: Enter treated it as an empty item, and Backspace deleted the node with
its block id. So a text whose frame holds a block id is never empty (`OurusProse.empty`). Enter on
`- ^x┃` makes a new item after it, and Backspace at its start merges it, a blank before the block id
(`- a ^x`, §5.3). A heading whose text is only a block id, `## ^h`, reads in ourus as a heading with
an empty body and a `blockId` part. Whether Obsidian registers a block id there isn't measured (§9).

**An emptied text can't carry its block-id lines.** `-` and a blank line end an item, an empty
paragraph is nothing on disk (a placeholder holds it), and the block id after either would name
another block or nothing. So a command that empties a text carrying lines (Cmd-Backspace over all of
`- a`'s text, with `  ^x` under it) is refused as `not-expressible`; a paste over all of such a text
puts the paste in first, then deletes the selection, so the text is never empty between.

Nodes without a text can't carry a block-id line: a quote of several paragraphs under `quotes: text`
or `container`, an item whose first line is a quote. A block-id line after such a node is either
part of its last paragraph's text (directly under, read as a lazy line), with that paragraph its
owner and the quote its target (§4.1), or stray. The rule protects both: a quote of one paragraph
(`quotes: text`) carrying a block-id line, split into two by Enter or Shift-Enter, is refused, since
the line would then name the quote, not its text. TO reads quotes as atoms
(`quotes: atom`), so it isn't affected. Pandoc's divs will need container nodes to have a text
anyway, because their block id is in the opening fence (§9).

**The trial**, done first (§8): the reading, and a move, a split and a merge through the writer,
for:

- a table followed by a blank line and its block-id line;
- a closed fence followed by its block-id line;
- an ATX heading and a setext heading, each with a block-id line under it;
- an item with its block-id line indented under its text, then a nested item (TO's main case, the
  parent attachment inside an item);
- `Lead.`, a blank line, `^id4`, a blank line, a list (list ownership, §4.4);
- a callout with a block-id line directly under it;
- a paragraph ending in ` ^id`;
- an ATX heading whose text is only a block id, `## ^h` (§5.2's Enter under `stay` leaves one).

It checked the frame parts, `blockIdLines`, both line ranges, `locate`, the round trip, an update with
an edit on the line after the block id, and the writer's check (§5). Carrying the block-id lines on
the text took no special case anywhere, so the fallback, keeping them on the node, isn't needed.

### 4.4 Which block-id lines attach to a node

A paragraph that is nothing but a block id attaches to a node next to it when the flavor's rules say
the app names that node. That node is one of two:

- **the sibling before it**: a table, a paragraph, a fence, a rule at the same level (`Intro.`, a
  table, `^t1`). A node a placeholder holds (an empty node, nothing on disk) doesn't count as the
  sibling before;
- **its parent**, when the block-id paragraph is the parent's first child: an item's content
  starting with its indented block-id line. (A heading's `^h2` is the sibling after it in its
  container, before its section is grouped.)

For Obsidian these are §2.1's attachable cases, after TO's `blockIdAttaches` (on TO's `main` and
`wip1`). Whether a block-id line attaches depends on:

- the kind of node before it, and whether it is inside a list item;
- the blank lines between them;
- **outside a list item**, the line after it: a blank line, or the end of its container (the
  parser's container: the document, a quote, an item; a heading's section isn't one). A block id
  directly under a quote may be followed by anything, but that block id is already in the quote's
  text in the parse, like `Lead.` / `^id1`;
- **inside a list item**, only that it is the item's own: right after the item's text. One after
  another block inside the item names the item, not that block, and stays a paragraph (stray);
- the **raw line**: the parser accepts trailing blanks after a block id (`mdBlockIdEnd`, the one
  recognizer the parser's inline rule and the text's frame share; paragraph content drops them),
  while Obsidian registers no block id there. So the flavor's rules read the
  line as written (`^\^[A-Za-z0-9-]+$`). The parser also tags ` ^x` at the end of every table cell;
  ourus reads none in a table (a table is an atom), which is to be measured.

A run of block-id lines attaches whole, and §4.5 decides which of them counts: in `Prose.`, a blank
line, `^y1`, a blank line, `^y2`, both attach and `^y2` counts.

A quote read as an atom (`quotes: atom`) keeps a block id written lazily under it (`> q` / `^q2`)
as its text's last line. That is the quote's block id, and `blockIds()` reads it there.

A block-id line that doesn't attach stays the paragraph node it is. Its `BlockId` says what
Obsidian names by it (`target`) and why that is no node it is written on (`stray`). What to do about
it is the host's (§5.6). A line with text right under it (`^t5` / `More text.`) is one paragraph, and
no block id to Obsidian at all: it isn't in `blockIds()`.

**Where attaching is done.** In the outline's build, `Build.containerOf`, as each container's
children are read; and in the draft's `done()` (`#attachBlockIdLines`, once the blank lines are
fixed), by the same rules, so that a command leaving a paragraph that is only a block id where
reading attaches it writes an outline that reads back. It is not done in `outlineChildren` (`doc/rules.ts`), which the draft's normal
form shares. A node read again keeps its `blockIdCount` where the build takes nodes whole
(`sameBlocks`, `make`). One shortcut can't be trusted with block ids: where a container's block is
the same stored block as before, the build copies its old grouping (`copy`). Blocks are stored by
their shapes, not their text, so `q`, `p`, `^y` and `p`, `^y`, `q` are the same block, and the old
grouping has `p` carrying `^y` where it no longer does. So the copy is skipped where a touched line is
a one-line paragraph of the container, or the line after one (`blockIdsTouched`).

**An attached block-id line is skipped when deciding what a paragraph owns.** Under `listParent:
paragraph`, a paragraph owns the lists right after it. In `Lead.`, a blank line, `^id4`, a blank
line, `- a`, the `^id4` paragraph owned the list before. Once `^id4` attaches to `Lead.`, the list
comes right after `Lead.`'s text, and `Lead.` owns it. That is also what Obsidian names (§2.1:
`^id4` names `Lead.`). So attaching runs before list ownership is decided.

**Updates.** Attaching depends on the line after the block id, so editing that line can change
whether it attaches. An update already reads the line after a node's extent again (`untouched()`,
`doc/outline.ts`), which covers most of this; `blockIdsTouched` the rest. A test compares an update
with a fresh parse over generated documents of block-id lines (§7).

**A block id before its block** (Pandoc's attribute line, a caption above a table) is for the Pandoc
flavor to settle.

- If its parser makes the attribute line part of the block after it, the way a fence's info string
  is part of the fence, the block id is an ordinary frame part of that text.
- Otherwise it is carried like block-id lines, before the text instead of after it.

### 4.5 Duplicates and implicit block ids

- **Several block ids for one target.** Where several block ids name one target, the app uses one
  of them, by the flavor's order: in Obsidian the last outside an item and the first inside one.
  Every other one is marked `shadowed`, and a link to it finds nothing. Only block ids not shadowed
  are indexed. A shadowed block id is still carried by its owner and moves with it. Several block
  ids on one owner are one case of this; others have different owners:
  - `- a`, a blank line, `^l1`, a blank line, `^l2`: both stray, both name the list, and `^l1` is
    shadowed;
  - `- a ^x`, then inside the item a table and a stray `^t` after it: both name the item, the first
    counts, and `^t` is shadowed.

  So `stray` and `shadowed` are independent: `^t` is both.
- **One name on several nodes** (`^x` written twice in a note): not measured. What Obsidian links to
  decides which a link finds, and how notes that already hold such names are read (§9). Until then
  the check compares each by its owner, and refuses a command that writes a name a second time.
- **Implicit block ids** (Pandoc headings without a block id) are to be listed, marked `implicit`,
  but no command writes or keeps them. They change when the host's own typing changes the heading.
  Obsidian has none: `implicit` is always false there.

### 4.6 What a flavor declares

The commands' rules (§5) talk only about owners, frame parts and block-id lines. Each flavor
supplies the rest:

- which frame parts hold a block id, and which block-id lines attach to which blocks;
- where in the text a `blockId` part sits, so that it goes where the closing frame goes: at the end
  (part of the closing frame), in an opening fence or a marker (with the upper node already), or
  after the first line (Logseq's `id::`, kept with the upper node by an explicit rule);
- how a block id's link target follows from where it is (§2.1 for Obsidian; for Logseq and Pandoc,
  the owner);
- whether a command may **make up** a block id: Obsidian yes, six random characters; Logseq yes, a
  UUID; Pandoc never;
- which names are valid (`[A-Za-z0-9-]+` for Obsidian), and where they must be unique: the note
  (Obsidian, Pandoc) or the graph (Logseq);
- for Pandoc only, how a **reference** is written (`@id`, `](#id)`), if its flavor rewrites
  references in the same document after a merge (§2.3). Obsidian doesn't need it: its hosts rewrite
  links through the metadata cache, in every note. A Logseq flavor settles this when it comes.

### 4.7 Config

- **No option to turn block ids off.** In a flavor that has block ids, the outline always reads them
  and the commands always keep them. An earlier draft had `blockIdEditing: 'outline' | 'text'`.
  Nothing needs `text`, the behavior block ids had before, since it is the one that breaks links.
- **The caret in a block id follows `markup`**, as in every other markup: kept out under
  `decorated`, editable under `text`. Hosts differ on block ids in particular: TO draws a block
  marker there, while Obsidian's Live Preview shows ` ^id` as dimmed text. That argues for making
  `markup` a list of the markup kinds the host draws, with `blockIds` as one of them. That change is
  separate from this design, and this design works with either.
- **`joinBlockIds: 'refuse' | 'merge'`** (`src/config.ts`), default `refuse`: §5.3.

## 5. Commands

The writer checks every text it writes: it parses the text and compares it with what the command
meant (`writer/check.ts`, `write-failed`). That check didn't cover block ids. For each node,
`texts()` compared the body and a few named frame properties: a task, a heading's level, a callout;
a fence, its info string and whether it's closed. Since `body` leaves block ids out, a lost or
changed block id would pass. So there are three more checks:

- **Per node**, in `texts()`: each text's block ids by name, and whether in the string or carried
  (`blockIdsOf`). That catches a block id the writer lost or changed, as `write-failed`.
- **For the whole document**, after every command (`executeCommand`, `checkBlockIds`): every block
  id's owner, link target and `shadowed` are compared before and after the command, by node id,
  against what the command declared (§4.2). Anything else is refused as **`block-id`**. The two
  block-id commands, which change block ids on purpose, check their own results instead (§5.6). This part can't be done node by node, because a link target depends on
  the item around the node. It runs only when either snapshot holds a block id, so a note without
  them pays nothing. And it reads only where the command reached (`regionOf`): the lines of its
  changes, widened to the items and quotes around them and a paragraph or atom whose list they are,
  to the end of a list they are in, with the sibling before and the block-id paragraphs on either
  side; one region in both snapshots. A name gained there is looked for elsewhere by the lines of
  text that could hold it. So a command's check costs what the command touched, not the note. A
  test runs it beside the check of the whole note over generated documents and commands, and the two
  must agree. `settlePlaceholders`, which runs outside `executeCommand`, checks its settling the same
  way, and leaves the placeholder where settling would lose one.
- **For a key ourus leaves to the host** (`deferredToHost`): the host's default edit (a code point
  deleted, the selection replaced, a line break, the clipboard's text) is played on the snapshot and
  checked the same way (`hostKeepsBlockIds`). Under `markup: text`, an edit inside one block id's own
  markup is the user's, as a heading's `#`s are, for that block id only. Where the host's edit would
  lose one, ourus does the key itself if its own way keeps them all (a paste with the duplicates
  dropped, typing over a selection across nodes as a deletion and then the text), else it refuses.

With those checks, a command can't break the rule of §4.2 by mistake. It writes the result, or it
refuses. What's left is making the writer write block ids well, so that the check passes, and the
policies below.

### 5.1 Moves, indent, outdent, drag, `moveSubtree`, `pasteAt`

- The writer writes a block id with the node's text: in the string as any frame part, or as
  `blockIdLines` after the text, re-indented as the text is, with their blank lines kept.
- **A blank line after block-id lines, always.** Outside a list item, a node with block-id lines is
  followed by at least one blank line whenever anything follows it in the same container, an empty
  node a placeholder holds included. Without it, Obsidian reads the block id as naming only its own
  line. This is a writer invariant, not a rule of moves. The writer treats a block-id line as a
  paragraph's line when it decides whether two blocks need a blank line between. Two cases it
  covers:
  - a move: a node with a block-id line lands directly above another block. TO measured this one,
    and writes the blank line. Moving the node back leaves the added line behind, with the block it
    passed;
  - Enter at a heading's end (§5.2): `split` leaves the upper node no blank lines, so the new empty
    paragraph would be written directly under `^h2`. The check would pass, since a placeholder's
    line is blank on disk. Once the host typed in it, the file would hold `^h2` / `x`, one paragraph
    and no block id, and no command would have run to refuse it.
- **Into a list item.** A node whose block id would come to name the enclosing item (§4.2) is
  refused as `block-id`. In practice a block moved or indented into an item becomes an item itself
  (`para ^p` indented under `- a` is `- para ^p`; a table moved under an item's child is `- | t |`
  with its `^t`), and its block id still names it, so the refusal rarely comes up.
- **The drag's map** leaves out only the places it can say statically are refused (`unholdable`,
  `moveRefused`, `pasteRefused`, `commands/drag.ts`). A drop the check of block ids refuses is found
  by running it, a refusal like any the writer finds. A static rule in `moveRefused` (no drop into
  an item for a node whose block id would come to name it) is not built: so rare a case doesn't need
  one.
- **`pasteAt`** (a drop from outside the document) brings its block ids in as a paste does (§5.4):
  kept only where new.
- **Allowed**:
  - a paragraph with its block-id line indented under an item, when the paragraph becomes the item:
    `- Some prose.`, a blank line, `  ^p3`. It is the same node, both owner and target, and its
    embed shows nothing more until it has children;
  - moving a paragraph with a block id out of an item (narrowing, §4.2).

### 5.2 Enter, Shift-Enter

- **The block id goes where the text's closing frame goes** (§4.3):
  - mid-text and at the end, `split` keeps the closing frame and `blockIdLines` with the upper node,
    the one the caret was in;
  - at the text's start, Enter mostly isn't a split: `newEmptyNodeAbove` (`commands/enter.ts`) makes
    an empty node above and keeps the node, so its block id stays as it is;
  - `enterAtTextStart: stay` at an ATX heading's text start splits at 0, the text becoming the
    heading's first child paragraph. The heading keeps its closing frame and its section, so it
    keeps its block id. A link to `^h` names the section, and that is still the heading's;
  - `quirkEnterMidHeading: workflowy` gives the text before the caret to the original node, now a
    paragraph, and the heading's `#`s, closing frame and section to the node it makes. The block id
    goes with the heading, declared `moved` (§4.2). That includes carried lines: `split` leaves
    `blockIdLines` with the upper node, so this command moves them to the node it makes
    explicitly.

  Both Logseqs keep a block's uuid with the block the caret was in, mid-text and at the end, and
  with the text at its start (§2.2), and so does Roam, from memory. `- foo ┃bar ^x` gave `- bar ^x`
  before; it gives `- foo ^x` / `- ┃bar`. Bare Obsidian moves the block id with the text after the
  caret, because to it the block id is just text.
- **Enter right after a block id** ending the text, before what else closes it (`Title ^x┃` over
  `===`), acts at the text's end: the block id stays, the new node after. In a text that is only a
  block id (`- ^x┃`) it splits after it.
- **Enter at the end of a node with block-id lines** makes the new node after them, `## H`, `^h2`,
  then the new node, with the blank line between that §5.1's invariant writes.
- **Shift-Enter at the end of the text** keeps ` ^id` at the end of the last line. The new line
  holds the caret, then ` ^id`: `- foo` / `  ┃ ^id`. Typing goes before the space. With the caret
  right after ` ^id`, it acts the same, at the text's end. With block-id lines, Shift-Enter adds a
  line to the text, before them.
- **Body text that becomes a block id.** Enter at `- foo ^x┃ bar` leaves the upper text ending in
  ` ^x`, which reads back as a block id. So does deleting the text after ` ^x`. That is a gain, which
  the check lets through (§4.2). It doesn't escape it (`\^x`), since that would change the user's
  text.
- **In the block id's name, under `markup: text`** (`^┃x`): Enter, Backspace and Delete are the
  host's (`deferredToHost`), as in any markup under `text`.
- **Typing and one-line pastes where the host's insert would lose a block id** are placed by ourus
  (`placedText`): right before a block id with nothing before it (`- ┃^x`, `p ┃^x`, a quote atom's),
  what is typed goes before it with a blank between; on the blank line right after a line ending
  with one, it goes on with the text, the block id at the new line's end, or starts a paragraph of
  its own; at the end of a marker's line whose text starts below it (`-┃⏎  ^ll`), on that line as
  the text's first. Backspace at a block id on a line of its own ending a text (`p⏎┃^x`), or Delete
  before it, joins the two lines, a blank between.

### 5.3 Backspace and Delete merges

A merge puts one node's text into another's, and both may have block ids. The node that stays:

- keeps its own block id: the merged text goes before its closing frame, as the writer's `join`
  already does, and its `blockIdLines` stay;
- **takes the other node's block id** when it has none, declared `moved` (§4.2): `- a` / `- ┃b ^y`
  gives `- a┃b ^y`, so links to `^y` still find the text. Logseq OG does this. A lone carried
  block-id line that comes over becomes a block id at the end of the text: `- a`, then `Prose.`, a
  blank line and `^p3`, merged, give `- aProse. ^p3` (`a` having no block id of its own; where it has
  one, `joinBlockIds` applies as below). Carried under the item instead, it would set a blank line in
  a tight list. A run of carried lines stays carried. The merge adds no space between the texts, as
  before; a block id it takes gets one before it where its text had none (`- a` / `- ┃^x` gives
  `- a┃ ^x`). The block id's owner is now the node that stays, and it names what a block id written
  there names: that node, or the item around it (`- a⏎⏎  p` / `- ┃b ^x` gives `- a⏎⏎  pb ^x`, `^x`
  naming the item `a`). So it is `moved`, not refused as a retarget into an item, and the check
  holds it to naming something where it did.

`join` appends the lower node's text with its own closing frame. So the lower node's block id
is taken out of that text explicitly, and then kept, moved or merged.

When **both** have one, `joinBlockIds` decides:

- `refuse` (the default): a `block-id` refusal. TO refuses a similar merge, of a node into its own
  block-id line (§1);
- `merge`: the node that stays keeps its own block id and the other block id goes, declared
  `merged`. Logseq OG also keeps one and redirects references to the other, but it keeps the lower
  block's (§2.2); ourus keeps the upper one's, since the upper node is the one that stays. ourus
  rewrites no references. The applied result gives `mergedBlockIds: [{ from: 'y', into: 'x' }]`, and
  the host redirects the links to `^y`, in this note and in others. In Obsidian that is the metadata
  cache's job, which finds every link to `#^y` wherever it is.

`refuse` is the default because, without a host redirecting links, `merge` would break them
silently.

A node whose text is only a block id (`- ^x`) is merged, not deleted as an empty node (§4.3).

**A selection across nodes**, typed over or deleted, is a merge of its first and last nodes, with
the nodes wholly inside it removed:

- the first node keeps its block id, even where the selection covers its ` ^x`: the node stays, and
  covering the end of its text is not choosing its block id. This differs on purpose from a
  selection inside one node under `markup: text`, where the user edits markup they can see and the
  keys are the host's (§5.2);
- the last node's block id follows the rules above, so where both have one, `joinBlockIds` decides,
  and by default the edit is refused;
- block ids of the nodes wholly inside go with them.

It never gives `- a ^x┃b ^y`. Typing over such a selection, which ourus leaves to the host, is done
by ourus where the host's edit would lose the first node's block id: the deletion, then the text at
the caret it leaves (`- a┃b ^x⏎- c┃d` with `Z` gives `- aZ┃d ^x`). A subtree selection, whose nodes
go whole, and the whole document typed over are no merge: their block ids go.

### 5.4 Copies: `duplicateSubtree`, `paste`, `pastePlain`

- **`duplicateSubtree` drops every block id from the copy** (`withoutBlockIds`). The copy is a new
  block, and a block id names one block. A copy of a paragraph that is only a block id, with nothing
  under it, isn't made; the caret in it stays in the original. A duplicated Quarto cell would
  otherwise fail to render, because knitr refuses two chunks with one label.
- **Paste keeps a block id only where it is new**, read where it lands (`pasteKeepingNewBlockIds`,
  around `paste` and `pastePlain`): a `^x` is a block id only where it ends a text, so one pasted
  mid-text, into code or glued to a word is text and stays. The block ids the paste wrote are taken
  in document order. One is kept if its name is neither in the document nor among the pasted block
  ids already kept, else it is dropped, with whatever the paste declared of it. "In the document"
  means outside what the paste replaces, so a paste over a selection that held the block id keeps
  it. To tell the block ids the paste wrote from the note's, the paste runs with their names marked
  (§8); a paste whose open seam would join two nodes that both have one, one of them a duplicate, runs
  again with the duplicates dropped from the clipboard first. A drop (`pasteAt`, the drag) drops
  them from the clipboard's fragment read alone (`pastedBlockIds`).
  - A cut then a paste is a move. It keeps the block id, because the cut took it out of the
    document.
  - A copy then a paste in the same note drops it.
  - A paste from another note keeps it, unless it collides.
  - Two copies of one block pasted together keep the block id on the first.

  This holds where block ids are unique per note (Obsidian, Pandoc). Where they are unique across a
  graph (Logseq), ourus can't see the rest of the graph. So the host is to pass a predicate,
  `blockIdInUse(name)`, and a block id it says is in use is dropped. A host that knows the paste
  follows its own cut says the block id is free. Without the predicate, a Logseq flavor drops every
  pasted block id. That comes with a Logseq flavor; it isn't built.

  Both Logseqs drop the block id on a copy, and OG keeps it on a cut and paste (§2.2). There is no
  option to keep colliding block ids: what Obsidian does with one name on two blocks isn't measured
  (§4.5).
- **References inside the copy are left as they are.** A copied `[[#^x]]` or `@fig-x` whose own
  block id was dropped from the copy still names the original block. A copy of a reference still
  references the same thing, as Logseq's copy does. A later option could instead give the copies
  new block ids and rewrite the copied fragment's own references to them.
  `duplicateSubtree` behaves the same way.
- **Dropping a block id takes only the block id.** From an attribute set it takes `#id` and keeps
  the rest: `{#fig-x .wide}` becomes `{.wide}`, and `{#x}` goes whole. A property line (`id::`,
  `#| label:`) or a block-id line goes whole.
- **`copy` and `cut` put the Markdown on the clipboard as written, block ids included.** Another
  note may want them. A cut of text within one node takes a block id the selection covers with it.
- **A paste of lines split at a blank line** gives a block id ending the text to the last of them
  where its `^` came with the paste (`split`'s `closing: lower`), not to the node the caret was in.

### 5.5 `deleteSubtree`, `cut`

The block id goes with its node, so nothing about block ids changes in the text.

- The name is gone from `blockIds()` after either. A host that acts on a removal at once, the way
  Logseq OG replaces references with the deleted text, holds off after a `cut` (it knows the command
  it ran) until it knows whether a paste follows: otherwise it destroys the references before a
  paste brings the block id back.
- The result says which nodes went (`removedNodes`), and only their block ids may go with them.
- A stray block id whose target goes with them, while its own line stays, is orphaned, and allowed.

ourus leaves references alone, in this document and others. Whether any exist is the host's to
find, in its own index of links (Obsidian's metadata cache). The host can then warn, or replace each
reference with the deleted text.

### 5.6 New commands

Two edits of block ids, each read back and checked: the block id it writes or removes is what the
snapshot after it reads, and nothing else changed.

- **`addBlockId`** `{ name?, node? }`: writes a block id for `node` (by id), or the selection's
  node; with `node`, the caret goes after it. A host's "Copy link to block" looks in `blockIds()` first, for one not shadowed whose
  `target` is the node, and runs `addBlockId` only where there is none. Making the link text
  (`[[Note#^id]]`) is the host's.
  - **A block inside a list item can't be named alone** (§2.1): wherever a block id is written
    inside an item, Obsidian takes it to name the item. So for a block inside an item, `addBlockId`
    writes on the item. The block id's `target` says so.
  - **Where a block id already names the node, it refuses** (`block-id`). That goes by link target,
    not owner. Obsidian counts one block id per node (§4.5), so a second one shadows one of the two
    and breaks its links. In `- a`, a blank line, `  inner prose ^x8`, `^x8` is the paragraph's
    but names `a`. Writing ` ^new` on `a` would make `^new` the one Obsidian counts (inside an item,
    the first), and every link to `^x8` would find nothing. A host that read a stale snapshot gets
    the refusal and reads again.
  - **What it writes.** It uses the flavor's usual form:
    - Obsidian: ` ^id` at the end of a text; a block-id line after a table, a fence or a quote atom;
      a line directly under the last line of a quote of several paragraphs or a callout, which is
      then its last paragraph's text (§4.1);
    - Logseq: an `id::` line.
  - **On a heading.** Obsidian links a heading by `#Heading`, though `^id` on a heading works too.
    Which link to make is the host's choice: it runs `addBlockId` on a heading only when it wants a
    block id there.
  - **The name.** It is the host's (`{ name }`) where it gives one, valid in the flavor (§4.6). A
    name the document already has is refused. Otherwise the flavor makes one up, unique where it
    must be. A flavor that never makes up names (Pandoc) refuses without one.
  - It is "add", not "set": it never replaces a block id, since replacing one breaks every link to
    it. Renaming a block id is not in this design.
- **`removeBlockId`** `{ name?, node? }`: deletes block id `name`, attached or stray; where the
  note has the name twice, the one node `node` owns (refused without it). Under `markup: decorated`
  the caret stays out of block ids, so without this command a user couldn't delete one; a host
  offers it from its block marker, for example. It takes only the
  block id, as a copy's drop does (§5.4), and the blank lines it leaves doubled go with it.
  - **Without `name`**, it acts at the selection, as `addBlockId` does, and undoes it: it removes the
    block id a link to the selection's node uses (for a block inside an item, the item's). Where none
    names that node, it refuses (`block-id`).
  - **With `name`**, it removes that one: a shadowed or stray one, or one elsewhere. A name and a
    node id stay good across snapshots, as a position doesn't.

**Correcting a stray block id is the host's.** ourus says what Obsidian names by it (`target`) and
why that is no node it is written on (`stray`); which corrections to offer, and in what order, is a
host's menu. Each is made of the two commands or of an edit of the host's own:

- attaching it to a node: `removeBlockId` of it, then `addBlockId` with its name on the node;
- trimming its trailing blanks, or setting it off from the block under it: an edit of one line;
- removing it: `removeBlockId`.

obsidian-true-outliner's menu (`src/block-ids.ts`) is one: the item a block id inside one names, the
paragraph a list is written under and the list's last item for one after a list, none of them a node
that already owns a block id.

## 6. The API

On `OurusDoc`:

- `blockIds(): readonly BlockId[]`: every block id in the document, in order, stray ones included;
  read on the first call, once per snapshot (`doc/block-ids.ts`). A line that only looks like one
  (`^t5` with text joined under it) isn't one.
- A link to `node` uses the block id in `blockIds()` that isn't shadowed and whose `target` is
  `node` (for a block inside an item, the item), whoever owns it: `^x8` for the item in `- a`, a
  blank line, `  inner prose ^x8`. Following a link by name is the same lookup, the other way. Both
  are a host's few lines over `blockIds()`, not methods of their own.

```ts
interface BlockId {
  readonly name: string;                     // without `^`, `#`, `id::`
  readonly from: number; readonly to: number; // document offsets of the block id as written, `^` through the name
  readonly partFrom: number; readonly partTo: number; // document offsets of all of it: ` ^id`, `{#x .y}`; a line, from the end of the line before
  readonly ownLine: boolean;                 // on a line of its own: carried, a paragraph of its own, or `Lead.` / `^id1`
  readonly carried: boolean;                 // carried by its owner's text, outside its string (`blockIdLines`)
  readonly syntax: 'caret';                  // the flavor's: Obsidian's `caret` (later 'attributes', 'property', ...)
  readonly owner: OurusNode;               // the node it's written on (§4.1)
  readonly target: OurusNode | { readonly list: OurusNode } | null; // what the app names; a list by its first item
  readonly shadowed: boolean;                // another block id for the same target is the one the app uses (§4.5)
  readonly implicit: false;                  // derived from a heading's text, not written (§4.5): none in Obsidian
  // why what it names is no node it is written on (§2.1), null where it is: after a list, Obsidian
  // names the list; after a block inside an item, or on a line under one, the item; after a quote of
  // several blocks, which carries no line, the quote; else nothing (`target` null): nothing above
  // it, a block right under it, blanks after it
  readonly stray: 'whole-list' | 'item' | 'quote' | 'nothing-above' | 'block-below' | 'trailing-space' | null;
}
```

A stray block id is a `BlockId` like any other, so there is no separate list of them: they are the
ones in `blockIds()` whose `stray` isn't null. With trailing blanks a block-id line is no block id
to Obsidian (`trailing-space`, `target` null); ourus's parser reads one, so it is listed, for a
host to mark. What a host offers to fix one is its own (§5.6).

Changes to what's there:

- `PersistentNode` gains `blockIdCount`, and `ownLines()` beside `textLines()`;
  `OurusNode` gains `ownLastLine` (§4.3).
- `OurusProse` gains `blockIds` (the flavor's syntax) and `blockIdLines`, with `withBlockIds` and
  `withBlockIdLines`; `OurusAtom` gains `blockIdLines` (§4.3). A `blockId` part is added to the frame,
  and the closing frame becomes a run (`closingFrameStart`). `blockIdsOf(text)` and `withoutBlockIds(text)`
  read and drop a text's block ids.
- `locate`: `frame` with part `blockId` for a block id in the text; a new zone, `blockIdLine`, for a
  block-id line and its blank lines.
- `nodeAtLine` on a block-id line gives the owner. `textStart` there gives, under `decorated`, the
  end of the owner's text, where Home and a click on the line go; under `text`, the line's start
  past its indentation. `foldRange` of a heading starts after its block-id lines.
- `RejectReason` gains `block-id`; the draft's `Refusal` too (a merge of two nodes with block ids).
- The draft gains `movedBlockIds(names, to)`, for a command that moves block ids on purpose, and
  `joinBlockIds(upper, upperText, lower, lowerText)`, for a command's own join of two texts, which
  takes block ids as `join` does; `split` takes `closing: 'upper' | 'lower'`.
- `OurusProse.fragment` (a slice and what is built on one, §4.3), `retyped`, `withMarks`;
  `OurusAtom.normalize`.
- The parser exports `mdBlockIdEnd` and `MD_BLOCK_ID_NAME`, the one reading of a block id ending a
  text, which the parser's inline rule and the text's frame both use.
- **What a command did on purpose is in its result**: `movedBlockIds: [{ name, to }]`,
  `mergedBlockIds: [{ from, into }]` (`joinBlockIds: 'merge'`, §5.3) and `removedNodes: number[]`
  (the nodes it removed, each with its subtree). The check after the command verifies them as
  claims; every command, a composite one too, passes every step's along (`blockIdsDeclaredBy`).
  Everything else follows from the two snapshots: a host that keeps links right diffs `blockIds()`
  before and after, by name and owner, and it knows which command it ran (a `cut`). Undo and redo
  restore a snapshot (`OurusDoc.replace` with `like`), so the diff serves them the same way; after an
  undo of a merge the host reverses its redirect. An earlier draft gave a `blockIdChanges` report of
  every kind (removed, cut, moved, merged, added, fixed, orphaned, narrowed); the diff and the
  declarations cover it.
- Config gains `joinBlockIds` (§4.7).
- Commands gain `addBlockId` and `removeBlockId` (§5.6).
- With a Logseq flavor, `paste` and `pasteAt` are to take an optional `blockIdInUse(name)` from the
  host, for block ids unique across a graph (§5.4). Not built.

## 7. The spec and the tests

Built:

- **`spec/block-ids.md`** (linked from `spec/README.md`), 21 cases, and in `spec/regressions.md` the
  writer bugs found on the way (Regression190 to 198, each failing on the code before): the trial's shapes through moves
  (a table, a fence, an item, a heading, a paragraph owning a list); the blank line after block-id
  lines; Enter mid-text, at a heading's end, mid-heading, before a setext underline, after a text
  that is only a block id, and with the caret on a block-id line; Shift-Enter after a block id;
  merges taking the other's, refused where both have one, keeping the node that stays's lines, and a
  lone carried line taken as ` ^id`; Backspace into a text that is only a block id; typing over a
  selection across nodes; duplicate dropping block ids; a cut taking one the selection covers. The
  two `TO-BlockId` cases stay where they are.
- **Reading** (`test/doc/`): `block-ids.test.ts` (each shape's frame parts, `blockIdLines` and own
  lines, list ownership, runs, stray shapes, GFM reading none, `blockIdsOf`, `locate` and
  `nodeAtLine` on a block-id line, an update making one attach and come loose);
  `block-id-shapes.test.ts` (TO's 51 measured shapes from its `tests/block-id-shapes.ts`, each block
  id's owner, target, `shadowed` and `stray`, under TO's settings); and in `outline.test.ts`, an
  update compared with a fresh parse over generated documents of block-id lines.
- **Commands** (`test/commands/block-ids.test.ts`): `addBlockId` in each form and its refusals;
  `removeBlockId` by name, by node, at the selection; attaching a stray one by the two; the check's
  refusals (a duplicated name, a merge of two, a move out of an item narrowing) and its holding a
  command to its declarations; `joinBlockIds: 'merge'` and its `mergedBlockIds`; paste keeping only
  new ones, read where they land; duplicate dropping them; the caret on a block-id line, in a block
  id and after it; the host's edit after a deferral; a case for each fix of §8. And three properties
  over generated documents of block-id lines, at a fixed seed (`OURUS_FUZZ_SEED` plays others):
  - the check where an edit reached agrees with the check of the whole document, for any text edit
    (not only a command's, which would leave its blind spots untested);
  - twelve commands, each applied one keeping every block id, read either way, and none failing to
    write where the same text with its `^`s made plain text writes;
  - a second check independent of `checkBlockIds`: sequences of commands and pastes (plain and
    Markdown, names the documents hold and new ones), the host typing where each leaves the caret,
    and settling, in six configs, by names (none lost but as merged or removed) and by links (every
    name a link found something by still does).
- **The writer** (`test/writer/draft.test.ts`): the writer bugs block ids led to (§8).
- **TO**: its 15 expected failures are the acceptance test. TO reads block ids through ourus alone
  (`blockIds()`, its own rules gone) and builds its menu of corrections on `addBlockId` and
  `removeBlockId`; its 891 tests pass and it typechecks. One expectation changed
  (`tests/block-ids.test.ts`, attaching `^x1` from `- a⏎  - child⏎⏎  ^x1⏎- b`): the blank line above
  the stray id stays, as §5.6 says (only the blank lines a removal would leave doubled go), the list
  loose as it was.
- **SxS** on `block-ids.md` and `paste.md`, every app, then a rejudge of the whole spec and a
  comparison with the judgments committed in `.sxs`: no verdict moved on any case an app had, none
  got worse; the 21 block-id cases are new (most apps disagree, reading `^id` as text). Rejudged
  after every later round: ourus replays all 57 cases of the two files.
- **The heavy suites** (`node test/heavy.ts`: view, inverse, the writer's differential): pass, no
  run failing to write.

Not yet:

- spec cases for what unit tests cover alone (`merge`, paste, `addBlockId`, `removeBlockId`,
  `enterAtTextStart: stay` and `workflowy`'s split, narrowing), and for block ids coming to life and
  the refused move of a node with two block ids out of an item;
- **SxS in Obsidian.** The Obsidian driver reads `CachedMetadata.blocks` before and after every
  case, and checks that each block id still names a block starting with the same text. That checks
  §4.2's rule in the real app, over the whole spec. It also measures what bare Obsidian and the
  community Outliner do to block ids.
- **SxS in Logseq.** `uuid-probe.ts` becomes a check of the Logseq drivers, for when a Logseq flavor
  exists.
- **Pandoc.** `pandoc -t json` gives each block id's block, as `CachedMetadata.blocks` does for
  Obsidian. It serves as the reference when the flavor comes.

## 8. Implementation log

Built for Obsidian (2026-10-30), on `main`, from this doc. Carrying the block-id lines on the text
(§4.3) works, so the fallback of keeping them on the node isn't needed. Reading, the writer's check
and writing landed together (without the writing, the check would refuse Enter in any node with a
block id, `split` taking ` ^id` to the new node); then the text commands, duplicate and paste; then
`addBlockId`, `removeBlockId` and `stray`. Several rounds of review and fuzzing followed; what they
changed is folded in below, by topic.

### Where it is

- **Reading** (`doc/text.ts`, `doc/outline.ts`, `doc/read.ts`, `doc/node.ts`, `doc/locate.ts`):
  - the `blockId` frame part, the blanks or the line break before the `^` included, so dropping it
    leaves no trailing blank; the closing frame as a run (`closingFrameStart`, `isClosingPart`,
    `textEnd`);
  - `blockIdLines` on both kinds of text, `OurusProse.blockIds` (a text needs its flavor's syntax);
    `blockIdCount`, `ownLines()`, `ownLastLine`; `nodeAtLine`, `locate`'s `blockIdLine` zone,
    `textStart`, `foldRange` (a heading's block-id lines show, as its text does);
  - attaching a block-id paragraph in `Build.containerOf`, before list ownership. The `copy`
    shortcut is skipped where it can't be trusted (`blockIdsTouched`): blocks are stored by shape,
    and what a one-line paragraph says, and the line after it, aren't theirs;
  - a block-id line followed by a line that opens a container (`>` with nothing after it) has a block
    under it, though `MdLine.empty` says the line is empty; a stray run is followed only from the
    block right before; a paragraph's block-id line right under it is a line of its text
    (`OurusProse.normalize`), and a quote atom's right under a quote that ends in a paragraph its lazy
    last line (`OurusAtom.normalize`).
- **One recognizer**: `mdBlockIdEnd` and `MD_BLOCK_ID_NAME` (`parser/obsidian.ts`), used by the
  parser's inline rule and by the text's frame: `^name` at the start or after a space, a tab or a
  line break, blanks after it. (The parser had taken any Unicode blank, the frame ASCII ones, so a
  no-break space before `^` hid the id in HTML while ourus read none.)
- **`blockIds()`** (`doc/block-ids.ts`): owner, target (`blockIdTargetOf`), `shadowed` per target,
  `stray`. A quote atom has a block id ending each paragraph in it, one not at its end naming
  nothing, and none in its code.
- **Writing** (`writer/draft.ts`, `writer/write.ts`):
  - carried lines copied with their node (its own lines) and spelled after a text the draft set;
  - `split` keeps them and the closing run with the upper node; `join` takes the lower node's (a
    lone carried line as ` ^id`, a blank before it where it follows text; `glued` read off the
    frame), or refuses, or merges (`joinBlockIds`); `OurusDraft.joinBlockIds` for a command's own
    join (a quote read as an atom joining the text above it, or a text joining it);
  - the blank line after block-id lines outside an item (`#raise`, `#setTrailingGap`);
  - `done()` attaches a paragraph that is only a block id where reading would (`#attachBlockIdLines`,
    after `#gaps`, which decide it), so the draft's outline and the text agree. Then the check judges
    it: allowed where it named nothing (it comes to life), refused where it would shadow or rename;
  - an empty text carries no block-id lines: emptying one that carries some is refused
    (`#emptiedCarriers`); an empty paragraph a placeholder holds, or an empty item, carries none in
    reading or in the draft (§4.4). A block inside an item, after its text, can't carry them
    (reading has the line a paragraph of its own), nor can a paragraph that is only a block id;
  - Shift-Enter's empty last line on a text that carries lines is the first of the blank lines
    before them, the caret on it (`{ blank, line, carried }`): typing there goes on with the text.
- **Commands** (`commands/`): Enter and Shift-Enter in and after a block id; workflowy's split
  declaring its move; merges and a selection across nodes keeping each node's; duplicate dropping
  them (a node that is only one not copied, or an empty node of its kind where something under it
  is); paste keeping only new ones; a caret on a block-id line; `addBlockId` and `removeBlockId`
  (`commands/block-ids.ts`), both drafts, so the writer's escapes, blank lines and read-back cover
  them, each checking its own result (`removeBlockId` with the one it removed as the text it took).
  The caret stays where it was; with `node`, `addBlockId` puts it after the block id; in a marker or
  a container's prefix on the node's line, both put it at the text's start.
- **Docs**: `src/doc/README.md`, `src/writer/README.md`, `src/commands/README.md`; `spec/block-ids.md`.

### How the rule is kept

Every edit that can lose a block id goes through one check, so a mistake anywhere is a refusal, not
a loss. The recurring losses the reviews found had a few causes, each now closed in one place.

- **The check** (`checkBlockIds(before, after, changes, { declared, taken, removed, edited }, whole?)`,
  run by `executeCommand` on every applied result, and by `settlePlaceholders`, which refuses a
  settling that loses one). It reads where the changes reached (`checkedRegion`, `regionOf`), and
  further down, to where the outline after is the stored nodes it was before (a fence opened or
  closed reads the lines below it anew). The property tests hold it to the whole-document reading.
  - **Declarations are claims.** A command's moves and merges travel with its result
    (`movedBlockIds`, `mergedBlockIds`; the draft's `Applied.blockIds`; `blockIdsDeclaredBy` gathers
    every step's in a command made of steps). A declared move must leave the block id naming
    something where it did: what a block id written on the node it moved to names, that node or the
    item around it. A declared merge must go into a block id that is written, unshadowed, and names
    something where the merged one did.
  - **Removals are named.** A block id may go with its node only where the command says it removed
    that node (`removedNodes`: `deleteSubtree`, and so a cut of nodes and a deletion key over a
    subtree selection). A block id whose node went while the same name appears on another node, no
    command declaring it, is a move, refused.
  - **What a selection takes.** One written wholly inside the text a command took (typed over, cut,
    deleted) may go; but across nodes the first node stays, and keeps its block id even where the
    selection covers it (§5.3), so its own lines aren't in what was taken. A subtree selection, whose
    nodes go whole, and the whole document replaced as text take all of it. A command made of steps
    gives every step's declarations, its removed nodes too (`blockIdsDeclaredBy`: a paste over a
    subtree is its deletion, then the paste).
  - **Orphans.** A block id whose target went may stay naming nothing only where that target was
    removed on purpose, or where it names its own node now.
- **Deferrals are checked.** Where ourus leaves a key to the host, the host's default edit (a code
  point deleted, the selection replaced, a line break, the clipboard's text) is played and checked
  (`hostKeepsBlockIds`). Under `markup: text`, an edit inside one block id's own markup is the
  user's, as a heading's `#`s are, for that block id only. Where the host's edit would lose one,
  ourus does the key itself if its own way keeps them all: a paste with the duplicates dropped,
  typing over a selection across nodes as a deletion then the text. Else it refuses (`block-id`).
- **Carried lines can't be dropped unsaid.** Every rebuild of a text carries them (`retyped`,
  `withMarks`, `splice`, `asItem`). A piece of a text (`slice`, and what is built on one) is a
  `fragment`: set as the text of a node that carries lines, the draft refuses it (`write-failed`)
  unless the command says what they are (`withBlockIdLines`). A sweep of every command at every
  caret over texts carrying lines in each form found two such sites, both fixed: workflowy's Enter
  mid-heading (the lines the heading's, explicitly), and a quote of one paragraph split into two
  (`quotes: text`), now refused as `block-id`, since a quote of several carries none (§4.3).
- **Carets that a next keystroke would turn into a loss.** Typing, and a one-line paste, right before
  a block id with nothing before it (`- ┃^x`, `p ┃^x`, a quote atom's) put a blank after what they
  insert (`placedText`); on the line Shift-Enter makes before a text's block-id lines they go on with
  the text. A caret in a block id ending a text, or right after it, acts at the text's end, and so
  does a key on a block-id line; Backspace there deletes the character before the id (the blank
  before it too, where nothing is left). Backspace at a block id on a line of its own (`p⏎┃^x`), or
  Delete before it, joins the two lines, a blank between. Commands leave the caret before a text's
  closing frame, not at its length (`headingOffset`, `keepCaret`, `joinQuoteUp`).
- **Paste reads block ids where they land** (`pasteKeepingNewBlockIds`, around `paste` and
  `pastePlain`, over a subtree selection too). The paste runs with every `^name` it brings marked
  (a suffix after the name), so the result says which block ids it wrote, whatever its changes look
  like; of those, one whose name the note holds outside the selection, or the paste wrote before it,
  goes, and the marks come out. It runs twice, with two suffixes of one length, and a mark is where
  the two results differ: the same characters can form across the seam (`before-pas` and a pasted
  `ted`), so a search for the suffix would delete text. A `^x` that ends no text where it landed
  (mid-text, in code, glued to a word) is text and stays; a cut then a paste over where it was is a
  move. Where the marked paste is refused for a join of two nodes that both have a block id, one of
  them pasted (`pasteSeams: open`), it runs again with the clipboard's colliding ones dropped first,
  read alone (`pastedBlockIds`, which `pasteAt` and the drag use too). HTML's character references
  for `^` and a name's characters are decoded before marking (`withBlockIdCharacters`: none is markup,
  so the page is the same), or `&#94;x` would pass unmarked and be refused as a second `^x`. What the
  paste declared of a pasted block id it drops (moved, merged, into or from) goes too: under the
  original's name it would claim the note's own block id moved, and the check would excuse its loss.
  One the paste merged into another at the seam above is the first of its name, so a later pasted
  one of that name goes. The deferral check plays a paste into a note with no block ids too, where
  the clipboard brings some. Plain lines split at a blank
  line give a block id ending the text to the last of them where its `^` came with the paste (the
  split's `closing: lower`), not to the node the caret was in. (Reading the clipboard alone dropped
  literal text; telling the paste's block ids from the note's by where the shortest edit put them
  dropped the note's own.)
- **Tests** (`test/commands/block-ids.test.ts`, `test/doc/block-ids.test.ts`): cases for every fix;
  property tests that a command keeps every block id, read regionally and whole; and a second,
  independent of `checkBlockIds`: sequences of commands and pastes, the host typing where each leaves
  the caret, and settling, in six configs, by names (none lost but as merged or removed) and by links
  (every name a link found something by still does).

### Writer bugs fixed on the way

Each also without block ids, each with a test (`test/writer/draft.test.ts`, or a case in
`spec/regressions.md`):

- a copy of an item whose first child is on its line (`- - x`) lost its outer marker where the copy's
  children changed, and threw where its list renumbered it (the new marker now written over the old
  one, as wide);
- a copy lined up at another column, or in another container, lost a lazy line's laziness: a copy is
  written as its original only in its original's container, after an item of its list at its column,
  its parent copy still having its original's children;
- an atom moved under a list item kept its indentation (`  ---`, `  | a |`), which put it in the item:
  written without it there (`#keepsOut`), HTML's first line only (a `<pre>`'s spaces are its content);
- a table whose header is a lazy line, first in a quote now, is spelled inside it (`#keepsIn`), and a
  paragraph's lazy line under a heading made above it too, by its container, not its old parent
  (Regression198);
- code past a tab its item takes part of: the writer writes such a line's blanks as the tab again, and
  reading turns every tab in them into the spaces it spans; done() puts the text so first;
- a renumbered item whose first block is a quote on its marker's line wasn't named where its `>` is
  written (`headInPrefix`, `nameDescendants`: Regression190, 196), and moved where its number
  changes, threw (its marker written over the old one where the shifted line has it);
- a marker written over a line at the end (`leads`) moved the indices `copyPieces` keeps;
- the caret's blank line, last of a node's gap, written with a quote's `>` where a node follows
  (Regression191); a quote's last child with children, moved or copied, wrote its trailing blank
  lines inside the quote (`Shift.trailing`, `endsAsWas`: Regression195);
- in a loose list, a blank line set after an original ending in a fence nothing closes
  (Regression192), and Enter at the end of such a folded item (`#scopeEnds`, `#setTrailingGap`:
  Regression194);
- typing at `1.┃⏎   b` made the line no item (Regression193); paste of a line over a selection in
  one text kept the blank after a first word (`[p] q`: the paste first, then the selection deleted,
  Regression197).

### Left

- Writer bugs, without block ids, failing the same on the code before them, not yet fixed; found by
  the command fuzz (seeds 9 and 15) and by a sweep of every command at every caret: `indent` over `2) long text⏎         2) x⏎   - [x] ⏎   - a⏎para⏎> - q…` (gfm, 23–56),
  `indent` over a tab-indented mixed list (obsidian, 34–81, a tab respelled as spaces), and
  `deleteSoftLineBackward` at 20 in `  * ⏎- [ ] long text⏎      - a⏎    - x⏎  - [ ] b c`: each
  `write-failed`; and Shift-Enter over a selection from a callout's body into its blank line
  (`> [!note] T⏎> body⏎⏎p`, 11–14: "1 blank lines after its text, read as 0").
- Backspace, Delete or typing over a selection across nodes ending at a line's start
  (`- a┃b ^x⏎┃- c`) is the host's (ourus doesn't do it yet), so with a block id there it is refused.
- As they are: a placeholder's empty node reads otherwise until it is settled, which settling
  checks; `removeBlockId` losing its block id; a stray block id's node removed, the id left naming
  nothing; a paste with the caret in a marker (`-┃ x`) that would write a name twice is refused;
  plain paste by Enter in a quote read as text, the caret past a split before its block id, refused;
  `> ┃a┃ ^x` with `q⏎r` in a container quote (enter mode) refused, where it lost the line break before.
- The spec cases of §7's "not yet"; the drag's static rule (§5.1).
- SxS checks in Obsidian (§7), and the comparison with bare Obsidian, measuring first what §9 leaves
  unmeasured: one name on two blocks, table cells, what "Copy link to block" writes.
- The Pandoc/Quarto flavor: attribute sets, block ids before their blocks, texts for containers,
  implicit block ids, and whether the flavor rewrites references inside the document after a merge,
  since Pandoc hosts have no index of links to do it; later a Logseq flavor: property lines and their
  split rule, `blockIdInUse`, and `collapsed::` as folds kept in the text.
- `- ^x⏎  ===` (a setext title that is only a block id) duplicated gives `-⏎  ===`: dropping the
  block id leaves an item whose text below its marker is `===`.

## 9. Decided, and open

Decided here, each still open to argument:

- **The rule keeps both owner and link target** (§4.2), by node id. The only exceptions are the
  changes a command declares, and gains. The checks enforce it per node and, where the command
  reached, for the whole document (§5).
- **A block id in its block's own text is a frame part. Block-id lines from other blocks are carried
  by the text, outside its string, and `ownLines()` covers them.** The alternatives:
  - **Putting the lines in the text string** (a closing frame part, as ` ^id` is) was rejected: frame
    detection reads the string's last line, and the text is read from `textLines()` (§4.3). It would
    have saved the carrying in `slice`, `concat`, `split` and `join` and the `blockIdLine` zone, but
    put blank lines inside a text's string, which the writer's gaps, placeholders, splits and
    read-back assume never happens, and made every routine that parses an atom's string (a fence's
    runs, a quote atom's re-parse) stop before the tail. About even in cost, with new invariants
    broken; the carrying's risk is closed instead by the fragment (§4.3).
  - **Keeping them as nodes of their own** (the paragraph each is) would leave the outline and the
    writer as they were, and make every structural command move them with their block, which is
    where the losses this design set out to stop came from.
  - **Keeping them on the node** (a count of extra lines, `tail`, and the lines themselves) needs
    the same two line ranges and the same classification of every call site. On that the two
    designs cost the same. They differ in where the lines travel. On the text, drafts, `split` and
    `join` carry them with the text they already carry. On the node, each of those would need its
    own code to carry them.

  So carrying them on the text is chosen, by a smaller margin than an earlier draft claimed. The
  trial bore it out (§8).
- Stray block ids are left as the paragraphs they are. Holding them would mean a range of lines per
  node after its children, which TO considered and declined, because every piece of code that walks
  lines would have to learn it.
- A block id goes where the text's closing frame goes: with the node the caret was in, as Logseq
  and Roam keep it, and with the heading under `workflowy` and `enterAtTextStart: stay`.
- Only losses need declaring: a block id that comes to life is allowed, except one whose name the
  note already holds, which is refused.
- A host diffs `blockIds()` for what a command did; the result gives what it did on purpose (moved,
  merged, the nodes it removed), which the check holds it to.
- ourus reads stray block ids (`target`, `stray`) and writes and removes block ids (`addBlockId`,
  `removeBlockId`); a host's menu of corrections is its own (§5.6).
- Shadowing is per target: where several block ids name one target, the flavor's order picks the
  one that counts, whichever nodes own them (§4.5).
- Stray block ids are protected by their link target, as every block id is. A whole list is kept as
  a target while the stray paragraph still follows a list holding one of the same items.
- A merge takes the other node's block id when it has none, declared `moved`, and refuses by default
  when both have one.
- Paste keeps a block id only where it is new, references in a copy keep naming the originals, and
  ourus never makes up a Pandoc block id.
- There is no option to turn block ids off, and the caret in a block id follows `markup` (§4.7).

Open:

- **Enter's split, against bare Obsidian.** The SxS run (§7) will show how far this departs from
  what Obsidian users are used to. An option (`enterBlockId: 'stay' | 'text'`) is cheap if needed.
- **The default for `joinBlockIds`.** `refuse` is safe, but stops a key. `merge` is safe only with a
  host rewriting links. ourus can't know which block ids are linked to. A host that knows might pass
  a predicate, so that ourus refuses only when both block ids are in use.
- **Narrowing** (§4.2): allowed. If hosts find it surprising, it can refuse as the other retargets
  do.
- **`markup` as a list of kinds** (§4.7), with `blockIds` one of them: a change of its own.
- **Block ids before their blocks** (Pandoc): part of the block in its parser, or carried like
  block-id lines before the text (§4.4). Either way, Enter at the start of a table's text makes the
  new node above the caption, because the caption is the table's.
- **Nodes without a text** (§4.3): a quote of several paragraphs, an item that starts with a quote.
  Their block-id lines are owned by the last paragraph or stay stray until containers get a text of
  their own, which Pandoc's divs will need.
- **Implicit block ids.** Should the Pandoc flavor offer to write out a heading's implicit block id
  (`{#results}`) before its text changes, so that links keep working?
- **Divs.** Which node owns `#fig-x` depends on how the Pandoc flavor reads divs, and on Quarto's
  figure divs against `implicit_figures`.
- **Headings in Obsidian.** An embed of a heading's block id shows the heading line, while the
  outline's node is the whole section. Nothing in ourus changes, but hosts following a link to a
  heading's block id should know.
- **Help for arrow keys under `decorated`**: a motion that skips block-id lines, for hosts that
  don't draw them. Possibly part of a caret-motion API ourus doesn't have yet.
- **A Logseq flavor**: whether it reads every `key:: value` property or only `id` and `collapsed`.
  Where Logseq writes `id::` in a block of several lines wasn't measured. The rule, the check, the
  declarations, the deferral check and the draft's hooks are the flavor's already; the syntax isn't:
  the recognizer, the frame part's place, the target rule, writing and removing, paste's marking, the
  caret's special cases are Obsidian's, written for `caret`. They go behind a per-flavor interface
  (§4.6) when the second flavor is built, not before: designed from one example, it would guess wrong
  about an `id::` line after the first line.
- **Not measured.**
  - In Obsidian, by TO (1.13.7): block ids after nested quotes, in footnotes, after math blocks;
    hover previews, canvas, mobile.
  - In Obsidian 1.14.5, the version the SxS runs: one name written on two blocks; ` ^x` in a table's
    cells; what "Copy link to block" writes for each kind of block, which `addBlockId` should match;
    whether `## ^h`, a heading whose text is only a block id, registers one.
