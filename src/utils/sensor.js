/**
 * Sensor helpers: the plain-language health verdict and the support subject
 * built from this client's own sensor id.
 * @module utils/sensor
 */

import {
  DELAY_WARN_ITEMS,
  OFFLINE_AFTER_MS,
  SUPPORT_SUBJECT_FALLBACK,
  SUPPORT_SUBJECT_PREFIX,
} from '../constants/sensor.js'

/**
 * Health verdict from the sensor's own numbers:
 * Offline when it is not online or has not reported within
 * {@link OFFLINE_AFTER_MS}; Degraded when it is reporting but delays/read
 * errors are present; Healthy otherwise.
 * @param {{status: string, last_seen: string, health?: string,
 *   kafka_lag?: number, ingest_errors?: number}|null} sensor Client-safe sensor.
 * @returns {'healthy'|'degraded'|'offline'} Verdict key.
 */
export function healthVerdict(sensor) {
  if (!sensor || sensor.status !== 'online') return 'offline'
  const lastSeen = Date.parse(sensor.last_seen)
  if (Number.isNaN(lastSeen) || Date.now() - lastSeen > OFFLINE_AFTER_MS) return 'offline'
  if (
    sensor.health === 'degraded' ||
    Number(sensor.kafka_lag ?? 0) > DELAY_WARN_ITEMS ||
    Number(sensor.ingest_errors ?? 0) > 0
  ) {
    return 'degraded'
  }
  return 'healthy'
}

/**
 * Support request subject for the "Need help?" link. Uses only the signed-in
 * client's own sensor id (never an id passed in from anywhere else).
 * @param {{id?: string}|null} sensor Client-safe sensor.
 * @returns {string} Subject line, e.g. `Help with sensor sensor_acm_01`.
 */
export function supportSubject(sensor) {
  return sensor?.id ? `${SUPPORT_SUBJECT_PREFIX} ${sensor.id}` : SUPPORT_SUBJECT_FALLBACK
}
