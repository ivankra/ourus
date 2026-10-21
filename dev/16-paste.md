# Paste, copy and cut (2026-10-21)

Several sessions on one day, squashed into `a691f43` (*Paste refactoring*): plain paste rewritten;
structured paste researched in depth across the apps and both clipboard paths (Markdown text and
HTML); paste rewritten from scratch on that research, with every clipboard format; copy and cut; and,
before them, the typed backtick (`insertText`), B52 and the bugs 15-spec left open. This note replaces
the sessions' notes (16-backtick, 16-plain, 16-structured, 16-z-impl). The research (§2) is kept nearly
whole; the probe scripts and runs it cites were scratch and are not in the tree.

Notation: `┃` caret, `«»` selection, `⏎` line break, `→` tab, `◌` placeholder. **M** is a clipboard of
Markdown as `text/plain` alone (a copy from a Markdown source); **H** a browser's copy of rendered
content (`innerText` plus HTML); **X** the old SxS clipboard (Markdown text plus its rendering).

| | start | end |
| --- | ---: | ---: |
| spec cases | 907 | 970, all passing ourus's replay in the SxS |
| `npm test` | 1070 | 1144 pass, 0 fail |
| cm6 smoke test | 66 | 73 of 73 |
| differential: runs failing to encode | 190 | 20, all HEAD's too |
| paste | `pasteStructured` (`text`), `paste.ts` 826 lines | `paste` (`clipboard`: every format): `paste.ts` 461, `place.ts` 368, `html.ts` 382; `paste-plain.ts` 272 |
| paste spec | paste.md 95 cases, paste-plain.md 28 | paste.md, paste-list.md, paste-list-form.md, paste-conv.md, paste-html.md, paste-plain.md (34), copy.md |
| new commands | | `insertText`, `paste`, `copy`, `cut` |
| runtime dependencies | none | `htmlparser2` 12.0.0 |

## 1. Where paste started

- `pasteStructured` took one string, the clipboard's text, read as Markdown. `fitPaste` alone was about
  170 lines returning seven things; placement was its own code, not the move/copy placement of the
  structural commands (13-align §11).
- Six interacting options: `pasteStructuredLines`, `…MidText`, `…AtEnd`, `…OnParent`,
  `…ParagraphList`, `…ListForm` (four values). 13-align §12: `AtEnd` hides more than it explains,
  `ParagraphList` buys little, `ListForm`'s `literal` and `drop` "describe the clipboard as much as the
  app".
- paste.md: 95 cases, 66% of SxS runs disagreeing (the most of any file by count), scattered: one app
  alone on 39 cases, two on 28; the one strong camp a heading line at a text's end (Paste32–35, 53, 61:
  Roam, WorkFlowy, Dynalist, RemNote, Tana join the title and drop the `#`s; ourus made a node, decision
  7). Roam's and Athens's disagreements mostly caret-only (28 of 46, 35 of 56). 45–55 differential runs
  failing to encode.
- paste-plain.md: 28 cases, 61% disagreeing, almost all the text editors inserting raw text by design;
  Logseq, Tine, Roam and Athens agreeing on 15–16 of ~20.
- **The harness's clipboard**: every SxS paste put the case's Markdown as `text/plain` and, where it had
  structure, its commonmark rendering as `text/html`. Nearly every app reads the HTML; ourus read the
  Markdown. So the SxS compared ourus's Markdown reading with the apps' HTML reading (15-spec §11.1's
  "clipboard provenance"; Tana's 12 verdicts flipped under `--plain-clipboard`).

## 2. Research: how the apps paste

Measured with `sxs/probe.ts` and headless Chromium, and read from the apps' bundles (the proxy's
cache). The user: "feels like we'd need to support html and plain text pastes" and "both paths need to
be researched", so every finding says which clipboard it was measured with.

### 2.1 What a copy carries

**From a rendered page** (headless Chromium, a real DOM-range selection, Ctrl+C, read back with
`navigator.clipboard.read()`; Chromium's inline `style`s left out):

| selected | `text/plain` | `text/html` |
| --- | --- | --- |
| nested list | `x⏎y⏎y1⏎z` | `<ul><li>x</li><li>y<ul><li>y1</li></ul></li><li>z</li></ul>` |
| ordered list | `one⏎two` | `<ol><li>one</li><li>two</li></ol>` |
| heading, paragraph, list | `Title⏎para bold c⏎⏎x` | `<h2>Title</h2><p>para <b>bold</b> <code>c</code></p><ul><li>x</li></ul>` |
| code block | `let a = 1;⏎let b = 2;` | `<pre><code class="language-js">…</code></pre>` |
| a blockquote's paragraphs | `q1⏎⏎q2` | `<p>q1</p><p>q2</p>` (the quote lost: the range was inside it) |
| task list | ` done⏎ todo` | `<ul><li><input type="checkbox" checked=""> done</li>…` |
| `<p>` with `<br>` | `line one⏎line two⏎⏎p2` | `<p>line one<br>line two</p><p>p2</p>` |
| first item's text to the second's first letter | `x⏎y` | `<ul><li>x</li><li>y</li></ul>` |

- **A page's `text/plain` carries no Markdown**: it is the selection's `innerText`, no markers,
  indentation or `#`. A nested list, an ordered list and plain lines all come out as `x⏎y`; all
  structure is in the HTML. A host passing ourus only `text/plain` flattens everything copied from the
  web (GitHub, docs, Wikipedia, an LLM's rendered answer).
- So **the SxS clipboard (Markdown text plus rendered HTML) is a copy no source makes**: an app reading
  the HTML saw a page copy, ourus a Markdown source copy.
- A partial selection gives a partial structure: the list survives, nothing says where in the first
  item it began.

**Other sources** (from what is known):
- A Markdown editor's source view (CodeMirror: Obsidian, SilverBullet; a textarea; a terminal):
  `text/plain` only, the Markdown as written.
- Code editors (VS Code, JetBrains): `text/plain` and a syntax-highlighted `text/html` (`<div>`s of
  coloured `<span>`s; VS Code adds `vscode-editor-data`): a *picture of the source*. An HTML-first app
  pastes styled lines and loses the Markdown's structure. Notion special-cases it.
- Word processors: Word's lists are `<p class=MsoListParagraph>` with `mso-list` styles; Docs' a `<ul>`
  with `aria-level` wrapped in `<b id="docs-internal-guid-…">`.

**The apps' own copies** (each app through its driver, `x **b**` / child `y` / `z`, blocks selected
with the app's keys, Ctrl+C; `setData`, `navigator.clipboard.write`/`writeText` patched, and the
clipboard read back):

| app | how | `text/plain` | `text/html` | its own |
| --- | --- | --- | --- | --- |
| Logseq | `navigator.clipboard.write` | `- x **b**⏎→- y⏎- z`: Markdown, tabs | `<ul><li>x <b>b</b></li><ul><li>y</li></ul><li>z</li></ul>`: the child `<ul>` a *sibling* of its `<li>` (invalid), from an XSLT export, so Chromium injects its XSLT deprecation notice as a `<div>` in the `<ul>` | `web application/logseq`: EDN of the blocks |
| Logseq DB | the same, `text/plain` written three times (the last wins) | as Logseq | as Logseq | `web application/logseq`: EDN with the graph's name, `:op :copy` |
| Tine | `writeText` | as Logseq | none | none |
| Roam | `setData` | `- x **b**⏎    - y⏎- z`: Markdown, 4 spaces | `<ul><li><span><span>x <strong>b</strong></span></span><ul><li>…y…</li></ul></li><li>…z…</li></ul>` | `roam/data`: transit JSON |
| Athens | `setData` | `- x **b**⏎    - y⏎- z` | none | `application/athens-representation` (EDN), `application/athens` (uids) |
| WorkFlowy | the browser's (Ctrl+A twice is a DOM range) | `ourus sxs⏎x **b**⏎y⏎z`: `innerText`, no markers or indentation (the root's title too) | its DOM: nested `<ul><li><div class="name" data-wfid=…>` | none (`WF.Export` has Markdown, OPML, text, behind a menu) |
| Dynalist | `setData` | `x **b**⏎y⏎z`: no markers, no indentation | `<ul><li>x <b>b</b><ul><li>y</li></ul></li><li>z</li></ul>`: clean | `text/opml` |
| RemNote | an `execCommand` on an element of its own | `x **b**⏎    y⏎z`: indentation, no markers | `<ul><div rem="true" …>x **b**<ul><div rem="true" …>y</div></ul></div>…`: `<div>`s for `<li>` | none seen |
| Tana | | `x⏎- y⏎z`: the top level bare | `<p>x</p><ul><li>y</li></ul><p>z</p>` | ids |
| SiYuan | `setData` | `- x **b**⏎⏎  - y`: a loose list | `<!--data-siyuan='…base64 of its DOM…'-->` then `<ul><li><p>x <strong>b</strong></p><ul><li>y</li></ul></li></ul>` | `text/siyuan`: its block DOM |
| BlockNote | `setData` | `* x **b**⏎  * y⏎* z`: `*` bullets | `<ul><li><p class="bn-inline-content">x **b**</p><ul><li data-nesting-level="1">…` | `blocknote/html` (`data-pm-slice`) |
| Obsidian 1.14.4, true-outliner | `setData` | `- x **b**⏎→- y⏎- z`: the source | `<!-- obsidian --><ul><li>x <strong>b</strong><ul><li>y</li></ul></li><li>z</li></ul>` | `text/markdown`: the source again |
| SilverBullet | CodeMirror's | the source | none | none |

(`**b**` is literal everywhere: the drivers load text unparsed. SiYuan's and SilverBullet's selections
stopped short of `z`.)

- **Every outliner writes a private format that round-trips exactly into itself** (EDN, transit, ids,
  OPML, its DOM). A Markdown host's own is the Markdown.
- **`text/plain` is Markdown** in the Logseq family, Roam, Athens, SiYuan, BlockNote, Obsidian; **not**
  in Tana (top level bare), Dynalist, WorkFlowy, RemNote (indentation or nothing).
- **`text/html` is well-formed nested `<ul>`s in most**, except Logseq (a `<ul>` directly in a `<ul>`,
  plus the XSLT notice), RemNote (`<div>`s in `<ul>`) and Tana (top level as `<p>`). An HTML reader must
  take a `<ul>` in a `<ul>` as nested under the item before, a `<div>` in a list as an item, and
  paragraphs then a `<ul>` as a paragraph's list.
- **`text/markdown`**: Obsidian writes it; the honest format for a Markdown host to write and read
  first.
- **Self-recognition**: Obsidian marks its HTML `<!-- obsidian -->`, SiYuan embeds its DOM in a comment;
  finding its own mark, an app takes the Markdown, not the HTML.

### 2.2 What each app reads

A matrix of 180 probes: 12 contents (a flat, nested and ordered list, `# h` + `p`, `p` + a list, two
lines, two paragraphs, a fenced `js` block, one item `- x`, a quote, two tasks, one line with bold and a
link) × 5 targets (`- a┃b` mid, `- a┃` / `- b` end, the same with a child `c`, `- ┃` / `- b` empty,
`- ┃ab` start) × 3 clipboards (M, H, X). Caveats: M clipboards ended with a line break, H didn't (as
the copies do), and WorkFlowy, Dynalist and RemNote paste that break as an empty node; rich-text apps
(BlockNote, RemNote, WorkFlowy) hold bold and links as formatting their drivers read as plain text; the
quote and code M probes skip on block apps.

**Every app's result depends on the formats.** Of 55 block-app shapes, M and H differ on 50–55 for
Dynalist, RemNote, Obsidian, SilverBullet; 40 for Athens, Tana; 20–30 for Logseq, Tine, Roam, WorkFlowy;
10 for SiYuan; 5 for BlockNote (the last two read Markdown text nearly as well as HTML).

