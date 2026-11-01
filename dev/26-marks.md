# Marks (2026-11-01)

Marks on ourus's texts, done cleanly. Three steps first: `src/text/marks.ts` rewritten from scratch
around one class, `MarkSet`, and the codebase moved onto it (§1–4, §6); a node's text made an actual
slice of the document's lines past their containers' prefixes, no markup escape taken out, the
escapes ourus writes marked (§5, §6); and the blank lines ourus raises marked and taken out again
where nothing needs them (§7). Then, after review and on top of them (§8): fixes the review found
(§8.1); every set checking what its marks are on, which made node texts keep their held spaces
(§8.2); the spec drawing auto characters, and the closers ourus types made auto marks (§8.3);
`autoClose` in `closeBackticks`'s place, inline code, math and comments verbatim, and one-line
`$$x$$` inline as Obsidian reads it (§8.4); a full SxS run on all of it (§8.5). Built on `main`
(`d0d80d4`, `5ba4522` after the rebase), committed squashed as "Marks refactoring". ourus is alpha:
no legacy API is kept.

## Contents

- [0. In short](#0-in-short)
- [1. The design](#1-the-design)
- [2. What went](#2-what-went)
- [3. The API](#3-the-api)
- [4. Where marks live](#4-where-marks-live)
- [5. Node texts are slices](#5-node-texts-are-slices)
  - [5.1 What the writer lost](#51-what-the-writer-lost)
- [6. Log: `MarkSet` and escapes](#6-log-markset-and-escapes)
- [7. Blank lines ourus raised](#7-blank-lines-ourus-raised)
  - [7.1 What it does](#71-what-it-does)
  - [7.2 Log](#72-log)
  - [7.3 Measured](#73-measured)
- [8. Verified](#8-verified)
  - [8.1 Fixes after review](#81-fixes-after-review)
  - [8.2 A set refuses misplaced marks; node texts keep their held spaces](#82-a-set-refuses-misplaced-marks-node-texts-keep-their-held-spaces)
  - [8.3 The spec draws auto characters; closing delimiters are ours](#83-the-spec-draws-auto-characters-closing-delimiters-are-ours)
  - [8.4 `autoClose`; verbatim spans; one-line `$$x$$` inline](#84-autoclose-verbatim-spans-one-line-xx-inline)
  - [8.5 The full SxS run](#85-the-full-sxs-run)
- [9. Open](#9-open)

## 0. In short

- **A mark is an offset; one class holds them.** `MarkSet` is a text and two sorted lists of offsets
  on it: `placeholders` (points read as typed text) and `auto` (characters ourus put in). What finer
  kind a mark is (an empty node or a held space; an escape or a blank line) is read from the text,
  never stored. No `Mark` type, ranges, kinds registry or policies.
- **A node's text is its lines as written**, past their containers' prefixes: every backslash in. A
  backslash ourus wrote is marked; an unmarked one is the author's and is never taken out
  (`revise 2\. draft`, Enter before `2`, Backspace: the author's backslash stays; ourus's goes).
- **A blank line ourus raised because Markdown needed one is marked**, and taken out again where the
  nodes stay apart without it; the author's stay.
- **A closer ourus types with its opener is marked** (`autoClose`: a fence's run, `$$`, `%%`, `-->`,
  and opted in, a backtick and brackets): Backspace in an empty pair takes both only where the
  closer is ours, and a closer the author types over becomes theirs (§8.3, §8.4).
- **Every set checks its marks** (a placeholder on a blank or at a line's end; an auto mark on a
  backslash, a line break or a closer) and throws `MarkError` on one anywhere else, which caught a
  writer bug and made node texts keep their held spaces (§8.2).
- **Code spans, inline math and comments are verbatim**, as atoms are: nothing pairs in them, and an
  edit that would need an escape inside one is refused, not given a literal backslash (§8.4).
- **The spec draws auto characters**, a combining caron below (`2\̬. draft`), checked both ways in
  every step; `spec/auto.md` shows them all (§8.3).
- **Measured**, each step against the one before: of the round trips, 934 runs come back exactly
  that didn't (11 for escapes, 923 for blank lines) and one that did doesn't (Backspace25 under cut
  and paste, §9), besides the new spec case's own runs; an edit and then the caret leaving gives the
  text back far more often (§7.3); SxS better by 9 cells in the Markdown editors for escapes, worse
  by 2 in one app for blank lines, and the new case (Regression24b: ourus drops its own escape on a
  join) agreed by 11 apps of 18 (§6, §7.3, §8); no command fails to write; speed unchanged. The
  final full SxS run moved no cell by ourus's doing, and played about 700 new ones (§8.5).

## 1. The design

**A mark is an offset.** What kind of mark it is, is the list that holds it. `MarkSet` holds the
lists, and the text they are on:

```ts
class MarkSet {
  readonly text: string;
  readonly placeholders: readonly number[]; // points, 0..text.length
  readonly auto: readonly number[];         // characters, 0..text.length-1
}
```

- **Two lists, coarse-grained.** `placeholders` are points read as typed text; `auto` are characters
  ourus put in for the user (an escape, the line break of a blank line it raised, a closer it typed
  with its opener: §8.3, §8.4).
  A finer split (`emptyNodePlaceholders`, `heldSpacePlaceholders`, `autoNL`, `autoEscape`, ...) was
  weighed and not taken: in every case the finer kind is already said by the text. A placeholder at
  a line's end holds an empty node, anywhere else a held space; an auto mark's kind is the character
  under it (`\`, a line break, a closer). Stored apart, they would have to be re-sorted whenever an
  edit moves one into the other's place (text deleted after a held space leaves it at a line's end:
  an empty node now). Read from the text, they can't disagree with it. The roles are asked per
  offset (`hasEmptyNodeAt`, `hasHeldSpaceAt`); lists of each (`emptyNodes`, `heldSpaces` getters)
  were built and dropped: their three users each needed one filter, or nothing (§6).
- **Width is the list's, not the mark's.** A placeholder is a point: it goes only where text on both
  sides of it goes, and a replacement starting at it carries it past. An auto mark is its character:
  it goes with it. Both move past text inserted at them. That is the whole policy table.
- **The text is in the set.** A list of offsets means nothing without the text it is on, and passing
  the two around separately was the commonest way to break them (three coordinate systems for one
  offset). With the text inside, the role queries need no second argument (`marks.hasEmptyNodeAt(pos)`),
  `map` gives the text after the changes too, and `slice`/`splice`/`concat` are the string operations
  and the marks' at once, so a node's text and its marks can't drift apart.
- **Canonical by construction.** `MarkSet.of(text, lists)` sorts each list, drops duplicates and
  throws a `RangeError` on an offset off the text (a point past its end, a character at it, a
  non-integer). Every other way to make one (`map`, `slice`, `splice`, ...) keeps them canonical.
- **Checked by construction** (§8.2). Every set's constructor refuses a mark on a character it can't
  be on, with `MarkError`: a placeholder anywhere but on a blank or at a line's end, an auto mark
  anywhere but on a backslash, a line break or a closer. `map` drops a placeholder an edit leaves
  in a line's text instead (a place gone, not a corrupt list). Validity in context (does a
  placeholder still hold an empty node, is a blank line ours still blank?) is the document's job:
  `validPlaceholder` and `validAuto` in `doc/placeholders.ts`, run on every read.
- **Binary search, once.** `MarkSet.has(offsets, pos)` and `MarkSet.within(offsets, from, to)` are the
  two searches consumers need; they're static so they work on any sorted list (a list of the set, a
  writer's own). `map` goes through `ChangeIndex` (a binary search per mark), so a
  document with a mark on every blank line maps in `O(k log m)`, not `O(k·m)` (a scan per mark is
  quadratic there).

## 2. What went

From the old `marks.ts` (234 lines): the `Mark` type (`{ kind, from, to }`), ranges, `MarkPolicy`
(`assoc`, `mapMode`, `onInsertInside`), the kind registry (`defineMarkKind`, `policyOf`), the kind
constants (`PLACEHOLDER_MARK`, `AUTO_WHITESPACE_MARK`, `AUTO_CLOSED_MARK`), `createPlaceholder`,
`isPlaceholder`, `isEmptyNodePlaceholder`, `isHeldSpacePlaceholder`, `emptyNodeAt`, `heldSpaceAt`,
and on `MarkSet`: `marks`, `update`, `between`, `find`, `points`, `shift`.

From `OurusDocUpdate`: `addMarks`, `dropMarks` (one test used them, no host) and `setMarks`, now
`marks`.

## 3. The API

`src/text/marks.ts`, exported from `text/index.ts`; `MarkSet` and `MarkLists` from the package entry.

```ts
interface MarkLists { placeholders?: readonly number[]; auto?: readonly number[] }  // a MarkSet is one

class MarkSet {
  static of(text, lists?): MarkSet           // canonical; RangeError off the text, MarkError on a misplaced mark
  readonly text, placeholders, auto
  isEmpty(): boolean                         // no marks, whatever the text
  with(lists): MarkSet                       // the same text, the lists given replaced; this where the same

  // reading
  hasPlaceholderAt(pos), hasEmptyNodeAt(pos), hasHeldSpaceAt(pos), hasAutoAt(pos): boolean
  static has(offsets, pos): boolean          // binary search
  static within(offsets, from, to)           // offsets in [from, to), binary search

  // changing (each gives the text after, with its marks)
  map(changes: ChangeSet | ChangeSpec[], text?)  // text: the result's, where the caller has it; a placeholder left mid-line goes
  slice(from, to, endPoints = false)         // a placeholder at `to` only with endPoints
  splice(from, to, insert: MarkSet | string)
  concat(...others: (MarkSet | string)[])
}
```

`MarkError` (exported) is the check's error: the mark, and the text it was on.

`ChangeIndex` gained `removes(from, to)`: whether a change takes out text on both sides of a point
(`from === to`) or any character of a span. It is what `map` asks per mark.

Hosts:

```ts
OurusDoc.parse(text, { marks: { placeholders } });
doc.update({ changes, caret });                 // marks mapped through the changes
doc.update({ changes, marks: { placeholders } }); // every mark, in the new text's offsets
doc.update({ text: old.text, marks: old.marks });  // an undo: a MarkSet is a MarkLists
const saved = doc.marks.placeholders;           // what an undo history keeps
```

## 4. Where marks live

- **`OurusDoc.marks: MarkSet`**, on `doc.text` (`doc.text === doc.marks.text`; the constructor takes
  the set and nothing else). `update` maps them through the changes (or takes `params.marks` whole),
  reads the placeholders as the parser's sentinels, and drops a mark that no longer holds (`read` in
  `doc.ts`: a placeholder by the parse, an auto mark by its character, `validAuto`). `touchedLines` reads again the lines where a mark of
  either list came or went, since a node's text carries its marks and is cached per stored node.
- **`OurusProse.marks` / `OurusAtom.marks: MarkSet`**, on the node's text. The constructors take
  `MarkSet | string` (a string has no marks) in the old `text` and `marks` arguments' place, and
  `text` is `marks.text`. `splice`, `slice`, `concat` are `MarkSet`'s; `withMarks(lists)` is `MarkSet.with`'s,
  and the same text where nothing changes. An atom's marks are the closers ourus typed (a fence's
  closing run, `-->`); a prose text's its escapes, held spaces, empty nodes and inline closers.
- **The writer** collects `placeholders` and `auto` in the new text's offsets (`Writer` in
  `write.ts`: a spelled text's empty nodes and auto marks where its offsets were written, the old
  marks in copied lines mapped, the line break of each blank line `done()` raised) and hands them to
  `update` as `{ placeholders, auto }`.
- **Blank lines** carry their mark on the document only: a node's text holds no blank line after it.
  `done()` reads them there (`autoLinesOf`, §7).

## 5. Node texts are slices

A node's text is its lines past their containers' prefixes **as written**: each line's content is
`doc.text.slice(contentFrom, to)`, nothing taken out of it but what was always the container's or the
frame's to say (the first line's padding, the lines before an item's text below its marker; a tab
its containers took part of is still its spaces). A held space is in it, its placeholder on it
(§8.2: until then it was left out). **No markup
escape is taken out any more**: `\# a`, `2\. b`, `\- c` are strings with the backslash in them, and
the document's marks come along onto it (`MarkSet.within` per line in `read.ts`).

The prefixes stay stripped, deliberately: moving a text between containers without touching its
characters is what a node's text is for.

What a backslash in a text is, follows from the `auto` list:

- **An escape ourus wrote has an `auto` mark** (the writer puts every escape it adds in the text, and
  marks it). One without the mark is the **author's**: a character of the text like any other.
- **The writer never takes out the author's**, wherever the text goes. Where it stands at a markup
  position it is the escape its line needs there; elsewhere it is a character (`revise 2\. draft`,
  Enter before `2`, Backspace: `revise 2\. draft` again, where the old reader lost it:
  Regression24's "To revisit", now settled).
- **The writer takes out ours** whenever it spells a text again, and puts back what the text needs
  where it now is, so one that nothing needs goes (`revise 2. draft`, Enter, Backspace:
  `revise 2. draft`, Regression24b). The exception is one before a character inline syntax starts
  at (`keepsEscape` in `doc/escapes.ts`: `<`, a backtick, `*`, `[`, Obsidian's `=`, ...; not GFM's
  autolink `:` and `w`, not `#` before a blank): without it the text could read otherwise
  (`one⏎\<div>` joined is `one\<div>`, not inline HTML), so it stays.
- Losing a mark (a reload, a host that doesn't keep `auto`) only makes an escape of ours the
  author's: kept, never wrong.

### 5.1 What the writer lost

The writer had two kinds of escapes: *markup* ones, kept outside the text in a side table
(`OurusDraft.escapes`, by node and offset) and written in by `write.ts` as it spelled each line; and
*gained* ones (`\<div>`), in the text. With every escape in the text, the side table and everything
reading it went:

- `OurusDraft.escapes` → `OurusDraft.escaped: Set<number>`, which `write.ts` still asks in two places:
  whether a node's text was escaped where it is (so a later line needs no escape from the writer).
- `write.ts`: `Spelled.escapes`, the per-line escape insertion in `spellLines`, and `position()`'s
  `assoc` (a text offset is one position now).
- `draft.ts`: `#written` inserting escapes into lines; `#escape`'s split of "markup kept apart" from
  "gained by the text". Every escape it puts in goes through `#putEscape`, which inserts a marked
  backslash and records it in `gained` (successive coordinates: each in the text with the ones before
  it in, which is what the anchor loop compares against; the old code recorded gained ones in the
  text without any, which was right only for one).
- `doc/escapes.ts`: `markupEscapes` (only the reader used it). `escapeParagraph` takes `absorb`
  (default true); the writer passes false. `MdEscapedParagraph` gained `escapes`: every backslash put
  in, in the lines with them in.
- `read.ts`: the `markupEscapes` pass and its `omitted` bookkeeping.

## 6. Log: `MarkSet` and escapes

**Phase 1: `MarkSet` and its consumers.** One pass over every use of the old API (`grep` for each
removed name), file by file, the type checker finding the rest.

- `doc/doc.ts`: `OurusDoc` built from a `MarkSet`; `parse({ marks: MarkLists })`;
  `update({ marks })`; the caret's placeholder added with `with`; `withConfig` re-reads from
  `this.marks` (no copying them out first); `read` filters `placeholders` through
  `validPlaceholder(tree, pos)`; `touchedLines` diffs both lists with `MarkSet.has`.
- `doc/placeholders.ts`: `validPlaceholder(tree, pos)` takes an offset; the empty-node test is the
  character there.
- `doc/read.ts`: a node's marks in its string's offsets from `MarkSet.within` on each line: an
  empty node's at the line's end, a held space's on its space (§8.2), an auto mark on a character
  the string keeps. The string and its marks are one `MarkSet.of` call.
- `doc/text.ts`: constructors and string operations as in §4. `concat` no longer re-shifts each
  part by hand.
- `commands/`: `util.ts` (`inMarkup`, `deleteHeldSpace`: the held space's placeholder filtered out
  of the list, and since §8.2 its space), `paste-plain.ts`, `quote.ts`, `duplicate-subtree.ts` (a placeholder in what is
  copied: `MarkSet.within(placeholders, from, to + 1)`: the subtree's end too; it read every kind of mark before).
- `writer/`: `settle.ts` works on placeholder offsets (settling one keeps a text's empty nodes and
  drops its held spaces: since §8.2 `withoutHeldSpaces`, the spaces too); `check.ts`; `draft.ts` (the
  placeholder a text needs at its end is its whole `placeholders` list, its auto marks kept;
  `#readLines` finds a held space with `within(placeholders, cut, line.to)`: before the line's
  end, only a held space can be); `write.ts` as in §4.
- Tests: `test/text.test.ts`'s marks section rewritten for the new class (canonicalizing, roles,
  the binary searches against a scan, placeholder and auto mapping against `mapPos`, tiling
  slices, splice, `with`), and `ChangeIndex.removes` against a scan; host-API sites in
  ten test files and `sxs/lib`. `test/doc/doc.test.ts`'s add/drop test became a map-or-set one,
  with the `RangeError`.
- **Found on the way:** `outline.test.ts`'s `pick` indexed one past the end when a fraction was
  exactly 1, handing `undefined` as a placeholder; the old `validPlaceholder` let it through
  silently. `MarkSet.of` threw on it. Fixed in the test.
- `demos/cm6/main.ts`: the history keeps `doc.marks.placeholders` and restores with
  `{ marks: { placeholders } }`.

Result: `npm test` 2355 of 2355 (as before), `npm run typecheck` clean. `marks.ts` 234 → 195 lines.

**Phase 2: no escape stripping.** In the order it went:

1. Took the `markupEscapes` pass out of `readText`: 87 tests failed. Nearly all one failure: Enter
   sets `- def` as an item's text, the writer writes `- \- def`, and the self-check (`check.ts`) reads
   back `\- def`. The writer's absorb-then-regenerate pass assumed texts never hold a markup escape.
2. Escapes into the text, marked, and only ours absorbed (a predicate into `markupEscapes`): 19 left.
   Most were Enter-then-Backspace: ours written at a line start (`\- def`) survived the join mid-line
   (`- abc\- def`), since `markupEscapes` only takes out a backslash that is markup *and still needed*
   where it stands; mid-line it is neither, so it stayed.
3. Ours taken out wholesale before escaping, but before an inline-significant character
   (`keepsEscape`), and nothing absorbed after (the predicate became `absorb: false`):
   11 left, every one an intended change.
4. The spec: Regression24, 25, 26, 31, 32 and PastePlain10 keep the author's backslash; Scenario23
   drops ours after Shift-Enter (`2.` can't interrupt the paragraph); Regression24b is new (ours goes
   on the join); the blank-line cases come with §7. Three unit tests changed with the model (`locate`, `text`: the backslash
   is a text offset; `draft`: the escape is in the text, marked, the caret before it).
5. The side table and its plumbing removed (§5.1), `test/differential.ts` taught the new API beside
   the old one (it drives `HEAD` and the working tree through one adapter), comments and the
   `text`, `doc`, `writer`, `parser` and `commands` READMEs brought up to date.

**Measured, against `d0d80d4`**, the commit before this work (exported with `git archive` to a
scratch directory, run there with the same scripts):

- `npm test`: 2356 of 2356 (one new spec case). `npm run typecheck` clean. A timing-ratio test
  ("long list or quote") failed once under load and passed on the rerun, as before this work.
- Round trip (`node test/inverse.ts`, 119,909 runs, run by run with `INVERSE_DUMP`, keyed by pair,
  case and input): exits 0. **11 runs come back exactly that didn't** (Regression153 under
  indent/outdent: `--` came back `\--`; Regression26, 31 and PastePlain10 under Shift-Enter,
  Enter and outdent/indent). **21 fail that didn't, every one a run of Regression24b**, the new case
  (it fails as any buffer does: Enter then Backspace eats the space at the split, cut then paste puts
  the caret at the end). Twelve runs of Regression24–27, 31 and PastePlain10 went from *text* (the
  author's backslash lost) to *space* (only that split space).
- Differential (`node test/differential.ts <old> <new>`, 100 documents, 569,965 command runs):
  **no run fails to write**; 1,304 differ, all traced to the model: a caret between a backslash and
  what it escapes (`\┃# b`) is a text offset now, where before it was the text's start (Backspace
  there defers to the host, which deletes the backslash, a character; Enter and Shift-Enter split
  there; a command's caret at the text's start lands before the backslash, where it was, not past it);
  and the author's escape kept where the old writer absorbed it and put one elsewhere
  (`[a]\: tail` with text pasted before it: `a⏎  b[a]\: tail`, not `a⏎  b[a]: tail`).
- `node test/bench.ts` (10,000 lines): within noise of `d0d80d4` on every row.
- `node test/heavy.ts` (the view pass, the round trips played by this tree's code and by `d0d80d4`'s on
  the same corpus, the differential run): passes. Of the 24 round-trip lines `d0d80d4`'s code doesn't
  give, every one is a run of a case this change edited, failing as before but closer (the author's
  backslash kept: `revise 2\. a┃3\. b` where `d0d80d4` gave `3. b`, a soft line break lost by both) or
  the move from *text* to *space* above.
- **SxS** (`node sxs/run.ts --rejudge`, 18 apps, no app run). Three fixes to the judge first:
  `plainText` (`test/drawing.ts`) leaves out the backslashes that are markup in a text, `loose`
  (`sxs/lib/block.ts`) unescapes, and `compareOutlines` compares the caret as a place in the
  unescaped text. **They are not neutral on `d0d80d4`**: played by
  `d0d80d4`'s code, the fixed judge already gives 1 to 4 more agreements per app in 12 apps, the apps'
  own backslashes having counted against ourus. So the comparison that says what this change does is
  `d0d80d4`'s code and this tree's under the same, fixed, judge: **agree +9, disagree −9, caret,
  whitespace and error unchanged, no app worse in any column.** The nine are Regression24, 25 and 26
  in the Markdown editors (Obsidian, Live Preview, Outliner, true-outliner, SilverBullet, Emacs), which
  keep the author's backslash as ourus now does. Regression24b is new and no app has played it ("not
  run", which adds a column to every report: most of the reports' churn). `.sxs/results` and
  `sxs/*.md` are rewritten by the rejudge.

## 7. Blank lines ourus raised

Built on the two steps above (their commit, `696b261`, is what this step is measured against).
A blank line ourus raised, as an `auto` mark on its line break: no new list, no new kind, the
character says what it is.

### 7.1 What it does

- **Produced** where `done()` raises a gap from none because Markdown needs a blank line, not
  because the command asked for one: a paragraph a list or a block would continue, an empty item
  under its parent's text, an empty paragraph made, block-id lines that would name the block after
  them, a loose list's new item at the caret. Those sites put the node in `autoGaps`; the writer marks
  the raised line's break (its first character, in CRLF).
- **Held** while its line is blank (`validAuto` in `doc/placeholders.ts`, run on every read): typed
  on, the line is the user's, and the mark goes.
- **Consumed** at `#raise`'s two seams (a node's text and its first child, two siblings): a blank
  line of ours, in a gap the command didn't state, is taken out where the nodes stay apart without
  it. Under an Obsidian callout title, a block of one line, it always goes.
- **Whose lines a gap is** follows the gap: a split gives the new node the old one's lines, a join
  the lower node's to the upper, a scope end moving blank lines records where they came from
  (`#carriedGaps`), and `OurusDraft.inheritGap(to, from)` gives `to` the lines of a node taken out,
  never fewer than `to`'s own lines of the author's where `from` set something apart from it
  (`#gapFloors`). Backspace taking an empty node out and settling an empty paragraph the caret left
  use it.

Six guards keep the round trips: carried gaps, the blank-line check, the floor, scope ends,
`#ownLines` reading an item whose text was below its marker as it is written now, and the floor only
where the node taken out set something apart.

### 7.2 Log

1. The gap handling in `draft.ts` and the writer's mark, with `autoLinesOf` asking
   `hasAutoAt(line.to)`: 2351 of 2356, the five failures exactly the spec cases this changes
   (MoveDown34, MoveUp35, MoveUp36, Outdent15, Scenario6: a blank line ours goes back, where the nodes
   stay apart without it). Their buffers redrawn.
2. Tests for blank lines and escapes (`test/marks.test.ts`: 18 of them; closing backticks' came with
   §8.3). Two findings. The scaling test failed: a write in a
   document with a mark on every blank line took 34 / 128 / 332 ms at 2,000 / 4,000 / 8,000
   paragraphs. Half was the writer's carry of old marks, asking the pieces once a mark: a mark clear of every change moves by the changes before it, copied or not by a
   binary search over merged intervals. The other half: `validAuto` found a line's start
   with `lastIndexOf('\r')`, which in a text without one scans to its start, once a mark. Walking
   back over the line's blanks only: 6 / 14 / 29 ms, as unmarked.
3. The heavy suite's differential showed settling an empty paragraph (`settle.ts` dissolving it when
   the caret leaves) losing the author's blank lines: `p⏎⏎⏎> q`, Enter after `p`, the caret away:
   the step before gave `p⏎⏎> q`, the empty paragraph's two lines gone; with the mark, the line of ours left
   went too: `p⏎> q`. Settling now gives the node above the paragraph's lines (`inheritGap`), as
   Backspace does; not to a parent with no text of its own (a quote's: the draft refuses a gap
   after no text, and settling failed), and a line of ours under an Obsidian callout title goes
   (a title is a block of one line: `#raise` skipped it before reading the marks).
4. **Tried and reverted: "a raised line is ours only where the author had none".** For Backspace25
   (§7.3), every site that raises a gap asked `from` first: between the upper node's text and the
   lower node, with nothing there the draft keeps (a node cut, its blank lines), was there a blank
   line without a mark? If so, the raised line took its place unmarked. It changed only marks, and
   fixed Backspace25. It broke 8 runs that came back exactly and made 49 caret-only runs gain a blank
   line. Gap7 is the pattern: `x⏎```⏎code⏎```⏎⏎q`, the fence cut, leaves `x⏎⏎q`; the line is the
   author's, rightly, but it was the fence's, between the fence and `q`. Pasted back after `x`, the
   fence takes a blank line of its own and `x`'s stays: one too many, where a line of ours had been
   trimmed. In Backspace25 the paste puts the pasted item above the line instead. Which seam a line
   belongs to once the node it set apart comes back is the command's gap handling, not provenance:
   the attribution was right and the result worse.

### 7.3 Measured

- `npm test`: 2374 of 2374. `npm run typecheck` clean. `node test/bench.ts`: within noise.
- **Round trips** (`test/inverse.ts`, run by run against `696b261`'s code on the same spec): **923 runs
  come back exactly that didn't, 1 fails that didn't**. The groups that fall most are the extra
  blank line's: Enter then Backspace 374 → 65, moving up and down 388 → 83 and 294 → 47, outdent then
  indent 113 → 30, a move and back 266 → 62, cut then paste 619 → 524. The caret groups rise by the
  runs that now fail only on the caret. The baseline (`test/inverse.baseline.json`) is re-recorded:
  the spec changed.
- **The one**: cutting the empty item of `- a⏎- ⏎⏎para` takes the author's
  blank line with it, `done()` raises one of ours so `para` doesn't continue the list, and pasting the
  item back trims it, since an empty item and a paragraph are apart without one. The outline comes
  back; the author's blank line doesn't. Not a marks question (§7.2, step 4); left (§9).
- **Differential** (`test/heavy.ts`; and 400 documents with full records, classified by script): 0
  runs fail to write. The outcomes that move are nearly all "settled elsewhere" (a command, then the
  caret leaving): of the examples that differ, the text comes back to what it was before the command
  in 1,205 of 1,874 for Enter (before this step: 189) and 428 of 458 for Shift-Enter (93). One
  example goes the other way, in CommonMark only: `- a⏎- [ ] ⏎⏎  > q⏎- b`, Enter at the quote's line
  start, the caret away, loses the blank line under `- [ ] ` (`[ ]` is text there, which takes
  another path through `done()`); with any other item text, in any flavor, both that input and the
  one without the blank line come back exactly (§9).
- **SxS** (rejudge, same judge as the reports of the step before): 17 apps unchanged; Obsidian (true-outliner)
  agree −1, caret −1, disagree +2, on MoveDown34 and Outdent15, two cases this step's spec changed:
  moved or outdented back, the blank line ourus raised goes, where the plugin, a text editor, keeps
  it.

## 8. Verified

On the commit of all three steps (`7abb3b6`), every suite:

- `npm run typecheck` clean; `npm test` 2374 of 2374; `node test/inverse.ts` exits 0 against its
  baseline (re-recorded in §7, the spec having changed).
- `node test/heavy.ts`: the view pass passes; the round trips, played by this commit's code and by
  the last commit's on the same spec, move nowhere; the differential run, 0 runs fail to write, no
  outcome moved.
- `npm run test:model` (3,000 random command sequences against the reference model): 3789 of 5501
  steps agree, 68.9%, every command's count as at `d0d80d4`; 199 disagreement buckets, `d0d80d4` 200.
- **SxS, a full run of every app** (`node sxs/run.ts all`, 18 apps, 15 minutes), against the reports
  rejudged from the apps' previous runs: Regression24b, new, is played for the first time: eleven apps
  agree; seven keep the backslash ourus wrote, where ourus takes it out (the six Markdown editors,
  which keep any backslash, and SiYuan; the spec says the join drops ours). Every
  other cell that moved, moved with ourus's code the same: the apps' own runs vary (Logseq DB now
  disagrees on Backspace48 and Delete32; Roam now agrees on Placeholder1, Placeholder5, ShiftEnter13
  and Select20; Logseq OG on Outdent8; BlockNote's driver errors on MoveSubtree5 and 6). Totals: agree
  +11, caret −2, disagree +7 (Regression24b's seven), error +2 (BlockNote's).

### 8.1 Fixes after review

An outside review of `7abb3b6` found two bugs, both reproduced and fixed:

- **Enter right after an escape of ours failed** (`-┃-`, Shift-Enter, Enter at `\┃-`: write-failed;
  `d0d80d4` handled it). The split left the upper text only our backslash; the draft took it out in
  `#escape`, after `#placeholders` had decided that text needed none, and the empty paragraph was
  lost. Our escapes now go first (`#dropOurEscapes`, a pass before `#placeholders`, and still at the
  start of `#escape` for texts set later), so a text that was only them is empty and held. And Enter
  takes a caret past only our escapes as at the text's start (`enter.ts`, rule 6), as `d0d80d4` did,
  the backslash not being text: the empty paragraph opens above, the caret in it (Regression24c).
- **A duplicate's escapes lost a mark** (`- x ┃2. a`, Enter, duplicate: one `auto` mark for two
  backslashes; joined, the unmarked one stayed as the author's). The carry mapped a mark clear of
  every change by the changes, and the changes took the copy for the original (the copy is written
  after it, the diff inserts before it): the original's mark went to the copy's backslash, and none
  to the original's. Old text written twice (`copyPieces`) now carries its marks by the pieces, once
  where the original's put it and once per copy; placeholders the same (Regression24d).

Then: typecheck clean; `npm test` 2376 of 2376 (the two new cases); `node test/inverse.ts` exits 0
(counts not held, the spec changed); `node test/heavy.ts` passes, round trips moved nowhere against
`7abb3b6`, the differential run 0 write failures and no outcome moved. Regression24c and 24d are not
played on the apps yet.

### 8.2 A set refuses misplaced marks; node texts keep their held spaces

To catch lists corrupted on the way (an offset off by one, a list read against another text), every
`MarkSet` checks what its marks are on, in its constructor (`check`), so `of`, `with`, `slice`,
`splice` and `map` all do, and throws `MarkError` (exported) on one that can't be:

- a **placeholder** on a blank (a held space's) or at a line's end (an empty node's), nowhere else;
- an **auto** mark on a backslash or a line break, the two kinds ourus puts in. `validAuto`'s branch
  for any other character went (a set refuses one first).

`map` drops a placeholder an edit leaves anywhere else rather than throwing: the space a held space
held taken out (`- \┃# b` after it settles; a host deleting it) is a place gone, not a corrupt list,
as one whose two sides go is. The document's read dropped those before (`validPlaceholder`);
`OurusDoc.update` maps the old marks through the writer's changes for `touchedLines` even where the
writer gives its own lists, which is where they showed.

**Held spaces were the one thing in the way.** A held space is a space in the document, its
placeholder on it, read as text. `readText` left the space out of the node's text and kept the
placeholder where it was, so in the node's text the placeholder sat on the next character:
Placeholder8 (`- ┃a b`, Delete: `- ┃◌ b`) was the item's text `b`, placeholder on `b`; Regression3
(`- > a┃ # b`, Backspace: `- > ┃◌ # b`) the item's text `> # b`, placeholder on `#`, a quote's text
keeping its `>`. A first version of the check let those through (a placeholder at the start of a
line's content, past blanks and `>`s); that was the omission showing, so the omission went instead:

- **`readText`** keeps a held space in the node's text, the placeholder on it: Placeholder8's item
  text is ` b`, Regression3's `>  # b`. Node texts are slices (§5) here too, and a text offset is one
  document position (no two sides of a character left out).
- **The writer settles a held space by taking its space out**, in every text it writes
  (`#settleHeldSpaces`, before `#transitions` and again with `#dropOurEscapes` for texts set later;
  `OurusProse.withoutHeldSpaces`, which `settle.ts` uses too). It used to get that for nothing from
  texts that didn't have the space.
- **Commands** read it as the character it is: `deleteHeldSpace` takes the space before the caret
  (Backspace) or after it (Delete); plain paste at a held space fills the place, the space after it
  text, with no space added back (PastePlain16); typing that opens a fence settles a held space before
  the caret, and one at the caret is the place the character fills (`` - ┃◌ ``` x `` and a backtick:
  the host types it, `` ` ``` x ``).

The strict check then caught one writer bug: Indent on an empty last paragraph (`para⏎    - a⏎⏎┃◌`,
from the model test) wrote the item `- ` anew but also carried the old end-of-text placeholder by the
copied text, onto the new `-`; the document's read used to drop it. The carry now keeps that
placeholder only while the last node is neither another nor written anew (`write.ts`, `lastOf`).

What moved, `node test/heavy.ts` against `7abb3b6` (`HEAVY_BASE=7abb3b6`, new: the suite compared only
against `HEAD`), each judged:

- **The caret at a held space** after a paste or a move is before it, as the spec draws it (`┃◌`),
  not after it; typing there fills the place (`- x # b`, as Placeholder8's `- x┃ b`), where the old
  caret typed after it (`-  x# b`).
- **Writing a text settles its held space**: Enter after one (`-  ┃# b`) writes `- \# b` at once,
  where it used to wait for the caret to leave (the same text then). Regression129's held space on a
  lazy line (`>- [x] >⏎ ┃◌  -`) was in the document's marks but not in the text's (the old omission
  missed a held space that wasn't its line's first character): joined by Backspace its space now
  goes, and Delete before it now refuses (the space gone, `-` reads as an item, no escape keeps it),
  where the host deleted a space and the next one was held.
- **Typing a backtick on a held space before a fence** no longer drops the space: `7abb3b6` made
  `` - ┃◌ ``` x `` a four-backtick fence, the space gone with the omission.
- **Quote88 under `quotes: atom`** (the SxS's Obsidian adaptation): Delete on the empty first line
  was `write-failed` (the empty node's placeholder, mapped onto the next line's `>`, failed the
  writer's check), and now joins the line, `- > ┃>⏎  > q`; five apps join it too (three cells
  disagree → whitespace, one → agree), Obsidian True Outliner does nothing (agree → disagree).

Then: typecheck clean; `npm test` 2377 of 2377; `npm run test:model` 68.9%, 199 buckets, as before;
the view pass passes, no round trip moved, the differential run none failing to write.

### 8.3 The spec draws auto characters; closing delimiters are ours

Every spec buffer draws the auto marks on characters, a combining mark after each (a caron below,
U+032C, after trying a small letter a above, U+0363, and a triple underdot, U+20E8: `2\̬. draft`,
an escape of ours; an author's backslash bare), and every step checks them both ways, as
placeholders (`test/drawing.ts`, `readDrawing` and `drawState`; a start's go into the document). The
SxS takes them out (`withoutAuto`): an app has none, and ourus's replays for it start without them.
221 cases drew escapes ourus writes without saying so: redrawn (`node test/redraw.ts --apply`), each
checked first to differ by the marks alone. A raised blank line's mark isn't drawn (§9).

Closing delimiters are auto marks now: the check takes one on a backtick or
a tilde, and `validAuto` holds it while the character is there.

- **A fence typed open** (`openFence`): the closing fence ourus puts on the line below is ours, every
  character of its run (`` `̬`̬`̬ ``); typed again by hand above it, it is the author's, and takes the
  old one's place, nothing of ours left (Auto3).
- **A fence grown** (rule 1 of backtick.md): the character typed is the author's, the one the other
  fence grows by ours (`` ````̬ `` under an author's fence, Auto6).
- **An inline pair** (a backtick in `autoClose`): its closing backtick ours; Backspace in an empty pair
  takes both only where it is (Auto9), an author's pair losing one, the host's (Auto10).

`spec/auto.md` (Auto1 to Auto11) demonstrates them: escapes ours and the author's, fences typed and
closed by hand, tilde fences, growing fences, inline pairs. Then `npm test` 2391 of 2391; the SxS
rejudge moves no cell (the new cases played in §8.5). The spec's action lines escape every backtick
since (`` > "\`\`\`" ``, the reader refusing a bare one), so a quote renders as it reads.

### 8.4 `autoClose`; verbatim spans; one-line `$$x$$` inline

`closeBackticks` became `autoClose`, a list of openers (the first list option: `OurusConfig.lists`,
read and written space-separated, `none` empty; a spec's config block a YAML list), each closer it
types ours (an auto mark, which the check now takes on `` ` ~ ) ] } $ % - > `` too), a closer stepped
over the author's. Two probes of the SxS apps (`a ┃ b`; then mid-word, before and after a letter,
over a closer, Backspace in a pair, over a selection) set the rules and the drivers' presets:

- **Fences** (```` ``` ````, `~~~`): as before. **`$$`, `%%`, `<!--`** (the default with them):
  paired on the caret's line, inline (`$$┃$$`); `<!--` at a line's start a block of HTML; Enter in an
  empty pair of ours spreads it into a block, Backspace takes the last character and the closer.
- **`` ` ``**: as `closeBackticks: all` was. **`(` `[` `{`**: paired where the next character is a
  blank, the line's end or a closer (an editor's closeBrackets), in code, math and after a backslash
  too; two make the double; over a selection they wrap it. **`[[`, `((`** alone: WorkFlowy's doubles.
- **Backspace in an empty pair** of an opener listed takes both, whoever typed it.
- **`$`** (Logseq's and Roam's): inline math's, paired as a bracket at a word boundary, a second in
  the empty pair the double (`$$┃$$`), Backspace there a level (`$┃$`); a `$` after text closes math.
  Logseq (both) and Roam list it: Backspace in `$$┃$$` takes a level there and `$$` pairs in every
  flavor, which only `$` says, though the file-based Logseq and Roam pair no single `$` (Auto36: one
  cell off, against two without it). And a driver can say what typed text the app takes as its own
  command (`capturesTyped`): RemNote's `$$` (its math editor), `[[` and `((` (its pickers), the
  characters gone, skip the cases typing them.

The last two followed the SxS (§8.5): ourus first took only a closer of its own on Backspace and paired
no bracket in code, math or after a backslash; every app that pairs brackets does both, so ourus does.

Obsidian's Reading view, probed for `$$` and `%%` shapes, confirmed them blocks when they span lines
(they hold `- y`, `# z` and blank lines; they interrupt a paragraph), but `$$x$$` and `%%x%%` alone
on a line inline, in a paragraph: the parser read those as one-line blocks, fixed (`fencedBlock`).
(`- a⏎$$⏎x⏎$$` goes into the item there, lazily, though at the top level a `$$` block interrupts a
paragraph: an inconsistency of Obsidian's, left.)

Code spans, inline math and comments are verbatim, as atoms are (`MdTree.verbatimSpanAt`): typing in
them pairs nothing, and an escape ourus would put in at a line starting inside one, a character of
the span there, no escape, is refused instead (`paragraphEscapes`, Auto23, Auto24): it used to be
"text the line gains", a backslash in the code or the TeX.

`spec/auto.md` has Auto12 to Auto35 for all of it. Then `npm test` 2421 of 2421 (the timing case
under load aside); the SxS rejudge moves no cell.

### 8.5 The full SxS run

`node sxs/run.ts all` on the squashed commit, against the reports from before it, every cell
compared. Two harness bugs and one driver's showed first, fixed in the run's wake:

- **A list option matched only when equal.** A case under `` autoClose: ['```', '~~~', '`'] `` was
  skipped on every app whose own list has brackets too (the four Obsidians, Tine, both Logseqs,
  SilverBullet; then the block apps declaring theirs), where `closeBackticks: all` had matched. An app
  that declares its own list now has the case replayed under it (`sxs/lib/plan.ts`): judged against
  the drawing where that changes nothing, "under autoClose" where it does.
- **Both Logseqs died** when their shared Chromium page closed under 18 apps at once: rerun alone,
  clean.
- **SiYuan's kernel exited** (an orderly "exiting kernel", one per run, a different kernel each
  time), and every later test on its worker failed (`fetch failed`): the driver now starts a kernel
  that exited again and reloads its page, and closes a dialog an earlier test left open, before each
  test (`sxs/siyuan/driver.ts`). The cause wasn't reproduced: Scenario6, where the first failure
  showed, agrees alone and with its file.

Then, after rerunning the apps each fix concerned, and a rejudge with nothing left "not run": in
every cell that moved, ourus's own drawing is what it was, the app's changed. **Better 8** (Logseq
DB ×3, SiYuan ×3, BlockNote, Roam), **worse 22** (SiYuan 15, its Tab and Shift-Tab not taking in
some indent cases; Roam 6, around a placeholder, the caret and Shift-Enter; BlockNote 1, a driver
timeout), and about 700 played for the first time: `spec/auto.md` (Auto1 to Auto35), DuplicateSubtree13,
Regression24c and 24d, and the backtick cases the list fix let run.

Of `spec/auto.md`'s cells then, 188 disagreed. Most by design: block apps make a code block of their
own for ```` ``` ```` (no fence lines to compare), Obsidian edits fences a character at a time
(the closing one doesn't grow, the one typed above it doesn't take its place), the Markdown editors
split before `2.` with no escape, and the refused breaks (Auto23, Auto24) are made there. Two
presets were wrong (Logseq both and Roam pair `$$`; RemNote pairs none of `$$`, `%%`, `<!--`): fixed.
And where the apps agreed among themselves against ourus, ourus followed (Backspace in an author's
empty pair, brackets in code, math and after a backslash: §8.4).

## 9. Open

- **Backspace25 under cut and paste** (§7.3), the one round trip this step made worse. Not a marks
  question (§7.2, step 4): the line is lost because paste and cut disagree about which side of a
  reinserted node a blank line goes. Leave it, or settle it in paste's gap handling with its own
  spec case.
- **CommonMark's `- [ ] `** (§7.3): which site raises the line under it as ours when it was the
  author's.
- **A fence's half** (Backtick24): Backspace in an empty fenced block's opening run takes the closing
  fence whoever typed it; a spec decision first: is an empty fenced block the author wrote typed
  text, or a block? And a closing fence of ours that typing breaks (`` ```x ``) keeps its marks, a
  closer's holding while it is there (§8.3); `validAuto` could ask whether it still closes.
- **`autoClose`'s rest**: quotes and emphasis (`'` `"` `*` `_`) and the doubles (`**` `~~` `==` `$`)
  left out, the Obsidian family the only apps closing the first; wrapping a selection in `$$`, `%%`
  or `<!--`; and what the apps do with those three typed, unprobed, so no driver's preset lists them.
- **Obsidian's lazy `$$`** (§8.4): after an item's paragraph a `$$` block continues the item there,
  at the top level it interrupts a paragraph. ourus reads both the top level's way.
- **Verbatim spans in other commands** (§8.4): the writer refuses an escape inside one centrally, but
  only Shift-Enter and plain paste have spec cases; a join, a paste or an indent that would need one
  there hasn't.
- **A blank line ourus raised isn't drawn** in the spec (§8.3): `⌄`, `␊̬` and others were tried and
  dropped; its mark is checked by the tests that read marks, not by the drawings.
- **A caret inside an escape.** `\┃#` is a place now, as in any text editor. Backspace there deletes
  the backslash and the line turns into a heading, as the host's editor shows it. A host that would
  rather skip over escapes can treat `\` + the next character as one; nothing in ourus needs it.
  Enter is the one command that reads past an escape of ours (§8.1): `\┃-` is at the text's start.
  Backspace and the others there don't yet; none has failed for it.
- **`escapeParagraph` still absorbs** for `OurusDoc.escapeParagraph` (paste-plain turning clipboard
  lines into Markdown). There every backslash comes from the clipboard and is the author's too, but
  absorbing and putting back changes nothing a reader sees; left as it was.
- **The SxS's noise**: SiYuan's kernel exit (its cause unknown, §8.5) and its Tab not taking at
  times; Roam's cells around the caret varying run to run. And two timing-ratio tests ("a long list
  or quote", "an auto mark on every blank line") that fail under a loaded full suite every few runs.
- **The heavy suite across a spec format change**: the last commit's harness reads the working
  tree's spec, so a format change (the YAML lists) breaks the round trips' comparison against the
  last commit's code; the differential, reading it with the working tree's reader, still runs.
- **Pre-existing**: single-letter parameters on a few top-level methods outside this change
  (`OurusDoc.textStart(i)`, `isBlankLine(i)`, `isEmptyLine(i)`, `isLazyLine(i)`,
  `OurusAtom.delimiterLine(k)`, `composeSets(a, b)` in `changes.ts`), and unused imports `tsc
  --noUnusedLocals` lists in `commands/` and `view/`.
