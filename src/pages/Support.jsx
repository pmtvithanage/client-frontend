import { LifeBuoy } from 'lucide-react'
import { Navigate } from 'react-router-dom'

import EmptyState from '../components/common/EmptyState.jsx'
import { ROLES } from '../constants/nav.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { readSession } from '../utils/session.js'

/**
 * `/support` — support and feedback placeholder. Owner-only: members are sent
 * back to the dashboard because this form is not theirs to use.
 */
export default function Support() {
  useDocumentTitle('Support & feedback')
  const role = readSession()?.user?.role

  if (role !== ROLES.OWNER) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Support &amp; feedback</h1>
        <p className="text-sm text-muted">Tell us what is working and what is not.</p>
      </div>

      <EmptyState
        icon={LifeBuoy}
        title="The support form is not built yet"
        description="This page will let an owner send a message to the operations team and report a suspicious event for review."
      />
    </div>
  )
}
