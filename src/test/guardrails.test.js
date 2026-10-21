/**
 * Cross-cutting guards for the client portal.
 *
 * Enforces AGENTS.md rules that are easy to regress:
 * - UI must never import from the dummy layer directly.
 * - API modules must go through `http.js` / the dummy bridge pattern; they must
 *   not attach `client_id` or `sensor_id` to outgoing request bodies/params.
 * - Alert text must never be injected via `dangerouslySetInnerHTML`.
 * @module test/guardrails.test
 */

import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'vitest'

const SRC = path.resolve(__dirname, '..')
const COMPONENTS_PAGES = ['components', 'pages']
const API_DIR = path.join(SRC, 'api')

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(js|jsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

describe('guardrails', () => {
  it('components and pages never import from src/dummy directly', () => {
    for (const base of COMPONENTS_PAGES) {
      const files = walk(path.join(SRC, base))
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8')
        if (/from\s+['"][^'"]*\/dummy\//.test(content)) {
          throw new Error(`${path.relative(SRC, file)} imports from src/dummy`)
        }
      }
    }
  })

  it('no dangerouslySetInnerHTML anywhere in src', () => {
    const files = walk(SRC)
    for (const file of files) {
      if (file.includes('/test/')) continue
      const content = fs.readFileSync(file, 'utf8')
      if (content.includes('dangerouslySetInnerHTML')) {
        throw new Error(`${path.relative(SRC, file)} uses dangerouslySetInnerHTML`)
      }
    }
  })

  it('api functions do not attach client_id or sensor_id to requests', () => {
    const files = walk(API_DIR)
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8')
      if (/\bclient_id\b/.test(content) && !/\/\/.*client_id/.test(content)) {
        // allow comments only
        const lines = content.split('\n')
        for (const line of lines) {
          if (line.includes('client_id') && !line.trim().startsWith('//')) {
            throw new Error(`${path.relative(SRC, file)} references client_id outside comments`)
          }
        }
      }
      if (/\bsensor_id\b/.test(content) && !/\/\/.*sensor_id/.test(content)) {
        const lines = content.split('\n')
        for (const line of lines) {
          if (line.includes('sensor_id') && !line.trim().startsWith('//')) {
            throw new Error(`${path.relative(SRC, file)} references sensor_id outside comments`)
          }
        }
      }
    }
  })
})
