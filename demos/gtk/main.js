// A GTK 4 outliner on top of ourus, run by GJS.
//
// The textarea demo's host, on a Gtk.TextView: the outliner's keys and paste run ourus commands;
// whatever they leave to GTK (typing, its undo) is read back into the snapshot as a change of the
// text. A command's edit is one user action, so GTK's own undo keeps working.

import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk?version=4.0';
import Gtk from 'gi://Gtk?version=4.0';
import { OutlineState, executeCommand, mapPos, settlePlaceholders } from '../../src/index.ts';

const KEYS = {
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

// GDK's names of the keys, as the browser's
const KEY_NAMES = {
  ISO_Left_Tab: 'Tab', // Shift-Tab
  Return: 'Enter',
  KP_Enter: 'Enter',
  BackSpace: 'Backspace',
  KP_Delete: 'Delete',
  Up: 'ArrowUp',
  Down: 'ArrowDown',
  KP_Home: 'Home',
};

const SAMPLE = `# ourus

Ourus is an editor-agnostic library for outliner editing of plain-text markdown. Here it drives a GTK text view.

- Tab and Shift-Tab indent and outdent the item at the caret
- Alt-Up and Alt-Down move it among its siblings
  - children included
- Enter splits an item, Backspace at its start joins it
- Shift-Enter breaks a line inside an item,
  which stays one item
- Home goes to the start of the text, again to the start of the line
- Ctrl-V pastes Markdown as nodes, Ctrl-Shift-V as plain text
- [ ] tasks too

## A section

A paragraph.
`;

// GTK counts a text's characters (code points), ourus its UTF-16 units: they differ past an emoji
const toChars = (text, pos) => [...text.slice(0, pos)].length;
function fromChars(text, chars) {
  let pos = 0;
  for (const c of text) {
    if (chars-- <= 0) break;
    pos += c.length;
  }
  return pos;
}

function outliner(view, status) {
  const buffer = view.get_buffer();
  buffer.set_text(SAMPLE, -1);
  let doc = OutlineState.parse(SAMPLE, { config: { flavor: 'obsidian' } });
  /** An edit of ours is being made: what it fires isn't read back. */
  let applying = false;
  /** An input method is composing text: its keys aren't ours. */
  let composing = false;

  const iterAt = (pos) => buffer.get_iter_at_offset(toChars(doc.text, pos));

  function selection(text = doc.text) {
    const at = (mark) => fromChars(text, buffer.get_iter_at_mark(mark).get_offset());
    return { anchor: at(buffer.get_selection_bound()), head: at(buffer.get_insert()) };
  }

  function select(anchor, head) {
    buffer.select_range(iterAt(head), iterAt(anchor));
  }

  /** Replaces the span the changes cover with what they make of it, as one step of GTK's undo. */
  function apply(changes, next) {
    const old = doc.text;
    if (old !== next.text) {
      const from = Math.min(...changes.map((c) => c.from));
      const to = Math.max(...changes.map((c) => c.to));
      const insert = next.text.slice(from, next.text.length - (old.length - to));
      const start = toChars(old, from);
      applying = true;
      buffer.begin_user_action();
      buffer.delete(buffer.get_iter_at_offset(start), iterAt(to));
      buffer.insert(buffer.get_iter_at_offset(start), insert, -1);
      buffer.end_user_action();
      applying = false;
    }
    doc = next;
  }

  function run(command) {
    const result = executeCommand(doc, command, selection());
    status.set_text(`${command.type}: ${result.status === 'rejected' ? `rejected — ${result.reason}` : result.status}`);
    if (result.status === 'applied') {
      apply(result.changes, result.state);
      select(result.selection.anchor, result.selection.head);
    }
    return result.status;
  }

  // Ctrl-V places Markdown as nodes, Ctrl-Shift-V puts the text into the node at the caret
  function paste(type) {
    const clipboard = view.get_clipboard();
    clipboard.read_text_async(null, (_source, result) => {
      const text = clipboard.read_text_finish(result);
      if (!text || run({ type, text }) !== 'notApplicable') return;
      // not ours: GTK's paste, read back like typing
      buffer.begin_user_action();
      buffer.delete_selection(true, true);
      buffer.insert_at_cursor(text, -1);
      buffer.end_user_action();
    });
  }

  // before the text view's own keys
  const keys = new Gtk.EventControllerKey();
  keys.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);
  keys.connect('key-pressed', (_controller, keyval, _keycode, state) => {
    if (composing) return false;
    const gdkName = Gdk.keyval_name(keyval) ?? '';
    const key = KEY_NAMES[gdkName] ?? gdkName;
    const ctrl = (state & Gdk.ModifierType.CONTROL_MASK) !== 0;
    const alt = (state & Gdk.ModifierType.ALT_MASK) !== 0;
    const shift = (state & Gdk.ModifierType.SHIFT_MASK) !== 0 || gdkName === 'ISO_Left_Tab';
    if (ctrl && !alt && key.toLowerCase() === 'v') {
      paste(shift ? 'pastePlain' : 'pasteStructured');
      return true;
    }
    const name = `${ctrl ? 'Mod-' : ''}${alt ? 'Alt-' : ''}${shift ? 'Shift-' : ''}${key}`;
    // Home: the start of the node's text, then the start of the line
    if (name === 'Home' || name === 'Shift-Home') {
      const { anchor, head } = selection();
      const target = doc.homePosition(head);
      select(shift ? anchor : target, target);
      return true;
    }
    const type = KEYS[name];
    // not applicable: GTK's default (in code, Tab is a tab)
    return type ? run({ type }) !== 'notApplicable' : false;
  });
  view.add_controller(keys);
  view.connect('preedit-changed', (_view, preedit) => (composing = preedit !== ''));

  // typing, undo and the like: the one span that changed, read back with the caret
  function readBack() {
    const old = doc.text;
    const text = buffer.get_text(buffer.get_start_iter(), buffer.get_end_iter(), true);
    if (text === old) return;
    let from = 0;
    while (from < old.length && from < text.length && old[from] === text[from]) from++;
    let end = 0;
    while (end < old.length - from && end < text.length - from && old[old.length - 1 - end] === text[text.length - 1 - end]) end++;
    const { anchor, head } = selection(text);
    doc = doc.update([{ from, to: old.length - end, insert: text.slice(from, text.length - end) }], head === anchor ? { caret: head } : {});
  }
  buffer.connect('changed', () => applying || readBack());

  // an empty node the caret has left is settled: kept, or its line removed. Once GTK is done
  // moving it: the buffer isn't edited from inside its own signals.
  let settling = 0;
  function settle() {
    settling = 0;
    readBack();
    const { anchor, head } = selection();
    const r = settlePlaceholders(doc, head);
    if (r) {
      apply(r.changes, r.state);
      select(mapPos(r.changes, anchor), mapPos(r.changes, head));
    }
    return GLib.SOURCE_REMOVE;
  }
  buffer.connect('mark-set', (_buffer, _iter, mark) => {
    if (!applying && !settling && mark.get_name() === 'insert') settling = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, settle);
  });
}

const app = new Gtk.Application({ application_id: 'io.github.ivankra.ourus.Gtk' });
app.connect('activate', () => {
  const window = new Gtk.ApplicationWindow({ application: app, title: 'ourus', default_width: 760, default_height: 560 });
  const view = new Gtk.TextView({ monospace: true, wrap_mode: Gtk.WrapMode.WORD_CHAR, top_margin: 12, bottom_margin: 12, left_margin: 12, right_margin: 12 });
  const status = new Gtk.Label({ xalign: 0, margin_start: 12, margin_end: 12, margin_top: 6, margin_bottom: 6 });
  const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
  box.append(new Gtk.ScrolledWindow({ child: view, vexpand: true }));
  box.append(status);
  window.set_child(box);
  outliner(view, status);
  window.present();
  view.grab_focus();
});
app.run([]);
