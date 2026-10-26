import { pages } from "../../app/navigation"

export default function Topbar({
  page,
  dataSource = "fixture",
}: {
  page: number
  dataSource?: "api" | "fixture"
}) {
  const isLive = dataSource === "api"

  return (
    <header className="topbar">
      <div className="flex items-center gap-lg">
        <span className="muted">Workspace</span>
        <span className="faint">/</span>
        <span>{pages[page]}</span>
      </div>
      <div className="flex items-center gap-xl">
        <span className="text-video-title muted">All times in UTC</span>
        <span className="top-divider" />
        <span
          className="demo-pill"
          style={
            isLive
              ? {
                  background:
                    "color-mix(in srgb, var(--actual) 20%, var(--surface-bg))",
                }
              : undefined
          }
        >
          <span
            className="status-dot"
            style={isLive ? { background: "var(--actual)" } : undefined}
          />
          {isLive ? "Elexon BMRS Live Data" : "Synthetic demo data"}
        </span>
      </div>
    </header>
  )
}
