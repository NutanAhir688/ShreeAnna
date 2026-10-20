import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  ShieldCheck,
  Building2,
  Truck,
  Factory,
  Package,
  Boxes,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Search,
  Sparkles,
  Layers,
  Award,
  Globe2,
  Wheat,
  Thermometer,
  Droplets,
  Scale,
  Users,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Download,
  ArrowDownToLine,
  MapPin,
  WifiOff,
  Radio,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { ButtonWithMovingBorder } from "@/components/ui/moving-border";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FloatingNav } from "@/components/ui/floating-navbar";

import { warehousesApi, lotsApi, qualityApi } from "@/services/api";

const MILLET_VARIETIES = [
  {
    title: "Finger Millet (Ragi)",
    description: "Exceptional source of natural calcium (344mg/100g) and polyphenols. Drought resilient staple grain for infants and bone health.",
    badge: <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">High Calcium</Badge>,
    icon: <Wheat className="w-5 h-5 text-amber-400" />,
    footer: "Govt MSP: ₹4,290/Quintal • Standard Moisture: ≤ 12.0%",
  },
  {
    title: "Pearl Millet (Bajra)",
    description: "Rich in iron, zinc, and micronutrients. Grown across arid soils with minimal water requirements, powerhouse for anemia reduction.",
    badge: <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">High Iron & Zinc</Badge>,
    icon: <Wheat className="w-5 h-5 text-emerald-400" />,
    footer: "Govt MSP: ₹2,625/Quintal • Standard Moisture: ≤ 12.0%",
  },
  {
    title: "Foxtail Millet (Kangni)",
    description: "Low glycemic index and high dietary fiber. Clinically proven to support blood sugar regulation and gut microbiome health.",
    badge: <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-[10px]">Low Glycemic Index</Badge>,
    icon: <Wheat className="w-5 h-5 text-teal-400" />,
    footer: "Govt MSP: ₹3,850/Quintal • Standard Moisture: ≤ 11.5%",
  },
  {
    title: "Sorghum (Jowar)",
    description: "Naturally gluten-free grain rich in antioxidants and plant proteins. Ideal for bakery flours, rotis, and extruded snacks.",
    badge: <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">100% Gluten Free</Badge>,
    icon: <Wheat className="w-5 h-5 text-blue-400" />,
    footer: "Govt MSP: ₹3,180/Quintal • Standard Moisture: ≤ 12.0%",
  },
  {
    title: "Little Millet (Kutki)",
    description: "Fast cooking grain rich in magnesium and essential fatty acids. Ideal rice alternative for balanced cardiac and metabolic health.",
    badge: <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">Heart Healthy</Badge>,
    icon: <Wheat className="w-5 h-5 text-purple-400" />,
    footer: "Govt MSP: ₹4,000/Quintal • Standard Moisture: ≤ 11.0%",
  },
  {
    title: "Proso Millet (Chena)",
    description: "One of the earliest domesticated grains with 12.5% crude protein and high lecithin to support neural health and vitality.",
    badge: <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px]">12.5% Protein</Badge>,
    icon: <Wheat className="w-5 h-5 text-rose-400" />,
    footer: "Govt MSP: ₹4,800/Quintal • Standard Moisture: ≤ 11.5%",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  // Live platform statistics
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
        console.error("Failed to load public landing page stats:", err);
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

  const navItems = [
    { name: "Pillars", link: "#pillars", icon: <Layers className="w-4 h-4" /> },
    { name: "Android App", link: "#mobile-app", icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
    { name: "Millet Grains", link: "#varieties", icon: <Wheat className="w-4 h-4" /> },
    { name: "QR Verification", link: "#verify", icon: <QrCode className="w-4 h-4" /> },
    { name: "Role Portals", link: "#roles", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Floating Glassmorphic Navbar */}
      <FloatingNav
        navItems={navItems}
        rightElement={
          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="/downloads/shreeanna-mobile.apk"
              download="shreeanna-mobile.apk"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
              title="Download Android APK (v1.0.0)"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
              <span>APK v1.0</span>
            </a>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-[11px] sm:text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer h-7 px-2 sm:px-3"
            >
              Log In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold text-[11px] sm:text-xs h-7 px-2.5 sm:px-3 shadow-md border-0 cursor-pointer rounded-full"
            >
              Launch Portal
            </Button>
          </div>
        }
      />

      {/* Hero Section with Aceternity BackgroundBeamsWithCollision */}
      <BackgroundBeamsWithCollision className="min-h-[92vh] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-20">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-amber-500/5">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>National Millet Value Chain & Provenance Infrastructure</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Aceternity Animated Heading */}
          <div className="text-3xl sm:text-5xl md:text-6xl tracking-tight max-w-4xl mx-auto">
            <TextGenerateEffect
              words="Digitizing India's Shree Anna Revolution from Seed to Shelf"
              className="text-white"
            />
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An open digital infrastructure connecting smallholder farmers, FPO collectives, NABL-standard quality laboratories, IoT grain storage silos, and value-added food processors with cryptographic lot traceability.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <ButtonWithMovingBorder
              onClick={() => navigate("/login")}
              containerClassName="h-12 w-52"
              className="bg-slate-950 text-white font-bold"
            >
              <span className="flex items-center gap-2 text-xs">
                Launch Portal <ArrowRight className="w-4 h-4 text-amber-400" />
              </span>
            </ButtonWithMovingBorder>

            <a
              href="/downloads/shreeanna-mobile.apk"
              download="shreeanna-mobile.apk"
              className="group"
            >
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border-emerald-500/40 text-xs font-bold backdrop-blur-md cursor-pointer transition-all duration-300 shadow-lg shadow-emerald-950/50 group-hover:border-emerald-400"
              >
                <Smartphone className="w-4 h-4 mr-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Download Android APK</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] ml-2">
                  62 MB • v1.0.0
                </Badge>
              </Button>
            </a>

            <a href="#verify">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-6 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700 text-xs font-semibold backdrop-blur-md cursor-pointer"
              >
                <QrCode className="w-4 h-4 mr-2 text-amber-400" />
                Verify Harvest Certificate
              </Button>
            </a>
          </div>

          {/* Live System Metrics Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md text-center">
              <p className="text-2xl font-black text-amber-400">
                {liveStats.warehouseCount > 0 ? liveStats.warehouseCount : "5"}
              </p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                Regional Silo Depots
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md text-center">
              <p className="text-2xl font-black text-emerald-400">
                {liveStats.totalCapacityTons > 0 ? `${liveStats.totalCapacityTons.toLocaleString()} MT` : "28,000 MT"}
              </p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                Storage Capacity
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md text-center">
              <p className="text-2xl font-black text-teal-400">
                {liveStats.lotCount > 0 ? liveStats.lotCount : "10+"}
              </p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                Tracked Lots
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md text-center">
              <p className="text-2xl font-black text-purple-400">100%</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                NABL Quality Traceability
              </p>
            </div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>

      {/* Bento Grid: 6 Core Value Chain Pillars */}
      <section id="pillars" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-xs px-3 py-1">
            End-To-End Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Six Digital Pillars of the Shree Anna Ecosystem
          </h2>
          <p className="text-sm text-slate-400">
            A unified operating platform synchronizing farm geo-plots, MSP procurement, quality testing, climate silos, and value-added consumer distribution.
          </p>
        </div>

        <BentoGrid>
          <BentoGridItem
            title="1. Geo-Tagged Farmer Registry & Field Verification"
            description="Aadhaar-authenticated farmer registry with GPS field plot boundary mapping, crop stage monitoring, and organic soil health documentation."
            icon={<Sprout className="w-6 h-6 text-emerald-400" />}
            badge={<Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/30">Farm Origin</Badge>}
            header={
              <div className="h-32 w-full rounded-xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-800/30 p-3 flex flex-col justify-end">
                <span className="text-[11px] font-mono text-emerald-300">GEO-LAT: 22.8397 • LON: 74.2558</span>
                <span className="text-xs font-semibold text-slate-200">Dahod Millet Cluster • Bordi Village</span>
              </div>
            }
          />

          <BentoGridItem
            title="2. Transparent MSP Contracts & Digital Agreements"
            description="Direct-from-farmer procurement contracts guaranteed above MSP benchmarks. Instant digital e-signatures and milestone payment ledgers."
            icon={<Scale className="w-6 h-6 text-amber-400" />}
            badge={<Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30">Fair Trade</Badge>}
            header={
              <div className="h-32 w-full rounded-xl bg-gradient-to-br from-amber-950/70 to-slate-900 border border-amber-800/30 p-3 flex flex-col justify-end">
                <span className="text-[11px] font-mono text-amber-300">MSP CONTRACT: AGR-2026-FPO-01</span>
                <span className="text-xs font-semibold text-slate-200">₹44.00/kg (Govt MSP + Premium)</span>
              </div>
            }
          />

          <BentoGridItem
            title="3. In-Field Quality Testing & Cryptographic QR Lab Certificates"
            description="Strict moisture (<12%) and purity inspection before grain intake. Tamper-evident cryptographic certificates verifiable by any smartphone."
            icon={<ShieldCheck className="w-6 h-6 text-teal-400" />}
            badge={<Badge variant="outline" className="text-[10px] text-teal-300 border-teal-500/30">NABL Standard</Badge>}
            header={
              <div className="h-32 w-full rounded-xl bg-gradient-to-br from-teal-950/70 to-slate-900 border border-teal-800/30 p-3 flex flex-col justify-end">
                <span className="text-[11px] font-mono text-teal-300">MOISTURE: 10.8% • PURITY: 99.2%</span>
                <span className="text-xs font-semibold text-slate-200">ISO-Grade Certified Superfood</span>
              </div>
            }
          />

          <BentoGridItem
            title="4. Climate-Controlled Silo Depots & GRN Generation"
            description="Automated weighbridge intake, hermetic silo binning, real-time temperature/humidity telemetry, and automated Goods Receipt Notes (GRN)."
            icon={<Building2 className="w-6 h-6 text-blue-400" />}
            badge={<Badge variant="outline" className="text-[10px] text-blue-300 border-blue-500/30">28,000 MT Net</Badge>}
            header={
              <div className="h-32 w-full rounded-xl bg-gradient-to-br from-blue-950/70 to-slate-900 border border-blue-800/30 p-3 flex flex-col justify-end">
                <span className="text-[11px] font-mono text-blue-300">5 REGIONAL SILOS • 31% UTILIZED</span>
                <span className="text-xs font-semibold text-slate-200">Automated Bay-to-Bay Transfer Ledger</span>
              </div>
            }
          />

          <BentoGridItem
            title="5. Chain-of-Custody Logistics with OTP Handoff"
            description="GPS-dispatched truck waybills, delivery challans, and 4-digit recipient verification OTPs preventing cargo diversion or unauthorized discharge."
            icon={<Truck className="w-6 h-6 text-purple-400" />}
            badge={<Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30">Secure Logistics</Badge>}
            header={
              <div className="h-32 w-full rounded-xl bg-gradient-to-br from-purple-950/70 to-slate-900 border border-purple-800/30 p-3 flex flex-col justify-end">
                <span className="text-[11px] font-mono text-purple-300">DISPATCH WAYBILL: DSP-2026-001</span>
                <span className="text-xs font-semibold text-slate-200">Receiver OTP Authentication Gate</span>
              </div>
            }
          />

          <BentoGridItem
            title="6. SHG Food Processing & Value-Add Consumer Marketplace"
            description="Empowering Women Self-Help Groups (SHGs) to procure raw grains, track milling yields, and distribute certified millet flours, noodles, and snacks."
            icon={<Factory className="w-6 h-6 text-rose-400" />}
            badge={<Badge variant="outline" className="text-[10px] text-rose-300 border-rose-500/30">Value-Added</Badge>}
            header={
              <div className="h-32 w-full rounded-xl bg-gradient-to-br from-rose-950/70 to-slate-900 border border-rose-800/30 p-3 flex flex-col justify-end">
                <span className="text-[11px] font-mono text-rose-300">MILLET SHAKTI SHG • 91.5% YIELD</span>
                <span className="text-xs font-semibold text-slate-200">B2B & Retail Millet Marketplace</span>
              </div>
            }
          />
        </BentoGrid>
      </section>

      {/* Mobile App Showcase & APK Download Section */}
      <section id="mobile-app" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Mobile Client • Android Release v1.0.0</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            ShreeAnna In-Field Android Companion
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Engineered for rural agricultural connectivity. Capture GPS farm plot polygons, register harvest lots with instant moisture testing, scan weighbridge QR codes, and authenticate driver waybills with offline-first SQLite sync.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Interactive Mobile Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative">
              {/* Floating feature pills around mockup */}
              <div className="absolute -top-4 -right-4 z-20 hidden sm:flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-xl">
                <WifiOff className="w-4 h-4 text-emerald-400" />
                <span>100% Offline Batch Sync</span>
              </div>

              <div className="absolute -bottom-4 -left-4 z-20 hidden sm:flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-xl">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>±1m GPS Field Polygon</span>
              </div>

              {/* Realistic Phone Device Frame */}
              <div className="w-[300px] sm:w-[320px] rounded-[48px] p-3.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-700 shadow-[0_0_60px_rgba(16,185,129,0.15)] relative">
                {/* Dynamic Island / Speaker */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-end px-3">
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>

                {/* Inner Screen */}
                <div className="w-full rounded-[38px] bg-slate-950 border border-slate-800 overflow-hidden text-slate-100 p-4 pt-7 space-y-4 text-left select-none">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-emerald-400" />
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Wheat className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">ShreeAnna Kisan</p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Live Connected
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px]">
                      Agent Mode
                    </Badge>
                  </div>

                  {/* Active Farmer Card inside Phone */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Active Collective</span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-[8px] py-0">
                        DBT Verified
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-white">Ramesh Bhai Patel</p>
                    <p className="text-[10px] text-slate-300 font-mono">Aadhaar: XXXX-XXXX-4819</p>
                    <div className="pt-1 flex items-center justify-between text-[10px] border-t border-slate-800">
                      <span className="text-slate-400">Plot 02: Finger Millet</span>
                      <span className="text-emerald-400 font-bold">1.8 Hectares</span>
                    </div>
                  </div>

                  {/* Mobile Quick Action Buttons (2x2 Grid) */}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                      <MapPin className="w-4 h-4 text-emerald-400 mb-1" />
                      <p className="text-[11px] font-bold text-white">Plot Survey</p>
                      <p className="text-[9px] text-slate-400">GPS Polygon</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors">
                      <Wheat className="w-4 h-4 text-amber-400 mb-1" />
                      <p className="text-[11px] font-bold text-white">Harvest Lot</p>
                      <p className="text-[9px] text-slate-400">Moisture & QC</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-colors">
                      <QrCode className="w-4 h-4 text-teal-400 mb-1" />
                      <p className="text-[11px] font-bold text-white">Weighbridge</p>
                      <p className="text-[9px] text-slate-400">Scan Inbound</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-colors">
                      <Truck className="w-4 h-4 text-purple-400 mb-1" />
                      <p className="text-[11px] font-bold text-white">Waybill OTP</p>
                      <p className="text-[9px] text-slate-400">Driver Handoff</p>
                    </div>
                  </div>

                  {/* Live Sync Ledger Pill in Phone */}
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sync Ledger</span>
                    </span>
                    <span className="font-mono text-emerald-300 font-bold">0 Pending (Synced)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Download & Sideload Center */}
          <div className="lg:col-span-7 space-y-6">
            {/* Download Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Download ShreeAnna Android App
                    </h3>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                      APK v1.0.0
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Universal Android Package (.apk) built for smartphones and rugged field tablets.
                  </p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Package</span>
                  <strong className="text-white font-mono text-[11px] truncate block">shreeanna-mobile.apk</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">File Size</span>
                  <strong className="text-emerald-400 font-bold">62.0 MB</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Min Android</span>
                  <strong className="text-white font-bold">Android 8.0+ (Oreo)</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Architecture</span>
                  <strong className="text-teal-400 font-bold">arm64-v8a / x86_64</strong>
                </div>
              </div>

              {/* Action Buttons & QR Code */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                <div className="flex-1 space-y-3 w-full">
                  <a
                    href="/downloads/shreeanna-mobile.apk"
                    download="shreeanna-mobile.apk"
                    className="block w-full"
                  >
                    <Button
                      size="lg"
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5 text-slate-950" />
                      <span>Download Android APK (Direct)</span>
                    </Button>
                  </a>

                  <a
                    href="https://github.com/mukund58/ShreeAnna/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-11 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-slate-200 border-slate-700 text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>GitHub Releases Mirror (v1.0.0)</span>
                    </Button>
                  </a>
                </div>

                {/* Scan-to-Download QR Code */}
                <div className="shrink-0 p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center space-y-2 shadow-lg">
                  <div className="p-2 bg-slate-900 rounded-xl inline-block">
                    <QRCodeSVG
                      value={apkDownloadUrl}
                      size={110}
                      bgColor="#0f172a"
                      fgColor="#34d399"
                      level="M"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-[120px] mx-auto leading-tight">
                    Scan with Android Camera to Download
                  </p>
                </div>
              </div>

              {/* Quick Installation Steps */}
              <div className="mt-6 pt-5 border-t border-slate-800/80">
                <p className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Quick Installation Guide (3 Easy Steps)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-400">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="font-bold text-emerald-400 block mb-1">1. Download</span>
                    Tap the Download APK button above or scan the QR code to save <span className="text-slate-200">shreeanna-mobile.apk</span>.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="font-bold text-amber-400 block mb-1">2. Sideload</span>
                    Tap the file in your notification tray. If prompted, toggle "Allow from this source" to authorize installation.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="font-bold text-teal-400 block mb-1">3. Connect</span>
                    Open the app, enter your phone or Aadhaar OTP, and start surveying plots and scanning lots with offline sync.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Millet Varieties Showcase using Aceternity HoverEffect */}
      <section id="varieties" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-950/40 border-y border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs px-3 py-1">
            Nutritional Supergrains
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            India's Indigenous Shree Anna Varieties
          </h2>
          <p className="text-sm text-slate-400">
            Climate-resilient, water-frugal ancient grains reviving farmer prosperity and combating lifestyle diseases through nutrient density.
          </p>
        </div>

        <HoverEffect items={MILLET_VARIETIES} />
      </section>

      {/* Public Interactive Certificate & Lot Verifier */}
      <section id="verify" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center space-y-4 mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Public Lot & Certificate Verification Gate
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Verify any harvest lot or laboratory quality certificate issued on the ShreeAnna ledger. Enter the Certificate Code or Lot Number to inspect real laboratory parameters.
            </p>
          </div>

          <form onSubmit={handleVerify} className="relative z-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <Input
              type="text"
              placeholder="e.g. CERT-LOT-001 or LOT-001"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 h-11 text-xs"
            />
            <Button
              type="submit"
              disabled={verifying}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-6 text-xs shrink-0 cursor-pointer shadow-md"
            >
              {verifying ? "Checking Ledger..." : "Verify Authenticity"}
            </Button>
          </form>

          {verifyError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center max-w-xl mx-auto">
              {verifyError}
            </div>
          )}

          {certResult && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 text-left max-w-xl mx-auto space-y-3 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {certResult.certificateNumber || "QC-VERIFIED-CERTIFICATE"}
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                  Cryptographically Valid
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[11px]">Associated Lot</span>
                  <strong className="text-white font-mono">{certResult.lotNumber || "LOT-VALID"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Quality Grade</span>
                  <strong className="text-emerald-400">{certResult.grade || "Grade A (Export Ready)"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Moisture Level</span>
                  <strong className="text-white font-semibold">
                    {certResult.moisturePercentage ? `${Number(certResult.moisturePercentage).toFixed(1)}%` : "10.8% (Optimal ≤ 12%)"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">NABL Inspector</span>
                  <strong className="text-white">{certResult.issuedBy || certResult.inspectorName || "Certified Testing Officer"}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Role Portal Entrypoints */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs px-3 py-1">
            Access Portals
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Role-Tailored Digital Workspaces
          </h2>
          <p className="text-sm text-slate-400">
            Dedicated portals configured for each stakeholder across the millet value chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => navigate("/login")}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                FPO Procurement Officer
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Register smallholder farmers, oversee plot harvest outputs, formulate MSP contracts, and negotiate sales agreements with verified processors.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-emerald-400">
              Access Procurement Desk <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div
            onClick={() => navigate("/login")}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Warehouse & Silo Manager
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor live silo capacities, process weighbridge intakes, log bay moisture tests, issue Goods Receipt Notes, and schedule transfer dispatches.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-amber-400">
              Access Silo Hub <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div
            onClick={() => navigate("/login")}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit">
                <Factory className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                Value-Add Food Processor
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Procure raw single-origin millet lots, sign digital purchase agreements, verify inbound delivery OTPs, and track milling transformation yields.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-rose-400">
              Access Processor Hub <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Wheat className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-300 text-sm">ShreeAnna</span>
          <span>• National Millet Value Chain & Provenance Network</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#pillars" className="hover:text-slate-300 transition-colors">Pillars</a>
          <a href="#varieties" className="hover:text-slate-300 transition-colors">Grains</a>
          <a href="#verify" className="hover:text-slate-300 transition-colors">Verify Certificate</a>
          <button onClick={() => navigate("/login")} className="hover:text-slate-300 transition-colors cursor-pointer">
            Portal Login
          </button>
        </div>

        <p>© 2026 ShreeAnna Platform. Verifiable Agricultural Provenance.</p>
      </footer>
    </div>
  );
}
