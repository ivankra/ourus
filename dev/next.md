# What to do next (2026-11-05)

A proposal for improving ourus: what to change, in what order, and what not to do. The open bugs are in
`test/bugs.ts` (B-ids: `npm run bugs` says what is open, `node test/bugs.ts B212` shows one); what can't
be a failing case is here. Sizes are rough judgments (S a day or less, M a few days, L a week or more), not
measurements.

## Contents

- [Summary](#summary)
- [Where ourus stands](#where-ourus-stands)
  - [Numbers](#numbers)
  - [How bugs are ranked](#how-bugs-are-ranked)
  - [What causes them](#what-causes-them)
  - [What the reviews covered](#what-the-reviews-covered)
- [Principles](#principles)
- [The plan](#the-plan)
  - [Step 1: see the failures](#step-1-see-the-failures)
  - [Step 2: fix what a user can hit](#step-2-fix-what-a-user-can-hit)
  - [Step 3: one definition of each shared idea](#step-3-one-definition-of-each-shared-idea)
  - [Step 4: quote atoms read their text](#step-4-quote-atoms-read-their-text)
  - [Step 5: settling and marks through a rewrite](#step-5-settling-and-marks-through-a-rewrite)
  - [Step 6: decide the behavior](#step-6-decide-the-behavior)
  - [Step 7: typed results](#step-7-typed-results)
  - [Step 8: the writer's prefixes](#step-8-the-writers-prefixes)
  - [Any time: smaller batches](#any-time-smaller-batches)
- [Not proposed](#not-proposed)
- [Risks](#risks)
- [How to tell it worked](#how-to-tell-it-worked)
- [Decisions](#decisions)
  - [Needed now](#needed-now)
  - [Decisions to confirm](#decisions-to-confirm)

## Summary

The architecture is sound: parser, outline, draft, writer, then a readback that refuses rather than
corrupts. It needs no rewrite. Four things are wrong around it:

1. **The tests see far less than they appear to.** Green means "no worse than the baseline", and the
   baseline is small. 100,000 sessions take 73 seconds and fail 158 times; the committed 2,000-session
   run shows 2.
2. **Shared ideas have several definitions**, which drift: the end of the view, the host's default edit,
   a line ending, whitespace, a quoted list. Most bugs outside the writer come from that.
3. **Behavior was never reviewed as a whole.** The spec is 1,585 agent-written cases that agree with the
   code, which isn't the same as being right. There is no compact statement of intent to review.
4. **The readback compares what was spelled, not always what it means**, and one path goes around it.
   A code block re-indented can read as other code with its text unchanged (B294); settling's fallback
   updates the document unchecked (B240). Every later fix leans on this check, so it comes first.

So: first make failures visible, the readback's blind spots included, then fix what users hit, then
merge the duplicate definitions, then review the intended behavior in a table instead of prose. Only
then consider the one large change, the writer's prefix model, on a prototype with a way out.

| Step | What | Size | Takes out |
|---|---|---|---|
| 1 | Tests: the readback on meaning, volume, more actions, failures grouped by cause, triage | M | Part done. B294; unknown: 158 failures to classify |
| 2 | The P1s and the worst P2s | S–M | B223, B240 (decisions); B260, B305 (B277, B291, B292, B295, B302, B304, B306, B307 done; B294 refused now) |
| 3 | One definition each: view end, host edit, line ending, whitespace, pairing | M | Host edit, characters and the BOM done (B229–B233); left B196, B214, B242, B244, B250 |
| 4 | Quote atoms read through the parser | M | B198–B201 |
| 5 | Settling through the commands' checks; marks through rewrites | M | B236, B237, B239, B240 (B238, B276 done) |
| 6 | Boundary table and the decisions review | M, mostly the user's time | D1–D33, B202, B217 |
| 7 | Typed results | S–M | B259; makes `Deferred` countable |
| 8 | Prefix model, prototype first | L | Up to 62 `write-failed` bugs, if it works |

Next, in order: the readback on a verbatim block's meaning (step 1) and settling through the commands'
checks (step 5, with B240 and B276), which guard every fix after them; the bounded refactorings
([Any time](#any-time-smaller-batches): the acted-on selection out of `commandAt`, structural guards,
structured write failures, the two lints and the depth and width check); the rest of step 3; the last
reviews' P2s; the rest of step 1. Decisions that change that order are in [Needed now](#needed-now).

## Where ourus stands

### Numbers

| Measure | Now |
|---|---|
| `npm run test:fast` | 2,609 pass, about 6 s |
| `npm test` | The full run, eight suites, 86 s; 2 min 17 s on four cores. CI runs it on every push |
| Spec cases | 1,585 |
| Open bugs (`test/bugs.ts`) | 130, 237 cases: 0 P1, 25 P2, 105 P3; 7 policy questions |
| Bugs that are `write-failed` refusals | 70 of 130 |
| Writer | `write.ts` 2,447 lines, `draft.ts` 3,166 |
| `OurusDeferred` with no reason given | 46 sites |
| Sessions at the committed size (2,000) | 2 failures, both in the baseline |
| Sessions at 100,000 (73 s) | 158 failures, 19 groups: no throw, no selection off the text, 8 view failures |
| The same, half the notes without a final line break | 162 failures, 17 groups, 4 view failures |

Of those 2 million actions, about one in 12,000 fails: rare, but not rare over a user's year, and most of
it is refused, not corrupted. Step 2 took the throws and the carets off the text, but hardly the count
(166 and 206 before it): nearly all that is left is `write-failed`, the writer's (steps 5 and 8).

### How bugs are ranked

- **P1**: an uncaught exception, a view the host can't show (a hidden caret, a caret outside the
  zoom), or silent loss of text in ordinary editing.
- **P2**: a wrong result on realistic input, or an ordinary edit refused with `write-failed` (the
  readback check stops anything wrong being written; the user's edit is refused).
- **P3**: rare input (tab-led lines, padded markers), non-default options, HTML paste details.

A bug reached from keys outranks one from hand-built state. The ranking rests on assumptions D21 to D24.

### What causes them

1. **The writer can't spell a draft**: blocks in unusual containers (a quote under an item, nested
   quotes sharing a line, a quote atom's own prefixes), lazy and tab-led continuation lines, padded
   first lines, marker widths across 9/10.
2. **Node identity through a rewrite**: a node written anew where the draft named it (copies,
   shared container lines) reads back with another id.
3. **Two models of one thing**: a shortcut beside the real logic, which drifts from it. `moveRefused`
   against the writer (B241); a quote atom's line regexes against the parser (B198, B199); JavaScript's
   whitespace against Markdown's (B250).
4. **A summary compared in place of the state**: what the fold and zoom guards compare (B218, B219), the
   paste's probes (B224).
5. **Marks not carried through a rewrite**: a held line or space the writer's layout no longer agrees
   with (B237), a caret through a settled node (B276).

### What the reviews covered

So the next round doesn't repeat it. These found nothing:

- 55 block shapes (tabs, lazy lines, setext, `)` lists, nested quotes, fences in items, tables, footnotes,
  block ids, CRLF) × random values of about 40 options × 31 commands, at random carets and selections:
  no throw, the selection in range, `changes` giving the text, line endings and the final line break
  kept, letters conserved by moves, indent, outdent and Enter. Its only `write-failed`s are in `test/bugs.ts`.
- The incrementally updated document against a fresh parse, same marks; 15,000 random parser updates of up
  to four edits against a fresh render.
- A zoom and fold fuzz, a copy and cut survey, the expand-selection ladder but for B216.
- 8,000-item notes, 1,000-deep nesting, 20,000 brackets; config and API validation.
- GFM against Obsidian on notes without Obsidian syntax, but for D4.
- 489,708 sweep runs on 240 generated notes and 278,802 conservation checks added no group.

Not covered: one review skipped HTML, and a later one HTML and the clipboard, so B264 to B271 have had one
pass. Hand-built marks reach states sessions never do; replaying from keys told the two apart. A probe's
`marks: { placeholders }` is easy to forget: `> ` then Enter looked like a bug without it.

A design review (2026-11-06) read the session's writeup and `src/`, and replayed seven tracked bugs. It
agreed with this plan's diagnosis; what it added is folded in here: the readback on meaning (step 1),
settling through the commands' checks and the draft's phases given postconditions (step 5), the oracles
it proposed (step 1), the layout model's shape (step 8). Its second pass sharpened them: the expected
payload read in the old context, not the new; a draft's readback apart from the checks every edit gets;
the layout's region worked out from changed parsing context; buckets, not causes; refusal counts that
may rise where they replace silent wrong successes; step 8's prerequisites named.

To find more: `node test/sweep.ts`, `node test/sessions.ts`, `node test/conserve.ts`,
`node test/inverse.ts` (`test/README.md` says how to read them).

## Principles

- **Keep the readback, and make it see meaning.** It is why bugs are refusals. Nothing here weakens it,
  and no second model may replace it as the judge of what can be written. Where it compares spelling
  and not what the spelling reads as, a fix can lower the `write-failed` count by writing wrong text:
  close those holes before the writer changes. Every path with a draft goes through it, settling's
  fallback too; every path that writes, a host's edit included, through the checks a document alone
  allows (block ids, the selection, the view).
- **A duplicate definition is the bug.** Fix the instance by removing the copy, where that is small.
- **The spec records intent; it doesn't prove it.** Changing a spec case to match the code is a decision,
  not a fix. A spec change gets a reason, and intent gets reviewed by a person.
- **A baseline may not hide a known failure.** Each one has an id and a repro.
- **Measure before a large change.** Each big step below has a stated exit.

## The plan

### Step 1: see the failures

Everything else depends on this. Do it first, and expect the bug count to rise.

Done:

- `test/bugs.ts` holds every open bug as cases that fail while it is open. A case that passes is reported
  fixed until it moves to a proper test file; one failing another way than `bugs.baseline.json` recorded
  is reported too.
- `test/lib/` holds what test files share.
- `npm test` is the full run, `npm run test:fast` the quick one, and CI runs `tsc -p .` and `npm test` on
  every push (`.github/workflows/test.yml`). It fails on regressions, not on known bugs.

To do:

**The readback reads meaning (S–M).** `src/writer/check.ts` compares each text's body and frame as
spelled. Where indentation decides what a verbatim block's lines are (a tab-led line of a fence, indented
code's four columns, a fence's indent taken off its lines), the same spelling written at another column
reads as other code, and passes: B294's re-indented fence changes a tab-led line of its code, unrefused.
Compare a verbatim block's payload as it reads where it is written with the payload the draft means,
beside the structure, ids, marks and frames compared now; keep a block's source spelling and what it
reads as apart. Where the expected payload comes from is the point: for a block moved or re-indented,
read in its old context, the document's before; for code edited or made, from the edit the draft
states. Reading both sides in the new context would compare the new reading with itself, and B294's
blind spot would stay. Before step 8: that step aims at fewer `write-failed`, which without this could become
wrong text the check accepts.

**Corpus (S).** `test/lib/generated-notes.ts` always ends a note with a line break: half of them shouldn't,
which is how B234, B235 and B272 hid. It rotates six option sets, of about 40 options; it should draw from
all. Add CRLF and lone-CR forms of each note, a BOM sometimes, and a block shape for each new failure family.

**Actions (S).** `test/sessions.ts` never plays `selectNodeDown`, `selectNodeUp`, `moveSubtree`, `pasteAt`,
`addBlockId`, `removeBlockId`, or commands given `nodes`, where B212, B235 and B274 hid. The drop's places
come from a `drag` pickup, so drops can be played from what it offers.

**Group failures by cause (M).** A report counts failures per command, which mixes unrelated bugs, and
counts one bug many times: five `selection off the text` groups were all B272, the action after it. Group
a failure by what failed instead, the writer's message with numbers taken out, and node kinds. That made
one run 23 groups, not 66. Such a group is a bucket, not a cause: one message can hold several mechanisms
(`root: N children, read as N` does), so a new mechanism may land in a bucket already tracked. Three
outcomes: fails the run (throws, invariants), tracked, and new (fails until triaged). Tracked means a
shrunk case confirmed as that bug's, not a bucket with a B-id: a new failure in a tracked bucket is new
until its shrunk case is read and joined to the bug. Keep each bucket's shrunk examples beside its
count: an unchanged count can hide one case fixed and another broken. That also frees the baseline from
one corpus, and rotating seeds need it.

**Structured write failures (S–M).** A `WriteFailure` (and a readback's difference) is a sentence, which
the reports bucket by taking its numbers out. Give it a code, the phase it came from, the node's path,
and the expected and actual values, the sentence made from them apart. Buckets by code and phase are
sharper than by wording, still buckets, not causes. Part of step 7's typed results, done first for the
triage.

**Volume (S).** Once failures group by cause: a scheduled run of the reports at volume, rotating
`SESSIONS_SEED`, keeping the seed of anything new.

**Triage the 158 (M).** Nineteen groups, shrunk examples in hand. Each becomes a B-id or joins one. Start
with the groups that aren't `write-failed`: `view invariant` gave B273 and B276. The last review ran
880,000 sessions over rotated seeds and options and kept its shrunk states: of the families it left
unassigned (surviving shared-marker and prefix placement, padded items, an empty item taking in a quote,
quote identity, a padded quoted item's Shift-Enter), 1,275 states still fail on the current tree, in
59 groups by message with numbers taken out. Those messages (`root: N children, read as N`) mix
mechanisms, so each group needs its examples read; none is filed yet.

**New oracles (M).** Each of these found bugs by hand, some fixed since, and none is automated:

| Oracle | Would have found |
|---|---|
| An edit gives equivalent results on LF, CRLF and CR forms of a note | B230, B231 |
| Keyboard move and drop agree on the same destination | B241 |
| Type a character, Backspace: the note comes back | B204, B245, B246 |
| Each `expandSelection` holds the last | B216 |
| `selectedSubtrees(selectionOf(roots))` gives the roots, zoomed and folded too | B212 |
| `visibleSelection` of its own result changes nothing | B212, B213 |
| A note's ids and labels stay unique, each on its node | B223, B225, B228 |
| Numbered lists stay sequential under `renumber` | B199, B211 |
| Settling twice does what settling once does, and an abandoned placeholder that may settle goes, or is kept or refused by a stated rule (idempotence alone passes a placeholder that never settles) | B239 |
| A paste keeps the clipboard's and the note's letters in order, not only their count (`conserve.ts` compares them sorted) | B327 |
| Edit, settle, edit: the whole state checked at each boundary (text, selection, marks, view) | B240, B276 |
| A fixed mechanism holds over its variations: spaces or tabs, a shared or separate marker line, a final line break or none, LF, CRLF and CR, a BOM, each `quotes` mode: a helper playing a case's variants against each other, as the CRLF and BOM fixes were checked by hand | B229, B230, B305 |

**Lints and a depth and width check (S).** Two families were found one review at a time: an array of
unbounded length spread into a call, past JavaScript's limit on arguments (B281, B317), and recursion
over nodes, inlines or HTML elements, past the stack (B258, B315, B340, and the iterative walks of
`outline.ts`, `textContent`). A lint for each, the spread and the unbounded recursion, with a reason
where one stays; and one test calling every public API on a note 10,000 levels deep and on one of
200,000 siblings.

**Parser differential (S).** Run the corpus through cmark-gfm, micromark and commonmark.js beside ourus,
and list disagreements. One reference misleads: commonmark.js shares the tab and NBSP bugs, and the
three split on B247. Keep a short file of deliberate differences. cmark-gfm decides GFM questions, being
what GitHub runs (`cmarkgfm` on PyPI needs no build).

**Count refusals and deferrals (S).** A refusal costs a user too. Report the rate per command over a
fixed corpus; B223 is a 100% refusal on a common Obsidian shape that no test counts as a failure. Tell
the expected refusals (a shape Markdown can't spell, a stated rule) from the implementation's
(`write-failed`). The rate mostly falls, but not only: a readback that sees more turns silent wrong
successes into refusals, so a rise is allowed where each new refusal is such a case, explained.

### Step 2: fix what a user can hit

Done: B194, B195, B212, B215, B221, B222, B234, B235, B243, B261, B262, B272, B273, B274, B277, B291,
B292, B307, and B242's blank lines. Each fixed bug's cases moved to a test file or the spec, with the
exact result asserted.

Left: the P2s the last reviews found: **B260**, the clipboard's HTML rendered out of its note; **B305**, a command at the
note's end over a last line blank but not empty. Done since: B294's silent change (refused now; its
writer fix P3), B295, B302, B304, B306, B327's
order (its write failure P3), B276. **B240** waits on a decision: settling's fallback drop changes what
an id names, which keeping the mark held only defers to the file's next reading.

And **B223**, commands moving an id whose target is the quote to the new last block, and declaring it.
Obsidian reads such an id as naming the quote (D25, measured), so the model stands and the commands
are what change; it waits on D25's other half, where the id goes when Enter lands right before it.

### Step 3: one definition of each shared idea

Each is a small module replacing several hand-written copies. The value is that the next bug of the
family can't happen. Size M together.

**The view's edges (B214; B213 done).** `viewEnd` (`src/view/select.ts`) is the view's end now. One
`editableStart(node)` serving both `rootStart` and `editStart`, descending through textless containers.
`settled` on every result, including the `UNCONFINED` commands.

Done: **the host's default edit** is one function, `plainTextEdit` (`commands/util.ts`), for the zoom and
block-id guards, with `everyHost` for a key whose default differs by host; **lines and characters** are in
`src/text/lines.ts` (`lineEndingBefore`, `nextLineStart`, `charBefore`, `charAfter`, `charStart`), new lines
the note's `dominantEnding`, and Enter and Shift-Enter split on whole characters. B230 to B233.

**Whitespace (B196, B250).** `trimMd` and Markdown's blank test everywhere, no `trim()` or `\s` on document
text outside HTML. A lint rule keeps it so. About five sites.

Done too: **the BOM (B229)**, before line 0 in a document's line table (`mdDocumentStart`), in every
flavor, a fragment's text as it is; the text keeps it, offsets stay the host's.

**Text operations on what isn't prose (B242's quote atoms, B244).** Pair, wrap and step-over written
once against a small interface that prose, quote atoms, code and an empty place each provide. Start with
what the bugs need, no general text abstraction.

### Step 4: quote atoms read their text

`lineInQuote`, `renumberedAfter` and `parentItemLine` are regexes over physical lines, standing in for a
parser the atom already calls (`stringBlockIds` does `MdTree.parse` on it). Parse the atom's text, take
the enclosing item, its list, its column, and whether the caret is in code. Eleven findings go at once
(B198, B199), a re-indent on widening included. Policy goes through the same functions ordinary lists
use: `listNumbers`, `enterTask`, `enterSplitSpace` (B200). B201 is the same gap in `linesInQuote`. Size M.

Weigh this against D24: if the true-outliner setup is a main target, these rise to P2 and this moves up.

### Step 5: settling and marks through a rewrite

**Settling goes through the commands' checks (S–M), first.** `settleSteps` (`src/writer/settle.ts`)
checks block ids on its normal path, but its fallback takes the marks out by a plain document update,
which can change what a block id names unchecked (B240); `settlePlaceholders` returns no selection, the
caret left for the host to map (B276). One completion for settling and commands, in two parts. The
checks every edit gets, a document alone enough for them: given the candidate document, its changes,
its selection and what it changes on purpose (ids moved or merged, nodes removed), the block ids, the
selection in the text and shown, the view's invariants, and a result whole, its selection included.
And where a draft exists, a structural edit's or settling's, the readback against it: a candidate
document alone has nothing to compare with, and raw typing and a host's edit have no draft. Keep it
that narrow: `OurusDoc.update` stays what applies an edit, and no path keeps its own list of final
checks.

**The draft's phases get postconditions.** `#normalize` (`draft.ts`) runs held spaces, structure,
lists, escapes, placeholders, gaps and block-id lines in an order that matters, over shared state. Keep
the order; state what each leaves true and check it in the tests: after the layout, every mark has a
destination or a stated reason it goes, every gap is accounted for. Start with marks and gaps, where the
bugs are.

**A gap is one record (M).** `statedGaps`, `carriedGaps`, `gapFloors`, `gapLines` and `autoGaps`, five maps
by node, together say where a node's blank lines came from and how to treat them. One record each, its
state explicit (inherited, asked for by the command, put in to keep blocks apart, ours to drop), that
a split, a join, a move or settling transforms whole. The gap bugs are its acceptance cases: B296,
B303, B305, B329. Only these five: maps that merely share a node id stay apart.

A mark is one of three things: a held empty node or line, a held space, an escape or closer of ours. For
each, write down what moving, splitting, joining, converting, filling and abandoning do, then make the
draft carry that. The rule behind B237: a mark stays valid in the written layout or goes in the draft,
never at the readback.

Order by reachability, after settling's path: `addBlockId` (B236), then B237: the
sessions reach its held spaces in two keys, so take the shapes they meet first, and leave the hand-built
ones until something reaches them. Size M.

### Step 6: decide the behavior

The highest-value step that isn't code, and the answer to the spec being unreviewed.

**A boundary table (M).** A data file: `(kind above, kind below, command, config subset) → outcome`, where
an outcome is `join`, `peel`, `move-caret`, `refuse(reason)` or `host`. A test walks every cell, so a
missing cell fails, and a `Deferred` only comes from a `host` entry. Delete and Backspace tables come from
one description, symmetric by construction, exceptions listed. A survey found 169 asymmetries nobody has
classified (D26); this classifies them. It is a few screens a person can read, where the spec is 1,585 cases
nobody will. The same boundary answering three ways (B202) can't hide in it, nor a caret with no node
(B217).

**Review [D1 to D33](#decisions-to-confirm) (the user's time).** Grouped so an hour goes far: defaults first
(D1, D2, D13, D14), dead keys (D7, D8, D16), then the rest. Each answer becomes a table entry or an option,
and the spec cases follow.

**Fewer options (the user's time).** About 40 options, and each multiplies what the tests must cover. The
SxS knows which app setups use which values (their drivers' `behaves`): an option or a value no setup
and no stated user needs is a candidate to remove, with its spec cases and code.

**Check against the real apps (S).** Obsidian runs here (`sxs/obsidian/`, its `startInstance`): D25's reading
is measured; `CachedMetadata.blocks` answers B227 (an id's case) the same way, `sxs/probe.ts` D4 (a table's
next line).

**Audit the spec by sampling (M).** Review the 91 `core` cases by hand, then a sample of `common`. Any
case whose only justification is "the code does this" gets flagged. Over time, tag cases with where their
intent came from: an app's verdict, a decision, or nothing yet.

### Step 7: typed results

`OurusRejected.detail` is free text that hosts show; `OurusDeferred` usually says nothing. Replace with a
reason code and structured fields, and one renderer (B259: `a atom`, `code_block`). Give `Deferred` an
enum (`host-default`, `in-markup`, `not-done`): `not-done` is then a backlog that can be counted, which
"ourus doesn't do it here yet" isn't. Size S–M. It changes public types, so better before anyone depends on
them. 130 `OurusRejected` sites and 176 `return null` in commands, so go by file.

### Step 8: the writer's prefixes

70 of 130 bugs are the writer failing to spell something: quotes sharing a line with an item, lazy and
tab-led lines, padded markers, 9/10 widths. Column arithmetic is spread over `write.ts` and `draft.ts`, and
each fix adds a case. The proposal: a line's container prefix as data (quote, item indent, lazy, tab),
built from the tree and printed by one function, with column arithmetic in one module.

The layout is one per-line representation that the draft's normalization and the writer both use:
container prefixes and which marker owns the line, source ranges, content columns and partial tabs,
where each content and blank line came from, and how anchors, marks and node ids map through it. Now the
draft predicts a line's layout one way and the writer computes it another, `write.ts` keeping a dozen
maps that must agree (widened markers, shifted starts, lifted blocks, replaced prefixes, narrowed items,
split tabs). Splitting the two files would help reading them, not take bugs out.

This is the largest and riskiest change, and it has one real conflict: **ourus must keep bytes it didn't
need to touch.** A user's odd spacing on an untouched line stays. So the model lays out the lines whose
reading the edit changes and copies the rest byte for byte. That region is the lines a shift moves and
those whose parsing context changes: in B54 moving a paragraph changes how a list item that doesn't move
reads its indentation. Work it out from the context that changed, not from the lines moved.

Two refactorings go with the prototype, as its first moves: **the normalized draft a type of its
own**, immutable, that `write()` alone takes (`done()` builds such a record already, which the writer
reads through `#normalized()`; the mutable draft stays the commands' API), so the layout has a clean
input and the phases a boundary that holds; and **types for coordinates**: document offsets, offsets in
a node's text, line indices and columns, branded where they convert (`posOf`, the text mapping,
anchors, column arithmetic, partial tabs), in the writer first. This round's BOM showed the class: a
line start that wasn't one, a column counting the mark.

Prototype before committing (L):

1. When these are in place, not the whole of steps 1 and 5: the readback on meaning, settling through
   the checks, failure buckets keeping their shrunk cases, and the mark invariants of the shapes the
   prototype touches.
2. Take the 9/10 bugs (B169, B191, B210, B278), the tightest family, through the new model on a branch;
   then quoted and list content moved across a change of indentation. The open bugs are the acceptance
   cases.
3. Measure: `write-failed` groups gone, spec and `diff` unchanged, lines of the old code removed.
4. **Continue only if** it clearly beats patching those four. If not, keep the writer, and refuse earlier
   the shapes it can't spell, which for P3 lines imported from other tools may be the right answer anyway.

### Any time: smaller batches

Independent of the steps, each a small batch:

- **Parser (S):** tabs in link syntax (B249), label and fence whitespace (B250), email over decoded text
  (B251), sentinels (B252). Done: cache keys (B248).
- **Extensions (S–M):** scope the rule of three to emphasis (B255). Done: hooks composed (B253), text rules over what earlier ones leave (B254), `MdInlineNode` exported (B256), attributes
  and frame state compared by kind and symbol key where the parser converges (B287, B288). Test through
  `ourus/extend`, the public entry point, with two extensions at once.
- **API edges (S):** done (B220, B257, B258, B285, B286).
- **The acted-on selection out of `commandAt` (S–M).** `commands/index.ts`'s `commandAt` locates the caret,
  redirects it around block ids, plays the host's default, runs the command and checks it, in one
  function. A pure routing step, the selection given in and the selection acted on out with a typed
  reason (in a block id's name, on a block-id line, glued, none), then the run, then the checks: what is
  the user's selection and what is acted on can be read off, which B307, B232 and D27 needed.
- **Guards (S):** the zoom's comparison as structured records (B219); the fold's done (B218).
- **No module state (S).** `html-parser.ts` sets a `writeHardBreaks` global around a parse, and
  `obsidian.ts` keeps the last text's block id for B282 at module level: context passed in instead, or
  the cache on the parser.
- **Performance (S):** the line table (B263), escaping very many lines (B275). Done: B281 to B284 (a
  quadratic line-up behind B281's argument limit among them). Add scaling checks at the APIs hosts call,
  not parsing alone.
- **HTML (M):** 17 bugs (B264 to B271, B323, B332 to B340), all P3. First one function that writes
  literal text, its escaping in one place: several bugs are a branch escaping text otherwise or not at
  all (a tag's `#`, B321; `<` before a digit, B332; an image's alt with no source, B333). Then one pass
  on `html-parser.ts`: parse a CSS declaration once; normalize on and off runs before writing
  delimiters; carry formatting through containers; Word's lists through the list builder `<ol>` uses
  (B339, B340). A wider inline representation, emitted and escaped once, only with measured coverage.
- **Drops (S):** narrow the four checks in B241 where the destination's spelling answers them.

## Not proposed

Ideas considered and left out, with why, so they don't come back unexamined:

- **A validator stage deciding what can be written.** It would have to predict the writer: a second
  model of Markdown, the very thing behind B241. The readback already answers exactly. Block-id checks
  are already central (`keepsBlockIds` in dispatch), and the refusals cited for it, B223's, are correct
  checks over wrong commands.
- **A shared move planner for keyboard, drop and drag.** B241 is one P3 bug that four narrow fixes
  close. The 17 bugs of the moves cluster are writer spelling, which planning wouldn't touch. The
  keyboard-against-drop oracle gets the benefit without the refactor. Revisit if it keeps finding
  differences.
- **Stripping a BOM and normalizing line endings at parse.** `changes` and selections are offsets into the
  host's text, and line endings are to be kept. Both would break that.
- **Grapheme-snapping every command.** Only splits and deletions need a boundary.
- **Replacing the spec with the table.** The table states intent at boundaries; the spec's worked examples
  stay. It checks them, and a disagreement is a finding.
- **One framework for Enter, Backspace and Delete.** Their differences are editing policy; take out the
  facts and invariants they share, and state the policy in the boundary table (step 6).
- **Normalizing until nothing changes.** The draft's phases are ordered for reasons (held spaces before
  structure, lists before escapes); running them to a fixpoint would hide an ordering mistake and cost
  time. Keep the phases and give them postconditions (step 5).
- **Splitting `write.ts` and `draft.ts` as the fix.** It helps reading; the bugs come from two
  representations of one layout, which step 8 is about.
- **Rewriting the writer now.** Nothing yet shows the prefix model is better; step 8 is how to find out.

## Risks

- **Step 1 makes things look worse.** The bug count will rise, likely by dozens. That is the point, but plan
  for it: triage is real work before any fix.
- **Volume finds rare shapes.** Not all of it deserves fixing. Rank by reachability and accept that some
  P3s stay refusals, on purpose.
- **Fixing to the spec entrenches it.** While step 6 is pending, a spec case that looks wrong gets a
  question, not a matching fix.
- **Agent-written fixes add cases to the writer.** Each past round did, which is how it reached 5,600
  lines. A fix that adds a special case for one shape should say why the general rule can't take it.
- **Fewer refusals can mean wrong text.** A writer change that lowers `write-failed` while the readback
  compares spelling may be writing what reads otherwise. The readback on meaning (step 1) goes first, and
  a fix's success is read, not only counted.
- **Shared helpers can change behavior quietly.** Merging two definitions moves some outcomes
  (`plainTextEdit` moved four, all splits inside a surrogate pair). `test/heavy.ts`'s `diff` against the
  last commit shows which; read that list, don't only check that it passes.

## How to tell it worked

| Measure | Now | Target |
|---|---|---|
| CI on every push | yes | yes |
| Failures per 100,000 sessions, full action set | 158+ | 0 untriaged, falling |
| Open P1 | 0 | 0 |
| The readback compares verbatim payloads as they read | where the draft kept the body (B294) | yes |
| Paths that write without the readback and block-id checks | settling's fallback | none |
| Failures whose shrunk case no bug has confirmed (a bucket's B-id isn't enough) | unknown | 0 |
| Open bugs with a running repro | all, in `test/bugs.ts` | all |
| `Deferred` with no reason | 46 sites | 0 |
| Boundary cells unstated | unknown | 0 |
| Decisions unconfirmed | 33 | 0 |
| `write-failed` bugs | 70 | decided by step 8 |

## Decisions

### Needed now

What blocks or redirects work, most urgent first:

| Question | Blocks |
|---|---|
| Is `quotes: atom`, the true-outliner setup, a main target? (D24) | Whether step 4 moves up |
| Does a host always settle as the caret leaves a line? (D22) | The rank of B238 to B240; step 5's order |
| Where does a quote's id go when Enter lands right before it? (D25) | B223 |
| When settling can't write a node and dropping its placeholder changes what an id names: write a text that keeps the id, or accept the change, as Fold20 and Regression199 record? | B240 |
| Should the volume run fail until triage is done, or only on new groups at first? | Step 1 |
| Are throws outside `executeCommand` P1? (D21) | Four ranks |
| Are autolink entities decoded, by flavor? (B247) | Parser batch |
| Are public result types free to change? | Step 7 |
| How much of D1 to D33 gets reviewed, and in what form? | Step 6 |

### Decisions to confirm

Behavior that a review, a spec case, a code comment or an earlier round called right. **None of this
is settled by the spec**: the spec is agent-written and only partly reviewed, so a case that
matches the code shows they agree, not that they're right. Each row is here to be confirmed or
overturned, and an overturned one becomes a bug with its spec case changed.

**Basis** says what the claim rests on, weakest first: `review` (a reviewer's judgment), `comment` (a
code comment or doc), `spec` (a spec case), `decided` (recorded in dev/28-bugs.md as decided with the
user). Each behavior shown was replayed on the current tree.

#### Called "not a bug" by a review

| Id | Behavior (observed) | Basis | To check |
|---|---|---|---|
| <a id="d1"></a>D1 | Enter on an empty item mid-list adds a sibling: `- a⏎- ┃⏎- b` → `- a⏎- ⏎- ┃⏎- b`. At the list's end it leaves the list. | spec (`enterOnEmptyItem: sibling`, spec/enter.md) | The two positions answer differently. Most outliners outdent or exit; `exit` and `outdent` exist as options. Is `sibling` the right default? |
| <a id="d2"></a>D2 | Outdenting a top-level item unwraps it, the items after it its list: `- a⏎- ┃b⏎- c` → `- a⏎⏎b⏎- c`. | decided (`outdentTopLevel`) | Confirm the default over `refuse`, which sixteen app setups do. |
| <a id="d3"></a>D3 | Backspace in an empty pair takes both, whoever typed it: `a $┃$`, `autoClose: ['$']` → `a `. Without `$` listed: the host's. | spec (Auto10, Auto18) | A pair the author typed loses a character they typed. |
| <a id="d4"></a>D4 | A line after a table is a row in GFM, a paragraph in Obsidian: `\| a \|⏎\|---\|⏎x` reads 1 and 2 root nodes. | comment | Is Obsidian's reading confirmed against Obsidian, or assumed? |
| <a id="d5"></a>D5 | Delete at a heading's end strips the next heading's `#`s before any join: `# a┃⏎⏎## b` → `# a⏎⏎b`. Backspace at `b` the same. | spec (backspace.md rule 2, `headingEditing: text`) | The keystroke's effect is at a distance from the caret. |
| <a id="d6"></a>D6 | In a quote atom, Delete joins the next line as written: `> a┃⏎> b` → `> a> b`, a literal `>` in the text. Backspace at `b`'s start: Deferred. | comment (`delete.ts`), which a review took as settling it | The result reads as a broken quote, and the two keys don't mirror. It rests on that comment alone. |

#### Spec or comment sanctions it; a review called it a bug

| Id | Behavior (observed) | Basis | To check |
|---|---|---|---|
| <a id="d7"></a>D7 | Enter on an empty heading is refused: `#┃`, `# ┃`, `## ┃`, `text⏎⏎# ┃` → `an empty paragraph makes no second one`, Shift-Enter too. | code path only: Enter40 is about an empty paragraph, no case covers a heading | It falls into `emptyParagraph` by accident, and the message is wrong either way. Backspace strips the `#`s; an empty item or quote has an exit. Likely leave the heading. |
| <a id="d8"></a>D8 | Enter anywhere in a table row but the last row's end is refused (`a row is a line`), at the table's very start too. | spec (Enter50, rule 11) | Obsidian moves to the next row. At least the start could follow `enterAtTextStart`, as every other block does. |
| <a id="d9"></a>D9 | A paste ending in a line break leaves a held empty last line: `- a┃` + `x⏎y⏎` → `- ax⏎  y⏎  ┃◌`; `- a┃⏎- b` + `x⏎` → `- ax⏎  ┃◌⏎- b`; `p┃` + `x⏎` → `px⏎┃`. | decided (Shift-Enter's held line), Paste26 | The commonest clipboard shape, a copied line, and Backspace there eats a line break. The decision was about Shift-Enter; its reach to paste may deserve its own look. |
| <a id="d10"></a>D10 | Fold commands on the zoom root succeed and change nothing, and a stored fold stays: `toggleFold` twice, `folded` unchanged. `# H┃` folded then zoomed: `folded` stays `[1]`, nothing shown. | comment (src/commands/README.md, "left alone") | A host's chevron gets no signal. A refusal or a distinct result would let it draw the state. |
| <a id="d11"></a>D11 | Backspace at a later line's start joins "its spaces with it, the caret staying before or past them". | comment (`backspace.ts`) | ShiftEnter21 only needs "before". See B204: likely a bug, listed because the comment claims it. |
| <a id="d12"></a>D12 | A plain-text clipboard's common indentation goes, so indented code becomes prose: `    code` → `code`. | comment (B26's status, "by design, for nested lists") | Whether a one-block fragment can be told from a nested list. B26 stays open. |
| <a id="d27"></a>D27 | Backspace on a paragraph's only character before its block id is refused: `a┃ ^id`, and `a ^id┃` under `markup: decorated` → `block-id`, `^id would name nothing`. An item's is the host's: `- a┃ ^id` deferred. | code (the block-id guard: a paragraph that is only `^id` names nothing) | Refuse, take the id with the text, or keep the paragraph some other way. Found with B232's fix, which made `é ^id` behave as `a ^id`. |

#### "Design that looks like a bug" (dev/28-bugs.md's list)

Recorded as design by earlier rounds, which reviewers were told to skip, so nobody has looked at them
since.

| Id | Behavior (observed) | Basis | To check |
|---|---|---|---|
| <a id="d13"></a>D13 | A paragraph owns the list after it: cutting `p` from `p⏎- a` takes `- a`, leaving an empty note. | spec (`listParent: paragraph`) | Very surprising the first time, and it is the default. |
| <a id="d14"></a>D14 | Paste goes after the node at the caret: cut `- a` from `- a⏎- b`, paste → `- b⏎- a`. A cut doesn't paste back. | spec (`pasteAtTextStart: after`) | `before` puts a cut back. Which is the better default? B21 and the sweep's `cut→paste` groups come from this. |
| <a id="d15"></a>D15 | Ordered lists renumber on paste and insert: `1. a┃⏎2. b` + `1. x` → `1. a⏎2. x⏎3. b`. | spec, `listNumbers` (decided) | Confirm for pasted numbers the user chose. |
| <a id="d16"></a>D16 | Shift-Enter at a paragraph's start is refused: `┃a⏎b`, `a line break here would leave an empty line inside the text`. | spec | The key is dead where every text editor makes a line. |
| <a id="d17"></a>D17 | Option defaults called "documented choices": `joinWithChildren`, `outdent: direct`, the trailing space after a bare marker (`- a┃`, Enter → `- ┃`). | comment | Each default was chosen by an agent from the SxS; never reviewed as a set. |

#### Kept by an earlier decision

| Id | Behavior (observed) | Basis | To check |
|---|---|---|---|
| <a id="d18"></a>D18 | An emptied document keeps its line break: delete the only node of `a⏎` → `⏎`. | decided | Listed for completeness. |
| <a id="d19"></a>D19 | `<li><p>` lists paste tight: → `- a⏎- b`. | decided | Listed for completeness. |
| <a id="d20"></a>D20 | Enter at the end of a paragraph owning a list makes a paragraph that takes it: `p┃⏎- a` → `p⏎⏎┃◌⏎- a`. | decided | Listed for completeness. |

#### Follows a reference or a doc; a review called it a bug

| Id | Behavior (observed) | Basis | To check |
|---|---|---|---|
| <a id="d28"></a>D28 | GFM footnotes render as cmark-gfm renders them, invalid HTML included: a reference inside a link nests an `<a>` in an `<a>` (`[before [^a] after](/page)`); a reference only in an unused definition gives that footnote a backlink to nothing (`[^unused]: [^target]`), one in an image's alt text the same; `[^a] [^a] [^a-2]` gives two `id="fnref-a-2"`; `[^é]` and `[^%C3%A9]` both `fn-%C3%A9`. | reference: cmark-gfm (PyPI `cmarkgfm` 2025.10.22) gives each byte for byte; a later review found the nesting and the dead backlinks again | Byte-compatibility with GitHub, or HTML a browser keeps as written (unique ids, backlinks with targets, no nested links). |
| <a id="d29"></a>D29 | A fence's language starting `language-` isn't prefixed again: ```` ```language-js ```` → `class="language-js"`. | comment (`html.ts`, `code_block`); commonmark.js does the same | micromark writes `language-language-js`, as CommonMark's prefix rule reads; cmark-gfm writes `lang="language-js"`. Which to follow. |
| <a id="d30"></a>D30 | A task's status under `anyStatus` (Obsidian) is one UTF-16 unit: `- [😀] task` is no task; the review found Obsidian 1.15 and SilverBullet read it so (not rechecked). | code (`gfm.ts` `makeTaskStart`, `doc/text.ts` `reCheckbox`), against their docs, "any one character" | Mend the docs, or read a code point (and its width) as a status. |
| <a id="d31"></a>D31 | An unmatched `[` turns off URL autolinks after it in the paragraph: `[before http://example.com` and `[before www.example.com` link nothing, nor does `[http://example.com]`. | cmark-gfm 2025.10.22 reads all three so (its `autolink.c` skips a URL inside an open bracket), checked; the review found remark-gfm and marked link them (not rechecked) | Keep cmark-gfm's reading, or resolve brackets first and link a URL no link holds. |
| <a id="d32"></a>D32 | A line of a tab alone after an empty item, then code: `- ⏎→⏎→x` reads `x` as the item's text (`<li>x</li>`), not an empty item and indented code. | reference: cmark-gfm reads it so; commonmark.js and micromark read the empty item and the code (checked) | The references split; which to follow. A blank line of spaces, or none, reads as all three. |
| <a id="d33"></a>D33 | A link label's limit of 999 characters counts UTF-16 units: a label of 500 emoji is no label. | reference: commonmark.js and micromark the same (checked); cmark-gfm counts UTF-8 bytes, failing at 251 emoji. CommonMark 0.31.2 says characters, code points | Count code points as the spec says, which none of the three does, or keep agreeing with the JavaScript two. |

#### Assumptions this round's ranking rests on

| Id | Assumption | Effect if wrong |
|---|---|---|
| <a id="d21"></a>D21 | Throws outside `executeCommand` (B248, B253, B257, B258) aren't P1, though the priority table says "an uncaught exception". | Four more P1s. |
| <a id="d22"></a>D22 | Every host settles placeholders as the caret leaves a line, so marks off the caret's line don't occur. Only `src/writer/settle.ts`'s comment says so. | B238, B239, B240 become reachable: P2 at least, B240 P1. (B237 is reached anyway.) |
| <a id="d23"></a>D23 | A caret on the blank line after the last node means that node, for structural commands (`touchedNodes`). B217 assumes this and asks only for consistency. | The rule flips, and Tab there does nothing. |
| <a id="d24"></a>D24 | `quotes: atom` is non-default, so its bugs are P3 (B198, B199, B200, B225, B226). `splitQuote`'s doc says the spaces go; B200 takes the option's doc over it. | The true-outliner setup relies on it: if that is a main target, B198 and B199 are P2. |
| <a id="d25"></a>D25 | An id ending a multi-block quote's last paragraph names the quote (dev/24-block-ids.md), and B223 keeps that reading. Measured in Obsidian 1.13.7 (`block-id-shapes.test.ts`): an id on the line directly under a quote or callout names it. Measured in 1.15.0 (`CachedMetadata.blocks`, `sections`, and the range a `[[note#^id]]` link highlights): `> a⏎>⏎> b ^id`, `> a ^id`, `> [!note] t⏎> body ^id`, and `^id` after the quote with or without a blank line between, each names the whole quote or callout, never the last paragraph alone. | The reading is confirmed: B223 is the commands' bug. Left: Enter right before the id, where the id goes: to the empty last paragraph, or it stays. |
| <a id="d26"></a>D26 | A survey pairing every block kind, Delete at A's end against Backspace at B's start, found 169 asymmetries, some deliberate, many not. Nothing classifies them, and its script isn't in the repo. This round looked only at those above. | Unknown: a table of intended outcomes, by node pair and command, would turn this into a list. |
