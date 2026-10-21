import { ACCOUNT_PREFS_KEY } from '../constants/storage.js'

/**
 * Read locally stored account preferences.
 * @returns {{timezone?: string, theme?: string}}
 */
export function readAccountPrefs() {
  try {
    const raw = localStorage.getItem(ACCOUNT_PREFS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

/**
 * Write account preferences to localStorage.
 * @param {{timezone?: string, theme?: string}} prefs
 */
export function writeAccountPrefs(prefs) {
  try {
    localStorage.setItem(ACCOUNT_PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // Ignore storage failures.
  }
}
