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
  // TODO: Hooks for activitystream rendering?
  'application/activity+json': 'json',
  'application/ld+json': 'json',
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
if(window.HAS_AGREGORE_RENDERED) return
window.HAS_AGREGORE_RENDERED = true
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

// Table sorting functionality
function addTableSorting() {
  const tables = document.querySelectorAll('table')

  for (const table of tables) {
    const thead = table.querySelector('thead')
    const tbody = table.querySelector('tbody')

    if (!thead || !tbody) continue

    const hasHeaderButtons = table.querySelector('th button, th a')
    if (hasHeaderButtons) continue

    const headerCells = thead.querySelectorAll('th')

    for (let columnIndex = 0; columnIndex < headerCells.length; columnIndex++) {
      const headerCell = headerCells[columnIndex]
      // Create sort button
      const sortButton = document.createElement('button')
      sortButton.innerHTML = '↕️'
      sortButton.className = 'agregore-sort-btn'
      sortButton.style.cssText = 'background: none; border: none; cursor: pointer; font-size: 1em; padding: 2px 6px; margin-left: 8px;'
      sortButton.setAttribute('data-column', columnIndex)
      sortButton.setAttribute('data-sort-state', 'unsorted')

      // Add click handler
      sortButton.addEventListener('click', () => handleSort(table, columnIndex, sortButton))

      // Append button to header cell
      headerCell.appendChild(sortButton)
    }
  }
}

function handleSort(table, columnIndex, clickedButton) {
  const tbody = table.querySelector('tbody')
  const currentSortState = clickedButton.dataset.sortState

  // Reset all sort buttons to unsorted state
  const allSortButtons = table.querySelectorAll('.agregore-sort-btn')
  for (const btn of allSortButtons) {
    btn.innerHTML = '↕️'
    btn.setAttribute('data-sort-state', 'unsorted')
  }

  // Determine new sort state
  let newSortState, newSortIcon
  if (currentSortState === 'unsorted' || currentSortState === 'descending') {
    newSortState = 'ascending'
    newSortIcon = '⬆️'
  } else {
    newSortState = 'descending'
    newSortIcon = '⬇️'
  }

  // Update clicked button
  clickedButton.innerHTML = newSortIcon
  clickedButton.setAttribute('data-sort-state', newSortState)

  // Sort rows
  const rowElements = tbody.querySelectorAll('tr')
  const sortedRows = []

  // Collect rows into array for sorting
  for (const row of rowElements) {
    sortedRows.push(row)
  }

  sortedRows.sort((rowA, rowB) => {
    const cellA = rowA.cells[columnIndex]
    const cellB = rowB.cells[columnIndex]

    if (!cellA || !cellB) return 0

    const textA = cellA.textContent.trim()
    const textB = cellB.textContent.trim()

    // Try to parse as numbers first
    const numA = parseFloat(textA)
    const numB = parseFloat(textB)

    if (!isNaN(numA) && !isNaN(numB)) {
      return newSortState === 'ascending' ? numA - numB : numB - numA
    }

    // Fall back to string comparison
    if (newSortState === 'ascending') {
      return textA.localeCompare(textB)
    } else {
      return textB.localeCompare(textA)
    }
  })

  // Replace table body with sorted rows
  tbody.innerHTML = ''
  for (const row of sortedRows) {
    tbody.appendChild(row)
  }
}

// Initialize table sorting
addTableSorting()
})()
`

console.log('Waiting to inject rendering code', { SCRIPT_MAP, TYPE_MAP })

chrome.browserAction.onClicked.addListener(({ id: tabId }) => {
  const readerCode = `
(function (){
  const src = "${scriptURL('reader')}"
  const script = document.createElement('script')
  script.setAttribute('src', src)
  script.setAttribute('charset', 'utf-8')
  document.body.appendChild(script)
})();
`
  chrome.tabs.executeScript(tabId, { code: readerCode })
})

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
