/**
 * Client alert statuses and the transitions the portal allows (AGENTS.md §6).
 * @module constants/statuses
 */

/** The four statuses a client alert can have, spelled exactly as stored. */
export const ALERT_STATUS = Object.freeze({
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  EXPECTED: 'expected',
  RESOLVED: 'resolved',
})

/** Every status, in workflow order (used for sorting and filters). */
export const ALERT_STATUS_ORDER = [
  ALERT_STATUS.NEW,
  ALERT_STATUS.ACKNOWLEDGED,
  ALERT_STATUS.EXPECTED,
  ALERT_STATUS.RESOLVED,
]

/** Friendly labels for the status chips. */
export const ALERT_STATUS_LABEL = Object.freeze({
  [ALERT_STATUS.NEW]: 'New',
  [ALERT_STATUS.ACKNOWLEDGED]: 'Acknowledged',
  [ALERT_STATUS.EXPECTED]: 'Expected',
  [ALERT_STATUS.RESOLVED]: 'Resolved',
});

/**
 * Allowed status transitions, keyed by the current status.
 * Only a `new` alert can move: to `acknowledged`, `expected` or `resolved`.
 * Anything else is rejected with HTTP 409.
 */
export const ALLOWED_STATUS_TRANSITIONS = Object.freeze({
  [ALERT_STATUS.NEW]: [
    ALERT_STATUS.ACKNOWLEDGED,
    ALERT_STATUS.EXPECTED,
    ALERT_STATUS.RESOLVED,
  ],
})

/** Statuses a member may set; `expected` and `resolved` are owner-only. */
export const MEMBER_ALLOWED_STATUSES = [ALERT_STATUS.ACKNOWLEDGED]
