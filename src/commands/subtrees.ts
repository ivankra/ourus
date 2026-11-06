// The keys that edit text, over a subtree selection (the roots it is, `OurusView.selectedSubtrees`): what
// they mean over whole nodes, rather than over the lines' characters, markers and all. One routing
// step, before the commands: Backspace, Delete, cut and a drag's deletion take the roots out as delete
// subtree does; copy writes them (`copy.ts`); typing does nothing, as in the outliners; a plain paste
// makes one node in their place; Enter puts the caret at the end of the last one's own text; a paste
// puts the clipboard's nodes in their place.

import { OurusAtom, OurusProse, type OurusNode } from '../doc/index.ts';
import { composeChanges, pushAll } from '../text/index.ts';
import { CommandContext, blockIdsDeclaredBy } from './context.ts';
import { copyOrCutCommand } from './copy.ts';
import { deleteSubtreeCommand } from './delete-subtree.ts';
import { pasteAtCommand } from './paste.ts';
import { pastePlainCommand } from './paste-plain.ts';
import type { OurusCommand, OurusResult } from './types.ts';
import { goneWithTextlessParents, textEnd, textStart } from './util.ts';
import { OurusDeferred, OurusSuccess } from './types.ts';

/** The commands routed over a subtree selection. */
const ROUTED: ReadonlySet<OurusCommand['type']> = new Set(['deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'deleteByDrag', 'cut', 'copy', 'insertText', 'enter', 'shiftEnter', 'paste', 'pastePlain']);

/**
 * `command` over the subtree selection `ctx.selection` is (a command given `nodes` acts on those, not
 * on the selection); undefined where it isn't one, or the command isn't routed.
 */
export function editSubtrees(ctx: CommandContext, command: OurusCommand): OurusResult | null | undefined {
  if (!ROUTED.has(command.type) || ('nodes' in command && command.nodes)) return undefined;
  const roots = ctx.view.selectedSubtrees(ctx.selection);
  if (!roots) return undefined;
  // typing over the whole document (a select all) replaces it as text, as every text editor does,
  // rather than keeping the first node's prefix (`- x`, `# x`)
  const all = ctx.doc.wholeText(Math.min(ctx.selection.anchor, ctx.selection.head), Math.max(ctx.selection.anchor, ctx.selection.head));
  if (all && (command.type === 'insertText' || command.type === 'pastePlain')) return undefined;
  switch (command.type) {
    case 'deleteContentBackward':
    case 'deleteContentForward':
    case 'deleteSoftLineBackward':
    // (a drag's deletion, the selection deleted as a cut deletes it: `types.ts`)
    case 'deleteByDrag':
      return deleteSubtreeCommand(ctx);
    case 'cut':
    case 'copy':
      return copyOrCutCommand(ctx, command.type);
    case 'enter':
    case 'shiftEnter': {
      // (a node with no text of its own, a quote's or an item's whose first block is on its line: its last child's)
      let last: OurusNode = roots[roots.length - 1]!;
      while (!ctx.doc.textOf(last) && last.children.length) last = last.children[last.children.length - 1]!;
      const text = ctx.doc.textOf(last);
      if (!text) return null;
      const at = ctx.doc.posOf(last, textEnd(text), -1);
      return new OurusSuccess({ view: ctx.view.withSelection({ anchor: at, head: at }), changes: [] });
    }
    // the key taken, nothing typed, the nodes still selected: Logseq, Logseq DB, Tine, Roam, Athens,
    // Dynalist, RemNote and WorkFlowy ignore typing over a block selection
    case 'insertText':
      return new OurusSuccess({ view: ctx.view, changes: [] });
    case 'pastePlain':
      // (`pasteOverNodes: nothing`: as typing is, the key taken, nothing pasted, the nodes still selected)
      if (ctx.config.pasteOverNodes === 'nothing') return new OurusSuccess({ view: ctx.view, changes: [] });
      return inPlace(ctx, roots, (next) => pastePlainCommand(next, command.text), command.text);
    case 'paste': {
      if (ctx.config.pasteOverNodes === 'nothing') return new OurusSuccess({ view: ctx.view, changes: [] });
      const parentOf = (n: OurusNode) => (n.parent!.kind === 'root' ? ('root' as const) : n.parent!.id);
      // `pasteOverNodes: after`: the roots kept, the clipboard's nodes right after the last (where a
      // caret at the selection's end pastes them, Tana's); else the roots out, the nodes where the
      // first was
      const first = roots[0]!;
      const last = roots[roots.length - 1]!;
      const pasted =
        ctx.config.pasteOverNodes === 'after'
          ? pasteAtCommand(ctx, command.clipboard, { parent: parentOf(last), after: last.id })
          : composed(ctx, deleteSubtreeCommand(ctx), (next) => {
              // (where the first's textless parents went with it, a quote it was all of: in their place)
              let gone = first;
              while (gone.parent && gone.parent.kind !== 'root' && !next.doc.node(gone.parent.id)) gone = gone.parent;
              return pasteAtCommand(next, command.clipboard, { parent: parentOf(gone), after: gone.prev?.id ?? null });
            });
      if (!(pasted instanceof OurusSuccess)) return pasted;
      // the caret at the end of what was pasted, as a paste leaves it; with `quirkPasteCaret`, at the
      // first pasted node's end (`roam`) or start (`athens`), a quote's in its first block
      const quirk = ctx.config.quirkPasteCaret;
      const placed = quirk === 'default' ? pasted.placed?.at(-1) : pasted.placed?.[0];
      let end = placed === undefined ? undefined : pasted.view.doc.node(placed);
      if (quirk === 'default') end = end?.lastDescendant;
      else while (end && !pasted.view.doc.textOf(end) && end.children.length) end = end.children[0];
      const text = end && pasted.view.doc.textOf(end);
      if (!end || !text) return pasted;
      const at = pasted.view.doc.posOf(end, quirk === 'athens' ? textStart(text) : textEnd(text), -1);
      return new OurusSuccess({ ...pasted, view: pasted.view.withSelection({ anchor: at, head: at }) });
    }
    default:
      return undefined;
  }
}

/**
 * The roots replaced by one node, the first, its text what `then` makes of it from its whole text
 * selected (its prefix kept: its list marker, a checkbox, a heading's `#`s); the other roots and the
 * first's children gone, as delete subtree takes them. An atom, whose text isn't typed into as words
 * (code, a table, a thematic break), is a paragraph first, empty. A first root with no text of its own
 * (a quote without a title, an item whose first block is on its marker's line) is its first child's
 * prefix: that child is the node, the rest of the root's subtree gone.
 */
function inPlace(ctx: CommandContext, roots: readonly OurusNode[], then: (ctx: CommandContext) => OurusResult | null, typed: string): OurusResult | null {
  const doc = ctx.doc;
  const others: OurusNode[] = [...roots.slice(1)];
  let first = roots[0]!;
  while (!doc.textOf(first) && first.children.length) {
    pushAll(others, first.children.slice(1));
    first = first.children[0]!;
  }
  const text = doc.textOf(first);
  if (!text) return null;
  const draft = ctx.draft();
  const gone = goneWithTextlessParents(doc, [...others, ...first.children]);
  if (gone.length) draft.remove(gone);
  if (text instanceof OurusAtom) draft.convert(first, 'paragraph').setText(first, new OurusProse('paragraph', false, '')).setCaret(first, 0, -1);
  else draft.select({ ref: first, offset: textStart(text), assoc: 1 }, { ref: first, offset: textEnd(text), assoc: -1 });
  return composed(ctx, ctx.apply(draft), then, typed);
}

/**
 * `first`, then `then` from the document and selection it leaves, as one edit; either's refusal as it
 * is. Where `then` is the host's, its default done here, on the document `first` left (the host has
 * only this one's): the selection replaced by `typed`, the caret after it; without `typed`, the host's.
 */
function composed(ctx: CommandContext, first: OurusResult | null, then: (ctx: CommandContext) => OurusResult | null, typed?: string): OurusResult | null {
  if (!first || !(first instanceof OurusSuccess)) return first;
  let next = then(new CommandContext(first.view));
  if (next instanceof OurusDeferred && typed !== undefined) {
    const { anchor, head } = first.view.selection;
    const [from, to] = [Math.min(anchor, head), Math.max(anchor, head)];
    const changes = [{ from, to, insert: typed }];
    const caret = from + typed.length;
    next = new OurusSuccess({ view: first.view.update({ changes, caret }), changes });
  }
  if (!next || !(next instanceof OurusSuccess)) return next instanceof OurusDeferred ? null : next;
  return new OurusSuccess({ ...next, ...blockIdsDeclaredBy([first, next]), changes: composeChanges(ctx.doc.text, first.changes, next.changes) });
}
