// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/support.dummy.js'

/**
 * The client's support requests, newest first.
 * @returns {Promise<{data: object[], meta: {total: number}}>}
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function listRequests() {
  // const { data } = await http.get('/support/requests');
  // return data;
  return dummy.listRequests()
}

/**
 * Open a new support request (owner only).
 * @param {{subject: string, message: string, category: string}} input Form values.
 * @returns {Promise<object>} The created request.
 * @throws {{status: number, message: string}} 403 member, 400 invalid input.
 */
export async function createRequest(input) {
  // const { data } = await http.post('/support/requests', input);
  // return data;
  return dummy.createRequest(input)
}

/**
 * Reply to one of the client's own requests (owner only).
 * @param {string} id Request id.
 * @param {string} body Reply text.
 * @returns {Promise<object>} The updated request.
 * @throws {{status: number, message: string}} 400/404/409.
 */
export async function replyRequest(id, body) {
  // const { data } = await http.post(`/support/requests/${encodeURIComponent(id)}/replies`, { body });
  // return data;
  return dummy.replyRequest(id, body)
}
