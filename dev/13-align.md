# Aligning with other apps (2026-10-17)

The SxS ([`10-sxs.md`](10-sxs.md)) replays the spec in 13 other editors. After the spec reviews
([`11-spec.md`](11-spec.md)) and the bug hunt ([`12-bugs.md`](12-bugs.md)), most of what it reported
was no longer about ourus. A case written in Markdown, adapted to an outliner of blocks, often lost
the very thing it tested; some markup an app holds as text or as an attribute has no boundary to
compare; and apps whose own options differ from ourus's defaults disagreed by design, case after
case. This session separated that noise from real differences, and then used the real ones: to
change ourus where apps agree among themselves, to add an option where they split into camps, and
to find where ourus is alone and why. It ended with paste, where the outliners differ most, and
with a way to think of paste as the second half of a move, left for later.

| | before | after |
| --- | ---: | ---: |
| spec cases | 755 | 787 |
| spec cases tagged (`free-form`, `markup-…`) | 0 | 223 |
| config options | 14 | 19 |
| `npm test`: pass | 893 | 932 |
| `npm test`: pending | 1 | 1 |
| differential: runs | 926,744 | 934,115 |
| differential: runs failing to encode | 122 | 122 |
| SxS: disagreements, 7 block apps | 1,403 of 3,364 runs | 489 of 2,335 |
| of which on adapted examples | 1,156 | 282 |
| SxS: disagreements, Roam, WorkFlowy, Logseq, Dynalist | 791 of 1,924 (41%) | 224 of 1,281 (17%) |

The differential's corpus grew with the spec, so its counts are each on the corpus of their time;
the new cases brought known failures back on new documents more than they found new ones (§9).
The SxS's runs fell because tags and the apps' own options skip what would test something else
(§3, §4); its counts before are the committed reports of the bug hunt.

## Contents

