import { useState } from 'react'
import { Code2 } from 'lucide-react'

import CopyButton from '../common/CopyButton.jsx'
import { useAlertExplain } from '../../hooks/useAlerts.js'

/**
 * Collapsible "Technical details (for IT staff)": the safe label/value list
 * from `GET /alerts/:id/explain` plus a raw JSON viewer with copy. The
 * projection strips model internals, so this can never leak them.
 * @param {{alert: object}} props The client-safe alert.
 */
export default function TechnicalDetails({ alert }) {
  const explain = useAlertExplain(alert.id)
  const [open, setOpen] = useState(false)
  const details = explain.data?.technical_details ?? []
  const raw = JSON.stringify(alert, null, 2)

  return (
    <section className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-text hover:bg-surface-2"
      >
        <span className="flex items-center gap-1.5">
          <Code2 className="h-4 w-4 text-accent" aria-hidden="true" />
          Technical details (for IT staff)
        </span>
        <span className="text-xs font-normal text-muted">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open ? (
        <div className="border-t border-border px-4 py-3">
          {details.length ? (
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {details.map((entry) => (
                <div key={entry.label}>
                  <dt className="text-xs text-muted">{entry.label}</dt>
                  <dd className="break-all font-mono text-xs text-text">{entry.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted">Details are not available right now.</p>
          )}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h3 className="text-xs font-medium text-muted">Raw alert data (JSON)</h3>
              <CopyButton value={raw} label="Copy JSON" title="Copy the raw alert JSON" />
            </div>
            <pre className="max-h-64 overflow-auto rounded-lg bg-surface-2 p-3 font-mono text-xs leading-relaxed text-text">
              {raw}
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  )
}
