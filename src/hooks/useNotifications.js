import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getNotificationPreferences,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from '../api/notifications.js'
import { queryKeys } from './queryKeys.js'

/**
 * The in-app notification feed (alerts + sensor notices).
 * @param {{unread_only?: boolean, limit?: number}} [params] Filters.
 * @returns {import('@tanstack/react-query').UseQueryResult<{data: object[], meta: object}>}
 */
export function useNotifications(params) {
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: () => listNotifications(params),
    staleTime: 30_000,
  })
}

/**
 * Notification preferences (channels, minimum severity, quiet hours).
 * @returns {import('@tanstack/react-query').UseQueryResult<object>}
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.preferences(),
    queryFn: getNotificationPreferences,
    staleTime: 5 * 60_000,
  })
}

/** Mutation: mark one notification as read. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

/** Mutation: mark every notification as read. */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

/** Mutation: update preferences (owner only). */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch) => updateNotificationPreferences(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.preferences(), data)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
