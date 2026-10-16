# Dynalist

[`driver.ts`](driver.ts) drives Dynalist's live demo, https://dynalist.io/demo, which opens a sample
document (`/demo/<id>`, "Welcome to Dynalist") for anyone, without a login. Edits stay in the page:
over a full run nothing but beacons left the browser, and those the proxy answers. Dynalist 9 (build
20260830132109, commit 5cc489d) on 2026-10-13: `DYNALIST.VERSION`, `DEPLOY_BUILD` and
`DEPLOY_COMMIT`. Last results: [`sxs.md`](sxs.md).

## Keys (Linux)

From Dynalist's shortcut table (`DYNALIST.app.shortcuts.get_shortcuts(id)`, ids `doc-indent` and
so on, defined by `ra("doc-indent", ...)` calls in `main.min.js`):

| action | keys |
| --- | --- |
| `enter`, `shiftEnter` | Enter, Ctrl+Shift+Enter (`doc-insert-new-line`) |
| `indent`, `outdent` | Tab, Shift+Tab |
| `moveSubtreeUp`, `moveSubtreeDown` | Ctrl+Up, Ctrl+Down (`doc-swap-up`, `doc-swap-down`) |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace |
| `deleteSubtree` | Ctrl+Shift+Backspace (`doc-delete-left`: the item and its children) |
| `pasteStructured`, `pastePlain` | Ctrl+V, Ctrl+Shift+V (but see below) |
| `undo`, `redo` | Ctrl+Z, Ctrl+Y (also Ctrl+Shift+Z) |
| `cursorDocStart`, `cursorDocEnd` | Ctrl+Home, Ctrl+End (`doc-goto-first`, `doc-goto-last`: the first item's start, the last one's end) |
| caret motions | arrows, Home, End; `select…` with Shift |

`duplicateSubtree` (`doc-duplicate`) has no key by default; its tests are skipped. Shift+Up and Down at
an item's edge select items, not text.

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
  to wait for.
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
  (`backspace.md › Backspace17`). A caret there is no block's, and is read as none.
- **Paste has no plain form.** Dynalist handles the paste event itself: text becomes items
  (`import_plaintext`), whatever the key; Ctrl+Shift+V only drops the clipboard's HTML, and there is
  none. The first line joins the item at the caret, the rest are items after it, and the last line
  takes the text after the caret. The spec's clipboards end with a line break, so that last line is
  empty and the text after the caret becomes an item of its own (`paste.md › Paste7`: `a┃b` with
  `x⏎y⏎` gives `ax`, `y`, `┃b`; without the line break it gives `ax`, `y┃b`). List markers stay as
  text: `- a` pastes as an item `- a` (`obsidian-true-outliner.md › Paste › #216`).
- **Enter splits an item by making the first half a new item before it**: the children stay with the
  second half (`enter.md › Enter3`), and the space after the caret stays at its start (`Enter1`).
  Enter on an empty item makes a sibling (`enterOnEmptyItem: sibling`, ourus's default). Inside a
  code block Enter splits the item too (`fences.md`).
- **Joining**: Backspace at an item's start joins it to the item above, but not a first child to its
  parent (`obsidian-true-outliner.md › Backspace › Children move to the joined node`); Delete doesn't
  pull up the first child of an empty item (`del.md › Delete5` family).
- **Empty items stay** when the caret leaves them (`obsidian-true-outliner.md › Abandoning an empty
  place`).
- **Item attributes stay**: Tab doesn't change a heading's level (`indent.md › Indent12`), as in
  Logseq and WorkFlowy.

One example varied: `cursor.md › CursorDown4` (Down from `abc┃` onto an indented `bcd`) gave `caret`
in six full runs and `agree` in one, and `caret` in 28 repeats on its own and with the rest of
`cursor.md`. Down lands the caret by pixels in a proportional font, so a layout a pixel off
(something an earlier example left) can move it a character.

No Dynalist bugs met so far.

## Internals

Dynalist's own objects, as the driver uses them (`window.DYNALIST`): `VERSION`, `DEPLOY_BUILD`, `DEPLOY_COMMIT`; `app.app_document` has
`document` (`get_node_collection()`: `get_root`, `find_node`), `controller` (`create_node`,
`get_history()`: `undoStack`, `redoStack`, `lastEdit`), `view` (`exec(fn)`, whose action has
`attach(node, parent, index)`, `detach`, `edit(node, meta => ...)`; the editing commands, `indent`,
`unindent`, `split_node`, `paste_as_plain_text`) and `ui` (`set_selection(node, anchor, head)`,
`selection().get()`, `get_node_state(node).dom.content_el`, `current_root`, a property). A node's
children are a collection (`get(i)`, `length()`, `each`, `array()`); its attributes are
`get_meta_object()`: `get_content`, `get_note`, `has_checkbox`, `is_checked`, `get_heading`, and their
setters. `app.preferences` (`get_boolean`, `set_boolean`), `app.shortcuts.get_shortcuts(id)`. The
editors are the contenteditable `.Node-content` and `.Node-note`.
