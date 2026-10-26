import { metrics, type Evaluated } from "../data"
export function getDailyPerformance(rows: Evaluated[]) {
  return Array.from(new Set(rows.map((r) => r.day))).map((day) => {
    const group = rows.filter((r) => r.day === day)
    return {
      day,
      ...metrics(group),
      label: `${String(day).padStart(2, "0")} Jan`,
      count: group.length,
      missing: group.filter((r) => r.actual === null).length,
    }
  })
}
export type DailyPerformance = ReturnType<typeof getDailyPerformance>[number]
export function getOverviewDays(rows: Evaluated[]) {
  return getDailyPerformance(rows).map((day) => ({
    ...day,
    forecast: Number.isFinite(day.forecast) ? day.forecast : null,
    actual: Number.isFinite(day.actual) ? day.actual : null,
    error: Number.isFinite(day.bias) ? day.bias : null,
    total: day.count,
  }))
}
export type OverviewDay = ReturnType<typeof getOverviewDays>[number]
