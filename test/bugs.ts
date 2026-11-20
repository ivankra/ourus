#!/usr/bin/env node
// The open bugs: the tracker, not a test of what works. Each bug is a comment saying all that is known
// about it, and its cases, each asserting what should happen, so each fails while the bug is open.
//
//   npm run bugs                  # the report: what is open, and what got fixed or changed
//   node test/bugs.ts B212 B223   # those bugs, each case and how it fails
//   BUGS_UPDATE=1 npm run bugs    # record how the cases fail now, once read
//
// A case that passes is reported fixed, and fails the run until it moves: cut it out, paste it into
// the test file it belongs in as `test(name, fn)`, with the imports it uses from `lib/index.ts`
// (or as a spec case, with its exact result), and take the bug out when its last case has gone.
// `assertNoWriteFailure` says only that nothing went wrong: a moved case should assert the exact result.
//
// After the bugs, the cases the reports over generated notes found and nobody has filed yet
// (`bugs-untriaged.json`, each replayed through its report's check). Triage moves one here, under the
// bug it is: a new one, or one it joins.
//
// The report says what changed, and any of these fails the run:
//
//   untriaged an untriaged case passes, fails in another group, or is filed: BUGS_UPDATE=1 drops or
//             regroups it
//   fixed     a case passes
//   changed   a case fails another way than `bugs.baseline.json` recorded: read why, then record it
//   summary   the counts atop `bugs.baseline.json` aren't this file's: record them
//   new       a case with nothing recorded
//   broken    a case threw from test code, not from `src/`: the repro is wrong, not the bug
//   id        a bug's id is taken, or isn't below the next id
//
// A throw from `src/` is the bug itself, as an uncaught throw is. A `policy` bug's case asserts one of
// the answers, the one its comment leans to: a decision can delete it. Priorities (P1 to P4), the
// mechanisms the bugs share, and what isn't a bug yet are in dev/next.md.
//
// A new bug takes `NEXT_BUG_ID`, at the end of this file, and raises it. A kept case triaged is filed
// by its id (`bugs-untriaged.json`'s), in a comment in the body of the bug's case that stands for it,
// `// kept: <id> <id> …`: the reports keep it no more, the counts held to their baselines still.
//
// Offsets are UTF-16; node ids are a fresh parse's; ⏎ a line break, ┃ the caret, ┃◌ a held empty line,
// ␠ a space, ⍽ a no-break space, → a tab.

import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  executeCommand,
  leavesZoom,
  mapPos,
  MdFlavor,
  MdHtmlParser,
  MdTree,
  OurusDoc,
  OurusProse,
  OurusFailed,
  OurusRejected,
  OurusSuccess,
  OurusView,
  settlePlaceholders,
} from '../src/index.ts';
import * as extend from '../src/parser/extend.ts';
import { defineFlavor, gfmExtensions } from '../src/parser/extend.ts';
import {
  appliedText,
  assertApplied,
  assertNoWriteFailure,
  convertPastedHtml,
  executeAfter,
  executeOnText,
  firstBlockInlines,
  caseId,
  filedCases,
  htmlFailures,
  lostMarksOnText,
  readUntriaged,
  REPORT_OF,
  untriagedFailures,
  writeUntriaged,
  type UntriagedCase,
} from './lib/index.ts';

// -------------------------------------------------------------------------------------------------
// The runner

type Priority = 'P1' | 'P2' | 'P3' | 'P4';
/** A bug's priority, and whether its behavior is a decision still to make or it is fixed in part. */
type BugRank = Priority | `${Priority} policy` | `${Priority} partly fixed`;

interface OpenBug {
  readonly id: string;
  readonly rank: BugRank;
  readonly title: string;
  readonly cluster: string;
  readonly cases: Readonly<Record<string, () => void>>;
}

type CaseOutcome = { readonly kind: 'passed' } | { readonly kind: 'failed' | 'broken'; readonly message: string };

const bugs: OpenBug[] = [];
let currentCluster = '';

/** The cluster the bugs after it belong to: findings that share a mechanism. */
function bugCluster(name: string): void {
  currentCluster = name;
}

/** An open bug: `cases`, by name, are what a test of the fix asserts, each ready for `test(name, fn)`. */
function openBug(id: string, rank: BugRank, title: string, cases: OpenBug['cases']): void {
  bugs.push({ id, rank, title, cluster: currentCluster, cases });
}

/** The first frame of `error` outside node's own code. */
function throwingFrame(error: Error): string {
  return error.stack?.split('\n').find((line) => line.trim().startsWith('at ') && !line.includes('node:')) ?? '';
}

/** How `error` failed, as a baseline holds it: what an assertion got where it says, on one line. */
function failureSignature(error: Error): string {
  const got =
    error instanceof assert.AssertionError && error.generatedMessage
      ? `got ${JSON.stringify(error.actual)}`
      : error.message;
  return got.replaceAll('\n', '⏎').slice(0, 160);
}

function playCase(run: () => void): CaseOutcome {
  try {
    run();
    return { kind: 'passed' };
  } catch (thrown) {
    const error = thrown as Error;
    const isBug = error instanceof assert.AssertionError || throwingFrame(error).includes('/src/');
    return { kind: isBug ? 'failed' : 'broken', message: failureSignature(error) };
  }
}

/** Bugs counted by priority. */
interface BugCounts {
  open: number;
  P1: number;
  P2: number;
  P3: number;
  P4: number;
  policy: number;
}

/** What `bugs.baseline.json` holds: the bugs' counts, overall by priority and per cluster, and how each case fails. */
interface BugBaseline {
  readonly summary: ReturnType<typeof bugSummary> | null;
  readonly failures: Record<string, string>;
}

/** The bugs in this file, counted: by priority, and how many in each cluster. */
function bugSummary(): BugCounts & { cases: number; clusters: Record<string, number> } {
  const none = (): BugCounts => ({ open: 0, P1: 0, P2: 0, P3: 0, P4: 0, policy: 0 });
  const add = (counts: BugCounts, bug: OpenBug): void => {
    counts.open++;
    counts[bug.rank.slice(0, 2) as Priority]++;
    if (bug.rank.endsWith('policy')) counts.policy++;
  };
  const total = none();
  const clusters: Record<string, number> = {};
  for (const bug of bugs) {
    add(total, bug);
    clusters[bug.cluster] = (clusters[bug.cluster] ?? 0) + 1;
  }
  return { ...total, cases: bugs.reduce((n, bug) => n + Object.keys(bug.cases).length, 0), clusters };
}

/** Why the bugs' ids don't hold: each one once, and each below `nextId`, the one a new bug takes. */
function idProblems(nextId: number): string[] {
  const seen = new Set<string>();
  const problems: string[] = [];
  for (const { id } of bugs) {
    if (seen.has(id)) problems.push(`id       ${id} is on two bugs`);
    seen.add(id);
    if (Number(id.slice(1)) >= nextId) problems.push(`id       ${id} isn't below NEXT_BUG_ID, ${nextId}: raise it`);
  }
  return problems;
}

/** Plays the bugs, or those `process.argv` names, prints the report, and sets the exit code. */
/**
 * The cases kept untriaged (`bugs-untriaged.json`, the reports' over generated notes) replayed through
 * their reports' checks: each still fails in its group, else it is `untriaged` in `attention`, passing
 * now or failing otherwise; an update drops the ones that pass and puts the others in the group they
 * fail in first; a case filed (its id in a `// kept:` comment of a bug's case, `filedCases`) goes too.
 */
function reportUntriaged(attention: string[], update: boolean): void {
  const filed = filedCases();
  const cases = readUntriaged();
  const now: UntriagedCase[] = [];
  const groups = new Map<string, { cases: number; changed: number }>();
  for (const c of cases) {
    let kinds: string[];
    try {
      kinds = untriagedFailures(c);
    } catch (e) {
      kinds = [`${c.check} threw: ${(e as Error).message.split('\n')[0]!.slice(0, 80)}`];
    }
    const name = `${REPORT_OF[c.check]}: ${c.group}`;
    const group = groups.get(name) ?? { cases: 0, changed: 0 };
    group.cases++;
    groups.set(name, group);
    const id = caseId(c);
    const shown = `${id} ${JSON.stringify(c.text).slice(0, 70)} ${c.check}${'actions' in c ? ` ${c.actions.join(' ')}` : ''}`;
    const owner = filed.get(id);
    if (owner) {
      group.changed++;
      attention.push(`untriaged  ${name}: filed in ${owner}: BUGS_UPDATE=1 drops it\n           ${shown}`);
    } else if (kinds.includes(c.group)) now.push(c);
    else {
      group.changed++;
      if (kinds.length) now.push({ ...c, group: kinds[0]! });
      attention.push(
        kinds.length
          ? `untriaged  ${name}: fails otherwise now, ${kinds[0]}\n           ${shown}`
          : `untriaged  ${name}: passes now\n           ${shown}`,
      );
    }
  }
  console.log(`untriaged: ${cases.length} cases in ${groups.size} groups (test/bugs-untriaged.json)`);
  for (const [name, group] of [...groups].sort((a, b) => b[1].cases - a[1].cases || (a[0] < b[0] ? -1 : 1))) {
    console.log(`${String(group.cases).padStart(5)}  ${name}${group.changed ? ` (${group.changed} changed)` : ''}`);
  }
  if (update) writeUntriaged(now);
}

function reportBugs(nextId: number): void {
  const baselineFile = join(import.meta.dirname, 'bugs.baseline.json');
  const recorded: BugBaseline = existsSync(baselineFile)
    ? JSON.parse(readFileSync(baselineFile, 'utf8'))
    : { summary: null, failures: {} };
  const baseline = recorded.failures;
  const asked = process.argv.slice(2);
  const played = asked.length ? bugs.filter((bug) => asked.includes(bug.id)) : bugs;
  const failures: Record<string, string> = {};
  const summary = bugSummary();
  const attention = idProblems(nextId);
  if (JSON.stringify(recorded.summary) !== JSON.stringify(summary))
    attention.push('summary  the counts in bugs.baseline.json are out of date: BUGS_UPDATE=1 records them');
  const stillOpen: OpenBug[] = [];
  for (const bug of played) {
    let open = false;
    for (const [name, run] of Object.entries(bug.cases)) {
      const key = `${bug.id}: ${name}`;
      const outcome = playCase(run);
      if (outcome.kind === 'passed') {
        attention.push(`fixed    ${key}`);
        continue;
      }
      // (a broken repro says nothing of the bug: it stays open)
      open = true;
      if (outcome.kind === 'broken') {
        attention.push(`broken   ${key}\n           ${outcome.message}`);
        continue;
      }
      failures[key] = outcome.message;
      if (key in baseline && baseline[key] !== outcome.message)
        attention.push(`changed  ${key}\n           was ${baseline[key]}\n           now ${outcome.message}`);
      if (!(key in baseline)) attention.push(`new      ${key}\n           ${outcome.message}`);
      if (asked.length) console.log(`${key}\n  ${outcome.message}`);
    }
    if (open) stillOpen.push(bug);
    else attention.push(`FIXED    ${bug.id} ${bug.title}: every case passes, take it out of test/bugs.ts`);
  }
  const count = (prefix: string): number => stillOpen.filter((bug) => bug.rank.startsWith(prefix)).length;
  console.log(
    `${stillOpen.length} open bugs: ${count('P1')} P1, ${count('P2')} P2, ${count('P3')} P3, ${count('P4')} P4; ${stillOpen.filter((bug) => bug.rank.endsWith('policy')).length} policy`,
  );
  if (!asked.length) {
    const clusters = new Map<string, number>();
    for (const bug of stillOpen) clusters.set(bug.cluster, (clusters.get(bug.cluster) ?? 0) + 1);
    for (const [cluster, open] of clusters) console.log(`${String(open).padStart(5)}  ${cluster}`);
    console.log(
      `P1: ${stillOpen
        .filter((bug) => bug.rank.startsWith('P1'))
        .map((bug) => bug.id)
        .join(' ')}`,
    );
    console.log(`next id: B${nextId}`);
  }
  // the cases the reports found that nobody filed: with every bug played, not some
  if (!asked.length) reportUntriaged(attention, process.env.BUGS_UPDATE === '1');
  if (process.env.BUGS_UPDATE === '1') {
    // (only the bugs played: the others keep what they had, but a bug taken out keeps nothing; sorted
    // by id, so a diff shows what moved)
    const owner = (key: string): OpenBug | undefined => bugs.find((bug) => key.startsWith(`${bug.id}: `));
    const kept = Object.entries(baseline).filter(([key]) => owner(key) && !played.includes(owner(key)!));
    const sorted = [...kept, ...Object.entries(failures)].sort(([a], [b]) =>
      a.localeCompare(b, 'en', { numeric: true }),
    );
    writeFileSync(baselineFile, `${JSON.stringify({ summary, failures: Object.fromEntries(sorted) }, null, 2)}\n`);
    console.log('baseline recorded');
    return;
  }
  if (attention.length) {
    console.log(`\n${attention.join('\n')}`);
    process.exitCode = 1;
  }
}

