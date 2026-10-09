---
type: Plugin
url: https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one
repo: https://github.com/yzhang-gh/vscode-markdown
host: vscode
overview: Shortcuts, list editing, table of contents and table formatting for Markdown
license: MIT
why: 'The baseline Markdown editing experience in VS Code: list continuation and indent, no structural model'
stars: 3298
last_release: 3.6.3
last_release_date: 2025-03-09
last_commit: 2026-06-13
checked: 2026-10-14
sources: [https://github.com/yzhang-gh/vscode-markdown, 'https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one']
---

# Markdown All in One (VS Code)

## How it behaves

Measured in VSCodium 1.140.06880 (VS Code 1.140.0's source) with 3.6.2, the latest on Open VSX
(Microsoft's Marketplace has 3.6.3, 2025-03, whose changes don't touch list editing), replaying
ourus's behavior spec. Its keys are VS Code keybindings bound to its own commands, run in the
extension host; a list item is a line matched by `^\s*([-+*]|[0-9]+[.)]) +(\[[ x]\] +)?`.

- **Enter** continues a list item (a task's unchecked, a number the next); on an empty item the
  marker goes, ending the list. **Shift+Enter** is VS Code's own Enter, a new line at the line's
  indentation.
- **Tab** indents an item only with the caret in or right after its marker, or with a selection;
  anywhere else it is VS Code's Tab, which pads the line to the next tab stop (`- b|` gives `- b |`).
  **Shift+Tab** outdents from anywhere in the item. Neither sees an item behind `> `.
- **Backspace** right after a marker removes it and keeps the line's indent, so the text becomes a
  continuation line of the item above; across a line break, Backspace and Delete join the lines as
  they are, marker and all.
- **Alt+Up and Down** are VS Code's line moves, then a numbered list's numbers fixed: an item's
  children stay where they were.
- **Paste** puts the text in as it is. Home goes to a line's first non-blank character, the marker.

Of the 397 examples run, 84 agree with ourus; bare VS Code, no extension, 65, the same verdict in
371 of them: the extension adds list continuation and Tab at an item's start, and no structure.

