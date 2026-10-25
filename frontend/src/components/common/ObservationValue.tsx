import { num } from "../../data"

export default function ObservationValue({
  value,
  kind = "actual",
  signed = false,
}: {
  value: number | null | undefined
  kind?: "forecast" | "actual" | "error"
  signed?: boolean
}) {
  if (value == null || !Number.isFinite(value)) {
    const label =
      kind === "forecast"
        ? "Unavailable"
        : kind === "error"
          ? "Unscored"
          : "Missing"
    const explanation =
      kind === "forecast"
        ? "No forecast was published by the decision cutoff."
        : kind === "error"
          ? "Scoring requires both an eligible forecast and an actual observation."
          : "Actual generation was not observed. Missing is not zero."
    return (
      <span
        className="missing-observation"
        title={explanation}
        aria-label={`${label}. ${explanation}`}
      >
        {label}
      </span>
    )
  }
  return (
    <span className="numeric-value">
      {signed && value > 0 ? "+" : ""}
      {num(value)}
    </span>
  )
}
