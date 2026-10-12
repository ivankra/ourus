# Blank lines

Blank lines belong to the node above them, as its **trailing gap**: a node's span is its own lines,
then its gap, then its children. The blank lines after a subtree are its last descendant's gap.
Blank lines above the document's first node are the **preamble**, which belongs to no node.

Two consequences, drawn below:

- **A node's gap travels with it.** A move carries the blank lines after a node along with the node.
  The exception is a gap that ends its scope (after the last of a parent's children, a list's last
  item, or the document's last node). It separates the whole scope from what follows, so it stays
  at the scope's end, and the two nodes swap around the blank lines between them.
- **A caret on a blank line is in the gap of the node above.** Structural keys there act on that
  node, and the blank lines are left as they are. In the preamble there is no node above, and the
  keys do nothing.

## moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down)

### Gaps travel with their nodes

`a`'s three blank lines stay below `a`, and `b`'s one stays below `b`.

```buffer
a



b┃

c
```

> moveBlockUp

```buffer
b┃

a



c
```

### Moving down carries the gap too

```buffer
a┃



b

c
```

> moveBlockDown

```buffer
b

a┃



c
```

### A section carries its last line's gap

```buffer
# A
text


# B┃
more

# C
```

> moveBlockUp

```buffer
# B┃
more

# A
text


# C
```

### An item carries its gap inside a loose list

```buffer
- a

- b┃
- c
```

> moveBlockUp

```buffer
- b┃
- a

- c
```

### A subtree's gap is its last descendant's

```buffer
- a
  - a1


- b┃
- c
```

> moveBlockUp

```buffer
- b┃
- a
  - a1


- c
```

### Sections written without blank lines stay without

A blank line is added only where the text needs one to keep the two apart.

```buffer
## A┃
a
## B
b
## C
```

> moveBlockDown

```buffer
## B
b
## A┃
a
## C
```

### A paragraph landing above another one is set off by a blank line

Without it, `x` and `q` would read as one paragraph.

````buffer
x┃
```
code
```

q
````

> moveBlockDown

````buffer
```
code
```

x┃

q
````

### The gap ending a list stays at the list's end

The blank line after `b` separates the list from `para`. If it went up with `b`, the list would
loosen and `para` would continue `a` lazily.

```buffer
- a
- b┃

para
```

> moveBlockUp

```buffer
- b┃
- a

para
```

### The gap ending a parent's children stays at their end

```buffer
- p
  - x


  - y┃

- q
```

> moveBlockUp

```buffer
- p
  - y┃


  - x

- q
```

### The document's trailing blank lines stay at its end

```buffer
a

b┃


```

> moveBlockUp

```buffer
b┃

a


```

### The preamble stays at the top

```buffer


a┃


b

c
```

> moveBlockDown

```buffer


b

a┃


c
```

## New text and gaps

### Enter at the end of a heading keeps its gap below the new paragraph

```buffer
## S┃

p
```

> enter

```buffer
## S
┃◌

p
```

### Items pasted at the end of a tight list keep it tight

```clipboard
- a
- b
```

```buffer
- t┃

para
```

> pasteStructured

```buffer
- t
- a
- b┃

para
```

### Items pasted as first children land at the existing children's column

```clipboard
- a
- b
```

```buffer
- [ ] t┃
    - g
```

> pasteStructured

```buffer
- [ ] t
    - a
    - b┃
    - g
```

## Keys on a blank line

### Moving from a blank line moves the node above

The caret is in `b`'s gap, so `b` moves, and the gap and the caret with it.

```buffer
a

b
┃

c
```

> moveBlockUp

```buffer
b
┃

a

c
```

### Tab on a blank line indents the node above

```buffer
- a
- b
┃
- c
```

> indent

```buffer
- a
  - b
┃
- c
```

### Shift-Tab on a blank line outdents the node above

```buffer
- a
  - b
┃
- c
```

> outdent

```buffer
- a
- b
┃
- c
```

### A blank line between a node's text and its first child is the node's

```buffer
- a
┃
  b
- c
```

> moveBlockDown

```buffer
- c
- a
┃
  b
```

### Keys in the preamble do nothing

```buffer
┃

a
```

> moveBlockDown

```result
notApplicable
```

```buffer
┃

a
```

> indent

```result
notApplicable
```

```buffer
┃

a
```
