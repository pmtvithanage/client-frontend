import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import TrafficCharts from './TrafficCharts.jsx'
import TrafficControls from './TrafficControls.jsx'
import { useAlertStream } from '../../hooks/useAlertStream.js'
import { useAlerts } from '../../hooks/useAlerts.js'
import { useTrafficHistory, useTrafficStream } from '../../hooks/useTraffic.js'
import {
  ANNOTATION_LIMIT,
  ANNOTATION_SEVERITY,
  ANNOTATION_SERIES,
  ATTENTION_FLUSH_MS,
  DEFAULT_TRAFFIC_WINDOW,
  MINUTE_MS,
  TRAFFIC_SERIES,
} from '../../constants/dashboard.js'
import { buildUrgentAnnotations } from '../../utils/dashboard.js'

/**
 * "Live traffic" widget: state, queries and live subscriptions feeding
 * `<TrafficControls>` (window / pause / back-to-live / connection chip) and
 * `<TrafficCharts>` (two synchronised streaming charts with clickable `!`
 * markers for Urgent alerts). Live points append outside React state with at
 * most one redraw per second; live urgent alerts are batched onto the screen
 * once per second.
 * @param {{anchor: number}} props Refresh anchor (ms) bounding the annotation query.
 */
export default function TrafficSection({ anchor }) {
  const navigate = useNavigate()
  const [minutes, setMinutes] = useState(DEFAULT_TRAFFIC_WINDOW)
  const [paused, setPaused] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [liveUrgent, setLiveUrgent] = useState([])
  const netRef = useRef(null)
  const alertsRef = useRef(null)
  const lastPointRef = useRef(0)
  const pendingRef = useRef([])

  useEffect(() => {
    lastPointRef.current = Date.now()
  }, [])

  const history = useTrafficHistory({ minutes })

  const annotationParams = useMemo(
    () => ({
      severity: [ANNOTATION_SEVERITY],
      from: new Date(anchor - minutes * MINUTE_MS).toISOString(),
      to: new Date(anchor).toISOString(),
      sort: 'ts:desc',
      limit: ANNOTATION_LIMIT,
    }),
    [anchor, minutes],
  )
  const urgentQuery = useAlerts(annotationParams)

  useTrafficStream({
    onPoint: (point) => {
      lastPointRef.current = Date.now()
      const split = point.alerts_by_severity
      netRef.current?.append([[new Date(point.ts), point.flows_per_sec, point.bytes_per_sec]])
      alertsRef.current?.append([
        [new Date(point.ts), split.minor, split.moderate, split.serious, split.urgent],
      ])
    },
  })

  useAlertStream({
    minSeverity: ANNOTATION_SEVERITY,
    onAlert: (alert) => pendingRef.current.push(alert),
  })

  useEffect(() => {
    const id = setInterval(() => {
      if (!pendingRef.current.length) return
      const batch = pendingRef.current.splice(0, pendingRef.current.length)
      setLiveUrgent((previous) => [...batch, ...previous].slice(0, ANNOTATION_LIMIT))
    }, ATTENTION_FLUSH_MS)
    return () => clearInterval(id)
  }, [])

  const openAnnotation = useCallback(
    (annotation) => {
      if (annotation?.alertId) navigate(`/alerts/${annotation.alertId}`)
    },
    [navigate],
  )

  const netOptions = useMemo(
    () => ({
      series: { [TRAFFIC_SERIES.bytes]: { axis: 'y2' } },
      axes: { y2: { gridLineWidth: 0 } },
      annotationClickHandler: openAnnotation,
    }),
    [openAnnotation],
  )
  const alertOptions = useMemo(
    () => ({ stackedGraph: true, fillGraph: true, annotationClickHandler: openAnnotation }),
    [openAnnotation],
  )

  const netRows = useMemo(
    () => (history.data?.data ?? []).map((p) => [new Date(p.ts), p.flows_per_sec, p.bytes_per_sec]),
    [history.data],
  )
  const alertRows = useMemo(
    () =>
      (history.data?.data ?? []).map((p) => [
        new Date(p.ts),
        p.alerts_by_severity.minor,
        p.alerts_by_severity.moderate,
        p.alerts_by_severity.serious,
        p.alerts_by_severity.urgent,
      ]),
    [history.data],
  )
  const gridStart = useMemo(() => {
    const first = history.data?.data[0]?.ts
    return first ? Date.parse(first) : null
  }, [history.data])
  const windowAlerts = useMemo(
    () => [...(urgentQuery.data?.data ?? []), ...liveUrgent],
    [urgentQuery.data, liveUrgent],
  )
  const netAnnotations = useMemo(
    () => buildUrgentAnnotations(windowAlerts, gridStart, ANNOTATION_SERIES.flows),
    [windowAlerts, gridStart],
  )
  const alertAnnotations = useMemo(
    () => buildUrgentAnnotations(windowAlerts, gridStart, ANNOTATION_SERIES.alerts),
    [windowAlerts, gridStart],
  )

  const togglePause = () => {
    const next = !paused
    setPaused(next)
    for (const chart of [netRef.current, alertsRef.current]) {
      if (next) chart?.pause()
      else chart?.resume()
    }
  }

  const backToLive = () => {
    netRef.current?.resetZoom()
    alertsRef.current?.resetZoom()
    setZoomed(false)
  }

  return (
    <section className="space-y-4">
      <TrafficControls
        minutes={minutes}
        onWindowChange={setMinutes}
        paused={paused}
        onTogglePause={togglePause}
        zoomed={zoomed}
        onBackToLive={backToLive}
        lastPointRef={lastPointRef}
      />
      <TrafficCharts
        history={history}
        minutes={minutes}
        netRef={netRef}
        alertsRef={alertsRef}
        netRows={netRows}
        alertRows={alertRows}
        netAnnotations={netAnnotations}
        alertAnnotations={alertAnnotations}
        netOptions={netOptions}
        alertOptions={alertOptions}
        onZoomChange={setZoomed}
      />
    </section>
  )
}
