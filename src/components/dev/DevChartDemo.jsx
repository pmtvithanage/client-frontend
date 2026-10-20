import { useState } from 'react'

import DygraphChart from '../charts/DygraphChart.jsx'
import ChartCard from '../common/ChartCard.jsx'
import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import { useTrafficHistory } from '../../hooks/useTraffic.js'

const MINUTE_OPTIONS = [5, 10, 15]
const CHART_LABELS = ['Time', 'Bytes per second', 'Alerts per second']

/** Map API points (`{ts, bytes, alerts_per_sec}`) into dygraph rows. */
function toRows(points) {
  return points.map((point) => [new Date(point.ts), point.bytes, point.alerts_per_sec])
}

/**
 * Gallery section proving the shared `<DygraphChart>` wrapper against the real
 * traffic history (`useTrafficHistory` → `api/traffic.js` → dummy feed).
 */
export default function DevChartDemo() {
  const [minutes, setMinutes] = useState(5)
  const { data, isLoading, isError, error, refetch } = useTrafficHistory({ minutes })
  const rows = data?.data ? toRows(data.data) : []

  return (
    <ChartCard
      title="Traffic chart (DygraphChart)"
      subtitle="One row per second for the last minutes, streamed from the traffic history API."
      action={
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          {MINUTE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={minutes === option}
              onClick={() => setMinutes(option)}
              className={`px-2.5 py-1 text-xs font-medium ${
                minutes === option ? 'bg-accent text-accent-fg' : 'bg-surface text-muted hover:text-text'
              }`}
            >
              {option} min
            </button>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <DygraphChart
          data={rows}
          labels={CHART_LABELS}
          height={220}
          ariaLabel={`Bytes and alerts per second over the last ${minutes} minutes`}
        />
      )}
    </ChartCard>
  )
}
