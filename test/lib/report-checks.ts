// The checks of the reports over generated notes (`sessions.ts`, `sweep.ts`, `conserve.ts`), one case
// at a time: a report runs them over its corpus, and `bugs.ts` replays the cases kept untriaged
// (`untriaged.ts`) through the same ones, so a case is judged one way. Each gives the groups the case
// fails in (`kind`, the report's group name), with what an example adds (`detail`); a throw from
// `src/` propagates, always a failure.

import { executeCommand, OurusFailed, OurusRejected, OurusSuccess, type OurusCommand } from '../../src/commands/index.ts';
import { textStart } from '../../src/commands/util.ts';
import { OurusDoc, type OurusNode } from '../../src/doc/index.ts';
import { MdFlavor, MdHtmlParser, MdTree } from '../../src/index.ts';
import { applyChanges, mapPos } from '../../src/text/index.ts';
import { OurusView } from '../../src/view/index.ts';
import { playActions, type PlayedState } from './action-player.ts';
import { allNodes } from './drawn-states.ts';
import { writeFailedKind } from './report-baselines.ts';
import type { Clipboard } from './spec-reader.ts';
import { assertViewHolds } from './spec-runner.ts';

/** A group a case fails in, and what an example of it shows past the case itself. */
export interface Found {
  readonly kind: string;
  readonly detail?: string;
}

// ---------------------------------------------------------------- sessions

/** A session's failure: its group, and the step it shows at. */
export interface SessionFound extends Found {
  readonly at: number;
}

/** The actions a session draws from, as often as a user takes them. */
export const SESSION_ACTIONS: readonly (readonly [string, number])[] = [
  ['"x"', 6], ['" "', 3], ['"- "', 1], ['"# "', 1], ['"`"', 1],
  ['enter', 8], ['shiftEnter', 2], ['deleteContentBackward', 6], ['deleteContentForward', 2], ['deleteSoftLineBackward', 1],
  ['indent', 4], ['outdent', 4], ['moveSubtreeUp', 3], ['moveSubtreeDown', 3],
  ['cut', 2], ['copy', 1], ['paste', 4], ['pastePlain', 1], ['duplicateSubtree', 2], ['deleteSubtree', 2],
  ['selectNode', 2], ['expandSelection', 1], ['fold', 1], ['unfold', 1], ['toggleFold', 1], ['zoomIn', 1], ['zoomOut', 1],
  ['undo', 3], ['redo', 1],
  ['cursorLineUp', 5], ['cursorLineDown', 6], ['cursorCharLeft', 2], ['cursorCharRight', 2], ['cursorLineBoundaryBackward', 2], ['cursorLineBoundaryForward', 2],
  ['selectCharRight', 1], ['selectLineDown', 1],
];
/** `SESSION_ACTIONS` each as often as its weight: a session's actions are drawn from it uniformly. */
export function sessionWheel(): string[] {
  return SESSION_ACTIONS.flatMap(([a, w]) => Array<string>(w).fill(a));
}

const motion = (a: string): boolean => /^(cursor|select)(?!Node)/.test(a) && a !== 'selectNode';

/**
 * `actions` played from `text` (its config `config`) with the caret at `caret`, through the spec's
 * player; after every step: a throw, a write failure, the selection off the text, the view's rules;
 * at the end, undoing every step gives the note back. A throw ends the session, as a `… threw` kind.
 */
