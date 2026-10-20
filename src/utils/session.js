/**
 * Client session helpers.
 *
 * The portal has no password check while the real auth API is commented out in
 * `src/api/auth.js`; this module creates the same fake JWT the real backend
 * will issue, so the token payload carries the client id and the role exactly as
 * production will (AGENTS.md §3 — the id never travels in a URL).
 * @module utils/session
 */

import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../constants/storage.js'
import { ROLES } from '../constants/nav.js'

/** Seconds a session is considered valid for. */
const EXPIRES_IN_SECONDS = 3600

/** Safe base64url encoding of a JSON payload. */
function encodePart(value) {
  const json = JSON.stringify(value)
  try {
    return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch {
    return ''
  }
}

/** Decode a base64url fragment back to an object, or null when unusable. */
function decodePart(part) {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

/**
 * Build a fake JWT. The payload holds `client_id` and `role`.
 * @param {{client_id: string, sub: string, role: string}} payload Claims.
 * @returns {string} `header.payload.signature`
 */
export function createFakeJwt(payload) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const header = encodePart({ alg: 'HS256', typ: 'JWT' })
  const body = encodePart({ ...payload, iat: issuedAt, exp: issuedAt + EXPIRES_IN_SECONDS })
  return `${header}.${body}.dummy-signature`
}

/**
 * Decode a token to its claims without validating the signature.
 * @param {string|null|undefined} token Stored token.
 * @returns {{sub:string, client_id:string, role:string, exp?:number}|null}
 */
export function decodeToken(token) {
  if (!token) return null
  try {
    const claims = decodePart(token.split('.')[1])
    if (!claims?.client_id) return null
    if (claims.exp && claims.exp * 1000 < Date.now()) return null
    return claims
  } catch {
    return null
  }
}

/**
 * Store the session returned by a (future) real login.
 * @param {{token: string, user: {name: string, email: string, role: string}}} session
 * @returns {void}
 */
export function saveSession({ token, user }) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  } catch {
    // localStorage unavailable; the in-memory token still works for this page.
  }
}

/**
 * Read the current session from localStorage.
 * @returns {{token:string, user:{name:string, email:string, role:string}, client_id:string}|null}
 */
export function readSession() {
  let token = null
  let user = null
  try {
    token = localStorage.getItem(AUTH_TOKEN_KEY)
    const raw = localStorage.getItem(AUTH_USER_KEY)
    user = raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
  const claims = decodeToken(token)
  if (!claims || !user) return null
  return { token, user, client_id: claims.client_id }
}

/**
 * Drop the session (used by Sign out).
 * @returns {void}
 */
export function clearSession() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  } catch {
    // Ignore: nothing persisted anyway.
  }
}

/**
 * Create a demo session for a role so the placeholder routes can be reached.
 * @param {{role: string, name: string, email: string, client_id: string}} profile
 * @returns {{token: string, user: {name: string, email: string, role: string}}}
 * @throws {Error} When the role is not an allowed client role.
 */
export function createDemoSession({ role, name, email, client_id }) {
  if (role !== ROLES.OWNER && role !== ROLES.MEMBER) {
    throw new Error('Unsupported role')
  }
  const user = { name, email, role }
  const token = createFakeJwt({ sub: email, client_id, role })
  saveSession({ token, user })
  return { token, user }
}
