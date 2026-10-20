/**
 * Severity tiers shared by the client portal.
 * `severity_tier` is always one of the values in {@link SEVERITY}.
 * @module constants/severity
 */

/** @type {Readonly<Record<string, string>>} */
export const SEVERITY = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
})

/** All severity tiers, ordered from least to most severe. */
export const SEVERITY_ORDER = [
  SEVERITY.LOW,
  SEVERITY.MEDIUM,
  SEVERITY.HIGH,
  SEVERITY.CRITICAL,
]

/** Numeric rank per tier, used for sorting and comparisons. */
export const SEVERITY_RANK = Object.freeze(
  SEVERITY_ORDER.reduce((acc, tier, index) => {
    acc[tier] = index
    return acc
  }, {}),
)

/**
 * Friendly name shown to clients for each tier (AGENTS.md §4).
 * Clients see `Minor / Moderate / Serious / Urgent` — never the raw tier alone.
 */
export const SEVERITY_NAME = Object.freeze({
  [SEVERITY.LOW]: 'Minor',
  [SEVERITY.MEDIUM]: 'Moderate',
  [SEVERITY.HIGH]: 'Serious',
  [SEVERITY.CRITICAL]: 'Urgent',
})
