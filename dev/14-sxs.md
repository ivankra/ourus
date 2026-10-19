# Side-by-side improvements and new apps (2026-10-18)

After [`13-align.md`](13-align.md) found drivers handling clipboards and numbered lists badly, this
session set out to remove what the harness, not the apps, puts into the SxS results. On the way it
brought every setup into running (17, three more) and rebuilt how the harness runs; then it went through
every app's verdicts one by one, and last added an eighteenth, Logseq's database version.

- **New setups** (§3 to §8): RemNote and Tana, skipped by [`10-sxs.md`](10-sxs.md) §19 for their logins,
  need none. RemNote, with bullets and without, runs in its guest mode, in the mode of its own
  Playwright tests; Tana Outliner (app.tana.inc; home.tana.inc, which the earlier sessions drove, is
  Tana's meeting product) in its UI-test mode at `/tests`. Athens, archived, through a patch of its
  bundle.
- **The harness** (§9 to §13, §15): the proxy's cache modes; noise fixed in the projection, the
  clipboard, the typing pace and the runner; undo timed as a user's; pools of browsers, Obsidians and
  SiYuan kernels, fixed in size under the container's cap on tasks, with workers, every app at once
  (all 16 in 324 s); a review of the whole diff.
- **The apps one by one** (§14 to §20): every setup's disagreements, then its caret and whitespace
  verdicts, then its skips, read against the app's source or bundle and played by hand, asking each
  time whether it is what the app does for a user or what our driver, adapter or runner did. Noise found
  and fixed in nearly every driver, bugs in eight apps; 319 more examples run, every error gone.
- **Logseq DB** (§21): Logseq's database version on its test channel, on the file-based app's driver,
  made one driver for both (`logseqDriver`), a flavor deciding how a block's text is held; OG's results
  the same to the output after it.

What each app does, for good, is in its README (`sxs/<app>/README.md`); this note keeps the story, the
harness's changes, what is open (§23) and how to go on (§24, §26).

The first part:

| | before | after |
| --- | ---: | ---: |
| SxS setups | 14 | 17, all running (RemNote twice, with and without bullets; Athens, Tana among them); 18 with Logseq DB (§21) |
| 7 block apps: disagree / error | 479 / 8 | 469 / 6 |
| examples every block app disagreed on for the harness | 2 | 0 |
| a run of every app: browsers / tasks (cap 2048) | 16 / failed at the cap | 6 Chromiums × 3 windows, 3 Obsidians / at most 1,998 |
| a run of every app: time | (failed) | 324 s, all 16 at once; 640 s for 17 with the undo pause |
| a run of every app, against 13-align's: verdicts changed | | the last: 12 of 7,165, 9 of them undo examples timed as a user's (repeatable), Tine's Paste16, Obsidian's Scenario14, Dynalist's Scenario19 (a popup left open, §16); earlier 5, after the clipboard fix, 16 with Logseq's 7 plain pastes |
| an app's run with 4 workers: Tana / RemNote / SilverBullet / WorkFlowy | 201 / 782 / 794 / 460 s | 59 / 201 / 229 / 104 s |
| SiYuan (a kernel per worker) / an Obsidian setup (3 workers on a shared pool) | 816 / some 300 s | 106 / 142 to 274 s |
| `npm test`: pass | 932 | 936, then 944 after the deep dive |
| `npm test`: todo | 1 | 1 |

The deep dive, per setup: agree / caret / whitespace / disagree / error / skipped, of 787 examples, at
its start (the first part's last full rerun, as `.sxs/results/` stood between the two parts) and at its
end (the last full rerun, §19):

| setup | start | end |
| --- | --- | --- |
| Logseq | **274** / 19 / 21 / **29** / 0 / 444 | **275** / 20 / 21 / **26** / 0 / 445 |
| Tine | **251** / 16 / 37 / **37** / 0 / 446 | **255** / 16 / 38 / **31** / 0 / 447 |
| Roam | **208** / 25 / 30 / **31** / 0 / 493 | **212** / 29 / 30 / **35** / 0 / 481 |
| Athens | **159** / 40 / 35 / **51** / 0 / 502 | **160** / 46 / 35 / **37** / 0 / 509 |
| RemNote, bullets (RB) | **212** / 24 / 26 / **80** / 0 / 445 | **216** / 21 / 25 / **71** / 0 / 454 |
| RemNote, no bullets (RN) | **211** / 22 / 28 / **140** / 0 / 386 | **214** / 18 / 30 / **137** / 0 / 388 |
| Dynalist | **235** / 5 / 31 / **77** / 0 / 439 | **253** / 11 / 33 / **106** / 0 / 384 |
| WorkFlowy | **196** / 10 / 13 / **77** / 0 / 491 | **222** / 10 / 13 / **113** / 0 / 429 |
| Tana | **170** / 15 / 13 / **100** / 0 / 489 | **199** / 16 / 14 / **112** / 0 / 446 |
| SiYuan | **220** / 8 / 38 / **85** / 6 / 430 | **243** / 12 / 23 / **171** / 0 / 338 |
| BlockNote | **177** / 7 / 42 / **128** / 2 / 431 | **199** / 7 / 48 / **185** / 0 / 348 |
| Obsidian, Source mode | **137** / 18 / 33 / **463** / 0 / 136 | **144** / 18 / 33 / **457** / 0 / 135 |
| Obsidian, Live Preview | **136** / 18 / 33 / **456** / 4 / 140 | **144** / 17 / 33 / **450** / 0 / 143 |
| Obsidian with Outliner | **191** / 16 / 26 / **385** / 4 / 165 | **193** / 16 / 28 / **382** / 0 / 168 |
| Obsidian with true-outliner | **193** / 65 / 21 / **364** / 4 / 140 | **192** / 64 / 27 / **361** / 0 / 143 |
| SilverBullet | **161** / 32 / 26 / **441** / 0 / 127 | the same |
| Emacs with markdown-mode | **104** / 41 / 22 / **511** / 0 / 109 | the same |
| **all** | **3,235** / 381 / 475 / **3,455** / 20 / 5,813 | **3,386** / 394 / 479 / **3,626** / 0 / 5,494 |

319 more examples run, every error gone. Disagreements rose by 171, nearly all examples that ran for the
first time (the skips the harness lacked a step for, §17) and false agreements the harness had made
(§16); the disagreements that were the harness's are gone. Bugs found in the apps, each played by hand:
Logseq (a paste into a numbered block drops its number), Tine (a join reorders children), Athens
(Backspace at a page's first block loses its text), Dynalist (a caret misplaced after an HTML paste),
WorkFlowy (two invisible line breaks stored), SiYuan (a plain paste makes a task; an escape left
behind), BlockNote (Shift+Enter keeps a selection), Obsidian's Outliner (a code block torn by a move;
the caret off after renumbering). Logseq DB, added after (§21), not in the table: **267** / 12 / 19 /
**37** / 0 / 452.

## Contents

1. [The task](#1-the-task)
2. [How it went](#2-how-it-went)
3. [RemNote, without a login](#3-remnote-without-a-login)
4. [RemNote's test mode](#4-remnotes-test-mode)
5. [The RemNote driver and its results](#5-the-remnote-driver-and-its-results)
6. [Documents with and without bullets](#6-documents-with-and-without-bullets)
7. [Athens](#7-athens)
8. [Tana Outliner, without a login](#8-tana-outliner-without-a-login)
9. [The proxy](#9-the-proxy)
10. [Noise in the harness](#10-noise-in-the-harness)
11. [A pool of browsers](#11-a-pool-of-browsers)
12. [App ids](#12-app-ids)
13. [The review](#13-the-review)
14. [The deep dive's method](#14-the-deep-dives-method)
15. [The harness, continued](#15-the-harness-continued)
16. [The apps one by one](#16-the-apps-one-by-one)
17. [Skips](#17-skips)
18. [Caret and whitespace verdicts](#18-caret-and-whitespace-verdicts)
19. [The deep dive's full reruns, and how they were checked](#19-the-deep-dives-full-reruns-and-how-they-were-checked)
20. [Probing](#20-probing)
21. [Logseq DB](#21-logseq-db)
22. [Wrong turns](#22-wrong-turns)
23. [Still open](#23-still-open)
24. [Next steps](#24-next-steps)
25. [Insights](#25-insights)
26. [Handover](#26-handover)

## 1. The task

From the user, cleaned up, in the order asked:

1. The SxS again: the last sessions found bugs in its drivers (the clipboard, numbered lists); go deep
   into the drivers, the adapters and the runner, so that what they add doesn't hide the apps' real
   behavior.
2. First, Tana and RemNote, skipped for their logins: a driver detects a login wall and stops, asking
   for a cookie in an environment variable; given one, the pages go into the cache, so later runs rarely
   need it. RemNote first, from a browser's "Copy as cURL" of a signed-in page; and its two kinds of
   document, bulleted and free form.
3. Better, one of RemNote's local-only knowledge bases, which never sync; better still, no cookies,
   through RemNote's own Playwright hooks rather than anything clunky of ours.
4. RemNote's README: every outliner shortcut, not only the ones the driver plays, for commands ourus
   may get.
5. The proxy: a table at startup of each app's editor, to open in a browser through it, and how to
   start Chromium so; `--cache=<mode>` for `--offline` and `--refresh`, offline writing nothing so it
   runs off a read-only cache (and stopping without the certificate an online run makes); an npm
   script (`npm run sxs:proxy`, offline); listening beyond the loopback, for a container; the greeting
   in the user's layout, with no titles and only apps a browser opens.
6. `sxs/lib/outline.ts` renamed `block.ts`, after `model: 'block'`.
7. A regeneration of the reports changes no `elapsed_s`.
8. The whole diff reviewed; this note.
9. Athens, archived but another data point; its save delay fixed in its bundle rather than waited for.
10. A report's `url:` the page to open in the proxied browser; one version for Obsidian, not two; a text
    app's summary without its label column (one row).
11. Athens's skips: why so many, and whether an internal API could play its moves (its source cloned).
12. This note, with what the next session needs: Tana there, then the deep dive.

*Later*, continuing:

13. Tana, from the code already written: one more look, in headless Chromium, not curl, for an editor
    served without a login before asking for cookies. Then: "conclusion, do we really need to log in?"
14. Clipboard and paste, numbered lists: the past's pain points, investigated properly; Tana's paste
    paths in its README.
15. The disagreements in the reports: what is the harness's, the adapter's or the driver's noise, and
    what the apps do.
16. A report's version: the build's id alone (`f6ae813f25`, not `web f6ae813f25`).
17. `sxs.md`: an id column in the summary, two capitals each app's driver declares (`LS` Logseq, `RR`
    Roam Research, `AR` Athens Research, ...); the tables below headed by the ids, linking each app's
    report; the heatmap's top labels the ids, right-aligned as its numbers, `US` for ourus. Review the
    set.
18. Code fences of more than three backticks.
19. Tana: why so many skips.
20. A run of every app failed: what limit, why so many Chromium processes, can flags make a browser
    lighter. Then a pool of browsers shared by all apps instead of one per app, with locks per browser
    (the clipboard, an app), a window per app; verified first, an app's own run parallelized later.
    Windows against tabs, measured. This note brought up to date.
21. An app's spec run split across the pool, for speed: designed with care; drivers refactored rather
    than workers as processes (the user: "refactoring drivers is fine!"). The first design's profiles
    (`.sxs/<app>/chromium/`) and logs deleted. SiYuan, later: a kernel per worker
    (`.sxs/siyuan/<n>/`, as the pool's). Emacs needs no workers: it is fast.
22. WorkFlowy's 500 ms save: made faster in the page? (1 ms, not 0.) Then: noted here, done later, and
    likely needed only before an undo.
23. SiYuan's kernel per worker, done (§11); RemNote's cache: 393 files, copies? (No: one deploy's
    code-split chunks, never committed before.)
24. Obsidian reconsidered: one process runs many vaults, so share N Obsidians among every setup, as
    Chromium is shared; a clipboard lock per instance, as Chromium's. Restricted mode stays off (the
    plugins are what's tested). Then 4 workers a setup, not 2.
25. Obsidian's READMEs: a second table, "Other shortcuts:", of the shortcuts useful to us that ourus
    doesn't implement.
26. Chromium's pool from 4 browsers to 6, a fixed cap ("chromium pool must have a fixed cap"; it had
    none: 4 was the runs a browser takes); later 8. Then fewer flags.
27. A full rerun, watching CPU and tasks; the run of all's worker cap ("wtf is that crap"): something
    simple, the pools the one knob, all of them used; no scheduling by watching tasks. Agreed: six
    Chromiums with three windows each, three Obsidians; the run stopped for it. Then the full rerun on
    it, monitored; this note brought up to date.
28. Each app's run data into a results directory (`<file>.json`, `sxs.md`, `sxs.json`): first
    `.sxs/<app>/results/`, then `.sxs/results/<app>/`, the table and its heatmap there too; the pool
    down to five Chromiums. Another full rerun, `.sxs/` cleaned.
29. The plain pastes' diffs, investigated (another run's end took the clipboard's permission: fixed);
    no more `ms` in the run data (a diff of every file at every run); another full rerun.
30. RemNote's code fences, as Tana's; then the undo timing ("logseq is buggy af, dig into code"):
    Logseq OG's source read, the pause made a wait for the app's put-off saves.
31. RemNote's documents without bullets, investigated ("can they do free form markdown or very
    limited?"), then a second setup, `remnote-nbl` (ids RE and RN, the user's); then swapped: `remnote`
    (RN) hides its bullets, `remnote-bl` (RB) keeps them. Why so many skips (§6).
32. Quotes: does RemNote support them? Tested (a style, not a container); then a spec tag,
    `quote-container`, for the cases that treat a quote as one (handling them: later).
33. Pids and the like out of `.sxs/`, which the user cleans ("all the data goes still into .sxs but
    pid and similar to run or something"): `lib/records.ts`, a runtime directory
    (`/run/ourus-sxs/<id>/`) laid out as `.sxs/` is, for pids, ports, locks, flags and `last-run`; a
    browser's port and pid recorded as it starts, so a profile deleted under it is still reached and
    stopped (tested: `.sxs/chromium/` deleted under two browsers, `--stop` stopped both).
34. A partial run's data in `.partial` files: a run of some of a file's examples writes
    `<file>.partial.json`, a run with selectors or `--strict` `sxs.partial.{md,json}` (a run of
    several apps, `sxs.partial.md` for its table); the full run's files are left as they were, and
    reports and regenerating read those only. Then a full rerun.

*Then, the deep dive*, across its sessions:

35. Read the last writeups; continue the work on drivers, adapters and the runner, fixing what puts
    noise into the SxS and hides the apps' behavior. Take an app, its log and its disagreements, check
    the buffers in its report (reasonable or weird, the app's or our setup's), launch it headless and
    investigate; use the proxy's cache; clone what is open source.
36. Draw a numbered block as the apps show it, `1. a`, safely for every other app ("guard it by an
    option").
37. "Other shortcuts:" in each app's README: the outliner keys ourus doesn't implement, measured. Keys
    first in each README; a Stack section in each.
38. The skips: "are these all real? check by hand some skipped cases, that you really can't get them to
    work rather than we're missing some steps in the harness"; then the caret and whitespace verdicts.
39. Compare apps where it says something: Tine with Logseq (nearly its clone), RemNote's two setups, each
    Obsidian plugin with bare Obsidian.
40. The pools against the container's cap on tasks: RemNote's setups apart, six Chromiums, Obsidians
    fewer beside them, windows closed and Obsidians stopped when done.
41. Placeholders: RemNote's and SiYuan's invisible characters, against ourus's.
42. Full reruns, the table and heatmap regenerated, the results verified against the ones before.
43. A note per session, merged into one, then into this one as its second part ("15-sxs is the second
    part of it basically"); what each app does moved into its README.

*Last*:

44. The READMEs' Keys tables: one ourus action a row ("break up crap like that into separate rows!!!"),
    no caret motions or document ends ("i dont care, you can drop those"), an action with no key a row
    of its own, `*missing*`, not a paragraph; the "Last results" link out of each README's lead; Logseq
    OG's patch note out of its lead into the section about undo.
45. A new app: Logseq's database version, LD, `sxs/logseq-db/`, on https://test.logseq.com/; "most of
    driver code could be shared", the bulk of the difference "on the backend side"; Logseq OG's id
    from LS to LO. The shared driver's types named for what they are ("wtf are these names! more
    descriptive plz!").
46. Fences other than ```: why not (measured), and a comment pointing to Logseq's code.
47. `run.ts`: every app when none is given (`npm run sxs -- --regenerate-report` failed for want of
    one); `--regenerate-report` renamed `--report`.
48. Logseq DB's README: only the shortcuts new or changed against OG's; no counts that go out of date
    ("i can always use sxs table to look it up").
49. Logseq DB in this note ("we'll squash").
50. Logseq DB's logical outdenting: "keep investigating this, you sure this got broken??"; read in the
    worker's own source.
51. "keep investigating logseq db": its examples that varied from run to run.
52. Its next steps: its declarations measured (`--ignore-options`), OG's caret verdicts it agrees on
    read; the clipboard's policy "for another day".
53. A full rerun of every app, with tests; this note brought up to date last.

## 2. How it went

The first part, each in its section:

- **RemNote** (§3 to §6): no login needed, its guest mode the full app; the driver in RemNote's own
  Playwright test mode, a test a document made as their fixtures make one, keys from its shortcut table.
  198 agree at first, 207 with two behaviors declared, 213 once the review fixed its emulated document
  start (§13): the most of any app then but Logseq, Tine, Dynalist and SiYuan (216 at the end, RB since:
  §16). Every original disagreement checked for the driver's hand. Documents without bullets found in
  its code, then driven as a setup of their own (RN).
- **Athens** (§7): archived, its web build still running; its graph reached through a patch of its
  bundle, which also takes out a two-second save delay that read as lost text. No key moves a block, so
  the moves stay skipped; deleting with children, a selection and Backspace, is played.
- **Tana** (§8): the login mechanism built for home.tana.inc (`lib/login.ts`, `Driver.login`: the driver
  finds the wall and stops with exit code 3 and what to do), which turned out to be Tana's meeting
  product. The outliner, app.tana.inc, has a UI-test route, `/tests`, with a hook that loads a test's
  workspace (`window.bootTest`) and the app's model on `window`: the driver written anew for it, 161
  agree at first, 170 after its noise was found and code blocks and numbered lists mapped (199 at the
  end: §16). Its paste read in its code: a clipboard is classified first, and the format the runner
  gives decides the path.
- **The proxy** (§9): cache modes, a read-only offline mode, `--host`, the greeting, `npm run sxs:proxy`.
- **Reports**: `url:` the page to open in the proxied browser, as the proxy prints it (a driver's `url`;
  `scope`, new, the prefix a reused tab must be under, RemNote's alone); one version for Obsidian (its
  installer named only where it isn't the app's); no label column in a text app's summary; app ids (§12).
- **The harness's noise** (§10): a projection bug that made two examples disagree in every block app;
  a regex six drivers shared; apps without verdicts drawn as a column of `?`; regenerated reports taking
  a run's time; a save later than settling waits (Athens's); traffic tallied for the wrong app; the
  typing pace, which sat on Tana's undo window; the clipboard's HTML read otherwise than ourus reads its
  Markdown (Paste66); a crashed browser recorded as an app's 347 errors; emulations that ended in a
  document's title (RemNote's, Tana's: §8, §13); the examples every block app disagreed on, each read
  for the harness first; two timing leads (Roam's undo, SiYuan's paste under load), both settled later.
- **The review** (§13) of the whole diff: 15 findings, all real, all fixed; two would have put private
  data into `.sxs/`, a repository of its own (`ivankra/ourus-sxs`).
- **The pools** (§11): a run of every app failed on the container's cap on tasks; a pool of browsers,
  a window per app, ran all 16 at about half the tasks, the verdicts the same but for timing. Then
  workers, one queue, each in a browser of its own, drivers keeping a test's state per page, three to
  four times faster (four apps with 4 workers: one verdict changed of 1,587, a timing one); SiYuan's
  kernels, one per worker (816 s to 106 s); Obsidian's instances shared by every setup, a window each
  (the 4 setups at once in 180 s, no verdict changed of 2,590); the pools as the one knob, fixed in
  size, every app started at once, the budget, its flags and the watching of tasks dropped (five flags
  fewer). On it, all 16 in 324 s,
  at most 1,998 tasks of 2,048; 16 verdicts changed of 7,209, 7 of them Logseq's plain pastes doing
  nothing: another run's end had taken the clipboard's permission, fixed with the clipboard's lock (the
  next full run: 5 changed of 7,165, none a paste of the clipboard's). (Later five Chromiums; in the
  deep dive six again, and four Obsidians, or two beside the Chromiums: §15.4.)
- **Undo timed as a user's** (§10): WorkFlowy's save debounce, patched, turned out to be how it groups
  undo, and was reverted; a pause at an undo example's steps instead, then `drain` for the app's put-off
  saves (Logseq's auto-save, read in its source): two runs of every app on the undo files, no example
  apart.
- **Housekeeping**: no `ms` in the run data (a diff of every file at every run); results in
  `.sxs/results/`, laid out as `sxs/`; records out of `.sxs/` (`/run/ourus-sxs/<id>/`: pids, ports,
  locks); partial runs in `.partial` files; Obsidian's other shortcuts tabled (§11). Then a full rerun of
  all 17 setups: 640 s, the container at most 1,833 tasks, 12 verdicts changed of 7,165.
- **RemNote's documents without bullets** (§6): the first block app to run `free-form` cases, a setup of
  its own (`remnote`, RN; with bullets `remnote-bl`, RB), the model's `Block.free`. Quotes, tested: a
  style on one rem, not a container; a spec tag, `quote-container`, for the 91 cases that need one.

The deep dive:

- **The method** (§14): every verdict but agree read against the app's source or bundle, played by
  hand in a probe, replayed outside the runner, read against the screen, played slowly, and the
  declarations played against their own values (`--ignore-options`).
- **The harness** (§15): numbered blocks drawn as the apps show them, guarded by an option; free form
  for BlockNote and SiYuan; options as blocks, and the `markup-` refusals dropped where a case plays;
  a run that waited for good on a worker that never entered RemNote's test mode; six Chromiums, windows
  closed at a run's end and made at the viewport's size, RemNote's setups in browsers apart, Obsidians
  stopped as their last window closes; one machine per `.sxs/`; the clipboard's formats, a policy left
  open; undo grouped by time.
- **The apps** (§16), each one's noise found and fixed: Logseq's hidden property and undo history,
  Tine's facets, Roam's deleteSubtree key, Athens's paste camps, RemNote's text cache, Dynalist's
  numbering and a popup outliving its test, WorkFlowy's switched-off features, Tana's descriptions,
  SiYuan's empty paragraphs, free form for BlockNote and SiYuan, Obsidian's indentation, tables and
  window focus; SilverBullet and Emacs had none. Bugs found in eight apps, each played by hand.
- **Skips** (§17) and **caret and whitespace verdicts** (§18): each kind checked, the rest the apps'.
- **Full reruns** (§19), verified example by example: 319 more examples run than at the deep dive's
  start, every error gone.

Last:

- **The READMEs' Keys tables**, one ourus action a row, the ones without a key `*missing*`.
- **Logseq DB** (§21): the plugin API and the editor OG's, the storage not: one driver for both, OG's
  results unchanged by it; the DB version's undo history, code and math blocks, editable page title
  and recycle bin met; its logical outdenting found to do nothing in this build, and a paste bug.
- **`run.ts`**: every app when none is given; `--report` for regenerating.
- **Logseq DB's settling** (§21): it waits for the database worker, a focused code block settles, and
  undo's leftover flag reads idle; no settle left unfinished in a run.
- **Both Logseqs' declarations measured** (§21): `backspaceAtTopItem: refuse` added, the rest held; OG's
  nine caret verdicts the DB version agrees on read as OG's own.
- **A full rerun of every app** (§19), all 18 setups at once: two verdicts moved, both the undo wobble.

## 3. RemNote, without a login

The user's curl was of `https://www.remnote.com/w/<user>/<rem>`. Its one cookie was PostHog's
(`ph_phc_…_posthog`), and the page is the same without it: a 16 KB shell of the app (status 404), the
same for anyone. In a browser the app went to `/sign_in` before asking any server: it decides from local
state. Its bundle keeps the session in localStorage, Meteor's way (`userToken`, `user`, `userId`,
`userProfile`, read by `Accounts.user()`), and sends the token as `x-auth-token` to
`backend.remnote.com`. A cookie would have done nothing.

Before asking for a token, the bundle's routes were listed (`route({ path, name })`, a hundred of them)
and the likely ones opened signed out. `/notes` is the app in **guest mode**: the sidebar says "Guest",
documents can be made and typed into, at `/w/null/<id>` (`null`, the guest's knowledge base), kept in
the browser's IndexedDB. `guestMode` is `!currentKnowledgeBaseId()`; a guest's edits are a feature
(`userEditingInGuestMode`, `onLoginFromGuestMode`), not a gap. So the account-free way in is RemNote's
own, and local only: nothing a guest makes syncs, and typing sent nothing to any server. (Accounts have
local-only knowledge bases too, `LOCAL_ONLY`, "offline first".)

## 4. RemNote's test mode

The user asked for RemNote's own Playwright hooks. They are a module of its bundle (the test recorder's,
`test_recorder_track_waits`):

- **The mode**: `Env.app.isPlaywright` is `localStorage.isPlaywright == "true"`, and
  `Env.playwright.isPlaywrightServerless` adds `isPlaywrightServerless`: their tests without a server.
  With both, Sentry is never set up, the recorder's trackers are, and a reload sends RemNote's servers
  nothing (without: Stripe's price config, Sentry, Segment through amboss.com). The driver sets them in
  an init script.
- **Fixtures**: `window.playwrightCreateEmptyParentDeletionFixture` and its kind make rems inside
  `writeGuarantee(name, fn)`: `Rem(kb).createNew()`, `update({ key })`, `setParent(parent, index)`; then
  a flush (`waitUntilFinishedAllWriteGuarantees`, `waitUntilFinishedAllConsumerJobs`,
  `flushToDatabaseStore`); then the editor tree is told and a rem focused (`focusOnChild`). All are page
  globals but the editor trees, a module's, which the driver finds through the bundle's module registry
  by the recorder's own import of it (its factory's source names it), so a new build's ids don't
  matter. `playwrightDeleteDocumentRem` deletes a document; the driver deletes the last test's so, in
  the same write batch as the next test's, with the reason theirs passes.
- **Waits**: `waitForPlaywrightToLoad()` (the trackers up), and `playwrightGetWaitKeyState(key)`, the
  values a recorded test waits for (the route, the focused editor's text, the selected range's length).
  These say what the app shows, not that it has settled; the driver's busy signal is RemNote's count of
  writes in flight (`getNumOngoingWriteGuarantees()`), the idle script the rest.
- **Not used**: the recorder itself (Ctrl+Shift+Alt+T records a session as a test), the other fixtures,
  `setSlowTreeAnimationSpeedForTests` (smooth animations, a user preference, off anyway).

## 5. The RemNote driver and its results

`sxs/remnote/driver.ts`, 302 lines; `sxs/remnote/README.md` has the rest.

- **A block is a rem's text** (`key`, rich text, a formatted run read as its text); line breaks are
  Shift+Enter's. A heading is the rem's font size (H1 to H6), a to-do its status, a numbered item a
  "list item" (a run counts from 1, a plain rem restarting it, children not: checked by loading each
  kind), code a code rem: attributes, so the three `markup-` tags are refused.
- **Reading** is the rem tree, but the rem being edited, whose text is its editor's
  (`currentFocusedRemTextCache`; the model follows within 100 ms). The caret is `getFocusProps()`.
  (Since: the editor's own text, the cache holding less than the editor: §16.)
- **Keys**: RemNote's Linux defaults, from its shortcut table (`{[Sj.Name]: {default, name}}`, `mod`
  Control, `opt` Alt) and the editor tree's handlers: Alt+Up and Down swap, Ctrl+Shift+Alt+Backspace
  deletes a bullet, Ctrl+Shift+V pastes without formatting, Ctrl+Y redoes. No key duplicates. The README
  lists every other outliner shortcut of the table.
- **One tab**: two RemNote tabs in a browser tell each other to refresh after every write, and both
  reload for good through `/database_error`. A probe's leftover tab did it; `open` closes any other.
- **Time**: about 1.6 s a test, 10 to 12 minutes a run, the slowest app: writing and flushing a document
  takes 250 to 330 ms, and its editor tree lays itself out for half a second after (its own 100 and 200
  ms timers). Deleting the last document in the same batch, and placing the caret without waiting for
  that layout, took 1.9 s to 1.6 s, the verdicts the same, example for example.

Results, 2026-10-18, with bullets (RB since, §6): agree 213 (107 original), caret 24, whitespace 26,
disagree 79, error 0, skipped 445 (first 198, then 207 with the behaviors below declared, then 213 with
the document's start emulated right, §13; at the end of the deep dive 216 / 21 / 25 / 71 / 0 / 454:
§16). Declared (`behaves`), each with no setting: **logical outdenting** (and a Tab right after an
outdent puts the rem back where it was, `outdentInOriginalLocation`, not under its previous sibling:
`outdent.md › Outdent13`), and **Enter mid-text in a rem with children** making its first child
(`enterMidItem: child`); the deep dive measured and declared two more (`enterAtTextStart: stay`,
`backspaceAtTopItem: refuse`: §16). The disagreements left, each checked against the driver:

- **Moves stay among siblings**: "Swap" never takes a rem out of its parent (MoveDown7, 9, 10, MoveUp6,
  8, 9).
- **Enter over a selection** splits at its start and keeps the text (E33, S13). Not the load (the
  editor's props set, its selection not): the DOM's and the editor's selections were the loaded range,
  and a range made with Shift+Right gave the same.
- **An empty rem with children** goes, its children taking its place (Backspace17d, Delete5, 5b).
- **The caret leaves the rems** after Backspace on the first, empty, rem (to the title) and after
  "Delete Bullet".
- **Plain paste**: the clipboard's last line break makes an empty rem, as in Dynalist and WorkFlowy.
- **Whitespace**: Enter keeps the space before the split, Shift+Enter the space after the break.

`src/config.ts` names RemNote among each value's apps.

## 6. Documents with and without bullets

The user's "bulleted and free form": a document can hide its bullets (`setDocumentLevelNoBulletMode`,
`hideBulletsInDoc`), a rem too (`setIndividualNoBullet`), and in a document without bullets a rem can be
a bulleted list item again (`bulletedListInNoBulletDocument`): paragraphs with lists among them,
Markdown's free form in a block app, which no app run so far had (BlockNote and SiYuan got it in the
deep dive, §15.1). Its outdent knows it: in a document without bullets, Shift+Tab on a top-level list
item makes it a plain rem, a paragraph, as Markdown would. And RemNote keeps headings as containers by
itself (`maintainHeaderHierarchy`: a rem with a larger heading takes the rems after it as children), as
ourus's outline does.

Then driven, the user's: a second setup, `remnote-nbl` at first, then RemNote's own (`remnote`, RN; the
bulleted one `remnote-bl`, RB, both the user's names), the first block app to run the spec's `free-form`
cases. Read in the bundle and measured by hand first: in a document that hides its bullets, a rem is a
paragraph unless it shows a bullet (`sb`) or a number, and its keys follow free form (Enter on an empty
top-level item, Shift+Tab at the top: a paragraph; `- ` at a paragraph's start: an item; Enter
mid-paragraph: two paragraphs; Backspace between paragraphs: their texts joined, where ourus keeps a line
break). But a rem shows no bullet only as the document's child (`renderAsNoBullet`: its parent's
`hideBulletsInDoc`; hiding a heading's bullets makes the heading a document), so a heading's section and
a paragraph's list, nested under them in ourus's outline, are beside them there, as in Markdown's text:
the driver lifts them on load and nests them again on read (`lift`, `own`; every spec buffer the setup
holds goes there and back as it was, `remnote/remnote.test.ts`). The model learned what a block is:
`Block.free` (a paragraph, a heading, an atom outside every list, drawn `¶`), kept by the projection
where a driver says so (`Driver.freeForm`), compared as the depth is; a blank line next to a free block
is no adaptation. Both setups hold a browser's RemNote window by one name (`Driver.pool`): two RemNote
tabs in a browser break each other. Refused: a paragraph inside an item (21).

Its first full run: 391 examples (RemNote's 332), agree 211, caret 22, whitespace 28, disagree 140, no
error (at the end of the deep dive 214 / 18 / 30 / 137, §16); of the 135 `free-form` cases, 75 ran (21
agree, among them Enter6, an empty last item a paragraph), the rest skipped for other reasons (quotes,
a caret in a marker, heading markup). Of 326 examples both setups ran, 26 came out otherwise, each read
as RemNote's own: Enter on an empty middle item leaves the list (a paragraph), a heading moves without
its section (flat beside it), Tab makes a paragraph an item at its depth. `enterOnEmptyItem` stays the
default: an empty nested item still makes a sibling (Enter30), only a top-level one leaves the list
(Enter7b).

Its skips, the user's question: 386 of 777, by design almost all: quotes and callouts 112 (no block form
for a quote), markup RemNote holds as attributes 101, ourus options it doesn't behave as some 75, a caret
or selection with no place in a block 46, a paragraph inside an item 21. Quotes, tested: RemNote's quote
is the Quote powerup on one rem (`setIsQuote`; `> ` and a space at an empty rem's start makes one), a
style, not a container: Enter at its end makes a plain rem, Backspace at its start joins it to the rem
above, Tab after it makes an item, and a quote's or a callout's (`setIsCallout`) child is drawn under it,
outside it (a screenshot). ourus's quote is a container, its blocks its children, and so are most of the
cases: a new spec tag, `quote-container` (spec/README.md), marks the 91 where a quote holds more than one
paragraph or a callout a body, in some buffer; the rest, quotes of one paragraph all through, could map
to RemNote's quote rems (later, the user's: still open, §23).

## 7. Athens

Athens (https://athensresearch.github.io/athens/), an outliner of Roam's kind, open source, in
ClojureScript on re-frame and DataScript, archived in 2022. Its last web build still runs on GitHub Pages
for anyone, its graph in the page and saved nowhere: a reload starts again from today's daily page.
`sxs/athens/`.

- **No API, no names.** The bundle is 4.2 MB of ClojureScript, every name shortened; its graph is not on
  `window`, its storage holds settings only. Exported: DataScript's `Datom` and `Entity` (for printing),
  `Entity` keeping its JavaScript map interface (`get`, `key_set`).
- **A patch names what the driver needs** (`athens/proxy.ts`), each found by Athens's own code around
  it: the connection (`var a=<conn>;`, starting the graph's health check), `transact!` and `deref` (its
  transaction wrapper, by its tracing span `ds/transact!-wrap-span`), transit's `read` and `reader` (how
  it reads its settings: ClojureScript data from JSON, so a test's transaction is written as transit),
  and `Volatile` (by its constructor; an `Entity` holds two). A test is a page transacted in one go,
  read back through `Entity`; the caret is a click and the textarea's selection.
- **A save two seconds late.** `placeholders.md › Placeholder6` typed `x` into a new block, left it, and
  read it empty: Athens stores a block's text two seconds after its last change (its block editor's idle
  save, `(debounce #(save :idle) 2000)`), and a block the caret has left is read from the store, while
  settling counted no timer longer than 300 ms. Counting timers up to 2.1 s fixed three verdicts
  (Placeholder6, Scenario11, Undo5), at two seconds more for every test that edits text; on the user's
  suggestion, the patch makes the 2000 a 0 instead: the same verdicts, all 276, in 156 s instead of 334.
- **Noise off at the source**: Sentry got a trace per transaction (448 in 70 tests, blocked by the
  proxy) until the driver set Athens's own opt-out (`localStorage.sentry = "off"`). Page ids are counted
  in the page, which outlives a run: counted in the runner, a second process reused an id still in the
  graph.
- **Keys** from Athens's help page and its source (cloned: `textarea_keydown.cljs`, `listeners.cljs`).
  Deleting a block with its children is a selection and Backspace (Shift+Up on its first line selects
  it), played so. Nothing moves a block but a drag, whose drop is where the block goes, the very thing a
  move is tested for: played, it would test the drop chosen, so the 92 move tests stay skipped, and the
  6 duplicating (no command). Headings and tasks are text in a block's string (`## `, Roam's
  `{{[[TODO]]}}`), so the three `markup-` tags are refused; no blocks are numbered.
- **Declared**, as in Roam: logical outdenting, Enter on an empty nested block outdenting, an empty
  block with children not joined. Paste places what it pastes after the block, splitting nothing: a camp
  to measure, not declared (measured and declared in the deep dive, four paste camps: §16).

Results, 2026-10-18 (Athens's bundle of 2022-05-18): agree 159 (77 original), caret 40, whitespace 35,
disagree 51, error 0, skipped 502 (first, before the save and the declarations: 152, 30, 35, 66; the
deletes played since are all the right blocks, the caret left nowhere, as in RemNote; at the end of the
deep dive 160 / 46 / 35 / 37 / 0 / 509: §16). In the table it comes after BlockNote; it skips the most
of the block apps, for the keys it hasn't.

## 8. Tana Outliner, without a login

`sxs/tana/`; its README has the rest.

**Two products.** The earlier sessions' Tana (10-sxs §19's driver, the login wall above) was
home.tana.inc, Tana's "agentic meeting platform": documents in Tiptap on a Loro CRDT, meetings, AI,
behind WorkOS. The outliner people mean by "Tana" (supertags, nodes) is **Tana Outliner** at
app.tana.inc, as its site outliner.tana.inc says ("Web content describing 'Tana' as a note-taking app,
PKM, or outliner refers to this product"). Found by opening the hosts in headless Chromium, the user's
ask.

**Its test mode.** Tana Outliner's bundle routes `/tests` to an app state made with no server (`Uen`):
an anonymous `Guest`, Firebase's sign-in never asked, `window.appState` set (the node space, the layout
manager, the focus service). Its test boot loader waits for `window.bootTest({ caseFiles: [{ fileId,
storeData }] })`, a workspace in Tana's export format, loaded writable; the locale and time zone fixed,
the user `UITester`. `open` boots it with a root node and a home node, marks onboarding done (else the
app goes to `/welcome`), and the page sends Tana nothing but what the proxy caches or answers (its
telemetry: Sentry through its own `/api/…/envelope/`, `/api/improve`, OpenTelemetry). `/shared/…`, Tana
Publish, is read-only. No login, no cookie: the answer to the user's question.

**The driver.** A test is a node under home, its blocks its children, made through the model
(`insertNewNodeAtEnd`, `name`) inside `withoutUndoRecording` (as Tana makes its layouts; without it, undo
took the load back), the undo history emptied, the panel opened on it and each parent expanded; the caret
placed by the focus service and the DOM's selection. A name is HTML: escaped on the way in, Markdown on
the way out (`<b>` as `**`, a typed backtick toggles code). A to-do is the node's checkbox, an H1 its
section flag (Tana's one heading), a numbered item a child of a node whose list view shows numbered
bullets (`SYS_A283`, as "Toggle numbered list" sets it), a fenced block a code block node (its name the
code, its language a field), read back with the shortest fence that holds the code (the user asked about
longer fences: `~~~` and needless backticks are skipped, as a code block keeps no fence). Keys from
Tana's shortcut table: Shift+Enter is "insert node", Shift+Alt+Up/Down move, Ctrl+Shift+Backspace
deletes.

**What Tana does with a clipboard**, read in its code (`performPaste`, `L4`): classifiers score the
clipboard and the highest wins. Structured HTML (`tana-html`, 60, or 105 with a `pre`) beats Markdown
(`tana-markdown`, 50: two or more lines starting `-`, `*` or a number) and lines (`rich-plaintext`, 40);
Ctrl+Shift+V drops the HTML first. Lines go after the node, a node each, its text never split; Markdown
after the node, nested; a list at the top of the HTML is appended to the end of the parent
(`T.addChild`), not after the node, the same from a mouse click, from keys, and with the `<meta>` a real
copy carries: Tana's, not the load's. A paragraph and then a list makes the list its children. Every list
the runner pastes has HTML, so Tana pastes lists at the parent's end (with the text alone, 12 of its 48
paste verdicts change: the clipboard's policy, §15.5).

**Its noise, found and fixed**, each by playing the keys by hand and reading Tana's code:

- **The document's start, emulated, pressed Home on the first node**, where Tana's Home leaves the node
  (for its parent, or the page's title): the caret in the title, and moves after it doing nothing
  (Scenario5, 9, Placeholder1, 5, 6, 7). RemNote's emulation had ended in a title earlier, another way.
- **A node whose only child is empty** was never expanded (`expandAll` passes over it): its child
  missing (Backspace30, an error).
- **A focused checkbox** (Up and Down stop there, `…|donecheck`) read as no caret.
- **A node's fields read as blocks**: a pasted code block's language field came back as three blocks.
- **A code block's editor** makes its text anew as it takes the focus: the caret placed again once
  settled.

**Results**, 2026-10-18 (build `f6ae813f25`): agree 170 (91 original), caret 15, whitespace 13, disagree
100, error 0, skipped 489, in about 3⅓ minutes; the first run 161 (71), 18, 11, 99, 1. Every
disagreement and caret verdict left is Tana's: lists from HTML at the parent's end; Enter keeping the
space at a split, making a first child mid-text in a node with children (declared, `enterMidItem:
child`), never outdenting an empty node; logical outdenting (declared); no join of a node with
children; Backspace on a page's first node joining it to the title; numbering a parent's, so Tab takes
it away; Up and Down landing at a node's start; Enter at a code block's end leaving it; placeholder rows
a caret can be in (no node). The skips (the user's question): 430 of 489 are the block apps' (Markdown's
free form, quotes, callouts, the `markup-` tags, option values Tana hasn't); Tana's own are 22 blocks of
more than one line, 12 headings other than H1, 10 lists numbered in part. Code blocks, mapped, took 25
out of the skips. In the deep dive the `markup-` refusals went (28 more run), a block's later lines
became the node's description (19), and two camps were declared: 199 / 16 / 14 / 112 / 0 / 446 at the
end (§16).

## 9. The proxy

- **`--cache=use|offline|refresh`** for `--offline` and `--refresh`, in the proxy and the runner (which
  restarts a proxy in another mode, or on another cache), the last one given winning. `offline` serves
  what the cache has and reaches no network: a miss, and what would go live (other methods, a rule's
  live requests, WebSockets), answered 504 or refused. It writes nothing (checked: a hit and a miss
  through it, no file under `http/` newer than before) and stops at startup without the certificate an
  online run makes. `OURUS_SXS_HTTP` moves the cache alone, so it can be a read-only copy while the
  profiles and logs stay writable.
- **`--host`**: 127.0.0.1 by default, `0.0.0.0` in a container. The user's container published the port,
  and the browser's connection was reset: a published port reaches the container's interface, not its
  loopback. Beyond the loopback the proxy warns that whoever reaches the port can use it (it intercepts
  TLS and answers `/__proxy/stop`), and to publish it as `-p 127.0.0.1:8899:8899`.
- **The greeting**: the proxy, the cache and its mode, then each app a browser opens, at its driver's
  `url`, the page a report names too (RemNote's is `/notes`, its guest mode; a run takes over the last
  run's tab only under the driver's `scope`, new, for RemNote the whole site, its documents being
  `/w/null/<id>`), and the Chromium command that browses through it with a profile of its own
  (`.sxs/browse/`, ignored by `.sxs/`'s repository). Only on a terminal: the drivers are imported for
  it, which the shared proxy a run starts, writing to a log, needn't do.
- **`npm run sxs:proxy`**: the proxy alone, offline. A port already taken says how to stop the shared
  proxy.

## 10. Noise in the harness

- **A list as an item's first block.** `- - a / - b` projected as blocks `- a` and its children `a` and
  `b`: the inner item's text twice, the outer item read as empty but given the rest of its marker's
  line, and no note, so the examples counted as original. The other six block apps disagreed on
  Backspace41 and MoveDown33, SiYuan erred on both: 11 of the 13 apps, SilverBullet (compared as text)
  agreeing. Now the outer item is an empty block, the line its inner item's, noted
  (`a list as an item's first block`), with a test. Rerun: MoveDown33 agrees in all 7 block apps,
  Backspace41 in 4 (SiYuan whitespace; BlockNote and WorkFlowy differ). The first fix also took an empty
  item whose list starts on the next line, 16 examples; only a list on the marker's own line is meant.
- **A column of `?`.** A run of several apps drew an app with no verdicts (Tana, stopped at its login;
  or none to regenerate from) as a column of `?` and a row of 787 not run. Such an app is left out, and
  said; an app that fails keeps the table checked in as it was (§13).
- **`elapsed_s` in regenerated reports.** Regenerating took the latest run's time (5 s, a run of two
  examples, for apps whose full run took minutes). Now it keeps the report's version, command and time:
  regenerating runs nothing, and changes no run's facts.
- **A number that isn't a marker.** Six drivers (Logseq, Tine, Roam, WorkFlowy, Dynalist, RemNote) read
  a block starting `1.5` or `2)x` back as `1\.5`, escaping it as a list marker, which needs a space, a
  tab, a line break or the end after it. No spec buffer starts a block so; an app's output could.
- **A save later than settling waits.** Athens stores a block's text two seconds after its last change;
  settling counts no timer past 300 ms, so a block the caret had left read as it was (§7). Fixed in its
  bundle. Any app that saves a block it has left later than 300 ms would read so: not checked for the
  others yet (since: Logseq's and WorkFlowy's found below, Roam's in the deep dive, §23).
- **An id counter in the wrong process.** Athens's page ids were counted in the runner, the tab (and its
  graph) outliving it: a second run reused an id still in the graph. Counted in the page now.
- **Traffic tallied for the wrong app.** The proxy's tally of a run is everything since it started, and
  the apps' tabs stay loaded in their browsers between runs, talking: RemNote's run counted WorkFlowy's
  refused sockets, Dynalist's beacons, Roam's cloud functions and Chromium's own. Not fixed; fewer since
  windows close at a run's end (§15.4, §23).

`sxs/lib/outline.ts` is now `sxs/lib/block.ts` (its test `block.test.ts`), after `model: 'block'`, beside
`text.ts`, and no longer confused with ourus's `src/outline/`. The type stays `Outline`.

Found later:

- **A typing pace on an app's undo window.** Tana undoes records less than 50 ms apart together (`C6` in
  its bundle); the runner typed a character as soon as the app settled, about every 45 ms, so what one
  undo took back depended on the machine (Scenario20, 23), and a move right after the last character went
  with it. Measured: at 47 ms, one undo takes back `xyz`; from 78 ms up, one character. The runner now
  types at a typist's pace, at least 100 ms from key to key (`PACE` in `run.ts`, `--pace=MS` to vary
  it), for every app but a session's (Emacs). Rerun at the pace, no app's verdict changed for it; Roam's
  two that changed (below) change from run to run at any pace.
- **A clipboard's HTML read otherwise than ourus reads its Markdown.** A fenced block copied from inside
  an item keeps the item's indentation on its later lines, the closing fence's too; ourus's paste drops
  it (the spec's rule), the runner's HTML dropped only what all the lines share, so the HTML's code
  block held its own closing fence, and 8 block apps disagreed on Paste66 for it. `clipboardSource`,
  taken out of `src/commands/paste.ts` (no change in ourus), now gives the runner the Markdown ourus
  reads, tabs as columns. Of the spec's clipboards, only Paste66's HTML changed.
- **A crashed browser filed as an app's errors.** In a run that hit the container's cap, BlockNote's tab
  crashed, every example after it was an error (347), and the report was copied over the last. A tab
  that is gone (`Target crashed`, a closed page) now stops the run, writing no report and no data.
- **The examples every block app disagreed on** (4 or more ran them): 8. Paste66 was the harness's
  (above). ShiftEnter21 is ourus's own: all ten keep the space after a Shift+Enter break, ourus drops
  it, and a Backspace then leaves a space in the middle of their text that ourus's hasn't: a question
  for the spec. Paste37, 57, 62, 70, 79 and Scenario23 are the models' (headings and paragraphs adapted,
  a math clipboard with no HTML). One subtlety there: ourus keeps an escape (`2\.`) after a split puts
  text before it, where the apps' text has none; rendered, the two are the same.
- **Roam's undo, timing-dependent.** On the pool, two undo examples (Undo5, Scenario16) disagreed, then
  came out otherwise from run to run at the same pace. Likely Roam stores what is typed later than
  settling waits, as Athens did (§7), so an undo acts on an older history; not confirmed then. Measured
  in the deep dive: Roam stores typed text some 600 ms after the last key (§16), within the undo pause
  (below).
- **SiYuan's paste under load.** With 10 runs at once, three paste examples came out otherwise, alone as
  before: settling doesn't wait for requests in flight, and SiYuan pastes through its kernel. Open then:
  another run's end, below.
- **WorkFlowy's undo under load.** With 12 workers at once, Scenario16 (`moveSubtreeUp`, `"today "`,
  `undo undo`) disagreed once; alone, it agreed five times of five. WorkFlowy stores what is typed half
  a second after typing stops (`WF.Editor.saveLater`: `clearTimeout(t); t = setTimeout(() => save(e),
  500)`, its six callers through the global): the runner's Ctrl+Z comes 100 ms after the last
  character, the store still pending, and which lands first is the machine's. Made faster in the page,
  as Athens's was (§7; 1 ms, the user's, not 0), the debounce turned out to be WorkFlowy's undo itself:
  a word typed at a typist's pace is stored once and undone at once, and at 1 ms each character was a
  store, two undos taking back `y` and a space (`todar┃eview`). Reverted, the pool stopped to drop the
  patched windows. Roam's undo is likely the same, and the full runs found more of the class (§11):
  Logseq's and Dynalist's Scenario11, 16, 19, 20 flipping under load, and BlockNote's Scenario20 undoing
  back to `Pack ligh┃` one run and to `# Trip┃` the next (the same disagreement, another state):
  BlockNote groups edits less than 500 ms apart into one undo step, as ProseMirror's history does, by
  their times, with no timer, and one gap over 500 ms under load split the group mid-word. The fix, the
  user's to do later: **a pause at step boundaries in examples with an undo or redo**, some 750 ms
  after each step's actions (longer than the common grouping windows: ProseMirror's and CodeMirror's
  500 ms, WorkFlowy's 500 ms store), and before an undo that follows other actions in its step (not
  between undos); nothing within a step, keys and characters at the typist's pace, so an app still
  groups a run typed fluently as for a person. A step's end is where the spec's author looks at the
  result, a person's pause too. Checked against the cases: BlockNote's and Dynalist's Scenario20 then
  undo the move alone; WorkFlowy's Scenario16 stores `"today "` before `undo undo`; Tana, which groups
  edits under 50 ms, is unchanged. A wait for the timers typing set (the first idea) would miss
  ProseMirror's grouping, which sets none.
- **Plain pastes and another run's end.** The full rerun on the fixed pools (§11), all 16 apps at once,
  made 7 of Logseq's 12 plain pastes (Ctrl+Shift+V) do nothing, its text read back as it started; the
  next, 4 of Logseq's and SiYuan's Paste22 and Paste30 (the "paste under load" above). Its Ctrl+V
  pastes all came out as before. Alone they agree; six pasting apps at once (`paste.md`, 287 verdicts),
  the seven alone with every CPU busy, and all 16 apps on `paste.md` changed none: only a full run did
  it. Not focus or window activation (a throwaway: two windows, another connection attaching and
  leaving, windows made, closed and brought to the front: focus and the clipboard held). Both apps'
  plain pastes read the clipboard through the Clipboard API (Logseq's `readText()` through a clipboard
  plugin, whose callback pastes only while a block is being edited; its error goes to `console.error`,
  which the runner doesn't collect); Ctrl+V takes the paste event's data. A temporary instrument (behind
  an environment variable, removed after) logged each plain paste's clipboard calls, their results,
  focus and blur: in the next full run five of Logseq's failed with
  `readText() FAILED NotAllowedError: … Read permission denied`, the runner's own read in the page
  refused too, focus held. The cause,
  then measured on one browser: a DevTools connection's end resets the permissions it granted
  (`Browser.grantPermissions`) for every page of its browser's context, so a run that finishes in a
  browser takes the clipboard's read permission from the runs still going there; a connection that
  granted nothing changes nothing, and granting again restores it. Every run grants it (`appPage`), and
  runs end all through a full run, which `paste.md` alone, its apps ending together, rarely gave. Fixed
  with what was there: holding a browser's clipboard (`AppPage.clipboard`, `clipboard.lock`) grants the
  permissions again, and a run disconnects from its browser only holding its clipboard, so no reset
  falls in another run's clipboard example. Verified on a full run (393 s): no plain paste changed,
  Logseq's and SiYuan's all as at 13-align; 5 verdicts changed of 7,165, the undo class's 4 and Tine's
  Paste16 (its numbers, below). SiYuan's "paste under load" was most likely this too: its Paste22 and
  Paste30 are plain pastes.
- **Tine's numbering under load.** Paste16 (a list pasted into an empty numbered item) flips in every
  full run: Tine renumbers `1. x`, `2. y`, `3. b` alone, and under load the read finds `1. x`, `y` and
  `1. b`, in 1.7 s where alone 1.1: renumbering after settling, as an undo's store is (§23).
- **Undo examples, timed as a user's.** The class of the full runs: 8 to 10 undo examples changed from
  run to run (Roam's, WorkFlowy's, BlockNote's, Logseq's, Dynalist's, SilverBullet's). The pause above,
  750 ms between an undo example's steps and before an undo after other actions of its step
  (`UNDO_GAP`), left two runs of every app on `undo.md` and `scenarios.md` 3 verdicts and an output
  apart, Logseq's above all. Logseq OG's source (`logseq/og`) said why: a block's text is stored by an
  auto-save 500 ms after the last input (`edit-box-on-change!`), each store a transaction and each
  transaction an undo entry (`undo_redo.cljs`); an undo stores the edited block first, then pops. Under
  load the auto-save fired late: after the first of two undos it stored the undone text again, and the
  second undo took that back instead of the step before; and a text edit not yet stored joined the
  block join after it, one undo taking back both. The idle script tracked only short timers, so
  settling never waited for it. Now it also tracks timers up to 5 s (not as part of a key's reaction),
  and `drain` waits for the ones pending at a moment; a pause is the gap, then a drain (up to 2 s: the
  app's put-off saves), then settling. Two runs of every app on the two files: no verdict and no output
  apart (358 examples). Against the full run before the pause, 7 verdicts and 5 outputs moved
  (BlockNote's Undo4 and Scenario20, Roam's Scenario11 and 20, Dynalist's Scenario20 to agree, Logseq's
  Scenario11 to caret, Dynalist's Scenario19 to disagree): what each app does at a user's pace, now
  repeatable. (Dynalist's Scenario19 was another thing: a date picker an earlier test left open, found
  in the deep dive, §16.)

## 11. A pool of browsers

**The cap.** A run of every app (`run.ts all`, all 16 at once) failed for 8 of them: `pthread_create:
Resource temporarily unavailable`, renderers crashed, apt-get couldn't fork, Obsidian timed out. The
container caps its tasks, processes and threads together (cgroup v2, `pids.max` 2048; `pids.events`
said 35 hits); not memory (27 GB free). A browser per app, left running between runs (the first design,
for its clipboard and front tab), was some 10 processes and 120 to 160 tasks; 16 of them pass 2048
before any run.

**Measured** (throwaway browsers, the pool's flags):

| | processes | tasks |
| --- | ---: | ---: |
| a browser alone | 8 | 104 |
| each app's page (its renderer), tab or window alike | +1 | +20 |
| the flags that help (no crash handler, the GPU in-process) | 10 → 9 | 132 → 128 |
| all of them (also no zygote, no sandbox, no site isolation, one raster thread) | 6 | 115 |
| two tabs in one window: frames in 500 ms, front / behind | | 31 / 2 |
| two windows: frames in 500 ms | | 31 / 32 |

A browser's tasks are mostly its own threads (49 in its browser process alone), and flags trim little:
`--disable-crash-reporter`, `--disable-breakpad` and `--in-process-gpu` were kept (they change nothing a
page sees). Two corrections, found later: Debian's `/usr/bin/chromium` is a wrapper that adds flags of
its own, `--no-sandbox` among them as root, so the sandbox was never on here; and the crash handlers
(two a browser, writing to `~/.config/chromium`) start despite `--disable-crash-reporter`. Site
isolation stays. A window costs what a tab does, and a tab behind another gets no frames, which editors
render in and settling waits for: a window per app.

**The pool** (`lib/browser.ts`, `.sxs/chromium/<n>/`: profile, log, locks). Apps share browsers, up to
four runs in one, each in its app's window, one window of an app in a browser, kept for the next run
(since closed at a run's end: §15.4). A run takes its app's lock (`.sxs/<app>/<app>.lock`, `lockApp`),
then each of its workers, holding the pool's lock, a browser without another worker of the app and
with room: the app's window in it if one has, else the least busy, else a new one (`<app>.lock` in the
browser's directory). The clipboard is the browser's, shared by its windows: an example that uses it
holds `clipboard.lock`. Each window's page is in front of its own and has the focus (emulated per
page). Near the cap, a run closes other apps' idle windows, the longest idle first, and a browser left
with none (`makeRoom`); `run.ts all` runs as many apps at once as the cap holds, at some 200 tasks a run
(10 here). `run.ts --stop` stops the pool. The first design's profiles (`.sxs/<app>/chromium/`, 123 MB)
and logs are deleted.

**Verified.** Tana's and BlockNote's paste examples, side by side in one browser through the clipboard's
lock: no verdict changed of 102. A run of every app on the pool: 16 of 16, in 887 s, 10 at a time, two
browsers, about 900 to 1,050 tasks; against the runs from before the pace and the pool, by example, 14
apps changed nothing, Roam two (timing, §10) and SiYuan three (under load, §10), of about 7,000.

**Workers.** One run plays an app with several workers side by side (`--workers=N`), each in a browser
of the pool of its own, the app's storage its profile's. They take the examples from one queue in the
spec's order, whichever is free, and results are printed in that order as soon as the examples before
them are done. What the runner held once (the actor, the clipboard's hold, the settings the app was set
to, page errors) is a worker's (`Worker` in `run.ts`), and what a driver knew of the test a page is on
is the page's (`perPage` in `lib/driver.ts`): Logseq's, Roam's and Tine's page for the test, SiYuan's
document; SiYuan's sweep of earlier runs' documents made a run's, by their names, so that a worker's
first test leaves the others'. Counters that only make names unique stay the module's. By default as
many workers as the examples warrant (one per 30), at most 4 (since: one per browser of the pool, six,
§15.3), and what the cap holds (some 130 tasks each); one for a driver that starts its app (`launch`),
or as many as its `parallel` says. A page gone stops the whole run.

**`run.ts all`.** A budget of workers at once in all (what the cap holds, some 120 tasks a worker above
a reserve of 300, at most two a CPU: 14 here; at first a flag, `--budget`, since dropped). Each app takes
the workers it can use, as alone (one per 30 examples, at most 4, its driver's `parallel`), the most
examples a worker first, each starting as its workers fit. A first version planned each app's workers
from its last run's seconds an example, to end every app together; the user dropped it: the plan held
only unloaded, and a run of one example read as minutes. Runs still record their `workers`; each
example's `ms`, recorded for the plan, went from the run data later (the user: a diff of every file at
every run), its time left in the log.

**The first full run on it** (`.sxs/` reset to 13-align's commit: RemNote, Athens and Tana cold), under
the plan since dropped: 13 apps in 660 s (the pool run: 887); three of the four Obsidian setups failed at
once on a lock (§22), rerun later. Against the pool run's table, of some 10,200 verdicts, 3 changed, all
undo scenarios under load (Logseq's and Roam's Scenario11, Logseq's Scenario16: §10's class). An app
with one worker took two to three times its time alone (Logseq 209 → 446 s, Roam 260 → 514, Athens 176
→ 527), the load average at most 7.4 on 10 CPUs: likely four runs' keys and DevTools commands queued on
one browser process's main thread. `RUNS_PER_BROWSER` (4, `lib/browser.ts`; at first a flag) was there
to measure it, four one-worker apps in one browser against four; never measured: a browser's windows,
`WINDOWS`, took its place (below).

**Kept out of the cache**, found in it: Segment's analytics library, which RemNote loads through
AMBOSS's own host (`www.amboss.com/us/api/sprx/…`; RemNote is AMBOSS's), its test mode keeping it from
sending, not loading (`remnote/proxy.ts`, new); Cloudflare's Web Analytics beacon on Dynalist's and
SilverBullet's pages (`.cloudflareinsights.com`, blocked); BlockNote's site's npm badge and contributors'
avatars (`img.shields.io`, `avatars.githubusercontent.com`, `github.com/<user>.png`, its rules). Each
deleted from the cache. Kept: Roam's help graph (Firebase's realtime database, `v10/dbs/help/log.json`,
and its handshake) and Tine's plugin registry, the apps' own.

**The pool, hardened.** A browser that runs but doesn't answer (busy, or its port file gone: the user
cleaning `.sxs/` under a run) was taken for stopped, and a new one started on its profile, which
Chromium hands to the one running: an orphan. A profile whose `SingletonLock` holder is alive is now in
use, its number left alone, and `--stop` stops such a browser by its pid. Tested: a port file deleted,
the next run started browser 1 beside it, and `--stop` stopped both.

**Obsidian's workers**, first: each an Obsidian of its own, a launch taking the first launch directory
no other holds (`.sxs/obsidian/<n>/`, any setup's: a vault written anew, a log), on an Xvfb and a
debugging port of its own; the setup's lock the runner's, as an app's. An instance is some 75 to 90
tasks; two started side by side in 2.6 s, with the same 28 verdicts as before. `parallel: 2`, the
user's, for a start. Not shared across setups, as browsers are across apps, on the premise that a
setup's vault (its mode, its plugins, their settings, hotkeys) takes effect as Obsidian starts (wrong:
below). The setups' old vaults and logs (`.sxs/<setup>/vault`, `obsidian.log`) are deleted.

| app, 4 workers | before | with 4 | verdicts changed |
| --- | ---: | ---: | --- |
| Tana | 201 s | 59 s | 0 of 289 |
| RemNote | 782 s | 201 s | 0 of 342 |
| SilverBullet | 794 s | 229 s | 0 of 660 |
| WorkFlowy | 460 s | 104 s | 1 of 296 (Scenario16, timing: §10) |

The last three ran at once, 12 workers in four browsers, under 1,000 tasks.

**SiYuan's kernels, one per worker.** SiYuan was the run of all's floor: one worker, its kernel's state
not shareable with a second (the notebook, the documents, the undo stack per document), 816 s under
load. Now kernel n runs on a workspace of its own, `.sxs/siyuan/<n>/` (workspace, log, pid, numbered as
the pool's browsers), on port 6816 + n; a worker's `open` leases the first kernel no other worker holds
(`kernel.lock`), starts it if it isn't running, and loads the UI from its port. A window an earlier run
left is on its kernel's port, so the worker reusing it holds that kernel; if another worker holds it
already, the probe fails and the runner opens a new window on the next kernel. Kernels share only the
release (`files/`, downloaded once under a lock). The driver's notebook and its sweep of earlier runs'
documents are per kernel; `parallel: 4`. `Driver.serve` lost its only user and went: `--stop` stops a
worker's servers (`.sxs/<app>/<n>/server.pid`) beside an app's. A full run: 106 s with four (two windows
reused, two kernels started), all 364 verdicts as committed at 13-align; against the loaded run of all,
two pastes back to agree (Paste22, Paste30: §10's paste under load).

**Obsidian's pool.** Obsidian per worker was wrong in its premise: a vault's settings and plugins take
effect as its window opens, and one Obsidian opens any number of vaults, each a window with its own
`app` (`main.js` of 1.14.4: the `vault-open` message registers a folder and opens it; no session
partition per window). Measured first, throwaway: an instance with its starter window is 92 tasks, a
vault's window some 25 more, opening in 0.35 s (an instance starts in 2.6 s); two setups' windows each
loaded their own plugin, took keys at once (focus emulated per page), and shared the clipboard
(Electron's and `navigator`'s) and local storage (Obsidian keys its own by the vault's id; neither
plugin uses it); closing every vault window leaves the starter's, which keeps the instance up (else
`window-all-closed` quits it). So: instance n in `.sxs/obsidian/<n>/` (configuration directory, log,
port, versions, pid as `server.pid` so `--stop` stops it), started detached on an Xvfb of its own that
exits with it (`-terminate`), left running; a worker leases an instance with no window of its setup in
use (`<setup>.lock`), writes the setup's vault (`<n>/<setup>/`), opens it from the starter window, holds
`clipboard.lock` for examples that use the clipboard, and closes its window at the end. Restricted mode
is per vault id, which the instance assigns as it first opens the vault, so the trust flag is set right
around `vault-open` (the window's first load perhaps before it: `open` reloads, and checks every plugin
loaded); a first version used a context-wide init script, which failed one setup's start when another
run closed a window during it (§22). `Driver.launch`'s `release` closes the window, not the app. With 2
workers a setup, the four setups on `indent.md` at once: 2 instances, each with all four setups'
windows, 108 verdicts as before. Then `parallel: 4` (the user's): the four full runs at once, 16 workers
in 4 instances, in 180 s (alone, 2 workers each under the run of all: some 300 s each), the container at
most 1,399 tasks with everything else; 0 of 2,590 verdicts changed. Idle, an instance is some 100 tasks.

**The pool's size, fixed.** The pool had no cap on browsers: a run took a browser with fewer than four
runs, else started one, so the run of all packed 14 workers into four. Now at most six (`BROWSERS`), then
eight (the user's, during the next full run), runs spread over them: an idle browser first (the app's
window in it if one has), a new one while fewer than that run, else the least busy with room; with all
full, a run waits for room (ten minutes at most). Tested with two browsers and one run each: the second
app waited for the first and ran, no third browser started.

**The pools as the one knob.** The next full run (after the user's reset of `.sxs/`) showed the run of
all's budget at work: 14 workers, so three apps at a time (SilverBullet, Obsidian, its Live Preview, 4
workers each), the container at 27% CPU and 1,209 of 2,048 tasks (Obsidian 590 in 4 instances, Chromium
537 in 4 browsers), the next app waiting for 2 more. The user wanted no budget, no worker cap and no
scheduling by live task counts: the pools are the limit, sized so that full they hold under the cap (a
browser some 110 tasks and a window 25; an Obsidian some 95 and a window 25): six Chromiums with three
windows each (some 1,110), three Obsidians with a window of each setup (some 585), and SiYuan's kernels,
the runs and the proxy (some 230): some 1,925. So: `BROWSERS = 6`, `WINDOWS = 3` (a browser's windows,
idle ones counted: the longest idle closes for a run that needs its place, which bounds what idle
windows cost and replaces `makeRoom`, gone with `taskCap`), `OBSIDIANS = 3` (`parallel: 3`; since
`OURUS_SXS_OBSIDIANS`, four, or two beside the Chromiums, §15.4); `run.ts all` starts every app at once,
and a run's workers join it as each gets a place (the first waits as long as it takes, the others only
while examples are left, so a waiting app holds no place idle and nothing deadlocks). A browser past the
pool's size (left by a run with a larger one) is stopped once idle. Tested: five apps of 4 workers on
`indent.md` at once, 20 workers for 18 places: each app's fourth joined as places freed, idle windows
closed for them, 93 verdicts as committed, 40 s; the next run stopped the two browsers past six. (After
the full rerun, the user's: five Chromiums, for room under the cap, some 1,770 tasks full; six again in
the deep dive, §15.4.)

**The full rerun on it** (`.sxs/` cleaned by the user; the downloads, SiYuan's release and Obsidian's,
fetched again by the drivers): all 16 apps at once, 324 s (the last on the pool with its budget: 818),
no app failed. The container: at most 1,998 tasks of 2,048 (Chromium 1,088 in six browsers, some 181 each
with three windows, as estimated; Obsidian 592 in three instances; the runs' nodes 161), CPU 56% of ten
cores on average and 78% at most, the load average at most 20.6, memory at most 16.5 GB: some 50 tasks
to spare, the pools as large as this container holds. The apps' times: Emacs 11 s, Athens 60, Roam 77,
RemNote 217, Tana 226, WorkFlowy 230, Tine 245, SiYuan 255, Logseq 272, the Obsidian setups 230 to 274,
BlockNote 285, Dynalist 302, SilverBullet 320. Against 13-align's runs, 16 verdicts changed of 7,209: 8
undo examples, the class of §10 (BlockNote's Scenario20 and Undo4, Dynalist's Scenario20 and 22, Roam's
Scenario11, 16 and Undo5, WorkFlowy's Scenario16); Tine's Paste16, as under load before; and Logseq's 7
plain pastes (§10), the harness's. (A first comparison keyed by name alone collapsed the examples
several files share a name for, "Outliner flows": keyed by name and line since.)

**Results in a directory of their own** (the user's): `.sxs/results/` is laid out as `sxs/` is, the last
table (`sxs.md`, `sxs-heatmap.svg`) and each app's results (`<app>/`: its last run, `sxs.md` and
`sxs.json`, and each spec file's, `<file>.json`); `sxs.log` stays in `.sxs/<app>/`. A report's and the
table's links were written for `sxs/` and held in `.sxs/` only for its having `sxs/`'s depth: in
`results/`, one level deeper, each link out of it gets one `../` more (`inResults`), and the table's
links to the reports hold as they are. First `.sxs/<app>/results/`, then this, the user's; the files
moved by hand, every report regenerated: every link resolves in both (1,195 in each table, 540 in
Logseq's report), and a run writes there and nowhere else.

**Fewer flags.** `--jobs` (apps at once) and `--budget` (workers at once) went: the budget is what the
cap holds, and nothing needed another; `--runs-per-browser` and `--browsers`, added for measuring, are
constants in `lib/browser.ts` (`BROWSERS`; runs per browser became `WINDOWS`); `--table` (the table from
each app's last `sxs.json`, which a partial run leaves partial) went for `--report`, which
judges every app's runs again and writes the table too, in seconds.

**Other shortcuts, Obsidian's.** A second table in each Obsidian setup's README (Live Preview's points to
bare Obsidian's), as Tana's, Athens's and RemNote's have (every outliner's README has one since): the
shortcuts useful to an outliner that ourus doesn't implement, from the source (the commands of `app.js`
with default hotkeys, CodeMirror's keymap in it, the plugins' `addCommand`s and keymaps), then measured
on a throwaway instance, as the source alone misleads: CodeMirror's Alt+L, Shift+Alt+Up and Down aren't
bound in Obsidian, and true-outliner's declared Ctrl+Alt+Period never fires. Measured: Ctrl+L cycles an
item through a task, done and not done; Ctrl+D and Ctrl+] work on the line, not the item with its
children (bare and Outliner); Outliner folds on Ctrl+Up and Down, true-outliner on Ctrl+Alt+Up and Down;
both make Ctrl+A structural (the item's text, then the item with its children, ...); true-outliner's
Ctrl+D deletes more than the line (from `c`, its parent `b` too). Folding, list toggles, headings and
true-outliner's zoom are commands with no key.

## 12. App ids

Each driver declares two capitals (`Driver.id`), checked unique when the table is written: LS Logseq (LO
since Logseq DB, LD, came), TI Tine, DL Dynalist, SY SiYuan, RN RemNote (its documents without bullets;
RB with them, `remnote-bl`: the user's, later), RR Roam Research, WF WorkFlowy, TO true-outliner, OL
Outliner, BN BlockNote, SB SilverBullet, AR Athens Research, TA Tana, OB Obsidian, LP Obsidian's Live
Preview, EM Emacs. `sxs.md`'s summary has an id column; the spec files' table and the test cases' are
headed by the ids, each linking the app's report with its name as the title; the heatmap's top labels
are the ids (US for ourus), right-aligned as its numbers, its rows' still the names.

## 13. The review

A review of the whole diff (the `code-review` skill, unverified findings): 15, each read against the
code, all real, all fixed.

- **RemNote's document's start** ended in its title: Up from the first rem goes there, the read caret is
  then none, and the emulation stopped on two reads alike. The checked-in report had the verdicts that
  followed (a move doing nothing, an undo after it). Now the emulation stops on the first rem's first
  line (the last rem's last), and the title is never reached. With Shift, a caret crossing a rem's edge
  makes a selection of rems, with no caret to read: the emulation compared carets and stopped after two
  rems; now it compares the caret and the rems selected, and extends until they stop growing.
- **Tana's signed-in answers would have been cached**, set-cookies and all, into `.sxs/http/`, which
  `.sxs/`'s repository tracks; replayed, a stale set-cookie would also have overwritten the profile's
  session. Its rules cache only static files now, and Tana Outliner's page and version, which no
  session touches (§8).
- **The hand-browsing profile** (`.sxs/browse/`) wasn't ignored by that repository: a whole Chromium
  profile, cookies and all, one `git add -A` away. Ignored.
- **`ensureProxy`** reused a running proxy on another cache (`OURUS_SXS_HTTP`); it compares it now.
- **A number that isn't a marker** read back escaped, in six drivers (§10).
- **Tana in `all`** failed every run of every app; a session wanted is its own exit code (3), and leaves
  the app out.
- **A failed app dropped from the table** was copied over the table checked in: a timeout would have
  removed an app's column. Now a run with a failed app doesn't copy it.
- **A curl's quoting**: `$'...'`, which Copy as cURL writes when a cookie has a quote in it, wasn't read,
  and a `"` inside `'...'` ended the word (found while fixing it). Read by each quoting's own rules now,
  with tests.
- **Cookies forced HTTP-only and host-only**: a header says nothing of a cookie's attributes, and the
  strictest hid a cookie from the page's scripts and from the site's other hosts. Now each goes to the
  site and its subdomains, readable.
- **The shared proxy imported every driver** for a greeting nobody reads in its log: only on a terminal
  now.
- **Offline wasn't**: what would go live still went (§9).
- **`npm run sxs:proxy -- --cache=use`** stayed offline: the first `--cache=` won; the last does.
- **A regenerated report's frontmatter** described two runs (the latest's command, the report's time):
  all of it the report's now.
- **`--host=0.0.0.0`** makes an open relay that intercepts TLS: said at startup, with the safer way to
  publish the port.

## 14. The deep dive's method

Four sessions did it the same day: two on the main line, one after the other (Logseq, Tine, Roam,
Athens, RemNote and the pools; then SiYuan, Tana, BlockNote, SilverBullet), one in another container on
the same checkout (Dynalist, WorkFlowy), one on the Obsidian setups and Emacs; their notes are merged
here, and each app's findings are in its README, which these sessions rewrote.

An app at a time, each verdict but agree checked:

- **Against the source** (Logseq OG, Tine, Athens, SiYuan, BlockNote, SilverBullet, the Obsidian
  plugins, cloned) or the bundle in the proxy's cache (Roam, RemNote, Dynalist, WorkFlowy, Tana): the
  handler that decides it.
- **By hand**, in a probe (§20): a headless Chromium of its own through the proxy, the driver's own
  `load` and `read`, keys at the runner's pace, and the app's model and screen printed beside.
- **Replayed outside the runner** (`verify.js`): each example's start, clipboard and keys played again
  and every step's read compared with the run's. Dynalist 124 of 124 steps, Tana 142 of 142 verdicts,
  BlockNote 240 of 240, SiYuan 206 of 206: the runner plays what a probe plays.
- **Read against the screen**: the outline rebuilt from what the page draws (rows, depth, numbers,
  checkboxes, headings) beside the driver's read (Dynalist, Tana; BlockNote's numbers): a read can
  agree with itself and still not be what the user sees.
- **At a slow pace** (`--slow=400`): a verdict that moves is timing. Dynalist 0 of 343, Tana 0 of 142,
  BlockNote 2 of 240 (undo's time grouping, §15.6), SilverBullet none.
- **The declarations** (`--ignore-options`, §15.2): the option skips played against their own values;
  a camp the app agrees with every time is undeclared, one it never agrees with is confirmed.
- **The clipboard's formats** (`--plain-clipboard`, §15.5): the pastes played with the text alone.

## 15. The harness, continued

### 15.1 Drawing and reading

- **Numbered blocks drawn as the apps show them** (`lib/block.ts`): `1. a` for an app that numbers
  blocks (`draw(o, { ordered })`), children and later lines where the text starts; `- 1. a` (text)
  otherwise, byte for byte as before. `readOutline(drawn, { ordered })` reads both, an old drawing too;
  without `ordered` it is the old reader exactly. Checked against the old code on every stored state of
  every app: 0 differences, and with the option unguarded, text apps' Markdown would have read as
  outlines (the user's "are you sure it's safe?" found it). Two places compared drawn strings and would
  have broken (the regeneration's keys, the heatmap's starts): both compare redrawn starts now.
- **Regenerating changes no fact**: one time for a report and its data (they were taken a moment
  apart), and a version the run didn't have read back as none, not `"unknown"`.
- **Free form for apps whose blocks are paragraphs and items** (`Driver.freeForm`, `Block.free`, drawn
  `¶`): RemNote's documents without bullets had it; BlockNote and SiYuan now too (§16). What a free block
  owns in ourus's outline (a heading its section, a paragraph the list right after it) these apps hold
  beside it, as Markdown does: `liftOwned` on load and `ownBlocks` on read (`lib/block.ts`, unit-tested;
  per list of siblings, since BlockNote's and SiYuan's free blocks can have children of their own).

### 15.2 Plans, skips and declarations

- **`--ignore-options`** (`run.ts`): plays the examples an option would skip, each against ourus with
  its own options, into `.partial` files. One skipped for the app's own value that agrees says the
  declaration is wrong; one of the value declared against that agrees, that the camp is undeclared.
  It found Athens's four paste camps, RemNote's `backspaceAtTopItem`, Tana's `headingEditing: block` and
  `pasteStructuredOnParent: after`, Tine's wrong `emptyItemWithChildren`, and camps that depend on the
  case's shape (an empty top-level block can't outdent; one pasted line joins, several are items).
- **Options as blocks** (`lib/plan.ts`): skipped also where the app's declared value acts on the blocks
  it is given though not on the Markdown (E9: Enter mid-paragraph before a list is, on blocks, Enter
  mid-text in a block with children): 23 examples in 9 apps. `bullet` no longer skips a case in a block
  app, which has no markers.
- **Refusals are policy, skips are facts**: the `markup-heading`, `markup-task` and `markup-fence`
  refusals hid playable cases in Dynalist (59), Tana (28), SiYuan (12) and WorkFlowy: a caret where the
  markup has no text is `holds`'s to decline, and a join or split at it is the app's to show. Dropped
  there; Logseq, Tine, RemNote, Athens and Roam keep theirs, BlockNote `markup-fence`.

### 15.3 The runner

- **The first worker**: workers ready together each pushed themselves before any checked whether it
  was the first, so none was, and the run's version was lost.
- **A run that waited for good**: a RemNote worker joining late had a page that never entered test
  mode, and `open` awaited `waitForPlaywrightToLoad()` forever while the run waited for every worker.
  `open` gives it a minute, and a worker other than the first that can't open the app leaves the
  examples to the others (`join`), where any failure to open had failed the whole run. A worker whose
  `open` throws releases its window (`ready`): a failed SiYuan worker had left its window blank.
- **Workers**, one per 30 examples, at most one per browser of the pool (`BROWSERS`, six), and a
  driver's `parallel` (SiYuan 4, a kernel each; RemNote 3; Obsidian 4, or 2 beside the Chromiums).

### 15.4 The pools

Chromiums and Obsidians are heavy on tasks, and the container's cap is 2048 (a Chromium some 110, a
window 25, an Obsidian 95):

- **Six Chromiums** (were five), three windows each, some 1,100 tasks full. **Windows close at a run's
  end** (`AppPage.release`; the browser stays up): one is reused only where a run died before closing
  it (`--fresh` for that). **A window is made at the viewport's size** (1280×900) and a reused one has it
  set again: an emulated viewport ends with the DevTools connection that set it, and every reused window
  had been running at 780 pixels, Dynalist laying itself out for a phone.
- **RemNote's setups in browsers apart** (`Driver.browsers`): RN the even-numbered, RB the odd, three
  each, so a profile's guest knowledge base is one setup's only. A browser killed while RemNote wrote
  had left a profile's database broken (every window on `/database_error`, an open of 184 s); with the
  profiles deleted, 4.4 s.
- **Obsidians**: four, or two in a run of several apps with Chromium's among them
  (`OURUS_SXS_OBSIDIANS`, which `run.ts` sets for its children); an instance stops as the last window a
  run had in it closes, so a run's Obsidians stop as its last Obsidian setup ends.
- **One machine per `.sxs/`.** Two containers on one checkout share the profiles but not process tables,
  `/run` (the records) or hostnames: one's Chromium took the other's profile lock for a stale one and
  started on a profile in use, and IndexedDB, Web Locks and service workers hung (WorkFlowy stopped
  loading; read in the browsers' own logs, two Chromium processes at once). A SiYuan kernel of the
  other's held every workspace's lock, and every kernel here exited 24. Not fixed: run the pool from one
  container, or give each its own directory and proxy (`OURUS_SXS_DIR`, `OURUS_PROXY_PORT`).

### 15.5 The clipboard

The runner puts the example's Markdown on the clipboard as text and, where it has structure, as HTML
too, as a copy from a rendered page carries it. Most apps read the HTML when there is one, so which
copy the spec's clipboard stands for decides verdicts:

- **Logseq** takes the HTML wherever there is some (`paste-copied-text`), converted to Markdown, then
  blocks; its own copy writes EDN, text and HTML.
- **Tana** picks among readings of the clipboard by score: played with the text alone, 12 of its 48
  paste verdicts change (a list pasted as Markdown goes after the item, as HTML to the end of its
  parent's children).
- **SilverBullet** converts HTML to its own Markdown (`*   a`): played with the text alone, 52 of 85
  buffers changed and no verdict.
- **Dynalist**: three whitespace verdicts come from the HTML commonmark renders (`<li>a\n<ul>`), as a
  real copy of the page would; they stand.

A policy, not noise; open (§23).

### 15.6 Undo and the pace

- **An app's history must start where the test does**: Logseq's undo took every transaction, the
  driver's load among them (three undos emptied the page); a function named in its bundle now empties
  its stacks after the load.
- **Apps group undo by time**: Tana's records less than 50 ms apart, ProseMirror's (BlockNote) and
  CodeMirror's (SilverBullet) edits less than 500 ms apart, WorkFlowy and Roam likewise: what the first
  part's undo pause is for (§10). At the runner's pace (`PACE`, 100 ms) BlockNote undoes Enter, Tab and
  `x` at once (`Undo5` agrees at 500 ms).
- **Scenario16** (a move, typing, two undos) is the runs' one wobble: under a full run's load
  BlockNote's second undo once left the move, and Roam's in the first rerun; alone, it agrees every time.

## 16. The apps one by one

### Logseq

Logseq OG's source cloned. Of 29 disagreements, three were the driver's, each fixed:

- **The editor held a hidden property**: a numbered block's content is `a` plus a hidden
  `logseq.order-list-type:: number`, which Logseq's editor doesn't show, and the driver forced the
  stored content into it. The editor now holds what Logseq opens it with: Paste16 agrees, and Paste2 and
  Paste18 disagree, rightly: **Logseq's bug**, a paste into a numbered block saves the editor's text over
  the block and the number goes.
- **Escape never selects a block with a code fence** (`on-hide`): deleteSubtree selects such a block
  with Ctrl+A instead.
- **The undo history held the driver's load** (§15.6).

The rest Logseq's, by its source: Backspace at a numbered block's start removes the number first; a join
refused where both blocks have children; Enter carries no task marker; a paste over a selection keeps
the selected text. `deleteSoftLineBackward` is Alt+U, its "kill line before".

### Tine

Tine's source cloned (`--depth 1`: a full clone is 256 MB). Against Logseq, which it copies: of 334
examples both ran, 275 came out the same, 282 after the fix:

- **Tine took its blocks' facets as the driver gave them**: a page's blocks come with their header
  facets (task marker, priority, heading level, dates, properties), and the driver gave none, so a
  numbered block was no list to Tine. `tine/proxy.ts` names Tine's own reading of a block's header
  (`deriveFacets`), and the driver fills each block with it: nine verdicts moved, all towards what
  Tine's source says, two old agreements turning out to be the bug (Backspace29, "Next item becomes the
  new 1.").
- **A wrong declaration**: `emptyItemWithChildren: refuse`; Tine joins (`absorbInto`). And **Tine's
  bug**: a join appends the absorbed block's children to the survivor's, reordering them (`Delete5`).

### Roam

Its graph comes live over Firebase (`--cache=use`). deleteSubtree has a key (Escape, Roam's
`init-or-cancel-selection`, then Backspace: seven more examples); `backspaceAtTopItem: refuse`
declared; math, tables and HTML are a block's text in Roam, no longer refused (eight more); code blocks
are a gap (Roam's are CodeMirror 6 editors: 26 examples would run, §23). Roam's own: Enter makes the
new block above; a one-block clipboard pastes into the text; numbering is a parent's; text is stored
some 600 ms after the last key.

### Athens

Its source cloned. No key moves a block (its editor's keys, the selection's, every `:block/move`
dispatch: drops only), so the 92 move skips stand (§7); a bit of JS could move one, but the driver would
choose the target, which is what a move is tested for. Its four paste camps, measured with
`--ignore-options`, declared (14 disagreements were these). **Athens's bug**: Backspace at the start of
a page's first block deletes its text into the page's string.

### RemNote

Two setups: RN, documents without bullets (free form), and RB, with bullets.

- **The rem being edited was read from a text cache** that can hold less than the editor (a leading
  line break, a leading space, a code rem's indentation), with the caret from the editor (ShiftEnter13's
  `o┃ne`): read from the editor now, which brought RemNote's own placeholder into view (U+FEFF at the end
  of any text with a line break; SiYuan's, below, for the comparison with ourus's `◌`).
- `enterAtTextStart: stay` and `backspaceAtTopItem: refuse` declared.
- **RN's flat documents are a user's**: typed by hand, a heading's paragraph is its sibling, so the
  moves that leave a section behind are RemNote's. RN against RB (21 of the 212 same starts apart, each
  a rule of the mode without bullets; 105 different documents) is in its README.

### Dynalist

- **Numbering is the parent's**: Dynalist's list style numbers a parent's children (a CSS counter), and
  the driver set it on each numbered item: every numbered item it loaded showed as a bullet. Loaded as
  the parent's style now; Enter in a numbered list makes a numbered item (13-align's claim otherwise was
  wrong for this reason).
- **A popup that outlived its test**: typing `!` at a word's start opens Dynalist's date picker, a scope
  over the editor's, which `load` never closed: the next test's paste went to the browser (Scenario18
  flipping from run to run, 15 of 30 good; 20 of 20 after `fix_scope_to_editor()`). A title typed into,
  test after test, reset the same way.
- The `markup-` refusals dropped (59 cases run). Dynalist's own: Enter makes the new item before the old
  one; a join keeps the lower item; moves cross parents. **Dynalist's bug**: after an HTML paste of a
  paragraph and a list, the caret lands at the first item's offset in the last (Paste36b).

### WorkFlowy

- **The server's features were off**: numbered lists, dates, slash commands, tables live behind feature
  flags the anonymous demo's settings switch off; `open` enables what the server enables for the user.
- **Numbers read as drawn** (a run's start its first item's), **notes drawn** (a note set by the API
  wasn't, until the item was redrawn), **the container kept by id** (DeleteSubtree6 renamed it), **code
  blocks and quotes read** (they had read as bullets), the `markup-` refusal dropped, **the server's
  clock** answered by the proxy rather than cached: 63 more examples run.
- **WorkFlowy's bugs**: Backspace at a note's start stores a trailing line break; Enter at a code block's
  end stores two; neither shows.

### Tana

Tana Outliner in its UI-test mode (§8), no source but its bundle.

- **The `markup-` refusals dropped** (28 more run) and **two camps declared**, found by
  `--ignore-options` (`headingEditing: block`, `pasteStructuredOnParent: after`).
- **A node has a description**, lines under its name (Alt+I): the driver had refused every block of more
  than one line, "a name is one line". Played by hand, the description is the node's later lines to
  every key (Right and Down into it, Left and Up out, Home to its start, nothing joining it); a block's
  later lines now load and read as it, as WorkFlowy's driver has an item's note: 19 more run.
- **A caret before a to-do's `[ ] `** is the checkbox focused, which the read already knew; `load` now
  focuses it (4 more run).
- Checked three ways (replayed, against the screen, slowly): the rest Tana's. A paste of several lines
  over a selection keeps the selection; Enter inside a to-do makes a plain node.

### SiYuan

SiYuan 3.8.6 on kernels of the driver's own; its source cloned (sparse).

- **Empty paragraphs read where they are**: the read put every empty paragraph of an item into its text
  as a line, so SiYuan's Backspace on an empty item (its blocks into the item above: an empty paragraph
  there, the caret in it) read as `a⏎┃` against ourus's `a┃`: 17 whitespace verdicts that were an extra
  block.
- **Starts it can't hold, declined** (six errors gone): a heading with more lines, a caret in a math
  block or outside a table's cells; two numbered lists side by side loaded apart (by the other
  delimiter); the `markup-fence` refusal dropped.
- **SiYuan's escape in code**: ```` ``` ```` in code is stored as U+200D ```` ``` ````, taken out in the
  read and a caret placed past it (one grapheme with the character before).
- **Free form**, after BlockNote's: paragraphs and headings load as SiYuan's own blocks, lifted beside
  their owner; the read's blocks free but an item's text (87 more run). What that turned up, each the
  harness's: an empty paragraph has no Markdown (written as a zero-width space); a table's caret marker
  changed the converter's padding (the caret placed by cell now); a paragraph's leading escape kept.
- SiYuan's own: an item holds blocks, and Backspace or Delete at its edge moves blocks between items;
  split text is read again as Markdown; plain paste is Markdown flattened; Tab in a paragraph types a
  tab. **SiYuan's bugs**: a plain paste into `[a]: b c` makes a checked task; Shift+Enter before an
  escaped ```` ``` ```` leaves the backticks unescaped, a fence in the export.
- **Its invisible characters**, against ourus's placeholder and RemNote's: U+200D an escape, a doubled
  `\n`, U+200B and U+2060 caret places, `<wbr>` a caret marker; most stored, a `.sy` being the editor's
  tree. None is a placeholder in ourus's sense: ourus needs `◌` because Markdown can't hold an empty node,
  and SiYuan's store is a tree that holds one.

### BlockNote

Its site's minimal example (`@blocknote/core` 0.55.0, Tiptap 3); its source cloned at the tag.

- **Everything went in as a bullet**, and a paragraph read as an item's text: BlockNote's commonest move
  (an item made a paragraph, by Backspace at its start or Enter on an empty one) drew as nothing done;
  the spec's paragraphs and headings were played as bullets, which BlockNote un-lists before it joins
  them; a heading's section was nested under it, so a move carried it (false agreements). The earlier
  session had weighed marking paragraphs on the read alone and kept them unmarked, rightly: one side
  marked makes disagreements where both made one. **Free form**, both sides marked, owned blocks beside
  their owner: 84 more run, 76 without adaptations; each changed verdict read in the app.
- A number kept as text loaded without its `.` (Paste81, an error); two numbered lists side by side,
  declined.
- BlockNote's own, by its source: moves leave a parent at its edge; plain text is pasted as Markdown
  (`plainTextAsMarkdown`); undo groups by 500 ms. **BlockNote's bug**: Shift+Enter keeps a selection, the
  hard break inserted at its head.

### The Obsidian setups

Source mode (OB), Live Preview (LP), with Outliner (OO), with true-outliner (TO), one shared driver.
Each plugin paired with bare Live Preview, example by example: of OO's 385 disagreements 233 came out
exactly as LP's, of TO's 364 155 (the host's, not the plugin's). Three fixes in the shared driver:

- **Indentation as Obsidian writes it**: the driver had loaded every two spaces as a tab and read every
  tab as two spaces, wrong wherever an item's text isn't two columns from its marker (`1. a` / `\t1. b`
  read as two spaces where ourus has three). Now by structure (Tab's and Shift+Enter's own output,
  measured): Indent4 agrees in all four, five more in OB and LP.
- **Tables in Live Preview** (four errors each): a caret there goes into the table's cell editor and
  Obsidian pads the table; declined.
- **A window that loses the system's focus** (the first part's lost focus, one read in 2,500):
  CodeMirror's `hasFocus` wants the window's focus too; the caret is the editor's wherever its content
  has the page's focus now, each such read logged (`.sxs/obsidian/<n>/focus.log`).

The plugins' own, by their sources: **Outliner's bugs**, a blank line in an item's code block cuts its
list, so a move tears the block in two (MoveUp13); the caret lands too far after renumbering shortens
a line (`10.` to `1.`: Enter3c, Enter25, MoveUp15). true-outliner joins nodes of one kind only and keeps
a goal column in pixels.

### SilverBullet

Its demo (2.12.0-50-gb2726cd8), compared as text; its source cloned. Indent and outdent were already
its outline commands (`Ctrl+.` then L, H), not Tab (line indentation). Its shortcuts measured beyond
its Outlines page (a second binding for Move Up and Down, Task: Cycle State only at the `[ ]`, Quote
Selection's key a `>`, a test's shifted `.` being the `Ctrl+.` chord's start). Every verdict group
read: all SilverBullet's (CodeMirror's Markdown, outline commands of limited reach: Home to the line's
first column, moves among siblings only, no quote's `> ` understood, the caret's item only for a
selection, which the user kept as SilverBullet's). No driver change.

### Emacs with markdown-mode

The harness against real keystrokes (`tmux send-keys`, not `execute-kbd-macro`): 659 of 665 the same.
Its 511 disagreements are a text editor's, in line with Obsidian's and SilverBullet's key by key but for
Enter: markdown-mode's RET continues no list (M-RET does). M-RET was tried (504, lists continued, list
items put into code blocks); RET kept, the user's decision.

## 17. Skips

The question: are they real, or steps the harness is missing? By kind, at the end:

- **Options** (some 1,340 across the apps): played with `--ignore-options` for Roam, Athens, RemNote,
  Tana, SiYuan, Dynalist: the declarations mostly hold; camps found undeclared (Athens's, RemNote's,
  Tana's) and one wrong (Tine's), §15.2. The lever left: compare these under the app's values instead of
  skipping them (§24).
- **`free-form`**: right for an app with no paragraphs; checked with ourus as the oracle (each case
  played on the blocks an app is given, against the projected expectation: of 135, 35 the same, each
  read, all belonging), sampled by hand in Dynalist and Tana. Run now where the app has free form
  (BlockNote, SiYuan, RemNote without bullets).
- **Refusals**: dropped where playable (§15.2); a reason with no case behind it (Roam's math, tables) was
  a step the harness lacked.
- **"The app can't hold it"**: checked in the app's UI before believing it. Tana's names are one line,
  but its nodes have descriptions; a caret "in a checkbox" was the checkbox's focus; Roam's deleteSubtree
  had a key.
- **Real**, sampled and played: no key (Athens's moves, SilverBullet's and BlockNote's deleteSubtree
  and duplicateSubtree, RemNote's duplicate); no such block (Tana's quotes and headings
  below H1, Dynalist's callouts); numbering a parent's (a list numbered in part); the projection's own
  (a selection across blocks, a caret on a blank line or in a marker, the document's end).
- **Quotes**, still refused by the projection for every block app (`lib/block.ts`), though RemNote,
  BlockNote and SiYuan have a quote of one paragraph (§23).

## 18. Caret and whitespace verdicts

Read in every app: the apps' own. The caret after a paste (the first pasted block, the last, a code
block's start), after deleting selected blocks, after Up, Down and Home by each app's model (pixels,
markup as text, a line's first column, the next node's start, a checkbox, a placeholder row);
whitespace from splits that trim nothing, a paste's trailing line break dropped, code lines not
carrying indentation. Where one was the harness's, it moved: SiYuan's 17 whitespace verdicts that were
an extra block, RemNote's carets from the text cache, Tana's checkbox caret.

## 19. The deep dive's full reruns, and how they were checked

- **After the deep dive's first five apps**: 15 setups in some 8 minutes, the two RemNote ones stuck
  (the worker that never entered test mode, §15.3), rerun alone on fresh profiles. Against the first
  part's results: agree 3,235 to 3,299, disagree 3,455 to 3,485, skipped 5,813 to 5,709.
- **On the new pools**: 16 setups in 433 s, SiYuan failing at its start (the other container's kernel,
  §15.4); the pools changed no verdict.
- **The four Obsidian setups** together after each fix (some 6 minutes, four instances); two in a row
  after the focus fix, no verdict apart.
- **Two full reruns at the deep dive's end**, all 17 setups (666 s; then, after `.sxs/` was reset to its
  committed state, fresh profiles and SiYuan downloaded again, 528 s), verified example by example: the
  setups whose drivers the last session didn't change (Athens, Dynalist, Emacs, Logseq, both RemNotes,
  Roam, SilverBullet, Tine, WorkFlowy; the Obsidian setups) have the first rerun's verdicts, to the
  example; BlockNote, SiYuan and Tana their last solo runs' numbers, to the verdict. The two reruns'
  totals are the same: two verdicts flipped back (BlockNote's Scenario16; one of WorkFlowy's), and three
  buffers changed but not their verdicts, all undo steps after the deciding step (§15.6).

- **A full rerun after Logseq DB**, all 18 setups at once (657 s, no app failed, no error), against
  the results before it, example by example: two verdicts moved, both `Scenario16`, the undo wobble
  (§15.6: Roam's to caret, WorkFlowy's to agree); six outputs with their verdicts, each a caret:
  Logseq DB's `Paste1` (its paste-focus race), Roam's `Enter51` and WorkFlowy's `Scenario23` (undo), and
  where the caret lands after a paste or a Shift+Enter, Athens's `Paste21`, true-outliner's
  `ShiftEnter18` and Tana's `Paste1`. `npm test`: 944 pass, 0 fail, 1 todo.

## 20. Probing

Each session wrote its own probe in its scratchpad; worth keeping one in `sxs/probe/`:

- **An app of the pool's browsers** (`web.ts`, `APP=<app>`): a headless Chromium of its own on a port of
  its own through the shared proxy (`ensureProxy`), the app opened by its driver's `open`, helpers
  `load(drawn)`, `read()`, `press(...keys)`, `type(text)` (settled, at the runner's pace),
  `clip(text, html?)` (the runner's clipboard), `act(action)`, `shot(name)`, `play(start, ...steps)`.
  Never the pool's windows: a second window of an app in a pool browser changes what a run finds.
- **SiYuan** (`probe.ts` on kernel 9, port 6825: the runs lease kernels from 0), with `dom()` (its block
  tree) and `md()` (its Markdown); `run.ts --stop` stops that kernel too.
- **Obsidian**: a window of a setup in an instance of the pool, kept open, snippets POSTed to it; it holds
  its setup's lock: stop it before a run of that setup.
- **`verify.js`**: a run's examples replayed outside the runner, step by step (`DOMCHECK=1`: the read
  against the page's outline).
- **Scripts**: `dump.py` (an example's start and steps, ourus beside the app), `vcmp.py` (two runs by
  example), `pair.py` (two apps or setups by example), `freeform.ts` (ourus as the oracle for the
  projection), `emkeys.ts` (Emacs's examples as real keystrokes).
- **The first part's**, in `.sxs/probe/` (scratch, never tracked, gone with `.sxs/`'s reset): `rn.ts` and
  `at.ts` ran a snippet against RemNote's and Athens's window (`page`, `cdp`, `shot(name)` in scope),
  `td.ts` against Tana's through its driver (`load(drawn)`, `read()`, `press`, `type`,
  `clip(text, html)`, `shot`); `grep_bundle.py <dir> <regex>` searched an app's cached bundles
  (`.sxs/http/<host>/`), minified lines and all; `allcmp.py` compared every app's `sxs.json` with
  copies. A probe of Athens needs the run's window for the idle script (`window.__ourusApp ===
  'athens'`), and Athens's browser can hold its bundle unpatched (GitHub Pages' `max-age`): `open`
  clears it.

## 21. Logseq DB

Logseq's database version (2.0.2, build `9a10307e`) on its test channel, https://test.logseq.com/
(app.logseq.com the stable one, its banner says): the app with a demo graph (`logseq_db_Demo`) in the
browser's own storage, OPFS, run by a database worker; no login. Its telemetry, Sentry and PostHog, the
proxy answers. `sxs/logseq-db/`, its README the rest.

**One driver for both Logseqs.** Its plugin API is OG's, call for call (the 16 the OG driver uses among
its 145), its shortcut table the same, its editor a textarea per block: what differs is underneath, as
the user expected ("the bulk of changes ... on the backend side"). So `sxs/logseq/driver.ts` became
`logseqDriver(flavor)`, everything shared but a `LogseqFlavor`: how a canonical block is loaded
(`toLogseq`, a `BlockToLoad`: the content, its properties, the text its editor shows, the caret's
prefixes), how one read is written back (`fromLogseq`, from a `BlockAsRead` to a `CanonicalBlock`),
what makes it numbered, the starts it can't hold, its settings. OG's flavor sits beside the factory,
its id LO now (LS before, the user's); `logseq-db/driver.ts` is the DB version's. Where the two do
something otherwise in the page (a recycle bin, properties, a code editor), the shared code takes one
path or the other on `db`. A first worry, a regression: OG's number comes from a block's stored
content (its hidden property line), and the shared read had put the editor's text in its place before
asking; kept apart (`stored`). OG's full run on the shared driver: its committed verdicts and outputs,
to the example, once a second regression was out (below).

**How a block is held.** The DB version keeps markup as properties of the block, as its editor makes
them: typing `1. ` numbers a block (the editor takes the `1. ` away), `## ` makes a heading on save,
```` ``` ```` a code block at once; a task is Ctrl+Enter, its status cycling Todo, Doing, Done, none
(typing `TODO ` makes none). Loaded so: the text inserted, then `upsert_block_property` with the
built-in idents (`logseq.property/status`, its value by its title, `Todo`: by its ident the worker
fails; `order-list-type` `number`; `heading`), which qualified names the API takes as they are. A code
or math block is inserted as written, which Logseq turns into one (`standalone-display-block`), and
its text set again after (the insert drops a line's leading whitespace, and Logseq trims the code's
start). Read: the properties written back as markup, a status by its value's ident (a
`datascript_query`), a code block with ```` ``` ```` and its language, a math block with `$$`.

**Its noise, found and fixed.** The first full run: 248 / 22 / 18 / 42 / 9 / 448; the third,
and every one since: 267 / 12 / 19 / 37 / 0 / 452.

- **Undo took back the load**, three undos emptying the page: the history is the worker's, per graph,
  and takes every transaction. The app can empty it (`clear-history!`, which only its developer panel
  calls); `logseq-db/proxy.ts` names it, found by the main thread's call into the worker that tolerates a
  worker not yet up ("db-worker has not been initialized"), the `:thread-api/undo-redo-clear-history`
  keyword, and the developer panel's own call for the argument list (`Uac(sSd, $APP.A([repo], 0))` in
  this build). Measured: after the clear, a typed `x` and three undos took back the `x` alone.
- **A page shown empty gets a block of its own**: the page is made without the redirect, filled, then
  shown (`push_state`).
- **Deleting a page puts it in a recycle bin**, which `get_all_pages` still lists: 15 test pages piled
  up before the driver emptied the bin after each (`delete_recycled_page_permanently`).
- **A caret in a code block was never read**: CodeMirror's, and Logseq has no block being edited while
  it has the focus (`check_editing` false). Eight errors at the load; the load and the read now take the
  focused CodeMirror's block.
- **The emulated document start went into the page's title**, which is editable (`Scenario5`, `9`, `12`:
  moves doing nothing after it): one Down brings it back.
- **Code lost its lines' indentation** on load, and **math blocks weren't read** (a pasted `$$` block read
  as its math alone): both as code blocks are now.
- **Settling ended inside the worker's work**: a paste waits on two or three requests of the worker,
  some 50 ms, with no timer or DOM change to show it, before Logseq renders and focuses what it made;
  the DB flavor's init script counts the requests in flight (Comlink's, by the `id` an answer echoes),
  and Logseq is busy while any is.
- **A focused code block never settled**: CodeMirror 5 polls its input every 100 ms while focused, a
  timer always pending, so such examples ran to the settle's timeout (5 to 10 s each); its poll set to
  an hour, a run took 41 s where it had taken some 60.
- **Undo read busy for good**: undo and redo set `editor/op` and nothing clears it, so after one,
  settling gave up a second later as stuck (eleven reports a run); `undo` and `redo` left there count
  as idle now (`staleOps`), the undo's work being the worker's request.

**Logseq DB's own.** Paired with OG example by example, most came out the same; of the rest:

- **A pasted HTML list nests each item under the one before** where its items have line breaks between
  them (`<ul>\n<li>x</li>\n<li>y</li>\n</ul>`, commonmark's rendering, as a copy of a rendered page
  carries it); without them, siblings, as OG pastes either. Ten of the pastes apart agree played with
  the text alone (`--plain-clipboard`).
- **Logical outdenting does nothing**, a bug of the worker's port to OCaml. The setting read back true
  through the plugin API's getter, the official setter, and the very keyword the editor reads
  (`$APP.Ws()`, Logseq's `get-config`), and the editor passes it with the outdent; every outdent stayed
  direct. The worker does the outdent, and this build's is OCaml compiled to JavaScript by Melange (an
  OCaml-to-JS compiler: `MelangeError`s, `Outliner_op.Missing_parent_original`), its source
  `deps/db-worker/lib/`. Its outliner honors the option (`outliner_core.ml`, `indent_outdent_blocks
  ?logical_outdenting`); the op that calls it passes `?parent_original` and never `~logical_outdenting`
  (`outliner_op.ml`, the `"indent-outdent-blocks"` case and the sync's), so it defaults to off, where
  the ClojureScript original passes the options whole. The user doubted it ("you sure this got
  broken??"): the built bundle had only said what wasn't there; the OCaml source said where it is
  dropped. So the DB flavor has no setting, `outdent: direct` declared, the logical examples skipped.
- **Up from the first block goes into the page's title** (`CursorUp1`).
- **Shift+Enter in a code block makes a new block** (its key handler's "create new block": `Fence8`),
  **Ctrl+Shift+V there pastes nothing** (`Paste22`), **Enter in a math block a new block** (`Fence42`).
- **A pasted code block goes after the item, not under it, and an HTML one loses its language**
  (`Paste1`, `Paste66`, `Scenario18`); a heading and the text after it come apart by two blank lines.
- **A pasted code block gets its editor's focus only sometimes**: Logseq focuses its CodeMirror on an
  event, only if the editor has mounted by then, and never again (`handler/events.cljs`,
  `:editor/focus-code-editor`). Of ten pastes, five left nothing focused, all ten with the CPU slowed
  six times; then what is typed goes nowhere. `Paste1`, `Paste25` and `Scenario18` come out otherwise
  from run to run, and stay so: the app's race.
- **A paste into a numbered block keeps its number**, which OG loses (its bug 7).
- **Only ```` ``` ```` makes a code block**, measured (the user asked): `~~~` and a longer fence around
  code with ```` ``` ```` in it stay text, and ```` ````js ```` gets the language `` `js ``; nor can the
  API give a block the code display type (`upsert_block_property` fails validation). Other fences are
  declined, the reason in a comment by the pattern pointing to `standalone-display-block`.
- **A split-off `# def` becomes a heading on save** (`Enter9`, `TaskEnter3`), as SiYuan's: the
  projection's first-line escape (§23).

**Declarations, measured** (`--ignore-options`, both Logseqs). Every example skipped for a declared
value disagrees played, and so does every one for a camp not declared, but one: Backspace at the first
block's start does nothing in either (`backspaceAtTopItem: refuse`, `backspace.md › Backspace34`
agreeing; `src/config.ts` and the spec had Logseq in that camp already), now declared, which skips
`Backspace26` instead, alike in both camps as blocks (§23): the counts the same. `enterAtTextStart:
stay`'s examples come out caret verdicts (the empty block above alike, the caret in it): both are
`into`, its own examples agreeing. The DB version's one agreement with `pasteStructuredParagraphList:
children` is the HTML's: with the text alone, it disagrees.

**OG's caret verdicts the DB version agrees on**, nine, read: OG's own, the same editor holding other
text. OG's holds the markup as text (`TODO task`, `## Title`), so Home, and Up into a heading, land
before it (`CursorHome8` to `10`, `CursorUp2`), and a pasted code block is text, the caret after its
closing fence (`Paste9`, `11`, `52`, `74`); Down on the last block is the browser's textarea's, to the
line's end (`CursorDown1`). The DB version's editor holds the text alone. No driver change.

**Also on the way.** The pool's Chromium profiles, from before the container was recreated, were
broken: Chromium reset their quota database, and OG hung on its welcome screen at "Loading…" (its
graph never restored) while a fresh browser loaded it; moved aside, not deleted, and the runs went on
fresh profiles. The clones directory of §26 was gone with the container; Logseq's source is cloned
anew there (`logseq-db`). The probing was a Chromium of its own with a fresh profile through the proxy,
snippets posted to a port (§20).

## 22. Wrong turns

- **`pkill -f`**, four times in the first part and once in the deep dive, its pattern in its own
  shell's command line: a peak-task monitor's matched the background job's own shell and killed it
  (exit 144; the run's processes lived on); one for CPU-burning loops killed the shell that was to
  restore a run's data after them (done by hand after); a `pgrep -f` for Obsidian's processes, fed to
  `kill -<pid>`, killed the shell that ran it. Kill by pid, a pattern with a bracket (`[s]xs/run.ts`),
  or a script of its own.
- **Orphans after a clean of `.sxs/`**: the user's resets deleted the pool's pid and port files with
  the directories, so `--stop` found nothing, and the browsers, Obsidians, kernels and proxy of the last
  run ran on (some 1,400 tasks once); stopped by their pids. `run.ts --stop` before cleaning.
- **A scheduler on live task counts**, proposed to replace the budget: the user didn't want it ("no
  fucking tasks watching crap"); the pools, fixed, are the limit instead (§11).
- **A test run's results over the last run's**: `run.ts siyuan indent.md --no-report` wrote
  `.sxs/siyuan/sxs.md`, `sxs.json` (the last run, any run: `--no-report` only skips the copy into
  `sxs/`) and `indent.json`; the user's staged versions were written back (`git show :<path>`, the
  submodule's git directory read-only here); the same after the Obsidian and pool tests. In the deep
  dive too: a slow run without selectors is a full run, and `--no-report` spares only
  `sxs/<app>.md`, not `.sxs/results/`; copy `.sxs/results/` aside before any run that isn't
  the one. Twice restored from `.sxs`'s commit (`git show HEAD:<file> > <file>`).
- **A context-wide init script on a shared app**: Playwright applies `context.addInitScript` to every
  open page, and another run's window closing during it failed a setup's start; the trust flag is set
  from the starter window instead (§11).
- **"A setup's vault takes effect as Obsidian starts"** (§11, the first Obsidian workers): untrue, as
  the user's question showed: one Obsidian runs many vaults. Workers as Obsidians of their own cost some
  105 tasks each where a window costs 25.
- **Asking for a credential the app didn't need.** The curl was read for a cookie; RemNote's session is
  a token, and its guest mode needs none. List an app's routes signed out before asking anyone for a
  session.
- **A probe's state left behind**: RemNote's tab, whose `/database_error` loop looked like the driver's
  writes breaking its database; in the deep dive, Roam's Settings dialog swallowing the next probe's
  keys, a probe at 780 pixels measuring Dynalist's phone layout, a drawing (`¶ ┃`) loaded as Markdown.
- **A comparison script** that missed the report's `## Adapted: …` headings saw four verdicts flip that
  hadn't.
- **The projection fix's first condition** was any item with no head and children (16 examples); the
  bug is a list on the marker's own line (2).
- **The signed-out session cached** by a probe of Tana, which would have kept Tana signed out with any
  cookie.
- **`elapsed_s`** went through the latest run's time, the longest, the latest full run's, before the
  user's rule: a regeneration doesn't change it.
- **Smooth animations** blamed for the slow settle; they were off.
- **Emulations that trusted the caret.** RemNote's document's start and end were copied from Logseq's
  (Up until the caret stops), where a title and a selection of blocks both leave no caret to compare.
- **A help page taken for the keymap.** Athens's help table (in the bundle) has no selection keys; its
  source (`listeners.cljs`) has Shift+Up selecting a block and Backspace deleting the selected, which
  plays `deleteSubtree`. Read the source where there is one.
- **Waiting out a delay before removing it.** Athens's save delay was first counted into settling (2 s
  more for every test that edits text); the user's suggestion, patching the delay to 0 in the bundle,
  gave the same verdicts, all 276, in half the time.
- **A credential parser written from the formats seen**: the user's curls used `'...'`; Chrome also
  writes `$'...'`, and a quote can sit inside either.
- **Telemetry sent before it was answered.** The first probes of Tana Outliner sent about ten Sentry
  reports and an OpenTelemetry trace to Tana live, before its proxy rules answered them; read a new
  host's traffic in the proxy's log before probing more.
- **Two sessions on the wrong Tana.** The driver and the login wall were both for home.tana.inc;
  nobody had asked which Tana is the outliner. Its own site says so in a sentence.
- **Probes with curl**, where the user wanted the headless browser: an app's shell says nothing of its
  routes, and the browser shows what loads.
- **A driver run on the first idea of an app's keys**: Tana's Home looked like any Home until the
  emulation ended in a title; read the app's handler where a key can mean more than one thing.
- **"Pasted at the end" taken for the focus state**: the load, a click and keys all gave the same; the
  app's importer did it.
- **Pace and pool blamed for Roam's undo**: run again, it changed at the same pace. Repeat before
  attributing.
- **A browser's cost guessed**: 50 tasks a window, before measuring 20; flags that would make it
  "lighter" measured at 13%.
- **A debounce patched as if it were timing.** Athens's save delay changed no verdict when patched;
  WorkFlowy's, patched the same way, changed how it groups undo. Look at what a delay groups before
  shortening it.
- **A lock made for one process a run.** `takeLock` linked into place a file named for the process; a
  run's two Obsidian workers, one process, shared it, and one's release removed the other's: three
  setups failed at once. Each call's own file now (`<name>-<pid>-<n>.lock`).
- **An estimate taken for a plan.** The scheduler sized workers from solo runs' times; under load every
  app ran two to three times slower, and a one-example run's startup read as minutes a run. Dropped.
- **Editing a driver while its app's run read it**: a run loads its driver once, but `run.ts all`
  started later apps after editing would have mixed code; edits waited.
- **A shared change unguarded**: the numbered drawing read numbers for every app at first; compare old
  and new code on every stored state before calling a shared change safe.
- **The first theory about a flake**: Dynalist's Scenario19 blamed on the idle script was the date
  picker left open; WorkFlowy's hang, four theories before the browsers' logs named two processes;
  Tine's Enter2 blamed on the bundle's age was the facets.
- **The screen not looked at**: two drivers read numbered lists their apps didn't show (Dynalist's by
  the wrong node, WorkFlowy's behind a switched-off feature). A screenshot per kind of block, once.
- **Reading code before playing it**: Outliner's merge read as "never joins items with text" until a
  probe joined them (`isEmpty()` means no children).
- **A synthetic key isn't a keyboard's**: Playwright's `Control+Shift+.` sends `.`, which SilverBullet
  took for its `Ctrl+.` chord, and the next key went into it.
- **`--cache=refresh` on a reused window** refreshes nothing; `--fresh` with it.
- **The setting read back, so it was set**: Logseq DB's logical outdenting, true to every reader, did
  nothing. The source said it is honored; the build runs another worker. Where the behavior and the
  source disagree, read the built bundle that runs, the worker's too, and the source it was built from,
  before calling a feature broken.
- **A restriction not measured**: the DB flavor took ```` ``` ```` fences alone for Logseq's limit before
  trying a longer one; the user asked, and the measurement agreed.
- **A fix for one flavor in shared code**: the step back from the DB version's page title, on the caret
  going, also stopped Shift's selection of blocks from growing, for both Logseqs (OG's `Placeholder16`
  selected a block fewer, its verdict the same); found by OG's full run against its record, output by
  output.
- **Old profiles taken for the app**: OG's welcome screen stuck at "Loading…" looked like a changed demo;
  a fresh browser on the same proxy loaded it, and the pool's profile was the one broken.
- **A method sent as a script**: the DB flavor's init script was a method, and Playwright, which sends a
  function's source text to the page, ran nothing; the run looked as before, its noise unchanged. Found
  by running the driver's own `open` in a browser of its own and looking in the page.

## 23. Still open

- **The clipboard's policy** (§15.5): the HTML beside the Markdown, the text alone (a copy out of a
  Markdown source, as out of ourus), or both reported; 12 of Tana's verdicts depend on it, and about ten
  of Logseq DB's (its HTML list bug, §21).
- **Compare under the app's values** instead of skipping option-dependent cases (§24), and the rest
  carried over from [`13-align.md`](13-align.md) §15 and §16: paste as a move, the decisions listed there.
- **Quotes for block apps**: a projection option for apps that hold a one-paragraph quote as a block
  (RemNote's `setIsQuote`, BlockNote's `quote`, SiYuan's), and the drivers' mapping; the cases without
  `quote-container` (§6).
- **A block's first-line escape**: the projection drops it (`\# def` is the block text `# def`), so a
  paragraph `# def` and a heading read alike: SiYuan's Enter9 and TaskEnter3 are `caret` where they
  disagree, and Tana's read can't tell a name `# h` from a section.
- **Escapes ourus keeps** where text came before them (`revise 2\. draft`: Scenario23, Tana's and the
  block apps', §10): compare as rendered, or ourus drops them.
- **ShiftEnter21** (§10): every app keeps the space after a Shift+Enter break; ourus drops it. The spec's
  call.
- **Roam's code blocks** (26 examples; a CodeMirror 6 editor in the block).
- **The pool across containers** (§15.4).
- **Undo and saves under load**: Scenario16 (§15.6), and undo verdicts that depend on the pace. Saves
  later than settling are measured for Athens (2 s, patched to 0), Logseq (500 ms), WorkFlowy (500 ms)
  and Roam (some 600 ms), each within the undo pause; not for the others.
- **Tine's numbering under load** (§10): Paste16, renumbering after settling.
- **Tana's paste and type** (Scenario18): Ctrl+V then `!` in one step, the `!` landing before or after
  Tana's paste finished, from run to run.
- **The container's margin**: the full pools sat some 50 tasks under the cap (§11); a larger cap
  (`--pids-limit`) would let them grow.
- **The 36 untagged cases** ourus plays otherwise on blocks than the projected expectation: `free-form`
  candidates, or the projection's.
- **Athens's moves**: a sibling swap could be emulated, labeled so; the edge cases not.
- **Obsidian**: the caret after a marker's space is a guess the text can't settle (OO's Enter3); what
  takes a window's focus under load (`focus.log`); Live Preview's tables through the cell editor;
  Outliner's blank lines in code.
- **WorkFlowy's skips** beyond the `markup-` tags (tables, its `divider`), and its option skips.
- **RemNote** could clear its own broken database at `open` (`Storage.clearDataForOrigin`); the heatmap
  compares RN's `¶` blocks with other block apps' items, so it looks less like them than it is.
- **The same helpers seven times** (`toItem`/`fromItem` in Logseq's, Tine's, Roam's, WorkFlowy's,
  Dynalist's, RemNote's and Tana's drivers): one module, each driver saying what its app holds as
  attributes.
- **Emulated document ends**: Logseq's, Roam's and Tine's stop on two equal carets, as RemNote's did
  (§13).
- The proxy's tally of a run counts other apps' windows talking in its browsers (fewer since windows
  close at a run's end).
- home.tana.inc's editor: the same component as the outliner's? (the user: later).
- **Options as blocks skip too much**: an example is skipped for the app's value where, as blocks, both
  camps leave it alike (`backspace.md › Backspace26`, for `backspaceAtTopItem: refuse`).
- **Logseq DB**: its paste-focus race (§21) leaves three examples varying from run to run; code or
  math whose text starts or ends with whitespace, declined (Logseq trims it on
  insert and update; typed into the editor, it may hold); its options measured against its own camps
  (`--ignore-options`), not yet; the property keys of its other shortcuts (`p t`, `p s`, ...) not
  measured; the test channel moves (a report names its build), and app.logseq.com, the stable one, could
  be a setup too.
- **`sxs/obsidian/obsidian.ts`** fails the typecheck (`findLast`, the project's `lib`), at runtime fine.

## 24. Next steps

1. **Compare under the app's values**: the expected buffers from ourus played with the app's declared
   values (`drawnSteps(test, flavor, config)`), the example marked so in the report: some 1,340 skips
   would become comparisons.
2. **Decide the clipboard's policy**, then rerun the apps that read HTML.
3. **Quotes** for the block apps that have one, then their cases (some 100 per app).
4. **The escapes** (§23), then Roam's code blocks.
5. **The shared helpers** as one module, and the emulated document ends of Logseq, Roam and Tine.
6. **Shortcuts ourus doesn't have**, now tabled in each outliner's README ("Other shortcuts"): a task
   toggled (Ctrl+L, Ctrl+Enter), fold and unfold, Ctrl+A by structure, zoom; spec cases first, where an
   outliner would want them.
7. The rest of §23.

## 25. Insights

On reaching an app:

- **Look for the app's own test hooks**: they ship with it, twice now. RemNote's mode, fixtures, flush
  and waits of its own Playwright tests made the driver its tests' twin rather than our guess; Tana has
  `/tests` and `bootTest`. Search a bundle for `test`, `playwright`, `e2e` before anything else.
- **"Behind a login" may not be.** An app's routes, opened signed out, can hold a guest mode as full as
  the signed-in app; check before asking anyone for a session.
- **A credential is whatever the app reads.** RemNote's is a localStorage token, Tana's a cookie; the
  curl of a page said nothing about either. The session endpoint, or the code that redirects to sign-in,
  says.
- **Ask which product.** A company's name can be two apps; the one behind a login was the wrong one, and
  the right one had a test mode.
- **Patch by meaning, not by name.** Athens's bundle has every name shortened; the patch finds each
  thing by Athens's own code around it (a tracing span's string, a settings read, a constructor's
  shape), and says so when it finds nothing: robust to a rebuild, loud when it isn't.
- **Fix the app's default rather than wait it out**, when the default is timing, not behavior: Athens's
  save delay patched to 0 gave the same verdicts in half the time.

- **A familiar API over another app**: Logseq DB's plugin API is OG's call for call, its storage and
  its worker not; the same call can mean other storage (a property, not text), and a setting can be
  dropped underneath.

On what the harness hands an app and reads back:

- **What a driver hands an app must be what the app's own pipeline would make.** Logseq's editor shows
  a block without its hidden properties; Tine's backend ships facets; WorkFlowy draws a note only when
  its item is drawn. A load that skips the app's own step leaves it believing what no user's app
  believes.
- **Load what the app's own users have.** A heading's section nested under it is the outline's view;
  BlockNote's and RemNote's users have sibling blocks, and moves and conversions behave by what is there.
- **An adaptation can be the noise.** BlockNote's paragraphs played as bullets compared ourus's
  paragraph behavior with BlockNote's list behavior. Mark both sides (free form) or neither.
- **Give the app what ourus reads.** A clipboard rendered by another reading than ourus's is another
  test; render from ourus's own code.
- **State leaks between tests through the app's UI**: a popup's scope, a title typed into, an undo
  history holding the load. `load` resets what the last test could open.
- **Read a tree in its order**, not by kind: SiYuan's empty paragraphs read with the item's text made
  extra blocks look like line breaks.
- **Translate by meaning, not by characters**: "two spaces a tab" was right for `- ` lists only; what
  the app writes, key by key, is the translation.
- **State lives where its owner lives**: ids for entities in a page that outlives runs are counted in
  the page (a counter in the runner reset under a graph that hadn't); a driver's knowledge of the test
  it is on is the page's (a module's variable is one test at a time, which workers made visible).
- **Regenerating is judging, not running.** It changes verdicts the spec changed, nothing a run measured.
- **A failure of the machine is no verdict.** A crashed tab is a stopped run, never an app's errors.
- **Errors at the load are the driver's to explain**: each of SiYuan's six was a start it can't hold or
  can't be given, none the app's behavior.

On timing:

- **A settle has a horizon.** "Idle" meant no timer shorter than 300 ms; an app that saves later reads
  stale with nothing pending. A verdict that depends on a block the caret left is suspect until the
  app's save timing is known.
- **A pace is a parameter.** Apps tell undo steps apart by time; a runner that types as fast as the page
  settles chose a pace without knowing it, and one machine's.
- **A delay can be behavior.** A debounced save groups what it saves, and an app's undo may be its
  groups: a word typed is one store, one undo. Shorten it and the app changes; wait it out and it
  doesn't.
- **Read the app's timers.** Logseq's auto-save, 500 ms after the last input, was the undo class's
  cause in Logseq; a fixed pause can't outwait a timer that load makes late, a wait for the timer can.
- **Load finds timing.** Runs side by side, 12 workers at once, turned up an undo that depends on the
  machine's speed, which runs one at a time hid: parallel runs are a test of the harness's timing too.
- **The Clipboard API is fragile where the paste event isn't.** A paste that reads the clipboard
  itself wants its window focused and active, and its permission granted; in a shared browser with
  windows and runs coming and going, it can read nothing. A key that pastes through the paste event
  takes what the browser hands it.
- **A verdict that flips with the workers' order is a leak**, before it is timing.

On the machine:

- **Count what the limit counts.** The cap was tasks, not processes or memory; a browser's threads were
  most of it, a page's renderer the rest, its window nothing.
- **Size the pools, not the run.** A run's budget of workers guessed at what fit and left the machine a
  quarter busy; pools of a fixed size, measured full under the cap, use all of it and say what they
  cost. Measure the full pool, not a worker.
- **What DevTools grants is the connection's**: a viewport, permissions, gone when the connection that
  set them ends, for every page of the browser: in a browser shared by runs, one run's end is another's
  revoked clipboard, and a reused window ran at 780 pixels.
- **A shared app's context is shared.** A context-wide init script in an app other runs drive at the
  same time races their windows; what a run sets in a shared browser or app, it sets per page.
- **Shared disk, separate machines**: every "is it running?" check must be one both can see.
- **Measure before redesigning.** Windows against tabs, flags against threads: each measured in a
  throwaway browser in a minute, and each changed the plan.
- **Check a premise before paying for it.** "A setup's vault takes effect as Obsidian starts" bought an
  Obsidian per worker; one look at `main.js` showed one Obsidian runs many vaults, a window each.
- **The full mix finds what pairs don't.** Logseq's plain paste failed only with all 16 apps at once:
  neither six pasting apps, nor every CPU busy, reproduced it.

On checking:

- **Every app disagreeing is the harness's first.** Backspace41 disagreed or erred in every block app;
  the projection had doubled its text.
- **An original example is trusted most, and checked least.** A projection with no note passes as
  exact; the bug hid there.
- **Every skip reason is a claim to check**, and "the app can't hold it" a claim about its UI: press the
  keys by hand.
- **A missing key is a finding.** Athens moves blocks only by dragging; playing a drag would choose
  the drop, which is what a move is tested for. Skipping says what Athens offers; emulating would say
  what we chose.
- **Refusals are policy, skips are facts.**
- **Measure declarations, both ways**: an undeclared camp makes explained differences into
  disagreements, a wrong one skips what the app would agree on; a camp can depend on the case's shape.
- **Look at the screen, not only the model**, and read the browser's own log when a page hangs below
  the app.
- **Compare an app with its peer**: a clone with its original (Tine, Logseq), a plugin with its host
  (Outliner, Obsidian), a count with the counts of its kind (Emacs among the text editors).
- **Old agreements can be the bug, or a coincidence**: fixing Tine's facets and Logseq's editor turned
  agreements into disagreements their sources predict; TO's mixed indentation agreed by accident.
- **Check the harness against real input once**: Emacs's keystrokes, the replays outside the runner.
- **What an app is given decides what it does.** Tana's paste has five paths for one text, by the
  clipboard's formats; a report on paste means little without the formats given.
- **Instrument where the theories run out.** Two plausible causes measured false; a log of the page's
  own clipboard calls in the failing run named the third in one try.
- **ourus is an oracle for its own projection**: played on the blocks an app is given, it says whether
  a projected expectation is what it would do there.
- **Compare meanings, not drawings**; **log what a tolerance saves** (Obsidian's `focus.log`); **leave
  the app as you found it.**

- **Read the build that runs.** The source first read is not always what is deployed: Logseq DB's worker
  was ClojureScript there, OCaml in the build, and only the OCaml said why a setting did nothing.
- **A shared driver's first app is its test**: after a change to shared code, that app's full run
  against its record, to the output, finds what the new app's own results can't.

On placeholders:

- **A placeholder is a Markdown store's need.** ourus needs `◌` because Markdown can't hold an empty
  node; RemNote's U+FEFF and SiYuan's invisible characters are caret places and an escape, and SiYuan's
  are stored: check the store, not only the DOM, before calling a character scaffolding.

## 26. Handover

What the next session needs, beyond `sxs/README.md` and each app's README.

**The next session**: §24's steps, comparing under the app's values first. The reports in `sxs/` are the
last full rerun's (18 setups, §19), a clean baseline, and `.sxs/results/` has their data.

**The tree**: the session's work goes in as one commit with this note, and `.sxs`'s results as one of
its own (the user squashes the session's commits in both). What changed, by place:

- New setups: `sxs/remnote/` (RN, documents without bullets; the driver a factory), `sxs/remnote-bl/`
  (RB), `sxs/athens/`, `sxs/tana/` (Tana Outliner's test mode), `sxs/logseq-db/` (LD: Logseq's
  flavor for its database version), each with its README and proxy rules; `sxs/logseq/driver.ts` the
  driver of both Logseqs (`logseqDriver`, `LogseqFlavor`).
- `sxs/lib/`: `block.ts` (was `outline.ts`: `Block.free`, numbered blocks drawn as the apps show them,
  `liftOwned`, `ownBlocks`), `browser.ts` (the pool: `BROWSERS`, `WINDOWS`), `records.ts` (pids, ports
  and locks in `/run/ourus-sxs/<id>/`), `idle.ts` (timers up to 5 s tracked, `drain`), `plan.ts` (options
  as blocks), `driver.ts` (`id`, `scope`, `login`, `pool`, `browsers`, `freeForm`), `clipboard.ts`
  (`clipboardSource`), `login.ts`, `desktop.ts` (a detached Xvfb).
- `sxs/run.ts`: workers, the pace and the undo pause, `.partial` files, results in `.sxs/results/`,
  `--ignore-options`, `--plain-clipboard`, `--report`, every app when none is given; `sxs/proxy.ts`:
  cache modes, `--host`, the greeting.
- `sxs/siyuan/kernel.ts` (a kernel per worker), `sxs/obsidian/obsidian.ts` (the pool of Obsidians,
  indentation, tables, focus), and every other driver.
- `spec/`: the `quote-container` tag; `src/config.ts`: the apps named in each option's camps;
  `src/commands/paste.ts`: `clipboardSource` taken out, no change in behavior.
- `.sxs/`: `results/`, the cache's new hosts, `chromium/<n>/` (the pool's profiles, ignored),
  `siyuan/<n>/` and `obsidian/<n>/` (kernels and instances).

**Working with it:**

- `node sxs/run.ts <app> <file>#<anchor>` for a few examples (`.partial` files; the full run's are left
  as they were); `--ignore-options` to play option skips; `--plain-clipboard` for the text alone;
  `--slow=MS` to rule timing out (with selectors: without, it is a full run); `--pace=MS` to see an app's
  timing; `--cache=offline` where the cache holds the app, `use` for Roam. A report's version comes from
  the window a run reused: after a driver changes what `open` returns, `--fresh` once (and with
  `--cache=refresh`, which refreshes nothing in a reused window).
- `node sxs/run.ts --report` (no app: every app) rebuilds every report and the table from the runs' data
  in seconds, each report's frontmatter (version, command, time) kept; after rerunning a few examples or
  changing the tables' layout, never while an app's run is going. A run of every app with one failing
  doesn't copy the table into `sxs/`.
- `--workers=N` for one app: by default one per 30 examples, at most one per browser of the pool (six),
  or a driver's `parallel`; `run.ts all` starts every app at once, each worker joining as its pool has
  room.
- Before a full run that matters: no other container on `.sxs/`'s pool; `run.ts --stop` and no probe
  left (each probe's Chromium is its own, detached: stop it by pid); copy `.sxs/results/` aside. `run.ts
  --stop` also before measuring the container's tasks (`/sys/fs/cgroup/pids.current`: idle windows
  count) and before cleaning `.sxs/`.
- The pools: `ls .sxs/chromium/`; records of what runs (pids, ports, locks) in `/run/ourus-sxs/<id>/`
  (`lib/records.ts`), so cleaning `.sxs/` orphans nothing. Sizes: `BROWSERS`, `WINDOWS`
  (`lib/browser.ts`), `OURUS_SXS_OBSIDIANS` (`obsidian/obsidian.ts`: 4, or 2 beside Chromium's apps).
- After a driver change, list what it moves before running (`adapt` from `lib/plan.ts` with the old
  driver and the new); before a change to shared drawing or reading, old against new on every stored
  state (`.sxs/results/*/sxs.json`). Two runs' verdicts are compared keyed by an example's name and line
  (some files share a name).
- Editing `sxs/proxy.ts` while a run goes is safe, but a run started then restarts the shared proxy
  under the first: wait. App rules (`<app>/proxy.ts`) reload by themselves. A patch of an app's bundle
  names what it needs by the app's own code around it, and `open` reloads with the cache cleared when
  the names aren't there (Athens, Logseq, Tine).
- One RemNote window per browser (two break each other through `/database_error`); broken RemNote
  profiles: delete `.sxs/chromium/` with the pool stopped. A SiYuan workspace whose `.lock` another
  container's kernel holds makes every kernel exit 24: delete `.sxs/siyuan/` (the release downloads
  again, 250 MB).
- Sources cloned in `/home/ivan/src/clones/` (gone with the container's recreation but `logseq-db`,
  Logseq's: clone again as needed): Logseq OG, Tine and Athens (`--depth 1`), SiYuan
  (v3.8.6, sparse: `app/src`, `kernel/model`, `kernel/api`), BlockNote (tag `v0.55.0`), SilverBullet
  (deepened to the demo's `b2726cd8`), obsidian-outliner (4.10.2), obsidian-true-outliner (0.14.4).
  Roam's, RemNote's, Dynalist's, WorkFlowy's and Tana's bundles are in `.sxs/http/<host>/`.
- The pool's Chromium profiles from before the container's recreation, broken, were moved aside
  (`chromium-old` in that session's scratchpad), not deleted: nothing needs them.
- Probes: §20.
