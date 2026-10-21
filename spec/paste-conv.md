# Paste: which format is read

A copy carries more than one format, and they say different things: a Markdown editor's copy is its
source, as text; a rendered page's is its HTML, its text the page's words without markers; a Markdown
app's own copy has the Markdown as `text/markdown` too. [Paste](paste.md) reads one of them as
Markdown, in this order, and places what it reads; how HTML converts is
[paste-html.md](paste-html.md)'s.

1. `text/markdown`, the Markdown as its app wrote it;
2. the text, where the HTML says the text is the app's Markdown source (ourus's mark, SiYuan's), or the HTML
   is a picture of the text (a code editor's copy);
3. HTML with structure (lists, headings, paragraphs, code, quotes, tables), converted to Markdown;
4. HTML with inline formatting, a phrase, converted: one line of text, its formatting kept;
5. the text, as Markdown (every case of [paste.md](paste.md) and [paste-list.md](paste-list.md)).

## PasteConvMD

A Markdown app's own copy has the Markdown as `text/markdown`, which is read before the text (here
the words alone, as the page showed them).

```yaml
tags: edge
clipboard:
  text/plain: |
    x
    y
  text/markdown: |
    - x
    - y
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
- x
- y┃
- b
```

## PasteConvHTML

A copy from a rendered page: its text is the page's words, without markers or indentation, and the
structure is in its HTML, which is read.

```yaml
tags: common
clipboard:
  text/plain: |-
    x
    y
  text/html: '<ul><li>x</li><li>y</li></ul>'
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
- x
- y┃
- b
```

## PasteConvVSC

Markdown copied from a code editor (VS Code) comes with HTML that is a picture of its text, coloured
lines in a `white-space: pre` block, and the editor's mark beside it: the text is read, as Markdown,
not the picture.

```yaml
tags: edge
clipboard:
  text/plain: |
    - x
    - y
  text/html: '<div style="white-space: pre;"><div><span style="color: #569cd6;">-</span><span> x</span></div><div><span style="color: #569cd6;">-</span><span> y</span></div></div>'
  vscode-editor-data: '{"version":1,"isFromEmptySelection":false,"mode":"markdown"}'
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
- x
- y┃
- b
```

## PasteConvPhrase

A phrase copied from a page or a rich-text app: HTML with formatting but no structure. Converted, it
is one line of text that keeps its formatting, put in at the caret, as the host's paste of the text
would put the words.

```yaml
tags: common
clipboard:
  text/plain: "x y"
  text/html: '<span>x <b>y</b></span>'
```

```buffer
- a┃b
```

> paste

```buffer
- ax **y**┃b
```

## PasteConvPhraseInCode

In code a phrase is the code's text: its formatting, as Markdown, would be text there.

```yaml
tags: edge
clipboard:
  text/plain: "x y"
  text/html: '<span>x <b>y</b></span>'
```

````buffer
```
a┃
```
````

> paste

````buffer
```
ax y┃
```
````

## PasteConvUS

ourus's own copy ([copy.md](copy.md)) where the `text/markdown` was lost on the way (Chromium keeps
it only between its own pages): its HTML's mark says the text is the source, read as written (`_b_`,
which converted HTML would write `*b*`).

```yaml
tags: edge
clipboard:
  text/plain: |-
    - x _b_
    - y
  text/html: |-
    <!-- ourus --><ul>
    <li>x <em>b</em></li>
    <li>y</li>
    </ul>
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
- x _b_
- y┃
- b
```
