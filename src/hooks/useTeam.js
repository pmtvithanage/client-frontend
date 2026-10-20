import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { inviteMember, listMembers, removeMember, updateMemberRole } from '../api/team.js'
import { queryKeys } from './queryKeys.js'

/**
 * Everyone on the client's account (any signed-in user may read).
 * @returns {import('@tanstack/react-query').UseQueryResult<{data: object[], meta: object}>}
 */
export function useMembers() {
  return useQuery({
    queryKey: queryKeys.team(),
    queryFn: listMembers,
    staleTime: 60_000,
  })
}

/** Mutation: invite a person (owner only). */
export function useInviteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input) => inviteMember(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.team() }),
  })
}

/** Mutation: change a person's role (owner only). */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, role }) => updateMemberRole(email, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.team() }),
  })
}

/** Mutation: remove a person from the account (owner only, never yourself). */
export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email) => removeMember(email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.team() }),
  })
}
