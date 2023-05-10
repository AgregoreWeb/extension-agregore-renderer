# extension-agregore-renderer

A generalized Markdown/Gemini/JSON content renderer for Agregore. Replaces the old Markdown/Gemini renderers

## How it works:

There's three "renderers" in separate bundles for markdown/json/gemini.

There is a background page that listens for when a page finishes loading.

Upon this happening, the background page will inject a script which checks the `document.contentType`.

If the content type is one of the ones we wish to render (e.g. `application/json`), the appropriate bundle will get injected.

The source code for renderers is in `gemini.js`, `json.js`, and `markdown.js`.

These get compiled using Browserify into single files called `bundle-gemini.js`, `bundle-json.js`, and `bundle-markdown.js` respectively.

If there are more file formats that we should render to HTML, feel free to open a GitHub issue to discuss.
