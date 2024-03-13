/* global DOMParser, document */
const renderPage = require('./template.js')
const { Readability } = require('@mozilla/readability')

const article = new Readability(document).parse()

const { title, content, byline } = article

let cleanedContent = content

try {
  const parsed = (new DOMParser()).parseFromString(content, 'text/html')

  // Find the first paragraph
  const firstP = parsed.querySelector('p')
  const parent = firstP.parentElement
  cleanedContent = parent.innerHTML
} catch (e) {
  console.error('Unable to clean article', e)
}

const finalContent = `
<h1>${title || document.title}</h1>

${byline ? `<p>${byline}</p>` : ''}

<hr>

${cleanedContent}
`

renderPage(finalContent, title)
