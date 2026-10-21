# Backtick

A typed backtick (`insertText`, typed text as `"…"` in an action). In a plain text box it is just a
character, but three at a line's start open a code fence, and an open fence takes in everything
after it, to the end of its container: whatever the user typed next, and every node below, becomes
code. A fence's two runs must also stay matched, since a closing fence shorter than the opening one
closes nothing. So ourus handles the backtick wherever it opens, closes or changes a fence, and
leaves it to the host elsewhere. `closeBackticks` says what a typed backtick closes: `fences` (the
default) closes code fences only; `all` pairs inline code too, as bare Obsidian does out of the box
(in Source mode, Live Preview and with Outliner); `none` closes nothing, as a text editor (Emacs's
markdown-mode, SilverBullet), Dynalist, Tana and SiYuan do. Bare Obsidian closes a fence as it is typed, but edits any other fence a character
at a time, which mostly breaks the block: lengthening the opening fence (Backtick6), a backtick in
an info string (Backtick7), a fence typed in a block (Backtick9, Backtick10), Backspace and Delete
in a run (Backtick13, Backtick14, Backtick15, Backtick16, Backtick17, Backtick23, Backtick24). The
rules, in order:

1. **In a backtick fence's run, or at either end of it**, the run grows, and the block's other fence
   grows with it, so the two match: an opening fence longer than its closing fence would leave the
   block unclosed (Backtick4, Backtick5, Backtick6). This holds under every value of
   `closeBackticks`. An unclosed block's fence is the host's.
2. **Elsewhere on a fence line**, a backtick that would break the fence is refused where markup is
   decorated: a backtick fence's info string can't hold a backtick, and a closing fence can't have
   text after it (Backtick7). Where markup is text (`markup: text`, the default), the host types it,
   as any character in markup there, and the block breaks. In a tilde fence's info string it is
   text, the host's.
3. **On a code line**, a backtick is code, the host's, unless it would close the block there (a run
   as long as the opening fence, alone on its line). Right above the closing fence, it is that fence
   typed again, as a text editor's user types it: it takes the old fence's place (Backtick9).
   Between code lines, both fences grow past it, so it stays code (Backtick10). An unclosed block,
   it closes, the host's (Backtick11).
4. **Where it makes its line open a fence** (the third backtick at a paragraph's or an item's text
   start), `fences` and `all` put the closing fence on the line below, as long, in the line's
   containers, so the block takes in nothing (Backtick1, Backtick2, Backtick3). The caret goes after
   the opening run, where the info string is typed. The rest of the line is the info string
   (Backtick12). Lines of the paragraph below the fence line stay text after the block, and lines
   above it stay text before it (Backtick17). With `none` the backtick is the host's, and the fence
   reads to the end of its container, as Markdown reads it (Backtick8).
5. **Backspace and Delete in a fence's run** shorten both fences (Backtick14, Backtick23). A fence
   is at least three backticks, so at three: from the opening fence of a block with nothing between
   its fences and no info string, the fences go back to the text they were typed from, the closing
   fence going (Backtick15, Backtick24: the inverse of rule 4); any other empty block goes as a unit,
   its info string and blank lines too, as an empty item does (Backtick25, Backtick26, Backtick27);
   a block with code is refused where markup is decorated, from either fence (Backtick13,
   Backtick16): its code can't go with one press, and without the fence it would be text. Where
   markup is text, the host deletes the backtick, as it deletes a character of any markup there
   (Backtick28).
6. **Inline backticks** are the host's by default (Backtick18). With `closeBackticks: all`, a
   backtick at a word boundary outside code is typed as a pair, the caret between; typed right
   before the closing backtick of an empty pair or of the code span the caret is in, it steps over
   it, anywhere in its closing run (Backtick19, Backtick32); Backspace in an empty pair takes both
   (Backtick20); over a selection on one
   line, it makes the selection code (Backtick21). Three backticks at a line's start still open a
   closed fence (Backtick22).
7. **A tilde on a tilde fence** does what a backtick does on a backtick fence (Backtick29,
   Backtick30); a tilde in text is the host's.
