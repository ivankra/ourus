---
type: App
url: https://workflowy.com
repo: null
overview: Infinite bullet outliner; zoom into any node, mirrors
doc_model: outline
outliner: full
parent_child: structural
format: cloud (OPML export)
storage: cloud
tech: React + MobX, jQuery over contenteditable, Django backend; web, Capacitor, Electron
editor: own
shell: web
pricing: Freemium
license: null
why: Defined zoom-into-bullet; mirrors
last_release: null
last_release_date: null
last_commit: null
checked: 2026-10-10
sources: [https://workflowy.com]
---

# Workflowy

## How it's built

Read from the minified bundles of web client v4.3.2610082012 (no source maps). A local-only copy
runs from [`demo/workflowy`](../../demo/workflowy/README.md); the full analysis is in
[`demo/workflowy/workflowy.md`](../../demo/workflowy/workflowy.md).

- **Build:** esbuild, minified, Sentry debug IDs; several entry bundles (`wire`, `wf-runtime`,
  `wf-base`, …) plus search and tagging web workers. ~5.3 MB JS at startup, of which WorkFlowy's own
  code is roughly 1.7–2.6 MB raw. Probably TypeScript.
- **UI:** React 18.3 (classic `React.createElement`), MobX + mobx-react-lite, Tailwind plus per-theme
  CSS variables (17 themes), Font Awesome Pro, tippy.js.
- **Other libraries:** immer (item metadata synced as immer patches), moment, chrono-node
  (natural-language dates), zod, lodash, localforage, pdf.js.
- **Modules:** a home-grown module system (`wire.js`) on a global `WF` namespace; ~109 modules in four
  layers (`std-*`, `any-dom-host-*` platform adapters, `app-*` logic, `gui-*` views), coordinating via
  `window` CustomEvents and a middleware pipe.
- **Native shells:** the same bundle runs in Capacitor (iOS/Android) and Electron, detected by user
  agent and hostname.

### Data and sync

- **Flat item list** built into a tree on the client: `id`, `nm` (name), `no` (note), `prnt` (parent),
  `pr` (sort order), timestamps, free-form `metadata` (calendar, mirrors, layout, …).
- **Operation-based sync:** edits apply locally and queue as operations (`edit`, `create`, `move`,
  `complete`, `delete`, … each with undo data, which powers undo). `POST /push_and_poll` sends them
  with the last seen transaction ID and gets back other clients' operations to replay. A WebSocket
  only signals "poll now".
- **Backend:** most likely Python/Django behind nginx (`sessionid` cookie, Django-style URLs and
  hashed static files).

### Editor

- jQuery 3.7 over hand-managed `contenteditable` per item, not a rich-text framework.
