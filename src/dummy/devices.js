/**
 * Builds the device list of a client's own network (one list per client).
 *
 * Devices are the machines inside the customer's LAN: alerts are generated
 * between these addresses and the internet, so "devices seen" and "alert
 * counts" always agree.
 * @module dummy/devices
 */

import { DEVICE_COUNT, DEVICE_HOST_MAX, DEVICE_ROLES } from '../constants/network.js'
import { rngInt, seededRandom } from './helpers.js'

/**
 * Create the devices for one client seed.
 * Deterministic: the same seed always produces the same addresses and names.
 * @param {object} seed Entry from `constants/clients.js`.
 * @returns {Array<{ip: string, hostname: string, first_seen: string, last_seen: string}>}
 */
export function buildDevices(seed) {
  const rng = seededRandom(seed.rngSeed)
  const online = seed.sensor.status === 'online'
  const usedIps = new Set()
  const counters = {}
  const devices = []

  for (const fixed of seed.fixed_devices) {
    usedIps.add(fixed.ip)
    devices.push(makeDevice(rng, fixed.ip, fixed.hostname, online))
  }

  for (let i = devices.length; i < DEVICE_COUNT; i += 1) {
    const role = DEVICE_ROLES[i % DEVICE_ROLES.length]
    counters[role] = (counters[role] ?? 0) + 1
    const number = String(counters[role]).padStart(2, '0')
    const hostname = `${seed.code}-${role}-${number}`
    if (counters[role] > DEVICE_HOST_MAX) continue

    const ip = nextFreeIp(rng, seed.ip_prefixes, usedIps)
    usedIps.add(ip)
    devices.push(makeDevice(rng, ip, hostname, online))
  }

  return devices.sort((a, b) => ipSortKey(a.ip).localeCompare(ipSortKey(b.ip)))
}

function makeDevice(rng, ip, hostname, online) {
  const ageDays = rngInt(rng, 30, 90)
  const quietMs = online ? rngInt(rng, 10, 1800) : rngInt(rng, 3600, 172800)
  return {
    ip,
    hostname,
    first_seen: new Date(Date.now() - ageDays * 86_400_000).toISOString(),
    last_seen: new Date(Date.now() - quietMs * 1000).toISOString(),
  }
}

function nextFreeIp(rng, prefixes, usedIps) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const prefix = prefixes[attempt % prefixes.length]
    const ip = `${prefix}.${rngInt(rng, 2, 250)}`
    if (!usedIps.has(ip)) return ip
  }
  return `${prefixes[0]}.${usedIps.size + 2}`
}

function ipSortKey(ip) {
  return ip
    .split('.')
    .map((part) => part.padStart(3, '0'))
    .join('.')
}
