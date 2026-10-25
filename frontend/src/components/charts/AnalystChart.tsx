import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import ChartState from "../common/ChartState"
import type { ChartStatus } from "../common/chartTypes"
import AnalyticalTooltip from "./AnalyticalTooltip"
import type { ChartRow } from "./chartTypes"
function clickRow(
  state: any,
  rows: ChartRow[],
  onSelect: (index: number) => void,
) {
  // Recharts 3 exposes the active tooltip index; retain payload support for 2.x.
  const index = Number(state?.activeTooltipIndex ?? state?.activeIndex)
  if (Number.isInteger(index) && index >= 0 && rows[index]) onSelect(index)
  else if (state?.activePayload?.[0]?.payload) {
    const found = rows.indexOf(state.activePayload[0].payload)
    if (found >= 0) onSelect(found)
  }
}
export default function AnalystChart({
  rows,
  monthly = false,
  error = false,
  selectedDay,
  selectedLabel,
  onSelect,
  status = "ready",
  onRetry,
}: {
  rows: ChartRow[]
  monthly?: boolean
  error?: boolean
  selectedDay?: number
  selectedLabel?: string
  onSelect: (index: number) => void
  status?: ChartStatus
  onRetry?: () => void
}) {
  const tick = { fill: "var(--text-secondary)", fontSize: "var(--text-xs)" }
  const selectedPoint = rows.find((row) => row.label === selectedLabel)
  const frame = monthly
    ? "monthly-chart"
    : error
      ? "interval-error-chart"
      : "daily-chart"
  const hasObservations = rows.some((row) =>
    error
      ? row.error != null && Number.isFinite(row.error)
      : Number.isFinite(row.forecast) || Number.isFinite(row.actual),
  )
  if (status !== "ready" || !hasObservations)
    return (
      <div className={frame}>
        <ChartState
          status={status === "ready" ? "empty" : status}
          errorOnly={error}
          onRetry={onRetry}
        />
      </div>
    )
  return (
    <div
      className={
        monthly
          ? "monthly-chart"
          : error
            ? "interval-error-chart"
            : "daily-chart"
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          accessibilityLayer={false}
          data={rows}
          onClick={(state: any) => clickRow(state, rows, onSelect)}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border-secondary)"
            strokeDasharray="3 4"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            minTickGap={monthly ? 30 : 36}
            tick={tick}
            tickFormatter={(label) =>
              monthly || label.length <= 6 ? label : label.slice(-5)
            }
          />
          <YAxis
            width={48}
            axisLine={false}
            tickLine={false}
            tick={tick}
            tickFormatter={(v) =>
              Math.abs(v) >= 1000 ? `${v / 1000}k` : `${v}`
            }
            domain={error ? ["auto", "auto"] : [0, "auto"]}
          />
          <Tooltip content={<AnalyticalTooltip />} />
          {monthly && selectedDay && (
            <ReferenceLine
              x={`${String(selectedDay).padStart(2, "0")} Jan`}
              stroke="var(--forest)"
              strokeWidth={1.5}
            />
          )}
          {!error &&
            rows
              .filter((r) => r.actual === null && r.forecast !== null)
              .map((r) => (
                <ReferenceLine
                  key={`missing-${r.label}`}
                  x={r.label}
                  stroke="var(--text-secondary)"
                  strokeDasharray="2 4"
                  label={{ value: "Missing", position: "insideTop", fill: "var(--text-secondary)", fontSize: "var(--text-xs)" }}
                />
              ))}
          {error ? (
            <>
              <ReferenceLine
                y={0}
                ifOverflow="extendDomain"
                stroke="var(--text-primary)"
                strokeWidth={1.3}
              />
              <Bar
                dataKey="error"
                name="Signed error"
                isAnimationActive={false}
              >
                {rows.map((r, i) => (
                  <Cell
                    key={i}
                    fill={
                      (r.error ?? 0) > 0 ? "var(--error)" : "var(--forecast)"
                    }
                    fillOpacity={0.75}
                  />
                ))}
              </Bar>
            </>
          ) : (
            <>
              <Area
                dataKey={(r: ChartRow) =>
                  r.forecast != null && r.actual != null
                    ? [Math.min(r.forecast, r.actual), Math.max(r.forecast, r.actual)]
                    : null
                }
                name="Forecast–actual gap"
                stroke="none"
                fill="var(--forecast)"
                fillOpacity={0.09}
                isAnimationActive={false}
                activeDot={false}
                legendType="none"
              />
              <Line
                dataKey="forecast"
                name="Eligible forecast"
                stroke="var(--forecast)"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
              <Line
                dataKey="actual"
                name="Actual"
                stroke="var(--actual)"
                strokeDasharray="5 3"
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </>
          )}
          {selectedPoint && (
            <ReferenceLine
              x={selectedPoint.label}
              stroke="var(--forest)"
              strokeDasharray="3 3"
            />
          )}
          {selectedPoint && !error && selectedPoint.forecast !== null && (
            <ReferenceDot
              x={selectedPoint.label}
              y={selectedPoint.forecast}
              r={5}
              fill="var(--forecast)"
              stroke="var(--surface-bg)"
              strokeWidth={2}
            />
          )}
          {selectedPoint && !error && selectedPoint.actual !== null && (
            <ReferenceDot
              x={selectedPoint.label}
              y={selectedPoint.actual}
              r={5}
              fill="var(--actual)"
              stroke="var(--surface-bg)"
              strokeWidth={2}
            />
          )}
          {selectedPoint && error && selectedPoint.error != null && (
            <ReferenceDot
              x={selectedPoint.label}
              y={selectedPoint.error}
              r={4}
              fill="var(--forest)"
              stroke="var(--surface-bg)"
              strokeWidth={2}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
