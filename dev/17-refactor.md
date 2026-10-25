# Refactoring (2026-10-24)

Everything since "Paste refactoring" (`16-paste`): five reviews of the editing core, a decision to
redesign it layer by layer, and the rewrite itself, from the text layer up to the commands. The old
`outline/`, `encoder/` and `commands/` are gone; `doc/` (the read model), `draft/` (editing) and new
`commands/` replace them. §2 is the design as it landed; §3 is how it got there.

| | 16-paste | 17-cat5 |
| --- | ---: | ---: |
| `npm test` | 1145 pass | 1280 pass, 0 fail |
| `src/` lines (`.ts`, without `entities-data.ts`) | 14,458 | 16,223 (peak 23,833, both paths) |
| above the parser | `outline/` 699, `encoder/` 1,694, `commands/` 6,277 | `doc/` 1,904, `draft/` 3,482, `commands/` 3,394 |
| a command at 10k lines (`bench.ts`, median) | 17–73 ms | 1.6–3.6 ms |
| a keystroke's update; a full parse (10k lines) | 0.28; 13–14 ms | 0.13; 10.9 ms |
| differential: runs failing to write | 19 known (a baseline of them) | 0 (no baseline: one fails the run) |
| spec | | +32 cases in `regressions.md`, dozens redrawn |

## 1. Why

The reviews (two built prototypes, three on paper) agreed on the problem: every hand-written edit
stated itself twice (the changes, and the expected text beside them, kept in step by hand), "what
can't be said" was diagnosed after a failed encoding, blank lines and escapes were case trees, and
the outline was rebuilt whole on every keystroke (any line added renumbered every block and node;
`buildTree` and id carrying were 40% of a Shift-Enter). Both prototypes, built apart, arrived at one
shape: **a command says what the outline becomes and where the caret goes; something below it
spells that as Markdown and checks it reads back.** Decided (the user): rebuild bottom up, with
positions relative to the parent so an edit copies only the path to it.

## 2. The design, as landed

### 2.1 Principles and layers

1. **One description of an edit.** A command states the outline it wants; the changes, the expected
   outline and the caret all come from that.
2. **Shared, relative, rebuilt on the path to an edit.** Blocks and nodes hold no parent and no
   absolute line; snapshots and drafts share every node an edit didn't reach.
3. **Meaning is checked, spelling isn't.** After writing, the new text is parsed and compared with
   what the command meant (kinds, nesting, ids, texts, gaps, lists, placeholders), never the bytes.
4. **Reading takes the flavor only**: the same text reads the same whatever the commands' options.
5. **Text is source-faithful**: what the user typed, trailing and continuation spaces included; the
   markup around it is the frame.
6. **Fidelity ends at the edit**: an untouched node is copied byte for byte, a moved one keeps its
   bytes past its prefixes, an edited one is written whole in normal form.

`text 0, parser 1 (config 1), doc 2, draft 3, commands 4, index 5`; every import goes down, through
an entry (`test/boundaries.test.ts`). Each directory's README has its API.

| Layer | What it is |
| --- | --- |
| `text/` | strings, `ChangeSet`, marks. Knows only Markdown's whitespace |
| `parser/` | the line machine and flavors, now with a shared block tree, line markup, read-back and escapes, HTML → Markdown |
| `doc/` | `OurusDoc`: a snapshot read as an outline. Nodes, their texts and frames, `locate`, placeholders. Reads only |
| `draft/` | `OurusDraft`: an edit as the outline it wants; `done()` fixes, writes, checks. `settlePlaceholders` |
| `commands/` | what a key means: locate, draft, apply |

**Host contract.** Keep one `OurusDoc`; `executeCommand(doc, command, selection)` returns
`applied` (`doc`, `changes`, `selection`, `clipboard?`), `rejected` (a reason) or `notApplicable`
(the host's default). After the host's own edits, `doc = doc.update(changes, { caret })`; when
the caret moves, `settlePlaceholders(doc, caret)`, committed as its own edit; undo history keeps the
placeholders as points (`doc.marks.points()`, restored with `createPlaceholder(pos)`); Home goes to
`doc.textStart(line)`.

### 2.2 `text/`

- **`ChangeSet`**: changes normalized once, with `apply`, `invert`, `mapPos`, `newLength`, and an
  exact `compose`. Compose merges changes that share text, and an insertion inside or at either end
  of what the first wrote; changes that only touch stay apart (merging those moved an inserted line
  off its line start and changed which ids carry). `ChangeSpec[]` is CM6's, at the host boundary.
- **Marks**: `MarkSet`, a closed set of kinds, each with a mapping policy. One is in use,
  **`PLACEHOLDER_MARK`**, a point the parser reads as a sentinel character. Where it is says what
  it holds:
  - at a line's end, an **empty node**, on a line that starts its block (`Notes⏎- ◌`: without it `-`
    underlines `Notes`; an empty paragraph has no Markdown at all: `a⏎⏎◌`);
  - before a line's text, a **held space**, a first character just deleted (`- ◌ b` keeps its
    child; `-  b` would lose it).

  Validity is read from the parse (`doc/placeholders.ts`), not regexes; an invalid one expires and
  its lines are read again. A host's deletion that would change the outline at the caret keeps one
  there.

