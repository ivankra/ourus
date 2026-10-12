# Bug mining session (2026-10-12)

The second half of the session that `06-impl.md` describes. The work here was mining for bugs.
Short editing sessions, as an Obsidian or Logseq user would type them, went into `spec/zzz.md`,
each step's expectation drawn before running it, in batches with a theme: free-form notes, outlining,
code fences, lists with Shift-Enter, and the edge cases below. Each batch was run on ourus and, where
possible, replayed in Logseq. Every bug got a short case in its command's spec file; every decision
was the user's, drawn first as a case in `zzz-open.md`.

Numbers: tests 446 pass, 0 fail, 9 pending when `06-impl.md` was written; 489 pass, 0 fail, 9 pending
now (456 spec cases plus 33 unit tests; all 9 pending are in `zzz-redesign.md`). `commands.ts`
2,040 → 2,299 lines. Config options 7 → 8. Uncommitted: 17 files, +1,408 −52 since "ourus: further
improvements".

## 1. How the mining went

About 100 sessions in 11 batches. `zzz.md` holds only the last batch, H; the earlier ones were
cleared batch by batch, and what they found lives on as main-suite cases.

| batch | theme | bugs found |
| --- | --- | --- |
| first mixed batches | Obsidian/Logseq free-form | Enter in loose lists, paste into a paragraph's list, moves across sub-headings |
| L | list-only, for Logseq | none; one Logseq bug (L5) |
| S | Obsidian and Logseq sessions | `deleteSubtree`'s caret; one decision (quotes) |
| S2 | more of the same | none; one decision (`deleteAtGap`) |
| D | code fences, dev use | three: code lines in containers |
| E, F | selections, callouts, tabs, CRLF, setext, loose lists | none |
| G | fences, lists, Shift-Enter | Enter on an empty line in an item; one redesign (Fence7) |
| H | edge cases: nested containers, undo through placeholders, mixed selections | none |
| sweep | the remaining `encoding-failed` | Delete before a heading with text under it |

