import { useCallback, useEffect, useMemo, useState } from 'react'

import { THEME_STORAGE_KEY } from '../../constants/storage.js'
import { DEFAULT_THEME, LIGHT_SCHEME_QUERY, THEME } from '../../constants/theme.js'
import { ThemeContext } from '../../hooks/useTheme.js'

const LIGHT_CLASS = 'light'
const DARK_CLASS = 'dark'

/**
 * Read the stored theme. When nothing is stored, the operating system
 * preference decides (`prefers-color-scheme`), with dark as the fallback —
 * dark is the portal's default (AGENTS.md §4).
 * @returns {string} `dark` | `light`
 */
function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === THEME.LIGHT || stored === THEME.DARK) return stored
  } catch {
    // Storage unavailable; fall through to the system preference.
  }
  try {
    return window.matchMedia(LIGHT_SCHEME_QUERY).matches ? THEME.LIGHT : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

/**
 * Applies the theme to `<html>` and exposes it to the tree.
 * Dark is the default; the user's choice is persisted in localStorage.
 * @param {{children: React.ReactNode}} props
 */
export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle(LIGHT_CLASS, theme === 'light')
    root.classList.toggle(DARK_CLASS, theme !== 'light')
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Nothing persisted when storage is unavailable.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(
    () => ({ theme, isDark: theme !== 'light', setTheme, toggleTheme }),
    [theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
