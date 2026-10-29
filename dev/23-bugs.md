# Bug fixing (2026-10-29)

Fixing bugs found by agentic source code reviews and API cleanups.

## Cleanups

- `src/draft/` renamed to `src/writer/`
- Types renamed to the `Ourus` prefix: `OutlineNode` → `OurusNode`, `OutlineNodeText` →
  `OurusText`, `ProseText` → `OurusProse`, `AtomText` → `OurusAtom`, `ProseTextType` →
  `OurusProseType`, `OutlineNodeKind` → `OurusNodeKind`; the internal `OutlineNodePersistent` →
  `PersistentNode`. Earlier dev notes keep the old names.
- `PersistentNode` moved from `src/doc/outline.ts` to `src/doc/node.ts, beside `OurusNode`;
  `outline.ts` is the build alone.
- `Command` → `OurusCommand`, `CommandResult` → `OurusCommandResult`, `Config` → `OurusConfig`
  (the type and its object: `OurusConfig.of`, `.defaults`), `Clipboard` → `OurusClipboard`: a
  host's own `Command` (CodeMirror's, Obsidian's) and `Config` no longer share the name.
- `TextSelection` → `OurusSelection` the deprecated `Selection` alias, which nothing imported, goes.
- `DocUpdateParams` → `OurusDocUpdate`, its changes in it: `doc.update({ changes, caret })`, as
  CM6's `state.update({ changes })`; `changes` defaults to none (`doc.update({ setMarks })`).
- A document's snapshots share a `Lineage` (`doc.ts`), which gives each node id once, whichever
  snapshot or draft asks (`isSameLineage`). `OurusDocUpdate.nextId`, the draft's reserved ids and
  the `Math.max`es go; a flavor change keeps counting rather than starting again. `nextId` stays,
  as the lineage's next id when the snapshot's outline was read. The root's id is
  `Lineage.ROOT`, named wherever code took 0 for the root (`withZoom` checks the kind, `view.ts`
  compares a missing parent as null).
- `replace` dropped: a text given whole is `update({ text, setMarks })`; an undo takes back the
  snapshot it returns to, `like.withConfig(doc.config).withViewOf(doc)` (`withViewOf`'s changes
  default to the lines that differ; another lineage's snapshot throws).
- Every export of `src/index.ts` has a doc comment, the classes' in two paragraphs: the API's
  use, then its internals.

## Fixed

- **No-break spaces read as blanks.** Cutting `x` from `a⏎⍽x⍽⏎b` took both U+00A0s and the line.
  Twelve "is it blank" checks in `src/commands`, `src/doc` and `src/writer` used `String.trim`, which
  strips every Unicode space; Markdown's blanks are spaces, tabs and line endings. Also hit: Enter
  in an atom quote. All `trimMd` now but one: `pastePlainLines: items` trims each line as the apps
  it copies do, Tana and WorkFlowy (the SxS compare caught the change there). Regression73.
- **A blank line's caret resolved to a hidden node.** `touchedNodes` walked up past lines the tree
  reads as blank to the node above. After a folded subtree that was the hidden last descendant
  (`selectNodeUp`/`expandSelection` threw; `deleteSubtree`, indent, duplicate acted on it); on a
  folded shared row (`- - a`) the inner item, hidden (`selectNodeDown` threw); after a placeholder's
  empty paragraph, the node above it (`deleteSubtree` deleted that). The walk now stops at a line
  holding a node, and a fold-hidden node becomes its outermost folded ancestor (`foldOwner`), in
  `locate`'s gap owner too. Regression67–70.
- **Duplicate threw over a subtree selection whose first root has no text** (`- - ««a⏎  - b»»`, a
  titleless quote): the interim caret went to offset 0 of a textless copy. Now the copy of the
  first node with text. Regression71.
- **Plain paste over such a selection went to the host**, which replaced the lines markers and all.
  The textless root is now its first child's prefix, as for Enter: `- - z`. Regression72.
- **`textStart(0)` threw on an empty document.** Returns 0. The demos' Home and Up/Down also treated
  a caret past a final line ending as on the line before (`lineAt` reports that line); they check
  `pos > line.to` now, as does the CM6 fold service, and `lineAt` documents it. `doc.test.ts`.
- **Plain paste after a backslash put the caret past the end** (`\` then `- a⏎- b`: caret 10 of 9).
  The writer absorbs a text's backslash before punctuation as the escape, and the caret, set before,
  kept its offset. Absorbed backslashes now count as lost characters for anchors. Regression74.
- **Backspace after Enter at a title's end, at a text's end with no line ending, failed to write**
  (also Shift-Backspace, cut, `moveSubtreeUp`): the empty paragraph sits past the final line
  ending and spans nothing, so removing it changed no text, and the writer carried its placeholder
  over as part of the copied title line, bringing the paragraph back. That placeholder is now kept
  only while its node is still the draft's last. `commands.test.ts`.
- **Enter at the end of an unclosed fence at a text's end, with no line ending, failed to write.**
  The new empty code line has no prefix, so without a line ending after it it is no line, and the
  writer ends the text as the old one did. It now counts as a blank line written anew
  (`blankEnd`), which keeps its line ending. `commands.test.ts`.
- **Lines pasted into an empty item holding a typed space failed to write** (`  -  ┃◌`, both
  pastes): the held space counts in the old item's content column, so its later lines continued one
  column past the first, whose lead is the marker and one space; that column read as a space of
  text. The continuation drops the columns the lead leaves out. (Lining the later lines up with the
  lead instead broke `>- a`, whose `>` takes a space on later lines only: the differential's one
  regression, caught and reverted.) Regression75.
- **Tab or Alt-Up after a space typed at a parent's text start failed to write**
  (`- Earlier⏎-  ┃Review⏎  - Detail`): the space widens `Review`'s content column, so `Detail`, at
  two, is a top-level item; with `Review` indented (or moved above `Earlier`), `Detail`'s line,
  untouched, reached the content column of the item now before it and read as its child. The same
  with Shift-Enter or Shift-Backspace there, which leave `Review`'s first line without text, its
  content column the marker's and one space. An item where it was, after an item of its list (another
  than was, or one whose first line emptied) whose content its column reaches, is lined up with it
  (`realign`, `contentWidth`). Regression76–77, 81–82.
- **Enter and duplicate failed to write in a text with lone-CR line endings**: `writtenColumn`
  found the line being written by its last `\n` only, measuring the lines before it too. A scan of
  every spec start in CR and CRLF, 14 commands at every line's start, middle and end, finds nothing
  else. `commands.test.ts`.
- **Duplicating a quote whose blank `>` line ends the text failed to write** (`> a⏎>`): the copy's
  blank line, written past it with no prefix, was dropped with the final line ending the old text
  didn't have. Blank lines written after a copied node now count as written anew (`blankEnd`), as
  `blankLines`' do. `commands.test.ts`.
- **Enter over a selection of a quote's `>` failed to write** (`- «>» q`, `quotes: atom`): the
  split emptied the quote's text, which then read as a paragraph. A selection from inside a line's
  `>` takes part of markup: the host's under `markup: text`, else `not-expressible`, as elsewhere.
  Regression78.
- **Duplicating `««---⏎para»»` at an Obsidian note's start failed to write**: the copy's `---`
  closed frontmatter the first one opened. `#frontmatter` only looked where the draft changed the
  first node; a rule the draft writes below an unchanged first `---` now gets the blank line before
  it too. Regression79.
