# Initial implementation notes (2026-10-11)

Notes from building the first prototype: what held up, what the design
underestimated, thoughts on ([`01-brief.md`](01-brief.md)),
problem areas, and suggestions for the next design iteration.

**Part II** is the pre-implementation review ([`preimpl-opus55-3.md`](preimpl-opus55-3.md)), condensed. Each section is
annotated with what the prototype showed: **done**, **changed**, **partly** or **not yet**.

---

## Status at a glance

| area | state | evidence |
| --- | --- | --- |
| CommonMark block parser (`src/syntax/`) | lossless port of commonmark.js 0.31.2; per-line prefix pieces; refdefs as blocks; provisional-place hook | 652/652 spec examples agree on block structure, line ranges and tightness; a 200k-run differential fuzz on container-heavy and tidy documents; line-table invariants fuzzed on arbitrary UTF-16 |
| Outline (`src/outline.ts`) | brief defaults: heading sections, items own their first block, paragraphs leaves, quotes/code/HTML/rules/refdefs atoms | spec examples, property tests |
| `Doc` (`src/doc.ts`) | immutable snapshot; `apply` re-parses and carries ids by head-start mapping, plus explicit identity for moves; provisional places | tests |
| Commands (`src/commands.ts`) | `formatIndent`, `formatOutdent`, `moveUp`, `moveDown`, `insertParagraph`, `insertLineBreak`, `deleteContentBackward`, `deleteContentForward`; ordered-list renumbering post-pass; every result verified by re-parse | 110 literate spec examples (66 single-command, 44 key sequences); command properties at 30k runs |
| Caret helper | `homePosition` (smart Home) | unit tests |
| Lifecycle | `settle(doc, caret)` for abandoned provisional places | unit tests and key sequences |
| CM6 demo (`demo/cm6/`) | `StateField` snapshot, keymap, outline panel, settle on caret moves | 30/30 key-press scenarios in headless Chromium |
| Size | `src` ≈ 2,750 lines (parser 810, commands 1,130); tests, spec and demo ≈ 2,700 | |
| Not built | incremental parsing, raw-edit guard, paste, node selection, delete/duplicate/convert/toggle-task/move-to, dialects, inline parsing, render facts, Obsidian plugin, textarea and GTK demos | |

Timings, full re-parse per edit, real Markdown (true-outliner's notes), Node 26, arm64:

| document | block parse | keystroke (`Doc.apply`) | `moveDown` |
| --- | --- | --- | --- |
| 4.9k lines, 325 KiB | 3.1 ms | 3.4 ms | 9.4 ms |
| 14.8k lines, 975 KiB | 7.5 ms | 10.5 ms | 27.9 ms |
| 34k lines, 2.2 MiB | 19.3 ms | 27.7 ms | 67.9 ms |

A command now costs about three full parses: the plan, the renumbering probe, and verification
(twice, when the provisional-place retry runs). Before the renumbering pass, `moveDown` at 4.9k
lines took 5.7 ms.

---

# Part I: what building it taught us

## 1. What held up

- **Text as the only truth, with verification by re-parse.** Every command plans text changes,
  re-parses the result, and compares the new outline with the intended one. This was the single
  most valuable decision. During development it caught, before anything reached a document:
  - `2. b` indented under `1. a` would read as more of `a`'s paragraph (only a list starting at 1
    can interrupt a paragraph);
  - an empty `  - ` written under a parent's text would turn the parent into a setext h2;
  - a split moving `- def` to a line start would turn the text into a nested list;
  - a move or indent would absorb an unrelated sibling written at an odd column.

  On consistently indented outlines, a property test confirms verification never has to step
  in. It is a safety net, not a crutch.
- **The commonmark.js port.** The block algorithm ported in about 800 lines. The prefix pieces
  fell out of the existing `continue()`/`advanceOffset` calls, as predicted. The only deviation
  from commonmark.js is a quirk of its own: it extracts refdefs at a setext candidate without
  moving the paragraph's start line.
- **Per-line prefix pieces as the workhorse.** Every structural edit turned out to be "change
  the whitespace at the start of some container's piece, on every line of a subtree". The pieces
  answer that directly, including tabs split across containers.
- **The CM6 fit.** Changes in `ChangeSpec` form, a `StateField` holding the snapshot, the planned
  snapshot attached as an annotation, and a three-way result. The `notApplicable` result is
  essential: it tells the keymap "not mine, run your default".
