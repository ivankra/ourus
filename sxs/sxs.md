---
type: "SxS"
command: "node sxs/run.ts all"
elapsed_s: 614
---

# Every app side by side

Each test case of the spec, run in each app and compared with ourus (the [legend](#legend) is above
the test cases). An app's report (its name above its column) has the outcomes and the reasons for its skips.

## Summary

|  | model | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [logseq](logseq/sxs.md) | block | 272 | 18 | 21 | 32 |  | 444 | **787** |
| [tine](tine/sxs.md) | block | 249 | 16 | 37 | 39 |  | 446 | **787** |
| [dynalist](dynalist/sxs.md) | block | 233 | 5 | 31 | 79 |  | 439 | **787** |
| [siyuan](siyuan/sxs.md) | block | 219 | 8 | 37 | 85 | 8 | 430 | **787** |
| [roam](roam/sxs.md) | block | 204 | 25 | 30 | 35 |  | 493 | **787** |
| [workflowy](workflowy/sxs.md) | block | 195 | 10 | 13 | 78 |  | 491 | **787** |
| [obsidian-true-outliner](obsidian-true-outliner/sxs.md) | text | 193 | 65 | 21 | 364 | 4 | 140 | **787** |
| [obsidian-outliner](obsidian-outliner/sxs.md) | text | 191 | 16 | 26 | 385 | 4 | 165 | **787** |
| [blocknote](blocknote/sxs.md) | block | 174 | 7 | 42 | 131 | 2 | 431 | **787** |
| [silverbullet](silverbullet/sxs.md) | text | 161 | 32 | 26 | 441 |  | 127 | **787** |
| [obsidian](obsidian/sxs.md) | text | 137 | 18 | 33 | 463 |  | 136 | **787** |
| [obsidian-lp](obsidian-lp/sxs.md) | text | 137 | 17 | 33 | 456 | 4 | 140 | **787** |
| [emacs-markdown](emacs-markdown/sxs.md) | text | 104 | 41 | 22 | 511 |  | 109 | **787** |

## By spec file

Each spec file's examples, the apps' runs of them, the disagreements among those runs (and their share), the block apps' disagreements among them, and each app's (blank: it ran none there); the most disagreements first.

| spec file | examples | runs | disagree | block apps | logseq | tine | dynalist | siyuan | roam | workflowy | TO | outliner | blocknote | silverbullet | obsidian | lp | emacs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| [paste.md](../spec/paste.md) | 107 | 793 | 558 (70%) | 164 | 10 | 14 | 45 | 27 | 10 | 24 | 53 | 67 | 34 | 69 | 68 | 67 | 70 |
| [quotes.md](../spec/quotes.md) | 90 | 473 | 391 (83%) |  |  |  |  |  |  |  | 64 | 62 |  | 71 | 57 | 57 | 80 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 67 | 668 | 307 (46%) | 72 | 9 | 8 | 9 | 9 | 9 | 15 | 27 | 34 | 13 | 38 | 46 | 45 | 45 |
| [backspace.md](../spec/backspace.md) | 65 | 516 | 294 (57%) | 50 | 2 | 2 | 2 | 13 | 2 | 7 | 34 | 33 | 22 | 42 | 45 | 45 | 45 |
| [enter.md](../spec/enter.md) | 59 | 513 | 267 (52%) | 51 | 1 | 6 | 7 | 11 | 5 | 6 | 30 | 30 | 15 | 39 | 35 | 33 | 49 |
| [fences.md](../spec/fences.md) | 51 | 333 | 202 (61%) | 8 | 1 | 0 | 5 | 0 |  |  | 32 | 26 | 2 | 34 | 34 | 34 | 34 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 37 | 359 | 166 (46%) | 17 | 1 | 1 | 2 | 0 | 1 | 1 | 16 | 24 | 11 | 19 | 32 | 32 | 26 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 38 | 353 | 156 (44%) | 8 | 0 | 0 | 1 | 0 | 0 | 0 | 18 | 24 | 7 | 22 | 28 | 28 | 28 |
| [del.md](../spec/del.md) | 48 | 309 | 145 (47%) | 20 | 0 | 1 | 0 | 10 | 0 | 4 | 18 | 10 | 5 | 25 | 24 | 24 | 24 |
| [scenarios.md](../spec/scenarios.md) | 24 | 253 | 123 (49%) | 36 | 3 | 4 | 5 | 6 | 4 | 4 | 12 | 10 | 10 | 14 | 16 | 16 | 19 |
| [shift-enter.md](../spec/shift-enter.md) | 26 | 247 | 108 (44%) | 21 | 1 | 1 | 1 | 2 | 1 | 14 | 15 | 13 | 1 | 16 | 15 | 14 | 14 |
| [indent.md](../spec/indent.md) | 30 | 292 | 78 (27%) | 2 | 0 | 0 | 0 | 0 | 1 | 1 | 8 | 11 | 0 | 10 | 17 | 17 | 13 |
| [outdent.md](../spec/outdent.md) | 29 | 199 | 75 (38%) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 10 | 0 | 13 | 13 | 13 | 16 |
| [gaps.md](../spec/gaps.md) | 19 | 194 | 73 (38%) | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 6 | 15 | 4 | 7 | 15 | 15 | 11 |
| [tasks.md](../spec/tasks.md) | 17 | 94 | 62 (66%) | 16 | 1 | 1 | 1 | 6 | 2 | 1 | 8 | 4 | 4 | 12 | 6 | 4 | 12 |
| [placeholders.md](../spec/placeholders.md) | 16 | 136 | 59 (43%) | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 9 | 1 | 9 | 9 | 9 | 12 |
| [undo.md](../spec/undo.md) | 5 | 51 | 18 (35%) | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 3 | 2 | 1 | 3 | 3 | 3 |
| [delete-subtree.md](../spec/delete-subtree.md) | 10 | 38 | 14 (37%) | 5 | 2 | 1 | 1 |  |  | 1 |  |  |  |  |  |  | 9 |
| [z-open.md](../spec/z-open.md) | 1 | 3 | 2 (67%) | 1 | 1 |  | 0 |  |  |  |  |  |  |  |  |  | 1 |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) | 8 | 3 | 1 (33%) | 1 |  |  |  | 1 |  | 0 |  |  |  |  |  |  |  |
| [cursor.md](../spec/cursor.md) | 36 | 395 | 0 (0%) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| [typing.md](../spec/typing.md) | 4 | 18 | 0 (0%) |  |  |  |  |  |  |  | 0 | 0 |  | 0 | 0 | 0 | 0 |
| **total** | **787** | **6240** | **3099 (50%)** | **479** | **32** | **39** | **79** | **85** | **35** | **78** | **364** | **385** | **131** | **441** | **463** | **456** | **511** |

## Heatmap

Each cell is how alike two apps did, in percent of the examples both ran alike: both as written, or
both adapted the same way (block apps), an example one ran adapted and the other as written left
out. One where they end the same counts 1, the same but for the caret or for spaces ½, otherwise 0,
their results compared from the same start, or, from different
starts, as each compares with ourus (both apart from ourus, it is left out). ourus is there too, as
its own runs of the examples have it: its cell with an app is how that app compares with it.
The apps are in the table's order, by how many examples agree, the most first, ourus first.

![Heatmap: how alike two apps did](sxs-heatmap.svg)

## Legend

| cell | the app, compared with ourus |
| --- | --- |
| ✓ | agrees: the same result, caret included |
| ✗ | disagrees: other text, or (a block app) other blocks, nesting or count |
| C | caret: the same result, the caret elsewhere |
| S | spaces: the same but for spaces next to line breaks, or (a text app) spaces that leave the document as ourus reads it the same |
| E | error: the run failed, or the app didn't hold the starting state |
| blank | skipped: the app can't run the example as written (its report says why) |
| (✗) | in brackets, a difference in an example adapted for the app: its buffers projected onto blocks, so it compares those |

An example's **rank** is how often users meet it (`core`, `common`, `edge` or `rare`: [the spec's README](../spec/README.md)); a file's **disagree** column counts the apps that disagree on the example; its **total** row, the examples each app disagrees on, and all of them.
**TO** is obsidian-true-outliner. **outliner** is obsidian-outliner. **lp** is obsidian-lp. **emacs** is emacs-markdown.

## Test cases

