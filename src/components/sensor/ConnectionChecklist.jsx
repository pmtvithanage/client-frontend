/**
 * "Connection checklist" section: each connection step with a pass/warn/fail
 * icon, its plain detail and a short fix tip when the step is not passing.
 * @module components/sensor/ConnectionChecklist
 */

import { CircleCheck, TriangleAlert, XCircle } from 'lucide-react'

import WidgetCard from '../dashboard/WidgetCard.jsx'
import { useChecklist } from '../../hooks/useSensor.js'

/** Icon, colours and screen-reader word per checklist status. */
const STATUS_STYLE = Object.freeze({
  ok: { icon: CircleCheck, cls: 'text-sev-low', word: 'Passed' },
  warning: { icon: TriangleAlert, cls: 'text-sev-medium', word: 'Needs attention' },
  fail: { icon: XCircle, cls: 'text-sev-high', word: 'Failed' },
})

export default function ConnectionChecklist() {
  const checklist = useChecklist()
  const rows = checklist.data?.data ?? []

  return (
    <WidgetCard
      title="Connection checklist"
      subtitle="Each step we can check from here, with a fix tip when something is wrong."
      isLoading={checklist.isLoading}
      isError={checklist.isError}
      error={checklist.error}
      onRetry={checklist.refetch}
      skeletonRows={4}
    >
      <ul className="space-y-3">
        {rows.map((row) => {
          const style = STATUS_STYLE[row.status] ?? STATUS_STYLE.fail
          const Icon = style.icon
          return (
            <li key={row.id} className="flex items-start gap-3">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.cls}`} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-text">
                  {row.label}
                  <span className="sr-only"> — {style.word}</span>
                </p>
                <p className="text-xs text-muted">{row.detail}</p>
                {row.status !== 'ok' ? (
                  <p className="mt-1 text-xs text-text">
                    <span className="font-medium">Fix:</span> {row.fix}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </WidgetCard>
  )
}
