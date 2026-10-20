/**
 * Alert generation and paging constants for the dummy data layer.
 * @module constants/alerts
 */

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
