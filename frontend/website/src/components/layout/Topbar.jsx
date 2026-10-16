import { Bell, ChevronDown, Search, LogOut, User as UserIcon, RefreshCw, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ROLE_CONFIGS } from "@/config/rolePermissions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const { user, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const userRole = user?.role || "FpoManager";
  const roleConfig = ROLE_CONFIGS[userRole] || ROLE_CONFIGS.FpoManager;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "SA";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-background/95 backdrop-blur-xs shadow-2xs transition-colors">
      <div className="flex h-full items-center justify-between px-6">

        {/* Left side: Active Page & Role indicator */}
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">
              {roleConfig.portalTitle}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Role: <span className="font-semibold text-slate-800 dark:text-slate-200">{roleConfig.roleName}</span>
            </p>
          </div>
        </div>

        {/* Right side: Role Switcher, Search, Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center gap-3">

          {/* Quick Role Switcher Dropdown in Topbar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer">
                <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
                <span>Switch Role</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-slate-500 uppercase font-bold">
                Preview As Role
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => switchRole(key, config.roleName)}
                  className={`text-xs flex items-center justify-between cursor-pointer ${userRole === key ? "font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" : ""}`}
                >
                  <span>{config.roleName}</span>
                  {userRole === key && <span className="h-2 w-2 rounded-full bg-emerald-600" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative hidden w-56 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search platform..."
              className="pl-9 text-xs"
            />
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="h-9 w-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 fill-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
            )}
            <span className="sr-only">Toggle Dark / Light Theme</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative cursor-pointer">
            <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </Button>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                    {getInitials(user?.memberName || user?.email)}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden text-left md:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user?.memberName || "User"}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight">
                    {roleConfig.roleName}
                  </p>
                </div>

                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{user?.memberName || "User"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                {theme === "dark" ? <Sun className="mr-2 h-4 w-4 text-amber-400" /> : <Moon className="mr-2 h-4 w-4 text-slate-600" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}

export default Topbar;