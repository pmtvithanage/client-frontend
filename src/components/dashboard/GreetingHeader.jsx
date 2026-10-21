import { RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

import { useAuth, useMe } from '../../hooks/useAuth.js'

/**
 * Dashboard greeting: "Welcome back, <name>", the signed-in client and when
 * the page data was last refreshed, plus the Refresh button.
 * @param {{refreshedAt?: number, refreshing?: boolean,
 *   onRefresh: () => void}} props `refreshedAt` is TanStack Query's
 *   `dataUpdatedAt` (ms).
 */
export default function GreetingHeader({ refreshedAt, refreshing = false, onRefresh }) {
  const { user: sessionUser } = useAuth()
  const { data: me } = useMe()
  const name = me?.user?.name ?? sessionUser?.name ?? me?.user?.email ?? 'there'
  const clientName = me?.client?.name
  const refreshedLabel = refreshedAt ? format(new Date(refreshedAt), 'HH:mm') : '—'

  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-text">Welcome back, {name}</h1>
        <p className="mt-1 text-sm text-muted">
          {clientName ? `${clientName} · ` : ''}Last updated {refreshedLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        aria-busy={refreshing}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2 disabled:opacity-60"
        disabled={refreshing}
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
        Refresh
      </button>
    </header>
  )
}