// =================================================================================================
// Kept cases that are no bug
//
// A kept case read and found no bug of ourus, its id here (`filedCases` reads these too), with why.
//
// The marks check maps a mark through a command's changes, which for identical lines are one diff of
// several: duplicating an empty item beside another moves the held one's placeholder with it, to the
// copy's place by the diff.
// not a bug: 7a010ff810ea
//
// The same, Enter at a text's end before a raised blank line, a duplicate whose copy now ends the
// list, a held line moved up past it (seed 51's): the mark kept, on the blank line that sets the same
// blocks apart, the check's diff of identical line breaks putting it a line on.
// not a bug: 04a039c01f60 1557892b2f34 5eec30bebd53 7d0d5b5ef89a b4ad5e932a75 0ac28e7cc680 0f690adf4f89
// not a bug: 4f53bb1cf551 73545bcaadf3 73753a90cd55 9323458732be 9defa38e2083 be57868d8ed0 240c15a7cd2d
// not a bug: 77008b80300e b4c0b7f31084 a144e84d71df
//
// The second run of seed 51 (2026-11-11), the same check: 54 cases, where the mark was kept on
// another line of its run of blank lines, or ourus took its own line out first and kept the author's.
// The check counts the marks in each run now (`autoLost`, decided 2026-11-11), which passes 47 of
// them. The 7 left are moves that carry a run elsewhere (identical items swapped, a held line taken
// into a quote) and pastes onto the author's blank line beside ours, which a count can't tell apart.
// not a bug: 4c1a0dde79ad 77b61a6beefa 62d9bacde6e2 7772caf03f05 818dd509cbdc 9b3e1d16281e d552861e146c
//
// The third run of seed 51 (2026-11-11), the check counting by run, a held line an empty block's: the
// blank lines after a fence or a comment nothing closes, its text's now (B205's rule); identical
// blocks swapped, the mark with the copy the diff puts it on; a paste of what is beside it; a quote's
// own blank line, unquoted, the paragraph's, ours dropped, a quote interrupting a paragraph.
// not a bug: 058acbf4227c b22bf15e950c c193bf928fa4 2226bc2f7cf6 38ff4f486367 464266dd9c44 64f4485271be
// not a bug: 76c8a9422544 8f63cf1ebb3a 9fc78be54737 d668b223bf4c 5e68de1b7416 84846a2e55c3 1d7d28040a67
//
// Seed 101's (2026-11-11): identical blocks swapped or duplicated; blank lines after a block nothing
// closes, its text's; Backspace unquoting a line, the quote's own blank line the one kept; ours dropped
// first where the blank lines grow fewer, the author's kept (a move, a delete at the note's end), which
// the check, counting only the runs a mark is in, can't see.
// not a bug: 001c0e847fb1 309c927fbb8a be4219a2297c 26bb7da60fb6 47aafb3e36e8 91decdcec21e 11e7b7b46632
// not a bug: ebb8e0fa064f 5bc39c8dae09 e033bb18c5e6 34681eba4892 14d4b420a3b9 2c8420b16758 4a02a3b14b9e
// not a bug: 52ebd72f1f13 a0b05884c2f7 e7fbc7131e75 f21fb9e8cde1 03cd80cce50a 360ed02abdd0 3e0f972f8414
// not a bug: 61347cb4b13e 9544d0842dfa af758d5388b2 ba76b4f0dac5 e9b0272b604a eb9c71ee3d2f f346b0b700c2
// not a bug: 4be62b249b07 60ea1998d660 e17a59885590 70d3e30fd6a3
//
// Seed 151's (2026-11-11): identical blocks swapped, deleted or moved past each other, the mark with
// the copy the check's diff puts it on; a paragraph moved up tight above code, the raised line after
// it no longer needed, the author's kept.
// not a bug: 256f881dd0ac 3adfffd5270b 260a466c459b 3eb21f567d1d 40d920215090 559530a184b9 5758f6427fac
// not a bug: 5a5f95ddc00a aeb7adcf5e08 d2101126bef6 fcd48674d2f5
//
// Seed 201's (2026-11-12): identical blocks swapped or moved past each other, the mark with the copy
// the check's diff puts it on; the raised line before a quote, a list or a rule after the paragraph
// it follows dropped, which interrupts the paragraph without one.
// not a bug: 6fa976d42f1e 9dd3589024d1 158cd2ba76bf 2889b668fd19 337faf606d4a 56f3162ebfdd 7a6db3646d86
// not a bug: a9e781213f6f b3d188b571b7 c3b33cdbbbd4 d288c2002fa7 d5f4ff4a2acf 513849677259
//
// Seeds 151 and 201: a raised blank line after a fence, math or a comment nothing closes, or in
// it, the code's text by B205's rule, where Enter, Shift-Enter or Backspace puts a line: no mark
// holds on a line of code.
// not a bug: 494d2e2209b6 b8b4690db9c1 625412f91adf 8bf094a613e4 ed325ec1508b c7d80277881c 0d661b914513
// not a bug: a6d17738768d dd0c3e248b17 f0982809084f 23a4d10b0169 32c7c46fbcce 6dff62fa74cd 634d22edd774
//
// The sweep's cut→paste of a note with an odd character in a fence (a line separator, a zero-width
// space, a byte-order mark, an emoji before the closing fence): the code is unclosed there, and the
// paste closes it (PasteList27), its text changed by design.
// not a bug: 13dd8d9ab06a 32d225e4bc7e 34da81cfcdfb 89059c10cfde 79588a880928 b9c1dbd5594b c57297141593
//
// The sweep's cut→paste of a fence or math block right above a list: the caret the cut leaves at the
// first item's text start, the block pasted there is an item of the list (decided with the user
// 2026-11-12, Regression359), not back before it.
// not a bug: 56c704f4d2aa 5b9fc5c6ee96 88ff380ea620 931b3b32d7c2 b47357c98c82
//
// Seed 251: identical blocks swapped, moved past each other or duplicated (the check's diff can't tell
// them apart: the mark moves with the gap, as it does with the texts made different); a raised line
// after a fence, math or a comment nothing closes, the code's text by B205's rule.
// not a bug: 61b4cc24ef76 75aed8cd7f65 c7451e961a3d ce0157898902 d09ccaa7baf9 b1f0e6a34f19 468d047fbb4a
// not a bug: ef93938cd216 dd15f201cfc5 7d836934552e 6dde9bcd8585 75a910f7346d 0a467edf2301 c3c51f453fc9
// not a bug: f2c0572d35d3 2b7cd9244a89 694ecfa67d1a 76d3aa2182d3 c5a624846bf3 c60d731fa1de e4ab6d7b87cb
// not a bug: 7f8306845d53 b720dd01ee87 72ee96c07207 2d2f98eaf755
//
// Seed 301 (2026-11-12): identical blocks a duplicate or a move puts side by side, which the marks
// check's diff of identical lines can't tell apart, the mark kept on one of them.
// not a bug: 280f2a0d7425 33b986fb61ae 793aadb5ab77 9c600b72ec53 a225a7f16bf8 afa029ae867c e8fff777e85b
// not a bug: 70d7e9f17386 d1b2f7a24c63 40b054c57ecc 4bc748c4e1be 53555ca2f53b 72bb439751e0 8a2545c6a782
// not a bug: e19c035020e2 f0a7fee9e408
//
// The same seed: a raised line after a fence, math or a comment nothing closes, that code's text by
// B205's rule.
// not a bug: b908caf2b1df 461ac50d7736 12548fdb53de 111613dad228 1b4a493a1944 1c58d61bcf2c 6381efd8c1f3
// not a bug: 7479340998f2 7e28a50c80f3
//
// Seed 351 (2026-11-12): identical blocks a duplicate or a move puts side by side, the marks check's
// diff of identical lines unable to tell them apart.
// not a bug: 5ba183579b81 ea22674e14d9 007d1d34dcbb 2238d7b595c6 3d82610c9210 48e109fdf8e0 6b064c83d940
// not a bug: 977988802284 a7eed3f661d6 dd623666fe68 680dd6e690a8 e15bea097c52 398d475fc018 49b45970d90f
// not a bug: 934e35584895 bcccc23397af bf814f3bede2 ed7f867ac52b ffdde0fe957a 1df301064c23 507fc1608adc
//
// The same seed: a raised line after code, math or a comment nothing closes, its text by B205's rule.
// not a bug: 2e964b2a57ef 77436c956cde 8ee761186ef8 469c45fe6a70 394c27030c33 8e1e47f445ae 4fa2f4462f85
// not a bug: 5f4689ca9b0b 6953754824ee 882aebff2a26 d59d3afe11c7 025585a81821 5775c25cdab5
//
// Moved from B446 and B444 (2026-11-12, the marks check counting no run beside an identical block):
// identical blocks side by side, `  - child three` twice, `  > n item` twice.
// not a bug: c047a805c647 a18f3d2ab737
//
// Seed 401 (2026-11-12): identical blocks a move puts side by side (two `x`s, two footnotes, two
// empty items renumbered alike), the marks check's diff of identical lines unable to tell them apart.
// not a bug: d9b2f736e676 30399d9c70b6 6763aad578c9 e322711ab000 f9d9d3f9fd55
//
// The same seed: a quote's last paragraph deleted, the one before it keeping its own gap, the
// author's `>` line, written after the quote, not the deleted one's raised line.
// not a bug: efd8ec93d316
//
// Seed 451 (2026-11-12): identical blocks a move puts side by side (two `- next`, footnotes, tables,
// `x`s, `-\``s, paragraphs, held empty items), the marks check's diff of identical lines unable to
// tell them apart.
// not a bug: 00338c7ae6d0 afdd98189ba3 c136dc372148 179b9279384e 4fe65a9ea525 69e62d8d4ea6 72b89b4c5298
//
// The same seed: marks that follow their nodes where the check follows lines: a blank line of ours
// lowered, the author's kept (`> ` written outside the quote, `e78`); an item moved past a paragraph
// with a raised line after it, the item's own blank line, the author's, after it now (`959`).
// not a bug: e78693cc772d 95939394c5ed
//
// Seed 501 (2026-11-13): identical or renumbered blocks side by side (empty items, `N. num`, comments
// spelled `%%` after the move, paragraphs, block-id lines, `- nested bullet`).
// not a bug: ca8753171a99 48a68803d16f 706757dc8a3c 193df622d9fb 25b095e84c69 3aa64675b7f0 4165870c5e88
// not a bug: 81e7e5d5562c c85ad277f0c3 cffae2b952cb e17664e7cfaa 8561f7bb23f3
//
// The same seed: marks that follow their nodes where the check follows lines (a moved paragraph's
// raised line with it, `2c7`; a raised line lowered, the author's kept, `45f`).
// not a bug: 2c7e6df8efc9 45f32c774245
//
// Seed 551 (2026-11-13): identical blocks a move puts side by side (two `x`s, two tables after code,
// `quote` and ` quote` in a numbered quote), and marks that follow their nodes where the check follows
// lines (a moved item's or paragraph's raised line with it; a raised line taken out where the node
// it set apart moved beside a block that needs none, `` ` `` above a fence, a paragraph above a
// heading; ours lowered, the author's kept, a callout's or a quote's empty line).
// not a bug: 78e57dd37f85 7f4e63b3688a 3f8278535d0a ebe388aabfca bb20203b5e06 f5786931d8c8 8e471d940544
// not a bug: 00f168d68a96 05099c1c0dfe 8d93517e3b40 d82664d0cc78 7259b2a5e7c0 2d615a74961b f9d35da1e122
//
// Seed 601 (2026-11-13): identical or renumbered blocks side by side (empty items, `\> a quote`,
// `\# one`, `3.` and `4.` swapped alike), marks that follow their nodes (a moved task's, a moved
// paragraph's, a raised line taken out where its node moved before a quote that needs none).
// not a bug: 47fbebe3a24d 27c05dd7c8df 600ed69697a4 3c87e9d5879c 65cfb8f5fc6a b7d548618481 dc280a8a822f
//
// Seed 651 (2026-11-13): identical blocks side by side (comments, `Fi`s, `more`s, `x`s, empty items),
// marks that follow their nodes, and a raised line taken out where Tab put the paragraph after a
// quote into it, the quote's `>` line setting them apart.
// not a bug: 21fe2c1c42b1 257e4d622043 7167e4e33b59 813c3425b08e b737f3c59c46 59f4413ff934 8c8b67373b90
// not a bug: f9104ae3b103 a501e04cd0ca
//
// Seed 701 (2026-11-13): identical blocks side by side (`## Notes`, `more`, a quote's paragraphs, `x`,
// `- last`, footnotes), a moved paragraph's raised line taken out before a quote, and a line of unclosed
// math, its text by B205's rule.
// not a bug: b18cb42775e2 338e6fe7824a d9ab7914551e 1bb36df14ace 1c213751b897 76419f22a3b5 a474cfd2379d
// not a bug: faa2686a790e
//
// Seed 751 (2026-11-13): identical or renumbered blocks side by side (empty items, callout bodies,
// `\- grandchild`, `se2. second`, tasks), marks that follow their nodes (moved paragraphs and math, a
// raised line taken out before a quote that needs none).
// not a bug: acad41309900 4022613630f8 497873bbbb36 8efb9f5a143e 23117c184124 7280405d0c7b 7935f11badaf
// not a bug: 9c55f692ab5f c0e79526f8b8 f0db6bcdfd11 3ddce417e257
//
// Seed 801 (2026-11-13): identical blocks side by side (quotes, tasks, callout bodies), marks that
// follow their nodes (moved code lines, a paragraph moved past a heading).
// not a bug: 89cf264ac39b 900f18a8d0a5 4daccc7b0645 ba85ecbb0909 e5c391857ddb f445d88eec8d

