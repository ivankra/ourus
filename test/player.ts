// Plays actions against the core the way an editor host does: an action that is an ourus command
// runs it, and when the command doesn't apply the host's own default runs instead (a newline,
// deleting a character). Placeholders the caret leaves are settled after every action, as
// the CM6 demo does.
//
// Actions are named for what the user does, not for a key, so the same spec can drive editors
// with other keymaps: the ourus commands (W3C `inputType` names where one exists), `"text"`
// typed, and caret motions named as CodeMirror's commands are.

import { executeCommand, settlePlaceholders, type Command, type CommandResult, type Selection } from '../src/commands/index.ts';
import { OutlineState } from '../src/outline/index.ts';
import { advanceColumns, applyChanges, dominantEnding, type ChangeSpec } from '../src/text.ts';

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
  'pasteStructured',
  'pastePlain',
  'deleteSubtree',
  'duplicateSubtree',
]);

/** The command an action names (the clipboard is what a paste pastes). */
function commandOf(action: string, clipboard: string): Command {
  if (action === 'pasteStructured' || action === 'pastePlain') return { type: action, text: clipboard };
  return { type: action } as Command;
}

/**
 * Caret motions, named as CodeMirror's commands; each has a `select…` twin that keeps the anchor.
 * They exist so tests can move the caret between actions, and stand in for what an editor does
 * on its own: real editors move the caret as their layout and GUI dictate (wrapped lines,
 * proportional fonts, bidi), and a runner driving one leaves motion to it. Here columns are a
 * monospace font's, with tab stops of 4. Returns the new head, or for a vertical motion the line
 * it reaches, placed at the goal column.
 */
type Motion = (doc: OutlineState, sel: Selection) => number | { line: number };

const MOTIONS: Record<string, Motion> = {
  // with a selection, left and right collapse it to its start or end
  CharLeft: (doc, s) => (s.anchor !== s.head ? Math.min(s.anchor, s.head) : charBefore(doc.text, s.head)),
  CharRight: (doc, s) => (s.anchor !== s.head ? Math.max(s.anchor, s.head) : charAfter(doc.text, s.head)),
  LineUp: (doc, s) => ({ line: doc.lineAt(s.head).index - 1 }),
  LineDown: (doc, s) => ({ line: doc.lineAt(s.head).index + 1 }),
  LineBoundaryBackward: (doc, s) => doc.homePosition(s.head),
  LineBoundaryForward: (doc, s) => Math.max(s.head, doc.lineAt(s.head).to),
  DocStart: () => 0,
  DocEnd: (doc) => doc.text.length,
};

const isMotion = (action: string): boolean => /^(?:cursor|select)/.test(action) && action.replace(/^(?:cursor|select)/, '') in MOTIONS;

/**
 * Actions only the host performs, besides typed text and motions. `undo` and `redo` stand in for
 * an editor's history: each action that changed the text is one step, and a step restores the text
 * and the caret it had, nothing else (places are not restored: that is the host's contract).
 */
const HOST_ACTIONS = new Set<string>(['undo', 'redo']);

/** Whether an action is an ourus command (the rest are typing, motions and the host's undo). */
export const isCommand = (token: string): boolean => COMMANDS.has(token);

export const isAction = (token: string): boolean => /^"[^"]*"$/.test(token) || COMMANDS.has(token) || HOST_ACTIONS.has(token) || isMotion(token);

export interface Played {
  doc: OutlineState;
  selection: Selection;
  clipboard: string;
  /** The column vertical motion aims for, kept while the caret moves up and down. */
  goal?: number;
  /** The result of the last action, when it was an ourus command. */
  last?: CommandResult;
  /** The host's history: the document (placeholders included) and selection before each step that changed the text. */
  undone?: Snapshot[];
  redone?: Snapshot[];
}

/** A state the host's history returns to: text, placeholders and selection. */
interface Snapshot {
  readonly text: string;
  readonly placeholders: readonly number[];
  readonly selection: Selection;
}

const snapshot = (state: Played, selection = state.selection): Snapshot => ({ text: state.doc.text, placeholders: state.doc.placeholders, selection });

