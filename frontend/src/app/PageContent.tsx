import type { WorkstationModel } from "../hooks/useWorkstation"
import AccuracyAnalysisPage from "../pages/AccuracyAnalysisPage"
import DataExplorerPage from "../pages/DataExplorerPage"
import ForecastExplorerPage from "../pages/ForecastExplorerPage"
import ForecastHistoryPage from "../pages/ForecastHistoryPage"
import OverviewPage from "../pages/OverviewPage"

export default function PageContent({ model: m }: { model: WorkstationModel }) {
  switch (m.page) {
    case 1:
      return (
        <ForecastExplorerPage
          rows={m.rows}
          date={m.date}
          stats={m.stats}
          records={m.records}
          selected={m.currentSelection}
          onSelect={m.setSelected}
          onHistory={(row) => m.navigate(3, row)}
        />
      )
    case 2:
      return (
        <AccuracyAnalysisPage
          rows={m.rows}
          date={m.date}
          stats={m.stats}
          daily={m.daily}
          selected={m.currentSelection}
          onDay={m.changeDay}
          onSelect={m.setSelected}
          onHistory={(row) => m.navigate(3, row)}
          onOpenDay={m.openDayInExplorer}
          onAccuracy={() => m.navigate(2)}
        />
      )
    case 3:
      return (
        <ForecastHistoryPage
          rows={m.rows}
          focused={m.focused}
          onSelect={m.setSelected}
          onDelivery={(row) => m.navigate(1, row)}
        />
      )
    case 4:
      return (
        <DataExplorerPage
          records={m.records}
          selected={m.currentSelection}
          onSelect={m.selectInterval}
          onPublications={(row) => m.navigate(3, row)}
        />
      )
    default:
      return (
        <OverviewPage
          allRows={m.evaluated}
          rows={m.rows}
          date={m.date}
          onDay={m.changeDay}
          selected={m.currentSelection}
          onSelect={m.setSelected}
          onNavigate={m.navigate}
          onRecords={(filter) => {
            m.records.setQuality(filter)
            m.navigate(4)
          }}
          onMonth={m.backToMonth}
        />
      )
  }
}