- **A drop of `- →b` into a quote in an item failed to write** (the differential's one known
  failure): the seam check read the lines from their container's content start, column 0, where
  the tab spans to five columns past the marker, `b` code; written at column 2 it spans two, `b`
  a paragraph that the next line continues. The check reads tabs from the container's column now
  (`#apart`'s `column`). Regression80.
- **A fold stayed closed over content an edit added.** `carryView` re-checks a fold only for a
  change near it, and the window ended at the start of the line after the fold's cover; the
  writer's diff for Tab on `# B` after a folded `# A` starts one character into that line, so `## B`
  and its section joined A's, hidden, and the caret went to `# A`. Likewise a `#` typed into `## B`,
  a setext underline replaced. The window now runs through the next node's text and one line more.
  A property in `view.test.ts` edits every offset of the two lines after each fold's cover; it fails
  against the old window.
- **A shift that moved a tab after an item's marker off its stop made the item's text code**
  (Regression80's start under any flavor: outdent, the moves, Backspace; 32 differential runs). The
  writer keeps such a tab (Indent14), but one that spanned two columns spans four two columns left,
  the text five past the marker. A shifted line's tab after one of its markers that would span more
  than four, where it spanned four or fewer, is the spaces it spanned (`markerTabs`, the markers
  matched from the last). Regression84.
- **A paste over a lazy line of an item starting with a checkbox, in CommonMark, failed to write**
  (`- [x] ⏎   «    - b»`, the clipboard `-⏎  x`, known since dev/22-select.md): the new item's
  text starts below its marker, so its separator was the clipboard's, none, the checkbox written
  against the marker (`-[x]`). A checkbox on the marker's line gets a space. Regression85.
- **A partial Word outline lost its later items** (copied from a nested item into the next top-level
  one: levels `2,1,1`): the list was built at its first paragraph's level and stopped at a shallower
  one. Each paragraph now goes under the nearest one before it at a shallower level, else at the top.
  Regression83.
- **HTML text with the extensions' delimiters changed meaning** (`~~draft~~` a strikethrough in GFM,
  `%%draft%%` hidden in Obsidian, `==x==`, `$x$`): the converter, which knows no flavor, escaped
  CommonMark's only. `~` and `$` are escaped, and the second of `==` and `%%`; a backslash escapes
  any ASCII punctuation in every flavor. Regression89.
- **HTML code spans lost their boundary spaces** (`<code> a </code>` read as `a`): the padding the
  span needs was collapsed with the text's whitespace; code spans are held out of that now. And a
  backtick typed over ` b ` (`closeBackticks: all`) wrapped it unpadded, Markdown stripping its own
  spaces: padded where it starts and ends with one. Regression86, 90.
- **Adjacent HTML formatting wrote literal delimiters** (`<em>a</em><em>b</em>` as `*a**b*`, likewise
  `strong`, `code`, `del`), and emphasis whose delimiter can't flank (`<em>foo!</em>bar` as
  `*foo!*bar`, literal). Side-by-side elements of one formatting are merged; a delimiter that can't
  open or close where it lands leaves its text alone, which is what shows. Regression87.
- **An HTML link labelled `x` became a checkbox and text** (`[x] (/u)`): the checkbox's space was
  added by matching `[x]` at the text's start; the checkbox writes its own now. **A destination with
  `>` in it** broke its angle brackets: written bare where Markdown reads it so (no blanks, its
  parentheses balanced), as nine apps write it (the SxS run), else in angle brackets with their
  brackets escaped. Regression88.
- **A multi-line plain paste under `pastePlainLines: enter` glued words** (`- a┃ b`, `x⏎y`, with
  `enterSplitSpace: start`: `- ax⏎-  y┃b`): after the Enter the space is the second half's padding,
  the caret before it, and the next line was typed at the text's offset 0, after it. It goes before
  the padding now, as a host types it, the space after it as text (Dynalist's `- y┃ b`).
  Regression91.
- **Backspace at a padded nested item's line start exposed its marker** (`┃  -  child`): `pastPrefix`
  moved the caret past the padding, where Backspace is the host's, which deleted the line break at
  the caret it had. From the prefix it acts at the padding's start now, joining (`- Parent┃ child`,
  Tine's). Regression92.
- **Duplicate refused (`unsupported`) the empty item Enter just made** (Enter, Tab, Duplicate): an
  empty item alone, no children, is copied now, the caret in the copy, the original set apart where
  Markdown needs it once its placeholder settles (an empty item after text). A copy of any other
  placeholder (a held space, an empty item with children) still isn't written: the differential
  found them failing to write when allowed. Regression93.
- **A move at the zoom root's first or last child was refused `outside-zoom`**, where
  dev/21-zoom.md §4.2 has `no-previous-sibling` / `no-next-sibling`: there is nothing past them in the
  view. Regression94.
- **Settings applied again unchanged made an undo lose ids and folds**: `withConfig({})` made a new
  config object, and `replace` took `like`'s nodes only for the same object. It returns the snapshot
  where no option changes, and `replace` compares configs by value (`Config.same`). `doc.test.ts`.
- **Malformed edit ranges were accepted** (a reversed range, `NaN`, fractions: `applyChanges` then
  disagreed with its inverse), and **an empty change inside another threw `overlapping`**.
  `normalizeChanges` refuses the first and drops the second before checking. `text.test.ts`.
- **An update of many changes was quadratic** (8,000 one-character edits: 1.25 s): `mapLine` scanned
  the changes and normalized them again for every line. A `ChangeIndex`, made once per update, maps
  and finds a covering change by binary search: 21 ms. `text.test.ts` holds it to `mapPos` and a
  scan.
- **Typing in a zoom did document-wide work** (50,000 items: 44 ms a key, against 0.02 unzoomed):
  `zoomEscape` read every node outside the zoom by id, building the next snapshot's index, and every
  item of the root's list by its line. It now walks both snapshots side by side, the children they
  share from either end skipped, and compares a list by its count and end items: 9.5 ms, most of it
  the update a host makes anyway (6 ms).
- **A host deletion read the document two more times**, to see whether a placeholder would keep its
  outline (`keptAt`), wherever the caret ended at a line's end or on a space: now only where the line
  holds nothing before it but markup.
- **The CM6 demo** read the text anew on a flavor change, dropping every fold and the zoom
  (`withConfig` carries them by line), and left a clipboard of HTML alone to CodeMirror, which pastes
  nothing.
- **Test tooling**: the player's motions now keep the caret in the zoom, as a host clamps them, and
  its Delete takes a grapheme, not a code point; the probe prints the view after a step,
  `⟦folded 1; zoom none⟧`.
- **An HTML heading lost a trailing `#`** (`<h2>Issue #</h2>` read as `Issue`, `<h2>###</h2>` empty):
  a run of `#`s ending a heading's text after a space is its closing sequence. Escaped. Regression95.
- **HTML formatting across a paragraph break became literal** (`<em>a<br><br>b</em>` as `*a⏎⏎b*`):
  each paragraph's part is wrapped on its own. Regression96.
- **Zoomed, Backspace or Delete over the root selected as a block was refused**, `outside-zoom`,
  where cut of the same selection deletes it: the keys are `deleteSubtree` there (`editSubtrees`),
  which the zoom's guard didn't count as a removal. They are now, the zoom going to the nearest
  ancestor left. Measured (`sxs/probe.ts`, the root selected by Escape): Logseq, Logseq DB and Tana
  delete it too, Tana as ourus (`- ┃other`); Dynalist and true-outliner, whose Ctrl-A stops at the
  root's children, delete those, as ourus under its default ladder. Regression97.
- **A heading or rule alone from HTML pasted inline** (`<h2>Title</h2>` at `- here┃`:
  `- here## Title`; `<hr>`: `- here---`): one block of one line had no line break, and one line
  without one is inline text. A converted block ends with one now. Regression98.
- **A pickup (`drag`) was quadratic** (a flat list's first item: 92 ms at 1,000 items, 1.3 s at
  4,000): each seam found its neighbours, and each depth's place its parent's last child, by a scan.
  Binary searches over the nodes in document order and the parent's children: 8 ms and 23 ms.
- **Changing `listParent` kept the old grouping, and a delete then took more than asked**
  (`p⏎- a⏎- b` to `container`: the items still `p`'s, `deleteSubtree` of `p` deleting them): the
  outline read again copied each container's grouping where its stored block was the same. Not where
  the settings for what owns what changed (`regroup`). A test reads every spec start under each value
  of `listParent` and `quotes`, then every other, against a fresh parse. `doc.test.ts`.
- **`Config.read` threw for an option named like an object's own property** (`constructor`,
  `toString`, `__proto__`): only own properties are options. `doc.test.ts`.
- **A copy of spaces between words was empty** (`- a«  »b`: `""`, a cut losing them): a fragment
  blank where the copy took part of a line was emptied as a blank line is. Only a line taken whole is.
  **A copy through the final line ending left it out** (`pha⏎` in `- alpha⏎`: `pha`, a cut taking
  the line break): only an end at the next line's start kept one. Regression99–100.
- **Backspace on an empty item that is all of a quote failed to write, a block after it**
  (`> - ┃⏎# h`): the item went, its quote left holding nothing. It goes with the quotes it is all of.
  Regression101.
- **Shift-Enter at a padded item's text start failed to write, with later lines** (`-   ┃a⏎b`): the
  text below the marker has its content column one past it, and the later lines kept the old one,
  past the padding. They drop the columns the padding was, as an empty item's do. Regression102 (and
  Regression81, now at that column).
