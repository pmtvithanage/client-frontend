import { NavLink } from 'react-router-dom'

import { visibleNavItems } from '../../constants/nav.js'
import { useAuth } from '../../hooks/useAuth.js'

/**
 * Phone-only bottom tab bar (hidden at `lg` and above, where the sidebar is
 * shown). Shows `shortLabel` so every destination fits; the row scrolls
 * horizontally on narrow screens instead of wrapping.
 */
export default function MobileNav() {
  const { role } = useAuth()
  const items = visibleNavItems(role)

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to} className="shrink-0">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-w-16 flex-col items-center gap-0.5 px-3 py-2 text-[11px] transition-colors ${
                    isActive ? 'font-medium text-accent' : 'text-muted'
                  }`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.shortLabel}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
