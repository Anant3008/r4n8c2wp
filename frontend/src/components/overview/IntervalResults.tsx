import type { Evaluated } from "../../data"
import LinkedIntervalTable from "../analysis/LinkedIntervalTable"
export default function IntervalResults({
  rows,
  inspected,
  onSelect,
}: {
  rows: Evaluated[]
  inspected: Evaluated | null
  onSelect: (row: Evaluated) => void
}) {
  return (
    <details
      className="quiet-disclosure interval-results"
      open={Boolean(inspected)}
    >
      <summary>
        Interval data
        <span className="muted">{rows.length} half-hour intervals</span>
      </summary>
      <LinkedIntervalTable
        rows={rows}
        selected={inspected}
        onSelect={onSelect}
      />
    </details>
  )
}
