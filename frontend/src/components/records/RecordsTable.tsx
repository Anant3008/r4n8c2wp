import { Button } from "@figma/astraui"
import { ArrowRight, ArrowUpDown, Search } from "lucide-react"
import { formatTimestamp } from "../../analysisFormatting"
import type { Evaluated } from "../../data"
import type { RecordsState } from "../../hooks/useRecords"
import ObservationValue from "../common/ObservationValue"
import Panel from "../common/Panel"
import RecordFilters from "./RecordFilters"
import RecordPagination from "./RecordPagination"
export default function RecordsTable({
  title,
  records,
  currentSelection,
  selectInterval,
  onPublications,
}: {
  title: string
  records: RecordsState
  currentSelection: Evaluated | null
  selectInterval: (row: Evaluated) => void
  onPublications: (row: Evaluated) => void
}) {
  const { filtered, visibleRecords, quality, setSearch, setQuality } = records
  return (
    <Panel
      title={title}
      subtitle={`${filtered.length.toLocaleString()} records · WINDFOR forecasts joined to FUELHH actuals`}
      action={<RecordFilters records={records} />}
    >
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Delivery timestamp (UTC)</th>
              <th>Forecast (MW)</th>
              <th>Actual (MW)</th>
              <th>
                <Button
                  variant="subtle"
                  size="small"
                  onClick={records.toggleSort}
                  iconEnd={<ArrowUpDown size={12} />}
                >
                  Error (MW)
                </Button>
              </th>
              <th>Evaluated publication (UTC)</th>
              <th>Quality</th>
              <th>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((r) => (
              <tr
                key={r.timestamp}
                className={
                  currentSelection?.timestamp === r.timestamp
                    ? "selected-interval-row"
                    : ""
                }
                aria-selected={currentSelection?.timestamp === r.timestamp}
                onClick={() => selectInterval(r)}
              >
                <td>
                  <Button
                    variant="subtle"
                    size="small"
                    className="history-publication"
                    aria-pressed={currentSelection?.timestamp === r.timestamp}
                    onClick={() => selectInterval(r)}
                  >
                    {formatTimestamp(r.timestamp, false)}
                  </Button>
                </td>
                <td className="forecast-text">
                  <ObservationValue value={r.forecast} kind="forecast" />
                </td>
                <td className="actual-text">
                  <ObservationValue value={r.actual} />
                </td>
                <td
                  className={
                    (r.error ?? 0) >= 0 ? "error-text" : "forecast-text"
                  }
                >
                  <ObservationValue value={r.error} kind="error" signed />
                </td>
                <td>
                  {r.publicationTime
                    ? formatTimestamp(r.publicationTime, false)
                    : "No eligible publication"}
                </td>
                <td>
                  <span
                    className={
                      r.actual === null || r.forecast === null
                        ? "late-tag"
                        : "good-tag"
                    }
                  >
                    {r.forecast === null
                      ? "No eligible forecast"
                      : r.actual === null
                        ? "Missing actual"
                        : "Matched"}
                  </span>
                </td>
                <td>
                  <Button
                    variant="subtle"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation()
                      onPublications(r)
                    }}
                  >
                    Publications <ArrowRight size={12} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="empty-state">
            <Search size={24} />
            <strong>No records found</strong>
            <span>
              {quality === "missingforecast"
                ? "No intervals match the missing-forecast filter in this period."
                : quality === "missing"
                  ? "No intervals match the missing-actual filter in this period."
                  : "No timestamps or values match these filters."}
            </span>
            <Button
              variant="neutral"
              size="small"
              onClick={() => {
                setSearch("")
                setQuality("all")
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      <div className="table-footer">
        <RecordPagination records={records} />
      </div>
    </Panel>
  )
}
