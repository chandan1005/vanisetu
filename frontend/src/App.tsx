import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Consultation from "./pages/Consultation";
import TeachBack from "./pages/TeachBack";
import Summary from "./pages/Summary";
import History from "./pages/History";
import Details from "./pages/Details";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/consult" element={<Consultation />} />
        <Route path="/teachback" element={<TeachBack />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:id" element={<Details />} />
      </Routes>
    </BrowserRouter>
  );
}