export function play(state: Played, actions: readonly string[]): Played {
  for (const action of actions) {
    if (action === 'undo' || action === 'redo') {
      state = history(state, action);
      continue;
    }
    const before = snapshot(state);
    state = step({ ...state, last: undefined, ...(/Line(?:Up|Down)$/.test(action) ? {} : { goal: undefined }) }, action);
    if (state.doc.text !== before.text) state = { ...state, undone: [...(state.undone ?? []), before], redone: [] };
    const settled = settlePlaceholders(state.doc, state.selection.head);
    // leaving a placeholder joins the step before it, which made the empty node: one undo takes both back
    if (settled) state = { ...state, doc: settled.state, selection: mapSel(settled.changes, state.selection), redone: [] };
  }
  return state;
}

/** Undo or redo one step of the host's history: the text and the caret come back, nothing else. */
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
    doc: state.doc.replace(entry.text, { drop: [...state.doc.placeholders], placeholders: entry.placeholders }),
    selection: entry.selection,
    ...(action === 'undo' ? { undone: rest, redone: other } : { redone: rest, undone: other }),
  };
}

function step(state: Played, action: string): Played {
  const { doc, selection } = state;
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  if (action.startsWith('"')) return edit(state, { from, to, insert: action.slice(1, -1) });
  if (isMotion(action)) {
    const extend = action.startsWith('select');
    const target = MOTIONS[action.replace(/^(?:cursor|select)/, '')]!(doc, selection);
    let head: number;
    let goal = state.goal;
    if (typeof target === 'number') head = target;
    else {
      const line = doc.lineAt(selection.head);
      goal ??= column(doc.text, line.from, selection.head);
      const dest = doc.lines[target.line];
      // past the first or last line, the caret goes to that end of the text; a column in the line's
      // markers or indentation lands at the start of its text
      head = dest ? Math.max(atColumn(doc.text, dest.from, dest.to, goal), doc.textStart(dest.from)) : target.line < 0 ? 0 : doc.text.length;
    }
    return { ...state, goal, selection: { anchor: extend ? selection.anchor : head, head } };
  }
  if (!COMMANDS.has(action)) throw new Error(`unknown action "${action}"`);
  const command = commandOf(action, state.clipboard);
  const type = command.type;
  const last = executeCommand(doc, command, selection);
  if (last.status === 'applied') {
    if (applyChanges(doc.text, last.changes) !== last.state.text) throw new Error(`${type}: its changes don't produce its document`);
    return { ...state, doc: last.state, selection: last.selection, last };
  }
  if (last.status === 'rejected') return { ...state, last };
  // not ours: the host's default
  switch (type) {
    case 'enter':
    case 'shiftEnter':
      return { ...edit(state, { from, to, insert: dominantEnding(doc.text) }), last };
    case 'deleteContentBackward': {
      if (from !== to) return { ...edit(state, { from, to, insert: '' }), last };
      if (from === 0) return { ...state, last };
      // one character: a line ending or a surrogate pair is one, as the caret's motions step over it
      return { ...edit(state, { from: charBefore(doc.text, from), to: from, insert: '' }), last };
    }
    case 'pasteStructured':
    case 'pastePlain':
      return { ...edit(state, { from, to, insert: state.clipboard }), last };
    // to the start of the line, as a line that doesn't wrap has it
    case 'deleteSoftLineBackward':
      return { ...edit(state, from !== to ? { from, to, insert: '' } : { from: doc.lineAt(from).from, to, insert: '' }), last };
    case 'deleteContentForward': {
      if (from !== to) return { ...edit(state, { from, to, insert: '' }), last };
      if (to === doc.text.length) return { ...state, last };
      return { ...edit(state, { from: to, to: charAfter(doc.text, to), insert: '' }), last };
    }
    default:
      return { ...state, last };
  }
}

function edit(state: Played, change: ChangeSpec): Played {
  const caret = change.from + change.insert.length;
  // the host tells where the caret lands, so an emptied node stays as a placeholder
  const doc = state.doc.update([change], { caret });
  return { ...state, doc, selection: { anchor: caret, head: caret } };
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

function charAfter(text: string, pos: number): number {
  if (pos >= text.length) return text.length;
  if (text.slice(pos, pos + 2) === '\r\n') return pos + 2;
  const c = text.charCodeAt(pos);
  return c >= 0xd800 && c < 0xdc00 && pos + 1 < text.length && text.charCodeAt(pos + 1) >= 0xdc00 && text.charCodeAt(pos + 1) < 0xe000 ? pos + 2 : pos + 1;
}

function mapSel(changes: readonly ChangeSpec[], sel: Selection): Selection {
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
