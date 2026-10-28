# RemNote

[`driver.ts`](driver.ts) drives RemNotes app on [remnotes.com/notes](https://www.remnote.com/notes) in its own guest mode.
The page opens the full app without login/account, its knowledge base local to the browser (IndexedDB), synced nowhere.

This directory runs it in "no bullet" (nbl) mode; [`remnote-bl`](../remnote-bl/) runs the same driver in bulleted mode.

## Keys (Linux)

| action | keys |
| --- | --- |
| `enter` | Enter ("Add Child", splitting the text) |
| `shiftEnter` | Shift+Enter ("Add Line Break"; twice, a blank line, the block holding paragraphs: an item's paragraphs right after its text are its block's (`paragraphsInBlock`, since 2026-10-25)) |
| `indent` | Tab |
| `outdent` | Shift+Tab |
| `moveSubtreeUp` | Alt+Up ("Swap Up") |
| `moveSubtreeDown` | Alt+Down ("Swap Down") |
| `move ②` | the mouse: the rem's bullet dragged to its drop region (`remnoteDrop` in [`driver.ts`](driver.ts), [`../lib/drag.ts`](../lib/drag.ts)) |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace |
| `deleteSubtree` | Ctrl+Shift+Alt+Backspace ("Delete Bullet"); rems selected, Backspace (the shortcut leaves a selection as it is); after it no block is edited (often): the outline alone is judged (`noCaretAfter`). |
| `duplicateSubtree` | *missing*: its tests are skipped |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V ("Paste Without Formatting": a rem per line; Quirks) |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Y |

Other shortcuts:

| shortcut | keys | what it does |
| --- | --- | --- |
| Add Child Without Splitting Text | Alt+Enter | a new rem after this one, the text left whole |
| Add Portal | Ctrl+Shift+Enter | a portal (a live embed of other rems) as a child |
| Turn Into a List Item | Ctrl+Alt+L | a numbered "list item" (see below) |
| Toggle Todo Status | Ctrl+Enter | a to-do, or its status |
| Heading 1 to 3 | Ctrl+Alt+1, 2, 3 (formerly Ctrl+Shift+!, @, #) | the rem's font size |
| Heading 4 to 6 | Ctrl+Alt+[, ], \ | |
| Clear Heading | Ctrl+Alt+` | |
| Insert Block Code | Ctrl+Shift+0 | a code rem |
| Toggle Callout | Ctrl+Alt+V | |
| Expand, Collapse | Ctrl+Down, Ctrl+Up | a rem's children shown or folded |
| Collapse All Descendants | Ctrl+Shift+Up | |
| Collapse Children to 1st Level | Ctrl+Shift+Alt+Up | |
| Include All Descendants | Ctrl+Shift+Down | (in a selection, its descendants too) |
| Include All Hidden Children | Ctrl+Shift+Alt+A | |
| Zoom Into Bullet, Zoom Out of Bullet | Ctrl+', Ctrl+; | zoom: the rem as the document |
| Zoom Out of Bullet & Open in Other Pane | Ctrl+Shift+; | |
| Go to Parent | Ctrl+\ | the caret to the parent rem |
| Go Backward, Go Forward | Alt+Left, Alt+Right | navigation history |
| Paste as Single Bullet | Ctrl+Shift+Alt+V | the clipboard's lines into the rem at the caret; the desktop app's only (Quirks) |
| Cut, Copy | Ctrl+X, Ctrl+C | over a selection of rems: the rems, with their children |
| Select all | Ctrl+A | the rem's text, then the document's rems |
| Shift+Up, Shift+Down | | at a rem's edge, a selection of rems; Alt+Up and Down move the selection |
| Merge Bullet With Duplicate Name | Ctrl+Alt+E | |
| Merge Bullet and Set Alias | Ctrl+Shift+Alt+E | |
| Add Alias | Alt+A | |
| Turn Into a Folder | Ctrl+Alt+Shift+F | |
| Pin Document | Ctrl+Shift+8 | |
| Find Text in Document, Filter Document | Ctrl+F, Ctrl+Shift+F | |
| Bold, Italic, Underline, Strikethrough | Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+K | |
| Inline code | `` ` `` twice, or Ctrl+Alt+Shift+I | |
| Reference, Tag selected text | `[`, `#` | |

## Drag and drop

Read in its bundle (`startDragging`, `onBulletPointerLeave`, `getRectsInfoForDropRegion`) and played
with the real mouse: a press on a rem's bullet starts a drag as the pointer leaves the bullet. Each
rem's row, 3 pixels taller above and 14 wider at the left, is split in halves: the top half drops above
it; the bottom half drops below it in its first 84 pixels (above its first child, where it has
children), past them as its first child; beside its children, their bottom half drops below it. The
release is in the smallest rem's region that holds it. The driver aims at the middle of the place's
region.

- **Every drop the cases play lands where ourus's does**, in both setups (Drag1, Drag2, Drag3, Drag13,
  Scenario8, Scenario8c; without bullets Drag8 too), stable over three runs.
- **The rem dropped is selected after it, as a rem**, the caret gone (`caret` verdicts), and a key
  typed then is the selection's (Scenario8b disagrees: the `s` isn't typed).
