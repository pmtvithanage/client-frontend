/**
 * "Where your traffic goes" section: the top external destinations in this
 * client's traffic (organisation/country when known), a bar of alerts per
 * destination and links into the Alerts page filtered to each address.
 * @module components/network/NetworkDestinations
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import WidgetCard from '../dashboard/WidgetCard.jsx'
import { useDestinations } from '../../hooks/useNetwork.js'
import { resolveCssVar } from '../../utils/dygraph.js'

const CHART_HEIGHT = 260
const CHART_MARGIN = Object.freeze({ top: 0, right: 12, bottom: 0, left: 0 })

export default function NetworkDestinations() {
  const destinations = useDestinations()
  const rows = useMemo(() => destinations.data?.data ?? [], [destinations.data])

  const chartData = useMemo(
    () => rows.map((row) => ({ label: row.org ?? row.ip, alerts: row.alert_count, ip: row.ip })),
    [rows],
  )

  const accent = resolveCssVar('--accent')
  const muted = resolveCssVar('--muted')
  const surface = resolveCssVar('--surface-2')
  const text = resolveCssVar('--text')

  return (
    <WidgetCard
      title="Where your traffic goes"
      subtitle="The outside addresses your network talks to most."
      isLoading={destinations.isLoading}
      isError={destinations.isError}
      error={destinations.error}
      onRetry={destinations.refetch}
      isEmpty={!destinations.isLoading && !destinations.isError && rows.length === 0}
      emptyTitle="No outside destinations yet"
      emptyDescription="When your network reaches the internet, the addresses it talks to appear here."
      skeletonRows={5}
    >
      <div className="mb-4">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={chartData} layout="vertical" margin={CHART_MARGIN} barCategoryGap="24%">
            <CartesianGrid horizontal={false} stroke={muted} strokeDasharray="3 3" />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: muted, fontSize: 11 }}
              axisLine={{ stroke: muted }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={130}
              tick={{ fill: text, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: surface }}
              contentStyle={{
                backgroundColor: surface,
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: text,
              }}
              formatter={(value) => [`${value} alerts`, 'Alerts']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="alerts" fill={accent} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th scope="col" className="py-2 pr-4 font-medium">Destination</th>
              <th scope="col" className="py-2 pr-4 font-medium">Country</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">Flows</th>
              <th scope="col" className="py-2 text-right font-medium">Alerts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.ip} className="hover:bg-surface-2">
                <td className="py-2.5 pr-4">
                  <Link
                    to={`/alerts?q=${encodeURIComponent(row.ip)}`}
                    className="font-mono text-xs text-accent hover:underline"
                  >
                    {row.ip}
                  </Link>
                  {row.org ? <span className="block text-xs text-muted">{row.org}</span> : null}
                </td>
                <td className="py-2.5 pr-4 text-muted">{row.country ?? '—'}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-muted">
                  {row.flow_count.toLocaleString()}
                </td>
                <td className="py-2.5 text-right tabular-nums text-text">{row.alert_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">
        Select a destination to see every alert involving it.
      </p>
    </WidgetCard>
  )
}
