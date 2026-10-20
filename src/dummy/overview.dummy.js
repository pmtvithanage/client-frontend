/**
 * Dummy overview: security score, counts and the 14-day trend for the
 * signed-in client only.
 * @module dummy/overview.dummy
 */

import { ALERT_WINDOW_DAYS } from '../constants/alerts.js'
import { ALERT_STATUS } from '../constants/statuses.js'
import { delay } from './helpers.js'
import { countBy, dayKey } from './query.js'
import { getTenant } from './store.js'
import { securityScore } from '../utils/plainLanguage.js'

/** Severity tier → trend/score key. */
const TIER_KEY = Object.freeze({
  CRITICAL: 'urgent',
  HIGH: 'serious',
  MEDIUM: 'moderate',
  LOW: 'minor',
})

/** Count one bucket per severity key, starting from zero. */
function zeroCounts() {
  return { urgent: 0, serious: 0, moderate: 0, minor: 0 }
}

/** One row per day over the alert window, oldest first. */
function buildTrend(alerts) {
  const rows = new Map()
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  for (let offset = ALERT_WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getTime() - offset * 86_400_000)
    const key = dayKey(date)
    rows.set(key, { date, total: 0, ...zeroCounts() })
  }
  for (const alert of alerts) {
    const row = rows.get(dayKey(alert.ts))
    if (!row) continue
    row.total += 1
    row[TIER_KEY[alert.severity_tier]] += 1
  }
  return [...rows.values()]
}

/**
 * Dashboard overview for the current client.
 * @returns {Promise<object>} `security_score`, `counts`, `trend` and `sensor`.
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function getOverview() {
  await delay()
  const tenant = getTenant()
  const alerts = tenant.alerts
  const bySeverity = countBy(alerts, (alert) => alert.severity_tier)
  const byStatus = countBy(alerts, (alert) => alert.status)

  const open = alerts.filter((alert) => alert.status !== ALERT_STATUS.RESOLVED)
  const openBySeverity = countBy(open, (alert) => alert.severity_tier)
  const openCounts = zeroCounts()
  for (const [tier, key] of Object.entries(TIER_KEY)) openCounts[key] = openBySeverity[tier] ?? 0

  const score = securityScore(openCounts)

  return {
    security_score: {
      score: score.score,
      label: score.label,
      counts: openCounts,
      open_alerts: open.length,
    },
    counts: {
      total_alerts: alerts.length,
      open: open.length,
      new: byStatus[ALERT_STATUS.NEW] ?? 0,
      acknowledged: byStatus[ALERT_STATUS.ACKNOWLEDGED] ?? 0,
      expected: byStatus[ALERT_STATUS.EXPECTED] ?? 0,
      resolved: byStatus[ALERT_STATUS.RESOLVED] ?? 0,
      urgent: bySeverity.CRITICAL ?? 0,
      serious: bySeverity.HIGH ?? 0,
      moderate: bySeverity.MEDIUM ?? 0,
      minor: bySeverity.LOW ?? 0,
      devices: tenant.devices.length,
    },
    trend: buildTrend(alerts),
    sensor: {
      id: tenant.sensor.id,
      name: tenant.sensor.name,
      status: tenant.sensor.status,
      health: tenant.sensor.health,
      last_seen: tenant.sensor.last_seen,
      events_per_min: tenant.sensor.events_per_min,
    },
    window_days: ALERT_WINDOW_DAYS,
    updated_at: new Date().toISOString(),
  }
}
