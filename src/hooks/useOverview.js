import { useQuery } from '@tanstack/react-query'

import { getOverview } from '../api/overview.js'
import { queryKeys } from './queryKeys.js'

/** Overview changes slowly; avoid refetch storms while navigating. */
const STALE_MS = 30_000

/**
 * Dashboard overview: `security_score`, `counts`, `trend` and `sensor`.
 * @returns {import('@tanstack/react-query').UseQueryResult<object>}
 */
export function useOverview() {
  return useQuery({
    queryKey: queryKeys.overview(),
    queryFn: getOverview,
    staleTime: STALE_MS,
  })
}
