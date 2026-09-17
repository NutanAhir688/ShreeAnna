import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CONFIGS, COMMON_SYSTEM_SECTION } from "@/config/rolePermissions";
import { ChevronDown, Shield } from "lucide-react";

function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role || "FpoManager";
  const roleConfig = ROLE_CONFIGS[userRole] || ROLE_CONFIGS.FpoManager;

  const sectionsToRender = [...roleConfig.sections, COMMON_SYSTEM_SECTION];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card shadow-xs">
      <div className="flex h-full flex-col">

        {/* Brand Header */}
        <div className="flex h-16 items-center border-b px-6 justify-between bg-slate-900 text-white">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-400">
              ShreeAnna
            </h1>
            <p className="text-xs font-semibold text-slate-300">
              {roleConfig.portalTitle}
            </p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleConfig.badgeColor || "bg-emerald-100 text-emerald-800"}`}>
            {roleConfig.roleName.split(" ")[0]}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          {sectionsToRender.map((section, idx) => (
            <div key={section.title || `sec-${idx}`}>
              {section.title && (
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  if (item.type === "dropdown") {
                    return (
                      <DropdownNavItem
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                        items={item.items}
                      />
                    );
                  }

                  return (
                    <NavItem
                      key={`${item.to}-${item.label}-${itemIdx}`}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      badgeCount={item.badgeCount}
                      end={item.end}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom User Info */}
        <div className="border-t p-3 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-700 truncate">
              {user?.memberName || user?.email || "User"}
            </span>
          </div>
          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-medium shrink-0">
            {roleConfig.roleName}
          </span>
        </div>

      </div>
    </aside>
  );
}

function DropdownNavItem({ label, icon: Icon, items }) {
  const location = useLocation();
  const isChildActive = items.some((item) =>
    location.pathname === item.to || (item.to !== "/inventory" && location.pathname.startsWith(item.to))
  );

  const [open, setOpen] = useState(isChildActive);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
        <span className="flex-1">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-1 border-t border-slate-200 px-2 pb-2 pt-1">
          {items.map((subItem) => (
            <NavItem
              key={subItem.to + subItem.label}
              to={subItem.to}
              icon={subItem.icon}
              label={subItem.label}
              end={subItem.end}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavItem({ to, icon: Icon, label, badgeCount, end = false }) {
  const location = useLocation();

  const [targetPath, targetSearch] = to.split("?");

  let isActive = false;
  if (targetSearch) {
    const targetParams = new URLSearchParams(targetSearch);
    const currentParams = new URLSearchParams(location.search);

    const matchesPath = location.pathname === targetPath;
    const targetTab = targetParams.get("tab");
    const currentTab = currentParams.get("tab") || "assigned";

    if (targetTab) {
      isActive = matchesPath && currentTab === targetTab;
    } else {
      isActive = matchesPath && location.search === `?${targetSearch}`;
    }
  } else {
    if (end) {
      isActive = location.pathname === targetPath && !location.search;
    } else {
      isActive =
        location.pathname === targetPath ||
        (targetPath !== "/" && location.pathname.startsWith(targetPath + "/"));
    }
  }

  return (
    <NavLink
      to={to}
      className={`
        flex items-center gap-3 rounded-lg px-3 py-2
        text-xs font-semibold transition-all
        ${isActive
          ? "bg-slate-900 text-white shadow-xs"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }
      `}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>

      {badgeCount !== undefined && badgeCount !== null && (
        <span className="flex h-4 min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
          {badgeCount}
        </span>
      )}
    </NavLink>
  );
}

export default Sidebar;