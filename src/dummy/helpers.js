/**
 * Shared helpers for the dummy data layer: latency, seeded randomness,
 * ids, cursor pagination and the session lookup every dummy function uses to
 * decide WHICH client's data it is allowed to return.
 *
 * Dummy functions never call a network; they only reshape this module's output
 * so the UI behaves exactly as it will against the real API.
 * @module dummy/helpers
 */

import { AUTH_TOKEN_KEY } from '../constants/storage.js'
import { decodeToken } from '../utils/session.js'

/**
 * The rejection used everywhere a session is missing, expired or unusable
 * (AGENTS.md §3).
 * @returns {{status: number, message: string}}
 */
export function notSignedIn() {
  return { status: 401, message: 'Not signed in' }
}

/** Read the stored token, or null when storage is unavailable. */
function readToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

/**
 * Client id of the signed-in session, read from the fake JWT.
 *
 * The UI never sends this id anywhere: the backend (and the dummy layer)
 * derive it from the token on every call.
 * @returns {string} The `client_id` claim.
 * @throws {{status: number, message: string}} `{ status: 401, message: 'Not signed in' }`
 *   when there is no token, the token is expired/tampered with, or it has no
 *   `client_id`.
 */
export function currentClient() {
  const claims = decodeToken(readToken())
  if (!claims?.client_id) throw notSignedIn()
  return claims.client_id
}

/**
 * Signed-in user, read from the fake JWT.
 * @returns {{email: string, name?: string, role: string}}
 * @throws {{status: number, message: string}} `{ status: 401, message: 'Not signed in' }`
 */
export function currentUser() {
  const claims = decodeToken(readToken())
  const email = claims?.sub ?? claims?.email
  if (!claims?.client_id || !email) throw notSignedIn()
  return { email, name: claims.name, role: claims.role }
}

/**
 * Throw unless the signed-in user is an owner (AGENTS.md §5).
 * @throws {{status: number, message: string}} `{ status: 403, message: 'Only the account owner can do that' }`
 */
export function requireOwner() {
  if (currentUser().role !== 'owner') {
    throw { status: 403, message: 'Only the account owner can do that' }
  }
}

/**
 * Resolve after a simulated network delay (200–600 ms by default).
 * @param {number} [minMs=200] Minimum delay in milliseconds.
 * @param {number} [maxMs=600] Maximum delay in milliseconds.
 * @returns {Promise<void>}
 */
export function delay(minMs = 200, maxMs = 600) {
  const span = Math.max(0, maxMs - minMs)
  const ms = minMs + Math.floor(Math.random() * (span + 1))
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Random integer in the inclusive range [min, max].
 * @param {number} min Lower bound (inclusive).
 * @param {number} max Upper bound (inclusive).
 * @returns {number}
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Pick a random element from an array.
 * @template T
 * @param {T[]} list Source array.
 * @returns {T}
 */
export function pick(list) {
  return list[randomInt(0, list.length - 1)]
}

/**
 * Create a deterministic pseudo-random generator (mulberry32).
 * @param {number} [seed=1] Seed value.
 * @returns {() => number} Function returning a float in [0, 1).
 */
export function seededRandom(seed = 1) {
  let state = seed >>> 0
  return function next() {
    state = (state + 0x6d2b79f5) | 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Random integer from a generator in [min, max].
 * @param {() => number} rng Generator returning floats in [0, 1).
 * @param {number} min Lower bound (inclusive).
 * @param {number} max Upper bound (inclusive).
 * @returns {number}
 */
export function rngInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min
}

/**
 * Random float from a generator in [min, max) rounded to `digits` places.
 * @param {() => number} rng Generator returning floats in [0, 1).
 * @param {number} min Lower bound.
 * @param {number} max Upper bound.
 * @param {number} [digits=4] Decimal places.
 * @returns {number}
 */
export function rngFloat(rng, min, max, digits = 4) {
  const factor = 10 ** digits
  return Math.round((min + rng() * (max - min)) * factor) / factor
}

/**
 * Create a short unique-ish identifier.
 * @param {string} [prefix='id'] Prefix for the generated id.
 * @returns {string}
 */
export function makeId(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${Date.now().toString(36)}${rand}`
}

/**
 * Slice a list using cursor/limit pagination, matching the real API shape.
 * @template T
 * @param {T[]} list Full list to paginate.
 * @param {{ limit?: number, cursor?: string|null }} [options] Pagination params.
 * @returns {{ items: T[], next_cursor: string|null, total: number }}
 */
export function paginate(list, { limit = 25, cursor = null } = {}) {
  const start = cursor ? Number(cursor) || 0 : 0
  const items = list.slice(start, start + limit)
  const nextIndex = start + items.length
  const next_cursor = nextIndex < list.length ? String(nextIndex) : null
  return { items, next_cursor, total: list.length }
}
