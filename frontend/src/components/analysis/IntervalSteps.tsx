import { Button } from "@figma/astraui"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Evaluated } from "../../data"
import { adjacentInterval } from "../../lib/analysisInteractions"

export default function IntervalSteps({
  rows,
  selected,
  onSelect,
}: {
  rows: Evaluated[]
  selected: Evaluated
  onSelect: (row: Evaluated) => void
}) {
  const index = rows.findIndex((r) => r.timestamp === selected.timestamp)
  const step = (direction: -1 | 1) => {
    const row = adjacentInterval(rows, selected.timestamp, direction)
    if (row) onSelect(row)
  }
  return (
    <div className="interval-stepper">
      <span>
        {selected.time} UTC{" "}
        <span className="muted">
          · {index + 1}/{rows.length}
        </span>
      </span>
      <div>
        <Button
          variant="subtle"
          size="small"
          disabled={index <= 0}
          aria-label="Previous half-hour interval"
          onClick={() => step(-1)}
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          variant="subtle"
          size="small"
          disabled={index < 0 || index >= rows.length - 1}
          aria-label="Next half-hour interval"
          onClick={() => step(1)}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
