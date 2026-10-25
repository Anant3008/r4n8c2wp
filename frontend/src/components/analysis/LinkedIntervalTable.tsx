import { Button } from "@figma/astraui"
import { useEffect, useRef } from "react"
import { formatTimestamp } from "../../analysisFormatting"
import type { Evaluated } from "../../data"
import ObservationValue from "../common/ObservationValue"

export default function LinkedIntervalTable({
  rows,
  selected,
  onSelect,
}: {
  rows: Evaluated[]
  selected: Evaluated | null
  onSelect: (row: Evaluated) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const viewport = container.current
    const row = viewport?.querySelector<HTMLElement>('[data-selected="true"]')
    if (!viewport || !row) return
    const bounds = viewport.getBoundingClientRect()
    const item = row.getBoundingClientRect()
    if (item.top < bounds.top || item.bottom > bounds.bottom)
      viewport.scrollTop +=
        item.top - bounds.top - viewport.clientHeight / 2 + item.height / 2
  }, [selected?.timestamp, rows])
  return (
    <div className="linked-interval-table" ref={container}>
      <table>
        <thead>
          <tr>
            <th>Delivery (UTC)</th>
            <th>Forecast MW</th>
            <th>Actual MW</th>
            <th>Error MW</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.timestamp}
              data-selected={row.timestamp === selected?.timestamp}
              aria-selected={row.timestamp === selected?.timestamp}
              className={
                row.timestamp === selected?.timestamp
                  ? "selected-interval-row"
                  : ""
              }
              onClick={() => onSelect(row)}
            >
              <td>
                <Button
                  className="history-publication"
                  variant="subtle"
                  size="small"
                  aria-pressed={row.timestamp === selected?.timestamp}
                  onClick={() => onSelect(row)}
                >
                  {formatTimestamp(row.timestamp, false)}
                </Button>
              </td>
              <td>
                <ObservationValue value={row.forecast} kind="forecast" />
              </td>
              <td>
                <ObservationValue value={row.actual} />
              </td>
              <td>
                <ObservationValue value={row.error} kind="error" signed />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="empty-state">
          No delivery intervals are available for this period.
        </div>
      )}
    </div>
  )
}
