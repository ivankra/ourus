// Plays actions against the core the way an editor host does: an action that is an ourus command
// runs it, and when the command doesn't apply the host's own default runs instead (a newline,
// deleting a character). Placeholders the caret leaves are settled after every action, as
// the CM6 demo does.
//
// Actions are named for what the user does, not for a key, so the same spec can drive editors
// with other keymaps: the ourus commands (W3C `inputType` names where one exists), `"text"`
// typed (a character at a time, each through ourus's `insertText` first, as a host hooked to its
// keys does), and caret motions named as CodeMirror's commands are.

import { executeCommand, leavesZoom, settlePlaceholders, type OurusCommand, type OurusResult, type OurusSelection, OurusDeferred, OurusRejected, OurusSuccess } from '../src/commands/index.ts';
import { CommandContext } from '../src/commands/context.ts';
import { dragRun, placeAtSeam } from '../src/commands/drag.ts';
import type { OurusDoc } from '../src/doc/index.ts';
import type { OurusView } from '../src/view/index.ts';
import { advanceColumns, applyChanges, dominantEnding, type ChangeSpec, type MarkSet } from '../src/text/index.ts';
import { labelNumber, type DropLine } from './drawing.ts';
import type { Clipboard } from './specfile.ts';

const COMMANDS = new Set<string>([
  'indent',
  'outdent',
  'moveSubtreeUp',
  'moveSubtreeDown',
  'enter',
  'shiftEnter',
  'deleteContentBackward',
  'deleteContentForward',
  'deleteSoftLineBackward',
  'paste',
  'pastePlain',
  'deleteSubtree',
  'duplicateSubtree',
  'copy',
  'cut',
  'deleteByDrag',
  'selectNode',
  'expandSelection',
  'selectNodeDown',
  'selectNodeUp',
]);

/** The command an action names: `paste` takes the clipboard's formats, plain paste its text. */
function commandOf(action: string, clipboard: Clipboard): OurusCommand {
  if (action === 'paste') return { type: 'paste', clipboard };
  if (action === 'pastePlain') return { type: action, text: clipboard['text/plain'] ?? '' };
  return { type: action } as OurusCommand;
}

/**
 * Caret motions, named as CodeMirror's commands; each has a `select…` twin that keeps the anchor.
 * They exist so tests can move the caret between actions, and stand in for what an editor does
 * on its own: real editors move the caret as their layout and GUI dictate (wrapped lines,
 * proportional fonts, bidi), and a runner driving one leaves motion to it. Here columns are a
 * monospace font's, with tab stops of 4. Returns the new head, or for a vertical motion the line
 * it reaches, placed at the goal column.
 */
type Motion = (doc: OurusDoc, sel: OurusSelection) => number | { line: number };

const MOTIONS: Record<string, Motion> = {
  // with a selection, left and right collapse it to its start or end
  CharLeft: (doc, s) => (s.anchor !== s.head ? Math.min(s.anchor, s.head) : charBefore(doc.text, s.head)),
  CharRight: (doc, s) => (s.anchor !== s.head ? Math.max(s.anchor, s.head) : charAfter(doc.text, s.head)),
  LineUp: (doc, s) => ({ line: doc.lineAt(s.head).index - 1 }),
  LineDown: (doc, s) => ({ line: doc.lineAt(s.head).index + 1 }),
  // the start of the line's text; from there, of the line (past the final line ending, where it is)
  LineBoundaryBackward: (doc, s) => {
    const line = doc.lineAt(s.head);
    if (s.head > line.to) return s.head;
    const start = doc.textStart(line.index);
    return s.head === start ? line.from : start;
  },
  LineBoundaryForward: (doc, s) => Math.max(s.head, doc.lineAt(s.head).to),
  DocStart: () => 0,
  DocEnd: (doc) => doc.text.length,
};

