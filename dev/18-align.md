# The block apps' disagreements (2026-10-25)

One session: a full SxS rerun on 17-refactor, then a dive into the block apps' disagreements, each
sorted into what it is: the app's own behavior, the harness (projection, judgment, a driver), ourus,
or a behavior ourus doesn't model yet. Then fixes, the user's decisions on new options, and the
cause of the runs that crashed or hung (the container's cap on tasks). Later passes: drivers reading
what the apps hold (formatting, fences), a camp probed beyond its one case before it became an option
(§3.6), a spec tag for what some apps can't do (§2.7), WorkFlowy played as a free-form editor,
then not (§2.8), the document editors' own values and a numbering fix (§3.7–3.9), and a review of
what the harness skips (§2.9), 56 `free-form` tags among it. Committed as `18-align` and `18-more`;
the `free-form` audit and its runs after.

Notation: `┃` caret, `«»` selection, `⏎` line break, `␠` a line's trailing space. The block apps:
Logseq (OG, LO), Logseq DB (LD), Tine (TI), Roam (RR), Athens (AR), Dynalist (DL), WorkFlowy (WF),
Tana (TA), RemNote with bullets (RB) and without (RN), SiYuan (SY), BlockNote (BN). "Disagree%" is
disagreements over the cases an app runs (agree, caret, whitespace, disagree, error).

| | start (17-refactor) | end |
| --- | ---: | ---: |
| block apps' disagreements | 1437 of 5710, 25.2% | 1083 of 6137, 17.6% |
| `npm test` | 1281 pass | 1309 pass, 0 fail |
| spec cases | 1019 | 1045 (seven of them in the new `quirks.md`) |
| config options | | `backspaceAtItemStart`, `pasteOverSelection`; values `enterOnEmptyItem: unwrap`, `taskEditing: unwrap`; the quirks `quirkEnterMidHeading`, `quirkPasteCaret`, `quirkPasteText` |
| spec tags | | `enter-in-fence` |
| the pool of browsers | 6 × 3 windows, the cap hit 686 times | 4 × 5, 1,774 tasks at most; hit once (28 refusals, §4) |

## 1. How

- **The data**: each app's `sxs.json` has every step's buffers, ourus's and the app's. Scratch scripts
  grouped the non-agreeing cells by case, and found **camps**: three app families or more (Logseq's
  two and RemNote's two setups counted once) reaching the same state, other than ourus's. A camp is
  a modeling question or a harness one; one app alone, mostly its own behavior.
- **Measuring a harness change in seconds**: `OURUS_SXS_DIR` points a run at a copy of `.sxs/`, so
  `--rejudge` in a copy of the tree (code changed there) judges the stored runs again without
  touching the real results; a cell-by-cell diff of the two judgments shows what moved. A change
  that alters an app's start can't be measured so: its cases are "not run" until a real run.
- **Where they were**: 40% of the cells in the paste files (paste-html 152, paste-list 135, paste 126,
  paste-plain 96, ...), then enter, backspace, obsidian-true-outliner. Paste is mostly each app's
  importer (§5); the camps were elsewhere.
- **Probing a camp**: one case is no rule. `sxs/probe.ts block probes.md` plays a file of made-up
  cases in every block app (each app started once, nothing kept in the results): §3.6 is 15 probes
  around one case. And where a driver's reading or an app's behavior is in doubt, a check outside
  the harness (a headless Chromium of the session's own, keys only) or a dump of what the app holds
  (a driver's read printing it, for one run) before changing either.
- **Noise**: Athens's Enter65 and Enter65b disagreed under a full run's load and agreed 3 of 3 alone.

## 2. The harness

### 2.1 An adapted start judged as the app has it (`plan.ts`, note `as blocks`)

A case whose start the projection adapted (`Notes┃⏎⏎more`, two paragraphs, is `- Notes┃⏎- more` to a
block app) was judged against ourus's result on the original document, projected. But the app played
on the items: on them ourus does exactly what LD, LO, TI and TA did in Paste3 (`- Notes⏎- x⏎- y⏎-
more`), where the projected paragraph result nests the list under `Notes`. Now the app is judged
against ourus replayed on the start drawn as items, under the app's values, where that drawing is
faithful: it projects back to the same blocks, the same headings owning sections. Not where items
can't say the start (a heading's section, a thematic break `- ---`, a definition `- [a]: /u`, a
table), nor on an empty document (an app's empty page is one; its empty block is no item). Replayed
everywhere, it made 134 cells worse; with the check, +84 better, 13 worse, of which 7 were the Delete
bug of §3.1.

### 2.2 Paragraphs in a block (`paragraphsInBlock`)

Logseq, Tine, Roam, Athens, Dynalist, RemNote and BlockNote hold `foo⏎⏎bar` in one block (Shift-Enter
twice): the same Markdown as ourus's item with two paragraphs, `- foo⏎⏎  bar`, which the projection
made a block with a child (TO-S11 disagreed in all 12 apps). A driver now declares
`paragraphsInBlock`: an item's paragraphs right after its text are its block's text after their blank
lines, what they own a level up (15-spec §11.3's open item). For BlockNote, which also holds a
separate paragraph block under an item (§3.3's `unwrap` makes one), rejudged both ways: keeping it
agrees on 2 cells more.

### 2.3 Free-form blocks

- An **empty free block** is an empty paragraph, which Markdown has only as blank lines: the
  whitespace verdict leaves it out, what it owns coming up a level with it (Placeholder2,
  Placeholder3, Enter40, Backspace17, ...: 40 cells of RN, SY, BN from disagree to whitespace).
- **`ownBlocks`** (BlockNote's and SiYuan's flat blocks nested as ourus's outline is) made a list
  after a paragraph inside an item that paragraph's; ourus's outline makes it the paragraph's
  sibling there (a paragraph owns the list after it at the top level and in a heading's section).

### 2.4 A later line's spaces

The projection kept a block's later lines without their leading spaces, which ourus's text and the
apps hold (§3.2): now from the line's content column. SiYuan trims them, so its driver declines such
a start (`line's leading whitespace`).

### 2.5 Text below a marker

An item's text below its marker (`-⏎  text`, a Shift-Enter at its start) projected as a block's text
without its first, empty line; the apps hold that line (`⏎text`). Now the block's text starts with a
line break there (ShiftEnter13, Enter65k: 5 whitespace verdicts to agree; the starts of ShiftEnter13,
ShiftEnter13b and ShiftEnter33 changed, run again).

### 2.6 Drivers

What a driver reads:

- **Fences read back**: Logseq DB and BlockNote wrote a code block's fence as three backticks
  whatever the code, which a line of ```` ``` ```` in it ends; now longer than any run of backticks
  starting a line (Fence62, Regression6). Logseq OG, Dynalist and Athens hold the fence as text and
  keep it short: their bug (the code ends there on reload).
- **SiYuan's fences**: SiYuan puts a zero-width joiner before three backticks in code so they close
  nothing; the driver took it out and kept SiYuan's three-backtick fence, which that line then
  closed. A code block's fences now read longer than any line of backticks in it, as Markdown needs
  (Backtick10, Fence36, Fence37, Fence39, PastePlain29: 5 to agree).
- **Italic read as Markdown's**: Roam and Dynalist spell italic `__i__`, which Markdown reads as
  strong; their reads now give `*i*` (`italicsAsMarkdown` in block.ts, the caret moved with it). And
  `sameText` takes Tine's `_i_` and `~s~` (and anyone's) as `*i*` and `~~s~~`, the rendering deciding.
  6 disagreements to agree (PasteHtml14, PasteHtml17, PasteConvUS in Roam, Dynalist, Tine, SiYuan).
- **Formatting read as Markdown** (`runsAsMarkdown` in block.ts): BlockNote's, RemNote's and
  WorkFlowy's drivers read a block's text without its inline formatting, so a bold `y` the app
  pasted read as `y` against ourus's `**y**`. Each app keeps it (dumped from PasteHtml14: BlockNote's
  `styles` and link nodes, RemNote's rich text `b`, `l`, `q`, `str`, `iUrl`, WorkFlowy's name HTML
  `<b>`, `<i>`, `<code>`, `<s>`, `<a href>`); the drivers now read runs of text with their formatting,
  as Markdown, the caret mapped into it (between runs, outside the markup). Plain text stays as it
  is, unescaped, as before. 17 disagreements to agree (WorkFlowy 5, RemNote 3 and 3, BlockNote 6).

What a driver skips:

- **Dynalist refuses `markup-fence` again** (played since 2026-10-18; its fences are text, as
  Logseq's, Tine's, Athens's and Roam's, which refuse it): 33 disagreements and 20 agreements no longer
  played.
- **WorkFlowy and Tana map no `shiftEnter`** (decided): WorkFlowy's Shift+Enter opens the item's
  note, Tana's inserts a node; a name holds no line break. Their cases skip (about 30 and 35
  disagreements that measured only that).
- **No caret to compare after a deleted block selection** (`Driver.noCaretAfter`, the user's call):
  Logseq (when the first block goes), Athens, Tine, WorkFlowy and RemNote edit no block after
  `deleteSubtree`, so the caret verdict compared ourus's caret with none. Checked outside the harness
  in Logseq and Athens (keys only: focus on the page's body, nothing selected, a typed `x` going
  nowhere). Where a step ends with a declared action and the app has neither a caret nor selected
  blocks, the outline alone is judged: 36 caret verdicts became agreements. Only for that action: a
  caret lost after another key may be the app's bug. Where the action has more after it that needs a
  caret (typing; not undo or redo), the run reads the app right after it and, the app left with no
  focus, skips the example there ("no text focus after deleteSubtree", kept by a rejudge in the file
  run's `skippedPlaying`); an app that kept a caret plays on. Only DeleteSubtree6 (deleted, then `x`
  typed) skips so, in all seven setups that declare it.
- **`enter-in-fence`** refused by Athens, Dynalist and Roam (§2.7): 11 disagreements no longer
  played, no agreement lost.
- **Not refused**: code blocks as a whole in Athens and Dynalist (proposed, then dropped): both hold
  and show multi-line code blocks (checked by hand in Athens: a `<pre><code>`, edited in the block's
  textarea, fences and all); what they lack is a code editor, which the tag covers for Enter. Their
  other code cells are their own and stay measured: a paste of code line by line, fences as text
  lines; a paste into code dropping blocks there; the short fence above.

What a driver declares (each noted in its README):

- SiYuan `backspaceAtItemStart: body`, BlockNote `unwrap`, Logseq (both) and Tine `logseq` (§3.3).
- Roam, WorkFlowy and Dynalist `quirkEnterMidHeading: workflowy` (§3.4).
- Roam `quirkPasteCaret: roam`, Athens `athens`, RemNote (both) `roam` (§3.5: 9 caret verdicts, none
  worse; SiYuan would have lost 30 agreements, and doesn't).
- Roam `noCaretAfter` too (DeleteSubtree6: the page's every block deleted, nothing edited; with a
  block above, Roam's caret is at its end).
- Logseq (both) and Tine `closeBackticks: all`, as `backtick.md › Backtick18` already said: a
  backtick in text is typed as a pair. Backtick18 to agree in all three, and Backtick19, 21 (and 32
  in Tine) played and agreeing; Logseq types a second pair in Backtick32 rather than step over.
- Logseq (both), Tine, Tana, Roam and Athens `pasteOverSelection: ignore` (§3.6).

### 2.7 The spec: `␠`, and the `enter-in-fence` tag

`␠` draws a line's trailing spaces and nothing else: `readSpec` refuses one anywhere else, in a buffer
or a clipboard (the user's call, after drawings with every space as `␠` were unreadable).

`enter-in-fence` (the user's call), a tag as `markup-fence` is: Enter on a fenced block's content line,
code or math, not a fence's line (Fence1, 2, 3, 4, 5, 10, 39, 42). An app whose code and math are a
block's text, with no editor of their own, splits the block there as on any text, Shift+Enter making
the code's new line: Athens and Dynalist (code and math), Roam (math; its code blocks refused
already), whose drivers refuse the tag. BlockNote's code editor agrees with ourus (its math is text:
Fence42 stays measured there), and Tana's exit from a code block at its end is its design; neither
refuses it. Tags are kept by hand, so `spec.test.ts` computes this one by playing every case and
fails where a case lacks it or has it wrongly. `spec/README.md` says what it means.

A step's buffer may draw no caret (the user's call, §2.9): the caret isn't checked there, only what
the text becomes. A start always draws it, which the reader requires. The core runner, `redraw.ts`,
`probe.ts` and the SxS plan (`caretAsDrawn`: the step's buffer, drawn or replayed, without its caret)
all compare such a step without one (`drawsCaret`, `withoutCaret` in `test/drawing.ts`).

### 2.8 WorkFlowy: an outliner whose items can be styled, not a free-form editor (tried, reverted)

WorkFlowy has a paragraph type (`layoutMode: p`, Alt+Ctrl+4: no bullet), and its Markdown export
writes a paragraph without one: why not play it as a free-form editor (`freeForm`), as RemNote
without bullets, SiYuan and BlockNote are? Its exporter (`ib1` in `wf-base.js`) writes a top-level
item of type `p`, `h1`–`h3`, code or quote as that block, without a bullet, its children after it at
the same level (a heading's section, a paragraph's list), and anything under an item as an item.

Played so (paragraphs loaded as `p` items, their owned list and a heading's section as children,
read back as the export writes them: `liftOwned`, then `ownBlocks`), WorkFlowy agreed on 34% of the
`free-form` cases (RemNote without bullets 60%, SiYuan and BlockNote 51%) and went from 110
disagreements of 463 to 186 of 543, 21 agreements lost. Played by hand (a headless Chromium of the
session's own, the raw tree after each key), and seen by the user in its UI: a type is a style on a
node of the tree. A paragraph can have children, shown nested, or be followed by items as its
siblings, shown beside it; both export as `para⏎⏎- item`, so one Markdown text is two WorkFlowy
states, which behave apart. And the keys act on the tree and the types: an indented paragraph stays a
paragraph, only items of one type join (a bullet doesn't join a paragraph), Shift+Tab on a top-level
item does nothing, Enter makes an item of the same type where the tree puts it, a moved paragraph
takes its children. The free-form editors hold Markdown's shape, one state for one text (RemNote's
paragraph is a top-level rem without children; SiYuan's and BlockNote's a block in a flat sequence),
and their keys follow a document's rules. The `free-form` cases measure those rules, which WorkFlowy
doesn't have; loading it flat, as RemNote is, would change its shape, not its keys. So WorkFlowy is
played as an outliner again (the user's call), every item an item; `sxs/workflowy/README.md` says
why.

Kept: WorkFlowy's own Markdown beside a read (`OURUS_SXS_WF_EXPORT=1`, the user's idea): each read is
checked against `WF.Export.as(output, 'markdown', items, true)`, as its share dialog calls it,
projected as a spec buffer, and where they differ both are logged. A lone exported item is written as
a title, without a bullet, which the first run of the check took for hundreds of differences: it
exports the test's item and drops its name. The item being edited is saved first
(`WF.Editor.saveFocused`, what WorkFlowy's own timer does half a second after typing stops; the
runner waits that out before a case's next step undoes anyway): without it, 42 differences were the
export having the edited item's text as it was. Two full runs with it on the outliner mapping found
no error of the read, their verdicts the earlier run's, cell for cell (110 of 463). Its 136
differences are the export's Markdown: an empty item after a line a setext underline, a numbered
item's children and a name's leading spaces short of the content column, a code block's later lines
out of its item and its fence always three backticks, names unescaped (`- def`, `2. y`), a stale
`numbered_start` after a move; and, items read as items, a top-level heading or `p` item written
without a bullet. Sorting them was a few minutes' work; a driver error would have stood out.

### 2.9 What the harness skips

The block apps each skip 456 to 646 of 1,045 cases. Reviewed reason by reason (counts over the twelve
setups): most is by design, the `free-form` tag on outliners (1,548), the `markup-` tags the drivers
refuse (1,350), a callout (269, Obsidian's), options an app has no value of, states a block can't hold
(a caret in a marker or on a blank line, indented code: 357), and keys an app lacks (Athens moves no
block but by dragging; SiYuan and BlockNote delete one with the mouse; nine setups duplicate none).
Where it was the harness's:

- **`cursorCharLeft after cursorDocEnd`** (7 or 8 an app): ourus's document end is past the last
  line ending, where no block is, so what follows `cursorDocEnd` is skipped. Six Placeholder cases and
  Undo2 used `cursorDocEnd cursorCharLeft` only to have the caret leave the node, its place after it
  drawn for want of another way. A first fix played the pair as `cursorDocEnd` in a block app where
  ourus's caret ended at the last block's end; the user's: a step's buffer may draw no caret, the
  caret unchecked (§2.7), so those steps are a plain `cursorDocEnd`, and the adaptation went.
  CursorDocEndLeft1, which tests the motion, stays skipped. The twelve setups played them: of 72
  cells, 35 agree, 34 whitespace (the blank lines blocks can't show), 3 disagree (Placeholder18:
  RemNote, SiYuan and BlockNote keep `# b` text as typed where ourus escapes it).
- **`quote`** (98 an outliner; RemNote, SiYuan and BlockNote too): the projection throws for any
  quote, though 37 cases are a one-paragraph quote (`> q`, alone or an item's text), untagged
  `quote-container` so that block apps play them, and most apps hold one (Logseq, Tine, Roam,
  Athens and Dynalist as a block's text; WorkFlowy, SiYuan and BlockNote as a quote block). Open:
  the projection would read such a quote as a block `> q`, as a heading is `# h`, and each driver
  load and read it.
- **`selection across blocks`** (about 20 an app): right for outliners, whose selection across blocks
  is of blocks; SiYuan and BlockNote select text across blocks, but the outline's caret is in one
  block. Open, a model change.
- **`markup: decorated`**, declared for the apps that show no markup (SiYuan, BlockNote, RemNote,
  WorkFlowy, Tana), measured on a copy: 4 more Tana cases played, 3 WorkFlowy cells worse (Enter65l,
  Enter65m, Enter60b: ourus's Backspace there drops the heading, WorkFlowy keeps it). Not declared.
- **`free-form`** (172 cases, skipped by the nine outliners): tagged where a case was suspected not to
  play in an outliner, directly or through the projection's adaptation, but not checked. Probed with
  the tag taken out (`sxs/probe.ts outliners --json`, a probe file of the 172; eight outliners,
  RemNote with bullets hanging at 50 cases): 54 skip in all eight for other reasons anyway (a quote,
  a caret in a marker, a missing key, nothing blocks show), the tag changing nothing; 56 mostly
  disagree, the free-form semantics themselves (an empty last item leaving its list as a paragraph,
  Enter14, Enter40; a heading's level changing on indent, Indent12, 16, 23, 25; a paragraph's list
  in a move); 4 mixed. And 56 play faithfully and mostly agree: 5 with nothing free-form adapted
  (ShiftEnter10, 11, 13, 15 agreeing in all six apps with Shift+Enter), 8 with only blank lines or a
  heading as a block, 43 with paragraphs as blocks (`as blocks`: judged against ourus on the items,
  ourus's item behavior rather than the free-form one the case is about, which plays nonetheless).
  Those 56 untagged (the user's call); `spec/README.md`'s definition now ends: only where the
  projection can't play it either. Played in the full rerun after, the nine outliners' new cells:
  346 agree, 20 caret, 24 whitespace, 22 disagree, each an app's own (WorkFlowy and Tana join no
  first child into its parent, Backspace12d, 19, 20, Delete18b; RemNote's and Dynalist's paste, and
  WorkFlowy's plain paste, PastePlain3, 12, 24, 26; Roam's Backspace on the page's first block,
  Backspace43, 43b; RemNote and Dynalist moving an item out of a paragraph's list, MoveUp7, 21, 23).
  Logseq DB erred on Outdent17 and Outdent18 (`┃# H`: a caret before a heading's `#`s, which are
  its block's property there): its `holds` declines a caret inside a number, a checkbox or a
  heading's `#`s now, those two cases only. The outliners' cells went from 5,725 to 6,137, their
  disagreements from 18.6% to 17.6%.

## 3. ourus

### 3.1 Delete before an empty item with children (a refactor regression)

`- a┃⏎-⏎  - b`, Delete: before 17-refactor the empty item went, `b` becoming `a`'s child; after it,
`delete.ts` returned null (the host's: `- a┃-`). Seven apps do the former. Now it joins as Backspace
at the empty item's start does (`joinUp`); Delete33b. The prose (rule 4) already said so; no case
pinned it.

### 3.2 Shift-Enter moves no space (decided: the apps' consensus)

`- one two┃ three`: ourus put the spaces on either side of the break at the new line's start, the
caret after them (`- one two⏎   ┃three`), so as to leave no trailing space a second one could make a
hard break of. Every app with line breaks in a block (Logseq, Tine, Roam, Athens, Dynalist, RemNote,
SiYuan, BlockNote, bare Obsidian, Live Preview, Outliner) breaks at the caret and moves nothing:
`- one two⏎  ┃ three`, `- abc ┃- def` → `- abc␠⏎  ┃\- def` (true-outliner and Emacs drop the new
line's leading space; SiYuan trims a block's trailing one). Now so. With it:

- a later line's leading spaces are its text (`OurusDoc.textStart` no longer skips them), the caret
  before them no markup;
- Backspace at a later line's start joins with the caret where it was (`offset - 1`), so Shift-Enter
  then Backspace gives back what was there: 140 inverse round trips more come back, none fewer;
- plain paste's line break follows Shift-Enter (PastePlain13);
- 19 cases redrawn, shift-enter.md rule 5 rewritten.

148 whitespace verdicts became agreements (none were disagreements).

### 3.3 `backspaceAtItemStart: join | body | unwrap | logseq` (decided)

The document editors take an item's marker first on Backspace at its text start: SiYuan in 36 of 44
such steps, BlockNote in 43 of 47; no outliner does. `body` (SiYuan, Typora): the item is a
paragraph at the end of the item above in its list, after that item's children, its own with it;
`unwrap` (BlockNote): a paragraph where it is, the list split there, the items after it its list, as
`backspaceAtTopItem: unwrap` makes the first item. `join`, the default, joins. After a checkbox or a
heading's `#`s go (rule 2), as before; a first child is a paragraph in place; under an item with no
text, or after an empty one, it joins (no paragraph can follow nothing there); the spaces Markdown hid
after the marker are the paragraph's text. Backspace50, Backspace50b; `unwrapItem` in `backspace.ts`.
What the apps do beyond it: SiYuan outdents a lone first child (Backspace3) and puts an item after an
empty one into its body (Backspace5).

`logseq` (Logseq and Tine, numbering a block's property there): a numbered item's number goes
first, an empty one's too, the item a bulleted one where it is, its list split there; a bulleted item
joins (Quirk3). The new item takes a bullet no item beside it has (`-`, else `*`, `+`), or it
would run into that item's list (the differential's two write failures before). ourus keeps the later
items' numbers, as a split list's lower part does (`3. c`); Logseq numbers them from 1 again, so
Backspace29 and TO-Bug269 still differ in that.

### 3.4 Enter in a heading item; `quirkEnterMidHeading: default | workflowy` (decided)

Enter in an item whose text is an ATX heading (`- # He┃ad`) was `notApplicable`, a bare line break of
the host's (enter.ts took only items whose text is a paragraph). Now it splits as an item: the heading
stays with the first half, the rest a plain item placed as `enterMidItem` says, as Logseq, Tine,
Athens and RemNote do; at the title's end an empty item after, at its start one above (Enter69,
Enter69d). `quirkEnterMidHeading: workflowy` gives the text before the caret to a paragraph (an
item) above, the heading keeping the rest and its section (its children), as Roam, WorkFlowy and
Dynalist do: they make the new block above, the original keeping its attributes (Quirk1, Quirk1b). A
setext title too (Quirk1c: Roam's TO-E17 and Enter52 were setext titles, judged under the default
split), the text before the caret set apart by a blank line; the underline stays with the heading.
Only the Enter key's (`enterCommand`'s `key`): plain paste's line breaks and Shift-Enter in an ATX
title split as before, which Dynalist's paste does too (PastePlain23, Regression15 had followed the
quirk). A case that names no value is judged under an app's declared one, not skipped (15-spec
§8.1), so Enter69 runs in every app and Quirk1 only where `workflowy` is declared.

### 3.5 The quirks: `quirkPasteCaret: default | roam | athens` (decided)

Options that model one app's mechanics rather than a rule are named `quirk…`, their values `default`
and the apps' (the user's convention; `config.ts`'s header says so). A value that is one app's in a
principled option is named after it, its doc calling it a quirk (`backspaceAtItemStart: logseq`).
After a paste that makes nodes, Roam leaves the caret at the end of the first pasted one, Athens at
its start; ourus at the end of the last. Checked outside the harness, in a headless Chromium of the
session's own (Playwright, keys as a user types them, the real clipboard, the caret read from the
DOM): `- a┃⏎- b`, `- x⏎- y` pasted, then `!` typed: Roam `- x!┃`, Athens `- !┃x`, as the drivers had
read. These were 36 of Roam's 48 caret verdicts and 41 of Athens's 62 (9 and 25 after it; 9 and 16
at the end). `pasteCaret` in `paste.ts`; Quirk2, Quirk2b.

`quirkPasteText: default | dynalist`: Dynalist reads no Markdown from a clipboard of text alone (a
line an item, markers kept as text, the first line joining the block; from HTML it pastes lists), a
driver bug suspected and ruled out by hand (a headless Chromium of the session's own, a real Ctrl+V:
`- x⏎- y` at `a┃` gives `a- x`, `- y`; with HTML beside it, `a`, `x`, `y`). With `dynalist`, `paste` of
such a clipboard is `pastePlain` under the app's `pastePlainLines` (Dynalist's `enter`): Quirk4;
Dynalist 27 disagreements to agreements, none worse (its indentation nesting and its place after an
item's children not modeled).

The quirks' cases are in `spec/quirks.md` (the user's call), not in their commands' files, which say
what ourus does and link there: Quirk1, Quirk1b and Quirk1c (`quirkEnterMidHeading`, once Enter69b
and Enter69c), Quirk2 and Quirk2b (`quirkPasteCaret`), Quirk3 (`logseq`, once Backspace50c), Quirk4
(`quirkPasteText`). Each agrees in the apps that declare it but Quirk3 in Logseq DB, whose second
Backspace doesn't join the bulleted block into the numbered one above, as Logseq OG and Tine do: its
own.

### 3.6 `pasteOverSelection: replace | ignore` (decided)

Paste17 (blocks pasted over `a«bc»d`) had six apps in one camp against ourus: the selected text
kept. One case is no rule, so 15 probes went to every block app (`sxs/probe.ts block`): the
selection in the middle, over the whole text, at its start or end, backward; one block or several,
with children; in a nested block and in an item with children; plain lines; plain paste; typing
after. Logseq (both), Tine, Tana, Roam and Athens leave the selected text as it is whenever what is
pasted is blocks, the blocks where a paste at a caret puts them and the caret as each app's paste
puts it (Roam's and Athens's quirks included); one line of text replaces the selection in all of
them, and Tana, Roam and Athens, which paste plain lines as blocks, keep the text there too. Every app
that opens a seam (BlockNote, WorkFlowy, RemNote, Dynalist) deletes the selection first, as does
SiYuan. So a rule, not a quirk: a paste of nodes is structure, not an edit of the text.

`pasteOverSelection` (the user named it): `replace`, the default (15-spec's decision), or `ignore`.
It is a paste of nodes' only (documented as such in `config.ts`, the spec's README and paste.md's
rules): what is pasted as text (a line put in at the caret, plain lines into the text, code into
code) replaces the selection either way, and so does anything over a selection across nodes.
`pasteMarkdown` holds it, so `paste` and plain paste as `pastePlainLines: items` share it: with
`ignore` it pastes at the selection's end asking for nodes only, and falls back to deleting first
where the paste would be text. Plain paste as items took no account of a selection before (it
pasted at its start, by accident); with `replace` it now deletes it first, as `paste` does
(the differential's other changes: selections starting in markup, now the host's, as `paste`'s).
Spec cases Paste17b–17g, PastePlain33b, 33c; the six apps declare `ignore`. Paste17 to agree in all
six; of the new cases' cells, 32 agree and 3 disagree (Paste17e, one item copied with its line break:
Roam pastes it as text, Tana keeps its `- `; PastePlain33b in WorkFlowy, whose plain paste is its
own). Not modeled: Athens's plain paste over a selection puts the text in at its start, the
selection kept (PS10, a probe): a bug, no case.

### 3.7 A list of its own keeps its numbers under a paragraph (a fix)

`1. a⏎2. b⏎- ┃x⏎3. c`, Backspace with `backspaceAtItemStart: unwrap` (BlockNote's): `x` a paragraph,
which owns the list after it, and ourus wrote that list `1. c`, renumbered, though it was a list of
its own from 3 that the edit never touched (TO4; Backspace40, `2. m`). SiYuan and BlockNote keep
`3. c`. The draft (`#list` in `draft.ts`) renumbers a run moved right under a paragraph's text from
1, the only number that can interrupt a paragraph; the spec's own cases say when: under an item's
text, where a blank line setting it apart would loosen the item's list (Regression1, Regression8),
and where a list is split, its lower part starting at 1, as BlockNote, RemNote and Logseq number it
(TO6). Now a whole list of its own outside every item keeps its numbers, a blank line setting it
apart (Backspace40b, as Backspace40 already drew it under the default `join`). 4 cells to agree
(TO4, Backspace40 in SiYuan and BlockNote); the differential's 1,078 changed runs are that list,
kept; the inverse test's move round trips lose text in 64 runs, not 76.

### 3.8 `enterOnEmptyItem: unwrap` (decided)

SiYuan and BlockNote, document editors, make an empty item a paragraph where it is on Enter, as a
word processor does: at the top level between the two lists it splits (Enter7), nested a paragraph
in the parent item (Enter27, Enter28), an empty item with children a paragraph owning them
(Enter21). None of `sibling`, `outdent`, `exit`. `unwrap`: an empty item, first or in the middle of
its list or with children, at any depth, leaves it as `leaveList` makes a top-level one leave
(an empty paragraph held by a placeholder, set off by blank lines; `leaveList` moved to `util.ts`,
shared with §3.9); the last of a list outdents or leaves it, as with every value (SiYuan agrees,
Enter5; BlockNote makes that one a paragraph too). Enter7c, Enter21b, Enter27b. Both declare it:
Enter7, Enter15, Enter21, Enter27 to agree in both, TaskEnter5 in BlockNote, and the three new
cases agree in both; Enter28 in SiYuan and TaskEnter6 in BlockNote to whitespace (the empty
paragraph in an item spaced otherwise).

### 3.9 `taskEditing: unwrap` (decided)

SiYuan and BlockNote take a task's checkbox with its marker on Backspace right after the checkbox:
the task a paragraph where it is (TaskBackspace2, TaskBackspace3; SoftBackspace1's second step), as
`config.ts` already said. `unwrap`: so, its list split there; an empty task an empty paragraph, as
`leaveList` makes one (TaskBackspace3b, TaskBackspace3c). Not `block` following
`backspaceAtItemStart`: SiYuan's is `body`, a paragraph in the item above, but a task it unwraps in
place. Both declare it: TaskBackspace2, TaskBackspace3, SoftBackspace1 to agree in both (and
BlockNote's TaskBackspace10), TaskBackspace3b agrees in both; SiYuan outdents an emptied nested task,
a plain item, as its Enter does (TaskBackspace3c, TaskEnter5, TaskEnter6): its own.

With §3.7–3.9 the block apps' disagreements went from 1078 of 5639 to 1058 of 5653: 20 to agree, 11
new cells agreeing, none worse; SiYuan 173 to 164, BlockNote 175 to 163. The new Backspace40b
disagrees only in Athens, which deletes the block (as on Backspace26), its own.

## 4. The container's cap on tasks

Runs crashed ("Target page, context or browser has been closed") and hung (a run's workers silent for
many minutes, the others waiting for room in the pool) several times. The cause: the container's cap
on tasks (`pids.max`, 2048). Its `pids.events` counted **686** refusals, `pids.peak` 2048; Chromium's
logs have `pthread_create: Resource temporarily unavailable` at 04:39:53 (66) and 06:33:43–48 (about
600), crash handlers waking in other browsers seconds after. 14-sxs had sized the pool under the cap
and measured a full run at 1,998: no room for anything else in the container (a test run, a
differential, another session).

- **The pool is 4 browsers of 5 windows** (was 6 of 3; the user's numbers): 20 places for the 18
  apps, a browser's base (some 110 tasks idle, more busy) twice less. A full run then peaked at 1,774,
  the cap not hit. An app has at most 4 workers, RemNote's setups (by parity) 2 each.
- **`run.ts` watches the cap** (`watchTasks`, `lib/system.ts`): it reads `pids.max`, `pids.current`
  and `pids.events` every second while apps play, warns as the cap refuses tasks (every ten seconds
  at most) and says at the end how often it did and how many tasks ran at most. A run of several apps
  watches in the terminal, each app's run in its log.
- Seen, not changed: Debian's Chromium adds `--enable-crash-reporter` itself, so the pool's
  `--disable-crash-reporter` leaves two crash handlers a browser; each browser and renderer sizes its
  thread pools by the 10 cores (16 and 9 foreground threads), most of a renderer's 21 tasks.
- RemNote's two setups hung once more after the change, both at 08:14, the cap not hit. With the
  pool's profiles deleted (`.sxs/chromium/`, 573 MB, the user's call) they ran in 8 minutes. A grown
  profile (RemNote keeps its data in the page's storage) is the likely cause; not proven.
- A run of paste and paste-plain hung in WorkFlowy's worker after it had written its file runs
  (`paste.json`, `paste-plain.json`), every other app done in 111 s: killed after 5 minutes, its
  results whole. The cap was not near (648 tasks). Where it waits on exit is not known.
- RemNote with bullets hung in the `free-form` probe at 50 cases, its log still for minutes; the
  probe was killed. The full rerun after it hit the cap as its 18 apps started (26 refused at 2,032
  tasks, then 2 more: 714 in `pids.events` in all), the first since the pool's resizing, the killed
  probe's windows likely still in it; RemNote without bullets and SilverBullet hung there till the
  run's 3-hour timeout, the others done in 9 minutes. Run again, the two alone (873 tasks), they ran
  in 9 minutes. After killing a probe or a run, stop the pool (`run.ts --stop`) before the next.

## 5. What the disagreements are now

Not modeled (the apps' own, or not now):

- Paste from HTML is each app's importer: Athens flattens lists and drops formatting; several drop
  `<ol start>` and a code block's language; Logseq, Tine and Roam keep `*x*` unescaped (it renders
  italic).
- Pasted HTML's task checkboxes are dropped by seven apps (PasteHtml8); ourus makes tasks of them,
  as GFM's task lists are.
- Code in Athens and Dynalist is a block's text: a paste of code goes line by line, fences as text
  lines (PasteList12–15, 26, 27, Paste7, Scenario18), a paste into code drops blocks in (Paste14,
  PastePlain28, 30); Tana's code block takes Enter at its last line's end as leaving it (Fence1, 3,
  5). Logseq OG, Tine, Dynalist and Athens keep a fence short where the code needs a longer one
  (Fence62, Regression6): their bug.
- Enter over a selection splits at its start and keeps the text (Tine, Athens, RemNote both: Enter59,
  Enter56b, TO-E33, 13 cells; Tana in Enter59); Logseq, Roam and the rest replace it as ourus does.
- RemNote's paste: the first pasted line joins the text at the caret, the text after the caret stays
  in that block, the rest go after the block and its children (PasteList2, 3, 4, 6, 22 and plain
  paste's cases); none of `pasteSeams`' values, as `config.ts` says. With it, a clipboard's last line
  break is an empty block (RemNote, WorkFlowy, Dynalist).
- WorkFlowy and Dynalist give a checked task's state to the second half of a split (TaskEnter7):
  §3.4's mechanics again (the new block above, the original keeping its attributes); a quirk if
  wanted.
- Math is a block's text in Roam, Dynalist, Athens and BlockNote: Enter in it splits the block
  (Fence42; refused as `enter-in-fence` in the first three, measured in BlockNote).
- After `deleteSubtree` of a page's every block no block has the caret, so typing goes nowhere
  (DeleteSubtree6); Tana, Dynalist and Athens remove the only block on Backspace at its start
  (Backspace26).
- Indenting `2. b` under `1. a` gives a bulleted child in Roam, Tana and Dynalist (Indent4, TO14),
  numbering being the parent's view (15-spec's `indentNewList`, not taken).
- The free-form apps (RemNote without bullets, SiYuan, BlockNote) move a heading without its section
  and a paragraph without its list (Gap3, Gap6, MoveDown4, MoveUp3, ...: about 30 cases), 15-spec's
  model experiment (a paragraph's or heading's ownership), deferred.
- An item's body: Enter at the end of an item's first paragraph, its second in the same block to the
  apps (TO-E10), and code pasted at an item's end (Paste7, PasteList12, Scenario18): model C's.

## 6. Numbers

Disagreements over cases run, by app, at 17-refactor's full rerun and at the end (a full run with the
pool at 4 × 5, RemNote's setups run again on fresh profiles, the files a later change touched run
again, everything rejudged after):

| app | start | end |
| --- | ---: | ---: |
| Logseq (OG) | 46 / 434, 10.6% | 37 / 502, 7.4% |
| Logseq (DB) | 47 / 425, 11.1% | 37 / 490, 7.6% |
| Roam | 40 / 414, 9.7% | 28 / 482, 5.8% |
| Tine | 64 / 437, 14.6% | 49 / 503, 9.7% |
| Athens | 59 / 391, 15.1% | 46 / 450, 10.2% |
| Tana | 135 / 460, 29.3% | 94 / 464, 20.3% |
| Dynalist | 168 / 551, 30.5% | 80 / 536, 14.9% |
| RemNote (bl) | 110 / 427, 25.8% | 110 / 487, 22.6% |
| WorkFlowy | 158 / 503, 31.4% | 114 / 507, 22.5% |
| RemNote | 175 / 520, 33.7% | 159 / 538, 29.6% |
| SiYuan | 211 / 570, 37.0% | 165 / 583, 28.3% |
| BlockNote | 224 / 578, 38.8% | 164 / 595, 27.6% |
| all twelve | 1437 / 5710, 25.2% | 1083 / 6137, 17.6% |

A full rerun of every app before §3.7 (13 minutes, nothing hung) moved 3 cells of the twelve from
the judgment before it, none a change's (Logseq DB's Scenario23, Tine's PasteList27 the other way,
BlockNote's Scenario23 to agree). The last one, after §2.9's untagging, played the 56 cases in the
outliners (their counts above grow by about 50 cases each), RemNote without bullets and SilverBullet
run again alone after hanging (§4); nothing is left not run.

Caret verdicts fell most in Roam (52 to 9) and Athens (63 to 16), whitespace ones across the apps with
paragraphs in a block (§3.2, 148 to agree).

## 7. Open

- Model C (an item's body belongs to the item): the projection then follows; TO-E10, the code at an
  item's end.
- The free-form apps' ownership (§5): the model experiment.
- `quirkEnterMidHeading`'s mechanics for a task's checked state (WorkFlowy, Dynalist).
- Skipped (the user's call): `quirkEnterOverSelection: keep` (§5, 13 cells, a lazy Enter by the look
  of it); RemNote's paste seam as a `pasteSeams` value, and the trailing line break's empty block as a
  quirk (§5, some 10 to 20 cells); Tana's exit from a code block (3 cells, one app); a
  `quirkEnterInCode: split` for Athens and Dynalist (a split leaves both halves' fences broken; the
  tag skips it instead); Athens's and Dynalist's code blocks refused whole (§2.6); WorkFlowy as a
  free-form editor (§2.8).
- The RemNote hangs (both setups, twice, and in a probe) and WorkFlowy's hang on exit (§4);
  Chromium's thread pools and crash handlers, as the cap came close again.
- A full run after any projection change, whose starts it changes (its cases "not run" till then).
- The one-paragraph quotes (§2.9: 37 cases an app); SiYuan's and BlockNote's selections across blocks
  (§2.9: about 20 each, a model change).

## 8. Working notes

- Measure a harness change by rejudging a copy: `OURUS_SXS_DIR=<copy of .sxs> node sxs/run.ts all
  --rejudge` in a copy of the tree with the change, then compare `sxs.json` cell by cell. Only changes
  to judging and wants show; a changed start or reading needs a run.
- A camp of three families is worth a look before a single app's disagreement; and a probe file
  around it (`sxs/probe.ts block`) before an option is drawn from it.
- Before calling a cell the app's: what it holds (a raw dump from its driver's read) and what it does
  (a headless Chromium of one's own, keys only). Both found harness bugs here (§2.6's reads) and
  ruled others out (§3.5).
- No edits under `spec/`, `src/`, `sxs/` while a run or a probe plays (it reads the spec for its
  report, and a probe starts each app's run as it gets to it); write in a copy and move the files
  after.
- After killing a probe or a run, stop the pool (`node sxs/run.ts --stop`) before the next run: its
  windows stay, and 18 apps starting on them hit the cap (§4).
- A tag decided by suspicion is worth a probe: play the tagged cases with the tag taken out (a probe
  file built from them), as §2.9 did for `free-form`.
- A run that crashes or hangs: look at `pids.events` and the browsers' `chromium.log` first. A run that
  only seems slow is waiting, not computing: keys a typist's pace apart, each settled, at most 4
  workers an app (one a browser), so a few percent of the CPU.
- Before declaring an app free-form: does one Markdown text have one state in it? Where a block
  without a bullet can have children, as WorkFlowy's can, it doesn't (§2.8).
- An app's own export, where it has one, is a check of a driver's read (WorkFlowy's, §2.8).
- Print buffers with `␠` for trailing spaces only.
- A loop waiting on `pgrep -f <pattern>` matches its own command line, which holds the pattern, and
  never ends; and killing it by that pattern kills the shell running the kill. Wait on a pid, or on
  the run's log.