export function sessionFailures(text: string, config: Record<string, unknown>, caret: number, actions: readonly string[]): SessionFound[] {
  const found: SessionFound[] = [];
  const doc = OurusDoc.parse(text, { config });
  let played: PlayedState = { view: OurusView.of(doc, { selection: caret }), clipboard: {} };
  for (let k = 0; k < actions.length; k++) {
    const action = actions[k]!;
    const prior = played.view;
    const hidden = JSON.stringify(prior.visibleSelection(played.view.selection)) !== JSON.stringify(played.view.selection);
    try {
      played = playActions(played, [action]);
    } catch (e) {
      found.push({ kind: `${action} threw: ${(e as Error).message.split('\n')[0]!.slice(0, 80)}`, at: k });
      return found;
    }
    const last = played.last;
    if (last instanceof OurusFailed) {
      found.push({ kind: `${action}: ${writeFailedKind(last)}`, at: k });
      continue;
    }
    const after = played.view.doc.text;
    const { anchor, head } = played.view.selection;
    if (anchor < 0 || head < 0 || anchor > after.length || head > after.length) found.push({ kind: `${action}: selection off the text`, at: k });
    // (what only the host does, a motion and a history step, can leave the caret in a hidden line: not checked, nor a command that starts from one)
    if (!hidden && last instanceof OurusSuccess && !motion(action) && action !== 'undo' && action !== 'redo') {
      try {
        assertViewHolds(prior, played, `step ${k + 1} ${action}`);
      } catch (e) {
        found.push({ kind: `${action}: view invariant (${(e as Error).message.split('\n')[0]!.replace(/^step \d+ \S+: /, '').slice(0, 60)})`, at: k });
      }
    }
    if (last instanceof OurusSuccess) for (const kind of lostMarks(prior, last)) found.push({ kind: `${action}: ${kind}`, at: k });
  }
  // undo everything: the note comes back
  let back = played;
  try {
    for (let n = 0; n < actions.length + 5 && (back.undone?.length ?? 0) > 0; n++) back = playActions(back, ['undo']);
    // (an undo that leaves steps behind is a failure of its own, not a reason to skip the comparison)
    if ((back.undone?.length ?? 0) > 0) found.push({ kind: 'undo all: history not exhausted', at: actions.length - 1 });
    else if (back.view.doc.text.replace(/[ \t]+$/gm, '') !== text.replace(/[ \t]+$/gm, '')) found.push({ kind: 'undo all: not the note back', at: actions.length - 1 });
  } catch (e) {
    found.push({ kind: `undo all threw: ${(e as Error).message.split('\n')[0]!.slice(0, 80)}`, at: actions.length - 1 });
  }
  return found;
}

/**
 * The marks of `view`'s document a command's result lost on lines it didn't change: a placeholder or
 * an auto mark on a line no change touches and the selection wasn't on, each where the changes carry it
 * in the result (an auto mark, a character, past an insertion at it). By lines: a writer may keep a
 * changed line's characters (an empty line's spaces under the marker it makes there); and the
 * selection's: a command can take out a node only a placeholder held, changing no text. (Settling and
 * history are steps of their own: a command's result is the command's alone. Where its changes aren't
 * from `view`'s document, a step the host took first, nothing is compared.)
 */
function lostMarks(view: OurusView, result: OurusSuccess): string[] {
  const before = view.doc;
  const changes = result.changes;
  const after = result.view.doc.marks;
  if (applyChanges(before.text, changes) !== result.view.doc.text) return [];
  const lost = new Set<string>();
  const line = (pos: number): number => before.lineAt(pos).index;
  const { anchor, head } = view.selection;
  const touched = [...changes.map((c) => [line(c.from), line(c.to ?? c.from)] as const), [line(Math.min(anchor, head)), line(Math.max(anchor, head))] as const];
  const reached = (pos: number): boolean => touched.some(([a, b]) => line(pos) >= a && line(pos) <= b);
  const placeholders = new Set(after.placeholders);
  for (const pos of before.marks.placeholders) if (!reached(pos) && !placeholders.has(mapPos(changes, pos))) lost.add('placeholder lost on a line it didn\'t change');
  const auto = new Set(after.auto);
  for (const pos of before.marks.auto) if (!reached(pos) && !auto.has(mapPos(changes, pos, 1))) lost.add('auto mark lost on a line it didn\'t change');
  return [...lost];
}

/** The fewest of `actions` (dropping one at a time) that still fail in `kind`. */
export function shrinkSession(text: string, config: Record<string, unknown>, caret: number, actions: readonly string[], kind: string): string[] {
  let cur = [...actions];
  for (let changed = true; changed; ) {
    changed = false;
    for (let k = 0; k < cur.length; k++) {
      const less = [...cur.slice(0, k), ...cur.slice(k + 1)];
      if (sessionFailures(text, config, caret, less).some((f) => f.kind === kind)) {
        cur = less;
        changed = true;
        break;
      }
    }
  }
  return cur;
}

// ---------------------------------------------------------------- sweep

/** A command's name in a group: `insertText "x"` for typing. */
export function commandLabel(command: OurusCommand): string {
  return command.type === 'insertText' ? `insertText ${JSON.stringify(command.text)}` : command.type;
}

const endings = (s: string): string => (/\r\n/.test(s) ? 'crlf' : '') + (/(^|[^\r])\n/.test(s) ? 'lf' : '');

