/**
 * Period arithmetic and statistics for the dummy reports resource.
 *
 * All timestamps are ISO UTC strings; day buckets use the shared UTC
 * `dayKey()` helper so they line up with the dashboard trends.
 * @module dummy/reportStats
 */

import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns'

import { PORT_SERVICE, UNKNOWN_SERVICE } from '../constants/network.js'
import { HOURS_IN_DAY, MAX_REPORT_DAYS, REPORT_BUSIEST_LIMIT, REPORT_LIST_LIMIT, WEEK_STARTS_ON } from '../constants/reports.js'
import { ALERT_STATUS } from '../constants/statuses.js'
import { securityScore } from '../utils/plainLanguage.js'
import { countBy, dayKey, topEntries } from './query.js'

const MS_PER_DAY = 86_400_000
const WEEK_OPTIONS = { weekStartsOn: WEEK_STARTS_ON }
const TIER_KEY = Object.freeze({ CRITICAL: 'urgent', HIGH: 'serious', MEDIUM: 'moderate', LOW: 'minor' })

function invalidDate(value) {
  return !value || Number.isNaN(new Date(value).getTime())
}

/**
 * Turn a period token into a concrete `{from, to}` window (local time).
 * @param {string} period `week|last_week|month|last_month|custom`.
 * @param {{from?: string, to?: string}} [params] Custom window (ISO strings).
 * @returns {{from: Date, to: Date}}
 * @throws {{status: number, message: string}} 400 for an invalid custom range.
 */
export function resolveReportRange(period, { from, to } = {}) {
  const now = new Date()
  if (period === 'last_week') {
    const lastWeek = subWeeks(now, 1)
    return { from: startOfWeek(lastWeek, WEEK_OPTIONS), to: endOfWeek(lastWeek, WEEK_OPTIONS) }
  }
  if (period === 'month') return { from: startOfMonth(now), to: endOfMonth(now) }
  if (period === 'last_month') {
    const lastMonth = subMonths(now, 1)
    return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
  }
  if (period === 'custom') {
    if (invalidDate(from) || invalidDate(to)) {
      throw { status: 400, message: 'Choose a start and end date for the custom range' }
    }
    const start = startOfDay(new Date(from))
    const end = endOfDay(new Date(to))
    if (start > end) throw { status: 400, message: 'The start date must be before the end date' }
    const days = Math.round((startOfDay(end) - start) / MS_PER_DAY) + 1
    if (days > MAX_REPORT_DAYS) {
      throw { status: 400, message: `Choose a range of ${MAX_REPORT_DAYS} days or less` }
    }
    return { from: start, to: end }
  }
  return { from: startOfWeek(now, WEEK_OPTIONS), to: endOfWeek(now, WEEK_OPTIONS) }
}

/**
 * The equally long window immediately before `range` (used to compare scores).
 * @param {{from: Date, to: Date}} range Current window.
 * @returns {{from: Date, to: Date}}
 */
export function previousRange({ from, to }) {
  const length = to.getTime() - from.getTime() + 1
  return { from: new Date(from.getTime() - length), to: new Date(from.getTime() - 1) }
}

/** One row per day in the window, oldest first, zero-filled. */
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
    day = new Date(day.getTime() + MS_PER_DAY)
  }
  return rows
}

/**
 * Everything the report shows for one window, computed from the client's own
 * alerts (already scoped by the dummy store).
 * @param {object[]} alerts Every alert for the client.
 * @param {{from: Date, to: Date}} range Window to summarise.
 * @returns {object} `summary`, `score`, `days`, `hours`, `top_categories`,
 *   `busiest_days` and `top_ports`.
 */
export function buildPeriodStats(alerts, range) {
  const { from, to } = range
  const inRange = alerts.filter((alert) => {
    const ts = Date.parse(alert.ts)
    return ts >= from.getTime() && ts <= to.getTime()
  })

  const bySeverity = countBy(inRange, (alert) => alert.severity_tier)
  const byStatus = countBy(inRange, (alert) => alert.status)
  const open = inRange.filter((alert) => alert.status !== ALERT_STATUS.RESOLVED)
  const openBySeverity = countBy(open, (alert) => alert.severity_tier)

  const rows = buildDays(from, to)
  const rowIndex = new Map(rows.map((row) => [row.date, row]))
  const hours = Array.from({ length: HOURS_IN_DAY }, (_, hour) => ({ hour, count: 0 }))
  const ackDurations = []

  for (const alert of inRange) {
    const row = rowIndex.get(dayKey(alert.ts))
    if (row) {
      row.total += 1
      row[TIER_KEY[alert.severity_tier]] += 1
      if (alert.status === ALERT_STATUS.RESOLVED) row.resolved += 1
    }
    hours[new Date(alert.ts).getHours()].count += 1
    if (alert.acknowledged_at) {
      const duration = Date.parse(alert.acknowledged_at) - Date.parse(alert.ts)
      if (duration >= 0) ackDurations.push(duration)
    }
  }

  const meanAckMs = ackDurations.length
    ? Math.round(ackDurations.reduce((sum, value) => sum + value, 0) / ackDurations.length)
    : null

  return {
    summary: {
      total_alerts: inRange.length,
      urgent: bySeverity.CRITICAL ?? 0,
      serious: bySeverity.HIGH ?? 0,
      moderate: bySeverity.MEDIUM ?? 0,
      minor: bySeverity.LOW ?? 0,
      open: open.length,
      resolved: byStatus[ALERT_STATUS.RESOLVED] ?? 0,
      expected: byStatus[ALERT_STATUS.EXPECTED] ?? 0,
      mean_ack_ms: meanAckMs,
    },
    score: securityScore({
      urgent: openBySeverity.CRITICAL ?? 0,
      serious: openBySeverity.HIGH ?? 0,
      moderate: openBySeverity.MEDIUM ?? 0,
      minor: openBySeverity.LOW ?? 0,
    }),
    days: rows,
    hours,
    top_categories: topEntries(
      countBy(inRange, (alert) => alert.category),
      REPORT_LIST_LIMIT,
    ).map(({ key, count }) => ({ category: key, count })),
    busiest_days: rows
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total || a.date.localeCompare(b.date))
      .slice(0, REPORT_BUSIEST_LIMIT)
      .map(({ date, total }) => ({ date, total })),
    top_ports: topEntries(
      countBy(inRange, (alert) => String(alert.dst_port)),
      REPORT_LIST_LIMIT,
    ).map(({ key, count }) => ({
      port: Number(key),
      service: PORT_SERVICE[Number(key)] ?? UNKNOWN_SERVICE,
      count,
    })),
  }
}

/**
 * Sensor uptime for a window, as a percentage with one decimal.
 *
 * No uptime history is stored, so this is a deterministic simulation from the
 * sensor's current state (offline / degraded / healthy) and the window start —
 * the same period always yields the same number.
 * @param {object} sensor Sensor record from the tenant store.
 * @param {Date} from Window start.
 * @returns {number} e.g. `99.4`.
 */
export function uptimePercent(sensor, from) {
  const base = sensor.status === 'offline' ? 0.86 : sensor.health === 'healthy' ? 0.992 : 0.972
  const seed = Math.floor(from.getTime() / MS_PER_DAY) + String(sensor.id).length
  const jitter = ((seed * 37) % 7) / 1000
  return Math.round((base - jitter) * 1000) / 10
}
