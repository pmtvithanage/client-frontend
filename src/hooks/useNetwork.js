import { useQuery } from '@tanstack/react-query'

import { getDestinations, getDevices, getPorts } from '../api/network.js'
import { queryKeys } from './queryKeys.js'

const STALE_MS = 60_000

/**
 * Top external destinations in this client's traffic.
 * @param {{limit?: number}} [params] Row limit (default 10).
 * @returns {import('@tanstack/react-query').UseQueryResult<{data: object[], meta: object}>}
 */
export function useDestinations(params) {
  return useQuery({
    queryKey: queryKeys.destinations(params),
    queryFn: () => getDestinations(params),
    staleTime: STALE_MS,
  })
}

/**
 * Top destination ports seen in this client's alerts.
 * @param {{limit?: number}} [params] Row limit (default 8).
 * @returns {import('@tanstack/react-query').UseQueryResult<{data: object[], meta: object}>}
 */
export function usePorts(params) {
  return useQuery({
    queryKey: queryKeys.ports(params),
    queryFn: () => getPorts(params),
    staleTime: STALE_MS,
  })
}

/**
 * Devices on the client's own network (first/last seen, alert counts).
 * @returns {import('@tanstack/react-query').UseQueryResult<{data: object[], meta: object}>}
 */
export function useDevices() {
  return useQuery({
    queryKey: queryKeys.devices(),
    queryFn: getDevices,
    staleTime: STALE_MS,
  })
}
