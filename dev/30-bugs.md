# Bug fixing (2026-11-10 to 2026-11-14)

The bug rounds after the refactoring (`dev/29-refactor.md`). They started with 135 open bugs, 20 of them
P2, and ended with 55, all P4: rare shapes whose fix is large, none reached from ordinary editing. A
fixed item's `[Bn]` is its id in `test/bugs.ts`; each fix's case is a test in `test/`, and a spec case
where one can be drawn.

## Contents

- [Summary](#summary)
- [The clipboard format](#the-clipboard-format)
- [Fixed](#fixed)
  - [Lists and selections](#lists-and-selections)
  - [Typing](#typing)
  - [Drops and drags](#drops-and-drags)
  - [Marks](#marks)
  - [Copy, cut and paste](#copy-cut-and-paste)
  - [Backspace](#backspace)
  - [Quotes](#quotes)
  - [Seams](#seams)
  - [Code and lists](#code-and-lists)
  - [Padded, shared and tab-led lines](#padded-shared-and-tab-led-lines)
  - [Block ids](#block-ids)
  - [The normal form by spelling](#the-normal-form-by-spelling)
  - [Parser](#parser)
  - [HTML conversion](#html-conversion)
  - [Performance](#performance)
  - [The suites](#the-suites)
- [Decisions](#decisions)
- [Open](#open)

## Summary

### 2026-11-10 to 12

After the refactoring (`dev/29-refactor.md`): seed 51's kept cases read, then the bugs in order of
priority, reach from keys and the cases a fix takes out.

- **Seed 51's 249 kept cases read by hand**, each replayed to its failing step and made one command on
  a note made smaller while it fails the same way: 228 shapes of filed bugs, 2 no bug, 18 new in 9
  shapes. Every one filed by id; the new ones B377 to B391 (B377, B345's second mechanism, 27 cases),
  then B396 and B397 from a second run.
- **Seeds 101 to 251 triaged** with `test/triage.ts`, written for it (each case replayed to its failing
  step, the note reduced a line at a time): new B398 to B404 (seed 101), B408 to B410 (seed 151), none
  from seeds 201 and 251. Marks cases the check can't judge (identical blocks, a raised line in code
  nothing closes) filed as no bug.
- **Umbrella bugs split by mechanism** (2026-11-12, the user's rule: "no umbrella bugs"): B237 into B413
  to B417, B412 into B412 and B418, B241 into B419 to B422, the HTML umbrellas B264 to B269 into B423 to
  B441, B211 into B442 and B443.

| When | Open | P2 |
|---|---|---|
| Start, 2026-11-10 | 135 | 20 |
| 2026-11-11 | 98 | 5 |
| 2026-11-11, `pasteAtTextStart: before` and after it | 72 | 2 |
| 2026-11-12, B377 and B237's keyed shapes fixed | 70 | 0 |
| 2026-11-12, the umbrellas split | 92 (all P3) | 0 |

Volume, seed 51: 2,284 failing sessions in 100,000 at the start, 103 at the end, every group filed;
seed 101: 644 → 103. Kept cases: 115 at seed 151, 89 at 201, 65 at 251; a dry run at seed 301, 61.
The diff suite against the commit before each batch: 0 regressions, about 415 runs that failed to write
written; the inverse suite gained round trips with each batch (281, 370, 122), none lost.

### 2026-11-12 to 14

**What was done**, in order:

1. **The 92 read for effort and worth** (2026-11-12). Rare input whose fix is large became P4, the
   user's rule (Decisions): 41 bugs. The rest were fixed by worth, the quick ones reached from keys
   first, then by reach (kept cases filed under each).
2. **The HTML batch**: every HTML conversion bug, 21, fixed (Fixed, HTML conversion).
3. **Volume runs, seeds 301 to 1001**, 100,000 sessions each: every failing session kept and filed by
   id under the bug that stands for it, a new bug where none did, or as no bug (most of those, marks
   the check follows by line where they follow their node). The table below.
4. **The normal form by spelling** (2026-11-13): odd spacing re-spelled on a node a command touches,
   and a command the writer can't write as spelled written again, its placed nodes anew, then its
   changed root blocks. It closed about 30 bugs at once.
5. **The clipboard format** (2026-11-13, B188): what a copy says about its ends, so a paste can put a
   cut back (below).
6. **One model of the lines**: the seam check's prediction of the written lines, fixed place by place
   where it drifted from the writer (Fixed, Seams).
7. **The suites hardened**: a baseline left behind fails its run, `copy-paste` joins `npm test`, the
   property tests run on a fixed seed (Fixed, The suites).

**Open bugs**:

| When | Open | P3 | P4 | Policy |
|---|---|---|---|---|
| Start, 2026-11-12 | 92 | 92 | 0 | 4 |
| First commit (20 fixed, 41 to P4) | 67 | 29 | 38 | 4 |
| After seeds 301 to 501 and the HTML batch | 78 | 6 | 72 | 4 |
| After the normal form by spelling | 47 | 3 | 44 | 3 |
| After the clipboard format and the decisions | 44 | 0 | 44 | 0 |
| After seeds 551 to 1001 filed | 57 | 0 | 57 | 0 |
| End, 2026-11-14 | 55 | 0 | 55 | 0 |

**The volume runs** (`VOLUME_SEED=n npm run test:volume`, 100,000 sessions; failing sessions, or kept
cases for the first two, and the bugs each filed):

| Seed | Failing | New bugs |
|---|---|---|
| 301 | 80 cases | B444 to B458 |
| 351 | 59 cases | B460 to B469 |
| 401 | 28 | B470 to B478 |
| 451 | 28 | B480 to B486 |
| 501 | 36 | B487 to B497 |
| 551 | 40 | B501, B502 |
| 601 | 38 | B503 to B505 |
| 651 | 19 | B506, B507 |
| 701 | 14 | B508, B509 |
| 751 | 24 | B511 to B514 |
| 801 | 21 | B515 to B519 |
| 851 | 17 | none |
| 901, 951, 1001 | 17, 21, 16 | B520 to B529 |

No throw at any seed. Seed 301 found one regression of the round, a caret past a duplicate's text
(fixed, Lists and selections), and seeds 901 to 1001 four of the round's own seam-check changes, fixed
before the end. Volume runs are paused (the user's, 2026-11-14): the last seeds found P4 shapes only.

**The full run at the end**: every suite passes; the diff suite 0 regressions, 5 runs failing to
write in both copies (B523's `- > a quote⏎⏎→> over two lines`, a paste into `>→> q`, a plain paste
into `- >-  `).

## The clipboard format

Decided 2026-11-13 (the user's, B188): what ourus writes on the clipboard, and how its paste reads its
own copies. Other apps read `text/plain`, `text/markdown` and `text/html` as they are; the mark is a
comment only ourus reads.

**The formats** (`clipboardOf`, `src/commands/clipboard.ts`; spec/copy.md rule 1):

```
text/plain     the selected Markdown, out of the containers that hold all of it
text/markdown  the same
text/html      the mark, then the Markdown rendered as it read in its note
```

**The mark**, first in the HTML:

```
<!-- ourus -->          whole nodes (a subtree selection, copySelection: nodes, a caret's node)
<!-- ourus text -->     text: a selection within one node's text, or from inside one node into another
<!-- ourus [text -->    text that starts at a boundary between blocks
<!-- ourus text] -->    text that ends at one
```

No `[text]`: a text selection with both ends at boundaries is whole nodes (below), written
`<!-- ourus -->` (decided 2026-11-13, the user's: the split was the cut's, a text cut of whole blocks
joining their neighbours, not the paste's). The copies before this, `<!-- ourus --><!-- text -->`,
read as `<!-- ourus text -->`.

**What a bracket means: how the paste takes that end.** Without one, the paste joins that end to the
text it lands beside: the copy's first line to the text before the caret, the text after the caret to
its last line. With one, it keeps the text on that side a node of its own. The rule for writing one is
the round trip: an end gets a bracket where, pasted back where a cut leaves the caret, joining that
end would not restore what was cut. So a bracket is where the selection takes none of a text at that
end:

- `[`: the start is at its line's end (the line break taken), before its line's text (in a marker or
  a prefix), or on a blank line. Not at a text's start, which the paste joins: there the text before
  a cut's caret is empty. Not in a text's markup on its line (a block id's): that is in the line.
- `]`: the end is at or before its line's text (the line break before it taken, in its marker or
  prefix), or on a blank line. Not at a text's end, for the same reason.
- None for a selection within one node's text: its line breaks are the text's own.
- Both: whole nodes. The blocks between, as a whole line selected from its start is: copied as
  nodes, `<!-- ourus -->`, and cut, Backspace and Delete take them out as delete subtree does
  (`wholeBlocksSelection`, `util.ts`; Copy42, Cut6): `- one«⏎- two⏎»- three`, cut, leaves
  `- one┃⏎- three`, where a text cut joined `one` and `three`.

The two ends aren't symmetric: a text's start is a boundary only for a selection's end, a text's end
only for its start. Drawn, `┃` where the cut leaves the caret:

```
- o«ne      text       cut  - o┃o       paste "ne⏎- tw": "o" + "ne", "tw" + "o"
- tw»o

- one«      [text      cut  - one┃o     "one" stays; "⏎- tw" an item of its own, "tw" + "o"
- tw»o

fi«rst      text]      cut  fi┃second   "fi" + "rst"; "second" stays a paragraph
                                         (Regression262)
»second

pa«ra       text       cut  pa┃line     one paragraph: "pa" + "ra⏎" + "line"
»line
```

**The HTML of a phrase** (decided 2026-11-13, the user's): a copy from within one text whose spaces
its rendering would lose (only spaces, or spaces it starts or ends with) is a span keeping them,
`<span style="white-space: pre-wrap">  b</span>`, as Lexical, Tana and WorkFlowy write theirs
(Regression99: `- a«  »b`). The SxS probe (2026-11-13, `SXS_CLIPBOARD_HTML=1`, which has the harness
read an app's `text/html` too) of `- a«  »b`, `- a«  b»` and `- o«ne⏎- tw»o`: Obsidian (all four)
writes `<!-- obsidian -->` alone for the spaces, `<p>  b</p>` (spaces an HTML reader collapses), and
`<p>ne</p><ul><li>tw</li></ul>` across items, as ourus does now; Lexical, Tana and WorkFlowy the
`pre-wrap` span; Dynalist, RemNote, BlockNote and Notion the bare spaces; Moodo and AFFiNE a list item
holding them; SiYuan its mark alone, then `<p>  b</p>`; Athens, Logseq, Roam, Tine and SilverBullet
no HTML. Every copy and cut case of the spec draws the three formats now.

**Paste** (`pasteAt`, `openSeams`, `src/commands/paste.ts`; spec/paste.md): ourus's own text copy, but
plain lines with no bracket (a copy within one text, whose line breaks go into the text as they are),
pastes with its seams open, whatever `pasteSeams` says, a bracket closing its seam where the caret's
text has text on that side. Elsewhere than back where it was cut, the same, as the text editors paste
text: the SxS probe (2026-11-13, `.sxs/probe/`) of a copy from `two`'s start, or to `three`'s end,
pasted between `x` and `yz`, found Obsidian (source, Live Preview), SilverBullet and Emacs joining both
ends, `- xtwo⏎- thr┃yz`; the block outliners can't select text across blocks (skipped), and
true-outliner copies whole blocks. A first line that is an item's text with the item's children after
it (`two⏎  - kid`, pasted into an item's text) is read as that item, so the children join the item at
the caret.

**Copy's side** (`copyOrCutCommand`, `selectionEnds`, `src/commands/copy.ts`, `util.ts`; `markdownOf`,
`src/doc/copy.ts`): a selection's end in a marker or a prefix is where that line's text starts, as a
caret there acts (`pastPrefixAt`, `util.ts`); a copy from a marker's padding starts at the text (B498),
one ending in a later line's indentation or marker ends at that line's start (B499); the item whose
text the copy starts in keeps its children's indentation in the copy (Copy2, Cut2: `two⏎  - ki`, was
`two⏎- ki`, a spec change); a text copy across nodes renders its first line as text and the lines after
it as the blocks they are (B500). Backspace and cut over a selection ending before an item's marker
join the texts (`- on«e⏎»- two` → `- on┃two`), not the marker read as text, which was B188's last
case.

**Cuts** (`deleteSelectionAcross`, `backspace.ts`): an end in a quote's `>` that is its paragraph's
frame (`quotes: text`) is past it too (`«> q»uote` cuts to `> ┃uote`); one under a node the cut takes
out joins that end's text, the node's children after it staying under the upper node (`- o«ne⏎- two⏎
  »- kid⏎  - more` → `- o┃kid⏎  - more`), where the host's deletion left the marker as text. An end
in a marker before a checkbox is still the host's, the checkbox kept.

**Measured:** every suite passes; the diff suite 0 regressions, its 38 moved outcomes judged: selections
ending before a marker or in a prefix that the host deleted, the marker left as text (`- «a⏎»- b`:
`- - b`), now joined by ourus (`- b`), Backspace, Delete, cut and paste over them alike; a cut from a
quote's `>` keeping the quote (`«> q»uote` → `> uote`); a selection from a marker's padding keeping
the item's padding (`- «   second…` → `-    hild…`); two pastes over such selections that were and
are a marker left as text, spelled otherwise (`1. Q- c` → `1. Q   - c`, `\# Hy` → `\# H y`).

**Left:** that last cut pasted back puts `kid` beside `two`, not under it: what depth the text after
the caret had is nothing a copy says. A heading cut into a list (`# H«ead⏎para⏎»- x`) is the host's
deletion, as at the last commit. A copy pasted at a text's edge elsewhere than where it was cut joins
there unless bracketed; whether a whole text should stand as its own node there is a question for the
block outliners, which the SxS can't drive across blocks.

## Fixed

### Lists and selections

- [B443] **Tab on a numbered item after its item's bullet child list took the parent's number**
  (`5. a⏎   - x⏎6. b┃` gave `   5. b`): in an item, right after a list of another kind, the run is a
  list of its own, numbered from 1, as a list Tab makes under the item's text is (`#list`,
  `draft.ts`), where no item of it stays in it: Enter at an existing `2) x` list's start after a
  bullet child list keeps its numbers (the diff suite caught a first try renumbering it from 1). The
  diff suite moved about 50 results, each a numbered item moved or indented after a bullet child list,
  now from 1. Regression377; `commands.test.ts`.
- [B442] **No bug, closed.** `5. a⏎   7. x⏎6. b`: a list starting at another number than 1 can't
  interrupt a paragraph, so `7. x` is `a`'s lazy text, and `b`, the item's first child, starts at 1;
  with a blank line before `7. x` Tab counts on (`8. b`). `commands.test.ts` holds both.
- [B217] **Duplicate and `addBlockId` with the caret past the note's final line break**: duplicate
  was `unsupported`, `addBlockId` refused, where Tab acts on the last node. Past the final line break
  is the last node's gap now, for the copy's caret (`duplicate-subtree.ts`) and the node a block id
  goes on (`block-ids.ts`). Regression379; `commands.test.ts`.

- [B359] **Tab on a selection of two paragraphs in a quote failed to write** (`> a⏎>⏎> «b⏎>⏎>
  c»`, the default options too): each item made from a paragraph lined up with the other, as an item
  beside it, but one made so has no marker in the old text, its line's prefix up to the marker read
  as nothing: both written without their `>`. Only an item that was one is lined up with
  (`created`, `write.ts`). Regression390; `commands.test.ts`.

- [B366] **Enter over a padded item's whole text, a root paragraph after a blank line of spaces,
  failed to write** (`-  «next»⏎  ⏎  para`): the item narrower, `- `, its old blank line `  ` copied
  as it was, and ourus's reader keeps an empty item open over a line of spaces (`-⏎  ⏎  x` is one
  item), so the paragraph read into it, where the seam check read a bare blank line. An empty item
  with nothing under it has its blank lines written bare where the old ones hold spaces (`drafted`,
  `write.ts`; any old lines so, the first try, lost the marks a copy keeps: `marks.test.ts`'s B377
  case). And Enter at `-  next┃` there, the new empty item taking the old blank line of spaces (found
  by the inverse suite on Regression391's buffer, on the last commit too): `created` writes them bare
  too. The diff suite moved 389 results so, Enter and Shift-Tab mostly, checked by script: each the
  same text but a blank line of spaces now bare (`- ⏎ ⏎` → `- ⏎⏎`). Regression391; `commands.test.ts`.
- [B197, B166, B417] **Write now, with these fixes**: loose paragraphs indented in an item headed by
  an empty heading; a padded item's first line cleared, its loose paragraph the root's (P4); Tab over
  a held empty paragraph in an item and the paragraph after it (P4). Out of the tracker,
  `commands.test.ts`.
- [B217's regression] **Duplicate from past the final line break put the caret past the
  copy's text** where the last node held an empty last line (`…   > ◌⏎┃`): the gap's end mapped to the
  original's text end, held tail and all, which the copy doesn't have. As the text zone's branch
  does, the copy's text end without it. 28 kept cases; `commands.test.ts`.
- [B450] **Enter before a numbered item holding an empty quote, at the note's end with no final line
  break** (`2. x┃⏎3. > `): the item renumbered, its line copied with the new marker as text, nothing
  of it mapped; the quote, named where its line's content maps to, the text's end, went unnamed. Past
  the item's new marker, named, there (`headInPrefix`, `write.ts`). Regression392; `commands.test.ts`.

### Typing

- [B245] **Typing before a block id, then Backspace, left two blanks** (`- item ┃^id1`, `x`, Backspace:
  `- item ┃ ^id1`): typing puts a blank after the character so the id stays one. Backspace on a
  character alone between a blank after text and the blank before a block id takes that blank with it
  (`beforeGluedBlockId`, `backspace.ts`), with no mark: a blank the user typed there goes too, two
  blanks never left. The text's last character before the id stays the host's (`- x┃ ^id1`), as
  `block-ids.test.ts` has it. Regression378; `commands.test.ts`.

### Drops and drags

- [B419 to B422] **Drop preflight (`moveRefused`) refused places the move writes**:
  - an item's unclosed fence ends with the item, so a node after it, or the item before a sibling, is
    no line of it (B419; `unholdable`, `moveRefused`);
  - indented code after the list is the moved last item's only where its indentation reaches the
    narrowest content column the item can have there, lined up with the item it goes after or as wide
    as its own marker (B420; `joinsAround`'s `itemColumn`: `100. b` dropped above code at column 4
    writes, a `- b` there is refused still);
  - a `---` closing front matter is looked for only in the moved texts that land at column 0, not an
    item's or a quote's (B421), and not on the moved nodes' own lines among the document's (B422;
    `joinsAround`'s `moved`).
  - Regression380 to Regression383; `commands.test.ts`.
- [B293] **A drag's seams counted an unclosed fence's blank code line as a gap**, so a host drew the
  drop line in the code: `gapLines` counts only blank lines no node holds (`seamsOf`, `drag.ts`); the
  places are still found from where the blank lines start (counting them as gaps there too, the first
  try, offered drops into a quote that the result check refused: `drops.test.ts`).
  `commands.test.ts` (no spec case: a drop map isn't drawn).

### Marks

- **A heading keeps one blank line under it** (the decision above; Gap20, Gap21, `marks.test.ts`):
  `#raise` keeps one where it trims ours (`#keepsOneLine`, but not a gap taken from an empty node,
  Backspace's undo); Enter splitting a heading sets it off (`setOff`); a heading left its section's
  end, something after it, keeps its own line, not the old end's none (`#scopeEnds`), which also
  stopped a paste over the empty paragraph under a heading taking the author's blank line there
  (`# h1⏎⏎◌` + `# h2⏎text` gave `# h1⏎# h2`). The five seed cases fixed. Left as it was: that paste
  drops the line's mark (it reads as the author's).

- [B377] **A raised line kept its mark wherever a command hands its gap on: closed** (2026-11-12,
  `report-checks.test.ts`, one case a mechanism). 58 of seeds 151 to 251's 68 kept cases pass, one
  refused; 5 identical lines and one designed drop (Shift-Enter after an empty item) no bug; 3 rare
  shapes filed as B412 (a callout's held `> ` lines, a text's block-id lines). Mechanisms:
  - a delete joining an empty item, ours the earlier of its lines: its gap moved as written (`moveGap`);
  - a block-id paragraph folded into the node above (`#carry`): its gap's origin recorded;
  - Enter over a selection, a join then a split: `split` passes the join's origin on;
  - a paste beside a block apart from it: the copied lines ours where the end's were; into an empty
    note (`fillDocument`): the note's end the paste's;
  - a subtree's trailing lines written where what follows is, a node indented into a quote:
    `blankAsWas` marks each as its old line was;
  - a heading with nothing under it, leaving a quote: no longer trades its line with its section's new
    end (`#scopeEnds`, equal counts);
  - a paste filling a blank line after its gap moved: `gap(…, 'first')` its own again.
  - The check (`autoLost`) read the empty piece past a final line break as a line, and missed a run a
    change replaced on the far side of the change's text: both fixed, a decision on the oracle (it
    counted right results as lost; it now joins runs it couldn't before).
  - Seeds 51 and 101's kept cases weren't replayed (their reduced cases gone with an earlier session).

- [B237, part] **An empty held item with a padded marker; ourus's own held quote line pasted**
  (2026-11-12, last; `placeholders.test.ts`, the B355 test): `-  ◌` outdented by Enter is written
  `- `, and a node moved into it now starts from the column that gives (`emptiedPadding`), not past
  the old padding; the B355 test's expected `   > - list` (column 3, read the same in container mode)
  is now `  > - list`, a test expectation changed with the fix. A quote with no text or an empty one,
  its children after blank lines (`> ⏎>⏎> - `, a held line copied without its mark), pastes as a
  quote of its children. 4 of the 14 replayable kept cases left.
- **A dry volume run at seed 301** (2026-11-12, nothing kept): 61 failing sessions in 100,000 (599
  and 643 at seeds 51 and 101), 25 groups, the largest Alt-Up's lost mark (11); one session in
  `readback placeholders`, B237's group.

- [B237, part] **Held marks through a rewrite, more** (2026-11-12, later; `placeholders.test.ts`): a
  setext title's held space at its start is Markdown's padding (`#leadingSpaces` takes a heading's
  too, no column kept); a held empty last line moved from the end is held where the writer named it
  (the text's start too), or, the text without a final line break, at its line's end; a text left a
  line break alone holds its empty paragraph on the line it was named on (`⏎◌`). The two setext
  hand-built shapes and 6 of the 14 replayable kept cases pass. B327 fixed with it (Regression376: a
  paste over a setext title's first line, the rest starting with its padding; a tab there too).

- [B237, part] **Held marks through a rewrite** (2026-11-12, after D24):
  - A held space starting a later line (a quote atom's `  > more`, a quote's lazy line) is written
    where it was in its text, after the line's prefix, and still held; the writer dropped it,
    "settled by writing", while the draft kept it (`spellLines`, `write.ts`). Shift-Tab on the item
    holding such a quote atom (Regression371), Alt-Up renumbering an item whose quoted paragraph has
    one (Regression372).
  - An atom's held space on its first line settles as a prose text's does, out with its space
    (`#settleHeldSpaces`): a table on an item's marker line outdented (Regression374).
  - Backspace joining a quote atom's later line takes that line's marks out with its line break: a
    held space mid-line now (Regression370), a held empty line's placeholder (Regression373)
    (`joinLineInQuote`).
  - A note's last node holding an empty last line (Shift-Enter's, the caret on it), moved from the
    note's end or with a node dropped after it: its lines are copied, the empty line with them, but
    the writer kept that line's placeholder only while the node stayed last. Where it moved and wasn't
    written anew, the placeholder goes where its copy ends (`write.ts`, the marks' carry).
    Regression375; the drop pass over it. B354 with it (a quote holding the empty line moved below a
    comment by Alt-Up on the quote).
  - An atom's held space left with nothing after it on its line (Shift-Enter in code right after it)
    settles, out with its space (`#settleHeldSpaces`; `marks.test.ts`).
  - An atom a command set keeps no empty line's placeholder on a line no longer empty (a line break
    joined away: Delete at a quote atom's line end, Enter on its held empty line) (`#placeholders`).
  - A quote atom's later line held by a space, the line before it emptied (Enter, Shift-Enter after
    `quote`): the mark goes with its space, the line the quote's own, as it reads without it
    (`#settleHeldSpaces`; `marks.test.ts`).
  - The SxS on the new cases (2026-11-12, `regressions.md`): Regression373 (Backspace on the held
    empty line) agrees in every app that runs it; Regression375 (Alt-Up with the held line) in the
    outliners, the text editors moving the line alone; Regression374 by whitespace; Regression370
    agrees with SilverBullet, Obsidian (LP, source) and Emacs; Regression369 and 371 differ in the text
    editors, which hold no quote atom (Obsidian Outliner reads the held line's start otherwise).
    Regression359, rewritten: Dynalist, Lexical, WorkFlowy, BlockNote and Emacs agree.
  - 22 of seeds 151 and 201's 32 kept cases pass, the two keyed quote-atom cases and both footnote
    ones, the keyed code case. Left: 10 kept, mostly a held empty line at a text's or the note's end through a move or a
    paste, and five hand-built shapes.

- [seed 251] **Backspace joining an item into the quote atom above dropped its text's marks**: the
  text went in as a string (`joinIntoQuote`), an escape of ours in it the author's from then on. Its
  marks go with it now (`OurusAtom.splice` takes a mark set). `marks.test.ts`.
- [B377, part] **Enter at a list's end, the note ending in blank lines, a raised one before the last**:
  the new item takes the old end's blank lines (B411) and the writer wrote them anew, marking only the
  last. `#scopeEnds` copies them now where a raised one is before the last, each mark where it was,
  as a node's own gap is copied (`marks.test.ts`). 3 of the 46 kept cases. And a node the draft left
  as it was, whose gap the writer writes anew all the same (a duplicate beside it): ours where its
  last line was, as many (`blankLines`, `write.ts`). 1 more.
- [B377, part] **A paste over a selection, a delete then a paste, lost the raised lines between**:
  the delete took a line the paste wrote again. A raised line's line break that the two edits together
  leave as it was (each change cut to what it replaces, the text both ends share left out) keeps its
  mark (`withRaisedLines`, `copy.ts`: `afterDeleting`, its other order, and a paste over selected
  subtrees). 7 more of the kept cases: 20 of 56 pass.
- [B345] **A blank line ourus raised lost its mark where its gap was written anew**: the writer marks
  a gap it writes anew only where `done()` raised it in this edit (`GapOrigin.auto`). The draft sets
  that now too where a node's gap ends in the lines it had in `from`, its own or those of the node it
  came from, at least as many, the last `auto` (`#lastBlankLineOurs`): a gap that grew keeps its old
  lines last, Shift-Enter's new line the user's. Not where the command stated the node's own gap.
  Delete subtree gave the node before the last one going that node's blank lines with `gap()`, which
  records no origin; `inheritGap` now. `marks.test.ts`. 90 of seed 51's 131 pass; of the 41 left,
  about 15 keep the mark on the line that sets the same blocks apart, mapped by the check through a
  diff of identical line breaks (no bug, as recorded), and the rest are gaps `done()`'s scope ends
  hand on by place, the raised line given to no node (open).
- [B377, part] **A blank line ourus raised lost its mark where a paste or a move handed its gap on**:
  a paste over an empty node now records the paste's end as in its place (`gapOrigin`, a new draft
  call: the gap as the command sets it, its origin the node it replaces); a node that stays where it
  was, its gap another's by place (`#scopeEnds`, a move past a section's end), keeps its own lines,
  as many, ours (`#lastBlankLineOurs`). 13 of the 27 cases. Volume, seed 51: 599 failing sessions to
  571; seed 101, fresh: 643 to 606. (A first try, a gap from a node that went, raised seed 51 to 614:
  reverted.) `marks.test.ts`.
- [B377, part] **A blank line ourus raised lost its mark where a command took a line out of the gap
  or put one in before it, or moved it with a list's end**: Backspace or Shift-Enter on a blank line
  above the raised one (`- para one⏎  ┃⏎⏎`), the last line the one it had (`gap(…, lastKept)`,
  `GapOrigin.lastKept`); Enter after a table, a rule or a footnote, leaving a quote or an item on a
  blank line, the new node's blank lines the old one's (`gapOrigin`); Alt-Up on a tight list's last
  item, the blank lines that set the list apart handed to the item now last with where they came from
  (`#raise`). `marks.test.ts`.
- [B397, B353 part] **Shift-Tab on a tab-led item took the blank line ourus raised after it**, what followed
  joining it: `x⏎- a⏎→- b┃⏎⏎d`. The seam check read the item, moved up out of its parent, as it was
  (B303: a tab-led line's dedent counts spaces), `→- b` alone indented code, which `d` doesn't
  continue. Read in the root, with no quote's `>` before it, a tab-led line is read from its start, its
  indentation the spaces it spans (`#lastLines`). B397 was B353's second case filed again (missed in
  triage); that case passes too. `marks.test.ts`.
- [B377, part] **Three more ways a raised line lost its mark** (seed 51's third run).
  - A paste on the author's blank line, or on a held line, above a raised one. The pasted block
    takes the owner's last lines with their origin (`paste.ts`; `setSpacing` returns the node).
  - A raised line before the gap's last, the author's line after it, on a node written anew (a
    paragraph indented into an item). The draft records only whether the last line is ours. Where
    the node keeps its own gap, as many lines, its lines are copied, each mark with them.
  - A paragraph after a tight list indented into it. The list's blank line goes and the item's own
    stays, its origin its own (`#raise`).
  - `marks.test.ts`. 10 cases filed under B377, kept. 14 no bug: unclosed blocks' lines, identical
    blocks swapped, a paste of what is beside it, an unquoted quote's own blank line.
- [B353] **A blank line ourus raised went where Markdown still needed it**, two ways.
  - The seam check's `#lastLines` gave a quote with no text of its own its first child's line, then
    the next line it pushed, an empty item's `- `, with no blank `>` between them. The two read as a
    setext heading, so the paragraph after the quote looked apart from it, and ourus's line went.
    The quote's first child's blank line is pushed now. Its rule for the block before the last
    child (B386's) skips a block moved there, whose line where it was is no line of the container.
  - Shift-Tab on a quote's held last line: the held empty paragraph after the quote, an empty line,
    looked apart without the raised line, but right after a block an empty line is a blank line, not
    a paragraph. The line stays.
  - `marks.test.ts`.
- **The marks check joins the author's blank runs that land in a run a mark is in** (a move bringing
  them beside ours, which a run grown fewer drops first). 2 more of B377's filed cases pass; the
  others' author lines are deleted by the change, which the check can't map.
- [B411] **Enter at the end of a note's last item, the note ending in a blank line, doubled it and
  loosened the list** (`- item┃⏎⏎` → `- item⏎⏎- ⏎⏎`; found reading seed 151's marks cases, on the
  last commit too). The split gave the item's blank lines to the new one, and the document-end rule
  (`#scopeEnds`) gave the old end the newcomer's gap back, the same lines. A newcomer the command
  made with the old end's own lines has none from elsewhere to give: the old end keeps what the
  command left it. Regression368, `marks.test.ts`. The diff suite: about 2,000 Enter and Shift-Enter
  results move, blank lines no longer doubled at a note's end (a plain paste's lines, as Enters,
  tight now); the inverse suite gains about 230 round trips. The SxS: 22 of 23 apps agree on
  Regression368 (Emacs the one that differs).
- [B377, part] **Two more ways a raised line lost its mark** (seeds 151 and 201):
  - Delete or cut of a container's last node, the node before it with a gap as large as the gone
    one's: it kept its own, the author's line inside the quote, and the raised line after the quote
    lost its mark. With a gap as large it takes the gone node's lines now, as with a larger one
    (`delete-subtree.ts`; DeleteSubtree13's text the same).
  - A paste or Enter filling a blank line, the lines above it kept: they were stated with no origin.
    They keep where they came from now (`gap(…, 'first')`, `GapOrigin.firstKept`).
  - `marks.test.ts`. Of the 56 marks cases left under B377 from the two seeds, 10 pass with these and
    B411; the check test that showed a paste losing the mark is shown the mark dropped by hand now
    (`report-checks.test.ts`).
- [B183] **A section's last node moved down to the document's end and back lost the blank line above
  it** (`## B⏎⏎para⏎⏎## C⏎⏎- item`, Alt-Down, Alt-Up: `para⏎- item`). The section-end rule
  (`#scopeEnds`) gave the old end the gap the new end had where it was. For a node that ended the
  document, that gap is the document's end: none between blocks, or the blank lines trailing it.
  - Now the old end takes the gap before what moved, where it was: `## C`'s here, `# B`'s in
    MoveUp26 (`# B⏎## s⏎- y`, the section moved up, kept tight).
  - Only for a moved node. Where nothing moved, a quote unwrapped around a heading, the old end stays
    as it was.
  - The diff suite moved 116 results, all moves, none failing. Of the seams that were in the
    original, 38 of 38 keep its spacing. The other 78 are new seams, which used to take the blank
    lines trailing at the document's end (`- i 1. x⏎⏎⏎> - q6`) and now take the gap before the
    moved block.
  - Regression318.

- [B372] **Shift-Tab on the item above an empty held item dropped its placeholder** (`p⏎- [x]
  do┃ne⏎- ◌`): the task, a paragraph now, splits the list, and the empty item, written anew, lost
  its hold, the draft keeping an empty item's placeholder only where Markdown needs one. A hold the
  item had, away from the caret, stays (`#placeholders`, `draft.ts`); the one at the caret still goes
  (Enter28, Placeholder5, TO12: an empty item reads as one without it), and settling passes the item's
  text without it (`settle.ts`). `marks.test.ts` (no spec case: the player settles what the caret
  leaves).
- [B412] **Enter at a text's end lost the mark of a blank line of ours before its block-id line**
  (`x⏎⏎̬^blk`, Obsidian): the text written anew, its carried lines spelled from their record. Where
  they are as they were, a blank line's mark is carried with it (`spellLines`, `write.ts`).
  `marks.test.ts`.

- [B401] **Deleting an empty item's first child, a paragraph after a blank line first then, failed
  to write** (`-⏎  ⏎  - ```js⏎  let x;`, the nested item's line deleted): an item that starts with a
  blank line reads what follows as its text, blank lines and all. An empty item whose children follow
  a blank line is held by a placeholder where a command sets its text (`- ◌⏎⏎  para`); one the command
  didn't set is held now too (`#placeholders`, `draft.ts`). A first try refused the shape, which the
  diff suite showed refusing a dozen cuts and deletes the hold writes (`- «item⏎  - a»⏎⏎  para`):
  reverted. Regression388; `commands.test.ts`.
- **A held padded empty line moved with its item, past a padded empty item** (`-  ⏎- next⏎  ◌`,
  Alt-Up): the placeholder stayed on the empty item's `  ⏎`, the moved line read as a blank one, a gap.
  The writer carried a mark with no change near it by the changes, a diff of like lines that took the
  moved `  ⏎` for the one that stayed. Where the writer copied the mark's text, the copy's piece says
  where it went (`carry`, `write.ts`). 3 cases and B471 (identical held empty quote items). Regression397;
  `commands.test.ts`.
- **A held empty item at the note's end, no final line break, the caret on it, moved up**: the draft
  drops its placeholder (one at the caret reads as one, Enter28), but the writer's carry for the
  text's end put it where the item's line went. Not for an empty item the draft holds no more
  (`unheld`, `write.ts`). 3 cases and B455 (a padded quote's held item, Alt-Up). `commands.test.ts`.
- [B444, B418, in part] **A gap left with only its bare blank lines keeps its last ours**: where the
  quote's own `>` lines of a gap go (the quote's last child cut, Enter in its lines), the bare blank
  lines left are the ones that were after the quote, the last ours still (`#lastBlankLineOurs`,
  `draft.ts`). Both bugs' old cases and 4 of their 10 kept cases of seeds 851 to 1001 keep the mark; the
  rest stay open. `commands.test.ts`.
- **A held empty task moved last in a note with no final line break** (Alt-Up): its placeholder was
  carried to the task's new line where the draft holds it no more; an empty task is unheld too, its
  checkbox no text (`unheld`, `write.ts`). `commands.test.ts`.

### Copy, cut and paste

- [B346] **A block cut right under code and pasted back went into the code**: the cut's caret was at
  the end of the text above (delete subtree's rule 2), the code's last line, where a paste is code
  (Paste14), `code# h`. Now, right under code, math or a comment, the caret stays where the first
  node went, on an empty node of its kind held there (an item for an item): the paste puts it back,
  what is typed is a paragraph, and leaving it settles it with the blank line above it
  (`delete-subtree.ts`). As the Obsidian editors and SilverBullet leave the line a cut took.
  DeleteSubtree15, DeleteSubtree16, Cut5; `commands.test.ts`. At a caret only: a selection of whole
  nodes deleted (Backspace, Delete, a paste over it) keeps the old rule, the caret at the code's end
  still (the diff suite showed it leaving a held node and blank lines there too, first).
- [B387] **In Obsidian, a paste ending in `---` after the `---` a note opens with made front
  matter**: the rule that sets off a `---` coming first (DeleteSubtree9) counted another one the draft
  writes below only where it came from the old text; a pasted one too now (`#frontmatter`). Regression305;
  `commands.test.ts`.

- [B193, regression] **`#setApart`'s lift wrote `moved-indent` failures where the old code refused**:
  the writer's shift lifts every line of the block's subtree as far as its first, so a block with a
  line padded less (`   > a⏎> b`), or owning a list at the root's column (`quote⏎   > more⏎2. num`,
  Tab), can't be lifted: refused, as before (its own lines and its subtree's, `endLine`). 22 of the
  25 kept `moved-indent` cases pass; one is the old refusal, two failed before the round (B396).
- [B380] **A quote ending in an empty quoted line, pasted into an empty note, failed to write.** The
  section-end rule (`#scopeEnds`) took the empty note's root for the old end, the node before the
  paste, and gave it the paste's blank lines. The root is no such node now. Regression321.
- **Obsidian: a paste into an empty note that starts and ends with a `---` rule** read as front
  matter (write-failed; seed 101). A rule the draft makes first, with another below it, gets a blank
  line before it, as one moved first does (DeleteSubtree9). Regression322.
- **Paste, cut and paste back on `-  parent⏎  - chil`**: a single item pasted after the item it lines
  up with lines up with the next item instead, where the first would take that one in. The view
  and inverse suites found it on Regression329's buffer.
- [B400, part] **A pasted task, its text below its checkbox, padded** (`-  [ ]⏎   task`): its later line
  at the column the separator before the box gives, not the marker's and one. Regression337. Left:
  tab-led plain-text pastes into a quote, a paste over an escaped marker.
- [B21] **After cutting the paragraph above indented code, Paste was refused**: the caret left at the
  code's text start, past its indentation, took the paste as code lines, and a paragraph would end
  the code. Blocks pasted there go beside the code now, as at any text's start (`pasteAtTextStart`,
  `after` by default: after the code). A single line pasted there is still code text. The default is
  to become `before` (Decisions), the cut paragraph back above the code then. Regression346. The diff suite moved 2 pastes of blocks at a code's start, written
  after the code now, not spliced into its first line.
- [B301] **A paragraph given a heading's text**, an item's `# title` pasted over a paragraph: written
  `# title`, a heading on reading. It is a heading now (`#transitions`, as a heading whose text is a
  paragraph's is a paragraph). `commands.test.ts`, Regression348. Some drops that failed to write
  are refused now (`would-reparent`, `not-expressible`), the heading's section taking what follows.

- [B21] **`pasteAtTextStart: before` is the default** (decided and done 2026-11-11). Blocks
  pasted at a text's start go before its block, so a block cut and pasted back at the caret the cut
  leaves goes back where it was. The drivers of the apps that paste after declare `after` (Logseq,
  Logseq DB through it, Tine, Tana, Athens, Mubu, Notion); Roam, SiYuan and WorkFlowy declared `before`
  already.
  - Spec moved with it: PasteList3 shows `before` now, PasteList28 (new) `after`; PasteList20,
    Paste20 and Regression231 drop the option; Regression305 and B387's test take `after`;
    Regression346 pastes the paragraph back above the indented code; a block-ids test pastes at the
    text's end.
  - The full SxS run (all apps, after the drivers changed): the `after` apps agree on PasteList28
    (Notion on the caret only); Roam, Logseq, Tine, Tana, Athens agree on PasteList3 under their own
    values; the text editors paste text, not blocks, there.
- **A paste at a fence's start**, before its opening delimiter, was the host's ("the fence would
  break"): before the fence now (`after`: after it, as after indented code). An item whose text is a
  fence the same. Regression352, Regression353; `commands.test.ts`.
- **A paste at a heading's start was the host's** (not done): with `before` the default, the diff
  suite moved about 1,000 pastes from written to the host's. The nodes go before the heading now, the
  last of the section above; a pasted heading takes the heading after it into its section where its
  level is higher (`done()` regroups). Regression360. The diff suite now: 487 of those pastes the
  host had are written.
- **A quote read as an atom** (`quotes: atom`), items pasted at its start past its `>`: before it.
  Regression361.
- **Blocks of lines or quotes before a list's first item are items of it**, as paragraphs are there
  (decided with the user 2026-11-12, below): a fence cut right above a list and pasted back is an
  item, `- ```js`. A rule taking them before the list was tried and reverted. Regression359.
- **Items pasted at the start of the block on the marker line of an item with no text** (`1. > [!note]
  ┃T`) go before the item.
- **Where `before` can't be written (refused, not done, or the host's), the paste goes after**, as
  `after` puts it (flagged below): 22 pastes the last commit wrote, refused with `before`, write again.
- **A heading pasted before a quote's paragraph on an item's marker line**: the paragraph, its line
  the marker's, under the new heading's section, was copied as it was, `- > a` a second item. A node on
  a marker line under a new parent is written as one moved (`regrouped`, `write.ts`). The diff suite's
  two regressions of the default change.
- [B400, B300] **A plain paste into a quote of lines with a blank line, the line after it led by a
  tab**: the tab kept in the second quote's text, read as padding. That line, a paragraph's first,
  loses its leading blanks, as at the root (rule 5). Regression356. B300 was the same.
- [B400] **A paste over the `-` after an escape of ours (`\̬-`)**: the deletion dropped the escape,
  no longer needed, and kept the space after it, which the text then started with, read as padding:
  `write-failed`. The blanks after an escape of ours at a line's start go with it now
  (`#dropOurEscapes`). And a paste over a selection in one text, which pastes at its end and then
  deletes it, no longer falls back to deleting first where the paste only took out escapes of ours
  before it (`thenDeleting`): `y┃ x`, the space kept, as every app in the SxS keeps it (a first try,
  the deletion first, gave `y┃x`, which all of them disagreed with). Regression357.
- [B361] **A callout pasted right before a quote merged with it**: the seam check read a quote the
  draft made with no children, a callout's title alone, as its title without its `>`, so the quote
  after it looked apart. Its lines are read after a `>` (`#lastLines`). `commands.test.ts`.
- **A paragraph cut from under a heading with nothing else under it, pasted back at the heading's
  end, came back with no blank line after the heading** (`## B⏎b text`; on the last commit too): the
  paste took the heading's blank lines as a split's and left it none. First under a heading, the
  heading keeps them and the paste's end takes as many. Regression364. The inverse suite gains about
  150 more round trips.
- [B406] **A node cut by id right under code, math or a comment left the caret in it**: the caret
  rule of B346 held at a caret only, so a subtree selection cut there (or `copySelection: nodes`) and
  pasted back went into the code's last line (`codepara`). A cut of whole nodes holds an empty node
  where the first was, as a cut at a caret does; Backspace and Delete over a selection keep the old
  rule. Regression366. The sweep's cut→paste failures: 49 → 7 (none of the 7 a bug). The SxS:
  after the paste Obsidian (×4), Logseq and Lexical end where ourus does, the paragraph back after
  the code (Obsidian's caret on the line after it); Dynalist and WorkFlowy paste into the code,
  B346's option A, decided against.

- [B347] **Copying a padded paragraph whole took its padding off the list it owns too**
  (`  > body⏎⏎- > a⏎  b`: `b` copied at column 0, out of the item): the first line's indentation came
  off every later line. Only until a line starts further left than it, a block of the copy's outside
  the first's (`markdownOf`, `copy.ts`). Copy40; `commands.test.ts`.

- [B26] **Plain text indented as code, pasted into an empty note, became prose** (`    code1⏎
  code2` → `code1⏎code2`, a paragraph; a paste on a blank line of a note that isn't empty, the host's,
  kept it). Decided 2026-11-13 (the user's): an option, `pasteIndentedCode`: `code` (the default, the
  text editors': the indentation kept, indented code), `dedent` (WorkFlowy, Tana, Roam, BlockNote: as
  before). Lines that read as a list without the indentation (`    - child`, from deeper in a list)
  paste as the list either way (`pasteAt`, `paste.ts`). Paste28, 28b, 28c; `commands.test.ts`.
- **A text copy pasted where the caret's text is blanks alone on a side** (`  - x# ` and a copy ending
  at a block boundary, `text]`): the blanks were made a node of their own, which reads as none; they
  join the paste now (`openSeams`, `paste.ts`). `commands.test.ts`.
- **Plain lines pasted on a blank line go into the text**, the host's, not through the seams (a `text]`
  copy there lost the raised line's mark); and a copy marked `[text` pasted at a text's end keeps both
  seams apart, the nodes after the text as a paste of nodes puts them.

### Backspace

- [B204] **Backspace right after a space at a later line's start joined the lines** (`- a⏎   ┃b` gave
  `- a ┃b`): only past the line's leading spaces was Backspace the host's. Among them, past the
  first, the space before the caret goes now; at the line's start the lines join, as Shift-Enter's
  break taken back (ShiftEnter21). A type-then-Backspace round trip met it in 1,604 of about 14,000
  runs. The diff suite: where the shorter run of spaces would start an item (`p1⏎   - g2`), an
  escape of ours keeps the line text. Regression362.
- [B202] **Backspace at the start of a rule or a table after a block was the host's**, whose join
  made a rule the paragraph's setext underline (`p⏎---`, a heading). Refused, as Delete refuses to
  take one in (`can't join the rule into the text above`); first in a container, as before.
  Regression363. The SxS disagrees (an open question below): the text editors take the blank line
  (`p⏎┃---`, the heading), the block apps join the rule's dashes as text (`p┃---`); only
  true-outliner refuses.
- [B216] **Expand selection from inside a block id selected text that left the caret out**: the
  command was moved to the text's end, as an edit there is, and the selection made from there didn't
  hold the caret. Expand selection acts where the caret is now. `commands.test.ts`.
- [B246] **Backspace after a backtick typed on a text's last line, `autoClose` listing it, left
  residue** (`` a⏎`┃ `` gave `a⏎⏎`; after an item, two spaces): at the text's end the character after the
  caret, none, compared equal to a backtick's closer, none, so the backtick was taken for an empty
  pair and the line's text written anew. A closer is looked for only before the text's end; the
  host's Backspace takes the backtick.

### Quotes

- [B350, part] **A quote's first paragraph cut after an item, the quote one column in, read into the
  item**: `- a⏎ > x⏎  > - b`, the writer copied the quote's next line as it was, two columns in, the
  item's now. The quote being the block edited, a read child first in it now, which wasn't, is
  written at the quote's column where its front padding was another than the quote's first line's
  (`reseated`, `write.ts`): `- a⏎ > - b`. Only where its line is padded further before the quote's
  `>` than the quote's first line: re-spelling any line whose prefix differed, the first try, broke
  a quote sharing an item's marker line and an outdent splitting a quote (9 regressions in the diff
  suite). A quote not edited keeps its lines as written.
  DeleteSubtree17; `commands.test.ts`. 5 of seed 51's 16 pass.
- [B350, part] **The seam check read a blank quoted line in an item as `>`**, at column 0, which ends
  the item: a quote below, the item's lines as written, looked set apart (`#lastLines`, `draft.ts`).
  It reads the quote's prefix as its lines have it now (`  >`): 2 of seed 51's B350 cases, a block
  the edit didn't touch read into the item, are refused (`would join the item above it`), as the
  plain shape is (Regression295). The 9 left are items: an item two columns in after one Enter made, or one written
  narrower, Enter's and padded markers' (B355's, B208's), not B350's.
- [B365] **Enter at a heading's start after a quoted item wrote two blank lines**: fixed by the same
  `#lastLines` reading, the held empty paragraph set off from both (`x⏎⏎◌⏎⏎#`). Regression294;
  `commands.test.ts`.
- [B193, B328, B352] **A bare marker (`-`, `2.`) given text took in the blocks after it**: a
  paste, Backspace or Delete joining text into it, the indented block below read into it. The seam
  check read a moved or rewritten empty item's line as the marker with its text right after it
  (`-￼`), which is no item, so it saw them apart; it reads past a space, as the writer writes it
  (`#ownLines`, `draft.ts`). Found by the move sweep on Regression295's buffer.
- [B193, B328, B352, B54] **A block the edit didn't touch, which would join the item above it even
  with a blank line between, is kept a block of its own**, as the outliners keep it (decided), where
  the draft refused it (`#setApart`, `draft.ts`): a paragraph or an atom written anew at its
  container's column, its padding gone (`- a⏎⏎  b` from a paste on `-`: `a` at the root), a quote or
  an item lifted by the writer's shift (`draft.lifts`, a shift's `own` front spaces), an item of the
  list above lined up as its next item (`- p⏎⏎- b`), indented code fenced (B328, decided: no blank
  line keeps indented code out of an item), a blank line raised where one sets them apart. Not a
  block regrouped elsewhere, one inside an item, a text whose spaces are its own, or one with lazy
  lines or a paragraph line that would start a block where the shift puts it (its own, and those of
  every item after it, of any list, which the writer lines up with it; an item moved there from
  above counts too): those are refused, as before (7 regressions in the diff suite, first). B54 [P2] with it: a paragraph moved above
  a loose numbered list, the item after it lined up at the root. Delete subtree's caret skips an
  empty item's bare `-`, whose end is its markup. Regression291 (the next item lined up, GFM now),
  Regression292 (refused `outside-zoom` now: the line it would lift is outside the zoom), Regression295
  (the quote lifted), Regression296 to Regression299; `commands.test.ts`.
- Moved by these, judged: an outdent of a quote's first heading and a drop of an item's quote
  paragraph at the root write now (they failed); a quote dropped after an item's quote is written
  with no blank line before it, `  > p⏎> # q`, two quotes still (the blank line was raised only for
  the misread `>`). The outdent leaves a blank line too many at the note's end (open).
- [B53, B360, B351] **A quote's first block on an item's marker line, moved down past the quote's
  heading, was written as a second item**: `- > a⏎  > # b`, Alt-Down, `a` going into the heading's
  section; its line, the marker's, copied as it was, `- > a`. A node on an item's marker line under
  another parent now is written as one moved is (`regrouped`, `shiftFor`): `- > # b⏎  > a`. B53 [P2]
  is the plain shape; B360 a callout's paragraph, B351 an empty held one, and seed 51's past an empty
  item that is a setext underline (filed as B384, its mechanism this one). Regression307; `commands.test.ts`.
- [B56, B289, B349, B341] **A quote written `>-`, no space after its `>`, couldn't have its items
  moved, duplicated or split**: the shift writes `> `, a column wider than the line's `>`. A root block
  with a quote whose items follow its `>` with no space, an item placed or made in that quote, is
  written anew in normal form, `> -`, as B348's block is (decided, 2026-11-11). Not where items only
  leave the quote, nor a quote with lazy lines or a continuation that could start a block, which a
  rewrite can't keep: the first try, any change in such a block, refused 15 edits that wrote (an
  outdent out of the quote, a task's duplicate), and its passing B355, B94 and B95 cases were that
  breadth; and a quote with no text of its own written anew was given a null text, its first line read
  empty by the seam check, three edits refused (`=⏎>-⏎>`), fixed. Side effects, lines not edited normalized: B56's quote loses its empty first `>` line,
  B341's trailing `>` lines are written blank. Quote3, Quote86, Quote95 and B57's test write `> -`
  now (decisions). Regression310; `commands.test.ts`.
- [B349, part] **A quoted paragraph with no space after its `>` couldn't be moved onto an item's
  marker line**: `- > a⏎  >⏎  >x┃ t`, Alt-Up; written `- > x t`, the moved paragraph's `>` spelled with
  a space (`overSpelled`). Regression303; `commands.test.ts`. Left open: a quote's items with none
  moved, `>- b⏎>- c`, the shift's `> ` a column wider than the line's `>`.

- [B392] **A tab-led child moved down onto an item whose first block is a callout failed to read
  back**: `- a⏎→- b┃⏎- > [!note] c`, Alt-Down; the text right, `b`'s id named at the wrong place
  (`headStart`'s `>`/tab respelling applied to the old position `oldHeadStart` asks for, a new
  position only by chance). Regression311. Five kept cases.
- [B393] **Backspace at the start of an item's quote whose next line is `>-` or `>#` failed to
  write**: B349 under a shift (the quote's lines lined up by it); a marker written over the line's
  `>x` spells the shift's lead for it (`overSpelled`), and `respelledFor` checks the blank columns
  as spelled. Regression312. Three kept cases.
- [B394] **A quote indented a column past its item's narrower content read back with a new id**:
  `2.  > ┃q⏎⏎    > r`, Backspace; the parser's quote piece takes the spaces before its `>`, the
  writer named it at the `>`: the outline takes an identity at either (`headStartOffset`).
  Regression313.
- [B395] **A padded block lifted out of the item a paste made read back with a new id**: `x┃⏎  ## N`,
  a list pasted; the heading's old head, its line's content start, is in the padding the lift takes,
  which maps to before its line: named where its first character went (`newPosition`). Regression314.

- [B396] **A quote padded further before its first line's `>` than a later one's failed to write
  where the command changed it**: `   > mor⏎> - ┃e`, Enter; `- > x⏎⏎   >⏎  > ted in item`, Alt-Down
  (`moved-indent`: the shift lines each line up with the first). The root block holding it, changed,
  is written anew in normal form (`#anewSubtrees`' `uneven`), as the `>-` quotes are. Regression315;
  `commands.test.ts`. Moved by it in the diff suite, judged: 27 outcomes on that buffer (and one on
  ` >a⏎>b`), each the same structure with the quote's `>`s at its column now, or the same text by
  other changes.
- [B355, B356, B364, part] Write now, each its first case, by this round's fixes: Enter on an empty
  padded child before its parent's quote (the quote the new item's, as the draft has it), Shift-Tab
  under `indentUnit: tab` on a nested quote with spaces after the outer `>`, Backspace joining a lazy
  item before a tab-led quote line. Moved to `commands.test.ts`; B364 out, B355's and B356's second
  cases left.
- [B355] **Enter on an empty item right after an unspaced quote's `>` (`- >-  ◌`)**: the paragraph
  it leaves named past a space the quote's line doesn't have (`- >`). Named past the markers as
  written (`created`). Regression334. B362 passes with it: Regression335.
- [B379, B370] **A quote atom's lazy inner line, the item re-indented**: `copyLine`'s rule for a lazy
  line under a container its node leaves took a line with the node's own prefix, lazy only for the
  quote's inner item, and wrote it at column 0. Such a line is shifted as its other lines are now.
  5 of seed 101's 6 quote-atom cases pass; the sixth is refiled under B404. Regression338.
- [B391, B356 part] **A quote named past the space after its `>`**: the writer named a quote (or a
  paragraph whose text is one) where a shift's respelled prefix ended, the space after the `>` or a
  tab before it, and the readback found another node. After writing, each such node is named at its
  `>` (`quotesAtMarkers`), as the reader names it; items whose text is a quote stay at their marker.
  Regression340. B356's case left: an empty nested quote line outdented, written `\>`.
- [B37] **A copied node's descendants lost their ids** where a sibling above it went (cutting a quote's
  first paragraph, `> > > q` first now) or a block moved in right before it: they were named only
  where a shift or a reorder was, else left to the reader to find by structure, which failed for
  nested quotes. Named in both cases now. Regression341.
- [B55] **Shift-Enter over a selection from a callout title's end** went through `breakAcross`,
  which skipped the title check: refused as at a caret, a callout title being one line. Regression342.
- [B69, B70] **A quote's tab after its `>`, its rest the text's padding**: written before the text
  when the quote became the paragraph's own text (`> a`), or when the paragraph was shifted out of
  the quote, where an empty item above took it in. Those columns are the quote's: none now.
  Regression343; `commands.test.ts`.
- [B309] **A footnote with a blank line in it indented into a quote**: the quote's blank `>` ends the
  definition, so it can't be written there. Refused. Regression351.

- [B356] **An empty nested quote line held in a callout, outdented under `indentUnit: tab`**: the
  paragraph it becomes, `→\>`, was named past its escape (the shift's prefix counted in columns, the
  tab one character). The writer names a spelled paragraph no further than its text's start, on its
  line, and the reader takes a paragraph's name at its line's content or past the blanks it starts
  with, a tab its container's column falls in (`headStartOffset`). Regression354. B180 (a duplicated
  quote ending in a nested empty quote) passes with it.
- [B385] **A padded quoted paragraph moved onto a tab-led item's marker line**: the marker, `→- > `,
  couldn't be written over the prefix respelled `→  >→ `, though both span the same columns. A tab in
  both is compared by the columns (`writeOver`, `respelledFor`). Moved back down, the marker's line
  was respelled in spaces with the item named where its tab was: written as it is now. Regression355.
- **A quote moved onto an empty item's marker line** kept the spaces before its `>` it had in its old
  container, the item's padding there (found by the move sweep on Regression354's buffer). Written
  without them. `commands.test.ts`.
- [B363] **An empty item holding a quote, joined into a numbered item's quote under `indentUnit:
  tab`** (`2. > quote⏎- ┃⏎   > more`): the quote, written `→> more`, was named on its text past the
  space after its `>`, where the reader names a quoted paragraph at the `>`. Moved there too
  (`quotesAtMarkers`). `commands.test.ts`.
- [B279] **A soft-line deletion that made a callout's title, a nested quote below, failed to write**
  (`>([!e]⏎>>`, Obsidian, Cmd-Backspace after `(`): on one line it is refused, the check on a
  paragraph whose text is a quote; with the nested quote the paragraph is a quote's first child, which
  the check didn't cover. A paragraph first in a quote with no title, made to start `[!type]`, is
  refused the same.
- **A table right under an item's lazy last line, its blank line not raised** (seed 151: a cut, a
  move, an outdent leaving `   x` last in `2. > quote`'s item, a table after the item): the seam check
  read the item's later lines past the `>` on its marker line, `   x` as `x`, apart from the table,
  which reads as its lazy lines. An item's content prefix ends at its marker and padding
  (`#lastLines`). Regression365.
- [B408] **Shift-Tab on the first item of a padded quote** (`  > - sibling⏎  > - list in quote`):
  the item, out before the quote, was written at the line's start, and the quote, written after it,
  was named again where its old head, the padding, mapped: at the item's line, over its name. A node
  written anew isn't named over another node's name (`moved`). `commands.test.ts`. B182 (a paragraph
  with a list-like lazy line dropped into a quote after a leading blank line) passes with it.
- [B410, part] **A block written anew in normal form (B348's rule) read into by what follows it**
  (seed 201: `" -  - "` padded, tab-led children, `2.  3. > quote` under `indentUnit: tab`): its
  content column narrows to its marker's and a space, and a block after it at the old column, an
  item of its list, a root fence, reads into it. The seam check read the block by its old lines; it
  reads it as the writer writes it now, as a new one (`#lastLines`, `#ownLines`), and the items of its
  list after it are written anew with it (`#anewSubtrees`). 6 of the 8 cases write (one refused as
  not expressible); left, B410's first case (moved-indent) and a duplicate. Regression367.

- [B297] **Tab on the paragraph owning a list whose item holds a quote atom with a lazy line**
  failed to write: the lazy line was copied as it was, so its front spaces, the atom's text (a
  paragraph's aren't), were taken by the new outer item. Shifted with the item now, still lazy
  (`copyLine`, `write.ts`). P2 since D24. Regression369.

### Seams

- [B308] **Taking an item's heading marks off before its paragraph with a lazy `-|` line failed to
  write in GFM and Obsidian** (`- # ┃h⏎  x⏎-|`, Cmd-Backspace): the seam check read the paragraph's
  first lines in the item, `x⏎-|`, a table there, apart from `h`; but the lazy line continues the
  paragraph wherever it is written. A paragraph's lazy second line that would be a delimiter row is
  read as plain text there now (`#firstLines`, `draft.ts`): a blank line raised, as CommonMark
  already wrote it. Any lazy line so, the first try, moved Regression166 (a lazy `=`, a setext
  underline in the container, which a copy escapes). Regression389; `commands.test.ts`.
- [B483, B484, B190, B416, B452] **Tab on a paragraph owning a list, a block after it that the new item
  takes in, failed to write** (` num⏎2. > quote⏎   > more`, `\`⏎ - > q⏎  > o`): two drifts of the
  seam check from the writer (`#lastLines`). A node written as new, an item made of a paragraph, read
  after the moved prefix with the old lines' dedent, the paragraph's padding, taken off its new lines;
  and an item the draft made, deeper than a prefix set above it, its children read at their old column,
  not its content column. Read as written now, each case's seam check sees the block after it join the
  new item, even with a blank line: refused (`the paragraph would join the paragraph above it`), not
  failed. Writing them would take `#setApart` lifting a quote or a heading out, which it doesn't: 7
  cases, 5 bugs closed as refusals. `commands.test.ts`.
- [B414] **An item the writer lines up further left left the block after it inside it**
  (`- p⏎  - c⏎  - ◌⏎⏎    - g⏎⏎    s`, the empty item deleted): `g` lined up with `c` at column 2, its
  content at 4, `s` still at 4, read as `g`'s. The blocks after such an item, up to the next item,
  whose column reaches its new content column are lifted with it, their own padding what the lift
  takes, as far as their container lets them (`liftAfter`, `write.ts`); for an item moved or placed
  with its siblings (a parent outdented to a paragraph, a Drag back), those out of the same container
  with it. Not a quote, nor a text that is one (its lines carry their own `>`), nor padding with a tab
  (the lift takes spaces). The lifted block named past the spaces taken (`oldHeadStart`), and marks the
  writer copied mapped by binary search (a walk of every piece was quadratic: `marks.test.ts`'s timing).
  B465, B475, B454 and B466's spaced case pass with it; B466's tab-led case and B403 (a callout after
  the item, a quote) are open still. Regression398 (`tabs.test.ts` lists its tab-led form as known);
  `commands.test.ts`.
- **A tab-led item whose text is a quote, Shift-Tab, a paragraph after it past a blank line of ours**
  (`P⏎- sibling⏎→- > T⏎⏎Q`): the line went, `Q` read as the quote's lazy line. The seam check reads a
  subtree moved up out of a tab-led line from the line's start, but not where the line's lead had a
  `>`, meant for a quote around it; this `>` was the item's own, after the tab (`#lastLines`). Only a
  `>` before the tab counts now. B447 passes with it. `commands.test.ts`.
- **A quote padded unevenly, its first paragraph unwrapped by Backspace, the quote below merged into
  it** (` > a⏎  > - b⏎⏎> c`): the quote written anew in normal form (B449), the seam check read its last
  line without the `>` the normal form gives it, so a blank line of ours went. A node written anew
  reads after its container's prefix, as a made one does (`#lastLines`). B462 and B469 pass with it.
  `commands.test.ts`.
- **A padded item emptied (`-  g`, Cmd-Backspace), a quote at column 2 after it**: the writer narrows
  it to `- `, the seam check read its old padding, so the quote read into it. `#ownLines` reads an
  emptied item past its marker and a space, as a filled one: refused now, `the quote would join the
  paragraph above it` (writing a blank line would be better; the shape is P4's).
- [B460] **Backspace on the blank line between an empty item and an indented unclosed fence after it
  failed to write** (`- ⏎⏎┃  ```⏎- next`): the fence the root's, nothing closing it; without the
  line it reads as the item's text. The seams the draft checks were those around nodes it changed or
  set the text of; a node whose gap alone changed was none. Its seam is checked now (`#gaps`,
  `draft.ts`): the line raised again, the Backspace leaving the note as it was. A refusal would say
  more, but the draft can't tell a gap the command deleted from one a move handed on (a first try
  refused MoveDown26, MoveUp23, Regression191). B280 (P4: Enter staying at `-` under a reference
  definition, the line after the blank one an item) writes with it, `[a]:f⏎⏎\-`. `commands.test.ts`.
- [B415] **A callout pasted after another, a blank line of ours between, merged into it**
  (`> [!note] Title⏎⏎̬> [!note] Title`, a callout pasted at the second's title start): the seam check
  read the new callout's title without its `>` on its lower side, as B361 had on the upper,
  `#firstLines`; the blank line of ours went. Read after a `>` now. B415 (a callout pasted over a
  nested callout's body) passes with it. `commands.test.ts`.
- [B503, B467, B493] **One model of the lines, first steps** (`#lastLines`, `draft.ts`): the seam check reads two kinds of item's lines as the writer writes them, not as
  they were. An item written anew with no text of its own, its first child on its line (`-  - x`): its
  marker as the writer writes it (`- `), where the check took the old line, so a block after it short of
  the old content column, which the writer's narrower one takes in, is lifted out (Enter on `-  - child
  two`, ` - - item⏎  ```js`). And an item given a text over the block that was on its line (`2.  >
  quote`, Backspace): that block on a line of its own after the text, at the item's content column, as
  the writer writes it, where the check had it still on the item's line. Measured on the 70 kept
  sessions of the open bugs that replay: 39 write at the last commit, 46 now (B503's seven); the full
  run moved no outcome. Then a third: an item whose first block was on its line and isn't now, a
  quote's held empty first paragraph taken out (`2.  > ◌`, Shift-Tab): its marker alone on its line,
  as the writer writes it, and the quote's old first line none of its own (`#startsAt`). B467 and B503
  closed, 47 of the 70 kept sessions write. And a fourth: a block regrouped under an item that itself
  moved (Shift-Tab, the paragraph after it taken in as its child) read at that item's content column,
  where the check had it at the old container's (B493, the raised line before a table it dropped).
  `commands.test.ts`.
- [B505, B513] **A block after a list-owning block lifted with its last item** (`liftAfter`,
  `write.ts`): an item the writer lines up further left with its list (`realign`) lifts the blocks
  after it up to the next item, where their column reaches its content; for the last item under a
  block that owns the list (`listParent`, a paragraph), those blocks are after that block, in its
  container, which the lift didn't look at: an unclosed fence, a paragraph read into the item. The
  lift looks past the owning block now. `commands.test.ts`.
- [B491, B506] **A quote of one paragraph written anew keeps its leading `>` line** (`created`,
  `write.ts`): under `quotes: text` a quote whose only child is a paragraph reads as that paragraph,
  framed, where the paragraph starts on the quote's first line; one read as a quote (its first line a
  `>` alone, `  >⏎   > more`) and written anew lost that line and read back as a paragraph, the list
  after it its children. Written with a `>` line first now. 11 of B491's 15 kept sessions write; the
  rest regrouped: three under B503 (an item's padding written in normal form, the root's block after it
  read in: the seam check's and the writer's two models of the lines), one a new B510.
  `commands.test.ts`.
- [B515, B517, B518, B516, B488] **An item written anew with its first child on its line, and a padded
  block below a paragraph owning a list** (`#lastLines`, `#setApart`, `draft.ts`): the seam check read
  such an item's line as spaces where the writer puts its marker (`- > q` read `  > q`), so a padded
  quote after it looked apart; and a padded block below a paragraph that owns a list was refused where
  one below an item is lifted out (its padding dropped, indented code fenced). Both as the writer
  writes them now. Six tests that asserted a refusal (B190, B416, B452, B483, B484's) assert the lift
  (decided 2026-11-14, Decisions). `commands.test.ts`.
- **A callout left with its title alone** (its body cut or deleted, ` > [!note] Title⏎  > body⏎⏎> a
  quote`): the seam check read the title without its `>` and missed the quote after it. A childless
  quote's lines that are its text bare are read after a `>` (`#lastLines`, `#firstLines`); lines that
  carry their item's marker already (`- > [!note] x`) are not, which a first version got wrong.
  `commands.test.ts`.
- **The seam after an item renumbered narrower** (`100. a⏎101. b⏎⏎    code`, Outdent or Backspace on
  `a`): `101.` written `1.`, its content column further left, the code after it read into it; that seam
  wasn't checked, the item untouched. It is now (`#raise`'s seams), the code fenced. The diff suite's 7
  runs of it write. `commands.test.ts`.
- [B511] **A paragraph of an item moved here, its text the draft's, read bare by the seam check**, not
  at the item's content column, so indented code after it looked apart (Alt-Down past an empty
  heading). Read there now (`#lastLines`), a paragraph's only: any node with a text of its own, the
  first try, read an empty item's marker twice. `commands.test.ts`.

### Code and lists

- [B205] **Enter at a fence after an item's unclosed fence failed to write**: the draft asked for a
  blank line between them, which the open code takes as its line. The line Enter makes there is that
  code's empty line now, as every text editor writes it (decided; `lineAbove`, `code.ts`); and any
  gap the draft leaves after a block nothing closes, outside a quote, is its text's empty last lines,
  as Markdown reads them (`#openBlockGaps`, `draft.ts`): Backspace on an empty item after one, unclosed
  math outdented out of a quote. Regression300; `commands.test.ts`. Seed 51's 14 pass.
- [B209] **Emptying the third shared marker wrote a thematic break**: `- - - `. Nested items with no
  text of their own, the innermost empty, a rule's characters on their shared line, are given empty
  texts, each written on a line of its own, as the outliners show them (decided; `#ruleLines`,
  `draft.ts`). Regression301; `commands.test.ts`. A bare marker's line right under a paragraph's
  being its setext underline (`p⏎- `, the paragraph a heading), a blank line is raised between them,
  under a sibling paragraph or the parent's own text, an item's, a footnote's, the paragraph that
  owns the list (found triaging the rest of B209's cases). Regression304.
- **A held line at the end of a note with no final line break was dropped** where the writer rewrote
  the text before it (`2. ⏎3. > ◌`, Delete subtree on `2.`: `its text missing`; seed 101). The
  writer carries the held mark at the old end only past a final line break. Now also where the node
  holding it is still last and not written anew, the written text ending with no line break either.
  Regression325. Alt-Down on the same shape, the held line no longer last, is filed under B237.
  B358 (`1. n┃um⏎2. > ◌`, Enter: the held quote's item written without its text) is the same
  mechanism and passes with it: out of the tracker.
- [B298, B164] **A footnote definition's later lines were written past its label**, `[^a]: ` six
  columns, where a definition reads them four in. Its continuation is four columns now
  (`continuationAsWas`). Regression332, Regression333.
- [B40, B41] **Tab over a selection of roots at several depths, levelled first** (`mixedDepths:
  level`): the roots moved after the first could be all of a container with no text of its own,
  checked one at a time only, and it was left holding nothing (a quote, a marker line's item).
  Checked together now: refused, as for one. Regression344, Regression345.
- [B368] **An item whose text starts `-- `, its last line a block id**: bullet and dashes read as one
  rule, `- -- `. The escape that keeps them apart skipped a text with any frame; it skips only one
  framed at its start now. Regression349.
- [B367] **Enter on the blank line between an empty item's marker and its fence below it**: the
  first blank line written bare, the item ended there, the fence out of it. An item's blank lines
  before its text, which starts below its marker, keep its content column (`spellLines`).
  `commands.test.ts`. Shift-Tab on the same shape, unwrapping the fence, writes its leading lines as
  a blank line: filed as B405 (dropping them in `convert` broke Regression107).

- [B405] **Shift-Tab on an empty item's fence below its marker after a blank line**: the blank lines
  were left in the code's text, written before it as a blank line, the fence read with a new id. Code
  out of an item loses all the empty lines its text starts with, not one (`#atomTexts`). Regression358.
- Pass now, out of the tracker: B326's item case (two line breaks before an item's fence; it passed
  on the last commit too), B237's Shift-Enter on a lazy line of a held padding (written, the held
  space dropped, as `heldSpace: repair` has it).

- [B207] **Backspace at a fence's or math block's start after a block id on a line of its own
  failed to write** (`o⏎⏎^r⏎⏎┃$$`): the block right under the id's line reads with it. Refused, as
  after HTML a blank line ends (`atOpeningStart`, `code.ts`). Regression384; `commands.test.ts`.

- **Obsidian: code holding a `---` line unwrapped from an item, under a `---` the note starts
  with, failed to write** (found by the view and inverse suites on Regression382's buffer; on the last
  commit too): at the root the code's line closes frontmatter the first line opens. A blank line goes
  before the first `---`, as for a rule moved below it (`#frontmatter`, `draft.ts`, DeleteSubtree9's
  rule). `commands.test.ts`.
- [B525] **A padded ` ---` moved under the `---` a note starts with, or `* ---` unwrapped first with a
  `---` below it, closed front matter** (Obsidian): the draft sets the first `---` off with a blank
  line, as for a rule moved below it (`#frontmatter`, `draft.ts`). Refusing them in Alt-Up/Down and
  Shift-Tab, as `moveSubtree` does, the first try, refused about 70 moves the draft sets off already.
  `commands.test.ts`.
- **An indented fence lifted out of the list above it** (`liftAfter`, `write.ts`): its opening line was
  lifted and its code lines not, the code read with more spaces; each line of a fence is lifted as far
  as its opening now. And an indented fence's body is its code, its lines past the opening's
  indentation as CommonMark reads them (`OurusAtom.body`). `commands.test.ts`.
- **An item's empty quote written anew** (`- >`): the writer had no spelling for a new quote with no
  text and no children; its `>` alone now (`created`, `write.ts`). B501 and B472 write with it.
  `commands.test.ts`.

### Padded, shared and tab-led lines

- [B378, part] **An item two columns in after a padded empty item read into the new item Enter made**:
  `-  ◌┃⏎  - item`; the empty item written `- ` narrows, as one whose text went does, so the item
  after it is lined up (`narrowed`, `write.ts`). Regression306. B378 open for its other shapes.
- [B390] **A line joined into a padded empty numbered item took the quote after it in**: `2.  ⏎┃ x⏎   >
  more`; the seam check read the item with the padding it had (`2.  x`), the writer writing it past its
  marker and a space, as an empty item given text (`emptiedPadding`). `#ownLines` reads it so: the
  quote kept a block of its own, `2. x⏎> more`. Regression308; `commands.test.ts`.
- [B386] **Shift-Tab on the last item after a tab-led empty item's paragraph wrote it as that
  paragraph's lazy line**: `- a⏎  > q⏎→-⏎→  b⏎- c`. The seam check built the item's last lines from its
  text and its last child alone, `- a⏎    -⏎      b`, where `    -` under `a` is a setext underline;
  the line of the block before the last child is among them now (`#lastLines`). A blank line raised.
  Found with it, on Regression308's buffer: an empty item the draft places is read past its marker
  and a space, as the writer writes it (`#ownLines`, `#lastLines`), a drop of one refused, not failed.
  Regression309; `commands.test.ts`.
- [B348] **A tab-led child under an indented shared marker line couldn't be written once that line
  changed**: `  - - ┃⏎→- x`, the inner item taken out, or the items moved. A root block with an
  items' shared marker line whose items mix tabs and spaces, which the command changes, is written
  anew, the whole of it, in normal form (at the root's column, in spaces), its nodes keeping their
  ids (`#anewSubtrees`, `draft.ts`; `draft.anew`, the writer's `created` for them, no line-up with an
  old spelling): `- - ┃x`, and a move down and back is two normal-form writes (decided: normalize a
  block the command touches, down to the root, rather than carry both spellings; the outliners'
  result). Narrowed twice by the suites: not on a tab-indented list's two-space continuation lines
  (TO-IndentUnit), nor on mixed items with no shared marker line (Regression60 in tabs). A marker
  written over a line the writer can't write it over as it is is spelled for it (`overSpelled`):
  a tab as its spaces, a `>` with a space after it. Regression302; `commands.test.ts`.
- [B388] **Splitting a padded or moved shared marker line (B209's rest) failed to write.**
  - `-   - - ┃outline⏎  - [ ] draft`, Enter. Each item went on a line of its own, but `draft` was
    left at column 2. The first item, empty now, has content column 2, so it took `draft` in. The
    seams ran before `#ruleLines` split the line, and `#lastLines` read the shared line as it was.
    The split now runs before the seams. A split item ends its `#lastLines` at its own line and is
    checked like a filled one, so `draft` is lifted to column 0.
  - `- [ ] ⏎  - - x⏎    - - ┃`, Alt-Up. The moved item's empty child was a read node, which
    `#ruleLines` never saw. Such a chain is opened now.
  - Under a bare checkbox, where the flavor reads a task, no blank line is raised: it would end the
    item. CommonMark, where `[ ]` is text, keeps the blank line.
  - Regression316, Regression317. The diff suite moved 21 failed writes to success.
- [B388, rest] **Two more split shapes failed** (seed 51's third run).
  - The seam after the split item's whole subtree went unchecked when its last descendant was a
    read sibling (`-   - - outline⏎    - outline⏎  - [ ] draft`). It is checked now.
  - `#lastLines` gave the split item's line alone, `- `, which the general seam check reads as an
    empty item, ended by a blank line. It adds a line at the item's content column now, for the
    children that keep it open: `  > over two lines` is lifted to the root's column, not set off by
    a blank line inside the item.
  - Regression319, Regression320.
- [B378, B208 part] **Shift-Tab or Backspace on the child sharing a padded item's marker line**
  (`-   - ┃child two⏎  - child three`, seed 101) failed to write: the item after it, two in, read
  as the moved item's child, or as the parent's now that the parent has text.
  - A moved item off its parent's marker line, above a read item of its list, is a seam like any
    where the lower one's first line wouldn't start an item of the list after it: the lower one
    lifted.
  - A textless item given text is checked as a filled one is.
  - The writer lines the moved item up with a sibling's column less the lift the draft gives it
    (`shiftFor`'s target, the item it would take in, `created`'s line-up).
  - Regression323, Regression324. B378's case passes with it: out of the tracker. The diff suite
    moved 14 results, all moves now at the list's column, not lined up with a lifted sibling's old
    one (`1. x⏎- a⏎1. b`, not `1. x⏎  - a⏎1. b`); one drop refused at first, fixed.
- **The seam check read a blank line after an empty item that the writer doesn't write**
  (`-  ⏎⏎- ┃⏎⏎> quoted in item`, Tab; seed 101). A blank line would end the empty item, so the writer
  writes none. `#lastLines` had one, so the quote looked set apart, and it was read into the item
  instead. Regression326.
- [B382, B158, B162] **An item the writer lines up further left lost its lazy line's text.** Its
  text is the whole line, `    body text`, which at the narrower content column read as a
  continuation with fewer spaces. Such a line, led by spaces, is written past the content column it
  has now, its text as it was (`copyLine`). Tab-led ones stay known in `tabs.test.ts`.
  Regression328, Regression329.
- [B381] **Cmd-Backspace joining a line led by four spaces into an empty item made them its padding**,
  its content column past its child's. An empty item given its text by a join, holding children,
  takes no padding (`#leadingSpaces`), and a caret there is at its text (`#anchor`). Regression330.
- [B383] **A continuation line four columns past its item's content, a marker after them, refused
  under a shift** (`moved-line-starts-block`). A shift keeps those columns, so it starts no block:
  allowed where they are spaces (`deepContinuation`). Regression331.
- [B208] **A padded item with an empty heading, `-  # `, given text**: the writer writes it as an empty
  item, `- # $$`, its padding gone, but the draft's `#ownLines` counted only `''` as empty, so the
  seam check missed that the next item nests. Both count an empty heading as empty now (`narrowed`
  too, for Enter). Regression336.
- **An item's text outdented to a paragraph, the draft padding it** (`-◌    b` after an empty item):
  the seam check now reads the paragraph's padding (`#firstLines`), and `#setApart` drops a padding
  the draft set where that sets it apart.
- [B389] **A child first on its parent's marker line, under `indentUnit: tab`**, was shifted with a
  tab, which the parent's marker can't be written over. Its indentation is in spaces there (`shiftFor`).
  Regression339.
- [B39] **An item moved onto its parent's marker line lost its lazy line's spaces**: `copyLine`'s
  rule for a lazy line under a container its node leaves took a node that stays in it, only its
  column moved, and the rule that writes a lazy line past the content column it has now (B382's)
  took root shifts alone. The first skips a node whose prefix there is the shift's; the second takes
  any prefix of spaces, its text past that prefix. The diff suite moved 8 duplicates: the copy's
  lazy line now spelled with the tab its original has. `commands.test.ts`.
- [B398, B376] **An item `done()` padded, a held space kept as its padding**: a node moved into it
  (a fence's closing line, its child now) was written at its content column without the padding, out
  of it; and under a shift its later lines' continuation left the padding out too. `inside` adds
  the padding (`repadded`) for what is written in the item, but a child lifted by it already; the
  continuation is the shifted lead's. Regression347. B376 passes with it.
- [B15, B371] **Under `indentUnit: tab`, items under an item whose first child shares its marker
  line** (`- - a`): the later ones written a tab in, past the first's column, its children then.
  They line up with it, at the content column in spaces (`created`). `commands.test.ts`. B371
  passes with it.

- [B357, B399] **Shift-Enter among a padded marker's spaces, the text going below the marker,
  wrote its later lines a column off**, two ways:
  - in a quote with no space after its `>` (`>-┃  a quote⏎> over two lines`): the later lines'
    prefix was the marker's line with each character a space, `>  `, but past a later line's `>` the
    quote takes a space, so the item's columns there are one further: `>   ` (`write.ts`, the padded
    continuation). B399's case (`- >-  [!note] Title⏎  > body text`) was the same.
  - an atom under the item (`   1.┃  \> quote⏎       > more`, a quote atom): the item's content
    column narrower, the atom's lines copied at the old one, its front space then its text. They
    narrow with it now, as a renumbered marker's later lines do (`widened`, negative); a
    paragraph's lines stay as written (Regression267, Regression268: the first try, every child
    narrowed, moved those).
  - Regression385, Regression386; `commands.test.ts`. The diff suite: 3 Shift-Enter and Backspace
    runs that failed to write write; one Cmd-Backspace in `>2) a⏎ ~` writes the lazy line a column
    further (its own leading space kept after the now-right prefix), the same text.
- [B449] **Enter in an item of a quote padded further on a later line than its first** (`> quote⏎   >
  - ┃more`, the default options; seed 301 had it under a numbered item): B396's normal form took a
  quote padded further on its first line, not on a later one. Either way now (`uneven`, `draft.ts`; the
  user's rule, uneven padding may be normalized). Moved by it, judged: DeleteSubtree17's quote, ` >
  x⏎  > - b`, written at the root's column, `> - b`, not at its first line's (a spec change, below);
  the B350 test the same; 67 results in the diff suite, all that buffer's, and 13 commands that failed
  to write write. Regression393; `commands.test.ts`.

- [B410] **Backspace on the inner empty item of a tab-led shared marker line failed to write**
  (`- a⏎→- - ┃⏎→→- item`, `indentUnit: tab`: the item's id read on another node, or `moved-indent`):
  the writer can't write the shared line's items over the tab. B348's rule (a root block whose
  shared marker line mixes tabs and spaces, changed, written anew in normal form) takes a tab-led
  one too, where the command changes an item on that line (`#anewSubtrees`' `mixed`, `draft.ts`):
  `- a⏎→- - item`. A change elsewhere in the block (Enter at `- a┃`) writes it as it was: a first
  try, any change in the block, rewrote about 60 results the last commit wrote as they were.
  Regression387; `commands.test.ts`.
- **The normal form indents by the note's unit** (the user's rule, below): a block written anew
  wrote its items' indentation in spaces at their containers' content columns, a tab-indented note's
  too (B348's form). It indents by `indentUnit` now, detected or set: a tab, two spaces or four
  past the parent's marker (`unitChild`, `created`, `write.ts`); only an item lined up with one on
  its parent's marker line is at that one's column, a tab and spaces (`→  - other`), as Markdown
  needs (B15). The ~25 results on tab-led shared lines that B410's rule had moved to spaces are
  written with their tabs again; Regression387 shows the tab.
- **A block written anew in normal form took the default bullet for its root item** (`+ a⏎→+ + ┃⏎→→+
  item`, Backspace: `- a⏎…`; found while showing the user what normal form does): the lists inside
  the block were marked again, not the one its root item is in. That one is too (`#lists`' parents,
  `draft.ts`): `+ a⏎→+ + item`. `commands.test.ts`.
- **Enter in a shared marker line in a note indented with tabs** (`- - - ┃last`, `indentUnit: tab`):
  `moved-indent`; with spaces the line splits. A shared line led by nothing, an item on it changed,
  under the tab unit, is written in normal form too, as a tab-led one is (B410's rule): its items on
  lines of their own by tabs. B451 passes with it. Regression396; `commands.test.ts`. Regression339's
  expectation changed with it (Decisions).

### Block ids

- [B409] **A lone block-id line after a block, a block written right under it, failed to write**
  (`> \# ⏎⏎ ^blk⏎̬⏎> a quote`, Obsidian, Enter at the id line's start): the blank line of ours after
  `^blk` went, the quote then right under it, and `^blk⏎> a quote` reads `^blk` as a paragraph. The
  rule that keeps a blank line after block-id lines a text carries held where the gap was none, not
  where ours were trimmed: the last of them stays now (`#raise`'s `own`, `draft.ts`), as under a
  heading. `commands.test.ts` (no spec case: a raised line isn't drawn). The kept cases filed under it
  weren't replayed (their cases are kept only by id).

### The normal form by spelling

Decided 2026-11-13 (the user's: odd spacing may be re-spelled on any node a command
touches; padding every item of a list shares is the note's style, kept; prototype and measure).

- **A placed node with odd spacing in its subtree is written anew, that subtree only, in normal form**
  (`#anewSubtrees`, `draft.ts`): a node a command moves, indents, outdents, duplicates or pastes, where
  a line of its subtree has a marker padded past its list's (`- a⏎-   b`), a tab after a marker
  (`-→foo`, or past it, `1. →x`), tabs and spaces mixed before a marker (`→  - x`), or a paragraph or
  heading padded past its container (` p`, `>  b`, a whole tab after a `>`). The scope is the
  outermost item or quote starting on the node's line, and the items of its list after it (at their
  old column they could read into it, B410's rule, any depth now). Kept: padding every item of the
  list shares (`1.  one⏎2.  two`); padding the selection was in before the command (`draft.before`,
  the command's selection, handed in by `ctx.draft()`) or a held space. Closed B47 (its first case),
  B156, B157, B160, B468, B492; B278's duplicate (`9. →b⏎10. b`); B95's first case refused, a stated
  `not-expressible`, not written wrong. `commands.test.ts`; Indent51, Indent52.
- [B497] **The shared-line normal form's scope** (B410's): a tab-led shared marker line below its root
  block's own line, the command changing nothing else in the block: that line's items written anew, not
  the root block, the lines above and beside it as they were. Enter there zoomed in wrote above the
  zoom root (refused); unzoomed it re-spelled every spaced line of the block in tabs.
  `commands.test.ts`.
- **A selection end on a node written anew** (`#onAnew`, `draft.ts`): an end the command kept as an
  old position (in a checkbox, a marker, a prefix) has no copied line to map through; now the same
  offset in that node's text, or its start. `commands.test.ts`.
- Measured: open bugs 76 → 69; the diff suite 0 regressions, its moved outcomes the touched node's
  padding (`-  Review` → `- Review`, `-→b` → `- b`, a duplicate's copy `- \``` x` beside its
  original `-  \``` x`); the inverse suite 478 round trips gained. Tried and dropped: an item at
  another marker column than its siblings' (it moved a lined-up item to column 0, Regression39, and
  closed none); tabs and spaces mixed across a node and its parent (no bug closed, a tab example
  failed); padded atoms (none closed). The upper bound, every placed subtree written anew, closes 24
  bugs but fails 53 tests (lazy lines, a tab note's paragraphs in spaces, gaps' marks): the rest of
  the 24 need a neighbour written anew (B404, B487) or a quote's own spelling (B43 to B45, B470,
  B474), not the placed node's.
- **Every draft written again where the first writing fails**: the copy and the later
  writings are any draft's now, not only one that places nodes, so a Backspace or an Enter the writer
  can't spell is written again too; and the third writing takes the root block whole, past the shared
  marker line's narrower scope. Closed B453, B473 and 12 of seed 551's sessions; the extremes suite
  (a flat paste of many items) unchanged. `commands.test.ts`.
- **Written again where the first writing fails** (`done()`,
  `draft.ts`): a draft that places nodes is copied before `done()` changes it (`#copy`). Where the
  writer can't write it as its lines are spelled, or what it writes doesn't read back, the copy is
  written again with every node it places written anew, in normal form (the upper bound's scope);
  where that fails too, a third time with every root block it changes anew. The first writing that
  reads back is kept; where none does, the first failure is reported (a refusal from a later writing
  isn't, as it would hide the bug: B331, B369 are refused so). A command the writer already wrote is
  written as before: the diff suite 0 regressions, one outcome moved, a paste that failed writing now
  (`- p⏎  - c⏎  - ⏎┃⏎    - g⏎⏎    s`, `> a` pasted: the third writing, `g` and `s` re-spelled at
  column 2, the same outline); the inverse suite unchanged. The second writing closed B43, B44, B45, B52,
  B95, B169, B181, B404, B456, B457, B466, B470, B474, B485, B486, B487, B489, and the math case of
  B299, the padded label of B290; the third B16, B191, B210, B480, B482, and B413's Enter case
  (`>◌ q`, Enter: `>  q⏎>⏎> `, the held space settled as the paragraph's own). `done()` gives the
  kept writing each time it is called, `normalized()` its normal form. `commands.test.ts`,
  `draft.test.ts`.

### Parser

- [B251] **GFM email autolinks match over the decoded text, as cmark-gfm does** (decided): a text
  rule sees each run of text outside links with its escapes and entities decoded, and its matches are
  mapped back to the source (`MdTextRule.matches`, `applyTextRule` in `inlines.ts`; the email rule
  returns matches rather than splitting nodes). `a\+b@example.com` and `a&#43;b@example.com` link
  `a+b@example.com` whole (they linked `b@example.com`, the wrong mailbox); `a@example\.com`,
  `a\@example.com` link too. An autolink spanning an escape or an entity holds them as its children,
  so the backslash is still read as an escape (`inlineEscapeAt`); the renderer writes its value alone.
  `structure.test.ts`. The text-rule API changed (ourus is unreleased).

### HTML conversion

- [B323] **Text with a line of dashes and pipes converted to a table**: `<p>a | b<br>--- | ---</p>`
  gave `a | b⏎--- | ---`, which GFM reads as a table. A line that would be a delimiter row has its
  first pipe escaped (`escapeStart`).
- [B332] **`&lt;3@example.com&gt;` converted to an email autolink**, its brackets gone: a `<` is
  escaped before what can start an address too, not only a letter or `/!?` (`escapeText`).
- [B338] **A footnote reference converted didn't count as formatting**, so a paste preferring the
  plain text took its number, the reference lost.
- [B335] **HTML's plain text trimmed what is no blank**: a `pre` of spaces gave nothing, and an empty
  first or last cell lost its tab, the columns shifted. A `pre`'s spaces are kept, each cell but a
  row's first starts with a tab, and only spaces are trimmed at a line's edges (`plainText`).
- [B336] **`white-space: pre` on code was ignored**, its spaces collapsed: a code element styled so
  keeps them in its code span (its own style; inherited styles are B265's).
- [B270] **HTML's plain text differed from what a browser shows**: blanks across inline elements
  not collapsed as one run (`a  b c`), a code block's leading blank line dropped (only the one right
  after `<pre>` is none), cells holding paragraphs each on a line of its own. Collapsed as one run, the
  first line break dropped only right after the `pre` tag, a cell's blocks its text's (`plainText`).
- [B271] **Hidden content was pasted** (`hidden`, `display: none`), and a link of blanks dropped,
  the words around it run together: hidden elements are skipped as `script` is, the link a blank.
- [B339] **Word's paragraph lists numbered on past a jump** (`1.` then `5.`): a number that jumps
  starts another list, as an `<ol>`'s `value` does.
- [B340] **Word's list levels nested past the stack** (3,000 `levelN` paragraphs threw): a level past
  Word's nine is the ninth's.
- `commands.test.ts` for each.

- [B424] **A pasted loose task lost its checkbox** (`<li><input type="checkbox"> <p>done</p></li>`,
  GFM's own rendering of a loose task, gave `- [x]⏎⏎  done`): a checkbox alone before an item's first
  paragraph is that paragraph's task box (`#list`, `html-parser.ts`). The 3 kept conserve cases
  pass. PasteHtml20; `commands.test.ts`.

- [B423, B425 to B431, B435 to B439] **The HTML batch** (2026-11-12;
  `html-parser.ts`; each bug's case a test in `commands.test.ts`, PasteHtml21 to PasteHtml32):
  - tables: a nested table's rows and cells apart by a space (B429); a row span ends with its row
    group, `rowspan="0"` the group's rest (B430, B431);
  - links: a title's `&` escaped as a destination's, the attribute decoded once (B426); a destination
    and title held out of the whitespace collapsing, two spaces kept (`#kept`, B427); a destination
    nested past 32 parentheses in angle brackets (B428);
  - lists: an item's lists alternated as the top level's, two lists kept two in the conversion
    (B423; pasted into a note they are one list still, the outline holding items, not lists); a rule
    first in an item under a `-` bullet written `***` (B425);
  - styles: `inherit` and its kind no formatting of the element's own (B435); a decoration not lifted
    by a descendant's `none`, only a line-through of its own counted (B436); a table's, a row's and a
    cell's style on the cell's text (B437); a list's on its items (B438); a link's own around the link,
    `**[x](u)**` (B439). `cssText` the one spelling of a block's formatting style.

- [B440, B441] **A bold tag or a link around blocks was dropped** (`<b><p>a</p><p>b</p></b>`,
  `<a href="u"><p>a</p><p>b</p></a>`): a formatting tag hands its formatting down as a style does
  (`cssText`'s `TAG_STYLES`, its own style after it winning: `<b style="font-weight:normal">` none);
  a link around blocks is each block's text's (`linkedDown`). PasteHtml33, PasteHtml34;
  `commands.test.ts`.
- [B373, B374, B375] **ourus's HTML of a callout, a wiki link and math didn't come back as theirs**:
  the converter takes the note's flavor now (`MdHtmlParser.parse`'s `flavor`, the paste's
  `clipboardMarkdown` passing it) and, where the flavor has the extension, reads ourus's rendering of
  it as its syntax: a `callout` div a callout, its type and title its first line; an `internal-link`
  a wiki link, `[[p|alias]]` where the text isn't the target; a `math-block` div `$$…$$`, a
  `math-inline` span `$…$` (none read before, `x^2` a paragraph). In GFM as before, the text they show.
  The round-trip check (`htmlFailures`) reads back in the note's flavor, as the paste does (a change
  to the oracle). PasteHtml35, PasteHtml36; `commands.test.ts`.
- [B432, B433, B434] **Formatting runs** (2026-11-12): a format's delimiters are written as
  tokens and settled once the text is whole (`resolvedMarks`): a run closed and opened again at once
  is one run (`<b>a</b><span style="font-weight:bold">b</span>`, an empty span between, `**ab**`), a
  run of nothing none (`<b><span style="font-weight:normal">a</span>b</b>`, `a**b**`, not
  `****a**b**`). A format turned off inside a run is closed before it and opened after it, its blanks
  outside the formatting with it (`**a** b **c**`, `#unwrap`). A plain wrapper span around one element
  of a formatting is that element, beside its neighbours (`` `ab` ``). The flanking checks read code
  points and every Unicode blank, what follows a delimiter counted as CommonMark counts it, neither
  blank nor punctuation, a combining mark too (B434). Left, split off as B459: italics on both sides
  of a bold's edge (`<b>a<i>b</i></b><i>c</i>`), a nesting the tokens don't settle. PasteHtml37 to
  PasteHtml41; `commands.test.ts`.
- [B459] **Italics on both sides of a bold's edge showed their delimiters** (`<b>a<i>b</i></b><i>c</i>`
  written `**a*b***c*`: the `***` closes both, `c*` text). A `*` or `**` run opened right after two
  runs close is spelled with `_`, `**a*b***_c_`, where its close isn't inside a word
  (`resolvedMarks`); after one close, `*a***b**`, the asterisks read right and stay. Left as it was: the
  italic's close inside a word (`…_c_d`), which `_` can't close either. PasteHtml42; `commands.test.ts`.

### Performance

- [B263] **The line table copied a chain per depth**: a line nested n quotes deep made a chain of
  its containers at each level, n² in all. A level's chain is made when a line of its own needs it
  (`allLineBlocks`): 16,000 levels, 1.1 s → 10 ms.
- [B316] **A quote atom's block ids read in quadratic time**: `posOf` walked a text's lines from its
  start for each position. It finds the line by halving over the lines' starts, kept per text read.
- [B275] **Escaping many lines was quadratic in the draft**: each escape put in spliced the text and
  remapped every mark. They go in together (`OurusProse.withEscapes`, `#putEscapes`), and the lines'
  markup is counted once: 12,800 list-looking lines pasted plain, 7.7 s → 3 s, linear.

### The suites

- **`volume.ts` runs on worker threads** (`VOLUME_WORKERS`, one per core): the rounds handed out
  one at a time, the shrinks in batches, and the results read in round order. The report is the
  same as one thread's, checked on seed 51. 113 s → 36 s on 10 cores.
- **The randomized frame test** (`test/doc/text.test.ts`, "a text's frame agrees with the parser")
  failed three times within full runs, never alone; caught later on a seed as B479 (P4), and the
  property tests run on a fixed seed since (below).
- **The SxS adapter crashed on Regression345** (a subtree selection the items drawn for a block app
  can't spell, its roots not theirs): every block app's full run failed on the last commit. Such a
  start is judged on the drawings, projected (`sxs/lib/plan.ts`).

- **The marks check reports nothing where it can't judge** (2026-11-12, a change to the oracle): a
  run of blank lines inside code, math or a comment nothing closes (a raised line there is the code's text by B205's rule), and a run beside the same text as another run of the result
  (identical blocks side by side, which the diff of like lines puts either way), are no loss reported
  (`autoLost`, `twinned`, `report-checks.ts`). Of seeds 301 and 351's 59 cases filed as no bug, 47 are
  quiet now; of the 21 filed as bugs, 19 still fail. The other two (c047a805c647, a18f3d2ab737) were
  identical blocks after all, moved to no bug; B446 takes another of its cases.
- **The marks check judges no run of blank lines between two blocks alike** (2026-11-13,
  a change to the oracle): a run between two blocks that read the same past their
  prefixes (indentation, `>`, a list marker and its number), in the result, or in the note where the
  result still has both (a move past its like, a duplicate, `3. ` and `4. ` empty), is no loss
  reported (`between`, `report-checks.ts`). Of the 28 cases of seeds 401, 451 and 501 filed as no bug
  and still reported, 18 are quiet now; the 15 filed as bugs (B418, B444, B477, B478, B495, B496)
  all still fail. Where a change edits one of the two, the result keeping one, the run is judged
  (B477). Tried: only the lines beside the run alike (14 quiet, multi-line blocks missed). Left: marks
  that follow their nodes where the check follows lines (6), and alike blocks the move regroups (4).
  `report-checks.test.ts`.
- **A baseline left behind fails its run** (2026-11-14): the reports over the generated notes held
  each group's count only against rising, so a baseline whose groups had gone (sessions' 50, sweep's
  12, conserve's 21) or whose corpus the spec had changed (inverse's, the view suite's) held nothing,
  quietly. On the run it was counted on (no knob changing its corpus), a group with fewer runs than
  its baseline, or another corpus, fails the run now until its `*_UPDATE=1` records the counts
  (`staleBaseline`, `report-baselines.ts`; conserve, inverse, sessions, sweep, view). Every baseline
  recorded again. The sweep's cut→paste check reads a block by its kind, its opening line and its
  payload, an item's code too (`- ```js`, which it missed, its 5 cases the same code); a closing
  fence a paste writes for a block left open is no change (PasteList27's rule, its 7 cases).
- **`test/copy-paste.ts` in `npm test`** (2026-11-14, decided with the user): it failed, out of the
  run, since at least the 2026-11-06 commit, 13 items pasting otherwise than they duplicate: the paste
  keeps the copied item's spelling (`-   b`, its padding; an empty item's `- `), duplicate writes the
  copy in normal form (`- b`); a gap of two blank lines kept one. An item may differ so now, in spaces
  and tabs alone, each node's text the same (`spacing`), or in blank lines, or be refused by both; its
  baseline recorded, a baseline left behind failing it as the others' do; `heavy.ts` runs it.
- **`test/triage.ts`** replays each kept case to its failing step, reduces the note a line at a time,
  and prints the step as `executeOnText` arguments with what the writer wrote; it carries the view
  (folds, zoom) too.
- **The property tests run on one fixed seed in `npm test`** (decided 2026-11-13, the user's): a random
  seed let the fast suite fail on an old bug a new note happened to reach (B479, the frame property),
  so a red run didn't say whether the code had changed. `test/lib/fc-seed.ts`, preloaded by
  `test:fast` and `heavy.ts`, sets fast-check's global seed (`FC_SEED`, a fixed default);
  `npm run test:fuzz` runs the same tests on a random seed (`FC_SEED=random`), to run each round
  beside the volume runs, what it finds triaged into `test/bugs.ts`.

## Decisions

- **A heading keeps one blank line under it** (decided 2026-11-12: "i *prefer* to have a blank line
  under headings, dont compact/trim them even if its ourus added line there"; "author's lines never
  trimmed"). Seeds 151 to 251's five Shift-Enter cases: `## No⏎┃x`, Enter, the caret leaving, left
  `## No⏎⏎x` with the line ours, and Shift-Enter at `x`'s end took it (an ATX heading needs none).
  Now: Enter in a heading (its end, mid-title, the text below's start) sets the new paragraph off by
  a blank line of ours; Shift-Enter writes it compact (the way to type a heading and its text with no
  blank line); Backspace on the untouched empty paragraph takes the Enter back, the line with it
  (`inheritGap`: the one exit); otherwise a command trims ours under a heading to one, never to none,
  and the author's not at all. A spec change: 31 cases drew Enter under a heading compact (Enter23,
  Enter41, Enter42, Enter51, Enter52, Gap12, Scenario19, Scenario20, Scenario23, the TO-E13 to E21
  cases among them); bare Obsidian and its Outliner write it compact (TO-E15's note), so the
  true-outliner demo differs from them there, by this decision. Not SxS-probed further: a preference.
- [B21] **Blocks pasted at a text's start go before its block: `pasteAtTextStart: before` the
  default** (decided and done 2026-11-11, option B). Cut then paste swapped two blocks: the cut leaves
  the caret at the next block's text start, and `after` put the paste below it (`first⏎⏎second` cut and
  pasted back gave `second⏎⏎first`; above indented code the same). The probe, a plain paste of two
  blocks at `┃second`:
  - before: Obsidian, Obsidian LP, Obsidian Outliner, SilverBullet, emacs-markdown, Roam, Dynalist,
    WorkFlowy, SiYuan, Lexical, Moodo; Obsidian True Outliner for items;
  - after: Logseq, Logseq DB, Athens, Tine, Tana, Mubu, Notion; Obsidian True Outliner for paragraphs;
  - into the text: AFFiNE, BlockNote, RemNote.

  Cut then paste: every app that pastes back restores the order (the Obsidian ones, SilverBullet,
  Roam, Notion, RemNote, SiYuan); Logseq's and Athens's have no text focus after the cut. Option A
  (keep `after`) matched none of them there; C (`after`, a paste after a cut put back where it was)
  needs view state, Notion's. `after` stays an option.

- **Decided with the user 2026-11-12, on the rules taken while making `before` the default**
  (each shown with a full example, the SxS's evidence below and its options):
  - *Blocks of lines or quotes pasted before a list's first item are items of it* (option B), as the
    spec's rule (`fitToList`) has them and as paragraphs and headings are there (PasteList3). The
    rule taking them before the list, so a fence cut right above a list goes back where it was,
    was reverted: no app does it. Regression359 rewritten.
  - *Where `before` can't be written, the paste goes after* (option A, kept), as `after` would put
    it, rather than refusing a paste the old default wrote (22 such in the diff suite: a paragraph
    before a callout on a textless item's marker line, before a padded paragraph in an item).
  - *Paste before a heading* (option A, kept): the last of the section above, a pasted heading
    regrouping by level (Regression360), where it was the host's.
  - *Backspace at a rule's start after a paragraph is refused* (B202, option A, kept): the text
    editors' join makes the paragraph a heading; the block apps' `p┃---` says nothing of rules, a
    `---` being text to them. As Delete at the paragraph's end refuses.
  - *D24: `quotes: atom` is a main target* (the true-outliner demo runs on it): its bugs rank as
    the default's.
  - **The SxS on them (2026-11-12; probes in `.sxs/probe/2026-11-12T11-10-20-857Z/`):**
    - *Before a list's first item* (a fence pasted at `p⏎⏎- ┃a`): no app puts it before the list.
      The doc-model apps with lists make it the first item's: SiYuan its first block (`a` a child
      paragraph), RemNote a new item. The block apps hold it as an item (WorkFlowy, Logseq, Tine:
      `a` joined to it). The text editors splice the text, the fence on the item's marker line.
      BlockNote and AFFiNE join `code┃a`. Regression359's own run didn't reach the shape (the text
      editors cut a line's text, Tine and Athens cut otherwise).
    - *The fallback*: a paragraph and a list at a padded paragraph's start in an item
      (`-  a⏎⏎     ┃b`): after it in Logseq (file, DB), Roam, Athens, Tine, Moodo, Notion and
      true-outliner; before it in WorkFlowy, the padding dropped; the text editors splice the text.
      A paragraph at a callout title's start on a textless item (`1. > [!note] ┃T`): no app puts it
      after the title. The text editors splice it into the title line (`> [!note] first⏎┃T`);
      Logseq (file, DB) and Roam do too, as ourus does under `quotes: atom`. Some of the 22 the
      fallback writes are a position ourus can't write, not none (`x⏎⏎# h` at a quote's start in an
      empty task's item): bugs the fallback hides.
    - *Before a heading* (Regression360): Roam and SiYuan as ourus; Logseq (file, DB), Athens, Tine,
      mubu as ourus under `after`; the text editors splice the text (`## x`, `y┃B`).

- [B251] **GFM email autolinks match over the decoded text, as GitHub does** (decided 2026-11-11;
  done, Parser above). Ourus's rule sees raw text nodes, so it stops at an escape or an
  entity, `runTextRules` in `src/parser/inlines.ts`. The fix runs recognition over contiguous decoded
  text and keeps its source map.
  - What the parsers give:

    | Input | ourus | micromark-gfm | cmark-gfm (GitHub) |
    |---|---|---|---|
    | `a+b@example.com` | links it whole | links it whole | links it whole |
    | `a\+b@example.com` | links `b@example.com` | no link | links `a+b@example.com` |
    | `a&#43;b@example.com` | links `b@example.com` | links `b@example.com` | links `a+b@example.com` |
    | `a@example\.com` | no link | no link | links the whole |
    | `a@example&#46;com` | no link | no link | links the whole |
    | `a\@example.com` | no link | no link | links the whole |

  - **For a micromark issue:** micromark-gfm isn't consistent with itself. The escape `\+` gives no
    link, but the entity `&#43;`, which decodes to the same `+`, links only `b@example.com`: a link to
    the wrong mailbox, as ourus's. Run on micromark 4.0.3, micromark-extension-gfm 3.0.0,
    micromark-extension-gfm-autolink-literal 2.1.0 (2026-11-11):
    ```
    a\+b@example.com      →  <p>a+b@example.com</p>
    a&#43;b@example.com   →  <p>a+<a href="mailto:b@example.com">b@example.com</a></p>
    ```
  - cmark-gfm 0.29.0.gfm.13 (`cmark-gfm -e autolink`, 2026-11-11) links all six whole, the escaped
    and entity rows to the decoded address, `a\+b@example.com` →
    `<a href="mailto:a+b@example.com">a+b@example.com</a>`.

- [B346] **The caret where the cut node was (C)**, over the caret on the closing fence (A: Obsidian
  true-outliner's, whose paste then goes into the code and whose typing breaks the fence) and a paste
  of blocks at the code's end going after it (B: Paste14 reversed at its own example; Tana and
  true-outliner do it, the text editors don't). The SxS probe: Obsidian (Source, Live Preview,
  Outliner) and SilverBullet keep the caret where the line was, past the code; Emacs and WorkFlowy cut
  nothing at a caret; 15 apps skip fenced code. Spec: delete subtree's rule 2 gains the exception,
  copy's rule 6 points to it.
- [B350] **An edited block's lines may be normalized; a block not edited keeps its spelling.** A
  quote one column in after an item (`- a⏎ > x⏎  > - b`) renders as one at the root: its front
  padding is no structure, and once the edit touches the quote (its first paragraph cut) it is written
  at its container's column (`> - b`), as it reads, rather than refused. The apps probed: the text
  editors (Obsidian, SilverBullet) leave `  > - b` as it was, the item's quote now; the outliners hold
  a quote as one block's text (`quotes: atom`), where the shape doesn't arise.

- **Only blocks a command doesn't touch round-trip; a block it touches may be normalized** (front
  padding, mixed tabs and spaces, `>x` as `> x`), rather than code kept to preserve an odd spelling
  of it. B350's, B348's and B349's fixes follow it.
- [B193, B352] **A block the edit doesn't touch, which would read into the item above it, is kept a
  block of its own**, written outside the item, as every outliner probed keeps it (Logseq, Roam,
  Tine, Athens, Dynalist, WorkFlowy, Tana, Mubu, Moodo, RemNote, SiYuan, Notion, AFFiNE); the text
  editors join the lines as text (`-x`, no item). An exception to the rule above, for this case.
- [B328] **Indented code kept out of the item above it is fenced**: no blank line keeps indented code
  out of an item, and the outliners keep it a block of its own (they hold no indented code).
- [B205] **The line Enter makes after an item's unclosed fence is that code's empty line**, as every
  text editor writes it (Obsidian ×4, SilverBullet, Emacs), not a refusal.
- [B209] **Three nested empty items on a shared marker line are written on lines of their own**
  (`- ⏎  - ⏎    - `), as every outliner shows them, not as `- - - `, a rule.
- [B348, B349] **The edited block's lines are re-spelled where the writer can't write them as they
  were** (a tab-led child, `>x`): the result the outliners give.
- [D24] Evidence: the drivers declaring `quotes: atom` are Logseq (file), Roam, Athens, Tine,
  Dynalist, SilverBullet and Emacs; the Obsidian modes (true-outliner too), Logseq DB, WorkFlowy,
  BlockNote, SiYuan, Notion, Tana and RemNote declare `text` or nothing. Open.

- [Quote3, Quote86, Quote95, B57] **A touched quote written `>-` is normalized to `> -`.** The SxS:
  Obsidian adds the space on outdent, writes `>→-` on indent, continues the outer list on Enter;
  SilverBullet keeps `>`; the outliners hold the quote as one block's text. No app keeps the
  spelling as a rule; the rule above (normalize a touched block) decides it. Four bugs fixed (B56 P2,
  B289, B349, B341); B16 and B44 (P2) only refused, kept open.

- [B377, the check] **The marks check counts a raised line's mark by its run of blank lines**
  (decided 2026-11-11). Before, it mapped each mark through the changes. Among identical lines the
  diff is one of several, so it blamed the wrong line in two ways. Ourus kept the mark on another
  line of the run (Backspace emptying a heading under the raised line). Or ourus took its own line
  out first and kept the author's (a join that no longer needs the raised line).
  - Now (`autoLost`, `report-checks.ts`): for each run of lines alike past their trailing blanks,
    a mark is lost only where the run holds more of the author's lines than the runs it came from,
    plus the lines the change made there.
  - A line a change put text on, the author's blank line a paste filled, is none of the run's. So a
    raised line left marked as the author's beside it is still caught (`60283cfcb642`).
  - 47 of the 54 cases filed as no bug pass. The other 7 stay filed: moves that carry a run
    elsewhere, and pastes onto the author's blank line beside ours, which a count can't tell apart.
    `report-checks.test.ts`.
  - **Refined in the third run (2026-11-11), the same decision applied; flagged as a change to what
    the check expects:**
    - A line a placeholder holds is an empty block's, not one of a run's blank lines. A raised line
      that becomes the line of the block Enter makes there (after a heading, an empty item outdented
      or turned into a paragraph) is no mark lost. The text is the same; ourus takes out what is
      its own.
    - A line counts as filled only where the selection was on it. An item Enter makes after the
      line above, its text put in at this line's start, is a line of its own (`3bcd25a232f5`).
    - Runs are counted together where a mark links them, so a run split in two by a paste is still
      one.

- **To confirm: a failing command written again, re-spelled**
  (2026-11-13). Where the writer can't keep a command's spelling, the command now writes its placed
  nodes anew, then, failing that, the whole root blocks it changes: the third writing re-spells
  lines the command didn't touch, in the same root block (B16's lazy `→"` given its `> >   `; B480's
  lazy `x  - ` its `  > `). Only where the command failed before; no expectation changed. And B413's
  Enter: `>◌ q` writes `>  q⏎>⏎> `, the held space after `>` kept as the paragraph's own space, the
  mark gone. Recommendation: keep both; the alternative is the command refused.

- **Expectations changed by the normal form by spelling** (2026-11-13, the user's decision to re-spell odd
  spacing on a node a command touches): Indent14 (`-→b`, Tab: `  - b`, was `  -→b`); Regression355
  (`>  b` moved onto a marker line: `> b`, was its padding kept); `commands.test.ts`'s B475 case
  (`-  `` ` outdented: `- `` `, its children at column 2) and a blank-line case (`-→```` moved: `- ````).
  `tabs.test.ts` lists Regression60: under tabs its moved item's child is led by a tab and spaces
  (`→  - [x]`), written in normal form, unlike the spaced example's.

- **Confirmed: Regression339's expected text** (spec change, 2026-11-12): `-   - ┃list in quote` →
  `- - ┃list in quote`. Shift-Tab on a quote's list item sharing its marker line with a padded item,
  under `indentUnit: tab`: the line now written in normal form (Fixed, Padded, shared and tab-led
  lines: a shared line in a note indented with tabs), its marker padding gone. Reads the same; the
  user's rule ("weird spacing … fine to normalize").

- **Confirmed: DeleteSubtree17's expected text** (spec change, 2026-11-12): ` > - b` → `> - b`. Its
  quote is padded unevenly (` > x⏎  > - b`), which the normal form now takes (B449), at the root's
  column; the case was written to keep the first line's one column, B350's decision, which the user's
  later rule ("uneven padding on different lines … fine to normalize") supersedes. Reads the same.

- **Normalizing a touched block keeps the note's indentation** (decided 2026-11-12, the user's words:
  "you must still respect document's indent settings! some docs use tabs for indenting!!! no
  blanket tabs->space! and must also preserve doc's preferred space indenting - e.g. it may use 2 or
  4 spaces indent etc, you cant reformat that"; "other normalizations are fine, but spacing is one
  to preserve as much as you can"; "weird spacing (e.g. uneven padding on different lines, mixes
  tab/space etc) are fine to normalize"). So the normal form indents by the note's unit, tabs, 2 or
  4 spaces; what it may re-spell is odd spacing: a padded marker, lines padded unevenly, tabs and
  spaces mixed, `>x`. B348's "in spaces" is replaced by this. Done for the blocks written anew (Fixed,
  Shared marker lines); a wider scope for the rule (every touched node with odd spacing, not named
  shapes) is a proposal, not started.

- **Confirmed: B179 closed as no bug, its case's expectation dropped.** `> >`, Shift-Tab: the
  caret was in markup; it isn't now (zone `none`: an empty quote has no text), and the quote is
  written `>`, its line as it was. The case also asked for `> ` (a space after the `>`, so typing
  gives `> x`, not the host's `>x`, a quote all the same). Not done: the line as written is kept.
  `commands.test.ts` asserts what it does.
- **P4: rare and not worth fixing now** (decided 2026-11-12, the user's): rare input whose fix is
  large or complex, writer work for a fuzzer-built or hand-built shape, tab-led lines, the 9/10
  marker widths. 38 bugs from P3 to P4: B16, B43 to B45, B52, B92, B94, B95, B155 to B157, B159,
  B160, B165, B166, B169, B181, B190, B191, B192, B197, B206, B210, B278, B280, B290, B294, B299,
  B326, B330, B331, B343, B344, B413 to B417. Open after: 0 P1, 0 P2, 54 P3, 38 P4. And, to
  confirm, three more after reading them, by the user's word that such bugs found later may go to P4:
  B403 (`- - - `'s items dissolved by a delete, the block after them written at the old column), B418
  (a raised line's mark lost through a paste on a quote's blank line in an item, `indentUnit: tab`),
  B369 (a tab-led empty item indented; with spaces it writes). Each bug's comment says what was read.

- **Confirmed: B47's second case closed as no bug** (2026-11-12): a duplicate of ` p` (a paragraph
  padded one space) writes the copy `p`. Odd spacing on the block the command makes, which the user's
  rule allows normalizing; the case's expectation (the space kept) dropped, the result kept in
  `commands.test.ts`. B47 is P4 for its first, fuzzer-built case.

- **To confirm: what the clipboard format changed** (2026-11-13, B188; The clipboard format, above).
  Spec expectations changed: Copy1's mark (`<!-- ourus --><!-- text -->` → `<!-- ourus text -->`);
  Copy2 and Cut2, a copy from inside an item's text into its child keeping the child's indentation
  (`two⏎  - ki`, was `two⏎- ki`; rule 3 of copy.md says so now), so that a paste back puts it under
  the item. Behavior changed: Backspace and cut over a selection ending in a line's prefix, before an
  item's marker, join the texts (`- on«e⏎»- two` → `- on┃two`, was `- on┃- two`, the marker read as
  text); a test of a drag's deletion asserted the old host deletion under a zoom, `«p⏎»- child`, which
  now joins (`child⏎⏎q`), its zoom-guard case moved to a selection that leaves the zoom. New spec
  cases Copy41, Copy41b, Copy42, Cut6, Paste29 to Paste29e. A text selection with both ends at
  boundaries between blocks is whole nodes (`- one«⏎- two⏎»- three`: copied `- two⏎`, cut, Backspace
  and Delete taking `two` out, where they joined `one` and `three`), decided 2026-11-13.

- **Decided: B203, a join after a trailing backslash is a text join** (2026-11-13, the user's).
  `- foo\⏎- *bar*`, Backspace at `bar` (or Delete after `foo\`): `- foo\*bar*`, which renders
  `foo*bar*`, as the joins that form other constructs do (`- a &⏎- amp; b` → `a &amp; b`). No escape
  written. Closed as policy, its case deleted; `commands.test.ts` asserts the join. The SxS probe
  (`.sxs/probe/2026-11-13T21-04-07-599Z/`): every outliner that joins concatenates what it holds and
  escapes nothing, `- foo\┃*bar*` (WorkFlowy, Dynalist, Tana, Roam, RemNote both, Athens, Mubu, Tine,
  Obsidian Outliner and true-outliner) or the caret past the `*` (Logseq file and DB, Moodo); Lexical,
  BlockNote, Notion and AFFiNE unwrap the item into a paragraph; the text editors (Obsidian source
  and Live Preview, SilverBullet, Emacs) take the marker out and join nothing; SiYuan errs. Of them,
  those that keep Markdown in the item (Logseq, the Obsidian outliners) give ourus's text exactly.

- **Decided: B247, an angle autolink's entities decoded, as GitHub does** (2026-11-13, the user's: "go
  with github for now"). `<https://example.com/?a=1&amp;b=2>` links to `…?a=1&b=2` in every flavor,
  as cmark-gfm does; commonmark.js, micromark, markdown-it and marked keep `&amp;` in the address.
  Closed as policy, its case deleted; `structure.test.ts` asserts the reading. For an upstream
  report, below.
  - What the parsers give (run 2026-11-13: commonmark.js 0.31.2, micromark 4.0.3 with and without
    micromark-extension-gfm 3.0.0, markdown-it 15.0.2, marked 18.0.14; cmark-gfm 0.29.0.gfm.13 by the
    `cmarkgfm` Python package, its CommonMark and its GFM rendering alike):

    | Input | cmark-gfm (GitHub), ourus | commonmark.js, micromark, markdown-it, marked |
    |---|---|---|
    | `<https://example.com/?a=1&amp;b=2>` | `href="https://example.com/?a=1&amp;b=2"` (the `&` decoded, escaped again in HTML) | `href="https://example.com/?a=1&amp;amp;b=2"` |
    | `<https://example.com/&copy;>` | `href="https://example.com/%C2%A9"`, text `©` | `href="https://example.com/&amp;copy;"` |
    | `<https://example.com/&#65;>` | `href="https://example.com/A"` | `href="https://example.com/&amp;#65;"` |
    | `<mailto:a&amp;b@example.com>` | `href="mailto:a&amp;b@example.com"` | `href="mailto:a&amp;amp;b@example.com"` |

  - **For a CommonMark spec issue:** the C reference (cmark, as cmark-gfm's core) and the JS reference
    (commonmark.js) disagree, and the spec has no example of an entity inside an autolink. Its
    section on entity references says they are recognized "in any context besides code spans or code
    blocks, including URLs", which reads as cmark's; its autolink section says the destination is the
    URI as written and shows backslash escapes not working inside one (`<https://example.com/\[\>`),
    which reads as commonmark.js's. An example would settle it; GitHub's reading is cmark's.
  - The email form isn't affected: `<a&amp;b@example.com>` is no autolink anywhere (`;` isn't an
    email character); micromark-gfm and marked then link the bare `b@example.com` inside it, as
    cmark-gfm's GFM rendering does. The earlier email report is B251's (Decisions, above: micromark-gfm
    linking `a&#43;b@example.com` as `b@example.com`).

- **Rejected, never to do or reconsider: readback-guided repair** (2026-11-13, the user's). Proposed
  as a general fix for the P4s: where a writing fails, use the readback's difference (`root › 0: 2
  children, read as 1`) to patch the text (a blank line at that seam, the block read in lifted, an
  item's padding kept) and write again. DEFINITELY NOT SOMETHING TO EVER DO OR RECONSIDER: it papers
  over why the writing failed instead of fixing the model that made it fail.

- **Decided: B26, plain indented text pasted into an empty note is code** (2026-11-13, the user's: an
  option, `pasteIndentedCode`, Fixed, Copy, cut and paste). The SxS probe (`.sxs/probe/2026-11-13T03-00-24-891Z/`,
  `    code1⏎    code2` pasted into an empty note): every text editor keeps it as indented code
  (Obsidian ×4, SilverBullet, Emacs); the block apps make items (WorkFlowy, Tana, Roam, Moodo, Athens),
  a paragraph (BlockNote), spaces in the text (Logseq ×2, Tine, Mubu, SiYuan, AFFiNE) or a fence
  (Notion). The default is the text editors'.
- **Decided: B337, an empty heading in pasted HTML is dropped** (2026-11-13, the user's), closed as
  policy, `commands.test.ts` asserting the drop. The SxS probe (`.sxs/probe/2026-11-13T03-11-23-312Z/`,
  `<h2></h2><p>x</p>`): the text editors drop it (Obsidian ×4, SilverBullet, Emacs), and Dynalist,
  Moodo, Tana, WorkFlowy, Tine, Mubu, RemNote; Lexical, BlockNote, Logseq ×2, SiYuan, Roam and AFFiNE
  keep it.
- **Decided: a padded block after a list is lifted out of it, not refused** (2026-11-14): six tests that
  asserted a refusal (B190, B416, B452, B483, B484's) assert the lift now, the block's padding dropped
  (Fixed, Seams). About 75 refusals in the diff suite apply so.
- **Decided: an item may paste otherwise than it duplicates in spacing alone** (2026-11-14, the
  user's): paste keeps the copied item's spelling (`-   b`), duplicate writes the copy in normal form
  (`- b`); `copy-paste.ts` allows that, and blank lines, and joins `npm test` (Fixed, The suites).
- **Decided: the sweep's cut→paste check compares code by its payload** (2026-11-14), an item's code
  too, a closing fence a paste writes for a block left open no change (Fixed, The suites).

## Open

The 55 open bugs are in `test/bugs.ts`, each with its case and what was read of it; `dev/next.md` says
what to do next. Left from this round, beyond them:

- **B403: a quote after an item the writer lines up further left.** `liftAfter` takes no quote.
  Tried (2026-11-13): lifting a quote by the spaces before its `>`, its own prefix's; both cases still
  failed the readback. The quote's lines need the shift a moved quote gets (`moved`), not a lift.
- **B453**: a quote atom's lazy line keeps two front spaces in its text that no column holds under the
  new item; to refuse in the draft, or compare an atom's continuation lines without their front spaces.
- **B512 and B527: an item the writer lines up with the item before it, after an Alt-Up** (`\t- grd
  two` written `  - grd two`, an item placed above it in its list), the tab-led paragraph after it read
  into it. The seam check skips that seam and reads the item where it was. Tried (2026-11-14) and backed
  out: reading every such item as far left as the item before it, which refused both bugs but moved
  about 100 outcomes of the full run, the writer not lining up every such item. A fix needs the
  writer's own rule (`realign`, `write.ts`) shared with the check.
- **Uneven columns after B359's fix** (the diff suite): Tab over two code blocks after a padded item
  (`  - c3⏎```…⏎```…`) lines the first new item up with `c3`, at column 2, and leaves the second at
  column 0, the same structure. An item made from a paragraph lines up only with one that was an item
  now; the second should line up with the first's column.
