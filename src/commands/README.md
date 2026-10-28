# Commands

What an outliner's keys do to Markdown text: the layer a host calls. A command takes a document and
a selection, and returns one of three things: the changes that do what the key means (checked
before they are returned), a refusal with the reason, or "not applicable", in which case the host
runs its own default. Commands are pure: they never touch editor state, and the host commits what
they return. Their behavior is specified case by case in `spec/`, as drawn editor states and the
keys pressed between them.

Basic usage:

```ts
import { OurusDoc, executeCommand, settlePlaceholders } from 'ourus';

let doc = OurusDoc.parse(text, { config: { flavor: 'obsidian' } });
const result = executeCommand(doc, { type: 'indent' }, { anchor, head });
if (result.status === 'applied') {
  view.dispatch({ changes: result.changes, selection: result.selection });   // CM6 takes them as they are
  doc = result.doc;
} else if (result.status === 'rejected') {
  status.textContent = result.reason;      // swallow the key, say why
}                                          // 'deferredToHost': let the editor do its default

const settled = settlePlaceholders(doc, caret);   // after the caret moves
if (settled) { view.dispatch({ changes: settled.changes }); doc = settled.doc; }
```

## API

- **`executeCommand(doc: OurusDoc, command: Command, selection: Selection): CommandResult`**<br>
  Runs a command at the selection. Where ourus doesn't handle a case yet, a key the host has a
  default for is left to the host (`deferredToHost`), and a structural command is refused as
  `unsupported`.

- **`Selection`** is `{ anchor, head }`, as in CM6's `selection.main`. A structural command (indent,
  move, ...) acts on the topmost nodes whose own lines the selection touches. They must be
  contiguous siblings of the same kind. Given `nodes`, ids of contiguous siblings, it acts on those
  instead (a context menu, a tree pane, a "move to" dialog), the selection elsewhere staying in its
  text.

- **`InsertionPoint`** is `{ parent, after }`: a place in the outline, under the node `parent` (or
  `'root'`), right after its child `after` (null: first). It names nodes, so it survives edits
  elsewhere.

