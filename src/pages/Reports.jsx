import { FileText } from 'lucide-react'

import EmptyState from '../components/common/EmptyState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/**
 * `/reports` — report history placeholder.
 */
export default function Reports() {
  useDocumentTitle('Reports')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Reports</h1>
        <p className="text-sm text-muted">Periodic summaries you can share with your team.</p>
      </div>

      <EmptyState
        icon={FileText}
        title="Reports are not available yet"
        description="This page will list the reports that have been generated for your organisation and let you download them."
      />
    </div>
  )
}
