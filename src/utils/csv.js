/**
 * CSV helpers: RFC-style escaping and a browser download trigger.
 * @module utils/csv
 */

/** Quote a single CSV cell. */
function cell(value) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Build CSV text from a header and rows of cells.
 * @param {string[]} header Column titles.
 * @param {Array<Array<string|number>>} rows One array per record.
 * @returns {string} CSV text (CRLF line endings, trailing newline).
 */
export function toCsv(header, rows) {
  const lines = [header.map(cell).join(','), ...rows.map((row) => row.map(cell).join(','))]
  return `${lines.join('\r\n')}\r\n`
}

/**
 * Trigger a browser download of a text file.
 * @param {string} filename Suggested filename.
 * @param {string} text File contents.
 * @param {string} mime MIME type (default `text/csv`).
 */
export function downloadText(filename, text, mime = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
