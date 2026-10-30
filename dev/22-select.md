# Selection (2026-10-28)

How outliners select: a node, its subtree, a run of siblings, and outward to everything. This covers
what ourus's hosts need (§1), what the apps do, measured live (§2), what ourus did before and what
it got wrong (§3), the design as built (§4), what it means for the Obsidian plugins ported to it
(§5), the steps it was built in (§6), what is open (§7), and what the code does where this design
was silent or wrong, with what the SxS measured of it (§8).

## Contents

- [1. What hosts need](#1-what-hosts-need)
  - [1.1 obsidian-outliner](#11-obsidian-outliner)
  - [1.2 obsidian-true-outliner](#12-obsidian-true-outliner)
  - [1.3 CodeMirror and other editors](#13-codemirror-and-other-editors)
- [2. What the apps do](#2-what-the-apps-do)
  - [2.1 How it was measured](#21-how-it-was-measured)
  - [2.2 Ctrl-A](#22-ctrl-a)
  - [2.3 Escape: select the block](#23-escape-select-the-block)
  - [2.4 Shift-Down and Shift-Up](#24-shift-down-and-shift-up)
  - [2.5 Keys over a block selection](#25-keys-over-a-block-selection)
  - [2.6 Free-form Markdown, folds](#26-free-form-markdown-folds)
  - [2.7 What the measurements say](#27-what-the-measurements-say)
  - [2.8 Structural keys over mixed depths](#28-structural-keys-over-mixed-depths)
- [3. ourus before](#3-ourus-before)
- [4. The design](#4-the-design)
  - [4.1 A subtree selection is a text selection](#41-a-subtree-selection-is-a-text-selection)
  - [4.2 Reading a selection: `touchedSubtrees`, `selectedSubtrees`](#42-reading-a-selection-touchedsubtrees-selectedsubtrees)
  - [4.3 The commands](#43-the-commands)
  - [4.4 What other commands do with a subtree selection](#44-what-other-commands-do-with-a-subtree-selection)
  - [4.5 Under folds and a zoom](#45-under-folds-and-a-zoom)
  - [4.6 What stays the host's](#46-what-stays-the-hosts)
  - [4.7 Options](#47-options)
- [5. Porting the plugins](#5-porting-the-plugins)
  - [5.1 obsidian-outliner](#51-obsidian-outliner)
  - [5.2 obsidian-true-outliner](#52-obsidian-true-outliner)
  - [5.3 What the design needed](#53-what-the-design-needed)
  - [5.4 The prototypes](#54-the-prototypes)
- [6. Steps](#6-steps)
- [7. Open](#7-open)
- [8. Implementation notes](#8-implementation-notes)

## 1. What hosts need

### 1.1 obsidian-outliner

- **Ctrl-A is a ladder** (`SelectAllContent.ts`, behind `overrideSelectAllBehaviour`): the item's
  text (after the checkbox), then the item with its children (from its text start to its last
  descendant's end), then the whole list (from column 0 of its first line), then CodeMirror's select
  all. It reads only the current selection: no press count.
- **No block selection, no Shift-arrow handling.** Shift-Up/Down are CodeMirror's, line by line. Its
  structural commands act on the item at the caret; over a selection across items, Tab and Shift-Tab
  are Obsidian's own, every selected line in or out a level (§2.8).
- **The caret is kept out of markers** (`KeepCursorWithinListContent`, `keepCursorWithinContent`): a
  transaction extender moves a caret left of the text start to it. ourus's `textStart` motions
  (spec/cursor.md) are the same rule.
- **Its zoom, obsidian-zoom**, clamps every user selection to the zoomed range
  (`LimitSelectionWhenZoomedIn`), and on zoom-in (`LimitSelectionOnZoomingIn`), a native select all
  with them; it has no selection commands of its own. ourus's zoom (dev/21-zoom.md) already keeps
  command results inside the view; a selection command must top out at the zoom root.

### 1.2 obsidian-true-outliner

The most developed model, and the one an ourus-based plugin would replace. Five pieces
(`openspec/specs/`):

- **A cover** (`escalate.ts`): a set of whole subtrees as one contiguous text range, whole lines
  from the first root's column 0 to the last descendant's end, the trailing blank lines (the gap)
  included. The roots may sit at different depths ("forest"); no node is ever covered without its
  subtree (downward closure). A node is never pulled in because the range crossed out of it.
- **Escalation** (`node-selection-enforcement`): a transaction filter turns any user selection that
  crosses a node boundary (a mouse drag, Shift-click, a drag past a node's end onto its gap) into
  the cover of its two ends. Within one node's text the selection stays character-level. Undo's
  restored selections and programmatic ones are left alone.
- **Ctrl-A ladder** (`select-all-ladder.ts`, `progressive-select-all`): own text (after the marker
  and checkbox) → the node's subtree → its siblings' run → the parent's subtree → … → the whole
  outline → native select all. Stateless: the next rung is the smallest one containing the current
  selection and different from it. Bounded by the zoom.
- **Shift-Up/Down by node** (`select-extend.ts`, `node-selection-extension`): at a node's edge (by
  *visual* rows: a soft-wrapped paragraph keeps native Shift-Down across its rows), one node per
  press. The first press selects the node's subtree, and later presses add the next node in document
  order, normalized to a cover. Pressing the other way shrinks back. Past the anchor upward the
  parent is swallowed and becomes the anchor. Stateless: the anchor is read from the cover and its
  orientation.
- **Block-selection mode** (`escalated-selection-decoration`): derived, never stored. It holds
  exactly when every non-empty range is a cover. It draws block chrome, hides the native highlight,
  renders Live Preview, and blurs the editor; keys are replayed through the keymap while blurred.
  Structural commands (`selection-structural-ops`) act on the cover's roots and return a cover of
  the same nodes, so Tab Tab Tab keeps acting on the same nodes.

They learned some of this the hard way, and ourus should take it as given: a list item's cover can't
start right after its marker in Obsidian, since a checkbox widget's late dispatch moves that
boundary to column 0. Shift-Down can't decide "at the edge" from source lines, because of soft wrap.
Undo restores non-cover selections. And the ladder and extension must compose through the selection
alone (Ctrl-A then Shift-Down = Shift-Down).

### 1.3 CodeMirror and other editors

- **CodeMirror's stock keymap**: Mod-A `selectAll`, Alt-L `selectLine`, Mod-I `selectParentSyntax`
  (grow to the enclosing syntax node: the closest thing to "expand selection" in a CM6 host; on
  Markdown it climbs Lezer's nodes, `ListItem` → `BulletList` → `Document`, which isn't ourus's
  outline: a paragraph doesn't own its list there, nor a heading its section), Escape
  `simplifySelection` (multiple ranges → the main one). Obsidian rebinds Mod-I to italics.
- **Code editors**: VS Code Shift-Alt-Right "expand selection", JetBrains Ctrl-W, Helix and Neovim's
  tree-sitter incremental selection.
- **The demos** (cm6, textarea, gtk) bind nothing for selection beyond ourus's Home and Up/Down.

## 2. What the apps do

### 2.1 How it was measured

Live, with the SxS drivers, on 18 setups (every app but Emacs), on 2026-10-28. A new probe action,
`key:<Playwright key>`, presses a key as it is (ourus does nothing at it), and each app's state was
read after every key: a caret, a text selection, or blocks selected as blocks. Below, "block `x`"
means `x` selected as a block, the app's highlight on the whole block rather than on text, which in
every one of them takes `x`'s children along; "text" means characters selected inside a block's
text. Shared-pool contention (§7, along the way) cost a rerun. WorkFlowy's and SiYuan's block
selections after Ctrl-A didn't read back: WorkFlowy's is from its notes (`sxs/workflowy/README.md`),
SiYuan's from the free-form probe (§2.6), where they did.

### 2.2 Ctrl-A

From a caret in `two`, a nested leaf with a child (`deep`), a sibling below (`three`), a parent
(`one`), and the parent's sibling (`four`):

```
- one
  - t┃wo
    - deep
  - three
- four
```

What is selected after each press of Ctrl-A ("same": the press changed nothing):

| App | 1st | 2nd | 3rd | 4th | 5th |
| --- | --- | --- | --- | --- | --- |
| true-outliner | `two`'s text | `two` and `deep`, as whole lines | `two`, `deep` and `three` | `one` and all under it | the whole note |
| Dynalist | `two`'s text | block `two` | blocks `two` and `three` | block `one` | blocks `one` and `four`: everything |
| Logseq, Tine | `two`'s text | block `two` | block `one` | blocks `one` and `four`: everything | same |
| RemNote (both) | `two`'s text | block `two` | everything | same | |
| Logseq DB | `two`'s text | block `two` | same | same | |
| Roam, Tana, WorkFlowy, SiYuan | `two`'s text | everything | same | | |
| Obsidian Outliner | `two`'s text | `two` and `deep`, as text from after `- ` | the whole list | the whole note | same |
| Athens | `two`'s text | same | | | |
| Obsidian, Live Preview, SilverBullet, BlockNote | the whole note | same | | | |

So true-outliner and Dynalist go text → the node → it and its siblings → the parent → everything.
Logseq and Tine skip the siblings: text → the node → the parent → everything. RemNote stops climbing
after the node and jumps to everything, Logseq DB stops at the node, and Roam, Tana, WorkFlowy and
SiYuan jump from the text to everything.

From a top-level leaf, every ladder skips straight from the block to everything. So true-outliner's
and Dynalist's "siblings" rung is the top level's "all".

From a node with siblings (`deep`, between `d1` and `d3`, under `two`) the two ladders show at every
level: Dynalist and true-outliner go text → `deep` → `d1`, `deep`, `d3` → `two` → `two`, `three` →
`one`; Logseq and Tine go text → `deep` → `two` → `one` → everything. From a block selection already
made, the ladder takes it as its rung: after Escape (block `two`), Logseq's Ctrl-A goes to `one`;
Tine and Tana spend a press first, the selection unchanged. From `deep` and `three` selected by
Shift-Down, true-outliner goes to the smallest rung holding both, `two`'s run (`two`, `three`,
`five`), then `one`, and so does Dynalist from its own Shift-Down result, `two` and `three` (§2.4);
Logseq and Tine go to block `two`, `deep`'s parent, dropping `three`, then `one`; Tana and Logseq DB
don't move. In a block of two lines, the first press selects both lines, the block's whole text, in
every app but Tana and WorkFlowy (the first line).

### 2.3 Escape: select the block

| App | Escape, the caret in `two` (Ctrl-A's outline) | Escape again |
| --- | --- | --- |
| Logseq, Logseq DB, Tine | block `two` (with `deep`) | nothing selected |
| Tana | block `two` | back to editing, the caret where it was |
| Roam | nothing (the caret stays) | block `two` |
| Dynalist, WorkFlowy, Athens, BlockNote | editing ends, nothing selected | (Dynalist, WorkFlowy: the caret back) |
| RemNote, SiYuan, SilverBullet, the Obsidians | nothing | |

Over a block selection, Up and Down move it to the previous or next visible block, in document order
and into children (Logseq, Logseq DB, Tine). Enter edits the last selected block at the end of its
own text, a parent's too (`two┃` over block `two`, not on `deep`: Logseq, Logseq DB, Tine; SiYuan on
a leaf).

### 2.4 Shift-Down and Shift-Up

From a caret in a single-line leaf, `deep`:

```
- one
  - two
    - de┃ep
  - three
  - five
- four
```

- **The first press selects the block** in Logseq, Logseq DB, Tana, RemNote, Athens and Dynalist
  (block `deep`). Roam and WorkFlowy select to the text's end first, then the block. Tine takes
  `deep` and `three` in one press. true-outliner: `deep`'s subtree. SiYuan: nothing, then the block.
  BlockNote's Shift-Down from a caret didn't read back, but its Shift-Up across a block's edge
  selects blocks (from the last of three, the last two, then all three). The text editors: a line.
- **Crossing the subtree's edge** (`deep` → `three`) gives one of two answers.
  - **Mixed depths**: Logseq, Logseq DB, Tana, Athens, Tine, Roam and WorkFlowy select blocks `deep`
    and `three`, at two depths, the parent `two` not taken. true-outliner's forest is the same.
    SiYuan doesn't extend past the block.
  - **The parent pulled in**: Dynalist and RemNote select blocks `two` and `three`: `two` comes in
    with all its children.
- **Shift-Up undoes Shift-Down** press for press, back to the anchor, in all of them but Dynalist,
  whose pulled-in parent doesn't give back (RemNote's does, back to `deep`).
- **Past the anchor upward, the parent**: Shift-Up from `deep` selects block `deep`, then block
  `two`, then block `one` (Logseq, Logseq DB, Tana, Athens, RemNote, Roam, Tine, WorkFlowy,
  true-outliner). From a first child the same: the child, then its parent, then the parent and its
  sibling above (Tine takes the parent at once; Roam, from a first child, doesn't select upward).
- **Shift-Up from a node with a sibling above** (the caret in `three`, whose sibling `two` above has
  a child `deep`) splits the apps. Logseq, Logseq DB, Tana, Athens, Tine and true-outliner take the
  node on the line above: `three`, then `deep` and `three` (two depths), then `two` and `three`
  (`deep` inside `two`), then `one`. Dynalist, both RemNotes, WorkFlowy and SiYuan take the sibling
  above with its subtree: `three`, then `two` and `three`, then `one`. Roam doesn't select upward.
  The first camp's rule is the same one that takes the parent from a first child: the node on the
  line above.
- **Shift-Down after Shift-Up went past the anchor** (from `deep`: up to block `deep`, up to block
  `two`, then down) splits them. Athens, Dynalist, both RemNotes and true-outliner grow from `two`:
  `two` and `three`, then `five`; the anchor moved to `two`. Logseq, Logseq DB, Tana and Tine shrink
  back to `deep`: the anchor stayed.
- **At the document's edge** the selection stays: Shift-Down on the last block selects it, and again
  changes nothing; Shift-Up then grows to the first block and stops (every app but Tana, WorkFlowy
  and SiYuan, which drop the selection at the top).
- **A multi-line block is lines first**: Shift-Down inside a block of two lines moves the head a
  line, as a text editor does, and selects the block only from its last line. Tana selects the block
  at once; Roam stays in the text. true-outliner decides "last line" by visual rows, for soft wrap.

### 2.5 Keys over a block selection

- **Structural keys keep it**: Tab leaves the same blocks selected in every block app but BlockNote
  (the SxS's stored runs of Indent9). ourus does the same where the selection is drawn from text
  start to text end.
- **Typing**: Logseq, Logseq DB and Tine ignore it. Tana goes back to editing and types at the old
  caret. None replaces the blocks, as a text editor's selection would be replaced.
- **Copy and Backspace over two depths** (`deep` and `three`, by Shift-Down): Backspace deletes
  both, each with its subtree, the caret at the end of the text above (`two┃`: Logseq, Logseq DB,
  true-outliner; Dynalist and RemNote, with `two` pulled in, at `one┃`). Copy levels them: Logseq,
  Logseq DB and Athens copy `- deep⏎- three`, Tana `deep⏎three`, siblings; RemNote keeps the
  relative indent (`two⏎    deep⏎three`); true-outliner copies the lines as they are,
  `\t\t- deep⏎\t- three`, which Markdown reads as code, not a list.
- **Copy, cut, Backspace**: the blocks, with their subtrees (spec/copy.md, delete-subtree.md;
  ourus's `copySelection: nodes`, `deleteSubtree`).
- **Paste** over block `b` (with a child `b1`, selected by Escape): Tana pastes after `b`'s subtree,
  `b` kept and still selected; Logseq, Logseq DB and Tine paste nothing (or the SxS's paste, a copy
  event's clipboard and Ctrl-V, doesn't reach them with no block being edited). None replaces the
  block.
- **Ctrl-Shift-A** selects every block in Logseq, Logseq DB, Roam and Dynalist.

### 2.6 Free-form Markdown, folds

- **A paragraph owns its list, a heading its section**, in true-outliner as in ourus. Its Ctrl-A
  from a paragraph goes text → the paragraph with its list → the heading's section → document, and
  Shift-Down from the paragraph takes it with its list. RemNote and SiYuan, holding a heading's
  section beside it, go from the paragraph (RemNote: its block; SiYuan: its text) to everything.
- **A folded block**: true-outliner's Shift-Down from the block above takes the folded block with
  its hidden child. In a block app a block always comes with its children, folded or not, so the
  probe shows nothing more there.

### 2.7 What the measurements say

1. **Block selection is what outliners have and ourus's hosts don't.** All twelve block setups
   select whole blocks by keyboard; among the Markdown editors only true-outliner does.
2. **Its shape is the subtree.** Selecting a block selects its children, everywhere. The selection
   is a set of whole subtrees, contiguous in document order.
3. **Mixed depths are the norm**: seven apps and true-outliner take `deep` and `three` together, the
   parent not pulled in. Dynalist and both RemNotes pull in the parent.
4. **Shift-Up/Down is one node per press, symmetric, lines first inside a block**, in nearly every
   block app, and true-outliner's. Upward from a node with a sibling above, they split: the node on
   the line above or the sibling above (§2.4).
5. **Ctrl-A ladders differ**; the common part is text → block → everything. Logseq, Tine, Dynalist
   and true-outliner climb through the parent; Dynalist and true-outliner add the siblings rung.
6. **Escape-to-select** is Logseq's, Tine's, Tana's and Roam's. For a text editor host Escape has
   other owners (Vim, Obsidian's own), so it is a command a host binds, not a default.

### 2.8 Structural keys over mixed depths

`deep` and `three` selected as blocks, at depths 2 and 1, in two outlines: in **A** `deep` is a
first child (it can't indent), in **B** it has a sibling `d0` above (both can):

```
A              B
- one          - one
  - two          - two
    - ««deep       - d0
  - three»»        - ««deep
  - five         - three»»
- four           - five
               - four
```

Played on the block apps and the Obsidian plugins (indent, outdent, move up, move down, each from
the start; Athens has no move key). Dynalist and both RemNotes couldn't be given a selection at two
depths (their drivers select blocks with Shift-Down from the first, which there pulls in the parent,
§2.4): not measured. BlockNote's indent and outdent did nothing and dropped the selection.
true-outliner was read with the driver that sees its block selection (§7, along the way): where it
shows a caret after a forest indent or outdent, the selection was gone, not unread.

**Indent** (Tab):

| | A (`deep` can't) | B (both can) |
| --- | --- | --- |
| Logseq, Roam, Tana | `three` under `two`, `deep` stays: each root that can | each root under its own previous sibling: `deep` under `d0`, `three` under `two` |
| WorkFlowy, true-outliner | nothing | each root under its own previous sibling |
| Logseq DB, Tine | nothing | both under `d0`, `three` after `deep` |
| Athens, SiYuan | nothing | nothing |
| Obsidian Outliner | every line one level in (text) | every line one level in |

**Outdent** (Shift-Tab), the same in A and B:

| | |
| --- | --- |
| Roam, Tana, WorkFlowy | each root out a level: `deep` after `two`, `three` after `one`, `five` left under `one` (ourus's `outdent: logical`) |
| Logseq, Logseq DB, Tine | `deep` out, after `two`; `three` stays: the selection levelled to its shallowest root |
| true-outliner | each root out a level, `three` after `one` with `five` now its child (ourus's `outdent: direct`); the selection lost |
| Outliner (Obsidian's own) | every line out a level as text, the same outline |
| Athens, SiYuan | nothing |

**Move up, move down** (Alt-Shift-Up/Down and the like):

| | |
| --- | --- |
| Logseq, Logseq DB, Roam, WorkFlowy, BlockNote | the roots move as one run of siblings, levelled: up, at the first root's depth before its previous sibling (B: `deep`, `three` above `d0`, `three` now `two`'s child); down, at the last root's depth after its next sibling (`deep`, `three` after `five`, `deep` now `one`'s child). Where the first root has no previous sibling (A, up), nothing, but BlockNote moves both above `two` |
| SiYuan, true-outliner, Outliner | nothing |
| Tana | up as Logseq in B; in A, `three` alone into `two`, `deep` deselected; down, nothing |
| Tine | `three` alone swapped with its neighbour, the selection then taking it in (a bug, by the look) |

What it says:

- **Indent acts on each root**, as each would alone, in the larger camp (Logseq, Roam, Tana,
  WorkFlowy, true-outliner), and so does outdent in Roam, Tana, WorkFlowy and true-outliner. Whether
  a root that can't stops the rest splits them: Logseq, Roam and Tana indent the others; WorkFlowy
  and true-outliner nothing.
- **Logseq's own outdent levels** the selection instead (and so does Logseq DB's, and Tine's): only
  the deeper roots move.
- **Moves level the forest into a run** in five apps (and Tana, up), which reparents the deeper
  roots: the moved nodes change depth. SiYuan, true-outliner and Outliner refuse it. ourus refuses a
  move that would reparent (`would-reparent`, spec/move-subtree-up.md), and has for one root.
- **Each app keeps one rule for indent and outdent** (but Logseq, levelling only on outdent), and
  that rule has nothing to do with how its Shift-Up grows a selection, nor does whether it has
  forests at all: Shift-Down makes one under either Shift-Up (§2.4), a drag too. Side by side, with
  this design's results (SxS, Indent47 and Outdent23 confirming the columns):

  | App | Shift-Up from `three` (§2.4) | A forest from Shift-Down | Indent, A | Indent, B | Outdent | Move |
  | --- | --- | --- | --- | --- | --- | --- |
  | ourus (`mixedDepths: level`) | the node above (`deep`) | yes | nothing | levelled | levelled | refused |
  | true-outliner | the node above | yes | nothing | each root | each root | refused |
  | WorkFlowy | the sibling above (`two`) | yes | nothing | each root | each root | levelled |
  | Roam | none upward | yes | the roots that can | each root | each root | levelled |
  | Tana | the node above | yes | the roots that can | each root | each root | partly |
  | Logseq | the node above | yes | the roots that can | each root | levelled | levelled |
  | Logseq DB, Tine | the node above | yes | nothing | levelled | levelled | levelled; Tine a bug |
  | Athens | the node above | yes | nothing | nothing | nothing | no key |
  | SiYuan | the sibling above | no, past its block | nothing | nothing | nothing | refused |
  | Dynalist, RemNote | the sibling above | never: the parent pulled in | – | – | – | – |

  Three rules for indent and outdent over a forest, then: levelled, each root as alone, or nothing,
  ourus's `mixedDepths` (§4.7, `level` the default); and the half-applied variant of the second, the
  roots that can, which ourus doesn't offer. Probed again for the option (two presses, roots two
  levels apart): the columns hold.

## 3. ourus before

Where ourus stood before this work, each point one §4 changes.

- **One range**: `Selection { anchor, head }` (`src/commands/types.ts`), character offsets. No
  multiple ranges. ourus's own type, shaped as CodeMirror's selection spec, so a CM6 host passes
  `state.selection.main` in and dispatches `result.selection` as it is. Its name shadows the DOM's
  `Selection` in any module that imports it; this design renamed it `TextSelection` (§6, step 0).
  Not `SelectionRange`: that is CodeMirror's class, which true-outliner imports beside it, and a
  different thing (`from`, `to`, `goalColumn`).
- **No selection commands.** Every command returns a selection, but none is about selecting.
- **Structural commands take the selection's nodes**, in `src/commands/util.ts`. `topmostNodes`: the
  topmost nodes whose own lines the selection touches (a caret's node too; on a blank line, the node
  above). `operands`: those, as one run of contiguous siblings (`siblingRun`), else
  `non-contiguous`. `operandsOf`: the command's `nodes` ids where it has them (a menu, a tree pane),
  else `operands`; delete, duplicate, copy and drag take this. `structuralOperands`: `operandsOf` of
  one kind (`mixed-kinds`); indent, outdent and the moves take this. Fold and zoom take
  `topmostNodes` themselves (`src/commands/view.ts`), each mapped to its row's outermost node
  (`rowOwner`). So the `deep`+`three` selection most outliners make is refused, as `non-contiguous`.
- **Where their selection goes after**: `selectionInText` (`util.ts`), each end in its node's text
  where it is in one, by node and offset, else its old offset mapped through the change. An end at
  column 0 or at the next line's start is in no text, so it is mapped (the bug below).
- **ourus draws a subtree selection as text**: from the first node's text start to the last
  descendant's text end, `- «b⏎  - c»`. The SxS projects that onto blocks selected whole
  (`sxs/lib/block.ts`). true-outliner's cover is a different text: whole lines from column 0, its
  gap included, `«- b⏎  - c⏎»`. A mouse drag or CodeMirror's Shift-Down from a line's start make the
  same whole-line shape.
- **Its selection after a command follows the text, not the nodes.** It works out for the shapes
  that end on the last node's own text (text start or column 0: the moves keep them), but not for a
  whole-line selection that ends at the next line's start, the one a mouse drag or Shift-Down from a
  line's start makes:

  ```
  - a          moveSubtreeDown     - a
  «- b         ─────────────────▶  ┃«- d
    - c                            »- b
  »- d                               - c
  ```

  The selection ends on the node it jumped over, and `moveSubtreeUp` stretches it over `- a`.
  `duplicateSubtree` refuses that shape (`unsupported`), and over the column-0 shape it selects the
  copy but turns the selection into the text-start shape. This is a bug on its own (§6, step 3).
- **Copy and cut of a selection across nodes** take the nodes (`copySelection: nodes`) or the text
  (the default). Paste over one is `pasteOverSelection`. These are the only places ourus asks what a
  selection means.
- **Over a whole node, column 0 to its end, editing goes wrong**: between `- a` and `- c`, with
  `- b` selected so (`«- b»`), copy gives `- b` with no line break, cut and Backspace leave a blank
  line between `- a` and `- c`, and typing `x` replaces the marker too, `x` a paragraph. The
  selection is plain text to them; only the one ending at the next line's start cuts clean.
- **The view**: a command's result selection is out of folds and inside the zoom (dev/21-zoom.md).

## 4. The design

### 4.1 A subtree selection is a text selection

ourus stays editor-agnostic and its hosts are text editors, so a subtree selection is a text
selection of a canonical shape, as true-outliner's cover is, not a mode or a set of ids the host
must store. A host that draws block chrome reads it back (§4.2); one that doesn't still shows a
plain selection over the right text. The structural commands took its nodes already; copy, cut,
Backspace, Delete and typing didn't (§3), and §4.4 says what they do with it.

The canonical shape is **whole lines**: from column 0 of the first root's first line to the start
of the line after the last descendant's last line, its line break included, or to the document's
end where no line follows; the trailing blank lines (the gap) not included. `two` selected, with
`deep`, is offsets from `two`'s line's column 0 to `three`'s line's start. The spec draws it as the
blocks it is (below):

```
- one
  - ««two»»
    - deep
  - three
```

That is how editors select lines: CodeMirror's triple-click and `selectLine` (Alt-L), VS Code's
Ctrl-L, Shift-Down from column 0, Vim's line-wise selection all end at the next line's start, the
break included (Outliner's ladder ends before it, at the content's end; true-outliner's cover after
the gap). The highlight runs to the right edge of the last line and shows nothing on the next. Why
whole lines, not ourus's text start → text end:

- A list item's text start is a boundary Obsidian's checkbox widget moves (§1.2). Column 0 is
  stable.
- It shows what the command takes: the markers, the indentation and the line breaks are the nodes'
  too.
- The native gestures make it already (above), and native editing over it is right: of the shapes
  in §3, it is the one a host's cut leaves clean. A key a host doesn't route to ourus degrades well.
- Text start → text end is also what the ladder's first rung selects (§4.3): a node's own text. The
  whole lines differ from it, and the break makes them differ even for a node with no marker and no
  indentation: a paragraph at column 0 (`alpha⏎⏎beta`: `alpha`'s text is offsets 0–5, its node
  0–6). So the first Ctrl-A on a paragraph is text, and Ctrl-A then Shift-Down is Shift-Down. Only
  a last leaf at column 0 without a marker, at the document's end with no line break after, has its
  text and its node on one range; there it reads as the node (§4.2).
- Text start still reads as the nodes for the structural commands (§4.2). So nothing breaks for a
  spec case that draws `- «b⏎- c»`.

The gap's blank lines stay out: its whole lines would draw blank rows as blocks. A gap goes with its
node in every command anyway (a cut takes it; dev/16-paste.md), and a selection that ends at the
gap's end, or before the last line's break, still reads as the subtrees (§4.2).

(The results of the commands in §4.3 are drawn in the canonical shape. Structural commands keep the
shape they were given, §4.4.)

**Drawing it in the spec**: `««…»»`, the selection glyphs doubled. `««` goes where the first root's
text starts and `»»` where the last root's own text ends; the roots are the topmost nodes the span
touches, each with its whole subtree, so `««two»»` takes `deep` without drawing it, and
`- ««deep⏎  - three»»` is `deep` and `three` at two depths. It stands for the canonical selection of
those roots, never for the drawn offsets: the reader (`readDrawing`, `drawnSelection` in
`test/drawing.ts`) builds it with `selectionOf`. Downward by default (the anchor at the top); `┃`
before it, as `┃«` already puts the head at the start, makes it upward (`┃««two»»`). The printer
(`test/drawing.ts`) draws a selection `selectedSubtrees` reads in the canonical shape so, with the
shortest span (`- ««two»»`, not `- ««two⏎    - deep»»`, which the reader takes too), and any other
shape with `«…»` at its real offsets: the cases that test reading the other shapes stay literal. The
SxS draws an app's selected blocks the same way, in place of its `▮` (`draw` and `readOutline`,
`sxs/lib/block.ts`): one notation for selected blocks across the spec, ourus's results and the apps'
reports. A span covers a run of selected roots with nothing unselected between them, a new span
where there is (an app can select blocks apart); `readOutline` still reads `▮` in the runs stored
before (`.sxs/results`), so a rejudge needs no rerun. The spec's block cases, drawn `- «b⏎- c»`
before (which the SxS projected onto blocks), are drawn `- ««b⏎- c»»`; the two about the text-start
shape itself stay so.

### 4.2 Reading a selection: `touchedSubtrees`, `selectedSubtrees`

> **Since 25-view:** both are `OurusView`'s and give nodes; `touchedNodes` and `selectedNodes` are
> gone, and `selectionOf` takes nodes or ids (`dev/25-view.md` §5.2).

A node in a selection always comes with its subtree, as the commands' `nodes` do ("each with its
subtree"): selecting a block selects its children, in every app (§2.7). So the API says subtrees.
Three methods on `OurusDoc`, and one it has; they take and give ids, as `nodes` does, and `rangeOf`
takes a node (a host maps an id through `doc.node(id)`):

```ts
touchedSubtrees(sel: TextSelection): readonly number[]           // what it touches, a caret its node
selectedSubtrees(sel: TextSelection): readonly number[] | null   // the roots if it is exactly them, as whole lines
selectionOf(ids: readonly number[], direction?: 'down' | 'up'): TextSelection   // those subtrees, as whole lines
rangeOf(node: OutlineNode): { from: number; to: number }         // exists: a node's lines, its descendants' too
```

Two questions, because the commands ask both (§4.4): what a key acts on (Tab with a caret indents
its item: touched), and whether a selection is blocks (Backspace over them deletes them: selected).
No object holds the answers: they are a function of the snapshot and the selection, and the
snapshot, immutable, keeps its last one, so asking both of one selection costs one computation.

**`touchedSubtrees`**: the topmost nodes whose own lines the selection touches, in document order,
at whatever depths (the closure, §4.4): `[deep, three]` for `deep` and `three` selected together,
`[two]` for a caret or any text in `two`. A blank line is the gap of the node above it, so a drag
from a node's text onto the blank line below touches that node, and a caret there too; a selection
ending at a line's very start doesn't touch that line. `[]` only where there is no node to touch:
blank lines before the first, an empty document. It is what `topmostNodes` (`src/commands/util.ts`)
was, now `OurusDoc.touchedNodes`.

**`selectedSubtrees`**: the same roots when the selection *is* their subtrees as whole lines, from
the first root's column 0 to the start of the line after the last root's `endLine` (the canonical
shape), or to the document's end, the end of the gap, or the end of that line before its break; else
`null`. Every whole-line shape a host made reads so: a triple-click's, true-outliner's covers (gap
included, restored by undo), a drag to a line's end. A range that is exactly one node's own text is
text, though: a paragraph's text from end to end (`alpha`, 0–5) is no subtree selection, though it
runs from column 0 to before its break; only at the document's end, where nothing tells the two
apart, is it the node. A text-start selection over several nodes (`- «b⏎- c»`, how the spec drew
blocks before `««…»»`) touches its roots, for the structural commands, but isn't selected: no
chrome, and the next `selectNodeDown` or `Up` makes it whole lines over the same roots (§4.3);
`expandSelection` climbs to the smallest rung holding it. Non-null is a **subtree selection**: what
a host draws as block chrome and uses as "block-selection mode", true-outliner's `allRangesCovered`.
Wherever it is: a select all of a document that is its nodes only (no frontmatter, no blank lines
before them) is a subtree selection too, as it is in true-outliner, whose `allRangesCovered` makes
no exception for it (its "Select All is native" is its escalation filter leaving a select all into
the frontmatter alone). Excepting `0` to the end would make the nodes of any such document
unreadable as blocks, and those are the common notes: an H1 with everything under it, where
`selectNode` on the title would give text, as would `selectNode` in a note of one item and
Shift-Down onto the last node. What typing does over a select all is typing's question (§4.4), not
the selection's.

**Ordinary gestures make a subtree selection too**, not only the commands of §4.3. CodeMirror's
triple-click selects a visual row, and a row that ends its line from column 0 to the next line's
start (`rangeForClick`), which over a one-line leaf that doesn't wrap is the subtree: the item, or
the paragraph (a wrapped one's row is part of its text). So is Alt-L, or Shift-Down from column 0 to
the next line. A drag over a paragraph's text, or a double-click on a one-word one, stays text: it
is the paragraph's own text, without its break. The subtree rules then apply (§4.4): the blocks
drawn, Enter to the node's end rather than replacing the line, copy, Backspace and typing on the
subtrees. Most of it is better than the host's own: after a triple-click the native selection takes
the line break, so typing removes the marker and joins the next line; the subtree rule keeps both. A
host draws blocks whenever `selectedSubtrees` is non-null, however the selection was made, as
true-outliner does: drawing them only after a selection command would need a flag ourus doesn't
keep.

**Drawing**: each root's lines are `rangeOf(node)`, which already ends before the gap, at the node's
`endLine`, as `foldRange` does; the end with the gap is `coverEnd` (`src/doc/view.ts`), which
`zoomRange` uses. `selectionOf` runs from `rangeOf`'s start to the start of the next line, its
break included, with a direction.

**Nodes that share a line** have one whole-line range: `- - a` (an item whose first child starts on
its line), a quote and its first paragraph in `> a`. The two methods read it differently, as the
commands did before. `touchedSubtrees` is innermost, as `topmostNodes` was (`nodeAtLine`): a caret
in `a` touches the inner item, so Tab with it acts on `a`, not on the outer item and the siblings
`a` has under it. Fold and zoom keep their mapping on top (`rowOwner`, `src/commands/view.ts`): a
caret there folds the outer item, the inner having nothing to hide. `selectedSubtrees` is outermost
within the zoom, a selection of the whole range reading as the outer node: `selectionOf([inner])`
reads back as the outer node when the inner is all of it, unless the zoom is the inner one's (zoomed
into the inner item of `- - a`, the outer item is outside the zoom, and the range reads as the
inner: a command on the outer's id is refused, `outside-zoom`, and a copy of it takes the outer
marker too). The round trip holds up to that: same text, the outermost id inside the zoom.

**A partial selection**, one that reaches past a node's text without being a subtree selection: a
host may escalate it, true-outliner's escalation filter, to the union of the selection and
`selectionOf(touchedSubtrees(sel))`, so that it never shrinks (a select-all keeps the frontmatter).
"Reaches past a node's text" is the host's test, on the selection's two ends rather than on the
topmost nodes: they are on different nodes' own lines (`doc.locate(pos).node`), or one is on a blank
line (`zone === 'gap'`), an end at a line's very start counting as on the line before, as for
`touchedSubtrees`. Not "more than one root touched": a drag from `two`'s text into its
child's, `- t«wo⏎    - de»ep`, touches `[two]` alone (`deep` is inside `two`'s subtree), and
true-outliner escalates it to `two`. Or the host leaves it as text. Escalation is a host option, not
ourus's default: a text editor's drag selection is the user's.

**`selectionOf`**: from the first of `ids`, in document order, to the start of the line after the
furthest end of the subtree of any node the span touches (or the document's end) (anchor at the
top, head at the bottom unless `direction: 'up'`): not only of `ids`' own subtrees, which can stop
inside a node between (with `listParent: paragraph`, `- a⏎⏎para⏎⏎- b⏎- c` and `[a, b]` take `para`
whole, `c` with it); zoomed, at the zoom's end where they end it, the line break after it being out
of the view. An id inside another's subtree adds nothing: `[p, a]` with `p`'s children
`a` and `b` selects all of `p`, and `[deep, one]` (a Shift-click on `one` after `deep`) all of
`one`. It throws (an `Error`, as `withZoom` does for an id it lacks) for no ids, an id the document
doesn't have (read before an edit), the root, or an id outside the zoom, or an id a fold hides (a
tree pane's click there unfolds it first, `unfold`): a host's ids are its own to keep current, and
there's no selection that would mean any of them. Everything between comes with it: `a` and `c` of
three siblings select `b` too. So `selectedSubtrees` reads back `ids` exactly when they are a
closure already, what `touchedSubtrees` returns; for any other set it reads back the closure of the
range. For a click on a bullet, a Shift-click on another, a tree pane, a drop that selects what it
placed (`placed`, already returned).

### 4.3 The commands

View-like: the text unchanged, the result a selection. Like `fold`, they are `applied` with no
changes, or `deferredToHost` where the key's native behavior is right.

The names: `expandSelection` for the outward ladder, as VS Code, Helix and Emacs's expand-region
call it (JetBrains's "Extend Selection" is the same ladder, so "extend" is avoided: CodeMirror and
true-outliner use it for moving the head); `selectNodeDown`/`Up` for one node per press, as
CodeMirror's `select<Unit><Direction>` (`selectLineDown`) that ourus's motions already take
(spec/cursor.md); `selectNode` for the node at the caret.

- **`selectNode`** (Escape in Logseq, Tine, Tana, Roam): the node at the caret with its subtree. In
  text of several nodes, their roots. On a selection that is already a subtree selection: a caret at
  its first root's text start. Not quite any app's: Logseq's and Tine's second Escape leaves nothing
  selected, which a text editor has no form for, and Tana's puts the caret back where it was, which
  ourus doesn't know; this is the nearest to Tana's without state. No option between this and the
  host's own Escape: neither would match an app.
- **`expandSelection`** (Ctrl-A in outliners; Shift-Alt-Right in code editors): the next rung of the
  ladder for the anchor's node, the smallest rung containing the selection and different from it.
  The anchor's node is read as `selectNodeDown` reads it (below), not from the anchor's offset: of a
  subtree selection, its one root, or its first root going down and its last going up; of a caret or
  text, the node it is in. The offset can be outside the nodes: `a` selected upward,
  `- p⏎  - a⏎- q`, with the anchor at `q`'s line start (the next-line-start shape) is at `q`, and a
  ladder of `q`'s would skip `p`. Rung 1 is text, compared by offsets (a caret, part of the text,
  and the whole text all touch the one node, and none is selected); the rest are subtree selections,
  compared as subtrees (`selectedSubtrees`), so a press that turns a text-start selection into the
  same nodes as whole lines counts as a step, and none repeats a rung under another shape. Rungs
  that are the same range count once (1 and 2 of a last column-0 leaf without a marker at the
  document's end, §4.1; 2 and 3 of an only child):
  1. the node's own text, from its text start (after a checkbox) to its own end, children not
     included; of fenced code, its content between the fences, as a code editor's select all
     (measured: Logseq DB, Tana, WorkFlowy, both RemNotes, SiYuan and Tine; Logseq, Dynalist and
     Athens take its whole text, fences and all);
  2. the node's subtree;
  3. its siblings' run, from its parent's first child to its last (`selectionLadder`, §4.7:
     `parents` skips it, `top` goes from rung 1 to rung 5);
  4. the parent's subtree, and 3–4 again outward;
  5. the top level's run, which is every node; inside a zoom, the zoom root's subtree is the top.
     Where the document is its nodes only (no frontmatter, no blank lines before them), that run is
     the whole document, still a subtree selection (§4.2), and the next press, the host's select
     all, changes nothing;
  6. past the top, `deferredToHost` (the host's select all: the document, frontmatter and all);
     inside a zoom, `applied` with the selection unchanged: a select all would reach past the zoom.

  A paragraph's rung 2 is it with its list; a heading's, its section. Stateless, as true-outliner's.
  Ctrl-A and Shift-Down compose through the selection alone. Over roots at two depths (`deep` and
  `three`), the smallest rung holding them all, `two`'s run: true-outliner's and Dynalist's; Logseq
  and Tine climb from the first root's parent and drop `three` (§2.2), which no rule that keeps a
  selection's nodes does.
- **`selectNodeDown`, `selectNodeUp`** (Shift-Down, Shift-Up at a node's edge): one node per press,
  true-outliner's sequence, which is the outliners' (§2.4):
  - from a caret or a text selection inside one node, at its edge (below), that node; from a
    selection over several nodes that isn't a subtree selection (a text-start one, or one undo
    restored), its roots as whole lines: arriving on the sequence is the press (true-outliner's
    normalization), in the press's direction;
  -  the selection is always the closure (§4.4) of two nodes, the anchor's and a candidate
    (true-outliner's construction); a press moves the candidate one node in document order, among
    the nodes shown (a folded node is one, its hidden ones skipped), by nodes, not lines (a gap
    between them is skipped: the line after a canonical selection may be blank), and on until the
    closure changes (from `[two]`, the next node down is `deep`, already in it: the press goes on to
    `three`): away from the anchor's node grows, towards it shrinks. So a shrink undoes the grow it
    follows whichever way the selection grew: grown down, the last root goes with its subtree; grown
    up, the first root goes alone, its children staying (`two` and `three` back to `deep` and
    `three`, not to `three`). Growing upward, the candidate is the node before in document order:
    from `three`, `deep` (with `three`), then `two`, which takes `deep` in; from a first child, its
    parent. Five apps' rule and true-outliner's (§2.4); the other five setups', the sibling above,
    skips `deep` (`selectNodeUp: sibling`, §4.7, which steps by siblings above the anchor's node
    both ways);
  - the anchor's node, read from the selection alone, as true-outliner reads it: with one root, that
    root; with more, the first root of a downward selection, the last of an upward one. So past the
    anchor upward, `deep` → `two` re-seats it on `two`, and a Shift-Down then grows from `two` to
    `three`, not back to `deep`: Athens's, Dynalist's, RemNote's and true-outliner's; Logseq, Logseq
    DB, Tana and Tine shrink back (§2.4). The other reading needs the original node kept somewhere,
    and an upward selection of `two`'s subtree has nowhere to keep it but its anchor's offset, which
    is `two`'s end, where `deep` ends too;
  - at the document's or the zoom's edge, the selection unchanged (`applied` with none, so the key
    is taken);
  - from a caret on a blank line, the node below going down, the node above going up (the blank line
    is the gap of the node above, but Shift-Down from it selecting that node would select upward).

  Over a subtree selection ourus decides, wherever the head is: the press is a node step. Otherwise,
  `deferredToHost` inside a node's text, the head not on the node's last line (down) or first line
  (up), where native Shift-Down is right; and the host checks visual rows before calling, the same
  order: a subtree selection first, then, if the head isn't on its line's last row, its own
  Shift-Down without calling ourus (as Home does for wrapped rows in the cm6 demo). Without that
  order, `- ««a⏎  more»»` selected and Shift-Up would move the head inside `a`, shrinking the node
  it should extend from. true-outliner checks for a cover before either.

None of them reaches into what a fold hides or out of a zoom (§4.5).

### 4.4 What other commands do with a subtree selection

- **The closure**: the roots of a selection are the topmost nodes it touches, each with its subtree,
  *at different depths allowed*. `deep` and `three` are two roots; `two` isn't pulled in. That is
  seven apps' answer and true-outliner's (§2.4). It replaced the `non-contiguous` refusal (§3) for
  the commands where a forest has a meaning:
  - **indent, outdent** (`mixedDepths`, §4.7; the default `level` lines the roots up after the first
    as one run, then acts on it; what follows is `each`): each maximal run of sibling roots as one
    operand, as one run was, and the runs in document order, all or nothing: where a run can't
    (`deep`, a first child), the whole is refused with its reason, as for one run (WorkFlowy's
    and true-outliner's answer, §2.8; Logseq, Roam and Tana indent the roots that can, which leaves
    a selection half-applied and a second Tab doing something else). A run, not each root:
    outdenting siblings `x` and `y` one at a time under `outdent: direct` would make `y` `x`'s
    child. Each run checks its kinds (`mixed-kinds`). Outdent by `outdent`, as one run is;
    under `logical` a result whose nodes are no longer one range is refused (`non-contiguous`):
    outdenting `deep` and `three` in A (§2.8) leaves `two`, `deep`, `five`, `three`, and any range
    over `deep` and `three` takes `five` too. Roam, Tana and WorkFlowy do it, keeping two blocks
    selected apart; one range can't. That isn't an edge case: under `logical` a mixed-depth outdent
    works only where the shallowest run ends its parent's children (nothing after it to stay
    behind), which neither A nor B does. Under `direct`, the default, the nodes after it become its
    children and the range holds.
  - **move up, move down, drag, duplicate**: one run of contiguous siblings, as before. A forest is
    refused (`non-contiguous`): levelling it into a run, as five apps do (§2.8), reparents its
    deeper roots, which ourus's moves refuse (`would-reparent`). A forest's duplicate, measured
    (`deep` and `three`): SiYuan and WorkFlowy put the copies levelled as siblings right after the
    last root (`three`'s level, after it), Tana duplicates `three` alone; ourus refuses. So
    Shift-Down's most common result, `deep` and `three`, can be outdented, and indented where every
    run can (case B of §2.8, not A, where `deep` is a first child), but not moved: a known gap, the
    apps' own split.
  - **copy, cut, delete** of a subtree selection: its roots with their subtrees, written as
    siblings, each at the top level of the copy with its subtree under it, the gaps between them as
    the nodes', a line break after the last. Not at their relative depths: Markdown has no form for
    a deeper root before a shallower one (`  - deep⏎- three` reads as one list of two items, the
    indent lost, and with four spaces or a tab it reads as code: true-outliner's copy), so the copy
    levels them, as Logseq, Logseq DB, Athens and Tana do (§2.5); cut and Backspace or Delete over
    it take them out as `deleteSubtree` does, the caret where `deleteSubtree` puts it. That's every
    block app's (§2.5), and new: `copySelection: nodes` refused a forest, and Backspace over whole
    lines was the host's text deletion (§3). Under `copySelection: text` too: a subtree
    selection is copied as subtrees whatever the option says, which keeps its say over a partial
    one.
- **In `src/commands`, which nodes.** "Which nodes does this command act on" was a stack, a wrapper
  per rule: `topmostNodes` (the nodes touched), `operands` (as one sibling run), `operandsOf` (ids
  first), `structuralOperands` (of one kind); fold and zoom called `topmostNodes` themselves. Now
  (`src/commands/util.ts`):
  - `operandsOf(ctx)`: the command's `nodes` ids where it has them, else `selectionRoots`: the
    selection's `selectedNodes` where it is a subtree selection, else its `touchedNodes` (a caret's
    node, so Tab with a caret still indents its item and fold still folds it). Selected before
    touched, for the line two nodes share: `- x⏎- - ««a⏎  - b»»` selects the outer item whole, and
    Tab indents it under `x`, where the touched roots, `a` and `b`, would be refused; the blocks
    drawn and the nodes acted on are the same. The roots, at any depths, or why there are none
    (`none`, `no-such-node`). Fold and zoom map them through `rowOwner` as before (§4.2: on a shared
    line the caret's node is the inner one, and the fold the outer one's).
  -  `runsOf(nodes)`: the roots as runs of contiguous siblings. `oneRun(ctx)`: the one run the
    moves, duplicate, drag and a copy of ids take (`non-contiguous` for more; `mixed-kinds` where
    the command asks). Indent and outdent take every run, through `mixedDepthsRun`
    (`src/commands/shape.ts`, by `mixedDepths`); delete subtree takes the roots as they are, each
    with the textless containers it is all of (`goneWithTextlessParents`, across runs:
    `- > «q⏎  - g»` takes the item).

  `topmostNodes`, `operands`, `structuralOperands` and `siblingRun` are gone. Copy keeps its own
  count of the nodes on the lines a partial selection touches (`nodesOnLines`): a drag from `two`'s
  text into `deep`'s is across nodes, though `touchedSubtrees` is `[two]`, and a caret on a blank
  line is the host's.
- **In `src/commands`, editing a subtree selection: one routing step.** Backspace, Delete, Enter and
  Shift-Enter go through `deleteSelectionAcross` (`backspace.ts`), which joins the two ends and
  needs both in a node's text: from column 0 it gives up, and the key is the host's (§3's blank
  line). Typing, paste and plain paste go through `afterDeleting` (`copy.ts`): delete, then act.
  Rather than a branch in each of seven files, `executeCommand` asks `selectedSubtrees` first and
  routes a subtree selection (`editSubtrees`, `src/commands/subtrees.ts`), where the command has no
  `nodes` ids (a menu's copy of given ids isn't read from the selection):

  | Command | Over a subtree selection |
  | --- | --- |
  | `deleteContentBackward`, `deleteContentForward`, `deleteSoftLineBackward`, `cut` | `deleteSubtree` of the roots |
  | `copy` | the roots, levelled as siblings, under either `copySelection` |
  | `insertText` | nothing: the key taken, the nodes still selected (over the whole document, the host's) |
  | `enter`, `shiftEnter` | the caret at the end of the last root's own text |
  | `paste` | the clipboard's nodes in the roots' place; with `pasteOverSelection: ignore`, after them |
  | `pastePlain` | one node in the roots' place, its text the clipboard's (over the whole document, the host's) |
  | the structural commands | as they are: they take `operandsOf` |

  `deleteSelectionAcross` and `afterDeleting` stay, for partial selections.
- **The result selection follows the nodes**: a structural command over a subtree selection returns
  the selection of the same nodes after the change, in the shape it was given (column 0 stays column
  0, text start stays text start; a whole-line selection ending at the next line's start stays so).
  Over a text selection inside one node, the text, as before. In the code, after the write, since a
  draft's anchors can't say "column 0 of node N's line" (`src/commands/shape.ts`): `shapeOf` reads
  the shape before the command (the roots' ids, the direction, where the last end is: the next
  line's start, the last line's end, the gap's end, past the gap) and `reshaped` rebuilds it on the
  result's nodes; duplicate maps it onto the copies. A selection that isn't a subtree selection but
  starts at column 0, outside a text (`«- b` to the end of `b`'s own line, `b` with children), keeps
  that start at its line's node; only the start: an end at a line's start is the next line's, and
  kept there it is §3's bug again. Where a root went or the view hides it, the command's own
  selection stays. This is the fix for §3's bug, and what true-outliner and every block app do
  (§2.5).
-  **Typing over a subtree selection does nothing**: the key taken (`applied`, no change), the nodes
  still selected, as Logseq, Logseq DB, Tine, Roam, Athens, Dynalist, RemNote and WorkFlowy ignore
  it (SubtreeEdit7 to 10; Tana edits again, BlockNote replaces). Not the host's text replacement,
  which takes the markers too and leaves `x` a paragraph (§3). But over the whole document, a select
  all: the host's, the text replaced (`x`), as every text editor has it (measured, §8). A plain
  paste makes one node in the roots' place, under the first root's prefix (its list marker, a task's
  checkbox, a heading's `#`s), an atom's a paragraph.
- **Enter over a subtree selection**: the caret at the end of the last root's own text, nothing
  deleted: a parent's own text, not its last descendant's (Logseq's, Logseq DB's, Tine's and
  SiYuan's, §2.3). A text editor's Enter would replace the nodes with a blank line; no outliner
  does. Shift-Enter the same, a line break being no more a reason to delete the blocks. Measured
  after (a block selected by Shift-Down, then Shift-Enter): Logseq, Logseq DB, Roam and both
  RemNotes do nothing, the block still selected; Tine edits at its last descendant's end; SiYuan
  breaks the line in the block's text; true-outliner replaces the lines with a blank one. The
  largest camp is nothing at all, not Enter's rule.
-  **Paste over a subtree selection**: the clipboard's nodes in place of the roots, as a cut and a
  paste there, as ourus pasted over any selection across nodes before (Roam's). Tana pastes after
  the roots instead, keeping them (§2.5): `pasteOverSelection: ignore`, the nodes after the last
  root at its level (§4.7). Most block apps paste nothing there.

### 4.5 Under folds and a zoom

- **A fold**: a folded node is selected whole, its hidden children with it (§2.6). The canonical
  shape's end is the start of the line after the subtree: past the fold, outside it, where neither
  ourus's rule that a result is out of what folds hide (dev/21-zoom.md §3, `visibleSelection` in
  `src/commands/view.ts`) nor CM6 (which opens a fold only for a head strictly inside,
  `clearTouchedFolds`) moves it, and the host draws the blocks to the folded line. At the document's
  end, with no line after the fold, the end is the fold's own `to`, which `visibleSelection` moved
  to the fold's start: there it now leaves a non-empty selection's end where it is, the one
  exception.
- **A zoom**: every rung and extension stays in the zoom root's subtree, and `selectionOf` of an id
  outside it throws (§4.2). The root's subtree is the ladder's top. A selection reaching past it
  isn't made.

### 4.6 What stays the host's

- **Drawing**: block chrome, hiding the native highlight, focus (true-outliner blurs to get Live
  Preview), all from `selectedSubtrees`, and each root's `rangeOf`.
- **Escalation of a mouse drag** (§4.2): a host's option, the union of the selection and
  `selectionOf(touchedSubtrees(sel))`, where the selection reaches past a node's text (§4.2).
- **Keys**: suggested bindings, none default, as for every ourus command:

  | Command | Key | As |
  | --- | --- | --- |
  | `selectNode` | Escape | Logseq, Tine, Tana, Roam |
  | `expandSelection` | Mod-A (outliner hosts), Shift-Alt-Right | Logseq, Tine, Dynalist, true-outliner, Outliner; VS Code |
  | `selectNodeDown`, `selectNodeUp` | Shift-Down, Shift-Up | every outliner |

- **A drag of a subtree selection**: a host's native text drag carries the raw lines, as text (in
  another document `    - deep` reads as code), so over a subtree selection the host starts ourus's
  `drag` instead: the pickup of its roots (`spec/drag.md`), its drag out deleting them by
  `deleteSubtree` with `expectMarkdown`, as now. Where `drag` refuses the roots (a forest at two
  depths, `non-contiguous`), the host starts no drag at all. A forest dragged out (a copy and a
  delete, no place inside the document) would be a pickup of its own: not in this design.
- **Input ourus doesn't see**: an IME's composition, the browser's text replacements, and the
  host's own word deletions (Alt-Backspace, Ctrl-Delete) reach the editor without a key ourus is
  asked about (the cm6 demo leaves the first two to CodeMirror, `typingHandler` in
  `demos/cm6/main.ts`), so over a subtree selection they replace its text, markers and all.
  true-outliner blurs the editor while blocks are selected, so a composition can't start; a host
  that doesn't needs a guard of its own: a transaction filter that turns such input over a subtree
  selection into typing's rule, and such a deletion into `deleteSubtree` (§4.4).
- **Multiple ranges**: ourus's `TextSelection` is one range. true-outliner runs each range on its
  own; a host can do that with these commands as they are.

### 4.7 Options

Where the apps split and either is a reasonable host default, most used first, each measured in
the apps named (SxS and sxs/probe.ts). Three are new; `pasteOverSelection` existed, and its
`ignore` now covers blocks. The first value is the default:

1. `selectionLadder`: where Ctrl-A goes past the node's subtree.
   - `siblings`: its siblings' run, then its parent, outward (true-outliner, Dynalist). A superset
     of `parents`'s rungs.
   - `parents`: its parent, the siblings skipped (Logseq, Tine; Select5 agrees press for press).
   - `top`: past its text, straight to everything (Roam, Tana, WorkFlowy, SiYuan; Select22).
   - Either way the ladder keeps the selection's nodes: over `deep` and `three`, `parents` goes to
     `one`, not to `two`, dropping `three` (§4.3).
2. `selectNodeUp`: what Shift-Up adds from a node whose sibling above has children (§2.4).
   - `line`: the node on the line above, `deep` (Logseq, Logseq DB, Tana, Athens, Tine,
     true-outliner). Shift-Down's exact inverse.
   - `sibling`: the sibling above with its subtree, `two` (Dynalist, both RemNotes, WorkFlowy,
     SiYuan; Select23).
3. `pasteOverSelection` (its `ignore` added for blocks): a paste over a subtree selection.
   - `replace`: the clipboard's nodes in place of the roots (Roam; SubtreeEdit14).
   - `ignore`: the roots kept, the clipboard's nodes right after the last (Tana; SubtreeEdit17).
   - Most block apps paste nothing there (Logseq, Logseq DB, Tine, Athens, RemNote, WorkFlowy):
     no value.
4. `mixedDepths`: indent and outdent over roots at two depths (the table ending §2.8; probed again
   for this option, two presses and roots two levels apart). One option, not one per command: each
   app is in one camp for both. Unrelated to `selectNodeUp`: Shift-Down makes a forest under either
   value, and so does a drag.
   -  `level`: the roots lined up after the first as its siblings, one run, then indented or
     outdented as that run (Logseq DB, Tine; Indent49, Outdent25). The default: after one press the
     selection is one run of siblings, which every later press moves whole, and nothing is left
     half-applied. Not "only the deeper roots out": with roots two levels apart the shallower one
     goes deeper, after the first. Of one kind, and none the whole of a container with no text (`> -
     q`): else refused. Logseq DB also makes the node after a moved root its child; ourus leaves it.
   - `each`: each run of sibling roots as it would go alone, all or nothing (WorkFlowy; Roam and
     Tana, which split the selection under logical outdent, which ourus refuses; true-outliner;
     Indent47, Outdent23).
   - `refuse`: nothing (Athens, SiYuan; Indent50, Outdent26).
   - Not a value: the half-applied `each` (Roam, Tana and Logseq indent the roots that can, and Tana
     goes on each press until they level): a second Tab would act on a half-indented selection.
     Logseq is in no one camp (`level` on outdent, the roots that can on indent).

Not options: typing over a subtree selection does nothing, as in every outliner measured but
BlockNote and Tana (§4.4); the parent-pulling extension (Dynalist, RemNote) selects nodes the
selection never reached and can't shrink back (§2.4); the re-seated anchor's other camp (§7) needs
an anchor stored outside the selection.

## 5. Porting the plugins

Read against the design: what each plugin's selection code becomes on ourus, and what stays its own.

### 5.1 obsidian-outliner

| Its code | On ourus |
| --- | --- |
| `SelectAllContent`, `CtrlAAndCmdABehaviourOverride` (Ctrl-A ladder) | `expandSelection`, bound to Mod-A; the plugin keeps the binding and its setting |
| `KeepCursorWithinListContent` (a caret left of the text moved to it) | not a selection command: ourus's `textStart` rule (spec/cursor.md), which the cm6 demo applies to Home and Up/Down. A click into a marker needs a transaction filter on `textStart`, the host's |
| `KeepCursorOutsideFoldedLines` | ourus's fold rule for command results; for a click or native motion, the same filter on `foldRange` |

All of `SelectAllContent` goes. Three things change for its users: the ladder climbs through each
parent where Outliner jumps from an item to the whole list; its top is the outline (in a list-only
note, the list; with paragraphs or headings, everything), not the one list; and its second rung
starts at column 0 rather than after the marker. The first is the outliners' ladder (§2.2); the
others are §4.1's shape. A `list` rung for Outliner's exact ladder isn't worth an option: nothing
else has it.

Its zoom's `LimitSelectionWhenZoomedIn` and `LimitSelectionOnZoomingIn` stay: ourus's commands
never leave the zoom, but native selections (a mouse drag, Shift-End, the select all
`expandSelection` defers to past its top) do, so the filter stays, on `zoomRange()`, its
`calculateLimitedSelection` as it is. A Ctrl-A it clamped, bound to `expandSelection`, tops out at
the zoom root's subtree on its own (§4.5).

### 5.2 obsidian-true-outliner

| Its code | On ourus | What stays |
| --- | --- | --- |
| `escalate.ts`: covers, forests, `coveredSubtreeRoots` | `touchedSubtrees`, `selectedSubtrees`, `selectionOf`, the closure (§4.2, §4.4) | — |
| `transaction-filter.ts`, `classify.ts`: escalating user selections | `touchedSubtrees` + `selectionOf` per range | the filter: which transactions (its userEvent classes), the multi-range rule (every range escalated once any is), the never-shrink union |
| `select-all-ladder.ts` | `expandSelection`, `selectionLadder: siblings` | the binding; nested editors (a table cell) declined |
| `select-extend.ts` | `selectNodeDown`/`Up` | the visual-row check (soft wrap), before calling; ranges one at a time |
| `operand.ts`, `structural-run.ts`: a cover as an operand, the cover after | ourus's commands take the selection's nodes and return them selected (§4.4) | several ranges declined |
| `zoom.ts` `clampRange` | every command bounded by the zoom; `zoomRange()` for native selections | the clamp of native ones |
| `decorations.ts` chrome, block-selection mode | `selectedSubtrees`, and `rangeOf` per root | all of the drawing: the chrome's column, the native highlight hidden, Live Preview, the blur and the focus policy |
| `caret.ts`: addressable caret positions, gap lines | not this design | — |

The pure geometry goes: covers, ladder, extension and operands, some 1,100 lines (`escalate.ts` 433,
`select-all-ladder.ts` 192, `select-extend.ts` 286, `operand.ts` 191), and the bounds in `zoom.ts`.
What stays is CodeMirror: the filter, the keymap, the chrome. Its own behavior is ourus's
`selectionLadder: siblings`, `selectNodeUp: line` and `mixedDepths: each` (§4.7); what changes: a
cover no longer carries its trailing blank lines (§4.1), and a forest's indent and outdent keep the
selection, which its own lose (§2.8). One thing it reads otherwise, measured: a selection ending at
the next line's start takes that line's node in its own code (its Tab over `««b⏎- c»»` indents `d`
too), where ourus's doesn't; the chrome and escalation it keeps must read it as ourus does.

Three of its findings are rules here: covers start at column 0 (its checkbox finding, §1.2), "at the
edge" is decided by visual rows in the host (§4.3), and undo's non-cover selections are normalized
on the first press (§4.3).

### 5.3 What the design needed

The port turned up four things, now in §4: an end on a node's gap counts as reaching past its text
(true-outliner's drag-past-the-end, §4.2); `selectedSubtrees` reads every shape a host made, gap
included, so selections restored by undo still show as blocks; escalation is a union with the
selection, never a shrink; and a Shift-arrow from a selection that isn't a subtree selection first
makes it whole lines over all its roots, from a caret or a text selection the node it is in (§4.3).
Not needed: a stored mode, a press count, a selection history; true-outliner's own conclusion, that
everything is a function of the current selection, holds for ourus's commands.

### 5.4 The prototypes

Both plugins were ported to ourus's commands once, on branches of their own (`wip-ourus1` in
obsidian-outliner, `feat/ourus-core` in true-outliner), each with a writeup. Selection was out of
scope for both, and what they say about it:

- **Both kept their selection code for want of this design.** Outliner's select-all stayed on its
  own parser (`SelectAllContent`, some 150 lines); its writeup asks for an `expandSelection`, "text
  → node with its subtree → document", and names it, with a move to a destination, as what would
  remove the most plugin code. true-outliner kept escalation, the ladder and extension on its own
  engine over an adapted tree ("nothing for the selection or caret motions; each meant keeping a TO
  module alive"), and notes that "the topmost nodes the selection touches", which ourus's commands
  already read, is the same concept as the selection that gets there: §4.2's `touchedSubtrees`.
- **Typing over a selection across nodes** still went through true-outliner's own `enforce`. Its
  writeup's suggestion, delete the selection as Backspace does and then type, joins the ends; over a
  subtree selection §4.4 has typing do nothing, as the outliners do, and a partial selection keeps
  the suggestion's behavior (Backspace's join, then typing). The wider question it raises, a verdict
  for any host edit that crosses nodes (a text drag, an IME's composition), is §4.6's input ourus
  doesn't see.
- **Outliner's scope**: a key went to ourus only with both ends of the selection in a list item and
  one selection (`inList`), Outliner's own reach, so its prose notes stay Obsidian's. Its port binds
  the selection commands behind the same gate: Ctrl-A in a paragraph stays Obsidian's select all.
- **Dispatch**: the Outliner port dispatched each result with `filter: false` and a user event of
  its own, `ourus.<command>`. A selection command's result wants the same: true-outliner's
  escalation leaves alone a dispatch with no `select` user event (it classes it programmatic), and
  obsidian-zoom's clamp acts on `select` events only, so a result marked `select` would go through
  both again. So a selection command's result is dispatched without a `select` user event
  (`ourus.<command>`): ourus bounds its results already (§4.5).
- **The caret** (Outliner's sticky caret, some 240 lines; true-outliner's `caret.ts`) was the other
  thing both kept: a position snapped to the nearest place in a node's text. Not selection, and not
  this design (§5.1, §5.2).

## 6. Steps

Built in this order, each step's tests green before the next, the spec unchanged by the steps that
say so; §8 has what the code does where this design was silent.

0. **`Selection` renamed `TextSelection`** (§3), moved down from `src/commands/types.ts` to
   `src/text`, beside `ChangeSpec`, re-exported from `src/commands`: `OurusDoc.selectionOf` returns
   one, and `src/doc` imports `src/text`, never `src/commands`. `src/index.ts` keeps
   `/** @deprecated */ export type Selection = TextSelection` for the plugin ports on their branches
   (§5.4).
1.  **`touchedSubtrees`, `selectedSubtrees`, `selectionOf`** on `OurusDoc` (§4.2), and the spec's
   `««…»»` (§4.1), in the spec and the SxS. Property tests over every spec start: the round trip in
   every whole-line shape and both directions, a caret's node, a node's own text, the closure,
   shared lines and the zoom, the throws.
2. **`operandsOf`, `runsOf`, `oneRun`** in place of `topmostNodes`, `operands` and
   `structuralOperands` (§4.4). Behaviour-neutral: no spec case moved.
3. **The result selection follows the nodes** (§4.4), the fix for §3's bug, with spec cases for each
   shape (MoveDown41 to 44, MoveUp44 to 46, DuplicateSubtree11 and 12, Indent46).
4. **Editing a subtree selection**, the routing step (§4.4): `spec/subtree-selection.md`.
5. **The commands** (§4.3): `spec/select.md`, and inverse tests (Shift-Down then Shift-Up the
   identity until the anchor is re-seated; the roots' depths never increasing along a selection).
6. **The SxS**: the new actions mapped to each app's keys, drivers taught to read the apps' block
   selections, the old block cases redrawn as `««…»»`, every app run on what changed.
7. **Roots at several depths** for indent and outdent (§4.4), `mixedDepths` (§4.7), measured again
   with sxs/probe.ts for its values.
8. **The demos**: the cm6 demo's bindings, block chrome and drag escalation; the textarea demo's
   bindings.
9. **The options** of §4.7, each measured against the apps it copies.

## 7. Open

- **The re-seated anchor**: past the anchor upward then down, ourus grows from the new root (four
  setups and true-outliner); Logseq, Logseq DB, Tana and Tine shrink back (§2.4), which a
  selection's offsets can't express (§4.3).
- **Shift-Enter over a subtree selection**: ourus puts the caret at the end of the last root's text,
  as Enter does; measured, Logseq, Logseq DB, Roam and both RemNotes do nothing, Tine edits at the
  last descendant's end, SiYuan breaks the line. Nothing at all is the largest camp.
- **A forest's duplicate**: refused (`non-contiguous`); SiYuan and WorkFlowy put the copies,
  levelled, right after the last root, Tana duplicates the last root alone.
- **A subtree selection by gesture** (§4.2): a triple-click selects a one-line item or paragraph as
  a node, but on a soft-wrapped line one row, as text: the same gesture gives a block or text by the
  window's width. If that proves surprising in a prose host, a host can draw blocks only for a
  selection made by a command, at the cost of a flag of its own.
- **Multiple ranges**: not ourus's for now (§4.6).
- **The true-outliner port** (§5.2): its five pieces on ourus, its filter and chrome kept, its
  geometry replaced; its own reading of a selection ending at the next line's start reconciled.
- **Known failures**, from the differential: duplicate over a subtree selection whose first root has
  no text of its own (`«> q»`, `quotes: container`) throws where it puts a caret in the copy's text
  (§8, the result selection: the copy's first descendant with text is the place); and two older
  ones, a drop (`pasteAt`) of `- →b` after `- a` in `- x⏎  > - a⏎⏎  ◌` and a paste of `-⏎  x` at a
  caret in an empty task's checkbox (`markup: decorated`), which fail to write.
- **The demos**: the cm6 demo's drag escalation has no smoke scenario (a pointer drag); the textarea
  demo can't tell a wrapped line's rows, so a soft-wrapped paragraph is selected whole at the first
  Shift-Down.

### Along the way

- **The SxS has a raw-key action**, `key:Control+a` (Playwright's names), for probing a key no spec
  action names: the app presses it, ourus does nothing (`test/player.ts`, `sxs/lib/plan.ts`,
  `sxs/run.ts`). `node sxs/probe.ts all,-EM '- t|wo' key:Escape key:Shift+ArrowDown`.
- **The Obsidian driver reads true-outliner's block selection.** true-outliner blurs the editor
  while its selection is a cover (`to-decor-block-selecting` on the editor), and `read` took the
  blur for no caret, so its block-selection results were drawn as no selection.
- **The shared pool can't be shared between containers**, as `sxs/run.md` warns: with another
  container on `.sxs/`, every app that keeps data in the browser's storage hung on load and SiYuan's
  kernel couldn't take its lock. A run left hanging does the same in one container (RemNote, stuck
  with blocks selected): `node sxs/run.ts --stop`, then one app at a time, RemNote with
  `--workers=1`.

## 8. Implementation notes

What the code does where §4 was silent or turned out wrong, and what the SxS measured of it.

### Reading a selection

- **The code**: `src/doc/select.ts` (`touchedNodes`, `selectedNodes`, `subtreesSelection`), and on
  `OurusDoc` the three id methods of §4.2 plus `touchedNodes` and `selectedNodes`, the same answers
  as nodes, for the commands. The snapshot keeps the last selection's answers, each computed on
  first ask. `textStart` and `textEnd` moved down from `src/commands/util.ts` to `src/doc/text.ts`
  (a node's own text decides §4.1's rule, and `src/doc` doesn't import `src/commands`); `util.ts`
  re-exports them.
- **No whole-document exception.** A first draft read `0` to the document's end as never a subtree
  selection; it made `selectionOf` of an H1 note's title, of a one-item note's item, and Shift-Down
  onto the last node read as text (§4.2).
- **`selectionOf` takes the closure** of every node its span touches, not only `ids`' own subtrees,
  which with `listParent: paragraph` can end inside a paragraph between that owns a list. Zoomed, it
  ends at the zoom's end where the subtrees end the zoom.
- **The outermost rule lifts each run of sibling roots**, not only roots that share one parent:
  `- a⏎> - q` selected whole is `a` and the quote.
- **The accepted ends** of a subtree selection: anywhere from the last line's end before its break
  to the start of the line after the gap. An empty last node (a placeholder's paragraph) ends where
  its line starts, so ending there doesn't touch it.

### The spec's `««…»»` and the SxS's

- **The spec** (`test/drawing.ts`): `readDrawing` gives the drawn offsets and
  `subtrees: 'down' | 'up' | null` (the direction from the `┃`: an empty node draws `««»»` at one
  point); `drawnSelection` makes the selection the starts take. `drawDoc` prints a canonical
  subtree selection as `««…»»` where the span reads back as it, else `«…»` at its offsets: an empty
  last node on an empty line has no span. The glyph is in `spec/README.md`.
- **The old block cases** (17, drawn `- «b⏎- c»` before) start as `««…»»`; their expected buffers
  changed only from `«…»` to `««…»»`, the same nodes selected after.
- **The SxS** (`sxs/lib/block.ts`): blocks selected whole drawn `««…»»`, a span to each run with
  nothing unselected between; the old `▮` still read, so stored runs rejudge. A start drawn `««…»»`
  loads as blocks selected; one drawn `«…»` as text, whole lines or not. `readTextDoc` reads `««…»»`
  as whole lines; `drawTextDoc` draws a text editor's selection at its offsets (stored runs are
  keyed by the drawing). `compareTexts` judges two selections that read as the same subtree
  selection, whatever whole-line shape or direction, as agreeing: true-outliner's covers end before
  the last break.
- **Drivers**: WorkFlowy's select all selects the test's container item itself, now read as every
  block; SiYuan's marks the list (`NodeList`), now read as its items; the Obsidian plugins' drivers
  no longer skip a selection from a line's start as "a caret before an item's text". Paste over a
  block selection in Logseq and Tine was checked by hand with the browser's own clipboard: a paste
  event reaches the page and nothing changes.

### Which nodes, and the selection after

- **`src/commands/util.ts`**: `operandsOf`, `selectionRoots`, `runsOf`, `oneRun`,
  `goneWithTextlessParents` (§4.4). Drag with a pressed mark drags the selection's run where the
  mark is one of its roots or of the nodes it touches (on a shared line the root is the outer item,
  the mark pressed the inner one's). Copy keeps its count of the nodes on the lines touched
  (`nodesOnLines`): a partial selection under `copySelection: nodes` still takes one run (Copy7).
- **`src/commands/shape.ts`**: `shapeOf` and `reshaped` (§4.4), wrapped around indent, outdent, the
  moves and `moveSubtree` in `execute`; duplicate maps the shape onto its copies. It applies with
  `nodes` ids too: the selection is kept on its own nodes. `visibleSelection` leaves a non-empty
  selection's end at a fold's end that is the document's end (§4.5). One spec case moved with it,
  Regression61, whose start runs from a line's column 0 in the marker: kept at the line's node, not
  at the child an offset mapped it into.
-  **`mixedDepthsRun`** (`shape.ts`), for indent and outdent over more than one run, by
  `mixedDepths`: `each` runs the command on each run in turn, on the document the runs before it
  left, the changes composed, the first refusal the whole's; `level` lines the roots up after the
  first (one draft) and runs the command on that run; `refuse` refuses. After, the roots must still
  be one range, else `non-contiguous`. It applies to any selection across depths, not only a subtree
  selection.

### Editing a subtree selection

- **`src/commands/subtrees.ts`** (`editSubtrees`), first in `execute`: §4.4's table. Typing is
  `applied` with no change; over the whole document, not routed (the host's). Plain paste
  (`inPlace`): one draft removes the other roots and the first root's children and selects the
  first root's whole text (an atom made an empty paragraph), then the command runs on that, the two
  composed; where that is the host's, ourus does the host's default on the intermediate document
  (the host has only the original, where its default is §3's bug). Paste: delete subtree, then
  `pasteAt` the first root's place (`ignore`: after the last root), the caret at the end of what was
  placed.
- **Copy** writes each run out of its own containers (`markdownOf` per run), joined with the blank
  lines between: roots at two depths come out as siblings.
- **The select all**, measured (Ctrl-A to everything, then `x`): plain `x` in every text editor,
  true-outliner included; ignored in Logseq, Logseq DB, Tine, Roam, Dynalist; `- x` in BlockNote
  alone. ourus's hosts are text editors: the host's replacement.

### The commands

- **`src/commands/select.ts`**: `selectNodeCommand`, `expandSelectionCommand`,
  `selectNodeByCommand`. The ladder's rungs (`rungsOf`) are `[node]`, then for each level up to the
  zoom root or the top the siblings' run (always at the top level, which is everything) and the
  parent; `top` is the top alone. A rung holds the selection where every root it touches is in its
  subtrees, and differs where its roots as `selectedNodes` reads them differ; rung 1, the node's own
  text, only where the selection isn't a subtree selection. A selection command's deferral inside a
  zoom is passed on (`SELECTS`, `src/commands/zoom.ts`): it is the host's own selection, no edit.
- **The Shift-arrows**: the candidate is the last root going down, the first going up, the one root
  alone; the result's direction is the press's for one root, else from the anchor's node towards the
  candidate. `selectNodeUp: sibling` steps by siblings (or to the parent) on the anchor's upward
  side, both ways, so Shift-Down still undoes it.
- **Two exceptions to §6's properties**, both of lines nodes share: the identity breaks where a
  step's roots are all of a textless node on their lines (`- - a⏎  - b` reads as the outer item, the
  anchor re-seated on it); "a later root is never deeper" fails where it sits on its parent's first
  line (`- > q`: a range over `- a` and that line touches the quote, not the item). The tests state
  both.
- **The player** (`test/player.ts`) takes the four as actions, their host defaults a select all and
  `selectLineDown`/`Up`.

### Options and demos

- **`Config`**: `selectionLadder`, `selectNodeUp`, `mixedDepths` in a "Selection" group;
  `pasteOverSelection`'s `ignore` covering subtree selections. Drivers declare each app's values.
- **The cm6 demo** (`demos/cm6/main.ts`): Escape, Mod-A and the Shift-arrows bound, the arrows
  checking visual rows in §4.3's order (`selectByNode`); block chrome (`blockSelection`: a line
  decoration per root's line, `ourus-blocks` on the editor hiding the native highlight); drag
  escalation (`escalateDrags`, a filter on `select.pointer`) behind the header's "Blocks on drag".
  The smoke test (`demos/cm6/smoke.ts`) plays the keys and checks the chrome. **The textarea demo**:
  the same keys, no chrome.

### What the SxS measured

- **No existing case got worse** in any app, against the judgment committed before this work, but
  ten cells of the redrawn block cases: Obsidian, Live Preview and Outliner on Indent9 and Indent27
  (their Tab inserts the indentation at the selection's start, which leaves column 0: the selection
  only), and true-outliner on Indent9, MoveDown11, MoveUp10 and Outdent10 (its own reading of a
  selection ending at the next line's start, §5.2).
- **true-outliner agrees on 16 of the 19 `select.md` cases it plays**: the whole ladder, the
  Shift-arrows growing and shrinking across depths and past the anchor, the folded node, the zoom's
  top, Ctrl-A then Shift-Down. It differs on Select16 (its Shift-Up from a two-line node's first
  line goes to the line's start first, where Logseq, Logseq DB, Tine, Dynalist and RemNote select
  the node), Select17 (from a blank line it takes the node above) and Select18 (from a text-start
  selection over `b` and `c` it keeps `b` alone).
-  **The options**: `selectionLadder: parents` agrees press for press in Logseq and Tine, `top` in
  Roam, Tana, WorkFlowy and SiYuan; `selectNodeUp: sibling` in Dynalist and both RemNotes (WorkFlowy
  and SiYuan a press behind: their first Shift-Up selects text in the line);
  `pasteOverSelection: ignore` in Tana (the Logseqs, Athens and Tine paste nothing; Roam replaces);
  `mixedDepths: level` in Tine and Logseq DB (which also makes the node after a moved root its
  child), `each` in WorkFlowy, Roam and Tana on indent, `refuse` in Athens and SiYuan.
-  **The block apps on the rest**, as §2 has them: typing over a block selection ignored, paste over
  one ignored, Ctrl-A ladders as §2.2, Tine's first Shift-Down taking two nodes, Dynalist and
  RemNote pulling in the parent; and, newly measured, Shift-Enter over blocks (§7), Tine's Backspace
  over a block selecting the next one, Ctrl-A in fenced code (seven setups take the content between
  the fences first, rung 1's).
