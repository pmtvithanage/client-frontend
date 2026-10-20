/**
 * Query helpers shared by the dummy resources: list params, day buckets,
 * generic sorting and counting.
 * @module dummy/query
 */

import { SEVERITY_RANK } from '../constants/severity.js'
import { ALERT_STATUS_ORDER } from '../constants/statuses.js'

/** Rankers for the fields that sort by meaning rather than alphabetically. */
const RANKERS = Object.freeze({
  severity_tier: (value) => SEVERITY_RANK[value] ?? -1,
  status: (value) => ALERT_STATUS_ORDER.indexOf(value),
})

/**
 * Normalise a repeatable query param (`?severity=LOW,HIGH` or `?severity[]=..`).
 * @param {string|string[]|undefined|null} value Raw param.
 * @returns {string[]} Trimmed, de-duplicated values; empty array when absent.
 */
export function toArray(value) {
  if (value == null || value === '') return []
  const list = Array.isArray(value) ? value : String(value).split(',')
  return [...new Set(list.map((entry) => String(entry).trim()).filter(Boolean))]
}

/**
 * UTC calendar day for bucketing trends (`YYYY-MM-DD`).
 * @param {string|number|Date} ts Timestamp.
 * @returns {string}
 */
export function dayKey(ts) {
  return new Date(ts).toISOString().slice(0, 10)
}

/**
 * Sort a copy of `items` using `field:asc|field:desc` or `-field`.
 * @template T
 * @param {T[]} items Items to sort.
 * @param {string} [sort='ts:desc'] Sort expression.
 * @param {(item: T, field: string) => unknown} [valueOf] Optional field reader.
 * @returns {T[]} A new array.
 */
export function sortItems(items, sort = 'ts:desc', valueOf) {
  const expression = String(sort).replace(/^-/, '')
  const [field, dir] = expression.split(':')
  // `-ts` means descending; `field:asc` means ascending; default is descending.
  const wantsAscending = !String(sort).startsWith('-') && dir === 'asc'
  const factor = wantsAscending ? 1 : -1
  const read = (item) => (valueOf ? valueOf(item, field) : item[field])
  const rank = RANKERS[field]

  return items.slice().sort((a, b) => {
    const av = rank ? rank(read(a)) : read(a)
    const bv = rank ? rank(read(b)) : read(b)
    if (av === bv) return 0
    return (av < bv ? -1 : 1) * factor
  })
}

/**
 * Count items by a key derived from each item.
 * @template T
 * @param {T[]} items Items to count.
 * @param {(item: T) => string} keyFn Key per item.
 * @returns {Record<string, number>} Counts keyed by `keyFn`.
 */
export function countBy(items, keyFn) {
  const counts = {}
  for (const item of items) {
    const key = keyFn(item)
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

/**
 * Highest-count keys first.
 * @param {Record<string, number>} counts Output of {@link countBy}.
 * @param {number} limit Maximum entries.
 * @returns {Array<{key: string, count: number}>}
 */
export function topEntries(counts, limit) {
  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit)
}
