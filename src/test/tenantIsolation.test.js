/**
 * Tenant isolation tests: log in as each demo client and verify each API
 * function returns only that client's data, rejects missing sessions, and no
 * response leaks other client names/ids.
 * @module test/tenantIsolation.test
 */

import { describe, expect, it } from 'vitest'

import { login, logout, me } from '../api/auth.js'
import { listAlerts } from '../api/alerts.js'
import { getDestinations, getDevices, getPorts, getProtocols } from '../api/network.js'
import {
  getNotificationPreferences,
  listNotifications,
} from '../api/notifications.js'
import { getOverview } from '../api/overview.js'
import { getReport } from '../api/reports.js'
import { getChecklist, getSensor } from '../api/sensor.js'
import { listRequests } from '../api/support.js'
import { listMembers } from '../api/team.js'
import { clearSession } from '../utils/session.js'

const CLIENTS = [
  {
    email: 'owner@acme.test',
    password: 'owner',
    id: 'client_acme_textiles',
    name: 'Acme Textiles',
    sensor_id: 'sensor_acm_01',
  },
  {
    email: 'owner@lanka.test',
    password: 'owner',
    id: 'client_lanka_logistics',
    name: 'Lanka Logistics',
    sensor_id: 'sensor_lkl_01',
  },
  {
    email: 'owner@sunrise.test',
    password: 'owner',
    id: 'client_sunrise_hospital',
    name: 'Sunrise Hospital',
    sensor_id: 'sensor_snr_01',
  },
]

function noLeak(value, client) {
  const text = JSON.stringify(value).toLowerCase()
  if (text.includes('lanka logistics')) return client.id !== 'client_lanka_logistics'
  if (text.includes('sunrise hospital')) return client.id !== 'client_sunrise_hospital'
  if (text.includes('client_lanka_logistics')) return client.id !== 'client_lanka_logistics'
  if (text.includes('client_sunrise_hospital')) return client.id !== 'client_sunrise_hospital'
  if (text.includes('sensor_lkl_01')) return client.id !== 'client_lanka_logistics'
  if (text.includes('sensor_snr_01')) return client.id !== 'client_sunrise_hospital'
  return true
}

async function withClient(client, fn) {
  clearSession()
  const session = await login(client.email, client.password)
  expect(session.client.id).toBe(client.id)
  try {
    return await fn()
  } finally {
    await logout()
    clearSession()
  }
}

describe('tenant isolation', () => {
  it('rejects all API calls without a session', async () => {
    clearSession()
    await expect(me()).rejects.toMatchObject({ status: 401 })
    await expect(getOverview()).rejects.toMatchObject({ status: 401 })
    await expect(listAlerts()).rejects.toMatchObject({ status: 401 })
    await expect(listAlerts()).rejects.toMatchObject({ status: 401 })
    await expect(getReport()).rejects.toMatchObject({ status: 401 })
    await expect(getSensor()).rejects.toMatchObject({ status: 401 })
    await expect(getChecklist()).rejects.toMatchObject({ status: 401 })
    await expect(listNotifications()).rejects.toMatchObject({ status: 401 })
    await expect(getNotificationPreferences()).rejects.toMatchObject({ status: 401 })
    await expect(listRequests()).rejects.toMatchObject({ status: 401 })
    await expect(listMembers()).rejects.toMatchObject({ status: 401 })
    await expect(getDevices()).rejects.toMatchObject({ status: 401 })
    await expect(getDestinations()).rejects.toMatchObject({ status: 401 })
    await expect(getPorts()).rejects.toMatchObject({ status: 401 })
    await expect(getProtocols()).rejects.toMatchObject({ status: 401 })
  })

  it('each client only sees their own data across all read APIs', async () => {
    for (const client of CLIENTS) {
      await withClient(client, async () => {
        expect(noLeak(await me(), client)).toBe(true)
        expect(noLeak(await getOverview(), client)).toBe(true)
        expect(noLeak(await listAlerts(), client)).toBe(true)
        expect(noLeak(await getReport(), client)).toBe(true)
        expect(noLeak(await getSensor(), client)).toBe(true)
        expect(noLeak(await getChecklist(), client)).toBe(true)
        expect(noLeak(await listNotifications(), client)).toBe(true)
        expect(noLeak(await getNotificationPreferences(), client)).toBe(true)
        expect(noLeak(await listRequests(), client)).toBe(true)
        expect(noLeak(await listMembers(), client)).toBe(true)
        expect(noLeak(await getDevices(), client)).toBe(true)
        expect(noLeak(await getDestinations(), client)).toBe(true)
        expect(noLeak(await getPorts(), client)).toBe(true)
        expect(noLeak(await getProtocols(), client)).toBe(true)
      })
    }
  })
})
