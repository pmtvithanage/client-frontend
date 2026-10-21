/**
 * Alert view-model helpers shared by the list and detail pages: which side
 * of a flow is the client's own device, filter matching for live arrivals,
 * and sort-aware comparisons.
 * @module utils/alerts
 */

import { SEVERITY_RANK } from '../constants/severity.js'
import { ALERT_STATUS_ORDER } from '../constants/statuses.js'

/** Same fields the API searches for `q` (kept identical for live matching). */
const QUERY_FIELDS = [
  'id',
  'src_ip',
  'dst_ip',
  'dst_port',
  'protocol',
  'category',
  'signature',
  'status',
]

/**
 * The client-side address of a flow: the source for outbound traffic, the
 * destination for inbound and internal traffic (the sensor tags direction,
 * so the device is always the side the alert is "about").
 * @param {object} alert Client-safe alert.
 * @returns {string} The device IP.
 */
export function deviceIp(alert) {
  return alert.direction === 'outbound' ? alert.src_ip : alert.dst_ip
}

/**
 * The far side of a flow (the address the device was talking to).
 * @param {object} alert Client-safe alert.
 * @returns {string} The other IP.
 */
export function otherIp(alert) {
  return alert.direction === 'outbound' ? alert.dst_ip : alert.src_ip
}

/**
 * How a flow direction reads to a non-expert.
 * @param {string} direction `outbound | inbound | internal`.
 * @returns {string} A short plain-English phrase.
 */
export function directionLabel(direction) {
  if (direction === 'outbound') return 'Outbound — from your network to the internet'
  if (direction === 'inbound') return 'Inbound — from the internet into your network'
  return 'Internal — between two machines inside your network'
}

/**
 * Does an alert match the current list filters? Used to decide whether a live
 * arrival belongs in the "new alerts" banner (same rules as the API's
 * `GET /alerts` parameters).
 * @param {object} alert Client-safe alert.
 * @param {{severity: string[], status: string[], category: string, q: string,
 *   from: string|null, to: string|null}} filters Parsed list filters.
 * @returns {boolean}
 */
export function alertMatchesFilters(alert, filters) {
  if (filters.severity.length && !filters.severity.includes(alert.severity_tier)) return false
  if (filters.status.length && !filters.status.includes(alert.status)) return false
  if (filters.category && alert.category !== filters.category) return false
  if (filters.from && Date.parse(alert.ts) < Date.parse(filters.from)) return false
  if (filters.to && Date.parse(alert.ts) > Date.parse(filters.to)) return false
  const q = filters.q.trim().toLowerCase()
  if (q) {
    const hit = QUERY_FIELDS.some((field) =>
      String(alert[field] ?? '').toLowerCase().includes(q),
    )
    if (!hit) return false
  }
  return true
}

/** Rankers for fields that sort by meaning rather than alphabetically. */
const RANKERS = Object.freeze({
  severity_tier: (value) => SEVERITY_RANK[value] ?? -1,
  status: (value) => ALERT_STATUS_ORDER.indexOf(value),
})

/**
 * Compare two alerts with the same `field:asc|field:desc` rules the API uses.
 * @param {object} a First alert.
 * @param {object} b Second alert.
 * @param {string} sort Sort expression (`ts:desc`, `severity_tier:asc`, …).
 * @returns {number} Standard comparator result.
 */
export function compareAlerts(a, b, sort) {
  const [field, dir] = String(sort).split(':')
  const rank = RANKERS[field]
  const read = (item) => (field === 'ts' ? Date.parse(item.ts) : item[field])
  const av = rank ? rank(a[field]) : read(a)
  const bv = rank ? rank(b[field]) : read(b)
  if (av === bv) return 0
  return (av < bv ? -1 : 1) * (dir === 'asc' ? 1 : -1)
}

/**
 * Merge live-shown alerts into the server pages, de-duplicated by id and
 * ordered by the current sort.
 * @param {object[]} live Alerts the user has revealed from the banner.
 * @param {object[]} server Rows flattened from the loaded pages.
 * @param {string} sort Sort expression.
 * @returns {object[]} A new array.
 */
export function mergeAlertRows(live, server, sort) {
  const seen = new Set()
  const merged = []
  for (const alert of [...live, ...server]) {
    if (seen.has(alert.id)) continue
    seen.add(alert.id)
    merged.push(alert)
  }
  return merged.sort((a, b) => compareAlerts(a, b, sort))
}
