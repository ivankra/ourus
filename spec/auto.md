# Auto characters

Characters ourus puts in for the user, beside what they typed: an escape that keeps a line the text
it was, a closer typed with its opener (`autoClose`: a fence's, `$$`, `%%`, `-->`, a backtick, a
bracket). Where a line starts in code, math or a comment, verbatim, no escape works: an edit that
would need one there is refused (Auto23). Each is
ours, an auto mark on it, drawn with a combining caron below it (U+032C: `\̬`, `` `̬ ``:
[README.md](README.md)), so a buffer shows which characters the author typed and which ourus did.
What is ours ourus may take out again, as it came; what the author typed it never takes. An auto mark
holds while its character is there doing its job: an escape while it escapes something, a closing
delimiter while it is there. A blank line ourus raised is ours too, its line break an auto mark, but
isn't drawn yet.

## Auto1

Enter before `2.` puts the escape in that keeps the new line a paragraph's, ours; Backspace joins the
lines back and takes it out: the join is the split's inverse ([Regression24b](regressions.md#regression24b)).

```yaml
tags: rare
```

```buffer
revise ┃2. draft
```

> enter

```buffer
revise

┃2\̬. draft
```

> deleteContentBackward

```buffer
revise┃2. draft
```

## Auto2

The same with the backslash the author's: no mark on it, and the join keeps it, a character of
the text ([Regression24](regressions.md#regression24)).

```yaml
tags: rare
```

```buffer
revise ┃2\. draft
```

> enter

```buffer
revise

┃2\. draft
```

> deleteContentBackward

```buffer
revise┃2\. draft
```

## Auto3

Three backticks at a paragraph's start open a fence, and ourus closes it on the line below, as long,
so the block takes in nothing: the closing fence is ours, every backtick of it
([Backtick1](backtick.md#backtick1)). Code typed in the block stays in it, the fence ours below it,
two backticks too; the third makes the line right above it that fence typed again, the author's, and
it takes the old one's place ([Backtick9](backtick.md#backtick9)): nothing of ours is left.

```yaml
tags: common enter-in-fence
```

```buffer
┃
```

> "\`\`\`"

````buffer
```┃
`̬`̬`̬
````

> enter

````buffer
```
┃
`̬`̬`̬
````

> "test"

````buffer
```
test┃
`̬`̬`̬
````

> enter

````buffer
```
test
┃
`̬`̬`̬
````

> "\`\`"

````buffer
```
test
``┃
`̬`̬`̬
````

> "\`"

````buffer
```
test
```┃
````

## Auto4

In an item, the closing fence ours at the item's content column.

```yaml
tags: common
```

```buffer
- ┃
```

> "\`\`\`"

````buffer
- ```┃
  `̬`̬`̬
````

## Auto5

A tilde fence the same: its closing tildes ours.

```yaml
tags: edge
```

```buffer
┃
```

> "~~~"

````buffer
~~~┃
~̬~̬~̬
````

## Auto6

A backtick typed in the opening fence of a block the author closed: the run grows, and so does the
closing fence, by a backtick of ours; the author's three stay theirs
([Backtick4](backtick.md#backtick4)).

```yaml
tags: edge
```

````buffer
```┃
code
```
````

> "\`"

````buffer
````┃
code
````̬
````

## Auto7

In a fence ourus closed, the closing fence grows by one more of ours: all of it still ours.

```yaml
tags: edge
```

```buffer
┃
```

> "\`\`\`" "\`"

````buffer
````┃
`̬`̬`̬`̬
````

## Auto8

With `` ` `` in `autoClose`, a backtick at a word boundary is typed as a pair: the closing backtick is
ours. Typed again before it, the backtick steps over it, and that is the author typing it: theirs now,
no mark ([Backtick19](backtick.md#backtick19)).

```yaml
tags: edge
autoClose: ['```', '~~~', '`']
```

```buffer
use ┃ here
```

> "\`"

```buffer
use `┃`̬ here
```

> "x\`"

```buffer
use `x`┃ here
```

## Auto9

Backspace in an empty pair takes both, as they came ([Backtick20](backtick.md#backtick20)).

```yaml
tags: edge
autoClose: ['```', '~~~', '`']
```

```buffer
use ┃ here
```

> "\`"

```buffer
use `┃`̬ here
```

> deleteContentBackward

```buffer
use ┃ here
```

## Auto10

An empty pair the author typed takes both too: Backspace in an empty pair is the pair's, whoever
typed it, as every app that pairs backticks has it (an editor's closeBrackets).

```yaml
tags: edge
autoClose: ['```', '~~~', '`']
```

```buffer
use `┃` here
```

> deleteContentBackward

```buffer
use ┃ here
```

## Auto11

Backspace right after the fence is typed takes its third backtick, and the closing fence, ours, goes
with it: the line is the text it was typed from ([Backtick15](backtick.md#backtick15)).

```yaml
tags: common
```

```buffer
┃
```

> "\`\`\`" deleteContentBackward

```buffer
``┃
```

## Auto12

A bracket `autoClose` lists, typed before a blank or the line's end, is typed with its closer, ours, the caret between ([auto.md](#auto-characters): as Obsidian, Logseq, Roam, Athens, Tine, SilverBullet).

```yaml
tags: common
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a ┃ b
```

> "("

```buffer
a (┃)̬ b
```

## Auto13

Before a letter, an opener is typed alone: the closer would split what follows from what it closes.

```yaml
tags: common
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a ┃b
```

> "("

```buffer
a (┃b
```

## Auto14

After a letter it pairs, as before a blank: only what follows the caret counts.

```yaml
tags: edge
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a┃ b
```

> "["

```buffer
a[┃]̬ b
```

## Auto15

Two typed make the double, both closers ours: the second opener is typed before the first one's closer, which is a closing bracket.

```yaml
tags: common
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a ┃ b
```

> "[["

```buffer
a [[┃]̬]̬ b
```

## Auto16

The closer typed before one of ours steps over it, and is the author's then, as a backtick's is (Auto8).

```yaml
tags: common
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a ┃ b
```

> "("

```buffer
a (┃)̬ b
```

> "x)"

```buffer
a (x)┃ b
```

## Auto17

Backspace in an empty pair takes both; in a double, a level.

```yaml
tags: common
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a ┃ b
```

> "[["

```buffer
a [[┃]̬]̬ b
```

> deleteContentBackward

```buffer
a [┃]̬ b
```

> deleteContentBackward

```buffer
a ┃ b
```

## Auto18

An empty pair the author typed: Backspace takes both too, as every app that pairs brackets does.

```yaml
tags: edge
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a (┃) b
```

> deleteContentBackward

```buffer
a ┃ b
```

## Auto19

An opener typed over a selection on one line wraps it, its closer ours, the selection kept.

```yaml
tags: edge
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a «x» b
```

> "("

```buffer
a («x»)̬ b
```

## Auto20

After a backslash, the bracket pairs as anywhere: every app that pairs brackets pairs it there.

```yaml
tags: rare
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a \┃ b
```

> "["

```buffer
a \[┃]̬ b
```

## Auto20b

In a code span a bracket pairs as in text, as every app that pairs brackets has it: code has
brackets to close too.

```yaml
tags: rare
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a `x┃ y` b
```

> "["

```buffer
a `x[┃]̬ y` b
```

## Auto21

With the double alone listed (`[[`, as WorkFlowy), a single bracket is typed alone, and the second of two makes the pair.

```yaml
tags: edge
autoClose: ['```', '~~~', '[[', '((']
```

```buffer
a ┃ b
```

> "["

```buffer
a [┃ b
```

> "["

```buffer
a [[┃]̬]̬ b
```

## Auto22

By default `autoClose` lists the fences alone: a bracket is the host's.

```yaml
tags: common
```

```buffer
a ┃ b
```

> "("

```buffer
a (┃ b
```

## Auto23

An escape ourus would put in where a line starts inside inline math is no escape there but a
character of its TeX: Shift-Enter before `- ` in `$x - y$`, the new line a list item without one, is
refused, the math as it was. Obsidian reads a line starting `- ` there as a list too, breaking the
math.

```yaml
tags: rare
flavor: obsidian
```

```buffer
a $x ┃- y$ b
```

> shiftEnter

```yaml
result: rejected not-expressible
```

```buffer
a $x ┃- y$ b
```

## Auto24

The same in a code span, whose text is verbatim too: a backslash in it is a character.

```yaml
tags: rare
```

```buffer
a `x ┃- y` b
```

> shiftEnter

```yaml
result: rejected not-expressible
```

```buffer
a `x ┃- y` b
```

## Auto25

A line break inside a code span that needs no escape is written: the span goes on across it.

```yaml
tags: rare
```

```buffer
a `x ┃2. y` b
```

> shiftEnter

```buffer
a `x 
┃2. y` b
```

## Auto26

In inline math a bracket pairs as in text, as every app that pairs brackets has it: TeX is full of
them.

```yaml
tags: rare
flavor: obsidian
autoClose: ['```', '~~~', '(', '[', '{']
```

```buffer
a $x┃ y$ b
```

> "("

```buffer
a $x(┃)̬ y$ b
```

## Auto27

Display math alone on its line is a paragraph's text, as Obsidian reads it: inline, the lines around
it the same paragraph's. Only a `$$` that its line doesn't close opens a block.

```yaml
tags: rare
flavor: obsidian
outline: |
  paragraph: before⏎$$x$$⏎after
  atom math_block: $$⏎y⏎$$
```

```buffer
before
$$x$$
after┃

$$
y
$$
```

> cursorDocStart

```buffer
┃before
$$x$$
after

$$
y
$$
```

## Auto28

`$$` typed before the line's end is typed with its closer, on its line, ours: inline display math, `$$┃$$`, as Obsidian has it on a line alone (Auto27). Its closer kept open, nothing after it is math.

```yaml
tags: common
flavor: obsidian
```

```buffer
a┃
```

> " $$"

```buffer
a $$┃$̬$̬
```

> "x"

```buffer
a $$x┃$̬$̬
```

## Auto29

Enter in the empty pair spreads it over lines: a math block, the caret on its empty line, the closing `$$` still ours (as an editor spreads a pair of brackets).

```yaml
tags: common
flavor: obsidian
```

```buffer
┃
```

> "$$"

```buffer
$$┃$̬$̬
```

> enter

```buffer
$$
┃
$̬$̬
```

> "x"

```buffer
$$
x┃
$̬$̬
```

## Auto30

Backspace right after `$$` takes its second `$` and the closer: the keystroke's inverse, as for a fence (Auto11).

```yaml
tags: edge
flavor: obsidian
```

```buffer
a ┃
```

> "$$"

```buffer
a $$┃$̬$̬
```

> deleteContentBackward

```buffer
a $┃
```

## Auto31

The closer typed by hand steps over ours, and is the author's then.

```yaml
tags: edge
flavor: obsidian
```

```buffer
a ┃
```

> "$$x$$"

```buffer
a $$x$$┃
```

## Auto32

A comment the same: `%%┃%%`, and Enter in it a comment block.

```yaml
tags: edge
flavor: obsidian
```

```buffer
┃
```

> "%%"

```buffer
%%┃%̬%̬
```

> enter

```buffer
%%
┃
%̬%̬
```

## Auto33

An HTML comment, in every flavor: `<!--┃-->`, and Enter in it a block of HTML.

```yaml
tags: edge
flavor: gfm
```

```buffer
┃
```

> "<!--"

```buffer
<!--┃-̬-̬>̬
```

> enter

```buffer
<!--
┃
-̬-̬>̬
```

## Auto34

Where the flavor reads no math, `$$` is text: nothing closes it.

```yaml
tags: edge
flavor: gfm
```

```buffer
a ┃
```

> "$$"

```buffer
a $$┃
```

## Auto35

An empty pair the author typed: Enter is Enter in a paragraph, the closer theirs.

```yaml
tags: rare
flavor: obsidian
```

```buffer
$$┃$$
```

> enter

```buffer
\̬$$

┃\̬$$
```

## Auto36

With `$` in `autoClose` (as Logseq and Roam), inline math's `$` pairs as a bracket does, ours, and the one typed before it with math in the pair steps over it.

```yaml
tags: edge
autoClose: ['```', '~~~', '$']
```

```buffer
a ┃ b
```

> "$"

```buffer
a $┃$̬ b
```

> "x$"

```buffer
a $x$┃ b
```

## Auto37

A second `$` in the empty pair makes the double, display math; Backspace there takes a level, as in a double bracket.

```yaml
tags: edge
autoClose: ['```', '~~~', '$']
```

```buffer
a ┃ b
```

> "$$"

```buffer
a $$┃$̬$̬ b
```

> deleteContentBackward

```buffer
a $┃$̬ b
```

> deleteContentBackward

```buffer
a ┃ b
```

## Auto38

After a letter a `$` closes math, as the author typed it: it pairs with nothing.

```yaml
tags: edge
autoClose: ['```', '~~~', '$']
```

```buffer
a $x┃ b
```

> "$"

```buffer
a $x$┃ b
```
