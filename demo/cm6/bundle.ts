// The demo bundle's esbuild options, for build.ts and smoke.ts: the script, and its CSS (highlight.js's
// theme, KaTeX's with its fonts) beside it as dist/main.css. A classic script, not a module, so the
// page also works opened as a file (browsers refuse module scripts from file:// URLs).

import type { BuildOptions } from 'esbuild';

const here = new URL('.', import.meta.url).pathname;

export const bundleOptions: BuildOptions = {
  entryPoints: [here + 'main.ts'],
  bundle: true,
  format: 'iife',
  target: 'es2022',
  outfile: here + 'dist/main.js',
  loader: { '.woff2': 'file', '.woff': 'file', '.ttf': 'file' },
};
