/**
 * Security score formula inputs (documented in utils/plainLanguage.js).
 * @module constants/security
 */

/**
 * Points subtracted per open alert of each severity.
 * `score = 100 - (urgent×8 + serious×4 + moderate×2 + minor×0.5)`, clamped 0–100.
 */
export const SCORE_WEIGHTS = Object.freeze({
  urgent: 8,
  serious: 4,
  moderate: 2,
  minor: 0.5,
})

/** The score is never negative. */
export const SCORE_FLOOR = 0

/** A perfect score is 100. */
export const SCORE_CEILING = 100

/** Score bands, evaluated from the highest down. */
export const SCORE_LABEL_BANDS = Object.freeze([
  { min: 85, label: 'Excellent' },
  { min: 70, label: 'Good' },
  { min: 45, label: 'Needs attention' },
  { min: 0, label: 'At risk' },
])
