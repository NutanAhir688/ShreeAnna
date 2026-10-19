import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CONFIGS, COMMON_SYSTEM_SECTION } from "@/config/rolePermissions";
import { farmsApi } from "@/services/api";
import { ChevronDown, Shield } from "lucide-react";

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const userRole = user?.role || "FpoManager";
  const roleConfig = ROLE_CONFIGS[userRole] || ROLE_CONFIGS.FpoManager;
  const [pendingFarmCount, setPendingFarmCount] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPendingCount() {
      try {
        const farms = await farmsApi.getAll();
        if (isMounted && Array.isArray(farms)) {
          const count = farms.filter(
            (f) => f.status === "Pending Verification" || f.status === "Pending"
          ).length;
          setPendingFarmCount(count);
        }
      } catch (_) {
        // Silently handle authorization or network errors
      }
    }

    if (user) {
      loadPendingCount();
    }
    return () => {
      isMounted = false;
    };
  }, [user, location.pathname]);


  const sectionsToRender = [
    ...roleConfig.sections.filter((section) => {
      const title = section.title?.trim().toUpperCase();

      if (userRole === "FpoManager") {
        const hiddenSections = [
          "QUALITY MANAGEMENT",
          "LOGISTICS OPERATIONS",
          "BUSINESS",
          "MANAGEMENT",
        ];

        return !hiddenSections.includes(title);
      }

      if (userRole === "QualityInspector") {
        return title !== "REFERENCE";
      }

      return true;
    }),
    COMMON_SYSTEM_SECTION,
  ];



  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-colors">
      <div className="flex h-full flex-col">

        {/* Brand Header */}
        <div className="flex h-16 items-center border-b border-slate-800 px-6 justify-between bg-slate-900 text-white">
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
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
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

                  const dynamicBadge =
                    item.to === "/farm-verification"
                      ? (pendingFarmCount !== null ? (pendingFarmCount > 0 ? pendingFarmCount : null) : item.badgeCount)
                      : item.badgeCount;

                  return (
                    <NavItem
                      key={`${item.to}-${item.label}-${itemIdx}`}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      badgeCount={dynamicBadge}
                      end={item.end}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom User Info */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
              {user?.memberName || user?.email || "User"}
            </span>
          </div>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-200 font-medium shrink-0">
            {roleConfig.roleName}
          </span>
        </div>

      </div>
    </aside>
  );
}

function DropdownNavItem({ label, icon: Icon, items }) {
  const location = useLocation();
  const isChildActive = items.some((item) => {
    const [targetPath] = item.to.split("?");
    return location.pathname === targetPath || (targetPath !== "/inventory" && location.pathname.startsWith(targetPath + "/"));
  });

  const [open, setOpen] = useState(isChildActive);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
      >
        <Icon className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
        <span className="flex-1">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-1 border-t border-slate-200 dark:border-slate-700 px-2 pb-2 pt-1">
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

  const knownSubRoutes = [
    "/warehouses/lots",
    "/warehouses/receiving",
    "/inventory/movements",
  ];

  let isActive = false;

  if (targetSearch) {
    const targetParams = new URLSearchParams(targetSearch);
    const currentParams = new URLSearchParams(location.search);
    const matchesPath =
      location.pathname === targetPath ||
      (targetPath === "/dispatches" && location.pathname === "/logistics") ||
      (targetPath === "/logistics" && location.pathname === "/dispatches");

    const targetTab = targetParams.get("tab");
    if (targetTab) {
      const currentTab = currentParams.get("tab") || "assigned";
      isActive = matchesPath && currentTab === targetTab;
    } else {
      let allMatch = true;
      for (const [k, v] of targetParams.entries()) {
        const curVal = currentParams.get(k) || "";
        if (
          curVal.replace(/_/g, " ").toLowerCase() !==
          v.replace(/_/g, " ").toLowerCase()
        ) {
          allMatch = false;
          break;
        }
      }
      isActive = matchesPath && allMatch;
    }
  } else {
    const matchesExactPath =
      location.pathname === targetPath ||
      (targetPath === "/dispatches" && location.pathname === "/logistics") ||
      (targetPath === "/logistics" && location.pathname === "/dispatches");

    const matchesSubPath =
      targetPath !== "/" &&
      location.pathname.startsWith(targetPath + "/") &&
      !knownSubRoutes.includes(location.pathname);

    const matchesPath = matchesExactPath || (!end && matchesSubPath);

    if (matchesPath) {
      if (location.search && !targetSearch) {
        isActive = false;
      } else {
        isActive = true;
      }
    }
  }

  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 rounded-lg px-3 py-2
        text-xs font-semibold transition-all
        ${isActive
          ? "bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs font-bold"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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
    </Link>
  );
}

export default Sidebar;