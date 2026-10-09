---
type: App
url: https://dynalist.io
repo: null
overview: Workflowy-style outliner with documents and dates
doc_model: outline
outliner: full
parent_child: structural
markdown_flavor: 'dynalist (own dialect: `**`/`__`/`~~`/`==`, links, tags, `$$` math, fenced code)'
format: cloud (OPML export)
storage: cloud
tech: TypeScript → ES5 + jQuery, no UI framework; web app, cross-platform
editor: own
shell: web
pricing: Freemium
license: null
why: Workflowy + docs, dates, formatting
last_release: null
last_release_date: null
last_commit: null
checked: 2026-10-10
sources: [https://dynalist.io, https://dynalist.io/demo]
---

# Dynalist

## How it's built

Read from the shipped bundles of the public demo (build 20260830132109; minified, no source maps). A
local-only copy runs from [`demo/dynalist`](../../demo/dynalist/README.md).

- **Build:** TypeScript compiled to ES5 and minified into IIFE bundles: `jquery.min.js`, `ext.min.js`
  (third-party libraries) and `main.min.js` (the app, 0.8 MB).
- **UI:** no framework. Server-rendered HTML plus jQuery-style DOM manipulation; classes with
  snake_case methods and small home-grown helpers.
- **Libraries:** jQuery 3.1.1, moment, bootstrap-datepicker, CryptoJS, localforage (offline storage),
  lz-string (compressed API requests); KaTeX and highlight.js load lazily.
- **Server API:** JSON over `jQuery.ajax` (`/api/file/load`, `/api/doc/load`), batched through
  `/api/bundle_binary` as lz-string-compressed sub-requests.

### Editor

- **Edit raw, show rendered.** Each item holds raw markdown text. Clicking it swaps the rendered HTML
  for a plain-text `contenteditable`; ~200 `keydown` handlers, no rich-text model, no `execCommand`.
- **Hand-written parser.** A tokenizer feeds a context-stack parser with matchers registered per
  trigger character (`` ` ``, `[`, `![`, `#`, `@`, `\`, newline). Node types: `link`, `image`, `url`,
  `tag`, `time`, `inlinecode`, `multilinecode`. The tree is cached per item and rendered to HTML when
  the item isn't being edited.
- **Inline formatting** (`**`, `__`, `~~`, `==`) is applied in the rendering pass; regex converters to
  and from HTML handle copy/paste. `$$…$$` renders with KaTeX, fenced code with highlight.js, and `!`
  opens a date picker that inserts `time` nodes.