- **The cover rule is ourus's**: a press on a selected rem drags the selection, any other the rem
  alone (Drag4 agrees; Drag5, Drag5b land as ourus's, the dropped rem alone selected after: `caret`;
  Drag20's numbered rems have no bullet to press). The driver selects rems as a user does, Shift+Down
  from the first one's start past its edge, past the last one's subtree (without bullets, its rems
  are siblings: `read` reports the topmost in ourus's nesting).
- **A heading keeps its level** (Drag15, Drag16 without bullets: `### D` where ourus re-levels it to
  `## D`). With bullets a heading rem has none to press: those cases skip.
- **Its drag code is a chunk loaded on the first drag**: a cache of an older build serves an app whose
  chunk the site no longer has (a 404, `ChunkLoadError`, the app reloading); `--cache=refresh` once
  after RemNote ships a build.
- After a drop, the driver moves the pointer off the rems, and `load` closes with Escape what a key
  typed on a selection opened: left so, the next test's caret is lost.

## RemNote's test mode

RemNote ships the hooks its own Playwright tests use, and the driver runs the app the way those do:

- **The mode**: two flags in localStorage, read as the code boots (`Env` in its bundle):
  `isPlaywright` makes `Env.app` `playwright` (Sentry is never set up, the test recorder's trackers
  are), and `isPlaywrightServerless` runs it with no backend. The driver sets both with an init
  script. A reload in this mode sends RemNote's servers nothing (without it: Stripe's price config,
  Sentry, Segment through amboss.com).
- **Fixtures**: its tests make their starting rems with page functions of its own
  (`window.playwrightCreateEmptyParentDeletionFixture` and the like, in the module that also defines
  `playwrightGetWaitKeyState`): inside `writeGuarantee(name, fn)`, `Rem(kb).createNew()`,
  `rem.update({ key: [...] })`, `rem.setParent(parent, index)`; then a flush (every write guarantee,
  every consumer job, the database store); then the editor tree is told
  (`controller.playwrightCheckNotifyTreeShapeChange()`) and a rem focused (`controller.focusOnChild(root,
  id, true)`). `load` does the same, every primitive a global of the page (`Rem`, `writeGuarantee`,
  `waitUntilFinishedAllWriteGuarantees`, `waitUntilFinishedAllConsumerJobs`, `flushToDatabaseStore`);
  only the editor trees are a module's (the focused one, and those mounted), found through the bundle's
  module registry by the recorder's own import of it. The last test's document goes with
  `window.playwrightDeleteDocumentRem(id)`, theirs too.
- **Waits**: `window.waitForPlaywrightToLoad()` resolves once the trackers are up (`open` awaits it).
  `window.playwrightGetWaitKeyState(key)` holds what the trackers last saw (`route`, the focused
  element's type, the focused editor's text, the selected range's length, ...): the values a recorded
  test waits for, not a signal that the app is idle. The busy signal is RemNote's count of writes in
  flight (`getNumOngoingWriteGuarantees()`); the idle script covers the rest.
- **Not used**: the test recorder itself (`mod+shift+opt+t`, "Open Test Recorder", records a session
  as a test), the other fixtures (portals, audio, lecture recordings, queries), and
  `playwrightShiftFocusedRemRelative` (a move without the key).

## Results, with bullets

On 2026-10-18: agree 207 (105 original outlines), caret 28, whitespace 26, disagree 81, error 0, skipped
445; about 12 minutes (some 1.6 s a test: making a document, flushing and opening it, as RemNote's
fixtures do). Nothing went to RemNote's servers. The disagreements, each checked against the driver:

- **Moves stay among siblings**: Alt+Up and Down ("Swap") don't take a rem out of its parent, nor into
  the next one (`move-subtree-down.md › MoveDown7`, `9`, `10`; `move-subtree-up.md › MoveUp6`, `8`, `9`).
- **Outdenting is logical**, with no setting (declared): the later siblings stay with the parent. A Tab
  right after an outdent puts the rem back where it was (`outdentInOriginalLocation`), not under its
  previous sibling (`outdent.md › Outdent13`).
- **Enter mid-text in a rem with children** makes its first child (`enterMidItem: child`, declared;
  `enter.md › Enter3`).
- **Enter over a selection** splits at its start and keeps the selected text (typing replaces it):
  `obsidian-true-outliner.md › E33`, `S13`; the same with a selection made by Shift+Right.
- **An empty rem with children** goes, and its children take its place, rather than joining the rem
  before (`backspace.md › Backspace17d`, `delete.md › Delete5`, `5b`).
- **The caret leaves the rems** after Backspace on the first, empty, one (to the document's title) and
  after "Delete Bullet" (`backspace.md › Backspace17`, `delete-subtree.md › DeleteSubtree3`).
- **Paste**: the clipboard's last line break makes an empty rem (`paste-old.md › PasteOld3`, `5`, `7`, `10`),
  as in Dynalist and WorkFlowy.
- **Whitespace**: Enter keeps the space before where it splits, Shift+Enter the space after the break.

Camps declared (`behaves`), each checked by playing its examples anyway (`run.ts <setup>
--ignore-options`, 2026-10-18: those skipped for the value declared disagree, those of the value
agree): logical outdenting, `enterMidItem: child`, `enterAtTextStart: stay` (Enter at a text's start
makes an empty rem above, the caret staying in the text), `backspaceAtTopItem: refuse`. Where a camp
depends on the case's shape, the default stays: without bullets, an empty top-level item leaves the
list on Enter and a top-level item becomes a paragraph on Shift+Tab, nested ones not; a one-rem paste
joins the text, more go after it.

## How a block maps to a rem

A block is a rem's text, its `key`: rich text (strings, and objects for formatted runs and
references), read as Markdown, a formatted run in its markup (`b` bold, `l` italic, `q` code, `str`
struck, `iUrl` a link: `runsAsMarkdown` in lib/block.ts, since 2026-10-25; it read as plain text
before) and anything else (a reference, an image) as `￼`. It holds line breaks (Shift+Enter). The rest are the rem's attributes, never text:

| canonical text | rem |
| --- | --- |
| `## title` | font size `H2` (`setFontSize`, `getFontSize`), H1 to H6 |
| `[ ] task`, `[x] task` | a to-do (`setIsTodo`), its status `Unfinished` or `Finished` (`setTodoStatus`) |
| `1. item` | a "list item" (`setIsListItem`): RemNote numbers a run of them from 1 (`getListItemIndex`) |
| ```` ```\ncode\n``` ```` | a code rem (`setIsCode`), its key the code; it keeps no fences, so it reads back with the shortest run of backticks (three or more) longer than any in its code; a language is a powerup property, not loaded |

So the driver refuses the `markup-heading`, `markup-task` and `markup-fence` tags, and `holds` refuses a
caret in a checkbox, a heading's `#`s or a code rem's fences, a code block with a language, fences
other than the ones it reads back with (tildes, or more backticks than its code needs), and a numbered
run that doesn't count from 1.

## Documents, bulleted or not

A document's rems show as bullets by default. A document can hide them (its "no bullet" mode,
`setDocumentLevelNoBulletMode`; `hideBulletsInDoc`, `canDisplayAsNoBullet`), a rem too
(`setIndividualNoBullet`, `setNoBullet`), and in a document without bullets a rem can be a bulleted list
item again (`bulletedListInNoBulletDocument`): rems that read as paragraphs, and lists among them. That
is Markdown's free form, mixed paragraphs and lists, in a block app: this setup (`remnoteDriver`'s
`bulletless`), which runs the spec's `free-form` cases; with bullets, [`../remnote-bl/`](../remnote-bl/).
Both setups hold a browser's RemNote window by one name (`Driver.pool`): two RemNote tabs in one
browser break each other. And they run in browsers apart (`Driver.browsers`: this one the pool's
even-numbered, with bullets the odd), three each, so that a profile's guest knowledge base is only
ever one setup's.

