const renderPage = require('./template.js')
const {Readability} = require('@mozilla/readability')

const article = new Readability(document).parse()

const { title, content, byline } = article

const finalContent = `
<h1>${title}</h1>

<p>
${byline}
</p>

<hr>

${content}
`

renderPage(finalContent, title)
