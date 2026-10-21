import ChartCard from '../common/ChartCard.jsx'
import DygraphChart from '../charts/DygraphChart.jsx'
import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import {
  TRAFFIC_ALERT_COLORS,
  TRAFFIC_ALERT_LABELS,
  TRAFFIC_NET_COLORS,
  TRAFFIC_NET_LABELS,
  TRAFFIC_SYNC_GROUP,
} from '../../constants/dashboard.js'

/** Loading / error / empty branch of one chart body; otherwise the chart. */
function chartState({ isLoading, isError, error, onRetry, isEmpty, emptyText }, element) {
  if (isLoading) return <LoadingSkeleton rows={4} />
  if (isError) return <ErrorState error={error} onRetry={onRetry} />
  if (isEmpty) return <p className="py-10 text-center text-sm text-muted">{emptyText}</p>
  return element
}

/**
 * The two live-traffic chart cards — "Network activity" (dual axis) and
 * "Alerts per second" (stacked by severity) — each with its own
 * loading/error/empty state, sharing one sync group, zoom state and window.
 * @param {object} props Query + row/annotation data from `TrafficSection`.
 */
export default function TrafficCharts({
  history,
  minutes,
  netRef,
  alertsRef,
  netRows,
  alertRows,
  netAnnotations,
  alertAnnotations,
  netOptions,
  alertOptions,
  onZoomChange,
}) {
  const state = {
    isLoading: history.isLoading,
    isError: history.isError,
    error: history.error,
    onRetry: history.refetch,
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="Network activity"
        subtitle="Flows and bytes per second — bytes use the right-hand axis"
      >
        {chartState(
          { ...state, isEmpty: !netRows.length, emptyText: 'No traffic recorded in this window.' },
          <DygraphChart
            ref={netRef}
            data={netRows}
            labels={TRAFFIC_NET_LABELS}
            colors={TRAFFIC_NET_COLORS}
            options={netOptions}
            annotations={netAnnotations}
            showControls={false}
            onZoomChange={onZoomChange}
            syncGroup={TRAFFIC_SYNC_GROUP}
            ariaLabel={`Flows and bytes per second over the last ${minutes} minutes`}
          />,
        )}
      </ChartCard>
      <ChartCard
        title="Alerts per second"
        subtitle="Stacked by severity — select a ! marker to open that alert"
      >
        {chartState(
          { ...state, isEmpty: !alertRows.length, emptyText: 'No traffic recorded in this window.' },
          <DygraphChart
            ref={alertsRef}
            data={alertRows}
            labels={TRAFFIC_ALERT_LABELS}
            colors={TRAFFIC_ALERT_COLORS}
            options={alertOptions}
            annotations={alertAnnotations}
            showControls={false}
            onZoomChange={onZoomChange}
            syncGroup={TRAFFIC_SYNC_GROUP}
            ariaLabel={`Alerts per second by severity over the last ${minutes} minutes`}
          />,
        )}
      </ChartCard>
    </div>
  )
}
