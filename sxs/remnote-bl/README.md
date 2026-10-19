# RemNote, with bullets

[`driver.ts`](driver.ts) drives RemNote (1.28.50) with its documents' bullets, its default: every rem an
item, a block as the other block apps' are, so it skips the spec's `free-form` cases. RemNote's own
setup, [`../remnote/`](../remnote/), hides them: free-form Markdown in a block app. The driver is
RemNote's ([`../remnote/driver.ts`](../remnote/driver.ts), `remnoteDriver` without `bulletless`): how it
runs, the keys, the results with bullets and RemNote's internals are in
[`../remnote/README.md`](../remnote/README.md).
