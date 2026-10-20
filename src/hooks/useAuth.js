import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'

import { me } from '../api/auth.js'
import { queryKeys } from './queryKeys.js'

/** React context carrying the auth session (`AuthProvider` supplies it). */
export const AuthContext = createContext(null)

/**
 * Access the signed-in session and its controls.
 * @returns {{user: object|null, token: string|null, isAuthenticated: boolean,
 *   role: string|null, isOwner: boolean, login: (email: string, password: string) => Promise<object>,
 *   logout: () => void}}
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

/**
 * The signed-in user plus their client record (client name, plan, timezone).
 * Backed by `GET /auth/me`.
 * @returns {import('@tanstack/react-query').UseQueryResult<{user: object, client: object}>}
 */
export function useMe() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: me,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  })
}