/** A drop (spec/move-subtree.md, paste-at.md): `moveSubtree`, the selection's nodes, or `moveSubtree ②`, a press on a node's mark; `pasteAt`, the clipboard dragged in. */
const DROP = /^(?:moveSubtree(?: ([\u2460-\u2473\u3251-\u325f\u32b1-\u32bf]))?|pasteAt)$/u;

/** A pickup held for a step to check (spec/drag.md): `drag`, the selection's nodes, or `drag ②`. */
const PICKUP = /^drag(?: ([\u2460-\u2473\u3251-\u325f\u32b1-\u32bf]))?$/u;
/** The view's commands, a label naming the node a click would (`fold ①`): else the selection's. */
const VIEW = /^(fold|unfold|toggleFold|zoomIn)(?: ([\u2460-\u2473\u3251-\u325f\u32b1-\u32bf]))?$|^(zoomOut|clearZoom)$/u;

const isMotion = (action: string): boolean => /^(?:cursor|select)/.test(action) && action.replace(/^(?:cursor|select)/, '') in MOTIONS;

/**
 * Actions only the host performs, besides typed text and motions. `undo` and `redo` stand in for
 * an editor's history: each action that changed the text is one step, and a step restores the text
 * and the caret it had, nothing else (places are not restored: that is the host's contract).
 */
const HOST_ACTIONS = new Set<string>(['undo', 'redo']);

/** Whether an action is an ourus command (the rest are typing, motions and the host's undo). */
export const isCommand = (token: string): boolean => COMMANDS.has(token);

/** A key pressed as is in an app (`key:Control+a`, Playwright's notation), for probing a key no action names: ourus does nothing at it. */
const isRawKey = (token: string): boolean => /^key:\S+$/.test(token);

export const isAction = (token: string): boolean => /^"[^"]*"$/.test(token) || isRawKey(token) || COMMANDS.has(token) || HOST_ACTIONS.has(token) || isMotion(token) || DROP.test(token) || PICKUP.test(token) || VIEW.test(token);

/** Whether an action is a drop, which plays at the start's drop line. */
export const isDrop = (token: string): boolean => DROP.test(token);

export interface Played {
  /** The document and the reader's folds and zoom over it. */
  view: OurusView;
  selection: OurusSelection;
  /** The host's clipboard, each format's text. */
  clipboard: Clipboard;
  /** The column vertical motion aims for, kept while the caret moves up and down. */
  goal?: number;
  /** The result of the last action, when it was an ourus command. */
  last?: OurusResult;
  /** The host's history: the document (placeholders included) and selection before each step that changed the text. */
  undone?: Snapshot[];
  redone?: Snapshot[];
  /** Where the start's drop line drops, until a drop plays it. */
  drop?: DropLine | null;
  /** The node labels bound so far (`①`'s number to its node's id), for the actions that name one. */
  labels?: ReadonlyMap<number, number>;
}

/** A state the host's history returns to: the text with its placeholders, and the selection; the snapshot it was, whose nodes an undo takes back (`view.withDoc`). */
interface Snapshot {
  readonly text: string;
  readonly marks: MarkSet;
  readonly selection: OurusSelection;
  readonly doc: OurusDoc;
}

const snapshot = (state: Played, selection = state.selection): Snapshot => ({ text: state.view.doc.text, marks: state.view.doc.marks, selection, doc: state.view.doc });

export function play(state: Played, actions: readonly string[]): Played {
  for (const action of actions) {
    if (action === 'undo' || action === 'redo') {
      state = history(state, action);
      continue;
    }
    const before = snapshot(state);
    state = step({ ...state, last: undefined, ...(/Line(?:Up|Down)$/.test(action) ? {} : { goal: undefined }) }, action);
    if (state.view.doc.text !== before.text) state = { ...state, undone: [...(state.undone ?? []), before], redone: [] };
    const settled = settlePlaceholders(state.view, state.selection.head);
    // leaving a placeholder joins the step before it, which made the empty node: one undo takes both back
    if (settled) state = { ...state, view: settled.view, selection: mapSel(settled.changes, state.selection), redone: [] };
  }
  return state;
}

