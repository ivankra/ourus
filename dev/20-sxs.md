# Four more apps in the SxS: Mubu, AFFiNE, Lexical, Moo.do (2026-10-26)

After [`19-quotes.md`](19-quotes.md) this session asked which block apps the SxS still lacks, and
added four: two outliners, Mubu and Moo.do, and two free-form block editors, AFFiNE and Lexical. Each
runs with no account and reaches no server once its pages are cached; each has a driver, a README of
its keys and quirks, and the values of ourus's options it was measured to fit. Then the session dug
into their disagreements and skips for what the drivers and the harness, not the apps, put there.

| | app | model | agree | caret | whitespace | disagree | error | skipped |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MB | [Mubu](../sxs/mubu.md) | outliner | 307 (66%) | 14 | 7 | 136 | | 679 |
| AF | [AFFiNE](../sxs/affine.md) | free form | 349 (55%) | 4 | 50 | 228 | | 512 |
| LX | [Lexical](../sxs/lexical.md) | free form | 241 (48%) | 8 | 57 | 191 | | 646 |
| MD | [Moo.do](../sxs/moodo.md) | outliner | 269 (67%) | 13 | 3 | 118 | | 740 |

(Of 1143 examples; percentages of the tests run. Moo.do went from 182 agreements in its first full
run to 269 as the leaks between its tests (§6.4), its numbers and offsets (§6.5) and its options were
fixed.)

What each app does, for good, is in its README (`sxs/<app>/README.md`); this note keeps the story,
the wrong turns and what they teach.

## Contents

1. The task
2. Which apps
3. Mubu
4. AFFiNE
5. Lexical
6. Moo.do
7. The harness
8. What the new apps say about ourus
9. Wrong turns
10. Still open
11. Handover

## 1. The task

From the user, in the order asked:

1. Read the last writeups and the SxS READMEs; what other block apps should be added?
2. Mubu (幕布): notes from another session said its shared outlines open its real editor read-only,
   and a line of JavaScript makes it editable, saving nothing. "Let's do it."
3. Start writing `sxs/mubu/README.md` as the work goes; the short id `MB`.
4. The next apps after Mubu; AFFiNE, `sxs/affine/`.
5. Lexical, `sxs/lexical/` (`LX`), https://playground.lexical.dev/, in parallel with AFFiNE: both
   ready. Tab sometimes types a tab: maybe Ctrl+] is the better indent.
6. Moo.do, `sxs/moodo/` (`MD`), https://www.moo.do/demo/, "when you have cycles"; otherwise dig into
   the new apps' disagreements and skips.
7. This note; keep digging into the apps, their disagreements, skips and the harness's bugs; keep
   polishing.

## 2. Which apps

The candidates, against the bar the SxS has kept since [`10-sxs.md`](10-sxs.md) §19 (a live demo with
no account, or open source that runs here; since [`14-sxs.md`](14-sxs.md), a login a cookie can
carry): Notion (most used, best evidence for mixed documents; its published pages may load its editor
read-only, as Mubu's do, not yet tried), AFFiNE (a demo workspace with no account), Org-mode in Emacs
(the existing Emacs driver), Milkdown or Vditor (a stand-in for Typora), Lexical's playground (a
second library baseline beside BlockNote), Anytype, Craft's web editor, Checkvist, Vimflowy, Trilium.
Already tried and dropped by earlier sessions: Typora (its license), VS Code, MarkText, outl,
Unified Outliner; Zettlr and Joplin are CodeMirror's lists, which Obsidian covers.

Mubu came from the user, with its trick (a shared outline made editable); AFFiNE and Lexical were the
next on the list; Moo.do came from the user too.

## 3. Mubu

**A shared outline, made editable.** https://mubu.com/explore/rHSdgLpbl opens Mubu's own editor
(the `Outliner` and `DocEditor` bundles) read-only to a visitor. The editor's `editable` setting
(`state.doc.outliner.config`, reached through React's fiber tree, the first `store` prop) turns it
into the owner's editor: Enter, Tab, moves, undo. Saving is checked apart from the editor, by the
member's permission, which logs `change action in readonly mode!` and drops the change. No bundle is
patched. The sign-in dialog a visitor gets (`state.modal.loginModal`) is closed by the app's own
action (`@modal/set_login_modal_visible`) whenever the store says it opened.

**Traffic.** The outline itself comes by POST (`/v3/api/explore/get`), and so does most of the API:
[`sxs/mubu/proxy.ts`](../sxs/mubu/proxy.ts) caches every POST to `api2.mubu.com` by its body, so only a
cold cache's first load reaches Mubu (and adds one to the outline's public count of reads). Its
reports on the visitor (device, app, events), with a fresh id or time in every body, are answered
locally. The first version answered them without CORS headers: the browser refused the answers, the
app's HTTP client retried until "retry exhausted", and every run logged some hundred page errors;
the browser's preflights went live as well (39 requests a run). Both are answered now, with the
headers Mubu's API sends; the A/B config, asked for under the browser's device id, is cached under
none.

