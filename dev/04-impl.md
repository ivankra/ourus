# Implementation notes, squashed (2026-10-11)

The notes of the three sessions that followed [`03-impl.md`](03-impl.md),
all on 2026-10-11: fixes, the spec and the brief in detail (postimpl1b),
the design experiments (postimpl1c), and the reviews of the redesign
(postimpl1d). Each is reproduced verbatim under its own section, named
as the notes originally cited it and each keeping its own section numbers.

## postimpl1b

### ourus: post-implementation notes, part 2

2026-10-11, second session. Continues [`postimpl1a`](03-impl.md): a review of the prototype
and its notes, bug fixes, a new spec format, true-outliner's cases ported, a survey of how other
outliners, editors and Markdown dialects deal with empty nodes, and then every pending case fixed.
Includes a detailed reading of the brief ([`01-brief.md`](01-brief.md)) and the suggested next
steps.

*Continued in [`postimpl1c`](#postimpl1c): the design experiments of Part VII, true-outliner's
lessons revisited, and the next design.*

- **Part I:** what changed in the code and the spec, up to the TO port.
- **Part II:** findings: about ourus, true-outliner (TO), the other repos, readers and dialects.
- **Part III:** the brief, point by point: what held, what didn't, what's missing.
- **Part IV:** fixing the 24 pending cases, with stored placeholders: what changed and what it
  taught.
- **Part V:** suggestions, in order, and the decisions still open.
- **Part VI:** if ourus were rewritten from scratch: the most impactful changes to the brief, with
  phrasing to consider.
- **Part VII:** design experiments worth running before committing to a rewrite's architecture.

---

#### Status at a glance

| area | state | change since part 1 |
| --- | --- | --- |
| Tests | 202, all passing, none pending | +84 |
| Spec | 172 tests in three files: `commands.md` 69, `scenarios.md` 24, `obsidian-true-outliner.md` 79 | new format (§3), TO's cases (§4), all pending cases fixed (Part IV) |
| Commands | adds `deleteContentForward` (Delete), `deleteSoftLineBackward` (Cmd-Backspace), `insertFromPaste` (paste) | +3 |
| Parser | `startsBlock` exported; `01.` interrupts a paragraph, per the spec | 1 conformance fix |
| Identity | first-line mapping; survives indent, Enter at a node's start, `replace` | 3 fixes |
| Size | `src` ≈ 3,150 lines (commands 1,550, parser 810); tests, spec and demo ≈ 4,700 | commands +500 |
| CM6 demo | 35/35 scenarios in headless Chromium, real paste events included; Delete, Mod-Backspace and paste wired | +6 scenarios |

---

### Part I: what changed

#### 1. Fixes

Each one has spec examples or unit tests that fail without it.

| bug | cause | fix |
| --- | --- | --- |
| `Doc.replace` reset every id but the first | one whole-text change maps every position to 0 | `diffLines`: one change between the common leading and trailing *lines*, so an inserted line is an insertion at a line start |
| Ids lost on indent, and when Enter opened a line above a paragraph | a node's head start was mapped with `assoc -1`; whitespace inserted right before a node and text typed at its start land on the same offset, so no rule over offsets tells them apart | ids follow the node's **first line**: its start, mapped past insertions, keyed by kind, new line and rank among nodes on that line; a node whose whole first line was deleted is gone |
| `settle` threw `overlapping changes` | removing places on adjacent lines at the top produced overlapping deletions | `removeLines`: one change per run of adjacent lines |
| Renumbering rewrote lines no command touched | every ordered list *containing* a changed line was renumbered (`5. b` / `9. c` became `2.` / `3.` when a nested bullet was indented) | renumber only lists whose items a command added, removed or reordered, compared by node id |
| Shift-Enter before `--` was refused; Enter before `<div>` or `[a]: /u` was refused or wrote an HTML-headed item | the escape rules were a hand-written regex, missing setext `-`, HTML block starts and reference definitions | `startsBlock(text, inParagraph)` exported from the parser, built from its own regexes; Enter also asks `scanReference` |
| Backspace into `# Title #` was refused | the join point was after the closing `#`s | `headRange` ends before a closing sequence; the join inserts there and removes the joined line |
| An item whose head turned into an HTML block passed verification | the signature recorded an item's kind, not its head's block type | the signature records an atom's block type, and an item's head type when it isn't a paragraph |
| `foo` / `01. bar` read as one paragraph | the port compared `m[1] === '1'`; commonmark.js's loose `== 1` and the spec ("start number 1") accept `01` | compare the parsed number |

**New command:** `deleteContentForward`. Delete at the end of a node's text joins the node below:
Backspace at that node's start, from the other side. At a line end inside the text it joins the
next line (the inverse of Shift-Enter); on an empty item it removes the item; before a heading's
closing `#`s counts as the end of its text. CodeMirror's own Delete merged the next item's marker
into the text (`- abc` / `  - def` became `- abc  - def`).

#### 2. Corrections to part 1

Fixed in place in `postimpl1a`; recorded here because they change conclusions.

- **"true-outliner never noticed" the setext trap (§2.1)** — it did. Its
  `marker-without-trailing-space.md` records that Live Preview needs `--` for an underline while
  CommonMark takes a lone `-`, and chose to follow Live Preview. Its writer produces the shape
  knowingly.
- **"Head-line identity survived every command" (§1)** — it didn't: indenting re-identified the
  item and its subtree, and Enter at a paragraph's start re-identified the paragraph. No test
  checked ids beyond one `moveDown`. Ids now have tests for indent, Enter at the start, typing at a
  node's start and `replace`.
- **"`doc.replace` maps ids positionally" (II.7)** — it mapped nothing.

The lesson is general: a claim in notes is a claim about code at one moment, and the identity
claim had no test behind it. Notes should cite the test that backs each "done".

#### 3. The spec, reworked

`spec/README.md` is the only description of the format now. What changed and why:

- **Plain Markdown.** The CommonMark `spec.txt` convention (32-backtick `example` fences, `.`
  separators) gave way to fenced `buffer`, `clipboard` and `result` blocks with quotes listing the
  actions between them. The files read well on GitHub and in Obsidian, and the prose around
  examples is free.
- **Every state after an action is checked**, so a sequence checks its intermediate states, not
  only its last.
- **Actions are named for what the user does**, never a key: ourus commands with W3C `inputType`
  names, `"text"` typed, `insertFromPaste`, `deleteSoftLineBackward`, and caret motions named as
  CodeMirror's commands (`cursorCharLeft`, `cursorLineUp`, `cursorLineBoundaryBackward`,
  `cursorDocStart`, `select…`). The same files can drive other editors and outliners with their own
  keymaps.
- **One semantics.** There are no longer two kinds of example (single command, key sequence): every
  action plays as an editor host plays it, the ourus command first and the host's default where it
  returns `notApplicable`, with places settled after each action. Examples that expected
  `notApplicable` now show what the host's default does, which any editor can check.
- **Caret motion is monospace with tab stops of 4, and a goal column kept across up and down.** It
  exists so tests can move the caret; real editors move it as their layout dictates, and a test
  whose outcome depends on exactly where a motion lands belongs to that editor.
- **Tests under one heading are separated by `---`.** Before that, "a buffer no action leads to
  starts a test" was ambiguous after a `result` block.
- **`pending` fails once it passes**, so behavior that starts working gets promoted rather than
  forgotten. (Node's `todo` alone stays quiet.)
- **The reader is ourus's own parser.** Misplaced blocks, unknown actions, flags and options are
  errors, never silently skipped tests; `test/specfile.test.ts` covers the reader's rules.
- **Frontmatter and `key=value` options are parsed but none are defined.** `EditingPolicy` will
  define the first; an unknown option fails.

Known limits of the drawing, met while porting:

- A significant trailing space is invisible (`- ` as an empty item). Editors that strip trailing
  whitespace would break such examples silently. A `·` glyph can come when it bites.
- A buffer always ends with a line ending, so neither a missing final newline nor a caret after the
  final newline can be drawn (`∅` can come later). Tests leave places with `cursorDocStart` for
  that reason, which also keeps them independent of where vertical motion lands.
- There is no glyph for a second cursor or a node selection.

#### 4. true-outliner's cases

`spec/obsidian-true-outliner.md` holds 79 tests derived from TO: its real-app regressions
(`e2e-tests/cases/`), its Enter and Shift-Enter catalogue, shapes from its research notes, and the
rules behind its unit tests. TO is pre-release, and many of its cases record defects, so each case
draws the behavior that was *wanted*, checked against Logseq, Workflowy and Dynalist where they
have one; the prose says where it differs from TO's. 23 are `pending`: a ready-made backlog (Part IV).

The file is under MPL-2.0, as TO is, with the standard notice at its top and a line in `NOTICE`;
the rest of ourus stays MIT. Keeping TO-derived material in one file is what makes that clean.

Not ported, deliberately: cases about Obsidian's own UI (#346, the tag suggester taking the arrow
keys), node selection and multiple cursors (no notation yet), duplicates of existing examples, and
most of TO's ~600 unit tests, which are paste details, commands ourus doesn't have, or TO-specific
model rules (a paragraph owning the list after it).

---

### Part II: findings

#### 5. Empty nodes everywhere: who has placeholders, and why

None of the other repos has a placeholder concept. They avoid the problem in one of two ways.

**The file is a projection while you edit** (Logseq, tine, outl). The empty block lives in a model
(Logseq's database, tine's tree, outl's op log), and the file is regenerated from it. All three
write an empty block as a bare `-` (Logseq's `transform-content`, tine's `emit_block`, outl's
`write_block_text`), so an empty child is `- a` / `→-`. CommonMark reads that as a setext heading;
their own parsers (mldoc, tine's, outl's dialect) read an empty block. outl also writes a blank line
inside a block as a whitespace-only line carrying the indent, and its docs warn that an editor
stripping trailing whitespace silently breaks such files.

**Text-first editors write the text and read it leniently** (obsidian-outliner, SilverBullet,
Zettlr, Joplin). Enter and Tab write `- ` and its indentation; nothing tracks a node.
obsidian-outliner's Enter on an empty nested item outdents it, and on an empty top-level item
deletes it; the CodeMirror-based three use (forks of) `insertNewlineContinueMarkup`, where Enter on
an empty item removes its marker. Their *readers* disagree with CommonMark on exactly these shapes:

| source | commonmark.js, markdown-it, micromark | lezer (CodeMirror 6) | Obsidian Live Preview |
| --- | --- | --- | --- |
| `- a` / `  - ` (or bare `-`, or `→-`) | an `<h2>a</h2>` inside the item | item with an empty child | item with an empty child (setext needs `--`) |
| `* a` / `  *` | one paragraph, `a` / `*` | item with an empty child | — |
| `1. a` / `   2. b` | one paragraph, `a` / `2. b` | item with a child `2.` | nested item (TO's measurement) |

**lezer's deviation is deliberate and undocumented.** `@lezer/markdown` 1.8.0 waives the rule
that an item interrupting a paragraph can't be empty (`isBulletList`: `inList(cx,
Type.BulletList)`), and, inside an ordered list, the rule that it must start at 1 (`isOrderedList`:
`!inList(cx, Type.OrderedList)`). The README lists only unvalidated link references as a
non-conformance, and no CommonMark spec example covers a nested list starting under an item's text,
so its spec suite can't see it. It reads like an editor heuristic: while typing, Enter then Tab
shouldn't flip the parent into a heading.

**Consequences.**

- ourus and TO pay for placeholders because they read the file as CommonMark (TO approximately) and
  treat the text as the truth. Everyone else either doesn't treat the text as the truth, or reads
  it the way an editor wants.
- The two editing surfaces ourus targets first (CodeMirror 6 and Live Preview) read these shapes as
  an outliner would; everything that renders or indexes the file (reading view, `metadataCache`,
  GitHub, Pandoc, static sites) reads them as CommonMark. Files written in CodeMirror-based editors
  *will* contain them.
- An empty paragraph has no encoding in any reader. Only "everything is a block" formats avoid it,
  by not having free paragraphs.

#### 6. Dialects, measured

Measured with micromark (+ the GFM extension), Pandoc 3.11 (`markdown`, `commonmark`, `gfm`, `org`
readers), and the writers above.

| dialect | empty child under text | empty item between items | empty paragraph | other hazards |
| --- | --- | --- | --- | --- |
| CommonMark, GFM | setext `<h2>` | expressible | none | — |
| GFM, an empty *task* child `  - [ ]` | **expressible**: a nested item whose text is `[ ]` | expressible | none | it renders as text until something is typed |
| Obsidian | reading view: `<h2>`; Live Preview: empty child | expressible | none | the two surfaces disagree |
| Pandoc markdown | setext `<h2>` | expressible | none | **a list right after a paragraph needs a blank line** (`para` / `- a` is one paragraph) |
| Logseq, tine, outl | empty block (`-`) | expressible | not needed: no free paragraphs | their own grammars, which CommonMark reads differently |
| Org (pandoc's reader) | **expressible** (`-` or `- `) | expressible | none | `** ` is an empty headline; a bare `*` is text |

The setext trap is a CommonMark-family problem. Line-structured outline formats (Org, Neorg,
Logseq) can write any empty item or heading, because they have no "can't interrupt a paragraph"
rule and no underlined headings. Pandoc adds a seam rule the writer must know. Neorg wasn't
measured (no reader here).

#### 7. Placeholders should come from the caret, not be stored

Every place ourus creates sits at the caret, and `settle` drops any place the caret leaves. The
stored list in `Doc.provisional` is therefore redundant with the selection the host already has,
and storing it is what causes part 1's worst problems:

- host undo restores text and selection, but not places (problem #1 in part 1);
- `settle` runs outside history;
- a second view of the file, or a collaborator, doesn't see the places;
- every adapter has to carry them.

**Proposal:**

- **The document is a pure function of the text** (no places).
- **The editing view is a function of the text and the selection:** the line under each caret,
  when it holds no text (empty, or only container markers), is read as if a character had been
  typed at its end. The parser hook is the one ourus has; it is fed by the selection.
- **Commands already take the selection**, so they plan and verify against the editing view. The
  verifier's "retry with a place at the caret" becomes the rule.
- **Undo and redo restore the place for free**, because history restores the caret. So does a split
  view, and each collaborator's own caret.
- **Leaving is a real edit:** when the caret leaves an empty node the text can't hold, the host gets
  a cleanup edit that removes it, and records it in history (TO's rule, §9), so one undo returns to
  the empty node.
- `settle(doc, caret)` becomes `leave(doc, before, after) → cleanup | null`.

**Costs:** the editing outline changes as the caret moves between lines (a re-parse per line
change: ~3 ms at 5k lines today, nearly nothing once parsing is incremental). A caret resting on any
blank line shows the virtual node typing would create; TO renders such positions deliberately, and
drawing it is the host's choice anyway.

**The mechanism is dialect-independent** (§6): each dialect's own grammar decides which shapes
need a place, through the verifier's "try without, then with" — no per-dialect tables.
CommonMark-family dialects need one for an empty child under text, an empty paragraph and an empty
line inside a node; Org only for an empty paragraph; Logseq never.

**Why not a lenient reading (lezer/Live Preview style) instead:** it gives up the property that the
outline is what every other reader sees, and it would only help in the CommonMark family, where it
costs exactly that. It doesn't remove the need for places either (empty paragraphs). The deviations
belong in the writer rules and the test oracles: they tell us which shapes users of
CodeMirror-based editors will produce.

#### 8. Abandoning an empty node: the semantics are accidental today

What survives when the caret leaves an empty node depends on whether CommonMark needed a place for
it:

| keys from `- foo┃` (or as noted) | result after leaving |
| --- | --- |
| ⏎ | the empty `- ` item stays |
| ⏎ ⇥ | the empty child is removed (it needed a place) |
| `- a┃` / `- b`, ⏎ ⏎ | two blank lines stayed and the tight list became loose; fixed (Part IV) |

TO decided differently: an abandoned place restores the document from before the key that made it,
by a removal the creating operation states (`carried-place-removal.md`). It measured why the
simpler alternatives fail: deleting the node takes the list's trailing gap with it, or the
siblings an outdent adopted; mapping the removal through later changes misses the indentation they
added. Logseq and Workflowy instead keep an empty bullet the caret leaves.

**Suggestion:** make it a policy decision, not an encoding accident.

- An empty node Markdown can hold stays, as in Logseq and Workflowy. That is what the ported spec
  draws now.
- One it can't hold goes, *with the lines written for it*, so the document is as it was: tight
  lists stay tight. Done, by inference rather than by record (Part IV, §19).
- An `EditingPolicy` knob can offer TO's "abandon restores" for those who want clean files.

#### 9. History, from TO's specs

TO's `structural-history-integration` spec and `obsidian-runtime-gotchas.md` hold lessons ourus
will need at the adapter boundary:

- **A cursor a command chooses must be recorded for redo.** Redo replays a change set, not the
  command; moves, splits and joins land the caret where mapping puts it unless a following
  selection-only transaction records the chosen one. Indent and outdent, whose caret *is* the
  mapped position, need nothing. ourus's results should say which kind of caret they return.
- **A removal of an abandoned place is a real, undoable edit** — not an undo of the keypress (which
  would also revert what else the key did) and not an edit outside history (the demo's
  `addToHistory: false`).
- **Undo and redo bypass transaction filters.** A `judge` guard never sees them; the `StateField`
  does, so reconciliation must not depend on the guard.
- **A dispatch with no `userEvent` joins the previous undo step** within 500 ms when its changes are
  adjacent. Commands should carry their own user event (the demo's `ourus.*` does) or isolate
  history.
- **In Obsidian, `input.*` user events open editor suggesters** (`#tag`, `[[`), which then take ↑ ↓
  ⏎ ⇥ ahead of the plugin. Structural edits must not be labelled `input.*`.
- **Smart Lists' renumbering joins user transactions**, appended after the plugin's filter
  depending on precedence; filter order matters.
- **Folds are dropped on moves**, even moves that don't overlap them; TO restates folds from the
  lines they hid. With stable ids, ourus's adapter can restate them by node id.

#### 10. Changes that move text should say so

TO's `minimal-change-dispatch` spec: a relocation must be dispatched as a relocation (delete here,
insert there), not as a rewrite of everything in between, or position mapping breaks for other
cursors, decorations, folds and the redo caret. ourus does this for moves between siblings at one
column and for outdent, but rewrites the whole range for a move between differently indented
siblings (`commands.ts`, `move`), and `composeChanges` falls back to one whole-span replacement when
renumbering overlaps a moved range.

#### 11. Verification: what it proves, and what it can't

- **Re-parsing a command's own output proves nothing by itself.** TO's paste addendum: an assertion
  "the result re-parses to itself" can never fail when the result *is* the re-parse. ourus compares
  against an *expected* outline, which is stronger — but the planner builds the expected outline
  with the same helpers as the text, so a mistake made consistently in both passes.
- **Still blind:** list grouping (one list split into two), tightness, marker types and numbers,
  fence info strings, blank lines. The renumbering bug in §1 passed verification because numbers
  aren't in the signature.
- **Suggestion:** properties stated independently of the planners: "no node outside the operand
  changes parent", "no list changes tightness unless asked", "a list keeps its numbers unless its
  items change". They are cheap to check on the two outlines and catch the class of bug that
  verification can't.

#### 12. Renumbering: TO's rule

TO's tests state the rule: removing the head of `1, 2, 3` renumbers the survivor to `1`; a list
that started elsewhere keeps its start; a split takes nothing from the part it leaves behind. ourus
counts up from the smallest number left and skips single-item lists, so outdenting the first item
of a nested ordered list (`1. a` / `   1. b┃` / `   2. c` / `2. d`) and joining away a list's first
item are refused as `encoding-failed`: the item left behind keeps `2.`, and only a list starting at
1 can interrupt the paragraph above it. Fixed: a changed list renumbers from the start of the list
its first surviving item came from, single items included (Part IV, §18).

