import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import WidgetCard from './WidgetCard.jsx'
import { useOverview } from '../../hooks/useOverview.js'
import { DYGRAPH_AXIS_LABEL_FONT_SIZE } from '../../constants/charts.js'
import {
  TREND_HEIGHT,
  TREND_MARGIN,
  TREND_SERIES,
  TREND_SERIES_VARS,
} from '../../constants/dashboard.js'
import { useDygraphTheme } from '../charts/useDygraphTheme.js'
import { resolveCssVar } from '../../utils/dygraph.js'
import { dayKey, dayLabel, dayRange } from '../../utils/dashboard.js'

/**
 * "Alerts over the last 14 days": a stacked bar chart from the overview trend
 * (Minor at the bottom → Urgent on top), coloured from CSS variables and
 * re-resolved on theme change. Selecting a bar — or its keyboard-accessible
 * day link — opens the Alerts page filtered to that day.
 */
export default function Alerts14DayChart() {
  const overview = useOverview()
  const navigate = useNavigate()
  const theme = useDygraphTheme(TREND_SERIES_VARS)

  const fills = useMemo(
    () => Object.fromEntries(TREND_SERIES.map((entry, index) => [entry.key, theme.series[index]])),
    [theme],
  )
  // Re-resolved on every render — the theme hook re-renders us when it changes.
  const cursorFill = resolveCssVar('--surface-2')
  const textColor = resolveCssVar('--text')
  const mutedColor = theme.label

  const data = useMemo(
    () =>
      (overview.data?.trend ?? []).map((row) => ({
        key: dayKey(row.date),
        label: dayLabel(dayKey(row.date)),
        urgent: row.urgent,
        serious: row.serious,
        moderate: row.moderate,
        minor: row.minor,
      })),
    [overview.data],
  )

  const openDay = (entry) => {
    const key = entry?.payload?.key ?? entry?.key
    if (typeof key !== 'string') return
    const { from, to } = dayRange(key)
    navigate(`/alerts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
  }

  const dayLinks = data.map((row) => {
    const { from, to } = dayRange(row.key)
    return { ...row, href: `/alerts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` }
  })

  return (
    <WidgetCard
      title="Alerts over the last 14 days"
      subtitle="Each day, split by severity. Select a day to open its alerts."
      isLoading={overview.isLoading}
      isError={overview.isError}
      error={overview.error}
      onRetry={overview.refetch}
      isEmpty={!overview.isLoading && !data.length}
      emptyTitle="No alerts in this period"
      emptyDescription="Once your sensor reports activity, each day appears here."
    >
      <div style={{ height: TREND_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={TREND_MARGIN} barCategoryGap="20%">
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: mutedColor, fontSize: DYGRAPH_AXIS_LABEL_FONT_SIZE }}
              axisLine={{ stroke: theme.axis }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              width={28}
              tick={{ fill: mutedColor, fontSize: DYGRAPH_AXIS_LABEL_FONT_SIZE }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: cursorFill }}
              contentStyle={{
                background: theme.background,
                border: `1px solid ${theme.axis}`,
                borderRadius: 8,
                color: textColor,
              }}
              labelStyle={{ color: mutedColor }}
            />
            <Legend wrapperStyle={{ color: mutedColor, fontSize: 12 }} />
            {TREND_SERIES.map((entry) => (
              <Bar
                key={entry.key}
                dataKey={entry.key}
                name={entry.name}
                stackId="alerts"
                fill={fills[entry.key]}
                cursor={{ fill: cursorFill }}
                onClick={openDay}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h3 className="sr-only">Open alerts by day</h3>
      <ul className="sr-only-focusable mt-2">
        {dayLinks.map((row) => (
          <li key={row.key}>
            <Link to={row.href} className="rounded-md border border-border px-2 py-1 text-xs text-text">
              Open alerts for {row.label}
            </Link>
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}
