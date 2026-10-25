import { Button } from "@figma/astraui"
import type { RecordsState } from "../../hooks/useRecords"
export default function RecordPagination({
  records,
}: {
  records: RecordsState
}) {
  const { filtered, recordStart, recordPageSize, recordPage, setRecordPage } =
    records
  return (
    <div className="record-pagination">
      <span role="status">
        Showing {filtered.length ? recordStart + 1 : 0}–
        {Math.min(recordStart + recordPageSize, filtered.length)} of{" "}
        {filtered.length} records
      </span>
      <div className="pagination-actions">
        <Button
          variant="subtle"
          size="small"
          disabled={recordPage === 0}
          onClick={() => setRecordPage((p) => Math.max(0, p - 1))}
        >
          Previous
        </Button>
        <span>
          Page {recordPage + 1} of{" "}
          {Math.max(1, Math.ceil(filtered.length / recordPageSize))}
        </span>
        <Button
          variant="subtle"
          size="small"
          disabled={recordStart + recordPageSize >= filtered.length}
          onClick={() => setRecordPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
