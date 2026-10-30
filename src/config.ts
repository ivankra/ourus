// OurusConfig: behavior users disagree on, as options with documented defaults. An `OurusDoc` holds
// its config and every snapshot after it carries it. Spec files set options by the same keys
// (`outdent: logical` in a test's config block).
//
// Grammar correctness is never configurable, and neither are invariants other parts depend on:
// what "empty" means, which node keeps its id. An option is not a way to postpone a decision: its
// default is the behavior the spec argues for, which users get unless their host says otherwise;
// each option's doc names who does what, and some defaults are the block outliners' minority, chosen
// for Markdown's sake (`outdent`, `enterMidItem`, `joinWithChildren`). Add one when a spec case
// needs it.
//
// Options named `quirk…` model one app's mechanics rather than a rule an editor of Markdown would
// want (where Roam leaves the caret after a paste); their values are `default` and the apps', by name.
// A value named after an app in another option is one too (`backspaceAtItemStart: logseq`).

/** How a document is read and how the commands edit it. */
export interface OurusConfig {
  /**
   * The Markdown dialect the document is read as (see src/parser/):
   * - `gfm` (the default): GitHub Flavored Markdown, CommonMark with tables, tasks, strikethrough and
   *   autolinks.
   * - `commonmark`: CommonMark 0.31.2.
   * - `obsidian`: GFM plus callouts, wikilinks, frontmatter, math and comment blocks, ...
   */
  readonly flavor: 'gfm' | 'commonmark' | 'obsidian';

  /**
   * How the host shows markup (list markers, checkboxes, a heading's `#`s, a quote's `>`, fences),
   * which decides what ourus does with the caret in it, where only the host puts it:
   * - `text` (the default; raw CodeMirror, a textarea, Obsidian's source mode): markup is text the
   *   user edits by hand. Shift-Enter, Backspace, Delete and Cmd-Backspace there are the host's
   *   (`deferredToHost`), and so is an edit at the caret that ourus would refuse there (the refusal's
   *   reason as its `detail`), whatever the text then reads as; and a command may leave the caret on
   *   a fence where the user had it: Backspace back to a fence's end, indent and outdent from a fence
   *   line (where Tab and Shift-Tab in the code are the host's).
   * - `decorated` (rendered checkboxes and bullets, Obsidian's Live Preview): markup is the host's to
   *   draw, and the node can't break through ourus: those keys act at the text start, or make the
   *   edit ourus can check, or are refused (`rejected`); and no command leaves the caret in markup or
   *   on a fence, where typing would break the node.
   *
   * Either way, Enter in markup acts at the node's text start, the character inside a task's
   * checkbox is edited as text, and a structural command from before a node's text (in its marker)
   * leaves the caret in its text.
   */
  readonly markup: 'text' | 'decorated';

  /**
   * How an item is indented where it nests anew and no item of its list beside it gives a column (the
   * first child of a childless item: by Tab, a move, a paste, Enter):
   * - `detect` (the default): as the document nests already, the unit most of its nested items have,
   *   each by its indentation past its parent's marker: any tab in that, `tab`; else one at both its
   *   parent's content column and four past its marker (under `10. `), or at neither, none; else the
   *   content column, `2`, or four past the marker, `4`. Code isn't read. With none, or a tie, `2`.
   * - `tab`: a tab past the parent's marker (Obsidian's "Use tabs", on by default there).
   * - `2`: the parent's content column (2 under `- `, 3 under `1. `), as Prettier and GitHub nest.
   * - `4`: four columns past the parent's marker (Obsidian's "Tab size" 4 with tabs off).
   *
   * Whatever the unit, the item lands where CommonMark reads it as a child: at least its parent's
   * content column (a unit short of it is made up to it with spaces), and never at indented code (no
   * unit reaches four past the content column). The unit also spells the indentation of lines a
   * command moves: with tabs where it is `tab` (or `detect` reads `tab`), else with spaces.
   */
  readonly indentUnit: 'detect' | 'tab' | 2 | 4;

  /**
   * Shift-Tab's later siblings:
   * - `direct` (the default, as in Logseq): they become the item's children, after its own, so the
   *   document order stays the same. Out of a quote, the item leaves where it is, the quote split
   *   around it.
   * - `logical` (as in Roam, WorkFlowy and RemNote): they stay with their parent, and the item and its
   *   subtree move past them. Out of a quote, the item goes below the quote's other children.
   *
   * At the top level, where there is no parent, an item becomes a paragraph in place with either, the
   * items after it its list (as RemNote does). Enter on an empty nested item outdents by it too (see
   * `enterOnEmptyItem`).
   */
  readonly outdent: 'direct' | 'logical';

  /**
   * The bullet of a new item with no list to take one from (a converted paragraph, a pasted line):
   * `-` (the default), `*` or `+`.
   */
  readonly bullet: '-' | '*' | '+';

