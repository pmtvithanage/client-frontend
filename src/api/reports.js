import * as dummy from '../dummy/reports.dummy.js'

/**
 * Plain-language period report ("This week" or "This month").
 * @param {{period?: 'week'|'month'}} [params] Report period (default `week`).
 * @returns {Promise<object>} `range`, `summary`, `days`, `top_categories`,
 *   `top_ports` and `score`.
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function getReport(params) {
  // const { data } = await http.get('/reports', { params });
  // return data;
  return dummy.getReport(params)
}
