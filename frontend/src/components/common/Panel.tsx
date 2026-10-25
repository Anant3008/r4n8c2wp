import type { ReactNode } from "react"

export default function Panel({
  title,
  subtitle,
  children,
  action,
  className = "",
}: {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          <div className="text-label font-semibold">{title}</div>
          {subtitle && (
            <div className="text-video-title muted mt-xs">{subtitle}</div>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
