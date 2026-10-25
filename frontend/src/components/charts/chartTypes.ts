export type ChartRow = {
  label: string
  day: number
  forecast: number | null
  actual: number | null
  error?: number | null
  publicationTime?: string | null
  timestamp?: string
}
