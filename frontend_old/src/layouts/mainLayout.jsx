import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Main Layout</h2>
      <Outlet />
    </div>
  );
}

export default MainLayout;