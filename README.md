# ourus

A TypeScript library bringing an outliner editing experience to Markdown text editors.

## Problem

Outliners like WorkFlowy, Roam and Logseq are built on a tree-based document model with Markdown left as an
afterthought, a serialization of the tree. Every edit operates on the tree or its nodes, so the structure can't
unintentionally break and editing feel is robust, but this comes at the cost of lossy round trips to Markdown and an
inability to edit free-form Markdown documents that mix prose and lists.

Typical text editors on the other hand treat the text as the source of truth. List editing and outliner operations, if
they even support any, are bolted on top in hacky ways and prone to breaking by any carelessly applied edit, resulting
in a fragile editing experience. Markdown has a myriad of edge cases where changing even a single character completely
changes its parse tree in surprising ways, and few editors attempt to support all of them properly.

ourus is an experiment to bridge both approaches. It's an editor-agnostic library that you plug into your editor for a
proper tree model of Markdown and the ability to edit it just like all the outliners do. Text stays the source of truth
and we ship a fast spec-conformant lossless incremental Markdown parser that keeps the tree perfectly consistent with
the text at all times at a negligible runtime cost. On top of the parser, we ship an outline document model (related to,
but different from, the parse tree: e.g. sections nest under headings, lists nest under paragraphs) and implementations
of all the usual structural outliner commands that you just need to bind to a shortcut.

## Design

The library is built in layers:

- [parser](src/parser/): lossless incremental parser for CommonMark, GFM and Obsidian's flavors.
- [doc](src/doc/): an immutable snapshot of the text, its parse and outline trees.
- [view](src/view/): document plus editor state relevant to outliner commands: selection/caret, folds and zoom.
- [writer](src/writer/): converts an outline back to Markdown with the smallest text changes.
- [commands](src/commands): high-level structural editing commands, such as indent, outdent, split, join, move up/down,
  drag and drop, cut, paste etc. Each takes a view and returns the new view and text changes (as a CodeMirror-compatible
  `ChangeSpec[]`).

Principles:

- Text is the source of truth. Parse/outline trees are derived from it and kept up to date incrementally.
- Documents are immutable snapshots, implemented as persistent trees. Edits generally take time/space proportional to
  the size of the edited blocks plus the path to the root.
- Commands work by building a draft of the new outline, asking the writer layer to spell it out as Markdown and
  incrementally reparsing the output to check the result still has the intended structure. If Markdown can't represent
  the result, the command is rejected rather than allowed to mess up the document.
- Edits are kept as small as possible. Blocks a command doesn't touch are not rewritten, though we may normalize the
  whole subtree up to a top-level block. The parser is lossless and guarantees roundtrips. New text follows the
  document's existing indentation and formatting style.
- ourus is extensively tested with a mostly app-agnostic [spec](spec/) test suite against [other outliners](sxs/). The
  apps disagree in many finer behavior details. If there is no clear right choice and the disagreement is not due to a
  bug in the app, we generally provide a tunable config option to customize ourus behavior to your preference. The
  defaults mostly follow Logseq and Roam.

## Install

```sh
npm install ourus
```

ourus is an ES module with TypeScript types.

## Basic usage

```ts
import { OurusDoc, OurusView, OurusSuccess, executeCommand } from 'ourus';

const text = `Hello world`;
const doc = OurusDoc.parse(text, { config: { flavor: 'obsidian' } });
let view = OurusView.of(doc).withSelection({ anchor, head });

const result = executeCommand(view, { type: 'indent' });
if (result instanceof OurusSuccess) {
  editor.dispatch({ changes: result.changes, selection: result.view.selection });  // e.g. for CM6
  view = result.view;
}
```

## Demos

[https://ivankra.github.io/ourus](https://ivankra.github.io/ourus/)

## License

[MIT](LICENSE)

Parts of the parser are ported from commonmark.js and cmark-gfm ([NOTICE](NOTICE)).
