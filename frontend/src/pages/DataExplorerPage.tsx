import RecordsTable from "../components/records/RecordsTable"
import type { Evaluated } from "../data"
import type { RecordsState } from "../hooks/useRecords"

type Props = {
  records: RecordsState
  selected: Evaluated | null
  onSelect: (row: Evaluated) => void
  onPublications: (row: Evaluated) => void
}

export default function DataExplorerPage({
  records,
  selected,
  onSelect,
  onPublications,
}: Props) {
  return (
    <RecordsTable
      title="Underlying records"
      records={records}
      currentSelection={selected}
      selectInterval={onSelect}
      onPublications={onPublications}
    />
  )
}
