# View

A document and one reader's view of it: the selection, the nodes whose children it hides (its folds)
and the node it is zoomed into. As in VS Code or Emacs, where the selection belongs to the editor
pane and not to the document, two views of one document each have their own. `OurusView` is what a host keeps and commands take and give; its document,
`OurusDoc` (`doc/`), is the text read as an outline, the same in every view: nothing in `doc/` or
`writer/` reads a fold.

Basic usage:

```ts
import { OurusDoc, OurusSuccess, OurusView, executeCommand } from 'ourus';

let view = OurusView.of(OurusDoc.parse(text, { config }), { folded, zoom, selection });
view = view.update({ changes, caret });             // a host's edit: the document's update, the view carried
const result = executeCommand(view.withSelection(selection), { type: 'fold' });
if (result instanceof OurusSuccess) view = result.view; // its text: result.view.doc; its selection: result.view.selection
view.isHidden(node), view.zoomRange(), view.touchedSubtrees(), view.locate(pos);
```

## API

- **`OurusView`** is immutable. Each method returns this view where it changes nothing, so the
  same view means nothing of it changed (its document, selection, folds, zoom), and `view.doc === prev.doc`
  that the document didn't (another document isn't another text: a move can change the ids alone).

  - `static OurusView.of(doc: OurusDoc, state?: OurusViewState): OurusView`<br>
    `doc` with these folds, zoom and selection (a number: a caret there), by default none and a
    caret at the start. A fold that can't be (no such node, nothing
    to hide) and a zoom on no node are dropped: the state comes from outside, a saved view or an
    editor's folds.

  - `OurusView.doc`, `OurusView.selection: OurusSelection`, `OurusView.folded: ReadonlySet<number>`, `OurusView.zoom: number | null`, `get OurusView.zoomRoot`, `get OurusView.zoomFolded`<br>
    The document; the selection, what a command acts at; the folds; the zoom root's id and node; the folds in effect within the zoom,
    those of the nodes strictly inside its root (all of `folded` where not zoomed): zoomed, the
    root's and its ancestors' folds hide nothing, and apply again when the zoom is left.

  - `OurusView.isFolded(node)`, `OurusView.isHidden(node)`, `OurusView.shown(node)`, `OurusView.zoomRange()`<br>
    Whether a node's fold is in effect; whether the view hides it (under a fold in effect, or
    outside the zoom); the node the reader sees for it (its outermost ancestor whose fold hides it,
    else itself); what the zoom shows, in offsets (`doc.coverRange` of the root), or null.

  - `OurusView.withSelection(sel | pos)`, `OurusView.withFolded(ids)`, `OurusView.withZoom(id | null)`<br>
    Another selection (a number: a caret there); other folds (one that can't fold dropped); another
    zoom, no fold changed (throws for no node there, or the root). Each keeps the rest.

  - `OurusView.update(params: OurusViewUpdate)`, `OurusView.withDoc(next: OurusDoc, changes?)`, `OurusView.withConfig(config)`<br>
    A host's edit: the document's `update`, the view carried through its changes, its selection
    `params.selection` or `params.caret` (the same: `caret: n` is a selection whose ends are both n),
    whose head the document reads as its caret; given neither, this one's mapped through the changes
    (before what is inserted at it). Another snapshot of the lineage (a command's, an undo's:
    `view.withDoc(like.withConfig(view.doc.config))`, another pane's), the view carried onto it
    through `changes` (by default, the lines that differ; throws for another lineage), its selection
    mapped. The document under other options, the view carried by id, or by
    line where the flavor changed (its ids anew).

  - `OurusView.escape(next: OurusDoc, removed?: boolean): string | null`<br>
    Where `next` leaves the zoom (the root moved or gone, a node outside it changed or made, the
    text before the root's Markdown or after its cover changed, a list it is in changed), or null,
    also where not zoomed; `removed`: the root went whole. The commands check their results by it,
    and `leavesZoom` (`commands/`) a host's edit.

  - `OurusView.locate(pos)`<br>
    `doc.locateRaw(pos)`, a gap's owner the node the reader sees: after a folded subtree, the
    folded node.

  - `OurusView.touchedSubtrees(sel?)`, `OurusView.selectedSubtrees(sel?)`, `OurusView.selectionOf(roots, direction?)`, `OurusView.visibleSelection(sel?)`<br>
    What a selection (the view's by default) is of the outline, in what the reader sees, as
    nodes: the topmost roots of the subtrees it touches (a caret's node, the innermost where nodes
    share a line; a blank line the gap of the node above it; a node a fold hides its folded row's);
    the roots of a subtree selection, one that is exactly their subtrees as whole lines (where nodes
    share those lines, the outermost inside the zoom), else null; the canonical subtree selection of
    `roots`, nodes or ids (throws for one hidden or outside the zoom); a selection moved out of what
    the view hides. A view keeps its last selection's answers.

  - `editableStart(doc: OurusDoc, node: OurusNode): number`<br>
    Where a caret entering `node` starts editing: past a quote or an item with no text of its own, its
    first child's text; its text's start; where markup is decorated, an atom's payload, blank code's
    first code line, not its opening fence. The zoom's entry and a subtree selection left both use it.

- **The carrying rule** (`carry.ts`): a fold stays where its node is there
  with something to hide and, but for the zoom root's and its ancestors', where what it hides is the
  same nodes with the same texts (read only for a fold a change comes near); else it opens. The
  zoom stays where its root is there and none of its subtree left it; its root gone, it goes to the
  nearest ancestor left; a node gone out of it, it ends. A command's view is carried where its
  document was updated, step by step.

Files: `index.ts` (the API); `view.ts` (`OurusView`); `carry.ts` (the carrying rule, by id and by
line); `escape.ts` (the zoom's invariant); `select.ts` (what a selection is in what the reader
sees).

Tests, in `test/view/`: `view.test.ts` (what folds hide and a zoom shows, the view through edits,
undo and a second view, `leavesZoom`, identity). The view in every command: `spec/fold.md`,
`spec/zoom.md`, and `test/view-exhaustive.ts` (heavy).
