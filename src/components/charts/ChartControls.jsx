import { Pause, Play } from 'lucide-react'

/**
 * Header row above a live chart: the series legend on the left, pause/resume
 * and the `Back to live` button (shown after a zoom) on the right
 * (AGENTS.md §9). The legend is omitted when `labels` is not given.
 * @param {{labels?: string, paused: boolean, zoomed: boolean,
 *   onPauseToggle: () => void, onResetZoom: () => void, className?: string}} props
 */
export default function ChartControls({ labels, paused, zoomed, onPauseToggle, onResetZoom, className = '' }) {
  return (
    <div className={`mb-2 flex flex-wrap items-center justify-between gap-2 ${className}`}>
      {labels ? <p className="text-xs text-muted">{labels}</p> : null}
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
    </div>
  )
}
