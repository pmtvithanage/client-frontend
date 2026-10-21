import { HelpCircle, Lightbulb, MessageSquareQuote, TriangleAlert } from 'lucide-react'

import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import { useAlertExplain } from '../../hooks/useAlerts.js'
import { categoryExplanation } from '../../utils/plainLanguage.js'

/** One plain-language card with an icon, title and body. */
function Card({ icon: Icon, title, children }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text">
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  )
}

/**
 * The three plain-English answers every alert must show, in order:
 * "What happened", "Why we flagged it", "What you should do" (numbered).
 * Text comes from `GET /alerts/:id/explain`; the category explanation is the
 * fallback while it loads. No model numbers ever appear here.
 * @param {{alert: object}} props The client-safe alert.
 */
export default function ExplainCards({ alert }) {
  const explain = useAlertExplain(alert.id)
  const fallback = categoryExplanation(alert.category)
  const data = explain.data
  const steps = data?.what_to_do?.length ? data.what_to_do : fallback.actions

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card icon={MessageSquareQuote} title="What happened">
        {explain.isLoading ? (
          <LoadingSkeleton rows={2} />
        ) : (
          <p className="text-sm text-muted">{data?.what_happened ?? fallback.what}</p>
        )}
      </Card>
      <Card icon={TriangleAlert} title="Why we flagged it">
        {explain.isLoading ? (
          <LoadingSkeleton rows={2} />
        ) : (
          <p className="text-sm text-muted">{data?.why_flagged ?? fallback.why}</p>
        )}
      </Card>
      <Card icon={Lightbulb} title="What you should do">
        {explain.isLoading ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <ol className="list-decimal space-y-1.5 pl-4 text-sm text-muted">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
      </Card>
      {!explain.isLoading && explain.isError ? (
        <p className="md:col-span-3 text-xs text-muted">
          <HelpCircle className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          The short explanation could not be loaded — the cards show the general guidance for this
          category.
        </p>
      ) : null}
    </div>
  )
}
