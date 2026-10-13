# `commands/`: what the keys of an outliner do

The top layer, and the one a host calls. A command takes an `OutlineState` and a selection, and
returns either the changes that do what the key means (verified), a refusal that says why, or
"not mine": the host runs its own default. Commands are pure: they never touch editor state; the
host commits what they return.

The layer's place among the others: [`11-api.md`](../../11-api.md). Behaviour is specified, case by
case, in [`spec/`](../../spec/): drawn editor states and the actions between them.

## The API

Two functions and their types:

```ts
import { executeCommand, settlePlaceholders } from 'ourus';

const result = executeCommand(state, { type: 'indent' }, { anchor, head });
if (result.status === 'applied') {
  view.dispatch({ changes: result.changes, selection: result.selection });   // CM6 takes them as they are
  state = result.state;
} else if (result.status === 'rejected') {
  status.textContent = result.reason;      // swallow the key, say why
}                                          // 'notApplicable': let the editor do its default

const settled = settlePlaceholders(state, caret);   // after the caret moves
if (settled) { view.dispatch({ changes: settled.changes }); state = settled.state; }
```

### `executeCommand(state, command, selection): CommandResult`

`command` is a `Command`, a value (spec files, the test player and the Logseq runner name commands
as data). Names follow W3C `inputType` where one exists:

| `type` | Key | What it does |
| --- | --- | --- |
| `indent`, `outdent` | Tab, Shift-Tab | The selected nodes go under the node above, or out of their parent. Heading levels change; paragraphs become items and back. |
| `moveBlockUp`, `moveBlockDown` | Alt-↑, Alt-↓ | The selected nodes swap with the sibling above or below, crossing into the parent's sibling at an edge. |
| `enter` | Enter | Splits the node at the caret: a new item, paragraph or section paragraph. |
| `shiftEnter` | Shift-Enter | A line break inside the node's text, which stays one node. |
| `deleteContentBackward` | Backspace | At a node's text start: joins it to the node above. |
| `deleteContentForward` | Delete | At a node's text end: joins the node below to it. |
| `deleteSoftLineBackward` | Cmd-Backspace | Deletes back to the text start of the line, never into a marker. |
| `pasteStructured` (`text`) | Ctrl-V | Markdown pasted as nodes, where Enter would put a new node. |
| `pastePlain` (`text`) | Ctrl-Shift-V | Text pasted into the node, its line breaks as Shift-Enter's. |
| `deleteSubtree`, `duplicateNode` | | The selected nodes go, or a copy goes below them, with their subtrees. |

`selection` is `{ anchor, head }`, as CM6's `selection.main` is. The selected nodes of a structural
command are the topmost nodes whose own lines the selection touches; they must be contiguous
siblings of one kind.

**`CommandResult`** is one of:

- **`applied`**: `state` (the next `OutlineState`, ids carried), `changes` (`ChangeSpec[]`, in the
  old text's coordinates), `selection` (in the new text). Every applied command is verified: the
  re-parsed outline equals what the command meant.
- **`rejected`**: `reason` (`RejectReason`) and sometimes a `detail`. The key does nothing; the host
  should swallow it.
- **`notApplicable`**: the command has nothing to do here (Enter in the middle of a code line, with
  `handleFenceContents: false`; Backspace inside text). The host runs its default.

**`RejectReason`:**

| Reason | When |
| --- | --- |
| `no-previous-sibling`, `no-next-sibling` | Indent or move with nothing above or below to go to. |
| `at-top-level` | Outdent of a node that has no parent item to leave. |
| `at-h1-bound`, `at-h6-bound` | A heading level would go past 1 or 6. |
| `non-contiguous`, `mixed-kinds` | The selected nodes aren't contiguous siblings, or not of one kind. |
| `nothing-above` | Backspace at the first node, with nothing to join into. |
| `has-children` | A join that would have to drop children. |
| `not-expressible` | Markdown can't say what the command means here (an empty node away from the caret, a heading that would span lines, ...); `detail` says what. |
| `encoding-failed` | The changes didn't re-parse as intended. A bug to fix, never a tolerated rate. |

### `settlePlaceholders(state, caret)`

Placeholders hold empty nodes the text can't express yet (see `outline/`). When the caret leaves
one, call this: a placeholder the text can do without is dropped; one it can't is resolved (an
empty item set off by a blank line, an empty paragraph's line removed). Returns the changes and the
next state, or null when nothing changes.

### The host's contract

1. Keep one `OutlineState` per document. On every edit that isn't a command (typing, the editor's
   own paste, undo), `state = state.update(changes, { caret })` with the caret where it lands.
2. On a command key, `executeCommand`; commit an applied result's changes and selection together,
   and take its `state` (no need to re-parse).
3. When the caret moves, `settlePlaceholders`; commit its changes as an edit of its own.
4. Keep placeholders in the history: undo and redo restore the placeholders of the state they
   return to (`state.update(changes, { drop, placeholders })`). CM6 can carry them with
   `invertedEffects`; the demo does.

`demo/cm6/main.ts` is a complete CM6 host; `test/player.ts` plays the same contract for the spec.

### Config

How commands behave where users disagree is a `Config` option, set when the state is made
(`OutlineState.parse(text, { config })`): `outdent` (`direct` or `logical`), `bullet`,
`enterOnEmptyItem`, `handleFenceContents`, `headingEditing`, `taskEditing`, `pasteMidText`,
`deleteAtGap`, and `flavor`. Each option's choices and default are documented in `src/config.ts`.

## Inside

One file per family of commands; a host doesn't import them:

| File | What |
| --- | --- |
| `index.ts` | `executeCommand`, the dispatch on `command.type`, the types |
| `structure.ts` | indent, outdent, moves, heading levels, delete, duplicate: the lowest family (the others call it, never the reverse; the boundary test checks) |
| `enter.ts` | Enter and Shift-Enter |
| `join.ts` | Backspace, Delete, Cmd-Backspace |
| `code.ts` | fenced code: Enter, Backspace and Delete on code lines and fences |
| `paste.ts` | structured and plain paste |
| `settle.ts` | `settlePlaceholders` |
| `context.ts` | `CommandContext` (the state, the selection, and what every command needs of them), `Operands`, shared helpers |
| `plan.ts` | `CommandPlan`, the runner: renumbering, verification by re-parsing, alternatives, refusal diagnosis |

A command describes its result as an `OutlinePlan` (`encoder/`) and either has the encoder write it
(structural edits: `ctx.encode(plan)`), or writes the changes itself, using the encoder's prefix,
marker and escape helpers (local edits: `ctx.caret(changes, caret, plan)`). Both go through the same
runner, which applies the changes to a new state and checks it against the plan.

## Tests

`test/commands/commands.test.ts` (changes, text and selection agree; round trips; ids), the spec
(`test/spec.test.ts` over `spec/*.md`, every example in every flavor), the placeholder lifecycle
(`test/placeholders.test.ts`), and the differential (`npm run test:diff`), which compares every
command's outcome with the last commit's.
