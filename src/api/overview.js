// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/overview.dummy.js'

/**
 * Dashboard overview for the signed-in client.
 * @returns {Promise<object>} `security_score`, `counts`, `trend` and `sensor`.
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function getOverview() {
  // const { data } = await http.get('/overview');
  // return data;
  return dummy.getOverview()
}