8. **Typed over a selection that takes part of a fence's run**, any character would break the fence:
   refused where markup is decorated, the host's where it is text (Backtick31). Several characters
   typed at once (an input method's, a text replacement's) are played a character at a time.

A fence's run is where ourus edits under both `markup` values, as a code line is: the rules keep the
fences matched, which no hand edit of one fence does; only the edits that would break the block are
the host's where markup is text (rules 2 and 5). Before a fence line's run, in a marker or a
container's indentation, typing is the host's under `text`, as anywhere in markup
([typing.md](typing.md) rule 2). Under `decorated` the caret never ends on a fence: where these
cases leave it on the closing one (Backtick5, Backtick9, Backtick14, Backtick23), it goes to the end
of the code instead, as in [Fence32b](fences.md#fence32b).

## Backtick1

The third backtick at the start of a paragraph's text opens a fence, and its closing fence goes in
below it, so the block takes in nothing. The caret stays after the opening run, where the info
string is typed, and Enter there makes the first code line ([Fence rules](fences.md)). Bare
Obsidian closes it too; a text editor leaves it open ([Backtick8](#backtick8)).

```yaml
tags: common markup-fence
```

```buffer
intro

┃
```

> "```"

````buffer
intro

```┃
```
````


> "js" enter "x"

````buffer
intro

```js
x┃
```
````

## Backtick2

In an item, the block is the item's text, and its closing fence goes at the item's content column,
where it stays in the item. WorkFlowy closes it too, the caret on the code's first line.

```yaml
tags: common markup-fence
```

```buffer
- a
- ┃
```

> "```"

````buffer
- a
- ```┃
  ```
````

## Backtick3

In a quote, the closing fence goes in the quote.

```yaml
tags: edge markup-fence
```

```buffer
> quote
>
> ┃
```

> "```"

````buffer
> quote
>
> ```┃
> ```
````

## Backtick4

A fourth backtick lengthens the opening fence, and the closing fence with it: typing a fence of any
length gives a closed block of that length. Bare Obsidian leaves the closing fence at three, which
then closes nothing.

```yaml
tags: common markup-fence
```

```buffer
┃
```

> "````"

`````buffer
````┃
````
`````

## Backtick5

A backtick at the end of a closing fence lengthens it, and the opening fence with it, so the two
match. Bare Obsidian lengthens the closing fence alone: the block still closes, its fences no longer
matching.

```yaml
tags: common markup-fence
```

````buffer
```js
code
```┃
````

> "`"

`````buffer
````js
code
````┃
`````

## Backtick6

The opening fence of a block in an item grows, its info string and code untouched, and the closing
fence too: alone, the longer opening fence would leave the block unclosed, taking in `- b`.

```yaml
tags: edge markup-fence
```

````buffer
- a
  ```┃js
  code
  ```
- b
````

> "`"

`````buffer
- a
  ````┃js
  code
  ````
- b
`````

## Backtick7

A backtick fence's info string can't hold a backtick: typed there, the line would be text, and the
block would open at its closing fence and run to the end of the document. Where markup is
decorated, refused; where it is text, the host types it ([Backtick28](#backtick28)).

```yaml
tags: edge markup-fence
markup: decorated
```

````buffer
```js┃
code
```

after
````

> "`"

````buffer
```js┃
code
```

after
````

```yaml
result: rejected not-expressible
```

## Backtick8

With `closeBackticks: none` the backtick is the host's, as a text editor types it: the fence opens
and reads to the end of the document, taking in the paragraph after it, until a closing fence is
typed.

```yaml
tags: edge free-form markup-fence
closeBackticks: none
```

```buffer
intro

┃

after
```

> "```"

````buffer
intro

```┃

after
````

```yaml
result: notApplicable
```

## Backtick9

The closing fence typed again right above it, as the user of a text editor closes a block: it takes
the closing fence's place, and the caret is after it, at the end of the block. Bare Obsidian takes
it for a new fence and closes that too, leaving an empty block after the code; Tana and WorkFlowy
keep it as code, the fences growing past it, as between code lines ([Backtick10](#backtick10)).

```yaml
tags: common markup-fence
```

````buffer
```
code
┃
```
````

> "```"

````buffer
```
code
```┃
````

## Backtick10

A run of backticks typed between code lines would close the block early: both fences grow past it,
so it stays code, as when a code block quotes a Markdown fence.

```yaml
tags: edge markup-fence
```

````buffer
```md
┃
text
```
````

> "```"

`````buffer
````md
```┃
text
````
`````

## Backtick11

An unclosed fence, typed with `closeBackticks: none` or there before, is closed by typing its
closing fence: the host's.

```yaml
tags: rare markup-fence
closeBackticks: none
```

````buffer
```
code
┃
````

> "```"

````buffer
```
code
```┃
````

```yaml
result: notApplicable
```

## Backtick12

Typed before text, the fence takes the rest of the line as its info string, the caret before it;
Enter there moves it into the code.

```yaml
tags: edge markup-fence
```

```buffer
``┃print(1)
```

> "`"

````buffer
```┃print(1)
```
````

> enter

````buffer
```
┃print(1)
```
````

## Backtick13

Backspace at the end of a closing fence of three, in a block with code, is refused where markup is
decorated: the fence can't be shorter, and the code can't go with it in one press. Deleting the
code first leaves an empty block, which goes ([Backtick25](#backtick25)). Where markup is text, it
is the host's ([Backtick28](#backtick28)).

```yaml
tags: edge markup-fence
markup: decorated
```

````buffer
```
code
```┃
````

> deleteContentBackward

````buffer
```
code
```┃
````

```yaml
result: rejected not-expressible
```

## Backtick14

Backspace in a fence's run of four shortens both fences: alone, a closing fence shorter than the
opening one wouldn't close the block.

```yaml
tags: edge markup-fence
```

`````buffer
````
code
````┃

after
`````

> deleteContentBackward

````buffer
```
code
```┃

after
````

## Backtick15

Backspace right after typing a fence takes it back: the empty block's fences are text again, the
closing fence going with the third backtick, the inverse of [Backtick1](#backtick1). Bare Obsidian
deletes the backtick alone, and the closing fence it added opens a block that takes in everything
after it.

```yaml
tags: common markup-fence
```

```buffer
intro

``┃
```

> "`"

````buffer
intro

```┃
```
````

> deleteContentBackward

```buffer
intro

``┃
```

## Backtick16

Backspace in a fence's run of three, in a block with code, is refused where markup is decorated:
the opening fence would be text, and its closing fence would open a block that runs to the end of
the document.

```yaml
tags: edge markup-fence
markup: decorated
```

````buffer
```┃
code
```

after
````

> deleteContentBackward

````buffer
```┃
code
```

after
````

```yaml
result: rejected not-expressible
```

## Backtick17

A fence typed on a continuation line of a paragraph splits it around the block: the lines above stay
the paragraph, the lines below a paragraph after the block. Backspace joins them back.

```yaml
tags: edge free-form markup-fence
```

```buffer
para
``┃
more
```

> "`"

````buffer
para
```┃
```
more
````

> deleteContentBackward

```buffer
para
``┃
more
```

## Backtick18

By default, a backtick in text is the host's: inline code is typed as it is, as text editors type
it. Bare Obsidian, Logseq and Tine pair it, as `closeBackticks: all` does
([Backtick19](#backtick19)); unclosed inline code breaks no structure, so the default leaves it alone.

```yaml
tags: common
```

```buffer
use ┃ here
```

> "`"

```buffer
use `┃ here
```

```yaml
result: notApplicable
```

## Backtick19

With `closeBackticks: all`, a backtick at a word boundary is typed as a pair, the caret between;
typed again before the closing one, it steps over it.

```yaml
tags: edge
closeBackticks: all
```

```buffer
use ┃ here
```

> "`"

```buffer
use `┃` here
```

> "x`"

```buffer
use `x`┃ here
```

## Backtick20

With `closeBackticks: all`, Backspace in an empty pair takes both backticks, as they came.

```yaml
tags: edge
closeBackticks: all
```

```buffer
use ┃ here
```

> "`" deleteContentBackward

```buffer
use ┃ here
```

## Backtick21

With `closeBackticks: all`, a backtick over a selection on one line makes it code, and it stays
selected.

```yaml
tags: edge
closeBackticks: all
```

```buffer
use «this» here
```

> "`"

```buffer
use `«this»┃` here
```

## Backtick22

With `closeBackticks: all`, three backticks on an empty line still make a closed fence: the first two
a pair and a step over it, the third the fence.

```yaml
tags: edge markup-fence
closeBackticks: all
```

```buffer
intro

┃
```

> "```"

````buffer
intro

```┃
```
````

## Backtick23

Delete in a fence's run shortens both fences, as Backspace does ([Backtick14](#backtick14)).

```yaml
tags: edge markup-fence
```

`````buffer
````
code
┃````
`````

> deleteContentForward

````buffer
```
code
┃```
````

## Backtick24

Delete at the start of an empty block's opening fence of three: its fences are text again, as
Backspace makes them ([Backtick15](#backtick15)).

```yaml
tags: edge markup-fence
```

````buffer
┃```
```
````

> deleteContentForward

```buffer
┃``
```

## Backtick25

Backspace on a fence of an empty block, at three backticks: the block goes as a unit, its info
string and blank lines too, as an empty item does, and the caret goes to the end of the text above.
Bare Obsidian deletes the backtick alone, as a text editor does, and the opening fence then takes in
`after`.

```yaml
tags: common markup-fence
```

````buffer
intro

```c++


```┃

after
````

> deleteContentBackward

```buffer
intro┃

after
```

## Backtick26

An empty block that is an item's text goes from the item, which stays, empty.

```yaml
tags: edge markup-fence
```

````buffer
- a
- ```c++
  ```┃
- b
````

> deleteContentBackward

```buffer
- a
- ┃
- b
```

## Backtick27

Delete at the start of an empty block's opening fence takes the block, as Backspace does
([Backtick25](#backtick25)).

```yaml
tags: edge markup-fence
```

````buffer
intro

┃```c++
```

after
````

> deleteContentForward

```buffer
intro

┃after
```

## Backtick28

Where markup is text (the default), Backspace in a fence's run of three, in a block with code, is
the host's, as any edit of markup there ([Backtick13](#backtick13) is refused where it's decorated):
it deletes the backtick, and the block is no longer closed. Bare Obsidian, Live Preview, Outliner,
true-outliner, SilverBullet and Emacs do the same.

```yaml
tags: edge markup-fence
```

````buffer
```
code
```┃
````

> deleteContentBackward

````buffer
```
code
``┃
````

```yaml
result: notApplicable
```

## Backtick29

A tilde does on a tilde fence what a backtick does on a backtick fence: at the end of the closing
fence it lengthens it, and the opening fence with it ([Backtick5](#backtick5)).

```yaml
tags: rare markup-fence
```

````buffer
~~~js
code
~~~┃
````

> "~"

````buffer
~~~~js
code
~~~~┃
````

## Backtick30

Three tildes at a line's text start open a tilde fence, closed below it, as three backticks do
([Backtick1](#backtick1)).

```yaml
tags: rare markup-fence
```

```buffer
intro

┃
```

> "~~~"

````buffer
intro

~~~┃
~~~
````

## Backtick31

Typed over a selection that takes part of a fence's run, any character would break the fence, and
the block would take in what follows: refused where markup is decorated, the host's where it is
text, as on the fence itself (rules 2 and 5).

```yaml
tags: rare markup-fence
markup: decorated
```

````buffer
«```»
code
```

after
````

> "x"

```yaml
result: rejected not-expressible
```

````buffer
«```»
code
```

after
````

## Backtick32

With `closeBackticks: all`, a code span closed by a run of backticks: typed before any of the run,
the backtick steps over it, so typing the closing run out leaves the span as it was
([Backtick19](#backtick19)).

```yaml
tags: rare
closeBackticks: all
```

```buffer
a ``x┃`` b
```

> "``"

```buffer
a ``x``┃ b
```
