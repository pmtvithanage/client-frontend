import { ShieldAlert } from 'lucide-react'

import EmptyState from '../components/common/EmptyState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/**
 * `/alerts` — alert list placeholder.
 */
export default function Alerts() {
  useDocumentTitle('Alerts')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Alerts</h1>
        <p className="text-sm text-muted">
          Every event we flagged on your network, in plain English.
        </p>
      </div>

      <EmptyState
        icon={ShieldAlert}
        title="No alerts are loaded yet"
        description="Once the data layer is connected, this list shows each alert with a plain severity label — Minor, Moderate, Serious or Urgent — and a short explanation of why it was flagged."
      />
    </div>
  )
}
