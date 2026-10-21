/**
 * Recommended actions for the reports page, generated from the report data by
 * fixed, documented rules (plain language, 3–5 items).
 *
 * Rules, checked in order; the first {@link REPORT_RECOMMENDATION_MAX} matches
 * are returned:
 * 1. `urgent` — the period has Urgent alerts: review them first (says how many).
 * 2. `open` — alerts are still open (not resolved): acknowledge or resolve them.
 * 3. `expected` — alerts were marked expected: review those marks monthly.
 * 4. `slow-ack` — mean time to acknowledge is above one hour (with the value).
 * 5. `uptime` — sensor uptime is below 98% for the period.
 * 6. `top-category` — one category owns 40%+ of the period's alerts.
 * 7. `score-drop` — the security score fell compared with the previous period.
 * 8. `score-rise` — the security score improved (positive reinforcement).
 *
 * Fallbacks, appended in order only while fewer than
 * {@link REPORT_RECOMMENDATION_MIN} items exist: keep acknowledging alerts,
 * keep the sensor online, and read the report every week. The result is always
 * between 3 and 5 items.
 * @module utils/recommendations
 */

import {
  REPORT_CATEGORY_SHARE,
  REPORT_MTTA_TARGET_MS,
  REPORT_RECOMMENDATION_MAX,
  REPORT_RECOMMENDATION_MIN,
  REPORT_UPTIME_TARGET_PCT,
} from '../constants/reports.js'
import { formatDuration } from './format.js'
import { severityName } from './plainLanguage.js'

const FALLBACKS = Object.freeze([
  'Acknowledge alerts you have seen so your team knows they are being handled.',
  'Keep your sensor powered and online so no traffic is missed.',
  'Read this report every week so small changes do not become surprises.',
])

/**
 * Plain-language actions for this period.
 * @param {object} report Report returned by `getReport()`.
 * @returns {string[]} Between 3 and 5 suggestions.
 */
export function recommendActions(report) {
  const { summary = {}, score_change: change = 0, top_categories: categories = [] } = report
  const actions = []
  const add = (text) => {
    if (actions.length < REPORT_RECOMMENDATION_MAX) actions.push(text)
  }

  if (summary.urgent > 0) {
    add(
      `Review the ${summary.urgent} ${severityName('CRITICAL')} ${
        summary.urgent === 1 ? 'alert' : 'alerts'
      } first — they are the ones most likely to be an active problem.`,
    )
  }
  if (summary.open > 0) {
    add(
      `${summary.open} ${summary.open === 1 ? 'alert is' : 'alerts are'} still open. Acknowledge or resolve ${
        summary.open === 1 ? 'it' : 'them'
      } so the count reflects what is really left to do.`,
    )
  }
  if (summary.expected > 0) {
    add(
      `${summary.expected} ${summary.expected === 1 ? 'alert was' : 'alerts were'} marked as expected. Review that mark monthly to be sure it is still true.`,
    )
  }
  if (summary.mean_ack_ms != null && summary.mean_ack_ms > REPORT_MTTA_TARGET_MS) {
    add(
      `Alerts waited ${formatDuration(summary.mean_ack_ms)} on average before being acknowledged — try to acknowledge within an hour.`,
    )
  }
  if (summary.sensor_uptime_pct != null && summary.sensor_uptime_pct < REPORT_UPTIME_TARGET_PCT) {
    add(
      `Your sensor was up ${summary.sensor_uptime_pct}% of this period. Check its power and network connection so no traffic is missed.`,
    )
  }
  const top = categories[0]
  if (top && summary.total_alerts > 0 && top.count / summary.total_alerts >= REPORT_CATEGORY_SHARE) {
    add(
      `Most alerts (${top.count}) were "${top.category}". Check that the affected devices only expose the services they need.`,
    )
  }
  if (change < 0) {
    add(
      `Your security score dropped by ${Math.abs(change)} points compared with the previous period — start with the open alerts above.`,
    )
  } else if (change > 0) {
    add(`Your security score improved by ${change} points — keep handling alerts as they arrive.`)
  }

  for (const fallback of FALLBACKS) {
    if (actions.length >= REPORT_RECOMMENDATION_MIN) break
    add(fallback)
  }
  return actions.slice(0, REPORT_RECOMMENDATION_MAX)
}
