// Inline walks, iterative: nesting can be as deep as the text is long (a block's are `MdBlockAt`'s).

import type { MdInline } from './types.ts';

/** Inlines in document order, iteratively. */
export function* inlinePreorder(nodes: readonly MdInline[]): Generator<MdInline> {
  const stack: MdInline[] = [...nodes].reverse();
  while (stack.length) {
    const n = stack.pop()!;
    yield n;
    if (n.children) for (let i = n.children.length - 1; i >= 0; i--) stack.push(n.children[i]!);
  }
}
