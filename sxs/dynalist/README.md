# Dynalist

[`driver.ts`](driver.ts) drives Dynalist on [dynalist.io/demo](https://dynalist.io/demo).

The live demo page opens a sample document (`/demo/<id>`, "Welcome to Dynalist") for anyone without a login.
Edits stay in the page: over a full run nothing but beacons left the browser, and those the proxy answers.
Dynalist 9 (build 20260830132109, commit 5cc489d) on 2026-10-13: `DYNALIST.VERSION`, `DEPLOY_BUILD` and
`DEPLOY_COMMIT`.

## Keys (Linux)

From Dynalist's shortcut table (`DYNALIST.app.shortcuts.get_shortcuts(id)`, ids `doc-indent` and
so on, defined by `ra("doc-indent", ...)` calls in `main.min.js`):

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | Ctrl+Shift+Enter (`doc-insert-new-line`; twice, a blank line, the block holding paragraphs: an item's paragraphs right after its text are its block's (`paragraphsInBlock`, since 2026-10-25)) |
| `indent` | Tab |
| `outdent` | Shift+Tab |
| `moveSubtreeUp` | Ctrl+Up (`doc-swap-up`) |
| `moveSubtreeDown` | Ctrl+Down (`doc-swap-down`) |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace |
| `deleteSubtree` | Ctrl+Shift+Backspace (`doc-delete-left`: the item and its children) |
| `duplicateSubtree` | *missing* (`doc-duplicate` has no key by default): its tests are skipped |
| `pasteStructured` | Ctrl+V (but see below) |
| `pastePlain` | Ctrl+Shift+V (but see below) |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Y (also Ctrl+Shift+Z) |

Other shortcuts (the rest of the table with a default key that an outliner would want; each measured
in the demo, 2026-10-18):

| id | keys | what it does |
| --- | --- | --- |
| `doc-toggle-checked` | Ctrl+Enter | checks the item (or unchecks it), then the caret goes to the next item |
| `doc-toggle-checklist` | Ctrl+Shift+C | gives the item a checkbox, a to-do (or takes it away) |
| `doc-toggle-ordered-list` | Ctrl+Shift+X | numbers the item's children (its list style; from the title, the top level's) |
| `doc-cycle-heading` | Ctrl+Shift+H | the item's heading: H1, H2, H3, none |
| `doc-cycle-color-label` | Ctrl+Shift+L | the item's color label, in turn |
| `doc-delete-right` | Ctrl+Shift+Delete | deletes the item with its children (as Ctrl+Shift+Backspace), the caret to the next item |
| `doc-collapse`, `doc-collapse-all` | Ctrl+., Ctrl+Shift+. | folds or unfolds the item; the item and every item below it with children |
| `doc-zoom-in`, `doc-zoom-out` | Ctrl+], Ctrl+[ | zooms into the item, out to its parent |
| `doc-zoom-prev-sibling`, `doc-zoom-next-sibling` | Ctrl+Shift+[, Ctrl+Shift+] | while zoomed, into the previous, next sibling of the item zoomed into |
| `doc-goto-notes` | Shift+Enter | into the item's note |
| `doc-select-all`, `doc-select-all-force` | Ctrl+A, Ctrl+Shift+A | the item's text, then (again) the item as an item; every top-level item |
| `doc-move-node` | Ctrl+Shift+M | the node mover: a search for where the item goes (a scope over the editor's, `node-mover`) |
| `doc-bold`, `doc-italics`, `doc-insert-code` | Ctrl+B, Ctrl+I, Ctrl+` | Markdown as text around the selection (`****` at a caret) |
| `doc-format-link` | Ctrl+K | Markdown's link as text (`[]()` at a caret) |

With no default key: duplicate, go to parent or a sibling, the item's start or end, sort children,
strikethrough, highlight, a code block, uncheck children, delete checked items, a checkbox on every
child. Characters that open a popup while typing: `!` at a word's start opens the date picker (a
scope over the editor's, `datepicker`, which keys go to until it closes); `#` and `@` (tags) and `[[`
(links) autocomplete from what the document has, and in the demo open nothing.

## Stack

A closed-source web app: one bundle of its own (`main.min.js`, readable names: `DYNALIST.app`,
`app_document`, `view.exec`), with jQuery, KaTeX and highlight.js beside it. Each item's content and
note are edited in a `contenteditable`; documents come from its API by POST. The desktop app wraps the
same web app.

## Traffic

Pages and scripts are cached as any site's. The document and the app's data come by POST
(`/api/file/load`, `/api/bundle_binary`), whose answers depend only on the request: [`proxy.ts`](proxy.ts)
caches them by their body. Its beacons, `dynlst.com/update` and Cloudflare's `/cdn-cgi/rum`, are
answered there and sent nowhere. Libraries load when first needed (highlight.js with the first code
block), and are cached then. Setting a preference (below) sends nothing.

## Setting up and reading a test

- **The demo document**, its root zoomed into: each test's items replace the last test's under the
  root, in one edit (`view.exec` with `detach`, `attach` and `edit`, nodes from
  `controller.create_node`), and then the history is emptied (`undoStack`, `redoStack`, `lastEdit`
  of `controller.get_history()`), so undo stops where the test starts. The caret is
  `ui.set_selection(node, anchor, head)`, which keeps a backward selection backward.
- **Reading**: the node tree (`children.each`, `get_meta_object()`: `get_content`, `get_note`,
  `has_checkbox`, `is_checked`, `get_heading`), and the selection from `ui.selection().get()` (a node
  with `get_position_start` and `get_position_end`; nodes selected as nodes have only `get_nodes`).
  Its direction is the DOM selection's. The model follows the editor as it types: there is no save
  to wait for. Dynalist's italic, `__i__` (strong to Markdown), is read as `*i*`, the caret moved
  with it (`italicsAsMarkdown` in lib/block.ts, since 2026-10-25).
- **A block is an item's content**, which holds line breaks: Ctrl+Shift+Enter ("insert new line")
  makes one, and that is the spec's Shift-Enter. Dynalist's Shift+Enter goes to the item's note,
  which blocks have no place for; no action of the spec's made a note over a full run (a note would
  be read after the content and a line break).
- **To-dos** are items with a checkbox (`[ ] `, `[x] ` when checked) and **headings** an item's level
  (H1 to H3, `#` to `###`): attributes, not text, so no caret goes inside them, and deeper headings are
  skipped. Code blocks, tables and the like are text in the content: they load as written.

## What Dynalist does that a driver has to know

- **Outdenting is logical**, unless "unindent in place" is on (the preference `unindent_in_place`):
  `view.unindent` moves the items past their parent, and with the preference also takes the later
  siblings along as the last item's children, a direct outdent. The driver declares both
  (`settings`) and sets the preference per test (`app.preferences.set_boolean`); `outdent.md ›
  DirectOutdent1` and `LogicalOutdent1` both agree.
- **The document's title** (the root's content) comes before the first item: Up from the first item
  goes into it, and so does the caret when Backspace deletes an empty first item
  (`backspace.md › Backspace17`); Backspace at a first item's start joins its text to the title
  (`Backspace26`). A caret there is no block's, and is read as none. `load` sets the title back to
  the demo's, which tests would otherwise add to, one after another.
