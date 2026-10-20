/**
 * Dummy support centre: the client's own requests and replies.
 *
 * Requests are seeded once per client, then every mutation (create, reply,
 * status change) persists in memory until reload. Only the owner may write —
 * members never reach these functions because the UI hides the controls.
 * @module dummy/support.dummy
 */

import {
  CLIENT_AUTHOR,
  MESSAGE_MIN_LENGTH,
  REPLY_MIN_LENGTH,
  REQUEST_STATUS,
  SEED_REQUEST_COUNT,
  SUBJECT_MIN_LENGTH,
  SUPPORT_CATEGORIES,
  TEAM_AUTHOR,
} from '../constants/support.js'
import { delay, makeId, requireOwner } from './helpers.js'
import { getTenant } from './store.js'

/** Client-facing projection of a request. */
function requestView(request) {
  return { ...request, replies: request.replies.map((reply) => ({ ...reply })) }
}

/** Seed two sample requests the first time a client reads the list. */
function ensureSeeded(tenant) {
  if (tenant.seededRequests) return
  tenant.seededRequests = true
  const now = Date.now()
  tenant.requests = [
    {
      id: makeId('req'),
      subject: 'How do I read the security score?',
      message: 'Could you explain what makes the score go down?',
      category: 'Question',
      status: 'answered',
      created_at: new Date(now - 4 * 86_400_000).toISOString(),
      updated_at: new Date(now - 3 * 86_400_000).toISOString(),
      replies: [
        {
          id: makeId('rep'),
          author: TEAM_AUTHOR,
          body: 'The score drops for every open alert. Urgent alerts cost the most points.',
          ts: new Date(now - 3 * 86_400_000).toISOString(),
        },
      ],
    },
    {
      id: makeId('req'),
      subject: 'Please add a weekly email summary',
      message: 'A short weekly summary would help us share progress with management.',
      category: 'Feedback',
      status: 'open',
      created_at: new Date(now - 30 * 3_600_000).toISOString(),
      updated_at: new Date(now - 30 * 3_600_000).toISOString(),
      replies: [],
    },
  ].slice(0, SEED_REQUEST_COUNT)
}

/**
 * The client's support requests, newest first.
 * @returns {Promise<{data: object[], meta: {total: number}}>}
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function listRequests() {
  await delay()
  const tenant = getTenant()
  ensureSeeded(tenant)
  const data = [...tenant.requests]
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
    .map(requestView)
  return { data, meta: { total: data.length } }
}

/**
 * Open a new support request (owner only).
 * @param {{subject: string, message: string, category: string}} input Form values.
 * @returns {Promise<object>} The created request.
 * @throws {{status: number, message: string}} 403 member, 400 invalid input.
 */
export async function createRequest(input = {}) {
  await delay(400, 900)
  requireOwner()
  const tenant = getTenant()
  ensureSeeded(tenant)
  const subject = String(input.subject ?? '').trim()
  const message = String(input.message ?? '').trim()
  if (subject.length < SUBJECT_MIN_LENGTH) {
    throw { status: 400, message: 'Add a short subject (at least 3 characters)' }
  }
  if (message.length < MESSAGE_MIN_LENGTH) {
    throw { status: 400, message: 'Tell us a little more (at least 10 characters)' }
  }
  if (!SUPPORT_CATEGORIES.includes(input.category)) {
    throw { status: 400, message: 'Choose one of the listed subjects' }
  }
  const now = new Date().toISOString()
  const request = {
    id: makeId('req'),
    subject,
    message,
    category: input.category,
    status: REQUEST_STATUS[0],
    created_at: now,
    updated_at: now,
    replies: [],
  }
  tenant.requests.unshift(request)
  return requestView(request)
}

/**
 * Reply to one of the client's own requests (owner only).
 * @param {string} id Request id.
 * @param {string} body Reply text.
 * @returns {Promise<object>} The updated request.
 * @throws {{status: number, message: string}} 403 member, 404 unknown id, 400 too short.
 */
export async function replyRequest(id, body) {
  await delay(300, 700)
  requireOwner()
  const tenant = getTenant()
  ensureSeeded(tenant)
  const request = tenant.requests.find((entry) => entry.id === id)
  if (!request) throw { status: 404, message: 'That request no longer exists' }
  const text = String(body ?? '').trim()
  if (text.length < REPLY_MIN_LENGTH) {
    throw { status: 400, message: 'Write a slightly longer reply' }
  }
  if (request.status === 'closed') {
    throw { status: 409, message: 'This request is closed — open a new one instead' }
  }
  const now = new Date().toISOString()
  request.replies.push({ id: makeId('rep'), author: CLIENT_AUTHOR, body: text, ts: now })
  request.updated_at = now
  return requestView(request)
}
