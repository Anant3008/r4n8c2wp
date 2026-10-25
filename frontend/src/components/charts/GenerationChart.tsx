import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { Evaluated } from "../../data"
import { colors } from "../../lib/chartStyles"
import ChartState from "../common/ChartState"
import type { ChartStatus } from "../common/chartTypes"
import Tip from "./ChartTooltip"

export default function GenerationChart({
  rows,
  onSelect,
  selected,
  daily = false,
  status = "ready",
}: {
  rows: Evaluated[]
  onSelect: (r: Evaluated) => void
  selected: Evaluated | null
  daily?: boolean
  status?: ChartStatus
}) {
  if (
    status !== "ready" ||
    !rows.some(
      (row) => Number.isFinite(row.forecast) || Number.isFinite(row.actual),
    )
  )
    return (
      <div className="generation-chart">
        <ChartState status={status === "ready" ? "empty" : status} />
      </div>
    )
  return (
    <div className="generation-chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          accessibilityLayer={false}
          data={rows}
          onClick={(e: any) => {
            const index = Number(e?.activeTooltipIndex ?? e?.activeIndex)
            if (Number.isInteger(index) && index >= 0 && rows[index])
              onSelect(rows[index])
            else if (e?.activePayload?.[0]) onSelect(e.activePayload[0].payload)
          }}
          margin={{ top: 15, right: 12, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={colors.forecast}
                stopOpacity={0.13}
              />
              <stop offset="100%" stopColor={colors.forecast} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke={colors.grid}
            strokeDasharray="3 4"
          />
          <XAxis
            dataKey="label"
            minTickGap={daily ? 70 : 55}
            tickFormatter={(v) => (daily ? v.slice(0, 6) : v.slice(-5))}
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.muted, fontSize: "var(--text-xs)" }}
          />
          <YAxis
            domain={[0, "auto"]}
            tickFormatter={(v) => `${v / 1000}k`}
            axisLine={false}
            tickLine={false}
            width={40}
            tick={{ fill: colors.muted, fontSize: "var(--text-xs)" }}
          />
          <Tooltip content={<Tip />} />
          <Area
            type="monotone"
            name="Forecast"
            dataKey="forecast"
            stroke={colors.forecast}
            fill="url(#forecastFill)"
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            name="Actual"
            dataKey="actual"
            stroke={colors.actual}
            strokeDasharray="5 3"
            strokeWidth={2.4}
            dot={false}
            isAnimationActive={false}
          />
          {selected && rows.some((r) => r.timestamp === selected.timestamp) && (
            <>
              <ReferenceLine
                x={selected.label}
                stroke="var(--forest)"
                strokeDasharray="3 3"
              />
              {selected.forecast !== null && (
                <ReferenceDot
                  x={selected.label}
                  y={selected.forecast}
                  r={5}
                  fill={colors.forecast}
                  stroke="var(--surface-bg)"
                  strokeWidth={2}
                />
              )}
              {selected.actual !== null && (
                <ReferenceDot
                  x={selected.label}
                  y={selected.actual}
                  r={5}
                  fill={colors.actual}
                  stroke="var(--surface-bg)"
                  strokeWidth={2}
                />
              )}
            </>
          )}
          {!daily && (
            <Brush
              dataKey="time"
              height={18}
              stroke={colors.grid}
              fill="var(--surface-dark)"
              travellerWidth={6}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
