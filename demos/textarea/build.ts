#!/usr/bin/env node
// Builds dist/main.js; then open index.html in a browser, as a file.
//   node demos/textarea/build.ts
//   node demos/textarea/build.ts --help   # this, and stop

import { readFileSync } from 'node:fs';
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
// a classic script, not a module: browsers refuse module scripts from file:// URLs
await esbuild.build({ entryPoints: [here + 'main.ts'], bundle: true, format: 'iife', target: 'es2022', outfile: here + 'dist/main.js' });
