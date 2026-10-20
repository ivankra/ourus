// Builds dist/main.js; then open index.html in a browser, as a file.
//   node demos/textarea/build.ts

import * as esbuild from 'esbuild';

const here = new URL('.', import.meta.url).pathname;
// a classic script, not a module: browsers refuse module scripts from file:// URLs
await esbuild.build({ entryPoints: [here + 'main.ts'], bundle: true, format: 'iife', target: 'es2022', outfile: here + 'dist/main.js' });
