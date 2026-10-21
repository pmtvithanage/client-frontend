import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import SeverityBadge from '../common/SeverityBadge.jsx'
import WidgetCard from './WidgetCard.jsx'
import { useAlertStream } from '../../hooks/useAlertStream.js'
import { useAlerts } from '../../hooks/useAlerts.js'
import {
  ATTENTION_FLUSH_MS,
  ATTENTION_LIMIT,
  ATTENTION_MIN_SEVERITY,
  ATTENTION_SEVERITY,
  ATTENTION_STATUSES,
} from '../../constants/dashboard.js'
import { categoryExplanation } from '../../utils/plainLanguage.js'

/**
 * "Needs your attention": the newest unresolved Urgent/Serious alerts with a
 * link to each one. The live subscription batches arrivals onto the screen
 * once per second, and batching pauses while the pointer or keyboard focus is
 * inside the list so rows never shift under the user.
 */
export default function AttentionList() {
  const params = useMemo(
    () => ({ severity: ATTENTION_SEVERITY, status: ATTENTION_STATUSES, sort: 'ts:desc', limit: ATTENTION_LIMIT }),
    [],
  )
  const query = useAlerts(params)
  const [live, setLive] = useState([])
  const pendingRef = useRef([])
  const pausedRef = useRef(false)

  useAlertStream({
    minSeverity: ATTENTION_MIN_SEVERITY,
    onAlert: (alert) => {
      if (alert.status !== 'resolved') pendingRef.current.push(alert)
    },
  })

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current || !pendingRef.current.length) return
      const batch = pendingRef.current.splice(0, pendingRef.current.length)
      setLive((previous) => [...batch, ...previous].slice(0, ATTENTION_LIMIT * 4))
    }, ATTENTION_FLUSH_MS)
    return () => clearInterval(id)
  }, [])

  const rows = useMemo(() => {
    const seen = new Set()
    const merged = []
    for (const alert of [...(query.data?.data ?? []), ...live]) {
      if (seen.has(alert.id) || alert.status === 'resolved') continue
      seen.add(alert.id)
      merged.push(alert)
    }
    merged.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts))
    return merged.slice(0, ATTENTION_LIMIT)
  }, [query.data, live])

  const pause = () => {
    pausedRef.current = true
  }
  const resume = (event) => {
    if (event?.relatedTarget && event.currentTarget.contains(event.relatedTarget)) return
    pausedRef.current = false
  }

  return (
    <WidgetCard
      title="Needs your attention"
      subtitle="The newest urgent and serious alerts, waiting for you"
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={query.refetch}
      isEmpty={!query.isLoading && !query.isError && !rows.length}
      emptyTitle="Nothing needs your attention"
      emptyDescription="No urgent or serious alerts are waiting for you right now."
      skeletonRows={ATTENTION_LIMIT}
    >
      <ul
        className="divide-y divide-border"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
      >
        {rows.map((alert) => (
          <li key={alert.id}>
            <Link
              to={`/alerts/${alert.id}`}
              className="group flex items-center gap-3 px-1 py-2.5 hover:bg-surface-2"
            >
              <SeverityBadge tier={alert.severity_tier} showTier={false} className="shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text">{alert.category}</span>
                <span className="block truncate text-xs text-muted">
                  {categoryExplanation(alert.category).what}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted">
                {formatDistanceToNow(new Date(alert.ts), { addSuffix: true })}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted group-hover:text-text" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}
