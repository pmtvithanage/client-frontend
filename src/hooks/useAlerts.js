import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { addAlertNote, explainAlert, getAlert, listAlerts, updateAlertStatus } from '../api/alerts.js'
import { queryKeys } from './queryKeys.js'

const LIST_STALE_MS = 15_000
const DETAIL_STALE_MS = 10_000

/**
 * The client's alerts with filtering, sorting and cursor pagination.
 * @param {object} [params] `severity`, `status`, `category`, `q`, `from`, `to`, `sort`, `limit`, `cursor`.
 * @returns {import('@tanstack/react-query').UseQueryResult<{data: object[], meta: object}>}
 */
export function useAlerts(params) {
  return useQuery({
    queryKey: queryKeys.alerts(params),
    queryFn: () => listAlerts(params),
    staleTime: LIST_STALE_MS,
  })
}

/**
 * One alert plus its client notes.
 * @param {string} id Alert id.
 * @param {{enabled?: boolean}} [options]
 * @returns {import('@tanstack/react-query').UseQueryResult<object|null>}
 */
export function useAlert(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.alert(id),
    queryFn: () => getAlert(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: DETAIL_STALE_MS,
  })
}

/**
 * Plain-language explanation for one alert (what/why/what to do).
 * @param {string} id Alert id.
 * @param {{enabled?: boolean}} [options]
 * @returns {import('@tanstack/react-query').UseQueryResult<object>}
 */
export function useAlertExplain(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.alertExplain(id),
    queryFn: () => explainAlert(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 5 * 60_000,
  })
}

/** Mutation: change an alert status (`new -> acknowledged | expected | resolved`). */
export function useUpdateAlertStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => updateAlertStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.overview() })
    },
  })
}

/** Mutation: add an owner-authored note to an alert. */
export function useAddAlertNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }) => addAlertNote(id, body),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alert(id) })
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}
