# ourus: review of the initial design draft (opus55b)

Review of the brief (then `ourus.md`, now [`briefing.md`](briefing.md)), grounded in the
reference repos under `repos/` plus a few external ones (Twig, panache, @lezer/markdown,
commonmark-spec, micromark, all cloned only to read). I did **not** read `design/proposal1.md` /
`proposal2.md` (deleted in the working tree); this review is independent of them.

A fuller TypeScript sketch of the proposed API lived in `opus55b/api-sketch.ts`, since
deleted; the condensed version below is the one kept.

---

## TL;DR

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

## 1. What the prior art says (condensed)

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

## 2. The core thesis and invariants (make these the spec's first page)

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

## 3. Architecture suggestions

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

### 3.1 The line-prefix model

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

### 3.2 Exact block parsing, lazy inline parsing

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

### 3.3 Dialects

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

### 3.4 Outline projection and identity

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

### 3.5 Operations: small algebra, planners, verification

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

### 3.6 Intents and the behavior profile

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

### 3.7 Change sets and positions

- Use **UTF-16 offsets** and CM-compatible change sets: sorted, non-overlapping
  `{from, to, insert}` in old-document coordinates, plus `mapPos(pos, assoc)`, `compose`,
  `invert`, and JSON. A CM6 adapter then passes them straight through, and textarea/Monaco
  adapters convert trivially. Don't depend on `@codemirror/state`; mirror its semantics.
- Provide `selectionBefore`/`selectionAfter` and inverse id maps as undo hints. Don't own
  history in v1; every host has one.
- Line endings: hosts may normalise (CM6 joins lines with `\n` unless the `lineSeparator`
  facet is set). Core must accept whatever string it is given, write new lines using the
  dominant ending of the surrounding text, and never assume `\n`.

### 3.8 Raw edits: guard and reconcile

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

### 3.9 Placeholders (empty nodes)

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

### 3.10 Session: thin and storable

- `Snapshot` is immutable. `Session` is a convenience holder, not a framework. Everything
  should fit inside a CM6 `StateField`: `snapshot.apply(changes)` returns a new snapshot,
  fold and zoom state is keyed by node id (with position fallback), and selection lives in
  the host.
- Avoid re-implementing CM6's state/facet machinery. Hosts without a state system (textarea,
  GTK, TUI) get a small `Session` class that wraps the same pure functions.

### 3.11 Incremental parsing

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

## 4. Outline mapping: decisions and edge cases to settle

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

## 5. API sketch (condensed; the fuller version was not kept)

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

## 6. Testing strategy (proportionate)

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

## 7. Fit with target editors

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

## 8. Scope and milestones

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

## 9. Naming and packaging

- npm (checked today): `ourus` and `outex` are free; `markout` is taken. Reserve the `@ourus`
  scope early. Possible layout: `@ourus/core` (zero deps), `@ourus/cm6`, `@ourus/obsidian`,
  later `@ourus/org`. Ship ESM only, with no `node:` imports in core.
- There's a tension with `README.md` (parseq wants a "Rust/Go core"). A TypeScript core is
  right for the Obsidian/CM6 targets. Keeping fixtures and drawn cases as language-neutral
  data keeps a Rust port (or a WASM core behind the same API) cheap later.

---

## 10. Pushback and risks

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

## 11. Open questions for you

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
