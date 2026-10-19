
# Fenced code

Enter, Shift-Enter, Backspace, Delete, Tab and paste in a fenced code block. Code is payload and
fences are structure: code lines are edited as text in the block's containers (an item's
continuation indentation, a quote's `>`), their own indentation kept, and no edit may unmake a fence
(close a block early, open one that never ends, join code to text). The rules, in order:

1. **In a fence's run of backticks**, Enter is refused: a line break there would break the fence
   (Fence9, Fence14).
2. **At the start of the opening fence**, Enter opens a line above the block, which stays with the
   caret (Fence12); **at the start of the closing fence**, Enter and Shift-Enter add an empty last
   code line, the caret on it (Fence13, Fence41); **at the start of a fence that is an item's
   text**, Enter is at the item's text start (Fence15).
3. **After the closing fence that ends an item's content**, Enter makes the next item, or the first
   child where the item has children, and a new line in the item where a paragraph of the item
   follows (Fence7, Fence7c, Fence7d); Shift-Enter makes a new line in the item (Fence7b).
4. **On a code line**, Enter and Shift-Enter make a new line in the block's containers, the line's
   own indentation carrying over, as code editors do (Fence1, Fence2, Fence3, Fence4, Fence5,
   Fence6, Fence8). With `handleFenceContents: false` they are the host's, for hosts that edit code
   themselves (Fence10); the fence lines stay ourus's (Fence11).
5. **Backspace at a code line's start and Delete at its end join code lines**, the containers'
   prefix on the joined line going with the line break (Fence16, Fence18, Fence20). Against a fence
   they are refused, from either side, where the code line has code on it (Fence17, Fence19,
   Fence23, Fence24); an empty code line just goes, so Backspace takes back the empty lines Enter
   makes next to a fence (Fence27, Fence28, Fence29, Fence30, Fence31, Fence32).
6. **At a fence's start in an item**, Backspace can't join the code to the text above: refused
   (Fence25, and Fence33 at the top level). A fence that is an item's text joins the item above as a
   block of it, from either side (Fence26, Fence34). Delete at a closing fence's end before text is
   refused (Fence35).
