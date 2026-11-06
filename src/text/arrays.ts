// Arrays of any length: what a spread into a call's arguments does, without JavaScript's limit on
// them (some 100,000), which a note's lists, lines and marks pass.

/**
 * `list` with `items` in place of `remove` of its elements at `at`, as `splice` puts them, but any
 * number of them: spread into one call, a list of some 100,000 passes JavaScript's limit on arguments.
 */
export function spliceIn<T>(list: T[], at: number, remove: number, items: readonly T[]): void {
  if (items.length <= 8192) {
    // (bounded: a spread of at most 8,192)
    list.splice(at, remove, ...items);
    return;
  }
  const tail = list.splice(at);
  for (const item of items) list.push(item);
  for (let k = remove; k < tail.length; k++) list.push(tail[k]!);
}

/** `items` pushed onto `list`, any number of them (`push(...items)` has a limit). */
export function pushAll<T>(list: T[], items: Iterable<T>): void {
  for (const item of items) list.push(item);
}

/** The largest of `values`, or `none` where there are none (`Math.max(...values)` has a limit). */
export function largest(values: Iterable<number>, none = -Infinity): number {
  let max = none;
  for (const v of values) if (v > max) max = v;
  return max;
}
