// A plain <textarea> outliner on top of ourus.
//
// The outliner's keys and paste run ourus commands; whatever they leave to the browser (typing,
// undo) is read back into the snapshot as a change of the text. Edits are made with
// execCommand('insertText'), so the browser's own undo keeps working. Touch keyboards send Enter
// and Backspace as input, not keys, and lack the rest: buttons stand in for those. The Preview box
// shows the document as ourus renders it, beside the text.

import { OutlineState, executeCommand, mapPos, renderHtml, settlePlaceholders, type ChangeSpec, type Command, type CommandResult } from '../../src/index.ts';

const KEYS: Record<string, Command['type']> = {
  Tab: 'indent',
  'Shift-Tab': 'outdent',
  'Alt-ArrowUp': 'moveSubtreeUp',
  'Alt-ArrowDown': 'moveSubtreeDown',
  Enter: 'enter',
  'Shift-Enter': 'shiftEnter',
  Backspace: 'deleteContentBackward',
  Delete: 'deleteContentForward',
  'Mod-Backspace': 'deleteSoftLineBackward',
};

const area = document.getElementById('editor') as HTMLTextAreaElement;
const status = document.getElementById('status')!;
const split = document.getElementById('split') as HTMLInputElement;
const preview = document.getElementById('preview')!;
let doc = OutlineState.parse(area.value, { config: { flavor: 'obsidian' } });

function render() {
  if (split.checked) preview.innerHTML = renderHtml(doc.syntaxTree, { escapeRawHtml: true });
}

split.addEventListener('change', () => {
  document.body.classList.toggle('split', split.checked);
  preview.hidden = !split.checked;
  render();
});

// links in the preview go nowhere but to its own anchors (footnotes)
preview.addEventListener('click', (e) => {
  const a = (e.target as Element).closest('a');
  if (a && !a.getAttribute('href')?.startsWith('#')) e.preventDefault();
});

function selection() {
  const backward = area.selectionDirection === 'backward';
  return { anchor: backward ? area.selectionEnd : area.selectionStart, head: backward ? area.selectionStart : area.selectionEnd };
}

function select(anchor: number, head: number) {
  area.setSelectionRange(Math.min(anchor, head), Math.max(anchor, head), head < anchor ? 'backward' : 'forward');
}

/** Replaces the span the changes cover with what they make of it, as one step of the browser's undo. */
function apply(changes: readonly ChangeSpec[], next: OutlineState) {
  doc = next; // before the input event the edit fires, so it isn't read back
  render();
  const old = area.value;
  if (old === next.text) return;
  const from = Math.min(...changes.map((c) => c.from));
  const to = Math.max(...changes.map((c) => c.to));
  const insert = next.text.slice(from, next.text.length - (old.length - to));
  area.setSelectionRange(from, to);
  if (!document.execCommand(insert ? 'insertText' : 'delete', false, insert) || area.value !== next.text) {
    // the edit didn't come out as planned (and was read back as it did): set the text outright
    area.value = next.text;
    doc = next;
    render();
  }
}

/** Says what a command did; on narrow screens, where the status is a notification, for a few seconds. */
let hideStatus = 0;
function say(text: string) {
  status.textContent = text;
  status.classList.add('shown');
  clearTimeout(hideStatus);
  hideStatus = window.setTimeout(() => status.classList.remove('shown'), 3000);
}

function run(command: Command): CommandResult {
  const result = executeCommand(doc, command, selection());
  say(`${command.type}: ${result.status === 'rejected' ? `rejected — ${result.reason}` : result.status}`);
  if (result.status === 'applied') {
    apply(result.changes, result.state);
    select(result.selection.anchor, result.selection.head);
  }
  return result;
}

/** Set by Ctrl-Shift-V's keydown, for the paste event it fires: paste as plain text. */
let plainPaste = false;
/** An input method is composing text: nothing of it goes to ourus until it's done. */
let composing = false;
/** The key being pressed went to ourus already: its input isn't run again. */
let keyed = false;

