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
// The report says what changed, and any of these fails the run:
//
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
// A new bug takes `NEXT_BUG_ID`, at the end of this file, and raises it.
//
// Offsets are UTF-16; node ids are a fresh parse's; ⏎ a line break, ┃ the caret, ┃◌ a held empty line,
// ␠ a space, ⍽ a no-break space, → a tab.

import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { executeCommand, leavesZoom, mapPos, MdFlavor, MdHtmlParser, MdTree, OurusDoc, OurusProse, OurusRejected, OurusSuccess, OurusView, settlePlaceholders } from '../src/index.ts';
import * as extend from '../src/parser/extend.ts';
import { defineFlavor, gfmExtensions } from '../src/parser/extend.ts';
import { appliedText, assertApplied, assertNoWriteFailure, convertPastedHtml, executeAfter, executeOnText, firstBlockInlines, scalingFactor } from './lib/index.ts';

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
// Copy, cut and paste (Markdown and plain text)
//
// Pastes the writer can't place where a quote shares an item's line or a lazy paragraph sits in
// nested quotes (B15, B16); a paste where a cut left the caret by a table, code, a rule, a footnote
// or HTML (B21); indented code from a plain-text clipboard dedented (B26); and a text cut across
// items not restored by pasting it back (B188); a bare marker taking in what follows it (B193);
// ourus's own clipboard read as a stranger's (B194, B195). The Markdown/plain-text paths only.
bugCluster('Copy, cut and paste (Markdown and plain text)');

// B15 [P2]. Pasting list items before an item’s same-line quote merges a pasted node
//
// Location: `src/commands/paste.ts:84`.
//
// The destination item initially has no text of its own and holds a quote on its marker line.
// Inserting two list items before that quote gives the draft three children, but the emitted
// marker/quote arrangement reads as two. The drop returns write-failed. Assign the destination’s
// first-line ownership consistently when adding its new first child.
//
// Observed: write-failed:the text written doesn't read as the draft: root › 0: 3 children, read as
// 2
openBug('B15', 'P2', 'Pasting list items before an item’s same-line quote merges a pasted node', {
  'pasting items before an item\'s same-line quote keeps every pasted node': () => {
    assertNoWriteFailure(executeOnText('- >', { type: 'pasteAt', at: { parent: 1, after: null }, clipboard: { 'text/plain': '- a\n- b' } }, { config: { flavor: 'obsidian', quotes: 'container', indentUnit: 'tab' } }));
  },
});

// B16 [P2]. Pasting a child after a lazy paragraph ejects it from nested quotes
//
// Location: `src/commands/paste.ts` (`pasteAtCommand`), `src/writer/write.ts` (gap placement).
//
// The item already has a lazy paragraph containing `"`. Adding the quoted child introduces a blank
// quoted line before that paragraph while copying its old tab-led line without a quote prefix. It
// consequently leaves the nested quotes; the operation fails with `root › 0: 1 children, read as
// 3`. When a new blank line ends laziness, explicitly continue the existing paragraph's containers
// before appending the new child.
openBug('B16', 'P2', 'Pasting a child after a lazy paragraph ejects it from nested quotes', {
  'a child pasted after a lazy paragraph stays in the nested quotes': () => {
    assertNoWriteFailure(executeOnText('#\n>>-\t[a]:u\n\t"', { type: 'pasteAt', at: { parent: 4, after: 5 }, clipboard: { 'text/plain': '> a\n>\n> b' } }));
  },
});

