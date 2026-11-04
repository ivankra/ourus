// Which marks hold. Placeholders: marks read as if text had been typed there, so an empty node the
// user is about to fill, or a deleted first character's place, exists in the outline; which ones hold,
// read from the parse that took them as sentinels. Auto marks: characters ourus put in; one holds while
// its character is still what ourus put there.

import type { MdTree } from '../parser/index.ts';
import { isSpaceOrTab, lineIndexAt, trimMd } from '../text/index.ts';

/** A task's checkbox of any status and the blanks after it, which an empty item's first line may hold (in every flavor, as its text reads one). */
const reCheckbox = /^\[[^\r\n]\][ \t]+$/;

const blank = (text: string): boolean => trimMd(text) === '';

/**
 * Whether a placeholder at `pos` holds in `tree`, which read it as a sentinel: at a line's end, an empty
 * node's, on a line that starts its block, whose content past its prefix is blank (or an item's
 * checkbox and blanks), never one inside a text; else a held space's, on a space or tab that starts
 * its line's content, with text after it.
 */
export function validPlaceholder(tree: MdTree, pos: number): boolean {
  const { text } = tree;
  if (pos < 0 || pos > text.length || tree.lineCount === 0) return false;
  const line = tree.line(lineIndexAt(tree.starts, pos));
  if (pos === text.length || text[pos] === '\n' || text[pos] === '\r') {
    if (pos !== line.to) return false;
    // (a line that starts its block, an empty node's: Markdown holds an empty line inside a text in none;
    // but a paragraph's last, the empty line Shift-Enter leaves at a text's end, until it settles: B23)
    // (a paragraph with text above the line, an empty one's lines all empty no text)
    const heldLast = (leaf: NonNullable<typeof line.leaf>): boolean => leaf.block.type === 'paragraph' && leaf.lastLine === line.index && !blank(text.slice(tree.line(leaf.line).contentFrom, tree.line(leaf.line).to));
    if (line.leaf && line.leaf.line !== line.index && !heldLast(line.leaf)) return false;
    const content = text.slice(line.contentFrom, line.to);
    if (blank(content)) return true;
    return reCheckbox.test(content) && line.container.block.type === 'item' && line.container.line === line.index;
  }
  if (pos >= line.to || pos < line.contentFrom || !isSpaceOrTab(text.charCodeAt(pos))) return false;
  return blank(text.slice(line.contentFrom, pos)) && !blank(text.slice(pos, line.to));
}

/**
 * Whether an auto mark at `pos` of `text` holds: on a line break, while its line is blank (typed on,
 * it is the user's); on a backslash, while the punctuation it escapes follows it; on a closer (a backtick,
 * a tilde, a bracket, `$$`, `%%`, `-->`), while it is there. (On no other character: a `MarkSet` refuses one there.)
 */
export function validAuto(text: string, pos: number): boolean {
  const char = text[pos];
  if (char === undefined) return false;
  if (char === '\n' || char === '\r') {
    // (back over the line's blanks and `>`s to its start: no further, however long the text)
    // (a CRLF's `\n`: from before its `\r`)
    let at = char === '\n' && text[pos - 1] === '\r' ? pos - 2 : pos - 1;
    while (at >= 0 && (text[at] === ' ' || text[at] === '\t' || text[at] === '>')) at--;
    return at < 0 || text[at] === '\n' || text[at] === '\r';
  }
  // (a backslash of ours escapes the punctuation after it; before anything else, a space typed after
  // it, it escapes nothing, and is the user's text: B295)
  if (char === '\\') return pos + 1 < text.length && /[!-\/:-@[-`{-~]/.test(text[pos + 1]!);
  return '`~)]}$%->'.includes(char);
}
