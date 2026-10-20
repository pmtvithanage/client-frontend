/**
 * Shared dygraphs wrapper for real-time / streaming time-series charts
 * (AGENTS.md §9): instance created exactly once per mount, updated through
 * `updateOptions`, streaming rows in a ring buffer outside React state with at
 * most one redraw per second. Colours are resolved from CSS variables (canvas
 * cannot read them) and re-applied whenever the theme changes.
 * @module components/charts/DygraphChart
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import Dygraph from 'dygraphs'
import 'dygraphs/dist/dygraph.css'

import {
  DYGRAPH_DEFAULT_HEIGHT,
  DYGRAPH_DEFAULT_MAX_POINTS,
  DYGRAPH_SERIES_VARS,
} from '../../constants/charts.js'
import { formatChartValue, summarizeRow, trimRows } from '../../utils/dygraph.js'
import ChartControls from './ChartControls.jsx'
import { useDygraphStream } from './useDygraphStream.js'
import { useDygraphTheme } from './useDygraphTheme.js'

const EMPTY_ROWS = []
const EMPTY_OPTIONS = {}

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
  },
  ref,
) {
  const containerRef = useRef(null)
  const graphRef = useRef(null)
  const summaryRef = useRef(null)
  const formatValueRef = useRef(formatValue)
  const [zoomed, setZoomed] = useState(false)

  const palette = useDygraphTheme(colors ?? [])
  const seriesNames = useMemo(() => labels.slice(1), [labels])
  const [initialRows] = useState(() => trimRows(data, maxPoints))

  useEffect(() => {
    formatValueRef.current = formatValue
  }, [formatValue])

  const applyValues = useCallback(
    (values) => {
      if (summaryRef.current) {
        summaryRef.current.textContent = summarizeRow(seriesNames, values, formatValueRef.current)
      }
    },
    [seriesNames],
  )

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

  const handleHighlight = useCallback(
    (_event, _x, _points, row) => applyValues(bufferRef.current[row]?.slice(1)),
    [applyValues, bufferRef],
  )

  const handleUnhighlight = useCallback(
    () => applyValues(bufferRef.current[bufferRef.current.length - 1]?.slice(1)),
    [applyValues, bufferRef],
  )

  const handleZoom = useCallback(() => {
    setZoomed(Boolean(graphRef.current?.isZoomed()))
  }, [])

  const buildOptions = useCallback(
    () => ({
      labels,
      strokeWidth: 1.5,
      animatedZooms: false,
      axisLabelFontSize: 11,
      axisLabelColor: palette.label,
      gridLineColor: palette.grid,
      axisLineColor: palette.axis,
      backgroundColor: palette.background,
      ...(palette.series.length ? { colors: palette.series } : {}),
      ...options,
      highlightCallback: handleHighlight,
      unhighlightCallback: handleUnhighlight,
      zoomCallback: handleZoom,
    }),
    [labels, palette, options, handleHighlight, handleUnhighlight, handleZoom],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const file = bufferRef.current.length ? bufferRef.current : [seedRow()]
    const graph = new Dygraph(container, file, buildOptions())
    graphRef.current = graph
    const observer = new ResizeObserver(() => graph.resize())
    observer.observe(container)
    return () => {
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

  const resetZoom = useCallback(() => {
    graphRef.current?.resetZoom()
    setZoomed(false)
  }, [])

  const getRows = useCallback(() => bufferRef.current, [bufferRef])

  useImperativeHandle(
    ref,
    () => ({ append, setData, replace, pause, resume, stop, resetZoom, getRows }),
    [append, setData, replace, pause, resume, stop, resetZoom, getRows],
  )

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">{seriesNames.join(' · ')}</p>
        {showControls ? (
          <ChartControls
            paused={paused}
            zoomed={zoomed}
            onPauseToggle={paused ? resume : pause}
            onResetZoom={resetZoom}
          />
        ) : null}
      </div>
      <div ref={containerRef} role="img" aria-label={ariaLabel} style={{ height }} className="w-full" />
      <span ref={summaryRef} className="sr-only" aria-live="off" />
    </div>
  )
})

export default DygraphChart
