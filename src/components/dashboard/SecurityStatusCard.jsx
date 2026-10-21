import InfoTip from '../common/InfoTip.jsx'
import SecurityGauge from './SecurityGauge.jsx'
import WidgetCard from './WidgetCard.jsx'
import { useOverview } from '../../hooks/useOverview.js'
import { SCORE_CEILING, SCORE_LABEL_BANDS, SCORE_WEIGHTS } from '../../constants/security.js'

function formulaText() {
  const bands = SCORE_LABEL_BANDS.map((band) => `${band.label} ≥ ${band.min}`).join(', ')
  return (
    `Score = ${SCORE_CEILING} − (urgent × ${SCORE_WEIGHTS.urgent} + serious × ${SCORE_WEIGHTS.serious} + ` +
    `moderate × ${SCORE_WEIGHTS.moderate} + minor × ${SCORE_WEIGHTS.minor}), clamped to 0–${SCORE_CEILING}. ` +
    `Bands: ${bands}, otherwise At risk.`
  )
}

export default function SecurityStatusCard() {
  const overview = useOverview()
  const score = overview.data?.security_score
  const counts = overview.data?.counts

  return (
    <WidgetCard
      title="Security status"
      subtitle="How your network is doing right now"
      isLoading={overview.isLoading}
      isError={overview.isError}
      error={overview.error}
      onRetry={overview.refetch}
      isEmpty={!overview.isLoading && !score}
      emptyTitle="No score yet"
      emptyDescription="Your score appears once the sensor has reported alerts."
      action={<InfoTip label="How is this calculated?" text={formulaText()} />}
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <SecurityGauge score={score?.score ?? 0} label={score?.label ?? 'Unknown'} />
        <div className="flex-1 w-full">
          <p className="text-sm leading-relaxed text-muted text-center sm:text-left">
            Your score is {score?.score ?? 0} out of {SCORE_CEILING}. It drops while alerts are still open - every open alert pulls it down, and urgent ones pull hardest.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface-2 p-2 text-center">
              <p className="text-xs text-muted">Open</p>
              <p className="font-medium text-text">{score?.open_alerts ?? counts?.open ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 p-2 text-center">
              <p className="text-xs text-muted">New</p>
              <p className="font-medium text-text">{counts?.new ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 p-2 text-center">
              <p className="text-xs text-muted">Resolved</p>
              <p className="font-medium text-text">{counts?.resolved ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 p-2 text-center">
              <p className="text-xs text-muted">Total</p>
              <p className="font-medium text-text">{counts?.total_alerts ?? 0}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted justify-center sm:justify-start">
            <span>Urgent: {counts?.urgent ?? 0}</span>
            <span>*</span>
            <span>Serious: {counts?.serious ?? 0}</span>
            <span>*</span>
            <span>Moderate: {counts?.moderate ?? 0}</span>
            <span>*</span>
            <span>Minor: {counts?.minor ?? 0}</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
