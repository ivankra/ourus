// What a command is given and gives back: the document and the selection, located; a draft applied:
// fixed by `done()`, spelled by `write()`, read back by the document, and checked against what the
// draft meant.

import type { OurusConfig } from '../config.ts';
import type { Located, OurusDoc } from '../doc/index.ts';
import { OurusDraft } from '../writer/index.ts';
import type { OurusCommandResult, RejectReason, OurusSelection } from './types.ts';

/**
 * A command's outcome; null where ourus doesn't do it yet (a case of a command): `executeCommand`
 * leaves a key with a host's default to the host there, and refuses a structural command (`unsupported`).
 */
export type CommandOutcome = OurusCommandResult | null;

export class CommandContext {
  readonly doc: OurusDoc;
  readonly selection: OurusSelection;
  /** The nodes the command acts on, by id, where it was given them (`OurusCommand.nodes`): else the selection's. */
  readonly nodes: readonly number[] | undefined;
  #from: Located | undefined;
  #to: Located | undefined;

  constructor(doc: OurusDoc, selection: OurusSelection, nodes?: readonly number[]) {
    this.doc = doc;
    this.selection = selection;
    this.nodes = nodes;
  }

  /** The same document with a caret at `pos`: a command acting from there. */
  at(pos: number): CommandContext {
    return new CommandContext(this.doc, { anchor: pos, head: pos });
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
    return (this.#from ??= this.doc.locate(Math.min(this.selection.anchor, this.selection.head)));
  }

  get to(): Located {
    return (this.#to ??= this.collapsed ? this.from : this.doc.locate(Math.max(this.selection.anchor, this.selection.head)));
  }

  /**
   * `draft` of the document applied: the next document, its changes and selection; a refusal where
   * Markdown can't say it, or `write-failed` where the writer failed (a bug).
   */
  apply(draft: OurusDraft): CommandOutcome {
    const applied = draft.done();
    if ('reason' in applied) return reject(applied.reason, applied.detail);
    const { moved, merged } = applied.blockIds;
    return { status: 'applied', doc: applied.doc, changes: applied.changes, selection: applied.selection, ...(moved.length && { movedBlockIds: moved }), ...(merged.length && { mergedBlockIds: merged }) };
  }
}

/**
 * What the steps of one edit (a command made of others: a selection deleted, then a paste) declared
 * about block ids, together: every step's moves and merges, in order, and the nodes they removed on
 * purpose, as the applied result has them.
 */
export function blockIdsDeclaredBy(steps: readonly OurusCommandResult[]): Pick<Extract<OurusCommandResult, { status: 'applied' }>, 'movedBlockIds' | 'mergedBlockIds' | 'removedNodes'> {
  const moved = steps.flatMap((r) => (r.status === 'applied' ? (r.movedBlockIds ?? []) : []));
  const merged = steps.flatMap((r) => (r.status === 'applied' ? (r.mergedBlockIds ?? []) : []));
  const removed = steps.flatMap((r) => (r.status === 'applied' ? (r.removedNodes ?? []) : []));
  return { ...(moved.length && { movedBlockIds: moved }), ...(merged.length && { mergedBlockIds: merged }), ...(removed.length && { removedNodes: removed }) };
}

export const reject = (reason: RejectReason, detail?: string): OurusCommandResult =>
  detail === undefined ? { status: 'rejected', reason } : { status: 'rejected', reason, detail };

export const deferToHost = (detail?: string): OurusCommandResult => (detail === undefined ? { status: 'deferredToHost' } : { status: 'deferredToHost', detail });