**The keys** are in the bundle's keymap (`CmdOrCtrl + Shift + ArrowUp` → `MoveUp`, …): moves
Ctrl+Shift+Up/Down, delete Ctrl+Shift+Backspace, duplicate Ctrl+D; Shift+Enter is the note, so the
spec's line break has no key (69 cases skip). No key for the outline's ends: Up or Down until the
caret stops, coming back down from the title, which the `editable` setting makes editable too.

**Reading.** A node's text is runs (`{ type: 1, text, style }`); given as a string it is read as HTML,
so the driver makes runs. A task is `taskStatus` 1 or 2, a heading `heading` 1 to 3. The caret is the
DOM's selection in the focused `mm-editor`; nodes selected whole are the selection service's.

**What Mubu does.** Backspace joins only into the previous sibling (`mergeToPrevNode`); on a node's
only line, Up and Down go to its start and end first; a node's trailing spaces aren't drawn (the
model keeps them), so a caret past them has no place (Enter58, the one error, now declined by
`holds`). Measured with `--ignore-options`: `outdent: logical`, `enterSplitSpace: start`, the three
`refuse` options, `headingEditing: block`, `pasteLines: items`, `pasteOverSelection: ignore`, which
took it from 240 agreements to 307.

## 4. AFFiNE

**The demo workspace.** A new browser's first visit to https://app.affine.pro/ makes a workspace
kept in IndexedDB and opens "Getting Started"; a later visit opens the list of docs. The doc's id is
the workspace's own (`EcANdpqyZJ` in one, `p8Dk8hv-pX` in a fresh one), which a first version took as
fixed: the driver follows the list's link by the doc's title.

**The editor** is `window.currentEditor` (AFFiNE puts it there): BlockSuite's store (`doc`:
`addBlock`, `deleteBlock`, `resetHistory`) and its standard library (`std.selection`, `std.view`). A
test's blocks replace the first note's (every other note deleted); paragraphs, headings, quotes and
code are free blocks, list items items, as BlockNote's driver has them (`liftOwned`,
`asMarkdownReads`). The caret: the page's editor (`affine-page-root`, the one `contenteditable`)
focused, then the block's inline editor's range; a backward one is BlockSuite's text selection again,
reversed. Up from the first block goes into the doc's title, outside the page's editor, and the
selection model keeps the stale caret: the driver reads a caret only while the page's editor has the
focus.

**Two keys needed a capital.** BlockSuite's `Shift-Mod-z` matches the key Shift makes; Playwright's
`Control+Shift+z` sends `z` with Shift, which matches nothing: redo is `Control+Shift+Z`, and so
`Control+Shift+V`. (Lexical's shortcut table is the same.)

**A numbered item keeps its number.** Each AFFiNE list item draws its own `order`, which a move leaves
as it was: after moving `1. a` down, AFFiNE shows `2. b` above `1. a`. The first read counted on from
the first item (`2. b`, `3. a`), a state nobody saw; the driver reads the number drawn.

**Traffic.** The two GraphQL queries at startup are cached by body; AFFiNE's telemetry and
Cloudflare's bot check (a POST to a URL of its own each load) are answered locally.

**What AFFiNE does**, measured: Backspace at an item's start makes a paragraph where it is; Enter on
an empty item too; Enter at a text's start keeps the caret with the text; a paste opens both seams; a
list after a paragraph is no block's; a move stays among the siblings, and a heading moves alone (no
section). `--ignore-options` took it from 292 agreements to 349.

## 5. Lexical

