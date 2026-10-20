import { Bell } from 'lucide-react'
import { Navigate } from 'react-router-dom'

import EmptyState from '../components/common/EmptyState.jsx'
import { ROLES } from '../constants/nav.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { readSession } from '../utils/session.js'

/**
 * `/notifications` — notification settings placeholder. Owner-only: members are
 * sent back to the dashboard because this control is not theirs to use.
 */
export default function Notifications() {
  useDocumentTitle('Notifications')
  const role = readSession()?.user?.role

  if (role !== ROLES.OWNER) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Notifications</h1>
        <p className="text-sm text-muted">Choose how your team hears about new alerts.</p>
      </div>

      <EmptyState
        icon={Bell}
        title="Notification settings are not built yet"
        description="This page will let an owner decide who is emailed about new alerts and how often."
      />
    </div>
  )
}
