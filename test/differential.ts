// Differential run: every command at every line of generated documents, in two copies of the
// source, and a report of where the outcomes differ, grouped, with examples. By default the old
// copy is the last commit's `src/` (extracted with `git archive`), so a run says what the working
// tree changes. For a refactoring the report must be empty; for a behaviour change each group needs
// a judgment.
//
// An outcome is everything a host sees: the status and reason, and for an applied command the
// changes themselves, the text, the selection, the outline's node ids and the placeholders; what settling the placeholders
// then does (with the caret where the command left it, and moved to the start); and a short host
// lifecycle after it: typing at the caret, settling, and undoing back to the text before the
// command with its placeholders, as the player and the CM6 demo do.
// Documents are read in every flavor and with every config option; carets and selections both.
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

interface Snapshot {
  readonly text: string;
  readonly placeholders: readonly number[];
  readonly nodes: readonly { readonly id: number; readonly kind: string; readonly startLine: number }[];
  readonly lines: readonly { readonly from: number; readonly to: number; readonly contentFrom: number; readonly blank: boolean }[];
}
interface Core {
  parse(text: string, config: Record<string, unknown>): Snapshot;
  execute(doc: Snapshot, command: { type: string; text?: string }, selection: { anchor: number; head: number }): any;
  settle(doc: Snapshot, caret: number): { changes: unknown[]; doc: Snapshot } | null;
  /** A host's edit (typing, undo), with the caret it leaves, or the whole text replaced. */
  edit(doc: Snapshot, changes: { from: number; to: number; insert: string }[], params: Record<string, unknown>): Snapshot;
  replace(doc: Snapshot, text: string, params: Record<string, unknown>): Snapshot;
}

/** The core of a copy, through its package entry, whatever its API's names are at that point. */
async function load(root: string): Promise<Core> {
  const api = await import(join(root, 'src/index.ts'));
  const State = api.OutlineState ?? api.OutlineDoc;
  const execute = api.executeCommand ?? api.execute;
  const settle = api.settlePlaceholders ?? api.settle;
  return {
    parse: (text, config) => State.parse(text, { config }),
    execute: (doc, command, selection) => {
      const result = execute(doc, command, selection);
      return result.status === 'applied' ? { ...result, doc: result.state ?? result.doc } : result;
    },
    edit: (doc: any, changes, params) => (doc.update ?? doc.apply).call(doc, changes, params),
    replace: (doc: any, text, params) => doc.replace(text, params),
    settle: (doc, caret) => {
      const settled = settle(doc, caret);
      return settled && { changes: settled.changes, doc: settled.state ?? settled.doc };
    },
  };
}
const before = await load(oldRoot);
const after = await load(newRoot);

