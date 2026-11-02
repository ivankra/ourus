# Notion

The driver, [`driver.ts`](driver.ts), for [Notion](https://www.notion.so/)'s editor, and what was found on the way: a page published to the web, which [`proxy.ts`](proxy.ts) makes editable for a visitor and loads each test's blocks into. `node sxs/run.ts notion` runs it; the results are [`sxs/notion.md`](../notion.md).

Notion is closed source. The rest of this file was measured on one page in Chromium 155 on Linux, on 2026-11-02 and 2026-11-03; the builds were `app-aab9b095d15566c7.js`, then `app-edf1150742476cf6.js` (the one cached now, the version a report names). Notion ships continuously, so the minified names below (`i(827482)`, `getModeType`) will drift and the structure should last longer.

## What `proxy.ts` does

1. **Rewrites the role.** Notion's data says the visitor is a reader: `"role":"reader"` on every record, `"publicAccessRole":"reader"` once. Responses from `/api/v3/*` are rewritten to `"editor"` on the way out (the cache keeps what Notion sent), so the app builds its stores editable from the start. Changing the role on the stores after the page loaded does not work: `canEditText` and `canEditList` are computed once, by `useComputed` hooks the app doesn't recompute (tried: patching `canEdit()` and `getRole()` on the prototypes, overriding each `roleStore`'s `computeFn` and recomputing, a resize, a scroll, a fake `popstate`; none re-rendered the blocks).
2. **Patches what the app's scripts check that a visitor fails** (`SCRIPT_PATCHES`, each a marker, a regexp and its replacement, tried on every script; they are tied to the minifier's output, and one that stops matching leaves its check in place, quietly):
   - **The editor's mode.** A role of editor is not enough: the editor's mode for a page (`getModeType`, a module with `getMode`, `getModeType`, and a frozen enum `disabled | view | comment | edit`) answers `"edit"` only for a **signed-in user**, `currentUser.isLoggedIn()`, and only while `this.state.editing` or the public page is "editable". Rewritten to `"edit"` for any role that may edit. If it stops matching, the page is read-only again: the check is `contenteditable` on a text leaf (`"true"` when it works).
   - **The block actions' public edit mode** (`hasPublicPermission && "edit" !== permission`, module 45262): a visitor's page stays in `view` whatever the editor's mode, and the action registry's validators (a block selection's Delete, ...) refuse it. Rewritten to false.
   - **Whether selected blocks may be deleted** (`canDelete`, module 92731): the signed-in user's roles in the space (`currentUser.id`, its permissions on each block), which a visitor has none of. Rewritten to yes. Escape then Backspace deletes a block selection with this; without it nothing happens and no transaction is sent.
   - **A paste's author.** A paste of more than one line is HTML made into blocks (`e1`, in the clipboard chunk), and the blocks name their creator: the user record of `AppStoreCurrentUserStore`, which a visitor hasn't, so the paste returned before making any (a one-line paste is an edit of the block's text and never got there). Given a made-up user id (`VISITOR`) instead.
   - **The space's block limit** (`canCreate`, module 727264), which a paste of blocks checks first: made "no limit" (it wasn't what stopped the pastes, measured with a breakpoint, but it is a check a visitor's space has no data for).

   Found with breakpoints set by the scripts' source text (CDP `Debugger.setBreakpoint` at an offset found in `Debugger.getScriptSource`, expressions evaluated in the paused frame, `Debugger.setPauseOnExceptions` for what is thrown): the paste's path (`paste` → `pasting as markdown append` → `eQ` → `e1`) and the validators of the action registry (`function f(e,t){return null!=e&&(!e.validators||e.validators.every(e=>e(t)))}`, a conditional breakpoint on the action's key, each validator called in the frame). The calls the app makes on the way (`getSubscriptionBanner`, answered 401) were not the cause; the debugger was.
3. **Answers the app's writes and reports locally** (`{}`, 200): `saveTransactionsFanout` and `submitTransaction` (its saves), `ping`, `etClient`, `record*`, `logClientEvent*`, `getUserAnalyticsSettings`. A visitor may not write; Notion would refuse. The app thinks it saved.
4. **Caches its reads** by their body, and **the page under one key** whatever its query (`?sxs=`, a test's document, which the proxy reads from the cookie or the referer): keyed with the query, each test's first load fetched the page from Notion, and each copy, cached on the day its test first ran, loaded that day's build (`app-aab9…`, `app-edf1…`, chunks named differently from one load to the next). A read is a `POST` keyed by its URL and the SHA-1 of its body, as the Mubu proxy does it: `loadCachedPageChunkV2`, `getPublicPageData`, `queryCollection`, `syncRecordValues*`, `getBacklinksForBlockInitial`, ... `getAppConfig` is keyed by its URL alone: its body carries ids and times that change on every load. **Do not stub the reads with `{}`**: the app throws (`i.data.backlinks is not iterable`) and some blocks fail to draw.
5. **Answers the event collectors with CORS headers**: `http-inputs-notion.splunkcloud.com` (Splunk, its client log) and `exp.notion.com` (Statsig, its feature flags and experiments). They are another origin than the page, so the browser asks first, and a host in the proxy's blocked list is answered without CORS headers: the app logs `Failed to connect to splunk server` and retries for ever (the Mubu lesson, `dev/27-sxs.md` §14). Statsig's calls are refused by the page's own CSP anyway (`connect-src`) and the app takes that; nothing needs doing about them.

Left as is: `getSubscriptionBanner` answers `401` (it is for a signed-in user; a paste of blocks asks for it), which the app logs and ignores. The analytics hosts (Google Tag Manager, Sentry, Facebook's connect) are the shared blocklist's.

## The editor

### DOM

- `.notion-page-content` holds the blocks, drawn by a virtual list (`data-virtual-item-slot`, `data-index`): **only blocks near the viewport exist in the DOM**. A driver that reads the DOM misses the rest; read the model.
- Each block is `div.notion-selectable.notion-<type>-block[data-block-id]` (`notion-bulleted_list-block`, `notion-text-block`, `notion-numbered_list-block`, `notion-to_do-block`, `notion-sub_header-block`, `notion-toggle-block`, ...). Its text is `div[data-content-editable-leaf]` (a `contenteditable`, `"true"` once the proxy's patches work, `"false"` in a reader's page). Children of a list item are nested inside its block's element.
- The page's title is the first leaf (`Nested TODOs`) and is a leaf like any other, so **do not take the first leaf as the first block**.
- A block selection (below) draws as `.notion-selectable-halo` on each selected block.
- The caret is the DOM selection (`getSelection()`): its anchor is a text node inside a leaf, its offset an index into that leaf's text.

### The model

Everything is in React. A block's component (`ListItem`, `ContentEditable`...) has props `store` (a **block store**) and, below the page, `listStore`. The reliable way to find one: walk the fiber tree up from a leaf (`Object.keys(leaf).find(k => k.startsWith('__reactFiber'))`, then `.return`) and take the first `memoizedProps.store` that has `getType`. A fixed depth does not hold (the leaf was 53 up from the list store and ~69 from the virtual list): search for what you need.

```js
const leaf = document.querySelector('[data-content-editable-leaf]');
let f = leaf[Object.keys(leaf).find((k) => k.startsWith('__reactFiber'))], page;
for (; f; f = f.return) {
  const s = f.memoizedProps?.store;
  if (s?.getType && s.getContentStores && s.getType() === 'page') { page = s; break; }
}
```

A block store (a class with ~320 methods; the useful ones):

| | |
| --- | --- |
| `getType()` | `bulleted_list`, `numbered_list`, `to_do`, `text`, `header`, `sub_header`, `sub_sub_header`, `toggle`, `quote`, `callout`, `code`, `page`, `column_list`, `column`, ... |
| `getContentStores()`, `getContentIds()` | a block's children, in order (`content` on the record) |
| `getParentBlockStore()` | its parent |
| `getProperties()` | `{ title: [[text, [[mark], ...]], ...], checked?: [['Yes']] }`; a mark is `['b']`, `['i']`, `['s']`, `['c']` (code), `['a', url]`, ... |
| `getFormat()` | `{ toggleable?: true, block_color?, ... }`; a heading that folds is a heading with `toggleable` |
| `getTitleValue()` | the same `title` |
| `getRole()`, `canEdit()` | `"editor"` once the proxy has rewritten it |
| `inMemoryRecordCache` | the record cache every store reads (below) |
| `_pointer` | `{ table: 'block', id, spaceId }` |

Reading the document for `read` is then a walk of `getContentStores()` from the page store: type, `title`, `checked`, children. It is synchronous and works for the blocks the virtual list hasn't drawn. A text's `\n` is a Shift+Enter line break inside one block ("`Simple to start\nx`").

Block text is **rich**: `title` is a list of `[text, marks]` runs, so a driver can read formatting. The title is mirrored by a CRDT (`crdt_data` on the record, `{ title: { r, n: {...} } }`, operations `insertText`, `addAnnotation`...): **reading `getProperties()` is right, writing it is not** (below).

### Loading a test's document

Solved at load time (see "The driver", above); what was tried first:

- **Writing the record cache** (`store.inMemoryRecordCache.setRecord({ pointer: { table: 'block', id, spaceId }, userId }, { value, role })`) changes what a store reports (`getProperties()` gave the new title, `getContentIds()` the new list) but **the DOM did not follow**: the text leaf draws the block's CRDT title (`crdt_data`), not `properties.title`, and the page's content list is a computed store that did not re-render for a replaced `content`. A record made this way would need a matching `crdt_data` (its shape is in a block's record: `{ title: { r: "<id>,\"start\",\"end\"", n: { ... { s: { x, i: [{t:"s"},{t:"t",i:[opId,1],o:"start",l:12,c:"text"},{t:"e"}] } } } } }`), which wasn't attempted.
- **Replacing the response in the proxy** (`loadCachedPageChunkV2` and `syncRecordValues*`, with records of a test's own) is the same problem, and it has to be per test.

What does work, and is what a driver should start with: **load by editing**, as a user does. Select every block (Ctrl+A in a block selects its text, again the blocks, and again all: three presses), delete, then type the document with the app's own shortcuts: `- ` (bullet), `1. `, `[] ` (to-do), `# `, `## `, `> ` (toggle), Tab and Shift+Tab for depth, Enter for the next block. That is also the most faithful to what a user's document is. **Block selection Delete/Backspace did not delete in the measurements** (see Open), so a replacement of the whole document may need to go block by block (caret at a block's end, Backspace until it merges or becomes a text, Delete, ...) or to start from a page with nothing but one empty block.

Because nothing is saved, a reload resets the document: the cheapest `unload` is to leave the page and `open` again, or to undo (below).

### Keys (Linux)

Each key was pressed in a page with a bullet list; "yes" means the effect was seen in the model.

| action | keys | |
| --- | --- | --- |
| `enter` | Enter | yes: `Text.handleEnter`, a new block of the same type after the item's children |
| `shiftEnter` | Shift+Enter | yes: a `\n` in the same block's title |
| `indent` | Tab | yes: the block becomes the previous sibling's last child |
| `outdent` | Shift+Tab | yes: the block goes after its parent, **its children going with it**? not measured |
| `deleteContentBackward` | Backspace | yes at a block's start: in an empty bullet, `annotatedContentBlockBackspaceAtBeginning` **turns it into a text block**, the first Backspace not deleting; a bullet with text became a text block too (`bulleted "c"` to `text "c"`). Join into the previous block: not measured |
| `deleteContentForward` | Delete | not measured in a text |
| `moveSubtreeUp`, `moveSubtreeDown` | Ctrl+Shift+ArrowUp, Ctrl+Shift+ArrowDown | yes: Notion's "move block up/down", the caret staying in the block; in the measurement the block moved past its sibling |
| `duplicateSubtree` | Ctrl+D | pressed; the tree dump did not show a difference, **to be checked** |
| `undo`, `redo` | Ctrl+Z, Ctrl+Shift+Z (Ctrl+Y) | Ctrl+Z moved the caret to the page's title, an undo of a step; redo returned the caret. The model after each: to be checked |
| `paste`, `pastePlain` | Ctrl+V, Ctrl+Shift+V | not measured |
| block selection | Esc, then Shift+ArrowDown / Shift+ArrowUp | yes: Esc turns the caret's block into a selected block (`halo` 1); Shift+Down made it 2; Enter goes back into its text, the caret at its end |
| `deleteSubtree` | Esc, then Delete or Backspace | **no effect**: no transaction was sent (see Open) |
| select all | Ctrl+A, three times | selected every block (`halo` = 12 on the template page) |

The ones the spec has and Notion has no key for, or that need checking, are Notion's `Ctrl+Shift+ArrowUp` (move), `Ctrl+Enter` (open/close a toggle), `Ctrl+Shift+H` (colour), `Ctrl+Alt+1..` (turn into a heading or a list), `Ctrl+Shift+7/8/9` (numbered, bulleted, to-do), `Ctrl+Shift+Backspace` (delete), `Ctrl+E` (code), `Ctrl+Shift+S` (strike), `Ctrl+B`/`Ctrl+I`/`Ctrl+U`. Notion's help page for shortcuts is the list; each needs one try in the page.

### Markdown shortcuts, on typing

Notion turns a typed prefix into a block type, as an outliner turns `- ` into a bullet: `- `, `* `, `1. `, `[] `, `# ` to `### `, `> `, `` ``` `` (code), `---`. The spec's `auto.md`, `backtick.md` and `fences.md` cases will play against those; that they behave per Notion's help page (the prefix swallowed, the block's type changed) is unmeasured.

### Transactions, and settling

An edit is a transaction sent to `saveTransactionsFanout` (the proxy answers it `{}`): `{ requestId, transactions: [{ id, spaceId, debug: { userAction }, operations: [{ command, pointer, path, args }] }] }`. `debug.userAction` names what the user did, which is the most readable record of what a key did: `Text.handleEnter` (`set`, `update`, `listAfter`, `listRemove`), `Text.handleMutation` (`insertText`, `update`), `textBackspaceActions.annotatedContentBlockBackspaceAtBeginning`, `ImageRenderer.updateBlockWidth` (the page's own images, on load). A driver can read them by listening to the page's requests (`page.on('request')` for `saveTransactions`).

A key's reaction is partly asynchronous (the new block's leaf is focused later; the selection moves in a frame), so the runner's settling (`sxs/lib/idle.ts`, `Driver.idle`) applies: its timers and frames are the page's own, and Notion keeps long timers (a polling `ping`, autosave debounces) that the idle tracker ignores by design. Notion's saves are answered at once by the proxy, so there is no pending save to wait for. Measured: a fixed 300 to 500 ms was enough in the experiments; the runner's idle wait should be tried first, with `frames: false` if the page keeps a frame loop (not checked).

## The driver, as written (2026-11-03)

`node sxs/run.ts notion`: of 453 examples run, 154 agree with ourus, 13 differ in the caret, 25 in whitespace, 261 disagree, none errors; 1038 are skipped (`sxs/notion.md`).

The proxy builds the test's blocks into `loadCachedPageChunkV2`'s answer, in Notion's older record form (`properties.title`, `content`, `parent_id`, no `crdt_data`): they render and edit like Notion's own. The driver gives the document as `?sxs=<JSON of {depth, text}>` and as a cookie `sxs` (the app may drop the query from its URL before it asks; the proxy reads the cookie, then the `Referer`'s query), and loads the page through `about:blank`. Empty blocks, text starting `- `, `--` all go in as written. Reading is from the block stores and the DOM selection.

- Writing the in-page record cache doesn't render (the text is drawn from the CRDT), a multi-line paste and a block selection's Delete do nothing for a visitor, and faking `isLoggedIn` breaks the page: the load-time records are what works.
- Reloading the page in one window for 150 tests crashed its renderer ("Target crashed", twice, at different tests that pass alone): going through `about:blank` fixed it.
- Leaving an edited page asks "Leave site?" (`beforeunload`); Playwright dismisses it and the next load never came back: the driver accepts it.
- `holds`: markup (a title is plain for now: `[text, [["b"]]]` marks are the next step, and `to_do`, `header`, `quote` blocks), an emoji (the DOM selection splits it). Not played: undo and redo (no way yet to clear the history after a load), `duplicateSubtree`, `deleteSubtree`, the document's ends.
- The disagreements sampled (Enter, Backspace, move) are Notion's: Backspace at a bullet's start makes it a text block rather than joining; Enter in an empty indented item leaves a level; Tab keeps later siblings where they are. Not all 261 were checked, and `behaves` is not set.

## What a driver needs, in order

1. **`open(page)`**: set the three cookies; go to the page; wait for `.notion-bulleted_list-block` (attached, not visible: the first bullet may be below the fold) or for a `data-content-editable-leaf` with `contenteditable="true"`; fail with a clear message if it's `"false"` (the proxy's patches stopped working) or if the page shows a challenge (`#challenge-form`, a `cf-` cookie, `document.title` "Just a moment...").
2. **`load(page, doc)`**: see above; find the page store, replace the content by typing (it starts from a document in which the first block's leaf can be clicked), then place the caret or the selection: a caret by clicking a leaf and pressing Home/End and Arrow keys, or by setting the DOM selection in the leaf (`getSelection().setBaseAndExtent`) after focus, which Notion's selection handlers (`selectionchange`) take; a block selection by Esc, then Shift+Arrow.
3. **`read(page)`**: walk the page store for the outline (type, text, checked, children, in order); the caret from `getSelection()`: find the leaf that contains the anchor (`closest('[data-content-editable-leaf]')`), then the block's id from the nearest `[data-block-id]`, and the offset (a leaf's text is one text node per mark run, so add the lengths of the preceding nodes; a `\n` is a `<br>` or a newline in the text, check which); a block selection from the `.notion-selectable-halo` blocks' ids.
4. **`keys`**: the table above, `model: 'block'`, `behaves` from what the measurements say (Backspace at a bullet's start makes a text block; Enter in an empty bullet; Tab on a first child does nothing; headings are not containers, as in AFFiNE, an unmeasured guess).
5. **`unload`**: nothing needs saving; reload the page or undo to the starting state. The next `load` replaces the content anyway.
6. Run it with `node sxs/run.ts notion` (`shortId` two capitals not used by another app's, `longId` `notion`, `url` the page's, a `scope` of `https://jordanscales.notion.site/`).

## Open

- **Deleting a block selection** (`Esc`, then Delete/Backspace; Ctrl+A to the last level, then Backspace) did nothing and sent no transaction, in two measurements and with no page error. The block-level delete may be gated by something the role and mode patches did not flip (`canEditContentOnly`, a `canDelete` on a store, the `publicEditModeStore` `permission: "view"` the editor keeps even in an edit mode: its state was `{ hasPublicPermission: true, permission: "view" }` while editing worked), or it may need the focus somewhere other than the leaf (`document.activeElement` stayed the leaf after Esc). Find the handler: the keydown for Backspace with a block selection, in `app-*.js`; a breakpoint in `EventTarget.dispatchEvent` or a `keydown` listener log is the quickest start. The spec's `delete-subtree.md` and the selection cases need it.
- **Loading a document without typing** (above). If found, it is also the way to make a document with a block selection, folds (`toggle` blocks), tasks and headings exactly.
- **Whether Notion's structure is a tree for headings.** A `sub_header` is a sibling of the blocks after it, not their parent (Features / Tips, as siblings in the template), unless it is a toggle heading (`toggleable`).
- **Selection offsets over marks and line breaks**, as `read` needs them.
- **Copy and paste**: Notion puts its own flavour on the clipboard (`text/_notion-blocks-v3-production`, besides `text/html` and `text/plain`); whether a paste of plain text splits at newlines into blocks, and one of Notion's own pastes carries structure, is the spec's `paste.md` and not measured.
- **Page errors that remain** with the proxy: Statsig's blocked connections (CSP), `Failed to load resource ... 401` for the subscription banner, the OPFS warning from the SQLite worker (no cross-origin isolation). None affected editing.
- **Time**: the page took about 3 s to render its first blocks from a warm cache.