// B21 [P2 partly fixed]. After cutting a node above a table, indented code, a thematic break, a footnote or an HTML block, Paste is refused or deferred
//
// Status (2026-11-05): verified on the current tree: table, rule, HTML and footnote paste back;
// indented code still refuses (`the lines would end the indented code`).
//
// Same flow, same caret rule; here the caret is a spot where paste is `not-expressible` or
// `Deferred`:
//
//   "first\n\n| a | b |\n|---|---|\n| 1 | 2 |\n"  cut "first" => caret 0; paste => Rejected not-expressible
//   "first\n\n    indented code\n"                  cut => caret 4;           paste => Rejected not-expressible
//   "first\n\n---\n"        cut => caret 0; paste => Deferred
//   "first\n\n[^1]: foot\n" cut => caret 6; paste => Deferred
//   "first\n\n<div>x</div>\n" cut => caret 0; paste => Deferred
//
// So the cut node cannot be put back (or moved above/below the neighbor) with Paste. With the
// default `pasteAtTextStart: after` a node pasted at an item's text start goes *after* it, so even
// the successful case moves it: `"- a\n- b"` cut `a` then Paste gives `"- b\n- a"`.
openBug('B21', 'P2 partly fixed', 'After cutting a node above a table, indented code, a thematic break, a footnote or an HTML block, Paste is refused or deferred', {
  'a node cut from above indented code pastes back': () => {
    const cut = executeOnText('first\n\n    indented code\n', { type: 'cut' });
    assertApplied(executeAfter(cut, { type: 'paste', clipboard: assertApplied(cut).clipboard! }));
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

// B193 [P3]. A bare `-` gaining text takes in the indented block after it
//
// Location: `src/writer/draft.ts` (the seam check, `#apart`, around line 1819).
//
// An empty item has no content column, so `  a` after it is a root. Once the marker has text, the
// copied line is at the item's column and joins it. One mechanism on three paths (plain paste,
// paste, Delete's join). With a space after the marker (`- ┃⏎⏎  a`) the seam check already answers:
// `not-expressible`, "would join the item above it, even with a blank line between". So only the
// bare `-` escapes it, most likely as B190 does, the check reading the upper lines as they were
// (not confirmed by a fix). Move the block, or refuse as `- ` does. (A table pasted on `- `, its
// text an atom, escaped the check too, which counted only prose as giving the item text: fixed,
// Regression291.)
openBug('B193', 'P3', 'A bare `-` gaining text takes in the indented block after it', {
  'a two-paragraph plain paste on a bare marker leaves the paragraph after it apart': () => {
    // writes - a⏎⏎  b⏎⏎  a⏎
    assertNoWriteFailure(executeOnText('-\n\n  a\n', { type: 'pastePlain', text: 'a\n\nb' }, { caret: 1 }));
  },
  'two lines plain-pasted on a bare marker leave the fence after it apart': () => {
    // writes - x⏎  y⏎⏎  ```⏎
    assertNoWriteFailure(executeOnText('-\n\n  ```\n', { type: 'pastePlain', text: 'x\ny' }, { caret: 1 }));
  },
  'a paste of paragraphs on a bare marker leaves the list after it apart': () => {
    // writes - p⏎⏎  q⏎⏎  - b⏎
    assertNoWriteFailure(executeOnText('-\n\n  - b\n', { type: 'paste', clipboard: { 'text/plain': 'p\n\nq' } }, { caret: 1 }));
  },
  'Delete joining text to a bare marker leaves the paragraph after it apart': () => {
    // writes - ===⏎⏎  a⏎
    assertNoWriteFailure(executeOnText('-\n\n===\n\n  a\n', { type: 'deleteContentForward' }, { caret: 1 }));
  },
});

// B301 [P3]. Pasting an item whose text is a heading over a paragraph after a paragraph fails to write
//
// Location: `src/commands/paste.ts` (fitting a pasted item as a paragraph).
//
// `m⏎⏎x` with `x` selected, pasting Markdown `- # title⏎`: the item is fitted as a paragraph whose
// text is `# title`, the writer writes `m⏎# title`, which reads as a heading: `write-failed`, `root ›
// 1: a paragraph, read as a heading`. `1. # title` too, either selection direction, with or without
// ourus's mark. Over the only paragraph (`x` alone) it pastes the item; a heading clipboard works.
// Keep the heading (a heading node), or escape its `#`. P3: an item whose text is a heading. Reached
// in 60-action sessions.
openBug('B301', 'P3', 'Pasting an item whose text is a heading over a paragraph after a paragraph fails to write', {
  'an item with a heading pasted over a later paragraph writes': () => {
    assertNoWriteFailure(executeOnText('m\n\nx', { type: 'paste', clipboard: { 'text/plain': '- # title\n', 'text/markdown': '- # title\n' } }, { anchor: 3, head: 4 }));
  },
});

// B327 [P3]. A paste over a paragraph's first line, before a padded line and an item, fails to write
//
// Location: the writer, the padded line the paste leaves (`src/commands/paste.ts`, `src/commands/copy.ts`).
//
// `«abc»⏎  def⏎-⏎  def` (Obsidian, `markup: text`), pasting `- x⏎- y`: `root › 0: text "  def", read as
// "def"`; a paste of `x⏎⏎y` too. Without the item after it, it writes. Found with the paste putting the
// rest of the paragraph first, fixed (the list goes where the selection was); kept apart, its cause
// another. P3: a padded line and an empty item after it.
openBug('B327', 'P3', 'A paste over a paragraph\'s first line, before a padded line and an item, fails to write', {
  'a paste over a first line before a padded line and an item writes': () => {
    // root › 0: text "  def", read as "def"
    assertNoWriteFailure(executeOnText('abc\n  def\n-\n  def', { type: 'paste', clipboard: { 'text/markdown': '- x\n- y' } }, { anchor: 0, head: 3, config: { flavor: 'obsidian', markup: 'text' } }));
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

// B37 [P2]. Removing a quote paragraph corrupts the identities of nested quotes left behind
//
// Location: `src/writer/write.ts:1242`.
//
// The remaining quote chain shares its first source line. When that prefix is rewritten after the
// first paragraph is cut, descendant identities are not restored to their correct new head
// positions. The readback allocates new ids for surviving nodes and rejects the edit. This also
// reproduces through deleteSubtree, outdent and pasteAt; those are grouped here.
//
// Observed: write-failed:the text written doesn't read as the draft: root › 0 › 0 › 0: id 4, read
// as 6
openBug('B37', 'P2', 'Removing a quote paragraph corrupts the identities of nested quotes left behind', {
  'cutting a quote\'s paragraph keeps the nested quotes\' ids': () => {
    assertNoWriteFailure(executeOnText('>\t$\n> > > q', { type: 'cut' }, { caret: 2, config: { quotes: 'container' } }));
  },
});

// B39 [P2]. Moving a quote container strips indentation from an untouched descendant’s continuation
//
// Location: `src/writer/write.ts:532`.
//
// The move changes the outer container while a descendant’s continuation has spaces beyond its list
// prefix. Those spaces are part of the descendant’s text, but the shifted output removes them. The
// check catches the changed body and rejects the move. A container shift must preserve
// text-relative indentation.
//
// Observed: write-failed:the text written doesn't read as the draft: root › 0 › 0: text "d\n  a",
// read as "d\na"
openBug('B39', 'P2', 'Moving a quote container strips indentation from an untouched descendant’s continuation', {
  'moving a quote keeps a descendant\'s continuation spaces': () => {
    assertNoWriteFailure(executeOnText('- >\n   - d\n    a', { type: 'moveSubtree', to: { parent: 3, after: null } }, { caret: 2, config: { quotes: 'container' } }));
  },
});

// B40 [P2]. Indenting a selection across a paragraph and nested quotes loses a node
//
// Location: `src/commands/shape.ts:88`.
//
// The default mixed-depths path levels the selected roots and then indents them. With this
// nested-quote shape, the fixed draft and the serialized outline disagree about the number of
// roots. The combined action returns write-failed. Validate quote/container boundaries after
// levelling and before writing the second step.
//
// Observed: write-failed:the text written doesn't read as the draft: root: 4 children, read as 3
openBug('B40', 'P2', 'Indenting a selection across a paragraph and nested quotes loses a node', {
  'indenting across a paragraph and nested quotes keeps every node': () => {
    assertNoWriteFailure(executeOnText('\na\n>a\n>>b', { type: 'indent' }, { anchor: 0, head: 9 }));
  },
});

// B41 [P2]. Indenting a forest can detach the line that carries a surviving parent’s marker
//
// Location: `src/commands/shape.ts:111`.
//
// The selected roots include a nested item whose first child starts on its marker’s line. Levelling
// the forest moves that child while retaining the parent marker, and the writer has no valid
// spelling for the resulting split line. Refuse this structure before writing or keep the
// shared-line parent/child unit together.
//
// Observed: write-failed:the writer can't write node 2's marker is on its first child's line, which
// goes
openBug('B41', 'P2', 'Indenting a forest can detach the line that carries a surviving parent’s marker', {
  'indenting a forest keeps a surviving parent\'s marker line': () => {
    assertNoWriteFailure(executeOnText('-\n- -\n  -', { type: 'indent' }, { anchor: 9, head: 1 }));
  },
});

// B43 [P2]. Moving a list child out of a quote truncates text continued from the following quoted paragraph
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
openBug('B43', 'P2', 'Moving a list child out of a quote truncates text continued from the following quoted paragraph', {
  'moving a list child out of a quote keeps its continuation': () => {
    assertNoWriteFailure(executeOnText('\n> -\n>   - b\n> a\n>-\n- ]\n>', { type: 'moveSubtree', to: { parent: 'root', after: 5 }, nodes: [3] }, { anchor: 10, head: 9 }));
  },
});

// B44 [P2]. Moving a reference-bearing quote drops lazy reference lines from a surviving item’s text
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
openBug('B44', 'P2', 'Moving a reference-bearing quote drops lazy reference lines from a surviving item’s text', {
  'moving a quote keeps a surviving item\'s lazy reference lines': () => {
    assertNoWriteFailure(executeOnText('[r]:u\nH\n=\n>-\n>   - b\n>q\n[r]: /u\n-', { type: 'moveSubtree', to: { parent: 2, after: 3 }, nodes: [5] }, { caret: 17 }));
  },
});

// B45 [P2]. Moving a reference-only item activates a literal child list marker
//
// Location: `src/writer/draft.ts` (moved-line escaping), `src/writer/write.ts` (lazy lines).
//
// The moved reference-only item has a paragraph child whose text is the literal `- x`. The
// attempted output is `-\n- [a]:u\n\t- x\n>\t-`; that child is now read as an actual list item, and
// the move returns `a paragraph, read as a item`. The context change activates a marker that used
// to be literal continuation text. Escape or respell that child's line in the new context. This is
// not the reference-line truncation in finding B44: here a surviving ordinary paragraph acquires
// structural list meaning instead of losing reference text.
openBug('B45', 'P2', 'Moving a reference-only item activates a literal child list marker', {
  'moving a reference-only item keeps its child paragraph literal': () => {
    assertNoWriteFailure(executeOnText('-\n>\t-\n>     + [a]:u\n\t- x', { type: 'moveSubtree', nodes: [4], to: { parent: 'root', after: 1 } }, { caret: 24 }));
  },
});

// B47 [P2]. Duplicating an indented paragraph strips a structurally necessary blank line's indentation in its list
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
openBug('B47', 'P2', 'Duplicating an indented paragraph strips a structurally necessary blank line\'s indentation in its list', {
  'duplicating an indented paragraph keeps its list\'s indented blank line': () => {
    assertNoWriteFailure(executeOnText(' p\n\n-\n  \n  -', { type: 'duplicateSubtree' }, { caret: 2 }));
  },
  'a duplicated indented paragraph keeps its leading space': () => {
    assert.equal(appliedText(executeOnText(' p\n- a\n', { type: 'duplicateSubtree' }, { caret: 1 })), ' p\n- a\n\n p\n- a\n');
  },
});

// B52 [P2 partly fixed]. A quote paragraph whose first line has one extra space can't be moved onto an item's marker line
//
// Its `moveSubtreeUp` writes now, with spaces or tabs (`- > a⏎  >⏎  >  b`, Alt-Up on `b`: `- >  b⏎
// >⏎  > a`). Still failing: moving the paragraph before it out of the quote, `- > a⏎  >⏎  >  b`
// with `quotes: container`, `a` moved to the root's start (`moveSubtree`, `{ parent: 'root', after:
// null }`). `b` goes onto the marker line, but its line is written without its `  > ` prefix (`
// b`), so the marker has nothing to go over (`a marker's line written over " b"`; before this round
// it failed at the re-indent's check).
openBug('B52', 'P2 partly fixed', 'A quote paragraph whose first line has one extra space can\'t be moved onto an item\'s marker line', {
  'moving a paragraph out of a quote above a padded paragraph writes': () => {
    assertNoWriteFailure(executeOnText('- > a\n  >\n  >  b', { type: 'moveSubtree', nodes: [3], to: { parent: 'root', after: null } }, { config: { quotes: 'container' } }));
  },
});

// B53 [P2]. Moving an item's quoted paragraph below its quoted heading produces an unwritable draft
//
// Default configuration, text `"- > a\n  > # b\n"`, caret 5 (end of `a`), command
// `moveSubtreeDown`. Actual: `write-failed`, `root: 1 children, read as 2`.
//
// Reordering these blocks must either preserve the containing item and quote or give a deliberate
// `not-expressible` refusal if the heading's ownership makes the requested structure impossible.
// Instead, the move proceeds and its serialization creates another root. The item has no text of
// its own: its marker shares the quote's first block, so moving that block also needs to preserve
// the wrapper. Relevant paths: `src/commands/move-subtree-by.ts`, shared-marker handling in
// `src/writer/write.ts`. No tabs, code, lazy continuation or block IDs are involved.
openBug('B53', 'P2', 'Moving an item\'s quoted paragraph below its quoted heading produces an unwritable draft', {
  'moving a quoted paragraph below its quoted heading writes or is refused': () => {
    assertNoWriteFailure(executeOnText('- > a\n  > # b\n', { type: 'moveSubtreeDown' }, { caret: 5 }));
  },
});

// B54 [P2]. Moving a paragraph above a loose numbered list loses a root block
//
// Status (2026-11-05): verified on the current tree: no longer a write failure, refused instead
// (`not-expressible`, the item would join the item above); the move itself still isn't done.
//
// With `listParent: 'container'`, parse `"1. First\n\n   Another paragraph\n\nSecond\n\n   - A
// child\n"`. Place the caret at the start of `Second` (32) and run `moveSubtreeUp`. Actual:
// `write-failed`, `root: 3 children, read as 2`.
//
// `Second` is a sibling paragraph and the final bullet is a separate root item under this
// configuration. Reordering the paragraph must keep both list runs and their loose paragraphs
// intact. Instead, the emitted boundary absorbs one root. Relevant path: mixed block/list movement
// in `src/commands/move-subtree-by.ts` and the writer's subtree-gap handling. Unlike B51, there is
// no table or deletion; a paragraph crosses a numbered list.
openBug('B54', 'P2', 'Moving a paragraph above a loose numbered list loses a root block', {
  'a paragraph moves above a loose numbered list': () => {
    assertApplied(executeOnText('1. First\n\n   Another paragraph\n\nSecond\n\n   - A child\n', { type: 'moveSubtreeUp' }, { caret: 32, config: { listParent: 'container' } }));
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

// B180 [P3]. Duplicating a quote that ends in a nested empty quote gives a copied node another id
//
// Carried over from the previous round (dev/23-bugs.md).
//
// The copy's nested quote is written anew where the draft named it (`nameCopies`, identity of
// copies).
openBug('B180', 'P3', 'Duplicating a quote that ends in a nested empty quote gives a copied node another id', {
  'duplicating a quote ending in a nested empty quote keeps the copy\'s ids': () => {
    assertNoWriteFailure(executeOnText('> \t~\r>>', { type: 'duplicateSubtree' }));
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

// B183 [P2]. A section's last node moved down into the next section and back loses the blank line above it
//
// Carried over from the previous round (dev/23-bugs.md).
//
// Alt-Down then Alt-Up on `item` doesn't round-trip. The section-end rule gives the node that ended
// a section the gap the new end had where it was (the item's: none, at the text's end). About 20
// such round trips (three spec buffers) lose a line, where about 50 others no longer gain one since
// that rule's rework (blank lines around headings).
//
// Tried: giving the old end the new end's gap only where the two were adjacent (`#scopeEnds`) fixes
// this case but breaks 14 spec cases (section swaps, MoveDown4, MoveUp27, Quote21): what ends a
// section is its deepest last node, rarely adjacent to the one it trades with. Here two scope ends
// change at once (section B's, and the document's, from `- item` to `## C`), and the item's own gap
// was the document end's. A fix has to tell those apart: a rework of `#scopeEnds`.
openBug('B183', 'P2', 'A section\'s last node moved down into the next section and back loses the blank line above it', {
  'a section\'s last node moved down and back keeps its blank line': () => {
    const down = executeOnText('## B\n\npara\n\n- item\n\n## C', { type: 'moveSubtreeDown' }, { caret: 12 });
    assert.equal(appliedText(down), '## B\n\npara\n\n## C\n\n- item');
    // ## B⏎⏎para⏎- item⏎⏎## C: the blank line between para and item is gone
    assert.equal(appliedText(executeAfter(down, { type: 'moveSubtreeUp' })), '## B\n\npara\n\n- item\n\n## C');
  },
});

// B190 [P3]. Indenting or outdenting an item takes in a fence or quoted list at an in-between indent after it
//
// Status (2026-11-05): found by `node test/sessions.ts` (its two `write-failed` groups, held in the
// baseline).
//
// The seam check (`#apart` in `src/writer/draft.ts`) reads the subtree above from `#lastLines`,
// which gives a nested item at its old indentation (` - item`, `   - nested bul`), while the writer
// writes it at its new one (`  - item`, `- nested bul`). At the new one, the item's content column
// is 2 and takes in the next line (the fence, the quote); at the old one the check sees them apart.
// A plain paragraph there is refused as it should be (`not-expressible`); a bare `  > q` too.
// `#lastLines` lines up only a node moved in itself (`#movedIn`), not a descendant re-indented with
// it, nor a paragraph the command made an item. A refusal either way: only its reason is wrong.
openBug('B190', 'P3', 'Indenting or outdenting an item takes in a fence or quoted list at an in-between indent after it', {
  'indenting an item over a fence at an in-between indent is refused, not failed': () => {
    assertNoWriteFailure(executeOnText('x\n\n\\- \n - item\n  ```', { type: 'indent' }, { caret: 3, config: { flavor: 'commonmark' } }));
  },
  'outdenting an item over a quoted list at an in-between indent is refused, not failed': () => {
    assertNoWriteFailure(executeOnText('%% comment %%\n1. first\n   - nested bul\nx- sibling\n  > - list in quote', { type: 'outdent' }, { caret: 40, config: { flavor: 'gfm' } }));
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

// B289 [P3]. Moving quoted items fails where their `>` padding differs
//
// Location: `src/writer/write.ts` (a moved line's prefix and indentation).
//
// The space after `>` is optional and may differ between a quote's lines. `> - a⏎>- b`, Alt-↑ on
// `b`: `write-failed`, "a moved node's lines aren't indented as far as its first". `>- a⏎> - b`
// moves. No tab, lazy line or nested quote needed. The item's indentation should be taken relative
// to its own line's prefix. SilverBullet makes the move, normalizing the spacing. Not B39 (a moved
// quote container) nor B53 (a quoted paragraph and heading). Session 26810. P3: unevenly spaced `>`.
openBug('B289', 'P3', 'Moving quoted items fails where their `>` padding differs', {
  'moving a quoted item above one with a wider prefix writes': () => {
    assertNoWriteFailure(executeOnText('> - a\n>- b', { type: 'moveSubtreeUp' }, { caret: 6 }));
  },
});

// B297 [P3]. Indenting the paragraph that owns a list strips a quote atom's lazy-line indentation
//
// Location: `src/writer/write.ts` (an owned quoted item re-indented under `quotes: atom`).
//
// `intro⏎1. > quote⏎  continuation⏎   > more`, `quotes: atom`, Tab on `intro`: written `- intro⏎
// 1. > quote⏎  continuation⏎     > more`, the lazy line's two spaces, which are the atom's text,
// not re-indented with it: `text "> quote⏎  continuation⏎> more", read as "> quote⏎continuation⏎>
// more"`. No tab, mark or forest selection. Not B39 (a quote container's untouched descendant).
// Session 53743. P3: `quotes: atom` (D24).
openBug('B297', 'P3', 'Indenting the paragraph that owns a list strips a quote atom\'s lazy-line indentation', {
  'indenting a quote atom\'s owner keeps its lazy line': () => {
    assertNoWriteFailure(executeOnText('intro\n1. > quote\n  continuation\n   > more', { type: 'indent' }, { caret: 1, config: { flavor: 'commonmark', quotes: 'atom' } }));
  },
});

// B303 [P3]. Moving an unevenly indented child out after its parent puts its blank line before it
//
// Location: `src/writer/draft.ts` (gaps), `src/writer/write.ts` (a moved item's layout).
//
// `a⏎- b⏎⏎- p⏎    - c⏎  - d⏎⏎z⏎`, `c` dropped after `p` (a place `drag` offers): written
// `a⏎- b⏎⏎- p⏎  - d⏎⏎- c⏎z⏎`, the blank line before `c`, none after, so `z` is its lazy line:
// `root: 2 children, read as 1`. `c` at two spaces moves (`…⏎- c⏎⏎z⏎`); Shift-Tab on `c` writes.
// Found by the inverse oracle (generated note 163). Not B54 nor B183; B190's seam probing is
// near. P3: a child further in than its sibling.
openBug('B303', 'P3', 'Moving an unevenly indented child out after its parent puts its blank line before it', {
  'an unevenly indented child dropped after its parent keeps the paragraph after it': () => {
    assertNoWriteFailure(executeOnText('a\n- b\n\n- p\n    - c\n  - d\n\nz\n', { type: 'moveSubtree', nodes: [4], to: { parent: 1, after: 3 } }));
  },
});

// B309 [P3]. Indenting a footnote whose body starts below a blank line into a quote fails to write
//
// Location: `src/writer/write.ts` (a footnote's continuation lines and blank lines under a new `>`),
// `src/writer/draft.ts` (the gap).
//
// `>⏎[^n]:⏎⏎    c`, Obsidian, Tab at the label: `root › 0: 1 children, read as 2`. Without the blank line
// between `[^n]:` and `c` it writes. `>⏎> [^n]:⏎>⏎>     c` would do. Not B290 (the label's indentation)
// nor B298 (a footnote in an item).
openBug('B309', 'P3', 'Indenting a footnote whose body starts below a blank line into a quote fails to write', {
  'a footnote with a blank line before its body indents into a quote': () => {
    // root › 0: 1 children, read as 2
    assertNoWriteFailure(executeOnText('>\n[^n]:\n\n    c', { type: 'indent' }, { caret: 13, config: { flavor: 'obsidian' } }));
  },
});

// =================================================================================================
// Enter and Shift-Enter in quotes, callouts and quoted lists
//
// Enter and Shift-Enter inside a quote or callout, or in a quoted list or task, either refuse
// (`write-failed`; B61 is the most ordinary: the end of the first line of a two-line quote in an
// item followed by a blank line) or put the caret and the following lines in the wrong place (B60).
bugCluster('Enter and Shift-Enter in quotes, callouts and quoted lists');

// B55 [P2]. Shift-Enter across a callout title boundary truncates the expected title text
//
// Location: `src/commands/shift-enter.ts:31`.
//
// The selected span crosses the line ending between an Obsidian callout title and a lazy
// continuation outside its body. The draft expects the text T followed by a, but the written
// callout title reads only T. The operation reaches write-failed instead of handling or
// semantically rejecting the cross-boundary selection.
//
// Observed: write-failed:the text written doesn't read as the draft: root › 0: text "T\na", read as
// "T"
openBug('B55', 'P2', 'Shift-Enter across a callout title boundary truncates the expected title text', {
  'Shift-Enter across a callout title\'s line break writes or is refused': () => {
    assertNoWriteFailure(executeOnText('>[!e]T\na', { type: 'shiftEnter' }, { anchor: 7, head: 6, config: { flavor: 'obsidian' } }));
  },
});

// B56 [P2]. Enter before a quoted task nests the original task instead of keeping it a sibling
//
// Locations: `src/commands/enter.ts:108–111`, `src/writer/write.ts:775–796`.
//
// This returns `write-failed`, `root › 0: 2 children, read as 1`. The attempted output is `>\n > -
// [ ] \n>   - [x] x`: the new empty task and the old task do not line up, so the old task becomes a
// child of the new one. The quote's blank opening row and its later indented `>` expose
// inconsistent alignment when a new item is placed before an existing first item. Preserve the
// sibling columns under the quote. No placeholders or tabs are needed for this failure.
openBug('B56', 'P2', 'Enter before a quoted task nests the original task instead of keeping it a sibling', {
  'Enter before a quoted task keeps it a sibling': () => {
    // attempted: >⏎ > - [ ] ⏎>   - [x] x
    assertNoWriteFailure(executeOnText('>\n >- [x] x', { type: 'enter' }, { caret: 9 }));
  },
});

// =================================================================================================
// Backspace, Delete and joins around quotes, tasks and headings
//
// Backspace and Delete at the edge of a quote, callout, task or heading either refuse (B73: the
// start of an item holding a multi-line callout) or join in a way that loses structure: a heading
// is demoted, a checkbox stays as literal text, an unrelated paragraph becomes a child.
bugCluster('Backspace, Delete and joins around quotes, tasks and headings');

// B69 [P2]. Deleting the remaining nested quote can make a preceding empty item absorb the surviving quote
//
// Location: `src/writer/draft.ts:1016`.
//
// Deleting the inner quote causes the outer quote to collapse to a quoted paragraph. The newly
// simplified block is written directly after an empty list marker without the separation its new
// shape requires. Markdown reads it under that item, while the draft expects two roots. Quote
// simplification must be followed by boundary normalization.
//
// Observed: write-failed:the text written doesn't read as the draft: root: 2 children, read as 1
openBug('B69', 'P2', 'Deleting the remaining nested quote can make a preceding empty item absorb the surviving quote', {
  'deleting a nested quote keeps the surviving quote apart from an empty item': () => {
    assertNoWriteFailure(executeOnText('-\n>\ta\n>>', { type: 'deleteSubtree' }, { caret: 8 }));
  },
});

// B70 [P2]. Outdenting a lazy paragraph from a quote fails to keep it separate from an empty item
//
// Location: `src/commands/outdent.ts:82`.
//
// The quote’s paragraph is lazily continued by an indented line. Moving that paragraph out leaves
// an empty quote boundary beside an empty item; the written result merges roots that the draft
// keeps separate. This valid outdent reaches write-failed rather than a stable serialized outline.
//
// Observed: write-failed:the text written doesn't read as the draft: root: 2 children, read as 1
openBug('B70', 'P2', 'Outdenting a lazy paragraph from a quote fails to keep it separate from an empty item', {
  'outdenting a lazy paragraph keeps it apart from an empty item': () => {
    assertNoWriteFailure(executeOnText('-\n>\tq\n d', { type: 'outdent', nodes: [3] }, { caret: 1, config: { quotes: 'container' } }));
  },
});

// B202 [P3]. Backspace at the start of a rule or table is the host's, and a rule makes a heading
//
// Location: `src/commands/backspace.ts`, `joinUp` (an atom as `node` falls to `return null`).
//
// The host's default gives `p⏎---`: the paragraph silently **becomes a setext heading** (checked),
// which is the real harm. The table case is harmless: `p⏎| a | b |⏎|---|---|` still reads as a
// paragraph and a table. The `$$` and fence cases remove the blank line. So three answers at one
// boundary: refused (`can't join into table`, Delete's `can't take in the atom below`), a blank
// line taken, and deferred. The rule needs at least a refusal.
openBug('B202', 'P3', 'Backspace at the start of a rule or table is the host\'s, and a rule makes a heading', {
  'Backspace at a rule keeps the paragraph a paragraph': () => {
    const result = executeOnText('p\n\n---\n', { type: 'deleteContentBackward' }, { caret: 3 });
    // Deferred "ourus doesn't do it here yet": the host's default gives p⏎---, a setext heading
    assert.ok(result.constructor.name !== 'OurusDeferred', "the host's edit makes a heading");
  },
  'Backspace at a table answers as Delete does': () => {
    const result = executeOnText('p\n\n| a | b |\n|---|---|\n', { type: 'deleteContentBackward' }, { caret: 3 });
    assert.ok(result.constructor.name !== 'OurusDeferred');
  },
});

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

// B204 [P3]. Backspace right after a space typed at a later line's start joins the lines
//
// Location: `src/commands/backspace.ts:172` (the `offset > first` test).
//
//   a⏎┃b, type a space, Backspace → a ┃b (a⏎┃b expected; any other character gives it)
//   - a⏎  ┃b, the same → - a ┃b
//   a⏎┃b, two spaces, Backspace → a  ┃b, Backspace → a ┃b
//
// The comment cites ShiftEnter21 (Shift-Enter's break taken back), but that case's caret is
// **before** the space (`  ┃ three`). Past the spaces nothing in the spec needs a join, so testing
// `offset > lineStart` instead of `> first` may fix this without touching ShiftEnter21 (not tried).
// A type-then-Backspace round trip over the generated notes met this in 1,604 of about 14,000 runs,
// all at line starts.
openBug('B204', 'P3', 'Backspace right after a space typed at a later line\'s start joins the lines', {
  'Backspace takes back a space typed at a later line\'s start': () => {
    assert.equal(appliedText(executeOnText('a\n b\n', { type: 'deleteContentBackward' }, { caret: 3 })), 'a\nb\n');
  },
  'Backspace takes back a space typed at an item\'s later line\'s start': () => {
    assert.equal(appliedText(executeOnText('- a\n   b\n', { type: 'deleteContentBackward' }, { caret: 7 })), '- a\n  b\n');
  },
});

// B279 [P3]. A soft-line deletion that makes a callout title, a nested quote below, fails to write
//
// Location: `src/commands/backspace.ts` (`deleteSoftLineBackwardCommand`), its callout check.
//
// `>([!e]⏎>>`, Obsidian, Cmd-Backspace after `(`: written `>[!e]⏎>>`, a callout, where the draft
// has a quote with the text `[!e]`: `write-failed`, `a text "[!e]" it shouldn't have`. On one line
// (`>([!e]`) it is refused, `not-expressible`, "the quote's first line would read as a callout's
// title"; the nested quote below takes it past that check. Backspace there is the host's. P3.
openBug('B279', 'P3', 'A soft-line deletion that makes a callout title, a nested quote below, fails to write', {
  'a soft-line deletion making a callout title is refused, a nested quote below too': () => {
    const result = executeOnText('>([!e]\n>>', { type: 'deleteSoftLineBackward' }, { caret: 2, config: { flavor: 'obsidian' } });
    // rejected write-failed
    assert.ok(result instanceof OurusRejected && result.reason === 'not-expressible', String(result instanceof OurusRejected ? result.reason : result.constructor.name));
  },
});

// B341 [P3]. Duplicating a quoted item above the quote's last bare `>` fails to write
//
// Location: `src/writer/write.ts` (a copy's trailing blank lines, `shift.trailing`).
//
// `>- x⏎>⏎>` (`quotes: container`), the last line a bare `>` with no line break after it, duplicating
// the item: `root: 1 children, read as 2`. The copy's blank lines are the quote's (`>`), but the
// writer takes them as the container's after the copy, the root's: the first is copied as its line
// ending alone, `⏎`, and the last, the old text's last line with no line ending, written as it was,
// `>`, now after a blank line: a second quote. With a line break after the last `>` it writes. Split
// from B305, whose other case (a last line of spaces) is fixed.
openBug('B341', 'P3', 'Duplicating a quoted item above the quote\'s last bare `>` fails to write', {
  'a quoted item duplicates above a last bare `>`': () => {
    // root: 1 children, read as 2
    assertNoWriteFailure(executeOnText('>- x\n>\n>', { type: 'duplicateSubtree', nodes: [2] }, { config: { flavor: 'gfm', quotes: 'container' } }));
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
    for (const flavor of ['gfm', 'obsidian'] as const) {
      // root › 0: text "h", read as "h⏎x⏎-|"
      assertNoWriteFailure(executeOnText('- # h\n  x\n-|', { type: 'deleteSoftLineBackward' }, { caret: 4, config: { flavor } }));
    }
  },
});

// B328 [P3]. Joining a paragraph into an empty item above indented code fails to write
//
// Location: `src/commands/backspace.ts` (a text joined into an empty item), the writer's seam with the
// code after.
//
// `-⏎┃x⏎⏎    c`, Backspace: `root: 2 children, read as 1`: `x` the item's text now, the code's four columns
// read as the item's continuation. The code must stay apart, written so. With a paragraph after
// instead of code it writes. Not B308.
openBug('B328', 'P3', 'Joining a paragraph into an empty item above indented code fails to write', {
  'a paragraph joins an empty item, the code after it its own': () => {
    // root: 2 children, read as 1
    assertNoWriteFailure(executeOnText('-\nx\n\n    c', { type: 'deleteContentBackward' }, { caret: 2, config: { flavor: 'obsidian' } }));
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

// B205 [P3]. Enter at a fence after an item's unclosed fence can't get its blank line
//
// The blank line above the root fence is the item's open code's, a payload line, so it reads as no
// gap. Refuse (`not-expressible`), as the other open-block seams do.
openBug('B205', 'P3', 'Enter at a fence after an item\'s unclosed fence can\'t get its blank line', {
  'Enter at a fence after an item\'s unclosed fence is refused, not failed': () => {
    // writes - ```⏎⏎```
    assertNoWriteFailure(executeOnText('- ```\n```', { type: 'enter' }, { caret: 6 }));
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
// reads as its start. Not B205.
openBug('B326', 'P3', 'Two line breaks inserted before an opening delimiter fail to write', {
  'two line breaks before a math block\'s opening write': () => {
    // root › 0: 1 blank lines after its text, read as 3
    assertNoWriteFailure(executeOnText('# h\n\n$$\nx\n$$', { type: 'insertText', text: '\n\n' }, { caret: 5, config: { flavor: 'obsidian' } }));
  },
  'two line breaks before an item\'s fence write': () => {
    // root: 1 children, read as 2
    assertNoWriteFailure(executeOnText('- ```\n  x\n  ```', { type: 'insertText', text: '\n\n' }, { caret: 2 }));
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

// B158 [P3]. Moving a quote changes spaces in the lazy text of a neighboring item
//
// Location: `src/writer/write.ts:601`.
//
// The neighboring item is not the moved operand, yet its final lazy continuation loses two literal
// spaces. The failure shows a body difference in that surviving node. Re-indentation must
// distinguish a lazy line’s own whitespace from its container prefix. The deletion variant that
// exposes the same neighboring-text change is grouped here.
//
// Observed: write-failed:the text written doesn't read as the draft: root › 2: text "c\na\np \n
// x", read as "c\na\np \nx"
openBug('B158', 'P3', 'Moving a quote changes spaces in the lazy text of a neighboring item', {
  'moving a quote keeps a neighbor\'s lazy spaces': () => {
    assertNoWriteFailure(executeOnText('-\n>\n  - c\n    a\np \n  x', { type: 'moveSubtreeUp', nodes: [2] }, { caret: 15 }));
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

// B162 [P3]. Duplicating a padded item activates list-like text in a different item
//
// With default configuration, duplicate the first item (caret 3) in:
//
//   -  parent
//     - chil
//     -  child
//       - grandchild
//
// Actual: `write-failed`, `root › 3: text "child\n    - grandchild", read as "child"`. The last
// marker-looking line is originally a lazy continuation of `child`, because that item's padded
// content column is farther right. Duplicating `parent` must preserve that interpretation in the
// unrelated surviving item. Instead, the copied item's placement/line alignment changes how the
// surviving run is written, activating its literal marker. Removing the intervening `chil` row
// makes duplication succeed. Relevant paths: `src/commands/duplicate-subtree.ts:41`–79 and the
// writer's item line-up/shift handling. Unlike B157, this has no tab-padded item and does not
// indent the affected text.
openBug('B162', 'P3', 'Duplicating a padded item activates list-like text in a different item', {
  'duplicating a padded item keeps another item\'s lazy text': () => {
    assertNoWriteFailure(executeOnText('-  parent\n  - chil\n  -  child\n    - grandchild', { type: 'duplicateSubtree' }, { caret: 3 }));
  },
});

// B164 [P3]. Moving a footnote past a paragraph with a quoted list changes its continuation text
//
// Default configuration, text `" [^1]: a\n footnote\n\n| a |\n- > q\n"`, caret 10, command
// `moveSubtreeDown`. Here `| a |` is an ordinary paragraph, not a table. Expected: reorder the
// footnote after the paragraph and its owned list, preserving the footnote's content. Actual:
// `write-failed`, `text "a\nfootnote", read as "a\n   footnote"`.
//
// The footnote has a valid lazy continuation. When it moves past the quoted item, the writer adds
// three literal spaces to that continuation. Replacing the paragraph/list pair with a plain `p`
// paragraph makes the move succeed. Relevant paths are structural movement in
// `src/commands/move-subtree-by.ts` and continuation shifting in `src/writer/write.ts:601` onward.
// This has no tab, block ID, copy, or open delimiter.
openBug('B164', 'P3', 'Moving a footnote past a paragraph with a quoted list changes its continuation text', {
  'moving a footnote past a paragraph\'s quoted list keeps its continuation': () => {
    assertNoWriteFailure(executeOnText(' [^1]: a\n footnote\n\n| a |\n- > q\n', { type: 'moveSubtreeDown' }, { caret: 10 }));
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

// B182 [P3]. A drop of a paragraph with an indented list-like lazy line into a quote, after a leading blank line, fails to write
//
// Carried over from the previous round (dev/23-bugs.md).
//
// `alpha` dropped after `charlie`, the place the pickup `{ type: 'drag', nodes: [1] }` offers.
// Without the leading blank line it writes.
openBug('B182', 'P3', 'A drop of a paragraph with an indented list-like lazy line into a quote, after a leading blank line, fails to write', {
  'a paragraph with a list-like lazy line drops into a quote': () => {
    assertNoWriteFailure(executeOnText('\nalpha\n    - bravo\n> - charlie', { type: 'moveSubtree', nodes: [1], to: { parent: 2, after: 3 } }, { config: { flavor: 'obsidian' } }));
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

// B208 [P3]. A padded item's text rewritten narrower takes in the item after it
//
// The pair isn't the cause: it only gets the text written by ourus rather than the host. The item's
// padding goes (`-  #` to `- #`), so its content column falls from 3 to 2 and `  - other`, a
// sibling at the old column, becomes its child. `repadded` (`write.ts`) handles the held-space
// case.
openBug('B208', 'P3', 'A padded item\'s text rewritten narrower takes in the item after it', {
  'a padded item\'s text rewritten keeps the item after it a sibling': () => {
    // writes - # $$⏎  - other⏎
    assertNoWriteFailure(executeOnText('-  # \n  - other\n', { type: 'insertText', text: '$' }, { caret: 5, config: { autoClose: ['$'] } }));
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

// B298 [P3]. Backspace on a footnote item's trailing blank doubles its lazy line's indentation
//
// Location: `src/commands/backspace.ts`, `src/writer/write.ts` (a footnote in an item rewritten).
//
// `- [^a]: first⏎  second⏎␠␠`, Backspace at the end (taking the last line's spaces): written `-
// [^a]: first⏎        second`, the item's indentation added to the footnote's continuation:
// `text "first⏎second", read as "first⏎␠␠second"`. GFM too. No quote, tab or mark. Seed 7 session
// 22673, seed 42 session 23872, note seed 119 / action seed 20261105 session 55831. Not B164 nor
// B290. P3: a footnote definition in an item.
openBug('B298', 'P3', 'Backspace on a footnote item\'s trailing blank doubles its lazy line\'s indentation', {
  'Backspace on a footnote item\'s trailing blank keeps its continuation': () => {
    const source = '- [^a]: first\n  second\n  ';
    assertNoWriteFailure(executeOnText(source, { type: 'deleteContentBackward' }, { caret: source.length, config: { flavor: 'obsidian' } }));
  },
});

// B300 [P3]. A plain paste of a tab-led paragraph into a quote fails to write
//
// Location: `src/commands/paste-plain.ts` (`plainLines`: a new paragraph's start in a quote).
//
// `> note┃`, pasting `a⏎⏎→b`: written `> notea⏎⏎> →b`; the tab is the draft's text, but read as
// indentation: `text "→b", read as "b"`. Spaces there are trimmed and paste (`> notea⏎⏎> b`); in
// prose or an item the clipboard pastes. Every `indentUnit`, no marks, default quotes; `quotes:
// container` trims the tab, `atom` keeps it as its text. Session 70116 (action seed 8675309, note
// seed 90210). Not B201 nor B192. P3: a tab-led line.
openBug('B300', 'P3', 'A plain paste of a tab-led paragraph into a quote fails to write', {
  'a plain paste of a tab-led paragraph into a quote writes': () => {
    assertNoWriteFailure(executeOnText('> note', { type: 'pastePlain', text: 'a\n\n\tb' }, { caret: 6, config: { flavor: 'commonmark' } }));
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

// B209 [P3]. Emptying the third shared marker writes a thematic break
//
// `- - - ` with no text reads as a rule, as both attempted texts show (the extra root is that rule
// ending the list). The moves already know this collision ("the item's bullet and its rule would
// read as one rule", `move-subtree.ts`). Vary the innermost bullet, or refuse. A structured paste
// over `a` reaches it too. HTML's own form of it is B267.
openBug('B209', 'P3', 'Emptying the third shared marker writes a thematic break', {
  'Enter before a third shared marker writes': () => {
    // writes - - - ⏎    - a⏎: root: 1 children, read as 2
    assertNoWriteFailure(executeOnText('- - - a\n', { type: 'enter' }, { caret: 4 }));
  },
  'clearing the third shared marker\'s text writes': () => {
    // writes - - - : a item, read as a atom
    assertNoWriteFailure(executeOnText('- - - a', { type: 'deleteSoftLineBackward' }, { caret: 7 }));
  },
  'clearing the third shared star marker\'s text writes': () => {
    assertNoWriteFailure(executeOnText('* * * a', { type: 'deleteSoftLineBackward' }, { caret: 7 }));
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

// B211 [P3]. Indenting into a numbered child list restarts or takes the parent's number
//
//   5. a⏎   7. x⏎6. b┃       → 5. a⏎   7. x⏎   1. b       (8. expected)
//   5. a⏎   3. x⏎   4. y⏎6. b┃ → …   4. y⏎   1. b          (5. expected)
//   - a⏎  7. x⏎- b┃          → - a⏎  7. x⏎  - b           (joins with its own bullet: a new list)
//   5. a⏎   - x⏎6. b┃        → 5. a⏎   - x⏎   5. b        (the parent's number)
//   1. a⏎   - x⏎2. b┃        → 1. a⏎   - x⏎   1. b
//   1. a⏎   1. x⏎2. b┃       → 1. a⏎   1. x⏎   2. b       (right)
//   5. a⏎6. b┃               → 5. a⏎   1. b               (right)
//
// An item indented to the end of a numbered child list should count on from its last item. It works
// when that list counts from 1, so the number looks derived from the item's position, not the
// list's start. Rendering ignores it, but `orderedLists: renumber` promises a sequence. Not traced
// further.
openBug('B211', 'P3', 'Indenting into a numbered child list restarts or takes the parent\'s number', {
  'an item indented into a numbered child list counts on': () => {
    assert.equal(appliedText(executeOnText('5. a\n   7. x\n6. b', { type: 'indent' }, { caret: 15 })), '5. a\n   7. x\n   8. b');
  },
  'an item indented past a numbered child list of two counts on': () => {
    assert.equal(appliedText(executeOnText('5. a\n   3. x\n   4. y\n6. b', { type: 'indent' }, { caret: 24 })), '5. a\n   3. x\n   4. y\n   5. b');
  },
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

// B216 [P3]. Expand selection from inside a block id selects text that excludes the caret
//
//   - item ^i┃d1  → - «item» ^id1      (commandAt moves the caret to the text's end, then rung 1 applies)
//   - item ^id1┃  → - «item» ^id1      (the same)
//   - item ┃^id1  → «- item ^id1⏎»     (right before `^`: not in the name, so past the text: the whole node)
//
// `expandSelection` isn't a `BLOCK_ID_COMMANDS` edit, so `commandAt` redirects the caret
// (`src/commands/index.ts`, `name`), and the rung's "holds the selection" contract is checked on
// the moved caret. Over 300 generated notes this gave 141 non-monotonic steps, all at block-id
// carets. Selection commands shouldn't be redirected, or the rung should treat the frame as the
// text's.
openBug('B216', 'P3', 'Expand selection from inside a block id selects text that excludes the caret', {
  'expanding from inside a block id holds the caret': () => {
    const { anchor, head } = assertApplied(executeOnText('- item ^id1\n', { type: 'expandSelection' }, { caret: 9, config: { flavor: 'obsidian' } })).view.selection;
    assert.ok(anchor <= 9 && 9 <= head, `${anchor}–${head}`);
  },
  'expanding from right after a block id holds the caret': () => {
    const { anchor, head } = assertApplied(executeOnText('- item ^id1\n', { type: 'expandSelection' }, { caret: 11, config: { flavor: 'obsidian' } })).view.selection;
    assert.ok(anchor <= 11 && 11 <= head, `${anchor}–${head}`);
  },
});

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

// B219 [P3]. The zoom guard accepts outside changes it can't see
//
// Location: `src/view/escape.ts`, `zoomEscape`; `src/commands/zoom.ts`, `leavesZoom`.
//
// Three gaps, each needing a snapshot a host brings:
//
// - **Order**: outside nodes are compared by parent, kind and text, not relative order.
// - **Newly made nodes**: `m.id >= doc.nextId` misses an id a branch allocated before this
//   snapshot; test membership.
// - **Root removed**: `leavesZoom` compares text alone, so a removal with the same text that adds a
//   held empty paragraph outside passes.
openBug('B219', 'P3', 'The zoom guard accepts outside changes it can\'t see', {
  'outside nodes swapped leave the zoom': () => {
    const doc = OurusDoc.parse('x\n\nx\n\nq', { config: { listParent: 'container' } });
    const moved = assertApplied(executeCommand(OurusView.of(doc, { selection: 0 }), { type: 'moveSubtreeDown', nodes: [1] }));
    assert.equal(leavesZoom(OurusView.of(doc, { zoom: 3 }), moved.view.doc), true);
  },
  'a branch\'s older id outside leaves the zoom': () => {
    const text = '- a\n  \n  \n  \nb';
    const base = OurusDoc.parse(text);
    const add = { changes: [{ from: text.length, to: text.length, insert: 'b' }] };
    const branched = base.update({ marks: { placeholders: [9] } });
    const from = base.update(add);
    const next = branched.update(add);
    // next has a held empty paragraph outside the zoom, id 3, under from.nextId 4
    assert.equal(leavesZoom(OurusView.of(from, { zoom: 2 }), next), true);
  },
  'a root\'s removal that adds a node outside leaves the zoom': () => {
    const doc = OurusDoc.parse('a\n\n\n\n\n- x\n\n\n\n\nb', { config: { listParent: 'container' } });
    const view = OurusView.of(doc, { zoom: 2 });
    const removal = assertApplied(executeCommand(view.withSelection(7), { type: 'deleteSubtree', nodes: [2] }));
    // the canonical removal's text, a node more outside (three root children, not two)
    assert.equal(leavesZoom(view, removal.view.doc.update({ marks: { placeholders: [3] } })), true);
  },
});

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

// B237 [P3]. A rewrite loses a held space, or the node with it
//
// Status (2026-11-06): the shape reached from keys fixed (`- a⏎  ┃```⏎  x⏎  ```⏎- b`, Delete, then
// Alt-Down): the draft settles the held spaces of a text it carries as it was, moved or under another
// prefix, as of one it sets (`#settleHeldSpaces`); a held continuation moved out of a paragraph's list
// too. P3 now: the cases left use hand-built marks, which no key sequence tried reaches.
//
// Seven shapes, one rule missing: when text is rewritten, either its mark stays valid in the
// written layout, or it goes in the draft, not at the readback. The natural sequences tried for
// these particular shapes (Backspace over a first letter in a setext title, a quote, code, a
// continuation) left no mark, and the last has the mark off the caret's line. Joining back across a
// blank code line with a held space fails as the third does.
openBug('B237', 'P3', 'A rewrite loses a held space, or the node with it', {
  'indenting a setext title with a held space': () => {
    assertNoWriteFailure(executeOnText(' p\n=', { type: 'indent' }, { caret: 1, placeholders: [0] }));
  },
  'Enter on a setext underline under a held space': () => {
    assertNoWriteFailure(executeOnText(' p\n-', { type: 'enter' }, { caret: 3, placeholders: [0] }));
  },
  'Shift-Enter in a quoted paragraph held past its `>`': () => {
    assertNoWriteFailure(executeOnText('> q', { type: 'shiftEnter' }, { caret: 3, config: { quotes: 'container' }, placeholders: [1] }));
  },
  'Enter in a quoted paragraph held past its `>`': () => {
    assertNoWriteFailure(executeOnText('> q', { type: 'enter' }, { caret: 3, config: { quotes: 'container' }, placeholders: [1] }));
  },
  'Shift-Enter after a held space in code': () => {
    assertNoWriteFailure(executeOnText('```\n x', { type: 'shiftEnter' }, { caret: 5, placeholders: [4] }));
  },
  'indenting a footnote with a held label separator': () => {
    assertNoWriteFailure(executeOnText('[^f]: f', { type: 'indent' }, { caret: 3, placeholders: [5] }));
  },
  'indenting a footnote keeps a held continuation': () => {
    assertNoWriteFailure(executeOnText('[^a]: note\n    more\n', { type: 'indent', nodes: [1] }, { placeholders: [11] }));
  },
  'Shift-Enter on a lazy line of a held padding': () => {
    assertNoWriteFailure(executeOnText('1.   a\na', { type: 'shiftEnter' }, { caret: 7, placeholders: [4] }));
  },
});

// B296 [P3]. Dropping a blank line of ours between two quotes merges them on Tab
//
// Location: `src/writer/draft.ts` (an auto gap dropped where the blocks stay apart).
//
// A blank line ourus put in (an auto mark on it) may go only while the blocks either side stay
// apart. `> first⏎>⏎> second⏎⏎>` with that mark, Tab on `second`: written `> first⏎>⏎> -
// second⏎>`, the gap gone, the empty quote now the first's: `root: 2 children, read as 1`. Without
// the mark it writes. Default options and `quotes: container`. Sessions reach such marks: 46852
// (`> over two lines⏎⏎> body text⏎> more⏎`, caret 18, GFM, `quotes: container`: indent, enter,
// down, `x`, down, up, indent, indent); 9 or 10 per 100,000 sessions. Not B237 nor B69. P3: the mark
// from a session with non-default options.
openBug('B296', 'P3', 'Dropping a blank line of ours between two quotes merges them on Tab', {
  'Tab beside an auto blank line between quotes keeps them apart': () => {
    const source = '> first\n>\n> second\n\n>';
    const doc = OurusDoc.parse(source, { marks: { auto: [source.lastIndexOf('\n')] } });
    assertNoWriteFailure(executeCommand(OurusView.of(doc, { selection: source.indexOf('second') }), { type: 'indent' }));
  },
});

// =================================================================================================
// Drop preflight
//
// `moveRefused` decides what a pickup offers, on a model of Markdown of its own, and refuses places
// the keyboard reaches.
bugCluster('Drop preflight');

// B241 [P3]. A drop is refused where the same keyboard move writes
//
// Status (2026-11-05): verified on the current tree: reproduces, each with the keyboard move
// succeeding.
//
// Location: `src/commands/move-subtree.ts`, `unholdable`, `joinsAround`, `moveRefused`.
//
// `moveSubtreeUp` of node 3 in the first three, and of 2 in the last, and `moveSubtreeDown` of node
// 1 in the second, write those very places: `- ```⏎- c⏎- b`, `100. a⏎101. b⏎⏎    code`, `---⏎# h`.
//
// Each check is too wide. A next item's marker ends an item's fence (`above?.parent === parent`
// treats the item as open across siblings). A marker five columns wide doesn't own code at column
// 4. A `---` in an item's code is container-stripped text, not column 0. The moved node's own old
// line counts as a second delimiter. Drags offer none of these places. Ranked P3, not P2: refusals,
// and all need an unclosed fence, a wide marker or a `---`. Decide from the destination's spelling,
// or let the writer answer.
openBug('B241', 'P3', 'A drop is refused where the same keyboard move writes', {
  'a drop past a sibling of an item\'s unclosed fence writes': () => {
    assertApplied(executeOnText('- ```\n- b\n- c', { type: 'moveSubtree', nodes: [3], to: { parent: 'root', after: 1 } }));
  },
  'an item with an unclosed fence drops past its sibling': () => {
    assertApplied(executeOnText('- ```\n- b\n- c', { type: 'moveSubtree', nodes: [1], to: { parent: 'root', after: 2 } }));
  },
  'an item drops above code too shallow to be its own': () => {
    assertApplied(executeOnText('100. a\n\n    code\n\n100. b', { type: 'moveSubtree', nodes: [3], to: { parent: 'root', after: 1 } }, { config: { listParent: 'container' } }));
  },
  'a `---` in an item\'s code closes no front matter': () => {
    assertApplied(executeOnText('---\n\n- a\n- ```\n  ---\n  ```', { type: 'moveSubtree', nodes: [3], to: { parent: 'root', after: 1 } }, { config: { flavor: 'obsidian', listParent: 'container' } }));
  },
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

// B246 [P3]. A backtick typed on the empty last line leaves residue when Backspaced
//
// Status (2026-11-05): verified on the current tree: reproduces, in any `autoClose` that lists it.
//
//   autoClose: ['`']
//   - a⏎┃, ` → - a⏎`┃, Backspace → - a⏎␠␠┃   (two spaces)
//   a⏎┃, ` → a⏎`┃, Backspace → a⏎⏎┃          (a line break gained)
//   a⏎┃, x, Backspace → a⏎┃                  (right)
//
// Typing there is the host's; Backspace then is ours and works on the line it finds. Why a backtick
// differs from `x` wasn't found; `blankLineBack` (`backspace.ts:307`) is the place to start.
openBug('B246', 'P3', 'A backtick typed on the empty last line leaves residue when Backspaced', {
  'Backspace takes a backtick typed on the last line after an item': () => {
    // - a⏎␠␠┃: two spaces
    const result = executeOnText('- a\n`', { type: 'deleteContentBackward' }, { caret: 5, config: { autoClose: ['`'] } });
    assert.ok(!(result instanceof OurusSuccess) || result.view.doc.text === '- a\n');
  },
  'Backspace takes a backtick typed on the last line after a paragraph': () => {
    // a⏎⏎┃: a line break gained
    const result = executeOnText('a\n`', { type: 'deleteContentBackward' }, { caret: 3, config: { autoClose: ['`'] } });
    assert.ok(!(result instanceof OurusSuccess) || result.view.doc.text === 'a\n');
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

// B251 [P3]. Escapes and entities split GFM email autolinks
//
// Status (2026-11-05): verified on the current tree: reproduces; cmark-gfm links every row whole.
//
// Location: `src/parser/inlines.ts`, `runTextRules`; `src/parser/gfm.ts`, `emailRule.process`.
//
// | Input | ourus | micromark-gfm | cmark-gfm |
// |---|---|---|---|
// | `a\+b@example.com` | links `b@example.com` | no link | links `a+b@example.com` |
// | `a&#43;b@example.com` | links `b@example.com` | links `b@example.com` | links `a+b@example.com` |
// | `a@example\.com`, `a@example&#46;com`, `a\@example.com` | no link | no link | links the whole |
//
// cmark-gfm matches over decoded text; ourus's rule sees raw text nodes, so it stops at an escape
// or entity. The first row is the harm, a link to the wrong mailbox. Run recognition over
// contiguous decoded text, keeping its source map.
openBug('B251', 'P3', 'Escapes and entities split GFM email autolinks', {
  'an escape in an email\'s local part': () => {
    // links b@example.com: the wrong mailbox
    assert.match(MdTree.parse('a\\+b@example.com', MdFlavor.gfm).renderHtml(), /mailto:a\+b@example\.com/);
  },
  'an entity in an email\'s local part': () => {
    assert.match(MdTree.parse('a&#43;b@example.com', MdFlavor.gfm).renderHtml(), /mailto:a\+b@example\.com/);
  },
  'an escape in an email\'s domain': () => {
    assert.match(MdTree.parse('a@example\\.com', MdFlavor.gfm).renderHtml(), /mailto:a@example\.com/);
  },
  'an entity in an email\'s domain': () => {
    assert.match(MdTree.parse('a@example&#46;com', MdFlavor.gfm).renderHtml(), /mailto:a@example\.com/);
  },
  'an escaped at sign': () => {
    assert.match(MdTree.parse('a\\@example.com', MdFlavor.gfm).renderHtml(), /mailto:a@example\.com/);
  },
});

// B252 [P3]. A sentinel can make unclosed front matter
//
// `frontmatterStart` looks ahead on the raw line, which the sentinel doesn't change, then real
// processing never closes it. Only a closed fence is meant to make front matter
// (`src/parser/obsidian.ts:59`).
openBug('B252', 'P3', 'A sentinel can make unclosed front matter', {
  'a sentinel on the closing fence makes no front matter': () => {
    const tree = MdTree.parse('---\na\n---', MdFlavor.obsidian, { sentinels: [9] });
    assert.notEqual(tree.root.children[0]!.type, 'frontmatter');
  },
});

// =================================================================================================
// Extension and public API
//
// Boundaries a host or an extension author meets, outside the editing commands.
bugCluster('Extension and public API');

// B255 [P3]. Custom delimiters: surrogate pairs and emphasis's rule of three
//
// Location: `src/parser/inlines.ts` (`handleDelimiters`, `processEmphasis:369`).
//
// An astral delimiter counts UTF-16 units: `💥x💥` gives spark `[0,4)`, a child starting on a low
// surrogate, and a stray low surrogate after. And `oddMatch`, a rule of CommonMark's emphasis,
// applies to every delimiter: with `+` matching one character, `a+x+b` is a node and `a+x++b` all
// text.
//
// P3: no shipped flavor has either.
openBug('B255', 'P3', 'Custom delimiters: surrogate pairs and emphasis\'s rule of three', {
  'an astral delimiter keeps its surrogates together': () => {
    const delimiter = { char: '💥', match: () => ({ use: 1, type: 'spark' }) };
    const flavor = defineFlavor('spark', [{ name: 'spark', delimiters: [delimiter], inlines: [{ name: 'spark', triggers: '💥', parse: (parser) => parser.handleDelimiters(delimiter) }] }]);
    // spark [0,4), its child text [1,3), then text [4,5)
    assert.deepEqual(firstBlockInlines('💥x💥', flavor).map((node) => [node.type, node.from, node.to]), [['spark', 0, 5]]);
  },
  'a custom delimiter isn\'t held to emphasis\'s rule of three': () => {
    const delimiter = { char: '+', match: () => ({ use: 1, type: 'plus' }) };
    const flavor = defineFlavor('plus', [{ name: 'plus', delimiters: [delimiter], inlines: [{ name: 'plus', triggers: '+', parse: (parser) => parser.handleDelimiters(delimiter) }] }]);
    // a+x+b has a node; a+x++b is all text, `match` never asked
    assert.ok(firstBlockInlines('a+x++b', flavor).some((node) => node.type === 'plus'));
  },
});

// B259 [P3]. Refusal details show internal names and bad grammar
//
//   p⏎⏎┃---, outdent                → a atom has no level to leave  (a table too)
//   x⏎⏎```⏎code⏎```⏎⏎┃y, Backspace  → can't join into code_block
//
// Hosts show `detail`. `outdent.ts:30`, `backspace.ts:394`, `indent.ts:26`, `code.ts:182`. One
// helper naming kinds in words.
openBug('B259', 'P3', 'Refusal details show internal names and bad grammar', {
  'a refusal names a rule in words': () => {
    const result = executeOnText('p\n\n---', { type: 'outdent' }, { caret: 3 });
    assert.ok(result instanceof OurusRejected);
    assert.doesNotMatch(result.detail ?? '', /a atom/);
  },
  'a refusal names code in words': () => {
    const result = executeOnText('x\n\n```\ncode\n```\n\ny', { type: 'deleteContentBackward' }, { caret: 17 });
    assert.ok(result instanceof OurusRejected);
    assert.doesNotMatch(result.detail ?? '', /code_block/);
  },
});

// =================================================================================================
// Performance
//
// Quadratic where hosts call synchronously. Times are from this round's machine.
bugCluster('Performance');

// B275 [P3]. Escaping many lines is quadratic in the draft
//
// Location: `src/writer/draft.ts`, `#putEscape`; `src/text/changes.ts`, `mapPos`; `src/text/marks.ts`.
//
// After B261, reading a paste's lines is linear, and 1,600 list-looking lines take 0.3 s, but past that the
// writer's own work shows: 3,200 lines 0.7 s, 12,800 lines 7.7 s. The profile is `mapPos`, `#putEscape` and
// the marks' `check`: each escape put in remaps every mark. Put the escapes in together.
openBug('B275', 'P3', 'Escaping many lines is quadratic in the draft', {
  'plain paste of very many list-looking lines scales linearly': () => {
    const paste = (lines: number) => executeOnText('text', { type: 'pastePlain', text: Array(lines).fill('- x').join('\n') }, { caret: 4 });
    // eight times the lines: about 25 now, linear 8
    assert.ok(scalingFactor(paste, 1000, 8000) < 16, 'faster than linear');
  },
});

// B263 [P3]. The line table copies a chain per depth
//
// `MdTree.parse('>'.repeat(n) + ' a').lines`: 4, 16, 45, 197 ms at 1,000 to 8,000. `allLineBlocks`
// (`src/parser/tree.ts:360`) copies `[...f.chain, at]` on each descent. Mild; share the path.
openBug('B263', 'P3', 'The line table copies a chain per depth', {
  'the line table of a deep line scales linearly': () => {
    const lineTable = (depth: number) => MdTree.parse('>'.repeat(depth) + ' a').lines;
    // eight times the depth: quadratic gives about 64, linear 8
    assert.ok(scalingFactor(lineTable, 2000, 16000) < 24, 'faster than linear');
  },
});

// B316 [P3]. Reading a quote atom's block ids is quadratic in its paragraphs
//
// Location: `src/doc/block-ids.ts` (`ofNode`: four `posOf` per id), `src/doc/doc.ts` (`posOf` walks the
// text's lines from its start).
//
// `quotes: atom`, a quote of n paragraphs each ending in an id: 8 times the paragraphs take some 53 times
// as long. Map the ids' offsets in one pass, or index the lines' starts. Not B282.
openBug('B316', 'P3', 'Reading a quote atom\'s block ids is quadratic in its paragraphs', {
  'a quote atom\'s block ids read in linear time': () => {
    const read = (n: number) => OurusDoc.parse(Array.from({ length: n }, (_, i) => `> text ^a${i}`).join('\n>\n'), { config: { flavor: 'obsidian', quotes: 'atom' } }).blockIds();
    // eight times the paragraphs: about 53 now, linear 8
    assert.ok(scalingFactor(read, 2000, 16000) < 24, 'faster than linear');
  },
});

// =================================================================================================
// HTML conversion
//
// `MdHtmlParser` (`src/parser/html-parser.ts`), paste from a page. All P3 by definition, all
// reproduced through `MdHtmlParser.parse` then rendering. Each entry is a mechanism, each row a
// case.
bugCluster('HTML conversion');

// B264 [P3]. Delimiters at formatting edges come out literal
//
// Location: `merged`, `#joined`, `#wrap`, `#format`.
//
// | HTML | Markdown | Wrong because |
// |---|---|---|
// | `<p><b>a</b><span style="font-weight:bold">b</span></p>` (an empty span between two `<b>` too) | `**a****b**` | literal `****`: only same tag, no style merges |
// | `<p><code>a</code><span><code>b</code></span></p>` | `` `a``b` `` | code is `a``b` |
// | `<p><b>a<i>b</i></b><i>c</i></p>` | `**a*b****c*` | outer `**` literal |
// | `<p><b><span style="font-weight:normal">a</span>b</b></p>` (the reverse edge gives trailing `****`; all of it normal, `****a****`, a left bold) | `****a**b**` | an empty run wrapped |
// | `<p><b>a<span style="font-weight:normal"> b </span>c</b></p>` | `**a **b** c**` | all bold: moving blanks out inverts an off transition |
// | `<p><b>\u2003x\u2003</b></p>` | `** x **` | literal: only ASCII blanks and NBSP moved out |
// | `<p><b>a!</b>\u0301</p>` (an astral letter after it too) | `**a!**́` | literal: flanking asked of letters and numbers only |
//
// Sequences of on and off runs should be normalized before writing delimiters, by Markdown's
// flanking rules, with the plain fallback where they can't hold.
openBug('B264', 'P3', 'Delimiters at formatting edges come out literal', {
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
  'Unicode blanks at a bold\'s edges show no delimiter': () => {
    assert.doesNotMatch(convertPastedHtml('<p><b>\u2003x\u2003</b></p>').shown, /\*/);
  },
  'a combining mark after bold punctuation shows no delimiter': () => {
    assert.doesNotMatch(convertPastedHtml('<p><b>a!</b>\u0301</p>').shown, /\*/);
  },
});

// B265 [P3]. CSS declarations are matched by regexes
//
// Location: `#inline`, `FORMAT_STYLE`.
//
// | Style | Result | Should be |
// |---|---|---|
// | `<p><span style="font-weight : bold">x</span></p>`, `<p><span style="FONT-WEIGHT: BOLD">x</span></p>` | plain | bold |
// | `<p><span style="font-weight:bold!important;font-weight:normal">x</span></p>` | plain | bold |
// | `<p><span style="not-font-weight:bold">x</span></p>` | bold | plain |
// | `<div style="font-style:italic"><p><span style="font-style:inherit">x</span></p></div>` | `**x**` | italic |
// | `<p><span style="text-decoration:line-through">a<span style="text-decoration:none">b</span>c</span></p>` | `~~a~~b~~c~~` | struck throughout: decoration isn't inherited off |
//
// Parse declarations once (name, value, priority), resolve `inherit`, and treat decoration apart
// from font properties.
openBug('B265', 'P3', 'CSS declarations are matched by regexes', {
  'a blank before a property\'s colon': () => {
    assert.equal(convertPastedHtml('<p><span style="font-weight : bold">x</span></p>').markdown, '**x**');
  },
  'property names and values in any case': () => {
    assert.equal(convertPastedHtml('<p><span style="FONT-WEIGHT: BOLD">x</span></p>').markdown, '**x**');
  },
  '!important beats a later declaration': () => {
    assert.equal(convertPastedHtml('<p><span style="font-weight:bold!important;font-weight:normal">x</span></p>').markdown, '**x**');
  },
  'an unknown property isn\'t its suffix': () => {
    assert.equal(convertPastedHtml('<p><span style="not-font-weight:bold">x</span></p>').markdown, 'x');
  },
  'inherit keeps what is inherited': () => {
    assert.equal(convertPastedHtml('<div style="font-style:italic"><p><span style="font-style:inherit">x</span></p></div>').markdown, '*x*');
  },
  'text-decoration: none doesn\'t lift an ancestor\'s line': () => {
    assert.equal(convertPastedHtml('<p><span style="text-decoration:line-through">a<span style="text-decoration:none">b</span>c</span></p>').markdown, '~~abc~~');
  },
});

// B266 [P3]. Formatting on containers and links is dropped
//
// | HTML | Markdown | Lost |
// |---|---|---|
// | `<table><tr><td style="font-weight:bold">bold</td></tr></table>` (a row's or table's style too) | `\| bold \|` | bold: `#table` converts children without `styledDown` |
// | `<ul style="font-weight:bold"><li>x</li></ul>` | `- x` | bold: `#list` reads the unstyled node |
// | `<p><a style="font-weight:bold" href="u">x</a></p>` | `[x](u)` | bold: the link branch skips it |
// | `<b><p>a</p><p>b</p></b>` | `a⏎⏎b` | bold: `styledDown` handles styles, not tags |
// | `<a href="u"><p>a</p><p>b</p></a>` | `a⏎⏎b` | the link: a block wrapper strips it |
openBug('B266', 'P3', 'Formatting on containers and links is dropped', {
  'a table cell\'s bold': () => {
    assert.equal(convertPastedHtml('<table><tr><td style="font-weight:bold">bold</td></tr></table>').markdown, '| **bold** |\n| --- |');
  },
  'a list\'s bold': () => {
    assert.equal(convertPastedHtml('<ul style="font-weight:bold"><li>x</li></ul>').markdown, '- **x**');
  },
  'a link\'s own bold': () => {
    assert.match(convertPastedHtml('<p><a style="font-weight:bold" href="u">x</a></p>').rendered, /<strong>/);
  },
  'a bold tag around blocks': () => {
    assert.equal(convertPastedHtml('<b><p>a</p><p>b</p></b>').markdown, '**a**\n\n**b**');
  },
  'a link around blocks': () => {
    assert.equal(convertPastedHtml('<a href="u"><p>a</p><p>b</p></a>').markdown, '[a](u)\n\n[b](u)');
  },
});

// B267 [P3]. Lists: a nested restart, loose tasks, a rule in an item
//
// | HTML | Markdown | Wrong because |
// |---|---|---|
// | `<ul><li>x<ol><li>a</li></ol><ol><li>b</li></ol></li></ul>` | `- x⏎  1. a⏎⏎  1. b` | one loose list: `writeAll`'s alternation skips item blocks |
// | `<ul><li><input type="checkbox"><p>task</p></li></ul>` | `- [ ]⏎⏎  task` | a `[ ]` paragraph, no task; the shape GFM renders |
// | `<ul><li><hr></li><li>next</li></ul>` | `- ---⏎- next` | one rule: the item is gone (B209's collision) |
openBug('B267', 'P3', 'Lists: a nested restart, loose tasks, a rule in an item', {
  'adjacent nested lists stay two': () => {
    assert.equal(convertPastedHtml('<ul><li>x<ol><li>a</li></ol><ol><li>b</li></ol></li></ul>').rendered.match(/<ol/g)?.length, 2);
  },
  'a loose task keeps its text with its checkbox': () => {
    assert.equal(convertPastedHtml('<ul><li><input type="checkbox"><p>task</p></li></ul>').markdown, '- [ ] task');
  },
  'a rule in an item keeps the item': () => {
    assert.equal(convertPastedHtml('<ul><li><hr></li><li>next</li></ul>').rendered.match(/<li/g)?.length, 2);
  },
});

// B268 [P3]. Attributes: entities, spaces and depth change the link
//
// | HTML | Markdown | Wrong because |
// |---|---|---|
// | `<p><a href="u" title="&amp;copy;">x</a></p>` | `"&copy;"` | title `©`: `titleOf` lacks the escape `destination` has; image titles too |
// | `<p><a href="x&#32;&#32;y">x</a></p>` | `<x y>` | `x%20y`: `#inlineText` collapses blanks in the destination |
// | `'<p><a href="a' + '('.repeat(33) + 'b' + ')'.repeat(33) + '">link</a></p>'` | bare | past the reader's 32 levels: shown as text; use `<…>` |
openBug('B268', 'P3', 'Attributes: entities, spaces and depth change the link', {
  'a title\'s entity decodes once': () => {
    assert.match(convertPastedHtml('<p><a href="u" title="&amp;copy;">x</a></p>').rendered, /title="&amp;copy;"/);
  },
  'a destination\'s spaces all stay': () => {
    assert.match(convertPastedHtml('<p><a href="x&#32;&#32;y">x</a></p>').rendered, /href="x%20%20y"/);
  },
  'deeply nested parentheses stay a link': () => {
    assert.match(convertPastedHtml('<p><a href="a' + '('.repeat(33) + 'b' + ')'.repeat(33) + '">link</a></p>').rendered, /<a href/);
  },
});

// B269 [P3]. Tables: spans and nesting
//
// | HTML | Markdown | Wrong because |
// |---|---|---|
// | `<table><tr><td>a<table><tr><td>b</td><td>c</td></tr></table>d</td></tr></table>` | `\| a bc d \|` | `b` and `c` run together: `tr`, `td`, `th` aren't in the spacing test |
// | `<table><tr><td rowspan="0">a</td><td>b</td></tr><tr><td>c</td></tr></table>` | `\| c \|  \|` | `0` is the row group's rest: `parseInt(...) \|\| 1` |
// | `<table><thead><tr><th rowspan="2">A</th><th>B</th></tr></thead><tbody><tr><td>C</td><td>D</td></tr></tbody></table>` | a third column | a span stops at its row group; rows are flattened first |
openBug('B269', 'P3', 'Tables: spans and nesting', {
  'a nested table\'s cells stay apart': () => {
    assert.match(convertPastedHtml('<table><tr><td>a<table><tr><td>b</td><td>c</td></tr></table>d</td></tr></table>').markdown, /b c/);
  },
  'rowspan 0 spans the row group': () => {
    assert.match(convertPastedHtml('<table><tr><td rowspan="0">a</td><td>b</td></tr><tr><td>c</td></tr></table>').markdown, /\|  \| c \|/);
  },
  'a rowspan stops at its row group': () => {
    assert.equal(convertPastedHtml('<table><thead><tr><th rowspan="2">A</th><th>B</th></tr></thead><tbody><tr><td>C</td><td>D</td></tr></tbody></table>').markdown.split('\n')[0], '| A | B |');
  },
});

// B270 [P3]. `nodePlainText` differs from what a browser shows
//
// Used for an HTML-only clipboard pasted into code (`MdHtmlParser.plainText`).
//
// | HTML | Result | Should be |
// |---|---|---|
// | `<p>a <span> b</span> c</p>` | `a  b c` | `a b c`: collapsed per text node |
// | `<pre><code>⏎abc⏎⏎</code></pre>` | `abc⏎` | a leading line kept: only the one after `<pre>` is ignored |
// | `<table><tr><td><p>a</p></td><td><p>b</p></td></tr></table>` | `a⏎⏎b` | `a→b`: a paragraph's end flushes the line |
openBug('B270', 'P3', '`nodePlainText` differs from what a browser shows', {
  'plainText collapses blanks across inline elements': () => {
    assert.equal(MdHtmlParser.plainText('<p>a <span> b</span> c</p>'), 'a b c');
  },
  'plainText keeps a leading blank line of code': () => {
    assert.equal(MdHtmlParser.plainText('<pre><code>\nabc\n\n</code></pre>'), '\nabc\n');
  },
  'plainText keeps columns when cells hold paragraphs': () => {
    assert.equal(MdHtmlParser.plainText('<table><tr><td><p>a</p></td><td><p>b</p></td></tr></table>'), 'a\tb');
  },
});

// B271 [P3]. Hidden content pasted; a whitespace link dropped
//
// | HTML | Markdown | Should be |
// |---|---|---|
// | `<p>a<span hidden>secret</span>b</p><p>c</p>` | `asecretb⏎⏎c` | `ab⏎⏎c`: it wins over an accurate `text/plain` too |
// | `<p>a<a href="u"> </a>b</p>` | `ab` | `a b`: the empty-link filter takes the whitespace |
openBug('B271', 'P3', 'Hidden content pasted; a whitespace link dropped', {
  'hidden content isn\'t pasted': () => {
    assert.equal(convertPastedHtml('<p>a<span hidden>secret</span>b</p><p>c</p>').markdown, 'ab\n\nc');
  },
  'a whitespace link keeps its words apart': () => {
    assert.equal(convertPastedHtml('<p>a<a href="u"> </a>b</p>').markdown, 'a b');
  },
});

// B323 [P3]. Converted text with a line of dashes and pipes becomes a table
//
// Location: `src/parser/html-parser.ts` (`write`, a paragraph's lines; `escapeStart` escapes a `|`
// starting a line only).
//
// GFM reads a table without outer pipes: `<p>a | b<br>--- | ---</p>` → `a | b⏎--- | ---`, a table headed
// `a`, `b`, the dashes gone from what is shown. Escape a line that would be a delimiter row. No table in
// the HTML: not B269 nor B322.
openBug('B323', 'P3', 'Converted text with a line of dashes and pipes becomes a table', {
  'text that reads as a delimiter row stays text': () => {
    const converted = convertPastedHtml('<p>a | b<br>--- | ---</p>');
    // a table
    assert.doesNotMatch(converted.rendered, /<table>/);
    assert.match(converted.shown, /--- \| ---/);
  },
});

// B332 [P3]. Text like `<3@example.com>` converts as an email autolink
//
// Location: `src/parser/html-parser.ts` (`escapeText`: a `<` escaped before a letter or `/!?` only).
//
// An email autolink's local part may start with a digit: `<p>&lt;3@example.com&gt;</p>` converts to
// `<3@example.com>`, a link, its brackets gone from what is shown. Escape a `<` that would open one.
openBug('B332', 'P3', 'Text like `<3@example.com>` converts as an email autolink', {
  'text in angle brackets keeps them': () => {
    // <p><a href="mailto:3@example.com">3@example.com</a></p>
    assert.match(convertPastedHtml('<p>&lt;3@example.com&gt;</p>').rendered, /&lt;.*&gt;/);
  },
});

// B335 [P3]. HTML's plain text trims what is no blank: a `pre` of spaces, the tabs of empty edge cells
//
// Location: `src/parser/html-parser.ts` (`plainText`, `end`: `line.trim()`; a cell's tab only after text).
//
// `<pre>   </pre>` gives `''`, its spaces dropped as an empty paragraph's; a row whose first or last cell is
// empty loses that cell's tab (`<td></td><td>b</td>` gives `b`, not `→b`), the columns shifted. Keep a
// `pre`'s text and the cells' tabs out of the trimming.
openBug('B335', 'P3', 'HTML\'s plain text trims what is no blank: a `pre` of spaces, the tabs of empty edge cells', {
  'a pre of spaces keeps them': () => {
    // ''
    assert.equal(MdHtmlParser.plainText('<pre>   </pre>'), '   ');
  },
  'empty edge cells keep their tabs': () => {
    // b, a
    assert.equal(MdHtmlParser.plainText('<table><tr><td></td><td>b</td></tr></table>'), '\tb');
    assert.equal(MdHtmlParser.plainText('<table><tr><td>a</td><td></td></tr></table>'), 'a\t');
  },
});

// B336 [P3]. `white-space: pre` is ignored, spaces collapsed
//
// Location: `src/parser/html-parser.ts` (`#inline`: text and inline code always `collapse`d).
//
// `<code style="white-space:pre">a  b</code>` converts to `` `a b` ``. Read the whitespace mode, and keep
// spaces where Markdown can hold them (code). Not B265.
openBug('B336', 'P3', '`white-space: pre` is ignored, spaces collapsed', {
  'code styled white-space: pre keeps its spaces': () => {
    // <p><code>a b</code></p>
    assert.equal(convertPastedHtml('<p><code style="white-space:pre">a  b</code></p>').rendered, '<p><code>a  b</code></p>\n');
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

// B338 [P3]. A footnote reference converted doesn't count as formatting
//
// Location: `src/parser/html-parser.ts` (`#inline`, the anchor's footnote branch returns before it sets
// `#formatted`).
//
// `<p><a data-footnote-ref href="#fn-a">1</a></p>` converts to `[^a]`, `formatted: false`: a paste
// preferring the plain text then takes `1`, the reference lost.
openBug('B338', 'P3', 'A footnote reference converted doesn\'t count as formatting', {
  'a footnote reference is formatting': () => {
    const converted = MdHtmlParser.parse('<p><a data-footnote-ref href="#fn-a">1</a></p>');
    assert.equal(converted.markdown, '[^a]');
    // false
    assert.equal(converted.formatted, true);
  },
});

// B339 [P3]. Word's paragraph lists number on past a jump
//
// Location: `src/parser/html-parser.ts` (`#wordList`: only the first paragraph's number kept).
//
// Paragraphs numbered `1.` then `5.` (`mso-list`): `1. x⏎2. x`. An `<ol>` with `<li value>` keeps the
// restart; Word's own path doesn't. Split the run where the number jumps. Not B267.
openBug('B339', 'P3', 'Word\'s paragraph lists number on past a jump', {
  'a jump in a Word list starts another': () => {
    const p = (n: number) => `<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">${n}.</span>x</p>`;
    // <ol>⏎<li>x</li>⏎<li>x</li>⏎</ol>
    assert.match(convertPastedHtml(p(1) + p(5)).rendered, /<ol start="5">/);
  },
});

// B340 [P3]. Word's list levels nest past the stack, flat HTML though it is
//
// Location: `src/parser/html-parser.ts` (`#wordList`, `write`: recursive over the lists it builds).
//
// The depth limit measures the HTML's nesting; Word's `levelN` builds a deeper tree out of sibling
// paragraphs: 3,000 levels throw `Maximum call stack size exceeded`. Bound the levels or write them
// iteratively. Not B317, B319.
openBug('B340', 'P3', 'Word\'s list levels nest past the stack, flat HTML though it is', {
  'a Word list 3,000 levels deep converts': () => {
    const html = Array.from({ length: 3000 }, (_, i) => `<p style="mso-list:l0 level${i + 1} lfo1"><span style="mso-list:Ignore">•</span>x</p>`).join('');
    // RangeError: Maximum call stack size exceeded
    assert.doesNotThrow(() => MdHtmlParser.parse(html));
  },
});

// The id the next bug takes: raise it with each new bug. Ids aren't reused, a fixed bug's included, so
// this stays where it is when bugs go. The run fails on a bug at or past it, or on an id taken twice.
const NEXT_BUG_ID = 345;

reportBugs(NEXT_BUG_ID);
