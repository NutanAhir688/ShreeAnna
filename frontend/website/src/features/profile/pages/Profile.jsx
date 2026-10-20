import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CONFIGS } from "@/config/rolePermissions";
import {
  User,
  Mail,
  Shield,
  Building,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Lock,
  Key,
  Award,
  Sparkles,
  Smartphone,
  Truck,
  Warehouse,
  FileCheck,
  Briefcase,
  Layers,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const { user } = useAuth();
  const currentRole = user?.role || "FpoManager";
  const roleMeta = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.FpoManager;

  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [altEmail, setAltEmail] = useState("");
  const [district, setDistrict] = useState("Dahod / Anand, Gujarat");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveContact = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Role-specific metadata & badge mapping
  const getRoleDetails = () => {
    switch (currentRole) {
      case "Processor":
        return {
          icon: Briefcase,
          unitName: "Gujarat Millet Processing & Flour Works",
          license: "FSSAI-GUJ-2026-88192",
          capacity: "2,500 MT / Month",
          specialization: "Ragi Cookies, Pearl Millet Flour, Ready-to-Eat Mixes",
          location: "GIDC Industrial Estate, Anand, Gujarat",
          fpoAffiliation: "Gramin Vikas Millet FPO Federation",
        };
      case "FpoManager":
        return {
          icon: Building,
          unitName: "Dahod District Millet Farmers Producer Co. Ltd.",
          license: "FPO-REG-GUJ-2024-4109",
          capacity: "450+ Active Millet Cultivators",
          specialization: "Procurement, QC Facilitation, DBT Farmer Payouts",
          location: "Station Road, Dahod, Gujarat",
          fpoAffiliation: "NABARD & Gujarat State Millet Mission",
        };
      case "QualityInspector":
        return {
          icon: Award,
          unitName: "State Quality Assurance Lab & Mobile Testing Wing",
          license: "NABL-AGRI-INSP-9923",
          capacity: "Grade A / B Moisture & Purity Certification",
          specialization: "Assaying, Grain Purity, Aflatoxin & Sieve Analysis",
          location: "Central QC Hub, Gandhinagar, Gujarat",
          fpoAffiliation: "Directorate of Agriculture, Gujarat",
        };
      case "WarehouseManager":
        return {
          icon: Warehouse,
          unitName: "Central Rural Grain Silos & Warehouses",
          license: "WDRA-GUJ-WH-008",
          capacity: "15,000 MT Aerated Storage",
          specialization: "Lot Allocation, Pest-Safe Bagging & Moisture Logs",
          location: "Vallabh Vidyanagar, Karamsad, Anand",
          fpoAffiliation: "Gujarat State Warehousing Corporation",
        };
      case "LogisticsCoordinator":
        return {
          icon: Truck,
          unitName: "State Inter-District Agrilogistics Division",
          license: "LOG-FLEET-GJ-5510",
          capacity: "42 GPS-Tracked Agri Fleet Vehicles",
          specialization: "Route Optimization, Driver Dispatch, OTP Delivery Handshake",
          location: "Logistics Hub, Mehsana, Gujarat",
          fpoAffiliation: "ShreeAnna Logistics & Transport Network",
        };
      case "Accountant":
        return {
          icon: Shield,
          unitName: "FPO Financial Reconciliation & DBT Clearance Desk",
          license: "FIN-AUDIT-2026-771",
          capacity: "100% On-Time Direct Beneficiary Transfer",
          specialization: "Settlement Payouts, Razorpay MockGateway, Bank Vouchers",
          location: "District Nodal Accounts Cell, Dahod",
          fpoAffiliation: "State Cooperative Banking Federation",
        };
      case "Farmer":
        return {
          icon: Award,
          unitName: "Panchmahal Organic Millet Cultivators",
          license: "KISAN-ID-GJ-8849-2026",
          capacity: "4.5 Hectares Registered Land",
          specialization: "Finger Millet (Ragi), Foxtail & Pearl Millet (Bajra)",
          location: "Devgadh Baria, Dahod District",
          fpoAffiliation: "Dahod Millet FPO",
        };
      case "Driver":
        return {
          icon: Truck,
          unitName: "Express Millet Logistics Fleet",
          license: "GJ-01-DL-20210049281",
          capacity: "3.5 MT Insulated Medium Commercial Truck",
          specialization: "Farm-to-Warehouse & Processor-to-Store Dispatches",
          location: "Ahmedabad - Anand Expressway Corridor",
          fpoAffiliation: "ShreeAnna Fleet Logistics",
        };
      default:
        return {
          icon: Building,
          unitName: "ShreeAnna Millet Community Member",
          license: "COMMUNITY-REG-2026",
          capacity: "Verified Member Account",
          specialization: "Value Chain & Marketplace Operations",
          location: "Gujarat, India",
          fpoAffiliation: "National Millet Value Chain Platform",
        };
    }
  };

  const details = getRoleDetails();
  const RoleIcon = details.icon;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Profile Header Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#14341C] via-[#1B4324] to-[#266838] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black shadow-inner shrink-0">
              {user?.memberName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {user?.memberName || user?.email?.split("@")[0] || "User"}
                </h1>
                <Badge className={`${roleMeta.badgeColor} border text-xs font-bold px-2.5 py-0.5`}>
                  {roleMeta.roleName}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-mono mt-1">
                {user?.email || "user@shreeanna.com"}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#86D49B]" />
                <span>Verified Official Portal Account • Gujarat Millet Mission</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-black/20 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 text-xs">
            <MapPin className="w-4 h-4 text-[#86D49B] shrink-0" />
            <span className="text-emerald-100 font-medium">{district}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Account Details & Role Specifics */}
        <div className="md:col-span-2 space-y-6">
          {/* Role Verification & Credentials Card */}
          <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#EFF5EB] dark:bg-emerald-950/60 text-[#1B4324] dark:text-emerald-400">
                    <RoleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-[#142017] dark:text-white">
                      Role Verification & Operational Unit
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Official credentials authorized for {roleMeta.roleName}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-emerald-300 text-emerald-700 bg-emerald-50">
                  Active Credential
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/50 border border-[#E3ECE0] dark:border-slate-700">
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                  Assigned Unit / Organization
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {details.unitName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/50 border border-[#E3ECE0] dark:border-slate-700">
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                  Registration / Accreditation No.
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {details.license}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/50 border border-[#E3ECE0] dark:border-slate-700">
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                  Operational Scope & Capacity
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                  {details.capacity}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/50 border border-[#E3ECE0] dark:border-slate-700">
                <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                  District & State Nodal Office
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                  {details.location}
                </span>
              </div>

              <div className="sm:col-span-2 p-3 rounded-xl bg-[#EFF5EB] dark:bg-emerald-950/40 border border-[#D6E6D0] dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4324] dark:text-emerald-400">
                    Federation / Mission Affiliation
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-emerald-100 text-xs mt-0.5">
                    {details.fpoAffiliation}
                  </p>
                </div>
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          {/* Contact & Personal Information Form */}
          <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <CardTitle className="text-base text-[#142017] dark:text-white">
                Contact & Communication Details
              </CardTitle>
              <CardDescription className="text-xs">
                Update your registered contact phone and operational communications
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleSaveContact} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Primary Email (Login Account)
                    </Label>
                    <Input
                      disabled
                      value={user?.email || "user@shreeanna.com"}
                      className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Official Contact Phone
                    </Label>
                    <Input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Alternate / Notification Email
                    </Label>
                    <Input
                      type="email"
                      value={altEmail}
                      onChange={(e) => setAltEmail(e.target.value)}
                      placeholder="alerts@fpo-gujarat.org"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Operating District / Region
                    </Label>
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Dahod, Gujarat"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {savedSuccess ? (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Profile details saved successfully!
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Changes will be reflected across OTP dispatches and report exports.
                    </span>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#1B4324] hover:bg-[#14341C] text-white text-xs cursor-pointer rounded-lg"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & Quick Info */}
        <div className="space-y-6">
          {/* Account Security */}
          <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#1B4324] dark:text-emerald-400" />
                <CardTitle className="text-sm font-bold text-[#142017] dark:text-white">
                  Security & Authentication
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Two-Factor Authentication</p>
                  <p className="text-[11px] text-slate-400">SMS OTP for deliveries & payouts</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                  Enabled
                </Badge>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Active Token Session</p>
                  <p className="text-[11px] text-slate-400">JWT In-Memory + HttpOnly Refresh</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-slate-600">
                  Secure
                </Badge>
              </div>

              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => alert("Password reset link dispatched to your registered email.")}
                >
                  <Key className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Role Overview */}
          <Card className="border-[#E3ECE0] dark:border-slate-800 bg-[#FBFBFA] dark:bg-slate-800/40 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Platform Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Portal Mode</span>
                <span className="font-bold text-[#1B4324] dark:text-emerald-400">{roleMeta.portalTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Account Type</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{roleMeta.roleName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Session Authority</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">Level 3 (Certified)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Value Chain Node</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Verified Node</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
