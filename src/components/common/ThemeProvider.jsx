import { useCallback, useEffect, useMemo, useState } from 'react'

import { THEME_STORAGE_KEY } from '../../constants/storage.js'
import { ThemeContext } from '../../hooks/useTheme.js'

const LIGHT_CLASS = 'light'
const DARK_CLASS = 'dark'

/** Read the stored theme, defaulting to dark (AGENTS.md §6 — dark is default). */
function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark'
  } catch {
    return 'dark'
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
