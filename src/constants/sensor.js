/**
 * Sensor page constants: the one-sensor rule, health verdicts and their
 * plain-language rules, checklist thresholds and the pairing-code length.
 * @module constants/sensor
 */

/** Number of characters in a valid pairing code. */
export const PAIR_CODE_LENGTH = 8

/** Waiting items above this count make the verdict "Degraded". */
export const DELAY_WARN_ITEMS = 20

/** A sensor with no report for longer than this counts as Offline. */
export const OFFLINE_AFTER_MS = 5 * 60_000

/** Height of each live health mini chart, in pixels. */
export const SENSOR_CHART_HEIGHT = 140

/** Window shown by the live health mini charts, in minutes. */
export const SENSOR_CHART_MINUTES = 15

/** Verdict words shown on the sensor status card. */
export const HEALTH_VERDICT_LABEL = Object.freeze({
  healthy: 'Healthy',
  degraded: 'Degraded',
  offline: 'Offline',
})

/** The verdict rule, written for a non-expert (shown in an InfoTip). */
export const HEALTH_RULE = Object.freeze(
  'Healthy means your sensor reported in the last five minutes, with nothing waiting behind schedule and no read errors. Degraded means it is reporting, but some events are delayed or failing. Offline means it has not reported for more than five minutes.',
)

/** Warning shown in the pairing dialog and section before replacing a sensor. */
export const PAIR_WARNING = Object.freeze(
  'Your account has exactly one sensor. Pairing a new sensor replaces the one watching your network today: the current sensor is disconnected and stops reporting, while your alert history is kept.',
)

/** Explanation shown to members instead of the pairing controls. */
export const MEMBER_PAIR_EXPLANATION = Object.freeze(
  'Only the account owner can pair a sensor. Ask your account owner if the sensor needs replacing.',
)

/** Prefix for the support request subject built from the sensor id. */
export const SUPPORT_SUBJECT_PREFIX = 'Help with sensor'

/** Fallback subject when the sensor has not loaded yet. */
export const SUPPORT_SUBJECT_FALLBACK = 'Help with my sensor'