RemNote also keeps headings as containers ("maintain header hierarchy", `maintainHeaderHierarchy` in
its bundle: a rem with a larger heading takes the rems after it as children, indenting and outdenting
them), as ourus's outline does with Markdown's headings.

## Documents without bullets: how they hold an outline

Read in RemNote's bundle, then measured in its test mode:

- **The document hides its bullets** (`setDocumentLevelNoBulletMode`, its Document powerup's
  `HideBullets`), and a rem shows none only as the document's child (`renderAsNoBullet`: the parent's
  `hideBulletsInDoc`), with no children, unless it is a heading (`canDisplayAsNoBullet`). A rem that
  shows a bullet (`sb`, "show bullet") or a number (a "list item") is a list's item; nested under an
  item, every rem shows one.
- **Blocks**: an item of the spec's buffers is a rem that shows a bullet (a numbered one, its number);
  a paragraph, a heading or an atom outside every list (a free block, `¶` in the reports) is a rem
  without one. Hiding bullets on a heading too, so its section could read as paragraphs under it, makes
  the heading a document: so every free block is the document's child, and what ourus's outline nests
  under one (a heading's section, the list right after a paragraph) is beside it, as Markdown has
  them, a level up (`lift`), and read back nested again (`own`): a heading takes what follows up to a
  heading of its level or above, a paragraph the items right after it. Every spec buffer the setup
  holds goes there and back as it was (`remnote.test.ts`).
- **Refused** (`holds`), besides RemNote's own refusals: a paragraph inside an item (an item's
  continuation paragraph, `- a`, a blank line, `  b`): a rem there shows a bullet.

