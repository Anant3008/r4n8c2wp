import { formatSigned as signed } from "../../analysisFormatting"
import { num, type metrics } from "../../data"
import Definition from "../common/Definition"
export default function OverviewMetrics({
  stats: m,
}: {
  stats: ReturnType<typeof metrics>
}) {
  const scores = [
    {
      label: "Mean absolute error",
      definition: "Mean |forecast − actual| over matched intervals. Relative value = MAE ÷ mean matched actual (not MAPE).",
      value: num(m.mae),
      unit: "MW",
      note: Number.isFinite(m.relativeMae)
        ? `${num(m.relativeMae, 1)}% of mean actual`
        : "No matched actual generation",
    },
    {
      label: "RMSE",
      definition: "Root mean squared error over matched intervals. Larger misses carry more weight.",
      value: num(m.rmse),
      unit: "MW",
      note: m.pairs ? "Sensitive to large misses" : "No matched observations",
    },
    {
      label: "Forecast bias",
      definition: "Mean forecast − actual. Positive means overforecasting; negative means underforecasting.",
      value: signed(m.bias),
      unit: "MW",
      note: !Number.isFinite(m.bias)
        ? "No matched observations"
        : m.bias > 0
          ? "Overforecasting"
          : m.bias < 0
            ? "Underforecasting"
            : "No net bias",
    },
    {
      label: "Forecast coverage",
      definition: "Eligible forecasts ÷ expected delivery intervals. Missing observations are excluded from accuracy, never imputed.",
      value: num(m.coverage, 1),
      unit: "%",
      note: `${num(m.pairs)} matched intervals`,
    },
  ]
  return (
    <div className="quiet-metrics" aria-label="Decision-time forecast accuracy">
      {scores.map((score, i) => (
        <div
          className={`quiet-metric ${i === 0 ? "quiet-lead" : ""}`}
          key={score.label}
        >
          <span className="quiet-metric-label">
            <Definition term={score.label} definition={score.definition} />
          </span>
          <div className="quiet-metric-value">
            {score.value}
            <span>{score.unit}</span>
          </div>
          <span className="quiet-metric-note">{score.note}</span>
        </div>
      ))}
    </div>
  )
}
