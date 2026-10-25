const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
})

export function formatDate(value: string | null): string {
  if (!value || !Number.isFinite(Date.parse(value))) return "Date unavailable"
  return dateFormatter.format(new Date(value))
}

export function formatTimestamp(
  value: string | null,
  includeUTC = true,
): string {
  if (!value || !Number.isFinite(Date.parse(value)))
    return "Timestamp unavailable"
  return `${formatDate(value)}, ${timeFormatter.format(new Date(value))}${
    includeUTC ? " UTC" : ""
  }`
}

export function formatSigned(value: number | null): string {
  return value === null || !Number.isFinite(value)
    ? "—"
    : `${value > 0 ? "+" : ""}${num(value)}`
}
import { num } from "./data"
