#!/usr/bin/env node
// Builds the demo bundle; `--serve` also serves the demo and rebuilds on change.
//   node demos/cm6/build.ts [--serve] [--port 8000]
//   node demos/cm6/build.ts --help   # this, and stop

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { bundleOptions } from './bundle.ts';

// --help: the comment at the top of this file; an argument it doesn't list is an error, never a build
{
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    const lines = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n');
    const usage = lines.slice(1, lines.findIndex((line, i) => i > 0 && !line.startsWith('//')));
    console.log(usage.map((line) => line.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(0);
  }
  const unknown = args.filter((a, i) => a !== '--serve' && a !== '--port' && !(args[i - 1] === '--port' && /^\d+$/.test(a)));
  if (unknown.length) {
    console.error(`no such option: ${unknown.join(', ')} (--help lists them)`);
    process.exit(2);
  }
}

const here = new URL('.', import.meta.url).pathname;
const serve = process.argv.includes('--serve');
const portArg = process.argv.indexOf('--port');
const port = portArg > 0 ? Number(process.argv[portArg + 1]) : 8000;

const ctx = await esbuild.context({ ...bundleOptions, sourcemap: true, logLevel: 'info' });

if (serve) {
  await ctx.watch();
  const { hosts, port: actual } = await ctx.serve({ servedir: here, port });
  console.log(`demo at http://${hosts[0] ?? 'localhost'}:${actual}/`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
