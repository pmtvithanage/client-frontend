/**
 * Shared in-memory store for the client portal's dummy data layer.
 *
 * Holds three tenants (Acme Textiles, Lanka Logistics, Sunrise Hospital), each
 * with EXACTLY ONE sensor, its own users, devices, alerts, notification
 * preferences and support requests (AGENTS.md §1 and §3). Nothing in this module
 * is React-aware: every reader goes through {@link getTenant}, which resolves
 * the client from the signed-in token, so no function can return another
 * client's data.
 * @module dummy/store
 */

import { ALERT_COUNT_PER_CLIENT } from '../constants/alerts.js'
import { CLIENT_SEEDS } from '../constants/clients.js'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../constants/notifications.js'
import { createLiveAlert, generateAlerts } from './alertFactory.js'
import { buildDevices } from './devices.js'
import { currentClient, notSignedIn } from './helpers.js'

/** @type {{clients: object[]}|null} */
let state = null

/** Listeners notified by {@link ingestLiveAlert}: `(alert, clientId) => void`. */
const ingestListeners = new Set()

/** Deep copy of the notification defaults, with the client's own email filled in. */
function defaultNotifications(contactEmail) {
  const copy = JSON.parse(JSON.stringify(DEFAULT_NOTIFICATION_PREFERENCES))
  copy.channels.email.destination = contactEmail
  return copy
}

/** Build the single sensor record for a client seed. */
function buildSensor(seed) {
  const { last_seen_seconds_ago, paired_days_ago, ...sensorSeed } = seed.sensor
  return {
    ...sensorSeed,
    client_id: seed.id,
    last_seen: new Date(Date.now() - last_seen_seconds_ago * 1000).toISOString(),
    paired_at: new Date(Date.now() - paired_days_ago * 86_400_000).toISOString(),
  }
}

/** Build one tenant record (client + its one sensor + its own data). */
function buildTenant(seed) {
  const devices = buildDevices(seed)
  return {
    id: seed.id,
    code: seed.code,
    alertPrefix: seed.alertPrefix,
    rngSeed: seed.rngSeed,
    ip_prefixes: seed.ip_prefixes,
    name: seed.name,
    industry: seed.industry,
    plan: seed.plan,
    timezone: seed.timezone,
    contact_email: seed.contact_email,
    created_at: seed.created_at,
    sensor_id: seed.sensor.id,
    sensor: buildSensor(seed),
    devices,
    users: seed.users.map((user) => ({ ...user, status: 'active', added_at: seed.created_at })),
    alerts: generateAlerts(seed, devices),
    notifications: defaultNotifications(seed.contact_email),
    requests: [],
    nextSeq: ALERT_COUNT_PER_CLIENT,
  }
}

/**
 * Lazily build and return the singleton store.
 * @returns {{clients: object[]}} All tenants (auth reads every client's users).
 */
export function getState() {
  if (!state) {
    state = { clients: CLIENT_SEEDS.map(buildTenant) }
  }
  return state
}

/**
 * The tenant of the signed-in session (client, sensor, users, alerts, ...).
 * @returns {object} The current client record.
 * @throws {{status: number, message: string}} 401 when there is no session or the
 *   token names a client this store does not know.
 */
export function getTenant() {
  const clientId = currentClient()
  const tenant = getState().clients.find((client) => client.id === clientId)
  if (!tenant) throw notSignedIn()
  return tenant
}

/**
 * Find an alert that belongs to the signed-in client.
 * An id from another tenant behaves exactly like an id that does not exist.
 * @param {string} id Alert id.
 * @returns {object|undefined} The raw store alert (never project it yourself).
 */
export function findTenantAlert(id) {
  const tenant = getTenant()
  return tenant.alerts.find((alert) => alert.id === id)
}

/**
 * Create the next live alert for the signed-in client and notify subscribers.
 * @returns {object} The raw store alert.
 */
export function ingestLiveAlert() {
  const tenant = getTenant()
  tenant.nextSeq += 1
  const alert = createLiveAlert(tenant, tenant.nextSeq)
  tenant.alerts.unshift(alert)
  for (const listener of ingestListeners) listener(alert, tenant.id)
  return alert
}

/**
 * Subscribe to live alerts from every tenant (callers filter by client id).
 * @param {(alert: object, clientId: string) => void} listener Called per ingest.
 * @returns {() => void} Unsubscribe function.
 */
export function onAlertIngested(listener) {
  ingestListeners.add(listener)
  return () => ingestListeners.delete(listener)
}

/**
 * Look up a user by email across all tenants (used only by login).
 * @param {string} email User email.
 * @returns {{user: object, tenant: object}|undefined}
 */
export function findUserByEmail(email) {
  for (const tenant of getState().clients) {
    const user = tenant.users.find((entry) => entry.email === email)
    if (user) return { user, tenant }
  }
  return undefined
}
