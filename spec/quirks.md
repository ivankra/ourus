# Quirks

Cases of the options, and the values, that model one app's mechanics rather than a rule an editor of
Markdown would want: options named `quirk…`, their values `default` and the apps' by name, and a
value named after an app in another option (`backspaceAtItemStart: logseq`). Each case sets its option; what ourus does by default is
in the command's own file. They are here so that an app that declares the quirk is measured against
it in the SxS, not so that a host picks one by default.

## Quirk1

With `quirkEnterMidHeading: workflowy`, the first half is a plain item, and the heading goes with the rest
and the item's children, as Roam, WorkFlowy and Dynalist do, a heading being a block's attribute
there and the new block the one above.

```yaml
tags: edge
quirkEnterMidHeading: workflowy
```

```buffer
- # Hel┃lo
  - kid
```

> enter

```buffer
- Hel
- # ┃lo
  - kid
```

## Quirk1b

With `quirkEnterMidHeading: workflowy`, a heading's text before the caret is a paragraph above it, the
heading keeping the rest and its section.

```yaml
tags: edge
quirkEnterMidHeading: workflowy
```

```buffer
# Hel┃lo

text
```

> enter

```buffer
Hel
# ┃lo

text
```

## Quirk1c

The same in a setext title, the underline staying with the heading: the text before the caret is a
paragraph above it, set apart by a blank line, or it would be the title's first line.

```yaml
tags: rare
quirkEnterMidHeading: workflowy
```

```buffer
Hel┃lo
---

text
```

> enter

```buffer
Hel

┃lo
---

text
```

## Quirk2

With `quirkPasteCaret: roam`, the caret is at the end of the first pasted item, as Roam leaves it;
typing goes on there.

```yaml
tags: rare
quirkPasteCaret: roam
clipboard: |-
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
- x┃
- y
- b
```

## Quirk2b

With `quirkPasteCaret: athens`, the caret is at the start of the first pasted item, as Athens leaves
it.

```yaml
tags: rare
quirkPasteCaret: athens
clipboard: |-
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
- ┃x
- y
- b
```

## Quirk3

With `backspaceAtItemStart: logseq`, a numbered item's number goes first: the item is a
bulleted one, as Logseq and Tine make it, numbering being a block's property there; a second press
joins it.

```yaml
tags: rare
backspaceAtItemStart: logseq
```

```buffer
1. a
2. ┃b
```

> deleteContentBackward

```buffer
1. a
- ┃b
```

> deleteContentBackward

```buffer
1. a┃b
```

## Quirk4

With `quirkPasteText: dynalist`, a clipboard of text alone is plain text: pasted as plain paste puts
it, a line an item (`pastePlainLines: enter`), its list markers text, as Dynalist reads no Markdown
from text, only from a clipboard's HTML.

```yaml
tags: rare
quirkPasteText: dynalist
pastePlainLines: enter
clipboard: |-
  - x
  - y
```

```buffer
- a┃
- b
```

> paste

```buffer
- a- x
- \- y┃
- b
```
