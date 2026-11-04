# Bug fixing (2026-11-05)

Fixing bugs from a review backlog: three agentic code reviews of `src/`, and scenario fuzzers written
for it, aggregated into 178 findings; then the tracker of open bugs, `test/bugs.ts`, and five more
reviews triaged into it ([Open bugs as code](#open-bugs-as-code)). What is still open is there. A fixed
item's `[Bn]` is the id it had in `test/bugs.ts`; those fixed before the tracker held them have none.

## Contents

- [Cleanups](#cleanups)
  - [Refactoring and API](#refactoring-and-api)
  - [Open bugs as code](#open-bugs-as-code)
  - [Tests from the review](#tests-from-the-review)
  - [Spec notation](#spec-notation)
  - [Tests corrected](#tests-corrected)
  - [Baselines](#baselines)
- [Fixed](#fixed)
  - [Folds and zoom](#folds-and-zoom)
  - [Copy, cut and paste](#copy-cut-and-paste)
  - [Block ids](#block-ids)
  - [Quotes and callouts](#quotes-and-callouts)
  - [Headings and rules](#headings-and-rules)
  - [Code blocks](#code-blocks)
  - [Moves and deletions](#moves-and-deletions)
  - [Tasks](#tasks)
  - [Placeholders](#placeholders)
  - [Selection](#selection)
  - [Typing and bracket pairing](#typing-and-bracket-pairing)
  - [Settings](#settings)
  - [Performance](#performance)
  - [Crashes](#crashes)
  - [API and line endings](#api-and-line-endings)
- [Verified](#verified)
- [Not done](#not-done)
- [Open: to review or decide](#open-to-review-or-decide)
- [Decisions](#decisions)
- [Notes for the next round](#notes-for-the-next-round)

## Cleanups

Work on the code, the tests and the spec that fixes no bug by itself: the refactoring and API
changes, the tracker of open bugs, the tests the review's fuzzing became, the spec's notation, tests
corrected, and the baselines re-recorded. The bugs fixed are in [Fixed](#fixed).

### Refactoring and API

One definition of each shared idea: the host's default edit, lines and characters, and where a
document's Markdown starts; and the helpers the later fixes needed, listed with the public API below.

- **`plainTextEdit` (`commands/util.ts`) replaces `hostEdit` (`commands/index.ts`) and `plainDefault`
  (`commands/zoom.ts`)**: what a plain text editor's default for a command does, `{ change, caret,
  everyHost }` or null. The block-id guard (`hostKeepsBlockIds`) and the zoom and fold guard (`zoomed`)
  both call it. What each saw before: `hostEdit` knew CRLF and code points, and treated Enter as an LF;
  `plainDefault` knew neither and left out paste and Enter. Now both see graphemes, whole line endings
  and the note's line ending. The zoom guard checks only `everyHost` edits, as it did (typing and the
  deletion keys), so it still doesn't simulate a paste.
- **Lines and characters in `src/text/lines.ts`**: `lineEndingBefore`, `nextLineStart`, and
  `charBefore`, `charAfter`, `charStart` (a grapheme by `Intl.Segmenter`, or a line ending, a CRLF
  whole). `charStart` takes a fast path for two ASCII characters, so a split segments nothing in
  ordinary text. They replace `code.ts`'s own `graphemeBefore` and `graphemeAfter` (Backspace and
  Delete on a code line), which gave the same answers. Internal: `src/index.ts` exports none of them.
- **`executeCommand` snaps a split to whole characters**: Enter and Shift-Enter given a selection inside
  a surrogate pair, a grapheme or a CRLF act on whole characters (`wholeCharacters`, `index.ts`). The
  other commands take offsets as given: only splits and deletions need a boundary.
- **A document's byte-order mark is before its line 0**, in the parser's line table, not in each rule
  (`linesOf`, `syntax.ts`): `MdTree.starts[0]` is past it, and `MdTree.update` re-splits from the
  text's start where line 0 changes, the change maybe to the mark. `#byteOrderMark` in the draft is
  the one writer rule about it.
- **`OurusDoc.wholeText(from, to)`** replaces two copies of `from === 0 && to === text.length`
  (`subtrees.ts`, `takenBy` in `commands/index.ts`).
- **Public API**, additions only, nothing removed or changed in type: `MdParseOptions.document` (a
  text is a whole document; `OurusDoc` parses so, and an update keeps it), `mdDocumentStart(text)`
  (beside `mdBlockIdEnd`), `get MdTree.documentStart`, `OurusDoc.wholeText`, and `MdInlineNode` from
  `ourus/extend` (B256). `MdTree.parse(text)` without `document` reads a mark as text, as before.
- **Public behavior changed:** `mdBlockIdEnd` accepts a lone CR before the `^`; `executeCommand` splits
  on whole characters; a document's byte-order mark is no character; fold, unfold and toggleFold refuse
  a node that doesn't exist, the root too (`no-such-node`); a drag's deletion is routed and checked as
  the other deletions are; a block id's name typed or pasted in its own markup may be another's
  (B307); `textOf` doesn't cache what it reads for a node of another snapshot; an inline rule's
  triggers are code points (B325); `markdownOf` of an empty range is `''`.
- **API, later:** `settlePlaceholders(view, at)` takes a selection too, and returns `selection` (B276).
- **Inside:** `verbatimLinesOf` and `VERBATIM` (`doc/copy.ts`, from `doc/index.ts`), `spliceIn` (`draft.ts`) puts in any number of nodes; `nearItems` (`write.ts`) finds the
  item a new one lines up with once a parent; `inlinesCovering` (`syntax.ts`) walks down the inlines
  at a position, for the three position queries; `ownRule` (`html.ts`) looks up a renderer's own
  entries.

### Open bugs as code

Three more reviews of `src/` gave 151 findings, each replayed on the tree and checked against the code,
duplicates merged, and ranked; 124 bugs (79 new) came of them with what `dev/open.md` held, and behavior
someone called by design went to a list of decisions to confirm. Some diagnoses didn't hold and were
corrected: what fails in B223 is the commands, not the block-id check; two reported bugs were one rule
collision (B209); autolinks decoding entities is cmark-gfm's reading too (B247).

- `test/bugs.ts` is the tracker of open bugs, in place of `dev/open.md`: each bug with what is known of it
  in a comment, and cases asserting what should happen, so they fail while it is open (`npm run bugs`;
  `node test/bugs.ts B212` shows one). A case that passes is reported fixed and fails the run until it
  moves to a test file or the spec. One failing another way than `bugs.baseline.json` recorded is
  reported, a throw from test code is a broken repro, not the bug, and `NEXT_BUG_ID` keeps ids from being
  reused. Each report was seen firing, on a simulated fix, change, typo and id clash. The baseline starts
  with the counts, overall by priority and a number per cluster, kept right by the same run.
- The cases that measure scaling compare this thread's CPU time at sizes eight apart (`scalingFactor`):
  wall-clock ratios under `test/heavy.ts` reported a quadratic paste fixed, and all the process's
  threads, a collector among them, can blur the next case. A short action repeats until the thread's
  coarse clock can tell. Open cases measure 24 and up, fixed ones 6 to 15, on a limit of 24 or 16.
- `npm test` is the full run now, `test/heavy.ts`, and what was `npm test` is `npm run test:fast`. It runs
  the fast suite first and alone, its timing tests failing on a busy machine, then the rest side by side,
  `bugs` among them, and exits 1 on any failure, where it always exited 0. Both typecheck now: `types`
  (`tsc -p .`) runs first in `npm test`, and `test:fast` runs it before its tests; only CI did before. `diff` fails on regressions: a
  run failing in both copies is a known bug. `TEST_BASE_REV` names the commit it compares with.
- `.github/workflows/test.yml` runs `tsc -p .` and `npm test` on every push, against the commit before.
  Played in a fresh clone, no `.sxs`, on four cores: 2 min 17 s.
- `test/lib/`, one `index.ts`, holds what test files share: `action-player.ts`, `command-execution.ts`
  (`executeOnText`, `assertApplied`, `appliedText`, `executeAfter`, `assertNoWriteFailure`),
  `drawn-states.ts`, `generated-notes.ts`, `report-baselines.ts`, `spec-reader.ts`, `spec-runner.ts`,
  `text-position.ts`. Modules there import each other directly, no cycle through the index. Vague exports
  got names that read from anywhere (`play` `playActions`, `run` `runSpecTest`, `docOf` `parseWithMarks`,
  `nodesOf` `allNodes`, `State` `SpecState`). 59 inline `executeCommand(OurusView.of(OurusDoc.parse(…`
  became `executeOnText`; the reports share their baseline's reading and writing, not their
  compare-and-print loops, which differ. `tabs.ts` and `drops.ts` stay out: passes, not library.
- 100,000 sessions take 73 s and fail 166 times in 17 groups, where the 2,000 of `test/sessions.ts` show 2:
  green says nothing got worse, on a small sample. B234, B272, B273 and B274 came of looking at a few.
- A review of 855ad61 gave 37 findings and a session report from 880,000 sessions over rotated
  seeds and options. Each repro was replayed on the tree, the writer's attempted text read behind each
  `write-failed`, the diagnoses checked against the code and, where reading Markdown was in question,
  against cmark-gfm, commonmark.js and micromark: 27 new bugs (B277 to B303) and three cases on B260.
  Some diagnoses didn't hold: the empty item after a definition that Enter failed on is a paragraph
  `-`, as all three references read it (B280); the fence indent reported P1 needs a tab-led line, P2 for
  the readback's hole (B294); the 130,000-item paste is an argument limit `executeCommand` reports as
  nesting (B281). Three copy findings are one mechanism with B260's footnote, the clipboard's HTML
  rendered out of its note. Footnote HTML matching cmark-gfm byte for byte, a `language-` class and a
  task status's width became decisions to confirm. One P1: B277, B272's caret past the text with a
  trailing blank for the line break (fixed since, in Block ids). The report's unassigned session
  families weren't filed: 1,275 of their shrunk states still fail, in groups whose messages mix
  mechanisms. The performance cases assert a fixed message, as B263's and B275's do, the factor in a
  comment: a measured one changes every run. (B281's argument limit hid a quadratic step behind it,
  found fixing it: Performance.)
- A second review of 855ad61 gave 21 findings, three of them the user's: all replayed on the tree,
  all failing still. 19 bugs (B304 to B322) and a decision. The user's three are P2: a table pasted
  into an empty item refused (B304), Enter's blank line after a heading gone once the caret leaves
  (B306, which Obsidian and SilverBullet keep, measured in their logs), typing a block id's name
  refused where a step of it is another id's (B307, its code path confirmed). Two findings are one
  shape: a command at the note's end fails to write where the last line is blank but not empty, a
  space or a bare `>`, no line break after it; with one, both write (B305, P2). Ranks lowered where the
  input is rare: a footnote whose body starts below a blank line (B309), a `-|` lazy line (B308), a
  reference spelling a comment's closer in clipboard HTML (B312). An unmatched `[` turning off URL
  autolinks is cmark-gfm's reading, checked (a decision to confirm). Duplicating `p ^a ^b` dropping the
  visible `^a` contradicts a test that asserts the stripping, so it is policy, leaning to keeping the
  text (B313).
- A review of bf90d76 gave 6 findings, all failing still: 4 bugs, all P3 (B323 to B326): HTML text with
  a line of dashes and pipes converting to a table, held spaces taken out quadratically, an inline rule
  for one emoji called on another sharing its high surrogate, two line breaks inserted at once before an
  opening delimiter. The other two, a footnote reference nesting an anchor in a link and references
  that render nowhere giving backlinks to nothing, are cmark-gfm's output, a decision already listed.
- A review of d1a0964 gave 18 findings, ten on HTML conversion and eight on the editor and parser, all
  failing still: 14 bugs (B327 to B340). One P2, from keys with no option: a list pasted over a
  paragraph's first line went after the rest of the paragraph (B327). The other editor findings need a
  shape of their own (an empty bare `-` above indented code, an empty quote and an id on its own line,
  `[^a]:` over an id, tab-led code dropped into a quote), so P3, and the HTML ones are P3 as that cluster's
  are. Two plain-text findings are one mechanism, `trim()` taking a `pre`'s spaces and empty edge cells'
  tabs (B335); dropping an empty heading is policy (B337). Two parser findings are where the references
  split, checked: a tab-only line after an empty item, where cmark-gfm reads as ourus and commonmark.js
  and micromark don't, and a label's 999-character limit, which commonmark.js and micromark count in
  UTF-16 units as ourus does, cmark-gfm in bytes, none in code points as the spec says: decisions both.
  A repeated footnote reference's id colliding with another label's is cmark-gfm's, listed already.

### Tests from the review

The review (the session before this one) read `src/` for bugs, then hunted realistic everyday editing
scenarios (the commands have per-command spec cases, few integration scenarios), checking what
other outliners do with `sxs/probe.ts` where the right behavior was unclear. Its findings were merged
(one true duplicate), clustered by mechanism and prioritized: P1 an uncaught throw, a broken view
invariant, or silent loss in ordinary editing; P2 a wrong result on realistic input, or an ordinary
edit refused with `write-failed`; P3 rare input, non-default options, API hygiene, performance,
HTML conversion details.

The useful fuzzing became tests (`test/README.md` says how each works and how to read a failure):

- `test/lib/generated-notes.ts`: a seeded generator of realistic notes, blocks composed in the orders real notes
  have, in the three flavors and a few option sets: the shared corpus of the reports below. A block
  shape goes in its `BLOCKS` when real notes break in a new way.
- `test/conserve.ts`: HTML export then import renders the same (`<pre>` verbatim); 17 clipboards
  pasted at many carets each keep every letter and give a valid selection.
- `test/sweep.ts`: every command at every caret of the generated notes, and of the same notes with
  an odd character put in (NBSP, U+2028, BOM, …): no throw, no `write-failed`, the selection in
  range, `changes` giving the text, line endings and the final newline kept; copy then paste into
  an empty note, and cut then paste at the caret the cut leaves, giving the same blocks.
- `test/sessions.ts`: 2,000 random 20-action sessions through `test/lib/action-player.ts` (history, folds,
  zoom): no throw, no `write-failed`, `assertViewHolds` after each applied command, undoing everything
  giving the note back. A failing session is shrunk to the actions that still fail.
- `test/generated.test.ts`: the one addition to `npm run test:fast`, a few-second slice of the three, failing
  only on a throw or a report that can't finish.
- Each report holds each group's count to a baseline (`conserve`, `sweep`, `sessions`
  `.baseline.json`; `inverse.baseline.json` re-recorded): a new kind or a higher count fails, a lower
  one is recorded with `SWEEP_UPDATE=1` (`SESSIONS_`, `CONSERVE_`, `INVERSE_`). Green means nothing
  got worse, not that nothing is wrong. Knobs: `SWEEP_GENERATED`, `SESSIONS`, `SESSIONS_SEED`,
  `CONSERVE_GENERATED`, `INVERSE_GENERATED`, `*_EXAMPLES`.
- `test/inverse.ts` plays 150 generated notes too (their write failures baseline-held, as groups of
  their own); `test/heavy.ts` gained the `conserve`, `sweep` and `sessions` suites, and passes
  `INVERSE_GENERATED=0` to both inverse runs where the last commit has no `lib/generated-notes.ts`, so both
  play one corpus. `package.json` keeps `test`, `test:fast`, `test:model` alone.
- The two timing tests that failed under CPU load (`marks.test.ts`'s auto mark on every blank line,
  `commands.test.ts`'s long list or quote) have their bound raised from 9 to 12, more samples.

Limits: the paste checks compare letters only (markers, digits and whitespace changing go
unnoticed: digits renumber on paste); redo-all isn't checked (an earlier oracle misfired); `cut→paste`
in `sweep.baseline.json` mixes design choices (below) with bugs.

### Spec notation

The spec draws a state's view and a subtree selection in its buffer now, as the SxS draws an app's:
marks last on a node's first line, after its labels (spec/README.md, "Drawing a buffer").

- **`⟦folded⟧` and `⟦zoomed⟧`** for the yaml keys `folded: ①` and `zoom: ①`, which are an error now.
  A mark names the outermost node starting on its line (with something to fold, for a fold; a
  second `⟦folded⟧` the next one in). Every buffer draws its view, a start's and a step's: none
  drawn, nothing folded and no zoom, as the SxS has it. So a step that didn't say its view checks it
  now (Placeholder4e, Regression68, Regression69, Regression194), and the seven that checked only
  their view (`folded: none`, no buffer) draw it in a buffer of their own, without the caret (Fold9,
  Fold11, Fold12, Zoom7, Zoom8, Zoom9).
- **`⟦selected⟧`** for `««…»»`: a mark on each root of a subtree selection, and only on the roots
  (an error else); upward with `┃` at the first root's line start. On a line nodes share, the
  outermost (inside the zoom); an inner one selected alone, and a whole-line selection of another
  shape, is drawn `«…»` at its offsets. Every subtree selection draws so now: `««…»»` had no span
  for some (an empty last node on an empty line, `>→>`), the note on that in `test/bugs.ts` gone.
  `««…»»` in a spec buffer is an error; `test/lib/drawn-states.ts` still reads it, for the SxS's stored runs.
- **A buffer's block is a `markdown` one** (`` ```markdown ``, 3490 renamed); `buffer` is an error.
- Rewritten from the states the runner plays (a script, not kept): 249 buffers, 48 yaml blocks left
  empty and dropped, each new buffer checked as the runner checks it before it was written.
  `drawDoc` draws the marks, so a step's buffer is compared whole, as before; `specTestView` reads the
  start's from its buffer (`drawnView`), `specTestViewMarks` says whether a case has a view.
- The SxS: a spec buffer's `⟦selected⟧` projects to its roots for an app that selects blocks, and
  to the span it was drawn as before (`legacySpan`, `block.ts`) for one that doesn't, so no verdict
  moved; an app's blocks selected whole are drawn `⟦selected⟧` (runs stored with `««…»»` or `▮` read
  still); a rejudge compares a drop's start by what it reads as, not its bytes (`sameDropStart`);
  a copy's plan takes `⟦selected⟧` for a selection drawn (SubtreeEdit5, SubtreeEdit6). Compare:
  nothing worse; nine cells' adaptation notes moved, the roots now compared where the span was
  (Outdent8 differs under `listParent: container`, `- b` a root of its own; Regression131 doesn't);
  Regression194 has a view now, which the block apps skip.
- `test/heavy.ts`: the base's copy takes the base's own spec where the reader changed since
  (`test/lib/spec-reader.ts`, `test/lib/drawn-states.ts`), which can't read the working tree's.
- **Ranks: `core`, `common`, `rare`**; `edge` is gone (an error now). Every `edge` case was read and
  ranked `common` or `rare` (627 ranks changed with the review below), by the definitions spec/README.md
  now gives: `common` an everyday edit on ordinary notes, its ordinary boundaries, default or widely
  used settings (Obsidian's tabs, bracket pairing, callouts, `$$`); `rare` a setting few change, tab-led
  or padded lines, lazy lines, odd nestings, markup corner cases, fuzz-found shapes (every regression
  case but those). Some `common` and `rare` cases moved too, and five `core` ones went to `common` (the
  drags, Scenario8b–8d and Drag1, and Scenario17, which needs `pasteLines: items`). A second pass
  read the `core`, `common` and `rare` cases the first didn't (the moves, fences, quotes, the
  regressions): 37 more, the drags MoveSubtree1–3 and 8 out of `core` with the others, mirrored moves
  ranked alike, the everyday edits a regression case met (Tab on a heading, a word pasted over a word)
  `common`. Then `core` redefined as the must-cover features, what every outliner provides and
  its users count on, each by its most basic case (spec/README.md): five flows added to
  scenarios.md to walk through the new ones (Scenario26 folding, Scenario27 zooming, Scenario28 a
  selection of nodes indented, moved, deleted and undone, Scenario29 a node cut and pasted, Scenario30
  a word cut, pasted and copied), and Fold1, Fold4, Fold9, Fold12, Zoom1, Zoom6, Zoom7, Select11,
  Indent9, MoveUp10, SubtreeEdit1, SubtreeEdit6, PasteList1, PasteList5, Copy1, Cut1, DeleteSubtree1
  and Scenario10 made `core`; the drags (MoveSubtree1–3 and 8, Drag1, Scenario8b–8d) back in it.
  Duplicating stays out (few outliners have it). Then 91 `core`, 553 `common`, 933 `rare`; with the
  regression cases added since, 91, 553 and 941.
- **Markup tags, checked by where each step's caret is** (a script, not kept): 52 cases that act
  at a checkbox, a heading's marks or a fence line, or from one, got the `markup-` tag the rules in
  spec/README.md give (`markup-task` 9, `markup-heading` 15, `markup-fence` 28); none taken off, the
  tagged ones the script didn't see (a join across a blank line, a fence being typed) right as
  they are. SxS: those cases leave the apps that opt out of the tag (32 cases), no verdict moved.
- **`sxs/run.ts --rejudge` crashed after the apps' reports** since the notation change, so the table
  (`sxs/README.md`) wasn't written: two apps' outputs compared as text read a block app's
  `⟦selected⟧` on a line no text node starts. Read without the marks there now (`asText`).

### Tests corrected

- `select.test.ts`'s `ownText` took a node's text to end exactly at `textEnd`; `selectedNodes` reads a
  selection into the frame closing it on that line (a block id, closing `#`s) as the text too, as its
  doc says. The first spec buffer with a paragraph ending in a block id (Regression214) showed it.
- `block-ids.test.ts`: a duplicate id pasted with paragraphs and a final line break keeps the note's id on
  its line (`1. aa┃ ^x`), where the same quirk as B272 had pushed it onto one of its own.

### Baselines

`test/sweep.baseline.json` and `test/sessions.baseline.json` re-recorded after each batch, nothing
rising. Sweep: `addBlockId: write-failed` 55 → 0, `insertText "\n": write-failed` 28 → 0,
`deleteContentBackward: write-failed` 12 → 0 and `deleteSoftLineBackward` 13 → 1,
`enter`/`shiftEnter: write-failed` 12 → 0 each, `copy→paste: atom` 13 → 0 and `paragraph` 5 → 1,
`cut→paste: atom` 61 → 52, `paragraph` 109 → 102 → 103 (the 103rd is B21's: a cut paragraph pasted
back after a footnote, where it was the host's), `quote` 28 → 26. Sessions:
`deleteContentBackward` 2 → 0, `enter` 2 → 0, `moveSubtreeDown` 2 → 1 (the quoted blank line). Left in
sessions: one each of `moveSubtreeDown`, `indent`, `outdent: write-failed`, all on lazy or odd-prefix
lines a host's own typing made (`x  > item`, typed before a quote's prefix).

Later batches: `test/sessions.baseline.json` `moveSubtreeUp: write-failed` raised 0 → 1, the one
session above (see Not done); the sweep, conserve and inverse counts at or under their baselines.

Re-recorded at the end (sweep, conserve, inverse; sessions unchanged): sweep
`deleteSoftLineBackward: write-failed` 1 → 0 and `cut→paste: quote: paste write-failed` 1 → 0;
`cut→paste` `atom` 52 → 49, `heading` 17 → 16, `item` 194 → 192, `paragraph` 103 → 94, `quote`
26 → 12. Conserve: `paste callout: write-failed` 18 → 0 (GFM reads `> [!note]` as a quote now).
Inverse (its corpus grew with the new spec cases, so the other counts moved with it): write failures
`enter` 12 → 0, `shiftEnter` 12 → 0, `moveSubtree` 4 → 0, `moveSubtreeDown after moveSubtreeUp`
39 → 0, `moveSubtree back` 8 → 3.

The `cut→paste` groups left are mostly not writer bugs, sampled by shape: after a cut the caret is at
the next node's text start, and a paste there goes after that node (`pasteAtTextStart: after`), so
the cut node comes back one place lower; a cut last paragraph pasted at a list's last item becomes
that item's continuation or a new item; a cut heading's section pasted with the caret inside a code
block above is pasted into the code as text.

Sessions, after B52's tab variant: `moveSubtreeUp: write-failed` 1 → 0; left one each of `indent`
and `outdent: write-failed`: a fence or quoted list at an in-between indent after the item, taken in
at its new column (open, B190).

Inverse's `enter, deleteContentBackward: text` group, sampled too: nearly all Enter at a soft line
break (a new node there) and Backspace joining without one, `a⏎b` coming back `ab`, as specified.
Two were bugs: Enter in an ATX heading with closing `#`s (fixed, in Headings and rules), and Enter after
an item's leading `[x]` making it a checkbox (fixed since, in Tasks).

SxS rejudged after the fixes of 2026-11-06 (`node sxs/run.ts --rejudge`, then `--compare` with `.sxs`'s last
commit): ourus passes all 1,585 spec cases, and every app's agreement is as it was but three cells. Two
got better (Tana's MoveSubtree19 ✗ → ✓, Tine's PasteList27 a caret's difference → ✓); Tana's
MoveSubtree24 went ✓ → (✗), Tana's own run having changed (its recorded result the list unmoved, written
two minutes after that commit, before these fixes; ourus's replay the same as then), not ourus. The new
cells are cases no app had (Regression267, 268, Scenario26 to 30).

## Fixed

### Folds and zoom

- **Backspace on a quote or code item joined into a fold's hidden descendant.** `- parent⏎  -
  child⏎⏎> quote` with `parent` folded and `quotes: atom`: Backspace at the quote's start wrote
  `- child> quote` and opened the fold. The prose join resolved the node above through a folded
  ancestor (Fold15); the quote and code joins (`joinQuoteUp`, `joinCodeItemUp`) used
  `node.preceding` directly. The resolution is now `visiblePreceding` (`commands/util.ts`), used by
  all three: the quote joins `parent`'s text, the fold kept; code becomes `parent`'s block after its
  children, the fold opening as in Fold15b. Regression200, 201.
- **Delete at the end of a folded quote item merged its hidden first child.** `- > quote⏎  -
  child` folded, `quotes: atom`: Delete wrote `- > quotechild`. The quote-atom route ran before the
  fold guard (Fold7); it is now refused `folded` there too. Regression202.
- **Enter at the end of a folded code, table or quote item made a hidden first child.** `nodeAfterBlock`
  (code, table) and `splitQuote` (`quotes: atom`, `enterInQuote: split`) chose the first child as the
  text's Enter does unfolded. They now follow the text's rule (Fold1): after the subtree, the fold
  kept; split mid-quote with the children following, the fold goes with them; zoomed into the item, a
  child, which before was placed after the root and refused. Regression203–205.
- **Shift-Enter at the end of a folded item lost its caret.** The new empty line reads as a blank
  line before the hidden children, so the caret was clamped back to the row's end and typing went on
  the old line. The fold opens there now (`unfoldedForCaret`, `commands/view.ts`); Obsidian and
  SilverBullet put the typing on the new line. Regression206.
- **`enterMidItem: child` changed a folded paragraph's split.** The folded-row branch of Enter
  tested the option without checking the node is an item, so `hello┃ world` over a folded list kept
  the list on `hello`. Now the paragraph's rest takes the list and the fold, whatever the option.
  Regression207.
- **A move that changes no characters escaped the zoom.** `- a⏎- a` zoomed into the first,
  Alt-↓: applied, the root now second. The zoom guard skipped results with no changes; it now checks
  every result whose document differs (`commands/zoom.ts`). Regression208.
- **Reordering identical children left a fold closed over different nodes.** The fold carry
  compared hidden content only where a text change reached the fold; with no changes it now also
  checks whether a node both snapshots hide moved (another parent or order: `movedWithin`). Not a
  full content compare: a placeholder dropped re-reads the same text as other nodes, which keeps the
  fold (Fold20). `view.test.ts`.
- **Editing a hidden carried block-id line kept its fold closed.** The fold's fingerprint
  (`hiddenContent`) had each hidden node's text but not the block-id lines it carries (`# H⏎⏎```…```⏎⏎^id`,
  folded, `^id` edited). They are in it now. `view.test.ts`.
- **Zooming into code put a `markup: decorated` caret on its opening fence.** A caret entering
  the zoom from before it went to the root line's text start, the fence for an atom. Now the payload's
  start where markup is decorated (`view/select.ts`). Regression209.
- **A deferred key's host default could leave the caret hidden or outside the zoom.** Backspace on
  the blank line after a folded node's hidden last line: the host deletes the line break, its caret at
  the end of the hidden line. The guard plays the key's plain default (`plainTextEdit`): where its caret
  would be in a fold, ourus does the edit itself, the caret at the fold's start; zoomed, where it would
  be outside the zoom range (Delete on the blank line ending the zoom, which joins the next block),
  refused `outside-zoom`. Its Cmd-Backspace also misread a caret past the final line break
  as on the line before (`lineAt`), modelling the deletion of that whole line. Regression210.
- [B213] **Copy and drag at a caret a fold hides gave it back hidden.** The commands that write nothing
  skipped putting their selection out of what the view hides, which every other result gets
  (`settled`, `zoom.ts`); the caret goes to the fold's row now. [B220] **Fold commands given a node that
  doesn't exist succeeded**, the id dropped; they refuse it `no-such-node` now, the root too, as the
  other node commands do. `view.test.ts`.
- [B218] **A fold's fingerprint missed a hidden node reparented, and could collide.** `hiddenContent` was a
  string of ids, kinds and texts joined with control characters: no parent (`- b` indented under `- a`,
  both hidden, kept the fold closed), and a text holding the seam's characters could make two different
  contents one string. It is records now, a parent each, compared field by field (`sameHidden`).
  `view.test.ts`.

### Copy, cut and paste

- **Cut then Paste of a paragraph above fenced code pasted it into the code.** With nothing above,
  a cut's caret went to the start of the text after, which for fenced code, `$$` or `%%` is the
  payload's first line, so `first⏎⏎```⏎code⏎```` cut and pasted back gave `` ```⏎first⏎code ``. Where
  markup is text it now goes before the opening delimiter (`delete-subtree.ts`), where paste is the
  host's text insert, the paragraph above the block again; the Obsidian editors and SilverBullet put
  the caret there too. Indented code keeps its caret: text put before it would continue as a lazy line.
  Regression211.
- **Copy of a quote at the caret dropped its first line's `>`.** `> a quote⏎> more` copied
  `a quote⏎more` (`quotes: text`) or `a quote⏎> more` (`atom`), so paste unquoted it. `markdownStart`
  started a node whose text is a quote past its line's prefix; it now starts at the quote's `>` where
  the quote is the node's own text (`textQuote`), as for a quote node or a callout (Copy8).
  Regression212, 213.
- **Paste over the only child of a quote with no text of its own was refused `no-such-node`.**
  `>⏎> «a»`, `quotes: container`: deleting the selected paragraph removed the quote too, and the paste
  went under the quote's old id. It now goes where the outermost node that went was
  (`subtrees.ts`).
- **An HTML image whose alt text has a line break pasted as a block** below a heading rather
  than inline at the caret: the converter kept the attribute's line break in `![one⏎two](x)`, which
  made the clipboard several lines. Its whitespace is one space now, as a browser shows it
  (`html-parser.ts`). `commands.test.ts`.
- [B21] **Paste at the start of a table, a rule, HTML or a footnote was refused or the host's**, where
  a cut of the node above leaves the caret. Nothing pasted can be those blocks' lines, so the nodes
  go as at a text's start (`slotAt`, `paste.ts`): after the block (`pasteAtTextStart: after`, the
  default) or before it (`before`, which puts a cut back). Indented code's text start is still code.
  Regression231.
- [B26] **Indented code copied with ourus and pasted into an empty note became a paragraph.** Paste
  takes the indentation a clipboard's lines share off (a nested item copied from a text editor pastes
  at its depth), which took indented code's four columns. ourus's own clipboard (its `text/markdown`,
  its HTML marked `<!-- ourus -->`) is written out of its containers already: its indentation is kept
  (`clipboardSource`, `clipboard.ts`). Other clipboards are read as before. `commands.test.ts`.
- **HTML conversion changed link and image destinations.** `&amp;copy;` decoded to `&copy;`,
  which Markdown decoded again (`©`); a destination ending in a backslash escaped the closing `)`; a
  line break in one was written between `<` and `>`, where none is allowed. `destination`
  (`html-parser.ts`) escapes an entity-like `&`, a last backslash, and percent-encodes control
  characters. `commands.test.ts`.
- **HTML conversion details.** A checkbox `type` in another case
  (`CHECKBOX`) is a task's checkbox (HTML's values aren't case sensitive); a link's or an image's
  `title` is kept (`[a](x "tip")`); an image without a source is its alternative text, as a browser
  shows it, not nothing; a `javascript:` link in any case, or after blanks, is its text (the filter
  compared it case sensitively); a code block of one empty line keeps it (`blankLine`: the last line
  break taken off left nothing to tell it from an empty block). `commands.test.ts`.
- **More HTML conversion details.** A `pre`'s script or style was copied
  into the code (`textContent` now skips what the block walk skips); a `pre` of several `code`
  elements kept only the first (one is the code, several the `pre` whole, the text between them too);
  a `language-` class on an ancestor (a page's `language-en`) overrode GitHub's `highlight-source-`
  around the code (generic classes count on the `pre` and `code` only); a run of underscores at a
  word's edge was escaped in part, `\__a\__` still emphasis (the whole run now). `commands.test.ts`.
- **HTML formatting.** The converter now knows which formattings are
  open around what it converts (`#format`, `html-parser.ts`): one already open adds no delimiters
  (`<b>a<b>b</b>c</b>` was `**a**b**c**`, the middle plain), and an explicit `normal` inside an open
  bold or italic closes it around itself (`**a**b**c**`, where it was bold throughout). A property
  declared twice in a style is its last declaration's. Line breaks and no-break spaces at a
  formatting's edges go outside its delimiters, which they kept from opening or closing. A code span
  of spaces alone is kept as one. And a style sets formatting on any element: `<em
  style="font-weight:bold">` is bold too, `<em style="font-style:normal">` no italic, and a block's
  style (`<p style="font-weight:bold">`) its content's (`styledDown`). A `<br>` in inline code was a
  space: a code span a line now, no code span holding a line break. `commands.test.ts`.
- **Tables.** A cell spanning columns or rows put what followed under the wrong heads:
  its text goes in its first column and row now, the ones it spans empty (a head cell's alignment
  for each). A code span with a backslash before a pipe can't be a cell's code (the table's `\|`
  makes an even run, splitting the cell): its text, escaped, keeps the cell whole.
- **List counters.** An item's `value`, a reversed list and numbers past nine digits were
  renumbered from the first: a run numbered up by one is a list, a list of its own where a number
  breaks it (adjacent lists alternate their delimiter, as above), and a number no marker can write
  (below zero, past 999,999,999) puts its items in a bulleted list.
- **Word lists.** Paragraphs of two Word lists (`mso-list:l0`, `l1`) joined one list of
  the first one's kind: a list's run ends where its id changes, and items of another kind start
  another list. A glyph span (`mso-list:Ignore`) was dropped anywhere, a visible `1.` lost; only in
  a list made of Word's paragraphs now.
- **Footnotes as GFM renders them** (ourus's own HTML, GitHub's) pasted as a numbered link and
  an ordered list: the reference is `[^label]` again, the section its definitions, the
  back-references no text. Ourus's HTML of a document with footnotes reads back as that document.
- **A clipboard of HTML alone pasted into code wrote its Markdown** (`**x**`) as code: with no
  `text/plain`, its plain text is now derived (`MdHtmlParser.plainText`, as a browser's `innerText`),
  which code takes.
- **Obsidian: a tag or a wikilink in a link's text rendered an anchor in the anchor**, which a
  browser breaks apart: in a link (the renderer's `inLink`) they render as their text.
  `commands.test.ts` for all of these.
- **HTML lists and tables.** Two lists of a kind one after the other were written
  as one (`- a⏎⏎- b`): the second takes the other bullet or delimiter now (`* b`, `1) b`, `writeAll`).
  A table's caption, which a Markdown table has no place for, is a paragraph before it. A cell's
  paragraphs or list items were run together (`ab`): they are set off by a space. `commands.test.ts`.
- [B274] **A paste after a folded item holding a quote threw** (`quotes: container`, `- > a⏎  > b⏎┃⏎c`,
  the item folded). It took the item, with no text of its own, for an empty one to fill, and the writer
  dereferenced the origin of the item it made. Folded, it is a row like any other: the nodes go after
  its subtree, the fold kept (`paste.ts`), and the writer asks for an origin before reading it.
  Regression271.
- [B194, B195] **Ourus's own clipboard was read as a stranger's where it mattered.** Its mark counted only
  beside a `text/markdown`, and `pasteAt` and the drag map didn't pass it on: indented code dropped became
  a paragraph, and a copied node pasted into the text where a host kept only `text/plain` and the HTML.
  The mark is read on every branch now (`clipboardMarkdown`), and passed. The fence heuristic, which puts
  back a fence copied out of a container, ran on ourus's own copies too, whose last line of code it took
  for a closer (it stops at them now), and took a run shorter than the opening one for it. `commands.test.ts`.
- [B291, B292] **A drag's deletion wasn't the cut it is documented as.** Over a subtree selection it
  went to the host, and zoomed into the root with the root selected it was refused, where cut takes the
  roots out (`deleteByDrag` wasn't routed with the deletion keys, `subtrees.ts`, nor allowed to remove
  the zoom root, `zoom.ts`). Where the host does it, over part of a text, neither guard checked it,
  `plainTextEdit` having no edit for it: `p ^abc` decorated, `^a` dragged, lost the block id; a drag that
  left the zoom was the host's. It is the selection deleted now, in every host, so both guards check it.
  `commands.test.ts`.
- [B317 to B322] **Six HTML conversion details.** A line break right after `<pre>`, which HTML drops,
  was a first line of code (one inside `<code>` is kept). A link with `href=""`, the page itself, was
  plain text, the fragment then read as unformatted: only no `href` is none now. Text with a `#` where
  an Obsidian tag starts became a tag: escaped now. A table of no cells lost its caption, or wrote a
  grid of no columns, pipes on the page: its caption alone now. HTML nested past the depth limit ran its
  paragraphs together (`onetwo`): its text is taken as `plainText` takes it, blocks apart, each line
  escaped. Adjacent formatting spread its children into one `push`, past the limit on arguments at
  130,000: one at a time now. `commands.test.ts`.
- [B327] **A paste of nodes over a selection from a text's start went after what the selection left.**
  `«abc»⏎def`, pasting a list: `def⏎⏎- x⏎- y`. Over a selection ourus pastes, then deletes it, or the other
  way, and either leaves the caret at a text's start, where `pasteAtTextStart: after` sends nodes after
  the node. A paste over a selection from a text's start is in place of it now: before the node
  (`slotAt`'s `before`). The full run moved 400 or so pastes over selections so, read in samples, each
  the nodes where the selection was; `inverse` gained 31 round trips, cuts pasted back. A padded line
  and an empty item after it still fail to write (B327 kept for that). `commands.test.ts`.
- [B302] **A structured paste emptied code's lines of blanks**, silently: every such line went blank
  before the clipboard was read, ourus's own too. In code, math, a comment or HTML they are the block's
  now, kept (`clipboardSource`, `VERBATIM` from `copy.ts`). Its first version let those lines count in
  the indentation a fence copied out of a container shares, so the dedent it needed was skipped and its
  closing fence became code (a review caught it): they don't count now. `commands.test.ts`.
- [B333, B334] **An image's alt text in HTML conversion**: with no source it wasn't held from the
  converter's own marks (private-use characters in it replaced); and `plainText` left it out. `commands.test.ts`.
- [B304] **A table pasted into an empty item was refused**, the user's: `- ┃` pasting `| a |⏎| --- |⏎| b |`,
  `the atom would be read as the text of the item above it, which has none`. The paste made an item with
  no text and the table its first block, on the marker's line, which the writer rightly took for the
  item's text. The table is the item's text now, as code is (`- | a |⏎  | --- |⏎  | b |`), set on the
  item itself: its id, marker and number, children, blank lines and a zoom on it kept (the first version
  made a new item in its place, which lost them: `3.` became `-`, a zoomed root went; a review caught
  it). A checkbox an empty task had goes, a task's text being prose. The full run then found one
  shape the first version wrote by dropping those blank lines: `- ⏎⏎⏎  - c`, whose `  - c` is no child
  of the empty item but reads as the table's item's once it has text. It wasn't refused, as this entry
  first said: the seam check for an empty item given text (`filled`, `draft.ts`) counted only prose, so
  the table's atom got past it and the paste failed to write (CI's differential run, against the commit
  before, found it). It counts any text now, and the paste is refused, as plain paste's is. It missed an
  empty item given its first child too, Enter zoomed into it (`- ┃⟦zoomed⟧⏎⏎  - c`, the view's pass on
  the new case's start), refused now as well. `commands.test.ts`, Regression291, 292.

### Block ids

- **A paste of several lines right at a block id's `^` glued the id to the last line.** `Final
  ┃^blk`, pasting `a⏎b`: deferred as "in markup", the host wrote `b^blk`, no id any more (Obsidian
  flavor, `markup: text`). Typing and one-line pastes there were already placed before the id. Both
  paste paths now take a caret at the `^` as in the text there (`endingBlockIdAt`, `paste-plain.ts`),
  with a blank after what is pasted: `Final a⏎b ^blk`. Regression214.
- **Paste at the end of a line that ends in a block id was the host's.** `Final ^blk┃` pasting a
  list deferred, and the host wrote `^blk- x`. A caret right after the id is now at the text's end
  before it, as the commands' README says it is: blocks go after the node, as without an id. Typing
  there stays the host's under `markup: text` (the id is text the user edits). The text editors (the
  Obsidian ones, SilverBullet) paste raw text and break the id in both cases. Regression215.
- **A plain paste of several paragraphs into a text a block id ends returned a caret past the
  end** (a CodeMirror host throws), and moved a pasted id onto a middle paragraph. Splitting at each
  paragraph break, `plainLines` kept the closing frame with the upper part every time: right for the
  node's own id at the first split, wrong after it, where what ends the text is the paste's last line.
  Once now. And the rest of the line the paste lands in (`Fina┃l`) was glued after the paste's last
  line, after its block id: `y ^zzzl`, or `Final ^blkl` for a duplicate the paste drops, no id. It
  goes before that id now, which ends the line still (`yl ^zzz`; a duplicate dropped, `Finall`).
  `block-ids.test.ts`, Regression261.
- **`addBlockId` failed `write-failed` on a text ending in a no-break space.** The blank before
  `^` was tested with `/\s$/`, which takes U+00A0, U+3000 and friends; Markdown and Obsidian need a
  space or a tab, so `para⍽^abc` named nothing. Now `[ \t]`, there and in the same tests of typing
  before a glued id (`placedText`) and the writer's join (`draft.ts`). `block-ids.test.ts`.
- **Backspace joining an item whose block id is a lazy line into a callout title failed to
  write.** `> [!note] T⏎> - ┃q⏎^id`: the single-line-title guard looked at the text's body, which
  leaves out the id's frame and its line break. It now asks the text past its start, carried lines
  too: refused `not-expressible`, as for any two-line text.
- **Duplicating a GFM quote atom ending in literal `^x` put the copy's caret before it.** The
  caret at `^x` was taken before it, as before an Obsidian block id, whatever the flavor
  (`commandAt`, `commands/index.ts`), and the copy's caret was clamped to the text without it
  (`duplicate-subtree.ts`). Both only where the flavor has block ids now. `block-ids.test.ts`.
- **A lone block id moved or joined after a footnote definition failed to write.** `^x⏎[^a]:`
  moved down, or `[^1]: a footnote⏎⏎Final line ^blk` with `deleteSoftLineBackward` at the second
  line's start: the writer attached the id to the definition, whose own blocks read the id's line as
  their text, not as a carried id. A footnote definition carries no lone id now: refused
  `not-expressible` (`#attachIn`, `draft.ts`). `block-ids.test.ts`.
- **A paragraph lazy after an item's reference definition couldn't be rewritten** (`- [a]:u⏎ x y`:
  Enter, Shift-Enter, a paste, deleteSoftLineBackward in it, removing its `^block` in Obsidian, all
  `write-failed`, `id 2, read as 3`). Written at the item's content column, it kept the space its
  lazy line started with past that prefix, which put its start a column past where it reads back,
  so it was a new node. That space goes now (`spell`, `writer/write.ts`). Regression266,
  `block-ids.test.ts`.
- [B272] **A plain paste of paragraphs ending in a line break, at a text's end before its block id, put
  the caret past the text.** `Final line┃ ^blk`, pasting `a⏎⏎b⏎`: `Final linea⏎ ^blk⏎⏎b`, the caret 21 of
  20, on which a CodeMirror host throws. Regression261's fix took a clipboard without that last line
  break. That line goes now (`plainLines`), as where nothing closes the text: `Final linea ^blk⏎⏎b`.
  Found by 100,000 sessions on notes with no final line break. Regression272, `block-ids.test.ts`.
- [B277] **The same with blanks for that line break**: `a┃ ^id`, pasting `a⏎⏎b␠`: `aa␠␠^id⏎⏎b`, the caret
  11 of 10. The paste's trailing blank ran into the block id's frame (`␠^id`), which the split leaves with
  the first paragraph, and the caret was counted past it. Before a closing frame, the last line's
  blanks go too now (a paragraph's trailing blanks are no text), and a last line of blanks counts as
  the line break B272's rule drops: `a⏎⏎b␠`, `a⏎⏎b→`, `a⏎⏎b␠⏎` and `a⏎⏎␠␠` all paste as their
  blankless forms. Pasted after the id (`a ^id┃`) the caret was past the text too (11 of 10); not now.
  Without a block id the blanks are the host's text, kept. `block-ids.test.ts`.
- [B221] **Pasting two block ids on a line, the last one a name the note holds, threw.** `^b`, pasting
  `- ^a ^b`: `overlapping changes`, out of `executeCommand`. With the duplicate dropped, the paste's two
  marks mapped to one place, and the same mark was removed twice. They are told apart now
  (`markedPaste`). `block-ids.test.ts`.
- [B222] **`removeBlockId` with a node and no name removed the selection's block id.** `a ^x⏎⏎b ^y`, node 2,
  the caret in `a`: `^x` went, silently, and any link to it. It reads the node it is given now, as
  `addBlockId` does, `no-such-node` for one the note lacks. `block-ids.test.ts`.
- [B307] **Typing a block id's name was refused where a step of it is another id's.** `- abc ^id⏎- def
  ^i┃`, `markup: text`, typing `d`: `^id would be written twice`. The host's edit is in that id's own
  markup, which the guard allows (`edited`), but the check for a name written twice came first. The
  edited id isn't counted there now, its range mapped through the edit: what becomes of it is the
  user's. A name typed outside any id's markup is still refused. A paste there the same: the full run's
  one moved outcome, `x` pasted over the `y` of `^y` where the note has `^x`, refused before, the
  host's now. `block-ids.test.ts`.

### Quotes and callouts

- **Backspace at a callout that is a list item's first block failed to write.** `- ┃> [!note]
  Title⏎  > body`: the command (Quote57's: `[!type]` goes, the title the quote's first paragraph) was
  right, but the writer, for a quote whose title went (`drafted`, `writer/write.ts`), gave its `>` to
  its first child's line except on an item's marker line, and the item took that line as copied as it
  was. Both now treat it as a line written anew: the item's marker a lead over it, the quote's `>` its
  first child's. Took the sweep's `deleteContentBackward: write-failed` 12 → 0 and
  `deleteSoftLineBackward` 13 → 1, the sessions' Backspace group 2 → 0. Regression216.
- **Enter or Shift-Enter at the end of a quote's first line, the quote an item's text, failed to
  write where a blank line followed the item.** `- > quote┃⏎  > more⏎⏎x`: the quote becomes two
  paragraphs and the item's text none (`quoteSplit`, `shift-enter.ts`), but the item kept its gap,
  which a node with no text of its own can't have; it goes to the quote's last paragraph now. Took the
  sweep's `enter` and `shiftEnter: write-failed` groups, 12 → 0 each, and the sessions' Enter group
  2 → 0. Regression217.
- **Shift-Enter and Backspace on a quote's blank line written `>` were the host's.** The writer writes a
  quote's blank lines as a bare `>`; a caret at their end, after the `>`, wasn't at the text's column
  (`atTextColumn`, past `> `), so the keys deferred, and a host's plain line break ended the quote
  (found by the sessions report: Shift-Enter there, then typing, broke the next move). Right after a
  quoted blank line's last `>` is the text's column now. Shift-Enter adds a quoted blank line, as the
  four Obsidian editors do (Emacs and SilverBullet end the quote). Regression218.
- **Enter in a quoted list, `quotes: atom` (`enterInQuote: line`), didn't know tasks or
  nesting.** The list-marker pattern stopped before a checkbox: a task's new line was a plain item and
  an empty task (`> - [ ] `) no empty item. And an empty nested item left the list. Now the checkbox is
  part of the marker (the new one `[ ] ` under `enterTask: continue`), and an empty nested item becomes
  its parent's sibling (`parentItemLine`, `quote.ts`), as Obsidian and SilverBullet do.
  Regression226, 227.
- **The quote-atom joins skipped the rules the prose joins have** (`quotes: atom`).
  Backspace joining a two-line quote into an ATX heading escaped the heading into a paragraph:
  refused now, as for a two-line paragraph. Delete before a heading joined the heading into the quote
  its marks go first now (`headingEditing: text`, the default; `headingMarksGo`, `delete.ts`).
  Delete before a task joined its checkbox as text: the text joins without it, and an empty task
  just goes (`withoutOwnMarkup`, `quote.ts`). Regression228–230.
- **Enter in a quoted numbered list left the numbers after it** (two items `2.`): the items after
  it in its list, while they count on, are one up each now (`renumberedAfter`), as Obsidian and
  SilverBullet do. Regression243.
- **Enter or Shift-Enter at the start of a quote's later line (`> q⏎> ┃r`) ejected the line**,
  two blank lines before it, a later quoted line made `\> s` text. Past the line's `> ` it was taken
  for a line start to break a paragraph at; in a quote's text it is the quote's two paragraphs now,
  a quoted blank line between, the caret staying with the line (`quoteSplit`, as at a line's end).
  Backspace there then joins the two paragraphs, as any paragraph join (`> qr`), not the line back.
  The second paragraph's blanks before its text (`>␠␠r`) are padding, none of its text: a moved
  paragraph padded so can't be shifted (the writer's "lines aren't indented as far as its first", as
  at the last commit), which the sessions report met. Regression244.
- **Enter at the end of a one-paragraph quote with no final line break added one**: the writer
  keeps a line ending after a blank line it writes anew (no line without it), and took the quoted
  empty line `> ` for one. A last line with anything on it, a `>`, ends the text as the old one did
  (`lastLineBlank`). `commands.test.ts`.
- **Enter in a padded quoted item (`> -  lis┃t⏎>   last`) failed to write**: its continuation,
  lazy for the item (short of its column), was kept lazy and copied as it was, which in the new item
  (`- t`, two columns) is the item's own indentation. A line was taken for lazy whenever the new prefix
  had a `>`; now only where it has fewer `>`s than that prefix (lazy for a quote), else by its column
  (`write.ts`, `continuation`). Regression245.
- **Enter before an indented quote atom (` ┃> > q`)** wrote a line of it: past its indentation
  is its start (`lineInQuote`, `splitQuote`; Shift-Enter there is refused as at offset 0). Regression246.
- **Enter or Shift-Enter in an indented quoted list's heading item, a paragraph after the quote,
  failed**: an atom's later lines were read with its first line's prefix pieces put before them, its
  own `>` and list among them (`    >   * a`), so the seam check saw no lazy continuation and set no
  blank line before the paragraph. An atom's own containers' pieces are its text's (`#ownLines`).
  Regression247.
- **Enter in `>0. - h` failed**: a new item lined up with its sibling took the line's prefix
  with its marker as spaces, `>   `; with no blank after the `>` the quote takes one where the new line
  has it, a column short. A `>` followed by text gets a space first (`linedUp`), but for a new first
  item written over its parent's marker line, as that line has it (the heavy run's view and inverse
  suites caught the first version failing there). `commands.test.ts` (a spec case would put
  `>0. - h⏎>    - ` in the heavy corpus, where Backspace, move, delete and cut fail to write on it,
  as at the last commit: not done).
- **Shift-Enter in a quote atom's nested quote or list wrote `> ` alone**, the new line out of
  what the caret's was in (and in the reported shape, a node after it absorbed). The new line takes the
  caret's line's prefix, its nested `>`s, its items' markers as spaces (`linesInQuote`; `> ` where that
  doesn't write), as Obsidian does (the probe: `> - a┃` gives `>   ┃`, `> > a┃` gives `> > ┃`); but
  `> ` still for a prefix with a tab past a `>`'s own, a `>` with nothing blank after it, or an empty
  item's marker ending the line, where the block outliners' SxS verdicts went from agreeing to not.
  Regression248.
- **A join into a GFM or CommonMark quote atom ending in `^x` went in before it**: the join
  asked the quote's block ids as Obsidian has them in every flavor; only where the flavor has block
  ids now (`joinIntoQuote`). Regression255.
- **Indenting an empty quote atom that carries a block id (`>⏎^id`) failed to write**: as an
  item's text, `- >`, the id's line below is the item's, no quote line to carry it. Refused now
  (`not-expressible`); a quote with text indents as before (`- > q⏎  ^id`). `commands.test.ts`.

### Headings and rules

- **The WorkFlowy heading split failed on a title starting with a literal `#`** (`# \# ┃Plan`):
  the text above it kept its heading type, its `#` unescaped. It is a paragraph's text now, escaped
  as the writer escapes one (`retyped`). Regression249.
- **Unwrapping a task whose text goes on in a `- ` line failed**: the text without its checkbox
  read alone as a setext heading, and kept that type in a paragraph. A paragraph's text now, the
  `- ` escaped. Regression250.
- **An item moved into a list of another bullet, its text a run of that bullet's character
  (`+ --` into a `-` list), read as a rule**: across a heading it failed to write, in its section it was
  refused. The seam check now reads it with its new bullet (`#keepsKind`, for items placed in a list
  too), and its text is escaped as a new item's is: `- \--`. Regression251.
- **Indenting a setext H1 under a note's first `---` (Obsidian) turned the note into front
  matter**: the H2's `---` underline closed it. A blank line goes before the first `---`, as for a rule
  the draft writes below it (`#frontmatter`). Regression252.
- No longer fail to write (the Shift-Enter, the moves, the duplicate apply).
- **Enter after a blank in an ATX heading with closing `#`s escaped the closing sequence.** `# abc
  ┃title #` gave `# abc  \#`, a `#` in the title: the blank kept above made the closing frame `  #`,
  and the writer, taking a closing sequence unlike the read one for a join's, escaped it. It compares
  the `#`s now, not the blanks before them (`#escape`, `draft.ts`): `# abc  #`. Found sampling the
  inverse report's `enter, deleteContentBackward: text`. Regression260.

### Code blocks

- **A line break typed at the start of an opening fence failed to write** (`insertText "\n"`, a
  host sending Enter as text, or a text replacement). Where the block isn't at the top level (in a
  heading's section, in an item) the edit went into the code's text, which can't start with a blank
  line. It is now the blank line above the block it is (`lineBreakAtOpening`, `code.ts`), the caret
  staying with the block; in an item the block stays the item's (Enter there splits the item). The
  sweep's whole `insertText "\n": write-failed` group (28 runs) went with it. `commands.test.ts`
  (the spec has no notation for a typed line break).
- **Backspace or Delete taking away an empty code block's fence deleted the list it held.**
  With `listParent: block` the code owns the list after it; `removeEmptyBlock` (`code.ts`) removed the
  block with its subtree. Its children take its place now (`dissolve`).
- **Copy and cut emptied a code block's blank lines.** `markdownOf` writes a blank line it takes
  whole as empty; in fenced or indented code, math, a comment or HTML its spaces are the payload's,
  and a cut then lost them for good. Lines of those blocks are kept as they are (`doc/copy.ts`).
  `commands.test.ts`.
- **Indenting code into a quote failed to write a code line of spaces** (`>⏎```⏎␠␠⏎```` Tab:
  `text "  ", read as ""`). Under a shift that adds or takes a quote prefix, the writer's blank-line
  path trimmed the line, a code line's spaces included (`write.ts`); they are kept past the new
  prefix now. `commands.test.ts`.
- **Backspace in a closing fence longer than its opening one was refused**: both runs shortened,
  the opening to two backticks. Where the closing run is the longer, it alone shortens.
  Regression253.
- **Unmaking an empty block's opening fence pulled the paragraph after its list into its line**
  (`listParent: block`): the block's next sibling isn't below it where it has a list; nothing joins
  then. Regression254.
- **Backspace at a fence after HTML a blank line ends (`<div⏎⏎┃```)** removed the blank line,
  the fence a line of the HTML, a write failure: refused now (`not-expressible`), where the HTML
  would take the line in. No longer fails to write: refused, the code would join the item.
- **Indented code copied out of a quote whose `>` took part of a tab (`>→    code`) changed its
  payload**: the tab copied at column 0 spans four columns, not the three it had left. The rest of
  such a tab is copied as spaces (`markdownOf`). `commands.test.ts`.

### Moves and deletions

- [B52] **A quote paragraph whose first line is one space further in (`>  b`) failed to write when
  moved up onto an item's marker line.** `- > a⏎  >⏎  >  ┃b`, Alt-Up. There were two checks. The
  marker written over the line refused any blank after it, which would be the item's padding; after
  a quote's `>` it is the quote content's, as it was. And the re-indent refused a line with nothing
  past its cut, whose text is written apart. Under `indentUnit: tab`, where the moved line spells
  the `>`'s space with a tab (`>→ e`), the marker is written over a tab that spans the same columns
  (`writeOver`); that also plays back Quote81 and Quote85 with tabs (`tabs.test.ts`'s known list).
  `commands.test.ts`. A move of the paragraph before it out of the quote still fails (open).
- **Shift-Enter at the start of a padded item's text, a loose paragraph under it, failed to write**
  (`-  ┃a⏎⏎     b`: `id 2, read as 3`). The text goes below the marker, one column past it, and the
  item's content column narrows by the padding; the paragraph's line, copied as it was, starts its
  content that much sooner, where it is named now (`headStart`, `narrowedItems`). Regression267;
  the text deleted to its marker (`- ┃`) too, Regression268.
- **Indenting or outdenting a code item whose blank line holds spaces of its code failed to write**
  (`- a⏎- ```js⏎␠␠␠⏎  ```` indented: the one space past the item's columns lost). A blank line in code
  is copied as it was, never wider; one with spaces past its container's content start now shifts as
  the code's other lines do (`writer/write.ts`). Regression264.
- **An item whose marker shares its line with its quote couldn't be moved across 9/10** (`9. > q⏎   >
  r⏎10. b`, Alt-Down, `quotes: container`: refused, the marker's line "which goes"). A moved item's
  renumbered marker of another width is written as a renumbered item's is where nothing moves: that line
  and its later ones as many columns wider or narrower (`widened`), the new marker over the old one and
  the spaces it gained or left (`drafted`). Regression265. Dropped first under the item above, nesting
  it under a shift, its quote was named one column off, past the old marker's width: its line, copied
  with the new marker, is measured through it now (`newPosition`, `lineMarkers`). `commands.test.ts`. A
  drop under it, narrowing its marker, is still refused (open).
- **A node dropped first into a quote on an item's marker line (`- > q`, `indentUnit:
  tab`), and outdenting mixed-depth roots with an empty item in a quote led by `>  `, failed to
  write.** Both were B52's two checks: the marker written over the quote's `>→`, and the re-indent of
  a line with nothing past its cut. Fixed with it; paragraph, quote, code and item drops alike.
  `commands.test.ts`.
- **A section couldn't be moved above an earlier one with the same subsections** (a section
  duplicated, renamed, moved above its original: refused `write-failed`, `id 3, read as 9`). The
  writer names a copied subtree's descendants only where its old start doesn't map through the
  changes to where it is written; the changes replaced everything from the top, and a position inside
  replaced text maps to the change's end, where the earlier subsection happened to be written. A start
  inside replaced text is no carry now (`result`, `writer/write.ts`). Regression220.
- **Deleting the last item of a loose list dropped the blank line before what follows.** The
  blank lines after the list were the deleted item's gap and went with it: a table after it then read
  as a lazy line of the item above (`write-failed`), a heading or code lost its blank line. The node
  before a run that ends its list (or its parent's children), within its parent, keeps at least those
  blank lines where a block follows; where items follow they join the list there (DeleteSubtree13); a
  run first in its parent hands them to no one (`> - a⏎>⏎> q`, `a` deleted: the quote above it has no
  blank lines of its own; the differential caught that first version). Regression221.
- **A move that put a table right after a loose list's item failed to write.** `- b⏎⏎  c⏎- d⏎⏎| a |`,
  `b` moved below `d`: the writer asks whether two siblings stay apart written next to each other
  (`#apart`) from the upper one's last lines, and took the first-line padding off a read paragraph's
  line, which there was the item's continuation (`#lastLines`, `writer/draft.ts`): `c` read as a
  paragraph of its own, the table apart from it, no blank line added, and the table's lines read as
  lazy lines of `c`. The containers' prefix is kept now. Found by the drop and move passes
  (`drops.test.ts`, `moves.test.ts`) on Regression221's start.
- **Backspace on an empty last item after a folded one failed to write**: the item's blank
  lines went to the row above, the folded item, whose own gap is between its text and its children;
  they go to what is above it in the text now, the folded one's last descendant. `commands.test.ts`.
- **Outdenting a quote's paragraph from `> a⏎>`, the `>` line with no line ending, failed**: the
  paragraph's lines were copied under the shift that takes the `>` off, its blank line with them,
  which copied so would be no line (the writer kept the `>`). Such blank lines are written anew, where
  what follows is (`moved`). `commands.test.ts`.
- No longer fails to write: refused (`not-expressible`, the paragraph would join the item above).
- **A subtree moved into a quote took the blank line after it into the quote**, the next
  quote then one with it: a read subtree is copied under its shift whole, its trailing blank lines
  with the shift's prefix (`>`). Where the prefix of what follows it differs (out of the quote), they
  are written there instead (`moved`). Indenting a paragraph with a loose list into the quote above,
  moving an item down into a GFM quote whose first line reads `[!n] T`, a quote another one
  follows. Regression256.
- **Moving an item past one whose list it then joins failed when an item after it had a
  later line that could start a block** (`1.` partly typed): the writer lines that item up (else it
  would be the other's child) and shifts no such line. Such a node is spelled where it lands, as a
  node moved into another container is (`#movedLines`, where the item before it, a node placed
  beside it or another one than it had, would take it in at its old column): indent, cut, delete and
  duplicate around it too, which failed so as at the last commit (the heavy run on the spec case
  showed them). Regression257.
- **Delete on an empty quote that was an item's text failed to write** (`- > ┃`, left by the
  host's deletion): the empty paragraph went alone, its quote and item then holding nothing, the
  item's marker line gone. It goes with the containers it is all of (`withTextlessParents`), as an
  empty paragraph goes, the caret to the text below. Regression258.

### Tasks

- **Backspace inside a checkbox took the whole checkbox where markup is decorated.** `- [x┃] task`
  gave `- task`: the caret in the task frame was taken to the text's start, before the rule that the
  character inside goes (tasks.md rule 5, as the host's Backspace does under `markup: text`). Backspace
  right after the character and Delete right before it now delete it, the brackets staying
  (`statusIn`, `backspace.ts`). Regression219.
- **Enter right after an item's leading `[x]` made a checkbox of it.** `- [x]┃y z` (no blank after
  the `]`: text) left `- [x]` above, an empty task, and Backspace back into it, as into any empty
  item, dropped the `[x]`. Enter escapes the `[` now, as ours, where the part left would read as a
  checkbox the text didn't have: `- \[x]`. The escape stays after Backspace, as one before `[` does
  (Enter48). `enter.ts`. Regression263.

### Placeholders

- **A note ending in an empty node a placeholder holds, and no final line break before, lost the
  node to the next structural edit.** `# H⏎⏎p`, Enter, expand selection, Delete; `- a`, Enter, Enter,
  expand, Shift-Tab; `- first⏎- second`, Enter, Tab, Escape, expand, Tab: each refused `write-failed`.
  The writer carried a placeholder at the old text's end only where that end was copied; a change
  reaching it (the text before deleted) dropped it, though the node stayed last, and an empty item's
  line re-indented by a shift was written anew with nothing copied at the end. Both carry it now: to
  the new text's end where the node is still last and not written anew, and through a piece of
  nothing the shift leaves at the old end (`write.ts`). `marks.test.ts`.
- **Enter or a plain paste at the end of an item whose first word was deleted failed to write**
  (`- x b⏎  - c`: Backspace over `x`, End, Enter). The space left at the text's start is held, and the
  writer, writing the text again, keeps it as text: the item's content column moves right one, and its
  children with it (`lifted`), but a new child lined up with them where they were, and a new paragraph
  was written at the old column: out of the item. Both go as far as the children now (`repadded`,
  `write.ts`). The caret stays on the held space's line, so nothing settles it first. `placeholders.test.ts`.
- **Indent of a paragraph that is a checkbox alone (`[x]`), a list after it apart, failed to
  write**: the writer asked an empty-node placeholder of `- [x]` as of an empty item, whose blank line
  would end it; but with no blank after the box the line is the item's text, which a blank line ends
  no item after (`#placeholders`, `apartChildren`). Regression242.
- [B234, B235] **A held line or paragraph left last in a note with no final line break failed to write.**
  `- t⏎- u`, Shift-Enter at `t`'s end, Alt-Down; `a⏎- b`, Enter, the list deleted from a menu. Copied, the
  held line lost its line ending to the text's end, so its placeholder sat at a piece's very end, which
  the writer's `inCopy` took for copied only at the old text's end: it read back as a blank line, or as
  no node. The new text's end counts too. `placeholders.test.ts`: the spec's buffers all end in a line
  break, so it can't draw these.
- [B273] **Settling a zoomed empty paragraph left the caret outside the zoom.** `# a⏎⏎┃◌⏎⏎# b` zoomed into the
  held paragraph, then the node selected: the caret off its line, it settled away, the zoom went to the
  heading, and nothing moved the caret into it. An empty zoom root stays now while the zoom holds it, and
  settles when the zoom leaves (`settlePlaceholders`); hosts change nothing. `placeholders.test.ts`.
- [B276] **Settling the last empty node in a zoom left the host's caret past the zoom's end.**
  `settlePlaceholders` returned no selection, and a host mapping its caret through the changes put it at
  11 of 10. It returns `selection` now, the one given (it takes a selection, or a caret as before) mapped,
  inside the zoom, where the view shows it; the session player, the model's runner and the cm6 and
  textarea demos set it. `placeholders.test.ts`. (B240, its fallback's drop, was tried by keeping the
  mark held and reverted: the text is the same, so the file reads the loss anyway, and two spec cases
  settle by that drop. Left to decide.)
- [B306] **A blank line made by Enter between blocks that touched went when the caret left it.**
  `## h┃⏎| a |`, Enter, then elsewhere: the empty paragraph settled away, its line with it, `## h⏎| a |`
  again. Where nothing set the two blocks apart, no blank line of the author's before the empty paragraph
  nor after it (those ourus writes to set it off don't count, `autoLinesOf`), its line stays, the node
  above's gap (`separates`, `writer/settle.ts`): a separator the author made. Elsewhere it goes as before,
  so no blank lines pile up; not in a list or a quote, where a blank line is structure. Obsidian and
  SilverBullet keep the line. "Something follows" is anything after it at any level (`afterSubtree`):
  its first version took a sibling, so at a section's end, before the next heading of its level, the
  line still went (a review caught it). `placeholders.test.ts`, Regression277, 277b, 277c, 278.
- [B295] **Shift-Tab failed to write after a space typed past an escape of ours**, from keys: `---`,
  Delete, Tab (`- \--`, the backslash ours), a space after it (`- \ --`), Shift-Tab: our escape went,
  leaving ` --`, which a paragraph can't start with. A backslash before a space escapes nothing; its
  mark held while anything followed. It holds while the punctuation it escapes follows it now
  (`validAuto`): typed past, the backslash is the user's, kept: `\ --`. `marks.test.ts`.
- [B238] **A deletion's held padding went where another node was held elsewhere.** Whether a deletion
  keeps a placeholder (`keptAt`) read the text twice, with that one placeholder and with none, every
  other mark dropped from both: a held paragraph elsewhere then read otherwise, the outlines differed
  for that, and the padding wasn't held. Both reads take the other marks, mapped, now. `doc.test.ts`.

### Selection

- **`deleteSubtree` of disjoint nodes by id reset a caret in a node between them.** The
  survival test took the span from the first node removed to the last; it is each one's lines now.
  `- a⏎- ┃b⏎- c`, nodes `a` and `c`: the caret stays before `b`. `view.test.ts`.
- **A structural command over a selection in a table's or a quote atom's text lost it.** Tab on
  a table with cell text selected put a caret in the paragraph after it: `selectionInText` mapped a
  range's ends in a prose text by node and offset, but in an atom by old position, which a text
  written again doesn't keep. Atoms' ends are mapped by node too, on their fences as well (an end on
  one by position, the other by node, gave a range across lines). Regression223.
- **Shift-Tab of a quoted paragraph that becomes its item's text collapsed the selection** to
  the start (`- > a«bc»d`). Both ends are mapped onto the item now, the direction kept
  (`outdent.ts`). Regression224.
- **Escape over an empty code block, then typing, wrote into its info string** (`markup:
  decorated`). A fenced block's text start, where its code is blank lines only, is its opening fence's
  end; `selectNode` now puts the caret on its first code line there (out of items and quotes, where
  that line is written without their prefix and typing at its start would leave them: not done).
  Regression225.
- [B212] **A subtree selection ending at the zoom's end read as text, and Shift-Down threw.** `# h⏎⏎a⏎⏎b⏎`
  zoomed into the heading, `a` and `b` selected upward, Shift-Down: an uncaught `TypeError`. A selection
  of nodes ends at the zoom's end there, before the line break after it, and `selectedNodes` compared
  it with the document's: the last node's selection was its own text, so copy took text, Backspace was
  the host's, and `selectNodeByCommand` dereferenced the null. `visibleSelection` had the same
  comparison: a folded last child's selection in a zoom lost its hidden lines. Both ask `viewEnd` now,
  and a closure no selection draws leaves the selection as it is. Regression269, 270, `view.test.ts`.
- [B215] **A selection over part of a node from its line's start lost that end.** Tab on `«> on»e⏎⏎q` gave
  `- > one⏎⏎q`, the selection reversed and reaching `q`: on a quote's `>`, a frame, the end followed its
  old position through the rewritten line, and `reshaped` took the larger of the two ends. A quote's `>`
  counts as markup before the text now, and the other end is the one that followed the text. Duplicate
  keeps the shape on the copy: `- one⏎«- on»e`, where the marker fell out. Regression275, 276.

### Typing and bracket pairing

- **Enter between bold's closing stars, then Backspace, left the bold broken** (`- **bold*┃*` →
  `- **bold*\*`). The split's new item `*` needs a backslash (alone it is a marker), which the writer
  marks ours (auto); the join kept it as a backslash before an inline starter. `draft.join` now drops
  a backslash of ours starting the lower text where it joins after text on the line. Roam, WorkFlowy,
  Dynalist and Tine join so. Regression237.
- **Backspace in `$$┃$$` or `%%┃%%` in GFM/CommonMark took three characters**: the empty-pair
  deletion didn't ask whether the flavor reads math or comments, as typing does. Regression238.
- **The third backtick in a one-line quote (`> ``┃`, default `quotes`) didn't close the fence**,
  the quote's lines below becoming code. The quote is made a container of the closed block
  (`openFenceInQuote`), an item's whose text it is its first block. A quote of several lines is still
  the host's (not done). Regression239.
- **`autoClose` brackets didn't pair in code, math or comments**: code went to `editInCode`
  first. `bracketInCode` pairs at a caret and wraps a selection there, as Obsidian and SilverBullet do
  (not on a fence's line, not `$`); a closer of ours there is stepped over. `commands.test.ts`.
- **`[` typed after `> [!note` (`autoClose: ['[']`, container quotes) failed to write**: its `]`
  made the paragraph a callout title. The pair isn't typed there, the host types the bracket alone.
- **An auto-closed `<!---->` couldn't be stepped over**: typing `-->` gave `<!---->-->`. The
  step-over ran in prose only; a closer of ours in a block (not a fence's) is stepped over too.
  Regression240.
- [B242, part] **A bracket `autoClose` lists didn't pair on a blank line**, in an empty note or a gap, where
  a note or a paragraph starts: no text yet, so the pair's rules never ran, and the host typed `(` alone.
  Now typed there with its closer, ours (`bracketOnBlankLine`). Not `$`: `$$` alone opens a block.
  Regression273, `commands.test.ts`. Left: a quote atom.
- [B243] **`$` paired at an item's start stopped being math.** The empty pair `- $$` would open a block, so
  the writer escapes it, `- \$┃$`, a backslash of ours; filled, it stayed, `- \$x$`, no math. Typing in the
  pair takes it out (`typedInEscapedPair`). Regression274.

### Settings

- **The child-protecting settings held on the prose joins only.** `joinWithChildren:
  refuse` didn't hold for an item whose text is a quote or code joining up (`joinQuoteUp`,
  `joinCodeItemUp`), nor for a text joining an empty item above (the shortcut before the check), and
  `emptyItemWithChildren: refuse` didn't hold for an empty item going into a quote above
  (`joinIntoQuote`). One check now (`childrenRefused`, util.ts: refused where the children would be
  lifted, go among the ones the node above has, or down a level), on each path. Regression232, 233, 235.
- **`backspaceAtItemStart: logseq` skipped the number on quote and code items**: their joins ran
  before it. `unnumberItem` (now in util.ts) takes any text, the caret where it was. Regression234.
- **A paste over selected whole nodes ignored `quirkPasteCaret`**: the route set the caret at
  the last pasted node's end itself. It follows the quirk now (`roam`: the first's end, `athens`: its
  start). Regression236.
- **Expand selection could shrink the selection**: `p«⏎⏎»q` gave `p` and one line break, a
  node's range ending before the blank lines after it. A rung must hold both ends of the selection
  now, else the next is taken. Regression241.

### Performance

- **A pickup, expanding a selection and deleting a selection were quadratic in a wide
  list.** On 8,000 items, a drag's pickup took 1.8 s, `expandSelection` over the whole list 0.35 s,
  `deleteSubtree` of it 0.75 s. Each asked every node against every other: `moveRefused` filtered the
  parent's whole child list for each place the pickup offers (now `nextSibling`, walked from `after`),
  `expandSelection`'s rung test and `deleteSubtree`'s "given with an ancestor" filter compared node
  pairs (now an id set and an ancestor walk); and `OurusNode.children`, a getter, checked every child
  each time it was asked, which a pickup does for each place (it makes them once now). Now 34 ms,
  9 ms and 26 ms.
  `commands.test.ts` (the 8,000-to-2,000 ratio, as the other scaling tests).
- **A clipboard of many blank lines and a word froze paste** (200,000: 24 s). Not the leading
  lines' `shift()` the report named (gone too, one slice now) but the inline test's
  `/[\r\n][ \t\r\n]*$/`, which backtracks quadratically over a run of line breaks not at the end; it
  is a scan from the end now. 16 ms. **A run of adjacent formatting elements was quadratic**
  (`<b>a</b>` × 30,000: 1.75 s): `merged` copied the accumulated children for each one; the run's list is
  its own now, added to. 60 ms. `commands.test.ts`.
- [B261, B262] **Plain paste of many lines was quadratic.** Each list-looking line needs an escape, and
  each escape read all the lines again: 1,600 lines of `- x` took 3.1 s, 3,200 took 11.9 s. Past 64
  lines they are read in windows now (`windowEscapes`, `readback.ts`): a line's staying a paragraph's
  depends on the lines around it, and the read of the whole that follows still decides, the windows only
  finding what it would. 0.3 s and 0.7 s; 11,000 random clipboards gave the same answer with windows and
  without. `escapeParagraph`'s bookkeeping goes by line. Leading blank lines were `shift()`ed one by one
  in `plainLines` (240,000: 4.2 s), one count now. `commands.test.ts`. Past that the writer's own
  escaping shows (B275).
- [B281] **A flat paste of 130,000 items failed to write**, as "nesting deeper than the commands go":
  the draft spread a run's nodes into one `push` or `splice`, past JavaScript's limit on a call's
  arguments, and `executeCommand` reports that `RangeError` as a stack overflow. Runs go in bounded now
  (`spliceIn`, `draft.ts`). Behind it was a quadratic step it had hidden by failing in 0.7 s: each new
  item looked for the item it lines up with by walking past every new item beside it (`near` in
  `created`, `write.ts`), 8 s for 16,000. Those are found once for each parent now (`nearItems`):
  16,000 items 0.3 s, 130,000 about 6 s. `commands.test.ts` (`spliceIn` at 200,000, the paste's
  scaling).
- [B282, B283, B284] **Three reads were quadratic in their input**, 8 times the input taking 37 to 90
  times as long. Each `^` of a paragraph looked for the block id ending it from the text's end again
  (`blockIdRule`: once a text now); each text node between entities searched the rest of the whole text
  for an email's `@` (`emailRule`: within the node now); each paragraph of a footnote listed its
  definition's blocks to find the last (from the end now). `pathological.test.ts`.
- [B324] **Taking held spaces out of a text was quadratic**: one `splice` each, each remapping every mark
  left (8 times the spaces, 40 times as long). One pass now, the spaces taken out as one list of changes
  (`withoutHeldSpaces`). `doc/text.test.ts`.

### Crashes

- **`deleteSubtree` of the last node with the caret past the final line break threw** ("an anchor
  in node 1, which the draft removed"). With explicit `nodes`, a caret past the run's range counted as
  outside it and was kept in the removed node. Where nothing follows the run, its range now runs to
  the text's end. `view.test.ts`.

### API and line endings

- **A text given whole (`update({text})`, `withDoc`) lost the ids of untouched nodes between two
  edits.** `diffLines` made one change from the first differing line to the last, so a file watcher's
  update editing `# A` and `# C` re-read `# B` as new: its id, zoom and folds gone. It now keeps the lines
  the two texts have in common in order (a line diff, Myers', 256 edits at most, past that one change as
  before), one change per run between them. The writer's own fallback for reordered pieces keeps the
  single change (`span`). `text.test.ts`; Fold16's text-given-whole check now expects `b` kept.
- **The model kept caller-owned values, and validation let some through.**
  `withConfig({bullet: undefined})` reset the option to its default (an undefined option is now absent,
  as in `OurusConfig.of`); `MarkSet.of` and `ChangeSet.of` kept the caller's array and change objects, and
  the prose and atom constructors their block-id line records (now copied; the records frozen, a frozen
  list taken as it is); `autoClose: [undefined]` or a holed list passed (`listValue` tests by index now).
  `config.test.ts`, `text.test.ts`, `doc/text.test.ts`.
- **A CRLF typed in code in a container failed to write**: the payload's lines are LF, as the
  parser reads them; a CRLF or lone CR inserted is one now (`editInCode`). **`- - a⏎(CR)  ⏎`: Enter,
  duplicate and outdent failed** with a blank line lost: dropping the blank line's spaces put the lone CR
  before its LF, one CRLF. `finish` repaired that seam only where one side was newly written; where both
  are copied, the CR is written as an LF now. **The block-id guard took a lone CR for no line
  end** and refused a soft Backspace in a later block as losing an earlier `^id`. `commands.test.ts`.
- **`> ` × 8,000 on one line overflowed the stack reading it**: `assignIds` walked the outline
  recursively, the rest of reading iteratively. Its walks are one iterative preorder now
  (`outline.ts`). A command on such a document can still recurse past the stack (the draft opens a
  path recursively): `executeCommand` returns that as `write-failed`, as the writer's own check does,
  rather than throwing. **HTML nested past the stack threw in paste** (`<span>` × 1,500): its
  conversion recurses through blocks and inlines alike, so a page nested past 512 elements converts
  as its text alone, one paragraph (`textContent` iterative). `outline.test.ts`, `commands.test.ts`.
- [B230] **The host's default edit had two definitions, and the zoom's took half a CRLF.** The zoom and fold
  guard simulated a key the host does by deleting one code unit, so over a CRLF it left a CR: Delete at
  `#┃⏎- a` zoomed into the item wasn't refused as leaving the zoom, and Backspace on the line after a
  folded heading left the caret hidden. The block-id guard had its own copy, which knew CRLF. Both are
  `plainTextEdit` now (`commands/util.ts`, in [Refactoring and API](#refactoring-and-api)): `everyHost`
  says whether every host's default is that edit, so the zoom guard still leaves Enter and paste,
  whose defaults differ by host, to `leavesZoom`. `view.test.ts`.
- [B231] **Edits built by hand assumed LF.** Typing on the blank line under a block-id paragraph wrote an LF
  into a CRLF note, and in a lone-CR note joined the CR into a CRLF, which lost the id (refused). The
  block-id guard took the host's Enter as an LF, so Enter over a lone CR was refused as losing an id,
  and a lone CR typed after a block id wasn't read as a line break. `nextBlank` stepped from a line's
  end into its CRLF, so typing on the blank line before a decorated carried id went to the host and was
  refused. A new line is the note's own line ending (`dominantEnding`, as the writer's); the next line
  is past the whole line ending. `block-ids.test.ts`.
- [B232] **Splits and a redirected Backspace cut through characters.** Backspace in a decorated id's name, done
  at the text's end, deleted one code point: an emoji's last part, leaving its joiner, or an accent
  without its letter. Enter and Shift-Enter at a stale offset inside a surrogate pair wrote two lone
  surrogates, and before a combining mark moved the mark off its letter. `src/text/lines.ts` has
  characters now: `charBefore`, `charAfter` and `charStart`, a grapheme or a line ending, a CRLF whole,
  segmented only around the position within its line. `plainTextEdit` and that Backspace use them, and
  Enter and Shift-Enter widen the selection to whole characters first (`wholeCharacters`,
  `commands/index.ts`): a caret goes to its character's start. The diff run moved four outcomes, all
  a split inside a surrogate pair, now before the emoji. The tracker's Backspace cases expected
  `é ^id` → ` ^id`; with the whole character taken, that is a paragraph's only one, which is refused
  as `a ^id` is, so the tests put a letter before it. `commands.test.ts`,
  `block-ids.test.ts`, `text.test.ts`.
- [B233] **`mdBlockIdEnd` missed an id after a lone CR**: it took a blank, a tab or an LF before the `^`.
  `obsidian.test.ts`.
- [B229] **A byte-order mark opening a note turned its first line into text**, in every flavor: `‹BOM›# Title`
  read as a paragraph, `‹BOM›- a` too, and Obsidian front matter as a setext heading over the note. Some
  Windows editors save files so. The mark is no character of a document's Markdown now: line 0 starts
  past it in the tree's line table (`MdTree.documentStart`), so no rule reads it, whatever the flavor,
  and it stays in the text, offsets the host's. cmark-gfm, micromark and Obsidian 1.15.0 read such a
  note so (markdown-it and commonmark.js read a paragraph); Obsidian also drops the mark from what it
  reads, and its first save writes the file without it. The writer copies the mark first, before every
  line, so it stays at the start whatever moves; three places that found a line's start by looking
  back for a line ending now start the first line past it: the column the writer reads where an item
  was written (`lineBefore`: moving an item above the first wrote `‹BOM›- b⏎ - a`), whether the last
  line written is blank, and whether a deletion holds a placeholder (`- a⏎⏎  b`, Backspace at `a`: `b`
  left the item). A select all from past the mark is the whole text (`OurusDoc.wholeText`), and a note
  emptied leaves the caret past it.
  - Only a document's mark: a text parsed as a fragment (a block's, a clipboard's) keeps it as text, as
    before. Read as a document's there too, a mark alone on a later line (`## Notes⏎‹BOM›⏎- item`)
    made six commands fail to write, which the sweep caught: outdent, Enter and Shift-Enter wrote the
    paragraph after it joined to it, and write again since.
  - A paragraph that is a mark, moved first (a move up there), would open the note with it, its text
    gone: a blank line goes before it now (`#byteOrderMark`, as `#frontmatter` does for a `---`).
  - Checked by playing every command on 200 generated notes with and without a mark, at the carets of
    the first lines and over the whole note: 125,076 runs, the same results but for the mark in front.
    `structure.test.ts`, `incremental.test.ts`, `commands.test.ts`.
- [B248] **Footnote labels holding U+0001 made rendering throw**: the inline cache's key joined the labels
  with control characters, so one label could read as two, and a cache made for other footnotes was
  used. The key encodes them whole now (`cache`, `syntax.ts`). [B287, B288] **The incremental parser took
  changed state for unchanged**: an extension's attribute `{ 0: 'x' }` for the old `['x']` (`sameData`
  checked only the first was an array), and a frame's state under a symbol key, which `for in` doesn't
  see (`frameEquals`: the symbols too now, no slower on the parser benchmark). `incremental.test.ts`.
- [B257, B258, B285, B286] **Four API edges.** `coverRange`, `rangeOf` and `markdownStart` of an empty
  note's root read offsets of no line, `undefined` or a throw: `{ from: 0, to: 0 }` and 0 now. `node(id)`
  kept a half-built index when its recursive walk overflowed (`> ` × 8,000): walked iteratively now, kept
  once whole. `textOf` of a node from another snapshot, read from the lines it had, cached that text for
  the node in every snapshot sharing it, another node's text: cached now only for a node on its own lines
  here. A frozen list of block-id lines was taken with its caller's records, which a caller could still
  change: copied unless they are frozen too. `doc.test.ts`, `text.test.ts`.
- [B256] **`ourus/extend` didn't export the inline node** its rules give the parser (`add`,
  `closeBracket`): it does now, as `MdInlineNode`, where the tracker asked for `Node`, a name the DOM
  has and no other export of ours goes without `Md`. `structure.test.ts`.
- [B310, B314, B315, B325] **Four more API edges.** `markdownOf` of an empty range at the text's end gave
  its line break: an empty range is `''` now. An extension's inline or block type named like an object's
  property (`toString`) found `Object.prototype`'s in the renderers' tables: their own entries only now.
  `codeSpanAt`, `verbatimSpanAt` and `inlineEscapeAt` recursed once per inline ancestor and overflowed in
  images nested 6,000 deep, which parse and render: one iterative walk down the inlines covering the
  position serves all three (`inlinesCovering`). An inline rule's triggers were keyed by their first
  UTF-16 unit, so a rule for `😀` ran at `😁`: keyed and dispatched by code point now, a character no rule
  takes added whole. `doc.test.ts`, `structure.test.ts`, `pathological.test.ts`.
- [B253, B249] **Extensions' render hooks composed; tabs separate a link's parts.** An extension's
  `start` replaced GFM's, whose `end` then threw: the hooks run in order now, the filtered tags joined
  (`mergeRender`). A tab before a link's destination or title, or a reference's destination, broke the
  link, where CommonMark, micromark and cmark-gfm take it (`reSpnl`, `refs.ts`). `structure.test.ts`.
- [B294, in part] **The readback compares a verbatim block's lines as they read.** It compared an atom's
  text as written, so a fence indented one space, made an item, changed a tab-led line of its code and
  passed. Where the draft kept a verbatim block's body and its number of lines (moved, re-indented, its
  fence respelled), its lines as read in the old document are compared with those read in the new
  (`verbatimLinesOf`, `check.ts`): that edit is refused now, the moves that keep the code still write.
  The full run moved no outcome. The writer spelling it is left (B294, P3). `commands.test.ts`.
- [B254] **A text rule after GFM's never saw the text after an email.** The email rule splits the text
  node, and the rules after it got the empty piece before the link. Each rule runs now over the text
  pieces the rules before it left (`runTextRules`). `structure.test.ts`.

## Verified

- `npm run test:fast`: 2579 pass, 0 fail (and after the spec notation's change); `tsc -p .` clean. (Its
  timing tests fail under a loaded CPU, a heavy run beside it: run it alone.)
- `node test/heavy.ts`, last run (against `64e30f4`, the last batch on top: a pasted block id's rest of
  line, the footnote carrier, B52, the ATX heading, the text-copy mark): view, inverse, conserve, sweep,
  sessions pass; `diff`: 0 runs fail to write, the outcomes moved all the block-id pastes' (`y ^zzzb` →
  `yb ^zzz`). Then with the `[x]` Enter escape, a GFM quote's `^x` and B52's tab variant: all pass,
  `diff` 0 runs failing to write, the outcomes moved all GFM quote atoms ending in `^x` (Enter at the
  end no longer splits before `^x`, `> a⏎>  ^x`, the caret no longer taken before it). Then with the
  blank code line's spaces: all pass but `diff`'s one plain paste failing to write at the last commit
  too; the outcomes moved only that code item's indent and move (refused → written); inverse gained 9
  round trips. Then with the lazy paragraph after a definition and the 9/10 shared marker line: all pass
  but `diff`, its only runs failing to write the drop B191 is, on a start Regression265 added, failing
  at the last commit too; the outcomes moved only the 9/10 moves (refused → written); inverse gained 15.
  Then with the padded item's narrowed column and the dropped item's new marker: all pass but `diff`'s
  two plain pastes failing at the last commit too; the outcomes moved only those shapes (refused →
  written); inverse gained 2. Earlier, against `5c14b53`: view, inverse, conserve, sweep, sessions pass.
  `diff` reports FAIL for 2 runs that fail to write, plain pastes the last commit fails too; no outcome
  moved. (Earlier runs caught regressions of this work, fixed since: three first versions of fixes
  (block-id paste, a deleted last item's blank lines, a new item under a quoted marker line); and spec
  cases that put shapes failing at the last commit in the corpus: one moved to a unit test, one whose
  fix now covers the other commands on it.)
- `node sxs/run.ts --rejudge`, then `--compare` against `.sxs` at HEAD, after each later batch: two
  verdicts better (obsidian-outliner, roam); four worse since Shift-Enter's held empty line, the cases its
  Decisions entry names (ShiftEnter11 for notion and siyuan, TO8 and TO9 for obsidian-outliner), none
  since. (Once 17 worse, the block outliners' on
  three tab-led and `>-` cases the nested Shift-Enter prefix's first version reached; narrowed.)
- `node sxs/run.ts all`, a full run: ourus passes every case it replays. Its errors were starts the
  apps can't hold, each a recent regression case, now skipped with the reason (the driver's
  `holds`): a fold on an item whose text is code or a table (Obsidian's four setups, SilverBullet:
  their fold command at the row folds nothing; `foldOnAtomItem`, `sxs/lib/text.ts`); an item `--`,
  which after SiYuan's `- ` reads as a rule; a block `[x]` alone, which RemNote holds as a to-do; a
  caret inside `**`, which Moo.do draws as formatting. BlockNote's one, a timeout, went on a rerun
  (MoveSubtree6, error → caret). None left; compare: nothing worse.
- After the spec notation's change: `node test/heavy.ts` all pass but `diff`'s two plain pastes
  (B192), no outcome moved; `--rejudge` then `--compare`: ourus passes all 1572 cases, nothing worse
  (the moves the Spec notation section names).
- After the rank review and the new core flows: `npm run test:fast` 2587 pass; `node test/heavy.ts` all pass
  (`diff` 0 runs failing to write, no outcome moved); `node sxs/run.ts all`, a full run: no errors,
  ourus passes all 1577 cases, one cell worse (MoveSubtree24 on Tana, its drop flaky over three
  repeats). The new flows' disagreements are the apps' own (text editors have no node selection;
  RemNote's cut leaves the node, SiYuan's takes its text alone).
- Fixing what `test/bugs.ts` ranks first, a commit each: `npm run test:fast` 2,609 pass, `tsc -p .` clean, `node
  test/heavy.ts` all pass after each but `diff`, whose one run failing to write fails at the last commit too
  (B192, on a start the new spec cases brought into its sample); its outcomes moved only B272's pastes, the
  block id on its line. Heavy caught two first versions of B234's fix, a mark past the text's end and
  the mark of a node deleted, and the drop pass a spec case of B221's, a unit test now. A first B274 fix
  stopped the throw and misplaced the paste. Open bugs 124 → 112, the P1s gone.
- This round's batches, each: `tsc -p .` clean, the fixed cases moved, then `npm test`, all eight suites
  passing: `diff` 0 regressions, its one run failing to write B192, failing at the last commit too.
  Outcomes moved only where a fix meant them to: four splits inside a surrogate pair (B232), now before
  the emoji, which `inverse` counted as round trips gained; one paste over a block id's name (B307). The
  BOM's first version failed the sweep, six commands on a mark alone on a later line: mended before
  its run passed (the fragment's mark text again). The fast suite now 2,641 tests. SxS rejudged after:
  [Baselines](#baselines).

## Not done

Of the backlog's 178, the rest is untouched here, but for these looked at:

- Write failures on fuzzed or unusual shapes, reproduced still, the readback check refusing them,
  nothing written wrong: B15, B16, B37, B39–B41, B43–B47, B52–B54, B69, B70, B190, and the
  tab-led, padded and lazy lines' and the numbered markers across 9/10 (B169, B191) in `test/bugs.ts`. Found
  by this round's heavy runs and logged there, failing at the last commit too: B190, B191, B192.
- A quote paragraph whose first line is padded (`>  e`, a space typed at its start), moved with
  `moveSubtreeUp`, failed to write (now fixed, B52); Enter at a quote's later line makes two-paragraph
  quotes reachable by Enter, so the sessions report meets it once (`moveSubtreeUp: write-failed`, its
  baseline raised 0 → 1 for it). The `>0. - h⏎>    - ` shape Enter writes there (a nested item on a
  quoted marker line): Backspace after it, move, delete and cut fail to write, as at the last commit.
- Left of two partly fixed findings: [B21] a paste above indented code a cut left the caret at is
  still refused; [B26] a plain-text-only clipboard of indented code is still dedented (an ourus one
  pastes as code).
- [B55] Shift-Enter over a callout title's line break into a lazy line after the callout (`>[!e]T⏎a`,
  the selection 6–7): the draft joins `a` to the title, which holds one line. [B56] Enter before
  ` >- [x] x` after a quote's empty first line `>`: the new task's line and the old one's are prefixed
  differently (` > ` and `>   `), the old a child of the new. Both looked at, not done.
- [B223] Obsidian 1.15.0 reads an id ending a quote's last paragraph as naming the whole quote, as the
  model has it (`CachedMetadata.blocks`, `sections`, the range a link highlights, for five shapes): the
  commands are what to change. Not done: where the id goes when Enter lands right before it is to decide.
- Backspace taking a paragraph's only character before its id (`a┃ ^id`) is refused, a paragraph that is
  only `^id` naming nothing; found with B232's fix, which made `é ^id` refused as `a ^id` is. Not changed.
- [B54] Moving a paragraph above a loose numbered list: the root item after it is indented three
  columns, at the root only because the paragraph interrupts; once that moves, the indentation puts it
  in the numbered item. The writer would have to re-indent a root item it otherwise copies.

## Open: to review or decide

- **The probe doesn't carry a case's `folded:` state** (`sxs/probe.ts --case`): the apps play the
  start unfolded, and the case is reported as drawn differently. Fold cases need an explicit `fold`
  step in an ad hoc probe.

## Decisions

The policy questions decided with the user:

- **Built:**
  - **`enterSplitSpace` defaults to `drop`** (was `trim`): the spaces after the caret go, those
    before it end the first half, so Enter then Backspace gives `one two` back where the caret was
    after the space (before it, the space goes either way). `trim` stays, Logseq's (its SxS driver
    says so). Spec cases whose first half now keeps a trailing space show it as `␠`; Enter44's prose
    and spec/README.md's say the new default; two auto-mark unit tests set `trim`, what they test.
  - **`> [!x]` in GFM and CommonMark is a quote, no callout**: a first line `[!type]` makes a
    callout's title only where the flavor has callouts (`quoteKind`, `quoteHead`, `becomesTitle`, the
    writer's title guards). Paste places such a quote as any (it failed to write next to a quote
    child, and was put as a child block); Home, Backspace, Enter in it are a text's. CursorHome17,
    Paste23 and Quote71 are Obsidian's now; Quote58, Quote79, Quote84, Regression112 and two unit
    tests say GFM's.
  - **An ourus clipboard of whole nodes pastes as nodes**: a node cut then pasted where the cut left
    the caret goes back as a node, not as text into the paragraph above (a line break ending it).
    Only whole nodes: ourus marks a copy of text, from inside one node into another, with
    `<!-- text -->` after its `<!-- ourus -->` (`clipboardOf`), and that pastes into the text as
    before (`read.nodes`). The first version took any ourus clipboard ending in a line break, so
    `fi«rst⏎⏎»second` cut and pasted back was a paragraph after `fisecond`. Regression259,
    Regression262; Copy1 shows the mark.
  - **`pasteHtmlBreak`**, a new option: `line` (the default, a line of the paragraph's text) or `hard`
    (`\` at the line's end, as Obsidian writes a `<br>`); `<br><br>` a paragraph break either way.
  - **`^name` in pasted HTML text stays text**, escaped (`\^id`): HTML carries no block ids.
  - **`listNumbers`**, a new option: `renumber` (the default) or `keep` (the text editors': numbers as
    written, a new item's on from the item above, the items that counted on from it counting on).
  - **`outdentTopLevel`**, a new option: `unwrap` (the default, a paragraph in place, the items after
    it its list, which `listParent: paragraph` makes unavoidable) or `refuse` (`not-expressible`, as
    sixteen app setups do nothing there).
  - **Shift-Enter's empty line in an item or a quote is held, and goes when left empty**: Shift-Enter
    at an item's or a quote's text end, and a one-line paste ending in a line break there, leave the
    caret on an empty last line of the text a placeholder holds (drawn `┃◌`), not a blank line after
    it; typed on, it is the text's next line; left empty, settling takes the line out, no blank line
    left, so the list stays tight (the zoomed Shift-Enter at an item's end, refused as loosening the
    list around the zoom root, works). After a root paragraph, a blank line as before: the text
    editors (Obsidian, SilverBullet, Emacs) keep it, and a held line after `[a]:` would need an escape.
    Not after a line ending in `^name` either (it would be no block id until it settled). How:
    `#placeholders` keeps such a line where the caret is on it; `validPlaceholder` holds a paragraph's
    empty last line under text; `settled` takes it out; paste on it fills it (Paste26's rule); Enter on
    it in a quote's text leaves the quote (QuoteText8, 9). Placeholder4b–4e; the cases that draw the
    line `┃◌`; Regression206's fold stays (the line is the row's text). SxS: notion and siyuan on
    ShiftEnter11 (✓ → S), obsidian-outliner on TO8 and TO9 (C → ✗), which keep the line.
  `commands.test.ts` and `block-ids.test.ts` for each.
- **Built, this round:**
  - **A byte-order mark is no character of a document in every flavor**: it has nothing to do with the
    flavor (the user's). Only a document's: a fragment's mark is text.
  - **The host's default edit is `plainTextEdit`**, the user's name for it, where `hostEdit` was.
  - **An empty paragraph left between blocks that touched is a blank line** (B306), the user's choice of
    two: not every one, which would pile blank lines up, but where it is the separation the author
    made, outside lists and quotes.
- **Kept as they are:** an emptied document keeps its line break; `<li><p>` lists
  paste tight; Enter at the end of a paragraph that owns a list makes a paragraph that takes
  it. [B188] (a cut across items pasted back) needs a reproduction first.

## Notes for the next round

- **What found bugs:** random multi-step sessions on realistic notes; copy/cut/paste matrices with
  a letters-kept oracle; command × caret × template scans (a template block plus a blank-line
  suffix); odd characters put in (NBSP, U+2028/2029, NEL, BOM, ideographic space, lone surrogate);
  HTML round trips; and one shape, a quote or callout in a list item, a blank line and a paragraph
  after, which alone broke Enter, Shift-Enter, Backspace and moves. **What found nothing:**
  single-command fuzz on plain notes; incremental against full parse; `ChangeSet`, `MarkSet`,
  `ChangeIndex` and `diffLines` properties; the parser against commonmark.js and micromark;
  drag and drop; the Word clipboard; Unicode text, `indentUnit`, `enterSplitSpace`; mixed line
  endings on ordinary notes. New instances of a known family come cheap from the generated notes; a
  new class needs an oracle of its own (a caret after a cut in the wrong block throws nothing).
- **Shrinking:** by whole lines first, then characters; a character shrinker over-reduces into odd
  input (a stray `$`), so check the shrunk case against the realistic one.
- **False positives seen:** motions and undo may leave the caret in a hidden line (not the next
  command's fault: `sessions.ts` skips `assertViewHolds` there); a `copy` or `cut` with no `nodes` acts on
  the node at the caret's text, maybe a child (the sweep passes ids); the zoom range excludes the
  final line break; NBSP is kept on HTML paste, as it should be; `inverse.ts` against the last
  commit floods "gained" when only one side has a corpus (`heavy.ts` handles it); timing tests flake
  under load (widen or sample more, don't tighten).
- **Design that looks like a bug:** a paragraph owns the list after it (copying or cutting it takes
  the list); paste goes after the node the caret is on; ordered lists renumber on paste and insert;
  top-level outdent, `joinWithChildren`, `outdent: direct`, a trailing space after a bare marker,
  Shift-Enter at a paragraph's start refused: documented option choices.
- **The probe** (`sxs/probe.ts`) answers "what should this do?", not "does it crash?": the apps
  differed from ourus only on the option choices above. A probe file's cases each need a `yaml`
  block with `tags: core`, one buffer block per state, ```` fences around a buffer with a fence.
- **Obsidian runs here**, headless (`sxs/obsidian/`): a script starting an instance
  (`startInstance`, `instance.ts`), opening a vault as the driver does and reading `app.metadataCache`,
  reading view and the files, answered the BOM and the quote's block id in minutes. Version 1.15.0 is the
  one cached.
- **A review's ranks run high**: of the last reviews' P2s, most needed an option or a rare shape (a
  footnote's body below a blank line, a `-|` line, a reference spelling a comment's closer), P3 by the
  ranking's reachability. And where reading Markdown is in question, check all three references:
  they split (a tab-only line after an empty item, a label's length).
- Still worth doing: more config options in the generator (it rotates 6 of about 35) and more block
  shapes; a redo and fold round trip oracle for the sessions.
