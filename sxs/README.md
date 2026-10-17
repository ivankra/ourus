# SxS: the spec replayed side by side in other apps

How far do other outliners agree with ourus? The spec's examples (`spec/*.md`) are written
editor-neutral: drawn buffers and the actions between them, named for what the user does. This
directory replays them in other apps, live, in headless Chromium, and reports where each app agrees,
where it differs (with both outcomes drawn), and which examples it can't run, and why.

## Running it

From the root of the checkout, after `npm install`. It needs Chromium (`CHROMIUM`, default
`/usr/bin/chromium`), `openssl` (once, for the proxy's certificate) and, on a cold cache, the network;
for Obsidian, Xvfb and Electron's libraries (`obsidian/README.md`), and for Emacs, `emacs-nox` and
`tmux`. On Debian and its derivatives, as root or with passwordless `sudo`, the run installs what is
missing with `apt-get` ([`lib/system.ts`](lib/system.ts)); elsewhere it stops, saying what to install.
It is not a CI gate: it measures other apps, through live sites.

```
node sxs/run.ts logseq                    # every example; copies its report to logseq/sxs.md
node sxs/run.ts logseq indent.md          # one file (or: indent)
node sxs/run.ts logseq indent.md#indent3  # one example, by its anchor
node sxs/run.ts logseq Enter              # any part of an example's name
node sxs/run.ts logseq --list             # what would run and what is skipped, why; no browser
node sxs/run.ts logseq,dynalist indent.md # several apps side by side, in parallel, one table
node sxs/run.ts all indent.md             # every app on a file, while writing the spec
node sxs/run.ts all                       # every app on everything: every report, and sxs.md
node sxs/run.ts --stop                    # stop the shared proxy, browsers and servers
npm run sxs -- logseq indent.md                # the same, through npm
```

The first argument is the app: a directory here with a `driver.ts`. Then any number of selectors, which
pick the examples matching any of them; none picks every example. Options:

| option | what it does |
| --- | --- |
| `-v`, `--verbose` | print every example's verdict, not only the disagreements, and every URL the proxy saw |
| `--list` | print what would run (with how each example was adapted) and what is skipped and why; no browser |
| `--strict` | run only original outlines: examples whose buffers needed no adapting |
| `--repeat=N` | run each example N times and report the ones whose outcome varies |
| `--headed` | show the browser (one of the run's own, not the shared one) |
| `--slow=MS` | pause after every action, on top of settling: to watch, or to rule timing out |
| `--offline` | serve only what the proxy has cached; a miss fails instead of being fetched |
| `--fresh` | load the app anew, rather than take over the page an earlier run left loaded |
| `--no-report` | don't copy the report into `<app>/sxs.md` (nor the table into `sxs.md`) |
| `--timing` | print how long the app took to settle after each action, and what it waited on last |
| `--plain-clipboard` | give the app the clipboard's Markdown as plain text only, without its HTML rendering |
| `--json=FILE` | write the run as data to FILE too, as `.sxs/<app>/sxs.json` has it |
| `--jobs=N` | with several apps, run at most N at once (all of them by default) |
| `--table` | with several apps, run nothing: write the table from the verdicts each app's last run left in `.sxs/<app>/sxs.json` (an app with none left out) |
| `--regenerate-report` | run no app: judge what it did in its last runs (`.sxs/<app>/<file>.json`) against the spec as it is now, and write its report and run as data again (with several apps, the table too); an example its runs didn't play as the spec has it now is left out, under "Not run" (`?` in the table), wanting a run |
| `--stop` | stop the shared proxy, the apps' browsers and the servers drivers started, and nothing else |

A run prints each example that doesn't agree, with what ourus expected and what the app did, drawn as
spec buffers. It ends with the counts, the skips by reason, and what the proxy fetched, passed through
live and blocked, per host. Every run writes its report and its run as data to `.sxs/<app>/sxs.md`
and `.sxs/<app>/sxs.json`, not checked in (`.sxs/` mirrors this directory); a run of every example (no selector, no `--strict`)
copies the report to `<app>/sxs.md`, which is: diff it to see what changed since the last run.

Each run also keeps what the app did in each example, per spec file (`.sxs/<app>/indent.json` for
`indent.md`, `FileRun` in `run.ts`): a run replaces the examples it ran and keeps the rest of their
files', so runs of a few examples add up, and a run of every example of a file replaces it whole.
After a change to the spec, `run.ts all --regenerate-report` writes every report and the table again
from them in seconds, without running an app: an example is judged again from the states the app
reached in it, if its last run played it as the spec has it now (the same start, clipboard and
settings, and the same actions in each step, or in its first ones where steps were added since);
the rest want a run, as `run.ts <app> <selector>`. On the spec its runs were made with, it gives
every verdict the runs gave.

**Several apps** (`logseq,dynalist`, or `all`) run side by side (`run.ts`, "several apps"): a run of the
above for each, in a process of its own, all at once unless `--jobs` says fewer, each with its output
in `.sxs/<app>/sxs.log` and its report and run as data beside it, as alone. The proxy is
started first, so the runs don't race to start it; each app has a browser of its own. A line per app says its
counts as it finishes; then a table gives every example's verdict in each app, the apps by how many
examples agree, the most first, in every table (`ok`, `DIFF`, `caret`,
`space`, `ERROR`, `-` for skipped; in `sxs.md`, ✓, ✗, C, S, E, –, explained in its legend): every row for a few examples or with `-v`, else the rows where
the apps don't all agree. The table is written too, as Markdown, to `.sxs/sxs.md` with its
heatmap, `sxs-heatmap.svg` (how alike two apps did in the examples both ran alike, both as written or both adapted the same way:
the same result 1, the same but for the caret or spaces ½; ourus among them, as its own runs of the examples have it, `test/spec-run.ts`); a run of every app on the whole spec copies both here, [`sxs.md`](sxs.md),
checked in, each app's column linking its report (which its run copies here, as a full run does alone). Apps run side by side compete for the
machine, so each takes longer, but their verdicts are those of a run alone: compared example by
example, they were, once each app had its own browser and the idle script waited for clipboard
reads (`12-sxs.md` §20 has how it went wrong before).

In `sxs.md` the summary gives each app's model (`block` or `text`) after its name. In its table of
examples a bold row names each spec file, and each example is its own name (not its sections'),
at most 20 characters and `…`, linking to it in the spec, with its full name, sections and all, as
the link's title (a tooltip); after the apps come the count of apps that disagree on it and its
rank, and a file's total row gives the examples each app disagrees on and their sum. A verdict in brackets, `(✗)`, is
a difference in an example adapted for that app (its buffers projected onto blocks), so it compares
those, not the buffers, with what was adapted as its tooltip (`adapted: heading`); an adapted
example that agrees is a plain ✓. `run.ts all --table` writes it again from
the last runs, without running anything: after a change to the table's layout, or after rerunning
only some apps (`run.ts a,b`), each of which leaves its verdicts; its `elapsed_s` is then the
longest app's run.

After the summary, **By spec file** sums each spec file: its examples, the apps' runs of them, the
disagreements among those runs (and their share), the block apps' disagreements among them, and each
app's; the most first, then the total.

The first run of an app starts the proxy and the app's headless Chromium, and leaves them running
for the next runs, with the app loaded (`.sxs/proxy.log` and `.sxs/<app>/chromium.log` say what they did).
Later runs reuse them, so a run of one example takes under a second. Stop them all with `--stop`.

## What happens in a run

1. **Choosing and adapting** ([`lib/plan.ts`](lib/plan.ts)). Each selected example is adapted to the app,
   or skipped with a reason: an action the app has no key for, an option the app doesn't have
   and can't be set to (`outdent: logical`), a tag it skips (below), a buffer it can't hold (a quote, for a block app), a caret with no place in
   it. Examples that adapt to the same thing run once.
2. **The proxy** ([`proxy.ts`](proxy.ts)), a caching forward proxy the browser reaches every site
   through. It intercepts HTTPS with one self-signed certificate (the browser ignores certificate
   errors), so pages keep their real origins. GET and HEAD go to disk on first fetch, under
   `.sxs/http/<host>/`, and are served from there after; other methods go live; analytics,
   embedded video and the browser's own background traffic are blocked. An app's
   `<app>/proxy.ts` can say more: cache keys, stubs (which can also refuse a WebSocket, or serve an
   app from a copy on disk with `fromDirectory`), patches applied on the way to the browser (the cache keeps what the
   server sent). Every request is logged in `.sxs/proxy.log`, blocked
   ones too; a run ends with what it fetched, passed through live, and blocked, per
   host, and with `-v`, every URL.
3. **The browser and the app** ([`lib/browser.ts`](lib/browser.ts)). The proxy, and a headless Chromium
   per app (its profile `.sxs/<app>/chromium/`), are shared between runs: started by the first run
   that needs them, left running, and restarted when their code or flags change. A browser per app,
   not one for all: a browser has one clipboard, and its Clipboard API works only in the tab in front
   (behind another, a write is dropped and a read comes back empty, without an error), so apps run
   side by side in one browser took each other's clipboard. The app's page stays loaded too: the
   next run of that app takes it over instead of loading the app again, if it was loaded from the
   driver's URL with the current `idle.ts` (an older one stays in a page until it reloads) and still
   loads and reads a document. The run brings the page to the front. One run of an app at a time:
   a run holds its browser (`.sxs/<app>/<app>.lock`), and another run of the app while it does fails, as
   the two would share the browser's clipboard (a headless browser's own, not the desktop's) and front tab.
4. **Playing** ([`run.ts`](run.ts)). For each example the driver loads the starting state into a
   fresh document (through whatever the app offers: a plugin API, its stores), and the runner checks
   that the app holds it as given, since an app that rewrites its input (trimming, normalizing)
   would make the test meaningless. Then the actions are played as a user plays them, with the app's
   keys; text is typed a character at a time; pastes put the clipboard first: the example's
   Markdown as plain text and, where it has structure, rendered as HTML too
   ([`lib/clipboard.ts`](lib/clipboard.ts)), as a copy from a rendered page carries it. Nearly every
   app reads the HTML when there is one (Logseq, Tine, Roam, Dynalist, WorkFlowy, SiYuan, the
   Obsidian apps and SilverBullet converting it; BlockNote at a text's end only); ourus reads the
   Markdown, as a Markdown host passes it the plain text. Plain lines carry no HTML, as a copy of
   plain text doesn't, and Emacs's kill ring holds text alone. After every key the
   runner **waits for the app to settle** ([`lib/idle.ts`](lib/idle.ts)), never for a fixed time: an init
   script tracks the page's short timers and animation frames until they fire or are cleared, and
   its DOM mutations; the page is idle when none is pending and nothing changed for 40 ms, and the
   driver's own busy signal is off. An app whose busy signal stays on with nothing else happening
   is reported stuck.
5. **Comparing** ([`lib/outline.ts`](lib/outline.ts)). A block app's state is an outline: blocks with a
   depth and a text, the caret's block and offsets. The spec's buffers are projected onto the same
   form with ourus's own parser (every outline node a block holding its own text, in canonical
   Markdown: `[ ] ` for a task, `## ` for a heading, `\n` between lines), and compared block for
   block. Verdicts: `agree`; `caret` (blocks agree, the caret doesn't); `whitespace` (they differ in
   spaces next to line breaks only; a text app's text, in spaces before line breaks, or in spaces
   anywhere that leave the document as ourus reads it the same, its code byte for byte); `disagree` (the blocks differ: their text, their nesting, how
   many there are); `error` (the run failed, or the app didn't hold the
   starting state).

   A text editor's state is Markdown text ([`lib/text.ts`](lib/text.ts), the `text` model, for SilverBullet
   and the like): the spec's buffers are taken as written, a placeholder (`◌`) dropped since it
   marks a place rather than text, and the app's text is compared with them as drawn, caret included
   (`whitespace`: they differ only in spaces ending lines). Nothing is projected, so quotes, blank
   lines and frontmatter run too.
6. **Reporting**. Disagreements are printed with both outcomes drawn; a run of every example writes
   `<app>/sxs.md`: the app (by its directory's name), its version, its URL and the command as
   frontmatter, the counts, then the original and the adapted cases in sections of their own. Each
   has a subsection per verdict, in the order disagree, whitespace, caret, error, then agree; the
   examples in each are numbered, each heading a link to the example in the spec. An example of one
   step has its command, then the start, the app's outcome and ourus's side by side in an HTML table
   (for an adapted example a row as blocks and a row as the spec writes them); an example of more
   steps has its start, then each command, with the outcomes side by side where they differ. Last,
   the skips by reason, numbered too. Beside it, `.sxs/<app>/sxs.json` has the same run as data, for
   scripts (`AppRun` in `run.ts`): the frontmatter's fields and the counts, then every example in the
   spec's order, each with its file, anchor and line, verdict, adaptations, options, starting
   clipboard and start, and each step's actions, verdict, and ourus's state and the app's, drawn as
   spec buffers in the app's model (for a text app also projected onto blocks, as `blocks`, to set
   beside a block app's; the spec's own drawing as `written` where it differs); then every skip,
   with its reason.

**Original and adapted.** An example whose buffers are `-` outlines as written is *original*: the comparison
means exactly what it says. The others are *adapted*: a paragraph or a heading stood in for a block,
blank lines were dropped, a numbered item became a plain one (where the app has no numbered blocks:
a driver that loads and reads them declares `ordered`, and an ordered item is then a block whose
canonical text starts with its number, `1. x`, a number that is text kept escaped, `1\. x`; SiYuan,
BlockNote, Logseq, Roam, WorkFlowy and Dynalist number blocks so). Their notes say how. ourus gives these
Markdown structures meaning that blocks don't have (a paragraph owns the list after it, a heading
its section, a blank line is a gap), so an adapted difference is often the two models disagreeing
rather than a choice either app made. They are counted apart, and `--strict` runs the original ones only.

A projection can lose an example's point: one whose expected buffer differs from the one before only
in what blocks can't show (blank lines, markers) is skipped. And where ourus's caret has no place in
a block (in a marker, on a blank line, past the last line ending), the expected caret isn't
compared, and a starting caret there skips the example.

A case's `tags` ([`spec/README.md`](../spec/README.md#options)) say what else a projection would
lose. A block app runs no `free-form` case, one that depends on free-form Markdown structure blocks
have no form for: projected, the case tests something else, or nothing, and the app's difference is
the two models'. A `markup-` tag (`markup-heading`,
`markup-task`, `markup-fence`) is a step at markup an app may hold as text, where it edits a
character, or as an attribute, where there is no boundary at all; a driver whose app holds it so
lists the tag in `refuses`. Logseq, Tine and Dynalist refuse all three, Roam and WorkFlowy the
heading's and the task's; SiYuan and BlockNote, whose blocks have these types, none.

