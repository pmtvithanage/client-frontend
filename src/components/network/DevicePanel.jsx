/**
 * Slide-over panel for one device on the client's network: quick facts, its
 * recent alerts and the destinations it talks to most. Opens on the right,
 * takes focus, closes on Escape, the backdrop or the close button.
 * @module components/network/DevicePanel
 */

import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import { useAlerts } from '../../hooks/useAlerts.js'
import { formatWhen } from '../../utils/format.js'
import { otherIp } from '../../utils/alerts.js'
import { DEVICE_DEST_LIMIT, DEVICE_RECENT_LIMIT, geoForIp } from '../../constants/network.js'

/**
 * Side panel for a device row. The alert query runs only while the panel is
 * open; rows are matched exactly on the device address (the API `q` search is
 * a substring match, so `192.168.8.1` would also hit `.10`).
 * @param {{device: {ip: string, hostname: string, first_seen: string,
 *   last_seen: string, alert_count: number, worst_tier: string|null}|null,
 *   onClose: () => void}} props Selected device (null closes the panel).
 */
export default function DevicePanel({ device, onClose }) {
  const open = Boolean(device)
  const ip = device?.ip ?? ''
  const alerts = useAlerts({ q: ip, sort: 'ts:desc', limit: 100 }, { enabled: open })
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const rows = useMemo(
    () => (alerts.data?.data ?? []).filter((a) => a.src_ip === ip || a.dst_ip === ip),
    [alerts.data, ip],
  )

  const destinations = useMemo(() => {
    const counts = new Map()
    for (const alert of rows) {
      const other = otherIp(alert)
      if (!other) continue
      counts.set(other, (counts.get(other) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, DEVICE_DEST_LIMIT)
      .map(([destIp, count]) => ({ ip: destIp, count, geo: geoForIp(destIp) }))
  }, [rows])

  if (!open) return null
  const recent = rows.slice(0, DEVICE_RECENT_LIMIT)

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close device details"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Device details for ${device.hostname}`}
        className="relative flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-l border-border bg-surface p-4 shadow-xl"
      >
        <header className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-text">{device.hostname}</h2>
            <p className="font-mono text-xs text-muted">{device.ip}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close device details"
            className="rounded-md border border-border p-1.5 text-muted hover:bg-surface-2 hover:text-text"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-muted">First seen</dt>
            <dd className="text-sm text-text">{formatWhen(device.first_seen)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Last seen</dt>
            <dd className="text-sm text-text">{formatWhen(device.last_seen)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Alerts</dt>
            <dd className="text-sm text-text">{device.alert_count}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Worst risk</dt>
            <dd>
              {device.worst_tier ? (
                <SeverityBadge tier={device.worst_tier} showTier={false} />
              ) : (
                <span className="text-sm text-muted">No alerts</span>
              )}
            </dd>
          </div>
        </dl>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-text">Recent alerts</h3>
          {alerts.isLoading ? <LoadingSkeleton rows={3} /> : null}
          {alerts.isError ? <ErrorState error={alerts.error} onRetry={alerts.refetch} /> : null}
          {!alerts.isLoading && !alerts.isError && recent.length === 0 ? (
            <p className="text-sm text-muted">No recent alerts for this device.</p>
          ) : null}
          {!alerts.isLoading && !alerts.isError && recent.length > 0 ? (
            <ul className="space-y-2">
              {recent.map((alert) => (
                <li key={alert.id}>
                  <Link
                    to={`/alerts/${alert.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-text">{alert.category}</span>
                      <span className="text-xs text-muted">{formatWhen(alert.ts)}</span>
                    </span>
                    <span className="flex shrink-0 gap-1">
                      <SeverityBadge tier={alert.severity_tier} showTier={false} />
                      <StatusBadge status={alert.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-text">Top destinations</h3>
          {!alerts.isLoading && !alerts.isError && destinations.length === 0 ? (
            <p className="text-sm text-muted">No destinations recorded for this device.</p>
          ) : null}
          {destinations.length > 0 ? (
            <ul className="space-y-2">
              {destinations.map((dest) => (
                <li key={dest.ip}>
                  <Link
                    to={`/alerts?q=${encodeURIComponent(dest.ip)}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-xs text-accent">{dest.ip}</span>
                      <span className="text-xs text-muted">
                        {dest.geo ? `${dest.geo.org} · ${dest.geo.country}` : 'Unknown location'}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{dest.count} alerts</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </aside>
    </div>
  )
}
