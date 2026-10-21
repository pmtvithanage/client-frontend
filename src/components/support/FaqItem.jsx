import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * FAQ accordion item.
 * @param {{question: string, answer: string}} props
 */
export default function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-3 text-left"
      >
        <span className="text-sm font-medium text-text">{question}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open ? <p className="pb-3 text-sm text-muted">{answer}</p> : null}
    </div>
  )
}
