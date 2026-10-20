/**
 * Client-facing alert projection — the ONLY alert shape that may leave the
 * dummy layer (AGENTS.md §3: no internal fields, ever).
 *
 * The projection is an explicit allow-list, so a field added to the store for
 * internal use (such as `likely_benign` or `client_id`) cannot leak by accident.
 * @module dummy/alertView
 */

/**
 * Project a raw store alert for the current client.
 * @param {object} alert Raw store alert.
 * @param {{detail?: boolean}} [options] `detail: true` also returns `notes`.
 * @returns {object|null} A copy with only client-safe fields.
 */
export function toClientAlert(alert, { detail = false } = {}) {
  if (!alert) return null
  const view = {
    id: alert.id,
    ts: alert.ts,
    updated_at: alert.updated_at,
    severity_tier: alert.severity_tier,
    status: alert.status,
    src_ip: alert.src_ip,
    dst_ip: alert.dst_ip,
    dst_port: alert.dst_port,
    protocol: alert.protocol,
    direction: alert.direction,
    category: alert.category,
    signature: alert.signature,
  }
  if (detail) view.notes = alert.notes ?? []
  return view
}
