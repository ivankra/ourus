// The apps here, and how a command line names them: `all`, a group, an app by its directory or its
// two capitals (`logseq`, `LO`), comma-separated, `-` before one leaving it out (`all,-RN,-RB`).

import { existsSync, readdirSync } from 'node:fs';
import type { Driver } from './driver.ts';

const here = new URL('../', import.meta.url);

/** Every app: a directory of `sxs/` with a driver (`lib/`'s `driver.ts` is what a driver provides, no app). */
export const appDirs = (): string[] =>
  readdirSync(here, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'lib' && existsSync(new URL(`${d.name}/driver.ts`, here)))
    .map((d) => d.name)
    .sort();

/** Every app's driver, by its directory. */
export async function drivers(): Promise<Map<string, Driver>> {
  return new Map(await Promise.all(appDirs().map(async (dir) => [dir, ((await import(new URL(`${dir}/driver.ts`, here).href)) as { driver: Driver }).driver] as const)));
}

/** What a group stands for: the block apps, the text apps, the block apps without paragraphs (outliners), those with them. */
export const GROUPS: Record<string, (d: Driver) => boolean> = {
  block: (d) => d.model === 'block',
  text: (d) => d.model === 'text',
  outliners: (d) => d.model === 'block' && !d.freeForm,
  free: (d) => d.model === 'block' && !!d.freeForm,
};

/** ourus, by name or by its column's two capitals in the tables: not an app here, but a probe can name it. */
export const OURUS = new Set(['ourus', 'us']);

/**
 * The apps `spec` names, by directory, in the order of `appDirs`; whether it names ourus; and the names
 * it has that are none of these.
 */
export async function resolveApps(spec: string): Promise<{ apps: string[]; ourus: boolean; unknown: string[] }> {
  const all = await drivers();
  const byName = new Map<string, string[]>();
  for (const [dir, d] of all) {
    byName.set(dir.toLowerCase(), [dir]);
    byName.set(d.shortId.toLowerCase(), [dir]);
  }
  byName.set('all', [...all.keys()]);
  for (const [group, has] of Object.entries(GROUPS)) byName.set(group, [...all].filter(([, d]) => has(d)).map(([dir]) => dir));
  const picked = new Set<string>();
  const unknown: string[] = [];
  let ourus = false;
  for (const raw of spec.split(',').map((s) => s.trim()).filter(Boolean)) {
    const out = raw.startsWith('-');
    const name = (out ? raw.slice(1) : raw).toLowerCase();
    if (OURUS.has(name)) {
      ourus = !out;
      continue;
    }
    const dirs = byName.get(name);
    if (!dirs) {
      unknown.push(raw);
      continue;
    }
    for (const dir of dirs) out ? picked.delete(dir) : picked.add(dir);
  }
  return { apps: [...all.keys()].filter((dir) => picked.has(dir)), ourus, unknown };
}

/** The names a command line can give, for an error message. */
export async function appNames(): Promise<string> {
  const all = await drivers();
  return `all, ${Object.keys(GROUPS).join(', ')}, or apps: ${[...all].map(([dir, d]) => `${d.shortId} ${dir}`).join(', ')}`;
}
