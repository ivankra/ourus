/// <reference lib="dom" />
// Replays the spec against Logseq's web demo in headless Chromium: one browser and one loaded app
// for the whole run, a fresh Logseq page per test.
//
//   node test/logseq/run.ts [filter] [-v] [--record] [--url=https://demo.logseq.com/]
//
// - By default: replays every spec example Logseq can hold. ourus's examples (spec/*.md) report
//   whether Logseq agrees with ourus; Logseq's own examples (files with `editor: logseq`,
//   spec/logseq.md) must agree, or Logseq's behaviour changed.
// - With --record: adapts every ourus example to what Logseq can hold (test/logseq/adapt.ts), runs
//   it, and writes spec/logseq.md with Logseq's results as the expected buffers.
//
// Outlines are compared, not Logseq's file format: (depth, text) per block, plus the caret's or
// selection's block and offsets.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium, type Page } from 'playwright-core';
import { drawText, readText } from '../drawing.ts';
import { readSpec, type SpecTest } from '../specfile.ts';
import { actionSupported, adapt, draw, KEYS, readOutline, unescape, Unsupported, type Adapted, type Block, type Outline, type Sel } from './adapt.ts';

const args = process.argv.slice(2);
const filter = args.find((a) => !a.startsWith('-'));
const url = args.find((a) => a.startsWith('--url='))?.slice(6) ?? 'https://demo.logseq.com/';
const verbose = args.includes('-v');
const record = args.includes('--record');
const specDir = new URL('../../spec/', import.meta.url);
const OUTPUT = 'logseq.md';

// ------------------------------------------------------------------ reading drawn outlines

/** Text compared without the spaces next to line breaks, where editors differ in trimming. */
const loose = (o: Outline) => o.blocks.map((b) => `${b.depth}:${b.text.replace(/ *\n */g, '\n').trim()}`).join('|');
const sameBlocks = (a: Block[], b: Block[]) => a.length === b.length && a.every((x, i) => x.depth === b[i]!.depth && x.text === b[i]!.text);
const sameSel = (a: Sel | null, b: Sel | null) => JSON.stringify(a) === JSON.stringify(b);

// ------------------------------------------------------------------ Logseq

async function build(page: Page, o: Outline): Promise<string> {
  return page.evaluate(async ({ blocks, sel }) => {
    const api = (window as any).logseq.api;
    const name = 'spec-' + Math.random().toString(36).slice(2, 10);
    await api.create_page(name, {}, { redirect: true, createFirstBlock: true });
    await new Promise((r) => setTimeout(r, 300));
    const roots: any[] = [];
    const stack: any[] = [];
    for (const b of blocks) {
      const node = { content: b.text, children: [] as any[] };
      stack.length = b.depth;
      (b.depth === 0 ? roots : stack[b.depth - 1].children).push(node);
      stack[b.depth] = node;
    }
    const first = (await api.get_page_blocks_tree(name))[0];
    await api.insert_batch_block(first.uuid, roots, { sibling: true });
    await api.remove_block(first.uuid);
    if (sel) {
      const flat: any[] = [];
      const walk = (bs: any[]) => bs.forEach((x) => (flat.push(x), walk(x.children ?? [])));
      walk(await api.get_page_blocks_tree(name));
      await api.edit_block(flat[sel.block].uuid, { pos: sel.head });
      await new Promise((r) => setTimeout(r, 150));
      const ta = document.activeElement as HTMLTextAreaElement | null;
      if (ta?.tagName === 'TEXTAREA' && sel.anchor !== sel.head) {
        ta.setSelectionRange(Math.min(sel.anchor, sel.head), Math.max(sel.anchor, sel.head), sel.head < sel.anchor ? 'backward' : 'forward');
      }
    }
    return name;
  }, o);
}