// =================================================================================================
// Copy, cut and paste (Markdown and plain text)
//
// Pastes the writer can't place where a quote shares an item's line or a lazy paragraph sits in
// nested quotes (B15, B16); a paste where a cut left the caret by a table, code, a rule, a footnote
// or HTML (B21); indented code from a plain-text clipboard dedented (B26); and a text cut ending
// before an item's marker not restored by pasting it back (B188); a bare marker taking in what
// follows it (B193);
// ourus's own clipboard read as a stranger's (B194, B195). The Markdown/plain-text paths only.
bugCluster('Copy, cut and paste (Markdown and plain text)');

// B519 [P4]. An empty item pasted on a numbered list's empty item writes it outside the list, its children read otherwise
//
// Status (2026-11-13): seed 801. `1. first⏎2. ⏎⏎   -⏎⏎     ested bullet` (GFM, `listParent: container`),
// `- ` pasted at `2. `: written `1. first⏎- ⏎   -⏎⏎     ested bullet`, the numbered item gone where
// the draft keeps it: `root: 4 children, read as 2`. The last commit's code fails alike. P4.
openBug(
  'B519',
  'P4',
  "An empty item pasted on a numbered list's empty item writes it outside the list, its children read otherwise",
  {
    'the case reduced': () => {
      // kept: d9e640ab419d
      assertNoWriteFailure(
        executeOnText(
          '1. first\n2. \n\n   -\n\n     ested bullet\n',
          {
            type: 'paste',
            clipboard: {
              'text/plain': '- \n',
              'text/markdown': '- \n',
              'text/html': '<!-- ourus --><ul>\n<li></li>\n</ul>\n',
            },
          },
          { caret: 13, config: { flavor: 'gfm', listParent: 'container' } },
        ),
      );
    },
  },
);

// B458 [P4]. A paste of a setext `--` heading after an item's text reads as more items
//
// Status (2026-11-12): found by the volume run (seed 301). `- x┃` and a clipboard `--⏎-` (ourus's, an `h2`): written `- x⏎- --⏎  -`. P4 (the user's rule: rare, odd spacing or a hand-built mark).
openBug('B458', 'P4', "A paste of a setext `--` heading after an item's text reads as more items", {
  'the case reduced': () => {
    // kept: ef11780359bb
    // kept: a20e7c732d0b (seed 451)
    // kept: 1bb619b2fa56 (seed 551)
    // kept: 16f694994ef0 (seed 801)
    // kept: ae20a2a80ba3 (seed 651)
    assertNoWriteFailure(
      executeOnText(
        '- x\n',
        {
          type: 'paste',
          clipboard: {
            'text/plain': '--\n-\n',
            'text/markdown': '--\n-\n',
            'text/html': '<!-- ourus --><h2>--</h2>\n',
          },
        },
        { caret: 3, config: { flavor: 'gfm', listParent: 'container' } },
      ),
    );
  },
});

// B463 [P4]. A cut leaving a bare task under a lazy `-` reads the task as a setext heading's text
//
// Status (2026-11-12): found by the volume run (seed 351). `- [ ] «write spec [x] outline»⏎  -` (Obsidian, `indentUnit: tab`), cut: written `- [ ] ⏎  -`, the draft has a heading there. P4 (the user's rule: rare, odd spacing or tabs).
openBug('B463', 'P4', "A cut leaving a bare task under a lazy `-` reads the task as a setext heading's text", {
  'the case reduced': () => {
    // kept: b95565e1ed24
    assertNoWriteFailure(
      executeOnText(
        '- [ ] write spec [x] outline\n  -\n',
        { type: 'cut' },
        { anchor: 6, head: 28, config: { flavor: 'obsidian', indentUnit: 'tab' } },
      ),
    );
  },
});

// B476 [P4]. An item pasted on a held line after a task whose text starts below its marker misreads the task's text
//
// Status (2026-11-12): found by the volume run (seed 401). `- [ ] ⏎  x⏎  ◌` (CommonMark or GFM), `- y`
// pasted on the held line: written `- [ ] ⏎  x⏎- y`, the draft's task text `x`, read as `⏎x`. A paste of
// text, not an item, writes. P4 (rare: a task's text on the line below it).
openBug(
  'B476',
  'P4',
  "An item pasted on a held line after a task whose text starts below its marker misreads the task's text",
  {
    'the case reduced': () => {
      // kept: f3b28f1e95b5
      assertNoWriteFailure(
        executeOnText(
          '- [ ] \n  x\n  ',
          { type: 'paste', clipboard: { 'text/plain': '- y\n', 'text/markdown': '- y\n' } },
          { caret: 13, config: { flavor: 'commonmark' }, placeholders: [13] },
        ),
      );
    },
  },
);

// B502 [P4]. A plain paste of nothing over a quote atom's last line leaves its indentation as a blank line
//
// Status (2026-11-13): seed 551. `2. > quote⏎   «> more»` (GFM, `quotes: atom`), a plain paste of
// nothing over the second line: written `2. > quote⏎   ⏎`, the item's indentation left on a line of its
// own, read as a blank line after the item the draft gave none: `root › 0: 0 blank lines after its
// text, read as 1`. The last commit's code fails alike. P4: an empty plain paste over a quote atom's
// line from its `>`.
openBug('B502', 'P4', "A plain paste of nothing over a quote atom's last line leaves its indentation as a blank line", {
  'the case reduced': () => {
    // kept: 94cb7118a112
    // kept: e7f655c1a038 (seed 601: `\n> a quote` pasted plain over a quote atom's lines)
    assertNoWriteFailure(
      executeOnText(
        '2. > quote\n   > more\n',
        { type: 'pastePlain', text: '' },
        { anchor: 14, head: 20, config: { flavor: 'gfm', quotes: 'atom' } },
      ),
    );
  },
});

// =================================================================================================
// Moves, indent, outdent and duplicate across quotes and loose lists
//
// Structural commands refuse (`write-failed`) or silently rewrite a neighbour when a quote or
// callout, a loose list owning a table or footnote, or a `lazy` quoted line is involved. The user
// sees a move or indent that does nothing, or one that changes text nobody touched. All from the
// same family: the draft tree is valid, the writer cannot spell it. Several need only default
// options and a quote under an item (B48).
// B529 [P4]. A plain paste of a line break over a quote after an item's quote leaves a blank line the draft doesn't have
//
// Status (2026-11-14): seed 1001. `- > quoted in item⏎> quoted in item⏎> over two lines` (GFM, `quotes:
// atom`), the root quote's lines selected, a plain paste of `⏎`: written `- > quoted in item⏎⏎> `,
// `root › 0: 0 blank lines after its text, read as 1`. The last commit's code fails alike. P4.
openBug(
  'B529',
  'P4',
  "A plain paste of a line break over a quote after an item's quote leaves a blank line the draft doesn't have",
  {
    'the case reduced': () => {
      // kept: 1487977c5617
      assertNoWriteFailure(
        executeOnText(
          '- > quoted in item\n> quoted in item\n> over two lines\n',
          { type: 'pastePlain', text: '\n' },
          { anchor: 19, head: 52, config: { flavor: 'gfm', quotes: 'atom' } },
        ),
      );
    },
  },
);
bugCluster('Moves, indent, outdent and duplicate across quotes and loose lists');

// B514 [P4]. Shift-Tab on a folded item whose text is a table with a second delimiter row keeps that row's indentation in its text
//
// Status (2026-11-13): seed 751. `- | a | b || a | b |⏎|---|---|⏎  |---|---|` (Obsidian), the item
// folded, Shift-Tab: written `| a | b || a | b |⏎|---|---|⏎  |---|---|`, read with the table's text
// `|---|---|⏎  |---|---|` where the draft has `|---|---|⏎|---|---|`: `root › 1: text`. The last
// commit's code fails alike. P4: a table's second delimiter row a lazy line.
openBug(
  'B514',
  'P4',
  "Shift-Tab on a folded item whose text is a table with a second delimiter row keeps that row's indentation in its text",
  {
    'the case reduced': () => {
      // kept: 1c6155a28e6e
      assertNoWriteFailure(
        executeOnText(
          '- | a | b || a | b |\n|---|---|\n  |---|---|\n',
          { type: 'outdent' },
          { caret: 30, config: { flavor: 'obsidian' }, view: { folded: [1], zoom: null } },
        ),
      );
    },
  },
);