area.addEventListener('keydown', (e) => {
  keyed = false;
  // Safari sends the Enter that confirms a composition as not composing, but as key 229
  if (e.isComposing || e.keyCode === 229) return;
  plainPaste = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v';
  const name = `${e.ctrlKey || e.metaKey ? 'Mod-' : ''}${e.altKey ? 'Alt-' : ''}${e.shiftKey ? 'Shift-' : ''}${e.key}`;
  // undo and redo: the same as the buttons'
  const key = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && !e.altKey && (key === 'z' || key === 'y')) {
    if (history(key === 'y' || e.shiftKey ? 'redo' : 'undo')) e.preventDefault();
    return;
  }
  // Home: the start of the node's text, then the start of the line
  if (name === 'Home' || name === 'Shift-Home') {
    const { anchor, head } = selection();
    const target = doc.homePosition(head);
    select(e.shiftKey ? anchor : target, target);
    e.preventDefault();
    return;
  }
  const type = KEYS[name];
  if (!type) return;
  keyed = true;
  const status = run({ type } as Command).status;
  if (status !== 'notApplicable') e.preventDefault();
  else if (type === 'indent' || type === 'outdent') {
    // in code, Tab is a tab; never the browser's move to the next control
    e.preventDefault();
    if (type === 'indent' && area.selectionStart === area.selectionEnd) document.execCommand('insertText', false, '\t');
  }
});

// touch keyboards send Enter and Backspace as input (their keydown is key 229)
const INPUTS: Record<string, Command['type']> = {
  insertParagraph: 'enter',
  insertLineBreak: 'enter',
  deleteContentBackward: 'deleteContentBackward',
  deleteContentForward: 'deleteContentForward',
  deleteSoftLineBackward: 'deleteSoftLineBackward',
};

area.addEventListener('beforeinput', (e) => {
  const type = INPUTS[e.inputType];
  if (!type || keyed || composing || e.isComposing || !e.cancelable) return;
  if (run({ type } as Command).status !== 'notApplicable') e.preventDefault();
});

/**
 * Undo and redo are the browser's (ourus has none): the text they bring back is read back like typing.
 * False when the browser won't, and leaves it to the key.
 */
function history(command: 'undo' | 'redo'): boolean {
  if (document.activeElement !== area) area.focus();
  return document.execCommand(command);
}

// buttons for the keys touch keyboards lack; pressing one leaves the focus (and the keyboard) in the textarea
const keys = document.getElementById('keys')!;
for (const button of keys.querySelectorAll('button')) {
  button.addEventListener('mousedown', (e) => e.preventDefault());
  button.addEventListener('click', () => {
    if (button.dataset.history) history(button.dataset.history as 'undo' | 'redo');
    else run({ type: button.dataset.command } as Command);
  });
  // pressed, as :active isn't on touch screens (iOS) or sticks (Chrome)
  button.addEventListener('pointerdown', () => button.classList.add('pressed'));
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) button.addEventListener(type, () => button.classList.remove('pressed'));
}
// iOS leaves the page under its keyboard (Android shrinks it): the bar stays at the bottom of what's visible
const viewport = window.visualViewport;
const lift = () => (keys.style.bottom = `${Math.max(0, innerHeight - viewport!.height - viewport!.offsetTop)}px`);
viewport?.addEventListener('resize', lift);
viewport?.addEventListener('scroll', lift);

// Ctrl-V places Markdown as nodes, Ctrl-Shift-V puts the text into the node at the caret
area.addEventListener('paste', (e) => {
  if (composing) return;
  const type = plainPaste ? 'pastePlain' : 'pasteStructured';
  plainPaste = false;
  const text = e.clipboardData?.getData('text/plain');
  if (text && run({ type, text }).status !== 'notApplicable') e.preventDefault();
});

// typing, undo and the like: the one span that changed, read back with the caret
function readBack() {
  const old = doc.text;
  const text = area.value;
  if (text === old) return;
  let from = 0;
  while (from < old.length && from < text.length && old[from] === text[from]) from++;
  let end = 0;
  while (end < old.length - from && end < text.length - from && old[old.length - 1 - end] === text[text.length - 1 - end]) end++;
  const { head, anchor } = selection();
  doc = doc.update([{ from, to: old.length - end, insert: text.slice(from, text.length - end) }], head === anchor ? { caret: head } : {});
  render();
}

area.addEventListener('input', () => composing || readBack());
area.addEventListener('compositionstart', () => (composing = true));
area.addEventListener('compositionend', () => {
  composing = false;
  readBack();
});

// an empty node the caret (the selection's head) has left is settled: kept, or its line removed
document.addEventListener('selectionchange', () => {
  if (document.activeElement !== area || composing) return;
  const { anchor, head } = selection();
  const r = settlePlaceholders(doc, head);
  if (!r) return;
  apply(r.changes, r.state);
  select(mapPos(r.changes, anchor), mapPos(r.changes, head));
});
