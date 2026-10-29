// Drops (spec/move-subtree.md, paste-at.md) in the apps: the runner resolves a case's drop from ourus's own state, its `▸`
// and the run it names, into rows a driver can find on screen (`resolveDrop`); the driver measures
// where those rows and its place's column are, and plays the gesture a user makes (`gesture`).

import type { Page } from 'playwright-core';
import { CommandContext } from '../../src/commands/context.ts';
import { dragRun, placeAtSeam } from '../../src/commands/drag.ts';
import type { OurusConfig } from '../../src/config.ts';
import type { OurusNode } from '../../src/doc/index.ts';
import { labelNumber } from '../../test/drawing.ts';
import { isDrop } from '../../test/player.ts';
import { startOf } from '../../test/spec-run.ts';
import type { SpecTest } from '../../test/specfile.ts';
import type { Outline } from './block.ts';
import type { Drop } from './driver.ts';

/**
 * The drop a case makes, as rows (`Drop`); else why it can't be played: an app plays a drop only from
 * where the case starts, which is where the runner knows it holds what ourus does (its first action),
 * and only one ourus picks up (a pickup ourus refuses has no run to press).
 */
export function resolveDrop(test: SpecTest, flavor: OurusConfig['flavor']): Drop | string {
  const actions = test.steps.flatMap((s) => s.actions);
  const k = actions.findIndex(isDrop);
  if (k < 0) return 'no drop';
  if (k > 0) return 'a drop after other actions';
  const state = startOf(test, flavor);
  const { doc, drop } = state;
  if (!drop) return 'no drop line';
  const action = actions[0]!;
  let run: OurusNode[] = [];
  let press: number | null = null;
  if (action !== 'pasteAt') {
    const label = /^moveSubtree (.)$/u.exec(action)?.[1];
    const pressed = label === undefined ? undefined : state.labels?.get(labelNumber(label));
    if (label !== undefined && pressed === undefined) return `${label} labels no node`;
    const picked = dragRun(new CommandContext(doc, state.selection), pressed);
    if (!Array.isArray(picked)) return `the pickup is refused (${picked.status === 'rejected' ? picked.reason : picked.status})`;
    run = picked;
    press = pressed === undefined ? null : doc.node(pressed)!.startLine;
  }
  const place = placeAtSeam(doc, run.length ? run : null, drop.line, drop.depth);
  if (typeof place === 'string') return place;
  const parent = place.parent === 'root' ? doc.rootNode : doc.node(place.parent)!;
  let listDepth = 0;
  for (let p: OurusNode | null = parent; p; p = p.parent) if (p.kind === 'item') listDepth++;
  let below: number | null = drop.line;
  while (below < doc.lineCount && doc.isBlankLine(below)) below++;
  if (below >= doc.lineCount) below = null;
  return {
    action: action === 'pasteAt' ? 'pasteAt' : 'moveSubtree',
    press,
    rows: run.map((n) => n.startLine),
    seam: { above: drop.line > 0 ? drop.line - 1 : null, below },
    depth: drop.depth,
    listDepth,
    to: { parent: place.parent === 'root' ? 'root' : parent.startLine, after: place.after === null ? null : doc.node(place.after)!.startLine },
  };
}

/**
 * A drop resolved in lines (`resolveDrop`), in the blocks the start projected onto: each row the block
 * its node became (`Projection.rows`), the row above the drop line the block of the node its line is
 * in, the depth the parent block's plus one. Else why not: a row no block holds.
 */
export function inBlocks(drop: Drop, rows: ReadonlyMap<number, number>, outline: Outline): Drop | string {
  const block = (line: number): number | undefined => rows.get(line);
  // (a line of a node's text past its first: the node's block)
  const holding = (line: number): number | undefined => {
    for (let l = line; l >= 0; l--) if (rows.has(l)) return rows.get(l);
    return undefined;
  };
  const press = drop.press === null ? null : block(drop.press);
  const carried = drop.rows.map(block);
  const above = drop.seam.above === null ? null : holding(drop.seam.above);
  const below = drop.seam.below === null ? null : block(drop.seam.below);
  const parent = drop.to.parent === 'root' ? 'root' : block(drop.to.parent);
  const after = drop.to.after === null ? null : block(drop.to.after);
  if (press === undefined || carried.includes(undefined) || above === undefined || below === undefined || parent === undefined || after === undefined) return 'a row no block holds';
  const depth = parent === 'root' ? 0 : outline.blocks[parent]!.depth + 1;
  return { ...drop, press, rows: carried as number[], seam: { above, below }, depth, to: { parent, after } };
}

/** A point on the page, in its CSS pixels. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * A drag as its user makes it, with the real mouse: pressed at `from`, moved a few pixels (past the
 * app's threshold, which starts the drag), then along to `to` in steps, each a move the app sees, and
 * released there. The pointer comes to `from` from off the page, or with `here`, is there already (a
 * handle shown only while the pointer is over its block, which the driver brought it to).
 */
export async function gesture(page: Page, from: Point, to: Point, settle: () => Promise<void>, options: { readonly threshold?: number; readonly here?: boolean } = {}): Promise<void> {
  const threshold = options.threshold ?? 8;
  // (from off the page, as a hand comes to a mark: not from where the last drop left the pointer, over
  // the next case's document)
  if (!options.here) {
    await page.mouse.move(1, 1);
    await page.mouse.move(from.x, from.y, { steps: 4 });
  }
  await page.mouse.down();
  await page.mouse.move(from.x + threshold / 2, from.y + threshold, { steps: 3 });
  await page.mouse.move(to.x, to.y, { steps: 12 });
  // (a last move at the place, then two frames: an app resolves a pointer after the event, a frame or
  // a microtask on, and its idle timers don't say it has)
  await page.mouse.move(to.x, to.y + 0.5);
  await settle();
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))));
  await page.mouse.up();
  await settle();
}
