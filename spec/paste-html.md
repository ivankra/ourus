# Paste HTML

How [paste](paste.md) reads a clipboard's HTML: converted to Markdown, which is then pasted as any
Markdown is. A copy from a rendered page, or from an app that renders its content, has its structure
in its HTML alone: its text is the page's words, without markers or indentation. Each case here
pastes into an empty document, which the paste fills whatever it is, so the buffer after it is the
Markdown the HTML converts to; where it lands elsewhere is paste.md's.

The HTML is as the pages and the apps write it, cut down to the case's point: a browser's copy, and
the outliners' own copies (§2.3), each of which has its own shape of a list.

- Whitespace between elements is no text, as a browser's layout has it; in text, a run of spaces and
  line breaks is one space.
- A list is tight, unless an item holds more than one paragraph.
- Text that would read as Markdown is escaped: the HTML's text is text.
- Comments, `<style>`, `<script>` and the document's head are not content.

## PasteHtml1

A nested list as a browser copies it: the child list inside its item.

```yaml
tags: common
clipboard:
  text/plain: |-
    x
    y
    z
  text/html: '<ul><li>x<ul><li>y</li></ul></li><li>z</li></ul>'
```

```markdown
┃
```

> paste

```markdown
- x
  - y
- z┃
```

## PasteHtml2

Line breaks between the elements (as commonmark renders HTML, and as Obsidian's copy has it) are no
text: the same list.

```yaml
tags: common
clipboard:
  text/plain: |-
    x
    y
    z
  text/html: |-
    <ul>
    <li>x
    <ul>
    <li>y</li>
    </ul>
    </li>
    <li>z</li>
    </ul>
```

```markdown
┃
```

> paste

```markdown
- x
  - y
- z┃
```

## PasteHtml3

Logseq's copy: a child list right in the list, after its item rather than inside it, which nests it
under the item before; Chromium's notice about the XSLT the copy was made with, injected into the
list (a `div` in the XHTML namespace), is no item.

```yaml
tags: rare
clipboard:
  text/plain: |-
    - x **b**
    →- y
    - z
  text/html: |-
    <ul><div xmlns="http://www.w3.org/1999/xhtml">This site uses XSLT; that functionality is being <a href="https://chromestatus.com/feature/4709671889534976">removed from this browser very soon</a>.</div>
      <li>x <b>b</b></li>
      <ul>
        <li>y</li>
      </ul>
      <li>z</li>
    </ul>
```

```markdown
┃
```

> paste

```markdown
- x **b**
  - y
- z┃
```

## PasteHtml4

RemNote's copy: its items are `div`s in the list, not `li`s.

```yaml
tags: rare
clipboard:
  text/plain: |-
    x b
        y
    z
  text/html: '<ul><div rem="true" showbullet="true">x <b>b</b><ul><div rem="true" showbullet="true">y</div></ul></div><div rem="true" showbullet="true">z</div></ul>'
```

```markdown
┃
```

> paste

```markdown
- x **b**
  - y
- z┃
```

## PasteHtml5

An item's text in a paragraph of its own (BlockNote's copy, SiYuan's): one paragraph is the item's
text, and the list stays tight.

```yaml
tags: rare
clipboard:
  text/plain: |-
    x
    y
    z
  text/html: '<ul><li><p class="bn-inline-content">x</p><ul><li data-nesting-level="1"><p class="bn-inline-content">y</p></li></ul></li><li><p class="bn-inline-content">z</p></li></ul>'
```

```markdown
┃
```

> paste

```markdown
- x
  - y
- z┃
```

## PasteHtml6

Tana's copy: the top level as paragraphs, a list between them.

```yaml
tags: rare
clipboard:
  text/plain: |-
    x
    - y
    z
  text/html: '<html><body><p>x</p><ul><li><p>y</p></li></ul><p>z</p></body></html>'
```

```markdown
┃
```

> paste

```markdown
x

- y

z┃
```

## PasteHtml7

An ordered list keeps the number it starts from.

```yaml
tags: common
clipboard:
  text/plain: |-
    c
    d
  text/html: '<ol start="3"><li>c</li><li>d</li></ol>'
```

```markdown
┃
```

> paste

```markdown
3. c
4. d┃
```

## PasteHtml8

A checkbox starting an item is a task's (GitHub's task list): the box has no text, and is lost
where it isn't read.

