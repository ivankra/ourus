---
type: App
url: https://outl.app
repo: https://github.com/outlmd/outl
overview: Markdown outliner, no block IDs in files
doc_model: outline
outliner: full
parent_child: structural
markdown_flavor: 'outl (own dialect, Logseq-style outline)'
format: '`.md` (block IDs in a sidecar), tree-CRDT P2P sync'
storage: md-files
tech: Rust + Tauri, SolidJS, TUI, iOS
editor: own
shell: tauri
pricing: Free
license: MIT
why: 'Closest to goal: outliner over plain `.md`, P2P sync, MCP'
stars: 198
last_release: v0.12.0-beta.216
last_release_date: 2026-10-10
last_commit: 2026-10-08
checked: 2026-10-14
sources: [https://github.com/outlmd/outl, https://github.com/outlmd/outl#readme]
unverified: [parent_child]
---

# outl

## How it behaves

Measured in its desktop app, v0.12.0-beta.216 (Tauri 2, its window WebKitGTK's on Linux; its Linux
releases are x86_64 only, so built from source on arm64), replaying ourus's behavior spec through
WebKitGTK's WebDriver (`WebKitWebDriver`, with `TAURI_WEBVIEW_AUTOMATION=true`).

- **Modal by default** (`[editor] vim_mode = true`): a block is edited in a textarea in Insert mode,
  its text a draft until committed (on Escape, or a structural key); a click on its text enters it.
- **Tab and Shift+Tab leave Insert**: they commit the draft, then indent or outdent, so the caret
  goes, though its shortcut docs say Tab stays in Insert.
- **A paste of several lines** puts its first line into the block (after a space) and the rest as
  new blocks, but the textarea keeps its old draft, which is committed over the first line once the
  block is left.
- **A page written into the workspace** with no sidecar is refused when outl next rewrites it
  ("refusing to rewrite…"), until `reload_workspace` adopts it; a block's text is trimmed at its
  edges and at its lines' ends.
- Of the examples run, 49 agree with ourus (165 skipped), a first run whose moves, Shift+Tab at depth
  and joins weren't yet checked against the driver.

