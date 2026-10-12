// Drives the built demo in headless Chromium with real key presses.
//   node demo/cm6/smoke.ts [--screenshot out.png]
// Needs a Chromium; set CHROMIUM to its path (default /usr/bin/chromium).

import * as esbuild from 'esbuild';
import { chromium } from 'playwright-core';

const here = new URL('.', import.meta.url).pathname;
const shotArg = process.argv.indexOf('--screenshot');
const screenshot = shotArg > 0 ? process.argv[shotArg + 1] : undefined;

const ctx = await esbuild.context({ entryPoints: [here + 'main.ts'], bundle: true, format: 'esm', target: 'es2022', outfile: here + 'dist/main.js' });
await ctx.rebuild();
const { port } = await ctx.serve({ servedir: here, port: 0 });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
const errors: string[] = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(() => 'ourusDemo' in window);

type Demo = { text(): string; setText(t: string, caret?: number): void };
const text = () => page.evaluate(() => (window as unknown as { ourusDemo: Demo }).ourusDemo.text());
const status = () => page.textContent('#status');

/** Sets the document from a drawing with a `┃` caret, presses keys, compares with the drawing after. */
async function scenario(name: string, before: string, keys: string[], after: string): Promise<boolean> {
  const caret = before.indexOf('┃');
  await page.evaluate(([t, c]) => (window as unknown as { ourusDemo: Demo }).ourusDemo.setText(t as string, c as number), [before.replace('┃', ''), caret]);
  await page.focus('.cm-content');
  for (const k of keys) {
    if (k.startsWith('type:')) await page.keyboard.type(k.slice(5));
    else if (k.startsWith('paste:')) {
      // a real paste event, as the browser fires it, carrying the text
      await page.evaluate((text) => {
        const data = new DataTransfer();
        data.setData('text/plain', text);
        document.querySelector('.cm-content')!.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
      }, k.slice(6));
    }
    else await page.keyboard.press(k);
  }
  const got = await text();
  const want = after;
  const ok = got === want;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `\n     want ${JSON.stringify(want)}\n     got  ${JSON.stringify(got)}\n     status: ${await status()}`}`);
  return ok;
}

const results = [
  await scenario('Tab indents an item', '- a\n- b┃\n', ['Tab'], '- a\n  - b\n'),
  await scenario('Shift-Tab outdents it again', '- a\n  - b┃\n', ['Shift+Tab'], '- a\n- b\n'),
  await scenario('Alt-Up moves an item with its children', '- a\n- b┃\n  - c\n', ['Alt+ArrowUp'], '- b\n  - c\n- a\n'),
  await scenario('Alt-Down and back', '- a┃\n- b\n', ['Alt+ArrowDown', 'Alt+ArrowUp', 'Alt+ArrowDown'], '- b\n- a\n'),
  await scenario('Enter splits, typing goes into the new item', '- one┃two\n', ['Enter', 'type:X'], '- one\n- Xtwo\n'),
  await scenario('Enter on an empty nested item outdents it', '- a\n  - b┃\n', ['Enter', 'Enter', 'type:c'], '- a\n  - b\n- c\n'),
  await scenario('Backspace at an item start joins it upward', '- one\n- two┃\n', ['Home', 'Backspace'], '- onetwo\n'),
  await scenario('Delete at a parent\'s end joins its first child', '- abc┃\n  - def\n', ['Delete', 'type:X'], '- abcXdef\n'),
  await scenario('Enter in a paragraph makes a new paragraph', 'para┃\n', ['Enter', 'type:x'], 'para\n\nx\n'),
  await scenario('Enter in a code block is CodeMirror\'s', '```\ncode┃\n```\n', ['Enter', 'type:x'], '```\ncode\nx\n```\n'),
  await scenario('Enter in an ordered list renumbers', '1. a┃\n2. b\n', ['Enter', 'type:x'], '1. a\n2. x\n3. b\n'),
  await scenario('Enter on a task continues the checkbox', '- [x] done┃\n', ['Enter', 'type:next'], '- [x] done\n- [ ] next\n'),
  await scenario('a rejected command leaves the text alone', '- a┃\n- b\n', ['Tab'], '- a┃\n- b\n'.replace('┃', '')),
  await scenario('typing keeps the outline in sync for the next command', '- a\n- b┃\n', ['type: and more', 'Tab', 'Shift+Tab'], '- a\n- b and more\n'),
  await scenario('undo restores the text after a command', '- a\n- b┃\n', ['Tab', 'Control+z'], '- a\n- b\n'),
  await scenario('heading Tab demotes the section', '# A\n## B┃\n### C\n', ['Tab'], '# A\n### B\n#### C\n'),
  await scenario('Enter, Tab, type: a new child', '- a┃\n', ['Enter', 'Tab', 'type:x'], '- a\n  - x\n'),
  await scenario('Enter, Tab, leave: the empty child stays, a blank line above it', '- a┃\n- b\n', ['Enter', 'Tab', 'ArrowDown', 'ArrowDown'], '- a\n\n  - \n- b\n'),
  await scenario('Deleting a child\'s last character keeps it, also after leaving', '- a\n  - b┃\n', ['Backspace', 'ArrowUp'], '- a\n\n  - \n'),
  await scenario('Undo after leaving brings the empty child back', '- a┃\n', ['Enter', 'Tab', 'ArrowUp', 'Control+z', 'type:x'], '- a\n  - x\n'),
  await scenario('Delete at an item\'s text start keeps its child; typing fills the place', '- ┃a b\n  - c\n', ['Delete', 'type:x'], '- x b\n  - c\n'),
  await scenario('Delete at an item\'s text start, then leave: the surplus space goes', '- ┃a b\n  - c\n', ['Delete', 'ArrowDown'], '- b\n  - c\n'),
  await scenario('Enter twice ends the list', '- a┃\n', ['Enter', 'Enter', 'type:text'], '- a\n\ntext\n'),
  await scenario('Enter twice mid-list splits it', '- a┃\n- b\n', ['Enter', 'Enter', 'type:p'], '- a\n\np\n\n- b\n'),
  await scenario('Enter before a typed marker makes two items', '- abc ┃- def\n', ['Enter'], '- abc\n- def\n'),
  await scenario('Shift-Enter breaks a line inside the item', '- one┃ two\n', ['Shift+Enter', 'type:x'], '- one\n  xtwo\n'),
  await scenario('Shift-Enter at the end, then type: same item, two lines', '- one┃\n- b\n', ['Shift+Enter', 'type:two', 'Tab'], '- one\n  two\n- b\n'),
  await scenario('Shift-Enter then leave: the empty line goes away', '- one┃\n- b\n', ['Shift+Enter', 'ArrowDown'], '- one\n- b\n'),
  await scenario('Backspace undoes Shift-Enter', '- one┃two\n', ['Shift+Enter', 'Backspace'], '- onetwo\n'),
  await scenario('Backspace after Enter twice returns to the list', '- a┃\n', ['Enter', 'Enter', 'Backspace', 'type:b'], '- ab\n'),
  await scenario('Shift-Enter twice: a second paragraph in the item', '- one┃\n- two\n', ['Shift+Enter', 'Shift+Enter', 'type:para'], '- one\n\n  para\n- two\n'),
  await scenario('Home goes to the text start, again to the line start', '- [ ] task┃\n', ['Home', 'type:X', 'Home', 'Home', 'type:Y'], 'Y- [ ] Xtask\n'),
  await scenario('Shift-Home selects to the text start', '- abc┃\n', ['Shift+Home', 'type:Z'], '- Z\n'),
  await scenario('Enter at the end of a parent makes a first child', '- a┃\n  - b\n', ['Enter', 'type:new'], '- a\n  - new\n  - b\n'),
  await scenario('Paste places a tab list as nodes in a two-space list', '- top\n  - sib┃\n', ['paste:- a\n\t- b\n'], '- top\n  - sib\n  - a\n    - b\n'),
  await scenario('Paste of one line is plain text', '- a┃\n', ['paste: and more'], '- a and more\n'),
  await scenario('Backspace joins text into an empty item above', '- \n- ┃b\n', ['Backspace', 'type:X'], '- Xb\n'),
  await scenario('Delete on an empty item pulls its child up', '- ┃\n  - a\n', ['Delete', 'type:X'], '- Xa\n'),
  await scenario('Mod-Backspace stops at the text start', '- alpha beta┃\n', ['Control+Backspace', 'type:x'], '- x\n'),
];

if (screenshot) {
  await page.reload();
  await page.waitForFunction(() => 'ourusDemo' in window);
  // put the caret on a nested item so the panel and the editor show the current node
  await page.evaluate(() => {
    const d = (window as unknown as { ourusDemo: Demo & { view: { dispatch(s: unknown): void } } }).ourusDemo;
    const pos = d.text().indexOf('and this one');
    d.view.dispatch({ selection: { anchor: pos + 3 } });
  });
  await page.focus('.cm-content');
  await page.keyboard.press('Alt+ArrowUp');
  await page.screenshot({ path: screenshot });
}

await browser.close();
await ctx.dispose();
if (errors.length) console.log('page errors:\n' + errors.join('\n'));
const failed = results.filter((r) => !r).length;
console.log(`${results.length - failed}/${results.length} scenarios passed`);
process.exit(failed || errors.length ? 1 : 0);
