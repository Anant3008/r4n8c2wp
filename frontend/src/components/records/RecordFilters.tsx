import { InputField, SelectField } from "@figma/astraui"
import { Search } from "lucide-react"
import type { RecordsState } from "../../hooks/useRecords"
export default function RecordFilters({ records }: { records: RecordsState }) {
  const { search, setSearch, quality, setQuality } = records
  return (
    <div className="flex gap-lg">
      <InputField
        aria-label="Search records"
        placeholder="Search timestamp or value…"
        prefix={<Search size={14} />}
        value={search}
        onChange={setSearch}
      />
      <SelectField
        value={quality}
        onChange={setQuality}
        options={[
          { value: "all", label: "All observations" },
          { value: "missing", label: "Missing actuals" },
          { value: "complete", label: "Matched records" },
          { value: "missingforecast", label: "No eligible forecast" },
        ]}
      />
    </div>
  )
}