  /**
   * What a quote is in the outline:
   * - `text` (the default; WorkFlowy's quote, BlockNote's and SiYuan's quote blocks, SilverBullet): a
   *   quote of one paragraph is that paragraph, its text framed by each line's `> ` as a heading's is
   *   by its `#`s: `> q` is a paragraph, `- > q` an item whose text is `q`; it moves, indents and joins
   *   as a paragraph or an item does, and Backspace at its text start takes the `> ` off. A quote
   *   holding more (two paragraphs, a list, a heading) is a container, as with `container`.
   * - `atom` (as Logseq, Tine, Roam, Athens and Dynalist hold it, a block's text): every quote is one
   *   node, its lines as written, `>` included, as code is: a list or a blank `>` line in it is
   *   characters. An item can have one as its text (`- > q`), as it has code.
   * - `container`: a quote is a container like an item, its blocks its children, with no text of its
   *   own: `- > q` is an item with no text holding a quote. Commands act inside it as inside an item.
   *
   * A callout is a container with its title as its text, but under `atom`, where it is an atom too (the
   * text editors edit it as text; the outliners hold `[!note]` as a block's text).
   */
  readonly quotes: 'text' | 'atom' | 'container';

  /**
   * What a list right after a block is the children of, in the document's own sections (the root's, a
   * heading's; in an item or a quote a list is the container's): Markdown has the list beside the
   * block, and the outline reads it under the block or beside it.
   * - `paragraph` (the default): a paragraph's (a quote's of one paragraph too, `quotes: text`): it
   *   moves with the paragraph, and the paragraph's text is its parent's.
   * - `block`: any block's but a heading's (which owns its section) and a quote's that is a container
   *   (whose children are inside it): a paragraph's, code's, a table's, a quote atom's.
   * - `container` (as SiYuan, BlockNote and RemNote without bullets, a flat sequence of blocks): no
   *   block's; the list's items are its container's, beside the block before them. How they move
   *   among the blocks around them, `listMoves` says.
   */
  readonly listParent: 'paragraph' | 'block' | 'container';

  /**
   * Under `listParent: container`, what Alt-Shift-Up and -Down take a list as among the blocks beside
   * it (spec/lists.md):
   * - `list` (the default, as SiYuan, whose list is a block holding its items): one block. A block
   *   moves past the whole list, as far as it goes on (`1. a⏎- b` is two lists); its items move among
   *   themselves, and all of them, a list of one item, past a block; an item at a longer list's edge
   *   stays in it.
   * - `item` (as BlockNote and RemNote without bullets, whose items are blocks): each item a block.
   *   A block moves past one item, splitting the list; an item at its list's edge past the block
   *   beside it, joining a list on the other side.
   */
  readonly listMoves: 'list' | 'item';

  /**
   * The spaces at the caret when Enter splits a node's text (`- one two┃ three`):
   * - `trim` (the default, as Logseq): both halves lose them, `- one two` and `- three`; joined back,
   *   the text is `one twothree`, the one place a command loses what the user wrote.
   * - `drop` (as bare Obsidian, its Live Preview, true-outliner, RemNote and Emacs): the spaces after
   *   the caret go, those before it end the first half (`- one two ┃three` keeps `two␠`).
   * - `start` (as Tine, Roam, Athens, Tana, Dynalist, WorkFlowy, SiYuan, BlockNote, SilverBullet and
   *   Obsidian's Outliner): the spaces after the caret start the second half, the caret before
   *   them, where Markdown keeps them unseen: an item's padding past the space after its marker
   *   (`- one two` / `-  three`, its children moved as far right), a paragraph's or a title's
   *   rest's indentation (`One.`, then ` Two.` on the next line). Markdown reads neither as text; ourus keeps them as
   *   the user's whitespace (`OurusDoc.hiddenSpaces`), so a join gives them back, and Backspace or
   *   Delete in them takes a space. Past three columns they go (four would make code); a marker
   *   after them is escaped. Padding written so by hand is the user's whitespace too, whatever the
   *   value. SiYuan and SilverBullet also trim the first half's end.
   *
   * Shift-Enter isn't this option's: its line keeps the spaces at its start, as every app but
   * true-outliner does.
   */
  readonly enterSplitSpace: 'trim' | 'drop' | 'start';

