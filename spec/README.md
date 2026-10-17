# The behaviour spec

The files here say what an outliner does, as examples: an editor state, what the user does, and
the state that results. `npm test` runs every example against the ourus core
(`test/spec.test.ts`). File titles name the editing behaviour or familiar key, while executable
actions use current command names, so the same files can drive editors with different keymaps.

- [Indent (Tab)](indent.md): `indent`.
- [Outdent (Shift-Tab)](outdent.md): `outdent`.
- [Move subtree up (Alt-Shift-Up)](move-subtree-up.md): `moveSubtreeUp`.
- [Move subtree down (Alt-Shift-Down)](move-subtree-down.md): `moveSubtreeDown`.
- [Enter](enter.md): `enter`.
- [Shift-Enter](shift-enter.md): `shiftEnter`.
- [Backspace](backspace.md): `deleteContentBackward`.
- [Delete](del.md): `deleteContentForward`.
- [Paste](paste.md): `pasteStructured`, `pastePlain`.
- [Fenced code](fences.md): Enter and Shift-Enter in a fenced code block, and in the other blocks
  of lines (math, comments, indented code).
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
- [`quotes.md`](quotes.md): quotes and callouts as containers.
- [`z-open.md`](z-open.md): open questions, one each, drawing what ourus does today where no
  command file does, with the alternative and a recommendation; a settled one moves to its
  command's file.
- [Typing](typing.md): what the host types, with no ourus command, and what the guard is to do.

Each command has its own spec, named for its key or editing behaviour. Its intro lists the
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
text, and for edits with the caret in markup that ourus would refuse (`editInMarkup: host`).

## What every case holds to

No command breaks these; a case that seems to need to is wrong, or is a refusal.

1. **Exactly the intended structure, or a clean refusal**, with a reason Markdown imposes
   (`not-expressible`, `nothing-above`, ...). `encoding-failed` is a bug, never an outcome.
2. **Lossless and minimal.** Nothing the user wrote is lost; text the edit isn't about stays byte
   for byte (other lines, the node's own text, hard-break spaces, code, tabs, CRLF, the numbers of
   untouched lists). Prefixes, markers and blank lines change only where the structure requires.
