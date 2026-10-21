/**
 * Dummy sensor resource: the client's ONE sensor, its connection checklist and
 * pair/unpair simulation (AGENTS.md §1 — one sensor per client).
 * @module dummy/sensor.dummy
 */

import { PAIR_CODE_LENGTH } from '../constants/sensor.js'
import { currentUser, delay, makeId, requireOwner } from './helpers.js'
import { getTenant } from './store.js'

/** Sensor fields the client is allowed to see (the full documented shape). */
function sensorView(sensor) {
  return {
    id: sensor.id,
    client_id: sensor.client_id,
    name: sensor.name,
    location: sensor.location,
    version: sensor.version,
    status: sensor.status,
    health: sensor.health,
    last_seen: sensor.last_seen,
    paired_at: sensor.paired_at,
    events_per_min: sensor.events_per_min,
    kafka_lag: sensor.kafka_lag,
    ingest_errors: sensor.ingest_errors,
  }
}

/** One checklist row: pass/warn/fail, a plain detail and a fix tip. */
function check(id, label, status, detail, fix) {
  return { id, label, status, detail, fix }
}

/**
 * The client's sensor.
 * @returns {Promise<object>} The documented sensor shape.
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function getSensor() {
  await delay()
  const tenant = getTenant()
  currentUser()
  return sensorView(tenant.sensor)
}

/**
 * Plain-language connection checklist derived from the sensor's live numbers.
 * Every row carries a short fix tip shown only when the step is not passing.
 * @returns {Promise<{data: object[], meta: {overall: string}}>}
 */
export async function getChecklist() {
  await delay()
  const sensor = getTenant().sensor
  const online = sensor.status === 'online'
  const healthy = sensor.health === 'healthy'
  const rows = [
    check(
      'power',
      'Sensor is powered and reachable',
      online ? 'ok' : 'fail',
      online ? 'The sensor answers our requests' : 'The sensor is not answering',
      'Check that the sensor is plugged in and its network cable or Wi-Fi is connected, then wait a minute.',
    ),
    check(
      'traffic',
      'Your traffic is reaching the sensor',
      online && sensor.events_per_min > 0 ? 'ok' : 'fail',
      online ? `${sensor.events_per_min} events per minute` : 'No events are arriving',
      'Check that the sensor is connected to a port on your main network switch.',
    ),
    check(
      'platform',
      'Data is reaching the platform',
      !online ? 'fail' : sensor.ingest_errors === 0 ? 'ok' : 'warning',
      !online
        ? 'Nothing has arrived yet'
        : sensor.ingest_errors === 0
          ? 'No read errors today'
          : `${sensor.ingest_errors} read errors today`,
      'Restart the sensor. If errors continue, ask for help and mention your sensor id.',
    ),
    check(
      'delays',
      'Alerts arrive without delays',
      sensor.kafka_lag <= 20 ? 'ok' : 'warning',
      sensor.kafka_lag <= 20
        ? `${sensor.kafka_lag} items waiting`
        : `${sensor.kafka_lag} items waiting — alerts may be late`,
      'Wait a few minutes. If delays persist, check your internet upload speed.',
    ),
  ]
  return {
    data: rows,
    meta: { overall: healthy ? 'healthy' : online ? 'degraded' : 'offline' },
  }
}

/**
 * Pair a new sensor (owner only). A client has exactly ONE sensor, so pairing
 * REPLACES the current one: it gets a fresh id, version stamp and counters,
 * while the client's alert history is kept.
 * @param {{code?: string}} [input] Pairing code printed with the new sensor.
 * @returns {Promise<object>} The new sensor.
 * @throws {{status: number, message: string}} 400 bad code, 403 member.
 */
export async function pairSensor(input = {}) {
  await delay(400, 900)
  requireOwner()
  const code = String(input.code ?? '').trim().toUpperCase()
  if (code.length !== PAIR_CODE_LENGTH) {
    throw { status: 400, message: `Pairing codes are ${PAIR_CODE_LENGTH} characters` }
  }
  const sensor = getTenant().sensor
  Object.assign(sensor, {
    id: makeId('sensor'),
    version: 'Suricata 7.0.7 · CICFlowMeter 1.2',
    status: 'online',
    health: 'healthy',
    last_seen: new Date().toISOString(),
    paired_at: new Date().toISOString(),
    events_per_min: 640,
    kafka_lag: 0,
    ingest_errors: 0,
  })
  return sensorView(sensor)
}

/**
 * Simulate unpairing the sensor (owner only). Data stops flowing until it is
 * paired again; history is kept.
 * @returns {Promise<object>} The updated sensor.
 * @throws {{status: number, message: string}} 403 member, 409 already unpaired.
 */
export async function unpairSensor() {
  await delay(400, 900)
  requireOwner()
  const sensor = getTenant().sensor
  if (sensor.status === 'offline') throw { status: 409, message: 'Your sensor is already unpaired' }
  Object.assign(sensor, {
    status: 'offline',
    health: 'offline',
    last_seen: new Date().toISOString(),
    events_per_min: 0,
    kafka_lag: 0,
  })
  return sensorView(sensor)
}
