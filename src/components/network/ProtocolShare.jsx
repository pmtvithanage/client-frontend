/**
 * "Ports and protocols" — protocol share section: a Recharts donut of how the
 * client's flagged traffic splits across protocols, with a legend that gives
 * each protocol a plain-language hint and its percentage of all alerts.
 * @module components/network/ProtocolShare
 */

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import WidgetCard from '../dashboard/WidgetCard.jsx'
import { useProtocols } from '../../hooks/useNetwork.js'
import {
  PROTOCOL_CHART_HEIGHT,
  PROTOCOL_COLOR_VARS,
  PROTOCOL_HINT,
  PROTOCOL_HINT_FALLBACK,
} from '../../constants/network.js'

export default function ProtocolShare() {
  const protocols = useProtocols()
  const rows = protocols.data?.data ?? []

  const chartData = rows.map((row) => ({
    name: row.protocol,
    value: row.share,
    alerts: row.alert_count,
  }))

  return (
    <WidgetCard
      title="Protocol share"
      subtitle="How much of your flagged traffic uses each protocol."
      isLoading={protocols.isLoading}
      isError={protocols.isError}
      error={protocols.error}
      onRetry={protocols.refetch}
      isEmpty={!protocols.isLoading && !protocols.isError && rows.length === 0}
      emptyTitle="No protocols to show yet"
      emptyDescription="Protocol shares appear here once your sensor flags traffic."
      skeletonRows={4}
    >
      <div style={{ height: PROTOCOL_CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={`var(${PROTOCOL_COLOR_VARS[index % PROTOCOL_COLOR_VARS.length]})`} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text)',
              }}
              formatter={(value, _name, item) => [
                `${value}% of alerts (${item.payload.alerts})`,
                item.payload.name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 space-y-2">
        {rows.map((row, index) => (
          <li key={row.protocol} className="flex items-start gap-2">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: `var(${PROTOCOL_COLOR_VARS[index % PROTOCOL_COLOR_VARS.length]})` }}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm text-text">
                <span className="font-medium">{row.protocol}</span> · {row.share}% of alerts (
                {row.alert_count})
              </p>
              <p className="text-xs text-muted">{PROTOCOL_HINT[row.protocol] ?? PROTOCOL_HINT_FALLBACK}</p>
            </div>
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}
