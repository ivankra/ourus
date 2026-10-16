# API refactoring (2026-10-13)

`src/` restructured into layers with small, human-readable APIs between them, so that each one
hides its details, can be rewritten on its own, and can be understood without the others.
Behavior is unchanged: the extended differential (§5) compares every step with the code before.

How this was decided: three independent proposals (`r1.md`, `r2.md`, `r3.md`), argued out with the
user in `r-chat.md` until they agreed; this document is `r3.md` as agreed (§10 lists the decisions).
§11 is the implementation log: what was done, step by step, and what it turned up.

## 0. The rules

From the user, and they decide every trade-off below:

1. **As simple as possible, but not simpler.** A layer, class or file earns its place only when it
   removes more to keep in mind than it adds.
2. **A component's external API is for humans.** A few cohesive classes, not a heap of
   heterogeneous top-level functions; a utility module (`text.ts`) may be a set of consistently
   named functions. Its internals are not for humans: they can be whatever works, and are
   disposable.
3. **No new vocabulary without a good reason.** We have outline, node, writer, edited outline,
   placeholder, flavor, command; we use them. Internal terms (seams, units, candidates) stay
   internal.
4. **Layers build on each other:** text, parser, outline, encoder, commands. Each one only uses
   the ones below it.

## 1. Where the weight is

Most of `src/` is in reasonable shape. `parsing/` is already a component: `Syntax`, `Machine` and
`Flavor` are classes with one job each, its suites test it to death, and 10-parsing.md lists the
traps inside it. The weight sits in the layers above it.

| File | Lines | Top-level functions | What it does |
| --- | ---: | ---: | --- |
| `commands.ts` | 2,335 | 80 | every command, plan verification, renumbering, settling, Home |
| `outline-editor.ts` | 965 | 32 | edited outlines, outline comparison, the writer, reindent |
| `doc.ts` | 332 | 9 | the snapshot, placeholders, id carrying, node-text queries |
| `outline.ts` | 144 | 3 | the outline built from the block tree |
| `text.ts` | 210 | 11 | changes, position mapping, lines |
| `config.ts` | 140 | 4 | options |

### `commands.ts`

- **A class trying to get out.** 66 of its 80 functions take `doc: OutlineDoc` first; most also
  take the selection or a position, a node and its line. Each function rebuilds the same small
  context from them.
- **Repeated boilerplate:**
  - `doc.lines[...]`: 68 times.
  - Spaces-and-tabs loops (`while (… isBlankChar(text.charCodeAt(…))) …++`): 22.
  - `line.ending || dominantEnding(doc.text)`: 16.
  - The line-start escape (`const digits = /^\d*/.exec(rest)![0].length; … '\\' …`): 10 copies,
    in five variants (`encodeRest`, `escapeFirst`, `escapeNext`, `escaped`, inline).
  - The caret plan `{ changes, selection: { anchor: caret, head: caret }, expected, compare: 'tree' }`:
    26 times.
  - Navigation by index: `doc.nodes[doc.nodes.indexOf(node) ± 1]` 7 times (each one O(n)),
    `x.children[x.children.indexOf(y) ± 1]` 13 times.
- **Edits to the expected outline read inside out:**
  `place(remove(doc.outline, parent.id, run), parent.parent!.id, parent.id, 'after', run)`. The
  helpers live here, away from the type they edit, which is in `outline-editor.ts`.
- **It reaches into the parser** (`startsBlock`, `scanReference`) **and into the writer**
  (`reindent`, `usesTabs`, for renumbering).
- **Plans chain their fallbacks through closures**, so `withPlan` rewraps the chain to add two
  fields.
- **Two doc comments sit above the wrong function:** the one for `paste` above `pastePlain`, the
  one for `joinForward` above `deleteGap`.

r1's churn data (r1§2) shows where the cost lands: in the pure bug-hunting commit, 93% of the lines
added to `commands.ts` were in command bodies. The bodies are long because each rebuilds its
context; that is the first thing to fix (§7).

### `outline-editor.ts`

Three jobs in one file: the edited-outline type and its edits, outline comparison (verification
uses it), and the writer, about 700 lines of internals behind one function, `writeOutline`. It also
exports `reindent`, `usesTabs` and `whitespace` for `commands.ts`, and `contentOf`, which is a
question about the document rather than about writing.

### Small duplicates and stray state

- `lineIndexAt` in `text.ts` and again in `parsing/syntax.ts`.
- `lineSpan` (`commands.ts`) and `lineEndAt` (`doc.ts`) do the same thing.
- `difference` (`outline-editor.ts`) is `wholeDiff` (`text.ts`); `applyLocal` is `applyChanges`.
- `contentStart(line)` (`outline-editor.ts`) is `line.contentFrom`.
- Spaces-or-tabs tests in four files under three names; `parsing/chars.ts`'s `isBlankChar` also
  takes line breaks: the same name, a different meaning.
- Two module-level `WeakMap` caches keyed by document (`orderedItems`, `tabbed`).
- `src/index.ts` re-exports the line machine's internals (`Frame`, `Machine`, `State`, ...).
- Tests and the demo import past every index, so there is no boundary to keep.

## 2. Principles

