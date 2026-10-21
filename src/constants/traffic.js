/**
 * Traffic history and live traffic stream settings.
 * @module constants/traffic
 */

/** Length of the history returned by `GET /traffic/realtime`, in minutes. */
export const TRAFFIC_HISTORY_MINUTES = 15

/** Distance between history points, in seconds. */
export const TRAFFIC_STEP_SECONDS = 1

/** Ring buffer size (15 minutes of one-second points). */
export const TRAFFIC_BUFFER_POINTS = (TRAFFIC_HISTORY_MINUTES * 60) / TRAFFIC_STEP_SECONDS

/** Live traffic points are pushed every second on `GET /stream/metrics`. */
export const TRAFFIC_STREAM_INTERVAL_MS = (TRAFFIC_STEP_SECONDS * 1000)

/** Quiet-traffic baseline: [min, max] per field. */
export const TRAFFIC_BASELINE = Object.freeze({
  flowsPerSec: [35, 95],
  bytesPerFlow: [1800, 9200],
  flaggedPerSec: [0, 2],
  sensorLag: [0, 6],
})

/** Scripted burst: flows jump, alerts appear and the sensor falls behind. */
export const TRAFFIC_BURST = Object.freeze({
  flowsMultiplier: 6,
  flaggedPerSec: [2, 7],
  sensorLag: [8, 40],
  historyStartSecondsAgo: 460,
  historyDurationSeconds: 45,
  liveEveryMs: [55000, 85000],
  liveDurationMs: 18000,
})

/**
 * How `alerts_per_sec` splits across severities, as weights in the order of
 * {@link TRAFFIC_SEVERITY_KEYS}. Quiet minutes skew Minor; bursts skew Urgent.
 */
export const TRAFFIC_SEVERITY_SPLIT = Object.freeze({
  quiet: Object.freeze([0.5, 0.3, 0.15, 0.05]),
  burst: Object.freeze([0.15, 0.35, 0.3, 0.2]),
})

/** Key order matching {@link TRAFFIC_SEVERITY_SPLIT} weights (Minor → Urgent). */
export const TRAFFIC_SEVERITY_KEYS = Object.freeze(['minor', 'moderate', 'serious', 'urgent'])