- **The literate spec, plus a key player.** `spec/*.md` examples in CommonMark's `spec.txt`
  style, with true-outliner's glyphs. A runner replays key sequences the way an editor does: host
  defaults where a command doesn't apply, provisional places settled as the caret moves. This made
  true-outliner's real-app regressions straightforward to port. Its #228 and its catalogue
  defects E26, E27, E31 and E33 behave correctly here.
- **Head-line identity.** Ids carried by mapping the start of each node's first line through the
  changes (past text inserted there), with explicit identities for moved nodes, survive every
  command without a separate reconciler. Mapping the node's own start instead lost the ids of
  indented nodes, and of a paragraph a blank line was opened above: whitespace inserted right
  before a node and text typed at its start land at the same offset.

## 2. What the design underestimated

### 2.1 Empty nodes are the central problem, not an edge case

The most common outliner gestures create states that Markdown cannot express:

- Enter then Tab: `- a` / `  - ` is a **setext heading** in CommonMark, not an item with an empty
  child. Live Preview needs `--` for an underline; CommonMark and reading view need only `-`.
  true-outliner follows Live Preview here on purpose (its `marker-without-trailing-space.md`
  records the disagreement), so its writer produces this shape.
- Enter at the end of an item with children: the same empty child right after the parent's text.
- Shift-Enter at the end of a line: the empty line is a blank line, which ends the paragraph.
- Enter on an empty item at the top level: an empty paragraph has no Markdown at all.

All the reviews mentioned "provisional places"; the prototype shows they belong in the **core
model**, not in a host plugin's cleanup code (true-outliner's 819-line `provisional-cleanup.ts`).
The design that worked:

- A provisional place is an offset at the end of an otherwise empty line (blank, or container
  markers only).
- `Doc` carries places, and the parser reads a marked line as if a character had been typed
  there. So `- a` / `  - ◌` is an item with an empty child, and the text stays exactly what the
  editor shows.
- Places map through edits with `assoc = 1`, so typing a space keeps one open. A place vanishes
  when its line gets text.
- Verification first tries without a place at the caret, and adds one only when the plain text
  can't express the intended outline. Places are used only where needed.
- `settle(doc, caret)` runs when the caret leaves. A place the text can hold just stops being
  provisional; the line of one it can't hold is removed.

**Cost:** places are session state that shapes the parse. The derived trees are a function of
(text, places), not of text alone. Host undo doesn't know about places (§4.1).

### 2.2 Text that moves to a line start can change meaning

Every split and line break moves the rest of a line to the start of a new one, where `- x`,
`1. x`, `# x`, `> x`, fences, `---` and `===` mean something else. The policy that worked:

- **Enter:** a list marker typed mid-line becomes the new item's marker (`- abc ┃- def` makes two
  items). Other block starts are backslash-escaped, so the text stays text.
- **Shift-Enter:** everything that would interrupt the paragraph or underline it is escaped: `\-`,
  `1\.` (only `1.` can interrupt a paragraph), `\#`, `\>`, `\===`.

This conflicts with "minimal changes": an escape is a change the user didn't type. The brief
should acknowledge that preserving meaning sometimes requires writing more than the user typed.

### 2.3 Indentation is about *whose* whitespace, measured in columns

- **A child's indentation lives in its parent's continuation piece**, not in the child's own.
  Indenting shifts at the start of the moving item's piece. Outdenting must shift at the start of
  the *parent's* piece, or there is no whitespace to remove. The first outdent implementation got
  this wrong.
- **Tabs:** a shift that isn't a multiple of 4 changes how far a later tab reaches. Tab-indented
  documents must be shifted by tabs. "Does this document nest with tabs?" must look only at the
  indentation before markers and on continuation lines, never at padding after a marker
  (`-→b`).
- **Blank lines never shift.** Inside a list item, a blank line's whitespace is never content,
  even within a fenced code block.
- **Marker width is structure.** `9.` → `10.` moves the item's content column, so renumbering
  can detach children. The prototype falls back to not renumbering (one `pending` spec case).

### 2.4 Untidy documents limit what can be expressed

Siblings written at different columns (`  * x` after `1. a`), or adjacent lists of different
types, make some moves and indents unexpressible: an unrelated item would become a child. On
generated untidy documents about 3% of applied-or-attempted commands end in `encoding-failed`.
Every one examined was a real hazard, not a planner bug. Users of real vaults will meet these as
refusals.

