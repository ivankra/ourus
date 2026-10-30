// The commands' API types: a command, the selection it acts on, and what it does.

import type { OurusClipboard } from './clipboard.ts';
import type { OurusView } from '../view/index.ts';
import type { ChangeSpec, OurusSelection } from '../text/index.ts';

export type { OurusSelection };

/** A place in the outline: under `parent`, right after its child `after` (null: first). */
export type InsertionPoint = { readonly parent: number | 'root'; readonly after: number | null };

/**
 * The nodes a structural command acts on, by id: contiguous siblings, each with its subtree, for a
 * context menu, a tree pane or a dialog acting on nodes the caret isn't in. Without it, the
 * selection's.
 */
type Nodes = { readonly nodes?: readonly number[] };

/** What `executeCommand` runs. */
export type OurusCommand =
  | ({ readonly type: 'indent' } & Nodes)
  | ({ readonly type: 'outdent' } & Nodes)
  | ({ readonly type: 'moveSubtreeUp' } & Nodes)
  | ({ readonly type: 'moveSubtreeDown' } & Nodes)
  /**
   * A pickup (spec/drag.md): the nodes a drag takes, the places it can drop them, and their clipboard;
   * the document unchanged. `pressed`: the node whose mark was pressed, for the cover rule; else
   * `nodes`, else the selection's. The folds and zoom are the view's (`OurusView.zoomFolded`,
   * `OurusView.zoom`).
   */
  | ({ readonly type: 'drag'; readonly pressed?: number } & Nodes)
  /** A drag from outside, carrying `clipboard`: the places it can be dropped, the document as it is. */
  | { readonly type: 'drag'; readonly clipboard: OurusClipboard }
  /** A drop of the document's own nodes: moved, with their subtrees, to the place `to` (spec/move-subtree.md). */
  | ({ readonly type: 'moveSubtree'; readonly to: InsertionPoint } & Nodes)
  /** A drop from outside: the clipboard, every format the host has of it, read as paste reads it and fitted at `at`. */
  | { readonly type: 'pasteAt'; readonly at: InsertionPoint; readonly clipboard: OurusClipboard }
  /** A text drag's first half: the selection deleted as a cut deletes it; the drop is a `paste` at the position it maps to. */
  | { readonly type: 'deleteByDrag' }
  /** Enter: split the node at the caret. */
  | { readonly type: 'enter' }
  /** Shift-Enter: a line break inside the node's text, which stays one node. */
  | { readonly type: 'shiftEnter' }
  /** Backspace at the start of a node: join it to the node above. */
  | { readonly type: 'deleteContentBackward' }
  /** Delete at the end of a node: join the node below to it. */
  | { readonly type: 'deleteContentForward' }
  /** Cmd-Backspace: delete back to the start of the line's text, never into a marker. */
  | { readonly type: 'deleteSoftLineBackward' }
  /** Paste (Ctrl-V): the clipboard, every format the host has of it, read as Markdown and placed as nodes. */
  | { readonly type: 'paste'; readonly clipboard: OurusClipboard }
  /** Paste as plain text (Ctrl-Shift-V): the text goes into the node at the caret, its line breaks as Shift-Enter's. */
  | { readonly type: 'pastePlain'; readonly text: string }
  /**
   * The selected nodes go, with their subtrees; with `expectMarkdown`, only if a copy of them still
   * gives that text (a drag out to another document, whose payload it was).
   */
  | ({ readonly type: 'deleteSubtree'; readonly expectMarkdown?: string } & Nodes)
  /** A copy of the selected nodes, with their subtrees, goes below them. */
  | ({ readonly type: 'duplicateSubtree' } & Nodes)
  /** Typing: `text` typed at the selection, as a key types it. ourus's where Markdown reads it as structure (a backtick), else the host's. */
  | { readonly type: 'insertText'; readonly text: string }
  /** Copy (Ctrl-C): the selection's Markdown, as the result's `clipboard`; the document unchanged. */
  | ({ readonly type: 'copy' } & Nodes)
  /** Cut (Ctrl-X): copy, then what was copied taken out. */
  | ({ readonly type: 'cut' } & Nodes)
  /**
   * The view's: the nodes at the selection, or `nodes`, folded. While zoomed the root's and its
   * ancestors' folds are left alone. The text unchanged, the selection out of what is hidden.
   */
  | ({ readonly type: 'fold' } & Nodes)
  /** The nodes at the selection, or `nodes`, unfolded, as `fold`. */
  | ({ readonly type: 'unfold' } & Nodes)
  /**
   * The folds of the nodes at the selection, or `nodes`, toggled, as `fold`: unfolded where any of
   * them is folded within the zoom, else folded; at a node that doesn't fold, its parent's.
   */
  | ({ readonly type: 'toggleFold' } & Nodes)
  /**
   * Select the node at the caret with its subtree, as whole lines (Escape in Logseq, Tine, Tana); over
   * text across nodes, its roots. Over a subtree selection, a caret at its first node's text start.
   */
  | { readonly type: 'selectNode' }
  /** The next rung of the selection ladder (Ctrl-A in outliners, Shift-Alt-Right in code editors): the node's text, its subtree, its siblings, its parent, ..., everything; then the host's select all. */
  | { readonly type: 'expandSelection' }
  /** Shift-Down and Shift-Up by node: one node a press, a subtree selection growing away from its anchor's node and shrinking towards it; inside a node's text, but from its edge, the host's. */
  | { readonly type: 'selectNodeDown' }
  | { readonly type: 'selectNodeUp' }
  /** Zoom into `nodes[0]` (a click on its mark), else the selection's first root in document order. */
  | ({ readonly type: 'zoomIn' } & Nodes)
  /** Zoom out one level, to the root's parent, or out of the zoom from a top-level root. */
  | { readonly type: 'zoomOut' }
  /** Zoom out of the zoom, whatever its depth. */
  | { readonly type: 'clearZoom' }
  /**
   * A block id for node `node` (by id; else the selection's node), `name` or one made up, in the form
   * the node's kind takes (spec/block-ids.md); for a block inside a list item, on the item,
   * which is what Obsidian names by it. Refused (`block-id`) where one already names the node, or the
   * note has `name`. With `node`, the caret goes after it.
   */
  | { readonly type: 'addBlockId'; readonly name?: string; readonly node?: number }
  /**
   * Block id `name` deleted, attached or stray (where the note has it twice, the one node `node`
   * owns; refused as `block-id` without it); without `name`, the one a link to the selection's node
   * uses.
   */
  | { readonly type: 'removeBlockId'; readonly name?: string; readonly node?: number };

