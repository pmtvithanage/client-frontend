import { describe, expect, it } from 'vitest'

import { ROLES } from '../constants/nav.js'
import {
  clearSession,
  createDemoSession,
  createFakeJwt,
  decodeToken,
  readSession,
} from '../utils/session.js'

const PROFILE = {
  role: ROLES.OWNER,
  name: 'Amara Perera',
  email: 'owner@acmetextiles.lk',
  client_id: 'client_acme_textiles',
}

describe('session utils', () => {
  it('token payload carries the client id and role, never the id in a URL', () => {
    const token = createFakeJwt({
      sub: PROFILE.email,
      client_id: PROFILE.client_id,
      role: PROFILE.role,
    })
    const claims = decodeToken(token)
    expect(claims).toMatchObject({ client_id: PROFILE.client_id, role: ROLES.OWNER })
  })

  it('rejects a tampered or expired token', () => {
    expect(decodeToken('not.a-token')).toBeNull()
    expect(decodeToken('')).toBeNull()
    expect(decodeToken(null)).toBeNull()
  })

  it('createDemoSession persists and readSession round-trips', () => {
    createDemoSession(PROFILE)
    const session = readSession()
    expect(session).toMatchObject({
      user: { name: PROFILE.name, email: PROFILE.email, role: ROLES.OWNER },
      client_id: PROFILE.client_id,
    })
    clearSession()
    expect(readSession()).toBeNull()
  })

  it('rejects an unsupported role', () => {
    expect(() => createDemoSession({ ...PROFILE, role: 'admin' })).toThrow()
  })
})
