// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/sensor.dummy.js'

/**
 * The client's ONE sensor (AGENTS.md §1).
 * @returns {Promise<object>} The documented sensor shape.
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function getSensor() {
  // const { data } = await http.get('/sensor');
  // return data;
  return dummy.getSensor()
}

/**
 * Plain-language connection checklist for the sensor.
 * @returns {Promise<{data: object[], meta: {overall: string}}>}
 */
export async function getChecklist() {
  // const { data } = await http.get('/sensor/checklist');
  // return data;
  return dummy.getChecklist()
}

/**
 * Pair a new sensor (owner only). A client has exactly ONE sensor, so this
 * REPLACES the current one and keeps the alert history.
 * @param {string} code Pairing code printed with the new sensor (8 characters).
 * @returns {Promise<object>} The new sensor.
 * @throws {{status: number, message: string}} 400 bad code, 403 member.
 */
export async function pairSensor(code) {
  // const { data } = await http.post('/sensor/pair', { code });
  // return data;
  return dummy.pairSensor({ code })
}

/**
 * Simulate unpairing the sensor (owner only). History is kept.
 * @returns {Promise<object>} The updated sensor.
 * @throws {{status: number, message: string}} 403 member, 409 already unpaired.
 */
export async function unpairSensor() {
  // const { data } = await http.post('/sensor/unpair');
  // return data;
  return dummy.unpairSensor()
}
