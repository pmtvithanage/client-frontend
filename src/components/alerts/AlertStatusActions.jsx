import { useState } from 'react'

import ExpectedDialog from './ExpectedDialog.jsx'
import { useUpdateAlertStatus } from '../../hooks/useAlerts.js'
import { useToast } from '../../hooks/useToast.js'
import { ALERT_STATUS } from '../../constants/statuses.js'

/** Success message after marking an alert expected (sent to the SOC team). */
const EXPECTED_TOAST = 'Thanks. Our analysts will review this and tune detection.'

/**
 * Status controls for the alert header. Owners see Acknowledge, "This is
 * expected" and Mark resolved; members only ever see Acknowledge
 * (AGENTS.md §5 — controls the role cannot use are hidden). Controls only
 * appear while the alert is still `new`, because that is the only status the
 * portal can move.
 * @param {{alert: object, isOwner: boolean}} props
 */
export default function AlertStatusActions({ alert, isOwner }) {
  const { toast } = useToast()
  const mutation = useUpdateAlertStatus()
  const [expectedOpen, setExpectedOpen] = useState(false)

  if (alert.status !== ALERT_STATUS.NEW) return null

  const run = (status, reason, done, successMessage) => {
    mutation.mutate(
      { id: alert.id, status, reason },
      {
        onSuccess: () => {
          done?.()
          toast(successMessage ?? `Marked as ${status}.`, { tone: 'success' })
        },
        onError: (error) => toast(error?.message || 'We could not update that alert.', { tone: 'error' }),
      },
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => run(ALERT_STATUS.ACKNOWLEDGED)}
        disabled={mutation.isPending}
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2 disabled:opacity-60"
      >
        Acknowledge
      </button>
      {isOwner ? (
        <button
          type="button"
          onClick={() => setExpectedOpen(true)}
          disabled={mutation.isPending}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2 disabled:opacity-60"
        >
          This is expected
        </button>
      ) : null}
      {isOwner ? (
        <button
          type="button"
          onClick={() => run(ALERT_STATUS.RESOLVED)}
          disabled={mutation.isPending}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
        >
          Mark resolved
        </button>
      ) : null}
      <ExpectedDialog
        open={expectedOpen}
        busy={mutation.isPending}
        onCancel={() => setExpectedOpen(false)}
        onSubmit={(reason) =>
          run(ALERT_STATUS.EXPECTED, reason, () => setExpectedOpen(false), EXPECTED_TOAST)
        }
      />
    </div>
  )
}
