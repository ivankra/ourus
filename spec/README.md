# The behaviour spec

The files here say what an outliner does, as examples: an editor state, what the user does, and
the state that results. `npm test` runs every example against the ourus core
(`test/spec.test.ts`). The examples name what the user does, never a key, so the same files can
also drive other editors and outliners, each with its own keymap.

- [`commands.md`](commands.md): each ourus command, one rule at a time.
- [`scenarios.md`](scenarios.md): longer sequences, as a user would type them.
- [`gaps.md`](gaps.md): blank lines as the trailing gap of the node above, and the preamble.
- [`structure.md`](structure.md): delete subtree, duplicate, toggle task, convert kind.
- [`placeholders.md`](placeholders.md): empty nodes the text can't hold, kept at the caret: when they come and go.
- [`guard.md`](guard.md): native edits that would break the structure, waiting on the guard (all `pending`).
- [`obsidian-true-outliner.md`](obsidian-true-outliner.md): obsidian-true-outliner's measured
  cases and catalogue entries.
- [`quotes.md`](quotes.md): quotes and callouts as containers (postimpl1c §6), all but three
  `pending`.
- [`redesign.md`](redesign.md): what the redesign specifies: its decisions (what the first
  prototype passes pins them) and the bugs and gaps the experiments and reviews found, mostly
  `pending`.
- [`logseq.md`](logseq.md): Logseq's behaviour, recorded from Logseq by `npm run test:logseq --
  --record` (`editor: logseq`; not ourus's contract, and `npm test` skips it).

## A test

````md
## formatIndent (Tab)

### Becomes last child of previous sibling

The item becomes the last child of the item above.

```buffer
- a
- b┃
```

> formatIndent "c"

```buffer
- a
  - bc┃
```
````

- **Every test has a heading of its own**, so it can be linked to (`commands.md#becomes-last-child-of-previous-sibling`).
  A test starts at its first block after its heading and ends at the next heading; a heading holds
  at most one test, and prose-only headings group the tests below them. `---` separates nothing
  and is an error.
- **Headings are unique in their file** (compared as anchors: case and punctuation aside), since a
  repeated one would give an ambiguous link and an ambiguous name. A repeat is an error.
- **The blocks before the first quote are where the test starts**: a `buffer` (required) and,
  optionally, a `clipboard`.
- **A quote lists actions**, applied in order to the current state.
- **The blocks after a quote are what must hold then**, and they become the current state:
  - `buffer`: the drawn editor state;
  - `clipboard`: the clipboard's text;
  - `result`: what ourus made of the last action, which must be one of its commands:
    `applied`, `notApplicable` (the host's default ran instead) or `rejected: <reason>`. Other
    editors check buffers only.

  What isn't drawn isn't checked. The blocks of one state can come in any order, at most one of
  each kind.
- **A test's name is the headings above it**, below the file's title
  (`insertParagraph (Enter) › Splits item at the caret`). Name a test for what it shows, not for
  its action: the section already says that. Sections about one action are named by the action,
  then its typical key in parentheses (`formatIndent (Tab)`).
- Prose can go anywhere, and other fenced blocks are ignored.

## Drawing a buffer

| glyph | meaning |
| --- | --- |
| `┃` | the caret |
| `«…»` | a selection; its head is the end `┃` touches, or the end after `»` when no caret is drawn |
| `◌` | a placeholder: the end of an empty line the document reads as if text had been typed there; right before a space that follows a list marker, that space, read as text (a deleted character's place) |
| `→` | a tab |
| `␍` | a carriage return |

A `clipboard` block uses `→` and `␍` too. A buffer's last line always ends with a line ending. A buffer that contains a code fence needs a
longer fence of its own (` ````buffer `).

## Actions

| action | what the user does |
| --- | --- |
| `formatIndent`, `formatOutdent` | indent or outdent the node(s) at the selection |
| `moveUp`, `moveDown` | move them past their sibling |
| `insertParagraph` | Enter |
| `insertLineBreak` | Shift-Enter |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete |
| `"text"` | types the text, replacing the selection |
| `insertFromPaste` | pastes the clipboard: Markdown as nodes at the end of a node's text, else as plain text |
| `deleteSubtree`, `duplicateNode`, `toggleTask` | the commands of the same names |
| `convertToParagraph`, `convertToListItem`, `convertToHeading1` … `convertToHeading6` | convert the node(s) to another kind |
| `deleteSoftLineBackward` | Cmd-Backspace: deletes back to the start of the line's text |
| `cursorCharLeft`, `cursorCharRight` | moves the caret a character; a selection collapses to that end |
| `cursorLineUp`, `cursorLineDown` | moves the caret a line, keeping a goal column while it keeps moving up and down |
| `cursorLineBoundaryBackward` | Home: to the start of the text, then of the line |
| `cursorLineBoundaryForward` | End: to the end of the line |
| `cursorDocStart`, `cursorDocEnd` | to the start or end of the document |
| `select…` (`selectCharLeft`, `selectLineUp`, …) | the same motion, extending the selection |
| `undo`, `redo` | the host's undo and redo: each action that changed the text is one step; a step restores the text and the caret, nothing else |

Names come from the W3C Input Events `inputType`s where one exists, and from CodeMirror's commands
for caret motion. The core runner plays them the way an editor host does: an ourus command runs,
and where it returns `notApplicable` the host's default runs instead (a line break, deleting a
character). Placeholders the caret leaves are settled after every action.

Caret motions are here so a test can move the caret between actions. The core runner moves it in
a monospace font with tab stops of 4, which is enough for that. A real editor moves the caret as
its own layout and GUI dictate (wrapped lines, proportional fonts, bidi text), and a runner
driving one leaves motion to the editor; a test whose outcome depends on exactly where a motion
lands belongs to that editor's own tests.

## Flags and options

- `pending` on a test's first buffer (` ```buffer pending `) marks behaviour agreed on but not
  built yet. It is reported as a todo, and fails once it passes, so it gets promoted.
- Options for a whole file go in frontmatter (`key: value` lines); one test overrides them with
  `key=value` words on its first buffer's info string. An unknown option is an error. Defined:
  - `editor`: whose behaviour the examples draw: `ourus` (the default, run by `npm test`) or
    `logseq` (recorded from and checked against Logseq by `npm run test:logseq`; not ourus's
    contract).
