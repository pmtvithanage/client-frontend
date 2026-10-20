import { X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { ROLES, visibleNavItems } from '../../constants/nav.js'

/**
 * Primary navigation. Only the destinations the signed-in role may use are
 * rendered (owner-only items are hidden from members).
 * @param {{role: string, open: boolean, onClose: () => void}} props
 */
export default function Sidebar({ role, open, onClose }) {
  const items = visibleNavItems(role)

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      ) : null}

      <aside
        id="portal-sidebar"
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-surface transition-transform',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-sm font-semibold tracking-wide text-text">
            NIDS <span className="text-muted">Client Portal</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted hover:bg-surface-2 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 space-y-1 px-2">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
                  isActive ? 'bg-surface-2 font-medium text-text' : 'text-muted hover:bg-surface-2',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <p className="border-t px-4 py-3 text-xs text-muted">
          {role === ROLES.OWNER ? 'Owner' : 'Member'} · one sensor per client
        </p>
      </aside>
    </>
  )
}