  /**
   * Enter on an empty item that isn't the last of its list:
   * - `sibling` (the default, as in Logseq, Tine, WorkFlowy, Dynalist, Tana and RemNote with bullets):
   *   a new empty item, at any depth.
   * - `outdent` (as in Roam, Athens and Obsidian, bare and with its Outliner): it outdents, as the
   *   `outdent` option says; at the top level it leaves the list, an empty paragraph.
   * - `exit` (as RemNote nbl): at the top level it leaves the list, as `outdent`;
   *   nested, a new empty item, as `sibling`.
   * - `unwrap` (as SiYuan and BlockNote, document editors, and word processors): an empty paragraph
   *   where it is, at any depth, its list split there: its children and the items after it a list
   *   after it (in an item, the item's next blocks), as `backspaceAtItemStart: unwrap` makes an item.
   *   An empty item with children too.
   *
   * The last item of its list (without children) outdents, or leaves the list, with every value.
   * (Tine and Tana make a new empty item there too; BlockNote a paragraph where it is.)
   */
  readonly enterOnEmptyItem: 'sibling' | 'outdent' | 'exit' | 'unwrap';

  /**
   * Enter in the middle of the text of an item with children:
   * - `sibling` (the default, as in WorkFlowy, Roam, Dynalist and Obsidian): the text after the caret
   *   becomes the item's next sibling, and the children go with it, as they follow it in the text.
   * - `child` (as in Logseq, Tine and RemNote): it becomes the item's first child, and the item keeps
   *   its children.
   *
   * At the end of the text, Enter makes a first child either way.
   */
  readonly enterMidItem: 'sibling' | 'child';

  /**
   * Enter at the start of a node's text:
   * - `into` (the default, as in Logseq, Roam, WorkFlowy, Dynalist and Tana): a new empty node above
   *   it, the caret going into it: an item above an item, an empty paragraph (held by a placeholder)
   *   above a paragraph or a heading.
   * - `stay` (as in Obsidian, bare and with its Outliner, and RemNote): Enter splits there as anywhere
   *   in the text, the caret staying with it: an empty item above an item, a blank line above a
   *   paragraph, and an empty heading above a heading's title, which becomes a paragraph. Backspace
   *   and Delete then take blank lines between paragraphs one a press while more than one is there.
   *
   * SiYuan goes `into` at an item and stays at a paragraph or a heading; Logseq and Tine split a
   * heading; at a heading SiYuan and BlockNote put an empty block above and keep the caret in the
   * heading, which neither value draws. At a fence that is an item's text, Enter goes `into` either way:
   * staying would leave the caret on the fence, markup (Fence15).
   */
  readonly enterAtTextStart: 'into' | 'stay';

  /**
   * Enter on a task with text (at its end, in it, at its start): the item Enter makes is
   * - `continue` (the default, as WorkFlowy, Dynalist, RemNote, SiYuan, BlockNote and Obsidian, bare
   *   and with its Outliner): a task too, unchecked.
   * - `plain` (as Logseq, Tine, Roam and Athens, which keep a task as a marker in a block's text, and
   *   Tana on a split): a plain item.
   *
   * The task keeps its checkbox either way; which half of a checked task stays checked is not this
   * option's (the first, here).
   *
   * It says what a task is, which shows most at Enter: an item with a checkbox (`continue`), or a
   * block whose text starts with a task's marker (`plain`). So a paste on an empty task (spec/paste.md)
   * fills it, its checkbox the first pasted item's, or goes after it, the task not being empty.
   */
  readonly enterTask: 'continue' | 'plain';

  /**
   * Enter in a quote's text (`quotes: text`, a quote of one paragraph) or in a quote read as an atom
   * (`quotes: atom`):
   * - `line` (the default, as Obsidian, bare and with its Outliner, SilverBullet and WorkFlowy): a line
   *   of the quote, its `> ` written, and in a quoted list's item (`atom`) its marker too (`> - `); on
   *   an empty line it leaves the quote (an empty item's marker going first), a paragraph after it.
   * - `split` (as Logseq, Tine, Roam, Athens and Dynalist split a block, and BlockNote its quote): the
   *   rest of the text a paragraph after the quote, unquoted (an item after an item).
   */
  readonly enterInQuote: 'line' | 'split';

  /**
   * A first child with children joining its parent, by Backspace at its text start or Delete at the
   * parent's text end, its children coming up a level into its place:
   * - `join` (the default, as Tine, RemNote, true-outliner and, by Delete, BlockNote join it).
   * - `refuse` (as Logseq, Roam, Athens, WorkFlowy, Dynalist, Tana and Obsidian's Outliner do
   *   nothing): `has-children`.
   *
   * A sibling with children joining the sibling above keeps them at their depth, and joins either
   * way (Tana alone refuses it); under `refuse`, only where that sibling has no children of its own
   * (a folded one's included) and the join is into it, not into its last descendant. An empty item's own children are `emptyItemWithChildren`'s; where
   * both options apply (Delete on an empty item whose first child has children), either refuses.
   */
  readonly joinWithChildren: 'join' | 'refuse';

