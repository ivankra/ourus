# Pre-implementation reviews (2026-10-11)

The reviews of the first brief ([`01-brief.md`](01-brief.md)), written before the first prototype was built. Each is reproduced verbatim under its own section, named after its former file; its headings are two levels deeper than in the original, and links to the other notes point to their new places.

## preimpl-gpt6

### Ourus — retained GPT-6 review

Summary of the review of the brief, the other agents' research, local reference repositories, and parser experiments.

**Build around exact source, a faithful syntax tree, and a configurable outline projection.** Ourus's distinctive work is the structural transaction engine that keeps those representations consistent through editing. Keep the core pure, immutable, editor-independent, and low in runtime dependencies.

#### Model and guarantees

An immutable document snapshot holds source, syntax, outline projection, and identity information. A separate optional session holds selections, folds, zoom, and provisional empty editing positions. Host adapters own event translation, rendering, and native history integration.

Specify these guarantees independently:

| Guarantee | Contract |
| --- | --- |
| Exact source | `serialize(parse(source)) === source`, including unfinished input, mixed line endings, tabs, trailing spaces, and final-newline presence. |
| Parser correctness | Interpretation conforms to a named, versioned syntax profile. |
| Command correctness | Accepted operations satisfy independently specified structural postconditions. |
| Local preservation | Source outside the declared edit footprint remains unchanged. |
| Synchronization | Returned forward edits produce the new source; inverse edits restore the old source. |
| Identity continuity | Known commands preserve identity according to explicit rules; arbitrary external edits use documented reconciliation. |

Define the TypeScript boundary in **UTF-16 code units**. Byte fidelity additionally needs encoding/BOM handling at the host boundary. Text alone cannot determine historical IDs, selections, or provisional nodes, so a literal one-to-one correspondence between source and complete snapshot state is impossible.

Keep syntax containment separate from outline parentage. Headings can own sections in the outline, scoped to their syntax container. Recommend paragraphs as leaves by default: automatically adopting a following list can make an unrelated node change parent after a move. Retain that behavior only as an explicit optional projection.

Preserve list containers and their attributes in syntax. Multi-block list items need an explicit body/child policy derived from parsed blocks, not simply the first blank line. Expose content segments and mappings between source and prefix-stripped content; list and quote prefixes make that content non-contiguous.

#### Parser and incremental updates

Recommend an **owned CommonMark implementation behind an internal parser interface**, starting from commonmark.js's reference block algorithm. Preserve source spelling while handling container continuation, lazy continuation, precedence, and virtual tab columns correctly. Porting the block file alone is insufficient: reference-definition recognition and decoding helpers also matter. A block-only milestone is useful, but full CommonMark compliance requires inline parsing and reference resolution too. The [specification](https://spec.commonmark.org/0.31.2/) remains authoritative; agreement with a port's source implementation is not independent proof.

Keep commonmark.js as the primary differential reference and other implementations in the panel. Production dependency minimization does not require minimizing development test dependencies.

Implement a fresh parse as the baseline and fallback, then deliver conservative reuse for ordinary typing and a common structural operation before declaring the initial core complete. Safe reuse depends on parser-state convergence, not a fixed surrounding window. Fence edits can affect the document tail, reference definitions distant inlines, and heading levels section boundaries. The outline and position indexes need incremental maintenance too.

