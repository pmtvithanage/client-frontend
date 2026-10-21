/**
 * CSV export for the alerts list: walks every page of the current filtered
 * view, then triggers a download.
 * @module utils/alertExport
 */

import { listAlerts } from '../api/alerts.js'
import { MAX_LIMIT } from '../constants/alerts.js'
import { deviceIp, otherIp } from './alerts.js'
import { downloadText, toCsv } from './csv.js'
import { severityName } from './plainLanguage.js'

/** Column order of the exported file (as specified for the alerts list). */
const HEADER = ['id', 'time', 'risk', 'category', 'device', 'destination', 'status']

/** Filename used for the download (local date, e.g. `alerts-2026-10-21.csv`). */
function filename() {
  return `alerts-${new Date().toISOString().slice(0, 10)}.csv`
}

/**
 * Export the current filtered view as a CSV download.
 * Fetches every matching alert (paging with the API cursor, `MAX_LIMIT` per
 * request) so the file contains the whole view, not just the loaded rows.
 * @param {object} params `GET /alerts` params (severity, status, q, from, to, …).
 * @returns {Promise<number>} How many alerts were written.
 */
export async function exportAlertsCsv(params) {
  const rows = []
  let cursor = null
  do {
    const page = await listAlerts({ ...params, limit: MAX_LIMIT, cursor: cursor ?? undefined })
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

  downloadText(filename(), toCsv(HEADER, rows))
  return rows.length
}
