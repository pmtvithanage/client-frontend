import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { readSession } from '../../utils/session.js'

/**
 * Guards nested routes, redirecting unauthenticated users to `/login`.
 * The intended destination is kept in `location.state.from` so the login page
 * can send the user back after signing in.
 */
export default function ProtectedRoute() {
  const location = useLocation()
  const session = readSession()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
