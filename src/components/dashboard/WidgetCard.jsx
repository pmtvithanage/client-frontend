import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'

/**
 * Standard frame for one dashboard widget: title, optional subtitle/action and
 * the independent loading / error / empty / content states each widget owns.
 * @param {{title: string, subtitle?: string, action?: React.ReactNode,
 *   isLoading?: boolean, isError?: boolean,
 *   error?: {message?: string}|null, onRetry?: () => void,
 *   isEmpty?: boolean, emptyTitle?: string, emptyDescription?: string,
 *   skeletonRows?: number, children?: React.ReactNode}} props
 */
export default function WidgetCard({
  title,
  subtitle,
  action,
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  isEmpty = false,
  emptyTitle = 'Nothing to show yet',
  emptyDescription,
  skeletonRows = 4,
  children,
}) {
  const showBody = !isLoading && !isError && !isEmpty

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </header>
      {isLoading ? <LoadingSkeleton rows={skeletonRows} /> : null}
      {isError ? <ErrorState error={error} onRetry={onRetry} /> : null}
      {isEmpty ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center">
          <p className="text-sm font-medium text-text">{emptyTitle}</p>
          {emptyDescription ? <p className="mt-1 text-xs text-muted">{emptyDescription}</p> : null}
        </div>
      ) : null}
      {showBody ? children : null}
    </section>
  )
}