```yaml
tags: common
clipboard:
  text/plain: |2-
     done
     todo
  text/html: '<ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" disabled="" class="task-list-item-checkbox" checked=""> done</li><li class="task-list-item"><input type="checkbox" disabled="" class="task-list-item-checkbox"> todo</li></ul>'
```

```markdown
┃
```

> paste

```markdown
- [x] done
- [ ] todo┃
```

## PasteHtml9

A code block keeps its language, from its `language-` class.

```yaml
tags: common
clipboard:
  text/plain: |-
    let a = 1;
    let b = 2;
  text/html: |-
    <pre><code class="language-js">let a = 1;
    let b = 2;
    </code></pre>
```

```markdown
┃
```

> paste

````markdown
```js
let a = 1;
let b = 2;┃
```
````

## PasteHtml10

A heading, and a paragraph with inline formatting.

```yaml
tags: common
clipboard:
  text/plain: |-
    Title
    para bold c
  text/html: '<h2>Title</h2><p>para <b>bold</b> <code>c</code></p>'
```

```markdown
┃
```

> paste

```markdown
## Title

para **bold** `c`┃
```

## PasteHtml11

A line break in a paragraph is a line of its text.

```yaml
tags: common
clipboard:
  text/plain: |-
    line one
    line two

    p2
  text/html: '<p>line one<br>line two</p><p>p2</p>'
```

```markdown
┃
```

> paste

```markdown
line one
line two

p2┃
```

## PasteHtml12

A quote and its paragraphs.

```yaml
tags: common
clipboard:
  text/plain: |-
    q1

    q2
  text/html: '<blockquote><p>q1</p><p>q2</p></blockquote>'
```

```markdown
┃
```

> paste

```markdown
> q1
>
> q2┃
```

## PasteHtml13

A table, with its columns' alignment.

```yaml
tags: common
clipboard:
  text/plain: |-
    a→b
    1→2
  text/html: '<table><thead><tr><th>a</th><th align="right">b</th></tr></thead><tbody><tr><td>1</td><td align="right">2</td></tr></tbody></table>'
```

```markdown
┃
```

> paste

```markdown
| a | b |
| --- | ---: |
| 1 | 2 |┃
```

## PasteHtml14

Inline formatting: bold, italics, code, strikethrough, a link.

```yaml
tags: common
clipboard:
  text/plain: |-
    a b i c s l
    z
  text/html: '<ul><li>a <strong>b</strong> <em>i</em> <code>c</code> <del>s</del> <a href="https://e.x/p">l</a></li><li>z</li></ul>'
```

```markdown
┃
```

> paste

```markdown
- a **b** *i* `c` ~~s~~ [l](https://e.x/p)
- z┃
```

## PasteHtml15

The HTML's text is text: what would read as Markdown in it is escaped.

```yaml
tags: common
clipboard:
  text/plain: |-
    1. not a list, *x* and [y]
    # not a heading
  text/html: '<ul><li>1. not a list, *x* and [y]</li><li># not a heading</li></ul>'
```

```markdown
┃
```

> paste

```markdown
- 1\. not a list, \*x\* and \[y\]
- \# not a heading┃
```

## PasteHtml16

GitHub's rendered Markdown: a heading's permalink (a link with no text) is nothing to read, and a code
block's language is on the block around its `pre`, whose copy button is no text either.

```yaml
tags: common
clipboard:
  text/plain: |-
    Setup
    npm install
  text/html: '<div class="markdown-heading"><h2 class="heading-element">Setup</h2><a class="anchor" aria-label="Permalink: Setup" href="#setup"><svg class="octicon octicon-link" viewBox="0 0 16 16"><path d="m7.775 3.275"></path></svg></a></div><div class="highlight highlight-source-shell"><pre>npm install</pre><div class="zeroclipboard-container"><clipboard-copy aria-label="Copy" class="ClipboardButton btn" value="npm install" role="button"><svg class="octicon octicon-copy"><path d="M0 6.75"></path></svg></clipboard-copy></div></div>'
```

```markdown
┃
```

> paste

````markdown
## Setup

```shell
npm install┃
```
````

## PasteHtml17

Google Docs: its copy is wrapped in a `b` that says it isn't bold (`font-weight:normal`), its
formatting is in its spans' styles, and a nested list is a list right in the list.