// B510 [P4]. Alt-Down on a numbered item's quote with a lazy callout line writes the lazy line out of it
//
// Status (2026-11-13): seed 651. `2. > quot> [!note] Title⏎   >> [!note] Title⏎> body text⏎⏎   > e`
// (CommonMark), Alt-Down in the quote below: written `…⏎   > e⏎⏎> body text`, the lazy `> body text`
// a quote of its own after it: `root: 3 children, read as 2`. Split from B491 when its one-paragraph
// quote was fixed. The last commit's code fails alike. P4: a lazy `>` line in an item's quote.
openBug('B510', 'P4', "Alt-Down on a numbered item's quote with a lazy callout line writes the lazy line out of it", {
  'the case reduced': () => {
    // kept: cefb8225432b
    assertNoWriteFailure(
      executeOnText(
        '2. > quot> [!note] Title\n   >> [!note] Title\n> body text\n\n   > e\n',
        { type: 'moveSubtreeDown' },
        { caret: 57, config: { flavor: 'commonmark' } },
      ),
    );
  },
});

// B490 [P4]. Alt-Up on an item whose text is a padded quote with an empty item and a quote below
//
// Status (2026-11-13): found by the volume run (seed 501). `- item⏎ > quoted in item⏎  - ⏎  > - list in quote` (Obsidian): written ` > quoted in item⏎- item⏎- ⏎  > …`, the quote after the empty item read into it. P4 (odd spacing).
openBug('B490', 'P4', 'Alt-Up on an item whose text is a padded quote with an empty item and a quote below', {
  'the case reduced': () => {
    // kept: 181852288cc7
    assertNoWriteFailure(
      executeOnText(
        '- item\n > quoted in item\n  - \n  > - list in quote\n',
        { type: 'moveSubtreeUp' },
        { caret: 7, config: { flavor: 'obsidian', listParent: 'container' } },
      ),
    );
  },
});

// B504 [P4]. Alt-Up past a folded copy of a padded heading's section reads the moved heading as another node
//
// Status (2026-11-13): seed 601. ` # Project plan⏎⏎1. num⏎2. > quote⏎   > more` twice (CommonMark,
// `quotes: atom`), the second heading's list folded (`view.folded`), Alt-Up on the second heading:
// written with the first heading's padding normalized (`# Project plan`), read back with its id
// another's: `root › 0 › 0: id 5, read as 7`; ` # ⏎    second paragraph…` twice, the same. Two
// identical sections, a padded ATX heading, a fold. The last commit's code fails alike. P4.
openBug(
  'B504',
  'P4',
  "Alt-Up past a folded copy of a padded heading's section reads the moved heading as another node",
  {
    'the case reduced': () => {
      // kept: 0d5cc5daf3ef 4ecb7ae8f7db (seeds 901, 951: padded headings over a copy of their section)
      // kept: 56a704ba5baf 87af16e755ec
      // kept: 63c37e585bcf (seed 801)
      assertNoWriteFailure(
        executeOnText(
          ' # Project plan\n\n1. num\n2. > quote\n   > more\n # Project plan\n\n1. num\n2. > quote\n   > more\n',
          { type: 'moveSubtreeUp' },
          { caret: 48, config: { flavor: 'commonmark', quotes: 'atom' }, view: { folded: [4], zoom: null } },
        ),
      );
    },
  },
);

// =================================================================================================
// Enter and Shift-Enter in quotes, callouts and quoted lists
//
// Enter and Shift-Enter inside a quote or callout, or in a quoted list or task, either refuse
// (`write-failed`; B61 is the most ordinary: the end of the first line of a two-line quote in an
// item followed by a blank line) or put the caret and the following lines in the wrong place (B60).
// B524 [P4]. Alt-Down on a padded item into a quoted paragraph's list lines the next item up, the quote after it read into it
//
// Status (2026-11-14): seed 951. `- sibling⏎-  sibling⏎  > quoted in it⏎  - em⏎  > - list in quote`
// (Obsidian), Alt-Down on the padded item: written `…⏎> quoted in it⏎  -  sibling⏎- em⏎  > - list in
// quote`, `em` lined up to column 0, the quote after it read as its: `root: 3 children, read as 2`. The
// seam check reads `em` where it was (`  - em`). The last commit's code fails alike. P4.
openBug(
  'B524',
  'P4',
  "Alt-Down on a padded item into a quoted paragraph's list lines the next item up, the quote after it read into it",
  {
    'the case reduced': () => {
      // kept: bc663ddb5ff7
      assertNoWriteFailure(
        executeOnText(
          '- sibling\n-  sibling\n  > quoted in it\n  - em\n  > - list in quote\n',
          { type: 'moveSubtreeDown' },
          { caret: 13, config: { flavor: 'obsidian' } },
        ),
      );
    },
  },
);
bugCluster('Enter and Shift-Enter in quotes, callouts and quoted lists');

// B508 [P4]. Enter in a table's header in an item over a `# ---` delimiter row splits it into a heading
//
// Status (2026-11-13): seed 701. `- | a | b |⏎  # ---|---|⏎ | 2 |` (Obsidian), Enter in the second
// line: written `- | a | b |⏎  # -⏎⏎  --|---|⏎ | 2 |`, read with the item's blocks other than the draft's:
// `root: 2 children, read as 1`. The last commit's code fails alike. P4: a table whose delimiter row is
// a heading's text.
openBug('B508', 'P4', "Enter in a table's header in an item over a `# ---` delimiter row splits it into a heading", {
  'the case reduced': () => {
    // kept: a4a1a2c792c7
    assertNoWriteFailure(
      executeOnText(
        '- | a | b |\n  # ---|---|\n | 2 |\n',
        { type: 'enter' },
        { caret: 17, config: { flavor: 'obsidian' } },
      ),
    );
  },
});

// B494 [P4]. Shift-Enter in a tab-led padded item under a callout's item fails to write
//
// Status (2026-11-13): found by the volume run (seed 501). `- > [!note] Title⏎→-  ┃parent⏎→→- grandchild⏎→  - child three` (Obsidian, `indentUnit: tab`): `root › 0 › 1: 1 children, read as 2`. P4 (the user's rule: tabs, odd spacing).
openBug('B494', 'P4', "Shift-Enter in a tab-led padded item under a callout's item fails to write", {
  'the case reduced': () => {
    // kept: ce78f7f6563b
    // kept: 7ab11e3cb569 (seed 601)
    assertNoWriteFailure(
      executeOnText(
        '- > [!note] Title\n\t-  parent\n\t\t- grandchild\n\t  - child three\n',
        { type: 'shiftEnter' },
        { caret: 22, config: { flavor: 'obsidian', indentUnit: 'tab' } },
      ),
    );
  },
});

// =================================================================================================
// Backspace, Delete and joins around quotes, tasks and headings
//
// Backspace and Delete at the edge of a quote, callout, task or heading either refuse (B73: the
// start of an item holding a multi-line callout) or join in a way that loses structure: a heading
// is demoted, a checkbox stays as literal text, an unrelated paragraph becomes a child.
bugCluster('Backspace, Delete and joins around quotes, tasks and headings');

// =================================================================================================
// Code, math and comment blocks
//
// Fenced code, `$$` math and `%%` comments: a block with an unusual closing fence, a
// whitespace-only line or a quote around it loses or changes its payload on copy, cut, indent,
// outdent or move; typing or Backspace at the fence edges deletes more than it should; an empty
// code block's deletion can take its owned list with it (B90, only with `listParent: block`).
// B521 [P4]. Backspace or Delete Subtree on a held setext `- ` underline in an item before a padded item fails to write
//
// Status (2026-11-14): seed 901. `- sibling⏎  - ⏎⏎  - quoted in item⏎  > - list in quote` (Obsidian,
// `listParent: container`), `  - ` held, the underline of `sibling`'s setext heading: Backspace there
// written `- sibling⏎  - ⏎- quoted in item⏎…`, `root: 3 children, read as 2`. The last commit's code
// fails alike. P4.
openBug(
  'B521',
  'P4',
  'Backspace or Delete Subtree on a held setext `- ` underline in an item before a padded item fails to write',
  {
    'the case reduced': () => {
      // kept: 113a59a9998d 95f6444f079f
      assertNoWriteFailure(
        executeOnText(
          '- sibling\n  - \n\n  - quoted in item\n  > - list in quote\n',
          { type: 'deleteContentBackward' },
          { caret: 15, config: { flavor: 'obsidian', listParent: 'container' }, placeholders: [15] },
        ),
      );
    },
  },
);
bugCluster('Code, math and comment blocks');

// B479 [P4]. A closing fence after a quote's `>`, a space and a tab reads as unclosed in the text's frame
//
// Status (2026-11-12): found by the fast suite's frame property (a random seed, `test/doc/text.test.ts`).
// `> ~~~⏎>  →~~~` (CommonMark): the parser closes the fence, the tab past the quote's space reaching
// column 4, two past the code's start; the frame reads the text's ` →~~~` from column 0, the tab four
// columns, and calls it open. A text's frame knows no column of its own (texts are read apart from
// where they sit), so the fix is the reader's: the tab's spaces where it spans less. P4 (rare: a tab
// after a quote's space). The frame property can hit it on a seed.
openBug('B479', 'P4', "A closing fence after a quote's `>`, a space and a tab reads as unclosed in the text's frame", {
  'the fence reads closed, as the parser has it': () => {
    const doc = OurusDoc.parse('> ~~~\n>  \t~~~', { config: { flavor: 'commonmark' } });
    const code = doc.rootNode.children[0]!.children[0]!;
    assert.equal(code.block.attrs.closed, true);
    assert.equal((doc.textOf(code) as { closed: boolean }).closed, true);
  },
});

// B92 [P4]. Outdenting indented code after a quoted partial tab changes its payload
//
// Location: `src/writer/write.ts:1506–1517`.
//
// This is a quote containing indented code; its code payload starts with four literal spaces.
// Outdent returns `write-failed`: `text "    code", read as "  code"`. `> \t  code` also fails,
// losing its two payload spaces on readback. The indented-code shift path does not preserve the
// correct boundary between the code's four-column indentation and its payload when a tab occurs
// after the quote's space. This differs from the earlier paragraph/lazy-continuation movement
// findings: it is a single-line indented-code atom with no lazy continuation or neighboring block.
// The check prevents committing the loss.
openBug('B92', 'P4', 'Outdenting indented code after a quoted partial tab changes its payload', {
  'outdenting indented code after a quoted partial tab keeps its payload': () => {
    assertNoWriteFailure(executeOnText('> \t    code', { type: 'outdent', nodes: [2] }, { caret: 3 }));
  },
  'outdenting indented code after a quoted partial tab keeps a shorter payload': () => {
    assertNoWriteFailure(executeOnText('> \t  code', { type: 'outdent', nodes: [2] }, { caret: 3 }));
  },
});

