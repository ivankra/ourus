// Config: behaviour users disagree on, as options with documented defaults. An `OutlineDoc` holds its
// config and every snapshot after it carries it. Spec files set options by the same keys
// (`outdent: logical` in frontmatter, or in one test's `config` block).
//
// Grammar correctness is never configurable, and neither are invariants other parts depend on:
// what "empty" means, which node keeps its id. An option is not a way to postpone a decision: its
// default is what nearly everyone gets. Add one when a spec case needs it.

import { commonmark, type Flavor } from './parsing/flavor.ts';
import { gfm } from './parsing/gfm.ts';
import { obsidian } from './parsing/obsidian.ts';

export interface Config {
  /**
   * The Markdown dialect the document is read as: CommonMark 0.31.2 (the default), GitHub Flavored
   * Markdown, or Obsidian's (GFM plus callouts, wikilinks, frontmatter, ...). See src/parsing/.
   */
  readonly flavor: 'commonmark' | 'gfm' | 'obsidian';
  /**
   * Shift-Tab's later siblings. `direct` (the default, as in Logseq): they become the item's
   * children, after its own, so the document order stays the same. `logical`: they stay with their
   * parent, and the item and its subtree move past them. Enter on an empty nested item outdents
   * by it too (see `enterOnEmptyItem`).
   */
  readonly outdent: 'direct' | 'logical';
  /** The bullet of a new item with no list to take one from: a converted paragraph, a pasted line. */
  readonly bullet: '-' | '*' | '+';
  /**
   * Enter on an empty nested item that isn't its parent's last child. `sibling` (the default, as in
   * Workflowy, Logseq and Dynalist): a new empty item. `outdent` (as in Roam): it outdents, as the
   * `outdent` option says. A last child outdents either way.
   */
  readonly enterOnEmptyItem: 'sibling' | 'outdent';
  /**
   * Enter and Shift-Enter on the code lines of a fenced block. `true` (the default): ourus makes the
   * new line, in the containers the block is in, with the line's own indentation. `false`: they are
   * the host's (`notApplicable`), for hosts that edit code themselves (language-aware indentation,
   * embedded code editors). The fence lines are ourus's either way.
   */
  readonly handleFenceContents: boolean;
  /**
   * Backspace at a heading's text start, and Delete before a heading. `text` (the default, as in
   * Obsidian and a plain text editor): Backspace removes the heading's marks, the title becoming a
   * paragraph where it is; Delete joins the heading's whole line, `#`s included, as text. `block` (as
   * outliners join any block): both join just the title into the node above.
   */
  readonly headingEditing: 'text' | 'block';
  /**
   * Backspace right after a task's checkbox. `text` (the default, as a plain text editor): one
   * character goes, the host's Backspace. `checkbox`: the checkbox goes, and the task is a plain
   * item, its text staying put. `block` (as outliners join any block): the task joins the node above,
   * its checkbox going with its marker; an empty task goes as any empty item.
   */
  readonly taskEditing: 'text' | 'checkbox' | 'block';
  /**
   * Structured paste (Ctrl-V) of several lines in the middle of an item's text. `after` (the default,
   * as in Logseq and Roam): the item is left as it is, and the pasted nodes go after it, as at the end
   * of its text. `split` (as in Workflowy and Dynalist): the item splits at the caret, as a text editor
   * would with lines as items: the first line joins the text before the caret, each further line is
   * an item, and the text after the caret is an item of its own when the clipboard ends with a line
   * break, else the end of the last line.
   */
  readonly pasteMidText: 'after' | 'split';
  /**
   * Delete at the end of a node's text before a blank line, and Backspace at the start of a node's text
   * after one. `join` (the default, as outliners join nodes): the node below joins the node above,
   * the blank lines between going too. `gap` (as in Obsidian, a text editor here): one blank line goes,
   * the nodes staying as they are; a second press joins them. Where deleting the blank line would
   * merge two nodes anyway (two paragraphs), the press is the host's either way.
   */
  readonly deleteAtGap: 'join' | 'gap';

