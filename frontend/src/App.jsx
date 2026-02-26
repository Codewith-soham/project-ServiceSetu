import { Routes, Route } from "react-router-dom";
import Landing from "./pages/landingPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </div>
  );
}