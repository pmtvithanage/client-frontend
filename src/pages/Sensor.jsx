/**
 * `/sensor` — the health of this client's ONE sensor: status card, connection
 * checklist, live health mini charts, owner-only pairing and a help link that
 * carries this sensor's own id as the support subject.
 */
import { LifeBuoy } from 'lucide-react'
import { Link } from 'react-router-dom'

import ConnectionChecklist from '../components/sensor/ConnectionChecklist.jsx'
import PairSensorSection from '../components/sensor/PairSensorSection.jsx'
import SensorHealthCharts from '../components/sensor/SensorHealthCharts.jsx'
import SensorStatusCard from '../components/sensor/SensorStatusCard.jsx'
import OfflineSensorBanner from '../components/common/OfflineSensorBanner.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useSensor } from '../hooks/useSensor.js'
import { supportSubject } from '../utils/sensor.js'

export default function Sensor() {
  useDocumentTitle('Sensor')
  const { data: sensor } = useSensor()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">Sensor</h1>
          <p className="text-sm text-muted">The health of the sensor watching your network.</p>
        </div>
        <Link
          to="/support"
          state={{ subject: supportSubject(sensor) }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
        >
          <LifeBuoy className="h-4 w-4" aria-hidden="true" />
          Need help?
        </Link>
      </header>

      <OfflineSensorBanner />
      <SensorStatusCard />
      <ConnectionChecklist />
      <SensorHealthCharts />
      <PairSensorSection />
    </div>
  )
}
