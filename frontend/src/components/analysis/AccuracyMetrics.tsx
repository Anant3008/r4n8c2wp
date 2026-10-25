import { formatSigned as signed } from "../../analysisFormatting"
import { metrics, num, type Evaluated } from "../../data"
const direction = (value: number) =>
  !Number.isFinite(value)
    ? "No matched observations"
    : value > 0
      ? "Overforecasting on average"
      : value < 0
        ? "Underforecasting on average"
        : "No net directional bias"
export default function AccuracyMetrics({ rows }: { rows: Evaluated[] }) {
  const m = metrics(rows)
  const missingActual = rows.filter((r) => r.actual === null).length
  const missingForecast = rows.filter((r) => r.forecast === null).length
  const cards = [
    {
      label: "Mean absolute error",
      value: num(m.mae),
      unit: "MW",
      context: Number.isFinite(m.relativeMae)
        ? `${num(m.relativeMae, 1)}% of mean matched actual generation`
        : "No matched actual generation",
      definition: "Mean |forecast − actual|; relative context is not MAPE.",
    },
    {
      label: "Root mean squared error",
      value: num(m.rmse),
      unit: "MW",
      context: m.pairs
        ? "Larger misses carry more weight"
        : "No matched observations",
      definition: "Square root of mean squared error; same matched intervals.",
    },
    {
      label: "Forecast bias",
      value: signed(m.bias),
      unit: "MW",
      context: direction(m.bias),
      definition:
        "Mean forecast − actual. Positive = overforecast; negative = underforecast.",
    },
    {
      label: "Eligible forecast coverage",
      value: num(m.coverage, 1),
      unit: "%",
      context: `${num(m.pairs)} / ${num(rows.length)} matched intervals`,
      definition: `${missingForecast} without eligible forecast · ${missingActual} missing actual observations`,
    },
  ]
  return (
    <section
      className="accuracy-summary"
      aria-label="Decision-time forecast accuracy"
    >
      <div className="accuracy-summary-heading">
        <span className="summary-eyebrow">DECISION-TIME PERFORMANCE</span>
        <span className="text-video-title muted">
          Computed from {num(m.pairs)} matched half-hour intervals
        </span>
      </div>
      <div className="accuracy-metrics">
        {cards.map((card, i) => (
          <div className={`accuracy-metric metric-${i}`} key={card.label}>
            <div className="kpi-label">{card.label}</div>
            <div className="accuracy-value">
              {card.value}
              <span>{card.unit}</span>
            </div>
            <div className="metric-context">{card.context}</div>
            {i === 3 && (
              <div className="metric-definition">{card.definition}</div>
            )}
          </div>
        ))}
      </div>
      <div className="generation-summary">
        <span className="muted">Period averages</span>
        <span>
          <i className="legend-line forecast" />
          Forecast <strong>{num(m.forecast)} MW</strong>
        </span>
        <span>
          <i className="legend-line actual" />
          Actual <strong>{num(m.actual)} MW</strong>
        </span>
        <span className="muted">
          Missing observations excluded, not imputed
        </span>
      </div>
    </section>
  )
}
