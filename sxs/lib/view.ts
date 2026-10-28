// Folds and the zoom in the apps: a view by rows, as an app shows it (a block
// app's blocks, a text app's lines, a node's row its first line), loaded with a case's start and read
// back after each step, and compared with ourus's as a reader sees it: the folds in effect, and the
// zoom root.
//
// A state's drawing carries its view as a last line of its own, `⟦folded 2 4; zoom 1⟧` (rows from 1,
// as a reader counts them), so a report shows it and a rejudge reads it back with the state.

import type { Config } from '../../src/config.ts';
import { OurusDoc, type OutlineNode } from '../../src/doc/index.ts';
import type { RowView } from '../../test/spec-run.ts';

export type { RowView };

/** `v` drawn as a drawing's last line, after a line break of its own. */
export function drawView(v: RowView): string {
  const rows = (r: readonly number[]): string => (r.length ? r.map((n) => n + 1).join(' ') : 'none');
  return `\n⟦folded ${rows(v.folded)}; zoom ${v.zoom === null ? 'none' : v.zoom + 1}⟧`;
}

const VIEW = /\n⟦folded (none|\d+(?: \d+)*); zoom (none|\d+)⟧$/;

/** A drawing without its view (`drawView`), and the view, where it has one. */
export function splitView(drawn: string): { drawn: string; view?: RowView } {
  const m = VIEW.exec(drawn);
  if (!m) return { drawn };
  const folded = m[1] === 'none' ? [] : m[1]!.split(' ').map((n) => Number(n) - 1);
  return { drawn: drawn.slice(0, m.index), view: { folded, zoom: m[2] === 'none' ? null : Number(m[2]) - 1 } };
}

export const sameView = (a: RowView | undefined, b: RowView | undefined): boolean => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * A block app's view as its reader sees it (ourus's `zoomFolded`, by blocks): the folded blocks with
 * children, strictly inside the zoom root's subtree where zoomed (a collapsed zoom root, or one of
 * its ancestors, hides nothing), and the zoom.
 */
export function shownInBlocks(blocks: readonly { readonly depth: number }[], v: RowView): RowView {
  const inside = (i: number, z: number): boolean => i > z && blocks.slice(z + 1, i + 1).every((b) => b.depth > blocks[z]!.depth);
  const folded = [...new Set(v.folded)].filter((i) => i < blocks.length && (blocks[i + 1]?.depth ?? -1) > blocks[i]!.depth && (v.zoom === null || inside(i, v.zoom)));
  return { folded: folded.sort((a, b) => a - b), zoom: v.zoom };
}

/**
 * A text app's view as its reader sees it, by ourus's outline of the text: the rows whose node (the
 * outermost starting there) has something to fold, strictly inside the zoom root's where zoomed, and
 * the zoom.
 */
export function shownInText(text: string, config: Partial<Config>, v: RowView): RowView {
  const doc = OurusDoc.parse(text, { config });
  const root = v.zoom === null ? null : doc.rowOwner(v.zoom);
  const inside = (n: OutlineNode): boolean => {
    for (let p = n.parent; p; p = p.parent) if (p === root) return true;
    return false;
  };
  const folded = [...new Set(v.folded)].filter((r) => {
    const node = doc.rowOwner(r);
    return !!node && !!doc.foldRange(node) && (root === null || inside(node));
  });
  return { folded: folded.sort((a, b) => a - b), zoom: v.zoom };
}

/** `v`'s rows, a text's lines, as the blocks the nodes starting there became (`Projection.rows`); null where a row is no block's. */
export function inBlockRows(v: RowView, rows: ReadonlyMap<number, number>): RowView | null {
  const folded = v.folded.map((r) => rows.get(r));
  const zoom = v.zoom === null ? null : rows.get(v.zoom);
  if (folded.includes(undefined) || zoom === undefined) return null;
  return { folded: (folded as number[]).sort((a, b) => a - b), zoom };
}
