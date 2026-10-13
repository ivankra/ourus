// Extracts the examples of a CommonMark-style spec file (`spec.txt`, `extensions.txt`, ...) as a
// JSON fixture for test/parser/spec.test.ts:
//   node src/parser/tools/spec-fixtures.ts path/to/spec.txt > test/fixtures/name.json
// An example's fence info after `example` lists the extensions it runs with (cmark-gfm's runner
// convention); `disabled` ones are kept but marked. Tabs are drawn as `→` in the files.

import { readFileSync } from 'node:fs';

const fence = '`'.repeat(32);
const lines = readFileSync(process.argv[2]!, 'utf8').split('\n');
const out: { example: number; section: string; extensions: string[]; markdown: string; html: string }[] = [];
let state = 0;
let markdown: string[] = [];
let html: string[] = [];
let extensions: string[] = [];
let section = '';
for (const line of lines) {
  const l = line.trim();
  if (l.startsWith(fence + ' example')) {
    state = 1;
    extensions = l.slice(fence.length + ' example'.length).split(/\s+/).filter(Boolean);
  } else if (l === fence && state) {
    state = 0;
    out.push({ example: out.length + 1, section, extensions, markdown: markdown.join('').replaceAll('→', '\t'), html: html.join('').replaceAll('→', '\t') });
    markdown = [];
    html = [];
  } else if (l === '.' && state === 1) state = 2;
  else if (state === 1) markdown.push(line + '\n');
  else if (state === 2) html.push(line + '\n');
  else if (/^#+ /.test(line)) section = line.replace(/^#+ /, '').trim();
}
process.stdout.write(JSON.stringify(out, null, 1) + '\n');