1. [How it went](#1-how-it-went)
2. [Where the disagreements came from](#2-where-the-disagreements-came-from)
3. [Tags](#3-tags)
4. [Comparing what can be compared](#4-comparing-what-can-be-compared)
5. [Numbered lists, natively](#5-numbered-lists-natively)
6. [Options where apps split](#6-options-where-apps-split)
7. [Driver fixes](#7-driver-fixes)
8. [Cases no app agrees with](#8-cases-no-app-agrees-with)
9. [Bugs the differential found](#9-bugs-the-differential-found)
10. [The clipboard](#10-the-clipboard)
11. [Paste as the second half of a move](#11-paste-as-the-second-half-of-a-move)
12. [The paste options, reviewed](#12-the-paste-options-reviewed)
13. [The report, and working with the SxS](#13-the-report-and-working-with-the-sxs)
14. [Wrong turns](#14-wrong-turns)
15. [Still open](#15-still-open)
16. [Next steps](#16-next-steps)
17. [Insights](#17-insights)

## 1. How it went

- **Clustering.** Every adapted example a block app disagreed on, 283 examples and 1,140 rows
  across the 7 block apps, was given one cause (§2). About half was the adaptation's own noise.
- **Tags** (§3): a closed vocabulary of facts about a case, in its YAML, reviewed case by case by
  hand. First eleven tags, then, since only one rule read the eight structural ones and treated them
  alike, one: `free-form`; plus three `markup-` tags. Adapted disagreements: 1,140 to 453.
- **The comparison** (§4): an escape the projection kept, headings' sections compared by level,
  shapes with no block form, the apps' own option values, whitespace in text apps. Block apps' adapted
  disagreements: 452 to 365, original ones 242 to 206; 129 text-app verdicts from disagree to
  whitespace. The heatmap took adapted examples in, but compares two apps only on examples both ran
  alike.
- **Cases at the top of the list**: the ten with the most disagreements, then every case all 13
  apps disagreed on. One became an option (`emptyItemWithChildren`, §6); Paste17 led to numbered
  lists (§5) and to the paste options (§6).
- **Numbered lists** (§5): the drivers of the seven block apps that have them load and read them
  natively, each through the app's own mechanism, and the projection keeps them.
- **Paste options** (§6): `pasteStructuredListForm`, `pasteStructuredAtEnd`,
  `pasteStructuredOnParent` and `pasteStructuredParagraphList`, each value backed by measured apps,
  with spec cases for each.
- **Again the cases no app agrees with** (§8), now fewer: four comparison artifacts fixed, the rest
  real, each with its reason.
- **The differential's backlog** gave two bugs worth fixing now (§9).
- **The clipboard** (§10): Dynalist's structured paste "works for me", said the user, and it did:
  with HTML. A probe found nearly every app reads the clipboard's HTML when there is one; the runner
  now writes it. It moved apps between the camps of §6, which were measured again, but barely the
  counts: the apps place what they paste their own way, from either.
- **Paste as a move** (§11): reviewing paste as the second half of a move-to gave a short list of
  cases to correct and three decisions, postponed with the refactor they imply.
- **The paste options, reviewed** (§12): `pasteStructuredOnParent` and `pasteStructuredListForm`
  model what apps do; `pasteStructuredAtEnd` and `pasteStructuredParagraphList` mostly don't. And a
  declared value skips the cases it would change without checking the app behaves so: skipping is not
  agreeing.
- **The report** (§13): disagreements first, a summary per spec file, and notes for the next session.

## 2. Where the disagreements came from

The 1,140 rows fell into four families:

| family | rows | what it is |
| --- | ---: | --- |
| M: meaning lost in the projection | 545 | the case is about something Markdown distinguishes and blocks don't |
| R: markup held differently | 152 | the app keeps the markup as text or as an attribute: no boundary there |
| G: the app's own behavior | 425 | real differences |
| H: harness bugs | 18 | |

- **M**, by cluster: a blank line between paragraphs as a block boundary (85 rows); a node changing
  kind (77); a paragraph's list projected as its children, so moves into or out of it reparent
  (61); a block beside a heading or under it, the same text in Markdown (55); a heading's section
  released (16); heading order rules (69); heading levels changed by indent (46); a placeholder's
  empty paragraph resolving (38); an item's code as a child block (15); refused because Markdown
  can't write it (41); no block form at all (42).
- **R**: heading markup (50), checkboxes (43), fences (59). Logseq's `TODO` is text, so Delete
  before the checkbox leaves `ODO task`: honest, but not about a boundary.
- **G**: known splits on record (37), the space at a split (10), app quirks (159), how each app
  reads a Markdown clipboard (173), the heading or checked state going with a split's second half
  (27), Enter not carrying a task (19).
- **H**: an escape the projection kept in headings (`blockText`), and comparisons that ignored
  Markdown's own reading of a heading's section.

Numbered lists, escapes and CR line endings caused nothing but G; paragraphs, headings and setext
titles nearly all of M; code, tasks and math R.

## 3. Tags

A case's tags are facts about what it depends on, never the names of editors or verdicts
(`spec/README.md`, `test/specfile.ts`):

- **`free-form`**: the step depends on Markdown structure an outliner of blocks has no form for:
  paragraphs and their boundaries, a node changing kind at its depth, a paragraph's own list,
  heading levels and order and sections, placeholders, what Markdown can't write. Block apps skip it
  (`sxs/lib/plan.ts`). 135 cases.
- **`markup-heading`, `markup-task`, `markup-fence`**: a step at markup an editor may hold as text or
  as a block's attribute, where ourus has a boundary. A driver lists the ones it can't compare in
  `refuses`. 88 cases, 13 of them also `free-form`.

Candidates came from a script; every tag was reviewed by hand, case by case, and so were the
untagged cases of each file for what the script missed. The definitions sharpened in the review:
a kind change counts only at the node's depth; a paragraph's list leaves out indent and outdent;
heading order covers only Markdown's own rules; a placeholder means a held empty node resolving,
not one deleted; Markdown's limits leave out code and tables (a join into code is `markup-fence`).

Eleven tags became one: only the block-app skip read the eight structural tags, and it read them
alike. The verdicts didn't move.

A case's rank is its first tag, and every case has one: `tags: edge`, or `tags: edge free-form`.
The reader requires it first, one of `core`, `common`, `edge` or `rare`, and rejects a `rank:` key;
a test has it as `rank`, no longer among its options. Tags are words separated by spaces.

What it cost: 85 rows of real app behavior sat in tagged cases and no longer run, and 145
non-disagreeing verdicts in 68 examples dropped, most of them vacuous (the projection made the step
a no-op). Logseq, Tine and Dynalist refuse all three `markup-` tags; Roam and WorkFlowy the heading
and task ones (they skip code already). SiYuan and BlockNote now refuse `markup-fence` too (§7).

## 4. Comparing what can be compared

All in `sxs/lib/outline.ts`, `sxs/lib/text.ts`, `sxs/lib/plan.ts` and `sxs/run.ts`, each checked
against the recorded runs (`--regenerate-report`), every flipped verdict reviewed:

- **An escape kept in headings.** `blockText` removed line-start escapes in paragraphs only;
  SoftBackspace5 disagreed in all 7 apps that did exactly what ourus did.
- **Sections by level.** A block an app puts beside a heading is the same Markdown as the
  projection's block under it. Both sides are re-nested by heading level before comparing
  (`sectioned`), only for headings that own a section: an item whose text is a heading owns none
  (else Paste19 and Paste57 would agree in Tine where they don't). Scenario19, Scenario20 and Enter
  at a heading's end agree, and Paste33, Paste35 and Paste61, where Logseq and Tine put `## h`
  inside `## A`, which Markdown can't write.
- **No block form**: a heading's closing `#`s and indented code are unsupported in the projection,
  as quotes are. Setext titles of several lines stayed: apps hold those as a heading with breaks.
- **The app's own options.** A driver's `behaves` says what the app does where ourus has an option
  it can't be set to. Where that value changes ourus's own result for a case (`drawnSteps` in
  `test/spec-run.ts`), the case is skipped there, the reason naming the option; the spec has the
  other value's case. 214 by-design disagreements went: `enterMidItem: child` in Logseq and Tine,
  logical outdent in Roam and WorkFlowy, bare Obsidian's `deleteAtGap: gap`, `enterAtTextStart: stay`,
  Emacs's `taskEditing: text`. Skipping trusts the declaration, though; §12 recommends comparing
  under it instead.
- **Whitespace in text apps.** Only spaces before a line break were forgiven. Now a difference of
  spaces and tabs only counts as whitespace when ourus parses both texts to the same nodes, code
  compared exactly (`compareTexts`): 129 verdicts.
- **Whitespace after a block's prefix.** `10.  b` against `10. b` (a space kept after a number,
  checkbox or `#`s) is whitespace too: Enter3c in SiYuan and BlockNote.
- **The heatmap** counts adapted examples (block apps on 306 to 376 examples instead of 129 to 139,
  their agreement with ourus barely moving), but compares two apps only on the examples both ran with
  the same adaptations. Apps are ordered by their agreement with ourus.

## 5. Numbered lists, natively

The projection dropped list numbers (`numbered list`, an adaptation), so Paste17 and its relatives
compared bullets with bullets. Every block app has numbered blocks, each its own way:

| app | how it numbers | the driver |
| --- | --- | --- |
| Logseq | a block's property `logseq.order-list-type:: number`; a run of numbered siblings counts from 1 | writes and strips the property |
| Tine | the same property, in the block's `raw`; under a numbered parent, letters, then roman numerals | the same |
| Roam | the parent's `children-view-type: numbered`: all its children | sets it on the page or block |
| WorkFlowy | an item's layout `numbered`; a run counts from 1 | the layout |
| Dynalist | an item's list style; a counter per parent, counting across bullets | `set_list_style(1)` |
| SiYuan | an ordered list (`subtype o`), its items' markers | Markdown in, the DOM's markers out |
| BlockNote | `numberedListItem`, a run from its first's `start` | the block type and `start` |

With `ordered: true`, the projection writes an ordered item as a block whose text starts with its
number (`1. x`), as a reader sees it (the list's start, counted on), and keeps the escape of a
number that is text (`1\. x`), on a block's first line only. A driver's `holds` declines starts the
app would number otherwise (a run not from 1). Readers escape a number that is text after a
numbered block's own number too (`2. 2\. def`), and Roam loads a number that is text without its
backslash, having no Markdown.

The real lists turned some agreements into disagreements, which were real: Logseq turns an empty
`2.` block into a plain one on Backspace (Backspace29); Dynalist and Tine don't number the block
Enter makes; Tine pastes a numbered list as text. And they showed that, given Markdown as plain
text, Roam pastes numbers as text in bullets exactly as ourus does (Paste2, 13, 14, 16), apart from
the caret, which Roam leaves at the first pasted block (checked with a 1.5 s settle: it is Roam's).

## 6. Options where apps split

Each added where measured apps fall into camps on a path users take, with spec cases for each
value and `behaves` declarations in the drivers. How well each one fits what the apps do is
reviewed in §12.

**`emptyItemWithChildren: lift | refuse`.** Backspace or Delete on an empty item with children,
where they would move up into its place (Backspace17b, Delete5): `lift` (the default) removes the
item, its children a level up; `refuse` does nothing (`has-children`), as Logseq, Tine, Roam,
WorkFlowy, Dynalist and Obsidian's Outliner do. SiYuan, BlockNote and true-outliner refuse only
Backspace with nothing above the item and lift on Delete, so they declare neither. Cases
Backspace17f, 17g, 17h and Delete5e. No measured app lifts on Backspace17b.

**`pasteStructuredListForm: text | literal | drop | own`.** A list pasted into a list of the other
kind, measured on Paste2 and Paste13 to Paste18 in all 13 apps. What an app does depends on the
clipboard (§10): from Markdown as plain text, as below; from a rendered page's HTML, whose ordered
list has no number text, most apps drop the numbers, and the drivers declare that:

| app | numbers into bullets (Markdown as text) | bullets into numbers | from text | declared (from HTML) |
| --- | --- | --- | --- | --- |
| Roam | text, nested too; in numbered blocks too (`2. 1\. x`) | numbered | `literal` | `drop` |
| WorkFlowy | text, nested too | stay bullets | `literal` | `drop` |
| SiYuan | dropped, nested kept | numbered | `drop` | `drop` |
| BlockNote | own | stay bullets | `own` | `own` |
| true-outliner | own | stay bullets | `own` | `own` |
| Tine | as text in the block | stay bullets | `own` | `drop` |
| Logseq | as text in the block | numbered | `text` | `drop` |
| Dynalist | markers kept as text | markers kept as text | (none) | `drop` |
| text editors | raw text | raw text | (none) | (none) |

`text`, the default, is ourus's own: a number is text where the list form would lose it (rule 1),
form in an ordered list and on a list's first items (rule 3); no app does exactly that. `literal`
makes every pasted number text, nested lists' too; `drop` lets numbers go (against rule 1, an app's
choice); `own` keeps the paste's form, a list of its own, the list it lands in renumbered by rule 7
(which gives `1. b` after bullets pasted on an ordered list's empty first item, as true-outliner
does). A pasted item whose text joins the node's keeps its number as text under `text` and
`literal`, and loses it under `drop` and `own` (Paste31: BlockNote `see Introduction`, SiYuan a new
item without the number; every other app `see 1. Introduction`).

**`pasteStructuredAtEnd: after | join`.** Structured paste at the end of a paragraph's or an item's
text, measured on 30 end-of-text cases:

| app | at the end of the text | mid-text (`pasteStructuredMidText`) | declared |
| --- | --- | --- | --- |
| Logseq, Tine | new blocks for what they read | `after` | `after` |
| Roam | new blocks; one item from HTML joined (`ax`) | `after` | `after` |
| SiYuan | new blocks; one heading line joined, `#` dropped | `after` | `after` |
| true-outliner | new lines for lists; one line or code glued on | `after` | `after` |
| WorkFlowy | joins, but on an item with children pastes after them | `split` | `join` |
| BlockNote | joins, the item's children moving under the last pasted item | `split` | `join` |
| Dynalist | joins Markdown text, markers kept; HTML not | `split` | `after` |

The camps line up with `pasteStructuredMidText`; ourus's defaults (`split` in the middle, `after` at
the end) are a pair no app has. `join` is `split` with nothing after the caret: the
first text joins, the rest follows, the node's children follow the paste (or stay, with
`enterMidItem: child`); a heading, a quote or code joins nothing. 19 new cases cover both options
(Paste2b, 8c, 13b to 13e, 15b to 15d, 16b, 17b to 17d, 18b, 19b, 20b, 26b, 27b, 27c). Joining at a
paragraph's end lost the blank line before its list; the encoder now keeps a gap a command sets on
a rewritten node before new first children (`seams.ts`). Mid-text `split` loses it the same way, a
bug left as it was.

**`pasteStructuredOnParent: children | after`.** Structured paste into an item with children, at
the end of its text or in it, and a list at the end of a heading's title:

| app | Paste14, 27, 42, 59 | value |
| --- | --- | --- |
| Logseq, Roam | first among the children, where Enter puts a new node | `children` |
| Tine, WorkFlowy, Dynalist, SiYuan | after the children, as the item's next siblings, nothing split or joined; a list last in a heading's section | `after` |

Measured from HTML, every case the same way in each app. A paragraph that owns a list (Paste20, 21)
takes no `after`: in Markdown what follows a paragraph's list is more of it. Cases Paste14b, 27d,
42b and 59b, each the result its apps produce.

**`pasteStructuredParagraphList: siblings | children`.** A pasted paragraph and the list right
after it, landing in a list. ourus nested the list under the paragraph's item, as the paragraph owns
it where the clipboard was written. In a list a paragraph owns no list, though, and Logseq, Tine,
WorkFlowy and BlockNote put the list's items after it, at its level (Paste36: `See x / y / here.`;
Paste38: `See here. / x / y`): `siblings`, now the default, as the paste-as-a-move model reads it too.
Roam, Dynalist and true-outliner nest it: `children`, ourus's former rule (Paste36b, Paste38b).

Measured on all 13 apps, `pasteStructuredOnParent`, `pasteStructuredParagraphList` and the
paragraph's list placed beside it took `paste.md`'s disagreements from 574 (after the clipboard's
corrections, §10) to 562: the `after` cases
agree in Tine, WorkFlowy, Dynalist and SiYuan (but SiYuan's Paste27d, where it makes the pasted
items tasks), Paste36 in WorkFlowy, Paste38 in Logseq and Tine, Paste38b in Roam (its caret aside).
Dynalist and true-outliner nest a paragraph's list too, but each differs on a detail of its own:
Dynalist ignores the clipboard's last line break, true-outliner sets the list off with a blank line.

## 7. Driver fixes

- **SiYuan** read all of an item's blocks as its text; the projection makes code after an item's
  text, or a second paragraph, its children. Now its other blocks are children, in order with its
  nested lists, and an empty paragraph SiYuan leaves in an item stays with its text (Markdown has
  none). Paste1, Paste25, Scenario18 and Fence34 agree: SiYuan writes exactly ourus's Markdown.
- **BlockNote**'s divider read as `<divider>`; it is a thematic break, `---` (Paste58 agrees).
- **SiYuan and BlockNote refuse `markup-fence`**: their code is a block of its own, its fences no
  text, and SiYuan can't place a caret on a fence line (its errors there).
- **`behaves`**: the paste options as measured from HTML (§6, §10); SilverBullet and Emacs delete one
  blank line at a gap (`deleteAtGap: gap`), as bare Obsidian does.
- **Logseq and Tine** take the escape off the start of a block's later lines (`unescapeLaterLines`
  in `sxs/lib/outline.ts`): their blocks hold Markdown source.
- **Tine** numbers blocks (§5).

## 8. Cases no app agrees with

At the end, 13 cases that both block apps and text editors run have no app agreeing (30 at the
first count), 4 only block apps run (variants of the paste options, §12), and 201 only the text
editors run (`free-form`, and now the fence cases SiYuan and BlockNote opt out of). Each has its
reason:

- **ourus reads Markdown blocks the apps paste as text** (Paste66, 79): code copied from inside a
  list, math. Logseq, Tine and the text editors glue the text on, Dynalist makes a line an item,
  BlockNote keeps code's content alone. From HTML, Logseq reads a setext title as a heading, as
  ourus does (Paste53 agrees).
- **Paste57**: Roam and true-outliner nest the list under `The fix:`; in an item a paragraph owns no
  list, so ourus puts it beside.
- **Scenario23**: a backslash. Enter in `# Plan┃2. draft` escapes `2\. draft`; typing `revise `
  before it leaves the escape, no longer needed: `revise 2\. draft`. Typing is the host's.
- **Backspace17b, Delete5d**: an empty item with children; ourus lifts them (the default), no app
  does.
- **TaskEnter5, 6**: Enter on an empty task mid-list makes another task. Nobody continues it:
  BlockNote drops the checkbox, SiYuan and SilverBullet drop it and outdent, true-outliner outdents.
- **Mid-text paste** (Paste37, 42, 62, 70): each app splits, or not, its own way; Paste37, a
  top-level paragraph, whose list ourus's joined text owns, as Markdown reads it there.
- **Delete13**: a heading joined by Delete, every app its own way.
- **The text editors' cases**: they lack the structure ourus adds (62 in quotes: Tab inserts a tab,
  Shift-Tab out of a quote does nothing), and fences, where ourus refuses edits that would make or
  break a fence line, which a text editor makes, breaking the Markdown. In most, four or more of the
  six give the same output, mostly nothing or a raw text edit.

## 9. Bugs the differential found

- **`pastePlain` joined onto text before the caret.** The joined line wasn't checked for reading as
  a block start: `1` and a pasted `. a` read as a list, `1` and `1. a` as a nested one
  (`encoding-failed`), and a selection from an escape's backslash threw `overlapping changes` from
  the renumbering. Now escaped where the escape falls, in the pasted line or before the caret
  (Paste80, Paste81). `pastePlain`'s failing runs: 11 to 6.
- **A pasted paragraph's lines made items** (on a blank line, or with `pasteStructuredLines:
  items`): a line that reads as a list marker stayed unescaped, `2. y` becoming a nested list. It
  is escaped now.
- **Backspace at a heading item's title start**, the item having more lines: with the `#`s gone, its
  next paragraph ran into the title (`encoding-failed`). A blank line keeps it apart where the line
  below can't interrupt a paragraph (a paragraph, `2. c`, indented code), and not before `- c` or a
  fence (Backspace18g).

The other counts that moved are the corpus: new cases shift the documents the differential draws,
and known failures come back on new ones.

## 10. The clipboard

The runner wrote the clipboard as plain text: the case's Markdown. Dynalist kept every pasted `- `
as text, yet its structured paste worked for the user. A probe gave the apps plain text and HTML
saying different things:

| app | reads |
| --- | --- |
| Logseq, Tine, Roam, Dynalist, WorkFlowy, SiYuan | HTML |
| true-outliner, Obsidian, Live Preview, Outliner | HTML, converted to Markdown |
| SilverBullet | HTML, converted to Markdown with `*   ` markers |
| BlockNote | HTML at a text's end; the plain Markdown on an empty item and over a selection |
| Emacs | text (its kill ring) |

A copy from anything rendered reaches 11 of the 12 apps as HTML. The runner now writes both: the
Markdown as plain text, which ourus reads as a Markdown host passes it, and the Markdown rendered
(`renderHtml`, the parser's commonmark.js renderer; `sxs/lib/clipboard.ts`). Plain lines carry no
HTML, as a copy of plain text doesn't, and neither does frontmatter. `--plain-clipboard` writes the
plain text alone. The spec is unchanged.

The HTML changed what the apps did, not how often they disagreed: Dynalist's paste outputs changed
in 35 of 53 cases, but with all 13 apps rerun and every declaration measured again (below), the
counts barely moved:

| | disagreements before | after |
| --- | ---: | ---: |
| every case, 13 apps | 3,146 of 6,235 | 3,144 of 6,235 |
| `paste.md`, 13 apps | 586 of 792 | 584 of 788 |
| `paste.md`, Logseq | 17 of 52 | 14 of 51 |
| `paste.md`, Dynalist | 48 of 53 | 48 of 53 |

From HTML, Dynalist makes items instead of keeping `- ` as text, but it doesn't fill an empty item
(it pastes after it), pastes after an item's subtree rather than as its first children, keeps a
code block's text without its fences (`ac`), joins a heading's title (`ah`): its own placement, which
Markdown as text had hidden behind a reading problem. The text editors convert the HTML back to
Markdown and paste it as they pasted the text.

The paste declarations of §6 were measured with plain text, and HTML moves the apps between camps.
They were re-measured: every paste case run with no paste declaration, then each app scored against
ourus's result under each of the 16 combinations of `pasteStructuredAtEnd`, `pasteStructuredMidText`
and `pasteStructuredListForm`:

| app | best fit (end / middle / list form) | cases matched | ourus's defaults | was declared |
| --- | --- | ---: | ---: | --- |
| Logseq | after / after / drop | 39 of 55 | 35 | after / after / text |
| Tine | after / after / drop | 32 of 55 | 30 | after / after / own |
| Roam | after / after / drop | 29 of 40 | 21 | after / after / literal |
| SiYuan | after / after / drop | 22 of 56 | 18 | the same |
| BlockNote | join / split / own | 20 of 58 | 15 | the same |
| true-outliner | after / after / own | 17 of 73 | 13 | the same |
| WorkFlowy | join / split / drop | 7 of 39 | 3 | join / split / literal |
| Dynalist | none fits (3 of 52) | | 2 | join / split / literal |

An HTML list's numbers are no text (`<ol>`), so from HTML the apps that don't import numbering drop
them: `drop` is now Logseq's, Tine's, Roam's, WorkFlowy's and Dynalist's as well as SiYuan's, and
`literal` describes Roam, WorkFlowy and Dynalist given Markdown as text. Dynalist no longer joins.
The declarations follow the HTML (§6); `src/config.ts` and the paste spec name the apps of each
value for each kind of clipboard.

Three corrections followed, each a measurement, not ourus:

- **One line without a line break carries no HTML.** Paste puts it inline as text, and a copied line
  is no list: rendered, `1. Introduction` was an `<ol>`, and every app dropped the `1.`. The spec now
  writes such a clipboard as a quoted string, `clipboard: "1. Introduction"`, and the reader rejects
  it as a block and anything else quoted, or a plain value (`clipboard: # h` would be a comment).
- **Blocks HTML has no element for** (math, comments, callouts, frontmatter) carry none either: their
  rendering gave the apps bare text.
- **Logseq's and Tine's readers** take the escape off the start of a block's later lines (`\. y`), as
  the projection does: their blocks hold Markdown source, which kept it.

Disagreements on `paste.md`, 13 apps: 584 to 574; on every case, 3,144 to 3,133.

## 11. Paste as the second half of a move

Cut and paste, drag and drop and move-to will be one family. Seen so, paste is: read the clipboard
into nodes, find the slot from the caret, place the nodes as a move would, then join text at the
paste's ends. `02-preimpl.md` §7 had the same idea (`place` under indent, outdent, move, move-to,
drop and parsed paste); `paste.ts` re-implements placement on its own.

Read that way, the paste spec has three things to correct:

- **List form.** Moves keep an item's own form: a moved `1. a` stays a list of its own among
  bullets, a moved `* a` keeps its `*`. Paste adopts the destination's. Cut and paste equal to a move
  means `own` by default, and rule 3 (a list's first items restyle the items after) goes: a move never
  changes the kind of what it didn't move (Paste2, 13 to 18).
- **Joining as seams.** Whether a paste's ends join the text around them is one question about the
  clipboard, open or closed, not two options by position (§6); ourus's pair of defaults is a mix.
  Closed by default would make structured paste node paste (Logseq, Tine, Roam, SiYuan,
  true-outliner) and leave the text-like paste to Ctrl-Shift-V; open is the ProseMirror apps'.
- **Place, then join.** Joining first brought a paragraph's list along as children (Paste36); placing
  first, Markdown's own rule applies (in an item a paragraph owns no list), as every app does. This
  one is done (§6).

Most cases already fit: plain paste, filling an empty item or a selection, blocks going into the
item at the caret, headings and their sections, spacing, renumbering, reading the clipboard. An
internal clipboard, carrying the nodes with their ids and form, would make cut and paste exactly a
move; the options would then apply to text from outside. The differential could check it: cut and
paste in place is the identity, cut and paste at a slot is a move there, copy and paste after a node
is `duplicateSubtree`. Postponed, with the refactor it implies.

## 12. The paste options, reviewed

Six options now say how structured paste behaves: `pasteStructuredLines` and
`pasteStructuredMidText` from before, and the four of §6. At the end, for each: the default cases it
skips (an app declares another value, and the value would change ourus's result there), and how the
cases written for its other values compare, run where an app declares them:

| option | default cases skipped | its own cases, agree / disagree | fit |
| --- | ---: | --- | --- |
| `OnParent` | 11 | 14 / 2 | fits: each app the same way in every case |
| `ListForm` | 34 | 20 / 7 | mostly fits |
| `Lines` | 15 | 6 / 2 | fits |
| `MidText` | 29 | 3 / 2 | barely checked: few cases of its own |
| `AtEnd` | 24 (WorkFlowy, BlockNote 12 each) | 4 / 5 | hides more than it explains |
| `ParagraphList` | 3 | 1 / 2 | a real split, little gain |

And how much of each app's paste the options explain at all, its best combination of the three
first ones (§10): Logseq 39 of 55 cases, Roam 29 of 40, Tine 32 of 55, SiYuan 22 of 56, BlockNote 20
of 58, true-outliner 17 of 73, WorkFlowy 7 of 39, Dynalist 3 of 52.

What that says:

- **Skipping is not agreeing.** A declared value skips every case it would change, on the assumption
  that the app does what ourus does under that value; nothing checks it. `AtEnd: join` took 24 cases
  out of view for WorkFlowy and BlockNote, while only 4 of their 9 `join` cases agree: their joins
  aren't ourus's (BlockNote keeps a code block's content alone and drops a heading's `#`s;
  WorkFlowy joins only on an item without children). Part of `paste.md`'s fall from 586 to 562 is
  agreement, part is disagreement out of sight.
- **`OnParent` and `ListForm` are the right axes**: apps behave consistently along them, and their
  own cases agree.
- **`ListForm`'s `literal` and `drop` describe the clipboard as much as the app**: from HTML an
  ordered list's numbers are no text, so most apps "drop" them; from Markdown as text they "keep them
  as text". `drop` is also against rule 1.
- **`ParagraphList`** records a 4-to-3 split whose `children` apps each differ on a detail of their
  own; it cost nothing, and it buys little.
- **The rest is mechanics, not camps**: WorkFlowy, Dynalist, BlockNote, SiYuan and true-outliner
  differ by an empty item they don't fill, the clipboard's last line break as an empty item, code
  fences stripped, a heading's title joined, pasted items made tasks, numbering restarting at 1.
  More options there would fit the SxS, not users.
- **Six options interact**: `OnParent: after` overrides `MidText` and `AtEnd`, `ListForm` decides what
  a join keeps, `ParagraphList` what a split's rest holds. Hard to hold in the head, and to test.

Recommended:

1. **Compare an app against ourus played under its declared values**, instead of skipping (in
   `sxs/lib/plan.ts`, where the option skip is): a coarse or wrong declaration then shows as
   disagreement, a right one earns its default cases, and the counts measure how well the options
   fit. Skip only where a case itself sets a value the app doesn't have. The variant cases stay, as
   the spec's documentation of each value. This was suggested at the first clustering (G1) and
   skipping was chosen then; with six paste options it hides too much.
2. **Keep `OnParent`, `ListForm`'s `text` and `own`, and `Lines`.**
3. **Fold `AtEnd` and `MidText` into one question in the paste refactor** (§11: are a paste's ends
   open or closed), and `OnParent`, `ParagraphList` and `own` into placement shared with move-to and
   drop. No more paste options before then.
4. **Decide `literal` and `drop`** once 1 shows what they buy: kept, as honest descriptions of apps;
   or removed, the differences shown.

## 13. The report, and working with the SxS

The overall report (`sxs/sxs.md`) leads with what to work on: after the summary, **By spec file**
gives each file's examples, the apps' runs, the disagreements (and their share), the block apps'
among them, and each app's, the most first; in the test cases' table each example has, after the
apps, the count of apps that disagree on it and its rank, and each file's total row each app's
disagreements and their sum.

For the next session:

- **`node sxs/run.ts all --table`** writes the table and copies it into `sxs/sxs.md`; naming the
  apps writes only `.sxs/sxs.md`. A run with selectors (`… paste.md`, `Paste13`) writes the apps'
  reports with those cases only, `--no-report` or not: back the reports up first and put them back.
- **Before and after**: copy `.sxs/<app>/sxs.json` aside before a change, rerun, and compare verdicts
  case by case; per-app totals hide flips both ways, and a flaky case (Roam's Scenario16).
- **Probes**: a temporary branch in `run.ts` or a driver behind an environment variable, the reports
  backed up, the runner restored after (the clipboard probe of §10).
- **Fitting declarations**: run the cases with no declaration of the options in question, then score
  each app against ourus's result under every combination of values (`drawnSteps` with the values,
  the projection, `compareOutlines`/`compareTexts`). It found the HTML camps; worth a tool in `sxs/`.
- **The differential's baseline** holds only on the same corpus: new spec cases change the documents
  it draws, and known failures come back on new ones. Look at the failing runs (`DIFF_DUMP`) before
  `DIFF_UPDATE=1`, by command and by config.
- **The clipboard in the spec**: one line without a line break is `clipboard: "…"`, anything else a
  literal block; the runner gives an app that line, plain lines, and blocks HTML has no element for
  as plain text only.
- **Paste's open questions** are in §11 and §12; the measured camps per app in §6 and §10.

## 14. Wrong turns

- **`emptyItemWithChildren: refuse` declared for SiYuan, BlockNote and true-outliner** from
  Backspace17b and Delete5d alone, after an earlier finding that they lift on Backspace17c and Delete5;
  it hid their agreements there. Reverted, and rerun.
- **The first SiYuan reader** made an empty paragraph SiYuan leaves in an item an empty child block:
  13 whitespace verdicts became disagreements (Backspace5, 7, 10, 25 and others). Fixed before the
  numbers were reported.
- **The projection's escape** under `ordered` was kept on a block's later lines too, which made
  Paste30 disagree where Roam and SiYuan were identical, and ShiftEnter18 disagree where it was
  whitespace.
- **"Every app puts a pasted paragraph's list beside it"**: four do, and Roam, Dynalist and
  true-outliner nest it, as ourus did; an option now (§6).
- **"Roam does exactly as ourus"** was said of four cases and read as a consensus; it was Roam's,
  apart from the caret, and Logseq's and SiYuan's on two.
- **Logseq without numbered lists**: grouped at first with the apps that have none; it has them.
- **Dynalist "doesn't read Markdown"**: it reads HTML (§10). The proposal to drop its structured
  paste was withdrawn before it was made.
- **The paste declarations were measured with plain text** (§6); under HTML half of them were wrong
  (§10). Measured again, by fitting.
- **Counting skips as progress**: declarations took disagreements out of view, and the drops were
  reported as gains before their variants were checked (§12).
- **Recording the differential's baseline before reading the new failures**: they turned out known
  kinds on new documents, but were looked at after.

## 15. Still open

- `emptyItemWithChildren`'s default: no measured app lifts on Backspace17b.
- Enter on an empty task (TaskEnter5, 6): every app ends the task one way or another.
- Paste as a move (§11): the list form's default, open or closed ends, an internal clipboard.
- The SxS comparing under an app's declared values (§12), and `ListForm`'s `literal` and `drop`.
- One heading line pasted at a text's end (Paste32 to 35, 61): five block apps join its title,
  dropping the `#`s, against rule 1; ourus's decision 7 keeps it a node.
- What no option covers (§12): Dynalist's last line break as an empty item, empty items left and
  pasted after (Dynalist; Logseq, Tine and Roam from HTML, Paste49), code fences stripped, pasted
  items made tasks (SiYuan), numbering restarting at 1, Roam's caret at the first pasted block.
- A moved item adopting the bullet of the list it joins, as indent does.
- Scenario23's escape left behind by typing.
- Mid-text `split` losing a paragraph's blank line before its list.

## 16. Next steps

1. **Compare under declared values** (§12, recommendation 1): small, in `sxs/lib/plan.ts`, and it
   makes every count after it honest. Then a rerun, and the per-option table of §12 again.
2. **Paste as a move** (§11), with the move-to and cut and copy it belongs with: placement shared
   with move-to and drop, one open-or-closed question for a paste's ends, the list form's default,
   an internal clipboard, and the round-trip checks in the differential (cut and paste in place is
   the identity, at a slot a move, copy and paste after a node `duplicateSubtree`). The six paste
   options fold into it (§12).
3. **The decisions of §15**, each small once taken: `emptyItemWithChildren`'s default, Enter on an
   empty task, one heading line pasted.
4. **Tools**: the fitting of §13 as a script in `sxs/`; a case saying what its clipboard was copied
   from (a text editor, a rendered page), so both paths are measured where they differ.

## 17. Insights

- **Noise first, then alignment.** Half the disagreements were the harness's; read as they were,
  they pointed at ourus for things no app could have done otherwise.
- **Facts in the spec, verdicts in the drivers.** Tags say what a case depends on; drivers say what
  an app can compare and how it behaves. Neither names the other.
- **Measure before naming a camp.** Each claim about what "the outliners" do was wrong somewhere
  until every app was run: Roam's caret, Logseq's numbered lists, Dynalist's paste.
- **The input is part of the test.** A plain-text clipboard tested a path most apps take only when
  the copy comes from a text editor.
- **Skipping is not agreeing.** A declaration that skips the cases it would change hides how well it
  fits; an option is measured by its own cases agreeing, not by the disagreements it removes.
- **An option is a projection.** It fits apps whose behavior varies along it (Logseq, Roam, Tine) and
  barely the ones whose differences are mechanics (WorkFlowy, Dynalist): there, more options would
  fit the SxS, not users.
- **"ourus alone" is often the harness.** A reader that flattened an item's blocks (SiYuan), a
  divider read as an unknown type (BlockNote), an escape kept by one side: each looked like ourus
  disagreeing with everyone until both sides were read the same way.
