import { Button, SelectField } from "@figma/astraui"
import { ArrowRight } from "lucide-react"
import { formatSigned as signed } from "../../analysisFormatting"
import { num, type Evaluated } from "../../data"
import type { Ranking } from "../../lib/analysisInteractions"
import type { OverviewDay } from "../../lib/dailyPerformance"
export default function DailyResults({
  daily,
  ranked,
  rankBy,
  setRankBy,
  descending,
  setDescending,
  allRows,
  onNavigate,
}: {
  daily: OverviewDay[]
  ranked: OverviewDay[]
  rankBy: Ranking
  setRankBy: (ranking: Ranking) => void
  descending: boolean
  setDescending: (value: boolean) => void
  allRows: Evaluated[]
  onNavigate: (page: number, row?: Evaluated) => void
}) {
  return (
    <details className="quiet-disclosure">
      <summary>
        All daily results
        <span className="muted">{daily.length} delivery days</span>
      </summary>
      <div className="quiet-disclosure-body">
        <div className="table-controls">
          <SelectField
            value={rankBy}
            onChange={(value) => setRankBy(value as Ranking)}
            options={[
              { value: "mae", label: "Sort by MAE" },
              { value: "rmse", label: "Sort by RMSE" },
              { value: "bias", label: "Sort by absolute bias" },
            ]}
          />
          <Button
            variant="subtle"
            size="small"
            onClick={() => setDescending(!descending)}
          >
            {descending ? "Highest first" : "Lowest first"}
          </Button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Delivery day</th>
                <th>MAE (MW)</th>
                <th>RMSE (MW)</th>
                <th>Bias (MW)</th>
                <th>Matched</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((d) => (
                <tr key={d.day}>
                  <td>
                    <Button
                      variant="subtle"
                      size="small"
                      className="history-publication"
                      onClick={() =>
                        onNavigate(
                          1,
                          allRows.find((r) => r.day === d.day),
                        )
                      }
                    >
                      {d.label} 2026 <ArrowRight size={12} />
                    </Button>
                  </td>
                  <td>{num(d.mae)}</td>
                  <td>{num(d.rmse)}</td>
                  <td>{signed(d.bias)}</td>
                  <td>
                    {d.pairs}/{d.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  )
}
