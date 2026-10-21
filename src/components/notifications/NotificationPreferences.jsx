import { useState } from 'react'

import NotificationChannel from './NotificationChannel.jsx'
import ToggleSwitch from '../common/ToggleSwitch.jsx'
import WidgetCard from '../dashboard/WidgetCard.jsx'
import { MIN_SEVERITY_OPTIONS } from '../../constants/notifications.js'
import { SEVERITY } from '../../constants/severity.js'
import { useToast } from '../../hooks/useToast.js'
import { useUpdateNotificationPreferences } from '../../hooks/useNotifications.js'
import { severityName } from '../../utils/plainLanguage.js'

const SEVERITY_ORDER = Object.freeze([SEVERITY.LOW, SEVERITY.MEDIUM, SEVERITY.HIGH, SEVERITY.CRITICAL])

/**
 * Notifications preferences form (owner only).
 * @param {{prefs: object, onSaved: () => void, disabled: boolean}} props
 */
export default function NotificationPreferences({
  prefs,
  onSaved,
  disabled,
}) {
  const { toast } = useToast()
  const update = useUpdateNotificationPreferences()
  const [draft, setDraft] = useState(prefs)
  const [testing, setTesting] = useState(null)

  const save = async (patch) => {
    try {
      await update.mutateAsync(patch)
      onSaved()
    } catch (error) {
      toast(error?.message ?? 'Could not save preferences.', { tone: 'error' })
    }
  }

  const handleTest = (channel) => {
    setTesting(channel)
    setTimeout(() => {
      toast(`Test ${channel.toUpperCase()} sent to ${draft.channels[channel]?.destination}`, {
        tone: 'success',
      })
      setTesting(null)
    }, 300)
  }

  return (
    <WidgetCard title="Notification settings" subtitle="Choose who hears about new alerts.">
      <div className="space-y-4">
        <NotificationChannel
          channel="email"
          label="Email"
          enabled={draft.channels.email.enabled}
          destination={draft.channels.email.destination}
          disabled={disabled || update.isPending}
          testing={testing === 'email'}
          error={
            draft.channels.email.enabled && !draft.channels.email.destination.includes('@')
              ? 'That email address does not look right'
              : ''
          }
          onToggle={(enabled) => {
            const next = { ...draft, channels: { ...draft.channels, email: { ...draft.channels.email, enabled } } }
            setDraft(next)
            save({ channels: { email: { enabled } } })
          }}
          onDestinationChange={(value) => {
            const next = { ...draft, channels: { ...draft.channels, email: { ...draft.channels.email, destination: value } } }
            setDraft(next)
          }}
          onSendTest={() => handleTest('email')}
        />

        <NotificationChannel
          channel="sms"
          label="SMS"
          enabled={draft.channels.sms.enabled}
          destination={draft.channels.sms.destination}
          disabled={disabled || update.isPending}
          testing={testing === 'sms'}
          error=""
          onToggle={(enabled) => {
            const next = { ...draft, channels: { ...draft.channels, sms: { ...draft.channels.sms, enabled } } }
            setDraft(next)
            save({ channels: { sms: { enabled } } })
          }}
          onDestinationChange={(value) => {
            const next = { ...draft, channels: { ...draft.channels, sms: { ...draft.channels.sms, destination: value } } }
            setDraft(next)
          }}
          onSendTest={() => handleTest('sms')}
        />

        <div className="rounded-lg border border-border bg-surface p-4">
          <label className="block text-sm font-medium text-text" htmlFor="min-severity">
            Minimum risk to notify
          </label>
          <p className="text-xs text-muted">Only alerts at this risk or higher will trigger alerts.</p>
          <select
            id="min-severity"
            value={draft.minimum_severity}
            onChange={(event) => {
              const value = event.target.value
              setDraft((current) => ({ ...current, minimum_severity: value }))
              save({ minimum_severity: value })
            }}
            disabled={disabled || update.isPending}
            className="mt-2 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text"
          >
            {SEVERITY_ORDER.filter((level) => MIN_SEVERITY_OPTIONS.includes(level)).map((level) => (
              <option key={level} value={level}>
                {severityName(level)} ({level})
              </option>
            ))}
          </select>
        </div>

        <ToggleSwitch
          id="quiet-hours"
          checked={draft.quiet_hours.enabled}
          disabled={disabled || update.isPending}
          label="Quiet hours"
          description="Do not send alerts between the selected times (local time)."
          onChange={(enabled) => {
            const next = { ...draft, quiet_hours: { ...draft.quiet_hours, enabled } }
            setDraft(next)
            save({ quiet_hours: { enabled } })
          }}
        />

        {draft.quiet_hours.enabled ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
            <label className="flex items-center gap-2 text-sm text-text">
              Start
              <input
                type="time"
                value={draft.quiet_hours.start}
                onChange={(event) => {
                  const start = event.target.value
                  setDraft((current) => ({ ...current, quiet_hours: { ...current.quiet_hours, start } }))
                  save({ quiet_hours: { start } })
                }}
                disabled={disabled || update.isPending}
                className="rounded-md border border-border bg-surface-2 px-2 py-1 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              End
              <input
                type="time"
                value={draft.quiet_hours.end}
                onChange={(event) => {
                  const end = event.target.value
                  setDraft((current) => ({ ...current, quiet_hours: { ...current.quiet_hours, end } }))
                  save({ quiet_hours: { end } })
                }}
                disabled={disabled || update.isPending}
                className="rounded-md border border-border bg-surface-2 px-2 py-1 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              Daily summary email
              <input
                type="checkbox"
                checked
                disabled
                className="h-4 w-4"
              />
              <span className="text-xs text-muted">(Fixed for now)</span>
            </label>
          </div>
        ) : null}

        {update.isPending || update.isSuccess ? (
          <p className="text-xs text-muted">{update.isSuccess ? 'Saved.' : 'Saving…'}</p>
        ) : null}
      </div>
    </WidgetCard>
  )
}
