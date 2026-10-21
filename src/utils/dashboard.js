/**
 * Dashboard-only helpers: the hero gauge path, UTC day labels/ranges for the
 * 14-day chart, the 24-hour KPI delta wording, and the `!` annotation markers
 * the live traffic charts draw for Urgent alerts.
 * @module utils/dashboard
 */

import { ANNOTATION_TICK_HEIGHT, GAUGE, MONTH_SHORT } from '../constants/dashboard.js'
import { severityName } from './plainLanguage.js'

/**
 * Convert polar coordinates to an SVG point (0° = east, growing = clockwise).
 * @param {number} cx Centre x.
 * @param {number} cy Centre y.
 * @param {number} r Radius.
 * @param {number} deg Angle in degrees.
 * @returns {{x: number, y: number}}
 */
function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/**
 * SVG path for the gauge arc (defaults to {@link GAUGE} geometry).
 * @param {{center?: number, radius?: number, startAngle?: number, endAngle?: number}} [shape]
 * @returns {string} `d` attribute: one arc from start to end angle.
 */
export function gaugeArcPath({ center, radius, startAngle, endAngle } = GAUGE) {
  const start = polar(center, radius, startAngle)
  const end = polar(center, radius, endAngle)
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

/**
 * UTC calendar day of a date (`YYYY-MM-DD`), matching the overview trend keys.
 * @param {Date|string|number} date Timestamp.
 * @returns {string} e.g. `2026-10-13`.
 */
export function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10)
}

/**
 * Axis label for a `YYYY-MM-DD` day key, independent of the browser timezone.
 * @param {string} key Day key.
 * @returns {string} e.g. `13 Oct`.
 */
export function dayLabel(key) {
  const month = MONTH_SHORT[Number(key.slice(5, 7)) - 1] ?? ''
  return `${Number(key.slice(8, 10))} ${month}`
}

/**
 * Inclusive UTC range covering one day, for `/alerts?from=…&to=…`.
 * @param {string} key Day key (`YYYY-MM-DD`).
 * @returns {{from: string, to: string}} ISO timestamps.
 */
export function dayRange(key) {
  const start = Date.parse(`${key}T00:00:00.000Z`)
  return {
    from: new Date(start).toISOString(),
    to: new Date(start + 86_400_000 - 1).toISOString(),
  }
}

/**
 * Plain-English wording for a KPI change against the previous window.
 * @param {number} recent Count in the current window.
 * @param {number} previous Count in the previous window.
 * @param {string} [label] Window description, e.g. `the previous 24 hours`.
 * @returns {string} e.g. `5 more than the previous 24 hours`.
 */
export function deltaPhrase(recent, previous, label = 'the previous 24 hours') {
  const diff = recent - previous
  if (diff > 0) return `${diff} more than ${label}`
  if (diff < 0) return `${-diff} fewer than ${label}`
  return `Same as ${label}`
}

/**
 * Dygraphs `!` markers for Urgent alerts, snapped onto the one-second traffic
 * grid (an annotation only draws when its `xval` matches a data point exactly).
 * @param {object[]} alerts Client alert views (may overlap; deduped by id).
 * @param {number|null} gridStartMs Timestamp of the first traffic point.
 * @param {string} series Exact column label to attach the marker to.
 * @returns {Array<object>} Annotation objects for `graph.setAnnotations()`.
 */
export function buildUrgentAnnotations(alerts, gridStartMs, series) {
  if (!gridStartMs || !series) return []
  const seen = new Set()
  const annotations = []
  for (const alert of alerts) {
    if (alert.severity_tier !== 'CRITICAL' || seen.has(alert.id)) continue
    seen.add(alert.id)
    const ts = Date.parse(alert.ts)
    if (Number.isNaN(ts)) continue
    annotations.push({
      xval: Math.round((ts - gridStartMs) / 1000) * 1000 + gridStartMs,
      series,
      shortText: '!',
      text: `${severityName(alert.severity_tier)} alert: ${alert.category}`,
      tickHeight: ANNOTATION_TICK_HEIGHT,
      alertId: alert.id,
    })
  }
  return annotations
}
