import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'
import { useAlerts } from '../../hooks/useAlerts.js'
import { DETAIL_LIST_LIMIT, RELATED_HOURS, RELATED_LIMIT } from '../../constants/alerts.js'
import { deviceIp, otherIp } from '../../utils/alerts.js'
import { formatWhen } from '../../utils/format.js'

const HOUR_MS = 3_600_000

/**
 * "Related alerts": other alerts involving the same device or the same
 * destination within ±24 hours, newest first (capped at RELATED_LIMIT).
 * Uses the ±24h window around this alert's time so a shared link cannot be
 * used to browse the whole history.
 * @param {{alert: object}} props The client-safe alert.
 */
export default function RelatedAlerts({ alert }) {
  const location = useLocation()
  const params = useMemo(
    () => ({
      from: new Date(Date.parse(alert.ts) - RELATED_HOURS * HOUR_MS).toISOString(),
      to: new Date(Date.parse(alert.ts) + RELATED_HOURS * HOUR_MS).toISOString(),
      sort: 'ts:desc',
      limit: DETAIL_LIST_LIMIT,
    }),
    [alert.ts],
  )
  const query = useAlerts(params)

  const related = useMemo(() => {
    const device = deviceIp(alert)
    const destination = otherIp(alert)
    return (query.data?.data ?? [])
      .filter((entry) => {
        if (entry.id === alert.id) return false
        const ips = [entry.src_ip, entry.dst_ip]
        return ips.includes(device) || ips.includes(destination)
      })
      .slice(0, RELATED_LIMIT)
  }, [query.data, alert])

  if (query.isLoading) return <LoadingSkeleton rows={2} />
  if (!related.length) return null

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-2 text-sm font-semibold text-text">Related alerts</h2>
      <p className="mb-2 text-xs text-muted">
        The same device or destination, within {RELATED_HOURS} hours of this alert.
      </p>
      <ul className="divide-y divide-border">
        {related.map((entry) => (
          <li key={entry.id}>
            <Link
              to={{ pathname: `/alerts/${entry.id}`, search: location.search }}
              className="flex items-center gap-3 px-1 py-2 hover:bg-surface-2"
            >
              <SeverityBadge tier={entry.severity_tier} showTier={false} className="shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text">{entry.category}</span>
                <span className="block truncate font-mono text-xs text-muted">
                  {deviceIp(entry)} → {otherIp(entry)}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted">{formatWhen(entry.ts)}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
