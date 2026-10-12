# Fenced code

Enter (`enter`) and Shift-Enter (`shiftEnter`) in a fenced code block: a new line,
split at the caret. The code is payload, so nothing else changes, but the new line stays in the
containers the block is in: an item's continuation indentation, a quote's `>`. On a code line, the
line's own indentation carries over, as code editors do.

The code lines are ourus's with `handleFenceContents: true` (the default). A host that edits code
itself (language-aware indentation, embedded code editors) sets it to `false`, and Enter on a code
line is the host's ([Fence10](#fence10)). The fence lines are ourus's either way.

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

After the closing fence, the new line stays in the item: what is typed there is the item's next
paragraph.

````buffer
- a
  ```
  code
  ```┃
````

> enter "x"

````buffer
- a
  ```
  code
  ```
  x┃
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
