// The property tests' seed, preloaded (`node --import ./test/lib/fc-seed.ts --test …`). `npm test` and
// `npm run test:fast` run every property on one fixed seed, so a failure there is a change in the code,
// not a new random note finding an old bug (B479 was found that way). `npm run test:fuzz` runs them on a
// fresh random seed (fast-check reports it with a failure, `FC_SEED=<n>` replays it): run it each round
// beside the volume runs and triage what it finds into `test/bugs.ts`.
import fc from 'fast-check';

const seed = process.env.FC_SEED ?? '20261113';
if (seed !== 'random') fc.configureGlobal({ seed: Number(seed) });
