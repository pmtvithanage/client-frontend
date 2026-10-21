import { describe, expect, it } from 'vitest'

import { REPORT_BUSIEST_LIMIT } from '../constants/reports.js'
import { buildPeriodStats, previousRange, resolveReportRange } from '../dummy/reportStats.js'
import { recommendActions } from '../utils/recommendations.js'

function report(overrides = {}) {
  return {
    summary: {
      total_alerts: 0,
      urgent: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      open: 0,
      resolved: 0,
      expected: 0,
      mean_ack_ms: null,
      sensor_uptime_pct: 99.5,
      ...overrides.summary,
    },
    score_change: overrides.score_change ?? 0,
    top_categories: overrides.top_categories ?? [],
  }
}

describe('resolveReportRange', () => {
  it('resolves the four presets to whole days/months', () => {
    for (const period of ['week', 'last_week', 'month', 'last_month']) {
      const range = resolveReportRange(period)
      expect(range.from.getTime()).toBeLessThan(range.to.getTime())
    }
  })

  it('rejects an incomplete or reversed custom range', () => {
    expect(() => resolveReportRange('custom', {})).toThrow()
    expect(() =>
      resolveReportRange('custom', { from: '2026-10-10', to: '2026-10-01' }),
    ).toThrow()
  })

  it('accepts a custom range and derives the previous window', () => {
    const range = resolveReportRange('custom', { from: '2026-10-01', to: '2026-10-07' })
    const previous = previousRange(range)
    expect(previous.to.getTime()).toBeLessThan(range.from.getTime())
    expect(previous.from.getTime()).toBeLessThan(previous.to.getTime())
  })
})

describe('buildPeriodStats', () => {
  it('counts risk, statuses, hours and acknowledgement times', () => {
    const range = resolveReportRange('custom', { from: '2026-10-01', to: '2026-10-02' })
    const ts = new Date(2026, 9, 1, 10, 0, 0).toISOString()
    const alerts = [
      {
        ts,
        severity_tier: 'CRITICAL',
        status: 'acknowledged',
        category: 'Port scan',
        dst_port: 443,
        acknowledged_at: new Date(Date.parse(ts) + 30 * 60_000).toISOString(),
      },
      { ts, severity_tier: 'LOW', status: 'new', category: 'Port scan', dst_port: 22 },
    ]
    const stats = buildPeriodStats(alerts, range)
    expect(stats.summary.total_alerts).toBe(2)
    expect(stats.summary.urgent).toBe(1)
    expect(stats.summary.minor).toBe(1)
    expect(stats.summary.mean_ack_ms).toBe(30 * 60_000)
    expect(stats.hours[10].count).toBe(2)
    expect(stats.top_categories[0]).toEqual({ category: 'Port scan', count: 2 })
    expect(stats.busiest_days.length).toBeLessThanOrEqual(REPORT_BUSIEST_LIMIT)
  })
})

describe('recommendActions', () => {
  it('always returns between 3 and 5 plain-language actions', () => {
    const actions = recommendActions(report())
    expect(actions.length).toBeGreaterThanOrEqual(3)
    expect(actions.length).toBeLessThanOrEqual(5)
    for (const action of actions) expect(action.length).toBeGreaterThan(10)
  })

  it('prioritises urgent alerts and slow acknowledgement', () => {
    const actions = recommendActions(
      report({
        summary: { total_alerts: 10, urgent: 2, open: 3, mean_ack_ms: 2 * 60 * 60_000 },
      }),
    )
    expect(actions[0]).toContain('2')
    expect(actions.join(' ')).toContain('2 h')
  })

  it('flags low sensor uptime and a dominant category', () => {
    const actions = recommendActions(
      report({
        summary: { total_alerts: 10, sensor_uptime_pct: 90 },
        top_categories: [{ category: 'Port scan', count: 6 }],
      }),
    )
    expect(actions.join(' ')).toContain('90%')
    expect(actions.join(' ')).toContain('Port scan')
  })
})
