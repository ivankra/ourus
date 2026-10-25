# Quotes, lists after blocks, and the writer's loose ends (2026-10-25)

One commit after 18-align, of three parts of work:

1. **Quotes** (Part 1): what a quote is in the outline, an option, `quotes: text | atom |
   container`, with `enterInQuote: line | split` beside it. Under `text`, the default, a quote of
   one paragraph is that paragraph framed by `> `, as a heading's title is by its `#`s; under `atom`
   every quote, callouts too, is one node of its lines as written, as code is; `container` is ourus
   as it was.
2. **Lists after blocks** (Part 2): what a list right after a block is the children of, an option,
   `listParent: paragraph | block | container`, and how a flat list moves, `listMoves: list | item`.
   Under `paragraph`, the default and ourus as it was, a paragraph adopts the list after it; under
   `container` none does, as the flat block apps hold a document.
3. **The writer's loose ends** (Part 3): every run the differential failed to write (36, 35 of them
   Part 1's), the inverse pairs' failures, the random command test's at more seeds but those needing
   tabs, and two quote-atom refusals an outside review found. Most were one mistake in different
   places: the draft's seam check, Done's spelling and the writer each decided where a moved node's
   lines go, and they disagreed. Then Tab on code, math and tables, which the cm6 demo refused: an
   atom becomes an item, its text, as a paragraph does (§3.3); and the host's outcome renamed,
   `notApplicable` to `deferredToHost` (§3.4).

The block apps and the text editors declare the values they were measured to fit; the SxS reads the
flat apps' blocks as their Markdown reads, then as their declared value says.

| | 18-align (`498238e`) | now |
| --- | ---: | ---: |
| config options | | `quotes`, `enterInQuote`, `listParent`, `listMoves` |
| spec cases | 1045 | 1143 (QuoteText1–22, QuoteAtom1–21, Lists1–15 and 8b, Regression33–64, Indent34–38 and 37b, Enter70) |
| spec tags | | `quote-container` retired |
| the outcome for the host's default | `notApplicable` | `deferredToHost` (`deferToHost(detail)`) |
| `npm test` | 1311 pass | 1409 pass, 0 fail |
| differential: runs failing to write | 0 | 0 (36 at Part 2's end, 35 of them Part 1's, cleared in Part 3) |
| inverse pairs: round trips failing to write | | 0 |
| random command test at more seeds than the suite's | 71 failing runs (3 seeds × 6,000 × each `quotes`, played at 18-align in Part 1) | 5 failing cases (4 seeds × 6,000 × every value), all tabs |
| SxS: block apps' agreements / cases played (disagreements) | 4635 / 6137 (1083) | 5492 / 7204 (1249) |
| SxS: text apps' | 1492 / 5201 (3316) | 1888 / 5480 (3193) |

§4.1 has the SxS by app at each stage, and against 18-align case by case.

Notation as in 18-align: `┃` caret, `«»` selection, `⏎` line break, `◌` held empty line, `¶` a block
outside every list as an app holds it. The block apps: Logseq (OG, LO), Logseq DB (LD), Tine (TI), Roam
(RR), Athens (AR), Dynalist (DL), WorkFlowy (WF), Tana (TA), RemNote with bullets (RB) and without
(RN), SiYuan (SY), BlockNote (BN). The text apps: Obsidian (OB), its Live Preview (LP), Outliner (OO)
and true-outliner (OT) setups, SilverBullet (SB), Emacs (EM). Each part keeps its own measurements,
taken against the stage before it ("HEAD" in a part is that stage: 18-align, Part 1's end, Part 2's
end); §4 has the whole against 18-align.

## Part 1. Quotes

What a quote is in ourus's outline, made an option, with an Enter option beside it. Its numbers
(§1.5) are at Part 1's end, against 18-align.

### 1.1 Why

#### 1.1.1 What the block apps skipped

The work started from an audit of the SxS's skips: each block app skipped 450 to 595 of 1,045 cases.
Counted by reason over the twelve setups (the first reason a case meets is the one recorded):

| reason | cells | |
| --- | ---: | --- |
| `quote` (the projection threw) | 1,180 | ~70 an app quote containers; ~27 an app quotes of one paragraph, which the apps hold |
| tag `free-form` | 1,044 | 116 an outliner, audited in 18-align §2.9 |
| tag `markup-fence`, `-task`, `-heading` | 1,350 | by design: these apps hold the markup as text |
| an option value the app lacks | ~860 | 768 of 863 cells really depend on it |
| callout | 269 | Obsidian's |
| selection across blocks | 236 | right for outliners; SiYuan and BlockNote a model change |
| caret in a marker, on a blank line, indented code | ~360 | states a block can't hold |
| keys an app lacks | ~350 | Athens's moves, WorkFlowy's and Tana's Shift-Enter, duplicate |
| numbered lists not from 1 | ~110 | the apps number from 1 |

The quotes were the real gap. Checked and left: an option a case names that changes nothing under
the app's value (95 of 863 cells, 76 playable, mostly contrast cases: Enter63b, Paste24b,
Regression16, Backspace17h, LogicalOutdent2–6); a caret in a marker that acts as at the text start
(Backspace2, Enter34, Indent28, Indent30, MoveDown32, MoveUp34, Outdent14, ~80 cells repeating the
text-start cases); the `markup-` tags (even the apps that play them skip three quarters of those
cells for other reasons).

#### 1.1.2 Quotes of one paragraph, played: the model's camps

