import { formatTimestamp } from "../../analysisFormatting"
import type { Evaluated } from "../../data"
import Definition from "../common/Definition"

export default function PublicationLabel({ row }: { row: Evaluated }) {
  const published = row.publicationTime ? Date.parse(row.publicationTime) : NaN
  const cutoff = Date.parse(row.cutoff)
  const eligible = Number.isFinite(published) && published <= cutoff
  const time = Number.isFinite(published)
    ? formatTimestamp(row.publicationTime)
    : null
  return (
    <div
      className={`publication-label ${
        eligible ? "publication-eligible" : "publication-unavailable"
      }`}
    >
      <span>{time ? `Published ${time}` : "No eligible publication"}</span>
      <span className="publication-status">
        <Definition
          term={
            !time
              ? "Unscored"
              : eligible
                ? published === cutoff
                  ? "At cutoff"
                  : "Before cutoff"
                : "After cutoff · excluded"
          }
          definition="Only the latest forecast published at or before the assumed D−1 cutoff is scored. Later revisions are never substituted."
        />
      </span>
    </div>
  )
}
