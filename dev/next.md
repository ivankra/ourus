# What to do next (2026-11-09)

A proposal for improving ourus: what to change, in what order, and what not to do. The open bugs are in
`test/bugs.ts` (B-ids: `npm run bugs` says what is open, `node test/bugs.ts B237` shows one); what can't
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
  - [Step 5: marks through a rewrite](#step-5-marks-through-a-rewrite)
  - [Step 6: decide the behavior](#step-6-decide-the-behavior)
  - [Step 8: the writer's prefixes (prototyped and dropped)](#step-8-the-writers-prefixes-prototyped-and-dropped-2026-11-10)
  - [Any time: smaller batches](#any-time-smaller-batches)
- [Not proposed](#not-proposed)
- [Risks](#risks)
- [How to tell it worked](#how-to-tell-it-worked)
- [Decisions](#decisions)
  - [Needed now](#needed-now)
  - [Decisions to confirm](#decisions-to-confirm)

## Summary

The architecture is sound: parser, outline, draft, writer, then a readback that refuses rather than
corrupts. It needs no rewrite. Two things are wrong around it:

1. **The tests saw far less than they appeared to.** Green means "no worse than the baseline". The
   failing cases are kept now and were triaged to none (`test/bugs-untriaged.json`, 288 filed by id),
   but a volume run with a fresh seed brings about 250 new ones, two thirds of shapes already filed.
2. **Behavior was never reviewed as a whole.** The spec is 1,609 agent-written cases that agree with the
   code, which isn't the same as being right. There is no compact statement of intent to review.

So: first make failures visible, then review the intended behavior in a table instead of prose, and
take the duplicated models out of the code. The round of 2026-11-06 to 09 was refactoring and step 1's
first part, the triage with it (`dev/29-refactor.md`); bug fixes wait for a round of their own.

| Step | What | Size | Takes out |
|---|---|---|---|
| 1 | Tests: a triage helper, the corpus, more actions, grouping by cause, oracles | M | What a volume run adds, unread |
| 5 | Marks through a rewrite, once a key sequence reaches one | M | B237's hand-built shapes |
| 6 | Boundary table and the decisions review | M, mostly the user's time | D1–D33, B202, B217 |
| 8 | Prefix model: prototyped, dropped (2026-11-10) | — | Column-shaped families only, fixed as bugs |

Next, in order: a triage helper (step 1), then the bug round: the P2s (B346 first), the large families
(B345, B350, B348); the HTML converter's delimiter runs and formatting through containers with the HTML
bugs (they change output).
Decisions that change that order are in [Needed now](#needed-now).

## Where ourus stands

### Numbers

| Measure | Now |
|---|---|
| `npm run test:fast` | 2,708 pass, about 6 s |
| `npm test` | The full run, ten suites, about 2 min 30 s on four cores. CI runs it on every push |
| Spec cases | 1,612 |
| Open bugs (`test/bugs.ts`) | 135, 222 cases: 0 P1, 20 P2, 115 P3; 4 policy questions |
| Bugs that are `write-failed` refusals | 91 of 135 |
| Kept failing cases (`bugs-untriaged.json`) | 288 filed by id; 249 untriaged, a volume run's from seed 51 |
| Writer | `write.ts` 2,340 lines, `draft.ts` 3,129, `lines.ts` 188 |
| `OurusDeferred` that is `not-done` (ourus doesn't do it here yet) | 2 sites; every deferral gives a reason |
| Sessions at the committed size (2,000) | 50 failures in 11 groups, all filed |
| Sessions at 100,000 (`npm run test:volume`, about 2 min) | 2,284 failing sessions in 61 groups (seeds 51 to 100), no throw |

Most of the volume's failures are marks lost on lines a command didn't change (sessions check marks
since; B345 alone holds most), then `write-failed`, the writer's. Earlier rounds took the
throws and the carets off the text.

### How bugs are ranked

- **P1**: an uncaught exception, a view the host can't show (a hidden caret, a caret outside the
  zoom), or silent loss of text in ordinary editing.
- **P2**: a wrong result on realistic input, or an ordinary edit refused with `write-failed` (the
  readback check stops anything wrong being written; the user's edit is refused).
- **P3**: rare input (tab-led lines, padded markers), non-default options, HTML paste details.

A bug reached from keys outranks one from hand-built state. The ranking rests on assumptions D21, D23 and D24.

### What causes them

1. **The writer can't spell a draft**: blocks in unusual containers (a quote under an item, nested
   quotes sharing a line, a quote atom's own prefixes), lazy and tab-led continuation lines, padded
   first lines, marker widths across 9/10.
2. **Node identity through a rewrite**: a node written anew where the draft named it (copies,
   shared container lines) reads back with another id.
3. **Two models of one thing**: a shortcut beside the real logic, which drifts from it. `moveRefused`
   against the writer (B241).
4. **Marks not carried through a rewrite**: a held line or space the writer's layout no longer agrees
   with (B237).

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

**Actions (S).** `test/sessions.ts` never plays `selectNodeDown`, `selectNodeUp`, `moveSubtree`, `pasteAt`,
`addBlockId`, `removeBlockId`, or commands given `nodes`, where B212, B235 and B274 hid. The drop's places
come from a `drag` pickup, so drops can be played from what it offers.

**Group failures by cause (M).** A group's name is still the command and what failed, which mixes
unrelated bugs and counts one many times (five `selection off the text` groups were all B272, the action
after it). Group by what failed instead, the writer's message with numbers taken out, and node kinds:
that made one run 23 groups, not 66. A case is filed by its id (`// kept: <id>` in a bug's case), so a
group's name matters for reading, not for filing.

**Volume (S).** Left: running `npm run test:volume` on a schedule, rotating its seed, and the other
reports at volume.

**A triage helper, then triage (M).** A fresh seed (51) brought 249 cases, each a new id; the shapes
triage found by hand (`dev/29-refactor.md`'s last section) place 168 of them under filed bugs (B345
131), 81 to read. A helper doing what triage did: reduce a case to one command on a small note, show
the text the writer wrote where the readback refused it, suggest a bug by its shape, for a person to
confirm and file (`// kept:`).

**New oracles (M).** Each of these found bugs by hand, some fixed since, and none is automated:

| Oracle | Would have found |
|---|---|
| An edit gives equivalent results on LF, CRLF and CR forms of a note | B230, B231 |
| Keyboard move and drop agree on the same destination | B241 |
| Type a character, Backspace: the note comes back | B204, B245, B246 |
| Each `expandSelection` holds the last | B216 |
| `selectedSubtrees(selectionOf(roots))` gives the roots, zoomed and folded too | B212 |
| `visibleSelection` of its own result changes nothing | B212, B213 |
| Numbered lists stay sequential under `renumber` | B199, B211 |
| Settling twice does what settling once does, and an abandoned placeholder that may settle goes, or is kept or refused by a stated rule (idempotence alone passes a placeholder that never settles) | B239 |
| A paste keeps the clipboard's and the note's letters in order, not only their count (`conserve.ts` compares them sorted) | B327 |
| Edit, settle, edit: the whole state checked at each boundary (text, selection, marks, view) | B276 |
| A fixed mechanism holds over its variations: spaces or tabs, a shared or separate marker line, a final line break or none, LF, CRLF and CR, a BOM, each `quotes` mode: a helper playing a case's variants against each other, as the CRLF and BOM fixes were checked by hand | B229, B230, B305 |

**Parser differential (S).** `test/parser/oracles.ts` compares generated documents with commonmark.js
and cmark-gfm, deliberate differences counted apart. Left: micromark beside them, and the corpus
(the spec's buffers, the generated notes), not generated documents alone. One reference misleads: commonmark.js shares the tab and NBSP bugs, and the
three split on B247. cmark-gfm decides GFM questions, being
what GitHub runs (`cmarkgfm` on PyPI needs no build).

**Count refusals and deferrals (S).** A refusal costs a user too. Report the rate per command over a
fixed corpus: a command refused every time on a common shape is a failure no test counts. Tell
the expected refusals (a shape Markdown can't spell, a stated rule) from the implementation's
(`OurusFailed`), and deferrals by reason (`not-done` the backlog). The rate mostly falls, but not only: a readback that sees more turns silent wrong
successes into refusals, so a rise is allowed where each new refusal is such a case, explained.

### Step 5: marks through a rewrite

The sessions check marks on the lines a command didn't change; it found B345 (a raised blank line's
mark dropped where its gap is written anew), B353 (one dropped where Markdown needs it) and B372.

Left: a mark is one of three things, a held empty node or line, a held space, an escape or closer of
ours. For each, write down what moving, splitting, joining, converting, filling and abandoning do, then
make the draft carry that. The rule behind B237: a mark stays valid in the written layout or goes in the
draft, never at the readback. The sessions reach B237 now (a held space on a quote atom's later line in
an item), beside its eight hand-built shapes. Each fails for its own reason (a setext title, a quote's `>`,
code, a footnote's label, a lazy line): settling every touched text's held spaces in the draft fixes
none of them, while settling them first, as leaving does, fixes all eight. Size M.

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

**Check against the real apps (S).** Obsidian runs here (`sxs/obsidian/`, its `startInstance`);
`sxs/probe.ts` answers D4 (a table's
next line).

**Audit the spec by sampling (M).** Review the 91 `core` cases by hand, then a sample of `common`. Any
case whose only justification is "the code does this" gets flagged. Over time, tag cases with where their
intent came from: an app's verdict, a decision, or nothing yet.

### Step 8: the writer's prefixes (prototyped and dropped, 2026-11-10)

Tried on main and rolled back: `layout.ts`, an item's marker of another width as a column move, plus a
"lead" move for a marker written over a line. It closed B169, B191, B210, B278, B358, B348 and B349, and
15 kept cases passed. 25 moves into a renumbered item lined up with their siblings, and no outcome was
worse. But it replaced nothing central: `shifted`, `copyLine`'s branches, the overwrite pass and the
draft's separate prediction all stayed. It cost about 260 lines and removed no net code, which failed
the exit. Porting `shifted` wouldn't change that: its callers that pass built strings (continuations)
keep a string version alive.

**Decision:** keep the writer. Fix column-shaped families as bugs, with the design below. Refuse earlier
the P3 shapes nobody reaches from keys.

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

- **Parser (M):** email autolinks over decoded text (B251): the rule sees text nodes alone. The
  proposal: run it over each run of text, escape and entity nodes as decoded text, mapped back to the
  source, the autolink keeping the nodes it covers as its children (so `inlineEscapeAt` still finds an
  escape in it), its link the decoded text, as cmark-gfm links every case whole.
- **Performance (S):** scaling checks at the APIs hosts call, not parsing alone.
- **HTML (M):** 19 bugs (B264 to B271, B323, B332, B335 to B340, B373 to B375), all P3. Each Markdown context's
  escaping is in one place already (inline text, a block's start, a cell, a heading's end, a link's
  destination and title): B332 is a gap in the inline one. A style is parsed once (`cssOf`, done). Left:
  normalize on and off runs before writing delimiters (B264); carry formatting through containers
  (B266); Word's lists through the list builder `<ol>` uses (B339, B340). A wider inline
  representation, emitted and escaped once, only with measured coverage.

## Not proposed

Ideas considered and left out, with why, so they don't come back unexamined:

- **A validator stage deciding what can be written.** It would have to predict the writer: a second
  model of Markdown, the very thing behind B241. The readback already answers exactly.
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
- **Rewriting or splitting the writer.** Prototyped: it fixed column-shaped families but replaced nothing
  central and removed no net code (step 8). Splitting `write.ts` and `draft.ts` helps reading, not bugs.

## Risks

- **Step 1 makes things look worse.** The bug count will rise, likely by dozens. That is the point, but plan
  for it: triage is real work before any fix.
- **Volume finds rare shapes.** Not all of it deserves fixing. Rank by reachability and accept that some
  P3s stay refusals, on purpose.
- **Fixing to the spec entrenches it.** While step 6 is pending, a spec case that looks wrong gets a
  question, not a matching fix.
- **Agent-written fixes add cases to the writer.** Each past round did, which is how it reached 5,600
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
| Failures per 100,000 sessions, full action set | 2,284 failing sessions (seeds 51 to 100) | 0 untriaged, falling |
| Open P1 | 0 | 0 |
| Kept cases no bug has confirmed (filed by id, not by group) | 249 (seed 51's) | 0 |
| `Deferred` that is `not-done` | 2 sites | 0 |
| Boundary cells unstated | unknown | 0 |
| Decisions unconfirmed | 27 | 0 |
| `write-failed` bugs | 91 | falling, family by family |

## Decisions

### Needed now

What blocks or redirects work, most urgent first:

| Question | Blocks |
|---|---|
| Is `quotes: atom`, the true-outliner setup, a main target? (D24) | How far the quote atom's text-editor behavior goes, and the rank of its bugs |
| B346: fix cut's caret (past a code block's closing fence) or paste at a code block's end (after it)? | B346, P2 |
| Are autolink entities decoded, by flavor? (B247) And B251's approach, above? | Parser batch |
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

#### "Design that looks like a bug" (dev/28-bugs.md's list)

Recorded as design by earlier rounds, which reviewers were told to skip, so nobody has looked at them
since.

| Id | Behavior (observed) | Basis | To check |
|---|---|---|---|
| <a id="d13"></a>D13 | A paragraph owns the list after it: cutting `p` from `p⏎- a` takes `- a`, leaving an empty note. | spec (`listParent: paragraph`) | Very surprising the first time, and it is the default. |
| <a id="d14"></a>D14 | Paste goes after the node at the caret: cut `- a` from `- a⏎- b`, paste → `- b⏎- a`. A cut doesn't paste back. | spec (`pasteAtTextStart: after`) | `before` puts a cut back. Which is the better default? B21 comes from this. |
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
| <a id="d24"></a>D24 | `quotes: atom` is non-default, so its bugs are P3. | The true-outliner setup relies on it: if that is a main target, its bugs are P2. |
| <a id="d26"></a>D26 | A survey pairing every block kind, Delete at A's end against Backspace at B's start, found 169 asymmetries, some deliberate, many not. Nothing classifies them, and its script isn't in the repo. This round looked only at those above. | Unknown: a table of intended outcomes, by node pair and command, would turn this into a list. |
