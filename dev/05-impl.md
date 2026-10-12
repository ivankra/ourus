# Implementation notes (2026-10-12)

Two things: a study of `ourus2/`, a from-scratch rewrite built from the
redesign and thrown away, and the work on this prototype it led to. We
evolve ourus rather than replace it: blank lines got a model, commands
now describe their result as an edited outline, and an outline editor
writes it.

## 1. ourus2, and why its code went wrong

ourus2 built most of the redesign in one session: 7,300 lines, 314 tests, all 279 spec examples
passing, an incremental parser, GFM and Obsidian formats, a session and a guard. Commands cost 27–49
ms at 10,000 lines against an 8 ms budget. (Its "20,000 fuzz runs" is an `OURUS_FUZZ_RUNS` setting;
the default is 300.)

What held up, and is worth keeping:

- **Target tree, one writer, verification by re-parse.** Every encoding question lives in one
  module, and verification caught real mistakes (a setext trap, a lazy continuation, a refdef-only
  paragraph).
- **The parser as a step function** `(state, line) → (state, record)` with immutable frames: a port of
  commonmark.js, resumable for free. The incremental restart rule needs a correction: restart at the
  dirty line, converge on equal state *including* the open paragraph's content (in an outline nearly
  every line is an open paragraph, so the redesign's rule degenerates to a full parse).
- **Laziness** is what met the keystroke budget, not a faster parser.
- **Placeholders under the caret**, a `Doc` with a cached bare reading, and removal records stated by
  commands and carried while the caret stays.
- **Moves written as moves**, identity declared centrally.

Why the code still read badly:

- **The target tree leaked text offsets.** Lines were ranges of the old text, so every command that
  changed text did offset arithmetic. `commands/text.ts`: 815 lines, 43 node-kind branches.
- **The search was closures that mutated the plan**, with clone and restore around them, and magic
  strings for escapes.
- **Module-level mutable globals**, and **every command O(document)** (`targetOf(doc)` copied the
  whole outline; verification compared JSON of both outlines).
- **Built to a milestone list, not a shape:** most adapter mechanisms were patched in after a bug.

Facts the redesign lacked (to fold into it): commonmark.js removes reference definitions at
finalize, not when the paragraph closes; paragraphs owning lists means moves must re-parent nothing
and Enter mid-list hands the following items to the new paragraph; removal records are needed for
writable empty nodes too, carried while the caret stays; the stand-in character needs a space after a
bare marker; verification run with a placeholder can certify a wrong result through a wrongly mapped
caret; host readers must be opt-in (lezer misreads lists in a tab-indented quote); CodeMirror records
the selection before a change, and redo of a move needs a chosen caret.

## 2. What this prototype has now

### Blank lines: trailing gaps ([`spec/gaps.md`](spec/gaps.md))

- **A blank line belongs to the node above it**, as its trailing gap; a node's span is its own lines,
  its gap, then its children. Blank lines above the first node are the **preamble**.
