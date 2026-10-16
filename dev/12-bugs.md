# Bug-hunting session (2026-10-16)

A bug hunt in the spec and the code, as [`07-bugs.md`](07-bugs.md) did before the spec reviews, in two parts. First, 141
plausible editing sessions, written into a throwaway `spec/z.md`, each step's expectation drawn from
the rules before it was run; run on ourus, replayed in the other apps (SxS), and every buffer ourus
wrote read by outside parsers. Paste got the most sessions (about 60), at the user's request: it had
the most bugs last time, and it had the most again. The fixes were reviewed against the principles
of `11-spec.md`, a bug the user hit in the demo was fixed, and the differential was extended to
reach what it had missed. That surfaced a backlog older than the session: 9,252 runs failing to
encode. Second, the backlog, worked by root cause down to 122 runs, its cases reviewed against the
same principles in turn. Along the way, the open question Open1 was decided (`- # H` outdents to a
heading) and a new one, Open2, left for later; the SxS runner learned to install what it needs, and
the SxS report got ourus into its heatmap, on the examples run as written. Every bug fixed has a short case in its command's file;
`z.md` is gone.

| | before | after the sessions | after the backlog |
| --- | ---: | ---: | ---: |
| spec cases | 654 | 713 | 755 |
| `npm test`: pass | 792 | 850 | 893 |
| `npm test`: pending | 1 | 2 | 1 |
| `npm test`: fail | 0 | 0 | 0 |
| differential: runs | 579,514 | 914,563 | 926,744 |
| differential: runs failing to encode | not counted | 1,786 | 122 |

The differential's runs grew with its corpus (§8): blank lines, new shapes and clipboards, and every
buffer the spec draws, each new case adding its own. Its count of runs failing to encode is new:
9,252 when first counted, a ratchet (`test/differential.baseline.json`) that only lets it fall on
the same corpus. The counts in the table are each on the corpus of their time.

## Contents

