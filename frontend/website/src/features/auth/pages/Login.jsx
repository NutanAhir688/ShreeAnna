import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("fpo@shreeanna.com");
  const [password, setPassword] = useState("Password123!");
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      if (user?.role === "Customer") {
        navigate("/store");
      } else {
        navigate("/dashboard");
      }
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
      navigate("/store");
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
      if (roleKey === "Customer" || user?.role === "Customer") {
        navigate("/store");
      } else {
        navigate("/dashboard");
      }
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
    <div className="min-h-screen bg-[#FBFBFA] text-[#142017] font-sans selection:bg-[#25633A] selection:text-white flex flex-col justify-between relative overflow-x-hidden antialiased py-8 px-4 sm:px-6 lg:px-8">
      {/* Soft Ambient Organic Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#86D49B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#266838]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Brand Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10 pb-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#1B4324] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-[#86D49B]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#142017]">
              Shree<span className="text-[#266838]">Anna</span>
            </span>
            <p className="text-[10px] text-[#617064] font-medium tracking-wide">
              Pure Millets. Better Lives.
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/store"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFF5EB] hover:bg-[#E3EDE0] text-[#1B4324] text-xs font-semibold border border-[#D5E4D1] transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-[#266838]" />
            <span>Customer Marketplace</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#56655A] hover:text-[#1B4324] px-3 py-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-xl mx-auto w-full z-10 my-auto">
        <div className="bg-white border border-[#E7ECE4] rounded-3xl p-6 sm:p-9 shadow-[0_20px_50px_rgba(27,67,36,0.06)]">
          {/* Card Header */}
          <div className="text-center sm:text-left mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3E8] border border-[#D1E2CD] text-[#225732] text-xs font-semibold mb-2.5">
              <Sprout className="w-3.5 h-3.5 text-[#2E7D42]" />
              <span>{isRegistering ? "Customer Self-Registration" : "National Millet Value Chain Platform"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#142017] tracking-tight">
              {isRegistering ? (
                <>Create <span className="text-[#266838]">Customer Account</span></>
              ) : (
                <>Sign In to <span className="text-[#266838]">ShreeAnna</span></>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#56655A] mt-1">
              {isRegistering
                ? "Register to buy certified millet products directly from farmers and SHGs with verified delivery tracking."
                : "Access your role-based portal or pick a demo role below to test the end-to-end platform."}
            </p>
          </div>

          {/* Form */}
          {!isRegistering ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D5A50] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A7E]" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-[#FBFBFA] border-[#DCE4DA] text-[#142017] placeholder:text-[#9AA89E] focus:bg-white focus:border-[#266838] focus:ring-2 focus:ring-[#266838]/15 rounded-xl text-sm transition-all"
                    placeholder="name@shreeanna.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D5A50] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A7E]" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-[#FBFBFA] border-[#DCE4DA] text-[#142017] placeholder:text-[#9AA89E] focus:bg-white focus:border-[#266838] focus:ring-2 focus:ring-[#266838]/15 rounded-xl text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Sign In to Portal Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold rounded-full shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer mt-2"
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
                  className="w-full h-11 border-[#C5D5C0] hover:border-[#1B4324] text-[#1B4324] hover:bg-[#EFF5EB] font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <UserPlus className="h-4 w-4 text-[#266838]" />
                  <span>Create Account</span>
                </Button>
              </div>
            </form>
          ) : (
            /* Customer Registration Form */
            <form className="space-y-4" onSubmit={handleRegister}>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D5A50] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A7E]" />
                  <Input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-11 bg-[#FBFBFA] border-[#DCE4DA] text-[#142017] placeholder:text-[#9AA89E] focus:bg-white focus:border-[#266838] focus:ring-2 focus:ring-[#266838]/15 rounded-xl text-sm transition-all"
                    placeholder="e.g. Ramesh Patel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D5A50] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A7E]" />
                  <Input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-10 h-11 bg-[#FBFBFA] border-[#DCE4DA] text-[#142017] placeholder:text-[#9AA89E] focus:bg-white focus:border-[#266838] focus:ring-2 focus:ring-[#266838]/15 rounded-xl text-sm transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4D5A50] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A7E]" />
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pl-10 h-11 bg-[#FBFBFA] border-[#DCE4DA] text-[#142017] placeholder:text-[#9AA89E] focus:bg-white focus:border-[#266838] focus:ring-2 focus:ring-[#266838]/15 rounded-xl text-sm transition-all"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              {/* Locked Role: Always Customer Role Only */}
              <div className="rounded-xl bg-[#EFF5EB] border border-[#D1E2CD] p-3 text-xs flex items-center justify-between text-[#1B4324]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D42]" />
                  <span className="font-semibold text-[#4D5A50]">Assigned Role:</span>
                </div>
                <span className="font-bold text-[#1B4324] bg-white px-2.5 py-0.5 rounded-full border border-[#D6E6D0]">
                  Customer (Marketplace Buyer)
                </span>
              </div>

              {/* Submit Registration */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold rounded-full shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer mt-2"
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
                className="w-full h-10 text-xs font-semibold text-[#56655A] hover:text-[#1B4324] hover:bg-[#EFF5EB] rounded-full mt-1 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                <span>Already have an account? Sign In to Portal</span>
              </Button>
            </form>
          )}

          {/* Quick Role Switcher (Available on Sign In View) */}
          {!isRegistering && (
            <div className="mt-7 pt-5 border-t border-[#EAEFE8]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#142017]">
                  <Sparkles className="h-3.5 w-3.5 text-[#2E7D42]" />
                  <span>Quick Login as Role (Demo)</span>
                </div>
                <span className="text-[10px] text-[#617064] font-medium hidden sm:inline">
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
                        ? "bg-[#EFF8EE] border-[#A8DBB3] hover:border-[#266838] hover:bg-[#E3F4E2] shadow-2xs"
                        : "bg-[#FBFBFA] border-[#E5EBE3] hover:border-[#266838] hover:bg-[#F3F7F1]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#142017] group-hover:text-[#1B4324] flex items-center gap-1">
                        <span>{acc.label}</span>
                        {acc.isCustomer && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#1B4324] text-white text-[9px] font-bold">
                            Buyer
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#617064] truncate mt-0.5">{acc.email}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-[#7A8A7E] z-10 pt-4">
        <span>ShreeAnna Millet Value Chain & Provenance Platform</span>
        <span className="mx-2">•</span>
        <span>Pure Millets. Better Lives.</span>
      </div>
    </div>
  );
}
