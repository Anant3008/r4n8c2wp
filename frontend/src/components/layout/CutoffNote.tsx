import { Info, ShieldCheck } from "lucide-react"
export default function CutoffNote({
  page,
  cutoff,
}: {
  page: number
  cutoff: string
}) {
  return (
    <div className="cutoff-note">
      <ShieldCheck size={15} />
      <span>
        {page === 0
          ? "Decision-time forecasts only"
          : "Eligible decision-time forecasts only"}
      </span>
      <span className="muted">
        {page === 0
          ? "Later revisions excluded"
          : `Assumed ${cutoff} UTC on the previous day. Later revisions excluded. Missing eligible forecast = unscored.`}
      </span>
      <Info size={14} />
    </div>
  )
}
