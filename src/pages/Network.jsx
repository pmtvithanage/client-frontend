import { Network as NetworkIcon } from 'lucide-react'

import EmptyState from '../components/common/EmptyState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/**
 * `/network` — network activity placeholder.
 */
export default function Network() {
  useDocumentTitle('Network')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Network</h1>
        <p className="text-sm text-muted">How traffic has moved through your site.</p>
      </div>

      <EmptyState
        icon={NetworkIcon}
        title="Network views are not built yet"
        description="This page will show the hosts on your site, the conversations between them and the traffic trends captured by your sensor."
      />
    </div>
  )
}
