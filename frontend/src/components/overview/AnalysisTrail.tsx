import { Button } from "@figma/astraui"
import { ChevronRight } from "lucide-react"

/** Keeps the month → day → interval path visible while drilling in. */
export default function AnalysisTrail({
  date,
  interval,
  onMonth,
  onDay,
}: {
  date: string
  interval: string | null
  onMonth: () => void
  onDay: () => void
}) {
  if (date === "all") return null
  return (
    <nav className="analysis-trail" aria-label="Analysis level">
      <Button variant="subtle" size="small" onClick={onMonth}>January 2026</Button>
      <ChevronRight size={12} aria-hidden="true" />
      {interval ? (
        <>
          <Button variant="subtle" size="small" onClick={onDay}>{Number(date)} January</Button>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">{interval} UTC</span>
        </>
      ) : (
        <span aria-current="page">{Number(date)} January</span>
      )}
    </nav>
  )
}
