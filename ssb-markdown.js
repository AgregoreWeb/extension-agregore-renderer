const markdown = require('ssb-markdown')
const { looksLikeLegacySSB, convertLegacySSB, isSSBURI } = require('./url')
const { convert } = require('html-to-text')

const markdownOptions = {
  toUrl: ref => renderUrlRef(ref),
  imageLink: ref => ref,
  emoji: emojiAsMarkup => emojiAsMarkup
}

module.exports = {
  renderTitle,
  renderMarkdown
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
  console.log('url ref', ref)
  if (looksLikeLegacySSB(ref)) return convertLegacySSB(ref)
  if (isSSBURI(ref)) return ref
  return ref
}
