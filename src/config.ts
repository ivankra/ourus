// Config: behaviour users disagree on, as options with documented defaults. An `OutlineState` holds its
// config and every snapshot after it carries it. Spec files set options by the same keys
// (`outdent: logical` in frontmatter, or in one test's `config` block).
//
// Grammar correctness is never configurable, and neither are invariants other parts depend on:
// what "empty" means, which node keeps its id. An option is not a way to postpone a decision: its
// default is what nearly everyone gets. Add one when a spec case needs it.

export interface Config {
  /**
   * The Markdown dialect the document is read as (see src/parser/):
   * - `commonmark` (the default): CommonMark 0.31.2.
   * - `gfm`: GitHub Flavored Markdown.
   * - `obsidian`: GFM plus callouts, wikilinks, frontmatter, math and comment blocks, ...
   */
  readonly flavor: 'commonmark' | 'gfm' | 'obsidian';

  /**
   * Shift-Tab's later siblings:
   * - `direct` (the default, as in Logseq): they become the item's children, after its own, so the
   *   document order stays the same. Out of a quote, the item leaves where it is, the quote split
   *   around it.
   * - `logical`: they stay with their parent, and the item and its subtree move past them. Out of a
   *   quote, the item goes below the quote's other children.
   *
   * Enter on an empty nested item outdents by it too (see `enterOnEmptyItem`).
   */
  readonly outdent: 'direct' | 'logical';

  /**
   * The bullet of a new item with no list to take one from (a converted paragraph, a pasted line):
   * `-` (the default), `*` or `+`.
   */
  readonly bullet: '-' | '*' | '+';

  /**
   * Enter on an empty nested item that isn't its parent's last child:
   * - `sibling` (the default, as in WorkFlowy, Logseq and Dynalist): a new empty item.
   * - `outdent` (as in Roam): it outdents, as the `outdent` option says.
   *
   * A last child outdents either way.
   */
  readonly enterOnEmptyItem: 'sibling' | 'outdent';

  /**
   * Enter in the middle of the text of an item with children:
   * - `sibling` (the default, as in WorkFlowy, Roam, Dynalist and Obsidian): the text after the caret
   *   becomes the item's next sibling, and the children go with it, as they follow it in the text.
   * - `child` (as in Logseq and Tine): it becomes the item's first child, and the item keeps its
   *   children.
   *
   * At the end of the text, Enter makes a first child either way.
   */
  readonly enterMidItem: 'sibling' | 'child';

  /**
   * Enter at the start of a node's text:
   * - `into` (the default, as in WorkFlowy, Roam, Dynalist and SiYuan): a new empty node above it,
   *   the caret going into it: an item above an item, an empty paragraph (held by a placeholder)
   *   above a paragraph or a heading.
   * - `stay` (as in Obsidian, with or without its Outliner plugin, and SilverBullet): Enter splits
   *   there as anywhere in the text, the caret staying with it: an empty item above an item, a blank
   *   line above a paragraph, and an empty heading above a heading's title, which becomes a paragraph.
   *
   * Logseq and Tine go `into` at an item and split a heading; BlockNote stays at an item and puts an
   * empty block above a heading.
   */
  readonly enterAtTextStart: 'into' | 'stay';

  /**
   * Backspace at the start of an item with nothing above it in its container (the document's first
   * item, a quote's first item; a callout's joins its title):
   * - `unwrap` (the default, where bare Obsidian ends up in two presses): the marker goes and the item
   *   is a paragraph where it is, the items after a top-level one its list, as Shift-Tab makes them;
   *   in a quote, Backspace again takes the `>`.
   * - `refuse` (as Logseq, Roam and WorkFlowy do nothing at the first block): `nothing-above`.
   */
  readonly backspaceAtTopItem: 'unwrap' | 'refuse';

