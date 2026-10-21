/**
 * Dummy alerts resource: filtering, sorting, cursor pagination, status
 * transitions and client notes — all scoped to the signed-in client.
 * @module dummy/alerts.dummy
 */

import { DEFAULT_LIMIT, MAX_LIMIT, NOTE_MAX_LENGTH } from '../constants/alerts.js'
import {
  ALERT_STATUS,
  ALLOWED_STATUS_TRANSITIONS,
  MEMBER_ALLOWED_STATUSES,
} from '../constants/statuses.js'
import { toClientAlert } from './alertView.js'
import { currentUser, delay, makeId, paginate } from './helpers.js'
import { sortItems, toArray } from './query.js'
import { findTenantAlert, getTenant } from './store.js'

/** Fields searched by the `q` parameter. */
function matchesQuery(alert, query) {
  const haystack = [
    alert.id,
    alert.src_ip,
    alert.dst_ip,
    alert.dst_port,
    alert.protocol,
    alert.category,
    alert.signature,
    alert.status,
  ]
  return haystack.some((value) => String(value ?? '').toLowerCase().includes(query))
}

function parseDate(value, field) {
  const time = Date.parse(value)
  if (Number.isNaN(time)) throw { status: 400, message: `Use an ISO date for ${field}` }
  return time
}

function clampLimit(raw) {
  const limit = Number(raw) || DEFAULT_LIMIT
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT)
}

/**
 * List alerts: `severity`, `status`, `category` (repeatable), `q`, `from`, `to`,
 * `sort` (`ts:desc` default), `limit`, `cursor`.
 * @param {object} [params] Query params.
 * @returns {Promise<{data: object[], meta: {total: number, limit: number, next_cursor: string|null, has_more: boolean}}>}
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function listAlerts(params = {}) {
  await delay()
  const tenant = getTenant()
  let items = tenant.alerts

  const severities = toArray(params.severity)
  const statuses = toArray(params.status)
  const categories = toArray(params.category)
  if (severities.length) items = items.filter((a) => severities.includes(a.severity_tier))
  if (statuses.length) items = items.filter((a) => statuses.includes(a.status))
  if (categories.length) items = items.filter((a) => categories.includes(a.category))
  if (params.from) {
    const from = parseDate(params.from, 'from')
    items = items.filter((a) => Date.parse(a.ts) >= from)
  }
  if (params.to) {
    const to = parseDate(params.to, 'to')
    items = items.filter((a) => Date.parse(a.ts) <= to)
  }
  if (params.q) items = items.filter((a) => matchesQuery(a, String(params.q).toLowerCase()))

  const limit = clampLimit(params.limit)
  const page = paginate(sortItems(items, params.sort), { limit, cursor: params.cursor ?? null })
  return {
    data: page.items.map((alert) => toClientAlert(alert)),
    meta: {
      total: page.total,
      limit,
      next_cursor: page.next_cursor,
      has_more: Boolean(page.next_cursor),
    },
  }
}

/**
 * One alert with its notes.
 * @param {string} id Alert id.
 * @returns {Promise<object|null>} Null when the id is unknown or belongs to
 *   another client (ids from other tenants behave like missing ids).
 */
export async function getAlert(id) {
  await delay()
  return toClientAlert(findTenantAlert(id), { detail: true })
}

/**
 * Change an alert's status.
 *
 * Allowed transitions are `new -> acknowledged | expected | resolved`
 * (`constants/statuses.js`); anything else is rejected with 409. Members may
 * only acknowledge (AGENTS.md §5).
 *
 * Marking an alert `expected` may carry an optional `reason`. The reason is
 * recorded as feedback for the SOC team on the store alert
 * (`expected_feedback`) — it is never returned by the client projection and
 * never hides the alert.
 * @param {string} id Alert id.
 * @param {{status: string, reason?: string}} patch New status, plus an optional
 *   reason when the status is `expected`.
 * @returns {Promise<object>} The updated alert (detail shape).
 * @throws {{status: number, message: string}} 400 bad status, 403 member
 *   restriction, 404 missing alert, 409 transition not allowed.
 */
export async function updateAlert(id, patch = {}) {
  await delay()
  const alert = findTenantAlert(id)
  if (!alert) throw { status: 404, message: 'That alert no longer exists' }
  const status = patch.status
  if (!status) throw { status: 400, message: 'Choose a status to save' }
  if (!Object.values(ALERT_STATUS).includes(status)) {
    throw { status: 400, message: 'That status does not exist' }
  }
  const allowed = ALLOWED_STATUS_TRANSITIONS[alert.status] ?? []
  if (!allowed.includes(status)) {
    throw { status: 409, message: 'Only a new alert can be changed' }
  }
  if (!MEMBER_ALLOWED_STATUSES.includes(status) && currentUser().role !== 'owner') {
    throw { status: 403, message: 'Members can only acknowledge alerts' }
  }
  alert.status = status
  alert.updated_at = new Date().toISOString()
  if (status === ALERT_STATUS.EXPECTED && patch.reason) {
    alert.expected_feedback = {
      author: currentUser().email,
      reason: String(patch.reason).trim(),
      sent_at: alert.updated_at,
    }
  }
  return toClientAlert(alert, { detail: true })
}

/**
 * Add a client-authored note to an alert (owner only).
 * @param {string} id Alert id.
 * @param {{body: string}} note Note text, 1–500 characters.
 * @returns {Promise<{alert_id: string, note: object}>}
 * @throws {{status: number, message: string}} 400 empty/too long, 403 member,
 *   404 missing alert.
 */
export async function addNote(id, note = {}) {
  await delay()
  const alert = findTenantAlert(id)
  if (!alert) throw { status: 404, message: 'That alert no longer exists' }
  if (currentUser().role !== 'owner') {
    throw { status: 403, message: 'Only the account owner can add notes' }
  }
  const body = String(note.body ?? '').trim()
  if (!body) throw { status: 400, message: 'Write a note before saving' }
  if (body.length > NOTE_MAX_LENGTH) {
    throw { status: 400, message: `Notes are limited to ${NOTE_MAX_LENGTH} characters` }
  }
  const created = {
    id: makeId('note'),
    body,
    author: currentUser().email,
    created_at: new Date().toISOString(),
  }
  alert.notes.push(created)
  alert.updated_at = created.created_at
  return { alert_id: alert.id, note: created }
}
