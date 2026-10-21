import { describe, expect, it } from 'vitest'

import { alertMatchesFilters, compareAlerts, deviceIp, mergeAlertRows, otherIp } from '../utils/alerts.js'
import {
  filtersToApiParams,
  hasActiveFilters,
  parseAlertFilters,
  serializeAlertFilters,
} from '../utils/alertFilters.js'
import { formatBytes, formatDuration } from '../utils/format.js'
import { toCsv } from '../utils/csv.js'

const OUTBOUND = {
  id: 'ACM-ALT-000001',
  ts: '2026-10-21T09:00:00.000Z',
  severity_tier: 'CRITICAL',
  status: 'new',
  src_ip: '192.168.8.100',
  dst_ip: '20.205.243.168',
  dst_port: 443,
  protocol: 'TCP',
  direction: 'outbound',
  category: 'Malware communication',
  signature: 'ET MALWARE test',
}

const INBOUND = { ...OUTBOUND, id: 'ACM-ALT-000002', src_ip: '95.216.10.4', dst_ip: '192.168.8.12', direction: 'inbound' }

describe('alert view-model utils', () => {
  it('picks the client-side address by direction', () => {
    expect(deviceIp(OUTBOUND)).toBe('192.168.8.100')
    expect(otherIp(OUTBOUND)).toBe('20.205.243.168')
    expect(deviceIp(INBOUND)).toBe('192.168.8.12')
    expect(otherIp(INBOUND)).toBe('95.216.10.4')
  })

  it('matches live arrivals against the same rules as the API', () => {
    const filters = { severity: ['CRITICAL'], status: ['new'], category: '', q: 'malware', from: null, to: null }
    expect(alertMatchesFilters(OUTBOUND, filters)).toBe(true)
    expect(alertMatchesFilters({ ...OUTBOUND, severity_tier: 'LOW' }, filters)).toBe(false)
    expect(
      alertMatchesFilters({ ...OUTBOUND, category: 'Port scan' }, { ...filters, q: '', category: 'Malware communication' }),
    ).toBe(false)
  })

  it('sorts and merges like the list page', () => {
    const low = { ...OUTBOUND, id: 'a', severity_tier: 'LOW', ts: '2026-10-21T10:00:00.000Z' }
    const merged = mergeAlertRows([low], [OUTBOUND, INBOUND], 'severity_tier:desc')
    expect(merged.map((entry) => entry.severity_tier)).toEqual(['CRITICAL', 'CRITICAL', 'LOW'])
    expect(compareAlerts(OUTBOUND, low, 'ts:asc')).toBeLessThan(0)
  })
})

describe('alert filter <-> URL utils', () => {
  it('round-trips filters through the query string', () => {
    const filters = parseAlertFilters(
      new URLSearchParams('severity=HIGH,CRITICAL&status=new&q=20.205&range=7d&sort=severity_tier:desc'),
    )
    expect(filters.severity).toEqual(['HIGH', 'CRITICAL'])
    expect(filters.status).toEqual(['new'])
    expect(filters.range).toBe('7d')
    expect(filters.sort).toBe('severity_tier:desc')
    expect(hasActiveFilters(filters)).toBe(true)

    const params = serializeAlertFilters(filters)
    expect(params.get('severity')).toBe('HIGH,CRITICAL')
    expect(params.get('range')).toBe('7d')
    const again = parseAlertFilters(params)
    expect(again).toEqual(filters)
  })

  it('drops unknown values and defaults', () => {
    const filters = parseAlertFilters(new URLSearchParams('severity=NOPE&range=1y&sort=bogus&attention=1'))
    expect(filters.severity).toEqual([])
    expect(filters.range).toBe('24h')
    expect(filters.sort).toBe('ts:desc')
    expect(filters.attention).toBe(true)
    expect(hasActiveFilters(parseAlertFilters(new URLSearchParams()))).toBe(false)
  })

  it('lets "only needs attention" override severity and status', () => {
    const filters = parseAlertFilters(new URLSearchParams('attention=1&category=Port%20scan'))
    const params = filtersToApiParams(filters, Date.parse('2026-10-21T00:00:00.000Z'))
    expect(params.severity).toEqual(['HIGH', 'CRITICAL'])
    expect(params.status).toEqual(['new'])
    expect(params.category).toBe('Port scan')
    expect(params.from).toBe('2026-10-20T00:00:00.000Z')
    expect(params.to).toBe('2026-10-21T00:00:00.000Z')
  })
})

describe('format utils', () => {
  it('formats friendly sizes and durations', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(18_400_000)).toBe('17.5 MB')
    expect(formatBytes(null)).toBe('—')
    expect(formatDuration(420)).toBe('420 ms')
    expect(formatDuration(42_000)).toBe('42 s')
    expect(formatDuration(90_000)).toBe('1 min 30 s')
    expect(formatDuration(7_200_000)).toBe('2 h')
  })
})

describe('csv utils', () => {
  it('escapes quotes, commas and newlines', () => {
    const csv = toCsv(['id', 'note'], [['A,1', 'said "hi"']])
    expect(csv).toBe('id,note\r\n"A,1","said ""hi"""\r\n')
  })
})
