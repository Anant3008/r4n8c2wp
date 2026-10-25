import { Button } from "@figma/astraui"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function DateStepper({
  date,
  onDay,
  onMonth,
}: {
  date: string
  onDay: (day: number) => void
  onMonth: () => void
}) {
  if (date === "all") return null
  const day = Number(date)
  return (
    <div
      className="date-stepper"
      role="group"
      aria-label="Delivery date navigation"
    >
      <Button
        variant="subtle"
        size="small"
        aria-label="Previous delivery day"
        title="Previous day"
        disabled={day <= 1}
        onClick={() => onDay(day - 1)}
      >
        <ChevronLeft size={16} />
      </Button>
      <Button
        variant="subtle"
        size="small"
        aria-label="Next delivery day"
        title="Next day"
        disabled={day >= 31}
        onClick={() => onDay(day + 1)}
      >
        <ChevronRight size={16} />
      </Button>
      <Button variant="subtle" size="small" onClick={onMonth}>
        Back to January
      </Button>
    </div>
  )
}
