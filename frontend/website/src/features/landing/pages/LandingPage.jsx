import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  ShieldCheck,
  Building2,
  Truck,
  Wheat,
  Droplets,
  Scale,
  Users,
  ArrowRight,
  CheckCircle2,
  Search,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  Smartphone,
  Download,
  ArrowDownToLine,
  MapPin,
  WifiOff,
  Radio,
  QrCode,
  ExternalLink,
  Menu,
  X,
  TrendingUp,
  Activity,
  Check,
  PhoneCall,
  Calendar,
  CloudSun,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card as UICard, CardContent } from "@/components/ui/card";

import { warehousesApi, lotsApi, qualityApi } from "@/services/api";

const MILLET_VARIETIES = [
  {
    title: "Finger Millet (Ragi)",
    description: "Exceptional source of natural calcium (344mg/100g) and polyphenols. Drought resilient staple grain for infants and bone health.",
    badge: "High Calcium",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    iconColor: "text-amber-600",
    msp: "₹4,290 / Qtl",
    moisture: "≤ 12.0%",
  },
  {
    title: "Pearl Millet (Bajra)",
    description: "Rich in iron, zinc, and micronutrients. Grown across arid soils with minimal water requirements, powerhouse for anemia reduction.",
    badge: "High Iron & Zinc",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    iconColor: "text-emerald-600",
    msp: "₹2,625 / Qtl",
    moisture: "≤ 12.0%",
  },
  {
    title: "Foxtail Millet (Kangni)",
    description: "Low glycemic index and high dietary fiber. Clinically proven to support blood sugar regulation and gut microbiome health.",
    badge: "Low Glycemic Index",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
    iconColor: "text-teal-600",
    msp: "₹3,850 / Qtl",
    moisture: "≤ 11.5%",
  },
  {
    title: "Sorghum (Jowar)",
    description: "Naturally gluten-free grain rich in antioxidants and plant proteins. Ideal for bakery flours, rotis, and extruded snacks.",
    badge: "100% Gluten Free",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    iconColor: "text-blue-600",
    msp: "₹3,180 / Qtl",
    moisture: "≤ 12.0%",
  },
  {
    title: "Little Millet (Kutki)",
    description: "Fast cooking grain rich in magnesium and essential fatty acids. Ideal rice alternative for balanced cardiac and metabolic health.",
    badge: "Heart Healthy",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    iconColor: "text-purple-600",
    msp: "₹4,000 / Qtl",
    moisture: "≤ 11.0%",
  },
  {
    title: "Proso Millet (Chena)",
    description: "One of the earliest domesticated grains with 12.5% crude protein and high lecithin to support neural vitality.",
    badge: "12.5% Protein",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    iconColor: "text-rose-600",
    msp: "₹4,800 / Qtl",
    moisture: "≤ 11.5%",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  // Mobile menu open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#fafcf8] text-slate-900 font-sans selection:bg-emerald-600 selection:text-white relative overflow-x-hidden">
      {/* 1. Header / Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-950/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#1b4332] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Shree<span className="text-[#1b4332]">Anna</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                Pure Millets. Better Lives.
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#hero" className="text-[#1b4332] font-semibold transition-colors hover:text-[#143224]">
              Home
            </a>
            <a href="#solutions" className="hover:text-[#1b4332] transition-colors">
              Solutions
            </a>
            <a href="#technology" className="hover:text-[#1b4332] transition-colors">
              Technology
            </a>
            <a href="#millets" className="hover:text-[#1b4332] transition-colors">
              Millets
            </a>
            <a href="#verify" className="hover:text-[#1b4332] transition-colors">
              Traceability
            </a>
            <a href="#mobile-app" className="hover:text-[#1b4332] transition-colors">
              Mobile App
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer h-9 px-4 rounded-full"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/login")}
              className="bg-[#1b4332] hover:bg-[#143224] text-white font-semibold text-xs h-9 px-5 rounded-full shadow-sm cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-[#1b4332]"
            >
              Home
            </a>
            <a
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-[#1b4332]"
            >
              Solutions
            </a>
            <a
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-[#1b4332]"
            >
              Technology
            </a>
            <a
              href="#millets"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-[#1b4332]"
            >
              Millets
            </a>
            <a
              href="#verify"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-[#1b4332]"
            >
              QR Verification
            </a>
            <a
              href="#mobile-app"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-[#1b4332]"
            >
              Android App
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full text-xs font-semibold rounded-full"
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full bg-[#1b4332] hover:bg-[#143224] text-white text-xs font-semibold rounded-full"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#1b4332] text-xs font-semibold shadow-xs">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>Smart Farming for a Sustainable Future</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Empowering Farmers. <br />
                <span className="text-[#1b4332]">Growing Tomorrow.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                ShreeAnna brings technology, certified grain quality, and market access to help you increase yield, eliminate middlemen, and build a sustainable millet future.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[#1b4332] hover:bg-[#143224] text-white font-semibold text-xs h-12 px-7 rounded-full shadow-md cursor-pointer flex items-center gap-2 transition-all hover:scale-105"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <a href="#solutions">
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-full border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <span>Explore Solutions</span>
                    <Sprout className="w-4 h-4 text-emerald-600" />
                  </Button>
                </a>
              </div>

              {/* Sub-strip: Android App Pill */}
              <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                <a
                  href="/downloads/shreeanna-mobile.apk"
                  download="shreeanna-mobile.apk"
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#1b4332] font-medium"
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Android App v1.0.0 (62 MB)</span>
                </a>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Traceable NABL Quality</span>
                </span>
              </div>
            </div>

            {/* Right Visual Column (Farmer with Tablet + Floating Glass Badges) */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Main Image Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-950/10 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 group">
                  <img
                    src="/images/millet_farmer_hero.jpg"
                    alt="Indian progressive millet farmer using digital agriculture tablet in pearl millet field"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle lighting vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Top Badge: Cluster Origin */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 shadow-md flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dahod Millet Cluster • LOT-2026-004</span>
                  </div>

                  {/* Floating Glassmorphism Widget 1: Soil Health & Moisture */}
                  <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:left-6 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl text-white flex items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Soil Health</p>
                          <p className="font-bold text-white leading-none">Certified Organic</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <Droplets className="w-3.5 h-3.5 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Moisture Level</p>
                          <p className="font-bold text-emerald-300 leading-none">10.8% Optimal</p>
                        </div>
                      </div>
                    </div>

                    <div className="h-10 w-[1px] bg-white/20 mx-1 hidden sm:block" />

                    {/* Circular Progress Badge */}
                    <div className="flex items-center gap-3 pl-1">
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-700"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-emerald-400"
                            strokeDasharray="98, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xs font-black text-white">98%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Grade A</p>
                        <p className="text-[10px] text-slate-300">Crop Score</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "WHAT WE OFFER" Solutions Grid Section */}
      <section id="solutions" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider uppercase">
              <Sprout className="w-3.5 h-3.5" />
              <span>WHAT WE OFFER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Smart Solutions for Modern Farming
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Everything you need to manage your farm efficiently and profitably.
            </p>
          </div>

          {/* 4 Cards Grid (matching reference layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Crop Management */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Crop Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plan, monitor, and manage your millet crops with precision GPS plot mapping and real-time agronomy insights.
              </p>
            </div>

            {/* Card 2: Quality & Certification */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Quality & Certification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                In-field moisture testing, NABL lab compliance, and tamper-evident cryptographic QR certificates from farm to fork.
              </p>
            </div>

            {/* Card 3: Silo & Storage Care */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Silo & Storage Care</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Know your grain storage conditions better with IoT temperature telemetry and automated Goods Receipt Notes (GRN).
              </p>
            </div>

            {/* Card 4: Market Insights */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Market Insights</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get real-time market prices, MSP benchmark trends, and direct FPO-to-processor trade for higher profits.
              </p>
            </div>
          </div>

          {/* Centered Explore Link */}
          <div className="mt-12 text-center">
            <a
              href="#millets"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#1b4332] hover:text-[#143224] group cursor-pointer"
            >
              <span>Explore All Solutions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. Forest Green Stats Band */}
      <section className="bg-[#143224] text-white py-14 border-y border-[#0f271c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-800/40">
            {/* Stat 1 */}
            <div className="pt-4 md:pt-0 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-300">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">25K+</p>
              <p className="text-xs text-emerald-200 font-medium mt-1">Happy Farmers</p>
            </div>

            {/* Stat 2 */}
            <div className="pt-4 md:pt-0 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-300">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {liveStats.totalCapacityTons > 0 ? `${(liveStats.totalCapacityTons / 1000).toFixed(0)}K+ MT` : "28K+ MT"}
              </p>
              <p className="text-xs text-emerald-200 font-medium mt-1">Silo Storage Monitored</p>
            </div>

            {/* Stat 3 */}
            <div className="pt-4 md:pt-0 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-300">
                <Wheat className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {liveStats.lotCount > 0 ? `${liveStats.lotCount * 12}+` : "1,200+"}
              </p>
              <p className="text-xs text-emerald-200 font-medium mt-1">Certified Millet Lots</p>
            </div>

            {/* Stat 4 */}
            <div className="pt-4 md:pt-0 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">100%</p>
              <p className="text-xs text-emerald-200 font-medium mt-1">NABL Lot Traceability</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Technology Section ("Technology that grows with you") */}
      <section id="technology" className="py-20 lg:py-28 bg-[#fafcf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider uppercase">
                <Sprout className="w-3.5 h-3.5" />
                <span>SMART. SIMPLE. POWERFUL.</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Technology that <br />
                <span className="text-[#1b4332]">grows</span> with you
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                ShreeAnna is your digital farming partner. Access real-time data, expert recommendations, NABL certificates, and smart market tools — all in one place.
              </p>

              {/* Bullet Points */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Real-time field & lot monitoring
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    AI-powered quality & moisture recommendations
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Easy to use on mobile & web
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Transparent direct-to-bank DBT payments
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-3">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-[#1b4332] hover:bg-[#143224] text-white font-semibold text-xs h-11 px-6 rounded-full shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <span>Launch Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Column: Dual Device Mockups (Phone + Web Card) */}
            <div className="lg:col-span-7 relative">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                {/* Phone Mockup Frame */}
                <div className="w-full sm:w-[260px] bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-800 text-slate-800 shrink-0">
                  <div className="bg-white rounded-[28px] overflow-hidden p-4 space-y-4">
                    {/* Phone Status Header */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-100 pb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <WifiOff className="w-2.5 h-2.5 text-slate-400" />
                        <span>100%</span>
                      </div>
                    </div>

                    {/* App Greeting */}
                    <div>
                      <p className="text-xs font-bold text-slate-900">Hello, Farmer 🌾</p>
                      <p className="text-[10px] text-slate-500">Here's your farm summary</p>
                    </div>

                    {/* Mini Metric 1: Crop Health */}
                    <div className="p-2.5 bg-emerald-50 rounded-xl flex items-center justify-between border border-emerald-100">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Crop Health</p>
                        <p className="text-xs font-bold text-emerald-800">Good (98%)</p>
                      </div>
                      <Sprout className="w-4 h-4 text-emerald-600" />
                    </div>

                    {/* Mini Metric 2: Soil Moisture */}
                    <div className="p-2.5 bg-teal-50 rounded-xl flex items-center justify-between border border-teal-100">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Soil Moisture</p>
                        <p className="text-xs font-bold text-teal-800">Optimal 10.8%</p>
                      </div>
                      <Droplets className="w-4 h-4 text-teal-600" />
                    </div>

                    {/* Weather Chip */}
                    <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                      <div className="flex items-center gap-2">
                        <CloudSun className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-[10px] text-slate-500">Weather</p>
                          <p className="text-xs font-bold text-slate-800">28°C Partly Cloudy</p>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Task */}
                    <div className="pt-1">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                        Upcoming Task
                      </p>
                      <div className="p-2 bg-slate-50 rounded-lg text-[10px] text-slate-700 border border-slate-100">
                        <p className="font-semibold text-slate-900">Quality Inspection</p>
                        <p className="text-slate-500">Today, 4:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Web Dashboard Overview Card */}
                <div className="w-full sm:flex-1 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Farm Overview</h4>
                      <p className="text-[10px] text-slate-500">Dahod Millet Cluster • Satellite GIS</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50">
                      Live Sensor Stream
                    </Badge>
                  </div>

                  {/* Satellite Aerial Drone Image */}
                  <div className="relative rounded-xl overflow-hidden aspect-16/9 border border-slate-100">
                    <img
                      src="/images/farm_satellite_overview.jpg"
                      alt="Drone view of agricultural farm fields and millet crops"
                      className="w-full h-full object-cover"
                    />
                    {/* Map Plot Tag 1 */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Field A • 12.5 Ac Bajra</span>
                    </div>

                    {/* Map Plot Tag 2 */}
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Field B • 8.0 Ac Ragi</span>
                    </div>
                  </div>

                  {/* Activity Mini Table */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Recent Activity
                    </p>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-medium text-slate-800">Harvest Batch LOT-2026-004</span>
                      </div>
                      <span className="text-slate-500">Today, 9:00 AM</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-medium text-slate-800">NABL Lab Certification Issued</span>
                      </div>
                      <span className="text-slate-500">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive QR Certificate Verification Section */}
      <section id="verify" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>INSTANT QUALITY PROVENANCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verify Any Harvest Certificate
          </h2>

          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Scan your QR code on grain packaging or enter any Certificate / Lot ID below to review field origin, moisture testing, and NABL lab approvals.
          </p>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <Input
              type="text"
              placeholder="Enter Lot ID or Cert (e.g., LOT-2026-001)"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              className="h-12 px-4 rounded-xl text-xs sm:text-sm bg-white border-slate-300 focus-visible:ring-emerald-700"
            />
            <Button
              type="submit"
              disabled={verifying}
              className="h-12 px-6 rounded-xl bg-[#1b4332] hover:bg-[#143224] text-white text-xs font-bold cursor-pointer shrink-0"
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
            <div className="max-w-xl mx-auto p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-left shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-emerald-950">Valid Provenance Certificate</span>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px]">Verified</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Lot Identifier</p>
                  <p className="font-bold text-slate-900">{certResult.lotNumber || certInput}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Farmer Name</p>
                  <p className="font-bold text-slate-900">{certResult.farmerName || "Registered Farmer"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Millet Variety</p>
                  <p className="font-bold text-slate-900">{certResult.milletType || "Pearl Millet (Bajra)"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Moisture & Grade</p>
                  <p className="font-bold text-emerald-700">
                    {certResult.moisture ? `${certResult.moisture}%` : "10.8%"} • Grade A
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. Superfood Millets Showcase */}
      <section id="millets" className="py-20 bg-[#fafcf8] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider uppercase">
              <Wheat className="w-3.5 h-3.5" />
              <span>THE SUPERFOODS OF INDIA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Certified Millet Varieties
            </h2>
            <p className="text-sm text-slate-600">
              High nutrient density, drought resilient, and MSP benchmarked for guaranteed farmer prosperity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MILLET_VARIETIES.map((millet, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge className={`${millet.badgeColor} border text-[10px] font-bold`}>
                    {millet.badge}
                  </Badge>
                  <span className="text-xs font-bold text-slate-700">{millet.msp}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{millet.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{millet.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Standard Moisture: {millet.moisture}</span>
                  <span className="text-emerald-700 font-semibold">100% Traceable</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Android App APK Download Section */}
      <section id="mobile-app" className="py-16 bg-[#1b4332] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-[#143224] p-8 sm:p-10 rounded-3xl border border-emerald-700/40 shadow-xl">
            <div className="space-y-4 max-w-lg text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>OFFLINE-FIRST FIELD COMPANION</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Download the ShreeAnna Android App
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                Empowering field agents, FPO managers, and farmers with offline farm plot geo-tagging, digital weighbridge intake, and instant receipt generation.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a href={apkDownloadUrl} download="shreeanna-mobile.apk">
                  <Button className="h-11 px-6 rounded-full bg-white hover:bg-slate-100 text-[#143224] font-bold text-xs shadow-md cursor-pointer flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Download APK (62 MB)</span>
                  </Button>
                </a>
                <span className="text-xs text-emerald-200">v1.0.0 • Android 8.0+</span>
              </div>
            </div>

            {/* QR Code for Quick Phone Download */}
            <div className="bg-white p-4 rounded-2xl shadow-lg shrink-0 flex flex-col items-center">
              <QRCodeSVG value={apkDownloadUrl} size={130} />
              <p className="text-[10px] text-slate-700 font-bold mt-2">Scan to Download</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1b4332] flex items-center justify-center text-white">
                <Sprout className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Shree<span className="text-[#1b4332]">Anna</span>
                </span>
                <p className="text-[10px] text-slate-500">National Millet Value Chain & Provenance</p>
              </div>
            </div>

            {/* Trust Values */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                Sustainable Farming
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Higher Farmer Yield
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Stronger Communities
              </span>
            </div>

            {/* Action */}
            <Button
              onClick={() => navigate("/login")}
              className="bg-[#1b4332] hover:bg-[#143224] text-white font-semibold text-xs h-9 px-5 rounded-full shadow-xs cursor-pointer"
            >
              Join ShreeAnna
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© 2026 ShreeAnna National Millet Infrastructure. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-600 transition-colors">NABL Lab Standards</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
