/* global location */

const escapeHtml = require('escape-html')
const renderPage = require('./template.js')

const URL_REGEX = /(^\w+:|\.\/|\.\.\/|\/)[^\s<>"]+$/

// Might only work on Chromium
const text = document.querySelector('pre').innerText
const parsed = JSON.parse(text)
const rendered = isDIDDocument(parsed) ? renderDIDDocument(parsed) : render(parsed)
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

  details pre {
    overflow-x: auto;
    background: var(--browser-theme-background);
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

/**
 * Detect if JSON is a DID Document
 * Checks for common DID Document properties
 */
function isDIDDocument (json) {
  if (typeof json !== 'object' || json === null) return false
  
  const hasDidId = typeof json.id === 'string' && json.id.startsWith('did:')

  const hasDidFields = json['@context'] || json.verificationMethod || json.service || json.alsoKnownAs
  
  return hasDidId && hasDidFields
}

/**
 * Render a DID Document with special formatting
 */
function renderDIDDocument (doc) {
  const did = doc.id || 'Unknown DID'

  // Extract handle from alsoKnownAs (AT Protocol format: at://handle)
  const handle = (doc.alsoKnownAs || [])
    .map((aka) => aka.replace('at://', '@'))
    .find((aka) => aka.startsWith('@')) || did

  // Extract PDS from service endpoints
  const pds = (doc.service || [])
    .filter((s) => s.type === 'AtprotoPersonalDataServer')
    .map((s) => s.serviceEndpoint)
    .join(', ') || null

  const verificationKeys = (doc.verificationMethod || [])
    .map((vm) => {
      const keyValue = vm.publicKeyMultibase || vm.publicKeyBase64 || 'N/A'
      return `<dt>${escapeHtml(vm.id || vm.type || '')}</dt>
        <dd>
          <dl>
            <dt>Type</dt><dd>${escapeHtml(vm.type || '')}</dd>
            <dt>Key</dt><dd><samp>${escapeHtml(keyValue)}</samp></dd>
          </dl>
        </dd>`
    }).join('')

  const services = (doc.service || [])
    .map((s) => `<dt>${escapeHtml(s.id || '')}</dt>
      <dd>
        <dl>
          <dt>Type</dt><dd>${escapeHtml(s.type || '')}</dd>
          <dt>Endpoint</dt><dd><a href="${escapeHtml(s.serviceEndpoint || '')}">${escapeHtml(s.serviceEndpoint || '')}</a></dd>
        </dl>
      </dd>`).join('')

  // Render aliases/alsoKnownAs
  const aliases = (doc.alsoKnownAs || [])
    .map((aka) => `<li><a href="${escapeHtml(aka)}">${escapeHtml(aka)}</a></li>`)
    .join('')

  // Render raw JSON for reference
  const prettyJSON = JSON.stringify(doc, null, 2)

  return `
    <h1>${escapeHtml(handle)}</h1>
    <dl>
      <dt>DID</dt><dd><samp>${escapeHtml(did)}</samp></dd>
      ${pds ? `<dt>PDS</dt><dd><a href="${escapeHtml(pds)}">${escapeHtml(pds)}</a></dd>` : ''}
    </dl>

    ${aliases ? `<section>
      <h2>Also Known As</h2>
      <ul>${aliases}</ul>
    </section>` : ''}

    ${verificationKeys ? `<section>
      <h2>Verification Methods</h2>
      <dl>${verificationKeys}</dl>
    </section>` : ''}

    ${services ? `<section>
      <h2>Services</h2>
      <dl>${services}</dl>
    </section>` : ''}

    <details>
      <summary>Raw DID Document (JSON)</summary>
      <pre><code>${escapeHtml(prettyJSON)}</code></pre>
    </details>
  `
}
