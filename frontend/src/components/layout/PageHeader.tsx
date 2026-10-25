import { Button } from "@figma/astraui"
import { Download, Link } from "lucide-react"
import type { RefObject } from "react"
import { descriptions, pages } from "../../app/navigation"
export default function PageHeader({
  page,
  headingRef,
  copyAnalysisLink,
  download,
}: {
  page: number
  headingRef: RefObject<HTMLDivElement | null>
  copyAnalysisLink: () => void
  download: () => void
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          UK WIND INTELLIGENCE / PROCUREMENT ANALYTICS
        </div>
        <div
          ref={headingRef}
          tabIndex={-1}
          role="heading"
          aria-level={1}
          className="page-title"
        >
          {pages[page]}
        </div>
        <div className="muted text-label-sm mt-xs">{descriptions[page]}</div>
      </div>
      <div className="page-actions">
        <Button
          variant="subtle"
          size="small"
          iconStart={<Link size={15} />}
          onClick={copyAnalysisLink}
        >
          Copy link
        </Button>
        <Button
          variant="neutral"
          size="small"
          iconStart={<Download size={15} />}
          onClick={download}
        >
          Export data
        </Button>
      </div>
    </div>
  )
}
