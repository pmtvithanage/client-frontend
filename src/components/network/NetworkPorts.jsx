/**
 * "Ports and protocols" — top destination ports section: each row shows the
 * port number, its friendly service name and a plain-language hint (for
 * example 443 = secure web traffic), plus how many alerts used that port.
 * @module components/network/NetworkPorts
 */

import WidgetCard from '../dashboard/WidgetCard.jsx'
import { usePorts } from '../../hooks/useNetwork.js'
import { PORT_HINT, PORT_HINT_FALLBACK } from '../../constants/network.js'

const TABLE_HEAD = Object.freeze(['Port', 'What it is', 'In plain language', 'Alerts'])

export default function NetworkPorts() {
  const ports = usePorts()
  const rows = ports.data?.data ?? []

  return (
    <WidgetCard
      title="Ports and protocols"
      subtitle="The destination ports your alerts concentrate on, and what each one is for."
      isLoading={ports.isLoading}
      isError={ports.isError}
      error={ports.error}
      onRetry={ports.refetch}
      isEmpty={!ports.isLoading && !ports.isError && rows.length === 0}
      emptyTitle="No port activity yet"
      emptyDescription="Destination ports appear here once your sensor flags traffic that uses them."
      skeletonRows={5}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              {TABLE_HEAD.map((label, index) => (
                <th
                  key={label}
                  scope="col"
                  className={`py-2 pr-4 font-medium ${index === 3 ? 'text-right' : ''}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.port} className="hover:bg-surface-2">
                <td className="py-2.5 pr-4 font-mono text-sm tabular-nums text-text">{row.port}</td>
                <td className="py-2.5 pr-4 font-medium text-text">{row.service}</td>
                <td className="py-2.5 pr-4 text-muted">{PORT_HINT[row.port] ?? PORT_HINT_FALLBACK}</td>
                <td className="py-2.5 text-right tabular-nums text-text">{row.alert_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  )
}