  /**
   * A merge (Backspace at a text's start, Delete at its end, a selection across nodes typed over or
   * deleted) of two nodes that both have a block id (spec/block-ids.md). Where only the
   * lower one has one, the node that stays takes it, whatever this says.
   * - `refuse` (the default): refused as `block-id`. A node keeps one block id: links to the other
   *   would find nothing.
   * - `merge`: the node that stays keeps its own, the other's goes, and the result says which went
   *   into which (`mergedBlockIds`), for a host that redirects the links to it (Obsidian's metadata
   *   cache finds them in every note). Logseq OG keeps one and redirects references to the other.
   */
  readonly joinBlockIds: 'refuse' | 'merge';

  /**
   * Backspace at the start of an item with nothing above it in its container (the document's first
   * item, a quote's first item; a callout's joins its title):
   * - `unwrap` (the default, where bare Obsidian ends up in two presses): the marker goes and the item
   *   is a paragraph where it is, the items after a top-level one its list, as Shift-Tab makes them;
   *   in a quote, Backspace again takes the `>`.
   * - `refuse` (as Logseq, Roam, WorkFlowy, Tine and RemNote do nothing at the first block):
   *   `nothing-above`.
   */
  readonly backspaceAtTopItem: 'unwrap' | 'refuse';

  /**
   * Backspace at the start of an item's text with an item or a text above it in its container, once
   * the markup in front of the text has gone (a checkbox, a heading's `#`s):
   * - `join` (the default, as every outliner: Logseq, Roam, WorkFlowy, Dynalist, Tana, RemNote): the
   *   item joins the node above.
   * - `body` (as SiYuan and Typora): its marker goes, the item a paragraph at the end of the item above
   *   it, after that item's children, its own children with it; a second press joins it.
   * - `unwrap` (as BlockNote and a document editor's list): its marker goes, the item a paragraph where
   *   it is, the items after it its list, as `backspaceAtTopItem: unwrap` makes the first one.
   *
   * - `logseq` (a quirk, not a rule: Logseq and Tine, whose numbering is a block's property):
   *   a numbered item's number goes first, the item a bulleted one where it is, its list split there,
   *   an empty one too; a bulleted item joins.
   *
   * A first child is a paragraph where it is with either, its parent's first after its text. An empty
   * item goes either way (rule 3).
   */
  readonly backspaceAtItemStart: 'join' | 'body' | 'unwrap' | 'logseq';

  /**
   * Backspace or Delete on an empty item with children, where they would move up into its place
   * (Backspace with nothing above it in its parent, Delete, whose first child joins up into it):
   * - `lift` (the default): with Backspace, the item goes, its children taking its place, a level up;
   *   with Delete, its first child joins up into it, that child's children coming along and the
   *   item's other children staying (Delete joins the node below into the one it is at, as anywhere).
   * - `refuse` (as Logseq, Roam, Athens, WorkFlowy, Dynalist and Obsidian's Outliner do nothing):
   *   `has-children`. BlockNote, true-outliner, Tine and Tana refuse only Backspace with nothing above
   *   the item, and lift its children on Delete (Tine putting them after the other children of the
   *   item they join; Tana lifting all of them, as Backspace would); RemNote lifts them with both
   *   keys, as Backspace does; SiYuan makes an empty paragraph of the item with Backspace.
   *
   * Backspace into an item above it, which takes its children at their depth, joins either way.
   */
  readonly emptyItemWithChildren: 'lift' | 'refuse';

  /**
   * Backspace at a heading's text start, and Delete before a heading:
   * - `text` (the default): the heading's marks go as a unit, the title becoming a paragraph where it
   *   is, by Backspace at its text start and by Delete before it, the caret staying (as SiYuan does);
   *   a second press joins it as any paragraph. Bare Obsidian deletes one character, leaving
   *   `#Hello`, and its Delete joins the `#`s as text.
   * - `block` (as outliners join any block, Tana's sections among them): both join just the title into
   *   the node above.
   */
  readonly headingEditing: 'text' | 'block';

  /**
   * Backspace right after a task's checkbox:
   * - `checkbox` (the default): the checkbox goes as a unit, as a heading's `#`s do, and the task is a
   *   plain item, its text staying put.
   * - `text` (as a plain text editor and bare Obsidian): one character of the checkbox goes, done by
   *   ourus, and the item's text then starts with what is left of it.
   * - `block` (as outliners join any block, true-outliner among them; WorkFlowy and Dynalist on an
   *   empty task): the task joins the node above, its checkbox going with its marker; an empty task
   *   goes as any empty item.
   * - `unwrap` (as SiYuan and BlockNote, document editors): the task is a paragraph where it is, its
   *   checkbox going with its marker, its list split there, as `backspaceAtItemStart: unwrap` makes an
   *   item; an empty task an empty paragraph.
   *
   * Tana peels the checkbox of an empty task only.
   */
  readonly taskEditing: 'checkbox' | 'text' | 'block' | 'unwrap';

