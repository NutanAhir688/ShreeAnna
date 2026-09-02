import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardCheck,
  FileText,
  Truck,
  Warehouse,
  Factory,
  ShoppingCart,
  Wallet,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">

        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <div>
            <h1 className="text-xl font-bold">
              ShreeAnna
            </h1>

            <p className="text-xs text-muted-foreground">
              FPO Portal
            </p>
          </div>
        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">

          {/* Dashboard */}
          <NavItem
            to="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
          />


          {/* Operations */}
          <NavSection title="Operations">

            <NavItem
              to="/farmers"
              icon={Users}
              label="Farmers"
            />

            <NavItem
              to="/procurement/lots"
              icon={Package}
              label="Procurement Lots"
            />

            <NavItem
              to="/inspections"
              icon={ClipboardCheck}
              label="Quality Inspections"
            />

            <NavItem
              to="/agreements"
              icon={FileText}
              label="Agreements"
            />

            <NavItem
              to="/logistics"
              icon={Truck}
              label="Logistics"
            />

            <NavItem
              to="/warehouse"
              icon={Warehouse}
              label="Warehouse"
            />

            <NavItem
              to="/processing"
              icon={Factory}
              label="Processing"
            />

          </NavSection>


          {/* Business */}
          <NavSection title="Business">

            <NavItem
              to="/marketplace"
              icon={ShoppingCart}
              label="Marketplace"
            />

            <NavItem
              to="/finance"
              icon={Wallet}
              label="Finance"
            />

            <NavItem
              to="/reports"
              icon={BarChart3}
              label="Reports"
            />

          </NavSection>

        </nav>


        {/* Bottom navigation */}
        <div className="border-t p-4">

          <NavItem
            to="/settings"
            icon={Settings}
            label="Settings"
          />

          <NavItem
            to="/support"
            icon={HelpCircle}
            label="Support"
          />

        </div>

      </div>
    </aside>
  );
}


function NavSection({ title, children }) {
  return (
    <div className="mt-6">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>

      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}


function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        flex items-center gap-3 rounded-lg px-3 py-2.5
        text-sm font-medium transition-colors
        ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }
        `
      }
    >
      <Icon className="h-4 w-4 shrink-0" />

      <span>{label}</span>
    </NavLink>
  );
}

export default Sidebar;