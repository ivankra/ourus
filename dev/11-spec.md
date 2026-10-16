# Agentic spec review (2026-10-15)

Four agents had reviewed the behavior spec (`spec/`) independently, each on a branch of its own
(spec1 to spec4), against the side-by-side runs of other apps ([`10-sxs.md`](10-sxs.md)),
and fixed ourus to its version. This note is the aggregation: every case of the four read and
compared, the best of each merged into one spec, the conflicts decided (with the user where they
were the user's to decide), and ourus fixed to the result, written again here rather than taken from
any one branch. The branches and their own write-ups are gone; what of them is worth keeping is
here: the principles they worked by (§2, and the brief as it was given in the
[appendix](#appendix-the-brief)), what each got right and wrong (§8), their assessments of the
product (§9), and the next steps and insights the aggregate hadn't carried (§11, §12). It also
covers what followed in the same session: the questions the aggregation left open, answered with the
user one by one, each measured against the other apps first (decisions 6 to 19); a stricter spec
format, YAML config blocks holding the clipboard; and the SxS reports regenerated from earlier runs
without running an app.

| | main before | spec1 | spec2 | spec3 | spec4 | **aggregate** |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| spec cases | 458 | 541 | 511 | 495 | 467 | **654** |
| `npm test`: pass | 585 | 674 | 648 | 609 | 601 | **792** |
| `npm test`: pending | 8 | 2 | 1 | 29 | 2 | **1** |
| `npm test`: fail | 0 | 0 | 0 | 0 | 0 | **0** |

The one pending case is the guard's (Typing4: typing in a list marker under `editInMarkup:
refuse`), which needs the host-side guard that doesn't exist yet.

## Contents

1. [The four reviews](#1-the-four-reviews)
2. [The principles](#2-the-principles)
3. [How the aggregation was done](#3-how-the-aggregation-was-done)
4. [Decisions](#4-decisions)
5. [What changed in the spec](#5-what-changed-in-the-spec)
6. [The code changes](#6-the-code-changes)
7. [Checks](#7-checks)
8. [What each review got right and wrong](#8-what-each-review-got-right-and-wrong)
9. [Where ourus stands](#9-where-ourus-stands)
10. [Still open](#10-still-open)
11. [Next steps](#11-next-steps)
12. [Insights](#12-insights)

[Appendix: the brief](#appendix-the-brief)

## 1. The four reviews

All four started from the same `main` (458 cases, 585 passing, 8 pending) and the same SxS data.
spec1's session also drafted the principles, which the user touched up into the brief the other
three were given (§2); spec2 to spec4 worked from that brief, without spec1's numbered decisions.

- **spec1** (claude-opus-5.5): two full review rounds (ten parallel reviewers, then two), each
  followed by a fix round, with every app run again after each; the most thorough. It wrote each
  command's intro as ordered rules, probed inverse pairs (which found more than fifteen bugs in
  moves, fences, tasks and callouts), drew refusals with the buffer they leave, and fixed ourus
  broadly (moves that cross sections and never reparent other nodes, fence-boundary joins, headings
  in items, paste placement, callout titles). Its decisions with the user: `taskEditing` defaults to
  `checkbox`; `enterMidItem` (sibling by default); a first child with children may join;
  `indentUnit`, decided but not built.
- **spec2** (claude-opus-5.5): a rule-by-rule review that took guarantee 3 (the host's key only
  inside text) furthest: Backspace and Delete between paragraphs, in a marker, at a checkbox, a
  quote's `>`, a callout's `[!type]` and the preamble became ourus's. It ranked every case inline
  and added tests that every case is ranked, that every core case is in a daily flow, and that no
  applied command leaves the caret in markup; wrote twelve daily flows; renamed the cross-cutting
  files' cases to short IDs. Its decisions with the user: `enterMidItem`; a new `enterAtItemStart`;
  `taskEditing: checkbox`; Enter on an empty top-level item mid-list makes another item; empty items
  with children keep joining.
- **spec3** (gpt-6-astra): a skeptical audit that changed expectations first and left 29 of them
  pending, with code for few. It found what the others missed: splits and joins that assemble a
  fence from code, cross-node selection deletes left to the host, escapes a split writes that the
  join keeps, carets left in markup by structural commands and code pastes, paste not renumbering.
  It added a per-action `encoding-failed` check to the spec runner and intermediate states to round
  trips.
- **spec4** (gpt-6-sol): conservative and small: refusals drawn with their buffers, `enterMidItem`,
  Backspace and Delete between paragraphs as ourus's, a lone quoted paragraph unwrapped, the
  deletion of a marker's space with a blank line where the paragraph needs one, and the escape
  cases promoted.

The four agreed on a large core: `enterMidItem` with the sibling default, a list marker after the
caret staying text in every node (Enter22), the redesign's four escape cases (now built), refusals
drawn with their buffers, the caret after a checkbox and after `##`, and boundaries the host
mustn't decide.

## 2. The principles

**Where they come from.** spec1's session wrote down what its review kept deciding cases by, as a
draft for the user to settle (its write-up's "Principles (draft)"), so that agents working in
parallel could judge a case the same way without having been there. The user touched it up into the
brief for spec2 to spec4 (kept in the [appendix](#appendix-the-brief)): free-form Markdown is
territory ourus pioneers, and as users will have a plain line-editor mode to fall back to, ourus
needn't reproduce one; Obsidian's departures are measured against bare Obsidian and its Outliner
plugin, not the experimental true-outliner; conventional text editors count alongside Obsidian, as
the next hosts; and the draft's notes on running parallel work, its cost and what it left open went.

**Six layers, in order of precedence**, a higher one winning:

1. **What ourus is for**: structure-first editing of a text-first document, the text the user's and
   changed only where the structure means it; outliner behavior (the consensus of Logseq, Roam,
   WorkFlowy and Dynalist where they have one) extended to free-form Markdown by the same feel (a
   paragraph a node, a heading its section's parent, a quote a container) rather than by a text
   editor's line edit; no surprise to an Obsidian user without a reason the case gives (Obsidian's
   outcome breaks the structure, or contradicts itself); between the camps, agreement is the
   behavior, the side that breaks the structure loses, and two sound outcomes make an option.
2. **Eight guarantees** no command breaks: exactly the intended structure or a clean refusal
   (`encoding-failed` a bug, never an outcome); lossless and minimal; the host's key only inside
   text; other nodes keep their parents; inverse pairs invert; the caret never ends in markup; text
   stays text; empty nodes are held, then resolved.
3. **How commands decide**: one rule per situation, wherever the structure is; each command's rules
   an ordered list, the first that applies winning; Enter makes a node, Shift-Enter a line; a moved
   node lands where the text puts it; joins lose nothing; a heading's depth is its level; nothing
   pasted is lost; blank lines are the trailing gap of the node above; a list a command touches is
   renumbered; code is payload, fences are structure.
4. **Options** only for a measured, real disagreement on a daily path where both outcomes keep the
   structure, never for grammar, a guarantee or a rule, never to postpone a decision; the default
   what most users of both camps expect, the apps behind each value documented.
5. **Writing the spec**: a case shows one behavior, under a short stable ID, with a sentence or two
   of why; any editor can check it (refusals drawn with their buffers, nothing hanging on fonts);
   mirrors and inverses are cases; claims about other apps come from the SxS data; agreed but not
   built is `pending`, never redrawn to fit the code; cases are ranked, every core one in a flow.
6. **Reviewing and fixing**: evidence strongest first (these rules, a decision with the user, the
   outliners' consensus, bare Obsidian, text editors, adapted block-app results last); a reviewer
   never overturns a user decision, it asks; each case checked four ways (what a user expects, the
   rules, the same structure elsewhere, its mirror); fixes implement rules, not cases; tests, the
   typecheck and the differential before and after; every app run again, each agreement lost traced
   to a decision.

**Departures from Obsidian, and why** (layer 1's third principle, as spec1 and spec2 found it):
bare Obsidian edits lines, ourus edits nodes, and nearly every daily-path difference is a line edit
changing the structure, often silently, as Obsidian's editor and its reading view parse the text
differently (`10-sxs.md` §12.8). Kept as ourus's:

- **Tab and Shift-Tab indent and outdent the line**: an item's children stay behind and change
  parents; a paragraph after a blank line, or a heading, becomes indented code. ourus makes the
  paragraph an item and demotes the heading.
- **Alt-Up and Alt-Down move a line**: a heading leaves its section, a paragraph merges into its new
  neighbour, an item leaves its children (Outliner moves no paragraphs or sections at all).
- **Backspace and Delete delete a character**: at an item's text start the marker's space goes and
  the item is a lazy line of the one above; at a heading's start `#Hello` is a tag; Delete at an
  item's end makes the next marker text (`- one- two`); in a quote, a `>` goes or raw lines join.
- **Enter is a newline with list continuation**: what follows the caret isn't escaped (`- def` a
  nested item, `===` an underline); a list is left without the blank line the next paragraph needs (a
  lazy line); an empty child under its parent's text is a setext underline to CommonMark and to
  Obsidian's own reading view, where ourus sets it off with a blank line. Enter in a paragraph makes a
  paragraph, where Obsidian breaks the line.
- **Paste is text at the caret**: the first line glues onto the text (`- a1. x`), the rest lands at
  column 0.

Where Obsidian's way is a choice and not a break, it is an option, and the `obsidian` preset (§11)
is those values. The Outliner plugin edits nodes in lists and lines elsewhere, so its verdicts sit
with the outliners on lists and with bare Obsidian on the rest.

**How the aggregation used them**: as the first tiebreaker between branches, ahead of decisions on
record and of asking the user (§3, and the table at the end of §4).

**Where they stand.** The guarantees are in `spec/README.md` ("What every case holds to"),
shortened, with the amendments below; of the spec-writing layer, the README has the ordered rules,
short IDs, per-case prose, ranks and `pending`, and the harness checks ranks and core flows. The
rest (what ourus is for, how commands decide, options, reviewing) is only here and in the appendix.

**What the aggregate settled or changed.** The brief points at spec1's numbered decisions and
questions (in its write-up), which the others didn't have; each is settled now (spec1's
numbers named as its, bare numbers §4's):

- *Guarantee 3* is narrowed by decision 12: with the caret in markup, where only the host puts it,
  an edit ourus would refuse is the host's under `editInMarkup: host`, the default. That is an option
  over a guarantee's reach, which layer 4 rules out; the README states it as part of guarantee 3.
- *Guarantee 4* (spec1's question 21, narrowing the refusals in moves): the neighbors a command may
  reparent are named: direct outdent's later siblings, the section an unwrapped heading releases
  (decision 18), what a pasted heading takes in (decision 7), and the list a paragraph that stays
  takes in (decision 9).
- *Guarantee 5 and rule 8* (spec1's decision 8, blank lines a structure no longer needs): decision
  19, a rule in `gaps.md`.
- *Guarantee 6* (spec1's decision 16, a callout's `[!type]`): the caret goes after it, Home too.
- *Rule 3*: spec1 kept no `enterAtItemStart` (its decision 17) and recommended Enter at a
  heading's start push the heading down, as at an item or a paragraph (its question 22); decision 6
  made Enter at any node's text start one rule, and an option, `enterAtTextStart`.
- *Rule 5* (spec1's decision 2, a first child with children joins) and *rule 6* (spec1's decision
  12, `logical` outdent doesn't apply to headings): kept.
- *Rule 7* (spec1's questions 18 to 20): one line pasted mid-text goes inline (Paste31); a heading
  pasted at a paragraph's end is a node (decision 7); structured paste mid-text is
  `pasteStructuredMidText` (decision 13), not plain paste.
- *Rule 9* (spec1's decision 7, paste renumbering): decision 2.
- *Layer 4's default*: `pasteStructuredMidText: split` is the user's call against five of the seven
  apps that answer (WorkFlowy and Dynalist split; Logseq, Tine, Roam, SiYuan and true-outliner go
  after), the one default that isn't the majority's.

## 3. How the aggregation was done

- **Every case compared.** Each branch's spec was read with the spec's own reader and compared
  with `main` case by case: unchanged, prose only, assertions added, expectation changed, moved,
  new. 156 of `main`'s cases changed in at least one branch, and 180 new cases were proposed, many
  of them the same case in two or three branches under different IDs.
- **Expectations checked against code.** Every case of the aggregate was played against `main`'s
  code and each branch's, so a drawing was either one an implementation produced or a new decision.
- **Per file, the richest version as the base**, the others' cases and fixes folded in: spec2's for
  most command files (its rule intros and ranks), spec1's for paste, fences, tasks, undo and
  true-outliner. New IDs were numbered after `main`'s, spec1's first.
- **Conflicts settled by the brief first** (its guarantees and rules outrank app consensus), then
  by decisions on record, then asked (§4).
- **The user's conventions for the spec**, set during the aggregation: per-case prose a sentence or
  two (what and why), with the detail in the file's intro; no notes that only restate the SxS data
  ("every app agrees"), only where Obsidian departs on a common path or the camps split; cases
  referred to by full IDs, never ranges or abbreviations (`Delete16b, Delete16c`, not `16b, c`); no
  reference to the branches or the brief in spec files.

## 4. Decisions

**Asked and decided** (2026-10-16):

1. **Enter's space at a split stays dropped, and Backspace doesn't restore it** (`07-bugs.md` §2,
   kept; Enter44, ShiftEnter21). spec3 drew pending cases demanding the round trip restore it. In
   the SxS runs, Logseq, bare Obsidian and true-outliner drop it on Enter; Roam, WorkFlowy,
   Dynalist, Tine, SiYuan, BlockNote, Outliner and SilverBullet keep it at the start of the new
   item, and of those Roam, WorkFlowy, Dynalist, Tine and Outliner restore it on Backspace. On
   Shift-Enter most apps keep it (bare Obsidian too, which `07-bugs.md` had right only for
   Shift-Enter). Markdown can't hold the space where those apps do: in `-  three` the extra space is
   the marker's padding, not text (the item reads `three`), and it moves the content column, so
   children indented two spaces stop being children (five or more spaces make the text indented
   code); a continuation line's leading spaces aren't text either. Kept as a trailing space on the
   first half, it would be invisible and stripped by editors that trim whitespace on save (and two
   would make a hard break after Shift-Enter); added back by every join, it would go into joins of
   text that never had one. An option (`splitSpace: keep`, the trailing space) was considered and
   left out for that reason.
2. **Paste renumbers the lists it touches**, as every other command does (`paste.md` rule 7,
   flipped): bullets pasted into an ordered list are numbered and the items after renumbered
   (Paste2, Paste16), and an ordered list pasted into one takes its numbers (Paste18).
3. **Short IDs in the cross-cutting files**: Quote1 to Quote70, Gap1 to Gap19, Scenario1 to
   Scenario23, numbered in file order; the old heading is the case's first sentence. Cases added
   since take the next number (Quote71, Quote72, Scenario24).
4. **Backspace peels the markup in front of a node's text, nearest first** (the user's proposal):
   a callout's `[!type]`, a checkbox, a heading's `#`s; then, with nothing above the node in its
   container to join, an item's marker (the item becomes a paragraph where it is), then a quote's
   `>` (the node leaves the quote); then the join. So `> - [ ] ┃b` loses its checkbox, its marker,
   its `>`, and joins the node above (Quote54).
5. **A new option, `backspaceAtTopItem`**, for Backspace at an item with nothing above it in its
   container (the document's first item, a quote's first item): `unwrap` (the default: the marker
   goes; at the top level the items after it become the paragraph's list, as Shift-Tab makes them)
   or `refuse` (as Logseq, Roam and WorkFlowy do nothing at the first block). Backspace33,
   Backspace34, Quote55.
6. **Enter at the start of a node's text is one rule, an option, `enterAtTextStart`**. `into` (the
   default): a new empty node above, the caret in it: an item above an item, an empty paragraph held
   by a placeholder above a paragraph or a heading (Enter32, Enter33: new; a heading used to split,
   a paragraph to get a blank line above), set off from a paragraph right above it, and on a quote's
   first line inside the quote (Enter45, Enter46, which the differential found). `stay`: Enter
   splits there as anywhere, the caret staying with the text (Enter26b, Enter29b, Enter32b,
   Enter33b). The SxS runs split the apps into the same two camps: `into` everywhere in Roam,
   WorkFlowy, Dynalist and SiYuan; splitting at the caret everywhere in bare Obsidian, Live Preview,
   Outliner and SilverBullet (Logseq and Tine go into at items and split headings; BlockNote stays
   at items and puts an empty block above a heading). A blank line above a paragraph shows nothing,
   and text typed after Up joins a neighbour, which a held empty paragraph avoids. Items first:
   spec2's session had made it an option, spec1 had recommended against it; where two sessions'
   decisions differ and both outcomes are sound, an option. Named `enterAtItemStart` until it
   covered every node.
7. **A heading pasted at the end of a paragraph is a heading node** (unlike plain paste),
   and it splits the section it lands in, as a heading typed there would: what follows it, up to a
   heading of its level or above, becomes its section (Paste32 to Paste35). The user chose this
   over refusing, though the nodes it takes in get a new parent, which guarantee 4 now names among a
   command's own neighbors (decision 18).
8. **A test's config block is YAML, fenced as a `yaml` block (highlighted where the spec is read),
   and holds the clipboard it starts with** as a literal block (`clipboard: |`, `|-` without a
   final line break, `|2` for lines that all start with spaces): before the first action, at most
   one config block and exactly one buffer. Every value is a string; a clipboard that isn't a
   literal block, or whose lines would lose their indentation, is an error, and so is a leftover
   `config` fence.
9. **A paragraph that doesn't move takes in the list a move leaves after it** (MoveUp35):
   the text reads it so, and it renders as before; a paragraph that moves above a list is still
   refused (MoveDown25).
10. **A callout's only child moves out of it** (Quote71), as out of an item, the callout
    keeping its title; no option. Bare Obsidian moves the line, which leaves the callout too.
11. **`deleteSubtree` on the document's only node empties it** (DeleteSubtree6), keeping the
    last line ending; drawn by typing after it, as a buffer can't be empty.
12. **An edit with the caret in markup that ourus would refuse is the host's by default** (a
    new option `editInMarkup`): the caret gets there only by the host (a click), so ourus steps
    aside (`notApplicable`, the refusal's reason as `detail`, an advisory a host may show), and the
    host edits as a text editor would (Delete23, Delete24, Delete25, ShiftEnter22, Quote43).
    `refuse` keeps the refusals, for a stricter editor (Delete16b, Delete16c, ShiftEnter22b,
    Quote43b), and there the guard, once built, puts typing in a marker at the text start (Typing4,
    pending). Guarantee 3 says so; structural commands are refused either way.
13. **Structured paste: two options, measured first**. A throwaway grid of 8 caret positions
    by 6 clipboards, for each paste, run in every app, decided them. `pasteStructuredLines`: plain
    lines are text, as plain paste puts them (`text`, the default: Logseq, Tine, SiYuan, BlockNote,
    true-outliner and every text editor, 10 of 13), or items (`items`: Roam, WorkFlowy, Dynalist).
    `pasteStructuredMidText`, replacing `pasteMidText`: in the middle of a paragraph's or an item's
    text, the node splits where Enter would, the paste going in between, its nesting kept (`split`,
    the default, the user's call: WorkFlowy and Dynalist split, flattening it), or the paste goes
    after the node (`after`: Logseq, Tine, Roam, SiYuan, true-outliner). An inline mode, the text
    after the caret a paragraph of its own, matched no app and was dropped. Where an item with
    children puts the paste stays where Enter puts a new node (the apps split 3 to 3, and the three
    that differ contradict their own Enter). Paste7, Paste8, Paste10, Paste36 to Paste39, Paste42,
    Paste43; Scenario17 is now the outliner flow, under `items`.
14. **Plain paste of paragraphs breaks them in the node**: a pasted blank line is a paragraph break,
    as two Shift-Enters make one (Logseq, Roam and Tine keep it so); it had failed to encode, found
    by the grid of decision 13 (Paste40, Paste41).
15. **Bugs the user hit in the demo, fixed with their cases**: a math block pasted into a list
    failed to encode both ways in the Obsidian flavor, as the escaper knew only CommonMark's blocks
    (now the flavor's `$$` and `%%` too), and an empty item took only code as its text (now math and
    comments as well; Paste44, Paste45); a second code block pasted at the first one's closing fence
    was left to the host, which glued it to the fence (now the paste goes after the block, where
    Enter puts a node; Paste46, Paste47).
16. **The subtree commands are named for what they move**: `moveBlockUp`, `moveBlockDown` and
    `duplicateNode` are `moveSubtreeUp`, `moveSubtreeDown` and `duplicateSubtree`, as
    `deleteSubtree` already was; their files `move-subtree-up.md`, `move-subtree-down.md` and
    `duplicate-subtree.md`, and their cases MoveUp, MoveDown, DeleteSubtree and DuplicateSubtree. A
    block, in Markdown, is a paragraph or a code block; a move carries the node's children too.
17. **Outdent out of a quote follows `outdent`**: with `direct` the item leaves where it is,
    the quote split around it, what followed it quoted after it, so the document's order stays
    (Quote12, Quote72); with `logical` it goes below the quote's other children (Quote12b). No app
    outdents out of a quote (the text editors leave the line as it is), so `direct`'s meaning
    everywhere else decided it.
18. **Unwrapping a heading releases its section** (kept): Backspace at a heading's text start
    makes it a paragraph, and the nodes under it become the section above's, as in every text
    editor; guarantee 4 now names it among a command's own neighbors, with what a pasted heading
    takes in and the list a paragraph that stays takes in (Backspace35).
19. **A blank line a command leaves that no longer separates anything goes**: a node that
    was right after another, set off by a blank line, and is now its first item in a tight list
    takes none, so a paragraph indented under an item doesn't make its list loose, and an item
    outdented out of a paragraph's list and indented back gives the text back (Indent29, Outdent15;
    Indent18 and Indent21 lose theirs too). An empty item keeps it: right under text it would read
    as a setext underline, as the differential showed. A rule in `gaps.md`.

**Decisions on record, kept**: `taskEditing: checkbox` by default and `enterMidItem: sibling` (both
spec1's and spec2's sessions); a first child with children joins (spec1's); empty items with
children keep joining (spec2's); Enter on an empty top-level item in the middle of its list makes
another empty item, at any depth (spec2's; Enter7, Enter15, with `enterOnEmptyItem: outdent` for the
old behavior).

**Settled by the brief's rules**, where branches disagreed:

| Question | Branches | Aggregate, and why |
| --- | --- | --- |
| Backspace between paragraphs (Backspace12) | spec1 the host's; spec2, spec4 ourus's; spec3 pending | ourus's: the blank lines go, `b` a second line of `a`'s paragraph (the brief: "between paragraphs the blank line goes"; a blank line between nodes is a boundary). All blank lines go at once (spec2), not one per press (spec4's is `deleteAtGap: gap`'s behavior). |
| A paragraph after a heading's blank line (Backspace22) | spec1 two presses, the first the host's; spec2 joins the title | joins, as `deleteAtGap: join` defines; `gap` gives Obsidian's. |
| Backspace at a quote's first paragraph | spec1 the host's; spec2, spec3, spec4 the `>` goes | the `>` goes (guarantee 3, markup first); a quote with other children keeps them (spec2's Quote56, against spec4's refusal). |
| A setext level-2 heading indented | `main` refused | ATX `###` (spec1's Indent25): the brief, "setext becomes ATX where it can't express the level". |
| Outdent leaving an empty item under text (Outdent7) | spec2 to spec4 kept the refusal | outdents, the empty item set off by a blank line (spec1): Markdown can write it, and every app outdents. |
| Moves into a section where a heading or paragraph would take nodes in | | refused (spec1): a move never gives another node a new parent, except a paragraph that doesn't move taking in a list (decision 9, MoveUp35). |
| A sub-heading crossing into the section above | spec1, spec2 with different blank lines | spec1's: it lands right after the section's last node, the section's end gap staying at its end, as items do (MoveUp22). |
| Enter at a closing fence's start | `main`, spec1 the caret on the fence | the caret on the new code line (spec3): typed on the fence it would unmake it. Fence26's join caret goes to the end of the text above, as in any join. |
| The caret after pasted code | spec1 after the closing fence | at the end of the code's last line (spec3), for the same reason. |
| A quote or heading pasted into a list | `main` pasted as text | a quote is the item's first block (Paste12), a heading an item whose text it is (Paste19), from spec1: nothing pasted is lost. |
| One line pasted mid-text (Paste31) | spec1 made a one-line item paste as nodes at the text's end (Paste26), which also took it out of a sentence | inline, as spec1's own open question recommended. |
| Delete of a first item's marker space with items after it (Delete16f) | spec3 refused; spec2, spec4 applied | applied, the items after it the paragraph's list, as direct outdent makes them. |
| The vertical caret cases | spec3 moved them to a test fixture | kept in `cursor.md`, drawn so a column means the same place in any font (spec1). |
| An indented clipboard | spec3: paste it as code | its common indentation goes first (`main`, spec1): it is how lines copied from inside a list paste (#264). |
| Shift-Enter at a continuation line's start making a paragraph | spec3: conflicts with "Shift-Enter makes a line" | kept: Markdown has no empty line inside a paragraph, so a blank line is what the break can be. |

## 5. What changed in the spec

| file | before | now |
| --- | ---: | ---: |
| [indent.md](../spec/indent.md) | 22 | 29 |
| [outdent.md](../spec/outdent.md) | 16 | 24 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 24 | 35 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 20 | 32 |
| [enter.md](../spec/enter.md) | 33 | 52 |
| [shift-enter.md](../spec/shift-enter.md) | 16 | 23 |
| [backspace.md](../spec/backspace.md) | 28 | 52 |
| [del.md](../spec/del.md) | 24 | 44 |
| [paste.md](../spec/paste.md) | 23 | 48 |
| [fences.md](../spec/fences.md) | 25 | 44 |
| [tasks.md](../spec/tasks.md) | 8 | 17 |
| [quotes.md](../spec/quotes.md) | 53 | 74 |
| [gaps.md](../spec/gaps.md) | 19 | 19 |
| [placeholders.md](../spec/placeholders.md) | 15 | 16 |
| [undo.md](../spec/undo.md) | 4 | 5 |
| [scenarios.md](../spec/scenarios.md) | 4 | 24 |
| [cursor.md](../spec/cursor.md) | 32 | 36 |
| [delete-subtree.md](../spec/delete-subtree.md) | 4 | 6 |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) | 2 | 3 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 72 | 67 |
| [typing.md](../spec/typing.md) (was `zzz-redesign.md`) | 14 | 4 |
| **all** | **458** | **654** |

Ranks: 61 `core`, 182 `common`, 277 `edge`, 134 `rare`; every core case is walked through in a flow
of `scenarios.md`.

**Form.**

- **Each command file's intro is its rules, in order**, the first that applies winning, each naming
  its cases; per-case prose says what the case shows and why in a sentence or two.
- **The README states the guarantees every case holds to** (from the brief; guarantee 3 with
  `editInMarkup`'s exception, guarantee 4 naming a command's own neighbors), the ID conventions, and
  the new options (`enterMidItem`, `enterAtTextStart`, `backspaceAtTopItem`, `editInMarkup`,
  `pasteStructuredLines`, `pasteStructuredMidText`, `rank`).
- **A case's setup is YAML** (decision 8): before its first action at most one config block, fenced
  `yaml`, holding its options and the clipboard it starts with, then exactly one buffer.
- **Refusals draw the buffer they leave**, so other apps are held to them.
- **The harness** checks every case's rank and that every core case is in a scenario; that no
  applied command leaves the caret in markup; and that no action fails to encode, even one followed
  by others (`test/spec.test.ts`).
- **Renamed**: the subtree commands' files and cases (decision 16).
- **Moved**: the redesign's cases to their commands' files, its typing cases to `typing.md` (the
  guard's four, one pending, Typing1 to Typing4), and each question the review had left open, once
  answered, to its command's file; the paste column case from `gaps.md` to `paste.md` (Paste27);
  frontmatter to `gaps.md` (Gap19); `zzz-open.md` is `z-open.md`, empty now that none is open.
  `obsidian-true-outliner.md` stays a file of its own: it is under the MPL, derived from the
  plugin's catalog, and its cases can't move into the MIT files as they are.

**Behavior, besides the decisions above.**

- **Guarantee 3, boundaries ourus now decides**: Backspace and Delete between paragraphs; Delete in
  a marker (its space: an item becomes a paragraph, refused where it would run into its parent's
  text) and before a checkbox; `taskEditing: text`; the preamble's keys (refused); fence lines from
  either side; a callout's title and its body; a quoted blank line; selections across two items'
  text (Backspace31, Delete21).
- **Guarantee 6, the caret**: after a checkbox, after `#`s, after a quote's `>`, after a callout's
  `[!type]` (Home too), on code rather than a fence, in the text after a structural command that
  started in markup (Indent28, Outdent14, MoveUp34, MoveDown32).
- **Guarantee 7, text stays text**: a list marker after the caret escaped in paragraphs, headings,
  setext titles and quotes; ordered markers and table delimiter rows on continuation lines in every
  flavor; Cmd-Backspace's escapes; and a join drops the escape its split wrote (Enter43,
  ShiftEnter20).
- **Moves**: across sections where the text puts them, headings where they take nothing in, never
  reparenting another node but a list a paragraph that stays takes in (decision 9); a paragraph's
  indentation rewritten where it would make code.
- **Fences**: no split or join may assemble a fence from code (Fence36 to Fence40).
- **Inverse pairs**: drawn for indent and outdent, up and down, Enter and Backspace, Shift-Enter and
  Backspace, Enter at fences, callout title splits, duplicate and delete.
- **Claims about other apps** corrected where the data contradicted them, and agreement notes
  dropped.

## 6. The code changes

Written again here, the branches' fixes as reference:

- `src/config.ts`: `enterMidItem`, `enterAtTextStart`, `backspaceAtTopItem`, `editInMarkup`,
  `pasteStructuredLines`, `pasteStructuredMidText` (replacing `pasteMidText`); `taskEditing`
  defaults to `checkbox`; each option documented as a list of its values, the default first;
  `indentUnit` and `joinWithChildren` decisions recorded.
- `src/commands/join.ts`, rewritten: paragraph boundaries, the peel (callout type, markup, item
  marker, quote `>`) with `backspaceAtTopItem`, headings in items, setext under `headingEditing:
  block`, quote-aware text above, joins into callout titles and empty tasks, Delete in a marker and
  at a checkbox (verified, with the encoder's fallback), quoted blank lines, escapes dropped on a
  join, selection deletes across two nodes' text (other shapes are still the host's),
  Cmd-Backspace's setext and reference escapes. A command checks its own plan where a refusal must
  be clean.
- `src/commands/code.ts`: fence boundaries from either side, empty code lines going, a fence that is
  an item's text joining the item above; the caret on the new line at a closing fence; an edit that
  would make a fence of code refused.
- `src/commands/enter.ts`: `enterMidItem`, `enterAtTextStart` (at a paragraph's or a heading's
  start, an empty paragraph above, held by a placeholder), the empty-item rule at every depth,
  escapes in every split, callout title splits, quoted blank lines, empty tasks.
- `src/commands/structure.ts`: crossing up and down where the text puts a node, sections and
  headings included; a move refused where it would reparent another node, but for a paragraph that
  stays taking in a list; a callout's only child moving out of it; setext to ATX; a callout keeping
  its title; a quoted paragraph after a paragraph indenting in place; `deleteSubtree` emptying the
  document; outdent out of a quote splitting it under `direct`.
- `src/commands/paste.ts`: blocks into the item at the caret, quotes and headings kept as
  structure, one-line pastes, tight lists kept tight, renumbering, the caret on code.
  `pasteStructuredLines` (plain lines through plain paste) and `pasteStructuredMidText` (a new
  `split` that keeps the paste's nesting and follows Enter's split, `enterMidItem` included). A
  pasted heading outside a list is a node that splits the section it lands in, taking in what
  follows it up to a heading of its level or above, and goes after the sections it closes (inside
  a quote, taking in what follows is refused for now: an encoder path not written yet). Plain
  paste's blank lines are paragraph breaks; a pasted paragraph's list follows it in a quote, which
  had failed to encode; at a block's end (a closing fence, a table's last row) the paste goes after
  the block; math and comment blocks are an empty item's text, the caret ending inside them.
- `src/commands/index.ts`, `context.ts`: the preamble's refusal; the caret moved into the text after
  a structural command; with the caret in markup, an edit ourus would refuse left to the host
  (`editInMarkup: host`), `notApplicable` carrying the reason as `detail`.
- `src/encoder/`: escapes for other readers (ordered markers, delimiter rows); a paragraph's
  indentation on landing; a blank line for an empty first child; a callout title's `>`; scope-end
  gaps; no blank line before a node that becomes the first item of the node above it (decision 19).
- `src/outline/`: a kept parse rebuilt when a callout title changes; the text start past an empty
  task's checkbox and a callout's `[!type]`.
- SxS drivers declare how each app behaves for the new options (bare Obsidian's measured profile;
  Logseq, Tine and true-outliner `enterMidItem: child`; BlockNote and SilverBullet
  `enterAtTextStart: stay`; Emacs `taskEditing: text`; Logseq, Tine, Roam, SiYuan and
  true-outliner `pasteStructuredMidText: after`; Roam, WorkFlowy and Dynalist
  `pasteStructuredLines: items`); `rank` is spec metadata to the adapter. The
  demo's smoke test follows the new Enter on an empty item mid-list.
- `test/specfile.ts` reads frontmatter and config blocks with the `yaml` package (failsafe schema);
  the 41 starting clipboards moved into their config blocks, every case reading as before.
- `src/parser/flavor.ts`, `obsidian.ts`: an extension declares what opens its blocks
  (`Extension.startsBlock`), so the escaper escapes the Obsidian flavor's `$$` and `%%` lines.
- The SxS runner (`sxs/run.ts`): `--regenerate-report` judges each app's last runs against the
  spec as it is now, without running an app, and writes the reports and the table again (on the
  spec the runs were made with, it gives every verdict they gave); what an app did is kept per
  spec file (`.sxs/<app>/<file>.json`), so runs of a few cases add up, and a case moved to another
  file is still matched by what it plays.

## 7. Checks

- `npm test`: 792 passing, 1 pending, 0 failing. `npm run typecheck` (core and demo): clean. The
  demo's smoke test in headless Chromium: 65 of 65.
- The differential (every command at every position of 1,500 generated documents, 579,514 runs,
  against `main`): 41,326 runs came out differently, in 555 groups, and none of them newly failed to
  encode. Rerun after the later decisions (the paste options, `enterAtTextStart`, `editInMarkup`):
  63,354 runs in 975 groups, none newly failing to encode, once the regressions it found were fixed
  (`split` at a text's very start, plain lines on an empty item above a paragraph, Enter at a
  heading right under a paragraph or at a quote's first line; Enter45, Enter46). Against the
  aggregate as first merged, decisions 17 and 19 change only indent, outdent and the joins next to
  them: 75 groups, none newly failing to encode, and 141 indents that failed to encode there now
  apply.
  The first run found 22 groups newly failing to encode (unwrapping a top item above a table, a
  selection delete leaving a fence at a line start); they now escape what they leave at a line
  start, and a plan that still doesn't re-parse is refused rather than applied. What changed in the
  first run, largest first:
  - carets and selections moved out of markup, and snapshots of escapes and blank lines, across
    every command (about 20,000 runs still applied, differently);
  - `duplicateSubtree` no longer fails to encode (2,999), moves cross sections (2,080 up, 137 down)
    and indent reaches what it refused (1,349), while moves that would change another node's
    parent are refused (1,184 down, 595 up);
  - Backspace and Cmd-Backspace at boundaries the host used to join now join by the rules (2,019
    and 1,115), and the top item unwraps (823 each);
  - Delete joins by the rules (1,608), and refuses what the spec refuses (2,387): before a marker
    (Delete16c), at the end of a setext title or a fence's opening line, and joins
    `headingEditing: block` refuses; Backspace likewise (565: a paragraph of more than one line
    into a title, Backspace23; a fence's opening line);
  - structured paste handles what it left to the host (935).
- The SxS, every app run again on the aggregate (624 cases). On the cases both runs played alike
  (265 to 376 per app), no app did anything differently, 29 agreements were gained (10 cases) and
  13 lost (6 cases), each to a decision: Enter on an empty item mid-list makes another (Enter15,
  Enter7: 7 lost in the text apps and SiYuan, 10 gained in the other block apps); `enterMidItem:
  sibling` (Enter3: Logseq and true-outliner agree on Enter3b, the `child` their drivers declare);
  the caret out of markup (Placeholder13, TaskBackspace1); the caret on the new code line at a
  closing fence (Fence13).
- The SxS after the later decisions: each changed spec file run again in every app, the rest judged
  again from the recorded runs (`run.ts all --regenerate-report`), so every app's report and the
  table in `sxs/sxs.md` cover all 654 cases, none left unrun. Of the cases each can run, Logseq
  agrees on 258 of 459, Dynalist 240 of 459, Tine 238 of 437, SiYuan 219 of 407; bare Obsidian 134
  of 602. A full rerun of every app gave the same counts for each app it ran; it
  didn't run SilverBullet, whose demo never finished its first sync.

## 8. What each review got right and wrong

- **spec1** found the most, fixed the most, and drafted the principles; its inverse-pair probing and
  move rules are the backbone of the aggregate. It still left boundaries to the host that its own
  guarantee 3 forbids (Backspace between paragraphs, at a quote's first paragraph, a paragraph after
  a heading's blank line), refused a quote's first item where Markdown can write the result, and
  its prose carried long lists of agreeing apps.
- **spec2** applied the guarantees most consistently and built the harness the spec needed (ranks,
  core flows, the caret check); the peel started as its rule. It kept a callout title split merging
  into the body (against "Enter makes a node") and drew a heading crossing with a blank line the
  section rule doesn't write; its renaming to short IDs was right, and adopted.
- **spec3** was the best auditor: fence collisions, selection deletes, escape round trips, carets
  in markup, renumbering, intermediate states in round trips. It also over-reached: 29 expectations
  without code, a decision on record overturned (the split space), layout cases exiled from the
  spec, clipboard indentation kept against the regression it fixes, and open questions the brief
  already answered.
- **spec4** was careful and small, and its blank-line fallback for a marker's space is the one
  adopted. Its Backspace removing one blank line per press is `gap`'s behavior under `join`, its
  joined empty task left the caret before the checkbox, and it refused a quote's first paragraph
  where the quote had more.

## 9. Where ourus stands

The three reviews that judged the product (spec2's "a strong alpha", spec3's "a prototype approaching
an alpha", spec4's "a strong editing-engine prototype") agree: sound in what it owns, not yet a
dependable everyday editor for notes that matter.

- **Strong**: every applied command is verified by re-parsing it against the outline it meant, which
  is why `encoding-failed` is rare and why "do the host's edit, verify it, refuse otherwise" costs a
  few lines (Delete in a marker is built so, and it is the guard's shape); clean layers (a parser
  passing the CommonMark and GFM suites, an outline model, commands on top); tooling unusual for a
  project this size (an executable editor-neutral spec, the differential, the SxS in 13 apps), which
  found most of what the reviews found.
- **Weak**: edits outside ourus's commands (the user's typing, the host's paste, selection deletes
  of other shapes) are unguarded, the main thing between ourus and daily use; containers (quotes,
  callouts, tasks) are less mature than lists, and tables, footnotes, math and frontmatter barely
  covered; the command code is accumulating ordered early returns that mirror the spec's rules only
  implicitly.
- **Not measured**: ourus inside a real host (the SxS measures the apps, not ourus in them; key and
  input-event paths, composition, undo), and performance (`npm run bench`).
- **The milestone** (spec3's): a small set of daily flows reliably lossless, reversible and
  unsurprising before more features; a bigger case inventory isn't that. For a beta (spec2's):
  selection deletes over every shape, the guarantees as properties over generated documents, a
  minimal guard, and real sessions in a host.

## 10. Still open

Every question the review left open is answered (decisions 6, 7, 9 to 13 and 17 to 19).

Not built: the guard (typing in a marker, which under `editInMarkup: refuse` lands at the text
start; by default the host types as it does); selection deletes whose ends aren't both in a
paragraph's or an item's text (across a heading, a code block or a quote), still the host's;
`indentUnit`.

Known gaps, each refused or falling back rather than writing wrong text:

- Enter at the start of a setext title's second line fails to encode, as it did before the review
  (found by a probe, not drawn).
- Inside a quote, a pasted heading with something after it is refused: the encoder can't yet move
  a paragraph under a new node there.
- Enter at the start of a quote that is an item's first block (`- > ┃q`) falls back to `stay`'s
  blank line.
- `split` falls back to `after` for a heading pasted into a paragraph, at a text's very start with
  nothing joining, and for an ordered list from another number than 1 under `enterMidItem: child`.
- A callout's child moved out and back gains a quoted blank line after the title, which decision
  19's rule doesn't reach.

## 11. Next steps

1. **Build the guard for native edits** (`editInMarkup: refuse`'s typing in a marker first), now
   that every open question is answered.
2. **Selection deletes over every shape**, the rule written (the ends join as Backspace at the
   second end's start would).
3. **Guarantees as properties over generated documents**: the differential already plays every
   command everywhere; it can also check the caret, inverse pairs and the host's edits at
   boundaries, as the spec now does for its cases.
4. **`indentUnit`**, then presets: `obsidian` (`enterAtTextStart: stay`, `taskEditing: text`,
   `deleteAtGap: gap`, `enterOnEmptyItem: outdent`, `backspaceAtTopItem: unwrap`), `logseq`
   (`enterMidItem: child`, `backspaceAtTopItem: refuse`, `pasteStructuredMidText: after`) and
   `workflowy` (`pasteStructuredLines: items`, `outdent: logical`); the drivers' `behaves` already
   say what each app is.
5. **Thin coverage**: tables, footnotes, math, HTML blocks and frontmatter have few cases; callouts
   and quotes most of the rest.
6. **Make the commands read like their rules**: `join.ts` mirrors `backspace.md`'s list as a long
   function with early returns; a dispatcher of named rules in the spec's order would make "fixes
   implement rules" literal.

Proposed by the branches' write-ups, not checked against `main`:

- **Follow-up typing** (spec3): after a move, a join, a paste or a placeholder settling, type one
  character and check the intended node gets it; a caret that looks right may still sit in syntax.
- **Original apart from adapted, and by rank, in the SxS summary** (spec2, spec4): it weighs a
  `rare` refusal like a `core` Enter, and mixes adapted results, which measure the projection, with
  original ones; caret and space-only differences counted apart.
- **Mirrors as data** (spec2): a `mirror:` option naming the case mirrored, so a test checks that
  every one-sided case has its mirror, as the rank check does for flows.
- **Option interactions** (spec3): a small purposeful matrix (`taskEditing`, `headingEditing`,
  `deleteAtGap`, `outdent`, fences), not a full product.
- **A reason of its own for a move refused because it would reparent another node**
  (`would-reparent`, spec1), and MoveDown25's `no-next-sibling` made consistent with the
  `not-expressible` the same rule gives elsewhere.
- **ourus in a real host** (spec3, spec4): a few boundary actions through the editor adapter's key
  and input-event paths, with composition and undo, since the player can't show the host intercepts
  what it should.
- **More apps where they add evidence** (spec2): Logseq DB and AFFiNE, as `10-sxs.md` ranks them,
  for the cases where a paragraph owns a list.

## 12. Insights

- **Independent reviews converge on the core and diverge at the edges.** All four agreed on the
  big behavioral calls; their disagreements were about boundaries, carets and blank lines, and most
  of them the written guarantees settled without the user. A brief with ordered precedence made four
  reviews mergeable.
- **Each reviewer had a blind spot the others covered**: one fixed broadly but trusted the host at
  boundaries, one applied the rules strictly but missed collisions, one audited sharply but built
  nothing, one was careful but small. Aggregating was worth more than picking the best.
- **Reviewers re-decide what is on record unless it is written where they look.** Decisions made in
  one session (the split's space) or in a document the next reviewer didn't have (spec1's numbered
  decisions) were questioned again; the README now carries the guarantees (the rest of the brief is in
  §2 and the appendix), and decisions belong next to the cases they decide.
- **The differential catches what the spec doesn't**: the first run of the aggregate's code found
  60 encoding failures no case covered (a selection leaving a fence at a line start, an item
  unwrapped above a GFM table), and a regression in kind: selection deletes refused across headings
  and code, which no case had asked for.
- **Options settle taste, not truth.** Where sessions disagreed and both outcomes were sound
  (`enterAtTextStart`, Backspace at the first item), an option ended the argument; where one
  outcome broke the structure, the rules did.
- **Measure the apps before proposing.** A throwaway grid (8 caret positions by 6 clipboards, for
  each paste) run in every app overturned two proposals made from the spec alone: an inline mode no
  app has, and dropping `after`, which five apps use. The two options that came out of it each have
  a camp behind every value.
- **The differential found something every time the behavior changed**: splits at a text's very
  start, an empty paragraph right under a paragraph line, Enter on a quote's first line. Each was a
  shape no case drew. Running it after every change is cheap; skipping it would have shipped them.
- **Users hit what generators don't.** A math block pasted into a list, and a code block pasted at a
  closing fence, broke in the demo though both the spec and the differential passed: the
  differential's clipboards had neither. What users hit belongs in the generator's corpus too.
- **Judging apart from playing makes the SxS cheap to keep current.** With what each app did kept
  per spec file, a spec change is judged again in a second, and only the cases it changed need the
  apps; a rename migrated the recorded runs without rerunning one.
- **A matching buffer doesn't show ourus did the edit** (spec3). The host's Backspace between
  paragraphs made the expected text while ourus left the boundary to it, so cases at boundaries draw
  `result: applied`; and the quote indent and outdent round trip, checked only at its end, hid five
  text editors that never entered the quote (indenting the line, or doing nothing), until its
  intermediate state was drawn.
- **Adapted results mislead about structure, rarely about text** (spec1, spec2): a block app holds a
  paragraph's list as its children, so a difference is often the two models differing (Paste1's
  support was a Logseq result the projection had garbled), while agreement is good evidence about
  escapes and joins.
- **A second full round finds less, and where the first looked least** (spec1): round 1 pinned 44
  pending cases across every family, round 2 twelve, eight of them in quotes and callouts, where no
  block app compares; past that, targeted passes beat full rounds.
- **Fresh agents beat copies of a long session** (spec1): round 1 ran ten copies of the main
  session; round 2's ten fresh reviewers all hit the usage limit within minutes, and two resumed did
  the work. Fresh agents with written rules and the last summary cost far less, and a second reading
  wants fresh eyes anyway.

## Appendix: the brief

The principles as spec2 to spec4 were given them (under a one-line task: review and revise `spec/`
against the SxS data, fixing ourus to the new spec), verbatim. Its section numbers are its own; its
decisions and questions are spec1's (§2 says how each was settled).

Sections below are arranged in the order of precedence, from most important first.

### 1. What ourus is for

1. **Structure-first editing of a text-first document.** The Markdown text is the source of truth and
   stays the user's: ourus edits it as an outline, so that what the user meant structurally is what the
   text then says, and nothing else in the text changes.
2. **Proper outliner behavior, extended to free-form Markdown.** Where Logseq, Roam, WorkFlowy,
   Dynalist, etc have an answer, their consensus is the reference. Where the document is free-form Markdown
   they have none: ourus is pioneering this territory and defines the behavior by extending the same feel
   consistently (e.g. a paragraph behaves as a node, a heading as a parent of its section, a quote as
   a container), not by copying a text editor's line edit (end users likely will have an option to
   fall back to normal line editor mode out of outliner mode, so we don't have to strive to fully
   reproduce it and can take deviations as needed for the benefit of outliner style editing.)
3. **No surprise to an Obsidian user without a reason.** Obsidian is the first big host. Where ourus
   departs from bare Obsidian (as well as its main Outliner plugin; note: NOT the highly experimental
   obsidian-true-outliner) on a daily path, the departure must be because Obsidian's outcome breaks
   the structure (often silently: code from a tab, a heading from an underline, a lazy line from a missing
   blank) or contradicts itself, and the case says so. A user who looks at the result should see why.
   Besides Obsidian, you should also consider the behavior of conventional text editors as well,
   as they are the next application for ourus.
4. **Choosing between the camps.** When the outliners and Obsidian/text editors agree, that is the behavior.
   When they disagree and one side's outcome breaks the structure, take the other. When both outcomes are
   sound and real users stand on both sides, it is a taste difference: an option (§4).

### 2. Guarantees

No command should break these; a case that needs to is wrong, or is a refusal.

1. **Exactly the intended structure, or a clean refusal.** A command's result re-parses to the outline
   it meant, or the command refuses with a reason Markdown imposes (`not-expressible`, `nothing-above`,
   ...). `encoding-failed` is a bug, never an outcome a case may draw.
2. **Lossless and minimal.** Nothing the user wrote is lost (text, children, a callout's title). Text
   the edit isn't about stays byte for byte: other lines, the node's own text, hard-break spaces, code
   payload, tabs, CRLF, the numbers of untouched lists. Prefixes, markers and blank lines are rewritten
   only where the structure requires it.
3. **The host's key only inside text.** `notApplicable` (the editor's own key) is for edits that stay
   within one node's text. At a markup boundary (a marker, a checkbox, `#`s, a fence line, a quote's
   `>`, a callout title, a blank line between nodes) ourus decides: it does the edit or refuses it.
   Nearly all the corruption this review found was a host key at such a boundary.
4. **Other nodes keep their parents.** A command changes the parents of its operands (their subtrees
   move with them) and of the neighbors its own definition names (direct outdent's later siblings
   become the item's children, which keeps document order), never of any other node: no node is taken in
   by a paragraph, list or section it didn't belong to. A command that would do so is refused. (Question
   21 asks to narrow the refusals this causes in moves.)
5. **Inverse pairs invert.** Indent and outdent, up and down, Enter and Backspace, Shift-Enter and
   Backspace, an Enter that makes an empty node and the Backspace that removes it: the second returns
   the first's text, or at least its outline where Markdown forces a difference (a blank line the
   structure still needs; outdent's policy with later siblings). Each exception is a case that says so.
   (Decision 8 decides the blank-line exceptions.)
6. **The caret never ends in markup.** After a command the caret is in a node's text: at its text start,
   after a marker, a checkbox, `#`s, a quote's `>` (and a callout's `[!type]`, decision 16), never where
   typing would break the node.
7. **Typed text stays text.** A command never turns text into structure: text after the caret that would
   start a block at a line's start (`- x`, `# x`, `2.`, `|---|`, `[a]: u`) is escaped. Only the user's
   own typing at a line's start authors structure (the guard's to permit).
8. **Empty nodes are held, then resolved.** An empty node Markdown can't hold (an empty item right after
   its parent's text, an empty paragraph) is held open by a placeholder while the caret is in it; when
   the caret leaves, an empty item stays, set off by a blank line, and an empty paragraph goes.

### 3. How commands decide

1. **One rule per situation.** The same key on the same structure behaves the same everywhere: in a
   list, under a heading, after a paragraph, in a quote or a callout, at any depth. A difference needs
   its reason in the case. (Round 2's quote and callout bugs were all breaches of this.)
2. **Each command's rules are written as an ordered list** in its file's intro, the first that applies
   wins, and every case is an instance of one. Backspace's, for instance: markup in front of the text
   goes first, as a unit; then an empty item goes; then between paragraphs the blank line goes;
   otherwise the node joins the node above; what can't be written is refused; mid-text the host's key.
   Delete mirrors it from the other side.
3. **Enter makes a node, Shift-Enter makes a line**, on every kind of node: items, paragraphs, headings,
   quoted text, callout titles. Where a node can't hold a second line (a heading, a callout title, an
   item's text start), Shift-Enter is refused. A list marker or other block start after the caret stays
   text (§2, 7).
4. **Moves: a node lands where the text puts it.** It keeps its kind and its own indentation, carries
   its subtree (a heading its section, a paragraph the lists it owns) and its trailing gap; at its
   parent's edge it crosses into the neighboring parent or section; a heading moves among headings of
   its level and enters a section only where it takes nothing in.
5. **Joins put text at the end of the node above, and lose nothing.** The joined node's children go to
   the node above (into its place when that node is its parent; decision 2). A join is refused only
   where Markdown can't write it (text into code, a multi-line title into a heading or a callout title).
6. **Headings: depth is level.** Indent and outdent change a heading's level, its section's with it,
   even past a missing level (as org-mode does); a setext heading becomes ATX where setext can't express
   the level; `logical` outdent doesn't apply to headings (decision 12).
7. **Paste: nothing pasted is lost.** The destination decides the form (bullet, indentation, spacing),
   the clipboard the content (text, numbers, checkboxes, nesting, kept relative); a block pasted in a
   list goes into the item at the caret, after its text; what can't be a node there is pasted as text,
   escaped. (Questions 18 to 20 decide one-line and mid-text pastes.)
8. **Blank lines are the trailing gap of the node above** and travel with it. A command writes a blank
   line only where the structure needs one (to end a list before a paragraph, to keep an empty item from
   reading as a setext underline, to separate two paragraphs), and (decision 8, recommended) removes one
   that no longer separates anything.
9. **Numbers: a list a command touches is renumbered** from its first number; a list it doesn't touch
   keeps its numbers as written. (Decision 7 would bring paste under this.)
10. **Code is payload, fences are structure.** Code lines are edited as text in the block's containers,
    their own indentation kept; no edit may unmake a fence (close a block early, open one that never
    ends, join code to text).

### 4. Options

1. **An option is for a measured, real disagreement on a daily path**, between the camps or within the
   outliners, where both outcomes keep the structure (e.g. `outdent`: Logseq against WorkFlowy and Roam;
   `enterMidItem`: Logseq against WorkFlowy, Roam, Dynalist and Obsidian). Grammar, the guarantees and
   the rules above are never options, and an option never postpones a decision.
2. **Default is what most users of both camps expect**; documentation names the apps behind each value.

### 5. Writing the spec

1. **A case shows one behavior**, in the file of its command (cross-cutting rules in `placeholders.md`,
   `gaps.md`, `undo.md`; flows in `scenarios.md`), under a short stable ID, with a sentence or two of
   prose: what it shows and why.
2. **Every case is checkable by any editor.** A refusal draws the buffer it leaves; a `result`-only case
   is for what nothing else shows. A case's outcome must not depend on fonts or layout.
3. **Mirrors and pairs are cases.** A case on one side of a pair (up/down, Backspace/Delete,
   indent/outdent) has its mirror; a command with an inverse has a case that plays both.
4. **Claims about other apps come from the SxS data** (original outlines, text-editor runs), name the
   apps, and are rechecked when the apps run again. An adapted result is never the only evidence.
5. **Free-text cases give their reason from ourus's rules**, since no block app answers them; where
   Obsidian differs on a common case, the prose says what Obsidian does and why ourus doesn't.
6. **Behavior agreed on but not built is `status: pending`.** An expectation is never redrawn to fit
   the code; a case that seems wrong is a question.
7. **Cases are ranked** (`core`, `common`, `edge`, `rare`), and every core behavior should also appear
   in a daily flow in `scenarios.md`.

### 6. Reviewing and fixing

1. **Evidence, strongest first**: the guarantees and rules here; a decision recorded with the user; the
   outliners' consensus on original outlines; what bare Obsidian show users; text editors for what plain
   editing does; adapted block-app results last. Probe ourus with a draft before drawing an expectation.
2. **A reviewer never overturns a user decision**: it adds evidence and asks.
3. **Each case is checked four ways**: would a user pressing that key expect this (§1); does it hold
   to the guarantees and rules (§2, §3); does the same structure behave the same elsewhere (grep
   `spec/` for it); does its mirror or inverse exist and agree.
5. **Fixes implement rules, not cases.** A fix that needs a condition for one case is a missing rule:
   write the rule into the file's intro first. Fix by command family; run `npm test`, the typecheck and
   the differential (every changed outcome explained, none to `encoding-failed`) before and after.
6. **After fixing, run every app again** and compare on the cases both runs share: every agreement lost
   must trace to a decision.
