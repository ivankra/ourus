# Lexical

[`driver.ts`](driver.ts) drives [Lexical](https://lexical.dev/), Meta's editor framework (MIT,
`facebook/lexical`): not an app but the editor under many (Meta's own among them), driven in its
playground, https://playground.lexical.dev/, the framework's demo of a full rich-text editor
(headings, quotes, lists and to-dos, code, tables, and more). Opened empty and without the debug
view below the editor (`?emptyEditor=true&showTreeView=false`, the playground's settings in its URL);
no collaboration, nothing saved. Lexical 0.52.0+dev on 2026-10-26 (the playground is built from
Lexical's main branch): `LexicalEditor.version`, which `open` reads.

The spec's buffers are projected onto blocks (the `block` model, [`../lib/block.ts`](../lib/block.ts))
in free form (`freeForm`): a paragraph, a heading, a quote or code is a block outside every list (`¶`
in the drawings), as Lexical's own are, a list item an item.

## Keys (Linux)

From the playground's shortcut table (`SHORTCUT_BINDINGS` and `BUILTIN_SHORTCUT_BINDINGS` in its
bundle, `src/plugins/ShortcutsExtension/shortcuts.ts`), Lexical's rich-text and list handling, and
pressing them in the playground:

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | Shift+Enter (a line break in the block) |
| `indent` | Ctrl+] ("Indent": a list item under the one before; a paragraph or heading gets an indent, a padding) |
| `outdent` | Ctrl+[ ("Outdent") |
| `moveSubtreeUp`, `moveSubtreeDown` | *missing*: blocks are moved by dragging their handle; their examples are skipped |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, then Backspace (no command for it) |
| `deleteSubtree`, `duplicateSubtree` | *missing*: their examples are skipped |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Shift+Z (Ctrl+Y too) |
| `cursorDocStart`, `cursorDocEnd` | Ctrl+Home, Ctrl+End (the browser's, in one `contenteditable`) |

**Tab** indents only where the caret is at a line's start, or with a selection, and types a tab
character anywhere else (Lexical's `TabIndentationPlugin`, which the playground has); Shift+Tab
outdents. The driver plays Ctrl+] and Ctrl+[, the playground's own "Indent" and "Outdent", which
indent from anywhere: Tab would measure where it types a tab rather than how Lexical indents.

Playwright's `Control+Shift+z` sends the key `z` with Shift, which the shortcut table's
`{ key: "z", shiftKey }` doesn't match (it reads the key Shift makes, `Z`): the driver presses
`Control+Shift+Z`, and so for `Control+Shift+V`.

Other shortcuts in the table:

| keys | what it does |
| --- | --- |
| Ctrl+Alt+0 | the block a paragraph |
| Ctrl+Alt+1 to 3 | a heading, H1 to H3 |
| Ctrl+Shift+7, 8, 9 | a numbered list, a bulleted one, a check list |
| Ctrl+Alt+C | the block code |
| Ctrl+Shift+C | inserts a code block |
| Ctrl+Shift+Q | a quote |
| Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+X | bold, italic, underline, strikethrough |
| Ctrl+, , Ctrl+. | subscript, superscript |
| Ctrl+K | a link |
| Ctrl+\ | clears the formatting |
| Ctrl+Shift+L, E, R, J | align left, center, right, justify |
| Ctrl+Shift+1, 2, 3 | lowercase, uppercase, capitalize |
| Ctrl+Shift+> , Ctrl+Shift+< | a larger, a smaller font |
| Ctrl+Alt+M | a comment |
| Ctrl+F | find and replace |

## Stack

Lexical: an editor state of nodes (`_nodeMap`, keyed, each with its parent, first child and next
sibling), changed in updates and reconciled to one `contenteditable`; its selection a range of two
points, each a node's key and an offset (in a text node's text, or among an element's children). Its
top level is blocks: paragraphs, headings (`tag` `h1` to `h6`), quotes, code (`language`, its text
highlighted in `code-highlight` nodes), lists (`listType` `bullet`, `number` or `check`, `start`) of
list items (`value`, `checked`). A nested list is held by an item of its own after the item it is
under (`<li><ul>…</ul></li>`); a list item holds text alone, no block. Inline: text nodes (`format`
bits: 1 bold, 2 italic, 4 strikethrough, 8 underline, 16 code), line breaks, tabs, links. The
playground is React with Lexical's React bindings; its editor is on its root element
(`__lexicalEditor`).

## Traffic

A static site: pages and bundles cached as any site's. Vercel's analytics on it
(`/_vercel/insights/`, `/_vercel/speed-insights/`) are answered by [`proxy.ts`](proxy.ts), empty,
and sent nowhere. With a warm cache, a run reaches no server.

## Setting up and reading a test

- **Loading**: the test's blocks as a serialized editor state (`parseEditorState`, then
  `setEditorState`): free blocks at the top level, items in lists, a nested list in an item of its own,
  a block's lines apart by line breaks. Then the history is cleared, with the playground's
  `CLEAR_HISTORY_COMMAND`, found among the editor's registered commands by its name, so that undo
  stops where the test starts.
- **The caret**: a DOM selection in the block's element (`getElementByKey`), from anchor to head, a
  `<br>` one character, which Lexical takes as its own.
- **Reading**: the editor state's nodes from the root, each block's text as the spec's canonical form
  has it (`[ ] `, `2. `, `## `, `> `, a fence), its formatting as Markdown (`runsAsMarkdown`); the caret
  from the state's selection (a point in a text node, or before an element's child), while the editor
  has the focus, both ends in one block.
- **Free form**: what a free block owns in ourus's outline (a heading its section, a paragraph the list
  after it) is beside it in Lexical, as in Markdown (`liftOwned`), and owned again as it is read
  (`asMarkdownReads`).
- **What Lexical can't start from** (`holds`): a block inside a list item (an item holds text alone); a
  heading, code or a quote as an item; a nested list of more than one kind (a list is bullets, numbers
  or to-dos: at the top level, items of another kind are loaded as a list of their own after the
  first); numbers that don't count on; a caret in a marker that is a block's type.
- **Atoms**: a code block is a block of its own (its fences no text: `markup-fence`). Tables, equations
  and rules are nodes of their own, which the driver doesn't make: those cases, and Markdown's other
  atoms, are skipped.

## What Lexical does that a driver has to know

- **A paragraph's indent isn't read**: Ctrl+] on a paragraph or a heading gives
  it Lexical's `indent`, a padding, the block still a paragraph at the top level; Markdown has no form
  for it, so the read shows the block as it was (Indent29, Indent32).
