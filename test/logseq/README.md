# The spec, replayed in Logseq

`run.ts` replays the spec against Logseq's web demo (https://demo.logseq.com/) in headless
Chromium: one browser and one loaded app for the whole run, a fresh Logseq page per test, blocks
built and the caret placed through Logseq's plugin API (`window.logseq.api`), actions pressed as
Logseq's Linux keys, and outlines compared: (depth, text) per block plus the caret's or selection's
block and offsets. Logseq's own file format is not compared.

```
npm run test:logseq                    # check: ourus's spec against Logseq, and spec/zzz-logseq.md
npm run test:logseq -- --record        # adapt ourus's spec and record spec/zzz-logseq.md from Logseq
npm run test:logseq -- 'Indent' -v     # a subset, every verdict printed
```

Needs network and a Chromium (`CHROMIUM`, default `/usr/bin/chromium`). Not a CI gate: it measures
another editor, through a live site.

## Two uses

- **How far Logseq agrees with ourus.** ourus's examples run where their buffers are pure outlines
  (`-` bullets, no blank lines, nothing outside items); the rest are reported as skipped, with the
  reason. Markdown escapes (`\#`, `1\.`) are encoding, not behaviour, and are removed before
  comparing; `whitespace` marks results that differ only in spaces next to a line break.
- **Logseq's behaviour as a spec of its own.** `--record` adapts every ourus example to what Logseq
  can hold (`adapt.ts`), replays it, and writes [`spec/zzz-logseq.md`](../../spec/zzz-logseq.md), whose
  expected buffers are what Logseq did. The file declares `editor: logseq`, so `npm test` skips it;
  a check run replays it and should agree everywhere, unless Logseq's behaviour changed.

## Adapting an example (`adapt.ts`)

The initial buffer is read with ourus's parser, and every outline node becomes a block: items,
paragraphs, headings (`## title`, their sections nested under them) and atoms (code, quotes, HTML,
breaks) as raw content. Task checkboxes become `TODO` / `DONE`, ordered and `*` items plain blocks,
blank lines and CR endings go. A caret in a marker moves to the text start; a selection must stay in
one block. Actions map to Logseq's keys, `undo` and `redo` included; examples using an action with no
Logseq equivalent (`cursorDocStart`, `deleteSoftLineBackward`) are not adapted. Examples that become
identical once adapted are recorded once.

The first edit after the app loads is unreliable, so every run makes a warm-up edit first.
`results.txt` is the last check run.
