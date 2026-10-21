import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useAlerts } from '../../hooks/useAlerts.js'
import { DEFAULT_ALERT_SORT, DETAIL_LIST_LIMIT } from '../../constants/alerts.js'
import { filtersToApiParams, parseAlertFilters } from '../../utils/alertFilters.js'

/**
 * Previous / next navigation across the filtered list the user came from.
 * Re-reads the same filters from the URL (`/alerts?...` search string), loads
 * that filtered set and finds this alert's position — so prev/next walk the
 * exact view the user was browsing.
 * @param {{alertId: string}} props The current alert id.
 */
export default function AlertNav({ alertId }) {
  const location = useLocation()
  const search = useMemo(() => new URLSearchParams(location.search), [location.search])
  const filters = useMemo(() => parseAlertFilters(search), [search])
  // Reference time pinned when the nav first mounts, so the ±range window
  // stays put while stepping through alerts.
  const [anchor] = useState(() => Date.now())
  const params = useMemo(
    () => ({ ...filtersToApiParams(filters, anchor), limit: DETAIL_LIST_LIMIT, sort: filters.sort || DEFAULT_ALERT_SORT }),
    [filters, anchor],
  )
  const query = useAlerts(params)

  const index = (query.data?.data ?? []).findIndex((entry) => entry.id === alertId)
  const items = query.data?.data ?? []
  const previous = index > 0 ? items[index - 1] : null
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null

  return (
    <nav aria-label="Alert navigation" className="flex flex-wrap items-center justify-between gap-2">
      {previous ? (
        <Link
          to={{ pathname: `/alerts/${previous.id}`, search: location.search }}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous alert
        </Link>
      ) : (
        <Link
          to={{ pathname: '/alerts', search: location.search }}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to alerts
        </Link>
      )}
      {next ? (
        <Link
          to={{ pathname: `/alerts/${next.id}`, search: location.search }}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
        >
          Next alert
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="text-xs text-muted">End of this view</span>
      )}
    </nav>
  )
}
