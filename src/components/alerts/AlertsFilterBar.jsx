import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'

import AlertFilterChips from './AlertFilterChips.jsx'
import TimeRangePicker from '../common/TimeRangePicker.jsx'
import { ALERT_TIME_RANGES, DEFAULT_ALERT_RANGE } from '../../constants/alerts.js'
import { CATEGORIES } from '../../constants/categories.js'

/**
 * Filter bar for `/alerts`: search box, risk/status chips, category select,
 * time range and the "Only needs attention" toggle. Every control writes
 * straight to the URL through the page's `onFiltersChange`.
 * @param {{filters: object, onFiltersChange: (next: object) => void,
 *   resultCount: number|null}} props `resultCount` is the server's total for
 *   the current filters (null while unknown).
 */
const AlertsFilterBar = forwardRef(function AlertsFilterBar(
  { filters, onFiltersChange, resultCount },
  searchRef,
) {
  const patch = (part) => onFiltersChange({ ...filters, ...part })

  const toggleIn = (list, value) =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]

  const toggleAttention = () => {
    const attention = !filters.attention
    patch({
      attention,
      severity: attention ? [] : filters.severity,
      status: attention ? [] : filters.status,
    })
  }

  return (
    <section aria-label="Filter alerts" className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex-1 min-w-52">
          <span className="sr-only">Search alerts</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={filters.q}
            placeholder="Search addresses, category or reference…"
            onChange={(event) => patch({ q: event.target.value })}
            className="w-full rounded-md border border-border bg-surface py-1.5 pl-8 pr-2 text-sm text-text placeholder:text-muted"
          />
        </label>
        <label className="flex items-center gap-1.5 text-sm text-muted">
          <span className="sr-only">Category</span>
          <select
            value={filters.category}
            onChange={(event) => patch({ category: event.target.value })}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-text"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <TimeRangePicker
          ranges={ALERT_TIME_RANGES}
          value={{ key: filters.range, from: filters.from, to: filters.to }}
          onChange={(next) =>
            patch({ range: next.key, from: next.from ?? null, to: next.to ?? null })
          }
        />
        <button
          type="button"
          aria-pressed={filters.attention}
          onClick={toggleAttention}
          title="Only new Serious and Urgent alerts"
          className={
            filters.attention
              ? 'rounded-md border border-accent/40 bg-accent/15 px-2.5 py-1.5 text-xs font-medium text-accent'
              : 'rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-text'
          }
        >
          Only needs attention
        </button>
      </div>

      <AlertFilterChips
        severity={filters.severity}
        status={filters.status}
        disabled={filters.attention}
        onToggleSeverity={(tier) => patch({ severity: toggleIn(filters.severity, tier) })}
        onToggleStatus={(value) => patch({ status: toggleIn(filters.status, value) })}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted" aria-live="polite">
          {resultCount == null
            ? 'Loading the alert count…'
            : `${resultCount} alert${resultCount === 1 ? '' : 's'} match this view`}
        </p>
        <button
          type="button"
          onClick={() =>
            onFiltersChange({
              severity: [],
              status: [],
              category: '',
              q: '',
              range: DEFAULT_ALERT_RANGE,
              from: null,
              to: null,
              attention: false,
              sort: filters.sort,
            })
          }
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted hover:bg-surface-2 hover:text-text"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear filters
        </button>
      </div>
    </section>
  )
})

export default AlertsFilterBar