/** Undo or redo one step of the host's history: the text and the caret come back, and the nodes of the snapshot it returns to (`view.withDoc`), the view carried onto them. */
function history(state: Played, action: 'undo' | 'redo'): Played {
  const from = action === 'undo' ? (state.undone ?? []) : (state.redone ?? []);
  const entry = from[from.length - 1];
  if (!entry) return { ...state, last: undefined };
  const current = snapshot(state);
  const rest = from.slice(0, -1);
  const other = [...((action === 'undo' ? state.redone : state.undone) ?? []), current];
  return {
    ...state,
    last: undefined,
    goal: undefined,
    view: state.view.withDoc(entry.doc.withConfig(state.view.doc.config)),
    selection: entry.selection,
    ...(action === 'undo' ? { undone: rest, redone: other } : { redone: rest, undone: other }),
  };
}

function step(state: Played, action: string): Played {
  const { view: viewed, selection } = state;
  const doc = viewed.doc;
  const text = doc.text;
  if (action.startsWith('"')) return typeText(state, action.slice(1, -1));
  if (isRawKey(action)) return state;
  if (isMotion(action)) {
    const extend = action.startsWith('select');
    const target = MOTIONS[action.replace(/^(?:cursor|select)/, '')]!(doc, selection);
    let head: number;
    let goal = state.goal;
    if (typeof target === 'number') head = target;
    else {
      const line = doc.lineAt(selection.head);
      goal ??= column(text, line.from, selection.head);
      const dest = target.line >= 0 && target.line < doc.lineCount ? doc.mdTree.line(target.line) : null;
      // past the first or last line, the caret goes to that end of the text; a column in the line's
      // markers or indentation lands at the start of its text
      head = dest ? Math.max(atColumn(text, dest.from, dest.to, goal), doc.textStart(dest.index)) : target.line < 0 ? 0 : text.length;
    }
    // zoomed, kept in the zoom, as a host keeps its user's selection there (obsidian-zoom's
    // `LimitSelectionWhenZoomedIn`)
    const zoom = viewed.zoomRange();
    if (zoom) head = Math.min(Math.max(head, zoom.from), zoom.to);
    return { ...state, goal, selection: { anchor: extend ? selection.anchor : head, head } };
  }
  const dropped = DROP.exec(action);
  if (dropped) return { ...run(state, action === 'pasteAt' ? pasteAtCommand(state) : dropCommand(state, dropped[1])), drop: null };
  const view = VIEW.exec(action);
  if (view) {
    if (view[3]) return run(state, { type: view[3] as 'zoomOut' | 'clearZoom' });
    const pressed = pressedOf(state, view[2]);
    const nodes = pressed === undefined ? {} : { nodes: [pressed] };
    if (view[1] === 'zoomIn') return run(state, { type: 'zoomIn', ...nodes });
    return run(state, { type: view[1] as 'fold' | 'unfold' | 'toggleFold', ...nodes });
  }
  const picked = PICKUP.exec(action);
  if (picked) {
    const pressed = pressedOf(state, picked[1]);
    return run(state, { type: 'drag', ...(pressed !== undefined && { pressed }) });
  }
  if (!COMMANDS.has(action)) throw new Error(`unknown action "${action}"`);
  return run(state, commandOf(action, state.clipboard));
}

/**
 * A drop as the user makes it (spec/move-subtree.md): the run picked up (`pressed`, a label: the cover rule;
 * else the selection's nodes), then `moveSubtree` the place the start's drop line names. A refused
 * pickup is the drop's result.
 */