3. **The host's key only inside text.** At a markup boundary (a marker, a checkbox, `#`s, a fence
   line, a quote's `>`, a callout title, a blank line between nodes) ourus does the edit or refuses.
   With the caret in markup itself, where only the host puts it, an edit ourus would refuse is the
   host's under `editInMarkup: host` (the default), whatever the text then reads as; `refuse`
   keeps the refusal ([Delete23](del.md#delete23), [Delete16c](del.md#delete16c)).
4. **Other nodes keep their parents**: a command changes the parents of its operands, and of the
   neighbors its own definition names, never of any other node. Those neighbors: direct outdent's
   later siblings, the section an unwrapped heading releases
   ([Backspace35](backspace.md#backspace35)), the children of an item whose text becomes a block of
   lines, which holds none ([Outdent19](outdent.md#outdent19)), what a pasted heading takes in
   ([Paste34](paste.md#paste34)), and the list a paragraph that stays takes in when a move leaves it
   right above one ([MoveUp35](move-subtree-up.md#moveup35)).
5. **Inverse pairs invert** (indent and outdent, up and down, Enter and Backspace, Shift-Enter and
   Backspace), or at least their outline where Markdown forces a difference, which the case states.
   One difference is by design: a split at a line break inside a node's text joins back glued, as a
   join puts the text at the end of the text above, wherever it came from
   ([Enter51](enter.md#enter51)); between paragraphs Backspace takes only the blank line, and the
   lines come back ([Backspace12](backspace.md#backspace12)).
6. **The caret never ends in markup**: after a command it is in a node's text, never where typing
   would break the node.
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
- **The blocks before the first quote are where the test starts**: a config block (a `yaml`
  block), if any, then one `buffer`, and nothing else. The clipboard the test starts with is in the
  config block (see below).
- **A quote lists actions**, applied in order to the current state.
- **The blocks after a quote are what must hold then**, and they become the current state:
  - `buffer`: the drawn editor state;
  - `clipboard`: the clipboard's text, ending with a line break;
  - `result`: what ourus made of the last action, which must be one of its commands:
    `applied`, `notApplicable` (the host's default ran instead) or `rejected: <reason>`. Other
    editors check buffers only.

  What isn't drawn isn't checked. The blocks of one state can come in any order, at most one of
  each kind.
- **A test's name is the headings above it**, below the file's title. Per-command files use short
  case IDs (`Enter1`, `ShiftEnter1`, `MoveUp1`) and explain the behaviour in prose below each ID.
  Keep assigned IDs stable as cases are added. File titles use keys and semantics (Enter, Move
  subtree up); mention the current API name in backticks in the prose (`shiftEnter`,
  `moveSubtreeUp`). Executable actions retain current API names until the command API is renamed.
- Prose can go anywhere, and other fenced blocks are ignored.

## Drawing a buffer

| glyph | meaning |
| --- | --- |
| `┃` | the caret |
| `«…»` | a selection; its head is the end `┃` touches, or the end after `»` when no caret is drawn |
| `◌` | a placeholder: the end of an empty line the document reads as if text had been typed there; right before a space that follows a list marker, that space, read as text (a deleted character's place) |
| `→` | a tab |
| `␍` | a carriage return |

A clipboard uses `→` and `␍` too. A buffer's last line always ends with a line ending. A buffer
that contains a code fence needs a longer fence of its own (`` ````buffer ``).

## Actions

| action | what the user does |
| --- | --- |
| `indent`, `outdent` | indent or outdent the node(s) at the selection |
| `moveSubtreeUp`, `moveSubtreeDown` | move them past their sibling, or at the edge of their parent into the parent's sibling |
| `enter` | Enter |
| `shiftEnter` | Shift-Enter |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete |
| `"text"` | types the text, replacing the selection |
| `pasteStructured` | Ctrl-V: pastes the clipboard, Markdown as nodes at the end of a node's text, else as plain text |
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
structural commands by ourus (`indent`, `outdent`, `moveSubtreeUp`, `pasteStructured`, …); and caret
motions as CodeMirror's commands. The core runner plays them the way an editor host does: an ourus
command runs, and where it returns `notApplicable` the host's default runs instead (a line break,
deleting a character). Placeholders the caret leaves are settled after every action.

Caret motions are here so a test can move the caret between actions; [cursor.md](cursor.md) has
their cases, drawn so a column means the same place in any font. The core runner moves it in a
monospace font with tab stops of 4, which is enough for that. A real editor moves the caret as
its own layout and GUI dictate (wrapped lines, proportional fonts, bidi text), and a runner
driving one leaves motion to the editor; a test whose outcome depends on exactly where a motion
lands belongs to that editor's own tests.

Cases that only need the caret to leave a placeholder use document and line boundaries instead
of vertical motion, so they don't prescribe where Up or Down lands relative to node markers.

## Options

Options are YAML, `key: value` lines, every value read as a string (YAML's failsafe schema:
`false` is the word; a value YAML reads otherwise, like `*`, is quoted: `bullet: "*"`). Options
for a whole file go in frontmatter; options for one test go in a config block, a `yaml` block
before its first block, combined with the frontmatter, and they win over it:

````md
## Indent18

```yaml
status: pending
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
(`clipboard: "1. Introduction"`):

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
(`` ````yaml ``), as a buffer does.

An unknown option, or a value an option doesn't take, is an error. Defined:

  - `status`: `pending` marks behaviour agreed on but not built yet. It is reported as a todo, and
    fails once it passes, so it gets promoted. `ready` (the default) is the rest; a test can set it
    over a file's `status: pending`;
  - `flavor`: the Markdown flavor the text is read in, `commonmark`, `gfm` or `obsidian`. An example
    that names none runs in each of them, with the same expectations;
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
  - the other options of ourus's config (`src/config.ts`): `outdent` (`direct`, the default, or
    `logical`), `bullet` (`-`, the default, `*` or `+`), `enterOnEmptyItem` (`sibling`, the
    default, or `outdent`), `enterMidItem` (`sibling`, the default, or `child`),
    `enterAtTextStart` (`into`, the default, or `stay`), `backspaceAtTopItem` (`unwrap`, the
    default, or `refuse`), `emptyItemWithChildren` (`lift`, the default, or `refuse`),
    `handleFenceContents` (`true`, the default, or `false`), `headingEditing` (`text`, the default, or `block`), `taskEditing` (`checkbox`, the default,
    `text` or `block`), `pasteStructuredLines` (`text`, the default, or `items`),
    `pasteStructuredMidText` (`split`, the default, or `after`), `pasteStructuredAtEnd` (`after`,
    the default, or `join`), `pasteStructuredOnParent` (`children`, the default, or `after`),
    `pasteStructuredParagraphList` (`siblings`, the default, or `children`), `pasteStructuredListForm` (`text`, the default, `literal`, `drop` or
    `own`), `deleteAtGap` (`join`, the
    default, or `gap`), and `editInMarkup` (`host`, the default, or `refuse`).

How other outliners do on the same files (Logseq, ...) is measured by replaying them there:
[`sxs/`](../sxs/README.md).
