// Triage of kept session cases (`test/bugs-untriaged.json`): each replayed to its failing step, that
// step made one command on the note as it stood, with its marks and selection (a paste's clipboard),
// and the note made smaller a line at a time while the same failure holds. Prints, per case, the
// reduced step as `executeOnText(…)` arguments and, for a write failure, the text the writer wrote.
//
//   node test/triage.ts                 # every session case
//   node test/triage.ts <id> <id> …     # some
//   node test/triage.ts --json          # one JSON line a case, for scripts
//
// The text written is read off `OurusDraft.done` by a global probe (`__triageWritten`), set only here.

import { OurusDoc, OurusView, OurusFailed, OurusSuccess, executeCommand, type OurusCommand } from '../src/index.ts';
import { playActions, type PlayedState } from './lib/action-player.ts';
import { lostMarks } from './lib/report-checks.ts';
import { writeFailedKind } from './lib/report-baselines.ts';
import { caseId, readUntriaged } from './lib/untriaged.ts';

interface Step {
  readonly text: string;
  readonly placeholders: readonly number[];
  readonly auto: readonly number[];
  readonly anchor: number;
  readonly head: number;
  readonly clipboard: Record<string, string>;
}

/** What `action` on `step` fails with, as the session report names it (a write failure, or marks lost), or null. */
function failure(step: Step, config: Record<string, unknown>, action: string): string | null {
  let doc: OurusDoc;
  try {
    doc = OurusDoc.parse(step.text, { config, marks: { placeholders: [...step.placeholders], auto: [...step.auto] } });
  } catch {
    return null;
  }
  const state: PlayedState = { view: OurusView.of(doc, { selection: { anchor: step.anchor, head: step.head } }), clipboard: step.clipboard };
  let played: PlayedState;
  try {
    played = playActions(state, [action]);
  } catch (e) {
    return `${action} threw: ${(e as Error).message.split('\n')[0]!.slice(0, 80)}`;
  }
  const last = played.last;
  if (last instanceof OurusFailed) return `${action}: ${writeFailedKind(last)}`;
  if (last instanceof OurusSuccess) {
    const lost = lostMarks(state.view, last);
    if (lost.length) return `${action}: ${lost[0]}`;
  }
  return null;
}

/** `step` without line `k` (its marks and selection moved with the text after it; null where the selection is on it). */
function withoutLine(step: Step, k: number): Step | null {
  const lines = step.text.split('\n');
  if (lines.length < 2) return null;
  let from = 0;
  for (let i = 0; i < k; i++) from += lines[i]!.length + 1;
  const to = from + lines[k]!.length + 1;
  if (to > step.text.length + 1) return null;
  const end = Math.min(to, step.text.length);
  if (end <= from) return null;
  const inside = (p: number): boolean => p >= from && p < end;
  if (inside(step.anchor) || inside(step.head)) return null;
  const move = (p: number): number => (p >= end ? p - (end - from) : p);
  return {
    text: step.text.slice(0, from) + step.text.slice(end),
    placeholders: step.placeholders.filter((p) => !inside(p)).map(move),
    auto: step.auto.filter((p) => !inside(p)).map(move),
    anchor: move(step.anchor),
    head: move(step.head),
    clipboard: step.clipboard,
  };
}

/** `step` made smaller a line at a time while `action` fails the same way. */
function reduce(step: Step, config: Record<string, unknown>, action: string, kind: string): Step {
  let current = step;
  for (let changed = true; changed; ) {
    changed = false;
    const n = current.text.split('\n').length;
    for (let k = n - 1; k >= 0; k--) {
      const smaller = withoutLine(current, k);
      if (smaller && failure(smaller, config, action) === kind) {
        current = smaller;
        changed = true;
      }
    }
  }
  return current;
}

/** The command `action` is, as `executeOnText` takes it. */
function commandOf(action: string, clipboard: Record<string, string>): OurusCommand {
  if (action.startsWith('"')) return { type: 'insertText', text: action.slice(1, -1) };
  if (action === 'paste') return { type: 'paste', clipboard };
  if (action === 'pastePlain') return { type: 'pastePlain', text: clipboard['text/plain'] ?? '' };
  return { type: action } as OurusCommand;
}

/** What the writer wrote for the reduced step, where it failed to write. */
function written(step: Step, config: Record<string, unknown>, action: string): string | null {
  const g = globalThis as { __triageWritten?: string | null };
  g.__triageWritten = null;
  try {
    const doc = OurusDoc.parse(step.text, { config, marks: { placeholders: [...step.placeholders], auto: [...step.auto] } });
    executeCommand(OurusView.of(doc, { selection: { anchor: step.anchor, head: step.head } }), commandOf(action, step.clipboard));
  } catch {
    // (a throw is its own report)
  }
  const out = g.__triageWritten ?? null;
  delete g.__triageWritten;
  return out;
}

const args = process.argv.slice(2);
const json = args.includes('--json');
const ids = new Set(args.filter((a) => !a.startsWith('--')));
for (const c of readUntriaged()) {
  if (c.check !== 'session') continue;
  const id = caseId(c);
  if (ids.size && !ids.has(id)) continue;
  const config = c.config;
  const doc = OurusDoc.parse(c.text, { config });
  let state: PlayedState = { view: OurusView.of(doc, { selection: c.caret }), clipboard: {} };
  let found: { step: Step; action: string; kind: string } | null = null;
  for (const action of c.actions) {
    const view = state.view;
    const step: Step = { text: view.doc.text, placeholders: view.doc.marks.placeholders, auto: view.doc.marks.auto, anchor: view.selection.anchor, head: view.selection.head, clipboard: { ...state.clipboard } };
    let next: PlayedState;
    try {
      next = playActions(state, [action]);
    } catch {
      break;
    }
    const last = next.last;
    const kind = last instanceof OurusFailed ? `${action}: ${writeFailedKind(last)}` : last instanceof OurusSuccess ? (lostMarks(state.view, last).map((k) => `${action}: ${k}`)[0] ?? null) : null;
    if (kind === c.group) {
      found = { step, action, kind };
      break;
    }
    state = next;
  }
  if (!found) {
    console.log(json ? JSON.stringify({ id, group: c.group, passes: true }) : `${id} ${c.group}: passes (no step fails so)`);
    continue;
  }
  const small = reduce(found.step, config, found.action, found.kind);
  const start = small.anchor === small.head ? { caret: small.anchor } : { anchor: small.anchor, head: small.head };
  const options = { ...start, config, ...(small.placeholders.length && { placeholders: small.placeholders }), ...(small.auto.length && { auto: small.auto }) };
  const out = { id, group: c.group, kind: found.kind, text: small.text, command: commandOf(found.action, small.clipboard), options, written: found.kind.includes('write-failed') ? written(small, config, found.action) : null };
  if (json) console.log(JSON.stringify(out));
  else {
    console.log(`${id} ${found.kind}`);
    console.log(`  executeOnText(${JSON.stringify(out.text)}, ${JSON.stringify(out.command)}, ${JSON.stringify(out.options)})`);
    if (out.written !== null) console.log(`  written ${JSON.stringify(out.written)}`);
  }
}