/** `command` at caret `pos` of `view` (of `text`): what no command may do (a write failure, the selection off the text, changes that don't give it, line endings or a final newline lost). */
export function commandFailures(view: OurusView, pos: number, command: OurusCommand): Found[] {
  const text = view.doc.text;
  const label = commandLabel(command);
  const found: Found[] = [];
  const result = executeCommand(view.withSelection(pos), command);
  if (result instanceof OurusFailed) found.push({ kind: `${label}: ${writeFailedKind(result)}` });
  if (!(result instanceof OurusSuccess)) return found;
  const after = result.view.doc.text;
  const { anchor, head } = result.view.selection;
  if (anchor < 0 || head < 0 || anchor > after.length || head > after.length) found.push({ kind: `${label}: selection off the text` });
  if (command.type !== 'cut' && applyChanges(text, result.changes) !== after) found.push({ kind: `${label}: changes don't give the text` });
  const before = endings(text);
  if (before && endings(after) !== before && after.length) found.push({ kind: `${label}: line endings changed`, detail: `→ ${JSON.stringify(after)}` });
  if (text.endsWith('\n') && after && !after.endsWith('\n')) found.push({ kind: `${label}: final newline lost`, detail: `→ ${JSON.stringify(after)}` });
  return found;
}

/** Where a node's copy and cut are played: the start of its text, or its first text's below it, or where it starts. */
export function nodeCaret(doc: OurusDoc, node: OurusNode): number {
  let held = node;
  while (!doc.textOf(held) && held.children.length) held = held.children[0]!;
  const text = doc.textOf(held);
  return text ? doc.posOf(held, textStart(text), 1) : doc.rangeOf(node).from;
}

const kindsOf = (n: OurusNode): string[] => [n.kind, ...n.children.flatMap(kindsOf)];
/** The texts of a document's code, math and table blocks (its atoms), in no order. */
const atomTexts = (d: OurusDoc): string => JSON.stringify(allNodes(d).filter((n) => n.kind === 'atom').map((n) => d.textOf(n)?.text ?? '').sort());

/** Node `node` of `view` copied (by its id) and pasted into an empty note: it comes back as the same blocks. */
export function copyPasteFailures(view: OurusView, node: OurusNode): Found[] {
  const doc = view.doc;
  const found: Found[] = [];
  // (the node by its id: a caret in its text may be in a child, whose copy is not the node's)
  const copied = executeCommand(view.withSelection(nodeCaret(doc, node)), { type: 'copy', nodes: [node.id] });
  if (copied instanceof OurusFailed) found.push({ kind: `copy: ${node.kind}: ${writeFailedKind(copied)}` });
  if (!(copied instanceof OurusSuccess) || !copied.clipboard) return found;
  const empty = OurusView.of(OurusDoc.parse('', { config: doc.config }));
  const pasted = executeCommand(empty.withSelection(0), { type: 'paste', clipboard: copied.clipboard });
  const clip = JSON.stringify(copied.clipboard['text/plain']);
  if (pasted instanceof OurusFailed) found.push({ kind: `copy→paste: ${node.kind}: paste ${writeFailedKind(pasted)}`, detail: clip });
  if (!(pasted instanceof OurusSuccess)) return found;
  const got = allNodes(pasted.view.doc).filter((n) => n.depth === 1).flatMap(kindsOf).join();
  if (got !== kindsOf(node).join()) found.push({ kind: `copy→paste: ${node.kind} comes back as other blocks`, detail: `${clip} → ${JSON.stringify(pasted.view.doc.text)}` });
  return found;
}

/**
 * Node `node` of `view` cut (by its id) and pasted at the caret the cut leaves: what must hold wherever
 * the paste lands (after the node the caret is on, the spec's, so an order or a parent can change):
 * every letter comes back, and every code, math and table block (an atom) keeps its text.
 */
export function cutPasteFailures(view: OurusView, node: OurusNode): Found[] {
  const doc = view.doc;
  const found: Found[] = [];
  const cut = executeCommand(view.withSelection(nodeCaret(doc, node)), { type: 'cut', nodes: [node.id] });
  if (cut instanceof OurusFailed) found.push({ kind: `cut: ${node.kind}: write-failed` });
  if (!(cut instanceof OurusSuccess) || !cut.clipboard) return found;
  const back = executeCommand(cut.view, { type: 'paste', clipboard: cut.clipboard });
  const left = `→ cut ${JSON.stringify(cut.view.doc.text)} @${cut.view.selection.head}`;
  if (back instanceof OurusFailed) found.push({ kind: `cut→paste: ${node.kind}: paste write-failed`, detail: left });
  if (!(back instanceof OurusSuccess)) return found;
  const after = `${left} → ${JSON.stringify(back.view.doc.text)}`;
  if (letters(back.view.doc.text) !== letters(doc.text)) found.push({ kind: `cut→paste: ${node.kind}: letters lost or doubled`, detail: after });
  if (atomTexts(back.view.doc) !== atomTexts(doc)) found.push({ kind: `cut→paste: ${node.kind}: a code, math or table block's text changed`, detail: after });
  return found;
}