<table>
<tr><td><b>backspace.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/backspace.md#backspace1">Backspace1</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/backspace.md#backspace2">Backspace2</a><td><td><td><td><td><td><td><td><td><td>✗<td>✗<td>✗<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace3">Backspace3</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>core</tr>
<tr><td><a href="../spec/backspace.md#backspace4">Backspace4</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace5">Backspace5</a><td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace7">Backspace7</a><td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>core</tr>
<tr><td><a href="../spec/backspace.md#backspace8">Backspace8</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace9">Backspace9</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace10">Backspace10</a><td>✓<td>✓<td>✓<td>(S)<td>✓<td>✓<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace11">Backspace11</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>✓<td>✓<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace12">Backspace12</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace12b">Backspace12b</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace12c">Backspace12c</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace13">Backspace13</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>core</tr>
<tr><td><a href="../spec/backspace.md#backspace14">Backspace14</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace15">Backspace15</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>(✗)<td>✓<td><td>(✗)<td><td><td><td><td align="right">3<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace16">Backspace16</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace17">Backspace17</a><td>C<td>✓<td>C<td>✗<td>✗<td>C<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace17b">Backspace17b</a><td><td><td><td>✗<td><td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace17c">Backspace17c</a><td><td><td><td>S<td><td><td>✓<td><td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace17d">Backspace17d</a><td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace17e">Backspace17e</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✓<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace17f">Backspace17f</a><td>✓<td>✓<td>✓<td><td>✓<td>✓<td><td>✓<td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace17g">Backspace17g</a><td>✓<td>✗<td>✓<td><td>✓<td>✓<td><td>✓<td><td><td><td><td><td align="right">1<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace17h">Backspace17h</a><td>✓<td>✓<td>✓<td><td>✓<td>✓<td><td>✓<td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace18">Backspace18</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace18b">Backspace18b</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace18c">Backspace18c</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace18d">Backspace18d</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace18e">Backspace18e</a><td><td><td><td>✓<td><td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace18f">Backspace18f</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace18g">Backspace18g</a><td><td><td><td>✓<td><td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace19">Backspace19</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace20">Backspace20</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace21">Backspace21</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>✓<td>✓<td><td>(✗)<td><td><td><td><td align="right">2<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace21b">Backspace21b</a><td><td><td><td><td><td><td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace22">Backspace22</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>(✗)<td>✓<td><td>(✗)<td><td><td><td><td align="right">3<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace23">Backspace23</a><td><td><td><td><td><td><td>✓<td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace24">Backspace24</a><td><td><td><td><td><td><td>✓<td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace25">Backspace25</a><td>✓<td>✓<td>✓<td>(S)<td>✓<td>✓<td>✓<td><td>(✗)<td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace26">Backspace26</a><td>✓<td>✓<td>(✗)<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">1<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace27">Backspace27</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace28">Backspace28</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace29">Backspace29</a><td>✗<td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace30">Backspace30</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/backspace.md#backspace31">Backspace31</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace32">Backspace32</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace33">Backspace33</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✓<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/backspace.md#backspace34">Backspace34</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace35">Backspace35</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace36">Backspace36</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>(✗)<td>✓<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace37">Backspace37</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace38">Backspace38</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace39">Backspace39</a><td>✓<td>✓<td>✓<td>(S)<td>✓<td>✓<td>✓<td>✗<td>(✗)<td>S<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/backspace.md#backspace40">Backspace40</a><td><td><td><td>(✗)<td><td><td>✓<td><td>(✗)<td><td><td><td><td align="right">2<td>edge</tr>
<tr><td><a href="../spec/backspace.md#backspace41">Backspace41</a><td>✗<td>✗<td>✗<td>E<td>✗<td>✗<td>✗<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td align="right">11<td>edge</tr>
<tr><td><a href="../spec/backspace.md#softbackspace1">SoftBackspace1</a><td><td><td><td>✓<td><td><td>✗<td><td>✓<td>✗<td><td><td><td align="right">2<td>common</tr>
<tr><td><a href="../spec/backspace.md#softbackspace2">SoftBackspace2</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#softbackspace3">SoftBackspace3</a><td><td><td><td>✓<td><td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#softbackspace4">SoftBackspace4</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#softbackspace5">SoftBackspace5</a><td>✓<td>✓<td>✓<td>(E)<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#softbackspace6">SoftBackspace6</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#softbackspace7">SoftBackspace7</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#softbackspace8">SoftBackspace8</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/backspace.md#softbackspace9">SoftBackspace9</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><b>total</b><td><b>2</b><td><b>2</b><td><b>2</b><td><b>13</b><td><b>2</b><td><b>7</b><td><b>34</b><td><b>33</b><td><b>22</b><td><b>42</b><td><b>45</b><td><b>45</b><td><b>45</b><td align="right"><b>294</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>cursor.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/cursor.md#cursorleft1">CursorLeft1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorleft2">CursorLeft2</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td><td><td>✓<td><td><td><td><td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorleft3">CursorLeft3</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorright1">CursorRight1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>(C)<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorright2">CursorRight2</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorup1">CursorUp1</a><td>✓<td>✓<td>(C)<td>(C)<td>(C)<td>(C)<td>✓<td>C<td>✓<td>✓<td>C<td>C<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorup2">CursorUp2</a><td>(C)<td>(C)<td>✓<td>(C)<td>✓<td>✓<td>C<td>C<td>(C)<td>C<td>C<td>C<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorup3">CursorUp3</a><td>C<td>C<td>✓<td>✓<td>C<td>✓<td>✓<td>✓<td>✓<td>C<td>C<td>C<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursordown1">CursorDown1</a><td>(C)<td>✓<td>✓<td>(C)<td>(C)<td>(C)<td>C<td>✓<td>(C)<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursordown2">CursorDown2</a><td><td><td><td><td><td><td>C<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursordown3">CursorDown3</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>C<td>C<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursordown4">CursorDown4</a><td>✓<td>✓<td>✓<td>✓<td>C<td>C<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/cursor.md#cursordown5">CursorDown5</a><td>(C)<td>(C)<td>✓<td>(C)<td>(C)<td>✓<td>C<td>C<td>(C)<td>C<td>C<td>✓<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorhome1">CursorHome1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>C<td align="right">0<td>core</tr>
<tr><td><a href="../spec/cursor.md#cursorhome2">CursorHome2</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>C<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorhome3">CursorHome3</a><td><td><td><td><td><td><td><td><td><td>C<td>C<td>C<td>C<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/cursor.md#cursorhome4">CursorHome4</a><td><td><td><td><td><td><td><td><td><td>C<td>C<td>C<td>C<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/cursor.md#cursorhome5">CursorHome5</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorhome6">CursorHome6</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorhome7">CursorHome7</a><td><td><td><td>✓<td><td><td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorhome8">CursorHome8</a><td>(C)<td>(C)<td>✓<td>✓<td>(C)<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorhome9">CursorHome9</a><td>(C)<td>(C)<td>✓<td>✓<td>(C)<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>C<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursorhome10">CursorHome10</a><td>(C)<td>(C)<td>✓<td>✓<td>✓<td>✓<td>C<td>C<td>✓<td>C<td>C<td>C<td>C<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/cursor.md#cursorhome11">CursorHome11</a><td><td><td><td><td><td><td>C<td>✓<td><td>C<td>✓<td>✓<td>C<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/cursor.md#cursorhome12">CursorHome12</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>C<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/cursor.md#cursorhome13">CursorHome13</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>C<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/cursor.md#cursorhome14">CursorHome14</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/cursor.md#cursorhome15">CursorHome15</a><td><td><td><td><td><td><td><td><td><td>C<td>C<td>C<td>C<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/cursor.md#cursorhome16">CursorHome16</a><td><td><td><td><td><td><td>C<td>✓<td><td>C<td>✓<td>✓<td>C<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/cursor.md#cursorhome17">CursorHome17</a><td><td><td><td><td><td><td>C<td>C<td><td>C<td>C<td>C<td>C<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/cursor.md#cursorend1">CursorEnd1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursordocstart1">CursorDocStart1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>C<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#cursordocendleft1">CursorDocEndLeft1</a><td><td><td><td><td><td><td>C<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/cursor.md#selectleft1">SelectLeft1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#selectrightend1">SelectRightEnd1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/cursor.md#selecthome1">SelectHome1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>C<td align="right">0<td>common</tr>
<tr><td><b>total</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td align="right"><b>0</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>del.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/del.md#delete1">Delete1</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/del.md#delete2">Delete2</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>core</tr>
<tr><td><a href="../spec/del.md#delete3">Delete3</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/del.md#delete4">Delete4</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/del.md#delete4b">Delete4b</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/del.md#delete5">Delete5</a><td><td><td><td>S<td><td><td>✓<td><td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/del.md#delete5b">Delete5b</a><td><td><td><td>S<td><td><td>✓<td><td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/del.md#delete5c">Delete5c</a><td><td><td><td>✗<td><td><td>✓<td><td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/del.md#delete5d">Delete5d</a><td><td><td><td><td><td><td><td><td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/del.md#delete5e">Delete5e</a><td>✓<td>✗<td>✓<td><td>✓<td>✓<td><td>✓<td><td><td><td><td><td align="right">1<td>rare</tr>
<tr><td><a href="../spec/del.md#delete6">Delete6</a><td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">4<td>common</tr>
<tr><td><a href="../spec/del.md#delete7">Delete7</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/del.md#delete8">Delete8</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>core</tr>
<tr><td><a href="../spec/del.md#delete9">Delete9</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/del.md#delete10">Delete10</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/del.md#delete11">Delete11</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/del.md#delete12">Delete12</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>S<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/del.md#delete13">Delete13</a><td><td><td><td>(✗)<td><td><td>✗<td><td>(✗)<td><td><td><td><td align="right">3<td>edge</tr>
<tr><td><a href="../spec/del.md#delete13b">Delete13b</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/del.md#delete13c">Delete13c</a><td><td><td><td><td><td><td>✗<td><td><td><td><td><td><td align="right">1<td>rare</tr>
<tr><td><a href="../spec/del.md#delete13d">Delete13d</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/del.md#delete13e">Delete13e</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/del.md#delete13f">Delete13f</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/del.md#delete13g">Delete13g</a><td><td><td><td>(✗)<td><td><td>✓<td>✓<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/del.md#delete14">Delete14</a><td><td><td><td><td><td><td>✗<td><td><td><td><td><td><td align="right">1<td>rare</tr>
<tr><td><a href="../spec/del.md#delete15">Delete15</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>rare</tr>
<tr><td><a href="../spec/del.md#delete16">Delete16</a><td><td><td><td><td><td><td><td><td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/del.md#delete16b">Delete16b</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/del.md#delete16c">Delete16c</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/del.md#delete16d">Delete16d</a><td><td><td><td><td><td><td><td><td><td>✗<td>✗<td>✗<td>✗<td align="right">4<td>rare</tr>
<tr><td><a href="../spec/del.md#delete16e">Delete16e</a><td><td><td><td><td><td><td><td><td><td>✗<td>✗<td>✗<td>✗<td align="right">4<td>rare</tr>
<tr><td><a href="../spec/del.md#delete16f">Delete16f</a><td><td><td><td><td><td><td><td><td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/del.md#delete16g">Delete16g</a><td><td><td><td><td><td><td><td><td><td>C<td>C<td>C<td>C<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/del.md#delete17">Delete17</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>(✗)<td>✗<td><td>✓<td><td><td><td><td align="right">3<td>common</tr>
<tr><td><a href="../spec/del.md#delete17b">Delete17b</a><td><td><td><td><td><td><td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/del.md#delete18">Delete18</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>common</tr>
<tr><td><a href="../spec/del.md#delete18b">Delete18b</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/del.md#delete18c">Delete18c</a><td><td><td><td><td><td><td>✗<td><td><td><td><td><td><td align="right">1<td>rare</tr>
<tr><td><a href="../spec/del.md#delete19">Delete19</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td><td><td><td align="right">2<td>edge</tr>
<tr><td><a href="../spec/del.md#delete20">Delete20</a><td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">4<td>common</tr>
<tr><td><a href="../spec/del.md#delete21">Delete21</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>common</tr>
<tr><td><a href="../spec/del.md#delete22">Delete22</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/del.md#delete23">Delete23</a><td><td><td><td><td><td><td><td><td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/del.md#delete24">Delete24</a><td><td><td><td><td><td><td><td><td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/del.md#delete25">Delete25</a><td><td><td><td><td><td><td><td><td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/del.md#delete26">Delete26</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>(✗)<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>rare</tr>
<tr><td><a href="../spec/del.md#delete27">Delete27</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>rare</tr>
<tr><td><a href="../spec/del.md#delete28">Delete28</a><td>✓<td>✓<td>✓<td>(S)<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><b>total</b><td><b>0</b><td><b>1</b><td><b>0</b><td><b>10</b><td><b>0</b><td><b>4</b><td><b>18</b><td><b>10</b><td><b>5</b><td><b>25</b><td><b>24</b><td><b>24</b><td><b>24</b><td align="right"><b>145</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>delete-subtree.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/delete-subtree.md#deletesubtree1">DeleteSubtree1</a><td>✓<td>C<td>✓<td><td><td>✓<td><td><td><td><td><td><td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/delete-subtree.md#deletesubtree2">DeleteSubtree2</a><td>✓<td>C<td>✓<td><td><td>✓<td><td><td><td><td><td><td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/delete-subtree.md#deletesubtree3">DeleteSubtree3</a><td>(C)<td>(C)<td>✓<td><td><td>(C)<td><td><td><td><td><td><td>✗<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/delete-subtree.md#deletesubtree4">DeleteSubtree4</a><td>(C)<td>(C)<td>✓<td><td><td>(C)<td><td><td><td><td><td><td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/delete-subtree.md#deletesubtree5">DeleteSubtree5</a><td><td><td><td><td><td><td><td><td><td><td><td><td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/delete-subtree.md#deletesubtree6">DeleteSubtree6</a><td>(✗)<td>(✗)<td>(✗)<td><td><td>(✗)<td><td><td><td><td><td><td>✓<td align="right">4<td>rare</tr>
<tr><td><a href="../spec/delete-subtree.md#deletesubtree7">DeleteSubtree7</a><td><td><td><td><td><td><td><td><td><td><td><td><td>✗<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/delete-subtree.md#deletesubtree8">DeleteSubtree8</a><td>(✗)<td><td>✓<td><td><td><td><td><td><td><td><td><td>✗<td align="right">2<td>rare</tr>
<tr><td><a href="../spec/delete-subtree.md#deletesubtree9">DeleteSubtree9</a><td>(C)<td>(C)<td>(C)<td><td><td><td><td><td><td><td><td><td>✗<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/delete-subtree.md#deletesubtree10">DeleteSubtree10</a><td>(C)<td>(C)<td>(C)<td><td><td><td><td><td><td><td><td><td>✗<td align="right">1<td>edge</tr>
<tr><td><b>total</b><td><b>2</b><td><b>1</b><td><b>1</b><td><td><td><b>1</b><td><td><td><td><td><td><td><b>9</b><td align="right"><b>14</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>duplicate-subtree.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/duplicate-subtree.md#duplicatesubtree1">DuplicateSubtree1</a><td><td><td><td>✗<td><td>C<td><td><td><td><td><td><td><td align="right">1<td>common</tr>
<tr><td><a href="../spec/duplicate-subtree.md#duplicatesubtree2">DuplicateSubtree2</a><td><td><td><td><td><td>C<td><td><td><td><td><td><td><td align="right">0<td>common</tr>
<tr><td><a href="../spec/duplicate-subtree.md#duplicatesubtree3">DuplicateSubtree3</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>common</tr>
<tr><td><a href="../spec/duplicate-subtree.md#duplicatesubtree4">DuplicateSubtree4</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/duplicate-subtree.md#duplicatesubtree5">DuplicateSubtree5</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/duplicate-subtree.md#duplicatesubtree6">DuplicateSubtree6</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/duplicate-subtree.md#duplicatesubtree7">DuplicateSubtree7</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/duplicate-subtree.md#duplicatesubtree8">DuplicateSubtree8</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><b>total</b><td><td><td><td><b>1</b><td><td><b>0</b><td><td><td><td><td><td><td><td align="right"><b>1</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>enter.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/enter.md#enter1">Enter1</a><td>✓<td>S<td>S<td>S<td>S<td>S<td>✓<td>S<td>S<td>S<td>✓<td>✓<td>✗<td align="right">1<td>core</tr>
<tr><td><a href="../spec/enter.md#enter2">Enter2</a><td>✓<td>✗<td>✗<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td align="right">3<td>core</tr>
<tr><td><a href="../spec/enter.md#enter3">Enter3</a><td><td><td>S<td>S<td>S<td>S<td><td>✗<td>S<td>✗<td>✓<td>✓<td>✗<td align="right">3<td>common</tr>
<tr><td><a href="../spec/enter.md#enter3b">Enter3b</a><td>✓<td>S<td><td><td><td><td>✓<td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter3c">Enter3c</a><td><td><td><td>S<td><td><td><td>✗<td>S<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter3d">Enter3d</a><td><td><td>✓<td>✗<td>✓<td>✓<td><td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/enter.md#enter4">Enter4</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>core</tr>
<tr><td><a href="../spec/enter.md#enter5">Enter5</a><td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✗<td align="right">3<td>core</tr>
<tr><td><a href="../spec/enter.md#enter6">Enter6</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/enter.md#enter7">Enter7</a><td>✓<td>✓<td>✓<td>✗<td><td>✓<td>✗<td><td>✗<td>✗<td><td><td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/enter.md#enter7b">Enter7b</a><td><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td><td align="right">3<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter8">Enter8</a><td>✓<td>(S)<td>(S)<td>✓<td>(S)<td>(S)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/enter.md#enter9">Enter9</a><td>✓<td>(S)<td>(S)<td>(C)<td>(S)<td>(S)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter10">Enter10</a><td>✓<td>(S)<td>(S)<td>✓<td>(S)<td>(S)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter11">Enter11</a><td>✓<td>(S)<td>(S)<td>✓<td>(S)<td>(S)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter12">Enter12</a><td>✓<td>(S)<td>(S)<td>(S)<td>(S)<td>(S)<td>✓<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>core</tr>
<tr><td><a href="../spec/enter.md#enter14">Enter14</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/enter.md#enter15">Enter15</a><td>✓<td>✓<td>✓<td>✗<td><td>✓<td>✗<td><td>✗<td>✗<td><td><td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter15b">Enter15b</a><td><td><td><td><td><td><td><td>✓<td><td><td>✓<td>✓<td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter16">Enter16</a><td>✓<td>✓<td>S<td>✓<td>S<td>✗<td>✗<td>✗<td>S<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter17">Enter17</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td><td><td>✓<td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter18">Enter18</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td><td><td>✓<td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter21">Enter21</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>common</tr>
<tr><td><a href="../spec/enter.md#enter22">Enter22</a><td>(✗)<td>(✗)<td>(S)<td>✓<td>(S)<td>(S)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter23">Enter23</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter25">Enter25</a><td><td><td><td>✓<td><td><td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter26">Enter26</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td><td><td><td><td><td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/enter.md#enter26b">Enter26b</a><td><td><td><td><td><td><td><td>✗<td>✓<td>✗<td>✗<td>✗<td><td align="right">4<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter27">Enter27</a><td>✓<td>✓<td>✓<td>✗<td><td>✓<td>✗<td><td>✗<td>✗<td><td><td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/enter.md#enter28">Enter28</a><td>C<td>C<td>C<td>✗<td><td>C<td>✗<td><td>✗<td>✗<td><td><td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter29">Enter29</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td><td><td><td><td><td>✗<td align="right">1<td>core</tr>
<tr><td><a href="../spec/enter.md#enter29b">Enter29b</a><td><td><td><td><td><td><td><td>✓<td>✓<td>S<td>✓<td>✓<td><td align="right">0<td>common</tr>
<tr><td><a href="../spec/enter.md#enter30">Enter30</a><td><td><td><td><td>✓<td><td><td>✓<td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter31">Enter31</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td><td><td><td><td><td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/enter.md#enter32">Enter32</a><td><td><td><td>✓<td><td><td>✗<td><td><td><td><td><td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/enter.md#enter32b">Enter32b</a><td><td><td><td><td><td><td><td>✓<td>(✗)<td>✓<td>✓<td>✓<td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter33">Enter33</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td><td><td><td><td><td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/enter.md#enter33b">Enter33b</a><td><td><td><td><td><td><td><td>✓<td><td>✓<td>✓<td>✓<td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter34">Enter34</a><td><td><td><td><td><td><td><td><td><td><td><td><td>✗<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter35">Enter35</a><td>S<td>✗<td>✗<td>✗<td>S<td>S<td>✗<td>✗<td>S<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter36">Enter36</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/enter.md#enter36b">Enter36b</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter37">Enter37</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter38">Enter38</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/enter.md#enter39">Enter39</a><td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/enter.md#enter40">Enter40</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter41">Enter41</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter42">Enter42</a><td>✓<td>(S)<td>(✗)<td>✓<td>(✗)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter43">Enter43</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>✓<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter44">Enter44</a><td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter45">Enter45</a><td><td><td><td>✓<td><td><td>✗<td><td><td><td><td><td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter46">Enter46</a><td><td><td><td><td><td><td>✗<td><td><td><td><td><td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter47">Enter47</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter48">Enter48</a><td>✓<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">12<td>rare</tr>
<tr><td><a href="../spec/enter.md#enter49">Enter49</a><td>✓<td>✓<td>✓<td>(E)<td><td><td>E<td>E<td>(✗)<td>✗<td>✗<td>E<td>✗<td align="right">4<td>common</tr>
<tr><td><a href="../spec/enter.md#enter50">Enter50</a><td><td><td><td><td><td><td>E<td>E<td><td>✗<td>✗<td>E<td>✗<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter51">Enter51</a><td>✓<td>✓<td>(✗)<td>(E)<td>(✗)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter52">Enter52</a><td>✓<td>✓<td>(✗)<td>(E)<td>(✗)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>edge</tr>
<tr><td><a href="../spec/enter.md#enter53">Enter53</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><b>total</b><td><b>1</b><td><b>6</b><td><b>7</b><td><b>11</b><td><b>5</b><td><b>6</b><td><b>30</b><td><b>30</b><td><b>15</b><td><b>39</b><td><b>35</b><td><b>33</b><td><b>49</b><td align="right"><b>267</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td><b>fences.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/fences.md#fence1">Fence1</a><td>✓<td>✓<td>(✗)<td>✓<td><td><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">1<td>common</tr>
<tr><td><a href="../spec/fences.md#fence2">Fence2</a><td>✓<td>✓<td>(✗)<td>✓<td><td><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">1<td>common</tr>
<tr><td><a href="../spec/fences.md#fence3">Fence3</a><td>(S)<td>(S)<td>(✗)<td>(S)<td><td><td>✓<td>✓<td>(S)<td>✓<td>✓<td>✓<td>✓<td align="right">1<td>common</tr>
<tr><td><a href="../spec/fences.md#fence4">Fence4</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✗<td>✓<td>✓<td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence5">Fence5</a><td>✓<td>✓<td>(✗)<td>✓<td><td><td>✗<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence6">Fence6</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence7">Fence7</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/fences.md#fence7b">Fence7b</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✗<td>✓<td>✓<td>✓<td align="right">1<td>common</tr>
<tr><td><a href="../spec/fences.md#fence7c">Fence7c</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence7d">Fence7d</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence8">Fence8</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✓<td>✓<td>(✗)<td>S<td>✓<td>✓<td>✓<td align="right">1<td>common</tr>
<tr><td><a href="../spec/fences.md#fence9">Fence9</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence10">Fence10</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence11">Fence11</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence12">Fence12</a><td><td><td><td><td><td><td>S<td>✗<td><td>✓<td>S<td>S<td>S<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence13">Fence13</a><td><td><td><td><td><td><td>C<td>C<td><td>C<td>C<td>C<td>C<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence14">Fence14</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence15">Fence15</a><td><td><td><td><td><td><td>✓<td>C<td><td>S<td>✗<td>✗<td>✗<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence16">Fence16</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/fences.md#fence17">Fence17</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence18">Fence18</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/fences.md#fence19">Fence19</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence20">Fence20</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence21">Fence21</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>common</tr>
<tr><td><a href="../spec/fences.md#fence22">Fence22</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence23">Fence23</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence24">Fence24</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence25">Fence25</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence26">Fence26</a><td><td><td><td><td><td><td>✗<td>✗<td><td>C<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence27">Fence27</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence28">Fence28</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence29">Fence29</a><td><td><td><td><td><td><td>✗<td>C<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence30">Fence30</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence31">Fence31</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence32">Fence32</a><td><td><td><td><td><td><td>✗<td>✓<td><td>S<td>✗<td>✗<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence33">Fence33</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence34">Fence34</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence35">Fence35</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence36">Fence36</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence37">Fence37</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence38">Fence38</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence39">Fence39</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence40">Fence40</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence41">Fence41</a><td><td><td><td><td><td><td>C<td>C<td><td>✗<td>C<td>C<td>C<td align="right">1<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence48">Fence48</a><td>✓<td>✓<td>✓<td>✓<td><td><td>S<td>S<td>✓<td>S<td>✗<td>✗<td>✓<td align="right">2<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence42">Fence42</a><td>(✗)<td>✓<td>(✗)<td>(E)<td><td><td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>edge</tr>
<tr><td><a href="../spec/fences.md#fence43">Fence43</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence44">Fence44</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✗<td>✓<td>✓<td>✓<td align="right">2<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence45">Fence45</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence46">Fence46</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/fences.md#fence47">Fence47</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><b>total</b><td><b>1</b><td><b>0</b><td><b>5</b><td><b>0</b><td><td><td><b>32</b><td><b>26</b><td><b>2</b><td><b>34</b><td><b>34</b><td><b>34</b><td><b>34</b><td align="right"><b>202</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td><b>gaps.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/gaps.md#gap1">Gap1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">4<td>core</tr>
<tr><td><a href="../spec/gaps.md#gap2">Gap2</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">4<td>core</tr>
<tr><td><a href="../spec/gaps.md#gap3">Gap3</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>(✗)<td>✓<td>✗<td>✗<td>C<td align="right">4<td>common</tr>
<tr><td><a href="../spec/gaps.md#gap4">Gap4</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/gaps.md#gap5">Gap5</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/gaps.md#gap6">Gap6</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>(✗)<td>✓<td>✗<td>✗<td>C<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/gaps.md#gap7">Gap7</a><td>✓<td>✓<td>✓<td>✓<td><td><td>C<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/gaps.md#gap8">Gap8</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/gaps.md#gap9">Gap9</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>common</tr>
<tr><td><a href="../spec/gaps.md#gap10">Gap10</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/gaps.md#gap11">Gap11</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/gaps.md#gap12">Gap12</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>(✗)<td>✓<td>✓<td>✓<td>✓<td align="right">2<td>core</tr>
<tr><td><a href="../spec/gaps.md#gap13">Gap13</a><td>✓<td>✓<td>✓<td>✓<td>(C)<td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/gaps.md#gap14">Gap14</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/gaps.md#gap15">Gap15</a><td><td><td><td><td><td><td>C<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/gaps.md#gap16">Gap16</a><td><td><td><td><td><td><td>C<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/gaps.md#gap17">Gap17</a><td><td><td><td><td><td><td>C<td>✗<td><td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/gaps.md#gap18">Gap18</a><td><td><td><td><td><td><td><td><td><td>C<td><td><td>✓<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/gaps.md#gap19">Gap19</a><td><td><td><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td align="right">0<td>edge</tr>
<tr><td><b>total</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>6</b><td><b>15</b><td><b>4</b><td><b>7</b><td><b>15</b><td><b>15</b><td><b>11</b><td align="right"><b>73</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td><b>indent.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/indent.md#indent1">Indent1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>core</tr>
<tr><td><a href="../spec/indent.md#indent2">Indent2</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">2<td>core</tr>
<tr><td><a href="../spec/indent.md#indent3">Indent3</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/indent.md#indent4">Indent4</a><td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/indent.md#indent5">Indent5</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">3<td>common</tr>
<tr><td><a href="../spec/indent.md#indent6">Indent6</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>S<td align="right">0<td>common</tr>
<tr><td><a href="../spec/indent.md#indent7">Indent7</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>S<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/indent.md#indent8">Indent8</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>core</tr>
<tr><td><a href="../spec/indent.md#indent9">Indent9</a><td><td><td><td><td><td><td>C<td>✓<td><td>✗<td>✓<td>✓<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/indent.md#indent10">Indent10</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>S<td>S<td>S<td align="right">0<td>common</tr>
<tr><td><a href="../spec/indent.md#indent11">Indent11</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>(C)<td>✓<td>S<td>S<td>S<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/indent.md#indent12">Indent12</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✓<td>✗<td>✗<td>✗<td align="right">4<td>common</tr>
<tr><td><a href="../spec/indent.md#indent13">Indent13</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✓<td>✗<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/indent.md#indent14">Indent14</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/indent.md#indent15">Indent15</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/indent.md#indent16">Indent16</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/indent.md#indent17">Indent17</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td><td><td>✓<td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/indent.md#indent18">Indent18</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/indent.md#indent19">Indent19</a><td>✓<td>✓<td>✓<td><td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/indent.md#indent20">Indent20</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/indent.md#indent21">Indent21</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/indent.md#indent22">Indent22</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/indent.md#indent23">Indent23</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✓<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/indent.md#indent24">Indent24</a><td><td><td><td><td><td><td>✓<td>S<td><td>✓<td>S<td>S<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/indent.md#indent25">Indent25</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/indent.md#indent26">Indent26</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">2<td>common</tr>
<tr><td><a href="../spec/indent.md#indent27">Indent27</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✗<td>✓<td>✓<td>✗<td align="right">3<td>common</tr>
<tr><td><a href="../spec/indent.md#indent28">Indent28</a><td><td><td><td><td><td><td><td><td><td>C<td>C<td>C<td>C<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/indent.md#indent29">Indent29</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/indent.md#indent30">Indent30</a><td><td><td><td><td><td><td><td><td><td>✗<td>✗<td>✗<td>✗<td align="right">4<td>rare</tr>
<tr><td><b>total</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>1</b><td><b>1</b><td><b>8</b><td><b>11</b><td><b>0</b><td><b>10</b><td><b>17</b><td><b>17</b><td><b>13</b><td align="right"><b>78</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>move-subtree-down.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown1">MoveDown1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>core</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown2">MoveDown2</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown3">MoveDown3</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">2<td>common</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown4">MoveDown4</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>(✗)<td>✓<td>✗<td>✗<td>✗<td align="right">5<td>core</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown5">MoveDown5</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">4<td>common</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown6">MoveDown6</a><td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown7">MoveDown7</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown8">MoveDown8</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown9">MoveDown9</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown10">MoveDown10</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown11">MoveDown11</a><td><td><td><td><td><td><td>C<td>✗<td><td>✗<td>✓<td>✓<td>✗<td align="right">3<td>common</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown12">MoveDown12</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✓<td>✓<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown13">MoveDown13</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown14">MoveDown14</a><td><td><td><td><td><td><td>C<td>✗<td><td>C<td>✓<td>✓<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown15">MoveDown15</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown16">MoveDown16</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>(✗)<td>✓<td>✗<td>✗<td>C<td align="right">5<td>common</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown17">MoveDown17</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✗<td>✗<td>C<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown18">MoveDown18</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown19">MoveDown19</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✗<td>✗<td>C<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown20">MoveDown20</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown21">MoveDown21</a><td>✓<td>✓<td>✓<td>✓<td><td><td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown22">MoveDown22</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">3<td>core</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown23">MoveDown23</a><td><td><td><td>✓<td><td><td>C<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown24">MoveDown24</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown25">MoveDown25</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✗<td>✗<td>✗<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown26">MoveDown26</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown27">MoveDown27</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown28">MoveDown28</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown29">MoveDown29</a><td>✓<td>✓<td>✓<td>✓<td><td>✓<td>C<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown30">MoveDown30</a><td><td><td><td>✓<td><td><td>S<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown31">MoveDown31</a><td>✓<td>✓<td>✓<td><td>✓<td><td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">4<td>rare</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown32">MoveDown32</a><td><td><td><td><td><td><td><td><td><td>C<td>C<td>C<td>C<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown33">MoveDown33</a><td>✗<td>✗<td>✗<td>E<td>✗<td>✗<td>✗<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td align="right">11<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown34">MoveDown34</a><td><td><td><td><td><td><td>C<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown35">MoveDown35</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">3<td>rare</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown36">MoveDown36</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/move-subtree-down.md#movedown37">MoveDown37</a><td><td><td><td><td><td><td>✗<td>✗<td><td>C<td>✗<td>✗<td>C<td align="right">4<td>edge</tr>
<tr><td><b>total</b><td><b>1</b><td><b>1</b><td><b>2</b><td><b>0</b><td><b>1</b><td><b>1</b><td><b>16</b><td><b>24</b><td><b>11</b><td><b>19</b><td><b>32</b><td><b>32</b><td><b>26</b><td align="right"><b>166</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td><b>move-subtree-up.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup1">MoveUp1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">2<td>core</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup2">MoveUp2</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup3">MoveUp3</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>(✗)<td>✓<td>✗<td>✗<td>✗<td align="right">5<td>core</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup4">MoveUp4</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">4<td>core</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup5">MoveUp5</a><td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✓<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup6">MoveUp6</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✓<td>✓<td>✗<td align="right">4<td>core</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup7">MoveUp7</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup8">MoveUp8</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup9">MoveUp9</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup10">MoveUp10</a><td><td><td><td><td><td><td>C<td>✗<td><td>✗<td>✓<td>✓<td>✗<td align="right">3<td>common</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup11">MoveUp11</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✓<td>✓<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup12">MoveUp12</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup13">MoveUp13</a><td>✓<td>✓<td>✓<td>✓<td><td><td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup14">MoveUp14</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td align="right">1<td>core</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup15">MoveUp15</a><td><td><td><td>✓<td><td><td>C<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup16">MoveUp16</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>(✗)<td>✓<td>✗<td>✗<td>C<td align="right">5<td>common</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup17">MoveUp17</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup18">MoveUp18</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup19">MoveUp19</a><td>✓<td>✓<td>✓<td><td>✓<td><td>C<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup20">MoveUp20</a><td>✓<td>✓<td>✓<td>✓<td>✓<td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup21">MoveUp21</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup22">MoveUp22</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup23">MoveUp23</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup24">MoveUp24</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup25">MoveUp25</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>common</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup26">MoveUp26</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup27">MoveUp27</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup28">MoveUp28</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✗<td>✗<td>✗<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup29">MoveUp29</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✓<td>✓<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup30">MoveUp30</a><td>✓<td>✓<td>✓<td>✓<td>✓<td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup31">MoveUp31</a><td><td><td><td><td><td><td>C<td>✗<td><td>C<td>✓<td>✓<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup32">MoveUp32</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup33">MoveUp33</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✗<td>✗<td>C<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup34">MoveUp34</a><td><td><td><td><td><td><td><td><td><td>C<td>C<td>C<td>C<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup35">MoveUp35</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup36">MoveUp36</a><td><td><td><td><td><td><td><td><td><td>✗<td>✗<td>✗<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup37">MoveUp37</a><td><td><td><td><td><td><td>C<td>C<td><td>C<td>C<td>C<td>C<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/move-subtree-up.md#moveup38">MoveUp38</a><td><td><td><td><td><td><td>C<td>C<td><td>C<td>✗<td>✗<td>C<td align="right">2<td>edge</tr>
<tr><td><b>total</b><td><b>0</b><td><b>0</b><td><b>1</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>18</b><td><b>24</b><td><b>7</b><td><b>22</b><td><b>28</b><td><b>28</b><td><b>28</b><td align="right"><b>156</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>obsidian-true-outliner.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change">Renumbering stops at…</a><td><td><td><td>E<td><td><td>✗<td>✗<td>E<td>✓<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#e4">E4</a><td>✓<td>S<td>S<td>S<td>S<td>✗<td>✓<td>S<td>S<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child">Split item becomes f…</a><td>✓<td>S<td><td><td><td><td>✓<td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#end-of-parent-opens-empty-first-child">End of parent opens…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#e9">E9</a><td>(✗)<td>(✗)<td>(S)<td>(S)<td>(S)<td>(S)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#e10">E10</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#e11">E11</a><td><td>(S)<td><td><td><td><td>✓<td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#e15">E15</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#e17">E17</a><td>✓<td>(S)<td>(✗)<td>(S)<td>(✗)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#e18">E18</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#end-of-lone-heading-starts-a-paragraph">End of lone heading…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list">Empty paragraph befo…</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked">Task checkbox carrie…</a><td>(✗)<td>(✗)<td>(S)<td>(S)<td>(✗)<td>(S)<td>✓<td>✗<td>(S)<td>✗<td>✓<td>✓<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#checked-task-gives-unchecked-new-item">Checked task gives u…</a><td>(✗)<td>(✗)<td>✓<td>✓<td>(✗)<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#e33">E33</a><td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#267-e5">#267, E5</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#rest-of-title-becomes-first-paragraph">Rest of title become…</a><td>✓<td>(S)<td>(✗)<td>(S)<td>(✗)<td>(✗)<td>✗<td>✓<td>(S)<td>✓<td>✓<td>✓<td>✓<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#split-title-above-a-subheading">Split title above a…</a><td>✓<td>✓<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✓<td>(✗)<td>✓<td>✓<td>✓<td>✓<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph">Split title above an…</a><td>✓<td>✓<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph">End of heading above…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#s4">S4</a><td>(S)<td>(S)<td>(S)<td>(S)<td>(S)<td>(✗)<td>✓<td>S<td>(S)<td>S<td>S<td>S<td>✓<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#s5">S5</a><td><td><td><td><td><td><td><td><td><td>✓<td>✓<td>✓<td>S<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused">Line break in setext…</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused">Line break in setext…</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#s9">S9</a><td>(S)<td>(S)<td>(S)<td>(S)<td>(S)<td>(✗)<td>✓<td>S<td>(S)<td>S<td>S<td>S<td>✓<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item">Place inside a multi…</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>S<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#leaving-the-place-removes-it">Leaving the place re…</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#s13">S13</a><td>S<td>S<td>S<td>S<td>S<td>✗<td>✓<td>S<td>✗<td>S<td>S<td>S<td>✗<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered">Emptied middle item…</a><td>✗<td>✗<td>✓<td>S<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#undoing-a-fresh-line-break">Undoing a fresh line…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#delete-to-content-start">delete-to-content-st…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#backspace-before-the-checkbox">Backspace before the…</a><td><td><td><td><td><td><td>✓<td><td><td>✗<td>✗<td><td>✗<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#children-move-to-the-joined-node">Children move to the…</a><td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren">Delete forward absor…</a><td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#joining-across-ordered-runs">Joining across order…</a><td><td><td>✓<td>✗<td><td><td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1">Next item becomes th…</a><td>✗<td>✓<td>✗<td>✗<td>✓<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start">List starting at 3 k…</a><td><td><td><td>✗<td><td><td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone">Outdented child leav…</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#list-marker-content-column">list-marker-content-…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#indent-unit-on-every-line">indent-unit-on-every…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>S<td>S<td>S<td>S<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote">Indented item keeps…</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote">Outdented item keeps…</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>S<td>S<td>✓<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break">Indented item keeps…</a><td>✓<td>✓<td>✓<td><td>✓<td><td>✓<td>✗<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block">Outdented item keeps…</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✓<td>✗<td>✗<td>✓<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#destination-list-style">destination-list-sty…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#block-id-moves-with-its-item">Block id moves with…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#block-id-moves-with-its-paragraph">Block id moves with…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote">Blank line added bel…</a><td><td><td><td><td><td><td>C<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence">No blank line needed…</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✗<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence">No blank line needed…</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list">Outdenting the head…</a><td>✓<td><td>✓<td><td>✓<td>✓<td><td>✓<td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving">Carried place remove…</a><td><td><td><td><td><td><td>C<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving">Doubly indented plac…</a><td><td><td><td><td><td><td>C<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#backspace-returns-to-the-start">Backspace returns to…</a><td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#shift-tab-then-backspace-returns-to-start">Shift-Tab then Backs…</a><td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter">Shift-Enter, Tab, th…</a><td>✓<td>✓<td>S<td>✓<td>S<td>✗<td>✗<td>✗<td>S<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace">Enter, then Shift-En…</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line">An empty ordered chi…</a><td>✓<td>(✗)<td>(✗)<td>✓<td>(✗)<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#blank-line-after-the-list-stays">Blank line after the…</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#outdented-empty-ordered-item-stays">Outdented empty orde…</a><td>✓<td>✗<td>✗<td>✓<td>✓<td>✓<td>✗<td>C<td>✓<td>✗<td>S<td>S<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item">Second Enter outdent…</a><td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>C<td>✗<td>✓<td>✓<td>✓<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed">Empty paragraph and…</a><td><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td><td align="right">3<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored">Indented list under…</a><td><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td><td align="right">3<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit">Pasted list takes sp…</a><td>✓<td>C<td>S<td>✓<td>C<td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit">Pasted list takes ta…</a><td>✓<td>C<td>S<td>✓<td>C<td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph">Pasted quote set off…</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children">Pasted list and bloc…</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><b>total</b><td><b>9</b><td><b>8</b><td><b>9</b><td><b>9</b><td><b>9</b><td><b>15</b><td><b>27</b><td><b>34</b><td><b>13</b><td><b>38</b><td><b>46</b><td><b>45</b><td><b>45</b><td align="right"><b>307</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td><b>outdent.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/outdent.md#outdent1">Outdent1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>core</tr>
<tr><td><a href="../spec/outdent.md#outdent2">Outdent2</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/outdent.md#outdent3">Outdent3</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/outdent.md#outdent4">Outdent4</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✓<td>✗<td>✗<td>✗<td align="right">4<td>common</tr>
<tr><td><a href="../spec/outdent.md#outdent5">Outdent5</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✗<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/outdent.md#outdent6">Outdent6</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✓<td><td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/outdent.md#outdent7">Outdent7</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✗<td><td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/outdent.md#outdent8">Outdent8</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/outdent.md#outdent9">Outdent9</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>S<td>S<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/outdent.md#outdent10">Outdent10</a><td><td><td><td><td><td><td>C<td>✓<td><td>✗<td>✓<td>✓<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/outdent.md#outdent11">Outdent11</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✓<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/outdent.md#outdent12">Outdent12</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/outdent.md#outdent13">Outdent13</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✓<td><td>✓<td>✓<td>✗<td>✗<td>✓<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/outdent.md#outdent14">Outdent14</a><td><td><td><td><td><td><td><td><td><td>C<td>C<td>C<td>C<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/outdent.md#outdent15">Outdent15</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/outdent.md#directoutdent1">DirectOutdent1</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✓<td><td>✓<td>✓<td>S<td>S<td>✓<td align="right">0<td>core</tr>
<tr><td><a href="../spec/outdent.md#directoutdent2">DirectOutdent2</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/outdent.md#directoutdent3">DirectOutdent3</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/outdent.md#directoutdent4">DirectOutdent4</a><td>✓<td>✓<td>✓<td>✓<td><td><td>✗<td><td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/outdent.md#logicaloutdent1">LogicalOutdent1</a><td>✓<td><td>✓<td><td>✓<td>✓<td><td>✓<td><td><td><td><td><td align="right">0<td>common</tr>
<tr><td><a href="../spec/outdent.md#logicaloutdent2">LogicalOutdent2</a><td><td><td><td><td><td><td><td>✗<td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/outdent.md#logicaloutdent3">LogicalOutdent3</a><td><td><td><td><td><td><td><td>✗<td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/outdent.md#logicaloutdent4">LogicalOutdent4</a><td>✓<td><td>✓<td><td>✓<td>✓<td><td>✗<td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/outdent.md#logicaloutdent5">LogicalOutdent5</a><td><td><td><td><td><td><td><td>✗<td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/outdent.md#outdent16">Outdent16</a><td><td><td><td><td><td><td><td><td><td>✗<td>✗<td>✗<td>✗<td align="right">4<td>rare</tr>
<tr><td><a href="../spec/outdent.md#outdent17">Outdent17</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/outdent.md#outdent17b">Outdent17b</a><td><td><td><td><td><td><td><td>✗<td><td><td><td><td><td align="right">1<td>rare</tr>
<tr><td><a href="../spec/outdent.md#outdent18">Outdent18</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/outdent.md#outdent19">Outdent19</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><b>total</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>10</b><td><b>10</b><td><b>0</b><td><b>13</b><td><b>13</b><td><b>13</b><td><b>16</b><td align="right"><b>75</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td><b>paste.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/paste.md#paste1">Paste1</a><td>(✗)<td>(✗)<td>(✗)<td>✓<td><td><td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste2">Paste2</a><td>✓<td>✗<td>✗<td>✓<td>C<td><td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/paste.md#paste2b">Paste2b</a><td><td><td><td><td><td><td>✓<td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste3">Paste3</a><td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>S<td>S<td>✗<td>S<td>S<td>S<td>S<td align="right">4<td>common</tr>
<tr><td><a href="../spec/paste.md#paste4">Paste4</a><td>✓<td>✓<td>(✗)<td>(✗)<td>✓<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste5">Paste5</a><td>✓<td>✓<td>✗<td>S<td>✓<td>✗<td>S<td>S<td>S<td>S<td>S<td>S<td>S<td align="right">2<td>common</tr>
<tr><td><a href="../spec/paste.md#paste6">Paste6</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste7">Paste7</a><td>✓<td>✓<td><td>✗<td><td><td>S<td>S<td>✗<td>S<td>S<td>S<td>S<td align="right">2<td>core</tr>
<tr><td><a href="../spec/paste.md#paste8">Paste8</a><td><td><td>✓<td><td><td>✓<td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste8b">Paste8b</a><td><td><td>✓<td><td><td>✗<td><td><td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste8c">Paste8c</a><td><td><td><td><td><td>✓<td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste9">Paste9</a><td>(C)<td>(S)<td>(✗)<td>✓<td><td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/paste.md#paste10">Paste10</a><td>✓<td>✓<td><td>S<td><td><td>S<td>S<td>S<td>S<td>S<td>S<td>S<td align="right">0<td>core</tr>
<tr><td><a href="../spec/paste.md#paste11">Paste11</a><td>(C)<td>(S)<td>(✗)<td>✓<td><td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste12">Paste12</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste13">Paste13</a><td><td><td><td><td><td><td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste13b">Paste13b</a><td>✓<td>✓<td>✓<td>✓<td>C<td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste13c">Paste13c</a><td><td><td><td><td><td><td>✓<td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste13d">Paste13d</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste13e">Paste13e</a><td><td><td><td><td><td><td><td><td>✗<td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste14">Paste14</a><td><td><td><td><td><td><td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste14b">Paste14b</a><td><td>✓<td>✓<td>✓<td><td>✓<td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste15">Paste15</a><td><td><td><td><td><td><td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste15b">Paste15b</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste15c">Paste15c</a><td>✓<td>✓<td>✗<td>✓<td>C<td>✓<td><td><td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste15d">Paste15d</a><td><td><td><td><td><td><td>✗<td><td>✓<td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste16">Paste16</a><td>✗<td>✗<td>✗<td><td>C<td>✗<td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">9<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste16b">Paste16b</a><td><td><td><td><td><td><td>✗<td><td>✓<td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste17">Paste17</a><td><td><td><td><td><td><td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste17b">Paste17b</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste17c">Paste17c</a><td>✗<td>✗<td>✗<td>✓<td>C<td><td><td><td><td><td><td><td><td align="right">3<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste17d">Paste17d</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste18">Paste18</a><td>✓<td>✗<td>✗<td>✓<td>C<td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste18b">Paste18b</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste19">Paste19</a><td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>(C)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">12<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste19b">Paste19b</a><td><td><td><td><td><td>(✗)<td><td><td>(✗)<td><td><td><td><td align="right">2<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste20">Paste20</a><td>✓<td>(✗)<td>(✗)<td>(✗)<td>(C)<td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">8<td>common</tr>
<tr><td><a href="../spec/paste.md#paste20b">Paste20b</a><td><td><td><td><td><td>(✗)<td><td><td>(✗)<td><td><td><td><td align="right">2<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste21">Paste21</a><td>✓<td>(✗)<td>(✗)<td>(✗)<td>(C)<td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">9<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste22">Paste22</a><td>✓<td>✓<td>(✗)<td>✓<td><td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste23">Paste23</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste24">Paste24</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/paste.md#paste25">Paste25</a><td>(✗)<td>(✗)<td>(✗)<td>✓<td><td><td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>common</tr>
<tr><td><a href="../spec/paste.md#paste26">Paste26</a><td>✓<td>✓<td>✓<td>✓<td>✗<td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/paste.md#paste26b">Paste26b</a><td><td><td><td><td><td>✓<td><td><td>✓<td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste27">Paste27</a><td>✓<td><td><td><td>(C)<td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste27b">Paste27b</a><td><td><td><td><td><td><td><td><td>✓<td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste27c">Paste27c</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste27d">Paste27d</a><td><td>✓<td>✓<td>(✗)<td><td>✓<td><td><td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste28">Paste28</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste29">Paste29</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste30">Paste30</a><td>✓<td>✓<td>(✗)<td>✓<td>✓<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste31">Paste31</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td align="right">2<td>common</tr>
<tr><td><a href="../spec/paste.md#paste32">Paste32</a><td>✓<td>✓<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste33">Paste33</a><td>✓<td>✓<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste34">Paste34</a><td>✓<td>✓<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste35">Paste35</a><td>✓<td>✓<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste36">Paste36</a><td><td><td><td><td><td>✓<td><td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste36b">Paste36b</a><td><td><td>✗<td><td><td><td><td><td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste37">Paste37</a><td><td><td>(✗)<td><td><td>(✗)<td><td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste38">Paste38</a><td>✓<td>✓<td><td>✗<td><td><td><td><td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste38b">Paste38b</a><td><td><td><td><td>C<td><td>✗<td><td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste39">Paste39</a><td><td><td>✗<td><td>C<td>✓<td><td><td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste40">Paste40</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste41">Paste41</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste42">Paste42</a><td><td><td><td><td><td><td><td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste42b">Paste42b</a><td><td>✓<td>✗<td>✓<td><td>✓<td><td><td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste43">Paste43</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste44">Paste44</a><td>(S)<td>(S)<td>(✗)<td>(C)<td><td><td>✗<td>✗<td>(C)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste45">Paste45</a><td>✓<td>✓<td>(✗)<td>(✗)<td>✓<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste46">Paste46</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste47">Paste47</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste48">Paste48</a><td>✓<td>✓<td><td>✓<td><td><td>S<td>S<td>✓<td>S<td>S<td>S<td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/paste.md#paste49">Paste49</a><td>✗<td>✗<td>✗<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/paste.md#paste50">Paste50</a><td><td><td><td><td><td><td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste51">Paste51</a><td>✓<td>✓<td><td>(✗)<td><td><td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>common</tr>
<tr><td><a href="../spec/paste.md#paste52">Paste52</a><td>(C)<td>(S)<td>(✗)<td>✓<td><td><td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste53">Paste53</a><td>✓<td>✓<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste54">Paste54</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste55">Paste55</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste56">Paste56</a><td><td><td><td><td><td><td>E<td>E<td><td>✗<td>✗<td>E<td>✗<td align="right">3<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste57">Paste57</a><td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">13<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste58">Paste58</a><td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste59">Paste59</a><td>✓<td><td><td><td>(C)<td><td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/paste.md#paste59b">Paste59b</a><td><td>✓<td>✓<td>✓<td><td>✓<td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste60">Paste60</a><td>✓<td>✓<td>(✗)<td>✓<td>(C)<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste61">Paste61</a><td>✓<td>✓<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste62">Paste62</a><td><td><td>(✗)<td><td><td><td><td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste63">Paste63</a><td><td><td><td><td><td><td><td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste64">Paste64</a><td>✓<td>✓<td>(✗)<td>(✗)<td>✓<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste65">Paste65</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/paste.md#paste66">Paste66</a><td>(✗)<td>(✗)<td>(✗)<td>(✗)<td><td><td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>common</tr>
<tr><td><a href="../spec/paste.md#paste67">Paste67</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/paste.md#paste68">Paste68</a><td>(S)<td>(S)<td>(✗)<td>(✗)<td>(S)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste69">Paste69</a><td>✓<td>✓<td>(✗)<td>(✗)<td>✓<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste70">Paste70</a><td><td><td>(✗)<td><td><td><td><td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste71">Paste71</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste72">Paste72</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste73">Paste73</a><td>S<td>S<td><td><td><td><td>✗<td>✗<td>S<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste74">Paste74</a><td>(C)<td>(S)<td>(✗)<td>✓<td><td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste75">Paste75</a><td><td><td><td>(S)<td><td><td>S<td>S<td>(S)<td>S<td>S<td>S<td>S<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste76">Paste76</a><td><td><td><td><td><td><td>✓<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste77">Paste77</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste78">Paste78</a><td>S<td>S<td>✗<td>✗<td>S<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste79">Paste79</a><td>(✗)<td>(✗)<td>(✗)<td>(✗)<td><td><td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">11<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste80">Paste80</a><td>✓<td>✓<td>(✗)<td>(✗)<td>✓<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>rare</tr>
<tr><td><a href="../spec/paste.md#paste81">Paste81</a><td>✓<td>✓<td>(✗)<td>(✗)<td>✓<td>(✗)<td>✗<td>✗<td>(E)<td>✗<td>✗<td>✗<td>✗<td align="right">9<td>rare</tr>
<tr><td><b>total</b><td><b>10</b><td><b>14</b><td><b>45</b><td><b>27</b><td><b>10</b><td><b>24</b><td><b>53</b><td><b>67</b><td><b>34</b><td><b>69</b><td><b>68</b><td><b>67</b><td><b>70</b><td align="right"><b>558</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td><b>placeholders.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/placeholders.md#placeholder1">Placeholder1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/placeholders.md#placeholder2">Placeholder2</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/placeholders.md#placeholder3">Placeholder3</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>core</tr>
<tr><td><a href="../spec/placeholders.md#placeholder4">Placeholder4</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>common</tr>
<tr><td><a href="../spec/placeholders.md#placeholder5">Placeholder5</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/placeholders.md#placeholder6">Placeholder6</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/placeholders.md#placeholder7">Placeholder7</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/placeholders.md#placeholder8">Placeholder8</a><td>S<td>S<td>S<td>S<td>S<td>S<td>✓<td>✓<td>S<td>✓<td>✓<td>✓<td>✓<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/placeholders.md#placeholder9">Placeholder9</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/placeholders.md#placeholder10">Placeholder10</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/placeholders.md#placeholder11">Placeholder11</a><td><td><td><td><td><td><td>✗<td>✓<td><td>✓<td>✓<td>✓<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/placeholders.md#placeholder12">Placeholder12</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>edge</tr>
<tr><td><a href="../spec/placeholders.md#placeholder13">Placeholder13</a><td><td><td><td>(S)<td><td><td>✗<td><td>(✗)<td><td><td><td><td align="right">2<td>edge</tr>
<tr><td><a href="../spec/placeholders.md#placeholder14">Placeholder14</a><td>✓<td>✓<td>✓<td>(S)<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/placeholders.md#placeholder15">Placeholder15</a><td><td><td><td><td><td><td>✗<td><td><td><td><td><td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/placeholders.md#placeholder16">Placeholder16</a><td>✓<td>✓<td><td>✓<td>✓<td><td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><b>total</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>10</b><td><b>9</b><td><b>1</b><td><b>9</b><td><b>9</b><td><b>9</b><td><b>12</b><td align="right"><b>59</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>quotes.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/quotes.md#quote1">Quote1</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>S<td>S<td>✗<td align="right">4<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote2">Quote2</a><td><td><td><td><td><td><td>S<td>S<td><td>✗<td>S<td>S<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote3">Quote3</a><td><td><td><td><td><td><td>S<td>S<td><td>✗<td>S<td>S<td>✗<td align="right">2<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote4">Quote4</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✗<td>✓<td>✓<td>✗<td align="right">2<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote5">Quote5</a><td><td><td><td><td><td><td>S<td>✗<td><td>✗<td>S<td>S<td>✗<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote6">Quote6</a><td><td><td><td><td><td><td>S<td>S<td><td>✗<td>S<td>S<td>✗<td align="right">2<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote7">Quote7</a><td><td><td><td><td><td><td>S<td>S<td><td>✗<td>S<td>S<td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote8">Quote8</a><td><td><td><td><td><td><td>S<td>S<td><td>✗<td>S<td>S<td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote9">Quote9</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote10">Quote10</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✗<td>✓<td>✓<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote11">Quote11</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote12">Quote12</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote12b">Quote12b</a><td><td><td><td><td><td><td><td>✗<td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote13">Quote13</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote14">Quote14</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote15">Quote15</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote16">Quote16</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote17">Quote17</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote18">Quote18</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote19">Quote19</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote20">Quote20</a><td><td><td><td><td><td><td><td>✗<td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote21">Quote21</a><td><td><td><td><td><td><td>C<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote22">Quote22</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote23">Quote23</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote24">Quote24</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✓<td>✓<td>✓<td>✗<td align="right">3<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote25">Quote25</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote26">Quote26</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✓<td>✓<td>✓<td>✗<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote27">Quote27</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✗<td>✗<td>C<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote28">Quote28</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✓<td>✓<td>✓<td>✗<td align="right">3<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote29">Quote29</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote30">Quote30</a><td><td><td><td><td><td><td>✓<td>✗<td><td>✓<td>✓<td>✓<td>✗<td align="right">2<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote31">Quote31</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote32">Quote32</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote33">Quote33</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote34">Quote34</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote35">Quote35</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote36">Quote36</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote37">Quote37</a><td><td><td><td><td><td><td>✗<td><td><td><td><td><td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote38">Quote38</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote39">Quote39</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote40">Quote40</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote41">Quote41</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote42">Quote42</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote43">Quote43</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✓<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote43b">Quote43b</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote44">Quote44</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✗<td>✓<td>✓<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote45">Quote45</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✗<td>✓<td>✓<td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote46">Quote46</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✗<td>✓<td>✓<td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote47">Quote47</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote48">Quote48</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote49">Quote49</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote50">Quote50</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote51">Quote51</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote52">Quote52</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote53">Quote53</a><td><td><td><td><td><td><td>✗<td><td><td><td><td><td><td align="right">1<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote54">Quote54</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote55">Quote55</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote56">Quote56</a><td><td><td><td><td><td><td>✗<td><td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote57">Quote57</a><td><td><td><td><td><td><td>✗<td><td><td><td><td><td><td align="right">1<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote58">Quote58</a><td><td><td><td><td><td><td><td><td><td>✗<td><td><td>✗<td align="right">2<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote59">Quote59</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote60">Quote60</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote61">Quote61</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote62">Quote62</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote63">Quote63</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/quotes.md#quote64">Quote64</a><td><td><td><td><td><td><td>S<td>S<td><td>✗<td>S<td>S<td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote65">Quote65</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote66">Quote66</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote67">Quote67</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✓<td>✓<td>✓<td>✗<td align="right">3<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote68">Quote68</a><td><td><td><td><td><td><td>C<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote71">Quote71</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote72">Quote72</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote73">Quote73</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote74">Quote74</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote75">Quote75</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote76">Quote76</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote77">Quote77</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote78">Quote78</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote79">Quote79</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote80">Quote80</a><td><td><td><td><td><td><td>✗<td><td><td><td><td><td>✗<td align="right">2<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote81">Quote81</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote82">Quote82</a><td><td><td><td><td><td><td><td><td><td><td><td><td>✗<td align="right">1<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote88">Quote88</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote83">Quote83</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote84">Quote84</a><td><td><td><td><td><td><td><td><td><td>✗<td><td><td>✗<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote85">Quote85</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td>✗<td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote86">Quote86</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote87">Quote87</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/quotes.md#quote69">Quote69</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><a href="../spec/quotes.md#quote70">Quote70</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><b>total</b><td><td><td><td><td><td><td><b>64</b><td><b>62</b><td><td><b>71</b><td><b>57</b><td><b>57</b><td><b>80</b><td align="right"><b>391</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>scenarios.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/scenarios.md#scenario1">Scenario1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td align="right">1<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario2">Scenario2</a><td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✗<td align="right">3<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario3">Scenario3</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✓<td align="right">5<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario4">Scenario4</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario5">Scenario5</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">3<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario6">Scenario6</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario7">Scenario7</a><td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td>✓<td><td><td><td><td><td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario8">Scenario8</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✗<td>✓<td>✗<td>✗<td>✓<td align="right">3<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario9">Scenario9</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario10">Scenario10</a><td>C<td>C<td>✓<td><td><td><td><td><td><td><td><td><td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/scenarios.md#scenario11">Scenario11</a><td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario12">Scenario12</a><td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✓<td>✓<td>✗<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario13">Scenario13</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td align="right">3<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario14">Scenario14</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✓<td>✗<td>✗<td>✓<td>✓<td>✗<td align="right">4<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario15">Scenario15</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td><td><td><td align="right">2<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario16">Scenario16</a><td>✓<td>✓<td>✓<td>(✗)<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/scenarios.md#scenario17">Scenario17</a><td><td><td>✗<td><td>C<td><td><td><td><td><td><td><td><td align="right">1<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario18">Scenario18</a><td>(✗)<td>(✗)<td>(✗)<td>✓<td><td><td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">10<td>common</tr>
<tr><td><a href="../spec/scenarios.md#scenario19">Scenario19</a><td>✓<td>✓<td>(✗)<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario20">Scenario20</a><td>✓<td>✓<td>✓<td>✓<td>(✗)<td>✓<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario21">Scenario21</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario22">Scenario22</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td>✗<td>(✗)<td>✓<td>✗<td>✗<td>✗<td align="right">5<td>core</tr>
<tr><td><a href="../spec/scenarios.md#scenario23">Scenario23</a><td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>(✗)<td>✗<td>✗<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">13<td>common</tr>
<tr><td><a href="../spec/scenarios.md#scenario24">Scenario24</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><b>total</b><td><b>3</b><td><b>4</b><td><b>5</b><td><b>6</b><td><b>4</b><td><b>4</b><td><b>12</b><td><b>10</b><td><b>10</b><td><b>14</b><td><b>16</b><td><b>16</b><td><b>19</b><td align="right"><b>123</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>shift-enter.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter1">ShiftEnter1</a><td>S<td>S<td>S<td>S<td>S<td>✗<td>✓<td>S<td>S<td>S<td>S<td>S<td>S<td align="right">1<td>core</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter2">ShiftEnter2</a><td>S<td>S<td>S<td>S<td>S<td>✗<td>✓<td>S<td>S<td>S<td>S<td>S<td>S<td align="right">1<td>common</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter3">ShiftEnter3</a><td>S<td>S<td>S<td>S<td>S<td>✗<td>✓<td>S<td>S<td>S<td>S<td>S<td>S<td align="right">1<td>edge</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter4">ShiftEnter4</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>S<td>✓<td>✓<td>S<td align="right">0<td>core</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter5">ShiftEnter5</a><td>(S)<td>(S)<td>(S)<td>✓<td>(S)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>common</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter6">ShiftEnter6</a><td>(S)<td>(S)<td>(S)<td>(✗)<td>(S)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">8<td>edge</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter7">ShiftEnter7</a><td>(S)<td>(S)<td>(S)<td>✓<td>(S)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter8">ShiftEnter8</a><td>(S)<td>(S)<td>(S)<td>✓<td>(S)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>edge</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter9">ShiftEnter9</a><td>(S)<td>(S)<td>(S)<td>✓<td>(S)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>rare</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter10">ShiftEnter10</a><td><td><td><td><td><td><td>✗<td>S<td><td>✗<td>S<td>S<td>S<td align="right">2<td>edge</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter11">ShiftEnter11</a><td><td><td><td><td><td><td>S<td>S<td><td>S<td>S<td>S<td>S<td align="right">0<td>common</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter12">ShiftEnter12</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter13">ShiftEnter13</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter14">ShiftEnter14</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter15">ShiftEnter15</a><td><td><td><td><td><td><td>S<td>S<td><td>✗<td>S<td>S<td>✗<td align="right">2<td>common</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter16">ShiftEnter16</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter17">ShiftEnter17</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✓<td>✓<td>S<td>✗<td>✗<td>S<td align="right">4<td>common</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter18">ShiftEnter18</a><td>(S)<td>(S)<td>(S)<td>(C)<td>(S)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>rare</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter19">ShiftEnter19</a><td>(S)<td>(S)<td>(S)<td>✓<td>(S)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>rare</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter20">ShiftEnter20</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>(✗)<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>rare</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter21">ShiftEnter21</a><td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>✗<td>S<td align="right">12<td>edge</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter22">ShiftEnter22</a><td><td><td><td><td><td><td><td><td><td>✓<td>✓<td>✓<td>S<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter22b">ShiftEnter22b</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter23">ShiftEnter23</a><td>(S)<td>(S)<td>(S)<td>✓<td>(S)<td>(✗)<td>✗<td>✗<td>(S)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>rare</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter24">ShiftEnter24</a><td><td><td><td><td><td><td>E<td>E<td><td>✗<td>✗<td>E<td>✗<td align="right">3<td>rare</tr>
<tr><td><a href="../spec/shift-enter.md#shiftenter25">ShiftEnter25</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><b>total</b><td><b>1</b><td><b>1</b><td><b>1</b><td><b>2</b><td><b>1</b><td><b>14</b><td><b>15</b><td><b>13</b><td><b>1</b><td><b>16</b><td><b>15</b><td><b>14</b><td><b>14</b><td align="right"><b>108</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>tasks.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/tasks.md#taskenter1">TaskEnter1</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/tasks.md#taskenter2">TaskEnter2</a><td><td><td><td>(✗)<td><td><td>✓<td>✓<td>(✗)<td>✗<td>✓<td>✓<td>✗<td align="right">4<td>common</tr>
<tr><td><a href="../spec/tasks.md#taskenter3">TaskEnter3</a><td>(✗)<td>(✗)<td>(S)<td>(C)<td>(✗)<td>(S)<td>S<td>S<td>(S)<td>✓<td>S<td>S<td>✗<td align="right">4<td>edge</tr>
<tr><td><a href="../spec/tasks.md#taskenter4">TaskEnter4</a><td><td><td><td>✓<td><td><td>✓<td><td><td><td><td><td>✗<td align="right">1<td>common</tr>
<tr><td><a href="../spec/tasks.md#taskenter5">TaskEnter5</a><td><td><td><td>(✗)<td><td><td>✗<td><td>(✗)<td>✗<td><td><td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/tasks.md#taskenter6">TaskEnter6</a><td><td><td><td>(✗)<td><td><td>✗<td><td>(✗)<td>✗<td><td><td>✗<td align="right">5<td>edge</tr>
<tr><td><a href="../spec/tasks.md#taskenter7">TaskEnter7</a><td><td><td>(✗)<td>(S)<td>(✗)<td>(✗)<td><td>✗<td>(S)<td>✗<td>✓<td>✓<td>✗<td align="right">6<td>edge</tr>
<tr><td><a href="../spec/tasks.md#taskbackspace1">TaskBackspace1</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td><td>✗<td align="right">4<td>rare</tr>
<tr><td><a href="../spec/tasks.md#taskbackspace2">TaskBackspace2</a><td><td><td><td>✓<td><td><td>✗<td><td>✓<td>✗<td><td><td><td align="right">2<td>common</tr>
<tr><td><a href="../spec/tasks.md#taskbackspace3">TaskBackspace3</a><td><td><td><td>✓<td><td><td>✗<td><td>✓<td>✗<td><td><td><td align="right">2<td>common</tr>
<tr><td><a href="../spec/tasks.md#taskbackspace4">TaskBackspace4</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/tasks.md#taskbackspace5">TaskBackspace5</a><td><td><td><td><td><td><td><td>✓<td><td><td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/tasks.md#taskbackspace6">TaskBackspace6</a><td><td><td><td><td><td><td>✗<td><td><td>✗<td>✗<td><td>✗<td align="right">4<td>rare</tr>
<tr><td><a href="../spec/tasks.md#taskbackspace7">TaskBackspace7</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>rare</tr>
<tr><td><a href="../spec/tasks.md#taskdelete1">TaskDelete1</a><td><td><td><td>(✗)<td><td><td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/tasks.md#taskdelete2">TaskDelete2</a><td><td><td><td>(✗)<td><td><td>✗<td>✓<td>(✗)<td>✗<td>✗<td>✗<td>✗<td align="right">7<td>rare</tr>
<tr><td><a href="../spec/tasks.md#taskdelete3">TaskDelete3</a><td><td><td><td>(✗)<td><td><td>✓<td>✗<td>✓<td>✗<td>✗<td>✗<td>✗<td align="right">6<td>rare</tr>
<tr><td><b>total</b><td><b>1</b><td><b>1</b><td><b>1</b><td><b>6</b><td><b>2</b><td><b>1</b><td><b>8</b><td><b>4</b><td><b>4</b><td><b>12</b><td><b>6</b><td><b>4</b><td><b>12</b><td align="right"><b>62</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td><b>typing.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/typing.md#typing1">Typing1</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/typing.md#typing2">Typing2</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>rare</tr>
<tr><td><a href="../spec/typing.md#typing3">Typing3</a><td><td><td><td><td><td><td>✓<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/typing.md#typing4">Typing4</a><td><td><td><td><td><td><td><td><td><td><td><td><td><td align="right">0<td>edge</tr>
<tr><td><b>total</b><td><td><td><td><td><td><td><b>0</b><td><b>0</b><td><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td align="right"><b>0</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td colspan="16"></tr>
<tr><td><b>undo.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/undo.md#undo1">Undo1</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>C<td align="right">0<td>core</tr>
<tr><td><a href="../spec/undo.md#undo2">Undo2</a><td><td><td><td><td><td><td>C<td>✓<td><td>✓<td>✓<td>✓<td>✓<td align="right">0<td>common</tr>
<tr><td><a href="../spec/undo.md#undo3">Undo3</a><td><td><td><td><td><td><td>✗<td>✗<td><td>✗<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/undo.md#undo4">Undo4</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><a href="../spec/undo.md#undo5">Undo5</a><td>✓<td>✓<td>✓<td>✓<td>✓<td>✓<td>✗<td>✗<td>✗<td>✓<td>✗<td>✗<td>✗<td align="right">6<td>common</tr>
<tr><td><b>total</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>0</b><td><b>3</b><td><b>3</b><td><b>2</b><td><b>1</b><td><b>3</b><td><b>3</b><td><b>3</b><td align="right"><b>18</b><td></tr>
<tr><td colspan="16"></tr>
<tr><td><b>z-open.md</b><td><b><a href="logseq/sxs.md">logseq</a></b><td><b><a href="tine/sxs.md">tine</a></b><td><b><a href="dynalist/sxs.md">dynalist</a></b><td><b><a href="siyuan/sxs.md">siyuan</a></b><td><b><a href="roam/sxs.md">roam</a></b><td><b><a href="workflowy/sxs.md">workflowy</a></b><td><b><a href="obsidian-true-outliner/sxs.md" title="obsidian-true-outliner">TO</a></b><td><b><a href="obsidian-outliner/sxs.md" title="obsidian-outliner">outliner</a></b><td><b><a href="blocknote/sxs.md">blocknote</a></b><td><b><a href="silverbullet/sxs.md">silverbullet</a></b><td><b><a href="obsidian/sxs.md">obsidian</a></b><td><b><a href="obsidian-lp/sxs.md" title="obsidian-lp">lp</a></b><td><b><a href="emacs-markdown/sxs.md" title="emacs-markdown">emacs</a></b><td><b>disagree</b><td><b>rank</b></tr>
<tr><td><a href="../spec/z-open.md#open2">Open2</a><td>(✗)<td><td>✓<td><td><td><td><td><td><td><td><td><td>✗<td align="right">2<td>rare</tr>
<tr><td><b>total</b><td><b>1</b><td><td><b>0</b><td><td><td><td><td><td><td><td><td><td><b>1</b><td align="right"><b>2</b><td></tr>
</table>
