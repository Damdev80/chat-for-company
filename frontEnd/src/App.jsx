import "../styles/index.css"
import { BrowserRouter } from "react-router-dom"
import RoutesIndex from "./routes"

function App() {
  return (
    <BrowserRouter>
      <RoutesIndex />
    </BrowserRouter>
  )
}
export default App