  /**
   * Backspace or Delete on an empty item with children, where they would move up into its place
   * (Backspace with nothing above it in its parent, Delete, whose first child joins up into it):
   * - `lift` (the default): the item goes, its children taking its place, a level up.
   * - `refuse` (as Logseq, Tine, Roam, WorkFlowy, Dynalist and Obsidian's Outliner do nothing):
   *   `has-children`. SiYuan, BlockNote and true-outliner refuse only Backspace with nothing above the
   *   item, and lift its children on Delete.
   *
   * Backspace into an item above it, which takes its children at their depth, joins either way.
   */
  readonly emptyItemWithChildren: 'lift' | 'refuse';

  /**
   * Enter and Shift-Enter on the code lines of a fenced block:
   * - `true` (the default): ourus makes the new line, in the containers the block is in, with the
   *   line's own indentation.
   * - `false`: they are the host's (`notApplicable`), for hosts that edit code themselves
   *   (language-aware indentation, embedded code editors).
   *
   * The fence lines are ourus's either way.
   */
  readonly handleFenceContents: boolean;

  /**
   * Backspace at a heading's text start, and Delete before a heading:
   * - `text` (the default): Backspace removes the heading's marks as a unit, the title becoming a
   *   paragraph where it is (bare Obsidian deletes one character, leaving `#Hello`); Delete joins the
   *   heading's whole line, `#`s included, as text, as a text editor does.
   * - `block` (as outliners join any block): both join just the title into the node above.
   */
  readonly headingEditing: 'text' | 'block';

  /**
   * Backspace right after a task's checkbox:
   * - `checkbox` (the default): the checkbox goes as a unit, as a heading's `#`s do, and the task is a
   *   plain item, its text staying put.
   * - `text` (as a plain text editor and bare Obsidian): one character of the checkbox goes, done by
   *   ourus, and the item's text then starts with what is left of it.
   * - `block` (as outliners join any block): the task joins the node above, its checkbox going with
   *   its marker; an empty task goes as any empty item.
   */
  readonly taskEditing: 'checkbox' | 'text' | 'block';

  /**
   * Structured paste (Ctrl-V) of plain lines, a clipboard of paragraphs only:
   * - `text` (the default, as in Logseq, Tine, SiYuan, BlockNote and every text editor): they go into
   *   the text at the caret, as plain paste puts them, a blank line a paragraph break; in a heading,
   *   which holds one line, they are nodes.
   * - `items` (as in Roam, WorkFlowy and Dynalist): each line is a node, an item in a list.
   */
  readonly pasteStructuredLines: 'text' | 'items';

  /**
   * Structured paste (Ctrl-V) of several lines in the middle of a paragraph's or an item's text:
   * - `split` (the default, as in WorkFlowy and Dynalist): the node splits where Enter would split it,
   *   and the paste goes in between: its first text joins the text before the caret, the rest
   *   follows, and the text after the caret is a node of its own when the clipboard ends with a line
   *   break, else the end of the last pasted line.
   * - `after` (as in Logseq, Tine, Roam, SiYuan and true-outliner): the node is left as it is, and the
   *   paste goes after it, as at the end of its text.
   */
  readonly pasteStructuredMidText: 'split' | 'after';

  /**
   * Structured paste (Ctrl-V) of several lines, or of one item, at the end of a paragraph's or an
   * item's text:
   * - `after` (the default, as in Logseq, Tine, Roam, SiYuan and true-outliner): the paste goes where
   *   Enter at the end of the text would put a new node.
   * - `join` (as in WorkFlowy and BlockNote, and Dynalist with Markdown as plain text): as
   *   `pasteStructuredMidText: split` with nothing after the caret: the paste's first text joins the
   *   node's text, the rest follows. The node's children follow the paste (under its last item, or
   *   after it in a paragraph's list), or with `enterMidItem: child` stay, the paste their first
   *   siblings. A heading, a quote or code joins nothing, and goes as with `after`.
   */
  readonly pasteStructuredAtEnd: 'after' | 'join';

  /**
   * Structured paste (Ctrl-V) into an item that has children, at the end of its text or in the middle
   * of it, and a list pasted at the end of a heading's title, its section holding content:
   * - `children` (the default, as in Logseq and Roam): the paste goes first among them, where Enter
   *   at the end of the text puts a new node.
   * - `after` (as in Tine, WorkFlowy, Dynalist and SiYuan): the paste goes after them, as the item's
   *   next siblings, or last in the heading's section; the text is left as it is, nothing split or
   *   joined.
   */
  readonly pasteStructuredOnParent: 'children' | 'after';

