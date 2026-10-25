// What a command is given and gives back: the document and the selection, located; a draft applied:
// fixed by `done()`, spelled by `write()`, read back by the document, and checked against what the
// draft meant.

import type { Config } from '../config.ts';
import type { Located, OurusDoc } from '../doc/index.ts';
import { OurusDraft } from '../draft/index.ts';
import type { CommandResult, RejectReason, Selection } from './types.ts';

/**
 * A command's outcome; null where ourus doesn't do it yet (a case of a command): `executeCommand`
 * leaves a key with a host's default to the host there, and refuses a structural command (`unsupported`).
 */
export type CommandOutcome = CommandResult | null;

export class CommandContext {
  readonly doc: OurusDoc;
  readonly selection: Selection;
  #from: Located | undefined;
  #to: Located | undefined;

  constructor(doc: OurusDoc, selection: Selection) {
    this.doc = doc;
    this.selection = selection;
  }

  /** The same document with a caret at `pos`: a command acting from there. */
  at(pos: number): CommandContext {
    return new CommandContext(this.doc, { anchor: pos, head: pos });
  }

  get config(): Config {
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
    return { status: 'applied', doc: applied.doc, changes: applied.changes, selection: applied.selection };
  }
}

export const reject = (reason: RejectReason, detail?: string): CommandResult =>
  detail === undefined ? { status: 'rejected', reason } : { status: 'rejected', reason, detail };

export const notApplicable = (detail?: string): CommandResult => (detail === undefined ? { status: 'notApplicable' } : { status: 'notApplicable', detail });
