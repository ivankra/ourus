# Tana

[`driver.ts`](driver.ts) drives **[Tana Outliner](https://app.tana.inc/)** via their own **[UI-test page](https://app.tana.inc/tests)**.
Web build `f6ae813f25` (the page's `ui-version`) on 2026-10-18.

Tana the company has two products:

- **Tana Outliner** (`app.tana.inc`, `outliner.tana.inc`):
  "Web content describing 'Tana' as a note-taking app, PKM, or outliner refers to this product".
- **Tana** (`home.tana.inc`, `tana.inc`):
  "an agentic meeting platform", behind login wall, Tiptap 3 on ProseMirror, Loro CRDT.
  
## Keys (Linux)

Tana's own, from its shortcut table (`{"move up": {hotkey: {linuxAndWindows, mac}}, ...}` in its bundle):

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | Shift+Enter ("insert node": an empty node after this one) |
| `indent` | Tab |
| `outdent` | Shift+Tab |
| `moveSubtreeUp` | Shift+Alt+Up ("move up") |
| `moveSubtreeDown` | Shift+Alt+Down ("move down") |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace |
| `deleteSubtree` | Ctrl+Shift+Backspace ("delete item") |
| `duplicateSubtree` | Shift+Alt+D ("duplicate") |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V ("cleanpaste") |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Shift+Z |

Other shortcuts:

| shortcut | keys | what it does |
| --- | --- | --- |
| insert node above | Ctrl+Shift+Enter | an empty node before this one |
| mark done | Ctrl+Enter | none, then a checkbox, then done, then none |
| toggle heading | `!` (at a node's start) | a section |
| create field, add reference, add tag | `>`, `@`, `#` | |
| code | `` ` `` | inline code |
| bold, italic, underline, highlight | Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+H | |
| expand, collapse | Ctrl+Space, Ctrl+Shift+Space | a node's children shown or folded |
| expand all, collapse all | Ctrl+Shift+PageDown, Ctrl+Shift+PageUp | (Ctrl+Down and Ctrl+Up too, in a panel) |
| zoom in, zoom out | Alt+Right, Alt+Left | a node as the panel |
| select all, toggle select | Ctrl+A, Ctrl+Shift+S | |
| clone, paste options | Ctrl+Shift+C, Ctrl+Alt+V | paste options: the classifiers (Paste, below), to choose from |
| delete | Ctrl+D | |
| add description | Alt+I | a node's description, a line under its name |
| send to tomorrow, show today | Alt+T, Ctrl+Shift+D | |
| command line, search, quick add | Ctrl+Shift+P, Ctrl+S, Ctrl+E | |
| skip word, select word | Ctrl+Left/Right, Ctrl+Shift+Right | |

"move left", "move right", "move to top", "move to bottom" and "insert node below" have no key.

## Stack

Closed source; from its web bundle (build `f6ae813f25`, `.sxs/http/app.tana.inc/`), each library by its
own version string or names in it. A React 19.3.0 app, its model reactive with MobX (`mobxGlobals`),
built with Vite (chunks loaded on demand, `__vitePreload`: a code block's item, its language picker,
highlight.js's languages, KaTeX, mermaid, the paste options, Intercom), styled with CSS modules
(`Button-module_button__…`) and Tailwind (`tw-` classes), its font Inter. **No editor framework**
(no ProseMirror, Lexical, Slate or Tiptap in it): a node's name and its description are each a
`contenteditable` span of Tana's own (`span.editable`), holding the name's HTML. Its data is Firebase's
(the JS SDK 11.10.0: auth, the Realtime Database, App Check), cached in IndexedDB, and searched by an
index in a web worker (`TextIndexServer`). Markdown pasted is read by marked, HTML sanitized by
sanitize-html (PostCSS 8.5.28 in the browser), code highlighted by highlight.js; telemetry is Sentry's
(7.120.4), OpenTelemetry's and Amplitude's; payments Stripe's; its own API calls oRPC (1.15.4).

## Tana's test mode

- **`/tests`** (a route of the app's router): the app's state is made by `Uen` in its bundle, a node
  space with no server, its user an anonymous `Guest` (`isAnonymous`), Firebase's sign-in never asked,
  and `window.appState` set (the whole app: `nodeSpace`, `layoutManager`, ...). It shows a spinner
  (`data-testid="test-loading"`) until a test hands it a workspace.
- **`window.bootTest({ caseFiles: [{ fileId, storeData }, ...] }, { openSidebar })`**, its test boot
  loader's: the first case file is loaded as the root file, writable, from Tana's export format
  (`{ formatVersion: 1, docs: [{ id, props: { created, name, _docType, _ownerId, ... }, children }],
  editors, workspaces, lastTxid, lastFbKey, optimisticTransIds, currentWorkspaceId }`); the time zone
  and locale are fixed (`Pacific/Auckland`, `en-GB`, 24 hours); the user becomes `UITester`. `open`
  boots it with a root node and a home node (a child of the root with `_docType: 'home'`), as its tests
  boot theirs.
- **Onboarding**: the user `bootTest` makes hasn't been through it, and the app goes to `/welcome/…`
  ("Download Tana Desktop"); `open` marks it done (`appUser.setOnboardingCompleted(true)`, which in this
  mode tells no server).
- **Traffic**: only the page, its scripts and `/VERSION` (all cached), its feature flags for an anonymous
  user (cached), and its telemetry (Sentry through its own `/api/<project>/envelope/`, `/api/improve`,
  OpenTelemetry to `ot.tana.inc`), answered by the proxy ([`proxy.ts`](proxy.ts)). A run sends Tana
  nothing.
- `/shared/…` is Tana Publish, published nodes for anyone to read: read-only, not an editor.

## How a test runs

`load` makes a test's nodes through the model, as a user's edits make them: under home, a node of the
test's own (`insertNewNodeAtEnd`, its `name`), its children the test's blocks, all inside
`nodeSpace.withoutUndoRecording`, as Tana makes its own layouts; the last test's node goes in the same
step. The panel opens it (`panel.setRootNode(id)`), each node with children is expanded
(`panel.expand(path)`: `expandAll` passes over a node whose children are all empty, as a node a user
has just made them in isn't), the undo history is emptied (`undoService.undoStack`, `redoStack`), and
the caret placed: `focusService.focusOnPathIdAtContentOffset(path, offset)`, then the DOM's selection
for a range. A node's editor is a `span.editable` inside `[data-editable-wrapper]`, whose `id` is the
node's path in the panel (`<test node>|<parent>|<node>`); its description's editor is beside it, its
wrapper `<path>|description`, focused and selected in directly; a caret before a to-do's `[ ] ` is
its checkbox focused (a button in `<path>|donecheck`), as Up and Down leave it.

`read` walks the test's node; the name or description being edited is read from its editor (its
`innerHTML`), the rest from the model. The caret is the DOM's selection in the focused editor. Blocks selected whole
are the panel's `selectedNodes`.

## How a block maps to a node

A block's first line is a node's name, its later lines the node's **description** (the lines under
the name, Alt+I's "Add description"; `node.description`), as WorkFlowy's driver has an item's note: a
name holds no line break (its setter refuses one), a description any. Both are rich text kept as HTML
(`&amp;`, `&lt;`, `<b>`, `<i>`, `<code>`, `<s>`, inline references as spans). Played by hand, the
description is the node's later lines to the keys too: Right at the name's end and Down go into it,
Left at its start and Up back to the name, Home to its start, Up and Down between its own lines;
Backspace at its start and Delete at the name's end join nothing, Enter in it makes a node after
(its text not split), Tab in it indents nothing (the focus leaves it), Shift+Tab goes to the name.
(Refused as "a block of more than one line" until 2026-10-18: 19 more cases run, 11 agree.) `load` writes
the canonical text as escaped text; `read` turns the HTML back into Markdown (`**`, `*`, `` ` ``, `~~`),
other markup into its text, a no-break space into a space. The rest are the node's attributes:

| canonical text | node |
| --- | --- |
| `[ ] task`, `[x] task` | a checkbox (`showDoneStateWithCheckbox`), done or not (`done`, `_done` a time) |
| `# title` | a section (flag 2 of `_flags`, `addFlag`): Tana's one heading, made by `!` at a node's start |
| `1. item` | its parent numbers its children: the parent's list view with "Show numbered bullets" (attribute `SYS_A283`), as Tana's command "Toggle numbered list" makes it; a node's number is its place among its parent's children |
| ```` ```js\ncode\n``` ```` | a code block (`docType` `codeblock`): its name the code, line breaks and all, its editor the same span, highlighted (highlight.js); its language a field (`Code block language`, `SYS_A70`; Tana's default, `plaintext`, read as none); read back with Markdown's fence for the code, the shortest backticks longer than any in it |

So `holds` refuses a caret in a number, inside a checkbox's `[ ]`, in a heading's `#` or on a code
block's fences (no text of the name's; before a to-do's `[ ] ` is its checkbox, focused), and the
driver refuses no `markup-` tag: a join or split at a section, a to-do or a code block is Tana's to
show (refused until 2026-10-18; played, 28 more cases run, 11 agree). `holds` also refuses a heading
other than H1, a list numbered in part or not from 1 (numbering is the parent's, for all its
children), a selection across a name and its description (an editor each), a block ending in a line
break (an empty description is none), and a code block with fences other than those it reads back
with (`~~~`, or more backticks than its code needs: a code block keeps no fences). Tables,
math and Markdown's other blocks a name can't hold are refused. These are legacy code blocks, which this
build makes ("code documents", the newer kind, is a feature flag the test user hasn't).

A node's fields (tuples, among its children in the model: a code block's language is one) are no blocks:
Tana shows them as the node's properties, and `read` passes over them.

In a code block, Enter breaks the code's line, and at the code's end makes a node after the block;
Shift+Enter makes one after it anywhere; Backspace at its start does nothing; Tab indents the block.
Its editor makes its text anew once more as it takes the focus, the caret going to the start: `load`
places the caret again once the page has settled.

Typing `1. ` doesn't number a node, nor `- ` or `[] ` make anything: they stay text. A backtick does:
`` ` `` toggles inline code (the "code" shortcut), so a typed `` `x` `` is `<code>x</code>`, read back
as `` `x` ``.

## Paste

Tana decides what a clipboard is before pasting it (`performPaste` in an editor, then `L4`): every
classifier that recognizes it gives a score, and the highest wins. The formats on the clipboard decide
which (the runner gives a case's own; until 2026-10-21 it gave the example's Markdown as plain text and,
where it had structure, the same rendered as HTML, [`../lib/clipboard.ts`](../lib/clipboard.ts), which
is what this section measured):

| classifier | score | when | pasted as |
| --- | ---: | --- | --- |
| `tana-html` | 105 or 60 | the HTML has structure (`p`, `ul`, `ol`, `li`, `h1`…`h6`, `br`, tables; 105 with a `pre`) | Tana's HTML importer (`ace`) |
| `tagr-ref` | 100 | the text is a link to a Tana node | a reference |
| `tana-paste` | 95 | the text starts `%%tana%%` | Tana Paste, its own format |
| `url` | 90 | the text is a URL | a URL node |
| `inline-html` | 70 | one line, with inline formatting | formatted text, in the name |
| `tana-markdown` | 50 | two or more lines starting `-`, `*` or a number (`Pue`) | Tana's Markdown importer (`sgt`, on `marked`) |
| `rich-plaintext` | 40 | more than one line | a node per line (`cgt`), each line's text as it is |
| `plaintext-inline` | 10 | anything | the text, in the name |

Ctrl+Shift+V ("cleanpaste") drops the HTML first, so the plain text decides. Where each puts what it
pastes, measured and read in its code:

- **One line** (`plaintext-inline`) goes into the name at the caret.
- **Lines** (`rich-plaintext`): a node per non-empty line, after the node the caret is in, in order; the
  node's text isn't split (`a┃b` and `x`, `y`: `ab`, `x`, `y`), nor is an empty node filled. A marker
  stays text (`- x`).
- **Markdown** (`tana-markdown`): items as nodes, with their nesting, after the node the caret is in;
  headings take what follows them as children.
- **Structured HTML** (`tana-html`), which every list the runner pastes is: a list at the top of the
  HTML is **appended to the end of the parent's children** (`T.addChild(...)`, where `T` is the
  caret's node's parent), not put after the caret's node, unless the parent's only child is empty, which
  it replaces; a paragraph and then a list makes the list the paragraph's children; a heading's text is a
  plain node. So `- a┃` / `- b` and `<ul><li>x</li></ul>` gives `a`, `b`, `x` (`paste-old.md › PasteOld26`). The same
  from a mouse click into the node or after moving the caret with keys: it is Tana's, not the load's. A
  real copy of a list from a page carries a `<meta charset>` before the list too, which the importer
  passes over: the same.
- The caret goes to the last pasted node's end.
- **No paste keeps lines in one node**: a node's name holds no line break. The paste options
  (Ctrl+Alt+V, `nnn`) offer "Paste as plain text" ("Keep text in this node") only for a clipboard
  without one (`"plaintext-inline": !r && s`, `r` its having a line break); for lines, only "Markdown
  nodes", "One node per line" and "Code block". So plain paste (paste-plain.md) has no Tana form, and
  its cases measure a node per line (read in the bundle, 2026-10-21).

## Results

On 2026-10-18: agree 199 (97 original outlines), caret 16, whitespace 14, disagree 112, error 0,
skipped 446; about 3½ minutes (on 2026-10-18: 170, 15, 13, 100, 0, 489). Every disagreement and caret verdict was
checked for the driver's and the runner's hand (below, what was), against the keys played by hand and
Tana's code:

- **Paste** (above): a list from HTML lands at the end of the parent; lines and Markdown after the node,
  the node's text never split; a code block (`<pre>`) after the node, its sibling, the caret at the
  code's start (`paste-old.md › PasteOld1`, `PasteOld66`).
- **Enter at a code block's end** leaves it, a node after it (`fences.md › Fence1`, `Fence5`); Shift+Enter
  anywhere in it too (`Fence8`).
- **Enter keeps the space** before where it splits, and the text after it keeps its leading space
  (`enter.md › Enter1`, `Enter44`): whitespace verdicts.
- **Enter mid-text in a node with children** makes its first child (`enterMidItem: child`, declared).
- **Enter on an empty node** makes another, nested or not: it never outdents, a last child either
  (`enter.md › Enter5`, `scenarios.md › Scenario2`).
- **Outdenting is logical** (declared): the later siblings stay with the parent.
- **Joins at a section** are of its name (`headingEditing: block`, declared): Backspace at a section's
  start joins its name into the node above, and Delete before one takes its name, the section gone
  (`backspace.md › Backspace18f`, `delete.md › Delete13b`); ourus's default takes the `# ` off first.
- **A list pasted into a node with children** goes after them (`pasteStructuredOnParent: after`,
  declared; at the end of the parent's children, as above).
- **Joins into code**: Backspace at the start of the node after a code block joins its text into the
  code (`backspace.md › Backspace16`); Delete before one, and Delete at the code's last empty line, do
  nothing (`fences.md › Fence34`, `Fence30`); a join of code lines that makes ```` ``` ```` is text in it,
  read back with four backticks (`Fence36`).
- **To-dos and Enter**: Enter at a to-do's end makes another to-do, but in the middle of its text, or
  at its start, a plain node (`obsidian-true-outliner.md › E32`, `tasks.md › TaskEnter4`), a to-do made
  by Ctrl+Enter alike; Enter on an empty to-do takes its checkbox away, the node staying
  (`TaskEnter2`, `TaskEnter5`).
- **A description joins nothing**: Backspace at its start, Delete at the name's end (`backspace.md ›
  Backspace9`, `delete.md › Delete3`); Enter at the name's end leaves it with the name, the new node
  after (`enter.md › Enter16`), and Enter in it doesn't split it (`E4`).
- **Before a to-do's checkbox** (the checkbox focused) Backspace, Delete and typing do nothing
  (`tasks.md › TaskBackspace1`, `delete.md › Delete19`); Right goes into the text.
- **A paste over a selection** of more than one line leaves the selected text and adds the nodes after
  (`paste-old.md › PasteOld48`, `PasteOld49`: a selection made with Shift and the arrows the same); one line
  replaces it.
- **Shift+Enter** is "insert node": an empty node after this one (after its children), the text left
  whole. No key breaks a line in a name.
- **Backspace and Delete don't join a node with children** to another: at the start of a node with
  children, or at the end of a node whose next has children, nothing happens (`backspace.md ›
  Backspace8`, `delete.md › Delete7`, `Delete12`). Backspace on an empty node with children does nothing
  either; Delete on one takes its first child's place, the first child keeping its own children and the
  others going up a level (`delete.md › Delete5`): neither of ourus's `emptyItemWithChildren` values, so
  undeclared.
- **Backspace at the start of a page's first node joins it to the page's title** (`backspace.md ›
  Backspace26`: the test's own node's name becomes `ourus sxspara`).
- **Numbering is the parent's**: Tab into a node that doesn't number its children takes the number away
  (`indent.md › Indent4`), and Enter in a numbered list numbers the new node.
- **Undo** takes back one typed character at a time at a typist's pace, and an undone indent leaves the
  caret in the placeholder row under the former parent (`undo.md › Undo4`, `Undo5`; read as no caret).

Checked again on 2026-10-18, every verdict but agree (142), three ways: replayed outside the runner
(the scratchpad's `verify.js`), each step's read the same as the run's; the read against the outline
as the page draws it (its rows, their depth, numbers, checkboxes, sections, names and descriptions),
the same but for one thing, below; and at `--slow=400`, no verdict or buffer changed. The one thing:
**a node Delete leaves in an empty node's place shows collapsed** (`delete.md › Delete5`, `Delete5b`):
its children are in the model, and read, but folded on the screen (the bullet ringed).

**The clipboard's format decides 12 paste verdicts.** Tana's paste picks its importer by the formats
(above), and the runner puts HTML beside the Markdown where it has structure (a copy from a rendered
page): played with `--plain-clipboard` (the text alone, as a copy from a Markdown source carries
it), 7 disagreements and 2 caret verdicts agree (a list pasted as Markdown goes after the node, as
in ourus: `PasteOld2`, `PasteOld16`, `PasteOld18`, `PasteOld60`, `Gap13`, the `#216` cases; `# h` as a line:
`PasteOld32`, `PasteOld34`) and 3 caret verdicts disagree (a fenced block pasted as text is no code block:
`PasteOld9`, `PasteOld11`, `PasteOld74`). Which copy the spec's clipboard stands for is the runner's policy,
not Tana's.

The camps were played with `--ignore-options` (each option-skipped case against its own value): Tana
agrees with every `headingEditing: block` and `pasteStructuredOnParent: after` case (3 and 4), now
declared, and with none for the values it was declared against (`enterMidItem: sibling`, `outdent:
direct`); the rest it agrees with in part or not at all, and those skips stand.

The harness's own, found in the first run and fixed:

- **The document's start, emulated**, pressed Home once the caret was on the first node, and Tana's Home
  at a node's start leaves the node (below): the caret went to the title, and a move after it did nothing
  (`scenarios.md › Scenario5`, `Scenario9`, `placeholders.md › Placeholder1`, `5`, `6`, `7`). Now Home
  (End) only when the caret isn't at the node's start (end).
- **A node whose only child is empty** was never expanded, so its child wasn't there to type into
  (`backspace.md › Backspace30`, an error).
- **A checkbox with the focus** read as no caret; it is the caret before the to-do's `[ ] `.
- **A node's fields read as blocks**: a pasted code block's language field (`Code block language:
  plaintext`) came back as three more blocks under it (`paste-old.md › PasteOld1`, `PasteOld9`).
- **A clipboard's HTML read otherwise than ourus reads its Markdown** (the runner's, for every app that
  reads HTML): a fenced block copied from inside an item, its later lines keeping the item's indentation,
  was dedented only by what all its lines share, so the closing fence, six columns in, was code, and the
  HTML's code block held it (`paste-old.md › PasteOld66`). The runner renders now what ourus's paste reads
  (`clipboardSource` in `src/commands/paste.ts`); of the spec's clipboards, only PasteOld66's HTML changed.
- **Undo, at the runner's pace.** Tana undoes records less than 50 ms apart together (`C6` in its
  bundle: `Math.abs(a.ts - b.ts) < 50`, records without a group of their own); the runner typed a
  character about every 45 ms (settling alone), so one undo took back a part of a word that depended on
  the machine (`scenarios.md › Scenario20`, `Scenario23`), and a move typed right after the last
  character went with it. The runner now types at a typist's pace (`PACE`, 100 ms between keys, in
  `run.ts`), for every app.

