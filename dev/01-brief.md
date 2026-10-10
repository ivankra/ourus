# Initial brief (2026-10-11)

I want to build a core library for a new outliner app/plugin I'm building.

Provisional names:
- `ourus` (outliners r us)
  -> lets go with this one for now; develop in a separate `./ourus/` directory.
- `outex` (outliner experience)
- `markout` (markdown outliner; taken on npm)

It should be a modern standalone TypeScript project.
We'll refactor to a separate repo and npm package later.
Targeting cross-platform web and electron/tauri mainly.
MIT license.

It should be an editor-agnostic core outliner library, enabling
us to add proper polished outliner experience (as in logseq, roam, workflowy,
dynalist etc) to other editors - either directly via source modification
or plugins/extensions.  Target audience: developers of editors, their
plugins, as well as users of popular editor components.
Especially CM6 - we will build own CM6 extension on top of it later.

A big challenge in this space is that most editors (especially CM-based)
are text-first: they are glorified text editors with decorations and tricks
around a plain text buffer core; outliner structure is bolted on top and is
always one careless operation or implementation bug away from breaking.
In contrast, block editors like logseq are structure-first: text is
secondary as merely a serialization of the underlying tree structure;
which makes them very robust at manipulating the structure, but rigid:
logseq is incapable of handling arbitrary free-form markdown documents,
it forces them to become nested lists. On top of that parse->save
roundtrips become lossy, which is also highly undesirable.
We aim to marry these two approaches; primarily building for text buffer
based editors (e.g. CM/Monaco/textarea/TUI, rather than tree/block editors
like ProseMirror etc), enabling them to properly handle the tree structure
in the documents via our library.

Another related challenge is inconsistent markdown parsers in editors,
especially Obsidian's live preview that has its own separate markdown parser
often misparsing the nested structure - we can't build an outliner on top of
shaky foundation like that! Obsidian's live preview mode is our primary
target application, we will build our own outliner plugin for it later,
so keep it in mind.

Our library should feature a robust, fully-compliant parser for concrete
markdown specifications/flavors with all its edge cases. We especially
target commonmark, gfm, obsidian, logseq, and maybe pandoc.  Later we
may also extend to similar enough non-markdown markups (org, neorg
come to mind), less important but keep it in mind.  I imagine we might
have interchangeable sublibraries for different flavors, or main
library covering core dialects with a config, and separate libraries
for more difficult/rare flavors, something like that - exact design tbd.
We should definitely start with commonmark first for proof of concept.

API shape, rough vision:

- We need to own the document model, some central pure core class
  to represent an immutable snapshot of the document/tree.
- Likely this needs to be two related kinds of trees/layers:
  lossless syntax tree from the markdown parser and outliner tree.
  Headings aren't containers in markdown, but they should be in
  the outliner tree. (Possibly with a configuration
  knob, users may have different preferences.)
- Text is the source of truth, trees are secondary/derived.
- Possibly a richer stateful object (session/engine/editor) on top
  to hold document, selection, fold/zoom, empty placeholder node states
  etc to simplify editor integrations later.
