import { Button } from "@figma/astraui"
import { ArrowRight } from "lucide-react"
import type { metrics } from "../../data"
import { num } from "../../data"
export default function Methodology({
  stats: m,
  missingActual,
  missingForecast,
  onRecords,
}: {
  stats: ReturnType<typeof metrics>
  missingActual: number
  missingForecast: number
  onRecords: (filter: string) => void
}) {
  return (
    <details className="quiet-disclosure">
      <summary>
        Data & methodology
        <span className="muted">
          {missingActual + missingForecast
            ? `${missingActual} missing actuals · ${missingForecast} missing forecasts`
            : "View source notes"}
        </span>
      </summary>
      <div className="quiet-disclosure-body quiet-methodology">
        <dl>
          <div>
            <dt>Mean generation</dt>
            <dd>
              Forecast {num(m.forecast)} MW · actual {num(m.actual)} MW
            </dd>
          </div>
          <div>
            <dt>Missing actuals</dt>
            <dd>
              <Button
                variant="subtle"
                size="small"
                onClick={() => onRecords("missing")}
              >
                {missingActual} records <ArrowRight size={12} />
              </Button>
            </dd>
          </div>
          <div>
            <dt>No eligible forecast</dt>
            <dd>
              <Button
                variant="subtle"
                size="small"
                onClick={() => onRecords("missingforecast")}
              >
                {missingForecast} records <ArrowRight size={12} />
              </Button>
            </dd>
          </div>
        </dl>
        <div>
          Latest publication at or before the assumed D−1 cutoff only. Later
          revisions are excluded, never substituted. Error = forecast − actual.
          MAE, RMSE, and bias use matched observations only. Relative MAE = MAE
          / mean matched actual; this is not MAPE. Coverage = eligible forecasts
          / expected intervals. Sourced directly from Elexon BMRS (WINDFOR + FUELHH) for January 2026.
        </div>
      </div>
    </details>
  )
}