// B94 [P4]. Moving open delimiter blocks across quote boundaries swallows neighbors
//
// Locations: `src/commands/indent.ts:65–68`, `src/commands/move-subtree.ts:167–173`.
//
// The draft expects two roots; the writer attempts `>\n>* $$\n>`, which reads as one, and returns
// `write-failed`. Moving the open math under the quote makes the later quoted row part of that open
// block. The corresponding open-code case is `run('>>```\n>-', {type:'outdent', nodes:[2]}, 8)`,
// whose attempted `>```\n>-` swallows the item that should remain distinct.
//
// The guards do not account for an open descendant that becomes adjacent to other quote content
// after the move. Refuse an unexpressible layout before serialization, or give the block an
// explicitly permitted closed form. Pasting after a quote containing unclosed code also exposes
// this descendant-boundary problem; it is grouped here rather than counted as another bug.
openBug('B94', 'P4', 'Moving open delimiter blocks across quote boundaries swallows neighbors', {
  'indenting open math under a quote keeps the rows apart': () => {
    // attempted: >⏎>* $$⏎>
    // kept: b0aea98f8884 (seed 1001: an unclosed fence moved above a callout's title in an item)
    assertNoWriteFailure(executeOnText('>\n* $$\n>', { type: 'indent' }, { caret: 6, config: { flavor: 'obsidian' } }));
  },
  'outdenting open code keeps the item after it': () => {
    // attempted: >```⏎>-
    assertNoWriteFailure(executeOnText('>>```\n>-', { type: 'outdent', nodes: [2] }, { caret: 8 }));
  },
});

// B206 [P4]. A line break pasted in an indented fence's indentation fails to write
//
// The caret is inside the opener's indentation. `lineBreakAtOpening` (`src/commands/code.ts:108`)
// acts at the opening's start only, so the indentation splits. The same family as B201, fixed for
// quote atoms by taking the spaces before the first `>` as the quote's start (`atQuoteStart`).
openBug('B206', 'P4', "A line break pasted in an indented fence's indentation fails to write", {
  "a line break in an indented fence's indentation writes": () => {
    // writes # a⏎⏎␠⏎␠```⏎
    assertNoWriteFailure(
      executeOnText('# a\n\n  ```\n', { type: 'pastePlain', text: '\n' }, { caret: 6, config: { flavor: 'obsidian' } }),
    );
  },
});

// B294 [P4]. Indenting a fence indented one space can't write its tab-led code
//
// Location: `src/writer/write.ts` (a fence's lines re-indented).
//
// A fence opened one space in takes one column of each code line's indentation: ` ```⏎→PAYLOAD⏎
// ``` ` reads `␠␠␠PAYLOAD`. Tab on it (`nodes: [1]`, made an item) writes `- ```⏎  →PAYLOAD⏎  ``` `,
// where nothing takes a column of the tab: `→PAYLOAD`. The readback compared the atom's text as
// written, `→PAYLOAD` both, and let the change through, silently; it compares a verbatim block's lines
// as read now (`verbatimLinesOf`, `check.ts`), so the edit is refused: `code ["","   PAYLOAD",""], read
// as ["","→PAYLOAD",""]`. Left: the writer spelling it, the tab's columns as spaces or the fence's
// indent kept. `- a⏎⏎ ```⏎→x⏎ ``` ` the same. With spaces (` ```⏎  x⏎ ``` `) the code keeps. Not B92.
// P3: a refusal now, on rare input.
openBug('B294', 'P4', "Indenting a fence indented one space can't write its tab-led code", {
  'indenting an indented fence keeps its tab-led code': () => {
    const source = ' ```\n\tPAYLOAD\n ```';
    const code = (html: string): string | undefined => /<pre><code>([^]*?)<\/code><\/pre>/.exec(html)?.[1];
    // rejected write-failed: code ["","   PAYLOAD",""], read as ["","→PAYLOAD",""] (it wrote →PAYLOAD, unchecked, before)
    const result = assertApplied(executeOnText(source, { type: 'indent', nodes: [1] }));
    assert.equal(code(result.view.doc.mdTree.renderHtml()), code(MdTree.parse(source).renderHtml()));
  },
  'indenting an indented fence under an item keeps its tab-led code': () => {
    const source = '- a\n\n ```\n\tx\n ```';
    const code = (html: string): string | undefined => /<pre><code>([^]*?)<\/code><\/pre>/.exec(html)?.[1];
    const result = assertApplied(executeOnText(source, { type: 'indent', nodes: [2] }));
    assert.equal(code(result.view.doc.mdTree.renderHtml()), code(MdTree.parse(source).renderHtml()));
  },
});

// B299 [P4]. Moving an unclosed code or math block drops its last blank line
//
// Location: `src/writer/write.ts` (a moved block's payload and the blank lines after it).
//
// An unclosed block may end at its list's end, a blank line its last code line. Moved, that line is
// lost: `- m⏎  ```⏎  let x;⏎  ```-⏎ ⏎#`, `quotes: atom`, Alt-↓ on the code writes `- m⏎#⏎```⏎let
// x;⏎```-⏎`: `text "let x;⏎```-⏎", read as "let x;⏎```-"`; `- - $$⏎⏎ ` (Obsidian), Shift-Tab:
// written `- ⏎- $$⏎⏎`, `text "⏎", read as ""`. No quote or mark needed. Not B94 (a block crossing a
// quote), nor B205 (a gap after an unclosed block): here the line is the block's. Seed 42 sessions
// 12574, 77403. P3. The math case writes since the second writing (recommendation 1, step 2), its
// test in `commands.test.ts`.
openBug('B299', 'P4', 'Moving an unclosed code or math block drops its last blank line', {
  'moving unclosed code keeps its last blank line': () => {
    // kept: 31cc85aea32f (seed 751: unclosed math in an item's quote, Alt-Up past a callout, the blank line after it not written, the callout read into the math)
    assertNoWriteFailure(
      executeOnText(
        '- m\n  ```\n  let x;\n  ```-\n \n#',
        { type: 'moveSubtreeDown' },
        { caret: 27, config: { flavor: 'commonmark', quotes: 'atom' } },
      ),
    );
  },
});

// B326 [P4]. Two line breaks inserted before an opening delimiter fail to write
//
// Location: `src/commands/typing.ts` (`insertTextCommand`), `src/commands/code.ts` (`lineBreakAtOpening`
// takes one line ending, `editInCode`).
//
// `# h⏎⏎┃$$⏎x⏎$$` (Obsidian), inserting `⏎⏎` at once (a text replacement's, an IME's): `root › 0: 1 blank
// lines after its text, read as 3`; `- ┃```⏎  x⏎  ```` the same: `root: 1 children, read as 2`. With one
// line break both write. A run of them goes into the atom's string, blank lines before what the parser
// reads as its start. Not B205. (2026-11-11: the item's fence case writes now, the blank line Enter
// makes there that item's.)
openBug('B326', 'P4', 'Two line breaks inserted before an opening delimiter fail to write', {
  "two line breaks before a math block's opening write": () => {
    // root › 0: 1 blank lines after its text, read as 3
    assertNoWriteFailure(
      executeOnText(
        '# h\n\n$$\nx\n$$',
        { type: 'insertText', text: '\n\n' },
        { caret: 5, config: { flavor: 'obsidian' } },
      ),
    );
  },
});

// =================================================================================================
// Tab-led, padded and lazy-continuation lines
//
// Lines led by tabs, items with padded marker spacing and lazy continuation lines. Mostly come from
// imported files rather than typing, so all P3. The writer cannot place the continuation at the
// column the move or duplicate needs, so the edit is refused or the text changes.
// B522 [P4]. A cut leaving an empty item and a blank line before a padded unclosed fence fails to write
//
// Status (2026-11-14): seed 901. `-⏎  ⏎let x;⏎  ```⏎- next⏎# Project plan` (Obsidian, `listParent:
// container`), the paragraph `let x;` cut: written `-⏎  ⏎  ```⏎- next…`, the fence read otherwise:
// `root: 2 children, read as 3`. The last commit's code fails alike. P4.
openBug('B522', 'P4', 'A cut leaving an empty item and a blank line before a padded unclosed fence fails to write', {
  'the case reduced': () => {
    // kept: 11ca556768e7
    assertNoWriteFailure(
      executeOnText(
        '-\n  \nlet x;\n  ```\n- next\n# Project plan\n',
        { type: 'cut' },
        { caret: 5, config: { flavor: 'obsidian', listParent: 'container' } },
      ),
    );
  },
});
bugCluster('Tab-led, padded and lazy-continuation lines');

// B512 [P4]. Alt-Up on a padded item under the tab unit lines a tab-led grandchild up beside it, the paragraph after it read in
//
// Status (2026-11-13): seed 751. `- item⏎  - child one⏎  -  child one⏎→- grd two⏎⏎→second paragraph of
// child two` (CommonMark, `indentUnit: tab`), Alt-Up on the padded `child one`: written `- item⏎  -  child
// one⏎  - child one⏎  - grd two⏎⏎→second paragraph…`, `grd two` its sibling's column, the tab-led
// paragraph read into it: `root › 0: 4 children, read as 3`. The last commit's code fails alike. P4.
openBug(
  'B512',
  'P4',
  'Alt-Up on a padded item under the tab unit lines a tab-led grandchild up beside it, the paragraph after it read in',
  {
    'the case reduced': () => {
      // kept: a1d14f2b0c7f
      assertNoWriteFailure(
        executeOnText(
          '- item\n  - child one\n  -  child one\n\t- grd two\n\n\tsecond paragraph of child two\n',
          { type: 'moveSubtreeUp' },
          { caret: 26, config: { flavor: 'commonmark', indentUnit: 'tab' } },
        ),
      );
    },
  },
);

// B448 [P4]. Cmd-Backspace on a padded tab-led item's text takes its sibling in
//
// Status (2026-11-12): found by the volume run (seed 301). `- item⏎→-  parent⏎→→- grandchild⏎→  - child three`: written `→- ⏎→→- grandchild⏎→  - child three`. P4 (the user's rule: rare, odd spacing or a hand-built mark).
openBug('B448', 'P4', "Cmd-Backspace on a padded tab-led item's text takes its sibling in", {
  'the case reduced': () => {
    // kept: 6b4d2bfe00ee
    assertNoWriteFailure(
      executeOnText(
        '- item\n\t-  parent\n\t\t- grandchild\n\t  - child three\n',
        { type: 'deleteSoftLineBackward' },
        { caret: 17, config: { flavor: 'commonmark', indentUnit: 'tab' } },
      ),
    );
  },
});

// B464 [P4]. Backspace at a paragraph's start before a tab-led empty item and a footnote takes a node in
//
// Status (2026-11-12): found by the volume run (seed 351). `┃x⏎→- ⏎- ⏎[^1]: a footnote` (Obsidian, `indentUnit: tab`): written `x⏎→- ⏎[^1]: a footnote`, read as two roots where the draft has one. P4 (the user's rule: rare, odd spacing or tabs).
openBug('B464', 'P4', "Backspace at a paragraph's start before a tab-led empty item and a footnote takes a node in", {
  'the case reduced': () => {
    // kept: 663e7007a7ef
    assertNoWriteFailure(
      executeOnText(
        'x\n\t- \n- \n[^1]: a footnote\n',
        { type: 'deleteContentBackward' },
        { caret: 0, config: { flavor: 'obsidian', indentUnit: 'tab' } },
      ),
    );
  },
});

// B507 [P4]. Shift-Tab on an empty item after a tab-led item's split lazy text writes a blank line it reads as the item's
//
// Status (2026-11-13): seed 651. `- item ^id1⏎→- oth⏎→-⏎→  er⏎- ⏎⏎- # x` (CommonMark, `indentUnit: tab`),
// Shift-Tab on the empty `- `: written `…→  er⏎⏎⏎- # x`, the empty item gone and its gap's blank lines
// after `er`'s item, read as its: `root › 0 › 1: 0 blank lines after its text, read as 1`. The last
// commit's code fails alike. P4: an empty item after a tab-led bare `-` and its next line.
openBug(
  'B507',
  'P4',
  "Shift-Tab on an empty item after a tab-led item's split lazy text writes a blank line it reads as the item's",
  {
    'the case reduced': () => {
      // kept: e361bfaa69bc
      // kept: 2e4df5f3100b (seed 801: Shift-Enter in the tab-led item before a paragraph)
      assertNoWriteFailure(
        executeOnText(
          '- item ^id1\n\t- oth\n\t-\n\t  er\n- \n\n- # x\n',
          { type: 'outdent' },
          { caret: 31, config: { flavor: 'commonmark', indentUnit: 'tab' } },
        ),
      );
    },
  },
);

