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
  Check,
  CloudSun,
  MapPin,
  Smartphone,
  Download,
  QrCode,
  Menu,
  X,
  FlaskConical,
  ShoppingBag,
  Headphones,
  Newspaper,
  IndianRupee,
  Store,
  BadgeCheck,
  PhoneCall,
  Search,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { warehousesApi, lotsApi, qualityApi, marketplaceApi } from "@/services/api";

const MILLET_VARIETIES = [
  {
    title: "Finger Millet (Ragi)",
    description: "Exceptional source of natural calcium (344mg/100g) and polyphenols. Drought resilient staple grain for bone health and infant nutrition.",
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

  // Keep landing page on light theme
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    return () => {
      if (wasDark) root.classList.add("dark");
    };
  }, []);

  // Live platform statistics
  const [liveStats, setLiveStats] = useState({
    warehouseCount: 0,
    totalCapacityTons: 0,
    lotCount: 0,
    totalProcuredKg: 0,
  });

  // Published marketplace products for customer catalog
  const [publishedProducts, setPublishedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");

  // Certificate verification interactive state
  const [certInput, setCertInput] = useState("");
  const [certResult, setCertResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    async function fetchStatsAndProducts() {
      try {
        const [warehouses, lots, products] = await Promise.all([
          warehousesApi.getAll().catch(() => []),
          lotsApi.getAll().catch(() => []),
          marketplaceApi.getAll().catch(() => []),
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

        if (Array.isArray(products)) {
          // Filter to only active/published items for public customer marketplace
          const activeOnly = products.filter(
            (p) => p.status === "Active" || p.status === "Available"
          );
          setPublishedProducts(activeOnly);
        }
      } catch (err) {
        console.error("Failed to load landing page data:", err);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchStatsAndProducts();
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

  const filteredProducts = publishedProducts.filter((product) => {
    if (productCategoryFilter === "all") return true;
    return product.category?.toLowerCase().includes(productCategoryFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#142017] font-sans selection:bg-[#25633A] selection:text-white relative overflow-x-hidden antialiased">
      {/* 1. Header / Navigation Bar with Marketplace link */}
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

          {/* Center Navigation Links (Including Marketplace for Customers) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4D5A50]">
            <a
              href="#hero"
              className="text-[#1B4324] font-semibold relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1B4324] after:rounded-full"
            >
              Home
            </a>

            {/* Direct Marketplace Link for Customers */}
            <a
              href="#marketplace"
              className="text-[#1B4324] hover:text-[#14341C] font-semibold py-1 flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-4 h-4 text-[#266838]" />
              <span>Marketplace</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                Store
              </span>
            </a>

            <a href="#solutions" className="hover:text-[#1B4324] transition-colors py-1">
              Solutions
            </a>
            <a href="#digital-sathi" className="hover:text-[#1B4324] transition-colors py-1">
              App
            </a>
            <a href="#millets" className="hover:text-[#1B4324] transition-colors py-1">
              Millets
            </a>
            <a href="#verify" className="hover:text-[#1B4324] transition-colors py-1">
              Traceability
            </a>
          </nav>

          {/* Right Action: Browse Marketplace & Get Started */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="text-xs font-semibold text-[#1B4324] hover:bg-[#EFF5EB] cursor-pointer h-10 px-4 rounded-full"
            >
              Sign In
            </Button>
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
              href="#marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-[#1B4324] flex items-center gap-2"
            >
              <Store className="w-4 h-4 text-[#266838]" />
              <span>Marketplace (Buy Products)</span>
            </a>
            <a
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#4D5A50] hover:text-[#1B4324]"
            >
              Solutions
            </a>
            <a
              href="#digital-sathi"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#4D5A50] hover:text-[#1B4324]"
            >
              Kisan Digital Sathi App
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
              Traceability
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full text-xs font-semibold rounded-full border-[#D4DED1] text-[#1B4324]"
              >
                Sign In
              </Button>
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

      {/* 2. Hero Section: Image seamlessly in background (matching reference image) */}
      <section id="hero" className="relative min-h-[580px] lg:min-h-[680px] flex items-center overflow-hidden">
        {/* Real photographic background image spanning the right half / background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/millet_farmer_hero.jpg"
            alt="Farmer in green millet crop field"
            className="w-full h-full object-cover object-[center_right] lg:object-right"
          />
          {/* Gradient fade from solid warm light #FBFBFA on left to transparent on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FBFBFA] via-[#FBFBFA]/95 via-45% md:via-50% to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FBFBFA] to-transparent pointer-events-none" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left max-w-xl">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3E8] border border-[#D1E2CD] text-[#225732] text-xs font-semibold shadow-2xs">
                <Sprout className="w-3.5 h-3.5 text-[#2E7D42]" />
                <span>Smart Farming for a Sustainable Future</span>
              </div>

              {/* Bold Editorial Serif Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-serif font-bold tracking-tight text-[#142017] leading-[1.12]">
                Empowering Farmers. <br />
                <span className="text-[#266838]">Growing Tomorrow.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#56655A] leading-relaxed">
                ShreeAnna brings technology, insights, and certified provenance to help you increase yield, reduce costs, and build a sustainable future.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs sm:text-sm h-12 px-7 rounded-full shadow-md cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.03]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <a href="#marketplace">
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-full border-[#D4DED1] bg-white/90 backdrop-blur-xs hover:bg-[#F3F7F1] text-[#1B4324] font-semibold text-xs sm:text-sm shadow-2xs cursor-pointer flex items-center gap-2"
                  >
                    <span>Explore Marketplace</span>
                    <Store className="w-4 h-4 text-[#2E7D42]" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Column: Floating Glass Widget Directly on the Background Field */}
            <div className="lg:col-span-5 flex justify-end items-end pt-8 lg:pt-32">
              <div className="bg-black/45 backdrop-blur-md border border-white/25 rounded-2xl p-4 sm:p-5 shadow-2xl text-white flex items-center justify-between sm:justify-start gap-4">
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

                <div className="h-10 w-[1px] bg-white/25 mx-1" />

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
      </section>

      {/* 3. "WHAT WE OFFER" Solutions Section (matches reference 4-card grid) */}
      <section id="solutions" className="py-20 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E5EDE2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF5EB] text-[#25633A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#142017] mb-2.5">Crop Management</h3>
              <p className="text-xs text-[#5C6A60] leading-relaxed">
                Plan, monitor, and manage your crops with precision and real-time insights.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E5EDE2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF5EB] text-[#25633A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#142017] mb-2.5">Irrigation Control</h3>
              <p className="text-xs text-[#5C6A60] leading-relaxed">
                Smart irrigation scheduling to save water and ensure optimal crop growth.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E5EDE2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF5EB] text-[#25633A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#142017] mb-2.5">Fertilizer & Soil Care</h3>
              <p className="text-xs text-[#5C6A60] leading-relaxed">
                Know your soil better and apply the right nutrients at the right time.
              </p>
            </div>

            {/* Card 4 */}
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

          <div className="mt-12 text-center">
            <a
              href="#marketplace"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4324] hover:text-[#14341C] group cursor-pointer"
            >
              <span>Explore All Solutions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. Stats Band (exact dark forest green #183E26) */}
      <section className="bg-[#183E26] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center mb-3 text-emerald-300">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">25K+</p>
              <p className="text-xs text-[#A8C7B0] font-medium mt-1">Happy Farmers</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center mb-3 text-emerald-300">
                <Sprout className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">1.2M+</p>
              <p className="text-xs text-[#A8C7B0] font-medium mt-1">Acres Monitored</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center mb-3 text-emerald-300">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">30%</p>
              <p className="text-xs text-[#A8C7B0] font-medium mt-1">Average Yield Increase</p>
            </div>

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

      {/* 5. "HAR KISAN KA DIGITAL SATHI" (Mobile showcase exactly like the reference image 3) */}
      <section id="digital-sathi" className="py-20 lg:py-28 bg-[#FBFBFA] border-b border-[#E5EDE2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* Left Column: Har Kisan Ka Digital Sathi Highlights */}
            <div className="lg:col-span-4 space-y-6 text-left">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1B4324] flex items-center justify-center text-white">
                  <Sprout className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142017] tracking-tight">SHREEANNA SATHI</h3>
                  <p className="text-[10px] text-[#2E7D42] font-semibold uppercase tracking-wider">
                    Sathi Har Kisan Ka
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-[#56655A] uppercase tracking-wider mb-1">
                  HAR KISAN KA
                </p>
                <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#1B4324] leading-tight">
                  DIGITAL SATHI
                </h2>
                <p className="text-xs sm:text-sm text-[#56655A] mt-2">
                  Smart Information, Better Farming, Bright Future.
                </p>
              </div>

              {/* 5 Feature Bullets matching Image 3 */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#E5EDE2] shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#142017]">CROP GUIDE</h4>
                    <p className="text-[11px] text-[#56655A]">Puri jankari faslon ki aur kheti ke tarikon ki.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#E5EDE2] shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700">
                    <CloudSun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#142017]">WEATHER UPDATE</h4>
                    <p className="text-[11px] text-[#56655A]">Sahi mausam ki jankari, sahi faisla aapka.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#E5EDE2] shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#142017]">MARKET PRICES</h4>
                    <p className="text-[11px] text-[#56655A]">Mandi ke taza bhav, becho apni fasal sahi daam.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#E5EDE2] shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0 text-teal-700">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#142017]">EXPERT ADVICE</h4>
                    <p className="text-[11px] text-[#56655A]">Visheshagyon se salah aur samadhan.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#E5EDE2] shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-purple-700">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#142017]">KISAN NEWS & YOJANA</h4>
                    <p className="text-[11px] text-[#56655A]">Sarkari yojana, samachar aur zaruri updates.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column: Detailed Mobile Smartphone Mockup (matching Image 3) */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-[280px] sm:w-[310px] bg-slate-950 rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-800 text-slate-800 shrink-0">
                <div className="bg-white rounded-[34px] overflow-hidden p-3.5 space-y-3.5 border border-slate-100">
                  {/* Phone Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-[#2E7D42]" />
                      <span className="text-xs font-bold text-[#142017]">SHREEANNA SATHI</span>
                    </div>
                    <Menu className="w-4 h-4 text-slate-600" />
                  </div>

                  {/* Inside Mini Banner */}
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#1B4324] to-[#2E7D42] p-3 text-white">
                    <p className="text-[10px] text-emerald-200 font-bold uppercase">Smart Farming</p>
                    <p className="text-xs font-extrabold">Better Tomorrow</p>
                  </div>

                  {/* 6 Quick Action Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[#F4F8F2] border border-[#E5EDE2]">
                      <Sprout className="w-4 h-4 text-[#2E7D42] mx-auto mb-1" />
                      <span className="text-[9px] font-bold text-slate-800 block leading-tight">Crop Guide</span>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                      <CloudSun className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <span className="text-[9px] font-bold text-slate-800 block leading-tight">Weather</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                      <IndianRupee className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                      <span className="text-[9px] font-bold text-slate-800 block leading-tight">Mandi Rates</span>
                    </div>
                    <div className="p-2 rounded-xl bg-teal-50 border border-teal-100">
                      <Headphones className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                      <span className="text-[9px] font-bold text-slate-800 block leading-tight">Advice</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                      <Newspaper className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <span className="text-[9px] font-bold text-slate-800 block leading-tight">News</span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                      <Building2 className="w-4 h-4 text-[#2E7D42] mx-auto mb-1" />
                      <span className="text-[9px] font-bold text-slate-800 block leading-tight">Schemes</span>
                    </div>
                  </div>

                  {/* Today's Market Prices Card inside Phone */}
                  <div className="p-2.5 rounded-xl bg-[#FBFBFA] border border-slate-200/80 space-y-2">
                    <p className="text-[10px] font-bold text-slate-800 border-b border-slate-100 pb-1">
                      Today's Market Prices (MSP)
                    </p>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Finger Millet (Ragi)</span>
                        <span className="font-bold text-[#1B4324]">₹4,290 / Qtl</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Pearl Millet (Bajra)</span>
                        <span className="font-bold text-[#1B4324]">₹2,625 / Qtl</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Foxtail Millet (Kangni)</span>
                        <span className="font-bold text-[#1B4324]">₹3,850 / Qtl</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Sorghum (Jowar)</span>
                        <span className="font-bold text-[#1B4324]">₹3,180 / Qtl</span>
                      </div>
                    </div>
                    <a
                      href="#marketplace"
                      className="block text-center py-1 bg-[#1B4324] text-white rounded-lg text-[10px] font-bold mt-2"
                    >
                      View Marketplace
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Smiling Farmer with Phone + 24/7 Farmer Support */}
            <div className="lg:col-span-4 space-y-5">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#DDE7DA]">
                <img
                  src="/images/farmer_holding_phone.jpg"
                  alt="Smiling Indian farmer holding smartphone in agricultural crop field"
                  className="w-full h-auto object-cover aspect-4/3 sm:aspect-1/1"
                />
                {/* Circular Badge on top of image */}
                <div className="absolute top-4 right-4 bg-[#1B4324]/90 backdrop-blur-md px-3 py-2 rounded-2xl text-white text-center shadow-lg border border-white/20">
                  <p className="text-[9px] font-bold tracking-wider uppercase text-emerald-300">EMPOWERING</p>
                  <p className="text-xs font-black">FARMERS</p>
                </div>
              </div>

              {/* 24/7 Farmer Support Strip matching Image 3 */}
              <div className="p-4 rounded-2xl bg-[#183E26] text-white flex items-center gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-emerald-300">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-tight">24/7 FARMER SUPPORT</h4>
                  <p className="text-[11px] text-[#A8C7B0]">Hum hamesha aapke saath hain.</p>
                  <p className="text-xs font-extrabold text-white mt-0.5">Toll-Free Helpline: 1800-123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Marketplace Section (Directly browsable published products) */}
      <section id="marketplace" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Store className="w-3.5 h-3.5 text-[#2E7D42]" />
                <span>CUSTOMER STORE • VERIFIED MILLET PRODUCTS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#142017] tracking-tight">
                Buy Published Millet Products
              </h2>
              <p className="text-sm text-[#56655A]">
                Explore certified batches and value-added millet flours published directly by smallholder farmers and verified FPO collectives.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={productCategoryFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setProductCategoryFilter("all")}
                className={
                  productCategoryFilter === "all"
                    ? "bg-[#1B4324] hover:bg-[#14341C] text-white rounded-full text-xs"
                    : "rounded-full text-xs border-[#D4DED1] text-[#1B4324]"
                }
              >
                All Products
              </Button>
              <Button
                variant={productCategoryFilter === "flours" ? "default" : "outline"}
                size="sm"
                onClick={() => setProductCategoryFilter("flours")}
                className={
                  productCategoryFilter === "flours"
                    ? "bg-[#1B4324] hover:bg-[#14341C] text-white rounded-full text-xs"
                    : "rounded-full text-xs border-[#D4DED1] text-[#1B4324]"
                }
              >
                Flours & Grains
              </Button>
              <Button
                variant={productCategoryFilter === "organic" ? "default" : "outline"}
                size="sm"
                onClick={() => setProductCategoryFilter("organic")}
                className={
                  productCategoryFilter === "organic"
                    ? "bg-[#1B4324] hover:bg-[#14341C] text-white rounded-full text-xs"
                    : "rounded-full text-xs border-[#D4DED1] text-[#1B4324]"
                }
              >
                Organic Raw Millets
              </Button>
            </div>
          </div>

          {/* Product Grid */}
          {productsLoading ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              <div className="w-8 h-8 rounded-full border-2 border-[#1B4324] border-t-transparent animate-spin mx-auto mb-2" />
              <span>Loading published marketplace inventory...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-[#FBFBFA] rounded-3xl p-12 text-center border border-[#E5EDE2] max-w-xl mx-auto space-y-3">
              <Store className="w-12 h-12 text-[#2E7D42] mx-auto" />
              <h3 className="text-lg font-bold text-[#142017]">Inventory Synchronizing</h3>
              <p className="text-xs text-[#56655A]">
                Farmers and FPOs publish active lots continuously. Check back or visit the trade portal.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="bg-[#1B4324] hover:bg-[#14341C] text-white text-xs rounded-full mt-2"
              >
                Access Buyer Portal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-[#E5EDE2] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Image / Thumbnail */}
                    <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-100">
                      <img
                        src={product.imageUrl || "/images/farm_satellite_overview.jpg"}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-2.5 left-2.5 bg-[#1B4324] text-white text-[10px] font-bold">
                        {product.status || "Active"}
                      </Badge>
                      <span className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-slate-800">
                        {product.lotId || "Verified Lot"}
                      </span>
                    </div>

                    {/* Category & Title */}
                    <div>
                      <p className="text-[10px] font-bold text-[#2E7D42] uppercase tracking-wider">
                        {product.category || "Flours & Grains"}
                      </p>
                      <h4 className="text-base font-bold text-[#142017] line-clamp-1">{product.title}</h4>
                      <p className="text-xs text-[#56655A] line-clamp-2 mt-1">
                        {product.description || "Farm-fresh certified pure millet grain, graded for moisture and purity."}
                      </p>
                    </div>

                    {/* Origin & Specs */}
                    <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-[#56655A]">
                      <div className="flex justify-between">
                        <span>Farmer / FPO:</span>
                        <span className="font-semibold text-slate-800">{product.farmerName || "Dahod FPO"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Stock:</span>
                        <span className="font-semibold text-slate-800">
                          {product.quantityKg?.toLocaleString() || 1500} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Price</p>
                      <p className="text-base font-bold text-[#1B4324]">
                        ₹{product.pricePerKg || 48} <span className="text-xs font-normal text-slate-500">/ kg</span>
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => navigate(`/marketplace/${product.id}`)}
                      className="bg-[#1B4324] hover:bg-[#14341C] text-white text-xs font-semibold rounded-full px-4"
                    >
                      <span>View Lot</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full Catalog Button */}
          <div className="mt-12 text-center">
            <Button
              onClick={() => navigate("/marketplace")}
              className="bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs sm:text-sm h-11 px-7 rounded-full shadow-xs cursor-pointer"
            >
              <span>Explore All Trade Lots in B2B Portal</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Interactive QR Verification Section */}
      <section id="verify" className="py-20 bg-[#FBFBFA] border-t border-[#E5EDE2]">
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

          <form onSubmit={handleVerify} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <Input
              type="text"
              placeholder="Enter Lot ID or Cert (e.g., LOT-2026-001)"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              className="h-12 px-4 rounded-xl text-xs sm:text-sm bg-white border-[#D4DED1] focus-visible:ring-[#1B4324]"
            />
            <Button
              type="submit"
              disabled={verifying}
              className="h-12 px-6 rounded-xl bg-[#1B4324] hover:bg-[#14341C] text-white text-xs font-bold cursor-pointer shrink-0"
            >
              {verifying ? "Checking..." : "Verify Now"}
            </Button>
          </form>

          {verifyError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 max-w-xl mx-auto">
              {verifyError}
            </div>
          )}

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

      {/* 8. Superfood Millets Showcase */}
      <section id="millets" className="py-20 bg-white border-t border-[#E5EDE2]">
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

      {/* 9. Android App APK Download Section */}
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

      {/* 10. Trust Bar & Footer */}
      <footer className="bg-[#FBFBFA] border-t border-[#E5EDE2] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
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
