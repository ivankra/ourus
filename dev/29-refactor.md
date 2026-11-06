# Refactoring (2026-11-06 to 07)

Refactorings that take out a second model of something ourus already has one of, with the bugs that
model made, and decisions taken with the user on the way. In order:

- quote atoms, then the other commands' Markdown, read through the parser and the doc layer;
- block ids: no uniqueness, no shadowing rule, no loss protection; the host's to keep, with the
  tools ourus gives; B223 followed the apps;
- the readback reads edited code's meaning;
- the selection is the view's (`OurusView.selection`), `caret` a selection whose ends are one;
  settling keeps the placeholders on the lines a selection touches;
- `␄` in the spec, the end of a buffer's text;
- four decisions: a join keeps one block id, B223's rule Enter's alone, labels the host's (B228),
  lists numbered alike renumbered;
- step 5: settling's fallback (nothing left to check), a gap as one record kept true, B296 and B303;
- smaller batches: B252, B219, no module state;
- the command entry in three steps; a write failure its own result, failures and deferrals as data;
  the spread lint and the extremes suite; a style parsed once.
- the demos type-checked in `npm test` (textarea and GTK fixed, cm6's smoke test matched to the spec);
- refusals name nodes in words (B259); an extension's delimiters (B255);
- the normalized draft, an immutable type that `write()` and the readback alone take;
- coordinate types: a document's offsets, a node's text's, a line's, lines, columns, node ids;
- the document's import cycles broken, none at run time inside a component but two left;
- step 1's first part: the reports' failing cases kept untriaged and replayed, marks checked on the
  lines a command didn't change, a volume run;
- the kept failures triaged, every one: 32 bugs filed (B345 to B376), 6 older ones joined, three checks made right.

`npm test` green at each step; most bug fixes wait for a round of their own (`dev/next.md`).

## Contents

- [Quote atoms read through the parser](#quote-atoms-read-through-the-parser)
  - [Refactoring and API](#refactoring-and-api)
  - [Fixed](#fixed)
  - [Tests](#tests)
  - [Tests and spec changed](#tests-and-spec-changed)
  - [Open](#open)
- [The other commands' Markdown read through the parser and the doc layer](#the-other-commands-markdown-read-through-the-parser-and-the-doc-layer)
- [Block ids aren't kept unique](#block-ids-arent-kept-unique)
- [The plan's open steps: 2, 3 and 5](#the-plans-open-steps-2-3-and-5)
- [The readback reads edited code's meaning](#the-readback-reads-edited-codes-meaning)
- [Shadowing is the host's too; settling a host's rule](#shadowing-is-the-hosts-too-settling-a-hosts-rule)
- [CI: an empty item given a table or a first child](#ci-an-empty-item-given-a-table-or-a-first-child)
- [B223: a quote's block id stays at its end](#b223-a-quotes-block-id-stays-at-its-end)
- [Block-id loss protection removed](#block-id-loss-protection-removed)
- [The selection is the view's](#the-selection-is-the-views)
- [Four decisions](#four-decisions)
- [Step 5, part 1: settling's fallback](#step-5-part-1-settlings-fallback)
- [Step 5, part 3: a gap is one record](#step-5-part-3-a-gap-is-one-record)
- [B296 and B303: the lines a seam is judged by](#b296-and-b303-the-lines-a-seam-is-judged-by)
- [Smaller batches: B252, B219, module state](#smaller-batches-b252-b219-module-state)
- [The command entry, results and failures as data, lints](#the-command-entry-results-and-failures-as-data-lints)
- [The demos](#the-demos)
- [Refusals in words; extensions' delimiters](#refusals-in-words-extensions-delimiters)
- [The normalized draft](#the-normalized-draft)
- [Coordinate types](#coordinate-types)
- [Import cycles inside components](#import-cycles-inside-components)
- [Step 1: the failures kept](#step-1-the-failures-kept)
- [Triage of the kept failures](#triage-of-the-kept-failures)

## Quote atoms read through the parser

A quote read as an atom (`quotes: atom`) is its lines as written, `>` included, edited as characters.
What Enter, Shift-Enter and plain paste did with those lines was decided by regexes over physical
lines in `src/commands/quote.ts`: one for a quoted item's marker (`QUOTED_ITEM`), a backward scan for
an empty item's parent (`parentItemLine`), a text scan renumbering what followed (`renumberedAfter`),
another for Shift-Enter's prefix, and a second parse of the atom's text to tell a lazy line
(`oneQuote`). That is a second Markdown reader beside the parser, and it drifted from it: nested
quotes, code, continuation lines, list bounds, tabs and widening markers each read wrong (B198, B199),
`enterSplitSpace` was ignored (B200), and the indentation before the first `>` wasn't the quote's
start everywhere (B201).

Now a quote atom's lines are the document's reading of them, `ctx.doc.mdTree`, which is what the
readback checks against. Commands ask the parser and the doc layer; `src/commands/quote.ts` has no
regex and parses nothing. Its policy goes through the functions ordinary lists and texts use:
`orderedLists`, `enterTask`, `enterSplitSpace`.

### Refactoring and API

- **The layers.** Reading Markdown is the parser's and the doc layer's job; a command asks them. The
  questions a quote atom needs are now theirs:
  - **`MdTree.quoteMarker(piece)`**: a quote's `>` in its prefix piece on a line, and the end of the
    blank after it (a tab whole).
  - **`MdTree.continuationPrefix(i, containers, upTo?)`**: what a line's prefix pieces of some of its
    containers spell for a line after it in them, an item's marker as spaces, so the line continues
    the item. Each character is copied from the column it was at, so tabs stay as written and
    columns are kept: a tab a piece took part of is copied with the next piece, or spelled as spaces
    where nothing copies it.
  - **`MdTree.itemLead(item, containers)`**: what a new item after `item` has before its marker.
  - **`MAX_ITEM_NUMBER`** (`parser/blocks.ts`): a marker's nine digits, in one place; the draft's
    refusal uses it too.
  - **`checkboxLength(line)`** (`doc/text.ts`, internal): the checkbox at an item text's start as the
    outline reads a task's, in every flavor. The parser's `attrs.task` is GFM's only; ordinary items
    are tasks in every flavor, and a quote atom's now are too.
  - **`OurusProse.emptyLastLine`**: whether a text's last line holds nothing past its frame (a
    quote's `>`, from the text's frame parts). It replaces four copies of
    `.replace(/^ {0,3}>[ \t]?/, '')` on a text's last line: `enter.ts`, `paste.ts`,
    `duplicate-subtree.ts` and `writer/settle.ts`.
- **One numbering policy: `listNumbering(own, was, start, policy)`** (`writer/draft.ts`): an ordered
  list's numbers after an edit as `orderedLists` says, taken out of the draft's `#list`, which calls
  it, and the quote atom's renumbering. A list of one number (`1.`, `1.`) keeps it (`alikeNumbers`).
- **One split: `splitSpaces`** (`commands/util.ts`): the spaces at a split as `enterSplitSpace` says,
  taken out of a text's Enter (`enter.ts`), which calls it, as do the quote atom's split and line.
- **In `commands/quote.ts`**: `quoteLine` gives a line of a quote atom as the document reads it (its
  containers from the quote in, the quote's own prefix piece, its offsets in the atom); `itemAfter`
  gives a new item's prefix and the edits renumbering its list; `quoteLead` and `atQuoteStart` give
  the quote's start, past the spaces before its first `>`, for Enter, Shift-Enter
  (`shift-enter.ts`) and plain paste (`paste-plain.ts`); `tabLedLazyLine` and `emptyQuote` replace
  the two regexes `indent.ts` read a quote atom's lines with. Edits made together and the caret mapped
  through them (`editedQuote`): renumbering before the caret moved where the line went in.
- **Gone**: `QUOTED_ITEM`, `parentItemLine`, the text-scan `renumberedAfter`, `oneQuote`. Shift-Enter
  tries the lazy line and the readback says whether the document reads the quote with it as the same
  quote; it no longer parses a text of its own to guess.
- **`enterInQuote`'s doc** (`config.ts`) says what line mode does in a quoted list: the next marker
  numbered as `orderedLists` says, an empty nested item its parent's next, the spaces as
  `enterSplitSpace` says.
- **Public API**, additions only: `MdTree.quoteMarker`, `MdTree.continuationPrefix`,
  `MdTree.itemLead`, `MAX_ITEM_NUMBER` (`src/parser/README.md`).

### Fixed

All under `quotes: atom`, P3 by the ranking.

- **Enter read one physical line, not the block it was in** [B198]. Its seven cases:
  - in a nested quote's item (`> > - a`) it wrote a line of the outer quote;
  - a nested quote written `>>` lost its second `>`;
  - in quoted code it invented a list marker on a line reading like an item;
  - on an item's continuation line it wrote a plain quoted line, not the next item;
  - an empty item's parent was found across a paragraph;
  - Obsidian's task statuses (`[-]`) didn't continue as a task;
  - past nine digits it wrote `1000000000.`: refused now, as any list.

  Regression279–283.
- **Renumbering a quoted list was a text scan** [B199]:
  - it ignored `orderedLists: shift` (then `listNumbers: keep`);
  - it went past the list, into a list after a paragraph;
  - it compared indentation as strings, so a tab and spaces to one column were two lists;
  - a widened marker (`9.` to `10.`) left its item's child out of it;
  - an empty nested item outdented left two `2.`.

  The list is the parser's now, numbered by `listNumbering` from its first item, as any list. A
  marker that widens or narrows moves its item's other lines as far, or is refused where a line can't
  move left. Regression284–287.
- **Splitting a quote atom ignored `enterSplitSpace`** [B200]: it trimmed both sides. Now it takes
  the spaces as a text's Enter does, so under `drop`, the default, Enter then Backspace gives the
  text back. A line-mode Enter takes them so too (`> a┃ quote` gives `> a⏎> quote`), which is most
  of the round trips the `inverse` suite gained ([Tests](#tests)). Regression289–289c.
- **A line break pasted in an indented quote atom's indentation failed to write** [B201]. Plain
  paste took offset 0 alone as the quote's start; now the spaces before the first `>` are its start
  there too, as for Enter (`atQuoteStart`). Regression290.
- **Found on the way, each judged:**
  - **A quote atom's task in CommonMark wasn't one.** With the parser's `attrs.task`, Regression226
    failed in CommonMark, so the checkbox is now the outline's (`checkboxLength`).
  - **A caret in a line's markup now acts as at the line's text start.** That covers its `>`, before
    a later line's `>` too, and its item's marker or checkbox. Before, Enter was refused there ("the
    lines would end the blockquote"), or split the markup (`> - ┃[x] task` gave `> - ⏎> - [ ] [x]
    task`).
    - Before a task's checkbox it now gives `> - [x] ⏎> - [ ] ┃task`. That is Obsidian's split, in
      Source mode and Live Preview, and SilverBullet's with the trailing space trimmed (probed).
    - A plain list's rule 6 gives an empty task above.
  - **An empty line in an item, with nothing past its prefix and no marker of its own, is the
    quote's.** The parser counts such a line inside the item. As the quote's, its empty last line
    leaves the quote, as before the refactor (`> - a⏎> ┃` gives `> - a⏎⏎┃`).
  - **Tabs.** Enter in `> 1.\t- a` continued the outer list (`> 2. `), and in `>\t>\ta` it lost the
    inner quote. Both are right now, and each new line keeps the line's tabs where they were
    (`>\t- a` gives `>\t- ` on Enter and `>\t  ` on Shift-Enter).

### Tests

- **Spec**: Regression279 to Regression290, 16 cases.
- **`test/commands/commands.test.ts`**: one table test of 49 rows for the shapes the spec can't draw
  or that need many variants. It covers tabs, CRLF, a quote that is an item's text, bullets and
  delimiters, numbers renumbered and kept, tasks in each flavor, the split's spaces, carets in markup,
  nested quotes, Shift-Enter's lazy lines and plain paste.
- **`test/bugs.ts`**: B198–B201 out, their cases in the tests above. B206, a fence's indentation,
  stays open; its note says how B201 was fixed. The baseline was re-recorded: 126 open bugs and 224
  cases, from 130 and 238; 69 of them `write-failed`, from 70.
- **The tracker forgot nothing**: `BUGS_UPDATE=1` kept the recorded failures of every bug it didn't
  play, so a bug taken out of `test/bugs.ts` left its entries in `bugs.baseline.json` (B302's had
  stayed since it was fixed). It keeps only those of bugs still in the file now.
- **Heavy run**: every suite passes. `inverse` gained 421 round trips against the last commit (the
  split's spaces given back). `diff` has no regressions; its two write failures fail at HEAD too.
- **SxS**, rejudged against HEAD:
  - **Better, 12:** Enter68, Quote42 and Regression247 agree now in Athens, Dynalist, Roam and Tine,
    where only whitespace differed. Those apps are judged under `quotes: atom` and split mode.
  - **Worse, 6, each judged and kept:**
    - Regression111 in five block apps, whitespace only. A second pasted line's prefix comes from the
      line's pieces now (`>\t y`, was `> y`); both continue the same paragraph.
    - Quote31 in SilverBullet. On a lazy line in an item (`> - a⏎b┃`), the document reads `b` as the
      item's text, so Enter gives the next item. That is what the spec's default mode gives too.
      SilverBullet's line pattern sees no item there.
  - **Neutral, 5:** cases that disagreed adapted (`(✗)`) disagree unadapted now.
  - **Regression227 had no verdicts left:** its start changed, so the apps' recorded runs were for
    the old start. The probe ([below](#tests-and-spec-changed)) stands in until the next full run.
  - **A slip caught here:** a version of the split that dropped a later line's `>` before the caret
    (`> q⏎> ┃r` gave `> q⏎⏎r`) moved Quote37 and Regression244 in five block apps. The `>` stays now,
    as the block apps keep it.

### Tests and spec changed

Each is a decision. The code follows the document's reading or the ordinary lists' rule, and a test
said otherwise:

- **A lone marker right under an item's text is a setext underline.** In `> - parent⏎>   - ┃`, the
  document reads `>   -` as the underline making `parent` a heading. CommonMark says so, and
  ourus's plain lists defer Enter there.
  - **Changed to match:** Regression227 now starts after a sibling (`>   - child⏎>   - ┃`), with the
    reason in its prose. B199's last case gets the same treatment in Regression287. Regression288
    pins the underline reading.
  - **Against it:** the text editors read such a line as an empty item for Enter. Obsidian (Source
    and Live Preview) and SilverBullet outdent it, in a quote and in a plain list (probed); Emacs
    leaves the line as it is. ourus's own keys never make the shape in a quote atom, since indent
    moves the whole quote. It comes from typing.
  - **Decided:** the document's, as CommonMark reads it.
- **Past nine digits, Enter is refused** (`not-expressible`), as for any list. B198's case had asked
  only for no ten-digit marker.
- **`orderedLists: shift` counts on an item that counted on from the one above**
  (`> 2. a┃⏎> 3. b⏎> 3. c` gives `2. 3. 4. 3.`), as ordinary lists do. B199's case wanted `> 2. b`
  kept. The option's doc said "the numbers written stay", which neither the draft nor this did.
  - **Decided:** the code, as the option meant from the start (the text editors' run shifting with a
    new item). The option renamed for it: `listNumbers: renumber | keep` is now
    `orderedLists: renumber | shift`, `keep` having promised more than it does; its doc says what
    `shift` does, and that a list numbered all alike stays so either way.
  - **Probed, `3. a┃⏎4. b⏎4. c⏎9. d`:** Enter in Obsidian (bare, Live Preview, true-outliner) gives
    `3. 4. 5. 6. 7.`, `renumber`; in SilverBullet `3. 4. 5. 4. 9.`, `shift` exactly; with the
    Outliner plugin `1. 2. 3. 4. 5.`; Emacs writes no marker. Moving `a` down, Obsidian gives
    `3. 4. 5. 6.`, SilverBullet `1. 2. 3. 4.`, ourus under `shift` `4. b⏎3. a⏎4. c⏎9. d`, as no app
    does. The doc said "as the text editors, Obsidian in all four setups": now SilverBullet's Enter
    alone, and SilverBullet's SxS setup declares `shift` (MoveDown22, MoveUp14, Scenario13 now
    differ there, TO16 and Outdent9 agree).
  - **Open:** what `shift` does on a move: numbers as written, as now, or renumbered.
  - **The full run, across the rename:** the base's harness refused the tree's spec ("unknown option")
    and its code the option. `test/heavy.ts` now gives the base copy its own `spec/` wherever its
    harness can't read the tree's, as it did only where the notation changed; `test/differential.ts`
    hands an older tree `listNumbers`, `keep` for `shift`, as it does `closeBackticks` for `autoClose`.

### Open

- **Markdown read in `src/commands/` outside quotes:** taken up in the next section.
- **`enterOnEmptyItem` isn't asked in a quote atom:** done in [the plan's open steps](#the-plans-open-steps-2-3-and-5).
- **Leading zeros (`007.`) go where a number changes:** as the apps write them; kept so (same section).

## The other commands' Markdown read through the parser and the doc layer

The same refactoring past quote atoms: what the commands read of Markdown by regex, or by parsing a
text of their own, asked of the parser and the doc layer instead. Of the 30 sites counted, most were
line endings and blanks (`/[\r\n]/`, `/^[ \t]*/`), plain text, not Markdown: they stay. The ones that
read Markdown are gone but one, a decision (Open).

### Refactoring and API

- **A clipboard's Markdown is read back by the doc layer.** `clipboardFragment` and `clipboardSource`
  move from `commands/clipboard.ts` to `doc/copy.ts`, the other half of what copy writes there, and
  `clipboardOf`'s rendering is `renderedHtml` there; `commands/clipboard.ts` keeps which format is the
  Markdown, and the marks. In them:
  - a fence copied from a list or a quote, its line's indentation lost: its block is asked of the
    tree (a delimited block opening the first line at its start, open as it is), and whether its last
    line, dedented, closes it is read by the parser right under the opening line, not matched by a
    regex built from the fence;
  - a block left open is closed by `MdTree.continuedLine`, the opening line again up to its delimiter
    (`MdTree.markup`'s `open` mark), not by a regex for the delimiter and one for the prefix.
- **`MdTree.continuedLine(i, to)`**, new: line `i` up to `to` again on a line after it, its containers'
  prefix as `continuationPrefix` spells it, its own text as written (a tab the prefix split kept).
- **`continuationPrefix` blanks every piece but a quote's `>`**, not only a marker: a footnote
  definition's label (`[^1]: `), repeated, would start another footnote. Found by comparing the new
  clipboard reading with the old on generated clipboards.
- **`MdTree.takesIn(block, line, flavor)`**, new: whether a line right under a block reads as a line
  of it (an HTML block that a blank line ends takes in a fence). Backspace at a fence's start below
  HTML asked it by parsing a text it built (`code.ts`).
- **`MdFlavor.delimiterChar(c)`**, new, from each extension's `delimiterChars`: what delimited blocks'
  delimiters are made of (`` ` `` `~`; `$` `%` in Obsidian). Code's fast path, the host typing what makes
  no delimiter, had them as one regex for every flavor.
- **`OurusProse.unquoted()`**, the doc layer's, was `unquote` in `commands/util.ts`: a quote's text
  without its `>`s, the one a block id's own line holds (`> q⏎> ^x`) read with the doc layer's quote
  syntax, not a regex of its own. Shift-Enter's "does the rest of the quote have a `>`" asks it too.
- **`quoteTextBefore(doc, node, text, to)`** (`commands/quote.ts`): a quote atom's text before an
  offset, each line past its quotes' `>`s as the tree reads them, for whether a block id ends a text
  that has some (`commands/index.ts`, which stripped `^[ \t>]*` by regex).
- **Plain paste reads a pasted line's block id with `mdBlockIdEnd`**, as every reader of block ids
  does, not with a regex of its own (`paste-plain.ts`).

### Behavior changed

- **`$$` or `%%` copied from a list, in a flavor without math or comments** (GFM, CommonMark), pastes
  as a paragraph that keeps its lines' indentation (`$$⏎  x⏎  $$`); the regex took them for a fence
  in every flavor and took it off. It renders the same. In Obsidian nothing changes: there a `$$`
  closes at any indentation, so the block closed as it was and the regex's arm never acted.
  - **Decision:** taken as the parser reads the flavor. Pinned in `test/doc/doc.test.ts`.

Otherwise none: the old and new code compared on 9,630 generated clipboards (`clipboardFragment`, in
three flavors, ours or not), 2,720 runs of the editing keys at every caret in quote atoms with block
ids, and 1,220 plain pastes of lines ending in a block id; the differential run moved no outcome, and
the SxS no verdict.

### Tests

- `test/parser/invariants.test.ts`: `continuationPrefix` and `continuedLine` on quotes, tabs, markers,
  a footnote's label; `takesIn`; each flavor's delimiter characters.
- `test/doc/doc.test.ts`: a clipboard read as a document, 17 cases (a fence from a list, a closing
  before the last line, ourus's own copy, a block left open in a footnote, a quote with a tab, an item).
- `test/doc/text.test.ts`: `unquoted`, a block id's own line and a lazy line among them.
- Regression293, 293b: Backspace at a fence's start after HTML; no case had it.
- `npm test`: every suite passes; `diff` no outcome moved. SxS rejudged: no verdict moved.

### Open

- **`block-ids.ts` parsed the pasted Markdown itself** (`pastedBlockIds`): gone with keeping block
  ids unique (next section).
- **Markdown written in the commands:** a code span's backticks (`typing.ts`, `wrapInCode`) and a
  setext underline's characters (`util.ts`). Writing, the writer's job more than the parser's; left.
- **Kept as they are:** typing's backtick and tilde (which key it is, code fences' own handling);
  `block-ids.ts`'s marking of every `^name` in what is pasted, a tracer read back from the result.

## Block ids aren't kept unique

Obsidian doesn't make block ids unique, and neither does ourus now: a name the note holds is
written like any other. A host that wants them unique sees to it with what ourus gives:
`OurusDoc.blockIds()` (every one, its owner and target), `addBlockId` without a name (one made up,
new), `removeBlockId` with a node (one of a name written twice).

### Removed

- **The rule in `checkBlockIds`** (`doc/block-ids.ts`): "`^x` would be written twice: a link finds one
  of them", and `heldOutside`, which found a name outside the lines it read.
- **Paste's dedup** (`commands/block-ids.ts`, about 150 lines): `pasteKeepingNewBlockIds`, which ran
  every paste twice with each `^name` marked two ways and dropped the pasted ones the note held;
  `markedPaste`, `pastedBlockIds` (the last Markdown parsed in `src/commands/`) and
  `withBlockIdCharacters` (HTML's references decoded to find names in them); its routing in
  `commands/index.ts`, and the branch of `hostKeepsBlockIds` that did a host's paste over to drop
  them. `paste` and `pastePlain` call their commands; `pasteAt` reads its clipboard once,
  `clipboardFragment`'s.
- **Duplicate's**: the copies without block ids, a node that was only one not copied, an emptied quote
  not copied either, a setext title of nothing made ATX, and the caret's ends kept off the ids. A
  copy is its original now, ids and all.
- **`addBlockId`'s refusal of a name the note has**: it writes it, and finds what it wrote by its
  target, not by the name alone.

### Kept

What keeps an existing block id working: one written off its node, naming another or nothing, or
shadowed by another for what it names, refuses; a join of two nodes that both have one is
`joinBlockIds`'s. One rule added, as names are no longer unique: **an id whose characters stay where
they were but no longer read as one** (glued to the text around it) is lost, whatever else of its
name stands in for it. Without it, paste over `«a b»⏎^x` of `q ^x⏎⏎r ^y` deleted first and glued the
note's `^x` to the last line, `r ^y^x`: the pasted `^x`, on the same node, passed for it. Now the
other order is taken, `q ^x⏎^x⏎⏎r ^y`. And one rule narrowed: **shadowed by one of its own name**
for the same block (a copy: duplicating `^x` alone on its line after a quote's list, which names the
list) is no loss, a link by the name finding that block still; shadowed by another name still is.

### Fixed by it

- **A drop of a list copied from inside one** (indented four columns, or by a tab), bringing a name
  the note holds, was refused, `^x would be written twice`: `pastedBlockIds` read it as code and
  dropped nothing, the paste read it as a list. Found while looking at that second reading.
- **B224, B226, B312, B313, B329**, bugs of the removed code: the paste probe's suffix met in the
  text; the caret mapped past an id duplicate removed; HTML references decoded inside comments; a
  copy dropping visible `^a` text; a heading's duplicate failing to write. Out of `test/bugs.ts`.
- **B225** keeps its first case (a quote atom doesn't read a heading's block id); the second, that
  duplicate writes it once, went with the rule. **B311** rewritten: the drag offered places where the
  drop found nothing (the pasted id dropped); now the drop pastes, but two of the places it offers
  are refused (right after a paragraph, a lone `^id` is its block-id line).

### Tests and spec changed (decisions)

All from the decision that ids needn't be unique: each now expects them written as given.

- BlockIds20: duplicate copies `^x` and `^y` with the nodes.
- `test/commands/block-ids.test.ts`: paste, plain paste and a drop keep pasted ids a name the note
  holds too; a name twice in what is pasted stays twice; duplicate copies ids (seven asserts);
  `addBlockId` writes a name the note has; typing ` ^id` beside another `^id` is the host's; a seam
  joining a pasted id is a join of two ids, refused like any (`joinBlockIds: refuse`).
- Removed, as they tested the removed code: the marked paste told apart from the note's ids; what a
  paste declares of an id it drops; the check finding a name outside its lines; three duplicate
  layouts of a copy without its id.
- Added: the glued id (above), the indented drop, a copy's id shadowing its original's (a command
  test and the check's own, by another name and by the same).
- `npm test`: every suite passes. `diff`: 469 duplicates' copies now carry their ids, nothing else
  moved. `inverse`: 23 round trips of one generated note, cut then paste of `- item ^id1` beside
  another `^id1`, closer to coming back (`text` to `blank-` or `caret`: the id stays now), one whole.
  Bugs: 121 open, 217 cases (was 126, 223). SxS rejudged: no verdict moved (no app runs BlockIds20).

## The plan's open steps: 2, 3 and 5

`dev/next.md` cleared of what is done (steps 3 and 4 gone, step 2 down to its two decisions, step 5
to what is left, every fixed bug's mention out but where it says why a test is worth having), then
its small items, step 2's P2s, step 3 and what of step 5 needs no decision.

### Fixed

- **B225: a quote atom reads a heading's block id** (`> # h ^x`, ATX with its closing run, setext):
  the doc layer reads a quote atom's line by the parser's line markup, a paragraph's last line or a
  heading's title's, not a paragraph's last line past `[ \t>]*` by regex (`stringBlockIds`).
- **B311: a drag from outside offers only the places its drop pastes at.** A paragraph that is only
  a block id, right after a block, is that block's block-id line: `pasteRefused` says so.
- **`enterOnEmptyItem` in a quote atom.** An empty item not last in its list goes as the option says
  (`sibling`, the default, a new item, numbered; `outdent` its parent's next, at the top the list
  left; `exit` the one nested, the other at the top; `unwrap` its marker gone, at its depth); the last
  outdents with every value, as everywhere. Its children: the blocks after its text, a list first too.
- **B260: the clipboard's HTML is the copy as it read in its note** (`renderedHtml`, `doc/copy.ts`):
  text from inside a paragraph the paragraph text it was (`# Heading` no heading: the escapes
  `escapeParagraph` asks for); blocks read after a blank line (`---` no front matter); the note's link
  and footnote definitions after it; a footnote definition copied without a reference its content
  (`MdTree.unreferencedFootnotes`, new: GFM renders none such). And a block id's blank before it is
  its node's now, rendering nothing (`<li>a</li>`, not `<li>a </li>`).
- **B305: a command at the note's end, its last line blank but not empty, keeps that blank line**
  (`- a⏎⏎-┃⏎␠`, Backspace): written copied with the text before it, its line ending was taken off as
  the old text had none, and an empty last line is no line (`endAsWas`, `write.ts`). Its quote case,
  a copy's blank lines taken as the root's, `>` lost: **B341**, new, P3 (`quotes: container`).
- **B214: one `editableStart`** (`view/select.ts`) for a caret entering a node: the zoom from before
  it, a subtree selection left. It goes through textless containers (`rootStart` didn't) and, decorated,
  to blank code's code line (`editStart`'s, which it replaces); leaving a selection into a fold opens
  it (`unfoldedForCaret`), not landing on the folded row's fence.
- **B250 and B196: Markdown's blank, not JavaScript's.** A label's normalization, the read-back's
  blank line, a fence's info, an ATX run, `#` before a blank, a joined heading's spaces and a closing
  frame (`trimMd`, `[ \t\r\n]`); `isBlankChar` without the vertical tab and form feed, as the block
  parser reads a line; typing a no-break space at a bare marker placed as text, and a plain paste
  there under `pastePlainLines: enter` too (`placedText`). **A lint**, `test/text.test.ts`: no `trim()`
  or `\s` in `src/` but where a line says why (an option, Obsidian's own syntax, HTML's, plain lines
  pasted as blocks: PastePlain14).
- **B242 and B244: pair, wrap and take back written once** (`typing.ts`) against a `PairPlace`: prose,
  a quote atom's text, code's, and where each has markup no pair goes in (a prose line's frame, a quote
  line's `>`s and marker as the line's markup reads them, `quoteLineTextFrom`; a fence's line). A quote
  atom pairs and wraps; code takes a pair of ours back and closes a double listed alone; `bracketInCode`
  gone. `$` stays prose's.
- **B236: `addBlockId` on an empty paragraph is refused** (`not-expressible`): the id alone would be no
  paragraph. An empty item takes one.
- **B239: a placeholder on a text's empty first line settles**, the line going, as an empty last line's
  does (`settled`, `settle.ts`).
- **Settling opens no fold** (`settlePlaceholders`), though it writes a hidden node again: no edit of
  the user's. The folds the caret's move had stay, but one with nothing to hide.
- **B237's shape reached from keys** (`- a⏎  ┃```…`, Delete, Alt-Down): the draft settles the held
  spaces of a text it carries as it was in a subtree it moved, as of a text it sets
  (`#settleHeldSpaces`). B237 is P3 now: its cases left are hand-built. (First for every carried node,
  which turned a parent's held space, given a child, into a fence's padding: the full run's `diff`
  found it; moved subtrees only.)
- **One `placeMarker`** (`writer/draft.ts`): a new item's marker, three copies in the draft and the
  writer before.

### Checked, left as is

- **Leading zeros (`007.`).** Obsidian, bare and in Live Preview, writes `8.` after `007.` (and
  rewrites `007.` as `7.`); the apps but none keep them. Regression143 says `8.`, as they do. A padding
  tried, `008.`, was taken back: every app would disagree.
- **D6** replayed: as recorded.

### Tests and spec changed (decisions)

- **Fold20 and Regression199**: `> - ◌⏎> ^x` settles to `> - ^x`, the id still naming the item; they
  recorded the placeholder dropped and `^x` naming the whole list, the loss B240 describes. The fold
  kept: Fold20's two steps (a placeholder that can't settle dropped first) move to a test of their own,
  a held space in code (`test/view/view.test.ts`), the one carry it compared no longer being the point.
- `test/parser/obsidian.test.ts`: a block id's blank before it renders nothing (`<p>Some text</p>`), and
  its inline node starts at the blank.
- **B227 removed**, a policy question: `addBlockId` was to refuse `^X` where the note has `^x`. Block
  ids aren't kept unique, case or not.
- Added: a table of `enterOnEmptyItem`'s values in a quote atom; the cases of B196, B214, B225, B236,
  B239, B242, B244, B250, B260, B305, B311 and B237's two, each where its code is tested; the
  whitespace lint; `continuedLine`'s and `unreferencedFootnotes`' parser cases.
- Bugs: 110 open, 191 cases (was 121, 217); P2 21 (was 25); `write-failed` 66.
- `npm test`: every suite passes, 0 regressions. `diff`'s moved outcomes, each read: moves settling a
  held space they carry (B237); `> - ◌⏎> ^x`'s settling keeping `^x` on the item (B239), through copy,
  indent, outdent and `pasteAt`; a quote atom's Enter on an empty item as `enterOnEmptyItem: sibling`
  says; one outdent's held first line settled.
- **The full SxS, every app run** (23, none erring): against the last committed run, 16 cases from a
  whitespace difference to agreeing and 3 from disagreeing; worse, Regression111's whitespace in five
  block apps and SilverBullet's moves under `shift` and Quote31 (judged before), and four that moved
  in an app's run alone, their spec and ourus's output unchanged (Scenario28 in Logseq, MoveSubtree12
  and 24 in true-outliner, PasteList27 in Tine). New cells, the cases added since the last committed
  run (Regression269 to 293), 310 of them: 145 agree; where a camp is against ourus, mostly the quote
  atom's (Regression280, 286, 287, 290: 2 to 4 of 12 agree) and the refusals (Regression291), to read.

### Open

- **B223** (P2): decided and done ([below](#b223-a-quotes-block-id-stays-at-its-end)). B240 and D22:
  decided, below.
- **B228** (policy): closed as the host's ([Four decisions](#four-decisions)).
- **Ordered lists, measured** (no code changed):
  - every app's agreement rejudged under `renumber` and under `shift`: `shift` wins only Emacs (+4,
    were it declared so) and SilverBullet (+1, 417 to 416); every other app loses up to 10 (Obsidian,
    Live Preview). `renumber` stays the default, rightly.
  - `1. a┃⏎1. b⏎1. c`, Enter, in every app: no text editor keeps a list numbered alike so. Obsidian, all
    four setups, `1. 2. 3. 4.`; SilverBullet `1. 2. 1. 1.`, which is `shift` without the alike rule;
    Emacs writes no marker. Moving `a` down, Obsidian and SilverBullet renumber (`1. 2. 3.`), Emacs
    keeps them as written. ourus's rule keeping such a list alike (`alikeNumbers`) was a disagreement
    of its own, with every text editor: dropped ([Four decisions](#four-decisions)).
- **B237**'s hand-built shapes, parked until a key sequence reaches one (`dev/next.md`, step 5);
  **B341** (above). Gaps as one record: [done](#step-5-part-3-a-gap-is-one-record).

## The readback reads edited code's meaning

Step 1's readback on meaning. The check (`writer/check.ts`) compared a verbatim block's code as it
reads only where the draft kept its body (B294's re-indented fence, refused since); code the draft
edited was compared as spelled, so edited and written at another column, a tab-led line could read
as other code and pass.

- **Edited code is read as the edit means it, where the block was.** The draft's new text read at the
  block's old content column, as the old document had it, against the written document's reading. The
  edit is stated in the old context: reading both sides where the code is now would compare the new
  reading with itself, and the blind spot would stay. Code made anew has no old context and means what
  it spells.
- **`OurusDoc.verbatimLinesAt(text, column)`**, new: the code an atom's text means written at a
  column, read as `verbatimLinesOf` reads a document's (a tab partly taken its rest as spaces).
  `readsAs` and it share one reading (`#readAt`), the item wrapping that puts a text off a tab stop.
- **Found by it:** a fence one space in, its code `→PAYLOAD` (`   PAYLOAD`), edited and moved under an
  item in one draft, wrote ` PAYLOADy`, the meaning changed, unchecked; refused now. A tab at a stop,
  or spaces, keep their meaning there, and write. `test/writer/draft.test.ts`.
- `npm test`: every suite passes; `diff` moved no outcome, so nothing the commands write is refused by
  it (no command edits code and moves it in one step yet; it guards step 8's writer).

## Shadowing is the host's too; settling a host's rule

Decided with the user: as with uniqueness, ourus refuses no shadowing. Two block ids on one block
(the later shadowing the earlier for what it names) is a host's choice to allow or not; ourus writes
what it is given and says which counts (`OurusDoc.blockIds()`, `shadowed`).

- **Removed:** `checkBlockIds`'s rule, "`^x` would be shadowed by another block id for what it names"
  (and the narrowing added before, same name, same block); `addBlockId`'s refusal where an id names
  the block already, and its check that what it wrote isn't shadowed.
- **`addBlockId` on a block an id names writes a second**, the first kept: where the text ends in the
  first, the second on a line of its own after it (`a ^x⏎⏎^n`), as at the text's end the first would
  be text (`a ^x ^n`), a loss the check refuses.
- **B240 closed**: settling's fallback, which shadowed `^x` by `^y`, does what is allowed now; its
  normal path settles the case, the check no longer refusing.
- **D22 is a host's rule**: a host calls `settlePlaceholders` every time the caret leaves a line
  (`commands/README.md`, the host's contract, step 3, **Required**). ourus assumes no placeholder off
  the caret's line when a command runs.
- **Tests changed (decisions):** the check of a shadowing edit, `null` both ways; `addBlockId` on a
  block an id names writes a second (`- a ^n⏎⏎  inner prose ^x8`, `a ^x⏎⏎^n`); the property test's
  `linked` counts an id that names something, shadowed or not. `spec/block-ids.md`'s intro and
  `dev/24-block-ids.md`'s note say so.

## CI: an empty item given a table or a first child

CI's run (`TEST_BASE_REV: HEAD~1`) failed on the last commit: one `diff` regression. A local `npm
test` compares with `HEAD`, the same code on a clean tree, so it can't see one.

- **A table pasted into an empty item that a blank line ends failed to write.** `- ┃⏎⏎  - c`: the
  blank line ends the item, so `  - c` is an item of its own; once the item has text, those two columns
  make `  - c` its child. The seam check for an empty item given text (`filled`, `draft.ts`) counted
  only prose, and the table, an atom since B304, got past it. It counts any text now: refused, as plain
  paste is, and as the commit before refused it. B193's case of it moved out of `test/bugs.ts`, and
  `dev/28-bugs.md`'s B304 entry, which said the shape was refused already, corrected. Regression291.
- **Enter zoomed into such an item failed to write too**, older: the same check asked nothing about
  an empty item's first child, which gives it a content column as text does. Refused now; the view's
  pass found it on Regression291's start. Regression292.

## B223: a quote's block id stays at its end

Decided with the user, following the apps: a block id ending a quote's last block names the whole quote
(D25, measured in Obsidian), so where a command leaves a block after that one in the quote, the id
goes with the quote's end.

- **`#keepQuoteIds`** (`draft.ts`, run as `done()` starts; Enter's alone since, `keepQuoteIds()`, [Four
  decisions](#four-decisions)): an id naming a quote, written at the end of
  a block that is no longer the quote's last, goes to the end of the new last block's text, declared
  moved (`movedBlockIds`); where that block ends in its name already (a copy's), the original's goes.
  Not where its block left the quote, and not where the new last block has no text: Enter at the
  quote's very end leaves the id on its block, an empty paragraph after it, as Obsidian does.
- **Cases:** Enter mid-line in a callout's body (`> bo┃dy ^id` → `> bo⏎>⏎> dy ^id`, the id carried
  on a line of its own too); a duplicate of the quote's last block, quotes as atoms and as containers.
  B223 moved out of `test/bugs.ts` into `test/commands/block-ids.test.ts`.
- **D25 closed**: where the id goes when Enter lands right before it (it stays on its block).

## Block-id loss protection removed

Decided with the user, as for uniqueness and shadowing: whether a block id is kept through an edit is
the host's to check, with `OurusDoc.blockIds()` before and after. ourus refused commands and host keys
that would lose one; it refuses none now, and the code that did it is gone.

### Removed

- **`checkBlockIds`** (`doc/block-ids.ts`, about 200 lines): the rule (an id on the node it was on,
  naming what it named), its region reading, its allowances (`BlockIdAllowances`: declared, taken,
  removed, edited) and B223's rule added to it. `readBlockIds` reads the whole note now, the region
  parameter gone. `BlockIdDeclarations` stays: `movedBlockIds` and `mergedBlockIds` are still reported.
- **The command entry's checks** (`commands/index.ts`): `keepsBlockIds` on every result,
  `hostKeepsBlockIds` on every deferral (the host's edit played, and ourus's own run where it kept the
  ids), `takenBy`, `TAKES_SELECTION`.
- **Settling's check** (`writer/settle.ts`): its normal path writes what the readback accepts.
- **`addBlockId` and `removeBlockId`'s loss checks** after writing; their refusals of input stay (no
  node, a stray id, a bad name, a name written twice without a node, nothing to remove).
- **Cut-then-act's reversal** (`commands/copy.ts`, `afterDeleting`): run the other way round where the
  first order lost an id. The inline reversal, which keeps a selection's blank, stays.
- **`joinBlockIds`** (`config.ts`): a join of two nodes that both have an id always merges, as `merge`
  did: the node that stays keeps its own, the other's goes, `mergedBlockIds` says which into which. The
  draft's `block-id` refusal is gone with it.
- **Shift-Enter's refusal** to split a quote that carries a block-id line: the line goes to the second
  paragraph, the quote's last block (`> a┃⏎> b⏎⏎^x` → `> a⏎> ┃⏎> b⏎>⏎> ^x`), as `#keepQuoteIds` has it.
- **D27 closed**: Backspace on a paragraph's only character before its id is the host's (`a┃ ^id`),
  or ourus's under `markup: decorated` (`a ^id┃` → `^id`), no longer refused.

### Behavior changed

- A key left to the host is the host's whatever its edit does to a block id: typing over a selection
  across nodes (`- a┃b ^x⏎- c┃d`) is deferred, the host's replacement dropping `^x`, where ourus ran it
  as a deletion then the text before.
- A paste with seams open that joins a pasted id to the text's merges them (the text's kept).
- **B342 (new, P3):** a paste over a text a block-id line ends glues the id to the last pasted line:
  `a b⏎^x`, `a b` selected, `q ^x⏎⏎r ^y` pasted → `q ^x⏎⏎r ^y^x`. The selection deleted first leaves
  `^x` a paragraph of its own, and a multi-line paste before it gets no blank after its last line (a
  one-line paste does). The reversal used to avoid it. Running every one-text paste the other way round
  moved Regression63 and 85, so it is a bug to fix on its own.
  **Fixed since:** a paste over all of a text a block id ends runs the other way round (`afterDeleting`,
  `takesTextWithBlockIds`: only there, so Regression63 and 85 stay), and a structured paste there joins
  the text rather than going before it (`inPlace` off): the id stays with the node, as a split keeps it
  with the node the caret was in, `q ^x⏎^x⏎⏎r ^y`, and `q⏎⏎r` gives `q⏎^x⏎⏎r`. Out of `test/bugs.ts`,
  a regression test in `block-ids.test.ts`.

### Tests and spec changed (decisions)

- **BlockIds12**: two items with ids joined merge (`- a┃b ^x`), no longer refused. `spec/block-ids.md`'s
  intro says what is the host's.
- `test/commands/block-ids.test.ts`: the check's direct tests, its region-against-whole property test,
  and the second check by names (commands, typing, settling) removed; the generated-documents test keeps
  only "no `write-failed` that block ids make". Refusal assertions now say what is written or deferred:
  a merge, a host's key, typing over a selection across nodes, paste with open seams, Shift-Enter in a
  quote. `test/doc/block-ids.test.ts`: the shadowing check's test removed.
- `test/commands/commands.test.ts`: a drag's deletion in an id's markup is the host's.
- `dev/24-block-ids.md`'s note, the commands, doc and writer READMEs and `RejectReason`'s `block-id`
  (now only `addBlockId` and `removeBlockId`'s) say so.

### Measured

`npm test` passes. The diff's moved outcomes are all this change: 782 runs from `rejected block-id`
to the host's or to a written result, 3 from written to the host's (typing over a selection across
nodes). The inverse suite gained 5 round trips. SxS, rejudged: 5 fewer disagreements, Regression272
now agreeing with Obsidian, its Live Preview, the Outliner plugin, SilverBullet and Emacs.

## The selection is the view's

Decided with the user: the selection is state of one reader's view, as its folds and zoom are, so
`OurusView` holds it, as CodeMirror's `EditorState` does (the view is its analog: one pane's document
and selection, immutable, each change giving the next). The document stays shared between views. No
alias for the old API: ourus is unreleased.

- **`OurusView`:** `selection`, `withSelection(sel | pos)` (a number a caret there), `OurusView.of(doc,
  { selection })`, a caret at the start by default. `update` and `withDoc` map it through the changes,
  before what is inserted at it; `update({ selection })` or `update({ caret })` sets a host's.
  `caret: n` is an alias of a selection whose ends are both n, `selection: n` too; the document reads
  the selection's head as its caret (`OurusDoc.update`'s, which keeps a node a deletion would take
  with a placeholder). Fixed on the way: `selection` set the view's but not the document's, so
  `selection: { anchor: 3, head: 3 }` lost the placeholder `caret: 3` kept. ourus's own cut and typed
  characters keep giving the document no caret, as before.
  `touchedSubtrees`, `selectedSubtrees` and `visibleSelection` read the view's by default.
- **`executeCommand(view, command)`** acts at `view.selection`; **`settlePlaceholders(view)`** at its
  head. `OurusSuccess` and settling's result are `{ view, changes }`, the selection after
  `view.selection`: the spread-and-replace of a selection (`{ ...result, selection }`) is
  `view: result.view.withSelection(s)`.
- **`CommandContext(view, nodes?)`** reads its selection from its view; a step on another's result is
  `new CommandContext(result.view)`, no selection carried beside it.
- **The test player's state** (`PlayedState`) holds no selection of its own either.
- **Tests:** about 160 calls rewritten; a selection command keeps the document, folds and zoom (it
  returned the same view before); a new test of the view's selection. The diff suite's adapter
  speaks both APIs, the last commit's and this one.
- **Measured:** `npm test` passes; the diff against the last commit: no outcome moved.
- **`␄`, the end of a buffer's text** (decided with the user): `q⏎┃␄` is `q⏎` with the caret past its
  last line break, which no buffer could draw (each ends with a line break, so `q⏎┃` is `q⏎⏎`), and
  `┃q␄` a text with no final line break. Read by `readDrawing`, drawn by `drawState` (`endingText`)
  wherever a drawing would end without a line break; a buffer that draws no caret drops one the caret
  alone made. `spec/README.md` says so; no case changed; a test in `specfile.test.ts`.
  The SxS reads a run stored before it the same way (`readDoc`, `sxs/run.ts`: a drawing that ends
  without a line break is one with `␄` after it), so no app needs a run again.
- **Settling keeps the placeholders on every line the selection touches** (decided with the user),
  from its anchor's line to its head's, where it kept the head's line alone: Shift-Down from a held
  empty line took the line from under the selection's anchor, which went to the end of the line
  above, so the selection then covered other text than the one started. No app does that: block
  outliners keep empty blocks as nodes, text editors change no text as the selection moves, and the
  code editors that drop whitespace they put in (VS Code's `trimAutoWhitespace`, Emacs's electric
  indent) do it as the caret leaves the line. `settleSteps(doc, selection)`; `settlePlaceholders`
  passes the view's. **Placeholder16 changed (a decision):** `selectDocStart` from a held item keeps it
  (`┃«- a⏎  - »◌`), a caret then at the start settles it. The host's contract says "the selection's
  lines". `test/placeholders.test.ts`'s zoom case settles from the blank line after the held one.
  New cases: Placeholder21 (an empty paragraph kept while selected down to the note's end, gone with
  the caret at the start), Placeholder22 (a held space kept while the selection reaches the next item,
  settled as Placeholder17 settles it once the caret is off its line), Placeholder23 (a selection
  collapsed back on the held line keeps it); the transitions table has the row.

## Four decisions

Taken with the user, each as recommended but the first:

- **A join of two nodes that both have a block id keeps one** (the node that stays's, the other's
  dropped, `mergedBlockIds` saying which into which), as now: Obsidian reads no second id on one line,
  and keeping both would set a blank line in a tight list.
- **B223's rule is Enter's alone.** `keepQuoteIds()` (`draft.ts`), which `done()` ran for every
  draft, is a method Enter's split calls: an id naming a quote, at its last block's end, goes with
  the lower half, as a text editor's Enter leaves it at the line's end. A duplicate, a paste or a move
  below that block leaves it on its block, as text editors do: a copy of the quote's last block keeps
  it as written, the original's naming its block, the copy's the quote (`> # h ^id⏎> # h ^id`). The
  B223 test says so.
- **B228 closed: labels are the host's, as block ids.** A duplicate or paste writes a footnote or
  reference definition as it is, a label the note defines too. Out of `test/bugs.ts`, a test of the
  behavior in `commands.test.ts`.
- **A list numbered alike is numbered as any other** (`alikeNumbers` gone from `draft.ts`): under
  `renumber`, `1. a┃⏎1. b`, Enter, gives `1. 2. 3.`, as every text editor numbers it. Regression48, 58,
  60 and 63 (alignment cases whose lists happened to be numbered alike) and a quote atom's case in
  `commands.test.ts` changed their numbers (decisions).

`npm test` passes. The diff's moved outcomes are this numbering alone: every text shown differs from
the last commit's in its list numbers only. It also found two runs that fail to write in both
copies, the last commit's too, on documents the new spec cases added to its corpus: B343 (a line
break pasted before a tab-led fence after a quote) and B344 (tab-led lines pasted after a held
padding), both P3, in the tab-led cluster. 109 open bugs. SxS, rejudged: 2 fewer disagreements (Obsidian one more
agreement, true-outliner one a caret's), both in regressions.md.

## Step 5, part 1: settling's fallback

Planned as "settling goes through the commands' checks": its fallback, a placeholder no draft can
write again dropped by a plain document update, skipped the checks a command's result gets. With the
block-id check gone, what it skipped is nothing: it writes no text (its changes are none, the text read
as the saved file will be), a caret's move can't be refused, and the selection was already placed
after it. What was left is one duplicate: settling placed its selection with a zoom clamp of its own
before `visibleSelection`, which clamps to the zoom too; it calls `visibleSelection` alone now, as a
command's does (`commands/settle.ts`). The step's item and the "paths that write without the
readback" row are out of `dev/next.md`. What settling does when it can't write a node again (the
placeholder dropped, the text kept, a view with no changes for the host to take all the same) is
documented now: `settlePlaceholders` and the host's contract in `commands/README.md`, `settleSteps`
in `writer/README.md`, and `spec/placeholders.md`.

## Step 5, part 3: a gap is one record

`statedGaps`, `carriedGaps`, `gapFloors`, `gapLines` and `autoGaps`, five maps by node in `draft.ts`
(`done()` read two of them in a copy and changed the other two in the draft's own), are one map of
records, `GapOrigin`: stated by the command, taken from which node, the old lines to copy, the author's
lines it keeps at least, raised for Markdown's sake. A split, a join, a move and `inheritGap` set one
record; `done()` works on a copy of them; the writer reads `gaps` for the lines and the `auto` mark.
No behavior changed.

The checks the proposal had, that a record holds after the layout (its lines span the gap, `auto` on
a gap of one or more, a floor no more than the gap), don't hold, measured over `npm run test:fast`:
lines of none recorded under a gap later raised to one (63 times), a floor above a gap later lowered
to none (41), an `auto` on a gap lowered to none (1). None is a bug: a later change to the gap leaves
the record stale, and its readers make up for it (the writer copies the lines only where they span
the gap). Not added as checks.

**Kept true since.** At its end `done()` drops the recorded lines a later change to the gap left
fewer or more than it, to be written anew: what the writer did on its own before, finding them not
spanning it, and its own test of it is gone. Dropping them at each change instead moved outcomes: a gap
can miss its lines for a while and match them again (pasting next to a line of spaces kept the
author's spaces only so). A floor and an `auto` mark are read at one point each, and `GapOrigin` says
when each holds (a floor above a gap lowered after, an `auto` on a gap lowered to none, mean nothing).
`npm test`: no outcome moved.

## B296 and B303: the lines a seam is judged by

Both were the seam check (`#apart`, `draft.ts`) reading the node above from `#lastLines` as it isn't
written, so a blank line was judged not needed where it was:

- **B296:** a node made another kind, `second`, a paragraph in a quote, made an item by Tab, was read
  as `- second`, without the quote's `> `; under it, the empty quote `>` looked apart, and the blank
  line of ours between them went: `> - second⏎>`, one quote. A node made, or made another kind, is
  now read after the prefix of the container it is in, as a read one's lines are: `> - second`, the
  blank line kept.
- **B303:** `c`, four spaces in under `p` whose content column is two, moved out after `p`, was read
  at its old depth, `    - c`, which `z` after it can't continue (code); written at its new one,
  `- c`, it does, and no blank line was set between them. A node moved up from deeper in what is read
  is now lined up as one moved in from elsewhere (`#movedIn`'s dedent), but tab-led lines, read as
  they were: that dedent counts spaces (the first try, without the exception, broke a tab-indented
  outdent the property test found).

B190's outdent case, the same cause, is refused now as it should be (a test in `commands.test.ts`);
its indent case stays open. 107 open bugs.

## Smaller batches: B252, B219, module state

- **B252:** front matter's opening looked ahead on raw lines (`MdMachine.lookAhead`), which a
  sentinel on the closing fence doesn't change, so it opened front matter that real reading never
  closed. The look-ahead reads a line as `read` will, sentinels in (one `asRead` for both). A test in
  `test/parser/obsidian.test.ts`.
- **B219:** the zoom guard (`view/escape.ts`, `commands/zoom.ts`) compared a summary. It checks the
  outside children's order now, in the changed middle it already walks; a node made outside by
  membership (an id `doc` doesn't have), not by `nextId`, which a branch's older id slips under; and a
  host's removal of the root by its outline too (`escape(next, true)`), not its text alone, which can
  hold a held empty paragraph more. Its three cases a test in `test/view/view.test.ts`.
- **No module state:** `html-parser.ts`'s `writeHardBreaks`, set around a parse, is a parameter of
  `writeAll` and `write`; `obsidian.ts`'s cache of the block id ending a text is in the inline
  parser's `memo`, per text.
- **B251 left:** an email autolink split by an escape or entity. The rule sees text nodes alone;
  matching over the decoded text, and an autolink taking in an escape, changes what the document layer
  reads as an escape. A proposal, not a small batch: in `dev/next.md`.

105 open bugs.

## The command entry, results and failures as data, lints

Five refactorings, decided with the user, `npm test` green after each with no outcome moved:

- **The command entry in three steps** (`commands/index.ts`): `commandSite` says where a command acts
  and why there (`given`; `block-id-join`, `block-id-name`, `block-id-line` around a block id), `runAt`
  runs it there (the host's default where ourus has none), `zoomed` checks the result. One function
  did all three.
- **A write failure is data, and its own result.** The writer's `WriteFailure` has a code (the rule it
  has none of: `moved-indent`, `marker-on-child-line`, ...); the readback's difference is a
  `ReadbackDifference` (`path`, `code`, `expected`, `actual`), its sentence made from it
  (`describeDifference`), the same words as before. The draft's refusal is a union, `not-expressible` or
  a `WriteFailed` (`phase`: `draft`, `writer`, `readback`, `depth`, `command`), flat, not nested. In
  the public result `write-failed` is no `RejectReason`: `OurusFailed`, a fourth outcome beside
  success, refusal and deferral, a bug in ourus that a host reports (the cm6 demo says so). The reports
  (sessions, sweep, conserve) group by phase and code (`write-failed (readback children)`); their
  baselines and the bugs' recorded again, the same sentences under the new prefix. The diff suite's
  adapter reads `OurusFailed` as the refusal it was, so the last commit's outcomes compare.
- **A deferral gives its reason**: `host-default` (57 sites), `in-markup` (14), `not-done` (2, the
  backlog); none says nothing now.
- **Lints:** no array spread into a call's arguments but one said bounded (`test/lints.test.ts`, its
  scan `test/lib/source-scan.ts`; three bounded, the rest through `pushAll`, `spliceIn` and `largest`,
  `src/text/arrays.ts`, `spliceIn` moved there from the draft). A recursion lint left out: 55 functions
  call themselves, nearly all walks over the outline, and marking each would be ceremony; the test
  below finds a recursion that passes the stack. **`test/extremes.ts`**, a suite of `npm test` (seconds
  long): the public API on a note 10,000 levels deep and one of 200,000 siblings, HTML as deep and as
  wide. It found one: `doc.blockIds()` walked the outline by recursion, by a stack now.
- **A style parsed once** (`cssOf`, `html-parser.ts`): every reading of an element's `style` (Word's
  list levels, bullets, a cell's alignment, formatting) goes through it; spaces, case, `!important`
  and a property's whole name read as CSS reads them. Four of B265's six cases, a test now; B265 left
  with `inherit` and an inherited decoration. The rest of the HTML batch changes output: with its bugs.

## The demos

Nothing type-checked them in `npm test`, so this round's API changes broke two silently:

- **textarea:** it passed the selection as a third argument, which `executeCommand` no longer takes,
  so every command acted at the view's default caret, 0 (Enter at the note's start), and then read
  `result.selection`, gone, and threw. Settling the same. It puts the textarea's selection on the view
  now, and says a write failure is a bug in ourus. Played in headless Chromium: Enter, typing, Tab,
  Shift-Tab, Enter on an empty item and settling act at the caret.
- **GTK:** older still, `executeCommand(doc, …)` from before `OurusView`, results by a `status` field.
  On the current API now, and type-checked (`demos/gtk/tsconfig.json`, its JavaScript checked, GJS's
  `gi://` modules untyped in `gi.d.ts`); it builds, GJS isn't on this machine to run it.
- **`npm test`'s `types`** runs `npm run typecheck`: the sources, the tests, and the three demos.
- **cm6's smoke test** (`demos/cm6/smoke.ts`): three expectations older than this round, behavior the
  spec decided since, matched to it (a decision): Delete at an item's text start keeps the space as
  padding (`heldSpace: repair`, Placeholder17); Enter keeps the space before the caret on the first
  half (`enterSplitSpace: drop`); a held empty last line goes when left (B23). 93 of 93.

## Refusals in words; extensions' delimiters

- **B259: a refusal names a node in words** (`doc/names.ts`: `nodeName`, `nameOf`, `withArticle`):
  `a rule has no level to leave`, `can't join into code`, not `a atom`, `code_block`. Every detail
  that named a kind or a block type goes through it, the commands' eight and the draft's nine (which
  had made their own, `type.replace('_', ' ')`). B21's recorded refusal reads `the code` for `the
  indented code`. A test in `commands.test.ts`.
- **B255: an extension's delimiter** (`parser/inlines.ts`): CommonMark's rule of three is a rule's
  own flag, `ruleOfThree`, set on `*`, `_`, and the shipped flavors' `~` and `=`, which have always
  been read so; an extension's delimiter isn't held to it unless it asks. A delimiter run counts code
  points, its width kept, so an astral delimiter (`💥`) keeps its surrogates together. Tested through
  the public entry, `ourus/extend`, two extensions at once (`test/parser/extend.test.ts`).

103 open bugs; `npm test` green, no outcome moved.

## The normalized draft

Step 8's first refactoring, done on its own. The writer and the readback read the mutable
`OurusDraft` through a dozen getters that threw before `done()`, and through the command's asks (the
markers, separators and line-ups it wanted) as the draft held them. Now `done()` builds a
`NormalizedDraft` (`writer/normalized.ts`): immutable, its maps copies, frozen, what the normal form
fixed (`NormalForm`: the outline, the selection's ends, lists, escapes, columns, origins, gaps,
preamble, paddings) and what the command asked of the writer (`WriterAsks`: the nodes placed, split
from, hints, separators, line-ups), with `originOf`, `textOf` and `separatorAt`. `write()` and
`differenceFrom` take it and nothing else. `OurusDraft` lost the getters of the normal form; a test
reads it through `draft.normalized()`. The separator's rule is one function both use. No behavior
changed: `npm test` green, no outcome moved.

Then the modules, so the boundary holds in the imports too, not only in `write()`'s argument:

- **`write.ts` and `check.ts` import nothing of `draft.ts`.** The normal form's types (`Anchor`,
  `ListPlace`, `GapOrigin`) are `normalized.ts`'s; `WriteFailed`, the failure as data, `write.ts`'s,
  and `write()` returns it rather than any refusal. `draft.ts` and `write.ts` imported each other.
- **`lines.ts`**: how a line is spelled, where the draft predicts what the writer writes (an item's
  marker, `placeMarker` and `markerOf`; the indentation unit, `indentUnitOf`; a line's prefix as
  written, `continuationAsWas`; blank columns, `whitespace` and `columns`; a text's block-id
  lines). The draft took these from the writer. Moved as they were: making the two predictions one
  is step 8's.
- **`OurusDraft` has no getters of the command's asks** (`placedIds`, `splitFrom`, `hints`,
  `separators`, `lineUps`, `separatorAt`). `done()`'s phases read them as one `WriterAsks`, the
  record the normalized draft copies.
- `test/boundaries.test.ts` checks the writer's files in an order too (`normalized`, `lines`, `check`,
  `write`, `draft`, `settle`, `index`): an import goes down it, so the writer and the readback can't
  import `draft.ts`.

## Coordinate types

Step 8's other prerequisite. Numbers that say where something is are branded by what they count
(`src/text/coords.ts`), names decided with the user: `DocPos` (an offset into a document's text),
`LocalOffset` (into a node's text), `LineOffset` (from a line's start), `LineIndex`, `ColumnIndex`
(visual, tabs to stops of 4), `NodeId`, and in the writer `NewPos` (the text it writes). A branded
number reads as a number for free; a plain one becomes one through its function (`docPos(n)`, ...).
Widths, counts and indices into any other string stay plain. In four steps, `npm test` green after
each, no outcome moved:

1. **The parser's lines**: `MdLine` and `MdPrefixPiece` (`DocPos`, `ColumnIndex`, `LineIndex`), an
   item's `markerStart`/`markerEnd` and a cell's `start`/`end` (`LineOffset`), `markerFrom`/`markerTo`.
   `atLine(line, k)` is the one way from a line offset to a position, at the 15 sites that added
   `line.from + attrs.markerStart` by hand. The machine sets block attributes as
   `Record<string, unknown>` (extensions set their own), so they are checked where read, not where set.
2. **Positions of the document**: `posOf` gives a `DocPos`, `offsetOf` a `LocalOffset`, `lineAt`
   branded lines; the normal form's `Anchor` holds a `LocalOffset` or a `DocPos`, branded where the
   draft resolves a command's `AnchorSpec`. Their parameters stay plain: branding them made 161
   errors, every one a plain number from an unbranded source (the selection, an `OurusText`'s
   offsets, the parser's markup), none a kind mixed up; branding those sources is the commands', left.
3. **Node ids and columns**: `NodeId` on every node, the draft's operations and maps, `NodeRef`, the
   normal form's keys, the commands that hold ids (`NO_NODE`, the id no node has, for `?? -1`); the
   normal form's `columns` (`ColumnIndex`), `columns()` and `advanceColumns` return one.
   `whitespace` and `separatorAt` take plain columns: every call passes a sum.
4. **The writer's two texts**: `NewPos` for what it writes (`length`, a piece's `at`, a spelled
   text's starts, marks, blank lines' starts, `mapOld`, `mapGone`, `anchor`), `DocPos` for a piece's
   old range, `LineIndex` for a shift's and a widened marker's lines. The three places that cross from
   old to new are visible now: `mapOld` (a piece's `at` plus the distance into it), an anchor of a
   draft that changed nothing (the new text is the old), and a copy's text written anew before its
   old text.

What it found: no bug, no kind mixed up anywhere it was checked. What it made plain: in `write.ts`
`from`/`to` were lines in a `Shift` and a widened marker, positions in `copied` and `lineMarkers`, and
`copyPieces` holds indices of `pieces` (said so now). By the stop rule agreed, `draft.ts` is left
(step 5 was for mix-ups step 4 found), and the writer's maps keyed by old line keep plain keys (loop
counters). Left open in `dev/next.md`: the commands' sources of positions.

## Import cycles inside components

The boundaries test's writer order raised it: files of a component imported each other round cycles
in `parser` (13 files), `doc` (6), `view` (2) and `commands` (three groups). Decided with the user:
break the small ones, leave the parser.

- **`doc`, at run time, two:** `Lineage` (the node-id counter) is its own file, `lineage.ts`, below the
  document and the outline, which took it from `doc.ts`. Reading and rendering a clipboard's Markdown
  (`renderedHtml`, `clipboardSource`, `clipboardFragment`) parses a document, so it is `clipboard.ts`,
  above `doc.ts`; what the document uses of `copy.ts` stays there, the document a type to it.
- **Type-only, left:** `locate`, `extent`, `block-ids` and `copy` take an `OurusDoc`, `view/select.ts`
  an `OurusView`, as a parameter's type: no cycle at run time, and an interface for each would be
  ceremony.
- **`commands`, left:** the commands call each other (Enter and Shift-Enter; cut and delete-subtree;
  paste, paste-plain, move and drag): files merged or a table between them, not a small change.
- **The test** (`test/boundaries.test.ts`): no component's files import each other round a cycle at
  run time (`import type` not counted), but `parser` and `commands` (`CYCLES_LEFT`). It finds the
  commands' three where they aren't left. The writer keeps its order, type imports counted.

`npm test` green, no outcome moved.

## Step 1: the failures kept

The reports over generated notes kept a count a group and a hash of their notes, no cases: a count
could hide one case fixed and another broken, and what a long run found was gone after it (the last
review's 1,275 shrunk states weren't kept). Decided with the user: keep the cases, beside the bugs;
check marks on the lines a command didn't change; a volume run. Step 8's prototype waits for it.

- **One check a case** (`test/lib/report-checks.ts`): `sessions`, `sweep` and `conserve` ran their
  checks inline; they are functions now (`sessionFailures`, `shrinkSession`, `commandFailures`,
  `copyPasteFailures`, `cutPasteFailures`, `htmlFailures`, `pasteFailures`), which the reports run over
  their corpus and the replay runs on one case. The reports' counts didn't move.
- **`test/bugs-untriaged.json`** (`lib/untriaged.ts`): the cases nobody has filed, nested by report,
  then the group they failed in, one a line, each what to replay (the note, its config, the caret and
  shrunk actions, or the command and caret, the node, the clipboard). A report's `…_UPDATE=1` keeps those of its cases that
  still fail and adds its run's, up to ten a group. Triage moves a case into `bugs.ts` under its bug.
- **`bugs.ts` replays them** after the bugs, counted by group: one that passes now, or fails in
  another group, fails the run (tried on two altered cases); `BUGS_UPDATE=1` drops or regroups it.
  Replaying 414 cases takes 0.6 s.
- **Marks on the lines a command didn't change** (`sessions`): a placeholder or an auto mark there
  must be where the command's changes carry it. Checked first by characters: Enter turning a held
  empty line into `4. ` keeps the line's spaces, the mark just past the change, a false loss; by lines
  since. The document drops a mark that doesn't hold (`validPlaceholder`, `validAuto`), so a mark that
  means something else can't be checked for, only one lost; on the lines a command touched the readback
  sees a loss already. It found 16 groups in `sessions`' 2,000 (75 sessions, the baseline raised, a
  decision: the point of the step). One read: Shift-Enter at the end of a quote's paragraph above a
  blank line ourus raised loses that line's `auto` mark, the gap written anew, the line the user's now.
- **`npm run test:volume`** (`test/volume.ts`, not in `npm test`): `sessions`' check over 100,000 sessions,
  notes drawn afresh each 2,000 (`generatedStarts` from the round's seed), each new failure shrunk and
  kept while its group has fewer than ten. 114 s. It found 3,079 failing sessions in 63 groups, 47 of
  them groups the 2,000 hadn't shown: 2,437 sessions an auto mark lost, 509 a placeholder, 133 a write
  failure (35 groups). None filed.

Untriaged now: 414 cases in 70 groups (353 sessions', 51 sweep's, 10 conserve's), 122 of them
`write-failed` in 35 groups. `view-exhaustive.ts` keeps no cases: it has no failure.

## Triage of the kept failures

The 414 kept cases read, a group at a time: each case replayed to the step that fails, the step made
one command on a note, the note made smaller a line at a time while the command fails the same way.

**Two checks made right first** (decisions; the `sessions` and `sweep` baselines recorded again):

- **The marks check** (`sessions`) had two false losses. A command acting at its selection can take out
  a node a placeholder alone held, changing no text (Backspace or cut on a held empty line): the
  selection's lines count as changed now. An auto mark is on a character, which an insertion at it
  pushes on: it maps past the insertion. 111 kept cases went with them.
- **The sweep's cut→paste check** expected the same blocks back, which the spec doesn't give: paste
  goes after the node the caret is on, so an order swaps, or a block pasted at an item's end becomes its
  text. 41 of its 50 cases were that, and none lost or doubled a letter. It checks what must hold
  wherever the paste lands now: every letter back, every code, math and table block's text as it was.
  The other 9 are B346. Its baseline fell from 364 to 50, all of them filed bugs' (B346, B347).

**Bugs filed and joined**

| Bug | Shape | Cases kept |
|---|---|---|
| B345 [P3] | A blank line ourus raised loses its `auto` mark when its gap is written anew (`blankLines` marks only a gap raised in this edit): the line is the user's from then on | 119 |
| B346 [P2] | Cut then paste puts a block into the code above it, joined to its last line (`code# h`): the cut's caret is at the code's end | 9, of 50 in the full sweep |
| B347 [P3] | Copying an indented paragraph (`  > body`) strips its indentation from the list it owns | 1 |
| B348 [P3] | A tab-led child under an indented shared marker line (`  - - ⏎→- x`) can't be written once that line changes | most of `marker-line-overwritten` |
| B349 [P3] | A quote line with no space after its `>` (`  >x`, `>- b`) can't be moved | `moved-indent`, some of `marker-line-overwritten` |
| B350 [P3] | Deleting the first paragraph of a quote one column in after a list puts the rest of it into the item | 4 |
| B351 [P3] | Moving an empty held quoted paragraph down past a heading fails to write | 3 |
| B205, joined | Enter at a fence after an item's unclosed fence: the item's fence left open by a closer short of its content column, math as code | 11 |
| B237, joined | A held space lost: reached from keys after all, on a quote atom's later line in an item | 11 |

Also seen in `readback children`, not filed again: the third shared marker emptied into a rule
(B209's) and padded markers (`-  x`, B162, B166 and B208's).

**A case is filed by its id** (decided with the user, after a first try that filed groups: a bug took
the groups it accounted for, by pattern, which hid any other mechanism in them). Each kept case has an
id, 12 hex digits of a hash of what it replays, its group left out (`caseId`), the first key of its
line in `bugs-untriaged.json`. A bug's case lists the ids it stands for in its body, `// kept: <id> …`;
`filedCases` reads them from `bugs.ts` as text. The reports and the volume run keep no filed case; a
kept one that is filed fails `npm run bugs` until `BUGS_UPDATE=1` drops it. Each case was assigned by
what it does now, its failing step made one command on a note made smaller, not by its group: 213
filed (B345 122, the rest 91), a case that passes now filed nowhere. A new failure of a filed bug gets
a new id and shows until read: the reports' own runs added 25 such, filed, then none. `executeOnText`
takes `auto` marks now, as it takes placeholders.

**The rest, a case at a time.** The 77 left (and what the reports' runs added since, 8) each read:
its failing step made one command on a note made smaller, and, where the readback refused it, the
text the writer had written (`OurusDraft.done` wrapped in a probe: the draft written again). Families
by that text, not by group:

| Bug | Shape | Cases |
|---|---|---|
| B350, widened | A block outside a list item (a quote, a fence, an item indented short of it: a `>` can't continue an item lazily) written as it was after another item, or the same one wider, reads as that item's: cut, Backspace, moves, indent, paste | 20 |
| B352 | Joining a line into an empty item takes the lines after it, at its content column, into it | 4 |
| B353 | The opposite of B345: a blank line ourus raised goes where it still sets two blocks apart | 5 |
| B355 | Enter on an empty padded item before a quote its parent holds moves the quote into it | 3 |
| B356 | Outdenting under `indentUnit: tab` writes a quote's extra spaces after its `>` wrong | 3 |
| B354, B357, B373, B374, B375 | a held node moved up from the note's end; Shift-Enter after a padded marker; a callout, a wiki link, unclosed math after code through HTML | 2 or 3 each |
| B358 to B372, B376 | one case each, a bug each: titled from what the writer wrote, no more claimed | 1 each |
| B208, joined | a padded marker written with one space, or an item past its list written at its column: narrower, what follows taken in | 8 |
| B267, B298, B205, B209, B351, joined | loose tasks through HTML; a footnote's trailing blank; an item's unclosed fence; the third shared marker; an empty held quoted paragraph moved | 1 to 11 |

Two more checks made right (decisions): conserve's HTML comparison left a space beside a block's tag
where a tight list came back loose (its `<p>` stripped, its line break not): 5 cases, the group 40 to
21; and a case found no bug is recorded so, `// not a bug: <id>` with why, read by `filedCases` too
(the marks check mapping a mark through one diff of several, identical lines).

**Untriaged: none.** 288 ids filed under 38 bugs, one not a bug; the reports' own runs add nothing
unfiled. The baselines: sessions 50 failures in 11 groups, sweep 50 in 6, conserve 21 in 1.

135 open bugs: 0 P1, 20 P2, 115 P3.

A volume run from seed 51 (100,000 sessions, 111 s) since: 2,284 failing sessions in 61 groups, 249
cases kept, every one a new id, none filed yet; triage's shapes place 168 of them under filed bugs
(B345 131), 81 to read: the case for a triage helper (`dev/next.md`, step 1).
