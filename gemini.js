/* global location */

// Only actually load the code if we're in gemini
// This should improve load times a bit
// TODO: Dynamically load the gemini code
const parse = require('gemini-to-html/parse')
const render = require('gemini-to-html/render')
const renderPage = require('./template.js')

// Might only work on Chromium
const text = document.querySelector('pre').innerText
const parsed = parse(text)
const rendered = render(parsed)

const firstHeader = parsed.find(({ type }) => type === 'header')
const title = firstHeader?.content || location.href

renderPage(rendered, title)
