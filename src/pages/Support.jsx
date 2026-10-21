import { Navigate, useLocation } from 'react-router-dom'

import SupportForm from '../components/support/SupportForm.jsx'
import FaqAccordion from '../components/support/FaqAccordion.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/**
 * `/support` — contact support, request list and FAQ.
 */
export default function Support() {
  useDocumentTitle('Support & feedback')
  const { isOwner } = useAuth()
  const prefillSubject = useLocation().state?.subject

  if (!isOwner) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Support &amp; feedback</h1>
        <p className="text-sm text-muted">Tell us what is working and what is not.</p>
      </div>
      {prefillSubject ? (
        <p className="rounded-lg border border-border bg-surface p-3 text-sm text-muted">
          Request subject ready: <span className="font-medium text-text">{prefillSubject}</span>
        </p>
      ) : null}
      <SupportForm />
      <FaqAccordion />
    </div>
  )
}
