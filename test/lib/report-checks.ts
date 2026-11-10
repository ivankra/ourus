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
export function lostMarks(view: OurusView, result: OurusSuccess): string[] {
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
  if (autoLost(before.text, before.marks.auto, before.marks.auto.filter((pos) => !reached(pos)), result.view.doc.text, after.auto, after.placeholders, changes, [anchor, head])) lost.add('auto mark lost on a line it didn\'t change');
  return [...lost];
}

/**
 * Whether a raised line's auto mark became the author's: by count, in each run of like lines in
 * `after` that an unchanged mark of `before` maps into. Which line of the run carries the mark is no
 * matter: the diff of identical lines is one of several, and ourus may keep its mark on another of
 * them, or take its own line out first, the author's kept. Lost where the run holds more of the
 * author's lines than the runs it came from did, and the lines the change made there. `marks`: the
 * marks of `beforeAuto` on lines no change touched.
 */
function autoLost(beforeText: string, beforeAuto: readonly number[], marks: readonly number[], afterText: string, afterAuto: readonly number[], afterHeld: readonly number[], changes: Parameters<typeof mapPos>[0], selection: readonly number[]): boolean {
  // (lines as alike past their trailing blanks: a blank line `` and `  `, a quote's `>` and `> `)
  const linesOf = (text: string): { starts: number[]; lines: string[] } => {
    const raw = text.split('\n');
    const starts: number[] = [];
    let at = 0;
    for (const l of raw) {
      starts.push(at);
      at += l.length + 1;
    }
    // (past a final line break, the empty piece `split` gives is no line: like no other, in no run)
    return { starts, lines: raw.map((l, k) => (k > 0 && k === raw.length - 1 && l === '' ? '\u0000end' : l.replace(/[ \t]+$/, ''))) };
  };
  const index = (starts: readonly number[], pos: number): number => {
    let k = 0;
    while (k + 1 < starts.length && starts[k + 1]! <= pos) k++;
    return k;
  };
  // the maximal run of lines equal to line `k`: [first, last]
  const run = (lines: readonly string[], k: number): [number, number] => {
    let a = k;
    let b = k;
    while (a > 0 && lines[a - 1] === lines[k]) a--;
    while (b + 1 < lines.length && lines[b + 1] === lines[k]) b++;
    return [a, b];
  };
  const was = linesOf(beforeText);
  const now = linesOf(afterText);
  // (a line a placeholder holds is an empty block's, the author's, none of a run of blank lines: a
  // raised line that became one, the line of the block Enter made there, is no mark lost)
  const held = new Set(afterHeld.map((pos) => index(now.starts, pos)));
  for (const k of held) now.lines[k] = `\u0000held ${k}`;
  const marked = (starts: readonly number[], auto: readonly number[], [a, b]: [number, number]): number => auto.filter((pos) => index(starts, pos) >= a && index(starts, pos) <= b).length;
  // (a line of `before` a change put text on, its first line's, a paste on the author's blank line,
  // is that text now: none of the run's; not one it joins to the next, which the diff of like lines
  // puts either way)
  // (the line the selection was on: text put in at the start of the next one, an item Enter makes
  // after a line, is a line of its own, the diff's of like lines either way)
  const selected = new Set(selection.map((pos) => index(was.starts, pos)));
  const filled = new Set(
    changes
      .filter((c) => /[^\s>]/.test((c.insert ?? '').split('\n')[0]!) && !beforeText.slice(c.from, c.to ?? c.from).includes('\n'))
      .map((c) => index(was.starts, c.from))
      .filter((k) => selected.has(k)),
  );
  // the runs of `before` the marks were in and the runs of `after` they map into, joined where a
  // mark links them: a run split in two by what a change put in it is still one
  const group = new Map<string, string>();
  const find = (key: string): string => {
    let k = key;
    while (group.get(k) !== undefined && group.get(k) !== k) k = group.get(k)!;
    return k;
  };
  const join = (x: string, y: string): void => {
    if (!group.has(x)) group.set(x, x);
    if (!group.has(y)) group.set(y, y);
    group.set(find(x), find(y));
  };
  for (const pos of marks) {
    const k = index(now.starts, mapPos(changes, pos, 1));
    if (held.has(k)) continue;
    // (a line the mark's no more like: the mark's line changed, which the run can't hold)
    if (now.lines[k] !== was.lines[index(was.starts, pos)]) return true;
    join(`b${run(was.lines, index(was.starts, pos)).join(':')}`, `a${run(now.lines, k).join(':')}`);
  }
  // (and every run of `before`'s blank lines whose first line lands in a run of those: the author's
  // lines a move or a join brings beside ours, which a run grown fewer drops ours before)
  const blankLine = (l: string): boolean => /^[ \t>]*$/.test(l);
  for (let k = 0; k < was.lines.length; k++) {
    if (!blankLine(was.lines[k]!) || (k > 0 && was.lines[k - 1] === was.lines[k])) continue;
    const span = run(was.lines, k);
    const key = `b${span.join(':')}`;
    if (group.has(key)) continue;
    // (where a change took its first line, the lines it put there may be on either side of it)
    // (and where its text ends a line, the line after it)
    const ahead = mapPos(changes, was.starts[k]!, 1);
    let at = index(now.starts, ahead);
    if (now.lines[at] !== was.lines[k]) at = index(now.starts, mapPos(changes, was.starts[k]!, -1));
    if (now.lines[at] !== was.lines[k] && /^\r?\n/.test(afterText.slice(ahead))) at = index(now.starts, afterText.indexOf('\n', ahead) + 1);
    if (now.lines[at] !== was.lines[k]) continue;
    const into = `a${run(now.lines, at).join(':')}`;
    if (group.has(into)) join(key, into);
  }
  const groups = new Map<string, string[]>();
  for (const key of group.keys()) groups.set(find(key), [...(groups.get(find(key)) ?? []), key]);
  for (const keys of groups.values()) {
    let lines = 0;
    let authors = 0;
    let size = 0;
    let ours = 0;
    for (const key of keys) {
      const [x, y] = key.slice(1).split(':').map(Number) as [number, number];
      if (key[0] === 'a') {
        size += y - x + 1;
        ours += marked(now.starts, afterAuto, [x, y]);
        continue;
      }
      for (let k = x; k <= y; k++) {
        if (filled.has(k)) continue;
        lines++;
        if (!marked(was.starts, beforeAuto, [k, k])) authors++;
      }
    }
    const made = Math.max(0, size - lines);
    if (size - ours > authors + made) return true;
  }
  return false;
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
