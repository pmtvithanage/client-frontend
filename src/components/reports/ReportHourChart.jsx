import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { REPORT_HOUR_CHART_HEIGHT } from '../../constants/reports.js'

const MARGIN = Object.freeze({ top: 8, right: 8, left: 0, bottom: 0 })

function hourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`
}

/**
 * Hour-of-day pattern: how the period's alerts spread across the 24 hours
 * (browser local time), as a single accent-coloured bar chart.
 * @param {{hours: Array<{hour: number, count: number}>}} props Report `hours`.
 */
export default function ReportHourChart({ hours }) {
  const data = hours.map((row) => ({ ...row, label: String(row.hour).padStart(2, '0') }))
  const peak = hours.reduce((best, row) => (row.count > best.count ? row : best), hours[0])

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Hour of day</h2>
      <p className="mt-0.5 text-xs text-muted">
        When alerts happened during the day, in your local time.
      </p>
      <div
        className="mt-3"
        style={{ height: REPORT_HOUR_CHART_HEIGHT }}
        role="img"
        aria-label="Bar chart of alerts by hour of day"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={MARGIN} barCategoryGap="10%">
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              interval={1}
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
              labelFormatter={(label) => hourLabel(Number(label))}
            />
            <Bar dataKey="count" name="Alerts" fill="var(--accent)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted">
        Busiest hour: {hourLabel(peak.hour)} with {peak.count}{' '}
        {peak.count === 1 ? 'alert' : 'alerts'}.
      </p>
    </section>
  )
}
