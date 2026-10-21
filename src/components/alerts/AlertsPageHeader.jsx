import { Download, Keyboard } from 'lucide-react'

import { ALERT_SORT_OPTIONS } from '../../constants/alerts.js'

/**
 * Page header for `/alerts`: title, the keyboard hint, the sort select and
 * the Export CSV button (exports the whole current filtered view, not just
 * loaded rows).
 * @param {{filters: object, onSortChange: (sort: string) => void,
 *   onExport: () => void, exporting: boolean, hasRows: boolean}} props
 */
export default function AlertsPageHeader({ filters, onSortChange, onExport, exporting, hasRows }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-text">Alerts</h1>
        <p className="text-sm text-muted">Every event we flagged on your network, in plain English.</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
          Press <kbd className="rounded border border-border bg-surface-2 px-1 font-mono">?</kbd> for keyboard shortcuts.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted">
          Sort
          <select
            value={filters.sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-text"
          >
            {ALERT_SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onExport}
          disabled={exporting || !hasRows}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2 disabled:opacity-60"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>
    </div>
  )
}
