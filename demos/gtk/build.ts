// Builds dist/ourus-gtk.js: the demo and ourus in one file, for GJS (GNOME's JavaScript, with GTK
// built in; Debian's gjs package). Then, with GTK 4 on the system:
//   node demos/gtk/build.ts
//   gjs -m demos/gtk/dist/ourus-gtk.js

import { chmodSync } from 'node:fs';
import * as esbuild from 'esbuild';

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
