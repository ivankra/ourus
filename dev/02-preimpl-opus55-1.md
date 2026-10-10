# ourus: design recommendations (Opus 5.5)

- **Cross-checked with** the other reviews, GPT-6 and opus5, over two rounds. GPT-6 also
  audited this review's parser experiment.
- **Temporary artifacts:** `ourus/opus55/` held the full design doc, prior-art notes, the
  cross-review and the runnable experiment. It has since been deleted, so the key evidence
  is restated here.
- **Paths:** repo paths below are relative to the parseq root, at the submodule revisions
  of 2026-10-11.

## 1. Recommendations in brief

1. **Layers.** Exact text → lossless syntax tree → outline view, derived by a configurable
   policy. Session state (selection, folds/zoom by node ID, provisional empty places) lives
   outside the immutable document.
2. **Seven guarantees, tested separately** (§3).
3. **Own parser:** a faithful port of commonmark.js's block algorithm, behind an internal
   interface. commonmark.js is the CI oracle; inlines come in a second phase (§5).
4. **Parse liberally, write conservatively.** Commands emit only markdown that every
   configured reader agrees on, checked in the regions they write (§7).
5. **Outline defaults:**
   - paragraphs are leaves;
   - a list item owns its first paragraph, and every other block inside it is a child;
   - headings form sections, with a declared promote/demote contract;
   - quotes, callouts, tables and code start as atoms (§6).
6. **One relocation primitive, `place()`,** over a single admissibility grammar. A planner
   with a feel profile maps intents onto primitives. A `preflight` query uses the same
   planner as execution (§7).
7. **Self-verifying commands.** Every command re-parses its output and checks its
   postconditions, and returns `encoding-failed` rather than writing a broken document.
8. **Three host contracts:** cooperative commands; protected editing via `judge`;
   post-commit reconciliation via `repair` (§8).
9. **Incremental updates are a staged core deliverable,** with the full reparse kept as the
   oracle (§9).
10. **Rich results:** exact changes, inverse changes, per-segment moves, identity events,
    selection, history hints. The host owns undo; identity survives undo through history
    metadata, not text matching (§10).
11. **Config axes:** dialect profile, outline policy, editing policy, plus the reader set
    for the writer. One engine, not per-flavor trees (§11).
12. **Pure core:** zero dependencies, no DOM or Node APIs; editor adapters separate (§13).
13. **Tests are the specification:** fixtures, laws, oracles, and a reference
    implementation the optimised one is checked against (§14).

## 2. Key evidence

### Parser agreement

A block-structure experiment, re-run after GPT-6's audit found and this review fixed a
generator bug. The original LCG multiplied in floating point and cycled: about 600 distinct
documents per 30k draws.

Method: each parser's output was reduced to a skeleton of block types and nesting
(`doc(quote(ul(item(p))))`), ignoring content, tightness and ranges. Versions:
commonmark.js 0.31.2, markdown-it 14.3.2 (`commonmark` preset), micromark 4.0.3 via
mdast-util-from-markdown 2.1.0, `@lezer/markdown` 1.8.0.

