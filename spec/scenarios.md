# Scenarios

Longer sequences of actions, as a user would perform them, with the states along the way. The
format is in [README.md](README.md); obsidian-true-outliner's cases have a file of their own,
[obsidian-true-outliner.md](obsidian-true-outliner.md).

## Outliner flows

New child, typed.

### Typing a new child

```buffer
- a┃
```

> enter indent "x"

```buffer
- a
  - x┃
```

### Enter outdents the empty child

Enter on the empty child outdents it; Backspace removes it; walking away settles it.

```buffer
- a┃
```

> enter indent enter

```buffer
- a
- ┃
```

### Backspace removes the empty child

```buffer
- a┃
```

> enter indent deleteContentBackward

```buffer
- a┃
```

### Walking away keeps the empty child, set off by a blank line

```buffer
- a┃
```

> enter

```buffer
- a
- ┃
```

> indent

```buffer
- a
  - ┃◌
```

> cursorDocStart cursorLineBoundaryForward

```buffer
- a┃

  - 
```
