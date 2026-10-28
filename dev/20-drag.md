# Drag and drop: the design (2026-10-27)

A design, since built (each step's "Built" note): what the hosts need from ourus to drag nodes,
what ourus offers them, and how the spec says it, with node labels (`①`) that any case can use; and
the indent unit (`indentUnit`), designed with it.

## Contents

- [1. The two hosts in `demos/`](#1-the-two-hosts-in-demos)
  - [1.1 obsidian-outliner](#11-obsidian-outliner)
  - [1.2 obsidian-true-outliner](#12-obsidian-true-outliner)
- [2. What other editors need](#2-what-other-editors-need)
- [3. The model](#3-the-model)
  - [3.1 The operand](#31-the-operand)
  - [3.2 A place](#32-a-place)
  - [3.3 What the run becomes at a place](#33-what-the-run-becomes-at-a-place)
  - [3.4 The caret, and the place it came from](#34-the-caret-and-the-place-it-came-from)
  - [3.5 Other drops](#35-other-drops)
- [4. The API](#4-the-api)
  - [4.1 Commands (`types.ts`)](#41-commands-typests)
  - [4.2 The host's drag (`nearestDropPoint`, a helper)](#42-the-hosts-drag-nearestdroppoint-a-helper)
  - [4.3 Columns](#43-columns)
  - [4.4 Files](#44-files)
  - [4.5 The spec's actions, as calls](#45-the-specs-actions-as-calls)
- [5. The spec](#5-the-spec)
  - [5.1 Node labels](#51-node-labels)
  - [5.2 Actions](#52-actions)
  - [5.3 What a pickup takes and offers](#53-what-a-pickup-takes-and-offers)
  - [5.4 Cases, as they'd be drawn (`spec/drag.md`)](#54-cases-as-theyd-be-drawn-specdragmd)
- [6. The tooling](#6-the-tooling)
  - [6.1 The SxS](#61-the-sxs)
  - [6.2 Built (2026-10-27)](#62-built-2026-10-27)
- [7. Order of work](#7-order-of-work)
- [8. Open, with a recommendation each](#8-open-with-a-recommendation-each)
- [9. Against the plugins' code](#9-against-the-plugins-code)
  - [9.1 obsidian-outliner](#91-obsidian-outliner)
  - [9.2 obsidian-true-outliner](#92-obsidian-true-outliner)
- [10. The indent unit (`indentUnit`)](#10-the-indent-unit-indentunit)
  - [10.1 What ourus does today](#101-what-ourus-does-today)
  - [10.2 The option](#102-the-option)
  - [10.3 Hosts](#103-hosts)
  - [10.4 The spec](#104-the-spec)
  - [10.5 The SxS](#105-the-sxs)
  - [10.6 What it takes](#106-what-it-takes)
  - [10.7 Built (2026-10-27)](#107-built-2026-10-27)

## 1. The two hosts in `demos/`

### 1.1 obsidian-outliner

Read in `src/features/DragAndDrop.ts` and `src/operations/MoveListToDifferentPosition.ts`.

- **The gesture is the host's**: a mousedown on `.cm-formatting-list`, `.cm-fold-indicator` or a
  task checkbox (desktop only); the first mousemove starts the drag; mouseup drops; Escape cancels.
- **Destinations are list items only**: for every item, `before` it and `after` it (at its level),
  and `inside` it only where it has no children (as the first child). Keyed `line level`, so two
  variants at one line and level are one. The dragged item offers no `inside`, and its own subtree
  is visited no further.
- **Resolution is pixels**: each variant's top is its line's `coordsAtPos` (plus the line's height
  for `after`), its left `leftPadding + (level - 1) * tabWidth`; the nearest row by y, then the
  nearest variant on that row by x.
- **The preview**: the dragged lines get a line decoration, a drop line is drawn at the variant's
  top and left, and the new parent's first line gets another decoration.
- **The drop**: parses again, and refuses ("the page content changed during the move") unless the
  root prints the same. Then one operation: remove, add before/after/first-inside, reindent the
  subtree to the destination's indent, renumber, and the caret, if it was between the moved list and
  the destination, travels with its node; if not, it goes to the moved list's last line (so the view
  does not scroll away).
- **Its spec** (`specs/features/DragAndDrop.spec.md`): six cases, the gesture by coordinates
  (`drag {line, ch}`, `move {line, ch, offsetX, offsetY}`, `drop`) and the buffer before and after.

What it needs from ourus: the places an item can go, with the line and depth of each (it does its
own pixels), and a move to one of them that is one change, renumbers, and carries the caret. Its
places are a subset of ourus's (§3.2): items among items.

### 1.2 obsidian-true-outliner

Read in `src/drop-destinations.ts`, `src/plugin/drag-*.ts`,
`openspec/specs/node-dragging/spec.md` and `docs/research/node-drag-and-drop.md`.

A full design, measured in real vaults over several passes, of which the points that bear on a
core:

- **A destination is a seam and a depth.** A seam is a boundary between two *nodes* (never rendered
  rows: none inside a table, a fence, a wrapped paragraph, or on both sides of a blank line). Its
  depths run from the depth of the node below to one inside the deepest trailing descendant above
  that can hold children; each depth names a parent and an index. y picks the seam, x the depth,
  both as a partition (nearest, clamped), never a hit test, so no position resolves to nothing.
- **Seams are read with the run taken out**: the seams above and below the run are one, at its top,
  offering the run's own place (a drop there writes nothing, no undo entry); the run's bottom is a
  dead seam that offers nothing, so a pointer resting there cancels rather than moving the run one
  place.
- **Only what the operation accepts is offered**, asked of the operation, not restated: legality
  varies along one seam (a heading run past `h6` at the deeper columns only).
- **No non-heading run right after a heading as its sibling**: it would be inside the section.
- **Folds and zoom are inputs**: the folded ids (the walk stops at a fold; a drop one level inside a
  folded node lands last and opens it), and a zoom scope (no seam outside it).
- **The preview is the release's own result** (their D7): the indicator at the seam (in the middle
  of a gap line under a heading or above an atom), its left end at the column of the mark the run
  will have, that mark as it will be written (a task's box, an ordered item's delimiter, a heading
  converted to an item), the new parent accented, and the count of nodes in flight.
- **Headings absorb**: a heading dropped among siblings takes what follows into its section, and
  the preview draws the absorbed rows where the drop puts them. A heading is re-levelled to its new
  siblings, and gets levels shallower than the seam's bound (beside the heading above, outdented in
  place).
- **A move in one parent is a reorder, not a removal and an insertion** (their 7b: composing the
  two rewrote 21347 of 43937 generated moves: lists loosened, bullets became paragraphs, the final
  line ending moved).
- **The operand is the selection's cover** if the pressed node is one of its roots, else the pressed
  node's subtree (and the selection becomes it); the selection after a drop is the moved cover.
- **A cancelled drag leaves nothing** (Escape, a release on nothing, a lost capture, the document
  changing underneath); one drop is one undo step; edges autoscroll.

What it needs from ourus: all of 1.1, plus per-place legality, what the run becomes there (kind,
marker, level), what the drop would reparent, multi-root operands, folds and a zoom as inputs,
and the selection of the moved nodes.

## 2. What other editors need

ourus serves text-buffer editors with different input models, and a drag is one of several ways to
say "move these nodes there". What differs between them:

- **CM6 in general** (the cm6 demo, other CM6 apps): pointer events on decorated bullets, as
  above; and CM6's own drag of a text selection (`dragMovesSelection`, `dropCursor`), whose drop
  is a position, not a place. A text drag that carries whole nodes or lands between nodes would
  break them as raw text, so ourus has to own it there, as it owns paste: with the commands it has
  (§3.5).
- **Monaco and VS Code**: an extension gets a drop as a position and a `DataTransfer`
  (`DocumentDropEditProvider`), not pointer moves: drops at a position again. A tree view of the
  outline (`TreeDragAndDropController`) drops *on* a node, with no before or after: a place named
  by a parent alone.
- **Tree panes in any host** (an outline sidebar, Obsidian's Outline view, a file-tree-like
  navigator): a place as a parent and an index, from a widget that knows nothing of lines.
- **A textarea, GTK, a TUI**: no layout API, or no pointer at all. The host maps lines to y on its
  own (a mirror element, a cell grid); a terminal's mouse gives cells. Without a pointer, a drag is
  a keyboard mode: pick up, step through seams (Up/Down) and depths (Left/Right), drop (Enter),
  cancel (Escape). The same is what accessibility asks of a pointer gesture (WAI-ARIA's drag and
  drop pattern), with each destination announced in words.
- **"Move to…"** (Workflowy's move dialog, Logseq's, Tana's): a place chosen from a list, often in
  another document.
- **Across documents and apps**: a drag out carries the run's Markdown in a `DataTransfer` (the
  copy's formats); a drop in from another document, another app or the file system is an insertion
  of a clipboard at a place, and the source removes the run if the effect was a move. A copy-drag
  (Alt or Ctrl) duplicates (later, §8.10); a reference-drag (Roam's and Logseq's Alt-drag,
  Obsidian's block embed) is the host's own text, which it inserts as a clipboard.
- **Documents that change during a drag** (sync, a collaborator, a file watcher): a place named by
  node ids survives an unrelated edit, since `doc.update` carries ids; obsidian-outliner refuses any
  change, true-outliner cancels. ourus can do better, where the host gives `doc.update` the edit's
  own changes: ids carry for the lines an update leaves alone (`assignIds`), so a sync or a file
  watcher that replaces the whole text gives every node a new id, and a drop then is `no-such-node`.
  A host gives such a text through `doc.replace(text, marks)`, which diffs it into the lines that
  changed (CM6's own changes are minimal already).
- **Touch**: a dwell and a slop before a press becomes a drag, the host's entirely.

So the core needs: **commands addressed by node ids, not only by the selection; a place as data
(parent and position), from any of a seam, a tree widget, a dialog or a keyboard; a text drop at a
position, from the commands there are (§3.5); the drop targets of a run, pixel-blind, ordered for a
keyboard; each one's outcome, the same one the drop returns; and a payload for the outside**.
Pointer handling, hit testing of marks, the indicator's pixels, autoscroll, folds and touch stay the
host's.

## 3. The model

### 3.1 The operand

The nodes in flight: as a structural command's (`operands`: the topmost nodes the selection touches,
contiguous siblings), with a press: where the pressed node is one of the selection's topmost nodes,
all of them; else the pressed node alone, with its subtree, whatever the selection is. So a
selection across parents (`- a⏎  - «b⏎- c»`, which `operands` finds `non-contiguous`) refuses a
press on one of its own topmost nodes (`non-contiguous`, until §8.3), and not a press elsewhere:
`operands` reports its topmost nodes even where it refuses, for this. Given by ids, the nodes named,
contiguous siblings (`non-contiguous` otherwise). Either way they are then normalized once, and
everything downstream uses the normalized roots (`DropMap.nodes`, the lifted lines, the payload,
`into-itself`):

- **Promoted through textless parents** (`withTextlessParents`, as the moves do): the only contents
  of a quote without a title, or of an item whose first block is on its marker's line, take their
  container with them, which would otherwise be left holding nothing. Ids given explicitly are
  promoted too.
- **Mixed kinds are refused** (`mixed-kinds`), as `structuralOperands` refuses them for the moves,
  in v1. A paragraph and the code block after it would be a common run in free-form text, but no
  root after the first can be fitted "as it would be alone": its neighbour is the root before it,
  not the place (a paragraph root takes in the item root after it, where paragraphs adopt lists),
  and `converts` would speak for the first root only. Later, §8.3.

Roots under different parents (true-outliner's multi-parent cover): later, §8.

### 3.2 A place

**A place is a parent and the sibling the run goes after**, an `InsertionPoint`: `{ parent: id |
'root', after: id | null }` (null: first). It names the same place whatever the run's own position,
needs no index arithmetic around the run, and survives edits elsewhere. What a tree pane or a dialog
says, `before X`, `after X`, `first in X`, `last in X`, reduces to it.

For a move, a place is read with the run taken out, as its seams are (below): `after` is the sibling
the run lands after once it is gone, never one of the run's own roots, so each place has one
`InsertionPoint` (the own place's is the run's previous sibling, or null), which `current` and a
drop point's identity rely on. A place is valid against a document when `parent` is a node of it (or
`'root'`), and `after` is null or a direct child of `parent`; for a move, `after` is not one of the
run's roots and `parent` is not in the run (`into-itself`). Otherwise `invalid-insertion-point`, or
`no-such-node` for an id the document lacks (a stale anchor). The document root is only ever
`'root'`, never a sibling to go before or after. A valid place can
still be one Markdown can't hold: inside a node that holds none, or `after` a heading with a run
whose first root (or a clipboard's) is no heading, which would land in that heading's section,
children or none, since a section has no end but the next heading (below). The drop commands refuse
those themselves (`not-expressible`), by the same check `drag`'s walk leaves them out with, one
function for both: a tree pane or a dialog asks for places no drag offered. Folds and zoom are the
view's, `drag`'s alone.

The places a drag offers are seams, each with its depths, as true-outliner's (§1.2): from the depth
of the node below to one inside the deepest trailing descendant above that can hold children. What
holds children is the outline's, not the kind's: a heading, an item and a quote hold any node; a
block that adopts lists (`doc.adoptsLists`: a paragraph under `listParent: paragraph`, any block, an
atom too, under `block`, none under `container`) holds items, a node of another kind dropped there
converting to an item or refused (§3.3); any other node holds none. Left out of the list: inside a
node that holds none, `after` a heading for a run whose first root isn't one, under a folded node's
hidden children (the host passes the folded ids, `folded`: the place one inside a folded node is its
last), outside the node the host's view is zoomed into (`zoom`: a place's parent is that node or
inside it, so none beside it either, as true-outliner's `scoped` refuses), and the preamble. Nor the
seam between a node and a first child that starts on the node's own first line (`> - a`, `- - a`, `-
# H`): it has no line, so no pointer reaches it and no drawing names it, and the place there (first
in the quote, say) is the API's alone. But a move's own place is always offered, at the run's top,
on whatever seam it falls: dragging `a` in `> - a⏎> - b` (or `- - a⏎  - b`), its own place, first in
the quote, is on just such a seam once `a` is taken out, and leaving it out would move a run set
down where it was. There the own place can share its column with another place of the same seam:
dragging `a` in `- c⏎> - a⏎> - b`, its own place (first in the quote, depth 1) and inside `c` (depth
1) are one column in a host that draws `depth`, and in one that draws `listDepth` it and after `c`
(both 0, the quote no list item) are. The own place takes the column (`nearestDropPoint`'s tie rule,
`current` first), and the place it shares it with is reached by the keyboard and the API only; a
drawing draws the own place, `▹`, and a start's `▸` at that column is the own place (Drag6c). These
are structural, read in one walk. **Offered** is narrower: a place the drop accepts. The places the
drop would refuse (`at-h6-bound` at a deep column, `would-reparent`, `not-expressible`) are found by
running it, so they are in `drag`'s list but never resolved to (`nearestDropPoint`'s `accepts`,
§4.2), and a seam whose places are all refused resolves to nothing, as a dead seam does. What a case
draws is what is offered (§5.3).

**Which seams depends on the operation**, and a drop runs that operation:

| | seams read | the run's top | the run's bottom | inside the run |
| --- | --- | --- | --- | --- |
| move | with the run taken out | its own place (a no-op) | a dead seam (offers nothing) | not offered |
| copy (later, §8.10) | as the document is | a copy before the original | a copy after it | offered (a copy under the original) |
| a clipboard | as the document is | (no run) | (no run) | (no run) |

For a clipboard, its first root decides the heading rule (a heading or not), as the run's
does for the others.

### 3.3 What the run becomes at a place

A drop is a move, as `moveSubtreeUp` is: `draft.remove(run)` then `draft.place` at the place, so a
reorder keeps its lines and `done()` does the blank lines, the numbers, the indentation and the
escapes. Where the place can't hold the run's kind, it converts as indent and outdent convert: a
paragraph or an atom under an item becomes an item (indent's rule 3), an item right after a
paragraph that adopts lists, at the paragraph's depth (where it would read as that paragraph's
child), becomes a paragraph (outdent's); a task there is refused (`not-expressible`), since as a
paragraph its checkbox would be escaped text (tasks.md), its state lost (true-outliner's 6h found
the same and refuses it too). A heading keeps its form where its parent is a heading, a quote or the
document, re-levelled to its new siblings (the nearest heading sibling's level; where none gives
one, one inside a heading parent, and under a quote or the document, which have no level, its own),
the headings of its section shifted with it, refused past `h6` (`at-h6-bound`); under an
item or a paragraph it is refused (`not-expressible`), as indent never makes a heading an item.
true-outliner makes it an item with the `#`s as text, its paste's answer; §8.

An item dropped among items of another kind (a `- x` among `1.` items) keeps its own form, as a move
keeps it (13-align §11): a list of its own there, the ordered list split around it, the items after
it keeping their numbers (`2.` on, as written: guarantee 2 keeps an untouched list's numbers, and
restarting them is the unbuilt `pastedNumbering`). `pasteAt` takes the form `pasteListForm` says, as
paste does (the destination's by default, `own` its own), so by default the same item moved and
pasted to one place differ, as Alt-↑ and paste do now. A drop is a move, and true-outliner's preview
draws a dragged ordered item's own delimiter.

A drop gives other nodes new parents only as guarantee 4 lets the moves (MoveUp35, MoveDown25):
where the block above a list adopts lists (`doc.adoptsLists`: a paragraph under `listParent:
paragraph`, any block under `block`), it takes in a list the drop leaves right after it, where the
run lands (a paragraph dropped right before a list; under `block`, a code block dropped between a
heading and its section's list) and where it left (a code block dragged out from between a paragraph
and its list). A heading whose section would take in what follows the place is refused
(`would-reparent`), as the moves refuse it. true-outliner absorbs; it would set an option for that
(§8). The preview draws what a drop reparents as the result has it, and the inverse pairs expect a
drop back to differ where the first reparented (guarantee 5: its outline, where Markdown forces a
difference), or to find its place gone.

**Then the result is checked**, beside the rules: after `done()`, the run's roots are under the
parent asked, at the place asked, and every other node is under the parent it had, but for the
adoption guarantee 4 lets in (a list taken in by the block above it); otherwise the drop is refused:
`not-expressible` where the run itself didn't land as asked, `would-reparent` where another node's
parent changed, each with the `detail` `result check`. The rules say what a drop means, and
`converts` needs them; the check catches a normal form that moves a node no rule names, as a
refusal rather than a wrong write. Such a refusal is a gap in the rules, not an outcome: the
exhaustive test fails wherever the check refused and no rule did (§6), and each becomes a rule with
a case, or a writer fix.

### 3.4 The caret, and the place it came from

The caret goes with the text it is in, moved or not, as the move commands carry it; for every drop,
pastes too, whose new nodes the caret isn't in. A drop at the run's own place applies
with no changes, and the host commits nothing. Selecting the moved nodes (true-outliner), or
obsidian-outliner's caret at the moved list's end, needs no option: the ids carry, so a host that
wants either takes the result's `placed` (the topmost nodes the drop put in place, in document
order: the run's roots for a move, the new roots for a paste), reads their ranges from the
result's `doc` (`doc.node(id)`, `rangeOf`), and commits that selection instead (§9).

A placeholder (an empty node held open, `placeholders.md`) goes as the caret does: one the caret
is in travels with its node, in the run or not, and one the drop leaves off the caret's line is
settled after it, as after any command (the host's `settlePlaceholders`, contract 3). true-outliner
carries its open place through a drop the same way (`placeLine`, `planStructural`).

### 3.5 Other drops

- **A copy** (later, §8.10): would be `duplicateSubtreeTo`, `duplicateSubtree`'s copy with new ids
  at the place, its points the table's copy row.
- **A clipboard** (`pasteAt`: from another document, another app, the file system): the formats
  read as `paste` reads them, fitted at the place as paste fits them into the slot at a caret
  (`fitToList` in a list), new ids; but a heading among them whose section would take in what
  follows the place is refused (`would-reparent`, Drag11), where a paste at the caret takes it in
  (Paste10): a drop is aimed, and its preview shouldn't change rows it doesn't point at.
- **Text, at a position** (CM6's drag of a selection, VS Code's drop edits, `beforeinput`'s
  `deleteByDrag` and `insertFromDrop`): no drop command of its own, for now. A host plays it with
  two: the dragged range deleted by `deleteByDrag`, the deletion a cut makes (`deleteSelected`,
  exported as a command under the Input Events name): across nodes as Backspace deletes a selection,
  and within one node's text taking with it the blanks it leaves at a line's text start and the line
  break of a line it empties, which a raw delete would leave as structure (`b` out of `a⏎b⏎c`
  leaving two paragraphs, an item loosened, spaces become code); the drop position mapped through
  that change (`mapPos`; a drop inside the range, or at its ends, does nothing); then `paste` at the
  mapped position, its clipboard the dragged text as the editor's own drag carries it (the range's
  slice as `text/plain`, not ourus's `copy`, which under `copySelection: nodes` would take whole
  nodes), read as paste reads any text (one line goes in as text); the two committed as one
  transaction (their change sets composed), one undo step: a cut and a paste, as their commands make
  them. Where a half isn't applied: deferred (`deleteByDrag` outside prose, in a code block, or
  where ourus doesn't do the case yet; `paste` where it is the host's), the host runs its own
  default for that half, and a deletion that was the host's goes through `doc.update` before the
  drop position is mapped and `paste` runs; rejected, the whole drop is cancelled, the deletion
  never committed alone, or the dragged text would be lost. A command for it comes back with the
  first host that needs more than this (`moveTextTo`, cut for now: it would carry the selected text
  exactly, whatever `copySelection` says).
- **Out to another document**: the payload is the `drag` result's clipboard, the run's copy (every
  format, marked as ourus's), whose `text/plain` is the run's Markdown as exported. On a move effect
  the source removes the run with `deleteSubtree` by its ids, **and only if the run's Markdown is
  still what was exported** (`expectMarkdown`); else the removal is refused (`content-changed`), and
  the source keeps its run: two copies, nothing lost. Surviving ids alone aren't enough: a sync that
  added a child or some text to the run during the drag would have it deleted without having been
  carried. Within one document, a move by ids moves the run as it is, so an edit to it during the
  drag goes with it.

## 4. The API

The gesture (pickup, hover, release, cancel) is state, and it lives in the host, as every editor
state does; in the spec, in the player. `src/commands/` keeps its shape: **commands, each one call,
pure, committed by the host**. A pickup is one of them, `drag`, which changes nothing and returns
what the drag needs, as `copy` changes nothing and returns the clipboard; a drop is another,
`moveSubtreeTo` or `pasteAt` (a text drop is `paste`'s, §3.5). Nothing in ourus holds a drag between
them, and neither needs the other: a drop runs without a `drag` before it.

### 4.1 Commands (`types.ts`)

```ts
/** A place in the outline: under `parent`, right after the child `after` (null: first). */
export type InsertionPoint = { readonly parent: number | 'root'; readonly after: number | null };

/** The nodes a command acts on, by id; without it, the selection's operands. */
type Nodes = { readonly nodes?: readonly number[] };

export type Command =
  | ({ readonly type: 'indent' } & Nodes)            // and outdent, moveSubtreeUp/Down,
  | ...                                              // duplicateSubtree, copy, cut: `& Nodes`
  | ({ readonly type: 'deleteSubtree'; readonly expectMarkdown?: string } & Nodes)
  /**
   * A pickup: the run, the places it can be dropped, and its clipboard. `pressed`: the node whose mark
   * was pressed, for the cover rule (§3.1); else `nodes`, else the selection's operands. `folded`: the
   * nodes whose children the host hides; `zoom`: the node the host's view is zoomed into (§3.2).
   */
  | ({ readonly type: 'drag'; readonly pressed?: number; readonly folded?: readonly number[]; readonly zoom?: number } & Nodes)
  /** A drag from outside, carrying `clipboard`: the places it can be dropped. */
  | { readonly type: 'drag'; readonly clipboard: Clipboard; readonly folded?: readonly number[]; readonly zoom?: number }
  /** A drop of the document's own nodes: the run moved to the insertion point `to` (§3.3). */
  | ({ readonly type: 'moveSubtreeTo'; readonly to: InsertionPoint } & Nodes)
  /** A drop from outside: the clipboard read as `paste` reads it, fitted at `at`. */
  | { readonly type: 'pasteAt'; readonly at: InsertionPoint; readonly clipboard: Clipboard }
  /** A text drag's first half: the selection deleted as a cut deletes it (`deleteSelected`, §3.5). */
  | { readonly type: 'deleteByDrag' };

export type RejectReason =
  | ...
  | 'no-such-node'             // an id the document doesn't have (it changed during the drag)
  | 'invalid-insertion-point'  // `after` isn't a child of `parent`, or is one of the run's roots
  | 'into-itself'              // a move to a place inside the run
  | 'content-changed';         // deleteSubtree's `expectMarkdown` no longer holds

export type CommandResult =
  /** `dropMap`: the pickup, for a `drag` command (its `changes` empty, as copy's). `placed`: for a
   * drop, the topmost nodes it put in place, in document order: from the draft's `placedIds`,
   * without the nodes whose ancestor is placed too, sorted by where they start in the new text. */
  | { readonly status: 'applied'; ...; readonly clipboard?: Clipboard; readonly dropMap?: DropMap; readonly placed?: readonly number[] }
  | ...;

/** What a `drag` returns: the run, its lines, and every seam it can be dropped at, with their drop points. */
export interface DropMap {
  readonly nodes: readonly number[];                  // the run's roots, normalized (§3.1); [] for a clipboard
  readonly lines: readonly (readonly [number, number])[];   // their lines, [from, to), for the lifted decoration
  readonly seams: readonly DropSeam[];                // in document order
}
/** A boundary between two adjacent nodes, never inside one: where a drop line is drawn. The pointer's y picks one. */
export interface DropSeam {
  readonly beforeLine: number;              // the first line of the node below, past the gap's blank lines (the line count at the end)
  readonly nodeAbove: number | null;        // the nodes flanking it, by id
  readonly nodeBelow: number | null;
  readonly gapLines: number;                // blank lines between them, for where the indicator goes
  readonly points: readonly DropPoint[];    // shallowest first; [] for a move's dead seam
}
/** One place at a seam, at one depth (child of the node above, its sibling, its parent's...): the pointer's x picks one. */
export interface DropPoint extends InsertionPoint {     // `parent`, `after`: the place
  readonly depth: number;                   // the depth the run's roots take there
  readonly listDepth: number;               // how many list items the place is inside (§4.3)
  readonly current: boolean;                // a move's own place: a drop there changes nothing
  readonly converts: boolean;               // the run's first root changes kind there (§3.3), read structurally
  readonly drop: Command;                   // the drop there: moveSubtreeTo or pasteAt, the run's ids or the clipboard and the point filled in
}
```

All of them go through `executeCommand(doc, command, selection)` and return a `CommandResult` as
every command does; `selection` is the host's, for the cover rule and for the caret to travel with
its text.

- **`drag`** is `applied` with no changes, as `copy` is, carrying `dropMap` and, for the document's
  own nodes, `clipboard`: the run's every format for a `DataTransfer` (copy's, with `nodes`), whose
  `text/plain` is the Markdown a move to another document later passes `deleteSubtree` as
  `expectMarkdown`: `expectMarkdown` is compared with what `copy` of those nodes gives then, the
  same reading, not with the document's own lines (a copy re-bases indentation and numbers). It is
  refused as a structural command is (`no-such-node`, `non-contiguous`, `mixed-kinds`). Whether a
  press is a node drag or a text drag is hit testing, the host's: a press on a node's mark is
  `drag`, one in selected text the host's own drag, dropped as §3.5 says.
- **A drop** needs no `drag` before it: a tree pane, a "move to" dialog or a test builds a place and
  runs `moveSubtreeTo`; the command checks the ids and the place (`no-such-node`,
  `invalid-insertion-point`, `into-itself`, `not-expressible` for a place Markdown can't hold),
  normalizes the nodes (§3.1), and checks its result (§3.3) on its own. A drop at
  the run's own place is `applied` with no changes. A drop point's `drop` is that command, ready, so
  a host that dragged needs no mapping from what it picked up to a command.
- **`nodes`** on a structural command stands for the selection's nodes, so a context menu, a tree
  pane or a "move to" dialog can act on nodes the caret isn't in.

### 4.2 The host's drag (`nearestDropPoint`, a helper)

One helper beside the commands, for the pointer: it reads no document.

```ts
/** The drop point of `seam` nearest `x` that `accepts` takes, trying outwards from the nearest, where columns tie the current place, then one that doesn't convert, then the deeper; or null. */
export function nearestDropPoint(seam: DropSeam, x: number, columnX: (t: DropPoint) => number, accepts: (t: DropPoint) => boolean): DropPoint | null;
```

The host's drag, in full:

```ts
// press on a bullet, past the threshold
const picked = executeCommand(doc, { type: 'drag', pressed: doc.nodeAtLine(line).id, folded }, selection);
if (picked.status !== 'applied') return;                                  // refused: nothing to drag
const { dropMap, clipboard } = picked;                                    // clipboard: into the DataTransfer
const results = new Map<DropPoint, CommandResult>();                      // the host's cache, for this drag
const resultOf = (t: DropPoint) => results.get(t) ?? results.set(t, executeCommand(doc, t.drop, selection)).get(t)!;
// pointer move
const seam = dropMap.seams[nearest(y, dropMap.seams.map((s) => yOfLine(s.beforeLine)))];
const point = nearestDropPoint(seam, x, (t) => left + t.listDepth * unitWidth, (t) => resultOf(t).status === 'applied');
// draw from resultOf(point): the moved node's kind, marker and line in result.doc
// release
if (point) commit(resultOf(point));                                       // the same result the preview drew
```

- **`seams` is structural and cheap** (one walk); a check is a command (1.6–3.6 ms at 10k lines,
  `bench.ts`), so the host runs it for the drop point under the pointer only, when it changes, and
  keeps it; `nearestDropPoint` asks `accepts` from the nearest column outwards, so a refused column
  resolves to the nearest accepted one on the same seam, and a seam with none to nothing.
  true-outliner checks every one up front; a host may, at that cost a check: a few hundred points,
  a second or so before the drag can show anything.
- **The preview is the result**: the host draws from the `applied` result it will commit, so the
  preview can't disagree with the drop, and a host can even draw the resulting text.
- **A changed document**: the host runs `drag` again on the new `doc` with the run's ids (`nodes:
  dropMap.nodes`, no `pressed`), and drops its cache; or it just runs the drop, which needs no
  targets: a place keeps naming the same nodes, and a drop whose ids are gone is `no-such-node`.
- **A keyboard drag** steps through `seams` and their points, skipping seams with no accepted
  point (the dead seam among them); a point's `parent` and `after` name what to announce.
- **A drop point is an insertion point**, with what only a drag needs beside it: a host passes one
  wherever an `InsertionPoint` goes, and accents `doc.node(point.parent)`.
- **A text drag** is the host's own drag of the selection, dropped through `deleteByDrag` and
  `paste` (§3.5).
- **A drop from outside is a position or a place, by where it lands**: over a node's text it is a
  position, and `paste` there puts it into that text as paste does; anywhere else, a gap, a margin,
  a node's mark, it is a seam, and `drag` with the `DataTransfer`'s formats as its `clipboard` gives
  the places, `pasteAt` the drop. The host's hit test decides, as for a press.
- **On HTML5 drag events** (`dragstart`, `drop`), where every drop carries a `DataTransfer`, the
  host knows a drag it started by the state it keeps, and runs that drop point's `drop`; a drop it
  didn't start is from outside, a position or a place as the bullet above says.

### 4.3 Columns

- **Two columns, for two purposes.** A drop point's `depth` and `listDepth` are structural, known
  before any check, and are what the pointer resolves against. `depth` is the run's depth in the
  outline there, every kind of parent counted, for hosts that indent every node by its depth
  (true-outliner, whose headings indent). `listDepth` counts only the list items the place is inside
  (0 at the top level, in a heading's section, in a paragraph's own list), for hosts that indent
  only lists, as Markdown does (obsidian-outliner's `leftPadding + (level - 1) * tabWidth`, its
  `tabWidth` measured off the editor). Not a text column: with tabs, or markers of different widths
  (`- `, `10. `), a column in characters isn't a position on screen, and the unit's width is the
  host's to measure. Neither promises the written column. **What is written** (the line the run
  lands on, its marker and its width after renumbering, its kind after conversion, its heading
  level) is read from the result, and the preview draws that. The indicator may sit a character off
  the written mark (a `10.` against a `9.`); the resolution never depends on a check.
- **Columns that coincide.** Two points of one seam can share a column in a host that draws only
  lists: after a paragraph's list, the list's next item and a block after the paragraph are both at
  `listDepth` 0; between paragraphs `p` and `q`, a dragged `x`'s own place and a child of `p` (`x`
  as an item of a list of `p`'s) are too. On screen they are one place, and `nearestDropPoint`
  takes, of points whose `columnX` ties: the `current` one, so a run set down where it was never
  moves (Drag6's guarantee); else one that doesn't `convert` the run, so a run keeps its kind
  where the screen can't say otherwise (an item after a list joins it; a paragraph after a
  paragraph's list stays a paragraph); else the deeper. The others stay reachable from the keyboard,
  and by pointer in a host that draws `depth`, where they don't tie. `converts` is structural, read
  from §3.3's rules at the pickup, not from a check; the check's result is what the preview draws,
  and the two agree (a test checks every point's `converts` against its result's kind).
- **The pixels stay the host's**: it maps `seam.beforeLine` to a y (CM6 `coordsAtPos`, a mirror in a
  textarea, a cell in a TUI), `depth` or `listDepth` to an x.

### 4.4 Files

- `types.ts`: `InsertionPoint`, `Nodes` on the commands, the new commands and reasons, `DropMap`,
  `DropSeam`, `DropPoint`.
- `util.ts`: the run's normalization (§3.1), shared by `drag` and the commands with `nodes`,
  beside `operands`.
- `drag.ts`: `dragCommand` (the cover rule, the seams and their drop points, the clipboard through
  `copy.ts`), and `nearestDropPoint`.
- `move-subtree-to.ts`: `moveSubtreeTo` (`draft.remove`, then `place`/`append`, and the fitting of
  §3.3).
- `paste.ts`: `pasteAt`, its fitting at a place rather than at the caret's slot (`fitToList`).
- `copy.ts`: `deleteByDrag`, its `deleteSelected` dispatched as a command.
- `index.ts`: the dispatch (`drag` and the drops are structural, not in `HOST_HAS`: where ourus
  doesn't do one, `unsupported`; `deleteByDrag` is in it, as `cut` is, so where ourus doesn't do it
  the host deletes), and the exports.

### 4.5 The spec's actions, as calls

| spec action | what the player calls |
| --- | --- |
| `move ②` | the gesture: `drag { pressed: ② }` for the run (the cover rule), then `moveSubtreeTo { nodes, to }`, `to` the `▸`'s place (its seam and its column's depth, read as `drag` reads places, refused ones too) |
| `move` | `moveSubtreeTo { to }`: the selection's nodes |
| `pasteAt` | `pasteAt { clipboard, at }`, the config block's clipboard |
| `drag ②`, `drag` | `drag`, its result checked: `dragNodes:`, `dropPoints:`, `clipboard:` |

## 5. The spec

A drop is one action, the whole gesture, as the other commands are: a press, a move and a release
can't be split over steps, which an app can't play either (§6.1). So the spec has no pickup that a
later step drops, and the player keeps nothing between steps. What's in flight is said as a user
says it: a node's mark pressed (a label), or the selection drawn; where it goes, drawn too, a `▸` in
the start. A case drops once. `drag` stays, for what a pickup alone shows: the nodes it takes and
the places it offers.

### 5.1 Node labels

A circled number at the end of a node's first line, `①` to `⑳` then `㉑` to `㊿` (U+2460–2473,
U+3251–325F, U+32B1–32BF), labels that node, and is no part of the text:

```buffer
- a┃①
- b②
  - b1③
```

- **Where**: last on the node's first line, after everything else drawn there (the text, a
  trailing `␠`, the caret, a selection's end, a placeholder), before its line ending (`␍`
  included); anywhere else the reader refuses it. Where two nodes start on one line (a quote
  container and its first paragraph), one label names the innermost, and a second before it the one
  outside it (`> a①②`: ① the quote, ② the paragraph).
- **In a start**, a label names the node there. **In a step's buffer**, a label the case has seen
  checks that the node on that line has the same id (② moved here; Enter's first half kept ①'s
  id), and a new one checks the node was made by that step, then binds it for the steps after.
  Made by the step means its id is at least the `nextId` of the document before the step (ids are
  given in increasing order in a lineage, and a draft's new nodes take them from there): not
  merely one no label is bound to yet, which an old, unlabelled node would also pass. A node that
  existed before is labelled in the start, or not at all. A node drawn without a label isn't
  checked; a label not drawn isn't either.
- Labels are optional everywhere and change nothing where absent, so every case today stands. They
  are the only way to say identity in a case, which the commands already keep (`commands.test.ts`
  checks ids by hand): Enter, joins, moves and paste can say it too.
- `outline:` draws a label after a node's text where the buffer has one (`item: a ①`).

### 5.2 Actions

| action | what the user does |
| --- | --- |
| `move ②` | presses ②'s mark and drops it at the start's `▸`: ② with its subtree, or, where ② is one of the selection's nodes, all of them (the cover rule, §3.1) |
| `move` | moves the selection's nodes to the `▸`, as a keyboard drag or a "move to" dialog does |
| `pasteAt` | drops something dragged in from outside, the config block's clipboard, at the `▸` |
| `drag ②`, `drag` | picks up and holds, for a step to check what the pickup takes and offers (§5.3); the document is unchanged |

`move` is the spec's name for the gesture, as typing is `"text"`: a drop is what the user does,
press, move and release, and the player plays it as `drag` then `moveSubtreeTo` (§4.5); the
command's name is the API's.

**Where a drop lands is drawn**, as `dropPoints:` draws it (§5.3): a line holding one `▸` in a
start's buffer, in the gap where the drop line would be, at the column the run's first root's mark
would land (twice the depth: 0 at the top level, 2 one level in; under `# H`, 2 is inside H's
section). The marker line is a seam line, no part of the text: the reader takes it out before the
buffer is read, keeping its gap and its column, as it keeps the caret's place. It holds `▸` (and, in
`dropPoints:`, `▹`) and spaces only, and sits at a seam: between two lines of one node (a wrapped
paragraph's, a fence's) there is none, which is an error in the case. A gap with blank lines in it
(they are the node above's) is one seam, and its marker line sits right after the node above's last
line, before them (Drag8): one place to draw it, so `redraw` is stable.

```buffer
▸
- one
  - two
- three┃③
```

> move ③

Only the pressed node needs a label; where it lands is the drawing's.

**From a marker to a place**, one function, in `drag.ts`, which `drag`'s walk, the player and
`probe` all use. The gap and the column, `2 × d` (an odd column is an error in the case), read with
the run taken out (for a move) and the folded nodes' children hidden (`folded`: the node above a
folded subtree is the folded node, not its last hidden descendant), give:

1. the node above the gap, `A`, and below it, `B` (none at the document's ends), outside the run;
2. depth `d` deeper than `A`'s plus one: an error in the case, as no parent is there;
3. `d` shallower than `B`'s depth: an error in the case, as the place is not at this gap (it would
   be after `B`'s parent's whole subtree), and `drag` offers it nowhere;
4. else the parent is `A` itself (`d` one deeper than `A`), or `A`'s ancestor at depth `d - 1`, or
   the root (`d` 0), and `after` is the parent's child that `A` is or is inside, none where the
   parent is `A` itself: an `InsertionPoint`, which the drop then runs, and refuses where it
   refuses (inside a node that holds none, a heading under an item: Drag9).

A marker among the run's own lines, by its depth against the run's:

- **in a gap inside the run** (between its roots, or a node of it and the next): at the run's depth,
  its own place (Drag5c); deeper, `into-itself`, under the run's node just above the marker;
  shallower, an error in the case, as step 3's;
- **in the run's top gap**: at the run's depth, its own place, before steps 1–4 read it (which,
  where the run's top is a node's first line, `> - a` dragging `a`, would name the node above);
- **in the run's bottom gap**: deeper than the run, `into-itself`, under its last node, as deep as
  one inside that node's deepest trailing descendant (deeper, an error in the case, as step 2's);
  else the gap the run leaves once taken out, read by steps 1–4 (at the run's depth that is its own
  place; in `- a⏎  - b⏎▸⏎- c` dragging `b`, the top level after `a`, as drawn). The dead seam is the
  pointer's, not the place's: a drop drawn there is the place it names.

**A case drops once**, at its start's `▸`: a step's buffer is a check of the state, and the next
action plays on the state itself, not on a drawing, so only a start can draw where a drop goes. A
round trip is the inverse pairs' (§6), every drop and the drop back to where the run was; a drop
back to where it came from is a case of its own, its `▸` at the run's own place (Drag6b). A start
with a `▸` and no drop, a drop with no `▸`, and a second drop are errors in the case. A place only
the API can name (one anchored on a node of the run, `invalid-insertion-point`; a stale anchor; the
root as a sibling) is `commands.test.ts`'s.

`result:` checks a drop as any command (`applied`, `rejected into-itself`, ...). The config block
takes the host's view: `folded: ②` (labels, space-separated), `zoom: ①`.

### 5.3 What a pickup takes and offers

After a `drag` step, its `yaml` block may check:

- `dragNodes:` the run, the labels of its roots after the cover rule and its promotion (§3.1):
  `dragNodes: ① ②`;
- `dropPoints:` every place it offers, drawn as a drop indicator shows them (below);
- `clipboard:` the payload, as after a `copy`.

`dropPoints:` is a literal block: the buffer's lines as they are (no caret, labels optional), with
a line of markers in each gap a drop can land in, where the drop line would be drawn:

- `▸` is a place the run can be dropped, at the column its first root's mark would land: column 0
  at the top level, 2 one level in, 4 two levels in (twice the depth, whatever the buffer's own
  indentation: under `# H`, a `▸` at column 2 is inside H's section);
- `▹` is the run's own place: a drop there changes nothing;
- a gap that offers nothing has no marker line: the run's bottom, and a gap whose places the drop
  would all refuse;
- a marker line sits right after the node above's last line, before the gap's blank lines.

```yaml
dropPoints: |
  ▸
  - a①
  ▹ ▸
  - b②
  - c③
  ▸ ▸
```

Dragging `b`: above `a`, at the top level; between `a` and `b`, where `b` is (`▹`), or one level in,
`a`'s child; nothing between `b` and `c`; below `c`, the document's end, or `c`'s child. Markers
further right are deeper: on one marker line, x picks the depth. What is drawn is what is offered
(§3.2): the player runs every place's drop and draws the accepted ones, and a `dropPoints:` block is
the whole set but one: where the own place shares its column with another point (§3.2, Drag6c), only
`▹` is drawn, and the other is the keyboard's and the API's. Which marker a pointer resolves to,
ties included (§4.3), is `nearestDropPoint`'s unit tests', not the spec's: it is pixels. Each marker
is one drop a start can draw, the same glyph at the same column (§5.2): a case that wants a marker's
result draws it there and drops.

### 5.4 Cases, as they'd be drawn (`spec/drag.md`)

Drawn as the design expects; `probe` settles each once the commands exist, and the numbers are
a draft's.

Pressing a node's mark and dropping it at the top, its children with it, its caret too
(obsidian-outliner's first case), and again with the caret elsewhere, which stays where it is (its
third):

````md
## Drag1

```yaml
tags: core
```

```buffer
▸
- one
  - two
- three┃③
```

> move ③

```buffer
- three┃③
- one
  - two
```

## Drag2

```yaml
tags: core
```

```buffer
▸
- one
  - two┃
- three③
```

> move ③

```buffer
- three③
- one
  - two┃
```
````

Into an item, as its last child (the way back is the inverse pairs'):

````md
## Drag3

```yaml
tags: core
```

```buffer
- one┃①
- two②
  ▸
- three
```

> move ①

```buffer
- two②
  - one┃①
- three
```
````

The cover rule: a press on a selected node takes the selection's nodes, and the selection goes
with them; a press on another takes it alone, and the selection stays:

````md
## Drag4

```yaml
tags: common
```

```buffer
- «a
- b»②
- c
▸
```

> move ②

```buffer
- c
- «a
- b»②
```

## Drag5

```yaml
tags: common
```

```buffer
▸
- «a
- b»
- c③
```

> move ③

```buffer
- c③
- «a
- b»
```

## Drag5b

```yaml
tags: edge
```

```buffer
- «a
▸
- b»
- c③
```

> move ③

```buffer
- «a
- c③
- b»
```

## Drag5c

```yaml
tags: edge
```

```buffer
- «a
▸
- b»②
- c
```

> move ②

```yaml
result: applied
```

```buffer
- «a
- b»②
- c
```
````

Dropped inside the selection, a run pressed outside it lands between the selected nodes, and the
selection, its ends each with its text, covers it then too (Drag5b): a host that selects otherwise
does it from `placed` (§3.4). A run that is the selection, dropped between its own nodes, is at its
own place, read with the run taken out (Drag5c); one column in, the place is inside it,
`into-itself`.

What a pickup offers: its own place (the way out of a drag) and a dead seam at its bottom; and a
drop at its own place, which changes nothing (were the sibling place there not offered, the nearest
would move the run under `a`). Then a run below a deep subtree, whose top offers each depth from the
document's (where it is) to inside `c`, and under it nothing:

````md
## Drag6

```yaml
tags: core
```

```buffer
- a①
- b┃②
- c③
```

> drag ②

```yaml
dragNodes: ②
dropPoints: |
  ▸
  - a①
  ▹ ▸
  - b②
  - c③
  ▸ ▸
```

## Drag6b

```yaml
tags: core
```

```buffer
- a
▸
- b┃②
- c
```

> move ②

```yaml
result: applied
```

```buffer
- a
- b┃②
- c
```

## Drag6c

The own place at a seam with no line of its own shares its column with inside `c`, and takes it:
inside `c` is the keyboard's and the API's there.

```yaml
tags: rare
```

```buffer
- c
> - a┃②
> - b
```

> drag ②

```yaml
dropPoints: |
  ▸
  - c
  ▸ ▹
  > - a
  > - b
  ▸ ▸ ▸
```

## Drag7

```yaml
tags: common
```

```buffer
- a①
  - b②
    - c③
- d┃④
```

> drag ④

```yaml
dropPoints: |
  ▸
  - a①
    ▸
    - b②
      ▸
      - c③
  ▹ ▸ ▸ ▸
  - d④
```
````

What the run becomes: a paragraph dropped into an item is an item, as indent makes one, and keeps
its id; a heading where only items stand is refused, drawn where no drop is accepted. The marker
sits before the blank line, which is `a`'s gap: after it would be the same seam:

````md
## Drag8

```yaml
tags: common
```

```buffer
- a
  ▸

para┃②
```

> move ②

```buffer
- a
  - para┃②
```

## Drag9

```yaml
tags: edge
```

```buffer
- a
  ▸

# H┃②
```

> move ②

```yaml
result: rejected not-expressible
```
````

A drop from outside, and one refused:

````md
## Drag10

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```buffer
- a┃
▸
- b
```

> pasteAt

```buffer
- a┃
- x
- y
- b
```

## Drag11

A heading dropped in would take in what follows it: refused, where a paste at the caret takes it
in (Paste10).

```yaml
tags: edge
clipboard: '# H'
```

```buffer
a┃
▸

b
```

> pasteAt

```yaml
result: rejected would-reparent
```
````

A place under the run, a `▸` among the run's own lines at a column inside it, is `into-itself`;
the places a drawing can't name (a mismatched `{ parent, after }`, one anchored on the run, a stale
anchor, the root as a sibling) are `commands.test.ts`'s, through the API.

The rules the file's intro would state, first that applies winning: an id the document lacks,
`no-such-node`; a run that isn't contiguous siblings, `non-contiguous`, or isn't of one kind,
`mixed-kinds` (the run is normalized before its place is read, §3.1); a place anchored on the run,
`invalid-insertion-point`; a place inside the run, `into-itself`; the run's own place, nothing; a
place Markdown can't hold (inside a node that holds none, `after` a heading for a run whose first
root isn't one), a heading under an item or a paragraph, a task where it would be a paragraph,
`not-expressible`; a heading past `h6`, `at-h6-bound`; a heading whose section would take in what
follows, `would-reparent`; else the run moves there, converting as indent and outdent convert, the
caret with its text. Then what a pickup offers: which seams, which depths, the dead seam, folds and
zoom. `pasteAt` gets a section of its own; the source's half of a move to another document
(`deleteSubtree` with `expectMarkdown`, refused as `content-changed`) is `delete-subtree.md`'s.

## 6. The tooling

- **`test/drawing.ts`**: read labels (stripped, kept by line), and a start's `▸` line (taken out of
  the text, kept as its gap and column); draw labels back for the nodes whose ids the case has
  bound, after the caret, so `probe` and `redraw` keep them.
- **`test/specfile.ts`**: an action's label, the `dragNodes:` and `dropPoints:` keys, `folded`
  and `zoom` in the config block; refusals for a misplaced label, a label an action names that the
  start doesn't have, a `▸` with no drop or a drop with no `▸`, a second drop, a marker line not at
  a seam, a `▸` at a column no parent is at, and a `dropPoints:` drawing whose lines, its marker
  lines aside (lines of `▸`, `▹` and spaces only), aren't the buffer's, or whose marker is off an
  even column.
- **`test/player.ts`**: labels to ids and back, through every step, and each step's `nextId` before
  it, for a new label's check (an undo is the host's, `doc.replace`: the text back, the lineage's
  ids only growing, the nodes' as an update carries them, so a node an undo writes again is a new
  one, and a label says so); a drop played as §4.5 says; `dropPoints:` drawn from a `drag`'s
  accepted points (each one's drop run; a seam's markers at `2 × depth`, `current` as `▹`, and where
  `current` shares its column with another point only `▹`) and compared. Nothing is kept between
  steps but the labels.
- **`spec.test.ts`**: labels in an expected buffer checked as §5.1 says; every drop point's
  `converts` against its result's kind; and every point in `drag`'s list, accepted or not, run, a
  `write-failed`, an `unsupported` or a refusal by the result check alone (its `detail`, §3.3) among
  them failing the test: what isn't offered is a refusal, never a hidden bug (a host may skip them;
  a test may not). It starts with a baseline of the failures it finds, as the differential once had,
  each a writer bug to fix down to none: drops reach places no move does (into and out of an item
  whose first block is a quote, a quote's lazy lines), and the writer meets them there first. Moves
  to any distance are new ground for the writer, which today's moves only cross one edge on.
- **`probe`**: `--labels` labels every node of a start and draws the labels through each step, so
  identity can be seen before it is drawn into a case; the drops playable as any action, and `drag`
  printing its `dropPoints:`.
- **The inverse pairs** gain a drop and the drop back to where the run was, at every run and every
  point of the spec's buffers, the way back expected to differ in two places, each by its outline
  alone (guarantee 5): a reparenting drop's (§3.3), and one whose shift spelled a tab again (§10.2:
  under `2`, a run nested with tabs moved by two columns and back comes back in spaces); **the
  differential** compares `moveSubtreeTo` with the last commit's, as every command, its baseline
  expecting the same two.

### 6.1 The SxS

What the drivers did as this was designed (`sxs/lib/driver.ts`, 2026-10-27): an action is a string,
played as the driver's `keys` or its `act`; a driver speaks of its document in block indices
(`Sel.block`, `selected`) or, for a text app, lines; no driver moved the mouse. A drop fits that with
three things. As built, where it differs from the design, each paragraph below says so.

**A drop is one action, played as one gesture.** A held button doesn't survive the end of a
driver's call (true-outliner's research, its 5a), so a pickup in one step and a drop in the next,
with the app read between them, couldn't be played at all: the reason §5 has none.

**The runner resolves a drop; the driver only plays it.** Before the step, from ourus's own state
(its `drag` for the run and its points, the projection for the rows), the runner turns a drop, a
drawn `▸` (already a seam and a depth), into the terms a pointer needs:

```ts
interface Drop {
  readonly action: 'move' | 'pasteAt';      // the spec's action
  readonly press: number | null;            // the row whose mark is pressed; null for pasteAt, or a move of the selection
  readonly rows: readonly number[];         // the rows in flight, after the cover rule (block indices, or first lines)
  readonly seam: { readonly above: number | null; readonly below: number | null };   // the rows flanking the drop line
  readonly depth: number;                   // the column, as a depth (a block's depth is its node's)
  readonly listDepth: number;               // the column, for a text app that indents lists only
  readonly to: { readonly parent: number | 'root'; readonly after: number | null };   // as rows, for an app with a move API
}

interface Driver {
  // ...
  /** The drops it plays; a case with another is skipped. */
  readonly drops?: readonly Drop['action'][];
  /** Plays a drop as its user would, with the real mouse; throws `Unsupported` for a place its gesture can't reach. */
  drop?(page: Page, drop: Drop, settle: () => Promise<void>): Promise<void>;
  /** A block app's: its `load` makes a selection of whole blocks (`Outline.selected`), its `read` reports one. */
  readonly selectsBlocks?: boolean;
}
```

A drop of the selection (`move`, no press) presses the first of its rows; an app that edits no
block after a drop lists `move` in `noCaretAfter`, its outline alone judged.

It plays a drop only while the app is where ourus is. Designed as a check before each drop, built
simpler: a drop is the case's first action (`resolveDrop`; a later one skips, "a drop after other
actions"), where the load's check has seen the app hold ourus's start; and a drop whose rows the
projection merged away (a paragraph in an item's block, `paragraphsInBlock`) skips, "a row no block
holds" (`inBlocks`).

**The gesture is shared.** `lib/drag.ts`: press a row's mark, move in steps past the app's
threshold, along to the seam's y and the column's x, release. Designed with the driver measuring
`handle(row)`, `rowBox(row)` and `columnX(depth)` for it; built as `gesture(page, from, to, settle,
{ threshold, here })`, each driver measuring its own points in the page, where its app's drag code
puts a place (an app's geometry rarely fits a row box and a column: halves of a row, regions, a
ghost's top). What the drivers found of how an app reads a pointer: Logseq nests more than 50 pixels
right of a block's left, as its first child; WorkFlowy takes depth from x, at 0.7 of an
indentation; Dynalist from y, x only for "into" a leaf; RemNote by regions of a row's halves; Tana and
BlockNote by halves of a row alone, with no place inside a leaf. A place a gesture can't reach is
`Unsupported`, skipped as it played (`drop: …`), not failed.

**Per action:** `move`, every app that drags a node: the two Obsidian plugins and every block app
(bare Obsidian, Live Preview, SilverBullet and Emacs drag none); `pasteAt`, ourus's alone still: a
`drop` event made with a `DataTransfer` would measure the driver more than the app. A `drag` step has
no driver: no app shows what it offers, so the runner skips it, as any action a driver has no way to
play.

**What the drivers lacked** (2026-10-27), and how each was met:

- **A selection across nodes, in a block app.** The projection dropped it (`block.ts`: `caretLost:
  'selection across blocks'`) and the plan skipped the start, so the cover-rule cases played in the
  text apps alone. Now a drawn selection from a node's text start to another's end projects to the
  topmost blocks selected (`Outline.selected`), for a driver whose `load` makes one
  (`selectsBlocks`, every block driver).
- **The press's handle.** A bullet (the Obsidian plugins' marks; Logseq, Roam, Tine, Athens,
  Dynalist, WorkFlowy, Tana, RemNote, SiYuan's items), or a handle shown on hover: BlockNote's side
  menu, SiYuan's gutter icon for a free block (the pointer brought onto the block, then the gesture
  from the icon, `here`). Each driver finds its own.
- **The events the app listens to.** Mouse events (obsidian-outliner, Tine, Dynalist, WorkFlowy),
  pointer events (true-outliner, RemNote), and HTML5 drags (Logseq, Roam, Athens, Tana, BlockNote,
  SiYuan): Chromium plays an HTML5 drag from Playwright's real mouse, so no drag interception was
  needed, in Obsidian's own window too (`obsidian-launcher`).
- **No caret after.** An app that ends a drop with no text focus lists `move` in `noCaretAfter`,
  and its outline alone is judged, as after its `deleteSubtree`.

**Labels** are stripped for comparing. With the app's block ids (`Outline.ids?: string[]`, which
Logseq's driver already reads), the runner could check them against apps too: which half of an
Enter split keeps the block, and whether a moved block is the same block. Not built yet.

**Built, the text apps (2026-10-28):** `Drop` and `Driver.drops`/`drop` (`lib/driver.ts`), `resolveDrop` and `gesture`
(`lib/drag.ts`; the drop the case's first action, its pickup one ourus makes, else skipped), the plan's
`drop` (`plan.ts`, text apps), the runner playing it (`run.ts`; a driver's `Unsupported` a skip as it
played, `drop: …`, kept by a rejudge as `NO_FOCUS` is), `outlinerDrop` and `trueOutlinerDrop`
(`obsidian/obsidian.ts`, `Profile.drag`), each aimed where the plugin's own geometry puts the place;
`run.md`'s "Drops", the two setups' READMEs. Measured: Outliner has no cover rule (Drag4) and no place
after a paragraph (Drag13), drops the selection (Drag5, 5b), and drags no paragraph or heading;
true-outliner selects the moved nodes (every drop `caret`, Scenario8b's typing replacing them), sets a
moved heading apart with blank lines (Drag15, 16), puts a node into an item without the blank line
above it (Drag8), and, after an earlier drop in the same view, names no place at the document's end
(Drag13 after Drag1: its indicator not drawn, the same pointer and events as alone, where it agrees).

**Built, the block apps (2026-10-28):** the projection's `rows` (each node's block), `inBlocks` mapping a
drop's lines to blocks, the plan's block path, `noCaretAfter`'s `move`; a `drop` in each of Logseq (OG,
DB), Roam, Tine, Athens, Dynalist, Tana, WorkFlowy, RemNote (both setups), BlockNote and SiYuan, read
in each app's bundle and aimed at its own geometry (each README's "Drag and drop"). Measured: every
drop an app can make lands where ourus's does but where a rule differs. No caret after a drop
(most), or the moved block selected (Dynalist, RemNote, SiYuan), so typing right after it goes
elsewhere (Scenario8b); a heading not re-levelled (Tine, Athens, Logseq, RemNote), or moved alone, its
section left (BlockNote, SiYuan, which have none); no place inside a leaf (Tana, BlockNote); a
paragraph kept a paragraph in an item (SiYuan); and two bugs met, Athens's drop into its own subtree
deleting it, RemNote's cached build missing its drag chunk.

**Built, the block selection (2026-10-28):** a drawn selection from a node's text start to another's end
projects, in a block app, to the topmost blocks selected (`Outline.selected`, `project`'s
`blockSelection`; a selection lost where the app keeps none, `compareOutlines`), for a driver that
makes one (`Driver.selectsBlocks`): each block driver's `load` selects them as the app does (Escape
or Shift+Up, then Shift+Down until the last is in, read back once the app is idle; WorkFlowy's
`WF.setSelection`; SiYuan's class; BlockNote's text from the first block's start to the last's end,
which its drag takes as the blocks), its `read` reports the topmost, and a drop of the selection
presses its first. Measured, the cover rule (Drag4, Drag20 the selection pressed; Drag5, Drag5b
another node): ourus's in Logseq DB, Roam, Dynalist, WorkFlowy, RemNote and BlockNote (most losing
the selection after the drop: `caret`); the selection dragged whatever is pressed in Logseq OG, Tine
and Athens (Drag5 moves nothing); nothing dragged from outside the selection in Tana; and in SiYuan
a bullet drags its item alone, a free block's gutter icon the selection.

Making the selection played the whole-node selection cases outside `drag.md` too (30 cases newly
judged across the apps, Indent9, MoveUp10, DeleteSubtree5, DuplicateSubtree3 among them), which
found three driver gaps, each fixed: SiYuan's keys act on a selection only with its editor focused
(the driver had blurred it); Tine's `deleteSubtree` (Escape, Backspace) cleared a selection with its
Escape, and RemNote's "Delete Bullet" leaves a selection as it is: with blocks selected, both press
Backspace alone (`act`). And the apps' own rules: BlockNote's Tab and Shift+Tab, on text selected
across blocks, go to its formatting toolbar and back out of the editor, nesting nothing (Indent9,
Outdent8); Tine and RemNote move no selection out of its parent (MoveUp11, MoveDown12), BlockNote
moves it out where ourus moves it into the next block; RemNote's Shift+Tab on a top-level rem with
children keeps it an item and moves its children out (Outdent8); Tana and WorkFlowy keep the
originals of a duplicate selected (DuplicateSubtree3). Two fixes beside them: a rejudge matched a
drop's stored run by its start and actions alone, so Drag5b, with Drag5's start and action, took
Drag5's (`replay` now wants the drawing, its `▸` too); and Tana's driver moves the pointer off the
nodes before aiming (a popover a bullet opens, and the toolbar a selection shows once hovered, hide
the rows). A full run of all 18 apps at once, about 59 browsers, crashed two and hung a third: those
apps were run again alone.

Left: `pasteAt` in an app (a `drop` event with a `DataTransfer`), labels against an app's block ids.

### 6.2 Built (2026-10-27)

The inverse pairs drop (`inverse.ts`): at every start, every node pressed (the caret in its first
text), every place offered dropped at and dropped back where the run was; their groups held to the
baseline as the pairs' are. What comes back otherwise is §3.3's, as expected: a conversion the way
back doesn't undo (`tree`: a paragraph made an item stays one), blank lines staying with their
nodes, the unit read again (`space`), and a place gone (`invalid-insertion-point`, `into-itself`,
`no-such-node`: the anchor adopted, the run's own parent now inside it, a quote dissolved). One was
a rule's gap: an item whose text is a fence, back after an adopting paragraph, refused; it is the
fence now, as outdent makes it. The differential drops too (`differential.ts`): each node pressed and
one paste dragged in, every listed place, both copies; 86,000 drops over its documents.

It found 56 drops failing to write, and the writer now writes all but Regression60's two: ids of
two equal subtrees where the changes are line by line (`result()` names a copied subtree's
descendants where the changes don't carry it to where it was written); a blank code line short of
its old content column, moved left past the new one, cut to the new prefix; a tab its containers
took part of at a moved node's content start (`headStart`); a lazy line with the prefix of a quote
that moves (`prefixedIn`); a callout title's and a framed quote's lazy lines, spelled again where
they move (`#escapes` takes `title` and `quote` texts); a title with lazy lines its holder reads
otherwise (`| a |⏎|---|` a table) read by its first line for the seam after it; a blank line in a
moved subtree under a quote it went into (`#lastLines`, one `>`); a node on its item's marker line
that a node moved off that line doesn't shift (`within`); a node the draft placed elsewhere not held
to its old marker line. And one rule: a drop out of a quote that is an item's first block, leaving it
one paragraph under `quotes: text`, refused (the paragraph would be the item's text). The drop pass's
known starts went from 6 to 1 (Regression60: the seam check reads a moved item at its old
indentation, which outdent keeps and a drop doesn't; `KNOWN` moved into `drops.ts`, the inverse
pairs reporting it without failing). Against the staged code, 119 runs of the other commands changed,
all in documents with lazy lines: lazy lines moving with their node (an indent re-indents a moved
item's lazy table), finer changes for the same text, a blank line more or fewer where a lazy table
was misread; each reads as its outline, as before.

Then the move sweep (`moves.test.ts`): every node of every start moved to every place there is, each
parent's every slot, in `gfm` and `obsidian`, so the places no drag offers too, a tree pane's or a
dialog's (27,063 moves at 1,662 starts, a second). Nothing throws; two starts fail to write, its
shrink-only list: Regression60, as in the drop pass, and DeleteSubtree12, first in an item whose
quote is on its marker's line (`- > q`), the place with no line of its own that only the API names,
its marker's line not written over.

## 7. Order of work

1. **Labels** in the spec tooling, with no command changed, and a handful of id checks added to
   existing cases (Enter's halves, a join, a move), which may show ids the commands don't keep.
   Beside it, independent of it: **`indentUnit`** (§10), the option, the writer's unit and its tab
   paths, and its cases.

   Built (2026-10-27): labels read out of every drawing (`readDrawing`, `readLabels`, so the SxS,
   probe and the harnesses read labelled buffers as they did), bound and checked as a case goes
   (`Labels` in `test/spec-run.ts`), drawn back by `redraw`, and `probe --labels`; their rules in
   `spec/README.md`; their checks' tests (`test/labels.test.ts`); Enter1, Enter2, Backspace1 and
   MoveUp1 labelled. What labelling found: an undo is the host's (`doc.replace`), so a node it
   writes again, the split `- ab` given back, is a new node by its id, and the next id only grows;
   the unbinding a review asked for, for ids an undo would give again, has nothing to do.
2. **`moveSubtreeTo`** and `nodes` on the structural commands and copy, with §3.1's normalization;
   `no-such-node`, `invalid-insertion-point`, `into-itself`, the places Markdown can't hold, the
   result check; the marker-to-place function and the
   start's `▸` in the player, and `spec/drag.md`'s `move` cases with them, so the spec drives the
   command.

   Built (2026-10-27): `moveSubtreeTo` (`move-subtree-to.ts`): the ids and the place checked in
   §3.2's order, the own place applied with no changes, §3.3's rules (into a node that holds none,
   after a heading, a heading under an item or in a paragraph's list, a task as a paragraph: all
   `not-expressible`; a paragraph or an atom made an item by indent's check, `itemTextsRefused`; an
   item after an adopting block made a paragraph; a heading re-levelled by `shiftHeadingLevels`, cut
   out of `changeHeadingLevels`, the caret's offsets with it, `would-reparent` where its section takes
   in what follows), the result check (`detail` starting `result check`), `placed`. `nodes` on the
   structural commands and copy (`CommandContext.nodes`, `operandsOf`; `operands` is now
   `topmostNodes` then `siblingRun`, for the cover rule): given nodes, a selection outside them stays
   in its text (delete, duplicate), and Tab on a code line isn't the host's. `drag.ts`: `dragRun`
   (the cover rule and §3.1's normalization) and `placeAtSeam` (§5.2's steps and the run's own
   lines, `folded` read in). The tooling: `readDropLine` (`readDrawing`'s `drop`), `move` and
   `move ②` in the player (`Played.drop`, `Played.labels`, which `startOf` binds from the start),
   one token in `tokenize`, the drop's errors in `specfile.ts` (a drop line with no drop, a drop with
   none, a second drop, one in a step's buffer), the tab pass leaving the drop line as drawn, probe
   playing drops. `spec/drag.md`: Drag1–5c, 6b, 8, 9 as drawn in §5.4 but for Drag8 (`a`'s blank line
   stays with `a`, between it and its new child, as indent leaves it: `- a⏎⏎  - para`), and Drag12–21
   for the rules §5.4 drew none of; Drag6, 6c, 7, 10, 11 wait for `drag` and `pasteAt`. Its core
   cases walked in Scenario8b–8d (a case drops once, so three). API cases in `commands.test.ts`.

   What it found: the result check needed three allowances the design didn't name, each Markdown's
   reading rather than a gap: a quote a drop leaves holding one paragraph is that paragraph under
   `quotes: text` (its node goes, its paragraph in its place, and an item dropped right after it is
   a paragraph: Drag21); an `after` the block above adopts once the run is gone (`para⏎> q⏎- a`,
   the quote dropped after `a`) still names the place; a moved paragraph's list where it can own none
   follows it (Quote78's rule). Then every single-node run to every place of the spec's starts
   (13,798 drops, a script, not yet a test): no throw, 16 `write-failed` and 14 refused by the check
   alone, all but three in items whose first block is a quote (`- > q⏎  >⏎  > r`, Quote75/81/88,
   DeleteSubtree12), the others a tab-indented fence in an item moved out (Fence64) and Regression60:
   step 4's baseline (§6).
3. **`drag`** for a move: the cover rule, seams, depths, the dead seam, folds, zoom, the clipboard;
   `nearestDropPoint`.
4. **`drag`'s cases**, `dragNodes:` and `dropPoints:` in the player; probe and redraw.

   Built, 3 and 4 (2026-10-27): `drag` (`dragCommand` in `drag.ts`), its seams by one walk over the
   nodes outside the run and not hidden (`seamsOf`): one per gap with a line, none where a child
   starts on its parent's line; where the run sits between two nodes, its top (the places with the
   run out, and its own) and its bottom, dead; where its top shares a line with the node it starts
   in (`> - a`), its own place goes on the seam before that node (Drag6c). Each depth's place by
   §5.2's steps (`seamPlace`, which `placeAtSeam` shares), left out where `unholdable` (cut out of
   `moveSubtreeTo`, its first two refusals); `converts` by `becomesAt` (the same); `listDepth` the
   items the parent is in or is; zoom as a seam's line inside the node and a place's parent in it.
   The clipboard by `copy` with `nodes`. `nearestDropPoint`, its ties unit-tested. The player's
   `drag`/`drag ②`, `dragNodes:` and `dropPoints:` after a step and `folded:`/`zoom:` in a config
   block (`specfile.ts`, `spec-run.ts`'s `drawDropPoints`, probe printing it). Cases Drag6, 6c, 7 as
   §5.4 drew them, and Drag22–26 (promotion, refused places undrawn, a heading's levels, folds,
   zoom); Drag6 walked in Scenario8d. The drop pass (`test/drops.ts`, `drops.test.ts`, §6): 9,635
   drops at 2,627 pickups, 24 gaps in 6 starts, a shrink-only `KNOWN`: Quote75/81/88 (an item whose
   first block is a quote), Fence64 and TO-E11 (a tab-indented fence moved out of its item),
   Regression60. No `converts` disagrees with its drop, and no own place writes.
5. **`pasteAt`**, `drag` with a clipboard (its points, unit-tested); the payload, and
   `deleteSubtree`'s `expectMarkdown`; `deleteByDrag`, for the text drop (§3.5).

   Built (2026-10-27): `pasteAt` (`pasteAtCommand` in `paste.ts`): the clipboard read as paste reads
   it, the place checked as a move's (`placeOf`), `unholdable` by its first node; in a list (under an
   item, in a paragraph's list, beside an item) `fitToList` with its blocks staying at the place
   (`blocks: 'stay'`), or made items where only items can be (`'items'`, refused where a block can't
   be one); elsewhere as they are, items after an adopting block made paragraphs, a task refused; a
   heading first re-levelled by `headingTarget` (shared with the move, the fragment's levels shifted
   by `changeHeadingLevels` before it is fitted), one last refused where `takesIn` says its section
   would take in what follows (Drag11); the caret with its text; the move's `resultCheck`, now over
   ids (`roots`, `moved`). `drag { clipboard }`: the same walk with no run, the clipboard's first
   node's kind for `unholdable`, `converts` by `pastedBecomesAt`, each drop a `pasteAt`.
   `deleteSubtree { expectMarkdown }` against `copy` of the same nodes (`content-changed`);
   `deleteByDrag`, `deleteSelected` dispatched, in `HOST_HAS` (the player's default deletes the
   text). Cases Drag10, 11 as §5.4 drew them, Drag27–29; the API's in `commands.test.ts`. The drop
   pass drags four clipboards in at every start (an item, a paragraph, a heading, a fence): the
   fence in a paragraph's list, kept a block, landed outside it (358 drops), so `'items'`; none
   now.
6. **The cm6 demo**: drag by the bullet, the indicator, the lifted lines; then the textarea's
   keyboard mode. The Obsidian plugins after that, as hosts of the core.

   Skipped (2026-10-28): the demo has no node selection for a drag to start from, and the core's
   API is what the SxS and the plugins need; the demo's drag, its node selection and the keyboard
   mode wait for a host that wants them.
7. **The SxS**: `Drop`, `lib/drag.ts` and the drivers' `drop` for the apps that drag, the Obsidian
   plugins first (text, mouse and pointer events, their covers playable); then a block selection
   in the projection and the block drivers' `load`; then the measurements of §6.1.

   Built (2026-10-28), all three: the drops, the two Obsidian plugins' and every block app's, then
   the block selection (`selectsBlocks`), each measured in its README's "Drag and drop" (§6.1's
   notes sum them up). Left: `pasteAt` in an app (a `drop` event with a `DataTransfer`), labels
   against an app's block ids.

## 8. Open, with a recommendation each

1. **Headings that would take in what follows** (true-outliner absorbs, paste absorbs, the moves
   refuse): refuse by default, keeping guarantee 4, so a preview never changes rows it doesn't point
   at; an option (`dropAbsorbs: refuse | take`) once true-outliner is a host; what a taking drop
   takes is read off its result, with no field of its own (§9.2), and the result check (§3.3)
   lets in the section's nodes it takes, as it lets in guarantee 4's lists.
2. **A heading under an item** (true-outliner: an item with `#`s as text, as its paste does):
   refuse, as indent does. The block apps tell us little otherwise: there a heading is a block's
   text, dropped under any block with its level kept (Drag15, Drag16 in Logseq, Tine, Athens,
   RemNote), or a block that owns no section (BlockNote, SiYuan), neither Markdown's sections.
3. **Roots under different parents** (true-outliner's cover), and **mixed kinds**: later;
   contiguous siblings of one kind first, as every structural command (§3.1). Mixed kinds need each
   root after the first fitted against the one before it, and `converts` for each.
4. **The selection after a drop**: the caret with its text; a host that selects the moved nodes
   (true-outliner) or puts the caret at their end (obsidian-outliner) does it from the result's
   `placed` (§3.4). CM6's own drop selects what it dropped (`dropText`); a CM6 host does the same
   for `pasteAt`, from the result. The apps measured (§6.1): a selection dragged stays selected
   (Drag4 in Logseq, Logseq DB, Tine, Dynalist, WorkFlowy, Tana, RemNote; lost in Roam, Athens,
   BlockNote); a block dropped alone leaves no caret and nothing selected (most), is selected
   (Dynalist, RemNote, SiYuan, true-outliner), or keeps the caret it had (Logseq DB alone, as ourus
   does).
5. **A heading's shallower levels at a seam** (beside the heading above, outdented in place): they
   take in what follows, so they wait on 1.
6. **The glyphs**: `▸` and `▹` in `dropPoints:`, and its columns at twice the depth: easy to change
   until cases use them.
7. **`folded` and `zoom` on `drag`**: fine for now, the host's view state passed in per call. To
   refactor once ourus keeps folding and zoom itself (native folds and zoom, say as state on
   `OurusDoc` or beside it, carried through edits as the ids are): then `drag` reads them there, and
   the fields go.
8. **A lone block id** (Obsidian's `^id` on a line of its own, after a table, a list or a code
   block): true-outliner holds it as a line of the node above, which travels with it (their
   2026-09-27 change); ourus's obsidian flavor reads ` ^id` ending a block, and a lone line as
   whatever Markdown makes of it (a lazy line of a paragraph or an item, else a paragraph of its
   own, which a move leaves behind). For every move, not only a drop: to check with `probe`, then
   decide in the obsidian flavor.
9. **The indent unit**: decided, `indentUnit` (§10), built beside step 1 (§7), for every command
   that nests anew, not for the drop alone.
10. **A copy-drag** (`duplicateSubtreeTo`, and `drag` with `effect: 'copy'`): left out of v1, as no
    host here asks for it and the apps disagree on what a modified drag means (Logseq's and Roam's
    Alt-drag makes a reference; CM6's and a browser's Ctrl-drag of text copies it). Designed
    already: its points are §3.2's copy row (both ends of the original, and inside it), its drop a
    copy with new ids and `placed` its roots. It comes with the first host that asks, the SxS first
    finding which apps copy on a modified drag.
11. **Two views of one file** (Obsidian's split panes): a drag from one to the other arrives as a
    drop from outside, `pasteAt` and the source's `deleteSubtree`: two undo steps, new ids, folds
    lost. Where the views share one `OurusDoc`, the payload's ourus mark (`<!-- ourus -->`) could
    carry the document's lineage and the run's ids, so the receiving view knows its own and runs
    `moveSubtreeTo` instead. Needs a lineage identity `OurusDoc` doesn't have yet; later.

## 9. Against the plugins' code

Read again with the API above in hand (true-outliner's `plugin/zoom-click.ts`, which holds its
press, pickup, preview and drop, `drag-state.ts`, `drag-geometry.ts`, `drop-destinations.ts`;
obsidian-outliner's `DragAndDrop.ts` and `MoveListToDifferentPosition.ts`): what each would call,
and what it would still lack.

### 9.1 obsidian-outliner

It fits as it is, and gets more than it has:

- Its press, threshold, Escape and mouseup stay; `drag` at the press with `pressed` the item's id;
  its `collectDropVariants` goes, `dropMap.seams` in its place. Its places are a subset of ours: an
  item before or after an item, and first inside a childless one, which is `last in` it. To keep
  exactly its set, its `accepts` refuses the drop points that `convert` the run (an item stays an
  item), with no check needed for that: not a filter on `parent`, which would keep the place after
  a paragraph where an item becomes a paragraph, and drop the paragraph's own list. To take the rest
  (items in a heading's section, under a paragraph's list), it takes every accepted one.
- Its geometry, `leftPadding + (level - 1) * tabWidth` with `tabWidth` measured, is `listDepth`'s
  (the reason `indent`, a text column, became `listDepth`: with tabs or `10. ` markers a column of
  characters isn't a place on screen). Its nearest-row-then-nearest-x is `nearestDropPoint`, which
  also skips the columns a drop refuses.
- `isSameRoots` ("the page content changed during the move") goes: a place names ids, which carry
  through edits.
- `MoveListToDifferentPosition` is `moveSubtreeTo`: one change, renumbered, the caret with its text.
  Its caret at the moved list's end, where the caret was outside the move, is the host's, from the
  result's `placed` (§3.4). Its reindent with Obsidian's indent setting (`getDefaultIndentChars`)
  is `indentUnit`'s (§10).
- Its six spec cases are drop cases as they stand, its coordinates a `▸` drawn where its pointer
  goes: "above all items", a `▸` above the first; "below all items", one at column 0 below the
  last; "slightly to the right", one at column 2 under the item. Drag1 is its first.

It is an SxS app already (`sxs/obsidian-outliner`, its `dnd` on by default), so its drag is
measured against ourus as soon as its driver has `drop` (§6.1): where they differ, it shows. One it
will: it has no cover rule, and drags the pressed item alone with a selection over others (Drag4).

Adopting ourus for drag alone means adopting its document (`OurusDoc` in place of its `Root`),
which is the plugin's port as a whole, not this design's.

### 9.2 obsidian-true-outliner

Its gesture fits the API one to one:

| theirs | ours |
| --- | --- |
| `dropSeams(tree, roots, { folded, scoped })`, read once per press and held | `drag`, once per pickup, `dropMap` held |
| `resolveDestination(seams, geometry, pointer)`, one resolution for preview and release | `nearestDropPoint`, and the host's cache by drop point; the release commits the result the preview drew |
| `sameDestination`, dispatch only when the destination changes | the same `DropPoint` object, compared by identity |
| `moveSubtreesTo` through `planStructural`, one change, `move.structure`, no undo entry when nothing changes | the drop point's `drop`, `changes: []` at the own place |
| `subtreeDocument(scope.root)` and a `lineOffset` for a zoom | `zoom: id`, seams in the document's own lines |
| `reresolveZoom`, since `parse()` gives every node a new id | ids carry through `doc.update` |
| a document change under the press cancels it | the same, or `drag` again with the run's ids |
| an item dropped after a paragraph becomes one, a task refused there (their 6h) | §3.3, the same |

And what it does around the drop stays its own, the ids making it possible: the pickup collapses the
selection to the run's cover and a cancel restores it (`dropMap.lines`); the drop opens a fold at
the destination (the drop point's `parent`, its line) and carries folds inside the run (their nodes'
ids, folded again at their ranges in the result's `doc`); the run is selected after it lands (the
result's `placed`, §3.4); the parent is accented (`doc.node(point.parent)`), the run's size counted
(its subtrees), autoscroll, touch, the checkbox's press.

It is an SxS app too (`sxs/obsidian-true-outliner`), its press on a marker the zoom below the
threshold and a drag past it, so a driver's `drop` presses, moves past the threshold, and drops;
its cover rule is ours, and its covers (Drag4, Drag5) play there, in text, as they can't in the
block apps yet.

What it would lack, each already open:

1. **Headings that take in what follows, and their shallower levels** (`absorbs`, `landsUnder`, the
   levelled places; §8.1, §8.5): its spec requires them; ourus refuses them by default. With the
   option, what a drop takes in needs no field of its own: the nodes outside the run whose parent
   the result changes, read off its `doc`, are what the preview draws shifted.
2. **A heading as an item under items** (§8.2): its spec writes one; ourus refuses.
3. **Roots under different parents, and of mixed kinds** (`press.groups`; §8.3).
4. **A lone block id travelling with its node** (§8.8).

And one it had, now designed: **the editor's indent unit** (`indentUnit` passed to the move, which
obsidian-outliner needs too), `indentUnit` in §10, built before the drag.

So the API holds for both; what true-outliner needs beyond it are four behaviors, each one ourus has
put off (§8), not a different shape. As for obsidian-outliner, taking it means taking ourus's
document in place of its own (`OutlineDoc`, `parse`), for every command, not the drag's alone.

## 10. The indent unit (`indentUnit`)

Designed with the drag, as its first host-facing need (§8.9): both plugins pass the editor's own
indentation, and every command that nests meets it, not the drop alone.

### 10.1 What ourus does today

The writer (`draft/write.ts`, `shiftFor`) indents a node it nests anew as the document does: an item
lines up with an item of its list beside it (a sibling, before it or after it); with none, a tab
where the document indents with tabs anywhere (`/(?:^|\n)[ >]*\t/`), else the parent's content
column, as CommonMark nests a child at its least (2 under `- `, 3 under `1. `, 4 under `10. `). That
test reads every line, code too: one line of a fence indented with a tab turns every new nesting of
a note nested with spaces into tabs. And it reads tabs only: a note nested four spaces deep gets its
new nestings at the content column, two deep. A host can't say otherwise: Obsidian's "Use tabs" and
"Tab size", CM6's `indentUnit`, are its own. And re-indenting a list that is indented with tabs
isn't written for every path yet (`shiftFor` throws `a list indented with tabs`).

### 10.2 The option

```ts
/**
 * How a node is indented where it nests anew and no item of its list beside it gives a column (the
 * first child of a childless item, by Tab, a move, a drop, a paste, Enter):
 * - `detect` (the default): as the document nests already, the unit most of its nested items have
 *   (each item under an item, by its indentation past its parent's: any tab in it, `tab`; else one
 *   at both the content column and four past the marker, as under `10. `, for none; else at the
 *   content column, `2`; else four past the marker, `4`; else, at another column, for none), code
 *   and other blocks not counted; with none nested, or a tie, `2`.
 * - `tab`: a tab past the parent's indentation (Obsidian's "Use tabs", on by default there).
 * - `2`: the content column (2 under `- `, 3 under `1. `), as Prettier and GitHub nest.
 * - `4`: four columns past the parent's marker (Obsidian's "Tab size" 4 with tabs off).
 *
 * Whatever the unit, the child lands where CommonMark reads it as one: at least the parent's content
 * column, short of four past it (indented code), counted in columns with tabs expanded to their
 * stops; a unit that falls short of the content column is made up to it with spaces.
 */
readonly indentUnit: 'detect' | 'tab' | 2 | 4;
```

**Which units Markdown can take.** A child nests at the parent's content column or past it, and four
columns past it is indented code; the widths are a bullet's 2, then an ordered marker's 3 (`1. `), 4
(`10. `) and up. So 1 never nests (under `- ` it is a sibling item), 2 nests under bullets and falls
short of `1. `, 3 and 4 nest under bullets and `1. `, and 4 and a tab (column 4) under `10. ` too;
6 and more are code under a bullet. Of those, 2 and 4 are what editors and style guides use
(markdownlint's MD007 has 2, with 4 the usual other; editors' tab sizes are 2, 4 or 8); 3 is no
one's unit, only `1. `'s content column, which `detect` already writes. The values are 2, 4 and
`tab`: a host whose setting is wider (Obsidian's tab size 8 with tabs off) passes 4, the widest
that nests under every bullet; one of 3 passes 4, the nearer that nests under `1. `; one narrower
passes 2. (Markdown.pl and Python-Markdown nest at 4 only; ourus's flavors read as
CommonMark does.) And `2`, made up to the content column, is the content column under every
marker, since that column is never less than 2: so it names the content-column style, Prettier's
and GitHub's, with no value of its own needed for it.

The numbers are numbers: `CONFIG_VALUES` lists `['detect', 'tab', 2, 4]`, and `Config.read` reads
a string setting's `4` as `4`, as it reads `true` as `true` (a spec's config block: `indentUnit:
4`).

- **A sibling first, always.** An item of the list beside the nested node gives its column, whatever
  the unit: a list's items line up, and the unit says only where a list *starts*. So the option
  changes nothing where a list is already nested; it changes the first child of a childless item.
- **The run's own nesting is kept.** A moved, dropped or pasted run is shifted as a whole to where
  its first root lands; its descendants keep their indentation relative to it, as a move keeps a
  node's own indentation now (`move-subtree-up.md`). The unit places the run's roots, not their
  children.
- **Made up to what nests, never past it, in columns.** A tab reaches the next tab stop (every four
  columns, as CommonMark counts them), not four columns on: from a parent at column 0 that is 4,
  from one at column 3 it is 4 too, one column. So the rule is read on columns, the parent's own
  indentation expanded: under `- a` a unit of 2 is column 2, `tab` and 4 are column 4; under `1. a`
  2 is 3, its content column; under `10. a` 2 is 4, and `tab` lands at 4; under `100. a`, content
  column 5, a tab lands at 4 and a space makes it up (`→ `), so a document nested with tabs keeps
  its tab; under `   1. a`, at column 3, a tab lands at 4 and two spaces reach its content column,
  6. No value reaches code under any marker, since the widest, 4, is short of a bullet's 6. Blocks
  under an item (its later paragraphs, a fence) take the same column as items do: at least the
  content column, short of code.
- **The unit spells shifted lines too.** A moved, dropped or pasted run's new indentation, the shift
  at its roots and the same shift over its descendants' lines, is written in the unit's whitespace:
  under `tab`, with tabs to their stops (and spaces where a stop overshoots); under `2` or `4`, in
  spaces; under `detect`, as whatever it resolved to (`tab`, `2` or `4`, read from the document's
  nested items) says. Today one test decides both (the
  `tabs` of `write.ts:254`, read by `shiftFor` and the shift's writing), so a tab in a fence
  re-indents moved lines with tabs too; the one `detect` replaces it for both.
- **A tab whose width a shift changes is spelled again.** A tab spans to the next stop, so a run's
  descendants keep their indentation relative to its roots, in columns, only where the run moves by
  a multiple of four; the writer refuses any other shift through a tab today (`write.ts:534`,
  `:546`: `tabs in a moved node, at another column`). The new rules make such shifts routine: `2` in
  a document nested with tabs moves a run by two columns, `→ ` under `100. ` is five, a drop one
  level deeper under `- ` is two. So a shifted line's tabs that would span otherwise, in its
  indentation and after a quote's `>` (whose tab gives the `>` its space, the rest of it the quote's
  content's indentation), are written again as the columns they spanned, in the unit's whitespace
  (tabs to the new stops and spaces after under `tab`, spaces under `2` or `4`, and under `detect`
  as what it resolved to: a document nested with tabs keeps tabs); a shift back through a tab splits
  it the same way, as `partialTab` already does at a container's edge. That is indentation and
  marker spacing the structure changes, so within guarantee 2 (prefixes and markers change where the
  structure requires), stated here as the one place a shift rewrites a tab. A tab after an item's
  marker stays, as the spec has it already (Indent14: shifting the line changes how far it reaches,
  not where the text starts); a tab in a text or in code is content, and stays too.
- **A parent's own prefix as written.** The unit goes after the parent's indentation as its line
  has it, which isn't spelled again: `4` under `→- b` is `→    - c`, `tab` under `    - b` is
  `    →- c`, the columns counted with tabs expanded. Only what the edit adds is in the unit's
  whitespace (guarantee 2: the rest byte for byte).
- **Explicit beats detected.** `tab` in a document indented with spaces, and `2` in one indented
  with tabs, write the unit asked for: the host's setting is the user's, as Obsidian's own Tab
  writes it whatever the file has. `detect` alone reads the document.
- **Changed without a parse** (`doc.withConfig(partial)`, new): an option that only says how
  commands write, as `indentUnit` and `markup` do, changes on the same document, its outline and ids
  shared; one that changes how the text reads (`quotes`, `listParent`) has the outline read again,
  ids carried as an update carries them; `flavor` alone needs a parse. So a host's setting changing
  mid-session renumbers nothing.

### 10.3 Hosts

| host | `indentUnit` |
| --- | --- |
| obsidian-outliner | `useTab ? 'tab' : tabSize <= 2 ? 2 : 4`, its `getDefaultIndentChars` |
| obsidian-true-outliner | its CM6 `indentUnit`: `'\t'` → `'tab'`, `n` spaces → 2 for `n` ≤ 2, else 4 |
| the cm6 demo | its `indentUnit` facet, as true-outliner |
| a textarea, GTK | `detect`, or the host's own setting |

### 10.4 The spec

Cases where a node nests anew under a childless item, each with the option in its config block and
tabs drawn `→`:

````md
## Indent39

Under a childless item, Tab nests the item a tab in, where the host indents with tabs.

```yaml
tags: common
indentUnit: tab
```

```buffer
- a
- b┃
```

> indent

```buffer
- a
→- b┃
```

## Indent40

A unit too small to nest under an ordered item's marker is its content column.

```yaml
tags: edge
indentUnit: 2
```

```buffer
1. a
2. b┃
```

> indent

```buffer
1. a
   1. b┃
```

## Indent41

A sibling gives the column, whatever the unit.

```yaml
tags: edge
indentUnit: tab
```

```buffer
- a
  - x
- b┃
```

> indent

```buffer
- a
  - x
  - b┃
```
````

The unit is drawn in cases of every command that nests anew: Tab (`indent.md`, above), a move into a
childless item (`move-subtree-up.md`, MoveUp6's like), a drop (`drag.md`: Drag3 under `tab`), Enter
making a first child (`enterMidItem: child`), and a paste onto a childless item (`paste-list.md`).
The cases above are drawn as the design expects (Indent40's `b` starts a new ordered list at 1, as
Indent4's rule has it); `probe` settles them once built. Every case today has no `indentUnit`, so
`detect`; one whose document nests other than at the content column (with four spaces, or tabs
only in a fence) nests anew otherwise under the new `detect`, which `redraw` and the differential
show, each read before it is accepted.

### 10.5 The SxS

The Obsidian setups already play every case through a lens: a start drawn with spaces is loaded with
each two of its spaces of indentation a tab, and Obsidian's result is read back with each tab two
spaces (`sxs/obsidian/obsidian.ts`, `asTabs` and `asSpaces`). Declaring `indentUnit: 'tab'` alone
would then compare ourus's `→`, played on the case's spaces, with Obsidian's tab read back as
spaces: every case that nests anew would disagree. So the runner plays ourus through the same lens
an app's driver uses, on the start the app was given and read back as the app's result is: ourus
under `tab`, on a tabbed start, writes tabs where Obsidian does, and both read back alike. Then the
setups declare `behaves: { indentUnit: 'tab' }` (Obsidian's "Use tabs" is on by default), and Emacs
and SilverBullet whatever they write, measured. For the block apps the option is moot (a block has
no indentation, and the projection reads none), so the runner doesn't skip a block app's case for
its `indentUnit`, as it skips one for an option the app doesn't have.

### 10.6 What it takes

- `config.ts`: the option, its values and its doc, out of "Not built yet".
- `draft/write.ts`, `shiftFor`: the unit where no sibling gives the column, made up to the content
  column in columns; `detect` read from the document's nested items, not its every line; the tab
  paths that throw `a list indented with tabs` written, as `tab` meets them in a document nested
  with spaces. The failures to expect there: a tab that only partly covers a marker's spacing, a
  widening across lines indented with tabs, a renumbering that narrows a marker (`100.` to `99.`)
  under tabs, and the shifts by other than four columns through a tab (`write.ts:534`, `:546`),
  written as the tab's columns are spelled again rather than refused.
- `doc.withConfig`.
- **A tab pass** (`test/tabs.test.ts`): every spec example played again loaded with tabs, as the
  Obsidian setups load it, and read back as spaces, its outline and its text checked: the spec is
  drawn with spaces, and the writer's tab paths are what it doesn't reach.
- The cases above, and one per command that nests anew; the differential's changes under the new
  `detect`, each read before it is accepted; the SxS's lens on ourus, its `behaves`, and the
  runner's block-model exemption.

It is independent of the drag, and comes before it in the order of work (§7): a drop into a
childless item is where a host first meets it, and Tab meets it already.

### 10.7 Built (2026-10-27)

Built: the option (`config.ts`, beside `markup`; its values `['detect', 'tab', 2, 4]`, read from
strings as they are); `detect` read from the document's nested items, cached per document
(`indentUnitOf` in `draft/write.ts`), with no nested item a tab where the document indents with tabs
outside code (`tabbedOf`, code's lines past their fence not read), else `2`; the unit placing an
item that nests anew, in Tab, a move, a paste, by one function (`unitChild`, which `tabChild` was),
made up to the parent's content column; and a guard, which `detect`'s `4` showed was missing: an
item a command places is never four past its container's content column, where it would be code (a
paste whose item's marker narrowed, `1. ` to `- `, put a sibling list there: `write-failed` before
the guard). Cases: Indent39–Indent44, MoveUp43; `spec/README.md`'s options.

Checked: `npm test` 1416 pass; the typecheck, the demos' too; the differential, no run failing to
write, about 1,450 of 1.26 million runs writing otherwise, every one in a document whose nested
items read as `4` (409 examples, each read), or one whose only tab was in code (the fence fix);
the inverse pairs, a few round trips improved (a list nested four deep moved and back comes back
as it was) and a few lost, in buffers that mix the content column and four (Copy9's `- a⏎    -
b⏎      - g`: a tie reads `2`, and after an outdent the two items read `4`), the baseline
recorded again; the model test as it was.

Then the tab pass (`test/tabs.ts`, `tabs.test.ts`): every example of the spec played again with its
indentation in tabs, each line's leading spaces a tab wherever they reach a tab stop, so it reads as
it did, and read back with its tabs as their columns, the same text or the same document. Not
Obsidian's rule (`asTabs`, a tab a nesting step), which changes what CommonMark reads (`- a⏎    *
x` as `- a⏎→→* x`, code): that one is the SxS's lens, for Obsidian; this one is the writer's. It
found 13 examples that didn't play back, all the writer's tab paths: a moved line whose
indentation starts inside a tab, a tab across a container's edge, a tab after a quote's `>` that
a shift moves off its stop, a marker widening over lines indented with tabs. Written now: the
first two split, the part past the edge as the spaces it spans (`shifted`); the third spelled
again as its spaces (`padded`), but in an atom quote, whose `>`s are its text; the fourth by the
widened lines' tabs as their columns (`widen`). Then the unit spells moved lines: with tabs where
it resolves to `tab`, else with spaces, a document nested with tabs under `2` or `4` too, now that
the space path takes a tab in a moved line (its leading tabs as the columns they span, a list's
siblings lined up by columns, not refused); and an indented code block's four columns, a tab among
them that a shift moves off its stop, re-indented with the line, the code's text past them as it
is. The differential shows no change from any of it, and no run failing to write. Four are known,
in the test's list, which only shrinks: three markers written over whitespace a tab spelled
(`writeOver`, an item whose first block starts on its marker's line, `- - g`, `- > q`), and a lazy
line's tab the text speller keeps where the line moves off its stop, escaping what follows it
(`\- g`), the same document spelled otherwise.

Then the tab-indented children after a blank line, which a tab pass by Obsidian's rule (`asTabs`,
not this one) finds and this one doesn't, the spec having no case of the shape: Indent45, 45b,
Outdent22, 22b. An outdent's blank line in the moved lines, written without its whitespace, refused
as short of the column; a child whose content starts
on a tab its item takes part of, at its new place by that tab's column in what the shift writes
(`partialTabHead`, for `headStart` and `newPosition` both: `headStart`'s rule put it past the new
prefix's characters, which a tab respelled doesn't keep); text respelled under such a tab, its
padding counted past the containers' content column, not as a whole tab's four (Enter, Shift-Enter,
paste in `- b⏎⏎→para`); and `detect`'s tabs read in an item's indentation before code too
(`itemTabs`), so Indent45b's tab-indented code nests with tabs. Known, in the drop pass's list: a
heading dropped in before such a code child (Indent45b, Outdent22b) writes text that reads
otherwise, where with spaces it is refused; the differential's two runs of it fail in HEAD too.

That pass is a test now beside this one (`test/obsidian-tabs.test.ts`, `asTabs` moved out of the
Obsidian driver into `sxs/lib/tabs.ts` for it): every example whose start has indentation, loaded
as Obsidian's tabs, each step checked by what it reads as. It found one more: a block lifted onto
its item's marker line (`- - g`, Quote83) measured its indentation past the item's content column
in spaces alone (`lifted`), in columns now, which plays back DeleteSubtree12 in this pass too; three
known remain here.

And `doc.withConfig` (`doc/doc.ts`, its test in `test/doc/doc.test.ts`): a writer's option on the
same snapshot, `quotes` and `listParent` read again from the same parse, `flavor` parsed anew.

Not built yet, as designed above:

- **The four the tab pass knows** (above).
- **Blocks under an item** nesting anew (a paragraph, a fence) stay at the content column; the unit
  places items.
- the SxS's lens and `behaves`, the block-model exemption.
