/**
 * Navigation items for the client portal.
 *
 * `label` is shown in the desktop sidebar; `shortLabel` is shown in the phone
 * bottom tab bar (where the sidebar would not fit). `roles` limits a
 * destination to the roles allowed to see it — items with no `roles` list are
 * visible to both owner and member. Controls a role may not use are hidden,
 * never disabled (AGENTS.md §5).
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

/** @type {ReadonlyArray<{to: string, label: string, shortLabel: string, icon: Function, end?: boolean, roles?: string[]}>} */
export const NAV_ITEMS = Object.freeze([
  { to: '/', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/alerts', label: 'Alerts', shortLabel: 'Alerts', icon: ShieldAlert },
  { to: '/network', label: 'Network activity', shortLabel: 'Network', icon: Network },
  { to: '/sensor', label: 'My sensor', shortLabel: 'Sensor', icon: Router },
  { to: '/reports', label: 'Reports', shortLabel: 'Reports', icon: FileText },
  { to: '/notifications', label: 'Notifications', shortLabel: 'Notifs', icon: Bell },
  { to: '/support', label: 'Support', shortLabel: 'Support', icon: LifeBuoy, roles: [ROLES.OWNER] },
  { to: '/account', label: 'Account', shortLabel: 'Account', icon: UserRound },
])

/**
 * Filter the navigation down to what `role` is allowed to see.
 * @param {string} role Signed-in role (`owner` or `member`).
 * @returns {ReadonlyArray<{to: string, label: string, shortLabel: string, icon: Function, end?: boolean}>}
 */
export function visibleNavItems(role) {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))
}