```yaml
tags: common
clipboard:
  text/plain: |-
    Bold start
    nested
  text/html: '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-6a1b2c3d"><ul style="margin-top:0;"><li dir="ltr" aria-level="1"><p dir="ltr" role="presentation"><span style="font-weight:700;font-style:normal;">Bold</span><span style="font-weight:400;font-style:normal;"> start</span></p></li><ul style="margin-top:0;"><li dir="ltr" aria-level="2"><p dir="ltr" role="presentation"><span style="font-weight:400;font-style:italic;">nested</span></p></li></ul></ul></b>'
```

```markdown
┃
```

> paste

```markdown
- **Bold** start
  - *nested*┃
```

## PasteHtml18

Word: a list is paragraphs, each its level in its style and its bullet as text, which isn't the
item's.

```yaml
tags: common
clipboard:
  text/plain: |-
    ·       one
    o       nested
  text/html: |-
    <html><body><!--StartFragment--><p class=MsoListParagraphCxSpFirst style='margin-left:.5in;text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>one<o:p></o:p></p>
    <p class=MsoListParagraphCxSpLast style='margin-left:1.0in;text-indent:-.25in;mso-list:l0 level2 lfo1'><![if !supportLists]><span style='font-family:"Courier New"'><span style='mso-list:Ignore'>o<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>nested<o:p></o:p></p><!--EndFragment--></body></html>
```

```markdown
┃
```

> paste

```markdown
- one
  - nested┃
```

## PasteHtml19

An LLM's answer: its code block's `pre` also holds the language's label and a copy button; the code
is its `code`'s text, the language its class's.

```yaml
tags: common
clipboard:
  text/plain: |-
    javascript
    Copy code
    let a = 1;
  text/html: '<pre class="overflow-visible!"><div class="contain-inline-size"><div class="flex items-center">javascript</div><div class="sticky top-9"><button aria-label="Copy">Copy code</button></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-javascript"><span class="hljs-keyword">let</span> a = <span class="hljs-number">1</span>;</code></div></div></pre>'
```

```markdown
┃
```

> paste

````markdown
```javascript
let a = 1;┃
```
````

## PasteHtml20

A loose task as GFM renders it, its checkbox before the item's paragraph: a task, its text that
paragraph's (B424).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: |-
    other
    done
  text/html: '<ul><li><p>other</p></li><li><input type="checkbox" checked="" disabled="" /> <p>done</p></li></ul>'
```

```markdown
┃
```

> paste

```markdown
- other
- [x] done┃
```

## PasteHtml21

A rule alone in an item: written `***`, which a `-` bullet and it don't read as one rule (B425).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<ul><li><hr></li><li>next</li></ul>'
```

```markdown
┃
```

> paste

```markdown
- ***
- next┃
```

## PasteHtml22

A link title holding `&amp;copy;`: the entity decoded once, its `&` escaped (B426).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<p><a href="u" title="&amp;copy;">x</a></p>'
```

```markdown
┃
```

> paste

```markdown
[x](u "\&copy;")┃
```

## PasteHtml23

A link destination with two spaces: both kept, in angle brackets (B427).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<p><a href="x&#32;&#32;y">x</a></p>'
```

```markdown
┃
```

> paste

```markdown
[x](<x  y>)┃
```

## PasteHtml24

A link destination with parentheses nested 33 deep, past what a reader follows: in angle brackets (B428).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<p><a href="a(((((((((((((((((((((((((((((((((b)))))))))))))))))))))))))))))))))">link</a></p>'
```

```markdown
┃
```

> paste

```markdown
[link](<a(((((((((((((((((((((((((((((((((b)))))))))))))))))))))))))))))))))>)┃
```

## PasteHtml25

A table nested in a cell: its cells apart by a space (B429).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<table><tr><td>a<table><tr><td>b</td><td>c</td></tr></table>d</td></tr></table>'
```

```markdown
┃
```

> paste

```markdown
| a b c d |
| --- |┃
```

## PasteHtml26

A cell with `rowspan="0"`: it spans its row group's rest (B430).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<table><tr><td rowspan="0">a</td><td>b</td></tr><tr><td>c</td></tr></table>'
```

```markdown
┃
```

> paste

```markdown
| a | b |
| --- | --- |
|  | c |┃
```

## PasteHtml27

A head cell spanning two rows: its span ends with the head (B431).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<table><thead><tr><th rowspan="2">A</th><th>B</th></tr></thead><tbody><tr><td>C</td><td>D</td></tr></tbody></table>'
```

