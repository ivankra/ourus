# The guard

Native edits (the host's typing, deleting and pasting, which no ourus command handled) that would
break the structure the text has: the guard judges them before they apply, permits them, repairs
them, or refuses them. Cases waiting on the guard, moved from `redesign.md` (its "The guard's
permitted transformations" lists what the guard permits).

## Deleting the space after a marker

### Item with children is refused

On an item with children it would re-parent them, so it is refused (unless an explicit "unwrap
item" transformation is defined).

```buffer pending
-┃ a
  - b
```

> deleteContentForward

```buffer
-┃ a
  - b
```

## Typing in a list marker

Typing in the marker lands at the text start, as Enter does. Today `-x a` is no item.

```buffer pending
-┃ a
```

> "x"

```buffer
- x┃a
```
