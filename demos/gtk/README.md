# GTK demo

ourus driving a GTK 4 `TextView`, run by [GJS](https://gjs.guide/). Builds to one self-contained file.

```sh
npm run demo:gtk                     # → demos/gtk/dist/ourus-gtk.js
gjs -m demos/gtk/dist/ourus-gtk.js   # needs gjs and GTK 4 (Debian: apt install gjs)
```
