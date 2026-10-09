---
type: App
url: https://github.com/marktext/marktext
repo: https://github.com/marktext/marktext
flathub: https://flathub.org/apps/com.github.marktext.marktext
flathub_arch: x86_64
overview: Typora-style live-render Markdown editor
doc_model: freeform
outliner: none
parent_child: none
markdown_flavor: gfm
wikilinks: false
format: '`.md`'
storage: md-files
tech: Electron, Muya engine
editor: muya
shell: electron
pricing: Free
license: MIT
why: Open-source Typora; Muya engine
stars: 62311
last_release: v0.21.2
last_release_date: 2026-10-11
last_commit: 2026-10-09
checked: 2026-10-14
sources: [https://github.com/marktext/marktext]
---

# MarkText

## How it's built

A pnpm monorepo (v0.21.2): `packages/desktop`, the app (Electron 42, Vue 3 with Pinia and Element
Plus, built by electron-vite, packaged by electron-builder), and `packages/muya`, its editor engine
(Muya v2 in TypeScript, moved in from `marktext/muya`, archived since). Native modules `ced`
(encoding detection), `keytar` and `native-keymap`. Its Linux releases are x64 only; on arm64 it
builds from source (with `libsecret-1-dev`, `libx11-dev` and `libxkbfile-dev` for the native modules).

- **Muya** renders the document as blocks of DOM (snabbdom), each block's node carrying its block
  (`__MUYA_BLOCK__`, whose `muya` is the instance); its API has `setContent(markdown)`,
  `getMarkdown()`, `clearHistory()`, and the caret as a line and column of the Markdown both ways
  (`setCursorByOffset`, `getCursorOffset`), found by serializing with sentinel strings at the
  selection.
- **It writes its own Markdown**: what is saved is Muya's serialization of its blocks, not the file
  as opened. Of ourus's spec's 317 distinct starting buffers, 133 come back otherwise (a blank line
  between blocks, in 76; tabs as spaces; runs of blank lines collapsed; a child put at its parent's
  content column; a heading's closing `#`s dropped).
- **Lists** (defaults: `-` bullets, `preferLooseListItem: true`, auto-pairing on): Tab nests at the
  parent's content column, Enter continues a list, a number or a task; Shift+Enter is a soft line
  break, keeping the space at it; Backspace at an item's start makes it a paragraph of the item
  above. "Duplicate" and "Delete paragraph" act on the outermost block at the caret, the whole list,
  and nothing moves an item.

Not run side by side in full: a Markdown document editor, not an outliner.

