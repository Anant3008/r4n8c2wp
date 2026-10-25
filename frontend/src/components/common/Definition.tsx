import { Tooltip } from "@figma/astraui"
import type { ReactNode } from "react"

/** A term whose definition appears on hover or keyboard focus instead of on the page. */
export default function Definition({ term, definition }: { term: ReactNode; definition: string }) {
  return (
    <Tooltip content={definition} position="top">
      <span className="definition-term" tabIndex={0}>
        {term}
        <span className="sr-only">. {definition}</span>
      </span>
    </Tooltip>
  )
}
