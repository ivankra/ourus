# ourus: review and pre-implementation plan (opus55c)

2026-10-11. A response to the brief [`briefing.md`](briefing.md), written after reading the three
existing reviews ([gpt6](preimpl-gpt6.md), [opus55](preimpl-opus55-1.md),
[opus55b](preimpl-opus55-2.md)), their working notes (since deleted), and the prior-art repos
(true-outliner, "TO" below, in the most depth).

This is a **delta**, not a fourth full design. The reviews agree on most things, and I agree with
most of that, so §1 turns the consensus into a decision list. The rest of this document is what I
would change or add. New claims say how they were checked; Appendix A has the reproduction recipes.

## TL;DR

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

## 1. Consensus, recorded as decisions

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

## 2. The parser as a resumable line machine; the line table as the core

### 2.1 Why

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

### 2.2 The line table as the primary structure

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

### 2.3 Porting notes

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

### 2.4 Risks

- **A field missing from the state object means wrong reuse.** Mitigations:
  - debug builds assert incremental == full on every edit (Panache's
    `assert_matches_full_parse`);
  - a random-edit differential test runs in CI;
  - the state type's equality function is generated from its fields, never written by hand.
- **Pandoc may not be bounded-state.** Pandoc's list continuation and grid tables need checking
  before calling the scheme universal. Org is fine: it is line-based.

---

## 3. Blank lines belong to seams (the brief's "empty lines handling")

### 3.1 Evidence

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

### 3.2 The rule

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

## 4. Obsidian: parse the CommonMark family; Live Preview is a reader

### 4.1 Position

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

### 4.2 A runnable LP approximation is cheap

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

### 4.3 Runtime guarantees vs test-time guarantees

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

## 5. Simplifications to the reviews' API

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

## 6. Gaps left open by all the reviews

### 6.1 Render facts must be queryable by range

CM6 renders only the viewport, and Obsidian notes can run past 10,000 lines. So render facts
should be computed on demand from the line table, for a line range:
`lineFacts(doc, fromLine, toLine)`. They cover:

- the line's node and depth;
- its line role;
- the content column;
- seams;
- fold and zoom visibility.

The same applies to fold ranges. A whole-document view model doesn't scale.

### 6.2 Persistent locators

Runtime IDs die on reload, but folds and zoom should survive it. Obsidian persists its own folds by
line, which breaks under external edits. Offer two optional functions:

- `locator(node)` returns a serialisable path of (kind, hash of the head text, ordinal among
  equal siblings);
- `resolve(doc, locator)` finds the node again, using outl-style tiered matching.

They're cheap, and every host wants them.

### 6.3 The inline layer, earlier than "later"

All the reviews defer inline parsing past their last milestone. Several things need it sooner:

- Enter inside `**bo|ld**` or inside a link, and joins;
- Obsidian `^block-id`, tags and wikilinks;
- task markers;
- the brief's "fully compliant" claim.

Inline structure never affects block structure (reference definitions aside), so it can be lazy
per leaf and cached by content. Port it from `inlines.js` (about 1,000 lines). Put a minimal
inline scan in M2 (code spans, links, emphasis delimiters, enough to split safely) and full
conformance in M3.

### 6.4 Multiple selections

CM6 supports multiple selection ranges. Define a command over them as:

1. map each range to its operands;
2. union the operands into node sets per parent;
3. reject non-contiguity only within one parent group;
4. plan once.

Text-level commands such as split apply per range within one change set, like CM's
`changeByRange`.

### 6.5 Block cursor

The brief asks about block cursors. The core needs only this:

- `caret: 'bar' | 'block'` in the editing policy;
- a block caret is a one-grapheme selection that can't sit after the last character of a
  non-empty line;
- commands that place the caret (split, join, move) clamp to that rule, and "end of node" means
  "on its last character".

### 6.6 Whole-text replacement

External file changes, sync and `setValue` supply new text with no change provenance. Give them
`replace(doc, text)`:

1. diff by lines, which is cheap with the line table;
2. apply the diff;
3. reconcile IDs with outl's guarded matcher.

---

## 7. The spec as a literate document

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

````markdown
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
````

- **Options.** Options go on the example's info string (`example indent=tab feel=logseq`).
- **Rejections.** A rejection is expected as `rejected: no-previous-sibling`.
- **One corpus, several runners.** The same files run in the core tests and are replayed through
  the textarea, CM6 and Obsidian end-to-end adapters.
- **Byte-level fixtures.** Line-ending, BOM and NUL cases are still generated in code (TO's CRLF
  fixture contains no CR bytes); the spec only references them.

---

## 8. Scope: a walking skeleton first

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

## 9. Repository and tooling for `./ourus`

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

## 10. Decisions needed before coding

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

## Appendix A: reproducing the new evidence

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