**It is what a user's typing makes**: typed by hand in a document without bullets, `# A`, Enter and a
paragraph give two siblings (the paragraph beside the heading, not under it), `- x` after a paragraph
an item beside it, and Alt+Down on the heading swaps it with its paragraph alone. So the moves that
leave a section behind (`gaps.md › Gap3`, `Gap6`, `move-subtree-down.md › MoveDown4`, `16`, `24`, `29`,
`move-subtree-up.md › MoveUp3`, `16`, `17`, `scenarios.md › Scenario22`) are RemNote's.

**The two setups against each other**: of 317 examples both ran (2026-10-18), 212 start from the same
drawing (outlines of items) and 21 of those come out apart, each one of the rules of the mode without
bullets: a paste's new rems show no bullet (16: the driver marks the items it loads `sb`, which a paste
doesn't carry on, where Enter at an item's end does), an empty top-level item leaves the list on Enter
or Backspace (4), Shift+Tab on a top-level item makes a paragraph (1). The other 105 are different
documents: here a heading's section and a paragraph's list lie beside them, with bullets they are
their children, and RemNote's Swap moves a rem among its siblings in both. So moving a heading or a
paragraph carries its section with bullets and leaves it here, and an item moved across a section's
edge stays in its parent with bullets and crosses into the next section here, as Markdown reads it.

