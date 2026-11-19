// ourus: an editor-agnostic core for outliner editing of plain-text Markdown.

export { OurusConfig, DECORATIONS, type Decoration } from './config.ts';
export {
  OurusDoc,
  OurusNode,
  OurusProse,
  OurusAtom,
  type OurusText,
  type OurusDocUpdate,
  type BlockId,
  type BlockIdTarget,
  type BlockIdStray,
} from './doc/index.ts';
export { OurusView, type OurusViewState, type OurusViewUpdate } from './view/index.ts';
export {
  executeCommand,
  leavesZoom,
  settlePlaceholders,
  nearestDropPoint,
  OurusSuccess,
  OurusRejected,
  OurusDeferred,
  OurusFailed,
  type OurusCommand,
  type OurusResult,
  type OurusClipboard,
  type OurusSelection,
  type RejectReason,
  type DeferReason,
  type WriteFailed,
  type DropMap,
  type DropPoint,
  type DropSeam,
  type InsertionPoint,
} from './commands/index.ts';
export {
  applyChanges,
  invertChanges,
  mapPos,
  MarkError,
  MarkSet,
  type ChangeSpec,
  type MarkLists,
} from './text/index.ts';
// the parser, as a host reads a note: its tree, flavors, HTML's reading and the tree's types (the rest,
// for an extension's author, is `ourus/extend`'s)
export {
  MdTree,
  MdFlavor,
  MdHtmlParser,
  MdBlockAt,
  type MdParseOptions,
  type MdReread,
  type MdHtmlOptions,
  type MdHtmlParsed,
  type MdAttrs,
  type MdBlock,
  type MdCallout,
  type MdInline,
  type MdInlineText,
  type MdMark,
  type MdLine,
  type MdLineMarkup,
  type MdList,
  type MdPrefixPiece,
  type MdTableAlign,
  type MdTask,
} from './parser/index.ts';
