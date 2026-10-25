import { num, type Evaluated, type metrics } from "../../data"
import Panel from "../common/Panel"
export default function ForecastDirection({
  rows,
  stats,
}: {
  rows: Evaluated[]
  stats: ReturnType<typeof metrics>
}) {
  return (
    <Panel
      title="Forecast direction"
      subtitle="A positive error means generation was overforecast"
    >
      <div className="direction-stat">
        <span className="error-text">Overforecasting</span>
        <strong>
          {num(
            (rows.filter((r) => r.error !== null && r.error > 0).length /
              stats.pairs) *
              100,
            1,
          )}
          %
        </strong>
      </div>
      <div className="direction-stat">
        <span className="forecast-text">Underforecasting</span>
        <strong>
          {num(
            (rows.filter((r) => r.error !== null && r.error < 0).length /
              stats.pairs) *
              100,
            1,
          )}
          %
        </strong>
      </div>
      <div className="muted text-label-sm">
        Missing actuals are excluded from MAE, RMSE, bias, and direction
        analysis.
      </div>
    </Panel>
  )
}