1. [How it went](#1-how-it-went)
2. [Bugs fixed by the sessions](#2-bugs-fixed-by-the-sessions)
3. [The backlog](#3-the-backlog)
4. [The code changes](#4-the-code-changes)
5. [What changed in the spec](#5-what-changed-in-the-spec)
6. [Checks](#6-checks)
7. [The work against the principles](#7-the-work-against-the-principles)
8. [The differential, extended](#8-the-differential-extended)
9. [The SxS](#9-the-sxs)
10. [Still open](#10-still-open)
11. [Next steps](#11-next-steps)
12. [Insights](#12-insights)

## 1. How it went

- **The sessions**, in ten batches: Obsidian daily notes (tasks, callouts, embeds, frontmatter,
  footnotes, math and comment blocks); three of paste (chat answers, tables, lists copied from deep
  inside a list, `*`/`+` markers, tasks, CRLF and tab-indented clipboards, quotes, callouts, HTML,
  setext, frontmatter, Logseq exports with properties, selections, undo, both paste options);
  outlining (moves across parents, both outdents, empty items with children, duplicate and delete,
  `enterMidItem: child`, `backspaceAtTopItem: refuse`); code (fences in items and quotes, tildes,
  indented code, fences typed by hand); tables, setext headings, thematic breaks, reference
  definitions; quotes and callouts; files as they are (CRLF, tabs, `*` and `+`, hard breaks, lists
  numbered all `1.` or from 0, CJK, lazy lines); selections and undo.
- **First run**: 116 passing, 25 failing. Six were my drawing, each checked against the spec before
  redrawing: the empty line a plain-lines paste ends with (Paste10), the caret at the start of the
  rest after a split paste (Paste37), a paragraph with its list pasted at an item's end being an
  item (nodes go where Enter puts one), a quoted blank line before a list pasted after a quoted
  paragraph, Backspace after a quote taking the blank line first (rule 5), and a list numbered all
  `1.` renumbered by Enter, which every Obsidian variant does too (measured, then confirmed by the
  user). One was a coverage limit: a footnote definition is an atom, so Enter in one is the host's
  line break, a lazy line of its paragraph. The rest were about twenty bugs (§2). The outlining
  batch, 20 sessions, found none: the core held, as in `07-bugs.md`.
- **Outside readers** and **the SxS** (§6) checked what the fixes write and backed them with the
  apps; **the review against the principles** (§7) found ten more things that didn't hold; **the
  demo** found two paste bugs no session or generated document had (§2); **the differential**,
  extended to reach them, found runs the fixes made fail and the backlog (§8).
- **The backlog** (§3), in about forty rounds: dump the failing runs, cluster them by command, the
  caret line's shape and the failure, reduce the largest cluster to a buffer of a few lines, read
  what the encoder wrote, fix the cause, add a case, run the suite and the differential, lower the
  baseline. Causes were few and wide: the first six fixes took it from 9,252 to 1,704; later, a
  placeholder regex took 154 runs, an item's marker kept on a line its first block shares over 300,
  lazy lines leaving a container 90, duplicates spanning a heading 80. What is left is clusters of
  ten runs or fewer, spread over every command. Its 36 cases were then reviewed against the
  principles (§7), which found more to fix (§7), two of them in the README's guarantees.

## 2. Bugs fixed by the sessions

**Paste fell through to the host.** Where paste returned `notApplicable` on several lines, the host
pasted the clipboard raw: the first line glued to the text, the rest at column 0, outside the
node's nesting. Several lines are now never the host's, but where a selection's delete is
(below):

- **Over a selection** (select a word, paste): the selection goes first, as Backspace deletes it
  (ourus's join across nodes, a plain delete within one line of a node's text), and the paste goes
  in at the caret, as one edit (Paste48, Paste49, Paste50). A selection that starts in markup (a
  checkbox, a fence) or spans a line's whole text is the host's, as its delete is.
- **A line copied with its line break**, as code editors copy a line: two lines, the break
  Shift-Enter's, so `- below` after the caret stays text (Paste51).
- **On an empty item with children**: the paste fills it, the children staying under it (Paste52).
- **In a heading's title**: after the heading, as at its end (Paste54); a caret before the `#`s
  is still the host's. **In a callout's title or a table's row**: refused (Paste55, Paste56).
- **On a blank line** (the demo's bug): the paste acts on the node whose gap the line is, as
  [`gaps.md`](../spec/gaps.md) has every structural key do: where Enter at that node's end would
  put a new one, as new nodes, plain lines too (Paste65, Paste67). The host replaced the line with
  the clipboard at column 0, ending a list, or ran the lines into the paragraph above.

**Paste failed to encode or wrote the wrong form.**

- A **fenced block copied from inside an item**, from its fence on (the demo's second bug): its
  other lines kept the item's indentation, its closing fence with them, so the block never closed.
  Read with that indentation gone, where the closing fence shows the loss (Paste66); `- a` /
  `  - b` read that way would lose its nesting, so other clipboards read as they are.
- A heading with a paragraph and a list in its section, pasted into a list: in an item a paragraph
  owns no list, so the list follows it; in a tight list every blank line in the pasted items goes
  (Paste57).
- A note's frontmatter pasted mid-note (Obsidian): frontmatter only at a document's start, so the
  clipboard is read as text after a blank line (Paste58).
- A pasted setext heading left the caret on its underline (Paste53).
- An ordered item joined mid-text lost its number: kept as text (Paste63), escaped where it starts
  a line.
- `pastePlain` never escaped its first line at a line's start (Paste64), kept the space at a final
  line break before ` ---` or ` ``` c` (an underline, a fence; Paste68), and left `[a]: x` as a link
  reference definition (Paste69); a split before a continuation line indented four spaces wrote it
  as code (Paste70).
- Spacing: items pasted at a heading's end join the section's list as tight as it is, the heading's
  blank line above them (Paste59); pasted items in a loose list are set off from each other
  (Paste60); after a paragraph or a block written without a blank line below, the paste gets none
  (Paste61; under a heading it is set off, as true-outliner's #264 has it); a split leaves no
  trailing space (Paste62).

**A quote that is an item's first block** (`- > a`): Enter, Shift-Enter and plain paste wrote each
new line with the item's marker, a new item, and failed to encode; Backspace at its start failed
too. New lines take the containers' continuation (`  > `), and out of the quote the paragraph is the
item's text (Quote73, Quote74, Quote75, Quote76).

**Math, comment and indented-code lines** were the host's, whose newline at column 0 ended an item
or a quote and the block, whose Backspace deleted a space of the prefix, and whose Enter in a `$$`
unmade the block anywhere. They take fenced code's rules now, everywhere: a new line in the block's
containers, its own indentation carried over; lines joined, the prefix going with the break; text
against a `$$` or `%%` line, or a break in one, refused; pasted lines the block's (Fence42, Fence43,
Fence44, Fence45, Fence46, Fence47).

**Link reference definitions.** A split leaving `[Note]: this` (Enter, Shift-Enter, plain paste,
a split paste) failed to encode: the half that stays is escaped (Enter47, Enter48, ShiftEnter23,
Paste69). A join leaving `[a]:` + `b` failed too: escaped (Backspace38, Delete27). A join drops an
escape a split wrote once it has nothing to keep, as at the join's seam
([Enter43](../spec/enter.md#enter43)), and keeps it where the dropped space makes the text one
(Enter48).

**Tables**: Enter at a table's last row was the host's newline, and in GFM the text typed after it
another row; now a paragraph after the table, set off by a blank line, which Backspace takes back
(Enter49). Enter and Shift-Enter inside a row are refused (Enter50, ShiftEnter24).

**Setext titles** refused the join an ATX title takes: a paragraph below joins before the
underline, by Backspace or Delete, one of several lines as more title lines (Backspace36,
Backspace37, Delete26).

## 3. The backlog

On the seeded corpus, 9,252 runs failed to encode when first counted: deleteSubtree 3,897,
duplicateSubtree 1,937, outdent 1,565, Shift-Enter 422, Enter 340, indent 294, Cmd-Backspace 208,
moves 357, paste 129, Backspace and Delete 103. 122 remain; 14 of them came with the last cases,
whose buffers brought math blocks open on one line and closed by text (`x$$`) into the corpus. The
fixes, by cause:

**The first round** (9,252 to 1,704): deleteSubtree takes a quote it empties (DeleteSubtree7); two
indented code blocks that would be one refused with their reason (DuplicateSubtree4); a section's
nodes inside an item or a quote laid out at its column, not 0 (Paste71); `ownLists` reading list
ownership as the outline does, none inside items and quotes; an item's marker written on a line its
first block shares (`- > q`), and outdent out of such a quote making the paragraph the item's text
(Quote77); Shift-Enter at a continuation line's start escaping a definition (ShiftEnter25); a break
in a callout's `[!type]` refused outside the Obsidian flavor too (Quote79); an empty item right
under a paragraph's text set off (Outdent16); a paragraph indented into a quote taking its list
along (Quote78).

**Placeholders.**

- A line holding only markers, `>` after a list marker included (`- > ◌`), and a task's checkbox
  (`- [ ] ◌`), can hold a placeholder. Cmd-Backspace emptying such a line, and Enter at `- > ┃q`
  (which fell back to a blank line above), hold the empty line as everywhere (SoftBackspace7,
  SoftBackspace8, Quote80).
- Leaving one, a task's emptied first line keeps its checkbox (SoftBackspace8), and the caret keeps
  its place in the text: settling returns the span that differs as one change, so a caret moved onto
  the line below no longer lands at its end.
- A placeholder inside text a change replaces goes with it, instead of landing at the replacement's
  end.
- Where verification holds a placeholder at the caret, a caret on a line holding no text (in its
  markers) goes to the line's end, where typing goes. Several commands now leave `- ┃◌` where they
  left a blank line above an empty item, as Placeholder1 draws.
- An empty line inside a node's text away from the caret, or in two nodes (a duplicate), is refused
  with a reason, as an empty node away from the caret was; so is an empty paragraph with a list.

**An item whose first block shares its marker's line** (`- > q`, `- - a`).

- The encoder writes the item's marker on the first line written in it, wherever its first block now
  is, and takes it off the line that had it (Quote81, Quote82, MoveDown33); the block now first
  lands at the item's content column (Quote83); a rerendered line keeps the markers of the items it
  is the first line of (Quote85).
- deleteSubtree's caret skips such an item, which has no text to land in (Quote82); Delete on an
  empty quoted paragraph is encoded, quoted blank lines and the shared marker included (Quote88).
- Backspace at `- - ┃a`: the outer item has no text to join, so the inner marker goes and the text
  is the outer item's (Backspace41).
- A quote written `>` without its space (`>- a`) puts its content after `> ` on the lines below: the
  layout takes its content column as at least two past the `>`, and new items land at least at their
  container's column (Quote86).

**Blank lines and separation.**

- A blank line inside code that moves out of an item gives up the item's indentation; whitespace
  past the containers' columns, which is code, moves with it (Fence48).
- An item's first child under an empty item comes right after the marker's line: an item may start
  with one blank line, and with one it ends (Indent30).
- A paragraph that comes right under an item's text, which it would continue, is set apart by a
  blank line (MoveDown34, DeleteSubtree8); so is a list that can't interrupt a paragraph (ordered,
  from 2) now right under one (MoveUp36), and the rest of a setext title above another setext title
  (Enter52).
- Backspace or Delete on an empty item between an item and a paragraph, and a join leaving a `2.`
  list under text: where the removed lines let the text run together, the encoder writes the outline
  instead, setting it apart (Backspace39, Delete28, Backspace40).

**Lazy continuation lines.**

- A copy keeps its lazy lines lazy, written as the original's: quoted, `| a |` over `|---|` would be
  a table (DuplicateSubtree5).
- Leaving a container (outdent out of a quote, a move), a lazy line that in its new place would
  start a block is escaped: `- g` under an item, a table's `|---|`. Only where it could: four
  columns past the items it reaches, it starts nothing, and stays as written (Quote87). Verification
  compares text modulo such line-start escapes (§7).
- Enter and Shift-Enter at a lazy line of a callout's title (outside Obsidian) keep the new
  paragraph in the callout (Quote84).

**Commands.**

- Outdent of a top-level item whose text is a heading makes it the heading (Open1, decided by the
  user; Outdent17, Outdent17b, Outdent18); one whose text is code or math makes it that block, its
  children the items after it (Outdent19).
- Enter at a line break inside a multi-line setext title splits there, the break going with neither
  half (Enter51; `splitSetext` cuts as paragraphs do now, with `cutText`).
- The text before Enter's caret is escaped where, ended there, it would read as any block, not only
  a link reference definition: a lone `-` is an empty item (Enter53); joined back, any such escape
  the join leaves nothing to keep goes, not only a definition's.
- Cmd-Backspace on a fence (` ``` `, `$$`, `%%`) is refused: it is markup, and the host's delete
  unmade the block (SoftBackspace9).
- Plain paste at a line's start drops the first line's leading spaces, which made it code (Paste78).
- An item doesn't move into a paragraph's list in an item or a quote, where a paragraph owns none:
  it is refused, as items swap only with items (MoveDown36).
- An ordered item moved to the front of its list right under text takes the list's start, so it can
  interrupt the text, and renumbering counts the rest on (MoveDown35). Renumbering judges "all
  numbered alike" by the old markers too, and the encoder's identity maps an item's head before a
  marker it rewrote, so the item keeps its id.
- Duplicate of a run whose copies would land under another parent (nodes before a heading, which its
  section would take in) is refused: `deleteSubtree` couldn't take back such copies
  (DuplicateSubtree6).
- A paragraph's or an item's text written anew (a copy, a conversion) starts at its first character:
  four columns of indentation a paragraph may have after a link reference definition would make it
  code (DuplicateSubtree7).
- In an Obsidian note, a thematic break that a command puts first, where `---` with a `---` line
  below would open the frontmatter, is set off by a blank line above it (DeleteSubtree9).
- After a structural command (duplicate and delete too), a caret on a fence (` ``` `, `$$`, `%%`)
  goes into the code, where typing can't break it: the first code line with text from the opening
  fence, the last from the closing one, between a one-line block's delimiters (MoveDown34,
  MoveDown37, Outdent19, DuplicateSubtree8); after a code fence's run, its info string, it stays.

**How it was worked, to go on the same way.** `DIFF_DUMP=f.jsonl node test/differential.ts`, then
group the lines by command, the shape of the caret's line (blank, an item, `- > q`, indented code, a
quote, a fence, a paragraph) and the failure's detail with its quoted texts and node paths blanked:
the largest groups are the root causes, each one example away. To see what the encoder wrote for a
failing plan, print `applyChanges(doc.text, plan.changes)` where `verify` in `src/commands/plan.ts`
returns `encoding-failed` (temporarily). To play a buffer, `OutlineState.parse(text, { config,
placeholders })` with `readDrawing` and `play` from `test/drawing.ts` and `test/player.ts`, as
`test/spec-run.ts` does. After each fix: `npm test`, `npm run typecheck`, the differential (no count
up), `DIFF_UPDATE=1`, and a case in the command's file.

## 4. The code changes

**The sessions.**

- `src/commands/index.ts`: `pasteOverSelection`, the selection's delete composed with the paste, as
  one result.
- `src/commands/paste.ts`: a line with its break as two lines; empty items with children filled;
  headings' titles, callout titles and table rows; the blank line's gap owner; fragments re-read for
  frontmatter and for a fence copied from inside a container; a heading's section unowning its
  paragraph's list in an item; tight lists tight throughout, loose ones loose; the written-tight
  rule; `pastePlain` escaping its first line, dropping the spaces at a final break, escaping
  definitions, and its lines on payload lines; `pasteSplit` keeping ordered numbers, trimming at its
  seam, escaping definitions; the setext caret.
- `src/commands/context.ts`: `paragraphPrefix` (a new line's prefix, a marker on the first line as
  indentation), `referenceEscape` and `referenceFix` (definitions, for splits and joins), `gapOwner`
  exported.
- `src/commands/code.ts`: `isPayloadLine`, `payloadNewline`, `joinPayloadLines`; `codeEdit` takes
  its refusal's reason.
- `src/commands/enter.ts`: tables (`tableEnter`, Shift-Enter's refusal), payload lines, definitions
  in the paragraph and item splits and in the line break, `paragraphPrefix` for the split's prefix.
- `src/commands/join.ts`: `leaveQuote` for a quote opening an item; the setext join; `referenceFix`
  in `joined` and in the two joins written by hand; payload lines.
- `src/encoder/lines.ts`: an old item written with no lines of its own before keeps its marker.
- `src/encoder/seams.ts`: new items at the head of a section's list take the list's spacing, the
  heading's gap above them; moves keep their rules.
- `test/differential.ts`: §8.

**The backlog.**

- `src/outline/placeholders.ts`: place lines with `>` after list markers, and a task's checkbox.
- `src/outline/state.ts`: a placeholder inside replaced text goes; `isPlace` and `ownLines`.
- `src/commands/plan.ts`: verify's caret on a line holding no text goes to its end; refusals for
  empty lines away from the caret (`emptyAwayFromCaret`), two indented code blocks that would be one
  (`adjacentIndentedCode`), and a thematic break that would open an Obsidian note's frontmatter
  (`breakOpensFrontmatter`), each applied in `index.ts`.
- `src/commands/settle.ts`: a task's checkbox kept; the span that differs as one change.
- `src/commands/context.ts`: `ctx.encode` takes a comparison (`flat` re-derives sections);
  `isFenceLine`; `referenceEscape` escapes any block start, and `referenceFix` drops any such escape
  a join leaves nothing to keep; `outOfQuoteOpeningItem`.
- `src/commands/join.ts`: the encoder as a fallback where removed lines run text together
  (`orEncoded`); Delete on an empty quoted paragraph encoded; Cmd-Backspace refused on fences;
  Backspace at `- - ┃a`.
- `src/commands/enter.ts`: `splitSetext` on `cutText`; `runsInto` for setext titles; the new
  paragraph in a callout whose title is a paragraph.
- `src/commands/structure.ts`: outdent's conversions to a heading or a block; deleteSubtree's caret
  past textless items and a quote it empties; duplicate of headings compared flat; an item into a
  paragraph's list only in sections; a paragraph indented into a quote, its list following.
- `src/commands/paste.ts`: plain paste's first line trimmed at a line's start.
- `src/encoder/encoder.ts`: `moveSharedMarkers`; identity before a rewritten marker; the setext
  guard for an empty item right under text.
- `src/encoder/indent.ts`: blank code lines reindented.
- `src/encoder/seams.ts`: an empty item's first child adjacent; a paragraph under an item's text, a
  list that can't interrupt a paragraph, set apart.
- `src/encoder/layout.ts`: a section's nodes at their container's column (`containerColumn`,
  `oldContentColumn`); the first child of a shared-marker item at its content column; a quote's
  content column at least two past its `>`; new items at least at their container's column; an
  ordered item moved to the front under text taking the list's start.
- `src/encoder/lines.ts`: an item's marker on a line its first block shares; a copy's lazy lines;
  lazy lines leaving a container escaped; outer markers on rerendered item lines.
- `src/encoder/outline-plan.ts`: `ownLists` as the outline reads ownership; a copy's `lazy` lines,
  and its text from its first character (`textLines`, also for outdent's and indent's conversions);
  text compared modulo line-start escapes.
- `src/encoder/renumber.ts`: "all alike" judged on the old markers too.
- `test/differential.ts`: runs start settled (§8); `test/spec-run.ts`: one example played, shared by
  the spec's tests and the SxS heatmap.
- `sxs/`: §9.

## 5. What changed in the spec

| file | before | now |
| --- | ---: | ---: |
| [backspace.md](../spec/backspace.md) | 52 | 61 |
| [del.md](../spec/del.md) | 44 | 47 |
| [delete-subtree.md](../spec/delete-subtree.md) | 6 | 10 |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) | 3 | 8 |
| [enter.md](../spec/enter.md) | 52 | 59 |
| [fences.md](../spec/fences.md) | 44 | 51 |
| [indent.md](../spec/indent.md) | 29 | 30 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 32 | 37 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 35 | 38 |
| [outdent.md](../spec/outdent.md) | 24 | 29 |
| [paste.md](../spec/paste.md) | 48 | 80 |
| [quotes.md](../spec/quotes.md) | 74 | 90 |
| [shift-enter.md](../spec/shift-enter.md) | 23 | 26 |
| [z-open.md](../spec/z-open.md) | 0 | 1 |
| **all** | **654** | **755** |

The rules each fix implements are in its file's intro. No existing case's expectation changed; the
README's guarantees 4 and 5 gained what §7 found. Every new case is ranked (common to edge); none is
core. Open1, a question drawn in `z-open.md` and pending,
was decided and moved to `outdent.md` (Outdent17, Outdent18); `z-open.md` keeps the three choices
made without the user, and Open2 (§10).

## 6. Checks

- `npm test`: 893 passing, 1 pending (Typing4), 0 failing; `npm run typecheck` clean; the demo's
  smoke test 65 of 65, after a rebuild.
- **Outside readers** (on the sessions' fixes). Every buffer the sessions reached (879 texts,
  ourus's output and the drawn expectations), read by commonmark.js (the block skeleton of
  `test/parser/oracle.ts`) and by micromark with GFM (HTML): no disagreement but in a table the
  host's raw paste had broken, where ourus reads it as cmark-gfm does.
- **The differential** (§8), against the last commit: of the outcomes changed, the largest by far
  are fixes: pastes it left to the host or failed to encode now apply, Enter and Shift-Enter on
  payload lines and at tables' ends apply, the backlog's fixes apply. The new refusals (table rows,
  callout titles and types, `$$` splits, text against a `$$` line, indented code duplicated,
  Cmd-Backspace on a fence, empty lines away from the caret) and the snapshots that changed (kept
  numbers, spacing, escapes, placeholders where blank lines were, ids kept) were judged group by
  group. 114 runs fail to encode, at the baseline.
- **SxS.** Every app on `z.md`, then on the sessions' 44 new cases. Of those, Logseq agrees on 12,
  Tine 11, SiYuan and Roam 7, Dynalist 6, BlockNote 5, WorkFlowy 4, true-outliner 2, Outliner, bare
  Obsidian and Live Preview 1 each: fixes of what the text editors do, which is what ourus did
  before each. The apps' evidence the prose cites (unadapted only, §7): Logseq, Tine, SiYuan and
  BlockNote keep lines pasted over a selection in the block; true-outliner joins under a setext
  title; bare Obsidian does in each case what ourus did before. Every app ran the whole spec again
  at the end (Emacs for the first time here), the backlog's cases included: they are mostly fixes
  of shapes the apps break too (Logseq agrees on 6 of the 22 it ran, Dynalist 7 of 19, Tine 5 of
  16, the text editors 1 to 5 of about 28). Once more after the heatmap left adapted examples out
  (§9), in 661 s: every verdict the same but one, Roam's Scenario16 (adapted), where `undo undo` did
  nothing.

## 7. The work against the principles

The sessions' fixes, read afterwards against the brief (spec1's `11-spec.md` §14), the README's
guarantees and the conventions of [`11-spec.md`](13-spec.md) §2. What didn't hold, and was fixed:

- **Guarantee 1, `encoding-failed` is a bug**: the definition fix covered splits, not joins
  (Backspace38, Delete27).
- **Guarantee 3, the host's key only inside text**: a paste over a selection starting in a checkbox
  deleted part of it as ourus's own edit; such a selection is the host's again.
- **Guarantee 5, inverse pairs**: the escape a split wrote stayed after the join; it goes now, and
  stays only where Markdown forces it, which the case states (Enter48). Cases that implied an
  inverse play it: Enter47, Enter48, Enter49, Quote73, Quote74, Fence42.
- **One rule per situation; code is payload, fences are structure**: the math and comment rules
  applied only in containers, so a `$$` split at the top level unmade the block; and text joined a
  `$$` line, which a code fence refuses (Fence45, Fence47).
- **A join is refused only where Markdown can't write it**: several lines under a setext title,
  which holds them, were refused with an ATX title's reason (Backspace37).
- **A refusal draws its buffer** (ShiftEnter24, Fence45 drew only the result); **a case shows one
  behavior** (Fence44 had two, Fence46 is the second); **mirrors** (Delete27, Fence46).
- **Claims about other apps never rest on adapted runs alone**: the block apps named in Paste51,
  Paste52, Enter49 and Backspace36 agreed only on projections; dropped. **What bare Obsidian does on
  a common case** is said now in Paste49, Paste59, Paste66 and Paste67.
- **What users hit belongs in the generator's corpus** (`11-spec.md` §10): checked first with a
  script of my own, which the next change wouldn't run; the user pointed it out, and the
  differential has it now (§8).

What holds: no option added and no decision overturned; no existing case's expectation changed;
every fix's rule in its file's intro; no count of runs failing to encode up after a change. Not
followed: `z.md`'s expectations were drawn before probing, as mining does, against the brief's
"probe before drawing"; the cases moved into the spec were probed.

The backlog's cases, reviewed against the same principles afterwards. What didn't hold, and was
fixed:

- **A case shows one behavior**: Quote82 drew deleteSubtree and Delete on an empty paragraph; the
  second is Quote88. Outdent17 claimed what `outdent: logical` does without drawing it: Outdent17b.
- **Inverse pairs, drawn or stated**: Indent30, MoveDown35 and MoveUp36 play their inverse (the
  outline back; the blank line lost or kept, which the case says); Outdent17 and Outdent19 say why
  indent doesn't give the item back. Enter53's round trip left its escape after the join, against
  Enter43's rule: the join drops any line-start escape a split wrote that it leaves nothing to keep,
  not only a definition's (`referenceFix`), and the case plays it.
- **Cases referred to by full IDs**: SoftBackspace8 said "the same".
- **A file's structure**: Backspace39 to Backspace41 had landed after the Cmd-Backspace section, and
  SoftBackspace9 under Backspace40's heading; Fence48 after the math and comment section. Moved.
- **Guarantee 5, inverse pairs**: Enter at a line break inside a text, then Backspace, glues the
  line back on (Enter51 under a setext title, and an item's text before this work); a join puts text
  at the end of the text above, wherever it came from. Kept by design (the user doubted multi-line
  setext titles were worth bending the join for, and items had the same before), and written into
  the guarantee as its one exception; between paragraphs Backspace takes only the blank line, and
  the lines come back.
- **Guarantee 4, other nodes keep their parents**: an item whose text becomes a block of lines
  (Outdent19) releases its children, which a block can't hold. Named in the guarantee, as the
  section an unwrapped heading releases is. Blocks owning the list after them, as paragraphs do,
  would avoid the parent change, but every list after a code block would become its children, going
  with it when it is deleted, moved or copied; and no app has the case (the block outliners and
  Obsidian do nothing on Shift-Tab at the top level). Recommended against, and left open to revisit:
  Open2 in [`spec/z-open.md`](../spec/z-open.md).

**An outside review** (an LLM's, of the 95 cases this work added, against the same principles and the
decisions on record) found five more problems in the cases and two regressions in the code, each
reproduced, and fixed:

- **Fence48 tested two behaviors**: its blank line, and a top-level item outdented to a paragraph,
  which releases its code child. Redrawn with a nested item, which stays an item and keeps its code,
  the inverse played; the release is part of Open2 (below).
- **Quote78**: a paragraph indented into a quote leaves its list beside it there, where a paragraph
  owns none, and outdent doesn't take it back: the same ownership question as Open2, folded into it.
- **DuplicateSubtree6** returned copies under two parents, which `deleteSubtree` refused
  (`non-contiguous`), against the file's rule that delete takes a copy back: such a duplicate is
  refused now.
- **DeleteSubtree9** refused what is expressible: a blank line above the `---` keeps it a thematic
  break, not frontmatter. Written so now.
- **Outdent19 and MoveDown34** left the caret on an opening fence, where typing breaks it (guarantee
  6). The commands now put it in the code, and the spec's caret check counts a fence as markup after
  structural commands. Enter's, Backspace's and Delete's carets on fences, as `fences.md` draws them
  (Fence12, Fence30, Fence31), are left for a review of their own (§10).
- **Regressions**: the first-line trimming of copies (DuplicateSubtree7) also took the indentation
  that makes an item's text indented code (`-     code`); it trims a paragraph's text only now. And
  the re-reading of a fence copied from inside a list (Paste66) dedented a fenced block that closes
  as it is (` ``` ` / `  foo` / `  ``` `), its code losing its indentation; only a closing fence four
  columns in, which doesn't close the block, is read so now.

Its **follow-up** found four more, each reproduced and fixed: the caret moved off a fence could land
on a blank code line, where typing at its start ends the item, or after a one-line `$$x$$`'s closing
delimiter; now it goes to a code line with text, and into a one-line block between its delimiters
(MoveDown37). Duplicate and delete didn't go through the correction at all (DuplicateSubtree8). The
fence re-reading still dedented a math or comment block that closes as it is, four columns in
(Paste79): it checks the parser's `closed` now. And the blank line before a first thematic break
went in for `***` too, which opens no frontmatter (DeleteSubtree10). The spec's caret check called
the production helper, so it couldn't catch the helper's mistakes: it now also types at the caret
after each structural command and checks that the outline keeps its nodes, one node's text aside.
A second follow-up found the caret still unsafe around math and comment delimiters, the helper
reading closing lines by their start: an unclosed one-line `$$`, and a block closed by `x$$`. It
reads the parser's `closed` and the delimiter's actual place now (MoveUp37, MoveUp38), and the typing
check compares what each node's text is (an item's math block, a heading's level), not only atoms'.

Decisions:

- **Open1** (the user): outdent of `- # H` at the top level makes a heading, the rest of the list
  its section; refused where it would take in what follows the list, or end the section it is in.
- **Escapes added to lazy lines leaving a container** (mine; the user let it go ahead): the
  alternative was refusing those commands. Verification ignores a backslash at a line's start before
  ASCII punctuation (and after an ordered marker's digits), for every kind but atoms: such text
  renders the same, and the structure around it is compared anyway, so a missing or extra escape
  that changes what a line is still fails. One escape is conservative: `|---|` after table-like
  lines is escaped even where the parser wouldn't have read a table (it renders the same).
- **Refused rather than written**: an empty line in text away from the caret; Cmd-Backspace on a
  fence; an item swapping with a paragraph in an item or a quote.
- **Choices made without the user**, each the fallback the rules already had, in
  [`spec/z-open.md`](../spec/z-open.md) to confirm or change: lines pasted in a heading's title go
  after it, rather than refused; a line copied with its break is two lines (the one-line decision
  was about lines without one); a paste at a heading's text start goes after it.

## 8. The differential, extended

It had played no command on a blank line, its documents had none of the shapes the sessions found
broken, and its clipboards none of what users pasted; and it reported only what changed, so a
failure the old copy shared was invisible. Now (`test/differential.ts`):

- every command on blank lines too, empty or indented, as editors leave them;
- documents with a quote opening an item, math, fenced and indented code in items, and prose like
  `[a]: b c`;
- clipboards of a line with its line break, a fence copied from inside an item, a heading with text,
  a table, a task with a child;
- every buffer the spec draws, with its case's options and placeholders, and every clipboard a case
  pastes: a shape a case draws is played by every command from then on, so what users hit, once it
  is a case, stays in the corpus;
- runs from a spec buffer start where a host would: a placeholder off the caret's line is one a host
  has already settled, so the run starts from the settled document (`settled: true` in a dump);
  played unsettled, those were states no host reaches;
- a command that throws is an outcome, not a crash of the run (the last commit's paste threw on four
  of the spec's clipboards: `last` undefined when a paste made no nodes);
- the runs the new copy fails to encode, by command, with examples, whatever the old copy did, held
  to a baseline (`test/differential.baseline.json`, with a fingerprint of the corpus and of how runs
  start, `starts`): a run fails when any command's count rises on the same corpus; on another (a
  case added) the counts are shown, not held, and `DIFF_UPDATE=1` records them, as it does when they
  fall; `DIFF_DUMP=file` writes every failing run as a JSON line (command, text, selection, config,
  placeholders, paste, detail).

Its first runs found 188 runs, then 40 more on the spec's shapes, that the sessions' paste changes
made fail (Paste68, Paste69, Paste70, Paste73; code as an empty item's text; a selection over a
line's whole text inside a paragraph), all fixed but 30, since fixed or refused in the backlog's
work.

## 9. The SxS

- **System packages** (`sxs/lib/system.ts`, `ensureAptInstalled`): Chromium (unless `CHROMIUM` names
  another), openssl for the proxy's certificate, Xvfb, Electron's libraries for Obsidian (by their
  names across Debian releases, `t64` and not), Emacs and tmux are installed when missing, on Debian
  and its derivatives, as root or with passwordless `sudo`; elsewhere the run stops saying what to
  install. Emacs 30.2 is installed here now.
- **The heatmap** has ourus, its verdicts its own runs of the examples (`test/spec-run.ts`), sorted
  as the apps are. Its measure is how alike two apps did: compared step by step from the same start,
  the same result 1, the same but for the caret or spaces ½, else 0 (from different starts, by how
  each did against ourus). The old measure, "the same verdict", counted two apps disagreeing
  differently as alike, which put every pair of apps on a higher scale than ourus's row. An example
  either app ran adapted is left out: an adapted result measures the projection onto blocks
  (`11-spec.md`), not the app. A block app's cell with ourus now rests on its 136 to 147 original
  outlines, not its 433 to 526 examples, and every block app comes out nearer ourus (Logseq 58% to
  82%, Tine 58% to 79%, Dynalist 53% to 75%, Roam 55% to 72%, SiYuan 56% to 67%, WorkFlowy 50% to
  64%, BlockNote 44% to 53%); text apps, never adapted, are as they were.
- **SilverBullet's driver** timed out on every browser start: a run leaves its test pages in the
  browser's copy of the space, each sync pushes them and the proxy refuses, and SilverBullet 2.12
  then never completes a full sync. `open` now clears the demo's data from the browser after 20 s
  and syncs cold (its README has the story).
- **The overall table** (`sxs.md`): C, S, E for caret, spaces and error; a legend above the test
  cases; a rank column; short names for the Obsidian variants and Emacs (TO, outliner, lp, emacs);
  one or two empty rows between files so each file's header is a shaded row on GitHub. An app's
  summary rows (original and adapted) were a cell short when a "not run" column showed; fixed. A
  regenerated report no longer says it was, and the legend's `?` row shows only where a cell is `?`.

## 10. Still open

- **The backlog**, 122 runs: structured paste 24, outdent 18, indent 14, Backspace and Delete 25,
  duplicate 9, plain paste 9, the rest under 10 each, in clusters of ten or fewer: tables continuing
  a quote lazily under indent, a selection from an empty item over a blank line under outdent, a
  partial tab before code under outdent, frontmatter-like clipboards pasted at a heading, callouts
  with lazy lines under Backspace. Each is a refusal with `encoding-failed`: the text is never
  touched.
- **What the host does where ourus steps aside** isn't checked. A trial (not kept) played the host's
  default for every `notApplicable` run and compared the outline: 89,880 runs changed it, most of
  them edits in markup (indentation, markers) that `editInMarkup` leaves to the host by design, but
  the fence that Cmd-Backspace let the host delete (SoftBackspace9) was one of them, found by
  accident.
- **A paste on a blank line** keeps the gap's blank lines and adds its own separation: more blank
  lines than the text needs (Paste65), and a heading pasted into a quote writes a quoted blank line
  twice.
- **Selection deletes** whose ends aren't both in text are still the host's (`11-spec.md` §8), and
  so a paste over one; so is one over a line's whole text inside a paragraph.
- An ordered list pasted mid-paragraph, from 2 once its first item joins, goes after the paragraph.
- In indented code, Backspace in the code's own indentation is the host's, a space at a time.
- Footnote definitions are atoms: Enter in one is the host's (a lazy line, harmless).
- Enter in an item whose text is a heading (`- # a┃`) is the host's (a line break): no case draws
  it.
- Indent of a top-level code block with nothing above is refused, where a paragraph becomes an item
  in place (Indent22): outdent of a code item (Outdent19) has no inverse there.
- An outdented item whose code is indented with a partial tab writes the code's indentation as
  spaces, which verification reads as other text: atoms compare their lines as written.
- **Carets on fences after Enter, Backspace and Delete**: several cases of `fences.md` (Fence12,
  Fence30, Fence31) leave the caret before a fence, where typing breaks it; the caret check holds
  only the structural commands to fences so far.
- **Open2**, in [`spec/z-open.md`](../spec/z-open.md): whether a block of lines owns the list after
  it, as a paragraph does, and, wider, what follows a node that lands where it can't hold its
  children (Quote78, a top-level item with code outdented): today they follow as siblings, guarantee
  4 naming only Outdent19's case. The user wants to revisit it.

## 11. Next steps

1. **The host's edits where ourus steps aside**: in the differential, play the host's default for
   every `notApplicable` run (as `test/player.ts` does) and count the runs where the outline changes
   beyond the edited node's text, edits in markup apart; held to a baseline like the encoding
   failures. A likelier source of real bugs than the backlog's tail.
2. **The rest of the backlog**, by cluster, as §3 describes.
3. **Selection deletes over every shape** (`11-spec.md`'s step 2): the last host fallbacks of paste
   over a selection go with it.
4. **Structure `paste.ts` as its rules**: it grew by special cases (most of the 652 lines the
   sessions changed); a dispatcher of named rules in `paste.md`'s order would make its fallbacks
   visible.
5. Then `11-spec.md`'s list: the guard for `editInMarkup: refuse`, guarantees as properties over
   generated documents (inverses and the caret), `indentUnit` and presets.

## 12. Insights

- **The host's fallback is where paste broke.** Nearly every paste bug was a `notApplicable` on
  several lines: the rule that came out of it, several lines never the host's, is what guarantee 3
  already said, applied to code paths no case drew. The same held at the end: the fence
  Cmd-Backspace left to the host. What ourus hands back is the next place to look (§11).
- **Containers break what works at the top level.** Math, comments, indented code, a quote opening
  an item, a list on an item's marker line: each worked without a prefix and broke with one.
  Sessions written as users write found them; the differential's documents had none of these shapes.
- **A report of differences hides what both sides share.** The differential compared copies, so a
  failure present in both was invisible: counting failures outright showed 9,252 of them.
- **Root causes are few and wide.** A dozen fixes took the backlog from 9,252 to under 1,000: an
  empty quote left behind, a column taken from the wrong ancestor, a verifier disagreeing with the
  parser, an item's marker on a shared line, a regex for placeholder lines. Clustering failures by
  command, shape and failure found each in a probe or two; reading them one by one would not have.
- **A ratchet needs its corpus pinned, and how runs start with it.** Seeding the corpus from the
  spec means every new case moves the counts; tied to a fingerprint of the corpus and of how runs
  start from it, the baseline holds the code, not the spec or the harness, to them.
- **Unreachable states inflate a backlog.** Runs from a spec buffer with a placeholder away from the
  caret were states no host reaches; starting them where a host would took dozens of failures that
  were never bugs.
- **The differential finds what fixes break.** Every round of fixes broke something no case drew,
  found by the next run: a selection reaching a line's start, the seam rule moving moves' blank
  lines, 188 pastes in the extended corpus.
- **A review against the written principles finds what testing doesn't.** Each breach of §7 passed
  the suite, the differential and the SxS: inverses and mirrors not drawn, a rule applied in one
  place only, claims resting on weaker evidence than they read as.
- **The SxS answers questions before they reach the user.** The all-`1.` list looked like a
  decision; every Obsidian variant renumbers, and data settled it. And a measure has to suit every
  row it is shown for: "the same verdict" put ourus out of place until the heatmap compared results,
  and adapted examples put every block app farther from ourus than it is.
- **Users still hit what generators don't.** A code block pasted on a blank line, in a list, broke
  in the demo after 141 sessions, the spec and the differential had passed: a blank line was a place
  no tool put the caret. The fix for that class is the corpus, not one more case.
