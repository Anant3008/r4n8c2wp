import { useEffect, useState } from "react"
import type { Evaluated } from "../data"

export default function useRecords(rows: Evaluated[], date: string) {
  const [search, setSearch] = useState("")
  const [quality, setQuality] = useState("all")
  const [sort, setSort] = useState(false)
  const [recordPage, setRecordPage] = useState(0)
  useEffect(() => setRecordPage(0), [date, quality, search, sort])

  const filtered = rows
    .filter(
      (row) =>
        `${row.timestamp} ${row.forecast} ${row.actual}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (quality === "all" ||
          (quality === "missing"
            ? row.actual === null
            : quality === "missingforecast"
              ? row.forecast === null
              : row.actual !== null && row.forecast !== null)),
    )
    .sort((a, b) =>
      sort
        ? (b.error ?? -Infinity) - (a.error ?? -Infinity)
        : a.timestamp.localeCompare(b.timestamp),
    )
  const recordPageSize = 48
  const recordStart = recordPage * recordPageSize
  const visibleRecords = filtered.slice(
    recordStart,
    recordStart + recordPageSize,
  )

  return {
    search,
    setSearch,
    quality,
    setQuality,
    sort,
    toggleSort: () => setSort((value) => !value),
    recordPage,
    setRecordPage,
    filtered,
    visibleRecords,
    recordPageSize,
    recordStart,
  }
}

export type RecordsState = ReturnType<typeof useRecords>
