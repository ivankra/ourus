// The block-id commands (spec/block-ids.md): `addBlockId` writes one for a node, in the form
// its kind takes; `removeBlockId` deletes one. Each is a draft like any edit, its result checked: the
// block id it writes names the node it was for, the one it removes is gone, and no other block id lost
// anything. A host corrects a stray block id with them (attaching it: removed, then added on the
// node); its menu of corrections is its own. And the block ids a paste keeps: only the new ones.

import { OurusDoc, OurusProse, blockIdTargetOf, blockIdsOf, checkBlockIds, closingFrameStart, isBlockIdName, withoutBlockIds, type BlockId, type OurusNode } from '../doc/index.ts';
import type { OurusView } from '../view/index.ts';
import { MD_BLOCK_ID_NAME } from '../parser/index.ts';
import { composeChanges, mapPos, trimMd, type ChangeSpec } from '../text/index.ts';
import { OurusDraft } from '../writer/index.ts';
import { clipboardMarkdown } from './clipboard.ts';
import { type CommandContext } from './context.ts';
import type { OurusCommand, OurusResult } from './types.ts';
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
 * what Obsidian names by it (for a block inside an item, the item). Refused where a block id already
 * names it (a second would shadow one of them: a link to it would find nothing), or the note has
 * `name`.
 */
