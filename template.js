module.exports = function renderPage (content, title) {
  document.open()
  document.write(`
<!DOCTYPE html>
<title>${title}</title>
<meta charset="utf-8"/>
<meta http-equiv="Content-Type" content="text/html charset=utf-8"/>
<link rel="stylesheet" href="agregore://theme/style.css"/>
${content}
<script>
  const toAnchor = document.querySelectorAll('h1[id],h2[id],h3[id],h4[id]')

  for(let element of toAnchor) {
    const anchor = document.createElement('a')
    anchor.setAttribute('href', '#' + element.id)
    anchor.setAttribute('class', 'agregore-header-anchor')
    anchor.innerHTML = element.innerHTML
    element.innerHTML = anchor.outerHTML
  }

  // Table sorting functionality
  function addTableSorting() {
    const tables = document.querySelectorAll('table')
    
    for (const table of tables) {
      const thead = table.querySelector('thead')
      const tbody = table.querySelector('tbody')
      
      if (!thead || !tbody) continue
      
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
</script>
`)
  document.close()
  // Needed to trigger document load detection
  window.dispatchEvent(new Event('load'))
}
