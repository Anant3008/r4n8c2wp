import { Button, SelectField } from "@figma/astraui"
import { ArrowRight } from "lucide-react"
import { formatTimestamp } from "../../analysisFormatting"
import { num, type Evaluated } from "../../data"
import Panel from "../common/Panel"
export default function PublicationHistory({
  rows,
  focused,
  onSelect,
  onDelivery,
}: {
  rows: Evaluated[]
  focused: Evaluated
  onSelect: (row: Evaluated) => void
  onDelivery: (row: Evaluated) => void
}) {
  const setSelected = onSelect
  const navigate = (_page: number, row: Evaluated) => onDelivery(row)
  return (
    <Panel
      title="Publication history"
      subtitle="Inspect revisions for a delivery interval; late publications are never used in decision-time evaluation."
      action={
        <SelectField
          value={focused.time}
          onChange={(v) => setSelected(rows.find((r) => r.time === v)!)}
          options={rows
            .slice(0, 48)
            .map((r) => ({ value: r.time, label: `${r.time} UTC` }))}
        />
      }
    >
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Publication time (UTC)</th>
              <th>Predicted generation</th>
              <th>Revision</th>
              <th>Decision-time status</th>
            </tr>
          </thead>
          <tbody>
            {focused.publications.map((p, i, all) => (
              <tr key={p.publishTime}>
                <td>
                  <Button
                    variant="subtle"
                    size="small"
                    className="history-publication"
                    onClick={() => navigate(1, focused)}
                  >
                    {formatTimestamp(p.publishTime, false)}{" "}
                    <ArrowRight size={12} />
                  </Button>
                </td>
                <td className="forecast-text">{num(p.value)} MW</td>
                <td>
                  {i
                    ? `${num(p.value - all[i - 1].value)} MW`
                    : "Initial publication"}
                </td>
                <td>
                  <span
                    className={
                      Date.parse(p.publishTime) > Date.parse(focused.cutoff)
                        ? "late-tag"
                        : "good-tag"
                    }
                  >
                    {Date.parse(p.publishTime) > Date.parse(focused.cutoff)
                      ? "After cutoff · excluded"
                      : Date.parse(all[i + 1]?.publishTime ?? "") <=
                          Date.parse(focused.cutoff)
                        ? "Available · superseded"
                        : "Selected for evaluation"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