/** Why a command was rejected. */
export type RejectReason =
  | 'no-previous-sibling'
  | 'no-next-sibling'
  | 'at-top-level'
  | 'at-h1-bound'
  | 'at-h6-bound'
  | 'not-expressible'
  | 'would-reparent'
  | 'non-contiguous'
  | 'mixed-kinds'
  | 'has-children'
  | 'nothing-above'
  /** An id the document doesn't have (it changed since the id was read). */
  | 'no-such-node'
  /** A selection whose ends aren't positions in the text: integers from 0 to its length (it changed since the selection was read). */
  | 'invalid-selection'
  /** A place whose `after` isn't a child of its `parent`, or is one of the nodes moved. */
  | 'invalid-insertion-point'
  /** A move to a place inside the nodes moved. */
  | 'into-itself'
  /** `deleteSubtree`'s nodes are no longer the Markdown it expected: they changed since they were dragged out. */
  | 'content-changed'
  /** A join with a node a fold hides: Delete at the end of a folded node's text, its first child hidden. */
  | 'folded'
  /** Zoomed: the result would change, make or move a node outside the zoom root's subtree, or its operands are outside it. */
  | 'outside-zoom'
  /**
   * The result would lose a block id: written off its node, naming another or nothing, shadowed, or
   * a name written twice; a merge of two nodes that both have one
   * (`joinBlockIds: refuse`); an `addBlockId` or `removeBlockId` that has nothing to do.
   */
  | 'block-id'
  /** A structural command ourus doesn't do here yet: a case it doesn't cover. (A key with a host's default is the host's there.) */
  | 'unsupported'
  /** The writer failed: a layout it has no rule for, or a text written that doesn't read as the draft. A bug, never an outcome. */
  | 'write-failed';

/** What `executeCommand` gives: the command done, refused, or left to the host. Tell them apart with `instanceof`. */
export type OurusResult = OurusSuccess | OurusRejected | OurusDeferred;

