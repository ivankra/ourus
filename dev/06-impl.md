# Implementation notes (2026-10-12)

One long session, starting from the spec refinements committed as "ourus: spec
refinements": the per-command spec files, new behavior drawn as `pending` cases, and questions put
to other outliners. The behavior was then settled case by case, mostly by checking Workflowy,
Logseq, Roam, Dynalist and Obsidian, and the core was changed to match. Committed as "ourus: further
improvements"; the command renames of §4 came after.

Numbers: tests 348 pass, 0 fail, 28 pending at the start; 446 pass, 0 fail, 9 pending now (413 spec
cases plus 33 unit tests; all 9 pending are in `zzz-redesign.md`). `commands.ts` 1,563 → 2,040
lines. Offline agreement with the Logseq recordings: 149 → 153 of 220 (the rest is mostly Markdown
that Logseq's block files can't hold). Demo smoke test: 39 → 44 scenarios.

## 1. The spec, reorganised

- **One file per command**, with short case IDs (`Enter12`, `BlockUp7`, `CursorHome3`) and the
  description in the prose below each ID. New files: `cursor.md` (caret motions, which also pin
  Home and Up/Down), `undo.md`, `paste.md`, `fences.md`, `tasks.md`.
- **`scenarios.md` keeps only multi-command flows**; single-command cases went to their command's
  file. The passing, uncontroversial cases of `redesign.md` went to the command files too; what is
  left (`zzz-redesign.md`) is the guard's cases, escapes and frontmatter, nearly all pending.
  `redesign-guard.md` merged into it. `logseq.md` is now `zzz-logseq.md`. The two outdent policy
  files merged into `outdent.md` as its "Direct outdent" and "Logical outdent" sections.
- **true-outliner cases ourus now overrides were dropped** where an ourus case covers them (E26,
  E27's heading half, E30, #159's bullet split, #269's emptied first item, the two Backspace-at-start
  cases), and the prose notes the difference where it matters.
- **`decisions.md` became a working file** (now `zzz-open.md`): one case per open question, drawing what ourus does
  today (so it passes), with what other outliners do in `text` blocks the runner ignores. The user
  filled those in by testing the outliners, and each answer moved into the command files, with the
  outliners' behavior recorded in the case's prose. None is open now.
