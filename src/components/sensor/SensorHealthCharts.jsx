/**
 * Live health mini charts: events per minute and delay over the last 15
 * minutes, streamed with dygraphs and one shared Pause/Resume control
 * (AGENTS.md §9).
 * @module components/sensor/SensorHealthCharts
 */

import { useMemo, useRef, useState } from 'react'

import ChartControls from '../charts/ChartControls.jsx'
import DygraphChart from '../charts/DygraphChart.jsx'
import WidgetCard from '../dashboard/WidgetCard.jsx'
import { useTrafficHistory, useTrafficStream } from '../../hooks/useTraffic.js'
import { SENSOR_CHART_HEIGHT, SENSOR_CHART_MINUTES } from '../../constants/sensor.js'
import { SECONDS_PER_MINUTE } from '../../constants/traffic.js'

const EVENTS_LABELS = Object.freeze(['Time', 'Events per minute'])
const DELAY_LABELS = Object.freeze(['Time', 'Delay (seconds)'])
const EVENTS_COLORS = Object.freeze(['--accent'])
const DELAY_COLORS = Object.freeze(['--sev-medium'])

export default function SensorHealthCharts() {
  const [paused, setPaused] = useState(false)
  const eventsRef = useRef(null)
  const delayRef = useRef(null)

  const history = useTrafficHistory({ minutes: SENSOR_CHART_MINUTES })

  useTrafficStream({
    onPoint: (point) => {
      eventsRef.current?.append([
        [new Date(point.ts), point.flows_per_sec * SECONDS_PER_MINUTE],
      ])
      delayRef.current?.append([[new Date(point.ts), point.sensor_lag]])
    },
  })

  const eventsRows = useMemo(
    () =>
      (history.data?.data ?? []).map((point) => [
        new Date(point.ts),
        point.flows_per_sec * SECONDS_PER_MINUTE,
      ]),
    [history.data],
  )
  const delayRows = useMemo(
    () => (history.data?.data ?? []).map((point) => [new Date(point.ts), point.sensor_lag]),
    [history.data],
  )

  const togglePause = () => {
    const next = !paused
    setPaused(next)
    for (const chart of [eventsRef.current, delayRef.current]) {
      if (next) chart?.pause()
      else chart?.resume()
    }
  }

  return (
    <WidgetCard
      title="Live health"
      subtitle={`Events per minute and delay over the last ${SENSOR_CHART_MINUTES} minutes.`}
      isLoading={history.isLoading}
      isError={history.isError}
      error={history.error}
      onRetry={history.refetch}
      isEmpty={!history.isLoading && !history.isError && eventsRows.length === 0}
      emptyTitle="No health readings yet"
      emptyDescription="Charts appear as soon as your sensor sends data."
      skeletonRows={5}
    >
      <ChartControls
        labels="Events per minute and delay, live"
        paused={paused}
        zoomed={false}
        onPauseToggle={togglePause}
        onResetZoom={() => {}}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-1 text-xs font-medium text-muted">Events per minute</h3>
          <DygraphChart
            ref={eventsRef}
            data={eventsRows}
            labels={EVENTS_LABELS}
            colors={EVENTS_COLORS}
            height={SENSOR_CHART_HEIGHT}
            showControls={false}
            ariaLabel="Events per minute over the last fifteen minutes"
          />
        </div>
        <div>
          <h3 className="mb-1 text-xs font-medium text-muted">Delay</h3>
          <DygraphChart
            ref={delayRef}
            data={delayRows}
            labels={DELAY_LABELS}
            colors={DELAY_COLORS}
            height={SENSOR_CHART_HEIGHT}
            showControls={false}
            ariaLabel="Sensor delay in seconds over the last fifteen minutes"
          />
        </div>
      </div>
    </WidgetCard>
  )
}
