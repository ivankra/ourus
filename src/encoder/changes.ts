// From written lines to text changes: the lines that keep their order stay, edited in place.

import type { OutlineState } from '../outline/index.ts';
import type { ChangeSpec } from '../text.ts';

/** One line of the new text: an old line (`origin`) rewritten by `local` changes, or new text. */
export interface OutputLine {
  readonly origin: number | null;
  readonly text: string;
  ending: string;
  /** Changes to the old line, relative to its start. */
  readonly local: readonly ChangeSpec[];
  /** How much keeping the line in place is worth: less for a node arriving from elsewhere, which moves. */
  readonly weight: number;
}

/**
 * The changes from the old text to the written lines. Lines that keep their order (the heaviest
 * increasing run of their old indexes) stay, edited in place; the others are deleted where they
 * were and written where they now are.
 */
export function changesOf(doc: OutlineState, out: readonly OutputLine[]): ChangeSpec[] {
  const lines = doc.lines;
  const kept = heaviestIncreasing(out, lines.length);
  const changes: ChangeSpec[] = [];
  let cursor = 0;
  let pending = '';
  const lineStart = (lineNo: number): number => (lineNo < lines.length ? lines[lineNo]!.from : doc.text.length);
  out.forEach((output, i) => {
    if (!kept.has(i)) {
      pending += output.text + output.ending;
      return;
    }
    const lineNo = output.origin!;
    const line = lines[lineNo]!;
    if (lineStart(cursor) !== line.from || pending) changes.push({ from: lineStart(cursor), to: line.from, insert: pending });
    pending = '';
    for (const change of output.local) changes.push({ from: line.from + change.from, to: line.from + change.to, insert: change.insert });
    if (output.ending !== line.ending) changes.push({ from: line.to, to: line.to + line.ending.length, insert: output.ending });
    cursor = lineNo + 1;
  });
  if (lineStart(cursor) !== doc.text.length || pending) changes.push({ from: lineStart(cursor), to: doc.text.length, insert: pending });
  return changes;
}

/** Indexes of the lines whose old indexes increase, with the most weight in all (a Fenwick tree of best runs). */
function heaviestIncreasing(out: readonly OutputLine[], size: number): Set<number> {
  // tree[index]: the best run ending at an old index of at most index, as [weight, line]
  const tree: [number, number][] = Array.from({ length: size + 1 }, () => [0, -1]);
  const best = (index: number): [number, number] => {
    let found: [number, number] = [0, -1];
    for (let i = index; i > 0; i -= i & -i) if (tree[i]![0] > found[0]) found = tree[i]!;
    return found;
  };
  const before: number[] = new Array(out.length).fill(-1);
  let top: [number, number] = [0, -1];
  out.forEach((output, i) => {
    if (output.origin === null) return;
    const [weight, prev] = best(output.origin);
    const run: [number, number] = [weight + output.weight, i];
    before[i] = prev;
    for (let j = output.origin + 1; j <= size; j += j & -j) if (run[0] > tree[j]![0]) tree[j] = run;
    if (run[0] > top[0]) top = run;
  });
  const kept = new Set<number>();
  for (let i = top[1]; i >= 0; i = before[i]!) kept.add(i);
  return kept;
}
