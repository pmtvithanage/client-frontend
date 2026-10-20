import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useAuth } from '../hooks/useAuth.js'

/**
 * Demo accounts. Clicking one only FILLS the form — signing in always goes
 * through the `api/auth.js` `login()` path with whatever is in the fields.
 */
const DEMO_ACCOUNTS = [
  { label: 'Acme Textiles — Owner', email: 'owner@acme.test', password: 'owner' },
  { label: 'Acme Textiles — Member', email: 'member@acme.test', password: 'member' },
  { label: 'Lanka Logistics — Owner', email: 'owner@lanka.test', password: 'owner' },
  { label: 'Lanka Logistics — Member', email: 'member@lanka.test', password: 'member' },
  { label: 'Sunrise Hospital — Owner', email: 'owner@sunrise.test', password: 'owner' },
  { label: 'Sunrise Hospital — Member', email: 'member@sunrise.test', password: 'member' },
]

/**
 * `/login` — the only public page. Email + password form, with demo buttons
 * that prefill the fields for each seeded client and role.
 */
export default function Login() {
  useDocumentTitle('Sign in')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from || '/'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.message || 'We could not sign you in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function fillForm(account) {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-8">
      <main className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15"
          >
            <ShieldCheck className="h-5 w-5 text-accent" />
          </span>
          <div>
            <p className="text-sm font-semibold text-text">NIDS Client Portal</p>
            <p className="text-xs text-muted">Sign in to see your own sensor</p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm"
        >
          <div>
            <label htmlFor="login-email" className="mb-1 block text-xs font-medium text-muted">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-xs font-medium text-muted">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text"
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-md bg-sev-critical/10 px-3 py-2 text-sm text-sev-critical">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <section className="mt-5 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text">Demo accounts</h2>
          <p className="mt-1 text-xs text-muted">
            Fills the form above — then press <span className="font-medium">Sign in</span>.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillForm(account)}
                className={`rounded-md border px-2 py-1.5 text-left text-xs transition-colors ${
                  email === account.email
                    ? 'border-accent/50 bg-accent/10 text-accent'
                    : 'border-border text-muted hover:bg-surface-2 hover:text-text'
                }`}
              >
                {account.label}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