## Quirks

- **Home at a node's start, End at its end, leave the node**: Home goes to the parent node (from a
  top-level node, the page's title), End likewise. Elsewhere they go to the line's start and end.
- **Up and Down go to the next node's start**, not to the column: Tana focuses the node found below or
  above (`jumpDownFromClosestToPos`, then the element's `focus()`), and a focused editable starts at 0
  (`cursor.md › CursorDown4`).
- **Up and Down stop at a to-do's checkbox** (a button, `<path>|donecheck`, a navigation target) on
  their way into its node: read as the caret before the `[ ] `.
- **Placeholder rows**: an expanded node without children shows an empty row under it, and a panel one
  after its last node, to type into (typing makes the node). They are no nodes: a caret there reads as
  none. Down from the last node goes there (`cursor.md › CursorDown1`), and an undone indent leaves the
  caret in one.
- **Up from the first node** goes to the page's title, the test's own node.
- Each edit is an undo record of its own, but records less than 50 ms apart are undone together.
- The app has two editors on a page: the panel's title is the test's own node's name, editable like any.

## Internals

- `window.appState.nodeSpace`: `rootFile` (`homeNode`), `getNodeOrPlaceholder(id)`,
  `getNodeIfInMemory(id)`, `allNodes`, `withoutUndoRecording(fn)`, `undoService` (`undoStack`,
  `redoStack`: records `{ ts, groupId?, do, undo }`), `focusService` (`focusOnPathIdAtContentOffset`,
  `jumpUpFrom`/`jumpDownFrom…`), `appUser` (`setOnboardingCompleted`).
- A node: `id`, `name` (HTML), `children`, `parent`, `insertNewNodeAtEnd()`, `insertNodeAfter`,
  `removeChild`, `moveChildTo`, `addFlag`/`getOwnNodeFlags`, `showDoneStateWithCheckbox`,
  `hasOwnDoneStateAsCheckboxSetting`, `done`/`isDone`, `cycleDoneState()` (Ctrl+Enter's),
  `createMetaNodeIfMissing()`, `metaNode` (`addNewListView(name)`, `userOrDefaultView`), `hasView`,
  `tupleNodeMap` (a node's fields by attribute id).
- `window.appState.layoutManager.currentPanelUIState.firstPanel`: the main panel: `rootNode`,
  `rootPath`, `setRootNode(id)`, `expand(path)`, `expandAll(path)`, `selectedNodes`,
  `clearAllSelected()`.
