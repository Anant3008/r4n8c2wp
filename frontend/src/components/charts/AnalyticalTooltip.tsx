import { formatDate, formatTimestamp as utc } from "../../analysisFormatting"
import ObservationValue from "../common/ObservationValue"
import type { ChartRow } from "./chartTypes"

export default function AnalyticalTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload as ChartRow
  return (
    <div className="chart-tip">
      <div className="font-semibold mb-lg">
        {row.timestamp
          ? utc(row.timestamp)
          : `${formatDate(`2026-01-${String(row.day).padStart(2, "0")}T00:00:00Z`)} · daily mean`}
      </div>
      <div className="tooltip-value">
        <span>Forecast · MW</span>
        <ObservationValue value={row.forecast} kind="forecast" />
      </div>
      <div className="tooltip-value">
        <span>Actual · MW</span>
        <ObservationValue value={row.actual} />
      </div>
      {row.error !== undefined && (
        <div className="tooltip-value">
          <span>{row.timestamp ? "Error" : "Bias"} · MW</span>
          <ObservationValue value={row.error} kind="error" signed />
        </div>
      )}
      {row.publicationTime !== undefined && (
        <div className="tooltip-publication">
          {row.publicationTime
            ? `Published: ${utc(row.publicationTime)}`
            : "No publication available by cutoff"}
        </div>
      )}
      <div className="muted mt-lg">Select to investigate</div>
    </div>
  )
}
