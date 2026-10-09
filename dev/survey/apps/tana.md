---
type: App
url: https://tana.inc
repo: null
overview: Outliner with supertags (typed nodes) and live queries
doc_model: outline
outliner: full
parent_child: indexed
format: Loro CRDT docs, cloud graph
storage: crdt + cloud
tech: TS, React 19 + Radix, TipTap/ProseMirror on Loro, Connect-RPC sync; web app, cross-platform
editor: tiptap
shell: web
pricing: Freemium
license: null
why: Supertags = schema on nodes; live queries
last_release: null
last_release_date: null
last_commit: null
checked: 2026-10-10
sources: [https://tana.inc, https://home.tana.inc]
---

# Tana

## How it's built

Read from the shipped bundles of web 2026.41.348 (minified, no source maps) and the decoded network
traffic.

- **Build:** Vite with the Rolldown bundler; ~225 route-shared chunks; Sentry debug IDs. Probably
  TypeScript (zod and protobuf-es types throughout).
- **UI:** React 19.2 with Radix UI Themes and CSS modules; cmdk, tldraw, mermaid, emojibase.
- **Data:** local-first. Every document (org, profile, inbox, text doc, live query) is a **Loro CRDT**
  document (WASM) persisted in the browser.
- **Sync:** Connect-RPC with protobuf-es v2 (`tana.sync.v1alpha1.SyncService`): a server stream plus
  unary commands carrying Loro updates and version vectors.
- **Live queries** (sidebar lists, `@` suggestions, backlinks) are themselves CRDT documents: the
  client writes the query, the server evaluates it and writes the result back into the same doc.
- **Other services:** WorkOS auth, PostHog, Sentry, LiveKit/Daily/Krisp for meetings.

### Editor

- **TipTap 3 on ProseMirror**, bound to **Loro rather than Yjs**: Tana's own `loro` extension (built on
  `@tiptap/extension-collaboration`) mirrors the ProseMirror tree into the doc's `content` map as
  `nodeName` / `attributes` / `children`. Unknown node types render as an `unsupportedBlock` that keeps
  the original data.
- **Markdown at the edges:** TipTap 3's markdown API (`parseMarkdown` / `renderMarkdown` per
  extension, on top of `marked`) most likely handles paste, AI edits and export. Typing shortcuts
  (`## `, `- `, `[] `) are presumably ProseMirror input rules.
- **Own extensions:** `blockId` (stable ID per block), `blockMove`, `commandMenu` (`/`), `mention`
  (`@` links), `unifiedListKeymap` + `checkableListItemParser` (one list model for bullets, numbers and
  checkboxes), `comments`, `diffDecoration`/`titleDiff` (showing AI/remote changes), `embed`, media.
  Bundled: tables, KaTeX math, lowlight code blocks, drag handle.
- The document and the "Ask or change this document…" chat box are separate TipTap instances.

### Editing, measured

ourus's behavior spec replayed in its document editor (web 2026.41.348): 116 of the 290 examples run
agree, its verdicts most like WorkFlowy's (the same in 71%).

- **Keys of its list keymap** (`unifiedListKeymap`): Shift+Enter makes an empty item after the item
  (after its children; a task's an unchecked task), Ctrl+Shift+Enter one before it, Mod+Up and Down
  collapse and expand; no key makes a line break inside an item (Shift+Enter does, in a paragraph).
- **Moves** (`blockMove`, Ctrl+Shift+Up and Down) stay within a list, and a heading moves alone, not
  with its section; the caret goes to the moved item's start.
- **Enter** at an item's start puts an empty item above, the caret staying with the text; Backspace
  at an item's start joins it to the block before with a space; Delete at an item's end takes the
  next item in as a second paragraph.
- **Pasted text** goes in as ProseMirror's default for `text/plain`, each line a paragraph of the
  item; **undo** is Loro's, merging keys pressed close together.

