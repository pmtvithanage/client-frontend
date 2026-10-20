import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

import EmptyState from '../components/common/EmptyState.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/**
 * Catch-all page for any path that does not match a route.
 */
export default function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <div className="space-y-6">
      <EmptyState
        icon={Compass}
        title="We could not find that page"
        description="The link may be old, or the address may have been typed incorrectly."
      >
        <Link
          to="/"
          className="mt-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          Go to dashboard
        </Link>
      </EmptyState>
    </div>
  )
}