- **An item indented with no item above it** (Indent10: Lexical indents the first item anyway) is a
  nested list in an item of its own, first in its list: read as an empty item holding the list, as its
  HTML reads (`<li><ul><li>a</li></ul></li>`).

## Where Lexical behaves as an option of ourus's

Measured with `--ignore-options` (2026-10-26), each value agreeing in its cases where ourus's default
didn't (the driver's `behaves`):

| option | Lexical | cases |
| --- | --- | --- |
| `listParent` | `container`: its top level a sequence of blocks and lists, a list after a paragraph no block's | (its model) |
| `enterAtTextStart` | `stay`: the caret stays with the text | Enter26b, Enter29b (Enter26, Enter29, Enter32 differ only by the caret) |
| `enterInQuote` | `split`: the rest a block of its own | QuoteText21, QuoteAtom4 |
| `headingEditing` | `block`: a heading is the block's type, kept through a join | Backspace18b, Backspace18f, Delete13b, Delete13d, Delete13f |
| `pastePlainLines` | `enter`: pasted plain lines as typed with Enter between them | PastePlain31, Quirk4 |

Left at ourus's default: `outdent` (logical: none of 8), `pasteSeams` (open: none of 7),
`enterSplitSpace` (start: 6 of 15), `quotes` (atom 2 of 5, text 2 of 10).
