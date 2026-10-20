import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth.js'
import { roleLabel } from '../../utils/roles.js'
import ConfirmDialog from '../common/ConfirmDialog.jsx'

/**
 * Account menu in the top bar: name, email and role, plus `Log out` behind a
 * confirmation dialog. The menu closes on Escape or an outside click.
 */
export default function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const name = user?.name ?? 'Signed in'
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 hover:bg-surface-2"
      >
        <span
          aria-hidden="true"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent"
        >
          {initial}
        </span>
        <span className="hidden max-w-32 truncate text-sm text-text sm:block">{name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-40 mt-1 w-56 rounded-md border border-border bg-surface p-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium text-text">{name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
              {roleLabel(user?.role)}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              setConfirming(true)
            }}
            className="mt-1 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-text hover:bg-surface-2"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirming}
        title="Log out of the portal?"
        description="You will need your email and password to sign back in."
        confirmLabel="Log out"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirming(false)
          logout()
        }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}
