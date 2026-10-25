import { Button } from "@figma/astraui"
import { ArrowRight } from "lucide-react"
import type { Evaluated } from "../../data"
import type { OverviewDay } from "../../lib/dailyPerformance"
import IntervalNavigator from "../analysis/IntervalNavigator"
import AnalystChart from "../charts/AnalystChart"
import Definition from "../common/Definition"
import Section from "../common/Section"
import AnalysisTrail from "./AnalysisTrail"
export default function OverviewGeneration({
  date,
  rows,
  chartRows,
  inspected,
  choosePoint,
  onSelect,
  onNavigate,
  onMonth,
  onClearInterval,
}: {
  date: string
  rows: Evaluated[]
  chartRows: Evaluated[] | OverviewDay[]
  inspected: Evaluated | null
  choosePoint: (index: number) => void
  onSelect: (row: Evaluated) => void
  onNavigate: (page: number, row?: Evaluated) => void
  onMonth: () => void
  onClearInterval: () => void
}) {
  const monthly = date === "all"
  return (
    <Section
      title={
        monthly
          ? "January 2026"
          : `${Number(date)} January · ${rows.length} delivery intervals`
      }
      description={
        monthly
          ? "Forecast vs. actual · daily averages · MW"
          : "Forecast vs. actual · half-hourly · MW"
      }
      className="quiet-main-chart"
      action={
        <div className="quiet-chart-tools">
          <div className="legend">
            <span className="legend-line forecast" />
            <Definition term="Forecast" definition="Latest WINDFOR publication available by the assumed decision cutoff." />
            <span className="legend-line actual" />
            <Definition term="Actual" definition="Observed FUELHH wind generation. Dashed line; gaps mark missing observations." />
            <span className="legend-swatch gap" />
            <Definition term="Gap" definition="Shaded area between forecast and actual. Wider bands mean larger forecast error." />
          </div>
        </div>
      }
    >
      <AnalysisTrail date={date} interval={inspected?.time ?? null} onMonth={onMonth} onDay={onClearInterval} />
      <div className="view-enter" key={date}>
      <IntervalNavigator
        rows={rows}
        selected={inspected}
        onSelect={onSelect}
        disabled={monthly}
      >
        <AnalystChart
          rows={chartRows}
          monthly={monthly}
          selectedLabel={inspected?.label}
          onSelect={choosePoint}
        />
        <div className="quiet-error-label">
          <span>
            {monthly ? "Daily bias" : "Forecast error"}{" "}
            <span className="muted">· MW</span>
          </span>
          <span className="muted">+ over / − under</span>
        </div>
        <AnalystChart
          rows={chartRows}
          monthly={false}
          error
          selectedLabel={inspected?.label}
          onSelect={choosePoint}
        />
      </IntervalNavigator>
      </div>
      <div className="quiet-chart-footer">
        <span>
          {monthly
            ? "Select a day to explore"
            : "Select an interval · use ← → to step through"}{" "}
          · UTC
        </span>
        {!monthly && (
          <Button
            variant="subtle"
            size="small"
            iconEnd={<ArrowRight size={13} />}
            onClick={() => onNavigate(1, rows[0])}
          >
            Open explorer
          </Button>
        )}
      </div>
    </Section>
  )
}
