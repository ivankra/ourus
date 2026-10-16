# Side-by-side framework (2026-10-14)

ourus's behavior spec replayed, live and side by side (SxS), in the outliners and editors it is
meant to be compared with: Logseq, WorkFlowy, SilverBullet, Roam, Dynalist, Tine, SiYuan, BlockNote,
the Obsidian desktop app, bare and with each of two outliner plugins, and Emacs with markdown-mode.
Code in `sxs`/ It has a caching proxy, a headless Chromium per app, and a runner that adapts each
spec example to the app, plays it with the app's keys and puts the outcome beside ourus's.
Each app gets a driver; a desktop app's driver starts the app itself (§12), and one served from this
machine, its server (§14); one that is no page at all is played through a session of its driver's (§15).

The apps, where each ran, and the numbers, of the spec's 458 examples (468 until `spec/zzz.md` went),
from each app's last full run, the most agreements first:

| app | where | model | agree (original) | caret | whitespace | disagree | error | skipped |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| [Logseq](#7-logseq) | [demo.logseq.com](https://demo.logseq.com/) | block | 197 (82) | 12 | 19 | 84 | 0 | 146 |
| [Tine](#13-tine) | [tine.page/guide/app](https://tine.page/guide/app/)<br>(made editable via its page) | block | 178 (74) | 14 | 32 | 81 | 0 | 153 |
| [Dynalist](#11-dynalist) | [dynalist.io/demo](https://dynalist.io/demo) | block | 175 (73) | 7 | 30 | 104 | 0 | 142 |
| [SiYuan](#14-siyuan) | its release's kernel, on 127.0.0.1<br>(no public demo; open source) | block | 163 (60) | 9 | 27 | 87 | 0 | 172 |
| [BlockNote](#16-blocknote) | [blocknotejs.org/examples/basic/minimal](https://www.blocknotejs.org/examples/basic/minimal) | block | 131 (48) | 9 | 31 | 128 | 0 | 159 |
| [Roam](#10-roam) | [roamresearch.com/#/app/help](https://roamresearch.com/#/app/help) | block | 151 (72) | 18 | 29 | 86 | 0 | 174 |
| [Obsidian with true-outliner](#126-with-true-outliner) | Live Preview, + true-outliner | text | 143 | 41 | 6 | 200 | 0 | 68 |
| [WorkFlowy](#8-workflowy) | [beta.workflowy.com/guide/embed](https://beta.workflowy.com/guide/embed/) | block | 141 (65) | 11 | 11 | 120 | 0 | 175 |
| [Obsidian with Outliner](#125-with-outliner) | Live Preview, + Outliner | text | 130 | 13 | 5 | 241 | 0 | 69 |
| [SilverBullet](#9-silverbullet) | [demo.silverbullet.md/personal](https://demo.silverbullet.md/personal/)<br>(made editable via its boot config) | text | 111 | 17 | 8 | 265 | 0 | 57 |
| [Obsidian](#124-bare-obsidian-in-source-mode-and-live-preview) | desktop app, Source mode | text | 108 | 11 | 6 | 275 | 0 | 58 |
| [Obsidian, Live Preview](#124-bare-obsidian-in-source-mode-and-live-preview) | desktop app, Live Preview | text | 107 | 11 | 6 | 273 | 0 | 61 |
| [Emacs with markdown-mode](#15-emacs-with-markdown-mode) | Emacs 30.2 on a terminal, markdown-mode 2.8 | text | 75 | 23 | 5 | 302 | 0 | 53 |

Starts an Obsidian setup won't hold (a caret in the frontmatter, by a checkbox, before an item's
text) are skipped with the reason (§12.3). All thirteen at once (`run.ts all`) take about 6 minutes,
cold (an empty `.sxs/`) as warm: within it, Emacs's run takes 3 s, BlockNote's under a minute,
Dynalist's about a minute, Roam's 2, Logseq's 2⅓, WorkFlowy's and Tine's 4, SilverBullet's and SiYuan's 5 and each
Obsidian setup's 5½ to 6. SilverBullet, Obsidian and Emacs edit Markdown text, so their examples are
compared as text, none adapted. Repeated runs give the same
outcome for every example but one: Dynalist's `cursor.md › CursorDown4`, which lands on a pixel
boundary (§20.4). The prototype compared 74 examples, and dropped keys. `sxs/` is 5,655 lines
of TypeScript. `npm test` passes 585 tests with 8 pending. Every app runs from a cold start (an
empty `.sxs/`) to the same verdicts as warm (§21).

## Contents

1. [The task](#1-the-task)
2. [What was built](#2-what-was-built)
3. [Why the prototype ate keys](#3-why-the-prototype-ate-keys)
4. [Settling instead of sleeping](#4-settling-instead-of-sleeping)
5. [From spec buffers to blocks](#5-from-spec-buffers-to-blocks)
6. [The proxy and the shared browser](#6-the-proxy-and-the-shared-browser)
7. [Logseq](#7-logseq)
   - 7.1 [Bugs met on the way](#71-bugs-met-on-the-way)
8. [WorkFlowy](#8-workflowy)
9. [SilverBullet](#9-silverbullet)
10. [Roam](#10-roam)
11. [Dynalist](#11-dynalist)
12. [Obsidian](#12-obsidian)
    - 12.1 [How it runs](#121-how-it-runs)
    - 12.2 [Indentation: tabs, translated](#122-indentation-tabs-translated)
    - 12.3 [Starts it won't hold](#123-starts-it-wont-hold)
    - 12.4 [Bare Obsidian, in Source mode and Live Preview](#124-bare-obsidian-in-source-mode-and-live-preview)
    - 12.5 [With Outliner](#125-with-outliner)
    - 12.6 [With true-outliner](#126-with-true-outliner)
    - 12.7 [The plugins side by side](#127-the-plugins-side-by-side)
    - 12.8 [Three readings of Markdown](#128-three-readings-of-markdown)
13. [Tine](#13-tine)
14. [SiYuan](#14-siyuan)
15. [Emacs with markdown-mode](#15-emacs-with-markdown-mode)
16. [BlockNote](#16-blocknote)
17. [What it says about the spec](#17-what-it-says-about-the-spec)
18. [Insights](#18-insights)
19. [Recommendations and next steps](#19-recommendations-and-next-steps)
20. [Handover: continuing the work](#20-handover-continuing-the-work)
    - 20.1 [Operating it](#201-operating-it)
    - 20.2 [Probing an app by hand](#202-probing-an-app-by-hand)
    - 20.3 [Writing a driver: a checklist](#203-writing-a-driver-a-checklist)
    - 20.4 [Known artifacts and limits](#204-known-artifacts-and-limits)
    - 20.5 [Traps already fallen into](#205-traps-already-fallen-into)
    - 20.6 [Open work](#206-open-work)
21. [Log: after the write-up](#21-log-after-the-write-up)

## 1. The task

From the user, cleaned up. Changes and additions made during the work are folded in and marked
*later*.

We're working on `./ourus/`, a core library for building outliner apps. The next big task is
running its behavior side by side with other note-taking apps, especially outliners, and comparing:
the apps in the table at the top, where it also says where each one ran and how it went.

A quick and dirty prototype did Logseq already (`spec/zzz-logseq.md`, `test/logseq/`,
`test/logseq.test.ts`). Rebuild it properly, and cover more apps:

1. **Layout.** The code goes in `sxs/`, each app's in `sxs/<app>/`.
2. **Live demos.** Most of the apps are web apps, often with a live online demo: run against the
   demo directly. Some are behind a login; a patched offline copy on disk can stand in for those.
   *Later:* only for those. Where a free live demo exists, it is the one used. *Later still:* an app
   with neither a live demo needing no account nor open source to run here is dropped, a copy of it
   or not (Tana, §19).
3. **A caching proxy.** It fetches live pages and saves them to disk, so the remote server is taxed
   once, on a cold start. One proxy serves every app (Python with only its standard library, or
   TypeScript). Pages that need patching are patched there, with code or data from the app's own
   directory. It logs the URLs requested, and unnecessary traffic is blocked.
   *Later:* the cache is `.sxs/` in the checkout (git-ignored), not `~/.cache`. The proxy is
   one file, `sxs/proxy.ts`. Every request is logged, blocked ones too, and every run
   says how many requests were blocked, per host, and with `-v` which URLs, in case something
   important is blocked.
4. **Headless Chromium through Playwright**, pointed at the proxy. One browser serves the whole run
   for every test asked for. *Later:* the browser is shared between runs as the proxy is, and so is
   the app's loaded page. Within a run, tests share one loaded app, each on a fresh document.
5. **One command.** Starting the proxy if it needs starting, bringing up the browser, and running the
   tests are all done by a single shell command. *Later:* `node sxs/run.ts <app>` (or
   `npm run sxs -- <app>`), with no shell script; `sxs/README.md` says how to run
   it.
6. **The spec, adapted.** Run the `spec/` suite, or the part of it named on the command line. Skip
   what an app can't express (Logseq has no free-form documents), and convert the rest to the app's
   format. Not every app uses Markdown: adapt as well as can be, or reject the test. Cover as many
   tests as possible: they were written to be editor-neutral.
7. **Keys like a user.** Tests set and check the buffer, the caret and the clipboard, and play keys
   and commands. Map ours to each app's keybindings, and issue them as keys like a normal user would.
   Hacking into an app's JavaScript is for the last resort, with one exception: loading a test's
   starting state will need to reach into the app's internals.
8. **Ask** when something is ambiguous, or when there's trouble.

*Later*, during the work:

9. Logseq first, with the infrastructure it needs; the other apps after.
10. The prototype sometimes ate keys. Find out why and fix it. Is there a variable in the page that
    says the app has processed a key and is idle?
11. A full run's results go to `sxs/<app>/results.md` (now `sxs/<app>/sxs.md`), checked in,
    so runs can be diffed.
12. Logseq bugs met along the way go into `sxs/logseq/README.md`.
13. Where the spec's prose is wrong about another app, fix the prose.
14. Use Logseq's logical-outdenting setting in its driver, for the `outdent: logical` examples.
15. Call the verdict for different blocks `disagree`, not `differ`.
16. `results.md` says which version of the app ran, puts original outlines and adapted examples in
    sections of their own, and shows an adapted example's buffers as written as well as as blocks.
17. WorkFlowy next, against the live app at https://beta.workflowy.com/guide/embed/ (which the user
    found), with its markdown pasting turned on.
18. Logseq is rerun once, in a batch at the end, rather than after every change to the report.
19. SilverBullet next: is its demo read-only for good, or can writing be turned on (it can: the
    proxy patches the boot config); and is its fixed 2-space indent configurable (it isn't).
20. Roam next, live: its help graph needs no login.
21. Dynalist next, live.
22. `results.md`, in steps: what ran as frontmatter, the app by its lowercase name; "original" cases
    for "pure" ones; a subsection per verdict (disagree, whitespace, caret, error, then agree), the
    examples numbered in each, each a heading that links to it in the spec, with no heading per
    file and no line repeating the verdict; the start, the app's outcome and ourus's side by side in
    an HTML table (the app left of ourus), the buffers in `<pre>`s for exact control.
23. A lock for the clipboard, so only one example that uses it runs at any time, whatever the runs.
24. Every app rerun for the new layout, once Dynalist was finished.
25. `results.md` again, from a few cases the user rewrote by hand (§21, "The report, again"): fenced
    buffers in the tables, under a comment naming the column; the clipboard as a column; notes
    above the table; an adapted example's buffers as written in an "Original:" table of their own;
    every buffer in a table, headed `buffer`; a summary with totals and percentages, transposed to
    match a per-file table; zeros left blank; `type`, `model` and `elapsed_s` in the frontmatter.
26. Obsidian: plain Obsidian first, with room in the design for plugins, then Outliner and
    true-outliner. Indentation as the spec draws it (two spaces), to be revisited: Obsidian runs with
    tabs and the driver translates (§12.2). Packages it needs, installed with apt as needed, noted in
    its README (none were missing).
27. Dynalist's one flaky example looked into (§20.4); left as it is, since it is a caret verdict.
28. The work renamed: `test/validation/` → `sxs/`, and "side by side" (SxS) for "validation" throughout
    (`.sxs/`, `OURUS_SXS_DIR`, `npm run sxs`, the report's `type: "SxS"`). No mention of `repos/` in what
    the apps' READMEs say about them (it goes soon), and SilverBullet isn't the reference for Obsidian.
29. This note: a table of contents, the sections in a logical order (the apps together, then what
    the runs say, then the handover, the log last), the brief's app table merged into the numbers at
    the top (addresses, without `https://`), and each app's internals in its own section. What is
    worth keeping goes into `sxs/<app>/README.md` too, which stays where this note may move:
    internals, bugs and quirks.
30. Two bare Obsidian setups: `obsidian` in Source mode and `obsidian-lp` in Live Preview.
31. Locks, so that concurrent runs don't stomp on each other; a plugin's GitHub repository given
    by its URL.
32. Source mode and Live Preview checked for real: cases where the views should part, run in both,
    written into this note (§12.4), not into the spec (a scratch spec file is temporary).
33. Tine next (§13).
34. A spec file (or any selection) run in all the apps, or some, in parallel, for writing the spec;
    and a full rerun of every app against everything, rewriting every report; both with a table of
    every example's verdict per app. In `run.ts` itself, not a module beside it; a run of `run.ts`
    per app is fine.
35. The verdicts that changed when apps ran together, investigated as a possible bug of the runner's
    or a driver's (it was, §21).
36. The reports named `sxs.md`: each app's `sxs/<app>/sxs.md`, and `sxs/sxs.md` for every
    app, linking each app's; that one's apps by agreement, the most first, in every table, its summary
    a row per app; its frontmatter without the apps and versions (the reports have them).
37. Before committing (the user commits): this note brought up to date.
38. A full cold rerun (`.sxs/` moved away), compared with the runs before; SilverBullet's cold start
    fixed (§9).
39. Obsidian's stack and its two parsers verified and said plainly (which libraries, which versions,
    what kind of parser), then moved to `sxs/obsidian/stack.md` with its internals.
40. `sxs/` moved to the top of the checkout. In `sxs.md`: spec files' rows in bold without links,
    examples by their own names, 20 characters at most, the full name as a tooltip, an `agree` column;
    each app's model in the summary.
41. Typora next: no web demo, and its EULA rules out the usual driver; skipped, the reasons noted
    (§19).
42. SiYuan next, open source (§14). In `sxs.md`: adapted differences in brackets, `(✗)`, with what
    was adapted as a tooltip (an adapted agreement a plain ✓); an app with no verdicts left out of
    `--table`.
43. `tools/` moved to `src/parser/tools/`: the two scripts are the parser's.
44. Emacs with markdown-mode next (§15).
45. Vim and Neovim plugins weighed, and three added to the survey (bullets.vim, vimwiki, mkdnflow.nvim);
    Obsidian with Unified Outliner next, later dropped (§19).
46. BlockNote next (§16).
47. Tana next: a driver written and the whole spec run, then dropped, as Tana has no live demo
    without an account (§19).
48. In `sxs.md`'s summary, a heatmap: how often two apps got the same verdict, the apps from logseq to
    obsidian.
49. MarkText tried and dropped (§19). `sxs/lib/` for what the runner and the drivers share. In
    `sxs.md`, the examples' table headed again for each spec file (its name, then the apps), each
    file's examples ending in a row of each app's agreements there.
50. true-outliner's disagreements with its own cases checked one by one for a driver's bug (none,
    §12.6).
51. VS Code next, bare and with Markdown All in One, then dropped; Unified Outliner dropped; outl next,
    then set aside as too complex (§19). In `sxs.md`, the heatmap an SVG of its own section.

## 2. What was built

```
node sxs/run.ts <app> [selector...] [-v] [--list] [--strict] [--repeat=N] [--headed]
                                  [--slow=MS] [--offline] [--fresh] [--no-report] [--timing] [--json=FILE]
node sxs/run.ts <app>,<app>... | all [selector...] [options] [--jobs=N] [--table]
node sxs/run.ts --stop
```

| File | Lines | What it does |
| --- | ---: | --- |
| `run.ts` | 1,050 | the command line, playing each example (through a page, or a driver's session), comparing, printing, the report and the run as data (`sxs.json`); several apps side by side (a run of each, in parallel, and the table of their verdicts with a heatmap, or the table alone from the last runs) |
| `proxy.ts` | 493 | the caching proxy, app rules, the blocked hosts, serving a copy from disk (§6) |
| `lib/plan.ts` | 155 | choosing examples, adapting them to an app (projected onto blocks, or as text), skip reasons |
| `lib/outline.ts` | 246 | spec buffers projected onto blocks (§5), drawing and comparing outlines |
| `lib/text.ts` | 33 | spec buffers as Markdown text, for text editors (the `text` model, §9) |
| `lib/idle.ts` | 176 | the init script that tells when a page has settled after a key (§4) |
| `lib/browser.ts` | 346 | the shared proxy, a browser per app and the app's page (§6), the clipboard lock (§21), the servers drivers start (§14) |
| `lib/desktop.ts` | 79 | for a driver that starts a desktop app: a free port, an Xvfb, a run's lock (§12) |
| `lib/driver.ts` | 102 | what an app's driver provides, and the session of an app that is no page (§15) |
| `lib/outline.test.ts` | 93 | the projection, offline, in `npm test` |
| `logseq/driver.ts` | 259 | Logseq: loading, reading, keys, readiness, its outdenting setting |
| `workflowy/driver.ts`, `proxy.ts` | 307 | WorkFlowy: the same, and the requests answered locally (§8) |
| `roam/driver.ts`, `proxy.ts` | 238 | Roam: loading, reading, keys, the document's ends past the page title (§10) |
| `silverbullet/driver.ts`, `proxy.ts` | 138 | SilverBullet: loading, reading, keys, the demo made editable, a cold start waiting for its first sync (§9) |
| `dynalist/driver.ts`, `proxy.ts` | 232 | Dynalist: loading, reading, keys, its outdenting preference, its POSTs cached by body (§11) |
| `obsidian/obsidian.ts` | 394 | Obsidian, for any setup of it (`obsidianDriver`): starting the desktop app (a lock per setup, an Xvfb), its vault and view, loading, reading, keys, indentation as tabs, the starts it won't hold (§12) |
| `obsidian/driver.ts`, `obsidian-lp/driver.ts`, `obsidian-outliner/driver.ts`, `obsidian-true-outliner/driver.ts` | 43 | the four setups: bare in Source mode, bare in Live Preview, with Outliner, with true-outliner (§12) |
| `tine/driver.ts`, `proxy.ts` | 280 | Tine: loading through the search, reading the store, keys, a code block's editor; its guide made editable (§13) |
| `siyuan/driver.ts`, `kernel.ts`, `plugin/` | 471 | SiYuan: its release downloaded and its kernel served (`serve`), a document per test through the API, opened through a plugin of its own, reading the editor's DOM through SiYuan's own Markdown converter (§14) |
| `blocknote/driver.ts`, `proxy.ts` | 238 | BlockNote: its site's minimal example, the editor found through React, the history emptied after loading, its error reports answered (§16) |
| `emacs-markdown/driver.ts`, `emacs.ts` | 257 | Emacs with markdown-mode: Emacs on a terminal of tmux's, played through its server (a session), markdown-mode fetched and checked, a buffer per test (§15) |
| `obsidian/obsidian.test.ts` | 39 | Obsidian's indentation as tabs and back, offline, in `npm test` |
| `<app>/README.md` | | each app's notes, internals and bugs |
| `obsidian/stack.md` | | Obsidian's stack: its libraries and versions, its two Markdown parsers, its internals (§12.8) |
| `<app>/sxs.md`, `<app>/sxs.json`, `sxs.md`, `sxs-heatmap.svg` | | each app's last full run, as a report and as data (every example's steps, ourus's outcome and the app's); the last run of every app, side by side, with a heatmap of how alike their verdicts are (an SVG beside it) |

`sxs/README.md` says how to run it, describes a run step by step, and how to add an app. Deleted:
`test/logseq/` (adapt, run, ourus-vs-logseq, notes, last results), `test/logseq.test.ts`,
`spec/zzz-logseq.md` (221 examples recorded from Logseq against an older spec) and the spec option
`editor:`, which only that file used. `npm run test:logseq` is now `npm run sxs`.

A driver is small on purpose: the app's URL, its `model` (`block` for a block app, `text` for a
Markdown editor), `open` (load it, wait until it takes keys, give its version), `load` (a fresh
document with the starting state), `read` (the state back), and a table of keys per action. Optionally it also gives `act` for actions emulated with keys, what the app
can't hold, its behavior where ourus has an option, and a busy signal. An app that isn't a web page
gives `launch`: it starts the app and hands its window to the runner in place of a tab in the shared
browser (Obsidian, §12). Everything else is shared.

## 3. Why the prototype ate keys

There were three causes, each found by measuring, and two first guesses that the measurements
corrected.

**Races with what an app does after a key.** One fixed sequence of fifteen keys was played into
Logseq with different pauses between keys and compared with a slow baseline: with no pause it came
out wrong both times, with 20 ms or more it matched. Instrumenting the page showed why. After a
structural key (Enter, Tab, Shift+Tab, Alt+Shift+arrows), focus moves to the re-rendered editor
about 18 ms later, then a 50 ms and a 100 ms timer fire. A key that lands in between goes into a
half-done state. The prototype paused 250 ms after every key, enough nearly always, but a pause is
a guess, and it loses whenever the machine is slow.

**Keys lost right after startup.** The first Tab after the app loads moved the focus out of the
editor: the browser's own Tab, unhandled by Logseq. Logseq installs its global keys through
`shortcut/refresh!`, which is debounced by a second after the app's config is restored; Enter worked
at once (the editor handles it itself), Tab didn't until the debounce fired. The prototype's
"the first edit after the app loads is unreliable, so every run makes a warm-up edit" was this,
undiagnosed. `open` now plays Tab on a two-block page until it indents.

**Loading raced the app too.** `delete_page` takes Logseq to its home page even when another page is
open, so deleting the last test's page after creating the next one lost the new page. Inserting
blocks opens one of them for editing a moment later, after `edit_block` had already chosen another.
And `edit_block` needs the block's element on screen, which comes a moment after `create_page`
redirects. The driver now deletes first, waits for the blocks to render, lets the page settle, then
edits and checks it is editing the right block.

The two corrections, found by reading Logseq's source after the observations:

- `editor/op`, Logseq's flag for an insert, delete or indent in flight, looked like a guard that
  drops keys. It is checked in only two places: Enter is refused while another insert is in flight
  (a window of a few milliseconds), and an editor isn't saved when it unmounts while the flag is
  set. When an exception leaves it set (Backspace on an empty first block throws, §7.1), later keys
  still work. What breaks is saving a block on leaving it.
- A character typed before the lost Tab seemed to vanish. It was stored half a second later by the
  autosave: the read came too early.

## 4. Settling instead of sleeping

The user asked whether some variable in the page says the app has processed a key and is idle.
Logseq has one, `editor/op`, readable through its plugin API
(`get_state_from_store('editor/op')`), but it is set and cleared inside the key handler. Sampled
every 4 ms it was never caught set; the rest of a key's effect (re-render, refocus) comes after it is
cleared. So `idle.ts` watches the page's own scheduling instead, and works for any app:

- An init script, run before the app's code, wraps `setTimeout`/`clearTimeout` and
  `requestAnimationFrame`/`cancelAnimationFrame`. Short timers (up to 300 ms) and frames are pending
  until they fire or are cleared; clearing matters, or every debounce would look pending forever.
  DOM mutations, focus changes, selection changes and input are timestamped.
- `__ourusIdle.wait()` resolves once nothing short is pending, nothing has changed for 40 ms, and
  the driver's busy expression (Logseq: `editor/op` set) is false. Its own polling uses the
  unwrapped `setTimeout`, so it doesn't count itself.
- Long timers are left out on purpose: Logseq's 500 ms autosave, 1 and 3 s housekeeping timers,
  and 5 s polling are not the reaction to a key, and waiting for them would make every action slow.
- An app whose busy signal stays on with nothing else happening for a second is *stuck*. The
  runner reports it, and the driver clears the flag before the next test, so one exception can't
  poison every test after it.
- What the script can't see is a web worker's work: a message to a worker and its answer leave no
  timer, frame or mutation behind until the answer lands. SilverBullet runs its commands in plug
  workers, so its busy signal is a plug sandbox owing an answer (§9); an app that works in workers
  needs such a signal of its own.
- The first wait is for one animation frame, with a 50 ms fallback: a tab behind another gets no
  frames (§18).

A key settles in 40 to 140 ms in Logseq, 50 to 350 ms in WorkFlowy (a 300 ms timer of its own after
structural keys), and about 50 to 70 ms in SilverBullet. The whole suite, with two to six actions per example plus loading,
verifying and reading, averages about 400 ms an example.

## 5. From spec buffers to blocks

Logseq's documents are blocks, not Markdown text. So the spec's buffers are projected onto blocks
with ourus's own parser (`outline.ts`): every outline node becomes a block at its depth, holding its
own text in a canonical Markdown form. A task keeps `[ ] `, a heading is `## title`, continuation
lines are joined by `\n`, and code is kept as written. The expected buffers go through the same
projection, so the comparison is block for block, caret included.

- **Original and adapted.** A buffer of `-` items as written projects without loss: those examples are
  *original* (they were *pure* until §21's last entry). In the others, something stood in for something else: a paragraph or a heading became a
  block, blank lines were dropped, a numbered or `*` item became a plain one, a backslash escape
  went. The projection notes each such adaptation, the report counts original and adapted apart, and
  `--strict` runs the original ones only.
- **What can't be projected is skipped**, with the reason. Quotes and callouts are containers to
  ourus and a block's text to Logseq (67 examples); frontmatter has no block form either. A starting
  caret with no place in a block (in a marker, on a blank line) skips the example; an expected caret
  with no place in a block isn't compared.
- **A projection can lose an example's point.** If an expected buffer differs from the one before
  it only in what blocks can't show (blank lines, markers), the example tests nothing in a block app
  and is skipped. ourus's `cursorDocEnd` lands past the last line ending, on an empty line no block
  has, so anything typed or moved from there differs by construction; such examples are skipped too.
- **Every load is checked.** After loading, the runner reads the state back and compares it with
  what was meant. An app that rewrites what it is given would otherwise look like an app that
  behaves differently. This caught Logseq dropping code's indentation on a batch insert, and trimming
  a block's edges (§7).

A text editor needs none of this: its documents are Markdown text, so the buffers are taken as
written (the `text` model, §9).

The two models differ, and the adapted results show it. ourus gives Markdown structure meaning: a
paragraph owns the list right after it, a heading owns its section, a blank line is a gap. Blocks
have none of that. So most adapted differences are the models disagreeing rather than a choice
Logseq made, though they still say which way Logseq goes (a block moved past a heading block doesn't
enter its "section"). The original examples are where agreement and disagreement mean exactly what they
say.

## 6. The proxy and the shared browser

**A forward proxy that intercepts HTTPS**, with one self-signed certificate for every host (made
once with `openssl`; the browser ignores certificate errors). The alternatives were weighed and
dropped. A reverse proxy on `localhost` would change the page's origin, which apps check (Workflowy
behaves differently on any host but its own); Playwright's request routing would tie the cache to
Playwright and keep a hand-launched browser from using it. With the forward proxy, pages keep their
real origins, and so do storage, cookies and service workers.

**Cache.** GET and HEAD responses are stored under `.sxs/http/<host>/`, one `.json` (status,
headers, URL) and one `.body`, named for the path so a person can find them. Server errors aren't
kept, and concurrent misses for one URL fetch it once. `--offline` turns a miss into a 504, and
`--refresh` refetches. An app's `<app>/proxy.ts` can set cache keys, answer requests itself or
patch responses; patches are applied on the way out, so the cache keeps what the server sent. Logseq
needs none of it. WorkFlowy's refuses its "signal" WebSocket and answers its calls to save a setting
(§8). SilverBullet's patches the demo's boot config to make it editable, answers every write with
503 and the lookups of the tests' pages with 404 (§9): what a live demo would otherwise be sent, or
be asked on every run, is answered here.

**Blocked**: analytics and error reporting, embedded video (Logseq's demo journal embeds a YouTube
video, which streams analytics of its own), and the browser's own background traffic. That last was
the biggest. A full run made 1,140 requests to Chromium's form-autofill service, one for every
focused textarea, against 40-odd requests for Logseq itself (all from the cache). Blocking caught
them, and a browser flag now stops them at the source.

**Shared between runs.** The proxy and Chromium are started detached by the first run that needs
them and left running. A run restarts the proxy when its source has changed (`/__proxy/health`
reports a hash) and the browser when its flags have (stamped in its profile). The app's page stays
loaded in the browser's default context, which outlives the run. The next run takes it over after
checking that it still loads and reads a document back, and a lock file keeps two runs off one page.
A one-example run dropped from 2.8 s to 0.8 s. The browser was one for every app at first; it is one
per app now (`.sxs/chromium/<app>/`), since a browser's one clipboard and the tab in front are
things apps running side by side would take from each other (§21).

## 7. Logseq

The demo is Logseq OG (the file-based app), build `b8f87af5` (its bundle's ETag: the demo doesn't
say its version).

| | original | adapted |
| --- | ---: | ---: |
| agree | 82 | 115 |
| caret | 4 | 8 |
| whitespace | 5 | 14 |
| disagree | 14 | 70 |
| skipped | | 146 |

Verdicts: `agree`, the same blocks and caret; `caret`, the same blocks, the caret elsewhere;
`whitespace`, blocks that differ only in spaces next to line breaks; `disagree`, different blocks
(text, nesting or number); `error`, the example didn't run or the app didn't hold its start.

The disagreements worth knowing, with an example of each:

- **Joining a block with children.** Delete at the end of an empty block whose next block is its
  child leaves the empty block and indents the children under it (`del.md › Delete5`, `5b`, `5c`,
  `5d`); ourus joins. Backspace on an empty first block with children does nothing
  (`backspace.md › Backspace17b`).
- **Empty tasks.** Enter on an empty `TODO` keeps it and opens a new block below
  (`tasks.md › TaskEnter1`, `TaskEnter2`); ourus clears the checkbox, or outdents. Logseq's marker
  is a word, so Backspace eats into it (`TOD`, `TaskBackspace5`).
- **Shift+Enter** inserts a bare line break and keeps the space next to it (`shift-enter.md ›
  ShiftEnter1`, `2`, `3`, ...); ourus drops the space. A trailing line break is trimmed as soon as
  the block is stored: Shift+Enter then Tab loses the empty line (`obsidian-true-outliner.md ›
  Shift-Enter, Tab, then leave`).
- **Enter on an empty middle child** puts the caret in the new block, below; ourus leaves it above
  (`enter.md › Enter28`).
- **Headings.** Tab doesn't change a heading's level (`indent.md › Indent12`, `Indent16`). A heading
  block owns no section, so blocks moved past it don't enter it (`move-subtree-down.md › MoveDown20`,
  `move-subtree-up.md › MoveUp24`).
- **Paste.** Plain multi-line text pastes into the block (`paste.md › Paste7`, `Paste10`); only text
  that reads as list items or headings, or has blank lines, becomes blocks. Pasted code leaves the
  caret on a line of its own (`Paste9`).
- **Caret motion** lands by pixels in a proportional font, not by monospace columns
  (`cursor.md › CursorDown1`, `2`, `4`); Home goes before a heading's `#`s and a task's marker
  (`CursorHome8`, `9`, `10`).
- **Placeholders** are ourus's: empty blocks Logseq made stay when the caret leaves
  (`obsidian-true-outliner.md › Enter twice, then leave`).

The agreements cover the core: indent and outdent with direct outdenting, moving blocks within and
across parents, Enter splitting and creating, Backspace and Delete joining plain blocks, undo and
redo of these, and `deleteSubtree` (Escape, then Backspace).

**Internals** (`window.logseq.api`): `create_page(name, {}, {redirect, createFirstBlock})`,
`insert_batch_block` (drops a line's leading whitespace), `update_block` (trims trailing), `remove_block`,
`delete_page` (goes to the home page: delete before creating), `get_page_blocks_tree`, `edit_block(uuid,
{pos})` (asynchronous; needs the block on screen), `check_editing`, `get_selected_blocks`,
`exit_editing_mode`, `get_all_pages`, `get_current_graph_configs`, and `get_state_from_store` /
`set_state_from_store` for the app's state (`editor/op`; `history/page-only-mode?`;
`['config', '@<repo>', 'editor/logical-outdenting?']`, the repo from `git/current-repo`). The block
being edited is the focused `TEXTAREA`. Keys and quirks: `logseq/README.md`; bugs: §7.1.

### 7.1 Bugs met on the way

In detail, with how the driver deals with each, in `sxs/logseq/README.md`:

1. **Backspace on an empty first block, with nothing above it, throws** (`Cannot read properties of
   null`), deletes the block, leaves no block in editing, and leaves `editor/op` set to `:delete`.
   From then on, by the source, a block's editor isn't saved when it is left (not observed).
2. **Tab before the global keys are installed** moves the focus out of the block while Logseq still
   reports the block as being edited.
3. **`indent-outdent` sets `editor/op` to the keyword `:nil`** instead of `nil`, after every Tab and
   Shift+Tab; a reader checking for null takes it for busy.
4. **The plugin API's `delete_page` goes to the home page**, whatever page is open.
5. **The plugin API's `insert_batch_block` drops leading whitespace** from a block's lines (code loses
   its indentation); `insert_block` and `update_block` keep it.
6. The demo requests a script that the site doesn't have (`/js/eventemitter3.umd.min.js`, 404).

## 8. WorkFlowy

**Which WorkFlowy.** The brief's https://workflowy.com/wf-demo/ is a widget of the landing page, not
the app: 51 KB of code of its own that imitates Enter, Tab, Backspace on an empty item and Up and
Down, with no undo, no moving, no paste and no joining. The real app runs anonymously, with no login,
in the "Try WorkFlowy Instantly" page (https://beta.workflowy.com/demo/embed/), which embeds
https://beta.workflowy.com/guide/embed/: the full app, 4.3.2610131317 on 2026-10-13, with the same
scripting API (`window.WF`) a signed-in user's has. That is what `sxs/workflowy/` drives.
Nothing it sends reaches WorkFlowy's servers: its error reports and payment scripts are blocked, and
the proxy refuses its "signal" WebSocket and answers its calls to save a setting.

**The driver** ([`workflowy/README.md`](sxs/workflowy/README.md) has the details):

- Each test runs in one item, `ourus sxs`, zoomed into; its children are the test's blocks,
  made through `WF` (`createItem`, `setItemName`, `setItemNote`, the item type in its metadata) and
  read back from it. The item being edited is read from its editor: WorkFlowy saves half a second after
  typing stops.
- An item is a name and a note: a block's first line is the name, the rest the note, the caret in the
  note past the name and a line break. To-dos are tasks (`[ ] `, `[x] `), H1 to H3 are `#` to `###`;
  code and tables are refused.
- The keys come from WorkFlowy's own keymap: Alt+Shift+Up and Down move, Ctrl+Shift+Backspace deletes
  an item with its children (`deleteSubtree`), Alt+Shift+D duplicates it (`duplicateSubtree`, which Logseq
  has no key for), Ctrl+Home and Ctrl+End go to the first and last item. Ctrl+Home lands in the title
  of the zoomed item, so `cursorDocStart` is Ctrl+Home, Down, Home.
- Outdenting is logical (Shift+Tab leaves later siblings with the parent): the driver declares
  `outdent: logical`, so those examples run and agree, and the direct ones disagree.
- "Recognize markdown pasting" is turned on (`WF.Features.enable`): pasted Markdown becomes items,
  headings and to-dos, as ourus's structured paste reads it.

**Results:**

| | original | adapted |
| --- | ---: | ---: |
| agree | 65 | 76 |
| caret | 4 | 7 |
| whitespace | 3 | 8 |
| disagree | 34 | 86 |
| skipped | | 175 |

More is skipped than for Logseq: code blocks (40), which items can't hold faithfully, and carets in a
checkbox or a heading's `#`s. The disagreements worth knowing:

- **Name and note.** Shift+Enter goes between them: from the name it opens the note (the text stays in
  the name), from an empty note it goes back and the note goes (`shift-enter.md › ShiftEnter11`,
  `12`, `16`, `obsidian-true-outliner.md › S11`, `S13`). Enter in a name with a note makes a new item
  and the note stays (`enter.md › Enter16`); Delete at the end of a name doesn't pull the note in
  (`del.md › Delete3`); Right at the end of a name doesn't go into the note (`cursor.md ›
  CursorRight1`); Tab in a note types a tab (`indent.md › Indent19`).
- **Joining.** Backspace merges an item into its previous sibling, but not a first child into its
  parent (`backspace.md › Backspace3`, `Backspace15`); Delete doesn't pull a first child up either
  (`del.md › Delete1`). An empty item with children behaves as in Logseq (`del.md › Delete5`, ...).
- **Enter keeps the space** after where it splits (`enter.md › Enter1`).
- **Paste.** The first pasted line goes into the item at the caret, the rest become items, and the text
  after the caret becomes an item of its own (`paste.md › Paste7`). With markdown pasting, quote lines
  become items (`Paste12`), but `1. x` stays as written (`Paste15`).
- **Duplicate** leaves the caret on the original (`duplicate-subtree.md › DuplicateSubtree1`).
- **Item types stay**: Tab doesn't deepen a heading (`indent.md › Indent12`), and Backspace at its
  start doesn't drop its type (`backspace.md › Backspace18`), as in Logseq.

**A WorkFlowy bug:** Backspace at the start of a note adds a line break to the note, and that is what
WorkFlowy stores once it saves (`backspace.md › Backspace9`).

**Internals** (`window.WF`): `rootItem`, `createItem(parent, index)`, `setItemName` / `setItemNote`
(rich text: escape `&<>`), `editGroup(fn)` (batches edits; async), `zoomTo`, `currentItem`,
`deleteItem` (needs the item on screen), `expandItem` (a new item's children show only once expanded),
`completedVisible` / `toggleCompletedVisible`, `focusedItem`, `getSelection` / `setSelection` (items),
`getItemById`, `AppBuild.number`, `Features.enable`, `GuiAnimate.animationsAreInProgress`,
`Editor.saveLater` (the 500 ms save), `DomEditableText.selectedIn(el)`. An item's internals:
`item.data.projectReferenceOrThrow`, with `setMetadata(recipe)` (an Immer recipe: change the draft,
return nothing; `layoutMode` among `bullets todo h1 h2 h3 p numbered code-block board table divider
dashboard check`) and `getItem()` (`layoutMode`, `applyLocalComplete`). The editors are the
contenteditable `.name > .content` and `.notes > .content` of an item's element (`item.getElement()`),
each with an `editor` object. The keymap is the table `l2[...]` in `wf-base.<hash>.js`.

## 9. SilverBullet

**Which SilverBullet.** https://silverbullet.md/ is the project's website; the editor is the demo
server's "Personal" space, https://demo.silverbullet.md/personal/ (and https://docs.silverbullet.md/,
the manual, is another space of the kind): SilverBullet 2.12.0-50-gb2726cd8 on 2026-10-13. Both are
**read-only** as served: the boot config (`/.config`) says `readOnly: true`, so the client binds no
editing keys and the editor isn't editable, and the server refuses writes. Nothing is compiled out:
`readOnly` is a flag the client reads at boot. The proxy patches it to `false` before the client
boots, and answers every write to the server with 503 (a sync push, as if the server were briefly
away): SilverBullet is local-first, keeps the edits in the browser's copy of the space and tries
later. The demo is never written to. `sxs/silverbullet/README.md` has the details.

**The `text` model.** SilverBullet edits Markdown text (CodeMirror 6), so it is the first app on the
`text` model: a test's buffer is its document, loaded as written, and the outcome is compared with the
spec's next buffer as text, caret included. No projection: quotes, blank lines, frontmatter and
code run, and only 57 examples are skipped (28 with nothing to compare, 5 with CR line endings,
which CodeMirror turns into LF, and the rest options or actions SilverBullet has no command for).

**The driver.** Each test's page is written into the space in the browser
(`syscall('space.writePage', ...)`) and opened (`client.navigate`), so the editor starts from it with
an empty history (an editor transaction would be the first thing undo undoes); the caret is a
CodeMirror transaction, and reading is the editor's state. The version comes from the
`system.getVersion` syscall. Commands run in plug workers, so the busy signal is a plug sandbox owing
an answer (`outstandingInvocations`): without it, a read once fell between a command's change and its
caret. `indent` and `outdent` are "Outline: Move Right" and "Move Left" (Ctrl+. then L or H), which
move an item with its children and change a heading's level; Tab is CodeMirror's `indentMore`, which
indents lines. `deleteSubtree` and `duplicateSubtree` have no command.

**Results:** agree 111, caret 17, whitespace 8, disagree 265, error 0. SilverBullet is a text editor
with outline commands, not an outliner, and most of the spec's structural behavior isn't there:

- **Backspace and Delete are CodeMirror's**: Backspace at a list item's start removes its marker first
  (`deleteMarkupBackward`: `- one` / `- ┃two` becomes `- one` / `  ┃two`), and joining is a second
  Backspace (`backspace.md › Backspace1`, `5`, `10`, `11`); nothing carries children or closes gaps.
- **Indentation is a fixed unit**: the outline commands indent a bullet list by 2 spaces, an ordered
  one by the marker's width plus one (`listIndentWidth` in `plugs/editor/outline_ops.ts`), whatever
  the list uses, and don't renumber (`indent.md › Indent3`, `4`, `6`, `7`). Nothing configures it:
  CodeMirror's `indentUnit` is set to two spaces and never changed, and the outline commands don't
  read it. Patching the plug would test another app, so it stays a finding.
- **Commands act on the item at the caret**, not on a selection's items (`indent.md › Indent9`), and a
  paragraph or a setext heading doesn't indent (`Indent16`, `21`, `22`).
- **Paste is plain**: the clipboard's text goes in at the caret as it is (`paste.md`).
- **Home goes to the line's start**, before the list marker ("Cursor Line Start"; ourus goes to the
  text's start first: `cursor.md › CursorHome1`, `3`, `4`); Up and Down land by the rendered layout,
  where list markers are drawn as bullets (`CursorUp2`, `CursorDown3`).
- **Empty lines stay** where ourus's placeholders would go when the caret leaves
  (`backspace.md › Backspace14`).
- **Undo** agrees, but for one placeholder case (`undo.md › Undo3`).

**A leak the proxy's tally found.** Each test's page has a new name, and SilverBullet asks the
server for it when opening it: 410 such lookups reached the demo server in the first full run, each a
cache miss. The proxy answers them "not found" itself now (`silverbullet/proxy.ts`), and a run fetches
nothing.

**A cold start, which every run before had missed.** The browser's copy of the space is served
locally only after a first full sync: until then the service worker passes every request to the
server, writes too. Every run had had a profile synced long before; the first run from an empty
`.sxs/` wrote its first test page mid-sync, the write reached the proxy and its 503, the client
threw `Offline`, and the run died in `open`. `open` now waits for the first sync
(`client.fullSyncCompleted`), about 10 s cold (§21).

**Internals** (`window.client`, `window.syscall`): `client.editorView` (CodeMirror 6: `state.doc`,
`state.selection.main`, `dispatch`, `focus`, `hasFocus`), `client.navigate({ path: 'name.md' })`,
`client.currentName()`, `client.isReadOnlyMode()` (the boot config's `readOnly`, or the page's `perm`
being `ro`), `client.bootConfig`, `client.systemReady`, `client.fullSyncCompleted`;
`syscall('space.writePage', name, text)`,
`syscall('system.getVersion')`. Plugs: `client.clientSystem.system.loadedPlugs` (a `Map`), each with
`sandbox.outstandingInvocations`. Commands and their keys are in `client/editor_commands.ts` and
`plugs/editor/editor.plug.yaml` of SilverBullet's source; the outline operations in
`plugs/editor/outline_ops.ts`.

## 10. Roam

**Which Roam.** Roam's help graph, https://roamresearch.com/#/app/help, is open to anyone without a
login, editable in the session, and saved nowhere: Roam says "No changes to the help database will be
saved", and after loading nothing goes over its Firebase connection while blocks are made and edited.
So the live app runs, and the offline copy (`demo/roam/local`) isn't needed. Roam 0.13.12 (commit
39a714f3, API 1.1.5) on 2026-10-13: the version and commit are literals in its bundle, which the
driver reads; `roamAlphaAPI.apiVersion` is the API's own.

**Traffic.** Once per load: Firebase's App Check token exchange, three Cloud Functions and the realtime
database's WebSocket, live (the graph comes that way); tab reuse keeps loads rare. Per test, creating
blocks made Roam ask its AI embeddings function for them (`voyage-embed`, refused to an anonymous
visitor with 401): `roam/proxy.ts` answers it with the same 401, and a full run sends Roam nothing.

**The driver** (`sxs/roam/README.md`): a page per test through `window.roamAlphaAPI`
(`data.page.create`, `data.block.create` with the heading attribute, `ui.mainWindow.openPage`,
`ui.setBlockFocusAndSelection`), read back with `pull` and the focused textarea. Tasks are Roam's
`{{[[TODO]]}}` / `{{[[DONE]]}}`, headings the block's heading attribute (1 to 3, shown as `#`s); code
is refused (Roam's fences are a format of its own). Keys from the bundle: Alt+Shift+Up and Down move,
Tab and Shift+Tab indent, Ctrl+Z and Ctrl+Y undo and redo (Ctrl+Shift+Z is the Mac's redo, which a
first run used: Undo1 and Undo4 disagreed until it was fixed). The document's ends are emulated as in
Logseq, Up or Down until the caret stops; Up from the first block goes into the page's title, so the
emulation steps back down from there.

**Results:** agree 151 (72 original), caret 18, whitespace 29, disagree 86, error 0.

- **Roam outdents logically**, like WorkFlowy (`outdent.md › DirectOutdent1` disagrees,
  `LogicalOutdent1` agrees), and **Enter on an empty nested block outdents it**, as ourus's
  `enterOnEmptyItem: outdent` says of Roam (`enter.md › Enter30` agrees, `Enter28` doesn't): the
  driver declares both. Neither is a setting, unlike Logseq's logical outdenting: Roam's bundle has
  the commands (`unindent-block` on Shift+Tab and Alt+Shift+Left, `unindent-blocks` and
  `unindent-sibling-group` for a selection of blocks, `create-new-or-unindent` for Enter on an
  empty block) and no option near them; it calls outdenting "unindent", and the word "outdent"
  appears nowhere in it. WorkFlowy's logical outdenting has no setting either.
- **Paste** of plain lines makes blocks after the current one, as ourus does: Paste7 and Paste10
  differ only in where the caret ends.
- **Joining** as in the other block apps: an empty block with children isn't joined into
  (`del.md › Delete5` family), and Backspace on an empty first block does nothing
  (`backspace.md › Backspace17`, `17b`, `17c`), as the spec's prose says.
- **Enter keeps the space** after where it splits (`enter.md › Enter1`, `Enter3`), and Enter on the
  empty middle child of a list leaves it and goes on below the parent's children (`Enter27`).
- **Whitespace** (29) is mostly Shift+Enter keeping the space next to the line break, as in Logseq.

**Internals** (`window.roamAlphaAPI`): `data.page.create({ page: { title, uid } })`, `data.page.delete`,
`data.block.create({ location: { 'parent-uid', order }, block: { string, uid, heading, open } })`,
`pull('[:block/uid :block/string :block/heading :block/order {:block/children ...}]', [':block/uid',
uid])` (children unordered: sort by `:block/order`), `ui.mainWindow.openPage({ page: { uid } })`,
`ui.setBlockFocusAndSelection({ location: { 'block-uid', 'window-id': 'main-window' }, selection })`,
`ui.getFocusedBlock()`, `util.generateUID()`, `apiVersion` (the API's, not Roam's). The block being
edited is the focused `TEXTAREA`; tasks are `{{[[TODO]]}}` / `{{[[DONE]]}}` in the string. Its key
bindings are `CV(isPC ? "<pc key>" : "<mac key>", ...)` calls in `route-app.js`.

## 11. Dynalist

**Which Dynalist.** https://dynalist.io/demo opens a sample document ("Welcome to Dynalist",
`/demo/<id>`) in the full app, for anyone, without a login, and keeps its edits in the page: over a
full run nothing but beacons left the browser, and the proxy answers those. Dynalist 9 (build
20260830132109, commit 5cc489d) on 2026-10-13, from `DYNALIST.VERSION`, `DEPLOY_BUILD` and
`DEPLOY_COMMIT`. The document and the app's data come by POST (`/api/file/load`,
`/api/bundle_binary`), whose answers depend only on the request, so `dynalist/proxy.ts` caches them
by their body; `dynlst.com/update` and Cloudflare's `/cdn-cgi/rum` are answered locally.

**The driver** (`sxs/dynalist/README.md`): Dynalist's own objects, not a plugin API
(`DYNALIST.app.app_document`: `document`, `controller`, `view`, `ui`), with readable method names. A
test's items replace the last test's under the document's root in one `view.exec` edit, and then the
history is emptied, so undo stops where the test starts. The caret is `ui.set_selection(node, anchor,
head)`. Reading is the node tree and the model's selection, with its direction from the DOM's; the
model follows the editor as it types, so there is no save to wait for, unlike Logseq and WorkFlowy.

- **A block is an item's content**, which holds line breaks: Dynalist's "insert new line"
  (Ctrl+Shift+Enter) is the spec's Shift-Enter. Its Shift+Enter goes to the item's note, which blocks
  have no place for, so the WorkFlowy driver's name-and-note split isn't needed; no action made a
  note in a full run. Checkboxes and H1 to H3 are the item's attributes, read as `[ ] ` and `#`s.
  Code blocks, which WorkFlowy's driver refuses, load as written: they are text in the content.
- **Keys** from Dynalist's shortcut table, read through `app.shortcuts.get_shortcuts(id)` for ids
  taken from the bundle: Ctrl+Up and Down move an item, Ctrl+Shift+Backspace deletes it with its
  children, Ctrl+Home and Ctrl+End go to the first item's start and the last one's end (no emulation
  needed), Ctrl+Y redoes. `doc-duplicate` has no default key, so `duplicateSubtree` is skipped.
- **Outdenting is a setting**: logical by default, direct with "unindent in place"
  (`unindent_in_place`, read by `view.unindent`). The driver declares both and sets it per test, as
  Logseq's does; `outdent.md › DirectOutdent1` and `LogicalOutdent1` both agree.

**Results:** agree 175 (73 original), caret 7, whitespace 30, disagree 104, error 0, skipped 142, the
same in every full run but for `cursor.md › CursorDown4`, which goes between `caret` and `agree`
(§20.4). It runs the most examples of the block apps (code blocks run), and agrees with 55% of them:
behind Logseq (197 of 312, 63%) and Tine (178 of 305, 58%), ahead of Roam (151 of 284, 53%) and
WorkFlowy (141 of 283, 50%).
What it does:

- **Paste has no plain form.** Dynalist handles the paste itself, and text becomes items, whatever
  the key (Ctrl+Shift+V only drops HTML, and there is none): `paste.md › Paste3`, `Paste5`. The first
  line joins the item at the caret, the rest become items, and the last line takes the text after
  the caret. The spec's clipboards end with a line break, so the text after the caret becomes an
  item of its own (`Paste7`, `Paste10`), as in WorkFlowy; list markers stay as text
  (`obsidian-true-outliner.md › Paste › #216`).
- **Enter splits by making the first half a new item before the old one**, so the children stay
  with the second half (`enter.md › Enter3`, `obsidian-true-outliner.md › Enter › E7, E8`); the
  space after the split stays (`Enter1`). Inside a code block Enter splits the item (`fences.md`).
  Enter on an empty item makes a sibling, ourus's default.
- **Joining** a first child into its parent with Backspace, as ourus does and WorkFlowy doesn't
  (`backspace.md › Backspace3`, `15`); but, as in the other block apps, no first child pulled into an
  empty parent (`del.md › Delete5` family), and nothing for Backspace on an empty first item with
  children (`backspace.md › Backspace17b`, `17c`).
- **The title before the first item**: Backspace deleting an empty first item puts the caret in the
  document's title (`backspace.md › Backspace17`, a caret verdict), and Up from the first item goes
  there, as in WorkFlowy and Roam.
- **Empty items stay** when the caret leaves them (`obsidian-true-outliner.md › Abandoning an empty
  place`); **item attributes stay**: Tab keeps a heading's level (`indent.md › Indent12`).
- **Whitespace** (30): Enter and the line break keeping the space at the split.

No Dynalist bugs met.

**Internals** (`window.DYNALIST`): `VERSION`, `DEPLOY_BUILD`, `DEPLOY_COMMIT`; `app.app_document` has
`document` (`get_node_collection()`: `get_root`, `find_node`), `controller` (`create_node`,
`get_history()`: `undoStack`, `redoStack`, `lastEdit`), `view` (`exec(fn)`, whose action has
`attach(node, parent, index)`, `detach`, `edit(node, meta => ...)`; the editing commands, `indent`,
`unindent`, `split_node`, `paste_as_plain_text`) and `ui` (`set_selection(node, anchor, head)`,
`selection().get()`, `get_node_state(node).dom.content_el`, `current_root`, a property). A node's
children are a collection (`get(i)`, `length()`, `each`, `array()`); its attributes are
`get_meta_object()`: `get_content`, `get_note`, `has_checkbox`, `is_checked`, `get_heading`, and their
setters. `app.preferences` (`get_boolean`, `set_boolean`), `app.shortcuts.get_shortcuts(id)`. The
editors are the contenteditable `.Node-content` and `.Node-note`.

## 12. Obsidian

**Which Obsidian.** Obsidian has no web app: the desktop app is the one, 1.14.4 (installer 1.14.4,
Electron 43.7.7, Chromium 150) on 2026-10-13, the latest, on arm64 Linux. It is Electron, so its
window is a Chromium page, and the driver starts it itself (`Driver.launch`, §21). obsidian-launcher
(npm, 3.2.1, a dev dependency; true-outliner's own end-to-end tests use it) downloads the app (its
JavaScript, `obsidian-1.14.4.asar`) and the installer (Electron, an AppImage it unpacks, so no FUSE)
into `.sxs/obsidian/`, once per version; `OBSIDIAN_VERSION` picks the app's version, `latest` by
default. It starts Obsidian with a configuration directory of its own (`--user-data-dir`, removed
at the end), so an installed Obsidian is never touched, with auto-update off, and installs and
enables plugins (the `enable-plugin-<vault id>` flag lifts restricted mode).

**Five setups, one driver.** `obsidian/obsidian.ts` makes the driver for a setup
(`obsidianDriver(profile)`: a name, a title, the editor's editing mode, plugins, their settings, keys and
`holds` of its own): `obsidian/` is bare Obsidian in Source mode, where the editor shows the text as
it is; `obsidian-lp/` is bare Obsidian in Live Preview, its default editing mode, which draws the markup;
`obsidian-outliner/` and `obsidian-true-outliner/` add a plugin, in
Live Preview, what their users get. Each is a `driver.ts` of a few lines with a README and results of its own.

### 12.1 How it runs

- **Starting** (`launch`): the setup's lock (`.sxs/obsidian/<name>.lock`, so a second run of the
  same setup stops; different setups run side by side); an Xvfb of its own, on a display it finds
  free itself (`-displayfd`; none with `--headed` and a `DISPLAY`); the vault written anew, `.sxs/obsidian/vaults/<name>/`
  (`.obsidian/app.json`, `hotkeys.json`, a plugin's `data.json`); Obsidian started detached with
  `--remote-debugging-port` on a free port, `--no-sandbox` (Electron as root needs it), a proxy on a
  port nothing listens on (offline: no update, no plugin list reaches it), and background throttling
  off. The runner connects with `chromium.connectOverCDP` and takes the window
  (`app://obsidian.md/index.html`). Stopping kills the app's process group and the Xvfb and removes
  the configuration directory, also when the run exits some other way. Its log is
  `.sxs/obsidian/<name>.log`. About 2 s to a ready window, once downloaded.
- **Ready** (`open`): the window reloaded, so that the idle script runs before the app's;
  `app.workspace.layoutReady`; settled; every plugin the vault enables loaded
  (`app.plugins.enabledPlugins`, `plugins[id]._loaded`), or the run stops; Tab indents `- a` / `- b`.
  The version line names the app, the installer, and each plugin with its version.
- **A note per test**: `ourus-<n>.md` made with `app.vault.create` and opened in the active tab
  (`workspace.getLeaf(false).openFile`), which gives the editor a new state, so undo has nothing from
  before the test; the last test's note is deleted once the new one is open. The caret is a
  CodeMirror transaction (`activeEditor.editor.cm.dispatch({ selection })`, then `focus`); reading is
  `cm.state.doc` and its main selection (none when the editor isn't focused).
- **The view** is the setup's: `livePreview` in the vault's `app.json`, so every note opens in it,
  and `open` checks it (the editing view's state says `source`). Obsidian's Markdown is ourus's
  `obsidian` flavor (`behaves`).
- **Keys**: Obsidian's defaults and CodeMirror's beneath them. "Move line up" and "Move line down"
  (`editor:swap-line-up`, `-down`) have no hotkey out of the box, so the vault binds them to Alt+Up
  and Down; redo is Ctrl+Shift+Z; nothing deletes an item with its children or duplicates one.
- **A test takes about 0.7 s**, most of it settling, a full run 5½ to 6 minutes beside the other apps. Nothing needed
  installing: Xvfb and Electron's libraries were there (the README lists the Debian packages).

**Internals** (`window.app`): `vault.create(path, text)`, `vault.delete(file, true)`,
`vault.getConfig(key)` and `setConfig` (a change applies to editors made afterwards);
`workspace.layoutReady`, `getLeaf(false).openFile(file, { active })`, `getActiveFile()`,
`activeEditor.editor` (`getValue`, and `cm`, the CodeMirror 6 `EditorView`); `plugins.enabledPlugins`
(a `Set` of ids), `plugins.manifests[id].version`, `plugins.plugins[id]`. The user agent says
`obsidian/<version>`. The app's code is `app.js` in the `.asar`, stored uncompressed, so it can be
searched as it is: the editor's extensions are built in `getDynamicExtensions`, and commands are
`addCommand({ id: "editor:…" })` calls with their default hotkeys beside them. These, with the
libraries Obsidian ships and its parsers, are in `sxs/obsidian/stack.md`.

### 12.2 Indentation: tabs, translated

Indenting with spaces, Tab put four spaces whatever `tabSize` was (2, 3 or 4); with tabs, a tab.
`app.js` says why: `indentUnit.of(useTab ? "\t" : "    ")`, and `tabSize` is only how wide a tab is
drawn (CodeMirror's `tabSize`, and the CSS `--indent-size`). Nothing gives two spaces, which the spec
draws.

So Obsidian runs with tabs (`useTab`, its default, set anyway), and an example indented with spaces
is translated: each two spaces of a line's indentation are loaded as a tab (an odd one stays a
space), and each tab of its indentation is read back as two spaces, the caret mapped both ways
(`asTabs`, `asSpaces`, checked offline by `obsidian.test.ts`). It gives back exactly the text it
was given. An example already indented with tabs (the spec draws them `→`) runs as written; one whose
caret is between two spaces of indentation is skipped (one example). The user chose the spec's two
spaces for now, and Obsidian's own defaults are to be revisited. Weighed and dropped: four spaces,
halved on reading (not Obsidian's default either, and an odd width can't be halved), and a plugin
setting the indent unit to two spaces (no longer bare Obsidian).

What no translation carries is CommonMark's columns: a tab reaches the next multiple of four, two
spaces reach two. Under an ordered item (`1. a`, its text at column 3) Obsidian's tab nests the next
item, and the two spaces it is read back as don't, where the spec draws three: those examples
disagree over indentation alone (`indent.md › Indent4`, `5`). Of bare Obsidian's 273 disagreements,
25 differ in nothing but indentation widths, most of them real (`indent.md › Indent2`: Tab leaves
the children behind), and 5 of the 25 are in ordered lists. The same under a marker with a wider
gap: true-outliner's Tab under `-  parent` (its text at column 3) writes a tab, a child to every
reader, read back as two spaces, which would be a sibling
(`obsidian-true-outliner.md › Indentation › list-marker-content-column`); its own `indent-node`
command writes three spaces.

### 12.3 Starts it won't hold

The load check found three kinds, each an error at first (bare Obsidian's 3 in Live Preview, the
plugins' 11 and 10), and each now a skip with its reason (`holds`). Source mode holds every start:
the same examples run there.

- **The frontmatter**, in Live Preview: it is shown as properties, and a caret placed in it ends up
  outside it (`zzz-redesign.md › Obsidian: frontmatter is a preamble`).
- **A task's checkbox**, in bare Live Preview: it is drawn as a widget, and a caret between the
  marker and the checkbox's end goes to the line's start (`tasks.md › TaskBackspace1`). It is
  `obsidian-lp`'s own rule (`inCheckbox`): true-outliner keeps the caret there.
- **Before an item's text**, with either plugin: a caret at the line's start or in the marker goes to
  the text's start (`backspace.md › Backspace2`, `cursor.md › CursorHome3`, `enter.md › Enter34`):
  `keepsCaretOnText(plugin, { spaces, checkbox })`. Outliner ("stick the cursor to the content") also
  moves a caret before a checkbox's end past it, and keeps one in the trailing space of an empty
  item; true-outliner keeps a caret before a checkbox, and moves one from that space to the item's
  end (`del.md › Delete5d`).

The first rule for the plugins, written from Outliner's description, took every space after a marker
for the marker's, and skipped Delete5d, which Outliner held: each rule now matches its setup's
measured errors.

### 12.4 Bare Obsidian, in Source mode and Live Preview

**Results:** in Source mode (`obsidian`), agree 108, caret 11, whitespace 6, disagree 275, error 0,
skipped 58; in Live Preview (`obsidian-lp`), agree 107, caret 11, whitespace 6, disagree 273, error 0,
skipped 61. The verdicts differ only on the three starts Live Preview won't hold (§12.3), which run
in Source mode (the frontmatter one agrees, the two by a checkbox disagree); but the same verdict
isn't the same outcome. Compared outcome for outcome, two more examples, `caret` in both editing modes,
land elsewhere: `cursor.md › CursorUp2` (Up into `## Title`: `#┃# Title` in Source mode,
`## Ti┃tle` in Live Preview) and `CursorDown3` (Down into a nested item: `┃  - b`, `  ┃- b`).

Seven cases were written to find where the editing modes part, and run in both. ourus's outcome is
expected in each, what the text says in a monospace layout (`cursor.md`'s rule); they pass in ourus:

| case | start | key | ourus | Source mode | Live Preview |
| --- | --- | --- | --- | --- | --- |
| LP1: markers a view hides | <pre>abc&#42;&#42;def&#42;&#42;ghi<br>abcdef┃ghijk</pre> | Up | <pre>abc&#42;&#42;d┃ef&#42;&#42;ghi</pre> | agree | <pre>abc&#42;&#42;de┃f&#42;&#42;ghi</pre> |
| LP2: a heading, drawn larger, without its `#`s | <pre>## abcdef<br>abcd┃ef</pre> | Up | <pre>## a┃bcdef</pre> | <pre>##┃ abcdef</pre> | <pre>## abc┃def</pre> |
| LP3: by a checkbox, drawn as a widget | <pre>- &#91; ] ┃task</pre> | Left | <pre>- &#91; ]┃ task</pre> | agree | agree |
| LP4: by a checkbox | <pre>- &#91; ] ┃task</pre> | Backspace | <pre>- &#91; ]┃task</pre> | agree | agree |
| LP5: frontmatter, drawn as properties (`flavor: obsidian`) | <pre>---<br>a: b<br>---<br>text┃</pre> | Ctrl+Home | <pre>┃---</pre> | agree | <pre>┃text</pre> |
| LP6: a link, its syntax hidden | <pre>a┃&#91;b](c) d</pre> | Right | <pre>a&#91;┃b](c) d</pre> | agree | agree |
| LP7: a table, drawn as a widget | <pre>a┃<br>&#124; x &#124; y &#124;<br>&#124; --- &#124; --- &#124;<br>&#124; 1 &#124; 2 &#124;</pre> | Down | <pre>&#124;┃ x &#124; y &#124;</pre> | <pre>&#124; ┃x &#124; y &#124;</pre> | the same |

What a key does to the text is the same in both; where a caret goes by the layout is not: Up and
Down land by what is drawn (hidden markers, a heading's larger font), and the document's start is
after the frontmatter's properties. Editing keys by a checkbox or a link do what the text says in
both. (An example has twice been lost to a load that never settled, "Resulting promise was garbage
collected": not the connection but one of Obsidian's own calls; such an example is run again, §21.)

Plain CodeMirror Markdown editing with Obsidian's list handling, and little structure:

- **Backspace at an item's text start deletes the space before it**: `- one` / `- ┃two` becomes
  `- one` / `-┃two` (`backspace.md › Backspace1`); nothing joins items, carries children or closes
  gaps (2 of `backspace.md`'s 28 agree, 3 of `del.md`'s 24).
- **Tab indents the line**, and an item's children stay where they were (`indent.md › Indent2`); on a
  heading it puts a tab in front (`Indent12`).
- **Enter continues a list**, and on an empty nested item outdents it (`enter.md › Enter28`, which
  expects a sibling), as ourus's `enterOnEmptyItem: outdent` would; the driver doesn't declare that
  yet (§20.6).
- **Moving is by line** (Alt+Up and Down, bound by the vault): an item moves without its children,
  but every line of a selection moves together.
- **Paste is plain**: the text goes in at the caret as it is (`paste.md › Paste7`: `- a┃b` with
  `x` / `y` gives `- ax` / `y` / `┃b`); no paste example agrees, with or without a plugin.
- **Caret motion** agrees most (23 of `cursor.md`'s 32), and quotes do better than with either plugin
  (14 of 53).

### 12.5 With Outliner

[Outliner](https://github.com/vslinko/obsidian-outliner) 4.10.2 (`obsidian-outliner`, the community
plugin, pinned), at its default settings. Its keys act on a list item at a single caret, inside a
list only: Enter, Tab and Shift+Tab ("better" Enter and Tab), Backspace and Delete, and Ctrl+Shift+Up
and Down ("Move list item up", "down"), which the driver uses for the moves. It indents with
Obsidian's indent unit, a tab, copying an existing indentation where there is one.

**Results:** agree 130, caret 13, whitespace 5, disagree 241, error 0, skipped 69 (11 of them starts
it won't hold, errors until they were skipped). Against bare
Obsidian in Live Preview, 44 examples agree that didn't, and 21 don't that did:

- **Indenting carries the children** (`indent.md › Indent2` agrees; `indent.md` 10 of 22, bare 6).
- **Backspace and Delete join** where children allow (`backspace.md` 9 of 28, `del.md` 8 of 24);
  where they don't, Backspace does nothing.
- **Moving is by item**, with its children, into the neighboring item at a list's edge; but a
  selection of several items doesn't move at all (`move-subtree-down.md › MoveDown11`), where bare
  Obsidian's move-line moved every line.
- **Quotes do worse** (9 of 53): moves past and between quoted items (`quotes.md › swapping two
  quoted items`).
- **Of true-outliner's own cases** (`obsidian-true-outliner.md`), 22 of 72 agree, against bare
  Obsidian's 13.

### 12.6 With true-outliner

[true-outliner](https://github.com/laughedelic/obsidian-true-outliner) 0.14.4 (`true-outliner`, its
latest release on GitHub, pinned; it isn't in the community list, and the launcher installs the
release's files). Outline mode is a tab's, taken from `outlineByDefault` (on by default, and set in
the vault's `data.json` anyway) when the tab opens a note, so each test's note is outlined. Its
keymap comes first in outline mode (CodeMirror's highest precedence): Enter splits a node, Shift+Enter
continues one, Tab and Shift+Tab move a node with its children, the arrows, Home and End are
outline-aware, and Ctrl+Shift+Up and Down ("Move node up", "down") move a node. Prereleases since
0.14.4 fix paste under Obsidian 1.14.4, so its paste results here may differ for that reason.

**Results:** agree 143, caret 41, whitespace 6, disagree 200, error 0, skipped 68 (10 of them starts
it won't hold, errors until they were skipped): the most
agreement of the three, and the most caret verdicts. Against bare Obsidian in Live Preview, 74 examples agree that
didn't, and 38 don't that did:

- **Its own cases**: 34 of `obsidian-true-outliner.md`'s 72 agree (bare 13, Outliner 22), and so do
  more of Enter (11 of 33), Shift+Enter (5 of 16), Backspace (11), Delete (9) and indenting (12 of 22).
  The spec's cases were measured from true-outliner and then drawn as wanted, so where it still
  differs is where the spec chose otherwise, or where true-outliner has changed since. Checked one by
  one, none of the 34 is the driver's: 18 are differences the spec's prose names; #228 and #255
  true-outliner's own e2e cases mark known-failing, with the same output; about 11 come from its
  Enter catalogue, a record of the plugin before its grammar change, where its current spec
  (`openspec/`) gives what ran (a blank line after a split heading, E13, E14, E16, E17; the caret in
  the widened gap at a paragraph's start, E29; the caret at a moved node's start; Enter on a setext
  underline refused, E18). A moved fence gets a blank line that its own notes say it needs none of;
  an indented item keeps its own bullet (`destination-list-style`); and `list-marker-content-column`
  is the tab translation's (§12.2).
- **The caret, not the text**: a move puts the caret at the moved item's text start rather than where
  it was (`move-subtree-up.md › MoveUp1`: `- b┃` comes out `- ┃b`), so moves agree on the text and give
  `caret` (none of `move-subtree-up.md`'s 24 agree outright); Home stays at the text's start
  (`cursor.md › CursorHome2`).
- **Headings and paragraphs** in a document of sections disagree more than bare Obsidian does
  (`obsidian-true-outliner.md › Enter › E29`: Enter at a paragraph's start).

### 12.7 The plugins side by side

Agreements per spec file, of its examples (bare Obsidian in Live Preview, with Outliner, with
true-outliner, each skipping a few starts of its own, §12.3; bare Obsidian in
Source mode agrees on the same, but for the frontmatter example):

| file | examples | Live Preview | Outliner | true-outliner |
| --- | ---: | ---: | ---: | ---: |
| `backspace.md` | 28 | 2 | 9 | 11 |
| `del.md` | 24 | 3 | 8 | 9 |
| `indent.md` | 22 | 6 | 10 | 12 |
| `enter.md` | 33 | 6 | 6 | 11 |
| `shift-enter.md` | 16 | 2 | 2 | 5 |
| `obsidian-true-outliner.md` | 72 | 13 | 22 | 34 |
| `move-subtree-up.md`, `move-subtree-down.md` | 44 | 8 | 9 | 1 |
| `cursor.md` | 32 | 23 | 22 | 19 |
| `quotes.md` | 53 | 14 | 9 | 10 |
| `paste.md` | 23 | 0 | 0 | 1 |

63 examples agree in all three. A plugin adds what bare Obsidian lacks,
structure for items (joins, indents and moves that carry children), and costs what it overrides,
plain-text motion and moves that keep the caret, and its handling of quotes.

### 12.8 Three readings of Markdown

Obsidian reads a note's Markdown with two parsers, separate code that disagree, and its editing
commands read the caret's line a third way (pinned from the 1.14.4 bundle against the upstream
packages; the evidence is in `sxs/obsidian/stack.md`, "Two parsers"):

| | what it is | where it runs | what it gives |
| --- | --- | --- | --- |
| **the editor's** | `hypermd`: Obsidian's fork of HyperMD 0.3.x's CodeMirror 5 mode, on CodeMirror 5.64.0's `markdown` mode (patched by Obsidian too), run in CodeMirror 6 through `StreamLanguage.define(CodeMirror.getMode({}, { name: "hypermd" }))`. A syntax highlighter's tokenizer, a line at a time | Source mode and Live Preview | tokens: classes per run of text and per line (`HyperMD-list-line-2`); no tree, no list or item nodes. A list item is a line at a depth, the depth being how many open items' text columns its indentation reaches (`listStack`) |
| **reading view's** | remark-parse 8.0.2/8.0.3 (2020), the last tokenizer-based remark before micromark, called directly (`new Parser(…)`, not unified) with `{ breaks: true, commonmark: true }` (`breaks` is Obsidian's own: remark dropped it in 4.0) and Obsidian's tokenizers (highlights, internal links, tags, math, footnotes, block ids, comments, frontmatter) | reading view (`app.js`, a worker for a long note); the metadata cache (`worker.js`); Quick Look | an mdast tree, to HTML by mdast-util-to-hast 10.2, hast-util-to-html 7.1 and DOMPurify 3.0.1 |
| **the commands'** | a regular expression on the caret's line (`newlineAndIndentContinueMarkdownList`) | Enter, Shift+Enter; Tab only indents | the line's prefix: quote markers, indentation, a marker, a checkbox |

The user's doubt, that the names might be what stuck of an old library, was the right one to ask:
the bundle's `defineMode` and `getMode` calls, and the running editor's syntax tree, show the mode is
what parses; HyperMD's addons aren't there, only its mode, and CodeMirror 5 ships only to host modes.
Neither parser is CommonMark's: the editor's only colors lines, and remark-parse 8 on its own renders
444 of the CommonMark spec's 652 examples as the spec does (59 of the 74 on lists), where
commonmark.js, compared the same way, renders 640 (and 74). Live Preview's widgets (a callout, a
table, math) are placed by the editor's tokens and drawn by reading view's pipeline, from their text.
The two readings part where a line-by-line tokenizer can't see what CommonMark decides from what
comes before:

| text | Editing view | Reading view |
| --- | --- | --- |
| <pre>para<br>2. x</pre> | `2. x` a list line | `<p>para<br>2. x</p>`: a list from 2 doesn't interrupt a paragraph |
| <pre>para<br>1. x</pre> | a list line | a paragraph, then a list |
| <pre>- a<br>lazy</pre> | `lazy` a plain line | `lazy` in the item (a lazy continuation) |
| <pre>- a<br><br>      code</pre> | the item's text, continued | a code block in the item |
| <pre>&#42; a<br>+ b</pre> | both list lines, depth 1 | two lists (a new bullet starts a new list) |
| <pre>> - a<br>>   - b</pre> | quote lines, no list | a quote holding a list, nested |
| <pre>    - a</pre> | no class | a code block |
| <pre>- a<br>  - b</pre><pre>1) a</pre><pre>Title<br>---</pre><pre>#tag</pre> |  | the same |

And the commands read a third way, the line at the caret by its text: Enter after `2. x` below a
paragraph continues a list (`3. `) that reading view doesn't show; Enter in `> - a` continues the
quote's list (`> - `), though the editor's tokens mark no list there; Enter after a lazy line doesn't
continue the item reading view puts it in; Tab on `+ b` after `* a` indents it as an item. The
driver doesn't depend on any of these (it reads the text), but what Obsidian does to a list is
decided a line at a time, which is much of why it disagrees with ourus's structural editing.

## 13. Tine

**Which Tine.** [Tine](https://tine.page/) is an outliner of Logseq's kind: pages of blocks, stored as
Logseq's Markdown, a desktop app (Tauri, 0.7.1) whose editor is a SolidJS frontend with its parser in
WASM. Its site's guide, https://tine.page/guide/app/, is that editor, published over a snapshot of
the guide (the export of 2026-09-28): read-only, since a `tine-published` meta makes the app take a
backend that refuses every write. The app also ships an in-memory backend, for running in a browser,
which it takes when the meta isn't there. So `tine/proxy.ts` drops the meta, and the guide runs over
that backend: editable, no login, saving nothing, the traffic only GETs (the app, the plugin
registry). Two more patches name the bundle's document store and the backend's pages on
`globalThis` (`__sxsDoc`, `__sxsPages`) for the driver; `open` stops the run if a new bundle leaves
them out. The desktop app runs on WebKitGTK and has no CDP, so the web build is the one to drive.

**The driver** (`tine/README.md`): a page per test pushed into the backend's pages and opened through
the search (Ctrl+K, its name, Enter; the app has no route to a page); the caret set in the block's
textarea until it stays; reading the store, which the editor commits to as it is typed in. Tasks are
`TODO` / `DONE`, as in Logseq; undo is "page only" (Tine's "Toggle undo/redo mode", run by `open`). Keys
from `src/keybindings.ts`: Alt+Shift+Up and Down move a block with its children, Escape then Backspace
deletes it with its children, Alt+U deletes to the line's start; the document's ends are emulated
(Up or Down until the caret stops, then Ctrl+Home or End). Two quirks cost a run each:

- **A name of its own per run.** A tab outlives a run, and the next run of Tine takes it over with
  the last run's pages still there; numbering pages from 1 in each run gave the next run's first page
  the name of an old one, and the search opened the old one. Every start then held another test's
  blocks. Names now carry the run.
- **A code block's editor has the code alone** (`textarea.code-edit`, without the fences), so a caret
  in it is an offset in the code: the driver adds and takes off the opening fence's length, and skips
  examples whose caret is on a fence.

**Results:** agree 178 (74 original), caret 14, whitespace 32, disagree 81, error 0, skipped 153: 58% of
the 305 examples it runs, second of the block apps (Logseq 63%, Dynalist 55%). What it does:

- **Joining** as in the other block apps: Backspace on an empty first block with children does
  nothing (`backspace.md › Backspace17b`, `17c`), and an empty block with children isn't joined into
  (`del.md › Delete5`, `5b`, `5d`).
- **Plain lines pasted** go into the block as they are (`paste.md › Paste7`, `Paste10`), as in
  Logseq; an outline of `- ` items becomes blocks.
- **Enter keeps the space** after where it splits (`enter.md › Enter1`): most of the whitespace
  verdicts.
- **Skipped**: quotes (53), code blocks with the caret on a fence or kept as Tine can't (18 of
  `fences.md`'s 25), and `duplicateSubtree`, which has no command.

## 14. SiYuan

**Which SiYuan.** [SiYuan](https://b3log.org/siyuan/) is a block editor over Markdown (a document's
paragraphs, headings, lists and items, quotes and code are blocks), open source (AGPL-3.0), with no
public demo. Its official Linux arm64 release, 3.8.6 (2026-09-29), runs here: downloaded from
GitHub once (250 MB, 30 s), its SHA-256 checked against the release's sums, and its kernel (Go)
started with `serve` on a workspace of its own, `.sxs/siyuan/workspace/`. The kernel serves the web
UI that the app's browser loads and an API, on 127.0.0.1 only, with no auth code there and no way
out (its proxy is a port nothing listens on). A new hook of the driver's, `serve`, starts it before
the app's tab loads, and leaves it running for the next run, as the browser is; `run.ts --stop`
stops it too (§21). `sxs/siyuan/README.md` has the details.

**The driver.** Each test's outline is a document of its own, made from Markdown through the API,
every block a list item at its depth. Nothing in the API opens a document in the editor, and loading
`/?id=<doc>` reloads the whole UI, about 3 s a test; SiYuan's plugin API has `openTab`, so the driver
brings a plugin of its own, a dozen lines, installed into the test workspace with plugins trusted
there (Settings › Marketplace), and a document opens in 0.3 s. Since 3.8 the undo stack is the
kernel's, per document, so a fresh document starts with an empty history. Reading is the editor's
DOM, SiYuan's tree, each block's text its Markdown by SiYuan's own converter (Lute's
`BlockDOM2StdMd`); the caret goes into that Markdown and back through a marker character, so markup
drawn as no text (a heading's `## `, `**`, the zero-width characters around inline code) counts as in
the text. A block outside every list is owned as the spec's buffers' blocks are (a paragraph owns the
list right after it). Projecting the whole document's Markdown instead, as the spec's buffers are,
was tried and read SiYuan's tree wrong: after a deletion at a text's start, SiYuan writes `-  b` with
the child indented two columns, which CommonMark doesn't make its child. Keys from SiYuan's keymap in
its configuration (⌘ is Ctrl on Linux): Ctrl+Shift+Up and Down move a block, Ctrl+D duplicates,
Ctrl+Y redoes. `deleteSubtree` has no key: Escape puts the item's paragraph in block selection, Space
selects it, and Backspace empties it, the item and its children staying. About 1 s an example, 5
minutes a run; repeated (`--repeat=2` on paste, cursor, Enter and undo), no example varied.

Seven kinds of start, found by the load check, are skipped with the reason: text starting with
whitespace (structure, or trimmed), a line's trailing whitespace (trimmed, a hard break's spaces
too), an empty last line, a heading's closing `#`s (dropped), `- ---` (a thematic break, not an item),
and a caret in a task's checkbox or on a code block's fence (no text there). The first rule for
trailing whitespace took an empty task's `[ ] ` for it and skipped four examples SiYuan held; it
leaves the checkbox out now.

**Results:**

| | original | adapted |
| --- | ---: | ---: |
| agree | 60 | 103 |
| caret | 1 | 8 |
| whitespace | 15 | 12 |
| disagree | 26 | 61 |
| skipped | | 172 |

163 of the 286 examples it runs agree (57%): fourth by agreements, behind Logseq, Tine and Dynalist,
and by share between Tine (58%) and Dynalist (55%). What it does:

- **Backspace at an item's start lifts it out of the list**: the item's text becomes a second
  paragraph of the item before (`backspace.md › Backspace1`); at a nested item's start, the item
  outdents (`Backspace3`, `15`). Delete at an item's end joins nothing (`del.md › Delete1`).
- **Shift+Tab on a top-level item** makes it a paragraph owning the list after it, as ourus does
  (`outdent.md › DirectOutdent2`, `3` agree).
- **Moves go by position, not among siblings**: a block moved up past an item with children goes in
  among them (`move-subtree-up.md › MoveUp7`), and one moved down past its parent's last child leaves the
  parent (`move-subtree-down.md › MoveDown8`), as Outliner's moves do in Obsidian.
- **Enter on an empty middle child** makes it a second paragraph of its parent item (`enter.md ›
  Enter28`), none of ourus's `enterOnEmptyItem`; Enter and Shift+Enter keep the space at the split,
  most of the whitespace verdicts.
- **A block's kind stays**: Tab doesn't deepen a heading (`indent.md › Indent12`), as in Logseq; a
  task item and a plain one given in one list become two lists, side by side.
- **Paste is text**: lines pasted go into the block as its lines, with either key (`paste.md ›
  Paste3`, `Paste7`).
- **Duplicate in an item** copies its paragraph inside the item, and selects the copy
  (`duplicate-subtree.md › DuplicateSubtree1`).

## 15. Emacs with markdown-mode

**Which Emacs.** GNU Emacs 30.2 (Debian's `emacs-nox`, installed for it) with markdown-mode 2.8
(2026-03-08, `jrblevin/markdown-mode`, one Lisp file, fetched once and checked against its SHA-256),
and nothing else: `emacs -Q`. Emacs is the first app that is no page: the driver starts it on a
terminal of its own (`emacs -nw` in a tmux session of the run's, 80 by 24), starts Emacs's server in
it, and plays keys into it with `emacsclient --eval`. Its `launch` gives the runner a `session` in
place of a page (`Session`, `sxs/lib/driver.ts`): keys, typing and the clipboard (the kill ring), a call
returning once Emacs is done, so nothing settles. A test takes about 5 ms; the whole spec, 3 s.
`sxs/emacs-markdown/README.md` has the details.

**Keys like a user's.** A key is `execute-kbd-macro` of it, in Emacs's notation, so it goes through
the command loop and markdown-mode's keymap; a command's error ("Nothing to demote at point") is its
beep. markdown-mode's list commands are its subtree commands on `C-c` and the arrows: "Indent
Subtree" (`C-c <right>`), "Outdent Subtree", "Move Subtree Up" (`C-c <up>`) and Down; TAB cycles a
line's indentation, and Shift+Tab folds. RET is a line break, continuing no list (that is M-RET);
Shift+Enter, unbound, is RET for Emacs as for a user. Yank (C-y) is the one paste; undo C-/, redo
C-M-_; "Kill Element" (C-c C-k) deletes an item with its children; nothing duplicates one.

**Where the harness went by Emacs, and was put right.** Four verdicts that weren't markdown-mode's,
each found by its symptom:

- **Without redisplay**, markdown-mode's list commands found no item ("Nothing to demote at point",
  "Before first heading", M-RET making `  * `): they read the text properties fontification sets
  (`markdown-list-item`), and nothing had fontified. Before each key the frame is redisplayed and the
  buffer fontified, as between a user's keys.
- **Up and Down lost their column**, consecutive undos undid each other: each key was a macro of its
  own, which starts with no last command. The command before is now handed to a key's first
  (`pre-command-hook`), as the command loop hands it on between a user's keys.
- **In a daemon**, the column was lost anyway: moving by screen lines takes it from the display, and a
  daemon's window is on none. Logical moves would have kept it, and changed what Up does on the first
  line (to its start, where a screen-line move beeps and stays), so Emacs runs on a terminal instead,
  its defaults kept.
- **A selection loaded as an active region** stayed through an arrow; a user's, made with Shift, goes.
  It is loaded as Shift makes it now (a temporary region), and typed text goes in as one run, its
  undo one change, as a user's typing.

One setting departs from the defaults: lists by two spaces, as the spec draws them
(`markdown-list-indent-width` 2, `indent-tabs-mode` off), where markdown-mode indents by four, with
tabs; examples whose lists use tabs disagree for it (`indent.md › Indent6`, `7`). CR line endings are
skipped: Emacs decodes a file's CRLF as it reads it. Three runs of the whole spec gave the same
verdicts.

**Results:** agree 75, caret 23, whitespace 5, disagree 302, error 0, skipped 53: the fewest
agreements, a Markdown editor with a few list commands, not an outliner.

- **RET continues no list** (`enter.md › Enter1`, `Enter3`); on an empty item, a line break after its
  marker (`Enter28`).
- **DEL after a marker deletes the space before the text**, and at a line's start joins the line to the
  one before, marker and all (`backspace.md › Backspace1`, `3`).
- **Its subtree commands** indent by its own width, keep the item's marker, don't renumber
  (`indent.md › Indent3`, `4`, `5`), act on the item at point, not a region's (`Indent9`), put blank
  lines around a heading whose level they change (`Indent12`), and leave a paragraph alone
  (`Indent21`, `22`). A first item doesn't move up out of its list (`move-subtree-up.md › MoveUp7`).
- **Kill Element** leaves a blank line where the item was (`delete-subtree.md › DeleteSubtree1`).
- **Yank is plain** (`paste.md › Paste3`, `Paste7`).
- **Home is the line's start**, before the marker (`markdown-special-ctrl-a/e` is off), most of the
  caret verdicts; Up on the first line beeps and stays (`cursor.md › CursorUp1`); redo leaves point at
  the line's start (`undo.md › Undo1`).

## 16. BlockNote

**Which BlockNote.** [BlockNote](https://www.blocknotejs.org/) is a block editor of Notion's kind,
a React library on ProseMirror and Tiptap 3 (`TypeCellOS/BlockNote`, 10k stars, MPL-2.0 for its
core): paragraphs, headings, list items, tasks and code are blocks, and any block can have children.
Its site's [demo](https://www.blocknotejs.org/demo) is collaborative, a Yjs room on another server
(`wss://yhub.teleportal.tools/…`) shared with whoever has the link, with comments, AI and Yjs's own
undo: testing there would send every edit to that server, so it isn't driven. The site's minimal
example (https://www.blocknotejs.org/examples/basic/minimal) is the library's default editor, keeps
its document in the page, and opens no WebSocket: that is the one, built from BlockNote's main
branch (`@blocknote/core` 0.55.0; the site's Next.js build id stands in for a version). Its Sentry
reports, through the site's own `/monitoring`, are answered by the proxy. `sxs/blocknote/README.md`
has the details.

**The driver.** BlockNote's editor is the `editor` prop of its React view, found on the container's
fiber; Tiptap's is on `.ProseMirror`. A test's outline goes in through BlockNote's API
(`replaceBlocks`), each block a bullet list item at its depth, or a heading, task or code block by its
text; then the view's ProseMirror state is made anew from the same document and plugins, so the
history is empty: loading is a transaction, and undo would otherwise undo it. The caret is a
ProseMirror selection by block and offset; reading is `editor.document`, each block's canonical
text. A paragraph reads as its text, as the projection has one: marked (`¶ `), the 52 differences that
read a paragraph gave 3 more, each where ourus made a paragraph too, and none of the others agreed for
want of the mark. Keys are BlockNote's defaults; `deleteSubtree` and `duplicateSubtree` are the block's
side menu, with the mouse, and skipped. Two kinds of start it won't hold were found by the load check
(a caret in a task's checkbox, on a code block's fence) and are skipped. An example takes 100 ms, the
whole spec 36 s; two runs gave the same verdicts.

**Results:** agree 131 (48 original), caret 9, whitespace 31, disagree 128, error 0, skipped 159.

- **Backspace at a list item's start makes it a paragraph**, in place, children and all; a second
  joins it to the block before (`backspace.md › Backspace1`, `3`). Delete at an item's end joins the
  next (`del.md › Delete1` agrees).
- **Enter on an empty list item makes it a paragraph** (`enter.md › Enter28`, `tasks.md ›
  TaskEnter2`); where ourus makes one too, they agree (`TaskEnter1`). Enter and Shift+Enter keep the
  space at the split (most of the whitespace verdicts).
- **Tab nests a heading and keeps its level** (`indent.md › Indent12`), as Logseq does; Shift+Tab at
  the top level does nothing, and the focus leaves the editor (`outdent.md › DirectOutdent2`, `3`).
- **Moves carry the block's children** (`move-subtree-up.md › MoveUp1` agrees); pasted lines go into the
  block, as line breaks (`paste.md › Paste3`, `Paste7`).

## 17. What it says about the spec

- **Prose about other apps can now be checked.** `paste.md › Paste7` said Logseq pastes plain lines
  as items. It does that for list items and pastes plain lines into the block's text; the prose is
  fixed. `backspace.md › Backspace17` says Logseq removes the first item, which is true, but Logseq
  throws doing it and leaves no caret (bug 1). The prose's claims about Roam both hold: it pastes
  plain lines as blocks after the current one (Paste7), and refuses Backspace on an empty first
  block (Backspace17).
- **Examples that only check ourus's own outcome** (`result` blocks, no buffer: 21) mean nothing
  to another editor. That's by design, but they are a fifth of what's skipped.
- **Positions that only Markdown has.** A caret in a marker, on a blank line, or past the last line
  ending (29 examples skipped or uncompared) is a place in the text that a block editor has no
  equivalent for. It's ourus's to specify, and other editors can't be held to it.
- **Display-column motions.** Where Up or Down lands depends on the font (`cursor.md › CursorDown*`).
  The spec's README says a test whose outcome depends on that belongs to the editor's own tests;
  these examples are in the shared spec all the same, and every real editor will differ on them.
- **A text editor runs nearly all of it.** SilverBullet runs 401 of the 458 examples, and bare
  Obsidian 400 in Source mode (397 in Live Preview, 389 and 390 with the plugins), quotes, blank
  lines and frontmatter included; what they skip is the 28 examples
  with nothing to compare (ourus's `result` blocks), 5 with CR line endings (CodeMirror keeps LF),
  options and commands they lack, and (Obsidian) starts its editor won't hold. SilverBullet agrees
  on 111, and bare Obsidian on 108 in Source mode and 107 in Live Preview: plain CodeMirror Markdown editing, with outline commands on top or
  without, is far from ourus's structural editing (§9, §12), which is the measure of what ourus
  adds. An outliner plugin closes part of the gap: 130 with Outliner, 143 with true-outliner (§12.7).
- **Options other apps don't have** (13 examples skipped in Logseq, Dynalist and WorkFlowy, 12 in
  Roam, 18 where outdenting can't be logical): `headingEditing`, `taskEditing`, `deleteAtGap`,
  `handleFenceContents`, `pasteMidText: split`, `bullet: +`, `enterOnEmptyItem: outdent` (Roam's own
  behavior), `outdent: logical`. Where an app has a setting for one, the driver switches it per
  test: `outdent: logical` in Logseq and Dynalist (§21).

## 18. Insights

- **Measure; don't sleep.** Every fixed pause in the prototype was hiding a race. Instrumenting the
  page's own timers and frames gives a precise "done" that adapts to the machine, and it made the
  runs both faster and repeatable.
- **Check readiness by function.** "Tab indents a block" is the readiness that matters. The signals
  that looked like readiness (the API object exists, the journal has rendered, the page is quiet)
  were all true a second too early.
- **Shared state needs a firewall.** One app exception poisoned the tests after it, through a flag
  left set. Running everything in one app instance is what makes runs fast. It is safe only with
  per-test resets, and with reporting that names the test that broke things.
- **Verify the input, not only the output.** An app that normalizes its input makes a test mean
  nothing while looking like a result. Reading the state back after loading costs one read per
  test.
- **Read the app's source when observation surprises you.** Black-box observation found the
  symptoms; the source (Logseq's, on GitHub) found the causes (a debounce, the guard's real semantics,
  the paste rules), and corrected two wrong conclusions drawn from observation alone.
- **The browser is the noisiest client.** Chromium's own background traffic outnumbered the app's
  requests many times over. A proxy log and a per-host tally make that visible; blocking it keeps
  the cache clean and the runs offline-capable.
- **A tab in the background crawls**, or did. Chromium gave a tab behind another no animation
  frames, and WorkFlowy, its tab behind the last one opened, took 2–3 s an example instead of under
  one. It looked like the app slowing down as tests piled up, and reloading it every 50 examples
  changed nothing; timing what each wait waited on found it (the wait was spent before its first
  poll, on a frame that didn't come). The run brings its tab to the front, and the first-frame wait
  has a fallback; measured later, with the browser's flags against backgrounding, a tab behind
  another got its frames. What a tab behind another still doesn't get is the clipboard (next).
- **The tab in front has the clipboard.** In a browser, the Clipboard API works only in the tab in
  front: behind another, a write is dropped and a read comes back empty, without an error. Apps run
  side by side in one browser took each other's clipboard, and only the app that pastes through that
  API (Logseq) showed it; a browser per app ended it (§21).
- **A verdict that changes when apps run together is the runner's first.** Ten apps at once gave the
  verdicts of runs alone, once two of the runner's own faults (the shared clipboard, a load racing a
  busy machine) were found; neither was an app's. The comparison that found them is example by
  example against runs alone, not of counts.
- **The same verdict isn't the same outcome.** Obsidian's two editing modes gave the same verdict for every
  example they both run, and still did different things: two `caret` verdicts, carets in different
  places. Comparing outcomes, and writing cases where the views should part, found it (§12.4).
- **One app, three readings of Markdown.** Obsidian reads a note three ways: its editor's tokens
  (its fork of HyperMD's CodeMirror 5 mode, line by line, in CodeMirror 6 through `StreamLanguage`),
  its commands' (the caret's line, by its text), and remark's (reading view and the metadata cache,
  CommonMark's lists). They part on lazy continuations, lists in quotes,
  a list from 2 after a paragraph, a change of bullet. An editor whose keys and renderer read the text
  differently is what a structural model, one parse for all, is meant to avoid (§12.8).
- **A tab outlives a run, and so does what is in it.** Tine's test pages, numbered from 1 in each run,
  met the last run's pages of the same name in the tab the next run took over, and the search opened
  the old ones; a test's names need the run in them where the app keeps them.
- **Instrumentation in a reused page goes stale.** A page kept between runs keeps the init script it
  was loaded with, so a change to `idle.ts` silently didn't apply. The script now carries its
  version, and a page with another version is reloaded rather than reused.
- **The first demo found may not be the app.** https://workflowy.com/wf-demo/ is a 51 KB imitation of
  a few keys, written for the landing page; the real app runs anonymously in another page. Looking at
  what a demo page loads takes a minute and saves testing a widget.
- **Read an editor through the app.** WorkFlowy's note editor shows a trailing line break, which
  looked like a reading artifact; WorkFlowy's own accessors (`editor.plainText`,
  `DomEditableText.selectedIn`) read text and caret as WorkFlowy does, and confirmed it real (§8).
- **Keymaps are in the bundle.** WorkFlowy's bindings are a table in its JavaScript, per platform:
  moving is Alt+Shift on Linux, Ctrl+Shift on ChromeOS, Cmd+Shift on a Mac. Reading it beats guessing.
- **Read-only is often a flag.** SilverBullet's demo is read-only by its boot config, which the
  client reads at boot; nothing is compiled out. Patching the flag in the proxy, and answering the
  server writes there, turns a read-only demo into a test bed that is never written to. A local-first
  app takes a server that refuses writes (503) in its stride: it keeps the edits and tries later.
- **Load through the app's storage, not its editor.** Writing a test's page into SilverBullet's space
  and opening it starts the editor with an empty history; loading it with an editor transaction makes
  the loading the first thing undo undoes.
- **Names of their own defeat a cache.** Each test's page had a new name, so each lookup of it was a
  miss that reached the demo server: 410 requests a run. The proxy's per-host tally showed it, and the
  proxy answers them now. Anything a test names freshly needs answering locally.
- **Workers hide work.** A command running in a web worker leaves nothing for `idle.ts` to see until
  its answer arrives; the read that once came between SilverBullet's change and its caret was this.
  An app built on workers needs a busy signal that counts what they owe.
- **The best demo saves nothing.** Roam's help graph is the full app, open without a login, and it
  keeps edits in the session without sending them: no writes to answer, no copy to keep current. The
  cost of a live app is then only what it loads, once, and what a test makes it call (Roam's
  embeddings of new blocks), which the proxy's tally shows and the proxy answers.
- **An app's words are its own.** Roam has no "outdent" anywhere: it "unindents". Searching a bundle
  for a setting, a command or a key starts with finding what the app calls it, from its menus, its
  help text or its command names.
- **Editor-neutral is mostly true.** About two thirds of the spec runs in a block app, and nearly all
  of it in a text editor. What a block app can't run is Markdown's own structure (quotes, blank lines,
  frontmatter) and positions blocks don't have; what neither runs is ourus's internal outcomes. That split is a useful map of what ourus specifies beyond outlining.
- **A desktop app is a page too.** Obsidian is Electron, so Chromium: started with
  `--remote-debugging-port`, its window is a Playwright `Page` like a browser tab, and the driver,
  the settling and the report are the same. obsidian-launcher fetches a pinned build and keeps its
  configuration apart from any installed copy; an Xvfb stands in for a display. Starting takes about
  2 s, so each run starts its own, and nothing is shared between runs.
- **A setting's name isn't its meaning.** Obsidian's "Tab indent size" (`tabSize`) is how wide a tab
  is drawn; indenting with spaces is a fixed four, whatever it says (`indentUnit` in `app.js`).
  Pressing Tab under each value of the setting found that in a minute; the bundle said why.
- **Translate the representation, not the meaning.** A tab for each two spaces of indentation, and
  back, gives exactly the text it was given, whatever the text; scaling spaces would not (an odd width
  has no half). What no translation carries is CommonMark's columns (a tab reaches the next multiple
  of four), so the rule is per test: an example indented with tabs already runs as written.
- **The start is the app's to refuse.** Live Preview and both plugins move a caret placed where they
  don't keep one (§12.3). The load check made each an error rather than a wrong verdict, and the
  driver turns them into skips with the reason, per setup, since each refuses differently. The rule
  comes from the measurement: the first one, written from the plugin's description, skipped an
  example the plugin held (`del.md › Delete5d`).
- **A plugin is a setup, not an app.** The same driver with another vault runs Obsidian with each
  plugin, and the three reports side by side say what a plugin adds and what it breaks: Outliner
  turns 44 of bare Obsidian's examples into agreements and 21 the other way, true-outliner 74 and 38
  (§12.7).
- **Read the app's tree, not its Markdown.** SiYuan's own converter writes `-  b` for an item whose
  text starts with a space, with its child indented two columns, which CommonMark doesn't nest: the
  whole document's Markdown, projected as the spec's buffers are, read a structure SiYuan doesn't
  have. The editor's tree, with ourus's ownership rules where blocks stand outside a list, reads what
  the app holds (§14).
- **Run cold now and then.** A state kept between runs (a browser profile, a cache) hides what an
  app does the first time: SilverBullet's demo, its space not yet synced, passes writes to its server,
  and every run had had a synced profile until `.sxs/` was moved away (§9).
- **A flaky example can be the app's geometry.** Dynalist's Down maps the caret's pixel x into the
  next item by measuring text, and `cursor.md › CursorDown4` puts that x at a glyph's middle: a pixel
  of layout flips it. Repeated on its own, or within its file, it never flips; it does in about one
  full run in six (§20.4).
- **Two groups, once chance is out.** `sxs.md`'s heatmap (how often two apps get the same verdict)
  shows the block apps and the text editors apart. Corrected for chance (Cohen's kappa on agreeing or
  not), the block apps' group holds (0.6 to 0.9 among Logseq, Tine, Roam, Dynalist and WorkFlowy),
  and the text editors' is weaker (0.4 to 0.7, true-outliner below it, Obsidian's two views aside,
  the same in every verdict), as most of their matches are both disagreeing, which needn't be the same outcome. On the
  examples neither app adapted, the split stays (Logseq and Dynalist the same in 86%, Logseq and
  Emacs in 32%): it isn't the projection's. Outliner, on plain outlines, is with the block apps (75%
  with Dynalist and WorkFlowy); its text-editor half is the rest of Markdown.
- **An editor's guards meet the driver first.** ProseMirror puts back a caret that goes to the
  document's start within 200 ms of the editor's focus, taking it for the browser's reset on focusing
  (`DOMObserver.flush`): with the focus given as a test loads, Home and Left right after did nothing
  (Tana's editor, Tiptap's). Dating the focus back (`view.input.lastFocus = 0`) is the fix in any
  ProseMirror editor; Tiptap's own `focus()` waits for a frame, so the focus is ProseMirror's.
- **A source has a date.** Cases taken from true-outliner's Enter catalogue were measured before a
  change of its grammar, and some differ from the plugin now for that alone (§12.6); a record of an
  app's behavior is of a version.

## 19. Recommendations and next steps

**The next apps.** Ranked by what each would tell us that Logseq and WorkFlowy haven't, weighted by
how many people use it, from the whole survey (`survey/apps/`, `survey/plugins/`). Access counts:
an app runs where it has a live demo that needs no account, or where it is open source and runs
here (SiYuan, Tine, Emacs); one with neither is dropped, a copy of it on disk or not (Tana, 7).

1. **Obsidian: done** (§12), three ways: bare (the baseline everyone gets), with Outliner
   (`vslinko/obsidian-outliner`, how most people outline Markdown text today) and with true-outliner
   (whose measured cases `spec/obsidian-true-outliner.md` holds). Unified Outliner (1.0.6, the
   community plugin: commands on a tree of a note's heading sections, list subtrees and body blocks)
   was tried as a fourth setup and dropped. It binds no keys, so the vault bound its commands where
   Obsidian leaves keys free; it agreed on 108 examples, one more than bare Obsidian in Live Preview,
   its moves by subtree the best of the setups (11 of 44), its indent four columns where the list has
   tabs (none of `indent.md` agreed), its other keys Obsidian's. The desktop app, started with
   `--remote-debugging-port` by obsidian-launcher and driven over CDP; loading and reading through
   its API (`app.vault`, `app.workspace.activeEditor.editor`), in Source mode and in Live Preview,
   which differ where a caret goes by the layout (§12.4). Next for it: Outliner's settings off their
   defaults.
2. **Notion**: out, by the bar above (no editor without a login: §20.6, 5). The most used block editor, and unlike the pure outliners it mixes paragraphs,
   headings and lists in one document: an indented paragraph becomes a child block, much as ourus's
   paragraph owns the list after it. That is where the adapted examples now report "the models
   differ", so it would be the best outside reference for ourus's mixed-document rules; AFFiNE is the
   nearest that runs (below). Block model.
3. **Logseq DB** (45k stars), Logseq's successor, with a rewritten editor: whether it still behaves
   as OG does matters. Cheap, with the Logseq driver as the template. https://test.logseq.com/ opens a
   demo graph without a login, the database version (properties, a `#Journal` tag; checked
   2026-10-14), though the site says it is for testing new features and may be unstable.
4. **Emacs: org-mode and markdown-mode.** Org-mode is the reference outliner on plain text: decades
   of precise rules for promoting, demoting and moving subtrees, headings and lists. markdown-mode
   brings the same commands to Markdown itself. markdown-mode is done (§15): Emacs on a terminal,
   played through its server, a new kind of driver (a session, no page); org-mode can take the same
   (`emacs.ts`), its buffers converted (`- ` lists already are Org's), its keys Org's.
5. **Typora**, the reference for WYSIWYG Markdown editing: its list behavior (Enter, Tab, Backspace
   in a rendered list) is what many writers expect. Electron, `text` model. **Skipped**, for its
   license: there is no web demo (typora.io has videos and the desktop app: Linux arm64 and x64,
   `.deb` and `.tar.gz` at downloads.typora.io), and its EULA allows a trial of 15 days "for the sole
   purpose of testing and evaluating", forbids using it longer, and forbids to "decompile, reverse
   engineer, disassemble, attempt to derive the source code of, modify" it. So no driver of the
   usual kind, whose API comes from reading the app's bundle (§20.2), and no resetting the trial
   with a fresh profile per run. What would remain is a black box: files opened and saved, keys,
   Typora's source-code mode (CodeMirror 5's public API) for the caret, the DOM; the user chose not
   to.
6. **VS Code with Markdown All in One** (3.3k stars, millions of installs): the mainstream "Markdown
   editor" behavior, a baseline of what people get by default. Tried and dropped: VSCodium 1.140.06880
   (VS Code 1.140.0's source), bare and with Markdown All in One 3.6.2 from Open VSX, started over CDP
   as Obsidian is, a document per test loaded and read through an extension of the driver's own.
   Bare, 65 agree of the 397 examples run (311 disagree, no errors); with the extension, 84, the same
   verdict in 371 of them. The extension continues a list on Enter, but its Tab indents only at an
   item's start (elsewhere VS Code's Tab pads to the next tab stop), a move is a line's, children
   left behind, Home goes to the marker, and pasted text goes in as it is. In the heatmap both sat
   by bare Obsidian.
7. **RemNote**, a modern outliner with a large PKM audience (whether it has a demo without an account
   isn't checked). **Tana**, with the same audience, was
   tried and dropped: a driver ran the whole spec in its document editor (Tiptap 3 on ProseMirror,
   bound to a Loro CRDT), with 116 agree, 34 caret, 19 whitespace, 121 disagree, no errors and 168
   skipped. Its verdicts were most like WorkFlowy's (the same in 71% of the examples both ran), less
   like the other block apps' (57–64%), and least like the text editors' (46–59%). Its own ways:
   Shift+Enter makes an empty item after the item (no key makes a line break in an item), a move
   stays within its list, and pasted lines become paragraphs of the item. Dropped because Tana has no
   live demo without an account.

Lower priority: **AFFiNE** (73k stars, BlockSuite), a block document editor whose list behavior
is close to Notion's, and with Notion out the nearest to it that runs: https://app.affine.pro/ opens a
demo workspace without an account, kept in the browser (checked 2026-10-14). **SiYuan** (46k, Markdown-like
blocks), of the same kind, is done (§14), its release run here. **outl** (the closest to ourus's own goal: an outliner over plain `.md`) was
tried and set aside for now, as too complex. Its desktop app is Tauri on WebKitGTK (no CDP), its
Linux builds x86_64 only: it was built from source (v0.12.0-beta.216) and driven through WebKitGTK's
WebDriver (`WebKitWebDriver`, Tauri's automation on), its keys WebDriver's key actions, a test's page
written into its workspace, adopted (`reload_workspace`) and opened as an `outl://` link opens one.
A first full run: 49 agree, 165 skipped. Two of its own ways were confirmed in its source: Tab and
Shift+Tab leave the block's editing (the caret goes, though its docs say Tab stays), and a paste of
several lines loses its first line once the block is left (the editor's old text is committed over
it). Its moves, Shift+Tab at depth and joins at a block's edges weren't yet checked against the
driver. **Tine**, Tauri too, is done (§13):
its site's guide is its editor, and an in-memory backend it ships made it editable. **Zettlr** and **Joplin**
are CodeMirror Markdown editors whose list handling is mostly CodeMirror's own, which bare Obsidian
and SilverBullet already cover. **MarkText** (62k, its own engine, Muya) was tried and dropped: a
WYSIWYG Markdown editor, not an outliner.

Not worth the effort: **AppFlowy** (Flutter draws to a canvas: no DOM to read); **Bike**,
**OmniOutliner**, **TaskPaper**, **Craft** (macOS-native); **Leo**, **TreeSheets**, **MindForger**
(Qt and wx desktop apps); **Neorg** (a syntax of its own).

Three pieces of infrastructure follow from the list: the `text` model (Obsidian, Typora, VS Code and
Emacs need it; done, for SilverBullet, §9), a desktop app's driver that starts the app and drives
its window over CDP (Obsidian, Typora, VS Code; done, `Driver.launch`, §12), and a process driver next
to the browser one (Emacs).

**Logseq, more:**

- Done: Logseq's logical-outdenting setting (`:editor/logical-outdenting?`) is switched per test, and
  the five `outdent: logical` examples run (§21). Other settings could follow the same way.
- `duplicateSubtree` has no key in Logseq; copying and pasting a selected block might stand in for it.
- The demo is Logseq OG. Logseq's database version is a different app, and worth a driver of its own;
  it has a public demo now (above, 3).

**The framework:**

- Done: the cross-app table, `sxs/sxs.md` (example × app → verdict, the apps by agreement, a
  header row per spec file and a row of each app's agreements there; a heatmap of how alike two apps'
  verdicts are),
  from `run.ts all`; for "what do other outliners do" in `zzz-open.md`, a run of the apps on the
  examples in question gives it directly (`run.ts all <selector>`, its table in `.sxs/runs/matrix.md`).
- Done: every app rerun for the report's current layout (§21), on 2026-10-13, and from a cold start
  (an empty `.sxs/`), with the same verdicts.
- Run with `--repeat=2` after changing a driver. Flaky results mean a settling problem, and they
  are cheaper to find early.
- `sxs.md` diffs show when an app changes. Logseq's demo updates without notice, and its build id
  in the report's header says when.

**The spec:**

- Prose claims about other apps should cite a run (`sxs/<app>/sxs.md`) or be checked
  against one; Paste7 was wrong.
- The layout-dependent caret examples (`CursorDown*`) could carry a marker that tells other editors'
  runners to skip them.

## 20. Handover: continuing the work

What a later session (or another agent) needs to pick this up without re-deriving it. The READMEs in
`sxs/` (the framework) and `sxs/<app>/` (each app) have the rest.

### 20.1 Operating it

- **Run**: `node sxs/run.ts <app> [selector...]`. A full run takes minutes: run it in the
  background with its output redirected to a file, and read the summary at the end. Only examples
  that don't agree are printed, unless `-v`. Each printed one ends with its time; a test normally
  takes 0.2–1 s, so 2 s or more means something is wrong with settling (`--timing` says what each
  action waited on).
- **State** is in `.sxs/` (git-ignored; `OURUS_SXS_DIR` moves it; moved away, the next run is a
  cold start that fetches and downloads everything again, about the same 6 minutes): `http/<host>/` the
  cache (`.json` + `.body` per response), `cert/` the proxy's certificate, `proxy.log` (one line per
  request: `hit`, `miss`, `live`, `local`, `blocked`, `live-ws`, `local-ws`), `chromium/<app>/` each
  app's browser's profile (`DevToolsActivePort`: its debugging port; `ourus-flags`: the flags it was
  started with), `chromium-<app>.log`, `<app>.lock` (the run holding an app's shared tab),
  `clipboard-<app>.lock` (the run whose example has the app's browser's clipboard, §21), `runs/`
  (the logs, verdicts and table of the last run of several apps), `servers/` (the servers drivers
  started, `<app>.json`: their pids, for `--stop`), `siyuan/` (SiYuan's download, its unpacked
  release, its workspace and `kernel.log`), `emacs/` (the downloaded markdown-mode, and each run's server socket, `server-<pid>/`),
  `local/` (copies of apps kept on this machine only, never committed), `probe/` (scratch scripts),
  and `obsidian/` (the downloaded app and
  installers, `obsidian-versions.json`, the plugins in `obsidian-plugins/`, the setups' vaults, logs
  and locks: `<name>.lock` keeps a setup to one run at a time, while setups run side by side, §12).
- **The proxy** listens on 127.0.0.1:8899 (`OURUS_PROXY_PORT`): `/__proxy/health`, `/__proxy/stats`
  (`?reset` clears), `/__proxy/stop`. A run restarts it when `proxy.ts` changes (a hash of the file);
  app rules (`<app>/proxy.ts`) are reloaded without a restart, checked once a second by mtime.
- **The apps' browsers** (one per app, `.sxs/chromium/<app>/`) are restarted when their flags
  change; `--stop` stops every one of them and the proxy. Each app has a tab in its browser's default
  context, marked `window.__ourusApp` / `__ourusVersion`, with the idle
  script's version in `window.__ourusIdle.version`; a run reuses a tab only if all of these and its
  URL match, and `--fresh` forces a new one. A run brings its tab to the front: the Clipboard API
  works only there (§18).
- **Several apps**: `run.ts a,b … [selector…]` or `run.ts all`, at most `--jobs` at once (all by
  default), a run of `run.ts` per app; logs, verdicts and the table in `.sxs/runs/`, and for every
  app on everything, every report and `sxs/sxs.md`. The fourteen setups on the whole spec take about 6
  minutes on this machine (10 cores, 46 GB). `run.ts all --table` writes the table again from the
  verdicts in `.sxs/runs/`, running nothing.
- **Environment**: `CHROMIUM` (default `/usr/bin/chromium`), `openssl` for the certificate, Node 26
  (TypeScript runs as is); for Obsidian, `Xvfb` and Electron's libraries (`obsidian/README.md` lists
  the Debian packages) and `OBSIDIAN_VERSION`. `tsconfig.json` includes `sxs/` (beside `src/` and `test/`) with only ES2022's
  library; a `/// <reference lib="dom" />` in any file adds the DOM's types to the whole program, so
  `run.ts` and the drivers carrying it is enough for a file that only uses `window` in
  `page.evaluate` (`obsidian.ts` doesn't carry it). `erasableSyntaxOnly` rules out enums and parameter
  properties. `npm test` runs `sxs/lib/outline.test.ts` and `sxs/obsidian/obsidian.test.ts` (the
  glob `sxs/*/*.test.ts`). `sxs/` imports `src/` and two of the spec's test helpers, `test/drawing.ts` and
  `test/specfile.ts`.
- **Scratch files**: probes and run outputs go in `.sxs/probe/` and `.sxs/` (git-ignored,
  inside the checkout, so `node_modules` resolves from there); a session's scratchpad directory can
  disappear mid-session.
- **Another session may share the working tree** (a fork of this one did): say which files you are
  editing (`SendMessage`), and re-read a file before editing it, since the other session may have.
  The proxy and the apps' browsers are safe to share; each app's tab has its own lock.
- The user commits: move and delete with plain `mv` and `rm`, not `git mv` or anything that stages.
  `pkill -f <pattern>` killed the shell running it when the pattern was in its own command line: use
  `ps -eo pid,args | awk '/[p]attern/{print $1}' | xargs -r kill`.

### 20.2 Probing an app by hand

Most of the work on a driver is exploring the app in a browser. Attach a scratch script (in
`.sxs/probe/`, with imports relative to it: `../../sxs/lib/idle.ts`) to the shared
browser instead of launching one:

```ts
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
import { idleVersion, installIdle } from '<ourus>/sxs/lib/idle.ts';
import { driver } from '<ourus>/sxs/<app>/driver.ts';
const port = readFileSync('<ourus>/.sxs/chromium/<app>/DevToolsActivePort', 'utf8').split('\n')[0];
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await ctx.newPage();                      // or browser.contexts()[0].pages(): a run's tab
await page.addInitScript(installIdle, idleVersion());
await driver.open(page);                               // the driver's own loading and readiness
// ... driver.load(page, outline), page.keyboard.press(...), driver.read(page), page.evaluate(...)
await ctx.close(); await browser.close();              // closing a CDP connection leaves the browser up
```

`node_modules` must resolve from the script's directory: inside the checkout it does (elsewhere, a
symlink to `ourus/node_modules`).

Obsidian isn't in the shared browser: a probe starts it the way a run does, through the driver
(`const app = await driver.launch({ headed: false, say: console.log })`, the idle script added,
`await driver.open(app.page)`, and `await app.release()` at the end), or by hand with the launcher
(`ObsidianLauncher.launch({ appVersion, installerVersion, vault, plugins, args:
['--remote-debugging-port=<port>', '--no-sandbox'], spawnOptions: { env: { DISPLAY } } })`, then
`chromium.connectOverCDP`). Changing a setting at runtime (`app.vault.setConfig`) and opening a new
note to see its effect is the quickest way to learn what a setting does (§12.2).
Techniques that paid off: sampling the page's state every few ms after a key, to see what changes
when (§3); instrumenting `setTimeout` and `MutationObserver` around one key (the idle script's own
diagnostics are `--timing`); `Object.keys(window.<api>)` and the prototypes of its objects; searching
the app's bundle for strings around a feature (`Move up`, a setting's name, `ctrl+shift+up`) with a
small Python script, since minified lines defeat grep; reading the app's source when it is open
source.

### 20.3 Writing a driver: a checklist

1. **Find the real app.** A "demo" page may be a widget (WorkFlowy's `wf-demo`). Check what it loads
   and whether it has the app's scripting API; find where the app says its version (Logseq doesn't:
   its bundle's ETag stands in). A desktop app built on Electron is a page too: the driver's
   `launch` starts it with `--remote-debugging-port` and hands over its window (Obsidian, §12); a
   plugin is a setup of that driver, not an app of its own.
2. **Find the API** for loading and reading: a plugin API (`window.logseq.api`), a scripting API
   (`window.WF`), the app's client and syscalls (`window.client`, `window.syscall`), its stores. Keys
   are only for the actions under test. Pick the `model`: `block` for blocks, `text` for an editor
   of Markdown text. A read-only demo may be read-only by a flag the proxy can patch (§9).
3. **Readiness by function**: `open` presses a key on a two-block page until it does its job (Tab
   indents). Logseq needed it (it installs its keys a second after start); WorkFlowy's driver does the
   same as a precaution. Ready in a fresh profile too: an app may work otherwise until something
   it does once is done (SilverBullet's first sync of its space, §9), so try a cold start.
4. **`load`**: a fresh document per test (a page, or the children of one zoomed item), deleting the
   last test's first. Wait until the blocks are on screen, let any focus the app moves by itself
   happen (Logseq opens an inserted block for editing, a moment later), then place the caret and
   check it landed (in a ProseMirror editor, date the focus back, or a caret sent to the document's
   start right after is put back, §18). Text the
   API can't store (trimmed edges, an empty note being edited) can be typed into the editor, or
   reached with a setup key; the runner's load check proves the starting state either way, and
   `holds()` refuses what can't be held at all. Prefer loading through the app's storage (write the
   page, then open it) to an editor transaction, which undo would undo. Name a test's page so the
   proxy can answer its lookups: a fresh name per test reaches the server otherwise.
5. **`read`**: the model, except what is being edited, which comes from the editor: both apps save
   about half a second after typing stops. Prefer the app's own accessors for the editor's text and
   selection (WorkFlowy's `editor.plainText`, `DomEditableText.selectedIn`) to walking the DOM.
6. **Keys**: from the app's keymap, for Linux (bundles often branch on the platform); actions with
   no key are emulated with keys in `act` (Up until the caret stops, Ctrl+Home then Down) or left
   out, and their tests are skipped.
7. **Busy signal** (`idle.busy`): a flag the app keeps while it works (Logseq's `editor/op`,
   WorkFlowy's animation counter, SilverBullet's plug invocations owed by its workers). Settling covers short timers, frames and mutations without it.
8. **Options**: `behaves` for what the app does out of the box (WorkFlowy and Roam: logical
   outdenting; Roam: Enter on an empty nested block outdents); `settings` and `configure` for what it
   can be set to (Logseq's and Dynalist's logical outdenting). Which one an app's behavior is shows in its bundle:
   a setting is read somewhere near the command; search under the app's own words for it (Roam's
   "unindent"). The examples that set an option, and their default twins (`outdent.md ›
   LogicalOutdent1` and `DirectOutdent1`, `enter.md › Enter30` and `Enter28`), tell which way the
   app goes.
9. **Check the run**: `--repeat=2` for flakiness; then errors (load mismatches name what the app
   rewrote); then the original disagreements one by one, since an artifact of the driver shows there
   first; then a sample of the adapted ones. Write what the app does in its README, and its bugs.
10. **Run it again, and beside the others**: a second run of the app takes over the first's tab with
   its documents still there, so a test's names need the run in them (Tine); and a run with the
   other apps (`run.ts all <file>`) should give the verdicts of a run alone, example for example.
11. **A published or read-only app may ship an editor's backend of its own**: Tine's guide is its
   real editor over a snapshot, and drops into an in-memory backend without one mark in its page;
   SilverBullet's demo is read-only by one flag of its boot config. Look for the switch before
   building or stubbing anything.
12. **An open-source app without a demo runs here**: its release, downloaded once and its checksum
   checked, its server started by the driver's `serve` (SiYuan's kernel, on 127.0.0.1, its outbound
   traffic sent nowhere), and recorded so that `--stop` stops it. Try a cold start, a profile and a
   workspace that are new: an app's first run can differ (§9).
13. **An app that is no page** gives a `session` from `launch` (keys, typing, the clipboard), and the
   runner plays it through that; a call returns once the app is done, so nothing settles. Play the
   keys through the app's own input loop (Emacs's `execute-kbd-macro`), and look for what the loop
   carries between a user's keys and a harness's calls don't (redisplay, the last command, a run of
   typing): each showed as a verdict that went by the harness (§15).

### 20.4 Known artifacts and limits

- ourus positions with no block equivalent: a caret in a marker or on a blank line (starting there:
  skipped; expected there: not compared), past the last line ending (`cursorDocEnd` may only be the
  last action, or be followed by `cursorDocStart`).
- Quotes, callouts and frontmatter are skipped for block apps; WorkFlowy also skips code, tables and
  other atoms, headings deeper than H3, and a caret in a checkbox or a heading's `#`s.
- Adapted examples compare two models (§5): a disagreement there is often Markdown's structure versus
  blocks, not a choice the app made.
- Caret motion lands by pixels in a proportional font (`cursor.md › CursorDown*`), and by the
  rendered layout in an editor that draws markup (SilverBullet draws list markers as bullets). It
  can vary: Dynalist's `CursorDown4` gave `agree` in two full runs of more than a dozen and `caret` in
  the rest, and never on its own (10 repeats) or within `cursor.md` (5 repeats). Not the driver: Dynalist's
  Down (`move_cursor_by_one_line` in `main.min.js`) takes the caret's pixel x (the item's left plus
  the caret's), subtracts the next item's left, and finds the character at that x by measuring the
  next item's text in an offscreen copy of its font; from `- abc┃` into the indented `bcd`, x falls at
  the middle of the `b`, so a pixel of layout decides between `┃bcd` and `b┃cd`. What moves the pixel
  in a full run wasn't found; a caret verdict, it was left there.
- Obsidian: indentation is translated, tabs to two spaces and back (§12.2), so CommonMark's columns
  under an ordered item read differently once translated; frontmatter, a caret by a checkbox (bare)
  and before an item's text (the plugins) are starts it won't hold, skipped (§12.3).
- SilverBullet: examples with CR line endings are skipped (CodeMirror keeps LF); `deleteSubtree` and
  `duplicateSubtree` have no command.
- WorkFlowy: tests run zoomed into an item whose title comes before the first block; Up from the first
  block goes there (`cursor.md › CursorUp1`).
- Undo can reach the operations that loaded the test (WorkFlowy and Logseq record them): an example that undoes
  more than it did would show it. Logseq runs with page-only history, so it stays within the test.
- A report (`<app>/sxs.md`) is deterministic but for the examples named here: two full runs give
  the same file, so a diff means the app, the spec or a driver changed. Dynalist's `CursorDown4` is
  the one known to flip; a load can race an app on a busy machine (loaded once more before it
  counts), and one of Obsidian's can fail to settle (run again from a fresh note), both said in the
  run's output (§21).

### 20.5 Traps already fallen into

- Fixed sleeps hide races, and pass until the machine is slow (§3).
- An exception inside an app's operation can leave a flag set that poisons every later test: detect
  it (stuck), reset it, and report the test that caused it (§3, §4).
- A demo's text can be stored differently from how it was given (Logseq trims and dedents): the load
  check exists because of it.
- What looks like a reading artifact may be the app (WorkFlowy's note gaining a line break was a
  bug); check against what the app stores after it saves before "fixing" the reader.
- A tab behind another, and a reused tab with an old idle script, both look like the app being slow
  (§18).
- Two run outputs written to the same file by overlapping runs; and a background loop killed halfway
  goes on to its next command: wait for runs, or give each its own output file.
- Per-test names (pages, items) that the app looks up on its server: each one a miss that reaches the
  server, every run (§9).
- Loading through an editor transaction: undo undoes it.
- A key from the wrong platform: Roam's redo is Ctrl+Y on a PC and Cmd+Shift+Z on a Mac; bundles branch
  on the platform, so read which branch is Linux's.
- `insert`/`edit` calls of an app's API return before the app is done: always wait for the effect
  (the element on screen, the editor focused, the value in the editor).
- An app's rules importing values from `proxy.ts` (not only types): fine for a running proxy, a
  deadlock for one starting, until the main block stopped awaiting at the top level (§21).
- A checkout shared across machines (containers): a browser profile locked by a process that isn't
  there (§21).
- The spec's clipboards end with a line break (a fenced block's content does): an app that gives the
  last line an item of its own shows it (Dynalist, WorkFlowy: the text after the caret becomes an
  item).
- One clipboard for the whole shared browser: two runs at once paste each other's text, unless they
  take turns (`clipboard.lock`, §21); and, worse, its Clipboard API works only in the tab in front, so
  apps run side by side in one browser took each other's clipboard, silently. A browser per app fixed
  it (§21); verdicts that change when apps run side by side are the runner's to explain first.
- A setting taken at its word: Obsidian's `tabSize` isn't its indent (§12.2). Press the key under each
  value before building on a setting.
- A rule written from a plugin's description: it skipped an example the plugin held (§12.3). Write
  the rule from the measured errors.
- Moving `.sxs/` (or its parent) while the shared proxy and browser run from it: stop them first
  (`--stop`).
- Removing the directory of an app just killed: Obsidian goes on writing its configuration for a
  moment, the removal failed (not empty), and the run died before writing its report. Wait for the
  app to exit, retry, and never let cleaning up lose a run (§12.1).
- The shell's working directory between commands isn't always the one last `cd`'d to: a relative
  path once made a file in the parent checkout. Use absolute paths, or `cd` in the same command.
- Only ever running warm. A browser profile kept between runs hides what an app does the first time:
  SilverBullet's demo passes writes to its server until a first sync, and no run had started without
  a synced profile until `.sxs/` was moved away (§9, §21). Try a cold start (`OURUS_SXS_DIR` at an
  empty directory, or one app's `chromium/<app>/` and `http/<host>/` moved aside) after changing how
  a driver opens its app.

### 20.6 Open work

1. Done: every app rerun for the report's layout (§21), every Obsidian setup for its skips, and every
   app from a cold start (an empty `.sxs/`), with the same verdicts.
2. Done: the cross-app table, `sxs/sxs.md`, and several apps at once (`run.ts all`, `run.ts a,b …`), a
   browser per app, with the same verdicts as runs alone; after a run that died, or a change to the
   table's layout, rerun only the apps that didn't finish (`run.ts a,b`), then `run.ts all --table`
   puts the table together from each app's last verdicts in `.sxs/runs/`, running nothing (§21).
3. The `text` model, done (§9). Next for it: a verdict for texts that differ only in indentation
   width but read as the same outline (parsed with ourus), which would show how much of a text
   editor's disagreement is its indent unit, and would take in the columns that Obsidian's
   translated tabs lose under ordered items and after a marker's wider gap (§12.2). Or simpler: a tab
   read back as the columns it reaches past its parent's content, not as two spaces, would draw those
   right.
4. The next apps (§19), by the bar there (a live demo needing no account, or open source run here):
   Logseq DB (its demo at test.logseq.com), Emacs's org-mode (`emacs.ts`, as markdown-mode), AFFiNE
   (its web app's demo workspace), and RemNote if it has a demo without an account; Notion is out,
   and VS Code was tried and dropped. Obsidian is done, three ways (§12), SiYuan (§14) and Emacs with markdown-mode (§15);
   Typora is skipped, for its EULA, and Tana dropped, as it has no live demo without an account
   (§19). Emacs with markdown-mode's own defaults (lists by four,
   with tabs) could be a second setup, as Obsidian's are.
5. Notion: investigated, no driver (what was found is all here). It has no editor without a
   login: its public pages (https://notion.notion.site/) run the full app read-only, its client gives
   edit mode only to a logged-in user, and its Demo Hub tours are Navattic captures, not the app.
   Making a public page editable by patching the client or its role data would get around Notion's
   login, so it isn't done. The way in is a Notion account of the user's, with a test page, which
   needs the user's say (and their session).
6. Obsidian: revisit the indentation (the user's call: the spec's two spaces for now, Obsidian's
   own defaults later); declare `enterOnEmptyItem: outdent` for bare Obsidian if Enter on an empty
   item outdents everywhere (`enter.md › Enter28`, `Enter30`); true-outliner's prerelease that fixes
   paste under 1.14.4, once released; Outliner off its defaults (`stickCursor: never`, say).
7. Dynalist: `duplicateSubtree` has no default key (`doc-duplicate`); a key could be bound for the test
   (`shortcuts.set_all_overrides`), which is a setting a user can change too.
8. WorkFlowy: map code blocks to its `code-block` type (40 examples skipped for code); its `p` and
   `numbered` types aren't mapped (a block's canonical text doesn't say paragraph or numbered).
9. Logseq: `duplicateSubtree` by copying and pasting a selected block, perhaps.
10. Tine: logical outdenting (a setting, Settings › Editor › "Logical outdenting", reached through its
    command palette), so that `outdent: logical` examples run; its version in a browser (the bundle's
    name isn't found among the page's scripts, so only the export date shows); the guide is older than
    the desktop app (0.6.987's export, against 0.7.1): a build of 0.7.1's frontend, served from disk
    (`fromDirectory`) with the same patches, would test the current one.
11. The heatmap compares verdicts: two apps that both disagree count as alike, whatever each did.
    Each app's `sxs.json` records each example's outcomes as well (each step's state drawn as a spec
    buffer, and a text app's projected onto blocks too, as `blocks`: `RunStep` in `run.ts`), so a
    heatmap of outcomes could take its place, from the checked-in files alone, or one corrected for
    chance (§18).

## 21. Log: after the write-up

- **Settings switched per test.** A driver can declare which of ourus's options the app has a setting
  for (`settings`) and set them (`configure`); each example runs with its own options, or ourus's
  defaults, and the runner switches only when they change. Logseq's logical outdenting is the first:
  `outdent.md › Logical outdent › LogicalOutdent1` and `Direct outdent › DirectOutdent1` start from
  the same outline, expect different outcomes, and Logseq agrees with both. The driver sets it in
  Logseq's in-memory graph config (`set_state_from_store`) rather than as the Settings toggle does,
  which writes `config.edn`, which makes Logseq reinstall its keys a second later (the race of §3).
  5 more examples run; 318 in all.
- **`differ` is now `disagree`**, the verdict for different blocks: "differ" read as a comparison,
  not an outcome.
- **The report** (`results.md`) starts with the app, its version, where it ran and the command, then
  the counts; original outlines and adapted examples follow in sections of their own, each with its
  disagreements drawn and its agreements listed; an adapted example shows the spec's buffers as
  written, then as the blocks they became.
- **`--timing`** prints how long the app took to settle after each action, and what it waited on last
  (a timer of so many ms, a mutation of some element, a frame).
- **Reusing an app's tab** now also checks that it was loaded from the driver's URL (a driver may move
  to another URL under the same name) and with the current `idle.ts`, and the run brings the tab to
  the front (§18).
- **App rules** can refuse a WebSocket and serve an app from a directory on disk (`fromDirectory`,
  with `TYPES`, the content types by extension); requests they answer are logged as `local`.
- **The `text` model** (`text.ts`): for Markdown editors, a driver's `model` is `text`, its documents
  are `TextDoc`s (text and selection), the spec's buffers are taken as written (placeholders
  dropped) and compared as drawn. `plan.ts` and `run.ts` branch on the model; the report has one
  section of examples instead of original and adapted.
- **A test page's lookups answered locally** (SilverBullet): each test's page has a name of its own,
  and the app asking the demo server for it reached the server on every run (410 requests in the
  first full run); the proxy now answers them "not found" itself.
- **Roam** (§10): the live help graph, whose per-test calls (AI embeddings of new blocks) the proxy
  answers; its document ends emulated past the page's title, as WorkFlowy's are past the zoomed
  item's.
- **Dynalist** (§11): the live demo; its POSTs cached by their body (the proxy's `key` rule).
- **The proxy couldn't start cold.** `silverbullet/proxy.ts` imports values from `proxy.ts`, which,
  run as the main module, awaited its app rules at the top level: each module waited for the other,
  and Node exited with nothing listening ("unsettled top-level await"). It had worked because the
  running proxy loaded those rules later, by mtime. The main block no longer awaits at the top level.
- **A stale profile lock** kept the shared Chromium from starting: `SingletonLock` named a process of
  another machine (the container before this one). `browser.ts` removes the lock when its owner isn't
  a live process on this machine.
- **The report's layout** (`results.md`), changed in steps as the user asked (§1, item 22), ends up so:
  - **Frontmatter** says what ran: `app` (the directory's name, `dynalist`), `version`, `url`,
    `command`.
  - **Original cases** and **Adapted cases** ("pure" examples are now "original", the word for
    buffers as the spec writes them, against "adapted") each have a subsection per verdict:
    Disagree, Whitespace, Caret, Error, then Agree; the skips by reason come last. The subsection
    says each example's verdict, so nothing under the example repeats it, only how it was adapted
    and the examples it stands for as well ("Also").
  - **Each example** is a numbered heading that links to it in the spec, `#### 1. [Backspace17b](../../spec/backspace.md#backspace17b)`,
    with no heading per spec file; the Agree and Skipped lists are numbered too. An example that
    stands for others is one heading but counts for each, so a section's count can exceed its last
    number.
  - **Side by side.** An example of one step (most) shows its command, then an HTML table: the start,
    the app's outcome and ourus's, in that order; an adapted one has a row as blocks and a row as the
    spec writes the buffers. An example of more steps keeps its start above, and a table (the app,
    ourus, and ourus as written) per step that differs.
  - **Buffers in tables** are escaped in a `<pre>`. A blank line would end the HTML block and give
    the rest to Markdown, so a blank line carries an empty `<wbr>`; commonmark.js keeps every one of
    Dynalist's 145 tables whole.
- **A clipboard lock.** The shared browser has one clipboard for all its pages: two runs at once (of
  two apps) could paste each other's text. An example that pastes or reads the clipboard now holds
  `.sxs/clipboard.lock` (the holder's host and pid, linked into place whole, so taken
  atomically) from loading to its last step, and waits while another run holds it; a lock left by a
  process that is gone is taken over. Runs of different apps can overlap safely as far as the
  clipboard goes; a tab behind another still gets no animation frames (§18), so they are slower.
- **Every app rerun** for the new layout (§20.6).
- **The report, again** (`results.md`), from a few examples the user rewrote by hand, and then in
  small steps:
  - **Buffers are fenced** (```` ```buffer ````, ```` ```clipboard ````) in the HTML table's cells,
    each between blank lines so Markdown renders it, under a comment naming its column
    (`<!--dynalist-->`, `<!--ourus-->`) unless the fence's kind already does (`buffer`, `clipboard`).
    No `<pre>`, no `<wbr>`: a fence holds blank lines.
  - **One table per step**: the clipboard, when there is one, is its first column, then `buffer` (the
    start), the app's outcome and ourus's. An example of more steps has its start in a table of one
    column, and after each step a table (the app, ourus) where they differ or a one-column `buffer`
    table where they agree.
  - **Notes come first**, under the command: `Adapted: heading`, `Also: ...`. An adapted example's
    buffers as the spec writes them follow the table, in an **Original:** table of their own (the
    start, then ourus after each step), so the main table is the blocks alone.
  - **Summary**: a table with a column per verdict, skipped and total, and a row for original
    examples, one for adapted ones and a total row with each column's share (`175 (38.2%)`); then
    **Per-file**, the same columns per spec file (linked), with the counts of original and adapted
    examples run, and a total row. Totals are bold; a zero is a blank cell, except in totals.
  - **Frontmatter**: `type: "SxS"` first, then `app`, `version`, `url`, `model`, `command`, and
    `elapsed_s` (the run's seconds). The intro says what was compared and links the model
    (`../outline.ts` or `../text.ts`), with a word on adaptation; the sections no longer explain
    themselves.
- **Every app rerun** for that layout, on 2026-10-13; the spec had lost `zzz.md` (458 examples), and
  the numbers moved with it. A report's buffers renamed from `start` to `buffer` later were rewritten
  in place (the header, and the comment the fence now makes redundant), not rerun.
- **A desktop app starts itself.** `Driver.launch` returns an `AppPage` (its window, and `release`
  to stop it); the runner then starts no shared browser, adds the idle script, and calls `open`,
  which reloads the window so the script runs. Obsidian is the first (§12).
- **Obsidian**, three setups of one driver (§12): bare, with Outliner, with true-outliner;
  obsidian-launcher (a dev dependency, pinned to 3.2.1) for the app and its plugins.
- **SxS.** `test/validation/` is `sxs/`, this note `10-sxs.md`, the state `.sxs/` (and
  `OURUS_SXS_DIR`), the npm script `sxs`, and the names a test gives its page in an app
  `ourus sxs ...`; "validation" went from the prose, for "side by side". Quick runs of SilverBullet,
  WorkFlowy and Roam (the apps whose page names changed) and a cold start of the proxy and browser
  from `.sxs/` checked it.
- **This note, reordered**: a table of contents; the apps' sections together (§7 to §12), then what
  the runs say (§17 to §19), the handover (§20) and this log; the brief's app table merged into the
  numbers at the top; each app's internals in its own section (they were one handover subsection),
  and in its `README.md`, with the bugs and quirks met (SilverBullet's lookups answered locally,
  Roam's redo key from the wrong platform, Obsidian's stopping), so that the READMEs hold what is
  worth keeping wherever this note goes.
- **`buffer` for `start`** in every table of the report, as in the tables of one column: rewritten
  in place in the eight reports (the header, and the comment the fence's kind makes redundant).
- **Obsidian in both editing modes**: `obsidian` is bare Obsidian in Source mode, `obsidian-lp` in Live
  Preview; a setup's `mode` sets `livePreview` in the vault's `app.json`, and `open` checks the
  editor's view. Live Preview's starts it won't hold are its own rules now (the frontmatter, and in
  bare Obsidian the checkbox): Source mode holds both. The verdicts differ only there, but
  outcomes differ where a caret goes by the layout: Up and Down, and the document's start past the
  frontmatter, found by comparing outcomes, not verdicts, and by cases written for it (§12.4).
- **Stopping Obsidian safely.** A full run in Source mode finished its examples and died removing
  the app's configuration directory, which the killed app was still writing to (`ENOTEMPTY`), before
  writing its report. The driver now waits for the app to exit and removes the directory with
  retries, ignoring what is left; the runner reports a failed release and goes on to the report.
- **Concurrent runs of Obsidian.** A setup is one run's at a time (`.sxs/obsidian/<name>.lock`, the
  run's pid linked into place whole; a lock whose run is gone is taken over), so a second run of it
  stops instead of rewriting the vault under the first; different setups run side by side, each with
  its own vault, log, configuration, port and display. Xvfb finds a free display itself
  (`-displayfd`), where the driver used to pick the first free one from `:77`, which two runs
  starting together could both pick. Tried: of two runs of `obsidian-outliner` started 1.5 s apart,
  the second stopped with "can't start Obsidian with Outliner: another run has obsidian-outliner (pid
  …)" and the first ran on and released the lock; a failed `launch` is now that one line, not a
  stack.
- **A plugin's repository by its URL** (`repo: 'https://github.com/laughedelic/obsidian-true-outliner'`):
  the launcher takes either form and caches by `owner/name`.
- **Several apps side by side** (`run.ts`, its "several apps" section; it was `many.ts` for an hour): `run.ts logseq,dynalist indent.md`, or `run.ts all …`,
  runs the selection in each app at once (`--jobs` for fewer), a run of `run.ts` per app in a process
  of its own, its output in `.sxs/runs/<app>.log` and its verdicts in `.sxs/runs/<app>.json` (the new
  `--json`). The proxy and the shared browser are started first, so the runs don't race to start them.
  It prints a line per app as it finishes, then a table of every example's verdict in each app, and
  writes the table as Markdown: `results/all.md` for every app on the whole spec (each app's run
  writing its report as well, so that is the full rerun of everything), `.sxs/runs/matrix.md` for any
  other run. Three apps on `indent.md` took 18 s.
- **Reports moved** from `<app>/results.md` to `results/<app>.md`, beside `results/all.md`: every
  report a name of its own, the generated files in one directory, the hand-written ones (driver,
  rules, README) in the app's; the reports' links are as deep as before.
- **Tabs behind tabs, measured again**: in the shared browser, with its flags against backgrounding,
  a tab behind another in the same window gets animation frames (31 in half a second, as the tab in
  front) and is visible and focused, as are tabs in windows of their own. So several apps in the
  shared browser need no window each (§18's "a tab in the background crawls" was before those flags).
- **Parallel runs, and the clipboard.** The first full run of every app at once gave the verdicts of
  runs alone for every app but Logseq, which lost four pastes (Paste3, 4, 5, 22: a plain paste that
  pasted nothing). Alone, Logseq's pastes were stable (`--repeat=3`, none flaky); with two other apps
  in the shared browser, four or five of them failed, different ones each time. The cause was ours:
  the shared browser has one clipboard, and its Clipboard API works only in the tab in front; behind
  another tab (each run brings its own to the front) a write is dropped and a read comes back empty,
  without an error. Logseq pastes through the Clipboard API (`navigator.clipboard.read`); Dynalist and
  Roam don't, and were spared. Two fixes fell short: bringing the tab to the front while holding the
  clipboard lock left one example failing (a code block's editor lost its caret while waiting for the
  lock), and taking the lock before loading brought four back. What fixed it was **a browser per app**
  (`.sxs/chromium/<app>/`, its log `chromium-<app>.log`): each has its own clipboard and its one tab
  in front, so apps can't take each other's clipboard or focus, and the clipboard lock is per app
  (`clipboard-<app>.lock`, for two runs of one app). Two parallel runs of Logseq, Dynalist and Roam on
  `paste.md` then matched their runs alone example for example, and took 8 to 14 s instead of 42
  (no app waits for another's clipboard). Each browser runs with `--disable-dev-shm-usage`, as Obsidian
  does: `/dev/shm` is 64 MB here, and an Obsidian with Outliner crashed its renderer at start ("Target
  crashed") when four Obsidians and the browser all used it.
- **`idle.ts` waits for clipboard reads**: a Clipboard API call (`read`, `readText`, `write`,
  `writeText`), a `ClipboardItem.getType` and a `FileReader` read are pending until they settle, as
  short timers are: they are answered by the browser, and nothing on the page shows the wait. It
  didn't fix Logseq's pastes (the browser per app did), but a paste that reads the clipboard is part
  of the reaction to its key.
- **Tine** (§13), the guide of its site made editable by the proxy.
- **Every app side by side, on everything**: `run.ts all`, ten apps at once, a browser each (the five
  in browsers, the four Obsidian setups, and Tine), took 344 s, against about 35 minutes run one after
  another, and wrote every report and `results/all.md`. Compared example by example with each app's
  run alone: identical for Roam, SilverBullet, WorkFlowy and the four Obsidian setups; Dynalist's
  `CursorDown4` flipped as it does alone (§20.4); Logseq's `MoveUp8` was an error, its start held
  wrong (a load racing the app on a busy machine; alone it agrees, 5 times of 5). So a start held
  wrong is loaded **once more** before it counts as the app's: an app that rewrites what it is given
  rewrites it again.
- **Reports as `sxs.md`**: each app's report is `sxs/<app>/sxs.md`, beside its driver again, and
  the table of every app side by side is `sxs/sxs.md`, each app's column linking its report
  (`results/` is gone); the table's frontmatter is what ran (`type`, `command`, `elapsed_s`), the apps
  and their versions being in the reports.
- **The table's apps by agreement**: in `sxs.md` (and every table of several apps) the apps are in
  the order of how many examples agree, the most first, ties by name, the same in the summary and in
  every file's table: Logseq 196, Tine 178, Dynalist 176, Roam 151, Obsidian with true-outliner 143,
  WorkFlowy 141, Obsidian with Outliner 130, SilverBullet 111, Obsidian 108, Obsidian in Live Preview
  107.
- **The summary of `sxs.md` transposed**: a row per app (its name linking its report), a column per
  verdict, skipped and total, zeros blank, as in each app's report.
- **One table of examples in `sxs.md`**: every example in one table after the summary, its header
  once, a bold row naming each spec file above its examples, in the spec's order.
- **Logseq's load race, found by its symptom**: in the full run of ten apps, `move-subtree-up.md › MoveUp8`
  started with its last block, `c1`, held as `c`, the text of the block the caret goes into. Logseq
  opens an inserted block for editing a moment after the insert; on that busy machine it came after
  the driver had opened its own block, and the driver, writing into the focused editor (Logseq trims
  what it stores, so the driver sets the editor's text as typed), wrote into `c1`'s. Spinning every
  core didn't reproduce it, but the symptom says which write went where. The driver now writes only
  into the editor inside the target block, reopening it if the focus has moved.
- **The full run again, after Logseq's fix**: 338 s, and compared example by example with the runs
  alone, identical for eight of the nine apps with a report alone to compare (Logseq's `MoveUp8`
  agreed, and so did the rest of Logseq; Dynalist's `CursorDown4` didn't flip this time). Obsidian in
  Source mode had one error, `shift-enter.md › ShiftEnter5`: "Resulting promise was garbage
  collected", 11 ms into loading, as Live Preview had once before. Not the connection: Playwright
  says so when Chromium answers "Promise was collected", and V8's inspector holds the promise of an
  evaluated function only weakly, so a function waiting on a promise that will never settle is
  collected instead of hanging. One of Obsidian's own calls in loading a note (`vault.create`, or
  `openFile`) gave a promise that never settled: twice in about 2,400 loads, and not reproduced on
  purpose. The runner now runs such an example once more, from a fresh document, and says so
  (`again …`); its verdict is the second run's.
- **Flakes, checked against a committed run**: a second full run of the ten apps, compared example by
  example with the one committed before it, gave the same verdicts for every app; the one change was
  Obsidian's `ShiftEnter5`, the never-settling load of the run before (an error there), a
  disagreement again, as in every other run. `git diff` of the reports showed that and `elapsed_s`.
- **The `block` model**: the model of the apps of blocks is `block`, not `outline` (`Driver.model`
  is `'block' | 'text'`; the reports' frontmatter and intro say so): "outline" was what both kinds
  hold, a text editor's documents being outlines too. The module and its type keep their names
  (`outline.ts`, `Outline`: an outline of blocks).
- **Shares to two significant digits** in the reports' totals (`43%`, `2.6%`, `0%`).
- **Each app's stack** in its README (`## Stack`): what it is built with and how it runs, from its
  source where it is open (Logseq OG: ClojureScript, Rum, DataScript, Electron; SilverBullet: a Rust
  server, a Preact and CodeMirror client, plugs in workers; Tine: Tauri, a Rust core, SolidJS, its
  parser in WASM) and from what its bundles show where it isn't (WorkFlowy: React, jQuery, Immer;
  Roam: ClojureScript, DataScript, Firebase; Dynalist: a bundle of its own, jQuery; Obsidian:
  Electron, CodeMirror 6).
- **Obsidian's parsers, researched**: its editor's Markdown is its own fork of HyperMD's CodeMirror 5
  mode, wrapped as a CodeMirror 6 language (`StreamLanguage.define(CodeMirror.getMode({}, { name:
  "hypermd" }))` in the note editor's extensions), not CodeMirror 6's Lezer parser, nor names left
  over from an old library (the user's question): shown by the bundle's calls and by the running
  editor's syntax tree. Reading view and the metadata cache are remark-parse (`{ breaks: true,
  commonmark: true }`, its tree through `mdast-util-to-hast` to HTML); the commands go by the line. Twelve
  cases set the editor's parse beside reading view's, and five the commands' beside both (§12.8,
  `obsidian/stack.md`).
- **Obsidian's stack, checked twice**: my own reading of the bundle and an agent's, from a fresh
  context and skeptical of the first, reconciled. The second corrected four things: Obsidian's Vim is
  CodeMirror 5's `vim.js` ported to CodeMirror 6 (`lib/codemirror/vim.js`, "modified from
  nightwing/cm6-vim-mode-experiment", run on an adapter over the CodeMirror 6 view), not a CodeMirror
  5 editor's; the metadata cache parses in a
  worker of its own (`worker.js`), not in the parse reading view uses (same code and options,
  separate parses, and reading view's in a worker too for a long note); Live Preview's widgets
  (callouts, tables, math) are drawn by reading view's pipeline, not from the editor's tree; and the
  list of what ships was missing DOMPurify, d3-force (the graph's layout), a YAML parser and
  scrypt-js, and had Defuddle, which nothing uses, for clipping. It confirmed the rest: the editor is
  CodeMirror 6, its Markdown the `hypermd` mode through `StreamLanguage` (no `@lezer/markdown` in any
  bundle), reading view remark, plugins loaded with the app's own CodeMirror 6 packages. Both the
  bundle (`.sxs/probe/verify/`, now `.sxsold/probe/verify/`) and the running app were the evidence.
- **A cold run** of every app (`.sxs/` moved away: no cache, no profiles, no Obsidian): Obsidian, its
  installer and plugins downloaded again, and nine apps gave the committed verdicts example for
  example; SilverBullet died in `open`. Its service worker passes every request to the server until a
  first full sync, and the first test page's write got the proxy's 503 (`Offline`); no run had started
  without a synced profile. `open` waits for the sync now (§9), and a second run, SilverBullet cold
  again, gave the committed verdicts for all ten, and the same `sxs.md` (338 s). WorkFlowy's build was
  new (4.3.2610131317), its verdicts the same.
- **Obsidian's parsers, pinned** (`sxs/obsidian/stack.md`, "Stack" and "Two parsers", rewritten
  to open with the answer, and moved out of its README with "Internals"; the README keeps a
  summary): the editor's is `hypermd`, Obsidian's fork of HyperMD 0.3.x's CodeMirror 5 mode on CodeMirror 5.64.0's `markdown` mode, a highlighter's tokenizer; reading view's is
  remark-parse 8.0.2/8.0.3 (its defaults, block tokenizers and list rule are 8's), called without
  unified, `breaks` its own. Neither is CommonMark (remark-parse 8 alone: 444 of 652, 59 of 74 on
  lists). The Stack's libraries now have the versions their files state (MathJax 4.1.3, Mermaid
  11.13.0, pdf.js 5.3.34, DOMPurify 3.0.1, eemeli/yaml 2.x, …). Not pinned: which HyperMD 0.3.x, the
  CodeMirror 6 packages' versions (`@codemirror/language` ≥ 6.11.0), i18next's and d3-force's. The
  1.14.4 the cold run downloaded is byte for byte the one checked before. The scripts (the CommonMark
  comparison among them) were in `.sxs/probe/obs/`, now `.sxsold2/probe/obs/`, outside the checkout's
  record.
- **`sxs/` at the top of the checkout**, moved from `test/sxs/`: it isn't a test of ourus but a
  measurement of other apps. Its imports of `src/` and of the spec's helpers (`test/drawing.ts`,
  `test/specfile.ts`) and the reports' links to `spec/` are a level shallower; `tsconfig.json`
  includes `sxs/`, `npm test` runs `sxs/*.test.ts`, `npm run sxs` is `node sxs/run.ts`; the state
  stays in `.sxs/`. A full run from there gave the reports as rewritten in place, `elapsed_s` aside.
- **The table's rows, shorter** (`sxs.md`): a spec file's row is its name in bold, no link, so it
  stands apart from the examples; an example is its own name, without its sections' (`Gaps travel
  with the…`, not `moveSubtreeUp, moveSubtreeDown (…) › Gaps travel with their nodes`), at most 20
  characters and `…`, linking to it in the spec, its full name, sections and all, the link's title (a
  tooltip); a second column, `agree`, counts the apps that agree on each. Eight pairs of names in a
  file come out the same (`quotes.md`, `obsidian-true-outliner.md`): the spec's names are to be made
  short and unique. The summary has each app's `model` (`block`, `text`) after its name.
- **`run.ts all --table`** writes the table from the verdicts each app's last run left in
  `.sxs/runs/`, running nothing (§20.6, 2): it wrote the table above from the cold run's verdicts.
- **A cold run from `sxs/`** (`.sxs/` moved to `.sxsold2`): every app, 362 s, zero errors; its 4,580
  verdicts (ten apps, 458 examples) are those of the run committed before (`.sxsold/runs/`) and of
  this session's second run (its `sxs.md`), every one. The versions are the same but WorkFlowy's
  build; the cache it filled has the same requests per host as `.sxsold2`'s, and, of the code
  the apps load, three responses changed since `.sxsold`: WorkFlowy's two pages (same size, a new
  build) and SilverBullet's boot page (5,955 to 6,322 bytes, its version unchanged). The Obsidian
  setups took about 25 s longer cold (the download and a first start).
- **Typora, looked at and skipped** (§19): desktop only, no web demo; its EULA limits the trial to 15
  days of evaluation and forbids reverse engineering and modification, so neither a driver built from
  its bundle nor a trial restarted per run. Nothing was downloaded but its web pages.
- **Adapted differences in brackets** in `sxs.md`'s table: `(✗)` (and `(caret)`, `(space)`), a
  difference in an example an app ran adapted (§5), which compares blocks, not the spec's buffers,
  what was adapted its tooltip (`<span title="adapted: heading">`); an adapted agreement is a plain ✓, and the text editors' examples are never adapted.
  `run.ts all --table` leaves out an app with no verdicts in `.sxs/runs/` (SiYuan, until its first
  full run with the others).
- **SiYuan** (§14): open source and without a demo, so its release (3.8.6, arm64) runs here, its
  kernel served on 127.0.0.1 by a new driver hook, `serve`, and stopped by `--stop` (servers recorded
  in `.sxs/servers/`). A document per test through the API, opened through a plugin of the driver's
  own (the plugin API's `openTab`), read from the editor's DOM. First full run 157 agree with 25
  errors; seven kinds of start it won't hold made skips; a block outside every list read with
  ourus's ownership rules (not `¶`, a mark of the driver's, which turned an agreement into a
  difference: Shift+Tab at the top level, `outdent.md › DirectOutdent2`); `deleteSubtree` left with
  no key once Escape was seen to select an item's paragraph, not the item. Last: 163 agree (60
  original), 0 errors, 172 skipped, 292 s. The note's sections from §14 on moved down one.
- **Emacs with markdown-mode** (§15): the first app that is no page. `Driver.launch` may give a
  `session` (keys, typing, the clipboard) that the runner plays it through, in place of a page's
  keyboard and Clipboard API (`run.ts`'s actor, one interface for both); `emacs-nox` installed with
  apt, markdown-mode 2.8 fetched and checked. Emacs ran first as a daemon, then on a terminal of
  tmux's, once Up and Down were seen to need a display. The whole spec in 3 s: 75 agree, 0 errors, 53
  skipped; no example varied over three runs. The note's sections from §15 on moved down one.
- **`tools/` is `src/parser/tools/`**: `gen-entities.ts` and `spec-fixtures.ts`, the parser's scripts,
  beside what they generate; `src/parser/README.md` says what they are.
- **Obsidian with Unified Outliner** (dropped since, §19), a fifth setup of the Obsidian driver: the plugin binds no
  keys, so the vault does (`hotkeys`), and Obsidian keeps its own. 108 agree, 0 errors, 55 skipped;
  its moves by subtree do best of the setups, and its indent writes four columns where the list has
  tabs (`TAB_WIDTH = 4`). §12.7 and §12.7 moved down one, the side-by-side table has a column for it.
- **BlockNote** (§16), in its site's minimal example (its demo is a collaborative room, and isn't
  driven): the editor found through React, loaded through its API, the history emptied by a new
  ProseMirror state, its Sentry reports answered by the proxy. 131 agree, 0 errors, 159 skipped, the
  whole spec in 36 s. A paragraph reads as its text, the `¶` mark weighed and measured. The note's
  sections from §16 on moved down one.
- **Tana, tried and dropped** (§19): its document editor is Tiptap 3 on ProseMirror, bound to a Loro
  CRDT. A driver ran the whole spec (116 agree, no errors, 168 skipped, the same over two runs), and
  is not kept: Tana has no live demo without an account. One finding applies to any ProseMirror
  editor: a caret going to the document's start within 200 ms of the editor's focus is put back
  (ProseMirror takes it for the browser's reset on focusing), so a driver that focuses the editor as
  it loads a test dates the focus back (`view.input.lastFocus = 0`), or Home and Left at the start do
  nothing.
- **A heatmap in `sxs.md`'s summary**: for each two apps, how often they got the same verdict (both
  agree with ourus, both disagree, ...), in percent of the examples both ran, each cell colored by
  it, in an SVG beside it (`sxs-heatmap.svg`: GitHub keeps no colors in a table's cells), on a
  transparent ground, its labels read on a light page and a dark one. Logseq and obsidian, the two
  most unlike, are its ends (`POLES` in `run.ts`); the other apps sit between them, the more like logseq the nearer its
  end. It shows two groups, the block apps and the text editors. Most of the text editors' matches
  are both disagreeing, though, which needn't be the same outcome (§18).
- **true-outliner on its own cases** (§12.6): its 34 differences on `obsidian-true-outliner.md`
  checked one by one for a bug of the driver's, against the plugin's source, its spec and its e2e
  cases; none was. Probed by hand: its Tab under `-  parent` writes a tab, its `indent-node` command
  three spaces (§12.2).
- **`sxs/lib/`**: what the runner and the drivers share (`plan.ts`, `outline.ts`, `text.ts`,
  `idle.ts`, `browser.ts`, `driver.ts`, and `desktop.ts`: the Obsidian driver's free port, Xvfb and
  run lock, taken out for any desktop app's driver), with `outline.test.ts`; `run.ts` and
  `proxy.ts`, the commands, stay at the top; `obsidian.test.ts` went beside what it tests, in
  `obsidian/`. The same tests and verdicts after (Logseq's and Obsidian's `indent.md` rerun).
- **`sxs.md`'s examples, a header per spec file**: one HTML table, so that its columns line up; per
  spec file a row with its name, a row of `agree` and the apps, in bold, its examples, and a row,
  `total`, of each app's agreements there, how many examples it ran there as the tooltip. GitHub
  shades a table's even rows: a file's name starts on an odd one (a blank row before it where it
  takes), so the apps' row is shaded.
- **outl, set aside** (§19): built, driven through WebKitGTK's WebDriver, run once, and not kept for
  now, as too complex.
- **Unified Outliner dropped**: the setup, its section and its column of the plugins' table; what it
  did is in §19, 1. `run.ts` no longer takes `lib/` for an app (its `driver.ts` is the interface).
- **Each run as data, `sxs.json`**: a run of every example now writes `<app>/sxs.json` beside
  `sxs.md`, checked in too: the frontmatter's fields and the counts, every example in the spec's
  order (its file, anchor and line, verdict, the step it is about, adaptations, options, starting
  clipboard and start) and each step's actions, verdict and the states, ourus's and the app's,
  drawn as spec buffers in the app's model (a text app's projected onto blocks too, as `blocks`;
  the spec's own drawing as `written` where it differs), then every skip with its reason
  (`AppRun` in `run.ts`). `--json` writes the same, for any selection; it had the verdicts and
  each step's raw state (`Did`), which this replaces. Each step's verdict is the one `runPlan`
  ranks (`stepVerdict`, shared). About 230 to 285 KB an app.
- **A cold rerun, 2026-10-14**, `.sxs/` moved away: every app the same verdict on every example as
  the runs before, and `sxs.md` the same; the reports differ only in elapsed times and WorkFlowy's
  version (a new build, 4.3.2610140850). `emacs-nox` had gone from the machine and was installed
  again (Debian's 30.2, as before). A trial run with `OURUS_SXS_DIR` under a long scratch path
  couldn't start Emacs's server: its socket is under the cache directory, and a socket's path has
  a limit (`emacs-markdown/README.md`).