1. **Dependencies point one way:** `text ← parser ← outline ← encoder ← commands`, with `config`
   beside `outline`. Inside `commands/`, the structural commands are the lower layer: Enter and the
   joins call them (`split → outdent`), never the reverse (r1's finding).
2. **Each component has one entry**, its `index.ts` (or the file itself). A component's own tests
   may import its internals. A boundary test enforces both rules.
3. **External APIs are cohesive classes** with a few methods each, plus the data types they return;
   `text.ts`, a utility library, exports consistently named functions. Inside a component,
   functions or classes, whichever reads better.
4. **No speculative structure:** no interfaces with one implementation, no dependency injection, no
   registries, no inheritance, no stateful session object. The host owns state (CM6's `StateField`,
   the test player); ourus is pure functions over immutable snapshots.
5. **Outline nodes stay data, and keep their `Block`.** They hold line numbers and no text, which
   is what lets `OutlineState.update` reuse the whole outline while the user types within a line:
   0.11 ms per keystroke instead of 23.7 ms (10-parsing.md §10). Taking `Block`s out of nodes (r2)
   would need a node-to-source table rebuilt or invalidated per snapshot, which is the cost and
   the complexity that sharing removed.
6. **Local edits stay hand-written.** Routing Shift-Enter or a join through the encoder would make
   every command O(document). r1 withdrew its bet on this (r-chat Q4); r2's `realize()` owning
   local patches is the same bet.
7. **Moves before rewrites.** Each step moves code or removes repetition; the extended differential
   (§5) shows nothing changed.

## 3. Layout

```
src/
  index.ts              the package's API (§4.6)
  text.ts               ChangeSpec and functions over changes, lines and columns
  config.ts             Config and reading it
  parser/              unchanged inside; index.ts trimmed; extend.ts for extension authors
  outline/
    index.ts            OutlineState, OutlineNode, OutlineKind
    state.ts            OutlineState (today's doc.ts)
    build.ts            buildOutline (today's outline.ts, internal)
    identity.ts         ids carried across an edit (internal)
    placeholders.ts     which offsets can be placeholders (internal)
  encoder/
    index.ts            OutlinePlan, OutlineEncoder, EncodeResult
    outline-plan.ts     OutlinePlan, and comparing it with a parsed outline
    encoder.ts          OutlineEncoder
    layout.ts, lines.ts, seams.ts, changes.ts, indent.ts, prefix.ts,
    escapes.ts, renumber.ts                                    (internal)
  commands/
    index.ts            executeCommand, settlePlaceholders, Command, CommandResult, Selection, RejectReason
    context.ts          CommandContext, Operands                  (internal)
    plan.ts             CommandPlan, verification, refusal diagnosis  (internal)
    structure.ts        indent, outdent, moves, heading levels, delete, duplicate
    enter.ts            Enter and Shift-Enter
    join.ts             Backspace, Delete, Cmd-Backspace
    code.ts             fenced code lines
    paste.ts            structured and plain paste
    settle.ts           settling placeholders
```

Five components plus two single files (`text.ts`, `config.ts`), matching the four layers the user
described. The outline plan lives in `encoder/`.
`commands/` and `encoder/` are each one file per concern: in `commands/`, one per family of
commands; in `encoder/`, one per part of writing (layout, lines, blank lines between nodes, ...).

**Settled: per-family files are in `commands/`** (the user: "i meant this, since commands.ts is our
biggest and most churn-prone file"), the layout above. Within `encoder/`, encoding used by more than
one command family lives there (prefixes, markers, escapes, renumbering, the layout encoder);
encoding used by one family stays in that family's command file, and moves when a second family
needs it (all three agree).

## 4. The components and their APIs

The external API of each component, in full. Anything not listed is internal.

### 4.0 Names

The user asked for names that need no decoding, and, since CodeMirror 6 is ourus's main host, for
CM6's vocabulary wherever ours means the same thing. What the APIs below use:

| Today | Revision 4 | Why |
| --- | --- | --- |
| `TextChange` | **`ChangeSpec`** | CM6's name for this shape (below) |
| `applyChanges`, `invertChanges`, `composeChanges`, `normalizeChanges`, `mapPos` | unchanged | CM6's `ChangeSet` has `apply`, `invert`, `compose`, `mapPos` |
| `wholeDiff` | `diffText` | it compares two texts: a diff, rightly |
| `Syntax` | **`SyntaxTree`** | says what it is; CM6's `syntaxTree(state)` returns a parse tree |
| `Syntax.update(changes)`, `OutlineDoc.apply(changes)` | **`update(changes)`** on both | one verb for "the snapshot after these changes", as CM6's `EditorState.update` (r1, r2) |
| `OutlineDoc.replace(text)` | `replace(text)`, unchanged | it takes the whole new text, not changes, so a different verb is right (r1, r2) |
| `OutlineDoc` | **`OutlineState`** | the current state, beside `OutlinePlan`; `OutlineTree` the alternative; below |
| `Inline` | **`InlineNode`** | "inline" is an adjective used as a noun; `Block` reads fine and stays (r1) |
| `EditedOutlineNode`, the edited outline | **`OutlinePlan`**, **`OutlinePlanNode`** | the user's name; below |
| `Result` | **`CommandResult`** | `Result` says nothing at the package root (user; r1, r2 agree) |
| `execute`, `settle` | **`executeCommand`**, **`settlePlaceholders`** | say what they act on; it settles placeholders, the outline stays as it is (user; r1, r2 agree) |
| `Plan` (internal, in commands) | **`CommandPlan`** | the command's whole plan, holding an `OutlinePlan` (r2); below |
| `doc.outline` (the root node) | **`state.root`** | `root` on `SyntaxTree`, `OutlineState` and `OutlinePlan` (r2, r3; r1: `outline` or `outlineRoot`); below |
| `EditedOutlineNode.from` | **`OutlinePlanNode.original`** | `from` already means an offset (`ChangeSpec.from`) |
| `WrittenOutline` | **`EncodeResult`** | what `encode()` returns: changes, a position map, ids. Not an outline |
| `EditContext` (r3 draft) | `CommandContext` | the context of one command (internal) |
| `Run` (r3 draft) | `Operands` | `run()` already executes plans (internal) |

Also unchanged because CM6 uses the same words: `Selection { anchor, head }` (CM6's
`SelectionRange`), and `from`/`to`/`insert` as a change's fields.

**`ChangeSpec`.** CM6's `ChangeSpec` is the union `{ from, to?, insert?: string | Text } |
ChangeSet | readonly ChangeSpec[]`. Ours is `{ from, to, insert: string }`: its plain-object case,
with all three fields given. So every ourus `ChangeSpec`, and every array of them, *is* a CM6
`ChangeSpec`, and a host passes them to `view.dispatch({ changes })` as they are. The reverse
doesn't hold (a `ChangeSet` or a nested array isn't ours), which a host never needs: CM6 changes
reach ourus through `iterChanges`, as the demo does now.

Checked with the compiler, not assumed. An ourus `ChangeSpec` defined without importing CodeMirror
type-checks as `state.update({ changes })` and as a CM6 `ChangeSpec`, and the reverse assignment is
a type error. The same name in both libraries doesn't clash: TypeScript names belong to their
module, and only a file importing both (the CM6 adapter) has to alias one
(`import type { ChangeSpec as CMChangeSpec } from '@codemirror/state'`). ourus defines its own type
rather than importing CM6's, so the core stays editor-agnostic and keeps the narrower type it
actually accepts.

With `ChangeSpec` the functions keep today's names (`applyChanges`, `invertChanges`,
`composeChanges`, `normalizeChanges`, `mapPos`), which are also CM6's method names: no rename at
all.

**`OutlineState`, for today's `OutlineDoc`.** It is the immutable snapshot of one Markdown text
read as an outline: the text, its syntax tree, the outline's nodes, placeholders and config. Over
three rounds the participants proposed `OutlineState` (r1), `OutlineDocument` (r2) and `Outline`
(r3), and the user raised `OutlineTree`. Two names survive, and both are sound:

| | `OutlineState` (r1, r2, r3) | `OutlineTree` (the user's question) |
| --- | --- | --- |
| reads as | the current state of an outline, beside `OutlinePlan`, the planned one | the outline layer's counterpart of `SyntaxTree` |
| for | pairs with `OutlinePlan` on one axis (current vs planned); parallels CM6's `EditorState`, an immutable snapshot with the text inside | symmetric with `SyntaxTree`, which is equally "more than a tree" (it holds text, flavor, sentinels and a line table beside its blocks); frees the variable name `state` in CM6 host code |
| against | in CM6 host code `state` is the `EditorState`, so hosts name ours `outline` or similar | pairs less plainly with `OutlinePlan` (tree vs plan are different axes) |

The user was right that "more than a tree" doesn't rule out `OutlineTree`; r2 agrees. I adopted it
in revision 5, then went back: r1 and r2 had already converged on `OutlineState`, and r2's pairing
argument (current state, planned outline) is the stronger reason. **Recommendation:
`OutlineState`. `OutlineTree` is the user's to choose instead; nothing else in the design changes
with it.**

**What a command aims for: `OutlinePlan`.** Today's "edited outline" is the whole outline, root and
all, as a command wants the text to read after it. The encoder writes it, and verification checks
that the re-parsed outline equals it. Untouched subtrees are the current outline's own nodes, by
reference; only nodes on the path from the root to a change are copied, plus the nodes the command
creates. So it describes the whole outline but costs only what changed. Its copied or new nodes are
`OutlinePlanNode`s.

**`OutlinePlanNode`, for a copied or new node** (today's `EditedOutlineNode`). Untouched nodes in a
plan are ordinary `OutlineNode`s. Three names were proposed:

| Name | For | Against |
| --- | --- | --- |
| **`OutlinePlanNode`** (r3; r1's alternative) | "a node of an `OutlinePlan`", built like `OutlineNode` ("a node of the outline"); sorts beside `OutlinePlan` | long |
| `OutlineNodePlanned` (user; r2 adopted it) | sorts beside `OutlineNode` in autocomplete | an adjective after the noun doesn't read as a type name in English (r1) |
| `PlanNode` (r1) | short | drops "outline" from the family |

Recommendation: `OutlinePlanNode`; the user's choice between the three, as r1 and r2 split.

The user proposed **`OutlinePlan`**, alongside `OutlineState`: the outline as it is, and the
outline as planned. It joins one family (`OutlineState`, `OutlinePlan`, `OutlineNode`,
`OutlineEncoder`), which reads better than `OutlinePlan`. One collision has to go with it. Inside
`commands/`, a `Plan` today is the whole record one command produces:

```ts
interface Plan {                       // internal to commands/, today
  changes: ChangeSpec[]                // the text changes
  selection: Selection                 // the caret after them
  expected: OutlineNode | EditedOutlineNode   // the outline they must produce: the OutlinePlan
  compare: 'tree' | 'flat'             // how strictly verification compares it
  identity?, placeholders?, drop?      // node ids for moved nodes; placeholders to add or drop
  fallback?, keepNumbers?              // another encoding to try; leave list numbers as written
}
```

The runner applies the changes, re-parses, checks the outline against `expected`, tries the next
alternative if it doesn't match, and returns `applied`, `rejected` or `notApplicable`. So the
outline is one part of a plan. With the tree called `OutlinePlan`, the record is qualified as
**`CommandPlan`** (r2): a `CommandPlan` holds the changes, the selection and the expected
`OutlinePlan`. It's internal, `plan.ts` and `planCommand` keep their names, and each "plan" says
whose it is. (I'd drafted `Proposal`; r2's name changes less.) r1 prefers keeping
`PlannedOutline` so that the containment reads as adjective and noun; the user's `OutlinePlan`, with
`CommandPlan`, is the recommendation of r2 and r3.

r2's summary, renamed: **the `OutlinePlan` is what we want, a `EncodeResult` is one candidate
encoding of it, and the `CommandResult` is what passed verification.**

**`root`, on all three.** The user asked whether the outline's root field should be `outlineTree`
(to match `syntaxTree`) or `root` on both the snapshot and the plan. **`root`** on `SyntaxTree`,
`OutlineState` and `OutlinePlan`: each is the root node of the structure its receiver owns (r2, r3).
A field named `outlineTree` would be a node posing as a tree object beside the real `SyntaxTree`
(all three agree to avoid it). On `OutlineState`, one rule keeps `root` unambiguous: **its
unqualified members are about the outline** (`root`, `nodes`, `node(id)`, `nodeAt(pos)`), and
parse-level things live under `syntaxTree` (`state.syntaxTree.root` is the root block). r1 finds
`state.root` ambiguous with two trees inside and would keep `outline` or use `outlineRoot`; r2
accepts `outlineRoot` as the explicit alternative. Recommendation `root`; `outlineRoot` if the user
prefers it spelled out.

**`OutlineEncoder`, in `encoder/`** (r1, r2, r3; for today's writer). It turns an `OutlinePlan` into
changes to the current text, and is the inverse of the parser:

```
parser/    text       → structure   SyntaxTree.parse(text)
encoder/   structure  → changes     new OutlineEncoder(state).encode(plan)
```

The user asked for an `-er` name and suggested committer, patcher, synchronizer, rebuilder.
"Encode" is already this codebase's word, so it adds no vocabulary: `encoding-failed` is a public
`RejectReason`, the name of exactly this component's failure, and the design docs speak of
encodings throughout (r1 counted). Its method is `encode` and its result `EncodeResult` (r2).

| Name | Verdict |
| --- | --- |
| **`OutlineEncoder`** | already our word (`encoding-failed`); the inverse of `parser/` |
| `OutlinePatcher` | the best of the rest: it does produce a patch; but "patch" adds a word, and can suggest applying one |
| `OutlineCommitter` | wrong: it commits nothing; the host commits (r2's three steps below) |
| `OutlineSynchronizer` | suggests keeping two things in agreement over time; this is a one-way step |
| `OutlineRebuilder` | suggests rebuilding the document; it writes the fewest changes, moves as moves |
| `OutlineExecutor` | collides with `executeCommand`, the commands' entry point |
| `OutlineWriter` | fine, the previous choice; `OutlineEncoder` wins on the parser symmetry and on `encoding-failed` |

r2's three steps, which name what each part does:

```text
encoder.encode(plan) → candidate changes and mappings (EncodeResult)
executeCommand(...)  → apply to a new snapshot, verify, retry; return a CommandResult
host dispatch        → commit the result in the editor
```

### 4.1 `text.ts`

**Usage** (hosts, commands, the parser):

```ts
import { applyChanges, invertChanges, mapPos, type ChangeSpec } from 'ourus';

const changes: ChangeSpec[] = [{ from: 0, to: 0, insert: '- ' }];   // make the first line an item
const next = applyChanges(text, changes);
const undo = invertChanges(text, changes);       // applied to `next`, gives `text` back
const caret = mapPos(changes, oldCaret, 1);       // the caret's place in `next`
```

A utility library: `ChangeSpec` and consistently named functions over changes, lines and columns.
No classes (the user, r-chat).

```ts
interface ChangeSpec { readonly from: number; readonly to: number; readonly insert: string }

// changes                                 // over plain ChangeSpec arrays
applyChanges(text, changes): string
invertChanges(text, changes): ChangeSpec[]
composeChanges(text, a, b): ChangeSpec[]
normalizeChanges(changes): ChangeSpec[]
mapPos(changes, pos, assoc?): number
diffText(before, after): ChangeSpec[]      // one change, trimmed to the span that differs
diffLines(before, after): ChangeSpec[]     // whole lines

// lines and columns
splitLines(text): { starts; ends }
lineIndexAt(starts, pos): number
lineSpan(text, pos): [number, number]
lineEnding(text, end): LineEnding
dominantEnding(text): '\n' | '\r\n' | '\r'
advanceColumns(text, from, to, col): number
dropColumns(line, cols): string
skipSpaces(text, pos, limit, dir): number
isSpaceOrTab(c): boolean
```

Two groups, each named by what it works on (`…Changes`, `line…`, columns). The change functions
are today's, unrenamed.

**The coordinate contract** (r2), stated once at the top of `text.ts`: offsets are UTF-16 code
units, as in CM6; every change in an array refers to the text *before* the array is applied, and
changes don't overlap; `mapPos` takes a position in that text to the text after. Changes are the
plain arrays hosts already pass around.

`parser/` uses `lineIndexAt` and `isSpaceOrTab` instead of its own copies. `parser/chars.ts`'s
`isBlankChar` (which also takes line breaks) stays private to the parser.

### 4.2 `config.ts`

**Usage** (hosts, the spec runner):

```ts
const config = Config.of({ flavor: 'obsidian', outdent: 'logical' });   // the rest default
const set = Config.read({ outdent: 'sideways' });    // settings as strings, from a file's frontmatter
if (typeof set === 'string') report(set);            // 'option "outdent" takes direct, logical, not "sideways"'
```

```ts
interface Config { ... }                        // unchanged
const Config: {
  defaults: Config
  values: { [K in keyof Config]: readonly Config[K][] }
  of(partial?: Partial<Config>): Config
  read(settings: Record<string, string>): Partial<Config> | string    // today's readSettings
}
```

Today's `configOf`, `defaultConfig`, `configValues`, `readSettings`, `readConfig` become one
companion object; `readConfig` is `Config.of(Config.read(...))` at its two callers. `flavorOf` moves
into parsing as `Flavor.named(name)`, so `config.ts` no longer imports the parser.

### 4.3 `parser/` (today's `parsing/`)

**Usage** (a Markdown preview, syntax highlighting, the outline layer):

```ts
import { SyntaxTree, Flavor, renderHtml } from 'ourus';

let tree = SyntaxTree.parse(text, Flavor.gfm);
for (const block of tree.root.children) console.log(block.type, block.startLine, block.endLine);
const line = tree.lineAt(pos);                 // its prefix pieces (`>`, list markers), its leaf block
tree = tree.update(changes);                   // reads again only the lines the changes can affect
preview.innerHTML = renderHtml(tree);
```

Extension authors (a new flavor):

```ts
import { defineFlavor, gfmExtensions, type Extension } from 'ourus/extend';

const admonitions: Extension = { name: 'admonitions', blockStarts: [/* ... */], render: { /* ... */ } };
const mine = defineFlavor('mine', [...gfmExtensions, admonitions]);
```

The directory is renamed `parser/`, beside `encoder/` (the user): the two `-er` components that
turn text into structure and structure into changes. A pure rename, caught by the compiler; it
goes in step 1, with `test/parsing/` → `test/parser/`.

Its inside is untouched. Its external API, `parser/index.ts`:

```ts
class SyntaxTree { static parse(text, flavor, { sentinels }); update(changes, { sentinels });
                   root; lineCount; line(i); lines; markerFrom(item); markerTo(item);
                   inlines(block); inlineText(block) }
interface Flavor { name; has(extension);
                   startsBlock(text, inParagraph): boolean;        // new
                   readsAsReference(text): boolean }               // new
const Flavor: { commonmark; gfm; obsidian; named(name) }
function renderHtml(tree: SyntaxTree, options?): string
type Block, InlineNode, LineInfo, PrefixPiece, InlineText, ...  // the data it returns
```

- **Extension authors** import `parser/extend.ts` (`defineFlavor`, `Extension`, `BlockSpec`,
  `Machine`, `Frame`, the inline rule types, `HtmlRenderer`, ...). `package.json` gets
  `"./extend": "./src/parser/extend.ts"`.
- **`startsBlock` and `readsAsReference`** at first delegate to today's functions, so nothing
  changes; they close the one leak and are the seam for flavor-aware escaping (10-parsing.md
  §13.3).
- `preorder`/`postorder` move to `extend.ts`; nothing in `src/` outside the parser, nor the demo,
  uses them (only parser tests do).
- `renderHtml` stays a single function: one entry point is not a heap.
- **The renames** (`Syntax` → `SyntaxTree`, `Inline` → `InlineNode`)
  reach through every parser file. They're mechanical and compiler-checked, and go in step 7 with the
  other names, in a commit of their own.

### 4.4 `outline/`

**Usage** (hosts, commands):

```ts
import { OutlineState } from 'ourus';

let state = OutlineState.parse(text, { config: { flavor: 'obsidian' } });
for (const node of state.root.children) console.log(node.kind, state.headLines(node));  // an outline panel
const node = state.nodeAt(caret);           // the node whose own text holds the caret, or null
state = state.update(changes, { caret });   // the user typed: ids carried, an emptied node kept
state = state.replace(fileText);            // the file changed on disk: ids kept outside the changed lines
const home = state.homePosition(caret);     // Home: the text start, then the line start
```

```ts
class OutlineState {
  static parse(text, { placeholders?, config? }): OutlineState
  update(changes, { identity?, placeholders?, caret?, drop? }): OutlineState
  replace(text, params?): OutlineState            // the same, given the whole new text

  readonly text: string                      // the Markdown source
  readonly syntaxTree: SyntaxTree            // its parse: blocks, lines, inlines; updated incrementally
  readonly root: OutlineNode                 // the outline's root; its children are the top-level nodes
  readonly nodes: readonly OutlineNode[]     // every node in document order, root first
  readonly placeholders: readonly number[]   // empty lines read as if typed on: empty nodes the text
                                             // can't hold yet, kept while the caret is there
  readonly config: Config                    // how commands behave; every later snapshot keeps it

  // lines and positions
  line(i); lines; lineAt(pos); markerFrom(item); markerTo(item)
  textStart(pos); homePosition(pos)          // from commands.ts

  // nodes
  node(id); nodeAt(pos); nodeAtLine(line)
  before(node); after(node)                  // document order, O(1)
  prevSibling(node); nextSibling(node); lastDescendant(node)

  // a node's text
  headStart(node); headLines(node); headRange(node)
  nodeText(node)                             // what verification compares
  contentOf(node)                            // its lines, marker and gap as written
  isEmpty(node)                              // the one meaning of "empty"

  // facts about the document, computed once
  get usesTabs(): boolean
  get hasOrderedItems(): boolean
}
interface OutlineNode { ... }                // unchanged data
```

- **`update` and `replace`.** `SyntaxTree` and `OutlineState` are both immutable snapshots, and
  "the snapshot after these changes" is one verb on both: `update`, as CM6's `EditorState.update`
  (today `Syntax.update` and `OutlineDoc.apply` diverge). `replace(text)` takes the whole new text
  and computes the changes itself, so its different verb is right. `SyntaxTree` gets no `replace`
  until something calls it.
- **`homePosition` and `textStart` are methods,** not a `caret.ts` of free functions (r1 proposed
  that; rule 2 prefers the method). They are questions about one snapshot.
- **Navigation** replaces the `indexOf` scans; the constructor's node walk fills the index map.
- **`isEmpty`** replaces `isEmptyText`, `isEmptyItem`'s text test and a regex in `commands.ts`:
  `config.ts` says what "empty" means is an invariant, so it gets one definition.
- `blocks` goes from the API (it is `syntaxTree.root`); `syntax` is renamed `syntaxTree`.
- Internally: `identity.ts` (the id carrying in `apply`: `carriedIds`, `rankedKey`, `withinLines`),
  `placeholders.ts` (`isPlace`, `validPlaces`).

About twenty methods, all questions about one snapshot. Splitting them over helper objects
(`state.positions.lineAt`) would add names without removing a concept.

### 4.5 `encoder/`

**Usage** (command authors; hosts don't call it):

```ts
// a structural command: the operands become the last children of the item above
const plan = OutlinePlan.from(state).remove(ops.nodes).append(ops.prev, 'last', ops.nodes);
const encoded = new OutlineEncoder(state).encode(plan);   // EncodeResult, or why it can't be written
if (typeof encoded === 'string') return reject('not-expressible', encoded);
// encoded.changes are a candidate, not yet verified: the command runner checks them (r2)

// a hand-written local edit: a new item after `item`
const enc = new OutlineEncoder(state);
const insert = eol + enc.siblingPrefix(item) + enc.markerText(item, true) + ' ';
```

The layer that knows how Markdown is written: whole layouts for structural edits, and the pieces
hand-written edits need. Two classes.

```ts
class OutlinePlan {                     // immutable; the whole outline as a command wants it
  static from(state: OutlineState): OutlinePlan       // starts equal to the current outline
  readonly root: OutlineNode | OutlinePlanNode
  get changed(): boolean
  update(node, change: (n: OutlinePlanNode) => OutlinePlanNode): OutlinePlan   // today's editNode
  setText(node, text: string, lines?: readonly string[]): OutlinePlan
  remove(nodes): OutlinePlan                         // finds their parent itself
  place(where: 'before' | 'after' | 'instead', sibling, nodes): OutlinePlan
  append(parent, where: 'first' | 'last', nodes): OutlinePlan
  differenceFrom(actual: OutlineState, current: OutlineState, compare: 'tree' | 'flat'): string | null
  static created(kind, text, extra?): OutlinePlanNode
  static copy(state: OutlineState, node: OutlineNode): OutlinePlanNode
}
interface OutlinePlanNode { ... }              // today's EditedOutlineNode; its `from` is `original`

class OutlineEncoder {                                  // one per document
  constructor(state: OutlineState)
  encode(plan: OutlinePlan, options?: { separate?; pad? }): EncodeResult | string
  renumber(changes: readonly ChangeSpec[], plan: OutlinePlan): ChangeSpec[] | null

  // what hand-written edits write
  siblingPrefix(node): string                          // the text before a new sibling's marker
  childIndent(node, child): string
  continuation(line): string                           // a new line in the containers `line` is in
  markerText(node, next: boolean): string
  escape(text: string, at: 'first' | 'continuation' | 'afterMarker'): { text: string; at: number | null }
}
interface EncodeResult { changes; map(pos, assoc?); at(node, line, offset); identity; candidates }
```

- **One home for encoding knowledge** (r1§4): layouts, prefixes, markers, renumbering and escapes.
  The encoder computes prefixes for the *new* tree (`linePrefix`); `siblingPrefix` and friends read
  the *old* text. Both sit in `prefix.ts`, so prefix rules live in one file.
- **`escape`** replaces the ten copies of the line-start escape. The three cases are the three
  variants in the code today: a line starting a node's text, a continuation line (block starts
  that interrupt a paragraph, setext underlines), and text right after a marker. It asks
  `flavor.startsBlock`/`readsAsReference`, so making escapes flavor-aware later changes one file.
  That later change alters behavior (Obsidian commands refused today would escape instead), so
  it is not part of this refactor; it comes after, with its changed outcomes stated.
- **`renumber`** moves here: rewriting markers and the lines a wider marker shifts is encoding.
  Commands no longer import `reindent` or `usesTabs`.
- **`from`, not `of`** (the user's question). JS uses `Array.from(x)` to convert another object,
  and `Array.of(...items)` to build one from its parts; CM6 uses `of` the second way too
  (`Text.of(lines)`, `ChangeSet.of(changes, length)`). A `OutlinePlan` is converted from the
  current outline, so `from`. `Config.of(partial)` builds a config from settings, so it keeps `of`. That's also why `OutlinePlanNode.from` becomes
  `original`: `from` would otherwise mean an offset, a constructor and an old node.
- **Why classes:** `OutlinePlan` holds the tree being edited and replaces the inside-out calls;
  `remove` taking nodes drops 31 `parent!.id` arguments and the mistake of removing from a stale
  parent. `OutlineEncoder` holds per-document state (units, tab style, line ending) that `encode`
  needs on every one of the up to `candidates + 2` tries for one command, which recomputes it all
  today.
- **Cheap to make** (r2): constructing an `OutlineEncoder` computes nothing. The layout inputs
  (units, tab style) are computed the first time `encode` needs them, so a local command that only
  asks for a prefix doesn't pay for laying out the document.
- Internally: `layout.ts` (placed tree, columns, markers), `lines.ts`, `seams.ts` (blank lines
  between nodes), `changes.ts` (output lines to changes, the heaviest kept run), `indent.ts`
  (`reindent`, tab detection), `prefix.ts`, `escapes.ts`, `renumber.ts`.

What a command reads like with it:

```ts
// today
return written(doc, place(remove(doc.outline, parent.id, run), parent.parent!.id, parent.id, 'after', run), sel);
// after
return ctx.encode(ctx.plan.remove(run.nodes).place('after', parent, run.nodes));
```

### 4.6 `commands/`

**Usage** (hosts):

```ts
import { executeCommand, settlePlaceholders } from 'ourus';

const result = executeCommand(state, { type: 'indent' }, { anchor, head });
if (result.status === 'applied') {
  view.dispatch({ changes: result.changes, selection: result.selection });   // ChangeSpec, as CM6 takes
  state = result.state;
} else if (result.status === 'rejected') {
  status.textContent = result.reason;      // 'no-previous-sibling', 'not-expressible', ...
}                                          // 'notApplicable': let the editor do its default

const settled = settlePlaceholders(state, caret);   // the caret moved: placeholders it left are settled
if (settled) { view.dispatch({ changes: settled.changes }); state = settled.state; }
```

**External API:** two functions and their types. That's the whole surface, and a pair this small
reads better as functions than as a class with no state.

```ts
function executeCommand(state: OutlineState, command: Command, selection: Selection): CommandResult
function settlePlaceholders(state: OutlineState, caret: number): { changes: ChangeSpec[]; state: OutlineState } | null
type Command, Selection, CommandResult, RejectReason   // today's Result; an applied one's `doc` is `state`
```

**Considered: a collection of command functions, as CodeMirror does it.** The user asked. CM6's
`@codemirror/commands` exports about a hundred commands, all of one type (`StateCommand =
({ state, dispatch }) => boolean`, or `Command = (view) => boolean`), named verb-first by effect:
`indentMore`, `indentLess`, `moveLineUp`, `insertNewlineAndIndent`, `deleteCharBackward`,
`deleteLineBoundaryBackward`, bundled into `defaultKeymap`; `@codemirror/lang-markdown` adds
`insertNewlineContinueMarkup` and `deleteMarkupBackward`. Returning `false` means "not mine, try
the next binding", which is our `notApplicable`. The ourus version would be
`type CommandFn = (doc, selection) => CommandResult` with `indent`, `outdent`, ..., and
`pasteStructured(text)` returning one.

I'd keep `executeCommand` and the `Command` union as the core API, for three reasons:

- **Commands are data in ourus.** Spec files, the player and the Logseq runner name them (W3C
  `inputType` names), and the union is that data, typed and checked exhaustively. With function
  constants they'd need a name → function table anyway.
- **One place runs every command:** plan, verify, retry, diagnose refusals. With constants each
  would wrap that same runner.
- **CM6's shape fits a host, not a pure core.** CM6 commands dispatch to editor state and return a
  boolean; ourus commands are pure and return a `CommandResult`. The CM6-shaped commands belong in the
  host adapter (the demo already turns each ourus command into a CM6 one), which is where
  CodeMirror keeps its own: commands live in a package apart from its state core.

r1 proposes exporting the per-command functions *as well*, with `executeCommand` dispatching over them,
as CM6 has both its commands and `defaultKeymap`. r2 and I would not add a second equivalent
dispatch style now: it doubles the public surface without a caller that needs it, and it can be
added later without changing anything else (each family file already exports its planners). If a
host wants to bind keys to individual commands, that's the moment. The user decides.

What we take from CM6 is its vocabulary, where it fits (§4.0): `mapPos`, `anchor`/`head`, the
`from`/`to`/`insert` fields, verb-first names (`moveSubtreeUp` beside CM6's `moveLineUp`;
`deleteContentBackward` is W3C's `inputType`). One clash to note: CM6's `Command` is a function,
ours is a value. Renaming ours would churn every spec and test for a small gain, so it stays.

**Inside** (the user won't maintain it, but this is where the readability gain is):

- **`CommandContext`**, one per `executeCommand`/`settlePlaceholders`: the document, the selection, the node and line
  at it, the line ending, a lazily made `OutlineEncoder`, `plan` (an `OutlinePlan` of the
  document), and the two result builders: `caret(changes, caret, plan)` for the 26 literals
  and `encode(plan, options?, select?)` for today's `written()`. `ctx.encode` is not a second
  encoder: it calls `OutlineEncoder.encode` (once per blank-line alternative) and wraps each
  `EncodeResult` into a `CommandPlan`, adding the expected `OutlinePlan` and the selection mapped
  through `map` (r2). So: the encoder returns candidate changes, `ctx.encode` makes them command
  candidates, and the runner verifies them (§4.8). Command functions take `ctx`:
  `splitParagraph(doc, node, line, selFrom, selTo)` becomes `splitParagraph(ctx, node)`. A helper
  goes on `CommandContext` only if it needs the document or selection *and* more than one command
  file uses it; otherwise it stays in its file.
- **`Operands`**: the contiguous siblings a structural command acts on (`first`, `last`,
  `parent`, `prev`, `next`, `kind`, `mixed`), replacing the lines every structural command opens
  with. (Revision 1 called it `Run`, which clashes with the `run()` function that executes plans.)
- **`plan.ts`**: `CommandPlan`, verification with the caret-placeholder retry, trying alternatives, and the
  refusal diagnosis that turns some `encoding-failed` into `not-expressible`
  (`emptyAwayFromCaret`, `indentedCodeAfterItem`). Those reason about outline shape, which is why
  verification stays with the commands rather than behind the encoder (r-chat Q3; r1 calls this
  file `guard.ts`, but "guard" already names the parked raw-edit guard.
  Alternatives become a lazy list (a generator) instead of a closure chain, which removes
  `fallback` and `withPlan`.
- **Command files** by the table below. `structure.ts` is the lower layer; the boundary test
  checks nothing in it imports `enter.ts`, `join.ts` or `paste.ts`.

| File | From `commands.ts` |
| --- | --- |
| `structure.ts` | `indent`, `outdent`, `indentParagraphs`, `leaveQuote`, `converted`, `convertedSelection`, `headingLevel`, `move`, `canHold`, `deleteSubtree`, `duplicate` |
| `enter.ts` | `split` (its item cases as functions of their own), `cutText`, `splitParagraph`, `splitHeading`, `splitSetext`, `splitCalloutTitle`, `blankLineAbove`, `insertBefore`, `leaveItem`, `leaveQuoteEmpty`, `lineBreak` |
| `join.ts` | `join`, `joinForward`, `joined`, `joinChanges`, `joinParagraph`, `joinParagraphAfterGap`, `unwrapHeading`, `joinHeading`, `gapBelowHeading`, `deleteGap`, `deleteToTextStart` |
| `code.ts` | `fenceNewline`, `codeEdit`, `joinCodeLines`, `enterAfterFence` |
| `paste.ts` | `paste`, `fitPaste`, `pasteSplit`, `pastePlain` |
| `settle.ts` | `settle` (exported as `settlePlaceholders`), `keptApart` |
| `plan.ts` | `run`, `verify`, `difference`, `written`, `withPlan`, `emptyAwayFromCaret`, `indentedCodeAfterItem` |
| `context.ts` | `operands`, `gapOwner`, `removeLines`, `blankInQuote`, `followsParentText`, `isCodeLine`, `isClosingFence`, `mapSelection` |
| elsewhere | `renumber` → encoder; `siblingPrefix`, `childIndent`, `continuationText`, `markerText`, `encodeRest` and the escapes → encoder; `nodeText`, `isEmpty*`, `textStart`, `homePosition`, `lastDescendant`, `hasOrderedItems` → `OutlineState`; `created`, `withText`, `remove`, `place`, `append` → `OutlinePlan`; `lineSpan`, `dropColumns`, `isBlankChar` → `text.ts` |

On granularity (r1 proposed one `editing.ts` of ~850 lines): Enter and the joins share almost
nothing once the shared helpers sit on `CommandContext` and the encoder, each is ~400 lines, and they
are where the churn lands. Two files of 400 lines read better than one of 850. `code.ts` holds the
fenced-code cases both of them dispatch to.

### 4.7 `index.ts`

**Usage:** the whole of a CodeMirror 6 host, in outline (the demo does this, plus paste, history
and panels):

```ts
import { StateField } from '@codemirror/state';
import { keymap, type EditorView } from '@codemirror/view';
import { OutlineState, executeCommand, type Command, type ChangeSpec } from 'ourus';

const outline = StateField.define<OutlineState>({
  create: (s) => OutlineState.parse(s.doc.toString(), { config: { flavor: 'obsidian' } }),
  update(state, tr) {
    if (!tr.docChanged) return state;
    const changes: ChangeSpec[] = [];
    tr.changes.iterChanges((from, to, _a, _b, text) => changes.push({ from, to, insert: text.toString() }));
    const sel = tr.newSelection.main;
    return state.update(changes, sel.empty ? { caret: sel.head } : {});
  },
});

const run = (command: Command) => (view: EditorView): boolean => {
  const result = executeCommand(view.state.field(outline), command, view.state.selection.main);
  if (result.status === 'notApplicable') return false;
  if (result.status === 'applied') view.dispatch({ changes: result.changes, selection: result.selection });
  return true;
};

const keys = keymap.of([{ key: 'Tab', run: run({ type: 'indent' }) }, { key: 'Enter', run: run({ type: 'enter' }) }]);
```

CM6's `selection.main` has `anchor` and `head`, so it is an ourus `Selection` as it is, just as an
ourus `ChangeSpec` is a CM6 one.

What the package exports:

```ts
export { OutlineState, type OutlineNode, type OutlineKind } from './outline/index.ts';
export { executeCommand, settlePlaceholders, type Command, type CommandResult, type Selection, type RejectReason } from './commands/index.ts';
export { Config } from './config.ts';
export { applyChanges, invertChanges, mapPos, type ChangeSpec } from './text.ts';
export { SyntaxTree, Flavor, renderHtml, type Block, type InlineNode, type LineInfo } from './parser/index.ts';
```

What a host needs: `OutlineState`, `executeCommand`, `settlePlaceholders`, `Config`, and `mapPos`/`applyChanges` for the
changes it gets back; plus the parser for rendering and extension. The demo changes in a few
places: `OutlineDoc` becomes `OutlineState` and `result.doc` becomes `result.state`,
`homePosition(doc, pos)` and `textStart(doc, pos)` become methods, `Config` replaces `configOf`,
and `doc.syntax` becomes `syntaxTree`.

### 4.8 End to end: one Tab press, through every layer

The user asked for a bigger example: what each layer does with the API of the one below it. Here is
Tab on a list item, from the key to the commit, as the code will read after the restructuring.
Simplified where marked: renumbering, the caret-placeholder retry and the blank-line alternatives
are in the real runner, and left out here.

```ts
// ── host: demo/cm6 ──────────────────────────────────────────────────────────────────
// The editor holds an OutlineState in a StateField (§4.7). Tab runs a command; ourus answers
// with a CommandResult, and only the host commits anything.
function runCommand(command: Command) {
  return (view: EditorView): boolean => {
    const state = view.state.field(outline);
    const result = executeCommand(state, command, view.state.selection.main);
    if (result.status === 'notApplicable') return false;               // CodeMirror's own Tab
    if (result.status === 'rejected') { showStatus(result.reason); return true; }
    view.dispatch({
      changes: result.changes,                // ChangeSpec[]: CM6 takes them as they are
      selection: result.selection,
      effects: setOutline.of(result.state),   // the verified snapshot: no second parse
    });
    return true;
  };
}
keymap.of([{ key: 'Tab', run: runCommand({ type: 'indent' }) }]);

// ── commands/index.ts: the entry point ──────────────────────────────────────────────
export function executeCommand(state: OutlineState, command: Command, selection: Selection): CommandResult {
  const ctx = new CommandContext(state, selection);
  const outcome = planCommand(ctx, command);        // a switch on command.type, into the family files
  return 'status' in outcome ? outcome : run(ctx, outcome);   // rejected or notApplicable; else verify
}

// ── commands/structure.ts: what Tab means ───────────────────────────────────────────
// The command decides *what* the outline should become, in outline terms. It never computes
// a column, a prefix or a marker.
function indent(ctx: CommandContext, ops: Operands): Outcome {
  if (!ops.prev) return reject('no-previous-sibling');
  if (ops.prev.kind !== 'item' && ops.prev.kind !== 'quote') {
    return reject('not-expressible', 'only a list item can hold list items');
  }
  // the operands become the last children of the node above: an OutlinePlan
  return ctx.encode(ctx.plan.remove(ops.nodes).append(ops.prev, 'last', ops.nodes));
}

// ── commands/context.ts: from an outline plan to a command candidate ───────────────
class CommandContext {
  constructor(readonly state: OutlineState, readonly sel: Selection) {}
  readonly plan = OutlinePlan.from(this.state);     // equal to the current outline; edits copy paths
  get encoder(): OutlineEncoder { return (this.#encoder ??= new OutlineEncoder(this.state)); }

  encode(plan: OutlinePlan): Outcome {
    const encoded = this.encoder.encode(plan);      // encoder/: *how* it is written in Markdown
    if (typeof encoded === 'string') return reject('not-expressible', encoded);
    return {                                        // a CommandPlan: one candidate
      changes: encoded.changes,
      selection: { anchor: encoded.map(this.sel.anchor, 1), head: encoded.map(this.sel.head, 1) },
      expected: plan,
      identity: encoded.identity,                   // moved nodes keep their ids
      compare: 'tree',
    };                                             // (+ alternatives with blank lines at new seams)
  }
}

// ── encoder/: inside OutlineEncoder.encode (internal) ───────────────────────────────
// Lays out the plan: each old node keeps its lines, shifted to its new column (an item under
// the item above moves to that item's content column, its continuation lines with it); its
// marker adopts the list it joins; blank lines follow the gap rules. The changes keep every
// line that didn't move in place, so a move is written as a move.

// ── commands/plan.ts: the runner verifies ───────────────────────────────────────────
function run(ctx: CommandContext, candidate: CommandPlan): CommandResult {
  const next = ctx.state.update(candidate.changes, { identity: candidate.identity });   // outline/ + parser/
  const mismatch = candidate.expected.differenceFrom(next, ctx.state, candidate.compare);
  if (mismatch === null) {
    return { status: 'applied', state: next, changes: candidate.changes, selection: candidate.selection };
  }
  // (+ renumbering, the caret-placeholder retry, the next alternative, refusal diagnosis)
  return { status: 'rejected', reason: 'encoding-failed', detail: mismatch };
}
```

Who knows what:

| Layer | Knows | Doesn't know |
| --- | --- | --- |
| host | keys, CM6, when to commit | outlines, Markdown |
| `commands/` | what Tab means: which node goes where, when to refuse | columns, prefixes, markers, blank lines |
| `encoder/` | how an outline is written: columns, prefixes, markers, gaps | why the outline changed |
| `outline/` | what the text means as an outline; ids across edits | commands |
| `parser/` | what the text means as Markdown | outlines |

**A hand-written local edit** takes the other path (principle 6): the command makes the changes
itself, using the encoder's pieces, and the same runner verifies them. Shift-Enter in the middle of
a paragraph, simplified (the real one also handles a break at a line's start, an empty line, and
code):

```ts
// commands/enter.ts
function lineBreak(ctx: CommandContext): Outcome {
  const { node, line, state } = ctx;
  if (!node || node.head?.type !== 'paragraph') return notApplicable;     // the host's newline
  const from = ctx.skipSpaces(ctx.from, line.contentFrom, -1);           // spaces at the break go
  const to = ctx.skipSpaces(ctx.to, line.to, 1);
  // the new line starts in the node's containers (a quote's `>`, an item's indentation), and its
  // text is escaped where it would start a block (`- x` would become a list item)
  const prefix = ctx.encoder.continuation(line);
  const rest = ctx.encoder.escape(state.text.slice(to, line.to), 'continuation');
  const changes = [{ from, to, insert: ctx.eol + prefix + rest.text }, { from: to, to: line.to, insert: '' }];
  // the outline stays as it is; only the node's text gains a line break
  const text = [...linesBefore, textBeforeCaret, rest.text, ...linesAfter];   // from state.headLines(node)
  return ctx.caret(changes, from + ctx.eol.length + prefix.length, ctx.plan.setText(node, text));
}
```

`ctx.caret(changes, caret, plan)` is the `CommandPlan` literal written 26 times in today's code.
From there, `run` verifies it exactly as it verified Tab.

## 5. Tests

- **Extend the differential first** (from r2). Existing tests already check ids and some
  placeholder and history behavior, so this audits and adds to them rather than starting over.
  The gap is the differential: `test/differential.ts` compares only status, reason and resulting
  text, under the default (CommonMark) config, with collapsed carets. A refactor must
  also keep the **selection, node ids and placeholders** of every applied result, the result of
  **`settlePlaceholders`** afterwards, and hold in **all three flavors and every config option**, with
  **non-empty selections**. All of these go in before any code moves; for this work the expected
  report is empty.
- **Contract tests for the host lifecycle** (r2, and r1's Q1 answer): sequences of edit, settle,
  undo and redo over a document and selection, checking selection, ids and placeholders. They go
  through the player in `test/`, not a new component.
- **The boundary test**: every `src/**/*.ts` import goes through a component's entry and down the
  layer order; nothing in `commands/structure.ts` imports another command file. It starts with
  today's violations as an allow-list that may only shrink.
- **Tests follow the components.** `test/outline.test.ts`, which imports `editNode` and
  `outlineDifference`, becomes a test of `OutlinePlan`.
- **Speed:** `npm run bench` before and after each step. One encoder per command, made once, should
  make commands slightly faster; nothing should be slower.

## 6. Not doing

- **No `session/` component and no CM6 adapter in `src/`** (r2). The demo's `StateField` is the
  session, at about 40 lines; owning state in ourus would give up the pure snapshot-and-function
  testing. The lifecycle gets contract tests instead (§5), and how `apply`, `settle` and history
  restoration compose is documented next to them. If the player and the demo turn out to
  drift, a small shared helper can follow then.
- **No parser-free outline nodes, and no `realize()` owning local edits** (r2; principles 5 and 6).
- **No `rendering/` split from `parser/`.** Render rules ride on `Extension`; splitting would cut
  every extension in two for no current gain.
- **No narrow doc interfaces per consumer** (r1's `WriterDoc`) for now. The encoder uses about a
  dozen `OutlineState` members, so its slice would be most of the class, and tests build real
  documents from strings as cheaply as fakes. Revisit if a consumer starts reaching into
  `doc.syntax` where it shouldn't.
- **No class per command, no base class for families, no command registry.** A union and a
  `switch` is the simplest dispatch, and the compiler checks it.
- **No changes inside `parser/`** beyond its exports, two `Flavor` methods and the shared line
  index. 10-parsing.md §13's bets are separate projects.
- **No packages or workspaces.**

## 7. Steps

Each step is one commit or a few, with `npm test`, `npm run typecheck`, `npm run bench` and an empty
extended differential before the next. The order is r1's (r-chat): the command bodies are where
the churn is, and `CommandContext` is what makes them short, so it comes right after `OutlinePlan`
(which `ctx.plan` returns) and before the file split, which then yields small files. The encoder
and outline moves follow; the prefix, marker and escape helpers sit on `CommandContext` until the
encoder step moves them into `OutlineEncoder`, one small second move (r2 accepted either order).

| # | Step | Notes |
| --- | --- | --- |
| 0 | **Extend the differential** and add the lifecycle contract tests (§5) | the safety net |
| 1 | **Boundaries**: rename `parsing/` → `parser/`; boundary test with allow-list; trim `parser/index.ts`, add `extend.ts`; `Flavor.startsBlock`/`readsAsReference`/`named` delegating; merge the duplicates into `text.ts` | small; no logic change |
| 2 | **`OutlinePlan`** from `outline-editor.ts` and the helpers in `commands.ts` | mechanical; `ctx.plan` needs it |
| 3 | **`CommandContext` and `Operands`** inside the still-whole `commands.ts`; remove the repeated literals | several commits; most of the readability gain |
| 4 | **Split `commands.ts`** by the table in §4.6; fix the two misplaced doc comments | pure moves |
| 5 | **`encoder/`**: `OutlineEncoder` class; `renumber`, prefixes and markers move in from `CommandContext`; then escapes, in a commit of their own with a larger differential run | commands stop importing writer internals |
| 6 | **`outline/`**: `doc.ts`, `outline.ts`, the node-text queries, navigation, `isEmpty`, `homePosition`/`textStart` | |
| 7 | **Names** (§4.0), each rename its own commit; `Config` and `index.ts` in their final shape; update the demo | the API the user reviews |
| 8 | **Close the boundary**: empty the allow-list; update README's "What's here" | |

Every step leaves a tree that could ship; stopping after step 4 already pays for most of it (the command bodies are short and split).

## 8. Risks

- **Merge pain** in steps 2, 4 and 5, which move a lot of code: do them with nothing else in
  flight, keep moves separate from edits (`git diff --color-moved`).
- **The escape consolidation** turns three slightly different rules into one parameter. If the
  differential finds a difference there, it's a behavior question for the spec.
- **`CommandContext` as a grab bag**: kept in check by its rule (§4.6).
- **`OutlineEncoder` growing**: it gains the prefix, marker and escape queries. They are all "how
  Markdown is written in this document", which is the encoder's job; if it passes ~10 public
  methods, split the hand-written-edit helpers into a second class in `encoder/`.

## 9. The result

- Four layers, each with an API of one or two classes: `SyntaxTree`/`Flavor`, `OutlineState`,
  `OutlinePlan`/`OutlineEncoder`, `execute`/`settle`; `text.ts` a small library of edit and line
  functions.
- `commands.ts` (2,335 lines, 80 functions) becomes files of at most ~450 lines, reading
  `ctx.planned.remove(...).append(...)` instead of rebuilding context and plan literals.
- Encoding knowledge (layouts, prefixes, markers, numbers, escapes) lives in `encoder/`; commands
  say what they want and, for local edits, which text changes, using the encoder's pieces.
- Nothing crosses a boundary except through an entry, and a test keeps it that way.

## 10. Decided

**By the user:** `OutlineState`, `root`, `parser/`, `OutlinePlan` (with private `CommandPlan`),
`OutlineEncoder`/`encode`/`EncodeResult`, `ChangeSpec`, `SyntaxTree`, `CommandResult`,
`executeCommand`, `settlePlaceholders`, the `commands/` layout, and this document as the plan.

**By r1, r2 and r3:**

- The four layers `text ← parser ← outline ← encoder ← commands` (with `config` beside `outline`),
  one entry per component, `commands/structure.ts` below the other command files, and a boundary
  test with a shrinking allow-list.
- The parser unchanged inside, with a public API and `parser/extend.ts`; `Flavor.startsBlock` and
  `readsAsReference` closing its one leak.
- Outline nodes keep their `Block`s and sharing; local edits stay hand-written; verification and
  refusal diagnosis in `commands/plan.ts`; shared encoding in `encoder/`, family-specific encoding
  with its command family.
- Not doing: session, adapters in `src/`, Markdown bridge, `realize()`, `rendering/` split,
  per-command exports, packages, per-consumer doc interfaces.
- Steps 0–8 (§7), with the extended differential first.
- Names: `InlineNode` (`Block` stays), `update(changes)` and `replace(text)`,
  `OutlinePlan.from(state)`, `ctx.encode`; `text.ts` as functions with today's change names.

**Left open, and how it was settled in the implementation:** the planned node's name. The user
didn't choose among `OutlinePlanNode` (r3), `OutlineNodePlanned` (user, r2) and `PlanNode` (r1);
the code uses **`OutlinePlanNode`**, the recommendation. It is one type name, so changing it later
is a one-line rename at the export plus a mechanical replace.

## 11. Implementation log

Each step: `npm test` (576 pass, 8 pending, as before), `npm run typecheck`, and the extended
differential against the original code (`HEAD`), which must report no differences.

### Step 0: the safety net

- **The differential compares what a host sees.** `test/differential.ts` compared status, reason
  and text, in CommonMark only, with carets only. It now also compares the selection, the node
  ids and the placeholders of every applied result; what `settle` does afterwards (at the caret,
  and with the caret moved away); and a short host lifecycle: typing at the caret, settling, and
  undoing to the text before the command with its placeholders, as the player and the demo do.
  Documents cycle through all three flavors and every non-default config option; besides carets,
  every line gets a selection inside its text and some a selection into the next line; all 13
  commands run, with six clipboards. It loads both copies through `src/index.ts` with an adapter
  for the names, so it works across every renaming step, and exits non-zero on any difference.
- **Checked that it catches things:** a one-line change to id numbering in a copy of `src/` showed
  as 178 differing outcomes over 60 documents.
- **Lifecycle coverage, audited:** the spec suite already plays edit, settle, undo and redo through
  the player and checks text, selection and placeholders (`spec/undo.md`, `spec/placeholders.md`);
  `test/commands.test.ts` checks ids. What was missing was ids across a lifecycle and any
  comparison of old with new over sequences; the differential's lifecycle steps add both, rather
  than a separate test file.
- Cost: ~111,000 command runs over 300 documents in 5 s; the default 1,500 documents in ~25 s.
- The differential also compares **the change lists** a host receives, not only the text they
  produce: a refactoring must keep those identical too (the same text reached by other changes is a
  behavior change: a move no longer written as a move).

### Step 1: boundaries

- **`parsing/` → `parser/`**, and `test/parsing/` → `test/parser/`; imports, `package.json`'s test
  glob and the tools' paths follow. Pure rename.
- **The duplicates merged into `text.ts`:** one `lineIndexAt(starts, pos)` (the parser's private
  copy and `doc.ts`'s `{ starts, ends: [] }` workaround both gone), `lineSpan` (also replacing
  `doc.ts`'s `lineEndAt`), `isSpaceOrTab` (replacing `isBlankChar` in commands and `isSpace` in the
  snapshot; `parser/chars.ts` re-exports it), `dropColumns`, and `diffText` (the writer's private
  `difference`). The writer's `applyLocal` is `applyChanges`, and its `contentStart(line)` is
  `line.contentFrom`.
- **Checked, not assumed, that the "duplicates" were identical:** `contentStart` and `contentFrom`
  are both the end of the last prefix piece; `difference` and `wholeDiff` are the same loop.
  `applyLocal` sorted by `from` only, where `applyChanges` normalizes (sorts by `from` and `to`,
  rejects overlaps, drops empty changes); the writer's per-line changes (a reindent, then a marker
  after the whitespace) never overlap and keep their order, and the differential agrees.
  One near-duplicate kept its edge case on purpose: `composeChanges` returns one empty change when
  two change sets cancel out, where `diffText` returns none; it now calls the private `spanDiff`
  that keeps that.
- **The parser's leak is closed.** `Flavor` has `startsBlock(text, inParagraph)` and
  `readsAsReference(text)`, delegating to the CommonMark functions as before; `commands.ts` asks
  `doc.syntax.flavor` instead of importing `parser/blocks.ts` and `parser/refs.ts`.
- **`Flavor.named(name)`** replaces `config.ts`'s `flavorOf`, which no longer imports the parser.
  `Flavor` is one export that is both the type and its companion object (`Flavor.gfm`,
  `Flavor.named('obsidian')`): TypeScript allows a type and a value of one name in a module.
- **The parser's public entry is trimmed** to `Syntax`, `Flavor`, `renderHtml` and the data types;
  everything for extension authors is in `parser/extend.ts`, which `package.json` exports as
  `ourus/extend`. Other components now import `parser/index.ts` only (they reached
  `parser/types.ts`, `parser/syntax.ts` and `parser/flavors.ts` before).
- **The boundary test** (`test/boundaries.test.ts`) checks every import in `src/`: down the layers,
  into another component only through its entry, and nothing in `commands/structure.ts` importing
  another family. Probed with two deliberate violations, which it reports. **Finding: its allow-list
  starts empty.** Once the parser's leak was closed and the type imports went through
  `parser/index.ts`, nothing in `src/` broke a rule: the layering was already right (r1's finding
  from the import graph), and the work is inside the layers. Tests may import a component's
  internals (the parser's own tests do); the rule covers `src/`.
- Tests: 577 pass (the boundary test is new), 8 pending; typecheck clean; differential: no
  differences over 562,120 command runs.

### Step 2: `OutlinePlan`

- **`src/encoder/outline-plan.ts`**: the `OutlinePlan` class (immutable: `from(state)`, `update`,
  `setText`, `remove`, `place`, `append`, `withOwnedLists`, `differenceFrom`, `changed`, and the
  statics `created`, `copy`, `editable`, `isPlanned`), `OutlinePlanNode` (today's
  `EditedOutlineNode`, its `from` renamed `original`) and `PlanTree` (a node of a plan: a current
  `OutlineNode` or an `OutlinePlanNode`). Made from the first third of `outline-editor.ts` and the
  five edit helpers of `commands.ts`. `encoder/index.ts` exports them; the writer stays in
  `outline-editor.ts` until step 5.
- **The ~140 call sites were converted by a script**, which parsed each helper call with balanced
  arguments and rewrote it as a method on the plan, innermost first:
  `place(remove(doc.outline, parent.id, run), parent.parent!.id, parent.id, 'after', run)` became
  `OutlinePlan.from(doc).remove(run).place('after', parent, run)`. **Finding: every id argument was
  `node.id`**, never an id from elsewhere, so the methods take nodes, which is what the code meant
  all along; the one helper that took a bare id (`joined`) now takes the node.
- **`remove(nodes)` and `place(where, sibling, nodes)` find the parent themselves** (the node whose
  children hold the given one), where the helpers took a parent id. Equivalent at every call site:
  a command removes before it adds, so the node's parent in the plan is still its current parent.
  The differential agrees. This drops the 31 `node.parent!.id` arguments' role in the edits.
- **Verification moved with the type:** `differenceFrom(actual, current, 'tree' | 'flat')` is
  today's `difference`, `outlineDifference` and `nodeDifference`, private now. `settle` and
  `keptApart` compared two outlines raw; they now go through `differenceFrom`, which first regroups
  owned lists. That is the identity on an outline the parser built (it already groups them), and
  the differential, which compares `settle`'s results, agrees.
- **`OutlineDoc.nodeText(node)`** moved from `commands.ts` (step 5 had it): verification needs it,
  and it is a question about the snapshot. `normText`, which commands use to build planned text,
  stays a one-liner in `commands.ts`; it and `nodeText` must agree, and any drift fails every test.
- `test/outline.test.ts` now tests the plan's API, with new cases for `remove`, `place` and
  `append`. An unused `OutlinePlan.of` was dropped: no API without a caller.
- **The boundary test caught a shortcut** the moment it was taken: `commands.ts` importing
  `encoder/outline-plan.ts` instead of `encoder/index.ts`.
- Tests: 577 pass, 8 pending; typecheck clean; differential: no differences.

### Step 3: `CommandContext` and `Operands`

- **`CommandContext`** holds the document and the selection, and what nearly every command needs:
  `from`, `to`, `collapsed`, `eol` (computed once per command, where `dominantEnding` scanned the
  whole text at each of up to 17 call sites), `ending(line)`, `plan` (the current outline as an
  `OutlinePlan`), `with(selection)` and `at(pos)` (the same document, another selection), and the
  two result builders: `caret(changes, caret, plan, extra?)` and `encode(plan, options?, select?)`
  (today's `written()`, now a method).
- **The signatures, by script.** 60 functions changed from `(doc, ..., sel)` to `(ctx, ...)`:
  `doc` became `ctx`, and a `sel` or `selection` parameter disappeared in favour of `ctx.sel`. A
  call that passed a selection other than the function's own now says so with `ctx.at(pos)` or
  `ctx.with(selection)`. There were seven; three of them passed a selection to `written()` that it
  never read (a `select` callback chose the selection), so they went. `execute` and `settle` make
  the context; the public `homePosition` and `textStart`, and `hasOrderedItems`, kept theirs.
- **The literals, by script:** 35 hand-written plan literals are `ctx.caret(...)` (the 26 counted
  in §1 missed those with extra fields: placeholders, identity, a `flat` comparison, which are now
  its `extra`); 16 `line.ending || dominantEnding(doc.text)` are `ctx.ending(line)`; 21
  spaces-and-tabs loops are `skipSpaces(text, pos, limit, dir)`, new in `text.ts` with the loops'
  exact semantics in each direction.
- **`Operands`** (`nodes`, `first`, `last`, `parent`, `kind`, `mixed`, `prev`, `next`) replaces the
  arrays the eight structural commands took, and the lines each opened with
  (`run[0]!.parent!`, `parent.children[parent.children.indexOf(run[0]!) - 1]`). `move` replaces its
  operands with their quote when they are all of it, as before.
- **Two slips the compiler caught**, both from regexes that didn't know enough JavaScript: the
  splitter took the `>` of `=>` for a closing bracket, and the rename of `run` skipped `...run`, which
  then named the function `run()`. Neither reached a test. **Lesson:** a script over code needs the
  compiler right after it; the differential then catches what types can't.
- **Kept for later steps:** the prefix, marker and escape helpers are functions taking `ctx` until
  step 5 moves them into the encoder; the helpers that ask about lines (`isCodeLine`,
  `blankInQuote`, ...) become context methods when step 4 moves the class to `context.ts`. A
  destructure `const { doc } = ctx;` opens 51 functions: plain, and it keeps their bodies as they
  were.
- `commands.ts` is 2,361 lines (from 2,226): the two classes add ~130, the destructures ~50, and the
  literals took back ~45. The next steps take the classes, helpers and families out.
- Tests: 577 pass, 8 pending; typecheck clean; differential: no differences.

### Step 4: `commands.ts` split into `commands/`

- **By script**, from a table of every top-level declaration and its file (§4.6's table, with the
  encoding helpers parked in `context.ts` until step 5). The script carries each declaration with
  its doc comment, writes each file's imports from the names it uses (comments and strings
  ignored), and exports what other files use. It typechecked on the first run; tests and the
  differential unchanged.
- **Sizes:** `index.ts` 124 (types, `execute`, the dispatch), `context.ts` 342, `plan.ts` 225,
  `structure.ts` 239, `enter.ts` 519, `join.ts` 497, `paste.ts` 292, `code.ts` 101, `settle.ts`
  93. `enter.ts` and `join.ts` are the large ones, as expected (r1's churn data: that's where the
  behavior is).
- **The lower-layer rule holds:** `structure.ts` imports `context`, `plan` and types only; the
  boundary test now checks it for real.
- **Two cycles, both between functions only (harmless at runtime):** `code` ↔ `enter`, because Enter
  on an item's opening fence is Enter at the item's start (`insertBefore`, an Enter behavior); and
  `context` ↔ `plan`, through `isEmptyText`, which step 6 replaces with `OutlineDoc.isEmpty`.
  Considered for the first: moving fenced-code Enter into `enter.ts` (no `code.ts`). Kept the
  agreed layout: all fence behavior in one file reads better than one import back.
- **A slip from step 3 surfaced here:** the regex that renamed `run` to `ops.nodes` had also
  rewritten two comments ("a quote the ops.nodes empties goes"). Comments aren't compiled, so
  neither the typecheck nor the differential could see it; reading the moved code did. **Lesson:**
  after a regex rename, grep the comments too.
- Tests: 577 pass, 8 pending; typecheck clean; differential: no differences.

### Step 5: the encoder

- **`OutlineEncoder`** (`encoder/encoder.ts`) is today's `writeOutline` as a class: `encode(plan,
  options)` returns an `EncodeResult` (today's `WrittenOutline`) or why the plan can't be written,
  and applies `withOwnedLists` itself (the plan as its text will read is the encoder's concern;
  `ctx.encode` used to do it). Constructing one computes nothing; the units, the tab style and the
  line ending are computed when `encode` first needs them and kept for the next try (a command
  encodes up to `candidates + 2` times).
- **The writer's internals split by script** into `layout.ts`, `lines.ts`, `seams.ts`,
  `changes.ts` and `indent.ts`, as planned; `outline-editor.ts` is gone. `encoder/index.ts` exports
  `OutlineEncoder`, `EncodeResult`, `EncodeOptions`, `OutlinePlan`, `OutlinePlanNode`, `PlanTree`.
- **Encoding knowledge moved in, as methods:** `renumber` (the half that finds which markers to
  rewrite and re-indents what a wider marker moves; composing the extra changes into the command's
  plan, with its selection, ids and placeholders mapped, stays in `commands/plan.ts`),
  `siblingPrefix`, `childIndent`, `markerText`, and `continuation(pieces)`, which replaces every
  `pieces.map((p) => continuationText(ctx, p)).join('')` (that was its only use). Commands no
  longer import `reindent` or `usesTabs`.
- **`OutlineDoc.contentOf(node)`** moved from the writer a step early: a question about the
  snapshot, and the plan's `copy` and five commands ask it.
- **The escapes (`encoder/escapes.ts`):** `escape(text, where, below?)` returns the escaped text and
  where the backslash went. Two kinds of line: `start` (a node's text starts here, so any block
  start or list marker would take it) and `continuation` (it continues a paragraph, so only a block
  that interrupts one, or a setext underline, would); with the lines `below`, also a reference
  definition. That covers the ten copies exactly; each site keeps what it does with the position
  (an extra change after the digits, or a backslash in the insert at 0). `startOfNode` (today's
  `encodeRest`) and `interruptsParagraph` moved beside it. **Finding:** the three predicates in
  use were exactly `start`, `continuation`, and `start` with the reference check; nothing in
  between. This is the seam for flavor-aware escaping (10-parsing.md §13.3), which changes one file.
- **Checked twice, because this step consolidates logic rather than moving it:** a 4,000-document
  differential (1.49 million command runs) found no differences. Then, since the generated
  documents rarely put a block start mid-line, the generator got lines that do (`p - x`, `p 1. x`,
  `p # h`, `[r]: /u`, ...) and a caret after each line's first space. Against an old copy with one
  escape site deliberately broken it reported the difference; against the real original, none.
  Escape coverage in the differential is thin (7 differing runs out of 579,514 for that mutation);
  the spec suite covers escapes deliberately.
- **Speed: no measurable change.** Run-to-run noise on this machine is ±15%; over four alternating
  runs each, the medians moved from 27.7 to 29.3 ms (indent), 13.7 to 14.6 (Shift-Enter), 24.5 to
  25.7 (move down), at 10,000 lines. If anything a few percent slower, not faster: **caching the
  layout inputs doesn't show, because laying out units isn't where commands spend their time;
  verification is** (re-applying the changes and comparing outlines), as 10-parsing.md §13.2
  says. That project is now a change inside `commands/plan.ts` and `OutlinePlan.differenceFrom`.
- `encoder/`: 1,333 lines in 11 files (`outline-plan.ts` 262, `encoder.ts` 255, `layout.ts` 207,
  `seams.ts` 150, `renumber.ts` 109, `lines.ts` 103, the rest under 100). `commands/` is 2,258 lines.
- Tests: 577 pass, 8 pending; typecheck clean; differential: no differences.

### Step 6: `outline/`

- **`src/outline/`:** `state.ts` (the snapshot class, today's `doc.ts`), `build.ts` (today's
  `outline.ts`), `identity.ts`, `placeholders.ts`, and `index.ts` exporting the class and the node
  types. Every import of the snapshot, in `src/`, the tests and the demo, goes through the entry.
- **`identity.ts`:** the id carrying of `apply` as `IdCarrier`, built per `apply` with the old
  snapshot, the changes and the explicit identities; its carried-id table is made the first time a
  node asks, as the closure-captured `let carried` did. **`placeholders.ts`:** `isPlace`,
  `validPlaces` and their two regexes.
- **New on the snapshot:** `before(node)` and `after(node)` in document order (an index made when
  first asked for), replacing five `doc.nodes[doc.nodes.indexOf(node) ± 1]` scans;
  `lastDescendant(node)`; `isEmpty(node)` and the static `isEmptyText(text)`; `homePosition(pos)`
  and `textStart(pos)`, moved from commands (the demo and the player call them as methods now).
- **"Empty" has one definition**, on the snapshot class: `isEmptyText` for a node's text however it
  was obtained (a planned node's text, a placeholder's line), `isEmpty` for a node of the
  snapshot. `isEmptyItem` and `isEmptyWithChildren` stay command helpers (they add a kind and a
  children check) over `isEmpty`. **Finding:** the old helpers weren't one rule applied three ways:
  `settle` applies the text rule to any node, a heading with an empty title included, where
  `isEmpty` says a heading always has text of its own. Each site kept its exact behavior.
  The `context` ↔ `plan` import cycle went with `isEmptyText`.
- **Deviation from the plan, on purpose:** `usesTabs` and `hasOrderedItems` were to be snapshot
  getters. Only the encoder asks either, so they are the encoder's facts, cached per encoder (one
  per command); both module-level `WeakMap`s are gone, and no module of `src/` outside the parser
  keeps mutable state. One detail found on the way: `renumber` asks the tab style of the *new*
  text, a fresh snapshot every time, so that cache never hit there; only "has ordered items" of the
  current snapshot was reused across commands, and it now costs one scan of the nodes per command,
  inside a command that is linear in the document anyway.
- **Not added, though planned:** `prevSibling` and `nextSibling`. One sibling lookup remains outside
  `Operands`; no API for one caller.
- The boundary test's list of not-yet-moved files is empty: every component is a directory or its
  own file.
- `outline/`: 602 lines in 5 files (`state.ts` 354, `build.ts` 144, `identity.ts` 68,
  `placeholders.ts` 28, `index.ts` 8).
- Tests: 577 pass, 8 pending; typecheck clean; differential: no differences.

### Step 7: the names, and the final API

- **The renames, one group at a time, each checked:** `OutlineDoc` → `OutlineState` (and
  `OutlineDocApplyParams` → `OutlineUpdateParams`), `apply` → `update`, the root field `outline` →
  `root`, `syntax` → `syntaxTree` (and the `blocks` shortcut gone: `syntaxTree.root`); `Syntax` →
  `SyntaxTree`, `Inline` → `InlineNode`; `TextChange` → `ChangeSpec` (its doc comment states the
  coordinate contract and the relation to CM6's type); `execute` → `executeCommand`, `settle` →
  `settlePlaceholders`, `Result` → `CommandResult`, the internal `Plan` → `CommandPlan`; an applied
  result's and a settlement's `doc` → `state`. The change functions kept their names
  (`applyChanges`, `mapPos`, ...), as decided.
- **`Config`** is one export, the type and its companion object (`Config.defaults`, `.values`,
  `.of(partial)`, `.read(settings)`), replacing `configOf`, `defaultConfig`, `configValues`,
  `readSettings` and `readConfig` (whose one caller now reads and checks in two lines).
- **The package entry (`src/index.ts`)** is §4.7's: `OutlineState` and the node types; `Config`;
  `executeCommand`, `settlePlaceholders` and their types; `ChangeSpec`, `applyChanges`,
  `invertChanges`, `mapPos`; and the parser's public API (`SyntaxTree`, `Flavor`, `renderHtml`, the
  data types). Extension authors import `ourus/extend`.
- **The demo** follows the API (`homePosition` and `textStart` as methods, `result.state`,
  `state.root`, `state.syntaxTree`); its bundle builds, and `npm run demo:smoke` passes all 65
  scenarios in headless Chromium. `npm run test:model` and both benchmarks run.
- **Comments followed the code:** "the writer", "the outline editor" and "the edited outline" are
  "the encoder" and "the plan" throughout `src/`.
- **A slip the differential caught at once:** the rename pass also renamed the names inside the
  differential's adapter, which must keep the old ones to load the original code
  (`api.OutlineState ?? api.OutlineDoc` became `?? api.OutlineState`). Excluded from every pass
  after that. **Lesson:** a compatibility shim is the one place a global rename must skip.
- **Internal names left as they are:** inside `commands/`, the context's field and the local
  destructure are still `doc` (an `OutlineState`): internal, plain, and renaming 51 destructures
  buys nothing a reader needs.
- Tests: 577 pass, 8 pending; typecheck clean (including the demo); differential: no differences.

### Step 8: the boundary closed

- The boundary test's allow-list has been empty since step 1, and its list of not-yet-moved files
  since step 6; both stay as they are, so a new violation fails the suite. README's "What's here"
  describes the layers and their entry points, and lists `npm run test:diff`.
- Final check: typecheck clean (the demo too), 577 tests pass and 8 are pending as before, the demo
  smoke test passes 65/65, and a 4,000-document differential (1,538,940 command runs, every
  flavor and option, carets and selections, with settling and a host lifecycle after each) finds
  no difference from the original code.

### Where it ended up

| Layer | Public API | Size |
| --- | --- | --- |
| `text.ts` | `ChangeSpec`, the change functions, line and column helpers | 252 lines |
| `config.ts` | `Config` (type and companion object) | 132 |
| `parser/` | `SyntaxTree`, `Flavor`, `renderHtml`, the data types; `extend.ts` for extension authors | 5,021 in 18 files, unchanged inside |
| `outline/` | `OutlineState`, `OutlineNode`, `OutlineKind`, `OutlineUpdateParams` | 601 in 5 files |
| `encoder/` | `OutlinePlan`, `OutlinePlanNode`, `OutlineEncoder`, `EncodeResult`, `EncodeOptions` | 1,316 in 11 files |
| `commands/` | `executeCommand`, `settlePlaceholders`, `Command`, `CommandResult`, `Selection`, `RejectReason` | 2,216 in 9 files |

- **The package exports 15 names a host needs**, plus the parser's public API. Before, it
  exported 17 of its own and all of the parser's internals (about 60 more).
- **The largest file a maintainer meets is `commands/enter.ts` at 511 lines**, where it was
  `commands.ts` at 2,335. The four big blobs are now 30 files, each about one thing.
- **The code above the parser grew by ~10%** (4,126 lines to 4,524): the classes' declarations and
  doc comments, the `const { doc } = ctx;` lines, the files' headers and imports. Repetition went
  (35 plan literals, 21 loops, 16 line-ending expressions, 10 escapes, 5 index scans), and structure
  and documentation came in. That trade is the point of the exercise; the line count isn't.
- **Behavior is unchanged** by every measure available: tests, spec, typecheck, the demo, and the
  differential on the original code after every step.
- **Speed is unchanged** within this machine's ±15% noise (§ step 5).

### Findings worth carrying forward

1. **The layering was already right**: the boundary test's allow-list started empty once one leak
   was closed. The weight was inside the layers: context rebuilt in every function, a vocabulary
   (the edit helpers, prefixes, escapes) scattered across files.
2. **Every id argument to the edit helpers was `node.id`**: an API taking nodes is what the code
   meant all along.
3. **The ten escape copies were three predicates exactly** (`start`, `continuation`, `start` with
   the reference check). Flavor-aware escaping (10-parsing.md §13.3) is now one file:
   `encoder/escapes.ts`.
4. **Verification, not layout, is where commands spend their time**: caching the encoder's layout
   inputs didn't show. The next speed project (10-parsing.md §13.2) is now local to
   `commands/plan.ts` and `OutlinePlan.differenceFrom`.
5. **"Empty" wasn't one rule applied three ways**; now it is one definition with two entry points.
6. **Scripts over code need the compiler right after them, and comments need a grep**: the two
   regex slips the compiler caught, the two comment slips it couldn't, and the shim the global
   rename mustn't touch.

### Left open

- **`OutlinePlanNode`** is the code's name for a planned node; the user's `OutlineNodePlanned` and
  r1's `PlanNode` were the alternatives. One export plus a mechanical replace, if wanted.
- **`code.ts` ↔ `enter.ts`** import each other (Enter on an item's opening fence is Enter at the
  item's start). Harmless; listed in case the fence behavior is ever reworked.
- Nothing is committed: `git status` shows the restructuring as working-tree changes, with
  `src/parsing/` → `src/parser/` as deletions and new files (git's rename detection pairs them on
  `git add`).

### After: tests mirror `src/`, component READMEs

- **Component-specific tests live in a layout mirroring `src/`** (the user): `test/parser/` (as
  before, now with its own helpers `arbitraries.ts` and `oracle.ts`, which only the parser's tests
  used), `test/outline/state.test.ts` (the outline built from the block tree, ids through typing
  and `replace`), `test/encoder/outline-plan.test.ts` (the plan's edits and comparison), and
  `test/commands/commands.test.ts` (the commands' consistency, round trips and ids), next to
  `test/text.test.ts` for `src/text.ts`. Tests that span components stay at the top: the spec
  runner and its helpers, the placeholder lifecycle (a command makes a placeholder, the snapshot
  keeps it while typing, settling resolves it), the boundary test, the Logseq and model runners,
  the differential and the command benchmark. `npm test` runs `test/*.test.ts test/*/*.test.ts`;
  585 tests, the same ones.
- **`SyntaxTree.lineAt` was planned (§4.3) and briefly added, then cut:** nothing outside
  `OutlineState` asks a syntax tree for the line at a position, so it stays the snapshot's method.
  No API without a caller; the parser's entry comment no longer advertises it.
- **A README in each component directory** documents its external API: what it is for, its
  classes and their methods, how the layer above uses it, the invariants a caller relies on, and
  where its tests are.

### After: an independent review (`../rr.md`)

An LLM review of the whole diff found no regression in command behavior (it reran the checks,
plus 36,000 runs of its own differential over up to three-command sequences) and **one real defect
in the new `OutlinePlan` API**, reproduced as reported: nodes a command creates all have `id:
null`, and `update`, `remove` and `place` found their targets by id, so with two new nodes in a plan
`setText(b)` edited `a`, `remove([b])` removed both, and `place('after', b)` inserted after `a`. No
command was affected (every command passes new nodes as payload, never as a target), which is why
the differential passed.

- **Fixed by making the rule explicit, the simpler of the review's two options:** an edit targets a
  node with an id (`PlanTarget = { readonly id: number }`): the types reject a new node as a target,
  and a cast past them throws instead of editing the wrong node. Nothing is lost: commands build new
  nodes complete before they go in.
- **The same flaw had a second form the review didn't name:** `remove` and `place` found the
  target's parent, then looked the parent up again *by id*; a parent can be a new node (a command
  makes a new paragraph holding old children). Parents are now found by structure, in the same walk
  that edits them (`edit(match, change)`, which `update` uses too).
- A test covers two new siblings, an old node under a new parent, edits after path copying, and the
  refusal. The encoder's README states the rule.
- The review's two whitespace notes (an extra blank line at the end of this file and of
  `commands/context.ts`) are fixed in the working tree; the staged copies still have them.
- Tests: 586 (one new), 578 pass, 8 pending; typecheck clean; differential: no differences.
