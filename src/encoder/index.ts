// The encoder: an outline plan written as changes to the current text. The inverse of the parser.
//
//   const plan = OutlinePlan.from(state).remove(nodes).append(parent, 'last', nodes);
//   const encoded = new OutlineEncoder(state).encode(plan);   // EncodeResult, or why it can't be written
//   plan.differenceFrom(next, state, 'tree')                   // does the re-parsed outline read as the plan?

export { OutlineEncoder, type EncodeOptions, type EncodeResult } from './encoder.ts';
export { OutlinePlan, type OutlinePlanNode, type PlanTarget, type PlanTree } from './outline-plan.ts';
