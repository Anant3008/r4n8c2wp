import AccuracyMetrics from "../components/analysis/AccuracyMetrics"
import DailyPerformanceTable from "../components/analysis/DailyPerformanceTable"
import EvaluationSummary from "../components/analysis/EvaluationSummary"
import ForecastDirection from "../components/analysis/ForecastDirection"
import IntervalInspector from "../components/analysis/IntervalInspector"
import ErrorDistribution from "../components/charts/ErrorDistribution"
import ForecastErrorTimeline from "../components/charts/ForecastErrorTimeline"
import type { Evaluated, metrics } from "../data"
import type { DailyPerformance } from "../lib/dailyPerformance"

type Props = {
  rows: Evaluated[]
  date: string
  stats: ReturnType<typeof metrics>
  daily: DailyPerformance[]
  selected: Evaluated | null
  onDay: (day: number) => void
  onSelect: (row: Evaluated | null) => void
  onHistory: (row: Evaluated) => void
  onOpenDay: (day: number) => void
  onAccuracy: () => void
}

export default function AccuracyAnalysisPage({
  rows,
  date,
  stats,
  daily,
  selected,
  onDay,
  onSelect,
  onHistory,
  onOpenDay,
  onAccuracy,
}: Props) {
  return (
    <>
      <AccuracyMetrics rows={rows} />
      <div className="analysis-grid">
        <ForecastErrorTimeline
          date={date}
          rows={rows}
          daily={daily}
          stats={stats}
          changeDay={onDay}
          setSelected={onSelect}
        />
        <EvaluationSummary rows={rows} stats={stats} />
      </div>
      <div className="analysis-grid">
        <ErrorDistribution rows={rows} />
        <ForecastDirection rows={rows} stats={stats} />
      </div>
      {selected && (
        <IntervalInspector
          row={selected}
          onHistory={() => onHistory(selected)}
          onClose={() => onSelect(null)}
        />
      )}
      <DailyPerformanceTable
        daily={daily}
        onOpenDay={onOpenDay}
        onAccuracy={onAccuracy}
      />
    </>
  )
}
