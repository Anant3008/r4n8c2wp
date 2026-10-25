import type { ReactNode } from "react"

export default function Section({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`panel analyst-section ${className}`}>
      <div className="panel-heading">
        <div>
          <div
            className="text-label font-semibold"
            role="heading"
            aria-level={2}
          >
            {title}
          </div>
          {description && (
            <div className="text-video-title muted mt-xs">{description}</div>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