- **Code starting below its item's marker took no edit** (`-⏎  ```⏎  code┃`: Enter, Shift-Enter,
  plain paste, `write-failed`, "the code starts below its marker"): the writer refused the layout. Its
  text's first line is the marker's, empty: written with the marker alone on it, the code after.
  Regression103. Allowed, the layout met the commands that rewrite its first line, which the
  differential then found failing: Backspace at the fence and Delete at the marker line's end (one
  threw) move the code onto the marker's line now; outdented or moved out of the item, the code
  loses the marker's empty line (`#atomTexts`). Regression106–107.
- **The SxS's errors, the drivers' own** (none ourus's): Dynalist and both RemNotes can't make a
  selection of blocks at two depths (their Shift-Down takes the parent in), BlockNote can't select one
  block alone (it is its text), Athens and RemNote have no block for a zoom root (it is the page's
  title), SiYuan writes every rule `---`: each a start the driver skips now, with why (`holds`); and a
  caret in a block a projected fold hides (`- - a`, the outer item folded) the plan skips for every
  block app. Athens's load clicked a block open at its left, a task's checkbox, which toggled it: at its
  right now.
- **A heading pasted alone under `pasteSeams: open` left the text after the caret behind**
  (`p┃q`, `# h`: `ph⏎⏎q`): its text joined the caret's node, but whether the rest joins it was asked
  of the heading, gone into it. Asked of the node it is in. Regression105.
- **Backspace or Delete of a two-unit character before backticks closed a fence early**
  (`😀┃```` in code): the guard measured one UTF-16 unit, found the fence intact and left it to the
  host, which deletes the grapheme. It measures the grapheme now. Regression104.
- **Not changed, on its merits: `[!note]` refused as a callout title in GFM and CommonMark.** ourus
  reads `> [!type]` as a callout in every flavor by design (GitHub renders it as an alert;
  `quoteKind`, `quoteHead`, the title's frame), so the refusal agrees with what the text reads as.
  Lifting it only in the check made the writer's readback disagree (`write-failed`).
- **The SxS on the new cases** (`regressions.md` on all 18 setups): no verdict moved elsewhere, and
  where the apps form a camp against ourus it is theirs: an HTML conversion that loses what shows
  (Word's bullets kept as text, code spans' spaces, delimiters left active, a trailing `#`), a
  block app keeping a block selection a paste would replace, a text editor's raw edit.
- **`spec/z-open.md` dropped.** Its Open2, whether a block of lines owns the list after it, was
  settled by `listParent` (dev/19-quotes.md: `paragraph`, the default, no; `block`, yes); its case is
  DeleteSubtree14. The three choices it listed are cases in their files (Paste2, Paste6,
  PasteList8), measured in the SxS.
- **A caret on a quote's `>` line above its callout title threw** (`>┃⏎> [!note] Title`: Enter,
  Backspace, Delete, Shift-Enter, every flavor): `locate` mapped the line into the title's text,
  which starts below it. It is the quote's prefix there, and `pastPrefix` leaves it, a line of no
  text: the keys are the host's, as in any markup, not edits of the title (a first fix moved the caret
  to the title's start, splitting it or deleting `[!note]`). Regression108.
- **A paste of 150,000 lines threw** (`Maximum call stack size exceeded`): the least indentation of a
  clipboard's lines was a spread into `Math.min`. Reductions, there and wherever the count is the
  input's (a code block's backtick runs, a table's rows, a selection's). `commands.test.ts`.
- **HTML text holding the code spans' placeholder characters lost them** (`\uE0000\uE001` read as
  a code span, or `undefined`; this session's own): the text's own are held as placeholders too.
  `commands.test.ts`.
- **Duplicating a footnote in a quote failed to write from its prefix** (`┃> [^1]: note`): the copy
  writes its `> ` and label anew, and the caret, mapped into the copy's old text, found none there.
  It goes as far before the copied text, and a footnote's text starts past its label (`textStart`),
  so the caret lands on text. Regression109.
- **Indenting a definition with a space before it failed to write** (` [a]: /url`): the space stayed
  in the item's text, which reads it as padding. Any block made an item's text loses its first line's
  blanks, as code does its fence's indentation (`#atomTexts`). Regression110.
- **Lines pasted into an empty item after a tab in a quote failed to write** (`>→-┃`): the
  continuation's shortcut for a tab after `>` kept the old line's columns, short of the content
  column an empty item's line doesn't reach. Made up to it. Regression111.
- **Backspace making an item first in a quote a paragraph starting `[!type]` failed to write**: it
  would be the quote's callout title. Refused, as the commands that check `becomesTitle` are.
  Regression112.
- **Select all, then Backspace, Delete or cut, right after Enter, failed to write** (`a` Enter:
  `a⏎⏎◌`): the empty paragraph the caret is in stayed, written as a text of one line ending with no
  placeholder, which reads as nothing. Written so, it is held at the text's start. Regression113.
- **A plain paste of lines typed with Enter put them out of a quote** (`pastePlainLines: enter`,
  `enterInQuote: line`, `> a┃`: `> ax⏎⏎y`): its Enters weren't typed ones, which a quote makes lines
  of under `line`, the default. They are (`enterCommand`'s `typed`; the key's quirks still the key's
  alone, which Dynalist's paste doesn't play), and a line typed on the quote's blank line Enter leaves is typed as the
  host types it there: `> ax⏎> y`. Regression114.
- **Not changed: duplicating the empty paragraph Enter just made.** It stays `unsupported`, as before
  this session: a copy would need a placeholder, and so would the original, no longer last, which
  settles away as the caret leaves anyway.
- **Edits of code that made a fence of code, closing the
  block early** (`X```` with `X` cut: `PAYLOAD` prose, `AFTER` code). Only a typed backtick and a
  one-character Backspace or Delete outside the line's indentation were checked; every other edit of
  code was the host's, unchecked: a cut or a deletion over code, a character typed over a selection,
  Backspace or Delete in a code line's indentation (`→```` → ```` ``` ````), Cmd-Backspace, a one-line
  paste and a paste over code lines, a character typed on a closing fence (decorated markup), text
  typed at once with a line break. All now go through one helper, `editInCode`: the host's where the
  block reads as it did, closed as it was, and the host's edit would be the same; else ourus's,
  `done()` growing the fences (an edit of a delimiter's line that unmakes the block is `breaksFence`,
  the host's where markup is text, else refused; indented code's four columns count as a delimiter
  there, as they were the host's before). Cmd-Backspace in code is now always ourus's, back to the
  line's start past indented code's columns (at the line's start, Backspace): the
  host's deletes the containers' prefix too (`> PAYLOAD` → the quote ends, `AFTER` code). A line break
  pasted or typed into code in a container is ourus's (the host's has no prefix). In code a paste is
  plain lines under `pastePlainLines: enter` too, and over a selection (it went to `afterDeleting`,
  whose deletion was deferred, so the whole paste was). The held
  placeholder on a code line that Backspace in its indentation left no longer arises from it (the deletion is ourus's). Regression115,
  Regression116, Regression117, Regression118, Regression119, Regression120, Regression121,
  Regression122, Regression123; the batched insert in `commands.test.ts` (the spec's `"text"` types a character at a time).
- **A cut at the caret on a folded shared row lost the hidden children** (`- - ┃a⏎  - SECRET`,
  the outer item folded: clipboard `- a`, the document without either). The copy took the row's
  innermost node (`nodeAtLine`), the deletion the fold-aware one, the folded outer item. Both take
  `selectionRoots` now. Regression124.
- **Backspace of a custom-status task's last character reparented its children** (Obsidian,
  `- [?] x⏎⏎  - child`: `child` top-level). No placeholder held the emptied task: `keptAt` tried one
  only after a checkbox of `[ xX]`, and `validPlaceholder` kept one only after `[ ]` or `[x]`. Both
  take a checkbox of any one-character status now, in every flavor, as the text's frame reads one
  (the parse's `attrs.task` would be none in CommonMark, whose `- [ ] ` the outline still holds).
  Regression125.
- **A quote's later line starting with a blank lost one when written again**
  (`>⏎>z⏎>  e`, Enter at the end: `> e`, read as `e`). The continuation is the first line's prefix
  as written, `>` without its space where the first line has none; before a line starting with a
  space or a tab, the `>`'s optional space took one. The writer adds the space there now. The same
  write made a held space unable to settle (the saved text read otherwise than the live one), and Shift-Enter in a quoted fence's info space and a plain paste in a quoted paragraph fail.
  Regression127.
- **Code whose line starts with a tab, written at another column, closed
  early** (found by the drop and move passes on Regression116's start: the block moved into an item, `→```` two columns
  in a fence; Tab on it too). `readsAs` read the lines at column 0; it takes the column now (the
  lines read in an item starting below its marker, `-`, `1.` or `100.`, whose lines start there), which `done()`'s fence growth passes, the
  text's column, and `editInCode` too. Regression126.
