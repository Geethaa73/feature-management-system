import { useState } from "react";
import { Outlet } from "react-router-dom";
import { MdMenu } from "react-icons/md";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">

      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="main-content">

        <div className="mobile-header">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <MdMenu />
          </button>

          <div className="mobile-header-brand">
            <img
              src="/favicon.svg"
              alt="FeatureOps"
            />

            <span>FeatureOps</span>
          </div>
        </div>

        <Navbar 
  onMenuClick={() =>
    setMobileOpen(true)
  }
/>

        <div className="page-content">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default MainLayout;