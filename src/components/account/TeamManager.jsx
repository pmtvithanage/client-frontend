import { useState } from 'react'

import ConfirmDialog from '../common/ConfirmDialog.jsx'
import WidgetCard from '../dashboard/WidgetCard.jsx'
import { INVITE_STATUS_LABEL, TEAM_ROLE_LABEL, TEAM_ROLES } from '../../constants/team.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import {
  useInviteMember,
  useMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from '../../hooks/useTeam.js'

/**
 * Team table and invite/change/remove (owner only; members see read-only note).
 * @param {{disabled: boolean}} props
 */
export default function TeamManager({ disabled }) {
  const { user } = useAuth()
  const { data } = useMembers()
  const invite = useInviteMember()
  const changeRole = useUpdateMemberRole()
  const remove = useRemoveMember()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'member' })
  const [error, setError] = useState('')
  const [toRemove, setToRemove] = useState(null)

  const members = data?.data ?? []

  const submitInvite = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await invite.mutateAsync(form)
      toast('Invitation sent.', { tone: 'success' })
      setForm({ name: '', email: '', role: 'member' })
      setOpen(false)
    } catch (err) {
      setError(err?.message ?? 'Could not invite this person.')
    }
  }

  const updateRole = async (email, role) => {
    try {
      await changeRole.mutateAsync({ email, role })
      toast('Role updated.', { tone: 'success' })
    } catch (err) {
      toast(err?.message ?? 'Could not update role.', { tone: 'error' })
    }
  }

  const deleteMember = async () => {
    if (!toRemove) return
    try {
      await remove.mutateAsync(toRemove)
      toast('Member removed.', { tone: 'success' })
      setToRemove(null)
    } catch (err) {
      toast(err?.message ?? 'Could not remove this person.', { tone: 'error' })
    }
  }

  return (
    <WidgetCard title="Team" subtitle="People with access to this account.">
      {disabled ? (
        <p className="text-sm text-muted">Only the account owner can manage the team.</p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Status</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.email} className="border-b border-border last:border-b-0">
                <td className="py-2 text-text">{member.name}</td>
                <td className="py-2 text-muted">{member.email}</td>
                <td className="py-2">
                  {disabled ? (
                    <span className="text-text">{member.role === 'owner' ? 'Owner' : 'Member'}</span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={(event) => updateRole(member.email, event.target.value)}
                      disabled={member.email === user?.email}
                      className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-text disabled:opacity-60"
                    >
                      {TEAM_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role === 'owner' ? 'Owner' : 'Member'}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="py-2 text-muted">{INVITE_STATUS_LABEL[member.status]}</td>
                <td className="py-2 text-right">
                  {!disabled && member.email !== user?.email ? (
                    <button
                      type="button"
                      onClick={() => setToRemove(member.email)}
                      className="text-xs text-sev-critical hover:underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!disabled ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          Invite user
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
            className="w-full max-w-md rounded-xl border border-border bg-surface p-5"
          >
            <h3 id="invite-title" className="text-base font-semibold text-text">
              Invite user
            </h3>
            <form onSubmit={submitInvite} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted" htmlFor="invite-name">
                  Name
                </label>
                <input
                  id="invite-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted" htmlFor="invite-email">
                  Email
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted" htmlFor="invite-role">
                  Role
                </label>
                <select
                  id="invite-role"
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text"
                >
                  {TEAM_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role === 'owner' ? 'Owner' : 'Member'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted">{TEAM_ROLE_LABEL[form.role]}</p>
              </div>
              {error ? <p className="text-xs text-sev-critical">{error}</p> : null}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setError('')
                  }}
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={invite.isPending}
                  className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg disabled:opacity-60"
                >
                  {invite.isPending ? 'Inviting…' : 'Invite user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(toRemove)}
        title="Remove user"
        description={`Remove ${toRemove}? This cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        destructive
        busy={remove.isPending}
        onConfirm={deleteMember}
        onCancel={() => setToRemove(null)}
      />
    </WidgetCard>
  )
}
