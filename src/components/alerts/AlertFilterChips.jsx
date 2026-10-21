import { SEVERITY_ORDER } from '../../constants/severity.js'
import { ALERT_STATUS_LABEL, ALERT_STATUS_ORDER } from '../../constants/statuses.js'
import { severityName } from '../../utils/plainLanguage.js'

/** One toggle chip; selected state is never colour-only (`aria-pressed`). */
function Chip({ label, pressed, disabled, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onToggle}
      className={
        pressed
          ? 'rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent'
          : 'rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted hover:bg-surface-2 hover:text-text disabled:opacity-50'
      }
    >
      {label}
    </button>
  )
}

/**
 * Multi-select severity and status chips for the alerts list. Disabled (with
 * an explanation) while "Only needs attention" is on, because that toggle
 * owns these two filters.
 * @param {{severity: string[], status: string[], disabled?: boolean,
 *   onToggleSeverity: (tier: string) => void, onToggleStatus: (status: string) => void}} props
 */
export default function AlertFilterChips({
  severity,
  status,
  disabled = false,
  onToggleSeverity,
  onToggleStatus,
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <fieldset className="flex flex-wrap items-center gap-1.5" disabled={disabled}>
        <legend className="mr-1 text-xs font-medium text-muted">Risk</legend>
        {SEVERITY_ORDER.map((tier) => (
          <Chip
            key={tier}
            label={severityName(tier)}
            pressed={severity.includes(tier)}
            disabled={disabled}
            onToggle={() => onToggleSeverity(tier)}
          />
        ))}
      </fieldset>
      <fieldset className="flex flex-wrap items-center gap-1.5" disabled={disabled}>
        <legend className="mr-1 text-xs font-medium text-muted">Status</legend>
        {ALERT_STATUS_ORDER.map((value) => (
          <Chip
            key={value}
            label={ALERT_STATUS_LABEL[value]}
            pressed={status.includes(value)}
            disabled={disabled}
            onToggle={() => onToggleStatus(value)}
          />
        ))}
      </fieldset>
    </div>
  )
}
