import { formatDistanceToNow } from 'date-fns'
import { Wifi, WifiOff } from 'lucide-react'

import { useSensor } from '../../hooks/useSensor.js'

/** Short phrase for an ISO timestamp: `2 minutes ago`, or `unknown`. */
function lastSeenText(iso) {
  if (!iso) return 'unknown'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'unknown'
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * The sensor status pill: icon + `Online` / `Offline` + when it last reported.
 * This portal only ever has ONE sensor per client (AGENTS.md §1).
 * @param {{className?: string}} props
 */
export default function SensorStatus({ className = '' }) {
  const { data: sensor, isLoading, isError } = useSensor()

  if (isLoading) {
    return <span className={`text-xs text-muted ${className}`}>Checking sensor…</span>
  }
  if (isError || !sensor) return null

  const online = sensor.status === 'online'

  return (
    <span
      title={
        online
          ? `Sensor last reported ${lastSeenText(sensor.last_seen)}`
          : `Sensor has not reported since ${lastSeenText(sensor.last_seen)}`
      }
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${
        online
          ? 'border-sev-low/30 bg-sev-low/10 text-sev-low'
          : 'border-sev-high/30 bg-sev-high/10 text-sev-high'
      } ${className}`}
    >
      {online ? (
        <Wifi className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      {online ? 'Online' : 'Offline'}
      <span className="hidden font-normal text-muted sm:inline">
        · Last report {lastSeenText(sensor.last_seen)}
      </span>
    </span>
  )
}