// B509 [P4]. Shift-Tab on an item after a nested numbered quote writes its paragraph lazy into the quote
//
// Status (2026-11-13): seed 701. `1. num⏎→1. > quote⏎→   >⏎→   > \`⏎- item` (GFM, `indentUnit: tab`),
// Shift-Tab on `item`, made a paragraph: written `…→   > \`⏎item`, no blank line before it, read as a
// lazy line of the quote's paragraph: `root: 2 children, read as 1`. The last commit's code fails
// alike. P4: a quote nested in a tab-led numbered item, an item after it made a paragraph.
openBug('B509', 'P4', 'Shift-Tab on an item after a nested numbered quote writes its paragraph lazy into the quote', {
  'the case reduced': () => {
    // kept: 7d2794a4bffe
    // kept: d0f229209318 (seed 801)
    assertNoWriteFailure(
      executeOnText(
        '1. num\n\t1. > quote\n\t   >\n\t   > `\n- item\n',
        { type: 'outdent' },
        { caret: 39, config: { flavor: 'gfm', indentUnit: 'tab' } },
      ),
    );
  },
});

// B343 [P4]. A line break pasted before a tab-led fence after a quote loses the tab
//
// Status (2026-11-06): verified on the current tree; found by the diff suite, in both copies.
//
// `x⏎>b⏎┃→~~~` (GFM), plain paste of a line break: `root › 2: text "→\~~~", read as "\~~~"`. The
// paragraph's text keeps the tab before its escaped fence, the written line doesn't.
openBug('B343', 'P4', 'A line break pasted before a tab-led fence after a quote loses the tab', {
  'a line break pasted before a tab-led fence writes': () => {
    assertNoWriteFailure(
      executeOnText('x\n>b\n\t~~~\n', { type: 'pastePlain', text: '\n' }, { caret: 5, config: { flavor: 'gfm' } }),
    );
  },
});

// B344 [P4]. Tab-led lines pasted after a held padding fail to write
//
// Status (2026-11-06): verified on the current tree, a hand-built mark; found by the diff suite, in
// both copies.
//
// `-  ┃``` x` with the padding's space held (Placeholder17's state), plain paste of `- a⏎→- b⏎→→- c`:
// `the writer can't write a line of node 1's text starting with a tab, at another column than done()
// gave it`, B155's message.
openBug('B344', 'P4', 'Tab-led lines pasted after a held padding fail to write', {
  'tab-led lines pasted after a held padding write': () => {
    assertNoWriteFailure(
      executeOnText(
        '-  ``` x\n',
        { type: 'pastePlain', text: '- a\n\t- b\n\t\t- c\n' },
        { caret: 3, placeholders: [2], config: { flavor: 'commonmark' } },
      ),
    );
  },
});

// B155 [P4]. Moving a subtree down cannot preserve a tab-led lazy continuation
//
// Location: `src/writer/write.ts:601`.
//
// A quote subtree containing a lazy line led by a tab passes the move’s semantic checks, but the
// writer cannot reproduce that line at its destination column. It returns an internal writer
// failure. The move needs column-aware spelling or an expressibility refusal before writing.
//
// Observed: write-failed:the writer can't write a line of node 4's text starting with a tab, at
// another column than done() gave it
openBug('B155', 'P4', 'Moving a subtree down cannot preserve a tab-led lazy continuation', {
  'moving a subtree down keeps a tab-led lazy line': () => {
    assertNoWriteFailure(
      executeOnText('>b\n>>>q\n\tc\n#', { type: 'moveSubtreeDown', nodes: [4] }, { anchor: 1, head: 9 }),
    );
  },
});

// B159 [P4]. Typing multiple fence characters mishandles a tab-led following line
//
// Location: `src/commands/typing.ts:185`.
//
// typedOneByOne turns the inserted fence text into a sequence of structural edits. The following
// tab-led line is escaped, but the tab that remains in the draft’s text disappears when reparsed.
// The operation is rejected, even though the tab is user text in the current context. Keep offsets
// and whitespace ownership consistent across the intermediate edits.
//
// Observed: write-failed:the text written doesn't read as the draft: root › 0 › 0: text "\t\\- c",
// read as "\\- c"
openBug('B159', 'P4', 'Typing multiple fence characters mishandles a tab-led following line', {
  'typing fence characters keeps a tab-led line after it': () => {
    assertNoWriteFailure(executeOnText('   - \n\t- c', { type: 'insertText', text: '```\nx\n```' }, { caret: 5 }));
  },
});

// B165 [P4]. Outdenting an item with a lazy-headed table keeps the table's indentation
//
// Default configuration, `"- item\n| a | b |\n  |---|---|\n"`, caret 2, command `outdent`. Actual:
// `write-failed`, `root › 1: text "| a | b |\n|---|---|", read as "| a | b |\n  |---|---|"`.
//
// In GFM the lazy `| a | b |` and the item's `  |---|---|` are a table in the item (the table takes
// the paragraph's last line as its header, lazy or not). Unwrapped, the table's later lines aren't
// cut to the new column: its first line, lazy, has no prefix to change, and the table is written as
// it was. `- item⏎  | a | b |⏎  |---|---|` (not lazy) outdents; the lazy shape indents and moves;
// with a third row it fails the same way. Relevant paths: `src/commands/outdent.ts` (`unwrapItems`)
// and the shift of an atom with a lazy first line in `src/writer/write.ts`.
openBug('B165', 'P4', "Outdenting an item with a lazy-headed table keeps the table's indentation", {
  "outdenting an item with a lazy-headed table cuts the table's indentation": () => {
    assertNoWriteFailure(executeOnText('- item\n| a | b |\n  |---|---|\n', { type: 'outdent' }, { caret: 2 }));
  },
  'Shift-Tab on an item whose child is a padded lazy-headed table (seed 501)': () => {
    // kept: c96cb35ad211
    assertNoWriteFailure(
      executeOnText(
        '- next\n | a | b |\n  |---|---|\n',
        { type: 'outdent' },
        { caret: 6, config: { flavor: 'gfm', listParent: 'container' } },
      ),
    );
  },
});

// B192 [P4]. A plain paste with a tab-led line into an item whose padding holds a placeholder fails to write
//
// Status (2026-11-05): found by `node test/heavy.ts` (`diff`, failing in both copies); fails at the
// last commit too.
//
// The item's second space past its marker is held (a placeholder at 2), and the pasted text's later
// line starts with a tab. Without the placeholder the paste writes (`-  xa⏎   →b`); with spaces
// (`a⏎  b`) too. The held space and the tab's column disagree about where the text's later lines
// start.
openBug(
  'B192',
  'P4',
  'A plain paste with a tab-led line into an item whose padding holds a placeholder fails to write',
  {
    'a tab-led plain paste into a held padding writes': () => {
      assertNoWriteFailure(
        executeOnText(
          '-  x\n',
          { type: 'pastePlain', text: 'a\n\tb' },
          { caret: 4, config: { flavor: 'commonmark' }, placeholders: [2] },
        ),
      );
    },
  },
);

// B290 [P4]. A footnote label's own indentation is lost across a quote's edge
//
// Location: `src/doc/read.ts` (a footnote's prefix), `src/writer/write.ts` (its identity and
// prefix).
//
// `>⏎␠[^1]:`, Tab on the footnote: written `>⏎>  [^1]:`, read as another node: `root › 0 › 0: id 2,
// read as 3`. `>→[^1]:`, Shift-Tab: written `␠␠[^1]:`, the tab spelled as spaces the draft doesn't
// have: `text "→[^1]:", read as "␠␠[^1]:"`. Without the space, the tab, both work. Not B92 nor B164.
// P3: padded and tab-led labels. The padded label writes since the second writing (recommendation 1,
// step 2), its test in `commands.test.ts`.
openBug('B290', 'P4', "A footnote label's own indentation is lost across a quote's edge", {
  "outdenting a footnote after a quote's tab writes": () => {
    assertNoWriteFailure(executeOnText('>\t[^1]:', { type: 'outdent' }, { caret: 7 }));
  },
});

// B331 [P4]. Moving tab-led indented code into an empty quote fails to write
//
// Location: `src/writer/write.ts` (indented code moved under a `>`, its tab), `src/commands/move-subtree.ts`.
//
// `→def⏎>` (Obsidian, `quotes: container`), code 1 dropped into the quote: `root › 0 › 0: id 1, read as 3`.
// With four spaces for the tab it writes, `>⏎>     def`. Every `indentUnit`; into `> x` it writes but for
// `indentUnit: tab`. Not B92, B95.
openBug('B331', 'P4', 'Moving tab-led indented code into an empty quote fails to write', {
  'tab-led code moves into an empty quote': () => {
    // root › 0 › 0: id 1, read as 3
    assertNoWriteFailure(
      executeOnText(
        '\tdef\n>',
        { type: 'moveSubtree', nodes: [1], to: { parent: 2, after: null } },
        { config: { flavor: 'obsidian', quotes: 'container', indentUnit: 2 } },
      ),
    );
  },
});

// =================================================================================================
// Numbered lists and shared marker lines
//
// Duplicating or dropping a numbered item across a width change (9 to 10) misplaces the quote under
// it, and an indent misplaces a child (B210). Three markers sharing a line can read as a rule
// (B209).
// B527 [P4]. Alt-Up on an empty item above a tab-led grandchild and its paragraph fails to write
//
// Status (2026-11-14): seed 951. `- parent⏎  - child one⏎  - ⏎⏎→- grandchild⏎⏎→second paragraph of
// child two` (Obsidian, `indentUnit: tab`), Alt-Up on the empty item: written with the grandchild at
// two spaces, `root › 0: 4 children, read as 3`. The last commit's code fails alike. P4.
openBug('B527', 'P4', 'Alt-Up on an empty item above a tab-led grandchild and its paragraph fails to write', {
  'the case reduced': () => {
    // kept: b47b82ac91af
    assertNoWriteFailure(
      executeOnText(
        '- parent\n  - child one\n  - \n\n\t- grandchild\n\n\tsecond paragraph of child two\n',
        { type: 'moveSubtreeUp' },
        { caret: 28, config: { flavor: 'obsidian', indentUnit: 'tab' }, auto: [43] },
      ),
    );
  },
});
// B528 [P4]. Shift-Tab on a held empty tab-led item between padded items before a lazy fence fails to write
//
// Status (2026-11-14): seed 1001. `-  let x;⏎→- ⏎→-  let x;⏎  ```⏎- next` (GFM, `indentUnit: tab`),
// Shift-Tab on the held empty item: `root › 1: 1 children, read as 2`. The last commit's code fails
// alike. P4.
openBug(
  'B528',
  'P4',
  'Shift-Tab on a held empty tab-led item between padded items before a lazy fence fails to write',
  {
    'the case reduced': () => {
      // kept: 7efdbec36e15
      assertNoWriteFailure(
        executeOnText(
          '-  let x;\n\t- \n\t-  let x;\n  ```\n- next\n',
          { type: 'outdent' },
          { caret: 13, config: { flavor: 'gfm', indentUnit: 'tab' }, placeholders: [13] },
        ),
      );
    },
  },
);
bugCluster('Numbered lists and shared marker lines');

