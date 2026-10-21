import { useEffect, useState } from 'react'
import { Pause, RefreshCw, Wifi } from 'lucide-react'

import { CONNECTION_STALE_MS } from '../../constants/dashboard.js'

/**
 * Live-feed state pill for the traffic widget: `Live` while fresh points keep
 * arriving, `Reconnecting` when the newest point is older than
 * {@link CONNECTION_STALE_MS}, `Paused` while the user holds the charts.
 * Announced politely to screen readers whenever it changes.
 * @param {{paused: boolean, lastPointRef: {current: number}}} props Ref of the
 *   last traffic point's arrival time (ms).
 */
export default function ConnectionChip({ paused, lastPointRef }) {
  const [state, setState] = useState('live')

  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(() => {
      const stale = Date.now() - lastPointRef.current > CONNECTION_STALE_MS
      setState(stale ? 'reconnecting' : 'live')
    }, CONNECTION_STALE_MS)
    return () => clearInterval(id)
  }, [paused, lastPointRef])

  const current = paused ? 'paused' : state

  if (current === 'paused') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted">
        <Pause className="h-3.5 w-3.5" aria-hidden="true" />
        Paused
      </span>
    )
  }

  if (current === 'reconnecting') {
    return (
      <span
        aria-live="polite"
        className="inline-flex items-center gap-1.5 rounded-full border border-sev-medium/30 bg-sev-medium/10 px-2.5 py-1 text-xs font-medium text-sev-medium"
      >
        <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Reconnecting
      </span>
    )
  }

  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-1.5 rounded-full border border-sev-low/30 bg-sev-low/10 px-2.5 py-1 text-xs font-medium text-sev-low"
    >
      <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
      Live
    </span>
  )
}
