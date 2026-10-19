// GNU Emacs with markdown-mode (https://jblevins.org/projects/markdown-mode/, see README.md): Emacs
// (`emacs -Q -nw`, the system's) on a terminal of the run's own (emacs.ts), markdown-mode 2.8 loaded from its
// release (fetched once, its SHA-256 checked), and nothing else. Each test is a buffer of its own in
// markdown-mode, its text and point (and mark, for a selection) set from the test, its undo history
// empty; reading is the buffer's text, point and mark. The documents are text (the `text` model).
//
// The keys are markdown-mode's and Emacs's own, in Emacs's notation: its list commands are the
// subtree ones on `C-c` and the arrows ("Indent Subtree", "Move Subtree Up", ...), not TAB, which
// cycles a line's indentation. One setting departs from what markdown-mode gives: lists indent by two
// spaces (`markdown-list-indent-width` 2, `indent-tabs-mode` off), as the spec draws them, where
// markdown-mode's own default is four, with tabs.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import type { Driver } from '../lib/driver.ts';
import { cacheDir } from '../proxy.ts';
import type { TextDoc } from '../lib/text.ts';
import { BUFFER, FRESH, lisp, SELECT, startEmacs, toCodePoints, toUtf16, type Emacs } from './emacs.ts';

/** markdown-mode's release: its tag, and its one file's SHA-256 (the tag's `markdown-mode.el`). */
const MARKDOWN_MODE = { tag: 'v2.8', version: '2.8', sha256: '73a686707d3e4044b475b5047af9e62c1d3810d4ee5e1002b52782d8bccb6d36' };

/** markdown-mode's directory, fetched into `.sxs/emacs-markdown/files/` if it isn't there yet. */
async function markdownMode(say: (line: string) => void): Promise<string> {
  const dir = join(cacheDir, 'emacs-markdown', 'files', `markdown-mode-${MARKDOWN_MODE.version}`);
  const file = join(dir, 'markdown-mode.el');
  const sha = (b: Buffer): string => createHash('sha256').update(b).digest('hex');
  if (existsSync(file) && sha(readFileSync(file)) === MARKDOWN_MODE.sha256) return dir;
  say(`fetching markdown-mode ${MARKDOWN_MODE.tag} ...`);
  const r = await fetch(`https://raw.githubusercontent.com/jrblevin/markdown-mode/${MARKDOWN_MODE.tag}/markdown-mode.el`);
  if (!r.ok) throw new Error(`markdown-mode.el: ${r.status}`);
  const body = Buffer.from(await r.arrayBuffer());
  if (sha(body) !== MARKDOWN_MODE.sha256) throw new Error(`markdown-mode.el: SHA-256 ${sha(body)}, not ${MARKDOWN_MODE.sha256}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, body);
  return dir;
}

/** Emacs's keys for the spec's motions; the `select…` motions add Shift (shift-selection). */
const MOTIONS: Record<string, string> = {
  CharLeft: '<left>',
  CharRight: '<right>',
  LineUp: '<up>',
  LineDown: '<down>',
  LineBoundaryBackward: '<home>',
  LineBoundaryForward: '<end>',
  DocStart: 'C-<home>',
  DocEnd: 'C-<end>',
};
const shifted = (k: string): string => (k.startsWith('C-') ? `C-S-${k.slice(2)}` : `S-${k}`);

let emacs: Emacs;

export const driver: Driver = {
  name: 'emacs-markdown',
  title: 'Emacs with markdown-mode',
  id: 'EM',
  url: 'emacs -Q -nw, on a terminal',
  model: 'text',
  // Backspace right after a checkbox deletes a character (`taskEditing: text`)
  behaves: { taskEditing: 'text', deleteAtGap: 'gap' },
  keys: {
    // `markdown-enter-key`: a line break, indented as the line before (no list item is continued)
    enter: 'RET',
    // Shift+Enter: unbound, so Emacs takes it as RET (shift dropped, `<return>` translated), as for a user
    shiftEnter: 'S-<return>',
    // "Indent Subtree", "Outdent Subtree" (`markdown-demote`, `markdown-promote`)
    indent: 'C-c <right>',
    outdent: 'C-c <left>',
    // "Move Subtree Up", "Down" (`markdown-move-up`, `markdown-move-down`)
    moveSubtreeUp: 'C-c <up>',
    moveSubtreeDown: 'C-c <down>',
    // `markdown-outdent-or-delete`; the Delete key, `delete-forward-char`
    deleteContentBackward: 'DEL',
    deleteContentForward: '<deletechar>',
    // the text before point on the line, killed (`kill-line` with 0)
    deleteSoftLineBackward: 'C-0 C-k',
    // "Kill Element" (`markdown-kill-thing-at-point`): a list item with its children
    deleteSubtree: 'C-c C-k',
    // the kill ring, yanked: Emacs has one paste
    pasteStructured: 'C-y',
    pastePlain: 'C-y',
    undo: 'C-/',
    // `undo-redo`
    redo: 'C-M-_',
    ...Object.fromEntries(Object.entries(MOTIONS).flatMap(([m, k]) => [[`cursor${m}`, k], [`select${m}`, shifted(k)]])),
  },

  holds(doc) {
    // a file's CRLF is decoded when Emacs reads it (its coding system): a buffer holds no CR of a line ending
    return (doc as TextDoc).text.includes('\r') ? 'CR line endings' : undefined;
  },

  async launch({ say }) {
    const dir = await markdownMode(say);
    emacs = await startEmacs(
      `(progn (add-to-list 'load-path ${lisp(dir)}) (require 'markdown-mode)` +
        // lists by two spaces, as the spec draws them (markdown-mode's default: four, with tabs)
        ` (setq-default indent-tabs-mode nil) (setq markdown-list-indent-width 2) t)`,
      say,
    );
    return { page: null as unknown as Page, reused: false, release: () => emacs.stop(), session: emacs.session };
  },

  async open() {
    // ready once a key does what it should: "Indent Subtree" indents
    await this.load(null as unknown as Page, { text: '- a\n- b\n', sel: { anchor: 7, head: 7 } });
    await emacs.session.press(this.keys.indent as string);
    const after = (await this.read(null as unknown as Page)) as TextDoc;
    if (after.text !== '- a\n  - b\n') throw new Error(`markdown-mode's keys didn't come up: C-c <right> gives ${JSON.stringify(after.text)}`);
    return `${await emacs.eval('emacs-version')}, markdown-mode ${MARKDOWN_MODE.version}`;
  },

  async load(_page, doc) {
    const { text, sel } = doc as TextDoc;
    const at = (u: number): number => toCodePoints(text, u) + 1;
    const caret = !sel ? '(goto-char (point-min))' : sel.anchor === sel.head ? `(goto-char ${at(sel.head)})` : SELECT(at(sel.anchor), at(sel.head));
    await emacs.eval(`(progn ${FRESH('markdown-mode')} (insert ${lisp(text)}) ${caret} (setq buffer-undo-list nil) (set-buffer-modified-p nil) t)`);
  },

  async read() {
    const raw = await emacs.eval(
      `(with-current-buffer ${lisp(BUFFER)} (json-serialize (list :text (buffer-substring-no-properties (point-min) (point-max)) :point (1- (point)) :mark (if (region-active-p) (1- (mark)) :null))))`,
    );
    const { text, point, mark } = JSON.parse(raw) as { text: string; point: number; mark: number | null };
    const head = toUtf16(text, point);
    return { text, sel: { anchor: mark === null ? head : toUtf16(text, mark), head } };
  },
};
