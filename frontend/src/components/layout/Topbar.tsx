import { pages } from "../../app/navigation"
export default function Topbar({ page }: { page: number }) {
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
        <span className="demo-pill">
          <span className="status-dot" />
          Synthetic demo data
        </span>
      </div>
    </header>
  )
}
