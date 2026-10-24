import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Sprout,
  KeyRound,
  Mail,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Store,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const intent = searchParams.get("intent");

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState(() => (intent === "buy" ? "customer@shreeanna.com" : "fpo@shreeanna.com"));
  const [password, setPassword] = useState("Password123!");
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDestination = (loggedInUser) => {
    if (redirectUrl) {
      if (intent === "buy" && !redirectUrl.includes("intent=buy")) {
        const separator = redirectUrl.includes("?") ? "&" : "?";
        return `${redirectUrl}${separator}intent=buy`;
      }
      return redirectUrl;
    }
    if (loggedInUser?.role === "Customer") {
      return "/store";
    }
    return "/dashboard";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      navigate(getDestination(user));
    } catch (err) {
      setError(err.message || "Failed to login. Check backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Self-registration strictly provisions Customer role only
      const user = await register(regEmail.trim(), regPassword, fullName.trim());
      navigate(getDestination(user));
    } catch (err) {
      setError(err.message || "Failed to create account. Email may already be in use.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (roleKey, defaultEmail) => {
    setError("");
    setEmail(defaultEmail);
    setPassword("Password123!");
    setIsSubmitting(true);

    try {
      const user = await login(defaultEmail, "Password123!");
      navigate(getDestination(user));
    } catch (err) {
      setError(err.message || "Login failed. Please check backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetAccounts = [
    {
      roleKey: "FpoManager",
      email: "fpo@shreeanna.com",
      label: "FPO Manager",
      desc: "Full operations, audit & settlements",
    },
    {
      roleKey: "Customer",
      email: "customer@shreeanna.com",
      label: "Customer / Retail Buyer",
      isCustomer: true,
      desc: "Marketplace, cart, OTP deliveries",
    },
    {
      roleKey: "ProcurementOfficer",
      email: "procurement@shreeanna.com",
      label: "Procurement Officer",
      desc: "Lot intake & agreement execution",
    },
    {
      roleKey: "QualityInspector",
      email: "quality@shreeanna.com",
      label: "Quality Inspector",
      desc: "Grading, lab tests & certificates",
    },
    {
      roleKey: "WarehouseManager",
      email: "warehouse@shreeanna.com",
      label: "Warehouse Manager",
      desc: "Receiving, stacking & lot dispatch",
    },
    {
      roleKey: "LogisticsCoordinator",
      email: "logistics@shreeanna.com",
      label: "Logistics Coordinator",
      desc: "Fleet, dispatches & route tracking",
    },
    {
      roleKey: "Accountant",
      email: "accountant@shreeanna.com",
      label: "Accountant",
      desc: "Farmer payouts & invoices",
    },
    {
      roleKey: "Processor",
      email: "processor@shreeanna.com",
      label: "Processor (SHG / Buyer)",
      desc: "Finished foods & retail listings",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#090d16] text-[#142017] dark:text-slate-100 font-sans selection:bg-[#25633A] selection:text-white flex flex-col justify-between relative overflow-x-hidden antialiased py-8 px-4 sm:px-6 lg:px-8">
      {/* Soft Ambient Organic Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#86D49B]/15 dark:bg-[#86D49B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#266838]/10 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Brand Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10 pb-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#1B4324] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-[#86D49B]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#142017] dark:text-slate-100">
              Shree<span className="text-[#266838] dark:text-emerald-400">Anna</span>
            </span>
            <p className="text-[10px] text-[#617064] dark:text-slate-400 font-medium tracking-wide">
              Pure Millets. Better Lives.
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="h-8 w-8 rounded-full border-[#D5E4D1] dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-[#EFF5EB] dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 fill-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
            <span className="sr-only">Toggle Dark / Light Theme</span>
          </Button>

          <Link
            to="/store"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFF5EB] dark:bg-slate-800/80 hover:bg-[#E3EDE0] dark:hover:bg-slate-800 text-[#1B4324] dark:text-emerald-400 text-xs font-semibold border border-[#D5E4D1] dark:border-slate-700 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-[#266838] dark:text-emerald-400" />
            <span>Customer Marketplace</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#56655A] dark:text-slate-400 hover:text-[#1B4324] dark:hover:text-emerald-400 px-3 py-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-xl mx-auto w-full z-10 my-auto">
        <div className="bg-white dark:bg-slate-900 border border-[#E7ECE4] dark:border-slate-800 rounded-3xl p-6 sm:p-9 shadow-[0_20px_50px_rgba(27,67,36,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Card Header */}
          <div className="text-center sm:text-left mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3E8] dark:bg-emerald-950/60 border border-[#D1E2CD] dark:border-emerald-800 text-[#225732] dark:text-emerald-400 text-xs font-semibold mb-2.5">
              <Sprout className="w-3.5 h-3.5 text-[#2E7D42] dark:text-emerald-400" />
              <span>{isRegistering ? "Customer Self-Registration" : "National Millet Value Chain Platform"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#142017] dark:text-slate-100 tracking-tight">
              {isRegistering ? (
                <>Create <span className="text-[#266838] dark:text-emerald-400">Customer Account</span></>
              ) : (
                <>Sign In to <span className="text-[#266838] dark:text-emerald-400">ShreeAnna</span></>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#56655A] dark:text-slate-400 mt-1">
              {isRegistering
                ? "Register to buy certified millet products directly from farmers and SHGs with verified delivery tracking."
                : "Access your role-based portal or pick a demo role below to test the end-to-end platform."}
            </p>
          </div>

          {/* Context Notice for Buy Intent */}
          {intent === "buy" && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-700/60 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 font-medium">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-amber-800 dark:text-amber-300" />
              </div>
              <div>
                <p className="font-bold text-amber-950 dark:text-amber-100">Sign In to Complete Purchase</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Please sign in or click <strong>Customer / Retail Buyer</strong> below to continue your order.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          {!isRegistering ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D5A50] dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A7E] dark:text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-[#FBFBFA] dark:bg-slate-950/60 border-[#DCE4DA] dark:border-slate-800 text-[#142017] dark:text-slate-100 placeholder:text-[#9AA89E] dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-[#266838] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#266838]/15 dark:focus:ring-emerald-500/20 rounded-xl text-sm transition-all"
                    placeholder="name@shreeanna.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D5A50] dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A7E] dark:text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-[#FBFBFA] dark:bg-slate-950/60 border-[#DCE4DA] dark:border-slate-800 text-[#142017] dark:text-slate-100 placeholder:text-[#9AA89E] dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-[#266838] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#266838]/15 dark:focus:ring-emerald-500/20 rounded-xl text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Sign In to Portal Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#1B4324] dark:bg-emerald-600 hover:bg-[#14341C] dark:hover:bg-emerald-700 text-white font-semibold rounded-full shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? "Signing in..." : "Sign In to Portal"}
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Create Account Button Under Sign In to Portal Button */}
              <div className="pt-1.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsRegistering(true);
                    setError("");
                  }}
                  className="w-full h-11 border-[#C5D5C0] dark:border-slate-700 hover:border-[#1B4324] dark:hover:border-emerald-500 text-[#1B4324] dark:text-emerald-400 hover:bg-[#EFF5EB] dark:hover:bg-slate-800/80 font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <UserPlus className="h-4 w-4 text-[#266838] dark:text-emerald-400" />
                  <span>Create Account</span>
                </Button>
              </div>
            </form>
          ) : (
            /* Customer Registration Form */
            <form className="space-y-4" onSubmit={handleRegister}>
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D5A50] dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A7E] dark:text-slate-400" />
                  <Input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-11 bg-[#FBFBFA] dark:bg-slate-950/60 border-[#DCE4DA] dark:border-slate-800 text-[#142017] dark:text-slate-100 placeholder:text-[#9AA89E] dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-[#266838] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#266838]/15 dark:focus:ring-emerald-500/20 rounded-xl text-sm transition-all"
                    placeholder="e.g. Ramesh Patel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D5A50] dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A7E] dark:text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-10 h-11 bg-[#FBFBFA] dark:bg-slate-950/60 border-[#DCE4DA] dark:border-slate-800 text-[#142017] dark:text-slate-100 placeholder:text-[#9AA89E] dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-[#266838] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#266838]/15 dark:focus:ring-emerald-500/20 rounded-xl text-sm transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D5A50] dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A7E] dark:text-slate-400" />
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pl-10 h-11 bg-[#FBFBFA] dark:bg-slate-950/60 border-[#DCE4DA] dark:border-slate-800 text-[#142017] dark:text-slate-100 placeholder:text-[#9AA89E] dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-[#266838] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#266838]/15 dark:focus:ring-emerald-500/20 rounded-xl text-sm transition-all"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              {/* Locked Role: Always Customer Role Only */}
              <div className="rounded-xl bg-[#EFF5EB] dark:bg-slate-950/60 border border-[#D1E2CD] dark:border-slate-800 p-3 text-xs flex items-center justify-between text-[#1B4324] dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D42] dark:text-emerald-400" />
                  <span className="font-semibold text-[#4D5A50] dark:text-slate-400">Assigned Role:</span>
                </div>
                <span className="font-bold text-[#1B4324] dark:text-emerald-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-[#D6E6D0] dark:border-slate-800">
                  Customer (Marketplace Buyer)
                </span>
              </div>

              {/* Submit Registration */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#1B4324] dark:bg-emerald-600 hover:bg-[#14341C] dark:hover:bg-emerald-700 text-white font-semibold rounded-full shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? "Creating Account..." : "Create Account & Sign In"}
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Switch Back to Login */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsRegistering(false);
                  setError("");
                }}
                className="w-full h-10 text-xs font-semibold text-[#56655A] dark:text-slate-400 hover:text-[#1B4324] dark:hover:text-emerald-400 hover:bg-[#EFF5EB] dark:hover:bg-slate-800/80 rounded-full mt-1 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                <span>Already have an account? Sign In to Portal</span>
              </Button>
            </form>
          )}

          {/* Quick Role Switcher (Available on Sign In View) */}
          {!isRegistering && (
            <div className="mt-7 pt-5 border-t border-[#EAEFE8] dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#142017] dark:text-slate-200">
                  <Sparkles className="h-3.5 w-3.5 text-[#2E7D42] dark:text-emerald-400" />
                  <span>Quick Login as Role (Demo)</span>
                </div>
                <span className="text-[10px] text-[#617064] dark:text-slate-400 font-medium hidden sm:inline">
                  Click any role to auto-fill & login
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presetAccounts.map((acc) => (
                  <button
                    key={acc.roleKey}
                    type="button"
                    onClick={() => handleQuickLogin(acc.roleKey, acc.email)}
                    className={`text-left px-3.5 py-2.5 rounded-xl border transition-all text-xs group cursor-pointer ${
                      acc.isCustomer
                        ? "bg-[#EFF8EE] dark:bg-emerald-950/40 border-[#A8DBB3] dark:border-emerald-800/60 hover:border-[#266838] dark:hover:border-emerald-500 hover:bg-[#E3F4E2] dark:hover:bg-emerald-900/40 shadow-2xs"
                        : "bg-[#FBFBFA] dark:bg-slate-950/60 border-[#E5EBE3] dark:border-slate-800/80 hover:border-[#266838] dark:hover:border-emerald-500/60 hover:bg-[#F3F7F1] dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#142017] dark:text-slate-200 group-hover:text-[#1B4324] dark:group-hover:text-emerald-400 flex items-center gap-1">
                        <span>{acc.label}</span>
                        {acc.isCustomer && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#1B4324] dark:bg-emerald-700 text-white text-[9px] font-bold">
                            Buyer
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#617064] dark:text-slate-400 truncate mt-0.5">{acc.email}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-[#7A8A7E] dark:text-slate-500 z-10 pt-4">
        <span>ShreeAnna Millet Value Chain & Provenance Platform</span>
        <span className="mx-2">•</span>
        <span>Pure Millets. Better Lives.</span>
      </div>
    </div>
  );
}
