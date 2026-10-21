import { useCallback, useEffect, useRef } from 'react'

import { summarizeRow } from '../../utils/dygraph.js'

/**
 * The visually hidden "latest values" line of a chart plus the helper that
 * keeps it in sync with the hovered row (or the newest row after the pointer
 * leaves).
 * @param {string[]} seriesNames Column labels (without the x column).
 * @param {(value: unknown, name?: string) => string} formatValue Formatter.
 * @returns {{summaryRef: import('react').RefObject<HTMLSpanElement>,
 *   applyValues: (values?: Array<unknown>) => void}}
 */
export function useChartSummary(seriesNames, formatValue) {
  const summaryRef = useRef(null)
  const formatValueRef = useRef(formatValue)

  const applyValues = useCallback(
    (values) => {
      if (summaryRef.current) {
        summaryRef.current.textContent = summarizeRow(seriesNames, values, formatValueRef.current)
      }
    },
    [seriesNames],
  )

  useEffect(() => {
    formatValueRef.current = formatValue
  })

  return { summaryRef, applyValues }
}
