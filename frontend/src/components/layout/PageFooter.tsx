import { Zap } from "lucide-react"
export default function PageFooter() {
  return (
    <footer className="page-footer">
      <span>
        <Zap size={12} /> WindSight{" "}
        <span className="muted">/ UK wind intelligence</span>
      </span>
      <span className="muted">
        WINDFOR · FUELHH <span className="footer-dot">·</span> Demo data — not
        for trading decisions
      </span>
    </footer>
  )
}
