// Placeholders: marks read as if text had been typed there, so an empty node the user is about to
// fill, or a deleted first character's place, exists in the outline. Which ones hold, read from the
// parse that took them as sentinels.

import type { MdTree } from '../parser/index.ts';
import { isEmptyNodePlaceholder, isPlaceholder, isSpaceOrTab, lineIndexAt, trimMd, type Mark } from '../text/index.ts';

/** A task's checkbox and the blanks after it, which an empty item's first line may hold (in every flavor). */
const reCheckbox = /^\[[ xX]\][ \t]+$/;

const blank = (text: string): boolean => trimMd(text) === '';

/**
 * Whether `mark` holds in `tree`, which read it as a sentinel: at a line's end, an empty node's, on
 * a line that starts its block, whose content past its prefix is blank (or an item's checkbox and
 * blanks), never one inside a text; else a held space's, on a space or tab that starts its line's
 * content, with text after it. Any other kind isn't a placeholder.
 */
export function validPlaceholder(tree: MdTree, mark: Mark): boolean {
  const { text } = tree;
  const p = mark.from;
  if (!isPlaceholder(mark) || p < 0 || p > text.length || tree.lineCount === 0) return false;
  const line = tree.line(lineIndexAt(tree.starts, p));
  if (isEmptyNodePlaceholder(mark, text)) {
    if (p !== line.to) return false;
    // (a line that starts its block, an empty node's: Markdown holds an empty line inside a text in none)
    if (line.leaf && line.leaf.line !== line.index) return false;
    const content = text.slice(line.contentFrom, line.to);
    if (blank(content)) return true;
    return reCheckbox.test(content) && line.container.block.type === 'item' && line.container.line === line.index;
  }
  if (p >= line.to || p < line.contentFrom || !isSpaceOrTab(text.charCodeAt(p))) return false;
  return blank(text.slice(line.contentFrom, p)) && !blank(text.slice(p, line.to));
}
