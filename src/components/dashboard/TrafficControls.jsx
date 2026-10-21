import ChartControls from '../charts/ChartControls.jsx'
import ConnectionChip from './ConnectionChip.jsx'
import { TRAFFIC_WINDOWS } from '../../constants/dashboard.js'

/**
 * Control bar of the live-traffic widget: heading, time-window buttons,
 * pause/resume, `Back to live` (after a zoom) and the connection chip.
 * @param {{minutes: number, onWindowChange: (minutes: number) => void,
 *   paused: boolean, onTogglePause: () => void, zoomed: boolean,
 *   onBackToLive: () => void, lastPointRef: {current: number}}} props
 */
export default function TrafficControls({
  minutes,
  onWindowChange,
  paused,
  onTogglePause,
  zoomed,
  onBackToLive,
  lastPointRef,
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-text">Live traffic</h2>
        <p className="mt-0.5 text-sm text-muted">
          What your sensor is seeing right now, second by second.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1" role="group" aria-label="Time window">
          {TRAFFIC_WINDOWS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onWindowChange(value)}
              aria-pressed={minutes === value}
              className={
                minutes === value
                  ? 'rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-fg'
                  : 'rounded-md border border-border px-2 py-1 text-xs font-medium text-muted hover:bg-surface-2 hover:text-text'
              }
            >
              {value} min
            </button>
          ))}
        </div>
        <ChartControls
          paused={paused}
          zoomed={zoomed}
          onPauseToggle={onTogglePause}
          onResetZoom={onBackToLive}
          className="mb-0"
        />
        <ConnectionChip paused={paused} lastPointRef={lastPointRef} />
      </div>
    </div>
  )
}
