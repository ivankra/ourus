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
// the answers, the one its comment leans to: a decision can delete it. Priorities (P1, P2, P3), the
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
import { executeCommand, leavesZoom, mapPos, MdFlavor, MdHtmlParser, MdTree, OurusDoc, OurusProse, OurusFailed, OurusRejected, OurusSuccess, OurusView, settlePlaceholders } from '../src/index.ts';
import * as extend from '../src/parser/extend.ts';
import { defineFlavor, gfmExtensions } from '../src/parser/extend.ts';
import { appliedText, assertApplied, assertNoWriteFailure, convertPastedHtml, executeAfter, executeOnText, firstBlockInlines, caseId, filedCases, htmlFailures, readUntriaged, REPORT_OF, scalingFactor, untriagedFailures, writeUntriaged, type UntriagedCase } from './lib/index.ts';

// -------------------------------------------------------------------------------------------------
// The runner

type Priority = 'P1' | 'P2' | 'P3';
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
  const got = error instanceof assert.AssertionError && error.generatedMessage ? `got ${JSON.stringify(error.actual)}` : error.message;
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
  policy: number;
}

/** What `bugs.baseline.json` holds: the bugs' counts, overall by priority and per cluster, and how each case fails. */
interface BugBaseline {
  readonly summary: ReturnType<typeof bugSummary> | null;
  readonly failures: Record<string, string>;
}

/** The bugs in this file, counted: by priority, and how many in each cluster. */
function bugSummary(): BugCounts & { cases: number; clusters: Record<string, number> } {
  const none = (): BugCounts => ({ open: 0, P1: 0, P2: 0, P3: 0, policy: 0 });
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
      attention.push(kinds.length ? `untriaged  ${name}: fails otherwise now, ${kinds[0]}\n           ${shown}` : `untriaged  ${name}: passes now\n           ${shown}`);
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
  const recorded: BugBaseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')) : { summary: null, failures: {} };
  const baseline = recorded.failures;
  const asked = process.argv.slice(2);
  const played = asked.length ? bugs.filter((bug) => asked.includes(bug.id)) : bugs;
  const failures: Record<string, string> = {};
  const summary = bugSummary();
  const attention = idProblems(nextId);
  if (JSON.stringify(recorded.summary) !== JSON.stringify(summary)) attention.push('summary  the counts in bugs.baseline.json are out of date: BUGS_UPDATE=1 records them');
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
      if (key in baseline && baseline[key] !== outcome.message) attention.push(`changed  ${key}\n           was ${baseline[key]}\n           now ${outcome.message}`);
      if (!(key in baseline)) attention.push(`new      ${key}\n           ${outcome.message}`);
      if (asked.length) console.log(`${key}\n  ${outcome.message}`);
    }
    if (open) stillOpen.push(bug);
    else attention.push(`FIXED    ${bug.id} ${bug.title}: every case passes, take it out of test/bugs.ts`);
  }
  const count = (prefix: string): number => stillOpen.filter((bug) => bug.rank.startsWith(prefix)).length;
  console.log(`${stillOpen.length} open bugs: ${count('P1')} P1, ${count('P2')} P2, ${count('P3')} P3; ${stillOpen.filter((bug) => bug.rank.endsWith('policy')).length} policy`);
  if (!asked.length) {
    const clusters = new Map<string, number>();
    for (const bug of stillOpen) clusters.set(bug.cluster, (clusters.get(bug.cluster) ?? 0) + 1);
    for (const [cluster, open] of clusters) console.log(`${String(open).padStart(5)}  ${cluster}`);
    console.log(`P1: ${stillOpen.filter((bug) => bug.rank.startsWith('P1')).map((bug) => bug.id).join(' ')}`);
    console.log(`next id: B${nextId}`);
  }
  // the cases the reports found that nobody filed: with every bug played, not some
  if (!asked.length) reportUntriaged(attention, process.env.BUGS_UPDATE === '1');
  if (process.env.BUGS_UPDATE === '1') {
    // (only the bugs played: the others keep what they had, but a bug taken out keeps nothing; sorted
    // by id, so a diff shows what moved)
    const owner = (key: string): OpenBug | undefined => bugs.find((bug) => key.startsWith(`${bug.id}: `));
    const kept = Object.entries(baseline).filter(([key]) => owner(key) && !played.includes(owner(key)!));
    const sorted = [...kept, ...Object.entries(failures)].sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }));
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

// =================================================================================================
// Copy, cut and paste (Markdown and plain text)
//
// Pastes the writer can't place where a quote shares an item's line or a lazy paragraph sits in
// nested quotes (B15, B16); a paste where a cut left the caret by a table, code, a rule, a footnote
// or HTML (B21); indented code from a plain-text clipboard dedented (B26); and a text cut across
// items not restored by pasting it back (B188); a bare marker taking in what follows it (B193);
// ourus's own clipboard read as a stranger's (B194, B195). The Markdown/plain-text paths only.
bugCluster('Copy, cut and paste (Markdown and plain text)');

// B16 [P3]. Pasting a child after a lazy paragraph ejects it from nested quotes
//
// Priority (2026-11-11): P3 (the user's): a fuzzer-built quote shape no key sequence in the volume runs reached.
//
// Location: `src/commands/paste.ts` (`pasteAtCommand`), `src/writer/write.ts` (gap placement).
//
// The item already has a lazy paragraph containing `"`. Adding the quoted child introduces a blank
// quoted line before that paragraph while copying its old tab-led line without a quote prefix. It
// consequently leaves the nested quotes; the operation fails with `root › 0: 1 children, read as
// 3`. When a new blank line ends laziness, explicitly continue the existing paragraph's containers
// before appending the new child.
openBug('B16', 'P3', 'Pasting a child after a lazy paragraph ejects it from nested quotes', {
  'a child pasted after a lazy paragraph stays in the nested quotes': () => {
    assertApplied(executeOnText('#\n>>-\t[a]:u\n\t"', { type: 'pasteAt', at: { parent: 4, after: 5 }, clipboard: { 'text/plain': '> a\n>\n> b' } }));
  },
});

// B26 [P3 partly fixed]. Pasting indented text into an empty document removes the common indentation, so indented code becomes prose
//
// Status (2026-11-05): verified on the current tree: an ourus clipboard of indented code pastes as
// code; plain text alone is still dedented (by design, for nested lists).
//
//   ""   paste text/plain "    code1\n    code2\n"   => "code1\ncode2\n"      (a paragraph)
//   ""   paste "\tcode1\n\tcode2\n"                 => "code1\ncode2\n"
//   ""   paste "    code\n\n    more\n"             => "code\n\nmore\n"
//   "- a\n" paste "    code1\n    code2\n" at 3     => "- a    code1\n      code2\n  \n"   (inline, and a whitespace-only line after)
//
// Copying an indented code block with ourus (`copy` of the node gives `"    code1\n    code2\n"`)
// and pasting it into an empty note therefore gives two prose lines. The common indentation is
// removed so that a nested item copied from a list pastes at the right depth, but a document whose
// only block is indented code has no list to undo. (Same round trip for `text/markdown`.)
openBug('B26', 'P3 partly fixed', 'Pasting indented text into an empty document removes the common indentation, so indented code becomes prose', {
  'plain-text indented code pasted into an empty note stays code': () => {
    assert.equal(appliedText(executeOnText('', { type: 'paste', clipboard: { 'text/plain': '    code1\n    code2\n' } })), '    code1\n    code2\n');
  },
  'plain-text tab-led code pasted into an empty note stays code': () => {
    assert.equal(appliedText(executeOnText('', { type: 'paste', clipboard: { 'text/plain': '\tcode1\n\tcode2\n' } })), '\tcode1\n\tcode2\n');
  },
});

// B188 [P3 policy]. A text cut across items, pasted back at the caret, doesn't restore the text
//
// A selection from inside one item into another (`copySelection: text`), cut, then pasted where the
// cut leaves the caret, almost never gives the text back. The clipboard is a fragment: its first
// line the end of one item's text, the rest whole lines. Paste reads it as nodes and puts them
// after the node at the caret, or as plain lines into the text (an item's line after the first then
// read as its text, escaped). A round trip needs a paste that joins the fragment's first line into
// the text before the caret, and its last into the text after: a new paste mode for ourus's own
// text copies (they are marked, `<!-- text -->`). That is a product decision.
//
//   - one⏎- two⏎- three, cut 4–10 (`e⏎- tw`) → `- ono⏎- three`; paste → `- ono⏎- e⏎- tw⏎- three`
//   - one⏎- two, cut 4–6 (`e⏎`) → `- on- two`; paste → `- one⏎  \- two`
//   para⏎- one⏎- two, cut 2–10 (`ra⏎- one`) → `pa⏎- two`; paste → `pa⏎- two⏎⏎ra⏎- one`
//
// Whole lines round-trip (`- one⏎- two`, 2–11 or 0–11), and so do paragraphs (Regression262).
openBug('B188', 'P3 policy', 'A text cut across items, pasted back at the caret, doesn\'t restore the text', {
  'a cut from inside one item into another pastes back': () => {
    const text = '- one\n- two\n- three';
    const cut = executeOnText(text, { type: 'cut' }, { anchor: 4, head: 10 });
    assert.equal(appliedText(executeAfter(cut, { type: 'paste', clipboard: assertApplied(cut).clipboard! })), text);
  },
  'a cut of an item\'s line ending pastes back': () => {
    const text = '- one\n- two';
    const cut = executeOnText(text, { type: 'cut' }, { anchor: 4, head: 6 });
    assert.equal(appliedText(executeAfter(cut, { type: 'paste', clipboard: assertApplied(cut).clipboard! })), text);
  },
  'a cut from a paragraph into a list pastes back': () => {
    const text = 'para\n- one\n- two';
    const cut = executeOnText(text, { type: 'cut' }, { anchor: 2, head: 10 });
    assert.equal(appliedText(executeAfter(cut, { type: 'paste', clipboard: assertApplied(cut).clipboard! })), text);
  },
});

// B347 [P3]. Copying an indented paragraph strips its indentation from the list it owns
//
// Status (2026-11-09): found by the sweep's copy→paste check (copied into an empty note, a paragraph
// came back as other blocks). A paragraph indented by spaces (`  > body`, a quote's) owning the list
// after it (`listParent: paragraph`): the copy takes the paragraph's columns off every line it copies,
// the list's too, which have an indentation of their own: an item's later line (`  b`) leaves the item
// (`b`). Location: `doc/copy.ts`, `markdownOf`, the node's first line's indentation taken as a prefix of
// all its lines.
openBug('B347', 'P3', 'Copying an indented paragraph strips its indentation from the list it owns', {
  'a quoted item\'s later line keeps the item\'s indentation': () => {
    // kept: 0f73d6f922bc
    const result = assertApplied(executeOnText('  > body\n\n- > a\n  > b\n', { type: 'copy', nodes: [1] }, { caret: 4 }));
    assert.equal(result.clipboard?.['text/plain'], '> body\n\n- > a\n  > b\n');
  },
  'an item\'s later line keeps it': () => {
    const result = assertApplied(executeOnText('  > body\n\n- > a\n  b\n', { type: 'copy', nodes: [1] }, { caret: 4 }));
    assert.equal(result.clipboard?.['text/plain'], '> body\n\n- > a\n  b\n');
  },
});

