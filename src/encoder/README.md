# `encoder/`: an outline plan written as Markdown

The layer above the outline, and the parser's inverse: where the parser turns text into structure,
the encoder turns structure into changes to the text. A command says what the outline should become
as an **`OutlinePlan`**; the **`OutlineEncoder`** writes that plan as changes to the current text,
keeping every line it can. It also holds what hand-written edits need to write Markdown correctly:
prefixes, list markers, escapes, renumbering.

```
parser/    text       → structure   SyntaxTree.parse(text)
encoder/   structure  → changes     new OutlineEncoder(state).encode(plan)
```

The layer's place among the others: [`11-api.md`](../../11-api.md). Hosts don't call it; its user is
`commands/`.

## Who does what

```text
command              → an OutlinePlan: what the outline should become
encoder.encode(plan) → an EncodeResult: candidate changes and where things land
command runner       → applies them to a new OutlineState, checks it reads as the plan, retries
host                 → commits the verified result in the editor
```

The command decides *what*; the encoder decides *how it's written*; the runner checks they agree.

## The API

```ts
import { OutlineEncoder, OutlinePlan } from '../encoder/index.ts';

// a structural command: the operands become the last children of the item above
const plan = OutlinePlan.from(state).remove(ops.nodes).append(ops.prev, 'last', ops.nodes);
const encoded = new OutlineEncoder(state).encode(plan);    // EncodeResult, or why it can't be written
if (typeof encoded === 'string') return reject('not-expressible', encoded);
// encoded.changes are a candidate: the command runner verifies them

// a hand-written local edit: a new item after `item`
const enc = new OutlineEncoder(state);
const insert = eol + enc.siblingPrefix(item) + enc.markerText(item, true) + ' ';
```

### `OutlinePlan`: the outline as a command wants it

The whole outline, root and all. Untouched subtrees are the current outline's own nodes, by
reference; a change copies only the path from the root to it. So a plan describes the whole outline
but costs only what changed. Immutable: every edit returns a new plan.

| Member | What it does |
| --- | --- |
| `static from(state)` | A plan equal to `state`'s outline, to change. |
| `remove(nodes)` | Without `nodes` (siblings), under the parent the plan finds. |
| `place(where, sibling, nodes)` | `nodes` `'before'`, `'after'` or `'instead'` of `sibling`. |
| `append(parent, 'first' \| 'last', nodes)` | `nodes` added to `parent`'s children. |
| `setText(node, text)` | `node`'s own text set (trimmed lines joined by `\n`, as verification compares). |
| `update(node, change)` | `node` replaced by `change` of a copy of it: for anything the others don't cover. |
| `root`, `changed` | The plan's root, and whether anything changed. |
| `withOwnedLists()` | The plan as its text will read: items right after a paragraph in a section are its children. The encoder and verification apply it; commands needn't. |
| `differenceFrom(actual, current, 'tree' \| 'flat')` | Where a re-parsed `actual` state differs from the plan (kind, heading level, text, block type; not ids), or null. `flat` compares in document order, for heading-level changes. |
| `static created(kind, text)`, `static copy(state, node)` | A new node; a copy meaning what `node` means (paste, duplicate). |
| `static isPlanned(node)`, `static editable(node)` | Whether a node is a copied or new one; a copy of a node to change. |

The methods take nodes, not ids: `plan.remove(ops.nodes).place('after', parent, ops.nodes)`.
**An edit targets a node with an id** (`PlanTarget`): one of the current outline's, or a copy of one.
A node the command creates has no id yet, so it can't be told apart from other new nodes: it is
payload, built complete (children included) before it goes in, never the target of a later edit.
The types enforce this, and a cast past them throws rather than editing the wrong node. Parents are
found by structure (the node whose children hold the target), so a new node can hold old ones.

**`OutlinePlanNode`** is a copied or new node: `id` (null for a new one), `kind`, `original` (the
node it was), and what differs: `text`, `level`, `blockType`, and what to write: `lines`, `marker`,
`exactMarker`, `gap`. **`PlanTree`** is either kind of node in a plan.

### `OutlineEncoder`: writing a plan, and the pieces of Markdown

One per document; constructing it computes nothing (what laying out needs is computed when `encode`
first needs it, and kept for the next try).

| Member | What it does |
| --- | --- |
| `encode(plan, { separate?, pad? })` | The plan as changes to the text (`EncodeResult`), or a string saying why it can't be written. |
| `renumber(changes, plan, { identity?, placeholders })` | The extra changes that renumber the ordered lists `changes` add, remove or reorder, or null. |
| `siblingPrefix(node)`, `childIndent(node, child)`, `continuation(pieces)`, `itemContinuation(node)`, `markerText(node, next)` | What starts a new line: at a node's level, inside its containers, in an item's text, with its marker (or the next one's). |
| `escape(text, 'start' \| 'continuation', below?)` | `text` escaped where it would not read as text at a line's start, and where the backslash went. |
| `startOfNode(text, below)` | How text at the start of a new node reads: a list marker it becomes, or a block start it needs escaping from. |
| `interruptsParagraph(text)` | Whether `text` on the line after a paragraph starts a block of its own. |

**`EncodeResult`**: `changes` (`ChangeSpec[]`); `map(pos, assoc?)` (an old position in the new
text: kept text follows its line); `at(node, line, offset)` (where a planned node's line landed, for
placing the caret); `identity` (every kept node's id by where it now starts, for
`OutlineState.update`); `candidates` (seams that could take a blank line).

**`EncodeOptions`**: `separate` (`'after'` or `'around'`: set new text off by a blank line where it
has none), `pad` (which seams get a blank line: the command runner tries none, each, then all).

## How a plan is written

- **Old nodes keep their lines**, shifted to a new column when they land under another parent;
  their subtree moves with them. Lazy continuation lines stay lazy.
- **New and rewritten nodes** are written from their `lines`, with the prefix of where they land
  (a quote's `>`, an item's indentation as one run of whitespace, tabs where the document uses them).
- **List markers are adopted:** an item joining a list takes its bullet, an ordered one its number.
- **Blank lines follow the gap rules** ([`spec/gaps.md`](../../spec/gaps.md)): a node's trailing gap
  travels with it, the gap that ends a scope stays at its end, and nodes arriving from elsewhere
  take the separation of the place they land in.
- **Moves are written as moves:** the lines that keep their order stay where they are (the heaviest
  increasing run), so only the moved text is deleted and inserted.
- **Escapes** follow the flavor (`Flavor.startsBlock`): today CommonMark's blocks in every flavor.
  Flavor-aware escaping changes `escapes.ts` alone.

## Files

`index.ts` (the public API); `outline-plan.ts` (`OutlinePlan` and comparison); `encoder.ts`
(`OutlineEncoder`); internal: `layout.ts` (where each node lands: columns, markers), `lines.ts`
(prefixes, new and rewritten lines), `seams.ts` (units and the blank lines between them),
`changes.ts` (written lines to changes), `indent.ts` (tab style, reindenting), `prefix.ts`,
`escapes.ts`, `renumber.ts`.

## Tests

`test/encoder/outline-plan.test.ts` (path copying, the edits, comparison); the encoder itself is
tested through the commands that use it: `test/commands/`, the spec (`spec/*.md`), and the
differential.
