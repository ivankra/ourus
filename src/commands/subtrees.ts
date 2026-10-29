// The keys that edit text, over a subtree selection (the roots it is, `OurusDoc.selectedNodes`): what
// they mean over whole nodes, rather than over the lines' characters, markers and all. One routing
// step, before the commands: Backspace, Delete and cut take the roots out as delete subtree does;
// copy writes them (`copy.ts`); typing does nothing, as in the outliners; a plain paste makes one node
// in their place; Enter puts the caret at the end of the last one's own text; a paste puts the
// clipboard's nodes in their place.

import { AtomText, ProseText, type OutlineNode } from '../doc/index.ts';
import { composeChanges } from '../text/index.ts';
import { CommandContext, type CommandOutcome } from './context.ts';
import { copyOrCutCommand } from './copy.ts';
import { deleteSubtreeCommand } from './delete-subtree.ts';
import { pasteAtCommand } from './paste.ts';
import { pastePlainCommand } from './paste-plain.ts';
import type { Command } from './types.ts';
import { goneWithTextlessParents, textEnd, textStart } from './util.ts';

/** The commands routed over a subtree selection. */
const ROUTED: ReadonlySet<Command['type']> = new Set(['deleteContentBackward', 'deleteContentForward', 'deleteSoftLineBackward', 'cut', 'copy', 'insertText', 'enter', 'shiftEnter', 'paste', 'pastePlain']);

/**
 * `command` over the subtree selection `ctx.selection` is (a command given `nodes` acts on those, not
 * on the selection); undefined where it isn't one, or the command isn't routed.
 */
export function editSubtrees(ctx: CommandContext, command: Command): CommandOutcome | undefined {
  if (!ROUTED.has(command.type) || ('nodes' in command && command.nodes)) return undefined;
  const roots = ctx.doc.selectedNodes(ctx.selection);
  if (!roots) return undefined;
  // typing over the whole document (a select all) replaces it as text, as every text editor does,
  // rather than keeping the first node's prefix (`- x`, `# x`)
  const all = Math.min(ctx.selection.anchor, ctx.selection.head) === 0 && Math.max(ctx.selection.anchor, ctx.selection.head) === ctx.doc.text.length;
  if (all && (command.type === 'insertText' || command.type === 'pastePlain')) return undefined;
  switch (command.type) {
    case 'deleteContentBackward':
    case 'deleteContentForward':
    case 'deleteSoftLineBackward':
      return deleteSubtreeCommand(ctx);
    case 'cut':
    case 'copy':
      return copyOrCutCommand(ctx, command.type);
    case 'enter':
    case 'shiftEnter': {
      // (a node with no text of its own, a quote's or an item's whose first block is on its line: its last child's)
      let last: OutlineNode = roots[roots.length - 1]!;
      while (!ctx.doc.textOf(last) && last.children.length) last = last.children[last.children.length - 1]!;
      const text = ctx.doc.textOf(last);
      if (!text) return null;
      const at = ctx.doc.posOf(last, textEnd(text), -1);
      return { status: 'applied', doc: ctx.doc, changes: [], selection: { anchor: at, head: at } };
    }
    // the key taken, nothing typed, the nodes still selected: Logseq, Logseq DB, Tine, Roam, Athens,
    // Dynalist, RemNote and WorkFlowy ignore typing over a block selection
    case 'insertText':
      return { status: 'applied', doc: ctx.doc, changes: [], selection: ctx.selection };
    case 'pastePlain':
      return inPlace(ctx, roots, (next) => pastePlainCommand(next, command.text), command.text);
    case 'paste': {
      const parentOf = (n: OutlineNode) => (n.parent!.kind === 'root' ? ('root' as const) : n.parent!.id);
      // `pasteOverSelection: ignore`: the roots kept, the clipboard's nodes right after the last
      // (where a caret at the selection's end pastes them, Tana's); else the roots out, the nodes
      // where the first was
      const first = roots[0]!;
      const last = roots[roots.length - 1]!;
      const pasted =
        ctx.config.pasteOverSelection === 'ignore'
          ? pasteAtCommand(ctx, command.clipboard, { parent: parentOf(last), after: last.id })
          : composed(ctx, deleteSubtreeCommand(ctx), (next) => pasteAtCommand(next, command.clipboard, { parent: parentOf(first), after: first.prev?.id ?? null }));
      if (pasted?.status !== 'applied') return pasted;
      // the caret at the end of what was pasted, as a paste leaves it
      const placed = pasted.placed?.at(-1);
      const end = placed === undefined ? undefined : pasted.doc.node(placed)?.lastDescendant;
      const text = end && pasted.doc.textOf(end);
      if (!end || !text) return pasted;
      const at = pasted.doc.posOf(end, textEnd(text), -1);
      return { ...pasted, selection: { anchor: at, head: at } };
    }
    default:
      return undefined;
  }
}

/**
 * The roots replaced by one node, the first, its text what `then` makes of it from its whole text
 * selected (its prefix kept: its list marker, a checkbox, a heading's `#`s); the other roots and the
 * first's children gone, as delete subtree takes them. An atom, whose text isn't typed into as words
 * (code, a table, a thematic break), is a paragraph first, empty. Null where the first has no text of
 * its own (a quote's).
 */
function inPlace(ctx: CommandContext, roots: readonly OutlineNode[], then: (ctx: CommandContext) => CommandOutcome, typed: string): CommandOutcome {
  const doc = ctx.doc;
  const first = roots[0]!;
  const text = doc.textOf(first);
  if (!text) return null;
  const draft = ctx.draft();
  const gone = goneWithTextlessParents(doc, [...roots.slice(1), ...first.children]);
  if (gone.length) draft.remove(gone);
  if (text instanceof AtomText) draft.convert(first, 'paragraph').setText(first, new ProseText('paragraph', false, '')).setCaret(first, 0, -1);
  else draft.select({ ref: first, offset: textStart(text), assoc: 1 }, { ref: first, offset: textEnd(text), assoc: -1 });
  return composed(ctx, ctx.apply(draft), then, typed);
}

/**
 * `first`, then `then` from the document and selection it leaves, as one edit; either's refusal as it
 * is. Where `then` is the host's, its default done here, on the document `first` left (the host has
 * only this one's): the selection replaced by `typed`, the caret after it; without `typed`, the host's.
 */
function composed(ctx: CommandContext, first: CommandOutcome, then: (ctx: CommandContext) => CommandOutcome, typed?: string): CommandOutcome {
  if (!first || first.status !== 'applied') return first;
  let next = then(new CommandContext(first.doc, first.selection));
  if (next?.status === 'deferredToHost' && typed !== undefined) {
    const from = Math.min(first.selection.anchor, first.selection.head);
    const to = Math.max(first.selection.anchor, first.selection.head);
    const changes = [{ from, to, insert: typed }];
    const caret = from + typed.length;
    next = { status: 'applied', doc: first.doc.update(changes, { caret }), changes, selection: { anchor: caret, head: caret } };
  }
  if (!next || next.status !== 'applied') return next?.status === 'deferredToHost' ? null : next;
  return { ...next, changes: composeChanges(ctx.doc.text, first.changes, next.changes) };
}
