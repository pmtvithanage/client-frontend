import { Pause, Play, Sparkles } from 'lucide-react'

/**
 * Live-feed controls above the alerts list: new alerts pill and pause/resume
 * placed in the top-right area.
 * @param {{pendingCount: number, paused: boolean, onShow: () => void, onTogglePause: () => void}} props
 */
export default function NewAlertsBanner({ pendingCount, paused, onShow, onTogglePause }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex items-start justify-between px-3">
      <div className="pointer-events-auto" />
      <div className="pointer-events-auto flex items-center gap-2">
        {pendingCount > 0 ? (
          <button
            type="button"
            onClick={onShow}
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent shadow-sm backdrop-blur hover:bg-accent/25"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {pendingCount} new alert{pendingCount === 1 ? '' : 's'}, click to show
          </button>
        ) : null}
        <button
          type="button"
          onClick={onTogglePause}
          aria-pressed={paused}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-sm hover:bg-surface-2 hover:text-text"
        >
          {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          {paused ? 'Resume live' : 'Pause live'}
        </button>
      </div>
    </div>
  )
}
