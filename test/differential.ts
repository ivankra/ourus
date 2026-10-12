// Differential run: every command at every line of generated documents, in two copies of the
// source, and a report of where the outcomes differ, grouped, with examples. By default the old
// copy is the last commit's `src/` (extracted with `git archive`), so a run says what the working
// tree changes. Not a gate: a change shows up here, and each group needs a judgment.
//
//   node test/differential.ts                 # HEAD against the working tree
//   node test/differential.ts <old> [<new>]   # two directories that each hold a `src/`
//   DIFF_DOCS=3000 DIFF_EXAMPLES=8 node test/differential.ts

import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const here = resolve(import.meta.dirname, '..');
const [oldArg, newArg] = process.argv.slice(2);

/** A directory holding the last commit's `src/`. */
function headSource(): string {
  const dir = mkdtempSync(join(tmpdir(), 'ourus-head-'));
  const archive = execFileSync('git', ['archive', 'HEAD', 'src'], { cwd: here });
  execFileSync('tar', ['-x', '-C', dir], { input: archive });
  return dir;
}

const oldRoot = oldArg ? resolve(oldArg) : headSource();
const newRoot = newArg ? resolve(newArg) : here;

const load = async (root: string) => ({
  Doc: (await import(join(root, 'src/doc.ts'))).Doc,
  execute: (await import(join(root, 'src/commands.ts'))).execute,
});
const before = await load(oldRoot);
const after = await load(newRoot);

// a small deterministic generator, so two runs see the same documents
let seed = 11;
const random = (n: number): number => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return (seed >>> 8) % n;
};
const blocks = ['p', 'p', 'two\nlines', '- i', '- i', '  - c', '    - g', '- [ ] t', '# H', '## S', 'S\n---', '```\nx\n```', '> q', '> - q', '1. n', '2. m', '- '];
const commands = ['formatIndent', 'formatOutdent', 'moveUp', 'moveDown', 'insertParagraph', 'insertLineBreak', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'insertFromPaste'];
const pastes = ['x', '- a\n- b', '> q', '```\nc\n```'];
const documents = Number(process.env.DIFF_DOCS ?? 1500);
const examples = Number(process.env.DIFF_EXAMPLES ?? 3);

const groups = new Map<string, { count: number; examples: string[] }>();
let runs = 0;
const outcome = (r: { status: string; reason?: string; doc?: { text: string } }): string =>
  r.status === 'applied' ? `applied:${r.doc!.text}` : `${r.status} ${r.reason ?? ''}`;
const label = (r: { status: string; reason?: string }): string => `${r.status}${r.reason ? ' ' + r.reason : ''}`;
const drawn = (text: string, pos: number): string => JSON.stringify(text.slice(0, pos) + '┃' + text.slice(pos));

for (let d = 0; d < documents; d++) {
  const count = 2 + random(6);
  let text = '';
  for (let k = 0; k < count; k++) {
    text += blocks[random(blocks.length)]!.replace(/(p|i|c|g|t|H|S|q|n|m)$/m, (x) => x + k) + '\n' + '\n'.repeat(random(3) === 0 ? 1 + random(2) : 0);
  }
  const oldDoc = before.Doc.parse(text);
  const newDoc = after.Doc.parse(text);
  for (const line of oldDoc.lines) {
    if (line.blank) continue;
    for (const pos of new Set([line.from, line.to, line.contentFrom, Math.min(line.to, line.contentFrom + 1)])) {
      for (const type of commands) {
        const command = type === 'insertFromPaste' ? { type, text: pastes[random(pastes.length)] } : { type };
        const selection = { anchor: pos, head: pos };
        const a = before.execute(oldDoc, command, selection);
        const b = after.execute(newDoc, command, selection);
        runs++;
        if (outcome(a) === outcome(b)) continue;
        const key = `${type}: ${label(a)} → ${label(b)}`;
        const group = groups.get(key) ?? { count: 0, examples: [] };
        group.count++;
        if (group.examples.length < examples) {
          const result = b.status === 'applied' ? ` → ${JSON.stringify(b.doc.text)}` : b.detail ? ` (${String(b.detail).slice(0, 120)})` : '';
          group.examples.push(`${drawn(text, pos)}${result}${a.status === 'applied' ? ` was ${JSON.stringify(a.doc.text)}` : ''}`);
        }
        groups.set(key, group);
      }
    }
  }
}

console.log(`${runs} command runs on ${documents} documents: ${oldRoot} → ${newRoot}`);
const sorted = [...groups].sort(([x, gx], [y, gy]) => Number(y.includes('→ rejected')) - Number(x.includes('→ rejected')) || gy.count - gx.count);
for (const [key, group] of sorted) {
  console.log(`${String(group.count).padStart(6)} ${key}`);
  for (const example of group.examples) console.log(`         ${example}`);
}
if (groups.size === 0) console.log('no differences');
