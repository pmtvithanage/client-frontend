/**
 * Friendly unit formatters for the client portal (sizes, durations, dates).
 * @module utils/format
 */

import { format } from 'date-fns'

/** Binary-step units used when formatting byte counts. */
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

/**
 * Human file/traffic size, one decimal above KB (`1.2 MB`).
 * @param {number|null|undefined} bytes Byte count.
 * @returns {string} Friendly size, or `—` when bytes is missing.
 */
export function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return '—'
  let value = Number(bytes)
  let unit = 0
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  const text = unit === 0 ? String(Math.round(value)) : value.toFixed(1)
  return `${text} ${BYTE_UNITS[unit]}`
}

/**
 * Human flow duration: `900 ms`, `42 s`, `1 min 30 s`, `2 h 5 min`.
 * @param {number|null|undefined} ms Duration in milliseconds.
 * @returns {string} Friendly duration, or `—` when ms is missing.
 */
export function formatDuration(ms) {
  if (ms == null || Number.isNaN(Number(ms))) return '—'
  const total = Number(ms)
  if (total < 1000) return `${Math.round(total)} ms`
  const seconds = Math.round(total / 1000)
  if (seconds < 60) return `${seconds} s`
  const minutes = Math.floor(seconds / 60)
  const restSeconds = seconds % 60
  if (minutes < 60) {
    return restSeconds ? `${minutes} min ${restSeconds} s` : `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const restMinutes = minutes % 60
  return restMinutes ? `${hours} h ${restMinutes} min` : `${hours} h`
}

/**
 * Absolute local timestamp for list rows and headers (`14 Mar, 09:31`).
 * @param {string|number|Date} ts Timestamp.
 * @returns {string} Formatted local time.
 */
export function formatWhen(ts) {
  return format(new Date(ts), 'd MMM, HH:mm')
}

/**
 * Absolute local timestamp with the year, for the detail header.
 * @param {string|number|Date} ts Timestamp.
 * @returns {string} Formatted local time.
 */
export function formatWhenFull(ts) {
  return format(new Date(ts), 'd MMM yyyy, HH:mm')
}