```markdown
┃
```

> paste

```markdown
| A | B |
| --- | --- |
| C | D |┃
```

## PasteHtml28

`font-style: inherit` inside italic: italic still (B435).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<div style="font-style:italic"><p><span style="font-style:inherit">x</span></p></div>'
```

```markdown
┃
```

> paste

```markdown
*x*┃
```

## PasteHtml29

`text-decoration: none` inside struck text: struck still, a decoration drawn through its descendants (B436).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<p><span style="text-decoration:line-through">a<span style="text-decoration:none">b</span>c</span></p>'
```

```markdown
┃
```

> paste

```markdown
~~abc~~┃
```

## PasteHtml30

A table cell's bold style (B437).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<table><tr><td style="font-weight:bold">bold</td></tr></table>'
```

```markdown
┃
```

> paste

```markdown
| **bold** |
| --- |┃
```

## PasteHtml31

A list's bold style, its items' (B438).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<ul style="font-weight:bold"><li>x</li></ul>'
```

```markdown
┃
```

> paste

```markdown
- **x**┃
```

## PasteHtml32

A link's own bold style, around the link (B439).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<p><a style="font-weight:bold" href="u">x</a></p>'
```

```markdown
┃
```

> paste

```markdown
**[x](u)**┃
```

## PasteHtml33

A bold tag around blocks: each block's text bold (B440).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<b><p>a</p><p>b</p></b>'
```

```markdown
┃
```

> paste

```markdown
**a**

**b**┃
```

## PasteHtml34

A link around blocks: each block's text the link's (B441).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<a href="u"><p>a</p><p>b</p></a>'
```

```markdown
┃
```

> paste

```markdown
[a](u)

[b](u)┃
```

## PasteHtml35

Obsidian: ourus's own HTML of a callout, pasted without its Markdown: a callout again, its type and
title its first line (B373).

```yaml
tags: rare
flavor: obsidian
clipboard:
  text/plain: "Title"
  text/html: '<div class="callout" data-callout="note"><div class="callout-title">Title</div><div class="callout-content"><p>body text</p></div></div>'
```

```markdown
┃
```

> paste

```markdown
> [!note] Title
> body text┃
```

## PasteHtml36

Obsidian: a wiki link and inline math as ourus renders them: their syntax again (B374, B375).

```yaml
tags: rare
flavor: obsidian
clipboard:
  text/plain: "a link b x"
  text/html: '<p>a <a data-href="link" href="link" class="internal-link">link</a> b <span class="math math-inline">x</span></p>'
```

```markdown
┃
```

> paste

```markdown
a [[link]] b $x$┃
```

## PasteHtml37

Bold of two spellings side by side, an empty span between: one run (B432).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<p><b>a</b><span></span><span style="font-weight:bold">b</span></p>'
```

```markdown
┃
```

> paste

```markdown
**ab**┃
```

## PasteHtml38

Code side by side, one in a plain wrapper: one code span (B432).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<p><code>a</code><span><code>b</code></span></p>'
```

```markdown
┃
```

> paste

```markdown
`ab`┃
```

## PasteHtml39

Bold turned off inside a bold run, its blanks outside the bold with it (B433).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<p><b>a<span style="font-weight:normal"> b </span>c</b></p>'
```

```markdown
┃
```

> paste

```markdown
**a** b **c**┃
```

## PasteHtml40

Bold turned off at a run's start: no empty run before it (B433).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<p><b><span style="font-weight:normal">a</span>b</b></p>'
```

```markdown
┃
```

> paste

```markdown
a**b**┃
```

## PasteHtml41

Bold edged by em spaces: the spaces outside it (B434).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "x"
  text/html: '<p><b> x </b></p>'
```

```markdown
┃
```

> paste

```markdown
 **x** ┃
```

## PasteHtml42

Italic inside a bold's end and after it: the second italic spelled with underscores, which a
`***` closing both can't swallow (B459).

```yaml
tags: rare
flavor: gfm
clipboard:
  text/plain: "abc"
  text/html: '<p><b>a<i>b</i></b><i>c</i></p>'
```

```markdown
┃
```

> paste

```markdown
**a*b***_c_┃
```
