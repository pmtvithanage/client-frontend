import { LayoutDashboard } from 'lucide-react'

import EmptyState from '../components/common/EmptyState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/**
 * `/` — client dashboard placeholder.
 */
export default function Dashboard() {
  useDocumentTitle('Dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-muted">Your security at a glance.</p>
      </div>

      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard widgets are not built yet"
        description="This page will show the top risks on your network, what your sensor has been seeing and the alerts that still need your attention."
      />
    </div>
  )
}
