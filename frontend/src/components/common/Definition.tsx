import { useState, type ReactNode } from "react"

/** A term whose definition appears on hover or keyboard focus instead of on the page. */
export default function Definition({
  term,
  definition,
}: {
  term: ReactNode
  definition: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="definition-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span
        className="definition-term"
        tabIndex={0}
        title={definition}
        role="button"
        aria-label={typeof term === "string" ? `${term}: ${definition}` : definition}
      >
        {term}
        <span className="sr-only">. {definition}</span>
      </span>
      {visible && (
        <span className="definition-popup" role="tooltip">
          {definition}
        </span>
      )}
    </span>
  )
}
