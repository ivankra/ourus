# The spec through the SxS (2026-10-20)

The behavior spec (`spec/`) read through the SxS's 18 setups ([`14-sxs.md`](14-sxs.md)), then ourus,
the spec and the SxS fixed by what that found: one session over several contexts, squashed into the
commit `Improve spec and code` (and `.sxs`'s results with it). The review ranked the cases the other
apps disagree with most, block outliners first, and asked of each whether the spec, its prose or the
SxS was wrong, or whether a camp the spec doesn't name wanted an option; then it probed ourus where
the data pointed. Two reviews, independent at first, verified each other's findings by probe and
reconciled; the user decided what was theirs. The implementation fixed every defect found but
structured paste's, built the decisions (revising some on the way: the split space became an option,
and indent changed so that outdent and indent invert), rewrote the prose against the data, added
tests, made the SxS judge an app under its declared values, and turned the session's probes into
tools.

This note replaces the session's running log and its five handovers, checked against the tree after
the commit: superseded states are kept only where their decision names them. Bugs are numbered (B1
to B76) and point to their fix (§5) or to what is open (§11); decisions (§3) point to their cases.
Notation: `┃` caret, `«»` selection, `⏎` line break, `◌` placeholder, `␠` space, `⍽` U+00A0, `¶` an
app's paragraph block.

