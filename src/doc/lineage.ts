// The id counter of one document's snapshots: below the document, which holds one, and the outline,
// which takes ids from it.

import { nodeId, type NodeId } from '../text/index.ts';

/**
 * The id counter shared by every snapshot of one document: the one `OurusDoc.parse` returns and
 * every snapshot derived from it (updates, drafts, `with…` copies; `isSameLineage`). Each id is
 * handed out once, so a snapshot brought back later (an undo's) never shares an id with a node
 * created since. The root's id is always `ROOT`.
 */
export class Lineage {
  /** The root's id, the same in every snapshot; every other node's is past it. */
  static readonly ROOT = nodeId(0);

  #next = Lineage.ROOT + 1;

  /** The next id to give. */
  get next(): number {
    return this.#next;
  }

  /** A new id. */
  take(): NodeId {
    return nodeId(this.#next++);
  }
}
