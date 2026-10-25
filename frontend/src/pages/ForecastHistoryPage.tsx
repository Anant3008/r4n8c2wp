import IntervalInspector from "../components/analysis/IntervalInspector"
import PublicationHistory from "../components/analysis/PublicationHistory"
import type { Evaluated } from "../data"
type Props = {
  rows: Evaluated[]
  focused: Evaluated | null | undefined
  onSelect: (row: Evaluated | null) => void
  onDelivery: (row: Evaluated) => void
}
export default function ForecastHistoryPage({
  rows,
  focused,
  onSelect,
  onDelivery,
}: Props) {
  if (!focused) return null
  return (
    <>
      <IntervalInspector
        row={focused}
        historyView
        onHistory={() => onDelivery(focused)}
      />
      <PublicationHistory
        rows={rows}
        focused={focused}
        onSelect={onSelect}
        onDelivery={onDelivery}
      />
    </>
  )
}