- **Numbering is the parent's.** An item's list style (`set_list_style(1)`, Ctrl+Shift+X) numbers
  its children, all of them, from 1 (a CSS counter per parent); the root's numbers the top level.
  The driver loads a numbered list as its parent's style and reads a block as numbered where its
  parent numbers; a list numbered in part, or not from 1, it refuses. So Enter in a numbered list
  makes a numbered item (`enter.md › Enter2`), and Tab takes an item out of its list into its new
  parent's, which numbers nothing (`indent.md › Indent4`). (Until 2026-10-18 the driver set the style
  on the numbered items themselves, which Dynalist shows as bullets, numbering their children: 13-align
  took "Dynalist doesn't number the block Enter makes" from that.)
- **Popups outlive a test.** `!` at a word's start opens the date picker, whose scope stays over the
  editor's into the next test unless closed; under it, `onPaste` leaves a paste to the browser, which
  pastes into the item as it is (`scenarios.md › Scenario18`, after a test that typed `!`), and an
  Enter goes to the picker (Scenario20). `load` closes them (`app.scope.fix_scope_to_editor()`).
- **Paste has no plain form.** Dynalist handles the paste event itself (`onPaste`). A clipboard with
  HTML is pasted by the browser into a hidden input and read back from there (`paste_as_html`, a
  `setTimeout` later): lists become items, headings and code blocks text. Plain text becomes items
  (`import_plaintext`, its indentation nesting them), whatever the key: Ctrl+Shift+V only drops the
  clipboard's HTML. The first line joins the item at the caret, the rest are items after it, and the
  last line takes the text after the caret. The spec's clipboards end with a line break, so that last line is
  empty and the text after the caret becomes an item of its own (`paste-old.md › PasteOld7`: `a┃b` with
  `x⏎y⏎` gives `ax`, `y`, `┃b`; without the line break it gives `ax`, `y┃b`). List markers stay as
  text: `- a` pastes as an item `- a` (`obsidian-true-outliner.md › Paste › #216`; checked by hand,
  outside the harness: `- x⏎- y` at `a┃` gives `a- x`, `- y`, the same with HTML a list), which the
  driver declares, `quirkPasteText: dynalist` (since 2026-10-25: 27 disagreements to agreements). Only a note, or the
  document's title, takes the text as it is (`insert_text`); in an item there is no paste that keeps
  lines in it, so paste-plain.md's cases measure an item per line. A line's indentation nests it under
  the line above, and a blank line is an empty item (probes, 2026-10-21).
