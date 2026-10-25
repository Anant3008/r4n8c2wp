import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { Evaluated } from "../../data"
import { colors } from "../../lib/chartStyles"
import Panel from "../common/Panel"
export default function ErrorDistribution({ rows }: { rows: Evaluated[] }) {
  return (
    <Panel
      title="Error distribution"
      subtitle="Matched half-hourly observations · MW"
    >
      <div className="error-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={Array.from({ length: 11 }, (_, i) => {
              const start = -1250 + i * 250
              return {
                label: `${start}`,
                count: rows.filter(
                  (r) =>
                    r.error !== null &&
                    r.error >= start &&
                    r.error < start + 250,
                ).length,
              }
            })}
          >
            <XAxis
              dataKey="label"
              tick={{ fill: colors.muted, fontSize: "var(--text-xs)" }}
            />
            <YAxis tick={{ fill: colors.muted, fontSize: "var(--text-xs)" }} />
            <Tooltip />
            <Bar
              isAnimationActive={false}
              name="Intervals"
              dataKey="count"
              fill={colors.forecast}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
