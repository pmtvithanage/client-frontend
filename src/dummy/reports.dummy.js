/**
 * Dummy report: a plain-language summary for "This week" or "This month".
 *
 * Everything is computed from the signed-in client's own alerts, filtered to
 * the requested period so the same call always matches the dates on screen.
 * @module dummy/reports.dummy
 */

import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from 'date-fns'
import { DEFAULT_REPORT_PERIOD, REPORT_PERIODS, WEEK_STARTS_ON } from '../constants/reports.js'
import { PORT_SERVICE, UNKNOWN_SERVICE } from '../constants/network.js'
import { ALERT_STATUS } from '../constants/statuses.js'
import { delay } from './helpers.js'
import { countBy, dayKey, topEntries } from './query.js'
import { getTenant } from './store.js'
import { securityScore } from '../utils/plainLanguage.js'

/** Resolve the period to a concrete date range in the client's timezone. */
function resolveRange(period) {
  const now = new Date()
  if (period === 'month') {
    return { from: startOfMonth(now), to: endOfMonth(now) }
  }
  return { from: startOfWeek(now, { weekStartsOn: WEEK_STARTS_ON }), to: endOfWeek(now, { weekStartsOn: WEEK_STARTS_ON }) }
}

/** One row per day in the range, oldest first, zero-filled. */
function buildDays(from, to) {
  const rows = []
  let day = startOfDay(from)
  while (day <= to) {
    rows.push({
      date: dayKey(day),
      total: 0,
      urgent: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      resolved: 0,
    })
    day = new Date(day.getTime() + 86_400_000)
  }
  return rows
}

/**
 * Period report for the current client.
 * @param {{period?: 'week'|'month'}} [params] Report period (default `week`).
 * @returns {Promise<object>} `range`, `summary`, `days`, `top_categories`,
 *   `top_ports` and `score`.
 * @throws {{status: number, message: string}} 401 without a session, 400 for an
 *   unknown period.
 */
export async function getReport(params = {}) {
  await delay(300, 700)
  const period = REPORT_PERIODS.includes(params.period) ? params.period : DEFAULT_REPORT_PERIOD
  const tenant = getTenant()
  const { from, to } = resolveRange(period)
  const alerts = tenant.alerts.filter((alert) => {
    const ts = Date.parse(alert.ts)
    return ts >= from.getTime() && ts <= to.getTime()
  })

  const bySeverity = countBy(alerts, (alert) => alert.severity_tier)
  const byStatus = countBy(alerts, (alert) => alert.status)
  const open = alerts.filter((alert) => alert.status !== ALERT_STATUS.RESOLVED)
  const openBySeverity = countBy(open, (alert) => alert.severity_tier)

  const rows = buildDays(from, to)
  const rowIndex = new Map(rows.map((row) => [row.date, row]))
  const tierKey = { CRITICAL: 'urgent', HIGH: 'serious', MEDIUM: 'moderate', LOW: 'minor' }
  for (const alert of alerts) {
    const row = rowIndex.get(dayKey(alert.ts))
    if (!row) continue
    row.total += 1
    row[tierKey[alert.severity_tier]] += 1
    if (alert.status === ALERT_STATUS.RESOLVED) row.resolved += 1
  }

  const ports = countBy(alerts, (alert) => String(alert.dst_port))

  return {
    period,
    generated_at: new Date().toISOString(),
    range: { from: startOfDay(from).toISOString(), to: endOfDay(to).toISOString() },
    summary: {
      total_alerts: alerts.length,
      urgent: bySeverity.CRITICAL ?? 0,
      serious: bySeverity.HIGH ?? 0,
      moderate: bySeverity.MEDIUM ?? 0,
      minor: bySeverity.LOW ?? 0,
      open: open.length,
      resolved: byStatus[ALERT_STATUS.RESOLVED] ?? 0,
    },
    score: securityScore({
      urgent: openBySeverity.CRITICAL ?? 0,
      serious: openBySeverity.HIGH ?? 0,
      moderate: openBySeverity.MEDIUM ?? 0,
      minor: openBySeverity.LOW ?? 0,
    }),
    days: rows,
    top_categories: topEntries(countBy(alerts, (alert) => alert.category), 5).map(
      ({ key, count }) => ({ category: key, count }),
    ),
    top_ports: topEntries(ports, 5).map(({ key, count }) => ({
      port: Number(key),
      service: PORT_SERVICE[Number(key)] ?? UNKNOWN_SERVICE,
      count,
    })),
  }
}
