import { useEffect, useId, useRef, useState } from 'react'
import { CircleHelp } from 'lucide-react'

/**
 * A small `?` control that opens a plain-English explanation popover.
 * Opens on click (keyboard-reachable), closes on Escape or an outside click.
 * @param {{text?: string, label?: string, children?: React.ReactNode,
 *   className?: string}} props `children` wins over `text` when both are given;
 *   `label` shows a visible button caption and replaces the default
 *   `What does this mean?` accessible name.
 */
export default function InfoTip({ text, label, children, className = '' }) {
  const [open, setOpen] = useState(false)
  const id = useId()
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

  const body = children ?? text

  return (
    <span ref={wrapRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label={label ?? 'What does this mean?'}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
        className={
          label
            ? 'inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-accent hover:bg-surface-2'
            : 'rounded-full p-0.5 text-muted hover:bg-surface-2 hover:text-text'
        }
      >
        <CircleHelp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {label ? <span>{label}</span> : null}
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-full z-40 mt-1 w-60 rounded-md border border-border bg-surface-2 p-3 text-xs leading-relaxed text-muted shadow-lg"
        >
          {body}
        </span>
      ) : null}
    </span>
  )
}
