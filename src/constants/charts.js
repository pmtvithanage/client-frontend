/**
 * Real-time chart constants (dygraphs).
 *
 * Dygraphs draws on `<canvas>`, so it cannot read CSS variables itself — the
 * wrapper resolves these variables from `getComputedStyle` every time the theme
 * changes (AGENTS.md §9).
 * @module constants/charts
 */

/** Default chart height in pixels. */
export const DYGRAPH_DEFAULT_HEIGHT = 220

/** Default ring-buffer capacity (points kept per chart). */
export const DYGRAPH_DEFAULT_MAX_POINTS = 900

/** Minimum delay between chart redraws while streaming (ms) — at most once per second. */
export const DYGRAPH_REFRESH_MS = 1000

/** CSS variables used for the axis, grid, labels and plot background. */
export const DYGRAPH_THEME_VARS = Object.freeze({
  axis: '--border',
  grid: '--border',
  label: '--muted',
  background: '--surface',
})

/** CSS variables used for the plotted series, in draw order. */
export const DYGRAPH_SERIES_VARS = Object.freeze([
  '--accent',
  '--sev-high',
  '--sev-low',
  '--sev-medium',
])

/** Fallback color when a CSS variable cannot be resolved. */
export const DYGRAPH_FALLBACK_COLOR = '#888888'

/** Line width of the plotted series (px). */
export const DYGRAPH_STROKE_WIDTH = 1.5

/** Axis tick label size (px). */
export const DYGRAPH_AXIS_LABEL_FONT_SIZE = 11

/** Zooming/panning redraws instantly (no animation on live charts). */
export const DYGRAPH_ANIMATED_ZOOMS = false