- **Enter splits an item by making the first half a new item before it**: the children stay with the
  second half (`enter.md › Enter3`), and the space after the caret stays at its start (`Enter1`).
  Enter on an empty item makes a sibling (`enterOnEmptyItem: sibling`, ourus's default). Inside a
  code block or math Enter splits the item too, as on any text (a code line is Ctrl+Shift+Enter's):
  the driver refuses `enter-in-fence` (since 2026-10-25: Fence1, 2, 3, 5, 42).
- **Joining**: Backspace at an item's start joins it to the item above, but not a first child to its
  parent (`obsidian-true-outliner.md › Backspace › Children move to the joined node`); Delete doesn't
  pull up the first child of an empty item (`delete.md › Delete5` family).
- **Empty items stay** when the caret leaves them (`obsidian-true-outliner.md › Abandoning an empty
  place`).
- **Enter inside a heading's title** gives the text before the caret to a new item above and keeps
  the heading on the rest: the driver declares `quirkEnterMidHeading: workflowy` (since 2026-10-25;
  `obsidian-true-outliner.md › TO-E13-E16`, `quirks.md › Quirk1`), as Roam and WorkFlowy do.
- **Item attributes stay**: Tab doesn't change a heading's level (`indent.md › Indent12`), as in
  Logseq and WorkFlowy.
- **A join keeps the lower item**: Backspace or Delete between two items puts the upper one's text
  into the lower one, which keeps its heading, checkbox, numbering and place (`- a┃`, `- # H`,
  Delete: `- # a┃H`; Fence35's item moves to the top level, where the lower one was). Hence the
  `markup-` cases, played (2026-10-18; before, the driver refused the three tags): where ourus takes a
  heading's `#`s or a checkbox off at the text start, Dynalist joins the items.
- **Fences are text**: Backspace, Delete, Enter and Shift+Enter at a fence's edge edit the backticks
  or split the item (`fences.md`), as in a text editor; ourus keeps the fence whole. So the driver
  refuses `markup-fence` again (since 2026-10-25), as Logseq's, Tine's, Athens's and Roam's do: those
  cases have no boundary to compare where ourus has one (33 disagreed, 20 agreed when played); the
  heading and task tags stay played.

One example varied: `cursor.md › CursorDown4` (Down from `abc┃` onto an indented `bcd`) gave `caret`
in six full runs and `agree` in one, and `caret` in 28 repeats on its own and with the rest of
`cursor.md`. Down lands the caret by pixels in a proportional font, so a layout a pixel off
(something an earlier example left) can move it a character.

Dynalist bugs met:

- **The caret after an HTML paste of a paragraph and a list** (`paste-old.md › PasteOld36b`): `See ┃here.`
  with `x`, `- y` (as HTML) gives `See x`, its child `yhere┃.`, the caret at the offset it would have in
  the first item (`See x┃`), set in the last. From plain text, or HTML of a list alone, the caret is
  right.

## Markdown in an item

Rendered once the caret leaves the item: `**bold**`, `__italics__`, `~~strike~~`, `==highlight==`,
`` `code` ``, fenced code blocks (highlighted by language), `$$` math, links, images, `#tags`,
`@mentions` and `[[links]]`. Shown as typed: `>` quotes and callouts, `#` headings and setext
underlines (a heading is the item's level), thematic breaks, tables, indented code, HTML and comments,
lists and `[ ]` inside an item's text (a to-do is the item's checkbox). The spec's cases with quotes,
callouts, indented code or frontmatter are skipped: Dynalist has none of them, only their text.

Skips checked 2026-10-18, each kind played by hand where it could be: the `free-form` cases test
what an outline of items has no form for (none of them is mistagged); no text selection spans items
(Shift+Down and a drag select items); numbering counts every child from 1 (no start, no mixed lists);
no caret before an item's text; `duplicateSubtree` has no key, and binding one is Pro's (custom
shortcuts apply only for Pro accounts; the item's menu has Duplicate); Ctrl+Shift+Home selects to
the item's start, not the document's.

## Internals

Dynalist's own objects, as the driver uses them (`window.DYNALIST`): `VERSION`, `DEPLOY_BUILD`, `DEPLOY_COMMIT`; `app.app_document` has
`document` (`get_node_collection()`: `get_root`, `find_node`), `controller` (`create_node`,
`get_history()`: `undoStack`, `redoStack`, `lastEdit`), `view` (`exec(fn)`, whose action has
`attach(node, parent, index)`, `detach`, `edit(node, meta => ...)`; the editing commands, `indent`,
`unindent`, `split_node`, `paste_as_plain_text`) and `ui` (`set_selection(node, anchor, head)`,
`selection().get()`, `get_node_state(node).dom.content_el`, `current_root`, a property). A node's
children are a collection (`get(i)`, `length()`, `each`, `array()`); its attributes are
`get_meta_object()`: `get_content`, `get_note`, `has_checkbox`, `is_checked`, `get_heading`,
`get_list_style` (`is_numbered_list`: its children numbered), and their setters. `app.scope` (the
stack of scopes keys go to: `scopes`, `get_name()`; `fix_scope_to_editor`). `app.preferences` (`get_boolean`, `set_boolean`), `app.shortcuts.get_shortcuts(id)`. The
editors are the contenteditable `.Node-content` and `.Node-note`.
