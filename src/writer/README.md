# Draft

How a document is edited. A command doesn't change the text directly: it describes the outline it
wants (this node split here, that one moved there, this text changed), starting from a copy of the
document's outline. Nodes it doesn't touch stay shared with the document. Then `done()` finishes
the edit:

1. It fixes everything the result must read as: lists numbered, blank lines where texts would run
   together, escapes, placeholders. Or it refuses, where Markdown can't say what was asked.
2. It writes the outline as changes to the Markdown text.
3. It parses the new text, and checks it reads as the outline that was asked for. If it doesn't,
   that's a bug in the writer, reported as such.

Basic usage:

```ts
import { OurusDraft, settlePlaceholders } from '../writer/index.ts';   // inside ourus; a host has `settlePlaceholders` from 'ourus'

const draft = new OurusDraft(doc).split(node, offset, { children: 'follow' });   // the outline it wants (a command's `ctx.draft()`)
draft.setCaret(made, 0);
const result = draft.done();    // { doc, changes, selection }, or a refusal
const settled = settlePlaceholders(doc, caret);   // the placeholders the caret left: { doc, changes } or null
```

## API

- **`NodeRef`** is `OurusNode | number`: a node of the draft's document, as a command holds it,
  or the id of a node the draft touched (made, changed, moved or removed). `split`, `join` and
  `create` return ids.

