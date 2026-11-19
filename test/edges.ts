#!/usr/bin/env node
// The boundary survey: every pair of block kinds, Delete at the end of the upper one against Backspace
// at the start of the lower one, each outcome named (a join, markup peeled, a refusal, the host's).
// Where the two keys' texts differ the boundary is asymmetric: deliberate (an exception listed in the
// review, dev/31-align.md) or a bug.
//
//   node test/edges.ts                  # the table, Markdown, every pair
//   node test/edges.ts --asymmetric     # only the pairs whose two keys differ
//   node test/edges.ts --matrix         # the grid: a row an upper kind, a column a lower one
//   node test/edges.ts --json           # the cells as data
//   node test/edges.ts --probes=FILE    # the asymmetric pairs as a probe file (node sxs/probe.ts all FILE)
//   node test/edges.ts --quotes=atom    # under an option (any option, as the spec's config block)

import { writeFileSync } from 'node:fs';
import { OurusDeferred, OurusFailed, OurusRejected, OurusSuccess } from '../src/commands/index.ts';
import { executeOnText } from './lib/index.ts';

/** A block kind as written, and where its text starts and ends (offsets into `text`). */
interface Kind {
  readonly name: string;
  readonly text: string;
  readonly start: number;
  readonly end: number;
  /** A list kind: written right after another of its list, no blank line between. */
  readonly list?: string;
}

const kind = (name: string, text: string, startAt: string, list?: string, endAt?: string): Kind => ({
  name,
  text,
  start: text.indexOf(startAt),
  end: endAt ? text.indexOf(endAt) + endAt.length : text.length,
  ...(list && { list }),
});

export const KINDS: readonly Kind[] = [
  kind('paragraph', 'para', 'para'),
  kind('heading', '# Head', 'Head'),
  kind('setext heading', 'Title\n=====', 'Title', undefined, 'Title'),
  kind('item', '- item', 'item', '-'),
  kind('task', '- [ ] task', 'task', '-'),
  kind('ordered item', '1. one', 'one', '1.'),
  kind('quote', '> quote', 'quote'),
  kind('code', '```\ncode\n```', '```'),
  kind('table', '| a |\n|---|\n| 1 |', '| a |'),
  kind('rule', '***', '***'),
  kind('footnote', '[^1]: note', 'note'),
];

export interface Cell {
  readonly above: string;
  readonly below: string;
  readonly start: string;
  readonly delete: Outcome;
  readonly backspace: Outcome;
  readonly symmetric: boolean;
}

interface Outcome {
  readonly kind: 'join' | 'peel' | 'blank' | 'caret' | 'refused' | 'host' | 'failed' | 'other';
  readonly text?: string;
  readonly detail?: string;
}

/** `a` above `b`: a blank line between, but for two items of one list. */
function pair(a: Kind, b: Kind): { text: string; deleteAt: number; backspaceAt: number } {
  const sep = a.list && a.list === b.list ? '\n' : '\n\n';
  const text = `${a.text}${sep}${b.text}\n`;
  return { text, deleteAt: a.end, backspaceAt: a.text.length + sep.length + b.start };
}

const caretDraw = (text: string, at: number): string =>
  `${text.slice(0, at)}┃${text.slice(at)}`.replace(/\n$/, '').replace(/\n/g, '⏎');

