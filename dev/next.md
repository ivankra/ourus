# What to do next (2026-11-16)

Open work only. The bugs are `test/bugs.ts` (`npm run bugs`, `node test/bugs.ts B413`): 53 open, all
P4, 43 of them `write-failed` refusals. Sizes: S a day or less, M a few days, L a week or more.

## Behavior

| Task | Size | Notes |
|---|---|---|
| The boundary table as a test | M | `test/edges.ts`'s grid (`dev/31-align.md`) asserted cell by cell, an asymmetry only where it is a listed exception, under `decorations` none and all; then `quotes: atom`, `headingEditing: block`, and Enter's boundaries |
| `not-done` deferrals to none | M | Every `null` a command returns for a host key: 51 sites over the suites (113,580 cases, 2% with decorations; the most `backspace.ts` over a selection across texts, Cmd-Backspace over a selection, Delete in a gap or prefix). Decide per site by what the host's edit does there (the action player plays it): a site whose host edit keeps the outline is `host-default` or `in-markup`, else ourus acts or refuses; then the leftover refused, not deferred. Not by the caret's zone alone: that labels the gaps decided |
| Fewer options | M | About 40; an option or value no app setup (drivers' `behaves`) and no stated user needs is a candidate to remove, with its spec cases and code |
| Audit the spec by sampling | M | The 91 `core` cases by hand, then a sample of `common`; flag a case whose only reason is "the code does this"; tag each case with where its intent came from |

## Bugs

| Task | Size | Notes |
|---|---|---|
| The easy P4s | M | Read the open bugs through; fix each whose mechanism is one place, with its test (the user's, 2026-11-14) |
| One model of the lines | L | The seam check (`#lastLines`, `#firstLines`, `#ownLines`, `draft.ts`) predicts lines the writer writes otherwise: B490, B509, B510, B512, B514, B524, B527. Fix place by place, or one function both call (prototype and measure first). B512/B527 need the writer's `realign` (`write.ts`) shared with the check |
| A failing command's later writings | S | B331 (indented code into a quote) |
| Marks, per transform | M | Each transform that reshapes a gap carries its marks: B444 to B446, B477, B478, B520 |
| Marks through a rewrite | M | A mark is a held empty node or line, a held space, an escape or closer of ours: state what moving, splitting, joining, converting, filling and abandoning do to each, and make the draft carry it. B413 |
| Refuse early what won't be fixed | S | A P4 shape's write failure as a stated `not-expressible` refusal in the draft |
| Text cuts that don't paste back | S | `- o«ne⏎- two⏎  »- kid`: pasted back, `kid` goes beside `two`; `# H«ead⏎para⏎»- x`: the host's deletion, a marker left as text |
| B403 | S | A quote after an item the writer lines up further left: its lines need the shift a moved quote gets (`moved`), not a lift |
| B453 | S | A quote atom's lazy line keeps two front spaces no column holds under the new item: refuse in the draft, or compare an atom's continuation lines without them |
| Uneven columns after B359's fix | S | Tab over two code blocks after a padded item (`  - c3⏎```…⏎```…`): the second new item at column 0, the first at 2 |

## Tests

| Task | Size | Notes |
|---|---|---|
| Corpus | S | `test/lib/generated-notes.ts`: half the notes without a final line break; every option, not six sets; CRLF, lone-CR and BOM forms; a block shape per new failure family |
| Actions | S | `SESSION_ACTIONS` never plays `selectNodeDown`, `selectNodeUp`, `moveSubtree`, `pasteAt`, `addBlockId`, `removeBlockId`, commands given `nodes` (`action-player.ts` knows them) |
| The other reports at volume | S | Volume runs paused (the user's, 2026-11-14) |
| The marks check: marks that follow their nodes | S | A mark moving with its block, alike blocks a move regroups: read as no loss (half of each seed's marks cases) |
| Parser differential | S | micromark beside commonmark.js and cmark-gfm (`test/parser/oracles.ts`), over the spec's buffers and the generated notes too |
| Refusal and deferral rates | S | Per command over a fixed corpus; expected refusals apart from `OurusFailed`, deferrals by reason |
| Performance at the APIs | S | Scaling checks where hosts call, not parsing alone (`executeCommand` on 200,000 siblings: about 6 s) |
| HTML | M | A wider inline representation, emitted and escaped once, with measured coverage |

New oracles (M), none automated yet:

| Oracle | Would have found |
|---|---|
| An edit gives equivalent results on LF, CRLF and CR forms of a note | B230, B231 |
| Keyboard move and drop agree on the same destination | B419 to B422 |
| Type a character, Backspace: the note comes back | B204, B245, B246 |
| Each `expandSelection` holds the last | B216 |
| `selectedSubtrees(selectionOf(roots))` gives the roots, zoomed and folded too | B212 |
| `visibleSelection` of its own result changes nothing | B212, B213 |
| Numbered lists stay sequential under `renumber` | B199, B442, B443 |
| Settling twice does what settling once does; an abandoned placeholder goes, or is kept or refused by a stated rule | B239 |
| A paste keeps the clipboard's and the note's letters in order, not only their count | B327 |
| Edit, settle, edit: the whole state checked at each boundary (text, selection, marks, view) | B276 |
| A fixed mechanism over its variations (spaces or tabs, shared marker line or not, final line break or not, LF/CRLF/CR, BOM, each `quotes` mode) | B229, B230, B305 |