| | before | after |
| --- | --- | --- |
| spec cases | 787 | 907, all passing ourus's replay in the SxS |
| `npm test` | 944 pass, 1 todo (Typing4) | 1070 pass, 0 fail, 0 todo (Typing4 dropped, §3.1) |
| `npm run typecheck` | one error (`findLast` in `sxs/obsidian/obsidian.ts`) | clean |
| differential: runs failing to encode | 122 | 190, on a larger corpus read in GFM; none that applies at the parent commit (§11) |
| inverse pairs over the spec's buffers | a probe | `npm run test:inverse`: 58,662 runs on 595 buffers, against a baseline |
| options | | `markup` for `editInMarkup`; `enterSplitSpace`, `joinWithChildren`, `enterTask` and `enterOnEmptyItem: exit` new; `deleteAtGap` dropped; `flavor: gfm` the default |
| SxS | 14-sxs's run, apps skipped where a declared value changes ourus's outcome | against that run, on the cases both have: every block app agrees more (+6 to +27), Outliner and true-outliner +2, the line editors less by decision (bare Obsidian and Live Preview −3, SilverBullet −4, Emacs −7; §9.1); apps judged under their declared values; no errors (7 at the first rerun) |
| bugs found | | 76 (§4), 30 by the review; all fixed but B2, B35, B52 (B14's rest), B76 and B20's structured-paste half (§11) |

## Contents

1. [The review](#1-the-review)
2. [Where the spec stood](#2-where-the-spec-stood)
3. [Decisions](#3-decisions)
4. [Bugs](#4-bugs)
5. [Fixes](#5-fixes)
6. [The spec's text](#6-the-specs-text)
7. [Tests and tools](#7-tests-and-tools)
8. [The SxS](#8-the-sxs)
9. [Measurements](#9-measurements)
10. [Apps' bugs seen](#10-apps-bugs-seen)
11. [Open](#11-open)
12. [Insights](#12-insights)
13. [Reference](#13-reference)

## 1. The review

### 1.1 The task

From the user, in order: read [`11-spec.md`](11-spec.md) and [`14-sxs.md`](14-sxs.md) (the last
session fixed the SxS harness; this one, the spec's test suite); read the spec's cases through the
SxS (its report, then `sxs/sxs.md`, and `.sxs/results/` as data), the most disagreed with first,
especially by block outliners: is a case wrong, did the spec get something wrong, or is it a
preference or an app's feel the spec misses, whose answer might be an option; a second pass without
subagents, measuring with the SxS where data is missing; cross-check the other session's independent
review, verify its findings, reach a consensus; fold in the user's answers; implement.

### 1.2 How it was done

- **The data**: 14-sxs's last full run, every app's buffer at every step of every example
  (`.sxs/results/<app>/sxs.json`), compared with ourus's.
- **Rank by consensus, not by count**: a camp is several apps agreeing with each other on one result
  other than ourus's; twelve apps each doing something odd is noise. Caret-only verdicts read per
  app too: a camp can hide there.
- **Weight the evidence**: an agreement counts most where the app could have done otherwise. Pure
  outliners hold no paragraphs, so where the other outcome is a paragraph or a blank line their
  agreement is weak (they can still refuse, delete or move focus). Setups of one app count once
  (Logseq and Logseq DB, RemNote's two, the four Obsidians); a comparison within one app (RemNote's
  two modes) is the strongest evidence there is.
- **ourus as the projection's oracle**: ourus played on the very blocks a block app was given tells a
  disagreement the projection made from one the app made.
- **Probing ourus**: every inverse pair (Enter and Backspace, Shift-Enter and Backspace, indent and
  outdent, up and down, both ways) at every caret position of every distinct start buffer of the
  spec (51,570 runs on 518 buffers; the true-outliner file and starts with placeholders left out),
  what fails to come back grouped by the shape of the difference; Enter, Shift-Enter and Backspace at
  every position inside markup; the code's whitespace predicates and host fallbacks read and played.
- **Targeted SxS runs**: the five apps declaring `deleteAtGap: gap` on the 18 examples their
  declaration skipped (`run.ts --ignore-options`); ten shapes no case drew, on all 18 setups.
- **Safety sweeps**: every case with one option at each of its values, in every flavor it runs in
  (91,600 replays), and every paste case under all 256 combinations of the paste options and
  `enterMidItem` (27,392): no exception, no `encoding-failed`. Neither started from an empty
  document (B1).
- **Two reviews**: one played commands over the spec's buffers, the other read which predicates and
  fallbacks the code uses. Both found the split space, the joins with children, the paragraph join
  and the empty item's exit; each caught the other's overstatements (a mislabelled starting state, a
  claimed grammar constraint that wasn't one). Every finding was verified by probe before it went in.

### 1.3 How the implementation went

1. §4's defects in order, each with its case first; a full SxS rerun; the split space kept and
   paragraphs joined in one press; Shift-Enter at a node with no second line.
2. The differential's new failures followed up; Enter28, outdent at the top level, decision 19's
   first reach, Delete13's peel, the longer fence, `joinWithChildren`, `enterOnEmptyItem: exit`,
   `enterTask`; the tests (surrogate pairs, the inverse test, `outline` blocks); the spec's text;
   renames; Undo3; a full rerun.
3. The split space measured again and made an option, `trim` the default; `flavor: gfm` the default;
   the SxS's `--report` became `--rejudge`, and the SxS judges an app under its declared values.
4. The triage of the cells so judged; the end review's decisions built; paste into a tight list, GFM
   tables after an item's text, Logseq DB's one error; the probe, `--compare` and `redraw` as tools.

## 2. Where the spec stood

Each app's runs of the cases of each rank, at the start:

| rank | cases | 9 block outliners: runs, agree, disagree | 3 free-form block apps | 6 text apps |
| --- | ---: | --- | --- | --- |
| core | 61 | 454, 87%, 6% | 174, 63%, 30% | 347, 39%, 50% |
| common | 189 | 1,001, 76%, 13% | 397, 55%, 37% | 998, 35%, 54% |
| edge | 337 | 1,084, 58%, 25% | 491, 49%, 37% | 1,611, 20%, 70% |
| rare | 200 | 497, 54%, 28% | 225, 37%, 50% | 941, 13%, 81% |

(Block outliners: Logseq, Logseq DB, Tine, Roam, Athens, WorkFlowy, Dynalist, Tana, RemNote with
bullets. Free-form block apps, which have paragraphs: RemNote without bullets, SiYuan, BlockNote.
Text apps: bare Obsidian, Live Preview, Obsidian's Outliner, true-outliner, SilverBullet, Emacs.)

- **The core was sound.** One core case had more than two outliners against it: Scenario7, whose
  cause was the space a split dropped (§3.2).
- **The projection was no longer the noise.** Played on each pure outliner's own blocks, ourus did
  what the app did in only six examples it disagreed on (Backspace37, Backspace40, Fence7, Fence7b,
  Fence7d, Paste37: they test something else on blocks). In every other disagreement the app did
  something ourus wouldn't on that document. One mismatch was structural: an item's body blocks
  projected as children (§11).
- **Free-form Markdown had thin outside evidence.** Of the 135 `free-form` cases, the free-form block
  apps all agreed with ourus on 24 and none did on 50 (45 none ran); the text apps all agreed on 23,
  none on 82. That is the territory ourus pioneers.
- **Quotes were compared only with the text apps** (block apps skip all 90 cases): 83% disagreed,
  nearly all by design (Tab and Shift-Tab across a quote's edge, Enter making a node, Backspace at
  quoted markup making lazy lines); 66 of the disagreeing steps parse to ourus's outline.
- **One decision made most whitespace verdicts**: decision 1 (§3.2).
- **The defects were at the edges**: positions only the host gives the caret (inside markup, a blank
  line, the document's end), blocks of lines other than fenced code, Unicode whitespace, the empty
  document, blank lines, the host's fallbacks. None was drawn by a case; the inverse and markup
  sweeps found most of them.
- **The text**: 12 cases contradicted their own prose, rules or mirrors and 7 flows had problems
  (§6.2, §6.3); about 60 claims about apps were contradicted by the data (§6.4); 12 option docs and
  declarations were stale or too broad (§6.5).

## 3. Decisions

The user's decisions in their final form: what, the evidence (the apps' camps, setups of one app
counted once), what changed, and the history where a decision was revised. "Decision N" is 11-spec
§4's numbering. Where the user left a choice to the review or the implementing session made a call
the user accepted at the end review, it says so (§3.12 lists those).

### 3.1 Two kinds of host: `markup: text | decorated`

ourus serves two kinds of editor. One decorates markup (rendered checkboxes and bullets, Live
Preview's widgets): there the guarantees keep the user from breaking the layout through ourus, and
the caret never ends in markup. The other shows markup as editable text (raw CodeMirror, a textarea,
Obsidian's source mode): there ourus mustn't get in the way of a user fixing markup by hand. One host
setting holds the difference: `editInMarkup: host | refuse` became **`markup: text | decorated`**,
`text` the default (the name was the session's call).

- **Under `text`**, with the caret strictly inside markup (§5.1 says where that is), Shift-Enter,
  Backspace, Delete and Cmd-Backspace are the host's, and so is an edit there that ourus would refuse
  (its reason as `detail`), but never an encoding failure (B12). A command may leave the caret on a
  fence where the user had it: Backspace back to a fence's end (Fence32); indent and outdent from the
  fence line of an item whose text is code, where Tab and Shift-Tab in the code are the host's, so
  the outdent can follow (Indent31, Indent31b; Outdent19 redrawn, Outdent19b). Moves put the caret
  into the code under both values.
- **Under `decorated`**, those keys act at the text start, make the edit ourus can check, or are
  refused; ourus's old in-markup edits stay (the Delete16 family's structure-keeping deletes, rather
  than "at the text start" for Delete: the session's call); no command leaves the caret in markup
  (`caretInText` for every command; Fence32b).
- **Under both**, Enter in markup acts at the node's text start, as it already did in an item's
  marker (Enter34): in a checkbox and in a heading's `#`s too (Enter54, Enter54b, Enter55, Enter55b).
  And a checkbox's character is edited as text, since some decorating hosts show task markup as text
  too (`- [ ┃] task`, Backspace, then `x`: `- [x] task`; TaskBackspace8, TaskBackspace9,
  TaskDelete4).
- Cases set to `decorated` to keep the old behavior: the Delete16 family, Delete19, TaskBackspace1,
  TaskBackspace6, the true-outliner file's "Backspace before the checkbox". New: Backspace42 and
  Delete29 (`text`), Backspace42b (`decorated`), ShiftEnter26, ShiftEnter26b. Quote58's caret moved
  after `[!note]`. Guarantees 3 and 6, backspace.md's intro, delete.md rule 2, tasks.md rules 3 to 6,
  `config.ts`.
- **Typing in markup** is the host's under both. Typing4, pending since 11-spec (a host-side guard
  putting typed text at the text start under `decorated`, never built), was dropped when this note
  was written: under `decorated`, keeping the caret out of markup is the host's (Obsidian's Outliner
  "sticks the cursor to the content"), and no ourus command leaves it there (typing.md rule 2).

### 3.2 The split space: `enterSplitSpace: trim | drop | start`

What Enter does with the spaces at the caret (`- one two┃ three`). Decided three times:

1. **Decision 1** (11-spec) dropped the space on Enter and Shift-Enter, and Backspace didn't put it
   back: Shift-Enter, Backspace turned `one two three` into `one twothree`. It made about 260 of the
   block apps' 329 whitespace verdicts and 30 disagreements (401 step verdicts in 43 cases), and it
   was the one behavior the outliners disagreed with in a core case (Scenario7).
2. **The review kept it**: on Enter at the end of the first half (`- one two␠⏎- ┃three`), since
   Markdown can't hold it at the new item's start (`-  three` is padding, which moves the content
   column: in Enter3, Outliner and SilverBullet keep it there and `c` stops being `b`'s child), and
   at a block's end it renders as nothing and makes no hard break; on Shift-Enter at the new line's
   start, after its indentation, as bare Obsidian does. Joins concatenate, so the space came back
   with no rule of its own. Not taken: holding the space at the seam, given back only by the
   immediate Backspace. Built: 47 cases redrawn by the rule, each diff read (Enter1, Enter3, Enter44,
   Enter48, ShiftEnter1, ShiftEnter21, the true-outliner file's E4, S4, S9, S13 among them),
   Scenario7 without its typed space; Indent33 and MoveUp40 for a continuation line's extra space
   kept through indent, outdent and moves.
3. **Measured again** (Enter44, and five shapes on all 18 setups): the first half's end was nobody's
   at rest. Tine, Roam, Athens, Tana, Dynalist, WorkFlowy, BlockNote, SiYuan, SilverBullet and
   Outliner keep the space at the new block's start, for good (the join gives it back, the caret
   before it); bare Obsidian, Live Preview, true-outliner, RemNote and Emacs drop the spaces after the
   caret and keep those before it; Logseq trims both halves. No app holds the space and drops it on
   leaving. So, the user's call, **an option with the camps as its values, `trim` the default**
   (Logseq's: decision 1's cut is back, the one loss guarantee 2 names, and guarantee 5's exception):
   - `trim`: both halves lose them. The review's redraws went back (31 cases, 28 steps exactly their
     earlier drawings, the rest read one by one); Scenario7 types the space again; the prose of
     Enter1, Enter44, TaskEnter3, ShiftEnter21, Scenario21b, the true-outliner file's E1, enter.md
     rule 7, and guarantees 2 and 5.
   - `drop`: the spaces after the caret go, those before it end the first half (`- one two ┃three`
     keeps `two␠`; Enter64): a trailing space, invisible, which markdownlint's MD009 flags.
   - `start`: the spaces after the caret start the second half, the caret before them, kept where
     Markdown keeps bytes unseen and ourus, under `start` only, reads them as text: an item's padding
     past the item above's (its previous sibling, else the item whose first child it is: `- one
     two⏎- ┃␠three`), and a paragraph's or a title's rest's leading spaces (under four columns past
     the container's content start). An item with children moves them as many columns right, as a
     wider marker would, but not for spaces after a checkbox, which are in the text (TaskEnter10).
     Kept spaces are capped at three columns (more are dropped, as `drop` does); a marker after them
     is escaped; where the padding would read as another outline (children falling out, code past
     four columns), the plan's placeholder retry holds the space on the line and leaving drops it
     (Enter65e, Enter65f). Joins take the kept spaces with the text, Backspace inside them deletes a
     character (the host's), and Shift-Enter on a kept space carries it to the new line (Enter65k).
     The cost (Enter65j): a list padded unevenly by hand reads the wider item's extra spaces as text;
     equal padding (`-   a` / `-   b`) is the list's. Enter65 to Enter65m.
   - `start`'s first version wrote the space as `&#32;`: a placeholder held it while the caret was on
     the line, leaving wrote `&#32;`, structural commands and Shift-Enter wrote it first, joins turned
     it back, and `internal.md` held the cases that drew it. The user replaced it with the padding: no
     `&#32;` anywhere. The padding first covered items only, a paragraph's or title's rest dropping
     the space, which made 11 cells worse (Enter60, Enter60b in Tana, SiYuan, Dynalist, BlockNote;
     Scenario21b in SiYuan, BlockNote); keeping it there too completed `start`.
- **Shift-Enter isn't the option's**: under every value its new line starts with the spaces at the
  break, after its indentation (`one two┃ three` gives `one two⏎ ┃three`), as every app but
  true-outliner does, so Backspace gives them back (ShiftEnter21); spaces before a task's text are its
  checkbox's and go (ShiftEnter26b).
- Declared (§8.2): `start` for the ten apps, `drop` for the Obsidian base (bare, Live Preview,
  true-outliner), RemNote and Emacs; Logseq is the default. Residuals: SiYuan and SilverBullet also
  trim the first half's end; Logseq keeps a numbered block's trailing space at a split (Enter35) and
  trims it in a bullet list, a quirk.

### 3.3 Joins between paragraphs; `deleteAtGap` dropped

- **Backspace between paragraphs joins them in one press, glued** (`a⏎⏎┃b` gives `a┃b`, several blank
  lines at once), and Delete mirrors it, at the top level and in items (backspace.md rule 4,
  delete.md rule 5). It replaced the brief's rule, which kept a soft break and made Enter's inverse
  two presses (Backspace12b): the only join of two nodes that kept a line break (Backspace11 glues
  the same boundary after an item). Every app whose Enter makes a paragraph (RemNote without
  bullets, SiYuan, BlockNote, true-outliner) joins in one press. Redrawn: Backspace12, Backspace12b,
  Backspace12c (its list split off as Backspace12d), Backspace19, Backspace27, Backspace38, Delete18,
  Delete18b, Delete18c, Quote51; Enter47, Enter53, Quote73 take one Backspace where they took two;
  Scenario21 from both sides, Scenario21b (a sentence boundary) new.
  - It was decided with the split space kept: at a sentence boundary the old soft break was what gave
    back decision 1's lost space, and with the space kept one Backspace gave `One. ┃Two.` back, as
    RemNote, BlockNote, true-outliner and every text app do. With `trim` the default again (§3.2) the
    same round trip glues `One.┃Two.`: Scenario21b draws the default's cost, which `start` avoids.
- **Right after an item's own text, the blank lines go first** (the user, at the end review):
  Backspace at the paragraph's start, or Delete at the text's end, takes back only the blank lines,
  `- one⏎⏎  ┃two` giving `- one⏎  ┃two`, and a second press glues (Backspace19, Delete18b); an empty
  paragraph there, after two Shift-Enters, is an empty line of the text again (ShiftEnter11). In
  Markdown both histories are the same blank line; inside an item Enter makes items, so a blank line
  right after the item's text comes from Shift-Enter, or was written so. After a body paragraph Enter
  does split (`- a⏎⏎  b┃c` gives two body paragraphs), so there Backspace takes Enter's back, glued
  (Backspace19b). Built narrower than proposed (every paragraph in an item): the inverse test, run
  against the parent commit's code on the same corpus, showed that version making Enter's round trips
  in body paragraphs worse. As built, Shift-Enter-then-Backspace round trips that change the text went
  83 → 70 runs (four of them differing in a continuation line's indentation only), Enter then
  Backspace adding a blank line 285 → 278; nothing worse.
  The evidence (Shift-Enter, or Shift-Enter twice mid-text, then Backspace, on all 18 setups):

  | where | one line break taken back | glued, as ourus | other |
  | --- | --- | --- | --- |
  | in an item (`- one⏎  ┃two`, `- one┃two`) | Logseq, Logseq DB, Tine, Roam, Athens, Dynalist, RemNote (both), BlockNote, Outliner, SilverBullet | SiYuan | bare Obsidian, Live Preview, true-outliner, Emacs delete the indentation (`- one⏎⏎┃two`); Tana and WorkFlowy have no line break in a block |
  | at the top level (`one⏎┃two`, `one┃two`) | BlockNote, RemNote, bare Obsidian, Live Preview, Outliner, SilverBullet, Emacs | SiYuan, true-outliner | |

  From the stored runs: after Enter made the break (Backspace12), RemNote without bullets, SiYuan,
  BlockNote and true-outliner glue; after two Shift-Enters at a paragraph's end at the top level
  (ShiftEnter12), all eight apps that run it take back only the second, where ourus gives Enter's
  inverse (`para┃`), the same bytes being Enter's too. The block apps keep the histories apart (one
  block with an empty line, against two blocks); BlockNote shows both.
- **Under `enterAtTextStart: stay`, one blank line a press** while more than one is there (`a⏎⏎⏎┃b`
  gives `a⏎⏎┃b`, then `a┃b`; Delete the same; quoted blank lines counted): `stay`'s Enter adds a
  blank line and its Backspace takes one, as the four `stay` text apps do (bare Obsidian, Live
  Preview, Outliner, SilverBullet: probe G4, §3.9); before, Enter then Backspace merged two
  paragraphs. Under `into` the same Enter makes a held paragraph that Backspace takes back alone.
  Backspace12e, Delete18d (triage question 1, §9.2). Of the text apps, five of six also take one
  blank line back where two were written by hand (Backspace12c); true-outliner glues, as ourus does.
  Weighed: keeping the merge (under `stay`, Enter then Backspace loses a paragraph break, more than a
  blank line); a new option for Backspace's paragraph join (no: `deleteAtGap` was dropped for this).
  The cost taken: Backspace depends on an Enter option, a bit of `gap` back for `stay` alone.
- **`deleteAtGap` is dropped** (the user left it to the review). On the 18 examples its declaration
  skipped, all five text apps match `gap` exactly wherever Backspace deletes a line break (a
  paragraph's, a heading's or a code block's following text, Delete at a text's end, a held
  paragraph: Backspace12, Backspace12c, Backspace22, Backspace23, Backspace24, Backspace25, Delete13,
  Delete13c, Delete14, Delete17, Delete18c, Placeholder13, every step); at an item's or a quote's
  start (Backspace15, Backspace21, Backspace40, Quote53, Quote56, Quote57) none matches either value
  (they delete the marker's or the `>`'s space; SilverBullet unwraps the item, and matches `join` on
  Quote53). So `gap` was exact for the text editors at line breaks and ourus's own invention at items
  and quotes; with paragraphs joining in one press it would only reproduce the line editors' one blank
  line per press, which the plain line-editor mode a host falls back to covers; and its declaration
  skipped 16 cases per text app, hiding their marker edits. Gone: the option and `deleteGap`,
  Backspace21b and Delete17b, rule 2 of backspace.md and delete.md (the rules renumbered; the
  true-outliner file's "rule 4" is now 3), the READMEs' lists, the differential's configs, and the
  declarations of bare Obsidian, Live Preview, Outliner (all from `sxs/obsidian/obsidian.ts`),
  SilverBullet, Emacs and true-outliner. Backspace22 (a paragraph after a heading's blank line) joins
  into the title in one press, as under `join` before.

### 3.4 Joins that bring children up a level: `joinWithChildren: join | refuse`

A new option, `join` the default, for a first child with children joining its parent, by Backspace at
its start or Delete at the parent's end, its children coming up a level into its place: into an item,
a paragraph owning the list, a heading's title, in quotes too. `refuse`: `has-children`. The matrix,
from the SxS data, before building:

| shape | refuse | join, as ourus | other |
| --- | --- | --- | --- |
| a first child with children, Backspace (true-outliner's "Children move to the joined node") | Logseq, Logseq DB, Roam, Athens, WorkFlowy, Dynalist, Tana, Outliner | Tine, RemNote, true-outliner | SiYuan outdents, BlockNote unwraps |
| the same by Delete ("Delete forward absorbs child with grandchildren") | the same eight | Tine, RemNote, BlockNote, true-outliner | SiYuan outdents |
| a first child without children (Backspace3, Delete1, both core) | WorkFlowy, alone: no camp | all but SiYuan, BlockNote | |
| a sibling with children (Backspace8, Delete7, Delete12) | Tana | the eleven others: out of scope, the children keep their depth | |
| an empty first item with children (Backspace17b) | the seven declaring `emptyItemWithChildren: refuse`, Tine, Tana, true-outliner | RemNote (the caret lost) | SiYuan, BlockNote unwrap |

- The 2026-10-14 decision to allow these joins (11-spec) was made knowing Logseq, WorkFlowy, Roam and
  Dynalist refuse; the SxS extended the camp and narrowed its scope. `join` stays the default (no
  dead key); `refuse` is the reference outliners' camp.
- The empty operand has camps of its own (Tine, Tana and true-outliner refuse Backspace17b, the first
  two joining the non-empty case), so `emptyItemWithChildren` stays beside the new option; where both
  apply (Delete into an empty item whose first child has children), either refuses. Delete on an
  empty item with several children absorbs the first child (ourus, BlockNote, true-outliner; Tine
  reordering them), where Tana and RemNote remove the item and lift all its children, Backspace's
  tree: two allowed results (B59).
- Backspace45, Backspace45b, Delete31, Delete31b; backspace.md rule 5, delete.md rule 6; the
  true-outliner file's "Joining an item with children"; declared by the eight.

### 3.5 Empty items and tasks

- **`enterOnEmptyItem: exit`**, a new value: an empty top-level item leaves the list, as `outdent`
  makes it; a nested one gets a sibling, as `sibling` does. It is RemNote without bullets'
  combination. Enter's code already branched by depth, so only the type changed. The name was the
  session's call (`leave` and `paragraph` weighed; `exit` says what happens at the top level without
  claiming the nested case). Enter63 checks what is typed next (the text editors leave no blank
  line, so typing continues the item above); Enter63b. `sibling` stays the default. The camps on an
  empty item mid-list:

  | camp | apps |
  | --- | --- |
  | another empty item (`sibling`, ourus at any depth; spec2's decision) | Logseq, Logseq DB, Tine, WorkFlowy, Dynalist, Tana, RemNote with bullets; RemNote without bullets when nested |
  | outdent | Roam, Athens, Outliner, bare Obsidian, Live Preview (declared); true-outliner and SilverBullet, undeclared |
  | a paragraph where it is | SiYuan and BlockNote at every depth; RemNote without bullets at the top level |

  RemNote against itself is the evidence. At the top level every paragraph-capable app leaves the
  list; pure outliners can't make a paragraph, so their agreement with `sibling` there is forced.
  SiYuan's and BlockNote's nested paragraph isn't taken: it would leave a paragraph between two lists
  inside the parent. Tine and Tana make a new empty item even at a list's end.
- **`enterTask: continue | plain`**, `continue` the default, measured first on TaskEnter3, TaskEnter4,
  TaskEnter7 and the true-outliner file's E32: Logseq, Logseq DB, Tine, Roam and Athens (which keep a
  task as a text marker, `TODO`, `{{[[TODO]]}}`) and Tana on a split make a plain item; WorkFlowy,
  Dynalist, RemNote, SiYuan, BlockNote and every Obsidian setup a task. Under `plain` every item Enter
  makes from a task is plain (at its end, mid-text, at its start, beside an empty task); the task
  keeps its checkbox. TaskEnter8 is new: Enter at a task's end, the core path, was missing from
  tasks.md (only in E32, which can't move into the MIT files). TaskEnter9, TaskEnter9b, TaskEnter9c;
  tasks.md rule 1. Declared by Logseq, Tine, Roam, Athens.
- **Which half of a checked task keeps the check** (TaskEnter7) is another axis, left as it is:
  WorkFlowy and Dynalist give the check to the rest, Roam and Athens keep the first half checked and
  make the rest plain, ourus keeps the first checked and makes the rest an unchecked task.
- **`taskEditing` stays `checkbox`** (Backspace right after the checkbox peels it; on an empty task,
  then the empty item goes; Scenario15 uses the peel). WorkFlowy, Dynalist and true-outliner remove an
  empty task in one press, Tana peels it, SiYuan and BlockNote make a paragraph. true-outliner
  declares `block`. More values may follow once each variant is measured whole (§11).
- **Cmd-Backspace right after a checkbox under `taskEditing: text`** deletes it, to the marker
  (`- [ ] ┃def` gives `- ┃def`), the text escaped where it would start a block (SoftBackspace10;
  triage question 4). It deleted one space, being Backspace at the text start, which is after the
  checkbox even when the checkbox is text. The text apps delete to the line's start, the marker too
  (bare Obsidian, Live Preview, Outliner, true-outliner on the second press; SilverBullet and Emacs on
  the first); ourus keeps the marker, as structure.

### 3.6 Shift-Enter where a node had no second line

- **In an ATX title**, Shift-Enter splits as Enter does, the rest the section's first paragraph, never
  a setext heading (ShiftEnter14; it was refused, where no app refuses and six paragraph-capable apps
  do Enter's split).
- **A setext title holds several lines** (B58): Shift-Enter and plain paste break it as a paragraph's
  lines (ShiftEnter29, Paste88); its underline refuses them.
- **At an item's or a task's text start**, the line breaks after the marker: `- ┃a` gives `-⏎  ┃a`,
  which CommonMark reads as the item `a` (an item may begin with a blank line); `- [ ] ┃task` gives
  `- [ ]⏎  ┃task` as before. Dynalist, BlockNote, true-outliner and the text apps break the line
  there. Two conditions: Backspace right after takes the break back (at the start of text alone on
  the line after its marker, it takes the break and that blank line, for a first child of an item or a
  paragraph too), where the text-start rule would otherwise unwrap or join the item; and where the
  bare `-` would sit right under a paragraph line (a first child: `- a⏎  -⏎    b` reads `-` as a
  setext underline), a blank line goes above it. The text is escaped where on its own line it would
  start a block (ShiftEnter30). ShiftEnter13 redrawn, ShiftEnter13b; ShiftEnter22b redrawn
  (`decorated` acts at that text start).

### 3.7 Carets

- **Enter28 follows the outliners**: on an empty first child right under its parent's text, the new
  empty item goes above and the caret stays in the lower one, as Logseq, Logseq DB, Tine, WorkFlowy,
  Dynalist, Tana and RemNote do, and the blank line that keeps the upper one from reading as a setext
  underline is written at once (`- a⏎⏎  -⏎  - ┃⏎  - c`); Enter again piles another above the caret.
  The caret had stayed in the upper one, the prose calling that Markdown's doing, which it isn't:
  ourus wrote the same blank line when the caret left, and repeated Enter piled empty items below the
  caret (Enter, Enter, `x` gave `- x┃` above two empty items). Checked: undo (one step), ordered
  lists (renumbered), under a paragraph, in a quote (`>` on the blank line), a loose list,
  `enterOnEmptyItem: outdent` (still outdents). enter.md rule 3. Seven outliners' carets agree now.
- **Fence12**: Enter at the start of an item's opening fence splits the item: `- a`, and an item whose
  text is the code, the caret on the code's first line (B7). Against the text apps that run it (bare
  Obsidian, Live Preview, Emacs, SilverBullet), by decision.
- **Fence30** fixed (B8). **Fence31** takes Fence12's split back now: Backspace at the code's start
  joins the item to the one above, the caret staying at the code's start (the session's call, over
  refusing). **Fence32** returns the caret to the fence's end where the user had it, which only
  `markup: text` allows (§3.1; Fence32b under `decorated`).
- **Under `stay`, Enter at a heading's line start, before its `#`s,** opens a blank line above, the
  heading whole, as at a paragraph's start, and puts the caret at the title's start, not before the
  `#`s, where typing would make the heading a paragraph (guarantee 6, under both `markup` values; the
  text apps leave it before the `#`s, a caret difference); in a quote the blank line goes above the
  quote. Enter55c, enter.md rule 5 (triage question 2). It had split off an empty heading, the title a
  paragraph (Enter in markup acting at the text start, §3.1), demoting a title the user didn't touch.
  The four `stay` text apps keep the heading whole at the line start (probed at the document's start,
  under a paragraph, after a blank line) and split it at the text start, as ourus does (Enter45).
  BlockNote and RemNote can't put the caret before a heading's `#`s; at the text start they put an
  empty block above and keep the heading whole, which neither value draws: not taken.

### 3.8 Outdent and indent at the top level

- **Any top-level item outdents to a paragraph**, as the first already did (DirectOutdent2) and as
  RemNote without bullets and SiYuan do: a later item becomes a paragraph after the items above it,
  set off by a blank line, the items after it its list (`- a⏎- b┃⏎- c` gives `- a⏎⏎b┃⏎- c`); an
  ordered list after it starts again at 1. It was refused (`at-top-level`, Outdent2). Outdent2
  redrawn (now `free-form`: a node stops being an item at its depth), DirectOutdent5,
  DirectOutdent6, LogicalOutdent6; outdent.md rule 5. In the differential, 7,700 runs that were
  refused apply; 89 now refused `not-expressible` are empty items with the caret off their line (an
  empty paragraph exists only under the caret).
- **Logical outdent at the top level is in place too** (triage question 3), there being no parent to
  keep the later items with. It moved the item past its later siblings, a paragraph after the list
  (`- a┃⏎- b` gave `- b⏎⏎a┃`). RemNote, the one `logical` app with paragraphs, unwraps in place, its
  later siblings its list; the other logical apps (Roam, Athens, WorkFlowy, Dynalist, Tana) hold no
  paragraphs and do nothing at the top level, nor does Outliner. Refusing, their way, would leave a
  dead key where any top-level item outdents (above). LogicalOutdent2, LogicalOutdent3,
  LogicalOutdent6 and Outdent17b redrawn, each now its direct twin; the option's doc. First built for
  a paragraph's list too, and taken back after the SxS run: there the paragraph is the item's parent,
  and eight block-outliner setups (Athens, Dynalist, Logseq, Logseq DB, RemNote with bullets, Roam,
  Tana, WorkFlowy) agreed with "past the rest" on LogicalOutdent4, which keeps it (RemNote without
  bullets makes it in place).
- **A paragraph right after a list indents to the list's next item**, one level in as Tab is anywhere
  (Indent22), in the list's marker (an ordered list's next number); the blank line above it goes in a
  tight list (gaps.md's rule for a node that becomes a list's last item) and stays in a loose one;
  after a nested list it joins the top-level one; in a quote or an item's body the same. It was the
  last item's child item, two levels in (`- a⏎⏎para┃` gave `- a⏎  - para┃`), so Outdent2's round trip
  didn't come back (`- a⏎- b┃`, outdent, indent: `- a⏎  - b┃`). The user: a child is
  counterintuitive, a sibling or a body paragraph both fine; built: the sibling. Where the outdented
  item owned items after it (probe Z12, a middle item), indent carries them as its children
  (`- a⏎- b⏎  - c`), the direct-outdent exception Outdent13 states. Indent29 redrawn, Indent29b
  (ordered), Indent29c (after a nested list); indent.md rule 3, outdent.md rule 5, Outdent2's prose,
  gaps.md. The body paragraph is model C's reading (§3.13), not an option.

  | | Outdent2: `- a⏎- b┃`, outdent, then indent | Indent29: `- a⏎⏎para┃`, indent |
  | --- | --- | --- |
  | ourus before | `- a⏎⏎b┃`, then `- a⏎  - b┃` | `- a⏎  - para┃`, a child item |
  | RemNote | `- a⏎¶ b┃`, then `- a⏎- b┃` (Z12: `c` its child, then back) | `- a⏎- para┃`, a sibling |
  | SiYuan | `- a⏎¶ b┃`, then a tab typed | a tab typed |
  | BlockNote | nothing | `- a⏎  ¶ para┃`, a child paragraph |
  | bare Obsidian, Live Preview, Outliner | nothing (then an item indented, `- a⏎  - b┃`) | `- a⏎⏎  para┃`, a body paragraph |
  | true-outliner | the same | `- a⏎⏎  - para┃`, a child item |
  | SilverBullet, Emacs | the same | nothing |

  RemNote is consistent with itself: it indents a paragraph to an item at the level of the list above
  it (Indent22's one level, after a list too), so its round trips come back; everyone else who acts on
  Indent29 puts the paragraph under `a`, as a body paragraph (BlockNote, bare Obsidian) or a child item
  (true-outliner, ourus before).
  Against the parent commit's code on the same corpus: outdent-then-indent round trips that change the
  tree 2606 → 1737 runs, indent-then-outdent 148 → 62, the rest moved to finer differences (a logical
  outdent's item stays moved, a loose list's blank line by the seam rule, a bullet item rejoining an
  ordered list above as `2.`). On the SxS, Indent29 and Outdent2 agree with RemNote now; on
  Indent29b RemNote makes a bullet item, and Logseq, Tine and WorkFlowy (as blocks) the last item's
  child.

### 3.9 Blank lines a command leaves: decision 19's reach

Decision 19 (11-spec §4): a blank line a command leaves that no longer separates anything goes. It
applied to a node that becomes the first item of a tight list; the review asked it to reach moves and
joins, so that round trips give the text back.

- **Built: a node that becomes a tight list's last item** has no blank lines above it: a node that was
  right after a tight list, set off by blank lines, and becomes its last item (a paragraph or block
  indented under it, an item indented back into a paragraph's list, an item moved or outdented into a
  quote's list, or out of a quote after a list). They separated it from the list and would make it
  loose. Conditions (`joinsList` in `seam`): the node itself arrived or was converted, the item
  before it stayed, the list is tight and of the same kind; a loose list keeps them. Delete17,
  MoveUp7, MoveUp21, Outdent8 and Paste20's outdent-then-indent come back; Quote18 and Quote20
  redrawn (they had drawn the loose list); gaps.md. The cost: in a list loose only between some items
  (`- a⏎  - a1⏎⏎- b⏎- c`), indenting `b` and outdenting it back loses that blank line. A first
  version also fired where two lists merged after an indent, and added a blank line in a list loose
  only inside an item: both found by replaying the differential's changed runs with the rule toggled,
  and excluded.
- **Joins and moves: left as they are**, the user's call ("These seem like rather edge cases, and I
  don't want to pay with code complexity to support it"). Guarantee 5 states the exception; the
  inverse test's baseline holds the counts. On the spec's start buffers, Enter then Backspace adds a
  blank line on 62 and removes one on 15; Shift-Enter then Backspace 42 and 13; a move up then down
  31 and 19; down then up 28 and 17.
- **Why no stateless rule gives them back: the same bytes come from two starts.** Enter at `a⏎# ┃H1`
  and at `a⏎⏎# ┃H1` both write `a⏎⏎┃◌⏎⏎# H1` (the new paragraph needs a blank line above, or it
  would be `a`'s second line, and ourus writes one below too); a move of `text` up out of
  `a⏎# H1⏎text` and out of `a⏎⏎# H1⏎text` both give `a⏎⏎text⏎# H1`. Keeping the blank line (today)
  gives the second start back; dropping it, decision 19 as worded, gives the first and deletes the
  second's authored blank line before a heading, the commonest spacing there is: rejected. In the gap
  model (gaps.md) each node owns the gap after it and a removed node takes its own, so the blank line
  Enter needs between `a` and the new paragraph is `a`'s and stays.
- **The design, if the round trips come to matter**:
  - *Rule 1, putting a node in*: a command putting X between A and B writes above and below X the
    blank lines that were between A and B, more on a side only where Markdown needs more there. Enter
    at `a⏎# ┃H1` writes `a⏎⏎┃◌⏎# H1` (above, 0 raised to 1; below, 0 kept: a heading needs none
    above it), at `a⏎⏎# ┃H1` `a⏎⏎┃◌⏎⏎# H1`. A heading split keeps a blank line under the title where
    the text below had one.
  - *Rule 2, taking a node out*: a command taking X out from between A and B writes the fewer of X's
    two gaps, more only where A and B, side by side, need more: from `a⏎⏎┃◌⏎# H1`, 0 (`a┃⏎# H1`);
    from `a⏎⏎┃◌⏎⏎# H1`, 1. For Backspace, Delete, the caret leaving a held paragraph, a move away,
    `deleteSubtree`.
  - Together, an insert writes what its removal reads back: worked by hand on Enter and Shift-Enter at
    a heading's or a paragraph's text start and a heading split, each then Backspace, every one came
    back. The cost seen: after Enter from `a⏎# H1` the held paragraph has no blank line under it. Rule
    1 alone changes nothing on the way back; rule 2 alone deletes B's blank line. Rule 2 tried alone
    in `seam` made moves worse (round trips losing a blank line 19 → 24 buffers) and broke Gap4, Gap5
    and Quote54, since gaps.md's rules (a node's gap travels with it, a removed node takes its own)
    are the other half; reverted.
  - *Moves* need a rule of their own. As a removal then an insert, `a⏎# H1⏎text` up then down comes
    back, but `# Title⏎⏎more` up (`more┃⏎# Title`) then down loses the blank line under the title (a
    removal at the document's top writes none). A candidate: a move swaps a node with its neighbour,
    the blank lines between the two staying between them (SilverBullet's G7, below), the seams
    outside following rules 1 and 2; to be checked on every move case; same-bytes histories exist for
    moves too.
  - The options weighed: (1) leave it, taken; (2) rules 1 and 2 for inserts and removals, about a
    session (Enter's planners that write their text directly in `enter.ts`: a text start, a heading or
    callout split, a table's end, `insertBefore`; the removals in `join.ts`: `dropEmptyParagraph`, the
    empty paragraph's path; `settle.ts`; `seam`; gaps.md rewritten; 40 to 80 drawings), two gap models
    side by side until moves follow; (3) the same and moves, two sessions or more, the move half
    undesigned (gaps.md's move rules, Gap1 to Gap14, some 80 move cases). Whether (3) would simplify
    the code wasn't shown: today's gap logic (some 30 branches in `seam`, some 30 direct blank-line
    writes in the commands) encodes real Markdown needs that a new model has to reproduce. If taken:
    a one-session prototype of rules 1 and 2 plus the swap rule in `seam` behind a switch, measured by
    the inverse test and the differential, before any redraw.
- **The evidence** (eight probes, `sxs/probe.ts all --file=gaps.md`). The block apps show only the
  outline (BlockNote, RemNote and SiYuan agree with ourus's in every move; the pure outliners skip
  these, headings and paragraphs being free-form), so the blank lines are the six text apps', which
  are line editors:

  | probe | ourus | text apps |
  | --- | --- | --- |
  | G1, G2: Enter at a heading's start, then Backspace, from `a⏎# ┃H1` and from `a⏎⏎# ┃H1` (G3: Shift-Enter the same) | a blank line more from the first, the second back | both back: bare Obsidian, Live Preview, Outliner, SilverBullet split the line (`a⏎# ⏎┃H1`), true-outliner opens `# ┃` above; their Enter writes no blank line, so the two starts stay apart (rule 1 in practice). BlockNote and SiYuan put an empty block above, the caret staying in the heading, so their Backspace takes the `#`s |
  | G4: under `stay`, Enter at `a⏎⏎┃b`, then Backspace | glued, `a┃b` (fixed since: §3.3) | one line break back: bare Obsidian, Live Preview, Outliner, SilverBullet |
  | G5, G6: `text` moved up out of `a⏎# H1⏎text` and down again; the same after `a⏎⏎` | a blank line more from the first, the second back | bare Obsidian, Live Preview, SilverBullet swap lines and come back (`text` is `a`'s line meanwhile, which ourus doesn't allow); the outliner plugins don't move a paragraph |
  | G7: `# Title⏎⏎more` up and down | the blank line lost | every text app keeps it: SilverBullet between the two all along, bare Obsidian and Live Preview by swapping with the blank line; Outliner and true-outliner do nothing |
  | G8: an item past a list's blank line and back | back | every app that runs it agrees (the gap travels with the item) |

### 3.10 Smaller decisions

- **Delete before a heading peels it** (Delete13), the mirror of Backspace18, as SiYuan does: under
  `headingEditing: text` the title becomes a paragraph where it is, the caret staying, and a second
  Delete joins it glued; a setext underline the same (Delete13e was refused); an item whose text is a
  heading loses its `#`s first (Delete13g). The `#`s had joined the paragraph as text. Delete13,
  Delete13c, Delete13e, Delete13g, Delete14, Delete15 redrawn; delete.md rule 4; `headingEditing`'s
  doc.
- **An edit that would make a fence of code grows the block's fences**, as WorkFlowy and Tana write
  them, instead of refusing `not-expressible`: a join, Enter, Shift-Enter in code (Fence36, Fence37,
  Fence38, Fence39, Fence40, their buffers now in five-backtick blocks), and plain paste (the user, at
  the end review: grow rather than refuse; Paste91). A character at a time until the code reads as
  code; the fences stay longer once the line that needed it is gone (a stateless join can't know the
  length the user wrote); `$$` and `%%` can't grow, and still refuse. fences.md rule 7, paste-plain.md
  rule 1. On the SxS, Paste91 agrees with WorkFlowy; the text apps let the pasted fence close the
  block, Dynalist, SiYuan and Tana break it into blocks.
- **Undo after leaving an empty child** (Undo3) follows the apps: the edit that settles a placeholder
  the caret left joins the undo step before it (the player pushes no step of its own), so the first
  undo takes back the indent and the blank line together, as SiYuan, BlockNote, Outliner, bare
  Obsidian, Live Preview and SilverBullet do. undo.md's intro, placeholders.md's "Leaving it". The cm6
  demo keeps leaving as a step of its own, with a comment: CodeMirror's history joins nothing to an
  event once the selection has moved after it (the textarea and GTK demos have no history). Not
  taken: settling placeholders less eagerly (several held at once, settled on save), since Obsidian
  and most hosts save continuously and an unsettled empty line reads otherwise on disk (an empty item
  under text as a setext underline).
- **Tab and Shift-Tab on a blank line act on the node above** (Gap15, Gap16; left to the review): it
  is that node's gap, Gap14 does the same for moves, no outliner has a caret on a blank line, and
  refusing would leave the key dead while the host's Tab would start indented code. The cases say so
  now; bare Obsidian and Outliner indent the blank line.
- **Scenario23's escape stays** (Enter62, the user's call): Enter in `- Plan┃2. draft` (or
  `# Plan┃2. draft`) escapes `2\. draft`, and typing `revise ` before it leaves `revise 2\. draft`,
  where eleven apps end with `revise 2. draft` and none keeps the escape. The escape is needed at the
  split (guarantee 3): on its own line `2. draft` is an ordered list from 2 (only a list that
  interrupts a paragraph must start at 1). Probed (Z10 in an item, Z11 under a heading): bare
  Obsidian, Live Preview and Emacs put `┃2. draft` at column 0, an ordered list; Outliner,
  true-outliner and SilverBullet make an item holding an ordered list, Outliner and true-outliner with
  the caret after its marker, so what is typed goes into the new list item (`2. revise draft`,
  Scenario23's data); SiYuan makes an ordered item even in a block; ten block apps hold `2. draft` as
  a block's text, needing no escape. After typing, the escape escapes nothing, but `\.` renders as
  `.`, and for the text apps the difference is one byte. Dropping it would take escape tracking (the
  escapes ourus wrote this session, mapped through every edit as placeholders are, and a host call
  after typing, typing being the host's). Offered and not taken: the SxS comparing a backslash before
  punctuation mid-text as equal for block apps. Enter62, enter.md rule 10; Scenario23 unchanged.

### 3.11 Paste

- **Its own session**: structured paste is to be re-researched, refactored and redone in a session of
  its own (the paste-as-a-move idea of [`13-align.md`](13-align.md) §11 and §12; the SxS comparing
  under declared values, now done); no paste option changed. What it starts from is in §11.
- **`paste-plain.md`**: `pastePlain`'s 16 cases moved out of paste.md (that half was in better shape,
  and its defects were fixed with the rest), IDs kept, the `Paste` series shared (new ones from
  Paste82 on); its rules in order. paste.md keeps structured paste, including the plain lines it
  pastes under `pasteStructuredLines: text`, which test Ctrl-V.
- **A clipboard's leading line break** (the user: preserve it where we can, trim rather than refuse):
  it is Shift-Enter's at the caret, the rest pasted where that leaves it (Paste82); where Shift-Enter
  is refused, at a paragraph's text start, the leading breaks go and the rest is pasted there (Paste83
  redrawn, `x┃abc`; Paste83b, two breaks after a paragraph); a clipboard of line breaks alone is
  refused there and on an empty node (Paste84). A paragraph's first line can't be empty in Markdown,
  so "preserve" is impossible there, and every paragraph-capable app drops it:

  | where | ourus | Logseq, Logseq DB, Tine, Roam, Athens | BlockNote, RemNote, SiYuan, WorkFlowy | text apps |
  | --- | --- | --- | --- | --- |
  | mid-paragraph `ab┃c` (Z1), at its end (Z2) | a line break | a line break in the block | dropped, `abx┃c` | a line break |
  | two, mid-paragraph (Z4) | a paragraph break | two line breaks in the block | dropped | a paragraph break |
  | an item's text start `- ┃abc` (Z7) | `-⏎  x┃abc`, the item starting with a blank line | a line break in the block | dropped, `x┃abc`: the same block text as ourus's | `- ⏎x┃abc`, the item emptied, `xabc` out of the list |
  | a paragraph's text start (Paste83; after another paragraph, Z9; two breaks, Z3) | refused, now dropped | the block starts with an empty line, which ourus can't write | dropped | a blank line above, no line break in the text |
  | a heading's text start `# ┃Title` (Z5) | Shift-Enter's split: `x┃` held above `# Title` | not run | dropped into the title, `# x┃Title` | the heading emptied |
  | mid-title `# Ti┃tle` (Z6) | split, `# Ti` / `x┃tle` | | dropped, `# Tix┃tle` | split |

  After: Paste83 agrees with BlockNote, RemNote (both), SiYuan and WorkFlowy, where every app had
  disagreed; Logseq, Logseq DB, Tine, Roam and Athens differ only in whitespace. Paste83b agrees with
  BlockNote and SiYuan; RemNote makes `x` a child, the text apps keep blank lines above.
- **An empty task keeps its checkbox under a pasted item** (the user: fix it if easy): the first
  pasted item takes the task's place with its checkbox, unless it has one of its own; the items after
  it are as pasted (Paste92). A pasted heading or block still loses it (a heading can't follow a
  checkbox on its line; Paste72 puts a quote under it). Paste92 agrees with WorkFlowy and the four
  Obsidian setups; SiYuan gives every pasted item a checkbox, BlockNote drops it, Dynalist and Tana
  keep the empty task and paste after it.
- **A fenced block the clipboard leaves open is closed where the clipboard ends** (B55, Paste93). On
  the SxS every app closes it but Emacs, whose fence runs on into the text after; Tine and SiYuan
  agree exactly, Logseq and Tana but for the caret (after the closing fence), bare Obsidian, Live
  Preview, Outliner and SilverBullet close it but glue `x` onto `a`.

### 3.12 The session's calls, accepted

The user had the implementing session make its own calls and list them for a review at the end (no
questions in between). Accepted as they were:

- `markup: text | decorated` as the setting's name; `decorated` keeping ourus's old in-markup edits.
- Indent and outdent from a fence line keep the caret there under `text`; moves don't.
- Backspace at the code's start of an item whose text is a fence joins the item back (Fence31) rather
  than being refused; into an empty item above, the fenced item takes its place (Fence51).
- `$$` and `%%` follow code fences in Enter's split and Backspace's joins (Fence55, Fence56,
  Fence57); Backspace at a `$$` or `%%` right under text is refused, as at a code fence (the host's
  glued the fence to the text).
- Enter over a selection of everything leaves an empty paragraph, where Enter is refused: the key
  does nothing (the host's would replace the selection with a line break).
- In code, the indentation Enter carries is code, deleted as the host deletes code (guarantee 5).
- Enter and Shift-Enter over a selection that Backspace refuses to delete are refused too, as paste
  over one is (they were the host's line break).
- `enterOnEmptyItem: exit` as the value's name.
- Plain and structured paste still drop the spaces at a break they make (Paste68, code pasted
  mid-paragraph): the paste session's.

Decided otherwise at the review: the leading line break (§3.11), the paragraph right after an item's
text (§3.3), Outdent2's round trip (§3.8), decision 19's reach (§3.9), the longer fence for paste
(§3.10), Scenario23's escape (§3.10), the empty task's checkbox (§3.11).

### 3.13 Deferred

- **Not now** (low priority, the cases' prose saying why ourus does what it does): quotes, which
  block outliners don't have: Enter in a quote that is an item's first block (Quote73: Outliner,
  true-outliner, bare Obsidian and Live Preview make a new item, ourus a quoted paragraph), a quoted
  item outdented (Quote15: the text apps make a new top-level quote, ourus the parent's child,
  unquoted); Backspace on an empty first item (Backspace17: removed, as Tine and Tana do; Logseq,
  WorkFlowy, Dynalist and RemNote too, with the caret elsewhere; SiYuan, BlockNote and SilverBullet
  make an empty paragraph).
- **The model experiment** (the user's call, a future step): two questions about ownership, tried
  together as one switch in the parse before either is decided, then the spec, the differential and
  the SxS run again to count what moves.
  - *Does a list belong to the block before it?* A paragraph owns the list right after it (layer 3's
    rule 4, decision 9); a block of lines (code, math, a table) owns nothing (`z-open.md`'s Open2).
    The free-form block apps and SilverBullet move a paragraph without its list (MoveUp17,
    MoveDown24, MoveDown29: four of the five paragraph-capable apps that move it); only
    true-outliner carries it. A model switch (a paragraph, any block, or nothing owns the list after
    it), not a feel option: it touches moves, delete and duplicate, Enter at a paragraph's end, joins
    and guarantee 4.
  - *Model C: an item's body belongs to the item*, chosen by the user over A and B. An item's blocks
    after its text (a paragraph, code, a quote) are its content, like its continuation lines, not
    nodes of their own: a structural command from inside them (move, indent, outdent, delete and
    duplicate subtree) acts on the item, as from a continuation line (`- a⏎  con┃tinued` moves `a`).
    Today each body block is a child node: from inside one indent and outdent are refused, moves are
    refused at the item's edges, and delete and duplicate act on the block alone.

    ```
    today: Move Up refused     A: crosses (rejected)     B: swaps (rejected)       C (chosen)
    - x                        - x                       - x                       - a
    - a                                                  - pa┃ra
                                 pa┃ra                                               pa┃ra
      pa┃ra                    - a                         a                       - x
    ```

    A treats body blocks as child nodes that cross into the neighbouring item as items do, which
    carries an item's code into the previous item; B treats an item as a container of blocks like a
    quote, which swaps the item's own text out (`- [ ] a⏎⏎  para` would become the task `para`). C is
    what the outliners do: a WorkFlowy note, a Tana description and a Logseq block of several
    paragraphs move with their item, and none moves alone. The principle: inside a list the nodes
    are items and an item's body is its content; outside lists every block is a node. Under C the
    body can't be reordered against sub-items by a key (cut and paste does it), MoveDown36's
    same-parent swap disappears, Indent29's paragraph would become the item's body paragraph (bare
    Obsidian's and BlockNote's reading), and the SxS projection follows (§11).
- **Defaults against the outliners**, for presets (the nine block outliners counted, from the drivers'
  declarations and the data, at the review):

  | option | default | outliners with it | outliners with the other value |
  | --- | --- | --- | --- |
  | `outdent` | `direct` | Logseq, Logseq DB, Tine | `logical`: Roam, Athens, WorkFlowy, Dynalist, Tana, RemNote (and Outliner) |
  | `enterMidItem` | `sibling` | Roam, Athens, WorkFlowy, Dynalist | `child`: Logseq, Logseq DB, Tine, Tana, RemNote |
  | `joinWithChildren` | `join` | Tine, RemNote | `refuse`: Logseq, Logseq DB, Roam, Athens, WorkFlowy, Dynalist, Tana (§3.4) |
  | `emptyItemWithChildren` | `lift` | RemNote | `refuse`: the other eight (Backspace17b, §3.4) |
  | `pasteStructuredLines` | `text` | Logseq, Logseq DB, Tine | `items`: the other six |
  | `pasteStructuredMidText` | `split` | WorkFlowy, Dynalist | `after`: Logseq, Logseq DB, Tine, Roam, Athens |
  | `pasteStructuredOnParent` | `children` | Logseq, Logseq DB, Roam | `after`: Tine, WorkFlowy, Dynalist, Tana |
  | `enterOnEmptyItem` | `sibling` | seven | `outdent`: Roam, Athens |
  | `enterAtTextStart` | `into` | most | `stay`: RemNote |
  | `backspaceAtTopItem` | `unwrap` | none, forced: no outliner can make a paragraph | `refuse`: Logseq, Logseq DB, Roam, WorkFlowy, Tine, RemNote |
  | `enterSplitSpace` (later) | `trim` | Logseq, Logseq DB | `start`: Tine, Roam, Athens, Tana, Dynalist, WorkFlowy; `drop`: RemNote |

  Most of these defaults are the outliners' minority (the review counted five, its table joining the
  two join options in one row; `backspaceAtTopItem`'s is forced). `outdent: direct` was chosen as
  Logseq's for a text-first reason (it keeps the document's order, as bare Obsidian's line edit does); three
  of layer 1's four reference outliners and Outliner are `logical`. No default changed for this;
  `config.ts`'s header no longer says a default is "what nearly everyone gets" (§6.5).
- **Options not taken**: moves among siblings only (`moveAcrossParents: allow | refuse`: RemNote,
  both modes, never crosses a parent's edge, MoveUp6, MoveUp8, MoveDown7, MoveDown9, MoveDown10;
  every reference outliner crosses, as ourus does; BlockNote first steps out a level); the caret after
  a structured paste (`pasteStructuredCaret`: the end, the first block's start or end; Roam ends at the
  first pasted block in 14 cases, Paste2, Paste13b, Paste15c, Paste16, Paste17c, Paste18, Paste19,
  Paste20, Paste21, Paste27, Paste38b, Paste39, Paste59, Paste60, where ourus ends at the last; Athens
  often at the first block's start): the paste session's; a new child list's form (`indentNewList:
  source | bullet`: indenting `2. b` where `a` has no children gives a numbered child in ourus, a
  bulleted one in Roam, Dynalist and Tana; with numbered children there, Indent5, all three adopt
  them; in Roam and Dynalist numbering is the parent's view property, so this is their model);
  `taskEditing`'s further values and a rename for what it is, Backspace right after a checkbox
  (working name `backspaceAtCheckbox`), once its variants are measured whole (Tana peels, Obsidian
  deletes a character, true-outliner joins as `block`; WorkFlowy's and Dynalist's non-empty tasks fit
  no value yet).
- **Presets**: proposed twice and never built (06-impl's next steps, 11-spec §11). The drivers'
  `behaves` blocks look like presets but are hypotheses: several declarations were wrong, or fit one
  shape of a camp that depends on depth or kind. Now that the SxS judges an app under its declared
  values (§8.1): publish scoped profiles with their residual mismatches stated, as data shared by the
  config and the SxS; no generic "outliner consensus" profile assembled from per-option majorities,
  which no editor may behave like, unless designed deliberately under a task-oriented name.
- **Commands, not options**: some disagreements are other operations. WorkFlowy's Shift-Enter opens
  the item's note field, Tana's inserts a node without splitting (about 30 of shift-enter.md's
  disagreements); moving a heading's line without its section, as the flat apps do, isn't a
  `moveSubtree`. An "insert a sibling without splitting" command, and a note field as a host design,
  would serve those users; a switch would only imitate a picture of them.

## 4. Bugs

Every bug found, how (R the review, both reviews reproducing it; P probing while implementing; D the
differential; V the inverse pairs; X the SxS, a rerun or the triage; U the user), and where it was
fixed. A fix's mechanism is in §5, by file. The spec's own problems (cases against their prose, flows,
claims about apps) are §6's.

### 4.1 Crashes and the empty document

- **B1** (R, P) Every structural command threw on an empty document (`''`), not only structured
  paste, as the review found it: a `TypeError` in `gapOwner` (`src/commands/context.ts`), reading
  `.blank` of a line `doc.lines` doesn't have, and `noOperands`. → refused `nothing-above`, a paste
  the host's (§5.1); an API test from `''`, `⏎` and `┃◌⏎`.
- **B2** (R) Frontmatter pasted into an empty note isn't frontmatter: from the state an empty note has
  with the caret in it, a held empty paragraph (`┃◌`), structured paste in the Obsidian flavor gives
  `⏎---⏎title: x┃⏎---`, a thematic break and a setext heading, though paste.md says pasted frontmatter
  is frontmatter at a document's start; from a bare `⏎` it is `notApplicable`. The placeholder changes
  what runs, so its test needs the whole editor state. → open, the paste session.

### 4.2 Keys inside markup

- **B3** (R) Enter in a checkbox (`- [┃ ] task`, `- [ ┃] task`, `- [x┃] done`) split it,
  `- [⏎- [ ] ┃] task`, under either `editInMarkup`. → at the text start (Enter54, Enter54b; §3.1).
- **B4** (R) Shift-Enter there gave `- [⏎  ┃] task`. → the host's under `text`, at the text start
  under `decorated` (ShiftEnter26, ShiftEnter26b).
- **B5** (R) Backspace inside a checkbox: on the first item `- [ ┃] task` gave `┃[ ] task`, the
  marker gone and the brackets a paragraph's text (`x` then gave `x[ ] task`); on a later one,
  `- a⏎- [ ┃] task` joined into `a`, the checkbox dropped. → a character edit under both values
  (`checkboxCharacter`, §5.4; TaskBackspace8, TaskBackspace9, TaskDelete4).
- **B6** (R) Enter in a heading's `#`s (`┃# Title`, `#┃ Title`) left a bare blank line above (after
  `p⏎⏎`, a third) and the caret in the `#`s, where Backspace then stripped the heading. → at the text
  start (Enter55, Enter55b).
- **B7** (R) Fence12: Enter at the start of an item's opening fence (`- a⏎  ┃```…`) put a blank line
  above and left the caret on the fence, where typing `x` unmakes the block; `stay`'s line even under
  `into`. → the item splits (§3.7; `splitAtFence`).
- **B8** (R) Fence30: Delete on an empty last code line left the caret before the closing fence,
  where typing unmakes the block and an item's paragraph below becomes code. → the caret goes to the
  end of the code above.
- **B9** (R) Fence31 (Enter at an opening fence, then Backspace) and Fence32 (Shift-Enter after a
  closing fence, then Backspace) gave the caret back on the fence, where typing gives ```` ```x ````.
  → allowed where markup is text (§3.1); Fence31 redrawn (Backspace at the code's start joins the
  item back), Fence32b under `decorated`.
- **B10** (R) The caret test exempted Enter, Shift-Enter, Backspace and Delete from its fence check,
  by an explicit comment: why B7, B8 and B9 passed. → the test runs every case under both `markup`
  values (§7.1).
- **B11** (P) Structured and plain paste into an empty task with the caret in or before its checkbox
  wrote the text inside the checkbox (`encoding-failed`), hidden under `text`, where a refusal in
  markup is the host's. → the text goes after the checkbox (§5.6).
- **B12** (D) Any refusal with the caret in markup became `notApplicable` under `text`, encoding
  failures included, so only the differential's `decorated` runs showed them; once this stopped,
  about a dozen old failures came out (B13 among them). → an encoding failure is never the host's
  (`inMarkup`, §5.1).
- **B13** (D) `gapBelowHeading`, `runsInto` and `joinItemHeading` asked whether a line interrupts a
  paragraph after trimming it, so indented code read as a list item that interrupts; a heading
  joined by Backspace under `headingEditing: block` ran its indented code into the paragraph
  (`encoding-failed`). → `interrupts`, never from four columns in (§5.2).
- **B14** (P) The held space a deleted first character leaves (`- a┃ x`, Backspace) was markup to the
  dispatch, so under `text` Backspace, Shift-Enter and Delete there were the host's: Backspace deleted
  the marker's padding, Shift-Enter left an empty item. → partly: `inMarkupAt` counts a held space
  as the text's start, so the dispatch no longer hands those keys over; two other paths still do,
  under `text` (B52, open).

### 4.3 Host fallbacks and selections

- **B15** (R) Backspace at an indented code line's start (`para⏎⏎    a⏎    ┃code`) was left to the
  host, which deleted one space of the indentation: `   ┃code` was a paragraph. fences.md's rule 9
  said such lines join. → `joinIndentedCode` (Fence52, Fence53, Fence54).
- **B16** (P) Delete at an indented code line's end joined the next keeping its four columns as text
  (`····a····code`). → the same.
- **B17** (R) Backspace after Enter at a `$$` or `%%` fence's start, in an item or a quote, was the
  host's, which deleted the container's indentation (`- Euler:⏎  ┃$$⏎…`, Enter, Backspace: ` ┃$$`,
  the block out of the item) or the `>`'s space (`>┃%%`), where fenced code takes the line back. → as
  at a code fence (Fence55, Fence57).
- **B18** (P) Backspace at the `$$` or `%%` of an item whose text is a math or comment block was the
  host's, unmaking the item. → it joins the item above (Fence56).
- **B19** (R) Enter and Shift-Enter over a selection across nodes were the host's (enter.md's old
  rule 2): `- a«bc⏎- de»f` gave `- a⏎┃f`, the second item gone and `f` a lazy line of `a`. Backspace
  and Delete did such a selection themselves. → deleted first, then the key at the caret
  (`overSelection`; Enter56, Enter56b, ShiftEnter27).
- **B20** (R) Plain paste over a selection across a node's continuation lines wrote the clipboard
  raw: `- a«bc⏎  de»f` with `x⏎- y` gave `- ax⏎- y┃f`, a new item; with `x⏎# y` a heading that ended
  the list; in a quote the pasted lines left it (across two items it worked). → `overSelection`
  (Paste85, Paste85b). Structured paste's same shape: open, the paste session.
- **B21** (P) Enter with a selection starting at a paragraph's text start (`> «q»uote`) failed to
  encode (an empty first half). → `overSelection` for any selection but one within a line that isn't
  all text, which the command plans itself (Quote79's split `[!type]`); Enter59.
- **B22** (R) A contract to state rather than a bug: Enter in code carries the line's indentation,
  and Backspace there is the host's, which deletes one space of it (`  abc┃`, Enter, Backspace: a
  line of one space). → guarantee 5: the carried indentation is code, deleted as the host deletes
  code, maybe in more than one press (Fence1).

### 4.4 Text lost

- **B23** (R) A hard break pasted on an empty item lost its spaces: plain paste of `a␠␠⏎b` into `- ┃`
  or `- [ ] ┃` gave `- a⏎  b` (the empty-item path trimmed the first line; into `- ┃z` they stayed).
  → kept (Paste86).
- **B24** (R) U+00A0 taken for Markdown whitespace: plain paste of `x⏎⍽y` lost it; a line of only `⍽`
  (`x⏎⍽⏎y`) became a paragraph break; Enter on a last item whose text is `⍽` left the list as from an
  empty item, the character lost; a code line of only `⍽` was deleted as empty by Backspace or Delete
  at a fence (`emptyCode`'s `.trim()` in `code.ts`; the check after a closing fence the same). To
  CommonMark (0.31.2) a blank line holds only spaces and tabs, and a paragraph's content is stripped
  of those alone; Unicode whitespace matters only to emphasis. Narrow NBSP the same. → `trimMd*`
  (§5.2; Paste87, Paste87b, Enter58, Fence58).
- **B25** (R) Mixed line endings: indenting `a␍⏎b⏎` gave `- a⏎  b⏎`, the CR gone, and outdent didn't
  bring it back (uniform CRLF documents kept theirs). → a node made anew keeps its lines' endings
  (`writeLines`' `was`; Indent32).

### 4.5 The caret and the operand

- **B26** (R) Commands from the document's end or a blank line lost the operand: from the true end of
  `- one⏎- two⏎┃`, Move Up moved `two` and put the caret in `one`, after which Move Down was refused;
  from a trailing blank line (`- one⏎- two⏎┃⏎`) the caret stayed on it; Move Down from a blank line at
  a list's end moved the item past the paragraph and left the caret in a gap that was now `a`'s, so a
  second press moved `a`; indent from the end left the caret there. After a structural command the
  caret belongs in the moved node's text, as after one from markup (MoveUp34); Gap14's drawing (the
  caret moving with the gap) holds only where the gap moves. → `fromGap` (MoveUp39, MoveDown38, an
  API test for the true end; gaps.md's intro).
- **B27** (R) Enter at the start of the document's first paragraph or heading, then Backspace, did
  nothing (`notApplicable`: the held paragraph above couldn't be taken back), where an empty first
  item can (Backspace17); 152 of the spec's start buffers have the shape. → `dropEmptyParagraph`
  (Backspace43, Backspace43b).
- **B28** (R) Enter at a quote's first line, then Backspace, left `> ┃⏎>⏎> q`: the held paragraph
  gone, two blank quoted lines left. → the same (Quote89).
- **B29** (R) Enter after a closing fence that ends a quote made an empty `> ` line without a
  placeholder; when the caret left, a stray `>` stayed (guarantee 8). → an empty paragraph after the
  block, held by a placeholder, set off from text below that would continue or underline it (Fence59,
  Fence59b, Quote90; Fence7d redrawn; `runsOnto`).
- **B30** (X) Under `enterAtTextStart: stay`, Enter at the document's first paragraph, then
  Backspace, was refused `nothing-above`: Enter leaves `⏎┃para`, and nothing took the blank line
  back. → Backspace at the first paragraph with only blank lines above deletes them (Backspace43c;
  Backspace43 now agrees with bare Obsidian, Live Preview, Outliner and SilverBullet).

### 4.6 Blank lines

- **B31** (R) An empty item removed from a loose list left two blank lines where there was one:
  `- a⏎⏎- ┃⏎⏎- b` Backspace gave `- a┃⏎⏎⏎- b` (Delete the same; Enter36b's quoted list too);
  true-outliner leaves one. → the item takes its gap (`emptyItemLines`; Backspace44, Backspace44b,
  Delete30, Enter36b's inverse step).
- **B32** (R) Moving a list's last item down past a paragraph doubled a gap of several blank lines:
  `- a⏎- b┃⏎⏎⏎⏎para` gave three blank lines after `a` and three before `b`, both of gaps.md's rules
  applied at once (the scope-end gap stays; the nodes swap around the gap between them). → the closing
  gap once (`seam`; MoveDown39; MoveDown38, which had drawn the doubled gap, redrawn).
- **B33** (V) A quoted blank line inside a moved item (`  >`) kept its old columns, ending the quote.
  → `emitGap` rewrites an old blank line whose `>` columns change, not only its count (Quote92).
- **B34** (U) Paste into a tight list failed to encode, reported from the cm6 demo: its code block,
  table, callout and quote pasted into an empty item, in every flavor. `allTight` (`paste.ts`) zeroes
  every gap in a tight list, so two quotes, two paragraphs, or an item's text and a body paragraph ran
  into one block; the comment promised a blank line "where Markdown needs one", but a seam within new
  text was no pad candidate. → `seam`'s `within` (Paste90, two quotes at an item's end; Paste90b, an
  item with two paragraphs); about 150 structured-paste runs apply now.
- **B35** (P) Fence12's split, then Backspace, after a body paragraph (`- a⏎⏎  para⏎⏎  ┃```…`) loses
  the blank line between `para` and the code. → open.

### 4.7 Escapes: text that would read as a block

- **B36** (P) Shift-Enter and Enter on a continuation line after a lone `-` or `#` failed to encode
  (the first half ended as a setext underline, or an empty heading). → `continuationEscape`, and
  `continuationUnescape` in the joins back (ShiftEnter28, Enter57).
- **B37** (R) A split setext title, joined back, kept its escape mid-line: `title┃ - x⏎===` Enter,
  Backspace gave `title┃\- x⏎===`, where a paragraph's and an item's joins drop it (`para┃- x`,
  `- a┃- x`; Enter43, ShiftEnter20). → joins into a heading's title, ATX or setext, drop the escape a
  split wrote at the joined line's start (Enter60, Enter60b).
- **B38** (P) A setext title's start wasn't escaped where it would read as a link reference
  definition, as a paragraph's is. → `paragraphText`.
- **B39** (V) A heading's closing `#`s went into the paragraph Enter split off, so the join back read
  them as closing. → they stay on the title's line (Enter61; enter.md rule 9).
- **B40** (V) The checkbox peel (Backspace after it; Delete before it under `decorated`) left `# x` or
  `1. x` at the item's text start. → escaped (TaskBackspace10; tasks.md rule 2).
- **B41** (V) Shift-Enter at the end of `[a]:` left a held line that, read as typed on, made the text
  a link reference definition (`encoding-failed`; the inverse test's first run). → the break escapes
  it, and Backspace drops the escape; the held line counts as typed on in `referenceFix`'s check
  too (ShiftEnter31; shift-enter.md rule 5).
- **B42** (X) Under `taskEditing: block`, the first task's unwrap kept its checkbox as text
  (`- [ ] ┃x` Backspace gave `┃[ ] x`), where a join into the node above drops it (TaskBackspace4). →
  the checkbox goes with the marker, in every flavor, the text escaped where it would start a block
  (`unwrapItem`; TaskBackspace11). SoftBackspace1's second Cmd-Backspace agrees with true-outliner now.
- **B43** (D) GFM tables after an item's text (`- [ ] t1⏎| a | b |⏎|---|---|`): outdent made the
  item a paragraph, its lazy lines its own lines, where the delimiter row makes a table (as a lazy
  `===` would make a setext heading), and the plan failed to encode: with GFM the default, 464 of the
  differential's 506 outdent failures, in 24 documents. The parser was right: micromark and
  markdown-it read the rows as lazy lines of the item's paragraph too (marked alone makes a table); a
  table takes over only a paragraph's own last line. → `converted` escapes a lazy line where, no
  longer lazy, it would start a block (`\|---|---|`, `\===`; escaping the header row doesn't stop the
  table, the delimiter row's first character does, checked in micromark, markdown-it and ourus), in
  every flavor; indent gives the item back with the escape, which it needs there (Outdent20,
  Outdent20b; outdent.md rule 5), a round trip the inverse baseline holds as `text`. 659 runs failing
  to encode → 198 (outdent's 502 → 45).

### 4.8 Quotes

- **B44** (D) In a quote written without its space (`>- a`), every continuation line ourus wrote in
  its item was a column short, the quote taking the item's first space as its own: `>  b` read as lazy
  at best; at the text start, `-⏎>  a` put `a` out of the item (`encoding-failed`); a paragraph break
  pasted out of the item. → `> ` written before indentation (`continuation()`, `itemContinuation()`;
  Quote91, Quote91b; quotes.md's intro).
- **B45** (P) Backspace's peel of a quoted heading wrote a bare blank line, which ended the quote
  (`encoding-failed`). → `unwrapHeading` (Quote93).

### 4.9 Placeholders and held spaces

- **B46** (D) Deleting an item's first character before text that, right after the marker, starts a
  block (`- a┃ ``` x`, `- a┃ # x`) was the host's and changed the text's block (code, a heading): no
  placeholder was kept, as `keptAt` compared only each node's depth and kind. → it compares the head's
  block type too, an emptied head counting as a paragraph so emptying an item still makes none
  (Placeholder17; placeholders.md's intro and table).
- **B47** (D) Leaving a held space whose removal would make the text a block, the settle deleted the
  item's text or kept the placeholder for good (102 Enter and structured paste runs over a selection
  ending before `1. x`, `---`, `> q`). → escaped (`- \``` x`, `1\. x`, `\---`, `\> q`).
- **B48** (D) Shift-Enter at the text start of an item whose first character was deleted, the space
  after it held (`- ◌ ┃``` x`): on its own line the text read as a fence. → escaped (ShiftEnter30;
  shift-enter.md rule 2).
- **B49** (P) Moving a held empty paragraph that follows a closing fence, or deleting it with
  `deleteSubtree`, failed to encode: its placeholder stayed at its old offset's mapping. → `heldIn`
  drops a moved or deleted node's placeholders from its old lines. And Backspace on a held empty
  paragraph right after a closing fence removes it with its line.
- **B50** (P) A space a placeholder holds as text wasn't the text's start for paste: plain paste
  there was refused "the caret is in markup" under `decorated` and was the host's raw paste under
  `text`; over a selection that leaves a held space, Enter, plain and structured paste were the host's
  (over 100 differential runs, which wrote `y ---` at column 0, a setext underline). → paste goes in
  before the held space, as typing does (Paste89; paste-plain.md rule 5), and those keys act.
- **B51** (V) Backspace on Fence59's held paragraph before a list that the paragraph owns didn't give
  the list back its place. → `joinCodeLines` (Fence60).
- **B52** (P; found wider when this note was checked) Under the default `markup: text`, a key at a
  held space can turn an item's literal text into structure. Deleting an item's first character
  before a space (`- a┃ # b`, Backspace) leaves `- ┃◌ # b`: the space held as text, so the item's
  text is still `# b` (leaving the line settles it as `- \# b`, right). But at that caret, the host's
  edit runs instead of ourus's:
  - Delete: `- ┃# b`, the item a heading; any item.
  - Backspace: the marker's space goes, `- # b`; Cmd-Backspace: ` # b`, a top-level heading; in an
    item with nothing above it (in a later one both join correctly, `- z┃ # b`).
  - Shift-Enter: `- ⏎ # b`, an empty item and a heading; any item (nested, the heading leaves the
    list).
  - With `` ``` x `` for `# b`, the text becomes code. Under `decorated`, the target: Delete,
    Backspace and Cmd-Backspace refuse, Shift-Enter gives `-⏎  ┃\# b`. The caret after the held space
    (`- ◌ ┃x`, ShiftEnter30) works.

  Repro: `npm run probe -- --outline '- a┃ # b' deleteContentBackward deleteContentForward` (add
  `--markup=decorated` to compare). Cause: `textStart` skips a held space, and two checks test the
  caret against it without `inMarkupAt`'s held-space exemption (B14, `commands/index.ts`): `lineBreak`
  (`enter.ts`) returns `notApplicable` itself, and `inMarkup` (`index.ts`) hands ourus's refusal to the
  host. Fix: the same exemption in both, ideally one shared helper; not `textStart` itself (tried and
  reverted: it moved Shift-Enter's and Backspace's caret onto a stray space). Cases first, per key, in
  a first and a later item, with `#` and `` ``` ``; none existed, and the differential and inverse
  test count a `notApplicable` as fine. To ask the user: Delete, and Backspace in a first item, could
  act instead of refusing (delete the space, unwrap, escaping as leaving does: `- ┃\# b`).
  → open, the next session's first task.

### 4.10 Blocks of lines, and items whose text is one

- **B53** (P) Backspace at the fence of an item whose text is fenced code with its own indentation
  (`- ┃```⏎····x`) failed to encode: the planned atom's text was trimmed as an item's; outdent of such
  an item the same (`converted`). → an atom's planned text is its lines as written, an item's trimmed
  (Fence49, Fence50); into an empty item above, the fenced item takes its place (Fence51).
- **B54** (P) `emptyAwayFromCaret` read a blank code line in an item's code as an empty line inside
  text, so an encoding failure there was reported as `not-expressible`. → it skips any node whose
  text is a block of lines, not only an atom: a planned node with a block type, an item whose head
  isn't a paragraph (its text code or a quote) (`src/commands/plan.ts`).
- **B55** (D) Structured paste of a clipboard that leaves a fenced block open (`x⏎```⏎y`) ran the
  block on into the text after the paste, an old bug the differential had never been given (the
  clipboard came with Paste91). → closed where the clipboard ends, as it reads there: fences, `$$`
  and `%%`, in items and quotes too (Paste93); 54 runs.

### 4.11 Plain paste

- **B56** (P) A clipboard starting with a line break failed to encode: `┃abc` with `⏎x`, `⏎` into
  `┃◌`, on an empty item, after a checkbox. → the break is Shift-Enter's at the caret, the rest
  pasted where that leaves it (`breakThenPaste`; Paste82, Paste84; the spec reader takes a clipboard
  of line breaks only, `|+`), and trimmed where Shift-Enter is refused (Paste83, Paste83b; §3.11).

### 4.12 Rules against a mirror or a sibling

- **B57** (R) Delete28 wasn't Backspace's mirror: `- a⏎- ┃⏎p` Delete gave `- a⏎⏎┃p`, while Backspace
  at `p` on the same boundary (`- a⏎- ⏎┃p`) gives `- a⏎- ┃p`, and delete.md defines Delete as
  Backspace from the other side; all nine apps with paragraphs give `- a⏎- ┃p`. → Delete28 redrawn,
  the paragraph joining into the empty item (delete.md rule 3).
- **B58** (R) A setext title was refused a second line for ATX's reason, "a heading is a single
  line", by Shift-Enter and plain paste in `Title┃more⏎---`, though Enter51, Backspace36 and
  Backspace37 handle setext titles of several lines, and `Title⏎┃more⏎---` is one heading to
  CommonMark and ourus. → ShiftEnter29, Paste88; the true-outliner file's S7 redrawn and renamed
  "Line break in setext title" (§3.6).
- **B59** (R) Backspace and Delete on the same empty item with several children make two trees
  (Backspace17c, Delete5b): Backspace lifts all the children, Delete absorbs the first, which keeps
  the rest. It follows from which node keeps its id; no case said so, and `lift` described only
  Backspace's. → kept, stated in both cases and `emptyItemWithChildren`'s doc (§3.4).
- **B60** (R) enter.md's rule 3 (an empty item) came before rule 4 (an empty item with children)
  without excluding it, so it took Enter21's case; the code did Enter21 right. → rule 3 qualified,
  "without children".

### 4.13 The split space under `start`

- **B61** (D) Cmd-Backspace through kept spaces: `deleteToTextStart`'s cut went negative
  (`encoding-failed`). → clamped.
- **B62** (D) Shift-Enter inside an item's kept spaces was refused. → it acts at their start.
- **B63** (X) A task's split under `start` moved its children a column right, where the kept space,
  following the checkbox, is in the text and the content column doesn't move. → `shiftedRight` counts
  no kept columns after a checkbox (TaskEnter10, from an unchecked task: from a checked one, Dynalist
  and WorkFlowy differ on which half keeps the check, another axis). TaskEnter7 agrees with Outliner
  and SilverBullet now.

### 4.14 The harness: tests, the SxS, tools

- **B64** (R) The player's host Backspace and Delete split surrogate pairs: `- a😀┃b` Backspace gave
  `- a\ud83d┃b`, malformed UTF-16, though its cursor motions stepped over pairs. → `charBefore`,
  `charAfter` in `test/player.ts`, a surrogate pair or a CRLF one character (Backspace46;
  backspace.md rule 9).
- **B65** (P) The differential's ratchet drifted: the spec's buffers took the flavors in turn by read
  order, and `delete.md` (renamed from `del.md`) sorts after `delete-subtree.md` (`-` before `.`), so
  the two files' flavors swapped and the corpus no longer matched its baseline. → a case without a
  flavor gets one from a hash of its ID (a case added or a file renamed changes no other case's), and
  the corpus hash is order-free.
- **B66** (P) The inverse test's corpus hash depended on read order (a renamed spec file changed it).
  → order-free.
- **B67** (V) The scratchpad inverse sweep skipped every pair whose first step didn't apply, and so
  missed two encoding failures on a first step (B41 among them). → `test:inverse` fails on any
  encoding failure or exception, first steps included.
- **B68** (P) The differential's configs still carried `editInMarkup`. → removed with `deleteAtGap`.
- **B69** (X) The SxS runner crashed on an app that skipped every selected case (`workersUsed` read
  before its declaration in `run.ts`), and the run called it failed. → "nothing to run", exit 0.
- **B70** (X) The SxS projection: a block's text, projected from ourus's drawing, didn't start where
  ourus's text starts, at a space a placeholder holds or at kept spaces (Enter65's first step was
  `whitespace` in every block app); and it kept a line-start escape after kept spaces (` \- x`
  against the apps' ` - x`: Enter60 `✗` for Tana, SiYuan and BlockNote under `start`). → `blockText`
  in `sxs/lib/block.ts`, given the case's options (`ProjectOptions.config`).
- **B71** (X) Logseq DB's one error, `MelangeError: Db_tx.Invalid_tx/1` on Enter57 (`p⏎#a`), every
  run, taken for the app's, was the harness's, as the user suspected. The driver's `load` used the DB
  version's `insert_batch_block`, which refuses any block with a tag (`- x #a`, `- #a`,
  `- x #[[a b]]`); `insert_block` and `update_block` take it. And a page reference read back as
  `[[uuid]]`, the database storing references by uuid in every text field. → `load` inserts a tagged
  block empty and writes it with `update_block`; the read gives a reference's name back (`#a`,
  `#[[a b]]` where the name has a space, `[[a]]`). Found with `OURUS_SXS_DEBUG=1` (an error's whole
  stack, naming `load` in `sxs/logseq/driver.ts`); probed in the page with a temporary hook. Logseq
  DB's full run: 0 errors, nothing worse, Enter57 agreeing; the carets it had lost after a paste,
  taken for the app's (Paste11, Paste25, Paste62, Paste70), agree now too. Notes in
  `sxs/logseq-db/README.md`.
- **B72** (X) Drivers erred on setups their app can't hold: U+00A0 (Emacs, through tmux, types it as
  its code, `302240`; SiYuan and Tana hold a space) in Enter58, Fence58; a character outside the
  Basic Multilingual Plane (Emacs types its code, `360237230200`; Tana's caret lands elsewhere, UTF-16
  against code points) in Backspace46; a selection across a WorkFlowy item's name and its note,
  separate fields (`setStart` with an offset of 2^32 − 2) in Enter56b, Paste85; BlockNote's caret in a
  heading's `#`s, which BlockNote moves to the text start (Enter55, Enter55b); SiYuan's later line of
  a block's text starting with a list marker (Paste70: the meant `p⏎- g` it holds otherwise; the
  drawing escapes it, so meant and held looked the same). → each skipped in the driver's `holds`,
  saying why (`--list` shows them).
- **B73** (P) `npm run probe` was documented, but `package.json` had no such script. → added, with
  `npm run redraw`.
- **B74** (P) `npm run typecheck` failed on `findLast` in `sxs/obsidian/obsidian.ts`. → replaced.
- **B75** (P) A bulk redraw by line numbers from one parse, applied top down, overwrote four start
  buffers once (a shrinking buffer shifts every later write; repaired by hand); the redraw tool once
  redrew the pending Typing4. → `npm run redraw` writes bottom up and skips pending cases.
- **B76** (X) Roam failed once in a full run, its cause lost: a rejudge overwrites an app's `sxs.log`.
  → logs are copied by the run command since; `--rejudge` writing its log elsewhere is open.

## 5. Fixes

Where the code changed, by file: each mechanism, what it does, and the bugs (§4) and decisions (§3)
it serves.

### 5.1 Dispatch (`src/commands/index.ts`)

- **`inMarkupAt`, `HOST_IN_MARKUP`, `inMarkup`**: whether the caret is strictly inside markup, past its
  line's start and before its text: a marker or its padding, a checkbox, `#`s, a quote's `>`, a
  callout's `[!type]`, the containers' indentation; on a code line, only the containers' prefix; on
  an empty item, what follows the marker is its text; a held space and kept spaces are text. Under
  `markup: text`, the keys of `HOST_IN_MARKUP` (Shift-Enter, Backspace, Delete, Cmd-Backspace) are the
  host's there, and so is a refusal, but never an encoding failure (§3.1; B12, B14). `inMarkup`'s
  refusal check and `lineBreak` test `textStart` instead, without the held-space exemption (B52).
- **`caretInText`**: under `decorated`, every applied command's caret goes where typing is safe; it
  was for structural commands only (§3.1).
- **`overSelection`**, generalizing paste's `pasteOverSelection`: Enter, Shift-Enter and plain paste
  over a selection across lines delete it as Backspace would, then act at the caret, as one edit;
  refused where Backspace refuses to delete it; a selection within one line that isn't all text is
  the command's own plan (Quote79); Enter over everything leaves an empty paragraph (B19, B20, B21;
  enter.md rule 2).
- **`breakThenPaste`**: a clipboard's leading line break is Shift-Enter's at the caret, the rest
  pasted where that leaves it, a one-line rest by `typedAt` (the host's paste of one line would take
  the whole clipboard, the break with it); where Shift-Enter is refused, the leading breaks go; a
  clipboard of breaks alone is refused there (B56; paste-plain.md rule 2).
- **`fromGap`**: a move, indent or outdent from a blank line or the document's end puts the caret in
  the moved node's text, unless its gap moved with it (B26).
- **The empty document**: structural commands refused `nothing-above`, a paste the host's (B1;
  `gapOwner`, `noOperands` in `context.ts`).

### 5.2 What reads as what (`context.ts`, `text.ts`)

- **`trimMd`, `trimMdStart`, `trimMdEnd`** (`src/text.ts`): Markdown's whitespace, spaces and tabs,
  replacing JavaScript's `trim` in `commands/`, `encoder/` and `outline/`, and `\s` in their regexes;
  the parser was right already (B24). The buffer notation draws U+00A0 as `⍽`.
- **`interrupts`**: whether a line would interrupt a paragraph, never from four columns in (B13).
- **`continuationEscape`, `continuationUnescape`**: a continuation line an edit ends (Enter's first
  half, Shift-Enter) is escaped where, ended there, it would read as a block (a lone `-` under the
  text above, a setext underline; a lone `#`); the join back drops the escape, in Backspace's line
  join, the item join and `joined()` (B36).
- **`runsOnto`**: whether text below an empty paragraph after a block would continue or underline it
  (B29).
- **`paragraphText`**: a setext title's start escaped as a paragraph's (B38).

### 5.3 Enter and Shift-Enter (`enter.ts`)

- In markup, Enter acts at the text start (B3, B6); under `stay`, at a heading's line start,
  `blankLineAbove` as at a paragraph's start, the heading whole, the caret to the title's start
  (`splitHeading`; §3.7).
- **The split space**: `splitSpaces` cuts by `enterSplitSpace`, for items, paragraphs, ATX and setext
  titles and callout titles (it replaced the review's `cutText` keeping); under `start`,
  `shiftedRight` moves an item's children as far right (no kept columns after a checkbox, B63),
  `escapeAfterSpaces` escapes a marker after kept spaces (items too, which used to hold the space
  instead), kept spaces are capped at three columns, and verification's placeholder retry holds them
  where the padding would read otherwise (a fallback to a `drop` split is there for what the retry
  can't hold) (§3.2). Shift-Enter's new line starts with the spaces at the break, after its
  indentation; spaces before a task's text are its checkbox's and go.
- **Shift-Enter**: an ATX title splits as with Enter; at an item's text start the line breaks after
  the marker, a blank line above where the bare marker would underline a paragraph line, the text
  escaped where on its own line it would start a block (§3.6; B48).
- **Enter28**: `insertBefore`'s `stay`, its placeholder at the line end dropped (a held space stays);
  the Enter28 path tests the node's own checkbox, not the new item's (`enterTask`) (§3.7).
- A heading's split keeps its closing `#`s on the title's line (B39).
- Enter at a closing fence's end outside an item makes an empty paragraph after the block (B29).
- `enterOnEmptyItem: exit` needed no code but its type; `enterTask: plain` makes every item from a
  task plain (§3.5).
- Code fences, `$$` and `%%`: `splitAtFence` (§5.5).

### 5.4 Backspace and Delete (`join.ts`)

- **`checkboxCharacter`**: a checkbox's character edited as text, under both `markup` values (B5).
- **`dropEmptyParagraph`**, shared with Delete: a held empty paragraph with nothing above it in its
  container goes, with its blank lines (B27, B28); one right after a closing fence goes with its line
  (B49).
- **`emptyItemLines`**: an empty item takes its gap with it or, last in its scope, the blank lines
  above it, its own gap staying to end the scope (B31).
- **`joinParagraphLines`, `joinParagraphAfterGap`**: paragraphs join in one press, glued, at the top
  level and in items; right after an item's own text only the blank lines go, quoted blank lines too,
  the caret before an escape the join writes (`\===` under the text would underline it) (§3.3).
  **`joinParagraph`**, before them: under `stay`, one blank line a press while more than one is
  there, quoted ones counted; the document's first paragraph with only blank lines above deletes
  them (B30).
- **The heading peel by Delete** runs Backspace's text-start join, the caret staying; a setext
  underline goes the same way; an item whose text is a heading loses its `#`s first. The old
  whole-line join (`#`s as text) and `joinItemHeading`'s `asText` are gone (§3.10). **`unwrapHeading`**
  writes a quoted heading's peel with a quoted blank line (B45).
- Delete on an empty item before a paragraph joins the paragraph into it (B57); joins into a heading's
  title drop a split's line-start escape (B37).
- **`joinWithChildren: refuse`**: `has-children` wherever the join brings the node's children up a
  level into its place; where `emptyItemWithChildren` applies too, either refuses (§3.4).
- **`unwrapItem`**: under `taskEditing: block`, the checkbox goes with the marker, recognized in every
  flavor as the join recognizes it (B42).
- **`deleteToTextStart`** (Cmd-Backspace): its cut clamped (B61); under `taskEditing: text`, from
  right after a checkbox, it deletes the checkbox to the marker, the text escaped where it would start
  a block (§3.5).
- **`spacesFrom`, `keptSpaces`, `ownTextFrom`**: joins take a placeholder's held space or the kept
  spaces with the text, in every paragraph join path and Delete's forward joins; inside them
  Backspace is a character's, the host's (§3.2).
- Backspace at the start of text alone on the line after its marker takes the break back with that
  blank line, in `join()` before the item path (§3.6).
- `deleteGap` removed with `deleteAtGap`.

### 5.5 Blocks of lines (`code.ts`)

- **`joinIndentedCode`**: indented code's lines join by Backspace and Delete, the four columns going
  with the line break; Backspace at its first line, after text, refused (B15, B16).
- **`atOpening`, `splitAtFence`, `joinFencedItem`**: `$$` and `%%` do what a code fence does: in an
  item Enter splits it and Backspace takes the split back, an item whose text is math joins up,
  elsewhere Backspace takes back the line Enter opened; at a `$$` or `%%` right under text Backspace
  is refused (B17, B18; Fence12, B7).
- An atom's planned text is its lines as written, an item's trimmed (B53); `emptyAwayFromCaret`
  (`plan.ts`) counts no blank line inside a block of lines as an empty line of text (B54).
- **`codeEdit`**: where every edit of code lines is verified; it grows the block's fences a character
  at a time until the code reads as code, for joins, Enter, Shift-Enter and plain paste (Fence36 to
  Fence40, Paste91); `$$` and `%%` can't grow and refuse (§3.10).
- `emptyCode` by `trimMd` (B24); **`joinCodeLines`** gives a held paragraph's list back (B51); Fence30's
  caret to the code's end (B8).

### 5.6 Paste (`paste.ts`)

- The empty-item path keeps a pasted hard break (B23); a caret in or before an empty task's checkbox
  pastes after it (B11); the first pasted item takes an empty task's place with its checkbox (§3.11).
- A fenced block the clipboard leaves open is closed (B55); `allTight`'s seams within new text are pad
  candidates (B34, §5.9).
- Plain paste's own refusal of a pasted closing fence is gone: `codeEdit` grows the fence (§3.10); a
  held space is the text's start (B50).

### 5.7 Structure (`structure.ts`)

- **`heldIn`**: a moved or deleted node's placeholders are dropped from its old lines (B49).
- **`outdent`**: the top-level refusal is gone: an item becomes a paragraph in place under both
  values, set off from the items above by a blank line, the items after it its list, an ordered list
  after it starting at 1; in a paragraph's list, logical still moves the item past the rest (§3.8).
- **`indentParagraphs`**: a paragraph right after a list becomes the list's next item (§3.8).
- **`converted`**: an atom's text recomputed (B53); lazy lines escaped where they would start a block
  (B43).
- **`would-reparent`**, a new `RejectReason`: `crossDown`'s heading refusals (a heading past a heading
  of another level, or another kind of node) and `keepsParents` (§6.2).

### 5.8 The outline, placeholders and settling (`src/outline/state.ts`, `settle.ts`)

- **`OutlineState.keptAt`**: the outline's shape is each node's depth, kind and head block type (B46).
- **`OutlineState.textStart`**: under `start`, an item's padding past the item above's
  (`extraPadding`), a paragraph's first line's leading spaces, and an item's text on the line after
  its marker, past its container's content start and under four columns, are text; `markupEnd` is the
  old text start (Markdown's), which `headRange` and `line.contentFrom` still give (§3.2).
- **`settle.ts`**: leaving a held space whose removal would start a block escapes the text (B47); the
  settle's edit joins the undo step before it (Undo3, §3.10). `start`'s `&#32;` version had changed
  both files (the settle writing `&#32;`, a checkbox allowed before a held space); its removal took
  those changes back.

### 5.9 The encoder (`src/encoder/`)

- **`seam`** (`seams.ts`), where blank lines between units are decided: a list's closing gap written
  once (B32); `joinsList`, a node becoming a tight list's last item (§3.9); `within`, a seam within
  new text that has no gap and could take one is a pad candidate (B34). Plan verification retries
  with the seams around new text first, as before, then those within it, then all, so a plan that
  verified before verifies the same way (with `all` first, duplicating a subtree padded an empty
  item's marker line: 76 runs).
- **`emitGap`** (`encoder.ts`): an old blank line is rewritten when its `>` columns change, not only
  its count (B33).
- **`continuation()`, `itemContinuation()`** (`prefix.ts`): a quote's `> ` before the indentation (B44).
- **`writeLines`' `was`** (`lines.ts`): a node made anew in an old one's place keeps its lines' endings
  (B25).

### 5.10 The config (`src/config.ts`)

- The options: `markup` for `editInMarkup`; `enterSplitSpace`, `joinWithChildren`, `enterTask`, the
  value `enterOnEmptyItem: exit`; `deleteAtGap` removed.
- **`CONFIG_VALUES`** lists each option's values, its default first, grouped by how much an option
  changes (how the text reads and is shown; the outline; Enter; Backspace and Delete; editing markup;
  structured paste); `CONFIG_DEFAULTS` is derived from it; the interface's members are in the same
  order. `test/config.test.ts` checks both, and that each doc lists its values, the default first.
- **`flavor: gfm` is the default** (the user's). The differential names the default flavor for its
  generated documents (else a copy from before, CommonMark by default, would read them otherwise);
  the SxS takes `Config.defaults.flavor` where a case names none (it used GFM already).
- The docs rewritten from the data (§6.5).

## 6. The spec's text

### 6.1 How claims about apps are written

Much of the prose was written by sessions with less, and noisier, SxS data. Claims are from the
current data, rechecked, naming the apps; no notes that only say every app agrees. Named always: bare
Obsidian and its Outliner plugin, Logseq (its two versions behave nearly alike: one name), Roam,
WorkFlowy and Dynalist; RemNote, Tana and SiYuan where they add something; the rest (Tine, Athens,
BlockNote, true-outliner, SilverBullet, Emacs) only with a good reason, such as being the only
evidence.

### 6.2 Cases that contradicted their own prose, rules or mirrors

| case | what was wrong | now |
| --- | --- | --- |
| Backspace12c | "several blank lines", one drawn, where its mirror Delete18c draws two; and it added a list | draws two; the list split off as Backspace12d |
| Delete28 | not Backspace's mirror | B57 |
| enter.md rules 3 and 4 | rule order | B60 |
| README, guarantee 5 | cited Enter51 for "a split at a line break joins back glued", where Enter51 played `undo`, never Backspace | Enter51 plays Backspace |
| Fence12 | the caret left on the fence | B7 |
| Fence15 | at a fence that is an item's text, Enter goes `into` even under `stay`; neither the case nor `config.ts` said the option is overridden | both say so: staying would leave the caret on the fence |
| MoveDown19, MoveDown25 | `no-next-sibling`, where MoveUp28, MoveUp33 and MoveDown17 said `not-expressible`, for the same rule | one reason, `would-reparent` (a move that would give another node a new parent): MoveDown17, MoveDown19, MoveDown25, MoveUp28, MoveUp33, Quote27 redrawn; the move files' rules; the commands README's table |
| Quote58 | the caret drawn before a callout's `[!note]`, Backspace deleting what follows it, where Backspace2 allows it and Quote57 puts the caret after the type | the caret after `[!note]` (§3.1) |
| Indent25, Outdent11, LogicalOutdent5, MoveUp21 | inverses that don't come back, unstated: setext indented and outdented comes back ATX; `## A` outdented takes `## B` into its section, so indenting back demotes `B` (Markdown forces it); MoveUp21 moved down again left a blank line | each draws the inverse step and says why (MoveUp21's outline comes back, the blank line staying above the list, as MoveUp36 allows) |
| MoveDown36 | `not-expressible` for a swap Markdown writes | open: model C makes it disappear (§3.13) |
| Paste46 | the second pasted code block set off by a blank line, making a one-item list loose (with an item after it ourus writes none) | open, the paste session |
| Paste58 | frontmatter pasted mid-document becomes a thematic break and a setext heading `title: x` that takes the next paragraph as its section; rule 1 says what can't be structure where it lands stays text, escaped (`pastePlain` gives `\---…`) | open, the paste session |

### 6.3 The flows

The spec's test checks that each core case is linked from a flow, not that the flow plays it.

- **Scenario7** cited Delete8 (mid-text Delete) and had none: it plays it now (Delete8, core, had no
  flow that played it). It types the trimmed space back in again (§3.2).
- **Scenario15** cited TaskEnter3 (an escape case) for "Enter on a task makes the next task" and
  TaskEnter1 (an empty task) where the checkbox was already gone, and all nine outliners skipped it for
  its last, free-form step: it cites TaskEnter8 and Enter5 and ends before leaving the list, which
  Scenario25 (`free-form`) does, so the outliners compare its task steps.
- **Scenario5, Scenario9** cited MoveDown29 (a paragraph owning consecutive lists) for "a parent moves
  past the other, its children with it": MoveDown1.
- **Scenario16** assumed typed text is one undo step, which apps don't share (it flipped for BlockNote
  and Roam between runs): it undoes the move, nothing typed in between.
- **Scenario18** was Paste1 again plus a typed `!`, its leading paragraph, which nothing needed,
  making it adapted in every block app: the paragraph is gone.
- **Scenario21** splits a paragraph and joins it back, now from both sides; **Scenario21b** beside it
  at a sentence boundary: they catch different failures (§3.3).
- **Scenario23** pinned an escape left by typing, inside a heading's section, with Shift-Enter and
  undo after it: isolated in Enter62 (§3.10); Scenario23 unchanged.
- Open: Paste7 and Paste10 (core, under the default `pasteStructuredLines: text`) are cited only by
  Scenario17, which plays `items`: no flow pastes with the defaults.

### 6.4 Prose the data contradicted

Rewritten by §6.1's rule against the rerun's data; the claims are the spec's now. What was corrected:

- **backspace.md**: Backspace17 (Roam ignores the key, SiYuan makes an empty paragraph; it had said
  Roam and BlockNote ignore it); Backspace17b (RemNote lifts as ourus does; it had said every
  outliner ignores the key).
- **delete.md**: Delete5, Delete5b say their tree differs from Backspace's (B59).
- **enter.md**: Enter7 (only the apps that can't make a paragraph make another item, not "the block
  apps"); Enter21 (bare Obsidian and Outliner remove the marker, SiYuan makes a paragraph owning the
  children); Enter25 (bare Obsidian moves the child to four columns; SilverBullet leaves three);
  Enter27 (no claim about bare Obsidian, which skips it); Enter29, Enter29b (the camps completed);
  Enter32 (no Roam, which never ran it; SiYuan keeps the caret in the heading; Tana agrees); Enter44.
- **tasks.md**: TaskEnter7 (which half the apps check).
- **fences.md**: Fence16, Fence31, Fence32 (bare Obsidian deletes the whole indentation unit, not one
  space); Fence18, Fence30, Fence34 (why the item's indentation isn't code, and that the text apps'
  results break the block); Fence42 (bare Obsidian keeps the column; only Outliner and true-outliner
  break the block on Enter).
- **quotes.md**: Quote53, Quote57 (bare Obsidian measured once `deleteAtGap` went: the space first,
  then the `>`); Quote15, Quote73 (the reason ourus does what it does; a stale "the blank line
  first"); the intro (Outliner doesn't reach into quotes: there it does what bare Obsidian does, or
  nothing).
- **gaps.md**: the intro's "two consequences" over four bullets; Gap15, Gap16 give their reason; the
  rule on blank lines that no longer separate anything (a tight list's last item too).
- **placeholders.md**: Placeholder9 (SilverBullet leaves `-  b`, whose padding makes `c` a sibling;
  bare Obsidian and Outliner re-indent `c`, rewriting a line the edit isn't about); Placeholder3
  points to Enter12 for why bare Obsidian's line break is departed from.
- **indent.md, outdent.md**: Indent3 (bare Obsidian's `b` is `a`'s child in a second list, not "a
  child of nothing"); Indent16 (Emacs and true-outliner do change a setext heading's level); Indent29
  (bare Obsidian makes a body paragraph); Outdent2.
- **move-subtree-up.md, move-subtree-down.md**: rule 1 in both (a move of everything in a quote moves
  the quote, not any node in a quote, as quotes.md had it); MoveUp7, MoveUp24 (no block app ran them;
  RemNote and BlockNote agree with ourus); MoveDown2 (bare Obsidian moves the line past the blank line
  only, which makes `para` a lazy line); MoveUp30, MoveDown35 (what bare Obsidian breaks).
- **obsidian-true-outliner.md**: "Joining an item with children" (the camps, §3.4; WorkFlowy never
  joins a child into its parent, and Tana refuses sibling joins with children); E4 (bare Obsidian
  splits the item as ourus does; WorkFlowy breaks the line); E10 (the outliners' agreement is forced;
  no paragraph-capable app does what ourus does; argued from Enter4's rule); S5 (the claim is TO's
  catalogue's: TO is skipped there); S7, S8 (TO now makes a new ATX heading below). Its
  "indent-unit-on-every-line" claim held.
- **Not done**: Quote48, Quote49, Quote50, Quote52, Quote54 could point to Backspace1's reason
  (optional); paste.md's claims (§11).
- **Not to carry forward** from 13-align (left as history): "no measured app lifts on Backspace17b"
  (RemNote does); Tine among the `emptyItemWithChildren` refusers (its driver no longer declares it);
  "Roam and true-outliner nest" Paste57's list (seven apps do); "every app ends the task" on
  TaskEnter5 and TaskEnter6 (WorkFlowy and Dynalist agree with ourus).

### 6.5 Option docs and declarations

`config.ts`'s docs rewritten against the data:

- **`enterAtTextStart`**: SiYuan is `into` only at items and stays at paragraphs and headings
  (Enter32, Enter33, Enter45), against "everywhere"; RemNote is `stay`; at a heading's start SiYuan
  and BlockNote put an empty block above and keep the heading whole, which neither value draws; Roam
  no longer cited at headings, never having run them; Fence15's override.
- **`enterOnEmptyItem`**: the camps (§3.5); Tine and Tana never outdent an empty last child (Enter5),
  against "a last child outdents either way".
- **`emptyItemWithChildren`**: `lift` described Backspace's result, not Delete5's absorption; Athens
  (declared), RemNote (lifts with both keys), Tana (refuses Backspace, lifts all on Delete), SiYuan
  (doesn't lift on Delete; an empty paragraph by Backspace).
- **`taskEditing`**: true-outliner is `block` (an empty task gone in one press, a task joined into the
  node above); WorkFlowy and Dynalist on an empty task; Tana, SiYuan, BlockNote named.
- **`backspaceAtTopItem`**: WorkFlowy, Tine and RemNote refuse at the first block (Backspace26);
  WorkFlowy's and Tine's drivers declare it now (decision 5 had named WorkFlowy).
- **The header**: a default is the behavior the spec argues for, not "what nearly everyone gets";
  some defaults are the block outliners' minority, chosen for Markdown's sake.
- The new options' docs (`markup`, `enterSplitSpace`, `enterOnEmptyItem: exit`, `enterTask`,
  `joinWithChildren`) were written from the data when made.
- Open: the paste options' docs (§11); Logseq DB inherits all of Logseq's declarations, unmeasured.

### 6.6 Files and the format

- **Files**: `paste-plain.md` (§3.11); `spec/del.md` renamed `spec/delete.md` (every link, and the
  stored results' `del.json` and case names with it); `internal.md` (Internal1 to Internal6, tag
  `internal`, its cases drawing `&#32;` and run by no SxS app) made for `start`'s first version and
  removed with it; Typing4 dropped (§3.1). "behaviour" spelled "behavior" everywhere (18 places, 11
  files, spec/README.md's title among them).
- **The format**: an `outline` block draws how a buffer reads, each node's kind, depth and text, for
  cases whose point is a reading (§7.1); `⍽` draws U+00A0 in buffers and clipboards (`test/drawing.ts`,
  the README's glyph table); a clipboard of line breaks only is `|+`, followed by an empty line for
  each; a buffer holding a four-backtick fence line goes in a five-backtick block.
- spec/README.md and `src/commands/README.md` point to the probe and to `npm run redraw`, and list the
  options as they are now.

## 7. Tests and tools

### 7.1 Tests

- **The caret test** (`test/spec.test.ts`), once per `markup` value: under `decorated` every case is
  played again with that value set over its config, and every applied command's caret checked, fences
  included; under `text` the structural commands' carets, indent and outdent from a fence line allowed
  to keep it there (B10).
- **API tests** (`test/commands/commands.test.ts`): every command from an empty document (`''`, `⏎`,
  `┃◌⏎`), in every flavor, with eight clipboards: no throw, no `encoding-failed`; a structural command
  from the document's end leaves the caret in the node it moved (B1, B26). The spec's format can't draw
  an empty document or one without a final line break.
- **`npm run test:inverse`** (`test/inverse.ts`): every inverse pair (Enter and Backspace, Shift-Enter
  and Backspace, indent and outdent, up and down, both ways) at every caret position of the spec's
  distinct start buffers, 58,662 runs on 595 buffers in about a second (worker threads,
  `INVERSE_WORKERS`). Only pairs whose first command applied count; the round trips that don't come
  back are grouped by pair and shape (`blank+`, `blank-`, `space`, `text`, `tree`, `caret`, or the
  second command's status), each group's count held to `test/inverse.baseline.json` on the same corpus
  (`INVERSE_UPDATE=1` records, once read; `INVERSE_EXAMPLES=` shows more); any encoding failure or
  exception fails it (B67). The baseline is the allowlist: its big groups are the caret coming back
  into text (a round trip from markup), direct outdent's later siblings, Markdown's forced readings
  (a heading's section, setext to ATX), and the blank lines of decision 19's reach (§3.9). Its first
  run found B41; the sweep before it found B39, B40, B51 and B33.
- **`outline` blocks** (`drawOutline` in `test/drawing.ts`, read by `test/specfile.ts`, checked by
  `test/spec-run.ts` at the start and after any step) where a case's point is a reading its bytes don't
  show: Typing1 (setext), Quote87 (a lazy line, not an item), Placeholder1 (an empty child, not an
  underline), TaskBackspace8b (new, GFM: a task, `[]` text, a task again). The true-outliner file's
  "Undoing a fresh line break", which checked only the end of `shiftEnter deleteContentBackward` (two
  no-ops would pass), draws its middle state, as ShiftEnter17 and ShiftEnter20 do. A soft against a
  hard break has no reading in the outline: not asserted.
- **The player** (`test/player.ts`): its host Backspace and Delete delete one character (B64).
- **`test/config.test.ts`**: `CONFIG_VALUES` and the docs (§5.10).
- **The differential** (`test/differential.ts`): worker threads, one per core (`DIFF_WORKERS`), the
  reports merged in the documents' order and ties sorted by key, identical with 1, 3 and 10 workers;
  13 s instead of about a minute. Each document's choices (the selection into the next line, the
  pasted clipboard) come from a generator seeded by its index; a case's flavor from a hash of its ID
  and the corpus hash order-free (B65); the default flavor named for generated documents. Its configs
  gained `enterOnEmptyItem: exit`, `emptyItemWithChildren: refuse`, `joinWithChildren: refuse`,
  `enterTask: plain`, both other `enterSplitSpace` values and `markup: decorated`, and lost
  `deleteAtGap` and `editInMarkup`. Its corpus grows with every case drawn (buffers and clipboards), so
  a failure count rises without a regression: the baseline was re-recorded after reading every group,
  each time checking that no run that applies at the parent commit fails (122 at the start, 190 now).

### 7.2 Tools

- **`npm run probe`** (`sxs/probe.ts`, replacing the review's scratchpad probe and then
  `test/probe.ts`): `node sxs/probe.ts [<apps>] [options] <buffer | -> <step>...`. Without apps (a
  first argument with a caret, a selection, a space or a line break is the buffer) ourus plays alone,
  at once; `--each=<option>` plays every value, `--outline` adds the reading. With apps (as `run.ts`
  names them: `all`, `block`, `text`, `outliners`, `free`, `LO,RR`, `-RN`) ourus plays first, the
  playable probes are written as a spec file with ourus's states as drawings into
  `.sxs/probe/<time>/probe.md`, and each app runs `run.ts <app> --probe=<file> --json=<out>
  --no-report` in a process of its own, all at once; the output groups each step's apps by model, by
  the ourus state they're compared with (a block app's projection, or ourus under the app's declared
  values), then by their own state, with the verdict and `*` for an adapted start; then skips and
  errors. `--file=probes.md` plays several probes in the spec's format (their drawings after the
  actions ignored), every app started once; `--case=Enter28` a spec case's start, clipboard, options
  and actions, its drawing shown where ourus differs (exit 1 on a difference or an encoding failure);
  `--clipboard=`, `--tags=`, any option; `--spec` prints the probe as a case's blocks, to paste into a
  spec file; `--json`; `--exact`. All 18 setups take about 25 s with the pool warm. Runs go to
  `.sxs/probe/`, never into the results.
- **`npm run redraw`** (`test/redraw.ts`): every case drawn otherwise than ourus does now, each step's
  drawing beside ourus's; `--apply` rewrites the buffer and result blocks bottom up, fences lengthened
  where the content needs it, never a case whose flavors come out differently, a step that fails to
  encode, or a pending case (B75); a file or a case narrows it. Tested by breaking a buffer
  (tasks.md), a five-backtick buffer (fences.md) and a result (backspace.md), each rewritten back byte
  for byte. Read every difference before applying; redraw by hand where the actions should change.
- **`node sxs/run.ts --compare[=REF]`** (`sxs/lib/compare.ts`): the current judgment, each app's
  `sxs.json`, against the one committed at REF in `.sxs` (HEAD by default), by case ID (so `del.md`'s
  cases are `delete.md`'s, paste.md's `paste-plain.md`'s): per app the agreement on the cases both
  have, the verdicts moved, every cell that got worse (`-v`: better too), the cells only the current
  one has with the camps against ourus in them, and what's gone. Apps and selectors narrow it. It
  replaced the scratchpad's `sxs-compare.mjs` and `table-compare.mjs`, and reproduced the last
  comparison exactly against `.sxs`'s `HEAD~1` (then `09ad6f8`). `--compare=cf30869` gives the
  whole session against 14-sxs's run (§9.1).
- **`node sxs/run.ts --rejudge`** (was `--report`, the user's naming): runs no app; replays ourus on
  every case (the table's ourus column, and each app's plan under its declared values) and judges the
  stored app states against the spec as it is now; prints how many cases ourus passes and names any it
  fails, and lists what is Not run. A rejudge rewrites `sxs.json`, the reports and the table, the
  current judgment; each app's per-file `<app>/<file>.json` keeps its last run's verdicts.
- **`run.ts --probe=FILE`**: plays a spec-format file from anywhere and writes `--json`'s file alone:
  no results in `.sxs/results`, no report.
- **App names** (`sxs/lib/apps.ts`, for `run.ts` and the probe): a directory or its two capitals in
  any case (`LO`, `logseq`), comma-separated; `all`; a group (`block`, `text`, `outliners`: block apps
  without paragraphs, `free`: with them); `-XX` leaves one out (`all,-RN,-RB` skips both RemNotes'
  slow start); `US` is ourus, for the probe.
- **`OURUS_SXS_DEBUG=1`**: an error's whole stack in the app's log.
- Not kept (scratchpad): the redraw script with `--old=` (the pre-§3.2 drawings beside), `z-groups.mjs`
  (a throwaway file's apps grouped by buffer, per step: the probe's grouping now).

## 8. The SxS

### 8.1 Judging under declared values

Before, the SxS skipped a case wherever a value the app declares would change ourus's outcome (14-sxs
§24, step 1), which hid every wrong declaration. Now (`adapt()` in `sxs/lib/plan.ts`) where an option
the app declares, and can't be set to the case's value, changes what ourus does in the case, the app
is judged against ourus's replay under all its declared values (`drawnSteps(test, flavor, values)`,
each step's drawing projected as the spec's are), with `under <option>: <value>` among what was
adapted; the table puts such cells in parentheses, and each app's report lists them under what was
adapted. Enter60, Enter60b and Scenario21b needed no `trim` marks or twins: the `start` apps are
compared with ourus's replay under `start`. Not yet: the "as blocks" skips (1 to 5 per app), which
need the adapted start's replay as the wants. The cells so judged were triaged (§9.2).

### 8.2 Declarations

The session's changes (all in the drivers' `behaves`):

- `deleteAtGap: gap` out of bare Obsidian, Live Preview, Outliner (all from `sxs/obsidian/obsidian.ts`),
  SilverBullet, Emacs and true-outliner.
- `joinWithChildren: refuse`: Logseq (and Logseq DB, on its driver), Roam, Athens, WorkFlowy, Dynalist,
  Tana, Outliner.
- `enterTask: plain`: Logseq (and Logseq DB), Tine, Roam, Athens.
- `enterOnEmptyItem: exit`: RemNote's bulletless setup.
- `taskEditing: block`: true-outliner.
- `backspaceAtTopItem: refuse`: WorkFlowy and Tine, which showed it on Backspace26.
- `enterSplitSpace: start`: Tine, Roam, Athens, Tana, Dynalist, WorkFlowy, BlockNote, SiYuan,
  SilverBullet, Outliner; `drop`: the Obsidian base (bare, Live Preview, true-outliner), RemNote (both),
  Emacs.
- Not done: SiYuan's `enterAtTextStart` by node kind (`into` at items, `stay` at paragraphs and
  headings), which wants declarations by shape the driver API lacks; Logseq DB's own measurement.

### 8.3 Drivers

Logseq DB's load (B71); the skips for setups an app can't hold (B72), each in the driver's `holds`
with its reason. Skip reasons and adaptation notes no longer start with an article (`caret in a
marker`, not `a caret in a marker`), the user's word: the drivers' `holds`, the projection's
`caretLost` and `Unsupported`, `run.ts`'s replay reasons.

### 8.4 Reports, names and files

- **`sxs/README.md`** is a short introduction for humans and the table of every app; a run keeps the
  introduction as written (everything above its `## Summary`), puts the run's frontmatter above it and
  the report below (`readmeIntro`, `withIntro` in `run.ts`). `.sxs/results/README.md` is the same,
  its introduction's links one directory deeper. `sxs/sxs.md` is gone. The detail is in **`sxs/run.md`**
  (once `internals.md`): "What to run after a change" first (rejudge; then run only the files of the
  cases it lists as Not run, for those apps; a full run only for a new app version, a driver's change
  or the projection's), running it, "Probing", the command line, what a run writes, how a run works,
  writing a driver, files.
- `sxs/sxs-heatmap.svg` is `sxs/heatmap.svg`, here and in `.sxs/results/`.
- The apps are ordered by how many examples they disagree on, the fewest first (then by agreement,
  then name), in every table and the heatmap.
- Under the summary, "By spec file:" is a lead-in line, not a section, and a third table, "By tag:",
  lists the ranks in order, then the other tags by most disagreements (a case counts under each of its
  tags; no total row); the legend explains both.
- **Driver fields** (the user's names): `shortId` (`LO`), `longId` (the directory, `logseq`),
  `displayName` (`Logseq (OG)`), in that order everywhere, for `id`, `name` and `title`; renamed in two
  steps so the type checker flagged every old use (`name` changing meaning would have passed it). The
  table's summary rows and its columns' link titles show the display name, as run.md said they did.
  The stored runs' JSON keeps its fields (`app`, `title`). Display names: Logseq (OG), Logseq (DB),
  Obsidian, Obsidian (Live Preview), Obsidian (Outliner), Obsidian (true-outliner), Emacs
  (markdown-mode), RemNote (nbl), RemNote (bl), and the apps' own names. (The summary tables' column
  links take the display name as their title; the examples table's still take the directory,
  `sxs/run.ts`'s `matrix`: §11.)

### 8.5 The projection

A block's text starts at ourus's text start and drops a line-start escape after kept spaces, given the
case's options (B70). Open: an item's body blocks projected as children (§11).

## 9. Measurements

### 9.1 The SxS reruns

Each full run took about 15 minutes for all 18 setups (RemNote's page load alone about 8.5); a single
file for some apps a minute. Two baselines: 14-sxs's run (`.sxs` `cf30869`), and the run after the
decisions, committed with the user's `15-spec wip` (`.sxs` `09ad6f8`, folded away by the squash:
`.sxs` now has `cf30869` and the session's commit). Each comparison says which.

- **The whole session** (`node sxs/run.ts --compare=cf30869`, when this note was written), on the
  cases both runs have: Athens +24, BlockNote +27, Dynalist +20, Logseq +7, Logseq DB +6, RemNote
  without bullets +23 and with +10, Roam +22, SiYuan +18, Tana +21, Tine +22, WorkFlowy +21; Outliner
  and true-outliner +2; bare Obsidian and Live Preview −3, SilverBullet −4, Emacs −7. 69 cells got
  worse, each in a case a decision redrew or one now judged under the app's declared values: the
  text apps' (bare Obsidian and Live Preview 7 each, Outliner 8, SilverBullet 9, Emacs 12,
  true-outliner 12) on the one-press paragraph join (Backspace12, Backspace12c, Delete18,
  ShiftEnter11, ShiftEnter12), the Delete peel (Delete13e, Delete13g, Delete15), Fence12, Fence30's
  caret, Outdent2, the split space (TaskEnter3, the true-outliner file's "Rest of title becomes first
  paragraph"; Shift-Enter's kept space in ShiftEnter1, ShiftEnter2, ShiftEnter3, ShiftEnter21, S4,
  S9, S13) and "Undoing a fresh line break"'s middle state; SiYuan's 8 (Enter8, Enter9, Enter10,
  Enter11, Enter22, Enter41, Enter42, TaskEnter3: judged under `start`, the first half's end it
  trims); BlockNote's Enter51 and Outdent2, Dynalist's Fence30, RemNote's Delete28, Tana's Delete5c
  and "Undoing a fresh line break". New cells: 1,584 in 232 cases (670 agree, 62 caret, 67
  whitespace, 785 disagree). Gone from some apps, 19 cases, now skipped or removed: Indent29 and
  Outdent2 for the pure outliners (now `free-form`), the Delete16 family, Delete19, TaskBackspace1,
  TaskBackspace6 and "Backspace before the checkbox" for the text apps (now `decorated`), Backspace26
  for Tine and WorkFlowy (now declared `refuse`), Backspace21b and Delete17b (removed), S7/S8
  (renamed), Enter3c, Backspace12c, Delete18c and ShiftEnter13 for a few block apps.
- **After §4's defects** (every app on every file, the declarations as they were; ten minutes): of
  8,169 verdicts comparable with 14-sxs's run, 18 changed, all from redrawn cases. Delete28 now agrees
  with BlockNote, SiYuan, bare Obsidian, Live Preview, Outliner, true-outliner, SilverBullet and Emacs
  (RemNote, which matched the old drawing, differs); Fence12's split disagrees with the text apps that
  ran it; Fence30's new caret differs from Dynalist's and Outliner's; Fence7d agrees with Dynalist;
  Scenario16 flipped for BlockNote and Roam. The new cases (493 runs) mostly agreed where expected:
  Backspace44, Backspace44b and Delete30 with 10 to 12 apps, the outliners among them; ShiftEnter28
  with 10; Paste87, Paste88 with 11 and 12; ShiftEnter29 with 7; the markup-as-text cases
  (Backspace42, Delete29, TaskBackspace8, TaskBackspace9, TaskDelete4) with the four text apps that run
  them. The blocks of lines (Fence52 to Fence57, Fence59) disagree with the six text apps, which leave
  those keys to the editor. Paste83, then refused, disagreed with all 18 (§3.11). 7 errors (B71, B72).
- **After the decisions** (against 14-sxs's run; this run became `09ad6f8`): agreement rose in the
  block apps that keep the split space or join paragraphs in one press (BlockNote +21, WorkFlowy +11, Tana +10, Dynalist and RemNote
  without bullets +9, Tine, Roam, Athens and SiYuan +8) and fell where a decision went against an app
  (Logseq −13 and Logseq DB −15, which drop the split space; the text apps −8 to −11, which delete one
  blank line per press and do nothing on Outdent2). Every case that got worse, 47, traced to a decision
  (the split space: Enter8, Enter9, Enter10, Enter11, Enter35, Enter42, TaskEnter3, ShiftEnter21,
  Scenario7, Enter44; the paragraph join: Backspace12, Backspace12c, Delete18, Delete18b; Fence12,
  Fence30's caret, Delete13e, Delete13g, Delete15, Delete28 for RemNote, Outdent2) or a later redraw
  (Enter51 now playing Backspace, which BlockNote doesn't join on; "Undoing a fresh line break"
  drawing its middle state, where Tana makes a node), but Paste25, where Logseq DB lost the caret.
  Cases new or newly run, 845 runs: 278 agree, 489 disagree. The camps against ourus, setups of one app
  counted once: Enter62 (11 of 13 apps) and Paste83 (Athens, Logseq, Roam, Tine keep the break), both
  decided at the review; the rest the three text editors' raw edits (bare Obsidian, SilverBullet,
  Emacs: Delete30, ShiftEnter31, Paste84, Enter57, Enter60, Enter60b, Scenario21b, DirectOutdent5,
  DirectOutdent6), most block apps agreeing with ourus, and Athens, Tine and RemNote or Tana not
  deleting a selection before Enter (Enter56b, Enter59: their mechanics, as Paste49's).
- **After `enterSplitSpace`** (its `&#32;` version; against `09ad6f8`, as are the next two): Logseq
  +16 and Logseq DB +18 (`trim`), RemNote +12 and +11, true-outliner +10, bare Obsidian and Live Preview +7, Emacs +3 (`drop`); 83 whitespace
  → agree, 15 disagree → agree; one cell worse, Enter35 for Logseq. Enter65 to Enter65d agreed in
  Roam, Tine, Athens, Tana, WorkFlowy, Dynalist and Outliner; SiYuan, BlockNote and SilverBullet on
  typing and Delete, unwrapping on the Backspace (their Backspace1); Enter64 in RemNote (both) and
  true-outliner. The `start` apps no longer ran the 17 to 30 split cases each whose outcome `start`
  changes, which §8.1 brought back.
- **After the padding rework**: ourus passed 887 of 888 cases (Typing4 pending); 85 whitespace →
  agree, 16 disagree → agree; the `start` cases agree in Roam, Tine, Athens, Tana, Dynalist, WorkFlowy
  and Outliner (Enter65 to Enter65d, Enter65e, Enter65h, Enter65j); 11 cells worse in 5 cases (Enter35;
  Paste11, Logseq DB's lost caret; Enter60, Enter60b and Scenario21b, fixed by completing `start`).
- **Judged under declared values** (§8.1; then B70's fix and a rejudge): ourus passed 889 of 890;
  every app agrees more on the cells both tables have, +3 (Emacs, SilverBullet) to +18 (Logseq DB):
  163 whitespace → agree, 17 disagree → agree, 5 caret → agree; Enter35 for Logseq the one cell worse.
  640 new cells in 131 cases, mostly those judged under the apps' values: 361 agree (56%), 187 `(✗)`,
  37 `✗`, 35 `(C)`, 17 whitespace, 3 `(E)` (B72's BlockNote and SiYuan skips).
- **After the end review's fixes** (single files rerun, each followed by a rejudge; against the run
  judged under declared values, committed with `wip2`): worse only by
  decision (Backspace19 and Delete18b in BlockNote and SiYuan, which hold an item's written body
  paragraph as a block of its own and glue it; Delete18b in true-outliner) or in the app (Logseq DB's
  carets on Paste62 and Paste70, later found the harness's, B71). Better: Delete18b in bare Obsidian,
  Live Preview, Outliner, SilverBullet and Emacs (which delete the blank line only); Backspace43 and
  SoftBackspace1 (B30, B42). Backspace19b agrees with BlockNote, SiYuan and true-outliner.
- **Now**: 907 cases, every one passing ourus's replay; nothing Not run; no app errors.
- **By tag** (the new table, at the padding rerun): the disagreement share rises with rank (core
  25%, common 34%, edge 50%, rare 58%); `quote-container` 85% (text apps only), `markup-heading` 77%,
  `markup-fence` 75%, `free-form` 70%, `markup-task` 55%.

### 9.2 The triage of the cells judged under declared values

The cells of the run judged under each app's values that didn't agree: 399, counting the text apps'
plain ✗ (225 of them the block apps' `(✗)`, `(C)`, `(E)`). The paste options' 149 went to the paste
session. Each of the rest was read by option and case: ourus's replay under the value, the app's
state, and whether two apps or more (setups of one app once) reach the same other state.

- **Fixed**: B63 (TaskEnter10), B42 (TaskBackspace11), B30 (Backspace43c), B72's driver skips.
- **Decided**, the user following each recommendation (drawn in full in a `review.md`, removed after):
  `stay`'s blank line a press (§3.3), `stay` at a heading's line start (§3.7), logical outdent in place
  at the top level (§3.8), Cmd-Backspace after a checkbox under `text` (§3.5).
- **Known, nothing to do**: the text editors write no escapes (Enter8, Enter9, Enter10, Enter11,
  Enter22, Enter35, Enter41, Enter47, Enter48, Quote42 under `drop` and `start`) and split inside a
  checkbox (Enter54, Enter54b); SiYuan and SilverBullet trim the first half under `start`; Roam and
  Athens, pure outliners, can't leave a list at the top level under `enterOnEmptyItem: outdent`
  (Enter7, Enter15, Enter28: forced, they make a sibling); Tana removes an empty item and lifts all its
  children on Delete under `joinWithChildren: refuse` (Delete5, Delete5b, Delete5c: §3.4's third
  result); RemNote and BlockNote make an empty block above under `stay` where Markdown holds only a
  blank line (Backspace43, Enter33, Enter59: no block form); Tana and true-outliner give a checked
  task's split with children a plain item (TaskEnter7); E9 and Enter22 in Tine and Tana are a paragraph
  projected as an item with children, where the app's `enterMidItem: child` acts and ourus's paragraph
  split doesn't (the projection, §11); Scenario10's caret after `deleteSubtree` (Tana in `c`, RemNote
  and WorkFlowy none).

## 10. Apps' bugs seen

Besides 14-sxs §16's:

- true-outliner deletes outside the selection (Backspace31, Delete21).
- Outliner removes an empty item without its blank line, so the paragraph after it becomes a lazy line
  (Backspace39).
- SiYuan drops a line break on a join (Backspace37), turns `1. def` after a line break into a nested
  list (ShiftEnter6) and `2. draft` after Enter into an ordered item (Scenario23, Enter62).
- RemNote (both) loses the item's own text when code is pasted at its end (Paste1, Paste25, Paste66,
  Scenario18; or its reader does).
- Athens reads no fenced block in a paste.
- Tine appends absorbed children after the survivor's (Delete5, Backspace17c).
- Logseq keeps a numbered block's trailing space at a split, and trims a bullet one's (Enter35).
  (Logseq DB's lost carets after a paste, Paste11, Paste25, Paste62, Paste70, taken for the app's,
  agree now that its load is fixed: B71.)
- Emacs through tmux types a no-break space or a character outside the BMP as its code; Tana counts
  the caret past an emoji in UTF-16 against code points; SiYuan and Tana hold U+00A0 as a space.
- To look at: Obsidian's redo in Undo4 and Undo5 (the driver?); Logseq DB nesting every second pasted
  item under the first (about 12 cases); Tana's paste placing items after the *following* siblings.

## 11. Open

In order.

1. **The paste session** (§3.11), with what it has collected:
   - Structured paste re-researched, refactored and redone: its cases, options and claims; the 149 SxS
     cells judged under the paste options; the differential's 47 structured-paste failures (among them
     the new clipboards' `x⏎# y` pasted into headings); two quotes pasted on an empty item arriving as
     escaped text, and on a nested empty item left to the host; the differential's configs lacking
     four paste options (`pasteStructuredAtEnd`, `pasteStructuredOnParent`,
     `pasteStructuredParagraphList`, `pasteStructuredListForm`).
   - The cases found wrong: Paste46, Paste58 (§6.2); B2's frontmatter into an empty note (tests from
     all three starts, `''`, a bare line break, a line break with a placeholder, at the API layer
     first); structured paste over a selection across a node's continuation lines (B20's other half);
     the spaces at a break paste makes, which plain and structured paste drop (Paste68), and items
     pasted where a space is held gluing the last one to the text after (`- y┃---`).
   - No flow pastes with the defaults (Paste7, Paste10: §6.3).
   - What the data says, from the review: **decision 7**, a heading line pasted at a text's end is a
     node (Paste32, Paste33, Paste34, Paste35, Paste53, Paste61): Logseq, Logseq DB, Tine (and Athens,
     but for the caret) make a node; Roam, WorkFlowy, Dynalist, Tana, RemNote (both), SiYuan and
     BlockNote join the title and drop the `#`s (13-align said five); the text editors glue `para# h`;
     no joining app keeps the `#`, against rule 1. **Decision 13's default `pasteStructuredLines:
     text`**: 11 to 7 over all apps, but 6 to 3 for `items` among the nine outliners (Roam, Athens,
     WorkFlowy, Dynalist, Tana, RemNote). **`pasteStructuredMidText: split`**: Logseq, Logseq DB,
     Tine, Roam and Athens go `after`; WorkFlowy and Dynalist split. **Rule 3** (a list's first items
     set the form, Paste15): no app does it, and it restyles an item the paste didn't touch: evidence
     for dropping it (13-align §11). **Blocks at an item's end go into its body** (Paste1, Paste25,
     Paste66, Scenario18): ourus and SiYuan; Logseq and Tine keep the code in the block, glued to its
     text; Logseq DB and Tana make a new item holding it (`- a⏎- ```…`, which ourus writes for an
     empty item, decision 15). Not a consensus against ourus, but rule 5's reason ("after the list,
     the code would end it") is wrong: a new item keeps the list; model C bears on it. **Paste over a
     selection** (Paste49): keep replacing it; Logseq, Logseq DB, Tine, Roam, Athens and Tana keep the
     selected text only when pasting blocks (they replace it pasting lines, Paste48): their mechanics.
     **The clipboard's last line break** in plain paste (Paste3): BlockNote and SiYuan drop it;
     Logseq, Logseq DB, Tine, Roam and Athens keep it as ourus does: paired cases, a copied line against
     a copied block. **Clipboard provenance**: a source copy and a rendered copy are different inputs
     (Paste19, Paste57, Paste66, the numbering cases); measure both, and don't redraw a Markdown
     expectation to match what an HTML clipboard couldn't carry. Paste66's HTML is rendered from
     ourus's own dedented reading, so the apps never see the broken copy the case is about: give it
     plain text only. **The caret after a structured paste** (`pasteStructuredCaret`, §3.13).
     **`z-open.md`'s three choices made without the user**: lines pasted in a heading's title go after
     it (Paste54); a line copied with its line break is two lines (Paste51); a paste at a heading's text
     start goes after it (Paste76).
   - paste.md's prose found wrong: Paste1 and rule 5's reason; Paste7 and Scenario17 on
     `pasteStructuredLines`' camps; Paste16b ("as true-outliner numbers it": BlockNote does,
     true-outliner doesn't); Paste19 (WorkFlowy and Dynalist drop the `#`, they don't glue it; the
     heading-block camp is also Logseq DB, Tine, Athens); Paste26 (the joining camp is also Roam and
     RemNote; Roam is declared `after` yet joins); Paste32 (name the apps that join the title);
     Paste38, Paste59b (SiYuan doesn't); Paste40 (its claim has no SxS data: the case is free-form; it
     came from decision 14's grid); Paste49 (bare Obsidian, Live Preview, Outliner and true-outliner
     now agree; only Emacs leaves the line break); Paste3, Paste48 ("outside the item": a line at
     column 0 is a lazy continuation, still the item's).
   - The paste options' docs: `pasteStructuredLines` (Athens, Tana and RemNote paste lines as items,
     the latter two undeclared; the `items` camp lists only Roam, WorkFlowy, Dynalist);
     `pasteStructuredAtEnd` (RemNote behaves as `join`, undeclared; `join`'s "a heading joins nothing"
     is contradicted by both its apps, WorkFlowy and BlockNote joining the title);
     `pasteStructuredOnParent` (SiYuan is `after` on items but `children` at a heading, Paste59b);
     `pasteStructuredListForm` (`drop`'s "a nested list keeps its own form" fits SiYuan; Logseq, Tine
     and Dynalist bullet the nested list too).
2. **The differential's other encoding failures**: 190 runs (47 pasteStructured, 45 outdent, 25
   indent, 23 duplicateSubtree, 15 enter, 11 deleteSoftLineBackward, 9 deleteContentBackward, 5
   deleteContentForward, 5 moveSubtreeDown, 5 pastePlain), each group to read (`DIFF_DUMP`). The
   outdent ones are nine shapes, each its own bug: an empty item and a kept-spaces line under `start`
   (`- one two⏎-⏎   three`, a heading); an item whose text is an unclosed `$$` in the Obsidian flavor;
   `- item⏎⏎  - ⏎⏎  para`; tab-indented code in an item under `enterMidItem: child` in CommonMark (two
   documents); an empty task holding a quote (`- [ ] ⏎  > q`); a padded fence-like text (`-  ``` x`,
   two flavors); a quote in an item ending with blank quoted lines (`- x⏎  > - a⏎  >⏎  > `).
3. **The SxS**:
   - The "as blocks" skips judged under the app's values (§8.1); declarations by node kind (SiYuan's
     `enterAtTextStart`); Logseq DB's declarations measured rather than inherited.
   - An item's body blocks projected into the block's text for apps whose blocks hold Markdown
     (Logseq, Logseq DB, Tine), not as children: Logseq DB's Paste57 block is exactly ourus's
     Markdown, and Paste1, Paste19, Paste25, Paste66 and Scenario18 read as disagreements for it. With
     model C the projection follows ourus's model.
   - Cases that test something else on blocks (Backspace37, Backspace40, Fence7, Fence7b, Fence7d,
     Paste37: the app does what ourus does on its blocks): tag or project them so.
   - Shapes with no block form: WorkFlowy and Tana have no line break inside a block (about 30 ✗ in
     shift-enter.md measure only that); RemNote and BlockNote hold a paragraph break inside one block
     (ShiftEnter10, ShiftEnter11, ShiftEnter12, ShiftEnter15, ShiftEnter16); two Backspaces that are
     one join on blocks (Enter47, Enter53); Athens and Dynalist hold fences as text (skip code lines for
     them, as for Roam: Fence1, Fence2, Fence3, Fence5, Fence8); a block text of one space (Delete5d).
   - Verdicts of their own: "the same outline, other text" for text apps (66 quote steps); trailing
     blank lines at the document's end as whitespace (Placeholder2, Placeholder3, Placeholder4);
     typing lost after focus loss (DeleteSubtree6, nine apps); a forced agreement (§1.2); caret
     verdicts counted where a case changes no text (cursor.md's "0 disagreements" is every difference
     being a caret: CursorUp1 differs in 12 apps, Obsidian's Up going to its inline title).
   - Offered, not built: a mid-text escape compared as equal for block apps (§3.10); `--missing`, to
     run exactly the Not-run cases into the files' own results; `--rejudge` writing its log elsewhere
     (B76).
   - The examples table's column links take the app's directory as their title, where the summary
     tables take its display name (`title="${html(a)}"` in `matrix`, `sxs/run.ts`): one line.
4. **Behavior noticed, not done**:
   - Enter at a top-level opening fence opens a line above with the caret on the fence (where markup is
     text, where the user had it; `decorated` moves it into the code). Under `into`, an empty paragraph
     above may be better.
   - B52 first, the next session's first task: keys at a held space under the default `markup: text`
     can turn an item's text into a heading or code (§4.9 has the repro, cause and plan). Then B35 (a
     blank line lost after Fence12's round trip).
   - Under `start`, a deleted first character's leading space (`- a┃ x`, Backspace, `-  x`) settles as
     padding past the item above's, so it reads as text too: check it against probe Z4 (15 apps keep
     it).
   - Shift-Enter at an item's text on the line after its marker (`-⏎  ┃ three`) is refused, kept spaces
     or not, where the host had it with a kept space (four differential runs, read).
   - The cm6 demo's own undo step for a settled placeholder (§3.10): a custom history, or an accepted
     divergence.
   - A notation for an empty document and one without a final line break; assertions of a soft
     against a hard break; the core-flow check is bookkeeping (it checks a link, not that the flow plays
     the case's shape, option and action).
   - Quote48, Quote49, Quote50, Quote52, Quote54's pointers to Backspace1 (§6.4).
   - The old dev notes (10-sxs, 13-align, 14-sxs) still name `sxs/sxs.md` and `sxs-heatmap.svg`: left
     as history.
5. **Later**: the model experiment (§3.13); presets, unblocked now that the SxS judges under declared
   values; the options not taken (§3.13); decision 19's options 2 and 3 if the round trips come to
   matter (§3.9).

## 12. Insights

- **Rank by consensus, not by count.** Twelve apps differing each its own way is noise; seven giving
  the same other result is a camp. Sorting by the largest group agreeing against ourus put the split
  space, the paragraph join, the joins with children and the empty item's exit at the top, where a
  count of ✗ put paste's mechanics.
- **An agreement is evidence only where the app could have done otherwise.** Pure outliners agree
  with ourus wherever the other outcome is a paragraph; counted, they made Enter on an empty top-level
  item look settled. Same-app comparisons (RemNote's two modes) beat counting apps.
- **One decision can be most of a verdict class.** Decision 1 made about 80% of the block apps'
  whitespace verdicts; a whitespace column reads as harmless until it is traced to one rule.
- **Two decisions can be one question, and stay one.** The old paragraph join's line break looked like
  the odd join out; at a sentence boundary it was what hid decision 1's lost space, so the two were
  changed together. When the split space went back to `trim`, the one-press join kept its new form and
  the sentence boundary's cost came back (Scenario21b).
- **Measure what apps do at rest, not only after a round trip.** The review's kept space gave the
  round trip back, but no app leaves the space at the first half's end; only measuring the states in
  between showed the camps (§3.2).
- **A declaration is a camp at one shape, and a variant needs its own measurement.** RemNote's empty
  item depends on depth, SiYuan's Enter at a text start on the node's kind, `gap` on whether the caret
  is next to a line break; Backspace21b was written from `gap`'s description, and no app did it.
  Judging an app under its declared values is what shows a wrong declaration.
- **Measure an option before deciding its fate.** `gap` looked like no app's behavior from one case;
  on the 18 it skipped it was exact at every line break. It went for a better reason: what it modelled
  is the plain line-editor mode's.
- **Inverse pairs, played everywhere, find what reading doesn't**: the review's sweep found 13 of its
  defects in seconds, none drawn by a case, and the test found more later. A round trip still needs its
  first step asserted (two no-ops pass it), and a first step that fails to encode must count.
- **A rule written for the common shape leaks at its siblings.** Fenced code's boundaries were
  handled; math, comment and indented code's, which a rule said "take the same", weren't. An item's
  marker counted as its text start; a heading's `#`s and a checkbox's inside didn't. ATX's one line
  became every heading's.
- **A fallback is a behavior too.** Every "the host's" in a rule (a selection across lines, a mid-code
  Backspace, the player's one-unit delete) was where structure broke; each wants a case drawing what
  the host then does. And a refusal handed to the host hides bugs: `inMarkup` turned encoding failures
  into `notApplicable` under `text`, and a dozen came out when that stopped.
- **The guarantees depend on the host.** Never splitting markup and never leaving the caret in it
  protect an editor that decorates markup; in one that shows it as text they would stand in the user's
  way. One host setting, not one option per case, says which kind of editor ourus is in.
- **JavaScript's whitespace isn't Markdown's.** `trim()`, `\s` and "empty" stand for space and tab, and
  U+00A0 falls through all of them; neither the spec nor the differential's corpus had an input for
  it.
- **The empty document is a state of its own**, and the held empty paragraph another: the same bytes,
  different commands. Fixtures that can't draw them hide crashes.
- **A shape a command creates is a new start state for every other command.** Fence59's held paragraph
  after a fence broke moves and `deleteSubtree`; Fence7d's broke Backspace. New states need the
  differential and the inverse test, not only their own case.
- **The same bytes, two histories.** `a⏎⏎┃◌` comes from Enter at a paragraph's end and from two
  Shift-Enters; `a⏎⏎┃b` from Enter mid-paragraph and from Shift-Enter at a line's start; `a⏎⏎┃◌⏎⏎# H1`
  from Enter at `a⏎# ┃H1` and at `a⏎⏎# ┃H1`. A stateless inverse picks the commoner key's (Enter's)
  and states the other; where one key can't have made the state (Enter inside an item's text), the
  other's inverse is free to win. The block apps keep the histories apart; Markdown can't.
- **An atom's text is its lines; an item's is trimmed.** Converting between them (an item whose text is
  code, its code a block) must recompute the planned text.
- **The differential finds what the cases don't, but its corpus moves**: every case drawn adds buffers
  and clipboards, and flavors were assigned by order, so a failure count rises without a regression.
  Compare dumps by run, read the groups that go `→ rejected encoding-failed`, and key anything
  per-case to the case's ID, not its position.
- **Tell a change's effect from a corpus change** by running the new spec against the old code (a
  copy of the tree with the parent commit's `src/`) and diffing the groups. It caught the first
  version of the item-paragraph rule.
- **A caret-only verdict can be a feel difference.** Enter28's caret and Roam's paste caret are "C" in
  the table and decide what the next keystroke does.
- **Ownership is the model's deepest choice.** Who owns the list after a paragraph, and whether an
  item's body is nodes or content, decide what a move, a delete or an indent from inside them does;
  the apps that disagree most there disagree on it, so it is an experiment, not an option.
- **Independent reviews converge on the big questions and diverge on method.** Verifying every finding
  by probe before it went in made the reconciliation short.

## 13. Reference

### 13.1 Commands and timings

| command | what | time |
| --- | --- | --- |
| `npm test` | the suite: the spec (both `markup` values for carets), API, config, parser | a few seconds |
| `npm run typecheck` | | |
| `npm run test:diff` | the differential against the last commit's code (`DIFF_DUMP=f.jsonl` lists the failing runs, `DIFF_UPDATE=1` records a baseline once read, `DIFF_DOCS`, `DIFF_EXAMPLES`, `DIFF_WORKERS`); it exits 1 by design while behavior differs from the commit | 13 s |
| `npm run test:inverse` | the inverse pairs (`INVERSE_UPDATE=1`, `INVERSE_EXAMPLES=`, `INVERSE_WORKERS`) | 1 s |
| `npm run probe -- …` | ourus alone, or beside the apps (§7.2) | at once; 25 s for all 18 setups, pool warm |
| `npm run redraw [-- <file or case>] [--apply]` | cases drawn otherwise than ourus does | seconds |
| `node sxs/run.ts --rejudge` | judge the stored runs against the spec now; no app | seconds |
| `node sxs/run.ts --compare[=REF] [-v]` | the judgment against a `.sxs` commit | seconds |
| `node sxs/run.ts <apps> <file>[#<anchor>]` | play some apps on some cases | a minute for a file |
| `node sxs/run.ts all` | every app, every file | about 15 minutes |
| `node sxs/run.ts --stop` | stop the SxS's processes | |

After a change: `npm test`, typecheck, the differential (read its encoding failures first), the
inverse test; for the SxS, run.md's "What to run after a change". The last committed SxS data is in
the `.sxs` submodule's HEAD (`git -C .sxs show HEAD:results/<app>/sxs.json`).

### 13.2 Methods that worked

- **Spec first, then code, one behavior at a time**: draw the case, watch it fail for the drawn reason
  (`npm run probe -- --case=<it>`), then the code, then the tests, the differential and the inverse
  test.
- **Measure the apps on a shape before deciding**: `npm run probe -- all …`, or a probes file
  (`--file=`). Before the tool: a throwaway spec file of cases drawn from ourus's output (they must pass
  `npm test`; rank `edge`), run with `all`, deleted after, its results moved out of `.sxs/results/`.
- **To measure one rule's effect on the differential**: put the rule behind a temporary environment
  toggle, replay the changed runs (start buffer and config from the differential's output) with it on
  and off, and diff. It showed a seam rule firing where two lists merged, which no case drew.
- **The redraw**: play every failing case in its first flavor, print each step's drawn and actual
  buffers (spaces as `␠`), apply bottom up, cases and steps; read every diff first; redraw by hand
  where the actions change (a flow, a doubled key).
- **Comparing SxS judgments**: by case ID, never by file (cases moved files); setups of one app once
  (logseq-db → logseq, remnote-bl → remnote, the four obsidian-* → obsidian); verdicts ordered agree <
  caret < whitespace < disagree < error.
- **Probing an app's page**: a temporary hook in the page (Logseq DB's tags); `OURUS_SXS_DEBUG=1` for a
  driver error's stack.

### 13.3 Traps met

- A buffer's exact bytes matter: a line break appended makes a trailing blank line, another document.
- A placeholder is state: `┃◌⏎` and a bare `⏎` run different commands, `''` a third path; an empty
  child right under its parent's text needs its `◌` in a probe, or `  - ` is a setext underline.
- The flavor matters: `$$` and `%%` are blocks only in `obsidian`; GFM is the default now, and a case's
  flavor in tools is its first.
- Trailing spaces and `⍽` are invisible in a terminal: print through `JSON.stringify`, or spaces as
  `␠`. Filtering blank lines out of a drawing hides gaps.
- A script finding a case in a spec file must track code fences: buffers contain `# ` and `## ` lines
  (headings drawn in buffers) and fence lines; a buffer with a four-backtick fence needs a five-backtick
  block. A case ID must be its file's next one (`grep -oE '^## Name[0-9]+' | sort -V | tail`), and
  headings at `###` under a group heading (fences.md's "Math, comments and indented code", quotes.md's
  groups) belong to that group.
- The spec reader wants a clipboard of line breaks only as `|+` with empty lines.
- The markdown files under `sxs/` are generated reports (`--rejudge` rewrites them): never edit them by
  hand. A rejudge rewrites `sxs.json`, the reports and the table, not the per-file JSON: compare
  judgments, not per-file verdicts (the first comparison after a rejudge fell into it). A case whose
  actions changed after a run is stale until its file runs again: the rejudge lists it as Not run.
- A full SxS run reads `spec/` and imports `src/` and `sxs/` as it goes: no edits while one runs (stage
  them as `*.staged` and swap after, the user's suggestion). `.sxs/` shared between two containers
  breaks the Chromium profile locks: one machine per `.sxs/`, `--stop` first. Resetting `.sxs` removes
  SiYuan's cached release (it downloads 3.8.6 again) and brings back old-named result files to delete
  (`*/del.json`, `sxs.md`, `sxs-heatmap.svg`).
- Kept spaces lie between Markdown's text start (`headRange`, `line.contentFrom` for items) and ourus's
  (`textStart`): every check against `headRange(…).from` at a text start needs `ownTextFrom` or
  `spacesFrom`.
- Plan verification retries with a placeholder at the caret before a plan's fallback, which made
  `start` hold the space rather than fall back until children and markers were handled directly.
- The SxS projection needs the case's options (`ProjectOptions.config`) to read kept spaces.
- A local variable named like a function in the same file shadows it (`split` in `split()`, `textFrom`
  in `join()`).
- `seam()` decides the blank lines between units: any rule there moves hundreds of differential runs;
  replay before trusting the cases. `codeEdit` is where every edit of code lines is verified.
- `obsidian-true-outliner.md` is under the MPL: edit its cases, don't move them; write new cases in the
  MIT files.

### 13.4 Spec conventions

From 11-spec §3 and this session: a case shows one behavior, its prose a sentence or two, the detail
in the file's intro rules, which are ordered; full case IDs, never ranges; new cases take the next
number of their file, existing IDs stay; the setup is a YAML block (`tags:` the rank first, then facts
such as `free-form`), then one buffer; refusals drawn with their buffers; claims about apps from the
current data, named by §6.1's rule; no session or write-up named in a spec file; a changed decision
says which it replaces where its cases are.

### 13.5 Working with the user

- The user decides product questions, with data behind each (probe the apps first), drawn in full
  (`<pre>` blocks in tables rather than one-line drawings), the options with their work and how
  principled each is, and a recommendation. Questions go in a `review.md` at the repository's root,
  one section each; decided ones move into the dev note and the file goes.
- Dislikes refusals where a sound result exists; wants hosts with editable markup unobstructed; won't
  pay with code complexity for edge cases (decision 19's reach).
- Review work in one session with good tools, not subagents (too costly).
- Long SxS runs are waited for, not worked around.
- The user commits and squashes sessions themselves, `.sxs` too.
