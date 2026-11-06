# test/

`npm test` is the full run, what CI runs on every push: the typecheck (`npm run typecheck`: the
sources, the tests, and the demos, each a host of the API) and the fast suite,
then every report below side by side, on a frozen copy of the tree, one line each. It exits 1 on any
failure. `npm run test:fast` is the quick one for development: the typecheck, then the unit tests
(`*.test.ts`) and the spec (`spec/*.md`, played by `spec.test.ts`), plus a few-second slice of the
generated-notes reports (`generated.test.ts`) and the lint on the sources (`lints.test.ts`: no array
spread into a call but one said bounded).
`node test/heavy.ts [types fast view inverse diff conserve sweep sessions extremes bugs]` runs some; a single report can
also be run on its own, `node test/sweep.ts`. `TEST_BASE_REV` names the commit `diff` and `inverse` compare
with (`HEAD` by default; CI's is the one before). `diff` fails on regressions: a run that fails to write
in both copies is a known bug, in `test/bugs.ts`.

Each report groups what it finds and holds each group's count to a baseline (`*.baseline.json`) on
the same corpus: a new kind of failure, or more of one, fails the run; fewer does not, so a fix
lowers a count and `…_UPDATE=1` records it. A throw always fails. The baselines freeze today's known
bugs, so a green run means nothing got worse, not that nothing is wrong. When the corpus changes (a
spec edit, `lib/generated-notes.ts`) the counts are not compared until the baseline is recorded again.

A count can hide one case fixed and another broken, so `conserve.ts`, `sweep.ts` and `sessions.ts` keep
cases too: their checks are `lib/report-checks.ts`'s, one case at a time, and an update (`…_UPDATE=1`)
keeps up to ten cases a group (sessions' shrunk) in `bugs-untriaged.json`, with the ones kept before
that still fail. They are the failures nobody has filed yet; `bugs.ts` replays them (below).

| script | corpus | what it checks |
| --- | --- | --- |
| `inverse.ts` | every start buffer of the spec, and `lib/generated-notes.ts`'s notes | pairs that undo each other (Enter/Backspace, indent/outdent, move up/down, cut/paste, drag/drag back) at every caret; write failures and exceptions |
| `copy-paste.ts` | the spec's starts | duplicate against copy plus paste |
| `drops.ts`, `view-exhaustive.ts`, `differential.ts` | the spec | drops, the view's invariants, the last commit's outcomes against this tree's |
| `conserve.ts` | `lib/generated-notes.ts` | HTML export then import renders the same; every clipboard pasted at many carets keeps every letter |
| `sweep.ts` | `lib/generated-notes.ts`, and the same with an odd character put in | every command at every caret: no throw, no write failure, selection in range, `changes` give the text, endings and final newline kept; copy then paste into an empty note gives the same blocks; cut then paste at the caret it leaves gives every letter back, and every code, math and table block its text |
| `sessions.ts` | `lib/generated-notes.ts` | 20 random actions a user takes, through the player (history, folds, zoom): no throw, no write failure, `assertViewHolds` after each applied command, no mark lost on a line a command didn't change, undoing all gives the note back |
| `volume.ts` (`npm run test:volume`, not in `npm test`) | `lib/generated-notes.ts`, drawn afresh each round | `sessions.ts`'s check over 100,000 sessions; what it finds is kept untriaged |
| `extremes.ts` | a note 10,000 levels deep, one of 200,000 siblings, HTML as deep and as wide | the public API throws nothing: no recursion past the stack, no array past the limit on arguments |

## Open bugs

`test/bugs.ts` is the tracker of open bugs: each with all that is known about it in a comment, and
cases asserting what should happen, so they fail while it is open (`npm run bugs`). A case that passes
is reported fixed and fails the run until it moves to a proper test file, as `test(name, fn)`. A case
that fails another way than `bugs.baseline.json` recorded is reported too; `BUGS_UPDATE=1` records it,
with the counts atop that file: overall by priority, and how many bugs in each cluster.
`node test/bugs.ts B212` shows one bug. `npm test` runs it. `lib/index.ts` holds what the cases use, in any test file.

After the bugs it replays the untriaged cases (`bugs-untriaged.json`, through their reports' checks,
`lib/untriaged.ts`), counted by group. One that passes now, or fails in another group, fails the run;
`BUGS_UPDATE=1` drops or regroups it. Triage files a case by its id (the first key of its line): in
the body of the bug's case that stands for it, `// kept: <id> …`, a new bug or one it joins. A filed
case is kept no more, by the reports or the volume run; one filed still in the file fails the run until
`BUGS_UPDATE=1` drops it.

## Reading a failure

A group is a kind of failure (`enter: write-failed (readback children)`), its run count, and a few
examples: the note, its config, the caret, and for `sessions.ts` the shortest actions that still
fail. A write failure (`OurusFailed`) means the writer had no rule for a layout, or the text a command
wrote did not read back as the draft it meant: a bug in ourus, not a refusal. Its group is its phase
and code (`writeFailedKind`): `readback children`, `writer moved-indent`, ... Reproduce one with

```ts
const result = executeCommand(OurusView.of(OurusDoc.parse(text, { config }), { selection: caret }), { type: 'enter' });
```

and shrink the note by lines, then characters.

## Environment

`INVERSE_GENERATED`, `CONSERVE_GENERATED`, `SWEEP_GENERATED` (notes), `SESSIONS` and `SESSIONS_SEED`
change a corpus; `…_EXAMPLES` shows more examples per group. Seeds are fixed in `lib/generated-notes.ts`, so the
same run gives the same report.

## Adding a block shape

A shape that breaks in real notes belongs in `BLOCKS` in `lib/generated-notes.ts`; every report above then plays
it in combination with the others. Re-record the baselines once the new counts are read.
