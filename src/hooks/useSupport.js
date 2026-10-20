import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createRequest, listRequests, replyRequest } from '../api/support.js'
import { queryKeys } from './queryKeys.js'

/**
 * The client's support requests, newest first.
 * @returns {import('@tanstack/react-query').UseQueryResult<{data: object[], meta: object}>}
 */
export function useRequests() {
  return useQuery({
    queryKey: queryKeys.requests(),
    queryFn: listRequests,
    staleTime: 60_000,
  })
}

/** Mutation: open a new support request (owner only). */
export function useCreateRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input) => createRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.requests() }),
  })
}

/** Mutation: reply to one of the client's own requests (owner only). */
export function useReplyRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }) => replyRequest(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.requests() }),
  })
}