- **A gap travels with its node**, except a gap that ends a scope (a parent's last child, a list's
  last item, the document's end): it stays at the scope's end, and the two nodes swap around the
  blank lines between them. In ourus a list's items and the paragraph after it are siblings, so "the
  end of a list" counts as a scope end.
- **Keys on a blank line act on the node above** (moves, Tab, Shift-Tab); in the preamble they do
  nothing. Typing and deleting on blank lines is still the host's: that is the guard's job, parked.
- Both prototypes had moved nodes around blank lines that stayed in place; ourus2 also passed typing
  on a blank line between paragraphs, which merges them.

### Edited outlines and the outline editor (`src/outline-editor.ts`)

- **Every command describes its result as an edited outline** (`EditedOutlineNode`). Untouched nodes
  are the old outline's, by reference; `editNode` copies only the path from the root to an edit.
  `from` points at the old node; `text`, `level`, `blockType` are what verification compares; `lines`,
  `marker`, `gap` are what the writer writes for new or rewritten nodes. `Sig`, `signature()` and the
  JSON comparison are gone; verification is `outlineDifference` (flat, node by node, for heading level
  changes, which re-derive sections).
- **`writeOutline(doc, edited)`** lays units out in the edited order:
  - old nodes keep their lines, shifted where they land at another column; an item that stays under
    its parent keeps its column unless that would change its nesting;
  - an arriving item (new, or from another parent) lands at its previous item's column, else at the
    old item after it, else at its parent's first-child column (a tab stop in tab-indented text),
    else at column 0, and adopts its list's bullet or number (new items take an ordered list's
    marker);
  - new and rewritten nodes are written from `lines` with the prefix of where they are;
  - gaps by the rules above; a run arriving from elsewhere takes the separation where it lands, on
    both sides, except at the document's end (the file's ending isn't a separation) and when items
    join a list after its last item (they get the list's own separation);
  - changes keep the heaviest increasing run of lines in place, lines of arriving nodes weighing
    less, so the operand is what moves and a move is written as a move;
  - `at(node, line, offset)` places a caret in written text.
- **Blank lines are searched per seam:** the writer reports the seams the edit made that could take
  one (`candidates`); `written()` in `commands.ts` tries none, then each alone, then all, as a chain
  of fallback plans, and the first that verifies is written. `separate: 'after' | 'around'` forces
  new text apart where a spec wants it (paste: around).
- **On the writer:** moves, indent, outdent, paste, joins that carry children, Enter in a heading.
  **Hand-written, on purpose:** Shift-Enter, Cmd-Backspace, joins within a node or without children,
  heading levels, splits of paragraphs and items, Backspace at a heading's start. They are local
  edits; the writer is O(n).
- `outline.ts` is back to the outline built from the syntax tree (`buildOutline` returns the root;
  `Projection` and "projection" are gone; `MutableOutlineNode` is derived from `OutlineNode`).

Numbers: `commands.ts` 1,551 → 1,261 lines; `outline-editor.ts` 801; `outline.ts` 116. Tests 248
pass, 0 fail, 66 pending (from 201/77). Promoted: B4, B5, B6 ×3, B7 ×2, pasted bullets take the
ordered marker, no escape after a task's checkbox, adopted children in a tab-indented document.
Dropped: the unclosed-HTML-comment case.

### Verified against the old code

A differential run (~273,000 command runs on generated documents, HEAD against now): nothing that
used to apply fails. About 1,950 cases that failed now apply (moves, indents, pastes, joins,
Enter). Changed results are intended: gaps traveling, items keeping their column instead of a
neighbour shifting, pasted blocks copying the separation they land in, ordered numbering on paste and
indent. Keep this harness (it lives in the session scratchpad; it belongs in `test/`).

### Then: paragraphs own lists, structure commands, quotes as containers

- **Paragraphs own the lists that follow them** in a section (`buildOutline`), all consecutive lists
  until another block. `withOwnedLists` reads an edited outline the same way (items after a
  paragraph join it; anything else in a paragraph's list ends it), and both verification and the
  writer apply it, so commands needn't. Tab on a paragraph makes it an item under the node above;
  Shift-Tab on an item of a paragraph's list makes it a paragraph after its owner. A converted node
  keeps its id, and the writer keeps its old seams (`was`). Paragraph split gives its list to the
  second half (to the paragraph, if the second half is an item).
- **Structure commands** (`spec/structure.md`, from ourus2): `deleteSubtree`, `duplicateNode`,
  `convertKind` (paragraph, item, heading 1–6) on the editor; `toggleTask` as a local edit.
- **Quotes are containers**, their blocks their children; a callout's title paragraph is its text;
  only a paragraph, heading, code or HTML block can be an item's text. The writer renders prefixes
  from the chain of containers (`> ` for a quote, an item's indentation as one run of whitespace),
  re-renders the lines of a node whose quotes changed (lazy lines stay lazy), gives blank lines the
  `>` of the quotes around them, and opens a seam to the blank-line search when a quote's `>` used
  to set its sides apart. Commands: indent into the quote above, outdent out of a quote (an emptied
  quote goes), Enter on an empty item leaves a quote, a move of everything in a quote moves the
  quote, a quote swaps with anything, paste works inside quotes.

Tests: 308 pass, 0 fail, 22 pending (quotes: 42 → 3; the left ones are a `>` without a space before
an item, and splitting a callout's title, whose semantics need a decision). The differential run
finds no command that used to apply and now fails.

## 3. Findings and learnings

- **Seams are levels.** The blank lines after a deep last descendant serve every level that ends
  there; the rule must be judged at the level of the boundary (the next node's previous sibling),
  not at the unit just written. Getting this wrong showed up as doubled or missing gaps.
- **"Same scope" depends on whether nodes arrived.** Nodes already there keep their lists (an ordered
  list then a bullet list are two scopes); arriving items join whatever list they land in.
- **Optional chaining skips argument evaluation:** `options.pad?.has(candidates++)` never counted.
- **A discriminant field must stay unique:** `isEdited` tells nodes apart by `block`; adding a
  `block` field to edited nodes silently broke paste verification (renamed `blockType`).
- **Old behavior can be an accident the spec relies on:** Enter in a heading set off a following
  list item only because the item's text is a paragraph leaf. Kept as an explicit condition; it
  becomes necessary for real once paragraphs own lists.
- **Pending cases that pass fail the run** ("drop pending"): that is how B6 surfaced as fixed by the
  writer.
- **Naming matters to the reader:** one-letter names (`l`, `n`, `p`) are gone from the code we
  touched; `l` became `lineNo` across `src/`.

## 4. Decisions taken

- Blank lines are trailing gaps, with scope ends and a preamble (§2).
- Placeholders (renamed from places; true-outliner says "place", we say "placeholder"): one under the
  caret, a `Doc` with a cached bare reading, "view" only inside `Doc`'s implementation. Room is kept
  for several (a plural `Doc` API, records keyed by node). Not built yet.
- Not deleting an abandoned empty child under text would need it rewritten with a blank line above
  (`- x` / blank / `  - `, loose); considered and set aside: we stay with placeholders.
- The edited outline and the writer form one module, the outline editor; `EditedOutlineNode` keeps
  its name.
- Easy local edits stay hand-written; structural ones use the writer.

## 5. Next

1. Done since: paragraphs owning lists, the structure commands, quotes as containers (above).
   Left: callout title splits (decide what Enter in a title means), `>` without a space.
4. Placeholders (postponed): write the session's transitions into `spec/` as a table first.
5. Later: incremental parsing (with ourus2's restart rule), then region-scoped commands (the editor's
   path copying already marks the region);
6. Open feel questions: whether pasted blocks should copy a wide separation or use one blank line;
   Backspace at a paragraph's start after a blank line; typing on a blank line between paragraphs
   (the guard).

## 6. Experiments worth running

Bets that would simplify the design a lot if they hold. Each is cheap to try on a branch, with the
spec and the differential harness as the referee.

1. **The writer can write any outline from nothing.** Generate random outlines (all nodes new, with
   lines, markers and gaps), write them into an empty document, re-parse, compare. If the writer is
   total over expressible outlines, it is a serializer, and old text only matters for keeping diffs
   small. Success: no failure the spec doesn't call inexpressible; the failures that remain become
   the list of encoding rules still missing.
2. **Every text command as an edited outline.** Split, join, Shift-Enter and Cmd-Backspace become
   edits of a node's `lines` (split a line, merge two nodes' lines), written by the writer; escapes
   become candidates the writer tries, like seams. Bet: the hand-written half of `commands.ts`
   (about 600 lines of offsets and per-kind branches) collapses into a few tree edits, and ourus2's
   failure (offsets leaking into commands) can't recur because commands never see an offset.
   Success: `commands.ts` under 600 lines, spec green, no differential regressions. Depends on 3 for
   speed.
3. **Region-scoped writing and verification.** Path copying already marks what an edit touched:
   write only the copied subtrees and the seams around them, re-parse only those lines (until the
   parser is incremental, parse a window and check it converges), and compare only the copied part
   of the outline. Bet: commands become O(edit), which makes 2 affordable for keystroke-sized edits.
   Success: a 10,000-line document under the 8 ms command budget.
4. **One prefix renderer instead of column shifting.** Render each line's prefix from its node's
   chain of containers (relative pieces, as ourus2 did), never shifting whitespace in place. Bet:
   `reindent`, the tab special cases and the "keeps its column unless" rules shrink to one function,
   and quotes and callouts as containers (42 pending cases) come almost free, as they did in ourus2.
   Risk: partial tabs and lazy lines; the differential harness will show where text that used to stay
   byte-identical now changes.
5. **Gaps as data.** Give every node in the edited outline an explicit gap (blank lines after it), set
   by one function from the old text and the edit, and make the writer only print. Bet: the seam
   rules (scope ends, landing copies, list joins) become a small pure function with its own table of
   cases, instead of being spread through the writer; spec/gaps.md becomes its test. Success: the
   seam function under 60 lines, readable as the spec's prose.
6. **Search over rules.** Where a rule chooses an encoding (an arriving item's column, a seam, an
   ordered marker, an escape), offer the writer a short list of candidates instead and keep the first
   that verifies, ranked intended, then conventional, then smallest diff. Bet: several rules we wrote
   this session (landing column, the gap exchange at scope ends) turn out to be "the smallest that
   reads right" and can be deleted. Risk: cost, since every candidate is a re-parse; bounded by 3.
7. **Commands without a `Doc`.** Write each command as a function of the outline and the caret's node
   (plus the text of that node), returning an edited outline. Bet: the reference model in
   `test/model/` and the real commands converge, so the model-based report compares behavior instead
   of two implementations of the same tree edits.

## 7. Later the same night: placeholders, speed, decisions

**Placeholders, Doc-held** (`spec/placeholders.md`, drawn one action per step). We weighed a
per-view session (dirty bit, removal records) against keeping placeholders in the `Doc`, and chose
the `Doc`: one concept, no new class; the session stays possible later, since only where the state
lives would change. Rules as built:
- only the editor makes one: a command, or a *deletion* that would change the outline at the caret
  (`Doc.apply`'s `caret` option, one rule for both cases below). Typing never makes one; typing `  - `
  by hand once made one, and leaving deleted the typed text — fixed and pinned;
- **leaving never changes what the text reads as**: an empty item stays, with a blank line above it
  (`- a` / blank / `  - `), never left to turn its parent into a heading (the user rejected both
  removing it and leaving the setext reading); an empty paragraph or an empty line in a text goes;
- **a deleted character's place**: deleting an item's first character (`- ┃a b`) would widen the
  padding (`-  b`) and detach its children; the space now at the caret becomes the placeholder,
  read as text (the parser substitutes it for interpretation only, so no column shifts). Typing fills
  it; leaving drops the surplus space. Chosen over eating the space with the character, re-indenting
  the children, or true-outliner's way (it lets the structure change and marks the surplus space in
  the UI, `docs/research/list-marker-content-column.md`);
- undo and redo: the host keeps the `Doc` with its history. The spec player stores placeholders in
  its history and records the cleanup on leaving as its own step; the CM6 demo uses
  `invertedEffects`, and puts the caret back on the placeholder before dispatching the cleanup;
- `settle` goes through the outline editor (verified; when nothing verifies, the placeholder stays).

**Speed** (`npm run bench`, 10,000 lines): a full parse is 16–19 ms, a keystroke 22–25 ms. Commands
went from 54–96 ms to 27–48 ms by writing blank-line fallbacks lazily, skipping renumbering's parse
without ordered lists, and caching `usesTabs`. What is left per command is one full write (~17 ms)
and one verification parse (~18 ms): incremental parsing is the next lever, then region-scoped
writing. The profile showed GC at 16%, mostly from per-line allocation in the parser.

**Tools**: `npm run test:diff` (`test/differential.ts`) compares every command on generated
documents against HEAD's `src/` and groups the differences, regressions first; it found the
heading/quote move crash on its first run. `npm run bench` (`test/bench.ts`).

**Decisions made**: Enter in a callout's title starts the body with the rest (a line break in the
callout's paragraph); Backspace at a paragraph's start after a blank line joins into an item above
(`- a┃b`), and after a paragraph stays the host's (one paragraph, `b` its second line). Quotes swap
with any node but a heading. `>` without a space: indenting adds the quote's optional space.

**Other changes**: `syntax/types.ts` became `src/block.ts`; `SyntaxTree` is gone (the parser returns
`{ root, lines }`, `Doc` has `blocks`). Paragraphs own every consecutive list after them (buildOutline
and `withOwnedLists` must agree; they didn't, and 2,400 random commands failed verification). The
guard cases moved to `spec/guard.md`; the open decisions to `spec/decisions.md` (none open now).

**Learnings**: draw every intermediate buffer, so each `◌` is visible; a rule that reads fine in
prose ("leaving, the empty node goes") can be wrong in the hand, so try it in the demo early; spec
every bug as it's found; a check in the tests (pending that passes fails the run) keeps the spec
honest.

**Suggestions, next**: commit; the remaining 12 pending (escapes, two host defaults, B3, B8, the
leftover paragraph's spaces, frontmatter; the guard's two); incremental parsing; the guard, specced
first like placeholders.