#### 13. Obsidian facts the plugin will need

From TO's notes, beyond §9:

- Live Preview reads list structure with a CodeMirror 5 stream mode: `-` needs a following space to
  be an item, the content column includes the whole run of spaces after a marker, setext needs
  `--`, and nesting is quantised to tabs and four-space groups.
- Enter inside a quote or callout arrives as a one-character replacement that re-inserts what it
  removed, which TO's diff classifier misread as a paste. Classifying intent from diffs is a
  treadmill; intercept intents.
- Cmd-Backspace on an item ran CodeMirror's visual-row deletion through the marker.
- One `EditorView` per leaf survives file switches via `setState`, which fires no update listener;
  per-view state must be keyed accordingly.

#### 14. Other findings in the code

- **The demo silently drops secondary cursors** (`command()` reads `selection.main` and dispatches
  one range). TO hit the same (its E35) and now declines multi-cursor commands instead. Until
  multi-range semantics exist, `execute` should be `notApplicable` with more than one range.
- **Untidy documents still refuse often** (part 1, §2.4). The TO port found shapes where ourus
  refused rather than wrote a separator; moving a paragraph past an adjacent quote now writes one.
- **commonmark.js is not a sufficient oracle alone**: the `01.` divergence came from porting it
  faithfully. markdown-it, micromark and Pandoc installed in seconds here, and agreed with each
  other on every shape tried.

#### 15. Process

- **The spec carried the session.** Every fix, every ported case and the format change itself were
  checked by the same 169 examples; the converter, the separator insertion and the TO port were
  mechanical because the format is data. Writing a case first (often `pending`) made each fix's
  scope obvious.
- **Probe before porting.** Running each TO shape through ourus first split them cleanly into
  "agrees", "ourus is wrong" and "TO is wrong"; most of TO's defects were already handled, and two
  of ourus's were found that way.
- **Measure claims about other software.** Three claims in the reviews and notes didn't survive
  contact with the code (TO and the setext trap, lezer "following CommonMark", identity). Installing
  a reader and running it took less time than arguing from memory.

---

### Part III: the brief, point by point

What held, what didn't, and what's missing, with the evidence from both sessions.

#### 16.1 The framing

> *Most editors are text-first … structure is bolted on … block editors are structure-first … We
> aim to marry these two approaches.*

**Good.** The diagnosis is right, and the prototype confirms the marriage is possible. Text stays
the only truth; structure is enforced by planning text changes against an intended outline and
refusing whatever the re-parse doesn't confirm.

**Sharpen it.** "Marry" is now concrete; the brief should name the mechanisms, because they are the
core's job and each adapter depends on them:

1. verification by re-parse against an intended outline;
2. caret-derived places (§7) for the states Markdown can't hold;
3. meaning-preserving encoding: escapes, marker reuse, renumbering, separators, indentation
   adoption.

It should also say which reader is the truth. §5 shows "the text" means different trees to
different readers on exactly the shapes an outliner makes. The answer the prototype and these notes
argue for: the dialect's own spec (CommonMark for Markdown), with Live Preview and lezer as readers
the writer must not confuse.

#### 16.2 Obsidian Live Preview as the primary target

> *Obsidian's live preview … often misparsing the nested structure — we can't build an outliner on
> top of shaky foundation like that!*

**Good.** Live Preview is a CodeMirror 5 stream mode, not a tree grammar, and TO's long tail of
research notes is the cost of building on it.

**Missing.** The brief doesn't say the plugin will live with *three* readers disagreeing (Live
Preview, reading view, metadata cache), nor that the disagreement is concentrated in exactly the
outliner shapes (§5). The plugin should parse as reading view does, draw structure itself, and
treat Live Preview's reading as a constraint on what the writer emits.

#### 16.3 "A robust, fully compliant parser for concrete flavors"

**Good**, and the block phase holds it: 652/652 spec examples, fuzzed against commonmark.js. The
`01.` fix shows the claim needs a panel of oracles, not one: a faithful port inherits its source's
quirks, and here the source happened to be right while the port wasn't.

**Scope it.** Inline parsing doesn't exist yet; the claim should read "block structure conforms to
CommonMark 0.31.2" until it does.

**Rethink the flavor list.** The brief lists CommonMark, GFM, Obsidian, Logseq, maybe Pandoc, then
Org and Neorg, as if they were variations on one grammar. Measured (§6), they fall into groups:

