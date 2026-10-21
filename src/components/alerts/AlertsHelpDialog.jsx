import { X } from 'lucide-react'

import { ALERT_SHORTCUTS } from '../../constants/alerts.js'

/**
 * Keyboard help dialog for the alerts list (`?`). Escape or "Close" dismisses.
 * @param {{open: boolean, onClose: () => void}} props
 */
export default function AlertsHelpDialog({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="alerts-help-title"
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 id="alerts-help-title" className="text-base font-semibold text-text">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-0.5 text-muted hover:bg-surface-2 hover:text-text"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <dl className="mt-4 space-y-2">
          {ALERT_SHORTCUTS.map((shortcut) => (
            <div key={shortcut.keys} className="flex items-center justify-between gap-3">
              <dt className="text-sm text-muted">{shortcut.label}</dt>
              <dd>
                <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-text">
                  {shortcut.keys}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