/** The command done: the view after it, and what the host commits. */
export class OurusSuccess {
  /** The view after: the document after, the folds and zoom carried onto it. */
  readonly view: OurusView;
  /** The text's changes, in the input document's offsets: what the host applies to its editor. */
  readonly changes: readonly ChangeSpec[];
  /** The selection after, in the new text's offsets. */
  readonly selection: OurusSelection;
  /** Copy and cut: what the host writes to the clipboard, every format. */
  readonly clipboard?: OurusClipboard;
  /** A drop (`moveSubtree`, `pasteAt`): the topmost nodes it put in place, in document order, for a host that selects them. */
  readonly placed?: readonly number[];
  /** A pickup (`drag`): what it takes, and where it can drop it. */
  readonly dropMap?: DropMap;
  /**
   * The block ids it wrote on another node on purpose (a merge's node that stays taking the other's),
   * by name, to the node's id. What else it did to block ids a host reads by comparing `blockIds()`
   * before and after.
   */
  readonly movedBlockIds?: readonly { readonly name: string; readonly to: number }[];
  /** The block ids it dropped for the other's (`joinBlockIds: merge`), for a host that redirects links to them. */
  readonly mergedBlockIds?: readonly { readonly from: string; readonly into: string }[];
  /** The nodes it removed on purpose, each with its subtree, by id (`deleteSubtree`, a cut of nodes): their block ids went with them. */
  readonly removedNodes?: readonly number[];

  /** Its fields (another success spread to keep its own: `{ ...result, selection }`). */
  constructor(fields: OurusSuccess) {
    this.view = fields.view;
    this.changes = fields.changes;
    this.selection = fields.selection;
    this.clipboard = fields.clipboard;
    this.placed = fields.placed;
    this.dropMap = fields.dropMap;
    this.movedBlockIds = fields.movedBlockIds;
    this.mergedBlockIds = fields.mergedBlockIds;
    this.removedNodes = fields.removedNodes;
  }
}

/** Refused: nothing changed. `reason` says why; `detail`, where there is one, how. */
export class OurusRejected {
  readonly reason: RejectReason;
  readonly detail?: string;

  constructor(reason: RejectReason, detail?: string) {
    this.reason = reason;
    this.detail = detail;
  }
}

/**
 * Left to the host: ourus doesn't act on the key here, and the host runs its own default. `detail`
 * says why, where ourus stepped aside from an edit it would refuse (`markup: text`), or that ourus
 * doesn't cover the case yet.
 */
export class OurusDeferred {
  readonly detail?: string;

  constructor(detail?: string) {
    this.detail = detail;
  }
}

export type { OurusClipboard };


/** What a pickup returns: the nodes in flight, their lines, and every seam they can be dropped at. */
export interface DropMap {
  /** The run's roots, after the cover rule and its normalization. */
  readonly nodes: readonly number[];
  /** Each root's lines, `[from, to)`, for the lifted decoration. */
  readonly lines: readonly (readonly [number, number])[];
  /** In document order. */
  readonly seams: readonly DropSeam[];
}

/** A boundary between two nodes, never inside one: where a drop line is drawn. The pointer's y picks one. */
export interface DropSeam {
  /** The first line of the node below, past the gap's blank lines (the line count at the end). */
  readonly beforeLine: number;
  /** The nodes flanking it, by id. */
  readonly nodeAbove: number | null;
  readonly nodeBelow: number | null;
  /** The blank lines between them, the node above's, for where the drop line goes. */
  readonly gapLines: number;
  /** Shallowest first; none at a move's dead seam, the run's bottom. */
  readonly points: readonly DropPoint[];
}

/** One place at a seam, at one depth: the pointer's x picks one. An `InsertionPoint`, for any command that takes one. */
export interface DropPoint extends InsertionPoint {
  /** The depth the run's roots take there: 0 at the top level. */
  readonly depth: number;
  /** How many list items the place is inside, for a host that indents only lists. */
  readonly listDepth: number;
  /** The run's own place: a drop there changes nothing. */
  readonly current: boolean;
  /** Whether the run's first root changes kind there (a paragraph becoming an item), read from the rules, not a check. */
  readonly converts: boolean;
  /** The drop there, ready to run. */
  readonly drop: OurusCommand;
}
