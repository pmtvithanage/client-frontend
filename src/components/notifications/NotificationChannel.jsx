import { useState } from 'react'

/**
 * Email/SMS channel row with destination input and "Send test" button.
 * @param {{channel: 'email'|'sms', label: string, enabled: boolean,
 *   destination: string, disabled: boolean, onToggle: (enabled: boolean) => void,
 *   onDestinationChange: (value: string) => void, onSendTest: () => void,
 *   testing: boolean, error?: string}} props
 */
export default function NotificationChannel({
  channel,
  label,
  enabled,
  destination,
  disabled,
  onToggle,
  onDestinationChange,
  onSendTest,
  testing,
  error,
}) {
  const [touched, setTouched] = useState(false)
  const showError = touched && error

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text">{label}</p>
          <p className="text-xs text-muted">
            {enabled ? 'Alerts sent when they meet the minimum risk.' : 'Channel turned off.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          disabled={disabled}
          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text hover:bg-surface-2 disabled:opacity-60"
        >
          {enabled ? 'Turn off' : 'Turn on'}
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <label className="block text-xs font-medium text-muted" htmlFor={`notif-${channel}-dest`}>
          {channel === 'email' ? 'Email address' : 'SMS number'}
        </label>
        <input
          id={`notif-${channel}-dest`}
          value={destination}
          disabled={disabled}
          onChange={(event) => {
            onDestinationChange(event.target.value)
            if (!touched) setTouched(true)
          }}
          onBlur={() => setTouched(true)}
          placeholder={channel === 'email' ? 'name@organisation.com' : '+94...'}
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text disabled:opacity-60"
        />
        {showError ? <p className="text-xs text-sev-critical">{error}</p> : null}
        <button
          type="button"
          onClick={onSendTest}
          disabled={disabled || !enabled || !destination.trim() || testing}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
        >
          {testing ? 'Sending…' : 'Send test'}
        </button>
      </div>
    </div>
  )
}
