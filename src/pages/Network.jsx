/**
 * `/network` — everything this client's single sensor sees about its own
 * network: internal devices, outside destinations, ports/protocols, live
 * traffic over time and the alert heatmap. Each section owns its loading,
 * empty and error state through `<WidgetCard>`.
 */
import AlertHeatmap from '../components/network/AlertHeatmap.jsx'
import NetworkDestinations from '../components/network/NetworkDestinations.jsx'
import NetworkDevices from '../components/network/NetworkDevices.jsx'
import NetworkPorts from '../components/network/NetworkPorts.jsx'
import NetworkTraffic from '../components/network/NetworkTraffic.jsx'
import ProtocolShare from '../components/network/ProtocolShare.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function Network() {
  useDocumentTitle('Network')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-text">Network</h1>
        <p className="text-sm text-muted">How traffic has moved through your site.</p>
      </header>

      <NetworkDevices />

      <div className="grid gap-6 xl:grid-cols-2">
        <NetworkDestinations />
        <div className="space-y-6">
          <NetworkPorts />
          <ProtocolShare />
        </div>
      </div>

      <NetworkTraffic />
      <AlertHeatmap />
    </div>
  )
}
