import * as dummy from '../dummy/stream.dummy.js'

/**
 * Subscribe to the simulated real-time alert feed.
 *
 * Real implementation (commented above the dummy call) opens
 * `GET /stream/alerts` with Server-Sent Events; the dummy emits one alert
 * every 6–12 seconds instead.
 * @param {(alert: object) => void} onAlert Called with a client-safe alert.
 * @param {{minSeverity?: string}} [options] Optional severity floor.
 * @returns {() => void} Unsubscribe function.
 * @throws {{status: number, message: string}} 401 when there is no session.
 */
export function subscribeAlerts(onAlert, options) {
  // const source = new EventSource(`${baseURL}/stream/alerts?token=${token}`);
  // source.onmessage = (event) => onAlert(JSON.parse(event.data));
  // return () => source.close();
  return dummy.subscribeAlerts(onAlert, options)
}
