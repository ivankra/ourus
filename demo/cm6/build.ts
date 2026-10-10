// Builds the demo bundle; `--serve` also serves the demo and rebuilds on change.
//   node demo/cm6/build.ts [--serve] [--port 8000]

import * as esbuild from 'esbuild';

const here = new URL('.', import.meta.url).pathname;
const serve = process.argv.includes('--serve');
const portArg = process.argv.indexOf('--port');
const port = portArg > 0 ? Number(process.argv[portArg + 1]) : 8000;

const ctx = await esbuild.context({
  entryPoints: [here + 'main.ts'],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  outfile: here + 'dist/main.js',
  sourcemap: true,
  logLevel: 'info',
});

if (serve) {
  await ctx.watch();
  const { hosts, port: actual } = await ctx.serve({ servedir: here, port });
  console.log(`demo at http://${hosts[0] ?? 'localhost'}:${actual}/`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