**Suggestion:** a user-invoked "tidy this list" command (normalize marker columns and indent
units), plus clearer rejection messages naming the bystander.

### 2.5 Blank lines (seams) need a policy in every command

Only the outdent move implements the seam rule from Part II §3 so far. The moved run takes its
following separator, and arrives with a copy of the destination's separator, so a loose list
stays loose. Still missing:

- moves between items with different separators;
- abandoned paragraph places leaving blank lines that loosen a list;
- paragraph/code swaps that need a separator written.

### 2.6 Renumbering cuts across every command

Ordered lists need renumbering after Enter, Backspace, moves and indents. The prototype runs it
as a post-pass:

1. parse the planned result;
2. renumber the ordered lists whose items the change added, removed or reordered (compared by
   node id), counting up from their smallest number, unless they are numbered all alike. A list
   that only contains the change keeps its numbers: renumbering every list around a changed line
   rewrote `5.` / `9.` to `2.` / `3.` in an outer list when a nested bullet was indented;
3. compose those changes with the plan (`composeChanges`, property-tested);
4. verify;
5. if that fails, fall back to the un-renumbered plan.

This works, but costs an extra parse per command, and changes composed into one splice lose some
position-mapping precision.

### 2.7 "Split" and "join" are a family of feel decisions

true-outliner's catalogue lists 35 Enter positions. The prototype had to decide each of these;
they are the first candidates for `EditingPolicy` knobs:

| situation | chosen behavior | alternatives users may want |
| --- | --- | --- |
| Enter on an empty nested item | outdent | new sibling (Logseq-ish) |
| Enter on an empty top-level item | leave the list: empty paragraph place, blank-line separated | new sibling; delete the item |
| Enter at the start of an item | empty item above; the caret stays with the text | split (an empty item above, the caret on the lower one) |
| Enter at the start of a heading or paragraph | blank line above | empty node above |
| Enter in a paragraph | two paragraphs | soft line break (plain text editors) |
| Enter in a heading | the rest of the title becomes the section's first paragraph | reject; new sibling heading |
| Enter on a task | the new item is a task, unchecked | plain item |
| Shift-Enter twice | paragraph break inside the item (a child paragraph) | reject |
| Backspace at an item's start | join into the node above, the parent included | outdent first (Workflowy) |
| Backspace on the first item | nothing | delete the bullet (Obsidian core) |
| Tab on a heading | org-style: level ±1, subtree shifts, following siblings may be adopted | strict reject |
| Home | text start, again line start | always line start |
| Outdent | logical: siblings below stay with the parent | direct: siblings below become children (Logseq default) |

### 2.8 Host defaults are where structure breaks

`notApplicable` hands the key to the editor, and editors do raw things:

- **Backspace before a marker** (fixed): CodeMirror's Home puts the caret at column 0, and its
  Backspace then merged `- two` into the line above as text. Backspace anywhere in an item's marker
  zone now joins.
- **Delete at the end of an item** (fixed): CodeMirror's Delete merged the next item's marker into
  the text (`- abc` / `  - def` became `- abc  - def`). `deleteContentForward` now joins the node
  below, as Backspace does from its start.
- **Still open:**
  - word and line deletions across a marker;
  - Enter or Shift-Enter inside a fenced code block within an item (the new line lacks the item's
    indentation, which closes the item and the fence);
  - selections across nodes replaced by typing or paste.

The raw-edit guard (`judge`) is needed earlier than Part II §8 planned. The open cases above are
its first test list.

### 2.9 What verification can and can't promise

- It compares an *expected* outline with the re-parsed one. The planner builds the expected
  outline with the same helpers (`headLines`, normalization). A mistake made consistently in both
  passes.
- The signature covers kind, heading level, normalized text and nesting. It ignores:
  - list grouping, so splitting one list into two (different bullet characters) is invisible;
  - tightness;
  - marker types and numbers;
  - fence info strings;
  - blank lines.

  So "the list became loose" or "the list split in two" pass.
- Heading level changes compare in document order only (`flat`), because sections re-derive.

**Suggestion:**

