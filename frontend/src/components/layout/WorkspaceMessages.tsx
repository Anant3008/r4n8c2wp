import { Button, InputField } from "@figma/astraui"
import { Info, X } from "lucide-react"

type Props = {
  notice: string
  onDismiss: () => void
  shareLink: string
  onShareClose: () => void
  missingInterval: boolean
  onMonth: () => void
}

export default function WorkspaceMessages({
  notice,
  onDismiss,
  shareLink,
  onShareClose,
  missingInterval,
  onMonth,
}: Props) {
  return (
    <>
      {notice && (
        <div className="notice" role="status">
          <Info size={16} />
          <span>{notice}</span>
          <Button
            variant="subtle"
            size="small"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X size={14} />
          </Button>
        </div>
      )}
      {shareLink && (
        <div className="share-link-field">
          <InputField
            aria-label="Shareable analysis link"
            value={shareLink}
            readOnly
            onFocus={(event) => event.target.select()}
          />
          <Button variant="subtle" size="small" onClick={onShareClose}>
            Close
          </Button>
        </div>
      )}
      {missingInterval && (
        <div className="notice" role="status">
          The selected delivery interval has no records in this dataset. Choose
          another interval or return to the monthly view.
          <Button variant="subtle" size="small" onClick={onMonth}>
            Back to January
          </Button>
        </div>
      )}
    </>
  )
}