Projected as a block whose text is `> ` before the paragraph's (an item's text where it starts the
item, `- > q`), the ~30 cases with quotes of one paragraph played in nine block apps: 209 cells, 140
agree, 53 disagree. The disagreements were camps against ourus, and the model's: ourus read `- > q`
as an item with no text holding a quote node (Quote1), every outliner as the block's text. So a
command from inside acted on different things: Shift-Tab in `- a⏎  - > ┃q` took the paragraph out of
the quote in ourus while all seven outliners and SiYuan outdented the block (Quote77); moving `g` up
in `- > q⏎  - ┃g` swapped it with the quote inside the item (Quote83); deleting the subtree deleted
the quote alone (DeleteSubtree12). At the quote's text start ourus unwrapped it, as SiYuan and
BlockNote do, where the apps holding `> ` as text delete a character or go to the line start
(Quote53, Quote94, CursorHome11). Hence an option for what a quote is (the user's call), its default
`text`.

### 1.2 Design

#### 1.2.1 `quotes: text | atom | container`

An outline option, beside `outdent` and `bullet`:

- **`text`** (the default): a quote of one paragraph is that paragraph, framed by `> ` on each line,
  as a heading's title is by its `#`s: `> q` is a paragraph node, `- > q` an item whose text is `q`
  (a lazy line, without `>`, is a line of it; blank `>` lines after it are its gap). It moves,
  indents, joins and is deleted as a paragraph or an item is; Backspace at its text start and Delete
  before it take the frame off as a unit, as a heading's `#`s go; Home goes past it. It owns the
  list after it as a paragraph does (under `listParent: paragraph`, the default, or `block`: Part
  2). A quote holding more (two paragraphs, a list, a heading) is a container, and a callout. A
  style on one block: WorkFlowy's quote layout, BlockNote's and SiYuan's quote blocks.
- **`atom`**: every quote, a callout too, is one node whose text is its lines as written, `>`
  included, as code or a table is: a list or a blank `>` line in it is characters, and an item can
  have it as its text (`- > q`), as it has code. Its `>` is the host's to edit as text; Backspace at
  its start and Delete above it join it as written; it owns no list (but under `listParent: block`,
  Part 2). The block's text in Logseq, Tine, Roam, Athens and Dynalist; lines of text in the text
  editors.
- **`container`**: ourus as it was: a quote is a node with no text of its own (but a callout's
  title), its blocks its children; commands act inside it as inside an item.

#### 1.2.2 `enterInQuote: line | split`

Enter in a quote's text (`text`) or in a quote atom (`atom`):

- **`line`** (the default): a line of the quote, its `> ` written, and in a quoted list's item
  (`atom`) its marker too (`> - `, a number counted on: `> 2. `); on an empty item its marker goes
  first; on an empty last line it leaves the quote, an empty paragraph after it (an item after an
  item). Obsidian (bare and with its Outliner), SilverBullet and WorkFlowy; SiYuan close (a second
  paragraph in its quote, then out).
- **`split`**: the rest of the text a node of its own after the quote, unquoted (an item after an
  item), the quote's later lines (`atom`) a quote of their own after it, as an outliner's new block
  holds them after its first line. Logseq, Tine, Roam, Athens, Dynalist split a block so; BlockNote
  its quote block.

Under `text` the choice was the user's after a probe of the apps (§1.4.2): `line` is (c), "a new line
in the quote, leaving it on an empty one"; `split` is (b), "the rest plain"; (a), "two quotes", no
app does. Under `atom` it is the outliners (`split`) against the text editors (`line`).

#### 1.2.3 What the values make of each quote

Drawn from the code (a script playing each buffer under each value, as the spec's runner does):
every node at its depth, its kind and its text (`⏎` a line break in it); `(quoted)` a paragraph or
item whose text is a quote's, framed by its `> `s; `atom (quote)` a quote whose text is its lines as
written.

<table>
<tr><th>buffer</th><th><code>container</code></th><th><code>text</code> (default)</th><th><code>atom</code></th></tr>
<tr><th colspan="4">Only a quote</th></tr>
<tr><td>one paragraph<pre>&gt; q</pre></td><td><pre>quote
  paragraph  q</pre></td><td><pre>paragraph (quoted)  &gt; q</pre></td><td><pre>atom (quote)  &gt; q</pre></td></tr>
<tr><td>one paragraph, two lines<pre>&gt; a
&gt; b</pre></td><td><pre>quote
  paragraph  a⏎b</pre></td><td><pre>paragraph (quoted)  &gt; a⏎&gt; b</pre></td><td><pre>atom (quote)  &gt; a⏎&gt; b</pre></td></tr>
<tr><td>a lazy line<pre>&gt; a
b</pre></td><td><pre>quote
  paragraph  a⏎b</pre></td><td><pre>paragraph (quoted)  &gt; a⏎b</pre></td><td><pre>atom (quote)  &gt; a⏎b</pre></td></tr>
<tr><td>a blank quoted line after it<pre>&gt; a
&gt;</pre></td><td><pre>quote
  paragraph  a</pre></td><td><pre>paragraph (quoted)  &gt; a</pre></td><td><pre>atom (quote)  &gt; a⏎&gt;</pre></td></tr>
<tr><td>two paragraphs<pre>&gt; a
&gt;
&gt; b</pre></td><td><pre>quote
  paragraph  a
  paragraph  b</pre></td><td><pre>quote
  paragraph  a
  paragraph  b</pre></td><td><pre>atom (quote)  &gt; a⏎&gt;⏎&gt; b</pre></td></tr>
<tr><td>a list<pre>&gt; - a
&gt; - b</pre></td><td><pre>quote
  item  a
  item  b</pre></td><td><pre>quote
  item  a
  item  b</pre></td><td><pre>atom (quote)  &gt; - a⏎&gt; - b</pre></td></tr>
<tr><td>a list, then a paragraph<pre>&gt; - a
&gt;
&gt; b</pre></td><td><pre>quote
  item  a
  paragraph  b</pre></td><td><pre>quote
  item  a
  paragraph  b</pre></td><td><pre>atom (quote)  &gt; - a⏎&gt;⏎&gt; b</pre></td></tr>
<tr><td>a heading and its section<pre>&gt; # H
&gt; text</pre></td><td><pre>quote
  heading  # H
    paragraph  text</pre></td><td><pre>quote
  heading  # H
    paragraph  text</pre></td><td><pre>atom (quote)  &gt; # H⏎&gt; text</pre></td></tr>
<tr><td>code<pre>&gt; ```
&gt; code
&gt; ```</pre></td><td><pre>quote
  atom  ```⏎code⏎```</pre></td><td><pre>quote
  atom  ```⏎code⏎```</pre></td><td><pre>atom (quote)  &gt; ```⏎&gt; code⏎&gt; ```</pre></td></tr>
<tr><td>nested<pre>&gt; &gt; q</pre></td><td><pre>quote
  quote
    paragraph  q</pre></td><td><pre>quote
  paragraph (quoted)  &gt; q</pre></td><td><pre>atom (quote)  &gt; &gt; q</pre></td></tr>
<tr><td>a callout (<code>flavor: obsidian</code>)<pre>&gt; [!note] Title
&gt; body</pre></td><td><pre>quote (callout)  [!note] Title
  paragraph  body</pre></td><td><pre>quote (callout)  [!note] Title
  paragraph  body</pre></td><td><pre>atom (quote)  &gt; [!note] Title⏎&gt; body</pre></td></tr>
<tr><th colspan="4">In items</th></tr>
<tr><td>an item's text<pre>- &gt; q</pre></td><td><pre>item
  quote
    paragraph  q</pre></td><td><pre>item (quoted)  &gt; q</pre></td><td><pre>atom (quote)  &gt; q</pre></td></tr>
<tr><td>under an item<pre>- a
  &gt; q</pre></td><td><pre>item  a
  quote
    paragraph  q</pre></td><td><pre>item  a
  paragraph (quoted)  &gt; q</pre></td><td><pre>item  a
  atom (quote)  &gt; q</pre></td></tr>
<tr><td>a quoted item, then an item<pre>- &gt; a
- b</pre></td><td><pre>item
  quote
    paragraph  a
item  b</pre></td><td><pre>item (quoted)  &gt; a
item  b</pre></td><td><pre>atom (quote)  &gt; a
item  b</pre></td></tr>
<tr><td>a quoted item with a child<pre>- &gt; a
  - b</pre></td><td><pre>item
  quote
    paragraph  a
  item  b</pre></td><td><pre>item (quoted)  &gt; a
  item  b</pre></td><td><pre>atom (quote)  &gt; a
  item  b</pre></td></tr>
<tr><th colspan="4">Next to paragraphs and lists</th></tr>
<tr><td>paragraph, then quote<pre>a
&gt; b</pre></td><td><pre>paragraph  a
quote
  paragraph  b</pre></td><td><pre>paragraph  a
paragraph (quoted)  &gt; b</pre></td><td><pre>paragraph  a
atom (quote)  &gt; b</pre></td></tr>
<tr><td>quote, then paragraph<pre>&gt; a
&nbsp;
b</pre></td><td><pre>quote
  paragraph  a
paragraph  b</pre></td><td><pre>paragraph (quoted)  &gt; a
paragraph  b</pre></td><td><pre>atom (quote)  &gt; a
paragraph  b</pre></td></tr>
<tr><td>item, then quote<pre>- a
&gt; b</pre></td><td><pre>item  a
quote
  paragraph  b</pre></td><td><pre>item  a
paragraph (quoted)  &gt; b</pre></td><td><pre>item  a
atom (quote)  &gt; b</pre></td></tr>
<tr><td>quote, then list<pre>&gt; a
- b</pre></td><td><pre>quote
  paragraph  a
item  b</pre></td><td><pre>paragraph (quoted)  &gt; a
  item  b</pre></td><td><pre>atom (quote)  &gt; a
item  b</pre></td></tr>
<tr><td>quoted list, then list<pre>&gt; - a
- b</pre></td><td><pre>quote
  item  a
item  b</pre></td><td><pre>quote
  item  a
item  b</pre></td><td><pre>atom (quote)  &gt; - a
item  b</pre></td></tr>
<tr><td>paragraph, quote, list<pre>a
&gt; b
- c</pre></td><td><pre>paragraph  a
quote
  paragraph  b
item  c</pre></td><td><pre>paragraph  a
paragraph (quoted)  &gt; b
  item  c</pre></td><td><pre>paragraph  a
atom (quote)  &gt; b
item  c</pre></td></tr>
<tr><td>in a heading's section<pre># H
&gt; q</pre></td><td><pre>heading  # H
  quote
    paragraph  q</pre></td><td><pre>heading  # H
  paragraph (quoted)  &gt; q</pre></td><td><pre>heading  # H
  atom (quote)  &gt; q</pre></td></tr>
</table>

#### 1.2.4 What commands do

Drawn from the code the same way: the buffer after each key, `enterInQuote: line` but where a row
names `split`; "refused" where ourus refuses the edit, "the host's" where it leaves the key to the
editor (the spec's player then does what an editor does: a character deleted, a line broken).

<table>
<tr><th>case</th><th><code>container</code></th><th><code>text</code> (default)</th><th><code>atom</code></th></tr>
<tr><th colspan="4">Quoted items</th></tr>
<tr><td>Backspace at a quoted item's text start<pre>- a
- &gt; ┃q</pre><code>deleteContentBackward, deleteContentBackward</code></td><td><pre>deleteContentBackward:
- a
- ┃q
&nbsp;
deleteContentBackward:
- a┃q</pre></td><td><pre>deleteContentBackward:
- a
- ┃q
&nbsp;
deleteContentBackward:
- a┃q</pre></td><td><pre>deleteContentBackward:
- a
- &gt;┃q
(the host's)
&nbsp;
deleteContentBackward:
- a
- ┃q
(the host's)</pre></td></tr>
<tr><td>Home in a quoted item<pre>- &gt; quote┃</pre><code>cursorLineBoundaryBackward</code></td><td><pre>- &gt; ┃quote</pre></td><td><pre>- &gt; ┃quote</pre></td><td><pre>- ┃&gt; quote</pre></td></tr>
<tr><td>Shift-Tab on a quoted child<pre>- a
  - &gt; ┃q</pre><code>outdent</code></td><td><pre>- a
  - ┃q</pre></td><td><pre>- a
- &gt; ┃q</pre></td><td><pre>- a
- &gt; ┃q</pre></td></tr>
<tr><td>move up the child of a quoted item<pre>- &gt; q
  - ┃g</pre><code>moveSubtreeUp</code></td><td><pre>- - ┃g
  &gt; q</pre></td><td><pre>- &gt; q
  - ┃g
(refused (no-previous-sibling))</pre></td><td><pre>- &gt; q
  - ┃g
(refused (no-previous-sibling))</pre></td></tr>
<tr><td>delete a quoted item's subtree<pre>- a
- &gt; q┃
  - g
- b</pre><code>deleteSubtree</code></td><td><pre>- a┃
- - g
- b</pre></td><td><pre>- a┃
- b</pre></td><td><pre>- a┃
- b</pre></td></tr>
<tr><td>Backspace on the item after a quoted item<pre>- &gt; a
- ┃b</pre><code>deleteContentBackward</code></td><td><pre>- &gt; a┃b</pre></td><td><pre>- &gt; a┃b</pre></td><td><pre>- &gt; a┃b</pre></td></tr>
<tr><td>Tab on the item after a quoted item<pre>- &gt; a
- ┃b</pre><code>indent</code></td><td><pre>- &gt; a
  - ┃b</pre></td><td><pre>- &gt; a
  - ┃b</pre></td><td><pre>- &gt; a
  - ┃b</pre></td></tr>
<tr><th colspan="4">Next to paragraphs and lists</th></tr>
<tr><td>Backspace at a quote below a paragraph<pre>a
&gt; ┃b</pre><code>deleteContentBackward</code></td><td><pre>a
&nbsp;
┃b</pre></td><td><pre>a
&nbsp;
┃b</pre></td><td><pre>a
&gt;┃b
(the host's)</pre></td></tr>
<tr><td>Delete before a quote<pre>- a┃
&gt; q</pre><code>deleteContentForward</code></td><td><pre>- a┃
&gt; q
(refused (not-expressible))</pre></td><td><pre>- a┃
&nbsp;
q</pre></td><td><pre>- a┃&gt; q</pre></td></tr>
<tr><td>Delete before a quoted item<pre>- a┃
- &gt; q</pre><code>deleteContentForward</code></td><td><pre>- a┃
- &gt; q
(refused (not-expressible))</pre></td><td><pre>- a┃
- q</pre></td><td><pre>- a┃&gt; q</pre></td></tr>
<tr><td>Tab on a quote below a list<pre>- a
&gt; ┃b</pre><code>indent</code></td><td><pre>- a
&gt; ┃b
(refused (no-previous-sibling))</pre></td><td><pre>- a
- &gt; ┃b</pre></td><td><pre>- a
- &gt; ┃b</pre>(§3.3)</td></tr>
<tr><td>Tab on an item below a quote<pre>&gt; a
- ┃b</pre><code>indent</code></td><td><pre>&gt; a
&gt; - ┃b</pre></td><td><pre>&gt; a
- ┃b
(refused (no-previous-sibling))</pre></td><td><pre>&gt; a
- ┃b
(refused (not-expressible))</pre></td></tr>
<tr><td>move up a quote below a paragraph<pre>a
&gt; b┃</pre><code>moveSubtreeUp</code></td><td><pre>&gt; b┃
&nbsp;
a</pre></td><td><pre>&gt; b┃
&nbsp;
a</pre></td><td><pre>&gt; b┃
&nbsp;
a</pre></td></tr>
<tr><td>move up a quote with a list after it<pre>para
&gt; q┃
- a</pre><code>moveSubtreeUp</code></td><td><pre>&gt; q┃
&nbsp;
para
- a</pre></td><td><pre>&gt; q┃
- a
&nbsp;
para</pre></td><td><pre>&gt; q┃
&nbsp;
para
- a</pre></td></tr>
<tr><td>Shift-Tab on a quote in an item's body<pre>- a
&nbsp;
  &gt; ┃b</pre><code>outdent</code></td><td><pre>- a
&nbsp;
  ┃b</pre></td><td><pre>- a
&nbsp;
  &gt; ┃b
(refused (not-expressible))</pre></td><td><pre>- a
&nbsp;
  &gt; ┃b
(refused (not-expressible))</pre></td></tr>
<tr><th colspan="4">Typing in a quote</th></tr>
<tr><td>Enter in the middle<pre>&gt; a┃b</pre><code>enter</code></td><td><pre>&gt; a
&gt;
&gt; ┃b</pre></td><td><pre>&gt; a
&gt; ┃b</pre></td><td><pre>&gt; a
&gt; ┃b</pre></td></tr>
<tr><td>Enter at the end, twice<pre>&gt; ab┃</pre><code>enter, enter</code></td><td><pre>enter:
&gt; ab
&gt;
&gt; ┃◌
&nbsp;
enter:
&gt; ab
&nbsp;
┃◌</pre></td><td><pre>enter:
&gt; ab
&gt; ┃
&nbsp;
enter:
&gt; ab
&nbsp;
┃◌</pre></td><td><pre>enter:
&gt; ab
&gt; ┃
&nbsp;
enter:
&gt; ab
&nbsp;
┃◌</pre></td></tr>
<tr><td>Enter at a quoted item's end, twice<pre>- &gt; ab┃</pre><code>enter, enter</code></td><td><pre>enter:
- &gt; ab
  &gt;
  &gt; ┃◌
&nbsp;
enter:
- &gt; ab
&nbsp;
  ┃◌</pre></td><td><pre>enter:
- &gt; ab
  &gt; ┃
&nbsp;
enter:
- &gt; ab
- ┃</pre></td><td><pre>enter:
- &gt; ab
  &gt; ┃
&nbsp;
enter:
- &gt; ab
- ┃</pre></td></tr>
<tr><td>Enter at the text's start<pre>&gt; ┃ab</pre><code>enter</code></td><td><pre>&gt; ┃◌
&gt;
&gt; ab</pre></td><td><pre>┃◌
&nbsp;
&gt; ab</pre></td><td><pre>&gt; 
&gt; ┃ab</pre></td></tr>
<tr><td>Shift-Enter at the end, then typing<pre>&gt; ab┃</pre><code>shiftEnter, "c"</code></td><td><pre>shiftEnter:
&gt; ab
&gt; ┃
&nbsp;
"c":
&gt; ab
&gt; c┃
(the host's)</pre></td><td><pre>shiftEnter:
&gt; ab
&gt; ┃
&nbsp;
"c":
&gt; ab
&gt; c┃
(the host's)</pre></td><td><pre>shiftEnter:
&gt; ab
&gt; ┃
&nbsp;
"c":
&gt; ab
&gt; c┃
(the host's)</pre></td></tr>
<tr><td>Shift-Enter in the middle, then Backspace<pre>- &gt; a┃b</pre><code>shiftEnter, deleteContentBackward</code></td><td><pre>shiftEnter:
- &gt; a
  &gt; ┃b
&nbsp;
deleteContentBackward:
- &gt; a┃b</pre></td><td><pre>shiftEnter:
- &gt; a
  &gt; ┃b
&nbsp;
deleteContentBackward:
- &gt; a┃b</pre></td><td><pre>shiftEnter:
- &gt; a
  ┃b
&nbsp;
deleteContentBackward:
- &gt; a┃b</pre></td></tr>
<tr><td>Enter in the middle (<code>enterInQuote: split</code>)<pre>&gt; a┃b</pre><code>enter</code></td><td><pre>&gt; a
&gt;
&gt; ┃b</pre></td><td><pre>&gt; a
&nbsp;
┃b</pre></td><td><pre>&gt; a
&nbsp;
┃b</pre></td></tr>
<tr><td>Enter at a quoted item's end (<code>enterInQuote: split</code>)<pre>- &gt; ab┃</pre><code>enter</code></td><td><pre>- &gt; ab
  &gt;
  &gt; ┃◌</pre></td><td><pre>- &gt; ab
- ┃</pre></td><td><pre>- &gt; ab
- ┃</pre></td></tr>
<tr><td>Enter in a quoted list<pre>&gt; - x┃
&gt; - y</pre><code>enter</code></td><td><pre>&gt; - x
&gt; - ┃
&gt; - y</pre></td><td><pre>&gt; - x
&gt; - ┃
&gt; - y</pre></td><td><pre>&gt; - x
&gt; - ┃
&gt; - y</pre></td></tr>
<tr><td>Shift-Tab in a quoted list<pre>&gt; - x
&gt; - ┃y</pre><code>outdent</code></td><td><pre>&gt; - x
- ┃y</pre></td><td><pre>&gt; - x
- ┃y</pre></td><td><pre>&gt; - x
&gt; - ┃y
(refused (not-expressible))</pre></td></tr>
<tr><td>plain paste<pre>- &gt; a┃b</pre><code>pastePlain</code><br>clipboard <code>"x\ny\n"</code></td><td><pre>- &gt; ax
  &gt; y
  &gt; ┃b</pre></td><td><pre>- &gt; ax
  &gt; y
  &gt; ┃b</pre></td><td><pre>- &gt; ax
  &gt; y
  &gt; ┃b</pre></td></tr>
<tr><td>plain paste with a blank line<pre>&gt; See ┃here.</pre><code>pastePlain</code><br>clipboard <code>"x\n\ny\n"</code></td><td><pre>&gt; See x
&gt;
&gt; y
&gt; ┃here.</pre></td><td><pre>&gt; See x
&nbsp;
&gt; y
&gt; ┃here.</pre></td><td><pre>&gt; See x
&gt; 
&gt; y
&gt; ┃here.</pre></td></tr>
<tr><td>items pasted into a quote<pre>&gt; a┃b</pre><code>paste</code><br>clipboard <code>"- x\n- y\n"</code></td><td><pre>&gt; ab
&gt;
&gt; - x
&gt; - y┃</pre></td><td><pre>&gt; ab
&nbsp;
- x
- y┃</pre></td><td><pre>&gt; ab
&nbsp;
- x
- y┃</pre></td></tr>
<tr><td>a quote pasted on an empty item<pre>- a
- ┃</pre><code>paste</code><br>clipboard <code>"&gt; q\n"</code></td><td><pre>- a
- &gt; q┃</pre></td><td><pre>- a
- &gt; q┃</pre></td><td><pre>- a
- &gt; q┃</pre></td></tr>
</table>

#### 1.2.5 The spec

The `quote-container` tag is retired. A case whose quote of one paragraph is a node says
`quotes: container` (23 cases: SoftBackspace7, DeleteSubtree12, Delete10, Delete34,
DuplicateSubtree5, Enter46, MoveUp35, TO-Bug197, PastePlain4, Paste9, Quote26, 35, 36, 65, 69, 70,
73, 77, 78, 80, 83, 89, Regression29); a quote holding more is a container under `text` too, so its
cases need nothing. `spec/quotes.md` says what `quotes` makes of a quote, keeps the container's rules,
and ends with two sections, "Quotes as text" (QuoteText1–22) and "Quotes as atoms" (QuoteAtom1–21),
their rules and cases each naming its values (QuoteText21–22 and QuoteAtom4–6 `enterInQuote:
split`). Each app declares its values, and a case naming none is judged under them (15-spec §8.1).

#### 1.2.6 Which apps declare what

| app | `quotes` | `enterInQuote` | evidence |
| --- | --- | --- | --- |
| Logseq (OG, DB), Tine, Roam, Athens, Dynalist | `atom` | `split` | a block's text is the quote's Markdown: Backspace at `- > ┃q` deletes a character, Home goes to the line start; a quoted item outdents, moves and is deleted as a block (Quote77, Quote83, DeleteSubtree12); Enter splits the block (§1.4.2) |
| WorkFlowy | `text` | `line` | its quote layout a style on one block; Enter a line in its quote, leaving it on an empty one (§1.4.2) |
| SiYuan | `text` | `line` | its quote block a style on one block; Backspace takes the `>` off as a unit; Enter a second paragraph in its quote, then out, `line` the closer (§1.4.2) |
| BlockNote | `text` | `split` | its quote block a style on one block; Backspace takes the `>` off as a unit; Enter the rest a plain paragraph (§1.4.2) |
| Obsidian (bare, Live Preview, Outliner, true-outliner), SilverBullet, Emacs | `atom` | `line` | measured (§1.4.3): `atom` agrees most, by far; Enter continues the quote and a quoted list |
| Tana | refuses quotes | | no quote: `> q` would be a name's text |
| RemNote (both) | refuses quotes | | its quote (a rem's style) not mapped yet |

No measured app fits `container` for a quote of one paragraph: Quote77, Quote83 and DeleteSubtree12
disagree with it everywhere, text editors included.

### 1.3 Implementation

#### 1.3.1 Reading

A quote that is a node's text keeps its `>`s: its text is read from its own prefix piece on each line
(`read.ts`, as a footnote definition's text keeps its label), so the writer writes it as any text's
lines and it reads back the same.

- `config.ts`: `quotes` (the outline group), `enterInQuote` (Enter's), each documented with who does
  what.
- `rules.ts`: `quoteKind` says what a quote is under `quotes`: `atom` any quote; `container` and a
  callout a container; under `text` a quote holding one paragraph from its first line a `paragraph`.
  `nodeKindOf` reads it so; `itemHead` takes a quote on an item's marker's line that is a text or an
  atom as the item's text.
- `outline.ts`: the option threaded into `readOutline` (reading uses `flavor` and `quotes`); a quoted
  paragraph's block is the quote, its head the paragraph in it, so blank `>` lines after it are its
  gap; `atom`'s head is the quote. `OutlineNodePersistent.textQuote` names the quote that is a node's
  text. Reading a container again (`copy`) checks each touched quote's kind, which its content can
  change (a callout's `[!type]` deleted, a paragraph more or fewer), and reads the container anew
  where it changed (incrementally a quote, freshly a paragraph, before: the random test's find).
- `text.ts`: `ProseTextType` `quote`, its frame each line's `>` and the space after it (`quote` parts;
  a lazy line has none); `normalize` makes it a paragraph's where its first line's `>` is gone.
- `read.ts`: a quote that is the node's text read from its prefix piece, the first line's padding past
  `> ` left out; each line's column for the escapes the column of its `>`.
- `escapes.ts`: a quoted text's lines asked past each one's `>`, from the column there, as a paragraph
  at a quote's start (`quoteStart`, as a callout's title), the `>`s put back.
- `locate.ts`: under `text` a quote's `>` is its text's frame (`frame quote 0`), under `atom` its
  characters; `doc.ts` `atTextColumn` counts a quoted text's own `>` and measures from past it.
- `copy.ts`: a copy from inside a quote atom keeps its `>`s, the text's characters.

#### 1.3.2 Writing, and the draft's normal form

- `draft.ts` placeholders: a line with nothing past its `>` is empty (a last one a blank line after the
  text; one inside it refused); an emptied quote (`> `) is held by a placeholder (`> ◌`), Markdown
  reading `>` alone as an empty quote; a quoted line starting with a tab past its `>` asks for the
  text's column.
- `draft.ts` normal form (`#quotedParagraphs`, `text`): a quote with no title left holding one
  paragraph with nothing under it (a join, a deletion, a move took the rest) is that paragraph,
  framed, in its place, an anchor in it moved past the `> `s; an item with no text whose quote that
  was takes it as its text. `#quoteAtoms` (`atom`): a quote left with no title is an atom of its
  paragraphs' lines (anything else in it refused), an item with no text taking it likewise.
  `#keepsKind` reads a quoted paragraph as a `blockquote`.
- `write.ts`: a later line's prefix stops before the node's own quote piece, which its text keeps; a
  lazy line stays lazy only where its node keeps its kind (a quoted paragraph made an item: its lazy
  `    - x` would start a list under the marker), not where a split made the node from one of another
  kind (Quote84); the blank line the caret is on after a quote's text is written `> `.

#### 1.3.3 Commands

Under `text`:

- Enter (`enter.ts`): an empty quote's `> ` goes; with `line` a line of it (as Shift-Enter), at the
  text's start rule 6's node above, and on the blank line after its text at its column (`> ┃`) a new
  paragraph after it (`leaveQuote`); with `split` the rest a paragraph after it, as any paragraph's.
- Shift-Enter and plain paste: a line break brings `> ` (a blank pasted line breaks it into two
  quotes; the last line before the text's rest has one).
- Backspace and Delete: at its text start its `>`s go, every line's (`unquote`), first under an empty
  item joining it, its checkbox kept (Quote94); at a later line's start the line joins with its `> `;
  Delete at a line's end takes the next line's `> ` with the break; before a quote, its `>`s first.
- Paste: a quoted paragraph is a block, not a plain line, so `> q` on an empty item is its text.

Under `atom` (`commands/quote.ts`, as `code.ts` is code's):

- Enter: `lineInQuote` and `splitQuote`, as §1.2.2 says; before the `>`, with `enterAtTextStart: stay`,
  a blank line above, the caret staying (else an empty node above). `split`'s quote of the lines
  after the caret's gives a lazy first one its `>` (§3.2.7).
- Shift-Enter: a line break, its new line lazy where one can stand (`> a⏎b`, as the apps' blocks hold
  it), after `> ` where it can't: the parser asked whether the quote, the line lazy, is one quote over
  every line still (not after an emptied quoted line, nor before a fence, HTML or a thematic break,
  §3.2.7); before the `>` refused.
- Plain paste: each line a line of the quote, after `> `, over a selection in it too.
- Backspace at its start and Delete above it join it to the text above as written (`joinQuoteUp`);
  Backspace at a node's start below it and Delete at its end join that text onto its last line
  (`joinIntoQuote`); inside it, Delete at a line's end joins the next line as written, Backspace at a
  later line's start joins it, its `> ` going with the break, and on an empty line past its `> ` the
  line goes; past a `> ` with text after it, the host deletes a character, as the apps do.
- Paste of nodes into it goes after it, as at a paragraph's text; a quote pasted on an empty item is
  its text, a quote atom leading an item as code does.
- Tab: an item, the quote its text, as any atom (Part 3's §3.3; it was refused).

#### 1.3.4 The SxS harness

- The projection (`block.ts`) reads quotes as containers, whatever ourus's `quotes`, and holds what the
  app's block holds (`ProjectOptions.quotes`, from the driver's `behaves.quotes`): under `atom` any
  quote is one block of its lines as written, from its `>` (an item with no text whose first block it
  is having it as its text, its descendants none of their own); else a quote of one paragraph is a
  block whose text is `> ` before the paragraph's, an item's text where it starts the item, a quote
  right after an item's text its block's with `paragraphsInBlock`; any other quote throws, a callout
  `callout`.
- Judging (`lazyQuotes`): a quote's later lines compare the same lazy or quoted (`> a⏎> b`), wherever
  in a block the quote starts, after a `>` with no space too, the selection moving with them.
- Drivers: WorkFlowy loads `> q` as its `quote-block` layout; SiYuan writes every line quoted, reads a
  quote lazy and places a selection by its own Markdown's offsets (`quotedOffset`); BlockNote a
  `quote` block (refusing one in a list item); those three refuse a caret on the `>`. Tana and RemNote
  refuse `quote` (RemNote's round-trip test skips what the setup refuses). The declarations of §1.2.6.

### 1.4 Verification

#### 1.4.1 The random command test under each value

The suite's random command test runs the default at its seed, 2,000 runs. Run under `text`, `atom`
and `container` at three seeds, 6,000 runs each, and each failing run played on 18-align's code (`git
archive HEAD`): 76 failing runs, 71 failing there too, none quote-specific (refused writes of lists
with tabs, a moved paragraph's line, numbered items), left; the 5 new fixed (Enter at a quote atom's
later line's start left its text ending in an empty line; a quoted line `> →1. a` asked about from
column 0). On the suite's own runs it found the writer's three quote bugs and the incremental read
above.

Not run: the differential (`node test/differential.ts`), which would have shown 35 runs of quoted
texts failing to write (a lazy line's escapes, the seam check's `>`s, a quoted text's leading
spaces). Found and fixed in Part 3.

#### 1.4.2 Probes in the block apps

15 probes (`sxs/probe.ts block`): Enter, Shift-Enter, Backspace, Delete, Home, Tab, paste and
Cmd-Backspace in a quote.

- Enter: the six atom outliners split, the rest an unquoted block, at the end an empty block;
  WorkFlowy a line in its quote, leaving it on an empty one for a new item; SiYuan a second paragraph
  in its quote, then out; BlockNote the rest a plain paragraph. The text editors' runs: a line in the
  quote, leaving it on an empty one (Quote35, Quote36), a quoted list continued (Quote29, Quote30).
- Shift-Enter and plain paste: a line in the same quote everywhere.
- Backspace at `> ┃q`: the atom outliners delete a character, then the `>`; SiYuan and BlockNote take
  the `>` off as a unit; WorkFlowy nothing. Delete before `- > q`: the atom outliners join it as
  written; SiYuan takes its `>` off first.
- Home: the atom outliners to the line start, WorkFlowy and SiYuan to the text start. Tab: every app
  indents the block. Items pasted into a quote: after it in the atom outliners.

#### 1.4.3 Choosing the text editors' values

Every quote case played in the text apps with `--ignore-options` in a copy of `.sxs` (the cases
naming a value included; Emacs from its own runs), each judged against ourus replayed under each
`quotes` value with the app's other values:

| app | quote cases | agree: `text` | `atom` | `container` | where they differ, agreeing: `text` / `atom` / `container` |
| --- | ---: | ---: | ---: | ---: | --- |
| Obsidian, Live Preview | 166 | 38 | 55 | 30 | 21 / 38 / 13 |
| Obsidian Outliner | 166 | 41 | 78 | 29 | 21 / 58 / 9 |
| true-outliner | 166 | 35 | 70 | 24 | 20 / 55 / 9 |
| SilverBullet | 166 | 37 | 62 | 29 | 17 / 42 / 9 |
| Emacs | 144 | 16 | 65 | 14 | 2 / 51 / 0 |

A text editor edits a quote's `>`s as characters on its lines. Under `atom` their two remaining
patterns were Enter, which continues the quote and a quoted list (about 15 cases: QuoteText7–10, 19,
QuoteAtom4, 6, Quote29, 30, 32–34, 37, 90, Enter36b, Fence57), hence `enterInQuote`'s `line` under
`atom`; and callouts, which they edit as text (about 12: Quote13, 38, 40, 41, 47, 57, 58, 60–62, 71,
79, Enter68, Paste23, 25), hence callouts as atoms under `atom`, which the outliners also hold as a
block's text. What they still do otherwise: as a container, Tab in a quoted list nests in the quote
(Quote2–10); as `text`, Shift-Enter writes the next line's `> ` (Quote44) and Obsidian's Home goes
past the `> ` (CursorHome11, 16).

#### 1.4.4 The runs

A full run of every app on every file, `.sxs` cleaned first (13 minutes, no error, nothing hung, no
case not run). Against 18-align, on the cases both judgments have, nothing moved in the block apps but
noise (Roam's CursorLeft3, a caret lost after a motion; Tine's PasteList27, which 18-align saw flip;
a Tana cell to agree); the text
apps gained (Obsidian 242 to 272 agreements, Live Preview 236 to 266, Outliner 313 to 360,
true-outliner 274 to 321, SilverBullet 249 to 284, Emacs 169 to 217). New cells: 1016, 797 agree, 7
caret, 43 whitespace, 169 disagree.

Fixed from the runs' disagreements (each found in the data, then checked in the apps' states): the
judging of lazy lines anywhere in a block; under `atom`, Shift-Enter's lazy line, the line joins of
§1.3.3, plain paste over a selection across a quote's lines (PastePlain18, left to the host, its second
line out of the quote), a copy keeping its `>`s (Copy3), `split` with the quote's lines after the
caret (Quote38, 40, 41, QuoteAtom16). Drawing §1.2.4 from the code found three more (the joins into a
quote atom, items pasted into one, a quote pasted on an empty item).

The disagreements left on quote cases: the apps' own paste and HTML importers (PasteHtml12,
TO-Bug264, QuoteText13, 16, Quote76, QuoteText12, Quote63), SiYuan's and BlockNote's ownership
(Quote27, QuoteText15), ourus's older behaviors (§5), and the open cases of §5.

### 1.5 Numbers

Disagreements out of the cases played, at 18-align and at Part 1's end (§4.1 has every stage):

| app | 18-align | Part 1's end | quote cases (agree / disagree) |
| --- | ---: | ---: | ---: |
| Logseq (OG) | 37 / 502 (7.4%) | 49 / 626 (7.8%) | 124 (107 / 12) |
| Logseq (DB) | 37 / 490 (7.6%) | 47 / 612 (7.7%) | 122 (106 / 10) |
| Roam | 28 / 482 (5.8%) | 39 / 606 (6.4%) | 124 (106 / 11) |
| Tine | 49 / 503 (9.7%) | 60 / 626 (9.6%) | 123 (100 / 11) |
| Athens | 46 / 450 (10.2%) | 58 / 562 (10.3%) | 108 (93 / 11) |
| Dynalist | 80 / 536 (14.9%) | 96 / 655 (14.7%) | 123 (100 / 19) |
| WorkFlowy | 114 / 507 (22.5%) | 124 / 537 (23.1%) | 30 (20 / 10) |
| Tana | 94 / 464 (20.3%) | 93 / 464 (20.0%) | refuses |
| SiYuan | 165 / 583 (28.3%) | 178 / 619 (28.8%) | 36 (23 / 13) |
| BlockNote | 164 / 595 (27.6%) | 177 / 623 (28.4%) | 28 (14 / 13) |
| RemNote (bl), RemNote | 110 / 487, 159 / 538 | the same | refuse |
| block apps | 1083 / 6137 (17.6%) | 1190 / 6955 (17.1%) | |
| Obsidian, Live Preview | 578 / 875, 570 / 861 | 545 / 888, 537 / 874 | 144 (74 / 60) |
| Obsidian Outliner | 504 / 872 | 449 / 885 | 146 (95 / 44) |
| true-outliner | 466 / 840 | 419 / 852 | 144 (88 / 50) |
| SilverBullet | 559 / 880 | 509 / 893 | 144 (71 / 56) |
| Emacs | 639 / 873 | 581 / 885 | 148 (70 / 63) |

The block apps run about 95 cases more each under `atom` (the quote containers they skipped, the new
cases), SiYuan and BlockNote 26 to 36, WorkFlowy 30. The text apps' rates are mostly their non-quote
cases, where they act as text editors.

## Part 2. Lists after blocks

What a list right after a block is the children of, made an option, and how a flat list moves among
the blocks: one block (SiYuan) or each item one (BlockNote, RemNote without bullets). Its numbers are
against Part 1's end.

### 2.1 Why

#### 2.1.1 Who owns the list after a paragraph

Markdown has no parent for a list: `Intro⏎- a` is a paragraph and a list, side by side. ourus's
outline gave the list to the paragraph (18-align §2: a paragraph in the root or a heading's section
owns the lists right after it), so it moved, went and indented with it. The outliners agree: their
blocks hold their children, and a paragraph loaded as a block with the items under it is that
outline. Two apps don't (and RemNote without bullets, as it turned out: §2.4.2):

- **SiYuan** holds a document as a flat sequence of blocks, a list one of them: a paragraph moves past
  the whole list, an item moves among its list's items, a paragraph's subtree is the paragraph.
- **BlockNote** holds blocks too, flat where they come from Markdown, each item a block of its own:
  a paragraph moves past one item, splitting the list, and an item at its list's edge out past the
  block beside it. Any block can take children (Tab on an item after a paragraph nests it there,
  Indent11), which Markdown can't write of a paragraph.

Their drivers read the apps' blocks back through `ownBlocks` (sxs/lib/block.ts), which nests them as
ourus's outline would: a list after a free paragraph made the paragraph's. That hid the model: where
SiYuan moved a paragraph past its list, the read gave the list back to the paragraph, and the cell
disagreed for a reason no option could name. 18-align §5 deferred the experiment; Part 1's open list put
it next, with the quote case beside it (a quote of one paragraph adopts the list after it under
`quotes: text`, a quote atom doesn't under `atom`).

#### 2.1.2 What BlockNote's read hid

BlockNote's first try under `container` came out 395 against `paragraph`'s 397, 14 cells worse, and
the reason given then (it "nests children under any block") argued for neither value. The cells
were of two kinds:

- **A list BlockNote keeps under a paragraph** (Backspace8: `- a⏎- ┃b⏎  - c`, Backspace at `b`, which
  becomes a paragraph, `c` still its child; Enter3d, Enter65e). The driver's read kept an app's own
  children as children (`ownBlocks`), so `¶ b` with `- c` under it disagreed with `container`'s
  outline, `c` beside `b`. But Markdown can't say a paragraph's child: BlockNote's state written out
  is `b⏎- c` (or `b⏎  - c`, the same list after the paragraph), which `container` reads as ourus
  wrote it. The read judged a structure no Markdown has.
- **Moves**: BlockNote moves a paragraph past one item (Lists1), an item at a list's edge past a
  paragraph (MoveDown8), which `container`, modelled on SiYuan, didn't do.

And under `paragraph` the read hid the other way: its rule (`ownsList`, a free paragraph adopts the
items after it) was hard-coded, not the app's declared value, so every flat list after a paragraph
was read as the paragraph's, which `paragraph` then matched. The fix (§2.3.4): the read takes an app's
blocks as their Markdown reads, what a free block holds beside it, then adopts as the app's
`listParent` says; and a second option says how a flat list moves (§2.2.2). Read so, BlockNote
measured the same under `paragraph`, `block` and `container` with SiYuan's moves (397 each, §2.4.2),
and best under `container` with its own (401).

#### 2.1.3 The name

`listOwners: paragraphs | blocks | none` was the first proposal. Ranked against names that say what
the list is to the block (`listsAdoptedBy`, `listAdoption`, `outlineLists`), the user chose
`listParent`: what a list after a block is the children of, the values the parent, `container` the
section the block is in. Adoption is the word the code uses for it (`listAdopters`, `adoptsLists`).
`listMoves` (§2.2.2) was named in this work, after `listParent`, and is open for review (§5).

### 2.2 Design

#### 2.2.1 `listParent: paragraph | block | container`

An outline option, beside `quotes`, for lists in the document's own sections; in an item or a quote
a list is the container's under every value, as before (a paragraph in an item owns no list):

- **`paragraph`** (the default): the list right after a paragraph is its children (a quote of one
  paragraph's too, `quotes: text`, which is a paragraph). It moves and goes with the paragraph; an
  item moved down past the paragraph becomes its list's first; a paragraph indented after it goes
  into its list. Markdown's reading in the text editors, the outliners' blocks.
- **`block`**: any block's but a heading's (it owns its section) and a quote's that is a container
  (its children are inside it): code's, a table's, a quote atom's too. No app declares it yet.
- **`container`**: no block's; the list's items are the section's, beside the block before them; a
  paragraph's subtree is the paragraph. How items and blocks pass each other, `listMoves` says.
  SiYuan, BlockNote and RemNote without bullets.

#### 2.2.2 `listMoves: list | item`

Under `listParent: container`, what Alt-Shift-Up and -Down take a list as among the blocks beside it
(it changes nothing under the other values, where a list is a block's children):

- **`list`** (the default): one block, as SiYuan's list is a block holding its items. A block moves
  past the whole list, as far as it goes on (`1. a⏎- b` is two lists); the items move among
  themselves, and all of them (a list of one item) past a block; an item at a longer list's edge
  stays in it.
- **`item`**: each item a block of its own, as BlockNote's are. A block moves past one item,
  splitting the list; an item at its list's edge moves past the block beside it, joining a list on
  the other side.

Drawn from the code, under `listParent: container`:

<table>
<tr><th>case</th><th><code>list</code> (default)</th><th><code>item</code></th></tr>
<tr><td>A paragraph, down (Lists2, Lists13)<pre>Intro┃
&nbsp;
- a
- b
&nbsp;
Next</pre><code>moveSubtreeDown</code></td><td><pre>- a
- b
&nbsp;
Intro┃
&nbsp;
Next</pre></td><td><pre>- a
&nbsp;
Intro┃
&nbsp;
- b
&nbsp;
Next</pre></td></tr>
<tr><td>A paragraph, up (Lists3, Lists14)<pre>Intro
&nbsp;
- a
- b
  - b1
&nbsp;
Next┃</pre><code>moveSubtreeUp</code></td><td><pre>Intro
&nbsp;
Next┃
&nbsp;
- a
- b
  - b1</pre></td><td><pre>Intro
&nbsp;
- a
&nbsp;
Next┃
&nbsp;
- b
  - b1</pre></td></tr>
<tr><td>Two lists after a paragraph (Lists6)<pre>pa┃ra
1. a
- b
&nbsp;
next</pre><code>moveSubtreeDown</code></td><td><pre>1. a
&nbsp;
pa┃ra
- b
&nbsp;
next</pre></td><td><pre>1. a
&nbsp;
pa┃ra
- b
&nbsp;
next</pre></td></tr>
<tr><td>An item at a list’s edge (Lists8, Lists15)<pre>- a
- b┃
&nbsp;
para
&nbsp;
- c</pre><code>moveSubtreeDown</code></td><td>refused (not-expressible)</td><td><pre>- a
&nbsp;
para
&nbsp;
- b┃
- c</pre></td></tr>
<tr><td>A list of one item (Lists8b)<pre>- b┃
&nbsp;
para
&nbsp;
- c</pre><code>moveSubtreeDown</code></td><td><pre>para
&nbsp;
- b┃
- c</pre></td><td><pre>para
&nbsp;
- b┃
- c</pre></td></tr>
<tr><td>Items among items<pre>- a
- b┃
- c</pre><code>moveSubtreeDown</code></td><td><pre>- a
- c
- b┃</pre></td><td><pre>- a
- c
- b┃</pre></td></tr>
</table>

#### 2.2.3 What each value reads

Drawn from the code (`readOutline` under each value): every node at its depth, its kind and its text.

<table>
<tr><th>buffer</th><th><code>paragraph</code> (default)</th><th><code>block</code></th><th><code>container</code></th></tr>
<tr><td><pre>Intro
- a
- b</pre></td><td><pre>paragraph "Intro"
  item "a"
  item "b"</pre></td><td><pre>paragraph "Intro"
  item "a"
  item "b"</pre></td><td><pre>paragraph "Intro"
item "a"
item "b"</pre></td></tr>
<tr><td><pre>```
x
```
- a</pre></td><td><pre>atom "```⏎x⏎```"
item "a"</pre></td><td><pre>atom "```⏎x⏎```"
  item "a"</pre></td><td><pre>atom "```⏎x⏎```"
item "a"</pre></td></tr>
<tr><td><pre>| a |
| - |
- x</pre></td><td><pre>atom "| a |⏎| - |"
item "x"</pre></td><td><pre>atom "| a |⏎| - |"
  item "x"</pre></td><td><pre>atom "| a |⏎| - |"
item "x"</pre></td></tr>
<tr><td><pre>&gt; q
- a</pre>(<code>quotes: text</code>)</td><td><pre>paragraph "&gt; q"
  item "a"</pre></td><td><pre>paragraph "&gt; q"
  item "a"</pre></td><td><pre>paragraph "&gt; q"
item "a"</pre></td></tr>
<tr><td><pre>&gt; q
- a</pre>(<code>quotes: atom</code>)</td><td><pre>atom "&gt; q"
item "a"</pre></td><td><pre>atom "&gt; q"
  item "a"</pre></td><td><pre>atom "&gt; q"
item "a"</pre></td></tr>
<tr><td><pre>&gt; - q
- a</pre></td><td><pre>quote
  item "q"
item "a"</pre></td><td><pre>quote
  item "q"
item "a"</pre></td><td><pre>quote
  item "q"
item "a"</pre></td></tr>
<tr><td><pre># H
Intro
- a
  - a1
&nbsp;
Next
- b</pre></td><td><pre>heading "# H"
  paragraph "Intro"
    item "a"
      item "a1"
  paragraph "Next"
    item "b"</pre></td><td><pre>heading "# H"
  paragraph "Intro"
    item "a"
      item "a1"
  paragraph "Next"
    item "b"</pre></td><td><pre>heading "# H"
  paragraph "Intro"
  item "a"
    item "a1"
  paragraph "Next"
  item "b"</pre></td></tr>
<tr><td><pre>- a
&nbsp;
  Intro
  - b</pre></td><td colspan="3"><pre>item "a"
  paragraph "Intro"
  item "b"</pre>(in an item, under every value)</td></tr>
</table>

#### 2.2.4 What commands do

Drawn from the code the same way: the buffer after the command under each value (`container` with
`listMoves: list`, §2.2.2 has `item`); "refused" where ourus refuses it. Only the commands that ask
whether a node adopts lists differ (`move-subtree`, `indent`, `paste`, and `deleteSubtree` through the
subtree it reads); where the text comes out the same, the values agree.

<table>
<tr><th>case</th><th><code>paragraph</code> (default)</th><th><code>block</code></th><th><code>container</code></th></tr>
<tr><th colspan="4">Moves</th></tr>
<tr><td>A paragraph, down (Lists1, Lists2)<pre>Intro┃
&nbsp;
- a
- b
&nbsp;
Next</pre><code>moveSubtreeDown</code></td><td><pre>Next
&nbsp;
Intro┃
&nbsp;
- a
- b</pre></td><td><pre>Next
&nbsp;
Intro┃
&nbsp;
- a
- b</pre></td><td><pre>- a
- b
&nbsp;
Intro┃
&nbsp;
Next</pre></td></tr>
<tr><td>A paragraph, up past a list (Lists3)<pre>Intro
&nbsp;
- a
  - a1
- b
&nbsp;
Next┃</pre><code>moveSubtreeUp</code></td><td><pre>Next┃
&nbsp;
Intro
&nbsp;
- a
  - a1
- b</pre>(past Intro and its list)</td><td><pre>Next┃
&nbsp;
Intro
&nbsp;
- a
  - a1
- b</pre></td><td><pre>Intro
&nbsp;
Next┃
&nbsp;
- a
  - a1
- b</pre></td></tr>
<tr><td>Code, down (Lists4, Lists5)<pre>```
x┃
```
- a
&nbsp;
Next</pre><code>moveSubtreeDown</code></td><td>refused (not-expressible)</td><td><pre>Next
&nbsp;
```
x┃
```
- a</pre></td><td><pre>- a
&nbsp;
```
x┃
```
Next</pre></td></tr>
<tr><td>Two lists after a paragraph (Lists6, MoveDown29)<pre>pa┃ra
1. a
- b
&nbsp;
next</pre><code>moveSubtreeDown</code></td><td><pre>next
&nbsp;
pa┃ra
1. a
- b</pre></td><td><pre>next
&nbsp;
pa┃ra
1. a
- b</pre></td><td><pre>1. a
&nbsp;
pa┃ra
- b
&nbsp;
next</pre></td></tr>
<tr><td>A quote of one paragraph (Lists11, Lists12)<pre>&gt; q┃
- a
&nbsp;
Next</pre><code>moveSubtreeDown</code></td><td><pre>Next
&nbsp;
&gt; q┃
- a</pre></td><td><pre>Next
&nbsp;
&gt; q┃
- a</pre></td><td><pre>- a
&nbsp;
&gt; q┃
&nbsp;
Next</pre></td></tr>
<tr><td>An item at a list's edge (Lists7, Lists8)<pre>- a
- b┃
&nbsp;
para
&nbsp;
- c</pre><code>moveSubtreeDown</code></td><td><pre>- a
&nbsp;
para
&nbsp;
- b┃
- c</pre></td><td><pre>- a
&nbsp;
para
&nbsp;
- b┃
- c</pre></td><td>refused (not-expressible)</td></tr>
<tr><td>A list of one item (Lists8b, MoveDown2)<pre>- b┃
&nbsp;
para
&nbsp;
- c</pre><code>moveSubtreeDown</code></td><td><pre>para
&nbsp;
- b┃
- c</pre></td><td><pre>para
&nbsp;
- b┃
- c</pre></td><td><pre>para
&nbsp;
- b┃
- c</pre></td></tr>
<tr><th colspan="4">Delete, indent, outdent, paste</th></tr>
<tr><td>A paragraph's subtree deleted (Lists9, Lists10)<pre>Intro┃
- a
- b
&nbsp;
Next</pre><code>deleteSubtree</code></td><td><pre>┃Next</pre></td><td><pre>┃Next</pre></td><td><pre>- ┃a
- b
&nbsp;
Next</pre></td></tr>
<tr><td>A first item indented (Indent11)<pre>Intro
&nbsp;
- a┃</pre><code>indent</code></td><td>refused (no-previous-sibling)</td><td>refused (no-previous-sibling)</td><td>refused (not-expressible)</td></tr>
<tr><td>A paragraph indented after a paragraph<pre>Intro
&nbsp;
Next┃</pre><code>indent</code></td><td><pre>Intro
&nbsp;
- Next┃</pre>(Intro's list's)</td><td><pre>Intro
&nbsp;
- Next┃</pre></td><td><pre>Intro
&nbsp;
- Next┃</pre>(an item where it is)</td></tr>
<tr><td>A paragraph indented after code<pre>```
x
```
&nbsp;
Next┃</pre><code>indent</code></td><td><pre>```
x
```
&nbsp;
- Next┃</pre>(an item where it is)</td><td><pre>```
x
```
&nbsp;
- Next┃</pre>(the code's list's)</td><td><pre>```
x
```
&nbsp;
- Next┃</pre></td></tr>
<tr><td>A top-level item outdented<pre>- a┃
  - b</pre><code>outdent</code></td><td><pre>a┃
- b</pre>(b a's)</td><td><pre>a┃
- b</pre></td><td><pre>a┃
- b</pre>(b beside a)</td></tr>
<tr><td>Items pasted at a paragraph's end<pre>Intro┃
- a</pre><code>paste</code> <code>- x</code></td><td><pre>Intro
- x┃
- a</pre>(first in its list)</td><td><pre>Intro
- x┃
- a</pre></td><td><pre>Intro
- x┃
- a</pre>(after it, joining the list)</td></tr>
</table>

#### 2.2.5 The spec

`spec/lists.md` (16 cases), listed in the spec README: the values side by side where the text comes
out apart: a paragraph's moves (Lists1–3, Lists6), code's (Lists4, Lists5), a quote of one paragraph's
(Lists11, Lists12), items past a paragraph (Lists7, Lists8, Lists8b), a paragraph's subtree deleted
(Lists9, Lists10), and `listMoves: item`'s moves (Lists13–15). The cases of the other files assume
`paragraph`; the SxS plays them in SiYuan, BlockNote and RemNote without bullets under `container`
where their text says the same ("Adapted: under listParent: container").

#### 2.2.6 Which apps declare what

| app | `listParent` | `listMoves` | why |
| --- | --- | --- | --- |
| SiYuan | `container` | `list` | its blocks a flat sequence, a list one block: +11 (MoveDown8, -24, -29, -39, MoveUp7, -17, -21, Paste4, PasteList19, QuoteText15, TO5), none worse |
| BlockNote | `container` | `item` | flat from Markdown, each item a block: +5, none worse (§2.4.2: every value read honestly ties at 397 but this one) |
| RemNote without bullets | `container` | `item` | a flat run of rems: +6 (DeleteSubtree3, MoveDown24, -29, MoveUp17, DirectOutdent4, LogicalOutdent4), none worse |
| the outliners, RemNote with bullets | `paragraph` | | every block an item: a list is always some block's children, the same text |
| the text editors | `paragraph` | | Markdown's reading |

### 2.3 Implementation

#### 2.3.1 Reading

- `config.ts`: `listParent` and `listMoves` in the outline group, documented with who does what.
- `rules.ts`: `listAdopters(listParent)`, the node kinds that adopt the list after them (`paragraph`
  the paragraphs, `block` paragraphs and atoms, `container` none). `outlineChildren(flat, root,
  config)` takes the config (it took a flag): adoption only where `root` (the document's own
  sections), by those kinds.
- `outline.ts`: `ReadConfig` (`quotes`, `listParent`) threaded into `readOutline`; the visit of what
  can adopt includes atoms.
- `doc.ts`: `adoptsLists(node)`: the node's kind adopts under the config, in a section that owns lists
  (`ownsLists`, reworded in `node.ts` as the scope check it is). The commands ask it.

#### 2.3.2 The draft

- `#regroup` flattens atoms too, as paragraphs, before regrouping, and regroups by the draft's config.
- `#movedLines` (`container` only): a node now in another container than it was (a list out from
  under the paragraph it was under) whose text has a later line that could start a block is spelled
  again where it lands, with its escapes, and so is any such node under it. A line counts where it is
  not lazy, or lazy past spaces (which may reach the new container's content column: `      - [x] `
  continuing `2) x` in an item two columns deep, outdented, was inside the item). A heading's lines
  don't (a setext underline is its frame; escaping it made it a paragraph). Part 3 shares its check
  with Done's (`#unmovable`, §3.2.4).
- `#ownLines` (every value): a spelled node's first line keeps the padding the writer keeps (under
  four columns, no held space, `#padding`): the seam check read `cont` where the writer wrote
  `  cont`, and passed a paragraph that joined the item above it.
- `#list` (every value): the lower part of a list split by an item that became a paragraph is
  numbered from 1 where it is right under that paragraph, as it was where the paragraph adopted it
  (TO6): under `container` it stays beside the paragraph, and kept its numbers behind a blank line
  (`3. a⏎⏎┃b⏎⏎5. c`), where SiYuan and BlockNote number it from 1 (DirectOutdent6, TO5, TO6).

#### 2.3.3 Commands

- `indent.ts`: a paragraph indented after a node that adopts lists goes into its list, else it is an
  item where it is (`adoptsLists`, for `paragraph`'s `above.kind === 'paragraph'`).
- `move-subtree.ts`: an item moved down past a node that adopts lists becomes its list's first.
  Under `container` (in a section) items and blocks pass each other, as `listMoves` says: under
  `list` a block passes the whole list, as far as `listOf` says it is one list, the items of a whole
  list pass a block, and an item at a longer list's edge is refused, as items and blocks are
  elsewhere; under `item` each passes the one beside it.
- `paste.ts`: `endSlot`'s paragraph case asks `adoptsLists`: items pasted at the end of a node that
  adopts lists go first in its list, else after it, joining a list right after it.

#### 2.3.4 The SxS harness

- `sxs/lib/block.ts`: the projection reads ourus's outline under the app's `listParent` (as it does
  `quotes: container`), so a flat app's blocks are judged against a flat outline.
- `sxs/lib/plan.ts`: `listParent` is part of a driver's shape, so the plan adapts a case to an app's
  value where the text says the same, and skips it where it doesn't.
- `sxs/lib/block.ts`: `listOwner(listParent)`, the free blocks that adopt the list after them under a
  value, as ourus reads the projection's text (its quotes containers, adopting nothing); and
  `asMarkdownReads(blocks, listParent)`, an app's blocks as their Markdown reads: what a free block
  holds lifted beside it (`liftOwned`), then adopted by `listOwner` (`ownBlocks`). A test pins both.
- `sxs/blocknote/driver.ts`: declares `container` and `listMoves: item`; its read is
  `asMarkdownReads` under its declared value (it was `ownBlocks` with a hard-coded paragraph rule,
  which kept a paragraph's own children as children).
- `sxs/siyuan/driver.ts`: declares `container`; its read no longer nests a list under the paragraph
  before it (`owns` gone from the page's read; `ownBlocks` by `listOwner` of its value). SiYuan holds
  no children under a paragraph, so it needs no lift.
- `sxs/remnote/driver.ts`: without bullets, declares `container` and `listMoves: item`; `own` adopts
  as the declared value says (it was the paragraph rule, hard-coded). A rem without a bullet holds no
  children, so it needs no lift either.
- `sxs/lib/block.ts`: `readOutline` reads a line deeper than a child of the block above as a line of
  that block's text (§2.4.2).

### 2.4 Verification

#### 2.4.1 The random command test under each value

The broad random test (`commands keep text, changes and selection consistent`), 6,000 runs at four
seeds, under each `listParent` (`container` with each `listMoves`) with each `quotes`: every run that
fails to write played again at HEAD (Quotes). Under `paragraph` and `block`, none fails that doesn't
fail at HEAD. Under `container`, the runs found five gaps, three of them fixed (§2.3.2: the lazy line
past spaces, the setext underline, the padding the seam check didn't see); two remained, the same
under both `listMoves`, fixed in Part 3 (the item after a moved list at its old column, §3.2.3;
CommonMark's checkbox, §3.2.5).

Not run: the differential. Run after (Part 3), it showed no run failing to write that the Quotes
commit writes; its 36, 35 of them Part 1's quoted texts, were fixed in Part 3.

#### 2.4.2 The apps

BlockNote played in full under each value, read as its Markdown reads (§2.1.2), against the Quotes
judgment (397 of 623 agree):

| BlockNote under | agree | worse | better |
| --- | ---: | ---: | ---: |
| `paragraph` | 397 | 0 | 0 |
| `block` | 397 | 0 | 0 |
| `container`, `listMoves: list` | 397 | 5 (MoveDown8, -39, MoveUp7, -21: an item at a list's edge; TO6) | 5 |
| `container`, `listMoves: item` | 401, 402 with the numbering of §2.3.2 | 0 | 5 (Backspace50b, MoveDown24, -29, MoveUp17, QuoteText15) |

The old read under `container` had come out 395, 14 worse (§2.1.2). Probes of the apps' moves:

- SiYuan moves a paragraph past the whole list after it (Lists2), and past the first of two lists
  (Lists6); a list of one item past a paragraph (MoveDown2, MoveUp12); an item at the edge of a longer
  list nowhere (Lists8, MoveDown8). The first try let any item swap with a block: MoveDown8, -39,
  MoveUp7, -21 disagreed until the edge rule.
- BlockNote moves `Intro` past `- a` alone (Lists1: `- a⏎¶ Intro⏎- b⏎¶ Next`), and an item at its
  list's edge past a paragraph (MoveDown8): each item a block.
- RemNote without bullets as BlockNote: a paragraph past one item (Lists1), code past one item
  (Lists5), a paragraph's subtree the paragraph (Lists9); under `container` and `item`, 351 against
  345, none worse, all 13 of `lists.md` it plays agreeing.

Then the full SxS: every app, against the Quotes judgment (`--compare`):

| app | agree then | agree now | ± | worse | better | new cells |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| SiYuan | 372 of 619 | 383 | +11 | 0 | 11 | 10 |
| RemNote (no bullets) | 345 of 538 | 351 | +6 | 0 | 6 | 13 |
| BlockNote | 397 of 623 | 402 | +5 | 0 | 5 | 13 |
| Tine | 519 of 626 | 520 | +1 | 0 | 1 (PasteList27, noise) | 5 |
| the other fourteen | | unchanged | 0 | 0 | 0 | 4–5 each |

New cells (`lists.md`): 99, 74 agree, 3 caret, 22 disagree. The three flat apps agree on every case
they play but BlockNote's Lists14 (§5); the outliners on the `paragraph` cases they play, but Logseq
DB's Lists5; the text editors move lines, not subtrees, and disagree with most.

Three cells moved in apps whose values didn't change: Logseq's and Logseq DB's Scenario23 and Logseq
DB's PasteList26 agreed again on a rerun (timing); Athens' Quote87 agreed live but not on `--rejudge`,
which reads a stored drawing back: `- > - q⏎      - g`, one block whose text has a line `    - g`,
came back as two, the second three levels down. `readOutline` now reads a line deeper than a child of
the block above as a line of its text (a test pins it).

## Part 3. The writer's loose ends

The writer bugs left after Parts 1 and 2, cleared but those that need tabs, two quote-atom
refusals an outside review found (§3.2.7), and Tab on an atom, which the cm6 demo refused (§3.3).
Its "HEAD" is Part 2's end; its differential and SxS numbers against that (§3.3's against `145ba6c`,
the rest of Part 3 committed).

### 3.1 Why

#### 3.1.1 What was red

- **The differential** (`node test/differential.ts`: every command at every line of 1,500 generated
  documents and every buffer the spec draws, in every flavor and config, HEAD's `src/` against the
  working tree; a run the new copy fails to write fails it, whether or not HEAD had it): 36 runs
  failing to write. Clean at the end of 17-refactor and 18-align: 35 of them were Part 1's (quoted
  texts under `quotes: text`), and its verification, like Part 2's, ran the random test, not the
  differential (both say so).
- **The inverse pairs** (`test/inverse.ts`, commands that undo each other, both ways, on the spec's
  buffers): Quote94's Enter.
- **The random command test** (`commands keep text, changes and selection consistent`), the suite's
  at one seed and 2,000 runs, green; at four seeds and 6,000 runs under every `listParent`,
  `listMoves` and `quotes`: 326 failing runs, all failing at HEAD too; 41 distinct cases once the
  differential's fixes (§3.2.1–3.2.2) were in.

#### 3.1.2 How they were found and narrowed

Each failing run was minimized (a scratch script: lines dropped and text simplified while the run
still failed the same way) and played under the defaults and at HEAD (`git archive HEAD src` into the
scratchpad): every random-test case failed under the defaults and at HEAD, old gaps the suite's seed
never reaches. The fixes then brought their own cases into the spec, and the differential plays every
spec buffer with every command: those buffers found more (§3.2.2, 3.2.3, 3.2.6), and once a bug of a
fix's making (§3.2.5), which a differential run caught each time.

### 3.2 The bugs, by mechanism

#### 3.2.1 A quoted text's lines asked in the wrong place

- **A lazy line is read out of the quote.** `> q1⏎p ┃2) x`, Ctrl-Backspace: the text `q1⏎2) x` written
  `> q1⏎2) x` read back with a list: out of the quote the paragraph `2) x` would continue isn't open,
  and a list from 2 starts (CommonMark's reference parser agrees), though in the quote it couldn't
  interrupt. The escapes asked every line of a quoted text with `> ` before it. `firstNonParagraph`
  takes the lines written without `>` (`MdParagraphPlace.lazy`, from `escapes.ts`: a line with no
  `quote` part), writes them so, and ends the quote where one starts a block. 20 of the 36
  (Regression33, 37). Lazy lines that would make a table, or a list, in the quote and don't out of
  it lose a backslash they never needed.
- **A quoted text's leading spaces** (`> a┃b`, a plain paste of indented lines): past a quoted text's
  first `> ` they are the quote's paragraph's padding, which the read leaves out. `#leadingSpaces`
  dropped a paragraph's into its padding, not a quoted text's; now a quoted text's too (the writer has
  no place for a padding inside a quote). 5 of the 36; plain pastes of indented lines into a quote,
  refused before, apply (Regression36).

#### 3.2.2 The seam check reading the wrong lines

The seam check reads the lines a node will be written as, re-deriving them from where the node was.
Where its reading and the writer's text differ, it passes a seam that runs together (`write-failed`),
or refuses one that doesn't. Seven places:

| what it read wrong | example | fix | case |
| --- | --- | --- | --- |
| a quoted text's own `>` before its later lines, as a container's (`> S1`, or `> > S1`) | `> ┃q0⏎S1⏎---`, Backspace: `q0⏎S1⏎---` a setext heading | a text quote's prefix (`textQuote`) left out of the indentation | Regression34 (10 of the 36) |
| any block on the lower node's first line as its block | `  [a]: /u⏎  - `: an empty item can't interrupt a definition, `-` a paragraph | the block the lower lines start alone | Regression35 (1 of the 36) |
| a paragraph written as itself with its old container's pieces | `>┃ q⏎    - a⏎1. `, the quote gone: `q`, `>     - a` | as itself, a node keeps only its own pieces | Regression38 |
| an item with no text by its own line and last child | `1. ⏎    1. x⏎⏎      - x`: an empty item and a blank line end one | with no text, its first child's line too | Regression49 |
| a child a paragraph adopts from beside it, by its parent's old children | the empty item read as `''` | found where the draft says it was (`#under`) | Regression54 |
| an item made of a paragraph, and the paragraph's list, as they were | `2. a⏎   1. ⏎⏎    - `: code after the list's item | read as a new item, its list past its content column | (refused: §3.2.6) |
| a moved item at its old column, which the writer re-indents | `- b` lined up after `* x`: `* x`'s child | the writer keeps it out (§3.2.3) | Regression42 |

#### 3.2.3 The writer's columns

The writer re-indents a moved item: lined up with an item of its list that stays, else with the item
moved before it, else at its container's column; and an item of a list where it was, after a moved
one, lined up with it (`realign`). Each could undo what the seam check had read, or shift a node
whose lines can't move (§3.2.4). The rules now:

- **Never where the item before it takes it in** (`* x` at 0, `- b` lined up with `  - x` at 2:
  `* x`'s child): at that item's column (Regression42). And an item starting a list of its own after a
  moved item likewise (`realign` lined up only items of one list). Widths are the marker as its list
  gives it (`markerWidth`: `2. ` three columns, a new item's too).
- **Not where it would take in the item after it that stays**: a moved item goes at that item's
  column, where the one before doesn't take it in, rather than shifting it and what follows it (`- [x]
  x` outdented before `  1. ⏎    - `: the code after `1. ` its child). Past the items moved in with it
  (`listParent: container`, Regression61). Regression43 and 54 keep their columns so.
- **A list of its own placed in its container** stays where it was, the item before not taking it in,
  where at its container's column it would take in the item after it that stays (Regression59);
  elsewhere it is tidied to the container's column as before (`- c2` moved past `## S1`).
- **No cosmetic shift that can't be written.** An item lined up where it needn't be (as it is, the
  one before doesn't take it in) stays where it is if the shift would carry a line it can't move
  (`startsBlocks`: a paragraph's later line that could start a block, not lazy, or lazy past spaces;
  Regression39, 51, 58), or, to the left, take in the indented block after it (`indentedAfter`, past a
  list a block adopts to its section's next node; Regression48, 52, 60). For moved and copied items
  too.
- **A copy beside its original, at its column, is written as it is** (its lines are the same); the
  writer refused one carrying a line that could start a block (Regression51).
- **A copy's list start keeps its original's column** (a duplicate of `   - ⏎   1. x` before
  `   - x`), the item before not taking it in: sent to its container's column as a moved one is, it
  took in the copy after it, or the item after them (three runs the differential found on Regression
  43's, 59's and 61's drawn buffers, failing at Part 2's end too).

#### 3.2.4 Lines only Done can write

The writer copies a moved node's lines and refuses a paragraph's later line that could start a block
where it lands (`2) x` under `- x`); Done spells such a paragraph, with its escapes. Done now spells:

- **Any moving subtree's**, placed in its container too, not only one leaving it (the writer lines
  a placed one up with the list it joins; Regression40); and a node **regrouped** into another
  container behind one placed there (an item following a paragraph into a callout; Regression41).
- **By its lines as read, not its text** (`#unmovable`, shared with `#movedLines`): a line that could
  start a block, not lazy; or lazy where a paragraph leaves the container that made it lazy for a
  section (out of a quote, `| a |⏎|---|` after `q` a table: Regression50; a first version without it
  failed 48 runs the differential caught); or lazy past spaces, as written, some maybe a container's
  it still matched, which may land in the container it moves into, its spaces read as that
  container's (`- [x] ⏎  cont` moved to column 0; Regression45). A lazy line at its line's start, its
  paragraph in a container still, is written as it is: moves keep lazy table rows as written, where
  HEAD indented and escaped them.

#### 3.2.5 Spaces that are text, and CommonMark's checkbox

- **Below a checkbox alone on its line, in CommonMark**, which has no tasks, the paragraph the checkbox
  starts goes on (`- [ ] ⏎  2) x`: `2)` interrupting nothing, the next line's spaces text). Three
  places treated the text below as one of its own: `#leadingSpaces` and `#placeholders` trimmed its
  spaces as padding, Done's escapes asked it from its start and escaped `2)`, a backslash the read
  keeps. One rule, `#goesOnBelowBox`, CommonMark only (in the flavors with tasks an empty task's text
  below it is a paragraph of its own, its spaces padding): Regression44, 46. A first version applied
  it in every flavor and trimmed without moving the caret: a plain paste left the caret past the text,
  and the differential crashed on it (its host typed there; Regression55).
- **A setext heading past a checkbox**: the escapes left the underline out only where the text had no
  frame at its start, and escaped it as a list's marker past a checkbox (Regression47); a setext
  title's first-line padding is dropped as a paragraph's (`#leadingSpaces`).

#### 3.2.6 What Markdown can't say, refused

Where a draft can't be written, Done refuses it (`not-expressible`) instead of the writer failing:

- **A setext title starting with a task's checkbox alone**, a blank after it, going on past it, in a
  flavor with tasks: an empty task to Markdown, its next line no title's (Regression53). `- [x]⏎  a⏎  -`
  (no blank: no task) and `- [a]⏎  ===` (a checkbox alone as the title) still write.
- **An empty paragraph first under an empty task** (Quote94: Enter at a quote's text start under
  `- [ ] `): a blank line after an empty task ends it, and without one the line is its text. Refused
  where the checkbox is a task (Regression56); in CommonMark, where it is text, it goes in, a blank
  line between, as before (Regression57).
- **Code right after a list's item at the top** (indent of a paragraph whose list ends in an empty
  item, the code after it): any line indented past the item's content column is the item's.

#### 3.2.7 Two quote-atom commands, from a review

An outside review of the finished work found two refusals of edits Markdown can say, `quotes: atom`:

- **Enter (`split`) with a lazy line after the caret's** (`> a┃b⏎cd`): the lines after the caret's
  line became a quote of their own as written, its first line `cd`, no quote to Markdown; refused.
  A lazy first line gets its `> ` (QuoteAtom18).
- **Shift-Enter's lazy line**: a pattern guessed whether the new line could stand lazy, and missed
  both ways: after an emptied quoted line (`> a⏎> ┃b`: the empty `> ` ends the quote's paragraph,
  so `b` can't continue it lazily; QuoteAtom19), and before what starts a block the pattern didn't
  know (`` ```js ``, `<div>`, `---`; QuoteAtom20). The parser is asked instead: lazy where the quote,
  the line lazy, reads as one quote over every line; else after a `> `.

### 3.3 Tab on an atom

#### 3.3.1 What was refused

In the cm6 demo, Tab on code, math or a table: `indent: rejected — not-expressible (a atom doesn't go
under the node above)`. `indent.ts` took items, paragraphs and headings and refused any other node,
as it has since the refactoring (17-refactor); `spec/indent.md` had no rule for atoms. A quote atom
(`quotes: atom`) was refused the same way (§1.2.4's "Tab on a quote below a list").

#### 3.3.2 The apps

Nine probes in all 18 apps (`sxs/probe.ts all`): code after a list (the caret in the code, on either
fence), math and a table after a list and after a paragraph, code in an item's body after its child.

| Tab on | outliners (Logseq, Logseq DB, Tine, Roam, Athens, Dynalist, RemNote with bullets) | BlockNote | RemNote without bullets | Obsidian (bare, Live Preview, Outliner) | true-outliner | SiYuan; SilverBullet, Emacs |
| --- | --- | --- | --- | --- | --- | --- |
| a code line | (their code is a block's text: not played) | indents the code | indents the code | indents the line | indents the line | SiYuan indents the code; the two others nothing |
| a fence's line | nests the block under the one above (Athens, Dynalist, Logseq) | (no caret on a fence) | (no caret on a fence) | indents the line | indents the block | SiYuan: no caret on a fence; the two others nothing |
| math | nests the block | into the item's body | an item (`- a⏎- $$…`) | indents the line | a child item; after a paragraph `- $$` | SiYuan: not played; the two others nothing |
| a table | nests the block | into the item's body | an item | indents the line (Live Preview's table editor takes Tab) | (not played) | SiYuan: not played; the two others nothing |

WorkFlowy and Tana play none of them (no code, math or tables there); Roam holds no code block the
driver plays. The same camps as for a paragraph (Indent29 names them): RemNote makes an item,
BlockNote and bare Obsidian put it in the item's body, true-outliner makes a child item.

#### 3.3.3 Proposals (the user's choice: 1)

1. **A block becomes an item**, rule 3 for every block that isn't an item or a heading: after a list,
   its next item; under a node that adopts lists, its first item; with nothing above, an item in
   place. One rule for paragraphs, quotes and atoms; outdent already gives the block back; the
   outliners and RemNote. Chosen.
2. **Into the item's body** (`- a⏎⏎  $$…`): what indentation means in Markdown, BlockNote's; but
   paragraphs would do otherwise unless they change too, Shift-Tab on a block in an item's body is
   refused today (no inverse), and after a paragraph there is no body.
3. **An option, `indentBlock: item | body`**, 1 the default and 2 for paragraphs, quotes and atoms
   alike (BlockNote, bare Obsidian `body`): both camps, measurable (Indent21, 22, 29 and the atom
   cases); it needs Shift-Tab out of a body. Open (§5).
4. **The host's** (`deferredToHost`, §3.4): the line indented as Obsidian does; a fence line alone
   indented breaks the block, and every block app acts on the block.

Beside them: a table on a marker line read as the item's text (taken), or kept as the first child of
an item with no text, the writer taught to put it there; in math, Tab the outline's (taken: LaTeX's
spaces mean nothing, every block app acts on the block) or the host's as on a code line.

#### 3.3.4 The rule

- `spec/indent.md` rule 3: a paragraph **or an atom** becomes an item, its text: code, math, a table, a
  comment, HTML, a quote atom (Indent34–36, QuoteAtom21), placed as a paragraph is. Where it goes is
  `adoptsLists(above)`'s, as for a paragraph, so `listParent` decides nothing new: under `paragraph` a
  paragraph above takes it into its list, under `block` an atom above too, under `container` it is an
  item where it is. `quotes: atom` a quote atom likewise (under `text` it was already, a paragraph);
  a quote that is a container stays refused (only an item goes under another).
- Rule 1: a code line is fenced code's payload **or any line of indented code** (Indent38): Tab and
  Shift-Tab the host's. A fence's line is markup: there Tab is the block's (Indent34), as Indent31
  already had it for an item whose text is code.
- Refused: a thematic break under a bullet of its own character, `- ---` being one rule (Indent37;
  `* ---` is an item, Indent37b); indented code in a selection (its lines' indentation is what it is:
  under a marker it would be other code, or none); a quote atom with a lazy line led by a tab
  (Regression64: after the marker the tab spans other columns, the writer re-indents spaces, not tabs,
  §5).

#### 3.3.5 Reading: an atom is an item's text

`itemHead` (`rules.ts`) took an item's first block as its text where it holds inline text or lines as
written (`content` `inline` or `verbatim`): code and math were an item's text, a table, a thematic
break or a definition (`content: none`) the child of an item with no text. Now any atom on the
marker's line is the item's text, as an atom is its own text everywhere else and the outliners hold a
table as a block's text; `read.ts` reads every head but a paragraph or a heading as an `AtomText`.
What it changed (the differential): a selection across `- a⏎- | x |` is two items, not an item and a
child (`non-contiguous` before); outdent, duplicate, paste and Delete before such an item apply where
they were refused; Enter at the end of a table or a rule that is an item's text makes a new item, as
after code (Enter70; `nodeAfterCode` is `nodeAfterBlock`, shared with `enter.ts`), where it was
`deferredToHost`.

#### 3.3.6 Two writer bugs the runs found

Both failing at HEAD too, each found by a differential run (its corpus is generated anew each time):

- **A plain paste of line breaks before a quote atom's `>`** wrote `> ` before the quote, read as a
  quote in a quote. The line breaks at a text's start go, as in a paragraph (PastePlain25); with
  nothing else, refused (PastePlain27): Regression62.
- **A new item lined up with the next item of its list where the item before, of another list, takes
  it in** (`- a⏎1. «x»⏎  1. b`, `- x` pasted: `  1. b` is a top-level item at column 2, short of `1.
  x`'s content column, which `- a`'s takes in once `x` is replaced): at its container's column instead,
  as §3.2.3's first rule has it for moved items (Regression63). A first version compared a column in
  the document with one in the container, and moved Enter's new items in 428 runs (`- > q0⏎    - g1`:
  the new item at column 2); the next differential run showed it.

#### 3.3.7 Spec and tests

Indent34–38 and 37b, QuoteAtom21, Enter70, Regression62–64; `indent.md` rules 1 and 3, `quotes.md`'s
atom rule 4, `enter.md` rule 11. `spec.test.ts`: the check that typing after a structural command
keeps the outline skips a thematic break's line, where anything typed makes it a paragraph (a rule has
no text to type in).

#### 3.3.8 Verification

The battery of §3.5, run after each fix: the differential against `145ba6c`, every group judged (its
runs that failed to write, at HEAD too, are §3.3.6's; the first version's guard showed as Enter's new
items moved); the random test at four seeds under every value (§3.3.4's first version failed 31 runs
more: indented code in a selection, a quote atom's tab-led lazy lines; now the 5 tab cases of before);
the inverse pairs and the model test; copy and paste red as at HEAD, the same kinds. The SxS: §4.1.

### 3.4 `deferredToHost`

The outcome a command returns where the key is the host's, its default to run, was `notApplicable`
(`{ status: 'notApplicable' }`, the helper `notApplicable(detail)`), which said what ourus didn't do,
not what the host should. Renamed (the user's call): `deferredToHost`, the helper `deferToHost(detail)`;
`applied`, `rejected`, `deferredToHost`. In `src/`, the spec's `result:` lines, the tests, the inverse
baseline and the demos; dev notes before this one keep the old name. Checked as a refactoring: the
differential between the tree and a copy of its `src/` with the rename reversed showed only
`notApplicable → deferredToHost`, in every group, and no run failing to write; the battery of §3.5
after it, its results as before (copy and paste's report the same, the status renamed).

### 3.5 Verification

The checks, as last run, on the work as it stands (§3.3 and §3.4 in it), after a full SxS rerun:

| check | how | result |
| --- | --- | --- |
| suite | `npm test` | 1409 pass, 0 fail |
| types | `npm run typecheck` | clean |
| differential | `node test/differential.ts` (against HEAD) | 0 runs failing to write; every group of behavior changes judged (§3.3, §3.6) |
| inverse pairs | `node test/inverse.ts` | 0 failures; baseline recorded for the new spec buffers (again after §3.3's) |
| model | `npm run test:model` | passes |
| random test, more seeds | the scratch copy of the suite's test, `OURUS_FUZZ_SEED`/`_RUNS` and the options set | 5 failing, tabs (§5); §3.3's first version 31 more, fixed (indented code, a quote atom's tab-led lazy lines) |
| SxS | `node sxs/run.ts all`, then `--rejudge`, `--compare` | a full rerun of every app (WorkFlowy and Dynalist's `quotes.md` run again, below): no errors, no case left unrun; §4.1 |
| copy and paste | `node test/copy-paste.ts` | red, as at HEAD (§5): the same kinds, at HEAD and now, counts grown with the new buffers |

Before each commit the differential ran against HEAD, and every group of its report was judged
(§3.6); then against the working tree itself, as it shows once committed: no differences, exit 0.
Against HEAD it exits 1 for any behavior change, by design (`groups.size === 0 && failing.length === 0`).

The first full rerun found Athens failing on Regression56 and 57 (`error`: its checkbox took the
focus): their buffer starts with an empty task, as Quote94's, which is tagged `markup-task`, and they
weren't. Seven of the new cases fit the tag's rule ("on a task with nothing but its checkbox, a
Cmd-Backspace up to it"): Regression44–46, 53, 55–57, tagged, and an app that can't hold them skips
them. Logseq DB's page closed as it loaded and RemNote hung after 185 of its cases: both run again,
clean. After §3.2.7 and the copy rule, a second full rerun: every app clean; four cells it saw worse
(Athens' Indent1, Indent14, Scenario7, Logseq DB's Delete32), the test battery running beside it,
agreed on a probe and on a run of those two apps alone. After §3.3 and §3.4, a third, alone, watched
(each app's result, the cap, a quiet log): WorkFlowy's page closed at Enter21 ("Target page, context
or browser has been closed"), run again alone, clean; Dynalist missed Enter in five quote cases, which
agreed on a probe and on a rerun of `quotes.md`; every other app clean the first time.

One `npm test` run failed one test, unnamed (the battery logged counts only); 53 runs since, under
load too, none. The suite's only timed tests, the parser's pathological ones, run at a tenth of their
3-second budget.

### 3.6 Behavior changes

The differential's groups against each commit's HEAD, each judged:

- **Runs that failed to write now apply**, or are refused (§3.2.6).
- **Lazy lines in moved items kept as written** (193 groups' examples): `  |\---|---|` was `|---|---|`
  re-indented and escaped; read back the same.
- **A backslash gone that nothing needed**: lazy lines that would make a table or a list in a quote
  and don't out of it.
- **Plain pastes of indented lines into a quote apply**, where they were refused.
- **Moved items placed where nothing that stays has to move**: at the column of the item after them
  (Regression43, 54), a list's own start kept in place (Regression59's buffer).
- **A copy's list start at its original's column** (§3.2.3).
- **Quote atoms' Enter (`split`) and Shift-Enter apply** where a lazy line was refused (§3.2.7).
- **The same text by finer changes**: the writer copies more lines as they are.
- **§3.3's**: Tab on an atom applies (or `no-previous-sibling`, first in an item, as a paragraph's);
  Tab and Shift-Tab on indented code are the host's; an atom on a marker's line is the item's text (the
  outline's snapshots; a selection across it and an item contiguous; outdent, duplicate, paste, Delete
  before it and Enter at its end apply); the two writer bugs of §3.3.6 apply.

## 4. The whole, against 18-align

### 4.1 The SxS at each stage

Each app's agreements out of the cases it played, and its disagreements, at each stage: 18-align, the
end of Part 1, of Part 2, of Part 3 as first committed, and now, after §3.3 and a full rerun of every
app (`.sxs` commits `c7a1bf1`, `f05af3b`, `ee230ff`, `c4e5094`; caret and whitespace verdicts are
neither). An app plays more cases as the spec grows and as the options let it play what it skipped
(the quote containers under `atom`, the lists cases).

| app | 18-align | Quotes | Lists | Part 3 | now |
| --- | ---: | ---: | ---: | ---: | ---: |
| Logseq (OG) | 430 / 502 (37) | 537 / 626 (49) | 542 / 631 (49) | 550 / 643 (53) | 555 / 651 (57) |
| Logseq (DB) | 429 / 490 (37) | 535 / 612 (47) | 539 / 617 (48) | 547 / 629 (52) | 552 / 636 (55) |
| Roam | 422 / 482 (28) | 527 / 606 (39) | 531 / 610 (39) | 540 / 622 (43) | 543 / 628 (46) |
| Tine | 420 / 503 (49) | 519 / 626 (60) | 525 / 631 (60) | 532 / 643 (65) | 536 / 650 (68) |
| Athens | 360 / 450 (46) | 456 / 562 (58) | 457 / 563 (58) | 464 / 574 (62) | 469 / 582 (65) |
| Dynalist | 434 / 536 (80) | 533 / 655 (96) | 538 / 660 (96) | 545 / 677 (104) | 549 / 685 (107) |
| WorkFlowy | 365 / 507 (114) | 385 / 537 (124) | 390 / 542 (124) | 393 / 551 (129) | 392 / 551 (130) |
| Tana | 351 / 464 (94) | 352 / 464 (93) | 356 / 468 (93) | 357 / 472 (95) | 356 / 471 (95) |
| RemNote (bullets) | 347 / 487 (110) | 347 / 487 (110) | 351 / 491 (110) | 353 / 494 (111) | 355 / 499 (114) |
| RemNote (no bullets) | 345 / 538 (159) | 345 / 538 (159) | 364 / 551 (153) | 367 / 555 (154) | 371 / 561 (156) |
| SiYuan | 349 / 583 (165) | 372 / 619 (178) | 393 / 629 (167) | 395 / 635 (171) | 396 / 636 (171) |
| BlockNote | 383 / 595 (164) | 397 / 623 (177) | 414 / 636 (173) | 417 / 648 (180) | 418 / 654 (185) |
| **block apps** | **4635 / 6137 (1083)** | **5305 / 6955 (1190)** | **5400 / 7029 (1170)** | **5460 / 7143 (1219)** | **5492 / 7204 (1249)** |
| Obsidian | 244 / 875 (578) | 295 / 888 (545) | 295 / 892 (549) | 305 / 915 (558) | 306 / 925 (569) |
| Obsidian Live Preview | 238 / 861 (570) | 289 / 874 (537) | 289 / 878 (541) | 299 / 898 (548) | 299 / 906 (558) |
| Obsidian Outliner | 314 / 872 (504) | 387 / 885 (449) | 389 / 889 (451) | 396 / 904 (456) | 396 / 912 (466) |
| true-outliner | 275 / 840 (466) | 345 / 852 (419) | 345 / 856 (422) | 352 / 874 (429) | 353 / 882 (437) |
| SilverBullet | 251 / 880 (559) | 301 / 893 (509) | 301 / 897 (513) | 306 / 921 (528) | 306 / 931 (545) |
| Emacs | 170 / 873 (639) | 229 / 885 (581) | 229 / 890 (584) | 235 / 914 (600) | 228 / 924 (618) |
| **text apps** | **1492 / 5201 (3316)** | **1846 / 5277 (3040)** | **1848 / 5302 (3060)** | **1893 / 5426 (3119)** | **1888 / 5480 (3193)** |

From Part 3 to now (§3.3; `--compare=c4e5094`): 42 cells worse on the full run, 5 of them Dynalist
missing Enter under its load (agreeing on a probe and on a rerun of `quotes.md`), the rest 37, none
better:

- **The text editors on Tab in a quote** (30: Emacs and SilverBullet 10 each, Obsidian's three setups 3
  each, true-outliner 1; Quote2–9, Quote64, QuoteText18, Regression37). Under the `quotes: atom` they
  declare a quote is an atom, which Tab now makes an item, with nothing above it one in place; they
  do nothing, or indent the line, which agreed with the refusal before. The camps of §3.3.2: the text
  editors indent lines, as they do a paragraph's (Indent22, Indent29).
- **Regression5 in seven outliners** (Logseq, Logseq DB, Roam, Tine, Athens, Dynalist, RemNote with
  bullets): Enter in `- [a]: ┃/url`, the host's at HEAD and now (a line break in the definition). An
  atom on a marker's line being the item's text (§3.3.5), `- [a]:⏎/url` reads as one definition, the
  item's text; it read as an item with no text and a definition, which the projection showed as the
  outliners' two blocks. The agreement was the reading's; the outliners split a definition as text
  (§5).

New cells (the 11 cases of §3.3.7): 117, 46 agree, 1 caret, 3 whitespace, 67 disagree: the text
editors on Tab (they indent the line), the outliners on the two refusals (Indent37, `- ---`, and
Regression64, which they hold as a block's text and nest), the apps' own pastes (Regression63).
Enter70 agrees in the nine block apps that play it (SiYuan, Tana and WorkFlowy play no table).

Against 18-align case by case (`node sxs/run.ts --compare=c7a1bf1`): on the cases both judgments
have, agreements then and now, the cells worse and better; and the cells an app plays now that it
didn't then.

| app | cases both have | agree then | agree now | ± | worse | better | new cells |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Logseq (OG) | 502 | 430 | 430 | 0 | 1 | 0 | 149 |
| Logseq (DB) | 490 | 429 | 429 | 0 | 1 | 0 | 146 |
| Roam | 482 | 422 | 421 | -1 | 1 | 0 | 146 |
| Tine | 503 | 420 | 419 | -1 | 1 | 0 | 147 |
| Athens | 450 | 360 | 359 | -1 | 1 | 0 | 132 |
| Dynalist | 535 | 434 | 433 | -1 | 1 | 0 | 150 |
| WorkFlowy | 506 | 364 | 364 | 0 | 0 | 0 | 45 |
| Tana | 463 | 350 | 351 | +1 | 0 | 1 | 8 |
| RemNote (bullets) | 487 | 347 | 346 | -1 | 1 | 0 | 12 |
| RemNote (no bullets) | 538 | 345 | 351 | +6 | 0 | 6 | 23 |
| SiYuan | 583 | 349 | 359 | +10 | 0 | 10 | 53 |
| BlockNote | 595 | 383 | 387 | +4 | 0 | 4 | 59 |
| Obsidian | 855 | 242 | 273 | +31 | 19 | 43 | 70 |
| Obsidian Live Preview | 841 | 236 | 267 | +31 | 19 | 43 | 65 |
| Obsidian Outliner | 852 | 313 | 361 | +48 | 15 | 56 | 60 |
| true-outliner | 820 | 274 | 322 | +48 | 14 | 54 | 62 |
| SilverBullet | 860 | 249 | 283 | +34 | 4 | 42 | 71 |
| Emacs | 852 | 169 | 209 | +40 | 1 | 51 | 72 |

New cells: 1,470 (184 cases), 1016 agree, 17 caret, 55 whitespace, 382 disagree. Worse: 79 cells. 72
are the text editors' cases in a quote (the quote cases, Home in a quote: CursorHome11, 16, a fence in
a quote: Backtick3), which agreed with ourus's quote containers at 18-align and disagree under the
`atom` they declare, on balance the value they agree with most (§1.4.3; §5); 7 are Regression5 in the
outliners, above.

### 4.2 Tests

| | 18-align | Part 1 | Part 2 | Part 3 |
| --- | ---: | ---: | ---: | ---: |
| `npm test` | 1311 | 1350 | 1366 | 1409 |
| spec cases | 1045 | 1084 | 1100 | 1143 |
| differential: runs failing to write | 0 | not run | not run (36 when run in Part 3) | 0 |

The random command test at more seeds than the suite's, as each part ran it: at Part 1's end, 3 seeds
× 6,000 runs × each `quotes`, 76 failing runs, 71 failing at 18-align too (§1.4.1); at Part 2's end, 4
seeds × every `listParent` and `listMoves` too, 326 failing runs, 41 cases minimized, all failing at
18-align (§3.1); now, the same runs, 5 cases, all tabs. Parts 1 and 2 ran it but not the
differential; Part 3 ran both, the inverse pairs, the model test and the copy-and-paste report
(§3.5).

## 5. Open

Quotes:

- `atom`, three cases: Enter at a quote atom's end under an item, the apps' new block a level up
  (Quote30); a one-line quote pasted mid-text, which the apps put in as text (Paste27); Enter in code
  in a quote, where the apps' code editor breaks the line (Fence4).
- RemNote's quote (probably `text`): its driver's read and load. Tana has none.
- Whether `text` takes any lone block (`> # H`, code), not only a paragraph; `> > q` so read.
- The text editors' container-like and `text`-like behaviors (§1.4.3), no value for them: Tab in a
  quoted list nests in the quote (Quote2–10; Obsidian, where ourus makes the quote atom an item,
  §3.3, and Emacs and SilverBullet do nothing), Shift-Enter writes the next line's `> ` (Quote44),
  Obsidian's Home goes past the `> ` (CursorHome11, 16). These are most of the text editors' cells
  worse than at 18-align (§4.1): they agreed with ourus's quote containers there.
- Older behaviors the quote cases showed, not the quotes': Enter on an empty last item (the outliners
  make another), a top-level item outdented (a paragraph in ourus), deleting the only block.
- From §1.1.1: an option a case names that changes nothing under the app's value; a caret in a marker
  played at the text start.

Lists:

- `listMoves` is this work's name and design, after the user's `listParent`: review. The alternative
  was a fourth `listParent` value; but where the list goes and how it moves are two things, and
  SiYuan, BlockNote and RemNote without bullets agree on the first.
- BlockNote's own moves: a block moved up into the block above when that one has children (Lists14:
  `Next` goes in after `b1`, `b`'s child), and an item out of its parent before it (MoveUp5, MoveUp6);
  older than this work, no option says them.
- `listParent: block`: no app.

Indent (§3.3):

- `indentBlock: item | body` (proposal 3): Tab putting a paragraph, a quote or an atom into the item
  above's body, as BlockNote and bare Obsidian do, for the camps Indent29 and §3.3.2 name; it needs
  Shift-Tab out of a body (refused today), so the two invert.
- Indent21's prose says the blank line above goes; its drawing keeps it, as ourus does (and an atom
  likewise): the prose is stale.
- A quote atom with a lazy line led by a tab is refused on Tab (Regression64): the writer's tabs, below.
- Enter in a link definition is the host's (a line break in it, `[a]:⏎/url` one definition still);
  the outliners split it as text (Regression5 in seven of them, §4.1).

The writer:

- Tabs (the random test's 5): a list indented with tabs re-indented (the writer refuses: `a list
  indented with tabs`, `a moved node's lines aren't indented as far as its first`), code past a tab
  below an item's marker, a line starting with a tab at another column than Done gave it. A writer
  feature never written: re-indenting a line's tabs against its new prefix. All fail at 18-align;
  ourus refuses, the document as it was.
- Copy and paste against duplicate (`test/copy-paste.ts`, not in `npm test`, red at 18-align too, its
  baseline older than the spec): duplicate and copy-then-paste writing the copy differently, both
  valid: blank lines around it, the copy's column on the spec's newer buffers (duplicate keeps the
  original's, paste the list's), and three pastes refused (`not-expressible`) that duplicate applies.
- The seam check's columns: it re-derives the columns the writer will write at, and §3.2.2–3.2.3
  fixed each place the two disagreed. Asking the writer instead would close the class.

## 6. Working notes

- Run the differential before every commit that touches the draft, the writer or the commands, not
  only the random test: it plays every spec buffer with every command, in every config. Parts 1 and 2
  didn't, and left Part 3 36 runs.
- Every spec case added is a buffer the differential, the inverse pairs and copy-and-paste then play
  with every command: new cases find old bugs. Run them again after adding cases.
- Run the random command test under every value of a new option, at more seeds and runs than the
  suite's; minimize each failing run (lines dropped, text simplified while it fails the same way), and
  play it under the defaults and at the last commit (`git archive HEAD src` into a scratch directory,
  `node_modules` linked) to tell new failures from old.
- Judge each differential group by its text before and after, classified (a scratch script): most
  groups are one kind; the few that aren't are the bugs. A fix that refuses (`not-expressible`) is
  checked against the last commit's applied runs there: two refusals were too broad (§3.2.6).
- Draw a design's tables from the code (a script playing each buffer under each value with the
  spec's player): drawing §1.2.4 found three gaps that hand-made tables hid.
- To choose an app's value of an option, play every case with `--ignore-options` in a copy of `.sxs`
  (`OURUS_SXS_DIR`: the results copied, the rest linked), then judge each case against ourus replayed
  under each value with the app's other values. The copy's run writes `.partial.json` files; Emacs
  can't start there (its server's socket name too long under a long path).
- Read an app's blocks as their Markdown reads, then as the declared value says: a read that nests by
  a fixed rule judges every value against that rule, and an app's structure Markdown can't write (a
  paragraph's child) against nothing ourus can say.
- Probe an app before choosing its value, on the cases where the values' texts differ: SiYuan's edge
  rule (an item stays in a longer list) came from Lists8, not from the full run.
- A rejudge is enough where only ourus or the judging changed; a run where what an app plays changed
  (a value declared, a projection holding more). A cell that agrees live and disagrees on `--rejudge`
  is the drawing, not the app.
- A case naming an option's default isn't skipped by an app declaring another value: it is judged
  under the app's, replayed.
- While a run plays (the SxS, the differential), no edits under `src/`, `sxs/`, `spec/`: each process
  loads the code as it starts, and a differential run crashed so once.
- A differential run generates its corpus anew: two runs find different old bugs (a run failing to
  write in both copies is one to fix too, §3.3.6). Run it again after each fix, and alone: beside the
  random test and the other batteries it died at once once (signal 132, the task cap near).
- A rename is a refactoring to prove: the differential between the tree and a copy with the rename
  reversed, every group the renamed name alone (§3.4).
- Before a design choice, probe the apps on it (`sxs/probe.ts all --file=`), and lay out proposals
  with the camps (§3.3.2–3.3.3); the choice is the user's.
- Watch a full SxS run (each app's line, the cap, a log quiet for minutes) with a filter of whole
  patterns: `cap` matched `escape` in every case line. And kill a run by its pid, never by a pattern
  its own shell's command line holds (the shell went with it, again).
- **We work in PDT.** Dates in these notes are the user's, in PDT (America/Los_Angeles): this work is
  2026-10-25, though the machine's clock (UTC) passed midnight during it. Never date from the system
  clock.