  /**
   * Structured paste of a paragraph and the list right after it, landing in a list:
   * - `siblings` (the default, as in Logseq, Tine, WorkFlowy and BlockNote): the list's items follow
   *   the paragraph's item, at its level: in a list a paragraph owns no list.
   * - `children` (as in Roam, Dynalist and true-outliner): they nest under it, as the paragraph owns
   *   its list where the clipboard was written.
   */
  readonly pasteStructuredParagraphList: 'siblings' | 'children';

  /**
   * Structured paste (Ctrl-V) of a list into a list of the other kind (numbers into bullets, bullets
   * into numbers); a list of the same kind joins the destination's either way:
   * - `text` (the default): the pasted items take the list's form; in a bullet list a pasted number
   *   is kept as text (`- 1\. x`), and on a list's empty first item a single pasted ordered list
   *   makes the list ordered. A nested list keeps its own form.
   * - `literal` (as Roam, WorkFlowy and Dynalist paste Markdown that comes as plain text): a pasted
   *   number is always text, nested lists' too: the items are bullets, or numbered in an ordered
   *   list, their text starting with it (`2. 1\. x`).
   * - `drop` (as in SiYuan, and in Logseq, Tine, Roam, WorkFlowy and Dynalist from a copy of a
   *   rendered page, whose HTML list has no number text): the pasted items take the list's form,
   *   their numbers dropped. A nested list keeps its own form.
   * - `own` (as in BlockNote and true-outliner): the paste keeps its form, a list of its own where it
   *   lands; the list it lands in keeps its own, renumbered as any list a paste touches.
   *
   * A pasted item whose text joins the node's (`pasteStructuredMidText: split`, `pasteStructuredAtEnd:
   * join`) keeps its number as text under `text` (in a bullet list) and `literal`, and loses it under
   * `drop` and `own`.
   */
  readonly pasteStructuredListForm: 'text' | 'literal' | 'drop' | 'own';

  /**
   * Delete at the end of a node's text before a blank line, and Backspace at the start of a node's
   * text after one:
   * - `join` (the default, as outliners join nodes): the node below joins the node above, the blank
   *   lines between going too.
   * - `gap` (as in Obsidian, SilverBullet and Emacs, text editors here): one blank line goes, the
   *   nodes staying as they are; a second press joins them.
   *
   * Between two paragraphs the blank lines go either way, the paragraphs becoming one (ourus's edit,
   * as the host's would make them).
   */
  readonly deleteAtGap: 'join' | 'gap';

  /**
   * An edit at the caret that ourus would refuse while the caret is in markup (before a line's text,
   * in a list marker, a heading's `#`s, a quote's `>`), where only the host puts it:
   * - `host` (the default, as every text editor does): ourus steps aside (`notApplicable`, the
   *   refusal's reason as its `detail`), and the host makes the edit, whatever the text then reads as.
   * - `refuse`: refused (`rejected`), so the node can't break.
   *
   * Structural commands are refused either way.
   */
  readonly editInMarkup: 'host' | 'refuse';