  /**
   * Enter and Shift-Enter on the code lines of a fenced block:
   * - `true` (the default): ourus makes the new line, in the containers the block is in, with the
   *   line's own indentation.
   * - `false`: they are the host's (`deferredToHost`), for hosts that edit code themselves
   *   (language-aware indentation, embedded code editors).
   *
   * The fence lines are ourus's either way.
   */
  readonly handleFenceContents: boolean;

  /**
   * A typed backtick that opens something a backtick closes (a tilde, for a tilde fence, the same):
   * - `fences` (the default): a code fence typed at a line's text start gets its closing fence, as
   *   long, on the line below, so the block takes in nothing that follows it; inline backticks are
   *   the host's.
   * - `all` (as bare Obsidian, its "Auto pair Markdown syntax" on by default): inline code too: a
   *   backtick at a word boundary is typed as a pair, the caret between; typed before the closing
   *   backtick of an empty pair or a code span it steps over it; around a selection on one line it
   *   makes it code; Backspace in an empty pair takes both.
   * - `none` (as a text editor, Emacs's markdown-mode): nothing is closed: an unclosed fence reads
   *   to the end of its container, as Markdown reads it.
   *
   * A fence's two runs keep one length whatever the value: a backtick typed on either fence, or
   * Backspace and Delete in one, change both, since an opening longer than its closing fence would
   * leave the block unclosed.
   */
  readonly closeBackticks: 'fences' | 'all' | 'none';

  /**
   * Copy and cut (Ctrl-C, Ctrl-X: `copy`, `cut`) with no selection, a caret alone (spec/copy.md):
   * - `node` (the default, as Tana): the node at the caret with its subtree; a cut takes them out.
   * - `host`: the host's, CodeMirror's the line, a textarea's nothing; most apps copy nothing there
   *   (Roam, Athens, WorkFlowy, Dynalist, BlockNote) or a block reference, which Markdown has no
   *   form for (Logseq, Logseq DB, Tine, RemNote); Obsidian, true-outliner and SilverBullet copy and
   *   cut the line.
   */
  readonly copyAtCaret: 'node' | 'host';

  /**
   * Copy and cut (`copy`, `cut`) of a selection across nodes (spec/copy.md):
   * - `text` (the default, as BlockNote, Obsidian and SilverBullet): the selected Markdown as written,
   *   out of the containers holding all of it; a cut deletes the range as Backspace over it does.
   * - `nodes` (as Logseq, Logseq DB, Tine, Athens, Tana, Dynalist, RemNote and true-outliner, most
   *   turning the selection into blocks selected): the whole nodes it touches, with their subtrees; a
   *   cut takes them out, as `deleteSubtree`. Both are refused where it refuses those nodes (siblings
   *   not in a row).
   * Within one node's text, the text either way.
   */
  readonly copySelection: 'text' | 'nodes';

  /**
   * Paste (Ctrl-V, `paste`) of nodes into a node's text (spec/paste-list.md):
   * - `closed` (the default, as Logseq, Logseq DB, Tine, Roam, Athens, Tana, SiYuan and true-outliner
   *   paste): the paste is whole nodes, put between nodes; the node at the caret is left as it is,
   *   wherever in its text the caret is.
   * - `open` (as BlockNote pastes; WorkFlowy, RemNote and Dynalist each open a seam their own way): the
   *   first pasted text joins the text before the caret, the text after the caret joins the last, and
   *   the node's children follow the last pasted node, as a text editor's paste of the Markdown would
   *   have them. A heading's title joins too. Where a seam can't close (a block that isn't text, a
   *   heading that takes in what follows it, the caret in a heading's title), the paste is closed.
   */
  readonly pasteSeams: 'closed' | 'open';

  /**
   * Paste (`paste`, and plain paste as `pastePlainLines: items`) over a selection inside one node's
   * text, where what is pasted is nodes (blocks: items, paragraphs, headings, code, ... between
   * nodes, not text put into the node's text) (spec/paste.md):
   * - `replace` (the default, as SiYuan, BlockNote, Dynalist, WorkFlowy and RemNote paste): the
   *   selection goes first, as a cut takes it, and the nodes go where that leaves the caret.
   * - `ignore` (as Logseq, Logseq DB, Tine, Tana, Roam and Athens paste blocks): the selected text
   *   stays as it is, the selection deciding nothing, and the nodes go where a paste at a caret (the
   *   selection's end) puts them.
   * What is pasted as text (one line put in at the caret, plain lines going into the text, code into
   * code) replaces the selection either way, as typing does; so does anything over a partial
   * selection across nodes. Over nodes selected whole (a subtree selection): `replace` puts the
   * clipboard's nodes in their place; `ignore` keeps them and puts the clipboard's nodes right after
   * the last, as Tana does (the other block apps measured paste nothing there).
   */
  readonly pasteOverSelection: 'replace' | 'ignore';

