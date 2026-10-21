import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import {
  REPORT_CATEGORY_CHART_HEIGHT,
  REPORT_CATEGORY_COLORS,
  REPORT_LIST_LIMIT,
} from '../../constants/reports.js'

/**
 * Category share donut: the top categories plus an "Other" slice, with a
 * legend showing each category's count and percentage of the period's alerts.
 * @param {{categories: object[], total: number}} props Report `top_categories`
 *   and `summary.total_alerts`.
 */
export default function ReportCategoryChart({ categories, total }) {
  const named = categories.map((row) => ({ name: row.category, value: row.count }))
  const listed = named.reduce((sum, row) => sum + row.value, 0)
  const other = Math.max(total - listed, 0)
  const chartData = other > 0 ? [...named, { name: 'Other', value: other }] : named

  const color = (index) => `var(${REPORT_CATEGORY_COLORS[index % REPORT_CATEGORY_COLORS.length]})`
  const rows = categories.slice(0, REPORT_LIST_LIMIT).map((row) => ({
    ...row,
    share: total ? Math.round((row.count / total) * 100) : 0,
  }))

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Category share</h2>
      <p className="mt-0.5 text-xs text-muted">Which kinds of activity raised the most alerts.</p>
      <div
        className="mt-3"
        style={{ height: REPORT_CATEGORY_CHART_HEIGHT }}
        role="img"
        aria-label="Donut chart of alert share by category"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={color(index)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text)',
              }}
              formatter={(value, name) => [`${value} alerts`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1.5">
        {rows.map((row, index) => (
          <li key={row.category} className="flex items-start gap-2 text-sm">
            <span
              aria-hidden="true"
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: color(index) }}
            />
            <span className="flex-1 text-text">{row.category}</span>
            <span className="text-muted">
              {row.count} · {row.share}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
