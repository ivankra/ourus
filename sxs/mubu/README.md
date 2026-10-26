# Mubu

[`driver.ts`](driver.ts) drives [Mubu](https://mubu.com/) (幕布), an outliner widely used in China (a
web app, with desktop and phone apps around the same editor), closed source. It runs on an outline
shared on Mubu's site, https://mubu.com/explore/rHSdgLpbl (a list of online tools, 2019), which any
visitor opens without an account: the page is Mubu's own editor (its `Outliner` and `DocEditor`
bundles, every node an `mm-editor`), read-only to a visitor, and the driver makes it editable. Web
release 20261021032919 on 2026-10-26: the release Mubu's error reporting names
(`__SENTRY__.hub.getClient().getOptions().release`).

Creating or editing an outline of one's own needs an account (a phone number or WeChat), which a
first sign-in makes. Shared outlines (`mubu.com/explore/…`, `share.mubu.com/doc/…`) open without one.
Several sites use Mubu's name and are none of Mubu's (download and redirect pages): only `mubu.com`
is used.

## Keys (Linux)

From the text editor's keymap in Mubu's bundle (`app-*.js`: a map from `CmdOrCtrl + Shift + ArrowUp`
and the like to `sendHotkeyEvent(e, MoveUp)`), Ctrl on Linux for ⌘; the ones the driver plays checked
in the page:

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | *missing*: Shift+Enter goes to the node's note (`SwitchNote`), another action than a line break, which a node's text doesn't hold (its cases skip) |
| `indent` | Tab |
| `outdent` | Shift+Tab |
| `moveSubtreeUp` | Ctrl+Shift+Up (`MoveUp`: the node with its children) |
| `moveSubtreeDown` | Ctrl+Shift+Down (`MoveDown`) |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, then Backspace (no command for it) |
| `deleteSubtree` | Ctrl+Shift+Backspace (`DeleteNode`: the node with its children; Ctrl+Shift+Delete too) |
| `duplicateSubtree` | Ctrl+D (`Clone`: the copy after the node, the caret in the copy) |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Y (also Ctrl+Shift+Z) |
| `cursorDocStart`, `cursorDocEnd` | *emulated*: Ctrl+Home and Ctrl+End go to the node's text's start and end, so Up (Down) until the caret stops, then Home (End); Up from the first node goes into the outline's title, and back down |

Other shortcuts in the keymap:

