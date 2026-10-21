import { describe, expect, it } from 'vitest'

import { isOwner } from '../utils/roles.js'

describe('owner/member permissions', () => {
  it('isOwner true only for owner', () => {
    expect(isOwner({ role: 'owner' })).toBe(true)
    expect(isOwner({ role: 'member' })).toBe(false)
    expect(isOwner(null)).toBe(false)
  })
})
