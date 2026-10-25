import { formatTimestamp } from "../../analysisFormatting"
import ObservationValue from "../common/ObservationValue"

export default function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const title = row.timestamp
    ? formatTimestamp(row.timestamp)
    : `${row.label || label} 2026 · daily mean`
  return (
    <div className="chart-tip">
      <div className="font-semibold mb-lg">{title}</div>
      {"forecast" in row && (
        <>
          <div className="tooltip-value">
            <span>Forecast · MW</span>
            <ObservationValue value={row.forecast} kind="forecast" />
          </div>
          <div className="tooltip-value">
            <span>Actual · MW</span>
            <ObservationValue value={row.actual} />
          </div>
        </>
      )}
      {"error" in row && (
        <div className="tooltip-value">
          <span>{row.timestamp ? "Error" : "Bias"} · MW</span>
          <ObservationValue value={row.error} kind="error" signed />
        </div>
      )}
    </div>
  )
}
