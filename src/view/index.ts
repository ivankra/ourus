// The view layer: a document and one reader's folds and zoom over it (`OurusView`), on `doc/`.
//
//   const view = OurusView.of(OurusDoc.parse(text, { config }), { folded, zoom });
//   const next = view.update({ changes, caret });     // a host's edit, the view carried
//   view.isHidden(node), view.zoomRange(), view.touchedSubtrees(selection), view.locate(pos)

export { OurusView, type OurusViewState } from './view.ts';
