# Running the SxS

How to run the SxS (`run.ts`) and how it works, for whoever runs it, debugs a run or writes a
driver; [`README.md`](README.md) is the overview and the results. The code is the authority: `run.ts` and
the modules of `lib/` say the same at more length.

## What to run after a change

**Rejudge first; run apps only for what it lists as Not run.** A full run takes 15 minutes; a
rejudge takes seconds and runs no app.

1. **`node sxs/run.ts --rejudge`** after any change to ourus's code or the spec. **It runs no app,
   but reruns ourus on every case**, with the code as it is now: the table's ourus column, and each
   app's plan (which cases it runs, under the values its driver declares). Then it judges what each
   app did in its last runs against the spec as it is now.
   It says how many cases ourus passes and names any it fails: the apps are judged against the spec's
   drawings, which are what ourus does only where it passes them (`npm test` first).
2. **Then run the apps on what it lists as Not run** (`?` in the table, "Not run" in an app's report):
   a new case, one whose start, clipboard, options or actions changed, or one an app now runs that it
   skipped before (ourus's code changed what the case does under the app's declared values, which a
   change to `src/` alone can do, in a file nobody edited). Run those cases' files for those apps,
   `node sxs/run.ts tine,roam enter.md placeholders.md`, then rejudge again. A whole file is the unit:
   a narrower selector writes `.partial` files, which reports and rejudging don't read.
3. **Compare** with the last committed judgment: `node sxs/run.ts --compare` (or `--compare=REF`, a
   commit of `.sxs`; any apps and selectors narrow it) sets each app's `sxs.json` beside the one at
   REF, case by case: per app, the agreement on the cases both have; how verdicts moved; every cell
   that got worse; and the cells only the current judgment has (new cases, or ones an app runs now and
   skipped then), with the camps against ourus in them (two apps or more reaching the same state at a
   step, setups of one app once). A case is its name without its file, so renamed files and cases
   moved between files compare. It runs no app.
4. **A full run, `node sxs/run.ts all`**, only where what an app is given or how it is driven
   changed: an app's new version, a driver's keys, setup or declarations (`behaves`, `settings`), or
   the projection in `lib/` (how a buffer is typed into an app, or a state read back). A driver's
   change wants that app's full run, not every app's.

Where the results are: `.sxs/results/<app>/<file>.json` is what the app did in its last run of each
file, its states and the verdicts that run gave (rejudging doesn't rewrite them);
`.sxs/results/<app>/sxs.json`, the reports and the table are the current judgment. Compare two runs
by those (`--compare`, above), not by the per-file verdicts.

## Running it

From the root of the checkout, after `npm install`. It needs Chromium (`/usr/bin/chromium`, or
`CHROMIUM`), `openssl`, and the network on a first run (pages are cached after); Obsidian needs Xvfb,
Emacs `emacs-nox` and `tmux`. On Debian, as root or with `sudo`, a run installs what's missing.

```
node sxs/run.ts logseq                    # one app, every case; writes logseq.md
node sxs/run.ts logseq indent.md#indent3  # one case (or a file, or any part of a name)
node sxs/run.ts logseq --list             # what would run and what is skipped, and why; no browser
node sxs/run.ts all                       # every app (about 15 minutes); writes README.md
node sxs/run.ts --rejudge                 # replay ourus, judge the stored runs again; no app, seconds
node sxs/run.ts --stop                    # stop the proxy, browsers and servers a run left running
```

The first run starts a caching proxy and a pool of headless browsers and leaves them running, so the
next run of a case takes under a second. One machine per `.sxs/`: two containers on one checkout
break each other's browsers, so `--stop` first if another session left them running. The stored
runs, `.sxs/results/<app>/<file>.json`, have each step's buffers, ourus's and the app's, as data.

## Probing

To see what the apps do on a shape no case draws, without writing a case or a result,
[`probe.ts`](probe.ts) (`npm run probe`) plays a buffer and actions on ourus and on the apps named
first, as `run.ts` names them, in parallel (each a `run.ts --probe` of its own, `--keep-windows`, so a
probe after another loads no app). It prints ourus's states first, then each app as its run ends: its
verdict, its long id and seconds, then, aligned, the state it is compared with where that isn't
ourus's own result (`= ourus as blocks`, `against ourus, under …` for its declared values), or why it
was skipped; then its state as it is. A state is
held by a bracket on the left (`⎡ ⎢ ⎣`, `[` for one line). An ourus state other than ourus's own that
an app doesn't agree with is printed once before it (`= ourus as blocks`), unless an agreeing app
showed it. Coloured on a terminal. With no
apps (the first argument a buffer: a caret, a selection, a space or a line break in it), ourus alone:

```
node sxs/probe.ts '- one⏎  ┃two' shiftEnter deleteContentBackward        # ourus alone, at once
node sxs/probe.ts '- one⏎  |two' shiftEnter                              # | for the caret, on the command line
node sxs/probe.ts all '- one⏎  ┃two' shiftEnter deleteContentBackward    # and every app
node sxs/probe.ts block --file=probes.md     # several probes in the spec's format, one start each
node sxs/probe.ts block probes.md            # the same: an .md file that exists
node sxs/probe.ts all --case=Enter28         # a spec case's start and actions
node sxs/probe.ts all Enter28                # the same: a case's ID alone (IDs are unique across the spec)
```

Options are the case's (`--flavor=obsidian`, `--clipboard=`, `--tags=free-form`); `--spec` prints the
probe as a case's blocks, ourus's states drawn, to paste into a spec file; `--json` everything as
data. Each run's probe file, logs and runs are kept in `.sxs/probe/<time>/`. With the pool warm, all 18
setups take some 25 seconds.

## The command line

The first argument is the app: a directory here with a `driver.ts` (`logseq`), or its two capitals
(`LO`, its driver's `shortId`, any case); several, comma-separated (`LO,RR`); `all`; a group
(`block`, `text`, `outliners` for the block apps without paragraphs, `free` for those with them); and
`-` before one leaves it out (`all,-RN,-RB`), as [`lib/apps.ts`](lib/apps.ts) resolves them. Then any number of selectors, which
pick the examples matching any of them; none picks every example. Options:

| option | what it does |
| --- | --- |
| `-v`, `--verbose` | print every example's verdict, not only the disagreements, and every URL the proxy saw |
| `--list` | print what would run (with how each example was adapted) and what is skipped and why; no browser |
| `--strict` | run only original outlines: examples whose buffers needed no adapting |
| `--ignore-options` | play the examples an option would skip too (a value the app lacks, or one it has its own of), each against ourus with its options, into `.partial` files: to check what a driver declares (`behaves`); one skipped for the app's own value that agrees says the declaration is wrong |
| `--repeat=N` | run each example N times and report the ones whose outcome varies |
| `--headed` | show the browser (one of the run's own, not the shared one) |
| `--slow=MS` | pause after every action, on top of settling: to watch, or to rule timing out |
| `--pace=MS` | keys at least MS apart (100 by default, a typist's pace; 0, as fast as the app settles): to see what an app's timing does |
| `--workers=N` | N workers side by side, each in a browser of the pool of its own (or a window in an Obsidian of the driver's pool); by default one per 30 examples, at most 6 (the pool's browsers) and the driver's `parallel` (1 by default for one that starts its app) |
| `--cache=MODE` | how the proxy uses its cache: `use` (the default) serves what it has and fetches and keeps the rest; `offline` serves only what it has and reaches no network, a miss and anything that would go live (other methods, a rule's live requests, WebSockets) failing (504), and writes nothing to the cache, which may then be read-only (`OURUS_SXS_HTTP`), after a run online made it and the proxy's certificate; `refresh` fetches everything anew, once per proxy run, and keeps it |
| `--fresh` | load the app anew, rather than take over the page a run that died left loaded |
| `--keep-windows` | leave the app's window loaded when the run ends, for the next run to take over ([`probe.ts`](probe.ts) passes it: a probe after another loads nothing); by default the window closes. A browser's windows are its runs' records (`<app>.window`), so a run takes the browser holding its app's window without asking any browser |
| `--no-report` | don't copy the report into `<app>.md` (nor the table into `README.md`) |
| `--timing` | print how long the app took to settle after each action, and what it waited on last |
| `--plain-clipboard` | give the app the clipboard's Markdown as plain text only, without its HTML rendering |
| `--json=FILE` | write the run as data to FILE too, as `.sxs/results/<app>/sxs.json` has it |
| `--rejudge` | run no app: replay ourus on every case, judge what it did in its last runs (`.sxs/results/<app>/<file>.json`) against the spec as it is now, and write its report and run as data again (with several apps, the table too); an example its runs didn't play as the spec has it now is left out, under "Not run" (`?` in the table), wanting a run |
| `--compare[=REF]` | run no app: the current judgment (each app's `sxs.json`) beside the one committed at REF in `.sxs` (HEAD by default), case by case ([`lib/compare.ts`](lib/compare.ts)); `-v` also lists the cells that got better, and every new one |
| `--probe=FILE` | play the cases of a spec-format file anywhere (not `spec/`), and write the run to `--json`'s file alone: no results kept, no report; [`probe.ts`](probe.ts) runs an app so, a process each |
| `--stop` | stop the shared proxy, the apps' browsers and the servers drivers started, and nothing else |

The proxy alone (`node sxs/proxy.ts [--port=8899] [--host=127.0.0.1] [--cache=MODE] [--quiet]`, or
`npm run sxs:proxy` for `--cache=offline`; in a container with its port published, `--host=0.0.0.0`,
as the published port reaches the container's interface, not its loopback)
prints, as it starts on a terminal, where each app's editor opens in a browser through it (a driver's `url`) and the Chromium command line that browses through it with a profile of its own
(`--proxy-server`, `--ignore-certificate-errors`): for looking at an app as the cache has it. A run
reuses a proxy started so, if its sources and cache mode are a run's (else it restarts it); stop the
shared one first (`node sxs/run.ts --stop`) to start one by hand on its port.

## What a run writes

A run prints each example that doesn't agree, with what ourus expected and what the app did, drawn as
spec buffers. It ends with the counts, the skips by reason, and what the proxy fetched, passed through
live and blocked, per host. Every run writes its report and its run as data to the app's results,
`.sxs/results/<app>.md` and `<app>/sxs.json`, not checked in (`.sxs/results/` is laid out as this
directory, one level deeper: a report's links out of it one `../` more); a run of every example (no
selector, no `--strict`) writes the report to `<app>.md` here too,
which is: diff it to see what changed since the last run. A run of some of the examples (selectors,
`--strict`) writes `sxs.partial.md` and `sxs.partial.json` instead, and a run of several apps so its
table, `sxs.partial.md`: the full run's files stay as they were.

Each run also keeps what the app did in each example, per spec file (`.sxs/results/<app>/indent.json`
for `indent.md`, `FileRun` in `run.ts`): a run of every example of a file writes it whole; a run of some
of them writes those alone to `indent.partial.json`, and the file's own stays as the last full run left
it. Reports and regenerating read the files' own only.
After a change to the spec or to ourus, `run.ts --rejudge` writes every report and the table again
from them in seconds, without running an app: an example is judged again from the states the app
reached in it, if its last run played it as the spec has it now (the same start, clipboard and
settings, and the same actions in each step, or in its first ones where steps were added since);
the rest want a run of their files, as `run.ts <app> <file>.md` (a narrower selector's run is a
`.partial` one, which it doesn't read). On the spec its runs were made with, it gives
every verdict the runs gave.

**Several apps** (`logseq,dynalist`, or `all`) run side by side (`run.ts`, "several apps"): a run of the
above for each, in a process of its own, all at once (their workers as the pools have room), each with its output
in `.sxs/<app>/sxs.log` and its report and run as data beside it, as alone. The proxy is
started first, so the runs don't race to start it; each app has a browser of its own. A line per app says its
counts as it finishes; then a table gives every example's verdict in each app, the apps by their short ids
(`LO`, `RR`) and by how many examples they disagree on, the fewest first, in every table, a row per spec file
and under it its cases by their ids (`ok`, `D`, `C`, `S`, `ERROR`, `-` for skipped; in `README.md`,
✓, ✗, C, S, E, –, explained in its legend): every row for a few examples or with `-v`, else the rows where
the apps don't all agree. The table is written too, as Markdown, to `.sxs/results/README.md` with its
heatmap, `heatmap.svg` (how alike two apps did in the examples both ran alike, both as written or both adapted the same way:
the same result 1, the same but for the caret or spaces ½; ourus among them, as its own runs of the examples have it, `test/spec-run.ts`); a run of every app on the whole spec copies both here, into [`README.md`](README.md) below its introduction (unless an app failed, which would lose its column; an app with no verdicts, wanting a session or with no run to regenerate from, is left out of the table),
checked in, each app's column linking its report (which its run copies here, as a full run does alone). Apps run side by side compete for the
machine, so each takes longer, but their verdicts are those of a run alone: compared example by
example, they were, once each app had its own browser and the idle script waited for clipboard
reads (`12-sxs.md` §20 has how it went wrong before).

In `README.md` the summary gives each app's id (two capitals, its driver's `shortId`: `LO` for Logseq (OG)) and its
model (`block` or `text`) after its name; the tables below it head an app's column with its id, linking
its report, with its name as the link's title. In its table of
examples a bold row names each spec file, and each example is its ID, at most 20 characters and
`…`, linking to it in the spec, with its whole ID as the link's title (a tooltip); after the apps come the count of apps that disagree on it and its
rank, and a file's total row gives the examples each app disagrees on and their sum. A verdict in brackets, `(✗)`, is
a difference in an example adapted for that app (its buffers projected onto blocks), so it compares
those, not the buffers, with what was adapted as its tooltip (`adapted: heading`); an adapted
example that agrees is a plain ✓. `run.ts --rejudge` writes it again from the runs'
data, without running anything: after a change to the table's layout or the spec, or after rerunning
only some apps or examples; its `elapsed_s` is then the longest app's run.

After the summary, two tables sum the disagreements, by spec file (the most first, then the total)
and by tag (the ranks in their order, then the other tags, the most first; a case counts under each
of its tags): each one's examples, the apps' runs of them, the disagreements among those runs (and
their share), the block apps' disagreements among them, and each app's.

The first run of an app starts the proxy and a headless Chromium of a pool, and leaves them running
for the next runs, with the app loaded in a window (`.sxs/proxy.log` and `.sxs/chromium/<n>/chromium.log`
say what they did).
Later runs reuse them, so a run of one example takes under a second. Stop them all with `--stop`.

## What happens in a run

1. **Choosing and adapting** ([`lib/plan.ts`](lib/plan.ts)). Each selected example is adapted to the app,
   or skipped with a reason: an action the app has no key for, an option the app doesn't have
   and can't be set to (`outdent: logical`), a tag it skips (below), a buffer it can't hold (a quote, for a block app), a caret with no place in
   it. Examples that adapt to the same thing run once. **Where the app's declared values**
   (`behaves`) change what ourus does in an example (an outliner that keeps the space at a split,
   `enterSplitSpace: start`, on a case drawn under the default), the app is judged against ourus
   replayed with those values instead of the example's drawings: `under <option>: <value>` among
   what was adapted, so the cell shows in parentheses when it differs, and the app's report lists
   it. The spec draws the defaults and a case for a value where it acts on a shape of its own; the
   replay covers the rest. (Where only the blocks the app is given, an adapted start, would play
   otherwise under the app's value, the example is still skipped: `…, as blocks`.)
2. **The proxy** ([`proxy.ts`](proxy.ts)), a caching forward proxy the browser reaches every site
   through. It intercepts HTTPS with one self-signed certificate (the browser ignores certificate
   errors), so pages keep their real origins. GET and HEAD go to disk on first fetch, under
   `.sxs/http/<host>/` (`OURUS_SXS_HTTP` moves it alone), and are served from there after (`--cache`
   says how: above); other methods go live; analytics,
   embedded video and the browser's own background traffic are blocked. An app's
   `<app>/proxy.ts` can say more: cache keys, stubs (which can also refuse a WebSocket, or serve an
   app from a copy on disk with `fromDirectory`), patches applied on the way to the browser (the cache keeps what the
   server sent). Every request is logged in `.sxs/proxy.log`, blocked
   ones too; a run ends with what it fetched, passed through live, and blocked, per
   host, and with `-v`, every URL.
3. **The browser and the app** ([`lib/browser.ts`](lib/browser.ts)). The proxy, and a pool of headless
   Chromiums (`.sxs/chromium/<n>/`: its profile, its log, its locks), are shared between runs: started
   by the first run that needs them, left running, and restarted when their code or flags change. Each
   app's page is a window of its own in one of them, one in a browser, closed at the run's end (a
   window is some 25 tasks; the browser stays up). One a run that died left loaded, the next run of that
   app takes over instead of loading the app again, if it was loaded from the driver's URL with the
   current `idle.ts` (an older one stays in a page until it reloads) and still loads and reads a
   document. The pool is fixed (`BROWSERS`, `WINDOWS` in `lib/browser.ts`): four browsers, each with at
   most five app windows (a run's, or an idle one a dead run left, the longest idle closing for a run
   that needs its place), so that the pool, full, holds under the container's cap on tasks. Runs spread
   over the browsers (an idle one first, a new one while fewer than four run), and with every browser
   full a worker waits for room. A driver may keep its workers to the even-numbered browsers or the odd
   ones (`Driver.browsers`: RemNote's two setups, so that each one's knowledge base, in a profile's
   storage, is its own). What a browser has one of is held in turn: its clipboard (a headless browser's own, not
   the desktop's), which an example that uses it holds (`clipboard.lock`), granting the permissions to
   read it again as it takes it: a DevTools connection's end resets the permissions it granted for
   every page of its browser, so another run's end would take them (a plain paste then reads nothing),
   and a run disconnects only holding its browser's clipboard; each window's page is in
   front of its own (a tab behind another gets no animation frames, and its Clipboard API drops a write
   and reads nothing, without an error), and has the focus, emulated. A window is made at the
   viewport's size (1280×900: `Target.createTarget` takes it), and a reused one has the viewport set
   again: an emulated viewport ends with the DevTools connection that set it, and every reused window
   had run at headless Chromium's 780 pixels, Dynalist laying itself out for a phone there. **One
   machine per `.sxs/`**: two containers on one checkout share the profiles but not their process
   tables, `/run` (the records) or hostnames, so one's Chromium takes the other's profile lock for a
   stale one and starts on a profile in use, and the browser's storage hangs (IndexedDB, Web Locks,
   service workers); a SiYuan kernel of the other's holds its workspace's lock, and every kernel here
   exits 24. Run the pool from one container, or give each its own directory and proxy
   (`OURUS_SXS_DIR`, `OURUS_PROXY_PORT`). One run of an app at a time
   (`.sxs/<app>/<app>.lock`): another run of it while one goes fails. A run's workers (`--workers`)
   are each in a browser of their own (`<app>.lock` among the browser's records), an app's storage
   (localStorage, IndexedDB) being its origin's in a profile. A pool, not a browser per app as
   at first: a browser is some 110 tasks (processes and threads) before any page, an app's window some
   25, and a container's cap on tasks (`pids.max`, 2048 here) didn't hold 16 browsers. `run.ts all`
   starts every app at once; each worker of a run joins it as it gets a place in a pool (the first waits
   as long as it takes, the others only while examples are left), so the pools stay full: four
   Chromiums with five windows each (some 950 tasks; six with three each hit the cap, the browsers'
   threads failing to start: 2026-10-25), and two Obsidians beside them (some 400), four
   in a run of Obsidian's setups only (`OURUS_SXS_OBSIDIANS`, which `run.ts` sets for a run of several
   apps; `obsidian/README.md`). An Obsidian stops with the last window a run has in it. A run
   watches the cap while its apps play (`watchTasks` in `lib/system.ts`: `pids.max`, `pids.current`,
   `pids.events` once a second): it warns as the cap refuses tasks, a browser's thread then failing
   to start and windows, browsers and runs crashing or hanging, and says at the end how often it did
   and how many tasks ran at most (a run of several apps in the terminal, each app's run in its log).
4. **Playing** ([`run.ts`](run.ts)). For each example the driver loads the starting state into a
   fresh document (through whatever the app offers: a plugin API, its stores), and the runner checks
   that the app holds it as given, since an app that rewrites its input (trimming, normalizing)
   would make the test meaningless. Then the actions are played as a user plays them, with the app's
   keys; text is typed a character at a time; pastes put the clipboard first: exactly the formats
   the case gives (its `clipboard`, keyed by MIME type: [the spec's README](../spec/README.md)),
   through a copy event (`setData` takes any type, and a real Ctrl-V's paste event has them all), and
   an app's report shows them so, a table of the clipboard given to the app above the command, a
   column per MIME type. Emacs's kill ring holds the text alone. `--plain-clipboard` gives the app
   `text/plain` alone. (Runs from before October 2026 had the case's Markdown as `text/plain` and,
   where it had structure, its commonmark rendering as `text/html`, a copy no source makes;
   they are read back so, `startClipboard` and
   [`lib/clipboard.ts`](lib/clipboard.ts).) After every key the
   runner **waits for the app to settle** ([`lib/idle.ts`](lib/idle.ts)), never for a fixed time: an init
   script tracks the page's short timers and animation frames until they fire or are cleared, and
   its DOM mutations; the page is idle when none is pending and nothing changed for 40 ms, and the
   driver's own busy signal is off. An app whose busy signal stays on with nothing else happening
   is reported stuck. And the keys come at a typist's pace (`PACE`, at least 100 ms from one to the
   next): an app that tells one undo step from the next by the time between edits sees the pace it is
   typed at, and settling alone, some 45 ms, was right at Tana's 50 ms, so what one undo took back was
   the machine's timing. Not for a session (Emacs), whose calls return once the app is done. In an
   example that undoes or redoes, the steps come a user's pause apart (and an undo after other actions
   of its step): 750 ms (`UNDO_GAP`, for apps that group an undo by the time between edits), then
   until the timers the app had pending have fired (the idle script's `drain`, up to 2 s: a save the
   app put off, Logseq's 500 ms after the last input, WorkFlowy's), then settled; else what an undo
   took back was the machine's load (Logseq's late save stored the undone text again).
5. **Comparing** ([`lib/block.ts`](lib/block.ts)). A block app's state is an outline: blocks with a
   depth and a text, the caret's block and offsets. The spec's buffers are projected onto the same
   form with ourus's own parser (every outline node a block holding its own text, in canonical
   Markdown: `[ ] ` for a task, `## ` for a heading, `\n` between lines), and compared block for
   block, a code block's closing fence at a block's end optional (a block ends its code: ourus closes
   the fences it writes, Logseq and Tine leave them open). Verdicts: `agree`; `caret` (blocks agree, the caret doesn't); `whitespace` (they differ in
   spaces next to line breaks only; a text app's text, in spaces before line breaks, or in spaces
   anywhere that leave the document as ourus reads it the same, its code byte for byte); `disagree` (the blocks differ: their text, their nesting, how
   many there are); `error` (the run failed, or the app didn't hold the
   starting state). No caret is compared where ourus's has no place in a block, nor after an action
   that leaves an app no text focus (`Driver.noCaretAfter`: a deleted block selection), where the app
   has neither a caret nor selected blocks: the outline alone. Where such an action has more after
   it that needs a caret (typing; undo and redo need none), the app's state is read right after it,
   and an app left with no focus skips the example there ("no text focus after …"), kept skipped by a
   rejudge (`skippedPlaying` in the file's run); an app that kept a caret plays on.

   A text editor's state is Markdown text ([`lib/text.ts`](lib/text.ts), the `text` model, for SilverBullet
   and the like): the spec's buffers are taken as written, a placeholder (`◌`) dropped since it
   marks a place rather than text, and the app's text is compared with them as drawn, caret included
   (`whitespace`: they differ only in spaces ending lines). Nothing is projected, so quotes, blank
   lines and frontmatter run too.

   A step's clipboard is its `text/plain`, read back after the step (a test that uses the clipboard
   and gives none starts with an empty one, so a copy of nothing reads as nothing): `whitespace` where
   it is written otherwise but reads as the same outline (an app's tabs for indentation, no final line
   break), the same items in lists of the same kind; else `disagree`. A copy or cut at a caret, which
   ourus takes as the node's (`copyAtCaret: node`), is played on an app that copies nothing there
   (`copyAtCaret: host`) on the node selected its way first, as it selects a block (`selectSubtree`:
   Escape in Logseq, Tine and Roam, Shift+Up in Athens), and judged against ourus's copy.
6. **Reporting**. Disagreements are printed with both outcomes drawn; a run of every example writes
   `<app>.md`: the app (by its directory's name), its version, its URL and the command as
   frontmatter, the counts, then the original and the adapted cases in sections of their own. Each
   has a subsection per verdict, in the order disagree, whitespace, caret, error, then agree; the
   examples in each are numbered, each heading a link to the example in the spec. An example of one
   step has its command, then the start, the app's outcome and ourus's side by side in an HTML table
   (for an adapted example a row as blocks and a row as the spec writes them); an example of more
   steps has its start, then each command, with the outcomes side by side where they differ. Last,
   the skips by reason, numbered too. Beside it, `.sxs/results/<app>/sxs.json` has the same run as data, for
   scripts (`AppRun` in `run.ts`): the frontmatter's fields and the counts, then every example in the
   spec's order, each with its file, anchor and line, verdict, adaptations, options, starting
   clipboard and start, and each step's actions, verdict, and ourus's state and the app's, drawn as
   spec buffers in the app's model (for a text app also projected onto blocks, as `blocks`, to set
   beside a block app's; the spec's own drawing as `written` where it differs); then every skip,
   with its reason.

An example that errors keeps its error's first line in the report; `OURUS_SXS_DEBUG=1` prints its
whole stack in the app's log (a probe's log is in `.sxs/probe/<time>/`), which tells a load or a read
of the driver's (`load` in its stack) from an action that failed in the app.

## Original and adapted examples

**Original and adapted.** An example whose buffers are `-` outlines as written is *original*: the comparison
means exactly what it says. The others are *adapted*: a paragraph or a heading stood in for a block,
blank lines were dropped, a numbered item became a plain one (where the app has no numbered blocks:
a driver that loads and reads them declares `ordered`, and an ordered item is then a block whose
canonical text starts with its number, `1. x`, a number that is text kept escaped, `1\. x`; SiYuan,
BlockNote, both Logseqs, Roam, WorkFlowy, Dynalist, RemNote and Tana number blocks so). Their notes say how. ourus gives these
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
the two models'. But for one with a form for it (`Driver.freeForm`: RemNote's documents without
bullets, `remnote/`; BlockNote's and SiYuan's blocks, a paragraph or a heading being a block of its
own as a list item is): its blocks are items or free blocks (a paragraph, a heading, an atom outside
every list, `Block.free`, drawn `¶`), the projection keeps which (`ProjectOptions.freeForm`; a blank
line next to a free block is free form's boundary, no adaptation), and the comparison tells them
apart. What a free block owns in ourus's outline (a heading its section, a paragraph the list right
after it) these apps hold beside it, as Markdown does: a driver loads it so and nests it back as it
reads (`liftOwned`, `ownBlocks` in `lib/block.ts`; RemNote's `lift`, `own`). Played as bullets
instead, BlockNote's paragraphs had been compared by its list behavior, and its commonest move,
making an item a paragraph, drew as nothing done. A `markup-` tag (`markup-heading`,
`markup-task`, `markup-fence`) is a step at markup an app may hold as text, where it edits a
character, or as an attribute, where there is no boundary at all; a driver whose app holds it so
lists the tag in `refuses`. Both Logseqs, Tine, RemNote and Athens refuse all three, Roam all three
(and its code blocks, a gap), BlockNote `markup-fence`; Dynalist, WorkFlowy, SiYuan and Tana none: a
caret where the markup has no text is declined by `holds`, and a join or split at it was found
playable, the app's to show (59 cases in Dynalist, 28 in Tana, 12 in SiYuan).

## Writing a driver

An app is a directory here with a `driver.ts`: how to open the app, load a document, read it back, and
which keys are which. [`lib/driver.ts`](lib/driver.ts) has the interface; `silverbullet/` is a small
one to start from for a Markdown editor, `dynalist/` for a block outliner. Keep notes on the app's
quirks in its `README.md`. In full:

An app is a directory here with a `driver.ts` exporting `driver` ([`lib/driver.ts`](lib/driver.ts) has the
interface): its `shortId`, two capitals no other app has, its column's heading in `README.md` and its name on
the command line; its `longId`, its directory's name; its `displayName`, in reports (`LO`, `logseq`,
`Logseq (OG)`); its URL; its `model` (`block` for a block app, `text` for a Markdown editor), which
says what `load` is given and `read` returns; `launch`, for an app that isn't a web page (it starts the app and hands
over its window, instead of a tab in the shared browser: Obsidian's), or for an app that isn't a page
at all, a `session` the runner plays its keys, typing and clipboard through (Emacs's: a call returns
once the app is done, so there is nothing to settle); `open` (load it, wait until it takes keys, return its version; for an app served from this machine,
its server started first, left running for the next run and recorded, `recordServer`, so that `--stop`
stops it: SiYuan's kernels, one for each worker, in `.sxs/siyuan/<n>/`); `load` (a fresh
document with the starting state, the caret placed); `read` (the state back, in canonical form);
the keys for each action (`select…` motions are the same keys with Shift), and `act` for those
emulated with keys (Logseq has no key for the document's start: Up until the caret stops, then
Home; `selectSubtree`, the block at the caret selected with its children, which `deleteSubtree`
then deletes); what it can't hold (`refuses`, `holds`); how it behaves where ourus has an option
(`behaves`), and which of those options it has settings for (`settings`, set by `configure` before a
test that needs other values than the last one); its busy signal for settling (`idle.busy`, a JavaScript expression);
how many of a run's workers it takes (`parallel`: 1 by default for an app it starts, whose state outside
the browser workers would share; SiYuan's 4, a kernel each; any number by default for a
page of the pool), the name its window is held by in the pool where setups of one app mustn't share a
browser (`pool`: RemNote's two, as two RemNote tabs break each other), whether it tells a paragraph
from an item (`freeForm`, above), and what it knows of a
test kept per page (`perPage` in `lib/driver.ts`: the page it made for the test, to remove at the next),
as each worker has a page of its own; for an app behind a login,
`login`, the environment variable a signed-in session is given in (`open` throws `LoginRequired` from
[`lib/login.ts`](lib/login.ts) without one, and the run stops with exit code 3, saying how to give it; the
app's browser profile keeps it for later runs; a run of several apps leaves such an app out). Keep notes on
the app's quirks in its `README.md`. Free live demos are used where there are any; a copy on disk is
for apps behind a login.

## Files

| | |
| --- | --- |
| `run.ts` | the command line, playing, comparing, the report; several apps side by side (a run of each, in parallel, and the table of their verdicts) |
| `probe.ts` | a buffer and actions on ourus and the apps, without a case or a result ("Probing") |
| `README.md` | what the SxS is, then the last run of every app, side by side: every example's verdict in each, linking each app's report; the table is written below the README's introduction (all above its `## Summary`), which a run keeps as it is |
| `<app>.md` | each app's last full run, beside its driver's directory |
| `proxy.ts` | the caching proxy, its rules for apps, the blocked hosts |
| `lib/` | what the runner and the drivers share: |
| `lib/plan.ts` | choosing tests, adapting them to an app, skip reasons |
| `lib/compare.ts` | two judgments side by side (`--compare`) |
| `lib/apps.ts` | the apps here and the names a command line picks them by |
| `lib/block.ts` | spec buffers as outlines of blocks, drawing them, comparing them |
| `lib/text.ts` | spec buffers as Markdown text, for text editors |
| `lib/idle.ts` | the init script that tells when a page has settled |
| `lib/browser.ts` | the shared proxy, browser and app pages |
| `lib/desktop.ts` | for a driver that starts a desktop app: a free port, an Xvfb, a run's lock |
| `lib/system.ts` | the system's packages a run needs, installed by apt when missing |
| `lib/driver.ts` | what a driver provides |
| `lib/block.test.ts` | the projection, offline (part of `npm test`) |
| `logseq/` | Logseq's driver, for both its apps (`logseqDriver`, a flavor deciding how a block's text is held), with its file-based app's (OG) setup, proxy rules (a function named in its bundle that empties the undo history), notes |
| `logseq-db/` | Logseq's database version's setup of that driver (a task, a number, a heading as properties; code and math blocks), proxy rules (the app's own history clear named in its bundle), notes |
| `workflowy/` | WorkFlowy's driver, proxy rules, notes |
| `roam/` | Roam's driver, proxy rules (its per-test calls answered locally), notes |
| `silverbullet/` | SilverBullet's driver, proxy rules (the read-only demo made editable, never written to), notes |
| `dynalist/` | Dynalist's driver, proxy rules (its POSTs cached by body, its beacons answered), notes |
| `tine/` | Tine's driver, proxy rules (its published guide made editable, its store named for the driver), notes |
| `siyuan/` | SiYuan's driver, its kernel (`kernel.ts`: the release downloaded and served on 127.0.0.1), the driver's plugin (`plugin/`), notes |
| `athens/` | Athens's driver (its archived web build; its graph reached through names the proxy adds to its bundle), proxy rules (the patch), notes |
| `remnote/` | RemNote's driver for either setup of it (its guest mode, in the test mode RemNote's own Playwright tests use: no backend, rems made as its fixtures make them), its own setup with documents that hide their bullets (free-form Markdown's paragraphs and lists), mapped to and from ourus's outline tested offline (`remnote.test.ts`), notes |
| `remnote-bl/` | RemNote with its documents' bullets, every rem an item: its setup, notes |
| `tana/` | Tana Outliner's driver (its UI-test page, `/tests`: no account, no server, nodes made through its model), proxy rules (its telemetry answered), notes |
| `blocknote/` | BlockNote's driver (its site's minimal example, the editor found through React), proxy rules (its error reports answered), notes |
| `emacs-markdown/` | Emacs with markdown-mode: its driver, Emacs on a terminal of tmux's driven through its server (`emacs.ts`, a session), notes |
| `obsidian/` | Obsidian's driver for any setup of it (`obsidian.ts`: the desktop app, started by the driver), the bare one in Source mode, its indentation as tabs and back tested offline (`obsidian.test.ts`, part of `npm test`), notes |
| `obsidian-lp/` | bare Obsidian in Live Preview (`obsidian/` is Source mode): its setup, notes |
| `obsidian-outliner/` | Obsidian with the Outliner plugin: its setup, notes |
| `obsidian-true-outliner/` | Obsidian with true-outliner: its setup, notes |

`.sxs/` (git-ignored, at the root of the checkout; `OURUS_SXS_DIR` moves it) holds the
HTTP cache (`http/`; delete a file to refetch it, or the directory to start cold), the proxy's
certificate and log, the results (`results/`, as `sxs/` has its own: the last table, `README.md` and
`heatmap.svg`, and each app's last run, `<app>.md` and `<app>/sxs.json`, and what it did in each spec
file's examples, `<app>/<file>.json`; a partial run's beside them, `.partial`; their links one directory
deeper), and a directory per app (`<app>/`): its last run's output (`sxs.log`), what
the app needs fetched (`files/`: SiYuan's release, Obsidian's app and plugins, markdown-mode), and the
app's own state; SiYuan's kernels (`siyuan/<n>/`: a worker's workspace and log); Obsidian's pool
(`obsidian/<n>/`: an Obsidian every setup shares, its configuration, log, and a vault for each setup it
has a window of); and the pool of browsers (`chromium/<n>/`: each one's profile and log).

What runs is recorded elsewhere ([`lib/records.ts`](lib/records.ts)), so that cleaning `.sxs/` never
loses it: a runtime directory, `/run/ourus-sxs/<id>/` where it can be written (`<id>` a hash of
`.sxs/`'s path; else `$XDG_RUNTIME_DIR/ourus-sxs/<id>/`, the system's temporary directory's, or
`OURUS_SXS_RUN`), laid out as `.sxs/` is: a browser's pid, port and flags and the locks of the runs in it
(`chromium/<n>/`: `<app>.lock`, `clipboard.lock`; `chromium/pool.lock`), an Obsidian's (`obsidian/<n>/`:
`server.pid`, `port`, `version`, `<setup>.lock`, `clipboard.lock`), a SiYuan kernel's (`siyuan/<n>/`:
`server.pid`, `kernel.lock`), the lock of an app's run (`<app>/<app>.lock`) and when a run last took its
window (`<app>/last-run`). `run.ts --stop` finds what to stop there; a browser whose profile was
deleted under it is still reached by its recorded port, and stopped.
