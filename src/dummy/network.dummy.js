/**
 * Dummy network views for the signed-in client: top external destinations,
 * top ports and the devices on the client's own network.
 *
 * "External" means "outside this client's private ranges" — addresses from
 * another tenant's ranges are never produced because every list is built from
 * the current tenant's alerts and devices only.
 * @module dummy/network.dummy
 */

import {
  DESTINATION_LIMIT,
  PORT_LIMIT,
  PORT_SERVICE,
  UNKNOWN_SERVICE,
} from '../constants/network.js'
import { delay } from './helpers.js'
import { countBy, topEntries } from './query.js'
import { getTenant } from './store.js'

function clampLimit(raw, fallback, max = 50) {
  const limit = Number(raw) || fallback
  return Math.min(Math.max(Math.trunc(limit), 1), max)
}

/** True when `ip` sits outside this client's own private ranges. */
function isExternal(tenant, ip) {
  if (!ip) return false
  return !tenant.ip_prefixes.some((prefix) => ip.startsWith(`${prefix}.`))
}

/** The external address of an alert, or null when both ends are internal. */
function externalOf(tenant, alert) {
  if (isExternal(tenant, alert.dst_ip)) return alert.dst_ip
  if (isExternal(tenant, alert.src_ip)) return alert.src_ip
  return null
}

/**
 * Top public destinations this client's traffic reached or was reached from.
 * @param {{limit?: number}} [params] Optional row limit (default 10).
 * @returns {Promise<{data: Array<{ip: string, alert_count: number, last_seen: string, top_category: string}>, meta: {total: number, limit: number}}>}}
 */
export async function getDestinations(params = {}) {
  await delay()
  const tenant = getTenant()
  const limit = clampLimit(params.limit, DESTINATION_LIMIT)
  const seen = new Map()

  for (const alert of tenant.alerts) {
    const ip = externalOf(tenant, alert)
    if (!ip) continue
    const entry = seen.get(ip) ?? { count: 0, last_seen: alert.ts, categories: [] }
    entry.count += 1
    if (Date.parse(alert.ts) > Date.parse(entry.last_seen)) entry.last_seen = alert.ts
    entry.categories.push(alert.category)
    seen.set(ip, entry)
  }

  const counts = {}
  for (const [ip, entry] of seen) counts[ip] = entry.count
  const data = topEntries(counts, limit).map(({ key, count }) => {
    const entry = seen.get(key)
    const top = topEntries(countBy(entry.categories, (c) => c), 1)[0]
    return { ip: key, alert_count: count, last_seen: entry.last_seen, top_category: top?.key ?? '' }
  })

  return { data, meta: { total: seen.size, limit } }
}

/**
 * Top destination ports seen in this client's alerts.
 * @param {{limit?: number}} [params] Optional row limit (default 8).
 * @returns {Promise<{data: Array<{port: number, service: string, alert_count: number}>, meta: {total: number, limit: number}}>}}
 */
export async function getPorts(params = {}) {
  await delay()
  const tenant = getTenant()
  const limit = clampLimit(params.limit, PORT_LIMIT)
  const counts = countBy(tenant.alerts, (alert) => String(alert.dst_port))
  const total = Object.keys(counts).length
  const data = topEntries(counts, limit).map(({ key, count }) => {
    const port = Number(key)
    return { port, service: PORT_SERVICE[port] ?? UNKNOWN_SERVICE, alert_count: count }
  })
  return { data, meta: { total, limit } }
}

/**
 * Devices seen on the client's own network, with first/last seen and how many
 * alerts each one is involved in.
 * @returns {Promise<{data: Array<{ip: string, hostname: string, first_seen: string, last_seen: string, alert_count: number}>, meta: {total: number}>}}
 */
export async function getDevices() {
  await delay()
  const tenant = getTenant()
  const perIp = new Map()

  for (const alert of tenant.alerts) {
    for (const ip of [alert.src_ip, alert.dst_ip]) {
      const entry = perIp.get(ip) ?? { count: 0, first: alert.ts, last: alert.ts }
      entry.count += 1
      if (Date.parse(alert.ts) < Date.parse(entry.first)) entry.first = alert.ts
      if (Date.parse(alert.ts) > Date.parse(entry.last)) entry.last = alert.ts
      perIp.set(ip, entry)
    }
  }

  const data = tenant.devices.map((device) => {
    const alerts = perIp.get(device.ip)
    return {
      ip: device.ip,
      hostname: device.hostname,
      first_seen:
        alerts && Date.parse(alerts.first) < Date.parse(device.first_seen)
          ? alerts.first
          : device.first_seen,
      last_seen:
        alerts && Date.parse(alerts.last) > Date.parse(device.last_seen)
          ? alerts.last
          : device.last_seen,
      alert_count: alerts?.count ?? 0,
    }
  })

  return { data, meta: { total: data.length } }
}
