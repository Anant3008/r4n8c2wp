import { Button } from "@figma/astraui"
import { ArrowRight } from "lucide-react"
import {
  formatSigned as signed,
  formatTimestamp as utc,
} from "../../analysisFormatting"
import { num, type Evaluated } from "../../data"
import ObservationValue from "../common/ObservationValue"
import Section from "../common/Section"
import DecisionTimeline from "./DecisionTimeline"
import PublicationLabel from "./PublicationLabel"

export default function IntervalInspector({
  row,
  onHistory,
  onClose,
  historyView = false,
}: {
  row: Evaluated
  onHistory: () => void
  onClose?: () => void
  historyView?: boolean
}) {
  return (
    <Section
      title="Decision-time interval inspection"
      description="Delivery and publication timestamps are distinct · all times UTC"
      action={
        onClose && (
          <Button variant="subtle" size="small" onClick={onClose}>
            Close
          </Button>
        )
      }
      className="interval-inspector"
    >
      <PublicationLabel row={row} />
      <DecisionTimeline row={row} />
      <dl className="interval-grid">
        <div>
          <dt>Delivery interval start</dt>
          <dd>{utc(row.timestamp)}</dd>
        </div>
        <div>
          <dt>Forecast publication</dt>
          <dd className="forecast-text">
            {row.publicationTime
              ? utc(row.publicationTime)
              : "Not available by cutoff"}
          </dd>
        </div>
        <div>
          <dt>Procurement decision cutoff</dt>
          <dd>{utc(row.cutoff)}</dd>
        </div>
        <div>
          <dt>Forecast / actual · MW</dt>
          <dd>
            <span className="forecast-text">
              <ObservationValue value={row.forecast} kind="forecast" />
            </span>{" "}
            /{" "}
            <span className="actual-text">
              <ObservationValue value={row.actual} />
            </span>
          </dd>
        </div>
        <div>
          <dt>Signed / absolute error · MW</dt>
          <dd>
            {row.error === null ? (
              <ObservationValue value={null} kind="error" />
            ) : (
              <>
                {signed(row.error)} / {num(Math.abs(row.error))}
              </>
            )}
          </dd>
        </div>
        <div>
          <dt>Evaluation eligibility</dt>
          <dd className={row.forecast === null ? "warning-text" : ""}>
            {row.forecast === null
              ? "No eligible forecast · unscored"
              : row.actual === null
                ? "Eligible forecast · actual missing"
                : "Published by cutoff · scored"}
          </dd>
        </div>
      </dl>
      <div className="inspector-footer">
        <span className="muted">
          Later publications remain inspectable, but are never substituted.
        </span>
        <Button
          variant="neutral"
          size="small"
          iconEnd={<ArrowRight size={14} />}
          onClick={onHistory}
        >
          {historyView
            ? "Open delivery interval"
            : "Inspect forecast revisions"}
        </Button>
      </div>
    </Section>
  )
}
