/* global location */

const escapeHtml = require('escape-html')
const renderPage = require('./template.js')

const URL_REGEX = /(^\w+:|\.\/|\.\.\/|\/)[^\s<>"]+$/

// Might only work on Chromium
const text = document.querySelector('pre').innerText
const parsed = JSON.parse(text)
const rendered = render(parsed)
const title = location.href

const content = `
<style>
  ul {
    padding: 0.5em;
  }
  dt {
    color: var(--ag-theme-primary);
  }
  span {
    color: var(--ag-theme-secondary);
  }
  li {
    list-style: none;
    padding-left: 1em;
  }
  dl {
    margin: 0px;
  }
</style>
${rendered}
`

renderPage(content, title)

function render (json, suffix = '') {
  if (Array.isArray(json)) {
    const values = json.map((value, index) => {
      const isLast = index === (json.length - 1)
      const suffix = isLast ? '' : ','
      return `<li>${render(value, suffix)}</li>`
    }).join('\n')

    return `<ul>
    <span>[</span>
    ${values}
    <span>]</span>
    </ul>`
  } else if (typeof json === 'object' && json !== null) {
    const keys = Object.keys(json)
    // Special case for IPLD dag-json data with links
    const isCID = keys.length === 1 && keys[0] === '/' && (typeof json['/'] === 'string')
    const values = Object.keys(json).map((key, index) => {
      const value = json[key]
      const isLast = index === (keys.length - 1)

      const suffix = isLast ? '' : ','

      const renderedKey = escapeHtml(JSON.stringify(key))
      const renderedValue = isCID ? makeLink(makeIPLDLink(value), suffix, value) : render(value, suffix)

      return `<dt>${renderedKey}:</dt><dd>${renderedValue}</dd>`
    }).join('\n')

    return `<dl>
    <span>{</span>
    ${values}
    <span>}</span>${suffix}
    </dl>`
  } else {
    if (isURL(json)) {
      return makeLink(json, suffix)
    }
    const escaped = escapeHtml(JSON.stringify(json))
    return `${escaped}${suffix}`
  }
}

function isURL (value) {
  return (typeof value === 'string') && value.match(URL_REGEX)
}

function makeLink (url, suffix, value = url) {
  return `"<a href="${url}">${escapeHtml(value)}</a>"${suffix}`
}

function makeIPLDLink (cid) {
  return `ipld://${cid}/`
}
