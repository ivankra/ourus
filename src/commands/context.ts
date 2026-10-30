// What a command is given and gives back: the document and the selection, located; a draft applied:
// fixed by `done()`, spelled by `write()`, read back by the document, and checked against what the
// draft meant.
//
// A command function gives an `OurusResult`, or null where no rule of its covers the case: the next
// is tried (`a ?? b`), and `executeCommand` makes a final null the host's for a key it has a default
// for (`deferredToHost`), else a refusal (`unsupported`). A host never sees null.

import type { OurusConfig } from '../config.ts';
import type { Located, OurusDoc, OurusDocUpdate } from '../doc/index.ts';
import type { OurusView } from '../view/index.ts';
import { OurusDraft } from '../writer/index.ts';
import type { OurusResult, RejectReason, OurusSelection } from './types.ts';
import { OurusDeferred, OurusRejected, OurusSuccess } from './types.ts';


export class CommandContext {
  /** The view the command acts in: its document, and the folds and zoom the command keeps to. */
  readonly view: OurusView;
  readonly selection: OurusSelection;
  /** The nodes the command acts on, by id, where it was given them (`OurusCommand.nodes`): else the selection's. */
  readonly nodes: readonly number[] | undefined;
  #from: Located | undefined;
  #to: Located | undefined;

  constructor(view: OurusView, selection: OurusSelection, nodes?: readonly number[]) {
    this.view = view;
    this.selection = selection;
    this.nodes = nodes;
  }

  /** The view's document. */
  get doc(): OurusDoc {
    return this.view.doc;
  }

  /** The same view with a caret at `pos`: a command acting from there. */
  at(pos: number): CommandContext {
    return new CommandContext(this.view, { anchor: pos, head: pos });
  }

  get config(): OurusConfig {
    return this.doc.config;
  }

  /** A draft of the document, for the command's edit. */
  draft(): OurusDraft {
    return new OurusDraft(this.doc);
  }

  /** Whether the selection is a caret. */
  get collapsed(): boolean {
    return this.selection.anchor === this.selection.head;
  }

  /** Where the selection starts and ends. */
  get from(): Located {
    return (this.#from ??= this.view.locate(Math.min(this.selection.anchor, this.selection.head)));
  }

  get to(): Located {
    return (this.#to ??= this.collapsed ? this.from : this.view.locate(Math.max(this.selection.anchor, this.selection.head)));
  }

  /**
   * `draft` of the document applied: the next document, its changes and selection; a refusal where
   * Markdown can't say it, or `write-failed` where the writer failed (a bug).
   */
  apply(draft: OurusDraft): OurusResult | null {
    if (draft.from !== this.doc) throw new Error("a draft of another document than the context's: make a context on its view");
    const applied = draft.done();
    if ('reason' in applied) return new OurusRejected(applied.reason, applied.detail);
    const { moved, merged } = applied.blockIds;
    const view = this.view.withDoc(applied.doc, applied.changes);
    return new OurusSuccess({ view, changes: applied.changes, selection: applied.selection, ...(moved.length && { movedBlockIds: moved }), ...(merged.length && { mergedBlockIds: merged }) });
  }

  /** The view after a host's kind of edit of the document (`OurusView.update`), the view carried. */
  update(params: OurusDocUpdate): OurusView {
    return this.view.update(params);
  }
}

/**
 * What the steps of one edit (a command made of others: a selection deleted, then a paste) declared
 * about block ids, together: every step's moves and merges, in order, and the nodes they removed on
 * purpose, as the applied result has them.
 */
export function blockIdsDeclaredBy(steps: readonly OurusResult[]): Pick<OurusSuccess, 'movedBlockIds' | 'mergedBlockIds' | 'removedNodes'> {
  const moved = steps.flatMap((r) => (r instanceof OurusSuccess ? (r.movedBlockIds ?? []) : []));
  const merged = steps.flatMap((r) => (r instanceof OurusSuccess ? (r.mergedBlockIds ?? []) : []));
  const removed = steps.flatMap((r) => (r instanceof OurusSuccess ? (r.removedNodes ?? []) : []));
  return { ...(moved.length && { movedBlockIds: moved }), ...(merged.length && { mergedBlockIds: merged }), ...(removed.length && { removedNodes: removed }) };
}


