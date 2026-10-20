import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getTrafficHistory, subscribeTraffic } from '../api/traffic.js'
import { queryKeys } from './queryKeys.js'

/**
 * One-second traffic history for a window of 1–15 minutes (oldest first).
 * @param {{minutes?: number}} [params] Window length in minutes.
 * @returns {import('@tanstack/react-query').UseQueryResult<{data: object[], meta: object}>}
 */
export function useTrafficHistory(params) {
  return useQuery({
    queryKey: queryKeys.trafficHistory(params),
    queryFn: () => getTrafficHistory(params),
    staleTime: 5_000,
  })
}

/**
 * Subscribe to the live traffic feed (one point per second). The handler is
 * kept in a ref so an inline callback does not re-subscribe on every render.
 * @param {{onPoint: (point: object) => void, enabled?: boolean, intervalMs?: number,
 *   onError?: (error: {status: number, message: string}) => void}} options
 */
export function useTrafficStream({ onPoint, enabled = true, intervalMs, onError } = {}) {
  const onPointRef = useRef(onPoint)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onPointRef.current = onPoint
    onErrorRef.current = onError
  })

  useEffect(() => {
    if (!enabled) return undefined
    try {
      return subscribeTraffic((point) => onPointRef.current?.(point), { intervalMs })
    } catch (error) {
      // 401 without a session (thrown synchronously by the API layer).
      onErrorRef.current?.(error)
      return undefined
    }
  }, [enabled, intervalMs])
}
