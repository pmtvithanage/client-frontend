import { beforeEach, describe, expect, it } from 'vitest'

import { getDestinations, getDevices, getPorts, getProtocols } from '../dummy/network.dummy.js'
import { geoForIp } from '../constants/network.js'
import { ROLES } from '../constants/nav.js'
import { createDemoSession } from '../utils/session.js'

const PROFILE = {
  role: ROLES.OWNER,
  name: 'Amara Perera',
  email: 'owner@acmetextiles.lk',
  client_id: 'client_acme_textiles',
}

beforeEach(() => {
  createDemoSession(PROFILE)
})

describe('network dummy views (single sensor, single client)', () => {
  it('devices carry first/last seen, alert counts and a worst risk tier', async () => {
    const { data, meta } = await getDevices()
    expect(data.length).toBe(meta.total)
    expect(data.length).toBeGreaterThan(0)
    for (const device of data) {
      expect(device.ip).toBeTruthy()
      expect(device.hostname).toBeTruthy()
      expect(Date.parse(device.first_seen)).not.toBeNaN()
      expect(Date.parse(device.last_seen)).not.toBeNaN()
      expect(device.alert_count).toBeGreaterThanOrEqual(0)
      if (device.worst_tier !== null) {
        expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(device.worst_tier)
      }
    }
    expect(data.some((device) => device.worst_tier !== null)).toBe(true)
  })

  it('destinations expose organisation, country, flows and alerts', async () => {
    const { data } = await getDestinations()
    expect(data.length).toBeGreaterThan(0)
    for (const row of data) {
      const geo = geoForIp(row.ip)
      expect(row.org).toBe(geo?.org ?? null)
      expect(row.country).toBe(geo?.country ?? null)
      expect(row.flow_count).toBeGreaterThan(row.alert_count)
      expect(row.alert_count).toBeGreaterThan(0)
    }
    expect(data.some((row) => row.org !== null)).toBe(true)
  })

  it('ports keep their plain-language service names', async () => {
    const { data } = await getPorts()
    for (const row of data) {
      expect(Number.isInteger(row.port)).toBe(true)
      expect(row.service).toBeTruthy()
      expect(row.alert_count).toBeGreaterThan(0)
    }
  })

  it('protocols report a share of all alerts', async () => {
    const { data } = await getProtocols()
    expect(data.length).toBeGreaterThan(0)
    for (const row of data) {
      expect(['TCP', 'UDP', 'ICMP', 'OTHER']).toContain(row.protocol)
      expect(row.share).toBeGreaterThan(0)
      expect(row.alert_count).toBeGreaterThan(0)
    }
    const totalShare = data.reduce((sum, row) => sum + row.share, 0)
    expect(totalShare).toBeLessThanOrEqual(100)
    expect(data.map((row) => row.protocol)).toContain('TCP')
  })
})
