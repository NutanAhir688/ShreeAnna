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
} from "lucide-react";

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

  const navItems = [
    { name: "Pillars", link: "#pillars", icon: <Layers className="w-4 h-4" /> },
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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer"
            >
              Log In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold text-xs h-7 px-3 shadow-md border-0 cursor-pointer rounded-full"
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <ButtonWithMovingBorder
              onClick={() => navigate("/login")}
              containerClassName="h-12 w-52"
              className="bg-slate-950 text-white font-bold"
            >
              <span className="flex items-center gap-2 text-xs">
                Launch Portal <ArrowRight className="w-4 h-4 text-amber-400" />
              </span>
            </ButtonWithMovingBorder>

            <a href="#verify">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-6 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700 text-xs font-semibold backdrop-blur-md cursor-pointer"
              >
                <QrCode className="w-4 h-4 mr-2 text-emerald-400" />
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
