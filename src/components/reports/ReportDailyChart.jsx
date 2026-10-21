import { format, parseISO } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  REPORT_DAILY_CHART_HEIGHT,
  REPORT_RISK_SERIES,
} from '../../constants/reports.js'

const MARGIN = Object.freeze({ top: 8, right: 8, left: 0, bottom: 0 })

/**
 * Alerts per day in the report period, stacked by risk. Bars are coloured with
 * CSS variables so the same chart prints in light colours.
 * @param {{days: object[]}} props Rows from the report (`date`, `total`, tiers).
 */
export default function ReportDailyChart({ days }) {
  const data = days.map((row) => ({
    ...row,
    label: format(parseISO(row.date), 'd MMM'),
  }))

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Alerts per day</h2>
      <p className="mt-0.5 text-xs text-muted">Each day in this period, split by risk.</p>
      <div
        className="mt-3"
        style={{ height: REPORT_DAILY_CHART_HEIGHT }}
        role="img"
        aria-label="Stacked bar chart of alerts per day by risk tier"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={MARGIN} barCategoryGap="20%">
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              width={28}
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text)',
              }}
              labelStyle={{ color: 'var(--muted)' }}
            />
            <Legend wrapperStyle={{ color: 'var(--muted)', fontSize: 12 }} />
            {REPORT_RISK_SERIES.map((entry) => (
              <Bar
                key={entry.key}
                dataKey={entry.key}
                name={entry.label}
                stackId="alerts"
                fill={`var(${entry.varName})`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        {data.map((row) => `${row.label}: ${row.total} alerts`).join('; ')}
      </p>
    </section>
  )
}
