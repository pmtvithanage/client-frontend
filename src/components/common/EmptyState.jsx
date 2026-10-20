/**
 * Placeholder empty/blocked state: icon, plain-English headline and one line of
 * body text. Every placeholder page uses this until the real data lands.
 * @param {{title: string, description: string, icon?: React.ElementType, children?: React.ReactNode}} props
 */
export default function EmptyState({ title, description, icon: Icon, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-surface px-6 py-16 text-center">
      {Icon ? (
        <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
          <Icon className="h-6 w-6 text-muted" />
        </span>
      ) : null}
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="max-w-md text-sm text-muted">{description}</p>
      {children}
    </div>
  )
}
