import InfoTip from '../common/InfoTip.jsx'
import SecurityGauge from './SecurityGauge.jsx'
import WidgetCard from './WidgetCard.jsx'
import { useOverview } from '../../hooks/useOverview.js'
import { SCORE_CEILING, SCORE_LABEL_BANDS, SCORE_WEIGHTS } from '../../constants/security.js'

/** The score formula, spelled out from the same constants the score uses. */
function formulaText() {
  const bands = SCORE_LABEL_BANDS.map((band) => `${band.label} ≥ ${band.min}`).join(', ')
  return (
    `Score = ${SCORE_CEILING} − (urgent × ${SCORE_WEIGHTS.urgent} + serious × ${SCORE_WEIGHTS.serious} + ` +
    `moderate × ${SCORE_WEIGHTS.moderate} + minor × ${SCORE_WEIGHTS.minor}), clamped to 0–${SCORE_CEILING}. ` +
    `Bands: ${bands}, otherwise At risk.`
  )
}

/**
 * Hero widget: the security score gauge, its band label, a plain sentence and
 * the "How is this calculated?" formula tip.
 */
export default function SecurityStatusCard() {
  const overview = useOverview()
  const score = overview.data?.security_score

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
        <SecurityGauge score={score.score} label={score.label} />
        <div className="max-w-md text-center sm:text-left">
          <p className="text-sm leading-relaxed text-muted">
            Your score is {score.score} out of {SCORE_CEILING}. It drops while alerts are still open —
            every open alert pulls it down, and urgent ones pull hardest.
          </p>
          <p className="mt-3 text-sm text-text">
            {score.open_alerts} alert{score.open_alerts === 1 ? ' is' : 's are'} still open.
          </p>
        </div>
      </div>
    </WidgetCard>
  )
}
