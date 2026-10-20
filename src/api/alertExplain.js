// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/alertExplain.dummy.js'

/**
 * Plain-language explanation of one alert: what happened, why it was flagged
 * and what to do, plus a collapsible technical list.
 * @param {string} id Alert id.
 * @returns {Promise<object>} The explanation object.
 * @throws {{status: number, message: string}} 401 without a session, 404 unknown id.
 */
export async function explainAlert(id) {
  // const { data } = await http.get(`/alerts/${encodeURIComponent(id)}/explain`);
  // return data;
  return dummy.getExplain(id)
}
