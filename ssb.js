/* global location */ // eslint-disable-line
const markdown = require('ssb-markdown')
const { convert } = require('html-to-text')
const {
  isSSBURI,
  fromMessageSigil,
  fromBlobSigil,
  fromFeedSigil

} = require('ssb-uri2')
const { isMsgId, isBlobId, isFeedId, isMsgType, isBlobType, isFeedType, extract: extractSSBref } = require('ssb-ref')

const renderPage = require('./template.js')

const markdownOptions = {
  toUrl: ref => renderUrlRef(ref),
  imageLink: ref => ref,
  emoji: emojiAsMarkup => emojiAsMarkup
}

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

function renderTitle (md, options = markdownOptions) {
  const html = markdown.inline(md, options)
  const text = convert(html)
  const sentences = text.match(/\(?[^\.\?\!]+[\.!\?]\)?/g) // eslint-disable-line
  const title = sentences && sentences.length > 0 ? '' + sentences[0] : ''
  return title
}

function renderMarkdown (md, options = markdownOptions) {
  return markdown.block(md, options)
}

function renderUrlRef (ref) {
  if (looksLikeLegacySSB(ref)) return convertLegacySSB(ref)
  if (isSSBURI(ref)) return ref
  return ref
}

function sigilToUrlSafe (id) {
  const msgKey = isMsgId(id)
  const blobKey = isBlobId(id)
  const feedKey = isFeedId(id)
  const msgType = msgKey
    ? 'msgKey'
    : blobKey
      ? 'blobKey'
      : feedKey
        ? 'feedKey'
        : null

  switch (msgType) {
    case 'msgKey':
      return fromMessageSigil(id)
    case 'blobKey':
      return fromBlobSigil(id)
    case 'feedKey':
      return fromFeedSigil(id)
    default:
      throw new Error(`Invalid ssb id: ${id}`)
  }
}

function looksLikeLegacySSB (str) {
  if (!str.startsWith('%') && !str.startsWith('&') && !str.startsWith('@')) return false

  if (isMsgType(str)) return true
  if (isBlobType(str)) return true
  if (isFeedType(str)) return true
  return false
}

function convertLegacySSB (url) {
  return standardiseSSBuri(sigilToUrlSafe(extractSSBref(url)))
}

/** prefer ssb:// uri */
function standardiseSSBuri (url) {
  if (!url.startsWith('ssb://') && url.startsWith('ssb:')) {
    const path = url.split('ssb:')
    return `ssb://${path.slice(1)}`
  }

  return url
}
