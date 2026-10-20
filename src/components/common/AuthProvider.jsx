import { useCallback, useMemo, useState } from 'react'

import { login as apiLogin, logout as apiLogout } from '../../api/auth.js'
import { AuthContext } from '../../hooks/useAuth.js'
import { isOwner } from '../../utils/roles.js'
import { clearSession, readSession, saveSession } from '../../utils/session.js'

/**
 * Provides the session (`token` + `user`, persisted through the shared session
 * helpers so the dummy layer reads the same keys), `login`, `logout` and role
 * helpers.
 * @param {{children: React.ReactNode}} props
 */
export default function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  const login = useCallback(async (email, password) => {
    const result = await apiLogin(email, password)
    saveSession({ token: result.token, user: result.user })
    setSession({ token: result.token, user: result.user })
    return result
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    // Best-effort server sign-out; the local session is already gone.
    void apiLogout().catch(() => {})
  }, [])

  const value = useMemo(() => {
    const user = session?.user ?? null
    return {
      user,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      role: user?.role ?? null,
      isOwner: isOwner(user),
      login,
      logout,
    }
  }, [session, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
