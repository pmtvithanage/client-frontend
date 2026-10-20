/**
 * Dummy auth: login, session lookup and logout for the client portal.
 *
 * The fake JWT carries `client_id`, `role` and the user's `sub` — exactly the
 * claims the real token will carry, and the reason every other dummy function
 * can scope data without the UI ever sending a client id (AGENTS.md §3).
 * @module dummy/auth.dummy
 */

import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../constants/storage.js'
import { currentUser, delay, notSignedIn } from './helpers.js'
import { findUserByEmail, getTenant } from './store.js'

/** How long an issued token stays valid, in seconds. */
const EXPIRES_IN_SECONDS = 3600

function base64Url(value) {
  const json = JSON.stringify(value)
  try {
    return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch {
    return ''
  }
}

/** Build the fake JWT (header.payload.signature). */
function fakeJwt(payload) {
  const header = base64Url({ alg: 'HS256', typ: 'JWT' })
  return `${header}.${base64Url(payload)}.dummy-signature`
}

/** The client summary returned alongside a session. */
function clientView(tenant) {
  return {
    id: tenant.id,
    name: tenant.name,
    industry: tenant.industry,
    plan: tenant.plan,
    timezone: tenant.timezone,
    sensor_id: tenant.sensor_id,
  }
}

/**
 * Authenticate a client user (owner or member).
 * @param {string} email User email.
 * @param {string} password Plain password (dummy only).
 * @returns {Promise<{token: string, expires_in: number, user: object, client: object}>}
 * @throws {{status: number, message: string}} 401 when the credentials are wrong.
 */
export async function login(email, password) {
  await delay()
  const found = findUserByEmail(String(email ?? '').trim().toLowerCase())
  if (!found || found.user.password !== password) {
    throw { status: 401, message: 'Email or password is incorrect' }
  }
  const issuedAt = Math.floor(Date.now() / 1000)
  const token = fakeJwt({
    sub: found.user.email,
    name: found.user.name,
    role: found.user.role,
    client_id: found.tenant.id,
    iat: issuedAt,
    exp: issuedAt + EXPIRES_IN_SECONDS,
  })
  return {
    token,
    expires_in: EXPIRES_IN_SECONDS,
    user: { email: found.user.email, name: found.user.name, role: found.user.role },
    client: clientView(found.tenant),
  }
}

/**
 * The signed-in user and their client, read from the stored token.
 * @returns {Promise<{user: object, client: object}>}
 * @throws {{status: number, message: string}} 401 when there is no valid session.
 */
export async function me() {
  await delay()
  const claims = currentUser()
  const tenant = getTenant()
  const user = tenant.users.find((entry) => entry.email === claims.email)
  if (!user) throw notSignedIn()
  return {
    user: { email: user.email, name: user.name, role: user.role, status: user.status },
    client: clientView(tenant),
  }
}

/**
 * Sign out: clears the locally stored session.
 *
 * Deliberately idempotent — signing out twice, or with an expired token, still
 * succeeds so the UI can always return to `/login`.
 * @returns {Promise<{ok: boolean}>}
 */
export async function logout() {
  await delay(100, 250)
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  } catch {
    // Nothing persisted when storage is unavailable.
  }
  return { ok: true }
}
