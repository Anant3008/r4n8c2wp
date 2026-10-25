import { Button } from "@figma/astraui"
import { ArrowRight } from "lucide-react"
import { num } from "../../data"
import type { DailyPerformance } from "../../lib/dailyPerformance"
import Panel from "../common/Panel"
export default function DailyPerformanceTable({
  daily,
  onOpenDay,
  onAccuracy,
}: {
  daily: DailyPerformance[]
  onOpenDay: (day: number) => void
  onAccuracy: () => void
}) {
  return (
    <Panel
      title="Daily performance"
      subtitle="Daily averages and forecast accuracy · January 2026"
      action={
        <Button
          variant="subtle"
          size="small"
          iconEnd={<ArrowRight size={14} />}
          onClick={onAccuracy}
        >
          View accuracy analysis
        </Button>
      }
    >
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {[
                "Delivery date",
                "Avg. forecast (MW)",
                "Avg. actual (MW)",
                "MAE (MW)",
                "RMSE (MW)",
                "Bias (MW)",
                "Coverage",
                "Data quality",
              ].map((t) => (
                <th key={t}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daily.slice(0, 31).map((d) => (
              <tr key={d.day} onClick={() => onOpenDay(d.day)}>
                <td className="font-medium">
                  <Button
                    variant="subtle"
                    size="small"
                    className="history-publication"
                    onClick={() => onOpenDay(d.day)}
                  >
                    {d.label} 2026 <ArrowRight size={12} />
                  </Button>
                </td>
                <td className="forecast-text">{num(d.forecast)}</td>
                <td className="actual-text">{num(d.actual)}</td>
                <td>{num(d.mae)}</td>
                <td>{num(d.rmse)}</td>
                <td className={d.bias >= 0 ? "error-text" : "forecast-text"}>
                  {d.bias >= 0 ? "+" : ""}
                  {num(d.bias)}
                </td>
                <td>
                  <span className="coverage-dot" />
                  {num(d.coverage, 1)}%
                </td>
                <td>
                  <span className={d.missing ? "late-tag" : "good-tag"}>
                    {d.missing ? `${d.missing} missing actual` : "Complete"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>
          Showing {daily.length} of {daily.length} days
        </span>
        <span>
          Source schema: Elexon BMRS{" "}
          <span className="muted">· Synthetic data</span>
        </span>
      </div>
    </Panel>
  )
}
