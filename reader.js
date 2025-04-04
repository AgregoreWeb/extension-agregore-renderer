/* global DOMParser, document */
const renderPage = require('./template.js')
const { Readability } = require('@mozilla/readability')

const article = new Readability(document).parse()

const { title, content, byline } = article

let cleanedContent = content

try {
  const parsed = (new DOMParser()).parseFromString(content, 'text/html')

  const mainContents = parsed.querySelector('.page').childNodes[0]
  const container = parsed.createElement('main')

  for (const child of [...mainContents.childNodes]) {
    if (child.tagName === 'DIV') {
      const wrapper = document.createElement('p')
      wrapper.innerHTML = child.innerHTML
      container.appendChild(wrapper)
      continue
    }
    container.appendChild(child)
  }

  // Find the container with all the paragraphs
  cleanedContent = container.innerHTML
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
