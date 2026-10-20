/**
 * Alert generation and the client-facing projection.
 *
 * Seeded alerts (150 per client over 14 days) and live alerts share one
 * builder. Every alert that leaves this module is projected through
 * `dummy/alertView.js`, which returns an allow-list of fields so internal-only
 * values (`likely_benign`, `client_id`) can never reach the UI.
 * @module dummy/alertFactory
 */

import {
  ALERT_COUNT_PER_CLIENT,
  ALERT_WINDOW_DAYS,
  NOTE_CHANCE,
  SAMPLE_NOTES,
  STATUS_MIX_BY_AGE_DAYS,
} from '../constants/alerts.js'
import { ACME_CLIENT_ID, ACME_SAMPLE_FLOW } from '../constants/clients.js'
import {
  CATEGORY_PORTS,
  CATEGORY_PROFILE,
  CATEGORY_WEIGHTS,
  CATEGORIES,
  COMMON_PORTS,
} from '../constants/categories.js'
import { EXTERNAL_PREFIXES } from '../constants/network.js'
import { SEVERITY_ORDER } from '../constants/severity.js'
import { ALERT_STATUS } from '../constants/statuses.js'
import { makeId, rngInt, seededRandom } from './helpers.js'

/** Relative frequency of each direction when seeding alerts. */
const DIRECTION_WEIGHTS = Object.freeze({ outbound: 0.5, inbound: 0.3, internal: 0.2 })

/** Weighted pick: `weights` aligns with `items`. */
function weightedPick(rng, items, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let roll = rng() * total
  for (let i = 0; i < items.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) return items[i]
  }
  return items[items.length - 1]
}

function directionPick(rng) {
  const roll = rng()
  if (roll < DIRECTION_WEIGHTS.outbound) return 'outbound'
  if (roll < DIRECTION_WEIGHTS.outbound + DIRECTION_WEIGHTS.inbound) return 'inbound'
  return 'internal'
}

/** Status chosen from the age-based mix in `constants/alerts.js`. */
function statusForAge(rng, ageDays) {
  const bucket = STATUS_MIX_BY_AGE_DAYS.find((entry) => ageDays <= entry.maxDays)
  const weights = bucket?.weights ?? STATUS_MIX_BY_AGE_DAYS.at(-1).weights
  return weightedPick(
    rng,
    [ALERT_STATUS.NEW, ALERT_STATUS.ACKNOWLEDGED, ALERT_STATUS.EXPECTED, ALERT_STATUS.RESOLVED],
    weights,
  )
}

/** Internal-only hint: the alert may be ordinary traffic (never sent to clients). */
function likelyBenign(rng, category, severity) {
  if (category === 'Policy violation' || category === 'Unusual traffic') return rng() < 0.65
  if (severity === 'LOW') return rng() < 0.5
  if (severity === 'MEDIUM') return rng() < 0.2
  return false
}

function addressFor(rng, devices, direction) {
  const device = devices[rngInt(rng, 0, devices.length - 1)]
  const external = () =>
    `${EXTERNAL_PREFIXES[rngInt(rng, 0, EXTERNAL_PREFIXES.length - 1)]}.${rngInt(rng, 2, 254)}`
  if (direction === 'outbound') return { src_ip: device.ip, dst_ip: external(), device }
  if (direction === 'inbound') return { src_ip: external(), dst_ip: device.ip, device }
  const other = devices[rngInt(rng, 0, devices.length - 1)]
  return { src_ip: other.ip, dst_ip: device.ip, device: other }
}

function buildAlert(rng, context) {
  const { seed, devices, seq, ts, now, status } = context
  const category = weightedPick(rng, CATEGORIES, CATEGORY_WEIGHTS)
  const profile = CATEGORY_PROFILE[category]
  const signature = profile.signatures[rngInt(rng, 0, profile.signatures.length - 1)]
  const severity = weightedPick(rng, SEVERITY_ORDER, profile.mix)
  const direction = directionPick(rng)
  const { src_ip, dst_ip } = addressFor(rng, devices, direction)
  const ports = CATEGORY_PORTS[category] ?? COMMON_PORTS
  const dst_port = ports[rngInt(rng, 0, ports.length - 1)]
  const protocolRoll = rng()
  const protocol = protocolRoll < 0.72 ? 'TCP' : protocolRoll < 0.94 ? 'UDP' : 'ICMP'
  const ageDays = (now - Date.parse(ts)) / 86_400_000
  const finalStatus = status ?? statusForAge(rng, ageDays)
  const author = seed.users[rngInt(rng, 0, seed.users.length - 1)]
  const notes =
    finalStatus !== ALERT_STATUS.NEW && rng() < NOTE_CHANCE
      ? [
          {
            id: makeId('note'),
            body: SAMPLE_NOTES[rngInt(rng, 0, SAMPLE_NOTES.length - 1)],
            author: author.email,
            created_at: new Date(
              Math.min(Date.parse(ts) + 3_600_000, now - 60_000),
            ).toISOString(),
          },
        ]
      : []

  return {
    id: `${seed.alertPrefix}-ALT-${String(seq).padStart(6, '0')}`,
    client_id: seed.id,
    ts,
    updated_at: ts,
    severity_tier: severity,
    status: finalStatus,
    src_ip,
    dst_ip,
    dst_port,
    protocol,
    direction,
    category,
    signature,
    likely_benign: likelyBenign(rng, category, severity),
    notes,
  }
}

/** The fixed Acme Textiles sample flow, always `CRITICAL` and `new`. */
function buildSampleAlert(seed, seq, now) {
  const sample = ACME_SAMPLE_FLOW
  const ts = new Date(now - sample.hours_ago * 3_600_000).toISOString()
  return {
    id: `${seed.alertPrefix}-ALT-${String(seq).padStart(6, '0')}`,
    client_id: seed.id,
    ts,
    updated_at: ts,
    severity_tier: sample.severity_tier,
    status: sample.status,
    src_ip: sample.src_ip,
    dst_ip: sample.dst_ip,
    dst_port: sample.dst_port,
    protocol: sample.protocol,
    direction: sample.direction,
    category: sample.category,
    signature: sample.signature,
    likely_benign: false,
    notes: [],
  }
}

/**
 * Generate the seeded alert history for one client.
 * @param {object} seed Client entry from `constants/clients.js`.
 * @param {object[]} devices The client's devices (used as internal addresses).
 * @returns {object[]} Newest first, exactly {@link ALERT_COUNT_PER_CLIENT} items.
 */
export function generateAlerts(seed, devices) {
  const rng = seededRandom(seed.rngSeed + 1)
  const now = Date.now()
  const alerts = []
  let seq = 0

  if (seed.id === ACME_CLIENT_ID) {
    alerts.push(buildSampleAlert(seed, (seq += 1), now))
  }
  while (seq < ALERT_COUNT_PER_CLIENT) {
    seq += 1
    const ts = new Date(now - rng() * ALERT_WINDOW_DAYS * 86_400_000).toISOString()
    alerts.push(buildAlert(rng, { seed, devices, seq, ts, now }))
  }

  return alerts.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts))
}

/**
 * Create a fresh alert for the signed-in client (the live feed).
 * @param {object} tenant Current tenant record from the store.
 * @param {number} seq Next sequence number for this tenant.
 * @returns {object} Raw store alert (project it before returning to the UI).
 */
export function createLiveAlert(tenant, seq) {
  const rng = () => Math.random()
  const now = Date.now()
  const ts = new Date(now).toISOString()
  return buildAlert(rng, { seed: tenant, devices: tenant.devices, seq, ts, now, status: ALERT_STATUS.NEW })
}
