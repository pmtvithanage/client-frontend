import { LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTheme } from '../../hooks/useTheme.js'
import { clearSession } from '../../utils/session.js'

/**
 * Sticky header: sidebar toggle (small screens), current page title, theme
 * toggle and Sign out.
 * @param {{clientName: string, role: string, onToggleSidebar: () => void}} props
 */
export default function Topbar({ clientName, role, onToggleSidebar }) {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const title = location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]

  function handleSignOut() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-surface px-4 py-3 sm:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-md p-2 text-muted hover:bg-surface-2 focus-visible:outline-2 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">{title}</p>
        <p className="truncate text-xs text-muted">
          {clientName} · {role === 'owner' ? 'Owner' : 'Member'}
        </p>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-md p-2 text-muted hover:bg-surface-2"
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
      </button>

      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </header>
  )
}
