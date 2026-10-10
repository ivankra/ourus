# Ourus — retained GPT-6 review

Summary of the review of the brief, the other agents' research, local reference repositories, and parser experiments.

**Build around exact source, a faithful syntax tree, and a configurable outline projection.** Ourus's distinctive work is the structural transaction engine that keeps those representations consistent through editing. Keep the core pure, immutable, editor-independent, and low in runtime dependencies.

## Model and guarantees

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

## Parser and incremental updates

Recommend an **owned CommonMark implementation behind an internal parser interface**, starting from commonmark.js's reference block algorithm. Preserve source spelling while handling container continuation, lazy continuation, precedence, and virtual tab columns correctly. Porting the block file alone is insufficient: reference-definition recognition and decoding helpers also matter. A block-only milestone is useful, but full CommonMark compliance requires inline parsing and reference resolution too. The [specification](https://spec.commonmark.org/0.31.2/) remains authoritative; agreement with a port's source implementation is not independent proof.

Keep commonmark.js as the primary differential reference and other implementations in the panel. Production dependency minimization does not require minimizing development test dependencies.

Implement a fresh parse as the baseline and fallback, then deliver conservative reuse for ordinary typing and a common structural operation before declaring the initial core complete. Safe reuse depends on parser-state convergence, not a fixed surrounding window. Fence edits can affect the document tail, reference definitions distant inlines, and heading levels section boundaries. The outline and position indexes need incremental maintenance too.

Relative-width persistent nodes help sharing, but do not automatically provide incremental parsing, logarithmic updates, or logical identity. Replacing a child in a very wide parent can still be linear. [Panache's reparser](https://github.com/jolars/panache/blob/main/crates/panache-parser/src/parser/reparse.rs) is useful precedent for guarded local reparsing with larger-window and full-parse fallbacks.

## Transactions and structural operations

Operations should return a new snapshot, exact forward/inverse text edits, position mappings, identity events, optional selection, and a typed applied/unchanged/rejected status. Forward edits use starting-source coordinates; inverse edits use resulting-source coordinates. Reject stale plans. Keep snapshot diff as a secondary utility.

Use one contextual placement planner beneath move, indent, outdent, drop, and structured paste. Share admissibility and encoding rules while retaining different move/copy/paste identity policies. Parent/child kinds alone are insufficient: neighboring blocks, list grouping, content columns, and syntax interruption affect placement.

Plan the intended change, encode it, then validate the parsed result **against that intent**. Check both departure and destination boundaries, unaffected parentage/order, block kinds, list tightness, and literal code content. Reparsing successfully does not prove the requested operation happened. Group gestures should plan once against one starting snapshot.

Separate heading level editing from structural reparenting. In `# A`, `## B`, `## C`, promoting B to `# B` makes C part of B's section. A level-edit command may permit that; a command promising unchanged bystander parentage cannot.

“Minimal edits” should mean a documented locality policy, not a globally shortest diff. Reindentation and boundary repairs legitimately enlarge the footprint. Reject unrepresentable transformations or apply an explicitly allowed conversion.

## Raw editing, identity, and compatibility

Provide unrestricted source editing plus an optional pure **pass/rewrite/veto gate**. Give it revision, changes, pre-edit selection, origin, intent when known, and composition state. Distinguish reconciliation of committed text from corrective edits. An insertion inside one node can still change distant structure; IME and remote changes require explicit policy.

Use opaque runtime IDs with events for split, join, duplicate, deletion, and reconciliation resets. Keep authored IDs separate. Known moves retain identity; arbitrary edits involving identical content can be ambiguous. A text-keyed snapshot cache cannot restore undo identity correctly: different identity histories can produce identical source. Carry identity/session effects through host history.

Moved-range offsets alone cannot follow content through multiline reindentation; compose movement with content mappings. Provisional empty positions need creation and cleanup provenance in the session or returned effects.

Reader compatibility must be **contextual and versioned**. Preserve existing disagreements while checking newly affected regions and boundaries. Blank lines and tab/four-space indentation are candidate encodings, not universal safety rules. Blank lines can change list tightness. Obsidian reading view and Live Preview need application fixtures; a standalone core cannot guarantee agreement with every host version.

Keep dialect, outline, and editing policies separate. Formal GFM and product-specific extensions are distinct; footnotes, for example, are outside the published [GFM specification](https://github.github.com/gfm/). Org/Neorg would need parser-and-encoder backends, not merely Markdown options.

## Consumer fit and delivery

Build the requested **textarea and GTK Markdown outliner demos before production-editor integration**, plus a minimal CM6 harness. Exercise loading, typing, split/join, structural moves, provisional positions, selection/folds, and undo. These should test actual outliner interaction, not just display a parsed tree.

CM6 adapters must reconcile against the transaction that actually commits, account for filter bypass/state replacement, and use host history. Keep CM dependencies outside the core. GTK needs coordinate conversion and user-action grouping; textarea needs composition handling and post-input reconciliation when interception is unavailable. Follow with an early Obsidian spike before stabilizing the public API.

Expose pure structural rendering facts: ownership, depth, line roles, source columns, and foldable ranges. Visibility comes from session state; pixels, wrapping, bidi, CSS, and widgets belong to the host. Correct facts do not eliminate real rendering tests.

Suggested order: observable laws and fixtures → owned parser baseline → outline and a small operation set → gate and standalone demos → measured incremental paths → Obsidian integration → more commands, dialects, and adapters. Complete block and inline conformance before claiming a fully compliant parser.

## Evidence worth retaining

The independent audit reran 210,000 generated draws and compared block skeletons on all 652 CommonMark examples. The original experiment's 30,000-draw wild run contained only **581 distinct strings** because floating-point LCG multiplication entered a short cycle. With `Math.imul` and a corrected random interval:

| Wild run | Draws | Distinct inputs | Four-parser agreement |
| --- | --- | --- | --- |
| Original, seed 7 | 30,000 | 581 | 79.22% |
| Corrected, seed 7 | 30,000 | 29,832 | 77.79% |
| Corrected, seed 11 | 30,000 | 29,812 | 77.67% |

These are synthetic, draw-weighted agreement rates, not defect rates. Selected disagreements also reproduced through direct HTML rendering. Markdown-it and mdast/micromark matched commonmark.js on all 652 example skeletons; Lezer matched 649. Skeleton comparison omits content, source spans, tightness, and other semantics, and does not establish full spec conformance. The sibling generator subsequently adopted the arithmetic fix and distinct-input reporting. The preserved audit rerun reproduced its results exactly.

Reference lessons: True Outliner exposes the costs of incomplete grammar, implicit paragraph/list parentage, missing command provenance, and host interference. Outl provides useful identity matching but does not preserve all unknown nested source. SilverBullet demonstrates source-range outline operations, although its Markdown tree conversion strips CR characters. Rowan informs persistent storage; Panache informs guarded incremental parsing. No editor application was launched, and published application/benchmark timings were not independently reproduced.

The lasting test strategy is: normative examples, independent parser comparisons, exact-source cases, independently specified command postconditions, random edit/command sequences with shrinking, fresh-versus-incremental comparison, identity/history tests, and shared adapter behavior fixtures. Audit generators and fixture contents too. Measure complete update latency and retained memory rather than extrapolating from parser-only timings.
