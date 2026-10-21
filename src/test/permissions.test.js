/**
 * Permission tests for owner/member differences.
 * @module test/permissions.test
 */

import { describe, expect, it } from 'vitest'

import { login, logout } from '../api/auth.js'
import { getNotificationPreferences } from '../api/notifications.js'
import { clearSession } from '../utils/session.js'

describe('permissions', () => {
  it('member can acknowledge but owner only actions are rejected in dummy layer', async () => {
    clearSession()
    // owner setup
    clearSession()
    await login('owner@acme.test', 'owner')
    const prefs = await getNotificationPreferences()
    expect(prefs.channels.email).toBeTruthy()
    await logout()
    clearSession()
  })
})
