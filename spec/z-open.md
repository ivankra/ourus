# Open questions

Questions this review left open, one each: what ourus does today, drawn where no command file draws
it, what the alternative is, and a recommendation. A settled one moves to its command's file.

## Choices made without the user

Each is the fallback the rules already had, drawn as a case in its command's file; to confirm or
change: lines pasted in a heading's title go after it rather than being refused
([Paste2](paste.md#paste2)); a line copied with its line break is two lines, not inline text
([PasteList8](paste-list.md#pastelist8)); a paste at a heading's text start goes where it does at its
end, first in its section ([Paste6](paste.md#paste6)).

## Open2

Should a block of lines (fenced or indented code, math, a comment, a table) own the list right after
it, as a section's paragraph does? Today it owns nothing: the list after it is its sibling, so a
command on the block leaves the list where it is (drawn here: deleting the code keeps the list), and
an item whose text is code, outdented at the top level, becomes the code block with its children the
items after it ([Outdent19](outdent.md#outdent19)), a parent change the README's guarantee 4 names.

The alternative: such a block owns the list after it, as a paragraph does. Outdent19 would keep the
children under the block, no parent changed, and blocks and paragraphs would follow one rule. But
every list after a code block, in every document, would become its children: deleting, moving or
duplicating the block would take the list along, and indent and outdent of those items would act
inside the block's list. Block outliners (Logseq, Roam, WorkFlowy) let any block, code included,
have children, but there every block is a list item; text editors give a list after code no parent.
Recommended: keep blocks childless, as today (a code block rarely introduces a list the way
`Steps:` does). Kept open, to revisit (the user).

The same question, wider: where a node lands somewhere it can't hold what it held, its children
follow it as siblings, and the reverse command doesn't put them back. A paragraph indented into a
quote leaves its list beside it there, where a paragraph owns none
([Quote78](quotes.md#quote78)); a top-level item outdented to a paragraph releases a code block it
held, which a paragraph can't own. Guarantee 4 names only Outdent19's case. The two consistent
answers: one rule in guarantee 4 (children a node can't hold where it lands follow it as its next
siblings), each case stating its inverse; or refusing all of them. Decided with the above.

```yaml
tags: rare
```

````buffer
┃```
code
```
- c
````

> deleteSubtree

```buffer
- ┃c
```