- **Most first-run failures were mine, not ourus's.** About three in four: the caret column after a
  vertical motion (Up/Down snap out of the marker area), a missing `◌` (an empty child right under
  its parent's text needs one), a motion one line off, or a rule I'd forgotten (Enter7 splits a
  top-level list; a callout's title and body are one paragraph). Each was checked against the spec
  before the expectation was changed.
- **The bugs were at container edges.** The core moves, indents and joins held up across every
  batch. What broke was text that belongs to a container rather than to a node: an item's
  indentation and a quote's `>` on code lines, the empty line an item ends with, the blank line
  before a heading's text. Ordinary editing (E and F, 20 sessions) found nothing.
- **Logseq as a reference.** `test/logseq/run.ts` replays the sessions it can hold in headless
  Logseq. It skips 50–70% of a mixed batch (text outside items, numbered markers, quotes, blank lines,
  selections across blocks, CR line endings, and the `pastePlain`, `deleteSoftLineBackward`,
  `deleteSubtree` and `duplicateNode` actions). On what it can run, it agreed with ourus on almost
  everything, which backed up decisions made earlier (direct outdent, moves across parents, Enter at
  a block's start, undo/redo, code-line joins). The differences:
  - **Intentional, all known:** Logseq refuses Backspace that would join a block with children (H9,
    `joinWithChildren`); it pastes plain lines and numbered lists as text into one block (rule 5);
    it has no paragraphs, so Enter on an empty top-level item mid-list adds a block where ourus
    leaves the list (Enter7); the Delete5 family; and the undo caret (L4: ourus restores the caret
    from before the step).
  - **Logseq's own:** L5, Delete on an empty block between `- ab / - b1` and `- c`, loses `c`,
    every time it's replayed. Most likely a Logseq bug (or a runner limitation), so ourus didn't
    copy it. Typing ```` ``` ```` by hand inside a block is swallowed by Logseq's code editor (D1).
  - **Not about ourus:** the runner's Logseq keeps the caret column on Up/Down where ourus's test
    player snaps to the text start (the motions are the tests' own, not commands).

## 2. Behaviour added or changed

By command, with the cases that pin it.

- **Indent**: a paragraph with nothing above that can hold it becomes an item in place, keeping its
  lines and taking its owned list as children; outdent turns it back (Indent22). Only in sections
  (the top level, under a heading): inside a quote, outdent would take the item out of the quote, so
  the pair wouldn't reverse, and the indent is refused there.
- **Indent and outdent on a code line** are the host's (`notApplicable`): they indent the code, as in
  Logseq and Obsidian (Fence21). Before, ourus tried to indent the code block as a node, and refused.
- **Enter**:
  - On an empty item in a quote, the item becomes an empty paragraph in the quote, set off by a
    quoted blank line; Enter on that empty paragraph, the quote's last node, leaves the quote
    (Obsidian; the user's decision). A quote the paragraph was all of goes. `quotes.md` has the
    whole sequences, in a quote at the top level and in one inside an item. Enter on an empty
    paragraph in the middle of a quote is still refused: leaving there would split the quote.
  - After the closing fence that ends an item's content, Enter makes the next item, as at the end of
    the item's text (Logseq; Fence7); Shift-Enter makes a new line in the item, for a paragraph after
    the code (Fence7b). With child items after the fence, Enter makes the first child (Fence7c); with
    a paragraph after it, Enter makes a line in the item, as Shift-Enter does (Fence7d). A fence
    outside an item is unchanged.
  - On an empty line at the end of an item's content, the caret at the item's content column (where
    Shift-Enter after a fence leaves it), the line becomes the item's next sibling, numbered on
    (Enter37, Fence22). Not yet in quotes.
  - Enter drops the spaces at the split, and Backspace doesn't bring them back (`one ┃two` → Enter →
    Backspace → `one┃two`). Logseq does the same; Obsidian keeps them. Kept.
- **Shift-Enter** at an item's text start is refused: the item's first line would be empty.
- **Backspace and Delete**:
  - On code lines: Backspace at a code line's start joins it to the line above, and Delete at its end
    joins the line below, the containers' prefix on the joined line (an item's indentation, a
    quote's `>`) going with the line break (Fence16, 18, 20). Before, both were the host's, which
    deleted one space of the item's indentation (ending the item and the block) or pulled that
    indentation into the code. Against a fence line they are refused, since the code would join the
    fence (Fence17, 19).
  - Next to a blank line, the new `deleteAtGap` option decides (§3).
  - Delete before a heading with text right under it: the joined heading line is set off from that
    text by a blank line (Delete13c; with `headingEditing: block`, Delete13d). Before, this was
    refused as `encoding-failed`. It's a common Obsidian layout, so this was the sweep's most visible
    find. Not added after a list item that would interrupt anyway, or when joining into a heading.
- **Paste on a code line**: plain paste writes each line with the block's container prefix and keeps
  the code's own indentation (Paste22). Structured paste there pastes as plain text, since in code
  what is pasted is code (Paste23). A pasted line that is a fence would close the block, and is
  refused.
- **`deleteSubtree`**: deleting the first node puts the caret at the start of the next node's text
  (after its marker, checkbox or `#`s), not before its marker, where typing would break it
  (BlockDelete4; BlockDelete3 redrawn).

## 3. Config

One new option, `deleteAtGap`, with both values in the spec:

| option | values (default first) | who does what |
| --- | --- | --- |
| `deleteAtGap` | `join`, `gap` | Delete/Backspace next to a blank line: join the nodes (outliners), or delete the blank line first (Obsidian) |

With `gap`, the first press deletes one blank line and the second joins. Where deleting the blank
line would merge two nodes anyway (two paragraphs), the press is the host's either way. Backspace at
a heading's text start still edits its `#`s (`headingEditing: text`). Cases: Delete17/17b,
Backspace21/21b.

## 4. Refusals made clean

`encoding-failed` should mean a writer bug; a refusal for a reason Markdown imposes is
`not-expressible`, with a reason that says why. Following `emptyAwayFromCaret`'s pattern, `execute`
now reclassifies one more family after verification fails:

- **Indented code after an item** (`indentedCodeAfterItem`): an indented code block right after an
  item it doesn't belong to reads as more of that item, whatever the writer does. This was the "84
  moves" of `08-impl.md` §6, and the same shape in indent, outdent, paste and Delete: about 470
  differential cases, now `not-expressible: indented code after an item would join it`.

The one place a walk passed a shared variable where it meant the current node's holders made every
later sibling look held by the node before it. Small, but worth remembering when writing tree
walks with an "above" cursor.

What's left: about 3,100 `encoding-failed` results on 4,000 generated documents (720,000 command
runs). They're older than this session, refusals rather than wrong output, and mostly fringe
Markdown:

- `deleteSoftLineBackward` on a setext underline (about 1,600): the command treats the underline as
  text to delete; it should be the host's or refused.
- indent next to an empty item that has no placeholder (about 800).
- Enter inside a multi-line setext heading (about 300).
- Backspace and Delete next to lazy lines after quotes (about 350).
- moves next to indented code at the top level (about 100).

## 5. Findings and insights

- **Flat verification can pass a misread.** Joins that compare with `compare: 'flat'` accepted
  `- c0## S1` / `2. m2` (after Delete joined a heading into an item) though `2. m2`, an ordered item
  not starting at 1, can't interrupt a paragraph and was read as more of the joined text. The blank
  line fixed these cases, but the check itself should catch them: a flat compare should also check
  node boundaries (the number of nodes, and where each starts), not only kind and text.
- **"Code is payload" keeps coming back.** Enter already knew that a code line's container prefix
  isn't code. This session taught Backspace, Delete, both pastes and Tab the same thing, one at a
  time. The rule: on a code line, edits are text edits, except that the containers' prefix is
  structure, written by ourus on every new or joined line, and a line that would become a fence is
  refused. A small "code lines" module could own all of it.
- **Enter on emptiness steps out one level.** On an empty nested item: it outdents. On an empty
  top-level item: it becomes a paragraph. On an empty item in a quote: it becomes a paragraph in the
  quote. On an empty paragraph ending a quote: it leaves the quote. On an empty line ending an item:
  it becomes the item's sibling. That reads as one rule, and the cases still missing follow from it:
  an empty paragraph mid-quote (split the quote), an empty line ending an item in a quote.
- **Enter and Shift-Enter divide the same way everywhere.** In an item, Enter makes the next node
  and Shift-Enter more of this one. The closing fence was the one exception, and once it followed
  the rule, Logseq agreed.
- **Writing sessions costs most in expectations.** Checking each first-run failure against the spec
  was the slow part. A mode that prints the actual buffers of a session (ourus's, and Logseq's where
  it can run) would make the review a diff, and catch drawing mistakes (a missing `◌`) at once.
- **The differential only sees change.** It compares HEAD with the working tree, so it can't count
  what both refuse. Counting the remaining `encoding-failed` took a throwaway copy of it.
- **The spec format grew one block type:** `clipboard-no-newline`, a clipboard whose text doesn't
  end with a line break (the user's suggestion). Before, a clipboard always ended with one, so a
  paste's caret always landed on a new line.

## 6. Still open

- Enter on an empty paragraph in the middle of a quote (would split the quote); an empty line ending
  an item inside a quote (`leaveItem` handles plain items only).
- An indented item's lazy continuation line keeps no indentation (valid Markdown, still the item's
  text; cosmetic).
- `zzz-open.md` is empty. Open questions from `08-impl.md` §6 that this session closed: the 50 moves
  failing as `encoding-failed` (now clean refusals) and the spec README's two broken links (fixed).
  The rest of that list still stands: O(n) edits, paste rules in `split` mode and in quotes,
  `zzz-redesign.md`'s pending cases, re-recording `zzz-logseq.md`, the demo's sample text.

## 7. Next steps

In order:

1. **Commit.** 17 files changed since the last commit, including the command renames.
2. **Strengthen flat verification** (§5): count nodes and check where they start, so a lazy
   continuation can't slip through a join again. Rerun the differential; anything newly refused is
   a bug the old check hid.
3. **Sort the remaining `encoding-failed`** (§4) by family into refusals with a reason and real
   fixes, starting with `deleteSoftLineBackward` on a setext underline, the largest group. Add a
   count mode to `test/differential.ts` (outcomes by reason, one tree) so this needs no throwaway
   script.
4. **A session printer**: `node test/session.ts zzz.md` printing each step's actual buffer from
   ourus, and from Logseq where it can run, next to the expectation.
5. **Widen the Logseq runner**: numbered lists (Logseq writes them with a property), selections
   across blocks (Shift-click), `deleteSubtree` and `duplicateNode` mapped to Logseq's shortcuts.
   Each would bring a share of the skipped sessions into comparison.
6. **The missing "step out" cases** (§5): splitting a quote on an empty paragraph mid-quote, and an
   empty line ending an item in a quote.
7. **A code-lines module** (§5) gathering what Enter, Backspace, Delete, both pastes and Tab do on code
   lines.
8. Then the rest of `08-impl.md` §7: tidy, safety nets, rules for Backspace and Delete, re-recording
   Logseq, performance.

## 8. Bets

- **Generated sessions.** Instead of writing sessions by hand, generate them: random short action
  sequences over small documents drawn from a grammar of common shapes (lists, fences in items,
  headings with text, quotes). Check invariants (no `encoding-failed`, undo restores text and caret,
  Enter then Backspace is the identity up to the spaces at the split, a command's output re-parses
  to its intended outline), and replay the list-only ones in Logseq automatically, reporting
  differences grouped like the differential. Hand-written sessions found a bug every batch or two;
  generated ones would cover the container edges systematically.
- **An Obsidian reference.** Logseq can only check outlines. A second oracle for the free-form half
  (Obsidian's editor, or CodeMirror 6 with Obsidian-like list keymaps) would check quotes, paragraphs,
  headings and code fences, where most of this session's bugs and decisions were.
