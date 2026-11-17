# Alignment (2026-11-16)

## Behavior review

`dev/next.md`'s decisions to confirm (D1 to D33) and the last round's items to confirm, each brought
with the SxS's evidence (stored runs and live probes of 23 apps; Obsidian's reading view for the
parser questions) and decided by the user.

| Id | Question | Decided | Done |
|---|---|---|---|
| D1 | Enter on an empty item mid-list | keep `enterOnEmptyItem: sibling` | nothing to change |
| D2 | Shift-Tab on a top-level item | keep `outdentTopLevel: unwrap` (21 of 23 apps do nothing) | nothing to change |
| D3 | Backspace in an empty pair the author typed | keep: both go | nothing to change |
| D4 | Which lines continue a table in the `obsidian` flavor | Obsidian's rule, measured in its reading view: a row starts with a pipe exactly when the header row does, and has a pipe past that one. The guess before (any line with a `\|`) read 6 of 11 measured shapes otherwise | `gfm.ts` (`pipedRows`, was `requirePipe`); `obsidian.test.ts` |
| D5 | Delete at a block's end before a heading | the title joins at once, its marks with the join; Backspace at the title's start still takes the marks first (`headingEditing` is Backspace's alone) | `delete.ts`; Delete13, 13c, 13e, 13g, 14, 15, Regression229 redrawn; Delete13b, 13d, 13f (`headingEditing: block`, now the default's result) removed. After code or a comment block a heading's title can't join: refused, as a paragraph is there (was: its `#`s stripped) |
| D6 | Delete in a quote atom joins the next line with its `> ` | keep (every atom app does) | nothing to change |
| D7 | Enter on an empty heading (refused, its message the empty paragraph's) | an empty paragraph after it, the heading kept, as at a titled heading's end; Shift-Enter the same, compact (16 apps make a block after) | `enter.ts`; Enter71, ShiftEnter34 |
| D8 | Enter in a table row, at the table's start | keep refused | nothing to change |
| D9 | A plain paste ending in a line break (`x⏎` at `- a┃`) leaves a held empty line | an option, `pasteTrailingBreak: line \| drop` (`line` the default: Logseq, Logseq DB, Roam, Athens, Tine, Notion; `drop`: SiYuan, BlockNote, declared in their drivers), for plain lines put into a text, by plain paste and by paste | `config.ts`, `paste-plain.ts`; PastePlain35. The SxS on the stored runs: BlockNote 6 disagreements fewer (250 to 244), SiYuan 6 (251 to 245) |
| D10 | Fold commands on the zoom root succeed and change nothing (a fold stored before zooming stays, seen once the zoom is left) | keep | nothing to change. The review's file drew a fold stored by `toggleFold` there, wrongly: `sxs/probe.ts` dropped the view a buffer given on the command line draws (`⟦zoomed⟧` read as no zoom) and drew each view mark twice; both fixed |
| D11 | Backspace at a later line's start, "the caret before or past its spaces" | settled: B204 fixed, the comment matches | nothing to change |
| D13 | A list right after a paragraph is its children | keep `listParent: paragraph` | nothing to change |
| D15 | Pasted numbers renumbered | keep `orderedLists: renumber` | nothing to change |
| D16 | Shift-Enter at a paragraph's start (refused) | a blank line above, the caret staying, as the text editors | `shift-enter.ts`, Enter's `openLineAbove` shared (`util.ts`); ShiftEnter35. Found by the BOM test: in a note opening with a byte-order mark the caret landed before the new line, Enter under `enterAtTextStart: stay` too (on the last commit as well): the caret now associated forward. And not above a lazy line (`- [a]:u⏎┃T`): the blank line would end the item it continues, the paragraph read out of it (refused, as before; found by the view and diff suites, Enter under `stay` failing the same on the last commit) |
| D17 | `joinWithChildren: join`, `outdent: direct`, the space after a new marker | keep all three | nothing to change |
| D21 | A throw outside `executeCommand` isn't P1 | any throw a host reaches is P1 | `dev/next.md`'s priority table |
| D23 | A caret past the last node acts on it | keep | nothing to change |
| D26 | Delete at a block's end and Backspace at the next one's start, every pair of block kinds (75 of 121 answering differently) | by `decorations`: markup the host shows as text is its keys', a text editor's (a blank line a press, then the lines joined as text); markup it draws, ourus edits as a unit or refuses. So: after code, a table or a rule, and before code, the host's or refused by the element; a quote below joins on Delete as a heading does (Backspace still takes the `>` first); after a footnote's text the paragraph joins it; before one, its label as an element. A rule or a table below stays refused (B202). Not an option modelling text editors (rejected): what follows from what the host draws | `delete.ts`, `backspace.ts`, `code.ts` (`blockElement`, `joinIntoFootnote`, `util.ts`); `table` an element of `decorations`; Backspace16, Backspace24, Fence25, Fence33, Fence35, Delete11 under `decorations: [fence]`, QuoteText6 one press; Backspace24b, Backspace51, Backspace52, Backspace52b, Delete35, Delete35b, Delete36, Delete37 new. The SxS on the stored runs: 23 disagreements fewer (the text editors 6 each, Live Preview 4, Outliner 3), true-outliner 5 more (it refuses at these boundaries, its own rule); the new cases played by every app: 54 agreements and 37 disagreements more, each a case judged for the first time (a footnote's join where the text editors take the blank line first, Logseq joining a rule's text, true-outliner, WorkFlowy and Tana refusing at code), none that agreed disagreeing |
| D28 | Footnote HTML byte for byte cmark-gfm's, invalid HTML included | keep | nothing to change |
| D29 | ```` ```language-js ```` gives `class="language-js"` | keep | nothing to change |
| D30 | A task status of one UTF-16 unit, against the docs' "any one character" | the docs mended: measured, Obsidian 1.14.4 and 1.15.1 read `- [😀] task` as no task, as ourus does | `gfm.ts`, `doc/text.ts`, `types.ts`, `obsidian.ts` comments |
| D31 | A URL after an unmatched `[` | `gfm`: cmark-gfm's, none linked; `obsidian`: Obsidian's, measured on 11 shapes: linked unless a `]` after it closes that bracket | `gfm.ts` (`autolinkExtension({ openBrackets })`); `obsidian.test.ts` |
| D32 | `- ⏎→⏎→x`: `x` the item's text (cmark-gfm) or indented code (the JS parsers) | keep cmark-gfm's; filed as an upstream question | `dev/upstream.md` |
| D33 | A link label's 999-character limit in UTF-16 units | code points, as the spec says and markdown-it and marked count (commonmark.js and micromark count UTF-16 units, cmark-gfm bytes) | `refs.ts` (`scanLabel`); `structure.test.ts`; `dev/upstream.md` |
| R1 | A failing command written again, its root blocks re-spelled | keep; normalizing a touched subtree up to its top-level block is fine, untouched top-level blocks stay byte for byte | nothing to change |
| R2 | The clipboard format's four changes (B188) | keep | nothing to change |
| R3 | A node Enter makes at the note's end doesn't hand the old end its blank lines back (B411) | keep ("do what's reasonable") | `spec/gaps.md`'s document-end rule amended |
| R4 | The tests' check changes of the last round (the marks check's two, a delete's blank lines, the B355 test's expected column) | kept as they are (the user's: no review wanted) | nothing to change |
| R5 | Three bugs to P4: B403, B418, B369 | B403 P4; B418 and B369 P3, fixed | B369: indented code an item holds, which a Tab made read into the empty item above it, fenced (`#setApart`, `draft.ts`: B328's rule, for an item's own code too). B418: nodes pasted first under an item set apart from its children by a raised blank line: the line the paste adds before them ours where the item's was (`paste.ts`); `commands.test.ts`'s B444 case counts both raised lines now, not one. Both out of `test/bugs.ts` into `commands.test.ts` |

## The boundary table

Delete at the end of a block against Backspace at the start of the next, every pair of 11 kinds, the
default options, after D26 (`node test/edges.ts`; `--matrix` prints this). A row is the upper block, a
column the lower; a cell is **Delete / Backspace**, one word where both do the same, **bold** where
they differ (62 of 121, from 75). **join**: the lower's text joins the upper's; **peel**: the lower's
markup goes; **blank line**: one blank line goes; **refuse**; **host**: the host's, the markup being
text it edits (`decorations` not listing it).

| above ↓ below → | paragraph | heading | setext heading | item | task | ordered item | quote | code | table | rule | footnote |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **paragraph** | join | **join / peel** | **join / peel** | join | **join / peel** | join | **join / peel** | **host / blank line** | refuse | refuse | host |
| **heading** | join | **join / peel** | **join / peel** | join | **join / peel** | join | **join / peel** | **host / blank line** | refuse | refuse | host |
| **setext heading** | join | **join / peel** | **join / peel** | join | **join / peel** | join | **join / peel** | **host / blank line** | refuse | refuse | host |
| **item** | join | **join / peel** | **join / peel** | join | **join / peel** | join | **join / peel** | **host / blank line** | refuse | refuse | host |
| **task** | join | **join / peel** | **join / peel** | join | **join / peel** | join | **join / peel** | **host / blank line** | refuse | refuse | host |
| **ordered item** | join | **join / peel** | **join / peel** | join | **join / peel** | join | **join / peel** | **host / blank line** | refuse | refuse | host |
| **quote** | join | **join / peel** | **join / peel** | join | **join / peel** | join | **join / peel** | **host / blank line** | refuse | refuse | host |
| **code** | host | **host / peel** | **host / peel** | host | **host / peel** | host | **host / peel** | **host / blank line** | **host / refuse** | **host / refuse** | host |
| **table** | host | **host / peel** | **host / peel** | host | **host / peel** | host | **host / peel** | **host / blank line** | **host / refuse** | **host / refuse** | host |
| **rule** | host | **host / peel** | **host / peel** | host | **host / peel** | host | **host / peel** | **host / blank line** | **host / refuse** | **host / refuse** | host |
| **footnote** | join | **refuse / peel** | **refuse / peel** | refuse | **refuse / peel** | refuse | **refuse / peel** | **refuse / blank line** | refuse | refuse | host |

What differs, by design: Backspace takes the lower block's markup first where it is at the caret
(the heading, setext, task and quote columns), Delete joins; at a fence's start ourus takes the blank
line itself, as the host would. Where two blocks of markup meet (a code, table or rule row against the
table and rule columns), the upper is the host's and the lower refused (B202).

## Decorations

`markup: text | decorated` was one switch for all markup; hosts draw some elements and show others as
text. Replaced by `decorations`, the elements the host draws: `bullet`, `number`, `checkbox`,
`heading`, `setext`, `quote`, `callout`, `fence`, `math`, `comment`, `table`, `rule`, `footnote`, `blockId`
(`[]` the default, a plain text editor). Each place that read `markup` asks for its element
(`markupElement`, `drawnAt`, `fenceDrawn` in `commands/util.ts`); 28 spec cases name theirs.

Measured on every app with the caret placed inside each element and a character typed there
(`OURUS_SXS_SHOTS=<dir>` on `sxs/run.ts` keeps a screenshot of each step): drawn where the app keeps
the caret out of it (it moves the caret, holds the element as a property, or edits it as a widget),
text where the character goes into the markup. On the element's line alone was not enough: Live
Preview draws a bullet but lets the caret into it and edits it as text; SilverBullet the same with a
checkbox.

| App | Declared |
|---|---|
| Obsidian source, SilverBullet, Emacs | none |
| Obsidian Live Preview | checkbox, table |
| Obsidian Outliner | bullet, number, checkbox, table |
| Obsidian true-outliner | bullet, number, table |
| Logseq, Athens | bullet, number |
| Logseq DB | bullet, number, checkbox, heading, setext, fence, math |
| Tine | bullet, number, fence |
| Roam | bullet, number, heading, setext |
| Dynalist, RemNote | bullet, number, checkbox, heading, setext |
| Tana | bullet, number, checkbox, heading, setext, fence |
| WorkFlowy | bullet, checkbox, heading, setext, quote |
| Mubu, Moodo | bullet, checkbox, heading, setext |
| BlockNote | bullet, number, checkbox, heading, setext, quote, callout, fence, footnote |
| Notion, SiYuan, AFFiNE, Lexical | every element but comment and block id |

Tables: text in every app that holds one as text (a character typed in a cell, after a pipe or in
the delimiter row goes in); drawn as a widget in Live Preview, Outliner and true-outliner, whose caret
can't reach a row's ends.

The SxS, the same app runs rejudged with and without the declarations: 39 agreements more, 30
disagreements more; with D26 and its cases played since, against the runs before the declarations: 104
agreements more, 44 disagreements more. Every new disagreement is a case judged for the first time, skipped before because
the app couldn't run the case's option (Regression229 and Regression230 for 8 apps; the checkbox cases
for Tana and true-outliner); none that agreed disagrees. WorkFlowy's three whitespace differences became
disagreements: its heading drawn, Backspace at a heading's start takes the `#`s, where WorkFlowy does
nothing.

## Markup tags

`markup-heading`, `markup-task` and `markup-fence` are computed from what a case does as ourus plays
it (`test/lib/markup-tags.ts`), no longer written: the 250 in the spec are gone, and the reader takes
none.

A tag marks a step at markup a block app holds as its block's text or as a property, where ourus has
a boundary: the caret or a selection's end in a heading's or task's markup, at its text's start or in
a text with nothing else, before or after the step; on a fence's line; a selection taking some
markup; Delete bringing up a heading, task, code or fence line; Backspace joining into code or right
after an empty task; Cmd-Backspace up to the markup; typing or Enter making a fence, or a step
changing one.

The caret in markup alone (`locate`) would be narrower, but it untags 117 cases, and the 12 apps that
refuse the tags agreed on only 42% of those when played (51–79% overall): the block's text starts
with the markup (`- [ ] ┃abc`, where Logseq's Enter splits `[ ]` from `abc`), the app pairs typed
backticks, Enter on a fence's line starts a block. Against the hand tags the rules agree on 218 of
250; the 32 only written and the 46 only computed are borderline either way (the apps agreed on 51%
and 57% of them).

A block app also skips a step ourus leaves to the host with the caret in markup (`in-markup`): the
runner's stand-in is a text editor's key on the Markdown, which the app doesn't edit.

The 12 refusing apps, every newly played case run: 87 agreements and 42 disagreements fewer, each
app's share within a point of before.

Typed markup an app completes its own way is skipped there (`capturesTyped`): Logseq's runs of
backticks (paired), Tine's three (a backtick added), Notion's three and a whole `$$x$$` (its code block,
its equation); 5 disagreements fewer. Most such cases put the caret on a fence's line, already skipped
by `markup-fence`. SiYuan's `$$` makes a math block at a block's start only, which a pattern over the
typed text can't tell: one case, kept.

`OURUS_SXS_PLAYS='tag,...'` takes tags out of a driver's `refuses` for one run, to measure what it skips.

## Roam and Athens: an empty block at the top level

Both outdent an empty nested block (Enter7e) and, at the top level, make another empty block
(Enter7d); Shift-Tab at the top level does nothing (Outdent27). No new value: `enterOnEmptyItem:
outdent` at the top level now follows `outdentTopLevel` (`unwrap` leaves the list, as before;
`refuse` makes a new empty item, as `sibling`), and both drivers declare `outdentTopLevel: refuse`.

A harness bug on the way: a case replayed on items (`as blocks`) had its steps checked for "changes
only what blocks can't show" against the case's Markdown start, not the items, so a step ourus leaves
unchanged on the items read as changed and was dropped. Now checked against the items.

The 11 block apps that skipped cases through it, those files run again: 119 agreements, 26
whitespace and 9 disagreements more, 83 skipped fewer. Enter7, Enter15, Regression306 and the new
cases agree in Roam and Athens. The new disagreements are mostly cases played for the first time
(Auto23 and Auto24 in 7 apps); Regression182, a paragraph a reference definition starts, is refused
now where Roam and Athens outdent.

## Block apps: what ourus refuses as Markdown can't hold it

A step ourus refuses `not-expressible` (as played for the app: replayed on items or under its values,
else as drawn), where a block app changed something, is skipped, as a step that changes only what
blocks can't show is. Text apps keep the verdict: their result is Markdown.

Reading the app's result back as Markdown, to skip only what doesn't survive, doesn't work: drawn as
items and read back it "holds" in 7 of Roam's 10, since the blocks keep source text and escapes read
away (a backslash in math or code, Auto23/24; a setext title or underline, Regression15 and
Regression363; tab columns, Regression64; a table row, Delete35b).

`outdentTopLevel: refuse` refused with `not-expressible`; it is `at-top-level` now (Outdent27), which
no rule skips, so Regression182 stays a disagreement in Roam and Athens. And `--rejudge` counted a
step `judge` skips (lost, or refused) as agreeing; now skipped.

17 block apps: 111 disagreements fewer, 108 skipped more, 2 agreements and 1 whitespace more (an
earlier step judged). Auto23/24 (12–13 apps), Indent37 and Regression363 (9) and Regression15 (7) the
most.

## Logseq: a numbered run from 1

A driver can say how the app shows a state it can't show as is (`Driver.shows`), and the expected
state is compared in that form. Logseq's numbers each run of numbered siblings from 1, a number being
a block's property; its `holds` refused such a start already, now through the same function. Logseq
2 and Logseq DB 3 disagreements fewer: Backspace29, TO-Bug269, and MoveSubtree21 in Logseq DB.

## Headings: a section or a block

AFFiNE, BlockNote, Notion, SiYuan and RemNote without bullets move a heading alone, one block up
(MoveUp3), and do nothing on Tab and Shift-Tab at one (Indent12, Outdent4; SiYuan types a tab).
Obsidian, Emacs and SilverBullet do the same, a heading being a line there. The outliners agree with
ourus, the harness loading a section as the heading block's children.

A new option, `headings`. Under `section`, the default, a heading owns its section. Under `block` it
owns nothing and is a block as a paragraph is: it moves alone, past one node, and keeps its level
wherever it is moved or pasted; Tab and Shift-Tab on it
are refused (`heading-block`); Enter in it makes its next node, not its section's first; nothing
drops under it, and anything may go after it. It is read config, as `quotes` and `listParent` are
(`outlineChildren` nests no section), so a change reads the outline again. Spec: MoveUp3b,
MoveDown4b, Indent12b, Outdent4b.

AFFiNE, BlockNote, Notion, SiYuan, Lexical and RemNote without bullets declare `headings: block`. The drivers' own flag for a heading block
told from text starting `#` is `headingBlocks` now.

The six apps, those files run again and the rest rejudged: 127 agreements more (AFFiNE 23, BlockNote
31, Lexical 9, Notion 17, RemNote 19, SiYuan 28); heading moves from 68 disagreements to 2, Tab and
Shift-Tab from 35 to 0. Quote27 disagrees in Notion now: it leaves a heading below a quote where it
is. What still differs at headings is Enter (28): at a title's start, and Lexical's Enter continuing
a heading.

## Harness: copies

A case replayed on items (`as blocks`) replayed the buffers but not the clipboard, so a copy was
checked against the case's Markdown copy (`> a quote`, where Roam and Tine copy the block as `- > a
quote`). Now against ourus's copy on the items.

A block selection over a node the blocks read otherwise (a padded quote under `quotes: atom`)
selected no block: the app copied nothing, and its clipboard held what an earlier case left. Now the
block the node is in is selected, and a quote's block text starts at its `>`, its padding no block's.
Blocks selected whole are compared with what each holds, so a flat run's roots and a sectioned run's
are the same blocks. A copy that differs shows both clipboards in the report; before, only the two
buffers, which were the same.

14 cells agree now: Copy8 and Regression212/213 in Roam, Tine and Logseq DB, Copy40 in Athens,
Logseq DB, Roam, SiYuan and Tine. Copy40 stays a disagreement in Dynalist, Logseq and WorkFlowy, each
copying the block otherwise.

## Backspace on an empty item, `unwrap`

BlockNote, Notion, Lexical and AFFiNE make an empty item an empty paragraph where it is, the list
split there (Backspace29, Backspace17d, TO-Bug269); ourus deleted it, the caret going to the end of
the text above. RemNote does the same under `join`.

Under `backspaceAtItemStart: unwrap` an empty item now leaves its list as Enter's `exit` and
`taskEditing: unwrap` make one leave: an empty paragraph held by a placeholder, set off by blank
lines, the items after it a list of their own. Where Markdown can't hold that (the first block of an
item with no text) it goes as before. Spec: Backspace50c.

The four apps rejudged: 35 agreements more (AFFiNE 10, BlockNote 8, Lexical 6, Notion 11), none
worse. 5 were disagreements (Backspace17d in AFFiNE, BlockNote and Notion; Backspace29 and TO-Bug269
in AFFiNE), 30 skipped before, the app's empty paragraph having no form in ourus (Backspace7, 17, 39,
44, Enter39). Backspace29 and Backspace50c still differ in BlockNote, Notion and Lexical on the items
after it: they number them from 1, ourus keeps `3.` under `listParent: container`.

A second press takes the empty paragraph, and the lists on either side are one again, tight where the
list above was (Backspace50c's second step). Before, the paragraph's blank lines stayed, and the list
was loose; Backspace20, the same after Enter, expected that and is redrawn. A loose list keeps them;
lists of two kinds stay two. BlockNote, Lexical and Notion agree on that step; AFFiNE leaves the `3.`
as it was.

## Demos: decorations

cm6, textarea and gtk show the Markdown as text: `decorations` stays the default, none.
obsidian-true-outliner declared every element; it is `bullet`, `number`, `table` now, as
true-outliner 0.14.4 measured: Live Preview shows a heading's `#`s, a quote's `>`s and a fence as
text on the caret's line, and a task's `[ ]` is text there.

## SxS cold: no HTTP cache

The proxy's cache (`.sxs/http`, 143 MB, 5,238 files) deleted and every app run on the whole spec in
fresh windows, against the warm full run before it (`.sxs` at `dba76030`). Every app loaded from the
network; the cache is 128 MB now (2,149 files new, 1,327 changed, 2,846 no longer fetched). Eight
apps came back in a new build: Mubu, Notion, RemNote (both setups), Roam, SilverBullet, Tana and
WorkFlowy. Their verdicts held, but for RemNote (bl)'s PasteHtml36, an error in the warm run.

Against the warm run, 10 cells moved:

- Back to their usual verdict: Athens Enter47 (agrees), BlockNote MoveSubtree5 (an error, now its
  caret difference), RemNote (bl) PasteHtml36 (an error, now its disagreement).
- Flakes, agreeing again when run alone: Logseq PasteListForm5 and PasteList1, true-outliner
  TO-Bug264. They stay as the cold run left them in the reports.
- Tine PasteList15, PasteList26 and PasteList27: after a pasted code block the caret is at the end
  of the code or after its closing fence, run to run (PasteList27 agrees now, the other two don't).
- Logseq DB Regression237, the only one that disagrees every time (cold, alone, and in a full run
  of the app since): Enter then Backspace at `**bold*┃*` leaves `**bold*` and an empty block, the
  last `*` gone.

Two errors, each only in full runs. Logseq DB's test page didn't render at Regression328; BlockNote's
drag menu didn't come at MoveSubtree5 (in the warm run too), whatever was played before it: a run of
the cases its window played before passes. The runner plays an errored example once more in its
window, which it did only after two kinds of error before, any error now but the page gone; and an
example that errors twice is put at the end of the queue, played again once the other windows are
done or nearly. A full run of each since: no errors.

## Harness: Cmd-Backspace the app's way

Where ourus leaves Cmd-Backspace to the editor (inside a quote atom, `quotes: atom`), the runner plays
a text editor's for it on the Markdown, deleting to the line's first character. In an item's later
line that took the item's indentation too, and the replay drew a broken outline no block app can
make (Regression119, a code line in a quote in Logseq's family). For a block app it now stops where
the block's text starts, past the indentation of the items the line is in.

An item whose first block is a quote on its marker's line (`- > q`) held the quote as its block's
text, but the blocks after it in the item, past a blank line, as blocks of their own, where an app
with paragraphs in a block (`paragraphsInBlock`) holds them in the same block, as it does after an
item's text. Now in it too.

Regression119 agrees in Athens, Dynalist, Logseq, Logseq DB, Roam and Tine now; nothing else moved.
Regression199, the same key, still disagrees: its start is a heading's section, judged on the
drawings, where the case's empty first paragraph has no block.

## A heading's section, judged on the items

A case whose start has a heading's section was judged on its drawings, projected, even where its
blocks drawn as items read back as the same blocks: the check also wanted the same headings owning
sections, which items, a heading being an item's text, never have. So the app was judged against
ourus's Markdown, where an empty paragraph goes once the caret leaves it, and every outliner keeps
the empty block Enter made (Regression278, 277c, 277). Now such a start is replayed on the items as
any other is, but for an app whose heading blocks take what follows them as children
(`Driver.sectionHeadings`: Tana). Of an outliner's adapted cases, 73 more are replayed so; 33 stay on
the drawings, items not spelling them (a thematic break, a link reference definition, a table).

Replayed so, the cases showed how ourus edits an item whose text is an ATX title, where an outliner's
block holds a heading and lines after it, which Markdown writes as a paragraph right under the title
(`- ## one⏎  two`):

- Shift-Enter in the title made a new item; the rest is that paragraph now, and Backspace glues it
  back, the title a single line (ShiftEnter29b). It had turned the title into escaped text.
- Enter in that paragraph made another paragraph; the rest is an item of its own now, as a later line
  of an item's text splits off, the item's other children going with it, or staying under
  `enterMidItem: child` (Enter52b, Enter52c).
- Backspace joining an item of two lines to such a title was refused; its first line glues to the
  title, the other a paragraph right under it, where that is right under the title (Backspace53).
- Enter on an empty title in an item lost the heading; the heading stays and an empty item follows,
  as on an empty heading (Enter71b). The heading is left as written: rewritten, an item padded past
  its marker (`-  # `) lost its padding, which moved its content column and read the items after it
  as its children (Regression336, found by the inverse suite).

A pasted heading's section stays the heading item's paragraphs: the apps paste it four ways (in the
heading's block, Logseq; children, Roam and Mubu; siblings, Tine, Moo.do, Athens, WorkFlowy, RemNote;
joined, Dynalist), and Paste10, 11, 12 and 20, which agreed against the drawings, disagree in most.

SxS, the cases whose start or expectation changed run again, against the cold run: in the outliners
82 cells better, 32 worse, and 106 judged for the first time, 62 of them agreeing. Better: the empty
block (Regression278, 277c, 277), Gap20, Regression318 (a section's last item moved down: the
outliners leave it, as ourus on the items), Regression199, 144 and 145, and the Shift-Enter and Enter
cases above. Worse: the paste (18), Mubu's moves among headings (MoveUp22, 23, 26, Scenario16), Enter52
in Dynalist and Roam (skipped before), and flakes (TO-Bug264; Athens's Enter31 and Enter43, which a
rerun of the file changed). The new cases: ShiftEnter29b agrees in nine apps and no outliner
disagrees; Backspace53 in eight, against Mubu and WorkFlowy; Enter52b in Logseq, Logseq DB, Tine,
Moo.do, Mubu, WorkFlowy and true-outliner, against Athens, Dynalist, RemNote and Roam; Enter71b in
Dynalist, Mubu and WorkFlowy, against Moo.do.

## The comparison: sections, an empty page; a plain paste over every node

Three more from the disagreements left:

- The headings owning sections were `want`'s blocks by index, applied to `got`'s as they were: an
  empty paragraph a document editor keeps under a heading shifted every heading after it off its
  section, and a difference of blank lines read as a disagreement (Regression277c in AFFiNE,
  BlockNote, Lexical, Notion, RemNote and SiYuan). Now `got`'s headings in the same order own them.
- A page with no blocks was compared as nothing, ourus's empty document as one empty block, the
  app's empty page (Quote82: Athens, Dynalist, Logseq, Logseq DB and Roam deleting a quote's whole
  block). Both are one empty block now.
- A plain paste over nodes selected whole that are the whole document replaced the text as a text
  editor's select all, before `pasteOverNodes: nothing` had a say; the apps that paste nothing over
  selected blocks paste nothing there either (Regression177, and Regression177b for it).

## Copy at a caret: the node's text

AFFiNE, Moo.do and SiYuan copy the text of the block at a caret alone, without its children (Copy4,
Copy9: `kid` where ourus copies `- kid⏎  - g`). A new value, `copyAtCaret: text`: the node's text
without its markup or its children, copied as a selection over it is; a cut takes that text, the node
staying, empty, as SiYuan's does (AFFiNE's cut does nothing there, Moo.do's takes the block). The
three drivers declare it. Spec: Copy4b, Cut4b.

SxS: Copy4 and Copy9 agree in the three apps now, Copy4b too (SiYuan leaving the block selected);
Cut4 and Cut4b copy as the apps do, the text left behind differing as above.

## Joining a node with children: `never`

Mubu and Tana join no node with children anywhere: not a first child into its parent (`refuse`),
and not a sibling into the sibling above either, an empty one's children neither (Backspace8, 12d,
17d, 17h, 20, Delete7, 12). A third value, `joinWithChildren: never`: `refuse`, and those refused too
(`has-children`). The two drivers declare it. Spec: Backspace8b, Backspace8c, Delete7b.

SxS, backspace.md and delete.md run again in the two apps: Backspace8, 12d, 17d, 17h, 18g and 20,
Delete7, 12, 33 and 33b agree in both now (20 cells), the new cases too.

## Wrapping a selection: `autoWrap`

Typed over a selection, a character wrapped it where `autoClose` listed it as an opener: which
characters pair at a caret and which wrap a selection were one list. Probed in all 23 apps (each of
`` ` * _ ~ = ^ ( [ { ' $ `` over `use «this» here`), they are two:

| App | Wraps a selection in |
|---|---|
| Obsidian (bare, Live Preview, Outliner, true-outliner) | `` ` * _ ~ = ( [ { ' $ `` |
| Logseq DB | `` ` * _ ~ = ^ ( [ { $ `` |
| Logseq, Tine | `` ` * _ ~ = ^ ( [ { `` |
| Roam | `` ` ( [ { ' ``; `$` as `$$…$$` |
| AFFiNE | `( [ { '`; a backtick its code formatting |
| Athens, SilverBullet | `( [ {` |
| Dynalist, Mubu, Moo.do, WorkFlowy, BlockNote, Lexical, Notion, SiYuan | none: the character replaces it |
| RemNote, Tana | none: their own formatting (code, bold) or nothing |

Roam wraps in backticks it doesn't pair, Logseq pairs `$` it wraps nothing in. A new list option,
`autoWrap`, the characters that wrap a selection on one line, `autoClose` pairing at a caret only:
a backtick makes the selection code; a bracket wraps in any text that pairs, its closer ours; the
others in prose, a formatting character's closer the author's (a second `*`, bold), `$`'s ours. The
default, `` ` * _ ~ = ( [ { ``, is what Obsidian and Logseq's family share. Each driver declares its
own. Spec: Auto19b, Auto19c, Auto19d; Backtick21, Regression90 and Auto19 credit `autoWrap` now.

SxS: Backtick21 agrees in Roam now (18 apps), disagreeing in AFFiNE, RemNote and Tana (their code
formatting) and Emacs; Auto19 to Auto19d agree in 19 to 20 apps, RemNote and Emacs against (Roam's
`$$` for Auto19d). Regression90, ourus padding the code span, stays as it was.

## Toggle fold at a leaf; folds read in every case that folds

Toggle fold at a node with nothing to hide toggled its parent's fold (as true-outliner does). Probed
in every app with a fold command (a control, the caret on the parent, folding in all of them):
Obsidian bare, Live Preview and its Outliner, Logseq, Logseq DB, Roam, Dynalist and WorkFlowy do
nothing there; SilverBullet folds the parent, the caret left in it; Athens, Tine, SiYuan and RemNote
have only fold, which does nothing there, as ourus's; Tana's moves the caret to the parent. With
them: no option, a toggle leaves such a node alone, as fold and unfold do (Fold11, one step now).

The harness compared an app's folds only where the step drew some, and a driver read them back only
where the case started with some: SilverBullet folding the parent read as agreeing. A case whose
steps fold or zoom loads its view now, nothing folded where its start draws none, and in an app with
folds a step that draws none is one with nothing folded. Fold and zoom cases run again in every app:
Fold11 disagrees in SilverBullet and true-outliner, which fold the parent; nothing else moved, and
it agrees in the other eight.

## Enter in a quote after an item's text, `split`

In Logseq, Logseq DB, Tine, Roam, Athens and Dynalist a quote after an item's text is lines of its
block, and Enter splits the block there. Probed in all 23 apps on three shapes (at the end of a
quoted list, in the middle of a quote's line, at the start of a task's quote's text): those six,
Obsidian's Outliner, and in the middle BlockNote, Lexical and AFFiNE too make the rest an item of its
own; bare Obsidian, Live Preview, true-outliner and SilverBullet a line of the quote (`line`);
WorkFlowy, SiYuan and Notion keep it in the item. Under `enterInQuote: split`, ourus made the rest a
paragraph in the item; now an item after it, what followed the quote in the item going with it, its
first child under `enterMidItem: child` where something follows; after a task a task as `enterTask`
says. Obsidian's Outliner stays `line`: it splits in a list only, a quote outside one continuing as
in bare Obsidian. Spec: QuoteAtom18b, QuoteAtom18c.

SxS: Quote30 agrees in the six and in the four `line` apps; QuoteAtom18b in all six; Regression56,
57 and QuoteAtom18c in Logseq, whitespace in Athens, Dynalist, Roam and Tine (the emptied quote's
`> ` against `>`), Logseq DB writing the `>` onto the task's line.

## The SxS, full, against the cold run

All 23 apps on the whole spec, no error, against `.sxs` at `643e88e4`: 235 agreements more, 56
disagreements fewer, 7 carets and 19 whitespace differences fewer and more. Most: Logseq +28,
Logseq DB +23, Dynalist +21, Mubu +19, Athens +15, Moo.do +14, Roam and RemNote (bl) +13, Tana +12,
Tine +11. The text editors' disagreements rise by 1 to 8 each, new cases they play as text.