// ---------------------------------------------------------------- conserve

/** The clipboards a paste must keep every letter of, and the note's. */
export const CLIPS: Readonly<Record<string, Clipboard>> = {
  word: { 'text/plain': 'word' },
  twolines: { 'text/plain': 'line one\nline two' },
  paragraphs: { 'text/plain': 'first para\n\nsecond para' },
  trailing: { 'text/plain': 'solo\n' },
  list: { 'text/plain': '- list one\n- list two' },
  nested: { 'text/plain': '- nest one\n  - nest two\n    - nest three\n- nest four' },
  ordered: { 'text/plain': '1. ord one\n2. ord two' },
  task: { 'text/plain': '- [ ] task one\n- [x] task two' },
  heading: { 'text/plain': '# head one\ntext under' },
  code: { 'text/plain': '```js\nlet code;\n```' },
  table: { 'text/plain': '| aa | bb |\n|---|---|\n| cc | dd |' },
  quote: { 'text/plain': '> quote one\n> quote two' },
  callout: { 'text/plain': '> [!note] call\n> body' },
  indented: { 'text/plain': '    indent one\n    indent two' },
  htmlList: { 'text/html': '<ul><li>hl one</li><li>hl two<ul><li>hl three</li></ul></li></ul>', 'text/plain': 'hl one\nhl two\nhl three' },
  htmlPara: { 'text/html': '<p>hp one</p><p>hp two</p>', 'text/plain': 'hp one\n\nhp two' },
  markdown: { 'text/markdown': '- md one\n  - md two', 'text/plain': '- md one\n  - md two' },
};

const letters = (s: string): string => [...s.replace(/[^\p{L}]/gu, '')].sort().join('');
/** The HTML with the differences that don't matter taken out; the text of a `<pre>` is kept as it is, to the space. */
const norm = (h: string): string =>
  h
    .split(/(<pre[\s\S]*?<\/pre>)/)
    .map((part, k) =>
      k % 2
        ? part
        : part
            .replace(/<!-- ourus -->/, '')
            .replace(/ title="[^"]*"/g, '')
            .replace(/<br \/>/g, ' ')
            .replace(/<\/?p>/g, '')
            .replace(/<section class="footnotes".*$/s, '')
            .replace(/<sup class="footnote-ref">.*?<\/sup>/g, '')
            .replace(/\s+/g, ' ')
            .replace(/> </g, '><')
            // (a tight list read back loose: the space its `<p>`'s line break leaves beside a block's tag)
            .replace(/ ?(<\/?(?:li|ul|ol|blockquote|pre|div|table|thead|tbody|tr|td|th|h[1-6]|hr)\b[^>]*>) ?/g, '$1'),
    )
    .join('')
    .trim();
const mdFlavor = (flavor: unknown): MdFlavor => (flavor === 'obsidian' ? MdFlavor.obsidian : flavor === 'commonmark' ? MdFlavor.commonmark : MdFlavor.gfm);

/** `text` rendered to HTML and read back: it renders to the same HTML again. */
export function htmlFailures(text: string, config: Record<string, unknown>): Found[] {
  const flavor = mdFlavor(config.flavor);
  const first = MdTree.parse(text, flavor).renderHtml();
  const back = MdHtmlParser.parse(first).markdown;
  return norm(MdTree.parse(back, flavor).renderHtml()) !== norm(first) ? [{ kind: 'html: renders differently after a round trip', detail: `→ ${JSON.stringify(back)}` }] : [];
}

/** Clipboard `name` pasted over `[from, to)` of `view`: every letter of the note left and of the clipboard kept. */
export function pasteFailures(view: OurusView, name: string, from: number, to: number): Found[] {
  const clip = CLIPS[name]!;
  const text = view.doc.text;
  // (a selection over text drops that text: the letters it holds don't count)
  const kept = text.slice(0, from) + text.slice(to);
  const result = executeCommand(view.withSelection({ anchor: from, head: to }), { type: 'paste', clipboard: clip });
  if (result instanceof OurusFailed) return [{ kind: `paste ${name}: ${writeFailedKind(result)}` }];
  if (result instanceof OurusRejected || !(result instanceof OurusSuccess)) return [];
  const after = result.view.doc.text;
  const { anchor, head } = result.view.selection;
  if (anchor < 0 || head < 0 || anchor > after.length || head > after.length) return [{ kind: `paste ${name}: selection off the text` }];
  if (letters(after) !== letters(kept + (clip['text/plain'] ?? ''))) return [{ kind: `paste ${name}: letters lost or doubled`, detail: `→ ${JSON.stringify(after)}` }];
  return [];
}