| app | HTML present | Markdown as plain text (M) |
| --- | --- | --- |
| Logseq, Logseq DB | converted to Markdown (`**b**`, `[l](u)`), then its Markdown path; numbers dropped; a heading gets a stray blank line before its paragraph; a `<pre>` keeps no language (DB) or glues to the block (OG) | blocks only if a line starts `-`, `*`, `+` or `#` (`markdown-blocks?`); `1. x` lines and code go *into* the block as text; blank lines → blocks |
| Tine | as Logseq; plain lines from HTML (`<p>x<br>y</p>`) become blocks | as Logseq |
| Roam | to blocks, inline converted to Markdown; nested lists kept | lines → blocks, `- ` stripped, `1.` kept as text |
| Athens | **ignored**: `text/plain` only (M = X everywhere), so a page copy is flat lines | lines → blocks, `- ` stripped, `1.`, `# `, `[ ] ` kept as text |
| WorkFlowy | to items; numbers dropped; quote and code to plain text | its Markdown feature: lists (numbered too), `#`, `[ ]`, inline; code a line per item |
| Dynalist | via a hidden contenteditable: items, inline as Markdown, headings and code as text | **no Markdown**: a line per item, markers kept as text (`- - y`), indentation nests |
| Tana | its HTML importer; a list goes to **the end of the parent's children**; an empty node not filled | `marked`, for list-like lines (`-`, `*`, a number); plain lines a node each; code a node per line |
| RemNote | to rems: numbered stays numbered, `<pre>` a code block, headings joined into the text | a rem per line, Markdown read (`# ` heading, `1.` numbered, `[ ]` task) |
| SiYuan | Lute's HTML→Markdown, then Markdown (`<pre>` became inline code: Lute's bug) | full Markdown (Lute) |
| BlockNote | ProseMirror's HTML parse | full Markdown (`plainTextAsMarkdown`) |
| Obsidian (all), SilverBullet | converted to Markdown (SilverBullet's turndown writes `*   x`), inserted as text | inserted as text |
| true-outliner | converted (Obsidian's), then its structural paste | its structural paste |
| Emacs | none: the kill ring is text | inserted as text |

**Which format wins when both are there** (confirmed by conflict probes, different content in
`text/plain` and `text/html`):
- **HTML first, the text ignored**: WorkFlowy, Logseq, Logseq DB, Tine, Roam, Tana (its classifiers
  score HTML 60–105, Markdown 50), RemNote, Dynalist, SiYuan, the Obsidian apps, SilverBullet. Even a bare
  `<p>u</p>` beats a Markdown list in the text in 12 apps: **no app checks that HTML has structure
  before preferring it**, which is how VS Code's picture of the source wins.
- **Markdown first, HTML when the text isn't Markdown**: BlockNote (`pasteBehavior`'s default).
- **Text only**: Athens, Emacs.
- **Obsidian's mark** before the list: the text wins in Obsidian and true-outliner (by design), and in
  Logseq and Logseq DB by accident: **Logseq ignores any HTML that starts with a comment** and falls
  back to the text, while a trailing comment is pasted as literal text.

**Markdown copied from a code editor** (VS Code's HTML: a `white-space: pre` `<div>` of a `<div>` of
coloured `<span>`s per line):
- structure kept: Logseq, Logseq DB, Tine (their HTML→Markdown gives the `- x` lines back), SiYuan,
  BlockNote (Markdown first), WorkFlowy, Athens (text only);
- markers kept as text (`- - x`, `# a h`): Roam, RemNote, Dynalist;
- lines glued: Tana (`a- x- y`);
- escaped: SilverBullet's converter turns it into `\- x`, `\# h` (destroyed); Obsidian keeps it as a
  loose list.

So HTML that is a picture of text must not win over the text.

**Whitespace between tags changes results.** commonmark's HTML has line breaks between elements, a
browser copy none, Obsidian's own copy some. Logseq DB nests every item under the one before when line
breaks separate them; Dynalist pastes *nothing* for `<h1>h</h1>⏎<p>p</p>` and keeps a trailing space
after `x`; RemNote bullets one way and not the other. An HTML reader must drop inter-element whitespace
as layout does.

What follows:
- **HTML is the common path, and for a page copy the only one.**
- **Two architectures**: *HTML → Markdown → the Markdown paste* (Logseq, Logseq DB, Tine, SiYuan,
  Obsidian, SilverBullet): one placement code, the paths agree by construction. *HTML → the app's nodes
  directly* (Roam, WorkFlowy, Dynalist, Tana, RemNote, BlockNote): the two paths often disagree within
  one app (Tana's list goes elsewhere; Dynalist reads no Markdown). *Text only*: Athens.
- **The Markdown path's quality varies**: SiYuan, BlockNote, true-outliner, WorkFlowy read full
  Markdown; Logseq and Tine only bullet and heading lines; Dynalist, Athens and Roam read markers as
  text. Only the full-Markdown readers are a model for ourus.

**The format choice in the apps' code:**
- **BlockNote** takes the first of `vscode-editor-data`, `blocknote/html`, `text/markdown`, `text/html`,
  `text/plain`, files; inside a code block, plain text always. `vscode-editor-data` → a code block in VS
  Code's language mode (Markdown from VS Code pastes as a `markdown` code block). With
  `prioritizeMarkdownOverHTML` (the default), `text/plain` is pasted as Markdown, whatever the HTML, if
  any of 13 regexes matches: an ATX heading then a blank line; emphasis pairs (`_ __ * ** ~~ == ++`); a
  link `[t](http…)`; inline code; **two consecutive `-` lines; two consecutive numbered lines**; a `--`
  rule between blank lines; a fence pair (```` ``` ````, `~~~`, `$$`); a setext heading then a blank
  line; a quote; a table row and its delimiter. One `- x` line alone isn't Markdown to it.
- **Obsidian** (`handleDataTransfer`): (1) HTML containing `<!-- obsidian -->` with `text/plain`: the
  text; (2) `text/markdown`; (3) HTML if `autoConvertHtml` (default on): `htmlToMarkdown`, base64 images
  over 1,000 characters saved as attachments; (4) `text/uri-list` with a different `text/plain`: a link.
  No code-editor check (hence VS Code's loose list). Its copy writes `text/plain`, `text/markdown`, the
  marked HTML, and for tables `obsidian/table` (JSON).
- **Tana** maps classifiers to formats (`tana-html`, `tana-markdown` → `text/markdown`,
  `rich-plaintext`, `tana-paste` → `text/tana-paste`), capped (5 MB HTML, 500k Markdown, 100k Tana
  Paste); reads `text/markdown` and `text/x-markdown`.
- **Logseq**'s HTML→Markdown strips `<!--StartFragment-->`/`<!--EndFragment-->` and reads **inline
  styles as formatting** (`font-weight` 600–1000 or `bold`, italic, underline, line-through,
  `background-color: yellow` → highlight), skipping an element styled `font-weight: normal` (Docs'
  wrapper, though Docs writes it without the space, so the skip misses). Its blocks test is one regex,
  `/^\s*(?:[-+*]|#+)\s+/m` (Org: `/^\s*\*+\s+/m`): hence `1. x` from text is never blocks. It finds its
  own copy by `navigator.clipboard.read()` for `web application/logseq`.
- **Who reads what** (every cached bundle grepped): `text/markdown` on paste: BlockNote, Tana, Obsidian
  only. `vscode-editor-data`: BlockNote only. `mso-list`: WorkFlowy, Dynalist. `docs-internal-guid`: none.

### 2.3 Placement

Read from H (structure from HTML; Athens's H rows are its reading of flat `innerText`) and from M
where an app reads Markdown. Counts over the 12 block and free-form apps, Obsidian's setups once,
true-outliner apart.

| where | camps | ourus before |
| --- | --- | --- |
| **mid-text** `- a┃b`, a list | **after the block, unsplit, `b` stays**: Logseq, Logseq DB, Tine, true-outliner, SiYuan, Tana, Roam, Athens (8) · **opened at the caret**, each its way: BlockNote (both seams), Dynalist from HTML (`a` / `x` / `y┃b`: the last joins), RemNote (first joins, `b` stays in it, rest after), WorkFlowy (split, first joins, `b` alone after) | split (WorkFlowy's) |
| **end** `- a┃` | **after**: the 8, Dynalist from HTML · **first joins**: BlockNote, WorkFlowy, RemNote · Tana from HTML: at the end of the parent's children | after |
| **end, with children** | **first children**: Logseq, Logseq DB, true-outliner, Roam, Athens · **after the children**: SiYuan, Tine, WorkFlowy, Dynalist, Tana | first children |
| **empty item** | **filled**: everyone but Tana and Dynalist from HTML (pasted after) | filled |
| **start** `- ┃ab` | **before**: Roam, SiYuan, WorkFlowy (and the text editors) · **after**: Logseq, Logseq DB, Tine, Tana, Athens · true-outliner before for lists, after for a heading or a paragraph's list · RemNote joins the first into `ab`'s start, BlockNote opens both seams, Dynalist opens the seam | before |
| **caret after** | **end of the last pasted**: all but three · Roam: end of the first · Athens: start of the first · RemNote: after the first's pasted text | end of last |

Per content:
- **One item** (`<ul><li>x`, `- x⏎`): **inline**: BlockNote, RemNote, Roam, WorkFlowy. **A block**:
  Logseq, Logseq DB, SiYuan, Tana, Tine, Dynalist, Athens from text. It follows seams (closed: a node;
  open: joined), but for Roam, which inlines a one-block HTML paste under closed seams and pastes a
  one-line Markdown block raw, marker and all.
- **Plain lines** (`x⏎y`): **into the block**: Logseq, Logseq DB, BlockNote, SiYuan (Tine from text).
  **A block each**: Dynalist, WorkFlowy, Tana, Roam, Athens, RemNote, Tine from HTML. Tana from HTML
  glues them (`axy`).
- **Two paragraphs**: blocks for everyone but BlockNote and SiYuan, which keep paragraphs in an item.
- **A heading and a paragraph**: **a heading block** (`#` kept): Logseq, Logseq DB, Tine, Roam, SiYuan,
  true-outliner, Tana from text. **The title joined, `#` dropped**: BlockNote, Dynalist, WorkFlowy and
  Tana from HTML. RemNote joins it and makes the joined rem a heading.
- **A paragraph and its list**: **siblings**: Logseq, Logseq DB, Tine, WorkFlowy, BlockNote. **Under the
  paragraph**: Roam, true-outliner, Dynalist, Tana and RemNote from HTML, SiYuan (in the item).
- **Ordered list** from HTML: **bullets**: Logseq, Logseq DB, Tine, SiYuan, Tana, Dynalist, WorkFlowy,
  Roam, Athens (9). **Numbered**: RemNote, BlockNote, true-outliner. From text: Logseq and Tine don't
  read `1. x` as blocks; WorkFlowy and RemNote keep it numbered.
- **Code** from `<pre><code class="language-js">`: **a code block**: Logseq DB, Tine (language lost),
  Tana, Roam (`javascript`), RemNote, BlockNote. Inline code: SiYuan. **Text**: Athens, WorkFlowy,
  Dynalist. Logseq OG glues the fence to the block's text.
- **A quote** from HTML: **text joined** (`>` gone): Athens, BlockNote, Dynalist, RemNote, Tana,
  WorkFlowy. **A quote block**: Roam, SiYuan, Tine; Logseq splits `>` and `q` into two blocks.
- **Tasks** from HTML: the checkbox lost nearly everywhere (`<input>` has no text); BlockNote and the
  Obsidian converters keep it. From text: kept by Logseq, Logseq DB, Tine, true-outliner, BlockNote,
  WorkFlowy, RemNote.
- **Inline formatting** from HTML: converted to Markdown by Logseq, Logseq DB, Dynalist, Roam, the
  Obsidian apps, SilverBullet (Tana: bold, not the link); held as formatting by the rich-text apps.
- **The clipboard's final line break**: BlockNote and SiYuan drop it; Logseq, Logseq DB and Tine keep it
  as a line break (as ourus: Paste51's rule); WorkFlowy, Dynalist and RemNote make an empty node.

**The camps are one question, seams**: does the paste open the text at the caret (seams *open*: its
first and last text join the text before and after the caret, as ProseMirror's slice fitting does) or
is it a run of whole nodes between nodes, the node at the caret untouched (*closed*)? Closed: Logseq,
Logseq DB, Tine, true-outliner, SiYuan, Roam, Athens, Tana: 8 of 12, and every Markdown-file outliner.
Open: BlockNote, RemNote, WorkFlowy, Dynalist, each its own way. 13-align §11 proposed the axis from
theory ("joining as seams"); the data backs it, and *closed* as the default. ourus's old defaults were
a mix (`MidText: split` WorkFlowy's open seam, `AtEnd: after` the closed camp's).

**Free-form targets** (`p┃q`, `p┃`, `# h┃`, `> q┃`): SiYuan keeps the paragraph whole and pastes after
(closed, as on items); BlockNote opens both seams (`px` / `- y┃q`); RemNote joins the first line;
true-outliner pastes after, and in a quote puts the list *after* the quote, where ourus puts it in (one
witness). The camps hold off lists too.

**The second key with HTML** (Ctrl+Shift+V, M and H): **no app takes structure from the HTML**; all
read `text/plain`. Logseq, Logseq DB, Tine, Roam, Athens insert Markdown verbatim; Tana, WorkFlowy,
Dynalist, RemNote still make a node per line (§2.7); BlockNote still reads Markdown; SiYuan flattens
(`axy`). Plain paste needs no HTML.

**Undo**: every app takes a structured paste back in one step, text exactly restored; only the caret
differs (Athens, RemNote, Tana leave none in the text; SiYuan moves it).

**Reproducibility**: the matrix's 60 HTML probes rerun three hours later on every app, 898 of 900
identical (the two: carets after a pasted code block, Logseq DB's README bug 7 and Tana's code editor
taking focus or not).

### 2.4 The options the data supports

The user asked for a table per app with the option values that match it, and whether more options
than seams make sense. Counts are over the apps the option applies to (placement options under closed
seams: Logseq, Logseq DB, Tine, Roam, Athens, Tana, SiYuan, true-outliner). **Bold**: the majority.
What was built (§3) is in the last column.

| option (replaces) | values, with the apps | split | outcome |
| --- | --- | --- | --- |
| `pasteHtml` (new) | **`convert`**: HTML first, converted, then the Markdown path (12 apps) · `markdown-first`: `text/plain` when it looks like Markdown (BlockNote) · `ignore` (Athens; Obsidian with `autoConvertHtml` off) | 12–1–1 | not an option: `convert` fixed |
| `pasteSeams` (`MidText`, `AtEnd`) | **`closed`** (the 8) · `open`: first pasted text joins the text before the caret, the last the text after (BlockNote; WorkFlowy, RemNote, Dynalist variants) | 8–4 | built |
| `pasteAtTextStart` (new) | **`after`** (Logseq, Logseq DB, Tine, Tana, Athens) · `before` (Roam, SiYuan; WorkFlowy though open elsewhere; old ourus) | 5–2, true-outliner mixed | built |
| `pasteOnParent` (`OnParent`) | **`children`**: first children (Logseq, Logseq DB, Roam, Athens, true-outliner) · `after` (Tine, Tana, SiYuan; WorkFlowy, Dynalist, RemNote, whose open seams don't join an item with children) | 5–3 (5–6 overall) | built |
| `pasteLines` (`Lines`) | **`text`**: plain lines into the text (Logseq, Logseq DB, Tine from text, SiYuan; BlockNote) · `items` (Roam, Athens, Tana; WorkFlowy, Dynalist, RemNote) | 4–3 (5–6) | built |
| `pasteParagraphList` (`ParagraphList`) | `siblings` (Logseq, Logseq DB, Tine; WorkFlowy, BlockNote) · `children` (Roam, Athens, true-outliner, SiYuan; Dynalist; Tana and RemNote from HTML) | 3–4 (5–6) | built, default `siblings` (Logseq's) though the minority; `children` is what outliners' HTML means (Tana's copy) |
| `pasteListForm` (`ListForm`) | **`destination`**: items take the list's form (from HTML: 9 apps) · `own`: a list keeps its form (BlockNote, RemNote, true-outliner; a move's semantics) | 9–3 | built; old `literal`/`drop` described the clipboard (apps that can't read `1.` from text keep it as text); `text` had no app |
| `pasteCaret` (15-spec §3.13) | **`last`** · `first` (Roam: its end; Athens: its start; RemNote: after its joined text) | 10–3 | dropped (the user: simpler) |

**Not options**: an empty item filled (consensus); a heading line a node (follows from closed seams;
the joining apps all lose the `#` or the paragraph's kind, which rule 1 forbids); one block (follows
seams); the code block at an item's end (model C's question: into the item's body as ourus and SiYuan,
or a node after as Logseq DB); undo (one step everywhere); Tana's list at the parent's end and
Dynalist's "only the last text joins" (one app each, read as bugs); indentation as nesting, and every
line a block, for Markdown text (CommonMark says otherwise; the outliners' HTML carries their intent).
Kept: one line inline; a line copied with its line break, two lines; a selection replaced (the apps
that keep it do so only for blocks: their mechanics).

**Interactions**: `pasteAtTextStart`, `pasteOnParent`, `pasteParagraphList` apply under closed seams
(open seams split at the caret; the node's children follow the last pasted node; a paragraph's list
after a joined first text is siblings by construction). The others are independent.

**Each app under the options** (every cell from the raw runs by a classifier per deciding probe,
separately for text and HTML, cross-checked on paste.md's Paste14, 27, 42, 59, Paste36–38, Paste26;
"unmodeled" is what no value reproduces, quirks and bugs the SxS should show rather than declare away):

| app | `Html` | `Seams` | `AtTextStart` | `OnParent` | `Lines` | `ParagraphList` | `ListForm` | `Caret` | unmodeled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Logseq | convert | closed | after | children | text | siblings | HTML: destination; text: no list (`1.` lines into the block) | last | HTML starting with a comment ignored, a trailing one pasted as text; `*` lists from text kept as text; a heading's paragraph after a blank line; a quote from HTML split in two; Docs' wrapper as `**`; a `<pre>` glued to the block |
| Logseq DB | convert | closed | after | children | text | siblings | as Logseq | last | as Logseq; HTML with line breaks between items nests each item |
| Tine | convert | closed | after | after | text: text / HTML: items | siblings | as Logseq | last | Docs' wrapper as `**` |
| Roam | convert | closed | before | children | items | children | HTML: destination; text: `1.` kept as text | first (its end) | one block from HTML inline, from text raw (`a- x⏎`); a GitHub `<pre>` a `plain text` block, its fence glued |
| Athens | ignore | closed | after | children | items | children | `1.` kept as text | first (its start) | `---` loses a dash; markers other than `- ` kept as text |
| WorkFlowy | convert | open: the first text joins (the item taking the pasted first item's form: a numbered list makes it numbered), the text after the caret a node after the paste; no join on an item with children or at a text's start; one block always inline | before | after | items | siblings | HTML: destination; text: own | last | fenced code turns the item into code; an unclosed fence's line pasted twice |
| Dynalist | convert; no Markdown from text | open, last only: the first doesn't join, the last joins the text after the caret | (open: an empty node, then the last joins `ab`) | after | items | children | HTML: destination; text: `1.` kept | last | no Markdown from text; `<h1>`⏎`<p>` pastes nothing |
| Tana | convert | closed | after | after | text: items / HTML: glued (`<br>` lost) | text: siblings / HTML: children | destination | last | a list from HTML at the end of the parent's children, an empty node unfilled; one `- x` line kept as text |
| RemNote (both) | convert | open: the first text joins (the rem taking its form, its children first among the rem's), the text after the caret stays with it, the rest after | (open: the first joins `ab`) | after | items | text: siblings / HTML: children | own | first (after its joined text) | fenced code at a rem's end replaces the rem's text; a joined heading makes the rem a heading |
| SiYuan | convert | closed | before | after (items), children (a heading) | text | children (in the item) | destination | last (the first at a text's start) | `<pre>` from HTML as inline code; Docs' HTML pastes nothing; lines into a heading glued |
| BlockNote | markdown-first | open (both) | (open) | (open: children follow the last) | text | siblings | own | last | fenced code into a block with text flattened; renumbers a run after its items from 1 |
| true-outliner | convert (Obsidian's) | closed | before for lists, after for a heading or a paragraph's list | children | text | children | own | last | one line pasted as text; a list in a quote goes after the quote |
| Obsidian, Live Preview, Outliner, SilverBullet, Emacs | text editors: insert the text (Obsidian, SilverBullet convert HTML first) | | | | | | | | the host leaves Ctrl-V to its editor |
| **ourus before** | (text only) | split mid-text, after at the end | before | children | text | siblings | `text` | last | the first-line-deepest copy read as code (§2.6) |
| **defaults built** | convert | closed | after | children | text | siblings | destination | (last) | |

Logseq and Logseq DB match the defaults on every option. The table as a model (a simulator fed each
app's values, predicting every list-shaped matrix probe block by block, of 35 per clipboard):

| app | text (M), ignoring caret / exact | HTML (H) | the misses |
| --- | --- | --- | --- |
| Logseq, Logseq DB, Tine | 30, 30 | **35, 35** | `1.` lists from text |
| Roam | 30, 30 | **35, 35** | one item from text pasted raw |
| Athens | **35, 35** | 30, 31 | one line of `innerText` inline (the model's error) |
| WorkFlowy | 29 / **35** | 29 / **35** | the caret only |
| RemNote with bullets | **35, 35** | **35, 35** | |
| RemNote without bullets | 14 | 23 | the projection of bullet-less rems |
| BlockNote | 32 | 32 | paragraphs: the projection of its paragraph blocks |
| SiYuan | 23, 26 | 23, 26 | a paragraph into the item's body; paragraphs kept in the item |
| Tana | 30 | 18 | one `- x` line as text; HTML list at the parent's end; `<br>` lost |
| true-outliner | 27 | 27 | one line as text; lists before the node at a text's start |
| Dynalist | 0 | 20 | no Markdown from text; paragraphs and lines from HTML |

So the options reproduce the closed camp, RemNote and WorkFlowy exactly where the app's format reading
is sound; every miss is an "unmodeled" entry or a projection artifact.

### 2.5 paste.md's discrepancies, read again

paste.md replayed on every app as M (its Markdown alone) and H (each case's HTML compacted, its
`innerText` as text; 76 of 95 cases have HTML), beside the recorded X:

| class | runs | meaning |
| --- | ---: | --- |
| agrees under X and M | 282 | |
| disagrees under X only | 28 | the HTML misled: Logseq DB 11 (whitespace nesting), Tana 6 (list to the parent's end), WorkFlowy 6 (code from `<pre>`), true-outliner 4, BlockNote 1 |
| disagrees under M only | 71 | the app reads Markdown worse than HTML: Logseq, Tine, Roam, WorkFlowy on `1.` lists, Dynalist on everything, RemNote and Tana on fenced code |
| disagrees under both | 652 | real behavior (272 the same result under both) |

H = X for the HTML-first apps (Logseq 42/42, Obsidian apps 50/50, WorkFlowy 44/45), but Logseq DB's
whitespace bug (28) and Athens (34, it reads text); SiYuan and BlockNote give H = M. So **the mixed
clipboard is not why paste.md disagreed** (28 of ~750 go with an honest clipboard, 71 appear), but it
compared the wrong behaviors: cases must say which copy they mean.

The edge cases, by question (from M; block apps, SiYuan, BlockNote, true-outliner):
- **A fenced block at an item's or paragraph's end** (Paste1, 25, 62, 70): no two camps agree. Into the
  item's body (ourus, SiYuan); a new block after (Logseq DB); glued to the text, a fence after `a`
  opening nothing (Logseq, Tine, true-outliner, Dynalist); a block per line (Tana, Athens, Dynalist);
  flattened into the paragraph (BlockNote); the whole block turned into code with its text (WorkFlowy:
  `Run make buildthen deploy.`); the block's text and the code lost (RemNote). Model C's question.
- **A fenced block on an empty item** (Paste9, 11, 52, 74): the code block takes the item's place
  (Logseq, Logseq DB, Tine, SiYuan, WorkFlowy, RemNote, ourus): consensus.
- **A heading at a paragraph's end** (Paste32–35, 61): a node (Logseq, Logseq DB, Tine, Tana, Athens,
  ourus); title joined, `#` dropped (BlockNote, SiYuan); joined *and the paragraph made a heading*
  (RemNote, WorkFlowy: `# parah`); glued as text (Dynalist, Roam, true-outliner). Decision 7 kept.
- **A setext heading** (Paste53): no app reads `Title⏎=====` as a heading from text. Keep ourus's
  reading (it is Markdown) but not as evidence.
- **Ordered lists** (Paste13–18, 63): from text Logseq, Tine, Roam, WorkFlowy don't read `1. x` as a
  list; SiYuan and Tana make bullets; RemNote and WorkFlowy (joining) make the block numbered; BlockNote
  numbers the run anew. Only SiYuan matched ourus's old `text` form: the apps are no guide.
- **A list on an item with children** (Paste14, 27, 42, 43, 59): the clean 5–5 split; each consistent.
- **A list at the end of a paragraph that owns a list** (Paste20, 21): first in its list (Logseq,
  Logseq DB, Roam, Athens, SiYuan, true-outliner, ourus); after the list (WorkFlowy); joined (RemNote,
  BlockNote).
- **A paragraph and its list mid-text** (Paste36–38): after the item unsplit (Logseq, Logseq DB, Tine,
  Roam, Athens, true-outliner); split (WorkFlowy); open (BlockNote, RemNote). Seams again.
- **One list line** (Paste26, `- x`): a new item (Logseq, Logseq DB, Tine, SiYuan, ourus); joined
  (BlockNote, WorkFlowy, RemNote); marker kept as text (Tana, Roam, Dynalist).
- **One line that looks like a list** (Paste31, `1. Introduction`, no line break): inline as is (8 apps,
  ourus); number dropped (BlockNote, RemNote); a new block (SiYuan); block made numbered (WorkFlowy).
- **A line copied with its line break** (Paste51): kept (Logseq, Logseq DB, Tine, Roam, ourus); dropped
  (BlockNote, SiYuan, WorkFlowy, RemNote).
- **Over a selection** (Paste48, 49): blocks pasted over a selection leave the text in Logseq, Logseq DB,
  Tine, Tana, Athens, Roam (blocks added after); lines replace it. ourus replaces in both.
- **Lines into a heading** (Paste54): SiYuan glues (`Helxy`), BlockNote and RemNote split the heading;
  ourus puts them after it.
- **An item with body paragraphs** (Paste90b): one item with its body (BlockNote, SiYuan, true-outliner,
  WorkFlowy joining); the body as children (Athens, Tine); flattened to siblings (Roam, Tana); the
  paragraphs in its block (Logseq). Old ourus joined `x` into `a`: open seams by accident.
- **Frontmatter** (Paste58): nobody treats it specially.

### 2.6 Reading text and HTML from outliners and the web

**ourus's old reading of the apps' `text/plain`** (at `- a┃` / `- b`): right for Logseq, Tine,
Obsidian (tabs), Roam, Athens (4 spaces), SiYuan (loose), BlockNote (`*`, the nested list keeping `*`).
Tana's `x⏎- y⏎z`: `y` a *sibling* of `x`, `z` a lazy continuation of `y`; WorkFlowy, Dynalist, RemNote:
the lines into `a`'s text (nothing to read). So ourus round-trips the Markdown outliners already and
needs the HTML for the other four. Tana's HTML (`<p>x</p><ul><li>y</li></ul><p>z</p>`) says what its
text doesn't: in outliner HTML **a paragraph followed by a list means the list is its children**
(`pasteParagraphList: children`), right for that source and wrong for a Markdown paragraph.

**Indentation dialects and partial copies** (each app's text shape as Markdown, at an end and a nested
item):
- Tabs, 4 spaces, a loose list: read right by every Markdown reader; at a nested target the paste takes
  the target's depth everywhere.
- `*` bullets: **Logseq and Logseq DB keep `* x` as text** (escaping the last, `\* z`), though their
  regex accepts `*`.
- Tana's shape: Roam, Athens, true-outliner make `y` a child of `x`, `z` a new sibling (a line-based
  reader: every line a block). ourus (CommonMark) folds `z` into `y`, which no outliner user expects.
- RemNote's shape (indented, no markers): Roam, Athens, Dynalist, RemNote **nest by indentation**; Tana
  flat nodes; the Markdown readers keep one block's text.
- A selection starting mid-block (`ond half⏎- next⏎  - kid`): the list under the partial paragraph in
  Roam, Athens, true-outliner, SiYuan; siblings in Logseq, Logseq DB, Tana, ourus; the open-seam apps
  join `ond half` into the text, which is what a partial first block asks for.
- **A copy whose first line is the deepest** (`    - y1⏎  - y2⏎- z`): **ourus read `    - y1` as
  indented code**, CommonMark-correct for the text, wrong for the copy. Every app but Tana reads items
  (Logseq, Logseq DB, Tine, Athens, BlockNote, RemNote flatten to siblings, Roam and WorkFlowy nest by
  indentation; Tana's `marked` makes ourus's code block). Still open: `clipboardSource` should read a
  first list line indented four or more columns as an item where later lines are shallower items.
- Both line-based habits (indentation without markers as nesting; a line after an item as a new block)
  are CommonMark's no; reading the outliners' HTML avoids both, and for their text CommonMark is the
  safe default.

**Real-world HTML** (each page's markup as known, not captured live; the clipboard passes through
Chromium's parser, which turns Word's `<![if !supportLists]>` into a comment), with `innerText`:
- **GitHub** (an `h2` in `div.markdown-heading` with a permalink `<a class="anchor">` holding an SVG; a
  nested list; `<pre>` without `<code>` in `div.highlight-source-shell` beside a copy button; a task
  list): the permalink an empty link `[](…#setup)` in Logseq, Logseq DB, SilverBullet, Dynalist,
  Obsidian, true-outliner; the language read from `highlight-source-shell` only by Obsidian; the
  checkboxes kept by BlockNote, Obsidian, SilverBullet, true-outliner; Roam's code block `plain text`,
  its closing fence glued.
- **Google Docs** (`<b style="font-weight:normal;" id="docs-internal-guid-…">`; the nested list a `<ul>`
  in the `<ul>`, levels in `aria-level`; bold a `font-weight:700` span): **Logseq, Logseq DB, Tine,
  Obsidian, SilverBullet, true-outliner wrap the whole paste in a stray `**`**; **SiYuan pastes
  nothing**; nesting kept by RemNote, BlockNote, WorkFlowy, Tana, Dynalist, Roam; the span's bold kept by
  Logseq, Logseq DB, Roam.
- **Word** (`MsoListParagraph`, `mso-list:l0 level2`, the bullet glyph in a `mso-list:Ignore` span):
  **only SiYuan makes a nested list** (Lute knows `mso-list`); WorkFlowy and Dynalist name `mso-list` but
  paste the glyphs too; everyone else pastes `·       Bold start`; Logseq and Logseq DB also the
  conditional comments as text.
- **An LLM's rendered answer** (a loose ordered list with a nested list; a `<pre>` also holding the
  label `javascript` and a "Copy code" button): **only SiYuan and RemNote extract the code alone**
  (SiYuan with its language); the label and button land *in* the code (Roam, Logseq, Logseq DB, Tana:
  `javascriptCopy codelet a = 1;`) or around it; the list stays ordered in RemNote, BlockNote, Roam,
  SiYuan, Obsidian, SilverBullet, true-outliner.

**Off-the-shelf converters** on 18 fixtures (the browser's copy, commonmark's, each app's copy, tables,
quotes, checkboxes, `<br>`, a start number, inline) plus the dialects and VS Code's:

| fixture | turndown 7.2 + gfm (SilverBullet's) | rehype-remark 10 + remark-gfm |
| --- | --- | --- |
| browser, commonmark, Dynalist, Roam, code, table, tasks, `<br>`, quote, start number, inline | right (`-   x`) | right |
| Obsidian's, SiYuan's (a comment first) | right | the comment kept in the Markdown |
| Logseq's (`<ul>` in `<ul>`, the XSLT notice) | nesting lost, items loose | the notice an item, `- - y` |
| RemNote's (`<div>` items) | no list, `**` escaped | a list, `z` folded into `y` |
| Tana's (`<p>`, `<ul>`, `<p>`) | paragraph, list, paragraph (stray spaces) | the same |
| WorkFlowy's, BlockNote's (blocks in `<li>`) | a loose list | a loose list |
| GitHub | the anchor an empty link; language from the class | the anchor too; no language |
| Google Docs | `**` around everything, nested items split off | broken |
| Word | glyphs as text, `<style>` as a comment | glyphs, conditional comments kept |
| LLM answer | label and button as paragraphs, code inline | label and button inside the code |
| VS Code | escaped `\- x` | escaped |

**No library handles where people actually copy from**: both are fine on clean HTML and wrong on the
outliners' copies, Docs, Word, the LLM code block, VS Code. Hence ourus's own converter (§3.2).

### 2.7 Plain paste in the apps

Twelve probe shapes beyond the spec's (blank lines, children, indented and tabbed lines, empty and
nested items, markers, a selection) on every block app, and their bundles read. Two camps:
- **Into the block**: Logseq, Logseq DB, Tine, Roam, Athens; SiYuan and BlockNote where the clipboard
  has no Markdown or blank lines. ourus agreed but for whitespace: they keep a continuation line's
  indentation and the spaces at a final break.
- **A block per line**: WorkFlowy, Dynalist, Tana, RemNote. Not Enter's breaks: they read the lines as
  an outline (indentation nests; WorkFlowy and Tana strip a bullet's marker), as their Ctrl-V does.
  **None has a plain paste that keeps lines in an ordinary block** (the user asked to check):
  - Tana: "keep text in this node" only without a line break (`"plaintext-inline": !r && s`);
  - WorkFlowy: lines stay text only in a note, code or quote block (`multiline`,
    `WF.GuiPaste.intoContent`);
  - Dynalist: `onPaste` imports plain text as nodes whatever the key; a note or the title takes it as is;
  - RemNote: "Paste as Single Bullet" (Ctrl+Shift+Alt+V) does, but only the desktop app sends it
    (Electron IPC); dispatched by hand it agreed with ourus on 7 of 12. The driver keeps Ctrl+Shift+V
    (the user: no emulation, a quirk noted).
- **Their two keys** (from their code, confirmed by §2.3's second-key probes): for a plain-text clipboard
  Ctrl-V and Ctrl-Shift-V give the same structure; the key decides formatting only. Dynalist's `onPaste`
  never reads Shift (Ctrl-Shift-V is the browser's paste-and-match-style, dropping HTML; plain text
  always `import_plaintext`); WorkFlowy one handler, the key only deciding whether HTML arrives; Tana's
  "cleanpaste" drops the HTML; RemNote's "Paste Without Formatting" (`forcePasteAsPlainText`) still makes
  a rem per line.
- Where they differ: the text after the caret (WorkFlowy always a node of its own; Dynalist Enter's
  split, the last line joining the rest; Tana after the node, no split; RemNote the first line inline,
  the rest after, the text after the caret staying); blank lines dropped (WorkFlowy, Tana) or empty nodes
  (Dynalist, RemNote); `# x` stays text in Dynalist and Tana, Dynalist keeps `- x`.
- SiYuan glues pasted lines that look like Markdown (`axy`); BlockNote splits at a blank line. Recorded
  in `sxs/{tana,workflowy,dynalist,remnote}/README.md`. The outcome is `pastePlainLines` (§4).

### 2.8 Copy and cut in the apps

14 apps, `one two` with a child `kid` then `three`; Ctrl-C and Ctrl-X from a caret alone, a selection in
one block, Shift+Down from mid-text, Escape then Shift+Down; every format recorded, the document read
after a cut.

| shape | what the apps do |
| --- | --- |
| a caret alone | nothing (Roam, Athens, WorkFlowy, Dynalist, BlockNote); a block reference on copy, nothing on cut (Logseq, Logseq DB, Tine, RemNote); the node (Tana: with its children, cut takes the subtree; SiYuan: its text, the empty item left); the line (Obsidian, true-outliner, SilverBullet: CodeMirror's, the cut leaving the child behind) |
| a selection in one block | the text, everywhere (some add HTML or their own format) |
| across blocks | whole blocks with their subtrees (Logseq, Logseq DB, Tine, Athens, Tana, Dynalist, RemNote, true-outliner, most making it a block selection first); the text range (BlockNote, Obsidian, SilverBullet); Roam, WorkFlowy, SiYuan didn't cross the block |
| formats | Markdown as text in the Logseq family (tabs), Roam, Athens, RemNote (4 spaces), Obsidian, SiYuan (loose), BlockNote (`*`); not in Tana and Dynalist; `text/markdown` only Obsidian's; a private format almost everywhere |

From copy.md in the SxS: in one block's text every app agrees (Copy1, Cut1) but BlockNote (a line break
after the phrase) and SiYuan (can't hold `**b**` as text); across nodes the text editors copy the raw
range, prefixes and all (`two⏎→- ki`, `b⏎> c`), where ourus leaves out what holds it; Tana's text isn't
Markdown (`kid⏎- g`) and its cut's text lacks the children it cut; SiYuan copies a block's text alone
and its cut leaves the empty item. Escape selects no block for a copy on Dynalist, WorkFlowy, BlockNote,
RemNote (their cut takes nothing).

### 2.9 Bugs found in the apps

New unless marked *known* (with the README it was in):

| app | bug | where seen |
| --- | --- | --- |
| Logseq DB | *known* (README bug 1), new consequence: an HTML list with line breaks between elements pastes each item nested under the one before; Obsidian's copy is such HTML, so a list from Obsidian comes out a staircase | X `flat`, `nest`, `ol` |
| Dynalist | **`<h1>h</h1>⏎<p>p</p>` pastes nothing**; without the line break `ah` / `p` | X `headp` |
| Dynalist | an HTML item with whitespace after its text keeps a trailing space | X `nest` |
| Logseq, Logseq DB (copy) | the copied HTML nests a child `<ul>` as a sibling of its `<li>`; from an XSLT export, so Chromium injects its deprecation notice, which another app pastes as a block (*known* for the notice) | §2.1 |
| Logseq OG | a `<pre><code>` from HTML glued to the block's text (`a```⏎let a⏎```) | H `code` |
| Logseq, Logseq DB | a `<blockquote>` becomes two blocks, `>` and `q` | H `quote` |
| Logseq DB, Tine | `<pre><code class="language-js">` loses its language (*known* for DB, bug 4) | H `code` |
| SiYuan | a `<pre><code>` becomes inline code (Lute) | H `code` |
| Tana | `<p>x<br>y</p>` loses the `<br>`: `axy` | H `lines` |
| Tana | an HTML list appended at the end of the parent's children, an empty node not filled (*known* as behavior; reads as a bug beside its Markdown path) | H `flat`, … |
| RemNote (both) | **fenced code from text at the end of a rem with text replaces the rem's text** (`- a┃` + a fence: code `let q = 1;` where `a` was; `Run ┃then deploy.` loses its text); the info string becomes the code's first line; a one-line body naming a language becomes the language, the code empty; the next rem lands under a new empty rem. Checked in the page's DOM | M Paste1, 25, 62, 70 |
| WorkFlowy | a fenced block mid-text or at the end turns the whole item into code holding its text and the code | M Paste1, 25, 62, 70 |
| WorkFlowy | `x⏎```⏎y` (unclosed) at a text's end pastes `y` twice | M Paste93 |
| BlockNote | a fenced block into a block with text flattened into the paragraph, fences gone | M Paste1, 25, 62 |
| Athens | `---` loses a dash (its line reading takes `- ` for a marker); the second `---` nests under `title: x` | M Paste58 |
| SiYuan | lines pasted into a heading glued (`# Helxy┃lo`) | M Paste54 |
| Tana | one list line (`- x`) keeps its marker (its classifier needs two lines); the same for `- y` after a plain line | M Paste26, 36 |
| Tana | a heading, paragraph and list from text go to the end of the parent's children, an empty node among them | M Paste57 |
| SilverBullet | Markdown copied from VS Code converted from the HTML and escaped (`\- x`) | VS Code |
| Tana | the same clipboard glued into one node (`a- x- y`) | VS Code |
| SiYuan | Google Docs HTML pastes nothing | Docs |
| Logseq, Logseq DB, Tine, Obsidian, SilverBullet, true-outliner | Docs HTML wrapped in stray `**` | Docs |
| Logseq, Logseq DB | Word's conditional comments pasted as text (partly the harness's re-serialization) | Word |
| Roam, Logseq, Logseq DB, Tana | an LLM's code block keeps its language label and "Copy code" text inside | LLM |
| Logseq, Logseq DB | `*` bullets from text kept as text (`- * x`, `\* z`) | `*` |
| Roam | a GitHub `<pre>` a `plain text` block, its closing fence glued | GitHub |
| Logseq, Logseq DB | HTML starting with a comment ignored for the text; a trailing comment pasted literally | conflict probes |
| nearly all | task checkboxes lost from HTML; only BlockNote and the Obsidian converters keep them | H `tasks` |

## 3. paste

### 3.1 Decisions (the user's, each with its data)

- **A clipboard is the formats it holds**, keyed by MIME type as a `DataTransfer` names them: every copy
  has `text/plain`; a page's adds `text/html` (its text the `innerText`); Logseq's, Roam's and SiYuan's
  HTML beside Markdown text; Obsidian's `text/markdown` too; VS Code's `vscode-editor-data`. The X
  clipboard went: no source makes it.
- **The format order** (16-structured's recommendation, built): `text/markdown`; the text where the HTML
  is marked as a Markdown app's own (SiYuan's `<!--data-siyuan=`, ourus's `<!-- ourus -->`) or is a
  picture of it (`vscode-editor-data`); HTML with structure, converted to Markdown; HTML with inline
  formatting and no structure, converted, a phrase (formatting kept); else the text as Markdown. HTML →
  Markdown → the one Markdown paste (Logseq's, SiYuan's, Obsidian's architecture), not HTML → nodes.
  BlockNote's "the text wherever it looks like Markdown": not taken. A Markdown app's copy without a
  mark (Logseq, Roam): HTML first, until the SxS shows the HTML losing something.
- **`htmlparser2`** as a dependency for now, maybe ourus's own tokenizer later; the converter a pure
  function of the HTML's text, so a GTK host without a DOM can use it.
- **`paste` written anew**, the old kept aside as `paste-old.ts`/`paste-old.md` as the reference, then
  deleted once nothing used it.
- **Placement defaults: Logseq's** (§2.4): closed seams; at a text's start, after; on a node with
  children, first among them; plain lines into the text; a pasted paragraph's list its siblings; pasted
  items take the list's form. `pasteCaret` dropped (the caret ends after the last pasted text).
  ourus's own clipboard follows the same options, no `own` for it (not to complicate): cut and paste can
  change a marker a move would keep.
- **Options come with their second value, never before** (an option that ignores its value misleads).
- **From the SxS, case by case**: an empty item with children is a parent, the paste first among its
  children (Logseq, 7–4); an empty task is filled, its checkbox the first pasted item's, but under
  `enterTask: plain` (a task a marker in its text) the paste goes after it; a pasted paragraph into a
  list is one item, its lines its text (an item per line is `pasteLines: items`).
- **One line pasted into a node's text is ourus's** (the user: `notApplicable` there is wrong): §3.4.
- **The clipboards in the cases carry no final line break** (`|-`, 44 cases) but where the line break
  is the case's (Paste1 plain lines, Paste14 into code, Paste16 the host's paste, one-line clipboards):
  an app's copy of blocks has none, and RemNote and Dynalist pasted it as an empty node, every case
  disagreeing for it. ourus's results unchanged either way.
- **An open fence pasted in an item is closed** (PasteList27; the user: "to keep the document well
  formatted"): open, it is well-formed only while nothing goes under it.
- Over a selection, a paste replaces it (Paste17): six block apps keep the selected text and paste the
  items after the block; SiYuan and the text editors replace. No option.

### 3.2 Reading the clipboard (`paste.ts`, `html.ts`)

- **The command**: `{ type: 'paste', clipboard: Clipboard }`, exported from `src/index.ts`.
- **`clipboardMarkdown`** (spec/paste-conv.md) applies the format order. Cases named by what they
  measure: `PasteConvMD`, `PasteConvHTML`, `PasteConvVSC`, `PasteConvSY` (SiYuan 3.8.6's real copy of
  two items, its DOM base64 in the mark), `PasteConvPhrase`, `PasteConvPhraseInCode`, `PasteConvUS`
  (ourus's mark: Chromium keeps `text/markdown` only between its own pages). VS Code's mark is kept as
  is; without it the HTML wins and converts to escaped text. Its general form, if ever: HTML with no
  structure of its own (paragraphs and lines only) doesn't beat a `text/plain` that reads as Markdown
  structure (the cost: a page paragraph whose words look like Markdown would read as structure).
- **`htmlToMarkdown`** (spec/paste-html.md): whitespace as layout has it; lists however the apps write
  them (`li`, RemNote's `div`s, a list in a list as Logseq's and Docs' copies, Chromium's XSLT notice
  skipped); tasks; code from the `pre`'s `code`, its language from `language-`/`lang-` or
  `highlight-source-` around it (the LLM label and button out); tables, quotes, rules, `<br>`;
  formatting as elements and as styles (Docs' wrapper `b` that isn't bold, `font-weight:700` spans);
  Word's `mso-list` paragraphs (the glyph span dropped); text-less links (permalinks) dropped; comments,
  `<meta>`, `<style>` dropped; text escaped. Every fixture of §2.6 converts.
- **The fragment**: `clipboardSource` (common indentation; a fence copied from inside a list), an
  unclosed fence closed (in its containers, by the parser's `closed`: PasteList26, 27), frontmatter read
  after a blank line; one line without a line break is inline.

### 3.3 Placement (`place.ts`)

- **The slot** (`slotAt`, `endSlot`): under closed seams it depends only on whether the caret is at the
  text's end. In an empty item's place, or a held empty paragraph's (Enter's empty line: Paste24); first
  among a node's children (an item's, an empty item's, a heading's section, a paragraph's list), or
  under `pasteOnParent: after` after an item and its children, last in a heading's deepest last
  sub-section, last in a paragraph's list; else after the node. A blank line: the slot at the end of the
  node above. Code and a block's own lines: plain paste. Markup (a marker, `#`s, a setext underline):
  the host's. An empty document: filled. An Obsidian callout's title is text to paste past its
  `[!type]`, one line as a heading's: nodes and plain lines go first in its body (Paste25). Nodes pasted
  on Shift-Enter's empty last line of a node's text take that line's place, written tight
  (`p⏎- a⏎- b`, Paste26).
- **Fitting**: into a list (`fitToList`) every node is an item or in one: items take the list's form as
  exact markers numbered by the paste (the encoder adopts only from the item before, which may be another
  list's); a paragraph one item (`pasteLines: items`: an item per line), its list after it; a heading an
  item, its section its children; a block into the item before it, or the item at the caret, or among
  the children where the slot is; in an empty item's place code is its text, a quote or a table its
  first block. Outside a list (`fitToBlocks`): as they are; in an item or a quote a paragraph's list
  follows it; a pasted heading splits the section it lands in, taking in what follows up to a heading of
  its level; nodes before the first heading that closes a section stay in the slot, each heading going
  after the sections it closes (Paste22). Only top-level headings and those in their sections split one
  (a heading in a pasted quote or item doesn't: Paste27; in a quote it stays in it: Paste23). Spacing: a
  tight list takes the paste tight; a node's blocks or a list written apart stay so; under a heading,
  apart.
- **The option values** (`config.ts` order: `pasteSeams`, `pasteLines`, `pasteAtTextStart`,
  `pasteOnParent`, `pasteParagraphList`, `pasteListForm`):

| option | second value | what it does | cases | declared by |
| --- | --- | --- | --- | --- |
| `pasteLines` | `items` | an item per line | | Roam, Athens, Dynalist, WorkFlowy |
| `pasteOnParent` | `after` | after the item and its children | | Tine, Tana, SiYuan, Dynalist, WorkFlowy |
| `pasteAtTextStart` | `before` | before the node (an item's list numbered from it); a pasted heading takes in the node it goes before; before a heading after a heading, last in the section above. A quote or table can't be an item before an item: it goes after; code there is an item's text | PasteList20, Paste20 | Roam, SiYuan, WorkFlowy |
| `pasteParagraphList` | `children` | a pasted paragraph made an item holds its list (with `items`, the last line's item); in an item or a quote the list still follows it | PasteList21 | Roam, Athens, SiYuan, Dynalist, true-outliner |
| `pasteListForm` | `own` | items of the other kind keep their markers, a list of their own; into a list of their kind they take its marker (a `*` among `-` would only split it) | PasteListForm6 | BlockNote, RemNote, true-outliner |
| `pasteSeams` | `open` | ProseMirror's fitting: the first pasted text joins the text before the caret (a heading's title too, its section after), the text after the caret the last pasted text, the node's children follow the last pasted node at their depth; an empty item filled, its children after; where the paste ends in a block that isn't text, the text after the caret a node of its own | PasteList22–24, Paste21 | BlockNote, WorkFlowy, RemNote |

  `open` falls back to `closed` where a seam can't join: the caret in a heading's title, a first pasted
  block that isn't text, a pasted heading among the rest that takes in what follows, groups after closed
  sections, lazy lines in the node's text (`pasteOpen`; `pasteNodes` calls itself with `closed`). The
  joined first line is escaped with the lines below (`[a]: b c` isn't a definition). SiYuan declares
  `pasteOnParent: after` (its item form; headings and a paragraph's list it pastes first in, its README
  says). Declaring `open` was judged by rejudging recorded runs both ways: WorkFlowy 14 better, 3 worse
  (no join on an item with children): declared; RemNote with bullets 8 better, none worse, once the
  clipboards lost their final line break: declared; Dynalist one worse: not. `pasteSeams: split`
  (WorkFlowy's text after the caret a node of its own): 7 better, 2 worse, WorkFlowy only: dropped.
- **The refactor** (13-align §11, done): placement moved out of `paste.ts` into `place.ts`: `Slot`
  (paste's `CaretSlot` adds the caret), `endSlot`, `fit` (`fitToList`, `fitToBlocks`), `placed` (the
  plan: spacing, an emptied item's checkbox and children, what a heading takes in, groups after closed
  sections, the caret's node and line, placeholders), and the shared rules: `sectionEnd` (from
  `structure.ts`; three copies of it went), `ownsLists` (a section's paragraph owns its list, not under
  a heading in a quote or an item; it replaced `root || heading` in endSlot, pasteOpen, outdent and move
  down past a paragraph), `unownLists` (any `PlanTree`). **Fitting takes plan nodes**, not the parsed
  fragment (`pastedNodes` turns the fragment into copies with each item's own marker), so it can place
  copies with ids kept for a move-to. It still reads paste's options from the config; a move would want
  its own (`own` form), a parameter then. The moves (swaps, `crossUp`/`crossDown`, `keepsParents`) don't
  place by slot, and duplicate stays `place('after', …)` with its heading refusal: the copy-paste check
  (§7) measures them against paste.

### 3.4 One line into a node's text

In a node's text (not code, not markup), one line without a line break that paste doesn't make a node
is put in at the caret by `executeCommand` (`typedAt`), escaped where at a line's start it would read as
a block, as typing it would be: `1. Introduction` at a text's start is `1\. Introduction`, where the
host's paste made a list in the item (PasteList25; PasteList9 mid-text). The backslash goes in the text
before the caret too where the typed text makes the line a block (`- 1┃` + `. a` → `1\. a`). Over every
spec buffer and caret, 13 one-line clipboards: of 54,654 applied pastes 49,461 are the text exactly as
typed; the rest are the escapes (`1. x`, `- x`, `# x`, `> q` at a text's start; `---`, `===` where they'd
read as a delimiter row or underline) and paths that were ourus's already. A phrase with no formatting
stays the host's (a boundary nobody would see break).

### 3.5 The spec's format

- One `yaml` block per state besides `buffer`: the start's holds options, `tags`, `clipboard`,
  `outline`; a step's `result`, `clipboard`, `outline` only. Fenced `result`/`outline`/`clipboard`
  blocks are errors naming the key. `result: rejected not-expressible` (YAML can't hold `rejected: x`).
- `clipboard: |` is `text/plain` alone; a map is formats (`CLIPBOARD_TYPES`: `text/plain`,
  `text/markdown`, `text/html`, `vscode-editor-data`). The start's must have `text/plain`; a step's
  checks only what it names. A text is a literal block (`|`, `|-`, `|2`) or one quoted line, single
  quotes too; a bare value is an error (` #` would start a YAML comment).
- Files by concern, few cases each, flat `##` headings, groups' context in each intro: paste.md
  (placement), paste-list.md, paste-list-form.md, paste-conv.md (the format choice), paste-html.md (the
  converter), paste-plain.md, copy.md.
- **A case is its ID**: its own heading, unique across the spec (a spec test); headings above cases
  group them and are no part of a name; no breadcrumbs anywhere. obsidian-true-outliner.md flattened:
  every case a `##`, its italic first line its section, TO's entry and old heading; IDs from TO's codes
  (`TO-E4`, `TO-E7-E8`, `TO-S11`, `TO-Bug228`, `TO-Bug267-E5`, `TO-Seams`, `TO-Lazy`, `TO-BlockId`,
  `TO-DelStart`, else `TO1`–`TO19`; `b`, `c` for a second and third under one code). paste-plain.md's
  cases `PastePlain<N>` from 1. `␠` reads as a space in drawings. `test/redraw.ts --apply` rewrites
  `result:` keys.

## 4. Plain paste

`src/commands/paste-plain.ts`, written anew (the old `pastePlain` with `paragraphsOf` and
`paragraphsPlan` went from `paste.ts`, which imported it for its fallbacks). `executeCommand`'s
compositions stay (`overSelection`, `breakThenPaste`).

- `pastePlain`: the rules in spec order: code lines (`pasteCode`); nodes of one line (an ATX title, an
  item's too, a callout's title in the Obsidian flavor, a table row); else the node's text (`textAt`,
  then `pasteText`).
- `textAt` finds the target: the node's text lines and where each starts, the line pasted into, the text
  before and after the selection, the prefix later lines take; an empty item's text starts after its
  marker's space and checkbox. `markup` on a setext underline or before the first line's text (a
  callout's `[!type]`), a held space being text.
- `pasteText` builds the text as rows of pieces (the document's text at an offset, inserted text, or a
  backslash written into the document; a null row a paragraph break). Every row written, and every
  paragraph start, is checked once with the encoder's `escape` (`start` with the lines below, for link
  definitions; `continuation`; a callout at the text's start); the backslash goes into the piece
  holding the escaped character (`1` and `. a`). That replaced three escape paths and a separate
  `referenceEscape` that checked the first paragraph only.
- `takesInBelow`: an empty item, blank lines, then a line at its content column (its sibling now, its
  child once it has text): refused.

Behavior changes (each read in the differential and in a comparison of the old and new `pastePlain`
over every spec buffer, caret and twelve clipboards: 39,482 runs differing, grouped):
- **A continuation line keeps its indentation** (`- ax⏎    y`, a tab too), as the into-the-block camp
  does; a paragraph's first line still loses it (PastePlain19). A tab counts as one column when deciding
  a line is four in (the differential's 81 failures came from counting it as four).
- **The spaces at a final break are kept**, starting the new line, the caret after them, as Shift-Enter's
  (PastePlain13: `px⏎ ┃\---`).
- Fixes: a pasted paragraph reading as a link reference definition (PastePlain12); code under an
  indented fence losing that indentation from pasted lines (PastePlain30); an empty item whose sibling
  past blank lines sits at its content column, refused.
- Where markup is: an item whose first block is a setext title takes the lines as a setext heading does;
  an item's ATX title refuses them; the caret on a setext underline refuses, as Shift-Enter there.
- Fewer escapes: after an empty task's checkbox (`- [ ] - a` is text), on a line four columns in.
- A clipboard starting with a line break over a selection in one line goes through `breakThenPaste` as
  a caret does; a whole continuation line selected is then the host's (the line left blank). A
  selection in an empty task's checkbox is refused, as in a task with text. The change is trimmed to
  what differs, so an empty task's checkbox isn't rewritten.

**`pastePlainLines`: what a pasted line break is.** The disagreeing apps were each consistent: a line
break in plain paste is one key. Measured by prototyping each value and rejudging recorded runs:

| value | a line break is | declared by | paste-plain.md disagreeing |
| --- | --- | --- | --- |
| `text` (default) | Shift-Enter's | Logseq, Logseq DB, Tine, Roam, Athens | 0–1 |
| `enter` | Enter's, the text typed (`typedWithEnter`, in a node's text only) | Dynalist | 22 → 5 |
| `items` | a node per line, placed as paste places nodes (`pasteLinesAsNodes`; list markers read where every line has one, as Tana) | Tana, WorkFlowy | 19 → 5, 17 → 11 |
| `host` | the host's: the text inserted as is | Obsidian (all setups, true-outliner: 21 of 30 under it), SilverBullet, Emacs | 23–25 → 0 (Emacs 4: its yank of a no-break space) |

Under `items` one line with a line break is a node; a leading line break is Shift-Enter's only under
`text`; under `items` and `enter` a selection in one line is deleted first. Dropped as too niche:
`markdown` (plain paste as Ctrl-V; `host` fit better). RemNote fits none (first line joins, the rest
after, an empty rem for the final line break): undeclared, the doc says so. Cases PastePlain31–34. Left:
WorkFlowy's 11 (its split seam, bullets read in mixed lines, no-break-space lines, code), Dynalist's 5
(code blocks split into nodes, children kept with the first line, the caret on a leading line break),
Tana's 5 (code, no-break-space lines).

## 5. Copy and cut

**Decisions (the user's)**: both choices options: `copyAtCaret: node` (default) or `host`;
`copySelection: text` (default) or `nodes` (not tied to `markup`). Move-to skipped for now (it should be
cut and paste, and wants the spec format expanded).

`src/commands/copy.ts`; `copy` and `cut` in `Command`; an applied result has a `clipboard`:
- the clipboard: `text/plain` and `text/markdown` the Markdown, `text/html` `renderHtml`'s after
  `<!-- ourus -->` (`SOURCE_MARK`), which paste reads as the text's;
- the Markdown (`copiedMarkdown`): the range as written, without the prefixes of the containers holding
  all of it; a container holds the copy where it opens before it (an item's marker, a quote's `>`): a
  quote is copied from its `>` (Copy8), a footnote definition from its `[^1]: `, an item indented past
  its parent's text keeps its marker, its lines after losing what its first line lost (the child at the
  item's text column, `- b⏎  - g`: Copy9). Whole nodes start where the node does and end with a line
  break, so one pastes back as a node, not a phrase;
- a cut: a text range as Backspace over it deletes it (a plain removal where that is the host's), whole
  nodes as `deleteSubtree`;
- under `copySelection: nodes` the nodes are `operands()`'s (`nodesOnLines` shared in `context.ts`), so
  copy refuses `non-contiguous` as cut does (Copy7; tops with different parents, 1,055 of 17,752
  selections, were copied and refused by cut);
- spec/copy.md (Copy1–9, Cut1–4); the player plays `copy` and `cut` (a textarea's where ourus steps
  aside); the cm6, textarea and GTK demos handle copy and cut (two smoke scenarios); every demo reads
  every format on paste (GTK: `read_async` per MIME type, UTF-16 where a BOM says so; its formats one
  `Gdk.ContentProvider` union; it builds, no `gjs` here to run it).

## 6. The SxS and the probe

- **Each app gets exactly a case's formats**, through a copy event (`setData` takes any type; a real
  Ctrl-V's paste event has them all). Emacs takes the text. `--plain-clipboard`: the text alone. Old
  runs (a string clipboard) are read back as text plus its rendering, so `--rejudge` matches them
  honestly. The clipboard is emptied before each test (a copy of nothing read back an earlier test's,
  another app's in the same browser).
- An empty document is an app's empty page: one empty block, the caret in it.
- **Comparison**: block texts by what they say (`sameText`: escapes inline Markdown reads the same;
  `\*x\*` still differs from italic); a code block's closing fence at a block's end optional
  (`endFenceOptional`: Logseq, Logseq DB, Tine paste ourus's blocks without it); a clipboard reading as
  the same outline is `whitespace`, not `disagree` (`sameMarkdown`: Logseq's tabs, Roam's and Athens's 4
  spaces, no final line break).
- **Copy and cut**: every driver has `copy` and `cut` keys (Emacs `M-w`, `C-w`, read with
  `substring-no-properties`) and declares `copyAtCaret`, `copySelection` from §2.8 (`host`: Roam, Athens,
  WorkFlowy, Dynalist, BlockNote, the Logseq family, RemNote, the Obsidian setups, SilverBullet, Emacs;
  `nodes`: the Logseq family, Tine, Athens, Tana, Dynalist, RemNote; true-outliner's `nodes` was wrong:
  it copies a text selection as text). A case's clipboard is replayed under the app's options as its
  buffers are. **`selectSubtree`**, a harness action: a copy or cut that is a step's first action, at a
  caret, on an app declaring `copyAtCaret: host`, is played `selectSubtree, copy` and judged against
  ourus's node copy. Logseq, Logseq DB, Athens emulate it with their `deleteSubtree` code (now
  `selectSubtree` then Backspace); Tine a key (Escape); Roam emulated, pressing Escape until
  `.block-highlight-blue` shows (its Escape toggles a selection that outlives the page).
- **Drivers' `holds`** decline starts an app holds otherwise: Live Preview and the setups on it
  (`atInlineCode`: a caret it moves at inline code's backticks), Logseq DB (an empty task with a space
  after its checkbox), SiYuan (`**b**` held as formatting; a caret on a thematic break; an unclosed
  fence). Drivers' `behaves` one per line in `config.ts`'s order.
- **Reports**: a case's clipboard is a table of its own above the command, "clipboard" across a column
  per MIME type (one alone: "clipboard (text/plain)"); the several-apps table prints short ids, a row per
  spec file with its cases under it, `D`, `C`, `S` for disagree, caret, spaces. The SxS keys a case by
  its ID (`fileOf(id)` in `plan.ts` gives its file); `compare.ts` maps old `file › … › ID` names to the
  last part. `takeLock` waits twenty minutes.
- **Tried and reverted: skipping adapted cases ourus reads otherwise as blocks** (the paragraph-and-list
  noise, Paste2–5, PasteList19). Probing the 16 skipped cases with it off: it removed 10 false
  disagreements, hid 28 agreements and 73 real disagreements. The hidden agreements were headings'
  (Paste6, 10–12, PastePlain23, 30, PasteHtml6): a block app keeps a heading's first paragraph in the
  heading's block, which the blocks drawn back as Markdown can't say. A narrower try, if ever: judge (not
  skip) against ourus on the blocks where no heading is involved.
- **`probe.ts` reuses the apps' windows**: `run.ts --keep-windows` (probe passes it); a lease decides from
  files (window records `<app>.window` beside the locks, process liveness), connects only to the browser
  it takes, outside the pool's lock; the app's window taken wherever it is, else a browser with room (the
  blank start page no longer counts as a window: it made 6×3 slots 6×2 and the apps evicted one another);
  a window that doesn't answer in 2 s is closed by target; a probe waits for an app's lock; the reuse
  check lets the app settle (Dynalist). The whole-pool probe of one case: 28 s → ~6 s; one app 4.8 →
  1.5 s; stable under concurrent probes; a spot check of 11 cases × 18 apps identical to the full SxS.
  Obsidian setups and Emacs still start per probe (~2.5–4 s; a pool manager in the proxy not built).
- **probe.ts's output** (the user's design): ourus's states first; `--- Probing N apps, logs: <dir>/ ---`;
  each app as it ends (`✓ logseq 1.6s`), its state verbatim where it doesn't agree, its clipboard where
  it differs; ourus's own result where it didn't apply on the actions' line (`> enter (ourus:
  notApplicable)`); `= ourus as blocks` once where compared that way; no summary, no legend; colour on a
  terminal. Takes a case ID (`probe.ts all Cut4`) or an `.md` file; `clipboard-html`-era probes migrated
  to the formats map.
- `run.ts --help`, and an option it doesn't read is an error (exit 2): `--help` once ran every app on
  every case. `sxs/*.ts` and `demos/*/build.ts` have shebangs and are executable.

## 7. The checks added

- **The inverse test** has the pair `cut, paste` at every caret: no encoding failure; the round trips
  that don't come back are the caret, a paste elsewhere than the cut (a child cut leaves the caret at its
  parent's end, where a paste is its sibling; a first node cut leaves it at the next one's start, where
  a paste goes after it under `pasteAtTextStart: after`), spacing, the host's, refused.
  `INVERSE_DUMP=f.txt` writes every round trip that doesn't come back, a line each, sorted, for diffing.
- **The differential** runs `insertText`, `copy`, `cut`, `paste` and the option values (`copyAtCaret:
  host`, `copySelection: nodes`, each paste value, `pastePlainLines: items|enter`), and a
  paragraph-and-list clipboard. `DIFF_DUMP` gives each paste's clipboard.
- **`test/copy-paste.ts`**: every childless node of the spec's buffers, `duplicateSubtree` at its text
  end against `copy` there and `paste` at the same caret, grouped by kind and difference, held to
  `copy-paste.baseline.json` (an item other than `same` fails it, but an empty one, which fills the
  empty item it lands on; an unclosed fence, which paste closes; lazy lines). 1061 runs: items 584
  `same`; paragraphs 257 `tree` (a copied paragraph pastes into the text: open question 1); headings and
  blocks set apart where duplicate writes them tight (~110). It found the fence in a pasted item, the
  copy of an item indented past its parent's text, and the heading in a pasted quote.

## 8. The typed backtick (`insertText`)

Brought from the `wip-backtick` branch (`41607ef`) onto the code of the time, not rebased. Its other
half (an `apps` filter for spec cases) stayed on the branch.

- **`insertText`** (`{ type: 'insertText', text }`, W3C's `inputType`): typed text at the selection.
  ourus handles a backtick (and a tilde on a tilde fence); anything else is `notApplicable`, so the host
  types it. Several characters at once (an input method's commit, a text replacement) are played a
  character at a time, ourus's where any is. Under `markup: text` it is among `HOST_IN_MARKUP` (typed
  in a marker or a container's indentation it is the host's, typing.md rule 2); a fence's run isn't
  markup to `inMarkupAt`, so the rules apply there under both.
- **`closeBackticks`**: `fences` (default) closes code fences only, `all` pairs inline code too (bare
  Obsidian), `none` closes nothing (Emacs). Tilde fences are covered.
- **[`spec/backtick.md`](../spec/backtick.md)** (Backtick1–32), six rules: a backtick in or at a fence's
  run grows both fences; elsewhere on a fence line one that would break it is refused; on a code line it
  is code, unless it closes the block (the closing fence typed again takes the old one's place; between
  code lines both fences grow past it); the backtick that opens a fence gets its closing fence below
  (`~~~` too: Backtick29, 30); Backspace and Delete in a run shorten both fences, and at three the fences
  of a just-typed empty block go back to text, any other empty block goes whole, a block with code is
  refused; inline pairs under `all`, a backtick typed anywhere in a code span's closing run stepping
  over it (Backtick32).
- **Under `markup: text`** (the user's call): the refusals of rules 2 and 5 (a backtick in a backtick
  fence's info string; Backspace/Delete in a three-backtick run of a block with code; typing over a
  selection taking part of a fence's run, Backtick31) are the host's, the reason as `detail`
  (`fenceRefusal` in `code.ts`), as any edit of markup there: the block breaks, as the user editing by
  hand asked. Refused under `decorated` (Backtick7, 13, 16 drawn so). Under `decorated` the caret never
  ends on a fence (Backtick5, 9, 14, 23 give it to the end of the code).
- **An unclosed fence refuses what it would swallow**: a move or copy placing a node after one is
  `not-expressible` (`afterUnclosedFence`: MoveUp41, DuplicateSubtree9); unclosed math and comments the
  same (Fence61). A deleted character making a code line a closing fence (`x┃```` `) routes to
  `codeEdit`, the fences growing past it; `$$`/`%%` refuse (Fence62).
- The player types a character at a time, each through `insertText` first; a typed action's `result` is
  its last character's. The demos: cm6 (`EditorView.inputHandler`; input replacing another range is
  CodeMirror's), textarea (`beforeinput`'s `insertText`, guarded against its own `execCommand`;
  `insertReplacementText` left alone), GTK (a printable key without Ctrl or Alt; a dead key left to the
  input method); every demo leaves a composition alone.
- Code: `code.ts` (`fenceRun`, `closedFence`, `fencesOfLength`, `deleteInFenceRun`, `removeEmptyBlock`,
  `unfenced`, `trimMd`), `typing.ts` (word boundary `isSpaceOrTab`), `textEnd` moved to `context.ts`.
- **The SxS**: bare Obsidian (Source, Live Preview, Outliner) closes a typed fence and pairs inline
  backticks, but leaves the closing fence at three when a fourth is typed, so the block no longer closes
  (Backtick4); on every other fence edit the text apps go a character at a time and the block breaks.
  **Only WorkFlowy among the others closes a typed fence**, the caret on the code's first line;
  SilverBullet, Dynalist, Tana, SiYuan leave it open (declared `none`, as Emacs). Tana and WorkFlowy
  keep the closing fence typed again as code (Backtick9). Logseq, Logseq DB, Tine pair inline backticks
  (fences unmeasured). true-outliner breaks a typed fence into ``` `` ``` and `` ` `` lines; Live Preview
  can't start from Backtick15's and 17's buffers. SiYuan closes an unclosed fence it is given.

## 9. Other fixes

- **B52** (15-spec §4.9): the keys act rather than refuse (the user); one case a key, Backspace48 for the
  caret right after the held space.
- **B35** (Fence12's split joined back lost the blank line after a body paragraph): joining a childless
  fenced item into the item above, after one of its body blocks, is a direct edit, its marker becoming
  indentation.
- **The held space on every text line** (the user: not items only): deleting a line's first character
  before text that would start a block (` # b`, ` ``` x`) holds the space on a paragraph's, a quote's, a
  continuation line too; leaving escapes it as a continuation where not the first line (Placeholder18,
  19). A mapped placeholder keeps its kind; structural commands and structured paste settle held spaces
  first; Backspace and Cmd-Backspace at a paragraph's held space join it, the space kept; `renumber`'s
  caret never holds a space. `start`'s space after a deleted first character stays the text's
  (Placeholder20).
- **Shift-Enter before text alone on the line after its marker** (`-` / `  ┃ three`): refused under
  every option (ShiftEnter33); those spaces are the text's (`textLead`).
- **Enter**: at a footnote definition's or thematic break's end a paragraph after it (`paragraphAfter`,
  shared with `tableEnter`; Enter66, 67); at an Obsidian callout title's start before a lazy line,
  `runsInto` reads the line below after the containers they share (Enter68). A footnote definition ends
  with its last child, as an item does (`syntax.ts`); duplicate keeps its `[^1]: `.
- **Delete at an item's end before an item sharing its marker's line**: before a quote or table refused
  (Delete34); before `- - b` the empty item's marker becomes indentation (`- a⏎  - b`, Delete33: 8 block
  apps agree; a first version peeling a level was wrong).
- **Keys left to the host, scanned** (every spec buffer, caret, Enter, Shift-Enter, Backspace, Delete
  where ourus is `notApplicable`, the host's edit simulated through `OutlineState.update`): markup edits
  under `markup: text` are the host's by design; Backspace/Delete on a blank line between nodes (`- a⏎┃⏎b`
  makes `b` lazy, `para⏎┃⏎---` a setext heading) stays the host's: every app with blank lines agrees
  (the user took the apps' side); rare, left: a deleted character making text read as a block.
- **`SyntaxTree.update` without changes mutated its snapshot** (`placeSentinels` appended to the shared
  `starts`/`ends`; HEAD had it): copies now, a regression test.
- **The differential's encoding failures, 190 → 20**, each a cause: lazy lines joined or indented into a
  quoted item escaped (`lazyLineEscape`; Backspace49); unclosed math and comments refuse what they'd
  take in; `- [ ] [r]: /u` is a task, not a definition (parser, after cmark-gfm and micromark); indented
  code after a paragraph or item (`runsInto`, `indentedCodeAfterItem`); an empty item over a block that
  isn't an item refused; a quote after an empty item's marker taken out (Quote94); a bare marker line
  under text set apart (`emptyFirstChild`); a selection's head holding an empty line; a callout's
  `[!type]` completed by a join escaped; plain paste's tabs; a pasted heading after text and in a quote
  (35 of 43 paste failures); the encoder's landing column under a heading or paragraph inside an item or
  quote (`containerColumn`, `layout.ts`); outdent in a quote making a paragraph own a list; move up under
  a callout's title (`seams.ts`); indent into a quote ending with a heading; paste over a selection with
  a block below (`shift`, `blockColumn`); a fence in a pasted item (43 HEAD failed).
- Skipped (the user's call): tab-indented fences under `enterMidItem: child` in CommonMark (an atom's
  text can't say what a partly consumed tab stood for); held empty lines in quotes and tasks moved,
  outdented or duplicated; paste into `>- a` (the encoder would have to convert columns per line between
  the two `>` forms). Left: 31 refusals of a list pasted at a text's start before indented code (honest,
  rare).

## 10. State and checks

Committed as `a691f43`. `npm test` 1144 pass; typecheck clean; cm6 smoke 73 of 73; the differential (20
failing, all HEAD's too; it exits 1 while behavior differs from HEAD, by design), the inverse test and
the copy-paste check at their baselines. The full SxS: 18 of 18 apps, no error, ourus 970 of 970;
against `.sxs` HEAD (`8c2e05f`) none worse but Cut4 (5 cells: `✓ → S` on Logseq, Logseq DB, Athens,
Roam, which agreed by doing nothing under `host`; `✓ → ✗` on Tine, its clipboard lacking the children),
196 better (nearly all `pastePlainLines`); then the fence rejudge (§6): 16 verdicts moved, none worse.

**Read from the full SxS**, where the five block apps closest to ourus (Roam, Logseq, Logseq DB, Athens,
Tine) all disagree (22 cases): Paste17 (selection kept: §3.1); PasteList12, 13, Scenario18 (code at an
item's end: model C, known); PasteListForm1, 3 (`1. x` from text read as text: their bug); Paste3, 5, 26
(a paragraph's list drawn as children); PasteHtml6–19 (the dialects, each app its way); Indent29b (15-spec
§474); DeleteSubtree6 (focus lost, 15-spec §1800); Fence62 (every app deletes plainly). PasteList26: ourus
with the Logseq camp. The ~160 cases no app agrees with are nearly all the text editors' raw edits.
Nothing pointed at a regression.

## 11. Open, in order

1. **The user's call** (asked twice; recommended yes): ourus's own clipboard (`text/markdown`, or HTML
   with `<!-- ourus -->`) always pasted back as nodes, a copied paragraph as a paragraph after its node;
   text from elsewhere keeps the plain-lines rule. The copy-paste check's 257 paragraph runs would be
   `same`.
2. `selectSubtree` for Dynalist, WorkFlowy, BlockNote, RemNote (Escape isn't it: find their key or
   emulate), and the text editors if they have a subtree selection.
3. **Move-to** as cut and paste at a slot: `fit` and `placed` take plan nodes now; it needs the spec's
   format to say a target, and the fitting's options as parameters (a move keeps its form).
4. `pastedNumbering` (`config.ts`): after bullets pasted into a numbered list the items after keep their
   numbers (`1. a` / `- x` / `2. b`).
5. The task model (the user: later): rename `enterTask` to `taskModel: item | text` (Enter and paste read
   it), `taskEditing` staying (Obsidian continues a checkbox on Enter but deletes it a character at a
   time, so one option deciding both would misdeclare it).
6. Reading: a copy whose first line is the deepest (`    - y1⏎  - y2⏎- z`) is still indented code
   (§2.6); a lazy line copied out of its quote (`> - q⏎    - g`) reads as a child out of it.
7. Other typing keys (`$$`, `*` and `_`, brackets): measure the apps with the probe, bring the choices
   first. From the branch: a selection typed over is the host's; Backspace after the closing fence typed
   again (Backtick9) refused; presets.
8. The SxS gaps of 15-spec §11.3 (Logseq and Tine projections of an item's body, declarations by node
   kind, Logseq DB measured), then 15-spec §11.5.
9. Smaller, noted: rich-text apps' formatting read as plain text by the drivers (`**b**` against `b`);
   PasteHtml6 and 7 skip on apps declaring `children` or `own` though they fill an empty document
   (conservative); plain paste's refusals in markup don't become the host's for a selection under
   `markup: text` (`inMarkup` takes carets only); a selection covering a continuation line's whole text,
   pasted over with a leading line break, is the host's (its breaks can move what follows out of the
   item); RemNote's "Paste as Single Bullet" measurable only by calling its module.

## 12. Traps

- **`.git` is read-only and not to be touched**: no `git mv`, `git stash` (`index.lock`), commits; the
  user commits. Compare with HEAD through a copy (`git archive HEAD src | tar -x`, `node_modules` linked;
  for the inverse test with today's `src/config.ts`, as the spec reader needs the new options).
- **Don't edit `spec/`, `src/` or `sxs/` while an SxS runs** (it reads the spec again for its report);
  `--list` before anything long. A run with selectors writes `.partial`; only files covered whole update
  `<file>.json` for the rejudge; `--compare` reads `sxs.json` and matches by name (a renamed case shows
  gone/new; a reused ID compares unrelated cases). A declaration change needs a rejudge before
  `--compare` means anything. The drivers' declarations judge a command's cases (a stale
  `pasteStructuredAtEnd: join` judged the new paste on BlockNote and WorkFlowy).
- **The differential** compares with HEAD's code: a new command throws there (noise to filter); the
  signal is a group `→ rejected encoding-failed`, the total moves with the corpus (the spec's buffers).
  Its report pads counts to six columns (grep `^ *[0-9]+ `). Its examples don't draw placeholders (a
  held line may explain one that won't reproduce). With workers it can die with `Illegal instruction`
  (Node 26.11, arm64): rerun, read before `DIFF_UPDATE=1`. Compare `INVERSE_DUMP`s, not group counts.
- **Simulating a host's edit** must go through `OutlineState.update` with its caret: a plain re-parse
  loses held lines.
- **The browser pool**: a stuck run keeps browsers busy and apps time out at load: `node sxs/run.ts
  --stop`. Another session's SxS holding SiYuan's workspace fails its kernel (`lock workspace`). The
  user's own probes run beside yours (a lock "another run has X" may be theirs). Window records live in
  `/run/ourus-sxs/<hash>/chromium/<n>/`. The SxS clipboard is the browser's, shared by its windows.
  Roam's Escape toggles a block selection that outlives its page: never key it blindly. `plan.ts` plays
  a paste only by a key, never emulated.
- **`pkill -f PATTERN` matches the shell running it**: use `[s]xs/run\.ts`, never the same string
  elsewhere in the command. A python `open(p,'w').write(open(p).read())` truncates first. Shell-quoting
  backticks or `$$` through `eval` breaks: write a small script. A background command keeps writing to
  its task's output file.
- **Never split a spec file with a regex** (`## ` inside fences): use the spec's parser. Spec IDs: the
  highest number isn't the last heading (check every level). A buffer holding a 4-backtick fence needs a
  5-backtick `buffer` fence.
- **Code**: `isCodeLine` is a type guard (the false branch narrows the line to `never`); an item's first
  block can be a heading (`- # h`, `- a⏎  -` a setext title): test the head's type; a setext underline
  hides in `- a` / `  - ` (`nodeAt` gives the parent); the encoder adopts a list's marker only from the
  item before in the plan: write the slot's marker exactly; `ownsLists` isn't indentParagraphs' `section`
  (who owns a list vs where paragraphs may become items in place); widening `isPlace` made stray mapped
  placeholders valid; the SxS projection drops a line-start escape (`\#` must stay for free-form apps).
- **A parser deviation can hide as a command bug**: check micromark (`node -e` with
  `micromark-extension-gfm`) when a written result reads oddly.
- Keep tool output short (`head`, `grep`): long output ate a session's context.

## 13. The user

Decides product questions with the apps' data and a recommendation, asked before building, and follows
Logseq by default ("lets match logseq"), weighing the block outliners over the text editors; checks a
camp's claim at its source (do the apps really have no plain paste?) and challenges details ("why 4
spaces and not 2?": they were right); sometimes takes the apps' side over a recommendation (blank-line
deletes, the fence closed). Prefers simpler: few cases, one a behavior; no `result: applied` where the
buffer decides; no option without a second value; a quirk noted rather than emulated in a driver.
Dislikes refusals where a sound result exists, but under `markup: text` an edit that breaks a block is
the host's. Wants failures explained by cause ("why do we even have these?"), genuine ones fixed, rare
ones that would complicate the design skipped. Wants the spec split by concern into small files, flat
headings, IDs clean, unique and numbered from 1, no breadcrumbs; a spec case for each demo bug (flavor
marked); app observations in their READMEs; the probe on one case or file rather than full runs, and
SxS reruns after each change ("nothing unexpected"). Wants code formatted as the rest (no long lines,
`config.ts`'s order, only what was touched reformatted), tools fixed when they bite, findings written
down as the work goes, first ("asap -> do this first"); no temporary notes cited outside `dev/`, no
habits like `DIFF_WORKERS=1`; `.git` untouched.
