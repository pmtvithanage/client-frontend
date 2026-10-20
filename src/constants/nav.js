/**
 * Sidebar navigation items for the client portal.
 *
 * `roles` limits a destination to the roles allowed to see it; items with no
 * `roles` list are visible to every signed-in client user (owner and member).
 * Controls a role may not use are hidden, never disabled (see AGENTS.md §5).
 * @module constants/nav
 */

import {
  Bell,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Network,
  Router,
  ShieldAlert,
  UserRound,
} from 'lucide-react'

/** Roles that may sign in. */
export const ROLES = Object.freeze({
  OWNER: 'owner',
  MEMBER: 'member',
})

/** @type {ReadonlyArray<{to:string, label:string, icon:Function, end?:boolean, roles?:string[]}>} */
export const NAV_ITEMS = Object.freeze([
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/alerts', label: 'Alerts', icon: ShieldAlert },
  { to: '/network', label: 'Network', icon: Network },
  { to: '/sensor', label: 'Sensor', icon: Router },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: [ROLES.OWNER] },
  { to: '/support', label: 'Support & feedback', icon: LifeBuoy, roles: [ROLES.OWNER] },
  { to: '/account', label: 'Account', icon: UserRound },
])

/**
 * Filter the navigation down to what `role` is allowed to see.
 * @param {string} role Signed-in role (`owner` or `member`).
 * @returns {ReadonlyArray<{to:string, label:string, icon:Function, end?:boolean}>}
 */
export function visibleNavItems(role) {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))
}
