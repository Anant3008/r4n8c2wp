import { formatTimestamp } from "../../analysisFormatting"
import type { Evaluated } from "../../data"

type Step = { label: string; time: string; state: "done" | "missing" | "pending" }

/** Publication → cutoff → delivery → observation, in chronological order. */
export default function DecisionTimeline({ row }: { row: Evaluated }) {
  const steps: Step[] = [
    {
      label: "Forecast published",
      time: row.publicationTime ? formatTimestamp(row.publicationTime) : "None by cutoff",
      state: row.publicationTime ? "done" : "missing",
    },
    { label: "Decision cutoff", time: `${formatTimestamp(row.cutoff)} · assumed`, state: "done" },
    { label: "Delivery interval", time: formatTimestamp(row.timestamp), state: "done" },
    {
      label: "Actual observed",
      time: row.actual === null ? "Missing observation" : "FUELHH",
      state: row.actual === null ? "missing" : "done",
    },
  ]
  return (
    <ol className="decision-timeline" aria-label="Decision-time sequence">
      {steps.map((step) => (
        <li key={step.label} className={`timeline-step timeline-${step.state}`}>
          <span className="timeline-marker" aria-hidden="true" />
          <span className="timeline-label">
            {step.label}
            {step.state === "missing" && <span className="sr-only"> (missing)</span>}
          </span>
          <span className="timeline-time">{step.time}</span>
        </li>
      ))}
    </ol>
  )
}