async function read(page: Page, name: string): Promise<Outline> {
  return page.evaluate(async (name) => {
    const api = (window as any).logseq.api;
    const flat: { depth: number; text: string; uuid: string }[] = [];
    const walk = (bs: any[], d: number) => bs.forEach((x) => (flat.push({ depth: d, text: x.content, uuid: x.uuid }), walk(x.children ?? [], d + 1)));
    walk(await api.get_page_blocks_tree(name), 0);
    const editing = await api.check_editing();
    const ta = document.activeElement as HTMLTextAreaElement | null;
    const i = editing && ta?.tagName === 'TEXTAREA' ? flat.findIndex((b) => b.uuid === editing) : -1;
    if (i >= 0) flat[i]!.text = ta!.value; // the editing block's live text is in its textarea
    const back = ta?.selectionDirection === 'backward';
    return {
      blocks: flat.map(({ depth, text }) => ({ depth, text })),
      sel: i >= 0 ? { block: i, anchor: back ? ta!.selectionEnd : ta!.selectionStart, head: back ? ta!.selectionStart : ta!.selectionEnd } : null,
    };
  }, name);
}

async function act(page: Page, action: string, clipboard: string): Promise<void> {
  if (action.startsWith('"')) await page.keyboard.type(action.slice(1, -1), { delay: 20 });
  else if (action === 'insertFromPaste') {
    await page.evaluate((t) => navigator.clipboard.writeText(t), clipboard);
    await page.keyboard.press('Control+V');
  } else await page.keyboard.press(KEYS[action]!);
  await page.waitForTimeout(250);
}

/** Builds an outline, plays the steps, and returns the outline read after each step. */
async function replay(page: Page, initial: Outline, steps: readonly (readonly string[])[], clipboard: string): Promise<Outline[]> {
  const name = await build(page, initial);
  await page.waitForTimeout(500);
  const out: Outline[] = [];
  for (const s of steps) {
    for (const a of s) await act(page, a, clipboard);
    out.push(await read(page, name));
  }
  return out;
}

