/**
 * Card wrapper for a chart: title, optional help text, optional controls and a
 * fixed-height body so the layout does not jump while data streams in.
 * @param {{title: string, subtitle?: string, action?: React.ReactNode,
 *   height?: number, children: React.ReactNode}} props
 */
export default function ChartCard({ title, subtitle, action, height, children }) {
  return (
    <section className="rounded-xl border border-border bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </header>
      <div className="p-4" style={height ? { minHeight: height } : undefined}>
        {children}
      </div>
    </section>
  )
}