  /**
   * Paste (Ctrl-V, `paste`) of plain lines, a clipboard of paragraphs only (spec/paste.md):
   * - `text` (the default, as Logseq, Logseq DB, Tine and SiYuan paste them): they go into the text at
   *   the caret, as plain paste puts them; in a heading, which holds one line, they are a paragraph.
   *   Pasted into a list, a paragraph is one item, its lines the item's text.
   * - `items` (as Roam, Athens, WorkFlowy and Dynalist paste them): each line is a node, an item each
   *   in a list, a paragraph's lines too.
   */
  readonly pasteLines: 'text' | 'items';

  /**
   * Plain paste (Ctrl-Shift-V, `pastePlain`) of text with a line break (spec/paste-plain.md):
   * - `text` (the default, as Logseq, Logseq DB, Tine, Roam and Athens): the lines go into the text
   *   at the caret, each line break Shift-Enter's.
   * - `items` (as Tana and WorkFlowy, which have no plain paste that keeps lines in a block): each
   *   line is a node, its Markdown escaped (text, not structure) but a list marker, which makes it an
   *   item, placed as paste places nodes (`pasteSeams`, `pasteAtTextStart`, `pasteOnParent`).
   * - `enter` (as Dynalist): the text typed, each line break an Enter: the line at the caret splits,
   *   each line after it a new node, the last the text after the caret's.
   * - `host` (as Obsidian, SilverBullet and Emacs): the host's, the text inserted as it is.
   * RemNote's, a node per line with only the first line joining the text at the caret, is none of them.
   */
  readonly pastePlainLines: 'text' | 'items' | 'enter' | 'host';

  /**
   * Paste (Ctrl-V, `paste`) at the start of a node's text, where the paste goes (spec/paste-list.md):
   * - `after` (the default, as Logseq, Logseq DB, Tine, Tana and Athens paste): after the node, as
   *   anywhere else in its text.
   * - `before` (as Roam, SiYuan and WorkFlowy paste): before it, where the caret is; pasted items
   *   before an item take its list's form, numbered from it.
   */
  readonly pasteAtTextStart: 'after' | 'before';

  /**
   * Paste (Ctrl-V, `paste`) on a node with children, where the paste goes (spec/paste-list.md):
   * - `children` (the default, as Logseq, Logseq DB, Roam, Athens and true-outliner paste): first among
   *   them, an item's, a heading's section's, a paragraph's list's.
   * - `after` (as Tine, Tana, SiYuan, WorkFlowy and Dynalist paste): after them: after an item and its
   *   children, as its next siblings; last in a heading's section; last in a paragraph's list.
   * On a folded item, after it either way, its children hidden (spec/fold.md).
   */
  readonly pasteOnParent: 'children' | 'after';

  /**
   * Paste (Ctrl-V, `paste`) into a list of a paragraph followed by its list (spec/paste-list.md): the
   * paragraph is an item, and the list's items are
   * - `siblings` (the default, as Logseq, Logseq DB, Tine, WorkFlowy and BlockNote paste them): after
   *   it.
   * - `children` (as Roam, Athens, true-outliner, SiYuan and Dynalist paste them, and Tana and RemNote
   *   from HTML): its children, as an outliner's copy means them (Tana's: a node's children as a
   *   paragraph's list).
   * In an item or a quote, where a paragraph owns no list, the list follows the paragraph either way.
   */
  readonly pasteParagraphList: 'siblings' | 'children';

  /**
   * Paste (Ctrl-V, `paste`) of items into a list of the other kind, numbered into bullets or bullets
   * into numbered (spec/paste-list-form.md):
   * - `destination` (the default, as Logseq, Logseq DB, Tine, Roam, Athens, Tana, SiYuan, WorkFlowy and
   *   Dynalist paste HTML lists): they take the list's form, its bullet or its numbers.
   * - `own` (as BlockNote, RemNote and true-outliner paste): they keep their markers, a list of their
   *   own where they land, as a move keeps an item's.
   * Into a list of their kind they take its marker either way; a pasted paragraph or heading, which has
   * no form, the list's.
   */
  readonly pasteListForm: 'destination' | 'own';

  /**
   * The selection ladder (`expandSelection`, Ctrl-A in outliners), past a node's subtree:
   * - `siblings` (the default, as true-outliner and Dynalist climb): its siblings' run, then its
   *   parent's subtree, and so on outward.
   * - `parents` (as Logseq and Tine climb): its parent's subtree, the siblings' run skipped (the top
   *   level's run, everything, still the top).
   * - `top` (as Roam, Tana, WorkFlowy and SiYuan climb): from the node's text straight to the top
   *   level's run, everything (inside a zoom, the zoom root's subtree).
   */
  readonly selectionLadder: 'siblings' | 'parents' | 'top';

