import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  ShieldCheck,
  Building2,
  Wheat,
  Droplets,
  Users,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Activity,
  Check,
  Calendar,
  CloudSun,
  MapPin,
  Smartphone,
  Download,
  QrCode,
  Menu,
  X,
  FlaskConical,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { warehousesApi, lotsApi, qualityApi } from "@/services/api";

const MILLET_VARIETIES = [
  {
    title: "Finger Millet (Ragi)",
    description: "Exceptional source of natural calcium (344mg/100g) and polyphenols. Drought resilient staple grain for infants and bone health.",
    badge: "High Calcium",
    badgeColor: "bg-[#EFF5EB] text-[#25633A] border-[#D6E6D0]",
    msp: "₹4,290 / Qtl",
    moisture: "≤ 12.0%",
  },
  {
    title: "Pearl Millet (Bajra)",
    description: "Rich in iron, zinc, and micronutrients. Grown across arid soils with minimal water requirements, powerhouse for anemia reduction.",
    badge: "High Iron & Zinc",
    badgeColor: "bg-[#EFF5EB] text-[#25633A] border-[#D6E6D0]",
    msp: "₹2,625 / Qtl",
    moisture: "≤ 12.0%",
  },
  {
    title: "Foxtail Millet (Kangni)",
    description: "Low glycemic index and high dietary fiber. Clinically proven to support blood sugar regulation and gut microbiome health.",
    badge: "Low Glycemic Index",
    badgeColor: "bg-[#EFF5EB] text-[#25633A] border-[#D6E6D0]",
    msp: "₹3,850 / Qtl",
    moisture: "≤ 11.5%",
  },
  {
    title: "Sorghum (Jowar)",
    description: "Naturally gluten-free grain rich in antioxidants and plant proteins. Ideal for bakery flours, rotis, and extruded snacks.",
    badge: "100% Gluten Free",
    badgeColor: "bg-[#EFF5EB] text-[#25633A] border-[#D6E6D0]",
    msp: "₹3,180 / Qtl",
    moisture: "≤ 12.0%",
  },
  {
    title: "Little Millet (Kutki)",
    description: "Fast cooking grain rich in magnesium and essential fatty acids. Ideal rice alternative for balanced cardiac and metabolic health.",
    badge: "Heart Healthy",
    badgeColor: "bg-[#EFF5EB] text-[#25633A] border-[#D6E6D0]",
    msp: "₹4,000 / Qtl",
    moisture: "≤ 11.0%",
  },
  {
    title: "Proso Millet (Chena)",
    description: "One of the earliest domesticated grains with 12.5% crude protein and high lecithin to support neural vitality.",
    badge: "12.5% Protein",
    badgeColor: "bg-[#EFF5EB] text-[#25633A] border-[#D6E6D0]",
    msp: "₹4,800 / Qtl",
    moisture: "≤ 11.5%",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Isolate landing page to light editorial theme (prevents dark mode from overriding the reference styling)
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    return () => {
      if (wasDark) root.classList.add("dark");
    };
  }, []);

  // Live platform statistics from real backend APIs
  const [liveStats, setLiveStats] = useState({
    warehouseCount: 0,
    totalCapacityTons: 0,
    lotCount: 0,
    totalProcuredKg: 0,
  });

  // Certificate verification interactive state
  const [certInput, setCertInput] = useState("");
  const [certResult, setCertResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const [warehouses, lots] = await Promise.all([
          warehousesApi.getAll().catch(() => []),
          lotsApi.getAll().catch(() => []),
        ]);

        const totalCap = Array.isArray(warehouses)
          ? warehouses.reduce((acc, w) => acc + Number(w.capacityInTons || w.capacity || 0), 0)
          : 0;

        const totalKg = Array.isArray(lots)
          ? lots.reduce((acc, l) => acc + Number(l.actualQuantityKg || l.estimatedQuantityKg || 0), 0)
          : 0;

        setLiveStats({
          warehouseCount: Array.isArray(warehouses) ? warehouses.length : 0,
          totalCapacityTons: totalCap,
          lotCount: Array.isArray(lots) ? lots.length : 0,
          totalProcuredKg: totalKg,
        });
      } catch (err) {
        console.error("Failed to load landing page stats:", err);
      }
    }
    fetchStats();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certInput.trim()) return;
    setVerifying(true);
    setVerifyError("");
    setCertResult(null);

    try {
      const res = await qualityApi.verifyCertificate(certInput.trim());
      if (res && (res.isValid || res.certificateNumber || res.lotNumber)) {
        setCertResult(res);
      } else {
        setVerifyError("Certificate or Lot identifier not found in the national registry.");
      }
    } catch {
      setVerifyError("Verification record not found. Please verify the QR Certificate code or Lot ID.");
    } finally {
      setVerifying(false);
    }
  };

  const [apkDownloadUrl, setApkDownloadUrl] = useState("/downloads/shreeanna-mobile.apk");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setApkDownloadUrl(`${window.location.origin}/downloads/shreeanna-mobile.apk`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#142017] font-sans selection:bg-[#25633A] selection:text-white relative overflow-x-hidden antialiased">
      {/* 1. Header / Navigation Bar (matches reference header exactly) */}
      <header className="sticky top-0 z-50 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-[#E7ECE4] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo on Left */}
          <a href="#" className="flex items-center gap-3 group">
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
          </a>

          {/* Center Navigation Links with active underline */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4D5A50]">
            <a
              href="#hero"
              className="text-[#1B4324] font-semibold relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1B4324] after:rounded-full"
            >
              Home
            </a>
            <a href="#about" className="hover:text-[#1B4324] transition-colors py-1">
              About
            </a>
            <a href="#solutions" className="hover:text-[#1B4324] transition-colors py-1">
              Solutions
            </a>
            <a href="#technology" className="hover:text-[#1B4324] transition-colors py-1">
              Resources
            </a>
            <a href="#millets" className="hover:text-[#1B4324] transition-colors py-1">
              Millets
            </a>
            <a href="#verify" className="hover:text-[#1B4324] transition-colors py-1">
              Contact
            </a>
          </nav>

          {/* Right Action Button: Dark Green Pill "Get Started" */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => navigate("/login")}
              className="bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs sm:text-sm h-10 px-5 rounded-full shadow-xs cursor-pointer flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <Sprout className="w-3.5 h-3.5 text-[#86D49B]" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#142017] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#142017]" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E7ECE4] px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-[#1B4324]"
            >
              Home
            </a>
            <a
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#4D5A50] hover:text-[#1B4324]"
            >
              Solutions
            </a>
            <a
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#4D5A50] hover:text-[#1B4324]"
            >
              Technology
            </a>
            <a
              href="#millets"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#4D5A50] hover:text-[#1B4324]"
            >
              Millets
            </a>
            <a
              href="#verify"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#4D5A50] hover:text-[#1B4324]"
            >
              Verification
            </a>
            <div className="pt-2">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full bg-[#1B4324] hover:bg-[#14341C] text-white text-xs font-semibold rounded-full"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section (exact colors, spacing, fonts & layout from reference) */}
      <section id="hero" className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3E8] border border-[#D1E2CD] text-[#225732] text-xs font-semibold shadow-2xs">
                <Sprout className="w-3.5 h-3.5 text-[#2E7D42]" />
                <span>Smart Farming for a Sustainable Future</span>
              </div>

              {/* Bold Serif Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-bold tracking-tight text-[#142017] leading-[1.12]">
                Empowering Farmers. <br />
                <span className="text-[#266838]">Growing Tomorrow.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#56655A] max-w-lg leading-relaxed">
                ShreeAnna brings technology, insights, and expertise to help you increase yield, reduce costs, and build a sustainable future.
              </p>

              {/* CTAs matching reference: Dark Green Pill + White Pill */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs sm:text-sm h-12 px-7 rounded-full shadow-md cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.03]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <a href="#solutions">
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-full border-[#D4DED1] bg-white hover:bg-[#F3F7F1] text-[#1B4324] font-semibold text-xs sm:text-sm shadow-2xs cursor-pointer flex items-center gap-2"
                  >
                    <span>Explore Solutions</span>
                    <Sprout className="w-4 h-4 text-[#2E7D42]" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Column: Farmer Image + Floating Glass Data Card & Gauge */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#DCE6DA] aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 group">
                  <img
                    src="/images/millet_farmer_hero.jpg"
                    alt="Farmer using digital tablet in sunlit field"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle lighting vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Glassmorphic Pill Widget (matching the reference image placement) */}
                  <div className="absolute bottom-6 right-6 left-6 sm:left-auto bg-black/45 backdrop-blur-md border border-white/25 rounded-2xl p-4 shadow-xl text-white flex items-center justify-between sm:justify-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                          <Sprout className="w-3.5 h-3.5 text-emerald-300" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-200 font-medium">Soil Health</p>
                          <p className="font-bold text-white leading-none">Good</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                          <Droplets className="w-3.5 h-3.5 text-teal-300" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-200 font-medium">Moisture</p>
                          <p className="font-bold text-white leading-none">Optimal</p>
                        </div>
                      </div>
                    </div>

                    <div className="h-10 w-[1px] bg-white/25 mx-1 hidden sm:block" />

                    {/* Circular Score Gauge */}
                    <div className="flex flex-col items-center justify-center pl-1">
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-white/20"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#59D17E]"
                            strokeDasharray="78, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xs font-black text-white">78%</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-200 mt-0.5">Crop Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "WHAT WE OFFER" Solutions Section (matches reference 4-card grid exactly) */}
      <section id="solutions" className="py-20 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D42] tracking-wider uppercase">
              <Sprout className="w-3.5 h-3.5" />
              <span>WHAT WE OFFER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#142017] tracking-tight">
              Smart Solutions for Modern Farming
            </h2>
            <p className="text-sm sm:text-base text-[#56655A]">
              Everything you need to manage your farm efficiently and profitably.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Crop Management */}
            <div className="bg-white rounded-2xl p-8 border border-[#E5EDE2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF5EB] text-[#25633A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#142017] mb-2.5">Crop Management</h3>
              <p className="text-xs text-[#5C6A60] leading-relaxed">
                Plan, monitor, and manage your crops with precision and real-time insights.
              </p>
            </div>

            {/* Card 2: Irrigation Control / Quality */}
            <div className="bg-white rounded-2xl p-8 border border-[#E5EDE2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF5EB] text-[#25633A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#142017] mb-2.5">Irrigation Control</h3>
              <p className="text-xs text-[#5C6A60] leading-relaxed">
                Smart irrigation scheduling to save water and ensure optimal crop growth.
              </p>
            </div>

            {/* Card 3: Fertilizer & Soil Care */}
            <div className="bg-white rounded-2xl p-8 border border-[#E5EDE2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF5EB] text-[#25633A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#142017] mb-2.5">Fertilizer & Soil Care</h3>
              <p className="text-xs text-[#5C6A60] leading-relaxed">
                Know your soil better and apply the right nutrients at the right time.
              </p>
            </div>

            {/* Card 4: Market Insights */}
            <div className="bg-white rounded-2xl p-8 border border-[#E5EDE2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF5EB] text-[#25633A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#142017] mb-2.5">Market Insights</h3>
              <p className="text-xs text-[#5C6A60] leading-relaxed">
                Get real-time market prices, demand trends, and sell smart for higher profits.
              </p>
            </div>
          </div>

          {/* Centered Explore Link */}
          <div className="mt-12 text-center">
            <a
              href="#technology"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4324] hover:text-[#14341C] group cursor-pointer"
            >
              <span>Explore All Solutions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. Stats Band (exact dark forest green #183E26 and 4 columns) */}
      <section className="bg-[#183E26] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {/* Stat 1 */}
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center mb-3 text-emerald-300">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">25K+</p>
              <p className="text-xs text-[#A8C7B0] font-medium mt-1">Happy Farmers</p>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center mb-3 text-emerald-300">
                <Sprout className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">1.2M+</p>
              <p className="text-xs text-[#A8C7B0] font-medium mt-1">Acres Monitored</p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center mb-3 text-emerald-300">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">30%</p>
              <p className="text-xs text-[#A8C7B0] font-medium mt-1">Average Yield Increase</p>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center mb-3 text-emerald-300">
                <Droplets className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">40%</p>
              <p className="text-xs text-[#A8C7B0] font-medium mt-1">Water Saved</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Technology Section ("Technology that grows with you") */}
      <section id="technology" className="py-20 lg:py-28 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D42] tracking-wider uppercase">
                <Sprout className="w-3.5 h-3.5" />
                <span>SMART. SIMPLE. POWERFUL.</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#142017] leading-tight">
                Technology that <br />
                <span className="text-[#266838] italic">grows</span> with you
              </h2>

              <p className="text-sm sm:text-base text-[#56655A] leading-relaxed">
                ShreeAnna is your digital farming partner. Access real-time data, expert recommendations, and smart tools - all in one place.
              </p>

              {/* Bullet Points with solid green check badges */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#276738] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#142017]">
                    Real-time field monitoring
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#276738] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#142017]">
                    AI-powered recommendations
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#276738] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#142017]">
                    Easy to use on mobile & web
                  </span>
                </div>
              </div>

              {/* Action Button: Dark Green Pill */}
              <div className="pt-3">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs sm:text-sm h-11 px-7 rounded-full shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Column: Phone Mockup + Web Dashboard Card side-by-side */}
            <div className="lg:col-span-7 relative">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                {/* Mobile Phone Mockup */}
                <div className="w-full sm:w-[260px] bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-800 text-slate-800 shrink-0">
                  <div className="bg-white rounded-[28px] overflow-hidden p-4 space-y-4">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-100 pb-2">
                      <span>9:41</span>
                      <span>100%</span>
                    </div>

                    {/* Greeting */}
                    <div>
                      <p className="text-xs font-bold text-[#142017]">Hello, Farmer 🌾</p>
                      <p className="text-[10px] text-[#606E63]">Here's your farm summary</p>
                    </div>

                    {/* Crop Health Card */}
                    <div className="p-2.5 bg-[#F4F8F2] rounded-xl flex items-center justify-between border border-[#E3EDE0]">
                      <div>
                        <p className="text-[10px] text-[#606E63] font-medium">Crop Health</p>
                        <p className="text-xs font-bold text-[#20522E]">Good (78%)</p>
                      </div>
                      <Sprout className="w-4 h-4 text-[#2E7D42]" />
                    </div>

                    {/* Soil Moisture */}
                    <div className="p-2.5 bg-[#F0F7F6] rounded-xl flex items-center justify-between border border-[#DEECEB]">
                      <div>
                        <p className="text-[10px] text-[#606E63] font-medium">Soil Moisture</p>
                        <p className="text-xs font-bold text-[#195650]">Optimal 65%</p>
                      </div>
                      <Droplets className="w-4 h-4 text-[#1F746C]" />
                    </div>

                    {/* Weather */}
                    <div className="p-2.5 bg-[#FBFBFA] rounded-xl flex items-center justify-between border border-slate-100">
                      <div className="flex items-center gap-2">
                        <CloudSun className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-[10px] text-slate-500">Weather</p>
                          <p className="text-xs font-bold text-slate-800">24°C Partly Cloudy</p>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Task */}
                    <div className="pt-1">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                        Upcoming Task
                      </p>
                      <div className="p-2 bg-[#FBFBFA] rounded-lg text-[10px] text-slate-700 border border-slate-100">
                        <p className="font-semibold text-slate-900">Irrigation - Field B</p>
                        <p className="text-slate-500">Today, 6:00 AM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Web Dashboard Card */}
                <div className="w-full sm:flex-1 bg-white rounded-2xl border border-[#E5EDE2] p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#142017]">Farm Overview</h4>
                      <p className="text-[10px] text-slate-500">Dahod Cluster • GIS Satellite</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-[#25633A] border-[#D1E2CD] bg-[#EBF3E8]">
                      Active
                    </Badge>
                  </div>

                  {/* Satellite Aerial Farm Preview */}
                  <div className="relative rounded-xl overflow-hidden aspect-16/9 border border-slate-100">
                    <img
                      src="/images/farm_satellite_overview.jpg"
                      alt="Drone view of agricultural farm fields"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Field A • 12.5 Acres</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Field B • 8.0 Acres</span>
                    </div>
                  </div>

                  {/* Recent Activity Table */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] text-[#606E63] font-bold uppercase tracking-wider">
                      Recent Activity
                    </p>
                    <div className="p-2 rounded-lg bg-[#FBFBFA] border border-[#E5EDE2] flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#2E7D42]" />
                        <span className="font-medium text-slate-800">Irrigation Completed • Field B</span>
                      </div>
                      <span className="text-slate-500">Today, 6:00 AM</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FBFBFA] border border-[#E5EDE2] flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-medium text-slate-800">Fertilizer Applied • Field C</span>
                      </div>
                      <span className="text-slate-500">Yesterday, 4:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive QR Verification Section (Light editorial style) */}
      <section id="verify" className="py-20 bg-white border-t border-[#E5EDE2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EBF3E8] text-[#225732] text-xs font-semibold border border-[#D1E2CD]">
            <QrCode className="w-3.5 h-3.5 text-[#2E7D42]" />
            <span>INSTANT QUALITY PROVENANCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#142017] tracking-tight">
            Verify Any Harvest Certificate
          </h2>

          <p className="text-sm text-[#56655A] max-w-xl mx-auto">
            Scan your QR code on grain packaging or enter any Certificate / Lot ID below to review field origin, moisture testing, and NABL lab approvals.
          </p>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <Input
              type="text"
              placeholder="Enter Lot ID or Cert (e.g., LOT-2026-001)"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              className="h-12 px-4 rounded-xl text-xs sm:text-sm bg-[#FBFBFA] border-[#D4DED1] focus-visible:ring-[#1B4324]"
            />
            <Button
              type="submit"
              disabled={verifying}
              className="h-12 px-6 rounded-xl bg-[#1B4324] hover:bg-[#14341C] text-white text-xs font-bold cursor-pointer shrink-0"
            >
              {verifying ? "Checking..." : "Verify Now"}
            </Button>
          </form>

          {/* Error Message */}
          {verifyError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 max-w-xl mx-auto">
              {verifyError}
            </div>
          )}

          {/* Verified Certificate Card */}
          {certResult && (
            <div className="max-w-xl mx-auto p-5 bg-[#F4F8F2] border border-[#D1E2CD] rounded-2xl text-left shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#D1E2CD] pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2E7D42]" />
                  <span className="font-bold text-sm text-[#142017]">Valid Provenance Certificate</span>
                </div>
                <Badge className="bg-[#1B4324] text-white text-[10px]">Verified</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-[#606E63] uppercase font-semibold">Lot Identifier</p>
                  <p className="font-bold text-[#142017]">{certResult.lotNumber || certInput}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#606E63] uppercase font-semibold">Farmer Name</p>
                  <p className="font-bold text-[#142017]">{certResult.farmerName || "Registered Farmer"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#606E63] uppercase font-semibold">Millet Variety</p>
                  <p className="font-bold text-[#142017]">{certResult.milletType || "Pearl Millet (Bajra)"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#606E63] uppercase font-semibold">Moisture & Grade</p>
                  <p className="font-bold text-[#20522E]">
                    {certResult.moisture ? `${certResult.moisture}%` : "10.8%"} • Grade A
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. Superfood Millets Showcase */}
      <section id="millets" className="py-20 bg-[#FBFBFA] border-t border-[#E5EDE2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D42] tracking-wider uppercase">
              <Wheat className="w-3.5 h-3.5" />
              <span>THE SUPERFOODS OF INDIA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#142017] tracking-tight">
              Certified Millet Varieties
            </h2>
            <p className="text-sm text-[#56655A]">
              High nutrient density, drought resilient, and MSP benchmarked for guaranteed farmer prosperity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MILLET_VARIETIES.map((millet, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-[#E5EDE2] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge className={`${millet.badgeColor} border text-[10px] font-bold`}>
                    {millet.badge}
                  </Badge>
                  <span className="text-xs font-bold text-[#142017]">{millet.msp}</span>
                </div>

                <h3 className="text-base font-bold text-[#142017]">{millet.title}</h3>
                <p className="text-xs text-[#5C6A60] leading-relaxed">{millet.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#606E63] font-medium">
                  <span>Standard Moisture: {millet.moisture}</span>
                  <span className="text-[#20522E] font-semibold">100% Traceable</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Android App APK Download Section */}
      <section id="mobile-app" className="py-16 bg-[#183E26] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-[#14341C] p-8 sm:p-10 rounded-3xl border border-emerald-700/30 shadow-xl">
            <div className="space-y-4 max-w-lg text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>OFFLINE-FIRST FIELD COMPANION</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                Download the ShreeAnna Android App
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                Empowering field agents, FPO managers, and farmers with offline farm plot geo-tagging, digital weighbridge intake, and instant receipt generation.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a href={apkDownloadUrl} download="shreeanna-mobile.apk">
                  <Button className="h-11 px-6 rounded-full bg-white hover:bg-slate-100 text-[#14341C] font-bold text-xs shadow-md cursor-pointer flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#2E7D42]" />
                    <span>Download APK (62 MB)</span>
                  </Button>
                </a>
                <span className="text-xs text-[#A8C7B0]">v1.0.0 • Android 8.0+</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-lg shrink-0 flex flex-col items-center">
              <QRCodeSVG value={apkDownloadUrl} size={130} />
              <p className="text-[10px] text-slate-700 font-bold mt-2">Scan to Download</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Trust Bar & Footer (matches reference bottom bar) */}
      <footer className="bg-[#FBFBFA] border-t border-[#E5EDE2] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1B4324] flex items-center justify-center text-white">
                <Sprout className="w-4 h-4 text-[#86D49B]" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-[#142017]">
                  Shree<span className="text-[#266838]">Anna</span>
                </span>
                <p className="text-[10px] text-[#606E63]">Build a greener and more prosperous tomorrow</p>
              </div>
            </div>

            {/* Center Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#4D5A50] font-semibold">
              <span className="flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-[#2E7D42]" />
                Sustainable Farming
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#2E7D42]" />
                Better Yield
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#2E7D42]" />
                Stronger Communities
              </span>
            </div>

            {/* Right Action */}
            <Button
              onClick={() => navigate("/login")}
              className="bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs h-9 px-5 rounded-full shadow-xs cursor-pointer"
            >
              Join ShreeAnna
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-[#E5EDE2] flex flex-col sm:flex-row items-center justify-between text-xs text-[#808E83] gap-4">
            <p>© 2026 ShreeAnna National Millet Infrastructure. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-[#1B4324] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#1B4324] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#1B4324] transition-colors">NABL Lab Standards</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