// B415 [P3]. A callout pasted over a nested callout's body runs into its title
//
// Status (2026-11-12): split from B237 (seed 201). `> > [!note] Title⏎> body text⏎◌`, the body and the
// held line after it selected, a callout pasted: written right after the title line, `> > [!note] Title⏎>
// > [!note] Title`, no line between, read as one callout (`root › 0: 2 children, read as 1`).
openBug('B415', 'P3', "A callout pasted over a nested callout's body runs into its title", {
  'a callout pasted over a nested callout\'s lazy body': () => {
    // kept: 1d0daae2bf61
    assertNoWriteFailure(executeOnText("> > [!note] Title\n> body text\n", { type: 'paste', clipboard: { 'text/plain': '> [!note] Title\n> body text\n' } }, { anchor: 20, head: 30, config: { flavor: 'obsidian', indentUnit: 'tab' }, placeholders: [30] }));
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
bugCluster('Moves, indent, outdent and duplicate across quotes and loose lists');

// B43 [P3]. Moving a list child out of a quote truncates text continued from the following quoted paragraph
//
// Priority (2026-11-11): P3 (the user's): a fuzzer-built quote shape no key sequence in the volume runs reached.
//
// Location: `src/writer/write.ts:532`.
//
// The moved item’s own paragraph contains b followed by a on the next source line. After the move,
// the serialized source reads only b as that item’s text. The check prevents committing the
// truncation, but the requested move is unusable. Keep the complete own-text extent when moving a
// node with quote-lazy continuations.
//
// Observed: write-failed:the text written doesn't read as the draft: root › 2: text "b\na", read as
// "b"
openBug('B43', 'P3', 'Moving a list child out of a quote truncates text continued from the following quoted paragraph', {
  'moving a list child out of a quote keeps its continuation': () => {
    assertNoWriteFailure(executeOnText('\n> -\n>   - b\n> a\n>-\n- ]\n>', { type: 'moveSubtree', to: { parent: 'root', after: 5 }, nodes: [3] }, { anchor: 10, head: 9 }));
  },
});

// B44 [P3]. Moving a reference-bearing quote drops lazy reference lines from a surviving item’s text
//
// Priority (2026-11-11): P3 (the user's): a fuzzer-built quote shape no key sequence in the volume runs reached.
//
// Location: `src/commands/move-subtree.ts:72`.
//
// The source includes a reference definition that is ordinary continuation text in its current
// quote/list context. Moving the quote changes the context of those lines, so readback stops the
// surviving paragraph at b even though the draft includes q and the reference line. Escape or
// re-prefix those continuation lines in the new context.
//
// Observed: write-failed:the text written doesn't read as the draft: root › 1 › 1: text "b\nq\n[r]:
// /u", read as "b"
openBug('B44', 'P3', 'Moving a reference-bearing quote drops lazy reference lines from a surviving item’s text', {
  'moving a quote keeps a surviving item\'s lazy reference lines': () => {
    assertApplied(executeOnText('[r]:u\nH\n=\n>-\n>   - b\n>q\n[r]: /u\n-', { type: 'moveSubtree', to: { parent: 2, after: 3 }, nodes: [5] }, { caret: 17 }));
  },
});

// B45 [P3]. Moving a reference-only item activates a literal child list marker
//
// Priority (2026-11-11): P3 (the user's): a fuzzer-built quote shape no key sequence in the volume runs reached.
//
// Location: `src/writer/draft.ts` (moved-line escaping), `src/writer/write.ts` (lazy lines).
//
// The moved reference-only item has a paragraph child whose text is the literal `- x`. The
// attempted output is `-\n- [a]:u\n\t- x\n>\t-`; that child is now read as an actual list item, and
// the move returns `a paragraph, read as a item`. The context change activates a marker that used
// to be literal continuation text. Escape or respell that child's line in the new context. This is
// not the reference-line truncation in finding B44: here a surviving ordinary paragraph acquires
// structural list meaning instead of losing reference text.
openBug('B45', 'P3', 'Moving a reference-only item activates a literal child list marker', {
  'moving a reference-only item keeps its child paragraph literal': () => {
    assertNoWriteFailure(executeOnText('-\n>\t-\n>     + [a]:u\n\t- x', { type: 'moveSubtree', nodes: [4], to: { parent: 'root', after: 1 } }, { caret: 24 }));
  },
});

// B47 [P3]. Duplicating an indented paragraph strips a structurally necessary blank line's indentation in its list
//
// Priority (2026-11-11): P3 (the user's): a fuzzer-built quote shape no key sequence in the volume runs reached.
//
// Location: `src/commands/duplicate-subtree.ts:41` and `src/writer/write.ts` (copied subtree
// prefix/blank-line shifting).
//
// This returns `OurusRejected('write-failed')`, `root › 1: 1 children, read as 2`. With the default
// `listParent: paragraph`, the paragraph owns the list. Its empty parent item contains a two-space
// blank line followed by a nested empty item. That blank line's indentation keeps the parent item
// open.
//
// The writer attempts ` p\n\n-\n  \n  -\np\n\n-\n\n  -`: the copy's blank line has lost its two
// spaces. The empty parent then closes, and the formerly nested item is read beside it. Duplication
// must preserve the blank line's continuation column even when normalizing the copied paragraph's
// leading whitespace.
//
// The simpler `run(' p\n- a\n', { type: 'duplicateSubtree' }, 1)` succeeds but writes ` p\n-
// a\n\np\n- a\n`: the copied paragraph silently loses its leading space. Without an owned list,
// copying ` p\n` preserves that space. This supports the copied-subtree prefix calculation, rather
// than generic paragraph duplication, as the affected path.
//
// Validation: the public command reproduces with no marks, special configuration, tabs, or mixed
// endings. Removing the leading space from ` p` makes duplication succeed. B36 concerns a table
// with an owned loose list losing a root; this reproducer has no table, and the readback mismatch
// is the empty item's nested list becoming siblings after a whitespace-only line is rewritten.
openBug('B47', 'P3', 'Duplicating an indented paragraph strips a structurally necessary blank line\'s indentation in its list', {
  'duplicating an indented paragraph keeps its list\'s indented blank line': () => {
    assertNoWriteFailure(executeOnText(' p\n\n-\n  \n  -', { type: 'duplicateSubtree' }, { caret: 2 }));
  },
  'a duplicated indented paragraph keeps its leading space': () => {
    assert.equal(appliedText(executeOnText(' p\n- a\n', { type: 'duplicateSubtree' }, { caret: 1 })), ' p\n- a\n\n p\n- a\n');
  },
});

// B52 [P3 partly fixed]. A quote paragraph whose first line has one extra space can't be moved onto an item's marker line
//
// Priority (2026-11-11): P3 (the user's): a fuzzer-built quote shape no key sequence in the volume runs reached.
//
// Its `moveSubtreeUp` writes now, with spaces or tabs (`- > a⏎  >⏎  >  b`, Alt-Up on `b`: `- >  b⏎
// >⏎  > a`). Still failing: moving the paragraph before it out of the quote, `- > a⏎  >⏎  >  b`
// with `quotes: container`, `a` moved to the root's start (`moveSubtree`, `{ parent: 'root', after:
// null }`). `b` goes onto the marker line, but its line is written without its `  > ` prefix (`
// b`), so the marker has nothing to go over (`a marker's line written over " b"`; before this round
// it failed at the re-indent's check).
openBug('B52', 'P3 partly fixed', 'A quote paragraph whose first line has one extra space can\'t be moved onto an item\'s marker line', {
  'moving a paragraph out of a quote above a padded paragraph writes': () => {
    assertNoWriteFailure(executeOnText('- > a\n  >\n  >  b', { type: 'moveSubtree', nodes: [3], to: { parent: 'root', after: null } }, { config: { quotes: 'container' } }));
  },
});

// B179 [P3]. Shift-Tab on an empty quote nested in a quote leaves the caret after its bare `>`
//
// Carried over from the previous round (dev/23-bugs.md).
//
// The empty quote is written without the space after its `>`, where the caret goes.
openBug('B179', 'P3', 'Shift-Tab on an empty quote nested in a quote leaves the caret after its bare `>`', {
  'Shift-Tab on a nested empty quote leaves the caret at its text': () => {
    const result = assertApplied(executeOnText('> >', { type: 'outdent' }));
    // text ">", caret 1, after the `>`: in markup
    assert.notEqual(result.view.locate(result.view.selection.head).zone, 'prefix');
    assert.equal(result.view.doc.text, '> ');
  },
});

// B181 [P3]. Shift-Tab on a paragraph of nested quotes before an unclosed fence gives a surviving node another id
//
// Carried over from the previous round (dev/23-bugs.md).
//
// Which child owns the nested quote's first line changes (identity of shared container lines).
openBug('B181', 'P3', 'Shift-Tab on a paragraph of nested quotes before an unclosed fence gives a surviving node another id', {
  'Shift-Tab before an unclosed fence in nested quotes keeps ids': () => {
    assertNoWriteFailure(executeOnText('> >e\n>>```', { type: 'outdent' }));
  },
});

// B190 [P3]. Indenting an item takes in a fence at an in-between indent after it
//
// Status (2026-11-05): found by `node test/sessions.ts` (its two `write-failed` groups, held in the
// baseline).
//
// The seam check (`#apart` in `src/writer/draft.ts`) reads the subtree above from `#lastLines`,
// which gives a nested item at its old indentation (` - item`, `   - nested bul`), while the writer
// writes it at its new one (`  - item`, `- nested bul`). At the new one, the item's content column
// is 2 and takes in the next line (the fence, the quote); at the old one the check sees them apart.
// A plain paragraph there is refused as it should be (`not-expressible`); a bare `  > q` too.
// `#lastLines` lines up a node moved in itself (`#movedIn`), and one moved up from deeper in what it
// reads (B303's fix, 2026-11-07, which settled the outdent case: refused now, a test in
// `commands.test.ts`), not a descendant re-indented with it, nor a paragraph the command made an item.
// A refusal either way: only its reason is wrong.
openBug('B190', 'P3', 'Indenting an item takes in a fence at an in-between indent after it', {
  'indenting an item over a fence at an in-between indent is refused, not failed': () => {
    assertNoWriteFailure(executeOnText('x\n\n\\- \n - item\n  ```', { type: 'indent' }, { caret: 3, config: { flavor: 'commonmark' } }));
  },
});

// B197 [P3]. Indenting loose paragraphs in an item headed by an empty heading ejects them
//
// `e` and `m` should become `n`'s list, inside the item; they are written at column 0. Relevant:
// `blocksIntoItems` (`src/commands/indent.ts`) and how the writer places a list in an item's
// section. P3: an empty heading first in an item is an unusual shape.
openBug('B197', 'P3', 'Indenting loose paragraphs in an item headed by an empty heading ejects them', {
  'indenting loose paragraphs in an item headed by an empty heading keeps them in it': () => {
    // writes - #⏎  n⏎⏎- e⏎- m
    assertNoWriteFailure(executeOnText('- #\n  n\n\n  e\n\n  m', { type: 'indent', nodes: [3, 4] }, { anchor: 6, head: 14 }));
  },
});

// B359 [P3]. Indenting a selection of a quote's paragraphs drops their `>`
//
// Status (2026-11-09): found by the sessions. `> a quote⏎>⏎> over two lines⏎>⏎> ┃` (held), a selection over its
// paragraphs, Tab (`listParent: container`): written `- over two lines⏎- `, out of the quote.
openBug('B359', 'P3', 'Indenting a selection of a quote\'s paragraphs drops their `>`', {
  'Tab on a selection in a quote': () => {
    // kept: dddd317ee7f1
    // kept: 9e9cab4a3aff
    assertNoWriteFailure(executeOnText("> a quote\n>\n> over two lines\n>\n> \n", { type: "indent" }, { anchor: 33, head: 12, config: { flavor: "commonmark", listParent: "container" }, placeholders: [33] }));
  },
});

// B416 [P3]. Indenting a held empty paragraph that owns a list turns it into an item that takes in the heading after
//
// Status (2026-11-12): split from B237 (seed 151). `Final line ^blk⏎⏎◌⏎1. num⏎  #  > more`, Tab on the
// held empty paragraph (its list under it, `listParent: paragraph`): written `- ⏎→1. num⏎  #  > more`,
// the padded heading after it read into the list (`root: 2 children, read as 1`).
openBug('B416', 'P3', 'Indenting a held empty paragraph that owns a list turns it into an item that takes in the heading after', {
  'Tab on a held empty paragraph owning a list, a padded heading after it': () => {
    // kept: b72751003129
    assertNoWriteFailure(executeOnText("Final line ^blk\n\n\n1. num\n  #  > more\n", { type: 'indent' }, { caret: 17, config: { flavor: 'gfm', indentUnit: 'tab' }, placeholders: [17] }));
  },
});

// B417 [P3]. Indenting a selection over a held blank line in an item writes it as an item of its own
//
// Status (2026-11-12): split from B237 (seed 151). `- > quoted in item⏎⏎    second para⏎⏎    ◌⏎⏎    graph`,
// Tab over the held empty paragraph and the one after it: written `- ⏎- graph`, the held paragraph a
// bare marker (`root: 1 children, read as 3`).
openBug('B417', 'P3', 'Indenting a selection over a held blank line in an item writes it as an item of its own', {
  'Tab over a held empty paragraph in an item and the paragraph after it': () => {
    // kept: ff3c853af6ed
    assertNoWriteFailure(executeOnText("- > quoted in item\n\n    second para\n\n    \n\n    graph of child two\n", { type: 'indent' }, { anchor: 37, head: 47, config: { flavor: 'commonmark', quotes: 'container' }, placeholders: [41] }));
  },
});

// =================================================================================================
// Enter and Shift-Enter in quotes, callouts and quoted lists
//
// Enter and Shift-Enter inside a quote or callout, or in a quoted list or task, either refuse
// (`write-failed`; B61 is the most ordinary: the end of the first line of a two-line quote in an
// item followed by a blank line) or put the caret and the following lines in the wrong place (B60).
bugCluster('Enter and Shift-Enter in quotes, callouts and quoted lists');

// B357 [P3]. Shift-Enter right after a padded marker writes the text below it a column off
//
// Status (2026-11-09): found by the sessions. `>-┃  a quote⏎> over two lines`, Shift-Enter after the marker: the text
// goes below it, its next line one column further than the text (`>  over two lines`). The same on a
// padded numbered item (`1.┃  \\> quote`, `quotes: atom`).
openBug('B357', 'P3', 'Shift-Enter right after a padded marker writes the text below it a column off', {
  'Shift-Enter after a quoted padded marker': () => {
    // kept: 49df03a0980c cf3ab9103963 ea9c546f5356 5212c99fde3c (seed 151)
    // kept: e09811229861
    // kept: 20b6724dbbd5
    assertNoWriteFailure(executeOnText(">-  a quote\n> over two lines\n", { type: "shiftEnter" }, { caret: 3, config: { flavor: "gfm", quotes: "container" } }));
  },
  'Shift-Enter after a padded numbered marker': () => {
    // kept: e8ca114ceb78
    assertNoWriteFailure(executeOnText("   1.  \\> quote\n       > more\n", { type: "shiftEnter" }, { caret: 8, config: { flavor: "obsidian", quotes: "atom" }, auto: [7] }));
  },
});

// B366 [P3]. Enter over a selection from a padded item into the next fails to write
//
// Status (2026-11-09): found by the sessions. A selection from inside `-  next- [x] outline` (padded) over the next
// lines, Enter: written `- ⏎- ⏎`, four roots read as five.
openBug('B366', 'P3', 'Enter over a selection from a padded item into the next fails to write', {
  'Enter over the selection': () => {
    // kept: 5cd02ae81972
    assertNoWriteFailure(executeOnText("  ```js\n  ```\n-  next- [x] outline\n  \n  [ ] write spec\n- [ ] draft\n- [ ] review\n", { type: "enter" }, { anchor: 17, head: 34, config: { flavor: "gfm", indentUnit: "tab" } }));
  },
});

// =================================================================================================
// Backspace, Delete and joins around quotes, tasks and headings
//
// Backspace and Delete at the edge of a quote, callout, task or heading either refuse (B73: the
// start of an item holding a multi-line callout) or join in a way that loses structure: a heading
// is demoted, a checkbox stays as literal text, an unrelated paragraph becomes a child.
bugCluster('Backspace, Delete and joins around quotes, tasks and headings');

// B203 [P3 policy]. Joining after a trailing backslash escapes the lower text's first character
//
// `foo\` + `*bar*` makes `\*`: the literal backslash stops rendering and the emphasis goes.
// Plain-text joins forming constructs (`&` + `amp;`) are accepted; this is the one that drops a
// visible character. To decide: write `\\` for the upper text's backslash, or leave it as every
// text editor would.
openBug('B203', 'P3 policy', 'Joining after a trailing backslash escapes the lower text\'s first character', {
  'a join after a trailing backslash keeps it visible': () => {
    // - foo\*bar*: Delete at 6 too. One answer of two (see above): a decision may delete this case.
    assert.equal(appliedText(executeOnText('- foo\\\n- *bar*\n', { type: 'deleteContentBackward' }, { caret: 9 })), '- foo\\\\*bar*\n');
  },
});

// B308 [P3]. Taking an item's heading marks off fails before a lazy `-|` line
//
// Location: `src/commands/backspace.ts` (the heading's `#`s taken off), the writer's seam between the
// item's text and the paragraph below it, in GFM and Obsidian (a table's delimiter row?).
//
// `- # ┃h⏎  x⏎-|`, Backspace or Cmd-Backspace: `root › 0: text "h", read as "h⏎x⏎-|"`: no blank line
// written between the text and its child paragraph. CommonMark writes `- h⏎⏎  x⏎-|`; with another last
// line than `-|` it writes. Not B197.
openBug('B308', 'P3', 'Taking an item\'s heading marks off fails before a lazy `-|` line', {
  'the heading becomes text, the paragraph below it its own': () => {
    // kept: fda1369fdb4a (seed 201: an item's heading marks taken off before a table's row)
    for (const flavor of ['gfm', 'obsidian'] as const) {
      // root › 0: text "h", read as "h⏎x⏎-|"
      assertNoWriteFailure(executeOnText('- # h\n  x\n-|', { type: 'deleteSoftLineBackward' }, { caret: 4, config: { flavor } }));
    }
  },
});

// =================================================================================================
// Code, math and comment blocks
//
// Fenced code, `$$` math and `%%` comments: a block with an unusual closing fence, a
// whitespace-only line or a quote around it loses or changes its payload on copy, cut, indent,
// outdent or move; typing or Backspace at the fence edges deletes more than it should; an empty
// code block's deletion can take its owned list with it (B90, only with `listParent: block`).
bugCluster('Code, math and comment blocks');

// B92 [P3]. Outdenting indented code after a quoted partial tab changes its payload
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
openBug('B92', 'P3', 'Outdenting indented code after a quoted partial tab changes its payload', {
  'outdenting indented code after a quoted partial tab keeps its payload': () => {
    assertNoWriteFailure(executeOnText('> \t    code', { type: 'outdent', nodes: [2] }, { caret: 3 }));
  },
  'outdenting indented code after a quoted partial tab keeps a shorter payload': () => {
    assertNoWriteFailure(executeOnText('> \t  code', { type: 'outdent', nodes: [2] }, { caret: 3 }));
  },
});

// B94 [P3]. Moving open delimiter blocks across quote boundaries swallows neighbors
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
openBug('B94', 'P3', 'Moving open delimiter blocks across quote boundaries swallows neighbors', {
  'indenting open math under a quote keeps the rows apart': () => {
    // attempted: >⏎>* $$⏎>
    assertNoWriteFailure(executeOnText('>\n* $$\n>', { type: 'indent' }, { caret: 6, config: { flavor: 'obsidian' } }));
  },
  'outdenting open code keeps the item after it': () => {
    // attempted: >```⏎>-
    assertNoWriteFailure(executeOnText('>>```\n>-', { type: 'outdent', nodes: [2] }, { caret: 8 }));
  },
});

// B95 [P3]. Moving code-bearing items across columns changes their code type
//
// Location: `src/writer/write.ts` (shifted item/code indentation).
//
// The moved item's text is indented code. The writer attempts `1. \t[\n-\n> a`, where the same tab
// now serves as list padding and `[` becomes paragraph text. Readback rejects it as `a
// indented_code text, read as a paragraph one`. Changing the container/marker column must preserve
// the code indentation relative to the item's content column, not reuse the old tab verbatim.
//
// Another code-type variant, grouped here: moving node 5 of `]\n>-\n\n> \t\x60\x60\x60` under node
// 2 as its first child writes its fence at indented-code depth and changes fenced code into
// indented code. This is different from finding B92's payload-space loss during outdent: the code's
// block type itself changes during a move.
openBug('B95', 'P3', 'Moving code-bearing items across columns changes their code type', {
  'moving a code item keeps it code': () => {
    // attempted: 1. →[⏎-⏎> a
    assertNoWriteFailure(executeOnText('-\n>a\n>1. \t[', { type: 'moveSubtree', nodes: [4], to: { parent: 'root', after: null } }, { caret: 11 }));
  },
  'moving a fence under an item keeps it fenced': () => {
    assertNoWriteFailure(executeOnText(']\n>-\n\n> \t```', { type: 'moveSubtree', nodes: [5], to: { parent: 2, after: null } }));
  },
});

// B206 [P3]. A line break pasted in an indented fence's indentation fails to write
//
// The caret is inside the opener's indentation. `lineBreakAtOpening` (`src/commands/code.ts:108`)
// acts at the opening's start only, so the indentation splits. The same family as B201, fixed for
// quote atoms by taking the spaces before the first `>` as the quote's start (`atQuoteStart`).
openBug('B206', 'P3', 'A line break pasted in an indented fence\'s indentation fails to write', {
  'a line break in an indented fence\'s indentation writes': () => {
    // writes # a⏎⏎␠⏎␠```⏎
    assertNoWriteFailure(executeOnText('# a\n\n  ```\n', { type: 'pastePlain', text: '\n' }, { caret: 6, config: { flavor: 'obsidian' } }));
  },
});

// B207 [P3]. Backspace before a math block after a lone block id fails to write
//
// `atOpeningStart` (`src/commands/code.ts:400`) takes the blank line; right under `^r` the block
// reads apart from the id. The neighbouring HTML case is refused (`<div⏎⏎┃```, dev/28-bugs.md): the
// same refusal fits here.
openBug('B207', 'P3', 'Backspace before a math block after a lone block id fails to write', {
  'Backspace before math after a lone block id is refused, not failed': () => {
    // writes o⏎⏎^r⏎$$
    assertNoWriteFailure(executeOnText('o\n\n^r\n\n$$', { type: 'deleteContentBackward' }, { caret: 7, config: { flavor: 'obsidian' } }));
  },
});

// B294 [P3]. Indenting a fence indented one space can't write its tab-led code
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
openBug('B294', 'P3', 'Indenting a fence indented one space can\'t write its tab-led code', {
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

// B299 [P3]. Moving an unclosed code or math block drops its last blank line
//
// Location: `src/writer/write.ts` (a moved block's payload and the blank lines after it).
//
// An unclosed block may end at its list's end, a blank line its last code line. Moved, that line is
// lost: `- m⏎  ```⏎  let x;⏎  ```-⏎ ⏎#`, `quotes: atom`, Alt-↓ on the code writes `- m⏎#⏎```⏎let
// x;⏎```-⏎`: `text "let x;⏎```-⏎", read as "let x;⏎```-"`; `- - $$⏎⏎ ` (Obsidian), Shift-Tab:
// written `- ⏎- $$⏎⏎`, `text "⏎", read as ""`. No quote or mark needed. Not B94 (a block crossing a
// quote), nor B205 (a gap after an unclosed block): here the line is the block's. Seed 42 sessions
// 12574, 77403. P3.
openBug('B299', 'P3', 'Moving an unclosed code or math block drops its last blank line', {
  'moving unclosed code keeps its last blank line': () => {
    assertNoWriteFailure(executeOnText('- m\n  ```\n  let x;\n  ```-\n \n#', { type: 'moveSubtreeDown' }, { caret: 27, config: { flavor: 'commonmark', quotes: 'atom' } }));
  },
  'outdenting unclosed math keeps its last blank line': () => {
    assertNoWriteFailure(executeOnText('- - $$\n\n ', { type: 'outdent' }, { caret: 7, config: { flavor: 'obsidian', quotes: 'container' } }));
  },
});

// B326 [P3]. Two line breaks inserted before an opening delimiter fail to write
//
// Location: `src/commands/typing.ts` (`insertTextCommand`), `src/commands/code.ts` (`lineBreakAtOpening`
// takes one line ending, `editInCode`).
//
// `# h⏎⏎┃$$⏎x⏎$$` (Obsidian), inserting `⏎⏎` at once (a text replacement's, an IME's): `root › 0: 1 blank
// lines after its text, read as 3`; `- ┃```⏎  x⏎  ```` the same: `root: 1 children, read as 2`. With one
// line break both write. A run of them goes into the atom's string, blank lines before what the parser
// reads as its start. Not B205. (2026-11-11: the item's fence case writes now, the blank line Enter
// makes there that item's.)
openBug('B326', 'P3', 'Two line breaks inserted before an opening delimiter fail to write', {
  'two line breaks before a math block\'s opening write': () => {
    // root › 0: 1 blank lines after its text, read as 3
    assertNoWriteFailure(executeOnText('# h\n\n$$\nx\n$$', { type: 'insertText', text: '\n\n' }, { caret: 5, config: { flavor: 'obsidian' } }));
  },
});

// =================================================================================================
// Tab-led, padded and lazy-continuation lines
//
// Lines led by tabs, items with padded marker spacing and lazy continuation lines. Mostly come from
// imported files rather than typing, so all P3. The writer cannot place the continuation at the
// column the move or duplicate needs, so the edit is refused or the text changes.
bugCluster('Tab-led, padded and lazy-continuation lines');

// B343 [P3]. A line break pasted before a tab-led fence after a quote loses the tab
//
// Status (2026-11-06): verified on the current tree; found by the diff suite, in both copies.
//
// `x⏎>b⏎┃→~~~` (GFM), plain paste of a line break: `root › 2: text "→\~~~", read as "\~~~"`. The
// paragraph's text keeps the tab before its escaped fence, the written line doesn't.
openBug('B343', 'P3', 'A line break pasted before a tab-led fence after a quote loses the tab', {
  'a line break pasted before a tab-led fence writes': () => {
    assertNoWriteFailure(executeOnText('x\n>b\n\t~~~\n', { type: 'pastePlain', text: '\n' }, { caret: 5, config: { flavor: 'gfm' } }));
  },
});

// B344 [P3]. Tab-led lines pasted after a held padding fail to write
//
// Status (2026-11-06): verified on the current tree, a hand-built mark; found by the diff suite, in
// both copies.
//
// `-  ┃``` x` with the padding's space held (Placeholder17's state), plain paste of `- a⏎→- b⏎→→- c`:
// `the writer can't write a line of node 1's text starting with a tab, at another column than done()
// gave it`, B155's message.
openBug('B344', 'P3', 'Tab-led lines pasted after a held padding fail to write', {
  'tab-led lines pasted after a held padding write': () => {
    assertNoWriteFailure(executeOnText('-  ``` x\n', { type: 'pastePlain', text: '- a\n\t- b\n\t\t- c\n' }, { caret: 3, placeholders: [2], config: { flavor: 'commonmark' } }));
  },
});

// B155 [P3]. Moving a subtree down cannot preserve a tab-led lazy continuation
//
// Location: `src/writer/write.ts:601`.
//
// A quote subtree containing a lazy line led by a tab passes the move’s semantic checks, but the
// writer cannot reproduce that line at its destination column. It returns an internal writer
// failure. The move needs column-aware spelling or an expressibility refusal before writing.
//
// Observed: write-failed:the writer can't write a line of node 4's text starting with a tab, at
// another column than done() gave it
openBug('B155', 'P3', 'Moving a subtree down cannot preserve a tab-led lazy continuation', {
  'moving a subtree down keeps a tab-led lazy line': () => {
    assertNoWriteFailure(executeOnText('>b\n>>>q\n\tc\n#', { type: 'moveSubtreeDown', nodes: [4] }, { anchor: 1, head: 9 }));
  },
});

// B156 [P3]. Moving a tab-padded item before an existing child paragraph merges two children
//
// Location: `src/writer/write.ts:260`.
//
// The moved item’s content column and the following block’s indentation are not kept apart. The
// draft expects the existing paragraph to remain a separate child, but the serialized document
// reads one fewer child. Recompute the following block’s indentation/separation when a padded item
// is inserted before it.
//
// Observed: write-failed:the text written doesn't read as the draft: root › 0: 2 children, read as
// 1
openBug('B156', 'P3', 'Moving a tab-padded item before an existing child paragraph merges two children', {
  'a tab-padded item moved before a child paragraph keeps it apart': () => {
    assertNoWriteFailure(executeOnText('- a\n\n  b\n- \tf', { type: 'moveSubtree', to: { parent: 1, after: null } }, { caret: 13 }));
  },
});

// B157 [P3]. Indenting a tab-padded item absorbs its following blocks into its own text
//
// Location: `src/commands/indent.ts:39`.
//
// The item originally has a nested block and a reference-definition continuation. After indenting
// under the numbered item, its text is supposed to remain foo, with the blocks kept structurally
// separate. Instead, the resulting content-column calculation makes those lines lazy paragraph
// text. The command fails readback.
//
// Observed: write-failed:the text written doesn't read as the draft: root › 0 › 0: text "foo", read
// as "foo\n    - d\n[r]: /u"
openBug('B157', 'P3', 'Indenting a tab-padded item absorbs its following blocks into its own text', {
  'indenting a tab-padded item keeps its blocks out of its text': () => {
    assertNoWriteFailure(executeOnText('2.\n-\tfoo\n    - d\n[r]: /u', { type: 'indent', nodes: [2] }, { caret: 8 }));
  },
});

// B159 [P3]. Typing multiple fence characters mishandles a tab-led following line
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
openBug('B159', 'P3', 'Typing multiple fence characters mishandles a tab-led following line', {
  'typing fence characters keeps a tab-led line after it': () => {
    assertNoWriteFailure(executeOnText('   - \n\t- c', { type: 'insertText', text: '```\nx\n```' }, { caret: 5 }));
  },
});

// B160 [P3]. Moving a tab-padded quoted paragraph can turn it into a quote container
//
// Location: `src/writer/write.ts:1505–1521` (prefix shifting).
//
// Node 4 is a paragraph whose text is a simple quote containing `:`. Moving it before the code
// inside node 1 attempts `> > \t:\n>\x60\x60\x60\n-`. The tab now puts `:` at indented-code depth
// inside the inner quote, changing the outline node from a paragraph to a quote container. Readback
// returns `a paragraph, read as a quote`. Rebase tabs when adding quote prefixes so prose does not
// acquire code/container structure. The node is not code before the move, unlike finding B95.
openBug('B160', 'P3', 'Moving a tab-padded quoted paragraph can turn it into a quote container', {
  'moving a tab-padded quoted paragraph keeps it a paragraph': () => {
    // attempted: > > →:⏎>```⏎-
    assertNoWriteFailure(executeOnText('>```\n-\n> \t:', { type: 'moveSubtree', nodes: [4], to: { parent: 1, after: null } }, { caret: 5 }));
  },
});

// B165 [P3]. Outdenting an item with a lazy-headed table keeps the table's indentation
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
openBug('B165', 'P3', 'Outdenting an item with a lazy-headed table keeps the table\'s indentation', {
  'outdenting an item with a lazy-headed table cuts the table\'s indentation': () => {
    assertNoWriteFailure(executeOnText('- item\n| a | b |\n  |---|---|\n', { type: 'outdent' }, { caret: 2 }));
  },
});

// B166 [P3]. Clearing a padded item's first line lets its loose paragraph replace the emptied text
//
// Default configuration, text `"-  more\n   \n  After the quote.\n\n- b\n"`, caret 7, command
// `deleteSoftLineBackward`. Actual: `write-failed`, `root › 0: text "", read as "After the
// quote."`.
//
// Expected: empty the first line while preserving its existing loose paragraph and following
// sibling. The command's empty text is not held separately in the serialization, so the loose
// paragraph becomes the item's own text. This is not B71's extra blank line on removing a final
// empty sibling: no sibling is removed here and the wrong text is assigned to the surviving item.
// Relevant path: `src/commands/backspace.ts:44` onward and empty-text normalization in the writer.
// Clearing only part of `more` succeeds. Without the whitespace-only line (`-  a┃⏎⏎     b`) it
// writes now (Regression268): what remains is that line, which the emptied item's text doesn't hold
// apart from the paragraph after it.
openBug('B166', 'P3', 'Clearing a padded item\'s first line lets its loose paragraph replace the emptied text', {
  'clearing a padded item\'s first line keeps its loose paragraph apart': () => {
    assertNoWriteFailure(executeOnText('-  more\n   \n  After the quote.\n\n- b\n', { type: 'deleteSoftLineBackward' }, { caret: 7 }));
  },
});

// B192 [P3]. A plain paste with a tab-led line into an item whose padding holds a placeholder fails to write
//
// Status (2026-11-05): found by `node test/heavy.ts` (`diff`, failing in both copies); fails at the
// last commit too.
//
// The item's second space past its marker is held (a placeholder at 2), and the pasted text's later
// line starts with a tab. Without the placeholder the paste writes (`-  xa⏎   →b`); with spaces
// (`a⏎  b`) too. The held space and the tab's column disagree about where the text's later lines
// start.
openBug('B192', 'P3', 'A plain paste with a tab-led line into an item whose padding holds a placeholder fails to write', {
  'a tab-led plain paste into a held padding writes': () => {
    assertNoWriteFailure(executeOnText('-  x\n', { type: 'pastePlain', text: 'a\n\tb' }, { caret: 4, config: { flavor: 'commonmark' }, placeholders: [2] }));
  },
});

// B280 [P3]. Enter at the start of a `-` under a reference definition writes an item
//
// Location: `src/commands/enter.ts` (`enterAtTextStart: stay`), the escapes `done()` gives a moved
// line.
//
// `[a]:f⏎-` is a definition and a paragraph `-` (cmark-gfm, commonmark.js, micromark and ourus
// agree), not an empty item. Enter at its start under `enterAtTextStart: stay` writes `[a]:f⏎⏎-`:
// past the blank line the `-` is an item, unescaped: `root › 1: a paragraph, read as a item`. `+`
// and `1.` too. The default writes `[a]:f⏎⏎⏎\-`, escaped. `p⏎-` stays (`p⏎-⏎`). P3: non-default
// option, a lone marker as a definition's lazy line.
openBug('B280', 'P3', 'Enter at the start of a `-` under a reference definition writes an item', {
  'Enter staying at a marker-like line under a definition writes': () => {
    for (const marker of ['-', '+', '1.']) {
      assertNoWriteFailure(executeOnText(`[a]:f\n${marker}`, { type: 'enter' }, { caret: 6, config: { flavor: 'commonmark', enterAtTextStart: 'stay' } }));
    }
  },
});

// B290 [P3]. A footnote label's own indentation is lost across a quote's edge
//
// Location: `src/doc/read.ts` (a footnote's prefix), `src/writer/write.ts` (its identity and
// prefix).
//
// `>⏎␠[^1]:`, Tab on the footnote: written `>⏎>  [^1]:`, read as another node: `root › 0 › 0: id 2,
// read as 3`. `>→[^1]:`, Shift-Tab: written `␠␠[^1]:`, the tab spelled as spaces the draft doesn't
// have: `text "→[^1]:", read as "␠␠[^1]:"`. Without the space, the tab, both work. Not B92 nor B164.
// P3: padded and tab-led labels.
openBug('B290', 'P3', 'A footnote label\'s own indentation is lost across a quote\'s edge', {
  'indenting a padded footnote into an empty quote writes': () => {
    assertNoWriteFailure(executeOnText('>\n [^1]:', { type: 'indent' }, { caret: 8 }));
  },
  'outdenting a footnote after a quote\'s tab writes': () => {
    assertNoWriteFailure(executeOnText('>\t[^1]:', { type: 'outdent' }, { caret: 7 }));
  },
});

// B331 [P3]. Moving tab-led indented code into an empty quote fails to write
//
// Location: `src/writer/write.ts` (indented code moved under a `>`, its tab), `src/commands/move-subtree.ts`.
//
// `→def⏎>` (Obsidian, `quotes: container`), code 1 dropped into the quote: `root › 0 › 0: id 1, read as 3`.
// With four spaces for the tab it writes, `>⏎>     def`. Every `indentUnit`; into `> x` it writes but for
// `indentUnit: tab`. Not B92, B95.
openBug('B331', 'P3', 'Moving tab-led indented code into an empty quote fails to write', {
  'tab-led code moves into an empty quote': () => {
    // root › 0 › 0: id 1, read as 3
    assertNoWriteFailure(executeOnText('\tdef\n>', { type: 'moveSubtree', nodes: [1], to: { parent: 2, after: null } }, { config: { flavor: 'obsidian', quotes: 'container', indentUnit: 2 } }));
  },
});

// B369 [P3]. Indenting an empty tab-led item above a loose paragraph fails to write
//
// Status (2026-11-09): found by the sessions. `- item⏎⏎→- ⏎→-┃⏎⏎→  done` (a raised blank line), Tab on the second
// empty item: written `→→- `, `done` no longer its parent's.
openBug('B369', 'P3', 'Indenting an empty tab-led item above a loose paragraph fails to write', {
  'Tab on the empty item': () => {
    // kept: c00252025863
    assertNoWriteFailure(executeOnText("- item\n\n\t- \n\t-\n\n\t  done\n", { type: "indent" }, { caret: 15, config: { flavor: "gfm", indentUnit: "tab" }, auto: [7] }));
  },
});

// B414 [P3]. An item further in than the sibling before it, lined up, leaves the paragraph after it inside it
//
// Status (2026-11-12): split from B237 (seed 201). `- parent⏎  -  ◌⏎    - ⏎    second paragraph`,
// Enter on the held empty item: a sibling made before it, the list written anew, `    - ` lined up at
// `  - `, its content column 4, and the paragraph at column 4 after it, the parent's, now read as the
// item's (`root › 0: 4 children, read as 3`).
openBug('B414', 'P3', 'An item further in than the sibling before it, lined up, leaves the paragraph after it inside it', {
  'Enter on a held empty item before a sibling further in and the parent\'s paragraph': () => {
    // kept: 7e6a68b341b5
    assertNoWriteFailure(executeOnText("- parent\n  -  \n    - \n    second paragraph of child two\n", { type: 'enter' }, { caret: 14, config: { flavor: 'gfm', quotes: 'container' }, placeholders: [14] }));
  },
});

// =================================================================================================
// Numbered lists and shared marker lines
//
// Duplicating or dropping a numbered item across a width change (9 to 10) misplaces the quote under
// it, and an indent misplaces a child (B210). Three markers sharing a line can read as a rule
// (B209).
bugCluster('Numbered lists and shared marker lines');

// B169 [P3]. Duplicating a numbered run across 9/10 detaches its copied quote
//
// Locations: `src/commands/duplicate-subtree.ts:41` and `src/writer/write.ts`'s copied-subtree
// column adjustment.
//
// Duplicating the first two items should produce five root items, preserving the quote as a child
// of its copied parent. Instead, validation reports `write-failed: root: 5 children, read as 6`.
//
// The copied run crosses a marker-width boundary and precedes an existing loose item. Copying it
// does not maintain all descendant indentation/separation: readback gains a root. The failure
// reproduces with `indentUnit: detect`, 2, 4, and `tab`; no tab is required in the input. Selecting
// all three items also fails, expecting six roots and reading seven. The quote here begins on a
// later line, and the writer does produce output, but its outline is wrong.
//
// Written: `8. A⏎9. Parent⏎   > q⏎⏎10. A⏎⏎11. Parent⏎   >  q⏎⏎12. Parent…`. The copy's marker is a
// column wider (`9.` → `11.`), and its later lines are widened (`widened`): `   > ` becomes `    >
// `. But the copy's quote line is written under the shift of the quote's own paragraph, whose
// prefix (`   > `) and cut (past the old `>`, column 5) are the old layout's: the widened prefix
// cut there leaves its moved space after the `>` (`   >  q`), and at column 3 the quote is no
// longer in `11.`'s item. A fix has to give a shift inside a widened item its widening (prefix and
// cut), or widen after the shift.
openBug('B169', 'P3', 'Duplicating a numbered run across 9/10 detaches its copied quote', {
  'duplicating a numbered run across 9/10 keeps its quote': () => {
    assertNoWriteFailure(executeOnText('8. A\n9. Parent\n   > q\n10. Parent\n\n    second\n', { type: 'duplicateSubtree', nodes: [1, 2] }, { config: { quotes: 'container' } }));
  },
});

// B191 [P3 partly fixed]. Dropping a node first under a quoted numbered item across 9/10 can't write its narrower marker
//
// *Status (2026-11-05): the quoted item dropped under the one above now writes (its quote named
// past the new marker); a drop under it, renumbering it narrower, is still refused. Fails at the
// last commit too.*
//
// `9. b` dropped first under `10. > q` renumbers it `9.`: its marker, on its first child's line now
// (`drafted`, another block first), is written over that line's indentation, which is the old
// marker's width (`10. `, four columns); the new one is three. The moved lines would have to be
// narrowed under their shift, as a renumbered item's later lines are (`widened`). `1. b⏎2. > q`
// drops.
openBug('B191', 'P3 partly fixed', 'Dropping a node first under a quoted numbered item across 9/10 can\'t write its narrower marker', {
  'dropping under a quoted item across 9/10 writes its narrower marker': () => {
    assertNoWriteFailure(executeOnText('9. b\n10. > q\n    > r\n', { type: 'moveSubtree', nodes: [1], to: { parent: 2, after: null } }, { config: { quotes: 'container' } }));
  },
});

// B210 [P3]. Indenting across 9/10 fails when the surviving parent's number widens
//
// Renumbering the survivors widens `b`'s marker; the moved child is placed at the old width. It is
// B169's and B191's column bookkeeping (`widened`). It needs a list with a repeated number: `8.
// a⏎9. b⏎10. c` and `10. a⏎11. b⏎12. c` work, so P3.
openBug('B210', 'P3', 'Indenting across 9/10 fails when the surviving parent\'s number widens', {
  'indenting across 9/10 widens the child with its parent': () => {
    // writes 9. a⏎10. b⏎   1. c: root: 2 children, read as 3
    assertNoWriteFailure(executeOnText('9. a\n9. b\n10. c', { type: 'indent', nodes: [3] }));
  },
  'indenting across 99/100 widens the child with its parent': () => {
    // writes …100. b⏎    1. c: body "b", read as "b\n    1. c"
    assertNoWriteFailure(executeOnText('99. a\n99. b\n100. c', { type: 'indent', nodes: [3] }));
  },
});

// B442 [P3]. An item indented to the end of a numbered child list restarts at 1
//
// Status (2026-11-12): split from B211. `5. a⏎   7. x⏎6. b┃`, Tab: `   1. b`, `8.` expected; `5. a⏎   3. x⏎
// 4. y⏎6. b┃` gives `1.`, `5.` expected. It counts on only where the child list counts from 1: the number
// looks derived from the item's position, not the list's start (`orderedLists: renumber` promises a sequence).
openBug('B442', 'P3', 'An item indented to the end of a numbered child list restarts at 1', {
  'an item indented into a numbered child list counts on': () => {
    assert.equal(appliedText(executeOnText('5. a\n   7. x\n6. b', { type: 'indent' }, { caret: 15 })), '5. a\n   7. x\n   8. b');
  },
  'an item indented past a numbered child list of two counts on': () => {
    assert.equal(appliedText(executeOnText('5. a\n   3. x\n   4. y\n6. b', { type: 'indent' }, { caret: 24 })), '5. a\n   3. x\n   4. y\n   5. b');
  },
});

// B443 [P3]. An item indented after a bullet child list takes the parent's number
//
// Status (2026-11-12): split from B211. `5. a⏎   - x⏎6. b┃`, Tab: `   5. b`, the parent's number, where a
// list of its own starts at 1 (`1. a⏎   - x⏎2. b` gives `1.` by chance).
openBug('B443', 'P3', "An item indented after a bullet child list takes the parent's number", {
  'an item indented after a bullet child starts its own list at 1': () => {
    assert.equal(appliedText(executeOnText('5. a\n   - x\n6. b', { type: 'indent' }, { caret: 14 })), '5. a\n   - x\n   1. b');
  },
});

// B278 [P3]. A marker widened across 9/10 makes its tab padding code
//
// Location: `src/writer/draft.ts`, `src/writer/write.ts` (a numbered marker's width, its first
// line's padding).
//
// `9. →b`: the tab after `9.␠` pads to column 4, and `b` is the item's text. Duplicated (written
// `9. →b⏎10. →b`) or with an item put above it by Enter at its start (`9. ⏎10. →b`), past `10.␠`
// the tab spans five columns, and `b` is indented code: `root › 1: a paragraph text, read as a
// indented_code one`. No quote (B169) nor a later node taken in (B208): the line's own text changes
// kind. The 9/10 family (B169, B191, B210). P3: tab padding.
openBug('B278', 'P3', 'A marker widened across 9/10 makes its tab padding code', {
  'duplicating a tab-padded 9. item writes': () => {
    assertNoWriteFailure(executeOnText('9. \tb', { type: 'duplicateSubtree' }));
  },
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
bugCluster('Selections and carets in the view');

// B217 [P3]. Commands disagree on what a caret on the last blank line acts on
//
// With the caret on the blank line ending `- a⏎- b⏎⏎┃`, or past the final line break of `- a⏎-
// b⏎┃`:
//
// | Command | Result |
// |---|---|
// | `indent`, `outdent`, `moveSubtreeUp`, `deleteSubtree`, `selectNode`, `zoomIn` | act on `b` (`touchedNodes`: a blank line is the gap of the node above) |
// | `duplicateSubtree` | `unsupported`: `end()` finds the selection outside the copied text; its doc calls this not done yet |
// | `addBlockId` | refused `block-id`: `nodeAt` has no owner in the `none` zone |
// | `copy`, `cut` | Deferred |
// | `enter`, Backspace | Deferred, the host's |
//
// `duplicateSubtree` with `nodes` and `addBlockId` with `node` both work from there. So the caret's
// node is the gap rule for some commands and nothing for others. Ctrl-End then Tab indenting the
// last item may itself be surprising: see D23 in dev/next.md.
openBug('B217', 'P3', 'Commands disagree on what a caret on the last blank line acts on', {
  'duplicate acts on the node a blank line ends, as indent does': () => {
    assertApplied(executeOnText('- a\n- b\n\n', { type: 'duplicateSubtree' }, { caret: 9 }));
  },
  'addBlockId acts on the node above, past the final line break': () => {
    assertApplied(executeOnText('- a\n- b\n', { type: 'addBlockId', name: 'x' }, { caret: 8, config: { flavor: 'obsidian' } }));
  },
});

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

// B330 [P3]. Indenting `[^a]:` over a block id line fails to write
//
// Location: `src/commands/indent.ts` (a paragraph made an item), the block-id lines it carries.
//
// `[^a]:⏎^id` (Obsidian, a paragraph: a footnote's label with nothing after it isn't one), Tab: `root › 0:
// block ids [["id",true]], read as []`. With `x` for `^id`, or text after the label, it indents. Not B236.
openBug('B330', 'P3', 'Indenting `[^a]:` over a block id line fails to write', {
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

// B413 [P3]. A quoted paragraph whose space after `>` is held loses its marks through Enter or Shift-Enter
//
// Status (2026-11-12): split from B237, its hand-built shapes. `>◌ q` (`quotes: container`, the space
// after an unspaced `>` the paragraph's, held), Enter or Shift-Enter at the end: written `> q⏎>`, both
// placeholders gone, read back with the paragraph named otherwise. No key sequence tried reaches it.
openBug('B413', 'P3', "A quoted paragraph whose space after `>` is held loses its marks through Enter or Shift-Enter", {
  'Shift-Enter in a quoted paragraph held past its `>`': () => {
    assertNoWriteFailure(executeOnText('> q', { type: 'shiftEnter' }, { caret: 3, config: { quotes: 'container' }, placeholders: [1] }));
  },
  'Enter in a quoted paragraph held past its `>`': () => {
    assertNoWriteFailure(executeOnText('> q', { type: 'enter' }, { caret: 3, config: { quotes: 'container' }, placeholders: [1] }));
  },
});

// B372 [P3]. Outdenting the item above an empty held item drops its placeholder
//
// Status (2026-11-09): found by the sessions' marks check. `p⏎- [x] do┃ne⏎- ┃` (the empty item held),
// Shift-Tab on `done` at the root: it becomes a paragraph, a blank line raised before the empty item,
// whose placeholder (valid there) is dropped.
openBug('B372', 'P3', 'Outdenting the item above an empty held item drops its placeholder', {
  'Shift-Tab on a task item above an empty held item at the note\'s end': () => {
    // kept: 2f7dc2eb6f19
    const result = assertApplied(executeOnText('Intro paragraph with a [[link]] and `code`.\n- [x] done\n- \n', { type: 'outdent' }, { caret: 50, placeholders: [57], config: { flavor: 'gfm', quotes: 'container' } }));
    assert.equal(result.view.doc.marks.placeholders.length, 1);
  },
});

// B412 [P3]. Enter at a text's end loses the raised blank line's mark before its block-id line
//
// Status (2026-11-12): left from B377. `x⏎⏎̬^blk` (Obsidian: `^blk` the paragraph's block-id line, after
// a blank line of ours), Enter at `x`'s end: the line written again with the text, unmarked.
openBug('B412', 'P3', "Enter at a text's end loses the raised blank line's mark before its block-id line", {
  'the case reduced': () => {
    // kept: e2808dc78aff
    const result = assertApplied(executeOnText("x\n\n^blk\n", {"type": "enter"}, {"caret": 1, "config": {"flavor": "obsidian"}, "auto": [2]}));
    assert.equal(result.view.doc.marks.auto.length, 2);
  },
});

// B418 [P3]. A callout's held `> ` line deleted or pasted on loses the raised line's mark after it
//
// Status (2026-11-12): left from B377. `- > [!note] Title⏎  > ◌⏎⏎̬  xFinal line ^blk`, `# body text` pasted
// on the held line: the heading written outside the callout, the raised line after it unmarked; a
// delete of a callout's held line, the same.
openBug('B418', 'P3', "A callout's held `> ` line deleted or pasted on loses the raised line's mark after it", {
  'a heading pasted on a callout\'s held line': () => {
    // kept: 3fdea333a21a 96b9a5c40e60
    const result = assertApplied(executeOnText("- > [!note] Title\n  > \n\n  xFinal line ^blk\n", { type: 'paste', clipboard: { 'text/plain': '# body text\n' } }, { caret: 22, config: { flavor: 'commonmark', indentUnit: 'tab' }, auto: [23] }));
    assert.equal(result.view.doc.marks.auto.length, 1);
  },
});

// =================================================================================================
// Drop preflight
//
// `moveRefused` decides what a pickup offers, on a model of Markdown of its own, and refuses places
// the keyboard reaches.
bugCluster('Drop preflight');

// B419 [P3]. A drop past a sibling of an item with an unclosed fence is refused
//
// Status (2026-11-12): split from B241 (2026-11-05, reproduces, the keyboard move writing the same
// place). `- ```⏎- b⏎- c`: `moveRefused` takes the item's fence as open across its siblings (`above?.parent
// === parent`), though the next item's marker ends it. Location: `src/commands/move-subtree.ts`.
openBug('B419', 'P3', 'A drop past a sibling of an item with an unclosed fence is refused', {
  'a drop past a sibling of an item\'s unclosed fence writes': () => {
    assertApplied(executeOnText('- ```\n- b\n- c', { type: 'moveSubtree', nodes: [3], to: { parent: 'root', after: 1 } }));
  },
  'an item with an unclosed fence drops past its sibling': () => {
    assertApplied(executeOnText('- ```\n- b\n- c', { type: 'moveSubtree', nodes: [1], to: { parent: 'root', after: 2 } }));
  },
});

// B420 [P3]. A drop above code too shallow for a wide marker is refused
//
// Status (2026-11-12): split from B241. `100. a⏎⏎    code⏎⏎100. b`, dropping the second item after the
// first: a marker five columns wide doesn't own code at column 4, which `moveRefused` takes as its.
openBug('B420', 'P3', 'A drop above code too shallow for a wide marker is refused', {
  'an item drops above code too shallow to be its own': () => {
    assertApplied(executeOnText('100. a\n\n    code\n\n100. b', { type: 'moveSubtree', nodes: [3], to: { parent: 'root', after: 1 } }, { config: { listParent: 'container' } }));
  },
});

// B421 [P3]. A drop is refused where a `---` in an item's code would seem to close front matter
//
// Status (2026-11-12): split from B241. Obsidian, `---⏎⏎- a⏎- ```⏎  ---⏎  ````: the `---` in the item's
// code is container-stripped text, not a line at column 0, which `moveRefused` reads.
openBug('B421', 'P3', "A drop is refused where a `---` in an item's code would seem to close front matter", {
  'a `---` in an item\'s code closes no front matter': () => {
    assertApplied(executeOnText('---\n\n- a\n- ```\n  ---\n  ```', { type: 'moveSubtree', nodes: [3], to: { parent: 'root', after: 1 } }, { config: { flavor: 'obsidian', listParent: 'container' } }));
  },
});

// B422 [P3]. A rule dropped at the top is refused as its own closing fence
//
// Status (2026-11-12): split from B241. Obsidian, `# h⏎---`, the rule dropped first: the moved node's own
// old line counts as a second front-matter delimiter.
openBug('B422', 'P3', 'A rule dropped at the top is refused as its own closing fence', {
  'a rule moved to the top isn\'t its own closing fence': () => {
    assertApplied(executeOnText('# h\n---', { type: 'moveSubtree', nodes: [2], to: { parent: 'root', after: null } }, { config: { flavor: 'obsidian', listParent: 'container' } }));
  },
});

// B293 [P3]. A drag's seams count an unclosed fence's blank code line as a gap
//
// Location: `src/commands/drag.ts` (`seamsOf`, `blanks`).
//
// The blank lines before a seam are counted without stopping at the node above's end: ```` ```⏎⏎
// ````, an unclosed fence whose blank line is its code, gives its last seam `gapLines: 1`, though
// the node spans both lines and has no gap after it. A host drawing the drop line from it draws it
// inside the code. Count only blank lines outside nodes.
openBug('B293', 'P3', 'A drag\'s seams count an unclosed fence\'s blank code line as a gap', {
  'an unclosed fence\'s blank code line is no gap': () => {
    const result = assertApplied(executeOnText('```\n\n', { type: 'drag', clipboard: { 'text/plain': '- x' } }));
    const end = result.dropMap!.seams.at(-1)!;
    assert.equal(end.beforeLine, 2);
    // 1
    assert.equal(end.gapLines, 0);
  },
});

// =================================================================================================
// Typing and bracket pairing
//
// `autoClose` lists only fences by default, but inline pairs are what Obsidian's users have on:
// spec ranks bracket pairing `common`. The pair logic is prose-only, so it stops where a node
// doesn't exist yet or isn't prose.
bugCluster('Typing and bracket pairing');

// B245 [P3]. Typing before a glued block id, then Backspace, leaves two spaces
//
//   - item ┃^id1, x → - item x┃ ^id1, Backspace → - item ┃ ^id1  (two spaces; it stays at two)
//
// `placedText` adds the blank after the character (`src/commands/typing.ts`, `gluedBlockId`), and
// nothing says it is ours. An auto mark would let Backspace take it, as `deleteEmptyPair` does for
// a closer.
openBug('B245', 'P3', 'Typing before a glued block id, then Backspace, leaves two spaces', {
  'typing before a glued block id, then Backspace, gives the note back': () => {
    const typed = executeOnText('- item ^id1\n', { type: 'insertText', text: 'x' }, { caret: 7, config: { flavor: 'obsidian' } });
    // - item ┃ ^id1: two spaces, and it stays at two
    assert.equal(appliedText(executeAfter(typed, { type: 'deleteContentBackward' })), '- item ^id1\n');
  },
});

// =================================================================================================
// Parser
//
// Differences from CommonMark and GFM, checked here against commonmark.js, micromark and cmark-gfm
// (the `cmarkgfm` Python package), and two cases of the parser's own bookkeeping. No one reference
// is enough: commonmark.js shares the tab and NBSP bugs, which is why comparing with it found
// nothing (dev/28-bugs.md's "what found nothing"), and the three split on B247 and B249's control
// characters. cmark-gfm is what GitHub runs, so it decides GFM questions.
bugCluster('Parser');

// B247 [P3 policy]. Angle autolinks decode entities, as cmark-gfm does and commonmark.js doesn't
//
// Status (2026-11-05): verified on the current tree: the references split, so no bug without a
// decision.
//
// Location: `src/parser/inline-rules.ts:232`.
//
// | `<https://example.com/?a=1&amp;b=2>` | Destination |
// |---|---|
// | ourus, cmark-gfm | `…?a=1&b=2`, decoded |
// | commonmark.js, micromark | `…?a=1&amp;b=2`, literal |
//
// To decide: follow cmark-gfm, which is GitHub's reading, or the other two. It could be by flavor.
// The email form isn't affected: `<a&amp;b@example.com>` is no autolink, `;` being outside an
// email's characters, in all of them. The email branch's `decodeEntities` (`:225`) has no input it
// can change.
openBug('B247', 'P3 policy', 'Angle autolinks decode entities, as cmark-gfm does and commonmark.js doesn\'t', {
  'an autolink\'s entity stays literal': () => {
    // One answer of two (see above): cmark-gfm's reading is today's. A decision may delete this case.
    assert.match(MdTree.parse('<https://example.com/?a=1&amp;b=2>').renderHtml(), /a=1&amp;amp;b=2/);
  },
});

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

// B432 [P3]. Adjacent pasted runs of one format write their delimiters literal
//
// Status (2026-11-12): split from B264. Location: `merged`, `#joined`. `<b>a</b><span style="font-weight:bold">b</span>`
// (an empty span between two `<b>` too) gives `**a****b**`, only the same tag merging; `<code>a</code><span><code>b</code></span>`
// gives `` `a``b` ``; `<b>a<i>b</i></b><i>c</i>` gives `**a*b****c*`, the two italics not joined across the bold's edge.
openBug('B432', 'P3', 'Adjacent pasted runs of one format write their delimiters literal', {
  'adjacent bold of two spellings merges': () => {
    assert.equal(convertPastedHtml('<p><b>a</b><span style="font-weight:bold">b</span></p>').markdown, '**ab**');
  },
  'an empty span between two bolds merges them': () => {
    assert.equal(convertPastedHtml('<p><b>a</b><span></span><b>b</b></p>').markdown, '**ab**');
  },
  'code spans around a wrapper merge': () => {
    assert.equal(convertPastedHtml('<p><code>a</code><span><code>b</code></span></p>').markdown, '`ab`');
  },
  'nested emphasis next to italic shows no delimiter': () => {
    assert.doesNotMatch(convertPastedHtml('<p><b>a<i>b</i></b><i>c</i></p>').shown, /\*/);
  },
});

// B433 [P3]. A format turned off inside a pasted run writes its delimiters literal
//
// Status (2026-11-12): split from B264. Location: `#wrap`, `#format`. `<b><span style="font-weight:normal">a</span>b</b>`
// gives `****a**b**`, an empty run wrapped (the reverse edge trailing `****`; all of it normal, `****a****`);
// `<b>a<span style="font-weight:normal"> b </span>c</b>` gives `**a **b** c**`, moving blanks out inverting the off
// transition. On and off runs should be normalized before delimiters are written.
openBug('B433', 'P3', 'A format turned off inside a pasted run writes its delimiters literal', {
  'bold turned off at its start shows no delimiter': () => {
    assert.equal(convertPastedHtml('<p><b><span style="font-weight:normal">a</span>b</b></p>').markdown, 'a**b**');
  },
  'bold turned off at its end shows no delimiter': () => {
    assert.equal(convertPastedHtml('<p><b>a<span style="font-weight:normal">b</span></b></p>').markdown, '**a**b');
  },
  'bold turned off throughout is plain': () => {
    assert.equal(convertPastedHtml('<p><b><span style="font-weight:normal">a</span></b></p>').markdown, 'a');
  },
  'spaces around a normal run stay out of the bold': () => {
    assert.equal(convertPastedHtml('<p><b>a<span style="font-weight:normal"> b </span>c</b></p>').markdown, '**a** b **c**');
  },
});

// B434 [P3]. Pasted bold edged by a Unicode blank or a combining mark writes its delimiters literal
//
// Status (2026-11-12): split from B264. `<b>\u2003x\u2003</b>` gives `** x **`, only ASCII blanks and NBSP moved
// out; `<b>a!</b>\u0301` (an astral letter after it too) gives `**a!**́`, flanking asked of letters and numbers only.
openBug('B434', 'P3', 'Pasted bold edged by a Unicode blank or a combining mark writes its delimiters literal', {
  'Unicode blanks at a bold\'s edges show no delimiter': () => {
    assert.doesNotMatch(convertPastedHtml('<p><b>\u2003x\u2003</b></p>').shown, /\*/);
  },
  'a combining mark after bold punctuation shows no delimiter': () => {
    assert.doesNotMatch(convertPastedHtml('<p><b>a!</b>\u0301</p>').shown, /\*/);
  },
});

// B435 [P3]. A pasted style's `inherit` isn't resolved
//
// Status (2026-11-12): split from B265. Location: `#inline`, `styledDown`. `<div style="font-style:italic"><p><span
// style="font-style:inherit">x</span></p></div>` gives `**x**`, not italic.
openBug('B435', 'P3', "A pasted style's `inherit` isn't resolved", {
  'inherit keeps what is inherited': () => {
    assert.equal(convertPastedHtml('<div style="font-style:italic"><p><span style="font-style:inherit">x</span></p></div>').markdown, '*x*');
  },
});

// B436 [P3]. A pasted `text-decoration: none` lifts an ancestor's line
//
// Status (2026-11-12): split from B265. `<span style="text-decoration:line-through">a<span
// style="text-decoration:none">b</span>c</span>` gives `~~a~~b~~c~~`: a decoration isn't inherited off, it
// should be read apart from font properties.
openBug('B436', 'P3', "A pasted `text-decoration: none` lifts an ancestor's line", {
  'text-decoration: none doesn\'t lift an ancestor\'s line': () => {
    assert.equal(convertPastedHtml('<p><span style="text-decoration:line-through">a<span style="text-decoration:none">b</span>c</span></p>').markdown, '~~abc~~');
  },
});

// B437 [P3]. A pasted table cell's bold is dropped
//
// Status (2026-11-12): split from B266. `<td style="font-weight:bold">bold</td>` (a row's or table's style too)
// gives `| bold |`: `#table` converts children without `styledDown`.
openBug('B437', 'P3', "A pasted table cell's bold is dropped", {
  'a table cell\'s bold': () => {
    assert.equal(convertPastedHtml('<table><tr><td style="font-weight:bold">bold</td></tr></table>').markdown, '| **bold** |\n| --- |');
  },
});

// B438 [P3]. A pasted list's bold is dropped
//
// Status (2026-11-12): split from B266. `<ul style="font-weight:bold"><li>x</li></ul>` gives `- x`: `#list`
// reads the unstyled node.
openBug('B438', 'P3', "A pasted list's bold is dropped", {
  'a list\'s bold': () => {
    assert.equal(convertPastedHtml('<ul style="font-weight:bold"><li>x</li></ul>').markdown, '- **x**');
  },
});

// B439 [P3]. A pasted link's own bold is dropped
//
// Status (2026-11-12): split from B266. `<a style="font-weight:bold" href="u">x</a>` gives `[x](u)`: the link
// branch skips the style.
openBug('B439', 'P3', "A pasted link's own bold is dropped", {
  'a link\'s own bold': () => {
    assert.match(convertPastedHtml('<p><a style="font-weight:bold" href="u">x</a></p>').rendered, /<strong>/);
  },
});

// B440 [P3]. A pasted bold tag around blocks is dropped
//
// Status (2026-11-12): split from B266. `<b><p>a</p><p>b</p></b>` gives `a⏎⏎b`: `styledDown` handles styles,
// not tags.
openBug('B440', 'P3', 'A pasted bold tag around blocks is dropped', {
  'a bold tag around blocks': () => {
    assert.equal(convertPastedHtml('<b><p>a</p><p>b</p></b>').markdown, '**a**\n\n**b**');
  },
});

// B441 [P3]. A pasted link around blocks is dropped
//
// Status (2026-11-12): split from B266. `<a href="u"><p>a</p><p>b</p></a>` gives `a⏎⏎b`: a block wrapper
// strips the link.
openBug('B441', 'P3', 'A pasted link around blocks is dropped', {
  'a link around blocks': () => {
    assert.equal(convertPastedHtml('<a href="u"><p>a</p><p>b</p></a>').markdown, '[a](u)\n\n[b](u)');
  },
});

// B423 [P3]. Adjacent nested ordered lists in pasted HTML merge into one
//
// Status (2026-11-12): split from B267. `<ul><li>x<ol><li>a</li></ol><ol><li>b</li></ol></li></ul>` gives
// `- x⏎  1. a⏎⏎  1. b`, one loose list: `writeAll`'s alternation skips item blocks.
openBug('B423', 'P3', 'Adjacent nested ordered lists in pasted HTML merge into one', {
  'adjacent nested lists stay two': () => {
    assert.equal(convertPastedHtml('<ul><li>x<ol><li>a</li></ol><ol><li>b</li></ol></li></ul>').rendered.match(/<ol/g)?.length, 2);
  },
});

// B424 [P3]. A pasted loose task loses its checkbox
//
// Status (2026-11-12): split from B267. `<ul><li><input type="checkbox"><p>task</p></li></ul>` gives
// `- [ ]⏎⏎  task`, a `[ ]` paragraph and no task, the shape GFM renders a loose task as.
openBug('B424', 'P3', 'A pasted loose task loses its checkbox', {
  'a loose task keeps its text with its checkbox': () => {
    // kept: d583112b562f f00bed9a9f55 (a loose list's task rendered and read back, `- other⏎⏎- [x] done`)
    // kept: eafaca402cff
    assert.equal(convertPastedHtml('<ul><li><input type="checkbox"><p>task</p></li></ul>').markdown, '- [ ] task');
  },
});

// B425 [P3]. A pasted rule in an item takes the item with it
//
// Status (2026-11-12): split from B267. `<ul><li><hr></li><li>next</li></ul>` gives `- ---⏎- next`, one
// rule: the item is gone (B209's collision).
openBug('B425', 'P3', 'A pasted rule in an item takes the item with it', {
  'a rule in an item keeps the item': () => {
    assert.equal(convertPastedHtml('<ul><li><hr></li><li>next</li></ul>').rendered.match(/<li/g)?.length, 2);
  },
});

// B426 [P3]. A pasted link title's entity is decoded twice
//
// Status (2026-11-12): split from B268. `<a href="u" title="&amp;copy;">` gives title `©`: `titleOf` lacks
// the escape `destination` has; image titles too.
openBug('B426', 'P3', "A pasted link title's entity is decoded twice", {
  'a title\'s entity decodes once': () => {
    assert.match(convertPastedHtml('<p><a href="u" title="&amp;copy;">x</a></p>').rendered, /title="&amp;copy;"/);
  },
});

// B427 [P3]. A pasted link destination's spaces collapse
//
// Status (2026-11-12): split from B268. `href="x&#32;&#32;y"` gives `x%20y`: `#inlineText` collapses blanks
// in the destination.
openBug('B427', 'P3', "A pasted link destination's spaces collapse", {
  'a destination\'s spaces all stay': () => {
    assert.match(convertPastedHtml('<p><a href="x&#32;&#32;y">x</a></p>').rendered, /href="x%20%20y"/);
  },
});

// B428 [P3]. A pasted link with deeply nested parentheses becomes text
//
// Status (2026-11-12): split from B268. 33 levels of parentheses in the destination, past the reader's
// 32: written bare, shown as text; `<…>` would keep it a link.
openBug('B428', 'P3', 'A pasted link with deeply nested parentheses becomes text', {
  'deeply nested parentheses stay a link': () => {
    assert.match(convertPastedHtml('<p><a href="a' + '('.repeat(33) + 'b' + ')'.repeat(33) + '">link</a></p>').rendered, /<a href/);
  },
});

// B429 [P3]. A pasted nested table's cells run together
//
// Status (2026-11-12): split from B269. `<td>a<table><tr><td>b</td><td>c</td></tr></table>d</td>` gives
// `| a bc d |`: `tr`, `td`, `th` aren't in the spacing test.
openBug('B429', 'P3', "A pasted nested table's cells run together", {
  'a nested table\'s cells stay apart': () => {
    assert.match(convertPastedHtml('<table><tr><td>a<table><tr><td>b</td><td>c</td></tr></table>d</td></tr></table>').markdown, /b c/);
  },
});

// B430 [P3]. A pasted `rowspan="0"` spans one row
//
// Status (2026-11-12): split from B269. `0` is the row group's rest; `parseInt(...) || 1` reads it as 1.
openBug('B430', 'P3', 'A pasted `rowspan="0"` spans one row', {
  'rowspan 0 spans the row group': () => {
    assert.match(convertPastedHtml('<table><tr><td rowspan="0">a</td><td>b</td></tr><tr><td>c</td></tr></table>').markdown, /\|  \| c \|/);
  },
});

// B431 [P3]. A pasted rowspan runs past its row group
//
// Status (2026-11-12): split from B269. A `rowspan="2"` in `<thead>` reaches into `<tbody>`: the rows are
// flattened first, so a span doesn't stop at its row group, a third column made.
openBug('B431', 'P3', 'A pasted rowspan runs past its row group', {
  'a rowspan stops at its row group': () => {
    assert.equal(convertPastedHtml('<table><thead><tr><th rowspan="2">A</th><th>B</th></tr></thead><tbody><tr><td>C</td><td>D</td></tr></tbody></table>').markdown.split('\n')[0], '| A | B |');
  },
});

// B337 [P3 policy]. An empty heading in HTML converts to nothing
//
// Location: `src/parser/html-parser.ts` (`#blockOf`, a heading: no block for an empty text).
//
// `<h2></h2><p>x</p>` converts to `x`, `structured: false`. Markdown has empty headings (`## `), and an
// outline's empty heading is a node to type in: copied out and pasted back, it is gone. The case leans to
// keeping it.
openBug('B337', 'P3 policy', 'An empty heading in HTML converts to nothing', {
  'an empty heading converts as one': () => {
    // x
    assert.equal(MdHtmlParser.parse('<h2></h2><p>x</p>').markdown, '## \n\nx');
  },
});

// B375 [P3]. An unclosed math block after code doesn't come back from its HTML
//
// Status (2026-11-09): found by conserve's round trip. ```` ```js⏎```⏎$$ ```` (Obsidian): an empty code
// block, then `$$` that nothing closes, rendered and read back, renders otherwise; `$$` alone comes
// back.
openBug('B375', 'P3', "An unclosed math block after code doesn't come back from its HTML", {
  'an empty code block and an unclosed `$$` rendered and read back': () => {
    // kept: a9224dd753de cbe2f9a23c80
    assert.deepEqual(htmlFailures('```js\n```\n$$', { flavor: 'obsidian' }), []);
  },
});

// B373 [P3]. A callout doesn't come back from its HTML
//
// Status (2026-11-09): found by conserve's round trip. A callout renders as `<div class="callout"
// data-callout="note">` with its title in `<div class="callout-title">`; reading that back gives
// plain paragraphs (`Title⏎⏎body text`), no callout, no quote.
openBug('B373', 'P3', 'A callout doesn\'t come back from its HTML', {
  'a callout rendered and read back is a callout': () => {
    // kept: 9832cc5a533d f8c10ed024a2
    // kept: 7dda30a5048d
    assert.deepEqual(htmlFailures('> [!note] Title\n> body text\n', { flavor: 'obsidian' }), []);
  },
});

// B374 [P3]. A wiki link doesn't come back from its HTML
//
// Status (2026-11-09): found by conserve's round trip. `[[link]]` renders as `<a data-href="link"
// href="link" class="internal-link">`; reading that back gives `[link](link)`, a link of another
// kind.
openBug('B374', 'P3', 'A wiki link doesn\'t come back from its HTML', {
  'a wiki link rendered and read back is a wiki link': () => {
    // kept: 0dd460e1bfcc
    // kept: 2d408cefab42
    assert.deepEqual(htmlFailures('a [[link]] b\n', { flavor: 'obsidian' }), []);
  },
});

// =================================================================================================
// Found by the volume run, seed 51
//
// The shapes the triage of seed 51's kept cases found no bug for (2026-11-10): each a case read,
// reduced, its bug titled from what the command wrote, no more claimed.
bugCluster('Found by the volume run, seed 51');

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
// not a bug (Shift-Enter after an empty item, the raised line no longer needed, by design): e06db67eedac

// B399 [P3]. Editing a quote written `>-` or `>#` with a padded marker after it misreads it
//
// Status (2026-11-11): found by the volume run (seed 101). `- >-  [!note] Title⏎  > body text`,
// Shift-Enter; `2. ># quote`, Backspace (`quotes: container`): the unspaced quote's padded item or
// heading written so its text reads otherwise.
openBug('B399', 'P3', 'Editing a quote written `>-` or `>#` with a padded marker after it misreads it', {
  'the case reduced': () => {
    // kept: a025ea53e1ba f64c61814548 2e9ad6d8c53a
    assertNoWriteFailure(executeOnText("- >-  [!note] Title\n  > body text\n", {"type": "shiftEnter"}, {"caret": 5}));
  },
});

// B401 [P3]. Backspace on a blank line in an item before its unclosed fence miscounts the blank lines
//
// Status (2026-11-11): found by the volume run (seed 101). `- next⏎-⏎  ⏎  ```js⏎  let x;`, Backspace
// on the blank line: the fence nothing closes takes the lines after it (B205's rule), its gap read
// otherwise (`readback gap`).
openBug('B401', 'P3', "Backspace on a blank line in an item before its unclosed fence miscounts the blank lines", {
  'the case reduced': () => {
    // kept: 02818d7ed228 (seed 251)
    // kept: 1e198ad9a40c (seed 151: a task's blank line before its fence)
    // kept: a9d3472f0438 c76ed93501e8
    assertNoWriteFailure(executeOnText("-\n  \n  - ```js\n  let x;\n", {"type": "deleteContentBackward"}, {"anchor": 5, "head": 15}));
  },
});

// B403 [P3]. Deleting an item before a shared marker line `- - - ` lines the line's child up wrong
//
// Status (2026-11-11): found by the volume run (seed 101). `- item ^id1⏎- - - ⏎  - other`, Delete
// subtree on the shared line: `other` read into the item above.
openBug('B403', 'P3', "Deleting an item before a shared marker line `- - - ` lines the line's child up wrong", {
  'the case reduced': () => {
    // kept: dbf445dbc663 (seed 151: `- 1. second` deleted)
    // kept: b0bc8706019c
    assertNoWriteFailure(executeOnText("- item ^id1\n- - - \n  - other\n  > [!note] Title\n", {"type": "deleteSubtree"}, {"caret": 18}));
  },
});

// B404 [P3]. Indents and moves of odd generated shapes fail to write
//
// Status (2026-11-11): found by the volume run (seed 101). One-offs from seed 101's generated notes,
// each its own shape, kept together until one is read: an empty item's lazy paragraph indented, `x1. num` a paragraph indented over a list, a callout's lines
// selected and indented, a table moved after a lazy callout line, a block id paragraph moved, a
// tab-led task moved, a callout moved under a paragraph, Shift-Enter in a padded item.
openBug('B404', 'P3', "Indents and moves of odd generated shapes fail to write", {
  'the case reduced': () => {
    // kept: f93e21b91047 68b07aacdc79 af2334dabad1 c4ba37b7975a 6241427d78f2 d3b96cb44f31 (seed 251: `* ---`, a lazy table line, a callout over an unclosed fence, a lazy quoted item)
    // kept: 4ce30d1fc13e 8cc690d3c38e a350fb2b066d 6f5042f8b2e4 438f4decfbea 98ff10f3302d 9c467c7e5074 (seed 201, one-offs)
    // kept: 14f03c452ba3 2426d7af0376 8933fec2cacd 963e48f22c1c 087250c6f59f 59ba9cfc4b46 bd467bf4cbbb
    // kept: ed9f679c7197 a5d1bafce6e1 c346bca059ca ce0525b94439 ff81851153b0 2bffc8e3aa37 418e514d7b12
    // kept: 280623f7fccf (seed 151, one-offs, each its own shape)
    // kept: 2042702bc02c 9730e6cfb1ad ee83de2b925d a25d3be4b588 4d03c09943b7 f44d85bb3a90 12f3028a9e62 b1816aca8e92 19b834460abd
    // kept: 43e46d35318f (a quote atom's paragraph moved up past a lazy line, from B379)
    assertNoWriteFailure(executeOnText("  - child two\n- \n    second paragraph of child two\n\npara one\n", {"type": "indent"}, {"caret": 16, "auto": [51]}));
  },
});

// =================================================================================================
// Found by the volume run, seed 151
bugCluster('Found by the volume run, seed 151');

// B409 [P3]. A lone block-id line after a block, a new block written beside it, fails to write
//
// Status (2026-11-11): found by the volume run (seed 151). `> \# ⏎⏎ ^blk⏎⏎> a quote`, Enter in the
// quote, or a duplicate of it: the block id's own line, ` ^blk`, the quote's, written with the new
// block right after it, no blank line (`readback children`); a paragraph moved down past a heading
// with its lone id line, the same.
openBug('B409', 'P3', 'A lone block-id line after a block, a new block written beside it, fails to write', {
  'the case reduced': () => {
    // kept: f8f8d00a19f2 c5a54f838d89 deda5b0984cf 2891ea9f2cd5 27a2fd26d870 c9993dfebd9f (seed 251: a lone `^blk` or `^2` line through a move, a cut, a delete, an indent)
    // kept: d1d12fcb3d2a (seed 201: a paragraph moved up past lone `^blk` lines)
    // kept: e7d4899aa1a6 7607cb1f6893 4cf2473f6c1a
    assertNoWriteFailure(executeOnText("> \\# \n\n ^blk\n\n> a quote\n", { type: "enter" }, { caret: 7, config: { flavor: "obsidian" }, auto: [2, 13] }));
  },
});

// B410 [P3]. Editing a tab-led or padded shared marker line fails to write
//
// Status (2026-11-11): found by the volume run (seed 151). `- Intro…⏎→- - ⏎→→- item ^id1⏎→→- other`
// (`indentUnit: tab`), Backspace on the inner empty item: `moved-indent`; `→-  - parent`, padded,
// Cmd-Backspace, the same family (`readback children`). B348's shape, a join rather than a move.
// (2026-11-12, seed 201: 8 more, padded or tab-led shared lines `-  - `, `2.  3. > quote` under
// `indentUnit: tab`; 6 of them fixed since, the seam check reading a block written anew as it is
// written. Left: the moved-indent case, a duplicate of a padded shared line.)
openBug('B410', 'P3', 'Editing a tab-led or padded shared marker line fails to write', {
  'the case reduced': () => {
    // kept: c4eb730b75df 7ce29f4c3c2c 1fe02837fa71 9aa9a903f0c8 344f1c644e0a (seed 251: padded or tab-led marker lines, `-  x`, `\t1.  - `, through moves, outdents, Shift-Enter, a soft-line delete)
    // kept: 8d6ae94b1368 61f682bf75b8 (seed 201: `- - - `` Enter, `-   - grandchild` duplicated, under `indentUnit: tab`)
    // kept: a31915814310 c94856411d82
    assertNoWriteFailure(executeOnText("- Intro paragraph with a [[link]] and `code`.\n\t- - \n\t\t- item ^id1\n\t\t- other\n", { type: "deleteContentBackward" }, { caret: 51, config: { flavor: "commonmark", indentUnit: "tab" } }));
  },
});

// The id the next bug takes: raise it with each new bug. Ids aren't reused, a fixed bug's included, so
// this stays where it is when bugs go. The run fails on a bug at or past it, or on an id taken twice.

const NEXT_BUG_ID = 444;

reportBugs(NEXT_BUG_ID);
