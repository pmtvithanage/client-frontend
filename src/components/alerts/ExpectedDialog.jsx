import { useState } from 'react'

/**
 * "Mark as expected" dialog. The reason is optional and is sent to the SOC
 * team as feedback; marking an alert expected never hides it by itself.
 * @param {{open: boolean, busy?: boolean, onSubmit: (reason: string) => void,
 *   onCancel: () => void}} props
 */
export default function ExpectedDialog({ open, busy = false, onSubmit, onCancel }) {
  const [reason, setReason] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="expected-dialog-title"
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-xl"
      >
        <h2 id="expected-dialog-title" className="text-base font-semibold text-text">
          Mark this alert as expected
        </h2>
        <p className="mt-2 text-sm text-muted">
          Tell us why this activity is normal. Our analysts use your note to tune detection — the
          alert stays visible either way.
        </p>
        <label className="mt-4 block text-sm">
          <span className="text-muted">Why is this expected? (optional)</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. Our accounting app does this every night."
            className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-2 text-sm text-text placeholder:text-muted"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSubmit(reason.trim())}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Mark as expected'}
          </button>
        </div>
      </div>
    </div>
  )
}
