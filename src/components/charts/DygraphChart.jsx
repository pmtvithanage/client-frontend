/**
 * Shared dygraphs wrapper for real-time / streaming time-series charts
 * (AGENTS.md §9): one instance per mount, updates through `updateOptions`,
 * rows streamed in a ring buffer outside React state with at most one redraw
 * per second. Colours resolve from CSS variables (canvas cannot read them)
 * and re-apply on theme change. `annotations` re-applies `setAnnotations`,
 * `onZoomChange` reports the zoom state upward, and `syncGroup` registers the
 * chart in `utils/chartSync` (the group name must not change after mount).
 * @module components/charts/DygraphChart
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import Dygraph from 'dygraphs'
import 'dygraphs/dist/dygraph.css'

import { DYGRAPH_DEFAULT_HEIGHT, DYGRAPH_DEFAULT_MAX_POINTS, DYGRAPH_SERIES_VARS } from '../../constants/charts.js'
import { propagateSelection, propagateUnhighlight, propagateZoom, registerChart } from '../../utils/chartSync.js'
import { buildChartOptions, formatChartValue, trimRows } from '../../utils/dygraph.js'
import ChartControls from './ChartControls.jsx'
import { useDygraphStream } from './useDygraphStream.js'
import { useDygraphTheme } from './useDygraphTheme.js'
import { useChartSummary } from './useChartSummary.js'

const EMPTY_ROWS = []
const EMPTY_OPTIONS = {}
const EMPTY_ANNOTATIONS = []

/**
 * @param {{
 *   data?: Array<Array<Date|number>>,
 *   labels: string[],
 *   colors?: string[],
 *   options?: object,
 *   maxPoints?: number,
 *   height?: number,
 *   formatValue?: (value: unknown, name?: string) => string,
 *   ariaLabel?: string,
 *   showControls?: boolean,
 *   annotations?: Array<object>,
 *   onZoomChange?: (zoomed: boolean) => void,
 *   syncGroup?: string,
 * }} props
 */
const DygraphChart = forwardRef(function DygraphChart(
  {
    data = EMPTY_ROWS,
    labels,
    colors = DYGRAPH_SERIES_VARS,
    options = EMPTY_OPTIONS,
    maxPoints = DYGRAPH_DEFAULT_MAX_POINTS,
    height = DYGRAPH_DEFAULT_HEIGHT,
    formatValue = formatChartValue,
    ariaLabel = 'Live time-series chart',
    showControls = true,
    annotations = EMPTY_ANNOTATIONS,
    onZoomChange,
    syncGroup = '',
  },
  ref,
) {
  const containerRef = useRef(null)
  const graphRef = useRef(null)
  const onZoomChangeRef = useRef(onZoomChange)
  const syncGroupRef = useRef(syncGroup)
  const [zoomed, setZoomed] = useState(false)

  const palette = useDygraphTheme(colors ?? [])
  const seriesNames = useMemo(() => labels.slice(1), [labels])
  const [initialRows] = useState(() => trimRows(data, maxPoints))
  const { summaryRef, applyValues } = useChartSummary(seriesNames, formatValue)

  useEffect(() => {
    onZoomChangeRef.current = onZoomChange
    syncGroupRef.current = syncGroup
  })

  // Dygraphs mislabels an empty file; feed it a correctly shaped empty row.
  const seedRow = useCallback(
    () => (labels.length > 1 ? [new Date(), ...Array(labels.length - 1).fill(null)] : [new Date()]),
    [labels.length],
  )

  const redrawRows = useCallback(
    (rows) => {
      const graph = graphRef.current
      if (!graph) return
      graph.updateOptions({ file: rows.length ? rows : [seedRow()] })
      applyValues(rows[rows.length - 1]?.slice(1))
    },
    [applyValues, seedRow],
  )

  const { bufferRef, paused, replace, append, setData, pause, resume, stop } = useDygraphStream({
    maxPoints,
    redraw: redrawRows,
    initialRows,
  })

  const handleHighlight = useCallback((_event, _x, _points, row) => {
    applyValues(bufferRef.current[row]?.slice(1))
    if (syncGroupRef.current && graphRef.current) {
      propagateSelection(syncGroupRef.current, graphRef.current, row)
    }
  }, [applyValues, bufferRef])

  const handleUnhighlight = useCallback(() => {
    applyValues(bufferRef.current[bufferRef.current.length - 1]?.slice(1))
    if (syncGroupRef.current && graphRef.current) {
      propagateUnhighlight(syncGroupRef.current, graphRef.current)
    }
  }, [applyValues, bufferRef])

  const handleZoom = useCallback((minDate, maxDate) => {
    const zoomedNow = Boolean(graphRef.current?.isZoomed())
    setZoomed(zoomedNow)
    onZoomChangeRef.current?.(zoomedNow)
    if (syncGroupRef.current && graphRef.current) {
      propagateZoom(syncGroupRef.current, graphRef.current, zoomedNow ? [minDate, maxDate] : null)
    }
  }, [])

  const buildOptions = useCallback(
    () => buildChartOptions({ labels, palette, options, handlers: { highlight: handleHighlight, unhighlight: handleUnhighlight, zoom: handleZoom } }),
    [labels, palette, options, handleHighlight, handleUnhighlight, handleZoom],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const file = bufferRef.current.length ? bufferRef.current : [seedRow()]
    const graph = new Dygraph(container, file, buildOptions())
    graphRef.current = graph
    const unregister = syncGroup ? registerChart(syncGroup, graph, handleUnhighlight) : null
    const observer = new ResizeObserver(() => graph.resize())
    observer.observe(container)
    return () => {
      unregister?.()
      observer.disconnect()
      stop()
      graph.destroy()
      graphRef.current = null
    }
    // Created exactly once per mount; later changes go through updateOptions.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (graphRef.current) graphRef.current.updateOptions(buildOptions())
  }, [buildOptions])

  useEffect(() => {
    if (data !== EMPTY_ROWS) replace(data)
  }, [data, replace])

  useEffect(() => {
    if (graphRef.current?.setAnnotations) {
      graphRef.current.setAnnotations(annotations)
    }
  }, [annotations])

  const resetZoom = useCallback(() => {
    graphRef.current?.resetZoom()
    setZoomed(false)
  }, [])

  useImperativeHandle(
    ref,
    () => ({ append, setData, replace, pause, resume, stop, resetZoom }),
    [append, setData, replace, pause, resume, stop, resetZoom],
  )

  return (
    <div className="w-full">
      {showControls ? (
        <ChartControls
          labels={seriesNames.join(' · ')}
          paused={paused}
          zoomed={zoomed}
          onPauseToggle={paused ? resume : pause}
          onResetZoom={resetZoom}
        />
      ) : null}
      <div ref={containerRef} role="img" aria-label={ariaLabel} style={{ height }} className="w-full" />
      <span ref={summaryRef} className="sr-only" aria-live="off" />
    </div>
  )
})

export default DygraphChart
