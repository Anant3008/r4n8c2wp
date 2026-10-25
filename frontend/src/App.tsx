import { ThemeProvider } from "@figma/astraui"
import Workstation from "./app/Workstation"

export default function App() {
  return (
    <ThemeProvider>
      <Workstation />
    </ThemeProvider>
  )
}
