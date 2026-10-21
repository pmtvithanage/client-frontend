import { useMemo } from 'react'
import { Activity, ShieldAlert, Siren, Wifi, WifiOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import ErrorState from '../common/ErrorState.jsx'
import KpiTile from '../common/KpiTile.jsx'
import { useAlerts } from '../../hooks/useAlerts.js'
import { useOverview } from '../../hooks/useOverview.js'
import { useSensor } from '../../hooks/useSensor.js'
import { HOUR_MS, KPI_TILE_COUNT, RECENT_HOURS } from '../../constants/dashboard.js'
import { deltaPhrase } from '../../utils/dashboard.js'

/**
 * The four dashboard KPIs: open Urgent / Serious counts, alerts in the last
 * 24 hours versus the previous 24, and the sensor status with last report.
 * The two 24-hour windows are fixed by `anchor` (set by Refresh) so the delta
 * cannot drift while the page sits open.
 * @param {{anchor: number}} props Window anchor in ms.
 */
export default function KpiRow({ anchor }) {
  const overview = useOverview()
  const sensor = useSensor()

  const recentParams = useMemo(
    () => ({
      from: new Date(anchor - RECENT_HOURS * HOUR_MS).toISOString(),
      to: new Date(anchor).toISOString(),
      limit: 1,
      sort: 'ts:desc',
    }),
    [anchor],
  )
  const previousParams = useMemo(
    () => ({
      from: new Date(anchor - 2 * RECENT_HOURS * HOUR_MS).toISOString(),
      to: new Date(anchor - RECENT_HOURS * HOUR_MS).toISOString(),
      limit: 1,
      sort: 'ts:desc',
    }),
    [anchor],
  )
  const recent = useAlerts(recentParams)
  const previous = useAlerts(previousParams)

  if (overview.isError) {
    return <ErrorState error={overview.error} onRetry={overview.refetch} />
  }

  if (overview.isLoading || sensor.isLoading || recent.isLoading || previous.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" role="status" aria-label="Loading">
        {Array.from({ length: KPI_TILE_COUNT }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-surface-2" />
        ))}
      </div>
    )
  }

  const counts = overview.data?.security_score?.counts ?? {}
  const total = recent.data?.meta.total
  const previousTotal = previous.data?.meta.total
  const delta =
    total !== undefined && previousTotal !== undefined
      ? deltaPhrase(total, previousTotal)
      : 'Counting the previous 24 hours…'
  const online = sensor.data?.status === 'online'
  const lastSeen = sensor.data?.last_seen

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiTile
        label="Urgent open"
        value={counts.urgent ?? 0}
        hint="Still-open alerts marked Urgent"
        icon={Siren}
        tone={counts.urgent > 0 ? 'attention' : 'default'}
      />
      <KpiTile
        label="Serious open"
        value={counts.serious ?? 0}
        hint="Still-open alerts marked Serious"
        icon={ShieldAlert}
        tone={counts.serious > 0 ? 'attention' : 'default'}
      />
      <KpiTile label="Alerts last 24 hours" value={total ?? '—'} hint={delta} icon={Activity} />
      <KpiTile
        label="Sensor status"
        value={online ? 'Online' : 'Offline'}
        hint={
          lastSeen
            ? `Last report ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
            : 'Waiting for the first report'
        }
        icon={online ? Wifi : WifiOff}
        tone={online ? 'good' : 'attention'}
      />
    </div>
  )
}
