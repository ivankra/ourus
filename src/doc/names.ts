// What a refusal's detail calls a node: its kind in words, a block of lines by what it is (`code`, a
// `rule`, a `table`), never the parser's names (`atom`, `code_block`, `thematic_break`).

/** The block types of an atom, in words; another's its name, its underscores spaces. */
const BLOCK_NAMES: Readonly<Record<string, string>> = {
  thematic_break: 'rule',
  fenced_code: 'code',
  indented_code: 'code',
  code_block: 'code',
  math_block: 'math',
  html_block: 'HTML block',
  comment_block: 'comment',
  footnote_definition: 'footnote',
  frontmatter: 'front matter',
  blockquote: 'quote',
  refdef: 'link reference',
};

/** Words that take `an`: those starting with a vowel sound. */
const AN = /^(?:[aeiou]|HTML\b)/i;

/**
 * A node's kind in words: `item`, `paragraph`, `heading`, `quote`; an atom, a block of lines, by its
 * block's type (`code`, `rule`, `table`, `math`). `type`: the atom's block type, or its text's.
 */
export function nodeName(kind: string, type?: string): string {
  if (kind !== 'atom') return kind;
  if (!type) return 'block';
  return BLOCK_NAMES[type] ?? type.replace(/_/g, ' ');
}

/** `name` with its article, as a sentence counts it: `a rule`, `an item`, `code`, `math` (no article for a mass noun). */
export function withArticle(name: string): string {
  if (name === 'code' || name === 'math' || name === 'front matter') return name;
  return `${AN.test(name) ? 'an' : 'a'} ${name}`;
}

/** A node's name in words (`nodeName`), from the node: its block's type where it is an atom. */
export function nameOf(node: { readonly kind: string; readonly block?: { readonly type: string } | null }): string {
  return nodeName(node.kind, node.kind === 'atom' ? node.block?.type : undefined);
}
