import { describe, expect, it } from 'vitest'

import { makeId, paginate, randomInt, rngFloat, seededRandom } from '../dummy/helpers.js'

describe('dummy helpers', () => {
  it('makeId prefixes and stays unique', () => {
    const a = makeId('alert')
    const b = makeId('alert')
    expect(a).toMatch(/^alert_/)
    expect(a).not.toBe(b)
  })

  it('paginate returns a cursor until the last page', () => {
    const list = Array.from({ length: 5 }, (_, i) => i)
    const first = paginate(list, { limit: 2 })
    expect(first.items).toEqual([0, 1])
    expect(first.next_cursor).toBe('2')
    expect(first.total).toBe(5)

    const last = paginate(list, { limit: 2, cursor: '4' })
    expect(last.items).toEqual([4])
    expect(last.next_cursor).toBeNull()
  })

  it('seededRandom reproduces the same sequence for the same seed', () => {
    const first = seededRandom(42)
    const second = seededRandom(42)
    const sequenceA = [first(), first(), first()]
    const sequenceB = [second(), second(), second()]
    expect(sequenceA).toEqual(sequenceB)
    expect(sequenceA[0]).not.toBe(sequenceA[1])
  })

  it('rngFloat stays inside the requested range', () => {
    const rng = seededRandom(7)
    for (let i = 0; i < 50; i += 1) {
      const value = rngFloat(rng, 0.5, 2.5, 4)
      expect(value).toBeGreaterThanOrEqual(0.5)
      expect(value).toBeLessThan(2.5)
    }
  })

  it('randomInt stays inclusive of both bounds', () => {
    for (let i = 0; i < 50; i += 1) {
      const value = randomInt(1, 3)
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(3)
    }
  })
})
