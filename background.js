/* global chrome */
const FORBIDDEN_PROTOCOLS = ['devtools:']

chrome.webNavigation.onDOMContentLoaded.addListener(handleLoaded)

/**
 * ssb-fetch returns application/ssb+json for 'post' messages
 * application/json for other message types
 */
const TYPE_MAP = {
  'text/plain': 'markdown',
  'text/markdown': 'markdown',
  'text/gemini': 'gemini',
  'application/json': 'json',
  'application/ssb+json': 'ssb'
}

const SCRIPT_MAP = {
  markdown: scriptURL('markdown'),
  gemini: scriptURL('gemini'),
  json: scriptURL('json'),
  ssb: scriptURL('ssb')
}

const code = `
(function (){
const TYPE_MAP = ${JSON.stringify(TYPE_MAP)}
const SCRIPT_MAP = ${JSON.stringify(SCRIPT_MAP)}
const knownType = TYPE_MAP[document.contentType]
if(knownType) {
  const src = SCRIPT_MAP[knownType]
  const script = document.createElement('script')
  script.setAttribute('src', src)
  script.setAttribute('charset', 'utf-8')
  document.body.appendChild(script)
}
})()
`

console.log('Waiting to inject rendering code', { SCRIPT_MAP, TYPE_MAP })

function handleLoaded ({ tabId, url }) {
  const { protocol } = new URL(url)
  if (FORBIDDEN_PROTOCOLS.includes(protocol)) return

  // Detect if text/markdown/json/gemini by the contentType
  // Then inject the relevant renderer script for the match
  chrome.tabs.executeScript(tabId, { code })
}

function scriptURL (name) {
  return chrome.runtime.getURL(`bundle-${name}.js`)
}
