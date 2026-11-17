# Upstream bugs

To verify and file at upstream.

Each re-run 2026-11-13 (commonmark.js 0.31.2, micromark 4.0.3 with micromark-extension-gfm 3.0.0, markdown-it 15.0.2, marked 18.0.14; cmark-gfm 0.29.0.gfm.13 by the
`cmarkgfm` Python package: `python3 -m venv v && v/bin/pip install cmarkgfm`), the inputs and outputs in the pointer.

| Where | What | Pointer |
|---|---|---|
| CommonMark spec (an example asked for) | `<https://example.com/?a=1&amp;b=2>`: cmark decodes the entity in an autolink's address, commonmark.js, micromark, markdown-it and marked keep it; no example says | dev/30-bugs.md, Decisions, B247 |
| micromark-extension-gfm-autolink-literal | `a\+b@example.com` links nothing, `a&#43;b@example.com` (the same `+`) links `b@example.com`, the wrong mailbox; cmark-gfm links `a+b@example.com` both ways | dev/30-bugs.md, B251, "For a micromark issue" |
| cmark, micromark | `- a⏎<x>`: an HTML block of type 7 started on a lazy line, the list ended; the spec says type 7 can't interrupt a paragraph (commonmark.js, markdown-it, marked keep `<x>` in the item). micromark joined cmark since the first check | dev/08-parser.md §9.1 |
| cmark | `- a⏎  ***⏎⏎- b`: the list read tight, the blank line after a thematic break not recorded (`S_set_last_line_blank`) | dev/08-parser.md §9.2 |
| cmark, marked; markdown-it | `10. [a]: /u⏎  b`: `<li>  b</li>`, the lazy line's indentation kept as text; markdown-it ends the item | dev/08-parser.md §9.3 |
| cmark; commonmark.js | `[a]: /u⏎---`: cmark `<p>---</p>`, commonmark.js `<p></p>` before the `<hr />` (micromark, markdown-it, marked: `<hr />`) | dev/08-parser.md §9.4 |
| micromark, markdown-it; commonmark.js (a release) | `- ⏎→⏎  a`: an empty item, `a` a paragraph after the list, where cmark-gfm reads `a` in the item; commonmark.js fixed it on master after 0.31.2 (the item rule's indentation checked first) | dev/08-parser.md §9.5; dev/28-bugs.md (a review of d1a0964) |
| cmark, commonmark.js, micromark | A link label's 999-character limit: 999 `é` (1,998 bytes) is no label in cmark, 999 `😀` (1,998 UTF-16 units) none in cmark, commonmark.js or micromark; the spec counts characters (markdown-it and marked link both; ourus counts code points since 2026-11-16) | dev/28-bugs.md (a review of d1a0964); dev/31-align.md, D33 |
| micromark, markdown-it, marked, commonmark.js 0.31.2; or cmark-gfm | `- ⏎→⏎→x` (an empty item, a line of a tab, a tab-led `x`): the JS parsers read an empty item and indented code `x`, cmark-gfm `x` as the item's text (ourus follows cmark-gfm). The spec's "at most one blank line" at an item's start reads as the JS parsers'; check commonmark.js master first (it moved to cmark-gfm's reading on the row above's shape) and file with whichever side it leaves | dev/31-align.md, D32 |
| cmark-gfm (GFM spec) | `> - [ ] q`, `- - [ ] n`: no task, cmark-gfm wanting the checkbox at a line's start; the GFM spec says the item's first paragraph's start (marked: a task) | dev/08-parser.md §9.6 |
| micromark (performance) | 1.5 s on a 10k-line nested outline where the other JS parsers take 10 to 30 ms; superlinear in nesting | dev/08-parser.md §9.7 |
| To check before filing | A byte-order mark: `‹BOM›# Title` is a paragraph in commonmark.js, markdown-it, marked, a heading in cmark-gfm and micromark (the spec is silent on encodings; Obsidian strips it). And the tab and NBSP bugs commonmark.js shares with ourus's old ones (dev/28-bugs.md's "what found nothing"), and B249's control characters (test/bugs.ts, the Parser cluster), neither written up with inputs | dev/28-bugs.md, B229 |
