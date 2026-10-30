# The view (2026-10-30)

Folds and the zoom move off the document snapshot into a class of their own, `OurusView`: a
document and one reader's folds and zoom over it, in a new layer, `src/view/`, on `src/doc/`.
`OurusDoc` goes back to being the text read as an outline, and nothing in `doc/` or `writer/` reads
a fold. Built as designed, in the three steps of §7 (§11: how it went). ourus is alpha and the
demos are its only consumers, prototypes too: no legacy API is kept.

## Contents

- [1. Why](#1-why)
- [2. The rule](#2-the-rule)
- [3. The layers](#3-the-layers)
- [4. The nodes](#4-the-nodes)
- [5. The API](#5-the-api)
  - [5.1 `OurusDoc`, after](#51-ourusdoc-after)
  - [5.2 `OurusView`](#52-ourusview)
  - [5.3 Commands](#53-commands)
  - [5.4 Hosts](#54-hosts)
- [6. Where the view is carried](#6-where-the-view-is-carried)
- [7. The plan](#7-the-plan)
- [8. The tests](#8-the-tests)
- [9. What changes in 21-zoom and 22-select](#9-what-changes-in-21-zoom-and-22-select)
- [10. Decided, and open](#10-decided-and-open)
- [11. How it was built](#11-how-it-was-built)

## 1. Why

21-zoom §11 put the view on the snapshot for three reasons: every command reads it, it is carried
through a change as placeholders are, and `executeCommand` keeps one value in and one out. All
three hold, and this design keeps them: `OurusView` is the one value. What the view on `OurusDoc`
costs, as built:

- **The document layer reads the view, and doesn't say so.** `doc.ts` imports `view.ts`;
  `select.ts` and `locate.ts` import `foldOwner`. So `doc.locate(pos)` gives another gap owner
  where a fold is closed, and `touchedNodes`, `selectedNodes` and `selectionOf` answer for what the
  reader sees. They are the reader's questions, asked of the text: Regression67–70 (23-bugs) were
  `touchedNodes` not asking the view (a blank line's caret resolved to a hidden node), fixed by
  `foldOwner` in it and in `locate`. On the view, a query that needs the view has it, and one on the
  document can't reach for it.
- **A fold toggled is a new `OurusDoc`.** A snapshot's identity changes for a view change as for an
  edit, so a host can't tell them apart by it.
- **A view-only snapshot shares by hand.** `#withView` copies `#rootNode`, `#byId` and `#blockIds`
  into a sibling instance, so that two values share what is one.
- **An undo borrows a view.** `like.withConfig(doc.config).withViewOf(doc)` puts one snapshot's
  folds and zoom on another: a view put on a document, written as a document put on a document.
  21-zoom §2.1's second pane would do the same.
- **The writer carries what it never reads.** `OurusDoc.update` runs `carryView` on every update,
  the writer's (`OurusDraft.done`) and `keptAt`'s two trial updates included.

## 2. The rule

**The document holds what changes how its text reads; the view holds the rest.** The text, its
placeholders (sentinels in the parse: `- a⏎  - ◌` keeps an empty child, which without it reads as
`a`'s text, `a⏎-`) and the config's reading options (`flavor`, `quotes`, `listParent`) change the
outline; the config's writing options ride along, as now. Folds and the zoom change nothing the
parser or the outline reads: two views of one document differ in them and nothing else.

So placeholders stay on `OurusDoc` and folds don't. And what a fold of a node *would* hide, or a
zoom into it show, is a fact of the outline (its lines, its children): it stays in `doc/` (§4,
§5.1). What is folded, what is hidden, and how those go through an edit are the view's.

## 3. The layers

```
text → parser → doc → writer ─┐
                  └──→ view ──┴→ commands
```

`view/` sits on `doc/`, beside `writer/`: neither imports the other. `commands/` imports both, so
what needs both lives there: `leavesZoom` (it runs `deleteSubtree`, 21-zoom §5.1) and the host's
`settlePlaceholders` (the writer settles in steps, and the view is carried through each, §6).

`test/boundaries.test.ts` already enforces the layers: a rank per component (`text` 0, `parser` and
`config` 1, `doc` 2, `writer` 3, `commands` 4, `index` 5), no import up or across, imports only
through a component's `index.ts`, and an unknown component an error. `view` takes rank 3, with
`writer`. What `view/` takes of `doc/` is `OurusDoc`'s and `OurusNode`'s methods, and one function
`doc/index.ts` exports for it: `startingAt`, every node starting on a line (`viewByLine` needs the
whole list, `rowOwner` gives its first).

`src/view/`:

- `view.ts`: `OurusView` (§5.2).
- `carry.ts`, from `doc/view.ts`: `carryView`, `viewIn`, `viewByLine`, `hiddenContent`, `ancestry`.
  The one carrying rule (21-zoom §2.5).
- `escape.ts`, from `doc/view.ts`: `zoomEscape`, the invariant's clauses 1 to 4 (21-zoom §4.1).
- `select.ts`: `doc/select.ts` whole (`touchedNodes`, `selectedNodes`, `subtreesSelection`,
  `outermost`), each on a view, and `visibleSelection` from `commands/view.ts`. What a selection
  is in what the reader sees. (The view's `locate` is `view.ts`': `doc.locateRaw`, a gap's owner
  passed through `shown`.)
- `index.ts`, `README.md`.

`doc/view.ts` and `doc/select.ts` go. The geometry is `doc/extent.ts`: `foldRange`, `coverEnd`,
`coverRange` (new, §5.1), `startingAt` (behind `rowOwner`). `commands/view.ts` keeps the six view
commands and `withFolds`; `commands/settle.ts` is new (`settlePlaceholders`).

## 4. The nodes

**`OurusNode` gains the outline facts** that the view code and the commands spell as loops now:

- **`get foldable: boolean`**: not the root, with children, and lines after its own (`endLine >
  ownLastLine`), which is `foldRange(node) !== null` without the offsets (`MdTree.ends` is strictly
  increasing). For `viewIn`, `carryView` and `setFolds`' `!!doc.foldRange(n)`.
- **`isWithin(ancestor: OurusNode | number): boolean`**: the node itself or a descendant of
  `ancestor`, by node or by id. For the walks in `zoomFolded` (strictly inside:
  `node.parent?.isWithin(zoom)`), `isHidden`, `outsideZoom`, `insideRoot` (`commands/zoom.ts`),
  `commands/select.ts` and `drag.ts`. The two `isAbove`s (`backspace.ts`, `delete-subtree.ts`) are
  strict, and stay, each `a !== b && b.isWithin(a)`.
- **`ancestors(): Iterable<OurusNode>`**, a method as `nodeAtLine` is: the parent outward, the root
  last. For the walks that collect (`ancestry`, `suppressed`, `foldOwner`).
- **`subtreeIds(): Set<number>`**, from `doc/view.ts`: the subtree's ids, its own included
  (`carryView`, `zoomEscape`).

`foldRange`, `coverEnd` and `rowOwner` stay on `OurusDoc`: the first two read the parse's lines
(`mdTree.ends`, which lines are blank), which a node doesn't hold, and `rowOwner` walks from the
root.

**A node holds no view.** Folded or hidden is `view.isFolded(node)`, `view.isHidden(node)`. A
document makes its `OurusNode`s once, lazily, and every view of it shares them: a fold toggled makes
no node. A `node.folded` would need a wrapper per view, made again on every toggle.

**`OurusNode` stays in `doc/`.** It is a stored node (`PersistentNode`) placed in one text: its
first line, parent, index and depth. That is the text's, the same in every view; "a positioned view
of a stored node" is another sense of "view". And the layers below the view are built on it: in
`doc/` (about 120 uses in 9 files) `textOf`, `posOf`, `offsetOf`, `hiddenSpaces` and `markerOf`
take one, `node`, `nodeAtLine` and `rootNode` give one, `locate`'s zones carry one; the writer uses
it as much (about 120 uses in 4 files). Moved up, `doc/` would need a positioned node of its own,
and the writer would sit on `view/`.

## 5. The API

### 5.1 `OurusDoc`, after

**Goes:** `folded`, `zoom`, `zoomFolded`, `withFolded`, `withZoom`, `withViewOf`, `isHidden`,
`zoomRange`, `zoomEscape`, `touchedSubtrees`, `touchedNodes`, `selectedSubtrees`, `selectedNodes`,
`selectionOf`, `locate` (renamed, below); inside, `#withView`, `#zoomFolded`, `#lastRead`.

**Stays, view-free:** `foldRange(node)`, `coverEnd(node)`, `rowOwner(line)`. **New:**
`coverRange(node)`, what a zoom into `node` would show, in offsets (`starts[startLine]` to
`ends[coverEnd]`). `view.zoomRange()` is built on it, and a host asks it of a node it isn't zoomed
into (true-outliner's `zoom-scope.ts` does `withZoom(id).zoomRange()` for that now).

**`locate` changes meaning, so it changes name.** The view's `locate` is the old one. The document's
loses `foldOwner`: its gap owner is the node above the line however folded. Kept as `doc.locate`,
each of its 21 calls (14 in `commands/`, 7 in the demos) would compile and quietly take the other
owner, Regression67–70's bug. So the document's is **`doc.locateRaw(pos)`**, and `doc.locate`
goes: every call fails to compile until it is moved, to `view.locate` unless it wants the raw
owner.

**`update`** reads the outline and carries the placeholders, nothing else. **`withConfig`** reads
again as now: an option that only says how commands write shares the outline and ids; `quotes` and
`listParent` carry the ids; `flavor` reads anew, the ids anew. A new document is made only by
`parse`, `update` and `withConfig`, never by a fold or a zoom.

**A document's identity.** The same document: nothing of it changed. Another: its text, marks,
config or outline may have, its ids included. A host compares `text` to know whether the text
changed, since an edit can change the ids alone: moving the first item of `- a⏎- a⏎` down writes no
character (`changes: []`) and swaps the items' ids, `[1, 2]` to `[2, 1]`; that is another document,
and its folds go with the ids. So **`update` returns `this` only when given nothing to do**: no
changes (none, or a `text` equal to this one's), no `setMarks`, `addMarks` or `dropMarks`, no
`identity`; a `caret` alone does nothing (`keptAt` needs a deletion). Today `update({})` makes a new
snapshot; nothing in `src/` or the demos relies on that.

### 5.2 `OurusView`

```ts
/**
 * A document and one reader's view of it: the nodes whose children it hides and the node it is
 * zoomed into. Immutable; every view of a document shares its nodes.
 */
export class OurusView {
  readonly doc: OurusDoc;
  /** The nodes whose children the view hides (21-zoom §2.2). */
  readonly folded: ReadonlySet<number>;
  /** The node the view is zoomed into; null: the whole document (21-zoom §2.3). */
  readonly zoom: number | null;

  /**
   * `doc` with this state, none by default. A fold that can't be (no such node, nothing to hide) and
   * a zoom on no node are dropped (`viewIn`): the state comes from outside, a saved view or an
   * editor's folds. `withZoom`, a caller's own choice, throws instead.
   */
  static of(doc: OurusDoc, state?: OurusViewState): OurusView;

  /** The zoom root, or null. */
  get zoomRoot(): OurusNode | null;
  /** The folds in effect: those of nodes strictly inside the zoom root; all of `folded` where not zoomed (21-zoom §2.4). */
  get zoomFolded(): ReadonlySet<number>;
  /** Whether `node`'s fold is in effect (in `zoomFolded`). */
  isFolded(node: OurusNode): boolean;
  /** Whether the view hides `node`: under a fold in effect, or outside the zoom. */
  isHidden(node: OurusNode): boolean;
  /** The node the reader sees for `node`: its outermost ancestor whose fold hides it, else itself (`foldOwner`). */
  shown(node: OurusNode): OurusNode;
  /** What the zoom shows, in offsets (`doc.coverRange` of the root); null where not zoomed. */
  zoomRange(): { from: number; to: number } | null;

  /** Other folds; an id that can't fold dropped. */
  withFolded(ids: Iterable<number>): OurusView;
  /** Another zoom, no fold changed. Throws where `id` is no node here, or the root. */
  withZoom(id: number | null): OurusView;

  /** A host's edit: `doc.update(params)`, this view carried onto it (21-zoom §2.5). */
  update(params?: OurusDocUpdate): OurusView;
  /**
   * `next`, another snapshot of this document's lineage (a command's, an undo's, another pane's),
   * with this view carried onto it through `changes`, this document's text to `next`'s (by default,
   * the lines that differ). Throws for another lineage.
   */
  withDoc(next: OurusDoc, changes?: readonly ChangeSpec[]): OurusView;
  /** `doc.withConfig(config)`, the view carried by id, or by line where the flavor changed (`viewByLine`). */
  withConfig(config: Partial<OurusConfig>): OurusView;

  /** Where `next`, another snapshot of the lineage, leaves the zoom (21-zoom §4.1, clauses 1 to 4), or null; `removed`: the root went whole. */
  escape(next: OurusDoc, removed?: boolean): string | null;

  /** What is at `pos`: `doc.locateRaw(pos)`, a gap's owner the node the reader sees (`shown`). */
  locate(pos: number): Located;
  /** The roots of the subtrees a selection touches (22-select §4.2): what a key acts on. */
  touchedSubtrees(selection: OurusSelection): readonly OurusNode[];
  /** The roots of a subtree selection, one that is exactly their subtrees as whole lines; null for any other. */
  selectedSubtrees(selection: OurusSelection): readonly OurusNode[] | null;
  /** The subtree selection of `roots`, nodes or ids, their closure. Throws for a root hidden or outside the zoom. */
  selectionOf(roots: readonly OurusNode[] | readonly number[], direction?: 'down' | 'up'): OurusSelection;
  /** `selection` moved out of what the view hides (21-zoom §2.4). */
  visibleSelection(selection: OurusSelection): OurusSelection;
}

/** A view's state, as `OurusView.of` takes it and a host saves it. */
export interface OurusViewState {
  readonly folded?: Iterable<number>;
  readonly zoom?: number | null;
}
```

**One selection query each.** `OurusDoc` has `touchedSubtrees` and `touchedNodes`,
`selectedSubtrees` and `selectedNodes`: the same answers as ids and as nodes, the first pair
22-select's host API, the second the commands'. Every caller uses them on the snapshot it asked, so
the ids add nothing a node doesn't have. The view keeps 22-select's names, which say what the
answer is (the topmost roots of whole subtrees), giving nodes. `selectionOf` takes nodes, so
22-select's idiom `selectionOf(touchedSubtrees(sel))` stays (`demos/cm6/main.ts`, true-outliner's
`ourus-motion.ts` and `zoom-click.ts`), or ids, as a command's `nodes` and a result's `placed` are.
The commands' `touchedNodes` and `selectedNodes` (about 25 uses) take the names; `test/select.test.ts`
maps its id comparisons (about 30).

**The selection memo** (`#lastRead`, 22-select) moves with the queries, one per view: a fold
toggled starts it over, as a new snapshot does now.

**A view's identity**, as a document's: the same view, nothing of it changed (document, folds,
zoom); another, something may have. Each method returns `this` where it changes nothing:
`withFolded` and `withZoom` given the same ids or zoom (compared by value: before, `withFolded`
always makes a new snapshot, `viewIn` building a new set); `withDoc` given its own document; `update`
and `withConfig` where the document's do. A carry that keeps every fold keeps the input's set.

### 5.3 Commands

```ts
export function executeCommand(view: OurusView, command: OurusCommand, selection: OurusSelection): OurusResult;

/** The command done, refused, or left to the host: told apart with `instanceof`. */
export type OurusResult = OurusSuccess | OurusRejected | OurusDeferred;

export class OurusSuccess {
  readonly view: OurusView;              // the document after, the folds and zoom carried onto it
  readonly changes: readonly ChangeSpec[];
  readonly selection: OurusSelection;
  // clipboard?, placed?, dropMap?, movedBlockIds?, mergedBlockIds?, removedNodes?: as before
  constructor(fields: OurusSuccess);     // new OurusSuccess({ view, changes, selection, ... })
}
export class OurusRejected { readonly reason: RejectReason; readonly detail?: string; constructor(reason, detail?) }
export class OurusDeferred { readonly detail?: string; constructor(detail?) }
```

The results were a union of plain objects on a `status` string, and became these three classes after
the view moved (§10, decided 10). A success is built over its fields, the class itself their type
(it has fields only), each assigned in the constructor; one adjusted is a new one over the other's
(`new OurusSuccess({ ...result, selection })`), a spread being a plain object, no success. The
spec's `result:` key reads `success`, `deferredToHost` or `rejected <reason>`.

- **A view in, a view out**: no `OurusDoc` overload, no `doc` beside `view` in the result. A caller
  with no view makes one, `OurusView.of(doc)`; the text after is `result.view.doc`. Tests use a
  helper, `parseView(text, config)` (`viewOf` is taken: `test/spec-run.ts`'s puts a spec start's
  state on a snapshot by label, and now gives an `OurusView`).
- **What the result's view says**: `result.view.doc === view.doc`, the document unchanged (a view
  command, `copy`, a selection command); `result.view === view`, the document, folds and zoom
  unchanged. Neither means nothing happened: a selection command changes the selection alone
  (`selectNode` at a caret in `- a`: the same view, `{ anchor: 0, head: 4 }`), `copy` gives a
  clipboard, `drag` a drop map. A host takes every applied result's `selection` and other fields.
  `deferredToHost` and `rejected` are as now.
- **`CommandContext` holds a view**, made from a view only: `ctx.view`, and `ctx.doc` its getter for
  the 220-odd reads that need only the text. `ctx.from` and `ctx.to` locate through the view.
- **`leavesZoom(view: OurusView, next: OurusDoc): boolean`**: `next` is the document the host would
  commit (`view.doc.update(…)` with its caret and marks), as now.
- **`settlePlaceholders(view, caret): { view, changes } | null`**: from `commands/`, not `writer/`
  (§6); `changes` the steps' composed, for the host to apply.
- **Unchanged**: the six view commands, `RejectReason`'s `folded` and `outside-zoom`.
  `OurusView` and `OurusViewState` are exported from `src/index.ts`.

### 5.4 Hosts

The field holds an `OurusView` where it held an `OurusDoc` (`ourusDoc` in `demos/cm6/main.ts` and
`demos/obsidian-true-outliner/src/plugin/ourus.ts`). The history keeps documents, as now
(`returnTo.of(start.doc)`): an undo returns to that document's text and nodes, and the view the
reader has now is carried onto it.

| Now | After |
| --- | --- |
| `OurusDoc.parse(text, opts)` | `OurusView.of(OurusDoc.parse(text, opts))` |
| `doc.update({ changes, caret })` | `view.update({ changes, caret })` |
| `doc.withConfig(c)` | `view.withConfig(c)` |
| `like.withConfig(doc.config).withViewOf(doc)` (an undo) | `view.withDoc(like.withConfig(view.doc.config))` |
| a second pane (none built) | `mine.withDoc(theirs.doc, changes)` |
| `doc.withFolded(f).withZoom(z)` | `view.withFolded(f).withZoom(z)` |
| `doc.zoomFolded`, `doc.foldRange(doc.rowOwner(line))` | `view.zoomFolded`, `view.doc.foldRange(…)` |
| `doc.withZoom(id).zoomRange()`, a scope not zoomed into | `view.doc.coverRange(node)` |
| `doc.locate(pos)` | `view.locate(pos)` |
| `doc.touchedSubtrees(sel)`, `doc.selectedSubtrees(sel)`: ids | `view.touchedSubtrees(sel)`, `view.selectedSubtrees(sel)`: nodes |
| `executeCommand(doc, …)`, then `result.doc` | `executeCommand(view, …)`, then `result.view` |
| `leavesZoom(doc, doc.update(p))` | `leavesZoom(view, view.doc.update(p))` |
| `settlePlaceholders(doc, head)`, then its `doc` | `settlePlaceholders(view, head)`, then its `view` |

What moves, as `tsc` finds it (`npm run typecheck` covers `demos/cm6` and `demos/textarea`;
true-outliner builds on its own): `demos/cm6/` (`main.ts`, `view.ts`, `smoke.ts`),
`demos/textarea/main.ts`, true-outliner's `src/plugin/` (`ourus.ts`, `decorations.ts`,
`fold-commands.ts`, `ourus-motion.ts`, `zoom-click.ts`, `zoom-scope.ts`), its `src/block-ids.ts`,
tests and e2e helpers, and `sxs/` (`lib/block.ts`, `lib/text.ts`, the drivers that run commands),
which `npm test` runs.

## 6. Where the view is carried

Today `OurusDoc.update` carries the view, so every document a command makes carries its input's,
step by step. After, **the view is carried exactly where `update` carried it**, so no fold or zoom
comes out differently.

**Where the compiler finds them.** A context is made from a view, an applied outcome holds a view,
and `doc.locate` is gone, so each site below fails to compile until it is moved:

- **`ctx.apply(draft)`** returns `ctx.view.withDoc(applied.doc, applied.changes)`. `done()` updates
  `draft.from` with `written.changes` and returns those changes, so this is the carry `update` ran.
  A draft whose `from` isn't `ctx.view.doc` throws: a chained step that should have made its own
  context.
- **An `update` of a document a command returns** goes through that document's view:
  `ctx.update(params)`, which is `ctx.view.update(params)`, for the context's own (`copy.ts`'s cut
  where the host deletes the text; `index.ts`'s block-id join and insertion at a text's end;
  `typing.ts:77`); `outcome.view.update(params)` for a step's (`index.ts`'s `deleted.doc.update`,
  `subtrees.ts`'s `first.doc.update`, `typing.ts`'s loop, `paste-plain.ts`'s `next.doc.update`).
- **`block-ids.ts`'s `markedPaste`** drops a paste's duplicate block ids with a draft on the paste's
  result, then takes the paste's marks out with an `update`, and returns that. After:
  `outcome.view.withDoc(kept.doc, kept.changes)`, then `.update({ changes: out })`.
- **A step on a step**: a context on the last outcome's view, `new CommandContext(outcome.view,
  outcome.selection)` (`paste-plain.ts`, `typing.ts`, `shape.ts`, `index.ts`'s delete-then-type).
  A step that runs first takes `ctx.view` (`copy.ts`, `subtrees.ts`, `drag.ts`,
  `delete-subtree.ts`, `zoom.ts`'s `leavesZoom`). 20 contexts in all.
- **A pasted fragment** (`paste.ts`: the clipboard parsed as a document of its own lineage):
  `OurusView.of(pasted)`, nothing folded.
- **The guard** (`zoomed`, `settled`): `view.escape(result.view.doc, removed)`,
  `result.view.visibleSelection(result.selection)`.
- **The block-id checks** (`keepsBlockIds`, `hostKeepsBlockIds`) take the input's view, since
  `takenBy` asks for the selected subtrees.
- **The command's own folds**: `withFolds` (a split's, a duplicate's copies) adds to
  `outcome.view.folded`; `duplicateSubtree` reads `ctx.view.folded`. The view commands return
  `ctx.view.withFolded(…)` or `withZoom(…)` with no changes, as now.
- **Every `locate` in `commands/`** (14, in `context.ts`, `duplicate-subtree.ts`,
  `delete-subtree.ts`, `shape.ts`, `block-ids.ts`, `util.ts`, `paste-plain.ts`, `index.ts`) becomes
  `view.locate`: each took `foldOwner`'s gap owner before.

**Where it can't.** One carry where there were several is type-correct:

- **`settlePlaceholders`** (`writer/settle.ts`, the only multi-update function `src/index.ts`
  exports): where not every placeholder settles at once, it commits a marks-only update (dropping
  those that can't) and then a draft of the rest, and both carried the view before. Carried once over
  both, a fold opens that stayed before (Fold20: `⏎# h⏎> - ⏎> ^x⏎`, Obsidian, placeholders at 0 and 9,
  the heading folded, the caret at 1). The marks-only update changes no character, so its carry
  keeps the fold without reading what it hides, though that now reads otherwise; the draft's carry
  compares what it hides across the draft alone, the same. One carry compares start and end, which
  differ. So the writer gives its steps, `settleSteps(doc, caret): readonly { doc, changes }[]`
  (exported from `writer/index.ts` for `commands/`, not from `src/index.ts`), and `commands/`'s
  `settlePlaceholders` carries through each in order and composes the changes. Whether the first
  carry should open the fold is another question; this keeps the old answer. **The rule**: nothing
  below `commands/` hands a host a document made in more than one update.
- **`withDoc` normalizes its changes** as `update` does (`ChangeSet.of(…).changes`: sorted, empty
  ones dropped). `carryView` counts a change as reaching a fold by its range (`c.from <= reach &&
  c.to >= start`), so an empty change in a raw list would reach one. `withViewOf` passed them
  raw.

**Not carried**: a document only looked at stays a document (`zoom.ts`'s trial of a host's plain
default, `hostKeepsBlockIds`' trial edit, `pastedBlockIds`' draft on the pasted fragment).

## 7. The plan

Three steps, each committed alone, the whole suite passing after each. None may change behaviour: a
spec, a baseline or an exhaustive run that moves is a mistake of its step.

1. **The nodes.** `foldable`, `isWithin`, `ancestors`, `subtreeIds` (§4), the loops replaced;
   `doc/view.ts` split, the geometry to `doc/extent.ts`, `coverRange` added. Nothing outside `src/`
   changes.
2. **The API, the state where it is.** `src/view/` with `OurusView`'s whole API (§5.2), `view`
   ranked in `test/boundaries.test.ts`, as a facade: it wraps a document that still holds the state
   (its private constructor takes one as it is; `of` sets the state given, none by default), reads
   `folded` and `zoom` from it, and forwards its queries; `withDoc` is the old `withViewOf`, changes
   normalized. The document's view members are `_`-prefixed for the step, `doc/`'s and the
   facade's alone, so that the compiler lists every other caller (§11). `executeCommand`,
   `CommandContext`, outcomes and results take and give views (§5.3); every carry point of §6 wraps
   the document the old `update` already carried, no second carry. The selection queries renamed,
   `doc.locate` to `locateRaw` with every call moved, `settlePlaceholders` into `commands/` over
   `settleSteps`; the demos, `sxs/`, the tests and the spec runner on views. All the churn is here
   (130 `executeCommand` calls, about 270 uses of the view's API outside `doc/`), the behaviour as it
   was, so a failing test is a call moved wrong. The identity rules (§5.1, §5.2) can't hold yet: a
   fold toggled is still a new document.
3. **The state moves.** `folded` and `zoom` into `OurusView`; `carry.ts`, `escape.ts` and
   `select.ts` into `view/`, `visibleSelection` with them; `locateRaw` without `foldOwner`, the
   view's `locate` with it; `OurusDoc` loses §5.1's list, `update` stops carrying and returns `this`
   given nothing to do; the carry points carry (§6). The API doesn't change; only where the state
   lives. This is the step that could change behaviour, and §6 is why it shouldn't: a run that
   moves names a carry point missed. Then the identity tests (§8), the READMEs (`src/doc/README.md`'s
   view entries and `locate`, a new `src/view/README.md`, `src/commands/README.md`'s
   `executeCommand` and `result.doc`, the demos'), and 21-zoom and 22-select pointed here.

## 8. The tests

- **Moved**: `test/doc/view.test.ts` to `test/view/view.test.ts`, on `OurusView`; the geometry's
  cases (`foldRange`, `coverEnd`, `rowOwner`, `coverRange`) stay in `test/doc/`.
- **On views**: the spec runner's start is a view (the spec's `folded:` and `zoom:` keys, 21-zoom
  §6); `test/player.ts` keeps documents in its history and settles with
  `settlePlaceholders(view, …)`; `test/select.test.ts` compares ids from nodes; `view-exhaustive.ts`,
  `specfile.ts`, `drawing.ts`, `tabs.ts`, `obsidian-tabs.test.ts`, and the runs that call commands
  (`bench.ts`, `differential.ts`, `drops.ts`, `inverse.ts`, `moves.test.ts`,
  `placeholders.test.ts`, `copy-paste.ts`) take views, tests without one `parseView`. No baseline
  (`view-exhaustive`, `inverse`, `copy-paste`) may move.
- **The layers**: `test/boundaries.test.ts`, `view` at rank 3. No new test.
- **Spec cases**, passing before step 1, which steps 2 and 3 must keep:
  - MoveUp47, MoveDown45 (`spec/move-subtree-up.md`, `spec/move-subtree-down.md`): two items
    written the same, moved past each other: no character changed, the nodes traded.
  - Fold18, Fold19 (`spec/fold.md`): the same with one folded, the folded one moved or the other:
    the fold with its node, now second.
  - Fold20 (`spec/fold.md`): placeholders settled in two steps under a fold: the fold kept.
- **Added in step 3**, in `test/view/view.test.ts`:
  - a view toggled shares its document (`view.withFolded(f).doc === view.doc`); a view command's
    result shares its input's document, a text command's doesn't;
  - `update({})`, `update({ caret })` and `update({ text: doc.text })` return `this`;
  - `moveSubtreeDown` on `- a⏎- a⏎`'s first item gives another document, `changes: []`, the ids
    swapped; in `- a⏎  - x⏎- a⏎  - x⏎`, the first folded, the fold stays on its id, now second (as
    before: `[1, 3]` to `[3, 1]`, `folded` `[1]`);
  - `selectNode` at a caret: `result.view === view`, the selection changed;
  - `settlePlaceholders(view, 1)` on Fold20's start keeps the fold, and a single carry over its
    steps wouldn't;
  - a second pane's `withDoc` keeps a moved node's fold (Fold4's move).
- **Also**: `npm run test:heavy` after steps 2 and 3; true-outliner's own tests; the CM6 demo's smoke
  run.

## 9. What changes in 21-zoom and 22-select

21-zoom:

- **§11, decided 1** (the state on the snapshot): on the view, the one value commands take and give.
  Its reasons stand; what it cost is §1 here.
- **§11, decided 9**: "`replace`'s `like`" is stale already (23-bugs dropped `replace`); an undo is
  `view.withDoc(like.withConfig(view.doc.config))`.
- **§11, open 4** (folds in the file): a callout's `[!type]-` read as folded starts a view,
  `OurusView.of(doc, { folded })`.
- **§2.1**: a view is a reader's, a document anyone's; two panes keep two views of one lineage. Its
  "compare `text`" stays for whether the text changed; a document's identity says whether the
  document did (§5.1).
- **§2.5**: the rule unchanged; out of a command it is carried by `ctx.apply` and the sites of §6,
  out of another view's edit by `withDoc`.
- **§5.1** and **§5.4**: §5.2 and §5.4 here.

22-select **§4.2**: `touchedSubtrees` and `selectedSubtrees` are the view's and give nodes;
`touchedNodes` and `selectedNodes` go; `selectionOf` takes nodes or ids.

## 10. Decided, and open

Decided:

1. **A layer of its own**, not a class in `doc/` (§3): after the split nothing in `doc/` or
   `writer/` reads the view, and `test/boundaries.test.ts` keeps it so, where one folder relied on
   care (§1).
2. **`OurusNode` stays in `doc/`, holding no view** (§4): its position is the text's, and the layers
   below the view are built on it.
3. **A view in, a view out** (§5.3): no overload, no `doc` beside `view`; one way to read a result.
4. **The view is carried exactly where `update` carried it** (§6), not once from a command's input
   to its output: the same folds and zoom by construction. The compiler finds the sites in
   `commands/`; the spec cases pin the ones it can't.
5. **The geometry is the document's** (§2, §5.1): what a fold or zoom of a node would cover is the
   outline's; what is folded, the view's.
6. **One selection query each, giving nodes** (§5.2), under 22-select's names.
7. **`doc.locate` becomes `locateRaw`** (§5.1): its meaning changes, so its name does, and every
   call is moved on purpose.
8. **`settlePlaceholders` takes a view, in `commands/`** (§6), and nothing below `commands/` hands
   a host a document made in more than one update.
9. **`update` returns `this` only when given nothing to do** (§5.1): a document's identity says
   whether the document changed, its ids included.
10. **The results are three classes**, `OurusSuccess`, `OurusRejected`, `OurusDeferred`, their union
    `OurusResult`, told apart with `instanceof`; no `status` field, and no second type inside
    `commands/`. A command function there gives `OurusResult | null`, null where no rule of its covers
    the case (the next is tried, `a ?? b`; `executeCommand` makes a final null the host's for a key
    it has a default for, else `unsupported`), written once at the top of `commands/context.ts`.
    `instanceof` holds within one copy of the library: two copies loaded (a plugin bundling its
    own), or a result sent across a thread, give objects of another class or none.

Open:

1. **`locate` in commands**: all 14 moved to `view.locate`, as they were; some may want `locateRaw`.
2. **`leavesZoom` on the view** (`view.leaves(next)`): it runs `deleteSubtree`, which `view/` can't
   import, so it stays in `commands/`, unless the removal check moves into `escape`.
3. **`hostKeepsBlockIds`' own results skip the zoom's guard**: its paste and delete-then-type come
   back after `zoomed`, unchecked by `escape` and `visibleSelection`. Today's gap, kept; running it
   inside `zoomed` would close it.
4. **An edit that changes no character isn't undone.** Fold18's move has `changes: []`, and the
   hosts' histories record only text changes (`test/player.ts`; the CM6 demo's history effects are
   for `docChanged`): an undo after it takes back the step before, or nothing, the fold left on the
   item now second. Today's behaviour, kept; a host could record a step where `doc` changed and the
   text didn't.
5. **The name.** `view` is CodeMirror's `EditorView` in every host, so hosts name the field `ourus`.
   `OurusView` keeps the word these notes have used since 21-zoom.
6. **`OurusNode.persistentNode`** reads long beside `OurusView`; `stored` is shorter. Not part of
   this.
7. **Filters** (21-zoom §11, open 6): a third field of `OurusView`, beside `folded` and `zoom`.
8. **The pickup as a query.** `drag` is a command that succeeds with no change, to carry a
   `dropMap`; as a query (`dragOf(view, …): DropMap`) every success would be an edit. It reopens
   20-drag's decision, which made it a command so the spec plays it as an action.

## 11. How it was built

The three steps of §7, the suite passing after each.

- **Before step 1, the spec cases** of §8: MoveUp47, MoveDown45, Fold18 to Fold20, passing on the
  code as it was. Fold20 is drawn with its block id under the quote's `>` (`> ^x`): written
  `  ^x`, the tabs run (`test/obsidian-tabs.test.ts`) indents it with a tab, which reads as code, and
  the case fails there for that alone.
- **Step 1, the nodes**: `OurusNode.foldable`, `isWithin`, `ancestors`, `subtreeIds`; the parent
  walks they replace, in `doc/` and `commands/`; `doc/extent.ts` with `foldRange`, `coverEnd`,
  `coverRange` and `startingAt`. The suite as before.
- **Step 2, the API, the state where it was**: `src/view/` with `OurusView`'s whole API, over a
  document that still held the state. To leave no caller on the document's view queries, which
  would have compiled on and broken only in step 3, the document's view members were renamed with a
  `_` prefix for the step, used by `doc/` and the facade alone: the compiler then listed every
  other caller.
  - In `commands/`, the helpers that read the view on a bare document take a view
    (`selectionRoots`, `shapeOf`, `takenBy`, `nodeAt`, `placeAtSeam`, the selection commands'
    walks, the zoom guard and `leavesZoom`); `CommandContext` is made from one, `ctx.apply` and
    `ctx.update` give one.
  - The steps on steps carry it, each on the last's view: `mixedDepthsRun`, `typedOneByOne`,
    `enteredLines`, `markedPaste` (§6), and the block-id checks' paste and delete-then-type.
  - `settlePlaceholders(view, caret)` is `commands/settle.ts`, over the writer's `settleSteps`.
  - The demos moved: CM6's field is `ourus`, an `OurusView`, its effect `setView`; the textarea
    demo, which has no folds, wraps its document at each call; true-outliner (§5.4) its field
    `ourusView`, `ourusSnapshot` a view.
  - `test/` and `sxs/` moved: the player's state holds a view (`Played.view`), the drawing helpers
    take one (how a subtree selection reads depends on the zoom), `test/spec-run.ts`'s `viewOf`
    gives one, and `test/drawing.ts` has `parseView(text, config)`.
- **Step 3, the state moved**: `OurusView` holds the document, the folds and the zoom, its
  `zoomFolded` and its selection memo; `view/carry.ts`, `view/escape.ts` and `view/select.ts` hold
  what was `doc/view.ts` and `doc/select.ts`, both gone. `OurusDoc` has no view: `update` carries
  nothing and returns itself given nothing to do, `withConfig` reads again without carrying (the
  writing options sharing the outline's indexes), and `locateRaw` gives the node above the line as
  a gap's owner, `OurusView.locate` the node shown. `test/doc/view.test.ts` moved to
  `test/view/view.test.ts`, with §8's identity and settling cases. No test's outcome moved.
- **The heavy suites across an API change**: `test/heavy.ts`'s copy of the last commit takes its
  `test/` and `sxs/` with its `src/`, each harness playing the code it was written for (the
  corpus, `spec/`, the working tree's); `test/differential.ts` gives a view to a tree that has
  `OurusView`, a document to one before it. Without both, the last commit's half plays the new
  harness on the old API and fails to run at all.

- **After step 3, the results** (§10, decided 10): `OurusCommandResult`, a union on a `status`
  string, and `CommandOutcome`, the same or null, became the classes `OurusSuccess`,
  `OurusRejected` and `OurusDeferred`, `OurusResult` their union. The 274 status comparisons are
  `instanceof`, the 40 literals constructors (`reject()` and `deferToHost()` inlined), and the 10
  results spread to adjust them (`{ ...outcome, selection }`) new successes over the other's fields:
  spread, a success is a plain object, and every check after it took it for none. Where a refusal
  is one of two answers (an insertion point or a refusal, a heading's shifts or one), the function
  gives `OurusRejected`, not the union. The spec's `result: applied` is `result: success` (22 cases);
  tests and `sxs/` print a status by `statusOf` (`test/drawing.ts`); the differential gives each
  tree's result a plain status, an older tree's `applied` read as `success`. A heavy run against the
  commit before the classes plays the corpus with that commit's harness, whose reader knows
  `applied`: for that run the copy's `result: success` was written back as `applied`.

Found on the way, neither from this change (both in the code before it):

- **A hang in the writer**, found by the view's exhaustive pass on Fold20's start:
  `deleteSoftLineBackward` at the end of `> ^x` leaves the quote's empty item a text of a line break
  and blank lines, and `#placeholders`' walk back over a text's blank last lines took
  `lastIndexOf('\n', k - 1)` from the line break at its start, `-1`, which searches from 0 and finds
  it again: `k` stayed 0. It stops there now, and the edit is refused, an empty line inside a text
  (Regression199). The pass had taken over half an hour on that one buffer, and never finished.
- **The CM6 demo dropped a command's view where no character changed**: its field returned on
  `!tr.docChanged` before taking the planned view, so a move past an item written the same
  (Fold18's) kept the old document, its ids unswapped, the fold on the wrong item. The planned view
  is taken first now; `demos/cm6/smoke.ts` has the scenario (93 of 93). True-outliner's field took
  it first already.

And the heavy suites, faster:

- `test/view-exhaustive.ts` deals the corpus's start buffers among workers, one a core
  (`VIEW_WORKERS`), each buffer's failures put back in the corpus's order, so the report is the same
  byte for byte as one worker's (and as the last commit's, on its first 60 buffers); a buffer over a
  second is named on stderr (`slow:`), and `VIEW_BUFFERS` plays the first so many. The whole corpus
  in 6.7 s (58 s of CPU), where one core took over half an hour, nearly all of it the hang above.
- `test/heavy.ts` runs its suites side by side, the inverse pairs' two halves too.
- With the corpus grown (§8's cases, Regression199), `test/view-exhaustive.baseline.json` has the new
  corpus's hash; its groups are none, as before.

What was measured, on the code after step 3:

- `npm test`: 2355 tests, the 2349 before, §8's five and Regression199, every one passing. One, "a
  write in a long list or quote takes time in proportion to its length"
  (`test/commands/commands.test.ts`), failed now and then while the heavy suite and the SxS ran
  beside it (a load of 36 on 10 cores: 8,000 lines 9.5 to 13 times as long as 2,000), and passes on
  a machine at rest.
- `npm run typecheck` (`src/`, `test/`, `sxs/`, the CM6 and textarea demos) and true-outliner's
  `tsc --noEmit`: clean. True-outliner's vitest: 891 of 891 (two files reported failing for an
  empty `describe` each, committed before this).
- The CM6 demo's smoke run (`demos/cm6/smoke.ts`, real keys in headless Chromium): 93 of 93
  scenarios, the fold, undo, zoom and breadcrumb ones among them, and the one above.
- The SxS, against the judgment committed in `.sxs` (`--compare`):
  - `--rejudge`, ourus played again on every case against each app's last run: no verdict moved,
    in any of the 18 apps. Ourus's side of every case is what it was.
  - A full run of every app on every case (`node sxs/run.ts all`; `remnote-bl`, whose browser
    closed under it, again alone): the five new cases played, 65 cells (48 agree, 2 caret, 15
    disagree); on the cases both runs have, 1 better (BlockIds11, Athens) and 10 worse, 6 of them
    in Roam (ShiftEnter11 to 13, PastePlain16, Placeholder1, TO-E14-E20), 2 in Logseq DB, 1 each in
    BlockNote and Tine. With ourus's side unchanged, each is an app answering otherwise than in its
    last run, under the same load.
- The heavy suites (`npm run test:heavy`, the suites side by side in 2 minutes):
  - view: every buffer, 1026, 297,443 runs, no failure;
  - inverse: no round trip lost against the last commit's code on the same corpus; its baseline
    recorded again for the grown corpus (`test/inverse.baseline.json`, which had not been since
    23-bugs: the last commit's code gives the same counts);
  - differential, the working tree against the commit before this change (`dc9766e`) and against
    the one with its view layer: 1,440,810 runs each, no outcome moved, one run failing to write
    in both (a plain paste of a tab-indented list after a `- [a]:u` line, CommonMark: not this
    change's). Its outcomes compare node ids renumbered in order of first appearance now: the
    numbers differ between two runs of one tree, and every outcome had moved by them alone.
