import { Check, CheckCircle2, CircleDot, Eye } from 'lucide-react'

import { ALERT_STATUS_LABEL } from '../../constants/statuses.js'

/**
 * Status badges: icon + label, never colour alone.
 * @type {Readonly<Record<string, {icon: React.ElementType, cls: string}>>}
 */
const STATUS_STYLE = Object.freeze({
  new: { icon: CircleDot, cls: 'border-accent/40 bg-accent/10 text-accent' },
  acknowledged: { icon: Check, cls: 'border-border bg-surface-2 text-muted' },
  expected: { icon: Eye, cls: 'border-sev-medium/30 bg-sev-medium/10 text-sev-medium' },
  resolved: { icon: CheckCircle2, cls: 'border-sev-low/30 bg-sev-low/10 text-sev-low' },
})

/**
 * Alert status badge (`New`, `Acknowledged`, `Expected`, `Resolved`).
 * @param {{status: string, className?: string}} props
 */
export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.acknowledged
  const Icon = style.icon

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${style.cls} ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{ALERT_STATUS_LABEL[status] ?? status}</span>
    </span>
  )
}