- **Config blocks** replace the info-string flags: a ` ```config ` block before a test's first
  block, `key: value` lines, merged over the file's frontmatter and winning over it.
  `status: pending` replaces the `pending` word. Option keys and values are checked against
  `src/config.ts`, so a misspelt option is an error.

## 2. Config (`src/config.ts`)

Behavior users disagree on is an option with a default; an `OutlineDoc` holds its config and every
snapshot after it carries it (`OutlineDoc.parse(text, { config })`). Spec files use the same keys.
The word "policy" is gone. Built:

| option | values (default first) | who does what |
| --- | --- | --- |
| `outdent` | `direct`, `logical` | direct: Logseq; logical: Roam, obsidian-outliner |
| `bullet` | `-`, `*`, `+` | for a new item with no list to copy from |
| `enterOnEmptyItem` | `sibling`, `outdent` | sibling: Workflowy, Logseq, Dynalist; outdent: Roam |
| `handleFenceContents` | `true`, `false` | `false` for hosts that edit code themselves |
| `headingEditing` | `text`, `block` | text: Obsidian, Typora, Notion; block: outliners |
| `taskEditing` | `text`, `checkbox`, `block` | Backspace right after a checkbox: one character (a plain text editor), the checkbox, or a join |
| `pasteMidText` | `after`, `split` | after: Logseq, Roam; split: Workflowy, Dynalist |

The options considered but not built (ourus2's list, plus `format` and `readers`) are recorded as
comments, each with why it waits.

## 3. Behavior, by command

- **Moves** cross parents: a first child moving up becomes the last child of its parent's previous
  sibling, and the reverse going down. An item moves past a paragraph into or out of its list. The
  blank line between an item and the paragraph it moves past stays between them.
- **Outdent** is direct by default. The first item of a top-level list outdents to a paragraph (in
  place, owning the rest of the list; with `logical`, after the list). An item of a paragraph's list
  becomes a paragraph after it, the items below following it.
- **Enter**: on an empty item in the middle of a nested list, a new empty sibling (Workflowy, Logseq,
  Dynalist); on an empty first child, a new item above, held by a placeholder; at an item's start,
  the caret goes into the new empty item above (all four outliners); on an empty item with children,
  a new first child; at a heading's text start, the heading splits there (Obsidian); a list marker
  after the caret stays text in the new item, escaped (all outliners keep it as text); in a fenced
  code block, a new line in the block's containers.
- **Shift-Enter** at the start of a continuation line opens a blank line above it, the caret staying
  with the text (Logseq); Backspace undoes it.
- **Backspace**: an empty first item goes (with children, they take its place; the only item loses
  its marker); an empty item with children elsewhere hands them to the node above; at a heading's
  text start the marks go (`headingEditing: text`); right after a checkbox, per `taskEditing`; at a
  paragraph after a blank line inside an item, the blank line goes.
- **Delete**: on an empty paragraph's placeholder, the paragraph goes (the heading below kept its
  `##`); before an ATX heading, its whole line joins, `#`s included; on an empty item with children,
  the first child moves up into it (Delete's ordinary join); on an empty item, from anywhere after
  the marker; before a setext heading or into code, refused.
- **Paste** is two commands: `pasteStructured` (Ctrl-V; was `insertFromPaste`) and `pastePlain`
  (Ctrl-Shift-V: text into the node, line breaks as Shift-Enter's). Structured paste now follows
  eight written rules (`spec/paste.md`): nothing pasted is lost (what can't be structure stays text,
  escaped); the destination decides form (bullet, columns, spacing), the paste content (text,
  numbers, checkboxes, nesting); a list's first item sets its form; the paste's nesting is kept,
  rebased; the nodes go where Enter would put a new node, or in an empty item's place; what can't be
  a node there is pasted as text; numbers are never renumbered; one line is inline text. So an
  ordered list pasted into a bullet list keeps its numbers as text (`- 1\. x`), pasted on a list's
  empty first item it makes the list ordered, and pasted into an ordered list it keeps its numbers as
  written. Into a list, plain lines are items, one each; an empty item takes the paste.
- **Up and Down** land at the start of a line's text when the goal column falls in its markers, in
  the player and in the demo.
- **Removed**: `toggleTask` and `convertKind`, with their specs.

## 4. Renames and tools

- `Doc` → `OutlineDoc` (`Document` would hide the DOM's global type in every host), `ApplyOptions` →
  `OutlineDocApplyParams` (and `options` → `params`), `Change` → `TextChange`.
- Commands: `formatIndent` → `indent`, `formatOutdent` → `outdent`, `moveUp` → `moveBlockUp`,
  `moveDown` → `moveBlockDown`, `insertFromPaste` → `pasteStructured`, `insertParagraph` → `enter`,
  `insertLineBreak` → `shiftEnter`. Enter and Shift-Enter are named for their keys, which hardly ever
  get remapped; the other text edits keep their W3C Input Events names (`deleteContentBackward`, …);
  structural commands are named by ourus.
- The CM6 demo has a Makefile (`make`, `make serve`, `make smoke`), a third, middle panel rendering
  the document with commonmark.js (CommonMark, not GFM; raw HTML escaped), Up/Down at text start,
  Ctrl-V / Ctrl-Shift-V, and smoke scenarios for each new behavior.
- The differential run (`test/differential.ts`) knows the old names (`insertFromPaste`, `Doc`, the
  old indent, outdent, move, Enter and Shift-Enter names), so it can compare against a copy from before the renames.
- Two small mechanisms paste's rules needed: a plan can keep numbers (`keepNumbers`: the usual
  renumbering after a command is skipped), and an edited node can carry an exact marker
  (`exactMarker`: the writer writes it as given instead of adopting its list's), on new items and
  existing ones. Paste's three placement paths became one, with one function (`fitPaste`) deciding
  how each pasted node fits where it lands, and plain paste as the fallback.

## 5. Findings and learnings

- **Outliners disagree more than expected, and on details users notice**: where the caret goes
  after Enter at an item's start, whether Enter on an empty item outdents, what Ctrl-V does mid-text.
  Asking the user to try each case in four outliners and writing the answers into the case's prose
  worked well; the disagreements became options, the agreements became the default.
- **Markdown decides some caret positions.** An empty item right after its parent's text exists
  only as a placeholder, and a placeholder only under the caret, so there the caret must go into the
  new item. Where outliners do otherwise, ourus can't follow them without blank lines.
- **Inverse pairs break silently.** Changing Shift-Enter at a line's start broke "Backspace undoes
  Shift-Enter" without any test failing; a read-through found it. Pairs need their own checks.
- **The differential harness earned its keep** on every broad change: 847 Shift-Enters, 690 fence
  positions, the heading unwrap's neighbours, 122 Deletes before headings, 398 moves with a wrong
  blank line. Each looked fine in the spec cases. But its generated caret positions miss some places
  (right after a checkbox, a heading's text start), so it can't vouch for those changes.
- **Native edits are the guard's.** Patching one keystroke (deleting the space after a marker) in
  the command layer would start a whack-a-mole; it was specified as a guard case instead.
- **Spec drawing traps**, each met at least once: literal tabs pasted where `→` is meant; `- a` /
  `  - ` without `◌` (a setext underline, not an empty item); a clipboard block always ends with a
  line break, so "no trailing break" can't be drawn; a caret after the final line ending can't be
  drawn; a second `buffer` block in a reply breaks the case.
- **Paragraph ownership keeps mattering**: a Shift-Enter break hands the paragraph's list to the new
  paragraph; a line becoming a paragraph must lose its lazy indentation and be escaped; joins next to
  paragraph text need a blank line kept.
- **Hand-written escaping is spreading**: Enter, Shift-Enter, the Shift-Enter break, plain paste
  (twice: into a text and into an empty item), split paste, structured paste's kept numbers and the
  heading unwrap each escape a line that would start a block, with the ordered marker's backslash
  before its delimiter. It is the same rule written eight times.
- **General rules beat cases.** Paste had grown case by case (three placement paths, ad hoc marker
  handling, refusals) until each new report ("an ordered list into a bullet item breaks") needed a
  new special case. Writing down eight rules first answered the open questions at once (keep numbers
  as text, a list's first item sets its form, never renumber) and collapsed the code into one path.
  Worth doing for the other commands before their cases pile up: Backspace and Delete are next.
- **Not renumbering has a visible cost**: a list can read `1.` `2.` `2.` in the file. Markdown
  readers number it 1 to 3 anyway, so it reads right, but the source looks odd; a renumbering of the
  items after a paste (never of the pasted ones) is the alternative if it bothers.

## 6. Still open

- **Every edit is O(n)**: an immutable `text` string, a full re-parse, a full write and a full
  verification parse per command (22–25 ms a keystroke, 27–48 ms a command at 10,000 lines, against
  8 ms). Incremental parsing, then region-scoped writing and verification, then persistent text and
  line structures (a line-chunk tree like CodeMirror's `Text`).
- 50 moves that were refused now fail as `encoding-failed`, and 4 paste edge cases on empty items
  are refused (one as `encoding-failed`): refusals either way, but writer failures should become
  plain refusals or work.
- Paste's rules aren't applied to the `split` mode yet (it treats lines as text, which keeps numbers,
  but doesn't adopt or set a list's form), nor to pastes into quotes.
- `zzz-redesign.md`'s 9 pending cases; B8 there needs redrawing under `taskEditing`.
- The spec README still links `block-delete.md` and `block-duplicate.md` (the files are
  `delete-subtree.md` and `duplicate-block.md`).
- `zzz-logseq.md` is recorded under the old spec names; re-record it (needs network and Chromium).
- The demo's sample text is out of date ("quotes are atoms for now").

## 7. Next steps

In order:

1. **Commit the command renames**; once no copy from before them is compared against, the
   differential run's fallbacks for old names can go.
2. **Tidy what this session left**: the spec README's two broken links, the demo's sample text,
   B8 redrawn under `taskEditing`, and a pass over `zzz-redesign.md` to promote or drop its 9
   pending cases (the guard's two stay until the guard exists).
3. **Turn writer failures into answers**: the 50 moves now failing as `encoding-failed` and the 4
   paste edge cases. Each should either work or be refused with a reason, as the spec promises.
4. **Cheap safety nets first** (bets 1, 5 and 7 below): inverse-pair properties, parser-chosen caret
   positions for the differential run, and the spec linter. Each is small, and each would have
   caught something this session caught only by reading.
5. **Rules for Backspace and Delete**, as paste got: a short list of principles in each file's intro
   (what joins, where children go, what markup a key removes, when it is the host's), with the
   cases as instances, and the code reorganised around them. Their special cases are where the
   next inconsistencies will come from.
6. **Re-record Logseq** under the new spec names, and settle the open Logseq differences in the
   comparison (joins with children, the empty-item-with-children Enter) as presets or known
   differences.
7. **Performance**: incremental parsing (bet 8), then region-scoped writing and verification, then
   persistent text and line structures. This is the largest piece of work left before ourus can
   back a real editor on long documents.
8. **The guard**, specified first in its own file as placeholders were (the cases in
   `zzz-redesign.md` are its start), then built on the incremental parser's dirty-line information.

## 8. Bets worth trying

Each is cheap to try on a branch, with the spec, the differential run and the Logseq comparison as
referees.

1. **Inverse-pair properties.** For each command with an inverse (Shift-Enter and Backspace, Enter
   and Backspace, indent and outdent, up and down, plain paste and undo), a property test: the pair
   returns the text, or at least the outline. Bet: the class of regression found by reading this
   session is caught by the suite instead.
2. **Outliner presets.** A preset per outliner (`logseq`, `workflowy`, `roam`, `dynalist`,
   `obsidian`) as config, and the spec run under each, with the outliner's known differences as
   per-preset expectations. The Logseq runner would then check Logseq's preset, not the default.
   Bet: one spec describes all of them, and a new disagreement is a one-line preset change.
3. **Markers as one table.** Bullets, checkboxes, `#`s, `>`, fences and setext underlines are all
   markup in front of (or under) a node's text. Describe each as a token with its Backspace, Delete
   and Enter behavior, driven by config, instead of `unwrapHeading`, the checkbox branch, the
   empty-item branches and the marker-space rules. Bet: a table of a few dozen lines replaces
   several hundred lines of special cases, and new markup (callouts, GFM tables) is a row.
4. **Escaping in the writer.** Make "this line would start a block" the writer's problem: commands
   give text, and the writer escapes (or tries candidates, as it does for blank lines) until the
   re-parse reads as intended. Bet: the six hand-written escapes go, and none can be forgotten.
5. **Caret positions from the parser.** Let the differential run pick caret positions from what the
   parser knows (each marker's end, a checkbox's end, a heading's text start, inside a fence's
   backticks, a lazy line's start) instead of a fixed few per line. Bet: the changes this session
   couldn't verify (checkbox, heading start) would have been covered, and new ones will be.
6. **The spec as end-to-end tests.** Drive the CM6 demo with the spec files (Playwright, the real
   keys, the real clipboard events), not just the smoke list. Bet: spec cases double as editor
   tests, and differences between the core player and a real host (CodeMirror's own Up/Down, paste
   events, IME) show up as failing cases rather than as user reports.
7. **A spec linter.** The reader warns on literal tabs, on an empty item right after text without
   `◌`, on a clipboard that needs no trailing break, and on two cases with the same start and
   actions but different results unless their config differs. Bet: the drawing traps of §5 stop
   costing a round trip each.
8. **Incremental parsing first, measured.** ourus2's step-function parser with the corrected
   restart rule, behind the existing `OutlineDoc` API, with the bench as the gate.
   Bet: keystrokes under the 8 ms budget at 10,000 lines without touching commands, which then makes
   region-scoped verification the only remaining O(n) step.
9. **Blank lines instead of placeholders, measured.** Placeholders exist because some empty nodes
   have no Markdown. Try writing them with a blank line at once (a loose list) and count which spec
   cases change and how. Bet: either placeholders earn their complexity, with evidence, or a large
   part of `OutlineDoc`'s state and `settle` can go.
10. **GFM preview and parsing.** Add a GFM renderer to the demo's middle panel (tasks and tables), and
    use it as a second reader in verification behind `readers`. Bet: disagreements between ourus's
    reading and GFM's surface before users see them.