// B403 [P4]. Deleting an item before a shared marker line `- - - ` lines the line's child up wrong
//
// Status (2026-11-11): found by the volume run (seed 101). `- item ^id1⏎- - - ⏎  - other`, Delete
// subtree on the shared line: `other` read into the item above.
//
// Priority (2026-11-12): P4 (the user's rule: rare, the fix deep). Read further: `- x⏎- - - ⏎  - other⏎
// > q` (or `⏎⏎  para`), Delete subtree at the third marker: the draft has the shared line's items
// gone, their children at the root (3 roots), the writer lifts `other` to the root but copies the
// block after it at column 2, inside `other` now. With two markers (`- - b`) the outer item stays,
// its marker written over `other`'s line, and it writes. The three-marker line is B209's rule shape
// (`#ruleLines`).
// (2026-11-12, later: passed for a while with B414's lift, which lifted the callout after the
// lined-up item; the lift takes no quote now, whose lines carry their own prefix: open again.)
openBug('B403', 'P4', "Deleting an item before a shared marker line `- - - ` lines the line's child up wrong", {
  'the case reduced': () => {
    // kept: dbf445dbc663 (seed 151: `- 1. second` deleted)
    // kept: b0bc8706019c
    assertNoWriteFailure(
      executeOnText('- item ^id1\n- - - \n  - other\n  > [!note] Title\n', { type: 'deleteSubtree' }, { caret: 18 }),
    );
  },
});

// B461 [P4]. Backspace joining into a nested bullet after a list renumbered across 9/10 writes it outside its item
//
// Status (2026-11-12): found by the volume run (seed 351). `…1. first⏎   - nested bullet⏎3. ┃hird` (Obsidian, `listParent: container`), the list renumbered to `10. first`: the bullet left at column 3, short of `10. `'s content. The 9/10 family (B210's). P4 (the user's rule: rare, odd spacing or tabs).
openBug(
  'B461',
  'P4',
  'Backspace joining into a nested bullet after a list renumbered across 9/10 writes it outside its item',
  {
    'the case reduced': () => {
      // kept: 8b7a0ad4fd60
      assertNoWriteFailure(
        executeOnText(
          '3. third\n1. first\n2. second\n3. third\n1. first\n2. second\n3. third\n1. first\n   - nested bullet\n3. hird\n',
          { type: 'deleteContentBackward' },
          { caret: 96, config: { flavor: 'obsidian', listParent: 'container' } },
        ),
      );
    },
  },
);

// B481 [P4]. Enter renumbering across 9/10 an item whose quote has a lazy line
//
// Status (2026-11-12): found by the volume run (seed 451). `8. x┃⏎9. > quote⏎   x> more` (`quotes: atom`), Enter: `10. > quote⏎   x> more`, the lazy line short of `10. `'s content, read with its spaces. The 9/10 family. P4.
openBug('B481', 'P4', 'Enter renumbering across 9/10 an item whose quote has a lazy line', {
  'the case reduced': () => {
    // kept: dd2fc88505a5
    assertNoWriteFailure(
      executeOnText(
        '8. x\n9. > quote\n   x> more\n',
        { type: 'enter' },
        { caret: 4, config: { flavor: 'commonmark', quotes: 'atom' } },
      ),
    );
  },
});

// B278 [P4]. A marker widened across 9/10 makes its tab padding code
//
// Location: `src/writer/draft.ts`, `src/writer/write.ts` (a numbered marker's width, its first
// line's padding).
//
// `9. →b`: the tab after `9.␠` pads to column 4, and `b` is the item's text. Duplicated (written
// `9. →b⏎10. →b`) or with an item put above it by Enter at its start (`9. ⏎10. →b`), past `10.␠`
// the tab spans five columns, and `b` is indented code: `root › 1: a paragraph text, read as a
// indented_code one`. No quote (B169) nor a later node taken in (B208): the line's own text changes
// kind. The 9/10 family (B169, B191, B210). P3: tab padding. Duplicating writes now, the copy in normal
// form, `9. →b⏎10. b` (recommendation 1; `commands.test.ts`); Enter above it still fails.
openBug('B278', 'P4', 'A marker widened across 9/10 makes its tab padding code', {
  'Enter above a tab-padded 9. item writes': () => {
    assertNoWriteFailure(executeOnText('9. \tb', { type: 'enter' }, { caret: 0 }));
  },
});

// =================================================================================================
// Selections and carets in the view
//
// What a selection means at the edge of a zoom or a fold, and where a caret lands. The zoom's end
// isn't the document's end, and several checks still compare with the document's (B212). Includes
// the only reachable uncaught throw from ordinary keys.
// B526 [P4]. Alt-Down on a tab-led item past its paragraph and a `- - - ` shared marker line fails to write
//
// Status (2026-11-14): seed 1001. `- parent⏎→- child one⏎⏎→  se⏎→- - - ⏎→  - child three` (GFM,
// `indentUnit: tab`), Alt-Down on `child three`'s line: `root › 0: 3 children, read as 2`. The last
// commit's code fails alike. P4.
openBug(
  'B526',
  'P4',
  'Alt-Down on a tab-led item past its paragraph and a `- - - ` shared marker line fails to write',
  {
    'the case reduced': () => {
      // kept: dd04f8014e5b
      assertNoWriteFailure(
        executeOnText(
          '- parent\n\t- child one\n\n\t  se\n\t- - - \n\t  - child three\n',
          { type: 'moveSubtreeDown' },
          { caret: 36, config: { flavor: 'gfm', indentUnit: 'tab' } },
        ),
      );
    },
  },
);
bugCluster('Selections and carets in the view');

// =================================================================================================
// Fold and zoom guards
//
// Each guard compares a summary of two snapshots, and the summary can hide a difference. Nothing
// here is reached by ourus's own commands; they need a host's edit or another snapshot.
bugCluster('Fold and zoom guards');

// =================================================================================================
// Block ids
//
// Two refusals that block ordinary editing of a named quote, one silent removal of the wrong id,
// and the paste guard's probing. In B223 the check is right; the commands are what strand the id.
bugCluster('Block ids');

// B330 [P4]. Indenting `[^a]:` over a block id line fails to write
//
// Location: `src/commands/indent.ts` (a paragraph made an item), the block-id lines it carries.
//
// `[^a]:⏎^id` (Obsidian, a paragraph: a footnote's label with nothing after it isn't one), Tab: `root › 0:
// block ids [["id",true]], read as []`. With `x` for `^id`, or text after the label, it indents. Not B236.
openBug('B330', 'P4', 'Indenting `[^a]:` over a block id line fails to write', {
  'the paragraph indents, its id with it': () => {
    // root › 0: block ids [["id",true]], read as []
    assertNoWriteFailure(executeOnText('[^a]:\n^id', { type: 'indent' }, { caret: 3, config: { flavor: 'obsidian' } }));
  },
});

// =================================================================================================
// Held marks (placeholders)
//
// What happens to an empty node or a held space when a command rewrites around it. **Reachability
// decides the rank here.** A host settles when the caret leaves the line, so a mark on another line
// than the caret's doesn't occur in a normal session. Each finding's marks were hand-built, so each
// was replayed from a real key sequence where one could be found. Those that reach it are P2; the
// others P3. That rests on D22 in dev/next.md.
bugCluster('Held marks (placeholders)');

// B413 [P4]. A quoted paragraph whose space after `>` is held loses its marks through Enter or Shift-Enter
//
// Status (2026-11-12): split from B237, its hand-built shapes. `>◌ q` (`quotes: container`, the space
// after an unspaced `>` the paragraph's, held), Enter or Shift-Enter at the end: written `> q⏎>`, both
// placeholders gone, read back with the paragraph named otherwise. No key sequence tried reaches it.
// Enter writes since the third writing (recommendation 1, step 2): `>  q⏎>⏎> `, the held space settled
// as the paragraph's own; its test in `commands.test.ts`.
openBug('B413', 'P4', 'A quoted paragraph whose space after `>` is held loses its marks through Enter or Shift-Enter', {
  'Shift-Enter in a quoted paragraph held past its `>`': () => {
    assertNoWriteFailure(
      executeOnText('> q', { type: 'shiftEnter' }, { caret: 3, config: { quotes: 'container' }, placeholders: [1] }),
    );
  },
});

// =================================================================================================
// Raised blank lines (auto marks)
//
// A blank line ourus raised (an auto mark) that a command leaves as the author's, or drops where it
// still sets two blocks apart: through a rewrite of a quote's lines, a text deleted down to its block
// id, Shift-Enter and pastes on blank lines, a gap written again.
bugCluster('Raised blank lines (auto marks)');

// B444 [P4]. A raised blank line after a quote loses its mark where a command rewrites the quote's lines
//
// Status (2026-11-14): the gap left with only its bare blank lines, the quote's own `>` lines gone, keeps
// its last ours (`#lastBlankLineOurs`): the old reduced case and Enter in a quote's lines write the mark
// now (`commands.test.ts`). Left: a callout's body cut, a paste in or after a quote's lines.
//
// Status (2026-11-12): found by the volume run (seed 301). Cuts, deletes and moves in or of a quote, padded or in an item (`  > quoted in item⏎  > - list…`, `2. > quote⏎   > more⏎   >⏎…`): the blank line ourus raised after the quote written anew, unmarked. P4 (the user's rule: rare, odd spacing or a hand-built mark).
openBug('B444', 'P4', "A raised blank line after a quote loses its mark where a command rewrites the quote's lines", {
  'the case reduced': () => {
    // kept: a84f7b062ce9 842884329790 d084e05e03fb (seeds 901 to 1001)
    // kept: 0dba0cdf7abc f2a826c6de96 3b84488a4371 80fe6562b559 b2754b8e090b ab838157fb12
    // kept: b517f8d1028c ec4c9e662521 (seed 351)
    // kept: d3134ee14e0a (seed 501)
    // kept: 288778d7e7f6 ad8d689d4fa1 (seed 551: Enter in a quote's paragraph above its raised line, the mark put on the new line)
    // kept: 08d15623a1c0 6b2ef4395776 2cddb4c71ff9 7efe4c0f1776 (seed 601)
    // kept: f2b6fe227e06 (seed 651)
    // kept: d03a0cda43e0 1255142e57fa 7fa970d6d2e9 (seed 751)
    // kept: e55dd3d169a8 6f234a501e97 (seed 801)
    // kept: 7f6b7746419b 44219dd3e949 (seed 851: a cut of a callout's body, a text paste in a quoted list)
    assert.deepEqual(
      lostMarksOnText(
        '> [!note] Title\n>\n> xtmore\n\n- item\n',
        { type: 'cut' },
        { caret: 22, config: { flavor: 'gfm' }, auto: [27] },
      ),
      [],
    );
  },
});

// B445 [P4]. Shift-Enter in a text before its lone block-id line loses the raised blank line's mark
//
// Status (2026-11-12): found by the volume run (seed 301). `┃`⏎⏎̬^blk` (`quotes: atom`), Shift-Enter: the text's carried line written anew; B412's Enter case is fixed, this one not. P4 (the user's rule: rare, odd spacing or a hand-built mark).
openBug('B445', 'P4', "Shift-Enter in a text before its lone block-id line loses the raised blank line's mark", {
  'the case reduced': () => {
    // kept: d21ff0fb5bab (seed 1001)
    // kept: 576393e97c47
    // kept: 52422495cfad (seed 351)
    assert.deepEqual(
      lostMarksOnText(
        '`\n\n^blk\n',
        { type: 'shiftEnter' },
        { caret: 1, config: { flavor: 'obsidian', quotes: 'atom' }, auto: [2] },
      ),
      [],
    );
  },
});

