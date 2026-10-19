import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  FileCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Warehouse,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  IndianRupee,
  Users,
  Search,
  ChevronRight,
  Sparkles,
  Layers,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "../components/StatCard";
import { purchaseRequestsApi, lotsApi, agreementsApi, inventoryApi } from "@/services/api";

// Official MSP benchmark reference rates per Kg (INR) published by GOI
const MSP_BENCHMARKS = [
  { millet: "Finger Millet (Ragi)", msp: 42.90, baseFpoRate: 44.00, key: "finger" },
  { millet: "Pearl Millet (Bajra)", msp: 26.25, baseFpoRate: 32.50, key: "pearl" },
  { millet: "Foxtail Millet", msp: 38.50, baseFpoRate: 40.50, key: "foxtail" },
  { millet: "Little Millet", msp: 40.00, baseFpoRate: 42.00, key: "little" },
  { millet: "Proso Millet", msp: 48.00, baseFpoRate: 51.00, key: "proso" },
];

export default function ProcurementOfficerDashboard() {
  const navigate = useNavigate();

  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [lots, setLots] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [inventoryBatches, setInventoryBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [requestsData, lotsData, agreementsData, batchesData] = await Promise.all([
          purchaseRequestsApi.getAll().catch(() => []),
          lotsApi.getAll().catch(() => []),
          agreementsApi.getAll().catch(() => []),
          inventoryApi.getBatches().catch(() => []),
        ]);

        setPurchaseRequests(Array.isArray(requestsData) ? requestsData : []);
        setLots(Array.isArray(lotsData) ? lotsData : []);
        setAgreements(Array.isArray(agreementsData) ? agreementsData : []);
        setInventoryBatches(Array.isArray(batchesData) ? batchesData : []);
      } catch (err) {
        console.error("Failed to load procurement officer dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute Metrics
  const totalLotsCount = lots.length;
  const totalProcuredQtyKg = lots.reduce(
    (acc, l) => acc + (Number(l.actualQuantityKg) || Number(l.estimatedQuantityKg) || 0),
    0
  );

  // Digital contracts: lots that have formulated or accepted agreements
  const digitalContracts = lots.filter(
    (l) =>
      l.status?.toUpperCase().includes("AGREEMENT") ||
      Number(l.offeredPricePerKg) > 0 ||
      Number(l.agreedQuantityKg) > 0 ||
      ["PICKUP", "WAREHOUSE_RECEIVED", "PAYMENT", "COMPLETED"].includes(l.status?.toUpperCase())
  );

  const totalAgreementsValue = digitalContracts.reduce((acc, a) => {
    const qty = Number(a.agreedQuantityKg) || Number(a.actualQuantityKg) || Number(a.estimatedQuantityKg) || 0;
    const price = Number(a.offeredPricePerKg) || 0;
    const base = Number(a.totalValue) || Number(a.netPayable) || (qty * price);
    const logistics = Number(a.logisticsCost) || 0;
    const adjustments = Number(a.otherAdjustments) || 0;
    return acc + base + logistics + adjustments;
  }, 0);

  const pendingProcessorRequests = purchaseRequests.filter(
    (r) => r.status === "REQUESTED" || r.status === "UNDER_NEGOTIATION"
  );
  const proposedAgreementsCount = purchaseRequests.filter(
    (r) => r.status === "AGREEMENT_PROPOSED"
  ).length;

  // Real Warehouse Stock calculation from live inventory batches
  const inStockKg = inventoryBatches
    .filter((b) => b.status === "IN_STOCK")
    .reduce((acc, b) => acc + (Number(b.quantityInKg) || 0), 0);
  const totalWarehouseStockKg = inventoryBatches.reduce(
    (acc, b) => acc + (Number(b.quantityInKg) || 0),
    0
  );
  const displayStockKg = inStockKg > 0 ? inStockKg : totalWarehouseStockKg;

  // Dynamic MSP & Live FPO rates derived from real lots
  const benchmarkRows = MSP_BENCHMARKS.map((m) => {
    const matchingLots = lots.filter(
      (l) =>
        l.milletType &&
        l.milletType.toLowerCase().includes(m.key) &&
        Number(l.offeredPricePerKg) > 0
    );
    const hasRealData = matchingLots.length > 0;
    const avgRealRate = hasRealData
      ? matchingLots.reduce((acc, l) => acc + Number(l.offeredPricePerKg), 0) / matchingLots.length
      : m.baseFpoRate;

    return {
      ...m,
      fpoRate: avgRealRate,
      hasRealData,
      lotsCount: matchingLots.length,
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-800/60 border border-blue-500/40 text-[11px] font-semibold text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" /> FPO Procurement Operations Desk • Officer Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Procurement Operations Hub <Sparkles className="w-5 h-5 text-amber-300" />
            </h1>
            <p className="text-xs text-blue-100/80 max-w-xl">
              Oversee smallholder millet procurement lots, farmer MSP contracts, quality certifications, and processor purchase agreements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => navigate("/agreements/new")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Formulate Farmer Agreement
            </Button>
            <Button
              onClick={() => navigate("/purchase-requests")}
              variant="outline"
              className="border-blue-400/50 text-white hover:bg-blue-900/60 font-bold text-xs h-9 px-4 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 mr-1" /> Processor Requests ({purchaseRequests.length})
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-8 -bottom-12 w-56 h-56 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-40 h-40 rounded-full bg-indigo-400/10 blur-xl pointer-events-none" />
      </div>

      {/* Action Needed Banner: Pending Processor Requests */}
      {pendingProcessorRequests.length > 0 && (
        <div className="rounded-xl border border-blue-300 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200 shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {pendingProcessorRequests.length} Processor Purchase Request{pendingProcessorRequests.length > 1 ? "s" : ""} Awaiting Agreement Formulation
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Processors have requested millet batches. Formulate pricing and propose binding sales agreements.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/purchase-requests")}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-9 px-4 shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            Review &amp; Propose Agreement <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Grain Procured"
          value={`${totalProcuredQtyKg.toLocaleString()} kg`}
          trendText={`${totalLotsCount} Registered Lots`}
          trendColor="emerald"
          icon={Package}
          iconBgClass="bg-emerald-100/80"
          iconColorClass="text-emerald-700"
        />

        <StatCard
          title="Farmer MSP Contracts"
          value={`₹${totalAgreementsValue.toLocaleString("en-IN")}`}
          trendText={`${digitalContracts.length} Digital Contract${digitalContracts.length !== 1 ? "s" : ""}`}
          trendColor={digitalContracts.length > 0 ? "emerald" : "slate"}
          icon={FileCheck}
          iconBgClass="bg-blue-100/80"
          iconColorClass="text-blue-700"
        />

        <StatCard
          title="Processor Sales Requests"
          value={`${purchaseRequests.length} Requests`}
          trendText={proposedAgreementsCount > 0 ? `${proposedAgreementsCount} Agreement Proposed` : "All Clear"}
          trendColor={proposedAgreementsCount > 0 ? "emerald" : "slate"}
          icon={ShoppingBag}
          iconBgClass="bg-purple-100/80"
          iconColorClass="text-purple-700"
        />

        <StatCard
          title="Available Warehouse Stock"
          value={`${displayStockKg.toLocaleString()} kg`}
          trendText={
            inventoryBatches.length > 0
              ? `${inventoryBatches.length} Warehouse Batches`
              : "Ready for Sale / Allocation"
          }
          trendColor={displayStockKg > 0 ? "emerald" : "slate"}
          icon={Warehouse}
          iconBgClass="bg-amber-100/80"
          iconColorClass="text-amber-700"
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Processor Purchase Requests Queue */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-700" /> Processor Purchase Requests &amp; Negotiations
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Raw grain purchase demands from SHG food processors, flour millers, and bakeries.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/purchase-requests")}
                className="text-xs font-bold text-blue-800 hover:text-blue-900 hover:bg-blue-50 h-8"
              >
                View Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchaseRequests.slice(0, 4).map((req) => {
                  const isProposed = req.status === "AGREEMENT_PROPOSED";
                  const isPaid = req.status === "PAID" || req.status === "DELIVERED";
                  const isPending = req.status === "REQUESTED" || req.status === "UNDER_NEGOTIATION";

                  return (
                    <div
                      key={req.id || req.requestCode}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {req.requestCode}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="font-mono text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                            {req.lotId}
                          </span>
                          <Badge
                            className={`text-[10px] font-bold ${
                              isProposed
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : isPaid
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : isPending
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            {req.status?.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          Buyer: <strong>{req.processorName || req.fpoName || "Processor Client"}</strong> — {req.milletType} ({Number(req.requestedQuantityKg || 0).toLocaleString()} kg)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Offered: ₹{Number(req.indicativePricePerKg || 0).toFixed(2)}/kg • {isProposed ? `Agreement: ${req.agreementId || "Proposed"} (₹${Number(req.totalValue || 0).toLocaleString("en-IN")})` : "Pending Agreement Formulation"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isPending ? (
                          <Button
                            size="sm"
                            onClick={() => navigate("/purchase-requests")}
                            className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-8 px-3 shadow-xs"
                          >
                            Propose Agreement
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/purchase-requests")}
                            className="text-xs font-bold h-8 border-slate-200 hover:bg-slate-100"
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Farmer Procurement Lots Queue */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-700" /> Incoming Farmer Procurement Lots
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Harvested grain lots collected from registered farmers across village clusters.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/procurement/lots")}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50 h-8"
              >
                View All Lots <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {lots.length > 0 ? (
                  lots.slice(0, 4).map((lot) => {
                    const qty = lot.actualQuantityKg || lot.estimatedQuantityKg || 0;
                    const price = lot.offeredPricePerKg || 0;

                    return (
                      <div
                        key={lot.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400">
                              {lot.lotNumber || `LOT-${lot.id?.slice(0, 6).toUpperCase()}`}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {lot.farmerName || "Farmer"}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-semibold border-slate-300">
                              {lot.status || "PENDING"}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {lot.milletType || "Millet"} — {qty.toLocaleString()} kg {price > 0 ? `@ ₹${price.toFixed(2)}/kg` : ""}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Farm: {lot.farmName || "Designated Farm"} {lot.assignedInspectorName ? `• Inspector: ${lot.assignedInspectorName}` : ""}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/procurement/lots/${lot.id}`)}
                          className="text-xs font-bold h-8 border-slate-200 hover:bg-slate-100 self-end sm:self-center cursor-pointer"
                        >
                          Lot Details
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No procurement lots recorded.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col on lg) */}
        <div className="space-y-6">
          {/* MSP Benchmarks & Procurement Pricing */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-700" /> MSP Procurement Benchmarks
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Official Government Minimum Support Price vs FPO Purchase Rates.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {benchmarkRows.map((m) => (
                <div key={m.millet} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{m.millet}</p>
                    <p className="text-[10px] text-slate-400">Govt MSP: ₹{m.msp.toFixed(2)} / kg</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{m.fpoRate.toFixed(2)} / kg
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-medium">
                      {m.hasRealData ? `Live FPO (${m.lotsCount} Lot${m.lotsCount !== 1 ? "s" : ""})` : "MSP Guaranteed"}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions & Procurement Links */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-700" /> Quick Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs">
              <Button
                onClick={() => navigate("/agreements")}
                variant="outline"
                className="w-full justify-between h-9 text-xs font-semibold hover:bg-blue-50 hover:text-blue-900 border-slate-200"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Farmer Agreements Portal
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Button>

              <Button
                onClick={() => navigate("/purchase-requests")}
                variant="outline"
                className="w-full justify-between h-9 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-900 border-slate-200"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" /> Processor Purchase Demands
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Button>

              <Button
                onClick={() => navigate("/procurement/lots")}
                variant="outline"
                className="w-full justify-between h-9 text-xs font-semibold hover:bg-purple-50 hover:text-purple-900 border-slate-200"
              >
                <span className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-purple-600" /> Warehouse Inventory Batches
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Button>

              <Button
                onClick={() => navigate("/farmers")}
                variant="outline"
                className="w-full justify-between h-9 text-xs font-semibold hover:bg-slate-100 border-slate-200"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" /> Registered Farmer Directory
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
