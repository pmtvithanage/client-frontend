import { useQuery } from '@tanstack/react-query'

import { getReport } from '../api/reports.js'
import { queryKeys } from './queryKeys.js'

/**
 * The plain-language period report (this/last week, this/last month or custom).
 *
 * `placeholderData` keeps the previous period on screen while the next one
 * loads, so switching periods does not flash an empty state.
 * @param {{period?: string, from?: string, to?: string}} [params] Report period
 *   (default `week`); `from`/`to` are required when `period` is `custom`.
 * @returns {import('@tanstack/react-query').UseQueryResult<object>}
 */
export function useReport(params) {
  return useQuery({
    queryKey: queryKeys.report(params),
    queryFn: () => getReport(params),
    staleTime: 5 * 60_000,
    placeholderData: (previous) => previous,
  })
}
