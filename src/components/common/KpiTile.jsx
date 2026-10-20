/**
 * One number with its label, an optional icon and an optional foot note — the
 * tile row used at the top of most pages.
 * @param {{label: string, value: string|number, hint?: string, icon?: React.ElementType,
 *   tone?: 'default'|'good'|'attention', className?: string}} props
 */
export default function KpiTile({ label, value, hint, icon: Icon, tone = 'default', className = '' }) {
  const valueTone =
    tone === 'good' ? 'text-sev-low' : tone === 'attention' ? 'text-sev-high' : 'text-text'

  return (
    <div className={`rounded-xl border border-border bg-surface p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        {Icon ? (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-muted"
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${valueTone}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  )
}
