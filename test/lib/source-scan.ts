// A light scan of ourus's sources for the lints (`test/lints.test.ts`): no parser, the code with its
// comments, strings and regular expressions blanked out, then brackets matched. Enough for what the
// lint looks for, a spread into a call's arguments.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(import.meta.dirname, '../../src');

/** Every `.ts` file under `src/`, by its path from there. */
export function sourceFiles(): { readonly path: string; readonly text: string }[] {
  const out: { path: string; text: string }[] = [];
  const walk = (dir: string): void => {
    for (const f of readdirSync(dir).sort()) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts')) out.push({ path: relative(SRC, p), text: readFileSync(p, 'utf8') });
    }
  };
  walk(SRC);
  return out;
}

/**
 * `text` with its comments, strings, template literals' text and regular expressions blanked out
 * (spaces, line breaks kept): offsets and lines stay where they were, and what is left is code.
 */
export function codeOnly(text: string): string {
  const out = text.split('');
  const blank = (from: number, to: number): void => {
    for (let k = from; k < to; k++) if (out[k] !== '\n') out[k] = ' ';
  };
  let i = 0;
  // (a `/` starts a regular expression where an operand may start: after these, or a keyword)
  const operandNext = (k: number): boolean => {
    let j = k - 1;
    while (j >= 0 && /\s/.test(text[j]!)) j--;
    if (j < 0) return true;
    if ('(,=:[!&|?{};+-*%<>~^'.includes(text[j]!)) return true;
    const word = /[A-Za-z_$]+$/.exec(text.slice(Math.max(0, j - 10), j + 1))?.[0];
    return !!word && /^(?:return|typeof|of|in|case|do|else|void|delete|throw|new|yield|await)$/.test(word);
  };
  while (i < text.length) {
    const c = text[i]!;
    const next = text[i + 1];
    if (c === '/' && next === '/') {
      const end = text.indexOf('\n', i);
      blank(i, end < 0 ? text.length : end);
      i = end < 0 ? text.length : end;
    } else if (c === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      blank(i, end < 0 ? text.length : end + 2);
      i = end < 0 ? text.length : end + 2;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c && text[j] !== '\n') j += text[j] === '\\' ? 2 : 1;
      blank(i + 1, j);
      i = j + 1;
    } else if (c === '`') {
      // (the text blanked, an interpolation's code kept, nested templates in it too)
      let j = i + 1;
      let from = j;
      while (j < text.length && text[j] !== '`') {
        if (text[j] === '\\') j += 2;
        else if (text[j] === '$' && text[j + 1] === '{') {
          blank(from, j);
          let depth = 1;
          j += 2;
          while (j < text.length && depth > 0) {
            if (text[j] === '{') depth++;
            else if (text[j] === '}') depth--;
            else if (text[j] === '`') {
              // (a template inside: skipped whole, its text blanked)
              let k = j + 1;
              while (k < text.length && text[k] !== '`') k += text[k] === '\\' ? 2 : 1;
              blank(j + 1, k);
              j = k;
            }
            j++;
          }
          from = j;
        } else j++;
      }
      blank(from, j);
      i = j + 1;
    } else if (c === '/' && operandNext(i)) {
      let j = i + 1;
      let inClass = false;
      while (j < text.length && text[j] !== '\n' && (inClass || text[j] !== '/')) {
        if (text[j] === '\\') j++;
        else if (text[j] === '[') inClass = true;
        else if (text[j] === ']') inClass = false;
        j++;
      }
      blank(i + 1, j);
      i = j + 1;
    } else i++;
  }
  return out.join('');
}

/** The line of `text` (1-based) offset `pos` is on. */
export function lineAt(text: string, pos: number): number {
  let n = 1;
  for (let k = 0; k < pos; k++) if (text.charCodeAt(k) === 10) n++;
  return n;
}

/** Where each spread in a call's or `new`'s arguments is (`f(...xs)`, `push(a, ...xs)`), in `code` (`codeOnly`'s); not a rest parameter. */
export function spreadArguments(code: string): number[] {
  const out: number[] = [];
  for (let at = code.indexOf('...'); at >= 0; at = code.indexOf('...', at + 3)) {
    // (the bracket it is directly in)
    let depth = 0;
    let open = -1;
    for (let k = at - 1; k >= 0; k--) {
      const c = code[k]!;
      if (c === ')' || c === ']' || c === '}') depth++;
      else if (c === '(' || c === '[' || c === '{') {
        if (depth === 0) {
          open = k;
          break;
        }
        depth--;
      }
    }
    if (open < 0 || code[open] !== '(') continue;
    // (a call's: a name, a call's or index's end, or `new X` before it)
    let b = open - 1;
    while (b >= 0 && /\s/.test(code[b]!)) b--;
    if (b < 0 || !/[\w$)\]>]/.test(code[b]!)) continue;
    const word = /[\w$]+$/.exec(code.slice(Math.max(0, b - 30), b + 1))?.[0];
    if (word && /^(?:if|for|while|switch|catch|return|function)$/.test(word)) continue;
    // (a function's parameters: `function f(...`, a method's, an arrow's: what follows its `)` a body, a return type or `=>`)
    depth = 0;
    let close = -1;
    for (let k = open; k < code.length; k++) {
      const c = code[k]!;
      if (c === '(' || c === '[' || c === '{') depth++;
      else if (c === ')' || c === ']' || c === '}') {
        depth--;
        if (depth === 0) {
          close = k;
          break;
        }
      }
    }
    const after = close < 0 ? '' : code.slice(close + 1).replace(/^\s+/, '');
    if (/^(?:\{|=>|:)/.test(after)) continue;
    const before = code.slice(Math.max(0, b - 40), b + 1);
    if (/\bfunction\s*\*?\s*[\w$]*\s*$/.test(before)) continue;
    out.push(at);
  }
  return out;
}

