import { GAUGE, SCORE_TONE_VARS } from '../../constants/dashboard.js'
import { SCORE_CEILING } from '../../constants/security.js'
import { gaugeArcPath } from '../../utils/dashboard.js'

/**
 * The dashboard hero's 0–100 gauge: a 270° track, a coloured score arc and the
 * score / band label as SVG text. Colours use CSS variables via inline styles,
 * so both themes are handled without canvas resolution.
 * @param {{score: number, label: string}} props Score (0–100) and its band
 *   (`Excellent | Good | Needs attention | At risk`).
 */
export default function SecurityGauge({ score, label }) {
  const arc = gaugeArcPath()
  const tone = SCORE_TONE_VARS[label] ?? 'var(--sev-medium)'

  return (
    <svg
      width={GAUGE.size}
      height={GAUGE.size}
      viewBox={`0 0 ${GAUGE.size} ${GAUGE.size}`}
      role="img"
      aria-label={`Security score ${score} out of ${SCORE_CEILING}, ${label}`}
    >
      <path d={arc} fill="none" strokeWidth={GAUGE.stroke} strokeLinecap="round" style={{ stroke: 'var(--border)' }} />
      <path
        d={arc}
        fill="none"
        strokeWidth={GAUGE.stroke}
        strokeLinecap="round"
        pathLength={GAUGE.pathLength}
        strokeDasharray={`${score} ${GAUGE.pathLength}`}
        style={{ stroke: tone }}
      />
      <text x={GAUGE.center} y={GAUGE.scoreY} textAnchor="middle" fontSize={GAUGE.scoreFontSize} fontWeight="700" style={{ fill: 'var(--text)' }}>
        {score}
      </text>
      <text x={GAUGE.center} y={GAUGE.labelY} textAnchor="middle" fontSize={GAUGE.labelFontSize} style={{ fill: 'var(--muted)' }}>
        {label}
      </text>
    </svg>
  )
}