export function addBlockIdCommand(ctx: CommandContext, name: string | undefined, id: number | undefined): OurusResult | null {
  const doc = ctx.doc;
  const view = ctx.view;
  if (!doc.mdTree.flavor.has('blockIds')) return new OurusRejected('not-expressible', 'the flavor has no block ids');
  const node = id !== undefined ? (doc.node(id) ?? null) : nodeAt(view, ctx.selection.head);
  if (id !== undefined && !node) return new OurusRejected('no-such-node', `no node ${id}`);
  const target = node && blockIdTargetOf(node);
  if (!target) return new OurusRejected('block-id', 'no node at the selection a block id can name');
  const existing = blockIdNaming(doc, target);
  if (existing) return new OurusRejected('block-id', `^${existing.name} already names it`);
  // (a paragraph that is only a block id is one: another on it would make it text)
  if (doc.blockIds().some((b) => b.owner === target && b.stray)) return new OurusRejected('block-id', 'it is a block id itself');
  if (name !== undefined && !isBlockIdName(name)) return new OurusRejected('block-id', `"${name}" is no block id's name: letters, digits and dashes`);
  if (name !== undefined && doc.blockIds().some((b) => b.name === name)) return new OurusRejected('block-id', `the note already has ^${name}`);
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
  const written = result.view.doc.blockIds().find((b) => b.name === named);
  if (!written || written.shadowed || !written.target || !('id' in written.target) || written.target.id !== target.id) return new OurusRejected('write-failed', `^${named}, written, doesn't name node ${target.id}`);
  const loss = checkBlockIds(doc, result.view.doc, result.changes);
  return loss ? new OurusRejected('write-failed', `^${named}, written: ${loss}`) : result;
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
  if (text instanceof OurusProse) {
    const end = closingFrameStart(text);
    const before = text.text.slice(0, end);
    const written = target.kind === 'quote' ? `\n^${name}` : before === '' || /\s$/.test(before) ? `^${name}` : ` ^${name}`;
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
    const at = nodeAt(view, ctx.selection.head);
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
  // (the one removed taken, as a selection takes what it covers: nothing else lost)
  const loss = checkBlockIds(doc, result.view.doc, result.changes, { taken: { from: removed.from, to: removed.to } });
  return loss ? new OurusRejected('write-failed', `^${removed.name}, removed: ${loss}`) : result;
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

/**
 * `markdown`, to be pasted into `doc`, with only the block ids that are new: one the note holds outside `replaced` (what the paste takes the place of: a cut, then a paste
 * over where it was, is a move), or one the pasted text held before it, goes; the rest stay.
 */
export function pastedBlockIds(doc: OurusDoc, markdown: string, replaced: { readonly from: number; readonly to: number }): string {
  if (!doc.mdTree.flavor.has('blockIds') || !markdown.includes('^')) return markdown;
  const held = new Set(doc.blockIds().filter((b) => b.from < replaced.from || b.to > replaced.to).map((b) => b.name));
  const pasted = OurusDoc.parse(markdown, { config: doc.config });
  const dropped: BlockId[] = [];
  for (const b of pasted.blockIds()) {
    if (held.has(b.name)) dropped.push(b);
    held.add(b.name);
  }
  if (!dropped.length) return markdown;
  const draft = new OurusDraft(pasted);
  removeBlockIds(pasted, draft, dropped);
  const result = draft.done();
  // (a fragment the writer can't write without them: pasted as it is, the check refusing a name twice)
  return 'reason' in result ? markdown : result.doc.text;
}

/** The pastes whose block ids are kept only where new. */
type Pasting = Extract<OurusCommand, { type: 'paste' | 'pastePlain' }>;

/**
 * A paste keeping only the block ids it brings that are new, read where they land (`markedPaste`).
 * Where that is refused for a join of two nodes that both have a block id, one of them pasted (a
 * seam left open, `pasteSeams: open`), again with the clipboard's colliding ones dropped first,
 * read alone (`pastedBlockIds`), as they would be once pasted.
 */
export function pasteKeepingNewBlockIds<C extends Pasting>(ctx: CommandContext, given: C, run: (marked: C) => OurusResult | null | undefined): OurusResult | null | undefined {
  // (HTML's character references for what a block id is written with decoded, the same page: so a
  // block id written `&#94;x` is seen and marked as `^x` is)
  const command = (given.type === 'paste' && given.clipboard['text/html'] !== undefined ? { ...given, clipboard: { ...given.clipboard, 'text/html': withBlockIdCharacters(given.clipboard['text/html']) } } : given) as C;
  const doc = ctx.doc;
  const texts = command.type === 'paste' ? [command.clipboard['text/plain'], command.clipboard['text/markdown'], command.clipboard['text/html']] : [command.text];
  if (!doc.mdTree.flavor.has('blockIds') || !texts.some((t) => t?.includes('^'))) return run(command);
  const outcome = markedPaste(ctx, command, run);
  if (!(outcome instanceof OurusRejected) || outcome.reason !== 'block-id') return outcome;
  const from = Math.min(ctx.selection.anchor, ctx.selection.head);
  const to = Math.max(ctx.selection.anchor, ctx.selection.head);
  const without = (markdown: string): string => pastedBlockIds(doc, markdown, { from, to });
  let filtered: C | null = null;
  if (command.type === 'pastePlain') filtered = without(command.text) === command.text ? null : ({ ...command, text: without(command.text) } as C);
  else {
    const read = clipboardMarkdown(command.clipboard);
    const markdown = read && !read.phrase ? without(read.markdown) : null;
    // (as the clipboard gave it: plain text as plain text, else as the Markdown it was read as)
    const plain = command.clipboard['text/markdown'] === undefined && command.clipboard['text/html'] === undefined;
    if (markdown !== null && markdown !== read!.markdown) filtered = { ...command, clipboard: plain ? { ...command.clipboard, 'text/plain': markdown } : { 'text/markdown': markdown } } as C;
  }
  const again = filtered && markedPaste(ctx, filtered, run);
  return again && !(again instanceof OurusRejected) ? again : outcome;
}

/**
 * `html` with its character references for `^` and the characters of a name (letters, digits, `-`)
 * as those characters: none is markup in HTML, so the page is the same.
 */
function withBlockIdCharacters(html: string): string {
  return html.replace(/&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|(Hat));/g, (ref, dec?: string, hex?: string, hat?: string) => {
    const char = hat ? '^' : String.fromCodePoint(Math.min(0x10ffff, dec !== undefined ? Number(dec) : parseInt(hex!, 16)));
    return /^[\^A-Za-z0-9-]$/.test(char) ? char : ref;
  });
}

/**
 * The paste run with every `^name` in what it pastes marked, a suffix
 * after the name, so that the result says which block ids the paste wrote, whatever its changes
 * look like; run twice, with two suffixes of one length, so that a mark is told from the same
 * characters met otherwise (`before-pas` and a pasted `ted`): where the two results differ. Of the
 * block ids it wrote, one whose name the note holds outside the selection (what the paste replaces:
 * a cut, then a paste over where it was, is a move), or the paste wrote before it, goes; then the
 * marks come out. A `^x` that ends no text where it landed is text, and stays as it was. A paste the
 * writer can't write without them is as it is, the check refusing a name twice.
 */
function markedPaste<C extends Pasting>(ctx: CommandContext, command: C, run: (marked: C) => OurusResult | null | undefined): OurusResult | null | undefined {
  const doc = ctx.doc;
  const all = command.type === 'paste' ? Object.values(command.clipboard) : [command.text];
  let base = '-pasted';
  for (let n = 1; doc.text.includes(base) || all.some((t) => t?.includes(base)); n++) base = `-pasted${n}`;
  const [one, two] = [`${base}a`, `${base}b`];
  const marking = (suffix: string): C => {
    const mark = (text: string): string => text.replace(new RegExp(`\\^(${MD_BLOCK_ID_NAME})`, 'g'), `^$1${suffix}`);
    return (command.type === 'paste' ? { ...command, clipboard: Object.fromEntries(Object.entries(command.clipboard).map(([k, v]) => [k, k === 'vscode-editor-data' || v === undefined ? v : mark(v)])) } : { ...command, text: mark(command.text) }) as C;
  };
  const unmark = (text: string): string => text.replaceAll(one, '');
  const outcome = run(marking(one));
  if (outcome instanceof OurusRejected) return outcome.detail === undefined ? outcome : new OurusRejected(outcome.reason, unmark(outcome.detail));
  if (!(outcome instanceof OurusSuccess)) return outcome;
  const other = run(marking(two));
  const a = outcome.view.doc.text;
  const b = other instanceof OurusSuccess ? other.view.doc.text : '';
  if (a.length !== b.length) return new OurusRejected('write-failed', 'the paste, written with its block ids marked two ways, differs by more than the marks');
  // (the marks: where the two differ, the one suffix in one and the other in the other)
  const marks: number[] = [];
  for (let at = a.indexOf(one); at >= 0; at = a.indexOf(one, at + 1)) if (b.startsWith(two, at)) marks.push(at);
  // (the block ids it wrote, in order: one whose name is held goes)
  const from = Math.min(ctx.selection.anchor, ctx.selection.head);
  const to = Math.max(ctx.selection.anchor, ctx.selection.head);
  const held = new Set(doc.blockIds().filter((x) => x.from < from || x.to > to).map((x) => x.name));
  // (a pasted one of a name the note holds: none of what the paste declared of it stands, it goes)
  const duplicate = (name: string): boolean => name.endsWith(one) && held.has(name.slice(0, -one.length));
  const moved = outcome.movedBlockIds?.filter((m) => !duplicate(m.name)).map((m) => ({ ...m, name: unmark(m.name) }));
  const merged = outcome.mergedBlockIds?.filter((m) => !duplicate(m.from) && !duplicate(m.into)).map((m) => ({ from: unmark(m.from), into: unmark(m.into) }));
  // (one the paste merged into another came first, at the seam above: its name is the paste's then)
  for (const m of outcome.mergedBlockIds ?? []) if (m.from.endsWith(one) && !duplicate(m.from)) held.add(unmark(m.from));
  const dropped: BlockId[] = [];
  for (const x of outcome.view.doc.blockIds()) {
    if (!marks.includes(x.to - one.length)) continue;
    const name = x.name.slice(0, -one.length);
    if (held.has(name)) dropped.push(x);
    held.add(name);
  }
  // (each step the result's, the view carried through it)
  let { view: after, changes, selection } = outcome;
  let at = marks;
  if (dropped.length) {
    const draft = new OurusDraft(after.doc);
    removeBlockIds(after.doc, draft, dropped);
    const kept = draft.done();
    if (!('reason' in kept)) {
      // (the selection where it was, before what went where it was in it; the marks left where they are now)
      const map = (pos: number): number => mapPos(kept.changes, pos, -1);
      selection = { anchor: map(selection.anchor), head: map(selection.head) };
      changes = composeChanges(doc.text, changes, kept.changes);
      after = after.withDoc(kept.doc, kept.changes);
      at = marks.map((m) => mapPos(kept.changes, m, 1)).filter((m) => after.doc.text.startsWith(one, m));
    }
  }
  // the marks out
  const out: ChangeSpec[] = at.map((m) => ({ from: m, to: m + one.length, insert: '' }));
  if (out.length) {
    const map = (pos: number): number => mapPos(out, pos, -1);
    selection = { anchor: map(selection.anchor), head: map(selection.head) };
    changes = composeChanges(doc.text, changes, out);
    after = after.update({ changes: out });
  }
  const { movedBlockIds: _moved, mergedBlockIds: _merged, ...rest } = outcome;
  return new OurusSuccess({ ...rest, view: after, changes, selection, ...(moved?.length && { movedBlockIds: moved }), ...(merged?.length && { mergedBlockIds: merged }) });
}
