import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import SeverityBadge from '../common/SeverityBadge.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import { deviceIp, otherIp } from '../../utils/alerts.js'
import { formatWhen } from '../../utils/format.js'
import { categoryExplanation } from '../../utils/plainLanguage.js'

/** Row/card content shared by both layouts. */
function cellMeta(alert) {
  return {
    when: formatWhen(alert.ts),
    route: categoryExplanation(alert.category).what,
    flow: `${deviceIp(alert)} → ${otherIp(alert)}`,
  }
}

/**
 * The alert rows: a table on wide screens and stacked cards on phones
 * (one set of data, two layouts). The whole row is clickable, and the
 * category link is the keyboard entry point. `focusIndex` (from the j/k
 * shortcuts) outlines the highlighted row.
 * @param {{alerts: object[], focusIndex: number, onFocusRow: (index: number) => void}} props
 */
export default function AlertsList({ alerts, focusIndex, onFocusRow }) {
  const location = useLocation()
  const navigate = useNavigate()

  const open = (alert) => navigate({ pathname: `/alerts/${alert.id}`, search: location.search })

  return (
    <div className="relative rounded-xl border border-border bg-surface">
      {/* Phone: stacked cards */}
      <ul className="divide-y divide-border md:hidden">
        {alerts.map((alert, index) => {
          const meta = cellMeta(alert)
          const focus = index === focusIndex
          return (
            <li key={alert.id}>
              <Link
                to={{ pathname: `/alerts/${alert.id}`, search: location.search }}
                onFocus={() => onFocusRow(index)}
                className={`block px-4 py-3 hover:bg-surface-2 ${focus ? 'bg-surface-2 ring-1 ring-inset ring-accent' : ''}`}
                data-alert-row={index}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge tier={alert.severity_tier} />
                  <StatusBadge status={alert.status} />
                  <span className="ml-auto text-xs text-muted">{meta.when}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-text">{alert.category}</p>
                <p className="mt-0.5 text-xs text-muted">{meta.route}</p>
                <p className="mt-1 font-mono text-xs text-muted">{meta.flow}</p>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Desktop: table */}
      <table className="hidden w-full table-fixed border-collapse text-sm md:table">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted">
            <th scope="col" className="px-4 py-2.5 font-medium">When</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Risk</th>
            <th scope="col" className="px-4 py-2.5 font-medium">What happened</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Device → destination</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {alerts.map((alert, index) => {
            const meta = cellMeta(alert)
            const focus = index === focusIndex
            return (
              <tr
                key={alert.id}
                onClick={() => {
                  onFocusRow(index)
                  open(alert)
                }}
                className={`cursor-pointer hover:bg-surface-2 ${focus ? 'bg-surface-2 ring-1 ring-inset ring-accent' : ''}`}
                data-alert-row={index}
              >
                <td className="whitespace-nowrap px-4 py-2.5 align-top text-xs text-muted">{meta.when}</td>
                <td className="whitespace-nowrap px-4 py-2.5 align-top">
                  <SeverityBadge tier={alert.severity_tier} />
                </td>
                <td className="px-4 py-2.5 align-top">
                  <Link
                    to={{ pathname: `/alerts/${alert.id}`, search: location.search }}
                    onFocus={() => onFocusRow(index)}
                    onClick={(event) => event.stopPropagation()}
                    className="group inline-flex items-start gap-1 font-medium text-text hover:text-accent"
                  >
                    <span>
                      {alert.category}
                      <span className="mt-0.5 block max-w-md truncate text-xs font-normal text-muted">
                        {meta.route}
                      </span>
                    </span>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted group-hover:text-accent" aria-hidden="true" />
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 align-top font-mono text-xs text-muted">{meta.flow}</td>
                <td className="px-8 py-2.5 align-top">
                  <StatusBadge status={alert.status} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
