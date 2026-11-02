# The SxS's pool, and four more apps (2026-11-02, 2026-11-03)

The infrastructure the side-by-side runs share (`sxs/`), redone around one process that owns it:
`sxs/pool.ts`, the pool. It had grown flaky: browsers, kernels and Obsidians started detached by
whichever run came first, each tracked in pid files, port files and lock files that every later run
read back and second-guessed (a stale lock, a reused pid, a profile's `SingletonLock` of a container
since replaced), windows left half-loaded by runs that died and taken over by the next, and enough
leftover state in the browsers' profiles that the cure had become deleting Chromium's store outright.

What it is now: the pool runs the proxy, the headless Chromiums, SiYuan's kernels and Obsidian's
instances, hands each worker of a run a window as a lease over a unix socket, and keeps what a run
released cleanly loaded for the next one. **Every window is a browser context of its own**, so it
starts with nothing an earlier window left, and the two RemNote setups, which used to need browsers
apart, run side by side in one browser; **a run's connection sees its own window alone** (a DevTools
endpoint scoped to its context), so the runs sharing a browser don't load each other. The pool is the
one gate on the container's cap on tasks, the runs' own processes and Emacs (which it doesn't run)
included. A run can't hang: an example has five minutes, a run eight without progress.

The full run of all 22 apps takes some 20 to 22 minutes, and two of them in a row differ on 0.3% of
the examples (§5). Part 2 (§7 to §14) is the four apps added with the pool: Mubu, AFFiNE, Lexical and
Moo.do.

Then the results themselves (§4, 19 to 31): every block app's disagreements looked into, Logseq's one
by one, and what most apps agree on against ourus. What was the harness's is fixed (a literal `#` read
as a heading, a copy that differs only in its tabs, a Delete of selected blocks graded on a caret no app
leaves, steps that test nothing on blocks, a character motion over an escape no app's text has); so is
what was a driver's (Logseq's number misread, its drop aimed before the press, six apps' empty
headings), and what was ourus's own (the empty item Outdent21 left, a plain paste into a quote under
`pastePlainLines: enter` handed to the host). ourus has two options more, `pasteOverNodes` and
`heldSpace`, measured on every app; the flakes are traced, Roam's save race waited out, and what is left
is the user's to decide (§6) or open, with how to reproduce it. Against the judgment committed before it
all, 76 more agreements, 87 cases better and 13 worse, 11 of those flakes (§5).

## Contents