// B446 [P4]. A raised line lost: a paste on blank lines after a block id, Shift-Enter between empty items or under an item's heading, Backspace in an item
//
// Status (2026-11-12): found by the volume run (seed 301). Three cases, one each, not read further yet: to split when read. P4 (the user's rule: rare, odd spacing or a hand-built mark).
openBug(
  'B446',
  'P4',
  "A raised line lost: a paste on blank lines after a block id, Shift-Enter between empty items or under an item's heading, Backspace in an item",
  {
    'the case reduced': () => {
      // kept: e06b329894ad (seed 1001: Shift-Enter on blank lines under an item)
      // kept: 6c4b82952103 7c2e3c3fb3d8
      // kept: 3714059e7389 1885f762c63f 93c61027d415 (seed 351)
      // kept: 8ec1374510d1 (seed 451)
      // kept: cc51ff642044 86efd78b19d1 (seed 551: a cut of unclosed math after a lone block-id line; Shift-Enter on a tab-led blank line after an item)
      // kept: a450d60d3fb3 b02ad0f2fead f8d8e896717c 05b970626541 (seed 601)
      // kept: e363c57af399 5627b3b1c114 d0ebe2247e39 (seed 701)
      // kept: 8cf6802a2e12 088e48298be5 (seed 751)
      // kept: 4616ab21dcb0 489601ef947c b65165b77c89 (seed 801)
      assert.deepEqual(
        lostMarksOnText(
          'Final line ^blk\n\n\n ',
          {
            type: 'paste',
            clipboard: {
              'text/plain': '- [x] done\n',
              'text/markdown': '- [x] done\n',
              'text/html': '<!-- ourus --><ul>\n<li>[x] done</li>\n</ul>\n',
            },
          },
          { caret: 19, config: { flavor: 'commonmark', quotes: 'container' }, auto: [16] },
        ),
        [],
      );
    },
  },
);

// B477 [P4]. A text deleted down to its block id loses the raised blank line's mark above it
//
// Status (2026-11-12): found by the volume run (seed 401). `para⏎⏎Final line┃ ^blk` (Obsidian, the
// blank line ours), Cmd-Backspace: the id moves to `para`, written `para⏎⏎^blk`, the blank line now
// part of `para`'s spelling of its id, its mark gone. B412's sibling (Shift-Enter there). P4 (low payoff).
openBug('B477', 'P4', "A text deleted down to its block id loses the raised blank line's mark above it", {
  'the case reduced': () => {
    // kept: 69ae548bb5db d278fc269ad5 f43bf2fc5918 (seeds 901 to 1001)
    // kept: 87c19af747f1 9c231a331c91 f726c8997a86
    // kept: 20fa02c3438c 6e92ae97ab79 (seed 451)
    // kept: f14bde4e36e4 (seed 501)
    // kept: 4285d00de13a 53dcf8252ea4 (seed 551)
    // kept: 0f646abe7777 cb5fa738be3e (seed 601)
    // kept: 94d998468318 (seed 651)
    // kept: 981cfcb74079 (seed 851)
    assert.deepEqual(
      lostMarksOnText(
        'para\n\nFinal line ^blk\n',
        { type: 'deleteSoftLineBackward' },
        { caret: 16, config: { flavor: 'obsidian' }, auto: [5] },
      ),
      [],
    );
  },
});

// B478 [P4]. A gap whose first blank line is ours, not its last, loses the mark where a command writes the gap
//
// Status (2026-11-12): found by the volume run (seed 401). `- q⏎- ┃x⏎⏎⏎- p`, the first blank line ours
// (a raised line, a line typed after it), Backspace: written `- qx⏎⏎⏎- p`, no mark. The writer marks a
// written gap's last line ours, never another (`#lastBlankLineOurs`); Enter before a fence after a
// raised line, Shift-Enter on blank lines at the end, a deleted last paragraph after code the same.
// P4 (low payoff: a mark on hand-built gaps).
openBug(
  'B478',
  'P4',
  'A gap whose first blank line is ours, not its last, loses the mark where a command writes the gap',
  {
    'the case reduced': () => {
      // kept: 9f6ca159ec3b (seed 901: a heading deleted after code)
      // kept: 28fd08a3720b df450ffcc39c e606a637c9f1 e7da1c0648c9
      // kept: 7137b7618f10 (seed 501)
      // kept: be5950473ccd (seed 851: Enter before an unclosed fence after a raised line)
      assert.deepEqual(
        lostMarksOnText(
          '- q\n- x\n\n\n- p\n',
          { type: 'deleteContentBackward' },
          { caret: 6, config: { flavor: 'commonmark', listParent: 'container' }, auto: [8] },
        ),
        [],
      );
    },
  },
);

// B495 [P4]. Shift-Tab on an item after a lone block-id line loses the raised blank line's mark before the id
//
// Status (2026-11-13): found by the volume run (seed 501). `itemx⏎⏎^id1⏎- other` (Obsidian, the blank line ours): `other` a paragraph now, written `itemx⏎⏎^id1⏎⏎other`, the first blank line's mark gone. B412's family. P4 (low payoff).
openBug(
  'B495',
  'P4',
  "Shift-Tab on an item after a lone block-id line loses the raised blank line's mark before the id",
  {
    'the case reduced': () => {
      // kept: c663d5da97c3
      assert.deepEqual(
        lostMarksOnText(
          'itemx\n\n^id1\n- other\n',
          { type: 'outdent' },
          { caret: 14, config: { flavor: 'obsidian', indentUnit: 'tab' }, auto: [6] },
        ),
        [],
      );
    },
  },
);

// B496 [P4]. A numbered quote pasted on a held padded line in an item loses the raised line's mark above
//
// Status (2026-11-13): found by the volume run (seed 501). `3. third⏎⏎   ◌⏎   more` (CommonMark, the blank line ours), `2. > quote⏎   > more` pasted: written `3. third⏎⏎   1. > quote…`, the mark gone. P4 (low payoff).
openBug('B496', 'P4', "A numbered quote pasted on a held padded line in an item loses the raised line's mark above", {
  'the case reduced': () => {
    // kept: 6b85d1f16f66
    assert.deepEqual(
      lostMarksOnText(
        '3. third\n\n   \n   more\n',
        {
          type: 'paste',
          clipboard: {
            'text/plain': '2. > quote\n   > more\n',
            'text/markdown': '2. > quote\n   > more\n',
            'text/html':
              '<!-- ourus --><ol start="2">\n<li>\n<blockquote>\n<p>quote\nmore</p>\n</blockquote>\n</li>\n</ol>\n',
          },
        },
        { caret: 13, config: { flavor: 'commonmark' }, auto: [9] },
      ),
      [],
    );
  },
});

// =================================================================================================
// Drop preflight
//
// `moveRefused` decides what a pickup offers, on a model of Markdown of its own, and refuses places
// the keyboard reaches.
// B520 [P4]. A move whose block lands beside a raised blank line writes the gap anew, unmarked
//
// Status (2026-11-14): seeds 901 to 1001. `- nested bullet⏎⏎nested bullet⏎⏎3. third`, the second blank
// line ours (Obsidian, `listParent: container`), Alt-Down on the item: written `nested bullet⏎- nested
// bullet⏎⏎3. third`, the blank line before `3.` unmarked; a table row, math, a paragraph or a callout's
// item moved alike. Where the mark follows the block whose gap it is, no bug (filed so). P4.
openBug('B520', 'P4', 'A move whose block lands beside a raised blank line writes the gap anew, unmarked', {
  'the case reduced': () => {
    // kept: 3a2841ad6abc 425ae7a0f476 46c7f5800d0e 685506cc39b0 7a9aeda9ab21
    assert.deepEqual(
      lostMarksOnText(
        '- nested bullet\n\nnested bullet\n\n3. third\n',
        { type: 'moveSubtreeDown' },
        { caret: 15, config: { flavor: 'obsidian', listParent: 'container' }, auto: [31] },
      ),
      [],
    );
  },
});
bugCluster('Drop preflight');

// =================================================================================================
// Typing and bracket pairing
//
// `autoClose` lists only fences by default, but inline pairs are what Obsidian's users have on:
// spec ranks bracket pairing `common`. The pair logic is prose-only, so it stops where a node
// doesn't exist yet or isn't prose.
bugCluster('Typing and bracket pairing');

// =================================================================================================
// Parser
//
// Differences from CommonMark and GFM, checked here against commonmark.js, micromark and cmark-gfm
// (the `cmarkgfm` Python package), and two cases of the parser's own bookkeeping. No one reference
// is enough: commonmark.js shares the tab and NBSP bugs, which is why comparing with it found
// nothing (dev/28-bugs.md's "what found nothing"), and the three split on B247 (an angle autolink's
// entities, decided: cmark-gfm's) and B249's control characters. cmark-gfm is what GitHub runs, so
// it decides GFM questions.
bugCluster('Parser');

// =================================================================================================
// Extension and public API
//
// Boundaries a host or an extension author meets, outside the editing commands.
bugCluster('Extension and public API');

// =================================================================================================
// Performance
//
// Quadratic where hosts call synchronously. Times are from this round's machine.
bugCluster('Performance');

// =================================================================================================
// HTML conversion
//
// `MdHtmlParser` (`src/parser/html-parser.ts`), paste from a page. All P3 by definition, all
// reproduced through `MdHtmlParser.parse` then rendering. Each entry is a mechanism, each row a
// case.
bugCluster('HTML conversion');

// B377 [P2], fixed 2026-11-12. A blank line ourus raised lost its mark where a cut, a delete, a move or
// a paste handed its gap on. Fixed by mechanism: a delete joining an empty item (its gap moved as written,
// `moveGap`); a block-id paragraph folded into the node above (`#carry`, its gap's origin); a split after
// a join, Enter over a selection (`split` passes the join's origin on); a paste beside a block apart from
// it (the copy's lines ours where the end's were) and into an empty note (`fillDocument`); the blank
// lines after a subtree written where what follows is, a node indented into a quote (`blankAsWas`); a
// heading with nothing under it no longer trades its line with its section's new end (`#scopeEnds`); a
// paste filling a blank line after its gap moved (`gap(…, 'first')` its own again). The check (`autoLost`)
// read the empty piece past a final line break as a line, and a run a change replaced on the far side
// of the change's text: both fixed. 58 of seeds 151 to 251's 68 kept cases pass, one refused; seeds 51
// and 101's kept cases not replayed (their reduced cases gone with an earlier session's scratchpad).
// not a bug (identical lines, the writer's naming either way): 16b6361cf0ff 1ba79a5cc551 3a4d57b2a2c5 50b29151a75e 7b6891e3a59c
// (Shift-Enter after an empty item, the raised line no longer needed, by design)
// not a bug: e06db67eedac
// (seed 851: moves carrying the raised line with the block whose gap it is)
// not a bug: 5cd0df1f970f cc9624b47534 1eeac0df1cfe 85312456b3a5
// (seeds 901 to 1001: moves carrying the raised line with the block whose gap it is, identical blocks
// swapped or duplicated, a paragraph indented into the quote its raised line set apart, blank lines in
// math nothing closes)
// not a bug: 0fa5e3e18c24 212f5e4742b8 23bff72d7953 6f446ee623cf 71ddd3f0ca85 57b0f1dfd251 5ad950cb1c9f
// not a bug: 83dc69c7ef5f 9469b5c7e65a ab6194065ca4 b8cf688ac036 be2197d9bc9e f723caebc47a f76f38298246
// not a bug: aa252e3c60e1 7647d02d699e e59980a6774a a23fe09fd86c a5c5e6d2cedd
// (seeds 901 to 1001: write failures this round's quote change made and fixed again before the round's end)
// not a bug: b01822733caf c66f5547cd8c eff9169def94 9df619633c40

// The id the next bug takes: raise it with each new bug. Ids aren't reused, a fixed bug's included, so
// this stays where it is when bugs go. The run fails on a bug at or past it, or on an id taken twice.

const NEXT_BUG_ID = 530;

reportBugs(NEXT_BUG_ID);
