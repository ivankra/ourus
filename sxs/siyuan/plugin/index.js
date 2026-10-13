// ourus's side-by-side runs (sxs/siyuan/ in ourus): the driver's way into SiYuan's plugin API, which
// opens a test's document in the editor (openTab) and gives the editor showing it (getActiveEditor).
// Installed into the test workspace only, by kernel.ts.
const { Plugin, openTab, getActiveEditor } = require("siyuan");

module.exports = class OurusSxs extends Plugin {
  onload() {
    const app = this.app;
    window.__ourusSxs = {
      open: (id) => new Promise((resolve) => openTab({ app, doc: { id }, afterOpen: () => resolve(true) })),
      editor: () => getActiveEditor(),
    };
  }
};
