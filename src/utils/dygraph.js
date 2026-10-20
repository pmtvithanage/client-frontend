/**
 * Pure helpers shared by the dygraphs wrapper: CSS-variable colour resolution,
 * ring-buffer trimming and value formatting. Dygraphs draws on `<canvas>`, so
 * colours are resolved from `getComputedStyle` instead of CSS rules.
 * @module utils/dygraph
 */

import { DYGRAPH_FALLBACK_COLOR, DYGRAPH_THEME_VARS } from '../constants/charts.js'

/**
 * Read a CSS custom property from the document root.
 * @param {string} name Variable name, with or without the leading `--`.
 * @returns {string} The trimmed value, or an empty string when unavailable.
 */
export function resolveCssVar(name) {
  if (typeof window === 'undefined' || !name) return ''
  const key = name.startsWith('--') ? name : `--${name}`
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(key).trim()
  } catch {
    return ''
  }
}

/**
 * Resolve a list of colours. Entries starting with `--` are CSS variables;
 * anything else passes through. Missing values fall back.
 * @param {string[]} [values] Colours or CSS variable names.
 * @param {string} [fallback] Fallback colour.
 * @returns {string[]} Resolved colours.
 */
export function resolveColors(values = [], fallback = DYGRAPH_FALLBACK_COLOR) {
  return values.map((value) => {
    if (!value) return fallback
    return value.startsWith('--') ? resolveCssVar(value) || fallback : value
  })
}

/**
 * Resolve the axis / grid / label / background colours from CSS variables.
 * @returns {{axis: string, grid: string, label: string, background: string}}
 */
export function resolveThemeColors() {
  return {
    axis: resolveCssVar(DYGRAPH_THEME_VARS.axis) || DYGRAPH_FALLBACK_COLOR,
    grid: resolveCssVar(DYGRAPH_THEME_VARS.grid) || DYGRAPH_FALLBACK_COLOR,
    label: resolveCssVar(DYGRAPH_THEME_VARS.label) || DYGRAPH_FALLBACK_COLOR,
    background: resolveCssVar(DYGRAPH_THEME_VARS.background) || DYGRAPH_FALLBACK_COLOR,
  }
}

/**
 * Copy at most `maxPoints` trailing rows (the ring-buffer cap).
 * @param {Array<Array<Date|number>>} rows Data rows.
 * @param {number} maxPoints Buffer capacity.
 * @returns {Array<Array<Date|number>>} Trimmed copy.
 */
export function trimRows(rows, maxPoints) {
  if (!Array.isArray(rows)) return []
  return rows.length > maxPoints ? rows.slice(rows.length - maxPoints) : rows.slice()
}

/**
 * Format a value for the accessible latest-values summary.
 * @param {unknown} value Raw value.
 * @returns {string} Display value.
 */
export function formatChartValue(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number') {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  return String(value)
}

/**
 * Build the screen-reader summary for the latest data row.
 * @param {string[]} seriesNames Column labels (without the x column).
 * @param {Array<Date|number>} [values] The row's values (without the x value).
 * @param {(value: unknown, name?: string) => string} [formatValue] Formatter.
 * @returns {string} e.g. `Bytes: 1,024, Packets: 12`.
 */
export function summarizeRow(seriesNames, values, formatValue = formatChartValue) {
  if (!seriesNames.length) return ''
  return seriesNames
    .map((name, index) => `${name}: ${formatValue(values?.[index], name)}`)
    .join(', ')
}