function outcome(text: string, a: Kind, b: Kind, result: unknown): Outcome {
  if (result instanceof OurusRejected) return { kind: 'refused', detail: result.detail ?? result.reason };
  if (result instanceof OurusDeferred) return { kind: 'host', detail: result.reason };
  if (result instanceof OurusFailed) return { kind: 'failed', detail: result.detail };
  if (!(result instanceof OurusSuccess)) return { kind: 'other', detail: String(result) };
  const out = result.view.doc.text;
  const at = result.view.selection.head;
  const drawn = caretDraw(out, at);
  if (out === text) return { kind: 'caret', text: drawn };
  const upper = a.text.slice(0, a.end).split('\n').pop()!;
  const lower = b.text.slice(b.start).split('\n')[0]!;
  const before = out.slice(0, at);
  const after = out.slice(at);
  // the lower block's text right after the upper's, the caret between: a join
  if (before.endsWith(upper.slice(-3)) && after.startsWith(lower.replace(/^```.*/, ''))) {
    if (!before.endsWith('\n') && lower && after.startsWith(lower)) return { kind: 'join', text: drawn };
  }
  // one blank line fewer, nothing else: a blank line taken
  if (out.length === text.length - 1 && text.replace(/\n\n/, '\n') === out) return { kind: 'blank', text: drawn };
  // the lower block's markup gone, its text where it was
  const count = (t: string, of: string): number => t.split(of).length - 1;
  if (out.includes(lower) && count(out, b.text) < count(text, b.text) && out.length < text.length)
    return { kind: 'peel', text: drawn };
  return { kind: 'other', text: drawn };
}

export function survey(config: Record<string, unknown> = {}): Cell[] {
  const cells: Cell[] = [];
  for (const a of KINDS) {
    for (const b of KINDS) {
      const { text, deleteAt, backspaceAt } = pair(a, b);
      const del = executeOnText(text, { type: 'deleteContentForward' }, { caret: deleteAt, config });
      const back = executeOnText(text, { type: 'deleteContentBackward' }, { caret: backspaceAt, config });
      const d = outcome(text, a, b, del);
      const k = outcome(text, a, b, back);
      const textOf = (r: unknown): string | null => (r instanceof OurusSuccess ? r.view.doc.text : null);
      const symmetric =
        d.kind === k.kind &&
        (d.kind === 'refused' || d.kind === 'host' || d.kind === 'caret' || d.kind === 'failed'
          ? true
          : textOf(del) === textOf(back));
      cells.push({
        above: a.name,
        below: b.name,
        start: text.replace(/\n$/, '').replace(/\n/g, '⏎'),
        delete: d,
        backspace: k,
        symmetric,
      });
    }
  }
  return cells;
}

const show = (o: Outcome): string => {
  const what =
    o.kind === 'refused'
      ? `refused (${o.detail})`
      : o.kind === 'host'
        ? `host (${o.detail})`
        : o.kind === 'failed'
          ? `**fails to write**`
          : o.kind;
  return o.text !== undefined ? `${what}: \`${o.text}\`` : what;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const config: Record<string, unknown> = {};
  for (const a of args) {
    const m = /^--(\w+)=(.*)$/.exec(a);
    if (m && m[1] !== 'probes') config[m[1]!] = m[2];
  }
  const cells = survey(config);
  const shown = args.includes('--asymmetric') ? cells.filter((c) => !c.symmetric) : cells;
  const probes = args.find((a) => a.startsWith('--probes='))?.slice('--probes='.length);
  if (probes) {
    const block = (s: string): string => '```markdown\n' + s.replace(/⏎/g, '\n') + '\n```';
    const yaml =
      '```yaml\ntags: common' +
      Object.entries(config)
        .map(([k, v]) => `\n${k}: ${v}`)
        .join('') +
      '\n```';
    const out = cells
      .filter((c) => !c.symmetric)
      .flatMap((c, i) => {
        const a = KINDS.find((k) => k.name === c.above)!;
        const b = KINDS.find((k) => k.name === c.below)!;
        const { text, deleteAt, backspaceAt } = pair(a, b);
        const draw = (at: number): string => block(caretDraw(text, at));
        return [
          `## E${i + 1}d\n\n${c.above} / ${c.below}: Delete\n\n${yaml}\n\n${draw(deleteAt)}\n\n> deleteContentForward\n`,
          `## E${i + 1}b\n\n${c.above} / ${c.below}: Backspace\n\n${yaml}\n\n${draw(backspaceAt)}\n\n> deleteContentBackward\n`,
        ];
      });
    writeFileSync(probes, `# Boundary probes\n\n${out.join('\n')}`);
    console.log(`${out.length} probes written to ${probes}`);
  } else if (args.includes('--json')) console.log(JSON.stringify(shown, null, 1));
  else if (args.includes('--matrix')) {
    // a row an upper kind, a column a lower kind; a cell `Delete / Backspace`, bold where they differ
    const short: Record<Outcome['kind'], string> = {
      join: 'join',
      peel: 'peel',
      blank: 'blank line',
      caret: 'caret',
      refused: 'refuse',
      host: 'host',
      failed: 'FAIL',
      other: 'other',
    };
    const cellOf = (c: Cell): string => {
      const d = short[c.delete.kind];
      const b = short[c.backspace.kind];
      return c.symmetric ? (d === b ? d : `${d} / ${b}`) : `**${d} / ${b}**`;
    };
    console.log(`| above ↓ below → | ${KINDS.map((k) => k.name).join(' | ')} |`);
    console.log(`|---|${KINDS.map(() => '---').join('|')}|`);
    for (const a of KINDS)
      console.log(
        `| **${a.name}** | ${KINDS.map((b) => cellOf(cells.find((c) => c.above === a.name && c.below === b.name)!)).join(' | ')} |`,
      );
  } else {
    console.log(
      `${cells.length} pairs, ${cells.filter((c) => !c.symmetric).length} asymmetric${
        Object.keys(config).length
          ? ` (${Object.entries(config)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')})`
          : ''
      }\n`,
    );
    console.log("| Above | Below | Start | Delete at the upper's end | Backspace at the lower's start | Same |");
    console.log('|---|---|---|---|---|---|');
    for (const c of shown)
      console.log(
        `| ${c.above} | ${c.below} | \`${c.start}\` | ${show(c.delete)} | ${show(c.backspace)} | ${c.symmetric ? 'yes' : '**no**'} |`,
      );
  }
}
