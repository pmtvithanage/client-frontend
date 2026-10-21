// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/network.dummy.js'

/**
 * Top external destinations seen in the client's traffic.
 * @param {{limit?: number}} [params] Row limit (default 10).
 * @returns {Promise<{data: object[], meta: {total: number, limit: number}}>}
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function getDestinations(params) {
  // const { data } = await http.get('/network/destinations', { params });
  // return data;
  return dummy.getDestinations(params)
}

/**
 * Top destination ports seen in the client's alerts.
 * @param {{limit?: number}} [params] Row limit (default 8).
 * @returns {Promise<{data: object[], meta: {total: number, limit: number}}>}
 */
export async function getPorts(params) {
  // const { data } = await http.get('/network/ports', { params });
  // return data;
  return dummy.getPorts(params)
}

/**
 * Share of this client's alerts by protocol (TCP, UDP, ...).
 * @returns {Promise<{data: object[], meta: {total: number}}>}
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function getProtocols() {
  // const { data } = await http.get('/network/protocols');
  // return data;
  return dummy.getProtocols()
}

/**
 * Devices on the client's own network with first/last seen and alert counts.
 * @returns {Promise<{data: object[], meta: {total: number}}>}
 */
export async function getDevices() {
  // const { data } = await http.get('/network/devices');
  // return data;
  return dummy.getDevices()
}
