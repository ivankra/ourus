# `outline/`: a Markdown text read as an outline

The layer above the parser. **`OutlineState`** is an immutable snapshot of one Markdown text read
as an outline: the text, its syntax tree, the outline's nodes, the placeholders, and the config.
Every question about one snapshot is a method on it. It knows nothing about commands or editors;
it only reads.

The layer's place among the others: [`11-api.md`](../../11-api.md).

## Who uses it

- **A host** keeps one `OutlineState` per document, updates it with every edit (typing, paste, undo)
  and hands it to `executeCommand`. It reads the outline for panels, and `homePosition` for Home.
- **`commands/`** ask it everything about the text: the node at the caret, a node's text, the lines.
- **`encoder/`** reads the current outline and lines to write a plan as changes.

## The API

```ts
import { OutlineState } from 'ourus';

let state = OutlineState.parse(text, { config: { flavor: 'obsidian' } });
for (const node of state.root.children) console.log(node.kind, state.headLines(node));  // a panel
const node = state.nodeAt(caret);            // the node whose own text holds the caret, or null
state = state.update(changes, { caret });    // the user typed: ids carried, an emptied node kept
state = state.replace(fileText);             // the file changed on disk: ids kept outside the changed lines
const home = state.homePosition(caret);      // Home: the text start, then the line start
```

### Making and moving a snapshot

| Member | What it does |
| --- | --- |
| `static parse(text, { config?, placeholders? })` | A snapshot of `text`. `config` is a partial `Config` over the defaults. |
| `update(changes, params?)` | The snapshot after `changes` (`ChangeSpec[]`, in this text's coordinates): re-parses incrementally and carries node ids across. |
| `replace(text, params?)` | The same, given the whole new text: the changes are the lines that differ. |

`params` (`OutlineUpdateParams`):

- `caret`: where the caret is after a host's edit. When a deletion would change the outline there
  (emptying a node, widening an item's padding), a placeholder at the caret keeps it as it was.
- `identity`: ids for nodes that moved, which position mapping can't follow (new start offset → id).
  Commands pass it; hosts don't.
- `placeholders`, `drop`: placeholders to add, and this snapshot's to drop. A host's undo restores
  the placeholders of the state it returns to with these.

### What a snapshot holds

| Field | What it is |
| --- | --- |
| `text` | The Markdown source. Everything else is read from it, with the config and the placeholders. |
| `syntaxTree` | Its parse (see `parser/`), updated incrementally from snapshot to snapshot. |
| `root` | The outline's root (`kind: 'root'`); its children are the top-level nodes. |
| `nodes` | Every node in document order, root first. |
| `placeholders` | Offsets read as if text had been typed there: empty nodes the text can't hold yet (below). |
| `config` | How commands behave on this document; every later snapshot keeps it. |

### Questions about it

| Group | Methods |
| --- | --- |
| Lines and positions | `line(i)`, `lines`, `lineAt(pos)`, `markerFrom(item)`, `markerTo(item)`, `textStart(pos)`, `homePosition(pos)` |
| Nodes | `node(id)`, `nodeAt(pos)`, `nodeAtLine(line)`, `before(node)`, `after(node)` (document order), `lastDescendant(node)` |
| A node's text | `headLines(node)` (its own text, line by line, without markers), `headRange(node)`, `headStart(node)`, `nodeText(node)` (what verification compares), `contentOf(node)` (its lines, gap and marker as written) |
| Emptiness | `isEmpty(node)`, and the static `OutlineState.isEmptyText(text)`: the one definition of "empty" (nothing, or only a task's checkbox) |

### `OutlineNode`

Plain data: `id`, `kind` (`root`, `heading`, `item`, `paragraph`, `quote`, `atom`), `block` (the
parser's block: the item, or the block itself), `head` (the block holding the node's own text, or
null), `parent`, `children`, `depth`, `startLine`, `headEndLine`, `endLine`.

Nodes hold line numbers and no text, on purpose: when an edit keeps the parser's blocks (typing
within a line), the next snapshot shares the whole outline, ids and all, which is what makes a
keystroke cost 0.1 ms. So a node's text is always asked of the snapshot (`headLines(node)`), never
of the node.

## The outline read from Markdown

- **Headings** own their section: the nodes after them, up to the next heading of their level or
  higher, within their container.
- **List items** are nodes (lists are not). An item owns its first block as its text, if that is a
  paragraph, heading, code or HTML block, and holds every other block as children.
- **Paragraphs** are leaves, but in a section (the root's or a heading's children) a paragraph owns
  the lists right after it, blank line or not: `Groceries:` then `- milk` is one node with a child.
- **Quotes** are containers, their blocks their children; a callout's title is its text.
- **Atoms:** code, HTML, thematic breaks, reference definitions, tables, math and comment blocks,
  footnote definitions. Frontmatter is a preamble, not a node.
- **Blank lines** belong to the node above them, as its trailing gap ([`spec/gaps.md`](../../spec/gaps.md)).

## Ids

A node keeps its id across `update` when `identity` names it, or else when its first line maps onto
the first line of a node of the same kind after the change. A line's start maps past text inserted
at it, so typing, indenting or opening a line above keeps a node's id; a node whose first line was
deleted is gone, and a new node gets a fresh id. Commands declare ids for nodes they move, so moves
keep them too. Ids are opaque, and stable within one lineage of snapshots.

## Placeholders

Some empty nodes have no Markdown of their own: `- a` then `  - ` is a setext heading, not an empty
child; an empty line is no paragraph. A placeholder is the end of such a line, read as if text had
been typed there, so the empty node exists while the user is about to fill it. It goes away when
its line gets text. When the caret leaves, `settlePlaceholders` (in `commands/`) resolves it:
dropped where the text can hold the node, else the line is removed. Placeholders are session state
the text can't hold, so a host keeps them in its history ([`spec/placeholders.md`](../../spec/placeholders.md)).

## Files

`index.ts` (the public API); `state.ts` (`OutlineState`); `build.ts` (the outline from the block
tree, `OutlineNode`); `identity.ts` (ids across an edit); `placeholders.ts` (which offsets can be
placeholders).

## Tests

`test/outline/state.test.ts` (the outline's shape, ids through typing and `replace`); the
placeholder lifecycle in `test/placeholders.test.ts`; and the spec (`spec/*.md`), which every
command and host edit goes through.