- **A node placed after a quote whose first node opens a block of
  lines ran into its last** (found by the drop pass on Regression119's start: `> ```⏎…⏎> after`
  then `para`, lazy; a list pasted after `> <div` in a quote, read as one root). The seam read
  the quote's last lines from its first, a textless quote's first child's line: a fence's or an HTML
  block's opening alone, which took in the rest, so they read apart. A quote with no text of its own
  has no line of its own to read now. Regression128.
- **A held space that no writing of its text keeps stayed when the caret left**, the live
  outline one the saved text doesn't read as (`>- [x] >⏎    -`, Delete of a space of the lazy `-`:
  live the task's line, saved an item). `settlePlaceholders` returned null and kept every mark where
  one couldn't be written. Now each is tried alone, one that can't be written goes (the text read as
  it is saved, the line an item), the rest settle; a mark on no prose text's line too, which nothing
  ever settled. A held mark on a code line would go so too. Regression129.
- **Delete subtree given nodes threw** (`an anchor in node 1, which the draft removed`):
  with the caret on the node's blank line (`a⏎ `, caret at the end), which the check for a caret
  outside the nodes counted out (it ends at the node's text), and cut given the node too; given a
  node and its child (`nodes: [1, 2]`), the caret going to the last's next sibling, inside the
  first. A caret on a blank line of the nodes is theirs now, and a node given with an ancestor goes
  with it. `commands.test.ts`.
- **Tab over a paragraph and a quote after it threw** (`x⏎>b⏎→~~~`: `invalid change range NaN–NaN`).
  The second item's marker lined up with the item above, which the draft had made of the paragraph:
  its origin a paragraph, with no marker column, so its text's column was NaN, and with it the
  escape's place. Only an item read as one lines up now. Regression130.
- **Shift-Down and Shift-Up threw on a quote whose last line is a blank `>` after its item**
  (`=⏎>-⏎>`, from the paragraph: `Cannot read properties of null`). The quote's selection
  (`selectionOf`) runs to its last line, the item's blank line, which `selectedNodes` didn't read
  back: it lifts the item to the quote only where the two end on one line. It lifts where the
  quote's last lines are the item's blank lines too, and `selectionOf` takes a node's lines whole
  so (the item's selection is the quote's, as for `- - a`). Regression131.
- **A text drag's deletion at a caret ran Backspace** (`- alpha⏎- ┃beta`: `- alphabeta`; at the
  first item's text start, its marker gone). `deleteByDrag` went to `deleteSelected` whatever the
  selection; with none, it deletes nothing now. Regression132.
- **`closeBackticks: all` took two backticks of code, or an escaped one, for an empty pair**:
  Backspace between them deleted both (`a ```x `┃` y``` b`: `` `` `` of the code gone; `a \`┃` b`:
  `a \ b`), and a backtick typed there stepped over the second, lost. The pair was two backticks
  alone, read from the text; now also not escaped, and not in a code span (`codeSpanAt`), for the
  three that ask (stepping over, typing a pair, Backspace). Regression133, Regression134.
- **Cmd-Backspace at the end of a setext title deleted the title and made the underline text**
  (`Title┃⏎===`: a paragraph `===`; `---`: `\---`). The title's only line, emptied, was taken as a
  first line inside a text, which goes with its line break; the underline is the frame's. Now the
  title's last line goes with the line break before it, and the only one leaves an empty ATX heading
  of its level (`# `), as the block apps keep an emptied heading (WorkFlowy, Roam, RemNote, SiYuan,
  Logseq DB; the text editors leave `===` text). Regression135, Regression136.
- **Enter or Shift-Enter at the end of an ATX title with a closing sequence made the `#`s text**
  (`# a┃ #`: `# a⏎\#`). The split skipped the blanks after the caret into the closing frame, its
  `#`s the second half. It stops at the frame now, so it is the title's end, as without one.
  Regression137.
- **A join or a paste onto an ATX title made a trailing ` #` its closing sequence** (`# h⏎⏎x #`,
  Backspace at `x`: `# hx #`, read `hx`; a paste of `b #` at `# a`'s end). `done()` now escapes the
  first `#` of a closing sequence a title didn't have (or had otherwise): `# hx \#`.
  Regression138, Regression139.
- **A paste of text starting with a blank at the start of an item with children failed to
  write** (`- ┃bravo⏎  - charlie`, ` x`); a plain paste of it was the host's, which wrote it so,
  `charlie` no longer a child. The blanks are padding there, moving the item's text past its
  children's column. Both drop them now, as a plain paste of several lines does a first line's at a
  text's start. Regression140, Regression141.
- **Outdent given a quote's paragraph by id, the quote an item's first block, moved the caret
  into the item from wherever it was** (`- z⏎- > q⏎- w`, `nodes: [4]`, caret in `w`: in `q`; past the
  text's end where the offset was larger). The caret took the selection's offset in its own text,
  whatever text that was. Only a selection in the paragraph goes with it now (its blank lines too,
  past the final line ending where it is the last node); any other stays where it is (the inverse
  pairs caught the first try throwing with the caret after the text). `commands.test.ts`.
- **Enter or duplicate on item `999999999.` failed to write** (the next, `1000000000.`, has ten
  digits, no marker's: text). `done()` refuses a number past nine digits now. And renumbering wrote
  an untouched marker's leading zeros away (`007.` → `7.`); a number the item keeps is written as it
  was (`markerOf`). Regression142, Regression143.
- **A heading of another level or kind moved the blank line before it to after it**, and
  the text gained blank lines at its end (`## B⏎⏎## C`, Tab at C: `## B⏎### C⏎⏎`; Backspace making
  `# n` a paragraph after `# h⏎⏎`: `# h⏎n⏎⏎`). `done()` keeps each section's end blank lines at its
  end: the section the heading's change grew or shrank ended at another node, which took them. It
  doesn't where the nodes from the old end to the new are side by side as they were (`#asWere`),
  none moved or gone. That rule, reworked so, also ran the document's end first, a section's end
  then giving the moved node another gap (`## charlie⏎⏎delta⏎# charlie`, delta down: a blank line at
  the end): the sections go first now, each node's gap read as it was before any took it, and the
  document's end doesn't take a gap a section gave. MoveDown28 redrawn: the blank line it ended with
  was this. Regression144, Regression145, Regression146.
- **Backspace or Delete taking an empty fenced block, the text's last, after a blank line,
  failed to write** (`alpha⏎⏎```⏎``┃``). The block's removal stated the blank lines above it as the
  paragraph's gap, set apart from nothing; stated, the text's end couldn't take back its own. Only
  where a node follows is it stated now. Regression147.
- **`Config.of` took any object**: an option given as `undefined` overrode its default
  (`flavor: undefined`: stored so, read as CommonMark; `indentUnit: undefined`: four spaces), and an
  unknown option or value went through (`flavor: 'Obsidian'` read as CommonMark; `indentUnit: 3`
  wrote four). An `undefined` one is absent now; an unknown option, or a value the option doesn't
  take, throws, as `Config.read` refuses them for string settings. `config.test.ts`.
- **`markdownOf(0, 0)` threw on an empty document** (it looked up a line the empty text's tree
  hasn't). It returns `''`. `doc.test.ts`.
- **`executeCommand` took any selection**: out of the text, `NaN`, `Infinity` or a fraction it
  applied (clamped or mapped to some node), echoed back, or threw, depending on the command. It is
  refused at the entry now, `invalid-selection`, a new reason (README, `RejectReason`).
  `commands.test.ts`.
- **Emptying the only node below a leading blank line failed to write** (`⏎a`,
  Cmd-Backspace; `⏎- `, `⏎1. `, `⏎- [ ] ` with Enter or Shift-Tab; `⏎#` with Backspace: `id 1,
  read as 2`). The text written being a line ending alone, the writer held its empty paragraph on
  the first line too (Regression113's rule), the blank line then a second node, read first. It holds
  one there only where no placeholder holds it already. Regression148, Regression149.
- **Math and comment blocks' frames and payload were read wrong**: a block closed
  on its opening's line (`$$x$$`) read unclosed, its `$$` text; one below an item's marker
  (`-⏎  $$X⏎  Y$$`) had no opening; `body` left out the payload beside the delimiters (`$$abc⏎def$$`:
  empty); and the parser took a no-break space after the closing `$$` for a blank where the frame
  didn't, so the markup covered the wrong characters. The frame reads them as a fence's now (past
  the marker's line, closed on the opening's line), `body` is what is between the delimiters, and
  the parser trims blanks alone (`trimBlanksEnd`): `$$⏎x$$⍽` is unclosed, as `text` says.
  `text.test.ts`.
- **Enter, Shift-Enter or a pasted line break at the end of an unclosed math or comment block,
  the text's last line, failed to write** (`$$⏎a┃`). The writer ended an unclosed fence's empty last
  line with its line ending, a line only so; not math's or a comment's. Now theirs too.
  Regression150.
- **An item's code starting below its marker was read a line off**: Tab on a code line
  indented the whole item (`- a⏎-⏎  ```⏎  ┃X`), Tab on its opening fence was the host's
  (`onCodeLine` counted from the item's first text line, its string from the marker's); and
  Escape left the caret before the opening fence, where typing unmakes the block (`textStart` took
  the fence's line for the code's first). Both count from the opening's line now. Regression107's
  caret moved to the fence: its Shift-Tab, on a code line, is the host's. Regression151,
  Regression152.
- **Extension inlines in an image's alt text wrote their HTML into the attribute** (`![a[^n]](x)`:
  `alt="a<sup class="footnote-ref">…`, the quotes ending it; Obsidian's wikilinks, embeds, tags,
  math, inline footnotes too). Images turn tags off for their alt text; the core's inlines obey,
  the extensions wrote `lit`. They write their markup through `markup` now, nothing there, their
  text alone (a footnote reference none, as micromark's GFM writes it). `render.test.ts`, new.
- **A footnote definition nested in another was written twice** (`[^a]: A⏎    [^b]: B`: `fn-b`
  inside `fn-a` and again after it, its id twice, `fn-a`'s backreference after the nested one).
  The section writes each definition as its own now, skipping one nested in the one it writes,
  whose last paragraph, the nested one not counted, takes the backreference, as micromark's GFM
  writes them. `render.test.ts`.
- **Not changed: footnotes in an unused definition, a repeated reference's id, a
  reference in a link.** micromark's GFM writes all three as ourus does (a footnote an unused
  definition references; `fnref-a-2` for both `[^a]`'s second reference and `[^a-2]`'s first;
  an anchor in the link's), the oracle the parser is held to.
- **A GFM table's header row indented after a paragraph wasn't read** (`para⏎  |a|b|⏎  |-|-|`:
  one paragraph). The header row is the paragraph's last line, its blanks kept, so a leading pipe
  after them read as an empty first cell. It is read past them now, as cmark-gfm reads a
  paragraph's lines (micromark's GFM too, to three spaces). `render.test.ts`.
- **Not changed: an undefined footnote reference is literal text** (`[^a*b*]`, no emphasis):
  cmark-gfm's own regression tests pin it (`[^~~is~~1]`), which the GFM flavor follows; micromark's
  GFM parses the content.
- **`codeSpanAt` and `inlineEscapeAt` saw nothing in a table's cells** (the line's leaf, the
  table, has no inline text of its own), which the backtick commands ask. They read the cell at
  the position now (`#inlineLeafAt`). `structure.test.ts`.
- **A later extension couldn't put back a rule an earlier one removed** (`remove: ['atxHeading']`,
  then an `atxHeading` start of its own: dropped too, never called). `defineFlavor` gathered every
  extension's `remove` into one set and filtered all rules by it; each one's removes now take the
  rules of the extensions before it, as `MdExtension.remove` says. `structure.test.ts`.
- **`diffLines` ended a change between a CRLF's `\r` and `\n`** (`a␍⏎b␍⏎` → `a␍⏎c␍⏎`:
  `c\r` for `b\r`). A line started after any line break; it starts after a `\n` or a lone `\r`
  now. Not changed: the change's end is a line start of the old text alone, not of the new one too; there the kept rest of an old line is that line, which keeps its node's id (the
  differential caught a move reading `c` anew when both were asked). `text.test.ts`.
- **Tab on a paragraph `--` failed to write** (`- --` is a rule; `**` under `bullet: *`;
  `--␍|` too). A text that alone is no rule was written after the bullet unescaped; `done()`
  escapes its first character now where the bullet and it would read as one (`- \--`).
  Regression153.
- **A blank line written after a line ending in a lone CR merged with it**: an LF after
  the CR read as one CRLF, the blank line gone (`→k␍    :`, a pasted line break; `c␍~`,
  Cmd-Backspace; `a␍c⏎⏎c`, Shift-Enter, the old blank line copied after the new `a␍`). An empty
  line written after a lone CR ends with a CRLF of its own now, which no LF after it joins either
  (the differential caught one between a CR and an old LF line, `a␍␍c⏎⏎c`, Cmd-Backspace on `c`,
  where either ending alone joins a neighbour); and `finish()` gives the written one of two pieces
  that would join the other kind of ending, the same length, so no position moves.
  Regression154, Regression155, Regression156, and `commands.test.ts`.
- **Delete taking a fenced block after an item's unclosed code, its last line empty, failed to
  write** (`- ```⏎⏎⏎```b⏎```` at the `b` fence): the item's lines copied whole, the text ending
  there now, without its final line ending that empty code line was gone. It keeps the ending where
  the copied lines end with an empty line of an unclosed block (`emptyCodeEnd`). `commands.test.ts`.
- **A paste of paragraphs into an empty item held with spaces after its marker failed to write**
  (`- Project⏎  -  ┃◌`, `line one⏎line two⏎⏎p2`: the differential's one failure, in HEAD too). The
  item's text was written past its marker and a space, its later lines there, but a new child at
  the old content column the spaces made, one too far in. The writer keeps how much less far in it
  wrote the item (`emptiedPadding`) and writes its new children there too. Regression157.
- **A text ending in a blank line with no line ending lost it when a command
  wrote it again** (`>>⏎→`, Shift-Tab; `+⏎ `, duplicate; `x⏎- y⏎ `, Tab; `> a⏎>` under `quotes:
  container`, duplicate; `-→```⏎c⏎→`, Alt-Down). Copied under a shift, that last line is written
  with the prefix where it goes, nothing at the top level, and with no line ending it is then no
  line. It is written as it was there now, copied blank lines that run to it are written anew, and
  a node's own old blank lines are copied only where they are as many as its gap. An unclosed
  fence moved to the text's end takes none of its blank lines (they would be its code).
  `commands.test.ts`: the spec's buffers all end with a line ending.
- **A list pasted after an unclosed fence that would own it (`listParent: block`) failed to
  write**: after a block of lines nothing closes, every line is the block's. Refused now
  (`not-expressible`). `commands.test.ts`.
- **Outdenting a quoted item written `>2) a` added a space to its later lines** (`>2) a⏎ ~`:
  `~` two spaces in). The continuation the writer makes for a quote's item puts a space after the
  `>` the line hasn't (the quote's, Quote3); cut at the `>` out of the quote, that space stayed,
  one column too many. It goes with the `>` now. Regression158.
- **A lazy line written as it was where it was lazy no longer** (`-  y┃x⏎  y`, lines pasted as
  typed with Enter: the second half's `  y` at its content column, its spaces the item's, not the
  text's). A lazy line whose text is as it was stays lazy, its old prefix kept; only where it is
  indented short of the column the text's lines start at now. Regression160.
- **Backspace joining an item whose first child shares its line, after spaces, misplaced its
  lazy line** (`1.  - d⏎e`: `e` a space in). The item written past its marker and one space, not
  the spaces it had, its later lines (`inside`) at the old column; `emptiedPadding` covers an item
  with no text of its own too now. Regression159.
- **A deletion across a callout's title and a paragraph of several lines failed to write**
  (Obsidian, `>[!e]«⏎»a⏎b`; cut and a paste over it too): the join would make a title of two lines.
  Refused now, as a join into a callout's title is. Regression161.
- **Tab on a quote whose first `>` is indented made two roots** (` >a⏎>b`: `-  >a⏎  >b`, the
  space the item's padding, its later `>` short of it, a quote of its own). A quote that is an
  item's text loses the spaces before its first `>` now, as a paragraph's leading blanks go.
  Regression162.
- **A renumbered item whose first child is a nested item on its line lost that child's id, or
  failed to write** (the drop pass on Regression159's start, `1.  - d⏎e`, an item dropped above or
  below it). The line was written anew with its new marker, the nested item's marker in it; the
  line past the marker is copied as it was now, the nested item read again in place. And an ordered
  item on its first child's line, drafted, was refused whatever its number; only where its number
  changes now.
- **Duplicating a list whose first items are indented and its last not merged two copies**
  (`  - a⏎  - b⏎- c`: the first copy lined up with `- c`, the second written as its original, two
  columns in, its child). A copy is written as it is only where the item above it, as written,
  is at its column (`writtenColumn`), not as it was read. Regression163.
- **Tab on a fence between an empty item and an item indented two columns absorbed the
  latter** (`-⏎```⏎```⏎  -`: `  -` the new item's child). An item after one the draft made of
  another node where it was is lined up with it now (`realign`) where its column reaches that one's
  content. Regression164.
- **Indented code moved into a quote written `>` with no space turned into a paragraph**
  (`    x` into `>`: `>    x`, the `>` taking one of its four columns). A line written after such a
  `>`, what is copied after it starting with a blank, gets the space the `>` takes; so does code's
  first line spelled anew. `commands.test.ts`.
- **Tab on a footnote definition whose body is an empty quote lost the body** (`[^1]:>`: the
  item's text read as `` ``). An item whose text is a footnote definition read its text as the
  definition's first leaf's (the quote's, none); it reads the definition whole now, its label
  included, as at the top level. Regression165.
- **A footnote definition dropped first under an empty item failed to write** (`0.`, from
  outside): it would be read as the item's text, a block of blocks that the outline reads as a
  text. Refused now, as code there is. `commands.test.ts`.
- **Duplicating a quote's paragraph ending in a lazy `=` merged the copy into it**
  (`quotes: container`, `>a⏎=`). The seam was read from the lines without the `>`s that make `=`
  lazy, a setext underline then, the two apart; a paragraph with lazy lines is read by its first
  line there now, as the seam under a parent's text already was. Regression166.
- **A heading pasted into an item of a tab-indented text under `indentUnit: 2` failed to write**
  (`-⏎→a⏎⏎→e`, after `a`). The draft placed a new child item a tab past its parent's marker, as in a
  text indented with tabs, whatever the unit; the writer at the content column under `2`, where its
  item takes in the paragraph after it. The draft follows the unit as the writer does now
  (`#tabChild`, `unitChild`), so it sees that and refuses; with the unit detected, a tab, it applies.
  `commands.test.ts`.
- **A paragraph `[!e]` moved into an empty quote failed to write** (`>⏎[!e]`, Tab; a line break
  pasted before `[!e]` in `>a⏎[!e]` too): the quote's first line, it reads as a callout's title.
  Refused now where a paragraph that is a quote's lines would start so, and didn't. `commands.test.ts`
  (an empty quote's subtree selection has no span to draw in the spec).
- **Duplicating a paragraph indented two spaces that owns a list merged the copy into it**
  (`  e⏎- g⏎  >y`: the copy's `  e` the last item's content). A paragraph whose node above now
  ends inside an item, not where it was, is written without its first line's hidden padding
  (`#keepsOut`). The same for an item moved down past an empty heading, before its paragraph
  indented two spaces (`- # g⏎  e⏎#⏎  y`). Regression167, Regression168.
- **A paste in an item whose text is a reference definition dropped the lazy paragraph after
  it out of the item** (`- [a]:u⏎T`): `T` stayed as it was, lazy, but no longer right after what it
  continued. `done()` spells such a paragraph again where the node above it changed (`#keepsIn`),
  and the writer writes a first line that was lazy after its container's prefix, its node read
  where its text is. Regression169.
- **Renumbering `10.` to `2.` made its lazy line, indented three columns, the
  item's** (`1.⏎10. c⏎   a`, a paste after it). A lazy line under a marker made narrower, indented
  as far as the content column is now, is written past that column, its text as it was.
  Regression170. The second case, a cut, remains.
- **Outdenting a quote's reference definition, its paragraph after it lazy, failed to write**
  (`>[a]:u⏎b`: `a line of node 1's without its prefix`). The writer read the paragraph's column from
  the quote's prefix, which a lazy line hasn't; it reads it where the line's own prefix ends now, and
  writes a first line that was lazy after the prefix of the container it is written in (the drop
  and move passes on Regression169's start found the same, in HEAD too, a lazy paragraph moved out
  of its item). Regression171.
- **A marker written over its first child's line failed where that line was written
  for something else** (`- - a⏎  - b`, a quote pasted over the inner items; `- -` under `quotes:
  container`, a quote pasted into the inner item; `→⏎1. -`, two lines pasted). The leads were written
  outermost first, so an outer marker's check saw the inner one's columns still blank; they go
  innermost first now. And a new first child of an item whose marker is written over its line was
  placed by the indentation unit, a tab, where the marker needs spaces at the content column; it
  goes there now (`markerOver`, `onMarkersLine`). `commands.test.ts`.
- **The differential's last write failures, in HEAD too**, besides the paste into a numbered item's list above: lines pasted into a
  paragraph whose first line was lazy (`- [a]:u⏎T`, `1. a⏎2. b`): its later lines after the lazy
  line's empty prefix, `2. b` a list of its own; they go after the prefix its first line now has.
  And a line starting with a tab pasted into a quote's paragraph written `>z`: `done()` gave its
  escapes the column without the space the writer writes after that `>` (for a later line starting with a blank), which it counts
  now. `commands.test.ts`.
- **A quote whose last paragraph's first line is lazy, duplicated, ran into its copy** (the view
  pass on Regression171's start, folded): the seam read the quote without its first line, the lazy
  line then no quote's (the fix for the list pasted after `> <div`); only a quote whose first child opens a block of lines (a fence,
  math, a comment, HTML) is read so now. And a paragraph whose first line is lazy, first in its
  container now, is spelled again with the prefix (`#keepsIn` for the first child too).
- **Taken along by the fixes above**, each failing at the commit:
  multiline paste into quoted code after a tab (`>→  k`), Tab on a lazy paragraph after it
  (`>→  a⏎ a`), Shift-Tab on a quoted item with a tab-led lazy line (`>- e⏎→>`; the `>` after an
  unspaced one and the tab column, the quote's later blank-led line's and the column `done()`
  counts now), duplicating `0. -`
  (the markers written over a shared line innermost first, as for the paste into a numbered
  item's list), Alt-Down on a shared-line
  numbered item (`2) 0.⏎+⏎0.`, the line past a renumbered marker copied as it was), and the loose
  item moved past a heading before a padded paragraph (`- a⏎⏎  b⏎# H⏎  c`, the duplicated indented list's `#keepsOut`: the
  first of the Open items before). `commands.test.ts`.
- **Shift-Enter at the text start of a nested quote's item with a tab after its marker made a
  paragraph of its text** (`>>-→]`): the continuation with tabs, the marker a space, put that space
  right after the `>`s, the quote's then, the item's content a column short. The whitespace after
  the `>`s is one column wider there now, tabs to their stops (`>>→ `). Regression172.
- **Shift-Enter before a quoted item whose marker a tab follows added three spaces to its lazy
  line** (` > +→]⏎```): its later lines at the old content column, past the tab, where the text
  below the marker starts one past it. The columns it drops come off a continuation ending with a
  tab too now, the whitespace after its `>` spaces to the column. Regression173.
- **Moving an item whose first block is a list on its line between items of another marker
  failed to write** (`+ b⏎- - c`, Alt-Up: its `-` kept, another list; `1. a⏎2. - b`: its number on
  the child's line, refused as `which goes`). Its new marker is written over the old one on that
  line as it is written, as wide, where it isn't moved (`remarked`). Regression174, Regression175.
- **An edit on a folded shared row's visible text opened the fold** (`- - a⏎  - SECRET`, the
  outer item folded, `x` typed after `a`): `hiddenContent` compared every descendant's text, the inner
  item's on the visible row too. A descendant whose text is all on the folded node's last line of
  text is compared by id and kind only now; what is under it still counts. `view.test.ts`.
- **A flavor change widened a zoom on an inner item of a shared row to the outer one** (`- - a⏎
  - sibling⏎- outside`, zoomed into `a`, `withConfig({ flavor: 'obsidian' })`: the zoom `[0, 17]`).
  `viewByLine` took the first node of the kind starting on the old line; it takes the one at the same
  depth among the nodes starting there now, where that one is of the kind, folds the same.
  `view.test.ts`.
- **Obsidian: a callout read after a quote's blank first line** (`>⏎>[!e]a`): the outline took
  `[!e]` for the title, the parser a paragraph; Shift-Enter before `a` then failed to write. The
  outline reads a callout from the quote's opening line only (`quoteHead`), as Obsidian and the
  parser do. Its write then went wrong another way: the draft's normal form made a quote holding one
  paragraph that paragraph's quote text, which lost the blank `>`; a quote that held only that
  paragraph already, below its first line, stays a quote now (`#quotedParagraphs`). Regression176.
- **A quote whose first line is a blank `>` (`>⏎>z⏎>  e`)**, the last of the earlier Open items:
  a heading dropped after it wrote it again without that line, a paragraph of quote text, a new node
  (the same `#quotedParagraphs` fix); and its subtree selection wasn't drawn `««…»»` (the test
  drawing started the span at the paragraph's text, which reads as the paragraph alone: it tries the
  root's line start too, `subtreeSpan`). Regression127 can start with such a quote again.
- **A draft that changed nothing was written with a placeholder at 0** (` b⏎␠`, a plain
  paste over the paragraph's subtree selection, its first step a selection alone; ` ┃``,
  `closeBackticks: all`, three backticks at once): the writer's check for a text written empty read
  the pieces it wrote, none for an unchanged text, as an empty one. It reads the text after the
  changes. Regression177, Regression178.
- **Drops offered that the drop refused before writing**: a heading under an
  item, as a heading's first child where it would take in what follows, a quote in a paragraph's
  list, an item with no prose text of its own becoming a paragraph (`- - charlie⏎> delta`), a place
  below a fence nothing closes (`charlie⏎````), and that fence moved with something after it (`# a⏎````,
  to the top). The move's checks before the write are one function (`moveRefused`), which the pickup
  runs for each place, and the one below an unclosed fence is `unholdable`'s, a paste's too. A pickup
  costs what it did (14 ms for a 1,000-item list); for a heading in a 200-item document with
  headings, 38 places are offered where 798 were, 760 of them refused. `commands.test.ts`.
- **Drops offered that the drop refuses once it writes**, the rest: a rule dropped under an item
  with no children was refused, the new list's bullet the config's, the rule's character (`- a⏎---`,
  `- ---` a rule); the list takes another bullet now (`- a⏎  * ---`), and into a list of the rule's
  bullet (`- a⏎  - x⏎---`) the move refuses before the write, which the pickup leaves out. Drops from
  outside had no such check: `pasteAt`'s refusals before the write are one function now
  (`pasteRefused`: a block in a paragraph's list, a heading taking in what follows, a task becoming a
  paragraph), which the pickup runs for each place; and both take two more, from the outline
  (`joinsAround`): an item right above indented code, which would take it in (`    code⏎- a`, `- g`
  dropped at the top), and, where the flavor has front matter, a `---` line closing the one the
  document starts with (Obsidian, `---⏎⏎- alpha`, `---` dropped after the item: a write failure
  before, the document read as front matter). Regression179, `commands.test.ts`.
- **A renumbered item's narrower number let the padded paragraph after it in** (`1.⏎10.⏎   c`, cut
  at the first item; `1. a⏎10. b⏎⏎   c`, the same): `10.` renumbered `1.` moves its content column
  from four to three, where `   c` is. The seam after an untouched node was read as it was; one
  whose number (or a last descendant's) is written narrower is read again now, and the paragraph is
  written without its padding there (`#narrowed`, `#keepsOut`, and `#ownLines` writing the padding
  the draft set). Regression180.
- **Tab on a paragraph whose first line is a checkbox alone failed to write** (`[a]⏎ a`: the space
  dropped; `[a]⏎[a]:s`, `[a]⏎0.`: the next line escaped, `[a]\:s`, `0\.`), in GFM and Obsidian alike.
  The parser reads a task only where whitespace follows the checkbox and the flavor has its status;
  else the checkbox is the paragraph's text and the next line goes on that paragraph, its spaces text,
  starting no block. The outline reads it so; the draft took the line for the start of a paragraph
  below the task in every flavor but CommonMark. It asks the flavor's parser now whether the checkbox
  is a task (`#goesOnBelowBox`). Regression181.
- **A paragraph right after a reference definition was read alone at its seams** (`[a]:u⏎-⏎- b`,
  Shift-Tab at `b`: `-⏎b` one paragraph; `[a]:u⏎0.⏎- a⏎b`, Cmd-Backspace at `a`: `-` an underline,
  `0.` a heading). With no blank line between, that paragraph is the rest of the parser's paragraph
  the definition starts, so `-` and `0.` there are text, which what follows goes on or underlines;
  read alone they are empty items, apart from anything. Its lines are read after the definition's
  now, where the definition is still before it (`#afterDefinition`), and a blank line sets the next
  node apart. Regression182.
- **Shift-Tab on a quoted footnote definition whose paragraph's later line could start a block
  failed to write** (`>[^1]:|⏎>     #t`): the writer refused to copy a moved paragraph's later line
  starting `#` unless `done()` had spelled it. That line is a line of an atom, the definition, which
  moves with its lines as written, the paragraph's container with them; the guard skips an atom's
  lines now. Regression183.
- **A deeply nested document overflowed the call stack** (`'> '.repeat(5000) + 'a'`, a list 3,000
  deep; an update of a list 2,000 deep; Shift-Tab in a quote 2,000 deep): the outline's build
  recursed three calls a level. Its steps are generators now, which yield the nodes they need, run on
  a stack of their own (`run` in `outline.ts`), as fast as before (45 ms for a 20,000-node document,
  0.5 ms an update). The normal form and the writer still recurse; past their depth a command is
  refused (`write-failed`, `the document nests deeper than the writer goes`) instead of throwing.
  `outline.test.ts`.
- **A write was quadratic in the length of the list it edits** (Enter, Tab or Alt-Up mid an
  8,000-item list: 2.0 s): for each sibling the writer looked up where the node above it was written
  by scanning every node written so far, and rebuilt the text written up to it to read its line. The
  written ids are indexed by id now (`Identity`), and the line is read back from the node's place to
  its start (`lineBefore`): 137 ms for 8,000 items, 76 ms for 2,000. `commands.test.ts`, by how the
  time grows from 2,000 items to 8,000.
- **Shift-Enter (or Enter, `enterInQuote: line`) at the end of a middle line of a quote's text
  unquoted the lines after it** (`> a⏎> b┃⏎> c`: `> a⏎> b⏎> ┃⏎\> c`, `c` a paragraph whose text
  started with a literal `>`), as far back as the history goes. The split typed the rest a paragraph,
  its `> `s text, which `done()` escaped line by line, the whole text parsed again for each: that was
  also why a write in a long quote was slow (4,000 lines: 11 s). Every app keeps `c` quoted
  (`sxs/probe.ts all '> a⏎> b┃⏎> c⏎' shiftEnter`): the Obsidian setups `> a⏎> b⏎> ┃⏎> c`, one quote of
  two paragraphs; SilverBullet, Emacs and the block apps an unquoted blank line, `c` a quote of its
  own. As the text editors do: the quote is a container of two paragraphs now, the blank line
  between them quoted, the caret on it; typed on, they are one text again, and Backspace there joins
  them back (`blankLineBack`, `quotes: text`); a list the text adopted stays after the quote
  (`quoteSplit`); a rest of lazy lines alone, with no `>` to keep, is split as before, a paragraph
  after the quote. The two are written anew: `>a` comes back `> a`. And reading a quote's escapes found each line's `>` by
  searching the whole frame for it: by where it starts now. Enter mid a 16,000-line quote: 255 ms.
  Regression184, `commands.test.ts`, by how the time grows.
- **Shift-Enter at the end of a line inside an item's quote text, a quoted line after it**
  (`- > a⏎  > b┃⏎  > c`): left to the host with the quote split above, its rest quoted would make the
  quote the item's first block on its marker's line, two paragraphs in it, the item with no text of
  its own, which the draft couldn't state (`setText` took an item's text, never none) nor the writer
  write (`has no text to spell`). The draft takes an item's text gone now, a quote its first child;
  the writer writes its marker over that quote's first line, as for an item whose first block was
  already on its line (`untexted`); its seam reads the quote's lines after the marker
  (`#firstLines`). Backspace on the quoted blank line joins them, the quote the item's text again.
  Regression185. (The view's property test now reads what a fold hides as the fold-on-a-shared-row
  fix does: a descendant's text on the folded row is shown.)
- **Partial tabs: a tab a quote's `>` or a marker took part of, written again where the line moves**.
  Shift-Tab on a nested quote's paragraph whose lazy line starts with such a tab (`>>=⏎>→e`) wrote
  the raw tab out of the quote, four columns there: the lazy line copied past the container it
  leaves writes the tab's rest as the spaces it spanned (after the space a new `>` takes). Shift-Tab
  on quoted indented code past two tabs (`>→→%⏎⏎`) changed its payload: the outline read the tab
  after the partial one from the line's content start, two columns, where it spans four; the tabs of
  the blanks after a partial tab are read as the spaces they span now (`TextLine.tabs`, every one
  mapped), and the first line of a quote's text past one too (`>→> q`: `  > q`, as `>   > q` reads).
  Shift-Tab on an empty quote nested after one (`>→>`) found no head for it on its line
  (`partialTabHead`, the last piece's only: any piece's now). Written again, a quote's text at such a
  tab gets the `>`'s space the tab gave it, on its first line (`spell`, its head one further:
  `spacedTab`) and its continuation (`continuationAsWas`). Enter at the start of items sharing a
  tabbed marker line (`-→- ->`) refused to write the marker over spaces with a tab in it: written
  over spaces, a tab is the spaces it spans (`writeOver`). Regression186, Regression187,
  Regression188, Regression189.

## The heavy suites

`npm run test:heavy` (`test/heavy.ts`, new) runs them on a frozen copy of the tree: the view pass,
the inverse pairs beside the last commit's code on the same buffers (`inverse-gained.txt`: the round
trips the tree's code gains), the differential against the last commit. `test:diff`, `test:inverse`
and `test:view` are gone from `package.json`: each runs with `node` alone. Run after each batch of
fixes, they caught what a fix broke elsewhere, each fixed before going on: an outdent throwing with
the caret past the text, an empty `- [ ] ` no longer held in CommonMark, a line break pasted at a
quoted fence's start, a `---` item escaped twice, the change `diffLines` gave a move.

- `npm test`: 2,159 pass.
- Differential (1,425,350 runs): no run fails to write (the heavy run before found six, in HEAD too,
  a rule item moved into a list of its bullet: refused now). The outcomes that moved: refusals and
  write failures that apply now; write failures that are refusals; Enter and Shift-Enter in quotes,
  the lines after them quoted now, an item's quote with a quoted line after it the host's; the rest
  looked at one by one (one, a moved item's narrower number taking a paragraph's padding, fixed).
- Inverse pairs: 128 round trips the tree's code doesn't bring back, the commit's does: those on
  this checkpoint's regression starts, whose first command failed to write before; a rule that is
  an item now where it was refused (Tab on `---`, a drop into a list), its inverse a caret at the
  rule's start or the item staying one; DeleteSubtree9's, refused in Obsidian before, where the seam
  check read `---⏎title: x⏎---` alone as front matter, as GFM's now; and a quote split and joined
  back written anew (`>a` → `> a`).
- View exhaustive: 991 buffers, 288,868 runs, none failing.
- SxS: `regressions.md` on every setup, `--compare` against the committed judgment: no verdict worse,
  one ✗ → ✓; on the new cases the text editors keep the numbers as written (Regression180) and don't move
  nodes on Tab (Regression181, Regression182); the Obsidian setups agree on Regression184, the rest
  the camp of an unquoted blank line.

## Open

Each still fails as described: a write failure, which the readback check refuses so nothing is
committed, unless said otherwise. Texts are drawn with `⏎` for LF, `␍` for CR and `→` for a tab. Each
entry ends with its call, `run(text, command, at, config?)` for
`executeCommand(OurusDoc.parse(text, { config }), command, { anchor, head })` (from `src/index.ts`),
`at` an offset (`anchor = head`) or `[anchor, head]`, the config GFM's defaults where none is given.

- C21 **A blank line ourus adds only to set a split heading's rest apart stays after Backspace
  joins it back** (`# abc def⏎bravo`, Shift-Enter after `ab`, then Backspace). Telling it from the
  user's needs the auto-whitespace mark (`AUTO_WHITESPACE_MARK`), defined but not written anywhere.
  `run('# abc def\nbravo', {type:'shiftEnter'}, 4)`, then `deleteContentBackward` at its selection: `# abc def⏎⏎bravo`.
  Fix: the auto-whitespace mark written where ourus adds the line, cleared where it goes. Larger
  than it looks: marks are placeholders alone so far: `read` keeps only placeholders that hold
  (`validPlaceholder`), `points()` gives every mark to the parser as a sentinel, and the writer and
  commands take any mark for one (`settle.ts`, `write.ts`'s copied marks, `duplicate-subtree.ts`):
  each to tell kinds apart first.
- **Shift-Tab on an empty quote nested in a quote leaves the caret after its bare `>`**, in markup
  (`┃> >`: `>┃`; `┃>→>`: `  >┃`): the empty quote is written without the space after its `>`, where
  the caret goes. And a subtree selection of a quote holding an empty quote after a tab (`>→>`) isn't
  drawn `««…»»` (`test/drawing.ts`'s `subtreeSpan` finds no span that reads back as it). Neither is
  any spec case's start: Regression188 starts with a text in the inner quote to stay clear of them.
  `run('> >', {type:'outdent'}, 0)`.
- B09 **Duplicating a quote that ends in a nested empty quote gives a copied node another id**
  (`> →~␍>>`, at 0: `id 4, read as 5`): the copy's nested quote is written anew where the draft
  named it (`nameCopies`, identity of copies).
  `run('> \t~\r>>', {type:'duplicateSubtree'}, 0)`.
- B55 **Shift-Tab on a paragraph of nested quotes before an unclosed fence gives a surviving node
  another id** (`> >e⏎>>```, at 0: `id 2, read as 5`): which child owns the nested quote's first
  line changes (identity of shared container lines).
  `run('> >e\n>>```', {type:'outdent'}, 0)`.
- C11 **A drop of a paragraph with an indented list-like lazy line into a quote, a blank line
  before it all** (Obsidian, `⏎alpha⏎    - bravo⏎> - charlie`, `alpha` after `charlie`: `id 2, read
  as 1`). Without the leading blank line it writes.
  `run('\nalpha\n    - bravo\n> - charlie', {type:'moveSubtree', nodes:[1], to:{parent:2, after:3}}, 0, {flavor:'obsidian'})`, the place the pickup `{type:'drag', nodes:[1]}` offers.
- **A section's last node moved down into the next section and back loses the blank line above
  it** (`## B⏎⏎para⏎⏎- item⏎⏎## C`, Alt-Down then Alt-Up on `item`: `para⏎- item`). The section-end
  rule gives the node that ended a section the gap the new end had where it was (the item's, none,
  at the text's end). Before the rework of that rule (for the blank lines around headings) the document's end went first and
  this round trip came back by the order; about 20 such round trips (three spec buffers) lose a
  line now, where about 50 others no longer gain one.
  `run('## B\n\npara\n\n- item\n\n## C', {type:'moveSubtreeDown'}, 12)`, then `moveSubtreeUp` at its selection.

## Policy questions

Measured against the apps, undecided:

- **Renumbering rewrites numbers the user wrote** (`1.⏎9. c┃`, Enter: `1.⏎2. c⏎3.`). The text editors
  keep them and go on from the item above (`9.`, `10.`: Obsidian in all four setups, SilverBullet,
  Emacs); the block apps renumber, holding no numbers in their text (Logseq, Logseq DB, WorkFlowy,
  Tana, Tine, RemNote, Dynalist, Athens). ourus does as the block apps, and did at HEAD
  (Regression170 pins only the lazy line under it). An option, or numbering only the items a
  command makes.

- **`enterSplitSpace: trim`, the default, glues words on Enter then Backspace** (`one ┃two` →
  `onetwo`). Only Logseq does that; `drop` or `start` round-trips.
- **Shift-Tab on a top-level item makes it a paragraph, which adopts the items after it**; Tab back
  leaves them nested. Sixteen setups do nothing there. An option (`outdentTopLevel`), or no adoption.
- **Enter at the end of a paragraph that owns a list makes a paragraph that takes the list**, where at
  the end of an item with children it makes a first child.
- **A text cut across items, pasted back at the caret, doesn't restore the text.**
