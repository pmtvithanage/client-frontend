/**
 * Report period options and chart settings for `GET /reports`.
 * @module constants/reports
 */

/** Supported `period` values. `custom` requires `from` and `to`. */
export const REPORT_PERIODS = Object.freeze([
  'week',
  'last_week',
  'month',
  'last_month',
  'custom',
])

/** Period used when the caller does not send one. */
export const DEFAULT_REPORT_PERIOD = 'week'

/** Day 0 of a weekly period is Monday (date-fns `startOfWeek` default). */
export const WEEK_STARTS_ON = 1

/** Longest custom range the report accepts, in days. */
export const MAX_REPORT_DAYS = 92

/** Days pre-filled when the user first picks a custom range. */
export const REPORT_CUSTOM_DEFAULT_DAYS = 7

/** Friendly labels for the period picker. */
export const REPORT_PERIOD_LABEL = Object.freeze({
  week: 'This week',
  last_week: 'Last week',
  month: 'This month',
  last_month: 'Last month',
  custom: 'Custom',
})

/** Preset list handed to `TimeRangePicker` on the reports page. */
export const REPORT_RANGES = Object.freeze(
  REPORT_PERIODS.map((key) => ({ key, label: REPORT_PERIOD_LABEL[key] })),
)

/** How many rows the busiest-days and top-categories lists show. */
export const REPORT_LIST_LIMIT = 5
export const REPORT_BUSIEST_LIMIT = 3

/** Hours in a day, used for the hour-of-day chart buckets. */
export const HOURS_IN_DAY = 24

/** Risk series drawn (stacked) on the alerts-per-day chart. */
export const REPORT_RISK_SERIES = Object.freeze([
  { key: 'urgent', label: 'Urgent', varName: '--sev-critical' },
  { key: 'serious', label: 'Serious', varName: '--sev-high' },
  { key: 'moderate', label: 'Moderate', varName: '--sev-medium' },
  { key: 'minor', label: 'Minor', varName: '--sev-low' },
])

/** Category-slice colours for the share donut, cycled in order. */
export const REPORT_CATEGORY_COLORS = Object.freeze([
  '--accent',
  '--sev-critical',
  '--sev-high',
  '--sev-medium',
  '--sev-low',
  '--muted',
])

/** Chart heights, in pixels (Recharts needs an explicit height). */
export const REPORT_DAILY_CHART_HEIGHT = 240
export const REPORT_CATEGORY_CHART_HEIGHT = 240
export const REPORT_HOUR_CHART_HEIGHT = 220

/** Recommendation thresholds: aim to acknowledge within one hour, keep the
 * sensor up 98% of the period, and flag one category owning 40%+ of alerts. */
export const REPORT_MTTA_TARGET_MS = 60 * 60_000
export const REPORT_UPTIME_TARGET_PCT = 98
export const REPORT_CATEGORY_SHARE = 0.4

/** How many recommendations the page must show (3–5, AGENTS.md §7). */
export const REPORT_RECOMMENDATION_MIN = 3
export const REPORT_RECOMMENDATION_MAX = 5
