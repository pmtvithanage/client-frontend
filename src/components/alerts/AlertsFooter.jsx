/**
 * "Showing X of Y" plus the cursor-pagination Load more button.
 * @param {{shown: number, total: number|null, hasNextPage: boolean,
 *   isLoadingMore: boolean, onLoadMore: () => void}} props `total` is the
 *   server's count for the current filters (null while unknown).
 */
export default function AlertsFooter({ shown, total, hasNextPage, isLoadingMore, onLoadMore }) {
  const count = total ?? shown
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-muted" aria-live="polite">
        Showing {shown} of {count} alert{count === 1 ? '' : 's'}
      </p>
      {hasNextPage ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2 disabled:opacity-60"
        >
          {isLoadingMore ? 'Loading…' : 'Load more'}
        </button>
      ) : null}
    </div>
  )
}
