import { useState } from 'react'
import { Inbox, ShieldAlert, Wifi } from 'lucide-react'

import DevChartDemo from '../components/dev/DevChartDemo.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import CopyButton from '../components/common/CopyButton.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import InfoTip from '../components/common/InfoTip.jsx'
import KpiTile from '../components/common/KpiTile.jsx'
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx'
import SeverityBadge from '../components/common/SeverityBadge.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import TimeRangePicker from '../components/common/TimeRangePicker.jsx'
import { ALERT_STATUS_ORDER } from '../constants/statuses.js'
import { SEVERITY_ORDER } from '../constants/severity.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useToast } from '../hooks/useToast.js'

function Section({ title, children }) {
  return (
    <section aria-labelledby={`dev-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <h2
        id={`dev-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="mb-3 text-sm font-semibold text-text"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

/**
 * `/dev/components` — temporary gallery showing every shared component in one
 * place. It is removed before release.
 */
export default function DevComponents() {
  useDocumentTitle('Component gallery')
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [range, setRange] = useState({ key: '24h' })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-text">Component gallery</h1>
        <p className="mt-1 text-sm text-muted">
          Temporary page: every shared component in one place. Removed before release.
        </p>
      </header>

      <Section title="Severity badges (icon + friendly name + tier)">
        <div className="flex flex-wrap gap-2">
          {SEVERITY_ORDER.map((tier) => (
            <SeverityBadge key={tier} tier={tier} />
          ))}
        </div>
      </Section>

      <Section title="Status badges">
        <div className="flex flex-wrap gap-2">
          {ALERT_STATUS_ORDER.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </Section>

      <Section title="KPI tiles">
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiTile label="Open alerts" value="12" hint="3 need attention" icon={ShieldAlert} />
          <KpiTile label="Sensor" value="Online" hint="Last report 1 minute ago" icon={Wifi} tone="good" />
          <KpiTile label="Devices seen" value="24" hint="In the last 24 hours" icon={Inbox} />
        </div>
      </Section>

      <Section title="Inline controls">
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-4">
          <span className="inline-flex items-center gap-1 text-sm text-text">
            Security score
            <InfoTip text="A quick guess of how healthy your network is, based on alerts that are still open." />
          </span>
          <CopyButton value="192.168.8.100" label="Copy IP" />
          <TimeRangePicker value={range} onChange={setRange} />
        </div>
      </Section>

      <Section title="Toasts and confirmation">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toast('Alert marked as acknowledged.', { tone: 'success' })}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            Show success toast
          </button>
          <button
            type="button"
            onClick={() => toast('We could not save that. Please try again.', { tone: 'error' })}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
          >
            Show error toast
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-md border border-sev-high/40 px-3 py-1.5 text-sm font-medium text-sev-high hover:bg-sev-high/10"
          >
            Open confirm dialog
          </button>
        </div>
      </Section>

      <Section title="Empty, error and loading states">
        <div className="grid gap-4 lg:grid-cols-3">
          <EmptyState
            icon={Inbox}
            title="No alerts yet"
            description="When your sensor sees something worth flagging, it will show up here."
          />
          <ErrorState
            error={{ message: 'We could not reach the server. Check your connection and try again.' }}
            onRetry={() => toast('Retried the request.', { tone: 'info' })}
          />
          <div className="rounded-xl border border-border bg-surface p-4">
            <LoadingSkeleton rows={4} />
          </div>
        </div>
      </Section>

      <Section title="Real-time chart (dygraphs)">
        <DevChartDemo />
      </Section>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove this team member?"
        description="They will lose access to the portal straight away. You can invite them again later."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setConfirmOpen(false)
          toast('Team member removed.', { tone: 'success' })
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
