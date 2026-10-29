// A plain <textarea> outliner on top of ourus.
//
// The outliner's keys and paste run ourus commands; whatever they leave to the browser (typing,
// undo) is read back into the snapshot as a change of the text. Edits are made with
// execCommand('insertText'), so the browser's own undo keeps working. Touch keyboards send Enter
// and Backspace as input, not keys, and lack the rest: buttons stand in for those. The Preview box
// shows the document as ourus renders it, beside the text.

import { OurusDoc, executeCommand, mapPos, settlePlaceholders, type ChangeSpec, type OurusCommand, type OurusCommandResult } from '../../src/index.ts';

const KEYS: Record<string, OurusCommand['type']> = {
  Tab: 'indent',
  'Shift-Tab': 'outdent',
  'Alt-ArrowUp': 'moveSubtreeUp',
  'Alt-ArrowDown': 'moveSubtreeDown',
  Enter: 'enter',
  'Shift-Enter': 'shiftEnter',
  Backspace: 'deleteContentBackward',
  Delete: 'deleteContentForward',
  'Mod-Backspace': 'deleteSoftLineBackward',
  // selection by node: Escape, Ctrl-A's ladder, Shift-Down and Shift-Up a node a press (a textarea
  // can't tell a wrapped line's rows: a wrapped paragraph is selected whole at the first press)
  Escape: 'selectNode',
  'Mod-a': 'expandSelection',
  'Shift-ArrowDown': 'selectNodeDown',
  'Shift-ArrowUp': 'selectNodeUp',
};

const area = document.getElementById('editor') as HTMLTextAreaElement;
const status = document.getElementById('status')!;
const split = document.getElementById('split') as HTMLInputElement;
const preview = document.getElementById('preview')!;
let doc = OurusDoc.parse(area.value, { config: { flavor: 'obsidian' } });

function render() {
  if (split.checked) preview.innerHTML = doc.mdTree.renderHtml({ escapeRawHtml: true });
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

/** ourus's own edit is being made: its input events aren't typing. */
let applying = false;

/** Replaces the span the changes cover with what they make of it, as one step of the browser's undo. */
function apply(changes: readonly ChangeSpec[], next: OurusDoc) {
  doc = next; // before the input event the edit fires, so it isn't read back
  render();
  const old = area.value;
  const text = next.text;
  if (old === text) return;
  const from = Math.min(...changes.map((c) => c.from));
  const to = Math.max(...changes.map((c) => c.to));
  const insert = text.slice(from, text.length - (old.length - to));
  area.setSelectionRange(from, to);
  applying = true;
  const done = document.execCommand(insert ? 'insertText' : 'delete', false, insert);
  applying = false;
  if (!done || area.value !== text) {
    // the edit didn't come out as planned (and was read back as it did): set the text outright
    area.value = text;
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

function run(command: OurusCommand): OurusCommandResult {
  const result = executeCommand(doc, command, selection());
  say(`${command.type}: ${result.status === 'rejected' ? `rejected — ${result.reason}` : result.status}`);
  if (result.status === 'applied') {
    apply(result.changes, result.doc);
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
    const line = doc.lineAt(head);
    // (past a final line ending, the empty last line, which ourus's lines end before)
    const past = head > line.to;
    const start = past ? head : doc.textStart(line.index);
    const target = head === start ? (past ? head : line.from) : start;
    select(e.shiftKey ? anchor : target, target);
    e.preventDefault();
    return;
  }
  const type = KEYS[name];
  if (!type) return;
  keyed = true;
  const status = run({ type } as OurusCommand).status;
  if (status !== 'deferredToHost') e.preventDefault();
  else if (type === 'indent' || type === 'outdent') {
    // in code, Tab is a tab; never the browser's move to the next control
    e.preventDefault();
    if (type === 'indent' && area.selectionStart === area.selectionEnd) document.execCommand('insertText', false, '\t');
  }
});

// touch keyboards send Enter and Backspace as input (their keydown is key 229)
const INPUTS: Record<string, OurusCommand['type']> = {
  insertParagraph: 'enter',
  insertLineBreak: 'enter',
  deleteContentBackward: 'deleteContentBackward',
  deleteContentForward: 'deleteContentForward',
  deleteSoftLineBackward: 'deleteSoftLineBackward',
};

area.addEventListener('beforeinput', (e) => {
  // typing: ourus's where Markdown reads the character as structure (a backtick), else the browser's
  if (e.inputType === 'insertText' && e.data && !applying && !composing && !e.isComposing && e.cancelable) {
    const result = executeCommand(doc, { type: 'insertText', text: e.data }, selection());
    if (result.status === 'deferredToHost') return;
    e.preventDefault();
    say(`insertText: ${result.status === 'rejected' ? `rejected — ${result.reason}` : result.status}`);
    if (result.status === 'applied') {
      apply(result.changes, result.doc);
      select(result.selection.anchor, result.selection.head);
    }
    return;
  }
  const type = INPUTS[e.inputType];
  if (!type || keyed || composing || e.isComposing || !e.cancelable) return;
  if (run({ type } as OurusCommand).status !== 'deferredToHost') e.preventDefault();
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
    else run({ type: button.dataset.command } as OurusCommand);
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

// Ctrl-C and Ctrl-X: the selection's Markdown, every format ourus gives (the node at a caret alone);
// a cut takes it out. Where ourus steps aside, the browser's
for (const type of ['copy', 'cut'] as const) {
  area.addEventListener(type, (e) => {
    if (composing || !e.clipboardData) return;
    const result = run({ type });
    if (result.status === 'deferredToHost') return;
    e.preventDefault();
    if (result.status === 'applied') for (const [format, text] of Object.entries(result.clipboard ?? {})) e.clipboardData.setData(format, text);
  });
}

// Ctrl-V places Markdown as nodes, Ctrl-Shift-V puts the text into the node at the caret
area.addEventListener('paste', (e) => {
  if (composing) return;
  const type = plainPaste ? 'pastePlain' : 'paste';
  plainPaste = false;
  // Ctrl-V reads every format the clipboard has (a page's HTML, a Markdown app's `text/markdown`), Ctrl-Shift-V its text
  const data = e.clipboardData;
  const text = data?.getData('text/plain');
  if (!data || !text) return;
  const clipboard = Object.fromEntries(['text/plain', 'text/markdown', 'text/html', 'vscode-editor-data'].flatMap((t) => (data.types.includes(t) ? [[t, data.getData(t)]] : [])));
  if (run(type === 'paste' ? { type, clipboard } : { type, text }).status !== 'deferredToHost') e.preventDefault();
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
  doc = doc.update({ changes: [{ from, to: old.length - end, insert: text.slice(from, text.length - end) }], ...(head === anchor ? { caret: head } : {}) });
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
  apply(r.changes, r.doc);
  select(mapPos(r.changes, anchor), mapPos(r.changes, head));
});
