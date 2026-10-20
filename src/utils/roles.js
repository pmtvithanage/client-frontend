/**
 * Role helpers for the client portal (AGENTS.md §5: owner manages the account,
 * member is read-only plus acknowledging).
 * @module utils/roles
 */

import { ROLES } from '../constants/nav.js'

/**
 * Is this user (or role string) the account owner?
 * @param {string|{role?: string}|null|undefined} user A user object or a role.
 * @returns {boolean}
 */
export function isOwner(user) {
  const role = typeof user === 'string' ? user : user?.role
  return role === ROLES.OWNER
}

/**
 * Is this user a member (not the owner)?
 * @param {string|{role?: string}|null|undefined} user A user object or a role.
 * @returns {boolean}
 */
export function isMember(user) {
  const role = typeof user === 'string' ? user : user?.role
  return role === ROLES.MEMBER
}

/**
 * Human wording for a role, used in menus and headings.
 * @param {string} role `owner` or `member`.
 * @returns {string} `Account owner` or `Team member`.
 */
export function roleLabel(role) {
  return isOwner(role) ? 'Account owner' : 'Team member'
}