  /**
   * Shift-Up by node (`selectNodeUp`) from a node with a sibling above that has children:
   * - `line` (the default, as Logseq, Logseq DB, Tana, Athens, Tine and true-outliner): the node on
   *   the line above, the sibling's last descendant (`deep` and `three`, then `two` and `three`), as
   *   from a first child its parent; Shift-Down's exact inverse.
   * - `sibling` (as Dynalist, RemNote, WorkFlowy and SiYuan): the sibling above with its subtree
   *   (`two` and `three`), a first child's parent next.
   */
  readonly selectNodeUp: 'line' | 'sibling';

  /**
   * Indent and outdent over roots at several depths (`deep` and `three`, a forest: Shift-Down's, a
   * drag's):
   * - `level` (the default, as Logseq DB and Tine): the roots lined up after the first as its
   *   siblings, one run (a root may go deeper: `e` after `d`), then indented or outdented as that run:
   *   the selection one run of siblings after, which the next press moves whole.
   * - `each` (as WorkFlowy, Roam and Tana; true-outliner): each run of sibling roots as it would go
   *   alone, all or nothing; refused where the result is no one range (`outdent: logical`).
   * - `refuse` (as Athens and SiYuan): nothing, refused (`non-contiguous`).
   */
  readonly mixedDepths: 'level' | 'each' | 'refuse';

  /**
   * Enter inside a heading's title, past its start and before its end (a heading's, ATX or setext, or
   * an item's whose text is an ATX one):
   * - `default` (as Logseq, Tine, Athens and RemNote): the heading keeps the text before the caret; the
   *   rest is its section's first paragraph, or an item's, the next item (as `enterMidItem` places one).
   * - `workflowy` (and Roam and Dynalist, whose heading is a block's attribute and whose Enter makes the
   *   new block above, the original keeping its attributes): the text before the caret is a paragraph,
   *   or an item, above; the heading keeps the rest, and its section or the item's children.
   */
  readonly quirkEnterMidHeading: 'default' | 'workflowy';

  /**
   * The caret after a paste that makes nodes:
   * - `default`: at the end of the last pasted text, where typing goes on after the paste.
   * - `roam`: at the end of the first pasted text, as Roam leaves it.
   * - `athens`: at the start of the first pasted text, as Athens leaves it.
   */
  readonly quirkPasteCaret: 'default' | 'roam' | 'athens';

  /**
   * A paste whose clipboard is text alone (no HTML, no Markdown format):
   * - `default`: the text read as Markdown, as `paste` reads any clipboard.
   * - `dynalist`: plain text, as `pastePlain` puts it (`pastePlainLines`), list markers staying text:
   *   Dynalist reads Markdown only from a clipboard's HTML.
   */
  readonly quirkPasteText: 'default' | 'dynalist';

  // Not built yet: options considered, kept here for later.
  //
  // - renumbering: 'changed' | 'never'. Ordered lists an edit touched are renumbered (today), or
  //   numbers are left as written.
  // - homeAtTask: 'after' | 'before'. Whether Home stops after a task's checkbox or before it.
  // - pastedNumbering: 'continue' | 'restart'. Whether a pasted ordered run takes the list's numbers,
  //   and whether the items after a list of its own (`pasteListForm: own`) restart at 1, as
  //   BlockNote, Tine, WorkFlowy and true-outliner number them.
  // - emptyNodeLeft: 'keep' | 'remove'. Leaving an empty node the text can't hold. Decided instead
  //   (spec/placeholders.md): an empty item stays, set off by a blank line; an empty paragraph goes.
  //   It is tied into placeholders and their settling (`settlePlaceholders`), so it stays a decision, not an option.
  // - readers: host parsers (lezer in CodeMirror 6, Obsidian's Live Preview) that verification
  //   also checks a result against, so other tools read the text as ourus does. Opt-in: lezer
  //   misreads lists in a tab-indented quote. A host's objects, not a value a file can set.
}

