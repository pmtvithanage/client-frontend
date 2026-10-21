import { Moon, Router, Sun } from 'lucide-react'

import { useMe } from '../../hooks/useAuth.js'
import { useTheme } from '../../hooks/useTheme.js'
import SensorStatus from './SensorStatus.jsx'
import UserMenu from './UserMenu.jsx'

/**
 * Top bar: brand, the signed-in client's name, the sensor status pill, the
 * theme toggle and the account menu. Fixed height, sticky above the content.
 */
export default function Topbar() {
  const { data: me } = useMe()
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface px-3 sm:px-4 print:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15"
        >
          <Router className="h-4 w-4 text-accent" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-text">
            {me?.client?.name ?? 'NIDS Client Portal'}
          </p>
          <p className="hidden text-xs leading-tight text-muted sm:block">NIDS Client Portal</p>
        </div>
        <SensorStatus className="ml-1 hidden md:inline-flex" />
      </div>

      <div className="flex items-center gap-1.5">
        <SensorStatus className="md:hidden" />
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          className="rounded-md border border-border p-1.5 text-muted hover:bg-surface-2 hover:text-text"
        >
          {isDark ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