  // Not built yet: options considered, kept here for later. ourus2 (`src/commands/policy.ts`,
  // `01-redesign.md` "Feel is a policy") had most of them.
  //
  // - enterAtItemStart: 'into' | 'above'. Enter at an item's text start puts an empty item above,
  //   the caret going into it (today, as in Workflowy, Logseq, Roam and Dynalist), or leaves the
  //   caret with the text (obsidian-true-outliner, on a childless item).
  // - joinWithChildren: 'allowed' | 'refused'. Backspace joining a node that has children: they go
  //   to the node above (today), or the join is refused (Logseq).
  // - renumbering: 'changed' | 'never'. Ordered lists an edit touched are renumbered (today), or
  //   numbers are left as written.
  // - indentUnit: 'detect' | 'tab' | number. New nesting follows a sibling, then the document
  //   (today). CommonMark mostly decides this already (children nest at the parent's content column).
  // - homeAtTask: 'after' | 'before'. Whether Home stops after a task's checkbox or before it.
  // - pastedNumbering: 'continue' | 'restart'. Whether a pasted ordered run takes the list's numbers.
  // - emptyNodeLeft: 'keep' | 'remove'. Leaving an empty node the text can't hold. Decided instead
  //   (spec/placeholders.md): an empty item stays, set off by a blank line; an empty paragraph goes.
  //   It is tied into placeholders and `settle`, so it stays a decision, not an option.
  // - readers: host parsers (lezer in CodeMirror 6, Obsidian's Live Preview) that verification
  //   also checks a result against, so other tools read the text as ourus does. Opt-in: lezer
  //   misreads lists in a tab-indented quote. A host's objects, not a value a file can set.
}

export const defaultConfig: Config = { flavor: 'commonmark', outdent: 'direct', bullet: '-', enterOnEmptyItem: 'sibling', handleFenceContents: true, headingEditing: 'text', taskEditing: 'text', pasteMidText: 'after', deleteAtGap: 'join' };

/** The values each option takes, for readers of string settings (spec files, frontmatter). */
export const configValues: { readonly [K in keyof Config]: readonly Config[K][] } = {
  flavor: ['commonmark', 'gfm', 'obsidian'],
  outdent: ['direct', 'logical'],
  bullet: ['-', '*', '+'],
  enterOnEmptyItem: ['sibling', 'outdent'],
  handleFenceContents: [true, false],
  headingEditing: ['text', 'block'],
  taskEditing: ['text', 'checkbox', 'block'],
  pasteMidText: ['after', 'split'],
  deleteAtGap: ['join', 'gap'],
};

/** `partial` over the defaults. */
export function configOf(partial: Partial<Config> = {}): Config {
  return { ...defaultConfig, ...partial };
}

/**
 * The options string settings (`key: value`) set, as values (`true` for a flag's `true`), or the first
 * problem with them: an unknown key, or a value the option doesn't take.
 */
export function readSettings(settings: Readonly<Record<string, string>>): Partial<Config> | string {
  const config: Record<string, unknown> = {};
  for (const [key, text] of Object.entries(settings)) {
    const values = (configValues as Record<string, readonly unknown[]>)[key];
    if (!values) return `unknown option "${key}"`;
    const value = values.find((v) => String(v) === text);
    if (value === undefined) return `option "${key}" takes ${values.join(', ')}, not "${text}"`;
    config[key] = value;
  }
  return config as Partial<Config>;
}

/** A config from string settings over the defaults, or the first problem with them (see `readSettings`). */
export function readConfig(settings: Readonly<Record<string, string>>): Config | string {
  const set = readSettings(settings);
  return typeof set === 'string' ? set : configOf(set);
}

/** The parser's flavor that `Config.flavor` names. */
export function flavorOf(name: Config['flavor']): Flavor {
  return name === 'gfm' ? gfm : name === 'obsidian' ? obsidian : commonmark;
}
