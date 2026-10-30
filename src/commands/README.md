# Commands

What an outliner's keys do to Markdown text: the layer a host calls. A command takes a document and
a selection, and returns one of three things: the changes that do what the key means (checked
before they are returned), a refusal with the reason, or "not applicable", in which case the host
runs its own default. Commands are pure: they never touch editor state, and the host commits what
they return. Their behavior is specified case by case in `spec/`, as drawn editor states and the
keys pressed between them.

Basic usage:

```ts
import { OurusDoc, OurusView, OurusDeferred, OurusRejected, executeCommand, settlePlaceholders } from 'ourus';

let ourus = OurusView.of(OurusDoc.parse(text, { config: { flavor: 'obsidian' } }));
const result = executeCommand(ourus, { type: 'indent' }, { anchor, head });
if (result instanceof OurusDeferred) {
  // let the editor do its default
} else if (result instanceof OurusRejected) {
  status.textContent = result.reason;      // swallow the key, say why
} else {
  view.dispatch({ changes: result.changes, selection: result.selection });   // CM6 takes them as they are
  ourus = result.view;                     // its text: result.view.doc
}

const settled = settlePlaceholders(ourus, caret);   // after the caret moves
if (settled) { view.dispatch({ changes: settled.changes }); ourus = settled.view; }
```

## API

- **`executeCommand(view: OurusView, command: OurusCommand, selection: OurusSelection): OurusResult`**<br>
  Runs a command at the selection. Where ourus doesn't handle a case yet, a key the host has a
  default for is left to the host (`deferredToHost`), and a structural command is refused as
  `unsupported`. An applied result carries the view after (`view`: the document after, the folds
  and zoom carried onto it, at each step of the command as its document was updated). Every command
  runs within the view's folds and zoom (`OurusView.folded`, `OurusView.zoom`):
  its result's selection is out of what the view hides (a caret in a fold's hidden lines at the
  fold's start); a fold whose hidden nodes it changed opens; zoomed, a command whose selection or
  `nodes` are outside the zoom root's subtree, whose result would change, make or move a node
  outside it, or that would defer to the host at the root's edges (its markup, its text's start for
  Backspace, its subtree's end for Delete), is refused (`outside-zoom`).

- **`leavesZoom(view: OurusView, next: OurusDoc): boolean`**<br>
  For a host's own edit (a deferred command's default, typing, an editor's own commands): whether
  `next`, the snapshot the host would commit (`view.doc.update({ changes, ... })` with the caret and marks
  it will give), leaves `view`'s zoom; the host refuses the edit where it does, before committing.
  The same invariant the commands keep; the zoom root removed whole is accepted only as
  `deleteSubtree` of it writes it. False where not zoomed. An edit that can't be refused (an undo,
  a sync, another view's) goes through `view.update` or `withDoc`, which end the zoom only where its
  root's subtree lost a node or its root went (to its nearest ancestor left).

