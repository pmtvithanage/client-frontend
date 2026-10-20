import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getChecklist, getSensor, pairSensor, unpairSensor } from '../api/sensor.js'
import { queryKeys } from './queryKeys.js'

/**
 * The client's ONE sensor: status, health, last seen, pairing.
 * @returns {import('@tanstack/react-query').UseQueryResult<object>}
 */
export function useSensor() {
  return useQuery({
    queryKey: queryKeys.sensor(),
    queryFn: getSensor,
    staleTime: 30_000,
  })
}

/**
 * Plain-language connection checklist for the sensor.
 * @returns {import('@tanstack/react-query').UseQueryResult<{data: object[], meta: object}>}
 */
export function useChecklist() {
  return useQuery({
    queryKey: queryKeys.checklist(),
    queryFn: getChecklist,
    staleTime: 60_000,
  })
}

/** Mutation: re-pair the sensor (owner only). */
export function usePairSensor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: pairSensor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sensor'] }),
  })
}

/** Mutation: unpair the sensor (owner only; history is kept). */
export function useUnpairSensor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unpairSensor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sensor'] }),
  })
}
