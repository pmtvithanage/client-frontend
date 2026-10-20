import { Check, Info, TriangleAlert, X } from 'lucide-react'

/**
 * Icon per toast tone — tone is never communicated by colour alone.
 * @type {Readonly<Record<string, {icon: React.ElementType, label: string}>>}
 */
const TONE = Object.freeze({
  success: { icon: Check, label: 'Success' },
  error: { icon: TriangleAlert, label: 'Error' },
  info: { icon: Info, label: 'Note' },
})

/**
 * A single toast message in the bottom-right stack.
 * @param {{toast: {id: string, message: string, tone: string}, onDismiss: (id: string) => void}} props
 */
export default function Toast({ toast, onDismiss }) {
  const { icon: Icon, label } = TONE[toast.tone] ?? TONE.info

  return (
    <div className="flex w-72 items-start gap-2 rounded-lg border border-border bg-surface p-3 shadow-lg">
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          toast.tone === 'error'
            ? 'bg-sev-high/15 text-sev-high'
            : toast.tone === 'success'
              ? 'bg-sev-low/15 text-sev-low'
              : 'bg-accent/15 text-accent'
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="sr-only">{label}: </span>
        <p className="text-sm text-text">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss message"
        className="rounded p-0.5 text-muted hover:bg-surface-2 hover:text-text"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
