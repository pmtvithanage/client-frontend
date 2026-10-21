import NotificationPreferences from '../components/notifications/NotificationPreferences.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useNotificationPreferences } from '../hooks/useNotifications.js'

/**
 * `/notifications` — notification settings (owner can edit, members read-only).
 */
export default function Notifications() {
  useDocumentTitle('Notifications')
  const { isOwner } = useAuth()
  const prefs = useNotificationPreferences()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Notifications</h1>
        <p className="text-sm text-muted">Choose how your team hears about new alerts.</p>
      </div>

      {prefs.isLoading ? <p className="text-sm text-muted">Loading preferences…</p> : null}
      {prefs.data ? (
        <NotificationPreferences
          prefs={prefs.data}
          onSaved={() => {}}
          disabled={!isOwner}
        />
      ) : null}
    </div>
  )
}
