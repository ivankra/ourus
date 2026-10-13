// Tree walks, iterative: nesting can be as deep as the text is long.

import type { Block, Inline } from './types.ts';

/** Blocks in document order, iteratively. */
export function* preorder(root: Block): Generator<Block> {
  const stack: Block[] = [root];
  while (stack.length) {
    const b = stack.pop()!;
    yield b;
    for (let i = b.children.length - 1; i >= 0; i--) stack.push(b.children[i]!);
  }
}

/** Blocks, each after everything in it, iteratively. */
export function* postorder(root: Block): Generator<Block> {
  const stack: { block: Block; next: number }[] = [{ block: root, next: 0 }];
  while (stack.length) {
    const top = stack[stack.length - 1]!;
    if (top.next < top.block.children.length) stack.push({ block: top.block.children[top.next++]!, next: 0 });
    else {
      stack.pop();
      yield top.block;
    }
  }
}

/** Inlines in document order, iteratively. */
export function* inlinePreorder(nodes: readonly Inline[]): Generator<Inline> {
  const stack: Inline[] = [...nodes].reverse();
  while (stack.length) {
    const n = stack.pop()!;
    yield n;
    if (n.children) for (let i = n.children.length - 1; i >= 0; i--) stack.push(n.children[i]!);
  }
}
