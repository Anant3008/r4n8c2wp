import { SelectField } from "@figma/astraui"
import { Calendar, Clock } from "lucide-react"
import DateStepper from "../analysis/DateStepper"
export default function AnalysisFilters({
  date,
  cutoff,
  setDate,
  setCutoff,
  changeDay,
  backToMonth,
}: {
  date: string
  cutoff: string
  setDate: (date: string) => void
  setCutoff: (cutoff: string) => void
  changeDay: (day: number) => void
  backToMonth: () => void
}) {
  return (
    <div className="filter-bar">
      <div className="filter-main">
        <Calendar size={16} />
        <SelectField
          value={date}
          onChange={setDate}
          options={[
            { value: "all", label: "01 Jan – 31 Jan 2026" },
            ...Array.from({ length: 31 }, (_, i) => ({
              value: String(i + 1),
              label: `${String(i + 1).padStart(2, "0")} January 2026`,
            })),
          ]}
        />
        <DateStepper date={date} onDay={changeDay} onMonth={backToMonth} />
        <span className="filter-separator" />
        <span className="muted text-video-title">Resolution</span>
        <span className="text-label-sm">30 minutes</span>
      </div>
      <div className="flex items-center gap-md">
        <Clock size={14} className="muted" />
        <span className="text-video-title muted">Assumed D−1 cutoff</span>
        <SelectField
          value={cutoff}
          onChange={setCutoff}
          options={["08:00", "10:00", "12:00"].map((v) => ({
            value: v,
            label: `${v} UTC`,
          }))}
        />
      </div>
    </div>
  )
}
