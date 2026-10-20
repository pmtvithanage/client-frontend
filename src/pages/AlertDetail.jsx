import { useParams } from 'react-router-dom'

import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const SECTIONS = [
  {
    title: 'What happened',
    body: 'A short, plain-English summary of the event on your network.',
  },
  {
    title: 'Why we flagged it',
    body: 'The signals behind the alert, written so a non-specialist can follow them.',
  },
  {
    title: 'What you should do',
    body: 'A recommended next step you can take, or mark the alert as expected if the traffic was intentional.',
  },
]

/**
 * `/alerts/:id` — single alert placeholder showing the three plain-English
 * sections every alert must have (AGENTS.md §4).
 */
export default function AlertDetail() {
  const { id } = useParams()
  useDocumentTitle('Alert')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Alert</h1>
        <p className="text-sm text-muted">Reference: {id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-xl border bg-surface p-4">
            <h2 className="mb-2 text-sm font-semibold text-text">{section.title}</h2>
            <p className="text-sm text-muted">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="text-sm text-muted">
        The alert itself is not loaded yet — this page shows the structure it
        will follow.
      </p>
    </div>
  )
}
