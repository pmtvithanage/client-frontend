import { UserRound } from 'lucide-react'

import { ROLES } from '../constants/nav.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { readSession } from '../utils/session.js'

/**
 * `/account` — signed-in profile placeholder. Shows only what the token and
 * stored profile already contain; nothing about other clients or the SOC.
 */
export default function Account() {
  useDocumentTitle('Account')
  const session = readSession()
  const user = session?.user

  const rows = [
    { label: 'Name', value: user?.name || '—' },
    { label: 'Email', value: user?.email || '—' },
    { label: 'Role', value: user?.role === ROLES.OWNER ? 'Owner' : 'Member' },
    { label: 'Organisation', value: 'Your organisation' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Account</h1>
        <p className="text-sm text-muted">Your profile and access level.</p>
      </div>

      <dl className="max-w-xl divide-y rounded-xl border bg-surface">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="flex items-center gap-2 text-sm font-medium text-text">
              {row.label === 'Role' ? <UserRound className="h-4 w-4 text-muted" aria-hidden="true" /> : null}
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-sm text-muted">
        Team management and notification preferences are available to owners
        only.
      </p>
    </div>
  )
}
