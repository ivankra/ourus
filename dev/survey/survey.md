# Landscape

Survey of note-taking apps, editor components and plugins relevant to [parseq](../README.md). Each entry has a page under `survey/apps/`, `survey/components/` or `survey/plugins/`; its frontmatter holds the data shown in these tables. Release, commit, licence and star data come from GitHub (`sources`, `checked`); other fields are from project pages or general knowledge, and `unverified` lists fields known to be uncertain. Run `python3 survey/lint.py` to check all pages.

## Apps

Roughly ordered by popularity. **Format** = how notes are stored. **Development** = pricing · license · latest release (or staleness), from each page's frontmatter (checked 2026-10-09).

| App | Overview | Format | Tech | Development | Why investigate |
|-----|----------|--------|------|-------------|-----------------|
| [Apple Notes](https://support.apple.com/guide/notes/welcome/mac) | Built-in rich-text notes; folders, tags, checklists, scans | proprietary DB, cloud | Apple-only | Free | Capture-friction baseline |
| [Microsoft OneNote](https://onenote.com) | Freeform notebooks → sections → pages; ink | proprietary `.one`, cloud | cross-platform | Free | Free-form canvas + ink |
| [Google Keep](https://keep.google.com) | Sticky-note style quick capture, checklists, reminders | cloud | web + mobile | Free | Lowest-friction capture |
| [Notion](https://www.notion.com) | All-in-one workspace: block pages + relational databases | cloud blocks (MD/HTML export) | web app, cross-platform | Freemium | Databases, templates, team wiki, AI |
| [Evernote](https://evernote.com) | Classic notebooks + web clipper, OCR search | cloud (ENEX export) | cross-platform | Freemium | Incumbent; web clipper, OCR; lessons from decline |
| [Obsidian](https://obsidian.md) | Markdown knowledge base: backlinks, graph, canvas, plugins | `.md` (+ JSON Canvas) | Electron + CM6, mobile | Free, paid Sync / Publish | Main inspiration; plugin API, local-first standard |
| [Goodnotes](https://www.goodnotes.com) | Handwritten notes and PDF annotation | proprietary `.goodnotes`, cloud | iPad-first, cross-platform | Freemium | Handwriting reference |
| [Notability](https://www.notability.com) | Handwriting synced with audio recordings | proprietary `.note` | Apple-only | Freemium | Audio-synced notes |
| [Joplin](https://joplinapp.org) ([repo](https://github.com/laurent22/joplin)) | Evernote-style notebooks in Markdown, E2EE sync | SQLite DB, Markdown bodies (`.md` export) | Electron + CM6, React Native mobile | Free, paid Joplin Cloud · AGPL · v3.7.21, Sep 2026 | Self-hostable sync, E2EE, web clipper |
| [Logseq (DB version)](https://logseq.com) ([repo](https://github.com/logseq/logseq)) | Logseq rebuilt on a database graph, aimed at sync, collaboration and performance (beta) | SQLite database graph; Markdown graphs come in through an import tool | ClojureScript, Electron, mobile | Free · AGPL-3.0 · 2.0.2, Oct 2026 | Where the Logseq team went after Markdown-as-database: DB-first for scale, reliable sync, real-time collaboration and data integrity; now the main Logseq |
| [Logseq OG](https://github.com/logseq/og) | Logseq OG: file-based block outliner with daily journals, block refs, queries (maintenance only) | `.md`/`.org` files | ClojureScript, Electron, mobile | Free · AGPL-3.0 · 1.0.0, Apr 2026 | Main inspiration: block refs, journals, queries over plain files. Split off in April 2026 as the maintenance-only file edition (security and Electron updates, no new features): the team's verdict on Markdown-as-database |
| [Bear](https://bear.app) | Minimal Markdown notes organised by nested tags | SQLite DB, Markdown bodies | Apple-only | Freemium | Polish; nested tags instead of folders |
| [SiYuan](https://b3log.org/siyuan/en/) ([repo](https://github.com/siyuan-note/siyuan)) | Block-based PKM; block refs, SQL queries | own JSON (`.sy`) | Go kernel + TS (Protyle editor), Electron, mobile, Docker | Free, paid sync · AGPL · v3.8.7-alpha.6, Oct 2026 | Block refs + SQL over blocks |
| [Outline](https://www.getoutline.com) ([repo](https://github.com/outline/outline)) | Team knowledge base, realtime collab | Postgres DB, Markdown import/export | React + ProseMirror, self-hosted web | Paid cloud, free self-host · BSL 1.1 · v1.10.1, Sep 2026 | Popular Markdown-flavoured team KB on ProseMirror; ~30k stars |
| [AppFlowy](https://appflowy.com) ([repo](https://github.com/AppFlowy-IO/AppFlowy)) | Notion-style docs, databases, kanban | CRDT docs in local DB | Flutter + Rust, desktop + mobile | Free, paid cloud · AGPL · 0.14.8, Oct 2026 | Notion clone on a non-web stack |
| [AFFiNE](https://affine.pro) ([repo](https://github.com/toeverything/AFFiNE)) | Docs, whiteboard and databases on one surface | Yjs CRDT docs in SQLite | TS, BlockSuite (Lit), Electron, web, mobile | Freemium · MIT/EE · v2026.10.9-canary.912, Oct 2026 | Docs ↔ canvas on one CRDT model |
| [Simplenote](https://simplenote.com) ([repo](https://github.com/Automattic/simplenote-electron)) | Plain-text / Markdown notes, tags, instant sync | cloud (Simperium sync) | Electron + React desktop, native mobile | Free · GPL-2.0, clients · v2.27.1, Jul 2026 | Plain-text simplicity at scale; OSS clients (Automattic) |
| [Standard Notes](https://standardnotes.com) ([repo](https://github.com/standardnotes/app)) | Minimal end-to-end encrypted notes | encrypted JSON items, cloud | TS web app in Electron, React Native mobile | Freemium · AGPL · 3.202.9, Oct 2026 | Security-first, data durability |
| [Typora](https://typora.io) | WYSIWYG Markdown editor | `.md` | Electron, own live-render engine | Paid once | Benchmark for inline Markdown rendering |
| [Anytype](https://anytype.io) ([repo](https://github.com/anyproto/anytype-ts)) | Typed objects + relations, Notion-like, private | own object store (CRDT, protobuf), P2P sync | Electron + Go middleware, mobile | Freemium · source-available · v0.57.4, Oct 2026 | Typed objects + local-first + E2EE |
| [Trilium (TriliumNext)](https://github.com/TriliumNext/Trilium) | Hierarchical wiki for very large note trees; cloning, scripting | SQLite DB, HTML bodies | Electron, CKEditor 5 + CodeMirror, self-hosted web | Free · AGPL · v0.106.0, Sep 2026 | Scales to huge trees; cloning, scripting, attributes |
| [Khoj](https://khoj.dev) ([repo](https://github.com/khoj-ai/khoj)) | Self-hosted AI search/chat over your notes and docs | indexes files; Postgres + pgvector | Python, web, Obsidian/Emacs plugins | Free, paid cloud · AGPL · 2.0.0-beta.28, Mar 2026 | AI search over Obsidian vaults and docs |
| [Docmost](https://docmost.com) ([repo](https://github.com/docmost/docmost)) | Collaborative wiki / docs | Postgres DB | Tiptap + Yjs, self-hosted web | Free, paid cloud · AGPL · v0.96.0, Sep 2026 | OSS Confluence/Notion; Tiptap + Yjs collab |
| [Memos](https://usememos.com) ([repo](https://github.com/usememos/memos)) | Tweet-style timeline of short notes | SQLite/MySQL/Postgres, Markdown bodies | Go + React, self-hosted web | Free · MIT · 26.10-rc.1, Oct 2026 | Minimal capture, trivial self-host |
| [Workflowy](https://workflowy.com) | Infinite bullet outliner; zoom into any node, mirrors | cloud (OPML export) | React + MobX, jQuery over contenteditable, Django backend; web, Capacitor, Electron | Freemium | Defined zoom-into-bullet; mirrors |
| [Craft](https://craft.do) | Nested card/page documents | cloud blocks | Apple-first, web, Windows | Freemium | Document polish, card nesting, sharing |
| [Roam Research](https://roamresearch.com) | Networked notes: bidirectional links, block refs | cloud graph (JSON/EDN export) | ClojureScript, Reagent/React, Datascript in the browser, Firebase sync; web app | Paid | Origin of block refs + bidirectional links |
| [RemNote](https://www.remnote.com) | Outliner with built-in spaced-repetition flashcards | cloud | web app, cross-platform | Freemium | Notes → flashcards |
| [iA Writer](https://ia.net/writer) | Focused Markdown writing, typography first | `.md` / plain text | cross-platform | Paid | Typography, focus mode |
| [TiddlyWiki](https://tiddlywiki.com) ([repo](https://github.com/TiddlyWiki/TiddlyWiki5)) | Non-linear wiki of small "tiddlers" with transclusion and filters | single HTML file or `.tid` | JS, any browser, Node.js | Free · BSD-3-Clause · v5.4.1, Jul 2026 | Transclusion, filters; 20 years of design |
| [Zettlr](https://zettlr.com) ([repo](https://github.com/Zettlr/Zettlr)) | Academic writing and Zettelkasten with citations | `.md` | Electron + CM6, Pandoc | Free · GPL · v4.8.0, Sep 2026 | Citations (Zotero/CSL), Pandoc export |
| [Capacities](https://capacities.io) | Notes as typed objects (people, books, meetings) | cloud objects | web app, cross-platform | Freemium | Typed objects instead of folders |
| [Tana](https://tana.inc) | Outliner with supertags (typed nodes) and live queries | Loro CRDT docs, cloud graph | TS, React 19 + Radix, TipTap/ProseMirror on Loro, Connect-RPC sync; web app, cross-platform | Freemium | Supertags = schema on nodes; live queries |
| [Heptabase](https://heptabase.com) | Cards arranged on whiteboards for research | cloud cards (MD export) | desktop + mobile | Paid | Spatial research workflow |
| [Org-mode](https://orgmode.org) ([repo](https://git.savannah.gnu.org/cgit/emacs/org-mode.git)) | Plain-text outliner, tasks, agenda | `.org` | Emacs Lisp, Emacs | Free · GPL | Outline command set over plain text; unambiguous depth |
| [MarkText](https://github.com/marktext/marktext) | Typora-style live-render Markdown editor | `.md` | Electron, Muya engine | Free · MIT · v0.21.1, Oct 2026 | Open-source Typora; Muya engine |
| [Foam](https://foam.md) ([repo](https://github.com/foambubble/foam)) | Wiki links and graph for Markdown inside VS Code | `.md` | VS Code extension | Free · MIT · 0.46.0, Sep 2026 | PKM as an editor extension; ~17k stars |
| [NoteGen](https://github.com/codexu/note-gen) | Capture first, organise later: AI turns scattered records into notes | `.md` | Tauri + Next.js + React, Tiptap + CodeMirror; sync via GitHub/Gitee/WebDAV/S3 | Free · GPL-3.0 · note-gen-v0.38.2, Oct 2026 | Biggest new local-first Markdown + AI app; ~13k stars |
| [Notesnook](https://notesnook.com) ([repo](https://github.com/streetwriters/notesnook)) | Private everyday notes, E2EE | encrypted SQLite DB, cloud sync | TS, Tiptap, Electron, React Native mobile | Freemium · GPL · 3.4.14-android, Oct 2026 | OSS E2EE, self-hostable sync |
| [Rnote](https://rnote.flxzt.net) ([repo](https://github.com/flxzt/rnote)) | Handwriting and sketching | own `.rnote` | Rust + GTK | Free · GPL-3.0 · v0.14.2, May 2026 | OSS handwriting/sketching, Rust |
| [Saber](https://saber.adil.hanney.org) ([repo](https://github.com/saber-notes/saber)) | Handwriting notes | own `.sbn2` | Flutter, cross-platform | Free · GPL-3.0 · v1.36.1, Aug 2026 | OSS handwriting, cross-platform |
| [Xournal++](https://xournalpp.github.io) ([repo](https://github.com/xournalpp/xournalpp)) | Handwriting and PDF annotation | own `.xopp` (gzipped XML) | C++ / GTK | Free · GPL · v1.3.8, Sep 2026 | Stylus + PDF markup |
| [SilverBullet](https://silverbullet.md) ([repo](https://github.com/silverbulletmd/silverbullet)) | Programmable Markdown wiki: queries + Lua scripting | `.md` | TS client on CM6, Rust server, web / PWA | Free · MIT · 2.12.0, Oct 2026 | Queries + scripting over plain `.md`; ~6k stars |
| [MiaoYan](https://github.com/tw93/MiaoYan) | Quiet, distraction-free Markdown writing app | `.md` | Swift, macOS-only | Free · MIT · V4.5.0, Sep 2026 | Native minimal Markdown writing; ~9k stars |
| [FSNotes](https://fsnot.es) ([repo](https://github.com/glushchenko/fsnotes)) | Fast Markdown notes | `.md` / plain text | Swift, Apple-only | Free on Mac, paid iOS · MIT · v7.3.6, Oct 2026 | Native speed over plain files; ~7.5k stars |
| [obsidian.nvim](https://github.com/obsidian-nvim/obsidian.nvim) | Obsidian vault workflows inside Neovim | `.md` (Obsidian vault) | Lua, Neovim | Free · Apache-2.0 · v3.16.8, Sep 2026 | Vault format as editor-independent contract |
| [QOwnNotes](https://www.qownnotes.org) ([repo](https://github.com/pbek/QOwnNotes)) | Markdown notes with Nextcloud integration | `.md` | C++ / Qt | Free · GPL-2.0 · v26.10.3, Oct 2026 | Scripting, Nextcloud |
| [Reflect](https://reflect.app) | Daily notes, backlinks, AI, calendar | E2EE cloud | web, desktop, iOS | Paid | Calendar-linked daily notes + AI |
| [Mem](https://mem.ai) | AI-first notes that organise themselves | cloud | web app, cross-platform | Freemium | AI retrieval instead of organising |
| [Dynalist](https://dynalist.io) | Workflowy-style outliner with documents and dates | cloud (OPML export) | TypeScript → ES5 + jQuery, no UI framework; web app, cross-platform | Freemium | Workflowy + docs, dates, formatting |
| [NotePlan](https://noteplan.co) | Daily notes + tasks + calendar in Markdown | `.md` / `.txt` | Apple-only | Paid | Markdown planner + calendar |
| [Amplenote](https://www.amplenote.com) | Notes with scored tasks and scheduling | cloud | web app, cross-platform | Freemium | Task scoring inside notes |
| [Dendron](https://www.dendron.so) ([repo](https://github.com/dendronhq/dendron)) | Hierarchical notes (dot-separated names) in VS Code | `.md` + YAML schemas | VS Code extension | Free · Apache-2.0 · stale since Jun 2025 | Hierarchies + schemas; why it stopped |
| [HedgeDoc](https://hedgedoc.org) ([repo](https://github.com/hedgedoc/hedgedoc)) | Real-time collaborative Markdown | DB, Markdown bodies | Node + CodeMirror, self-hosted web | Free · AGPL · 1.12.0, Aug 2026 | Real-time collab Markdown on CodeMirror |
| [flatnotes](https://github.com/dullage/flatnotes) | Self-hosted notes over a flat folder | `.md` files, no database | Python + Vue, Toast UI Editor, self-hosted web | Free · MIT · v5.5.5, Aug 2026 | Files-only, no database; ~3k stars |
| [Alexandrie](https://github.com/Smaug6739/Alexandrie) | Offline-first Notion/Obsidian/Confluence alternative for teams | server DB, Markdown bodies (unverified) | Nuxt / Vue + CM6, self-hosted | Free · MIT · v8.14.2, Sep 2026 | Advanced Markdown + teams/SSO on CM6; ~3k stars |
| [Org-roam](https://www.orgroam.com) ([repo](https://github.com/org-roam/org-roam)) | Roam-style backlinks for Org files | `.org` + SQLite index | Emacs Lisp, Emacs | Free · GPL · v2.3.1, Jun 2025 | Backlinks via SQLite index over files |
| [zk](https://zk-org.github.io/zk/) ([repo](https://github.com/zk-org/zk)) | Notes CLI + language server over a Markdown folder | `.md` + SQLite index | Go CLI + LSP | Free · GPL-3.0 · v0.15.6, Jul 2026 | Index/links independent of editor |
| [nb](https://xwmx.github.io/nb/) ([repo](https://github.com/xwmx/nb)) | CLI + local web notes, bookmarks, todos with links, tags, search | `.md` / any text files, in git | Bash CLI + local web UI | Free · AGPL-3.0 · 7.25.5, Aug 2026 | Which operations belong in the workspace layer, not the editor |
| [Emanote](https://emanote.srid.ca) ([repo](https://github.com/srid/emanote)) | Turns a folder of notes into a structured website | `.md` / `.org` files | Haskell + Pandoc, static site / live server | Free · AGPL-3.0 · active Jun 2026 | Link resolution and publishing outside the editor; compare with Quartz |
| [Markor](https://github.com/gsantner/markor) | Markdown, todo.txt and plain-text editor | `.md`, todo.txt, plain text | Android-only | Free · Apache-2.0 · v2.16.1, Mar 2026 | Mobile plain-file editing; pairs with Syncthing |
| [GitJournal](https://gitjournal.io) ([repo](https://github.com/GitJournal/GitJournal)) | Mobile Markdown notes stored in a git repo you choose | `.md` + optional YAML frontmatter, in git | Flutter, mobile (+ desktop) | Freemium · AGPL-3.0 · v1.80.0, Sep 2021 | Mobile capture + git sync over plain files |
| [Notes (nuttyartist)](https://www.get-notes.com) ([repo](https://github.com/nuttyartist/notes)) | Fast, simple notes with Markdown and kanban | local DB (format unverified) | C++ / Qt | Free · MPL-2.0 · v2.3.1, Oct 2024 | Native C++ speed and polish; ~4k stars |
| [Inkdrop](https://www.inkdrop.app) | Markdown notes for developers, plugin API | PouchDB/CouchDB JSON docs, Markdown bodies | Electron + CM6, mobile | Paid | Closest commercial match: CM6 + plugin API |
| [Leo Editor](https://leo-editor.github.io/leo-editor/) ([repo](https://github.com/leo-editor/leo-editor)) | Outline-oriented editor with clones and scripting | `.leo` XML outlines + external files | Python / Qt | Free · MIT · v6.8.10, Aug 2026 | Clones + outlines mapped to files; decades of outliner ideas |
| [Zim Desktop Wiki](https://zim-wiki.org) ([repo](https://github.com/zim-desktop-wiki/zim-desktop-wiki)) | Desktop wiki over plain-text files | own wiki-syntax text | Python / GTK | Free · GPL-2.0 · 0.77.2, Jul 2026 | Long-lived plain-text wiki, plugins |
| [Athens Research](https://github.com/athensresearch/athens) | Open-source Roam clone | DataScript DB (EDN) | ClojureScript, Electron | Free · EPL-1.0 · stale since Dec 2022 | Why a Roam clone died |
| [MindForger](https://www.mindforger.com) ([repo](https://github.com/dvorka/mindforger)) | Thinking notebook with note associations | `.md` | C++ / Qt | Free · GPL-2.0 · 2.5.0, Sep 2026 | Auto-associations between Markdown notes |
| [VNote](https://github.com/vnotex/vnote) | Markdown notes with live preview | `.md` | C++ / Qt | Free · LGPL-3.0 · v4.9.0, Oct 2026 | Qt live preview |
| [TreeSheets](https://strlen.com/treesheets/) ([repo](https://github.com/aardappel/treesheets)) | Hierarchical grid: outliner + spreadsheet + mind map | own `.cts` | C++ / wxWidgets | Free · Zlib · v2.4.0, Oct 2026 | Outline × spreadsheet × mind map in one grid |
| [Bike](https://www.hogbaysoftware.com/bike/) | Text outliner | own HTML-based `.bike` | macOS-only | Paid | Speed; by TaskPaper author |
| [TaskPaper](https://www.taskpaper.com/) | Plain-text outliner/task list with folding, focus, filtering, saved searches | `.taskpaper` plain text | macOS-only; model is birch-outline (JS) | Paid | Outliner behaviour inside a plain-text editor; query language |
| [OmniOutliner](https://www.omnigroup.com/omnioutliner) | Pro outliner with columns and styles | own `.ooutline` | Apple-only | Paid | Outliner UX: columns, styles |
| [Neorg](https://github.com/nvim-neorg/neorg) | Org-mode-like notes with its own `.norg` format | own `.norg` | Lua, Neovim | Free · GPL-3.0 · v9.6.4, Apr 2026 | Own unambiguous outline syntax |
| [Checkvist](https://checkvist.com) | Keyboard-driven outliner / lists | cloud | web app | Freemium | Keyboard-only workflow |
| [Gingko Writer](https://gingkowriter.com/) ([repo](https://github.com/gingko/client)) | Tree of cards that develops from outline into a draft | card tree, cloud (format unverified; exports MD/DOCX) | Elm, web + desktop | Paid · licence ? · v2.4.15, Jun 2020 | How an outline becomes prose while keeping structure |
| [Denote](https://protesilaos.com/emacs/denote) ([repo](https://github.com/protesilaos/denote)) | Notes whose metadata lives in file names | `.org`/`.md`/`.txt`, metadata in file names | Emacs Lisp, Emacs | Free · GPL · 4.2.3, May 2026 | Metadata in file names; durable |
| [Reor](https://github.com/reorproject/reor) | Local AI notes: auto-linking and semantic search | `.md` + vector DB | Electron + Tiptap/BlockNote, local LLM | Free · AGPL · archived Mar 2026 | Local LLM linking/search |
| [SoloMD](https://github.com/zhitongblog/solomd) | Markdown editor bridged to LLMs (MCP, BYOK AI) | `.md` + git | Tauri 2 + Vue 3 + CM6, mobile | Free · MIT · v4.14.11, Oct 2026 | Agent-ready vault: bundled MCP server, autogit history, tldraw boards; ~1.2k stars |
| [bangle.io](https://bangle.io) ([repo](https://github.com/bangle-io/bangle-io)) | WYSIWYG notes in the browser saved as local Markdown | `.md` (local folder via browser) | ProseMirror (bangle.dev), web app | Free · AGPL-3.0 · v1.0.1, Jul 2026 | Tree-based WYSIWYG that still saves Markdown: a round-trip test case |
| [Atomic](https://github.com/kenforthewin/atomic) | AI knowledge graph: "atoms" auto-tagged, linked, synthesized | SQLite DB (Markdown atoms) + sqlite-vec | Rust + Tauri 2, React, CM6; server, iOS | Free · MIT · v1.45.0, Aug 2026 | Auto-linking, wiki synthesis, agent chat; editor reusable; ~2k stars |
| [Lumina Note](https://github.com/blueberrycongee/Lumina-Note) | Markdown notes, backlinks, AI agent | `.md` | Electron + React + CM6 | Free · Apache-2.0 · v1.4.11, Jun 2026 | Live preview + backlinks + agent runtime; ~900 stars |
| [SwarmVault](https://github.com/swarmclawai/swarmvault) | LLM-maintained wiki and knowledge graph | `.md` wiki + `graph.json` | TS CLI | Free · MIT · v3.21.0, Jun 2026 | "LLM wiki" pattern: agent maintains `.md` wiki + graph |
| [Kition](https://kition.ai) ([repo](https://github.com/KitionAI/kition)) | AI office workspace: docs, tables, boards | local workspace (format unverified) | Electron | Free · AGPL · v0.1.49, Sep 2026 | Docs + tables + whiteboard + agent in one app |
| [Kinopio](https://kinopio.club) ([repo](https://github.com/kinopio-club/kinopio-client)) | Spatial canvas of cards and connections | JSON, cloud | Vue web app | Freemium · PolyForm NC · active Oct 2026 | Free-form card canvas |
| [nvUltra](https://www.nvultra.com) | Search-or-create single box (Notational Velocity successor) | plain text / `.md` | macOS-only | Paid | Search-or-create capture |
| [The Archive](https://zettelkasten.de/the-archive/) | Minimal plain-text Zettelkasten, saved searches | plain text / `.md` | macOS-only | Paid | Saved searches over plain files |
| [Notenik](https://notenik.app/) ([repo](https://github.com/hbowie/Notenik-25)) | Plain-text notes with configurable typed fields per collection | plain-text files with fields | Swift / AppKit, macOS-only | Free · MIT · 19.8.0, Oct 2026 | Structured data per collection without leaving files |
| [Scrintal](https://scrintal.com) | Linked cards on visual boards | cloud | web app | Freemium | Card boards for research |
| [Thymer](https://thymer.com) | IDE-style notes and planning, command palette | cloud | web app | Paid | Command palette, speed, plugin SDK |
| [Zavala](https://zavala.vincode.io) ([repo](https://github.com/vincode-io/Zavala)) | Small native outliner | own format (OPML import/export) | Apple-only | Free · MIT · 4.5, Oct 2026 | Small OSS native outliner |
| [Tangent](https://www.tangentnotes.com/) ([repo](https://github.com/suchnsuch/Tangent)) | Local notes with sliding link panels and a map of the path followed | `.md` | Electron + Svelte, Typewriter editor | Free · Apache-2.0 · tangent-v0.13.0-alpha.3, Oct 2026 | Navigation that keeps context (panels + path map); query language; custom editor |
| [org-roam.nvim](https://github.com/chipsenkbeil/org-roam.nvim) | Port of Org-roam to Neovim on nvim-orgmode | `.org` + optional on-disk index cache | Lua, Neovim, nvim-orgmode | Free · MIT · 0.2.0, Sep 2025 | Org-roam's backlink model without Emacs |
| [Orca Note](https://orca-studio.com/orcanote/) ([repo](https://github.com/sethyuan/orca-note)) | Block outliner for outlining and long-form writing, with structured backlinks | local DB on device (format unverified) | Electron, desktop + mobile | Freemium · v1.97.1, Oct 2026 | Benchmark for structured, block-level bi-directional backlinks ("fine-grained bi-directional outliner"); super tags |
| [kuku](https://kuku.mom) ([repo](https://github.com/kuku-mom/kuku)) | Local-first AI Markdown workspace | `.md` | Tauri + SolidJS, Go server, macOS + web | Free · MIT · 0.5.8, Jun 2026 | Tauri + SolidJS vault with AI and encrypted sync |
| [ZettleAgent](https://github.com/Poetrynan/ZettleAgent) | Zettelkasten app with hybrid search and graph | `.md` + SQLite (FTS5 + vectors) | Tauri 2 + React + CM6 | Free · Apache-2.0 · v0.2.0, Aug 2026 | Local hybrid search (FTS5 + vectors) bundled, no setup |
| [Stik](https://github.com/0xMassi/stik_app) | Instant-capture notes | `.md` | Tauri + React, macOS-only | Free · MIT · v0.9.0, Sep 2026 | One-shortcut capture into plain `.md` |
| [Tine](https://tine.page) ([repo](https://github.com/martinkoutecky/tine)) | Fast Logseq-compatible outliner | `.md` (Logseq graph) | Tauri 2 + SolidJS + Rust, mobile | Free · AGPL · v0.7.1, Oct 2026 | Logseq-compatible, much faster; quick capture, PDF annotation |
| [Lokus](https://lokusmd.com) ([repo](https://github.com/lokus-ai/lokus)) | Local-first Obsidian alternative | `.md` | Tauri 2 + React, ProseMirror | Free · FCL (→ MIT) · v1.3.0, Aug 2026 | Raw ProseMirror over `.md` |
| [organice](https://organice.200ok.ch) ([repo](https://github.com/200ok-ch/organice)) | Org-mode in the browser | `.org` (via Dropbox/WebDAV/GitLab) | React web app | Free · AGPL · 1.23, Jan 2026 | Plain-text outlining on mobile |
| [Beaver Notes](https://beavernotes.com) ([repo](https://github.com/Beaver-Notes/Beaver-Notes)) | Local-first notes for projects and meetings | local store (format unverified) | Vue + Tiptap, Electron → Tauri in v5 | Free · MIT · v5.0.0-beta.2, Sep 2026 | Electron → Tauri rewrite |
| [outl](https://outl.app) ([repo](https://github.com/outlmd/outl)) | Markdown outliner, no block IDs in files | `.md` (block IDs in a sidecar), tree-CRDT P2P sync | Rust + Tauri, SolidJS, TUI, iOS | Free · MIT · v0.12.0-beta.215, Oct 2026 | Closest to goal: outliner over plain `.md`, P2P sync, MCP |
| [Drummer](http://drummer.land) | Blogging outliner | OPML | web app | Free | OPML outlines; by early-outliner pioneer |
| [Tolaria](https://tolaria.md) ([repo](https://github.com/refactoringhq/tolaria)) | Git-first Markdown knowledge base | `.md` + git | Tauri 2 + React, BlockNote + CM6, macOS-only | Free · AGPL-3.0 · alpha-v2026.9.25-alpha.0006, Sep 2026 | Left Swift for Tauri over editor limits |
| [Dotflowy](https://dotflowy.com) ([repo](https://github.com/cameronapak/dotflowy)) | Open-source Workflowy alternative | cloud DB | TS, Cloudflare Workers, web app | Free · O'Saasy · v1.23.1, Oct 2026 | Agent-native (MCP) |
| [Noteriv](https://github.com/thejacedev/Noteriv) | Obsidian-style editor: graph, plugins, git sync | `.md` | Tauri 2 + Next.js + CodeMirror, Android | Free · MIT · v2.4.3, Aug 2026 | Graph, plugins, MCP in ~15 MB |
| [Onyx](https://github.com/hikarinessa/onyx) | Markdown notes with wiki links, periodic notes, list outlining | `.md` + SQLite index | Tauri 2 + React + CM6 | Free · MIT · v0.12.0, Sep 2026 | Planned stack; list outliner commands. Author: "proof of concept", "will not be maintained" |
| [oh-my-md](https://github.com/Zuixi/oh-my-md) | Live-preview editor fast on huge files | `.md` | Tauri 2 + CM6 | Free · Apache-2.0 · v0.0.1, Sep 2026 | Live preview on 100k+ line files |
| [RemDo](https://remdo.com) ([repo](https://github.com/remdo-project/remdo)) | Self-hosted outliner | Yjs CRDT docs | TS, Lexical, self-hosted web | Free · MIT · active Oct 2026 | Lexical + Yjs outliner, MCP; early |
| [Notebook Editor MD](https://github.com/zhulidr/notebook_editor_md) | Markdown editor with inline live preview | `.md` | Tauri 2 + CM6 / Lezer, browser | Free · Apache-2.0 · active Sep 2026 | Tiny CM6 live-preview + Tauri reference |
| [Urtext](https://github.com/nbeversl/urtext) | Plain-text hypertext: links, metadata, dynamic views | `.urtext` plain text | Python; Sublime / Vim front ends | Free · licence ? · active Nov 2025 | Hypertext in plain text, editor-agnostic |
| [SeqLog](https://github.com/SeqLog/SeqLog) | Native Logseq-style outliner | `.md` (vault folder, no index) | SwiftUI, macOS-only | Free · v1.14.3, Aug 2026 | Native SwiftUI Logseq; greps files, no index. Public repo has only README + update feeds, no source |
| [blokseq](https://github.com/seymores/blokseq) | Logseq-style outliner in the terminal | SQLite DB (no Markdown) | Rust TUI | Free · licence ? · v0.1.0, Oct 2026 | Logseq in terminal; SQLite as the document |
| [history-md](https://github.com/KoichiIshiguro/history_by_md) | Logseq-style outliner | SQLite DB | Next.js + React, self-hosted web | Free · MIT · v2, Apr 2026 | Small block-editor codebase |
| [SteleKit](https://github.com/tstapler/stelekit) | Logseq-compatible block outliner, journals | `.md` (Logseq graph) + SQLite index | Kotlin Multiplatform / Compose, mobile | Free · ELv2 · v0.92.1, Oct 2026 | Logseq graphs on a non-web native stack; persistent SQLite index |
| [seqno](https://seqno.vercel.app) ([repo](https://github.com/AVGVSTVS96/seqno)) | Logseq rebuilt local-first | Loro CRDT + SQLite | TS, Effect, web app | Free · MIT · phase-0, Oct 2026 | Logseq on Loro CRDT + rebuildable SQLite; author says not ready for real notes |
| [Nota](https://nota.md/) | Pro notes app over local Markdown; beta with waitlist | `.md` | macOS-only | unknown (beta) | Editor UX: multi-select, structural selection, no reformatting, scripting |

## Editor components & libraries to study

Building blocks rather than end-user apps. Useful as references for the editor itself.

| Project | What it is | Stack | License | Why study it |
|---------|-----------|-------|---------|--------------|
| [codemirror-live-markdown](https://github.com/blueberrycongee/codemirror-live-markdown) | Modular Obsidian-style live-preview plugins | CodeMirror 6, KaTeX, lowlight | MIT | Pick-and-choose extensions (math, tables, code blocks, images, links); reading / live / source modes. Alpha (v0.5.2-alpha) |
| [atomic-editor](https://kenforthewin.github.io/atomic-editor/) | Obsidian-style live preview editor, the writing surface in Atomic | CodeMirror 6 + React (`@atomic-editor/editor`) | MIT | Decorations are display-only, so the saved Markdown is byte-for-byte what you typed; wiki links, editable tables. ~150 stars, [demo](https://kenforthewin.github.io/atomic-editor/) |
| [ink-mde](https://github.com/davidmyersdev/ink-mde) | Embeddable Markdown editor component | CodeMirror 6 | MIT | More mature, long-running alternative to the above |
| [birch-outline](https://github.com/jessegrosjean/birch-outline) | TaskPaper's open-source outline model | CoffeeScript / JS | MIT | Outline/item model, query language, undo, `.taskpaper`/OPML serialization. Dormant, but useful for model design |
| [BlockSuite](https://blocksuite.io) | AFFiNE's block editor framework | Lit + Yjs | MPL-2.0 | CRDT-backed blocks plus a whiteboard surface |
| [appflowy-editor](https://github.com/AppFlowy-IO/appflowy-editor) | AppFlowy's block editor | Flutter / Dart | AGPL-3.0 or MPL-2.0 (dual) | Block editing on a non-web stack |
| [SiYuan](https://github.com/siyuan-note/siyuan) kernel | Block engine behind SiYuan (see apps table) | Go kernel + TypeScript frontend | AGPL | Mixed block types (paragraphs, headings, lists, tables) in one document |
| [ProseMirror](https://prosemirror.net) | Rich-text editor toolkit | JS, contentEditable | MIT | The main alternative to CodeMirror for structured documents; schema-based. Moved from GitHub to code.haverbeke.berlin |
| [Tiptap](https://tiptap.dev) | Headless editor framework on ProseMirror | TS / ProseMirror | MIT (core) | Most popular ProseMirror wrapper; ~39k stars |
| [BlockNote](https://www.blocknotejs.org) | Notion-style block editor | Tiptap / ProseMirror, React | MPL-2.0 (core) | Ready-made block UX: drag handles, slash menu, nesting |
| [Milkdown](https://milkdown.dev) | Plugin-driven WYSIWYG Markdown editor | ProseMirror + remark | MIT | Markdown in, Markdown out |
| [Lexical](https://lexical.dev) | Extensible text editor framework (Meta) | TS | MIT | Fast, minimal core; used by RemDo |
| [Slate](https://slatejs.org) | Customizable rich-text framework | TS, React | MIT | Nested document model, fully customizable |
| [Plate](https://platejs.org) | Plugin and component system on Slate | Slate, React | MIT | Batteries-included Slate editor |
| [Yjs](https://docs.yjs.dev) | CRDT for shared data and text | JS | MIT | Most widely used CRDT; bindings for CodeMirror, ProseMirror, Lexical |
| [Automerge](https://automerge.org) | JSON-like CRDT | Rust core, JS/WASM | MIT | Local-first document sync with full history |
| [Loro](https://loro.dev) | High-performance CRDT | Rust, JS/WASM | MIT | Movable-tree CRDT suits outlines; used by seqno |
| [@lezer/markdown](https://code.haverbeke.berlin/lezer/markdown) | Incremental CommonMark parser | TS | MIT | The parser behind CodeMirror 6 Markdown |
| [micromark](https://github.com/micromark/micromark) | Small, spec-compliant Markdown tokenizer | JS | MIT | Foundation of remark; exact source positions |
| [remark](https://remark.js.org) | Markdown processor via syntax trees | JS (unified) | MIT | Transform and lint Markdown ASTs; huge plugin ecosystem |
| [markdown-it](https://markdown-it.github.io) | Fast Markdown-to-HTML parser | JS | MIT | Common choice for rendering and export |
| [JSON Canvas](https://jsoncanvas.org) | Open file format for infinite canvases (from Obsidian) | Spec | MIT | Reuse this format if you add a canvas view |
| [CodeMirror 6](https://codemirror.net) | Code and text editor toolkit | TS | MIT | Engine behind most of the shortlist. GitHub repo archived; moved to code.haverbeke.berlin |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | VS Code's editor | TS | MIT | Second text-based option to test the editor contract against |
| [HyperMD](https://github.com/laobubu/HyperMD) | Live-preview Markdown on CodeMirror 5 | JS | MIT | Early Obsidian-style live preview; historical reference |
| [Vditor](https://b3log.org/vditor/) | Markdown editor with instant-render, WYSIWYG and split modes | TS | MIT | SiYuan's editor; several editing modes in one component |
| [Toast UI Editor](https://ui.toast.com/tui-editor) | Markdown + WYSIWYG tabs | JS (ProseMirror-based) | MIT | Two views of one document. Archived 2026 |
| [MDXEditor](https://mdxeditor.dev) | Markdown editor component | Lexical, React | MIT | Markdown round-trip on Lexical |
| [OverType](https://overtype.dev) | Live preview over a plain textarea | JS | MIT | Minimal baseline for the editor contract |
| [Editor.js](https://editorjs.io) | Block editor with JSON output | JS | Apache-2.0 | Block model, the opposite of plain text |
| [Novel](https://novel.sh) | Notion-style editor | Tiptap, React | Apache-2.0 | Polished block UX with AI autocomplete |
| [tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown) | Incremental Markdown grammar | tree-sitter (C) | MIT | Parsing for a native or Rust backend |
| [pulldown-cmark](https://github.com/pulldown-cmark/pulldown-cmark) | Streaming CommonMark parser | Rust | MIT | Fast indexing on a Tauri / Rust backend |
| [comrak](https://github.com/kivikakk/comrak) | CommonMark + GFM parser with AST | Rust | BSD-2-Clause | Rust AST with round-trip formatting |
| [Twig (twig-doc)](https://github.com/diaryx-org/twig) | Document AST library with byte spans; edits are source splices | Zig core, Rust crate, C API | MIT OR Apache-2.0 | Byte-preserving edits by design (never re-serializes the tree); CommonMark 0.31.2 conformant; embeddable editor API; no outline ops |
| [Markdig](https://github.com/xoofx/markdig) | CommonMark parser with a lossless round-trip mode | C# | BSD-2-Clause | Trivia tracking: parse then render returns the input unchanged, so edits do not disturb untouched text; reference for a round-trip design |
| [panache](https://panache.bz) | Formatter, linter and LSP for Pandoc/Quarto Markdown | Rust (rowan CST) | MIT | Lossless CST parser for Markdown in Rust, the rust-analyzer (rowan) approach; model for a byte-preserving Rust core |
| [Excalidraw](https://excalidraw.com) | Hand-drawn style whiteboard | TS, React | MIT | Canvas library, if a canvas view is added |
| [tldraw](https://tldraw.dev) | Infinite canvas SDK | TS, React | tldraw license (commercial use needs a licence) | Canvas library, if a canvas view is added |
| [codemirror-vim](https://github.com/replit/codemirror-vim) | Vim keybindings for CM6 (Replit) | TS | MIT | Must-have for the target audience |
| [y-codemirror.next](https://github.com/yjs/y-codemirror.next) | Yjs binding for CM6 | TS | MIT | Collaboration/sync on a text editor |
| [Mermaid](https://mermaid.js.org) | Diagrams from text in Markdown | TS | MIT | Supported by nearly every app here |
| [Pandoc](https://pandoc.org) | Universal markup converter | Haskell | GPL-2.0 | Standard import/export path |
| [Muya](https://github.com/marktext/muya) | MarkText's live-render Markdown block editor | JS | MIT | Third live-preview approach (vs CM6 decorations, ProseMirror); tables, selection, serialization. Archived May 2026, moved into MarkText monorepo |
| [Lute](https://github.com/88250/lute) | Markdown engine behind Vditor and SiYuan | Go (+ JS build) | Mulan PSL-2.0 | Connects several editing modes to stored Markdown; AST, formatting, HTML → Markdown |
| [Typewriter](https://github.com/typewriter-editor/typewriter) | Rich-text editor on a linear Delta (Quill-style) model | TS | MIT | Third editor model, line-oriented Delta; Tangent uses a fork. Stale since Feb 2025 |
| [markmap](https://markmap.js.org) | Markdown → interactive mind map | TS | MIT | Cheap visual projection of a derived outline model |
| [markdown-oxide](https://github.com/Feel-ix-343/markdown-oxide) | PKM language server for Markdown | Rust | Apache-2.0 | Obsidian-style links, backlinks and daily notes in any LSP editor |
| [Marksman](https://github.com/artempyanykh/marksman) | Markdown language server | F# | MIT | Wiki links, references and diagnostics over a notes folder |
| [Djot](https://djot.net) | Light markup language (by the author of CommonMark/Pandoc) | Spec + JS/Lua | MIT | Fixes Markdown's ambiguities; worth knowing even if staying with Markdown |
| [Markdoc](https://markdoc.dev) | Markdown-based authoring framework (Stripe) | TS | MIT | Custom tags and validation on top of Markdown |
| [automerge-repo](https://github.com/automerge/automerge-repo) | Storage and networking layer for Automerge | TS | MIT | Turns a CRDT into a working local-first sync setup |
| [cr-sqlite](https://github.com/vlcn-io/cr-sqlite) | CRDT extension for SQLite | Rust / C | MIT | Multi-writer sync for an SQLite index |
| [Jazz](https://jazz.tools) | Local-first relational database | TS | MIT | Sync, permissions and storage as a framework |
| [Peritext](https://www.inkandswitch.com/peritext/) | Rich-text CRDT research (Ink & Switch) | TS | MIT | How to merge formatted text correctly; background for collaboration |
| [Tantivy](https://github.com/quickwit-oss/tantivy) | Full-text search engine library | Rust | MIT | Fast search index for a Rust / Tauri backend |
| [Syncthing](https://syncthing.net) | Peer-to-peer file sync | Go | MPL-2.0 | How many plain-file note users sync today, with no server |
| [Tauri](https://tauri.app) | Desktop and mobile app shell with a web frontend | Rust | Apache-2.0 / MIT | Shell used by Tine, Atomic, outl, Onyx and most new apps here |
| [Quartz](https://quartz.jzhao.xyz) | Publish a vault as a static site | TS | MIT | Open-source alternative to Obsidian Publish |

## Plugins

Extensions of existing apps: Obsidian, Logseq, VS Code, Vim/Neovim and Emacs. Pages under `survey/plugins/`; entries from our own research and from [True Outliner's research notes](https://github.com/laughedelic/obsidian-true-outliner/tree/main/docs/research).

### Outlining and structure

| Plugin | Host | What it is | License | Why study it |
|--------|------|-----------|---------|--------------|
| [True Outliner (Obsidian plugin)](https://github.com/laughedelic/obsidian-true-outliner) | Obsidian | Treats a note's whole block structure as a tree | MPL-2.0 | Closest to the target model: headings, paragraphs, lists as one tree; no IDs; byte-for-byte round-trip; editor-free core. WIP, no release |
| [Unified Outliner (Obsidian plugin)](https://github.com/kazdonkai/unified-outliner) | Obsidian | Obsidian plugin: one tree of heading sections, list subtrees and body blocks | MIT | Closest found to True Outliner: move/re-level/reparent whole nodes across headings and lists, focused subtree editing; no block IDs unless you use mirrors |
| [Outliner (Obsidian plugin)](https://github.com/vslinko/obsidian-outliner) | Obsidian | Workflowy-style list editing in Obsidian | MIT | Reference for list outlining over plain Markdown; ~1.4k stars |
| [Pro Outliner (Obsidian plugin)](https://github.com/mrkhachaturov/obsidian-pro-outliner) | Obsidian | Fork merging Outliner + Zoom: breadcrumbs, mirrors, Workflowy-style selection expansion | MIT | Goes furthest toward true-outliner UX inside the Markdown view: node selection, Tana-style mirrors, breadcrumbed zoom |
| [Bullet (Obsidian plugin)](https://github.com/kdnk/obsidian-bullet) | Obsidian | Active fork of Outliner with vim-mode integration | MIT | Same flat-text model and limits as Outliner; where Outliner maintenance continues |
| [Trynalist (Obsidian plugin)](https://github.com/grub-basket/Trynalist) | Obsidian | Dynalist-style outliner whose every line is a Markdown note | MIT | A block outliner in Obsidian's vault, stored one file per item (frontmatter: parent, fractional order, depth); Dynalist's keys and behaviors as defaults; young |
| [Zoom (Obsidian plugin)](https://github.com/vslinko/obsidian-zoom) | Obsidian | Zoom into a heading or list subtree, with breadcrumbs | MIT | Shows zoom/hoisting works on public CodeMirror 6 APIs in the normal Markdown view (block-replace decorations + selection filter); dormant since 2023 |
| [Zoom Into Section (Obsidian plugin)](https://github.com/perezamadorluisenrique-gif/zoom-into-section) | Obsidian | Zoom into a heading section or list subtree, with breadcrumbs | MIT | Zoom that only hides lines; state kept per tab outside the note |
| [Heading Outliner (Obsidian plugin)](https://community.obsidian.md/plugins/heading-outliner) | Obsidian | Obsidian plugin: outliner moves for heading sections | MIT | Move, indent and outdent whole sections by heading; outlining for general documents, not just lists |
| [Headings (Obsidian plugin)](https://github.com/cycsd/Headings) | Obsidian | Navigate, copy, select, align and move heading sections | AGPL-3.0 | Moves a section and re-levels its descendants to fit the destination |
| [Dragger (Obsidian plugin)](https://github.com/ariestar/obsidian-dragger) | Obsidian | Drag any block (paragraph, heading, list, quote, table, code) to rearrange; nesting by horizontal position | MIT | Headless npm core (md-dragger) with no Obsidian or CodeMirror imports |
| [Draggable List Items (Obsidian plugin)](https://github.com/viscouspot/draggable-list-items) | Obsidian | Drag list items to reorder them | 0BSD | Drag-and-drop for list items alone; Outliner already covers it |
| [Markdown Outliner](https://github.com/hota911/markdown-outliner) | Obsidian | Edit Markdown task lists as an outline (Obsidian plugin + web app) | MIT | Outliner over plain Markdown lists, with an experimental Tauri app |
| [Workflowy-Style Outline (Obsidian plugin)](https://github.com/springrain1/workflowy-style-outline) | Obsidian | Separate Workflowy-style outline editor over a note's lists | MIT | Case study of rebuilding the editor beside Obsidian's: lossy, normalizing conversion, non-list content second-class, block IDs written on drag |
| [Virtual Outliner (Obsidian plugin)](https://github.com/jsglazer/virtual-outliner) | Obsidian | Outline layer over custom @/@@ entry lines with strict subtree rules | MIT | Whole-subtree moves done strictly, but writes hidden IDs and a metadata block into the file |
| [Lineage (Obsidian plugin)](https://github.com/ycnmhd/obsidian-lineage) | Obsidian | Gingko-style column/tree writing interface | MIT | Tree editing over Markdown, but structure stored as HTML-comment markers or a list outline |
| [organ (Vim/Neovim plugin)](https://github.com/chimay/organ) | Vim/Neovim | Org-mode-style structure editing for Markdown in Vim/Neovim | BSD-3-Clause | Promote/demote, move and refile whole subtrees of headings or list items in plain Markdown |
| [bullets.vim (Vim/Neovim plugin)](https://github.com/bullets-vim/bullets.vim) | Vim/Neovim | Automated bullet and numbered lists | MIT | The dedicated list-editing plugin: Enter continues an item, items promoted and demoted, ordered lists renumbered, checkboxes toggled; no subtree model |
| [vimwiki (Vim/Neovim plugin)](https://vimwiki.github.io/) | Vim/Neovim | Personal wiki, in its own syntax or Markdown | MIT | The most popular Vim notes plugin (9.5k stars): list items change level alone or with all their children, renumbering, checkboxes; plain `.md` with its Markdown syntax |
| [mkdnflow.nvim (Neovim plugin)](https://github.com/jakewvincent/mkdnflow.nvim) | Neovim | Navigation and management of Markdown notebooks | GPL-3.0 | Neovim-native list editing on plain Markdown: lists extended on Enter, auto-indent and dedent, renumbering, to-dos |
| [markdown-mode (Emacs)](https://jblevins.org/projects/markdown-mode/) | Emacs | Emacs major mode for Markdown with Org-like subtree editing | GPL-3.0 | Org-mode for Markdown: promote/demote/move heading subtrees and list items, visibility cycling; edits the text buffer, so other bytes stay put |
| [markdown-move (VS Code)](https://marketplace.visualstudio.com/items?itemName=madeindjs.markdown-move) | VS Code | Move heading sections up/down; promote/demote | MIT | Minimal heading-section moves; a # inside a code block is mistaken for a heading |
| [Markdown All in One (VS Code)](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) | VS Code | Shortcuts, list editing, table of contents and table formatting for Markdown | MIT | The baseline Markdown editing experience in VS Code: list continuation and indent, no structural model |

### Backlinks, embedded editors and journals

| Plugin | Host | What it is | License | Why study it |
|--------|------|-----------|---------|--------------|
| [Influx (Obsidian plugin)](https://jensmtg.github.io/influx/) | Obsidian | Backlinks as excerpts organized by the referencing note's bullet hierarchy | MIT | Closest to Logseq's structured backlinks in Obsidian; own panel, read-only excerpts |
| [Better Search Views (Obsidian plugin)](https://github.com/ivan-lednev/better-search-views) | Obsidian | Outliner-style context (breadcrumbs + children) in search, backlinks and queries | MIT | Demand for structured backlinks, and the cost of patching private APIs: breaks on Obsidian updates |
| [Coalesce (Obsidian plugin)](https://github.com/bfloydd/coalesce) | Obsidian | Backlinked notes coalesced into one configurable view | 0BSD | Roam/Logseq-inspired backlinks view on public APIs; read-only context |
| [Backlink Cache (Obsidian plugin)](https://github.com/mnaoumov/obsidian-backlink-cache) | Obsidian | Caches backlinks to speed up getBacklinksForFile | MIT | Shows the public-API route to backlinks: resolvedLinks plus an own reverse index |
| [Hover Editor (Obsidian plugin)](https://github.com/nothingislost/obsidian-hover-editor) | Obsidian | Turns page-preview popovers into full editors | MIT | Embeds a real MarkdownView via a detached WorkspaceSplit: prior art for editable embedded notes and mirrors |
| [Daily Notes Editor (Obsidian plugin)](https://github.com/Quorafind/Obsidian-Daily-Notes-Editor) | Obsidian | Edit many daily notes inline on one page, like Roam's daily notes | closed | Pioneered inline multi-note editing in Obsidian; unmaintained since April 2025 |
| [Continuous Journal (Obsidian plugin)](https://github.com/laughedelic/obsidian-continuous-journal) | Obsidian | Logseq-style continuous timeline of daily notes, with gap-day placeholders | MIT | By the True Outliner author; most compact readable version of the embedded-editor technique (src/embed.ts) |
| [Periodic Notes](https://github.com/liamcain/obsidian-periodic-notes) | Obsidian | Daily, weekly and monthly notes | MIT | Logseq-style journals in Obsidian |

### Data, queries and tasks

| Plugin | Host | What it is | License | Why study it |
|--------|------|-----------|---------|--------------|
| [Dataview](https://blacksmithgu.github.io/obsidian-dataview/) | Obsidian | Queries over notes' metadata | MIT | Database-style views over plain Markdown, like Logseq queries |
| [Datacore](https://blacksmithgu.github.io/datacore/) | Obsidian | Dataview successor, focused on speed and UX | MIT | Next-gen queries over Markdown |
| [Bases (Obsidian core plugin)](https://obsidian.md/help/bases) | Obsidian | Database views over notes' frontmatter | closed (core) | Same frontmatter-as-data approach as this wiki |
| [Tasks](https://publish.obsidian.md/tasks/) | Obsidian | Task tracking across notes | MIT | Due dates, recurrence and queries over Markdown checkboxes |
| [Templater](https://silentvoid13.github.io/Templater/) | Obsidian | Templates with scripting | AGPL-3.0 | Template language and user scripting |

### Sync, search and AI

| Plugin | Host | What it is | License | Why study it |
|--------|------|-----------|---------|--------------|
| [Git (Obsidian plugin)](https://github.com/Vinzent03/obsidian-git) | Obsidian | Git-based backup and sync | MIT | Sync through git |
| [Self-hosted LiveSync](https://github.com/vrtmrz/obsidian-livesync) | Obsidian | Self-hosted sync via CouchDB | MIT | Community answer to Obsidian Sync |
| [Omnisearch](https://github.com/scambier/obsidian-omnisearch) | Obsidian | Search engine for Obsidian, with OCR and PDF indexing | GPL-3.0 | Better search than the built-in one; a gap worth noting |
| [Smart Connections](https://smartconnections.app) | Obsidian | Related notes via local embeddings | Source-available (Smart Plugins License) | Local AI linking while writing |

### Formatting and look

| Plugin | Host | What it is | License | Why study it |
|--------|------|-----------|---------|--------------|
| [Linter](https://github.com/platers/obsidian-linter) | Obsidian | Formats and normalizes notes | MIT | Rules for consistent Markdown and frontmatter |
| [Lapel (Obsidian plugin)](https://github.com/liamcain/obsidian-lapel) | Obsidian | Shows the heading level in the editor gutter | MIT | Per-level heading markers; theming via data-* attributes and CSS variables; viewport-limited decorations |
| [Logseq Formater (Obsidian plugin)](https://community.obsidian.md/plugins/logseq-formater) | Obsidian | Converts Logseq syntax to Obsidian Markdown when opening files | MIT | Exists only to clean Logseq's in-file metadata out of shared vaults: the cost of writing structure into files |
| [Excalidraw (Obsidian plugin)](https://github.com/zsviczian/obsidian-excalidraw-plugin) | Obsidian | Drawings inside the vault | AGPL-3.0 | Drawings stored as Markdown files |

### Plugin APIs

| Plugin | Host | What it is | License | Why study it |
|--------|------|-----------|---------|--------------|
| [Obsidian plugin API](https://docs.obsidian.md) | Obsidian | Type definitions and docs for Obsidian plugins | MIT | Reference design for a plugin system |
| [Logseq plugin API](https://plugins-doc.logseq.com) | Logseq | `@logseq/libs` plugin SDK + samples | MIT | Second plugin-API design to compare with Obsidian's |

## Dimensions to compare during investigation

- **Capture speed**: time from idea to saved note (mobile, shortcuts, share sheet, web clipper)
- **Structure**: folders vs. tags vs. links vs. blocks vs. typed objects/databases
- **Data ownership**: plain files vs. proprietary DB, export quality, lock-in
- **Sync & offline**: local-first/CRDT vs. cloud-first, conflict handling
- **Privacy**: end-to-end encryption, self-hosting
- **Extensibility**: plugins, API, scripting
- **Collaboration**: real-time multi-user editing, sharing
- **Search & retrieval**: full-text, queries, AI/semantic search
- **AI features**: summarization, auto-tagging, chat over notes
- **Input modes**: handwriting/ink, PDF annotation, academic citations
- **Business model**: what users pay for (sync, AI, publishing, teams)
- **Long-term viability**: company health, open-source community, data durability
