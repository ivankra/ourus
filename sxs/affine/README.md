# AFFiNE

[`driver.ts`](driver.ts) drives [AFFiNE](https://affine.pro/), a block editor of Notion's kind
(paragraphs, headings, quotes, list items, to-dos and code are blocks, and any block may have
children), open source (`toeverything/AFFiNE`, its editor BlockSuite, MIT for BlockSuite). It runs in
its web app, https://app.affine.pro/, whose first visit without an account makes a demo workspace
kept in the browser (IndexedDB) and opens its "Getting Started" doc; nothing is saved to AFFiNE's
servers. AFFiNE 0.27.4 (editor 0.27.4) on 2026-10-26: `BUILD_CONFIG.appVersion` in its bundle, and
the names of the workers the page loads (`workspace-profile-0.27.4.worker.js`), which `open` reads.

The spec's buffers are projected onto blocks (the `block` model, [`../lib/block.ts`](../lib/block.ts))
in free form (`freeForm`): a paragraph, a heading, a quote or code is a block outside every list (`¶`
in the drawings), as AFFiNE's own `affine:paragraph` and `affine:code` blocks are, a list item an
item (`affine:list`).

## Keys (Linux)

From BlockSuite's keymaps in AFFiNE's bundle (`index.*.js`: `bindHotKey({...})`, `hotkey: [...]`),
Ctrl for Mod on Linux; the ones the driver plays checked in the app:

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | Shift+Enter (a line break in the block) |
| `indent` | Tab: the block, with its children, under the one before (a paragraph too) |
| `outdent` | Shift+Tab |
| `moveSubtreeUp` | Ctrl+Alt+Up ("Move Up"; Ctrl+Shift+Up too): the block with its children |
| `moveSubtreeDown` | Ctrl+Alt+Down ("Move Down"; Ctrl+Shift+Down too) |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, then Backspace (no command for it) |
| `deleteSubtree` | Escape, then Backspace: Escape selects the block being edited (a block selection, its children with it), Backspace deletes it; no block is edited after (`noCaretAfter`) |
| `duplicateSubtree` | *missing*: a block is duplicated from its menu (the drag handle), with the mouse; its examples are skipped |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Shift+Z (Ctrl+Y on Windows only) |
| `cursorDocStart`, `cursorDocEnd` | Ctrl+Home, Ctrl+End: the first block's start, the last's end |

Playwright's `Control+Shift+z` sends the key `z` with Shift, which BlockSuite's `Shift-Mod-z` doesn't
match (it reads the key Shift makes, `Z`): the driver presses `Control+Shift+Z`, and so for
`Control+Shift+V`.

Other shortcuts in the bundle:

| keys | what it does |
| --- | --- |
| Ctrl+Alt+0 (Ctrl+Shift+0) | the block a paragraph of text |
| Ctrl+Alt+1 to 6 (Ctrl+Shift+1 to 6) | a heading, H1 to H6 |
| Ctrl+Alt+8, Ctrl+Alt+9 (with Shift too) | a bulleted, a numbered list item |
| Ctrl+Alt+C | a code block |
| Ctrl+Alt+D (Ctrl+Shift+D) | a divider |
| Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+S, Ctrl+E | bold, italic, underline, strikethrough, inline code |
| Ctrl+K | a link |
| Ctrl+Shift+L | the selection as a linked doc |
| Ctrl+Shift+L, E, R (on an image or a block) | align left, center, right |
| Escape | the block being edited selected as a block |
| `/` | the slash menu: block types, by name |
| `@` | links to docs, people, dates |

Markdown typed at a block's start converts it as Space follows: `# x` a heading, `- x` a bulleted
item, `1. x` a numbered one, `[] x` a to-do, `> x` a quote (each typed into an empty paragraph,
2026-10-26).

## Stack

AFFiNE's web app (React, its own framework of services) around BlockSuite: a document is a store of
blocks (`Store`, on a Yjs document), each a model with props (`affine:paragraph` with `type` `text`,
`h1` to `h6` or `quote`; `affine:list` with `type` `bulleted`, `numbered`, `todo` or `toggle`,
`checked`, `order`; `affine:code` with `language`) and a text (`Text`, over a `Y.Text`: deltas with
attributes, `bold`, `italic`, `strike`, `code`, `link`). Blocks are Lit elements in an `editor-host`;
the page's editor is one `contenteditable` (`affine-page-root`), each block's text an inline editor
inside it. A page is notes (`affine:note`, cards on the edgeless canvas, stacked in page mode) beside
the canvas's surface. The app puts its editor on `window.currentEditor` (`doc`: the store; `std`:
selection, commands, the view).

## Traffic

