// Where a caret can be typed at without breaking its node: the spec's check that no applied command
// leaves the caret in markup (spec.test.ts).

import { OurusAtom, type OurusDoc } from '../src/doc/index.ts';
import { isSpaceOrTab, trimMd } from '../src/text/index.ts';

/**
 * Where a caret at `head` can be typed at without breaking its node: in its text, past markers; on a
 * fence (` ``` `, `$$`, `%%`), in the block's payload, its first line from the opening fence and its
 * last from the closing one, or after an opening fence with none (after an opening fence's run, its
 * info string, is fine). `head` where it already is.
 */
export function textPosition(doc: OurusDoc, head: number): number {
  const line = doc.lineAt(head);
  const node = head <= line.to ? doc.nodeAtLine(line.index) : null;
  if (!node) return head;
  const text = doc.textOf(node);
  const delimiters = text instanceof OurusAtom ? text.delimiters : null;
  if (text instanceof OurusAtom && delimiters) {
    const lines = text.text.split('\n');
    const starts = lines.map((_, j) => lines.slice(0, j).reduce((n, l) => n + l.length + 1, 0));
    const lineOf = (offset: number): number => text.text.slice(0, offset).split('\n').length - 1;
    const at = (offset: number): number => doc.posOf(node, offset);
    const code = text.type === 'fenced_code';
    const opening = lineOf(delimiters.open.from);
    // the line a closing delimiter ends the block on, and where on it that delimiter starts: a code
    // fence is the whole line; math and comments close after text on the line (`x$$`)
    const closing = delimiters.close ? lineOf(delimiters.close.from) : -1;
    const closeAt = (j: number): number => (code ? starts[j]! : delimiters.close!.from);
    // a line of payload with text, where typing goes in the block: from the opening delimiter the first,
    // from the closing one the last (on a blank one, typing at its start could end a container); else
    // right after the opening delimiter
    const payload = (): number[] => {
      const out: number[] = [];
      for (let j = opening + 1; j < lines.length; j++) {
        const own = j === closing ? text.text.slice(starts[j], closeAt(j)) : lines[j]!;
        if (trimMd(own) !== '') out.push(j);
      }
      return out;
    };
    const k = line.index - doc.lineAt(at(0)).index;
    if (k === opening) {
      // after a code fence's run, typing writes its info string; after `$$` or `%%`, the block's payload
      if (head >= at(delimiters.open.to)) return head;
      const payloadLines = payload();
      return payloadLines.length ? at(starts[payloadLines[0]!]!) : at(code ? starts[opening]! + lines[opening]!.length : delimiters.open.to);
    }
    if (k === closing) {
      // before a math or comment delimiter, typing is more payload
      if (!code) return Math.min(head, at(closeAt(closing)));
      const payloadLines = payload();
      const last = payloadLines[payloadLines.length - 1];
      return at(last !== undefined ? starts[last]! + lines[last]!.length : starts[opening]! + lines[opening]!.length);
    }
  }
  // a space a placeholder holds as text (`- ◌ x`) starts the text
  const start = doc.textStart(line.index);
  const s = doc.text;
  const held = doc.marks.points().find((p) => p >= line.from && p < start && isSpaceOrTab(s.charCodeAt(p)) && trimMd(s.slice(p, start)) === '');
  return head < (held ?? start) ? (held ?? start) : head;
}
