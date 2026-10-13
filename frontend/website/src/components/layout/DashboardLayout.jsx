import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sidebar */}
      <Sidebar />


      {/* Main area */}
      <div className="pl-64">
        
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="p-6 bg-slate-50/50 dark:bg-slate-950/80 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;