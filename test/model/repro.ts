// Plays one drawn state and action through ourus, as the spec runner does; prints the outcome.
//   node repro.ts '<drawing with ┃, ⏎ for newlines>' action
import { OutlineState } from '../../src/outline/index.ts';
import { drawState, readDrawing } from '../drawing.ts';
import { play } from '../player.ts';
import { lift } from './lift.ts';
import { draw } from './model.ts';

const s = readDrawing(process.argv[2]!.replace(/ ?⏎ ?/g, '\n'));
const doc = OutlineState.parse(s.text, { placeholders: s.placeholders });
const r = play({ doc, selection: s.selection, clipboard: '' }, process.argv.slice(3));
console.log(draw(lift(doc).root).join('\n'));
console.log('--', process.argv.slice(3).join(' '), '→', r.last?.status, r.last && 'reason' in r.last ? r.last.reason + ' ' + (r.last.detail ?? '') : '');
console.log(drawState(r.doc.text, r.selection, r.doc.placeholders));
console.log(draw(lift(r.doc).root).join('\n'));
