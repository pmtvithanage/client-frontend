/**
 * Report period options for `GET /reports`.
 * @module constants/reports
 */

/** Supported `period` values. */
export const REPORT_PERIODS = Object.freeze(['week', 'month'])

/** Period used when the caller does not send one. */
export const DEFAULT_REPORT_PERIOD = 'week'

/** Day 0 of a weekly period is Monday (date-fns `startOfWeek` default). */
export const WEEK_STARTS_ON = 1

/** Friendly labels for the period picker. */
export const REPORT_PERIOD_LABEL = Object.freeze({ week: 'This week', month: 'This month' })
