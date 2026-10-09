---
type: App
url: https://roamresearch.com
repo: null
overview: 'Networked notes: bidirectional links, block refs'
doc_model: outline
outliner: full
parent_child: indexed
markdown_flavor: 'roam (own dialect, Instaparse grammar)'
wikilinks: true
format: cloud graph (JSON/EDN export)
storage: cloud
tech: ClojureScript, Reagent/React, Datascript in the browser, Firebase sync; web app
editor: own
shell: web
pricing: Paid
license: null
why: Origin of block refs + bidirectional links
last_release: null
last_release_date: null
last_commit: null
checked: 2026-10-10
sources: [https://roamresearch.com, https://roamresearch.com/#/app/help]
---

# Roam Research

## How it's built

Read from the shipped bundles of web app 0.13.12 (minified, no source maps). A local-only copy of a
trimmed help graph runs from [`demo/roam`](../../demo/roam/README.md).

- **Build:** ClojureScript compiled with shadow-cljs (Google Closure advanced mode). Three entry
  bundles (`shared.js`, `main.js`, `route-app.js`, ~9 MB) plus ~20 lazy modules (`app-codemirror`,
  `app-katex`, `app-mermaid`, `app-excalidraw`, `app-ai`, `module-marked`, …).
- **UI:** React 18.2 through Reagent (hiccup), Blueprint 3, re-com, Tailwind for newer parts.
- **Data:** the whole graph is an in-memory **Datascript** (Datalog) database in the browser, loaded
  from a msgpack + Transit snapshot of its `eavt`/`aevt`/`avet` indexes.
- **Sync:** Firebase Realtime Database. Each change is a Datascript transaction appended to
  `/v10/dbs/<graph>/log`; clients replay log entries newer than their snapshot.
- **Search:** SQLite (WASM) in a web worker, with an index normally restored from cloud storage.
- **Other libraries:** KaTeX, Mermaid, Excalidraw, React Flow, pdf.js, SCI and Babel (user code in
  `roam/render` / `roam/js`), Firebase App Check.

### Editor

- **Edit raw, show rendered.** Each block is a plain markdown string (`:block/string`). Clicking swaps
  the rendered HTML for a `<textarea>`; leaving re-renders. No rich-text model and no
  `contenteditable` in the block editor.
- **Own dialect parsed with Instaparse** (a Clojure GLL parser-generator): `**bold**`, `__italic__`,
  `^^highlight^^`, `~~strike~~`, `` `code` ``, `[[page]]`, `#tag`, `((block-ref))`,
  `{{embed}}`/`{{components}}`, `attr::`, `$$…$$`.
- **Autocomplete:** `[[`, `((` and `#` open popups backed by Datascript queries; `/` opens the command
  menu. Text edits become Datascript transactions.
- **Code blocks** are the exception: embedded **CodeMirror 6** editors with a language picker. CSS
  blocks on `roam/css` apply live to the app. `marked` is a separate lazy module, likely for
  import/paste.
