// GNU Emacs, for the drivers of its modes (driver.ts here: markdown-mode): Emacs on a terminal, as its
// users run it (`emacs -Q -nw`: no init file, nothing but what the driver loads), the terminal a tmux
// session of the run's own (80 by 24), and Emacs's server started on a socket in a directory of its own
// (Emacs refuses one others can read), talked to with `emacsclient --eval`. A terminal, not a daemon:
// a daemon's window is on no display, and what goes by the display (moving by screen lines, the
// column Up and Down keep) goes wrong there. Each test is a buffer of its own, shown in the frame's
// window, so the keys go where a user's would.
//
// Keys are played as a user's: `execute-kbd-macro` runs them through Emacs's command loop and the
// buffer's keymaps, in Emacs's own key notation (`C-c <right>`, `M-RET`). A key whose command signals
// an error ("Nothing to demote at point") does nothing, as it beeps for a user. Before each key the
// frame is redisplayed, as it is between a user's keys, and the buffer fontified (`syntax-propertize`,
// `font-lock-ensure`): a mode's commands read the text properties fontification sets (markdown-mode's
// `markdown-list-item`), and Emacs, busy with the server's requests, may not have got to it. And the command before carries over, as it does from
// one key to the next in a session: a key's first command sees it as `last-command` (set in the
// buffer's `pre-command-hook`; a macro of its own would start without it), so consecutive Downs keep
// their column, and consecutive undos go further back. Typed text
// goes in as one run, as a user's typing does (its undo is one change).

