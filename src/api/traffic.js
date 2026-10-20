// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/traffic.dummy.js'

/**
 * One-second traffic history for the signed-in client.
 * @param {{minutes?: number}} [params] Window length (1–15 minutes).
 * @returns {Promise<{data: object[], meta: object}>} Oldest first.
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function getTrafficHistory(params) {
  // const { data } = await http.get('/traffic/history', { params });
  // return data;
  return dummy.getTrafficHistory(params)
}

/**
 * Subscribe to the live traffic feed (one point per second).
 * @param {(point: object) => void} onPoint Called with each new point.
 * @param {{intervalMs?: number}} [options] Cadence override (default 1000 ms).
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeTraffic(onPoint, options) {
  // const source = new EventSource(`${baseURL}/traffic/stream?token=${token}`);
  // source.onmessage = (event) => onPoint(JSON.parse(event.data));
  // return () => source.close();
  return dummy.subscribeTraffic(onPoint, options)
}