Relative-width persistent nodes help sharing, but do not automatically provide incremental parsing, logarithmic updates, or logical identity. Replacing a child in a very wide parent can still be linear. [Panache's reparser](https://github.com/jolars/panache/blob/main/crates/panache-parser/src/parser/reparse.rs) is useful precedent for guarded local reparsing with larger-window and full-parse fallbacks.

#### Transactions and structural operations

Operations should return a new snapshot, exact forward/inverse text edits, position mappings, identity events, optional selection, and a typed applied/unchanged/rejected status. Forward edits use starting-source coordinates; inverse edits use resulting-source coordinates. Reject stale plans. Keep snapshot diff as a secondary utility.

Use one contextual placement planner beneath move, indent, outdent, drop, and structured paste. Share admissibility and encoding rules while retaining different move/copy/paste identity policies. Parent/child kinds alone are insufficient: neighboring blocks, list grouping, content columns, and syntax interruption affect placement.

Plan the intended change, encode it, then validate the parsed result **against that intent**. Check both departure and destination boundaries, unaffected parentage/order, block kinds, list tightness, and literal code content. Reparsing successfully does not prove the requested operation happened. Group gestures should plan once against one starting snapshot.

Separate heading level editing from structural reparenting. In `# A`, `## B`, `## C`, promoting B to `# B` makes C part of B's section. A level-edit command may permit that; a command promising unchanged bystander parentage cannot.

“Minimal edits” should mean a documented locality policy, not a globally shortest diff. Reindentation and boundary repairs legitimately enlarge the footprint. Reject unrepresentable transformations or apply an explicitly allowed conversion.

#### Raw editing, identity, and compatibility

Provide unrestricted source editing plus an optional pure **pass/rewrite/veto gate**. Give it revision, changes, pre-edit selection, origin, intent when known, and composition state. Distinguish reconciliation of committed text from corrective edits. An insertion inside one node can still change distant structure; IME and remote changes require explicit policy.

Use opaque runtime IDs with events for split, join, duplicate, deletion, and reconciliation resets. Keep authored IDs separate. Known moves retain identity; arbitrary edits involving identical content can be ambiguous. A text-keyed snapshot cache cannot restore undo identity correctly: different identity histories can produce identical source. Carry identity/session effects through host history.

Moved-range offsets alone cannot follow content through multiline reindentation; compose movement with content mappings. Provisional empty positions need creation and cleanup provenance in the session or returned effects.

Reader compatibility must be **contextual and versioned**. Preserve existing disagreements while checking newly affected regions and boundaries. Blank lines and tab/four-space indentation are candidate encodings, not universal safety rules. Blank lines can change list tightness. Obsidian reading view and Live Preview need application fixtures; a standalone core cannot guarantee agreement with every host version.

Keep dialect, outline, and editing policies separate. Formal GFM and product-specific extensions are distinct; footnotes, for example, are outside the published [GFM specification](https://github.github.com/gfm/). Org/Neorg would need parser-and-encoder backends, not merely Markdown options.

#### Consumer fit and delivery

Build the requested **textarea and GTK Markdown outliner demos before production-editor integration**, plus a minimal CM6 harness. Exercise loading, typing, split/join, structural moves, provisional positions, selection/folds, and undo. These should test actual outliner interaction, not just display a parsed tree.

CM6 adapters must reconcile against the transaction that actually commits, account for filter bypass/state replacement, and use host history. Keep CM dependencies outside the core. GTK needs coordinate conversion and user-action grouping; textarea needs composition handling and post-input reconciliation when interception is unavailable. Follow with an early Obsidian spike before stabilizing the public API.

Expose pure structural rendering facts: ownership, depth, line roles, source columns, and foldable ranges. Visibility comes from session state; pixels, wrapping, bidi, CSS, and widgets belong to the host. Correct facts do not eliminate real rendering tests.

Suggested order: observable laws and fixtures → owned parser baseline → outline and a small operation set → gate and standalone demos → measured incremental paths → Obsidian integration → more commands, dialects, and adapters. Complete block and inline conformance before claiming a fully compliant parser.

#### Evidence worth retaining

The independent audit reran 210,000 generated draws and compared block skeletons on all 652 CommonMark examples. The original experiment's 30,000-draw wild run contained only **581 distinct strings** because floating-point LCG multiplication entered a short cycle. With `Math.imul` and a corrected random interval:

| Wild run | Draws | Distinct inputs | Four-parser agreement |
| --- | --- | --- | --- |
| Original, seed 7 | 30,000 | 581 | 79.22% |
| Corrected, seed 7 | 30,000 | 29,832 | 77.79% |
| Corrected, seed 11 | 30,000 | 29,812 | 77.67% |

These are synthetic, draw-weighted agreement rates, not defect rates. Selected disagreements also reproduced through direct HTML rendering. Markdown-it and mdast/micromark matched commonmark.js on all 652 example skeletons; Lezer matched 649. Skeleton comparison omits content, source spans, tightness, and other semantics, and does not establish full spec conformance. The sibling generator subsequently adopted the arithmetic fix and distinct-input reporting. The preserved audit rerun reproduced its results exactly.

Reference lessons: True Outliner exposes the costs of incomplete grammar, implicit paragraph/list parentage, missing command provenance, and host interference. Outl provides useful identity matching but does not preserve all unknown nested source. SilverBullet demonstrates source-range outline operations, although its Markdown tree conversion strips CR characters. Rowan informs persistent storage; Panache informs guarded incremental parsing. No editor application was launched, and published application/benchmark timings were not independently reproduced.

The lasting test strategy is: normative examples, independent parser comparisons, exact-source cases, independently specified command postconditions, random edit/command sequences with shrinking, fresh-versus-incremental comparison, identity/history tests, and shared adapter behavior fixtures. Audit generators and fixture contents too. Measure complete update latency and retained memory rather than extrapolating from parser-only timings.

## preimpl-opus55-1

### ourus: design recommendations (Opus 5.5)

- **Cross-checked with** the other reviews, GPT-6 and opus5, over two rounds. GPT-6 also
  audited this review's parser experiment.
- **Temporary artifacts:** `ourus/opus55/` held the full design doc, prior-art notes, the
  cross-review and the runnable experiment. It has since been deleted, so the key evidence
  is restated here.
- **Paths:** repo paths below are relative to the parseq root, at the submodule revisions
  of 2026-10-11.

#### 1. Recommendations in brief

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

#### 2. Key evidence

##### Parser agreement

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

##### Parse cost

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

##### Lessons from the repos

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

#### 3. Guarantees

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

#### 4. Layers

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

#### 5. Parser

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

#### 6. Outline defaults (all configurable)

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

#### 7. Operations

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

#### 8. Raw edits and host contracts

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

#### 9. Incremental updates

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

#### 10. Results, IDs, undo, positions

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

#### 11. Configuration and flavors

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

#### 12. Editor fit

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

#### 13. Packaging

- **Core:** zero dependencies, no DOM, Node or `Buffer`; ES2022 ESM plus a single-file
  bundle for GJS.
- **Layout:** one package under `ourus/` with subpath exports to start with.
- **`ourus-cm6`:** `@codemirror/*` as peer dependencies.
- **License:** permissive, decided early. true-outliner is MPL-2.0 (ideas are free, copied
  files stay MPL); tine's lsdoc is AGPL.
- **Names:** `ourus` and `outex` are free on npm; `markout` is taken.

#### 14. Tests are the specification

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

#### 15. Phasing

| milestone | contents |
| --- | --- |
| M0 | laws, fixture format, lossless syntax tree, commonmark.js block port (incl. reference definitions), contextual parse queries, pathological cases. Exit: 652/652 skeletons, 0 unexplained `wild` divergence, G1 fuzz |
| M1 | outline view, IDs, spans and content coordinates, converters, the update interface (by full reparse), `diff` |
| M2 | grammar and `place()`, all commands, encoders, postconditions, conservative writer, `preflight`, token and region tiers with the oracle |
| M3 | `judge` / `repair`, `insertMarkdown`, session, render facts, textarea demo |
| M4 | plain CM6 extension, then the Obsidian plugin (early spike on Live Preview, Smart Lists, undo, folds) |
| M5 | convergence tier, GFM, Obsidian profiles, Logseq, GTK demo |
| later | inline parsing and full conformance, a lezer-tree adapter, pandoc, org |

#### 16. Decisions needed

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

## preimpl-opus55-2

### ourus: review of the initial design draft (opus55b)

Review of the brief (then `ourus.md`, now [`01-brief.md`](01-brief.md)), grounded in the
reference repos under `repos/` plus a few external ones (Twig, panache, @lezer/markdown,
commonmark-spec, micromark, all cloned only to read). I did **not** read `design/proposal1.md` /
`proposal2.md` (deleted in the working tree); this review is independent of them.

A fuller TypeScript sketch of the proposed API lived in `opus55b/api-sketch.ts`, since
deleted; the condensed version below is the one kept.

---

#### TL;DR

The draft's direction is right: text-first, lossless, a real parser, structure-safe commands,
CM6/Obsidian-first. Most of my suggestions make implicit things explicit, or import lessons
that True Outliner paid for over three months and ~60 research notes.

1. **Name the core thesis and enforce it mechanically.** Text is the only truth. The trees
   are a pure function of the text. Every write, structural or raw, is a text change set.
   Structural commands are *planners*: they produce a change set, the result is re-parsed,
   and the re-parsed outline is **checked against the planned outline**. A mismatch means the
   command is rejected. This check runs at runtime, always, not only in tests. It turns "one
   bug away from a broken document" into "one bug away from a refused command". This is the
   concrete form of "marry text-first and structure-first".
2. **Make the per-line container prefix a first-class model.** Markdown containers (list
   items, quotes) put their markers *on every line*, interleaved with the content of nested
   blocks. Structural ops are mostly prefix rewriting: strip the old prefix, write the new one,
   keep the content bytes. panache's lossless CST hit exactly this and is now consolidating
   all "which container frame is this line in" logic behind one typed resolver. Start there.
3. **Parse block structure exactly. Make inline parsing lazy and per-leaf.** Outline structure
   depends only on CommonMark's block phase (link reference definitions are the lone
   cross-phase wrinkle). Doing this keeps the parser small, incremental re-parsing simple, and
   the dependency question moot.
4. **A dialect is reader rules plus writer rules plus measured quirks.** Obsidian has no spec,
   and *three* parsers inside Obsidian disagree with each other and with CommonMark: Live
   Preview's HyperMD-derived stream mode, reading mode, and the metadata cache. For targets
   like this, "compliant" has to mean "matches measured behavior on a corpus". Ops should
   write **seams that every targeted reader reads the same way** (the "agreement set").
5. **Give nodes stable identity across edits and ops.** True Outliner re-parses after every op
   and loses node ids. It works around that with line anchors and spans, which leaked
   complexity everywhere. ourus should carry IDs through change mapping. It should use an
   outl-style matcher only for wholesale replacement (paste over a region, external file
   change), and emit explicit id events (kept, created, removed, split, joined, moved).
6. **Keep the op algebra small and the intent vocabulary separate.** A few tree primitives
   (`move`, `insert`, `remove`, `split`, `join`, `setKind`, `editText`). User intents use W3C
   Input Events names where they exist (`insertParagraph`, `formatIndent`,
   `deleteContentBackward`, `insertFromPaste`, …). A **behavior profile** (logseq, workflowy,
   …) maps intents to primitives. Most "feel" knobs belong in the profile.
7. **Commands return three outcomes: `applied | rejected(reason) | notApplicable`.** Keymaps
   need "not mine, let the editor do its default" to be distinct from "mine, refused, swallow
   the key and show feedback". SilverBullet's `result | "blocked" | null` already does this.
8. **Raw edits: `guard()` before they apply and `reconcile()` after.** Some editors can veto
   or rewrite an edit before it lands (CM6 transaction filters, `beforeinput`, GtkTextBuffer
   signals). Others only notify afterwards (Monaco, Obsidian's `editor-change`). Both paths
   need first-class APIs. IME composition, remote/programmatic changes and undo/redo always
   pass through untouched. Prefer intercepting *intents* over inferring intent from diffs.
   True Outliner's classifier needed ever more side facts (cursor before, "every selection was
   empty", "deletes exactly one newline") to tell apart transactions that were byte-identical.
9. **Put editor-neutral interaction logic in core, not only the document model.** That means
   caret/content-space policy, selection escalation to node selection, operand resolution,
   drop targets, placeholder positions, fold/zoom ranges, and redo cursors. In True Outliner
   the plugin layer is **2× the core** (22.7k vs 10.7k lines), and much of it is exactly this
   logic. Every adapter would otherwise re-implement it.
10. **Use one editor-neutral, drawn conformance corpus**: before (with caret/selection
    markers), intent, config, after. Replay it against core and every adapter (textarea,
    CM6, Obsidian). Both Obsidian outliner plugins converged on this format independently.
    Keep it as plain data (markdown/JSON) so a future Rust core (`README.md` wants one) can
    share it.

---

#### 1. What the prior art says (condensed)

**obsidian-true-outliner** (closest prior art; 222 commits since 2026-07-12; core 10.7k,
plugin 22.7k, tests 29.6k lines; OpenSpec specs total 15.5k lines)

- *Model that worked:* nodes own their original lines **verbatim**. Encoding is pure
  concatenation, so the byte-identical round trip holds by construction. Blank lines belong
  to the preceding node as a `trailingGap`. Every line belongs to exactly one span. Ops
  return `OpResult = ok | rejected(reason)` with ~20 typed reasons (`at-h1-bound`,
  `not-expressible-under-target`, `cannot-reorder-across-heading-boundary`,
  `non-contiguous-subtrees`, …). That taxonomy is worth reusing.
- *Parser was the weak spot:* it is line-based and regex-driven, "Obsidian's pragmatic block
  markdown, not strict CommonMark". It has no lazy continuation, and indented code is read as
  a paragraph. A long tail of research notes and fixes traces back to it: `block-start-margin`,
  `lazy-continuation-at-seams`, `list-marker-content-column`, `marker-without-trailing-space`,
  `seams-across-a-re-indent`, `created-seam-detection`. They also decided (Q13) that if this
  bites, the upgrade path is "micromark tokenizer as a boundary oracle". This **validates the
  draft's "proper parser, not regexes" requirement.**
- *Reader disagreement, measured:* in Obsidian 1.13.7, reading mode continues a list item
  lazily while Live Preview draws the same line flush with no list classes. LP requires
  whitespace after a bullet marker; CommonMark and reading mode don't. LP's "smart lists"
  measures nesting in tabs and 4-space groups. Their rule became "where readers disagree,
  follow the surface being edited". The structural fix is to write seams with a blank line so
  every reader agrees.
- *Seams:* any op that places two blocks next to each other must check how the boundary will
  **re-parse**. A paragraph written flush under a quote becomes part of the quote, a rule
  re-indented past column 3 turns into a paragraph or a list item, and a changed bullet
  character starts a new list (one list becomes three). This is the single most recurring bug
  class.
- *Identity:* `finalize` re-parses, so **node ids do not survive an op**. Results therefore
  carry an `anchor` (line/ch "structural fact, not the caret") and a `span` (lines of the
  moved subtrees). Callers locate nodes by lines. The comments note this coupling made a
  deletion convention "unchangeable".
- *Anchor ≠ caret:* "where the subject landed" is a fact from the op. "Where the caret goes"
  is a separate, single policy (`caret-placement-policy`, written after seven call sites
  disagreed). Indent/outdent derive their caret by **mapping** through a *minimal* change set,
  so CM's history redo reproduces it for free. Ops that *choose* a caret must record it for
  redo.
- *Minimal change sets* are a semantic requirement, not an optimisation. A relocation must be
  sent as a relocation (delete here, insert there), not as a rewrite of everything in between.
  Otherwise position mapping (cursors, folds, other plugins' decorations, collaborative
  editing) breaks.
- *Provisional positions* (their name for empty placeholder nodes) are blank lines the
  outline pretends aren't there until typed into. They cost an 819-line `provisional-cleanup.ts`
  plus several research notes. This is a hard problem; budget for it (§3.9).
- *Composition cost:* each op step re-encoded and re-parsed (1.24 ms/step on 2000 lines), so
  group ops compose raw "surgeries" and finalize once. Full block re-parse per keystroke was
  well within budget at ~1600 lines. Incremental parsing is not urgent for typical notes.
- *Process lesson:* the first decorations attempt failed after three redesigns with all tests
  green. The tests asserted DOM attributes against synthetic fixtures and were updated to
  match the implementation. The project then went "measure in the real app first" (drawn
  cases replayed in real Obsidian, desktop and mobile).

**obsidian-outliner** (vslinko, mature): parses only the list region into a mutable `Root`,
prints it back, then trims the common line prefix and suffix to produce one `replaceRange`.
Folding is patched around the edit. It is the "bolted on" baseline the draft criticises. Its
`.spec.md` tests (markdown fences with `|` caret, `keydown:`, `assertState`) are a good
portable format.

**SilverBullet**: outline ops are pure `(text, lezerTree, cursor) → {text, cursor} | "blocked"
| null`. They are simple and editor-neutral, which is where the tri-state result comes from.
Lists, headings (sections), paragraphs and table rows are all movable.

**Logseq OG**: six outliner ops (`save-block`, `insert-blocks`, `delete-blocks`,
`move-blocks`, `move-blocks-up-down`, `indent-outdent-blocks`). They refuse non-consecutive
selections, and indenting under a collapsed sibling expands it. The file is regenerated from
the DB (debounced, deferred for >500-block pages): this is the lossy part. The outdent default
is "direct outdenting": the block's right siblings become its children, so it keeps its visual
place. `logical-outdenting?` instead moves the block after its parent. Concrete evidence for
the draft's "feel knobs".

**outl** (Rust, markdown is the source of truth, tree CRDT): IDs live in a sidecar. After an
external edit, a 3-level matcher (exact hash + parent, positional fallback, Levenshtein > 80%
within ±2 DFS positions with global best-first assignment) re-identifies blocks. A guard
refuses to orphan half a page from a truncated file. This is the model for ourus's "wholesale
replace" identity path, and for persistent IDs if a consumer wants them.

**Tine** (Logseq-compatible): data-safety ADR. It skips byte-identical rewrites, and loads
read-only anything it cannot round-trip byte-for-byte (its `.org` support). It also separates
block identity from rendered-instance identity (one block shown in several places), which
matters for future embeds/transclusion.

**Twig** (Zig, CommonMark 0.31.2 652/652, GFM, djot): its one primitive is
`replaceAtSpan` followed by a reparse, and the edit is committed only if the reparse succeeds.
It states the rule I'd adopt verbatim: *"a gesture may only mint bytes the editor's own
reparse reads back the same way."* It also exposes a "can this gesture be authored in this
dialect/config?" query **before** the call (to grey out UI).

**panache** (Rust, rowan lossless CST for Pandoc/CommonMark): container markers that land
inside a content node become `LINE_PREFIX` tokens. Its "frame pinning" tests document that
several helpers answered "which container is this line in?" differently. Incremental reparse
is a *declinable hint*: a tier ladder (token → region → section window → suffix), each tier
returning None when unsure. The correctness argument is "byte-identical to a full parse or
decline".

**@lezer/markdown**: incremental, CommonMark plus extension hooks, deliberately doesn't
validate link references. It is the parser behind CM6's lang-markdown, so it is what
**Zettlr, Joplin and SilverBullet** see. Joplin plugins inject CM6 extensions via
`ContentScriptType.CodeMirrorPlugin`. Joplin also has a ProseMirror editor, which ourus would
not target.

---

#### 2. The core thesis and invariants (make these the spec's first page)

> Text is the source of truth. The syntax tree and the outline are pure functions of
> `(text, dialect, mapping config)`. Every mutation is a text change set. Structural commands
> plan a change set against the outline, and the result is accepted only if re-parsing it
> yields the planned outline.

Proposed invariants (each one a property test, several also runtime checks):

| # | Invariant | Checked |
|---|---|---|
| I1 | **Total parse.** Every JS string parses; no exceptions, no "invalid" documents. | property |
| I2 | **Round trip.** `serialize(parse(s)) === s` for every string, including lone surrogates, `\r`, `\r\n`, U+0000, a BOM, tabs. Ideally structural (spans index the source), not a reprint. | property |
| I3 | **Incremental = full.** `apply(doc, change).tree ≅ parse(applied text).tree` | property, debug runtime |
| I4 | **Closure.** A command's re-parsed outline equals its planned outline, otherwise rejected. | **runtime, always** |
| I5 | **Locality.** Bytes outside the command's declared affected ranges are unchanged; the change set is minimal and relocation-preserving. | property, debug runtime |
| I6 | **Reader agreement.** Seams a command writes parse the same in every reader of the configured agreement set. | property (corpus × readers) |
| I7 | **Identity continuity.** A node not touched by a change keeps its id; touched nodes get explicit id events. | property |
| I8 | **Selection validity.** Resulting selections are inside the document and land on caret-addressable positions (with documented exceptions). | property |

I4 is the key upgrade over everything surveyed. Closure was a *test* property in True
Outliner. Here it is a *runtime gate*, which is cheap because the reparse is needed anyway.

What "robust" means also needs saying explicitly. **Raw** text edits can produce any text,
and the tree simply follows (I1). The guarantee is that **commands** never produce structure
they didn't intend, and that the model never desyncs from the text. Whether raw edits that
cross node boundaries get vetoed or rewritten is a *policy* (§3.8), not a model property.

---

#### 3. Architecture suggestions

```
 adapters (separate packages)   cm6 · obsidian · textarea/contenteditable · gtk(gjs) · tui
 ─────────────────────────────────────────────────────────────────────────────────────────
 session (optional)     snapshot + selection + folds/zoom (by id) + placeholders
 intents → ops          behavior profile (workflowy | logseq | …) maps intents to ops
 guard / reconcile      verdicts for raw edits (pre-apply) / reconciliation (post-apply)
 operations             primitives + planners → change set → reparse → verify (I4)
 queries / positions    nodeAt, content-space caret, operand resolution, drop targets
 outline projection     mapping config → outline nodes with stable ids, chrome spans
 block CST (dialect)    container stack + per-line prefixes + leaf blocks, exact spans
 text                   string + line index; change sets (CM-compatible); position mapping
```

##### 3.1 The line-prefix model

Each source line decomposes as
`[prefix piece for each open container …] [content] [line ending]`. The pieces are
indentation, `> ` (with optional space), a list marker plus its whitespace run, or the
continuation indent for an item. Lazy continuation lines have *fewer* pieces than their
nesting depth.

- Store this decomposition (or make it cheaply derivable) for every line. It answers the
  questions that recur everywhere: content column, "is the caret in chrome?", what a
  re-indent rewrites, and what a move strips and re-adds.
- Ops then become: move line ranges, rewrite their prefix pieces, and never touch content
  bytes. The exceptions are explicit and few: marker changes, renumbering, heading `#` runs,
  and kind conversions.
- **Tabs are the trap.** CommonMark tab stops are absolute (width 4), and a tab can be split
  between a container prefix and the content (`>\tfoo`). Re-prefixing a block by a column
  delta that isn't a multiple of 4 changes how its leading tabs expand. That can silently
  change structure (an indented code block inside an item, for example). Rule: when re-
  prefixing, leading whitespace in the *content* region is re-expressed for the new column
  (spaces, or tabs per the document's unit) only when the delta requires it. Obsidian
  defaults to tab indentation, and True Outliner hit this ("indent wrote a tab on the first
  line and spaces below it").
- Indent unit: adopt the destination's existing siblings' prefix verbatim, else the parent's
  prefix plus an inferred unit, else config. This is what True Outliner converged on after
  synthesised spaces double-outdented tab lists.

##### 3.2 Exact block parsing, lazy inline parsing

- The block phase is a deterministic line-by-line state machine (open container stack, open
  leaf, fence/HTML-block state). That is all the outline needs. Inline parsing (emphasis,
  links, wikilinks, tags) can be per-leaf, on demand, and cached by leaf identity.
- The outliner needs a few inline facts early: the GFM task marker `[ ]`, a trailing block id
  ` ^id` (Obsidian), Logseq `key:: value` property lines, and maybe tags and refs. Treat these
  as **block-level decorations recognised by the dialect** (cheap, anchored to the line start
  or end), not as a full inline parse.
- Link reference definitions are the only block/inline coupling (a paragraph made only of
  definitions vanishes). Handle them in the block phase; validating references is inline
  business.
- Dependencies: none at runtime. Reference parsers (commonmark.js, cmark-gfm, micromark,
  markdown-it) are dev-only **oracles** for differential checks. Keep that light, as you said.

##### 3.3 Dialects

- **One CommonMark block engine with rule hooks** (like lezer's `BlockParser` and
  markdown-it's rule chain), plus **presets**: `commonmark`, `gfm`, `obsidian`, `logseq`,
  later `pandoc`. Org/neorg need a different (headline-based) engine but should emit the
  *same CST node interface* (kinds, spans, prefix model), so the outline projection and ops
  are shared.
- A dialect has three parts:
  1. **reader**: block rules plus quirks such as lazy continuation on/off per container,
     marker-needs-whitespace, nesting measured in columns vs tab groups, and extra blocks like
     callouts, `$$` math, `%%` comments (Obsidian; multi-line, so a block construct),
     `^id` lines, Logseq properties, and pandoc `:::` divs.
  2. **writer**: how to encode "a list item at depth d under X", "a heading of level n",
     "a paragraph after a list", the separators to use, bullet character and delimiter
     adoption, the renumbering policy.
  3. **capabilities**: a query that answers "can this op/kind be expressed here?" *before*
     the call (Twig's `format_supports`), so UIs can grey things out.
- **Obsidian is several readers.** `obsidian` should be a family: `obsidian-lp` (the editing
  surface; HyperMD-derived stream mode, line classes like `HyperMD-list-line`,
  `HyperMD-quote-lazy`), `obsidian-reading`, and possibly the `metadataCache` list parser
  (`ListItemCache` parent links, which other plugins and Dataview rely on). Encode the
  measured quirks as data with goldens. True Outliner's research notes already hold tables to
  start from (`lazy-continuation-at-seams`, `marker-without-trailing-space`,
  `obsidian-list-renumbering`, `lone-block-id`).
- **Agreement set (I6).** Configure which readers must agree on what ourus writes, e.g.
  `{commonmark, obsidian-lp, obsidian-reading}`. The writer then picks seams that are
  unambiguous for all of them. Usually that means a blank line, at the cost of tight vs loose
  lists (see §4). Parsing *existing* text uses one primary reader, which for the Obsidian
  plugin is the surface being edited.

##### 3.4 Outline projection and identity

- The outline is a projection of the CST under a **mapping config** (headings as sections,
  list item owns its first block, paragraph captures a following list, quotes as atoms or
  containers, …). Each outline node exposes: `id`, `kind`, its CST node(s), a **head range**
  (its own text), a **body range** (head plus descendants), and **chrome ranges** (markers,
  prefixes, gap lines).
- **IDs are session-scoped opaque values,** carried forward by mapping through changes:
  - Edits *within* a node keep the id.
  - In a re-parsed window, match new nodes to old ones by (kind, mapped start, parent). Fall
    back to a content-similarity matcher (outl's level 1/1.5/2) only for wholesale
    replacement.
  - Commands know exactly what they did, so they *declare* id events (`split(a → a, b)`,
    `join(a, b → a)`, `move(a)`, `create`, `remove`) instead of inferring them.
- **Persistent IDs are a dialect feature, not a core one:** Obsidian `^block-id`, Logseq
  `id:: uuid`, or an outl-style sidecar. Core surfaces `node.anchor` when the text carries one,
  and the "an attached block id travels with its node" rule from True Outliner belongs in the
  writer.
- **Undo resurrection:** CM's undo re-applies text, so a deleted-then-restored node gets a new
  id and loses its fold state. Keep a short tombstone list (id, content hash, mapped
  position) and let the matcher revive ids when an inverse change restores the same bytes.
  Alternatively, record id events as CM `invertedEffects` in the adapter.

##### 3.5 Operations: small algebra, planners, verification

- **Primitives** (tree level, which is what verification compares):
  `insert(fragment, parent, index)`, `remove(nodes)`, `move(nodes, parent, index)`,
  `split(node, offset)`, `join(a, b)`, `setKind(node, kind, attrs)`,
  `editText(node, range, text)`. Indent, outdent, moveUp, moveDown, duplicate, convert and
  toggle-task are all compositions of these.
- **Planner pipeline:** resolve operand → compute target tree → encode via the dialect writer
  (prefix rewrite, seams, renumbering) → minimal change set → apply → reparse → verify (I4) →
  derive anchors, selection and id events. Group forms compose primitives and finalize *once*
  (True Outliner measured that per-step finalize gets expensive).
- **Result:** `applied {doc, changes, selection, ids, anchor, undoHint} | rejected {reason,
  detail} | notApplicable`. Keep a typed reason taxonomy; start from True Outliner's list.
- **Inexpressible means rejected, not hidden state.** Example: outdenting the direct child of
  a heading out of its section is inexpressible (content after a section is still inside it).
  Offer it as a profile choice: reject, or "move after the section's end".
- **Anchor vs caret:** ops return structural anchors. A single caret policy (core, shared by
  all adapters) turns anchors into selections. Indent/outdent carets should be *mapped*
  through the minimal change set, so that host undo/redo reproduces them. Carets that an op
  *chooses* are returned as `selectionAfter` for the adapter to record (CM: annotation plus
  `invertedEffects`).

##### 3.6 Intents and the behavior profile

Reuse W3C Input Events `inputType` names for intents. They match `beforeinput` directly, and
map onto CM `userEvent` strings:

| Intent (inputType) | Typical key | CM userEvent | Typical op (profile-dependent) |
|---|---|---|---|
| `insertParagraph` | Enter | `input` | split node / new sibling / exit list on empty item |
| `insertLineBreak` | Shift+Enter | `input` | line break inside the node (continuation line) |
| `formatIndent` / `formatOutdent` | Tab / Shift+Tab | — | move under previous sibling / after parent (direct vs logical outdent) |
| `deleteContentBackward` at node start | Backspace | `delete.backward` | join with previous / outdent first / convert to paragraph |
| `deleteContentForward` at node end | Delete | `delete.forward` | join with next |
| `deleteWordBackward`, `deleteSoftLineBackward`, `deleteHardLineBackward` | Alt/Cmd+Backspace | `delete.backward` | clamp at the content start |
| `insertFromPaste` / `insertFromPasteAsQuotation` | Mod+V | `input.paste` | splice the fragment at a node boundary, re-encode for the destination |
| `insertFromDrop` + `deleteByDrag` | drag | `input.drop`, `move.drop` | `move` (one op, not delete plus insert) |
| `deleteByCut` | Mod+X | `delete.cut` | remove subtrees (node selection) |
| `historyUndo` / `historyRedo` | Mod+Z | `undo` / `redo` | pass through |
| `insertCompositionText` | IME | `input.type.compose` | **never interfere** |
| `insertOrderedList` / `insertUnorderedList` / `insertHorizontalRule` | — | — | `setKind` |

There is no inputType for outliner-specific intents. Add a small namespaced set: `moveNodeUp`,
`moveNodeDown`, `moveNodeTo`, `duplicateNode`, `toggleTask`, `convertKind`, `selectNode`,
`expandSelection` (Workflowy-style ladder), `fold`, `zoomIn`. Keybindings stay in adapters,
as the draft says. The profile decides, for example, whether Enter on an empty nested item
outdents or exits the list, which outdent variant applies, and whether Backspace at the start
of an item joins or outdents.

##### 3.7 Change sets and positions

- Use **UTF-16 offsets** and CM-compatible change sets: sorted, non-overlapping
  `{from, to, insert}` in old-document coordinates, plus `mapPos(pos, assoc)`, `compose`,
  `invert`, and JSON. A CM6 adapter then passes them straight through, and textarea/Monaco
  adapters convert trivially. Don't depend on `@codemirror/state`; mirror its semantics.
- Provide `selectionBefore`/`selectionAfter` and inverse id maps as undo hints. Don't own
  history in v1; every host has one.
- Line endings: hosts may normalise (CM6 joins lines with `\n` unless the `lineSeparator`
  facet is set). Core must accept whatever string it is given, write new lines using the
  dominant ending of the surrounding text, and never assume `\n`.

##### 3.8 Raw edits: guard and reconcile

- `guard(doc, change, meta) → pass | rewrite(command) | veto(reason)` runs before the edit
  applies (CM `transactionFilter`, cancelable `beforeinput`, GtkTextBuffer
  `insert-text`/`delete-range` with stop-emission). `meta` carries the intent when known,
  plus origin flags (user, programmatic, remote, undo, composition).
- `reconcile(doc, change) → update` runs after the edit is applied (Monaco
  `onDidChangeContent`, Obsidian `editor-change`, textarea `input`). It can at most *propose*
  a corrective follow-up, which costs an extra undo step and so should be avoided by default.
- Policy presets: `permissive` (text editor; the tree just follows), `guarded` (whole-subtree
  deletes, boundary-respecting paste and merges; True Outliner's verdict model) and `strict`.
  Default-permit for anything unrecognised. True Outliner's choke-point findings say real
  traffic arrives with surprising annotations (external `Vault.process` arrives as userEvent
  `set`; IME commit arrives looking programmatic). The safe failure is pass-through.

##### 3.9 Placeholders (empty nodes)

An empty list item (`- `) and an empty heading (`#`) are representable. An empty *paragraph*
is not. Options:

- **(a) Blank-line positions derivable from text alone** (True Outliner). This is robust to
  undo and redo, but the outline must "pretend" around blank lines, and interior positions
  bisect a node in the raw parse.
- **(b) Session-held virtual node** at (parent, index, kind), with blank space in the text.
  Clean semantics, but host undo/redo and collaboration don't know about it.

My suggestion: (b) as the API concept, with (a) as its text encoding and recovery rule. The
session owns `Placeholder {id, parent, index, kind}`. Its text footprint follows True
Outliner's rule: blank-separated for a new node, adjacent for a continuation line, so the
document alone still disambiguates. Its lifecycle (materialise on first character, abandon on
caret leave or Escape, removal edits merged into the creating undo step) is specified once in
core. In any case, prefer writing a real empty list item wherever the destination is a list.

##### 3.10 Session: thin and storable

- `Snapshot` is immutable. `Session` is a convenience holder, not a framework. Everything
  should fit inside a CM6 `StateField`: `snapshot.apply(changes)` returns a new snapshot,
  fold and zoom state is keyed by node id (with position fallback), and selection lives in
  the host.
- Avoid re-implementing CM6's state/facet machinery. Hosts without a state system (textarea,
  GTK, TUI) get a small `Session` class that wraps the same pure functions.

##### 3.11 Incremental parsing

- **v0:** full block re-parse per change, with **structural sharing** (reuse old node objects
  whose source slice and context are unchanged, so ids and caches survive). True Outliner's
  numbers say this is enough for normal notes.
- **v1:** a re-parse window that declines when unsure. Restart at the nearest line where the
  container stack is empty or recorded, re-parse until the parser state (container stack,
  open leaf, fence/HTML state) converges with the old state at the mapped line, then splice.
  Unclosed fences and HTML blocks make the window run to the end of the document; that's
  fine. Same correctness argument as panache: identical to a full parse, or decline. Test it
  by random edits against a full parse (I3).
- Set budgets in the spec early, e.g. within-node keystroke < 1 ms and structural op p95 < 8 ms
  on a 10k-line note, so later trade-offs have a yardstick.

---

#### 4. Outline mapping: decisions and edge cases to settle

Recommended default in **bold**, alternatives as knobs.

- **Paragraph followed by a list** (True Outliner Q34, still open there). Default per your
  draft: **sibling** (paragraphs are leaves). Knob `paragraphCapturesFollowingList`
  (True Outliner's choice). Trade-off: with leaves, "Intro:\n- a\n- b" can't fold under its
  intro and "indent paragraph" has no target (reject, or convert to list item per profile).
  With capture, "a list item as the sibling right after a paragraph" becomes inexpressible.
  Under capture, only column-0 / section-level paragraphs capture.
- **List item head.** The **first child block, if it is a leaf, is the head; otherwise the
  head is empty.** Define these edge cases in the spec:
  - `-\n  foo`: an item starting blank. CommonMark gives it paragraph "foo". Head = "foo" or
    empty?
  - `- - a`: the first block is a list.
  - `- # h`: a heading inside an item is a leaf head, not a section.
  - ```` - ```js ````: a code fence as the head.
  - `- [ ] task`: a task marker on the head.
  - Loose items with several paragraphs: the second and later paragraphs are children.
- **Headings.** **Sections only at document level** (and optionally inside quotes or callouts
  when those are containers). Skipped levels are preserved, with tree depth by position.
  Tab/Shift+Tab shift level by one (org-style, as in True Outliner). Setext headings: keep the
  style on edits, write ATX on conversion. Content before the first heading sits at root
  level. Frontmatter is an inert preamble.
- **Quotes and callouts.** **Atoms in v1.** A `quotesAsContainers` knob comes later. Obsidian
  users do put lists inside callouts, so plan the CST to support it from the start.
- **Blank lines.** **A run of blank lines belongs to the preceding node** (trailing gap). The
  writer preserves the destination list's tightness (inserting into a loose list adds blank
  lines). The agreement set may force a blank line at a seam: say in the spec that this can
  make a tight list loose, and choose per seam kind. Knob `blankLinePolicy: preserve |
  normalizeTouched`.
- **Ordered lists.** Renumbering policy (`touchedRuns` by default, plus `never` and
  `wholeList`). Adopt the destination's bullet character and delimiter (a changed `-`/`*` or
  `.`/`)` starts a new list). Only `1.` can interrupt a paragraph. A list's start number is
  semantic in CommonMark.
- **Content column.** It comes from the marker's actual whitespace run (`-  a` has content
  column 3), and differs between readers. The writer always emits **one space** after a
  marker for new or rewritten items (True Outliner converged there).
- **Inexpressible catalogue** (each a typed rejection, or a profile alternative):
  - outdent out of a heading section;
  - reordering across the heading/content divide;
  - a heading moved under a list item (encode it as an item containing a heading, or reject);
  - under capture, a list item placed right after a paragraph;
  - a node carrying a block id when an op would split it from its id.

---

#### 5. API sketch (condensed; the fuller version was not kept)

```ts
type Pos = number                               // UTF-16 offset
interface Change { from: Pos; to: Pos; insert: string }
interface ChangeSet { changes: readonly Change[]; mapPos(p: Pos, assoc?: -1 | 1): Pos
  invert(oldText: string): ChangeSet; compose(next: ChangeSet): ChangeSet }

interface Config { dialect: Dialect; mapping: MappingConfig; writer: WriterConfig
  agreement?: readonly Dialect[] }

class Doc {                                     // immutable snapshot
  static parse(text: string, config: Config): Doc
  readonly text: string; readonly syntax: SyntaxTree; readonly outline: Outline
  apply(changes: ChangeSet, meta?: EditMeta): DocUpdate          // raw-edit path (reconcile)
  node(id: NodeId): ONode | undefined
  nodeAt(pos: Pos, side?: -1 | 1): ONode | undefined
  linePrefix(line: number): readonly PrefixPiece[]
}
interface DocUpdate { doc: Doc; changes: ChangeSet; ids: readonly IdEvent[] }

type Outcome =
  | { kind: 'applied'; update: DocUpdate; selection: Selection; anchor: Anchor
      undo: { selectionBefore: Selection; selectionAfter: Selection } }
  | { kind: 'rejected'; reason: RejectReason; detail?: string }
  | { kind: 'notApplicable' }

function run(doc: Doc, intent: Intent, sel: Selection, profile: Profile): Outcome
function guard(doc: Doc, changes: ChangeSet, meta: EditMeta, policy: Policy): Verdict
function canRun(doc: Doc, intent: Intent, sel: Selection, profile: Profile): boolean  // UI enablement

// editor-neutral interaction helpers (core, not adapters)
function snapToContent(doc: Doc, pos: Pos, dir: -1 | 1): Pos
function escalate(doc: Doc, sel: Selection): Selection | NodeSelection
function operand(doc: Doc, sel: Selection | NodeSelection): readonly NodeId[] | undefined
function dropTargets(doc: Doc, dragged: readonly NodeId[]): readonly DropTarget[]
function foldRanges(doc: Doc, folded: ReadonlySet<NodeId>): readonly Range[]
function zoomRange(doc: Doc, root: NodeId): Range
```

Naming: the draft's "command (structural) vs edit/transaction (raw)" split works. I'd call
the user-level thing an **intent**, the tree-level thing an **op**, and the text-level thing
a **change set**. "Transaction" is best avoided because it means something specific in CM6.

---

#### 6. Testing strategy (proportionate)

- **Drawn case files** are the backbone and the spec. Each one has: before (with `|` caret and
  `[ … ]` selection markers), intent, profile/config, and the expected after (or a rejection
  reason). They are editor-neutral and replayed against core, the textarea demo, CM6, and
  later Obsidian. This fits "code regenerated from docs and tests".
- **Property tests** (fast-check) for I1–I8 over generated and corpus documents: round trip,
  incremental = full, closure, locality, inverse laws (indent∘outdent where defined), id
  continuity, selection validity.
- **Parser conformance:** keep it light for now, as you said. A CommonMark block-skeleton check
  against commonmark.js on `spec.txt`, added when the parser lands. Full HTML conformance
  only once inline parsing exists.
- **Obsidian goldens:** a small measured corpus per reader (LP line classes, reading-mode DOM,
  `metadataCache` list parents), collected once from a real Obsidian and re-measured on
  upgrade. True Outliner's e2e harness and research tables are a head start.
- Avoid True Outliner's decorations trap: don't let tests assert implementation detail, and
  don't update expectations to match current output without a drawn, reviewed case.

---

#### 7. Fit with target editors

| Target | Hook before edit | Hook after edit | Notes |
|---|---|---|---|
| CM6 (vanilla) | `transactionFilter`, keymap, `domEventHandlers` (paste/drop) | `StateField.update` | Snapshot in a StateField. Change sets map 1:1. History via `invertedEffects`. Optionally expose ourus as a lezer `Parser` so highlighting and folding share one tree. |
| Obsidian LP | CM6 extension via `registerEditorExtension` | `editor-change` | Can't replace LP's parser, so chrome comes from decorations driven by the ourus tree. Smart-lists renumbering joins your transactions. Suggesters grab ↑↓⏎⇥ after `#tag`. Read True Outliner's `obsidian-runtime-gotchas`. |
| Zettlr | CM6 (source modification) | same | Already runs @lezer/markdown with its own AST helpers. |
| Joplin | CM6 content script (`CodeMirrorPlugin`) | same | Markdown editor only; the ProseMirror rich-text editor is out of scope. |
| textarea | `beforeinput` (cancelable except composition) | `input` | Most honest test of editor-neutrality. Needs the selection model in core. |
| contenteditable | `beforeinput` | `input` | Harder (DOM ↔ offsets). Optional for M1. |
| Monaco | commands/keybindings, paste via actions | `onDidChangeContent` | Mostly post-apply. Guarded policy is weaker there; say so in docs. |
| GTK (GJS) | `insert-text` / `delete-range` with stop-emission | `changed` | Good purity test: core must run without DOM or Node built-ins. |
| TUI | keymap | — | Exercises block-cursor semantics (cursor *on* a char: "end of node" differs). |

---

#### 8. Scope and milestones

The draft's first milestone (textarea plus basic CM6 demos) is right. I'd sequence it so
each step produces a usable artifact and the risky parts come first:

1. **M0 (model):** CommonMark block CST with the line-prefix model, outline projection with
   default mapping, round trip and total-parse properties, read-only outline viewer demo.
2. **M1 (ops):** change sets, ids, primitives with planner and verify, indent, outdent,
   move up/down, split, join, delete subtree, caret policy, drawn cases. Textarea demo plus
   a CM6 demo with keymap only (permissive policy).
3. **M2:** selection escalation and node selection, paste/drop/cut, guard policy in CM6,
   placeholders, GFM preset, `obsidian-lp` preset with measured goldens and the agreement
   set.
4. **M3:** incremental parsing (if budgets require it), persistent-id hooks, Obsidian plugin
   spike.

Defer: pandoc/org/neorg engines (keep only the CST interface general enough), quotes as
containers, inline CST, collaboration specifics.

---

#### 9. Naming and packaging

- npm (checked today): `ourus` and `outex` are free; `markout` is taken. Reserve the `@ourus`
  scope early. Possible layout: `@ourus/core` (zero deps), `@ourus/cm6`, `@ourus/obsidian`,
  later `@ourus/org`. Ship ESM only, with no `node:` imports in core.
- There's a tension with `README.md` (parseq wants a "Rust/Go core"). A TypeScript core is
  right for the Obsidian/CM6 targets. Keeping fixtures and drawn cases as language-neutral
  data keeps a Rust port (or a WASM core behind the same API) cheap later.

---

#### 10. Pushback and risks

- **"Fully compliant for every flavor"** isn't well-defined for Obsidian or Logseq: they have
  no spec, and the readers inside them disagree. Define compliance per reader as "matches
  measured behavior on the corpus". Make agreement-set writing (I6) the real safety net.
- **Plugin-layer gravity.** Most of True Outliner's complexity landed in the editor layer:
  decorations, caret, selection, placeholders, folding. If ourus stops at the document model,
  every adapter repeats that. Put all editor-neutral interaction logic in core (§5, last
  block).
- **Placeholders and redo cursors** are each small-looking and expensive. Specify them early
  with drawn cases.
- **Session creep.** Keep `Session` optional and thin, or it turns into a second CM6.
- **Org/pandoc scope creep.** Design the CST interface for them now, and implement them later.
- **Inferring intent from diffs** is a treadmill. Push adapters to report intents (keymap,
  `beforeinput`, paste/drop handlers), and keep diff classification as a conservative
  fallback.

---

#### 11. Open questions for you

1. Paragraph followed by a list: sibling (your draft) or capture (True Outliner)? Should it be
   a knob from day one?
2. Should the Obsidian plugin's agreement set include reading mode (forcing more blank-line
   seams), or only LP plus CommonMark?
3. Placeholder model: OK with a session-held virtual node encoded as blank lines (§3.9)?
4. Are quotes and callouts atoms for v1?
5. Is a `guarded` raw-edit policy (veto or rewrite boundary-crossing edits) in scope for M1,
   or do we ship permissive first?
6. Persistent IDs: `^block-id` on demand only (True Outliner's choice), or a sidecar option
   in core?
7. Undo: OK to leave history to hosts and supply undo hints only?

## preimpl-opus55-3

### ourus: review and pre-implementation plan (opus55c)

2026-10-11. A response to the brief [`01-brief.md`](01-brief.md), written after reading the three
existing reviews ([gpt6](#preimpl-gpt6), [opus55](#preimpl-opus55-1),
[opus55b](#preimpl-opus55-2)), their working notes (since deleted), and the prior-art repos
(true-outliner, "TO" below, in the most depth).

This is a **delta**, not a fourth full design. The reviews agree on most things, and I agree with
most of that, so §1 turns the consensus into a decision list. The rest of this document is what I
would change or add. New claims say how they were checked; Appendix A has the reproduction recipes.

#### TL;DR

1. **Treat the consensus as decided** (§1). The brief already closes several of the reviews' "open
   questions": MIT, paragraphs as leaves, and extra blocks in an item becoming its children.
2. **Make the parser a resumable line machine, and the line table the core data structure** (§2).
   CommonMark block parsing is a deterministic per-line state machine, and its only backward
   effects reach into the *currently open paragraph*. Per-line state checkpoints plus "re-run
   until the state converges" then give three things with one mechanism: incremental parsing,
   cheap command verification, and identity anchored on each node's head line. That replaces the
   reviews' three or four tiers. The same shape fits GFM, the Obsidian extensions, Pandoc and Org.
3. **Blank lines belong to seams, not to nodes** (§3). This answers the brief's "TBD: empty lines".
   Verified case: in `- a` / `  - b` / *blank* / `- c`, the blank line makes the **outer** list
   loose. TO's rule hands it to `b` as `b`'s trailing gap, so moving `b` silently changes the
   outer list.
4. **Obsidian needs no Live Preview *parse* profile** (§4). Parse CommonMark + GFM + Obsidian
   extensions, which is what reading view, the metadata cache and other plugins consume. Treat
   Live Preview (LP) as a reader the writer must not confuse, and as something the plugin overrides
   visually. A runnable LP approximation is cheap: upstream CodeMirror 5's markdown mode runs
   headlessly in Node and reproduces the list quirks TO measured by hand (bare `-`, content
   column, lazy quote).
5. **Separate runtime guarantees from test-time guarantees** (§4.3). At runtime the core verifies
   only against its own parser. Agreement with other readers is a property of the writer's
   encoding rules, proven by differential fuzzing in CI.
6. **Simplify the API** (§5):
   - preflight comes free in a pure core;
   - commands are serialisable data;
   - drop per-segment `moves` from v1;
   - the result is `applied | rejected | notApplicable`;
   - changes use CM6 `ChangeSet` semantics, unchanged.
7. **Fill five gaps that all the reviews leave open** (§6): render facts queryable by line range,
   persistent locators for folds and zoom, the inline layer earlier, multi-cursor semantics, and
   block-cursor semantics.
8. **Write the spec as a literate document in CommonMark's `spec.txt` style** (§7), using TO's
   drawn-case glyphs. This makes the brief's "code generated from docs and tests" literal.
9. **Build a walking skeleton first** (§8). Taken together, the reviews describe a large system.
   M0 should ship: parse → outline → five commands → textarea and bare CM6 demos, on full reparse.
   The CM6 demo belongs in M0, not M4.
10. Repository layout and tooling for `./ourus` are in §9; the decisions I need from you are in
    §10.

---

#### 1. Consensus, recorded as decisions

| topic | decision | source |
| --- | --- | --- |
| Name, licence, location | `ourus`, MIT, `./ourus/` | brief |
| Runtime | TypeScript, ESM, zero runtime dependencies, no DOM or Node APIs in core | brief, all reviews |
| Source of truth | Text. Syntax and outline are pure functions of (text, dialect, outline policy) | brief, all |
| Fidelity | `serialize(parse(s)) === s` for every JS string, counted in UTF-16 code units. Bytes, BOM and encoding are handled at the host boundary | all |
| Layers | text → lossless block syntax → outline projection. The session is separate and optional | brief, all |
| Outline defaults | See below | brief, all (opus5's paragraph attachment is rejected; the brief agrees) |
| Parser | Our own, porting the *mechanisms* of commonmark.js's block algorithm, behind an internal interface. commonmark.js is the primary oracle, with the other parsers in the panel | all |
| Commands | plan → encode → re-parse → check postconditions → result or typed rejection. Never write a document that fails its own postconditions | all |
| Relocation | One `place()` primitive under indent, outdent, move, drop and paste. One admissibility grammar and one conversion function | opus5, adopted by all |
| Feel | Intents (W3C `inputType` names plus an outliner namespace) → a planner with a feel profile → primitives | all |
| Results | Changes in old-document coordinates, inverse changes, identity events, selection, history hints. The host owns undo; identity survives undo through history metadata (CM6 `invertedEffects`) | all |
| Raw edits | Unrestricted edits always reconcile. An optional pure pass / rewrite / veto gate. IME, undo and remote edits always pass | all |
| Empty places | Held in the session with a lifecycle. Write a real empty item wherever one can be encoded | all |
| Config axes | Dialect, outline policy, editing policy | all |
| Testing | Language-neutral drawn cases, laws (fast-check), an oracle panel, a reference implementation, audited generators | all |

The outline defaults:

- headings are sections, scoped to their container;
- paragraphs, code blocks and tables are leaves;
- a list item is its first block, and the other blocks inside it are its children;
- quotes and callouts start as atoms;
- lists are not nodes; their items are;
- frontmatter is an inert preamble.

---

#### 2. The parser as a resumable line machine; the line table as the core

##### 2.1 Why

The reviews model the syntax layer as a rowan-style tree (rust-analyzer's lossless syntax tree
library). They make incrementality a ladder borrowed from Panache (token → region → convergence →
full parse), with lezer-style fragment reuse later. That suits a general-purpose syntax tree.
Markdown block structure has a stronger property, which makes most of that machinery unnecessary.

- **Block parsing is a deterministic function of (state at line start, line text).** Look at
  commonmark.js `incorporateLine` (`blocks.js`, around lines 770–900):
  1. For each open container, `continue()` consumes that container's slice of the line: the `>`,
     or the item's indentation.
  2. It tries the block starts.
  3. It hands the rest of the line to the innermost open block.

  Nothing looks ahead.
- **Backward effects reach only into the open paragraph:**
  - a setext underline turns the open paragraph into a heading;
  - a GFM delimiter row turns the paragraph's last line into a table header;
  - reference definitions are peeled off the paragraph's start when it closes or meets a setext
    line.

  Verified with commonmark.js 0.31.2:

  | source | result |
  | --- | --- |
  | `[a]: /u` / `===` | a paragraph whose text is `===` |
  | `[a]: /u` / `text` / `===` | an h1 heading |
  | `[a]: /u` / `---` | a thematic break |

  So **what a later line means depends on the open paragraph's content**. That is why the
  convergence rule below never stops inside an open paragraph.
- **Everything else is a derived attribute** computed when a block closes: list tightness, end
  positions, and the trimming of an indented code block's trailing blank lines.

So the lexer-style scheme used by CM5 modes, TextMate grammars, and Live Preview itself also works
for the real CommonMark grammar:

- **Checkpoints.** Store the parser state after each line: the open container stack plus the open
  leaf's state. Make it an *interned, value-comparable* object, so most lines share one object and
  equality is a pointer comparison.
- **Applying an edit:**
  1. Restart from the checkpoint at the last line before the edit where no paragraph is open.
  2. Re-run the lines.
  3. After the edited range, compare the new state at each line boundary with the old state at the
     mapped line.
  4. When they are equal and no paragraph is open, stop. By determinism, the old suffix is valid
     unchanged.
  5. Recompute the derived attributes (tightness, ends) of the containers still open at the stop
     point.
- **What that costs in practice:**
  - typing in a paragraph line re-runs that paragraph, a few lines;
  - typing inside a fence re-runs one line;
  - typing ```` ``` ```` re-runs to the end of the file, which is correct and unavoidable;
  - pasting 1,000 lines re-runs about 1,000 lines.
- **What it replaces.** This *is* the token tier, the region tier and the convergence tier, as one
  rule with one proof obligation: equal state implies an identical suffix. A differential test
  against a full parse checks that obligation.

The same shape covers the later targets, since all of these are line-based with bounded state:

- GFM tables and footnotes;
- Obsidian callouts, `%%` comments, `$$` math and frontmatter;
- Pandoc fenced divs;
- Org headlines, drawers and `#+BEGIN` blocks.

One incremental mechanism therefore serves every dialect backend. Pandoc's list rules and grid
tables still need checking before claiming this universally.

##### 2.2 The line table as the primary structure

In every target dialect, each line decomposes as:

> `[prefix pieces of the open containers] [leaf content, or nothing] [line ending]`

A line holds at most one leaf. opus55b's §3.1 "line-prefix model" already says this; I would
promote it from a derivable view to the storage itself:

```ts
interface Line {          // immutable, shared between snapshots while unchanged
  text: string;           // without its ending (or offsets into the source)
  ending: '' | '\n' | '\r\n' | '\r';
  prefix: PrefixPiece[];  // owner container; kind (indent | '>' | marker | continuation);
                          // columns; partial-tab split
  leaf: LeafRole;         // paragraph first/continuation/lazy, heading, fence open/body/close,
                          // blank, refdef, …
  state: ParseState;      // interned; the state after this line
}
```

- **Trees are views.** The block tree and the outline are views over the table. They are
  materialised lazily and memoised per subtree, keyed by the identity of the subtree's first line
  object. Unchanged subtrees are shared across snapshots without rowan's two-layer tree machinery.
- **Commands become line moves plus prefix rewrites.** TO's experience is that structural ops
  move line ranges and strip or rewrite their prefixes, and rarely touch content bytes. With a line
  table that is the native operation: the encoder writes prefix pieces and never re-serialises
  content.
- **Verification is incremental by construction:**
  1. apply the changes;
  2. re-run the machine on the changed lines until it converges;
  3. compare the affected outline region with the plan.
- **Identity is anchored on head lines.** Every outline node has exactly one head line:
  - a heading's line;
  - an item's marker line;
  - a paragraph's first line;
  - an atom's first line.

  The head line carries the node ID:
  - an unchanged line object keeps its ID for free;
  - an edited head line inherits its ID by position mapping;
  - commands declare identity events explicitly.

  This removes most of the reconciliation problem for typed edits.
- **Storage.** Start with plain arrays: copying 10,000 pointers per edit costs microseconds. Move
  to a chunked persistent tree (like CM6's `Text`) only if profiling demands it.
- **Inlines.** Inline content is parsed lazily per leaf and cached by its content string (§6.3).

##### 2.3 Porting notes

- **The hooks are already there.** commonmark.js already tracks `offset`, `column`,
  `partiallyConsumedTab`, `nextNonspace` and `indent`, and each container's `continue()` consumes
  that container's slice of the line. Those slices are the prefix pieces. Instrument the advance
  calls rather than re-deriving the pieces afterwards.
- **It is not a drop-in**, for three reasons found in the source:
  - It replaces NUL in the line (`ln.replace(/\0/g, "\uFFFD")`). Keep that for interpretation
    only.
  - A setext heading's `sourcepos` includes the reference-definition lines peeled off above it.
  - Blocks hold normalised `_string_content`.

  Port the mechanisms, and emit line records.
- **State must become a value.** Containers on the stack become interned frames: kind plus
  parameters (fence character, length and indent; HTML block type; list marker, delimiter, padding,
  "started blank"; …). The last-line-blank flags go into the frames too.
- **It is iterative by construction:** a loop over lines and an explicit stack, so there is no
  recursion depth to overflow. tine's recursive parser overflowed its stack at about 1,300 nested
  quotes.

##### 2.4 Risks

- **A field missing from the state object means wrong reuse.** Mitigations:
  - debug builds assert incremental == full on every edit (Panache's
    `assert_matches_full_parse`);
  - a random-edit differential test runs in CI;
  - the state type's equality function is generated from its fields, never written by hand.
- **Pandoc may not be bounded-state.** Pandoc's list continuation and grid tables need checking
  before calling the scheme universal. Org is fine: it is line-based.

---

#### 3. Blank lines belong to seams (the brief's "empty lines handling")

##### 3.1 Evidence

Checked with commonmark.js 0.31.2:

| source (lines) | lists |
| --- | --- |
| `- a` / `  - b` / *blank* / `- c` | outer **loose**, inner tight |
| `- a` / `  - b` / *blank* / `  - b2` / `- c` | outer tight, inner **loose** |
| `- a` / *blank* / `  more` / `- b` | loose: the item holds two blocks |
| `- a` / `- b` / *blank* / end of file | tight: a trailing blank line doesn't count |
| `para` / *blank* / `- a` and `para` / `- a` | the same tree: the blank is only a separator |

In the first row the blank line sits after `b`, but it *means* that `a` and `c` are separated.

TO's model gives every blank run to the preceding node as its `trailingGap`
(`src/model.ts`). Its encoder emits a node's own lines, then its gap, then its children
(`src/encode.ts`), so here the gap belongs to the deepest preceding node, `b`. Two problems
follow:

- moving `b` carries the blank line away and silently makes the outer list tight;
- a node moved into that seam can inherit the blank line by accident.

TO's own `gap-line-hiding.md` names the loose/tight distinction as the thing its gap model can't
show.

##### 3.2 The rule

- **Ownership.** A run of blank lines is a **seam** between the node that ends before it and the
  node that starts after it. It is owned by their lowest common parent in the outline, which is
  the level of the following node. Edge cases:
  - leading blank lines belong to the start of the parent's content;
  - trailing blank lines belong to the end of their container or document.
- **Per-command seam policy.** A command declares what happens on each side of the content it
  moves (GPT-6's "per-command carry rule", reduced to one rule):
  - **vacated:** the two seams around the moved range collapse into one, choosing the one that
    keeps the parent list's tightness;
  - **destination:** new seams copy the destination siblings' separator, which keeps tightness.
- **Tightness is a postcondition.** If a command would change a list's tightness without being
  asked to, it is rejected, unless the editing policy explicitly allows it.
- **Inside a node there are no blank lines, by definition.** Two paragraphs need a blank line
  between them; `Alpha` / `Beta` is one two-line node. That is Markdown, not a policy.
- **Display is the host's choice.** Whether to show or hide gaps belongs to the host or plugin.
  The core reports seams in its render facts (§6.1).

---

#### 4. Obsidian: parse the CommonMark family; Live Preview is a reader

##### 4.1 Position

The brief makes LP the primary target, notes that LP's parser misparses nesting, and says "we
can't build an outliner on top of shaky foundation". The reviews propose:

- **opus55:** parse as reading view by default, with an opt-in `obsidian-live-preview` *parse*
  profile;
- **opus55b:** an Obsidian family of readers, following "the surface being edited".

I would have **no LP parse profile**, for three reasons:

1. **LP's list structure isn't a tree grammar.** It comes from a CodeMirror 5 stream highlighter
   (TO: `lib/codemirror/markdown.js` in the app bundle), with indentation quantised by a separate
   view plugin. Parsing "as LP" would adopt a non-grammar as the outline: the shaky foundation the
   brief rejects.
2. **The rest of Obsidian is CommonMark-ish.** Reading view, the `metadataCache` list parents,
   block references, Dataview and backlinks all read the file that way. The outline has to agree
   with them, or the plugin's structure contradicts the vault.
3. **The plugin draws the structure itself.** TO showed that list geometry can be driven through
   CSS variables plus line decorations (`native-list-decoration.md`). So LP's own interpretation
   matters only where it leaks: its line classes and styling, Smart Lists, and its own Enter and
   Tab handlers.

So the `obsidian` dialect is CommonMark + GFM + the Obsidian extensions: callouts, `%%`, `$$`,
`^id`, wikilinks and embeds, tags. LP and the metadata cache become **readers** in the writer's
agreement checks (§4.3), plus overrides in the plugin.

##### 4.2 A runnable LP approximation is cheap

TO measured LP's quirks by hand in the real app. Upstream CodeMirror 5 (MIT, `codemirror@5.65.20`)
runs headlessly through `addon/runmode/runmode.node.js`, and its list regex,
`/^(?:[*\-+]|^[0-9]+([.)]))\s+/`, is byte-identical to the one TO quotes from Obsidian's bundle.
On TO's documented cases:

| case | CM5 markdown mode, headless | TO's measurement in Obsidian |
| --- | --- | --- |
| a bare `-` between items | not a list line | not an item (`marker-without-trailing-space.md`) |
| `-  a` | content column 3 | content column 3 (`list-marker-content-column.md`) |
| `> q` / `  -` | quote continuation, no list | `HyperMD-quote-lazy` |
| tab nesting | depths 1 / 2 / 3 | depth by tab |

Limits of this check:

- My harness lacks CM5's line lookahead, so I did not check setext cases.
- Obsidian's copy of the mode is modified and layered under HyperMD.
- Quantisation is rendering, not parsing.

Use it as a **dev-only fuzzing oracle**, calibrated against TO's tables and a small end-to-end
corpus in real Obsidian. Never ship it as a reader.

##### 4.3 Runtime guarantees vs test-time guarantees

The reviews' G6 / I6 ("in written regions, all configured readers agree") doesn't say *when* it
is checked. The core can't ship four parsers, and shouldn't. Split it three ways:

- **Runtime, on every command:** re-parse with ourus's own parser and check the postconditions
  (G4). That is the safety net.
- **Writer rules, shipped as data:** at seams, the encoder emits only a restricted, documented
  subset. Each rule is a cheap predicate, not a second parser:
  - one space after a marker, and never a bare `-` (LP);
  - nesting at the content column, using the destination's indent unit;
  - separators copied from the siblings;
  - no indentation of 4+ columns outside items.
- **Test-time, in CI:** differential fuzzing of command *outputs* across the reader panel
  (commonmark.js, markdown-it, micromark, lezer and the CM5 LP approximation) proves that the
  writer rules keep written regions inside the agreement zone. Each disagreement found becomes
  either a new writer rule or a named, accepted deviation.

---

#### 5. Simplifications to the reviews' API

- **Preflight is free.** In a pure core, `execute(doc, cmd)` mutates nothing. Drag previews and
  menu enablement call it and discard the result, so there is no need for a separate `preflight`
  or `canRun`. Add a cheaper `check` (which stops after planning) only if profiling shows
  `execute` is too slow at hover rate.
- **Commands and edits are plain serialisable data** (`{type: 'formatIndent', …}`). Fixtures,
  logs, bug repros, cross-worker calls and replay then come free.
- **Three result kinds:**
  - `applied`, possibly with zero changes; identity-only and metadata-only effects are still
    reported;
  - `rejected {reason}`;
  - `notApplicable`: "not mine, let the host run its default". opus55b and SilverBullet have it,
    and keymaps need it; GPT-6 and opus55 lack it.

  GPT-6's `unchanged` becomes `applied` with no changes.
- **Drop per-segment `moves` from v1.** An adapter that must carry folds or marks across a command
  converts them to node-relative anchors (node ID plus content offset) beforehand and back
  afterwards. The reviews already propose those content anchors, which makes `moves` redundant.
  Add moves later if an adapter proves they're needed.
- **Use CM6's change semantics unchanged:** `{from, to, insert}` in old-document coordinates,
  sorted and non-overlapping; `mapPos(pos, assoc)`; the same JSON form. That costs nothing in CM6
  and is trivial to adapt elsewhere.
- **Vocabulary:**

  | term | meaning |
  | --- | --- |
  | *command* | a structural intent (outgoing from the host) |
  | *edit* | an incoming raw text-change request |
  | *changes* | the outgoing text delta |
  | *result* | what a command or edit returns |

  Avoid *transaction*, which is CM-specific, and *operation*, which is ambiguous between intent
  and primitive. Take intent names from W3C `inputType` where one exists (the reviews' table).
- **Configuration.** Use one options object with three nested sections for now. Build preset
  machinery (named bundles) only once a second preset exists.
- **The edit gate comes later, but its input shape is fixed now.** Ship M0 and M1 with permissive
  editing plus reconciliation. Settle the `EditRequest` shape now, so adapters pass it from day
  one: base revision, changes, selection before, intent if known, origin, and composing.

---

#### 6. Gaps left open by all the reviews

##### 6.1 Render facts must be queryable by range

CM6 renders only the viewport, and Obsidian notes can run past 10,000 lines. So render facts
should be computed on demand from the line table, for a line range:
`lineFacts(doc, fromLine, toLine)`. They cover:

- the line's node and depth;
- its line role;
- the content column;
- seams;
- fold and zoom visibility.

The same applies to fold ranges. A whole-document view model doesn't scale.

##### 6.2 Persistent locators

Runtime IDs die on reload, but folds and zoom should survive it. Obsidian persists its own folds by
line, which breaks under external edits. Offer two optional functions:

- `locator(node)` returns a serialisable path of (kind, hash of the head text, ordinal among
  equal siblings);
- `resolve(doc, locator)` finds the node again, using outl-style tiered matching.

They're cheap, and every host wants them.

##### 6.3 The inline layer, earlier than "later"

All the reviews defer inline parsing past their last milestone. Several things need it sooner:

- Enter inside `**bo|ld**` or inside a link, and joins;
- Obsidian `^block-id`, tags and wikilinks;
- task markers;
- the brief's "fully compliant" claim.

Inline structure never affects block structure (reference definitions aside), so it can be lazy
per leaf and cached by content. Port it from `inlines.js` (about 1,000 lines). Put a minimal
inline scan in M2 (code spans, links, emphasis delimiters, enough to split safely) and full
conformance in M3.

##### 6.4 Multiple selections

CM6 supports multiple selection ranges. Define a command over them as:

1. map each range to its operands;
2. union the operands into node sets per parent;
3. reject non-contiguity only within one parent group;
4. plan once.

Text-level commands such as split apply per range within one change set, like CM's
`changeByRange`.

##### 6.5 Block cursor

The brief asks about block cursors. The core needs only this:

- `caret: 'bar' | 'block'` in the editing policy;
- a block caret is a one-grapheme selection that can't sit after the last character of a
  non-empty line;
- commands that place the caret (split, join, move) clamp to that rule, and "end of node" means
  "on its last character".

##### 6.6 Whole-text replacement

External file changes, sync and `setValue` supply new text with no change provenance. Give them
`replace(doc, text)`:

1. diff by lines, which is cheap with the line table;
2. apply the diff;
3. reconcile IDs with outl's guarded matcher.

---

#### 7. The spec as a literate document

The brief says code could be generated from docs and tests. Make that literal, following
CommonMark's own `spec.txt` convention:

- one Markdown spec per area (`spec/commands/indent.md`, …);
- prose explains each rule;
- fenced `example` blocks are the tests.

Glyphs come from TO's drawn-case notation (`.agents/skills/presenting-examples/SKILL.md`):

| glyph | meaning |
| --- | --- |
| `┃` | caret |
| `«…»` | text selection; `┃` touching one end marks the head |
| `▒` | opens a block-selected line |
| `→ ` | a tab |
| `∅` | end of document |

Add `␍` for CR. A rule and its example:

~~~~markdown
## Indent a list item

The item becomes the last child of its previous sibling. It copies the indentation of
that sibling's existing children, or else nests at the sibling's content column.

```````````````````````````````` example
- a
  - x
- b┃
.
formatIndent
.
- a
  - x
  - b┃
````````````````````````````````
~~~~

- **Options.** Options go on the example's info string (`example indent=tab feel=logseq`).
- **Rejections.** A rejection is expected as `rejected: no-previous-sibling`.
- **One corpus, several runners.** The same files run in the core tests and are replayed through
  the textarea, CM6 and Obsidian end-to-end adapters.
- **Byte-level fixtures.** Line-ending, BOM and NUL cases are still generated in code (TO's CRLF
  fixture contains no CR bytes); the spec only references them.

---

#### 8. Scope: a walking skeleton first

Taken together, the reviews ask for all of this:

- seven guarantees;
- three config axes plus reader sets, and a reader panel;
- a gate with three host contracts;
- a session with provisional places, and render facts;
- identity events carried through host history;
- staged incrementality;
- content anchors, preflight, and a conservative writer search.

Each item is justified, but together they are a lot of API to freeze before anything runs. TO's
first decorations attempt failed after three redesigns with all tests green, which argues for
running real editors early. The brief's first milestone is demos, too.

Each milestone below ends with something people can type into.

| | contents | exit criteria |
| --- | --- | --- |
| **M0 walking skeleton** | Note 1 below | 652/652 block skeletons against commonmark.js; G1 fuzz; G3/G4 properties; both demos usable as a minimal outliner |
| **M1 model hardening** | Note 2 below | on random edit scripts, incremental == full; end-to-end typing latency measured in CM6 |
| **M2 Obsidian spike** | Note 3 below | drawn cases replayed in real Obsidian; agreement fuzz green |
| **M3** | GFM and the Obsidian extensions; full inline parsing and conformance; polished render facts; folds, zoom and locators | spec HTML conformance; corpora per profile |
| **later** | GTK/GJS demo; Joplin and Zettlr adapters; Logseq, Pandoc and Org backends | |

1. **M0 contents:**
   - the repository, tooling, and the literate-spec runner;
   - the line machine for CommonMark blocks: containers, lists, quotes, ATX and setext headings,
     fences, indented code, HTML blocks, reference definitions, thematic breaks;
   - the line table, and the outline projection with the brief's defaults;
   - indent, outdent, move up/down, split (Enter) and join (Backspace at start), for list items
     and headings, verified by full reparse;
   - a textarea demo **and** a bare CM6 demo (a `StateField` plus a keymap, about 200 lines).
2. **M1 contents:**
   - incremental reuse in the line machine, checked against the full-parse oracle;
   - head-line identity and identity events;
   - seams (§3);
   - delete subtree, duplicate, convert kind, toggle task, move-to;
   - group forms, node selection and escalation;
   - reconciliation of raw edits;
   - about 100 spec examples.
3. **M2 contents:**
   - `ourus-cm6`, extracted from the demo;
   - an Obsidian plugin skeleton: structure decorations from render facts, plus Tab, Enter,
     Backspace and Alt+arrows;
   - the LP oracle added to the fuzzing;
   - writer rules, and the guarded gate;
   - provisional places;
   - paste (`insertMarkdown`);
   - the minimal inline scan.

How this differs from the reviews' phasing:

- **CM6 moves from M4 to M0.** It is the primary target, the change format is already CM's, and
  the demo is small.
- **Incrementality moves to M1.** The line machine makes it cheap, but M0 doesn't need it.
- **The gate and session details wait** until real editors have given feedback.
- **GTK stays optional.**

---

#### 9. Repository and tooling for `./ourus`

```
ourus/
  package.json    name "ourus", type module, MIT; exports "." (and "./cm6" later); no deps
  tsconfig.json   strict, erasableSyntaxOnly, verbatimModuleSyntax, noUncheckedIndexedAccess
  src/
    text/         changes, mapping, positions, line endings, decode/encode helpers
    syntax/       line machine, line table, parse state, block-tree view
      commonmark/ block rules (the port), reference definitions
    outline/      projection, policy, identity, seams, render facts
    commands/     planner, place(), writer rules, verification, intents
    session/      (later) selection, folds and zoom, provisional places
  spec/           the literate behavior spec (.md)
  test/           spec runner, laws (fast-check), oracle diffs, generators
  oracle/         dev-only: commonmark.js, markdown-it, micromark, lezer, CM5 LP approximation
  demo/textarea/  demo/cm6/
  bench/
  LICENSE  NOTICE
```

- **Tooling, at the versions current on npm today:**
  - TypeScript 7.0.2;
  - vitest 5.0.3 and fast-check 4.10.2;
  - esbuild 0.28 for the demo and GJS bundles.

  Node 26 runs `.ts` files directly through type stripping. Scripts and the spec runner need no
  build step if the source sticks to erasable syntax: no enums, namespaces or parameter
  properties.
- **Dependencies.** The oracles are dev dependencies only, and the core ships none. The `cm6`
  entry point takes `@codemirror/*` as peer dependencies, because Obsidian and Joplin provide their
  own copies.
- **Licence hygiene:**
  - porting commonmark.js is fine under MIT, keeping its BSD-2-Clause notice in `NOTICE` and
    recording the upstream revision;
  - the CommonMark spec examples are CC-BY-SA test data, noted in `NOTICE` too;
  - TO is MPL-2.0: borrow its ideas and notation, not its files;
  - tine's lsdoc is AGPL: don't copy from it.
- **Byte fixtures.** Generate CR, BOM and NUL fixtures in code. Mark any checked-in byte fixtures
  `-text` in `.gitattributes`.

---

#### 10. Decisions needed before coding

1. **Core representation:** the line machine plus line table (§2), instead of a rowan-style tree
   with a tiered reparse? *Recommended.*
2. **Blank lines:** seam ownership (§3), instead of TO's trailing gap? *Recommended.*
3. **Obsidian:** a CommonMark-family dialect, with LP only as a writer constraint and a dev oracle
   (§4)? *Recommended.*
4. **Tab on a heading:** org-style promote/demote, which may adopt the following siblings, as the
   default (TO's behavior; GPT-6's `# A` / `## B` / `## C` example)? A strict policy would be
   available instead. *Recommended:* org-style by default, with the adoption reported in the
   result.
5. **An unclosed fence while typing:** honest re-projection in v1, which is simple and never stale?
   A "hold" presentation overlay would come only if it proves annoying in the demos.
   *Recommended.*
6. **Scope:** the walking skeleton, with CM6 in M0 (§8)? *Recommended.*
7. **Spec notation:** TO's glyphs inside CommonMark-style example blocks (§7)? *Recommended.*

---

#### Appendix A: reproducing the new evidence

- **The commonmark.js cases (§2.1, §3.1):**
  1. Use commonmark.js 0.31.2 (now a dev dependency of ourus).
  2. Parse each source.
  3. Print the block types, with `listTight` for lists.

  This takes about 15 lines of Node.
- **The CM5 Live Preview approximation (§4.2):**
  1. Install `codemirror@5.65.20` in an empty directory.
  2. Load `addon/runmode/runmode.node.js`, then `mode/markdown/markdown.js`.
  3. Get the mode with `getMode({tabSize: 4}, 'markdown')`.
  4. For each line, feed a `StringStream` to `mode.token` until the end of the line. Call
     `blankLine` on empty lines.
  5. Read `state.listStack` (depth, and the content column) and `state.quote` after each line.

  Setext detection needs the line lookahead that a full CM5 instance provides; this harness
  doesn't supply it.
- **TO's gap ownership:** see `repos/obsidian-true-outliner/src/model.ts` (header comment) and
  `src/encode.ts` (emission order: lines, gap, children).
