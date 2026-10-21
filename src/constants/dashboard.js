/**
 * Dashboard constants: hero gauge, KPI windows, attention list and the live
 * traffic widget.
 * @module constants/dashboard
 */

import { SEVERITY_NAME } from './severity.js'

/** Short month names for the 14-day chart axis labels (UTC day keys). */
export const MONTH_SHORT = Object.freeze([
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
])

/** Query-key prefixes invalidated by the dashboard Refresh button. */
export const DASHBOARD_REFRESH_KEYS = Object.freeze([
  'overview', 'alerts', 'traffic', 'reports', 'network', 'sensor',
])

/** KPI tiles rendered in one row (used for the loading skeleton count). */
export const KPI_TILE_COUNT = 4

/** Rows shown in each "What we see most" list. */
export const INSIGHT_LIMIT = 5

/** Largest score band → gauge colour (CSS variables, resolved by the browser). */
export const SCORE_TONE_VARS = Object.freeze({
  Excellent: 'var(--sev-low)',
  Good: 'var(--sev-low)',
  'Needs attention': 'var(--sev-medium)',
  'At risk': 'var(--sev-critical)',
})

/** Windows offered by the live traffic charts, in minutes. */
export const TRAFFIC_WINDOWS = Object.freeze([1, 5, 15])

/** Default live-traffic window, in minutes. */
export const DEFAULT_TRAFFIC_WINDOW = 5

/** Sync group name so the two traffic charts share crosshair and zoom. */
export const TRAFFIC_SYNC_GROUP = 'traffic'

/** Column labels and colours of the two live traffic charts. */
export const TRAFFIC_SERIES = Object.freeze({
  flows: 'Flows per second',
  bytes: 'Bytes per second',
})
export const TRAFFIC_NET_LABELS = Object.freeze(['Time', TRAFFIC_SERIES.flows, TRAFFIC_SERIES.bytes])
export const TRAFFIC_NET_COLORS = Object.freeze(['--accent', '--muted'])
export const TRAFFIC_ALERT_LABELS = Object.freeze([
  'Time',
  SEVERITY_NAME.LOW,
  SEVERITY_NAME.MEDIUM,
  SEVERITY_NAME.HIGH,
  SEVERITY_NAME.CRITICAL,
])
export const TRAFFIC_ALERT_COLORS = Object.freeze([
  '--sev-low',
  '--sev-medium',
  '--sev-high',
  '--sev-critical',
])

/** Urgent alerts queried for the traffic-chart annotations. */
export const ANNOTATION_LIMIT = 50
export const ANNOTATION_SERIES = Object.freeze({ flows: 'Flows per second', alerts: SEVERITY_NAME.LOW })

/** Newest alerts shown in "Needs your attention". */
export const ATTENTION_LIMIT = 5

/** Severity tiers accepted in "Needs your attention". */
export const ATTENTION_SEVERITY = Object.freeze(['CRITICAL', 'HIGH'])

/** Only alerts at or above this tier appear in "Needs your attention". */
export const ATTENTION_MIN_SEVERITY = 'HIGH'

/** Unresolved statuses that still need attention. */
export const ATTENTION_STATUSES = Object.freeze(['new', 'acknowledged', 'expected'])

/** How often the live alert batches are flushed onto the screen (ms). */
export const ATTENTION_FLUSH_MS = 1000

/** A live point older than this shows `Reconnecting` (ms). */
export const CONNECTION_STALE_MS = 3000

/** Hours compared by the "alerts in the last 24 hours" KPI. */
export const RECENT_HOURS = 24

/** One hour / one minute in ms (window arithmetic for the KPI queries). */
export const HOUR_MS = 3_600_000
export const MINUTE_MS = 60_000

/** One day in milliseconds. */
export const DAY_MS = 86_400_000

/** Severity queried for the traffic-chart annotations (Urgent only). */
export const ANNOTATION_SEVERITY = 'CRITICAL'

/** Severity buckets of the 14-day stacked bar chart, top of stack first. */
export const TREND_SERIES = Object.freeze([
  { key: 'urgent', name: 'Urgent', varName: '--sev-critical' },
  { key: 'serious', name: 'Serious', varName: '--sev-high' },
  { key: 'moderate', name: 'Moderate', varName: '--sev-medium' },
  { key: 'minor', name: 'Minor', varName: '--sev-low' },
])

/** CSS variables of {@link TREND_SERIES}, in the same order. */
export const TREND_SERIES_VARS = Object.freeze(TREND_SERIES.map((entry) => entry.varName))

/** 14-day chart layout. */
export const TREND_HEIGHT = 260
export const TREND_MARGIN = Object.freeze({ top: 8, right: 8, bottom: 4, left: 0 })

/** Gauge geometry (SVG user units). The sweep is 270°, gap at the bottom. */
export const GAUGE = Object.freeze({
  size: 220,
  stroke: 16,
  startAngle: -225,
  endAngle: 45,
  /** Radius of the arc path, inset by the stroke and a small margin. */
  radius: 92,
  /** Centre of the arc. */
  center: 110,
  /** Percentage of the path drawn for the score (pathLength is normalised). */
  pathLength: 100,
  /** Font sizes and baselines of the score / label text (SVG units). */
  scoreFontSize: 44,
  labelFontSize: 14,
  scoreY: 116,
  labelY: 148,
})

/** Length of the `!` tick drawn below each Urgent-alert annotation. */
export const ANNOTATION_TICK_HEIGHT = 28