### 2.3 `parser/`

- **A shared, relative block tree.** A stored `MdBlock` has no parent and no absolute line; children
  are offsets from their parent. An update reads again from a restart to where the parse converges
  and takes every block outside those lines whole; when the records around an edit are the same and
  no line moved (a keystroke), the whole tree is kept. Where a block is in a tree is an `MdBlockAt`
  (`block`, `line`; `child(k)`, `children()`, `preorder()`, `postorder()`, `lastLine`), a value
  compared by its block. No view objects.
- **Line markup**, `tree.markup(i)`: a line's leaf markup (`open`, `close`, `info`, `underline`,
  `rule`, `task`) and its text between, per block type through extension hooks, made when asked for.
- **What a block holds**: `MdFlavor.content(type)` (`blocks | inline | verbatim | none`) and
  `delimited(block)` (fenced code; `$$`, `%%`), declared by each extension, instead of lists of block
  types in the layers above (an extension's block is an atom, no longer dropped from the outline).
- **Read-back** (`readback.ts`, as `MdFlavor` methods): `firstNonParagraph(lines, context, above)`,
  the first line that wouldn't stay paragraph text written there (`start`, `continuation`,
  `quoteStart`); `markupEscapeAt(line, at)`; `markupEscapes(lines, place)` (reading: which
  backslashes are markup); `escapeParagraph(lines, place)` (writing: `absorbed`, `lines`, `markup`,
  `gained`). Plus `MdTree.inlineEscapeAt`, `codeSpanAt`, and `mdCalloutAt`, the one callout rule
  (Obsidian's: `[!note]Title` is a callout).
- **`MdHtmlParser`**: HTML (a clipboard's) to Markdown, one instance per parse.
- Every exported type has an `Md` prefix (`MdTree`, `MdBlock`, `MdLine`, `MdFlavor`, ...).

### 2.4 `doc/`: the snapshot and the outline

**`OurusDoc`**: `text`, `marks`, `mdTree`, `config`, `root`, `nextId`; `parse`, `update(changes,
{ caret, addMarks, dropMarks, setMarks, identity, nextId })` (a host's edit maps the placeholders,
adding and dropping some; the writer's or an undo gives the whole set), `replace(text, marks)`.

**Nodes.** `OutlineNodePersistent` is stored and shared: `id`, `kind` (`root | heading | item |
paragraph | quote | atom`), `gap` (blank lines after its own text), `children`; a read node also its
parser `block`, `head` (the block holding its text), its extent `lines` (to the next node's first
line, so siblings tile their parent) and children's `offsets`. A drafted node (made or changed by a
draft) has no blocks but a `source` and its `text`. `OutlineNode` is a node positioned in one
snapshot (lines, parent, siblings, `lastDescendant`, `preceding`, `afterSubtree`), made only when a
query reaches it.

What holds what (`rules.ts`; `outlineChildren` nests, for reading and for `done()` alike):

| Node | Its text | Its children |
| --- | --- | --- |
| item | its first block, where that holds inline text or lines as written; else none (`- > q`) | its other blocks |
| quote | a callout title: Obsidian's title block, else by convention a first paragraph starting `[!type]` | its blocks |
| heading | itself | its section, up to a heading of its level or higher, in its container |
| paragraph | itself | in the document's own sections only (not in an item or a quote), the items of a list right after it |
| atom | itself: code, HTML, a rule, a table, a definition, math, a comment, an extension's block | none |

Frontmatter is no node: a preamble, as the blank lines before the first node are.

**Incremental reading.** An update reads again the containers on the path to the changed lines and
reuses every other old node, the same object, where its blocks are the same stored blocks (its
section's or owned lists' too: the parser makes blocks anew around an edit even where characters
didn't change), none of its lines or the line after them changed, and `identity` doesn't name it
otherwise. **Ids** live on nodes: a node made anew takes its id from `identity` (the writer's, by
where each node it wrote starts, touching only lines where it disagrees with where the old node
went), else from an old node not reused whose first line its own continues, else a fresh one.

**Texts.** A node's text (`OutlineNodeText`) is of one of two kinds, by what ourus does with it: a
paragraph's, a heading's or a callout title's is a `ProseText`, which ourus edits as text; an atom's
is an `AtomText`, its lines taken as written whatever the parser reads inside them (a table's
cells, math). One class with a kind field would only move the branch into every user, and offer
`concat` or `fence` where they mean nothing.

`ProseText`: a node's lines past their containers' prefixes, without markup escapes,
`\n` between, with its placeholders (`text`, `marks`); a **type** (`paragraph | heading | title`)
and whether it is an **item's** (only an item's text can start with a checkbox or below its marker).
The **frame** (`task`, `heading`, `close`, `callout`, `underline`, `below`) is computed from the
characters, never stored, so it can't disagree with them; `body` is the text without it.
`normalize()` applies the only transitions: a heading that stops reading as one is a paragraph (its
section regrouped), a title that stops reading as a callout is gone (the line is the quote's first
paragraph); a paragraph never becomes a heading by its characters, whatever it starts with. A
checkbox is any one character in brackets, a callout `[!type]`, in every flavor (the outline's
convention: GFM reads only `[ ]`, `[x]`, `[X]`). A continuation line's leading spaces are text; a
first line's are padding; a tab a container took part of is the spaces left of it.
`AtomText`: the lines as written, no escapes and no transitions (it must still read as one block
of its type), frame `open | info | close | indent | label | rule`, its type the parser's (code's
`fenced_code` or `indented_code`).

Examples (`⟦part:chars⟧` a frame part, `◌` a placeholder):

- `> - [ ] ## Title text` (GFM): a quote with no text, holding an item `⟦task:[ ] ⟧## Title text`, a
  paragraph-typed text: GFM reads the rest of a task's line as text, so `##` needs no escape there.
- `- Title⏎  continues⏎  ===`: a heading-typed `Title⏎continues⟦underline:⏎===⟧`.
- `## Title ##␠␠`: `⟦heading:## ⟧Title⟦close: ##␠␠⟧`; `a␠␠⏎b`: a hard break's spaces are text.
- `- [ ] foo⏎  bar⏎⏎  # hello⏎⏎  - baz`: the item `⟦task:[ ] ⟧foo⏎bar`, gap 1; its child the
  heading `hello`, gap 1; the heading's child `baz` (sections exist inside containers too).
- `\- not a list⏎2\. x⏎\<div> y`, one paragraph: `- not a list⏎2\. x⏎\<div> y`. The `\-` is
  markup (out of the text); `2\.` on a continuation line protects nothing, and `<` isn't at a
  markup position: both text.

**Escapes.** A backslash is a **markup escape**, outside the text, where three things hold: it is at
one of the flavor's positions (a line's first character among `- + # > =`; Obsidian: `#` only
before a blank or the line's end, so `\#tag` stays text, and no `=`; the `.`/`)` after a line-start
number; the `:` after a line-start link label; a would-be delimiter row's first `-`), the parser
reads it as an inline escape there (not in a code span, even one across lines), and the line needs
it to stay paragraph text. Every other backslash is text, with no parse (`C\#` costs nothing).
Writing prefers an escape at those positions: `\-`, `2\.` (where the line would start a list),
`[a]\:` (the label stays a link where it is defined; `\[a]:` silently made it text), `|\---|`. A
line only an escape elsewhere keeps (`\<div>`, `` \``` ``, `\[!tip]`) gains a backslash as text.
No provenance: a split's escape and an author's are alike, and a join drops one nothing needs. `2.`
continuing a paragraph isn't escaped (CommonMark reads it as text).

**Positions.** `locate(pos)`: `text`, `frame`, `marker` (indentation, marker, padding), `prefix`,
`gap` (a blank line, owned by the node above: structural keys there act on it), `preamble`,
`none`. `posOf`/`offsetOf`, with `assoc` for characters the text leaves out. `textStart(line)`
(Home). `hiddenSpaces(node)`: the spaces Markdown hides before a text (an item's padding past one
space, a paragraph's indentation, three columns at most): the user's whitespace, given back as
spaces by a join, kept by `enterSplitSpace: start`.

Other queries commands use instead of reading text: `markerOf`, `listOf`, `lineAt`, `isBlankLine`,
`isLazyLine`, `atTextColumn`, `leadingBlankLines`, `codeSpanAt`, `readsAs(atomText)`,
`escapeParagraph(lines)`, `markdownOf(from, to)` (copy).

### 2.5 `draft/`: one edit

```
command   ctx.draft() … split, join, place, setText, gap, setCaret …   the outline it wants
done()    fix      → transitions, normal form, frontmatter, lists, padding, placeholders, escapes,
                     fences, gaps, anchors; or a refusal (not-expressible)
          write    → changes, identity, marks (the whole set), selection
          read     → doc.update(...); check: the new doc reads as the draft, else write-failed
```

**Operations**: `remove`, `place`, `append`, `dissolve` (its children take its place: no move),
`convert` (another kind, same id), `setText`, `create`, `copy` (written as the original is),
`split(ref, at, { children: 'stay' | 'follow', to, into, kind })`, `join(upper, lower, { children:
'adopt' | 'place', separator })`, `listForm`, `gap`, `leadingBlankLines`, `setCaret`, `setCaretAt`
(a position of the document, in markup), `select`. A reference is an `OutlineNode` of the document or
the id of a node the draft touched; touched nodes are working copies opened on the path from the
root, so an untouched subtree stays the document's object and an `OutlineNode` resolves through its
nearest opened ancestor, moves included. A removed node is detached: placed again, or dropped at
`done()`. New nodes reserve real ids from the document's counter.

**`done()` fixes everything the check compares before anything is written**, so the check is an
assertion about the writer, not a second opinion. In order (each step reads what the ones before
fixed):

1. **Transitions and normal form**: texts normalized; the containers whose structure changed
   regrouped by `outlineChildren`. It never merges nodes: a placement that would make one node
   another's text (a paragraph first under an empty item, `[!tip] x` first in a quote) is refused. A
   `---` that would open Obsidian frontmatter gets a blank line before it.
2. **Lists**, for every parent whose children changed: where each list starts, bullet or ordered,
   its marker, every number. A moved item joins the list it lands in; moved items of different
   lists stay apart; a bullet and an ordered item are two lists anywhere; two lists of one kind and
   marker side by side are one (Markdown has no seam between them); items regrouped under a
   paragraph are its one list. An ordered run moved right under a paragraph's text, or newly first
   there, starts at 1 (a list from another number can't interrupt a paragraph); the lower part of a
   split list keeps its numbers; else the numbers run from the start of the list its first item came
   from.
3. **Padding**: a text's leading first-line spaces leave it as its node's padding (three at most).
4. **Placeholders**, the result's whole set: none of a set text's held spaces (writing settles
   them); an empty node's where no spelling holds it otherwise (an empty paragraph; an empty item at
   the caret right under its parent's text, a blank line above it away from the caret; an empty
   item whose children follow a blank line). A text's empty last line becomes a blank line after it,
   the first of its gap, the caret on it; an empty line inside a text is refused.
5. **Escapes**, by `escapeParagraph`, for every text the draft set, and for paragraphs that move or
   whose lines are written anew (a lazy `- c` under `1. b` once re-indented, a lazy table row moved
   to the root): backslashes absorbed where they are markup now, markup escapes placed, backslashes
   gained by the text.
6. **Fences**: every atom text the draft set must read as its block alone; where fenced code
   would close early, both fences grow to the shortest length that holds; `$$`, `%%` and indented
   code are refused.
7. **Blank lines**: below.
8. **Anchors**: a text offset (`before`: columns into the padding), a position in markup the draft
   leaves as it was (`{ old }`, with a text anchor where that line isn't copied), or a blank line of
   a node's gap; mapped through steps 3–6.

**Blank lines** (`spec/gaps.md`):

- A node's gap is its own and travels with it under every command: a move, indent or outdent carries
  it; a split gives it to the second half, a join takes the lower's, a removal gives it to the node
  above.
- Two boundaries keep the blank lines the user wrote: the end of the document and the end of each
  heading's section. Where the draft changes which node ends one, that node takes them and the node
  that ended it the newcomer's gap.
- Then only Markdown's separation, at the seams the draft changed: raised to one blank line where
  texts would run together (a paragraph after an item, `-` under text, code after an item), judged
  on the lines as the container will hold them; lowered where a node the draft placed would loosen a
  tight list (the blank line goes to the list's end where something follows), or under an empty item
  (`-` and one blank line end it). A loose list stays loose: the item at the caret is set off from
  the one above.

**Edited, moved, untouched**, and the writer (`write.ts`). An untouched node is copied byte for
byte, blank lines included. A moved subtree is written as its old lines past the old container's
prefix (cut by columns, under quotes at each line's own `>`), after the new container's prefix,
shifted to line up with the nearest item of its list; lazy lines stay lazy; tabs to tab stops in a
document indented with tabs; a widened marker (`9.` → `10.`) shifts its children; an item's marker
is written over a block that is now first on its line. An edited node is spelled whole in normal
form, its padding and the escapes `done()` gave, but a line whose text didn't change keeps its lazy
spelling. Each line keeps its old line's ending. A copy is its original's lines. Changes are the
text between copied pieces, trimmed to what differs. The writer names every node it wrote or moved
(`identity`), passes the placeholders as the whole set, and maps the selection. A layout it has no
rule for is a `WriteFailure`.

**The check** (`check.ts`) walks node by node, skipping any node the draft and the new document
share (equal by construction): kind, id, gap, each text's type, frame meaning and string,
placeholders by role and offset, list start, type, marker and number, children. Two failures, never
confused: a refusal from `done()` (`not-expressible`, with a detail: Markdown can't say it) and
`write-failed` (the writer had no rule, or the text doesn't read back): always a bug.

Refusals `done()` makes: an empty line inside a text; a node that would be read as another's text
(an item's with none, a quote's title); two nodes that would join even with a blank line between;
a node that would read as another block where it now is; a line no escape keeps; code that would
lose its closing delimiter or close its fence however long.

**`settlePlaceholders(doc, caret)`**: one draft for every placeholder off the caret's line: a held
space's node written again (escaped where it would read as markup), an empty item written again
(holding alone, or with a blank line above under its parent's text), any other empty node dissolved
(the blank lines between two items it sat between taken out, so their list stays as tight as it was).

### 2.6 `commands/`

A command looks at the selection (`ctx.from`, `ctx.to`, located), describes the outline in
`ctx.draft()`, and applies it (`ctx.apply`). One file per spec file (`enter.ts`, `shift-enter.ts`,
`backspace.ts`, `delete.ts`, `code.ts`, `typing.ts`, `indent.ts`, `outdent.ts`, `move-subtree.ts`,
`delete-subtree.ts`, `duplicate-subtree.ts`, `copy.ts`, `paste.ts`, `paste-plain.ts`), entries
`<type>Command(ctx)`, helpers in `util.ts`, clipboard formats in `clipboard.ts`. Commands map no
positions and place no escapes; they ask `doc/` what a line, marker or fence is, the parser only for
HTML. Two hand-built changes remain: a cut's deletion where no command deletes it, and the host's
character between typed ones when several are typed at once. A case a command doesn't handle
(`null`) is the host's where its key has a default (`notApplicable`), else `rejected unsupported`.
Mid-text Backspace and Delete and ordinary typing are the host's; ourus types only where Markdown
reads a character as structure (a backtick or tilde: fences opened, grown and kept matched,
`closeBackticks`). With the caret in markup, an edit ourus would refuse is the host's under
`markup: text` (the default).

Every config option is built, `enterSplitSpace: start` (the spaces after the caret kept as the new
text's padding, past one space after the marker, as the apps that keep them write it) and
`enterAtTextStart: stay` (an empty node above, the caret staying) included.

### 2.7 Decisions behind it

- **Tasks and callouts in every flavor**, one convention: a literal `[ ] ` can't start an item's
  text (the author writes `\[ ]`); a paragraph starting `[!type]` can't be a quote's first child.
- **An atom text that can't be its type** (a table without a delimiter row) is a command's bug the
  check reports, not demoted to a paragraph.
- **No third kind of placeholder**: the empty line Shift-Enter leaves at a text's end is a blank
  line after it, the caret on it; typed on, it continues the text; Shift-Enter again there makes a
  paragraph break.
- **Spec cases that only pinned the old code** may be redrawn where the new layers do otherwise more
  simply; kept: what a key does, what outliners agree on, readable Markdown.
- **Simple over the old edge cases**, roughly matching the outliners; for blank lines, "don't change
  what the user didn't edit".

## 3. How it went

**Reviews and the lower layers** ("17 *" commits). Review3's gates and fixes landed without its
prototype: plans verified once, the differential's baseline keyed by run, a fixed-seed fuzz,
known-bug tests, quotes keyed at their `>` (a quote and its first paragraph shared an identity key,
so both got new ids on any edit above them). `text.ts` became `text/` (`ChangeSet`, review5's
marks); compose's merging rule took three tries against the differential. The parser's block tree
went relative and shared: Enter's tree update 2.19 → 0.19 ms; a first version that copied every
block into a node doubled the full parse; the second measures as before. Line markup, `content` and
`delimited`, read-back, then the `Md` names; each step had no differential difference.

**Design, then `doc/` behind an adapter.** The design went through four review rounds before code.
Steps 1–3 built `OurusDoc` with typed placeholders, the incremental outline tree with ids on nodes,
and texts, frames, escapes and `locate`; the old commands ran on `OutlineState`, made an adapter
over `OurusDoc`; the differential stayed clean.

**The new commands beside the old.** Instead of porting a family and deleting its old path (the
design's plan, with a 40% go/no-go gate on the family's code), the user chose new layers beside the
old ones (`commandsv2/`; the writer first as `writerv2/`, then moved under the draft), dispatched
by `OURUS_COMMANDS=v2`, falling back to the old commands wherever the new ones returned null. Order:
two pilots (delete subtree, Shift-Enter), Enter, Cmd-Backspace, the moves, indent and outdent,
Backspace and Delete, code, typing, duplicate, copy and cut, paste and plain paste. Spec steps on
the new path: 1,964 of about 4,100 after 8 parts, 2,926 after 11, 3,952 after 17. Each part was
gated by the spec in both modes, the differential against the commit before `commandsv2/` (no new
write failures; a part's first run found up to 1,614 regressions, each a fix), the inverse and the
bench.
The gate's coverage baseline was never taken: each family came out a fraction of its old code
anyway (code 577 → 297 lines, paste and placing 829 → 398, Enter's splits about 45 lines), and the
pilots alone took Shift-Enter 17 → 2 ms and delete subtree 46 → 2.7 ms.

**Findings worth keeping** (from the working log):

- *Regexes against the parse.* Reading placeholders from the parse found nested held spaces the old
  regexes missed (`- >  # h`: the space held, else `# h` became a heading and a new node).
- *The parser makes blocks anew where nothing changed* (between its restart and convergence), so a
  heading or paragraph is reused only where its section's or owned lists' blocks are the same
  objects too.
- *`identity` naming every node rebuilt the whole outline* on each command the old encoder wrote
  (delete subtree 36 → 100 ms); it now touches only lines where it disagrees with where the old
  node went.
- *Order inside `done()` matters*: placeholders before escapes (a held empty line reads as typed
  on), escapes before gaps (a seam is judged on texts as they'll be written), gaps after lists (a
  list's start decides whether it can interrupt a paragraph).
- *Nearly all the porting work was in `done()`'s placeholder and seam rules and in reading's
  frame*; the commands stayed small: the text, the caret, which node goes where.
- *The blank-line rules for moves were positional at scope ends*, and wrong for an indent, which
  leaves the text in order; ten rules later, replaced by "a gap travels" plus two boundaries
  (below).
- *Seams must be read where nodes land*: a moved node read past its old prefix and without the new
  one made two quotes, or a paragraph and a moved item, read apart when they would run together.
- *Alignment is by list*: lining a moved item up with an item of another list nested it.
- *Fence lengths belong to `done()`, not the writer*, so the text the check compares is exact; and
  `readsAs` judges a text by its own frame, so a command checking a fence stays closed compares
  `closed` with the text before.
- *A duplicate is a copy, not a new node from the text* (the design had `create`): a new node is
  written in normal form, and the spec wants a copy's lazy lines kept.
- *The commands stopped reading text*: no `mdTree`, no line tables, no Markdown regexes but a typed
  backtick's; everything they asked became a `doc/` query.
- *`MdBlockAt` as a value*: the one bug of removing the views was a list compared by identity.
- *Five definitions of "starts a callout"* disagreed (the parser's, the frame's, the outline's, the
  draft's, the commands'); one now, which fixed Enter after `> [!tip]x` refusing in every flavor.
- *Escapes judged against lines with earlier escapes removed* made every later backslash look needed
  (`2\.` on a continuation line); both reading and the draft judge against the lines as written.

**What was hard, and what it changed.**

- *Blank lines.* Porting the moves took ten special rules in `done()` (scope ends by subtree and
  list run, swaps, crossings, an order-changed predicate), each from a failing spec case. Decided:
  a node's gap travels with it, plus Markdown's separation. That alone collected blank lines at the
  document's end (MoveDown39 ended with three) and lost the blank line before a heading when the item
  ending its section moved, so the two kept boundaries were added. Tried and dropped: a blank line
  before every heading (markdownlint's style, adds blank lines to documents written without them);
  a role model (own gaps and scope ends assigned in one pass: keeps the fragile scope matching); a
  positional model (blank lines stay put, nodes move between them: leaves a moved node's spacing
  behind). `draft.ts` 1,865 → 1,626 lines; 13 spec cases redrawn.
- *The third kind of placeholder* (an empty line inside a text) needed special cases in every layer
  for a state that lasts one keystroke. Dropped; the 17 cases drawing one redrawn.
- *Escapes*: `[a]\:` for `\[a]:`, `|\---|` for `\|---|`, and no escape for `2.` continuing a
  paragraph; 17 cases respelled.
- *Lazy lines*: an edited node in normal form gave every lazy line its prefix (thousands of runs in
  the differential); settled as: lines whose text didn't change stay lazy, a split's second half
  included.

**The old path deleted.** `commands/` (5,864 lines) and `encoder/` (1,793) went, `commandsv2/`
became `commands/`, and what the new commands didn't do became `rejected unsupported`, its cases in
`spec/pending.md` (27). Then the adapter (`outline/`) and the parser's views went, hosts, demos and
tools moved onto `OurusDoc`, settling became a draft, and `draft/` split from `doc/` as its own
layer. `src/` 23,833 → 15,703 lines; a command at 10k lines 17–73 ms → 1.6–4.4 ms.

**Cleanup and the pending cases.**

- A review of all of `src/` and `test/`: unused code gone, three bugs (Outdent22, PastePlain35, 36).
- `MarkedText` removed: holders keep a string and a `MarkSet` side by side.
- Escapes moved into the parser, one adapter in `doc/escapes.ts`; it fixed a join dropping an
  author's `3\.` (Regression27). Reading an escape-dense document 16.8 → 21 ms.
- The two placeholder kinds made one mark, its role by position.
- `enterAtTextStart: stay` and `enterSplitSpace: start` built (pending 27 → 5); for `start`, SxS
  probes decided the padding is past one space after the marker (`- ┃ three` in a two-space list),
  not the list's own.
- The writer taught every layout the differential and spec reached (3,407 distinct unwritten runs
  to 0), so "unwritten" stopped being an outcome (pending 5 → 1; the last, Delete16g, was dropped
  with `pending.md`).
- Names, last: the outline's types say what they are, not which directory they're in (`DocNode`,
  `DocNodePersistent`, `DocNodeKind` are `OutlineNode`, `OutlineNodePersistent`, `OutlineNodeKind`);
  a node's text is `OutlineNodeText = ProseText | AtomText`, the classes named by what ourus does
  with them (`VerbatimText` was wrong for tables, whose cells are inline). `update(changes, marks,
  params)` takes one `DocUpdateParams`, its marks as `addMarks`, `dropMarks`, `setMarks`.

**The SxS as a check.** A full run against 16-paste's judgment showed agreement down 8–31 cases per
block app: 161 cells were `enterSplitSpace: start`, 59 `enterAtTextStart: stay` (both then
unbuilt), ~70 the dropped placeholder kind, 32 the new escape spelling. It also found bugs in option
paths the spec never drew: `enterMidItem: child`, `headingEditing: block` on items' headings,
`joinWithChildren: refuse`, `pasteLines: items`, an unclosed fence at the document's end (each now a
regression case). After building the options, fixing the projection (`sxs/lib/block.ts`: the blank
line Shift-Enter leaves, every markup escape out of a block's text) and those bugs, worse cells went
from 356 to 27, each explained (§5).

## 4. Spec

- `regressions.md` (new): `Regression1`..`Regression32`, bugs found by the differential, the
  reviews and the SxS.
- `pending.md` held the cases agreed on but not built during the port; deleted at the end with its
  last case (Delete16g). The `pending` tag stays, in any file: a todo that fails once it passes.
- `gaps.md` and `placeholders.md`: introductions rewritten to the rules above.
- Redrawn: the blank-line cases of moves, indents and outdents; the third kind's cases; the escape
  respellings; cases of option paths (`enterMidItem: child`, `pasteSeams: open`, ...). Delimiter-row
  cases are `flavor: gfm`, GFM-callout ones `flavor: obsidian`. Spec files have no frontmatter.

## 5. SxS

A full run (`node sxs/run.ts all`, 18 apps, about 10 minutes, no errors) on this commit, compared
with `.sxs` at 16-paste (`--compare`): ourus passes all 1019 cases it replays.

- **On the cases both runs have**: 60 cells better, 27 worse; agreement up in 12 apps (by up to 4
  cases), down in 5 (by 1, Roam by 3), even in Tine.
- **The 27 worse**: 16 are spec changes made here on purpose: TO-S11 and TO-S11b (Shift-Enter's
  blank line is now a paragraph break), Placeholder4, TO8 and TO9 (no third kind of placeholder),
  MoveDown25 and Enter56. Quote84 (×3) is `enterAtTextStart: into` under the Obsidian flavor.
  PasteList11 (×3) and PasteList6 are the projection of the same text. Roam's CursorLeft1/2,
  Logseq's Scenario23 and Logseq DB's TO-MarkerCol are the apps' own runs varying.
- **New**: 65 cases that didn't exist or didn't run then (the regression cases, the option paths),
  483 cells: 191 agree, 250 disagree, mostly the text apps (Obsidian's modes, SilverBullet, Emacs),
  which don't behave as outliners there.

## 6. Open

- In the Obsidian flavor a line starting `$$` with no closing `$$` opens a math block, so a split
  that puts one there gives the text a backslash (`a ┃$$b` → `a⏎⏎\$$b`): `$` is no markup-escape
  position (`\$` means something inline), so the backslash is text and stays after the join. It
  renders the same, but in display math across lines (`a $$⏎b $$`) it breaks the math (Pandoc reads
  it so too). A markup-escape position for it would hold only where no later `$$` closes it in the
  paragraph. No spec case pins either. CommonMark and GFM have no math, and write no escape.
- A join strips an author's backslash that a split made markup (`revise 2\. draft`, Enter then
  Backspace, gives `revise2. draft`): only an escape ourus wrote should go, which needs an advisory
  mark on generated escapes (`AUTO_*` mark kinds exist, unused).
- Commands that try more than one draft or compose commands: paste's open seams falling back to a
  closed paste, typing several characters one at a time, plain paste's entered lines, cut.
- The writer's 18 `write-failed` sites no input reaches; written when one does.
- `settlePlaceholders` returns null on a refusal or a write failure (silent), and does nothing on
  `Notes⏎- ◌⏎z` where `Notes⏎- ◌⏎⏎z` settles.
- Two paste runs fail to write (a paragraph and a link definition pasted into an empty item with
  children).
- Delete under `markup: decorated` in a marker's two-space padding (`-┃  a`): one space should go and
  the item stay, which the writer can't spell (it can't narrow a marker's padding); the host's for
  now. Its case went with `pending.md`.
- Enter26b's round trip (`enterAtTextStart: stay`) leaves a blank line.
- `OutlineNode.becomesTitle(text)` is a pre-check Backspace, Delete and plain paste call, since
  `done()` checks absorption only in containers whose structure changed: a text edit that makes a
  quote's first paragraph start a callout isn't refused there, and fails to write.
- Names: `isBlankLine`/`isEmptyLine` mean the parser's `empty`/`blank` the other way round;
  single-letter public parameters; `parser/html.ts` (the renderer) beside `html-parser.ts`.
- Scale: an edit still costs O(lines after it) in the parser's line arrays and O(top-level blocks)
  at the root (7.8 ms at 1M lines). A chunked array for lines and a balanced layer for long child
  lists (as lezer has) would fix both.

## 7. Checking a change

- `npm test`; typecheck with the demos: `npx tsc --noEmit -p .`, `-p demos/cm6`, `-p demos/textarea`.
- Differential: `git archive HEAD | tar -x -C $S/head`, `ln -s $PWD/node_modules $S/head/`,
  `node test/differential.ts $S/head .`. No run may fail to write that HEAD writes; every other
  difference needs a judgment. A spec change shifts its corpus.
- `node test/inverse.ts` (`INVERSE_UPDATE=1` after a spec change); `node test/bench.ts`,
  `node test/parser/bench.ts`; properties harder with `OURUS_FUZZ_RUNS=3000`.
- Spec cases from the commands' output: `npm run redraw [file.md] [case]`, `--apply` to rewrite them
  (read every difference first).
- SxS: `node sxs/run.ts all <file>.md` for a changed spec file, then `--rejudge` and `--compare`;
  one shape by hand with `node sxs/probe.ts`.
