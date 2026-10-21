#!/usr/bin/env node
// Builds dist/ourus-gtk.js: the demo and ourus in one file, for GJS (GNOME's JavaScript, with GTK
// built in; Debian's gjs package). Then, with GTK 4 on the system:
//   node demos/gtk/build.ts
//   gjs -m demos/gtk/dist/ourus-gtk.js
//   node demos/gtk/build.ts --help   # this, and stop

import { chmodSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

// --help: the comment at the top of this file; an argument it doesn't list is an error, never a build
{
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    const lines = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n');
    const usage = lines.slice(1, lines.findIndex((line, i) => i > 0 && !line.startsWith('//')));
    console.log(usage.map((line) => line.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(0);
  }
  const unknown = args;
  if (unknown.length) {
    console.error(`no such option: ${unknown.join(', ')} (--help lists them)`);
    process.exit(2);
  }
}

const here = new URL('.', import.meta.url).pathname;
const outfile = here + 'dist/ourus-gtk.js';
await esbuild.build({
  entryPoints: [here + 'main.js'],
  bundle: true,
  platform: 'neutral',
  format: 'esm',
  target: 'es2022',
  external: ['gi://*'], // GJS's own
  banner: { js: '#!/usr/bin/env -S gjs -m' },
  outfile,
});
chmodSync(outfile, 0o755);
