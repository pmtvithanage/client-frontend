import { useEffect, useRef } from 'react'

import { subscribeAlerts } from '../api/stream.js'

/**
 * Subscribe to the simulated real-time alert feed (one alert every 6–12 s in
 * the dummy layer). The handler lives in a ref so an inline callback does not
 * tear the subscription down on every render.
 * @param {{onAlert: (alert: object) => void, minSeverity?: string, enabled?: boolean,
 *   onError?: (error: {status: number, message: string}) => void}} options
 */
export function useAlertStream({ onAlert, minSeverity, enabled = true, onError } = {}) {
  const onAlertRef = useRef(onAlert)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onAlertRef.current = onAlert
    onErrorRef.current = onError
  })

  useEffect(() => {
    if (!enabled) return undefined
    try {
      return subscribeAlerts((alert) => onAlertRef.current?.(alert), { minSeverity })
    } catch (error) {
      // 401 without a session (thrown synchronously by the API layer).
      onErrorRef.current?.(error)
      return undefined
    }
  }, [enabled, minSeverity])
}
