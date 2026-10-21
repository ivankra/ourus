// Logseq's database version (2.x) on its test channel (https://test.logseq.com/): a graph in the
// browser's own storage (OPFS, through the app's database worker), saved nowhere else. The driver is
// Logseq's (../logseq/driver.ts), shared with the file-based app; what differs is how a block's
// canonical text is held: here a task, a number and a heading are properties of the block
// (`:logseq.property/status`, `order-list-type`, `heading`), its text the rest, as typing `1. ` or
// `## ` and Ctrl+Enter make them, and a fenced block is a code block (its text the code, its language
// a property), edited in CodeMirror. README.md has the rest.

import type { Outline } from '../lib/block.ts';
import { LITERAL_NUMBER, logseqDriver, type LogseqFlavor, type BlockAsRead, type BlockToLoad } from '../logseq/driver.ts';

// A block whose whole text is one fenced code block or one `$$` math block becomes a code or math
// block, its text the code or the math (Logseq's `src/main/frontend/format/block.cljs`,
// `standalone-display-block`: the text, trimmed, matching `^```.*```$` or `^\$\$.*\$\$$` and parsing
// as one mldoc `Src` or `Displayed_Math` node). Only ``` makes one: a `~~~` fence stays text, and so
// does a longer one around code with ``` in it (measured), the longer fence's extra backticks read as
// the language's start where it parses (````js: the language `` `js ``). A code block keeps no fence
// (Logseq writes it with ```), so a start with another fence is declined (`holds`), and the display
// type can't be given to a block by the plugin API instead (`upsert_block_property` fails validation).
/** A block that is one fenced code block, its fence ``` (the one Logseq writes back). */
const FENCED = /^```([^\n`]*)\n([\s\S]*?)\n?```$/;
/** A block that is one math block, `$$` on lines of their own. */
const MATH = /^\$\$\n([\s\S]*?)\n?\$\$$/;

/** The canonical prefixes a block's properties stand for, in their order: its number, its checkbox, its heading's `#`s. */
function split(text: string): { rest: string; number: boolean; task?: 'Todo' | 'Done'; heading?: number; from: number } {
  let rest = text;
  const n = /^\d{1,9}\. /.exec(rest);
  if (n) rest = rest.slice(n[0].length);
  const t = /^\[([ xX])\](?: |$)/.exec(rest);
  if (t) rest = rest.slice(t[0].length);
  const h = /^(#{1,6}) /.exec(rest);
  if (h) rest = rest.slice(h[0].length);
  return { rest, number: !!n, ...(t && { task: t[1] === ' ' ? 'Todo' : 'Done' }), ...(h && { heading: h[1]!.length }), from: text.length - rest.length };
}

export const DB: LogseqFlavor = {
  shortId: 'LD',
  longId: 'logseq-db',
  displayName: 'Logseq (DB)',
  url: 'https://test.logseq.com/',
  db: true,
  toLogseq(text): BlockToLoad {
    // a fenced block as written: Logseq makes it a code block, its editor showing the code
    const code = FENCED.exec(text);
    if (code) return { content: text, props: {}, edit: code[2]!, from: 4 + code[1]!.length, to: 0, numbered: false };
    // a math block likewise, its editor showing the math
    const math = MATH.exec(text);
    if (math) return { content: text, props: {}, edit: math[1]!, from: 3, to: 0, numbered: false };
    const s = split(text);
    const props: Record<string, string | number> = {};
    if (s.number) props['logseq.property/order-list-type'] = 'number';
    if (s.task) props['logseq.property/status'] = s.task;
    if (s.heading) props['logseq.property/heading'] = s.heading;
    return { content: s.rest, props, edit: s.rest, from: s.from, to: 0, numbered: s.number };
  },
  fromLogseq(raw: BlockAsRead, number) {
    if (raw.code !== undefined) {
      const fence = '```' + raw.code;
      return { text: `${fence}\n${raw.content}\n\`\`\``, from: 0, to: fence.length + 1 };
    }
    if (raw.math) return { text: `$$\n${raw.content}\n$$`, from: 0, to: 3 };
    const after = !!raw.content || !!raw.heading;
    const pre =
      (number !== null ? `${number}. ` : '') +
      (raw.status ? (/^(done|canceled)$/.test(raw.status) ? '[x]' : '[ ]') + (after ? ' ' : '') : '') +
      (raw.heading ? '#'.repeat(raw.heading) + ' ' : '');
    // a number that is text, escaped, where it would read as a marker (also after a block's own number)
    const literal = !raw.status && !raw.heading ? LITERAL_NUMBER.exec(raw.content) : null;
    const text = literal ? raw.content.slice(0, literal[0].length) + '\\' + raw.content.slice(literal[0].length) : raw.content;
    return { text: pre + text, from: 0, to: pre.length, ...(literal && { cut: pre.length + literal[0].length }) };
  },
  numbered: (raw) => !!raw.ordered,
  // What settling waits for. The DB version does its work in a database worker, whose messages no
  // timer or DOM change shows: a paste waits on two or three of its requests, some 50 ms, before Logseq
  // renders and focuses what it made, and a settle could end in between (a pasted code block's caret
  // read or not, from run to run: Paste1, Paste25, Scenario18). So the page counts the requests it has
  // made of the worker (Comlink's, an `id` its answer echoes) and is busy while any is in flight; none
  // stays open once the app is idle (measured: 42 at startup, the longest 302 ms). And CodeMirror 5, a
  // code block's editor, polls its input every 100 ms while it has the focus (`pollInterval`), a timer
  // always pending, so a focused code block never settled until the timeout: its poll goes to an hour.
  // Timing only: typing and pasting reach CodeMirror by their events, which it reads on its own fast
  // poll; the slow one catches input no event tells it of (some IMEs).
  // an arrow, not a method: Playwright sends its source text to the page, which a method's isn't a function of
  initScript: () => {
    if (location.hostname !== 'test.logseq.com' || (window as any).__ourusDbPending) return;
    const pending = ((window as any).__ourusDbPending = new Set<string>());
    const Native = window.Worker;
    window.Worker = class extends Native {
      constructor(url: string | URL, opts?: WorkerOptions) {
        super(url, opts);
        if (!String(url).includes('db-worker')) return;
        const post = this.postMessage.bind(this) as (msg: any, ...rest: any[]) => void;
        this.postMessage = (msg: any, ...rest: any[]) => {
          if (msg?.id && ['GET', 'SET', 'APPLY', 'CONSTRUCT'].includes(msg.type)) pending.add(msg.id);
          post(msg, ...rest);
        };
        this.addEventListener('message', (e: MessageEvent) => pending.delete(e.data?.id));
      }
    };
    // CodeMirror is a global of a script of the page's own, defined before the app starts
    addEventListener('DOMContentLoaded', () => {
      const cm = (window as any).CodeMirror;
      if (cm?.defaults) cm.defaults.pollInterval = 3600000;
    });
  },
  busy: `window.__ourusDbPending?.size > 0`,
  // undo and redo set `editor/op` and nothing clears it (`src/main/frontend/handler/history.cljs`,
  // `undo-aux!`, `redo-aux!`): it read busy for good after one, settling giving up a second later as
  // stuck. Their work is the worker's request, counted above
  staleOps: ['undo', 'redo'],
  // no `settings`: logical outdenting does nothing here, the OCaml worker's outdent op never passing the
  // option on to its outliner (Logseq's `deps/db-worker/lib/outliner_op.ml`, the "indent-outdent-blocks"
  // case: `?parent_original` passed, `~logical_outdenting` not), so `outdent: direct` stands
  holds(doc: Outline) {
    for (const [i, b] of doc.blocks.entries()) {
      const code = FENCED.exec(b.text);
      // a code or math block's own lines: a caret on a fence or a `$$`, or whitespace at their edges, which Logseq trims
      const own = code ? { at: 4 + code[1]!.length, text: code[2]!, what: 'code' } : MATH.test(b.text) ? { at: 3, text: MATH.exec(b.text)![1]!, what: 'math' } : null;
      if (own) {
        const sel = doc.sel?.block === i ? doc.sel : undefined;
        const inside = (p: number) => p >= own.at && p <= own.at + own.text.length;
        if (sel && !(inside(sel.anchor) && inside(sel.head))) return `caret on a ${own.what} block's delimiter line`;
        if (/^\s|\s$/.test(own.text)) return `${own.what} starting or ending with whitespace`;
        continue;
      }
      if (/^[ \t]*(?:`{3,}|~{3,})/m.test(b.text)) return 'code fence other than a block of ``` alone';
      // an empty task's space after its checkbox goes as the block loads (PasteList7: `[ ]┃`)
      if (/^\[[ xX]\] $/.test(b.text)) return "empty task with a space after its checkbox, which Logseq DB drops";
      // Logseq drops a line break at a stored text's edge; the block being edited (its editor) keeps it
      if (doc.sel?.block !== i && /^\n|\n$/.test(split(b.text).rest)) return 'line break at the edge of a block not being edited';
    }
    return undefined;
  },
};

export const driver = logseqDriver(DB);