| keys | what it does |
| --- | --- |
| Ctrl+Shift+L | makes the node a task (`taskStatus` 1), or a task a node again |
| Ctrl+Shift+K | the task's status: done (`taskStatus` 2) and back |
| Ctrl+Enter | strikes the node's text through (a `strikethrough` style on its runs) |
| Alt+1, Alt+2, Alt+3, Alt+4 | the node's heading: H1 to H3, none; with Shift, its siblings' too |
| Ctrl+B, Ctrl+I, Ctrl+U, Alt+L | bold, italic, underline, inline code (the selection's runs); with Shift (B, I, U), the siblings' |
| Ctrl+K | a link |
| Ctrl+Shift+X | masks the selection (a cloze, shown as a blank to click) |
| Ctrl+], Ctrl+[ | zooms into the node ("drill"), out to its parent |
| Ctrl+. (also Alt+.) | folds or unfolds the node; Ctrl+Shift+., its siblings |
| Ctrl+Up, Ctrl+Down | to the previous, next node |
| Ctrl+A | the node's text, then more |
| Alt+Enter | adds an image |
| Ctrl+Alt+T | a table in the node |
| Ctrl+Alt+M | a comment |
| Esc | leaves the text: the node selected |

With the selection of nodes (Shift+Up or Down past a node's edge), another keymap: the same moves,
indent, undo, copy and cut, Ctrl+Enter strikes the nodes through, Ctrl+Shift+L makes them tasks.

## Stack

A closed-source web app (React, Redux, RxJS), its editor Mubu's own: each node's text and note are a
`contenteditable` (`div.content.mm-editor`, `div.note.mm-editor`, `data-id` the node's id), over a
model of nodes (`outliner.model`), changed by actions (`outliner.modelEditor`: `create`, `delete`,
`move`, `updateNode`, each an action with an inverse, kept by an undo manager). A node's text is a
list of runs (`{ type: 1, text, style: { bold, italic, underline, strikethrough, code } }`, other
types for mentions and tables); older outlines kept HTML (`<span class="bold">`), and a node given
text as a string is read so. The editor (`state.doc.outliner`) and its settings (`outliner.config`:
`editable`, `markdown`, …) hang off the page's Redux store.

## A shared outline, made editable

A shared outline opens with the editor's `editable` setting off: keys type nothing, Enter and Tab do
nothing. Set on (`outliner.config.setConfig('editable', true)`), it edits as its owner's does: Enter,
Tab, moves, undo. Nothing is saved: a change goes to Mubu only for a member who may write
(`permission`), checked apart from the editor, which logs `change action in readonly mode!` and drops
it. The driver finds the store through React (the root's fiber tree, the first `store` prop), as
BlockNote's finds its editor; no bundle is patched.

A visitor is shown a sign-in dialog shortly after the page loads (`state.modal.loginModal`), which
takes the focus. The driver closes it as its close button does, with the app's own action
(`@modal/set_login_modal_visible`, `visible: false`), whenever the store says it is open.

## Traffic

Pages and scripts are cached as any site's. Mubu's API (`api2.mubu.com`) answers by POST, the
outline too (`/v3/api/explore/get`, `{"exploreDocId": "rHSdgLpbl"}`): [`proxy.ts`](proxy.ts) caches
every POST to it by its body, so only a cold cache's first load reaches Mubu, and adds one to the
outline's public count of reads. The API's reports on the visitor (`/v4/api/common/user/device_info`,
`/v4/api/common/user/user_app_info`, `/v4/api/user/trace`), whose bodies carry a fresh id or time on
every load, are answered there and sent nowhere; Baidu's analytics (`hm.baidu.com`) and Sentry are
blocked hosts.

## Setting up and reading a test

- **The shared outline**: each test's nodes replace the last test's at its top level (`modelEditor.delete`
  for each, then `modelEditor.create` for each top-level node with its children nested), then the
  history is emptied (`undoManager.clearStack()`), so that undo stops where the test starts. The caret
  is placed by Mubu's own `focus` command (`command.execute('focus', id, inNote, { start, end })`, as
  moving a node puts it back), a backward selection then set in the DOM.
- **Reading**: the model (`model.toJSON().nodes`: `text` and `note` runs, `heading`, `taskStatus`),
  which follows the editor as it types, and the caret from the DOM's selection in the focused
  `mm-editor`. Nodes selected as nodes are the selection service's (`getService('Selection')
  .getSelection()`: `{ type: 'node', nodes }`), the caret's editor keeping the focus.
- **A block is a node's text**, one line: its later lines are the node's note (Shift+Enter), the caret
  in it past the text and a line break. An empty note is none, so a block ending in a line break
  isn't held.
- **A to-do is a task** (`taskStatus` 1, `[ ] `; 2, done, `[x] `), **H1 to H3 a heading level**: a
  node's attributes, not text, so a caret can't be in them. Mubu's other marks on a node (finished, a
  colour, a highlight) have no Markdown and are neither made nor read.
- **Inline formatting** is read as Markdown (`runsAsMarkdown`): bold, italic, strikethrough, code;
  underline as plain text. A test's text is loaded as one plain run, its Markdown as text.
- **No numbered lists, code blocks or quotes**: none found in the editor (its `addListMarker` command
  numbers nothing in this release); numbered items are loaded as plain nodes (the `numbered list`
  adaptation), code blocks and quotes are skipped.

## What Mubu does that a driver has to know

- **Backspace at a node's start joins it to its previous sibling only** (`mergeToPrevNode`): a first
  child is left as it is, unless it is empty, when it is deleted and the caret goes to its parent. In
  a note, Backspace at its start goes back to the node's text.
- **Up and Down on a node's only line go to its start and end first**, as a text field's do, then
  to the node above or below. Up from the first node goes into the outline's title.
- **A move goes by the visible nodes**: Ctrl+Shift+Up on a node after one with children puts it as
  that one's first child, not before it.
- **A node's trailing spaces aren't drawn**: its text keeps them (`a `), its editor shows `a`, and no
  caret goes past them; a test starting with one there is skipped (`holds`: Enter58).
- **Pasted plain lines become nodes after the node**, its text after the caret staying in it
  (PastePlain1 to PastePlain5), and a selection's text is left as it is.
- **Enter at a heading's start** makes the empty node above a heading too (Enter32, Enter42).
- **Deleting a node** (Ctrl+Shift+Backspace) leaves the caret at the end of the node before it
  (DeleteSubtree3, DeleteSubtree4, Lists9); after Backspace at the first node's start the caret is in
  the outline's title, no block (Backspace17, Backspace43).

## Where Mubu behaves as an option of ourus's

Measured with `--ignore-options` (2026-10-26), each value agreeing in its cases where ourus's default
didn't (the driver's `behaves`):

| option | Mubu | cases |
| --- | --- | --- |
| `outdent` | `logical`: Shift+Tab takes the later siblings along | LogicalOutdent1, LogicalOutdent4, TO7 |
| `enterSplitSpace` | `start`: the space at the split starts the new node | Enter65 to Enter65d, Enter65i, Enter65j |
| `joinWithChildren` | `refuse` | Backspace45b, Delete31b, Regression20 |
| `emptyItemWithChildren` | `refuse` | Backspace17f, Backspace17g |
| `backspaceAtTopItem` | `refuse` | Backspace34 |
| `headingEditing` | `block`: the level is the node's, kept through a join | Regression18, Regression19, Backspace18f, Delete13b, Delete13f |
| `pasteLines` | `items` | Paste17g, Paste18, Paste19, Scenario17 |
| `pasteOverSelection` | `ignore` | Paste17b to Paste17d, Paste17f, PastePlain33c |

Mixed, left at ourus's default: `pasteSeams` (open: 2 of 5), `pastePlainLines` (items: 2 of 5; Mubu's
own way is neither), `taskEditing`, `enterOnEmptyItem`.
