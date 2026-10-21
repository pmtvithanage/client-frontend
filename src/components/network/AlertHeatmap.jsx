/**
 * Heatmap of alerts by weekday × hour in the client's timezone (resolved with
 * `Intl`, never the browser's zone). Built from the most recent alert pages,
 * one cell per weekday/hour with the count printed in the cell so the map
 * never relies on colour alone.
 * @module components/network/AlertHeatmap
 */

import { useMemo, useState } from 'react'

import WidgetCard from '../dashboard/WidgetCard.jsx'
import { useMe } from '../../hooks/useAuth.js'
import { useInfiniteAlerts } from '../../hooks/useAlerts.js'
import { ALERT_WINDOW_DAYS } from '../../constants/alerts.js'
import { DAY_MS } from '../../constants/dashboard.js'

const WEEKDAYS = Object.freeze(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
const HOURS = Object.freeze(Array.from({ length: 24 }, (_unused, hour) => hour))
/** Quiet → busy cell styles; every cell also prints its count. */
const HEAT_CLASSES = Object.freeze([
  'bg-surface-2 text-muted',
  'bg-accent/15 text-text',
  'bg-accent/35 text-text',
  'bg-accent/60 text-text',
  'bg-accent/85 text-accent-fg',
])
const DEFAULT_TIMEZONE = 'Asia/Colombo'

/** 0 (empty) … 4 (peak hour) — buckets the count against this window's max. */
function bucketFor(count, max) {
  if (count === 0) return 0
  return Math.min(HEAT_CLASSES.length - 1, Math.ceil((count / max) * (HEAT_CLASSES.length - 1)))
}

export default function AlertHeatmap() {
  const { data: me } = useMe()
  const timezone = me?.client?.timezone || DEFAULT_TIMEZONE
  const [anchor] = useState(() => Date.now())
  const from = useMemo(() => new Date(anchor - ALERT_WINDOW_DAYS * DAY_MS).toISOString(), [anchor])
  const query = useInfiniteAlerts({ from, sort: 'ts:desc', limit: 100 })

  const all = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.data),
    [query.data],
  )

  const { cells, max, total } = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      hour: 'numeric',
      hourCycle: 'h23',
    })
    const grid = Array.from({ length: WEEKDAYS.length }, () => Array(HOURS.length).fill(0))
    let count = 0
    for (const alert of all) {
      const parts = formatter.formatToParts(new Date(alert.ts))
      const weekday = parts.find((part) => part.type === 'weekday')?.value
      const hour = Number(parts.find((part) => part.type === 'hour')?.value)
      const row = WEEKDAYS.indexOf(weekday)
      if (row < 0 || Number.isNaN(hour)) continue
      grid[row][hour] += 1
      count += 1
    }
    return { cells: grid, max: Math.max(1, ...grid.flat()), total: count }
  }, [all, timezone])

  return (
    <WidgetCard
      title="When alerts happen"
      subtitle={`Alerts by weekday and hour in ${timezone} (last ${ALERT_WINDOW_DAYS} days).`}
      action={
        <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
          {total} alerts
        </span>
      }
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={query.refetch}
      isEmpty={!query.isLoading && !query.isError && total === 0}
      emptyTitle="No alerts in this period"
      emptyDescription="The heatmap fills in once your sensor flags activity."
      skeletonRows={7}
    >
      <div className="overflow-x-auto pb-1">
        <table className="w-full min-w-[720px] border-separate border-spacing-1 text-center text-xs">
          <caption className="sr-only">
            {`Alert counts by weekday and hour of day in ${timezone}`}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-10">
                <span className="sr-only">Weekday</span>
              </th>
              {HOURS.map((hour) => (
                <th key={hour} scope="col" className="font-medium text-muted">
                  {String(hour).padStart(2, '0')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS.map((weekday, row) => (
              <tr key={weekday}>
                <th scope="row" className="pr-1 text-left font-medium text-muted">
                  {weekday}
                </th>
                {HOURS.map((hour) => {
                  const count = cells[row][hour]
                  return (
                    <td
                      key={hour}
                      aria-label={`${weekday} ${hour}:00 — ${count} alerts`}
                      title={`${weekday} ${hour}:00 — ${count} alerts`}
                      className={`h-7 min-w-7 rounded ${HEAT_CLASSES[bucketFor(count, max)]}`}
                    >
                      {count === 0 ? '·' : count}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted">
        Quieter
        {HEAT_CLASSES.map((className, index) => (
          <span
            key={className}
            aria-hidden="true"
            className={`inline-block h-3 w-6 rounded ${className}`}
            data-bucket={index}
          />
        ))}
        Busier (busiest hour: {max} alerts)
      </p>
    </WidgetCard>
  )
}
