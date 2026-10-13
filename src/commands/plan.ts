// Command plans: hand-written changes or an encoded outline plan, with the outline they must
// produce. The runner renumbers ordered lists, verifies a plan by re-parsing, tries its alternatives,
// and turns some encoding failures into refusals that say why.

import { OutlineState, type OutlineUpdateParams, type OutlineNode } from '../outline/index.ts';
import type { Block } from '../parser/index.ts';
import { applyChanges, composeChanges, lineSpan, mapPos, type ChangeSpec } from '../text.ts';
import { OutlinePlan, type OutlinePlanNode, type PlanTree } from '../encoder/index.ts';
import type { RejectReason, CommandResult, Selection } from './index.ts';
import { type CommandContext } from './context.ts';

/** Whether `expected` has indented code right after an item it isn't in, where it would read as the item's. */
export function indentedCodeAfterItem(plan: OutlinePlan): boolean {
  const expected = plan.root;
  // the node above in document order, with the nodes holding it
  let above: PlanTree[] = [];
  const visit = (node: PlanTree, holders: PlanTree[]): boolean => {
    const old = OutlinePlan.isPlanned(node) ? node.original : node;
    if (node.kind === 'atom' && old?.block.type === 'code_block' && !old.block.fenced && above.some((n) => n.kind === 'item' && !holders.includes(n))) return true;
    const here = [...holders, node];
    above = here;
    return node.children.some((child) => visit(child, here));
  };
  return expected.children.some((child) => visit(child, [expected]));
}

/** Verifies a plan (renumbered where it needs it), then its fallback if it doesn't read as intended. */
export function run(ctx: CommandContext, plan: CommandPlan): CommandResult {
  // renumbering is best effort: a marker that grows a digit can move its item's content column
  const numbered = plan.keepNumbers ? null : renumber(ctx, plan);
  if (numbered) {
    const result = verify(ctx, numbered);
    if (result.status === 'applied') return result;
  }
  const result = verify(ctx, plan);
  const fallback = result.status === 'rejected' ? plan.fallback?.() : null;
  return fallback ? run(ctx, fallback) : result;
}

/**
 * The plan with the ordered lists it changes renumbered (see `OutlineEncoder.renumber`), or null when
 * nothing needs renumbering.
 */
function renumber(ctx: CommandContext, plan: CommandPlan): CommandPlan | null {
  const extra = ctx.encoder.renumber(plan.changes, plan.expected, {
    ...(plan.identity ? { identity: plan.identity } : {}),
    placeholders: [...(plan.placeholders ?? []), plan.selection.head],
  });
  if (!extra) return null;
  const { doc } = ctx;
  const sel = plan.selection;
  return {
    ...plan,
    changes: composeChanges(doc.text, plan.changes, extra),
    selection: { anchor: mapPos(extra, sel.anchor, -1), head: mapPos(extra, sel.head, -1) },
    ...(plan.identity ? { identity: new Map([...plan.identity].map(([k, v]) => [mapPos(extra, k, -1), v])) } : {}),
    ...(plan.placeholders ? { placeholders: plan.placeholders.map((p) => mapPos(extra, p, 1)) } : {}),
  };
}

export interface CommandPlan {
  readonly changes: ChangeSpec[];
  /** Selection in the new text. */
  readonly selection: Selection;
  /** The outline the changes must produce. */
  readonly expected: OutlinePlan;
  /** `flat` compares nodes in document order only (heading level changes re-derive sections). */
  readonly compare: 'tree' | 'flat';
  /** Ids of moved nodes, by their head start in the new text. */
  readonly identity?: Map<number, number>;
  /** Placeholders the result needs, in the new text (see `OutlineState.placeholders`). */
  readonly placeholders?: readonly number[];
  /** Placeholders of the old document the result goes without. */
  readonly drop?: readonly number[];
  /** Another encoding to try when this one doesn't read as intended, made when it's needed. */
  readonly fallback?: () => CommandPlan | null;
  /** Leave ordered lists' numbers as written (a paste keeps the numbers it brings). */
  readonly keepNumbers?: boolean;
}

export type Outcome = CommandPlan | Extract<CommandResult, { status: 'rejected' | 'notApplicable' }>;

export const notApplicable = { status: 'notApplicable' } as const;

export const reject = (reason: RejectReason, detail?: string): Outcome =>
  detail === undefined ? { status: 'rejected', reason } : { status: 'rejected', reason, detail };

function verify(ctx: CommandContext, plan: CommandPlan): CommandResult {
  const { doc } = ctx;
  const attempt = (options: OutlineUpdateParams): OutlineState | string => {
    const next = doc.update(plan.changes, options);
    return plan.expected.differenceFrom(next, doc, plan.compare) ?? next;
  };
  const base = { ...(plan.identity ? { identity: plan.identity } : {}), placeholders: plan.placeholders ?? [] };
  // A placeholder at the caret only when the text alone can't say what was meant: an
  // empty item right after a paragraph reads as a setext underline without one.
  const caret = plan.selection.anchor === plan.selection.head ? plan.selection.head : -1;
  const newText = applyChanges(doc.text, plan.changes);
  const [lineStart, lineEnd] = lineSpan(newText, Math.max(caret, 0));
  const onCaretLine = (p: number) => caret >= 0 && p >= lineStart && p <= lineEnd;
  const drop = doc.placeholders.filter((p) => onCaretLine(mapPos(plan.changes, p, 1)));
  let next = attempt({ ...base, drop: [...drop, ...(plan.drop ?? [])] });
  if (typeof next === 'string' && caret >= 0) {
    const retry = attempt({ ...base, drop: [...(plan.drop ?? [])], placeholders: [...base.placeholders, caret] });
    if (typeof retry !== 'string') next = retry;
  }
  if (typeof next === 'string') return { status: 'rejected', reason: 'encoding-failed', detail: next };
  return { status: 'applied', state: next, changes: plan.changes, selection: plan.selection };
}

/**
 * Whether `expected` holds an empty item or paragraph other than `caretNode`. The text can't hold
 * one away from the caret, where no placeholder is: such a command isn't expressible.
 */
export function emptyAwayFromCaret(ctx: CommandContext, plan: OutlinePlan, caretNode: OutlineNode | null): boolean {
  const { doc } = ctx;
  const empty = (node: OutlineNode | OutlinePlanNode): boolean => {
    if ((node.kind !== 'item' && node.kind !== 'paragraph') || node.children.length > 0) return false;
    const old = OutlinePlan.isPlanned(node) ? node.original : node;
    if (old && old === caretNode) return false;
    const text = OutlinePlan.isPlanned(node) ? (node.text ?? (old ? doc.nodeText(old) : '')) : doc.nodeText(node);
    return OutlineState.isEmptyText(text);
  };
  const visit = (node: PlanTree): boolean => empty(node) || node.children.some(visit);
  return plan.root.children.some(visit);
}

/** A plan, and its fallbacks, with `extra` fields (numbers kept, placeholders dropped). */
export function withPlan(plan: Outcome, extra: Pick<CommandPlan, 'keepNumbers' | 'drop'>): Outcome {
  if ('status' in plan) return plan;
  const fallback = plan.fallback;
  return { ...plan, ...extra, ...(fallback ? { fallback: () => { const next = fallback(); return next && (withPlan(next, extra) as CommandPlan); } } : {}) };
}
