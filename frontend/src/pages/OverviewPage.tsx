import { useState } from "react"
import IntervalInspector from "../components/analysis/IntervalInspector"
import IntervalSteps from "../components/analysis/IntervalSteps"
import DailyResults from "../components/overview/DailyResults"
import DaysToReview from "../components/overview/DaysToReview"
import IntervalResults from "../components/overview/IntervalResults"
import Methodology from "../components/overview/Methodology"
import OverviewGeneration from "../components/overview/OverviewGeneration"
import OverviewMetrics from "../components/overview/OverviewMetrics"
import { metrics, type Evaluated } from "../data"
import { rankDays, type Ranking } from "../lib/analysisInteractions"
import { getOverviewDays } from "../lib/dailyPerformance"
export default function AnalystOverview({
  allRows,
  rows,
  date,
  onDay,
  selected,
  onSelect,
  onNavigate,
  onRecords,
  onMonth,
}: {
  allRows: Evaluated[]
  rows: Evaluated[]
  date: string
  onDay: (day: number) => void
  selected: Evaluated | null
  onSelect: (row: Evaluated | null) => void
  onNavigate: (page: number, row?: Evaluated) => void
  onRecords: (filter: string) => void
  onMonth: () => void
}) {
  const [rankBy, setRankBy] = useState<Ranking>("mae")
  const [descending, setDescending] = useState(true)
  const daily = getOverviewDays(allRows)
  const ranked = rankDays(daily, rankBy, descending)
  const reviewDays = rankDays(daily, rankBy)
  const monthly = date === "all"
  const chartRows = monthly ? daily : rows
  const m = metrics(rows)
  const inspected = selected
    ? (allRows.find((r) => r.timestamp === selected.timestamp) ?? null)
    : null
  const missingActual = rows.filter((r) => r.actual === null).length
  const missingForecast = rows.filter((r) => r.forecast === null).length
  const choosePoint = (index: number) => {
    if (monthly) onDay(daily[index].day)
    else onSelect(rows[index])
  }

  return (
    <div className="calm-overview">
      <OverviewMetrics stats={m} />
      <div
        className={`quiet-workspace ${
          inspected ? "has-interval-selection" : ""
        }`}
      >
        <div className="quiet-chart-column">
          <OverviewGeneration
            onMonth={onMonth}
            onClearInterval={() => onSelect(null)}
            date={date}
            rows={rows}
            chartRows={chartRows}
            inspected={inspected}
            choosePoint={choosePoint}
            onSelect={onSelect}
            onNavigate={onNavigate}
          />
          {!monthly && (
            <IntervalResults
              rows={rows}
              inspected={inspected}
              onSelect={onSelect}
            />
          )}
        </div>
        <aside
          className="quiet-review"
          aria-label={
            inspected
              ? "Selected delivery interval"
              : "Delivery days ranked by error"
          }
        >
          {inspected ? (
            <div className="quiet-side-inspector">
              <IntervalSteps
                rows={rows}
                selected={inspected}
                onSelect={onSelect}
              />
              <IntervalInspector
                row={inspected}
                onClose={() => onSelect(null)}
                onHistory={() => onNavigate(3, inspected)}
              />
            </div>
          ) : (
            <DaysToReview
              reviewDays={reviewDays}
              rankBy={rankBy}
              setRankBy={setRankBy}
              date={date}
              onDay={onDay}
              onSelect={onSelect}
              onNavigate={onNavigate}
            />
          )}
        </aside>
      </div>
      <DailyResults
        daily={daily}
        ranked={ranked}
        rankBy={rankBy}
        setRankBy={setRankBy}
        descending={descending}
        setDescending={setDescending}
        allRows={allRows}
        onNavigate={onNavigate}
      />
      <Methodology
        stats={m}
        missingActual={missingActual}
        missingForecast={missingForecast}
        onRecords={onRecords}
      />
    </div>
  )
}
