import { useState } from 'react'
import { NotebookPen } from 'lucide-react'

import { useAddAlertNote } from '../../hooks/useAlerts.js'
import { useToast } from '../../hooks/useToast.js'
import { NOTE_MAX_LENGTH } from '../../constants/alerts.js'
import { formatWhenFull } from '../../utils/format.js'

/**
 * Client-visible notes on an alert: timestamp, author and body, plus an add
 * box. Only the account owner can add notes (AGENTS.md §5) — members see the
 * existing notes but no composer.
 * @param {{alert: object, isOwner: boolean}} props The alert with its `notes`.
 */
export default function AlertNotes({ alert, isOwner }) {
  const { toast } = useToast()
  const mutation = useAddAlertNote()
  const [body, setBody] = useState('')
  const notes = alert.notes ?? []

  const submit = (event) => {
    event.preventDefault()
    mutation.mutate(
      { id: alert.id, body: body.trim() },
      {
        onSuccess: () => {
          setBody('')
          toast('Note added.', { tone: 'success' })
        },
        onError: (error) => toast(error?.message || 'We could not save that note.', { tone: 'error' }),
      },
    )
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-text">
        <NotebookPen className="h-4 w-4 text-accent" aria-hidden="true" />
        Notes
      </h2>
      {notes.length ? (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg bg-surface-2 p-3">
              <p className="whitespace-pre-wrap text-sm text-text">{note.body}</p>
              <p className="mt-1.5 text-xs text-muted">
                {note.author} · {formatWhenFull(note.created_at)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No notes yet.</p>
      )}

      {isOwner ? (
        <form onSubmit={submit} className="mt-4">
          <label className="text-sm">
            <span className="text-muted">Add a note for your team</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={2}
              maxLength={NOTE_MAX_LENGTH}
              placeholder="e.g. Checked with the office — this was a planned scan."
              className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-2 text-sm text-text placeholder:text-muted"
            />
          </label>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs text-muted">
              {body.length}/{NOTE_MAX_LENGTH} characters
            </span>
            <button
              type="submit"
              disabled={mutation.isPending || !body.trim()}
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
            >
              {mutation.isPending ? 'Saving…' : 'Add note'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
