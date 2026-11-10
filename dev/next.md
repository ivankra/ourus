# What to do next (2026-11-14)

A proposal for improving ourus: what to change, in what order, and what not to do. The open bugs are in
`test/bugs.ts` (B-ids: `npm run bugs` says what is open, `node test/bugs.ts B413` shows one); what can't
be a failing case is here. Sizes are rough judgments (S a day or less, M a few days, L a week or more), not
measurements.

## Contents

- [Summary](#summary)
- [Where ourus stands](#where-ourus-stands)
  - [Numbers](#numbers)
  - [How bugs are ranked](#how-bugs-are-ranked)
  - [What causes them](#what-causes-them)
  - [Recommendations](#recommendations)
  - [What the reviews covered](#what-the-reviews-covered)
- [Principles](#principles)
- [The plan](#the-plan)
  - [Step 1: see the failures](#step-1-see-the-failures)
  - [Step 5: marks through a rewrite](#step-5-marks-through-a-rewrite)
  - [Step 6: decide the behavior](#step-6-decide-the-behavior)
  - [Column-shaped bugs](#column-shaped-bugs)
  - [Any time: smaller batches](#any-time-smaller-batches)
- [Not proposed](#not-proposed)
- [Risks](#risks)
- [How to tell it worked](#how-to-tell-it-worked)
- [Upstream bugs to report](#upstream-bugs-to-report)
- [Decisions](#decisions)
  - [Needed now](#needed-now)
  - [Decisions to confirm](#decisions-to-confirm)

## Summary

The architecture is sound: parser, outline, draft, writer, then a readback that refuses rather than
corrupts. It needs no rewrite. Two things are wrong around it:

1. **The tests saw far less than they appeared to.** Every failure is kept now and triaged by id
   (`test/bugs-untriaged.json` empty), and a baseline left behind fails its run (2026-11-14). The
   volume runs' yield has fallen to about 17 failing sessions in 100,000 a seed (seeds 851 to 1001),
   nearly all P4 shapes, half of them lost marks that are no bug; volume runs are paused (the user's,
   2026-11-14).
2. **Behavior was never reviewed as a whole.** The spec is 1,752 agent-written cases that agree with the
   code, which isn't the same as being right. There is no compact statement of intent to review.

So: make failures visible (done but for the oracles below), review the intended behavior in a table
instead of prose, and take the duplicated models out of the code.

| Step | What | Size | Takes out |
|---|---|---|---|
| 1 | Tests: the corpus, more actions, oracles | M | What a volume run adds, unread |
| 5 | Marks through a rewrite, once a key sequence reaches one | M | B413's hand-built shapes |
| 6 | Boundary table and the decisions review | M, mostly the user's time | D1–D33, B217 |

Every open bug is P4 (55, 2026-11-14). Next, the user's: the open bugs read through for the easy and
straightforward ones, each fixed with its test (`dev/30-bugs.md`). Decisions that change that order
are in [Needed now](#needed-now).

## Where ourus stands

### Numbers

| Measure | Now |
|---|---|
| `npm run test:fast` | 3,078 pass |
| `npm test` | The full run, eleven suites (`copy-paste` the eleventh, 2026-11-14), about 3 min on four cores. CI runs it on every push |
| Spec cases | 1,752 |
| Open bugs (`test/bugs.ts`) | 55: 0 P1, 0 P2, 0 P3, 55 P4; no policy question (2026-11-14; seeds 301 to 1001 triaged) |
| Bugs that are `write-failed` refusals | 44 of 55 |
| Kept failing cases (`bugs-untriaged.json`) | none untriaged; seeds 51 to 1001 filed by id |
| Writer | `write.ts` 2,756 lines, `draft.ts` 4,066, `lines.ts` 189 |
| `OurusDeferred` that is `not-done` (ourus doesn't do it here yet) | 2 sites; every deferral gives a reason |
| Sessions at the committed size (2,000) | none |
| Sessions at 100,000 (`npm run test:volume`, about 1 min) | 17, 17, 21, 16 failing sessions (seeds 851 to 1001), no throw; paused |

Most of the volume's failures are marks lost on lines a command didn't change, half of them no bug
(a mark following its block where the check follows lines), then `write-failed`, the writer's.

### How bugs are ranked

- **P1**: an uncaught exception, a view the host can't show (a hidden caret, a caret outside the
  zoom), or silent loss of text in ordinary editing.
- **P2**: a wrong result on realistic input, or an ordinary edit refused with `write-failed` (the
  readback check stops anything wrong being written; the user's edit is refused).
- **P3**: rare input (tab-led lines, padded markers), non-default options, HTML paste details.
- **P4**: rare input whose fix is large or complex (writer work for a fuzzer-built or hand-built
  shape, tab-led lines, the 9/10 marker widths): not worth fixing now (decided 2026-11-12). Reach
  raises one as it does a P3.

A bug reached from keys outranks one from hand-built state. The ranking rests on assumptions D21 and
D23; `quotes: atom` ranks as the default does (decided 2026-11-12: the true-outliner demo runs on it).

Priority is when to work on a bug, not only how bad it is. How often a bug is reached counts too. A
P3 the volume run reaches often (7 or more sessions filed under it, `// kept:`) is P2, even when each
of its shapes is rare (2026-11-11: B208, B237, B353, B377, B378). A P3 to work on with the P2s is P2
too (2026-11-11: B298, B355, B356, B358, and the volume run's B379 to B391).

### What causes them

What the volume runs keep finding (seeds 301 to 1001, none a throw or a silent wrong text; every
write failure a refusal the readback made), by how many cases each cause gives:

1. **The writer keeps every spelling it reads.** Tabs, padded markers, `>-` quotes, uneven quote
   padding, lazy lines, marker widths across 9/10: each is copied as written and its columns adjusted
   by a rule of its own, and each combination is a code path. The generator makes such shapes on
   purpose, so each run reaches combinations no earlier one did. Most P4s: the tab-led and
   shared-marker-line clusters in `test/bugs.ts`.
2. **Two models of the same lines.** The seam check (`#lastLines`, `#firstLines`, `#ownLines` in
   `draft.ts`) predicts the lines the writer will write; the writer writes its own. Each drift is a
   refusal; each found by tracing a failing case's seam (its `upper` and `lower` against what was
   written) and fixed where it drifts (dev/30-bugs.md: B467, B503, B505, B513, B515, the seed 851
   ones, B511). Open of this kind: B490, B509, B510, B512, B514, B524 (the writer lines an item up
   further left, which the check reads where it was).
3. **Marks carried by hand.** Every place that writes a node anew carries its placeholders and raised
   lines' marks itself; a place that doesn't loses one (B418, B444 to B446, B477, B478, B520).
   Cosmetic: a blank line of ours taken for the author's, an empty node no longer held.
4. **Node identity through a rewrite**: a node written anew where the draft named it (copies, shared
   container lines, a renumbered marker line) reads back with another id (B450).
5. **The marks check's noise.** A mark that moves with its block where the check follows lines, and
   alike blocks a move regroups, are reported as lost: about half of each seed's marks cases.

### Recommendations

In order of payoff:

1. **The easy P4s** (the user's, 2026-11-14): the open bugs read through, each fixed with a test where
   its mechanism is one place (dev/30-bugs.md records each).
2. **One model of the lines.** Cause 2, fixed place by place: trace a failing case's seam and fix where
   the check's lines drift from the writer's. A function both call for a node's lines as written would
   close it by construction; L, to prototype and measure first.
3. **The writings a failing command gets.** Left: B331, B369, which a later writing refuses wrongly
   (indented code into a quote, a tab-led empty item).
4. **Marks, per transform.** Not one mechanism (a pass carrying every gap's marks made 1 of 40 kept
   sessions quiet, 2026-11-13): each transform that reshapes a gap carries its marks, B444 and B477 the
   largest.
5. **The marks check: marks that follow their nodes.** A mark that moves with its block where the check
   follows lines, and alike blocks a move regroups, read as no loss.
6. **Refuse early the shapes that won't be fixed.** A P4 shape's write failure as a stated
   `not-expressible` refusal in the draft: one line each, a documented limit instead of an open bug.
7. **Text cuts that don't paste back.** A cut whose end is under a node it takes out
   (`- o«ne⏎- two⏎  »- kid`) joins now, but pasted back `kid` goes beside `two`, not under it; a cut
   from a heading into a list (`# H«ead⏎para⏎»- x`) is the host's deletion, a marker left as text
   (dev/30-bugs.md, The clipboard format, Left).

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

Not covered: one review skipped HTML, and a later one HTML and the clipboard, so the HTML bugs have had
one pass. Hand-built marks reach states sessions never do; replaying from keys told the two apart. A probe's
`marks: { placeholders }` is easy to forget: `> ` then Enter looked like a bug without it.

A design review (2026-11-06) read the session's writeup and `src/`, and replayed seven tracked bugs. It
agreed with this plan's diagnosis; what it added is folded in here: the readback on meaning and
settling's path (done), marks through a rewrite (step 5), the oracles it proposed (step 1). Its second
pass sharpened them: the expected payload read in the old context, not the new; a draft's readback
apart from the checks every edit gets; buckets, not causes; refusal counts that may rise where they
replace silent wrong successes.

To find more: `node test/sweep.ts`, `node test/sessions.ts`, `node test/conserve.ts`,
`node test/inverse.ts` (`test/README.md` says how to read them).

## Principles

- **Keep the readback, and make it see meaning.** It is why bugs are refusals. Nothing here weakens it,
  and no second model may replace it as the judge of what can be written. Where it compares spelling
  and not what the spelling reads as, a fix can lower the `write-failed` count by writing wrong text:
  close those holes before the writer changes. Every path with a draft goes through it; every path
  that writes, a host's edit included, through the checks a document alone allows (the selection, the
  view).
- **A duplicate definition is the bug.** Fix the instance by removing the copy, where that is small.
- **The spec records intent; it doesn't prove it.** Changing a spec case to match the code is a decision,
  not a fix. A spec change gets a reason, and intent gets reviewed by a person.
- **A baseline may not hide a known failure.** Each one has an id and a repro.
- **Measure before a large change.** Each big step below has a stated exit.

## The plan

### Step 1: see the failures

Everything else depends on this. Do it first, and expect the bug count to rise. `test/bugs.ts`, the
full run and CI are in place; what is left:

**Corpus (S).** `test/lib/generated-notes.ts` always ends a note with a line break: half of them shouldn't,
which is how B234, B235 and B272 hid. It rotates six option sets, of about 40 options; it should draw from
all. Add CRLF and lone-CR forms of each note, a BOM sometimes, and a block shape for each new failure family.

**Actions (S).** `test/sessions.ts` (`SESSION_ACTIONS`) never plays `selectNodeDown`, `selectNodeUp`,
`moveSubtree`, `pasteAt`, `addBlockId`, `removeBlockId`, or commands given `nodes`, where B212, B235
and B274 hid. The spec's player knows them all (`action-player.ts`); a drop's places can come from a
`drag` pickup.

**Volume (S).** Paused (the user's, 2026-11-14). Left: the other reports at volume.

**New oracles (M).** Each of these found bugs by hand, some fixed since, and none is automated:

| Oracle | Would have found |
|---|---|
| An edit gives equivalent results on LF, CRLF and CR forms of a note | B230, B231 |
| Keyboard move and drop agree on the same destination | B419 to B422 |
| Type a character, Backspace: the note comes back | B204, B245, B246 |
| Each `expandSelection` holds the last | B216 |
| `selectedSubtrees(selectionOf(roots))` gives the roots, zoomed and folded too | B212 |
| `visibleSelection` of its own result changes nothing | B212, B213 |
| Numbered lists stay sequential under `renumber` | B199, B442, B443 |
| Settling twice does what settling once does, and an abandoned placeholder that may settle goes, or is kept or refused by a stated rule (idempotence alone passes a placeholder that never settles) | B239 |
| A paste keeps the clipboard's and the note's letters in order, not only their count (`conserve.ts` compares them sorted) | B327 |
| Edit, settle, edit: the whole state checked at each boundary (text, selection, marks, view) | B276 |
| A fixed mechanism holds over its variations: spaces or tabs, a shared or separate marker line, a final line break or none, LF, CRLF and CR, a BOM, each `quotes` mode: a helper playing a case's variants against each other, as the CRLF and BOM fixes were checked by hand | B229, B230, B305 |

**Parser differential (S).** `test/parser/oracles.ts` compares generated documents with commonmark.js
and cmark-gfm, deliberate differences counted apart. Left: micromark beside them, and the corpus
(the spec's buffers, the generated notes), not generated documents alone. One reference misleads: commonmark.js shares the tab and NBSP bugs, and the
three split on B247 (decided: cmark-gfm's). cmark-gfm decides GFM questions, being
what GitHub runs (`cmarkgfm` on PyPI needs no build).

**Count refusals and deferrals (S).** A refusal costs a user too. Report the rate per command over a
fixed corpus: a command refused every time on a common shape is a failure no test counts. Tell
the expected refusals (a shape Markdown can't spell, a stated rule) from the implementation's
(`OurusFailed`), and deferrals by reason (`not-done` the backlog). The rate mostly falls, but not only: a readback that sees more turns silent wrong
successes into refusals, so a rise is allowed where each new refusal is such a case, explained.

### Step 5: marks through a rewrite

The sessions check marks on the lines a command didn't change; the raised-line bugs it found are
recommendation 4's.

Left: a mark is one of three things, a held empty node or line, a held space, an escape or closer of
ours. For each, write down what moving, splitting, joining, converting, filling and abandoning do, then
make the draft carry that. The rule behind what was B237: a mark stays valid in the written layout or
goes in the draft, never at the readback. Left of it: B413 (a quoted paragraph held past `>`,
hand-built). Size M.

### Step 6: decide the behavior

The highest-value step that isn't code, and the answer to the spec being unreviewed.

**A boundary table (M).** A data file: `(kind above, kind below, command, config subset) → outcome`, where
an outcome is `join`, `peel`, `move-caret`, `refuse(reason)` or `host`. A test walks every cell, so a
missing cell fails, and a `Deferred` only comes from a `host` entry. Delete and Backspace tables come from
one description, symmetric by construction, exceptions listed. A survey found 169 asymmetries nobody has
classified (D26); this classifies them. It is a few screens a person can read, where the spec is 1,752 cases
nobody will. The same boundary answering three ways (B202, decided since) can't hide in it, nor a
caret with no node (B217).

**Review [D1 to D33](#decisions-to-confirm) (the user's time).** Grouped so an hour goes far: defaults first
(D1, D2, D13), dead keys (D7, D8, D16), then the rest. Each answer becomes a table entry or an option,
and the spec cases follow.

**Fewer options (the user's time).** About 40 options, and each multiplies what the tests must cover. The
SxS knows which app setups use which values (their drivers' `behaves`): an option or a value no setup
and no stated user needs is a candidate to remove, with its spec cases and code.

**Check against the real apps (S).** Obsidian runs here (`sxs/obsidian/`, its `startInstance`);
`sxs/probe.ts` answers D4 (a table's
next line).

**Audit the spec by sampling (M).** Review the 91 `core` cases by hand, then a sample of `common`. Any
case whose only justification is "the code does this" gets flagged. Over time, tag cases with where their
intent came from: an app's verdict, a decision, or nothing yet.

### Column-shaped bugs

The writer stays (a prefix model was prototyped 2026-11-10 and dropped: it replaced nothing central and
removed no net code). Column-shaped families are fixed as bugs.

**What held, for whoever fixes a column-shaped bug:**

- **Column changes as data**, keyed by the parser's block and scoped to the subtree being written. They
  combine; transforms applied to a string one after another don't (B169).
- **The parser's pieces (`MdLine.prefix`) are enough**: each container's columns, its marker range,
  partial tabs. Don't read a prefix again by regex: `padded` and `markerTabs` do, and can reach past the
  prefix into content.
- **One printer rule:** copy bytes where they span their new columns, re-spell whitespace by columns
  where they don't. That fixed B278 with no special case.
- **Every prefix builder reads the same changes.** B210 and B191 were `inside()` building a container's
  prefix from its old line.
- **The printer returns copied and spelled parts**, so positions map through the existing pieces.
  Whitespace right after spelled text must be spelled with it, or a caret in text that went lands in
  the padding (`mapGone`).
- **A marker written over a line:** spell the line to take it when it's written, rather than making
  `writeOver` work by columns. Every position recorded before that pass assumes the length doesn't
  change.

### Any time: smaller batches

Independent of the steps, each a small batch:

- **Performance (S):** scaling checks at the APIs hosts call, not parsing alone.
- **HTML:** a wider inline representation, emitted and escaped once, only with measured coverage.

## Not proposed

Ideas considered and left out, with why, so they don't come back unexamined:

- **A validator stage deciding what can be written.** It would have to predict the writer: a second
  model of Markdown, the very thing behind B241. The readback already answers exactly.
- **A shared move planner for keyboard, drop and drag.** B419 to B422 are four narrow checks, each
  a P3 with a fix of its own. The 17 bugs of the moves cluster are writer spelling, which planning wouldn't touch. The
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
- **Rewriting or splitting the writer.** Prototyped: it fixed column-shaped families but replaced nothing
  central and removed no net code ([Column-shaped bugs](#column-shaped-bugs)). Splitting `write.ts` and
  `draft.ts` helps reading, not bugs.
- **Readback-guided repair.** Never (the user's, 2026-11-13; dev/30-bugs.md).

## Risks

- **Step 1 makes things look worse.** The bug count will rise, likely by dozens. That is the point, but plan
  for it: triage is real work before any fix.
- **Volume finds rare shapes.** Not all of it deserves fixing. Rank by reachability and accept that some
  P3s stay refusals, on purpose.
- **Fixing to the spec entrenches it.** While step 6 is pending, a spec case that looks wrong gets a
  question, not a matching fix.
- **Agent-written fixes add cases to the writer.** Each past round did, which is how it reached 6,800
  lines. A fix that adds a special case for one shape should say why the general rule can't take it.
- **Fewer refusals can mean wrong text.** A writer change that lowers `write-failed` may be writing what
  reads otherwise where the readback compares spelling alone; it reads verbatim code's meaning now, and a
  fix's success is read, not only counted.
- **Shared helpers can change behavior quietly.** Merging two definitions moves some outcomes
  (`plainTextEdit` moved four, all splits inside a surrogate pair). `test/heavy.ts`'s `diff` against the
  last commit shows which; read that list, don't only check that it passes.

## How to tell it worked

| Measure | Now | Target |
|---|---|---|
| Failures per 100,000 sessions, full action set | about 17 failing sessions a seed (851 to 1001; 599 at seed 51) | 0 untriaged, falling |
| Open P1 | 0 | 0 |
| Kept cases no bug has confirmed (filed by id, not by group) | 0 | 0 |
| `Deferred` that is `not-done` | 2 sites | 0 |
| Boundary cells unstated | unknown | 0 |
| Decisions unconfirmed | 26 | 0 |
| `write-failed` bugs | 44 of 55 | falling, family by family |

## Upstream bugs to report

Reminders, for the user to file: where a reference parser reads Markdown against its spec, found
while checking ourus. Each re-run 2026-11-13 (commonmark.js 0.31.2, micromark 4.0.3 with
micromark-extension-gfm 3.0.0, markdown-it 15.0.2, marked 18.0.14; cmark-gfm 0.29.0.gfm.13 by the
`cmarkgfm` Python package: `python3 -m venv v && v/bin/pip install cmarkgfm`), the inputs and
outputs in the pointer.

| Where | What | Pointer |
|---|---|---|
| CommonMark spec (an example asked for) | `<https://example.com/?a=1&amp;b=2>`: cmark decodes the entity in an autolink's address, commonmark.js, micromark, markdown-it and marked keep it; no example says | dev/30-bugs.md, Decisions, B247 |
| micromark-extension-gfm-autolink-literal | `a\+b@example.com` links nothing, `a&#43;b@example.com` (the same `+`) links `b@example.com`, the wrong mailbox; cmark-gfm links `a+b@example.com` both ways | dev/30-bugs.md, B251, "For a micromark issue" |
| cmark, micromark | `- a⏎<x>`: an HTML block of type 7 started on a lazy line, the list ended; the spec says type 7 can't interrupt a paragraph (commonmark.js, markdown-it, marked keep `<x>` in the item). micromark joined cmark since the first check | dev/08-parser.md §9.1 |
| cmark | `- a⏎  ***⏎⏎- b`: the list read tight, the blank line after a thematic break not recorded (`S_set_last_line_blank`) | dev/08-parser.md §9.2 |
| cmark, marked; markdown-it | `10. [a]: /u⏎  b`: `<li>  b</li>`, the lazy line's indentation kept as text; markdown-it ends the item | dev/08-parser.md §9.3 |
| cmark; commonmark.js | `[a]: /u⏎---`: cmark `<p>---</p>`, commonmark.js `<p></p>` before the `<hr />` (micromark, markdown-it, marked: `<hr />`) | dev/08-parser.md §9.4 |
| micromark, markdown-it; commonmark.js (a release) | `- ⏎→⏎  a`: an empty item, `a` a paragraph after the list, where cmark-gfm reads `a` in the item; commonmark.js fixed it on master after 0.31.2 (the item rule's indentation checked first) | dev/08-parser.md §9.5; dev/28-bugs.md (a review of d1a0964) |
| cmark, commonmark.js, micromark | A link label's 999-character limit: 999 `é` (1,998 bytes) is no label in cmark, 999 `😀` (1,998 UTF-16 units) none in cmark, commonmark.js or micromark; the spec counts characters (markdown-it and marked link both) | dev/28-bugs.md (a review of d1a0964) |
| cmark-gfm (GFM spec) | `> - [ ] q`, `- - [ ] n`: no task, cmark-gfm wanting the checkbox at a line's start; the GFM spec says the item's first paragraph's start (marked: a task) | dev/08-parser.md §9.6 |
| micromark (performance) | 1.5 s on a 10k-line nested outline where the other JS parsers take 10 to 30 ms; superlinear in nesting | dev/08-parser.md §9.7 |
| To check before filing | A byte-order mark: `‹BOM›# Title` is a paragraph in commonmark.js, markdown-it, marked, a heading in cmark-gfm and micromark (the spec is silent on encodings; Obsidian strips it). And the tab and NBSP bugs commonmark.js shares with ourus's old ones (dev/28-bugs.md's "what found nothing"), and B249's control characters (test/bugs.ts, the Parser cluster), neither written up with inputs | dev/28-bugs.md, B229 |

## Decisions

### Needed now

What blocks or redirects work, most urgent first:

| Question | Blocks |
|---|---|
| How much of D1 to D33 gets reviewed, and in what form? | Step 6 |
| Six refusals that apply now (a padded block after a list lifted out of it, B190, B416, B452, B483, B484's tests): keep? | nothing; kept unless overturned |
| The sweep's cut→paste check reads code by its payload, an item's too (its 12 baseline cases gone): keep? | nothing; kept unless overturned |

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

#### "Design that looks like a bug" (dev/28-bugs.md's list)

Recorded as design by earlier rounds, which reviewers were told to skip, so nobody has looked at them
since.

| Id | Behavior (observed) | Basis | To check |
|---|---|---|---|
| <a id="d13"></a>D13 | A paragraph owns the list after it: cutting `p` from `p⏎- a` takes `- a`, leaving an empty note. | spec (`listParent: paragraph`) | Very surprising the first time, and it is the default. |
| <a id="d15"></a>D15 | Ordered lists renumber on paste and insert: `1. a┃⏎2. b` + `1. x` → `1. a⏎2. x⏎3. b`. | spec, `orderedLists` (decided) | Confirm for pasted numbers the user chose. |
| <a id="d16"></a>D16 | Shift-Enter at a paragraph's start is refused: `┃a⏎b`, `a line break here would leave an empty line inside the text`. | spec | The key is dead where every text editor makes a line. |
| <a id="d17"></a>D17 | Option defaults called "documented choices": `joinWithChildren`, `outdent: direct`, the trailing space after a bare marker (`- a┃`, Enter → `- ┃`). | comment | Each default was chosen by an agent from the SxS; never reviewed as a set. |

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
| <a id="d21"></a>D21 | A throw outside `executeCommand` (a parse, a render, an extension) isn't P1, though the priority table says "an uncaught exception". None is open now; the four that were are fixed. | The next such throw ranks P1. |
| <a id="d23"></a>D23 | A caret on the blank line after the last node means that node, for structural commands (`touchedNodes`). B217 assumes this and asks only for consistency. | The rule flips, and Tab there does nothing. |
| <a id="d26"></a>D26 | A survey pairing every block kind, Delete at A's end against Backspace at B's start, found 169 asymmetries, some deliberate, many not. Nothing classifies them, and its script isn't in the repo. This round looked only at those above. | Unknown: a table of intended outcomes, by node pair and command, would turn this into a list. |
