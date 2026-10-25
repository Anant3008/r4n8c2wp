import type { ReactNode } from "react"
import { num, type Evaluated } from "../../data"
import { adjacentInterval } from "../../lib/analysisInteractions"

export default function IntervalNavigator({
  rows,
  selected,
  onSelect,
  children,
  disabled = false,
}: {
  rows: Evaluated[]
  selected: Evaluated | null
  onSelect: (row: Evaluated) => void
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <div
      className="interval-navigation-region"
      role="group"
      tabIndex={disabled ? undefined : 0}
      aria-label={
        disabled
          ? "Monthly generation overview"
          : "Delivery interval charts. Use left and right arrow keys to inspect half-hour intervals."
      }
      aria-keyshortcuts={disabled ? undefined : "ArrowLeft ArrowRight"}
      onPointerDown={(event) => {
        if (
          !disabled &&
          !(event.target as Element).closest(
            'button,input,select,textarea,[role="combobox"]',
          )
        )
          event.currentTarget.focus({ preventScroll: true })
      }}
      onKeyDown={(event) => {
        if (
          disabled ||
          (event.key !== "ArrowLeft" && event.key !== "ArrowRight") ||
          (event.target as Element).closest(
            'button,input,select,textarea,[role="combobox"]',
          )
        )
          return
        event.preventDefault()
        event.stopPropagation()
        const row = adjacentInterval(
          rows,
          selected?.timestamp,
          event.key === "ArrowLeft" ? -1 : 1,
        )
        if (row) onSelect(row)
      }}
    >
      {children}
      <span className="sr-only" role="status">
        {selected
          ? `Selected delivery ${selected.label} UTC. Forecast ${num(selected.forecast)} MW. Actual ${num(selected.actual)} MW. Error ${num(selected.error)} MW.`
          : ""}
      </span>
    </div>
  )
}
