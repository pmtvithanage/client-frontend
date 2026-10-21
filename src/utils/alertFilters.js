/**
 * URL <-> filter state for `/alerts`. Every filter lives in the query string
 * (shareable links), so the page only ever reads and writes these functions.
 * @module utils/alertFilters
 */

import {
  ALERT_SORT_OPTIONS,
  ALERT_TIME_RANGES,
  DEFAULT_ALERT_RANGE,
  DEFAULT_ALERT_SORT,
  NEEDS_ATTENTION_SEVERITY,
  NEEDS_ATTENTION_STATUS,
} from '../constants/alerts.js'
import { CATEGORIES } from '../constants/categories.js'
import { SEVERITY_ORDER } from '../constants/severity.js'
import { ALERT_STATUS_ORDER } from '../constants/statuses.js'

/** Every query parameter this page reads or writes. */
export const ALERT_PARAM_KEYS = ['severity', 'status', 'category', 'q', 'range', 'from', 'to', 'attention', 'sort']

function listParam(value) {
  return String(value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback
}

/** A preset key's milliseconds, or null for `custom`. */
function rangeMs(key) {
  return ALERT_TIME_RANGES.find((range) => range.key === key)?.ms ?? null
}

/**
 * Parse the URL query string into typed filter state.
 * @param {URLSearchParams} search `useLocation().search` params.
 * @returns {{severity: string[], status: string[], category: string, q: string,
 *   range: string, from: string|null, to: string|null, attention: boolean, sort: string}}
 */
export function parseAlertFilters(search) {
  const severity = listParam(search.get('severity')).filter((tier) => SEVERITY_ORDER.includes(tier))
  const status = listParam(search.get('status')).filter((value) => ALERT_STATUS_ORDER.includes(value))
  const range = oneOf(
    search.get('range') ?? DEFAULT_ALERT_RANGE,
    ALERT_TIME_RANGES.map((entry) => entry.key),
    DEFAULT_ALERT_RANGE,
  )
  return {
    severity,
    status,
    category: CATEGORIES.includes(search.get('category')) ? search.get('category') : '',
    q: search.get('q') ?? '',
    range,
    from: search.get('from') ? isoOrNull(search.get('from')) : null,
    to: search.get('to') ? isoOrNull(search.get('to')) : null,
    attention: search.get('attention') === '1',
    sort: oneOf(
      search.get('sort') ?? DEFAULT_ALERT_SORT,
      ALERT_SORT_OPTIONS.map((entry) => entry.key),
      DEFAULT_ALERT_SORT,
    ),
  }
}

function isoOrNull(value) {
  return Number.isNaN(Date.parse(value)) ? null : new Date(value).toISOString()
}

/**
 * Serialize filter state back into URL search params (keys with default
 * values are dropped so links stay short).
 * @param {object} filters Parsed filters.
 * @returns {URLSearchParams}
 */
export function serializeAlertFilters(filters) {
  const params = new URLSearchParams()
  if (filters.severity.length) params.set('severity', filters.severity.join(','))
  if (filters.status.length) params.set('status', filters.status.join(','))
  if (filters.category) params.set('category', filters.category)
  if (filters.q.trim()) params.set('q', filters.q.trim())
  if (filters.range !== DEFAULT_ALERT_RANGE) params.set('range', filters.range)
  if (filters.range === 'custom') {
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
  }
  if (filters.attention) params.set('attention', '1')
  if (filters.sort !== DEFAULT_ALERT_SORT) params.set('sort', filters.sort)
  return params
}

/**
 * The `from`/`to` window implied by the chosen range, relative to `anchor`.
 * Presets resolve against the preset table; `custom` uses the URL's from/to.
 * @param {object} filters Parsed filters.
 * @param {number} anchor Reference time in milliseconds (pinned per query).
 * @returns {{from: string|null, to: string|null}}
 */
export function rangeWindow(filters, anchor) {
  const ms = rangeMs(filters.range)
  if (ms != null) {
    return { from: new Date(anchor - ms).toISOString(), to: new Date(anchor).toISOString() }
  }
  return { from: filters.from, to: filters.to }
}

/**
 * Translate UI filters into `GET /alerts` query params.
 * "Only needs attention" replaces the severity and status selections with
 * Serious/Urgent + new.
 * @param {object} filters Parsed filters.
 * @param {number} anchor Reference time in milliseconds.
 * @returns {object} Params for `listAlerts` (no cursor/limit).
 */
export function filtersToApiParams(filters, anchor) {
  const { from, to } = rangeWindow(filters, anchor)
  return {
    severity: filters.attention ? [...NEEDS_ATTENTION_SEVERITY] : filters.severity,
    status: filters.attention ? [...NEEDS_ATTENTION_STATUS] : filters.status,
    category: filters.category || undefined,
    q: filters.q.trim() || undefined,
    from: from ?? undefined,
    to: to ?? undefined,
    sort: filters.sort,
  }
}

/**
 * Is any filter different from the page defaults? Drives "Clear filters".
 * @param {object} filters Parsed filters.
 * @returns {boolean}
 */
export function hasActiveFilters(filters) {
  return Boolean(
    filters.severity.length ||
      filters.status.length ||
      filters.category ||
      filters.q.trim() ||
      filters.range !== DEFAULT_ALERT_RANGE ||
      filters.attention ||
      filters.sort !== DEFAULT_ALERT_SORT,
  )
}
