import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { ROLES } from '../constants/nav.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { createDemoSession, readSession } from '../utils/session.js'

/** Demo profiles used until the real auth API is switched on. */
const DEMO_ACCOUNTS = [
  {
    label: 'Sign in as owner',
    role: ROLES.OWNER,
    name: 'Amara Perera',
    email: 'owner@acmetextiles.lk',
    client_id: 'client_acme_textiles',
  },
  {
    label: 'Sign in as member',
    role: ROLES.MEMBER,
    name: 'Nuwan Silva',
    email: 'member@acmetextiles.lk',
    client_id: 'client_acme_textiles',
  },
]

/**
 * `/login` — the only public page. Until `src/api/auth.js` has a real endpoint
 * this creates a demo session whose token carries the client id, exactly the
 * way the production JWT will.
 */
export default function Login() {
  useDocumentTitle('Sign in')
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const from = location.state?.from?.pathname || '/'

  if (readSession()) {
    return <Navigate to="/" replace />
  }

  /** @param {typeof DEMO_ACCOUNTS[number]} account */
  function signIn(account) {
    try {
      createDemoSession(account)
      navigate(from, { replace: true })
    } catch {
      setError('We could not sign you in. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <main className="w-full max-w-sm rounded-xl border bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2" aria-hidden="true">
            <ShieldCheck className="h-5 w-5 text-accent" />
          </span>
          <div>
            <p className="text-sm font-semibold text-text">NIDS Client Portal</p>
            <p className="text-xs text-muted">Sign in to see your own sensor</p>
          </div>
        </div>

        <div className="space-y-3">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              onClick={() => signIn(account)}
              className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
            >
              {account.label}
            </button>
          ))}
        </div>

        {error ? (
          <p role="alert" className="mt-4 rounded-md bg-surface-2 px-3 py-2 text-sm text-sev-critical">
            {error}
          </p>
        ) : null}

        <p className="mt-6 text-xs text-muted">
          Demo sign-in only. The real email and password check is switched on
          when the backend is connected.
        </p>
      </main>
    </div>
  )
}