| corpus | result |
| --- | --- |
| 652 CommonMark 0.31.2 spec examples, skeleton vs commonmark.js | markdown-it 652, micromark 652, lezer 649 (misses: #10 `#\tFoo`, #171 `<textarea>` HTML block, #280 `-` / blank / `  foo`) |
| 30k random container-heavy docs (tabs, odd indents, nested `>`, odd markers) × seeds 7, 11, 13; ~29.8k distinct per seed | all four agree **77.6–77.8%**; commonmark.js never the lone dissenter; micromark alone 8.9–9.2%, lezer 8.0–8.2%, markdown-it 3.0–3.3%; no majority ~2% |
| 30k "tidy" docs (no quotes, one space after markers, 2-space nesting) | 99.5% agree |
| the same, tab nesting | 100% agree |

Some of the shortest disagreements are shapes outliners create constantly:

- `> q` / `  -`: an empty bullet after a quote. lezer folds it into the quote's paragraph;
  the others read a new list item.
- An empty `-` right after indented code: micromark reads a paragraph.

The `tidy` residue comes from nesting that misses the parent's content column.

Conclusions:

- **Agreeing on the spec examples is not agreeing on documents.** Compliance means
  differential agreement with commonmark.js, adjudicated against the spec text.
- **Parsers only diverge in the corners,** so a disciplined writer avoids them.
- **Caveat:** the documents are synthetic, and skeletons are necessary for outline
  agreement, not sufficient. The comparison should grow to content boundaries, tightness,
  list start and delimiter, reference definitions and ranges.

### Parse cost

Median times, real Markdown (true-outliner and outl docs, 3.1 MiB), Node 26, arm64:

| parser | 100 KiB (~1.5k lines) | 1 MiB (~15.5k lines) |
| --- | --- | --- |
| commonmark.js, block phase | 0.43 ms | 3.9 ms |
| commonmark.js, full | 0.80 ms | 9.9 ms |
| markdown-it | 1.1 ms | 14 ms |
| micromark → mdast | 19 ms | 229 ms |
| lezer, full | 4.3 ms | 44 ms |
| lezer, incremental after a 1-char edit | 0.05 ms | 0.74 ms |

- The rows do different work, and none of it is end-to-end ourus latency.
- A full block reparse is cheap at note sizes, so it's a safe fallback and oracle.
- Block reuse buys about two orders of magnitude for large files.

### Lessons from the repos

- **true-outliner** (`repos/obsidian-true-outliner`) is the closest prior art: a pure core
  of ~12k lines, a CM6 shell of ~21k lines, and ~80 research notes.
  - **Its regex parser was the biggest cost.** It declares itself "not strict
    CommonMark": no lazy continuation, quotes as runs of `>` lines. A long tail of research
    notes chases the divergence.
  - **Implied hierarchy hurt.** Its "list after a paragraph is its child" rule (Q34,
    `docs/research/list-paragraph-mapping.md`) made one arrangement impossible to write,
    and re-parented bystanders on reorder: 24 of 1,239 move-ups. Turning the rule off
    removed the defect and raised acceptance.
  - **Many lessons transfer directly:**
    - per-operation "what does a node become here" rules disagreed until unified
      (`node-kind-grammar.md`);
    - empty places need a lifecycle (`src/plugin/provisional-cleanup.ts`, 819 lines);
    - moving a subtree destroys CM6 fold state;
    - Obsidian desktop undo bypasses `transactionFilter`;
    - Smart Lists renumbering joins plugin transactions;
    - a changed bullet character starts a new list;
    - a full reparse per keystroke was fine at ~1,600 lines.
  - **Obsidian Live Preview's structure** comes from a CodeMirror 5-style stream mode, not
    CommonMark:
    - a bare `-` is not an item;
    - the content column includes the whole whitespace run after the marker;
    - setext needs `--`;
    - indentation is quantised to a tab or four spaces.
  - **Its CRLF fixture** (`tests/corpus/08-crlf-and-ends.md`) contains no CR bytes.
  - **Reusable assets:** the drawn-case notation, label-tracked property generators
    (`arbLabeledDoc`), measured reader-divergence tables, the rejection vocabulary.
- **tine** (ADR 0005) repeated the parser story. An "optimistic scanner" grew ~15 bugs and
  is being rebuilt as a cmark-style two-phase parser. Its lesson: **"a parity gate
  validates output, not architecture."** Its parser also overflowed its stack at ~1,300
  nested quotes.
- **outl** reconciles IDs after external edits by tiered matching: hash plus parent, then
  position, then similarity, then new. A guard forbids mass deletion (`docs/markdown-format.md`).
- **Logseq OG** is structure-first: a DataScript DB with whole-page rewrites. It offers
  outdenting as a setting. With direct outdenting (the default), the outdented node adopts
  its following siblings; with logical outdenting, they stay put.
- **SilverBullet** runs outline ops on a lossless lezer-derived tree. Its markdown
  conversion strips `\r`. Its text editor keeps CRLF and BOM, by setting CM6
  `EditorState.lineSeparator` to `"\n"` and keeping the BOM as metadata.
- **lezer-markdown** reuses whole old blocks when the container-context hash at a block
  start matches (`NodeProp.contextHash`).
- **Panache's reparser** stages its tiers: a single token, then a block region, then a
  window. Guards decline to a full parse, and debug builds assert every success equals a
  full parse.
- **Zettlr and Joplin** both run CM6 with `@lezer/markdown`. Joplin plugins add CM6
  extensions through content scripts. Zettlr has no plugin API.

## 3. Guarantees

| # | guarantee | contract |
| --- | --- | --- |
| G1 | Exact source | `serialize(parse(s)) === s` for every JS string |
| G2 | Parser correctness | block structure agrees with commonmark.js under the `commonmark` profile; other profiles pinned to versioned corpora |
| G3 | Text sync | `apply(changes, before) === after` and `apply(inverse, after) === before` |
| G4 | Command correctness | the re-parsed result meets declared postconditions; no bystander moved or absorbed |
| G5 | Local preservation | bytes outside the declared footprint are unchanged |
| G6 | Reader agreement (scoped) | in written regions and their seams, all configured readers agree on named properties; pre-existing disagreements are preserved |
| G7 | Identity continuity | known commands follow the identity contract; external edits get guarded best-effort reconciliation |

**Text fidelity:**

- Positions are UTF-16 offsets. CR/LF/CRLF (including mixed), a BOM character, NUL, tabs
  and lone surrogates are all preserved.
- Byte identity belongs to the host: `TextDecoder` strips BOMs and replaces invalid UTF-8.
- CM6 (default), textarea and Monaco normalise line endings; GTK keeps them. Obsidian is
  unmeasured.
- Generate line-ending fixtures in code.
- The 1-to-1 text↔model claim holds for syntax and outline, not for IDs, selection, folds
  or provisional places.

## 4. Layers

- **Syntax tree,** in the style of rust-analyzer's rowan:
  - Every byte is a token: container prefixes per line, markers, blank lines, line endings.
  - Nodes store widths, not offsets, so edits rebuild only the path to the root and
    untouched subtrees (and their IDs) are shared.
  - Container prefixes, and tabs split across containers, are the hard part.
  - Keep list attributes (marker, delimiter, start, tightness) and reference definitions.
- **Per-node content coordinates:** prefix-stripped and possibly non-contiguous, with
  `toBuffer`/`fromBuffer` mappings.
- **Contextual parse queries:** "how do these lines parse given this container stack and
  open leaf?". A bare block-start predicate can't decide lazy continuation or placement.
- **Outline view:** a projection by policy (§6).
- **Session:** selection (text or node sets, with an escalation ladder), folds and zoom by
  ID, provisional places, render facts.

## 5. Parser

- **Port commonmark.js's block mechanisms:** container continuation, lazy continuation,
  block-start precedence, tab columns, finalisation, plus its reference-definition parsing
  (`blocks.js` calls the inline parser for it).
- **Iterative and depth-safe,** tested on pathological inputs.
- **Engine-neutral design:** the parser emits ourus's tree through a builder, so another
  engine can sit behind it.
- **The oracle panel:** commonmark.js plus markdown-it, micromark and lezer. A port can
  inherit its source's bugs, so adjudicate against the spec.
- **Name M0 a *block* milestone.** Full conformance needs inline parsing, reference
  resolution and spec-HTML agreement, which come in phase two.
- **Why not lezer or micromark as the base:** each diverges on 8–9% of container-heavy
  documents, neither tree is built for editing, and micromark is slow.

## 6. Outline defaults (all configurable)

- **List items** nest by containment.
  - Lists aren't nodes; their items are.
  - An item owns its marker line plus continuation lines up to the first blank line; every
    other block inside it is a child (true-outliner's rule).
- **Headings** are sections derived from levels, scoped to their container. Tab and
  Shift+Tab change the level by one, and the subtree shifts with it.
  - Level changes re-derive section membership: in `# A` / `## B` / `## C`, outdenting B
    adopts C. `promote` / `demote` declare that; a strict policy rejects instead;
    `setHeadingLevel` re-derives explicitly.
  - Outdenting content out of a section, and reordering across the heading/content
    divide, are typed rejections.
- **Paragraphs** are leaves. Opt-in: Tab on a paragraph under a paragraph turns both into
  list items.
- **Atoms:** quotes, callouts, tables, code and HTML stay containers in the syntax, but are
  atomic in the outline at first.
- **Gaps:** one canonical ownership rule for addressing, plus a per-command carry rule that
  is part of that command's postconditions.

## 7. Operations

- **Grammar:** admissibility (kind under parent kind), per-dialect encoding, and one
  conversion function for forced cases. Where that function has more than one legitimate
  answer, it becomes a setting or a per-action choice.
- **`place(roots, {parent, index})`** underlies indent, outdent, move, move-to, drop and
  parsed paste.
  - Equal *resolved* inputs encode identically.
  - Paste and drop may resolve to different destinations.
  - Placement uses destination context and the preservation policy, not only a kind
    table.
  - **Other primitives:** split, join, convert, set heading level, cycle task, unwrap,
    duplicate, delete.
- **Planner and feel:** intents (`insertParagraph`, `formatIndent`, …) map to primitives
  via a feel profile:
  - direct vs logical outdent;
  - Backspace at an item's start: merge or outdent;
  - Enter on an empty item;
  - whether a heading move carries its section.
- **Preflight** reuses the planner. **Group commands** plan once against one snapshot.
- **Pipeline:**
  1. Normalise operands; non-contiguous groups are refused.
  2. Decide the intent and its identity events.
  3. Encode, copying neighbour style.
  4. Re-parse and check postconditions: parents, kinds, depths, no bystanders, vacated and
     destination seams, tightness, marker-width changes (`9.` → `10.`).
  5. Return the result, or `encoding-failed`.
- **"Minimal"** means a documented locality policy, not a shortest edit script.
- **Writer search:**
  1. Keep the existing style.
  2. Otherwise try candidates, each tested against the reader set: a blank line at seams
     (but a blank line can loosen a list); one space after markers, never a bare `-`;
     nesting at the content column, or tabs / 4 spaces for Obsidian; the neighbouring
     bullet character; no 4+ column indentation outside an item.
  3. Otherwise reject.
- **Code payloads** are never reflowed.
- **Constructs the dialect doesn't model** are refused, never guessed.

## 8. Raw edits and host contracts

- **Classify first:** selection-only, within-node, IME composition, programmatic and
  remote edits pass. Only boundary-crossing user edits are judged.
- **`judge`** returns pass, rewrite or veto. Its request carries the base revision, the
  changes, the selection before (and the proposed one after), the intent if known, the
  origin and the composition phase. Unknown intent follows an explicit policy.
- **Reconciliation** (the model follows committed text) **is not correction** (a separate
  edit with its own history entry).
- **Typing:**
  - A kind change keeps the node's ID.
  - Decide a policy for unclosed fences: re-project honestly, or hold the previous outline
    while the caret is inside. Commands always plan against the real parse.
- **Paste:** `insertMarkdown` parses the payload in context, re-indents it, re-encodes it
  and `place()`s it.

## 9. Incremental updates

Staged, in Panache's style. Every tier may decline to a full parse:

1. **Token tier:** an inert edit inside one text token (no newline, outside the marker
   zone).
2. **Region tier:** re-parse a run of blocks to blank-line boundaries; neighbours must
   re-parse identically; no fence-pairing change and no reference definition nearby.
3. **Convergence tier** (later): lezer-style block reuse by container-context hash, with
   back-up for setext and lazy lines.
4. **Full parse:** the fallback, and the debug oracle every tier is asserted against.

**Schedule:**

- The update interface (`applyChanges` returning changed ranges) comes in M1.
- Typing and one common command must take a fast tier, with measured end-to-end latency,
  before the core counts as done.
- What forces a full parse is invalidation, not the event's name.

## 10. Results, IDs, undo, positions

```ts
type Result =
  | { status: 'applied'; base: Revision; doc: Doc; changes: Change[]; inverse: Change[];
      moves: Move[]; identity: IdentityEvent[]; selection?: Selection; history: HistoryHint }
  | { status: 'unchanged'; doc: Doc }
  | { status: 'rejected'; reason: RejectionReason; at?: NodeId; doc: Doc };
// Change: {from, to, insert} in old-document UTF-16 offsets, sorted, non-overlapping.
// Move: per-node list of segments; re-indentation shifts each line differently.
// IdentityEvent: created | removed(fallback) | split(at) | merged(at) | duplicated | reset.
```

- **Stale plans** (wrong `base`) are rejected.
- **IDs** are opaque and per document, and never written to the file by default.
  - Typed edits keep IDs through block reuse.
  - External edits use outl-style guarded matching.
  - Identical siblings are an information limit.
  - Authored IDs (`^id`, `id::`) are separate.
- **Undo:** host history is the authority.
  - Store identity events in it (in CM6, via `invertedEffects`).
  - A text-keyed cache is only a speed-up.
  - Identity-only ops are surfaced, never dropped.
- **Anchors:**
  - source anchors are an offset plus side;
  - content anchors are a node plus content offset, and survive re-indentation.
- **Positions:** UTF-16 offsets, with converters to code points (GTK) and UTF-8 bytes
  (Neovim). Grapheme-aware deletion. Insert vs normal mode is a caret-placement option.
- **Intents** reuse W3C `inputType` names (`insertParagraph`, `deleteContentBackward`,
  `formatIndent`, …) as vocabulary only. For example, the browser's
  `deleteSoftLineBackward` means a display line.

## 11. Configuration and flavors

| axis | examples |
| --- | --- |
| `DialectProfile` | `commonmark-0.31.2`, `gfm`, `obsidian` (reading view), `obsidian-live-preview`, `logseq`, later `pandoc` |
| `OutlinePolicy` | headings as sections or leaves; paragraph outlining; atoms vs containers; multi-paragraph items |
| `EditingPolicy` | indent unit; bullet; renumbering (`always / preserve / ifSequential`); blank lines; outdent style; Enter/Backspace behavior; task cycle; caret mode |
| `readers` | e.g. `[commonmark, obsidian, obsidian-live-preview]` |

- **One engine** with extensions; flavors overlap heavily.
- **Obsidian:** parse as CommonMark/reading view by default, with Live Preview opt-in.
  Written regions must satisfy both.
- **Pandoc** needs its own oracle.
- **Org and neorg** are sibling parsers behind the same syntax and outline interfaces.
- **Presets** are named bundles of documented values; grammar correctness is never
  configurable.

## 12. Editor fit

| editor | intercept | line endings | integration |
| --- | --- | --- | --- |
| CM6 | `transactionFilter` (bypassable via `filter: false`, `setState`) | normalised unless `lineSeparator` is set | `StateField` snapshot, annotated own transactions, `invertedEffects`, fold provider |
| Obsidian Live Preview | CM6; desktop undo bypasses filters | unmeasured | `registerEditorExtension`; Smart Lists; `foldService`; e2e against both readers |
| Joplin | CM6 | CM6 | content-script plugin; host CodeMirror packages |
| Zettlr | CM6 | CM6 | source modification; pandoc profile |
| Monaco | no pre-change veto | one per model | commands + `repair` |
| textarea | `beforeinput`, not always cancellable | LF | demo #1, with an `input` reconciliation path |
| GTK / GJS | `insert-text` / `delete-range` | kept | demo #2: bundled ESM, user actions, marks |

The Monaco, textarea and GTK rows are general knowledge, not verified here.

## 13. Packaging

- **Core:** zero dependencies, no DOM, Node or `Buffer`; ES2022 ESM plus a single-file
  bundle for GJS.
- **Layout:** one package under `ourus/` with subpath exports to start with.
- **`ourus-cm6`:** `@codemirror/*` as peer dependencies.
- **License:** permissive, decided early. true-outliner is MPL-2.0 (ideas are free, copied
  files stay MPL); tine's lsdoc is AGPL.
- **Names:** `ourus` and `outex` are free on npm; `markout` is taken.

## 14. Tests are the specification

1. **Language-neutral fixtures:** `.md` inputs with `.json` expected results; drawn
   before / command / after cases with carets; reader-divergence cases; generated
   line-ending, BOM and NUL inputs.
2. **Laws (fast-check):**
   - G1–G7;
   - inverses (indent then outdent);
   - group equals sequence;
   - no-ops change no bytes;
   - preflight equals execute.

   Generate label-tracked documents and command or edit *sequences*, with shrinking.
3. **Oracles:** commonmark.js; the reader panel; the reference implementation (full
   reparse, simple planner) against the optimised one.
4. **False-confidence guards:**
   - round-trip-only and closure-only suites can pass on broken parsers;
   - test internal invariants, not just parity;
   - test the generators themselves (distinct counts, several seeds);
   - name every unexplained mismatch as a regression fixture;
   - list intentional deviations explicitly.
5. **Pathological inputs** with linear-time asserts, and latency budgets in CI.
6. **Host conformance:** one corpus run through every adapter.

## 15. Phasing

| milestone | contents |
| --- | --- |
| M0 | laws, fixture format, lossless syntax tree, commonmark.js block port (incl. reference definitions), contextual parse queries, pathological cases. Exit: 652/652 skeletons, 0 unexplained `wild` divergence, G1 fuzz |
| M1 | outline view, IDs, spans and content coordinates, converters, the update interface (by full reparse), `diff` |
| M2 | grammar and `place()`, all commands, encoders, postconditions, conservative writer, `preflight`, token and region tiers with the oracle |
| M3 | `judge` / `repair`, `insertMarkdown`, session, render facts, textarea demo |
| M4 | plain CM6 extension, then the Obsidian plugin (early spike on Live Preview, Smart Lists, undo, folds) |
| M5 | convergence tier, GFM, Obsidian profiles, Logseq, GTK demo |
| later | inline parsing and full conformance, a lezer-tree adapter, pandoc, org |

## 16. Decisions needed

1. **Paragraph attachment:** off by default? This review and GPT-6 say off; opus5 says on.
2. **Multi-paragraph list items:** extra blocks as children (recommended), or one node?
3. **Obsidian:** parse as reading view by default, with Live Preview opt-in
   (recommended)?
4. **Quotes and callouts:** atoms first (recommended)?
5. **Heading promotion:** org-style adoption of following siblings, or strict rejection?
6. **Unclosed fences while typing:** re-project honestly, or hold the previous outline?
7. **CRLF in CM6:** keep `\r` in the buffer (SilverBullet's recipe), or restore it on
   save?
8. **License:** MIT or Apache-2.0?
