// Folds and the zoom in the apps: a view by rows, as an app shows it (a block
// app's blocks, a text app's lines, a node's row its first line), loaded with a case's start and read
// back after each step, and compared with ourus's as a reader sees it: the folds in effect, and the
// zoom root.
//
// A state's drawing carries its view on the rows it names: `⟦folded⟧` right after a folded row's line,
// `⟦zoomed⟧` after the zoom root's (a block's first line, a text's line; no space before it, so a
// line's own trailing space shows as its own), so a report shows it where it is and a
// rejudge reads it back with the state. A drawing with neither is a view with nothing folded and no
// zoom, where the case has a view. (Runs stored before drew it as a last line, `⟦folded 2 4; zoom 1⟧`,
// rows from 1: still read.)

import type { OurusConfig } from '../../src/config.ts';
import { OurusDoc, type OurusNode } from '../../src/doc/index.ts';
import { type RowView } from '../../test/lib/index.ts';

export type { RowView };

const FOLDED = '⟦folded⟧';
const ZOOM = '⟦zoomed⟧';
/** A block selected whole (`test/lib/drawn-states.ts`'s subtree selection): a selection's mark, which `splitView` leaves where it is. */
const SELECTED = '⟦selected⟧';

/**
 * `drawn` with `v` on its rows: `⟦folded⟧` after each folded row's line, `⟦zoomed⟧` after the zoom root's;
 * `lineOf` says which line of the drawing a row starts on (a block's first; a text's line is its row).
 */
export function drawView(drawn: string, v: RowView, lineOf: (row: number) => number = (row) => row): string {
  const lines = drawn.split('\n');
  for (const r of v.folded) {
    const k = lineOf(r);
    if (k >= 0 && k < lines.length) lines[k] += FOLDED;
  }
  if (v.zoom !== null) {
    const k = lineOf(v.zoom);
    if (k >= 0 && k < lines.length) lines[k] += ZOOM;
  }
  return lines.join('\n');
}

/** The last line a stored run drew a view as (`⟦folded 2 4; zoom 1⟧`, rows from 1). */
const FOOTER = /\n⟦folded (none|\d+(?: \d+)*); zoom (none|\d+)⟧$/;

/**
 * A drawing without its view, and the view, where it draws one: by the lines it marks, which `rowOf`
 * makes rows (a text's line is its row; `byLine`: a block drawing maps them once it has read its
 * blocks), or a stored run's last line, rows already.
 */
export function splitView(drawn: string, rowOf: (line: number) => number = (line) => line): { drawn: string; view?: RowView; byLine?: true } {
  const m = FOOTER.exec(drawn);
  if (m) {
    const folded = m[1] === 'none' ? [] : m[1]!.split(' ').map((n) => Number(n) - 1);
    return { drawn: drawn.slice(0, m.index), view: { folded, zoom: m[2] === 'none' ? null : Number(m[2]) - 1 } };
  }
  const folded: number[] = [];
  let zoom: number | null = null;
  const lines = drawn.split('\n').map((line, k) => {
    let selected = '';
    for (let changed = true; changed; ) {
      changed = false;
      if (line.endsWith(SELECTED)) [line, selected, changed] = [line.slice(0, -SELECTED.length), SELECTED, true];
      if (line.endsWith(ZOOM)) [line, zoom, changed] = [line.slice(0, -ZOOM.length), k, true];
      if (line.endsWith(FOLDED)) [line, changed] = [line.slice(0, -FOLDED.length), (folded.push(k), true)];
    }
    return line + selected;
  });
  if (!folded.length && zoom === null) return { drawn };
  return { drawn: lines.join('\n'), view: { folded: folded.map(rowOf).sort((a, b) => a - b), zoom: zoom === null ? null : rowOf(zoom) }, byLine: true };
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
export function shownInText(text: string, config: Partial<OurusConfig>, v: RowView): RowView {
  const doc = OurusDoc.parse(text, { config });
  const root = v.zoom === null ? null : doc.rowOwner(v.zoom);
  const inside = (n: OurusNode): boolean => {
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
