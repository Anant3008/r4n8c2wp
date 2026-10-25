import { CheckCircle } from "lucide-react"
import { num, type Evaluated, type metrics } from "../../data"
import Panel from "../common/Panel"
export default function EvaluationSummary({
  rows,
  stats,
}: {
  rows: Evaluated[]
  stats: ReturnType<typeof metrics>
}) {
  return (
    <Panel title="Evaluation summary" subtitle="Decision-time forecast quality">
      <div className="summary-row">
        <span className="muted">Matched intervals</span>
        <strong>
          {num(stats.pairs)}
          <span className="muted"> / {num(rows.length)}</span>
        </strong>
      </div>
      <div className="summary-row">
        <span className="muted">Forecast bias</span>
        <strong className="warning-text">
          {stats.bias > 0 ? "+" : ""}
          {num(stats.bias)} MW
        </strong>
      </div>
      <div className="summary-row">
        <span className="muted">Missing actual observations</span>
        <strong>{rows.filter((r) => r.actual === null).length}</strong>
      </div>
      <div className="summary-foot">
        <CheckCircle size={14} className="actual-text" />
        Later publications excluded from scoring
      </div>
    </Panel>
  )
}
