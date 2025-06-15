import "../styles/index.css"
import { BrowserRouter } from "react-router-dom"
import RoutesIndex from "./routes"
import { CallProvider } from "./context/CallContext"

function App() {
  return (
    <BrowserRouter>
      <CallProvider>
        <RoutesIndex />
      </CallProvider>
    </BrowserRouter>
  )
}
export default App