## Documents without bullets: their keys

Measured by hand in the test mode before the setup was written:

| key | in a document without bullets |
| --- | --- |
| Enter on an empty item | the rem stops being an item: a paragraph (Markdown's empty last item) |
| Shift+Tab on a top-level item | a paragraph; one with children stays an item, its children moved out to the top level (`outdent.md › Outdent8`) |
| Enter mid-paragraph | two paragraphs |
| Backspace at a paragraph's start, after a paragraph | one paragraph, the texts joined (`ab`, where ourus keeps a line break) |
| Tab on a paragraph after a paragraph | an item at its depth (a paragraph can't have children) |
| `- ` at an empty paragraph's start | an item |
| Enter at an item's end | another item |

## Internals

- `window.Rem(kb)`: a knowledge base's rems (`findOne(id)`, `findOneAsync`, `createNew()`); `kb` is
  `window.CURRENT_KNOWLEDGE_BASE`. A rem: `_id`, `key` (rich text), `parent`, `f` (its place among its
  siblings, a fractional index), `childrenRemAsync()` (in order), `update({ key })`, `setParent(rem,
  index)`, `setIsDocument`, `remove`, and the attributes above (`get…`/`set…`). Its setters are wrapped
  in a write guarantee each.
- `window.currentKnowledgeBaseId()`: `'null'` for the guest. `window.FlowRouter.go(path)`: the
  router (`/w/null/<id>` opens a document, route `WithoutTabIdDocumentTree.show`).
- The editor trees' module (the recorder's `w`, its export `Tq`): the focused tree, and the mounted ones;
  a tree's `controller`: `rootRem`, `currentlyFocusedRemId()`, `currentFocusedRemTextCache()
  .getCurrentRichText()` (the focused rem's text as typed; the model follows within 100 ms),
  `focusOnChild(portal, rem, atEnd)`, and the commands (`indentRem`, `outdentRem`, `moveRem`,
  `removeFocusedRem`, `shiftRemRelative`, `cutSelectedRange`, ...).
- `window.getFocusProps()`: the caret, `{ type: 'text', anchor, focus }` in the focused rem's text;
  `setFocusedElementProps(props)` sets it, and the editor follows. `getFocusedElementId()`: the path of
  the focused element (window, pane, tree, portal, rem, rich text editor).
- `window.editor`: the focused rich text editor (`text`, `selection`, `getTextAsMarkdown()`).
- Each rem is an editor of its own: `.EditorContainer` (contenteditable) inside `[data-rem-id]`.

## The editor's text and the model's

The rem being edited is read from its editor (`window.editor.text`), the text the caret
(`getFocusProps`) is an offset in, not from the text cache or the model, which can hold less:

- **A zero-width placeholder.** RemNote's editor (its "linear editor": `data-linear-editor-text`,
  `data-linear-editor-leaf-container` spans) puts one U+FEFF (zero-width no-break space) after the last
  character of a rem's text whenever the text has a line break (`one⏎` is `one⏎\ufeff` in the editor,
  `one⏎x` is `one⏎x\ufeff`; an empty rem has none): what lets the last line render and take the caret,
  as a contenteditable shows no trailing line break by itself. The model (`key`) and the text cache never
  hold it, and the caret's offsets count it. The driver takes it out, and moves the offsets after it
  back (measured, 2026-10-18).
- **A line break at the text's start** (Shift+Enter at a rem's start) is in the editor (`⏎one`, the
  caret on the second line) and not in the model or the cache (`one`), half a second later as at once.
  Read from the cache, as until 2026-10-18, it came out `o┃ne`: the cache's text with the editor's caret
  (`shift-enter.md › ShiftEnter13`, a bogus caret verdict; now RemNote's `⏎┃one`, a whitespace one).

ourus has a placeholder too (`spec/placeholders.md`, drawn `◌`), and the two are alike in what they
keep: an empty line that the stored form would lose (Markdown can't hold the node; a contenteditable
doesn't render a trailing line break), both the editor's alone, never stored. They differ in what they
are: ourus's is a position, the end of an empty line read as if a character had been typed there, so
that a node exists in the outline (an empty item under an item, an empty paragraph, an empty line in a
node's text), made by a command and resolved by rule when the caret leaves (an empty item gets a blank
line above, an empty paragraph goes), one undoable edit; RemNote's is a character, always one at the end
of any text with a line break, with no meaning in the outline (the rem exists either way), added and
dropped by the editor as the text changes.

Compared through `spec/placeholders.md` (the projection makes a `◌` an empty block, or an empty line in a
block's text; the U+FEFF is taken out): while the caret is in the empty place, RemNote and ourus agree
(RemNote's empty rem, or its empty last line, where ourus holds a placeholder: RB 7 of 7, RN 7 of 10);
when the caret leaves, ourus resolves its placeholder and RemNote keeps the empty rem or line
(`Placeholder2`, `3`: the empty paragraph stays; `Placeholder4`: the empty line stays, `⏎` in the model).
A code rem is otherwise: its text keeps a trailing space after a line break, in the model too
(`code⏎ `, then `code⏎x `), RemNote's own (`fences.md › Fence8`, whitespace).

## Quirks

- **Plain paste is the desktop app's.** "Paste as Single Bullet" (`PasteInSingleRem`,
  Ctrl+Shift+Alt+V) puts the clipboard's lines into the rem at the caret, as ourus's plain paste does,
  but only Electron sends it (`ipcListenOnPasteAllInOneRem`, the menu's `PASTE_ALL_IN_ONE_REM`): in the
  web app the key does nothing. The driver's `pastePlain` is Ctrl+Shift+V, "Paste Without Formatting",
  which makes a rem of each line as Ctrl+V does, and paste-plain.md's verdicts measure that.
  Dispatched by hand once (2026-10-21, the bundle's module 357851, `Hn()`, as the menu does; not in the
  driver), Single Bullet agreed with ourus on 7 of 12 probes of plain paste, kept a line's leading
  spaces (as Logseq does), kept two blank lines as one, and made a rem with a pasted `# x` a heading.

- **One RemNote tab per browser.** RemNote locks its database across tabs; with two open, each write
  makes the other set a database error ("Need to refresh tabs broadcast"), go to `/database_error` and
  reload, every couple of seconds, for good. `open` closes any other RemNote tab in its browser.
- The guest's knowledge base outlives the page, in the profile of the pool's browser its window is
  in (`.sxs/chromium/<n>/profile/`): a test's document is deleted by the next one; one left by a run
  that died stays until the profile goes.
- **A broken knowledge base**: a browser killed while RemNote wrote (the harness restarted) left the
  profile's guest database broken, every window booting into `/database_error` ("Something went
  wrong"), the open taking minutes (183.7 s) and a run ten minutes and more. With the pool's profiles
  deleted (`run.ts --stop`, then `.sxs/chromium/`), RemNote opened in 4.4 s and a full run of this setup
  took 192 s. `open` could clear RemNote's site data itself at a database error
  (`Storage.clearDataForOrigin`: the guest's knowledge base holds nothing to keep); not done.
