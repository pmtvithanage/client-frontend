import { RotateCcw, TriangleAlert } from 'lucide-react'

/**
 * Failure state for a query: shows the API's plain-English message plus a
 * retry button. The message is always the exact `message` field the API sent
 * (never a raw error dump).
 * @param {{error?: {message?: string}|string|null, onRetry?: () => void,
 *   title?: string, className?: string}} props
 */
export default function ErrorState({
  error,
  onRetry,
  title = 'We could not load this',
  className = '',
}) {
  const message =
    (typeof error === 'string' ? error : error?.message) ||
    'Something went wrong. Please try again.'

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-surface px-6 py-12 text-center ${className}`}
    >
      <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-sev-high/10">
        <TriangleAlert className="h-5 w-5 text-sev-high" />
      </span>
      <div>
        <h2 className="text-base font-semibold text-text">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  )
}
