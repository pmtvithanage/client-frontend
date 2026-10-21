/**
 * Sensor status card: name, location, version, Online/Offline with icon and
 * text, last seen (relative and absolute), events per minute and the plain
 * health verdict with its rule in an InfoTip.
 * @module components/sensor/SensorStatusCard
 */

import { CircleCheck, TriangleAlert, Wifi, WifiOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import WidgetCard from '../dashboard/WidgetCard.jsx'
import InfoTip from '../common/InfoTip.jsx'
import { useSensor } from '../../hooks/useSensor.js'
import { formatWhenFull } from '../../utils/format.js'
import { healthVerdict } from '../../utils/sensor.js'
import { HEALTH_RULE, HEALTH_VERDICT_LABEL } from '../../constants/sensor.js'

/** Icon + colours per verdict — never colour alone (icon and word always shown). */
const VERDICT_STYLE = Object.freeze({
  healthy: { icon: CircleCheck, cls: 'border-sev-low/30 bg-sev-low/10 text-sev-low' },
  degraded: { icon: TriangleAlert, cls: 'border-sev-medium/30 bg-sev-medium/10 text-sev-medium' },
  offline: { icon: WifiOff, cls: 'border-sev-high/30 bg-sev-high/10 text-sev-high' },
})

/** `2 minutes ago`, or `unknown` when the timestamp cannot be read. */
function agoText(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'unknown'
  return formatDistanceToNow(date, { addSuffix: true })
}

export default function SensorStatusCard() {
  const sensor = useSensor()
  const data = sensor.data
  const online = data?.status === 'online'
  const verdict = data ? healthVerdict(data) : 'offline'
  const verdictStyle = VERDICT_STYLE[verdict]
  const VerdictIcon = verdictStyle.icon

  return (
    <WidgetCard
      title="Sensor status"
      subtitle="The one sensor watching your network."
      action={
        data ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
              online
                ? 'border-sev-low/30 bg-sev-low/10 text-sev-low'
                : 'border-sev-high/30 bg-sev-high/10 text-sev-high'
            }`}
          >
            {online ? (
              <Wifi className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            {online ? 'Online' : 'Offline'}
          </span>
        ) : null
      }
      isLoading={sensor.isLoading}
      isError={sensor.isError}
      error={sensor.error}
      onRetry={sensor.refetch}
      isEmpty={!sensor.isLoading && !sensor.isError && !data}
      emptyTitle="No sensor connected"
      emptyDescription="Pair a sensor below to start collecting alerts."
      skeletonRows={4}
    >
      <div>
        <h3 className="text-base font-semibold text-text">{data.name}</h3>
        <p className="text-sm text-muted">{data.location}</p>
        <p className="mt-0.5 font-mono text-xs text-muted">{data.version}</p>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted">Last seen</dt>
          <dd className="text-sm text-text">{agoText(data.last_seen)}</dd>
          <dd className="text-xs text-muted">
            <time dateTime={data.last_seen}>{formatWhenFull(data.last_seen)}</time>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Events per minute</dt>
          <dd className="text-sm tabular-nums text-text">{data.events_per_min.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-xs text-muted">
            Health
            <InfoTip text={HEALTH_RULE} />
          </dt>
          <dd>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${verdictStyle.cls}`}
            >
              <VerdictIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {HEALTH_VERDICT_LABEL[verdict]}
            </span>
          </dd>
        </div>
      </dl>
    </WidgetCard>
  )
}
