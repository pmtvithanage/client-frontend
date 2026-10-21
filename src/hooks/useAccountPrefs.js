import { useCallback, useEffect, useState } from 'react'

import { readAccountPrefs, writeAccountPrefs } from '../utils/accountPrefs.js'

/**
 * Read and persist local account preferences (timezone).
 * @param {string} [defaultTimezone] Fallback timezone.
 */
export function useAccountPrefs(defaultTimezone = 'Asia/Colombo') {
  const [prefs, setPrefs] = useState(() => readAccountPrefs())
  const timezone = prefs.timezone || defaultTimezone

  useEffect(() => {
    writeAccountPrefs(prefs)
  }, [prefs])

  const setTimezone = useCallback((value) => {
    setPrefs((current) => ({ ...current, timezone: value }))
  }, [])

  return { timezone, setTimezone, prefs }
}
