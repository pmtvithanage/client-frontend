import { format, parseISO } from 'date-fns'

import { REPORT_RISK_SERIES } from '../../constants/reports.js'
import { formatDuration } from '../../utils/format.js'

/** One labelled fact inside the summary grid. */
function Fact({ label, value, hint }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-medium text-text">{value}</p>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

/** Score change copy: positive means the score improved. */
function changeText(change) {
  if (!change) return 'No change from the previous period'
  return `${change > 0 ? '+' : ''}${change} points vs the previous period`
}

/**
 * Period summary: security score and its change, alert totals by risk, mean
 * time to acknowledge, alerts marked expected, sensor uptime, top categories
 * and the busiest days.
 * @param {{report: object}} props Report returned by `useReport`.
 */
export default function ReportSummary({ report }) {
  const { summary, score, score_change: change, top_categories: categories, busiest_days: days } =
    report
  const total = summary.total_alerts

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text">Security score</h2>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-text">{score.score}</span>
          <span className="text-sm text-muted">{score.label}</span>
        </p>
        <p
          className={`mt-1 text-xs ${
            change > 0 ? 'text-sev-low' : change < 0 ? 'text-sev-critical' : 'text-muted'
          }`}
        >
          {changeText(change)}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text">Alerts by risk</h2>
        <ul className="mt-2 space-y-1.5">
          {REPORT_RISK_SERIES.map((entry) => (
            <li key={entry.key} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-text">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: `var(${entry.varName})` }}
                />
                {entry.label}
              </span>
              <span className="font-medium text-text">{summary[entry.key]}</span>
            </li>
          ))}
        </ul>
        <Fact
          label="Total alerts in this period"
          value={total}
          hint={`${summary.open} open · ${summary.resolved} resolved`}
        />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text">Response and reliability</h2>
        <div className="mt-2 space-y-3">
          <Fact
            label="Mean time to acknowledge"
            value={
              summary.mean_ack_ms == null
                ? 'No acknowledgements yet'
                : formatDuration(summary.mean_ack_ms)
            }
          />
          <Fact label="Marked as expected" value={summary.expected} />
          <Fact label="Sensor uptime" value={`${summary.sensor_uptime_pct}%`} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 sm:col-span-2">
        <h2 className="text-sm font-semibold text-text">Top categories</h2>
        {categories.length ? (
          <ul className="mt-2 space-y-2">
            {categories.map((row) => {
              const share = total ? Math.round((row.count / total) * 100) : 0
              return (
                <li key={row.category}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-text">{row.category}</span>
                    <span className="text-muted">
                      {row.count} · {share}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface-2" aria-hidden="true">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No alerts in this period.</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text">Busiest days</h2>
        {days.length ? (
          <ul className="mt-2 space-y-1.5">
            {days.map((row) => (
              <li key={row.date} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-text">{format(parseISO(row.date), 'EEE d MMM')}</span>
                <span className="text-muted">{row.total} alerts</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No alerts in this period.</p>
        )}
      </div>
    </section>
  )
}