import { execFile, execFileSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { Session } from '../lib/driver.ts';
import { ensureAptInstalled } from '../lib/system.ts';
import { cacheDir } from '../proxy.ts';

const run = promisify(execFile);

/** A string as an Emacs Lisp string literal. */
export const lisp = (s: string): string => `"${s.replace(/[\\"]/g, '\\$&')}"`;

/** A value `emacsclient --eval` printed (`prin1`): a string's contents, or the printed form. */
const unprint = (s: string): string => (s.startsWith('"') ? s.slice(1, -1).replace(/\\(.)/gs, '$1') : s);

/** Offsets in code points (Emacs's) to UTF-16 (JavaScript's), and back, in `text`. */
export const toUtf16 = (text: string, cp: number): number => [...text].slice(0, cp).join('').length;
export const toCodePoints = (text: string, u: number): number => [...text.slice(0, u)].length;

export interface Emacs {
  /** Evaluates Lisp in the daemon; its value as `emacsclient` prints it, a string's contents unquoted. */
  eval(expr: string): Promise<string>;
  /** The session the runner plays keys, text and the clipboard (the kill ring) through. */
  session: Session;
  stop(): Promise<void>;
}

/** The buffer a test is in. */
export const BUFFER = '*ourus sxs*';

/**
 * Lisp run before each key: what redisplay would have done since the last one, and the last command
 * handed to the key's first (the buffer's hooks record and give it: `PRELUDE`, `FRESH`).
 */
const REDISPLAY = '(syntax-propertize (point-max)) (font-lock-ensure) (redisplay t) (setq ourus-sxs--carry ourus-sxs--last)';

/** Lisp defining what the session uses, run once: the last command recorded, and given to the next. */
const PRELUDE =
  '(progn (defvar ourus-sxs--last nil) (defvar ourus-sxs--carry nil)' +
  ' (defun ourus-sxs--record () (setq ourus-sxs--last this-command))' +
  ' (defun ourus-sxs--give () (when ourus-sxs--carry (setq last-command ourus-sxs--carry real-last-command ourus-sxs--carry ourus-sxs--carry nil))) t)';

/** Lisp for a test's buffer, made anew and shown in the daemon's window, `mode` turned on, no command before. */
export const FRESH = (mode: string): string =>
  `(when (get-buffer ${lisp(BUFFER)}) (kill-buffer ${lisp(BUFFER)})) (switch-to-buffer (get-buffer-create ${lisp(BUFFER)})) (${mode}) (add-hook 'pre-command-hook #'ourus-sxs--give nil t) (add-hook 'post-command-hook #'ourus-sxs--record nil t) (setq ourus-sxs--last nil ourus-sxs--carry nil)`;

/**
 * Lisp selecting from `anchor` to `head` (buffer positions) as Shift and a motion does: a temporary
 * region, which a motion without Shift deactivates (`handle-shift-selection`).
 */
export const SELECT = (anchor: number, head: number): string =>
  `(goto-char ${anchor}) (push-mark nil t t) (goto-char ${head}) (setq-local transient-mark-mode (cons 'only (unless (eq transient-mark-mode 'lambda) transient-mark-mode)))`;

/** Starts Emacs on a terminal of its own (installing both first if missing), and loads `init` (Lisp) into it. */
export async function startEmacs(init: string, say: (line: string) => void): Promise<Emacs> {
  ensureAptInstalled("Emacs's driver", [{ pkg: 'emacs-nox', command: 'emacs' }, { pkg: 'emacs-nox', command: 'emacsclient' }, { pkg: 'tmux', command: 'tmux' }], say);
  const dir = join(cacheDir, 'emacs-markdown', `server-${process.pid}`);
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  chmodSync(dir, 0o700);
  const socket = join(dir, 'socket');
  rmSync(socket, { force: true });
  // the terminal: a tmux server of the run's own, its one session 80 by 24, Emacs in it
  const tmux = ['-L', `ourus-sxs-${process.pid}`, '-f', '/dev/null'];
  const start = `(progn (setq server-socket-dir ${lisp(dir)} server-name "socket") (server-start))`;
  await run('tmux', [...tmux, 'new-session', '-d', '-x', '80', '-y', '24', 'emacs', '-Q', '-nw', '--eval', start]);
  for (let i = 0; i < 100 && !existsSync(socket); i++) await new Promise((r) => setTimeout(r, 50));
  if (!existsSync(socket)) {
    const screen = await run('tmux', [...tmux, 'capture-pane', '-p']).then((r) => r.stdout.trim(), () => '');
    await run('tmux', [...tmux, 'kill-server']).catch(() => {});
    throw new Error(`Emacs's server didn't start on its terminal: ${screen.split('\n').filter(Boolean).pop() ?? 'no screen'}`);
  }
  const evaluate = async (expr: string): Promise<string> => {
    try {
      const { stdout } = await run('emacsclient', ['-s', socket, '--eval', expr], { encoding: 'utf8', maxBuffer: 1 << 26 });
      return unprint(stdout.replace(/\n$/, ''));
    } catch (e) {
      const err = e as { stderr?: string; message: string };
      throw new Error(`Emacs: ${(err.stderr ?? err.message).trim().split('\n').pop()}`);
    }
  };
  // a key, as the command loop would take it; an error is the command's beep
  const key = (keys: string): Promise<string> =>
    evaluate(`(with-current-buffer ${lisp(BUFFER)} ${REDISPLAY} (condition-case e (progn (execute-kbd-macro (kbd ${lisp(keys)})) "") (error (error-message-string e))))`);
  await evaluate(PRELUDE);
  await evaluate(init);
  const stop = async (): Promise<void> => {
    await evaluate('(kill-emacs)').catch(() => {});
    await run('tmux', [...tmux, 'kill-server']).catch(() => {});
    rmSync(dir, { recursive: true, force: true });
  };
  // a run that exits without stopping it (an error): only synchronous work runs on `exit`
  process.once('exit', () => {
    try {
      execFileSync('tmux', [...tmux, 'kill-server'], { stdio: 'ignore' });
    } catch {}
  });
  say(`started Emacs ${await evaluate('emacs-version')} (-Q -nw, on a terminal of tmux's, 80x24, pid ${await evaluate('(emacs-pid)')})`);
  return {
    eval: evaluate,
    stop,
    session: {
      press: async (keys) => void (await key(keys)),
      // the text as one run, each character a key: a user's typing, its undo one change
      type: async (text) => void (await evaluate(`(with-current-buffer ${lisp(BUFFER)} ${REDISPLAY} (condition-case nil (execute-kbd-macro ${lisp(text)}) (error nil)) t)`)),
      clipboard: {
        write: async (text) => void (await evaluate(`(progn (kill-new ${lisp(text)}) t)`)),
        read: () => evaluate('(substring-no-properties (or (current-kill 0 t) ""))'),
      },
    },
  };
}
