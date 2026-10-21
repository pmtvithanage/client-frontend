import { describe, expect, it } from 'vitest'

import { DELAY_WARN_ITEMS, OFFLINE_AFTER_MS } from '../constants/sensor.js'
import { healthVerdict, supportSubject } from '../utils/sensor.js'

const NOW = Date.now()

function sensor(overrides = {}) {
  return {
    id: 'sensor_acm_01',
    status: 'online',
    health: 'healthy',
    last_seen: new Date(NOW - 8_000).toISOString(),
    kafka_lag: 4,
    ingest_errors: 0,
    ...overrides,
  }
}

describe('sensor utils', () => {
  it('is Offline when the sensor is not online or has no usable report', () => {
    expect(healthVerdict(null)).toBe('offline')
    expect(healthVerdict(sensor({ status: 'offline' }))).toBe('offline')
    expect(healthVerdict(sensor({ last_seen: 'not-a-date' }))).toBe('offline')
    expect(
      healthVerdict(sensor({ last_seen: new Date(NOW - OFFLINE_AFTER_MS - 1_000).toISOString() })),
    ).toBe('offline')
  })

  it('is Degraded when reporting with delays or read errors', () => {
    expect(healthVerdict(sensor({ health: 'degraded' }))).toBe('degraded')
    expect(healthVerdict(sensor({ kafka_lag: DELAY_WARN_ITEMS + 1 }))).toBe('degraded')
    expect(healthVerdict(sensor({ ingest_errors: 2 }))).toBe('degraded')
  })

  it('is Healthy when reporting on time with nothing waiting or failing', () => {
    expect(healthVerdict(sensor())).toBe('healthy')
    expect(healthVerdict(sensor({ kafka_lag: DELAY_WARN_ITEMS }))).toBe('healthy')
  })

  it('builds the support subject from this sensor id only', () => {
    expect(supportSubject(sensor())).toBe('Help with sensor sensor_acm_01')
    expect(supportSubject(sensor({ id: 'sensor_other' }))).toBe('Help with sensor sensor_other')
    expect(supportSubject(null)).toBe('Help with my sensor')
  })
})
