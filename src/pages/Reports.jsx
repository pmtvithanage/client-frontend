import { useState } from 'react'
import { FileText } from 'lucide-react'

import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import RecommendedActions from '../components/reports/RecommendedActions.jsx'
import ReportCategoryChart from '../components/reports/ReportCategoryChart.jsx'
import ReportDailyChart from '../components/reports/ReportDailyChart.jsx'
import ReportHourChart from '../components/reports/ReportHourChart.jsx'
import ReportSummary from '../components/reports/ReportSummary.jsx'
import ReportToolbar from '../components/reports/ReportToolbar.jsx'
import {
  DEFAULT_REPORT_PERIOD,
  REPORT_CUSTOM_DEFAULT_DAYS,
} from '../constants/reports.js'
import { DAY_MS } from '../constants/time.js'
import { useMe } from '../hooks/useAuth.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useReport } from '../hooks/useReports.js'
import { useToast } from '../hooks/useToast.js'
import { exportReportCsv } from '../utils/reportExport.js'

/** Default custom window: the last {@link REPORT_CUSTOM_DEFAULT_DAYS} days. */
function customWindow(now = Date.now()) {
  return {
    from: new Date(now - REPORT_CUSTOM_DEFAULT_DAYS * DAY_MS).toISOString(),
    to: new Date(now).toISOString(),
  }
}

/**
 * `/reports` — a period report with a security score, alert breakdown, charts
 * and recommended actions, printable (or saveable as PDF) and downloadable as
 * CSV (summary plus every alert in the period).
 */
export default function Reports() {
  useDocumentTitle('Reports')
  const { data: me } = useMe()
  const { toast } = useToast()
  const [period, setPeriod] = useState(() => ({ key: DEFAULT_REPORT_PERIOD }))
  const [exporting, setExporting] = useState(false)

  const params =
    period.key === 'custom'
      ? { period: period.key, from: period.from, to: period.to }
      : { period: period.key }
  const report = useReport(params)
  const clientName = me?.client?.name ?? 'Your organisation'

  const changePeriod = (next) => {
    if (next.key !== 'custom') {
      setPeriod(next)
      return
    }
    const fallback = customWindow()
    setPeriod({
      key: 'custom',
      from: next.from ?? fallback.from,
      to: next.to ?? fallback.to,
    })
  }

  const download = async () => {
    if (!report.data) return
    setExporting(true)
    try {
      await exportReportCsv(report.data, clientName)
      toast('Report CSV downloaded.', { tone: 'success' })
    } catch (error) {
      toast(error?.message ?? 'Could not download the report. Please try again.', {
        tone: 'error',
      })
    } finally {
      setExporting(false)
    }
  }

  const total = report.data?.summary.total_alerts ?? 0

  return (
    <div className="space-y-5">
      <ReportToolbar
        clientName={clientName}
        report={report.data}
        period={period}
        onPeriodChange={changePeriod}
        onPrint={() => window.print()}
        onExport={download}
        exporting={exporting}
      />

      {report.isLoading ? <LoadingSkeleton rows={8} /> : null}
      {report.isError ? (
        <ErrorState error={report.error} onRetry={report.refetch} />
      ) : null}
      {report.data && total === 0 ? (
        <EmptyState
          icon={FileText}
          title="No alerts in this period"
          description="Try a different period, or wait until your sensor reports activity."
        />
      ) : null}
      {report.data && total > 0 ? (
        <>
          <ReportSummary report={report.data} />
          <div className="grid gap-4 lg:grid-cols-2">
            <ReportDailyChart days={report.data.days} />
            <ReportCategoryChart
              categories={report.data.top_categories}
              total={total}
            />
          </div>
          <ReportHourChart hours={report.data.hours} />
          <RecommendedActions report={report.data} />
        </>
      ) : null}
    </div>
  )
}
