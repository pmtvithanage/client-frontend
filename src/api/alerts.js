// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/alerts.dummy.js'

/**
 * List the signed-in client's alerts (filter, sort, cursor pagination).
 * @param {{severity?: string|string[], status?: string|string[], category?: string|string[],
 *   q?: string, from?: string, to?: string, sort?: string, limit?: number, cursor?: string}} [params]
 * @returns {Promise<{data: object[], meta: {total: number, limit: number, next_cursor: string|null, has_more: boolean}}>}
 * @throws {{status: number, message: string}} 401 without a session, 400 bad dates.
 */
export async function listAlerts(params) {
  // const { data } = await http.get('/alerts', { params });
  // return data;
  return dummy.listAlerts(params)
}

/**
 * One alert with its client notes.
 * @param {string} id Alert id.
 * @returns {Promise<object|null>} Null when the id is unknown.
 */
export async function getAlert(id) {
  // const { data } = await http.get(`/alerts/${encodeURIComponent(id)}`);
  // return data;
  return dummy.getAlert(id)
}

/**
 * Change an alert's status (`new -> acknowledged | expected | resolved`).
 * @param {string} id Alert id.
 * @param {string} status New status.
 * @param {{reason?: string}} [options] `reason` is an optional note sent with
 *   `expected` — it becomes feedback for the SOC team and never hides the alert.
 * @returns {Promise<object>} The updated alert.
 * @throws {{status: number, message: string}} 400/403/404/409 as documented in the contract.
 */
export async function updateAlertStatus(id, status, options = {}) {
  // const { data } = await http.patch(`/alerts/${encodeURIComponent(id)}/status`,
  //   options.reason ? { status, reason: options.reason } : { status });
  // return data;
  return dummy.updateAlert(id, { status, reason: options.reason })
}

/**
 * Add a client-authored note to an alert (owner only).
 * @param {string} id Alert id.
 * @param {string} body Note text (1–500 characters).
 * @returns {Promise<{alert_id: string, note: object}>}
 * @throws {{status: number, message: string}} 400/403/404.
 */
export async function addAlertNote(id, body) {
  // const { data } = await http.post(`/alerts/${encodeURIComponent(id)}/notes`, { body });
  // return data;
  return dummy.addNote(id, { body })
}
