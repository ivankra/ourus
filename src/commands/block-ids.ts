// The block-id commands (spec/block-ids.md): `addBlockId` writes one for a node, in the form
// its kind takes; `removeBlockId` deletes one. Each is a draft like any edit, its result checked: the
// block id it writes names the node it was for, the one it removes is gone, and no other block id lost
// anything. A host corrects a stray block id with them (attaching it: removed, then added on the
// node); its menu of corrections is its own. And the block ids a paste keeps: only the new ones.

import { OurusProse, blockIdTargetOf, blockIdsOf, closingFrameStart, isBlockIdName, withoutBlockIds, type BlockId, type OurusDoc, type OurusNode } from '../doc/index.ts';
import type { OurusView } from '../view/index.ts';
import { trimMd } from '../text/index.ts';
import { OurusDraft } from '../writer/index.ts';
import { type CommandContext } from './context.ts';
import type { OurusResult } from './types.ts';
import { OurusRejected, OurusSuccess } from './types.ts';

/** The node at `pos`: its text's, its block-id line's, a gap's owner. */
function nodeAt(view: OurusView, pos: number): OurusNode | null {
  const at = view.locate(pos);
  if (at.zone === 'gap') return at.owner;
  return 'node' in at ? at.node : null;
}

/** The block id a link to `node` uses: the one not shadowed whose target is what a block id on `node` names. */
function blockIdNaming(doc: OurusDoc, node: OurusNode): BlockId | null {
  const target = blockIdTargetOf(node);
  return (target && doc.blockIds().find((b) => !b.shadowed && b.target && 'id' in b.target && b.target.id === target.id)) ?? null;
}

/** A name for a new block id: six random letters and digits, as Obsidian makes them, none the note has. */
function madeUpName(doc: OurusDoc): string {
  const taken = new Set(doc.blockIds().map((b) => b.name));
  for (;;) {
    let name = '';
    for (let k = 0; k < 6; k++) name += 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)];
    if (!taken.has(name)) return name;
  }
}

/**
 * `addBlockId`: a block id for node `id`, or the selection's, named `name` or made up, written on
 * what Obsidian names by it (for a block inside an item, the item). Where a block id names it already,
 * a second is written too, the first kept: which counts, or whether a block has two, is the host's to
 * decide, as whether a name is unique (a made-up one is new).
 */
export function addBlockIdCommand(ctx: CommandContext, name: string | undefined, id: number | undefined): OurusResult | null {
  const doc = ctx.doc;
  const view = ctx.view;
  if (!doc.mdTree.flavor.has('blockIds')) return new OurusRejected('not-expressible', 'the flavor has no block ids');
  const node = id !== undefined ? (doc.node(id) ?? null) : nodeAt(view, ctx.selection.head);
  if (id !== undefined && !node) return new OurusRejected('no-such-node', `no node ${id}`);
  const target = node && blockIdTargetOf(node);
  if (!target) return new OurusRejected('block-id', 'no node at the selection a block id can name');
  // (a paragraph that is only a block id is one: another on it would make it text)
  if (doc.blockIds().some((b) => b.owner === target && b.stray)) return new OurusRejected('block-id', 'it is a block id itself');
  if (name !== undefined && !isBlockIdName(name)) return new OurusRejected('block-id', `"${name}" is no block id's name: letters, digits and dashes`);
  const named = name ?? madeUpName(doc);
  const draft = ctx.draft();
  const on = writeBlockId(doc, draft, target, named);
  if (!on) return new OurusRejected('not-expressible', `the ${target.kind} has no text a block id can end`);
  // (with `node`, after it; else where the caret was, in the text it ended)
  keepCaret(ctx, draft, on, id !== undefined ? 'after' : 'kept');
  const result = ctx.apply(draft);
  // (a block with no form a block id is written in here, a footnote's: not written)
  if (result instanceof OurusRejected && result.reason === 'write-failed') return new OurusRejected('not-expressible', `a block id can't be written on the ${target.kind} here`);
  if (!(result instanceof OurusSuccess)) return result;
  const written = result.view.doc.blockIds().find((b) => b.name === named && !!b.target && 'id' in b.target && b.target.id === target.id);
  return written ? result : new OurusRejected('write-failed', `^${named}, written, doesn't name node ${target.id}`);
}

/**
 * Block id `named` written for `target` in `draft`, in the form its kind takes, Obsidian's: ` ^id`
 * ending a text; a line after an atom (a blank line between, which a table or HTML would take in
 * otherwise), or lazily under a quote atom's last line; for a quote of several blocks, which carries
 * none, a line under its last paragraph, its text's then. The node whose text it went on; null where
 * there is none.
 */
function writeBlockId(doc: OurusDoc, draft: OurusDraft, target: OurusNode, name: string): OurusNode | null {
  const on = target.kind === 'quote' ? target.lastDescendant : target;
  const text = doc.textOf(on);
  if (!text || (target.kind === 'quote' && (on.kind !== 'paragraph' || !(text instanceof OurusProse)))) return null;
  // (a paragraph with no text: the block id alone would be no paragraph, a stray id; an item's is the item's)
  if (on.kind === 'paragraph' && text instanceof OurusProse && trimMd(text.body) === '') return null;
  // (a text a block id ends already: the new one on a line of its own after it, both kept; at its end
  // the first would be text, `a ^x ^y`)
  if (text instanceof OurusProse && target.kind !== 'quote' && blockIdsOf(text).some((b) => !b.carried)) {
    draft.setText(on, text.withBlockIdLines([...text.blockIdLines, { blankLines: 1, line: `^${name}` }]));
    return on;
  }
  if (text instanceof OurusProse) {
    const end = closingFrameStart(text);
    const before = text.text.slice(0, end);
    const written = target.kind === 'quote' ? `\n^${name}` : before === '' || /[ \t]$/.test(before) ? `^${name}` : ` ^${name}`;
    draft.setText(on, text.splice(end, end, written));
  } else if (text.type === 'blockquote') draft.setText(on, text.splice(text.text.length, text.text.length, `\n^${name}`));
  else draft.setText(on, text.withBlockIdLines([...text.blockIdLines, { blankLines: 1, line: `^${name}` }]));
  return on;
}

