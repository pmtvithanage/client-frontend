/**
 * Simple toggle switch (never colour-only; includes text state).
 * @param {{id: string, checked: boolean, onChange: (checked: boolean) => void,
 *   label: string, description?: string, disabled?: boolean}} props
 */
export default function ToggleSwitch({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start justify-between gap-4 rounded-lg border border-border bg-surface p-3 ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        {description ? <p className="text-xs text-muted">{description}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">{checked ? 'On' : 'Off'}</span>
        <span
          aria-hidden="true"
          className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
            checked ? 'bg-accent' : 'bg-surface-2'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </span>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
      </div>
    </label>
  )
}
