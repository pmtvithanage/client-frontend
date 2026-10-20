/**
 * Theme constants for the client portal (AGENTS.md §6 — dark is the default).
 * @module constants/theme
 */

/** Themes the portal can render. */
export const THEME = Object.freeze({
  DARK: 'dark',
  LIGHT: 'light',
})

/**
 * Theme used when nothing is stored. The stored theme always wins; when the
 * user has never chosen, `prefers-color-scheme` decides and dark is the
 * fallback for browsers without a preference.
 */
export const DEFAULT_THEME = THEME.DARK

/** Media query used to honour the operating system preference. */
export const LIGHT_SCHEME_QUERY = '(prefers-color-scheme: light)'
