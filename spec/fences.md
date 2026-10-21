# Fenced code

Enter, Shift-Enter, Backspace, Delete, Tab and paste in a fenced code block. Code is payload and
fences are structure: code lines are edited as text in the block's containers (an item's
continuation indentation, a quote's `>`), their own indentation kept, and no edit may unmake a fence
(close a block early, open one that never ends, join code to text). The rules, in order:

1. **In a fence's run of backticks**, Enter is refused: a line break there would break the fence
   (Fence9, Fence14).
2. **At the start of an opening fence in an item**, Enter splits the item there, the code going to
   a new item as its text, the caret to the code's first line (Fence12, Fence50); elsewhere it opens
   a line above the block, which stays with the caret. **At the start of the closing fence**, Enter
   and Shift-Enter add an empty last code line, the caret on it (Fence13, Fence41); **at the start
   of a fence that is an item's text**, Enter is at the item's text start (Fence15).
3. **After the closing fence that ends an item's content**, Enter makes the next item, or the first
   child where the item has children (Fence7, Fence7c); **after any other closing fence**, an empty
   paragraph after the block, held by a placeholder (Fence7d, Fence59, Fence59b,
   [Quote90](quotes.md#quote90)). Shift-Enter makes a new line in the item (Fence7b).
4. **On a code line**, Enter and Shift-Enter make a new line in the block's containers, the line's
   own indentation carrying over, as code editors do (Fence1, Fence2, Fence3, Fence4, Fence5,
   Fence6, Fence8). With `handleFenceContents: false` they are the host's, for hosts that edit code
   themselves (Fence10); the fence lines stay ourus's (Fence11).
5. **Backspace at a code line's start and Delete at its end join code lines**, the containers'
   prefix on the joined line going with the line break (Fence16, Fence18, Fence20). Against a fence
   they are refused, from either side, where the code line has code on it (Fence17, Fence19,
   Fence23, Fence24); an empty code line just goes, so Backspace takes back the empty lines Enter
   makes next to a fence (Fence27, Fence28, Fence29, Fence30, Fence32), the caret left where typing
   keeps the block (Fence30), or on the fence where the user had it, where markup is text the user
   edits (Fence32; elsewhere at the code's end, Fence32b).
6. **At a fence's start in an item**, Backspace can't join the code to the text above: refused
   (Fence25, and Fence33 at the top level). A fence that is an item's text joins the item above as a
   block of it, its code as written, from either side (Fence26, Fence34, Fence49), and so does
   Backspace at its code's start, which takes Enter's split back (Fence31); into an empty item above,
   it takes the item's place (Fence51). Delete at a closing fence's end before text is refused (Fence35).
7. **No split or join may assemble a fence from code**: where one would close the block early, the
   block's fences grow past it, as WorkFlowy and Tana write them (Fence36, Fence37, Fence38,
   Fence39, Fence40; a pasted line too, [PastePlain29](paste-plain.md#pasteplain29); a character
   Backspace or Delete takes, Fence62), and stay longer once it is gone; nor may Cmd-Backspace delete a fence
   ([SoftBackspace9](backspace.md#softbackspace9)).
8. **Tab and Shift-Tab on a code line are the host's**: they indent the code (Fence21). **Pasted
   text on a code line is code** ([PastePlain28](paste-plain.md#pasteplain28)).
9. **The other blocks of lines, math (`$$`), comments (`%%`) and indented code, take the same**:
   Enter and Shift-Enter make a line of the block in its containers, its own indentation carrying
   over, and Backspace and Delete join its lines, the containers' prefix going with the line break
   (Fence42, Fence43, Fence44, Fence46), indented code's four columns too (Fence52, Fence53); text
   against a `$$` or `%%` line, or a break in one, would unmake the block: refused (Fence45,
   Fence47), and so is indented code joining the text above (Fence54). At the start of a `$$` or
   `%%` that opens a block, Enter and Backspace do as at a code fence: in an item, Enter splits it
   and Backspace takes the split back, a block that is an item's text joins the item above, and
   elsewhere Backspace takes the line Enter opened above (Fence55, Fence56, Fence57). Pasted lines
   there are the block's. In an item or a quote, the host's keys would leave the containers' prefix
   behind and end the block.
10. **A block moving out of an item or into one takes its blank lines along**: the item's
    indentation on a blank code line goes with the item, what is past it moves with the code
    (Fence48).
11. **A fence's run is kept matched**: a backtick typed on either fence, or Backspace and Delete in
    a run, change both fences, and a fence typed is closed below it ([backtick.md](backtick.md)).

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

```yaml
result: applied
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

With a paragraph after the fence in the item, Enter after the fence makes an empty paragraph in the
item, held by a placeholder, as after a fence elsewhere ([Fence59](#fence59)): a new item there
would come before the paragraph.

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
  ┃◌

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

```yaml
result: rejected not-expressible
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

```yaml
result: notApplicable
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

```yaml
result: applied
```

## Fence12

At the start of an opening fence in an item, Enter splits the item there, as it splits an item's
text: the code goes to a new item after it, as its text, and the caret to the code's first line,
where typing goes into the code. A line opened above the fence would leave the caret on it, where
typing unmakes the block.

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
- ```
  ┃code
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

```yaml
result: rejected not-expressible
```

````buffer
```
code
``┃`
````

## Fence15

At the start of a fence that is an item's text, Enter is at the item's text start: an empty item
above, the caret going into it, under `enterAtTextStart: stay` too, as staying would leave the caret
on the fence, which is markup.

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

The indentation is the item's, not code: bare Obsidian deletes all of it, which ends the item and
the block; its Outliner joins the lines as ourus does.

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

```yaml
result: rejected not-expressible
```

````buffer
- a
  ```
  ┃one
  ```
````

## Fence18

Delete at the end of a code line joins the next line, without the item's indentation, which is the
item's, not the code's, as Obsidian's Outliner joins it. Bare Obsidian joins the indentation in, two
spaces of code the line never had.

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

```yaml
result: rejected not-expressible
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

```yaml
result: notApplicable
```

> outdent

```yaml
result: notApplicable
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

```yaml
result: rejected not-expressible
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

```yaml
result: rejected not-expressible
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

```yaml
result: rejected not-expressible
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
code on it), and the caret goes to the end of the code above: left before the closing fence, it
would have what is typed there unmake the block, and the item's text after it become code. Bare
Obsidian deletes only the line break, so the fence takes in the item's indentation twice.

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
  code┃
  ```
````

## Fence31

Backspace at the start of the code of an item whose text is the fence takes Enter's split back
([Fence12](#fence12)): the item joins the item above, its code a block of it again, as Backspace at
the fence's start joins it ([Fence26](#fence26)), and the caret stays at the code's start. The code
can't join the fence, so there is nothing else for the key to do. Bare Obsidian's Backspace deletes
the item's indentation, taking the code out of the item.

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
- ```
  ┃code
  ```
````

> deleteContentBackward

````buffer
- a
  ```
  ┃code
  ```
````

## Fence31b

After a body paragraph, the code goes back to its place among the item's blocks, the blank line
between them with it.

```yaml
tags: rare markup-fence
```

````buffer
- a

  para

  ┃```
  code
  ```
````

> enter

````buffer
- a

  para

- ```
  ┃code
  ```
````

> deleteContentBackward

````buffer
- a

  para

  ```
  ┃code
  ```
````

## Fence32

Backspace on the empty line Shift-Enter made after a closing fence takes it back
([Fence7b](#fence7b)), as Obsidian's Outliner does. Bare Obsidian's Backspace deletes the item's
indentation, so what is typed next would leave the list.

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

## Fence32b

Where the host decorates markup (`markup: decorated`), the caret can't be left at the fence's end,
where typing writes after it: the same Backspace puts it at the end of the code.

```yaml
tags: rare markup-fence
markup: decorated
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
  code┃
  ```
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

```yaml
result: rejected not-expressible
```

````buffer
para
┃```
x
```
````

## Fence34

Delete at the end of an item's text before an item whose text is a fence joins that item up, as
Backspace at the fence's start does ([Fence26](#fence26)); the caret stays where it was. Bare
Obsidian deletes only the line break, leaving `- ```` as text after `a`, and Dynalist and Obsidian's
Outliner join the fence into the text: either way the block is gone. WorkFlowy does nothing.

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

```yaml
result: rejected not-expressible
```

````buffer
- a
  ```
  one
  ```┃
- b
````

## Fence36

Backspace that would join code fragments into a fence, two backticks and one, closing the block
early: the block's fences grow by one, as WorkFlowy and Tana write them, so the line is code. Bare
Obsidian joins them and the block ends there.

```yaml
tags: rare markup-fence
```

`````buffer
```
``
┃`
body
```
`````

> deleteContentBackward

`````buffer
````
``┃`
body
````
`````

## Fence37

Delete, the same from the other side (Fence36's mirror).

```yaml
tags: rare markup-fence
```

`````buffer
```
``┃
`
body
```
`````

> deleteContentForward

`````buffer
````
``┃`
body
````
`````

## Fence38

Shift-Enter that would leave a closing fence at the start of the rest of a code line: the fences
grow; Backspace joins the line back, and they stay longer.

```yaml
tags: rare markup-fence
```

`````buffer
```
x┃```
body
```
`````

> shiftEnter

`````buffer
````
x
┃```
body
````
`````

> deleteContentBackward

`````buffer
````
x┃```
body
````
`````

## Fence39

Enter that would leave a closing fence as the first half of a code line: the fences grow.

```yaml
tags: rare markup-fence
```

`````buffer
```
```┃x
body
```
`````

> enter

`````buffer
````
```
┃x
body
````
`````

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

````buffer
> ~~~~
> ~~┃~
> body
> ~~~~
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

## Fence49

A fence that is an item's text joins the item above with its code as written: the code's own
indentation, past the item's, stays the code's ([Fence26](#fence26)).

```yaml
tags: rare markup-fence
```

````buffer
- a
- ┃```
    x
  ```
````

> deleteContentBackward

````buffer
- a┃
  ```
    x
  ```
````

## Fence50

The same the other way: Enter at the opening fence of such a block splits the item with the code as
written ([Fence12](#fence12)), the caret at the code's first character.

```yaml
tags: rare markup-fence
```

````buffer
- a
  ┃```
    x
  ```
````

> enter

````buffer
- a
- ```
    ┃x
  ```
````

## Fence51

Into an empty item above, a fence that is an item's text takes the empty item's place, as text moves
up into one ([Backspace5](backspace.md#backspace5)), the caret going to the code's first line: as a
block of the empty item, the code would be its text.

```yaml
tags: rare markup-fence
```

````buffer
- 
- ┃```
  code
  ```
````

> deleteContentBackward

````buffer
- ```
  ┃code
  ```
````

## Fence58

A code line of only a no-break space has code on it: Backspace at the closing fence after it is
refused, as after any code ([Fence17](#fence17)), where an empty code line would go.

```yaml
tags: rare markup-fence
```

````buffer
- a
  ```
  ⍽
  ┃```
````

> deleteContentBackward

```yaml
result: rejected not-expressible
```

````buffer
- a
  ```
  ⍽
  ┃```
````

## Fence59

After a closing fence outside an item, Enter makes an empty paragraph after the block, held by a
placeholder; left empty, it goes when the caret leaves, as any empty paragraph
([placeholders.md](placeholders.md)), rather than leaving a blank line behind.

```yaml
tags: rare markup-fence
```

````buffer
```
code
```┃
````

> enter

````buffer
```
code
```
┃◌
````

> cursorDocStart

````buffer
┃```
code
```
````

## Fence59b

Text right below would continue the new paragraph: a blank line keeps it apart, as after a table
([Enter49](enter.md#enter49)).

```yaml
tags: rare markup-fence
```

````buffer
```
code
```┃
q
````

> enter "x"

````buffer
```
code
```
x┃

q
````

## Fence60

Before a list, the new paragraph owns it, as a paragraph owns the list right after it; Backspace
takes the paragraph back, and the list is the document's again.

```yaml
tags: rare markup-fence
```

````buffer
```
code
```┃
- a
````

> enter

````buffer
```
code
```
┃◌
- a
````

> deleteContentBackward

````buffer
```
code
```┃
- a
````

## Math, comments and indented code

### Fence42

Enter in a math block in an item: a new line of the block at the item's column, which Backspace
takes back. Bare Obsidian keeps the column too, but its Backspace then deletes the whole
indentation, ending the item and the block; its Outliner makes a new item there instead.

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

```yaml
result: rejected not-expressible
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

```yaml
result: rejected not-expressible
```

```buffer
- a
  $$
  ┃x
  $$
```

> cursorLineBoundaryForward deleteContentForward

```yaml
result: rejected not-expressible
```

```buffer
- a
  $$
  x┃
  $$
```

### Fence52

Backspace at the start of an indented code line's code, after the block's four columns, joins the
line above, the four columns going with the line break, as an item's indentation does on a fenced
code line ([Fence16](#fence16)). The host's Backspace deletes one of the columns, and the line is no
longer code.

```yaml
tags: rare
```

```buffer
para

    a
    ┃code
```

> deleteContentBackward

```buffer
para

    a┃code
```

### Fence53

Delete at the end of an indented code line joins the next, its four columns going with the line
break, as Backspace does from the other side ([Fence52](#fence52)).

```yaml
tags: rare
```

```buffer
para

    a┃
    code
```

> deleteContentForward

```buffer
para

    a┃code
```

### Fence54

Backspace at the start of indented code's first line after a paragraph is refused: the code can't
join the text, and without the blank line between them it would be more lines of the paragraph.

```yaml
tags: rare
```

```buffer
para

    ┃a
```

> deleteContentBackward

```yaml
result: rejected not-expressible
```

```buffer
para

    ┃a
```

### Fence55

Enter at the start of a math block's `$$` in an item splits the item there, as at a code fence
([Fence12](#fence12)): the math goes to a new item as its text, the caret to its first line, and
Backspace there takes the split back ([Fence31](#fence31)). The host's Backspace would delete a
space of the item's indentation, taking the math out of the item.

```yaml
tags: rare markup-fence
flavor: obsidian
```

```buffer
- Euler:
  ┃$$
  x
  $$
```

> enter

```buffer
- Euler:
- $$
  ┃x
  $$
```

> deleteContentBackward

```buffer
- Euler:
  $$
  ┃x
  $$
```

### Fence56

Backspace at the start of a math block that is an item's text joins the item above, the math a block
of it, as a code fence there does ([Fence26](#fence26)).

```yaml
tags: rare markup-fence
flavor: obsidian
```

```buffer
- Euler:
- ┃$$
  x
  $$
```

> deleteContentBackward

```buffer
- Euler:┃
  $$
  x
  $$
```

### Fence57

In a quote, Enter at the start of a comment block's `%%` opens a quoted blank line above it, and
Backspace takes it back, the `>` going with it, as at a code fence. The host's Backspace would delete
the space after the `>`.

```yaml
tags: rare quote-container markup-fence
flavor: obsidian
```

```buffer
> a
> ┃%%
> x
> %%
```

> enter

```buffer
> a
>
> ┃%%
> x
> %%
```

> deleteContentBackward

```buffer
> a
> ┃%%
> x
> %%
```

### Fence61

An item whose text is a `$$` with no closing one reads to the end of its container. Outdented, the
block would take in the item after it, as an unclosed code fence would
([MoveUp41](move-subtree-up.md#moveup41)): refused.

```yaml
tags: rare markup-fence
flavor: obsidian
```

```buffer
┃- $$
- a
```

> outdent

```yaml
result: rejected not-expressible
```

```buffer
┃- $$
- a
```

## Fence62

Backspace on a code line that would leave a fence of it, closing the block early: the fences grow
past it, as anywhere else a fence would be assembled from code. Elsewhere in code, Backspace is the
host's.

````yaml
tags: edge
````

````buffer
```
x┃```
body
```
````

> deleteContentBackward

`````buffer
````
┃```
body
````
`````