- Parsing
  - Parsing and serialization must guarantee lossless roundtrip:
    serialize(parse(text)) == text for every JS string (i.e. UTF-16).
    So our document has to capture any extra source text stuff needed
    for this. Manipulation functions should aim to preserve as much of
    that original text stuff as possible; modify just what needs to be
    modified and not more.
  - It's fine to do parsing in-house (specs are largely frozen, code is
    cheap). Has to be a proper fully spec-compliant parser, not hacky 
    regexes! Can use an existing parser to get started, but i'd like to
    minimize dependencies in general and not marry the design to
    a specific parser. Parser should enable quickly updating the tree
    for common operations (e.g. editing a text within a node)
    without a full reparse (but sometimes reparse might be unavoidable
    e.g. paste/cut/replace, that's fine).
- Possibly some position query/info/operations layer/stuff? TBD
- Operations/commands:
  - 2 kinds: structural/tree ops and raw text edit ops.
  - Terminology TBD, but maybe "command" for structural/tree ops
    and "edit" / EditRequest (or "transaction" following CM)
    for raw text ops
  - Should return a new document/tree snapshot (likely with heavily
    reused parts for performance, like a persistent data structure),
    diff in text space (something that users can utilize to sync
    their text buffer state), ID events / node remappings
    (to help users update related fold/selection/... state),
    selection, caret/cursor state/updates, undo hints / inverse maps,
    etc
- Structural tree operations/commands like:
  - indent, outdent, move up/down, move-to (for drag-and-drop)
  - split, join
  - delete subtree, duplicate, convert kind (paragraph ↔ list item ↔ heading), toggle task.
  - group forms of operations, acting on a multi-node selection
  - Structural commands produce exactly their intended structure /
    preserve their structural invariants, else reject rather than
    allow broken documents. This is critical for proper outliner
    experience, the part broken in most editors.
  - Do minimal aligned text changes, consistently apply formatting
    rules (list renumbering, indents, blank line separators), etc.
  - Consider reusing names from the W3C Input Events spec's
    ("abstract operation names") to minimize new vocab we have
    to introduce.
- Raw text edit ops
  - to support e.g. typing text, markdown (including beginning of
    new structures e.g `#`, `-`, \`\`\`), maybe pasting/replace
    (if not in structural ops), fallback for any general edit
    operation not yet handled by structural commands.
  - We mainly target CodeMirror so these ops probably should largely
    mirror its transaction object, with some lightweight CM-like 
    but editor-neutral structure: base revision/snapshot, changes,
    selection, origin, intent, composing/IME in progress, etc.
    Keep in mind potential non-CM users: monaco, gtk, textarea etc.
    TBD/may vary: transaction might have already happened /
    about to happen.
  - Consistency between all views (text and syntax/outliner trees)
    must be guaranteed at all times in any case, always reconcile
    tree state(s) after text edits or smth.
- Operations should take selections and cursor state/position
  as input/output as needed; for cursor might also need to consider
  insert and block cursor shapes - relevant for TUI applications.
- Things should be configurable via options as needed to suit
  editors needs/differences and achieve a desired "feel".
  (users might have different preferences for e.g. a more
  logseq-like feel or workflowy etc, these can be config knobs).
- Core library should stay pure, editor-agnostic, low on external
  dependencies (no UI dependencies etc).
- Core should be extensively covered with tests to enable
  aggressive refactorings/reimplementation/simplifications
  as needed. Code is cheap and disposable these days and could
  be in principle generated as required from docs+tests.
- Eventually we might own more components of outliners but
  for a start the focus is document model as described above
  and its manipulation.

Outline tree defaults:
- headings are containers for the section (unlike in markdown syntax tree)
- paragraphs, code blocks are leaves
- each list item own its first paragraph/block, other blocks inside it
  are its children in the outline tree
- TBD: empty lines handling, maybe a config knob

Some important stuff probably to stay in editors/plugins than core:
- selections that cross node boundaries becomes a node selection;
  core library could provide some functions to aid implementing this.
- gesture/intent interception: paste, cut, drop etc intercepted and
  passed as structural commands
- keybindings -> command map e.g. Enter in a node -> split/new node,
  shift-enter -> line break in the item/node,
  (shift+)tab -> indent/outdent,
  backspace/del at node boundary -> join variants,
  alt(-shift)-up/down -> move up/down, etc.
  Some of these are preferences that end users may need to adjust.

Inspiration: repos/obsidian-true-outliner/ is the closest PoC project
I've found so far that already ships a highly functional obsidian plugin.
Study its design carefully, docs, history, pitfalls, lessons learned.
Study other repos/ as well, as well as any other external repos as
you see needed (feel free to clone and check them yourself, apt install
any tools needed). We're in design phase now and it is extremely
critical to ensure alignment with how the library would be used later
by potential users/applications.

We aim to develop own obsidian plugin and CM6 extension on top
of the new library to enable outliner experience; and possibly also extend
other editors (zettlr, joplin come to mind) to bring
the same polished outliner experience to them, so study their design
as well to ensure that our library's design will be a good fit.

As a first milestone: ship working minimal markdown outliner demos
built on top of vanilla html (e.g. textarea/content-editable),
basic CM6 (before we refactor to a reusable extension).
Maybe consider also doing GTK via js bindings, as a non-web demo.
