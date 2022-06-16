const { looksLikeLegacySSB, convertLegacySSB, parseUri } = require('ssb-fetch')
const { isSSBURI } = require('ssb-uri2')

module.exports = {
  looksLikeLegacySSB,
  convertLegacySSB,
  convertAtMention,
  isSSBURI,
  parseUrlType
}

function parseUrlType (uri) {
  const { type } = parseUri(uri)
  return type
}

function convertAtMention (ref, message) {
  const mentions = message?.value?.content?.mentions
  if (!mentions) return ''
  const name = ref.slice(1)
  const link = mentions.reduce(
    (filtered, mention) => {
      if (name === mention.name) filtered.id = mention.link
      return filtered
    },
    { id: null }
  )
  if (!link.id) return ''
  return convertLegacySSB(link.id)
}
