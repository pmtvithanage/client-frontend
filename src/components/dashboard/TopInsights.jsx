import { Link } from 'react-router-dom'
import { Globe } from 'lucide-react'

import WidgetCard from './WidgetCard.jsx'
import { useReport } from '../../hooks/useReports.js'
import { useDestinations } from '../../hooks/useNetwork.js'
import { INSIGHT_LIMIT } from '../../constants/dashboard.js'
import { categoryExplanation } from '../../utils/plainLanguage.js'

/**
 * "What we see most": the week's top alert categories (each with a
 * plain-English one-liner) and the top external destinations. Every row links
 * to the Alerts page pre-filtered, and each card owns its loading/error/empty
 * state.
 */
export default function TopInsights() {
  const report = useReport({ period: 'week' })
  const destinations = useDestinations({ limit: INSIGHT_LIMIT })

  const categories = (report.data?.top_categories ?? []).slice(0, INSIGHT_LIMIT)
  const topDestinations = destinations.data?.data ?? []

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-text">What we see most</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <WidgetCard
          title="Top categories"
          subtitle="Where your alerts came from this week"
          isLoading={report.isLoading}
          isError={report.isError}
          error={report.error}
          onRetry={report.refetch}
          isEmpty={!report.isLoading && !categories.length}
          emptyTitle="No alerts this week"
          emptyDescription="Your busiest categories appear here as soon as alerts arrive."
          skeletonRows={INSIGHT_LIMIT}
        >
          <ul className="space-y-1">
            {categories.map((entry) => (
              <li key={entry.category}>
                <Link
                  to={`/alerts?category=${encodeURIComponent(entry.category)}`}
                  className="flex items-start justify-between gap-3 rounded-lg px-2 py-2 hover:bg-surface-2"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-text">{entry.category}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {categoryExplanation(entry.category).what}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {entry.count} alert{entry.count === 1 ? '' : 's'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard
          title="Top destinations"
          subtitle="External addresses seen in your alerts"
          isLoading={destinations.isLoading}
          isError={destinations.isError}
          error={destinations.error}
          onRetry={destinations.refetch}
          isEmpty={!destinations.isLoading && !topDestinations.length}
          emptyTitle="No destinations yet"
          emptyDescription="The addresses your alerts point to appear here."
          skeletonRows={INSIGHT_LIMIT}
        >
          <ul className="space-y-1">
            {topDestinations.map((destination) => (
              <li key={destination.ip}>
                <Link
                  to={`/alerts?q=${encodeURIComponent(destination.ip)}`}
                  className="block rounded-lg px-2 py-2 hover:bg-surface-2"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <Globe className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                      <span className="truncate font-mono text-sm text-text">{destination.ip}</span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted">
                      {destination.alert_count} alert{destination.alert_count === 1 ? '' : 's'}
                    </span>
                  </span>
                  {destination.top_category ? (
                    <span className="mt-0.5 block pl-6 text-xs text-muted">
                      Mostly {destination.top_category}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </WidgetCard>
      </div>
    </section>
  )
}
