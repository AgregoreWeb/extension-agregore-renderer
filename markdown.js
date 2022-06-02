/* global location */
const renderPage = require('./template.js')
const marked = require('marked')

// Might only work on Chromium
const text = document.querySelector('pre').innerText

const tokens = marked.lexer(text)
const rendered = marked.parser(tokens)

const firstHeading = tokens.find((token) => token.type === 'heading')
const title = firstHeading?.text || location.href

renderPage(rendered, title)
