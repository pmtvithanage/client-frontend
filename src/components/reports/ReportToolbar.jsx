import { Download, Printer } from 'lucide-react'

import TimeRangePicker from '../common/TimeRangePicker.jsx'
import { REPORT_PERIOD_LABEL, REPORT_RANGES } from '../../constants/reports.js'
import { formatWhenFull } from '../../utils/format.js'

/**
 * Reports header: title, print / CSV actions, the period picker, and the
 * print-only header block (client name, period and generation time).
 * @param {{clientName: string, report?: object, period: object,
 *   onPeriodChange: (next: object) => void, onPrint: () => void,
 *   onExport: () => void, exporting: boolean}} props
 */
export default function ReportToolbar({
  clientName,
  report,
  period,
  onPeriodChange,
  onPrint,
  onExport,
  exporting,
}) {
  const label = REPORT_PERIOD_LABEL[period.key] ?? REPORT_PERIOD_LABEL.week

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">Reports</h1>
          <p className="text-sm text-muted">Periodic summaries you can share with your team.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print / Save as PDF
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={!report || exporting}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {exporting ? 'Preparing CSV…' : 'Download CSV'}
          </button>
        </div>
      </div>

      <div className="print:hidden">
        <TimeRangePicker value={period} onChange={onPeriodChange} ranges={REPORT_RANGES} />
      </div>

      <div className="hidden rounded-lg border border-border bg-surface-2 p-4 print:block">
        <p className="text-xs uppercase tracking-wide text-muted">NIDS Client Portal</p>
        <p className="text-lg font-semibold text-text">{clientName}</p>
        {report ? (
          <p className="text-sm text-text">
            {label} · {formatWhenFull(report.range.from)} to {formatWhenFull(report.range.to)} ·
            Generated {formatWhenFull(report.generated_at)}
          </p>
        ) : null}
      </div>
    </div>
  )
}