- **`Command`** is `{ type, ... }`. Types are named after W3C's `inputType` where there is one:

  - `indent`, `outdent` (Tab, Shift-Tab)<br>
    The selected nodes move under the node above, or out of their parent. For headings, the level
    changes; paragraphs become items, and items paragraphs.

  - `moveSubtreeUp`, `moveSubtreeDown` (Alt-↑, Alt-↓)<br>
    The selected nodes swap with the sibling above or below. At the first or last child, they move
    into the parent's previous or next sibling.

  - `drag`, `{ pressed?, nodes?, folded?, zoom? }` (a pickup)<br>
    What a drag takes (the pressed node, or the selection's nodes where it is one of them) and every
    place it can drop them: the result's `dropMap` (below) and the nodes' `clipboard`, the document
    unchanged. `folded` and `zoom` are the host's view: the nodes whose children it hides, the node
    it is zoomed into. With `{ clipboard }` instead, a drag from outside: the places for it, each
    point's drop a `pasteAt`.

  - `pasteAt`, `{ at: InsertionPoint, clipboard }` (a drop from outside)<br>
    The clipboard, read as paste reads it, fitted at the place as paste fits it there; the caret
    stays where it is.

  - `deleteByDrag` (a text drag's first half)<br>
    The selection deleted as a cut deletes it; the host's where ourus doesn't do it. The drop is a
    `paste` at the position the drop maps to, the two committed as one transaction.

  - `moveSubtreeTo`, `{ to: InsertionPoint, nodes? }` (a drop)<br>
    The nodes, with their subtrees, move to `to`, converting where the place can't hold their kind
    (a paragraph under an item becomes an item, a heading is re-levelled); at their own place,
    applied with no changes (spec/drag.md).

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

  - `paste` (Ctrl-V), `{ clipboard: Clipboard }`<br>
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

- **`DropMap`** is `{ nodes, lines, seams }`: the run's roots, each one's lines (`[from, to)`), and
  its `DropSeam`s in document order, each a gap between two nodes (`beforeLine`, the first line of
  the node below; `gapLines`, the blank lines before it; `nodeAbove`, `nodeBelow`) with its
  `DropPoint`s, shallowest first: an `InsertionPoint` with its `depth` (0 the top level), its
  `listDepth` (the list items it is inside, for a host that indents only lists), `current` (the
  run's own place), `converts` (the run changes kind there) and `drop`, the `moveSubtreeTo` to run.
  A seam's y and a point's x are the host's pixels; a point's result is the drop's, which the host
  runs for the point under the pointer and draws, and commits on release.

- **`nearestDropPoint(seam, x, columnX, accepts): DropPoint | null`**<br>
  The point of a seam nearest the pointer's x (`columnX` the host's pixels for a point) that
  `accepts` takes (its drop applied, say), trying outwards; where columns tie, the run's own place,
  then one that keeps its kind, then the deeper.

- **`CommandResult`** is one of:

  - `{ status: 'applied', doc, changes, selection, clipboard?, placed?, dropMap? }`<br>
    The new `OurusDoc` (node ids carried over), the changes (`ChangeSpec[]`, in the old text's
    coordinates), the selection (in the new text), for copy and cut the clipboard formats (copy
    has no changes), and for a drop the ids of the nodes it put in place, for a host that selects
    them. Every applied command is checked: the new text, parsed, reads as the outline
    the command meant.

  - `{ status: 'rejected', reason: RejectReason, detail? }`<br>
    The command does nothing; the host should swallow the key.

  - `{ status: 'deferredToHost', detail? }`<br>
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
  - `invalid-insertion-point`: a place whose `after` isn't a child of its `parent`, or is one of the
    nodes moved.
  - `into-itself`: a drop at a place inside the nodes moved.
  - `content-changed`: `deleteSubtree`'s nodes no longer give its `expectMarkdown`.
  - `unsupported`: a structural command ourus doesn't do here yet (a case no command covers).
  - `write-failed`: the writer failed, on a layout it has no rule for or a text that didn't read back
    as the command meant. This is always a bug in ourus, to fix.

- **`settlePlaceholders(doc: OurusDoc, caret: number): { doc, changes } | null`** (from `draft/`)<br>
  Settles the placeholders the caret has left: a node with a held space is written again without
  it; an empty item is written again so it holds without a placeholder; any other empty node is
  removed. Null when no placeholder is off the caret's line. See `draft/`'s README.

- **`Config`** chooses how commands behave where outliners differ. It is set when the document is
  made (`OurusDoc.parse(text, { config })`): `outdent`, `bullet`, `enterOnEmptyItem`, `enterMidItem`,
  `enterAtTextStart`, `enterSplitSpace`, `enterTask`, `backspaceAtTopItem`, `backspaceAtItemStart`,
  `emptyItemWithChildren`, `joinWithChildren`, `handleFenceContents`, `closeBackticks`,
  `headingEditing`, `taskEditing`, `copyAtCaret`, `copySelection`, `pasteSeams`, `pasteOverSelection`, `pasteLines`,
  `pastePlainLines`, `pasteAtTextStart`, `pasteOnParent`, `pasteParagraphList`, `pasteListForm`,
  `markup`, the quirks (`quirkEnterMidHeading`, `quirkPasteCaret`, `quirkPasteText`: one app's mechanics),
  and `flavor` (the only option that affects reading). Each option's choices and default are
  documented in `src/config.ts`.

The host's contract:

1. Keep one `OurusDoc` per document. After every edit that isn't a command (typing, the editor's
   own paste, undo), call `doc = doc.update(changes, { caret })`, with the caret where the edit
   leaves it.
2. On a command key, call `executeCommand`. Commit an applied result's changes and selection
   together, and keep its `doc` (no need to parse again).
3. When the caret moves, call `settlePlaceholders(doc, caret)`, and commit its changes as a
   separate edit.
4. Keep placeholders in the undo history: undo and redo must restore the placeholders of the state
   they return to. Save `doc.marks.points()` with each state, and restore with
   `doc.update(changes, { setMarks: positions.map((pos) => createPlaceholder(pos)) })`. In CM6,
   `invertedEffects` can carry them; the demo does this.
5. Home goes to `doc.textStart(line)`, the start of the line's text, and pressed again, to the
   line's start.

`demos/cm6/main.ts` is a complete CM6 host; `test/player.ts` plays the same contract for the spec.

Inside, a command works in three steps. It looks at what is at the selection (`ctx.from`,
`ctx.to`: `locate`'s zones). It describes the outline it wants in a draft (`ctx.draft()`: remove,
place, split, join, set a text, a gap, the caret). Then it applies the draft (`ctx.apply`): the draft's
`done()` puts it in normal form, writes the changes, and checks the new text against it (see
`draft/`). For
what a line, a marker or a fence is, commands ask `doc/`, or the parser when `doc/` doesn't say.

Files:

- `index.ts` (`executeCommand`, the dispatch on `command.type`); `types.ts` (`Command`, `Selection`,
  `CommandResult`, `RejectReason`, `InsertionPoint`); `context.ts` (`CommandContext`: the document,
  the selection located, the nodes given, `apply`); `util.ts` (shared helpers: the nodes a structural
  command acts on, the caret it leaves, markup at the caret, heading levels, deleting a held space,
  hidden spaces).
- `indent.ts`, `outdent.ts`, `move-subtree.ts` (Tab, Shift-Tab, Alt-↑, Alt-↓); `drag.ts` (the pickup:
  what a drag takes, by the cover rule, its seams and places, the place one drop line names,
  `nearestDropPoint`), `move-subtree-to.ts` (the drop: the place checked, the run converted, the
  result checked); `delete-subtree.ts`,
  `duplicate-subtree.ts`; `enter.ts`, `shift-enter.ts`; `backspace.ts`, `delete.ts` (Backspace and
  Cmd-Backspace, Delete: at a node's boundary, or a selection across nodes); `code.ts` (keys inside
  code blocks, keeping a fence's run matched); `typing.ts` (typed characters Markdown reads as
  structure: a backtick, a tilde).
- `copy.ts` (copy and cut); `clipboard.ts` (reading a clipboard for paste: which format holds
  the Markdown, HTML converted by `MdHtmlParser`, lines read as they were where they were copied
  from; and writing one for copy); `paste.ts` (paste: where the nodes go at the caret, and fitting
  them there), `paste-plain.ts`.

Tests: the spec (`test/spec.test.ts` over `spec/*.md`, every example in every flavor);
`test/commands/commands.test.ts` (changes, text and selection agree; round trips; ids);
`test/placeholders.test.ts` (the placeholders' lifecycle); `test/drops.test.ts` (every place a
pickup lists, dropped: a refusal or a result, at the known starts aside); `test/moves.test.ts` (every
node moved to every place, those only a tree pane or a dialog names too); the differential (`npm run test:diff`),
which compares every command's outcome with the last commit's; the inverse pairs (`npm run
test:inverse`), which run every pair of commands that undo each other at every caret position of the
spec's buffers. To look at one case by hand: `npm run probe` (`sxs/probe.ts --help`), on ourus alone
or side by side with the SxS apps.
