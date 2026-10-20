/**
 * Dummy team management: the client's people and owner-only invite/role/remove
 * mutations (AGENTS.md §5 — members never reach these functions).
 *
 * A client can hold at most {@link MAX_TEAM_MEMBERS} people and always at least
 * one owner. All state is per tenant and persists until reload.
 * @module dummy/team.dummy
 */

import {
  EMAIL_PATTERN,
  INVITE_STATUS,
  MAX_TEAM_MEMBERS,
  TEAM_ROLES,
} from '../constants/team.js'
import { currentUser, delay, requireOwner } from './helpers.js'
import { getTenant } from './store.js'

/** Client-facing projection (never includes the password). */
function memberView(user) {
  return {
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    added_at: user.added_at,
  }
}

/**
 * Everyone on the client's account. Any signed-in user may read the list;
 * only owners may change it.
 * @returns {Promise<{data: object[], meta: {total: number, role: string, remaining: number}}>}}
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function listMembers() {
  await delay()
  const tenant = getTenant()
  const data = tenant.users.map(memberView)
  return {
    data,
    meta: {
      total: data.length,
      role: currentUser().role,
      remaining: Math.max(0, MAX_TEAM_MEMBERS - data.length),
    },
  }
}

/**
 * Invite a person to the account (owner only).
 * @param {{name: string, email: string, role?: string}} input Invite form values.
 * @returns {Promise<object>} The invited member.
 * @throws {{status: number, message: string}} 403 member, 400 invalid input, 409 duplicate or full.
 */
export async function inviteMember(input = {}) {
  await delay(400, 900)
  requireOwner()
  const tenant = getTenant()
  const name = String(input.name ?? '').trim()
  const email = String(input.email ?? '').trim().toLowerCase()
  const role = input.role ?? 'member'
  if (name.length < 2) throw { status: 400, message: 'Add the person\u2019s name' }
  if (!EMAIL_PATTERN.test(email)) throw { status: 400, message: 'That email address does not look right' }
  if (!TEAM_ROLES.includes(role)) throw { status: 400, message: 'Choose Owner or Member' }
  if (tenant.users.some((user) => user.email === email)) {
    throw { status: 409, message: 'That person is already on this account' }
  }
  if (tenant.users.length >= MAX_TEAM_MEMBERS) {
    throw { status: 409, message: 'This account already has the maximum number of people' }
  }
  const user = {
    email,
    name,
    role,
    password: '',
    status: INVITE_STATUS[1],
    added_at: new Date().toISOString(),
  }
  tenant.users.push(user)
  return memberView(user)
}

/**
 * Change a person's role (owner only).
 * @param {string} email Member email.
 * @param {string} role New role (`owner` or `member`).
 * @returns {Promise<object>} The updated member.
 * @throws {{status: number, message: string}} 403 member, 404 unknown person, 409 would remove the last owner.
 */
export async function updateMember(email, role) {
  await delay(300, 700)
  requireOwner()
  const tenant = getTenant()
  const user = tenant.users.find((entry) => entry.email === email)
  if (!user) throw { status: 404, message: 'That person is not on this account' }
  if (!TEAM_ROLES.includes(role)) throw { status: 400, message: 'Choose Owner or Member' }
  if (user.role === 'owner' && role !== 'owner' && tenant.users.filter((entry) => entry.role === 'owner').length === 1) {
    throw { status: 409, message: 'This account needs at least one owner' }
  }
  user.role = role
  return memberView(user)
}

/**
 * Remove a person from the account (owner only, never yourself).
 * @param {string} email Member email.
 * @returns {Promise<{removed: string}>}
 * @throws {{status: number, message: string}} 403 member, 404 unknown person, 409 self-removal.
 */
export async function removeMember(email) {
  await delay(300, 700)
  requireOwner()
  const tenant = getTenant()
  const index = tenant.users.findIndex((entry) => entry.email === email)
  if (index === -1) throw { status: 404, message: 'That person is not on this account' }
  if (tenant.users[index].email === currentUser().email) {
    throw { status: 409, message: 'You cannot remove your own account' }
  }
  tenant.users.splice(index, 1)
  return { removed: email }
}