/**
 * The caret after an edit of `node`'s block ids: `after` the block id written (the text's end);
 * `kept` where it was, in `node`'s text (clamped to it), or elsewhere as it was.
 */
function keepCaret(ctx: CommandContext, draft: OurusDraft, node: OurusNode, where: 'after' | 'kept', removed?: { readonly from: number; readonly to: number }): void {
  const text = draft.touched(node.id).text!;
  const end = text.text.length;
  const at = ctx.view.locate(ctx.selection.head);
  // (past what was removed from the string, moved back by it; in it, where it was)
  const mapped = (offset: number): number => (!removed || offset <= removed.from ? offset : offset >= removed.to ? offset - (removed.to - removed.from) : removed.from);
  if (where === 'after') draft.setCaret(node, end, -1);
  else if ((at.zone === 'text' || at.zone === 'frame') && at.node === node) draft.setCaret(node, Math.min(mapped(at.offset), end), -1);
  else if (at.zone === 'blockIdLine' && at.node === node) draft.setCaret(node, text instanceof OurusProse ? closingFrameStart(text) : end, -1);
  // (in a marker or a prefix on the node's first line, its own or a container's on it: at its text's
  // start, the line written again, where it was a place no longer)
  else if ((at.zone === 'marker' || at.zone === 'prefix') && 'node' in at && (at.node === node || at.node.startLine === node.startLine)) draft.setCaret(node, text instanceof OurusProse ? text.textStart(0) : 0, 1);
  else draft.setCaretAt(ctx.selection.head);
}

/**
 * `removeBlockId`: block id `name` deleted, attached or stray, shadowed or not (where the note has it
 * twice, the one node `node` owns); without `name`, the one a link to the selection's node uses (for
 * a block inside an item, the item's). Only the block id goes: ` ^id` off its text, its line with the
 * blank lines it would leave doubled, a stray one's paragraph.
 */
export function removeBlockIdCommand(ctx: CommandContext, name: string | undefined, node: number | undefined): OurusResult | null {
  const doc = ctx.doc;
  const view = ctx.view;
  let b: BlockId | null;
  if (name !== undefined) {
    const named = doc.blockIds().filter((x) => x.name === name && (node === undefined || x.owner.id === node));
    if (named.length > 1) return new OurusRejected('block-id', `the note has ^${name} ${named.length} times: say which by its node`);
    b = named[0] ?? null;
  } else {
    const at = node !== undefined ? (doc.node(node) ?? null) : nodeAt(view, ctx.selection.head);
    if (node !== undefined && !at) return new OurusRejected('no-such-node', `no node ${node}`);
    b = at ? blockIdNaming(doc, at) : null;
  }
  if (!b) return new OurusRejected('block-id', name !== undefined ? `no block id ^${name}${node !== undefined ? ` on node ${node}` : ''}` : 'no block id names the node at the selection');
  const removed = b;
  const draft = ctx.draft();
  const owner = removeBlockIds(doc, draft, [removed]);
  // (the part of its owner's string it took, where it was in it)
  const part = owner && !removed.carried ? blockIdsOf(doc.textOf(owner)!).find((b) => !b.carried && doc.posOf(owner, b.from) === removed.from) : undefined;
  if (owner) keepCaret(ctx, draft, owner, 'kept', part && !part.carried ? { from: part.partFrom, to: part.partTo } : undefined);
  else draft.setCaretAt(ctx.selection.head);
  const result = ctx.apply(draft);
  if (!(result instanceof OurusSuccess)) return result;
  // (its text holding the name again before it, which then ends it: refused, not half done)
  if (result.view.doc.blockIds().some((x) => x.name === removed.name && x.owner.id === removed.owner.id)) return new OurusRejected('block-id', `the text has ^${removed.name} again, which would end it then`);
  return result;
}

/**
 * Block ids `ids` of `doc` taken out in `draft`: each off its owner's text, a stray paragraph that is
 * only one gone (its children, a list it owns, taking its place). The node of the last whose text
 * changed, or null.
 */
function removeBlockIds(doc: OurusDoc, draft: OurusDraft, ids: readonly BlockId[]): OurusNode | null {
  // (each by where it is among its owner's, in order as its text has them: one of a name written
  // twice goes, the other stays)
  const byOwner = new Map<OurusNode, Set<number>>();
  for (const b of ids) {
    const k = doc.blockIds().filter((x) => x.owner === b.owner).indexOf(b);
    (byOwner.get(b.owner) ?? byOwner.set(b.owner, new Set()).get(b.owner)!).add(k);
  }
  let last: OurusNode | null = null;
  for (const [owner, which] of byOwner) {
    const text = doc.textOf(owner)!;
    const left = withoutBlockIds(text, which);
    // (a paragraph that was only the block id: no node left)
    if (owner.kind === 'paragraph' && left instanceof OurusProse && trimMd(left.text) === '' && !left.blockIdLines.length) {
      if (owner.children.length) draft.dissolve(owner);
      else draft.remove([owner]);
      continue;
    }
    draft.setText(owner, left);
    last = owner;
  }
  return last;
}
