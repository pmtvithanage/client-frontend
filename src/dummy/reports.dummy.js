/**
 * Dummy report: a plain-language summary for "This week", "Last week",
 * "This month", "Last month" or a custom range.
 *
 * Everything is computed from the signed-in client's own alerts, filtered to
 * the requested period so the same call always matches the dates on screen.
 * @module dummy/reports.dummy
 */

import { endOfDay, startOfDay } from 'date-fns'

import { DEFAULT_REPORT_PERIOD, REPORT_PERIODS } from '../constants/reports.js'
import { delay } from './helpers.js'
import {
  buildPeriodStats,
  previousRange,
  resolveReportRange,
  uptimePercent,
} from './reportStats.js'
import { getTenant } from './store.js'

/**
 * Period report for the current client.
 * @param {{period?: string, from?: string, to?: string}} [params] Report period
 *   (default `week`); `from`/`to` are required when `period` is `custom`.
 * @returns {Promise<object>} `range`, `summary`, `score`, `previous`,
 *   `score_change`, `days`, `hours`, `top_categories`, `busiest_days` and
 *   `top_ports`.
 * @throws {{status: number, message: string}} 401 without a session, 400 for an
 *   invalid custom range.
 */
export async function getReport(params = {}) {
  await delay(300, 700)
  const period = REPORT_PERIODS.includes(params.period) ? params.period : DEFAULT_REPORT_PERIOD
  const tenant = getTenant()
  const range = resolveReportRange(period, params)
  const current = buildPeriodStats(tenant.alerts, range)
  const previous = buildPeriodStats(tenant.alerts, previousRange(range))

  return {
    period,
    generated_at: new Date().toISOString(),
    range: {
      from: startOfDay(range.from).toISOString(),
      to: endOfDay(range.to).toISOString(),
    },
    summary: {
      ...current.summary,
      sensor_uptime_pct: uptimePercent(tenant.sensor, range.from),
    },
    score: current.score,
    previous: { score: previous.score.score, total_alerts: previous.summary.total_alerts },
    score_change: current.score.score - previous.score.score,
    days: current.days,
    hours: current.hours,
    top_categories: current.top_categories,
    busiest_days: current.busiest_days,
    top_ports: current.top_ports,
  }
}