function dropCommand(state: Played, label: string | undefined): OurusCommand | OurusResult {
  if (!state.drop) throw new Error('a drop with no drop line (`▸`) in the start, or a second drop: a case drops once');
  const pressed = pressedOf(state, label);
  const run = dragRun(new CommandContext(state.view, state.selection), pressed);
  if (!Array.isArray(run)) return run;
  const to = placeAtSeam(state.view, run, state.drop.line, state.drop.depth);
  if (typeof to === 'string') throw new Error(`the drop line: ${to}`);
  return pressed === undefined ? { type: 'moveSubtree', to } : { type: 'moveSubtree', nodes: run.map((n) => n.id), to };
}

/** A drop from outside: the clipboard, at the place the start's drop line names. */
function pasteAtCommand(state: Played): OurusCommand {
  if (!state.drop) throw new Error('a drop with no drop line (`▸`) in the start, or a second drop: a case drops once');
  const at = placeAtSeam(state.view, null, state.drop.line, state.drop.depth);
  if (typeof at === 'string') throw new Error(`the drop line: ${at}`);
  return { type: 'pasteAt', at, clipboard: state.clipboard };
}

/** The node a label names, as pressed; none without a label. */
function pressedOf(state: Played, label: string | undefined): number | undefined {
  if (label === undefined) return undefined;
  const pressed = state.labels?.get(labelNumber(label));
  if (pressed === undefined) throw new Error(`${label} labels no node in the start`);
  return pressed;
}

/**
 * `command` run as the host runs it: applied, refused, or the host's default, which a zoomed host
 * checks before committing (`leavesZoom`), refusing the edit where it would leave the zoom.
 */
function run(state: Played, command: OurusCommand | OurusResult): Played {
  return guarded(state, hostRun(state, command));
}

/** `next`, a step of the host's own: refused where it leaves `state`'s zoom, as a host checks its own edits (`leavesZoom`). */
function guarded(state: Played, next: Played): Played {
  if (!(next.last instanceof OurusDeferred) || state.view.zoom === null || next.view.doc === state.view.doc) return next;
  if (!leavesZoom(state.view, next.view.doc)) return next;
  return { ...state, last: new OurusRejected('outside-zoom', "the host's own edit would leave the zoom") };
}

function hostRun(state: Played, command: OurusCommand | OurusResult): Played {
  if (!('type' in command)) return { ...state, last: command };
  const { view, selection } = state;
  const doc = view.doc;
  const text = doc.text;
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  const type = command.type;
  const last = executeCommand(view, command, selection);
  if (last instanceof OurusSuccess) {
    if (applyChanges(text, last.changes) !== last.view.doc.text) throw new Error(`${type}: its changes don't produce its document`);
    return { ...state, view: last.view, selection: last.selection, last, ...(last.clipboard && { clipboard: last.clipboard }) };
  }
  if (last instanceof OurusRejected) return { ...state, last };
  // not ours: the host's default
  switch (type) {
    case 'enter':
    case 'shiftEnter':
      return { ...edit(state, { from, to, insert: dominantEnding(text) }), last };
    case 'deleteContentBackward': {
      if (from !== to) return { ...edit(state, { from, to, insert: '' }), last };
      if (from === 0) return { ...state, last };
      // one character: a line ending or a surrogate pair is one, as the caret's motions step over it
      return { ...edit(state, { from: charBefore(text, from), to: from, insert: '' }), last };
    }
    case 'paste':
    case 'pastePlain':
      return { ...edit(state, { from, to, insert: state.clipboard['text/plain'] ?? '' }), last };
    // a textarea's: the selected text, and nothing at a caret (CodeMirror would take the line)
    // a text drag's first half: the selected text, as the host deletes it
    case 'deleteByDrag':
      return { ...edit(state, { from, to, insert: '' }), last };
    case 'copy':
    case 'cut': {
      if (from === to) return { ...state, last };
      const clipboard = { 'text/plain': text.slice(from, to) };
      return type === 'cut' ? { ...edit(state, { from, to, insert: '' }), clipboard, last } : { ...state, clipboard, last };
    }
    // to the start of the line, as a line that doesn't wrap has it
    case 'deleteSoftLineBackward':
      return { ...edit(state, from !== to ? { from, to, insert: '' } : { from: doc.lineAt(from).from, to, insert: '' }), last };
    case 'deleteContentForward': {
      if (from !== to) return { ...edit(state, { from, to, insert: '' }), last };
      if (to === text.length) return { ...state, last };
      return { ...edit(state, { from: to, to: charAfter(text, to), insert: '' }), last };
    }
    // the selection commands: a select all, a line's selection (CodeMirror's `selectLineDown`)
    case 'expandSelection':
      return { ...state, selection: { anchor: 0, head: text.length }, last };
    case 'selectNodeDown':
    case 'selectNodeUp':
      return { ...step(state, type === 'selectNodeDown' ? 'selectLineDown' : 'selectLineUp'), last };
    default:
      return { ...state, last };
  }
}

