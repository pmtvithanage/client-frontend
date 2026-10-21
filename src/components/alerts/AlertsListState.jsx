import { ShieldAlert } from 'lucide-react'

import EmptyState from '../common/EmptyState.jsx'
import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'

/**
 * The full-list states shown instead of rows on `/alerts`: first-load
 * skeleton, failure with retry, or an empty state that tells the user
 * whether filters hid everything or there is simply nothing yet.
 * @param {{isLoading: boolean, isError: boolean, error: object|null,
 *   onRetry: () => void, isEmpty: boolean, hasFilters: boolean}} props
 */
export default function AlertsListState({ isLoading, isError, error, onRetry, isEmpty, hasFilters }) {
  if (isLoading) return <LoadingSkeleton rows={8} />
  if (isError) return <ErrorState error={error} onRetry={onRetry} />
  if (isEmpty) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title={hasFilters ? 'No alerts match this view' : 'No alerts yet'}
        description={
          hasFilters
            ? 'Try a wider time range, or clear the filters to see everything.'
            : 'Once your sensor reports activity, every flagged event appears here.'
        }
      />
    )
  }
  return null
}
