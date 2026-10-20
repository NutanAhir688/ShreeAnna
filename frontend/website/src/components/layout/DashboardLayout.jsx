import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sidebar (Desktop persistent + Mobile sheet) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main area */}
      <div className="lg:pl-64 pl-0 transition-[padding] duration-200">
        
        {/* Topbar with mobile menu trigger */}
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Page content */}
        <main className="p-3 sm:p-5 lg:p-6 bg-slate-50/50 dark:bg-slate-950/80 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;