**The playground**, opened empty and without its debug view by its own URL settings
(`?emptyEditor=true&showTreeView=false`). The editor is on its root element (`__lexicalEditor`): a
test goes in as a serialized editor state (`parseEditorState`, `setEditorState`), the history is
cleared by the playground's `CLEAR_HISTORY_COMMAND`, found among the editor's commands by its name,
and the caret is a DOM selection Lexical takes as its own. Reading walks the state's node map
(`__first`, `__next`) and its selection points (a text node's offset, or an element's child index).

**Indent.** Tab indents only at a line's start and types a tab elsewhere (`TabIndentationPlugin`);
the user suggested Ctrl+], the playground's "Indent", which indents from anywhere: the driver plays
Ctrl+] and Ctrl+[. Ctrl+] on a paragraph gives it an indent, a padding Markdown has no form for: not
read.

**Two driver bugs the indent cases found.** Headings came back without their sections (the read
needs `asMarkdownReads`, as BlockNote's does). And Lexical indents even the first item, which leaves a
nested list with no item above it: a depth the outline can't hold, which crashed the comparison
(`Invalid array length`, outside the runner's try). Its HTML, `<li><ul><li>a</li></ul></li>`, reads in
Markdown as an empty item holding the list, and so the driver reads it.

**Lists of one kind.** A Lexical list is bullets, numbers or to-dos; a bullet then a to-do were
skipped (21 cases) until the driver loaded items of another kind at the top level as a list of their
own after the first.

**No structural keys.** The playground has none for moving, deleting or duplicating a block: 152
examples skip for those. Measured: `enterAtTextStart: stay`, `enterInQuote: split`,
`headingEditing: block`, `pastePlainLines: enter`.

## 6. Moo.do

### 6.1 The app's modules

https://www.moo.do/demo/ frames `/web/#demo=true&live=true&data=demo-help`, which the driver opens.
Moo.do has become Legend; the demo is a 2022 build. Nothing is on `window`, and only the item being
edited is a `contenteditable`; keys go to a hidden input, and Moo.do draws its caret. The driver
reaches the app's modules through its webpack runtime (`webpackChunkLegend.push` hands over the
module loader), each found by what it has: the item registry (`createVMLI`, `generateID`), the
history (`undoStack`), the selection (`setSelectionIndices`, `getStartItem`), the items selected
whole (`numSelectedInPane`), the change types and the pane update batcher; the document through
React. The hotkey table is in the bundle (`MoveUp: ["win:Se+Sh+ArrowUp", …]`, `Pr` Ctrl, `Se` Alt).

### 6.2 Text and offsets

An item's raw text is Markdown as written, with Moo.do's prefixes: `# ` a header, `[ ` a task (done:
a flag), `1. ` numbered, `- ` a bullet. Moo.do draws the prefix as a marker and the formatting
styled, and counts the caret in what it draws: in `a **bold** b`, offset 3 is after `a b`. The driver
aligns the drawn text with the raw text, character by character, both ways.

### 6.3 Settling

Every example took 16 to 21 seconds: framer-motion's frame loop never stops in Moo.do (some animation
repeats, drawing nothing: no element's style changes), and the idle script counts a pending frame as
work. [`sxs/lib/idle.ts`](../sxs/lib/idle.ts) has a new option, `frames: false`, for such an app:
settling is timers and quiet. Examples take half a second now.

### 6.4 State that leaked between tests

The full run disagreed on 20 Delete cases that agreed in a run of `delete.md` alone. Not the workers
(one or four, the same), but the order: each spec file was run before `delete.md` in one worker (a
bisect by file, then by case), and two broke it, `copy.md` (its `Cut4`) and `delete-subtree.md`. Nothing
the driver could reset was dirty (the history, the update batcher, both selections), and the first fix
loaded the page anew after any cut or "DeleteItem". The cause was plainer: deleting more than one item
(an item with its children), Moo.do asks "Are you sure you want to delete 2 items?", and the dialog,
unanswered, took every key after it, the pane finishing no delete (a join left the joined item in
place). The driver now plays `cut` and `deleteSubtree` as the user who asked for them does, Y to the
question: every DeleteSubtree case agrees, Cut4's cut deletes, and nothing leaks. A dialog another key
leaves open (Backspace on items selected whole) is closed by loading the page anew before the next
test. The Enter cases that didn't split in the full run (Enter2, Enter3) were the same leak.

The first reload broke every test after it (254 errors): a window a run takes over from an earlier run
has the settling script only until it reloads, as a page's init scripts belong to the connection that
added them, and the reused window's run adds none. [`sxs/lib/browser.ts`](../sxs/lib/browser.ts) has
`reloadPage` now, for any driver: it adds this run's settling script (once per page), reloads, and puts
back the marks a run reuses a window by (`__ourusApp`, `__ourusVersion`).

### 6.5 Numbers, offsets and what Moo.do can't start from

Moo.do counts numbered items: a run of them is drawn 1, 2, 3 whatever the raw text's numbers (`5.
three`, third, is drawn `3.`); the driver reads the number drawn (the item's own line in its element's
text), and a list not counting from 1 isn't held. At a boundary between drawn characters Moo.do puts the
caret past the markup (`**b**┃c`, `` `┃x` ``) but before it at the text's start (`┃**b**`), which the
first alignment didn't (Backtick32 held `a ``x``┃ b` for `a ``x┃`` b`): the driver maps a drawn offset
to a raw one so, and back by counting the drawn characters before it. A code span of two backticks
Moo.do rewrites with one, so it isn't held either.

Its selection has no direction (from `ab┃`, Shift+Left gives `a«b»`, a second Shift+Left `a┃b`): a
backward selection is declined. A done task is hidden by the demo's pane (its filter shows what isn't
completed). A block of more than one line would be the item's note.

## 7. The harness

- `sxs/lib/idle.ts`: `frames: false` (§6.3); by default unchanged.
- `sxs/proxy.ts`: Baidu's analytics (`hm.baidu.com`, on Mubu's pages) and Rollbar's error reports
  (`api.rollbar.com`, from Moo.do) are blocked hosts.
- `sxs/lib/browser.ts`: `reloadPage`, a driver's page loaded anew with this run's settling script and
  the window's marks (§6.4).
- **Each file alone against the full run.** A leak between tests shows as a verdict that changes when
  a spec file runs alone: each file was run alone (`--workers=1 --json=`) and its verdicts compared
  with the full run's. None changed for AFFiNE (631 tests), Lexical (497), Mubu (464) or Moo.do (403,
  after its fixes). `run.md` says how, for the next app. Running a bisect
  needs a run per pair of files, each holding the app's lock: a probe or a second run of the same app
  waits for it, or says another run has it.

## 8. What the new apps say about ourus

- **A block-editor profile.** AFFiNE agrees with BlockNote on Backspace at an item's start (a
  paragraph), Enter on an empty item (a paragraph), Enter at a text's start (the caret stays), a paste
  opening both seams, and a list after a paragraph being no block's; Lexical on several of them. Two
  editors on different engines agreeing, each time away from ourus's default in the same direction,
  is a profile: ourus could offer those values together.
- **Headings aren't containers there.** AFFiNE moves a heading alone, its section staying; ourus's
  heading owns its section.
- **Outliners refuse.** Mubu, like WorkFlowy and Dynalist, outdents logically and refuses to join a
  node with children; Backspace joins only into a previous sibling.
- **Moo.do is the weakest evidence**: an abandoned build, its selection without direction, its
  numbers counted rather than written; but on structure it agrees with the outliners (logical outdent,
  refusing to join an empty item with children, moves among siblings).

## 9. Wrong turns

- **AFFiNE's doc id as a constant.** It is the workspace's own; a fresh browser has another.
- **Mubu's reports answered without CORS headers**: a hundred page errors a run, and the preflights
  live.
- **Moo.do's done task "not drawn"**: the load waited for an element the pane's filter hides; it isn't
  slow, it's gone.
- **Moo.do's inverted flag**: the selection's `setArrowSelectInverted` is cleared at once, and the app
  has no direction to keep anyway.
- **Treating the 20 Delete failures as Moo.do's**: they were the test before's. Then **a reload as
  the fix**, after any delete through the pane, before looking at the page: a confirmation dialog,
  which Y answers, was open all along; and the reload lost the settling script in a reused window.
- **Moo.do's raw numbers**: read as written, `1.` twice after Enter, where Moo.do draws `1.` and `2.`.

## 10. Still open

- Notion through a published page (the Mubu trick), FlowUs and Lark Docs the same way; Org-mode in
  Emacs.

## 11. Handover

The four drivers are `sxs/mubu/`, `sxs/affine/`, `sxs/lexical/`, `sxs/moodo/`, each with a README.
`node sxs/run.ts MB,AF,LX,MD` runs them (a few minutes each); `node sxs/run.ts all --rejudge` writes
the table. The exploration scripts were scratch, not kept.
