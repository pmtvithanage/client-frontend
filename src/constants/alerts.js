/**
 * Alert generation, paging, filtering and keyboard-shortcut constants.
 * @module constants/alerts
 */

import { SEVERITY } from './severity.js'
import { ALERT_STATUS } from './statuses.js'

/** Seeded alerts generated per client, spread over {@link ALERT_WINDOW_DAYS}. */
export const ALERT_COUNT_PER_CLIENT = 150

/** How far back seeded alerts reach, in days. */
export const ALERT_WINDOW_DAYS = 14

/** Default page size for `GET /alerts`. */
export const DEFAULT_LIMIT = 25

/** Hard ceiling for the `limit` query parameter. */
export const MAX_LIMIT = 100

/** Live alerts arrive on `GET /stream/alerts` every 6–12 seconds. */
export const LIVE_ALERT_MIN_INTERVAL_MS = 6000
export const LIVE_ALERT_MAX_INTERVAL_MS = 12000

/** Distribution of statuses by alert age (in days): [new, ack, expected, resolved]. */
export const STATUS_MIX_BY_AGE_DAYS = Object.freeze([
  { maxDays: 2, weights: [0.5, 0.25, 0.1, 0.15] },
  { maxDays: 7, weights: [0.3, 0.25, 0.1, 0.35] },
  { maxDays: 14, weights: [0.1, 0.15, 0.1, 0.65] },
])

/** How often a seeded alert gets one client-authored note (0–1). */
export const NOTE_CHANCE = 0.12

/** Sample notes a client user may have left on their own alerts. */
export const SAMPLE_NOTES = Object.freeze([
  'Checked with the office — this was a planned scan.',
  'Asked the team if anyone was downloading this file.',
  'Left running for now, watching it.',
  'Our accounting app does this every night.',
])

/** Longest note a client user may save. */
export const NOTE_MAX_LENGTH = 500

/** How far back "Related alerts" looks on either side of an alert (hours). */
export const RELATED_HOURS = 24

/** Most related alerts listed on the detail page. */
export const RELATED_LIMIT = 8

/** Page size used when the detail page looks up the filtered list (prev/next). */
export const DETAIL_LIST_LIMIT = 100

/** Time ranges offered on the alerts list (`/alerts`), synced to the URL. */
export const ALERT_TIME_RANGES = Object.freeze([
  { key: '24h', label: '24h', ms: 60 * 60 * 1000 * 24 },
  { key: '7d', label: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
  { key: '14d', label: '14d', ms: 14 * 24 * 60 * 60 * 1000 },
  { key: 'custom', label: 'Custom', ms: null },
])

/** Range selected when `/alerts` opens with no `range` in the URL. */
export const DEFAULT_ALERT_RANGE = '24h'

/** "Only needs attention": the newest Serious/Urgent alerts. */
export const NEEDS_ATTENTION_SEVERITY = Object.freeze([SEVERITY.HIGH, SEVERITY.CRITICAL])
export const NEEDS_ATTENTION_STATUS = Object.freeze([ALERT_STATUS.NEW])

/** Sort options offered on the alerts list, in menu order. */
export const ALERT_SORT_OPTIONS = Object.freeze([
  { key: 'ts:desc', label: 'Newest first' },
  { key: 'ts:asc', label: 'Oldest first' },
  { key: 'severity_tier:desc', label: 'Risk: highest first' },
  { key: 'severity_tier:asc', label: 'Risk: lowest first' },
])

/** Default sort when `/alerts` opens with no `sort` in the URL. */
export const DEFAULT_ALERT_SORT = 'ts:desc'

/** Keyboard shortcuts listed in the "?" help dialog (list page only). */
export const ALERT_SHORTCUTS = Object.freeze([
  { keys: 'j', label: 'Move to the next alert' },
  { keys: 'k', label: 'Move to the previous alert' },
  { keys: 'Enter', label: 'Open the highlighted alert' },
  { keys: 'a', label: 'Acknowledge the highlighted alert' },
  { keys: '/', label: 'Jump to the search box' },
  { keys: '?', label: 'Show this help' },
])
