# Fenced code

Enter (`enter`) and Shift-Enter (`shiftEnter`) in a fenced code block: a new line,
split at the caret. The code is payload, so nothing else changes, but the new line stays in the
containers the block is in: an item's continuation indentation, a quote's `>`. On a code line, the
line's own indentation carries over, as code editors do.

The code lines are ourus's with `handleFenceContents: true` (the default). A host that edits code
itself (language-aware indentation, embedded code editors) sets it to `false`, and Enter on a code
line is the host's ([Fence10](#fence10)). The fence lines are ourus's either way.

After a closing fence that ends an item's content, Enter makes the next item and Shift-Enter a new
line in the item (Fence7–7d).

Backspace at a code line's start and Delete at its end join code lines, the containers' prefix on
the joined line (an item's indentation, a quote's `>`) going with the line break; against a fence
line they are refused (Fence16–20). Tab and Shift-Tab in code are the host's (Fence21). Pasted text
on a code line is code ([Paste22](paste.md#paste22)).

## Fence1

Enter in a fenced block inside an item keeps the item's indentation.

At column 0 the new line would end the item; with the item's indentation, what is typed there
stays in the code, in the item.

````buffer
- a
  ```
  code┃
  ```
````

> enter

````buffer
- a
  ```
  code
  ┃
  ```
````

```result
applied
```

> "x"

````buffer
- a
  ```
  code
  x┃
  ```
````

## Fence2

Enter in the middle of a code line splits it.

````buffer
```
co┃de
```
````

> enter

````buffer
```
co
┃de
```
````

## Fence3

The code line's own indentation carries over.

````buffer
- a
  ```
    nested┃
  ```
````

> enter

````buffer
- a
  ```
    nested
    ┃
  ```
````

## Fence4

In a quote, the new line keeps the `>`.

````buffer
> ```
> code┃
> ```
````

> enter

````buffer
> ```
> code
> ┃
> ```
````

## Fence5

When the fence is the item's text, the new line takes the item's continuation indentation.

````buffer
- ```
  code┃
  ```
````

> enter

````buffer
- ```
  code
  ┃
  ```
````

## Fence6

After the opening fence's info string, the new line is the block's first line.

````buffer
- a
  ```js┃
  code
  ```
````

> enter

````buffer
- a
  ```js
  ┃
  code
  ```
````

## Fence7

After the closing fence that ends an item's content, Enter makes the next item, as at the end of the
item's text (as Logseq does); Shift-Enter makes a new line in the item instead
([Fence7b](#fence7b)).

````buffer
- a
  ```
  code
  ```┃
````

> enter "b"

````buffer
- a
  ```
  code
  ```
- b┃
````

## Fence7b

After the closing fence, Shift-Enter makes a new line in the item: what is typed there is the item's
next paragraph.

````buffer
- a
  ```
  code
  ```┃
````

> shiftEnter "x"

````buffer
- a
  ```
  code
  ```
  x┃
````

## Fence7c

With child items after the fence, Enter after it makes the first child, as at the end of the text of
an item with children.

````buffer
- a
  ```
  code
  ```┃
  - c
````

> enter

````buffer
- a
  ```
  code
  ```
  - ┃
  - c
````

## Fence7d

With a paragraph after the fence in the item, Enter after the fence makes a new line in the item, as
Shift-Enter does: a new item there would come before the paragraph.

````buffer
- a
  ```
  code
  ```┃

  para
````

> enter

````buffer
- a
  ```
  code
  ```
  ┃

  para
````

## Fence8

Shift-Enter in a fenced block makes a new line, as Enter does.

````buffer
- a
  ```
  code┃
  ```
````

> shiftEnter

````buffer
- a
  ```
  code
  ┃
  ```
````

## Fence9

Inside a fence's run of backticks, Enter is refused: a new line there would break the fence.

````buffer
`┃``
code
```
````

> enter

```result
rejected: not-expressible
```

## Fence10

With `handleFenceContents: false`, Enter on a code line is the host's.

```config
handleFenceContents: false
```

````buffer
- a
  ```
  code┃
  ```
````

> enter

```result
notApplicable
```

## Fence11

With `handleFenceContents: false`, the fence lines are still ourus's.

```config
handleFenceContents: false
```

````buffer
- a
  ```js┃
  code
  ```
````

> enter

````buffer
- a
  ```js
  ┃
  code
  ```
````

```result
applied
```

## Fence12

At the start of the opening fence, Enter opens a line above the block, the block staying with the
caret.

````buffer
- a
  ┃```
  code
  ```
````

> enter

````buffer
- a

  ┃```
  code
  ```
````

## Fence13

At the start of the closing fence, Enter adds an empty last line to the code, the fence staying with
the caret.

````buffer
- a
  ```
  code
  ┃```
````

> enter

````buffer
- a
  ```
  code

  ┃```
````

## Fence14

Inside the closing fence's run of backticks, Enter is refused too.

````buffer
```
code
``┃`
````

> enter

```result
rejected: not-expressible
```

## Fence15

At the start of a fence that is an item's text, Enter is at the item's text start: an empty item
above, the caret going into it.

````buffer
- ┃```
  code
  ```
````

> enter

````buffer
- ┃
- ```
  code
  ```
````

## Fence16

Backspace at the start of a code line joins it to the line above; in an item, the item's indentation
on the joined line goes too.

The indentation is the item's, not code: deleting one space of it would end the item and the block.

````buffer
- a
  ```
  one
  ┃two
  ```
````

> deleteContentBackward

````buffer
- a
  ```
  one┃two
  ```
````

## Fence17

Backspace at the start of the first code line is refused: the code would join the opening fence, as
its info string.

````buffer
- a
  ```
  ┃one
  ```
````

> deleteContentBackward

```result
rejected: not-expressible
```

## Fence18

Delete at the end of a code line joins the next line, without the item's indentation.

````buffer
- a
  ```
  one┃
  two
  ```
````

> deleteContentForward

````buffer
- a
  ```
  one┃two
  ```
````

## Fence19

Delete at the end of the last code line is refused: the closing fence would join the code.

````buffer
- a
  ```
  one┃
  ```
````

> deleteContentForward

```result
rejected: not-expressible
```

## Fence20

In a quote, a joined code line's `>` goes with its line break.

````buffer
> ```
> one
> ┃two
> ```
````

> deleteContentBackward

````buffer
> ```
> one┃two
> ```
````

## Fence21

Tab and Shift-Tab on a code line are the host's: they indent the code, as in Logseq and Obsidian.

````buffer
- a
- b
  ```
  x┃
  ```
````

> indent

```result
notApplicable
```

> outdent

```result
notApplicable
```

## Fence22

After Shift-Enter past a closing fence, Enter on the empty line leaves the item: the line becomes
the item's next sibling ([Enter37](enter.md#enter37)).

````buffer
- a
  - b
    ```
    x
    ```┃
````

> shiftEnter enter

````buffer
- a
  - b
    ```
    x
    ```
  - ┃
````
