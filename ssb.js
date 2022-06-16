/* global location */ // eslint-disable-line
const renderPage = require('./template.js')
const { renderMarkdown, renderTitle } = require('./ssb-markdown')

// Might only work on Chromium
const text = document.querySelector('pre').innerText
const { rendered, title } = renderSsbMarkdown(text)

renderPage(rendered, title)

function renderSsbMarkdown (text) {
  const json = JSON.parse(text)
  const post = json.value?.content?.text
  const rendered = renderMarkdown(post)
  const title = renderTitle(post)
  return { rendered, title }
}
