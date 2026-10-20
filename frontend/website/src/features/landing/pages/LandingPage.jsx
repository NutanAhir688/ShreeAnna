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
  ArrowLeft,
  FileText,
  Clock,
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      {/* 1. Header / Navigation Bar with transparent overlay over hero */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E7ECE4]/80 shadow-2xs py-1"
            : "bg-transparent border-b border-transparent py-2"
        }`}
      >
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
              href="/store"
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

      {/* 2. Hero Section: Image seamlessly in background spanning to top */}
      <section id="hero" className="relative min-h-[660px] lg:min-h-[740px] flex items-center overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-24">
        {/* Real photographic background image spanning the right half / background all the way up */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/millet_farmer_hero.jpg"
            alt="Farmer in green millet crop field"
            className="w-full h-full object-cover"
            style={{ objectPosition: "right top" }}
          />
          {/* Gradient fade from solid warm light #FBFBFA on left to transparent on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FBFBFA] via-[#FBFBFA]/85 via-40% md:via-46% to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FBFBFA] to-transparent pointer-events-none" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
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

      {/* 5. "Procurement Journey" (Mobile App Showcase matching Image 2, Farm Overview removed) */}
      <section id="technology" className="py-20 lg:py-28 bg-[#FBFBFA] border-b border-[#E5EDE2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column: Headlines & Real Verified Pipeline */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3E8] text-[#225732] text-xs font-bold border border-[#D1E2CD]">
                <Sprout className="w-3.5 h-3.5 text-[#2E7D42]" />
                <span>DIGITAL LOT PROVENANCE</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#142017] leading-[1.15]">
                Transparent Procurement. <br />
                <span className="text-[#266838]">Tracked from Farm to Payout.</span>
              </h2>

              <p className="text-sm sm:text-base text-[#56655A] leading-relaxed">
                ShreeAnna gives smallholder farmers real-time transparency across their entire procurement lifecycle — from harvest submission, NABL quality testing, and digital agreement signing to direct bank settlement.
              </p>

              {/* Real Project Pipeline Bullets */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    End-to-end harvest lot tracking & warehouse receipting
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    NABL certified quality testing & digital certificates
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    Digitally executed agreements & verified bank payout
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    Easy to use on mobile & web in regional languages
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs sm:text-sm h-11 px-6 rounded-full shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span>Access Farmer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <a href="#verify">
                  <Button
                    variant="outline"
                    className="rounded-full border-[#C5D5C0] text-[#1B4324] text-xs sm:text-sm h-11 px-5 hover:bg-[#EFF5EB]"
                  >
                    Verify Certificate
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Column: Realistic Phone Component (matching Image 2 Procurement Journey screen) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-[340px] sm:max-w-[370px] bg-slate-950 rounded-[48px] p-3 shadow-[0_30px_70px_rgba(0,0,0,0.22)] border-[5px] border-slate-800 text-slate-800">
                <div className="bg-[#F8FAF7] rounded-[38px] overflow-hidden p-4 space-y-3.5 border border-slate-200/80">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-slate-800 text-[11px] font-bold px-1">
                    <span>5:18</span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-[9px] font-mono font-medium">170 KB/s</span>
                      <span className="px-1 py-0.2 bg-slate-200 text-slate-700 rounded text-[8px] font-bold">5G+</span>
                      <span className="px-1 py-0.2 bg-slate-200 text-slate-700 rounded text-[8px] font-bold">VoNR</span>
                      <div className="flex items-center gap-0.5 font-bold">
                        <span className="text-[10px]">81</span>
                        <div className="w-4 h-2 border border-slate-700 rounded-xs p-0.5 flex items-center">
                          <div className="w-2.5 h-full bg-slate-800 rounded-2xs" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lot Details Header */}
                  <div className="flex items-center gap-3 pt-1">
                    <button className="text-slate-800 hover:text-[#1B4324] cursor-pointer">
                      <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <h3 className="text-base font-extrabold text-[#1B4324] tracking-tight">Lot Details</h3>
                  </div>

                  {/* Top Green Banner: Agreement Executed & Signed (v1.0) */}
                  <div className="rounded-2xl p-3.5 bg-[#EAF5ED] border border-[#A7DBB4] space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4.5 h-4.5 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <h4 className="text-xs font-bold text-[#1B4324]">Agreement Executed & Signed (v1.0)</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Version v1.0 contract has been accepted and digitally signed.
                    </p>
                    <button className="w-full bg-[#1B4324] hover:bg-[#14341C] text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Review Agreement (v1.0)</span>
                    </button>
                  </div>

                  {/* Section Title */}
                  <h4 className="text-xs font-extrabold text-slate-900 tracking-tight pt-0.5">Procurement Journey</h4>

                  {/* Timeline with Continuous Connecting Line */}
                  <div className="relative space-y-3 pl-1">
                    <div className="absolute left-[11px] top-2 bottom-4 w-[2px] bg-slate-200 z-0" />

                    {/* Step 1: Lot Submitted */}
                    <div className="relative flex items-center justify-between gap-2 z-10">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Lot Submitted</p>
                          <p className="text-[10px] text-slate-500">Your lot has been submitted to the FPO.</p>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Quality Inspection */}
                    <div className="relative flex items-center justify-between gap-2 z-10">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Quality Inspection</p>
                          <p className="text-[10px] text-slate-500">Quality inspection completed & verified.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#F3F0FA] border border-[#DFD6F5] text-[#6B46C1] text-[10px] font-bold shrink-0">
                        View Results
                      </span>
                    </div>

                    {/* Step 3: Quality Certificate */}
                    <div className="relative flex items-center justify-between gap-2 z-10">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Quality Certificate</p>
                          <p className="text-[10px] text-slate-500">Quality certificate issued & verified.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#F3F0FA] border border-[#DFD6F5] text-[#6B46C1] text-[10px] font-bold shrink-0">
                        View Certificate
                      </span>
                    </div>

                    {/* Step 4: Procurement Agreement */}
                    <div className="relative flex items-center justify-between gap-2 z-10">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Procurement Agreement</p>
                          <p className="text-[10px] text-slate-500">Procurement agreement signed & approved.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#F3F0FA] border border-[#DFD6F5] text-[#6B46C1] text-[10px] font-bold shrink-0">
                        View Agreement
                      </span>
                    </div>

                    {/* Step 5: Pickup / Delivery */}
                    <div className="relative flex items-center justify-between gap-2 z-10">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Pickup / Delivery</p>
                          <p className="text-[10px] text-slate-500">Pickup completed & delivered to warehouse.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#F3F0FA] border border-[#DFD6F5] text-[#6B46C1] text-[10px] font-bold shrink-0">
                        Track Details
                      </span>
                    </div>

                    {/* Step 6: Warehouse Receipt */}
                    <div className="relative flex items-center justify-between gap-2 z-10">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#1B4324] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">Warehouse Receipt</p>
                          <p className="text-[10px] text-slate-500">Millet received & verified at warehouse.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#F3F0FA] border border-[#DFD6F5] text-[#6B46C1] text-[10px] font-bold shrink-0">
                        View Receipt
                      </span>
                    </div>

                    {/* Step 7: Payment (In progress) */}
                    <div className="relative flex items-center justify-between gap-2 z-10">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-amber-50 border-2 border-amber-500 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-700 leading-tight">Payment</p>
                          <p className="text-[10px] text-slate-500">Warehouse verified. Payout in progress.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#F3F0FA] border border-[#DFD6F5] text-[#6B46C1] text-[10px] font-bold shrink-0">
                        View Payment
                      </span>
                    </div>
                  </div>

                  {/* Harvest Details */}
                  <div className="space-y-1 pt-1">
                    <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">Harvest Details</h4>
                    <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 space-y-1.5 text-xs shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-500">Millet Type</span>
                        <span className="font-bold text-slate-800">Crop</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                        <span className="text-[11px] text-slate-500">Estimated Quantity</span>
                        <span className="font-bold text-slate-900">699 kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Home indicator bar */}
                  <div className="w-24 h-1 bg-slate-300 rounded-full mx-auto mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Marketplace Section (Directly browsable published processor products matching Image 5) */}
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
                Explore certified value-added millet flours and healthy snacks published directly by verified SHGs and processing units.
              </p>
            </div>

            {/* Link to full Marketplace */}
            <Button
              onClick={() => navigate("/store")}
              className="bg-[#1B4324] hover:bg-[#14341C] text-white text-xs font-bold rounded-full px-5 h-10 shadow-xs cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Open Customer Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Product Grid (Real processor products with real packaging photos) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: "aa11bb22-3344-5566-7788-9900aabbccdd",
                title: "Pearl Millet Flour",
                category: "Flours",
                brand: "Millet Shakti SHG",
                price: 180,
                unit: "/ kg",
                imageUrl: "/images/products/pearl_millet_flour.jpg",
                badges: ["Quality Certified", "Traceable"],
              },
              {
                id: "bb22cc33-4455-6677-8899-0011bbccddee",
                title: "Ragi Cookies",
                category: "Cookies",
                brand: "Green Harvest SHG",
                price: 120,
                unit: "/ 250g",
                imageUrl: "/images/products/ragi_cookies.jpg",
                badges: ["Traceable", "SHG Made"],
              },
              {
                id: "cc33dd44-5566-7788-9900-1122ccddeeff",
                title: "Organic Foxtail Upma Mix",
                category: "Ready-to-Eat",
                brand: "Dahod Women SHG",
                price: 95,
                unit: "/ 500g",
                imageUrl: "/images/products/foxtail_upma_mix.jpg",
                badges: ["Quality Certified", "Low GI"],
              },
              {
                id: "dd44ee55-6677-8899-0011-2233ddeeff00",
                title: "Multi-Millet Energy Bars",
                category: "Snacks",
                brand: "Gramin Vikas FPO",
                price: 160,
                unit: "/ pack",
                imageUrl: "/images/products/millet_energy_bars.jpg",
                badges: ["Traceable", "100% Natural"],
              },
            ].map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#E3ECE0] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Real Image Container with Floating Badges */}
                <div className="relative aspect-4/3 w-full bg-slate-50 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                    {product.badges.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/95 backdrop-blur-xs text-[9px] font-bold text-[#1B4324] border border-emerald-200 shadow-2xs"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{product.brand}</p>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{product.title}</h3>
                    <p className="text-base font-extrabold text-[#142017]">
                      ₹{product.price} <span className="text-xs font-normal text-slate-500">{product.unit}</span>
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => navigate("/store")}
                    className="w-full bg-[#1B4324] hover:bg-[#14341C] text-white text-xs font-semibold rounded-xl h-9 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Buy Product</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              variant="outline"
              onClick={() => navigate("/store")}
              className="rounded-full border-[#C5D5C0] text-[#1B4324] hover:bg-[#EFF5EB] text-xs font-bold h-10 px-6 cursor-pointer"
            >
              <span>Explore All Verified Millet Products on Customer Store</span>
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
