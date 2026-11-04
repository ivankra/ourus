# Zoom

Commands:

- `zoomIn`: into the selection's first root, or the node a click names
- `zoomOut`: out one level
- `clearZoom`: out of the zoom
- every command while zoomed

A zoom is the view's, not the text's: the snapshot's `zoom` (dev/21-zoom.md). The buffer draws the
whole text, hidden lines too, and `⟦zoomed⟧` last on the zoom root's first line: at the start what
the view is zoomed into, after a step what it is then (none drawn, no zoom). The rules:

1. **A zoom shows its root's lines, its descendants' and its trailing gap**; any node can be its
   root. `zoomIn` zooms into the node at the caret, or the first the selection touches, or the node
   a click names; `zoomOut` to the root's parent, or out from a top-level root; `clearZoom` out of
   it. A zoom changes no fold (Zoom6, Zoom7, Zoom8).
2. **Zoomed into a node, its folds and its ancestors' hide nothing**, kept for when the zoom is left
   (Zoom5).
3. **Nothing outside the zoom changes**: a command whose result would change, make or move a node
   outside the root's subtree, change the text before the root or after it, or the lists around it,
   is refused (`outside-zoom`): Backspace at the root's text start (Zoom2), a sub-heading outdented
   to the root's level, taking what follows out of its section (Zoom3), a child of the root
   outdented beside it (Zoom11), the root indented into a list beside it (Zoom13). So is one given a
   selection or nodes outside the zoom.
4. **ourus doesn't defer where the host's default would reach outside**: in the root's markup, or a
   line break at its text's start, it refuses (Zoom4); and a key whose default is a plain edit in
   every host (typing, Backspace, Delete) it refuses where that edit would leave the zoom: Delete at
   the end of the root's trailing gap (Zoom12).
5. **Where Enter would make a sibling of the root, it makes its first child**: at the end of an
   item root's text (Zoom1), split mid-text (Zoom10), on an empty item root, whatever
   `enterOnEmptyItem` says (Zoom14).
6. **The root deleted whole, the view zooms out to its nearest ancestor left** (Zoom9).

## Zoom1

Enter at the end of the zoom root's text makes its first child, which stays inside.

```yaml
tags: core
```

```markdown
- a
- b┃①⟦zoomed⟧
- c
```

> enter

```markdown
- a
- b①⟦zoomed⟧
  - ┃◌②
- c
```

## Zoom2

Backspace at the zoom root's text start would join it to a node the view hides: refused.

```yaml
tags: common
```

```markdown
- a①
- ┃b②⟦zoomed⟧
```

> deleteContentBackward

```yaml
result: rejected outside-zoom
```

## Zoom3

Zoomed into a heading, a sub-heading outdented to the root's level would end its section there,
taking what follows out of the zoom: refused, though no line outside changes.

```yaml
tags: rare
```

```markdown
## A①⟦zoomed⟧

### B┃

c
```

> outdent

```yaml
result: rejected outside-zoom
```

## Zoom4

Backspace in the zoom root's marker, where the host shows markup as text, is the host's elsewhere
(Backspace42); zoomed, its default would make ` b` a continuation line of the hidden item above,
so ourus refuses instead of deferring.

```yaml
tags: rare
```

```markdown
- a①
-┃ b②⟦zoomed⟧
```

> deleteContentBackward

```yaml
result: rejected outside-zoom
```

## Zoom5

Zoomed into a folded node, its fold hides nothing: Enter at the end of its text makes its first
child, as on a node not folded, and the fold stays stored, for when the zoom is left.

```yaml
tags: rare
```

```markdown
- x
- a┃①⟦folded⟧⟦zoomed⟧
  - b
```

> enter

```markdown
- x
- a①⟦folded⟧⟦zoomed⟧
  - ┃◌②
  - b
```

## Zoom6

`zoomIn` zooms into the node at the caret; the text and the caret stay.

```yaml
tags: core
```

```markdown
- a
- b┃②
  - c
```

> zoomIn

```markdown
- a
- b┃②⟦zoomed⟧
  - c
```

```yaml
result: success
```

## Zoom7

`zoomOut` goes up a level, to the root's parent, and from a top-level root out of the zoom.

```yaml
tags: core
```

```markdown
- a①
  - b②
    - c┃③⟦zoomed⟧
```

> zoomOut

```markdown
- a
  - b⟦zoomed⟧
    - c
```

> zoomOut zoomOut

```markdown
- a
  - b
    - c
```

## Zoom8

`clearZoom` leaves the zoom at once; a click on a node's mark zooms into it, the caret moved
into it from where the zoom hides it.

```yaml
tags: common
```

```markdown
- a┃①
  - b②
    - c③⟦zoomed⟧
```

> clearZoom

```markdown
- a
  - b
    - c
```

> zoomIn ③

```markdown
- a①
  - b②
    - ┃c③⟦zoomed⟧
```

## Zoom9

The zoom root deleted, the view zooms out to its nearest ancestor left.

```yaml
tags: rare
```

```markdown
- a①
  - b┃②⟦zoomed⟧
  - c
```

> deleteSubtree

```yaml
result: success
```

```markdown
- a⟦zoomed⟧
  - c
```

## Zoom10

Split mid-text, the zoom root's rest is its first child, inside the zoom.

```yaml
tags: common
```

```markdown
- a┃b①⟦zoomed⟧
- c
```

> enter

```markdown
- a①⟦zoomed⟧
  - ┃b②
- c
```

## Zoom11

A child of the zoom root outdented would be its sibling, outside the zoom: refused.

```yaml
tags: common
```

```markdown
- a①⟦zoomed⟧
  - b┃
```

> outdent

```yaml
result: rejected outside-zoom
```

## Zoom12

Delete at the end of the zoom's trailing gap would take the blank line between the root and the
next item, outside, making that list tight: refused rather than left to the host.

```yaml
tags: rare
```

```markdown
- a①⟦zoomed⟧
  - b
┃
- c
```

> deleteContentForward

```yaml
result: rejected outside-zoom
```

## Zoom13

The zoom root, a code block, indented would be an item that joins the list after it, which the view
hides: refused.

```yaml
tags: rare markup-fence
```

````markdown
```┃①⟦zoomed⟧
x
```
- a
````

> indent

```yaml
result: rejected outside-zoom
```

## Zoom14

Enter on an empty zoom root makes its first child, inside the zoom, where `enterOnEmptyItem: unwrap`
would take the root out of its list.

```yaml
tags: rare
enterOnEmptyItem: unwrap
```

```markdown
- x①
- ┃②⟦zoomed⟧
  - b
```

> enter

```markdown
- x①
- ②⟦zoomed⟧
  - ┃
  - b
```
