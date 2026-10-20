/**
 * Dummy sensor resource: the client's ONE sensor, its connection checklist and
 * pair/unpair simulation (AGENTS.md §1 — one sensor per client).
 * @module dummy/sensor.dummy
 */

import { currentUser, delay, requireOwner } from './helpers.js'
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

/** One checklist row. */
function check(id, label, status, detail) {
  return { id, label, status, detail }
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
      'Sensor is powered on and reporting in',
      online ? 'ok' : 'fail',
      online ? `Last report ${sensor.last_seen}` : `No report since ${sensor.last_seen}`,
    ),
    check(
      'streaming',
      'Traffic is reaching your dashboard',
      online && sensor.events_per_min > 0 ? 'ok' : 'fail',
      online ? `${sensor.events_per_min} events per minute` : 'Waiting for events',
    ),
    check(
      'lag',
      'Nothing is queueing up behind schedule',
      sensor.kafka_lag <= 20 ? 'ok' : 'warning',
      sensor.kafka_lag <= 20 ? `${sensor.kafka_lag} items waiting` : `${sensor.kafka_lag} items waiting — this may delay alerts`,
    ),
    check(
      'errors',
      'Events are being read without errors',
      sensor.ingest_errors === 0 ? 'ok' : 'warning',
      sensor.ingest_errors === 0 ? 'No read errors' : `${sensor.ingest_errors} read errors today`,
    ),
    check(
      'health',
      'Sensor reports a healthy connection',
      healthy ? 'ok' : online ? 'warning' : 'fail',
      healthy ? 'All checks passed' : `Sensor state: ${sensor.health}`,
    ),
  ]
  return {
    data: rows,
    meta: { overall: healthy ? 'healthy' : online ? 'degraded' : 'offline' },
  }
}

/**
 * Simulate re-pairing the sensor (owner only).
 * @returns {Promise<object>} The updated sensor.
 * @throws {{status: number, message: string}} 403 member, 409 already paired.
 */
export async function pairSensor() {
  await delay(400, 900)
  requireOwner()
  const sensor = getTenant().sensor
  if (sensor.status === 'online') throw { status: 409, message: 'Your sensor is already paired' }
  Object.assign(sensor, {
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
