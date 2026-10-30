// A snapshot's block ids, one line each, for the reading tests: name, owner (kind@line), target, and
// `shadowed` and `stray` where they apply.

import type { OurusDoc } from '../../src/doc/index.ts';

export function readBlockIdsRow(doc: OurusDoc): string[] {
  return doc.blockIds().map((b) => {
    const t = b.target ? ('list' in b.target ? `list@${b.target.list.startLine}` : `${b.target.kind}@${b.target.startLine}`) : '-';
    const stray = b.stray ? ` stray:${b.stray}` : '';
    return `^${b.name} ${b.owner.kind}@${b.owner.startLine} → ${t}${b.shadowed ? ' shadowed' : ''}${stray}`;
  });
}