/** The values each option takes, its default first, for readers of string settings (spec files, frontmatter). */
const CONFIG_VALUES: { readonly [K in keyof OurusConfig]: readonly [OurusConfig[K], ...OurusConfig[K][]] } = {
  // How the text reads, and how the host shows its markup: every command
  flavor: ['gfm', 'commonmark', 'obsidian'],
  markup: ['text', 'decorated'],
  // The outline: what Shift-Tab does, a new item's bullet, what a quote is, what a list is under
  indentUnit: ['detect', 'tab', 2, 4],
  outdent: ['direct', 'logical'],
  bullet: ['-', '*', '+'],
  quotes: ['text', 'atom', 'container'],
  listParent: ['paragraph', 'block', 'container'],
  listMoves: ['list', 'item'],
  // Enter, the key pressed most
  enterSplitSpace: ['trim', 'drop', 'start'],
  enterOnEmptyItem: ['sibling', 'outdent', 'exit', 'unwrap'],
  enterMidItem: ['sibling', 'child'],
  enterAtTextStart: ['into', 'stay'],
  enterTask: ['continue', 'plain'],
  enterInQuote: ['line', 'split'],
  // Backspace and Delete at a node's edge
  joinWithChildren: ['join', 'refuse'],
  joinBlockIds: ['refuse', 'merge'],
  backspaceAtTopItem: ['unwrap', 'refuse'],
  backspaceAtItemStart: ['join', 'body', 'unwrap', 'logseq'],
  emptyItemWithChildren: ['lift', 'refuse'],
  // Editing markup: a heading's `#`s, a task's checkbox, a fence's contents, a typed backtick
  headingEditing: ['text', 'block'],
  taskEditing: ['checkbox', 'text', 'block', 'unwrap'],
  handleFenceContents: [true, false],
  closeBackticks: ['fences', 'all', 'none'],
  // Clipboard
  copyAtCaret: ['node', 'host'],
  copySelection: ['text', 'nodes'],
  pasteSeams: ['closed', 'open'],
  pasteOverSelection: ['replace', 'ignore'],
  pasteLines: ['text', 'items'],
  pastePlainLines: ['text', 'items', 'enter', 'host'],
  pasteAtTextStart: ['after', 'before'],
  pasteOnParent: ['children', 'after'],
  pasteParagraphList: ['siblings', 'children'],
  pasteListForm: ['destination', 'own'],
  // Selection
  selectionLadder: ['siblings', 'parents', 'top'],
  selectNodeUp: ['line', 'sibling'],
  mixedDepths: ['level', 'each', 'refuse'],
  // Options to model quirks of different apps (for testing)
  quirkEnterMidHeading: ['default', 'workflowy'],
  quirkPasteCaret: ['default', 'roam', 'athens'],
  quirkPasteText: ['default', 'dynalist'],
};

/** Every option's default: the first of its values. */
const CONFIG_DEFAULTS = Object.fromEntries(Object.entries(CONFIG_VALUES).map(([key, values]) => [key, values[0]])) as unknown as OurusConfig;

/** The options' defaults and values, and a config made, compared and read from settings. */
export const OurusConfig = {
  /** Every option's default: the value the spec argues for. */
  defaults: CONFIG_DEFAULTS,
  /** The values each option takes, its default first. */
  values: CONFIG_VALUES,

  /**
   * `partial` over the defaults, an option given as `undefined` absent. Throws for an unknown
   * option and for a value an option doesn't take (`OurusConfig.values`), which would read and
   * write otherwise than any host means: an unknown flavor as CommonMark, an indentation unit of 3
   * as 4.
   */
  of(partial: Partial<OurusConfig> = {}): OurusConfig {
    const config: Record<string, unknown> = { ...CONFIG_DEFAULTS };
    for (const [key, value] of Object.entries(partial)) {
      if (value === undefined) continue;
      const allowed = Object.hasOwn(CONFIG_VALUES, key) ? (CONFIG_VALUES as Record<string, readonly unknown[]>)[key] : undefined;
      if (!allowed) throw new TypeError(`unknown option "${key}"`);
      if (!allowed.includes(value)) throw new TypeError(`option "${key}" takes ${allowed.join(', ')}, not ${JSON.stringify(value)}`);
      config[key] = value;
    }
    return config as unknown as OurusConfig;
  },

  /** Whether two configs give every option the same value. */
  same(a: OurusConfig, b: OurusConfig): boolean {
    return a === b || Object.keys(CONFIG_VALUES).every((key) => a[key as keyof OurusConfig] === b[key as keyof OurusConfig]);
  },

  /**
   * The options string settings (`key: value`) set, as values (`true` for a flag's `true`), or the
   * first problem with them: an unknown key, or a value the option doesn't take.
   */
  read(settings: Readonly<Record<string, string>>): Partial<OurusConfig> | string {
    const config: Record<string, unknown> = {};
    for (const [key, text] of Object.entries(settings)) {
      // (an option of its own, not a property every object has: `constructor`, `toString`)
      const allowed = Object.hasOwn(CONFIG_VALUES, key) ? (CONFIG_VALUES as Record<string, readonly unknown[]>)[key] : undefined;
      if (!allowed) return `unknown option "${key}"`;
      const value = allowed.find((v) => String(v) === text);
      if (value === undefined) return `option "${key}" takes ${allowed.join(', ')}, not "${text}"`;
      config[key] = value;
    }
    return config as Partial<OurusConfig>;
  },
} as const;
