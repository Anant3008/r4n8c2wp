import { type Evaluated } from "../data"
export type Ranking = "mae" | "rmse" | "bias"
export function rankDays<T extends {
  day: number
  mae: number
  rmse: number
  bias: number
},>(days: T[], by: Ranking, descending = true) {
  return [...days].sort((a, b) => {
    const av = by === "bias" ? Math.abs(a.bias) : a[by]
    const bv = by === "bias" ? Math.abs(b.bias) : b[by]
    if (!Number.isFinite(av)) return Number.isFinite(bv) ? 1 : a.day - b.day
    if (!Number.isFinite(bv)) return -1
    return (descending ? bv - av : av - bv) || a.day - b.day
  })
}
export function adjacentInterval(
  rows: Evaluated[],
  timestamp: string | undefined,
  direction: -1 | 1,
) {
  if (!rows.length) return null
  const index = rows.findIndex((r) => r.timestamp === timestamp)
  return rows[
    index < 0
      ? direction === 1
        ? 0
        : rows.length - 1
      : Math.max(0, Math.min(rows.length - 1, index + direction))
  ]
}
