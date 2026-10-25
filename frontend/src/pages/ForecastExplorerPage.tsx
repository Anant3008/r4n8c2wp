import AccuracyMetrics from "../components/analysis/AccuracyMetrics"
import IntervalInspector from "../components/analysis/IntervalInspector"
import IntervalNavigator from "../components/analysis/IntervalNavigator"
import IntervalSteps from "../components/analysis/IntervalSteps"
import AnalystChart from "../components/charts/AnalystChart"
import GenerationChart from "../components/charts/GenerationChart"
import Panel from "../components/common/Panel"
import RecordsTable from "../components/records/RecordsTable"
import type { Evaluated, metrics } from "../data"
import type { RecordsState } from "../hooks/useRecords"
type Props = {
  rows: Evaluated[]
  date: string
  stats: ReturnType<typeof metrics>
  records: RecordsState
  selected: Evaluated | null
  onSelect: (row: Evaluated | null) => void
  onHistory: (row: Evaluated) => void
}
export default function ForecastExplorerPage({
  rows,
  date,
  stats,
  records,
  selected: currentSelection,
  onSelect,
  onHistory,
}: Props) {
  const chartRows = rows
  const selectInterval = (row: Evaluated) => onSelect(row)
  const setSelected = onSelect
  const navigate = (_page: number, row?: Evaluated) => {
    if (row) onHistory(row)
  }
  return (
    <>
      <AccuracyMetrics rows={rows} />
      <div
        className={`explorer-linked-layout ${
          currentSelection ? "has-selection" : ""
        }`}
      >
        <Panel
          title={
            date === "all"
              ? "January 2026"
              : `${Number(date)} January · ${rows.length} delivery intervals`
          }
          subtitle="Forecast vs. actual · half-hourly · MW"
          action={
            <div className="chart-actions">
              <div className="legend">
                <span className="legend-line forecast" />
                Forecast
                <span className="legend-line actual" />
                Actual
              </div>
            </div>
          }
        >
          <IntervalNavigator
            rows={rows}
            selected={currentSelection}
            onSelect={selectInterval}
          >
            <div className="axis-label">Generation (MW)</div>
            <GenerationChart
              rows={chartRows}
              daily={date === "all"}
              selected={currentSelection}
              onSelect={selectInterval}
            />
            <div className="quiet-error-label">
              <span>Forecast error · MW</span>
              <span className="muted">+ over / − under</span>
            </div>
            <AnalystChart
              rows={rows}
              error
              selectedLabel={currentSelection?.label}
              onSelect={(index) => selectInterval(rows[index])}
            />
          </IntervalNavigator>
          <div className="chart-foot">
            <span>{stats.pairs.toLocaleString()} matched intervals</span>
            <span>Use ← → to browse intervals · UTC</span>
          </div>
        </Panel>
        {currentSelection && (
          <aside className="quiet-side-inspector">
            <IntervalSteps
              rows={rows}
              selected={currentSelection}
              onSelect={selectInterval}
            />
            <IntervalInspector
              row={currentSelection}
              onHistory={() => navigate(3, currentSelection)}
              onClose={() => setSelected(null)}
            />
          </aside>
        )}
      </div>
      <RecordsTable
        title="Delivery interval details"
        records={records}
        currentSelection={currentSelection}
        selectInterval={selectInterval}
        onPublications={onHistory}
      />
    </>
  )
}
