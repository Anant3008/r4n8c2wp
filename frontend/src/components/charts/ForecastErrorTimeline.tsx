import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { num, type Evaluated, type metrics } from "../../data"
import { colors } from "../../lib/chartStyles"
import type { DailyPerformance } from "../../lib/dailyPerformance"
import Panel from "../common/Panel"
import Tip from "./ChartTooltip"

type ErrorPoint = {
  label: string
  error: number | null
}

export default function ForecastErrorTimeline({
  date,
  rows,
  daily,
  stats,
  changeDay,
  setSelected,
}: {
  date: string
  rows: Evaluated[]
  daily: DailyPerformance[]
  stats: ReturnType<typeof metrics>
  changeDay: (day: number) => void
  setSelected: (row: Evaluated) => void
}) {
  const errorRows: ErrorPoint[] =
    date === "all"
      ? daily.map((d) => ({ label: d.label, error: d.bias }))
      : rows
  return (
    <Panel
      title={
        date === "all"
          ? "Daily mean signed error"
          : "Half-hourly forecast error"
      }
      subtitle="Forecast − actual · positive values indicate overforecasting"
      action={
        <div className="text-video-title muted">
          Bias{" "}
          <span className="warning-text">
            {stats.bias > 0 ? "+" : ""}
            {num(stats.bias)} MW
          </span>
        </div>
      }
    >
      <div className="error-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={errorRows}
            onClick={(state: any) => {
              const index = Number(
                state?.activeTooltipIndex ?? state?.activeIndex,
              )
              if (!Number.isInteger(index) || index < 0) return
              if (date === "all" && daily[index]) {
                changeDay(daily[index].day)
              } else if (rows[index]) setSelected(rows[index])
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke={colors.grid}
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="label"
              tickFormatter={(v) =>
                date === "all" ? v.slice(0, 6) : v.slice(-5)
              }
              minTickGap={35}
              tick={{ fill: colors.muted, fontSize: "var(--text-xs)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              width={40}
              tick={{ fill: colors.muted, fontSize: "var(--text-xs)" }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine
              y={0}
              ifOverflow="extendDomain"
              stroke="var(--text-primary)"
              strokeWidth={1.3}
            />
            <Tooltip content={<Tip />} />
            <Bar
              isAnimationActive={false}
              dataKey="error"
              name="Error"
              radius={[2, 2, 0, 0]}
            >
              {(date === "all"
                ? daily.map((d) => ({ error: d.bias }))
                : rows
              ).map((r, i) => (
                <Cell
                  key={i}
                  fill={(r.error ?? 0) >= 0 ? colors.error : colors.forecast}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