7. **No split or join may assemble a fence from code**: one that would close the block early is
   refused (Fence36, Fence37, Fence38, Fence39, Fence40); nor may Cmd-Backspace delete a fence
   ([SoftBackspace9](backspace.md#softbackspace9)).
8. **Tab and Shift-Tab on a code line are the host's**: they indent the code (Fence21). **Pasted
   text on a code line is code** ([Paste22](paste.md#paste22)).
9. **The other blocks of lines, math (`$$`), comments (`%%`) and indented code, take the same**:
   Enter and Shift-Enter make a line of the block in its containers, its own indentation carrying
   over, and Backspace and Delete join its lines, the containers' prefix going with the line break
   (Fence42, Fence43, Fence44, Fence46); text against a `$$` or `%%` line, or a break in one, would
   unmake the block: refused (Fence45, Fence47). Pasted lines there are the block's. In an item or a
   quote, the host's keys would leave the containers' prefix behind and end the block.
10. **A block moving out of an item or into one takes its blank lines along**: the item's
    indentation on a blank code line goes with the item, what is past it moves with the code
    (Fence48).

Bare Obsidian agrees on most code-line edits; at the fence lines and an item's indentation its
one-character Backspace and Delete unmake the block (Fence16, Fence23, Fence33).

## Fence1

Enter in a fenced block inside an item keeps the item's indentation.

At column 0 the new line would end the item; with the item's indentation, what is typed there
stays in the code, in the item.

```yaml
tags: common
```

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

```yaml
tags: common
```

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

The code line's own indentation carries over, as in code editors.

```yaml
tags: common
```

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

```yaml
tags: edge quote-container
```

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

```yaml
tags: edge
```

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

```yaml
tags: edge markup-fence
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

## Fence7

After the closing fence that ends an item's content, Enter makes the next item, as at the end of the
item's text: the code is part of the item. Bare Obsidian makes a new line in the item, which is
Shift-Enter's here ([Fence7b](#fence7b)).

```yaml
tags: common markup-fence
```

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

```yaml
tags: common markup-fence
```

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

```yaml
tags: edge markup-fence
```

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

```yaml
tags: edge markup-fence
```

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

```yaml
tags: common
```

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

```yaml
tags: rare markup-fence
```

````buffer
`┃``
code
```
````

> enter

```result
rejected: not-expressible
```

````buffer
`┃``
code
```
````

## Fence10

With `handleFenceContents: false`, Enter on a code line is the host's.

```yaml
tags: rare
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

```yaml
tags: rare markup-fence
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
caret: the fence is no text to go into a node above from.

```yaml
tags: edge markup-fence
```

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

At the start of the closing fence, Enter adds an empty last code line, the caret on it: left on
the closing fence, typing there would unmake it.

```yaml
tags: edge markup-fence
```

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
  ┃
  ```
````

## Fence14

Inside the closing fence's run of backticks, Enter is refused too.

```yaml
tags: rare markup-fence
```

````buffer
```
code
``┃`
````

> enter

```result
rejected: not-expressible
```

````buffer
```
code
``┃`
````

## Fence15

At the start of a fence that is an item's text, Enter is at the item's text start: an empty item
above, the caret going into it.

```yaml
tags: edge markup-fence
```

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

```yaml
tags: common
```

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
its info string. An empty first line just goes ([Fence27](#fence27)).

```yaml
tags: edge markup-fence
```

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

````buffer
- a
  ```
  ┃one
  ```
````

## Fence18

Delete at the end of a code line joins the next line, without the item's indentation.

```yaml
tags: common
```

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

Delete at the end of the last code line is refused: the closing fence would join the code. An empty
last line just goes ([Fence30](#fence30)).

```yaml
tags: edge markup-fence
```

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

````buffer
- a
  ```
  one┃
  ```
````

## Fence20

In a quote, a joined code line's `>` goes with its line break. The host's Backspace deletes the
space after the `>` instead, and then the `>`, ending the quote and the block.

```yaml
tags: edge quote-container
```

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

```yaml
tags: common
```

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

```yaml
tags: rare markup-fence
```

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

## Fence23

Backspace at the start of the closing fence is refused: the fence would join the last code line,
and the block would run on to the end of the document (Fence19's mirror).

```yaml
tags: edge markup-fence
```

````buffer
- a
  ```
  one
  ┃```
````

> deleteContentBackward

```result
rejected: not-expressible
```

````buffer
- a
  ```
  one
  ┃```
````

## Fence24

Delete at the end of the opening fence's line is refused: the first code line would join the info
string (Fence17's mirror).

```yaml
tags: rare markup-fence
```

````buffer
- a
  ```js┃
  one
  ```
````

> deleteContentForward

```result
rejected: not-expressible
```

````buffer
- a
  ```js┃
  one
  ```
````

## Fence25

Backspace at the start of a fence after the item's text is refused: code can't join text, as text
can't join code ([Backspace16](backspace.md#backspace16)). The host's Backspace would delete a space
of the item's indentation and take the block out of the item.

```yaml
tags: edge markup-fence
```

````buffer
- a
  ┃```
  one
  ```
````

> deleteContentBackward

```result
rejected: not-expressible
```

````buffer
- a
  ┃```
  one
  ```
````

## Fence26

Backspace at the start of a fence that is an item's text joins the item to the one above: its
marker goes, and the code becomes a block of that item, the caret at the end of its text, as in any
join. The host's Backspace would delete the space after the marker, leaving no item.

```yaml
tags: edge markup-fence
```

````buffer
- a
- ┃```
  one
  ```
````

> deleteContentBackward

````buffer
- a┃
  ```
  one
  ```
````

## Fence27

Backspace on the empty first code line Enter made after the info string takes it back
([Fence6](#fence6)).

```yaml
tags: edge markup-fence
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

> deleteContentBackward

````buffer
- a
  ```js┃
  code
  ```
````

## Fence28

Delete at the end of the opening fence's line, before an empty first code line: the empty line goes
(Fence24 refuses a line with code on it).

```yaml
tags: rare markup-fence
```

````buffer
- a
  ```js┃

  code
  ```
````

> deleteContentForward

````buffer
- a
  ```js┃
  code
  ```
````

## Fence29

Enter at the start of the closing fence, then Backspace on the empty line it made: the line goes
([Fence13](#fence13)), and the text is as it was.

```yaml
tags: edge markup-fence
```

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
  ┃
  ```
````

> deleteContentBackward

````buffer
- a
  ```
  code┃
  ```
````

## Fence30

Delete on an empty last code line: the line goes, the fence moving up (Fence19 refuses a line with
code on it).

```yaml
tags: rare markup-fence
```

````buffer
- a
  ```
  code
  ┃
  ```
````

> deleteContentForward

````buffer
- a
  ```
  code
  ┃```
````

## Fence31

Backspace after the blank line Enter opened above a fence takes it back ([Fence12](#fence12)), the
code staying a block of the item. The host's Backspace deletes a space of the item's indentation,
taking the code out of the item.

```yaml
tags: edge markup-fence
```

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

> deleteContentBackward

````buffer
- a
  ┃```
  code
  ```
````

## Fence32

Backspace on the empty line Shift-Enter made after a closing fence takes it back
([Fence7b](#fence7b)). The host's Backspace deletes a space of the item's indentation, so what is
typed next would leave the list.

```yaml
tags: edge markup-fence
```

````buffer
- a
  ```
  code
  ```┃
````

> shiftEnter

````buffer
- a
  ```
  code
  ```
  ┃
````

> deleteContentBackward

````buffer
- a
  ```
  code
  ```┃
````

## Fence33

At the top level too, Backspace at the start of a fence right after a paragraph is refused
([Fence25](#fence25)): the host's would join the fence line to the paragraph, and the closing fence
would then open a block running to the end of the document.

```yaml
tags: edge markup-fence
```

````buffer
para
┃```
x
```
````

> deleteContentBackward

```result
rejected: not-expressible
```

````buffer
para
┃```
x
```
````

## Fence34

Delete at the end of an item's text before an item whose text is a fence joins that item up, as
Backspace at the fence's start does ([Fence26](#fence26)); the caret stays where it was.

```yaml
tags: rare markup-fence
```

````buffer
- a┃
- ```
  one
  ```
````

> deleteContentForward

````buffer
- a┃
  ```
  one
  ```
````

## Fence35

Delete at the end of a closing fence before a line with text is refused: the line would join the
fence, which would then close nothing.

```yaml
tags: rare markup-fence
```

````buffer
- a
  ```
  one
  ```┃
- b
````

> deleteContentForward

```result
rejected: not-expressible
```

````buffer
- a
  ```
  one
  ```┃
- b
````

## Fence36

Backspace that would join code fragments into a closing fence is refused: two lines, two backticks
and one, would make a fence, closing the block early.

```yaml
tags: rare markup-fence
```

````buffer
```
``
┃`
body
```
````

> deleteContentBackward

```result
rejected: not-expressible
```

````buffer
```
``
┃`
body
```
````

## Fence37

Delete, the same from the other side (Fence36's mirror).

```yaml
tags: rare markup-fence
```

````buffer
```
``┃
`
body
```
````

> deleteContentForward

```result
rejected: not-expressible
```

````buffer
```
``┃
`
body
```
````

## Fence38

Shift-Enter that would leave a closing fence at the start of the rest of a code line is refused.

```yaml
tags: rare markup-fence
```

````buffer
```
x┃```
body
```
````

> shiftEnter

```result
rejected: not-expressible
```

````buffer
```
x┃```
body
```
````

## Fence39

Enter that would leave a closing fence as the first half of a code line is refused.

```yaml
tags: rare markup-fence
```

````buffer
```
```┃x
body
```
````

> enter

```result
rejected: not-expressible
```

````buffer
```
```┃x
body
```
````

## Fence40

The same protection in a quote, and with tilde fences.

```yaml
tags: rare markup-fence quote-container
```

````buffer
> ~~~
> ~~┃
> ~
> body
> ~~~
````

> deleteContentForward

```result
rejected: not-expressible
```

````buffer
> ~~~
> ~~┃
> ~
> body
> ~~~
````

## Fence41

Shift-Enter at the start of the closing fence does as Enter there ([Fence13](#fence13)): an empty
last code line, the caret on it.

```yaml
tags: rare markup-fence
```

````buffer
- a
  ```
  code
  ┃```
````

> shiftEnter

````buffer
- a
  ```
  code
  ┃
  ```
````

## Fence48

An item holding code outdented: the code's blank line, indented as the item's lines are, gives up the
indentation the item gives up, as they do. Indent gives the outline back, the blank line short of the
item's column, as a blank line in code may be.

```yaml
tags: rare
```

````buffer
- p
  - ┃a
    ```
    x
    
    y
    ```
````

> outdent

````buffer
- p
- ┃a
  ```
  x
  
  y
  ```
````

> indent

````buffer
- p
  - ┃a
    ```
    x
  
    y
    ```
````

## Math, comments and indented code

### Fence42

Enter in a math block in an item: a new line of the block at the item's column, which Backspace
takes back. Left to the host, the line would start at column 0, ending the item and the block.

```yaml
tags: edge
flavor: obsidian
```

```buffer
- Euler:
  $$
  e^{i\pi}+1=0┃
  $$
```

> enter

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
  ┃
  $$
```

> deleteContentBackward

```buffer
- Euler:
  $$
  e^{i\pi}+1=0┃
  $$
```

> enter "x"

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
  x┃
  $$
```

### Fence43

Shift-Enter in a comment block in a quote, in an item, and Backspace taking the line back: the
quote's `>` goes with the line break, not as a character of the text.

```yaml
tags: rare quote-container
flavor: obsidian
```

```buffer
- task:
  > %%
  > hidden┃
  > %%
```

> shiftEnter "more"

```buffer
- task:
  > %%
  > hidden
  > more┃
  > %%
```

> cursorLineBoundaryBackward deleteContentBackward

```buffer
- task:
  > %%
  > hidden┃more
  > %%
```

### Fence44

Enter in indented code in an item: the code's own indentation carries over, as in code editors.

```yaml
tags: rare
```

```buffer
- a

      x = 1┃
      y = 2
```

> enter "z"

```buffer
- a

      x = 1
      z┃
      y = 2
```

### Fence45

Enter inside a math block's `$$` is refused, at the top level as anywhere: the block would no longer
open, and the rest of the document would be math.

```yaml
tags: rare markup-fence
flavor: obsidian
```

```buffer
$┃$
x
$$
```

> enter

```result
rejected: not-expressible
```

```buffer
$┃$
x
$$
```

### Fence46

Delete at the end of a comment line in a quote joins the next line, the quote's `>` going with the
break, as Backspace does from the other side ([Fence43](#fence43)).

```yaml
tags: rare quote-container
flavor: obsidian
```

```buffer
> %%
> a┃
> b
> %%
```

> deleteContentForward

```buffer
> %%
> a┃b
> %%
```

### Fence47

Against a `$$` line a line with text on it doesn't join, from either side, as against a code fence
([Fence17](#fence17), [Fence19](#fence19)).

```yaml
tags: rare markup-fence
flavor: obsidian
```

```buffer
- a
  $$
  ┃x
  $$
```

> deleteContentBackward

```result
rejected: not-expressible
```

```buffer
- a
  $$
  ┃x
  $$
```

> cursorLineBoundaryForward deleteContentForward

```result
rejected: not-expressible
```

```buffer
- a
  $$
  x┃
  $$
```
