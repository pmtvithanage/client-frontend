import { Link, useParams, useLocation } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

import AlertNav from '../components/alerts/AlertNav.jsx'
import AlertNotes from '../components/alerts/AlertNotes.jsx'
import AlertStatusActions from '../components/alerts/AlertStatusActions.jsx'
import ExplainCards from '../components/alerts/ExplainCards.jsx'
import RelatedAlerts from '../components/alerts/RelatedAlerts.jsx'
import TechnicalDetails from '../components/alerts/TechnicalDetails.jsx'
import TrafficFacts from '../components/alerts/TrafficFacts.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import SeverityBadge from '../components/common/SeverityBadge.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { useAlert } from '../hooks/useAlerts.js'
import { useAuth } from '../hooks/useAuth.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatWhenFull } from '../utils/format.js'

/**
 * `/alerts/:id` — one alert in full: risk and status header, the three
 * plain-English cards, traffic facts, notes, a collapsible technical section
 * for IT staff, related alerts and prev/next navigation that respects the
 * list filters the user came with.
 */
export default function AlertDetail() {
  const { id } = useParams()
  const location = useLocation()
  const query = useAlert(id)
  const { isOwner } = useAuth()
  useDocumentTitle(query.data ? `${query.data.category} · Alert` : 'Alert')

  const backSearch = location.search
  const alert = query.data

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={3} />
      </div>
    )
  }

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={query.refetch} />
  }

  if (!alert) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="We could not find that alert"
        description="It may have been removed, or the link may belong to another account."
      >
        <Link
          to={{ pathname: '/alerts', search: backSearch }}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to alerts
        </Link>
      </EmptyState>
    )
  }

  return (
    <div className="space-y-4">
      <Link
        to={{ pathname: '/alerts', search: backSearch }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to alerts
      </Link>

      <header className="rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge tier={alert.severity_tier} />
              <StatusBadge status={alert.status} />
            </div>
            <h1 className="mt-2 text-xl font-semibold text-text">{alert.category}</h1>
            <p className="mt-1 text-sm text-muted">
              {formatWhenFull(alert.ts)} · {formatDistanceToNow(new Date(alert.ts), { addSuffix: true })}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted">Reference: {alert.id}</p>
          </div>
          <AlertStatusActions alert={alert} isOwner={isOwner} />
        </div>
      </header>

      <ExplainCards alert={alert} />
      <TrafficFacts alert={alert} />
      <AlertNotes alert={alert} isOwner={isOwner} />
      <TechnicalDetails alert={alert} />
      <RelatedAlerts alert={alert} />
      <AlertNav alertId={alert.id} />
    </div>
  )
}