- **the CommonMark family** (CommonMark, GFM, Obsidian's reading view, Pandoc): one line machine
  with extensions and a few writer rules (Pandoc's blank line before a list);
- **block formats** (Logseq, outl): every line is a block; empty nodes are always expressible; the
  files are projections of a model in their home apps, so "compatibility" means writing what their
  parsers read;
- **line-structured outlines** (Org, Neorg): their own line machines, headline-based.

The brief's "interchangeable sublibraries, or a main library with config" maps onto that: a line
machine per group, extensions and writer rules per flavor, one outline projection and one command
set over all of them.

#### 16.4 The document model

> *Own the document model … an immutable snapshot … two related kinds of trees … text is the source
> of truth … possibly a richer stateful object (session).*

**Held:** the immutable `Doc`, the separation of syntax tree and outline, headings as containers in
the outline only.

**Adjust:**

- **Three layers, not two.** The line table (each line's container prefix pieces, leaf, ending) is
  what every command works on. It is public already; the brief should name it.
- **Text is the source of truth — of the document. The editing view is text plus selection** (§7).
  That replaces part 1's amendment ("trees derive from text and stored places"), which was the
  right observation with the wrong fix.
- **The session can stay small.** With places derived from the selection, what's left is folds and
  zoom, keyed by node id. Most hosts already have somewhere to put those.

#### 16.5 Parsing

> *serialize(parse(text)) == text for every JS string … quickly updating the tree … without a full
> reparse.*

**Good, and cheap** once text is never copied or normalised. The line table makes it a construction
invariant rather than a test.

**Incremental parsing wasn't needed yet.** A full block parse costs ~3 ms at 5k lines; a command
costs about three parses. The line-machine design (part 1, II.2) remains the way to do it when
needed, and it would also make caret-derived places (§7) nearly free.

#### 16.6 Operations

> *Two kinds: structural commands and raw text edits … W3C Input Events names … structural commands
> produce exactly their intended structure, else reject … minimal aligned text changes …
> consistently apply formatting rules.*

**Good:**

- W3C names worked: they map onto keymaps, `beforeinput` and, now, the spec's actions.
- "Exactly the intended structure, else reject" is the core idea, and verification makes it
  enforceable at runtime.
- Commands as plain data (`{type}`) made the spec, replay and the TO port trivial.

**Problems:**

- **"Minimal changes" conflicts with "meaning-preserving".** An escape, a renumbered marker or a
  separator is a change the user didn't type. The brief should say "change only what the intent
  requires, plus what keeps the rest meaning the same" — and "a relocation is dispatched as a
  relocation" (§10).
- **"Else reject" is visible to users.** On untidy documents about 3% of attempts refuse. Rejection
  needs a tidy command, messages that name the bystander, and writer rules that add a separator
  rather than refuse (moving a paragraph past a quote).
- **The brief's list of commands is incomplete for an outliner.** The TO port and the survey added
  Delete at a node's end, joins that carry children, Backspace at a heading's start, Cmd-Backspace
  that stops at chrome, and paste, which TO found to be its biggest source of late bugs. All exist
  now (Part IV); word deletion, delete subtree, duplicate, convert kind and move-to don't.
- **"Consistently apply formatting rules (list renumbering …)"** needs a precise rule. The obvious
  one ("renumber whatever's near the change") rewrote untouched lines (§1), the next one refused
  common outdents (§12), and the one that works needs the plan's intent as well as its text (§18).

#### 16.7 Results

> *A new snapshot, a diff in text space, ID events / node remappings, selection, undo hints.*

**Partly done.** Snapshot, changes and selection exist; ids are carried implicitly. Missing, with
reasons now known:

- whether the returned caret is *mapped* or *chosen* (redo needs the difference, §9);
- cleanup edits as ordinary results the host records in history (§7, §8);
- identity events, for hosts that key folds or comments by node.

#### 16.8 Raw edits

> *Mirror CodeMirror's transaction … consistency between all views must be guaranteed at all times.*

**Good**, and reconciliation (`Doc.apply` on every committed transaction) does guarantee
consistency. **The guard is needed earlier than planned** (part 1, §2.8): host defaults are where
structure breaks. The TO port adds Obsidian's evidence that guards should intercept *intents*
(keymap, `beforeinput`, paste and drop handlers) rather than classify diffs.

#### 16.9 Selections and cursors

> *Operations should take selections and cursor state … insert and block cursor shapes.*

**Not done.** Main selection only; no block cursor. The demo discards secondary cursors silently;
it should decline (§14). The spec needs glyphs for several cursors before multi-range semantics are
designed.

#### 16.10 Configuration and feel

> *Configurable via options … a more Logseq-like feel or Workflowy.*

**Good**, and the list of real decisions has grown. Part 1's §2.7 table, plus:

| decision | options |
| --- | --- |
| what an abandoned empty node does | stays where Markdown can hold it (Logseq, Workflowy) / restores the document (TO) |
| Backspace at a heading's start | joins it into the node above (Logseq, Workflowy) / turns it into a paragraph (Typora, Notion) / refuses (TO) |
| Backspace after a task's checkbox | joins, dropping the checkbox / drops the checkbox first |
| renumbering | changed lists only (now) / never / whole document |
| empty items in CommonMark-family files | removed when they can't be written / written anyway, for Live Preview and lezer users |

#### 16.11 Outline defaults

> *Headings are containers … paragraphs and code blocks are leaves … each list item owns its first
> block … empty lines TBD.*

**All good.** TO's experience confirms "paragraphs are leaves": its "a list after a paragraph is the
paragraph's child" rule (its open question Q34) re-parented bystanders on moves and made one
arrangement unwritable. Empty lines: answered by seams (part 1) and caret-derived places (§7).

#### 16.12 What stays in editors

> *Node selection, gesture interception, keybindings stay in editors/plugins.*

**Mostly right, with one correction.** In TO the plugin layer is twice the core, much of it
editor-neutral interaction logic: caret placement over chrome, motion across gaps, selection
escalation, drop targets. That logic should be core helpers every adapter calls, or every adapter
re-implements it.

#### 16.13 Testing

> *Extensively covered with tests … code could be generated from docs+tests.*

**Good, and now literal.** The spec is plain Markdown any runner can play; a CM6 runner, a textarea
runner, or another outliner's driver would replay the same files. Missing: the oracle panel
(markdown-it, micromark and Pandoc beside commonmark.js), independent postconditions (§11), and
runners beyond the core.

#### 16.14 Inspiration and process

> *repos/obsidian-true-outliner is the closest PoC … study its design, docs, history, pitfalls.*

**A good choice:** its research notes are measurements, and porting its cases found two ourus bugs.
**Caveat:** TO is pre-release and many of its cases record defects or TO-specific model choices;
port behavior selectively, checked against other outliners (§4).

#### 16.15 Missing from the brief

- **History:** what undo and redo restore (text, caret, places, ids) and who owns it. It was the top
  problem in part 1 and its causes are now understood (§7, §9).
- **More than one view of a document:** split panes, collaborators, external file changes while a
  place is open.
- **Performance budgets**, so trade-offs have a yardstick (e.g. a keystroke under 1 ms, a command
  under 8 ms at 10k lines).
- **Licences of ported material:** TO is MPL-2.0, tine's lsdoc AGPL.
- **The language question.** `parseq/README.md` wants a Rust or Go core; the brief wants
  TypeScript. TypeScript is right for the CodeMirror and Obsidian targets, and keeping the spec as
  language-neutral data keeps a later port honest.

---

### Part IV: fixing the pending cases

With stored placeholders kept as they are (the caret-derived design of §7 deferred, to see how the
current one holds up), all 24 pending cases were fixed, plus two bugs found in the demo. 202 tests,
none pending; property tests at 10,000 and 20,000 runs; the CM6 demo 35/35.

#### 17. What changed

| case | the fix |
| --- | --- |
| Outdenting or joining away the head of an ordered list was refused | renumbering by the old list's start, with the plan's intent as a second source (§18) |
| `9.` → `10.` left the item's children behind | a marker that changes width moves its item's other lines by the difference |
| In tab-indented text, indent wrote spaces on continuation lines | the tab goes where each line's piece starts, when that is a tab stop |
| Enter or Shift-Enter in a list marker split the marker | the caret acts at the item's text start |
| Shift-Enter over a selection was the host's (the line lost its indentation) | the selection is replaced, then the line breaks |
| Enter in a setext title made a two-line heading; in the underline it split the underline | split like an ATX heading; the underline acts as the title's end |
| Enter at the end of an item whose first child is a paragraph or a code block was refused | the new item is the first child, written where that child starts |
| Backspace after a task's checkbox left `- [ ]b` | the checkbox is chrome: the task joins the node above |
| Joining an item with children was refused | the children move to the node above: into the joined item's place when that node is its parent, else after its own children |
| Backspace at a heading's start deleted the space after `#` | the title joins the node above, and its section continues the one above (§16.10) |
| Shift-Enter at the start of a continuation line was refused (a demo report) | it breaks as at the end of the line above, the caret on the new line |
| Joining into an empty item above was refused (a demo report) | the text moves up into the empty item, checkbox and children included |
| Cmd-Backspace deleted the marker | `deleteSoftLineBackward` deletes back to the line's text start; at the text start, it joins |
| Moving a paragraph past an adjacent quote was refused | a blank line goes between them |
| Leaving an empty paragraph place loosened the list | the place's blank lines go with it (§19) |
| No paste | `insertFromPaste` (§20) |

#### 18. Renumbering is encoding, not a post-pass

Renumbering ran after the plan, on the planned text's parse. That breaks exactly when renumbering is
needed most: when a list loses its head, the item left behind reads `2.`, which can't interrupt the
paragraph above it, so the planned text doesn't contain the list any more, and there is nothing to
renumber. The fix reads two sources:

- the planned text's parse, for lists that still parse: renumber those whose items changed (by node
  id), from the start of the list their first surviving item came from, unless they are the lower
  part of a split, which keeps its numbers;
- the plan's *expected outline*, for the rest: an item the plan keeps in its list, which the planned
  text no longer reads as an item, renumbers from the old list's start at the position its marker
  landed.

It works, but the second source is a sign of a misplaced step. Markers are part of the encoding:
each planner should write the numbers its items end up with, as it already writes indentation, and
the post-pass should shrink to a check. That also removes a parse per command (the post-pass's
probe) and the precision lost when renumbering changes are composed into a moved range (§10).

#### 19. What stored placeholders cost

Every pending case was fixable with places stored in `Doc`, so the design holds up, but one fix
shows its weak spot. When the caret leaves an empty paragraph place, the blank lines written around
it must go too, or a tight list turns loose. A place is only an offset, and nothing records which
lines the command wrote for it, so `settle` infers them:

- it removes the place and the blank lines on both sides;
- it keeps one blank line unless what is left above and below are two items of one list (or of two
  lists that would join) with no blank line between items anywhere else.

The inference is wrong in one shape: a two-item loose list, Enter twice between the items, then
leave. It comes back tight. This is TO's lesson from the other side (§8): the removal should be
stated by the operation that made the place, not derived from the document afterwards. With
caret-derived places (§7), the cleanup edit would be a result of the command that made the place,
recorded for when the caret leaves; with stored places, a place would have to carry the lines it
owns. Either is better than inference; the first is simpler.

#### 20. Paste, and why it came easily

Paste is the largest new command, and it took little new machinery, which says something about the
architecture:

- **Destination:** where Enter would put a new node: after an item as siblings; under an item with
  children (or a paragraph or block as its first child) as first children, written where that child
  starts; at a heading's end as the section's first content; after a paragraph as following blocks.
- **Re-encoding from structure, not columns:** the payload is dedented, parsed by ourus, and each
  line rewritten: an item's marker at its new parent's content column (the next tab stop in
  tab-indented text), other lines at their offset from their owning item's content column. A payload
  indented with tabs lands in a two-space list as two-space nesting, and the reverse.
- **Separators:** blocks other than consecutive items get a blank line between them, before and
  after the payload.
- **Expected outline:** the payload's own outline, from parsing it, spliced in where it goes;
  verification does the rest.

Not done: pasting over a selection or mid-text (those are still the host's plain paste), payloads
with headings (TO's notes show re-levelling headings into a list or a section is its own design),
and ordered payloads joining an ordered list (renumbering should cover it, untested).

#### 21. Learnings

- **The planner–verifier split generalises.** Every new behavior was "compute the text, compute the
  outline it should parse to, let verification decide", and verification caught mistakes during the
  fixes, not after: the setext trap in a spec example, a heading join into the wrong node.
- **Property tests found the two real bugs the spec missed.** Both came from the tidy-outline
  property ("no command needs verification to step in"):
  - joining an item with tab-indented children shifted them from the parent's content column, where
    tab-indented children don't sit (they sit at the next tab stop);
  - Cmd-Backspace left `-  c`, and the second space moved the item's content column, so its child
    stopped being its child.

  Every new command should join that property's command list on the day it lands.
- **The content column is fragile.** Two of the bugs above, and two of the fixes (`9.` → `10.`, the
  indent unit), are about it. Anything that edits next to a marker must account for the run of
  spaces after it; anything that moves lines must measure where they actually are, not where a rule
  says they should be.
- **Generators decide what bugs can be found.** The user's two demo reports (joining into an empty
  item above, Delete on an empty item with a child) were shapes no generator produced: the
  generators have no empty items, few tasks and no headings among lists. They should, along with
  every caret position on every line, which is how the tidy property finds anything.
- **Positions that look the same should act the same.** The third report was Shift-Enter refused at
  the start of a continuation line while it worked at the end of the line above, although both are
  "between the two lines" to a user. A property can check such pairs: the end of line N and the
  start of line N+1 inside one node, the end of a node and the start of the next, a marker and the
  text start after it.
- **Spec examples can contain the traps they test.** One new example drew `- a` / `  - ` and meant an
  item with an empty child; CommonMark reads a heading, and the test failed for that reason. A lint
  should flag shapes whose reading differs between CommonMark and lezer or Live Preview (§5) unless a
  `◌` marks them.
- **"Pending fails once it passes" paid off at once.** Each fix promoted its cases by failing until
  `pending` was dropped (a small script does it); nothing was forgotten as a quietly passing todo.
- **"Text start" is one concept with many users.** Home, Cmd-Backspace, joins, and Enter and
  Shift-Enter in the marker all needed "where the text on this line starts" (past prefixes, marker,
  checkbox, `#`s). It is one function now (`textStart`); its partner, "where the text ends" (before
  closing `#`s), is spread over `headRange`. Both belong in the core's public caret helpers, which
  every adapter needs (§16.12).
- **A stale demo looks like a bug.** One report was of behavior already fixed in a newer build. The
  demo should show its build time, or reload itself when it is rebuilt.
- **`commands.ts` is 1,550 lines.** Part 1 already suggested splitting it; the fixes made the case:
  joins (Backspace, Delete, Cmd-Backspace, headings, empty items, children), splits (items, paragraphs,
  ATX and setext headings), moves and indents, renumbering, paste, and the shared encoding helpers
  (escapes, separators, indentation) are separate concerns with separate tests.

---

### Part V: suggestions, in order

What's done since the list was first written (Part IV) is gone; the rest is in order.

1. **Caret-derived places** (§7), with cleanup edits returned as results and recorded in history,
   carrying the lines they remove (§19); undo scenarios in the spec. Closes the undo problem, the
   `settle`-outside-history problem, the separator inference, and most adapter state.
2. **Split `commands.ts`** by concern (§21), and expose the caret helpers (`textStart`, text end,
   `homePosition`) as core API.
3. **Better generators:** empty items, tasks, headings among lists, paragraphs between them, every
   caret position; every command in the tidy property (§21).
4. **Markers as part of encoding** (§18): planners write final numbers; the renumbering post-pass
   becomes a check.
5. **A CM6 runner over `spec/`**, replacing the smoke test's hand-written scenarios; then a
   textarea runner as the neutrality check the brief asked for. The demo shows its build time.
6. **The oracle panel:** markdown-it, micromark (+GFM) and Pandoc as dev dependencies in the
   differential tests, plus the reader-agreement fuzz from part 1 (Live Preview approximation
   included). A spec lint for reader-ambiguous shapes (§21).
7. **The history contract in the adapter:** record chosen carets for redo, own user events, never
   `input.*`.
8. **Relocation-preserving changes** for moves between differently indented siblings (§10).
9. **Independent postconditions** in verification (§11).
10. **Paste, the rest** (§20): over a selection and mid-text; headings; ordered payloads.
11. **The commands an outliner still lacks:** word deletion that stops at chrome, delete subtree,
    duplicate, convert kind, toggle task, move-to (drag and drop); node selection and escalation;
    multiple cursors (decline until then, §14).
12. **Spec ergonomics:** headings for tests in long sections (stable names), `·` and `∅` when a case
    needs them, glyphs for several cursors before multi-range work.

#### Decisions to make

1. Caret-derived places instead of stored ones (§7)? *Recommended.*
2. Abandoned empty nodes: keep where Markdown can hold them, with TO's "restore" as an option (§8)?
   *Recommended.*
3. ~~Backspace at a heading's start~~: decided for now, join (the outliners' choice); unwrapping
   (Typora, Notion) could be an `EditingPolicy` option.
4. Empty items in CommonMark-family files: removed when they can't be written, or written anyway
   for Live Preview and lezer users, as a policy?
5. Group the flavors as line machines (CommonMark family, block formats, Org/Neorg) rather than
   one configurable grammar (§16.3)? *Recommended.*

---

### Part VI: changes to the brief for a rewrite

If ourus were rewritten from scratch for its next iteration, these are the changes to
[`01-brief.md`](01-brief.md) that would matter most, in order of impact. Each has its reason and a
suggested phrasing to consider adding to the brief.

#### 22.1 Say exactly what the truth is

The brief says "text is the source of truth"; both sessions showed that leaves the editing state
undefined. Stored placeholders were the result: session state outside the text, invisible to host
undo (§7), cleaned up by inference (§19).

> **Source of truth.** The document is a pure function of its text, read by one named reader per
> dialect (for Markdown, CommonMark 0.31.2 with the dialect's extensions). The editing view is a
> function of the text and the selection: a line under a caret that holds no text yet is read as if
> a character had been typed there, so an empty node exists while the caret is in it. When the caret
> leaves an empty node the text can't hold, the host receives a cleanup edit, stated by the command
> that made the node and recorded in history like any other edit.

#### 22.2 Name the core's mechanisms, and give encoding one owner

"Marry text-first and structure-first" became three concrete mechanisms (§16.1), and most of this
session's bugs came from encoding rules scattered over command planners: escapes, renumbering as a
post-pass (§18), separators, indentation.

> **How structure is enforced.** Every command (1) plans its text changes, (2) states the outline
> they must produce, and (3) is applied only if re-parsing the result yields exactly that outline;
> otherwise it is rejected with a typed reason. All text a command writes goes through one writer,
> which owns escapes, list markers and their numbers, separators between blocks, and indentation in
> the destination's unit. Commands change only what their intent requires, plus what keeps the rest
> of the document meaning the same; text that moves is dispatched as a move, not a rewrite.

This replaces "do minimal aligned text changes" and "consistently apply formatting rules".

#### 22.3 The line machine is the core data structure

The prototype re-parses the whole document about three times per command, and its commands grew
into one 1,550-line file of per-command planners. The line table already carried every command
(part 1, §1); making it primary, with resumable parser state, pays for incremental parsing,
region-only verification and cheap caret-derived places at once.

> **Core representation.** The parser is a line machine: deterministic per line, with its state
> after each line kept and compared, so an edit re-parses from the last stable line until the state
> converges. Each line records its container prefixes, its leaf and its ending; trees are views over
> these lines. Commands are a few primitives over the line table (place, split, join, convert, set
> level), composed by intents.
>
> **Budgets.** On a 10,000-line document: a keystroke updates the model in under 1 ms; a structural
> command, including verification, takes under 8 ms.

#### 22.4 The spec is the contract

The editor-neutral spec, the property tests and the user's demo reports found every real bug of
both sessions. The brief mentions tests; it should make the spec the deliverable they are run from.

> **Specification.** Behavior is specified as editor-neutral examples (drawn editor states and the
> user actions between them, named for intents, not keys) that every runner replays: the core, the
> CodeMirror 6 extension, a textarea, and drivers for other outliners. Parsing is checked against a
> panel of readers (commonmark.js, markdown-it, micromark, Pandoc) as well as the spec examples.
> Commands are also checked by properties independent of their planners: no node outside the operand
> changes parent; lists keep their tightness and numbers unless the command changes their items.
> Generated documents cover empty items, tasks, headings among lists and every caret position, and
> caret positions that look alike to a user must behave alike.

#### 22.5 Scope for Obsidian from day one

Obsidian Live Preview is the primary target, yet the prototype breaks on a real vault's first line:
frontmatter reads as a thematic break and a setext heading. Lists inside callouts, `^block-id`s and
tables are everyday Obsidian content.

> **Obsidian.** The Obsidian dialect is CommonMark plus GFM plus Obsidian's extensions: frontmatter
> is a preamble, quotes and callouts are containers in the outline, `^block-id`s travel with their
> node, and a minimal inline scan recognises tasks, ids and the spans a split must not cut. Live
> Preview and CodeMirror's lezer parser read some outliner shapes differently from CommonMark (an
> empty item under its parent's text, an ordered item not starting at 1); they are readers the
> writer must not confuse, checked in tests, never parse modes.

#### 22.6 The host contract belongs in the core

TO's plugin layer is twice its core, mostly logic that doesn't depend on Obsidian (§16.12), and its
history findings (§9) are needed by every host. The brief leaves all of it to "editors/plugins".

> **What hosts get from the core.** Besides the document and commands: results that say whether the
> caret they return is mapped through the changes or chosen by the command (redo needs the
> difference); cleanup edits; a guard that judges raw edits by intent (keymap, `beforeinput`, paste
> and drop handlers) rather than by diffing transactions; caret helpers (where a line's text starts
> and ends, motion over markers and gaps); node selection and its escalation from text selection;
> drop targets; render facts queryable by line range; folds and zoom keyed by node id. Commands
> decline over multiple cursors until multi-range semantics are specified.

#### 22.7 Feel is a policy, with its decisions seeded

The brief asks for configurable feel. Both sessions found that most "bugs" were feel decisions
nobody had made yet; the list exists now (part 1, §2.7; §16.10).

> **Editing policy.** Behavior users disagree on is an `EditingPolicy` option, with a documented
> default: what happens to an empty node the caret leaves; Enter on an empty item; Backspace at a
> heading's start (join or unwrap); logical or direct outdent; renumbering (changed lists, never,
> whole document); whether empty items CommonMark can't hold are removed or written anyway; the
> indent unit (detected, tab, N spaces); the bullet. Grammar correctness is never configurable.

#### 22.8 Three families of formats, not one configurable grammar

Measured (§6), the target formats differ in kind: which empty nodes they can hold, which
separators they need, how they make headings. Configuration knobs over one grammar won't cover that.

> **Formats.** Formats come in families, each with its own line machine and writer rules, sharing
> one outline projection and one command set: the CommonMark family (CommonMark, GFM, Obsidian,
> Pandoc), block formats (Logseq, outl), and line-structured outlines (Org, Neorg). A flavor within a
> family is a set of extensions and writer rules.

#### 22.9 Smaller changes

- **Demos:** CodeMirror 6 and a textarea first; GTK later, as an adapter-conformance runner.
- **Ported material:** material derived from other projects lives in its own files under their
  licences (true-outliner's cases are MPL-2.0, in `spec/obsidian-true-outliner.md`).
- **Decisions log:** a decision, once taken, is recorded with its reason, so it stays decided until
  someone reopens it on purpose.

---

### Part VII: design experiments for a rewrite

Part VI lists changes to make. These are bets: design decisions that could lead to a much better
design, but should be tried before they are adopted. Each has a hypothesis, why it would matter, a
cheap experiment, and a signal to abandon it. Most impactful first.

#### 23.1 Commands as tree edits, with one generic encoder

- **Hypothesis.** Every command is a small edit on the outline tree: indent, outdent, move, join
  with children, paste, drop, convert. One encoder turns *original text + target tree* into minimal
  text changes: it reuses each node's lines verbatim and rewrites only prefixes, markers and
  separators.
- **Why it matters.** Today each command plans its own text, and most bugs in both sessions were
  encoding bugs repeated across planners (§1, §17). Commands would shrink to a few lines each, all
  encoding knowledge would live in one place testable on its own, verification would become a
  check on the encoder, and new commands (drag and drop, convert kind, delete subtree) would come
  almost for free.
- **Experiment.** Write the encoder for list items only; re-express indent, outdent, move and the
  joins as tree edits; run the current spec and property tests against them.
- **Abandon if** the encoder can't keep moves as moves rather than rewrites (§10), or it grows more
  special cases than the planners it replaces.

#### 23.2 A writer that searches for its encoding

- **Hypothesis.** For each seam the writer touches, generate a few candidate encodings (escape or
  not, blank line or not, which marker and number, which indent unit) and keep the smallest that
  parses as intended in every configured reader: ourus, the Live Preview approximation, lezer.
- **Why it matters.** Escape tables, separator rules, renumbering cases and the setext trap become
  one mechanism, and agreement between readers holds by construction instead of being fuzzed for
  afterwards (§5, part 1 II.5).
- **Experiment.** Apply it to Enter and Shift-Enter escapes and to move separators; compare with
  today's rules on the spec; measure the cost per candidate with region-only re-parsing.
- **Abandon if** candidates multiply, or a parse per candidate breaks the latency budget even when
  parsing is incremental.

#### 23.3 Testing against a reference outliner model

- **Hypothesis.** Define each command once on a pure tree with a caret, the way Workflowy or Logseq
  behave. For random documents and random command sequences, ourus's result, read back as an
  outline, must equal the model's.
- **Why it matters.** Expected outcomes are generated rather than drawn by hand, and feel
  inconsistencies show up as disagreements with the model: the three demo reports of this session
  were exactly such cases (§21). Together with §23.1, the model's tree edits could *be* the commands.
- **Experiment.** A model of about 300 lines covering indent, outdent, move, split, join and Delete;
  a model-based property test with fast-check over the existing generators.
- **Abandon if** Markdown's exceptions (headings as sections, atoms, states the text can't hold)
  swamp the model.

#### 23.4 Identity by tree matching

- **Hypothesis.** After any change (a command, a raw edit, a paste, undo, an external file change),
  match the old outline to the new one with a fast tree diff (as GumTree does, or outl's matcher),
  instead of mapping positions; commands no longer declare identity.
- **Why it matters.** Identity broke three times (§1, §2). Raw edits, undo and external changes have
  only position heuristics today. A matcher that works everywhere also gives folds, zoom and comments
  stable anchors.
- **Experiment.** Implement the matcher; compare it with today's first-line mapping on random edit
  scripts and on undo and redo traces, checking whether ids land on the node a human would expect.
- **Abandon if** identical sibling nodes, which no information in the text tells apart, make it
  worse than mapping.

#### 23.5 The core handles every input intent

- **Hypothesis.** All input reaches the core as intents (typing, deletion at every granularity,
  paste, drop, IME commits), and the core always returns the edit: no `notApplicable`, no host
  default.
- **Why it matters.** The whole class of "the host's default broke the structure" bugs (part 1, §2.8)
  disappears, and with it the need for a guard that judges raw edits after the fact. Every host then
  behaves the same.
- **Experiment.** In the CM6 demo, intercept `beforeinput` and all keys; handle typing and word and
  line deletion in the core; see what breaks: IME, autocomplete, multiple cursors, mobile.
- **Abandon if** IME or platform input can't be intercepted reliably. A fallback has to exist
  anyway; the question is whether it becomes rare enough not to matter.

#### 23.6 Every container is a node

- **Hypothesis.** Quotes and callouts are outline containers with the same prefix algebra as items,
  and commands work uniformly inside them: indent within a callout, move items between callouts.
- **Why it matters.** Obsidian users need it daily, and a uniform container model is a
  simplification rather than a feature. The line table already records quote prefixes.
- **Experiment.** Project quotes as containers and run the item commands inside them.
- **Abandon if** lazy continuation in quotes and callout titles make the prefix algebra irregular.

#### 23.7 Together

§23.1, §23.3 and §23.2 are one bet. If they hold, ourus becomes a tree outliner (a model and tree
edits) with one verified encoder between it and the text: the brief's "marry structure-first and
text-first", made literal. That would likely halve the core and remove most of the bug classes both
sessions met. They are worth trying, in that order, before the rewrite's architecture is fixed.

## postimpl1c

### ourus: post-implementation notes, part 3

2026-10-11, third session. Continues [`postimpl1b`](#postimpl1b). This session ran the design
experiments of postimpl1b Part VII, plus §7 (placeholders from the caret), each in a throwaway
directory beside the prototype. The prototype itself (`src/`, `spec/`, `test/`) was not changed and
still passes 203/203. The experiment directories will be deleted, so this document keeps everything
worth keeping from them: mechanisms in enough detail to rebuild them, numbers, bug repros, decisions,
and what they mean for the next design.

*Continued in [`postimpl1d`](#postimpl1d): the reviews of the redesign, true-outliner's open bugs, and
Logseq as an oracle.*

- **Part I:** results at a glance.
- **Part II:** the experiments one by one: hypothesis, what was built, numbers, findings,
  suggestions.
- **Part III:** Obsidian. Other plugins and Obsidian itself interfere with input, and
  true-outliner's lessons revisited; what that changes in each experiment.
- **Part IV:** other formats (Org, Neorg, Logseq): which placeholder design suits them.
- **Part V:** what the experiments say together, and what this session taught.
- **Part VI:** bugs found in the current prototype, with repros.
- **Part VII:** the suggested architecture for the rewrite, changes to the brief, decisions to
  make, next experiments.

---

### Part I: results at a glance

| § | bet | verdict | headline |
| --- | --- | --- | --- |
| 1 (p1b §23.1) | commands as tree edits, one encoder | **holds** | Passes the spec 173/173. Moves come out as delete + insert of the same text. Changes about 30% fewer characters than the planners, and on tidy outlines agrees with them everywhere (apart from better tab units). Three new commands in 24 lines. Not smaller than the planner code it replaces. |
| 2 (p1b §23.2) | a writer that searches its encoding | **partly** | Agrees with today's rules on 96–97% of fuzz cases, fixes 45 of today's rejections and 7 encodings lezer reads differently. Needs a preference order, not "smallest wins". Only affordable with region-only re-parsing, which proved sound (10,807/10,807) and cheap (8–9-line regions, 0.03 ms). |
| 3 (p1b §23.3) | a reference outliner model for testing | **holds** | A 338-line model agrees with ourus on 95% of steps; Markdown decides 12–24% of outcomes, each by a one-line rule. Found 9 real bugs the spec missed. Its tree matches ourus's result 97% of the time, so it could be the expected outline. |
| 4 (p1b §23.4) | identity by tree matching | **hybrid** | Pure matching mislabels twins (29–34% wrong on moves). Mapping first, then matching the leftovers, gives 99.99% on commands with no declared identity; raw moves 85% → 99%; undo traces 85% → 99.9%; under 1 ms at 10k lines. |
| 5 (p1b §23.5) | the core handles every input intent | **holds in plain CM6; not adopted: the core owns only the outliner's keys (§22)** | 58 Chromium scenarios, no host default needed. CM6's `inputHandler` and keymap see everything; IME can only be judged when it commits, from `compositionend`; the leaks were other extensions, closed by a 30-line transaction filter. In Obsidian, interception can't be guaranteed (Part III): the guard becomes the primary mechanism. |
| 6 (p1b §23.6) | every container is a node | **holds** | 217/218 spec tests (the one failure is the test saying quotes are atoms). 0 `encoding-failed` on tidy quote documents at 20,000 runs. Lazy continuation costs one rule. The real irregularity was the optional space after `>`, gone with a relative prefix stack. |
| 7 (p1b §7) | placeholders from the caret, not stored | **holds, with a dirty bit; TO adds a per-view cleanup record (§11)** | 173/173. Undo restores empty nodes in 40/40 cases (stored: 13/40), and 1,999/2,000 commands behave as today. Pure §7 changed the file when the caret merely walked over it (1,002/2,000 documents). Reading and cleaning up a place only on a line edited while the caret was there fixes that (0/2,000). Code size is flat; what goes is the state. |

**One sentence:** commands become tree edits on a model, one writer encodes the tree as text and
owns every seam, column, marker and escape (choosing among a few candidates checked by the readers it
must not confuse, on a re-parsed region), identity is mapping plus matching, placeholders come from
the caret plus one bit of provenance, and in Obsidian a transaction guard judges the user edits the
keymap didn't see first and reconciles everything else.

---

### Part II: the experiments

#### 1. Commands as tree edits, with one generic encoder (p1b §23.1)

**Hypothesis.** Every structural command is a small edit on the outline tree, and one encoder turns
*original text + target tree* into minimal text changes, reusing each node's lines and rewriting only
prefixes, markers and separators. **Abandon if** it can't keep moves as moves, or grows more special
cases than the planners it replaces.

**Verdict: holds.** It passes the whole spec, keeps moves as moves, changes about 30% fewer
characters than the planners, and lets new commands be written in a few lines. It does not make the
core smaller for the commands it replaces: the gain is where encoding knowledge lives, and each
command added after it.

##### 1.1 The encoder, as built

Input: the document plus a **target tree**, a mutable copy of the outline that a command edits with
`detach`/`attach`, `merged` (one node's text joins another's last head line, for joins), or
`cloneTree` (duplicate). Output: changes, a position map, identity for every node, and the expected
outline, which is the target tree itself.

1. **Flatten** the target. The new text is `lead | own(n1) | seam | own(n2) | … | trail`, where
   *own* is a node's head lines and *seam* is the line endings and blank lines between two nodes'
   heads. Lead and trail never move. Two nodes sharing a line (`- - a`) are unsupported (falls back;
   it never happened in the spec or fuzz runs).
2. **Place markers** for each sibling group, parents first:
   - an item joining a list adopts the bullet of its nearest *resident* neighbour (an item whose
     parent didn't change);
   - ordered runs (consecutive items of one type and delimiter) keep their numbers if their
     membership is unchanged or all numbers are alike; otherwise they are renumbered from the start
     of the list their first item came from, unless they are the lower part of a split (that list's
     head opens an earlier run under the same parent), which keeps its own numbers;
   - a run that would newly interrupt a paragraph starts at 1. "Newly": only when the node above it
     or its parent changed; otherwise the text already says what it says. (Without that condition the
     rule renumbered lists nobody touched.)
   - columns: residents keep their offset from the parent's content column; **in a reorder each item
     takes its slot's column** (without it, a moved item can become its neighbour's child); newcomers
     take a resident neighbour's offset, else the parent's content column, rounded up to the next tab
     stop in tab-indented text.
3. **Write own lines** verbatim unless the node's marker or its anchor item's content column changed.
   The anchor of a line is the nearest item at or above its node (the node itself for an item's
   continuation lines). A rewritten line gets one whitespace run up to the new column, in the
   document's unit (writing the prefix and the line's own leading whitespace as two runs produced
   `"  \t"` mixtures), and the text after the anchor's prefix piece stays as it was (a partly
   consumed tab becomes spaces). Lazy lines are left alone. A merged paragraph's continuation lines
   stay verbatim wherever they still continue the paragraph. A heading's closing `#`s stay at the end
   of its line when text is joined into it.
4. **Choose seams:**
   - two nodes that stay adjacent keep their seam;
   - a new adjacency takes one by role: a parent's old inner seam (head to first child) for its new
     first child; else a sibling gap of the destination parent (the one before the node, after its
     new previous sibling, or any); after a join, the seam that followed the merged node; else the
     seam that preceded the node;
   - a paragraph right after text that would take it in lazily (a paragraph, a quote, HTML of type 6
     or 7) gets a blank line. This list is incomplete (indented code, `---`, reference definitions,
     quote after quote); see §2.
   - The first rule tried, "the k-th seam stays the k-th", was wrong for moves: moving `- a` / `  - a1`
     below a loose `- b` must keep the blank line between the two subtrees, not between a and a1.
5. **Moves stay moves.** A heaviest increasing subsequence over source offsets (weight = length, so
   long pieces stay and short ones move; a Fenwick tree, O(n log n); the first O(n²) version took
   690 ms at 10k lines) picks the pieces that stay put. Everything else is a delete at the old place
   and an insert at the new one. Touching changes are merged and trimmed; lines that keep their place
   get one change per line.
6. **Positions** map through the piece that holds them, own pieces before seams (a node's text ends
   where the next seam starts). **Identity** is declared for every node (its head start in the new
   text), so `Doc.apply` never has to guess.

Commands as tree edits: indent (move the run into the previous sibling's children), outdent (after
the parent), moves (swap with the sibling), item joins (Backspace, Delete, Cmd-Backspace at the text
start: detach, `merged` into the node above, children into the node above or into the joined node's
place), and Enter on an empty nested item (outdent) took 113 lines, most of them the planners'
guards. Everything else (split, line break, text joins, paste, heading levels) stayed with the
planners. New commands with no planner: `moveTo` (drag and drop), `deleteSubtree`, `duplicate`, 24
lines in all.

##### 1.2 Numbers

**Spec:** 173/173, as the planners. 89 of the spec's 203 command invocations go through the encoder.

**Differential against the planners** (3,000 random cases per generator, cases routed to the encoder):

| generator | both applied | same text and caret | other text | other caret | only the encoder applies | only the planner applies | changed characters (planner → encoder) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tidy outlines | 805 | 733 | 54 | 18 | 0 | 0 | 11,657 → 8,101 |
| untidy outline docs | 237 | 182 | 49 | 6 | 18 | 7 | 5,670 → 3,722 |
| rich (empty items, tasks, child blocks) | 155 | 120 | 29 | 6 | 15 | 5 | 4,691 → 2,837 |

- On tidy outlines indent, outdent and moves give identical text. The 54 differences are joins in
  tab-indented documents, where the planner writes adopted children with spaces (`\t  * x`) and the
  encoder in the document's unit (`\t\t* x`).
- "Other caret" is a caret in a moved line's indentation zone: at the line start, or after the
  inserted indentation. Cosmetic.
- Only the encoder applies: planner `encoding-failed`s and `not-expressible`s (children moving with a
  join, outdent next to tab-indented code, moves over lists with different columns). Only the planner
  applies: all untidy ordered lists with lazy continuations (`2) a` / `  ⋯* a`).
- 0 `encoding-failed` in 3,000 tidy runs; outdent undoes indent in 3,000 of 3,000.

**Moves as moves:** every move in the benchmark is two changes, the subtree's text deleted and the
same text inserted (`{from:103011, insert:"\n- item 5907 text"}`, `{from:103047, to:103064,
insert:""}`): what p1b §10 asks for, and what §4 below found makes identity unambiguous between twins.

**New commands** (2,000 cases each; the last column adds one retry candidate, "a blank line at every
new seam", which rescued 126 of 299 failures):

| command | tidy lists | mixed documents | mixed, with the retry |
| --- | --- | --- | --- |
| deleteSubtree | 96.5% | 97.4% | 98.3% |
| duplicate | 99.4% | 85.2% | 88.7% |
| moveTo (expressible targets) | 90.0% | 75.9% | 87.6% |

The failures, in order: two blocks that become adjacent and merge (two quotes, two indented code
blocks); empty items next to paragraph text; moving a heading, whose section then takes in the
siblings after it; root-level indented code.

**Cost on 10,000 lines:** planner 49–74 ms, encoder 45–55 ms per command; both dominated by full
re-parses (the encoder saves the renumbering post-pass's parse). `encode()` alone is about 27 ms,
mostly allocation, because it rebuilds the whole document.

**Size:** the replaced planner code is about 440 lines (renumbering 83, indentation helpers, indent,
outdent and relocation 207, move 60, item joins 90); the encoder is about 510 plus 60 for signatures
and verification, plus 113 lines of tree edits. The special cases (seams by role ×4, the lazy blank
line, interrupting numbers, slot columns, newcomers' columns, partial tabs, lazy and merged lines,
closing `#`s, shared lines) are about as many as the planners had, but in one place.

##### 1.3 Findings

- **The target tree is the right command interface.** Indent is 10 lines, a join 40 (mostly guards),
  duplicate 6, and the expected outline is free and exact (51 lines of hand-built `expected`
  signatures in the replaced planners go away).
- **Seams and columns are the whole problem.** Every failure and every rule is about the space
  between and before nodes' text; node text itself is never rewritten. This is where §2's search
  belongs: one retry candidate rescued 42% of the new commands' failures.
- **Heading sections break pure tree edits.** A heading moved by a tree edit takes in whatever
  follows it. Either re-derive sections after the edit (as §3's model does), or move headings only
  with their sections and only among headings.
- **Text edits stay text edits.** Split, line break, Cmd-Backspace inside text, paste mid-text and
  escapes are work inside one node's head; where they create or remove nodes they compose with a tree
  edit. Paste is already halfway: its payload is parsed into nodes the encoder could place.
- **The differential harness pays.** It found three encoder bugs in an hour (slot columns,
  interrupting numbers, the merged node's seam) and shows planner bugs as "only the encoder applies".

#### 2. A writer that searches for its encoding (p1b §23.2)

**Hypothesis.** At each seam a command writes, generate a few candidate encodings and keep the
smallest that parses as intended in every configured reader. **Abandon if** candidates multiply, or
a parse per candidate breaks the 8 ms budget even with incremental parsing.

**Verdict: partly holds.** One mechanism matches today's hand rules on 96–97% of seam hits and is
better than them where it differs, but "smallest" is the wrong objective for separators, and it is
only affordable with region-only re-parsing.

##### 2.1 What was built

A copy of `commands.ts` where every escape and separator decision calls a hook (checked to answer
exactly as `src` when left to today's rules), readers projected to a line outline (ourus,
`@lezer/markdown` 1.8 as CommonMark, lezer with GFM as a stand-in for CodeMirror and Live Preview),
and a search over the seams a command consulted. A candidate is kept only if ourus reads the intended
outline and no reader that agreed with ourus *before* the command disagrees after it.

| seam | where | candidates, in size order |
| --- | --- | --- |
| escape | the rest of a line written at a line start: Enter in items, paragraphs, ATX and setext headings; Shift-Enter; Cmd-Backspace | none · `\` before the first character (ASCII punctuation only) · `1\.` (ordered markers) · `&#N;` |
| move separator | the swap in `move()`, when the separator holds no blank line | none · a blank line |
| paste before/after | paste | none · a blank line |

Two policies: **smallest** verified candidate, and **repair**: separators keep today's choice unless
it fails, escapes take the smallest.

##### 2.2 Numbers

**Spec** (203 commands, 86 hit a seam): repair picks today's encoding in 83; smallest in 81 (2 drop
blank lines that are style, not need). In 3, no candidate keeps lezer agreeing, and today's text
breaks it too: empty items under their parent's text (`- a┃` / `  - b`, Enter, writes `- a` / `  - ` /
`  - b`, a setext heading to CommonMark and an empty child to lezer). No escape fixes that; it is the
empty-node decision (Part VII). The search makes the disagreement visible; today it is written
silently.

**Fuzz, repair policy** (2,536 runs that hit a seam; escapes: 54 openers × 17 contexts × 3 commands;
separators: every pair of 18 leaf blocks, with and without a blank line, moved up and down; paste: 12
destinations × 11 payloads):

| command | agree | search smaller | search fixes a reader break | search fixes a rejection | both fail |
| --- | --- | --- | --- | --- | --- |
| Cmd-Backspace | 731 | 27 | | 9 | 28 |
| Shift-Enter | 633 | | 3 | | |
| Enter | 571 | 14 | | | |
| move | 320 | | | 36 | 32 |
| paste | 129 | | 3 | | |

With "smallest", 10 moves and 88 pastes come out smaller by dropping blank lines today's rules add on
purpose (between a list and a quote, a fence or a paragraph, after a heading): valid, but not what a
tidy writer emits.

**Where today's rules are wrong for lezer** (the search fixes them):

```buffer
1. abc ┃2. x
```

Shift-Enter writes `1. abc` / `   2. x` today: one item to CommonMark (`2.` can't interrupt a
paragraph), a nested item to lezer. The search writes `   2\. x`.

```buffer
1. a┃
2. b
```

Pasting `- x` / `- y` writes `1. a` / `- x` / `- y` / `2. b`: ourus and commonmark.js read `2. b` as a
new list, lezer as a lazy continuation of `y`. The search adds a blank line before `2. b`.

```buffer
a | b ┃|---|---|
```

Shift-Enter writes `a | b` / `|---|---|`: a paragraph to CommonMark, a table to lezer-gfm. The search
writes `\|---|---|`. The fuzz missed it because it appended ` tail` to every rest, which spoils the
delimiter row: generators need openers that fill the whole line.

**Rejections today that the search fixes:** 36 moves of a leaf past indented code, `---` (it would
underline the paragraph) or a reference definition (it would become paragraph text), e.g.
`    code` / `para┃`, moveUp → `para` / blank / `    code`; the `absorbs` rule in `move()` knows only
quotes and HTML 6/7. And 9 Cmd-Backspace cases on `abc ┃[a]: tail` (`deleteToTextStart` doesn't call
`scanReference`, while `encodeRest` does); the search writes `\[a]: tail`.

**Escapes today doesn't need (41):** after a task's checkbox the rest isn't at the line's text start,
but today's rules escape it anyway (`- [ ] abc ┃# x`, Enter → `- [ ] \# x`; the search writes
`- [ ] # x`, and both readers agree).

**Both fail, correctly:** 32 moves next to an unclosed `<!-- c` (runs to the end of the document, no
separator helps; `[a]: /u` / `    code` likewise needs the moved block itself re-encoded), and 28
Cmd-Backspace cases in a setext title (`abc ┃- x tail` / `===`), where the planner states no escape at
all: a planner gap the search exposes but can't fix.

**Candidates:** 2.83 per run that hits a seam, 4 at most; tried in preference order, the first that
passes is on average the 1.46th. They don't multiply, as long as seams are searched one at a time:
taking the product over a long paste's block boundaries would blow up, and seams separated by a
converged unit boundary are independent anyway.

**Time, full re-parse** (Shift-Enter on the middle item, ms):

| doc | lines | `Doc.parse` | lezer parse | command today | + reader check | search, all candidates |
| --- | --- | --- | --- | --- | --- | --- |
| sections | 1,000 | 0.96 | 1.5 | 3.2 | 7.9 | 37.5 |
| sections | 10,000 | 11.0 | 21.1 | 43.6 | 111 | 515 |
| one list | 10,000 | 22.1 | 24.4 | 64.0 | 146 | 674 |

**Region-only re-parse.** The region is made of *units*: top-level blocks, with a top-level list
split into its items. It covers the units the changes touch plus one unit above (parsing only moves
forward), then one more unit below at a time until the last unit reads line for line as before (the
parser state has converged). Checked by composing old lines above, region lines and shifted old lines
below, and comparing each line's container chain, leaf, block starts and laziness with a full
re-parse: **10,807 of 10,807 sound**, 0.57 downward extensions per candidate, regions of 8–9 lines in
10,000-line documents, **0.02–0.03 ms** per region parse (ourus + lezer). The one unsound case in the
first run: ourus makes a reference definition its own block while the parser is still inside the
paragraph it was split from, so **unit boundaries must come from parser state, not the block tree**.
Not tested: incremental projection and id carrying, and region soundness for lezer.

##### 2.3 Suggestions

1. The writer is candidates plus verification: per seam, candidates in preference order (style first;
   today's rules are good first guesses), keep the first that verifies. Hand rules then only need to
   be good guesses, not correct.
2. Seams are local: search them one at a time, each on its own region; never the product over a
   command.
3. State the intent once, in logical text (unescaped, trimmed, checkbox as a field), so every
   candidate shares one intent. In the experiment each planner recomputed the expected text per
   candidate's escape.
4. The reader panel lives inside the writer: a must-not-confuse reader counts only where it agreed
   before the command. lezer now, a Live Preview approximation later. The three divergences above go
   into the spec's reader-ambiguity lint.
5. The parser exposes where its state resets, and checks convergence going down.

#### 3. Testing against a reference outliner model (p1b §23.3)

**Hypothesis.** Define each command once on a pure tree with a caret, as Workflowy or Logseq behave;
for random documents and command sequences, ourus's result read back as an outline must equal the
model's. **Abandon if** Markdown's exceptions swamp the model.

**Verdict: holds, mostly.** The model is small, Markdown adds ten one-line rules plus one
normalisation, and the model-based test found nine real issues the 172 spec examples and the property
tests missed. The exception is states the text can't hold (an empty item right after paragraph text):
that depends on which text lands where, not on the tree, so it stays with the encoder and needs a
policy.

##### 3.1 The model

A tree `{kind, level, text, task, children}` plus a caret `(node, offset in its trimmed text, without
marker, #s or checkbox)`; commands indent, outdent, moveUp/Down, insertParagraph,
deleteContentBackward/Forward; 338 lines with two modes, `pure` (any node holds anything) and `md`.
A lift (123 lines) reads a `Doc` as a model tree and maps carets both ways. The test (224 lines) runs
1–5 steps of (command, optional caret jump) through ourus exactly as the spec player does (host
defaults and `settle` included) and through the model, compares up to the first disagreement,
buckets disagreements and shrinks one example per bucket.

The model encodes ourus's documented feel decisions, a line or two each: Enter on an empty nested
item outdents, on a top-level one leaves the list; Enter at an item's start puts an empty item above,
the caret staying with the text; Enter at a paragraph's or heading's start changes nothing in the
outline; Enter in a heading makes the rest the section's first paragraph; a task's new sibling is an
unchecked task; an item with children gets the new item as its first child; joining moves the
children into the joined node's place when the node above is its parent, else to the end of the node
above; outdent is logical; a list marker typed mid-text starts the new node.

The Markdown rules (`md` mode), by how often they decided an outcome in a tidy run:
`lists-are-runs` (an item can't be reordered past a paragraph) 405, `headings-own-sections`
(re-derive sections after level changes, heading joins and moves; 20 lines) 333, `line-ends-trimmed`
271, `section-is-not-a-level` (an item can't outdent out of a heading's section) 103,
`only-items-hold-items` 60; in single or low double digits `atoms-take-no-text`, `only-items-indent`,
`leaves-hold-nothing`, `setext-has-two-levels`, `heading-is-one-line`, `typed-marker-starts-node`.

##### 3.2 Numbers

| command | md, tidy | md, loose | pure |
| --- | --- | --- | --- |
| formatIndent | 99.3% | 99.8% | 86.3% |
| formatOutdent | 99.6% | 99.8% | 91.9% |
| moveUp | 99.1% | 95.2% | 80.1% |
| moveDown | 97.7% | 98.1% | 83.9% |
| insertParagraph | 87.1% | 86.3% | 87.4% |
| deleteContentBackward | 94.0% | 90.6% | 79.0% |
| deleteContentForward | 90.3% | 86.9% | 78.5% |
| **all** | **95.2%** (10,562 steps) | **93.8%** (9,045) | **83.9%** (4,328) |

Markdown rules decided 11.8% of tidy and 23.6% of loose steps. Without them agreement drops to 84%,
almost all of it ourus refusing where a tree outliner would act: the price of Markdown, each rule a
single guard. **As the verifier's expected outline:** of 3,633 tidy steps ourus applied, the model's
tree matches 3,524 (97.0%); loose 2,908 of 2,987 (97.4%). The rest is whitespace at join points and
undecided checkbox behavior.

Disagreements: about 60% real ourus issues, 15% decisions nobody has made, 15% the setext trap
(policy needed), 10% model or harness limits. The bugs are in Part VI (B1–B9).

##### 3.3 Findings and suggestions

- **The model doesn't drown in Markdown.** Every Markdown rule is a refusal or a normalisation; none
  changes how a command works on the nodes it can act on. **The encoding is what can't be modelled**:
  the setext trap, separators and content-column effects depend on which text ends up adjacent. That
  matches §1's split: the model edits the tree, the encoder writes it, verification checks the
  encoder.
- **Feel decisions become visible.** The empty task, Enter on an empty heading, Backspace at a
  paragraph's start after a blank line: decisions nobody wrote down, which the model forces to be
  written once.
- **The bugs it found are the kind the demo reports were:** positions that look alike acting
  differently, and host defaults breaking structure.
- Make the model the command definition, not only the oracle, with signatures that compare semantic
  text (unescaped, trimmed, checkbox as a field) and an `EditingPolicy` carried by the model.
- One `isEmpty(node)`, with the checkbox as chrome.
- `encoding-failed` fails the property test, rather than staying under 5%; untidy input that can't
  be expressed is refused as `not-expressible` by a check before planning.
- Keep the model-based test as a permanent suite, with every command in it on the day it lands,
  generators with empty items, tasks, headings among lists and paragraphs, a per-class budget, and
  shrunk buckets printed as spec drawings ready to paste as `pending` examples. Selections,
  Shift-Enter, Cmd-Backspace (10–20 lines each) and paste (the fragment is already a model tree) are
  still missing.

#### 4. Identity by tree matching (p1b §23.4)

**Hypothesis.** After any change, match old outline to new with a fast tree diff instead of mapping
positions; commands stop declaring identity. **Abandon if** identical siblings make it worse than
mapping.

**Verdict: pure matching fails the abandon test; mapping plus matching beats both.**

##### 4.1 The matcher

GumTree-style phases: **T** identical subtrees whose hash is unique on both sides, largest first;
**A** an order-preserving LCS of preorder `(kind, head text)` keys; **B** exact keys anywhere, scored
by parent agreement and nearness (moves); **C** bottom-up, a container takes the old container holding
most of its matched descendants (dice ≥ 0.5); **D** similarity, normalised Levenshtein ≥ 0.5, same
kind, parent agreement or a ±20 window, with a bonus for a common prefix (a join or split keeps the node
it starts with); **E** gaps matched by position under matched parents (outl's "level 1.5").

The **lean hybrid**, as a host would run it: `Doc.apply`'s mapped ids first, then LCS by key and
similarity over only the fresh new nodes and the unclaimed old ones. **Tombstones:** old nodes nobody
claimed stay for a few transactions, so a later paste can claim them.

Ground truth: for commands, the ids the command produced (biased towards mapping); for raw edits, a
hidden token (`U+2063 n U+2063`) at the start of each node's text; for undo, the original ids.

##### 4.2 Numbers

| case | mapping | pure matcher | lean hybrid |
| --- | --- | --- | --- |
| commands, no identity declared, diverse text: wrong / missed | 0% / 2.8% | 0.9% / 0.5% | 0.01% / 0% |
| commands, duplicate texts | 0% / 3.2% | 2.0% / 0.3% | 0.03% / 0% |
| twins (`- a` ×n), moveUp | 0% / 33.6% | **29.2% wrong** | 0% / 0% |
| twins (empty items), all commands | 0% / 11.4% | **21.5% wrong** | 0% / 0% |
| raw: move 1–4 lines, recall / wrong | 86.4% / 0.1% | 98.8% / 0.5% | 98.9% / 0.3% |
| raw: move a subtree | 84.3% / 0% | 99.7% / 0% | 99.7% / 0% |
| external reorder of siblings, diverse | 49.9% / 0% | 99.7% / 0.1% | 99.6% / 0.1% |
| external reorder, duplicates | 46.1% / 0% | 93.0% / 5.5% (1.0% not twins) | 86.1% / **11.2%** |
| undo of one command, recall | 97.3% | 98.7% | **100%** |
| 5 commands then 5 undos, kept | 85.7% | 97.2% | **99.9%** |
| cut, then paste later | 86.1% | — | 86.1%, with tombstones **99.3%** |
| cost at 10k lines (on top of `Doc.apply`) | — | 6–8 ms | **< 1 ms** |

Deletions are 2–4% "wrong" for every method: a deletion that merges two nodes' lines has no single
right answer. Undo also recreates 1–3% of nodes, which only history can re-identify. A variant that
distrusts mapping on any touched line is *worse* (2–4% wrong): it hands the matcher ambiguous choices
mapping had already settled.

##### 4.3 Findings and suggestions

- **The change set carries identity.** When a move is written as delete + insert of the same text,
  mapping leaves exactly the moved nodes unmatched on both sides, and matching among those few is
  unambiguous even for twins. An old and a new tree alone lose which lines the change moved.
- Identity = mapping, then matching for the leftovers, then tombstones; the full matcher with its
  subtree phase only for external changes (reload, sync, `Doc.replace`), where there is no change set.
- Commands stop declaring identity for moves, but must dispatch moves as moves (§1 does). What stays
  declared is what the text can't say: **which side of a split or join keeps the id**, as one written
  policy (the upper node; the first half) that commands and matcher both follow. Cases where it
  matters: `- [ ] a` / `- [ ] a` with children, joined; an empty item absorbing one with children.
- Matching fixes a mapping bug: Cmd-Backspace on the first line of a two-line paragraph replaces the
  first line wholly, and first-line mapping drops the paragraph's id.
- Record ids with history entries, or let undo find recreated nodes among the command's tombstones.
- Report the matcher's confidence (as outl logs its level-2 matches), so hosts can decide whether to
  move a comment or block reference onto a similarity-only match.

#### 5. The core handles every input intent (p1b §23.5)

**Hypothesis.** All input reaches the core as intents and the core always returns the edit: no
`notApplicable`, no host default. **Abandon if** IME or platform input can't be intercepted reliably.

**Verdict in plain CodeMirror 6: holds**, with one boundary to design in: an in-flight IME
composition can't be driven, only judged when it commits. In 58 headless-Chromium scenarios over 6
environments (key presses, CDP text with no key events, CDP IME compositions and dead keys, synthetic
`beforeinput` with target ranges, direct DOM mutation, `execCommand`, Android user agent with touch,
which makes CM6 use EditContext), no edit needed a host default; only history stayed with the host.
54/58 as expected, stable over 4 runs; the 4 others were contrast runs kept on purpose. **In Obsidian
the hypothesis doesn't hold as stated** (Part III).

##### 5.1 What was built

`handleInput(doc, intent, selection)` (~400 lines): ourus commands where they apply, otherwise
core-computed edits: typing; grapheme, word and line deletion that stops at chrome (markers,
checkbox, `#`s, `>`); newline and paste with the container's continuation prefix; cut; drop;
bold/italic. `handleInputMulti` runs text intents at several cursors and declines structural ones. A
CM6 host routes keymap, `beforeinput`, cut/paste/drop, `EditorView.inputHandler`, a composition judge
and a guard filter into it.

##### 5.2 Findings

1. **`beforeinput` is the wrong layer to rely on in CM6, and it doesn't matter.** CM6 never cancels
   input; it lets the DOM (or EditContext) change and reads the change back, and all of it funnels into
   `EditorView.inputHandler(from, to, text)`: uncancelable `beforeinput`, `execCommand`, DOM mutation,
   EditContext `textupdate`, Android's key-less input. Returning `true` without dispatching makes CM6
   redraw the DOM back to the state. Cancelable `beforeinput` is still worth intercepting because it
   names the intent (`deleteWordBackward`, `insertReplacementText` with its target range).
2. **Compositions can only be judged.** `insertCompositionText` is uncancelable, and editing under an
   active composition corrupts it (`-┃ a` + é with the core editing during the composition gave
   `- eéa`; with no judge, `-é a`, no longer an item). What works: let it run, judge its net change
   against the pre-composition state as one intent, and dispatch the correction as
   `input.type.compose.*` so it joins the composition's undo step (`- éa`, one undo step).
   Corrections were needed only when a composition started inside chrome. **Timing trap:** CM6
   dispatches nothing at `compositionend`; a judge waiting for the next update runs on the user's next
   keystroke and clobbers it (observed). Run it from the `compositionend` event, a microtask after
   CM6's flush.
3. **Other extensions were the real leak, not the platform:** CM6's autocomplete (`input.complete`,
   no input event at all) and CM6's own composition start deleting a multi-line selection. A
   transaction filter that replays any non-intent change through the core (as an insertion at the
   caret, a selection delete or a replacement), and refuses replacements that reach into markup,
   closed both in about 30 lines. It judges one change by its range, not a diff against a model.
4. **Keymap ordering is the host's:** any UI that owns a key some of the time (completion popups,
   snippet fields, search) must be asked first. With a naive keymap our Enter outranked the
   completion keymap and split the item.
5. **History stays the host's, and the core must label its edits for it.** CM6 groups undo by
   user-event name; `ourus.insertText` made every keystroke its own undo step. Text intents need
   `input.type…` / `delete…` names, structural ones their own. A result carries a history hint
   (`joinable: 'type' | 'delete' | false`).
6. **Host facts the core can't know:** the wrapped-row boundary (for `deleteSoftLine*`), grapheme
   segmentation (`Intl.Segmenter`), where a drop landed and whether a drag is an internal move.
7. **The core's own fallbacks fixed structure bugs a host default makes:** Enter in a fenced block
   inside an item (a bare `\n` ends the item; the core writes the continuation prefix), a multi-line
   plain paste mid-item (same), typing into a marker (`-┃ a` → `-x a`, no longer an item; now lands at
   the text start).
8. **Word and line deletion need caret-derived places:** 8.6% of them were refused in the property
   run, almost all because they would empty a node (`┃para x`, `- ┃a b`).
9. **Android:** with an Android user agent Chromium 138+ makes CM6 use EditContext, and every case
   reached the core, including GBoard-style Enter (CM6 rewrites keyCode 229 + `"\n"` into a synthetic
   Enter). A key-less deletion couldn't be simulated through CDP; CM6's source turns it into a
   synthetic Backspace. Not tested: real devices, Firefox, Safari, real spellcheck menus, a textarea
   host, native drag moves.

##### 5.3 The host contract, as proposed

The core provides `handleInput(doc, intent, selection[, ranges]) → edit | none(reason) |
host('history')` (edits carry a history hint and say whether the caret was chosen or mapped),
`judgeComposition(docBefore, rangesBefore, composedChanges) → correction | null`, and `guard(doc,
change, selection) → the core's version of a foreign change, or a refusal`. The host provides:
keymap → intents (after asking UI that owns the key); cancelable `beforeinput` → intent with target
range; cut/paste/drop → intents (copy stays the host's); text read back from the platform
(`inputHandler`, EditContext `textupdate`, a textarea's `input` diff) → intent on the touched range,
untouched while composing; `compositionend` → `judgeComposition`; a transaction filter for every
change that didn't come from those; history, mapped from the core's hints; layout facts on request;
all cursor ranges. Part III revises the weighting for Obsidian.

#### 6. Every container is a node (p1b §23.6)

**Hypothesis.** Quotes and callouts are outline containers with the same prefix algebra as items,
and commands work uniformly inside them. **Abandon if** lazy continuation and callout titles make the
prefix algebra irregular.

**Verdict: holds.** Lazy continuation costs the algebra nothing (a lazy line lacks the container's
piece, and every operation leaves it alone); callout titles are a projection question. The real
irregularity was the optional space after `>`.

##### 6.1 The prefix algebra

A line's prefix is a stack of pieces, `{quote}` or `{cols: n}` for item indentation, each counting its
columns from the end of the piece before it *on the same line*.

- **`renderStack`** writes a stack: a quote as `> `, runs of indentation coalesced and written with
  tabs at tab stops when the document uses tabs. On item-only stacks it equals today's
  `whitespace(0, col)`.
- **`rehome(lines, from, to)`** is the one operation: it replaces each line's prefix up to the end of
  container `from`'s piece with container `to`'s stack; indentation after that keeps its relative
  width; lazy lines stay. It implements indent into a quote, outdent out of one, a joined item's
  children crossing a quote's edge, and the relocated lines of outdent; paste uses the same rendering.
  The item-only `reindent` is very likely replaceable by it, which would make §1's prefix half trivial.
- **`blankOf(prefix)`**: the blank line inside a stack (`>`, `  >`, `> >`, or nothing). A bare blank
  line ends a quote, so every separator a command writes must use this: 9 sites (paragraph split, the
  blank line above, heading splits ×2, paste ×3, move, outdent).
- **`isEmptyLine`** replaces `LineInfo.blank` in commands: a `>`-only line has `blank: false` and
  `leaf: null`.

##### 6.2 Special cases, counted

| class | count | notes |
| --- | --- | --- |
| optional space after `>` | 1 concept, 7 sites | `>- a` puts its item at column 1 and `> - a` at column 2; continuation indent counts from where the quote's content starts on that line, so nesting under `>- a` needs `>   - b`. Every absolute-column computation was wrong inside quotes: indent target, outdent delta, move shift, join adoption ×2, and spaces inserted right after a bare `>` (the first goes to the quote). `rehome` and `renderStack` need no special case: they are relative by construction. |
| partial tabs (`>→- a`) | 0 | `advanceColumns` plus `piece.toColumn` already cover them |
| lazy continuation | 1 rule, 2 sites | a paragraph placed right below a quoted paragraph continues it lazily, so `>` goes between; the move rule had to write `>` instead of a bare blank line |
| quotes that merge | 3 conditions | a quote written right below another becomes the same quote (moves, outdent) |
| callout title | 4 | the head is a *line*, so the rest of that paragraph is synthesised as a body block; Enter and Shift-Enter in the title both split it (the rest starts the body as a soft break, escaped like Shift-Enter's); `[!type]` is chrome in the split and in `textStart` (Cmd-Backspace into it unmade the callout, found by fuzzing) |
| selection escalation | 1 | a headless quote has no line of its own: moving everything in it moves the quote |

##### 6.3 Decisions taken (45 spec tests were written for them)

- **Plain quotes are headless containers; callouts have their title line as head.** A first-paragraph
  head was disproven by fuzzing: moving a paragraph to the top of a quote turned it from a child into
  the quote's text, so kind and identity changed with position. Items don't have this problem
  (nothing moves above an item's head), callouts don't (`[!type]` marks the head).
- **Outdent leaves the container**, uniformly: the node becomes the quote's next sibling, below its
  other children (inside an item, that item's child); a headless quote left empty is gone. **Indent
  enters the container above** as its last child, paragraphs too; blank lines between join the quote
  as `>`.
- **Enter on an empty child of a container (item or quote) outdents it.**
- **Joins:** an item below a quote joins the quoted node above, its children entering the quote
  (`rehome`); a quote's first item doesn't leave its quote (refused); Backspace at the start of a
  quote's first paragraph is the host's (deletes the space, then the `>`: Typora's unwrap; could be an
  `EditingPolicy` option).
- Moves: quotes swap with items and paragraphs; only headings stay apart.

```
> - a          formatIndent      > - a
> - b┃        ─────────────▶     >   - b┃

>- a           formatIndent      >- a
>- b┃         ─────────────▶     >   - b┃          (three spaces: the first goes to the quote)

> - a┃         formatOutdent     > - b
>   - c       ─────────────▶     - a┃
> - b                              - c

> - a          formatIndent      > - a
              ─────────────▶     >
- b┃                             > - b┃
  - c                            >   - c

> [!note] Ti┃tle   insertParagraph   > [!note] Ti
> body            ──────────────▶   > ┃tle
                                    > body

> - a          deleteContentBackward    > - a┃b
- ┃b          ───────────────────▶      >   - c
  - c
```

##### 6.4 Numbers

217 of 218 spec tests (172 of the main 173 plus 45 new quote tests; the failure is "quotes are atoms
for now"). The projection alone, with no command changes, passed 21 of the first 38 quote tests.
Main property suite at 20,000 runs: all pass. New properties at 20,000 runs (tidy lists wrapped six
ways: quote, callout, `> > `, quote in an item, `>` without a space, with a second quote or a
paragraph after): 0 `encoding-failed`, outdent undoes indent across quote edges.

| generator | core | applied | rejected | notApplicable | encoding-failed |
| --- | --- | --- | --- | --- | --- |
| tidy lists in quotes | original | 0.4% | 45.3% | 54.3% | 0.0% |
| | containers | **38.6%** | 46.9% | 14.6% | **0.0%** |
| quote-heavy untidy | original | 3.1% | 43.2% | 51.9% | 1.8% |
| | containers | **18.7%** | 41.6% | 35.9% | 3.8% |

Residual failures (all rejected rather than written wrong): seams (a join that removes the node
between two quotes merges them; lazy paragraphs; quote next to quote in shapes the 3 conditions
miss), the empty-item trap inside quotes, and untidy indentation captured by an item leaving a quote
(`> - a` / `  - a`); about half are inherited from the unquoted shape. Not done: pasting quotes or
onto a callout title, renumbering in quotes, bullet adoption across a quote's edge, paste's absolute
`rootCol`, whole-quote indent (needs node selection), quote ↔ callout conversion.

##### 6.5 Suggestions

1. Prefix = a stack of pieces, relative per line, as the data model; command code never sees
   absolute `markerColumn`/`contentColumn` (every use was wrong inside quotes). One renderer, one
   `rehome`.
2. The line table says "empty after prefixes", and the writer owns the blank form of a stack.
3. `OutlineNode.head` is a line range plus a kind, not a `Block` (callout titles; later `^block-id`
   lines, Logseq properties, Org planning lines).
4. Containers without text need node selection in the core.
5. Seam rules (quote+quote, lazy absorption, empty item after text) are 3 rules written 5 times here,
   and all of the quote-specific residue: they belong in §2's writer.

#### 7. Placeholders from the caret, not stored (p1b §7)

**Hypothesis** (p1b §7): the document is a pure function of the text; the editing view is a function
of text and selection: the caret's line, when it holds no text, is read as if a character had been
typed there. Undo, redo, split views and collaborators get places for free; leaving is a real,
recorded cleanup edit.

**Verdict: holds, with one change.** Pure §7 is destructive; one host-side bit fixes it. The code
doesn't shrink (core about the same, host +30 lines); what goes is the state.

##### 7.1 What was built

- `Doc` stores no places: `apply` carries none over (the `provisional` and `drop` options are gone).
  `Doc.parse(text, { selection })` and `doc.withCaret(selection)` give the editing view. The view
  keeps the place only where it changes the outline: without that check an empty `- ` item the text
  already holds gained an empty paragraph head, and Shift-Enter there changed.
- `execute` plans against the view. `verify` reads the result as the view at the new caret, and falls
  back to the bare reading when the plan says the caret's line is no node (the old "try without, then
  with", reversed). `plan.provisional` is gone: Enter on an empty item no longer states a place, the
  caret does. An empty paragraph that only the view reads goes to the host's default when no command
  takes it (otherwise Enter and Tab on blank lines were refused).
- `settle(doc, caret)` became `leave(view, selection) → { changes, doc } | null`: when the caret left a
  line whose node the bare text doesn't have, the cleanup removes the line plus the blank lines written
  around it (keeping one unless two items of an otherwise tight list meet), as an ordinary undoable
  edit.
- **The dirty bit**, kept by the host: the caret's line was edited while the caret was on it. An edit
  touching the caret's line sets it; moving to another line clears it. Only a dirty line is read with a
  place and cleaned up on leaving. It is derived from the host's own transactions, needs no mapping,
  and comes back with undo, because undo is an edit that touches the line. A spec test whose first
  buffer draws `◌` starts dirty.

##### 7.2 Numbers

2,000 generated documents per measurement, with empty items, bare `-` children (as Logseq and outl
write them), blank-line runs and trailing blank lines.

| | stored places | caret, pure §7 | caret + dirty bit |
| --- | --- | --- | --- |
| spec | 173/173 | 173/173 | 173/173 |
| property tests | 7/7 | 7/7 | 7/7 |
| same result as stored, one command from a bare state | — | 1,899 | **1,999** (the one difference: a command that fails today applies) |
| host default turned into a refusal (4,000 cases) | — | 34 (Enter, Shift-Enter, Tab on blank lines) | **0** |
| undo restores the editing outline | 543/571 | 564/571 | 564/571 |
| … when the state before had a place | **13/40** | 40/40 | **40/40** |
| caret walks (down every line and back, no typing) that changed the file | 0 | **1,002/2,000** | 0 |
| re-reading the view on a caret line change, 10k lines | — | 44 ms (two parses when a place exists) | same |

The scenario §7 was proposed for: `- a┃` / `- b`, Enter, Tab, move up (cleanup), undo, move up again.

```
stored  after undo:  "- a\n  - ┃\n- b\n"    ← the place is gone: CommonMark reads `a` as a heading
caret   after undo:  "- a\n  - ┃◌\n- b\n"   ← the empty child is back; leaving cleans up again
```

##### 7.3 Findings

- **The simplification is semantic, not textual.** Nothing in `Doc` is state; undo, redo, a second
  view and a collaborator's caret all see empty nodes correctly, and cleanup is a normal history
  entry.
- **A caret on a blank line is not intent.** Pure §7 can't tell "the user pressed Enter twice here"
  from "the caret passed over a blank line". It cleaned up whatever it passed (trailing blank lines,
  blank lines in lists, a file's own `- a` / `  - `, which is a heading to CommonMark and an empty
  child to Logseq), and commands acted on virtual nodes: Enter on a blank line did nothing, and a
  blank line above a paragraph read as that paragraph's first line. "This line was edited while the
  caret was on it" is the missing fact, and the least state that works.
- **Undo makes a line dirty, and that is not harmless** (corrected after an independent review).
  After undoing into a blank line the caret had only passed through, the view reads a place there:
  7 of the undo mismatches. This section first called them harmless; they aren't. With an authored
  blank line between two paragraphs (`a` / `┃` / `b`), typing on it and undoing makes it dirty, and
  leaving runs the inferred cleanup, which deletes the line and merges the paragraphs (reproduced:
  `a\n┃\nb\n` → `a\n┃b\n`). The rule that follows: editing evidence may enable the view, but deleting
  text needs a record that the session wrote it; without one the source is preserved. The sequence is
  now a regression case in `spec/redesign.md`, using the player's new `undo` action.
- **Inferred cleanups passed the spec, but aren't safe.** Cleanups stated by the creating command (p1b §19) weren't needed
  with the dirty bit; the inferred one passes every spec case. The known wrong shape (a loose two-item
  list, Enter twice between the items, leave: it comes back tight) is unchanged.
- Word and line deletion that empties a node (§5's 8.6% refusals) applies under this design.

##### 7.4 Representation: a pure document plus a per-view overlay

§7.1 says *what* the caret's empty node is. How the core represents it is a separate question,
settled after the experiment.

**What the view is.** The editing view is **the document after one hypothetical keystroke, with
the keystroke hidden.** Checked: over 2,778 caret positions where the view read a place (1,594 in
outline-shaped documents, 1,184 in adversarial ones with quotes, tabs, lazy lines and setext
candidates), the parser hook's outline equalled, every time, the outline of the text with one real
private-use character typed at the place, that character hidden. True-outliner renders its
placeholders the same way, re-parsing the caret's line with one sentinel character. It also makes
TO's rendering property hold by construction: typing one character at a place changes nothing in the
outline but the text. That check becomes a permanent test.

**Three ways to represent it:**

| | A. parser hook (the experiment) | B. overlay without the parser | C. pure document + per-view overlay |
| --- | --- | --- | --- |
| how | `parseCommonMark(text, { provisional })` reads a zero-width virtual character; one tree per view | parse the text without the place line, insert a virtual node whose position comes from the line's prefix | parse the text purely (cached per text); re-read the caret's line with a zero-width sentinel until the parser state converges with the pure parse's saved states; the view is the pure line table with those few line entries replaced, and the outline is projected from it |
| reading | the grammar decides | reimplemented by hand | the grammar decides |
| parser | carries an editing concern | pure | pure, plus one primitive: read a line with a sentinel at offset p |

**B is out:**
- its overlay isn't additive: the bare text around a place is misread (`- a` / `  - ` makes `a` a
  setext heading), so the overlay would also have to undo the neighbours' misreading;
- it needs two kinds of virtual element, a node and an empty line inside a node's text (Shift-Enter);
- getting all that right means reimplementing parsing: "what would a typed character become here"
  is what the parser computes.

**C is the target. A is the same thing seen from outside, and serves until the incremental line
machine exists.**

**Still two layers, not three trees.** Consumers see the syntax layer (lines, blocks, render facts)
and the outline, both as the user sees them, exactly as in A:

```
A:  text + caret ──parse──▶ syntax (view) ──project──▶ outline (view)
    text ──parse──▶ bare syntax          (only when asked)

C:  text ──parse──▶ bare line table      (cached per text, internal: the incremental parser's own state)
                       │ + patch: the caret's line re-read with a sentinel, down to convergence
                       ▼
                    syntax (view) ──project──▶ outline (view)
```

The bare reading is never a tree anyone holds. In A it is a throwaway parse; in C it is the
parser's cache of saved states and line info, and the view replaces a handful of its entries.

**The disagreement, and the rule for it.** The bare reading and the view disagree while the caret
sits on a place. That isn't new to C, and it is the reason places exist: `- a` / `  - ` really is a
heading to the text (to commonmark.js, Obsidian's reading view and metadata cache, a file saved now).
A only hides it. C keeps both readings, so the risk is a consumer using the wrong one. The rule:
**expose exactly one reading, the view.** Outline, render facts, folds, node lookup and commands all
see only the view. The bare reading is reachable only through a narrow internal API, for the
questions where the difference is the point:
- does this place matter (should it be read and drawn at all)?
- does leaving need a cleanup?
- what does the file mean to other readers (saving, export, Obsidian's metadata cache, other views)?

The disagreement is also exactly one keystroke wide. The view equals the text after one typed
character, so the first real keystroke makes text and view agree, and the incremental re-parse of
the real text lands in the state the view already had.

**What C buys over A:**
- **A pure syntax layer:** no placeholder hook in the parser or its incremental state, a clean
  lossless invariant, oracle tests against commonmark.js without exclusions, and per format only
  "read this line with a sentinel at p" plus where the sentinel goes (after a marker's required
  space, Part IV).
- **Caching and sharing per text:** render facts and the outline are cached per text and shared by
  every view (TO's per-`Text` cache is how it stays in budget). Only the overlay is per view.
- **Cost:** the re-read covers lines down to convergence, not the document (today's view costs
  44 ms per caret line change at 10,000 lines; regions like §2's cost about 0.03 ms).
- **An explicit virtual part:** nodes and lines the overlay creates carry `virtual: 'node' | 'line'`.
  Renderers can draw a placeholder bullet. "An empty paragraph only the view reads goes to the
  host's default" becomes a check on that flag instead of a shape test. Verification can compare the
  real and virtual parts separately.
- **Identity continuity:** the first real keystroke lands where the sentinel was, so position
  mapping carries the virtual node's id to the real node.

**Costs and open points:**
- **Merging the overlay into the outline:** nodes whose lines intersect the re-read region are
  replaced. Convergence should be measured per line (saved container stacks), not per top-level
  block: outliner documents often hold everything under one root bullet, which would make a
  top-level unit the whole document. §2's unit-based region was only measured on flatter
  documents.
- **It depends on the incremental line machine** (§20.1); before that, C is A plus bookkeeping.
- The host side is unchanged: real text, native caret and IME, the dirty bit and stated cleanups
  (§11).

```ts
const doc = Doc.parse(text);               // pure, cached per text, shared by every view
const view = doc.view({ caret, dirty });   // doc itself, or doc + a small overlay
view.nodeAt(pos)?.virtual;                 // 'node' | 'line' | undefined
execute(view, command, selection);         // commands read the view
leave(view, selection);                    // cleanup | null
```

---

### Part III: Obsidian, interference, and true-outliner's lessons revisited

This part has two sources. The first is a point raised during the session: §5 ran in a bare CM6
demo, where ourus is the only extension, and Obsidian is not that. The second is a second, complete
pass over obsidian-true-outliner (TO): its research notes, 30 specs, 94 archived changes, and
`classify.ts`/`enforce.ts`, looking for lessons postimpl1a and postimpl1b don't already cover. Paths
are TO's, relative to `repos/obsidian-true-outliner/`; `arch/` is `openspec/changes/archive/`.

#### 8. In Obsidian, input is shared

ourus can't assume it sees input first, or alone. What TO measured:

- **Obsidian's own "Smart lists" filter** (on by default) appends a renumbering change to every
  transaction touching an ordered list, ours included (`{changes, sequential: true, userEvent:
  "input.renumber"}`), so the renumbering joins our undo step. It measures list levels in tabs and
  four-space groups (`   1. a` nested under `1. p` is to it a sibling) and renumbers lists the edit
  never touched. A plugin can't exempt a transaction (`obsidian-list-renumbering.md`).
- **Our edits trigger others.** Any transaction labelled `input.*` re-arms Obsidian's editor
  suggesters 50 ms later; a structural edit that leaves the caret after `#word` opens the tag popup,
  which then owns ↑ ↓ ⏎ ⇥ (`obsidian-runtime-gotchas.md`).
- **Filter order is fragile.** CM6 runs filters last-registered first; Smart lists runs before every
  default-precedence plugin filter, and a `Prec.highest` filter runs after all of them. TO's first
  restoration filter broke on exactly this (#256), and its extensions are now registered in a
  deliberate order.
- **Other plugins:** obsidian-outliner takes Enter and Tab at `Prec.highest` with its own transaction
  extender; Vim mode routes keys through CM5's Vim adapter, not keydown; Templater, Linter,
  autocomplete plugins and command-palette actions write through `editor.replaceRange`/`setValue`
  with no input event at all; sync and external edits replace the file; keymap races depend on plugin
  load order.

So "the core handles every input intent" (§5) is the wrong goal in Obsidian: it holds only for input
that reaches ourus first, which can't be guaranteed. The design is two layers: **intercept where
possible** (the precise path, which §5 shows covers nearly everything a user types), and **a guard
at the end** that is a required, first-class part of the core, not a rare fallback.

#### 9. How TO's funnel actually works

One `transactionFilter` classifies every transaction in an outline-mode editor and hands the
structural ones to a pure verdict layer (`pass`, `rewrite`, `veto`).

- **Six classes, in a fixed order, first match wins:** `programmatic`, `composition`, `plugin-own`,
  `selection-only`, `within-node-edit`, `boundary-crossing-edit`. A transaction with no `userEvent`,
  or marked undo, redo or set, is `programmatic` and passes. `Editor.transaction` carries no
  `userEvent`, so **Linter, Templater and any Editor-API plugin are never judged** (spec
  `editor-structural-commands`). A combined transaction reports only its first `userEvent`. Typing
  that changes a node's kind (`# `) always passes, as authoring.
- **Classifier and verdict must change together.** Widening only the classifier made a
  one-character Backspace at a heading's content start fall into "cover deletion"; the verdict
  escalated it to the subtree and deleted the section, or the whole document when the heading came
  first (`heading-content-start-backspace.md`). The fix was one shared predicate. **Rule: a shape the
  classifier admits but no handler models must pass, never escalate.**
- **The pre-edit caret matters:** Backspace at a node's start and Delete at a gap's end produce
  identical transactions. **Don't minimise the diff first:** trimming the shared prefix turned
  type-over of `R…` with `R` into a deletion and lost the keystroke ("a caret edit is never a
  type-over"). **A range alone is ambiguous:** a caret-derived "delete to line start" equals selecting
  a whole paragraph (#115).
- **Fallbacks are chosen per shape by measuring the native result.** Unmodelled shapes (multi-range
  edits, mixed-depth type-over) pass; inexpressible pastes are vetoed, reversing an earlier "a wrong
  pass is just editable text", because native paste glued the payload onto the anchor line
  (`- three## Section`). A veto dissolves the transaction, so no history entry is written; the cue
  fires from an update listener, and tests count vetoes rather than checking an unchanged buffer.
- **Plan restoration.** TO's restoration filter puts back ordinals that differ from the planned
  change set (and bails when line counts differ). For user edits it strips the exact `N. → M. ` shape
  Smart lists appended before classifying. Trap: `iterChangedRanges` joins touching ranges, so a
  linewise cut plus a renumber became one cross-node range and deleted a neighbour.
- **Valid-by-construction edits need their own `userEvent`** (`input.structure.block-id`), or the
  plugin's own filter rewrites them.
- **IME:** the commit transaction arrives unannotated, so TO never judges it; it was verified only by
  hand with a Chinese IME. Block-selection mode blurs the editor and replays keys through
  `runScopeHandlers`, which loses the first IME keystroke (#147), and blurred input bypasses
  `inputHandler`. §5's `compositionend` judge is stronger than TO's, but untested in Obsidian.
- **Nested editors:** table cells are separate `EditorView`s, yet `editorInfoField` resolves a cell to
  its host note; only DOM ancestry tells them apart (the bug recurred three times). Obsidian's
  checkbox mount moves range boundaries to column 0 with no `userEvent`. Operations must never leave
  the caret in a table, which has its own undo.
- **Vim:** TO has nothing; obsidian-outliner reaches into a private `window.CodeMirrorAdapter.Vim`.

**What this changes for ourus's host contract:**
- The guard's API takes the transaction's source, and the contract states which sources are judged:
  user-event transactions are judged (pass, rewrite, veto); programmatic ones (no `userEvent`, undo,
  redo, other plugins' API writes, sync) are **reconciled, not judged**: the document, identity and
  places are updated from what landed, never vetoed. "Judge every transaction", as first drafted
  this session, is not what works.
- A **plan-restoration filter** is part of the adapter: changes appended to our planned edits are
  removed (or our writer avoids text Smart lists would change; Part VII decision 7).
- Results carry an annotation and the user event to use: never `input.*` for structural edits
  (suggesters), `input.type…`/`delete…` for text edits (undo grouping, §5).
- The core takes a **view-jurisdiction** input (is this view a nested editor?) and clamps ranges.
- An unmodelled shape passes; the classifier and the verdict share their predicates.

#### 10. History, beyond p1b §9

- **Host redo is invisible:** TO observed no `redo` user event and no `redoDepth` change, so a redone
  place can't be re-armed (spec `structural-history-integration`). §7's dirty bit doesn't need to
  recognise redo: a redo is an edit touching the line, which sets it.
- **When to record a chosen caret is a per-transaction test**, `!startSel.map(changes, 1).eq(newSel)`,
  not a per-command whitelist (one was deleted and restored).
- **The CM6 version decides the redo caret:** `@codemirror/commands` ≥ 6.10.2 maps with assoc 1, but
  Obsidian 1.12.7 bundled an older one; undo → redo → undo stays unfixable there.
- **Change and caret go in one transaction**, then a selection-only re-assert with `filter: false`;
  otherwise a table widget reads stale offsets and focuses a cell.
- **Folds stay out of history** (an `invertedEffects` plan was rejected); fold effects need
  `sequential: true` or they are mapped twice. **Auto-zoom-out was rejected** because history can't
  restore the zoom scope. **Undo-on-abandon was withdrawn** because it brought back deleted text; "created a place" is now
  decided by where the caret lands, not by which operation ran.

#### 11. Placeholders: TO's provenance finding against §7

TO found caret-derived places **unsound for operations**: an authored blank line and a Shift-Enter
place are byte-identical, and with only the caret to go on, Tab on an authored gap merged two
paragraphs. Its resolution: operations get a per-view place record; rendering may infer the place
from document plus caret (`arch/a-position-does-not-split-its-node`, `arch/a-trailing-place-moves-
with-its-node`).

§7's dirty bit is a **one-bit provenance record**: a place exists only on a line edited while the
caret was on it, so an authored gap the caret reached by motion is never read as a place, which is
exactly TO's failing case (§7's "1,999/2,000 behave as today" and "0 navigation changes" measure it).
What the bit doesn't cover:
- after an undo into an authored blank line, the line is dirty and reads as a place (7 of §7's undo
  mismatches): a single blank line between two paragraphs would then read as a continuation line
  joining them, TO's merge, until the caret leaves;
- it doesn't say *which* place it is: TO distinguishes an Enter place (blank lines on both sides)
  from a Shift-Enter place (adjacent to the node above) by **gap width**, which is the encoding
  (`arch/enter-and-shift-enter-grammar` D1), and has **two removal forms**: an "opened" place is
  reverted bytewise (which also restores numbering), a "residue" place has only its line deleted
  (`arch/abandon-removes-only-the-place`);
- **carried places** (a place an operation moved, e.g. Tab on an empty item) are removed by composing
  each carrying operation's own reverse with the original removal, which restored all 7 probed shapes
  including a `9.` → `10.` width change; a mapped removal left `- foo··` (`carried-place-removal.md`).
  §7's inferred cleanup passed the spec but wasn't probed on these.

So: the dirty bit is the right *amount* of state for "is there a place", and the per-view record
TO keeps is the right amount for "how to remove it". A merged design: the host keeps, per view, the
dirty bit plus the cleanup the creating command stated (p1b §19's first option), dropped when the caret
leaves or the line changes by any other edit. Inference is *not* a safe fallback (after undo, after a
foreign edit): it deleted an authored blank line in the case above. Without a record, the source is
preserved; a host history hook that carries the record across undo and redo keeps it exact. Also from TO:
- **A place must render as the node it becomes:** over its generator, 18,933 of 23,393 new-node
  positions drew a guide the typed row lacked (`provisional-position-guides.md`). Property: typing one
  character at a place changes no render fact on any line. TO renders by re-parsing the caret's line
  with one sentinel character, which is §7's mechanism.
- Trap: on a line holding only `#`, arrows don't move the caret, so the place is never left.

#### 12. Seams, the writer, and paste

- **Judge seams on the outline, with the old outline as input.** A block counts as written if it is
  new or its kind or content changed (indentation, marker, ordinal, heading level and ids set aside).
  Inside a list, never add a blank line: it loosens the whole list. At the edit site an empty seam
  outside a list gets one blank line; every other seam is restored from the old document. Over 400
  notes and 28,107 ops, seams a reader continues went from 3,956 to 0; a narrower rule would have
  written 5,674 of the 9,636 rewritten lines (59%) fewer, and was declined; 291 tightness flips and
  125 block-id host changes are unsolved; 1.57 ms per op at 2,000 lines (`created-seam-detection.md`, `lazy-continuation-at-seams.md`). **For §2:** reader checks can't
  decide whether a seam may be rewritten; that needs the before-tree. The writer's candidates must
  include "leave this seam as the user wrote it".
- **A parser does not remove lazy continuation** (this corrects postimpl1a §2.11): Obsidian's reading
  mode continues an item into `<div>` or `> q`, and a quote into `2. x`, and Live Preview draws the
  same lines differently again. §2's reader panel needs these rows; lezer and commonmark.js won't
  supply them.
- **Judge on the kind the bytes will parse as:** `- - -` at column 4 becomes a list item; a table
  claims any following line containing `|`, `[[a|b]]` included; `---` on line 0 opens frontmatter. In
  TO's corpus 12 rows gained a separator and 37 lost one. Generator cases.
- **Moves:** per-line narrowing split a table on moves; patience-diff alignment took 5 changes to 2,
  flat to 40,000 lines. A same-scope move must be a positional reorder, not a composed delete + insert:
  failures to restore went from 21,347 of 43,937, to 1,550 of 23,016, to 0 of 28,579
  (`node-drag-and-drop.md` §7b). §1's heaviest-increasing-subsequence move is that positional reorder.
- **Indentation:** unit precedence is a sibling of any kind, then the document, then the `indentUnit`
  facet (which the Obsidian `Editor` API can't reach); read the unit under a bullet, not under `1.`.
  Re-indent swaps the prefix rather than applying a width delta (§6's `rehome`). Renumber before laying
  out an arriving child. Ordinals stop at 9 digits (`1000000000.` is a paragraph). 2-space nesting is
  off Obsidian's 4-column/tab quantum and renders at 20.38 px against 48 px.
- **Block-start margin** measured from the item's content column raised agreement with CommonMark
  from 184 to 422 of 570 shapes; headings and HTML stay measured from column 0 for the metadata cache
  (`- ## Notes` isn't a heading to it).
- **Paste:** one insertion entry point, with the guard inside: a third paste path skipped the guard
  and corrupted text silently ("the second call site forgot half the rule", hit at least three times).
  Nesting is written from depth in the document's unit, the only rule under which 2-space, 4-space,
  tab and mixed clipboards converge (1,774-row differential: 0 tree changes; 20k fuzz: 6 regressions
  against 1,641 improvements). The destination's siblings decide the encoding: a converted node takes
  the destination's marker (a `-` in a `*` run turned 1 list into 3); headings re-level by one delta
  and are refused past h6; in list scope a heading is written `- ## H`, which breaks `[[note#H]]`
  anchors. **Absorption:** a pasted heading took 12 of 13 nodes into its section with one pure
  insertion: bytes unchanged around it, nodes reparented. That bears on §3 (heading re-derivation) and
  §4 (identity survives, parents don't).

#### 13. Render facts and performance

- **Per-line facts, gap lines included:** kind, depth, supplementary depth, has-children, level, guide
  depths, a per-ancestor foldable subset; a trailing gap inherits its first child's guides; cached per
  text and shared by consumers. **Identity facts** hold under any projection; **position facts**
  describe whatever tree is passed in (a pruned node reports no children).
- **Folds** run from the end of a node's own last line to the end of its last descendant; trailing
  gaps stay visible; atoms never fold; a fold survives if its hidden lines still form one run.
  **Zoom** is one mapped position with assoc 1 (ids, paths and `^id` were rejected as anchors);
  confinement is judged on the after-tree; consumers get scope-relative trees.
- **CM6 constraints:** block decorations must come from a StateField, which never sees no-op
  transactions; line decorations do nothing on widget-replaced lines; appending DOM to `.cm-line`
  looped at 100% CPU; hidden gap lines broke the height map (13,921 px estimated against 9,720.5 px).
- **Rendering dominates latency:** on a nine-line outline, keystroke median was 62 ms with outline
  mode on and 11 ms off, about 40 ms of it synchronous layout reads (`rendered-ui-observability.md`).
  The core's budget is not the bottleneck in a real plugin; the API should let hosts avoid layout reads
  (render facts by line range, cached per text).
- **TO's budgets:** classification ≤ 1 ms median and ≤ 8 ms p95; enforcement ≤ 3 ms median and
  ≤ 8 ms p95; a full re-parse cached per `Text` (`WeakMap`) stayed within them at about 1,600 lines;
  composing whole operations costs 1.24 ms per step at 2,000 lines.
- **Parse speed:** TO parses about 25 µs/KB, 0.96 ms on 2,000 lines. ourus's 45–65 ms per command at
  10,000 lines is about 10× slower per line, so part of the gap is implementation, not only the lack
  of incremental parsing.

#### 14. Selection, drag and drop, block ids, panes, mobile

- **Selection escalation is downward closure only:** common-ancestor escalation selected the whole
  document in one ⇧↓ and was reversed. A cover is one range including its owned gap; extension is
  stateless; operations report their subject span and the cover is rebuilt from it, not from ids.
  Mod-A is a stateless ladder in the keymap, because a filter can't tell two Mod-A transactions apart.
  Group reorders need one sibling run (mixed covers scattered in 3,100 of 3,100 cases); group outdent
  of 200 roots costs 15.4 ms.
- **Drag and drop:** pointer events; a destination is a seam plus a depth interval; legality is asked
  of the operation itself; preview and release come from one resolver. Reading seams on every pointer
  move cost about 30 ms on 2,000 lines, 0.4 ms cached per press. Touch drag is shelved. Core helpers to
  add: `coverOf`, `enumerateDestinations`, `wouldAccept` (§1's `moveTo` is the operation behind them).
- **Block ids** follow Obsidian's rules: a lone `^id` names the block above only if a blank line or
  the end of the note follows; of two ids in a row the last wins outside a list and the first inside
  one; trailing whitespace means no id. TO models the id as a node field `{gap, line}` and refuses to
  merge two nodes that both carry ids. Ids belong in §4's identity design and §6's head-as-line-range.
- **Panes:** outline mode is per view, so two tabs on one file differ; places and the dirty bit are
  per view too.
- **Mobile:** Obsidian doesn't use `drawSelection`; the goal column is in pixels; a tap's selection
  lands about 360 ms late under emulation; `setMode` fires no event; mobile undo may bypass filters
  (TO's Q14).

#### 15. Testing and process

- **Drawn cases need a keys line and setup:** 34% of TO's 208 tracker drawings name no key, and only
  10 of 23 reproduced. Case files round-trip through one notation module (ourus's spec format does).
- **Known-failing cases carry a recorded actual:** 3 of 10 differed for another cause a looser marker
  would have hidden. ourus's `pending` should record what happens today, not only that it fails.
- **Every step must count:** a refused command still returned true, so on/off differentials passed
  vacuously. **Differentials need a negative control:** a 20,000-input sweep showed 0 differences
  because it never reached the changed path. (§1's differential reports routing counts for this
  reason; keep doing it.) **Pin the counterexample, not the seed**, and re-measure after widening a predicate. **Coverage
  counters on properties:** one of TO's properties reached its assertion once in 302 cases.
- **Ambient rendered monitors** cost 22–28 ms per e2e case and found real defects. Flake: 32 of 1,606
  CI runs (2%), mostly a mobile drawer covering the target and late selection under emulation; only
  18.9% of 958 e2e cases are pure state plus keys.
- **Independent reviews:** 216 findings across 25 PRs; the top kind is "a test that could not fail"
  (36). 4 reviewer claims were refuted in the real app, two of them reasoned from bare CodeMirror,
  which is the same trap as §5's verdict before this part.

#### 16. Open questions TO and ourus share

Place provenance (an authored blank line or a created position); Tab on an Enter place, and dragging
over an open place; recognising host redo; whether third-party and IME-commit edits are judged; Vim;
suppressing Smart lists on plain typing; mobile undo bypassing filters; the table widget's newline
append; type-over of a mixed-depth cover; multi-range structural operations, and Enter or Shift-Enter
over a selection; whether `[ ]` is content or chrome (Home stops twice?); heading moves across scopes,
and unbounded absorption at a heading-less root; whether a list after a paragraph becomes its child
(37 of 1,285 move-downs absorb a bystander); whether paste restarts ordered numbering; the 9-digit
ordinal ceiling; tab stops after a marker-width change; indented code at the root; headings and HTML
deeper than 3 columns inside an item; whether a caret-derived exact cover counts as a selection; the
291 tightness flips and 125 id-host changes; deleting the zoom root; fold affordance on touch; RTL and
bidi motion.

#### 17. What this changes in each experiment

- **§1 encoder:** verify the transaction that landed, not the one planned (Smart lists appends to it),
  or strip foreign appended changes first; write numbers Smart lists leaves alone where possible (two
  renumberers with different level rules fight); compute dirty regions from the final changes.
  Seams: never add a blank line inside a list; keep "as written" as a candidate.
- **§2 writer:** Obsidian's renumberer is another reader, and a writer: a candidate must be a fixed
  point of it (port the algorithm TO measured as a pure function). Reading-mode and Live Preview lazy
  continuation rows go into the panel. Whether a seam may be rewritten needs the before-tree.
- **§3 model:** interleave raw edits between commands (other plugins leave untidy states); the model
  becomes the guard's oracle ("does this raw change match some model operation?"). Paste and heading
  absorption need the section re-derivation.
- **§4 identity:** foreign edits never declare identity, so mapping plus matching is the default path;
  whole-file writes go to the full matcher; ids are computed from the final transaction in a state
  field, not from the command's result; block ids are part of identity.
- **§5 intents:** two layers, with the guard's judged sources stated (§9); keymap precedence and
  completion popups; Vim open; IME judge untested in Obsidian.
- **§6 containers:** Smart lists counts `>` levels, so it renumbers inside quotes too; Obsidian's own
  Enter continuation in lists and quotes must be beaten reliably; callout plugins render over the
  title line.
- **§7 places:** add the per-view stated cleanup and gap-width provenance (§11); cleanups run from the
  guard's reconciliation, since other plugins move the caret too (Vim, completions).

---

### Part IV: other formats

Placeholders, in either design, exist only for empty states the text can't hold, and that set
depends on the format (p1b §6 measured it):

| family | empty states the text can't hold |
| --- | --- |
| CommonMark, GFM, Obsidian, Pandoc | many: an empty child under text reads as a setext heading; empty and non-1 ordered items can't interrupt a paragraph; no empty paragraph or empty line inside text; Pandoc adds "a list needs a blank line after a paragraph" |
| Org, Neorg | few: no setext headings and no "can't interrupt a paragraph" rule, so empty items and headlines can be written; left are empty paragraphs and empty lines inside a node's text |
| Logseq, outl | almost none: no free paragraphs, every line a block, an empty block is a bare `-` |

**The caret design suits them better.** Its "keep the place only where it changes the outline" uses
each format's own grammar, so it needs no per-format tables and degrades to a no-op where a format can
hold the state: in Org an empty `- ` is an item, the view adds nothing, leaving cleans nothing, and the
empty bullet stays (Logseq's and Workflowy's behavior). Stored places would carry state, and its undo
problems, into every format for a feature mostly idle outside the CommonMark family. What is left in
Org and Neorg (Enter twice to leave a list, Shift-Enter twice in text) is exactly what the dirty bit
handles.

**Per format, and small:**
- where the virtual character lands: after the marker's required space (Org `** ┃`, Neorg `- ┃`); one
  rule per line machine;
- encodings that need trailing whitespace (an Org headline needs its space; `**` alone is text; outl
  writes empty lines inside a block as whitespace-only lines) break under trailing-whitespace
  stripping (editor settings, Obsidian's Linter plugin). Writer rule: prefer encodings that don't
  depend on it where the format allows (Pandoc reads a bare `-` as an Org item); accept the risk where
  it doesn't.

**Where they differ more than placeholders** (writer and line-machine work, per p1b §22.8's families):
Org headlines own sections like our headings, plain lists are a separate structure inside a section,
and property drawers and planning lines belong to the headline (a head as a line range, §6.5). Neorg
nests by repeating the marker (`-`, `--`, `---`) rather than by indentation, so column logic becomes
marker-count logic and the prefix stack needs a repeat-count piece; its closing modifiers (`---`,
`===`) end sections early, which are seams the writer owns. **Caveats:** Org was measured only with
Pandoc's reader, not org-element (Emacs's parser, the real reference), and Neorg not at all (whether
`-` at the end of a line counts as an item needs checking against tree-sitter-norg).

---

### Part V: what the experiments say together

#### 18. Synthesis

**The "one bet" of p1b §23.7 holds, in a specific shape.** Commands are tree edits on a model (§3);
one encoder writes the tree as text, reusing node lines verbatim (§1); its few real decisions (seams,
markers, escapes) are made by trying a short, preference-ordered list of candidates checked by the
readers it must not confuse (§2); the expected outline is the tree. §1 ran the encoder with its tree
as the expected outline and passed the spec; §3 measured that the model's tree would be the right one
97% of the time.

**Seams are the whole residue.** §1's failures and special cases are all about the space between and
before nodes; §2's fixes are separators and escapes; §3's B5–B7 are separators; §6's quote-specific
code is three seam rules written five times. Node text itself never needed rewriting. One writer
owning seams (p1b §22.2) is the most important structural decision.

**The pieces fit.** §4's hybrid identity needs moves written as delete + insert of the same text,
which §1's encoder does by construction. §6's relative prefix stack is what §1's per-line prefix
rewrite should be. §5's handler is where §3's model and §1's encoder sit for typing and deletion, and
§5's refused deletions are what §7 makes legal. §7's dirty bit needs the adapter to see every edit,
which §5's interception and Part III's guard provide.

**Three open decisions block several experiments at once:**
1. **Empty nodes the text can't hold** (p1b decision 4): refused in four commands (§3, about 15% of
   its disagreements), 3 of §2's spec cases no escape fixes, among §1's new-command failures, in §6
   inside quotes, and behind §5's refused deletions. §7 settles the editing half (the caret's empty
   node exists while the caret is there); what remains is what to write when the user leaves a shape
   CommonMark can't hold but Live Preview and lezer can (`- a` / `  - `).
2. **Heading moves:** a tree edit that moves a heading takes in what follows it (§1, §3's B4). Either
   re-derive sections after every edit, or move headings only with their sections and only among
   headings.
3. **What "empty" means:** the checkbox is chrome everywhere, not only in joins (§3's B1, B8).

**Incremental parsing comes first.** Every experiment measured full re-parses at 45–65 ms per command
on 10,000 lines against an 8 ms budget, and §7 adds a re-read per caret line change (44 ms).
Region-only re-parsing is sound and costs about 0.03 ms (§2); the encoder must also be region-scoped
(27 ms rebuilding the whole document); identity is already within budget (§4).

#### 19. Learnings

- **Differential harnesses are the fastest way to move a design.** Running a new mechanism beside
  the old one on generated cases, routed only where the new one claims the case, produced every
  finding of §1 and §7 in under an hour each, and showed bugs on both sides.
- **Model-based tests find what drawn examples don't.** Nine bugs in a day, none in 172 spec
  examples; the generators decide what can be found (empty items, tasks, headings among lists,
  untidy indentation produced most findings).
- **Measure navigation, not only commands.** §7's destructive flaw only showed in a "walk the caret,
  type nothing, the file must not change" property. Every design that reacts to caret movement needs
  it.
- **Abandon signals worked.** Each experiment stated one up front, and two fired in a useful way (§4
  pure matching on twins, §2 "smallest" on separators), turning a verdict into a refined design rather
  than a yes or no.
- **"Smallest" and "minimal" aren't the same as "intended".** Blank lines are style as well as need
  (§2); a minimal diff can turn a move into a rewrite (§1, §4). The writer's objective is "intended,
  then conventional, then small".
- **Every absolute column is a bug waiting for a container** (§6). Columns relative to the piece
  before them on the same line are the representation that survives quotes, tabs and the optional
  space.
- **Host facts leak into core design.** Undo grouping by user-event name, keymap ownership by popups,
  composition timing, and (Part III) other plugins' filters all changed what the core must return
  (history hints, chosen-or-mapped carets, a guard API), though none of it is "core logic".
- **Verify in the real host.** §5's verdict was right for the host it ran in and wrong for the one
  that matters; TO's reviews refuted claims "reasoned from bare CodeMirror" the same way (§15).
- **Parallel forks for independent experiments work** when each gets its own directory, a stated
  hypothesis and abandon signal, a fixed deliverable (`RESULTS.md` with numbers and repros), and a
  rule not to touch the shared tree. Their claims still need spot-checking: harnesses were re-run and
  six of the reported bugs replayed against `src/` before this document was written.

---

### Part VI: bugs in the current prototype

Found by the experiments; each reproduced against `src/` unless noted. Worth fixing now, and adding
to `spec/` as examples first.

**B1. Enter on an empty task never leaves the list** (§3). The checkbox counts as text: Enter makes
another task forever, and trims the space after the old box (GFM no longer reads `- [ ]` without it as
a task).

```buffer
- [ ] ┃
```
> insertParagraph insertParagraph → `- [ ]` / `- [ ]` / `- [ ] ┃`. Expected, as with `- ┃`: leave the
> list (top level) or outdent (nested).

**B2. Enter on an empty item with children is the host's newline** (§3). `isEmptyItem` requires no
children; the host's newline closes the empty item, its child becomes top-level, and the caret lands
on a line in no node.

```buffer
- ┃
  - a
```

**B3. Enter at the start of an item after paragraph text is refused** (§3): `- a` / `  - ┃b` →
`not-expressible`, though a place does exactly this (`- a` / `  - ◌` / `  - ┃b`). The commonest
outliner action (insert above the first child). `p q` / `- ┃a` likewise.

**B4. Moving a heading past a heading of another level fails verification** (§3): `## ┃H` / `# H` /
`- a`, moveDown → `encoding-failed`. Sections re-derive; accept that or refuse on purpose, never
`encoding-failed`.

**B5. Enter in a heading above indented code fails** (§3): `### H┃2` / `    - a` → `encoding-failed`;
`splitHeading` and `splitSetext` add a separator only before a paragraph.

**B6. Moves past indented code, `---` or a reference definition fail** (§2, §3): `→- a` / `┃para`,
moveUp → `encoding-failed`; 36 fuzz cases. The `absorbs` list knows only quotes and HTML 6/7; decide
the separator by verification.

**B7. Delete at an item's end merges the quote or code below into it** (§3): `- a┃` / `> q`, Delete →
`notApplicable`, host deletes the newline → item text `a> q`; `# H┃` / `    code` → heading `H    code`.
Backspace from the other side is refused, so the two directions disagree.

**B8. Checkbox handling on joins is inconsistent** (§3): `- [ ] ` / `- [x] ┃a`, Backspace → `- [ ] ┃a`
(the upper, empty box wins, `[x]` dropped), while into an empty `- ` the lower box moves up; `- [x]┃ `
/ `- a`, Delete deletes the trailing space while Delete on an empty `- ` removes the item; an empty task
with children joins (dropping its box) while an empty item with children is refused. Root cause: no
single definition of an empty node.

**B9. A plain Backspace restructures the document** (§3, host default): `- a` / `  - a┃`, Backspace →
`- a` / `  - ┃`, the parent becomes a setext heading and the child disappears, whenever a user clears a
child's text to retype it. `- ┃b c` / `  - a`, Delete → `-  c`: the content column moves and the child
detaches. Needs core handling of character deletion (§5) and caret places (§7).

**Escapes and separators** (§2): Cmd-Backspace on `abc ┃[a]: tail` doesn't escape (missing
`scanReference`); escapes after a task's checkbox that aren't needed (`- [ ] \# x`); no escape at all
for setext title text; Shift-Enter `1. abc ┃2. x`, Shift-Enter before `|---|---|`, and bullets pasted
into an ordered list write text lezer reads differently.

**Tab-indented documents** (§1): children moved by a join are written with spaces (`\t  * x`).

**Host defaults that break structure** (§5): Enter in a fenced block inside an item, a multi-line
plain paste mid-item, typing into a list marker.

**Feel decisions surfaced, not bugs:** Enter on an empty heading adds an invisible blank line above;
Backspace at a paragraph's start after a blank line deletes one newline, making the paragraph a soft
line of the one above or a lazy continuation of the item above (`- a` / `para`), while an outliner
would join the text.

---

### Part VII: the next design

#### 20. Suggested architecture

1. **Line table** with resumable parser state, exposing where state resets; edits re-parse a region
   until the state converges (§2). Projection, verification and id carrying become region-local too.
2. **Prefixes** as stacks of pieces, relative per line, one renderer, one `rehome`; the line table
   says "empty after prefixes" (§6).
3. **Outline** with quotes and callouts as containers (plain quotes headless, callout title as head),
   `head` a line range plus a kind (§6).
4. **Commands** are tree edits on a model parameterised by `EditingPolicy`; text-level commands are
   edits inside one node's head, composed with a tree edit when they create or remove nodes; heading
   sections re-derived after the edit (§1, §3).
5. **One writer:** verbatim node lines; seams, markers (bullets, numbers) and escapes chosen from
   preference-ordered candidates, checked by ourus plus lezer (later a Live Preview approximation, and
   in Obsidian a model of Smart lists, Part III) on the touched region; moves written as moves; the
   blank form of a line in a container; region-scoped (§1, §2, §6).
6. **Editing view** = the pure document plus a per-view overlay (§7.4): the caret's line, when dirty
   and holding no text, re-read with a zero-width sentinel down to convergence, its nodes flagged
   `virtual`; consumers see only the view, the bare reading answers a few internal questions; the host also keeps, per view, the cleanup the
   creating command stated (TO's opened and residue forms, carried places replayed through their
   reversals); without a record (after an undo the host's history didn't carry, after a foreign edit)
   nothing is deleted; `leave` returns cleanups the host records in
   history (§7, §11).
7. **Identity:** mapping, then matching for the leftovers, then tombstones; the full matcher only for
   external changes; one written rule for which side of a split or join keeps the id; computed from the
   transaction that actually landed (§4, Part III).
8. **Host contract:** own the outliner's keys, not text editing (decision 10): intercept Enter,
   Shift-Enter, Tab, Shift-Tab, moves, paste, drop, cross-node cut, and Backspace or Delete at a node
   boundary; typing, deletion inside text, IME and all motion stay native; a guard that is a first-class part of
   the core **judges user-event transactions** (pass, rewrite, veto; unmodelled shapes pass; classifier
   and verdict share predicates) and **reconciles programmatic ones** (other plugins, undo, redo,
   sync); a plan-restoration filter removes what others append to our edits; our edits carry an
   annotation and the user event to use; a view-jurisdiction input for nested editors; history stays
   with the host (§5, §9).
9. **Render facts** by line range, gap lines included, identity facts separate from position facts,
   cached per text, so hosts avoid layout reads (§13); selection covers by downward closure; drag
   destinations as seams plus depth intervals (`coverOf`, `enumerateDestinations`, `wouldAccept`, §14).
10. **Testing:** the spec as the contract with runners for the core, CM6, a textarea and an Obsidian
   host mode; the model-based test as a permanent suite; generators with empty items, tasks, headings
   among lists, untidy indentation and interleaved raw edits; navigation properties; any
   `encoding-failed` fails a test; differential harnesses while migrating.

#### 21. Changes to the brief (on top of p1b Part VI)

- **Source of truth (p1b §22.1), refined:** the editing view reads the caret's empty line as a node
  only once that line was edited while the caret was on it; the bit is the host's, derived from its
  own transactions.
- **How structure is enforced (p1b §22.2), refined:** commands produce target trees; one writer
  encodes them, and its choices are candidates verified against a reader panel, in preference order
  ("intended, then conventional, then small").
- **The host contract (p1b §22.6), revised:** "the core handles every input" becomes "the core owns
  the outliner's keys, lets the editor edit text, judges the user edits that touch structure, and
  reconciles everything else".
  The guard is required, not a fallback, in hosts with third-party extensions (Obsidian above all), and
  the contract names which transaction sources are judged.
- **Formats (p1b §22.8):** placeholders are dialect-independent through the caret design; per family
  the writer knows where typing lands and which encodings depend on trailing whitespace.
- **Performance (p1b §22.3):** add "a caret line change re-reads the view under 1 ms" to the budgets;
  the transaction guard runs on every keystroke, ours and everyone's. A full parse should be in TO's
  range (about 25 µs/KB); and in a real plugin rendering, not the core, dominates latency (§13).

#### 22. Decisions to make

1. Caret-derived places with the dirty bit, plus a per-view stated cleanup (§7, §11)? *Recommended.*
   **Decided against: placeholders as fully virtual nodes** (nothing written to the text until the
   first keystroke, the empty node held only in memory, as Visual Studio's "virtual space" or Vim's
   `virtualedit` hold whitespace). It is the cleanest core design: no cleanup edits, no setext trap,
   no confusing an authored blank line with a placeholder. But it moves the difficulty into every
   host: a widget line with a drawn caret, writing the node out synchronously at
   `compositionstart` for IME and mobile keyboards, history hooks (`invertedEffects`) because
   creating the node changes no text, custom motion and click handling, and accessibility. That
   contradicts the brief's aim of making text-buffer editors (CM, Monaco, textarea, TUI)
   outline-capable cheaply. What survives, inside the core only: the view's empty node is an explicit
   `virtual` node in a per-view overlay over the pure document (§7.4); hosts never see the
   difference.
2. Empty items CommonMark can't hold, when the user leaves them: remove (today), or write them anyway
   for Live Preview and lezer users, as a policy (p1b decision 4)?
3. Heading moves: re-derive sections, or move only with sections among headings?
4. One definition of an empty node, checkbox as chrome? *Recommended.*
5. Which side of a split or join keeps the id: the upper node and the first half? *Recommended.*
6. Plain quotes headless, callouts headed; outdent leaves a container; indent enters the one above
   (§6)? *Recommended.*
7. Renumbering in Obsidian: write numbers Smart lists leaves alone, strip what it appends to our
   edits, or both (§8, §9)?
8. Which transaction sources the guard judges, and what "reconcile" may change for the others (§9)?
9. Selection escalation by downward closure, as TO settled (§14)? *Recommended.*
10. **Decided: the core owns the outliner's keys, not text editing.** §5 showed that intercepting
    everything is possible in CM6, but it would mean reimplementing what the editor already does
    right for every script and input method: right-to-left and bidi text and motion, script-specific
    deletion (Indic Backspace removes one code point, Korean deletes by jamo while composing), word
    boundaries in languages without spaces, IME, spellcheck and autocorrect, OS text services,
    dictation, voice control, handwriting, and phone keyboards that track the surrounding text.
    §5 tested almost none of these (Chromium, simulated IME, no right-to-left scripts, no devices).
    The payoff is small: typing inside a node's text can't break structure, and the boundary cases
    are either outliner keys anyway (Enter, paste) or absorbed by the editing view (B9). So the core
    intercepts only intents with outliner meaning (Enter, Shift-Enter, Tab, Shift-Tab, moves, paste,
    drop, a cut across nodes, Backspace or Delete at a node boundary); everything else is native,
    and the guard judges the result by range: a change inside one node's text passes untouched; a
    change touching prefixes, markers or line structure gets pass or veto, or a rewrite that safely
    clamps its range; never a rewrite during a composition. Right-to-left is a rendering concern:
    logical offsets in the core, line direction in render facts. This is what true-outliner does in
    practice, and it drops most of §5's ~400-line handler.

#### 23. Next experiments

1. **The overlay (§7.4)**, once the incremental line machine exists: re-read the caret's line with a
   sentinel down to per-line convergence; check it equals A's view (and the typed-character
   equivalence) on generated documents, measure region sizes on documents nested under one root
   bullet, and the cost per caret line change.
2. **Place provenance:** run TO's failing case (Tab on an authored gap between paragraphs) and its 7
   carried-place shapes through §7's design, with and without a stated cleanup, and measure the
   undo-into-a-blank-line case.
3. **An Obsidian host mode in the spec player:** port Smart lists' renumbering (true-outliner
   measured its algorithm) as a pure function applied after every action, and see which spec cases
   Obsidian would undo. Cheap, core-only.
4. **Interleaved raw edits in the model-based test:** random raw edits between commands, so commands
   are exercised on the states other plugins leave behind, and the model judges raw changes.
5. **§5 in real Obsidian** with a plugin-heavy vault (Smart lists on, obsidian-outliner, Vim mode,
   Templater, Linter, an autocomplete plugin, Natural Language Dates), using true-outliner's harness
   that drives a running Obsidian: count transactions that reach the editor without our interception,
   and how a guard judging changes by effect classifies them.
6. **A region-scoped encoder** and a faster parse (TO's 25 µs/KB as the target) on the incremental line machine, to bring a structural command under
   8 ms at 10,000 lines.
7. **Org and Neorg empty-node shapes** with org-element (Emacs) and tree-sitter-norg, to replace the
   Pandoc-only Org row and fill in Neorg.
8. **Native editing plus the guard, across scripts and input methods** (decision 10): extend §5's
   Chromium harness to Hebrew and Arabic typing and word deletion, Hindi Backspace, Thai word
   deletion, Korean, Japanese and Chinese IME, Android-style composition with suggestions, and
   dictation-style insertion. Check that structure is preserved and the text is exactly what native
   editing produced; compare with §5's intercept-everything handler. Real devices and screen readers
   need a manual pass.

---

#### Appendix: what the experiment code was, for reference

All under `experiments/` (to be deleted); nothing of it was merged. Worth salvaging before deletion,
if anything: `23.6-containers/spec/quotes.md` (45 drawn quote and callout tests, the decisions of §6.3)
as `pending` examples in `spec/`, and `23.3-model/run.ts` + `model.ts` + `lift.ts` (about 690 lines)
as the seed of the permanent model-based suite.

| dir | contents |
| --- | --- |
| `23.1-encoder` | `encoder.ts`, `commands2.ts` (tree edits and new commands), spec runner with a swappable `execute`, `props.ts` differential, `newcmds.ts`, benchmarks |
| `23.2-search` | `seam-commands.ts` (hooked copy of `commands.ts`), `readers.ts` (ourus, lezer, lezer-gfm line outlines), `search.ts`, `fuzz.ts`, `soundness.ts` (region re-parse check), `bench.ts` |
| `23.3-model` | `model.ts`, `lift.ts`, `run.ts`, bucket classification scripts, reports |
| `23.4-matching` | `match.ts` (GumTree phases), `lean.ts`, `harness.ts` (token ground truth), `eval.ts`, `tombstones.ts`, `bench.ts` |
| `23.5-intents` | `intent.ts` (`handleInput`), `intent.test.ts`, a CM6 host (`demo/`), `drive.ts` (58 Playwright scenarios) |
| `23.6-containers` | outline and commands with containers and the prefix algebra, `spec/quotes.md`, quote properties, shrink and classify tools |
| `7-caret-places` | `doc.ts` and `commands.ts` with caret-derived places, a player with the dirty bit, `eval.ts` (differential, undo, caret walks), `undo-scenario.ts`, `typed.ts` (the view equals the text with one typed character hidden, §7.4) |

## postimpl1d

### ourus: post-implementation notes, part 4

2026-10-11, later the same day. Continues [postimpl1c](#postimpl1c): what came after the
experiments. Two rounds of independent review of the redesign, a look at true-outliner's open bugs
under the new design, Logseq used as a second oracle for the spec, and the spec work that followed.
This part keeps the findings and the reasons behind the redesign's changes.

#### 1. The independent review: what it changed

Two rounds of review of the draft redesign. Every counterexample below was reproduced before the
draft changed.

**Corrections to claims this session made:**
- **"Plain typing inside a node's text can't break structure" is false.** Deleting the first
  character of `- a b` leaves `-  b`: the wider padding moves the content column, and a child item
  stops being a child. Deleting the `x` of `---x` under a paragraph makes the paragraph a setext
  heading. Range containment can't certify safety; the guard has to re-parse the touched region and
  compare structure.
- **"Undo making a line dirty is harmless" is false** (postimpl1c §7.3, corrected in place). With an
  authored blank line between two paragraphs, typing on it and undoing makes it dirty, and leaving
  runs the inferred cleanup, which deletes the line and merges the paragraphs:
  `a\n┃\nb\n` → `a\n┃b\n`. Rule adopted: editing evidence may enable the view, but deleting text
  needs a record that the session wrote it; without one the source is preserved, even when that
  lets the text's own reading reappear (`- a` / `  - ` turning `a` into a heading). An adapter with a
  history hook (CM6's `invertedEffects`) carries the record through undo and redo and avoids that.
- **A caret-only overlay can't represent every promised empty node.** Enter at the start of a first
  child under paragraph text promised an empty item above with the caret staying below; the empty
  item would be away from the caret, where the text reads a heading. Decision: places exist only
  under a caret; such a command moves the caret into the one node it creates, or is refused (moves,
  duplicates, pastes that would leave an unwritable empty node elsewhere). The restriction is on
  unwritable empty nodes only, and a refusal is atomic: no native fallback afterwards.
- **Quotes as an item's first block vanished from the outline** in the container experiment
  (`- > - a`: the item took the quote as its head). Only a paragraph, heading, code block or HTML
  block may be an item's head; a container (or table, or break) stays a child. And a node's head is
  a source segment (line range plus start column), since line ranges don't say who owns what when
  nodes share a line (`- - a`).
- **The region-parse soundness check proved less than claimed.** It compared reduced line
  signatures over re-parsed top-level units, not complete parser state over a resumable machine.
  The incremental line machine is now a milestone with exit criteria, built after a vertical slice
  that runs on full re-parses.

**Contracts it made precise:**
- **The guard checks permitted transformations, it doesn't infer intent.** Each transformation is
  specified with the structural effects it may have; everything outside them is protected. Defaults:
  deleting the space in a childless `- a` allowed (with children refused unless an explicit "unwrap
  item" transformation exists); `- ` typed on a continuation line allowed within its paragraph;
  setext authoring by typing `---` or by deleting the rest of `---x` allowed; heading promotion
  allowed with its re-sectioning; payload deletion that shifts padding repaired. An input the guard
  has no rule for passes and is reconciled; a detected structural change outside every permitted
  transformation is vetoed or repaired. An unrestricted source route exists: a per-view source mode,
  and a per-transaction bypass flag in the core.
- **Verification is three checks:** the intended outline; each node's payload preserved, normalized
  by kind (hard-break spaces, code whitespace, fence info and numbering are compared exactly); and
  source preservation by role (moved payload, edited payload, rewritten prefixes, affected markers,
  new seams, and the prefix shifts a growing marker causes: `9.` → `10.` moves its item's lines).
  The region read is separate from the region allowed to change. Refusals keep their causes apart:
  `not-expressible`, `search-exhausted`, `host-incompatible`, `encoding-failed`.
- **Readers in tiers:** our own at runtime; host-supplied readers at runtime (lezer in CM6), so the
  core takes no dependency; host transformers with their own contract; the full panel in CI only.
  Agreement is judged per affected region, not per document.
- **Smart lists depends on the transaction, not the text:** it reads the changed lines, the
  annotations and the lists around them. Modelled as *document before + proposed transaction →
  actual transaction*. Preference: an encoding it leaves alone where the style policy allows; else
  narrow restoration of marker numbers inside the transaction; else refuse (`host-incompatible`).
  Existing documents are never reformatted to satisfy it.
- **Several cursors' places interact.** In `a` / blank / blank / `b`, a sentinel on either blank
  line leaves two paragraphs; sentinels on both make one. So the editing view is one combined parse
  of all collapsed cursors, cleanups are planned together against one revision and committed as one
  history entry, a place another cursor (or another local view) occupies is never removed, and if
  the combined cleanup can't be validated the source is preserved.
- **Identity across undo:** tombstones are a bounded fallback (shared by the document's views, and
  never reclaimed on equal text alone), not undo identity. Exact identity across undo needs the host
  to carry session metadata in history; adapters without that report uncertain identities honestly.
- **Milestones vertical:** a thin slice first (CommonMark, outline, one tree command through model,
  writer and verification, the editing view, CM6 undo and redo, an early real-Obsidian check), with a
  guard repair, a quote-first item and an undo-and-cleanup sequence in it.

**Also decided along the way:** placeholders are represented as a pure document plus a per-view
overlay (postimpl1c §7.4; fully virtual nodes rejected for their host cost); the core owns the
outliner's keys, not text editing (postimpl1c decision 10); CommonMark, GFM and Obsidian are all in
this iteration's scope.

#### 2. true-outliner's open bugs, under the new design

The repo holds no full open-issue list (follow-ups moved to GitHub issues in September); the
evidence is its known-failing e2e cases (#228, #255, #346), the follow-up inventory's extracted
issues, issues the notes still cite as open, and two repros in its test vault. Of about 25 items:

- **About half disappear as a class:** seams the writer didn't create are left as written (#255);
  structural edits never carry `input.*` labels, which re-arm Obsidian's suggesters (#346); narrow
  plan restoration against Smart lists (#228, to confirm with an Obsidian host mode); emptied text
  becomes a place, not a deleted node (#115); recorded cleanups and history metadata (#153, the
  block-selection place lost on redo); the relative prefix stack (#227, #154); a conformant parser
  (#138, #136, #213, indented code after an emptied list); paste landing where Enter would put a node
  (the deep paste repro).
- **Three become explicit decisions:** the nine-digit ordinal ceiling (#120: refused instead of
  silently corrupted), gestures over an open place (#254), and joins that re-parent children.
- **The rest are untouched UI work:** theme overflow, the backlinks footer, touch targets, ARIA,
  flicker, nested-editor focus, the IME keystroke lost after block selection, Smart lists on the
  user's own typing.

Rewritten on ourus, true-outliner would shrink by roughly half (about 33,500 lines to 17,500): its
10,700-line core goes, and about 5,500 plugin lines move into ourus (the key grammar, change
narrowing, render facts, placeholders, the transaction funnel, folds and zoom state, the command
funnel). What stays is product UI (decorations, the backlinks footer, zoom, settings). Its judge
(`classify.ts` 444 lines, `enforce.ts` 800) is the part the new guard is modelled on.

#### 3. Logseq as a second oracle

`test/logseq/run.ts` replays the spec against Logseq's web demo in headless Chromium: one browser
and one loaded app for the whole run, a fresh Logseq page per test built through Logseq's plugin
API (`window.logseq.api`: `create_page`, `insert_batch_block`, `edit_block` for the caret), actions
pressed as Logseq's keys, and outlines compared as (depth, text) per block plus the caret's block and
offsets, not Logseq's file format. About 70 seconds for the spec checked directly, and 7 minutes to
record.

- **ourus's spec, run as written:** only 74 of 259 examples are pure outlines Logseq can hold (the
  rest have paragraphs or headings outside items, ordered lists, blank lines, tasks, quotes in items,
  carets in markers). Of those, 55 agree, 8 differ only in whitespace (Logseq keeps the space after a
  Shift-Enter break), 11 differ for real.
- **`spec/logseq.md`, Logseq's behavior as its own spec:** every ourus example is adapted to what
  Logseq can hold (`test/logseq/adapt.ts`, read with ourus's parser: every outline node a block,
  heading sections nested, tasks as `TODO`/`DONE`, ordered items plain, carets in markers moved to
  the text start), replayed, and Logseq's results recorded as the expected buffers: 221 examples, 38
  not adaptable (19 duplicates once adapted, 13 actions Logseq lacks, 4 carets outside every node,
  2 cross-block selections). A check run replays all 221 identically. The file declares
  `editor: logseq`, a new spec option, so `npm test` skips it; an offline test in `npm test` checks
  it still reads and draws back unchanged.
- **ourus on `spec/logseq.md`** (offline, `test/logseq/ourus-vs-logseq.ts`): 150 of 221 agree,
  19 differ only in whitespace, 21 differ in outline or caret, and in 31 ourus writes text outside
  Logseq's block model.

**What the differences are:**
- **Feel decisions Logseq made differently:** direct outdent by default (the moved item adopts its
  following siblings); a typed `- ` stays text (Logseq can't author structure by typing); Enter at a
  block's start puts the caret in the new empty block; Enter on an empty block with children makes a
  first child; joins with children are refused, and Delete on an empty block with children does
  nothing; Backspace deletes an empty first block; an abandoned empty child stays.
- **Document semantics Logseq can't have:** Enter on an empty top-level item leaves the list as a
  paragraph with blank lines (15 of the 31).
- **ourus bugs this exposed or confirmed:** Enter in a fenced block inside an item breaks the line at
  column 0 (known, pending); Shift-Enter in a heading item puts text outside the item; leaving a
  place in a list can leave stray blank lines.
- **A Logseq quirk:** a structural operation re-renders the block and trims its trailing line break,
  so Shift-Enter, Tab, Backspace deletes a real character.
- **Logseq already does what five of ourus's pending examples ask** (B3, the first B9, Enter in a
  fence in an item, a multi-line paste mid-item, the tab-indented join), some trivially since Logseq
  has no indentation to get wrong.

**Method lessons:** the first edit after the app loads is unreliable, so every run makes a warm-up
edit; a recorded spec needs a round-trip test of its own drawing and reading (it found three
drawing bugs: leading whitespace in continuation lines, escapes next to the caret, tabs in content);
and comparing outlines rather than files is what makes another editor usable as an oracle at all.

#### 4. The spec, extended

- **`spec/redesign.md`** (two files when written, merged since), in two parts. Its findings: 29
  examples of the bugs and gaps the experiments and the review
  found, all pending except the regression cases that pass today (the authored blank line surviving
  undo, a marker that grows moving its item's lines).
- **Its decisions:** 12 examples pinning the redesign's decisions; 9 pass in the
  prototype and pin the decision, 3 are pending (removing a marker that has children refused, an
  outdent that would leave an unwritable empty node refused, Enter in Obsidian frontmatter).
- **`spec/quotes.md`:** 46 examples (the container experiment's 45 plus the quote-first item), pending
  where the prototype treats quotes as atoms; the obsolete "quotes are atoms" example in
  `commands.md` replaced by a pointer.
- **The player gained `undo` and `redo`** host actions (a step restores text and caret only), and
  the spec format an `editor` option.
- **The model-based test moved to `test/model/`** (`npm run test:model`, a report, not a gate).

Cases still not expressible: several cursors and panes (labelled selections, named views over one
document), Smart lists interference (an Obsidian host mode), and node ids.

#### 5. Learnings

- **Independent review earns its cost.** Two rounds found five real design gaps and two false claims,
  each with a concrete counterexample. Reproduce every counterexample before changing the design,
  and record the correction where the claim was made.
- **Claims about harmlessness need a test.** "Harmless" undo mismatches deleted an author's blank
  line; "inside a node is safe" ignored padding. A property or a regression case should back every
  such claim.
- **An editor as an oracle is cheap when the comparison is semantic.** Outlines plus carets, with
  Markdown encoding normalized away, turned a live web app into a spec runner in an afternoon.
- **Recording expectations from a reference implementation produces a spec of its behavior,** and
  a test of ours against it (150 of 221 here), without hand-drawing anything. Divergences then sort
  themselves into feel decisions, semantics the other editor lacks, and our own bugs.
- **Generated artefacts need round-trip tests.** Three drawing bugs hid until the recorded file was
  read back.
- **Timing is part of the harness.** The demo's first edit after load was unreliable; a warm-up made
  two full runs identical.

#### 6. Suggestions

1. **A Logseq preset for `EditingPolicy`:** direct outdent, joins with children refused, the caret
   into a new block, abandoned empty blocks kept. Running ourus on `spec/logseq.md` with it should
   take agreement well past 90%, and makes "feel like Logseq" a tested promise.
2. **Policy options in the spec format,** so an example can name the policy it assumes and a file
   like `spec/logseq.md` can be asserted against ourus with the preset, not only reported.
3. **Win back Logseq coverage:** tasks map already; ordered lists via Logseq's numbered-list
   property; blank lines and paragraphs stay out by nature.
4. **Add the ourus bugs Logseq exposed to the findings:** Shift-Enter in a heading item, stray blank
   lines when a place inside a list is left.
5. **More oracles the same way:** Obsidian through true-outliner's harness (with Smart lists live),
   and the CM6 demo with its Live Preview imitation; Workflowy and Dynalist need accounts, so they
   come later.
