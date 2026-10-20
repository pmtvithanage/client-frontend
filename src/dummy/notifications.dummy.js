/**
 * Dummy notifications: the in-app feed (alerts + sensor notices) and the
 * client's notification preferences, both scoped to the signed-in client.
 *
 * Read state lives in memory per tenant, so "mark as read" survives until the
 * page reloads, exactly like the real API will.
 * @module dummy/notifications.dummy
 */

import {
  MIN_SEVERITY_OPTIONS,
  NOTIFICATION_CHANNELS,
  TIME_PATTERN,
} from '../constants/notifications.js'
import { delay, requireOwner } from './helpers.js'
import { getTenant } from './store.js'
import { severityName } from '../utils/plainLanguage.js'

/** Newest alerts turned into feed items (the window clients care about). */
const FEED_ALERT_LIMIT = 40

/** Default page size for the feed. */
const FEED_DEFAULT_LIMIT = 20

/** Client-owned read ids, created lazily on the tenant record. */
function readIds(tenant) {
  if (!tenant.readNotifications) tenant.readNotifications = []
  return tenant.readNotifications
}

/** The sensor-offline notice, when the sensor is not reporting. */
function sensorNotice(sensor) {
  if (sensor.status === 'online') return null
  return {
    id: `notif_sensor_${sensor.id}`,
    kind: 'sensor',
    alert_id: null,
    severity_tier: null,
    title: 'Your sensor is not reporting',
    body: `It last reported on ${sensor.last_seen}. Alerts will resume when it reconnects.`,
    ts: sensor.last_seen,
  }
}

/** Build the full feed for the current client, newest first. */
function buildFeed(tenant) {
  const read = readIds(tenant)
  const items = tenant.alerts.slice(0, FEED_ALERT_LIMIT).map((alert) => ({
    id: `notif_${alert.id}`,
    kind: 'alert',
    alert_id: alert.id,
    severity_tier: alert.severity_tier,
    title: `${severityName(alert.severity_tier)} alert: ${alert.category}`,
    body: `${alert.src_ip} tried to reach ${alert.dst_ip} on port ${alert.dst_port}.`,
    ts: alert.ts,
    read: alert.status !== 'new' || read.includes(`notif_${alert.id}`),
  }))
  const notice = sensorNotice(tenant.sensor)
  if (notice) items.unshift({ ...notice, read: read.includes(notice.id) })
  return items.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts))
}

/**
 * Notification feed for the current client.
 * @param {{unread_only?: boolean, limit?: number}} [params] Filters.
 * @returns {Promise<{data: object[], meta: {total: number, unread: number, limit: number, has_more: boolean}}>}
 */
export async function listNotifications(params = {}) {
  await delay()
  const tenant = getTenant()
  const all = buildFeed(tenant)
  const filtered = params.unread_only ? all.filter((item) => !item.read) : all
  const limit = Math.min(Math.max(Number(params.limit) || FEED_DEFAULT_LIMIT, 1), 50)
  return {
    data: filtered.slice(0, limit),
    meta: {
      total: filtered.length,
      unread: all.filter((item) => !item.read).length,
      limit,
      has_more: filtered.length > limit,
    },
  }
}

/**
 * Mark one feed item as read.
 * @param {string} id Notification id (`notif_<alert id>` or `notif_sensor_...`).
 * @returns {Promise<{updated: number}>}
 * @throws {{status: number, message: string}} 401 without a session, 404 unknown id.
 */
export async function markRead(id) {
  await delay(100, 300)
  const tenant = getTenant()
  const item = buildFeed(tenant).find((entry) => entry.id === id)
  if (!item) throw { status: 404, message: 'That notification no longer exists' }
  const read = readIds(tenant)
  if (!read.includes(id)) read.push(id)
  return { updated: 1 }
}

/**
 * Mark every feed item as read.
 * @returns {Promise<{updated: number}>}
 */
export async function markAllRead() {
  await delay(100, 300)
  const tenant = getTenant()
  const ids = buildFeed(tenant).map((item) => item.id)
  const read = readIds(tenant)
  for (const id of ids) if (!read.includes(id)) read.push(id)
  return { updated: ids.length }
}

/**
 * Notification preferences for the current client.
 * @returns {Promise<object>} Channels, minimum severity and quiet hours.
 */
export async function getPreferences() {
  await delay()
  const tenant = getTenant()
  return JSON.parse(JSON.stringify(tenant.notifications))
}

/**
 * Update notification preferences (owner only, persisted until reload).
 * @param {object} patch Partial preferences to merge.
 * @returns {Promise<object>} The stored preferences.
 * @throws {{status: number, message: string}} 403 member, 400 invalid value.
 */
export async function updatePreferences(patch = {}) {
  await delay(300, 600)
  requireOwner()
  const tenant = getTenant()
  const stored = tenant.notifications
  const next = JSON.parse(JSON.stringify(stored))

  if (patch.channels) {
    for (const name of NOTIFICATION_CHANNELS) {
      const incoming = patch.channels[name]
      if (!incoming) continue
      const channel = next.channels[name]
      if (typeof incoming.enabled === 'boolean') channel.enabled = incoming.enabled
      if (typeof incoming.destination === 'string') channel.destination = incoming.destination
      if (channel.enabled && !channel.destination.trim()) {
        throw { status: 400, message: `Add where we should send ${name.toUpperCase()} alerts first` }
      }
      if (name === 'email' && channel.enabled && !channel.destination.includes('@')) {
        throw { status: 400, message: 'That email address does not look right' }
      }
    }
  }
  if (patch.minimum_severity !== undefined) {
    if (!MIN_SEVERITY_OPTIONS.includes(patch.minimum_severity)) {
      throw { status: 400, message: 'Choose one of the listed severity levels' }
    }
    next.minimum_severity = patch.minimum_severity
  }
  if (patch.quiet_hours) {
    const quiet = next.quiet_hours
    if (typeof patch.quiet_hours.enabled === 'boolean') quiet.enabled = patch.quiet_hours.enabled
    for (const field of ['start', 'end']) {
      const value = patch.quiet_hours[field]
      if (value === undefined) continue
      if (!TIME_PATTERN.test(value)) {
        throw { status: 400, message: 'Times must look like 22:00' }
      }
      quiet[field] = value
    }
  }

  tenant.notifications = next
  return JSON.parse(JSON.stringify(next))
}
