import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import AlertsFilterBar from '../components/alerts/AlertsFilterBar.jsx'
import AlertsFooter from '../components/alerts/AlertsFooter.jsx'
import AlertsHelpDialog from '../components/alerts/AlertsHelpDialog.jsx'
import AlertsList from '../components/alerts/AlertsList.jsx'
import AlertsListState from '../components/alerts/AlertsListState.jsx'
import AlertsPageHeader from '../components/alerts/AlertsPageHeader.jsx'
import NewAlertsBanner from '../components/alerts/NewAlertsBanner.jsx'
import { useAlertKeyboard } from '../hooks/useAlertKeyboard.js'
import { useAlertStream } from '../hooks/useAlertStream.js'
import { useInfiniteAlerts, useUpdateAlertStatus } from '../hooks/useAlerts.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useToast } from '../hooks/useToast.js'
import { alertMatchesFilters, mergeAlertRows } from '../utils/alerts.js'
import { exportAlertsCsv } from '../utils/alertExport.js'
import {
  filtersToApiParams,
  hasActiveFilters,
  parseAlertFilters,
  serializeAlertFilters,
} from '../utils/alertFilters.js'

/** scrollIntoView option: only scroll the highlighted row when it is off-screen. */
const SCROLL_BLOCK = { block: 'nearest' }

/**
 * `/alerts` — the alert list. Every filter lives in the URL (shareable
 * links), rows page with a cursor + "Load more", and live arrivals wait
 * behind a calm "N new alerts, click to show" pill until the user asks for
 * them. Keyboard: j/k move, Enter opens, a acknowledges, / searches, ? helps.
 */
export default function Alerts() {
  useDocumentTitle('Alerts')
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const searchRef = useRef(null)
  const filtersRef = useRef(null)

  const filters = useMemo(() => parseAlertFilters(searchParams), [searchParams])
  const queryClient = useQueryClient()
  const [anchor, setAnchor] = useState(() => Date.now())
  const [shownLive, setShownLive] = useState([])
  const [pending, setPending] = useState([])
  const [livePaused, setLivePaused] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const apiParams = useMemo(() => filtersToApiParams(filters, anchor), [filters, anchor])
  const query = useInfiniteAlerts(apiParams)
  const statusMutation = useUpdateAlertStatus()

  const serverRows = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.data),
    [query.data],
  )
  const rows = useMemo(() => mergeAlertRows(shownLive, serverRows, filters.sort), [shownLive, serverRows, filters.sort])
  const total = query.data?.pages[0]?.meta.total ?? null

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const applyFilters = useCallback(
    (next) => {
      const previous = filtersRef.current ?? filters
      const windowChanged =
        next.range !== previous.range || next.from !== previous.from || next.to !== previous.to
      if (windowChanged) setAnchor(Date.now())
      setFocusIndex(0)
      setSearchParams(serializeAlertFilters(next))
    },
    [filters, setSearchParams],
  )

  useAlertStream({
    enabled: !livePaused,
    onAlert: (alert) => {
      const current = filtersRef.current ?? filters
      if (!alertMatchesFilters(alert, current)) return
      setPending((previous) =>
        previous.some((entry) => entry.id === alert.id) ? previous : [...previous, alert],
      )
    },
  })

  const revealPending = () => {
    if (!pending.length) return
    setShownLive((previous) => mergeAlertRows(pending, previous, 'ts:desc'))
    setPending([])
    queryClient.invalidateQueries({ queryKey: ['alerts'] })
  }

  const acknowledge = useCallback(
    (alert) => {
      if (!alert) return
      statusMutation.mutate(
        { id: alert.id, status: 'acknowledged' },
        {
          onSuccess: () => toast(`Marked ${alert.id} as acknowledged.`, { tone: 'success' }),
          onError: (error) => toast(error?.message || 'We could not update that alert.', { tone: 'error' }),
        },
      )
    },
    [statusMutation, toast],
  )

  const openFocused = useCallback(() => {
    const alert = rows[focusIndex]
    if (alert) navigate({ pathname: `/alerts/${alert.id}`, search: location.search })
  }, [rows, focusIndex, navigate, location.search])

  useAlertKeyboard({
    isTyping: helpOpen,
    onNext: () => setFocusIndex((index) => Math.min(index + 1, rows.length - 1)),
    onPrevious: () => setFocusIndex((index) => Math.max(index - 1, 0)),
    onOpen: openFocused,
    onAcknowledge: () => acknowledge(rows[focusIndex]),
    onSearch: () => searchRef.current?.focus(),
    onHelp: () => setHelpOpen(true),
  })

  const mountedRef = useRef(true)
  useEffect(() => {
    if (mountedRef.current) {
      mountedRef.current = false
      return
    }
    document.querySelector(`[data-alert-row="${focusIndex}"]`)?.scrollIntoView(SCROLL_BLOCK)
  }, [focusIndex])

  const runExport = async () => {
    setExporting(true)
    try {
      const count = await exportAlertsCsv(apiParams)
      toast(`Exported ${count} alert${count === 1 ? '' : 's'}.`, { tone: 'success' })
    } catch (error) {
      toast(error?.message || 'We could not export the alerts.', { tone: 'error' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <AlertsPageHeader
        filters={filters}
        onSortChange={(sort) => applyFilters({ ...filters, sort })}
        onExport={runExport}
        exporting={exporting}
        hasRows={rows.length > 0}
      />

      <AlertsFilterBar ref={searchRef} filters={filters} onFiltersChange={applyFilters} resultCount={total} />

      {!rows.length ? (
        <AlertsListState
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={query.refetch}
          isEmpty={!query.isLoading && !query.isError}
          hasFilters={hasActiveFilters(filters)}
        />
      ) : null}

      {rows.length ? (
        <div className="relative">
          <NewAlertsBanner
            pendingCount={pending.length}
            paused={livePaused}
            onShow={revealPending}
            onTogglePause={() => setLivePaused((value) => !value)}
          />
          <AlertsList alerts={rows} focusIndex={focusIndex} onFocusRow={setFocusIndex} />
        </div>
      ) : null}

      {rows.length ? (
        <AlertsFooter
          shown={rows.length}
          total={total}
          hasNextPage={Boolean(query.hasNextPage)}
          isLoadingMore={query.isFetchingNextPage}
          onLoadMore={() => query.fetchNextPage()}
        />
      ) : null}

      <AlertsHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
