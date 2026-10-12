# The behaviour spec

The files here say what an outliner does, as examples: an editor state, what the user does, and
the state that results. `npm test` runs every example against the ourus core
(`test/spec.test.ts`). File titles name the editing behaviour or familiar key, while executable
actions use current command names, so the same files can drive editors with different keymaps.

- [Indent (Tab)](indent.md): `indent`.
- [Outdent (Shift-Tab)](outdent.md): `outdent`.
- [Block up (Alt-Shift-Up)](block-up.md): `moveBlockUp`.
- [Block down (Alt-Shift-Down)](block-down.md): `moveBlockDown`.
- [Enter](enter.md): `enter`.
- [Shift-Enter](shift-enter.md): `shiftEnter`.
- [Backspace](backspace.md): `deleteContentBackward`.
- [Delete](del.md): `deleteContentForward`.
- [Paste](paste.md): `pasteStructured`, `pastePlain`.
- [Fenced code](fences.md): Enter and Shift-Enter in a fenced code block.
- [`scenarios.md`](scenarios.md): longer sequences, as a user would type them.
- [`cursor.md`](cursor.md): caret motions, for moving the caret between actions in tests.
- [`undo.md`](undo.md): undo and redo, placeholders included.
- [`gaps.md`](gaps.md): blank lines as the trailing gap of the node above, and the preamble.
- [Delete block](block-delete.md): `deleteSubtree`.
- [Duplicate block](block-duplicate.md): `duplicateNode`.
- [Tasks](tasks.md): Enter and Backspace on tasks.
- [`placeholders.md`](placeholders.md): empty nodes the text can't hold, kept at the caret: when they come and go.
- [`obsidian-true-outliner.md`](obsidian-true-outliner.md): obsidian-true-outliner's measured
  cases and catalogue entries.
- [`quotes.md`](quotes.md): quotes and callouts as containers (postimpl1c §6).
- [`zzz-open.md`](zzz-open.md): open questions, one case each, drawing what ourus does today, with
  what other outliners do; a settled one moves to its command's file.
- [`zzz-redesign.md`](zzz-redesign.md): what the redesign specified and the experiments found that
  isn't settled yet: the guard's cases, escapes, frontmatter (9 of its 14 cases `pending`).
- [`zzz-logseq.md`](zzz-logseq.md): Logseq's behaviour, recorded from Logseq by
  `npm run test:logseq -- --record` (`editor: logseq`; not ourus's contract, and `npm test` skips it).

Each command has its own spec, named for its key or editing behaviour. Case headings use short
IDs; the prose explains each case. Current API names are noted in backticks in each file, and
executable actions keep those names until the API is renamed.

Outdent's treatment of later siblings is a config option, `outdent`: [direct](outdent.md#direct-outdent)
(the default, as in Logseq) makes them children of the moved item, preserving document order;
[logical](outdent.md#logical-outdent) keeps them with their parent. Cases that depend on it live in those
sections, or set it in their `config` block.

Some empty nodes have no Markdown of their own. A placeholder (`◌`) holds one open while the user
edits it; [placeholders.md](placeholders.md) specifies what happens when it is filled or left.
Applied commands are checked by re-parsing their output against the intended outline. Where a
command does not apply, the host runs its own default.

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
- **The blocks before the first quote are where the test starts**: a `buffer` (required) and,
  optionally, a `clipboard`. A `config` block, if any, comes first (see below).
- **A quote lists actions**, applied in order to the current state.
- **The blocks after a quote are what must hold then**, and they become the current state:
  - `buffer`: the drawn editor state;
  - `clipboard`: the clipboard's text;
  - `result`: what ourus made of the last action, which must be one of its commands:
    `applied`, `notApplicable` (the host's default ran instead) or `rejected: <reason>`. Other
    editors check buffers only.

  What isn't drawn isn't checked. The blocks of one state can come in any order, at most one of
  each kind.
- **A test's name is the headings above it**, below the file's title. Per-command files use short
  case IDs (`Enter1`, `ShiftEnter1`, `BlockUp1`) and explain the behaviour in prose below each ID.
  Keep assigned IDs stable as cases are added. File titles use keys and semantics (Enter, Block up);
  mention the current API name in backticks in the prose (`shiftEnter`, `moveBlockUp`). Executable
  actions retain current API names until the command API is renamed.
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
| `indent`, `outdent` | indent or outdent the node(s) at the selection |
| `moveBlockUp`, `moveBlockDown` | move them past their sibling, or at the edge of their parent into the parent's sibling |
| `enter` | Enter |
| `shiftEnter` | Shift-Enter |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete |
| `"text"` | types the text, replacing the selection |
| `pasteStructured` | Ctrl-V: pastes the clipboard, Markdown as nodes at the end of a node's text, else as plain text |
| `pastePlain` | Ctrl-Shift-V: pastes the clipboard into the node's text, its line breaks as Shift-Enter's |
| `deleteSubtree`, `duplicateNode` | the commands of the same names |
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
structural commands by ourus (`indent`, `outdent`, `moveBlockUp`, `pasteStructured`, …); and caret
motions as CodeMirror's commands. The core runner plays them the way an editor host does: an ourus command runs,
and where it returns `notApplicable` the host's default runs instead (a line break, deleting a
character). Placeholders the caret leaves are settled after every action.

Caret motions are here so a test can move the caret between actions; [cursor.md](cursor.md) has
their cases. The core runner moves it in a monospace font with tab stops of 4, which is enough for
that. A real editor moves the caret as
its own layout and GUI dictate (wrapped lines, proportional fonts, bidi text), and a runner
driving one leaves motion to the editor; a test whose outcome depends on exactly where a motion
lands belongs to that editor's own tests.

Cases that only need the caret to leave a placeholder use document and line boundaries instead
of vertical motion, so they don't prescribe where Up or Down lands relative to node markers.

## Options

Options are `key: value` lines. Options for a whole file go in frontmatter; options for one test go
in a `config` block before its first block, combined with the frontmatter, and they win over it:

````md
## Indent18

```config
status: pending
bullet: +
```

```buffer
intro

b┃
```
````

An unknown option, or a value an option doesn't take, is an error. Defined:

  - `status`: `pending` marks behaviour agreed on but not built yet. It is reported as a todo, and
    fails once it passes, so it gets promoted. `ready` (the default) is the rest; a test can set it
    over a file's `status: pending`;
  - the options of ourus's config (`src/config.ts`): `outdent` (`direct`, the default, or
    `logical`), `bullet` (`-`, the default, `*` or `+`), `enterOnEmptyItem` (`sibling`, the
    default, or `outdent`), `handleFenceContents` (`true`, the default, or `false`),
    `headingEditing` (`text`, the default, or `block`), `taskEditing` (`text`, the default,
    `checkbox` or `block`), and `pasteMidText` (`after`, the default, or `split`);
  - `editor`: whose behaviour the examples draw: `ourus` (the default, run by `npm test`) or
    `logseq` (recorded from and checked against Logseq by `npm run test:logseq`; not ourus's
    contract).
