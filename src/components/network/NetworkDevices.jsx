/**
 * "Devices on your network" section: internal devices seen by the sensor with
 * first/last seen, alert counts and worst risk. Search and a "Has alerts"
 * filter narrow the list; selecting a device opens `<DevicePanel>`.
 * @module components/network/NetworkDevices
 */

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import DevicePanel from './DevicePanel.jsx'
import WidgetCard from '../dashboard/WidgetCard.jsx'
import SeverityBadge from '../common/SeverityBadge.jsx'
import { useDevices } from '../../hooks/useNetwork.js'
import { formatWhen } from '../../utils/format.js'

const TABLE_HEAD = Object.freeze(['Device', 'First seen', 'Last seen', 'Alerts', 'Worst risk'])

/** Worst-risk cell: badge with an icon, or plain text when the device is clean. */
function riskCell(tier) {
  if (tier) return <SeverityBadge tier={tier} showTier={false} />
  return <span className="text-xs text-muted">No alerts</span>
}

export default function NetworkDevices() {
  const devices = useDevices()
  const [query, setQuery] = useState('')
  const [onlyAlerts, setOnlyAlerts] = useState(false)
  const [selected, setSelected] = useState(null)

  const all = useMemo(() => devices.data?.data ?? [], [devices.data])
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return all.filter(
      (device) =>
        (!needle || device.ip.includes(needle) || device.hostname.toLowerCase().includes(needle)) &&
        (!onlyAlerts || device.alert_count > 0),
    )
  }, [all, query, onlyAlerts])

  const action = (
    <>
      <label className="relative">
        <span className="sr-only">Search devices by IP or hostname</span>
        <Search
          className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search IP or hostname"
          className="w-48 rounded-md border border-border bg-surface-2 py-1.5 pl-7 pr-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </label>
      <button
        type="button"
        aria-pressed={onlyAlerts}
        onClick={() => setOnlyAlerts((value) => !value)}
        className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
          onlyAlerts
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-border text-muted hover:bg-surface-2 hover:text-text'
        }`}
      >
        Has alerts
      </button>
    </>
  )

  return (
    <>
      <WidgetCard
        title="Devices on your network"
        subtitle="Every device your sensor has seen inside your site. Select one for its recent alerts."
        action={action}
        isLoading={devices.isLoading}
        isError={devices.isError}
        error={devices.error}
        onRetry={devices.refetch}
        isEmpty={!devices.isLoading && !devices.isError && all.length === 0}
        emptyTitle="No devices seen yet"
        emptyDescription="Devices appear here the first time your sensor sees them on your network."
        skeletonRows={6}
      >
        {rows.length === 0 ? (
          <p className="text-sm text-muted">No devices match your search.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    {TABLE_HEAD.map((label, index) => (
                      <th
                        key={label}
                        scope="col"
                        className={`py-2 pr-4 font-medium ${index > 2 ? 'text-right' : ''}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((device) => (
                    <tr
                      key={device.ip}
                      onClick={() => setSelected(device)}
                      className="cursor-pointer hover:bg-surface-2"
                    >
                      <td className="py-2.5 pr-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelected(device)
                          }}
                          className="text-left"
                        >
                          <span className="block font-medium text-text">{device.hostname}</span>
                          <span className="block font-mono text-xs text-muted">{device.ip}</span>
                        </button>
                      </td>
                      <td className="py-2.5 pr-4 text-muted">{formatWhen(device.first_seen)}</td>
                      <td className="py-2.5 pr-4 text-muted">{formatWhen(device.last_seen)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-text">
                        {device.alert_count}
                      </td>
                      <td className="py-2.5 text-right">{riskCell(device.worst_tier)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 md:hidden">
              {rows.map((device) => (
                <button
                  key={device.ip}
                  type="button"
                  onClick={() => setSelected(device)}
                  className="block w-full rounded-lg border border-border p-3 text-left hover:bg-surface-2"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-text">{device.hostname}</span>
                    {riskCell(device.worst_tier)}
                  </span>
                  <span className="block font-mono text-xs text-muted">{device.ip}</span>
                  <span className="mt-1 block text-xs text-muted">
                    First {formatWhen(device.first_seen)} · Last {formatWhen(device.last_seen)} ·{' '}
                    {device.alert_count} alerts
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              Showing {rows.length} of {all.length} devices
            </p>
          </>
        )}
      </WidgetCard>
      <DevicePanel device={selected} onClose={() => setSelected(null)} />
    </>
  )
}
