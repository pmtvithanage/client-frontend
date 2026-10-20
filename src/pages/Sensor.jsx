import { Router } from 'lucide-react'

import EmptyState from '../components/common/EmptyState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/**
 * `/sensor` — sensor status placeholder.
 */
export default function Sensor() {
  useDocumentTitle('Sensor')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Sensor</h1>
        <p className="text-sm text-muted">The health of the sensor watching your network.</p>
      </div>

      <EmptyState
        icon={Router}
        title="Sensor status is not connected yet"
        description="This page will show whether your sensor is online, when it last reported and how much traffic it has processed."
      />
    </div>
  )
}