- **`OurusDraft`** is one edit. Its operations change the draft and return it (or the ids they
  make). After `done()` it is frozen.

  - `new OurusDraft(from: OurusDoc)`, `OurusDraft.from: OurusDoc`<br>
    A draft of the document `from`. New nodes take ids from its lineage (`OurusDoc.isSameLineage`),
    each once: a draft thrown away leaves its ids unused.

  - `OurusDraft.remove(refs: NodeRef[])`<br>
    Takes nodes out, each with its subtree. They are detached: place them again, or `done()` drops
    them.

  - `OurusDraft.place(where: 'before' | 'after', sibling: NodeRef, refs: NodeRef[])`, `OurusDraft.append(parent: NodeRef, where: 'first' | 'last', refs: NodeRef[])`<br>
    Puts detached nodes before or after a sibling, or as a parent's first or last children.

  - `OurusDraft.dissolve(ref: NodeRef)`<br>
    Removes a node but not its subtree: its children take its place.

  - `OurusDraft.convert(ref: NodeRef, kind)`<br>
    Changes a node's kind, keeping its id (an item unwrapped to a paragraph). Its text is read again
    as the new kind's.

  - `OurusDraft.setText(ref: NodeRef, text: OurusText | null)`<br>
    Sets a node's text. The text is read as the node's kind's, with its transitions applied (a
    heading that no longer reads as one becomes a paragraph). Null removes a quote's title.

  - `OurusDraft.create(kind, text, hint?: string): number`<br>
    A new detached node (place it), with a real id. `hint` is the marker the writer should use for a
    new item.

  - `OurusDraft.copy(node: OurusNode, ids?): number`<br>
    A detached copy of a node and its subtree, with new ids. The writer writes the copy exactly as
    the original is written.

  - `OurusDraft.split(ref: NodeRef, at: number, { children, to?, into?, kind?, closing? }): [number, number]`<br>
    Cuts a node's text at `at`. The node keeps what is before; a new node of its kind (a paragraph,
    for a heading) gets what is from `to` on (by default `at`; the characters between are dropped).
    The new node is the next sibling, or the first child with `into: 'child'`. The children `stay`
    with the node or `follow` the new one. The blank lines after the text go with the new node. The
    text's closing frame (a block id, an ATX heading's `#`s, a setext underline) and the block-id
    lines it carries stay with the node: a block id stays with the node the caret was in (the closing
    frame goes with the new node under `closing: 'lower'`, where the command put it in after the cut,
    a pasted ` ^x`). Returns
    both ids.

  - `OurusDraft.join(upper: NodeRef, lower: NodeRef, { children?, separator? }): number`<br>
    Appends `lower`'s text (without its frame) to `upper`'s, after `separator` (a line break makes
    it the text's next line), before `upper`'s closing frame, and removes `lower`. `upper` takes
    `lower`'s gap. `lower`'s children go after `upper`'s (`adopt`), or into `lower`'s place (`place`).
    `lower`'s block ids: where `upper` has none, it takes them (a carried line alone as ` ^id` at
    its text's end), as moved; where both have one, `joinBlockIds` says: the draft refused
    (`block-id`), or `upper`'s kept and `lower`'s merged into it. Returns `upper`'s id.

  - `OurusDraft.movedBlockIds(names: readonly string[], to: NodeRef)`<br>
    Says the block ids `names` go to node `to` on purpose (workflowy's split giving it the heading's),
    so the check of block ids takes them as moved, not lost; `done()`'s result gives them with the
    join's (`blockIds: { moved, merged }`).

  - `OurusDraft.listForm(id: number, marker: string, own?: boolean)`<br>
    The list marker a new item prefers (`-`, `*`, `1.`, `3)`) when it doesn't join an existing
    list. When it does join one, it takes that list's form, unless `own` is set: then it starts a
    list of its own where the list's form differs.

  - `OurusDraft.gap(ref: NodeRef, n: number)`, `OurusDraft.leadingBlankLines(n: number)`<br>
    The number of blank lines after a node's text, as the command wants them (`done()` may still add
    some where Markdown needs them to keep nodes apart); the number of blank lines before the
    document's first node (only where nothing but blank lines is there).

  - `OurusDraft.setCaret(ref: NodeRef, offset: number, assoc?)`, `OurusDraft.setCaretAt(old: number, assoc?)`, `OurusDraft.select(anchor: AnchorSpec, head: AnchorSpec)`<br>
    The selection after the edit. `setCaret` puts the caret at an offset in a node's text.
    `setCaretAt` puts it at a position of the original document, in markup outside any text, on a
    line the draft leaves as it was. `select` takes two `AnchorSpec`s, each of which is one of
    those, or a blank line in a node's gap. An offset in a text can carry `before`: that many
    columns earlier, in the padding before the text.

  - `OurusDraft.touched(id: number)`<br>
    A node the draft touched, as it is now: its kind, text, gap and children's ids.

  - `OurusDraft.done(): DraftResult`, which is `Applied | Refusal`<br>
    Finishes the edit, after which the draft is frozen.
    1. It fixes everything the result must read as, before anything is written: it nests the
       children as the outline has them (`outlineChildren`), numbers each list, turns a text's
       leading spaces into padding, places the placeholders and escapes, sizes the fences, sets the
       blank lines wherever the edit brings nodes together, and resolves the selection. If Markdown
       can't express the result, it returns why (`{ reason: 'not-expressible', detail }`).
    2. It writes the result as changes to the document's text (`write.ts`). The writer only writes
       what step 1 decided.
    3. It parses the new text and checks it against the draft (`check.ts`), and returns `{ doc,
       changes, selection, blockIds }`: `blockIds`, what the draft moved and merged on purpose.

    Where the flavor has block ids, step 1 also reads them as the document will: a node carrying
    block-id lines outside a list item gets a blank line after them, whatever follows (else Obsidian
    reads one as naming its own line); a paragraph that is only a block id and that Obsidian reads as
    naming the block before it (or the item it is under) is taken out, that block's text carrying the
    line, decided once the blank lines are fixed; an item whose text the draft emptied can't carry
    block-id lines, and is refused.

    A join of two nodes that both have a block id, under `joinBlockIds: refuse`, returns `{ reason:
    'block-id', detail }`. Where the writer fails, on a layout it has no rule for or a text that
    doesn't read back as the draft, `done()` returns `{ reason: 'write-failed', detail }`. That is a bug in ourus, never an
    outcome: a host reports it, as any refusal, and it is fixed.

  - After `done()`, for the writer and the check:

    - `get root`: the outline in normal form;
    - `get caret`, `get anchor`: the selection's ends (`Anchor`);
    - `get lists`: each item's place in its list (`ListPlace`);
    - `get escapes`, `get paddings`: the markup escapes and the padding to write, by node (escapes
      for every text it spelled, none where none is needed);
    - `get columns`: the column a text's later lines start at, where one starts with a tab (the
      escapes are for that column, and the writer writes it there);
    - `get preamble`: the blank lines before the first node, where `done()` set them;
    - `get gapLines`: where a gap that `done()` moved was in the original;
    - `get placedIds`: the nodes the draft placed (moved or made);
    - `get splitFrom`: the original node each split's new node comes from;
    - `get hints`: the marker asked for each new item;
    - `originOf(node)`: where a node of `root` is in the original document;
    - `textOf(node, origin)`: a node's text in the draft.

- **`settlePlaceholders(doc: OurusDoc, caret: number): { doc, changes } | null`**<br>
  Settles the placeholders the caret has left, as one draft: a node with a held space is written
  again without it (escaped where it would otherwise read as markup); an empty item is written
  again so that it holds without a placeholder (right under its parent's text, that takes a blank
  line above it); any other empty node is removed, its children taking its place. Null when no
  placeholder is off the caret's line. A host calls it whenever the caret moves.

Files:

- `index.ts` (the API); `draft.ts` (`OurusDraft`: its operations and `done()`); `write.ts`
  (the writer); `check.ts` (whether a document reads as the draft meant, node by node, each text's
  block ids by name too; nodes the two share are equal without comparing); `settle.ts`
  (`settlePlaceholders`).

Tests: `test/writer/draft.test.ts` (the operations, how node references resolve through them, what
`done()` fixes, the check), and the spec, through every command.
