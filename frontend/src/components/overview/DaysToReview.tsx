import { Button, SelectField } from "@figma/astraui"
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react"
import { formatSigned as signed } from "../../analysisFormatting"
import { num, type Evaluated } from "../../data"
import type { Ranking } from "../../lib/analysisInteractions"
import type { OverviewDay } from "../../lib/dailyPerformance"
export default function DaysToReview({
  reviewDays,
  rankBy,
  setRankBy,
  date,
  onDay,
  onSelect,
  onNavigate,
}: {
  reviewDays: OverviewDay[]
  rankBy: Ranking
  setRankBy: (ranking: Ranking) => void
  date: string
  onDay: (day: number) => void
  onSelect: (row: Evaluated | null) => void
  onNavigate: (page: number) => void
}) {
  return (
    <>
      <div className="quiet-review-heading">
        <div role="heading" aria-level={2}>
          Days to review
        </div>
        <SelectField
          value={rankBy}
          onChange={(value) => setRankBy(value as Ranking)}
          options={[
            { value: "mae", label: "Highest MAE" },
            { value: "rmse", label: "Highest RMSE" },
            { value: "bias", label: "Largest absolute bias" },
          ]}
        />
      </div>
      <div className="quiet-review-list">
        {reviewDays.slice(0, 5).map((d) => (
          <Button
            variant="subtle"
            key={d.day}
            className={Number(date) === d.day ? "review-selected" : ""}
            onClick={() => {
              onDay(d.day)
              onSelect(null)
            }}
            aria-label={`Inspect ${d.label}, ${rankBy.toUpperCase()} ${num(d[rankBy])} megawatts`}
          >
            <span className="review-row-content">
              <span className="review-date">
                {d.label}
                <span className={`review-direction ${!Number.isFinite(d.bias) ? "" : d.bias > 0 ? "is-over" : "is-under"}`}>
                  {!Number.isFinite(d.bias) ? (
                    "Unscored"
                  ) : d.bias > 0 ? (
                    <>
                      <ArrowUp size={11} aria-hidden="true" />
                      Over
                    </>
                  ) : (
                    <>
                      <ArrowDown size={11} aria-hidden="true" />
                      Under
                    </>
                  )}
                </span>
              </span>
              <span className="review-value">
                {rankBy === "bias" ? signed(d.bias) : num(d[rankBy])}
                <span className="muted"> MW</span>
              </span>
              <ArrowRight size={14} />
            </span>
          </Button>
        ))}
      </div>
      <Button
        className="review-analysis-link"
        variant="subtle"
        size="small"
        iconEnd={<ArrowRight size={13} />}
        onClick={() => onNavigate(2)}
      >
        Accuracy analysis
      </Button>
    </>
  )
}
