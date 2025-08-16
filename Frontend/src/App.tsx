import { BrowserRouter, Routes, Route } from "react-router-dom";
import SeatsPage from "./pages/SeatsPage";
import ReservePage from "./pages/ReservePage";
import LookupPage from "./pages/LookupPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SeatsPage />} />
        <Route path="/reserve" element={<ReservePage />} />
        <Route path="/lookup" element={<LookupPage />} />
      </Routes>
    </BrowserRouter>
  );
}