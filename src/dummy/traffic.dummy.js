/**
 * Dummy traffic feed for the signed-in client: 15 minutes of one-second history
 * plus a live subscription that emits a point every second.
 *
 * A scripted burst makes flows, alerts and sensor lag jump for ~45 seconds in
 * the history window, and recurring bursts keep happening live. Points are
 * deterministic per timestamp (seeded by the tenant), so re-reading the history
 * always returns the same numbers, and switching accounts rebuilds the buffer.
 * @module dummy/traffic.dummy
 */

import {
  TRAFFIC_BASELINE,
  TRAFFIC_BUFFER_POINTS,
  TRAFFIC_BURST,
  TRAFFIC_HISTORY_MINUTES,
  TRAFFIC_SEVERITY_KEYS,
  TRAFFIC_SEVERITY_SPLIT,
  TRAFFIC_STREAM_INTERVAL_MS,
} from '../constants/traffic.js'
import { delay, randomInt, rngInt, seededRandom } from './helpers.js'
import { getTenant } from './store.js'

const STEP_MS = 1000

/**
 * Split `total` alerts across the four severity keys using `weights`
 * (called after every other rng draw so existing points keep their numbers).
 * @param {number} total Alerts in this second.
 * @param {() => number} rng Seeded generator (already positioned).
 * @param {number[]} weights One probability per key in TRAFFIC_SEVERITY_KEYS.
 * @returns {{minor: number, moderate: number, serious: number, urgent: number}}
 */
function splitAlerts(total, rng, weights) {
  const counts = { minor: 0, moderate: 0, serious: 0, urgent: 0 }
  for (let index = 0; index < total; index += 1) {
    let roll = rng()
    let picked = TRAFFIC_SEVERITY_KEYS.at(-1)
    for (let key = 0; key < TRAFFIC_SEVERITY_KEYS.length; key += 1) {
      roll -= weights[key]
      if (roll <= 0) {
        picked = TRAFFIC_SEVERITY_KEYS[key]
        break
      }
    }
    counts[picked] += 1
  }
  return counts
}

/** @type {Array<object>} Ring buffer of points, oldest first. */
let buffer = []

/** Client id the buffer was built for (rebuild on account switch). */
let bufferOwner = ''

/** "Now" when the history window was built — anchors the scripted burst. */
let windowAnchor = 0

/** Live burst schedule: [start, end] timestamps in ms. */
let burstStart = 0
let burstEnd = 0

function scheduleBurst(fromMs) {
  const [minMs, maxMs] = TRAFFIC_BURST.liveEveryMs
  burstStart = fromMs + randomInt(minMs, maxMs)
  burstEnd = burstStart + TRAFFIC_BURST.liveDurationMs
}

/** Is this timestamp inside a burst? Historical vs live windows differ. */
function isBurst(ts) {
  if (ts <= windowAnchor) {
    const secondsAgo = (windowAnchor - ts) / 1000
    return (
      secondsAgo >= TRAFFIC_BURST.historyStartSecondsAgo &&
      secondsAgo < TRAFFIC_BURST.historyStartSecondsAgo + TRAFFIC_BURST.historyDurationSeconds
    )
  }
  if (ts >= burstEnd) scheduleBurst(ts)
  return ts >= burstStart && ts < burstEnd
}

/** Build one deterministic point for `ts`. */
function makePoint(ts, tenant) {
  const burst = isBurst(ts)
  const rng = seededRandom(ts + tenant.rngSeed)
  const flows = rngInt(rng, ...TRAFFIC_BASELINE.flowsPerSec) * (burst ? TRAFFIC_BURST.flowsMultiplier : 1)
  const bytes = flows * rngInt(rng, ...TRAFFIC_BASELINE.bytesPerFlow)
  const blocked_or_flagged = burst
    ? rngInt(rng, ...TRAFFIC_BURST.flaggedPerSec)
    : rngInt(rng, ...TRAFFIC_BASELINE.flaggedPerSec)
  const alerts_per_sec = burst
    ? Math.max(0, blocked_or_flagged - rngInt(rng, 0, 2))
    : rngInt(rng, 0, 1)
  const sensor_lag = burst ? rngInt(rng, ...TRAFFIC_BURST.sensorLag) : rngInt(rng, ...TRAFFIC_BASELINE.sensorLag)
  const alerts_by_severity = splitAlerts(
    alerts_per_sec,
    rng,
    burst ? TRAFFIC_SEVERITY_SPLIT.burst : TRAFFIC_SEVERITY_SPLIT.quiet,
  )
  return {
    ts: new Date(ts).toISOString(),
    flows_per_sec: flows,
    bytes_per_sec: bytes,
    alerts_per_sec,
    alerts_by_severity,
    blocked_or_flagged,
    sensor_lag,
  }
}

/** Fill the buffer up to `now`, capped at {@link TRAFFIC_BUFFER_POINTS}. */
function ensureBuffer(tenant, now) {
  if (bufferOwner !== tenant.id) {
    buffer = []
    bufferOwner = tenant.id
    windowAnchor = 0
  }
  if (!buffer.length) {
    windowAnchor = now
    const start = now - (TRAFFIC_BUFFER_POINTS - 1) * STEP_MS
    for (let ts = start; ts <= now; ts += STEP_MS) buffer.push(makePoint(ts, tenant))
    scheduleBurst(now)
    return
  }
  if (now > burstEnd) scheduleBurst(now)
  let ts = Date.parse(buffer[buffer.length - 1].ts) + STEP_MS
  let guard = 0
  while (ts <= now && guard < TRAFFIC_BUFFER_POINTS * 4) {
    buffer.push(makePoint(ts, tenant))
    ts += STEP_MS
    guard += 1
  }
  if (buffer.length > TRAFFIC_BUFFER_POINTS) buffer.splice(0, buffer.length - TRAFFIC_BUFFER_POINTS)
}

/**
 * One-second traffic history for the current client.
 * @param {{minutes?: number}} [params] Window length (1–15, default 15).
 * @returns {Promise<{data: object[], meta: object}>} Oldest first.
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function getTrafficHistory(params = {}) {
  await delay()
  const tenant = getTenant()
  const now = Date.now()
  const minutes = Math.min(Math.max(Number(params.minutes) || TRAFFIC_HISTORY_MINUTES, 1), TRAFFIC_HISTORY_MINUTES)
  ensureBuffer(tenant, now)
  const from = now - minutes * 60_000
  const data = buffer.filter((point) => Date.parse(point.ts) >= from)
  return {
    data,
    meta: {
      step_seconds: STEP_MS / 1000,
      window_minutes: minutes,
      from: data[0]?.ts ?? new Date(from).toISOString(),
      to: new Date(now).toISOString(),
      count: data.length,
    },
  }
}

/**
 * Subscribe to the live traffic feed (one point per second).
 * @param {(point: object) => void} onPoint Called with each new point.
 * @param {{intervalMs?: number}} [options] Cadence override (default 1000 ms).
 * @returns {() => void} Unsubscribe function.
 * @throws {{status: number, message: string}} 401 when there is no session.
 */
export function subscribeTraffic(onPoint, options = {}) {
  getTenant()
  const intervalMs = options.intervalMs ?? TRAFFIC_STREAM_INTERVAL_MS
  const id = setInterval(() => {
    try {
      const current = getTenant()
      ensureBuffer(current, Date.now())
      if (typeof onPoint === 'function') onPoint(buffer[buffer.length - 1])
    } catch {
      clearInterval(id)
    }
  }, intervalMs)
  return () => clearInterval(id)
}