## Adding an app

An app is a directory here with a `driver.ts` exporting `driver` ([`driver.ts`](driver.ts) has the
interface): its URL; its `model` (`block` for a block app, `text` for a Markdown editor), which
says what `load` is given and `read` returns; `launch`, for an app that isn't a web page (it starts the app and hands
over its window, instead of a tab in the shared browser: Obsidian's), or for an app that isn't a page
at all, a `session` the runner plays its keys, typing and clipboard through (Emacs's: a call returns
once the app is done, so there is nothing to settle); `serve`, for an app served from
this machine (it starts the app's server before its tab loads, left running for the next run and
recorded so that `--stop` stops it: SiYuan's kernel); `open` (load it, wait until it takes keys, return its version); `load` (a fresh
document with the starting state, the caret placed); `read` (the state back, in canonical form);
the keys for each action (`select…` motions are the same keys with Shift), and `act` for those
emulated with keys (Logseq has no key for the document's start: Up until the caret stops, then
Home); what it can't hold (`refuses`, `holds`); how it behaves where ourus has an option
(`behaves`), and which of those options it has settings for (`settings`, set by `configure` before a
test that needs other values than the last one); and its busy signal for settling (`idle.busy`, a JavaScript expression). Keep notes on
the app's quirks in its `README.md`. Free live demos are used where there are any; a copy on disk is
for apps behind a login.

