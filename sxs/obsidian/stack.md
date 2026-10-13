# Obsidian: stack, parsers, internals

What Obsidian is built of, how it reads Markdown, and what of it the driver uses, from the 1.14.4
bundle (installer 1.14.4) and the running app. How the driver runs it is in [`README.md`](README.md).

## Stack

A closed-source desktop app on Electron: installer 1.14.4 is Electron 43.7.7, Chromium
150.0.7871.250 and Node 24.21.0 (from the binary's strings). Its own code is a package,
`obsidian.asar`: `main.js` (Electron's main process), `app.js` (the app, one minified file of about
4 MB), `worker.js` (the metadata cache's worker, `new Worker("worker.js", { name: "Metadata Cache
Worker" })`, which also parses for reading view when a note is long), `sim.js` (the graph's layout, a
worker), `quicklook.js` (the page macOS's Quick Look previews a note in; `main.js` unpacks it on macOS
only), `starter.js`, `help.js`, `enhance.js`, `i18n.js`, `app.css`. The installer ships a copy of the
package and a small updater, which loads a newer package downloaded on its own (its hash and
signature checked), so the app updates without a new installer unless a release's `minimumVersion`
asks for one.

The package's `index.html` loads CodeMirror 5 and its addons, Moment, PixiJS, i18next, scrypt-js and
Turndown as globals, then `app.js`; the rest is loaded when needed. What ships, the version as its
file states it (or the narrowest the code allows), and what uses it:

| library | version | file | used for |
| --- | --- | --- | --- |
| CodeMirror 6 | not stated; `@codemirror/language` is 6.11.0 or later (its stream parsers' `mergeTokens` option, new in 6.11.0, is there) | `app.js` | the editor, in both editing modes |
| CodeMirror 5 | 5.64.0 | `lib/codemirror/` | modes only: the editor's Markdown, and code blocks' languages (`modes.min.js`, loaded the first time a fence asks for one). No CodeMirror 5 editor is made: `app.js` calls nothing of it but `getMode`, `defineMode`, `findModeByName`, `modes` and `signal` |
| Vim | CodeMirror 5's `vim.js` at 793c9e6 (2021-12-04), "Modified from nightwing/cm6-vim-mode-experiment" | `lib/codemirror/vim.js` | Vim mode, run on an adapter over the CodeMirror 6 view (`window.CodeMirrorAdapter`) |
| remark-parse | 8.0.2 or 8.0.3 (their code is the same) | `app.js`, `worker.js`, `quicklook.js` | reading view and the metadata cache (below) |
| mdast-util-to-hast | 10.2 | `app.js` | reading view: remark's tree to an HTML tree |
| hast-util-to-html | 7.1 | `app.js` | reading view: that tree to HTML |
| DOMPurify | 3.0.1 | `app.js` | every rendered HTML |
| `yaml` (eemeli/yaml) | 2.x | `app.js`, `worker.js`, `quicklook.js` | frontmatter and properties; the API's `parseYaml`, `stringifyYaml` |
| Prism | 1.30.0 | `lib/prism.min.js` | code in reading view (a post-processor) |
| MathJax | 4.1.3 | `lib/mathjax/` | math, in reading view and Live Preview |
| Mermaid | 11.13.0 | `lib/mermaid.min.js` | mermaid code blocks |
| pdf.js | 5.3.34 | `lib/pdfjs/` | the PDF view |
| PixiJS | 7.2.4 (`pixi.js-legacy`) | `lib/pixi.min.js` | the graph view's drawing |
| d3-force, d3-quadtree | not stated | `sim.js` | the graph view's layout |
| reveal.js | 4.3.1 | `lib/reveal/` | the Slides plugin |
| Turndown | 7.2.0 | `lib/turndown.js` | HTML to Markdown: HTML pasted or dropped (with "Auto convert HTML" on), the web viewer, the API's `htmlToMarkdown` |
| Readability | `@mozilla/readability` 0.4.4 | `lib/readability.js` | the web viewer's reader mode and "save as Markdown", run in the page |
| scrypt-js | ricmoo's, at 3f106c1 (2020-05-19) | `lib/scrypt.js` | Sync's encryption key where Node's `crypto` is missing; the desktop app uses Node's `crypto.scrypt` |
| i18next | not stated | `lib/i18next.min.js` | the UI's translations |
| Moment | 2.30.1 | `lib/moment.min.js` | dates |
| Defuddle | 0.19.2 | `lib/defuddle.full.js` | nothing: no page loads it and no script names it |

**The editor is CodeMirror 6** (`activeEditor.editor.cm`, an `EditorView`), in Live Preview and
Source mode alike: switching modes reconfigures the one editor. Its Markdown, though, isn't CodeMirror
6's (`@lezer/markdown` is in none of the bundles) but a CodeMirror 5 mode, run through CodeMirror 6's
bridge for those (below). Live Preview and Source mode share that mode's tokens, which also decide
where Live Preview's widgets go (a callout, a table, a code block); what such a widget shows is drawn
by reading view's pipeline, from its text (remark, MathJax, code-block processors), not from the
tokens.

Notes are Markdown files in a vault folder. Plugins are JavaScript, loaded from the vault's
`.obsidian/plugins/`: their `main.js` is evaluated with a `require` that gives `obsidian` (the app's
API), CodeMirror 6's packages (`@codemirror/state`, `view`, `language`, and the rest) and Lezer's from
the app itself, and anything else from Node's; they add editor extensions with
`registerEditorExtension`.

## Two parsers: the editor's and reading view's

In short: the editor (Source mode and Live Preview) reads Markdown with **HyperMD's `hypermd` mode**,
a CodeMirror 5 syntax-highlighting mode that Obsidian forked, run inside CodeMirror 6; reading view
and the metadata cache read it with **remark-parse 8**, the remark of 2020, before micromark. They are
separate code and disagree, and the editing commands read the caret's line a third way, with a
regular expression:

| | what it is | where it runs | what it gives | a list is |
| --- | --- | --- | --- | --- |
| **the editor's** | `hypermd`: Obsidian's fork of [HyperMD](https://github.com/laobubu/HyperMD)'s CodeMirror 5 mode, on CodeMirror 5.64.0's `markdown` mode, which Obsidian patched too. A syntax highlighter: a tokenizer that goes a line at a time, carrying a state from line to line | the editor, in Source mode and Live Preview | tokens: CSS classes for each run of a line's text, and for the line (`HyperMD-list-line-2`). No blocks: nothing holds an item's lines or a list's items | a line that starts with `-`, `*`, `+`, or a number and `.` or `)`, at a depth: how many open items' text its indentation reaches |
| **reading view's** | remark-parse 8.0.2/8.0.3 (2020), the last remark-parse before it moved to micromark, with Obsidian's tokenizers. A Markdown parser: text to a syntax tree (mdast), by block and inline tokenizers | reading view; the metadata cache, which plugins read (`metadataCache`: links, tags, headings, sections, `listItems`); Quick Look on macOS | an mdast tree: `list`, `listItem`, `paragraph`, …, with positions | CommonMark's rules, mostly: lazy lines join the item, a new bullet starts a new list, only a list from 1 interrupts a paragraph |
| **the commands'** | Obsidian's: a regular expression on the caret's line | Enter and Shift+Enter (with "Smart lists" on, the default); Tab and Shift+Tab only indent the line | the line's prefix: quote markers, indentation, a list marker, a checkbox | a line whose prefix has a marker |

Neither parser is CommonMark's. The editor's isn't meant to be: it only colors lines. remark-parse 8
predates remark's CommonMark-compliant rewrite (remark-parse 9, on micromark, 2020-10): of the
CommonMark spec's 652 examples (0.31.2) it renders 444 as the spec does (`commonmark: true`, on its
own, without Obsidian's tokenizers; commonmark.js, compared the same way, 640), and of the 74 on
lists, 59 (commonmark.js 74).

### The editor's: `hypermd`, a CodeMirror 5 mode

- **The mode** is defined in `app.js` (`window.CodeMirror.defineMode("hypermd", …)`) and builds on
  the `markdown` mode (`name: "markdown"`, then `CodeMirror.getMode`), as HyperMD's does. It is
  HyperMD's mode, forked: its enums (`FRONT_MATTER`, `BARELINK`, `FOOTREF2`), state (`hmdTable…`,
  `hmdInnerMode`), token-type overrides (`list1: "list-1"`, `code: "inline-code"`) and options
  (`front_matter`, `math`, `table`, `toc`, `orgModeMarkup`, `hashtag`) are HyperMD's 0.3 line's
  (0.3.11, 2018, its last release; which version was forked isn't stated). Obsidian's: `hashtag` on
  and `emoji` off by default (HyperMD's are off and on), the options `highlight`, `blockId`,
  `headers`, `blockquotes`, `indentedCode`, `lists`, `hr`, internal links and embeds
  (`INTERNAL_LINK`, `EMBED`, `hmd-internal-link`), right-to-left tables, callouts in quotes. Only the
  mode is kept: none of HyperMD's addons (`hmdFold`, `hmdClick`, `hmdHideToken`) is in the bundle.
- **The `markdown` mode** under it is `lib/codemirror/markdown.js` (with CodeMirror 5's `xml`,
  `htmlmixed` and `yaml` modes in the same file): CodeMirror 5.64.0's, changed by Obsidian for
  `==highlight==` (with color emoji: "Keep in sync with src/markdown/highlight-color.ts"), a list
  item starting with an internal link ("fix ' - [[link]]' not working"), and where a fence closes
  inside a list item.
- **Lists**, as the `markdown` mode reads them (`blockNormal`): a line whose first text is `-`, `*`,
  `+`, or digits and `.` or `)`, then a space (`listRE`), indented at most three past the enclosing
  item's text, opens an item and pushes its text's column on `listStack`; each next line pops the
  items whose text column its indentation doesn't reach, and is out of the lists when none is left.
  So the bullet and the number aren't kept (a `+` after `*` is the same list; `2.` interrupts a
  paragraph), a line indented less than its item's text leaves it (no lazy lines), and in a quote the
  marker isn't the line's first token, so it isn't a list. HyperMD's line classes give the depth:
  `HyperMD-list-line HyperMD-list-line-<n>`, `n` being `listStack.length`.
- **Into CodeMirror 6** through `StreamLanguage`, `@codemirror/language`'s bridge for CodeMirror 5
  modes: `StreamLanguage.define(CodeMirror.getMode({}, { name: "hypermd" }))`, which the note editor's
  `buildLocalExtensions` pushes; a second, with its block syntax off (`front_matter`, `table`,
  `headers`, `blockquotes`, `lists`, … `false`), is the table cell's editor's. The syntax tree
  CodeMirror 6 then holds is the mode's tokens, line by line. Measured in the running app: the active
  language is a `StreamLanguage` named `hypermd`, and its tree's nodes are token classes
  (`HyperMD-list-line_HyperMD-list-line-1`, `formatting_formatting-list_formatting-list-ul_list-1`,
  `hmd-internal-link`), with no list or item nodes.
- **Code blocks' languages**: the mode runs the language's own CodeMirror 5 mode inside a fence, to
  highlight it.

### Reading view's: remark-parse 8

- **Which**: remark-parse 8.0.2 or 8.0.3, the tokenizer-based parser remark had before micromark
  (`blockTokenizers`, `inlineTokenizers`, `interruptParagraph`). Its defaults are 8's, `{ position,
  gfm, commonmark, pedantic, blocks }`, `footnotes` gone (8.0.0 dropped it); its block tokenizers are
  8's (`blankLine` … `paragraph`); and its list tokenizer has 8.0.2's rule that only a list starting
  at 1 interrupts a paragraph (`if (silent && queue !== '1') return`). 8.0.3 changed none of the code.
- **How it's called**: not through unified. Obsidian makes remark-parse's `Parser` itself,
  `new Parser(String(file), file)`, sets `Parser.globalOptions`, `{ breaks: true, commonmark: true }`
  (`gfm` is on by remark-parse's default: tables, strikethrough, autolinks, task items), parses, and
  runs its own transformers on the tree.
- **`breaks` is Obsidian's**: remark-parse had a `breaks` option up to 3.x. Obsidian wraps the inline
  `break` tokenizer so that a single line break is a `break` node (`<br>`) unless the option is off,
  and "Strict line breaks" (off by default) turns it off.
- **Obsidian's tokenizers**, added beside remark's: inline `mark` (`==highlight==`), `ilink`
  (internal links and embeds), `tag`, `math`, `inlineNote` (`^[…]`), `footnoteCall` (`[^1]`),
  `blockid` (`^id`), `comment` (`%%…%%`); block `math`, `footnoteDefinition`, `blockid`, `comment`,
  and `frontmatter` (YAML, at the start only); `reference` and `break` replaced by its own.
- **Its copies**: three, the same code in `app.js` (reading view, a note under 10,240 characters),
  `worker.js` (the metadata cache: a note's links, embeds, tags, headings, sections, `listItems`,
  blocks and frontmatter; and reading view's parse of a longer note) and `quicklook.js`.
- **Then HTML**: mdast-util-to-hast 10.2 (a code block's `meta` kept as `data.meta`, new in 10.2;
  CommonJS, which 11 isn't), hast-util-to-html 7.1 (`bogusComments`, new in 7.1, and 7's warning for
  `allowDangerousHTML`), DOMPurify, and post-processors (Prism, links, embeds, plugins').
- **Where it departs from CommonMark on lists** (the spec's examples, remark-parse 8.0.3 on its own,
  `commonmark: true`): five lines `- a` to `- e`, each indented a space more than the last, are five
  items (CommonMark: four, `- e` being a lazy line of `d`'s; #312); `1. a`, `2. b` and `3. c`
  indented 0, 2 and 4 with blank lines between are three items (CommonMark: `3. c` is indented code;
  #313); `foo` then `*` is a paragraph and an empty item (CommonMark: one
  paragraph; #285); and items CommonMark keeps tight are loose (#307, #318, #319).

### The commands': a line at a time

Enter, with "Smart lists" (`smartIndentList`) on, is `newlineAndIndentContinueMarkdownList`
(Obsidian's own, after CodeMirror 5's `continuelist` addon), which reads the caret's line with
`/^([>\s]*)(([*+-] |(\d+)([.)] ))(?:\[(.)\] )?)?/`: quote markers and spaces, a marker, a checkbox.
The editor's tokens are only asked whether the line is in a table, a code block or math, where Enter
is `newlineAndIndentOnly` instead, as Shift+Enter always is: a new line with the line's quote markers
and indentation, and spaces as wide as its marker (a line under the item's text, no new item), or a
bare line break when the prefix has neither. Tab and Shift+Tab are `indentList` and `unindentList`
(`indentMore`, `indentLess`).

### Where they differ

The same text in Obsidian's editing view, as the `hypermd` mode's tokens mark its lines (the same in
Live Preview and Source mode), and in reading view, as remark's parse renders it (measured in 1.14.4,
one note per case, the editor's line classes read, then the note switched to reading view):

| text | Editing view | Reading view |
| --- | --- | --- |
| <pre>para<br>2. x</pre> | `2. x` a list line | `<p>para<br>2. x</p>`: a list from 2 doesn't interrupt a paragraph |
| <pre>para<br>1. x</pre> | a list line | a paragraph, then a list |
| <pre>- a<br>lazy</pre> | `lazy` a plain line | `lazy` in the item (a lazy continuation) |
| <pre>- a<br><br>      code</pre> | the item's text, continued | a code block in the item |
| <pre>&#42; a<br>+ b</pre> | both list lines, depth 1 | two lists (a new bullet starts a new list) |
| <pre>> - a<br>>   - b</pre> | quote lines, no list | a quote holding a list, nested |
| <pre>    - a</pre> | no class | a code block |
| <pre>- a<br>  - b</pre><pre>1) a</pre><pre>Title<br>---</pre><pre>#tag</pre> |  | the same |

Reading view also turns a single line break into `<br>` (Obsidian's `breaks`, above).

The commands' reading is neither (measured likewise):

| start | key | Obsidian |
| --- | --- | --- |
| <pre>para<br>2. x┃</pre> | Enter | `3. `: a list continued, which reading view shows as a paragraph |
| <pre>> - a┃</pre> | Enter | `> - `: the list in the quote continued, though the editor's tokens mark no list there |
| <pre>- a<br>lazy┃</pre> | Enter | a bare line: the item reading view puts `lazy` in isn't continued |
| <pre>&#42; a<br>+ b┃</pre> | Tab | `  + b`: the line indented as an item |

So there are three readings of a note's Markdown in Obsidian: the editor's tokens (what Live Preview
draws), the commands' (a line at a time), and remark's (reading view and the metadata cache, near
CommonMark's lists).

## Internals

Obsidian's app object, as the driver uses it (`window.app`): `vault.create(path, text)`, `vault.delete(file, true)`,
`vault.getConfig(key)` and `setConfig` (a change applies to editors made afterwards);
`workspace.layoutReady`, `getLeaf(false).openFile(file, { active })`, `getActiveFile()`,
`activeEditor.editor` (`getValue`, and `cm`, the CodeMirror 6 `EditorView`); `plugins.enabledPlugins`
(a `Set` of ids), `plugins.manifests[id].version`, `plugins.plugins[id]`. The user agent says
`obsidian/<version>`. The app's code is `app.js` in the `.asar`, stored uncompressed, so it can be
searched as it is: the editor's extensions are built in `getDynamicExtensions`, and commands are
`addCommand({ id: "editor:…" })` calls with their default hotkeys beside them.
