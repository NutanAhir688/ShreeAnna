import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Sidebar */}
      <Sidebar />


      {/* Main area */}
      <div className="pl-64">
        
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;