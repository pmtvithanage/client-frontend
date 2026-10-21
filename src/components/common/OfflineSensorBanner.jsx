/**
 * Banner shown on the Dashboard and the Sensor page while the client's ONE
 * sensor is offline: when it was last seen and that alerts are paused.
 * @module components/common/OfflineSensorBanner
 */

import { WifiOff } from 'lucide-react'

import { useSensor } from '../../hooks/useSensor.js'
import { formatWhenFull } from '../../utils/format.js'

export default function OfflineSensorBanner() {
  const { data: sensor, isLoading } = useSensor()

  if (isLoading || !sensor || sensor.status !== 'offline') return null

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-sev-high/40 bg-sev-high/10 p-4"
    >
      <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-sev-high" aria-hidden="true" />
      <p className="text-sm text-text">
        Your sensor has been offline since{' '}
        <time dateTime={sensor.last_seen} className="font-medium">
          {formatWhenFull(sensor.last_seen)}
        </time>
        . Alerts are not being collected.
      </p>
    </div>
  )
}
