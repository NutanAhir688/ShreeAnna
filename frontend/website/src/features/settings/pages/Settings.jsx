import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CONFIGS } from "@/config/rolePermissions";
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Sun,
  Globe,
  ShieldCheck,
  Smartphone,
  Save,
  CheckCircle2,
  Lock,
  Eye,
  Sliders,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { user } = useAuth();
  const currentRole = user?.role || "FpoManager";
  const roleMeta = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.FpoManager;

  const [language, setLanguage] = useState("en"); // "en" | "gu" | "hi"
  const [themeMode, setThemeMode] = useState("light");
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [otpNotifications, setOtpNotifications] = useState(true);
  const [autoRefreshReports, setAutoRefreshReports] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Role permissions breakdown
  const getPermissionsList = () => {
    switch (currentRole) {
      case "Processor":
        return [
          { module: "Available Lots", read: true, write: true, desc: "Browse certified procurement lots and raise purchase requests" },
          { module: "Value Addition / Products", read: true, write: true, desc: "Create, publish, and edit millet products in marketplace" },
          { module: "Inventory & Warehouses", read: true, write: false, desc: "Inspect allocated stock in regional warehouses" },
          { module: "Reporting & Valuation", read: true, write: false, desc: "View procurement volumes, price realization, and sales reports" },
        ];
      case "FpoManager":
        return [
          { module: "Farmer Registration", read: true, write: true, desc: "Onboard millet farmers and approve farm verifications" },
          { module: "Procurement & QC", read: true, write: true, desc: "Record lots, review assaying results, and certify lots" },
          { module: "Warehouse Operations", read: true, write: true, desc: "Assign storage silos and generate lot barcode manifests" },
          { module: "Farmer Payouts / DBT", read: true, write: true, desc: "Trigger 100% direct bank transfers via Razorpay MockGateway" },
        ];
      case "QualityInspector":
        return [
          { module: "Lot Quality Verification", read: true, write: true, desc: "Inspect moisture, foreign matter, and assign Grade A/B" },
          { module: "Lab Certification", read: true, write: true, desc: "Sign digital quality certificates and QC manifests" },
          { module: "Procurement Oversight", read: true, write: false, desc: "View incoming farmer lots awaiting lab clearance" },
        ];
      case "WarehouseManager":
        return [
          { module: "Warehouse Silos", read: true, write: true, desc: "Manage capacity, storage aeration, and lot allocations" },
          { module: "Stock Movement", read: true, write: true, desc: "Log bag receipt, pest-safe handling, and transfer dispatches" },
          { module: "Inventory Audits", read: true, write: true, desc: "Generate physical stock audit summaries" },
        ];
      case "LogisticsCoordinator":
        return [
          { module: "Fleet Tracking", read: true, write: true, desc: "Assign drivers, vehicles, and real-time transit routes" },
          { module: "Delivery OTP Handshake", read: true, write: true, desc: "Verify secure delivery OTP codes and confirm handovers" },
          { module: "Shipment Exception Logs", read: true, write: true, desc: "Handle delivery reroutes and delay escalations" },
        ];
      case "Accountant":
        return [
          { module: "Financial Disbursements", read: true, write: true, desc: "Authorize farmer DBT payments and settlement vouchers" },
          { module: "FPO 5% Margin Audits", read: true, write: false, desc: "Reconcile statutory facilitation fee earnings" },
          { module: "Banking Ledgers", read: true, write: true, desc: "Export CSV bank reconciliation statements" },
        ];
      default:
        return [
          { module: "Marketplace & Products", read: true, write: false, desc: "Explore certified millet flours, cookies, and snacks" },
          { module: "Orders & Cart", read: true, write: true, desc: "Place delivery orders and track driver assignments" },
          { module: "Delivery OTP", read: true, write: true, desc: "Receive and share delivery OTP with fleet driver" },
        ];
    }
  };

  const permissions = getPermissionsList();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#142017] dark:text-white flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#1B4324] dark:text-emerald-400" />
            <span>Platform Settings & Preferences</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure system language, notifications, dispatch alerts, and view role access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge className={`${roleMeta.badgeColor} border text-xs font-bold px-3 py-1`}>
            {roleMeta.roleName}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Preferences & Notifications */}
        <div className="md:col-span-2 space-y-6">
          {/* General Preferences */}
          <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1B4324] dark:text-emerald-400" />
                <CardTitle className="text-base text-[#142017] dark:text-white">
                  Regional & Localization Preferences
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Language and regional units for Gujarat millet mission operations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Display Language
                  </Label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 outline-none focus:border-emerald-600"
                  >
                    <option value="en">English (Official Standard)</option>
                    <option value="gu">ગુજરાતી (Gujarati - State Language)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Currency & Number Format
                  </Label>
                  <select
                    disabled
                    value="inr"
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2.5 text-slate-500"
                  >
                    <option value="inr">₹ Indian Rupee (Lakhs / Crores - en-IN)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Automatic Live Data Polling
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Auto-refresh dashboard and dispatch status in background
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoRefreshReports}
                  onChange={(e) => setAutoRefreshReports(e.target.checked)}
                  className="w-4 h-4 accent-[#1B4324] cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications & Alert Settings */}
          <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1B4324] dark:text-emerald-400" />
                <CardTitle className="text-base text-[#142017] dark:text-white">
                  Notifications & Dispatch Triggers
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Configure when and how you receive alerts for lots, dispatches, and settlements
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    SMS Delivery & Driver OTP Alerts
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Immediate SMS dispatch when a driver arrives or handoff code is requested
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={otpNotifications}
                  onChange={(e) => setOtpNotifications(e.target.checked)}
                  className="w-4 h-4 accent-[#1B4324] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Procurement Lot & QC Certifications
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Notify when incoming millet lot passes Grade A lab inspection
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#1B4324] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    DBT Settlement & Financial Statements
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Send email notifications upon successful bank voucher generation
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#1B4324] cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {saveToast ? (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Settings saved successfully!
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Settings apply immediately to your active session.
                  </span>
                )}
                <Button
                  onClick={handleSaveSettings}
                  size="sm"
                  className="bg-[#1B4324] hover:bg-[#14341C] text-white text-xs cursor-pointer rounded-lg"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Role Capabilities & Access Matrix */}
        <div className="space-y-6">
          <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1B4324] dark:text-emerald-400" />
                <CardTitle className="text-sm font-bold text-[#142017] dark:text-white">
                  Active Role Privileges
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Authorized capabilities for {roleMeta.roleName}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {permissions.map((perm) => (
                <div
                  key={perm.module}
                  className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/60 border border-[#E3ECE0] dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {perm.module}
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[9px] px-1.5 py-0">
                        Read
                      </Badge>
                      {perm.write && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[9px] px-1.5 py-0">
                          Write
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{perm.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick System Info */}
          <Card className="border-[#E3ECE0] dark:border-slate-800 bg-[#FBFBFA] dark:bg-slate-800/40 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-400">
                System Build & Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Platform Version</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">v2.4.0 (Agri-Cloud)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">API Gateway</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">REST ASP.NET 9 Core</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">PostgreSQL (Supabase)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Server Health</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Healthy • 99.98%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
