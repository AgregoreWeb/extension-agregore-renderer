(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

function makeLink (url, suffix, value=url) {
  return `"<a href="${url}">${escapeHtml(value)}</a>"${suffix}`
}

function makeIPLDLink (cid) {
  return `ipld://${cid}/`
}

},{"./template.js":3,"escape-html":2}],2:[function(require,module,exports){
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

'use strict';

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}

},{}],3:[function(require,module,exports){
module.exports = function renderPage (content, title) {
  document.open()
  document.write(`
<!DOCTYPE html>
<title>${title}</title>
<meta charset="utf-8"/>
<meta http-equiv="Content-Type" content="text/html charset=utf-8"/>
<link rel="stylesheet" href="agregore://theme/style.css"/>
<link rel="stylesheet" href="agregore://theme/highlight.css"/>
${content}
<script src="agregore://theme/highlight.js"></script>
<script>
  const toAnchor = document.querySelectorAll('h1[id],h2[id],h3[id],h4[id]')

  for(let element of toAnchor) {
    const anchor = document.createElement('a')
    anchor.setAttribute('href', '#' + element.id)
    anchor.setAttribute('class', 'agregore-header-anchor')
    anchor.innerHTML = element.innerHTML
    element.innerHTML = anchor.outerHTML
  }

  if(window.hljs) hljs.initHighlightingOnLoad()
</script>
`)
}

},{}]},{},[1]);
