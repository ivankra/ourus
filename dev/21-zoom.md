# Zoom and folding (2026-10-28)

Folds and the zoom are the view's state, kept on the document snapshot (`OurusDoc.folded`,
`OurusDoc.zoom`) as its placeholders are. Every command reads them and carries them through what it
writes; the view has six commands of its own; a zoom is a boundary no edit crosses. This is the
design as built and measured: what the hosts need (§1), the model (§2), what the commands do under
a fold (§3) and a zoom (§4), the API (§5), the spec (§6), the tests (§7), what the other apps do
(§8), how it was built (§9), what changed along the way (§10), and what is decided and still open
(§11).

## Contents

- [1. What hosts need](#1-what-hosts-need)
  - [1.1 obsidian-zoom](#11-obsidian-zoom)
  - [1.2 obsidian-outliner](#12-obsidian-outliner)
  - [1.3 obsidian-true-outliner](#13-obsidian-true-outliner)
  - [1.4 Other editors](#14-other-editors)
- [2. The model](#2-the-model)
  - [2.1 State of the snapshot](#21-state-of-the-snapshot)
  - [2.2 What a fold hides](#22-what-a-fold-hides)
  - [2.3 What a zoom shows](#23-what-a-zoom-shows)
  - [2.4 Hidden](#24-hidden)
  - [2.5 Through a change](#25-through-a-change)
- [3. Commands under folds](#3-commands-under-folds)
- [4. Commands under a zoom](#4-commands-under-a-zoom)
  - [4.1 The invariant](#41-the-invariant)
  - [4.2 The rules at the edge](#42-the-rules-at-the-edge)
  - [4.3 Deferred edits](#43-deferred-edits)
- [5. The API](#5-the-api)
  - [5.1 The snapshot (`doc.ts`)](#51-the-snapshot-docts)
  - [5.2 View commands (`types.ts`)](#52-view-commands-typests)
  - [5.3 `drag`](#53-drag)
  - [5.4 Hosts](#54-hosts)
- [6. The spec](#6-the-spec)
- [7. The tests](#7-the-tests)
- [8. What the apps do](#8-what-the-apps-do)
- [9. How it was built](#9-how-it-was-built)
- [10. Along the way](#10-along-the-way)
- [11. Decided, and open](#11-decided-and-open)

## 1. What hosts need

### 1.1 obsidian-zoom

Read in `src/logic/` and `src/features/`.

- **The range is CodeMirror's**: `CalculateRangeForZooming` takes `foldable(state, line)` (CM6's
  fold service, which in Obsidian is its "Fold heading" and "Fold indent", and refuses to zoom with
  them off), from the line's start to the fold's end; a list item without children is its own line.
- **Hiding is two block-replace decorations** (`KeepOnlyZoomedContentVisible`), before and after
  the range, kept in a `StateField` and mapped through changes; the visible range is read back from
  them.
- **Selection is clamped** to the visible range by two transaction filters: on a user's `select`
  event (`LimitSelectionWhenZoomedIn`) and on the zoom-in effect (`LimitSelectionOnZoomingIn`).
- **It zooms out when an edit crosses the boundary** (`DetectVisibleContentBoundariesViolation`):
  a transaction whose changes touch both the hidden and the visible ranges, in the state before.
- **Breadcrumbs** (`CollectBreadcrumbs`): every line above whose `foldable` range reaches past the
  zoomed line, the document's title first; `cleanTitle` strips the markers.
- **Its API to other plugins**: `getZoomRange`, `zoomIn(line)`, `zoomOut`, `refreshZoom` (the range
  grown by an edit at its end), on `window.ObsidianZoomPlugin`, which obsidian-outliner reads.
- **Two commands**: "Zoom in" (Mod-.) and "Zoom out the entire document" (Mod-Shift-.); a level out
  is a click on a breadcrumb only, and a click on a bullet zooms in.

What it needs from ourus: the range of a node's subtree by ourus's outline (a paragraph that owns a
list, a heading's section, a quote), not by indentation; edits that keep inside it; the ancestors,
with a plain title each; and to be told when a change ended the zoom.

### 1.2 obsidian-outliner

Read in `src/features/ListsFoldingCommands.ts`, `src/operations/CreateNewItem.ts`,
`KeepCursorOutsideFoldedLines.ts`, `MoveCursorToPreviousUnfoldedLine.ts`,
`src/services/ChangesApplicator.ts`, `src/root/index.ts` and `src/editor/index.ts`.

- **Folds are CodeMirror's** (`foldEffect`, `foldedRanges`); the parser marks a list a `foldRoot`
  where a folded range starts on its line, and `isFolded` asks its ancestors.
- **Enter at the end of a folded item makes the next sibling**, after the subtree, not a hidden
  first child; mid-text on a folded item, the children go with the second half as with any split.
  **Enter on the zoom root makes its first child**, which keeps it inside (`listIsZoomingRoot`),
  and after an Enter the zoom is refreshed to the grown range.
- **The caret is kept out of folded lines**: a caret below a fold root's first line goes to its
  end; ArrowLeft at a line's text start goes to the end of the previous *visible* line (the fold
  root's first line where the line above is folded).
- **A change keeps its folds by hand** (`ChangesApplicator.calculateFoldingOprations`): every
  fold root whose range the changed range meets is unfolded before the replacement and folded again
  after, at its new line, since a replacement of the folded lines would drop CodeMirror's range.
- **Toggling by a guide line** (`VerticalLines`): unfold the children if any is folded, else fold
  them all.

What it needs from ourus: the variants of Enter and the caret on a fold and a zoom root, which are
commands' rules, not a host's; and a change's folds after it, by node, so no host repeats the
unfold-replace-refold dance.

### 1.3 obsidian-true-outliner

Read in `openspec/specs/outline-folding/spec.md`, `openspec/specs/outline-zoom/spec.md`,
`docs/research/fold-mechanics.md`, `zoom-editing-boundary.md` and `zoom-hiding-mechanism.md`.

A full design, measured, of which the points that bear on a core:

- **Every node with children folds, whatever its kind**, by its rule, not Obsidian's; a childless
  node and an atom don't. **A fold hides from the end of the node's own last line through the end
  of its last descendant's last line**; the blank line between it and its next sibling stays, so
  folding a node doesn't re-lay-out the node after it.
- **Fold state follows a node** through indent, outdent and the moves, its own and every fold
  inside the operand; elsewhere it is unchanged.
- **A change to hidden content opens the fold that hides it**, whatever made it (a key, undo, find
  and replace, sync); a change to the folded node's own line keeps it. Folds aren't in the undo
  history.
- **A caret never arrives in hidden content**: a command that would put it there opens the fold;
  a fold closed over the caret stands, and the caret goes to the fold's head line.
- **Folds persist per file, outside it**, under a setting; nothing is written into the note.
- **Zoom makes a node the view's temporary root**: any kind, children or none; the visible range is
  its whole subtree cover with its trailing gap, and nothing else is rendered (title and
  properties too). Breadcrumbs, a click on a mark zooms, out one level or all the way.
- **The scope confines every selection, caret and operand**; select-all and Shift-Arrow stop at it.
- **An operation whose result would leave the scope is refused, with no change**, by one
  invariant: the root's whole subtree removed is no escape (the zoom exits); otherwise the root
  keeps its place, and the text outside its subtree is byte-identical. Its measured defects
  (`zoom-editing-boundary.md`) were both from asking the state *before* the change: an escaping
  edit applied then silently exiting, and an append at the scope's end, dispatched at the first
  hidden line's start, read as outside.
- **Depth is measured from the zoom root** for indentation and guides.
- **Zoom exits by itself** when its root was removed, when an unenforced change (undo, sync,
  another pane) left the scope, judged by the same invariant, or when the mode is switched off;
  it never changes the document or moves the caret. It is per view and never persisted.
- **Folds and zoom are drag's inputs** (20-drag §1.2).

What it needs from ourus: all of 1.1 and 1.2, plus the invariant as the commands' own check, fold
state carried through every command by node, a change's effect on folds and zoom for edits that
aren't commands, and the drag's.

### 1.4 Other editors

- **Block outliners** (WorkFlowy, Dynalist, Logseq, Roam, Tana, RemNote): collapse and zoom are
  first-class, keyed by block. WorkFlowy's `expand`/`collapse` and `zoom_in`/`zoom_out`, Dynalist's
  zoom into the previous or next sibling (Ctrl+Shift+[ and ]); a zoom is a URL. Their collapse state
  is the block's, stored with it and synced: Logseq OG writes `collapsed:: true` into the Markdown
  file (not into the content its API gives), Tine into the block's text, Logseq DB and Athens keep
  it on the block, Roam too (`:block/open`, though a key's fold in Roam's help graph is the view's
  alone, the attribute left); Tana's expansion alone is a view's, by path in a panel, as ourus's,
  and RemNote's a portal's. ourus's is the view's (§2.1), with in-file storage open (§11).
  **Where a block app shows a zoom root, it is mostly a title, not a row**: WorkFlowy, Dynalist,
  Tana, RemNote and Athens edit the zoomed item's name above its children; Logseq zoomed into a
  block, obsidian-zoom and true-outliner show it as a row, as ourus does (§2.3).
- **The SxS plays every block app's case inside a zoom already**: WorkFlowy's driver zooms into an
  item kept for the test (`WF.zoomTo`), Dynalist's into the demo's root (`view.zoom_node`), Tana's
  opens a node in its panel. That container is undrawn and plays the document's root, so it is not
  a case's zoom root: `zoom: ①` still zooms one level in. But it makes their cases at the
  document's edges evidence for §4: Backspace17 (the first, empty, item goes) leaves no caret in
  the drawn blocks in WorkFlowy, Dynalist and Logseq (a `caret` verdict): it goes above them, into
  the container's title or Logseq's page's, where a zoom root's first child would put it into the
  root.
- **org-mode**: visibility cycling, per heading (Tab: folded, children, subtree) and global
  (Shift-Tab: overview, contents, show all), `#+STARTUP` and a heading's `VISIBILITY` property for
  the state on opening; narrowing (`C-x n s`, `C-x n w`) is zoom, and in a narrowed buffer nothing
  outside is reachable at all, which is §4's refusal by construction.
- **CM6 in general**: a `foldService` answers "what folds at this line", and CodeMirror then owns
  the gutter, the keys (`foldCode`, `foldAll`, Ctrl-Shift-[) and `foldState`, a range set mapped
  through changes. A host gives `foldService` ourus's ranges, so CodeMirror's own fold UI folds
  ourus's nodes; it then has two states, CodeMirror's and the snapshot's, and syncs them both ways
  (§5.4).
- **Monaco and VS Code**: a `FoldingRangeProvider` gives `{ start, end }` lines, the editor holds
  what is collapsed and exposes no fold state, only `visibleRanges`, the viewport's visible lines,
  folded ones left out. A host infers some folds from the gaps in them (§5.4), never all, and folds
  by `editor.fold` with `selectionLines`. No zoom in the editor; a host does it with hidden areas
  (Monaco's `setHiddenAreas`).
- **A tree pane** (an outline sidebar, Obsidian's Outline view): its expanded rows are folds of
  their own, a pane's, which a host may or may not tie to the editor's; `aria-expanded` per row.
- **A textarea** can't hide lines. Folds there need a projection (the visible text, and positions
  mapped both ways, edits mapped back), a feature of its own (§11). **GTK** hides text with an
  invisible tag; **a TUI** draws rows itself, from the visible lines.
- **Several views of one file** (two panes, a split): each its own folds and zoom. A host keeps one
  snapshot per view, as CodeMirror keeps one state per editor; the lineage, text, ids and marks are
  shared, one view making each next snapshot and the others taking it with their own folds and
  zoom (`withViewOf`, §2.5).
- **Persistence**: Obsidian stores a file's folds by line; a block app by block. Node ids are a
  lineage's, so a host that persists folds keeps lines (or a path of titles) and maps them back on
  opening, with `rowOwner`.
- **Search and filters** (WorkFlowy's search, a tag filter, "hide completed"): the matches, their
  ancestors shown, the rest hidden: a hidden set like a fold's, with the same rules for the caret
  and for what may change. Open (§11), but the model leaves room for it.

So the core needs: **folds and a zoom as state that commands read and carry, by node; the range
each hides and shows, by ourus's outline; commands that keep the caret and new content visible,
and keep inside a zoom, refusing what can't; folds and zoom carried through an edit that isn't a
command; and the view's own commands**. Rendering, gutters, breadcrumb UI, persistence and the
pointer stay the host's.

## 2. The model

### 2.1 State of the snapshot

`OurusDoc` carries two more fields: `folded`, the nodes whose children are hidden, and `zoom`, the
node the view is zoomed into (null: the whole document). They are a view's, not the text's: no
command writes them into Markdown, `copy` doesn't carry them, and two snapshots of one text can
differ in them. They live on the snapshot as placeholders do (`marks`), for the same reasons:

- **Every command reads them** (Enter, Backspace, the moves, paste, a drop), so they are its input
  as the text is, and `executeCommand(doc, command, selection)` keeps its shape. A fourth argument
  was the other design; its result would have needed a `view` beside `doc` too.
- **They are carried through a change by node**, as marks are by position: the result's `doc`
  carries them out of a command, `doc.update` and `doc.replace` out of a host's edit, `withConfig`
  out of a setting (§2.5).
- **A change of them is a new snapshot**, cheap, the outline and parse shared: `withFolded`,
  `withZoom` (§5.1), and the view commands (§5.2) return one with no text changes.

A snapshot is a view's: a host with two panes on one file keeps two, of one lineage, whose folds and
zoom differ. They aren't updated alike, each replaying the changes: an update gives a rewritten node
a new id where the writer kept its own (§2.5), and the two lineages would part. One view makes the
next snapshot (a command's `doc`, or its own `doc.update`), and every other view takes that one with
its own folds and zoom carried onto it: `next.withViewOf(mine, changes)`. A host that compares
snapshots by identity to see if the text changed compares `text` instead.

### 2.2 What a fold hides

**A node folds where it has something to hide**: children, of any kind that holds them (20-drag
§3.2: a heading, an item, a quote; a block that adopts lists, under `listParent`), on lines after
its text. A childless node doesn't, nor does an atom, nor a node whose children all sit on its own
last line of text (`- - a` alone); `withFolded` drops an id that can't fold, and a node that has
nothing left to hide loses its fold (§2.5).

**A fold hides from the end of the node's text to the end of its subtree's last line**: from the
end of `textLastLine` to the end of `endLine`, so the lines after the node's text go, with the gaps
among them. Not to the last descendant's text: a container's block can run past it (`- a⏎  > b⏎
  >`, under `quotes: container`: the quote's last line, `  >`, is no text of `b`'s), and a fold
that stopped at `b` would leave a stray `>` row. The gap after the subtree stays (`endLine` stops
before it), as true-outliner measured: a fold must not re-lay-out what follows it. A heading's fold
hides its section, every sub-heading included; a paragraph's, the list it owns; a quote's, its
children after its first line. In offsets, `foldRange(node)` is one range a host hands to
CodeMirror as it is (a replace from a line's end to a line's end puts the following line's ending
on the node's line).

Where a node's first child starts on its own first line (`> a`, `- - a`, `- # H`: no text of its
own there), one row holds two nodes. **The row's fold is the outer node's**: it hides everything
after that row, as indentation folding would, and is what a gutter on that row shows. The inner node
folds alone through the API only. `rowOwner(line)` names the row's node, the outermost starting on
the line; `nodeAtLine` is no substitute, giving the innermost whose text holds it (in `> a⏎>⏎> b`,
the childless `a`, not the quote).

### 2.3 What a zoom shows

**A zoom shows its root's lines, its descendants' and its trailing gap**: lines `startLine` through
the **cover's end**, `coverEnd(node)`: `endLine` and the blank lines after it, up to the first line
of the next node that isn't the root's (`afterSubtree`), or the document's end. `endLine` itself
stops before them, so zooming into `a` in `- a⏎  - b⏎⏎- c` by it would hide the blank line, where
an append at the scope's end goes. Every other line is hidden, the preamble (front matter) too. Any
node can be a zoom root, children or none, an atom too, never the document's root. `zoomRange()` in
offsets: the start of `startLine` to the end of `coverEnd`. The gap is the root's, shown and edited
as the rest; what an edit there could do outside (loosen or tighten the list around the root) §4's
clause 4 asks of the lists themselves.

Inside it, the containers' prefixes on the root's lines (a quote's `>`, an item's indentation) are
the host's to render or not: a node's depth below the root (`node.depth` less the root's, the root
0) is for indentation and guides, and the text stays as it is.

### 2.4 Hidden

A node is **hidden** where one of its ancestors is in `zoomFolded` (below), or where the snapshot
is zoomed and the node isn't the root or inside it; a **position is hidden** where it is in the
range of a fold in `zoomFolded`, past its start, or outside the zoom's.

**Zoomed, the folds of the root and its ancestors hide nothing.** A zoom shows the root's whole
subtree: zoomed into `B` under a folded `A`, `B` would otherwise be hidden, the scope empty, and a
selection without a place to go; zoomed into a folded `B`, its children would be. Those folds stay
in `folded`, and apply again when the zoom is left (`zoomOut` finds them as the reader left them);
`withZoom` and `zoomIn` change no fold. Folds inside the root apply as anywhere.

So two sets: `folded`, every fold stored, and **`zoomFolded`**, the folds of the nodes strictly
inside the zoom root (all of `folded` where not zoomed). Everything that asks what is hidden reads
`zoomFolded`: the commands' variants (Enter at the end of a folded zoom root makes its first child,
as unfolded: Zoom5), `isHidden`, `drag`'s seams, and a host drawing or syncing folds (§5.4). The
`fold` command changes `folded`, for any node, but while zoomed leaves the root's and its
ancestors' alone; `toggleFold` asks what the reader sees, `zoomFolded`. A host reading folds back
from its editor keeps the ones outside `zoomFolded`, which its editor never had.

**The rule every command keeps: it doesn't leave the caret, a selection's end, or a node it made
or moved in hidden lines, and it doesn't change hidden text** but as part of a node it moves or
deletes whole (a folded node indented, moved, cut: its hidden lines go with it). Where a command
would, it takes the visible variant the apps agree on (§3), or opens the fold (the result's
`folded` without it), or refuses: under a fold where nothing visible can be done (Delete into a
hidden child, `folded`), under a zoom where the result would reach outside (§4, `outside-zoom`).
A fold closed over the caret (a host folding an ancestor of the caret) stands: the caret goes to
the fold's start, as true-outliner does (the `fold` command's result has it there; a fold the host
made itself, the host moves it). Every command's result goes through `visibleSelection`, which
moves an end out of hidden lines the same way.

### 2.5 Through a change

**One carrying rule serves every edit**, a command's and a host's: `carryView` (`src/doc/view.ts`),
which `doc.update` runs on every update and `withViewOf` runs onto another view's snapshot.

- **A fold stays** where its node is there (by id) with something to hide and, for any fold but
  the zoom root's and its ancestors', **what it hides is the same**: the same descendants, each with
  its id, kind and text (`hiddenContent`). An edit to the folded node's own text keeps it; a move
  or an indent of the folded node writes its hidden lines again but changes none of that, so it
  stays with no rule of the command's. One that changes what it hides opens it: a node indented
  under it, a join into it, a child typed into, and a change before it that grows it (`## A` made
  `# A` takes the next `## B` section in). The comparison is made only for a fold some change
  comes near (its node's own lines, through its cover's end and the next line's start, where a
  node indented under it lands), so typing elsewhere costs nothing. A fold the zoom suppresses
  hides nothing, so no edit opens it: typing in `B`, zoomed into `B` under a folded `A`, keeps `A`'s
  fold (Zoom5). A fold outside the zoom opens as any other where an edit from another view reaches
  it: it would show the change when the zoom is left.
- **The zoom stays** where its root is there and no node of its subtree left it, judged on the
  result, not by where the changes are: an append at the end of the scope, dispatched at the start
  of the first hidden line, stays (true-outliner's second defect); a `#` typed in a zoomed section,
  making a heading that ends it, ends it. Its root removed, the zoom goes to the nearest ancestor
  left, none at the top level. Text changed outside the zoom doesn't end it: this path also serves
  edits nothing could refuse, among them other views' (a second pane typing at the top of the file,
  a sync), which must not end this view's zoom. §4's whole invariant is for the edits that can be
  refused.

**Out of a command** the writer knows each node it wrote, moved, copied or removed, and the result's
ids are the writer's (its `identity`): a moved folded node keeps its id, so its fold, however much
of its text the move rewrote. Only what the rule can't know is the command's own (`withFolds`): a
split's fold given to the second half that took the children, a duplicate's copies folded. The
zoom out of a command is the input's (§4 guarantees it holds), or, where `deleteSubtree` or `cut`
removed the root, its nearest ancestor left.

**Out of a host's edit** (`doc.update(changes, params)`: typing, a find and replace, CodeMirror's
own commands), ourus has only the changes, and the rule is only as good as the ids the update
carries. An edit that wrote over a node's whole text gave it a new id at first (`abc` typed over with
`xyz`: id 1, then 2), so selecting a zoomed paragraph's text and typing would have ended the zoom,
and a paragraph that owns a list lost its fold: a line a change writes over from its start, with
text of its own, now keeps its node where it reads back as one of its kind (`writtenOver`, §9). An
edit that would end a zoom this way has already happened, which is true-outliner's first defect.
So an edit a host can still cancel (a deferred command's default, typing, its own commands) it
checks before committing: it builds the next snapshot as it would commit it, with the caret and
marks it will give, and asks `leavesZoom(doc, next)`, §4's invariant between the two. The changes
alone can't say it: the outline after them depends on those params (`- a⏎  - b`, the `b` deleted,
keeps an empty child with `caret` at it, and without it reads `a⏎-` as the parent's text), so a
check of the changes alone would refuse a valid Backspace in a zoomed `b`.

**Out of another view's edit**, not by replaying its changes through this view's snapshot: moving
`b` above `a` in `- a⏎- b` keeps their ids, 2 and 1, in the writer's result, and the same changes
replayed through `update` give both new ones, a move changing the parent or the index. So the view
takes the other's snapshot, `next.withViewOf(mine, changes)`: `next`'s text, ids and marks
(placeholders are the document's, not a view's), and `mine`'s folds and zoom carried onto it by the
rule above.

**Out of `doc.replace(text, marks)`** (an undo, the file changed on disk, a sync): the same rule,
over the lines it finds changed. Ids carry only for the lines it leaves alone (20-drag §2), so an
undo of a move, which writes the moved lines again, would give their nodes new ids and lose their
folds, where true-outliner and every block app keep them (Fold16, Fold17). So a host gives an undo
the snapshot it returns to, `replace(text, marks, { like })`: where `like` has that text and those
placeholders, the result takes its nodes, ids and all, and this snapshot's folds and zoom are
carried onto them by the rule above. A `like` of another text is ignored.

**Out of `withConfig`**: carried by id where the ids are, under an option of how commands write,
and under `quotes` and `listParent`, whose outline is read again with the ids carried. A `flavor`
change parses the text anew (`OurusDoc.parse`), its ids starting over from 1 in document order, so
a carried id would likely name another node, silently: the state goes by line instead (each fold's
first line, then `rowOwner` of it), a fold kept where the node now starting on its line folds, the
zoom where a node of the root's kind starts on the root's line, each else dropped.

## 3. Commands under folds

Each rule a fold changes, and its variant: where the command would put new content, the caret or a
node in hidden lines. A visible variant is taken where the block apps agree on one; elsewhere the
fold opens. Each row's case and what the apps do (§8) are in the last column; a `?` is a row no case
measures yet.

| Command, rule | With no fold | On a folded node |
| --- | --- | --- |
| `enter` 8: at the end of an item with children | its new first child | the next sibling, after the subtree, numbered on (Fold1) |
| `enter` 4: an empty item with children | its new first child | the next sibling, after the subtree (Fold5) |
| `enter` 7: mid-text, `enterMidItem: sibling` | the rest a sibling, which takes the children | the same; the fold goes with the children, to the second half (Fold2) |
| `enter` 7: mid-text, `enterMidItem: child` | the rest the first child | the rest the next sibling, after the subtree, the fold kept (Fold2b) |
| `enter` 9: at the end of a heading's title | the section's first paragraph | the same; the fold opens (Fold13: a node after a section is a heading, and Enter doesn't invent one) |
| `enter` 6: at a folded node's text start | a new node above | unchanged |
| `shiftEnter`, typing, on the folded node's text | | unchanged; the fold stays |
| `deleteContentBackward` 3: an empty item right after a folded node | goes, the caret to the end of the text above (hidden) | goes, the caret to the end of the folded node's text (Fold3); with children, they go into the fold, which opens |
| `deleteContentBackward` 5: the node right after a folded node joins the node above | into the last hidden descendant | into the folded node's text, the fold kept (Fold15); its children, if any, after the folded node's, which opens it (Fold15b), and under `joinWithChildren: refuse` nothing (Backspace45c) |
| `deleteContentForward`: at the end of a folded node's text | its first (hidden) child joins it | refused, `folded`, no change (Fold7) |
| `indent` 4: under a folded previous sibling | its last child | the same; the fold opens (Fold6) |
| `moveSubtreeUp`/`Down` 2: past a folded sibling | swaps with it | unchanged: the sibling moves whole (Fold4) |
| `moveSubtreeUp`/`Down` 4, 5: into a folded section, or across into a folded parent's sibling | its first (last) child | the same; the fold opens ? |
| `paste` at the end of a folded item's text | first among its children (`pasteOnParent: children`) | after the subtree, as Enter's, the fold kept (Fold14); on a folded heading or paragraph list, the fold opens |
| `moveSubtree`, `pasteAt` among a folded node's children | | the fold opens (a drag offers only the last place inside, 20-drag §3.2) |
| `duplicateSubtree` of a folded node | a copy below | a copy below, folded, and the folds inside it copied (Fold8) |
| `deleteSubtree`, `cut` | | their folds go |
| an undo, a redo of any of these | the text back | the folds of the nodes it writes back kept (Fold16, Fold17) |

A selection that covers a folded node takes its hidden subtree with it (it is selected whole, as it
is drawn), for `cut`, `copy`, `deleteSubtree` and a Backspace across lines; a selection with an end
inside hidden lines is a host's to clamp, and a command given one acts on it as it is.

## 4. Commands under a zoom

### 4.1 The invariant

Every command's result is checked, as 20-drag §3.3's result check is: where the snapshot is zoomed
into `R`,

0. if the command removed `R` with its whole subtree (`deleteSubtree` or `cut` of `R`; any other
   command that would is refused), every one of its operands as given (before `withTextlessParents`)
   is `R` or inside it, and 2 holds for every other node but `R`'s textless ancestors the removal
   took with it (a quote without a title, an item whose first block is on its marker's line, whose
   only content `R` was: deleting `a` from `> a` under `quotes: container` removes the quote): the
   result is zoomed into `R`'s nearest ancestor left, or not zoomed where none is. 3 and 4 aren't
   asked of a command here: removing `R` renumbers the items after it and settles the blank lines
   around it, outside, and that is the writer's own normalization, trusted. A host's edit
   (`leavesZoom`) has no operands to check and no writer behind it, so for it the exception holds
   only where `next`'s text is what ourus's own removal of `R` gives (`deleteSubtree` of `R` on
   this snapshot, renumbering and blank lines included): deleting `b` from `- a⏎- b⏎- c` and
   changing the hidden `c`'s marker to `*` in one transaction is still an escape;
1. else `R` keeps its id, its parent and its place among its siblings;
2. every node outside `R`'s subtree keeps its id, its parent, its kind and its text (its own,
   without its marker: a renumbering changes no node's text), no node is made outside it, and
   every node inside stays inside or is removed;
3. the text outside `R`'s own Markdown is the same: before `markdownStart(R)` and after its cover's
   end (`coverEnd`, each snapshot's own). The prefixes of `R`'s containers on the cover's lines (a
   quote's `>`, an outer item's indentation) are asked nothing of their own: one changed so that
   the parse reads otherwise takes a line out of its container or puts one in, which 2 or 4 sees (a
   blank line's `>` dropped in a quote's gap ends the quote there); one the parse reads alike is a
   way of writing `R`'s own lines, rendered the same (a lazy line's `>` dropped, `> - b⏎> c` to
   `> - b⏎c`). Asking each line's prefix would need the cover's lines matched across the edit,
   which a host's edit doesn't give. On a shared row (`- - a`, zoomed into the inner item) the outer
   item's marker is before `markdownStart(R)`: changing it to `+` keeps every node and every line
   outside the cover, and is refused here;
4. the lists `R` and its ancestors are items of are the same lists, the same items; and each of
   them with an item off `R`'s path (neither `R` nor one of its ancestors) is as tight or loose as
   it was (the parser's `tight`). Blank lines inside `R` decide how the nodes outside render, which
   no byte outside shows: in `- a⏎  - b⏎- c`, zoomed into `a`, a blank line before `b` makes the
   outer list loose, `c` keeping its id, parent, kind, text and every byte, and so does deleting the
   blank lines of `R`'s trailing gap in a loose list, the other way; `R`'s marker changed (`-` to
   `*`) splits its list, `c` in a list of its own. A list whose items are all on `R`'s path renders
   nothing else differently: in `- a⏎  - b` alone, zoomed into `a`, the same blank line is accepted.
   A node of the path that is no item is read as a list of its own, of one: made an item (a code
   block root indented, `- ` before its fence), it mustn't join the list beside it (Zoom13). An
   ancestor's own text, in such a list, wraps differently where the zoom is left, its words the
   same.

Otherwise the command is refused, `outside-zoom`, with no change, the `detail` saying what went
(`the zoom root went`, `node 3 left the zoom`). Without 0's operand clause, `deleteSubtree
{ nodes: [R, c] }` would take a hidden sibling `c` with `R` and pass. 2 catches what 3 can't: a
heading of the root's level made inside a zoomed section (outdenting a sub-heading, a pasted
heading) ends the section there, its lines unchanged but its nodes leaving `R` (Zoom3). 3 catches
what 2 can't: a blank line set apart, a prefix changed, outside; 4 what neither can: how the outside
reads, its bytes and nodes the same.

The invariant is `OurusDoc.zoomEscape(next, removed)` (clauses 1 to 4, `src/doc/view.ts`), asked by
the commands' guard and by `leavesZoom(doc, next)` for a host's edit (clause 0 in `commands/`, which
runs `deleteSubtree`). **Operands first**: an editing command whose operands (`nodes`, or the
selection's), as given, aren't all `R` or inside it is refused before it runs; a host clamps a
selection into `zoomRange()` first, and `nodes` from a tree pane or a dialog are checked as given.
The view commands aren't editing: `zoomIn` takes any node of the document (a re-zoom: an ancestor, a
search result, a link's target), `fold` any node (a fold outside the zoom is view state, shown when
it is), and `zoomOut` and `clearZoom` none; `copy` and `drag` change nothing.

### 4.2 The rules at the edge

The rules say what a command does at the boundary; the invariant refuses what they leave. No
refusal names its rule: every one is the invariant's, and the table's refusals are its cases.

| Command | With no zoom | At the zoom's edge |
| --- | --- | --- |
| `enter` at the end of an item `R`'s text (rule 8) | its next sibling | its first child (Zoom1, obsidian-outliner's `listIsZoomingRoot`) |
| `enter` mid-text in an item `R` (rule 7) | the rest a sibling (`enterMidItem: sibling`) | the rest `R`'s first child, as `child` (Zoom10) |
| `enter` on an empty item `R` (rule 3) | as `enterOnEmptyItem` says | a new first child, whatever it says (Zoom14) |
| `enter` at `R`'s text start (rule 6, `into`) | a new node above | refused |
| `enter` in a heading `R`'s title (rule 9) | the rest the section's first paragraph | unchanged: inside `R` |
| `enter` in a paragraph `R` (rule 9) | two paragraphs, the second `R`'s sibling | refused: a paragraph holds only a list it owns, and Enter makes no item |
| `enter` at the end of an atom `R` (rule 11) | a paragraph after it | refused |
| `enter` at the end of a folded `R` | the next sibling, after the subtree | its first child, `R`'s fold suppressed (Zoom5) |
| `deleteContentBackward` at `R`'s text start | `R` joins the node above | refused (Zoom2); a heading root's `#`s go where nothing leaves (`# ┃T⏎- x`), refused where its section would leave it |
| `deleteContentBackward` in `R`'s marker, `markup: text` | the host's (Backspace42) | refused (Zoom4, §4.3) |
| `deleteContentForward` at the end of `R`'s cover | the node below joins, or the blank line goes | refused (Zoom12) |
| `indent`, `outdent`, `moveSubtreeUp`/`Down` of `R` | | refused (Zoom13) |
| `outdent` of a child of `R` | a sibling of `R` | refused (Zoom11) |
| `moveSubtreeUp`/`Down` at `R`'s first or last child | crosses into the neighbour of `R` | refused, `no-previous-sibling` / `no-next-sibling` |
| `outdent` of a sub-heading, `paste` of a heading, that would end `R`'s section | | refused (Zoom3) |
| `deleteSubtree`, `cut` of `R` | | applied where its operands are `R` and nodes inside it, its textless ancestors going with it; zoomed into the nearest ancestor left (Zoom9) |
| `drag` | its places | only places inside `R` (Drag8, §5.3) |

`R` can always be edited in its own text, and every node inside it as anywhere.

### 4.3 Deferred edits

A deferred command never reaches the check: `deferredToHost` leaves the edit to the host's default,
which ourus doesn't see. Backspace inside `R`'s own marker defers under the default `markup: text`
(`- a⏎-┃ b`): the host's default deletes the `-`, and ` b` becomes a continuation line of the
hidden `- a`; `R` has escaped. Two guards, both:

- **Under a zoom, ourus doesn't defer where the host's default would reach outside** (`zoomed`,
  `src/commands/zoom.ts`). In `R`'s first row before its text (its marker, its checkbox, its `#`s,
  a quote's `>`, an ancestor's marker on a shared row), and at its text start too for a key that
  breaks the line (an atom's fence: the break would go before `R`), it refuses, `outside-zoom`.
  Elsewhere, a key whose default is a plain edit in every host (a character typed, Backspace,
  Delete, a soft line's Backspace) it plays itself, `doc.update` with the caret after, and refuses
  where `leavesZoom`: that is the invariant itself, not a list of edges (a list missed Delete at
  the end of the trailing gap, Zoom12). Enter's default differs by host (CodeMirror continues the
  markup, or indents), so a deferred Enter or Shift-Enter inside `R` stays the host's, the second
  guard behind it.
- **A host checks its own edits** before committing them, `leavesZoom(doc, next)` on the snapshot it
  would commit (§2.5): a deferred command's default, typing, its editor's own commands, in a
  transaction filter (§5.4). This covers what the first guard can't foresee, whatever the host's
  default does.

## 5. The API

### 5.1 The snapshot (`doc.ts`)

```ts
export class OurusDoc {
  /** The nodes whose children the view hides (§2.2). */
  readonly folded: ReadonlySet<number>;
  /** The node the view is zoomed into; null: the whole document (§2.3). */
  readonly zoom: number | null;
  /** The folds in effect within the zoom: those of the nodes strictly inside its root; all of `folded` where not zoomed (§2.4). */
  readonly zoomFolded: ReadonlySet<number>;

  /** The same document with these folds; an id that doesn't fold, or isn't here, dropped. */
  withFolded(ids: Iterable<number>): OurusDoc;
  /** The same document zoomed into `id`, or not zoomed; throws where `id` is no node here, or the root. No fold changes (§2.4). */
  withZoom(id: number | null): OurusDoc;

  /** What folding a node hides, in offsets; null where it doesn't fold (§2.2). */
  foldRange(node: OutlineNode): { from: number; to: number } | null;
  /** The node a row's fold is: the outermost starting on `line`; null where none starts there (§2.2). */
  rowOwner(line: number): OutlineNode | null;
  /** What the zoom shows, in offsets, through the root's trailing gap (§2.3); null where not zoomed. */
  zoomRange(): { from: number; to: number } | null;
  /** A node's last line with its descendants' and the blank lines after them (§2.3). */
  coverEnd(node: OutlineNode): number;
  /** Whether the view hides a node: under a fold in effect, or outside the zoom (§2.4). */
  isHidden(node: OutlineNode): boolean;
  /** Where `next`, a later snapshot of this lineage, leaves this one's zoom (§4.1's clauses), or null; `removed`: the root went whole. */
  zoomEscape(next: OurusDoc, removed?: boolean): string | null;

  /** For another view of this lineage: this snapshot's text, ids and marks, with `view`'s folds and zoom carried onto it (§2.5). */
  withViewOf(view: OurusDoc, changes: readonly ChangeSpec[]): OurusDoc;
  /** Another text; with `like`, the snapshot of this lineage it returns to (an undo's), whose nodes it takes, the view carried (§2.5). */
  replace(text: string, marks: readonly Mark[], options?: { readonly like?: OurusDoc }): OurusDoc;
}

// commands/: the invariant for a host's own edit, clause 0 included (it runs `deleteSubtree`,
// which the document layer doesn't import)
export function leavesZoom(doc: OurusDoc, next: OurusDoc): boolean;
```

That is what a host can't get right without ourus's outline: the fold's extent and what holds
children, which CM6's `foldable` gets wrong; the row a fold belongs to, which `nodeAtLine` gets
wrong; the zoom's range through its gap; which folds a zoom suppresses, which an editor's own fold
state must not hold; the check that keeps a host's own edits inside the zoom; and how a second view
or an undo takes a snapshot another made, its ids the writer's. Carrying the view by line across a
`flavor` change is internal (`viewByLine`).

**Not built**, each a few lines on the above, exported when a second host wants the same (the CM6
demo needed none: its `nodeOfFold` and `titleOf` are a few lines each): `hiddenRanges()` (every
hidden range, merged, for decorations); `viewDepth(node)`; `breadcrumbs()` (the root's ancestors,
each with a plain title); `clampSelection` (a selection moved out of a fold to its start, into the
zoom's range); and the sync and persistence helpers, `withFoldedRanges` (CM6's `foldState` back into
the snapshot), `withHiddenLines` (VS Code's `visibleRanges`), `foldedLines` and `withFoldedLines`.

### 5.2 View commands (`types.ts`)

The hosts' keys: obsidian-outliner folds and unfolds at the caret (Mod-Up and Down) and folds a
guide's children (or unfolds them, any folded); obsidian-zoom zooms in at the caret or a bullet, and
out entirely; true-outliner folds, unfolds and toggles at a caret, a block selection or a guide's
subtree, zooms in, out one level, and clears. They are commands, not recipes on `withFolded` and
`withZoom`, for two rules a host would otherwise restate:

- **Which nodes a caret or a selection means**: the selection's topmost nodes, each as its row's
  node (`rowOwner`), so a selection across parents folds every subtree it covers; for a zoom the
  first of them in document order, whichever way the selection was drawn (true-outliner's rule).
- **The selection after**: a fold closed over the caret moves it to the end of the folded node's
  text; a zoom-in clamps it into the zoom; a zoom-out moves it out of folds back in effect. That is
  obsidian-outliner's `KeepCursorOutsideFoldedLines` and obsidian-zoom's
  `LimitSelectionOnZoomingIn`, which a host drops.

Six commands, one per app key, not three with parameters (`fold { fold? }`, `zoomOut { all? }`, as
first drawn): a parameter would only name the key. Each is one call, pure, `applied` with a `doc`
that differs from the input's only in `folded` or `zoom`, no changes, and the selection; a host
commits it as any. None scrolls: that's the host's.

```ts
  /** The nodes at the selection, or `nodes`, folded; a node that doesn't fold is left alone. Zoomed, the root's and its ancestors' folds are left alone (§2.4). */
  | ({ readonly type: 'fold' } & Nodes)
  /** Unfolded, as `fold`. */
  | ({ readonly type: 'unfold' } & Nodes)
  /** Toggled, as `fold`: unfolded where any of them is in `zoomFolded`, else folded; at a node that doesn't fold, its parent's (zoomed, at a leaf child of the root, nothing). */
  | ({ readonly type: 'toggleFold' } & Nodes)
  /** Into the selection's first topmost node in document order, or `nodes[0]` (a click on a mark, a breadcrumb). */
  | ({ readonly type: 'zoomIn' } & Nodes)
  /** Out one level, to the root's parent, or out of the zoom from a top-level root. Not zoomed: applied, no change. */
  | { readonly type: 'zoomOut' }
  /** Out of the zoom, whatever its depth. */
  | { readonly type: 'clearZoom' }

export type RejectReason =
  | ...
  /** A join with a node a fold hides: Delete at the end of a folded node's text. */
  | 'folded'
  /** Zoomed: the result would change, make or move a node outside the zoom root's subtree, or its operands are outside it. */
  | 'outside-zoom';
```

A guide's click passes `nodes` (obsidian-outliner's: the line's children; true-outliner's: the
subtree beside it), a bullet's or a mark's click too; a breadcrumb's is `zoomIn` with `nodes:
[id]` (`clearZoom` for the document's), not `withZoom(id)`: zooming out brings folds back into
effect, and the command moves the selection out of them. Fold all, fold to a level, org-mode's
cycling and Dynalist's zoom into a sibling are each a loop on `foldRange` or a `withZoom` until a
second host wants one.

### 5.3 `drag`

`drag` reads the snapshot's view (`ctx.doc.zoomFolded`, `ctx.doc.zoom`), its own `folded` and
`zoom` options gone: a folded node offers no places among its hidden children, one inside it being
its last (Drag7), and a fold of the zoom root or an ancestor hides no seam; zoomed, only places
inside the root (Drag8). `moveSubtree` and `pasteAt` keep the invariant as every editing command
does: a place outside the zoom given by a tree pane, the node moved out of the root's subtree, is
`outside-zoom`. The spec's `folded:` and `zoom:` keys, a drag's first, are every case's start now
(§6).

### 5.4 Hosts

- **CM6** (`demos/cm6/view.ts`, wired into `main.ts`; as built):
  - a `foldService` returns `doc.foldRange(doc.rowOwner(line))`, ahead of the Markdown language's,
    so CodeMirror's gutter and keys fold ourus's nodes; null for the zoom root's row and its
    ancestors' (their folds are suppressed, and a fold CodeMirror made there the next sync would
    undo);
  - after a transaction that changed the snapshot, `unfoldEffect` for every range in `foldedRanges`
    that isn't exactly a `foldRange` of a node in its `zoomFolded` (a range CodeMirror mapped
    through a rewrite can start on the folded node's row with the wrong end: Fold4's move), and
    `foldEffect` for each such `foldRange` it lacks: this one sync replaces obsidian-outliner's
    unfold-replace-refold. CodeMirror holds `zoomFolded` only, so a zoom in unfolds the rest there,
    and a zoom out folds them again;
  - a fold made by CodeMirror (its gutter, its keys, a placeholder clicked open) goes into the
    snapshot: each folded range is the node whose `foldRange` it is exactly, starting on the range's
    row or ending its text there (a text of several lines folds from its last line, where no node
    starts), the one already in `folded` where two are (an inner node's fold, made through the API,
    round-trips so), else the row's `rowOwner`; the folds outside `zoomFolded`, which CodeMirror
    never had, are kept;
  - the zoom: two block-replace decorations, before and after `zoomRange()`, atomic; a transaction
    filter keeping user selections in the zoom the transaction leaves (not the one it starts in: a
    zoom out's selection, moved out of a fold back in effect, was pulled back in) and refusing, by
    `leavesZoom(doc, doc.update(changes, params))`, an edit with a user event that isn't ourus's, an
    undo or a redo (a change with none, a reload or a sync, can't be refused);
  - the history keeps, with each step's placeholders, the snapshot the step left, so undo and redo
    give `replace` its `like`: an undone or redone move keeps its fold. Where CodeMirror groups edits
    into one step (a move and the typing right after it), the step holds each one's, the latest
    first: the state it returns to is the last's;
  - keys: Mod-Up and Down fold and unfold, Mod-. zooms in, Mod-, out a level, Mod-Shift-, all the
    way; a breadcrumb panel, its links the view's commands (`zoomIn` with `nodes`, `clearZoom`),
    keeping the editor's focus.
- **VS Code**: a `FoldingRangeProvider` from `foldRange` (start: `textLastLine`, end: `endLine`).
  VS Code keeps the fold state and shows none of it: `visibleRanges` is the viewport's visible
  lines, folded lines left out, so a line below the viewport is as absent as a folded one. On
  `visibleRanges` changing, the host reads a fold only from a gap bounded by visible lines: a node
  is folded where its own row is visible, the lines of its `foldRange` absent, and a line after
  them visible in the same range set; unfolded where its row and the line after it are visible. A
  node whose row is hidden (under another fold), or whose fold reaches past the viewport's edge,
  keeps what the snapshot has: folding `a` in `- a⏎  - b⏎    - c` would otherwise read `b` as
  folded too, and a parent at the viewport's bottom as collapsed. So the read-back is partial by
  construction; a VS Code host keeps the snapshot as the record, folding through its own commands
  (`editor.fold`, `editor.unfold` with `selectionLines`), and reads back only what its user folds
  with VS Code's gutter. Not built.
- **A TUI, GTK**: rows from the lines that `zoomRange` and the `foldRange`s of `doc.zoomFolded`
  leave; GTK an invisible tag over each range hidden. Not built.
- **The textarea demo** has no folds or zoom: a textarea can't hide lines (a projection, §11), and
  its undo is the browser's, which never sees a snapshot.

## 6. The spec

Two files, `spec/fold.md` and `spec/zoom.md`, each with its commands and rules first, as the
others; the view's commands are actions (`> fold`, `> toggleFold ①` with its `nodes`, `> zoomIn ①`,
`> zoomOut`, `> clearZoom`, as `drag ③` names its node). **The start's config block** gives the
snapshot's view for every case: `folded: ①, ②` and `zoom: ①`, by label. **A step's `yaml` block**
may say `folded:` and `zoom:` (`none`): the state after the step, checked where given. The buffer
draws the whole text, hidden lines too: what is hidden is said by `folded` and `zoom`, and the
reader knows the ranges from §2.

| Case | What it pins |
| --- | --- |
| Fold1 | Enter at the end of a folded item: its next sibling, after its hidden children |
| Fold2, Fold2b | Split mid-text: the fold goes with the half that takes the children; under `enterMidItem: child`, the rest after the subtree, the fold kept |
| Fold3 | An empty item after a folded one goes, the caret at the folded item's text end |
| Fold4 | A folded node moved keeps its fold |
| Fold5 | Enter on an empty folded item with children: its next sibling, after them |
| Fold6 | Indent under a folded sibling: the fold opens |
| Fold7 | Delete at a folded node's end: refused, `folded` |
| Fold8 | A folded node's copy is folded too |
| Fold9, Fold10, Fold12 | `fold` at the caret, the caret moved to the fold's start; `unfold` |
| Fold11 | `toggleFold` at a leaf toggles its parent's fold |
| Fold13 | Enter at a folded heading's end: the fold opens |
| Fold14 | Paste at a folded item's end: after the subtree |
| Fold15, Fold15b | Backspace after a folded item: into its text, the fold kept; with children of its own, they follow and the fold opens |
| Fold16, Fold17 | A folded item moved, or indented, and the edit undone (and redone): folded throughout, the same node |
| Zoom1, Zoom10, Zoom14 | Enter at the end of an item root, mid-text, on an empty root: its first child |
| Zoom2, Zoom4, Zoom12 | Backspace at the root's start, in its marker; Delete at the end of its cover: refused |
| Zoom3, Zoom11, Zoom13 | An outdented sub-heading ending the section, a child outdented, the root indented into a list: refused |
| Zoom5 | Zoomed into a folded node: its fold hides nothing, and stays stored |
| Zoom6, Zoom7, Zoom8 | `zoomIn`, `zoomOut` a level, `clearZoom`; a click on a mark |
| Zoom9 | The root deleted: zoomed into its nearest ancestor left |
| Drag7, Drag8 | A pickup's places under a fold and in a zoom (`spec/drag.md`) |
| Backspace45c | `joinWithChildren: refuse` refuses a join that takes children down a level, or among another's (`spec/backspace.md`) |

## 7. The tests

- **The spec** (`test/spec.test.ts`, `test/spec-run.ts`, `test/player.ts`): every case's start built
  with `withFolded`/`withZoom` from its config block (a `folded:` label on a node with nothing to
  fold is an error, not a silent drop); `folded:`/`zoom:` after a step checked by label; after every
  action the view's three rules (`viewHolds`): no selection end in hidden lines, every fold with
  something to hide, a zoomed applied command keeping the invariant (which the command checked
  itself: this checks the check). The player plays the view's actions, guards a host's own edit as
  a host does (`leavesZoom` on the snapshot it would commit, the step refused `outside-zoom`), and
  plays undo and redo with `replace`'s `like`; an edit from outside skips the guard. The tab passes
  (`tabs.ts`, `obsidian-tabs.test.ts`) build their starts the same way.
- **The exhaustive test** (`test/view-exhaustive.ts`, `npm run test:view`): every distinct start
  buffer the spec draws, each node folded alone, each as the zoom root, and each as the root with
  every node that folds folded; 13 commands at every visible line's text start, middle and end;
  zoomed, the editing commands given each node outside the zoom (refused before they run), and
  `zoomIn` and `fold` at it (applied, the text unchanged). A result that breaks §2.4's rule, or
  §4.1's read independently (the outline outside the root re-read without ids: kinds, texts, where
  lists start, tightness; a deferral's plain default through `leavesZoom`, not the guard's own
  edges), fails. The first version reused `zoomEscape` and the guard's list of edges, and so could
  find nothing they missed; read apart, it found the trailing gap's end (Zoom12) and a code block
  root joining a list (Zoom13). Now 870 buffers, 245,454 runs in about 6 seconds, none failing
  (`view-exhaustive.baseline.json`, empty).
- **Properties** (`test/doc/view.test.ts`), over generated documents and host edits on a folded and
  zoomed snapshot, each against its own rule recomputed from the two texts: `doc.update` keeps a
  fold exactly where what it hides is the same, and ends the zoom exactly where its root is gone or
  a node left its subtree; `leavesZoom` is true exactly where §4.1's invariant fails. Among the
  edits, the gap's and blank lines inside the root: refused exactly where they change the tightness
  of a list with an item off the root's path, accepted in `- a⏎  - b` alone. And cases: a second
  view taking a command's move by the writer's ids (a replay losing the folds), an undo with `like`
  keeping the moved node and its fold, a hidden sibling's text refused as a host's own edit and
  kept as another view's, a prefix the parse reads alike accepted, `withConfig` across a `flavor`
  change carried by line, a line written over keeping its node (`test/doc/outline.test.ts`).
- **The SxS** (`sxs/lib/view.ts`): a doc's `view`, by the app's rows (a block app's blocks, a text
  app's lines), loaded with a case's start and read after each step, ourus's from its replay of the
  case (`drawnSteps` gives each step's), compared as the reader sees it (the folds in effect, the
  zoom root), and drawn as a state's last line, `⟦folded 2 4; zoom 1⟧`, for reports and rejudging.
  `Driver.folds` and `Driver.zooms` say what an app has, a case needing one it lacks skipped ("no
  folds", "no zoom"); a title-shaped zoom root the driver can't put a caret in (RemNote's, Athens's)
  skips the cases with the caret there (`holds`). How each app loads and reads its view, its keys,
  and what it does are in its README (`sxs/<app>/README.md`, "Folds and the zoom, measured"). Folds
  in 16 setups (every one but BlockNote, whose blocks don't fold, and Emacs, whose outline is
  headings', not driven), a zoom in 11 (true-outliner, Outliner, Logseq OG and DB, WorkFlowy,
  Dynalist, Roam, Tana, RemNote's two, Athens; SiYuan's editor holds only the zoomed subtree, not
  read). The Outliner setup, "Obsidian (Outliner)", always has Zoom (`obsidian-zoom`, its author's,
  which Outliner reads) in its vault; its full run with it, compared with the one before, moved no
  verdict.
- **The CM6 demo** (`demos/cm6/smoke.ts`, real keys in Chromium): a fold by Mod-Up and by
  CodeMirror's own key, then Enter after it; an item of two lines of text folded by CodeMirror's
  gutter, and its placeholder clicked open, the snapshot following both; a folded item moved, the
  move undone, and done again, still folded (each failing without `like`), and undone with the
  typing CodeMirror grouped with it; a zoom, Enter at its root's end, Backspace at its
  start refused, zoomed out and joined; a breadcrumb zooming out of a root under a folded ancestor,
  the caret at the ancestor's text end.

## 8. What the apps do

Measured by the SxS and checked where a result looked like the harness's (Fold15: by hand in
Chromium, screenshots before and after, and the same key with nothing folded). Where the block apps
agree, that is the rule (§11); where they split, it says so.

- **Enter on a folded item** (Fold1, Fold5): the next sibling after the subtree, in every block app
  (SiYuan otherwise on the empty one); the text editors don't.
- **Enter mid-text in a folded item** (Fold2, Fold2b): under `enterMidItem: child`, Logseq OG and DB,
  Tine, Tana, RemNote's two and SiYuan put the rest after the children, the item still folded, as
  ourus now does; true-outliner makes it the first child and opens the fold, as ourus did.
- **Indent under a folded sibling** (Fold6): every block app but SiYuan opens the fold, as ourus;
  the text editors keep it, hiding less than it did.
- **Delete at a folded node's end** (Fold7): no app opens the fold and joins, as ourus did. Every
  block app does nothing, as ourus now refuses; bare Obsidian deletes the hidden children,
  true-outliner the whole document, Outliner joins and keeps the fold, SiYuan makes the child a
  paragraph of the item, SilverBullet joins the next line as text.
- **Backspace right after a folded node** (Fold15): every block app that joins (Logseq OG and DB,
  Roam, Athens, Dynalist, Tana, Tine, RemNote's two) joins into the folded node's own text, the fold
  kept, as ourus now does; WorkFlowy does nothing; Outliner and true-outliner join into the hidden
  last descendant, as ourus did. With nothing folded, the same apps join into that descendant, so
  it is a fold's rule, not their Backspace's.
- **The joined node has children** (Fold15b): Tine and RemNote's two join and keep the fold, hiding
  them, Logseq DB too, them first among the folded node's; ourus opens the fold. Logseq OG, Roam,
  Athens, Dynalist, Tana, WorkFlowy and Outliner do nothing, under `joinWithChildren: refuse`, and
  do nothing unfolded either where the join would take the children down a level (Backspace45c).
- **Toggle at a leaf** (Fold11): true-outliner and SilverBullet toggle the parent, as ourus; every
  block app with a toggle, bare Obsidian and Outliner do nothing.
- **Paste at a folded item's end** (Fold14): no app opens the fold, as ourus did. SiYuan, Tine, Tana
  and Athens put the item after the subtree, Athens though it pastes first among an item's children
  otherwise, as ourus now does; Logseq OG and DB put it first among the children, hidden, the fold
  kept; WorkFlowy, Dynalist, RemNote and Roam join it into the text; the text editors paste the text.
- **An undo, a redo, of a folded item's move or indent** (Fold16, Fold17): every block app that plays
  them, true-outliner and SilverBullet keep the fold, as ourus now does; Outliner loses it; bare
  Obsidian doesn't fold the moved item at all.
- **The zoom root deleted** (Zoom9): WorkFlowy and Dynalist zoom out to the parent, as ourus; Logseq
  OG and DB, Roam and Tana end the zoom.
- **Enter mid-text in an item root** (Zoom10): Logseq OG and DB, Roam, Dynalist and Outliner make the
  rest its first child, as ourus; where the root is a title, WorkFlowy makes an empty first child,
  Tana and true-outliner do nothing.
- **An edit across the zoom's edge**: Backspace at the root's start (Zoom2) is refused by Logseq OG
  and DB, Roam, Tana, WorkFlowy and true-outliner, as ourus, and made by Dynalist and Outliner, which
  then leave the zoom; an outdent out of the root (Zoom11) is refused by every block app but Logseq
  OG and Dynalist, and by true-outliner, and made by those two and Outliner; Delete at the end of
  the root's trailing gap (Zoom12), played in the two Obsidian setups only, is made by both, the
  list outside made tight.

Drag7 and Drag8 are skipped everywhere: a pickup, `drag ③`, which no app plays.

## 9. How it was built

In this order, each step on the ones before; what the review and the measures changed is folded in.

1. **Ids for an edit in place** (`src/doc/outline.ts`): `Build.mapLine` read a line whose whole
   content a change covered as deleted, so typing over a node's text gave it a new id, and every
   rule after leans on ids. It now takes `writtenOver`: a line a change replaces from its start with
   text of its own went where that text starts (only `assignIds` passes it; the reuse of old nodes
   still reads such a line as gone). The kind is the key's (`kind@line`), so a paragraph typed over
   with `- x` is a new node. An undo of a split, `- a①` written over with `- ab`, is ① again.
2. **The snapshot's state** (`src/doc/view.ts`, `src/doc/doc.ts`): the fields, `withFolded`,
   `withZoom`, `zoomFolded` (cached per snapshot), `foldRange`, `rowOwner`, `zoomRange`,
   `coverEnd`, `isHidden` (the last two public, not internal as first drawn: `drag` and the commands
   reach the snapshot through its API), and the carry by line across a `flavor` change. With no
   folds and no zoom an update does no view work, and a snapshot made by `withFolded`/`withZoom`
   shares the outline and its id index. `DocUpdateParams.setFolded`/`setZoom`, a writer's view set
   outright, were built and dropped: one carrying rule served every edit.
3. **`drag` onto it**: its `folded` and `zoom` options gone, reading the snapshot; the spec's start
   built with the view for every case, the player's state losing its own `folded`/`zoom`.
4. **The view's commands** (`src/commands/view.ts`): `fold`, `unfold`, `toggleFold`, `zoomIn`,
   `zoomOut`, `clearZoom` (first drawn as `fold { fold? }` and `zoomOut { all? }`), and
   `visibleSelection`, which every command's result goes through.
5. **A host's edit** (`carryView`, `withViewOf`, `leavesZoom`): one rule for a fold, what it hides
   compared as nodes, not where a change touched its range (the first design's, which a move of the
   folded node breaks). Review widened the window a change is looked for in to the folded node's own
   lines: `## A` made `# A` grew its section with its fold kept, `B` hidden unseen; the property test
   holds the carry to the rule itself now, the window only a shortcut it checks.
6. **The zoom's invariant** (`zoomed` in `src/commands/zoom.ts`, around every command but the view's,
   `copy` and `drag`): the operands, then the command (a deferral where ourus doesn't do a case yet
   included: it was added after the check before, and escaped it, which the exhaustive test found
   1,373 times), then the result through `zoomEscape`. Clause 3 compared each cover line's prefixes
   first, which a host's edit can't be checked by; clause 4 skipped a path node that is no item, and
   a code block root indented joined the list beside it (Zoom13); the first guard was a list of
   edges and missed Delete at the trailing gap's end (Zoom12), and plays the plain default through
   `leavesZoom` now. Backspace at a heading root's start takes its `#`s where nothing leaves, against
   the first table's "refused, both": the invariant's answer, kept. The Enter rows are rules
   (`enter.ts`): at an item root's end, mid-text, and on an empty root, its first child.
7. **The variants under a fold**: as rules, Enter after the subtree at a folded item's end and on an
   empty one (`children: 'stay'`, `place('after')`), a split's fold to the half with the children,
   a duplicate's copies folded (`withFolds`); the rest from steps 4 and 5 with no rule of their own
   (the caret at the folded item's end, the folds that open). Then from the measures (§8), as rules:
   Delete at a folded node's end refused (`delete.ts`, the reason `folded`); under `enterMidItem:
   child`, a split's rest after the subtree (`enter.ts`); a paste at a folded item's end after its
   subtree (`paste.ts`); Backspace after a folded node into its text (`backspace.ts`); an undo
   keeping the folds of the nodes it writes back (`replace`'s `like`, the player and the CM6 demo).
8. **The SxS** for the rows nobody had measured (`sxs/lib/view.ts`, every driver's view): what §8
   says.
9. **A CM6 host** (`demos/cm6/view.ts`): what §5.4 says; it needed none of the helpers not built
   (§5.1).

## 10. Along the way

The same unit of work changed, besides folds and zoom:

- **Names**: `moveSubtreeTo` is `moveSubtree` (and the spec's action `move`), its files
  `src/commands/move-subtree.ts` (the drop) and `move-subtree-by.ts` (up and down); the SxS
  READMEs' action tables name `src/commands`' commands (`paste`, not the old `pasteStructured`,
  `mouse`), and list each app's shortcuts once.
- **The spec split**: `spec/drag.md` keeps `drag`, the pickup and its places (Drag1 to Drag8);
  `spec/move-subtree.md` has the drop (MoveSubtree1 to MoveSubtree24); `spec/paste-at.md` a drop
  from outside and a drag of selected text (PasteAt1 to PasteAt5).
- **Copy and paste agree**: every item pastes as `duplicateSubtree` copies it (`test/copy-paste.ts`
  passes, its baseline recorded). A pasted item keeps its own form from the clipboard, its marker's
  padding or a tab after it, as all six apps measured do, and sits lined up with the item it is
  pasted at (the draft's `separator`, `lineUp`, `padding`; the writer's verbatim prefix, on its
  marker's line only in an unspaced quote, `>- a`). A tab spans by where it lands: one that would
  put the text more than four columns past the marker there, making it code, is a space
  (`separatorAt`, Regression65); a text below its marker sits one column past it, in the draft as
  the writer writes it (Regression66, and the seam check's prefix for the item's children); a duplicate keeps a loose list's spacing; the
  end gap of a paste moves with it (`moveGap`).
- **The writer**: a line written over keeps its blank-line spaces where it is one the old text had
  (a fence's blank line in an item, `  `), matched by the lines on both sides; the draft's seam check
  reads a moved item at the column the writer puts it (`#movedIn`); a first child moved onto a
  textless item's marker line sits at its content column, not the indent unit's
  (DeleteSubtree12's moves); an empty paragraph can't be an item's first block with no text
  (`leaveList`, refused). No differential run, move or drop fails to write; `KNOWN` in
  `test/moves.test.ts` and `test/drops.ts` is empty.
- **`joinWithChildren: refuse`** also refuses a join of an item with children into an item that
  has children of its own or sits at another depth, as the apps under it do (Backspace45c, §8).
- **The SxS**: "Obsidian (Outliner)" sets up Outliner and Zoom together; the summary tables link to
  each file's cases (`#backspace.md`); the READMEs document each app's fold and zoom keys.
- **Baselines**: the inverse pairs' and copy-and-paste's recorded again for the new cases, the
  inverse pairs' groups moved only where the changes above meant them to (more round trips come
  back: pasted items' form, fence blank lines).

## 11. Decided, and open

Decided, with the reason:

1. **The state lives on the snapshot** (§2.1), not in a fourth argument and a `view` in every
   result: every command reads it, and it is carried as placeholders are.
2. **A row's fold is the outer node's** (§2.2), as indentation folds and as a reader sees the row;
   the inner node's by the API only.
3. **The view's actions are commands** (§5.2), for the two rules they carry (which node, the
   selection after), one per key; fold all, to a level, cycling and a sibling's zoom are recipes
   until a second host wants one.
4. **Under a zoom, both guards** (§4.3): ourus refuses in the root's markup and plays a
   plain-default key's edit through `leavesZoom`; the host checks the rest.
5. **The zoom root's and its ancestors' folds are ignored while zoomed** (§2.4), not opened by
   `zoomIn`, so zooming out finds the reader's folds as they left them.
6. **A toggle at a leaf toggles its parent** (Fold11), as true-outliner and SilverBullet: a toggle
   that does nothing there leaves no way to fold from where the reader is by key; the apps that do
   nothing fold the parent by a click on its bullet.
7. **No join into hidden text**: Delete at a folded node's end is refused (Fold7), Backspace after
   one joins into its visible text (Fold15), each as the block apps; the reader's folded node stays
   folded.
8. **The block apps' visible variants are rules, not options** (Fold2b, Fold14), every app that
   plays them agreeing: an option waits for two camps.
9. **An undo takes back the nodes** (`replace`'s `like`, Fold16), as every app but Outliner keeps
   the fold.

Open:

1. **The zoom root deleted** (Zoom9): the nearest ancestor left (WorkFlowy, Dynalist, ourus), or no
   zoom (Logseq OG and DB, Roam, Tana, true-outliner). Two camps, so an option,
   `zoomAfterRootDeleted: parent | none`, where a host asks; either way only where every operand as
   given is the root or inside it.
2. **The joined node's children, under a fold** (Fold15b, under the default `joinWithChildren:
   join`): ourus opens the fold, so nothing it moved is hidden; Tine and RemNote keep it folded,
   hiding them.
3. **A move into a folded section** (`moveSubtreeUp`/`Down` 4, 5): the fold opens, unmeasured.
4. **Folds in the file**: a callout's `[!type]-` is a fold written in the file, which Obsidian
   reads, and Logseq OG writes `collapsed:: true`; an option `foldStorage: view | marker` where
   folding is an edit. Later: the callout's sign is read already (`ProseText.callout.fold`), and a
   host may start a snapshot's folds from it.
5. **A textarea's projection** (§1.4): later, with the first host that has no way to hide lines.
6. **Filters** (§1.4): a hidden set by a predicate, ancestors of matches shown; later, as a third
   field beside `folded` and `zoom`, with §2.4's rule and §4's invariant over what it shows. Nothing
   in §5 assumes hidden means folded or zoomed out.
7. **The helpers not built** (§5.1), each with the second host that wants it.