- **`OurusSelection`** is `{ anchor, head }`, as in CM6's `selection.main` (defined in `src/text`;
  `Selection` before, still exported under that name, deprecated). A structural command (indent,
  move, ...) acts on the selection's roots: a subtree selection's (`OurusView.selectedSubtrees`, on
  a line nodes share the outer node), else the subtrees it touches (`OurusView.touchedSubtrees`, a
  caret's node). They must be contiguous siblings of the same kind. Given `nodes`, ids of contiguous
  siblings, it acts on those instead (a context menu, a tree pane, a "move to" dialog), the
  selection elsewhere staying in its text. Fold and zoom take the same roots, each as its row's
  outermost node.

- **`InsertionPoint`** is `{ parent, after }`: a place in the outline, under the node `parent` (or
  `'root'`), right after its child `after` (null: first). It names nodes, so it survives edits
  elsewhere.

- **`OurusCommand`** is `{ type, ... }`. Types are named after W3C's `inputType` where there is one:

  - `indent`, `outdent` (Tab, Shift-Tab)<br>
    The selected nodes move under the node above, or out of their parent. For headings, the level
    changes; paragraphs become items, and items paragraphs.

  - `moveSubtreeUp`, `moveSubtreeDown` (Alt-↑, Alt-↓)<br>
    The selected nodes swap with the sibling above or below. At the first or last child, they move
    into the parent's previous or next sibling.

  - `drag`, `{ pressed?, nodes? }` (a pickup)<br>
    What a drag takes (the pressed node, or the selection's nodes where it is one of them) and every
    place it can drop them: the result's `dropMap` (below) and the nodes' `clipboard`, the document
    unchanged. The folds and zoom are the view's (`OurusView.zoomFolded`, `OurusView.zoom`):
    none among a folded node's hidden children, none outside the zoom. With `{ clipboard }` instead, a drag from outside: the places for it, each
    point's drop a `pasteAt`.

  - `pasteAt`, `{ at: InsertionPoint, clipboard }` (a drop from outside)<br>
    The clipboard, read as paste reads it, fitted at the place as paste fits it there; the caret
    stays where it is.

  - `deleteByDrag` (a text drag's first half)<br>
    The selection deleted as a cut deletes it; the host's where ourus doesn't do it. The drop is a
    `paste` at the position the drop maps to, the two committed as one transaction.

  - `moveSubtree`, `{ to: InsertionPoint, nodes? }` (a drop)<br>
    The nodes, with their subtrees, move to `to`, converting where the place can't hold their kind
    (a paragraph under an item becomes an item, a heading is re-levelled); at their own place,
    applied with no changes (spec/move-subtree.md).

  - `enter` (Enter)<br>
    Splits the node at the caret into two: a new item, or a new paragraph.

  - `shiftEnter` (Shift-Enter)<br>
    Inserts a line break inside the node's text; it stays one node.

  - `deleteContentBackward` (Backspace), `deleteContentForward` (Delete)<br>
    At the start of a node's text, Backspace joins the node into the one above; at the end of its
    text, Delete joins the node below into it. They also delete a selection across nodes. Inside a
    text, deleting a character is the host's default.

  - `deleteSoftLineBackward` (Cmd-Backspace)<br>
    Deletes back to the start of the line's text, never into a marker.

  - `copy`, `cut` (Ctrl-C, Ctrl-X)<br>
    Puts the selection's Markdown in the result's `clipboard`, as `text/plain`, `text/markdown` and
    `text/html` (marked as coming from ourus). Cut also removes it.

  - `paste` (Ctrl-V), `{ clipboard: OurusClipboard }`<br>
    Pastes the clipboard, given in every format the host has (`text/plain`, `text/markdown`,
    `text/html`, ...). It is read as Markdown and inserted as nodes.

  - `pastePlain` (Ctrl-Shift-V), `{ text: string }`<br>
    Pastes text into the node at the caret, its line breaks inserted as Shift-Enter does.

  - `deleteSubtree`, `duplicateSubtree`<br>
    Deletes the selected nodes, or inserts a copy of them below them, with their subtrees.
    `deleteSubtree`'s `expectMarkdown`: only if a copy of the nodes still gives that text, for the
    source of a drag out to another document (its `drag`'s clipboard's `text/plain`).

  - `insertText` (typing), `{ text: string }`<br>
    Text typed at the selection, one key's worth. Ourus handles it where Markdown reads it as
    structure (a backtick: fences opened, closed and kept matched); otherwise it is the host's.

  - `fold`, `unfold`, `toggleFold`, `{ nodes? }` (a guide's click with `nodes`)<br>
    The view's (spec/fold.md): the nodes at the selection (each the outermost node starting on its
    row), or `nodes`, folded, unfolded, or toggled: unfolded where any is folded within the zoom, else
    folded; a toggle at a node with nothing to hide toggles its parent.
    Zoomed, the root's and its ancestors' folds are left alone. Applied with no changes, the
    selection moved out of what is now hidden.

  - `zoomIn`, `{ nodes? }`; `zoomOut`; `clearZoom`<br>
    The view's (spec/zoom.md): into `nodes[0]` (a click on its mark) or the selection's first root in
    document order; out one level (none from a top-level root); out of the zoom, whatever its depth.
    No fold changes; applied with no changes (not zoomed, the zoom-outs too), the selection moved into
    the zoom.

  - `selectNode` (Escape in Logseq, Tine, Tana); `expandSelection` (Ctrl-A in outliners,
    Shift-Alt-Right in code editors); `selectNodeDown`, `selectNodeUp` (Shift-↓, Shift-↑)<br>
    Selection (spec/select.md), no text changed: the node at the caret with its subtree, as whole
    lines (again: a caret at its text start); the next rung of the ladder, the node's text, its subtree, its
    siblings' run (`selectionLadder`), its parent's subtree, ..., every node, then the host's select
    all (zoomed, the root's subtree is the top); one node a press, growing away from the anchor's
    node and shrinking towards it, the host's a line at a time inside a node's text but from its
    edge. A host checks visual rows first: over a subtree selection the press is ourus's wherever the
    head is; otherwise, where the head isn't on its line's last row (first going up), its own
    Shift-↓ without asking ourus.

  - `addBlockId`, `{ name?, node? }`; `removeBlockId`, `{ name?, node? }`<br>
    Block ids, where the flavor has them (spec/block-ids.md): a block id for `node` (else the
    selection's node), `name` or six random characters, in the form its kind takes (` ^id` ending a
    text; a line after an atom, a blank line between; a line under a quote of several blocks, its
    last paragraph's), on the item for a block inside one, which is what Obsidian names by it; with
    `node`, the caret after it. Refused (`block-id`) where one already names it, or the note has
    `name`. And block id `name` deleted, attached or stray (where the note has it twice, the one
    `node` owns), or without `name` the one a link to the selection's node uses. Each checks its own
    result: what it wrote names the node, what it removed is gone, no other block id lost anything.

  Over a subtree selection (`OurusView.selectedSubtrees`), the keys that edit text act on its nodes
  (spec/subtree-selection.md): Backspace, Delete, Cmd-Backspace and cut delete them as
  `deleteSubtree` does; copy writes them, roots at two depths as siblings, whatever `copySelection`
  says; typing and a plain paste make one node in their place, under the first one's prefix; Enter
  and Shift-Enter put the caret at the end of the last one's own text; paste puts the clipboard's
  nodes in their place. A structural command keeps the selection on its nodes, in the shape given.

- **`DropMap`** is `{ nodes, lines, seams }`: the run's roots, each one's lines (`[from, to)`), and
  its `DropSeam`s in document order, each a gap between two nodes (`beforeLine`, the first line of
  the node below; `gapLines`, the blank lines before it; `nodeAbove`, `nodeBelow`) with its
  `DropPoint`s, shallowest first: an `InsertionPoint` with its `depth` (0 the top level), its
  `listDepth` (the list items it is inside, for a host that indents only lists), `current` (the
  run's own place), `converts` (the run changes kind there) and `drop`, the `moveSubtree` to run.
  A seam's y and a point's x are the host's pixels; a point's result is the drop's, which the host
  runs for the point under the pointer and draws, and commits on release.

- **`nearestDropPoint(seam, x, columnX, accepts): DropPoint | null`**<br>
  The point of a seam nearest the pointer's x (`columnX` the host's pixels for a point) that
  `accepts` takes (its drop applied, say), trying outwards; where columns tie, the run's own place,
  then one that keeps its kind, then the deeper.

- **`OurusResult`** is one of three classes, told apart with `instanceof`:

  - `OurusSuccess`: `view`, `changes`, `selection`, and `clipboard?`, `placed?`, `dropMap?`, `movedBlockIds?`, `mergedBlockIds?`, `removedNodes?`<br>
    The view after (its document the new one, node ids carried over, the folds and zoom carried
    onto it), the changes (`ChangeSpec[]`, in the old text's coordinates), the selection (in the
    new text), for copy and cut the clipboard formats (copy has no changes), for a pickup the drop
    map, and for a drop the ids of the nodes it put in place, for a host that selects them. Built
    `new OurusSuccess({ view, changes, selection, ... })`; adjusted, as a new one over the other's
    fields (`new OurusSuccess({ ...result, selection })`: a spread is a plain object, no success). Every applied command is checked: the new text, parsed, reads as the outline
    the command meant; and it keeps every block id (below). `movedBlockIds`: the block ids it wrote
    on another node on purpose (`{ name, to }`: a merge's node that stays taking the other's);
    `mergedBlockIds`: those a merge dropped for the other's (`{ from, into }`, `joinBlockIds:
    merge`), for a host that redirects the links to them. What else a command did to block ids, a
    host reads by comparing `OurusDoc.blockIds()` before and after.

  - `OurusRejected`: `reason: RejectReason`, `detail?` (`new OurusRejected(reason, detail)`)<br>
    The command does nothing; the host should swallow the key.

  - `OurusDeferred`: `detail?` (`new OurusDeferred(detail)`)<br>
    The command has nothing to do here (Backspace inside a text); the host runs its default. With the
    caret in markup, an edit ourus would refuse is also left to the host when the config treats
    markup as text (`markup: text`, the default); `detail` then says why ("a list marker isn't
    text").

- **`RejectReason`** is one of:

  - `no-previous-sibling`, `no-next-sibling`: indent or a move with nothing above or below to go to.
  - `at-top-level`: outdent of a node with no parent item to leave.
  - `at-h1-bound`, `at-h6-bound`: a heading level would go past 1 or 6.
  - `non-contiguous`, `mixed-kinds`: the selected nodes aren't contiguous siblings, or not of one kind.
  - `nothing-above`: Backspace at the first node, with nothing to join into.
  - `has-children`: a join that would have to drop children.
  - `not-expressible`: Markdown can't express the result (an empty node away from the caret, a
    heading that would span lines, ...); `detail` says what.
  - `would-reparent`: a move would give another node a new parent (a heading taking in what follows
    it).
  - `no-such-node`: an id the document doesn't have (it changed since the id was read).
  - `invalid-selection`: a selection whose ends aren't positions in the text, integers from 0 to its
    length (it changed since the selection was read).
  - `invalid-insertion-point`: a place whose `after` isn't a child of its `parent`, or is one of the
    nodes moved.
  - `into-itself`: a drop at a place inside the nodes moved.
  - `content-changed`: `deleteSubtree`'s nodes no longer give its `expectMarkdown`.
  - `folded`: a join with a node a fold hides (Delete at the end of a folded node's text).
  - `outside-zoom`: zoomed, the selection or nodes are outside the zoom root's subtree, the result
    would reach outside it, or a deferral would: in the root's markup, or where the key's plain
    default (typing, Backspace, Delete) would leave the zoom.
  - `block-id`: the result would lose a block id: written off the node it is on, naming another node
    or nothing, shadowed by another for what it names, or a name written twice; a merge of two nodes
    that both have one (`joinBlockIds: refuse`); `addBlockId` or `removeBlockId` with nothing to do.
    `detail` names the block id.
  - `unsupported`: a structural command ourus doesn't do here yet (a case no command covers).
  - `write-failed`: the writer failed, on a layout it has no rule for or a text that didn't read back
    as the command meant. This is always a bug in ourus, to fix.

- **`settlePlaceholders(view: OurusView, caret: number): { view, changes } | null`**<br>
  Settles the placeholders the caret has left: a node with a held space is written again without
  it; an empty item is written again so it holds without a placeholder; any other empty node is
  removed. The writer's steps (`settleSteps`, `writer/`'s README), the view carried through each;
  `changes` composed, for the host. Null when no placeholder is off the caret's line.

- **`OurusConfig`** chooses how commands behave where outliners differ. It is set when the document is
  made (`OurusDoc.parse(text, { config })`): `outdent`, `bullet`, `enterOnEmptyItem`, `enterMidItem`,
  `enterAtTextStart`, `enterSplitSpace`, `enterTask`, `backspaceAtTopItem`, `backspaceAtItemStart`,
  `emptyItemWithChildren`, `joinWithChildren`, `joinBlockIds`, `handleFenceContents`, `closeBackticks`,
  `headingEditing`, `taskEditing`, `copyAtCaret`, `copySelection`, `pasteSeams`, `pasteOverSelection`, `pasteLines`,
  `pastePlainLines`, `pasteAtTextStart`, `pasteOnParent`, `pasteParagraphList`, `pasteListForm`,
  `markup`, the quirks (`quirkEnterMidHeading`, `quirkPasteCaret`, `quirkPasteText`: one app's mechanics),
  and `flavor` (the only option that affects reading). Each option's choices and default are
  documented in `src/config.ts`.

The host's contract:

1. Keep one `OurusView` per editor (`OurusView.of(OurusDoc.parse(...))`). After every edit that
   isn't a command (typing, the editor's own paste), call `view = view.update({ changes, caret })`,
   with the caret where the edit leaves it.
2. On a command key, call `executeCommand`. Commit an applied result's changes and selection
   together, and keep its `view` (no need to parse again).
3. When the caret moves, call `settlePlaceholders(view, caret)`, and commit its changes as a
   separate edit.
4. Keep placeholders in the undo history: undo and redo must restore the placeholders of the state
   they return to. Save `view.doc.marks.points()` with each state, and restore with
   `view.update({ changes, setMarks: positions.map((pos) => createPlaceholder(pos)) })`; where the
   state's document is kept too, its nodes come back with it, `view.withDoc(like.withConfig(view.doc.config))`
   (an undone move keeps its fold). In CM6, `invertedEffects` can carry them; the demo does this.
5. Home goes to `doc.textStart(line)`, the start of the line's text, and pressed again, to the
   line's start.
6. Where the flavor has block ids, a link to a node uses the block id in `doc.blockIds()` that isn't
   shadowed and whose `target` is the node; "copy link to block" runs `addBlockId` where there is
   none. Links in other notes are the host's to keep: after a merge, redirect those to each
   `mergedBlockIds` pair.

`demos/cm6/main.ts` is a complete CM6 host; `test/player.ts` plays the same contract for the spec.

Every applied result is checked for block ids too, after the command (`checkBlockIds`, `doc/`):
each block id of the document before is on the node it was on, names what it named, and counts
where it counted, but where the command declared otherwise (`movedBlockIds`, `mergedBlockIds`:
claims the check holds it to, a block id moved still naming something, one merged into one that is
written and names something), one gone with a node the command says it removed (`removedNodes`) or
with the text it took (a selection typed over, cut), and every gain (one coming to name a node where
it named nothing). Else the command is refused as `block-id`. The check reads only the lines the
command reached, so a note without block ids pays nothing. A deferral is checked as well: the host's
default edit for the key (a character deleted, the selection replaced, a line break) is played, and
the key refused as `block-id` where that would lose one, but under `markup: text` the block id an
edit inside its own markup edits, which is the user's there (every other still checked). Where the
host's edit would lose one, ourus does the key itself if its own way keeps them all (a paste with
the duplicates dropped, typing over a selection across nodes as a deletion then the text), else
refuses. A paste keeps the block ids it brings only where new, read where they land
(`pasteKeepingNewBlockIds`: run with their names marked, two ways, so the result says which it
wrote): a `^x`
is one only where it ends a text. A caret on a
block-id line acts at the end of the text that carries it, and one in or right after a block id
ending a text, before it; under `markup: text`, the keys that edit the line or the id itself are
the host's.

Inside, a command works in three steps. It looks at what is at the selection (`ctx.from`,
`ctx.to`: `locate`'s zones). It describes the outline it wants in a draft (`ctx.draft()`: remove,
place, split, join, set a text, a gap, the caret). Then it applies the draft (`ctx.apply`): the draft's
`done()` puts it in normal form, writes the changes, and checks the new text against it (see
`writer/`). For
what a line, a marker or a fence is, commands ask `doc/`, or the parser when `doc/` doesn't say.

Files:

- `index.ts` (`executeCommand`, the dispatch on `command.type`); `types.ts` (`OurusCommand`,
  `OurusSelection`, `OurusResult` and its classes, `RejectReason`, `InsertionPoint`); `context.ts`
  (`CommandContext`: the view and its document, the selection located, the nodes given, `apply` and
  `update`, which carry the view); `util.ts`
  (shared helpers: the nodes a command acts on and their runs of siblings, the caret it leaves,
  markup at the caret, heading levels, deleting a held space, hidden spaces); `shape.ts` (the
  selection a structural command leaves where it follows the nodes: a subtree selection on the same
  roots, in the shape given); `select.ts` (the selection commands); `subtrees.ts` (the keys that
  edit text, over a subtree selection: on its nodes, one routing step before the commands); `view.ts`
  (the view's commands: fold, unfold, toggle, zoom in and out); `zoom.ts` (the zoom's guard around
  every command, and `leavesZoom`); `settle.ts` (`settlePlaceholders`, the view carried through the
  writer's steps).
- `indent.ts`, `outdent.ts`, `move-subtree-by.ts` (Tab, Shift-Tab, Alt-↑, Alt-↓); `move-subtree.ts`
  (the drop: the place checked, the run converted, the result checked); `drag.ts` (the pickup: what a drag takes,
  by the cover rule, its seams and places, the place one drop line names, `nearestDropPoint`); `delete-subtree.ts`,
  `duplicate-subtree.ts`; `enter.ts`, `shift-enter.ts`; `backspace.ts`, `delete.ts` (Backspace and
  Cmd-Backspace, Delete: at a node's boundary, or a selection across nodes); `code.ts` (keys inside
  code blocks, keeping a fence's run matched); `typing.ts` (typed characters Markdown reads as
  structure: a backtick, a tilde); `block-ids.ts` (`addBlockId`, `removeBlockId`, and the block ids a
  paste keeps: only new ones).
- `copy.ts` (copy and cut); `clipboard.ts` (reading a clipboard for paste: which format holds
  the Markdown, HTML converted by `MdHtmlParser`, lines read as they were where they were copied
  from; and writing one for copy); `paste.ts` (paste: where the nodes go at the caret, and fitting
  them there), `paste-plain.ts`.

Tests: the spec (`test/spec.test.ts` over `spec/*.md`, every example in every flavor);
`test/commands/commands.test.ts` (changes, text and selection agree; round trips; ids);
`test/commands/block-ids.test.ts` (the block-id commands, the check's refusals, merges, paste and
duplicate; and, over generated documents, the check where an edit reached agreeing with the check
of the whole document, and no command losing a block id); `test/placeholders.test.ts` (the
placeholders' lifecycle); `test/drops.test.ts` (every place a
pickup lists, dropped: a refusal or a result, at the known starts aside); `test/moves.test.ts` (every
node moved to every place, those only a tree pane or a dialog names too). The heavy suites, `npm run
test:heavy` (`test/heavy.ts`), on a frozen copy of the tree: the differential (`test/differential.ts`),
which compares every command's outcome with the last commit's; the inverse pairs (`test/inverse.ts`),
which run every pair of commands that undo each other at every caret position of the spec's
buffers, beside the last commit's code on the same buffers; and the view pass
(`test/view-exhaustive.ts`). Each runs alone with `node`. To look at one case by hand: `npm run probe` (`sxs/probe.ts --help`), on ourus alone
or side by side with the SxS apps.
