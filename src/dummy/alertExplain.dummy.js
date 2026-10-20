/**
 * Dummy "why this alert" explanation: the three plain-language answers every
 * alert must show (AGENTS.md §4) plus a collapsible technical list.
 *
 * The internal `likely_benign` flag is used ONLY to soften the wording — it is
 * never returned in the response.
 * @module dummy/alertExplain.dummy
 */

import { delay } from './helpers.js'
import { findTenantAlert } from './store.js'
import { categoryExplanation, severityName } from '../utils/plainLanguage.js'

/** Plain-English priority step added per severity, most serious first. */
const SEVERITY_STEP = Object.freeze({
  CRITICAL: 'Handle this one first — it is our most serious label.',
  HIGH: 'Please deal with this today.',
  MEDIUM: 'Review it when you have a quiet moment today.',
  LOW: 'No rush — review it this week.',
})

/** How a direction reads to a non-expert. */
function directionPhrase(direction) {
  if (direction === 'outbound') return 'from inside your network to the internet'
  if (direction === 'inbound') return 'from the internet into your network'
  return 'between two machines inside your network'
}

/** Collapsible technical list (addresses and settings only — no model data). */
function technicalDetails(alert) {
  return [
    { label: 'Alert reference', value: alert.id },
    { label: 'Category', value: alert.category },
    { label: 'Signature', value: alert.signature },
    { label: 'Source address', value: alert.src_ip },
    { label: 'Destination address', value: alert.dst_ip },
    { label: 'Destination port', value: String(alert.dst_port) },
    { label: 'Protocol', value: alert.protocol },
    { label: 'Direction', value: directionPhrase(alert.direction) },
    { label: 'First seen', value: alert.ts },
    { label: 'Last updated', value: alert.updated_at },
  ]
}

/**
 * Plain-language explanation for one alert.
 * @param {string} id Alert id.
 * @returns {Promise<object>} `what_happened`, `why_flagged`, `what_to_do[]`
 *   and `technical_details[]`.
 * @throws {{status: number, message: string}} 401 without a session, 404 when the
 *   alert is unknown or belongs to another client.
 */
export async function getExplain(id) {
  await delay()
  const alert = findTenantAlert(id)
  if (!alert) throw { status: 404, message: 'That alert no longer exists' }

  const { what, why, actions } = categoryExplanation(alert.category)
  const severity = severityName(alert.severity_tier)
  const traffic = `${alert.src_ip} tried to reach ${alert.dst_ip} on port ${alert.dst_port} (${alert.protocol}), ${directionPhrase(alert.direction)}.`

  return {
    id: alert.id,
    ts: alert.ts,
    severity_tier: alert.severity_tier,
    severity_name: severity,
    category: alert.category,
    status: alert.status,
    what_happened: `${what} ${traffic}`,
    why_flagged: alert.likely_benign
      ? `${why} We are not fully certain about this one, so it may be ordinary traffic — please check before you act.`
      : `${why} This is labelled ${severity}.`,
    what_to_do: [SEVERITY_STEP[alert.severity_tier], ...actions],
    technical_details: technicalDetails(alert),
  }
}
