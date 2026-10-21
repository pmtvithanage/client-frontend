import { UserRound } from 'lucide-react'

import TeamManager from '../components/account/TeamManager.jsx'
import ToggleSwitch from '../components/common/ToggleSwitch.jsx'
import { ROLES } from '../constants/nav.js'
import { TIMEZONES } from '../constants/timezones.js'
import { useAuth } from '../hooks/useAuth.js'
import { useMe } from '../hooks/useAuth.js'
import { useAccountPrefs } from '../hooks/useAccountPrefs.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useTheme } from '../hooks/useTheme.js'

/**
 * `/account` — profile (read-only), client details, theme/timezone preferences,
 * and team management.
 */
export default function Account() {
  useDocumentTitle('Account')
  const { data: me } = useMe()
  const { isOwner } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { timezone, setTimezone } = useAccountPrefs(me?.client?.timezone)

  const user = me?.user
  const client = me?.client

  const rows = [
    { label: 'Name', value: user?.name || '—' },
    { label: 'Email', value: user?.email || '—' },
    { label: 'Role', value: user?.role === ROLES.OWNER ? 'Owner' : 'Member' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Account</h1>
        <p className="text-sm text-muted">Your profile, preferences and access level.</p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text">Profile</h2>
        <dl className="mt-3 divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-2">
              <dt className="text-sm text-muted">{row.label}</dt>
              <dd className="flex items-center gap-2 text-sm text-text">
                {row.label === 'Role' ? <UserRound className="h-4 w-4 text-muted" aria-hidden="true" /> : null}
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text">Client details</h2>
        <dl className="mt-3 divide-y divide-border">
          <div className="flex items-center justify-between gap-4 py-2">
            <dt className="text-sm text-muted">Name</dt>
            <dd className="text-sm text-text">{client?.name || '—'}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <dt className="text-sm text-muted">Plan</dt>
            <dd className="text-sm text-text">{client?.plan || '—'}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <dt className="text-sm text-muted">Timezone</dt>
            <dd>
              <select
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                className="rounded-md border border-border bg-surface-2 px-2 py-1 text-sm text-text"
              >
                {TIMEZONES.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
              </select>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <dt className="text-sm text-muted">Contact email</dt>
            <dd className="text-sm text-text">{user?.email || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text">Preferences</h2>
        <div className="mt-3">
          <ToggleSwitch
            id="account-theme"
            checked={!isDark}
            label="Light theme"
            description="Switch between dark and light mode. Stored locally."
            onChange={() => toggleTheme()}
          />
        </div>
      </section>

      <TeamManager disabled={!isOwner} />
    </div>
  )
}
