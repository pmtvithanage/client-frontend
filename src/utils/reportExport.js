/**
 * CSV export for the reports page: a summary block, then every alert in the
 * report period (paged through the list API, `MAX_LIMIT` per request).
 * @module utils/reportExport
 */

import { listAlerts } from '../api/alerts.js'
import { MAX_LIMIT } from '../constants/alerts.js'
import { REPORT_PERIOD_LABEL } from '../constants/reports.js'
import { deviceIp, otherIp } from './alerts.js'
import { downloadText, toCsv } from './csv.js'
import { formatDuration } from './format.js'
import { severityName } from './plainLanguage.js'

/** Column order of the alert block (same as the alerts-list export). */
const ALERT_HEADER = ['id', 'time', 'risk', 'category', 'device', 'destination', 'status']

/** Summary rows shown above the alert block. */
function summaryRows(report, clientName) {
  const { summary, score, previous, score_change: change } = report
  const changeText = change === 0 ? 'No change' : `${change > 0 ? '+' : ''}${change}`
  return [
    ['Client', clientName],
    ['Period', REPORT_PERIOD_LABEL[report.period] ?? report.period],
    ['From', report.range.from],
    ['To', report.range.to],
    ['Generated', report.generated_at],
    ['Security score', `${score.score} (${score.label})`],
    ['Score change vs previous period', changeText],
    ['Alerts in previous period', previous.total_alerts],
    ['Total alerts', summary.total_alerts],
    ['Urgent', summary.urgent],
    ['Serious', summary.serious],
    ['Moderate', summary.moderate],
    ['Minor', summary.minor],
    ['Open', summary.open],
    ['Resolved', summary.resolved],
    ['Marked expected', summary.expected],
    [
      'Mean time to acknowledge',
      summary.mean_ack_ms == null ? 'No acknowledgements yet' : formatDuration(summary.mean_ack_ms),
    ],
    ['Sensor uptime %', summary.sensor_uptime_pct],
    ['Top categories', report.top_categories.map((row) => `${row.category} (${row.count})`).join('; ')],
    ['Busiest days', report.busiest_days.map((row) => `${row.date} (${row.total})`).join('; ')],
  ]
}

/**
 * Export the report summary plus every alert in its period as a CSV download.
 * @param {object} report Report returned by `getReport()`.
 * @param {string} clientName Client name shown in the header.
 * @returns {Promise<number>} How many alerts were written.
 */
export async function exportReportCsv(report, clientName) {
  const rows = []
  let cursor = null
  do {
    const page = await listAlerts({
      from: report.range.from,
      to: report.range.to,
      sort: 'ts:asc',
      limit: MAX_LIMIT,
      cursor: cursor ?? undefined,
    })
    for (const alert of page.data) {
      rows.push([
        alert.id,
        alert.ts,
        `${severityName(alert.severity_tier)} (${alert.severity_tier})`,
        alert.category,
        deviceIp(alert),
        otherIp(alert),
        alert.status,
      ])
    }
    cursor = page.meta.next_cursor
  } while (cursor)

  const summary = toCsv(['Metric', 'Value'], summaryRows(report, clientName))
  const alerts = toCsv(ALERT_HEADER, rows)
  const date = new Date().toISOString().slice(0, 10)
  downloadText(`report-${report.period}-${date}.csv`, `${summary}\r\n${alerts}`)
  return rows.length
}