/**
 * Typed text, a character at a time as keys type it: each goes to ourus's `insertText` first, and
 * where that doesn't apply the host types it. The last character's result is the action's.
 */
function typeText(state: Played, text: string): Played {
  for (const ch of text) {
    const { view, selection } = state;
    const doc = view.doc;
    const last = executeCommand(view, { type: 'insertText', text: ch }, selection);
    if (last instanceof OurusSuccess) {
      if (applyChanges(doc.text, last.changes) !== last.view.doc.text) throw new Error(`insertText: its changes don't produce its document`);
      state = { ...state, view: last.view, selection: last.selection, last };
    } else if (last instanceof OurusRejected) state = { ...state, last };
    else state = guarded(state, { ...edit(state, { from: Math.min(selection.anchor, selection.head), to: Math.max(selection.anchor, selection.head), insert: ch }), last });
  }
  return state;
}

function edit(state: Played, change: ChangeSpec): Played {
  const caret = change.from + change.insert.length;
  // the host tells where the caret lands, so an emptied node stays as a placeholder
  const view = state.view.update({ changes: [change], caret });
  return { ...state, view, selection: { anchor: caret, head: caret } };
}

/** The display column of `pos` on a line starting at `from`. */
const column = (text: string, from: number, pos: number): number => advanceColumns(text, from, pos, 0);

/** The position on a line nearest a display column, never past the line's end. */
function atColumn(text: string, from: number, to: number, col: number): number {
  let pos = from;
  while (pos < to) {
    const next = charAfter(text, pos);
    if (advanceColumns(text, from, next, 0) > col) break;
    pos = next;
  }
  return pos;
}

/** One character back: a line ending and a surrogate pair count as one. */
function charBefore(text: string, pos: number): number {
  if (pos <= 0) return 0;
  if (text.slice(pos - 2, pos) === '\r\n') return pos - 2;
  const c = text.charCodeAt(pos - 1);
  return c >= 0xdc00 && c < 0xe000 && pos >= 2 && text.charCodeAt(pos - 2) >= 0xd800 && text.charCodeAt(pos - 2) < 0xdc00 ? pos - 2 : pos - 1;
}

/** One character on: a grapheme, as a host's Delete takes it (`👍🏽` whole, a line ending's `\r\n`). */
function charAfter(text: string, pos: number): number {
  if (pos >= text.length) return text.length;
  const first = graphemes.segment(text.slice(pos, pos + 64))[Symbol.iterator]().next().value;
  return pos + (first?.segment.length ?? 1);
}

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

function mapSel(changes: readonly ChangeSpec[], sel: OurusSelection): OurusSelection {
  let { anchor, head } = sel;
  for (const c of [...changes].sort((a, b) => b.from - a.from)) {
    const shift = c.insert.length - (c.to - c.from);
    if (anchor >= c.to) anchor += shift;
    else if (anchor > c.from) anchor = c.from;
    if (head >= c.to) head += shift;
    else if (head > c.from) head = c.from;
  }
  return { anchor, head };
}