/** Replays each example and compares with its expected buffers. */
async function check(page: Page, tests: SpecTest[]): Promise<void> {
  const tally = new Map<string, number>();
  const skipped = new Map<string, number>();
  for (const t of tests) {
    const name = `${t.file} › ${t.name}`;
    const group = (t.options.editor ?? 'ourus') === 'logseq' ? 'logseq.md' : 'ourus spec';
    let start: Outline;
    const wants: (Outline | null)[] = [];
    try {
      const exact = group === 'logseq.md';
      start = unescape(readOutline(t.initial.buffer, exact));
      for (const s of t.steps) {
        for (const a of s.actions) if (!actionSupported(a)) throw new Unsupported(`action ${a}`);
        wants.push(s.expect.buffer !== undefined ? unescape(readOutline(s.expect.buffer, exact)) : null);
      }
      if (!wants.some((w) => w)) throw new Unsupported('no buffer to compare');
    } catch (e) {
      if (!(e instanceof Unsupported)) throw e;
      skipped.set(e.message, (skipped.get(e.message) ?? 0) + 1);
      tally.set(`${group}: skipped`, (tally.get(`${group}: skipped`) ?? 0) + 1);
      if (verbose) console.log(`skipped    ${name}: ${e.message}`);
      continue;
    }
    let verdict = 'agree';
    let detail = '';
    try {
      const got = await replay(page, start, t.steps.map((s) => s.actions), readText(t.initial.clipboard ?? ''));
      for (let i = 0; i < wants.length && verdict === 'agree'; i++) {
        const w = wants[i];
        if (!w) continue;
        if (!sameBlocks(got[i]!.blocks, w.blocks)) verdict = loose(got[i]!) === loose(w) ? 'whitespace' : 'outline';
        else if (w.sel && !sameSel(got[i]!.sel, w.sel)) verdict = 'caret';
        if (verdict !== 'agree') detail = `  line ${t.steps[i]!.line}\n  expected:\n${draw(w).replace(/^/gm, '    ')}  logseq:\n${draw(got[i]!).replace(/^/gm, '    ')}`;
      }
    } catch (e) {
      verdict = 'error';
      detail = '  ' + String(e).slice(0, 200);
    }
    tally.set(`${group}: ${verdict}`, (tally.get(`${group}: ${verdict}`) ?? 0) + 1);
    if (verdict !== 'agree' || verbose) console.log(`${verdict.padEnd(10)} ${name}${t.pending ? ' (pending in ourus)' : ''}${detail ? '\n' + detail : ''}`);
  }
  console.log('\n' + [...tally].sort().map(([k, v]) => `${k} ${v}`).join(', '));
  if (skipped.size) console.log('skipped, by reason: ' + [...skipped].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
}

/** Adapts ourus's examples, replays them, and writes spec/logseq.md from Logseq's results. */
async function recordLogseq(page: Page, tests: SpecTest[]): Promise<void> {
  const seen = new Set<string>();
  const adapted: Adapted[] = [];
  const skipped = new Map<string, number>();
  const skip = (why: string) => skipped.set(why, (skipped.get(why) ?? 0) + 1);
  for (const t of tests) {
    const a = adapt(t);
    if (typeof a === 'string') {
      skip(a);
      continue;
    }
    const key = JSON.stringify([a.initial, a.clipboard, a.steps]);
    if (seen.has(key)) {
      skip('a duplicate once adapted');
      continue;
    }
    seen.add(key);
    adapted.push(a);
  }
  const out: string[] = [
    '---',
    'editor: logseq',
    '---',
    '',
    '# Logseq',
    '',
    "Logseq's behaviour, recorded from its web demo by `npm run test:logseq -- --record`: each example is",
    "one of ourus's spec examples adapted to what Logseq can hold (`test/logseq/adapt.ts`), and every",
    "expected buffer is what Logseq did. Not ourus's contract (`npm test` skips this file);",
    '`npm run test:logseq` checks that Logseq still behaves this way. Regenerate rather than edit.',
    '',
  ];
  let n = 0;
  for (const a of adapted) {
    let got: Outline[];
    try {
      got = await replay(page, a.initial, a.steps, a.clipboard ?? '');
    } catch {
      skip('failed in Logseq');
      continue;
    }
    n++;
    out.push(`## ${a.source}`, '');
    if (a.clipboard !== null) out.push(fence('clipboard', drawText(a.clipboard)), '');
    out.push(fence('buffer', draw(a.initial)), '');
    a.steps.forEach((s, i) => out.push(`> ${s.join(' ')}`, '', fence('buffer', draw(got[i]!)), ''));
    if (verbose) console.log('recorded', a.source);
  }
  writeFileSync(new URL(OUTPUT, specDir), out.join('\n'));
  console.log(`recorded ${n} examples into spec/${OUTPUT}`);
  console.log('not adapted, by reason: ' + [...skipped].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
}

/** A fenced block whose fence is longer than any backtick run inside. */
function fence(kind: string, body: string): string {
  const longest = Math.max(2, ...(body.match(/`+/g) ?? []).map((r) => r.length));
  const f = '`'.repeat(longest + 1);
  return `${f}${kind}\n${body.replace(/\n$/, '')}\n${f}`;
}

// ------------------------------------------------------------------ main

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium' });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForFunction(() => (window as any).logseq?.api?.create_page, null, { timeout: 90000 });
await page.waitForTimeout(3000);
// warm-up: the first edit after the app loads is unreliable, so make one and throw it away
await replay(page, { blocks: [{ depth: 0, text: 'warm' }, { depth: 0, text: '' }], sel: { block: 1, anchor: 0, head: 0 } }, [['moveUp']], '');
await page.waitForTimeout(1000);

const files = readdirSync(specDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
const all = files.flatMap((f) => readSpec(f, readFileSync(new URL(f, specDir), 'utf8')));
const selected = all.filter((t) => !filter || `${t.file} › ${t.name}`.includes(filter));
if (record) await recordLogseq(page, selected.filter((t) => (t.options.editor ?? 'ourus') === 'ourus'));
else await check(page, selected);
await browser.close();
