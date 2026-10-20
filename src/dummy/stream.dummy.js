/**
 * Dummy real-time alert feed (stands in for `GET /stream/alerts` over SSE).
 *
 * Emits a brand-new alert for the signed-in client every 6–12 seconds, stores
 * it, and hands the CLIENT-SAFE projection to the subscriber. If the session
 * ends, or the account is switched, the feed stops by itself.
 * @module dummy/stream.dummy
 */

import {
  LIVE_ALERT_MAX_INTERVAL_MS,
  LIVE_ALERT_MIN_INTERVAL_MS,
} from '../constants/alerts.js'
import { SEVERITY_RANK } from '../constants/severity.js'
import { toClientAlert } from './alertView.js'
import { currentClient, randomInt } from './helpers.js'
import { ingestLiveAlert } from './store.js'

/** Optional severity floor: only deliver alerts at or above `minSeverity`. */
function passesSeverity(alert, minSeverity) {
  if (!minSeverity) return true
  return SEVERITY_RANK[alert.severity_tier] >= SEVERITY_RANK[minSeverity]
}

/**
 * Subscribe to the simulated live alert stream.
 * @param {(alert: object) => void} onAlert Called with a client-safe alert.
 * @param {{minSeverity?: string}} [options] Optional severity floor.
 * @returns {() => void} Unsubscribe function.
 * @throws {{status: number, message: string}} 401 when there is no session.
 */
export function subscribeAlerts(onAlert, options = {}) {
  const clientId = currentClient()
  let timer = null
  let stopped = false

  const schedule = () => {
    timer = setTimeout(() => {
      if (stopped) return
      if (currentClient() !== clientId) {
        stop()
        return
      }
      const alert = ingestLiveAlert()
      if (passesSeverity(alert, options.minSeverity)) onAlert(toClientAlert(alert))
      schedule()
    }, randomInt(LIVE_ALERT_MIN_INTERVAL_MS, LIVE_ALERT_MAX_INTERVAL_MS))
  }

  function stop() {
    stopped = true
    if (timer) clearTimeout(timer)
  }

  schedule()
  return stop
}
