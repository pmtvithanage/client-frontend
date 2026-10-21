import { Network, Timer } from 'lucide-react'

import CopyButton from '../common/CopyButton.jsx'
import { PORT_SERVICE, UNKNOWN_SERVICE } from '../../constants/network.js'
import { deviceIp, otherIp, directionLabel } from '../../utils/alerts.js'
import { formatBytes, formatDuration, formatWhenFull } from '../../utils/format.js'

/** One label/value row; `copy` adds a copy button for addresses/ids. */
function Fact({ label, value, copy }) {
  if (value == null || value === '') return null
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1 text-sm text-text">
        <span className="break-all">{value}</span>
        {copy ? <CopyButton value={copy} title={`Copy ${label.toLowerCase()}`} /> : null}
      </dd>
    </div>
  )
}

/**
 * "Traffic facts": the practical details of the flow in friendly units —
 * device, destination (with its service name), port, protocol, direction,
 * duration, size, and the destination's country/organisation when known.
 * @param {{alert: object}} props The client-safe alert.
 */
export default function TrafficFacts({ alert }) {
  const device = deviceIp(alert)
  const destination = otherIp(alert)
  const service = PORT_SERVICE[alert.dst_port] ?? UNKNOWN_SERVICE
  const place = [alert.dst_org, alert.dst_country].filter(Boolean).join(' · ')

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-text">
        <Network className="h-4 w-4 text-accent" aria-hidden="true" />
        Traffic facts
      </h2>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label="Device" value={device} copy={device} />
        <Fact label="Destination" value={destination} copy={destination} />
        <Fact label="Port" value={`Port ${alert.dst_port} (${service})`} />
        <Fact label="Protocol" value={alert.protocol} />
        <Fact label="Direction" value={directionLabel(alert.direction)} />
        <Fact label="When" value={formatWhenFull(alert.ts)} />
        <Fact label="How long it lasted" value={formatDuration(alert.duration_ms)} />
        <Fact label="How much data" value={formatBytes(alert.bytes)} />
        <Fact label="Where the destination belongs" value={place} />
        <Fact label="Reference" value={alert.id} copy={alert.id} />
      </dl>
      <p className="mt-3 flex items-center gap-1 text-xs text-muted">
        <Timer className="h-3.5 w-3.5" aria-hidden="true" />
        Durations and sizes are rounded readings from your sensor.
      </p>
    </section>
  )
}
