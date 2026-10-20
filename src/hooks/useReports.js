import { useQuery } from '@tanstack/react-query'

import { getReport } from '../api/reports.js'
import { queryKeys } from './queryKeys.js'

/**
 * The plain-language period report (`This week` / `This month`).
 *
 * `placeholderData` keeps the previous period on screen while the next one
 * loads, so switching periods does not flash an empty state.
 * @param {{period?: 'week'|'month'}} [params] Report period (default `week`).
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