// a small deterministic generator, so two runs see the same documents
let seed = 11;
const random = (n: number): number => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return (seed >>> 8) % n;
};
const blocks = [
  'p', 'p', 'two\nlines', '- i', '- i', '  - c', '    - g', '- [ ] t', '- [x] t', '# H', '## S', 'S\n---', '```\nx\n```', '> q', '> - q', '1. n', '2. m', '- ',
  '> [!note] q', '| a | b |\n|---|---|', '$$\nm\n$$', '%%\nm\n%%', '- [[w]] #t',
  // text that reads as something else at a line's start, for splits, joins and pastes to escape
  'p - x', '- i 1. x', 'p # h', '# H - x', 'p > q', 'p\n[r]: /u', '- i ``` c', 'p ---', 'p 2) x',
];
const commands = ['indent', 'outdent', 'moveBlockUp', 'moveBlockDown', 'enter', 'shiftEnter', 'deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'pasteStructured', 'pastePlain', 'deleteSubtree', 'duplicateNode'];
const pastes = ['x', '- a\n- b', '> q', '```\nc\n```', 'one\ntwo', '1. a\n2. b\n'];
/** Every flavor with the defaults, then every other value of every option (CommonMark), one at a time. */
const configs: Record<string, unknown>[] = [
  { flavor: 'commonmark' }, { flavor: 'gfm' }, { flavor: 'obsidian' },
  { outdent: 'logical' }, { bullet: '*' }, { enterOnEmptyItem: 'outdent' }, { handleFenceContents: false },
  { headingEditing: 'block' }, { taskEditing: 'checkbox' }, { taskEditing: 'block' }, { pasteMidText: 'split' }, { deleteAtGap: 'gap' },
];
const documents = Number(process.env.DIFF_DOCS ?? 1500);
const examples = Number(process.env.DIFF_EXAMPLES ?? 3);

const groups = new Map<string, { count: number; examples: string[] }>();
let runs = 0;
const label = (r: { status: string; reason?: string }): string => `${r.status}${r.reason ? ' ' + r.reason : ''}`;
const drawn = (text: string, sel: { anchor: number; head: number }): string => {
  const [from, to] = [Math.min(sel.anchor, sel.head), Math.max(sel.anchor, sel.head)];
  return JSON.stringify(from === to ? text.slice(0, from) + '┃' + text.slice(from) : text.slice(0, from) + '«' + text.slice(from, to) + '»' + text.slice(to));
};
/** What a host sees of a snapshot: text, placeholders, and the ids of the outline's nodes. */
const seen = (doc: Snapshot): string => JSON.stringify([doc.text, doc.placeholders, doc.nodes.map((n) => `${n.kind}@${n.startLine}#${n.id}`)]);
const outcome = (core: Core, start: Snapshot, r: any): string => {
  if (r.status !== 'applied') return label(r);
  const settledHere = core.settle(r.doc, r.selection.head);
  const settledAway = core.settle(r.doc, 0);
  // the host's lifecycle: type at the caret, leave, then undo to before the command
  const caret = r.selection.head;
  const typed = core.edit(r.doc, [{ from: caret, to: caret, insert: 'x' }], { caret: caret + 1 });
  const left = core.settle(typed, 0)?.doc ?? typed;
  const undone = core.replace(left, start.text, { drop: [...left.placeholders], placeholders: start.placeholders });
  return JSON.stringify([label(r), seen(r.doc), r.selection, r.changes, settledHere && [settledHere.changes, seen(settledHere.doc)], settledAway && [settledAway.changes, seen(settledAway.doc)], seen(typed), seen(left), seen(undone)]);
};
/** Where two outcomes first differ, for the report. */
const aspect = (a: string, b: string): string => {
  if (!a.startsWith('[') || !b.startsWith('[')) return '';
  const [x, y] = [JSON.parse(a), JSON.parse(b)];
  const names = ['status', 'snapshot', 'selection', 'changes', 'settled at the caret', 'settled elsewhere', 'typed at the caret', 'typed, then left', 'undone'];
  const i = names.findIndex((_, k) => JSON.stringify(x[k]) !== JSON.stringify(y[k]));
  return i < 0 ? '' : ` (${names[i]})`;
};

for (let d = 0; d < documents; d++) {
  const count = 2 + random(6);
  let text = '';
  for (let k = 0; k < count; k++) {
    text += blocks[random(blocks.length)]!.replace(/(p|i|c|g|t|H|S|q|n|m)$/m, (x) => x + k) + '\n' + '\n'.repeat(random(3) === 0 ? 1 + random(2) : 0);
  }
  const config = configs[d % configs.length]!;
  const oldDoc = before.parse(text, config);
  const newDoc = after.parse(text, config);
  const lines = oldDoc.lines;
  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    const line = lines[lineNo]!;
    if (line.blank) continue;
    // carets at the line's edges, its text start, and after the first space in its text (mid-text)
    const space = oldDoc.text.indexOf(' ', line.contentFrom + 1);
    const mid = space > 0 && space < line.to ? space + 1 : line.contentFrom;
    const selections = [...new Set([line.from, line.to, line.contentFrom, Math.min(line.to, line.contentFrom + 1), mid])].map((pos) => ({ anchor: pos, head: pos }));
    // a selection inside the line's text, and one reaching into the next line
    if (line.to > line.contentFrom + 1) selections.push({ anchor: line.contentFrom + 1, head: line.to });
    const next = lines[lineNo + 1];
    if (next && random(2) === 0) selections.push({ anchor: line.contentFrom, head: Math.min(next.to, next.contentFrom + 1) });
    for (const selection of selections) {
      for (const type of commands) {
        const command = type === 'pasteStructured' || type === 'pastePlain' ? { type, text: pastes[random(pastes.length)] } : { type };
        const a = outcome(before, oldDoc, before.execute(oldDoc, command, selection));
        const b = outcome(after, newDoc, after.execute(newDoc, command, selection));
        runs++;
        if (a === b) continue;
        const short = (o: string): string => (o.startsWith('[') ? JSON.parse(o)[0] : o);
        const key = `${type} [${JSON.stringify(config)}]: ${short(a)} → ${short(b)}${aspect(a, b)}`;
        const group = groups.get(key) ?? { count: 0, examples: [] };
        group.count++;
        if (group.examples.length < examples) group.examples.push(`${drawn(text, selection)}\n           was ${a.slice(0, 300)}\n           now ${b.slice(0, 300)}`);
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
process.exitCode = groups.size === 0 ? 0 : 1;
