/**
 * "Traffic over time" section: a live dygraphs chart of flows and bytes for
 * the selected window (1/5/15 minutes), with a live tail, pause/resume and a
 * "Back to live" button after zooming (AGENTS.md §9).
 * @module components/network/NetworkTraffic
 */

import { useMemo, useRef, useState } from 'react'

import ChartControls from '../charts/ChartControls.jsx'
import DygraphChart from '../charts/DygraphChart.jsx'
import WidgetCard from '../dashboard/WidgetCard.jsx'
import { useTrafficHistory, useTrafficStream } from '../../hooks/useTraffic.js'
import {
  DEFAULT_TRAFFIC_WINDOW,
  TRAFFIC_NET_COLORS,
  TRAFFIC_NET_LABELS,
  TRAFFIC_SERIES,
  TRAFFIC_SYNC_GROUP,
  TRAFFIC_WINDOWS,
} from '../../constants/dashboard.js'

const CONTROL_LABEL = 'Flows per second and bytes per second, live'

export default function NetworkTraffic() {
  const [minutes, setMinutes] = useState(DEFAULT_TRAFFIC_WINDOW)
  const [paused, setPaused] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const netRef = useRef(null)

  const history = useTrafficHistory({ minutes })

  useTrafficStream({
    onPoint: (point) => {
      netRef.current?.append([[new Date(point.ts), point.flows_per_sec, point.bytes_per_sec]])
    },
  })

  const rows = useMemo(
    () => (history.data?.data ?? []).map((p) => [new Date(p.ts), p.flows_per_sec, p.bytes_per_sec]),
    [history.data],
  )

  const options = useMemo(
    () => ({
      series: { [TRAFFIC_SERIES.bytes]: { axis: 'y2' } },
      axes: { y2: { gridLineWidth: 0 } },
    }),
    [],
  )

  const togglePause = () => {
    const next = !paused
    setPaused(next)
    if (next) netRef.current?.pause()
    else netRef.current?.resume()
  }

  const backToLive = () => {
    netRef.current?.resetZoom()
    setZoomed(false)
  }

  return (
    <WidgetCard
      title="Traffic over time"
      subtitle="Flows and bytes, second by second, from this client's single sensor."
      action={
        <div className="flex items-center gap-1.5" role="group" aria-label="Time window">
          {TRAFFIC_WINDOWS.map((window) => (
            <button
              key={window}
              type="button"
              aria-pressed={minutes === window}
              onClick={() => setMinutes(window)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                minutes === window
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:bg-surface-2 hover:text-text'
              }`}
            >
              Last {window} min
            </button>
          ))}
        </div>
      }
      isLoading={history.isLoading}
      isError={history.isError}
      error={history.error}
      onRetry={history.refetch}
      isEmpty={!history.isLoading && !history.isError && rows.length === 0}
      emptyTitle="No traffic in this window"
      emptyDescription="The chart fills in as soon as your sensor reports traffic."
      skeletonRows={6}
    >
      <ChartControls
        labels={CONTROL_LABEL}
        paused={paused}
        zoomed={zoomed}
        onPauseToggle={togglePause}
        onResetZoom={backToLive}
      />
      <DygraphChart
        ref={netRef}
        data={rows}
        labels={TRAFFIC_NET_LABELS}
        colors={TRAFFIC_NET_COLORS}
        options={options}
        onZoomChange={setZoomed}
        syncGroup={TRAFFIC_SYNC_GROUP}
        showControls={false}
        ariaLabel="Flows and bytes over the selected window"
      />
      <p className="mt-2 text-xs text-muted">
        Drag across the chart to zoom in; select “Back to live” to return to the newest data.
      </p>
    </WidgetCard>
  )
}
