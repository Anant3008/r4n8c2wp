import { Button } from "@figma/astraui"
import type { ChartStatus } from "./chartTypes"

export default function ChartState({
  status,
  errorOnly = false,
  onRetry,
}: {
  status: ChartStatus | "empty"
  errorOnly?: boolean
  onRetry?: () => void
}) {
  const title =
    status === "loading"
      ? "Loading observations"
      : status === "error"
        ? "Chart could not be loaded"
        : errorOnly
          ? "No matched intervals"
          : "No generation observations"
  const description =
    status === "loading"
      ? "The analysis will appear here when the data is available."
      : status === "error"
        ? "No values have been substituted. Retry or choose another period."
        : errorOnly
          ? "Errors require both an eligible forecast and an actual observation."
          : "Choose another delivery period or inspect the underlying records."
  return (
    <div
      className={`chart-state chart-state-${status}`}
      role={status === "error" ? "alert" : "status"}
      aria-busy={status === "loading"}
    >
      {status === "loading" && (
        <div className="chart-loading-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
      <strong>{title}</strong>
      <span>{description}</span>
      {status === "error" && onRetry && (
        <Button variant="neutral" size="small" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
