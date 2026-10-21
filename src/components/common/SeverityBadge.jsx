import { Circle, CircleAlert, ShieldAlert, Siren } from 'lucide-react'

import { severityName } from '../../utils/plainLanguage.js'

/**
 * Severity tiers never rely on colour alone: every badge carries an icon, the
 * friendly name (`Minor … Urgent`) and the raw tier (`LOW … CRITICAL`).
 * @type {Readonly<Record<string, {icon: React.ElementType, cls: string}>>}
 */
const TIER_STYLE = Object.freeze({
  LOW: { icon: Circle, cls: 'border-sev-low/30 bg-sev-low/10 text-sev-low' },
  MEDIUM: { icon: CircleAlert, cls: 'border-sev-medium/30 bg-sev-medium/10 text-sev-medium' },
  HIGH: { icon: ShieldAlert, cls: 'border-sev-high/30 bg-sev-high/10 text-sev-high' },
  CRITICAL: { icon: Siren, cls: 'border-sev-critical/30 bg-sev-critical/10 text-sev-critical' },
})

/**
 * Severity badge: icon + friendly name + tier.
 * @param {{tier: string, showTier?: boolean, className?: string}} props
 *   `showTier` (default `true`) adds the raw tier after the friendly name.
 */
export default function SeverityBadge({ tier, showTier = true, className = '' }) {
  const style = TIER_STYLE[tier] ?? TIER_STYLE.LOW
  const Icon = style.icon

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${style.cls} ${className}`}
      title={showTier ? `${severityName(tier)} (${tier})` : severityName(tier)}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{severityName(tier)}</span>
      {showTier ? <span className="text-[10px] font-semibold uppercase">{tier}</span> : null}
    </span>
  )
}
