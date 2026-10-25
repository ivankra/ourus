# The behavior spec

The files here say what an outliner does, as examples: an editor state, what the user does, and
the state that results. `npm test` runs every example against the ourus core
(`test/spec.test.ts`). File titles name the editing behavior or familiar key, while executable
actions use current command names, so the same files can drive editors with different keymaps.

To see what ourus does before drawing a case, or why one fails, `npm run probe` (`sxs/probe.ts`)
plays actions on a buffer drawn this way and prints each state, under every value of an option if
asked, as a case's blocks if asked (`--spec`); `--case=Enter28` replays a case, each step checked
against what it draws. Given apps first (`all`, a group, apps by name or two capitals, `LO,RR`), it
plays the same on the SxS's apps too, each step's states with the apps grouped by what they did,
without writing a case or a result:

```
npm run probe -- '- [ ┃] task' deleteContentBackward '"x"'
npm run probe -- --each=markup '- one┃ two' enter deleteContentBackward
npm run probe -- --case=Enter28
npm run probe -- all '- one⏎  ┃two' shiftEnter deleteContentBackward
```

After a behavior changed on purpose, `npm run redraw` (`test/redraw.ts`) lists every case drawn
otherwise than ourus now does, each step's drawing beside ourus's, and `--apply` rewrites those
buffer blocks and result keys (a file or case named to narrow it: `npm run redraw -- enter.md --apply`).
Read every difference first; a case whose actions should change is redrawn by hand.