Pages and bundles (`prod.affineassets.com`) are cached as any site's. The app's GraphQL queries at
startup (`serverConfig`, `oauthProviders`) answer the same for any visitor: [`proxy.ts`](proxy.ts)
caches them by their body. AFFiNE's telemetry (`/api/telemetry/collect`) and Cloudflare's bot check
(`/cdn-cgi/challenge-platform/…`, a POST to a URL of its own each load) are answered there and sent
nowhere, and Cloudflare's analytics beacon is a blocked host. With a warm cache, a run reaches no
server.

## Setting up and reading a test

- **The doc**: a new browser's first visit makes the demo workspace and opens "Getting Started"; a
  later one opens the workspace's list of docs, and the driver follows its link to "Getting Started"
  (its id is the workspace's own). Each test's blocks replace the doc's: every note but the first
  deleted, the first note's blocks deleted, the test's added (`doc.addBlock`, nested), then the history
  emptied (`doc.resetHistory()`), so that undo stops where the test starts.
- **The caret**: the page's editor (`affine-page-root`) takes the focus, then the block's inline editor
  sets the range (`inlineEditor.setInlineRange`), which BlockSuite turns into its text selection; a
  backward one is that selection again, `reverse`, through `std.selection`.
- **Reading**: the first note's blocks, each block's text as the spec's canonical form has it (`[ ] `,
  `## `, `> `, a fence), its formatting as Markdown (`runsAsMarkdown`); the caret from BlockSuite's
  text selection (`std.selection.value`: `from`, `to`, `reverse`), only while the page's editor has the
  focus; blocks selected whole from its block selections.
- **Free form**: what a free block owns in ourus's outline (a heading its section, a paragraph the list
  after it) is beside it in AFFiNE, as in Markdown (`liftOwned`); read back, what any block holds (Tab
  nests a paragraph under a paragraph) is beside it, as its Markdown reads, then owned as `listParent`
  says (`asMarkdownReads`), as for BlockNote.
- **Atoms**: a code block is a block of its own (its fences no text: `markup-fence`). AFFiNE's tables,
  LaTeX and dividers are blocks of their own with no text, which the driver doesn't make: those cases,
  and Markdown's other atoms, are skipped.

## What AFFiNE does that a driver has to know

- **Up from the first block goes into the doc's title**, whose inline editor is outside the page's
  editor; BlockSuite's selection stays as it was, so the driver reads no caret there.
- **Tab on a heading nests it, its level kept** (Indent12, Indent16): ourus makes it a level deeper.
  On a paragraph after a paragraph it nests the paragraph, which Markdown reads beside it (Indent18,
  where ourus makes it an item).
- **A revisit opens the list of docs**, not the doc last open.
- **Backspace at a list item's text start makes it a paragraph** where it is, rather than joining it
  to the block before (Backspace1, Backspace3, Backspace8); at the doc's first block, the text goes
  into the doc's title (Backspace26).
- **A move stays among the block's siblings** (MoveDown7, MoveDown9: past its parent's last child it
  stays), and **a heading moves alone**, its section staying (MoveDown4, MoveDown16): a heading is a
  block, not a container.
- **A numbered item keeps its number through a move**: each item draws its own `order`, which a move
  leaves as it was (`2.` above `1.` after moving the first down: MoveDown22); the driver reads the
  number drawn.

## Where AFFiNE behaves as an option of ourus's

Measured with `--ignore-options` (2026-10-26), each value agreeing in its cases where ourus's default
didn't (the driver's `behaves`):

| option | AFFiNE | cases |
| --- | --- | --- |
| `listParent` | `container`: a list after a paragraph is no block's | Lists6, Lists8b, Lists10, Lists12 to Lists15 |
| `listMoves` | `item`: a move passes one block, an item included | Lists13 to Lists15 |
| `enterOnEmptyItem` | `unwrap`: a paragraph where the item was | Enter7c, Enter21b (Enter7 disagrees) |
| `enterAtTextStart` | `stay`: the caret stays with the text | Enter26b, Enter29b (Enter26, Enter29 differ only by the caret) |
| `taskEditing` | `unwrap`: Backspace after the checkbox makes a paragraph | TaskBackspace3b |
| `headingEditing` | `block`: the level is the block's, kept through a join | Delete13b, Delete13d, Delete13f |
| `pasteSeams` | `open`: the first pasted line joins the text before the caret, the last the text after | Paste4b, Paste21, Paste24b, Paste26b, PasteList22, PasteList23 |

Left at ourus's default: `outdent` (logical: none of 8), `joinWithChildren` (refuse: none of 3),
`enterSplitSpace` (start: 5 of 15), `quotes` (each value about a fifth), `pastePlainLines` and
`pasteLines` (items: none).
