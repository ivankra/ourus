# Bug fixing (2026-11-10 to 12)

The bug round after the refactoring (`dev/29-refactor.md`): seed 51's kept cases read, then the
bugs in order of priority, reach from keys and the cases a fix takes out. A fixed item's `[Bn]` is
its id in `test/bugs.ts`.

## Contents

- [Triage](#triage)
- [Fixed](#fixed)
  - [Marks](#marks)
  - [Copy, cut and paste](#copy-cut-and-paste)
  - [Backspace](#backspace)
  - [Quotes](#quotes)
  - [Code and lists](#code-and-lists)
  - [Padded, shared and tab-led lines](#padded-shared-and-tab-led-lines)
  - [HTML conversion](#html-conversion)
  - [Parser](#parser)
  - [Performance](#performance)
  - [The suites](#the-suites)
  - [Measured](#measured)
- [Decisions](#decisions)
- [Open](#open)

## Triage

Seed 51's 249 kept cases, read by hand a case at a time (no helper): each replayed to its failing
step, made one command on a note made smaller while it fails the same way, and where the readback
refused it, the text the writer wrote. All replay as one command. Placed, not filed yet:

- **Filed bugs' shapes, 228:** B345 131; B350 16; B205 14, widened to any gap after an item's unclosed
  block (Backspace on an empty item below it, Shift-Tab of unclosed math in a quote); B348 10; B237 9;
  B209 7; B349, B352, B353 4 each; B351, B356, B358, B360 3 each; B193, B298, B355, B289 (widened: the
  indentation before a `>` differing, not only after) 2 each; B37, B164, B208, B297, B354, B357,
  B359, B361, B362, B376 1 each.
- **No bug, 2:** the marks check mapping a placeholder through a diff of identical lines; the held
  node keeps it, by id.
- **New, 18 cases in 9 shapes:** a quote atom's lazy inner line written at column 0 when its item is
  re-indented (`- a⏎  - > - b⏎    > c`, Shift-Tab, 5); a quote ending in an empty quoted line pasted
  into an empty note (`> a⏎> ⏎` written `> a⏎⏎`, 3); in Obsidian, a paste ending in `---` after a
  `---` at the note's start making front matter; a padded quoted paragraph moved onto a tab-led item's
  marker line; a line led by four spaces joined into an empty item becoming its padding; the inner
  item of a padded shared marker line deleted, the next item's lazy line left as it was; a paragraph
  indented over an item whose deep continuation starts `- `; a quote's first item moved past a
  paragraph owning an empty item, written as a second item; Shift-Tab on the last item after a tab-led
  empty item's paragraph, written as its lazy line. One case each but the first two.
- **Not read to the end, 1:** a tab after a nested `>`, Shift-Tab under the default `indentUnit`
  (B356's shape, likely).

**Filed** (2026-11-10, later): the cases still failing filed by id, untriaged none. 44 under the 20
open bugs they were placed under; 17 no bug (the marks check's diff of identical lines: the 2
placeholders, and 15 of B345's whose mark is kept, on the blank line that sets the same blocks
apart); 58 in 15 new bugs, B377 to B391 (a cluster of their own, "Found by the volume run, seed
51"): B345's second mechanism (B377, 27 cases), B350's item cases (B378, 9), the nine new shapes
above (B379 to B387), and the rest of B209, B348, B352 and the one not read (B388 to B391), each its
case reduced, titled from what the command wrote.

A second non-dry run of seed 51 (after the B377 work) kept 130 cases in 27 groups. 23 of its
`write-failed` cases pass now with the fixes below; of the rest, two joined B388 (a padded shared
marker line split by Enter), one B389 (a tab-led child of a shared marker line under `indentUnit:
tab`), and three are new: B396 (a quote padded further on its first line than its later ones, two
cases), B397 (Shift-Tab on a tab-led item takes the raised blank line after it, B353's case filed
again; fixed since, as B396). Of the 91 `auto mark lost`: 23 pass with the B377 fixes below, 54 are
no bug (the marks check's diff of identical blank lines: 26 the mark kept on another line of the run,
28 ours dropped where the edit no longer needs it, the check blaming the author's line; filed as
such), 14 one-offs filed under B377. Untriaged: none.

- **Triage of seed 101 finished:** 49 write failures filed under B237, B379, B361, B389, B356, and
  new B398 to B404 (B398, B400 P2; B399, B401, B403, B404 P3; B402 fixed since). Untriaged: none.
  No more volume runs while P2s are open.

- **Triage of seed 151** (2026-11-11, after the commit `318a5db`): 100,000 sessions, 88 kept cases
  (51 an auto mark lost, 37 `write-failed`), and the 27 sweep cases a `SWEEP_UPDATE` run had kept. Read
  with a new helper, `test/triage.ts`: each case replayed to its failing step, made one command on the
  note as it stood, and the note made smaller a line at a time while it fails the same way.
  - Fixed while reading: a table right under an item's lazy last line (`#lastLines`, 3 cases, and a
    held line's Backspace with them); a cut
    of whole nodes right under code (B406, 20 of the sweep cases and 26 more of its cut→paste runs).
  - Filed by id: 36 marks cases under B377 (8 of them moved to no bug after, below); 9 under B237 (3 first filed as B407, then read as a held
    space starting a quote's lazy line), 4 B357, 1 B401, 1 B403, 15 one-offs under B404; new B408
    to B410 (the first item out of a padded quote, fixed since; a lone block-id line beside a new
    block; tab-led shared marker lines), 7 cases.
  - No bug, 18: identical blocks the marks check's diff can't tell apart (11), and the sweep's notes
    with an odd character in a fence (7), the code unclosed, which a paste closes by design.
  - Untriaged: none.
- **Triage of seed 201** (2026-11-12): 93 sessions failing, 89 kept cases (47 marks, 42
  `write-failed`), read the same way. 34 marks cases under B377 (6 moved to no bug after), 13 no bug (identical blocks; a
  raised line dropped before a quote, a list or a rule that interrupts the paragraph above). Of the
  write failures: 23 held marks under B237 (most a quote atom's lazy `  > more` or a held padding), 8
  shared marker lines under B410 (padded or tab-led), 2 B297, 1 B308, 1 B409, 7 one-offs under B404.
  No new mechanism; untriaged none.
- **14 marks cases of the two seeds moved from B377 to no bug** (2026-11-12): a raised line after a
  fence, math or a comment nothing closes, or in it, is that code's text by B205's rule, where seed
  51's triage put the same shape; filed under B377 at first by mistake.
- **Triage of seed 251** (2026-11-12, after this session's B237/B377 fixes): 65 kept cases (115
  for seed 151, 89 for 201), read with `test/triage.ts`. Marks: 14 under B377 (moves and indents
  into a quote, deletes and pastes at the note's end), 29 no bug (identical blocks; a raised line
  after unclosed code, B205's rule; Shift-Enter under a heading dropping a raised line, filed as by
  design, two more from seeds 151 and 201 with them, then fixed: a heading keeps one blank line, below). Write failures: 6 under
  B409 (a lone `^blk` line), 5 B410, 6 B404, 4 B237, 1 B401. One fixed at once (an item joined into
  a quote atom kept no marks, below). No new mechanism; untriaged none. Next seed 301.
- **Umbrella bugs split by mechanism** (2026-11-12, the user's rule: "no umbrella bugs",
  clusters group them; each new bug filed in its area's cluster):
  B237 into B413 (a quoted paragraph held past `>`, hand-built), B414 (a lined-up sibling leaving the
  paragraph after it inside it), B415 (a callout pasted after a nested callout's title), B416 and
  B417 (two indents of held shapes); B412 into B412 (block-id line) and B418 (a callout's held `> `
  line); B241 into B419 to B422 (each check `moveRefused` gets wrong); B264 into B432 to B434; B265
  into B435, B436; B266 into B437 to B441; B267 into B423 to B425; B268 into B426 to B428; B269
  into B429 to B431; B211 into B442, B443. All P3. Kept as they were: bugs whose cases are variants
  of one mechanism (B26, B47, B92, B94, B95, B210, B278, B290, B294, B299, B347, B357), B188 (one
  product decision) and B217 (one rule, which commands disagree on). 92 open after, all P3.

## Fixed

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
  failed three times within full runs, never alone (20 runs, then 20,000 per flavor). A parser
  property, not the writer's; the next failure's full output, its fast-check seed, is what's needed.
- **The SxS adapter crashed on Regression345** (a subtree selection the items drawn for a block app
  can't spell, its roots not theirs): every block app's full run failed on the last commit. Such a
  start is judged on the drawings, projected (`sxs/lib/plan.ts`).

### Measured

- Volume, seed 51 (the triage's 100,000 sessions): 2,284 failing sessions at the round's start; 571
  before the second triage; 490 after it (431 an auto mark lost, 59 `write-failed`); 175 with B388
  and the marks check counting by run; 103 at the end (57 auto, 44 `write-failed`), every group filed.
- Volume, seed 101, fresh: 644 at first, 606 → 510 → 117 → 103 (55 auto, 48 `write-failed`); its
  110 kept cases all filed (new bugs B398 to B404).
- Open bugs: 135 at the start (20 P2); 98 at the end (0 P1, 5 P2, 93 P3), with 17 P3s raised to P2
  and 6 fuzzer-shaped P2s lowered to P3 on 2026-11-11 (priority as when to work on a bug).
- 2026-11-11, later (`pasteAtTextStart: before` and the bugs after it): open bugs 98 → 72 (0 P1, 2
  P2, 70 P3). The diff suite against the commit before: 0 regressions; about 500 pastes the host had and 117
  refused are written; 1,000 pastes at a heading's start, the host's with `before` at first, written.
- Seed 151 (after those fixes): 88 sessions failing of 100,000, all filed; with its fixes and B182, open
  bugs 72 → 73 (0 P1, 2 P2, 71 P3: B409 and B410 new, B406 and B408 fixed).
- The diff suite against the last commit before the round's end: about 415 command runs
  that failed to write succeed now, no regressions; the moves judged, each.
- 2026-11-12: seeds 201 and 251 kept 89 and 65 cases (115 at 151), all filed; B377 fixed, B237's
  keyed shapes fixed, B297, B354 and B327 fixed; open bugs 73 → 71 → 70 (0 P2), then 92 with the
  umbrellas split. Seed 301, a dry run: 61 failing sessions in 100,000, 25 groups (the largest Alt-Up's
  lost mark, 11). The inverse suite gained round trips with each batch (281, 370, 122 against the
  commit before each), none lost.

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

## Open

In the order to work on them (`handover.md`, Next):

- No P2 open; 92 bugs, all P3, each one mechanism in its area's cluster.
- Seed 301 kept and triaged next: reach may raise one of them.
- [B16, B43, B44, B45, B47, B52] P3 now: fuzzer-built quote shapes; B47 and B52 tried (the duplicated
  empty item's blank line, the paragraph shifted as if out of its quote) and left.
- The randomized frame test (The suites): to catch with its seed.
