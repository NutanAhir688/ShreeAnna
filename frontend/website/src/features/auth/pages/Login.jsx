import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CONFIGS } from "@/config/rolePermissions";
import { Shield, KeyRound, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("fpo@shreeanna.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to login. Check backend server.");
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
      await login(defaultEmail, "Password123!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetAccounts = [
    { roleKey: "FpoManager", email: "fpo@shreeanna.com", label: "FPO Manager" },
    { roleKey: "ProcurementOfficer", email: "procurement@shreeanna.com", label: "Procurement Officer" },
    { roleKey: "QualityInspector", email: "quality@shreeanna.com", label: "Quality Inspector" },
    { roleKey: "WarehouseManager", email: "warehouse@shreeanna.com", label: "Warehouse Manager" },
    { roleKey: "LogisticsCoordinator", email: "logistics@shreeanna.com", label: "Logistics Coordinator" },
    { roleKey: "Accountant", email: "accountant@shreeanna.com", label: "Accountant" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow ambient backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/30">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ShreeAnna</h1>
        </div>
        <h2 className="mt-2 text-center text-sm text-slate-400 font-medium">
          Smart Millet Platform — Role-Based FPO Portal
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20"
                  placeholder="name@shreeanna.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Signing in..." : "Sign In to Portal"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Role Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Quick Login as Role (Demo)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {presetAccounts.map((acc) => (
                <button
                  key={acc.roleKey}
                  type="button"
                  onClick={() => handleQuickLogin(acc.roleKey, acc.email)}
                  className="text-left px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all text-xs"
                >
                  <p className="font-semibold text-slate-200">{acc.label}</p>
                  <p className="text-[10px] text-slate-500 truncate">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
