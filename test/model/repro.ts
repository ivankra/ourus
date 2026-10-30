// Plays one drawn state and action through ourus, as the spec runner does; prints the outcome.
//   node repro.ts '<drawing with ┃, ⏎ for newlines>' action
import { OurusView } from '../../src/view/index.ts';
import { docOf, drawDoc, drawnSelection, readDrawing } from '../drawing.ts';
import { play } from '../player.ts';
import { lift } from './lift.ts';
import { draw } from './model.ts';
import { statusOf } from '../drawing.ts';
import { OurusRejected } from '../../src/commands/index.ts';

const s = readDrawing(process.argv[2]!.replace(/ ?⏎ ?/g, '\n'));
const doc = docOf(s.text, s.placeholders);
const view = OurusView.of(doc);
const r = play({ view, selection: drawnSelection(view, s), clipboard: {} }, process.argv.slice(3));
console.log(draw(lift(doc).root).join('\n'));
console.log('--', process.argv.slice(3).join(' '), '→', r.last && statusOf(r.last), r.last instanceof OurusRejected ? r.last.reason + ' ' + (r.last.detail ?? '') : '');
console.log(drawDoc(r.view, r.selection));
console.log(draw(lift(r.view.doc).root).join('\n'));
