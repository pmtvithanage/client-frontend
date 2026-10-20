import { Pause, Play } from 'lucide-react'

/**
 * Controls rendered above a live chart: pause/resume plus a `Back to live`
 * button that appears after the user zooms (AGENTS.md §9).
 * @param {{paused: boolean, zoomed: boolean, onPauseToggle: () => void,
 *   onResetZoom: () => void}} props
 */
export default function ChartControls({ paused, zoomed, onPauseToggle, onResetZoom }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onPauseToggle}
        aria-label={paused ? 'Resume chart' : 'Pause chart'}
        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted hover:bg-surface-2 hover:text-text"
      >
        {paused ? (
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {paused ? 'Resume' : 'Pause'}
      </button>
      {zoomed ? (
        <button
          type="button"
          onClick={onResetZoom}
          className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-fg"
        >
          Back to live
        </button>
      ) : null}
    </div>
  )
}
