import { useTheme } from "@figma/astraui"
import { useEffect, useMemo, useRef, useState } from "react"
import { analysisURL, useAnalysisLocation } from "../analysisLocation"
import {
  evaluate,
  fetchIntervals,
  intervals,
  metrics,
  type Evaluated,
} from "../data"
import { getDailyPerformance } from "../lib/dailyPerformance"
import useRecords from "./useRecords"

export default function useWorkstation() {
  const { setTheme } = useTheme()
  useEffect(() => setTheme("light"), [])
  const [analysis, updateAnalysis] = useAnalysisLocation()
  const { page, date, cutoff } = analysis
  const setDate = (value: string) =>
    updateAnalysis({ date: value, interval: null })
  const setCutoff = (value: string) => updateAnalysis({ cutoff: value })
  const setSelected = (row: Evaluated | null) =>
    updateAnalysis({
      interval: row?.timestamp ?? null,
      ...(row ? { date: String(row.day) } : {}),
    })

  const heading = useRef<HTMLDivElement>(null)
  const previousPage = useRef(page)
  useEffect(() => {
    if (previousPage.current !== page)
      heading.current?.focus({ preventScroll: true })
    previousPage.current = page
  }, [page])

  const [shareLink, setShareLink] = useState("")
  useEffect(() => setShareLink(""), [page, date, cutoff, analysis.interval])
  const [notice, setNotice] = useState("")

  const [serverRows, setServerRows] = useState<Evaluated[] | null>(null)
  const [dataSource, setDataSource] = useState<"api" | "fixture">("fixture")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchIntervals("all", cutoff)
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setServerRows(data)
          setDataSource("api")
        }
      })
      .catch((err) => {
        console.warn("Backend not available, using baseline fixtures:", err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [cutoff])

  const evaluated = useMemo(
    () => serverRows ?? intervals.map((row) => evaluate(row, cutoff)),
    [serverRows, cutoff],
  )
  const rows = useMemo(
    () => evaluated.filter((row) => date === "all" || row.day === Number(date)),
    [date, evaluated],
  )
  const stats = metrics(rows)
  const daily = getDailyPerformance(rows)
  const records = useRecords(rows, date)
  const currentSelection = analysis.interval
    ? (evaluated.find((row) => row.timestamp === analysis.interval) ?? null)
    : null
  const focused = analysis.interval ? currentSelection : rows[0]

  const selectInterval = (row: Evaluated) => setSelected(row)
  const changeDay = (day: number) => setDate(String(day))
  const backToMonth = () => setDate("all")
  const openDayInExplorer = (day: number) =>
    updateAnalysis({ page: 1, date: String(day), interval: null })
  const navigate = (index: number, interval?: Evaluated) => {
    records.setSearch("")
    const nextDate = interval
      ? String(interval.day)
      : (index === 1 || index === 3) && date === "all"
        ? String(currentSelection?.day ?? 1)
        : date
    updateAnalysis({
      page: index,
      date: nextDate,
      interval:
        interval?.timestamp ?? (nextDate === date ? analysis.interval : null),
    })
  }
  const copyAnalysisLink = async () => {
    const url = analysisURL(window.location.href, analysis).href
    try {
      await navigator.clipboard.writeText(url)
      setNotice(
        "Analysis link copied. It restores the page, delivery date, cutoff, and selected interval.",
      )
      setShareLink("")
    } catch {
      setShareLink(url)
      setNotice(
        "Clipboard access is unavailable. Copy the analysis link below.",
      )
    }
  }
  const download = () => {
    const data = [
      "startTime,publishTime,forecastMW,actualMW,errorMW,cutoffUTC",
      ...rows.map((row) =>
        [
          row.timestamp,
          row.publicationTime,
          row.forecast,
          row.actual,
          row.error,
          row.cutoff,
        ].join(","),
      ),
    ].join("\n")
    const url = URL.createObjectURL(new Blob([data], { type: "text/csv" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "windsight-january-2026.csv"
    link.click()
    URL.revokeObjectURL(url)
    setNotice("January 2026 dataset exported as CSV.")
  }

  return {
    analysis,
    page,
    date,
    cutoff,
    setDate,
    setCutoff,
    setSelected,
    heading,
    shareLink,
    setShareLink,
    notice,
    setNotice,
    evaluated,
    rows,
    stats,
    daily,
    records,
    currentSelection,
    focused,
    selectInterval,
    changeDay,
    backToMonth,
    openDayInExplorer,
    navigate,
    copyAnalysisLink,
    download,
    dataSource,
    loading,
  }
}

export type WorkstationModel = ReturnType<typeof useWorkstation>