- [0. In short](#0-in-short)
- [1. Contexts, not profiles: the experiments](#1-contexts-not-profiles-the-experiments)
- [2. The design](#2-the-design)
  - [2.1 Leases](#21-leases)
  - [2.2 Windows](#22-windows)
  - [2.3 A run's connection: the scoped endpoint](#23-a-runs-connection-the-scoped-endpoint)
  - [2.4 What a window brings with it: kernels, Obsidian](#24-what-a-window-brings-with-it-kernels-obsidian)
  - [2.5 Turns: clipboards, locks](#25-turns-clipboards-locks)
  - [2.6 Room: the container's cap on tasks](#26-room-the-containers-cap-on-tasks)
  - [2.7 Idle, exit, upgrade, the proxy](#27-idle-exit-upgrade-the-proxy)
  - [2.8 Hangs: the watchdog and the stall check](#28-hangs-the-watchdog-and-the-stall-check)
  - [2.9 Not chosen](#29-not-chosen)
- [3. The code](#3-the-code)
- [4. Log](#4-log)
- [5. Verified](#5-verified)
- [6. Left open](#6-left-open)

Part 2: four more apps

- [7. The four apps](#7-the-four-apps)
- [8. Mubu](#8-mubu)
- [9. AFFiNE](#9-affine)
- [10. Lexical](#10-lexical)
- [11. Moo.do](#11-moodo)
- [12. The harness, for them](#12-the-harness-for-them)
- [13. What the new apps say about ourus](#13-what-the-new-apps-say-about-ourus)
- [14. Wrong turns, and still open](#14-wrong-turns-and-still-open)
- [15. Notion](#15-notion)

# Part 1: the pool

## 0. In short

| | before | now |
| --- | --- | --- |
| who owns the browsers | nobody: the first run starts them detached, every run reads files to find them | the pool, one process per container; its children die with it (`setpriv --pdeathsig`) |
| who holds what | lock files with pids (`chromium/<n>/<app>.lock`, `pool.lock`, `clipboard.lock`, `kernel.lock`, `<setup>.lock`), read back as stale or not | a lease is a socket connection: held while it is open, given back when it closes, however the client ends |
| a window's state | an app's storage in a browser's persistent profile, shared by every window of the origin in that browser | a browser context per window, in memory: nothing of an earlier window's |
| a run's connection | Playwright's, to the whole browser: every page of every run set up, every page's events | through a scoped endpoint: its window's context alone |
| RemNote's two setups | one name for their windows (`Driver.pool`), browsers apart (`Driver.browsers`: even, odd) | side by side, each window its own context |
| a run that died | its window left loaded, taken over by the next run if it still answered | its windows destroyed, contexts disposed, at once |
| a run that ended well | its window closed (`--keep-windows` to keep it) | its window kept loaded, warm, for the next run of the app (a hot start, under a second) |
| a run that hangs | hangs, holding what it holds (a clipboard others wait for) | an example stuck 5 min is an error and its worker retired; a run 8 min without an example done exits |
| idle | browsers ran until `--stop`; an Obsidian stopped with its last window | a warm window no run took for 10 min is destroyed; a browser or instance with no window stops after 10 min; the pool exits after 2 min with nothing |
| size | fixed: 4 browsers × 5 windows, 4 Obsidians (2 beside browsers, by an environment variable a run of several apps set) | at most 2 browsers × 12 windows (2 clipboards) and 3 Obsidians, admitted under the container's cap as read (`pids.max`), the runs' own processes counted |
| seeing it | `ls` the state directory | `node sxs/pool.ts status` (`--help`); `pool/pool.log` |

## 1. Contexts, not profiles: the experiments

The question first, since it decides the design: can apps (and two setups of one app on one origin)
run safely in one browser's windows, each with storage of its own? Chrome has two candidates:
*profiles* (`Profile 1`, `Profile 2` under one user data directory, `--profile-directory`), and
*browser contexts* (`Target.createBrowserContext`, what Playwright's `newContext()` makes and what an
incognito window is). Measured on Chromium 156 headless (`--headless=new`), Playwright 1.64, a test
site on 127.0.0.1 with a service worker and a shared worker:

| in context B, after context A wrote it (same origin) | seen in B? |
| --- | --- |
| localStorage, cookie, IndexedDB, CacheStorage | no |
| a BroadcastChannel message | no |
| a Web Lock A holds | no |
| a SharedWorker's count (A connected twice) | no: B's starts at 1 |
| a registered service worker | no |
| **the clipboard** (`writeText` in A, `readText` in B) | **yes: one clipboard per browser** |

- **Frames and focus**: two windows of two contexts at once both ran 31 animation frames in 500 ms
  and were both `visible`: each a window in front of its own, as before.
- **Surviving a client**: contexts made with `disposeOnDetach: false` (and their pages, and their
  storage) outlive the connection that made them; Playwright's `browser.newContext()` doesn't
  (disposed when its connection closes). So the pool makes them over its own connection.
- **Permissions**: granted per context (`Browser.grantPermissions` with `browserContextId`), they
  survive another client's connection ending. (The old pool's clipboard dance, re-granting as it took
  the clipboard and disconnecting while holding it, was for permissions Playwright granted on the
  default context, which a connection's end resets for every page.)
- **Profiles in one process: no.** A second launch on the same user data directory with
  `--profile-directory=Profile 2` hands over to the running browser and exits (21), and no window
  appears in the headless browser; nor does the DevTools protocol open a window in another profile.
- **RemNote, the case that needed it**: the real drivers, `remnote` and `remnote-bl`, in two contexts
  of one browser, each driven by a client connection of its own, at once: both opened in 4.4 s, and 15
  rounds each of load, indent, type, split, read came out right, 15/15. The control, both windows in
  one context: one RemNote reloads the other within 2 s ("Execution context was destroyed").
- **Playwright's catch**: a client connecting over CDP files the pages of contexts it didn't make
  under its *default* context (`coreBundle.js`, `CRBrowser._onAttachedToTarget`: an unknown
  `browserContextId` falls back to `_defaultContext`). A page's own calls go to its target (goto,
  keyboard, evaluate, its init scripts, a CDP session on it); context-level calls don't:
  `page.context().pages()` lists every window's (RemNote's `open` closed every other RemNote tab it
  saw so: the other client's window), and cookies or permissions set through it land in the default
  context. Only RemNote's `open` and `login.ts`'s cookies used them; both changed.
- **Load**: one browser, N windows of N contexts, N clients each typing 60 keys with an idle wait
  after each into a page that re-renders 2000 nodes a key, 10 CPUs:

  | windows | key and settle, p50 / p90 / max | browser's tasks |
  | --- | --- | --- |
  | 1 | 65 / 73 / 78 ms | 153 |
  | 6 | 67 / 81 / 209 ms | 335 |
  | 12 | 67 / 73 / 95 ms | 552 |
  | 20 | 96 / 126 / 289 ms | 843 |

  Flat to 12, slower at 20, which looks like 20 renderers on 10 CPUs more than the browser's main
  thread. A window is some 35 tasks; 2 browsers of 10 windows some 900, what the old 4 × 5 was.
- **How much needs the clipboard**: 18% of Logseq's examples, 19% of RemNote's, 14% of
  SilverBullet's. Held per example, one browser's clipboard would serialize all of those across every
  app: so two browsers, two clipboards.

## 2. The design

### 2.1 Leases

One process per container (its state directory: the containers on one checkout share `.sxs/` but
not their process tables), reached over a unix socket, `<state>/pool/pool.sock`, a JSON message a
line. **A connection is a lease**: what it holds (a window, a lock, a clipboard's turn, room) is held
while it is open. A client that exits, crashes or is killed closes it, and the pool learns at once; a
client's pid is checked every two seconds besides. The first client to find no pool starts it,
detached (`lib/pool-client.ts`); two starting at once settle it by the pool's own lock
(`pool/daemon.lock`), the second exiting.

Requests: `hello` (the client's pid, a name, the code version), `room`, `window`, `obsidian`, `kernel`,
`bind`, `clipboard`/`unclipboard`, `lock`, `proxy`, `release`, `status`, `drain`, `stop`. The pool tells
a client unasked what it says about its request (`say`, shown in the run) and that its window is gone
(`lost`). Every request is answered: one the pool can no longer grant (a clipboard asked for by a
window that went while it waited) is refused, never left waiting.

The pool's children (browsers, kernels, Obsidians, the proxy) are started under
`setpriv --pdeathsig KILL`, each in a process group of its own: the pool gone, killed with `-9` even,
they go with it. What runs and who holds what is in the pool's memory alone; nothing is written to be
read back as stale. A pool starting stops what the design before it left running (browsers and
servers it recorded in `chromium/<n>/` and `server.pid`, checked by command line so that a reused pid
is left alone) and removes their profiles.

### 2.2 Windows

A window is a browser context made for it (`Target.createBrowserContext`, `disposeOnDetach: false`),
its permissions granted (the clipboard's), and a window in it (`Target.createTarget`, `newWindow`,
1280×900). The client connects with Playwright through its scoped endpoint (§2.3), finds its page by
its target id, sets the viewport (an emulated one ends with the connection that set it), and drives it.

**Released cleanly** (`release`, `clean`: the worker's examples had no error), the window stays
loaded, *warm*, with what the run left with it (`meta`: the app's version). The next request for the
app takes it over if its `key` is the request's (the driver's URL and the idle script's version),
after the pool checks it answers (an evaluation, 3 s), and the runner checks it still loads and reads
a document back. **Released otherwise** (an example errored), **or not at all** (the connection
closed, the pid gone), the window is destroyed: its context disposed, which closes its pages and drops
its storage. A page that crashes or is closed under a lease is destroyed too, and its client told.
`--fresh` destroys the app's warm windows and takes a new one.

Where a new window goes: a browser with no lease (runs spread over the browsers, each with its
clipboard); else a new browser while fewer than `BROWSERS` (2) run; else the browser with room (`WINDOWS`, 12 a
browser) and the fewest leases; with no room anywhere, the longest-idle warm window, of any app, is destroyed for it;
with none to destroy, the request waits (a worker after the first gives up once the run's examples are
taken). Deciding is synchronous, and `pump`, which tries the waiting requests, isn't re-entered: a
browser being started, a window being made, are in the pool's tables before they are up, so requests at
once never pick the same room, no request is tried while it is being served, and nothing slow (a
kernel's boot, an Obsidian's start) holds a lock other requests wait on.

Contexts are never left behind. A window destroyed while its context is being made has what was made
disposed as each call comes back; and every 30 s the pool sweeps each browser
(`Target.getBrowserContexts`), disposing a context no window has on two sweeps in a row (a creation
given up on that the browser carried out after, a dispose that timed out). A dispose that times out
(30 s) restarts its browser only where the browser then answers nothing (`Browser.getVersion`, 15 s):
a browser busy with its other windows' runs is slow, not dead.

### 2.3 A run's connection: the scoped endpoint

Playwright's `connectOverCDP` auto-attaches to every target of the browser, sets each page up (its
domains enabled, its frames read, an init script added) and waits for all of them before it returns;
every page's events then go to every connection. In a browser of ten windows, ten runs' connections,
that was each run on every run's page: connections that took longer than their timeout under load,
examples stuck, and a load average of twice the CPUs (§4, 13). So a run's Playwright connects to an
endpoint of its own (`lib/scope.ts`), a WebSocket in the run's process between it and the browser:

- what Playwright sends passes;
- a target the browser auto-attaches at the root passes where it is in the window's context, or the
  client asked for it (the browser's own target, one attached to by id); any other is detached there
  (run first where it waits for a debugger), so no other run's target is set up by, or waits on, this
  connection;
- a session's messages pass where its target did, or is under one that did (a frame's, a worker's),
  or the client opened it (`Target.attachToTarget`, `attachToBrowserTarget`).

Playwright then sees one page, its window's, and `page.context().pages()` is that page alone (§1's
catch is gone with it). Playwright's assertion that a target it attaches to has a context (Chromium
reports some service workers without one) can't come of another run's target now; where it comes of the
run's own, it is let go (`tolerateContextlessTargets`), any other uncaught error ending the run as
before.

### 2.4 What a window brings with it: kernels, Obsidian

**SiYuan's kernel** is bound to its window (`kernel`): started on a new workspace the first time the
window's client asks (nothing an earlier window left in it), kept with the window while warm, stopped
with it. One that exits under its window (SiYuan's UI asks it to quit on some keys) is started again
on its workspace (`kernel`, `restart`). Port 6816 + n, as before.

**Obsidian** is an Electron app, not a page, so its windows are in instances of its own, which the
pool runs as it runs browsers: at most three (`OURUS_SXS_OBSIDIANS`), a window of each setup in an
instance at most, so a run of a setup has up to three workers. The client (the driver's `launch`)
writes the vault and opens it, and tells the pool its window's target (`bind`). Released cleanly it
stays open (`key`: the versions, the setup, its keys); released otherwise, the pool closes it (its
target, or every window on its vault where it was never bound) and removes the vault. An instance's
windows share its local storage; Obsidian keys its own by vault.

### 2.5 Turns: clipboards, locks

A browser has one clipboard, an instance one: an example that uses it holds it (`clipboard`), in
turn, the pool granting the window's context the permission again as it takes it. A request in line
whose window goes is refused ("no clipboard: its window is gone"), which its run takes as its page
gone. A lock of any name (`lock`): one run of an app at a time, `app:<app>`, held while the run's
connection is open; another run of the app stops, a probe waits. The downloads' locks (SiYuan's
release, Obsidian's) stay file locks in `.sxs/`: containers share those.

### 2.6 Room: the container's cap on tasks

The container caps its tasks (`pids.max`, 2048 here; read, never assumed), and a task refused crashes
or hangs whatever wanted it: a renderer, a browser, an Emacs. The pool is the one gate on it:

- **What it starts** is admitted as it fits: a browser 130 tasks, a window 40, an Obsidian 100, its
  window 25, a kernel 20 (`COST`, measured at full size under full runs: two Chromiums with twenty
  windows of the heavier apps took 1046).
- **What it doesn't** asks it for room first (`room`, `lib/pool-client.ts`'s `poolRoom`): a run, 12
  tasks for its own process, and `Driver.tasks` a worker for an app its driver starts outside the pool
  (Emacs and its terminal, 15). Granted in line with the windows as it fits, held while its connection
  is: a run of `all`'s, its 22 apps started at once, waits in the pool's line rather than start.
- **Fits** is a projection, within `MARGIN` (0.8) of the cap: the tasks not the pool's as the larger
  of what they are (`pids.current` less the pool's own process tree, from `/proc`) and the room given
  (so an Emacs not started yet is counted, and a run that has started isn't counted twice); plus the
  pool's own as the larger of what its tree is and what its model comes to (a browser just started has
  a fraction of the threads it will have); plus what is starting, less what is being destroyed. Short
  of room, it destroys warm windows of any kind before a request waits; with nothing leased at all and
  no room given, it starts what is asked anyway rather than wait for no one.

### 2.7 Idle, exit, upgrade, the proxy

A warm window no client took for `IDLE` (10 min, `OURUS_SXS_IDLE_MIN`) is destroyed, context and
all; a browser, an instance with no window for as long stops; the pool, with nothing running and no
client for two minutes, exits (and the proxy with it). A client that finds a pool of other code than
its own (a hash of the pool's sources: `pool.ts`, `lib/pool-client.ts`, `lib/cdp.ts`,
`lib/desktop.ts`, `lib/system.ts`, `siyuan/kernel.ts`, `obsidian/instance.ts`) asks it to drain: it
refuses new leases and exits once the last ends; the client then starts one of its code. (So those
files aren't edited under a full run: a run's next lease would drain its pool.)

The proxy is the pool's: the browsers' flags name its port, so it is started before a browser is,
restarted where it exits while browsers run, and restarted where a run asks for another cache mode
(`proxy`, `--cache`) or its sources changed. While its process lives, a health check it doesn't answer
(busy, every run starting at once) is asked again, three times 5 s, before it is taken for hung and
replaced. A proxy not the pool's (the old design's, detached) is replaced.

### 2.8 Hangs: the watchdog and the stall check

What hung before was a call that never returned (Playwright bounds no evaluation), and whatever waited
behind it: a clipboard's line of other runs. `run.ts` has two limits now:

- **An example's watchdog** (`STUCK_MS`, 300 s, `OURUS_SXS_STUCK_S`), from when the example has its
  clipboard where it uses one: an example still playing is an error ("stuck"), its worker's window is
  destroyed (which ends its calls and gives the clipboard back), and the worker is retired while the
  others go on.
- **A run's stall check** (`STALL_MS`, 8 min, `OURUS_SXS_STALL_MIN`), from its first worker ready (time
  in line for room or a window isn't counted): a run that finishes no example for as long says what
  each worker is on and exits, writing nothing, and the pool destroys its windows as its connections
  close. Above the watchdog, which a run waiting for a clipboard behind another run's stuck example
  may wait out; not a cap on a run's length, since a run slow under load (all the apps at once) is not
  hung.

And a run that didn't play every example (its workers all retired) fails, writing nothing, rather than
report part of the spec as the whole. A run whose page is gone (crashed, its browser restarted, its
Emacs dead: "Emacs is gone", the server not answering) stops so too.

### 2.9 Not chosen

- **One browser.** Contexts would let every window be in one; its one clipboard decides against it
  (§1: 14–19% of an app's examples use it). `OURUS_SXS_BROWSERS` changes it.
- **Chrome profiles.** Not usable in one headless process (§1).
- **Persistent contexts.** Contexts are in memory, so a browser's restart loses its warm windows
  (they load again) and a login's cookies (no app is behind one now: `login.ts`). That is the point:
  the profile on disk is a temporary directory made anew at each browser start, with nothing of any
  window's in it.
- **A cap on a run's length.** Asked for first (20 minutes), it stopped runs that were waiting in line
  and then one slow under load, near its end; the stall check (§2.8) took its place.
- **More browsers**, for more clipboards: some 130 tasks each, where the cap is the other limit. The
  clipboard's hold was made shorter instead (§4, 16). (More windows a browser, 12 from 10, the user
  chose: safe, as a window is admitted only as it fits.)
- **Python** for the pool: every client, and what the pool starts (SiYuan's setup, obsidian-launcher),
  is TypeScript; a second runtime would mean the state directory's hash, the paths, the flags and the
  protocol twice. The flakiness was the design's, not the language's.

(A filtering CDP proxy was first among these, as more machinery than the one catch of §1 it solved; the
load of every run's connection on every page, found in the full runs, made it the fix of §2.3.)

## 3. The code

| file | what |
| --- | --- |
| `sxs/pool.ts` | the pool: `serve` (the daemon), `status [--json]`, `stop`, `--help` |
| `sxs/lib/pool-client.ts` | the socket, the version check and drain, `Lease` (`window`, `obsidian`, `clipboard`, `kernel`, `bind`, `release`), `poolLock`, `poolRoom`, `poolRequest`, `stopPool` |
| `sxs/lib/cdp.ts` | a bare DevTools client over a WebSocket, the pool's |
| `sxs/lib/scope.ts` | a DevTools endpoint scoped to one browser context, which a run's Playwright connects to instead of the shared browser's (§2.3) |
| `sxs/lib/browser.ts` | the client's side for a run: `ensureProxy` (asks the pool), `appWindow` (a lease, its page found by target, through a scoped endpoint), `headedWindow`, `lockApp`, `runRoom`, `leaseOf(page)`, `pageOf`, `targetOf`, `reloadPage`, `tolerateContextlessTargets` |
| `sxs/lib/driver.ts` | `Driver.tasks`: the tasks an app its driver starts outside the pool takes (Emacs's) |
| `sxs/obsidian/instance.ts` | an Obsidian instance's start (moved out of `obsidian.ts`): versions, downloads, Xvfb |
| `sxs/siyuan/kernel.ts` | `startKernel` for the pool (was `serve`, `leaseKernel`, `holdKernel`) |
| `sxs/emacs-markdown/emacs.ts` | a failed call asks whether Emacs's server answers: "Emacs is gone" where it doesn't |
| `sxs/run.ts` | room first; a worker's window from the pool; reused one checked; the watchdog and the stall check; released clean or not by whether an example errored; a run with examples unplayed fails |

For the results (§4, 19 to 31):

| file | what |
| --- | --- |
| `sxs/lib/plan.ts` | the steps a case ends with that change only what blocks can't show dropped; such a step mid-example marked `lost`; an example whose character motion crosses only an escape ourus wrote skipped (`escapeMotion`) |
| `sxs/lib/block.ts` | `ProjectOptions.headings`: a first line's `\#` kept where a block starting `# ` is a heading; `sameText` and the whitespace grade (`loose`) telling a heading from a text `#` |
| `sxs/lib/driver.ts` | `Driver.headings`, `Driver.drainBefore` |
| `sxs/lib/idle.ts` | a MessageChannel message pending till delivered (React's scheduler); a trace of keys, inputs and focus with what was pending (`trace`) |
| `sxs/lib/drag.ts` | `gesture`'s target found once the drag has started |
| `sxs/run.ts` | a clipboard that is the same Markdown agrees; a delete or cut of selected blocks named `deleteSubtree` for `noCaretAfter`; the judge stopping at a `lost` step the app changed; a second look at a state that doesn't agree; `drainBefore`; `OURUS_SXS_THROTTLE=N` (a page's CPU slowed N times); `OURUS_SXS_KEYTRACE=<apps>` |
| `src/config.ts`, `src/commands/subtrees.ts` | `pasteOverNodes: replace \| after \| nothing` |
| `src/config.ts`, `src/writer/draft.ts`, `settle.ts`, `write.ts` | `heldSpace: repair \| trim`: a held space kept as the text's padding, a read item's children moved with it (`lifted`) |
| `src/commands/paste-plain.ts` | `pastePlainLines: enter` in a quote read as an atom: typed into it, not the host's |
| the drivers | 14 declare `headings` (the attribute ones read a text `#` as `\#`); six an empty heading declined; Logseq's number property and drop; `pasteOverNodes`, `copyAtCaret`, `heldSpace` where measured; Roam's `drainBefore`; BlockNote's drop error saying what the page shows |

Gone: `appPage`, `lease`, `launch`, `BROWSERS`/`WINDOWS`, the window records (`<app>.window`,
`last-run`), `recordServer`/`serverPid`/`stopServer`, `leaseInstance`/`ownInstance`'s lock files,
`Driver.pool`, `Driver.browsers`, `--keep-windows` (kept is the default), `OURUS_SXS_OBSIDIANS` set by
`run.ts`/`probe.ts` (the pool sizes by the cap; the variable still sets the pool's maximum).

## 4. Log

The full runs are named as they came: #1 and #2 (before the fixes of items 8 and 9), then A, F1, F2,
G1, G2 and G3, each stopped or run again as what it found was fixed; C, D and E after them (16 to 22);
on 2026-11-03 H1 to H6 (§5), H6's results committed.

1. **Survey.** `lib/browser.ts` (665 lines of lease logic over files), `obsidian/obsidian.ts`'s
   instance pool (230 lines, the same over other files), `siyuan/kernel.ts`'s kernel leases,
   `lib/desktop.ts`'s `takeLock`, `lib/records.ts`.
2. **Experiments** (§1), on a Chromium and proxy of their own, the real pool untouched:
   `ctx-isolation.mjs`, `remnote-ctx.ts` (and its control), `load.ts`.
3. **Design** (§2), with the user: a graceful release keeps the window loaded for the next client
   of the app, even run after run; anything else destroys it and its context; a warm window idle for
   N minutes is destroyed too. Emacs stays out (fast, a terminal). The proxy first stayed out, then
   came in: its port is in every browser's flags.
4. **`lib/cdp.ts`, `lib/pool-client.ts`, `pool.ts`**; `siyuan/kernel.ts` and `obsidian/instance.ts`
   reshaped to be started by the pool (a spawner it passes, so their processes are its children).
5. **Clients**: `lib/browser.ts` rewritten around `appWindow`; `run.ts`'s `ready`/`join`/release; the
   SiYuan driver's kernel from its lease; the Obsidian driver's `launch` on a lease (warm windows taken
   over by target); RemNote's workarounds out; `login.ts`'s cookies through the page's own CDP session.
6. **Typecheck** (`tsc -p .`): two classes of error, parameter properties (`erasableSyntaxOnly`) and
   two references left to removed names.
7. **First runs**, §5. One slip in testing: `pkill -f "sxs/run.ts logseq"` matched the shell running
   it; killing by the run's pid instead (it happened twice more, with other patterns: a pattern in a
   command line matches the shell running it).
8. **Full run #1 found two bugs**, and was stopped:
   - **The cap on tasks, hit**: 2037 of 2048, 546 refused; emacs-markdown's `emacsclient` calls failed
     (284 errors, though it isn't the pool's), and remnote-bl's run died when its window's page never
     showed (`pageOf`, 5 s). The pool had started four Obsidians beside nineteen browser windows,
     having checked `pids.current` as it started each: a browser or an Obsidian just up has a fraction
     of the threads it comes to. Now it projects (§2.6) and makes room by destroying warm windows of
     any kind before a request waits. `pageOf` waits 30 s and says whether the target is still there.
   - **Two windows for one lease**: each of Tine's workers got two windows the same instant. `pump`
     tried each waiting request in turn, and a request making room (a warm window destroyed) called
     `pump` again from `destroyWindow`, which tried the same request, not yet taken off the line,
     again: a second window, the lease's first left leased by no one, forever. `pump` now isn't
     re-entered (a call during a pass asks for another pass after it), takes a request off the line
     before trying it, skips a connection with a lease, and `claim` refuses a second lease.
9. **Full run #2 hung for seven hours**, from 33 minutes in, unseen: it was watched for its end
   alone. Stopped; four bugs and a fifth thing:
   - **A browser restarted for being slow.** Chromium 1, its ten windows busy, took more than 10 s to
     dispose of a context; the pool took that for a dead browser and restarted it, which took roam's,
     logseq-db's, athens's and remnote-bl's pages with it. Now §2.2's rule: 30 s, then a browser that
     answers is left alone and its context is the sweep's.
   - **A clipboard request never answered.** Two of SilverBullet's workers in that browser were in line
     for its clipboard as it went: `destroyWindow` took them off the line (`releaseTurn`) and answered
     nothing, so they waited forever, and their run with them (its output, in the spec's order, waits
     for them too, so its log went quiet at once). A turn's line now holds a `deny` with each request,
     and `releaseTurn` answers every request it takes off.
   - **An example that never ends.** SilverBullet's worker 1, in the other browser, stopped in an
     example at 04:30 holding that browser's clipboard, its page answering and its clipboard working: a
     call that never returned. SiYuan's, Tana's and Tine's workers waited behind it for the clipboard,
     hours. Hence the watchdog (§2.8).
   - **Contexts no window had**: five `about:blank` pages, each in a context of its own. A window
     destroyed while its context was being made had no context id yet to dispose, and the creation
     went on after; a creation that timed out can come about in the browser after. Hence the checks
     as a window is made, and the sweep (§2.2).
   - **Emacs died** at the run's start, as 18 apps started at once and touched the cap (2045 of 2048),
     and each of emacs-markdown's next 148 examples failed in milliseconds with an empty `Emacs:`. A
     failed call now asks the server whether it answers, and one that doesn't is "Emacs is gone",
     which stops the run. The pool fills to 0.8 of the cap now (`MARGIN`; it was 0.9).
   - The user's rule after: **a run ends at 20 minutes**, saying what its workers were on, so that no
     hang outlives a run.
10. **Four apps added** (Part 2, §7): Mubu, AFFiNE, Lexical, Moo.do, their
    drivers, rules and READMEs as they were written; `reloadPage` (Moo.do's) in `lib/browser.ts`, a reload alone
    now; the idle script's `frames: false`; two blocked hosts. They needed no change for the pool
    (none calls a context-level API). On `indent.md` they play with no error and none of their verdicts
    moved from their earlier results.
11. **Run A, and the pool as the one gate on the cap.** Run A, counting the 20 minutes from each run's
    start, was about to stop seven apps that had only waited (22 apps of four workers share twenty
    windows; logseq had played nothing at 16 minutes): stopped, with 16 apps done. The limit counts
    from the run's first worker ready since. Meanwhile, at the user's question: the pool read the cap
    and gated what it starts, but not the runs' own processes nor Emacs, and its model was low (1046
    tasks where it counted 860). Hence `room`, `Driver.tasks`, a window at 40, and `fits` counting what
    isn't the pool's as the larger of what it is and the room given (§2.6).
12. **Run F1 (34 min), three failures**, none the pool's:
    - **Moo.do's `open`** failed in its first `load` ("Execution context was destroyed"): the app
      reloads itself once its service worker takes over, which in a new context is every open, and on
      a machine busy with 21 other runs came later than `appReady` waited. `open` now takes a
      navigation in its ready loop for that reload, and waits for the app again.
    - **Athens's run died of Playwright's assertion** in `CRBrowser._onAttachedToTarget`, that a target
      has a browser context: Chromium reported a service worker of SilverBullet's, another run's
      window in the same browser, without one. Let go since (`tolerateContextlessTargets`); and since
      §2.3, another run's targets don't reach a run at all.
    - **Tine's run was stopped by the 20 minutes**, near its end and not hung: 22 apps on ten CPUs play
      slower, and Tine played past 20 minutes (614 s in run A). The user chose the stall check (§2.8)
      instead; 8 minutes rather than the 5 offered, to stay above the watchdog.
13. **Run F2 (stopped): every run's connection on every run's page.** Runs failed in `connectOverCDP`
    (15 s), SilverBullet's workers were stuck one after another, and the load average was 20 on ten
    CPUs: each worker's Playwright connection set up every page of its browser and took every page's
    events, ten connections to ten pages a browser. Hence the scoped endpoint (§2.3). Tested on a
    Chromium of its own, with two contexts, pages, an iframe and service workers: connected in 25 ms,
    one page seen, evaluate, keys, an init script across a reload, its iframe; a window of the other
    context made after neither seen nor held. The first version detached the browser's own target,
    which Playwright's `newCDPSession` attaches to first ("Session with given id not found"); a target
    the client asks for passes since. Then three apps twice on the pool: the same verdicts, and hot
    starts through it (0.4 s, 0.6 s, 5.5 s).
    - Besides: **a run whose workers were all retired** (stuck) wrote its report of the examples
      played, 9 of SilverBullet's 1148, as if whole. It fails now (§2.8).
    - And a slip of mine: testing `scope.ts` on a Chromium of its own beside that run took the
      container to its cap (2038, 49 refused). Tests of that kind wait for a quiet container.
14. **Runs G1 and G2**, all of the above in: G1 complete, 22 apps in 22 minutes, nothing refused, no
    example stuck, no run stalled, the load average 6 to 13. G2 lost one app, Tana: **the proxy
    restarted under load**. As 22 runs started, the pool's health check of its proxy (1 s) went
    unanswered; it took the proxy for gone and started a second, which failed on the port ("already
    listens on :8899") and exited; the pool, watching that one, said "the proxy exited", found the first
    "not the pool's", and restarted it under a run that was asking for it. Now §2.7's rule: asked
    again, three times 5 s, while its process lives. Staged during G2 and put in after it (§2.7: a
    change to the pool's sources under a run drains its pool), with:
    - `pool.ts --help` (`help`, `-h`): its commands, the settings it reads as it starts with the
      values it would use, the cap as read from `pids.max`, its files.
    - Obsidian's instances at most: 3 (`OBSIDIANS`, and Obsidian's `parallel`), the user's choice.
15. **Run G3**, with those: complete, 22 apps in 19 min 52 s, nothing refused, nothing stuck (§5).
    Against G1 and G2 it moved Obsidian's verdicts by the dozen (obsidian 369 agreements to 417,
    obsidian-lp 361 to 409, mostly disagree to agree): **Obsidian 1.15.0**, released during these runs,
    whose own list editing now takes the subtree along (a move, an indent, an outdent carry the
    children; Enter after a folded item makes its sibling past the fold; an outdent in a quote stays
    in it), where 1.14.5 moved the line alone. G3 was the first run on it, and found a bug of the
    pool's: **an instance ran whatever version it started with.** `versions()` resolves `latest` once a
    process, and the pool, a process that outlives a release, started 1.14.5 instances all day, while
    each run resolved 1.15.0, keyed its windows by it and recorded it: G1 and G2 said 1.15.0 and ran
    1.14.5. Now an `obsidian` request carries the versions its run resolved (`appVersion`,
    `installerVersion`), the pool starts an instance of those (`startInstance`'s `want`), gives a
    request no instance of other versions, and stops one of other versions no client holds a window
    of where its place is wanted. Checked: a run on `latest` (1.15.0), one with `OBSIDIAN_VERSION=1.14.5`
    (the 1.15.0 instances stopped, two of 1.14.5 started, the run's report saying 1.14.5), and `latest`
    again (back to 1.15.0), each with the verdicts of its version.
16. **The HTTP cache refreshed** (the user's step after): `.sxs/http/` dropped (126 MB, 31 hosts, tracked
    in `.sxs`: `git -C .sxs checkout -- http` brings it back), and run C, a full run on a cold cache,
    fetched every app anew: 21 min 17 s, 98 MB over 24 hosts after. Nine apps' bundles had changed
    since the cache was made (AFFiNE, BlockNote, Lexical, Mubu, RemNote, SilverBullet, Tana, Tine,
    WorkFlowy), and Roam's data comes from other Firebase hosts. Against the runs before it, 100 of
    18,996 examples moved: BlockNote 23 (a new build: its drags and selections), Tana 12 (a new build,
    `f6ae813f25` to `35c7f333c3`: pastes, two drags), and the flakes as before (SiYuan 41, Roam 14,
    obsidian-true-outliner 5, four apps 1 or 2); the other twelve apps, those whose bundles changed among
    them, the same example for example.
    - **Tine didn't open**: its new bundle didn't take the proxy's patches (`tine/proxy.ts`). Its
      minifier puts `$` in names now (`const[_,j$]=kd({byId:…})`), which `\w` doesn't match, and the mock
      backend's pages are a function's now (`const e=[...dR,...op,...A],B=…,Q=n=>e.find(`), its lookup
      three declarations on. The patterns take `[\w$]` for a name, and the pages' looks for the spread
      array whose own `find` follows in its declaration list: each patch applies once to the old bundle
      and to the new. On the new bundle (a guide of 2026-09-29) two examples err: it holds the caret of
      a fence in a quote a line up from where the driver puts it (Fence4, Fence20).
    - **Why the cold start left the CPUs idle**, at the user's question: the two clipboards. Each
      browser has one, and an example that pastes held it for the whole example, its load and settle
      included; the cold cache had every app load together and reach the paste files together, and 14
      of the 16 browser windows waited in line for one of two clipboards (load 2 to 3 on ten CPUs; a
      paste example 9 to 10 s, most of it the wait). After the run, two changes in `run.ts`: an
      example **holds the clipboard from its write, once the app holds the starting state, to the last
      step that copies, cuts, pastes or checks it** (`lastClipboardStep`; none of those, no clipboard
      at all), its watchdog not counting the wait; and **the workers take a run's examples with those
      that hold it spread evenly among the others** (`order`; what comes out is said in the spec's order
      still). The paste, copy and plain-paste files on Logseq, Dynalist, emacs-markdown and Obsidian:
      432 examples, each the same as in run C, verdict, states and clipboard.
    - **The windows**: 2 browsers × 12 (`WINDOWS`), the user's choice, with the three Obsidians.
17. **Run D didn't start: the pool's hand-over raced.** A pool that drains (its code changed) removes its
    socket first and holds its lock (`daemon.lock`) some two seconds more, stopping its browsers; the
    client, the socket gone, starts the next pool at once, which found the lock held, took it for a
    pool already serving, and exited; the client waited 30 s for a socket and gave up. (G3's hand-over
    had only been luckier.) The next pool now waits for the lock while no socket comes (20 s at most;
    a socket that comes is a pool serving, and it leaves it to that one). Two hand-overs in a row
    after: each new pool serving within a second of the old one's stop. And a second bug on the way:
    a log line the pool couldn't write (its stdout a pipe gone) threw, its `uncaughtException` handler
    logged, which threw, at 100% of a CPU for good: stdout's errors are dropped now, and the handler
    runs once.
18. **Run D**, with all of the above: 22 apps in 16 min 46 s (C, the same cache with the clipboard held
    for a whole example and ten windows a browser, 21 min 17 s), nothing refused, nothing stuck. No
    one waited for a clipboard past a moment (C had seven in line at each), and the load stayed at 9
    to 18 on ten CPUs; what held runs back then was the cap's margin (some 1670 of 1638), which kept
    windows 21 to 24 and the third Obsidian shut much of the run. Against C (and Tine's run on its new
    bundle): 49 of 18,996 examples differ (0.26%), all in the apps that differ between any two runs:
    SiYuan 33, Roam 11, AFFiNE 2, BlockNote, remnote-bl and Tana 1 each; the other sixteen the same.
19. **A dive into the results**, at the user's asking, run D's: its 17 errors, the flakes across five
    full runs, and where most block apps disagree with ourus the same way (counted by family: the four
    Obsidian setups one, Logseq's two, RemNote's two).
    - **The errors, all gone.** Harness: a heading with no text (`#` alone) owned no section in
      `ownBlocks` and `listOwner` (`#` and a space wanted), as ourus's outline has it own one
      (RemNote's Regression168); and `project` put an item's text below its marker where a checkbox the
      flavor reads as no task (`[a]` in GFM, `[x]` in CommonMark) had a line break after it, ourus's
      frame being flavor-blind there, so that a start and its result were projected two ways
      (Regression44, 45, 46, 55, 59, 85, 181, ShiftEnter26b; Regression44 agrees now in Dynalist,
      WorkFlowy, BlockNote). Drivers: Athens's load wrote a block's text into transit as it is, and `^x`
      (a block id) is transit's cache reference ("page.evaluate: ol"): escaped with a `~`, as transit
      writes it; Tine's new build edits a fence in a quote, or indented, in its code editor too, and a
      code block opens in the block's editor first, its own a moment after: the caret's offsets are the
      editor's that has the block, placed once it holds on a second look; BlockNote's drag waits for its
      side menu to come and go a few times, the pointer away and back, as it didn't under load. Starts
      an app can't hold, declined (`holds`): SiYuan's caret in inline math, a code span of more backticks
      than its code needs, a task marker other than `[ ]` and `[x]`; Logseq DB's `$$…$$` on one line and
      `#` alone; RemNote's `#` alone without bullets.
    - **SiYuan's flake**, the largest: a quarter to a third of its Tab steps did nothing in every full run
      (25 to 30%), 4% where its files ran alone. One worker's share: a run with one worker and a trace
      of the order it played (`OURUS_SXS_TRACE=1`), then each example replayed with Tab tried after it,
      found Auto29 (`$$`, Enter, `x`): it leaves SiYuan's math popup open, the next load removes the
      block under it, its transaction fails, and SiYuan's "Abnormal state" dialog takes every Tab after
      in that window. The driver closes the popup with its Escape before a load, reloads the UI after an
      abnormal state, and errs the test where the load raises one. A full run of SiYuan after: 9% of
      its Tab steps unchanged, its own refusals (headings' levels, a typed tab, a quoted item), 0
      errors, 25 examples better than in run D and none worse.
    - **Changes to ourus and the comparison, the user's choice**: Outdent21, every block app keeping
      the empty item whose only child is outdented, so ourus does too (`outdent.ts`; the spec's
      example with it); and a block id, to a block app without them (none has `^x`), is its text: the
      projection notes `block id`, and a case with one is skipped for such an app (`Driver.blockIds`).
      Left to the user: ourus dropping a block's leading spaces as the caret leaves it (8 to 12
      families keep them), headings' levels following an indent (8 keep them), ShiftEnter33's refusal
      (9 break there).
    - Still flaky: Roam (22 across five runs, keys after an Enter or an indent lost: its driver has no
      busy signal of the app's), Dynalist and obsidian-true-outliner (5 and 7). Rejudged after: errors
      none in any app; a column of cases not run as they are now (1 to 3 an app), which the next full
      run plays.
20. **Driver options measured again**, every value of every option against every block app's stored
    run. `run.ts` takes values to merge into a driver's own for a run (`OURUS_SXS_BEHAVES='{"option":
    "value"}'`): with `--rejudge`, what the app did is judged again under them in under 2 s, no app
    run, so a value's fit is measured without editing the driver (in a copy of `.sxs`, `OURUS_SXS_DIR`,
    as a rejudge rewrites the stored run). The values the drivers set held: of some 180, one
    alternative fits better, AFFiNE's `enterOnEmptyItem: outdent` by 2 cases, too few to overturn its
    measurement. Of the options left at ourus's defaults, these fit, the newer drivers' most (measured
    when the spec was smaller, and before some values were ourus's): Lexical `quirkPasteText:
    dynalist` (a text alone pastes as plain text: Lexical reads Markdown only from HTML, 38 cases),
    `enterSplitSpace: start` (27), `backspaceAtItemStart: unwrap` (13), `enterOnEmptyItem: outdent`,
    `taskEditing: unwrap`; AFFiNE `enterSplitSpace: start` (21), `backspaceAtItemStart: unwrap` (14),
    `pastePlainLines: items` (10); Mubu `pastePlainLines: items`; BlockNote `selectionLadder: top`;
    Tana `enterTask: plain`, `emptyItemWithChildren: refuse`, `pasteLines: items`; Moo.do `enterMidItem:
    child`; WorkFlowy and Dynalist `taskEditing: block`; RemNote's two setups `pastePlainLines: items`.
    Each app's together, rejudged: Lexical 83 cases better, AFFiNE 45, Mubu 14 (3 worse), Tana 13 (2
    worse), RemNote 7 and 5, BlockNote 6, Moo.do 5, WorkFlowy 4, Dynalist 2, none worse elsewhere
    (Tine's `emptyItemWithChildren: refuse`, 2 better and 1 worse, not taken). Declared in the drivers,
    in their READMEs with their cases. Rejudged, against run D's table: Lexical 49% to 63%, AFFiNE 54%
    to 61%, Tana 72% to 75%, Mubu, Moo.do, BlockNote and SiYuan 2 points each, the rest 0 or 1; no app
    with an error.
    - A unit test that times itself (a write in a long list taking time in proportion to its length)
      failed once in five runs, under a rejudge's load beside it: the machine's, not the code's.
21. **The text apps' disagreements**, the lowest scores (26% to 41%), looked at as the block apps' were:
    three families (Obsidian's four setups, on CodeMirror as SilverBullet is, so the two not quite
    apart; SilverBullet; Emacs). 250 cases have all three one way against ourus, and they are what
    ourus is: Backspace and Delete join blocks and take a heading's `# ` or a setext `===` as a unit,
    Enter splits a block, where a text editor deletes or adds a character (Backspace18, `# ┃Hello`,
    gives `Hello` in ourus and `#┃Hello` in all three); the score of a text app measures that. Where
    one family alone disagrees, the other two agreeing (Emacs 74, Obsidian 55, SilverBullet 25), it is
    the app's, each documented in its README: Emacs's RET continuing no list (markdown-mode's; M-RET
    measured worse) and typing over a region leaving it (no `delete-selection-mode` under `-Q`);
    Obsidian's fence closing (three backticks whatever was typed, none for `~~~`, kept after a
    Backspace), 1.15.0's line moves (a heading without its section, the last line past the document's
    end), its own indenting of code and numbered lists. No driver bug among them.
    The block apps' outliers left after the options (a case 9 families or more agree on, one app not:
    SiYuan 80, AFFiNE 52, Mubu 51, BlockNote 50, Lexical 48) read the same way: SiYuan's Delete at an
    item's end moves the next item's paragraph into it (a SiYuan item a container of blocks), and its
    Shift+Enter drops the space before the break; Mubu's Backspace joins into a previous sibling only,
    and none with children; AFFiNE's makes an empty item a paragraph. The apps' own, in their READMEs.
22. **Run E**, a full run with all of the above: 22 apps in 18 min 24 s, nothing refused or stuck, no
    SiYuan abnormal state, the cases not run as they were played. One regression, Moo.do's 10 errors
    ("Execution context was destroyed", `_rootItem` undefined): its reload of itself as its service
    worker takes over came after `open` had returned, in the first tests' loads, under the run's load.
    `open` now waits for it (no service worker controlling the page yet: the navigation it makes, then
    the app again), and a load that meets one waits for the app and loads once more. Moo.do, Lexical,
    AFFiNE and Mubu again after: Moo.do no error, the three others as in run E. Rejudged, against run
    D's table: no app with an error (17 before); Lexical 49% to 63%, AFFiNE 54% to 61%, Tana 72% to
    75%, Mubu, Moo.do and SiYuan 2 points each, WorkFlowy, RemNote (nbl) and BlockNote 1, the others as
    they were; every block app with fewer disagreements (by 2 to 66).
23. **Roam's flakes, looked into, not fixed.** Played five times over (`--repeat`), the cases that differ
    between runs are a key right after Shift+Enter that Roam doesn't take (ShiftEnter11, 12, 13, 21: the
    line break stays after the Backspace), some 1% of the plays. Not the pace (a key 250 ms after the
    last, three flaky as at 100 ms); not an echo (Roam sends no writes from the help graph, and the
    textarea read 0.3 s to 2 s after held the Backspace, 60 plays of three shapes); not the window's
    focus (a window behind another, its focus emulated, took every key, 24 plays); not a state an
    earlier case leaves (one worker, three plays of both files: none). Two runs later, with two workers
    and with four, none either: intermittent, and not reproduced on demand. Open, with these ruled out;
    the README's note on an undo under load (Scenario16) may be the same.
24. **Logseq's disagreements, one by one.** Every case either Logseq doesn't play as ourus does (OG
    180, DB 158), ranked by how many other block apps agree with ourus there. Three were the harness's:
    - **A number read wrong.** After a paste into `1. a┃`, `a`'s content has lost its property line but
      its properties keep the number, and the page shows `1.` to `4.`; the driver looked for two other
      spellings of the property's name than the API's (`logseq.orderListType`), and read `a` as
      unnumbered (PasteListForm2, Regression63, Regression170). The README's "Logseq bug 7", a paste
      taking the number away, was this misreading; it now says what the paste does to the content.
    - **A drop aimed before the press.** Pressing a bullet ends the editing; a code block being edited
      renders again 15 px shorter, and the block below moves up from under the point computed before
      the press: the drop of a code block after `b` moved nothing (MoveSubtree22, OG). `gesture`
      takes its target as a function now, found once the drag has started.
    - **A last step that tests nothing on blocks.** Enter on the last empty item leaves the list, an
      empty paragraph, which a block app's empty block already is: ourus's blocks don't change, the
      app adds one (QuoteAtom12, QuoteAtom13, QuoteText9 in the six quote-as-text apps, Enter28 in
      Roam and Athens: 23 plays). The plan skipped a case whose every step was so; it now also drops
      the steps a case ends with that are.

    Rerun: OG agree 697 to 700 (disagree 116 to 112; Outdent10 once a caret, a selection read late, 3 of
    3 since), DB unchanged; the rejudge took 4 to 6 disagreements off each quote-as-text app. The rest is
    Logseq's, checked case by case and in the READMEs: it trims a block's text when it saves it (indent,
    outdent: Regression76, TO10, TO11); it pairs brackets, backticks, `~`, `$` its own way (Auto*,
    Backtick32, Regression133); OG's heading `#`s and task markers are text (caret before them, Alt+U
    taking them, Regression135, Regression146); pasted Markdown is text unless it reads as blocks, a
    heading keeping its paragraph, a numbered list staying text (Paste2, Paste10, PasteListForm1, 3);
    a selection dragged whichever bullet is pressed (MoveSubtree5); DB's code editor, CodeMirror, keeps
    Alt+Shift+Down, Shift+Enter and Ctrl+Shift+V from Logseq (Lists5, TO-Lazyc, Fence8, PastePlain28);
    DB's Backspace won't join a block into a numbered one (Quirk3), and in an empty first block goes to
    the page's title (Backspace43b). One is ourus's choice to make: after Backspace takes a number,
    Logseq numbers the run below from 1 again, where ourus keeps `3.` (Backspace29, TO-Bug269).
25. **A copy written otherwise is the same copy.** A clipboard that reads as the same Markdown as
    ourus's (Logseq's tab before a child's `-`, no final line break) was graded `whitespace`; it now
    agrees, the harness reading both as Markdown (`sameMarkdown`: the outline, the list kinds, the text,
    a code block's lines as written). 33 plays in 11 apps moved off `whitespace`, most to agree; Cut4
    and SubtreeEdit6 to `caret`, which the clipboard's grade had hidden (after a cut of selected
    blocks, the app has no caret, where ourus has one in the next block). Logseq's other whitespace
    cases, read one by one, are its own: it trims a block's edges on saving it (TO8, TO10, Regression76,
    DB TO-MarkerCol) and otherwise keeps whitespace as typed or pasted where ourus's Markdown drops it
    (a space before a split, Enter35, Regression81, Regression102, ShiftEnter30, QuoteText19; a pasted
    text's leading spaces and line break, PastePlain19, PastePlain25, Regression140, 141; a pasted
    trailing line break, PasteList17, QuoteText14; a later line's leading space, Placeholder19); it
    writes literally what ourus escapes, so a pasted `*x*` meant as text renders italic there
    (PasteHtml15, Regression89, ShiftEnter32); its code editor neither carries a line's indentation
    on Enter nor re-indents a paste to the fence's (Fence3, PastePlain30).
26. **A delete of selected blocks is a `deleteSubtree`.** An app that leaves no caret after
    `deleteSubtree` (`noCaretAfter`) was still judged on its caret after a Backspace, Delete or cut of
    blocks selected whole, the same keys its driver plays `deleteSubtree` with. The runner names such an
    action `deleteSubtree` for that check now, when the step's `selectSubtree` came just before it or the
    step starts from selected blocks (`noCaretName`): 21 plays in 8 apps from `caret` to agree (Cut4,
    Regression97, Regression113, Regression180, SubtreeEdit1, 2, 4, 6). Logseq's other caret cases are
    its own: OG's heading `#`s and task markers are text, the caret going before them (CursorHome8 to 10,
    CursorUp2, Outdent17, 18); the caret goes by pixels (CursorUp3, CursorDown5); a block re-rendered
    after a move, a redo or an indent has its caret at its end (MoveUp23, Regression162, 174, 175,
    Scenario11); a pasted code block leaves it after the closing fence (PasteList15, 26); Escape twice
    leaves neither caret nor selection (Select1); Ctrl-A, Shift-Up and Shift-Down select their own way
    (Select2, 3, 6, 9, 10, 14); Backspace on an empty first block throws in OG and goes to the page's
    title in DB (Backspace17, 43, 43b).
27. **A `#` that is text, starting a block, is no heading.** The projection dropped a first line's
    escape for outliners, a block's text needing none, so `\# def` (ourus's text) and `# def` (an app's
    heading) were the same block: Enter before `# def` agreed in Logseq, which makes it a heading, as in
    Roam, which keeps it text. Now a driver whose app's blocks have headings says so (`headings`, 14 of
    16 block drivers): the projection keeps that escape, as it keeps `1\.` where blocks are numbered;
    `sameText` and the whitespace grade tell a heading starting a block from a `#` that is text (a
    space before it, ` # b`, being that escape written otherwise); and the drivers whose heading is an
    attribute (Roam, Dynalist, WorkFlowy, Mubu, RemNote, Tana, AFFiNE, Lexical, BlockNote, Logseq DB)
    load `\# x` as the text `# x` and read it so, through the escape offset numbers have (`cut`).
    Logseq OG, Athens, Tine, Moo.do and SiYuan hold Markdown in a block, the escape with it. Found
    on the way:
    - **An empty heading** (`#` alone, Regression168) loaded as the text `#` in the six apps with no
      heading without text: declined there now, as RemNote's bulletless documents and Logseq DB did.
    - **ourus's plain paste under `pastePlainLines: enter` in a quote read as an atom** was handed to
      the host, which wrote the second line at column 0, out of the item and the quote (`- > ax⏎# y`).
      Each line is typed into the quote now, as `text` puts them, and each break is Enter's in a quote
      (`enterInQuote`): Dynalist, the option's app, agrees on 9 more cases (PastePlain18, Paste23,
      Paste25, Quote76, QuoteText12, QuoteText16, QuoteAtom8, Regression111, Regression114).

    A run of the 16 block apps (17 min, no error but the six empty headings, then declined): the cases
    a text `#` starts (Enter9, TaskEnter3, Backspace48, Delete32, Placeholder18, PasteHtml15,
    PastePlain18) agree where the app keeps it text and disagree where it makes a heading: Logseq OG,
    Athens and Tine (`# ` in the text), Moo.do and SiYuan (a header), Logseq DB on Enter (its heading
    property), AFFiNE, Mubu, WorkFlowy and RemNote on a pasted `# ` line. Roam's known lost key after a
    structural key showed again (Placeholder1, 5, Undo3), a selection was read late (Logseq
    Outdent8), and BlockNote's Enter in Regression24c came out otherwise than in the last run.
28. **The flakes, one by one.**
    - **Roam's lost key is Roam's own race.** It saves a block's text 700 ms after the last input, and
      a key landing as the save runs is lost: with the page's CPU slowed 6× (Chrome's throttling, now
      `OURUS_SXS_THROTTLE=N` for any run), a Backspace sent 675 or 700 ms after Shift+Enter was gone,
      every other gap from 0 to 1000 ms fine; never on an idle machine (600 to 900 ms, 15 ms apart).
      Under a run of every app a key drifts into that window. Roam's driver now has the runner wait for
      the app's pending timers up to 1 s before each action (`Driver.drainBefore`; `drain` was the undo
      pause's), which costs only where a save is pending: the four cases throttled, none lost.
    - **Regression24c tested ourus's source, not the app**: after Up and Right, ourus's caret is past
      the backslash it wrote (`\┃-`), the text's start; an app's text has no backslash, its Right moves
      past the `-`, and every app, text editors too, disagreed, BlockNote one way or another from run
      to run. The plan now replays ourus action by action and skips a block app's example whose
      character motion moves the projected caret by nothing (12 apps, this case alone).
    - **React's scheduler was work the settling didn't see**: it runs a render as a MessageChannel
      message, which a loaded machine can hold past the quiet window. The idle script counts such
      messages pending till delivered (not past a second). It didn't end Logseq's late selection
      (Outdent10 once more in the next run; 0 in some 100 plays alone, throttled 6× and 20×, in file
      order), so the runner now reads a state that doesn't agree again 300 ms on, after settling, and
      keeps the later where it changed, saying so in the play's `unsettled`: the next one tells a read
      too early from Logseq's own race.
    - **And Roam loses keys still, otherwise**, in full runs only (three or four a run, ShiftEnter11 to
      13, Placeholder6, Placeholder8, Undo4). Traced (`OURUS_SXS_KEYTRACE=<apps>`: each key, input and
      focus change, with the editor's text, put in a play that still disagrees after its second look),
      two kinds: a Backspace after Shift+Enter reaching the right textarea, its text right, and no
      `input` after it, Roam having taken the key and done nothing (as at a first block's start, where
      the caret was before the Shift+Enter: its own state behind the textarea's); and after Enter, the
      textarea's `focusout` and no new editor focused by the next step half a second on, its key going
      to the page. Neither shows throttled (6×, 20×), alone or with the files in order. The trace now
      also says what was pending at each key (messages and their age, timers, frames): the next full
      run tells whether Roam's React render was still to come (a message older than the second the
      idle script counts one). It wasn't: Roam's suite alone, throttled 4× and played twice, flaked
      13 cases, these among them, with nothing pending at the lost key, and a Backspace 0 to 1000 ms
      after the drained save lost none. What is known and what to try next is in
      `sxs/roam/README.md`, "Keys lost under load".
    - **BlockNote's side menu that doesn't come** (MoveSubtree5 and 6, the two drags from a selection
      across blocks, both or neither, in half the full runs; never alone, throttled, or in file
      order): the error now says what the page showed instead: no side menu at all, the page visible,
      the editor focused, the start's selection over text. That is BlockNote's side menu frozen for
      good: a press on the handle that started no drag (load) clicked it, opening the handle's menu,
      which freezes the side menu, and a key in the editor then hid both, the menu unclosed, so it never
      unfroze, and ignored the mouse from then on. Reproduced by hand (a click on the handle, one key,
      hovering), undone by `unfreezeMenu()`: the driver does that as each test loads and around each
      drag (`sxs/blocknote/README.md`).
29. **The cases most apps disagree on.** Ranked by families disagreeing, the top is pastes, HTML above
    all, where the apps disagree as much among themselves (Word's lists, a code span's spaces, a
    Logseq copy's XSLT notice, PasteHtml3): no answer to take. Ranked by the largest group of families
    with one outcome that isn't ourus's:
    - whitespace, most of it: spaces kept where ourus drops them (Placeholder9, 17, Regression81,
      102, ShiftEnter30, 32, 33): the decisions left open;
    - a step mid-example that changes only what blocks can't show (QuoteText8: Enter leaving the
      list, an empty block already, makes another in the app, and the typing after lands elsewhere):
      the judge stops at such a step where the app changed something, on the steps before (skipped
      where none was compared); QuoteText8 agrees in six apps;
    - a copy at a caret: Lexical and Mubu copy nothing, `copyAtCaret: host`, now declared (Cut4,
      Regression180 agree; Copy4, Copy9 skipped: nothing to compare);
    - heading levels following indent and outdent (Regression144, 145, Outdent4, 11): open;
    - the quote-as-text apps (Athens, Dynalist, both Logseqs, Roam, Tine) on some ten quote cases:
      Shift+Enter in a quote a bare line break where ourus writes `> `, the quote kept one;
    - a paste over blocks selected whole: Athens, Logseq, RemNote, Tine and WorkFlowy paste nothing
      (`pasteOverSelection` said so: no value of it did that). Now an option of its own (30).
30. **`pasteOverNodes`, a paste over nodes selected whole**, split from `pasteOverSelection` (which
    keeps a selection inside one node's text): `replace` (the default, the clipboard's nodes in their
    place, as before), `after` (Tana's: they stay, the clipboard's after the last, what `ignore` said
    of them before), `nothing` (a paste and a plain paste taken, nothing pasted, the nodes still
    selected, as typing over them is). In ourus (`subtrees.ts`), the spec (subtree-selection.md's rule
    3 and 5, SubtreeEdit17 under `after`, SubtreeEdit18 and SubtreeEdit19 new), the differential test's
    options. Measured on the stored runs: `nothing` fits Athens, both Logseqs, both RemNotes, Tine and
    WorkFlowy (SubtreeEdit11, SubtreeEdit14, SubtreeEdit18, RemNote's Regression72; no case worse in
    any), `after` Tana; BlockNote and Roam keep `replace` (Roam a caret off), Dynalist too, pasting list
    markers as text; SiYuan pastes at the document's start, none of the three; AFFiNE, Lexical, Mubu
    and Moo.do select a block's text, not blocks. Declared so.
31. **`heldSpace: repair | trim`, the space a deleted first character leaves** (`- a┃ b`, Backspace),
    held as text while the caret is there. Probed in 15 situations on every app (`held` probes: an
    item with and without children, before a fence or a `#`, a later line, a paragraph, a quote, a
    heading, a task, numbered, Tab, Enter, a move, undo), four camps: block apps that keep it as their
    text (12), block apps that trim every edge as they store a block (Logseq ×2, RemNote ×2), the
    Obsidians, which keep it and re-indent the children (4), and SilverBullet and Emacs, which keep it
    and break the structure (a child a sibling, ` # b` a heading, `` ``` x`` a fence). Independent of
    `enterSplitSpace`: the Obsidians drop a split's spaces and keep this one. ourus dropped it as the
    caret left; now `repair`, the default, keeps it, the user's: the text's padding, its children and
    later lines moved right with it, a marker after it escaped, kept only where text follows it on its
    line; `trim` drops it, as before. In the writer (`#settleHeldSpaces` decides; settling keeps the
    character for the draft; a read item's padding moves its children, `lifted`), the spec
    (Placeholder9, 17, 18, SoftBackspace11, Backspace47, ShiftEnter30, 32 under `repair`, each with a
    `trim` variant, `b`; the rules and transitions of placeholders.md). Rejudged: 59 plays better in
    16 apps (all four Obsidians on Placeholder9), the 10 worse Logseq's and RemNote's, which declare
    `trim` now: 12 better there, none worse.

32. **Views drawn on their rows, and Roam's Escape.** A state's view was a last line of its drawing,
    `⟦folded 1; zoom none⟧` (from `25-view`); it is marks now, right after the row's line, no space
    before them (a line's own trailing space shows as its own): `- a┃⟦folded⟧`, `- b⟦zoomed⟧`
    (`sxs/lib/view.ts`; a block's first line, a text's line; none drawn, nothing folded and no zoom).
    Stored runs' last lines still read; the first version broke that (a stored start redrawn
    otherwise than its case's, 131 fold and zoom cases "not run"), caught, both readbacks fixed. The
    probe now applies a case's `folded:` and `zoom:` (it never had: its ourus played them unfolded).
    Roam's `selectNode` was two Escapes, "the first does nothing": a block selection outlives its
    page in Roam, and a test's leftover took the first; on a clean start the two selected and cleared.
    The load clears a leftover now, and `selectNode` is one Escape: Roam's suite again, 679 to 692
    agree, none worse (Select15, 19, 20, 21; Select1's first step; its second, a second Escape clearing
    the selection, Roam's).

## 5. Verified

On this container (10 CPUs, `pids.max` 2048).

**Single runs**, each against the judgment committed in `.sxs` (`run.ts --compare`):

| run | what it showed | against HEAD |
| --- | --- | --- |
| `logseq indent.md`, no pool | pool, proxy, 2 browsers started; 2 windows, one per browser; 16 s | same verdicts |
| the same again | "taken over, loaded … in 0.5s", both workers | same |
| the same, pool of older code running | the old pool drained and replaced, its detached proxy replaced by the pool's | same |
| `logseq` (all), `kill -9` 4 s in | its 4 leased windows destroyed the same second ("left without releasing it"), contexts disposed; browsers stay | — |
| `remnote,remnote-bl indent.md` at once | 4 windows, 4 contexts, the two setups in both browsers; 0 errors | 0 moved, 0 worse |
| `siyuan indent.md` | a kernel per window on a new workspace; kernels kept with the warm windows | 0 moved |
| the same again | taken over in 1.1 s, kernels kept | 0 moved |
| `obsidian,obsidian-lp indent.md` | 2 instances, a window of each setup in each | 0 moved |
| `obsidian indent.md` again | took over the setup's windows, 0.7 s | 0 moved |
| `mubu,affine,lexical,moodo indent.md` | the four added apps on the pool; 0 errors | 0 moved from their earlier results |
| `logseq,emacs-markdown indent.md` | room granted at once; the pool of older code drained | 0 moved |
| `logseq,silverbullet,moodo indent.md`, twice | through the scoped endpoint; the second taken over in 0.4, 0.6, 5.5 s | the same both times |

**Full runs** (`node sxs/run.ts all`, 22 apps, 18,995 examples):

| run | time | apps done | refused | stuck, stalled |
| --- | --- | --- | --- | --- |
| G1 | 22 min 8 s | 22 | 0 | 0, 0 |
| G2 | 20 min 57 s | 21 (Tana: the proxy, §4, 14) | 0 | 0, 0 |
| G3 | 19 min 52 s | 22 | 0 | 0, 0 |
| C (a cold cache, §4, 16) | 21 min 17 s | 21 (Tine: its new bundle, §4, 16) | 0 | 0, 0 |
| D (the clipboard held only while needed, 2 × 12 windows) | 16 min 46 s | 22 | 0 | 0, 0 |
| E (§4, 22) | 18 min 24 s | 22 | 0 | 0, 0 |
| the 16 block apps (§4, 27: `headings`) | 17 min | 16 | 0 | 0, 0 |
| H1 (MessageChannel messages counted, §4, 28) | 20 min 32 s | 22 | 0 | 0, 0 |
| H2, H3 | stopped | — | — | — (H2: the second look's step lookup crashed, 47 errors in Athens; H3: the spec edited under it, an option its processes didn't know) |
| H4 (everything in, `pasteOverNodes` declared) | 29 min 51 s | 22 | 0 | 0, 0 (another agent's runs on the machine too) |
| H5 (keys traced for Roam and the Logseqs) | 25 min 48 s | 22 | 0 | 0, 0 |
| H6 (`heldSpace` in, Logseq and RemNote `trim`) | 24 min 24 s | 22 | 0 | 0, 0 (BlockNote's MoveSubtree5: its frozen side menu, fixed after it, the file run again: caret, no error) |

**G1 against HEAD** (the judgment committed in `.sxs`, run on the design before): of the 18 apps it
had, 12 the same example for example (athens, dynalist, emacs-markdown, logseq-db, obsidian,
obsidian-lp, obsidian-outliner, remnote, remnote-bl, silverbullet, tana, workflowy; logseq-db with one
example's state other, its verdict the same); logseq, tine, obsidian-true-outliner, blocknote one to
three examples moved each; roam 5 better and 2 worse; siyuan 16 better and 15 worse (§6). Errors as
committed, but for BlockNote's MoveSubtree5 (caret, an error in A, G1 and G2: its drag's
`waitForFunction` 5 s) and obsidian-true-outliner's Fold3 (an error in G1, caret again in G2). The
four added apps against their earlier results: 75 to 109 examples each that only main has, 1 to 5 better,
none worse, 0 errors.

**G1 against G2**: 52 of 18,995 examples differ (0.27%); 15 of 21 apps the same throughout. Where
they differ: siyuan 29, roam 8, dynalist 5, obsidian-true-outliner 5, logseq 2 (Outdent8 and Outdent10
trading caret and agree), blocknote 2, affine 1 (an example's state).

**G3 against G1 and G2**: 219 and 238 differ, 180 of them Obsidian's, its release (§4, 15: obsidian
80, obsidian-lp 90, obsidian-outliner 10; G1 and G2 ran 1.14.5, G3 1.15.0). Without those three apps,
39 and 58 of 15,534 (0.25%, 0.37%), the same apps as between G1 and G2: siyuan 21 and 32, roam 8 and
10, dynalist 0 and 5 (G2's five lost Enters, §6), obsidian-true-outliner 5, blocknote 1 and 3, the
rest one or two. BlockNote's MoveSubtree5 played in G3 (no error), as it hadn't in A, G1, G2.

**The four Obsidian setups again**, on the code after G3 (instances by version, three of them, §4,
15): 7 min 34 s, all four on 1.15.0, three instances of it (`status`: `1.15.0 (installer 1.15.0)`), no
error in any (G3 had one or two in three of them). Against G3: obsidian, obsidian-lp and
obsidian-outliner the same example for example; obsidian-true-outliner 5 (MoveSubtree3, 12, 21, 23,
Scenario8b: its drags, the five that differ between every two runs).

**The judgment now against HEAD** (`run.ts all,-NO --compare`, before H6, 22 apps): 76 more agreements,
87 cases better, 13 worse. Better: the held space (`repair`), `pasteOverNodes`, `copyAtCaret`, the
literal `#`, the no-caret rule, Logseq's number and drop, the `enter` paste. Worse: 11 flakes (Roam's
lost keys, 7; BlockNote's MoveSubtree5 and 6, its drag's error; a drop each in Tana and
true-outliner), Logseq DB's ShiftEnter32 (a heading it makes after Shift+Enter, the old projection's
heading and text `#` the same) and a caret in true-outliner. Gone: cases skipped now by design
(Regression24c's escape motion, SubtreeEdit17's option moved, Copy4 and Copy9 where nothing is copied
at a caret, steps blocks can't show). New: 36 cells, the `trim` variants playing for Logseq and RemNote.

## 6. Left open

- **Lost keys under load**: SiYuan's Tab sometimes doesn't indent (Indent, Outdent and TO cases, 29
  to 35 between two runs), Dynalist's Enter in five quote examples of G2 did nothing, the state as
  loaded. Neither is the pool's: SiYuan's committed runs, on the design before, flipped the same cases
  (Indent3, Indent6, TO11 between `25-view` and `26-marks`). Both grew with load; what drops the key
  (the app not ready for it, a window behind another's) isn't known.
- **Logseq's selection after an outdent** (Outdent8, Outdent10) missed its last block once a full run
  or so; not in H1, H4 or H5, nor in some 100 plays alone. A state that doesn't agree is read again 300
  ms on (§4, 28), so a next one says whether it was read too early.
- **Obsidian's committed results** are of 1.14.5; the uncommitted ones 1.15.0's (§4, 15), some 50 more
  agreements each for obsidian and obsidian-lp.
- **Roam loses keys under load**, three or four cases a full run: its save's race is waited out
  (`drainBefore`), and what is left, a Backspace taken and nothing done, the focus lost after Enter,
  reproduces in Roam's suite alone throttled 4× (13 flaky over two passes, 7 minutes). What is known,
  ruled out and next is in `sxs/roam/README.md`, "Keys lost under load".
- **Drops that don't take under load**: Tana's MoveSubtree24, true-outliner's MoveSubtree3, 12, 21,
  23 and Scenario8b move between runs.
- **The full run's length** is the windows': 22 apps of four workers in twenty windows and three
  Obsidians, the last apps starting late; each app alone takes 1 to 10 minutes. CPUs and the cap are
  both near full, so more windows (§2.9) wouldn't buy much.
- **A dirty release by an error** destroys the window (by design); a run of an app with errors in
  every run (an app that errors on some example each time) never gets a hot start. The errors are
  rare and the cost is a load (seconds); the rule is the user's, kept.
- **Contexts in memory**: a browser that restarts (its flags changed with the pool's code, or it
  crashed) loses its warm windows; they load again.
- **The pool's environment** is its starter's: `OURUS_PROXY_PORT`, `OURUS_SXS_*`, `CHROMIUM` are read
  as the pool starts, so a run with others than the running pool's gets the pool's (`pool.ts stop`
  first; `--help` says what it reads).
- **A warm window's key** is the driver's URL and the idle script, not the driver's code: a driver's
  `open` changed takes over a window the old `open` set up. `--fresh` then.
- **Emacs** isn't the pool's (the user's choice): its room is, so it starts only where it fits, but
  nothing the pool does stops or restarts it.

**Decisions left to the user**, where many apps agree with each other and not with ourus (§4, 21,
24, 29):

1. **Spaces at a caret's edges**, what is left of it: the spaces before a split or a line break,
   which ourus drops and 8 to 12 families keep (Regression76, Regression81, Regression102, Enter35,
   Regression140, Regression141). The space a deleted first character leaves is an option now (31).
2. **Heading levels following an indent or an outdent**: ourus re-levels a heading to its new depth
   (`## C` indented under `## B` is `### C`); 8 block families keep the level (Regression144,
   Regression145, Outdent4, Outdent11).
3. **ShiftEnter33**: ourus refuses Shift+Enter at the start of an item's text below its marker
   (`-⏎  ┃ three`); 9 families make the line.
4. **Renumbering after Backspace takes a number**: Logseq numbers the run below from 1 again, ourus
   keeps `3.` (Backspace29, TO-Bug269), under ourus's own `backspaceAtItemStart: logseq`.
5. **Shift+Enter in a quote held as text** (`quotes: atom`): Athens, Dynalist, both Logseqs, Roam and
   Tine put a bare line break, ourus `> `, keeping the quote one in Markdown (Regression184,
   Regression185, and some eight more quote cases).
6. **A checkbox frame blind to the flavor** (§4, 19): ourus's frame takes a checkbox the flavor
   reads as no task (`[a]` in GFM, `[x]` in CommonMark) for a task's box, where the projection now
   reads it by the flavor (Regression44, 45, 46, 55, 59, 85, 181, ShiftEnter26b).

# Part 2: four more apps, Mubu, AFFiNE, Lexical, Moo.do

## 7. The four apps

Four apps the SxS lacked, added with the pool: two outliners, Mubu and Moo.do, and two free-form
block editors, AFFiNE and Lexical. Each runs with no account and reaches no server once its pages are
cached; each has a driver, a README of its keys and quirks (`sxs/<app>/README.md`, what it does for
good), and the values of ourus's options it was measured to fit. None needed a change for the pool:
none calls a context-level API (§1's catch).

As G3 played them (§5), of the examples run:

| | app | model | agree | caret | whitespace | disagree | error | skipped |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MB | [Mubu](../sxs/mubu.md) | outliner | 354 | 14 | 14 | 170 | 0 | 938 |
| AF | [AFFiNE](../sxs/affine.md) | free form | 402 | 5 | 61 | 272 | 0 | 750 |
| LX | [Lexical](../sxs/lexical.md) | free form | 288 | 7 | 67 | 230 | 0 | 898 |
| MD | [Moo.do](../sxs/moodo.md) | outliner | 307 | 13 | 5 | 153 | 0 | 1012 |

(Measured first on the spec of the time, 1143 examples: Mubu 307, AFFiNE 349, Lexical 241, Moo.do 269
agreements; Moo.do went from 182 in its first full run to 269 as the leaks between its tests (§11.4),
its numbers and offsets (§11.5) and its options were fixed. The spec has grown since, which is most of
the difference.)

**How they were chosen.** Against the bar the SxS has kept since [`10-sxs.md`](10-sxs.md) §19 (a live
demo with no account, or open source that runs here; since [`14-sxs.md`](14-sxs.md), a login a cookie
can carry), the candidates were: Notion (most used, best evidence for mixed documents; its published
pages may load its editor read-only, as Mubu's do, not yet tried), AFFiNE (a demo workspace with no
account), Org-mode in Emacs (the existing Emacs driver), Milkdown or Vditor (a stand-in for Typora),
Lexical's playground (a second library baseline beside BlockNote), Anytype, Craft's web editor,
Checkvist, Vimflowy, Trilium. Tried and dropped before: Typora (its license), VS Code, MarkText, outl,
Unified Outliner; Zettlr and Joplin are CodeMirror's lists, which Obsidian covers. Mubu came from the
user, with its trick (a shared outline made editable, saving nothing); AFFiNE and Lexical were next on
the list; Moo.do came from the user too. For Lexical the user suggested Ctrl+] as the indent (§10).

## 8. Mubu

**A shared outline, made editable.** https://mubu.com/explore/rHSdgLpbl opens Mubu's own editor
(the `Outliner` and `DocEditor` bundles) read-only to a visitor. The editor's `editable` setting
(`state.doc.outliner.config`, reached through React's fiber tree, the first `store` prop) turns it
into the owner's editor: Enter, Tab, moves, undo. Saving is checked apart from the editor, by the
member's permission, which logs `change action in readonly mode!` and drops the change. No bundle is
patched. The sign-in dialog a visitor gets (`state.modal.loginModal`) is closed by the app's own
action (`@modal/set_login_modal_visible`) whenever the store says it opened.

**Traffic.** The outline itself comes by POST (`/v3/api/explore/get`), and so does most of the API:
[`sxs/mubu/proxy.ts`](../sxs/mubu/proxy.ts) caches every POST to `api2.mubu.com` by its body, so only a
cold cache's first load reaches Mubu (and adds one to the outline's public count of reads). Its
reports on the visitor (device, app, events), with a fresh id or time in every body, are answered
locally, with the CORS headers Mubu's API sends (§13); the A/B config, asked for under the browser's
device id, is cached under none.

**The keys** are in the bundle's keymap (`CmdOrCtrl + Shift + ArrowUp` → `MoveUp`, …): moves
Ctrl+Shift+Up/Down, delete Ctrl+Shift+Backspace, duplicate Ctrl+D; Shift+Enter is the note, so the
spec's line break has no key (69 cases skip). No key for the outline's ends: Up or Down until the
caret stops, coming back down from the title, which the `editable` setting makes editable too.

**Reading.** A node's text is runs (`{ type: 1, text, style }`); given as a string it is read as HTML,
so the driver makes runs. A task is `taskStatus` 1 or 2, a heading `heading` 1 to 3. The caret is the
DOM's selection in the focused `mm-editor`; nodes selected whole are the selection service's.

**What Mubu does.** Backspace joins only into the previous sibling (`mergeToPrevNode`); on a node's
only line, Up and Down go to its start and end first; a node's trailing spaces aren't drawn (the
model keeps them), so a caret past them has no place (Enter58, declined by `holds`). Measured with
`--ignore-options`: `outdent: logical`, `enterSplitSpace: start`, the three `refuse` options,
`headingEditing: block`, `pasteLines: items`, `pasteOverSelection: ignore`, which took it from 240
agreements to 307.

## 9. AFFiNE

**The demo workspace.** A new browser's first visit to https://app.affine.pro/ makes a workspace
kept in IndexedDB and opens "Getting Started"; a later visit opens the list of docs. The doc's id is
the workspace's own (`EcANdpqyZJ` in one, `p8Dk8hv-pX` in a fresh one), which a first version took as
fixed: the driver follows the list's link by the doc's title. (Under the pool every window is a new
context, so every open is a first visit.)

**The editor** is `window.currentEditor` (AFFiNE puts it there): BlockSuite's store (`doc`:
`addBlock`, `deleteBlock`, `resetHistory`) and its standard library (`std.selection`, `std.view`). A
test's blocks replace the first note's (every other note deleted); paragraphs, headings, quotes and
code are free blocks, list items items, as BlockNote's driver has them (`liftOwned`,
`asMarkdownReads`). The caret: the page's editor (`affine-page-root`, the one `contenteditable`)
focused, then the block's inline editor's range; a backward one is BlockSuite's text selection again,
reversed. Up from the first block goes into the doc's title, outside the page's editor, and the
selection model keeps the stale caret: the driver reads a caret only while the page's editor has the
focus.

**Two keys needed a capital.** BlockSuite's `Shift-Mod-z` matches the key Shift makes; Playwright's
`Control+Shift+z` sends `z` with Shift, which matches nothing: redo is `Control+Shift+Z`, and so
`Control+Shift+V`. (Lexical's shortcut table is the same.)

**A numbered item keeps its number.** Each AFFiNE list item draws its own `order`, which a move leaves
as it was: after moving `1. a` down, AFFiNE shows `2. b` above `1. a`. The first read counted on from
the first item (`2. b`, `3. a`), a state nobody saw; the driver reads the number drawn.

**Traffic.** The two GraphQL queries at startup are cached by body; AFFiNE's telemetry and
Cloudflare's bot check (a POST to a URL of its own each load) are answered locally.

**What AFFiNE does**, measured: Backspace at an item's start makes a paragraph where it is; Enter on
an empty item too; Enter at a text's start keeps the caret with the text; a paste opens both seams; a
list after a paragraph is no block's; a move stays among the siblings, and a heading moves alone (no
section). `--ignore-options` took it from 292 agreements to 349.

## 10. Lexical

**The playground**, opened empty and without its debug view by its own URL settings
(`?emptyEditor=true&showTreeView=false`). The editor is on its root element (`__lexicalEditor`): a
test goes in as a serialized editor state (`parseEditorState`, `setEditorState`), the history is
cleared by the playground's `CLEAR_HISTORY_COMMAND`, found among the editor's commands by its name,
and the caret is a DOM selection Lexical takes as its own. Reading walks the state's node map
(`__first`, `__next`) and its selection points (a text node's offset, or an element's child index).

**Indent.** Tab indents only at a line's start and types a tab elsewhere (`TabIndentationPlugin`);
Ctrl+], the playground's "Indent" (the user's suggestion), indents from anywhere: the driver plays
Ctrl+] and Ctrl+[. Ctrl+] on a paragraph gives it an indent, a padding Markdown has no form for: not
read.

**Two driver bugs the indent cases found.** Headings came back without their sections (the read
needs `asMarkdownReads`, as BlockNote's does). And Lexical indents even the first item, which leaves a
nested list with no item above it: a depth the outline can't hold, which crashed the comparison
(`Invalid array length`, outside the runner's try). Its HTML, `<li><ul><li>a</li></ul></li>`, reads in
Markdown as an empty item holding the list, and so the driver reads it.

**Lists of one kind.** A Lexical list is bullets, numbers or to-dos; a bullet then a to-do were
skipped (21 cases) until the driver loaded items of another kind at the top level as a list of their
own after the first.

**No structural keys.** The playground has none for moving, deleting or duplicating a block: 152
examples skip for those. Measured: `enterAtTextStart: stay`, `enterInQuote: split`,
`headingEditing: block`, `pastePlainLines: enter`.

## 11. Moo.do

### 11.1 The app's modules

https://www.moo.do/demo/ frames `/web/#demo=true&live=true&data=demo-help`, which the driver opens.
Moo.do has become Legend; the demo is a 2022 build. Nothing is on `window`, and only the item being
edited is a `contenteditable`; keys go to a hidden input, and Moo.do draws its caret. The driver
reaches the app's modules through its webpack runtime (`webpackChunkLegend.push` hands over the
module loader), each found by what it has: the item registry (`createVMLI`, `generateID`), the
history (`undoStack`), the selection (`setSelectionIndices`, `getStartItem`), the items selected
whole (`numSelectedInPane`), the change types and the pane update batcher; the document through
React. The hotkey table is in the bundle (`MoveUp: ["win:Se+Sh+ArrowUp", …]`, `Pr` Ctrl, `Se` Alt).

It reloads itself once after its first load (its service worker, installed, takes over the page),
which in a new context is every open: `open` takes a navigation in its ready loop for that reload, and
waits for the app again (§4, 12, where a machine busy with 21 other runs made it come late).

### 11.2 Text and offsets

An item's raw text is Markdown as written, with Moo.do's prefixes: `# ` a header, `[ ` a task (done:
a flag), `1. ` numbered, `- ` a bullet. Moo.do draws the prefix as a marker and the formatting
styled, and counts the caret in what it draws: in `a **bold** b`, offset 3 is after `a b`. The driver
aligns the drawn text with the raw text, character by character, both ways.

### 11.3 Settling

Every example took 16 to 21 seconds: framer-motion's frame loop never stops in Moo.do (some animation
repeats, drawing nothing: no element's style changes), and the idle script counts a pending frame as
work. [`sxs/lib/idle.ts`](../sxs/lib/idle.ts) has an option, `frames: false`, for such an app:
settling is timers and quiet. Examples take half a second now.

### 11.4 State that leaked between tests

The full run disagreed on 20 Delete cases that agreed in a run of `delete.md` alone. Not the workers
(one or four, the same), but the order: each spec file was run before `delete.md` in one worker (a
bisect by file, then by case), and two broke it, `copy.md` (its `Cut4`) and `delete-subtree.md`. Nothing
the driver could reset was dirty (the history, the update batcher, both selections), and the first fix
loaded the page anew after any cut or "DeleteItem". The cause was plainer: deleting more than one item
(an item with its children), Moo.do asks "Are you sure you want to delete 2 items?", and the dialog,
unanswered, took every key after it, the pane finishing no delete (a join left the joined item in
place). The driver now plays `cut` and `deleteSubtree` as the user who asked for them does, Y to the
question: every DeleteSubtree case agrees, Cut4's cut deletes, and nothing leaks. A dialog another key
leaves open (Backspace on items selected whole) is closed by loading the page anew before the next
test (`reloadPage`, `lib/browser.ts`). The Enter cases that didn't split in the full run (Enter2,
Enter3) were the same leak.

The first reload broke every test after it (254 errors): on the harness before the pool, a window a
run took over from an earlier run had the settling script only until it reloaded, as a page's init
scripts belong to the connection that added them, and the reused window's run added none. Under the
pool, `run.ts` adds the settling script to every page it drives, a window taken over too, so
`reloadPage` only reloads.

### 11.5 Numbers, offsets and what Moo.do can't start from

Moo.do counts numbered items: a run of them is drawn 1, 2, 3 whatever the raw text's numbers (`5.
three`, third, is drawn `3.`); the driver reads the number drawn (the item's own line in its element's
text), and a list not counting from 1 isn't held. At a boundary between drawn characters Moo.do puts the
caret past the markup (`**b**┃c`, `` `┃x` ``) but before it at the text's start (`┃**b**`), which the
first alignment didn't (Backtick32 held `a ``x``┃ b` for `a ``x┃`` b`): the driver maps a drawn offset
to a raw one so, and back by counting the drawn characters before it. A code span of two backticks
Moo.do rewrites with one, so it isn't held either.

Its selection has no direction (from `ab┃`, Shift+Left gives `a«b»`, a second Shift+Left `a┃b`): a
backward selection is declined. A done task is hidden by the demo's pane (its filter shows what isn't
completed). A block of more than one line would be the item's note.

## 12. The harness, for them

- `sxs/lib/idle.ts`: `frames: false` (§11.3); by default unchanged.
- `sxs/proxy.ts`: Baidu's analytics (`hm.baidu.com`, on Mubu's pages) and Rollbar's error reports
  (`api.rollbar.com`, from Moo.do) are blocked hosts.
- `sxs/lib/browser.ts`: `reloadPage` (§11.4).
- **Each file alone against the full run.** A leak between tests shows as a verdict that changes when
  a spec file runs alone: each file was run alone (`--workers=1 --json=`) and its verdicts compared
  with the full run's. None changed for AFFiNE (631 tests), Lexical (497), Mubu (464) or Moo.do (403,
  after its fixes). `run.md` says how, for the next app. A bisect needs a run per pair of files, each
  holding the app's lock: a probe or a second run of the same app waits for it, or says another run
  has it.
- On the pool: on `indent.md` the four play with no error and none of their verdicts moved from their
  earlier results; in the full runs G1 to G3, none errs, and their verdicts are the same run to run
  but for one AFFiNE example's state (§5).

## 13. What the new apps say about ourus

- **A block-editor profile.** AFFiNE agrees with BlockNote on Backspace at an item's start (a
  paragraph), Enter on an empty item (a paragraph), Enter at a text's start (the caret stays), a paste
  opening both seams, and a list after a paragraph being no block's; Lexical on several of them. Two
  editors on different engines agreeing, each time away from ourus's default in the same direction,
  is a profile: ourus could offer those values together.
- **Headings aren't containers there.** AFFiNE moves a heading alone, its section staying; ourus's
  heading owns its section.
- **Outliners refuse.** Mubu, like WorkFlowy and Dynalist, outdents logically and refuses to join a
  node with children; Backspace joins only into a previous sibling.
- **Moo.do is the weakest evidence**: an abandoned build, its selection without direction, its
  numbers counted rather than written; but on structure it agrees with the outliners (logical outdent,
  refusing to join an empty item with children, moves among siblings).

## 14. Wrong turns, and still open

- **AFFiNE's doc id as a constant.** It is the workspace's own; a fresh browser has another.
- **Mubu's reports answered without CORS headers**: the browser refused the answers, the app's HTTP
  client retried until "retry exhausted", some hundred page errors a run, and the preflights went live
  (39 requests a run).
- **Moo.do's done task "not drawn"**: the load waited for an element the pane's filter hides; it isn't
  slow, it's gone.
- **Moo.do's inverted flag**: the selection's `setArrowSelectInverted` is cleared at once, and the app
  has no direction to keep anyway.
- **Treating the 20 Delete failures as Moo.do's**: they were the test before's. Then **a reload as
  the fix**, after any delete through the pane, before looking at the page: a confirmation dialog,
  which Y answers, was open all along; and the reload lost the settling script in a reused window.
- **Moo.do's raw numbers**: read as written, `1.` twice after Enter, where Moo.do draws `1.` and `2.`.

Still open: FlowUs and Lark Docs through a published page the way Notion is (§15); Org-mode in Emacs. The four drivers are `sxs/mubu/`, `sxs/affine/`, `sxs/lexical/`, `sxs/moodo/`, each
with a README; `node sxs/run.ts MB,AF,LX,MD` runs them (a few minutes each).

## 15. Notion

Mubu's trick again (§8): a page published to the web (`<space>.notion.site/<page>`) opens, with no account, in Notion's own editor, every block read-only to a visitor. `sxs/notion/` makes it editable and saves nothing; `sxs/notion/README.md` has the details a driver needs. `node sxs/run.ts notion` runs it.

- **The proxy does the work** (`sxs/notion/proxy.ts`). Notion's data says the visitor is a `reader`; responses from `/api/v3/*` are rewritten to `editor` before the app builds its stores (changing the role on the stores afterwards doesn't re-render: `canEditText` is computed once). That isn't enough: the editor's mode (`getModeType`) is `edit` only for a signed-in user, so that function is patched in its chunk. The page's own blocks are removed from `loadCachedPageChunkV2`, so every test starts from an empty page. The app's saves and its reports (`saveTransactionsFanout`, `ping`, `etClient`, ...) are answered `{}`, its reads cached by body, and its event collectors (Splunk, Statsig) answered with CORS headers (as with Mubu's reports, a blocked host answered without them makes the app retry for ever). Once the cache is warm a run reaches nothing on the network, `--cache=offline` included.
- **Cloudflare.** An unknown browser is rate-limited after four or five loads (`429`, then a challenge) from that IP, `curl` included; the anonymous cookies and user agent of a real browser (a "Copy as cURL") got past it. The proxy caches every status below 500, so a cached `429` is served for ever: it has to be deleted by hand (`.sxs/http/<host>/`). The cache is git-ignored, so a fresh checkout needs one online load.
- **The document is a page's data, not typed.** The editor draws a block's text from a CRDT (`crdt_data`), not from `properties.title`: writing the record cache changes what the stores report and not what is drawn, and a multi-line paste (and a block selection's Delete) does nothing for a visitor, a gate the role and mode patches don't reach (faking `isLoggedIn` breaks the page). What works is Notion's older record form: blocks with `properties.title`, `content`, `parent_id` and no `crdt_data` render and edit like its own. So `load` puts the test's blocks in the page's URL (`?sxs=` and a cookie of that name: the app may drop the query before it asks), and the proxy builds them into `loadCachedPageChunkV2`'s answer; a load of the page, through `about:blank` (the same renderer reloaded some 150 times crashed), is the test's start. Any text goes in as it is: empty blocks, a first `- `, `--`. It reads the outline from the block stores, found through React from a text leaf (the first `store` that is a page), and the caret from the DOM.
- **What isn't held** (`holds`): markup (a block's title is plain; marks `[text, [["b"]]]` are the next step), an emoji (the DOM selection splits it). Not played yet: undo and redo (the history can't be cleared after a load), duplicate and delete-block, the document's ends. Notion's "Leave site?" on an unsaved edit is accepted (Playwright dismisses it, and the load never came back).
- **Result** (453 examples run, 1038 skipped): 154 agree, 13 caret, 25 whitespace, 261 disagree, no error. The disagreements looked at (Enter, Backspace, move) are Notion's: Backspace at a bullet's start makes a text block and doesn't join, Enter in an empty indented item leaves a level, Tab keeps later siblings where they are. Not all were looked at, and no `behaves` is set yet.
- **Wrong turns**: typing the document first (slow, and it couldn't hold empty blocks or shortcuts); a fix for emoji that left two typing lines in the driver, every text typed twice, and a run of 304 errors, all "holds the starting state differently", the doubled text showing in the report's own diff; a probe proxy left on the pool's port 8899, in offline mode.
