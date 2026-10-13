# Obsidian, Live Preview

[`driver.ts`](driver.ts) drives Obsidian (1.14.4) as it comes, with no plugins, in Live Preview, its
default editing mode, which draws the markup: list markers as bullets, a task's checkbox as a widget, the
frontmatter as properties. [`../obsidian/`](../obsidian/) is the same in Source mode, where the
editor shows the text as it is; the plugin setups ([`../obsidian-outliner/`](../obsidian-outliner/),
[`../obsidian-true-outliner/`](../obsidian-true-outliner/)) run in Live Preview, so this is their
baseline. The driver is bare Obsidian's ([`../obsidian/obsidian.ts`](../obsidian/obsidian.ts)): how
it runs, the indentation as tabs and the keys are in [`../obsidian/README.md`](../obsidian/README.md).
Last results: [`sxs.md`](sxs.md).

## Stack

Obsidian's ([`../obsidian/stack.md`](../obsidian/stack.md)): Live Preview is decorations over the
editor's text and its syntax tree (the `hypermd` mode's, the same as Source mode's), and what its
widgets show (a callout, a table, math) is drawn by reading view's pipeline, from their text.

## What Live Preview changes

What a key does to the text is the same as in Source mode; where the caret goes by the layout is
not. Measured outcome for outcome against [`../obsidian/sxs.md`](../obsidian/sxs.md), and by
cases written to find where the two editing modes part:

- **Starts it won't hold**, skipped (`holds`): a caret in the frontmatter (shown as properties) ends
  up outside it, and one between a task's marker and its checkbox's end goes to the line's start
  (`inCheckbox`). Source mode keeps both.
- **Up and Down land by what is drawn**: hidden markers and a heading's larger font move the column.
  Up from `abcdef┃ghijk` into `abc**def**ghi` lands at `abc**de┃f**ghi` (Source mode: `abc**d┃ef**ghi`,
  the text's column); Up into `## Title` lands at `## Ti┃tle` (`cursor.md › CursorUp2`; Source mode:
  `#┃# Title`); Down into a nested item lands after its indentation (`cursor.md › CursorDown3`).
- **The document's start is after the frontmatter**: Ctrl+Home from `text┃` below `---` / `a: b` /
  `---` lands at `┃text`, past the properties; Source mode before the frontmatter.
- **The same in both**: Left and Backspace from `- [ ] ┃task` (`- [ ]┃ task`, `- [ ]┃task`), Right
  from `a┃[b](c) d` (`a[┃b](c) d`), and Down from a line into a table below it.
