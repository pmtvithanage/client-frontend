import { describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import DygraphChart from '../components/charts/DygraphChart.jsx'

// Mock dygraphs
vi.mock('dygraphs', () => {
  const instances = []
  class MockDygraph {
    constructor(el, data, opts) {
      this.el = el
      this.data = data
      this.opts = opts
      this.destroyed = false
      instances.push(this)
      MockDygraph.instances = instances
    }
    updateOptions(opts) {
      this.opts = { ...this.opts, ...opts }
    }
    destroy() {
      this.destroyed = true
    }
    resize() {}
  }
  return { default: MockDygraph }
})

describe('DygraphChart', () => {
  it('creates one instance per mount and destroys on unmount', async () => {
    const Dygraph = (await import('dygraphs')).default
    Dygraph.instances = []
    const data = [[new Date('2026-01-01T00:00:00Z'), 1]]
    const { unmount } = render(
      <DygraphChart
        data={data}
        labels={['time', 'value']}
        ariaLabel="Test chart"
        seriesColors={['#fff']}
        axisColor="#ccc"
        gridColor="#333"
        backgroundColor="#000"
        textColor="#fff"
        labelColor="#999"
      />,
    )
    await waitFor(() => expect(Dygraph.instances.length).toBe(1))
    const inst = Dygraph.instances[0]
    unmount()
    expect(inst.destroyed).toBe(true)
  })
})