- add list grouping and tightness to the signature, as postconditions a command declares;
- express a few postconditions independently of the planner, as properties (for example, "no
  node outside the operand changes parent");
- verify only the touched region once parsing is incremental.

### 2.10 Line endings

CM6 normalizes `\r\n` to `\n` unless told otherwise, so the demo never sees CRLF. The core keeps
whatever it is given, and new lines take the ending of the line being split (spec cases for CRLF
and mixed files). Host fidelity (`EditorState.lineSeparator`) still needs to be settled per
adapter.

### 2.11 True-outliner's lessons, confirmed

- **A real parser** removed whole classes of its research notes. Lazy continuation, block-start
  margins and seams at re-indent simply work, or get rejected.
- **Paragraphs as leaves** removed the "list after a paragraph" problems entirely.
- **Its drawn notation and real-app cases port cleanly as data.**

---

## 3. The brief, point by point

| the brief says | the prototype says | suggestion |
| --- | --- | --- |
| An editor-agnostic core, CM6 first | The CM6 fit is natural. The host owns: the keymap, settling places on caret moves, history, Home | Extract `ourus-cm6` (the demo's ~250 lines) as the reference adapter |
| Text-first editors bolt structure on; marry text-first and structure-first | In practice the "marriage" is three mechanisms: verification by re-parse, provisional places, and meaning-preserving encoding (escapes, marker reuse, renumbering, seams) | Name them in the brief as the core's job |
| A robust, fully compliant parser | Block phase done and fuzzed; no inline parsing | Scope the claim to block structure until inlines exist |
| Own the document model: an immutable snapshot | `Doc` | Keep |
| Two layers: syntax tree and outline | Plus a third: the line table with prefix pieces, which every command works on | Make it a documented, public layer (it already is in the API) |
| Text is the source of truth; trees derived | Trees derive from (text, provisional places) | Amend: places are session state that shapes the parse and must ride along host history |
| A richer stateful object on top | Not built; the demo's `StateField` plus `settle` does the job | Add a small `Session` helper for non-CM hosts (doc, selection, places, settle, history hooks) |
| Lossless round trip | Trivial once the text is kept; the work is the line table | Keep the requirement; it is cheap |
| Quick updates without a full re-parse | Not needed yet below ~5k lines; commands cost about 3 parses | Next: line-machine checkpoints (Part II §2), and one verification parse |
| Two kinds of ops: structural commands and raw text edits | Commands done; raw edits only reconcile (`Doc.apply`) | Add the guard (§2.8) |
| Return a snapshot, a diff, id events, selection, undo hints | Returns doc, changes and selection; ids carried implicitly; no events, no inverse | Add identity events and inverse changes when wiring host history |
| Indent, outdent, move, move-to, split, join, delete subtree, duplicate, convert kind, toggle task, group forms | First six done, with contiguous group forms for indent, outdent and moves | Next: delete subtree, duplicate, convert, toggle task, move-to |
| Exact structure or reject | Done, with §2.9's caveats | Add declared postconditions |
| Minimal changes; consistent formatting (renumbering, indents, blank lines) | Renumbering and indent adoption done; blank lines partly; escapes add changes | State "meaning-preserving locality" instead of "minimal" |
| W3C Input Events names | Worked well; `insertLineBreak` added. Home is caret motion, not an input event (`homePosition`) | Keep; add a caret-motion namespace |
| Raw edits mirror a CM transaction (revision, changes, selection, origin, intent, IME) | `Doc.apply(changes)` suffices so far | Define the request shape together with the guard |
| Selections and cursors in and out; insert and block cursor | Main selection only; no block cursor | Multi-range semantics as in Part II §6.4 |
| Configurable feel | Hard-coded; §2.7 lists the decisions | An `EditingPolicy` with those knobs |
| Headings are containers; items own their first block; empty lines TBD | Done; empty lines answered by seams plus provisional places | Record both as decisions |
| Node selection, gesture interception and keybindings stay in editors | Keybindings in the demo; no node selection | Escalation and operand helpers belong in core (Part II §6) |
| First milestone: vanilla HTML, basic CM6, maybe GTK | CM6 only, by request | Textarea and GTK later, as adapter-conformance tests |

---

## 4. Problem areas, most serious first

1. **Undo and provisional places.**
   - Undo restores text but not places, so undoing into a state that needed a place briefly shows
     what plain CommonMark makes of it (a setext heading).
   - `settle` runs outside history, so undo can also restore an empty line it removed.

   *Fix:* carry places in history: CM `invertedEffects` or a history-aware annotation, and
   restore them on undo and redo.
2. **Raw edits across structure** (§2.8). Unguarded keys can still corrupt structure in a few
   common situations.
3. **Untidy real-world documents** (§2.4). Refusals are safe but frustrating; tidy-up tooling and
   better messages are needed.
4. **Quotes and callouts are atoms.** Obsidian users keep lists inside callouts constantly. Lists
   inside quotes can't be edited structurally yet.
5. **Seams** (§2.5) everywhere except outdent.
6. **Paste**: true-outliner's biggest late bug source; not started.
7. **Command cost**: three parses per command; fine now, not at 30k lines (68 ms per move).
8. **Verification blind spots** (§2.9): list grouping and tightness.
9. **Live Preview** is untested. Its rendering of what we write (`- ` with a trailing space,
   tab-quantized nesting) needs the Obsidian spike and the CM5 oracle (Part II §4).

---

## 5. Suggestions for the next design iteration

### 5.1 Amend the brief

- **Source of truth:** "The text and the session's provisional places determine the trees.
  Places are the only state outside the text that shapes the parse; they map through edits,
  vanish when typed into, and are settled when the caret leaves."
- **Locality:** replace "minimal changes" with "meaning-preserving locality". Change only what the
  intent requires, plus what keeps the rest meaning the same: escapes, renumbering, seam
  separators, indentation adoption.
- **Compliance:** "block structure agrees with CommonMark 0.31.2; inline conformance is a later
  milestone".
- **Feel:** list the decisions from §2.7 as the initial `EditingPolicy`, with the current
  behavior as the default.

### 5.2 Design work, in order

1. **History contract.** Places, identity events and inverse changes travel with host history.
   Specify the CM6 mechanism and a generic one for the `Session` helper.
2. **Raw-edit guard.** `judge(doc, request) → pass | rewrite | veto`, driven first by the
   concrete cases in §2.8. Rewrites delegate to commands (Delete at an item's end becomes a
   forward join).
3. **Seams everywhere.** Part II §3's rule, applied by every command that moves or removes
   content. Tightness becomes a declared postcondition.
4. **`EditingPolicy`.** The knobs from §2.7, plus indent unit (detect, tab or N spaces), bullet,
   renumbering (`always`, `ifSequential`, `never`) and blank-line policy.
5. **Quotes and callouts as containers** in the outline. The syntax layer already has their
   prefix pieces.
6. **Incremental line machine** (Part II §2): checkpoints, convergence and one-region
   verification. This also drops the command cost to about one partial parse.
7. **Verification postconditions** (§2.9): list grouping, tightness, "no bystander re-parented".
8. **Commands to finish the set:** delete subtree, duplicate, convert kind, toggle task, move-to
   (drag and drop), paste (`insertMarkdown`), node selection and escalation.
9. **Tidy command** for untidy lists.
10. **Obsidian spike**: plugin skeleton, structure drawn from ourus, the CM5 LP oracle in the
    fuzz, measured cases in the real app.

### 5.3 API notes

- **Current surface:**
  - `Doc.parse(text, {provisional})`, `doc.apply(changes, {identity, provisional, drop})`,
    `doc.replace(text)`;
  - queries: `nodeAt`, `nodeAtLine`, `lineAt`, `headLines`, `headRange`, `headStart`;
  - `execute(doc, command, selection)`, `settle(doc, caret)`, `homePosition(doc, pos)`;
  - `parseCommonMark`.
- **Likely changes:**
  - `execute` takes a context (`EditingPolicy`; later the session's folds and zoom);
  - results gain `identity` events and `inverse` changes;
  - `settle` returns history hints;
  - a `Session` class wraps doc, selection, places and history for textarea and GTK hosts.
- **Internals to revisit:**
  - `commands.ts` (1,050 lines) wants splitting: reindent, encoding (escapes, markers, seams),
    planners per command, verification;
  - `split` and `lineBreak` share `cutText` and `encodeRest`; `join` and `split` should share an
    "empty node" vocabulary.

### 5.4 Revised milestones

| milestone | contents |
| --- | --- |
| **M1** (next) | history contract; guard for the §2.8 cases; seams in all commands; `EditingPolicy`; quotes and callouts as containers; `ourus-cm6` package |
| **M2** | incremental line machine and region verification; remaining commands and paste; node selection; Obsidian plugin spike with the LP oracle |
| **M3** | GFM and the Obsidian extensions; inline scan, then inline conformance; render facts; folds, zoom and locators |
| **later** | textarea and GTK adapters as conformance runners; Logseq, Pandoc and Org backends |

---

# Part II: the pre-implementation review, annotated

Written before any code ([`preimpl-opus55-3.md`](preimpl-opus55-3.md), unchanged there), as a delta
on the three earlier reviews: [`preimpl-gpt6.md`](preimpl-gpt6.md),
[`preimpl-opus55-1.md`](preimpl-opus55-1.md) and [`preimpl-opus55-2.md`](preimpl-opus55-2.md).
Condensed here; status notes in *italics*.

## II.1 Consensus, recorded as decisions

| topic | decision | status |
| --- | --- | --- |
| Name, licence, location | `ourus`, MIT, `./ourus/` | *done* |
| Runtime | TypeScript, ESM, zero runtime deps, no DOM or Node APIs in core | *done* (dev deps only) |
| Source of truth | text; syntax and outline derived | *changed*: plus provisional places (§2.1) |
| Fidelity | `serialize(parse(s)) === s` for every JS string (UTF-16) | *done*; invariants fuzzed |
| Layers | text → lossless block syntax → outline; session optional | *done*, without a session class |
| Outline defaults | sections; leaves; item = first block plus children; quotes and callouts atoms; lists not nodes; frontmatter preamble | *done*, except frontmatter (not recognized yet) |
| Parser | own, porting commonmark.js's block mechanisms; commonmark.js as oracle | *done* |
| Commands | plan → encode → re-parse → check → result or typed rejection | *done* |
| Relocation | one `place()` primitive under indent, outdent, move, drop, paste | *not yet*: separate planners share reindent and seam helpers; unify when drop and paste land |
| Feel | intents (W3C names) → planner with a feel profile → primitives | *partly*: intents yes, profile hard-coded |
| Results | changes, inverse, identity events, selection, history hints | *partly*: changes and selection |
| Raw edits | always reconcile; optional pass/rewrite/veto gate | *partly*: reconcile only |
| Empty places | held in the session with a lifecycle | *done*, in `Doc` plus `settle` |
| Config axes | dialect, outline policy, editing policy | *not yet* |
| Testing | drawn cases, laws, oracle panel, reference implementation | *done*, except the panel beyond commonmark.js and a separate reference implementation |

## II.2 The parser as a resumable line machine

**Claim.** CommonMark block parsing is a deterministic function of (state at line start, line
text). Its only backward effects reach into the open paragraph:

- setext underlines;
- GFM table delimiter rows;
- refdef extraction.

Evidence (commonmark.js 0.31.2):

| source | result |
| --- | --- |
| `[a]: /u` / `===` | a paragraph whose text is `===` |
| `[a]: /u` / `text` / `===` | an h1 heading |
| `[a]: /u` / `---` | a thematic break |

So per-line state checkpoints plus "re-run until the state converges with no paragraph open"
give incremental parsing, cheap verification, and head-line identity with one mechanism. That
replaces the reviews' token, region and convergence tiers. The same shape fits GFM, the Obsidian
extensions, and Org; Pandoc needs checking.

**Line table.** Each line is `[prefix pieces][leaf content or nothing][ending]`, with at most one
leaf per line. Trees become views; commands become line moves plus prefix rewrites.

**Porting notes**, all confirmed:

- NUL is replaced for interpretation only;
- commonmark.js's setext `sourcepos` includes peeled refdef lines;
- blocks hold normalized content;
- state must become an interned value for convergence checks;
- the parser is iterative, so there is no recursion-depth limit.

*Status:*

- **Port and line table: done.** The parse emits `LineInfo` (prefix pieces, leaf, lazy flag)
  beside the block tree.
- **Storage: changed.** The block tree is still the primary structure, rebuilt per parse.
- **Checkpoints and convergence: not yet.**
- **Head-line identity: done**, by mapping rather than shared line objects.

The provisional-place hook (a virtual character appended to a marked line's interpretation)
slotted into the line loop with no other changes. That is evidence the line-oriented design is
the right one.

## II.3 Blank lines belong to seams

Evidence (commonmark.js 0.31.2):

| source (lines) | lists |
| --- | --- |
| `- a` / `  - b` / *blank* / `- c` | outer **loose**, inner tight |
| `- a` / `  - b` / *blank* / `  - b2` / `- c` | outer tight, inner **loose** |
| `- a` / *blank* / `  more` / `- b` | loose: the item holds two blocks |
| `- a` / `- b` / *blank* / end of file | tight |
| `para` / *blank* / `- a` vs `para` / `- a` | the same tree |

true-outliner gives every blank run to the deepest preceding node as its `trailingGap`
(`src/model.ts`, `src/encode.ts`), so moving `b` in the first row silently tightens the outer
list.

**Rule.**

- A blank run is a seam between the node before it and the node after it, owned by their lowest
  common parent.
- A command declares a seam policy: the vacated seams collapse into one; destination seams copy
  the siblings' separator.
- Tightness is a postcondition.
- Display (hiding gaps) is the host's choice.

*Status:* **partly**. Outdent applies the rule (spec: "Outdenting from the middle of a loose list
keeps it loose"); the rest is in §2.5.

## II.4 Obsidian: parse the CommonMark family; Live Preview is a reader

There should be no Live Preview *parse* profile:

- LP's list structure comes from a CodeMirror 5 stream highlighter, not a tree grammar;
- the rest of Obsidian (reading view, `metadataCache`, block refs, Dataview) reads the file
  CommonMark-style;
- the plugin draws structure itself.

So the dialect is CommonMark + GFM + the Obsidian extensions, and LP is a reader the writer must
not confuse.

**A runnable LP approximation.** Upstream CodeMirror 5 (`codemirror@5.65.20`, MIT) runs headlessly
via `addon/runmode/runmode.node.js`. Its list regex `/^(?:[*\-+]|^[0-9]+([.)]))\s+/` is
byte-identical to the one true-outliner read out of Obsidian's bundle, and it reproduces
true-outliner's hand measurements:

| case | CM5 markdown mode, headless | TO's measurement in Obsidian |
| --- | --- | --- |
| a bare `-` between items | not a list line | not an item |
| `-  a` | content column 3 | content column 3 |
| `> q` / `  -` | quote continuation, no list | `HyperMD-quote-lazy` |
| tab nesting | depths 1 / 2 / 3 | depth by tab |

Use it as a dev-only fuzzing oracle, calibrated against real-app cases.

*Status:* **not yet**. The prototype gives one new reason to care: the setext trap (§2.1) is
exactly where LP (`--`) and CommonMark (`-`) disagree. A writer validated only against LP would
have shipped it.

## II.5 Runtime vs test-time guarantees

- **Runtime:** re-parse with ourus's own parser and check postconditions.
- **Shipped writer rules:** one space after a marker, never a bare `-`, nest at the content
  column in the destination's unit, copy separators, no 4+ column indentation outside items.
- **CI:** differential fuzzing of command outputs across a reader panel (commonmark.js,
  markdown-it, micromark, lezer, the LP approximation).

*Status:* runtime **done**; writer rules **partly** (marker spacing, indent-unit adoption, escapes,
separators on outdent); CI panel **not yet** (commonmark.js only, for parsing).

## II.6 API simplifications

- **Preflight is free** in a pure core: call `execute` and discard the result. *Done.*
- **Commands are serializable data.** *Done*: `{type}` objects, replayed from Markdown spec
  files.
- **Results are `applied | rejected | notApplicable`.** *Done*; `notApplicable` proved essential.
- **Drop per-segment `moves`**; adapters use node-relative anchors. *Done* (no moves); anchors
  not yet needed.
- **CM6 change semantics unchanged.** *Done*: changes dispatch directly.
- **Vocabulary:** command, edit, changes, result; avoid "transaction" and "operation". *Done.*
- **One options object**, presets later. *Not yet* (no options).
- **Gate later, request shape now.** *Changed*: the gate is needed sooner (§2.8).

## II.7 Gaps the reviews left open

- **Render facts queryable by line range**, for viewport rendering. *Not yet*; the demo
  highlights from `nodeAt` and the outline.
- **Persistent locators** (kind, head-text hash, ordinal) to restore folds and zoom after a
  reload. *Not yet.*
- **An inline layer earlier than "later"**: needed for splitting inside `**bold**` and links,
  `^id`, tags, wikilinks, tasks. *Not yet*; tasks are handled with a narrow regex
  (`[ ]`/`[x]` continuation, Home).
- **Multiple selections**: operands per range, unioned per parent, planned once. *Not yet*; main
  selection only.
- **Block cursor**: `caret: 'bar' | 'block'` in the policy; clamp to the last character. *Not
  yet.*
- **Whole-text replacement** with guarded id matching. *Partly*: `doc.replace` diffs by whole
  lines and maps ids through that; no content matcher.

## II.8 The spec as a literate document

CommonMark `spec.txt`-style examples, with true-outliner's glyphs (`┃`, `«…»`, `▒`, `→`, `∅`).
*Done, and extended:*

- `◌` marks a provisional place; `␍` a carriage return;
- the middle section takes a command name, or a key sequence (`⏎ ⇥ "x"`) played with host
  defaults and settling;
- `example pending` marks agreed but unimplemented behavior (reported as todo, not failed);
- `spec/commands.md` holds 54 examples, `spec/scenarios.md` 43, including true-outliner's
  real-app regressions and catalogue cases.

## II.9 Scope: a walking skeleton first

The union of the reviews was a lot of API to freeze before anything ran. The plan was to ship
parse → outline → five commands → textarea and CM6 demos on full re-parse, then harden.

*Done*: the CM6 walking skeleton, and it changed the design. Provisional places, escapes,
renumbering and the guard's urgency all came from typing into the demo, not from the reviews.
The textarea demo was skipped by request. The revised milestones are in §5.4.

## II.10 Repository and tooling

Planned:

- an `ourus/` package with a `src/{text,syntax,outline,commands,session}` layout;
- `spec/`, `test/`, `oracle/`, `demo/`, `bench/`;
- TypeScript 7, vitest and fast-check, esbuild;
- zero runtime dependencies;
- `@codemirror/*` as peer dependencies for the adapter;
- licence hygiene: commonmark.js BSD-2 notice, CC-BY-SA spec data, no MPL or AGPL code.

*As built:*

- flat `src/*.ts` plus `src/syntax/`;
- `node --test` with type stripping instead of vitest (zero config, no extra dependency);
- fast-check, esbuild, `playwright-core` for the smoke test;
- no `oracle/` or `bench/` directories yet (commonmark.js is a dev dependency; the benchmark is a
  scratch script);
- `NOTICE` covers commonmark.js and the spec data.

## II.11 Decisions taken before coding

| decision | outcome |
| --- | --- |
| Line machine plus line table instead of a rowan-style tree | *partly*: line table yes, checkpoints next |
| Seams instead of trailing gaps | *partly*: outdent so far |
| Obsidian as a CommonMark-family dialect; LP as writer constraint and dev oracle | *open*: no Obsidian work yet; the setext trap strengthens the case |
| Tab on a heading is org-style | *done* (flat verification) |
| An unclosed fence while typing re-projects honestly | *done* by default (no hold overlay) |
| Walking skeleton with CM6 in M0 | *done* |
| Spec notation: true-outliner glyphs in CommonMark-style examples | *done*, extended (II.8) |

---

## Appendix: reproducing and running

- **Run everything:**
  - `npm test`: unit, spec, property and differential tests (`OURUS_FUZZ_RUNS=…` for longer
    runs);
  - `npm run typecheck`;
  - `npm run demo:serve` (http://localhost:8000/);
  - `npm run demo:smoke` (headless Chromium; `CHROMIUM=…` sets its path).
- **commonmark.js evidence (II.2, II.3):** parse with commonmark.js 0.31.2 (a dev dependency) and
  print the block types with `listTight`; the oracle code is in `test/oracle.ts`.
- **The CM5 Live Preview approximation (II.4):**
  1. install `codemirror@5.65.20` in an empty directory;
  2. load `addon/runmode/runmode.node.js`, then `mode/markdown/markdown.js`;
  3. get the mode with `getMode({tabSize: 4}, 'markdown')`;
  4. feed each line to `mode.token` through a `StringStream`, calling `blankLine` on empty lines;
  5. read `state.listStack` and `state.quote` after each line.

  Setext checks need CM5's line lookahead, which that harness doesn't supply.
- **true-outliner sources cited:** `../repos/obsidian-true-outliner/src/model.ts`, `src/encode.ts`,
  `e2e-tests/cases/`, `docs/research/enter-and-shift-enter-catalogue.md`,
  `docs/research/marker-without-trailing-space.md`, `docs/research/native-list-decoration.md`.
