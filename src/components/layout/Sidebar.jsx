import { NavLink } from 'react-router-dom'

import { visibleNavItems } from '../../constants/nav.js'
import { useAuth } from '../../hooks/useAuth.js'

/**
 * Desktop sidebar (hidden below `lg`). Items come from `visibleNavItems`, so a
 * member never sees a destination they cannot use (AGENTS.md §5 — hide, do not
 * disable).
 */
export default function Sidebar() {
  const { role } = useAuth()
  const items = visibleNavItems(role)

  return (
    <nav
      aria-label="Main"
      className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-surface p-3 lg:flex"
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 font-medium text-accent'
                  : 'text-muted hover:bg-surface-2 hover:text-text'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
