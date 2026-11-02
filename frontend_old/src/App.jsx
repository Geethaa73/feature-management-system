import { Routes, Route } from "react-router-dom";

function MainLayout() {
  return (
    <div>
      <h1>Main Layout</h1>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/dashboard" element={<MainLayout />} />
    </Routes>
  );
}