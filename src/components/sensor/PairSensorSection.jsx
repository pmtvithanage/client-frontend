/**
 * "Pair a new sensor" section: owner-only replacement flow (because a client
 * has exactly ONE sensor). Members see the section disabled with a plain
 * explanation instead.
 * @module components/sensor/PairSensorSection
 */

import { useState } from 'react'

import PairSensorDialog from './PairSensorDialog.jsx'
import WidgetCard from '../dashboard/WidgetCard.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useSensor } from '../../hooks/useSensor.js'
import { MEMBER_PAIR_EXPLANATION, PAIR_WARNING } from '../../constants/sensor.js'

export default function PairSensorSection() {
  const { isOwner } = useAuth()
  const { data: sensor } = useSensor()
  const [open, setOpen] = useState(false)

  return (
    <WidgetCard
      title="Pair a new sensor"
      subtitle="Replacing the sensor is a one-time setup step for account owners."
      isLoading={false}
      isError={false}
    >
      <p className="text-sm text-muted">{PAIR_WARNING}</p>
      {sensor ? (
        <p className="mt-2 text-sm text-text">
          Current sensor: <span className="font-medium">{sensor.name}</span>{' '}
          <span className="font-mono text-xs text-muted">{sensor.id}</span>
        </p>
      ) : null}

      {isOwner ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          Pair a new sensor
        </button>
      ) : (
        <div className="mt-3 rounded-lg border border-dashed border-border p-3">
          <p className="text-sm text-muted">{MEMBER_PAIR_EXPLANATION}</p>
          <button
            type="button"
            disabled
            className="mt-2 cursor-not-allowed rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted opacity-60"
          >
            Pair a new sensor
          </button>
        </div>
      )}

      {isOwner && open ? (
        <PairSensorDialog
          sensorName={sensor?.name}
          onCancel={() => setOpen(false)}
          onDone={() => setOpen(false)}
        />
      ) : null}
    </WidgetCard>
  )
}
