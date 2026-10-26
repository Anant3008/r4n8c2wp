import AnalysisFilters from "../components/layout/AnalysisFilters"
import CutoffNote from "../components/layout/CutoffNote"
import PageFooter from "../components/layout/PageFooter"
import PageHeader from "../components/layout/PageHeader"
import Sidebar from "../components/layout/Sidebar"
import Topbar from "../components/layout/Topbar"
import WorkspaceMessages from "../components/layout/WorkspaceMessages"
import useWorkstation from "../hooks/useWorkstation"
import PageContent from "./PageContent"

export default function Workstation() {
  const m = useWorkstation()
  return (
    <div className={`workstation ${m.page === 0 ? "overview-mode" : ""}`}>
      <Sidebar page={m.page} navigate={m.navigate} setNotice={m.setNotice} />
      <div className="main-shell">
        <Topbar page={m.page} dataSource={m.dataSource} />
        <main>
          <PageHeader
            page={m.page}
            headingRef={m.heading}
            copyAnalysisLink={m.copyAnalysisLink}
            download={m.download}
          />
          <AnalysisFilters
            date={m.date}
            cutoff={m.cutoff}
            setDate={m.setDate}
            setCutoff={m.setCutoff}
            changeDay={m.changeDay}
            backToMonth={m.backToMonth}
          />
          <CutoffNote page={m.page} cutoff={m.cutoff} />
          <WorkspaceMessages
            notice={m.notice}
            onDismiss={() => m.setNotice("")}
            shareLink={m.shareLink}
            onShareClose={() => m.setShareLink("")}
            missingInterval={Boolean(
              m.analysis.interval && !m.currentSelection,
            )}
            onMonth={m.backToMonth}
          />
          <PageContent model={m} />
          <PageFooter />
        </main>
      </div>
    </div>
  )
}
