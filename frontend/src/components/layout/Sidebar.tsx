import { Button } from "@figma/astraui"
import { ArrowRight, HelpCircle, Zap } from "lucide-react"
import { icons, pages } from "../../app/navigation"
export default function Sidebar({
  page,
  navigate,
  setNotice,
}: {
  page: number
  navigate: (page: number) => void
  setNotice: (notice: string) => void
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Zap size={21} fill="currentColor" />
        </div>
        <span>
          WindSight<span className="brand-dot">.</span>
        </span>
      </div>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="nav">
        {pages.map((p, i) => {
          const Icon = icons[i]
          return (
            <Button
              key={p}
              variant="subtle"
              className={`nav-item ${page === i ? "active" : ""}`}
              iconStart={<Icon size={17} />}
              onClick={() => navigate(i)}
              aria-label={p}
              title={p}
              aria-current={page === i ? "page" : undefined}
            >
              <span className="nav-label">{p}</span>
            </Button>
          )
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="source-box">
          <div className="flex items-center gap-md">
            <span className="status-dot" />
            <span className="text-label-sm">Backend not connected</span>
          </div>
          <div className="text-video-title muted mt-lg">
            Elexon BMRS schema
            <br />
            WINDFOR + FUELHH
          </div>
          <div className="source-line" />
          <div className="text-video-title muted">Analysis period</div>
          <div className="text-video-title mt-xs">01–31 January 2026</div>
        </div>
        <Button
          variant="subtle"
          className="help-button"
          iconStart={<HelpCircle size={17} />}
          onClick={() =>
            setNotice(
              "Error = forecast − actual. Forecast selection uses the latest publication at or before the configured day-ahead UTC cutoff. All displayed data is synthetic.",
            )
          }
        >
          Methodology & help <ArrowRight size={14} />
        </Button>
      </div>
    </aside>
  )
}