- [Indent (Tab)](indent.md): `indent`.
- [Outdent (Shift-Tab)](outdent.md): `outdent`.
- [Move subtree up (Alt-Shift-Up)](move-subtree-up.md): `moveSubtreeUp`.
- [Move subtree down (Alt-Shift-Down)](move-subtree-down.md): `moveSubtreeDown`.
- [Enter](enter.md): `enter`.
- [Shift-Enter](shift-enter.md): `shiftEnter`.
- [Backspace](backspace.md): `deleteContentBackward`.
- [Delete](delete.md): `deleteContentForward`.
- [Copy and cut](copy.md): `copy`, `cut`: the selection's Markdown, as the clipboard's formats.
- [Paste](paste.md): `paste`: where what it pastes goes.
- [Paste into a list](paste-list.md): where `paste` puts what it pastes into a list.
- [Paste: the list's form](paste-list-form.md): the form pasted items take in a list.
- [Paste: which format is read](paste-conv.md): of a clipboard's formats, the one `paste` reads.
- [Paste HTML](paste-html.md): a clipboard's HTML as the Markdown `paste` reads.
- [Plain paste](paste-plain.md): `pastePlain`.
- [Fenced code](fences.md): Enter and Shift-Enter in a fenced code block, and in the other blocks
  of lines (math, comments, indented code).
- [Backtick](backtick.md): a typed backtick (`insertText`), which opens, closes and changes code
  fences, and Backspace and Delete in a fence's run.
- [`scenarios.md`](scenarios.md): longer sequences, as a user would type them.
- [`cursor.md`](cursor.md): caret motions, for moving the caret between actions in tests.
- [`undo.md`](undo.md): undo and redo, placeholders included.
- [`gaps.md`](gaps.md): blank lines as the trailing gap of the node above, and the preamble.
- [Delete subtree](delete-subtree.md): `deleteSubtree`.
- [Duplicate subtree](duplicate-subtree.md): `duplicateSubtree`.
- [Tasks](tasks.md): Enter and Backspace on tasks.
- [`placeholders.md`](placeholders.md): empty nodes the text can't hold, kept at the caret: when
  they come and go.
- [`obsidian-true-outliner.md`](obsidian-true-outliner.md): obsidian-true-outliner's measured
  cases and catalogue entries.
- [`quotes.md`](quotes.md): quotes and callouts: as containers (`quotes: container`, and a quote
  holding more than one paragraph), as text (`quotes: text`) and as atoms (`quotes: atom`).
- [`lists.md`](lists.md): what a list right after a block is the children of (`listParent`): a
  paragraph's, any block's, or none's.
- [`regressions.md`](regressions.md): cases pinning behaviors settled by bug fixes and refactoring.
- [`quirks.md`](quirks.md): cases of the options and values that model one app's mechanics
  (`quirk…` options, and values named after an app), not a rule.
- [`z-open.md`](z-open.md): open questions, one each, drawing what ourus does today where no
  command file does, with the alternative and a recommendation; a settled one moves to its
  command's file.
- [Typing](typing.md): what the host types, with no ourus command, and what it then reads as.

Each command has its own spec, named for its key or editing behavior. Its intro lists the
command's rules in order, the first that applies winning, and every case is an instance of one.
Case headings use short IDs (`Enter3`, `Quote12`, `Gap4`, `Scenario7`), and prose refers to cases
by their full IDs, never ranges or abbreviations. The prose under a case says in a sentence or two
what it shows and why; where bare Obsidian does something else on a common case, what it does and
why ourus doesn't. Current API names are noted in backticks in each file, and executable actions
keep those names until the API is renamed.

Outdent's treatment of later siblings is a config option, `outdent`:
[direct](outdent.md#direct-outdent) (the default, as in Logseq) makes them children of the moved
item, preserving document order; [logical](outdent.md#logical-outdent) keeps them with their parent.
Cases that depend on it live in those sections, or set it in their config block.

Some empty nodes have no Markdown of their own. A placeholder (`◌`) holds one open while the user
edits it; [placeholders.md](placeholders.md) specifies what happens when it is filled or left.
Applied commands are checked by re-parsing their output against the intended outline. Where a
command does not apply, the host runs its own default; that is only for edits within one node's
text, and, where the host shows markup as text (`markup: text`), for edits with the caret in markup
that ourus would refuse.

ourus serves two kinds of host, and the `markup` option says which it is in. One shows markup as
text the user edits by hand (`text`, the default: raw CodeMirror, a textarea, Obsidian's source
mode): there ourus mustn't stand in the way of a user fixing markup. The other decorates it
(`decorated`: rendered checkboxes and bullets, Live Preview's widgets): there ourus keeps the user
from breaking the node through it. Guarantees 3 and 6 say what each kind gets.

## What every case holds to

No command breaks these; a case that seems to need to is wrong, or is a refusal.

1. **Exactly the intended structure, or a clean refusal**, with a reason Markdown imposes
   (`not-expressible`, `nothing-above`, ...). `write-failed` is a bug, never an outcome.
2. **Lossless and minimal.** Nothing the user wrote is lost, but the spaces an Enter split trims
   (`enterSplitSpace: trim`, the default, and `drop`: [Enter44](enter.md#enter44)); text the edit
   isn't about stays byte for byte (other lines, the node's own text, hard-break spaces, code, tabs,
   CRLF, the numbers of untouched lists). Prefixes, markers and blank lines change only where the structure requires.
3. **The host's key only inside text.** At a markup boundary (a marker, a checkbox, `#`s, a fence
   line, a quote's `>`, a callout title, a blank line between nodes) ourus does the edit or refuses.
   With the caret in markup itself, where only the host puts it, Enter acts at the node's text start
   ([Enter34](enter.md#enter34)), and a task's checkbox is edited as text
   ([TaskBackspace8](tasks.md#taskbackspace8)); Shift-Enter, Backspace and Delete, and an edit ourus
   would refuse, are the host's where markup is text (`markup: text`), whatever the text then reads
   as ([Backspace42](backspace.md#backspace42), [Delete29](delete.md#delete29),
   [ShiftEnter26](shift-enter.md#shiftenter26)), and act at the text start or are refused where it is
   decorated ([Backspace42b](backspace.md#backspace42b), [Delete16c](delete.md#delete16c),
   [ShiftEnter26b](shift-enter.md#shiftenter26b)).
4. **Other nodes keep their parents**: a command changes the parents of its operands, and of the
   neighbors its own definition names, never of any other node. Those neighbors: direct outdent's
   later siblings, the section an unwrapped heading releases
   ([Backspace35](backspace.md#backspace35)), the children of an item whose text becomes a block of
   lines, which holds none ([Outdent19](outdent.md#outdent19)), what a pasted heading takes in
   ([Paste10](paste.md#paste10)), and a list a move leaves right after a paragraph, which the
   paragraph takes in, whether the paragraph moved or not ([MoveUp35](move-subtree-up.md#moveup35),
   [MoveDown25](move-subtree-down.md#movedown25)).
5. **Inverse pairs invert** (indent and outdent, up and down, Enter and Backspace, Shift-Enter and
   Backspace), or at least their outline where Markdown forces a difference, which the case states.
   One difference is by design: a split at a line break inside a node's text joins back glued, as a
   join puts the text at the end of the text above, wherever it came from
   ([Enter51](enter.md#enter51)). Shift-Enter keeps the spaces at a break, starting its new line, so
   the join, which concatenates, gives them back ([ShiftEnter21](shift-enter.md#shiftenter21)); Enter
   trims them from both halves, as Logseq does, and its join can't (`enterSplitSpace: trim`, the
   default; `start` keeps them: [Enter44](enter.md#enter44)). Paragraphs join
   glued, in one press, Enter's inverse ([Backspace12b](backspace.md#backspace12b)), so at the top
   level Shift-Enter at a line's start, whose paragraphs are the same, comes back glued too; right
   after an item's text, where Enter makes no paragraph, Backspace takes back Shift-Enter's
   ([Backspace19](backspace.md#backspace19)). In code, the indentation Enter carries
   to the new line is code, which Backspace deletes as the host deletes code (a code editor by its
   indentation unit), so taking it back may take more than one press
   ([Fence1](fences.md#fence1)). Blank lines may differ too: a command writes the blank lines
   Markdown needs around the node it puts in, and the one that takes it out leaves those of the node
   above ([gaps.md](gaps.md)), so where two starts give the same text (`a⏎# ┃H1` and `a⏎⏎# ┃H1`, Enter),
   the round trip can leave a blank line more or fewer than one of them had.
6. **The caret never ends in markup**: after a command it is in a node's text, never where typing
   would break the node. Where markup is text, a command may leave it on a fence line where the user
   had it: indent and outdent from one, which in the code would be the host's
   ([Indent31](indent.md#indent31)), and Backspace back to a fence's end
   ([Fence32](fences.md#fence32)); where it is decorated, never ([Fence32b](fences.md#fence32b)).
7. **Text stays text**: text after the caret that would start a block at a line's start is
   escaped; only the user's own typing authors structure.
8. **Empty nodes are held, then resolved**: an empty node Markdown can't hold is held by a
   placeholder while the caret is in it; when the caret leaves, an empty item stays, set off by a
   blank line, and an empty paragraph goes.

## A test

````md
# Indent (Tab)

Current command: `indent`.

## Indent1

The item becomes the last child of the item above.

```buffer
- a
- b┃
```

> indent "c"

```buffer
- a
  - bc┃
```
````

- **Every test has a heading of its own**, so it can be linked to (`indent.md#indent1`).
  A test starts at its first block after its heading and ends at the next heading; a heading holds
  at most one test, and prose-only headings group the tests below them. `---` separates nothing
  and is an error.
- **Headings are unique in their file** (compared as anchors: case and punctuation aside), since a
  repeated one would give an ambiguous link and an ambiguous name. A repeat is an error.
- **A state is two blocks**: a `buffer`, the drawn editor state, and a `yaml` block, everything
  else about it, as keys. Each is there if the case is about it, at most one of each, in either
  order.
- **The blocks before the first quote are where the test starts**: its config block (the start's
  `yaml` block, first: its options and tags, and the clipboard and outline it starts with, below),
  then one `buffer`, and nothing else.
- **A quote lists actions**, applied in order to the current state.
- **The blocks after a quote are what must hold then**, and they become the current state: the
  `buffer`, and a `yaml` block with any of
  - `result`: what ourus made of the last action, which must be one of its commands or typed text
    (its last character's `insertText`): `applied`, `deferredToHost` (the host's default ran
    instead) or `rejected <reason>` (`result: rejected not-expressible`). Other editors check
    buffers only;
  - `clipboard`: the clipboard, as a config block's (below); only the formats it names are checked;
  - `outline`: how the buffer reads, where a case's point is a reading its bytes don't show (a
    setext underline against an empty child, a lazy line against an item, a task against `[ ]`
    text), a literal block (`outline: |`): a line per node in document order, indented two spaces
    a level, its kind (`heading 2`, `atom code_block`, `item [x]` for a task), then `: ` and its
    text, line breaks drawn `⏎`.

  What isn't drawn isn't checked. Options and tags go in the config block alone.
- **A test's name is its own heading, its ID**: short case IDs (`Enter1`, `ShiftEnter1`, `MoveUp1`),
  or a name for what the case measures after the file's prefix (`PasteConvVSC`), with the behavior
  explained in prose below each. A heading above cases groups them in the file, and is no part of
  their names. A case's ID is unique across all the spec files, not only its own (the spec test
  checks it): reports, the SxS and notes name a case by it alone.
  Keep assigned IDs stable as cases are added. File titles use keys and semantics (Enter, Move
  subtree up); mention the current API name in backticks in the prose (`shiftEnter`,
  `moveSubtreeUp`). Executable actions retain current API names until the command API is renamed.
- Prose can go anywhere, and other fenced blocks are ignored.

## Drawing a buffer

| glyph | meaning |
| --- | --- |
| `┃` | the caret |
| `«…»` | a selection; its head is the end `┃` touches, or the end after `»` when no caret is drawn |
| (neither) | in a step's buffer, the caret isn't checked: only what the text becomes is (a start always draws its caret, which the reader requires) |
| `◌` | a placeholder: the end of an empty line the document reads as if text had been typed there; right before a space that follows a list marker, that space, read as text (a deleted character's place) |
| `→` | a tab |
| `␍` | a carriage return |
| `⍽` | a no-break space (U+00A0), which Markdown reads as text, not as a space |
| `␠` | a line's trailing space, which would be hard to see (as `sxs/probe.ts` draws them); nowhere else, which the reader refuses |

A clipboard uses `→`, `␍`, `⍽` and `␠` too. A buffer's last line always ends with a line ending. A buffer
that contains a code fence needs a longer fence of its own (`` ````buffer ``).

## Actions

| action | what the user does |
| --- | --- |
| `indent`, `outdent` | indent or outdent the node(s) at the selection |
| `moveSubtreeUp`, `moveSubtreeDown` | move them past their sibling, or at the edge of their parent into the parent's sibling |
| `enter` | Enter |
| `shiftEnter` | Shift-Enter |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete |
| `"text"` | types the text, replacing the selection: a character at a time, each through ourus's `insertText` first, as a host hooked to its keys types it (ourus's for a backtick, the host's otherwise) |
| `copy`, `cut` | Ctrl-C, Ctrl-X: the selection's Markdown, every format, to the clipboard; a cut takes it out ([copy.md](copy.md)); the host's copies the selected text |
| `paste` | Ctrl-V: pastes the clipboard, every format it has, read as Markdown, as nodes ([paste.md](paste.md)) |
| `pastePlain` | Ctrl-Shift-V: pastes the clipboard into the node's text, its line breaks as Shift-Enter's |
| `deleteSubtree`, `duplicateSubtree` | the commands of the same names |
| `deleteSoftLineBackward` | Cmd-Backspace: deletes back to the start of the line's text |
| `cursorCharLeft`, `cursorCharRight` | moves the caret a character; a selection collapses to that end |
| `cursorLineUp`, `cursorLineDown` | moves the caret a line, keeping a goal column while it keeps moving up and down |
| `cursorLineBoundaryBackward` | Home: to the start of the text, then of the line |
| `cursorLineBoundaryForward` | End: to the end of the line |
| `cursorDocStart`, `cursorDocEnd` | to the start or end of the document |
| `select…` (`selectCharLeft`, `selectLineUp`, …) | the same motion, extending the selection |
| `undo`, `redo` | the host's undo and redo: each action that changed the text is one step; a step restores the text and the caret, nothing else ([undo.md](undo.md)) |

Enter and Shift-Enter are named for their keys (`enter`, `shiftEnter`), which hardly ever get
remapped; the other text edits as the W3C Input Events `inputType`s (`deleteContentBackward`, …);
structural commands by ourus (`indent`, `outdent`, `moveSubtreeUp`, `paste`, …); and caret
motions as CodeMirror's commands. The core runner plays them the way an editor host does: an ourus
command runs, and where it returns `deferredToHost` the host's default runs instead (a line break,
deleting a character). Placeholders the caret leaves are settled after every action.

Caret motions are here so a test can move the caret between actions; [cursor.md](cursor.md) has
their cases, drawn so a column means the same place in any font. The core runner moves it in a
monospace font with tab stops of 4, which is enough for that. A real editor moves the caret as
its own layout and GUI dictate (wrapped lines, proportional fonts, bidi text), and a runner
driving one leaves motion to the editor; a test whose outcome depends on exactly where a motion
lands belongs to that editor's own tests.

Cases that only need the caret to leave a placeholder use document and line boundaries instead
of vertical motion, so they don't prescribe where Up or Down lands relative to node markers; where
the caret's place after that doesn't matter, the buffer draws none (`cursorDocEnd`, the caret past
the last line ending, where a block editor's document end is the last block's: Placeholder9).

## Options

Options are YAML, `key: value` lines, every value read as a string (YAML's failsafe schema:
`false` is the word; a value YAML reads otherwise, like `*`, is quoted: `bullet: "*"`). A test's
options go in its config block, a `yaml` block before its first block; a spec file has no
frontmatter (the reader refuses one):

````md
## Indent18

```yaml
tags: edge
bullet: +
```

```buffer
intro

b┃
```
````

A test's config block also holds the clipboard it starts with, as a literal block, its lines
indented two spaces under `clipboard:`. `|` ends its text with a line break, `|-` without one. One
line without a line break, which paste puts inline as text, is a quoted string instead, and only it
(`clipboard: "1. Introduction"`, or in single quotes); a bare one is an error, as YAML would read a
` #` in it as a comment:

````md
## Paste13

```yaml
tags: edge
clipboard: |
  1. x
  2. y
```

```buffer
- a┃
- b
```
````

For a clipboard whose lines all start with spaces, an indentation indicator says where its text
starts (`clipboard: |2`, the text two spaces in: a line indented six spaces keeps four); without
one, YAML would take those spaces for the block's indentation, so lines indented more than two
spaces are an error. A clipboard that holds a code fence needs a longer fence for the config block
(`` ````yaml ``), as a buffer does. A clipboard of line breaks only keeps them with `|+`, followed by
an empty line for each (`clipboard: |+` and one empty line is a single line break).

That is the clipboard's text (`text/plain`) alone, as a copy from a Markdown source, a terminal or a
code block has it. A copy from elsewhere holds more formats, each its own text, and the clipboard is
then those formats under `clipboard:`, named as a `DataTransfer` names them, each written as above,
indented two spaces more:

| format | what writes it |
| --- | --- |
| `text/plain` | every copy: the source of a Markdown editor, a page's text as it shows (`innerText`: no markers, no indentation) |
| `text/html` | a copy from a rendered page or a rich-text app; a code editor's, a picture of its text |
| `text/markdown` | a Markdown app's own copy (Obsidian's) |
| `vscode-editor-data` | VS Code's copy, beside its `text/html` |

The clipboard a test starts with has `text/plain`, as every copy does. A clipboard a step checks
names only the formats it checks:

````md
## PasteHtml1

```yaml
tags: common
clipboard:
  text/plain: |-
    Setup
    npm install
  text/html: '<h2>Setup</h2><ul><li>npm install</li></ul>'
```

```buffer
┃
```

> paste

```buffer
## Setup

- npm install┃
```
````

The SxS gives each app exactly the formats a case has (through a copy event, which writes any
format), and compares a clipboard a step checks by its `text/plain`.

An unknown option, or a value an option doesn't take, is an error. Defined:

  - `flavor`: the Markdown flavor the text is read in, `gfm` (the default), `commonmark` or
    `obsidian`. An example that names none runs in each of them, with the same expectations;
  - `tags`: words separated by spaces, in a test's config block only, every test having it. The
    first is the case's **rank**, how often a user meets it: `core` (every session), `common`,
    `edge` or `rare`; review metadata, never an editor setting. Every `core` case is walked through
    in a flow of [scenarios.md](scenarios.md) (the spec test checks it). The words after it, if any,
    say what the case depends on, for runners to select cases by, from the list below
    (`tags: edge free-form markup-task`). Each is a
    fact about the case, never an editor's name or a verdict, and a case has every tag that applies
    to it. A refusal of what a tag describes counts as the tag.
    - `free-form`: the case depends on free-form Markdown structure that an outliner of blocks has
      no form for, so the case, projected onto blocks, tests something else
      ([`sxs/`](../sxs/README.md) skips it for block apps). Not every case with a paragraph or a
      heading: one that moves, joins or splits them as blocks would compares fine. It is one of:
      - a line edit (Backspace, Delete, Shift-Enter, a paste, typing on the blank line) adds or
        removes the blank line between two paragraphs, or between an item's text and its next
        paragraph. Enter, which makes a node either way, doesn't count;
      - a node becomes an item or stops being one at its depth (outdent at the top level, the first
        item unwrapped, Enter on an empty last item), or typing or the host's key changes structure
        (a list marker typed or deleted, a setext underline). A paragraph indented into an item
        under the node above, or an item outdented out of a paragraph's list, doesn't count;
      - a paragraph takes in a list or releases one, or a node moves into or out of a paragraph's
        list. Indent and outdent don't count (a node indented into the list above it or outdented
        out of one, the later siblings an outdented node takes);
      - a heading is unwrapped or joined into the text above, and its section goes to the section
        above;
      - where a move or a copy lands depends on Markdown's section order: a node moved past a
        sibling heading lands in its section, one at a nested section's end crosses more than one
        level, a heading moves only among headings of its level. A move into the next section at
        the end of one, as outliners cross into the next parent, doesn't count;
      - a heading's level changes (indent, outdent, setext to ATX);
      - a held empty paragraph or empty line goes when the caret leaves it (deleting one doesn't
        count);
      - ourus refuses, or puts the text elsewhere, because Markdown can't write the result, though a
        block could hold it: two lines in a title, a split table row, two empty paragraphs in a row,
        adjacent indented code;
      And only where the projection can't play it either: a case whose outliner run, its paragraphs
      blocks (`sxs/`'s `as blocks`), plays faithfully and mostly agrees isn't tagged, whichever of
      these it meets (checked 2026-10-25 by playing every tagged case in the outliners: 56 untagged).
    - `markup-heading`, `markup-task`, `markup-fence`: a step at markup that an editor may hold as
      text or as a block's attribute, where ourus has a boundary (a driver opts out of those it
      can't compare):
      - `markup-heading`: at a heading's title start, its closing `#`s or a setext underline, a
        Cmd-Backspace up to it, a join that takes in a heading below;
      - `markup-task`: before a task's checkbox or right after it, a Cmd-Backspace up to it, on a
        task with nothing but its checkbox, a join that takes in a task below;
      - `markup-fence`: on a code, math or comment fence line (or a structural command from one,
        which puts the caret in the code), a join of text into code, or a join or split of code
        lines that would make a fence;
    - `enter-in-fence`: Enter on a fenced block's content line, code or math (not on a fence's
      line: `markup-fence`). An editor whose code and math are a block's text, with no editor of
      their own, splits the block there, as on any text (a driver of such an app refuses the tag);
      `spec.test.ts` checks every case has it where, and only where, it applies.
    - `pending`: no fact about the case but its state: behavior agreed on but not built yet. It is
      reported as a todo, and fails once it passes, so the tag goes then;
  - the other options of ourus's config (`src/config.ts`): `outdent` (`direct`, the default, or
    `logical`), `bullet` (`-`, the default, `*` or `+`), `quotes` (`text`, the default, `atom` or
    `container`: a case whose quote of one paragraph is a node, `container`'s, says so), `enterOnEmptyItem` (`sibling`, the
    default, `outdent`, `exit` or `unwrap`), `enterMidItem` (`sibling`, the default, or `child`),
    `enterAtTextStart` (`into`, the default, or `stay`), `backspaceAtTopItem` (`unwrap`, the
    default, or `refuse`), `backspaceAtItemStart` (`join`, the default, `body`, `unwrap` or `logseq`), `emptyItemWithChildren` (`lift`, the default, or `refuse`),
    `joinWithChildren` (`join`, the default, or `refuse`), `enterTask` (`continue`, the default, or
    `plain`), `enterSplitSpace` (`trim`, the default, `drop` or `start`),
    `handleFenceContents` (`true`, the default, or `false`), `closeBackticks` (`fences`, the default, `all` or `none`), `headingEditing` (`text`, the default, or `block`), `taskEditing` (`checkbox`, the default,
    `text`, `block` or `unwrap`), `copyAtCaret` (`node`, the default, or `host`), `copySelection` (`text`, the
    default, or `nodes`), `pasteSeams` (`closed`, the default, or `open`), `pasteOverSelection` (`replace`, the default, or
    `ignore`: a paste of nodes only), `pasteLines` (`text`, the
    default, or `items`), `pastePlainLines` (`text`, the default, `items`, `enter` or `host`), `pasteAtTextStart` (`after`, the default, or `before`), `pasteOnParent`
    (`children`, the default, or `after`), `pasteParagraphList` (`siblings`, the default, or
    `children`), `pasteListForm` (`destination`, the default, or `own`), `markup`
    (`text`, the default, or `decorated`), and the quirks, an app's mechanics rather than a rule,
    named by the apps: `quirkEnterMidHeading` (`default` or `workflowy`), `quirkPasteCaret`
    (`default`, `roam` or `athens`), `quirkPasteText` (`default` or `dynalist`).

How other outliners do on the same files (Logseq, ...) is measured by replaying them there:
[`sxs/`](../sxs/README.md).
