// Plays keys against the core the way an editor host does: a key runs its ourus command, and
// when the command doesn't apply the host's own default runs instead (a newline, deleting a
// character). Provisional places the caret leaves are settled after every key, as the CM6 demo
// does.
//
// Tokens: ⏎ Enter, ⇧⏎ Shift-Enter, ⇥ Tab, ⇧⇥ Shift-Tab, ⌥↑ ⌥↓ move, ⌫ Backspace, ⇱ Home,
// ↑ ↓ caret up/down, "text" typed text, or a command name.

import { execute, homePosition, settle, type Command, type Result, type Selection } from '../src/commands.ts';
import { Doc } from '../src/doc.ts';
import { dominantEnding, type Change } from '../src/text.ts';

const KEYS: Record<string, Command['type']> = {
  '⏎': 'insertParagraph',
  '⇧⏎': 'insertLineBreak',
  '⇥': 'formatIndent',
  '⇧⇥': 'formatOutdent',
  '⌥↑': 'moveUp',
  '⌥↓': 'moveDown',
  '⌫': 'deleteContentBackward',
};

export interface Played {
  doc: Doc;
  selection: Selection;
  /** The result of the last key that ran a command. */
  last?: Result;
}

export const tokenize = (keys: string): string[] => keys.match(/"[^"]*"|\S+/g) ?? [];

export function play(doc: Doc, selection: Selection, tokens: readonly string[]): Played {
  let state: Played = { doc, selection };
  for (const token of tokens) {
    state = step(state, token);
    const settled = settle(state.doc, state.selection.head);
    if (settled) state = { ...state, doc: settled.doc, selection: mapSel(settled.changes, state.selection) };
  }
  return state;
}

function step(state: Played, token: string): Played {
  const { doc, selection } = state;
  const from = Math.min(selection.anchor, selection.head);
  const to = Math.max(selection.anchor, selection.head);
  if (token.startsWith('"')) return edit(state, { from, to, insert: token.slice(1, -1) });
  if (token === '⇱') {
    const pos = homePosition(doc, selection.head);
    return { ...state, selection: { anchor: pos, head: pos } };
  }
  if (token === '↑' || token === '↓') return { ...state, selection: vertical(doc, selection.head, token === '↑' ? -1 : 1) };
  const type = KEYS[token] ?? (token as Command['type']);
  const last = execute(doc, { type } as Command, selection);
  if (last.status === 'applied') return { doc: last.doc, selection: last.selection, last };
  if (last.status === 'rejected') return { ...state, last };
  // not ours: the host's default
  switch (type) {
    case 'insertParagraph':
    case 'insertLineBreak':
      return { ...edit(state, { from, to, insert: dominantEnding(doc.text) }), last };
    case 'deleteContentBackward': {
      if (from !== to) return { ...edit(state, { from, to, insert: '' }), last };
      if (from === 0) return { ...state, last };
      const back = doc.text.slice(from - 2, from) === '\r\n' ? 2 : 1;
      return { ...edit(state, { from: from - back, to: from, insert: '' }), last };
    }
    default:
      return { ...state, last };
  }
}

function edit(state: Played, change: Change): Played {
  const doc = state.doc.apply([change]);
  const caret = change.from + change.insert.length;
  return { doc, selection: { anchor: caret, head: caret } };
}

function vertical(doc: Doc, pos: number, dir: -1 | 1): Selection {
  const line = doc.lineAt(pos);
  const target = doc.lines[line.index + dir];
  if (!target) return { anchor: pos, head: pos };
  const p = Math.min(target.from + (pos - line.from), target.to);
  return { anchor: p, head: p };
}

function mapSel(changes: readonly Change[], sel: Selection): Selection {
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
