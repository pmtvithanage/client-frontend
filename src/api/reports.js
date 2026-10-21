import * as dummy from '../dummy/reports.dummy.js'

/**
 * Plain-language period report (this/last week, this/last month or custom).
 * @param {{period?: string, from?: string, to?: string}} [params] Report period
 *   (default `week`); `from`/`to` (ISO) are required when `period` is `custom`.
 * @returns {Promise<object>} `range`, `summary`, `score`, `previous`,
 *   `score_change`, `days`, `hours`, `top_categories`, `busiest_days` and
 *   `top_ports`.
 * @throws {{status: number, message: string}} 400 for an invalid custom range,
 *   401 without a session.
 */
export async function getReport(params) {
  // const { data } = await http.get('/reports', { params });
  // return data;
  return dummy.getReport(params)
}
