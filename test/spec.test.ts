// Runs the literate behaviour spec in spec/*.md.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { execute, type Command, type Selection } from '../src/commands.ts';
import { Doc } from '../src/doc.ts';
import { applyChanges } from '../src/text.ts';
import { drawState, readDrawing } from './drawing.ts';
import { play, tokenize } from './keys.ts';

const FENCE = '````````````````````````````````';
const specDir = new URL('../spec/', import.meta.url);

interface Example {
  file: string;
  line: number;
  heading: string;
  /** `example pending`: agreed behaviour not implemented yet; reported, not failed. */
  pending: boolean;
  before: string;
  command: string;
  after: string;
}

function examples(file: string): Example[] {
  const lines = readFileSync(new URL(file, specDir), 'utf8').split('\n');
  const out: Example[] = [];
  let heading = '';
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!;
    if (l.startsWith('#')) heading = l.replace(/^#+\s*/, '');
    if (l !== `${FENCE} example` && l !== `${FENCE} example pending`) continue;
    const pending = l.endsWith('pending');
    const start = i + 1;
    const body: string[] = [];
    for (i++; i < lines.length && lines[i] !== FENCE; i++) body.push(lines[i]!);
    const parts: string[][] = [[]];
    for (const b of body) {
      if (b === '.') parts.push([]);
      else parts[parts.length - 1]!.push(b);
    }
    assert.equal(parts.length, 3, `${file}:${start}: example needs before . command . after`);
    out.push({
      file,
      line: start,
      heading,
      pending,
      before: parts[0]!.join('\n') + '\n',
      command: parts[1]!.join('\n').trim(),
      after: parts[2]!.join('\n') + '\n',
    });
  }
  return out;
}

for (const file of readdirSync(specDir).filter((f) => f.endsWith('.md'))) {
  for (const ex of examples(file)) {
    const options = ex.pending ? { todo: 'pending' } : {};
    test(`${file}:${ex.line} ${ex.heading}: ${ex.command}`, options, () => {
      const { text, selection, provisional } = readDrawing(ex.before);
      const doc = Doc.parse(text, { provisional });
      // a key sequence plays like an editor: host defaults where a command doesn't apply,
      // provisional places settled as the caret leaves them
      if (!/^[a-zA-Z]+$/.test(ex.command)) {
        const run = play(doc, selection, tokenize(ex.command));
        const got = ex.after.startsWith('rejected') && run.last?.status === 'rejected'
          ? `rejected: ${run.last.reason}\n`
          : drawState(run.doc.text, run.selection, run.doc.provisional);
        assert.equal(got, ex.after);
        return;
      }
      const result = execute(doc, { type: ex.command } as Command, selection);
      let got: string;
      if (result.status === 'applied') {
        assert.equal(applyChanges(text, result.changes), result.doc.text, 'changes produce the new text');
        got = drawState(result.doc.text, result.selection, result.doc.provisional);
      } else if (result.status === 'rejected') {
        got = `rejected: ${result.reason}\n`;
        if (!ex.after.startsWith('rejected') && result.detail) got += result.detail;
      } else {
        got = 'notApplicable\n';
      }
      // a drawn selection without a caret glyph is forward
      const want = ex.after.replace(/»┃/g, '»');
      assert.equal(got.replace(/»┃/g, '»'), want);
    });
  }
}
