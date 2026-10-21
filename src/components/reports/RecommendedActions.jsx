import { Lightbulb } from 'lucide-react'

import WidgetCard from '../dashboard/WidgetCard.jsx'
import { recommendActions } from '../../utils/recommendations.js'

/**
 * "Recommended actions" — 3–5 plain-language next steps produced by the
 * documented rules in `utils/recommendations.js`.
 * @param {{report: object}} props Report returned by `useReport`.
 */
export default function RecommendedActions({ report }) {
  const actions = recommendActions(report)

  return (
    <WidgetCard
      title="Recommended actions"
      subtitle="What to do next, based on this period."
    >
      <ul className="space-y-2">
        {actions.map((text) => (
          <li key={text} className="flex items-start gap-2 text-sm text-text">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}
