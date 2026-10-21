import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import Alerts14DayChart from '../components/dashboard/Alerts14DayChart.jsx'
import AttentionList from '../components/dashboard/AttentionList.jsx'
import GreetingHeader from '../components/dashboard/GreetingHeader.jsx'
import KpiRow from '../components/dashboard/KpiRow.jsx'
import SecurityStatusCard from '../components/dashboard/SecurityStatusCard.jsx'
import TopInsights from '../components/dashboard/TopInsights.jsx'
import OfflineSensorBanner from '../components/common/OfflineSensorBanner.jsx'
import TrafficSection from '../components/dashboard/TrafficSection.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useOverview } from '../hooks/useOverview.js'
import { DASHBOARD_REFRESH_KEYS } from '../constants/dashboard.js'

/**
 * `/` — the client dashboard: greeting + refresh, security-score hero, KPI row,
 * "Needs your attention", live traffic, the 14-day bar chart and top insights.
 * Refresh pins a new anchor (so the 24-hour KPIs recompute) and invalidates
 * every dashboard query family.
 */
export default function Dashboard() {
  useDocumentTitle('Dashboard')
  const queryClient = useQueryClient()
  const overview = useOverview()
  const [anchor, setAnchor] = useState(() => Date.now())

  const refresh = useCallback(() => {
    setAnchor(Date.now())
    for (const key of DASHBOARD_REFRESH_KEYS) {
      queryClient.invalidateQueries({ queryKey: [key] })
    }
  }, [queryClient])

  return (
    <div className="space-y-6">
      <GreetingHeader refreshedAt={overview.dataUpdatedAt} refreshing={overview.isFetching} onRefresh={refresh} />
      <OfflineSensorBanner />
      <SecurityStatusCard />
      <KpiRow anchor={anchor} />
      <AttentionList />
      <TrafficSection anchor={anchor} />
      <Alerts14DayChart />
      <TopInsights />
    </div>
  )
}