## Files

| | |
| --- | --- |
| `run.ts` | the command line, playing, comparing, the report; several apps side by side (a run of each, in parallel, and the table of their verdicts) |
| `sxs.md` | the last run of every app, side by side: every example's verdict in each, linking each app's report |
| `<app>/sxs.md` | each app's last full run, beside its driver |
| `proxy.ts` | the caching proxy, its rules for apps, the blocked hosts |
| `lib/` | what the runner and the drivers share: |
| `lib/plan.ts` | choosing tests, adapting them to an app, skip reasons |
| `lib/outline.ts` | spec buffers as outlines of blocks, drawing them, comparing them |
| `lib/text.ts` | spec buffers as Markdown text, for text editors |
| `lib/idle.ts` | the init script that tells when a page has settled |
| `lib/browser.ts` | the shared proxy, browser and app pages |
| `lib/desktop.ts` | for a driver that starts a desktop app: a free port, an Xvfb, a run's lock |
| `lib/system.ts` | the system's packages a run needs, installed by apt when missing |
| `lib/driver.ts` | what a driver provides |
| `lib/outline.test.ts` | the projection, offline (part of `npm test`) |
| `logseq/` | Logseq's driver, notes |
| `workflowy/` | WorkFlowy's driver, proxy rules, notes |
| `roam/` | Roam's driver, proxy rules (its per-test calls answered locally), notes |
| `silverbullet/` | SilverBullet's driver, proxy rules (the read-only demo made editable, never written to), notes |
| `dynalist/` | Dynalist's driver, proxy rules (its POSTs cached by body, its beacons answered), notes |
| `tine/` | Tine's driver, proxy rules (its published guide made editable, its store named for the driver), notes |
| `siyuan/` | SiYuan's driver, its kernel (`kernel.ts`: the release downloaded and served on 127.0.0.1), the driver's plugin (`plugin/`), notes |
| `blocknote/` | BlockNote's driver (its site's minimal example, the editor found through React), proxy rules (its error reports answered), notes |
| `emacs-markdown/` | Emacs with markdown-mode: its driver, Emacs on a terminal of tmux's driven through its server (`emacs.ts`, a session), notes |
| `obsidian/` | Obsidian's driver for any setup of it (`obsidian.ts`: the desktop app, started by the driver), the bare one in Source mode, its indentation as tabs and back tested offline (`obsidian.test.ts`, part of `npm test`), notes |
| `obsidian-lp/` | bare Obsidian in Live Preview (`obsidian/` is Source mode): its setup, notes |
| `obsidian-outliner/` | Obsidian with the Outliner plugin: its setup, notes |
| `obsidian-true-outliner/` | Obsidian with true-outliner: its setup, notes |

`.sxs/` (git-ignored, at the root of the checkout; `OURUS_SXS_DIR` moves it) holds the
HTTP cache (`http/`; delete a file to refetch it, or the directory to start cold), the proxy's
certificate and log, the last table (`sxs.md`, `sxs-heatmap.svg`), and a directory per app (`<app>/`):
its last run (`sxs.md`, `sxs.json`, `sxs.log`), what it did in each spec file's examples
(`<file>.json`), its browser's profile (`chromium/`) and log
(`chromium.log`), the lock of the run that holds it (`<app>.lock`), the pid of the server its driver started (`server.pid`), what
the app needs fetched (`files/`: SiYuan's release, Obsidian's app and plugins, markdown-mode), and the
app's own state (SiYuan's workspace, an Obsidian setup's vault and log, ...).