  // Not built yet: options considered, kept here for later. ourus2 (`src/commands/policy.ts`,
  // `01-redesign.md` "Feel is a policy") had most of them.
  //
  // - joinWithChildren: 'allowed' | 'refused'. Backspace joining a node that has children: they go
  //   to the node above (today), or the join is refused (Logseq). Decided (2026-10-14): allowed,
  //   also for a first child with children, which Logseq, WorkFlowy, Roam and Dynalist refuse.
  // - renumbering: 'changed' | 'never'. Ordered lists an edit touched are renumbered (today), or
  //   numbers are left as written.
  // - indentUnit: 'detect' | 'tab' | number. New nesting follows a sibling, then the document
  //   (today). CommonMark mostly decides this already (children nest at the parent's content column).
  //   Decided (2026-10-14): build it, `detect` by default with spaces as the fallback, so an
  //   Obsidian host can pass `tab` for its "Use tabs".
  // - homeAtTask: 'after' | 'before'. Whether Home stops after a task's checkbox or before it.
  // - pastedNumbering: 'continue' | 'restart'. Whether a pasted ordered run takes the list's numbers,
  //   and whether the items after a list of its own (`pasteStructuredListForm: own`) restart at 1, as
  //   BlockNote, Tine, WorkFlowy and true-outliner number them.
  // - emptyNodeLeft: 'keep' | 'remove'. Leaving an empty node the text can't hold. Decided instead
  //   (spec/placeholders.md): an empty item stays, set off by a blank line; an empty paragraph goes.
  //   It is tied into placeholders and `settlePlaceholders`, so it stays a decision, not an option.
  // - readers: host parsers (lezer in CodeMirror 6, Obsidian's Live Preview) that verification
  //   also checks a result against, so other tools read the text as ourus does. Opt-in: lezer
  //   misreads lists in a tab-indented quote. A host's objects, not a value a file can set.
}

const defaults: Config = {
  flavor: 'commonmark',
  outdent: 'direct',
  bullet: '-',
  enterOnEmptyItem: 'sibling',
  enterMidItem: 'sibling',
  enterAtTextStart: 'into',
  backspaceAtTopItem: 'unwrap',
  emptyItemWithChildren: 'lift',
  handleFenceContents: true,
  headingEditing: 'text',
  taskEditing: 'checkbox',
  pasteStructuredLines: 'text',
  pasteStructuredMidText: 'split',
  pasteStructuredAtEnd: 'after',
  pasteStructuredOnParent: 'children',
  pasteStructuredParagraphList: 'siblings',
  pasteStructuredListForm: 'text',
  deleteAtGap: 'join',
  editInMarkup: 'host',
};

/** The values each option takes, for readers of string settings (spec files, frontmatter). */
const values: { readonly [K in keyof Config]: readonly Config[K][] } = {
  flavor: ['commonmark', 'gfm', 'obsidian'],
  outdent: ['direct', 'logical'],
  bullet: ['-', '*', '+'],
  enterOnEmptyItem: ['sibling', 'outdent'],
  enterMidItem: ['sibling', 'child'],
  enterAtTextStart: ['into', 'stay'],
  backspaceAtTopItem: ['unwrap', 'refuse'],
  emptyItemWithChildren: ['lift', 'refuse'],
  handleFenceContents: [true, false],
  headingEditing: ['text', 'block'],
  taskEditing: ['checkbox', 'text', 'block'],
  pasteStructuredLines: ['text', 'items'],
  pasteStructuredMidText: ['split', 'after'],
  pasteStructuredAtEnd: ['after', 'join'],
  pasteStructuredOnParent: ['children', 'after'],
  pasteStructuredParagraphList: ['siblings', 'children'],
  pasteStructuredListForm: ['text', 'literal', 'drop', 'own'],
  deleteAtGap: ['join', 'gap'],
  editInMarkup: ['host', 'refuse'],
};

export const Config = {
  /** Every option's default: what nearly everyone gets. */
  defaults,
  /** The values each option takes. */
  values,

  /** `partial` over the defaults. */
  of(partial: Partial<Config> = {}): Config {
    return { ...defaults, ...partial };
  },

  /**
   * The options string settings (`key: value`) set, as values (`true` for a flag's `true`), or the
   * first problem with them: an unknown key, or a value the option doesn't take.
   */
  read(settings: Readonly<Record<string, string>>): Partial<Config> | string {
    const config: Record<string, unknown> = {};
    for (const [key, text] of Object.entries(settings)) {
      const allowed = (values as Record<string, readonly unknown[]>)[key];
      if (!allowed) return `unknown option "${key}"`;
      const value = allowed.find((v) => String(v) === text);
      if (value === undefined) return `option "${key}" takes ${allowed.join(', ')}, not "${text}"`;
      config[key] = value;
    }
    return config as Partial<Config>;
  },
} as const;
