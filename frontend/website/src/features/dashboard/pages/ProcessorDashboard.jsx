import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CreditCard,
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
  Key,
  Copy,
  Check,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "../components/StatCard";
import { purchaseRequestsApi, lotsApi } from "@/services/api";

export default function ProcessorDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedOtp, setCopiedOtp] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await purchaseRequestsApi.getAll().catch(() => []);
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load processor dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics from live requests
  const activeRequestsCount = requests.filter((r) => r.status !== "REJECTED").length;
  const agreementProposedReq = requests.find((r) => r.status === "AGREEMENT_PROPOSED");
  const inTransitReq = requests.find((r) => r.status === "PAID" || r.status === "DELIVERED" || r.shipmentStatus === "IN_TRANSIT");

  const totalRawProcuredKg = requests
    .filter((r) => r.status === "PAID" || r.status === "DELIVERED" || r.status === "ACCEPTED")
    .reduce((acc, r) => acc + (r.agreedQuantityKg || r.requestedQuantityKg || 0), 0);

  const totalContractValue = requests
    .filter((r) => r.totalValue)
    .reduce((acc, r) => acc + r.totalValue, 0);

  const estimatedYieldKg = Math.round(totalRawProcuredKg * 0.9);

  const handleCopyOtp = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Processor Enterprise Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-[11px] font-semibold text-emerald-200">
              <Building2 className="w-3.5 h-3.5" /> Mandya Agro-Processing Cluster • SHG Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Millet Shakti SHG <Sparkles className="w-5 h-5 text-amber-300" />
            </h1>
            <p className="text-xs text-emerald-100/80 max-w-xl">
              Value-Added Millet Processing Facility. Manage raw grain procurement from FPOs, production batch yields, delivery OTPs, and finished consumer products.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => navigate("/available-lots")}
              className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs h-9 px-4 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Warehouse className="w-3.5 h-3.5" /> Browse Raw Lots
            </Button>
            <Button
              onClick={() => navigate("/marketplace/create")}
              variant="outline"
              className="border-emerald-400/60 text-white hover:bg-emerald-800/60 font-bold text-xs h-9 px-4 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Product
            </Button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-8 -bottom-12 w-56 h-56 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-40 h-40 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />
      </div>

      {/* Action Required Alert Banner (Agreement Proposed) */}
      {agreementProposedReq && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                Purchase Agreement Ready for Review ({agreementProposedReq.agreementId || "PPA-2026-004"})
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Mandya FPO has proposed a contract for <strong>{agreementProposedReq.agreedQuantityKg?.toLocaleString()} kg</strong> of {agreementProposedReq.milletType} at <strong>₹{agreementProposedReq.sellingPricePerKg?.toFixed(2)}/kg</strong> (Total: ₹{agreementProposedReq.totalValue?.toLocaleString("en-IN")}). Advance payment is required to dispatch goods.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/purchase-payment/${agreementProposedReq.agreementId || agreementProposedReq.id}`)}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-9 px-4 shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" /> Review &amp; Complete Payment
          </Button>
        </div>
      )}

      {/* Top 4 Key Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Procured Raw Millets"
          value={`${totalRawProcuredKg.toLocaleString()} kg`}
          trendText="Verified FPO Lots"
          trendColor="emerald"
          icon={Package}
          iconBgClass="bg-emerald-100/80"
          iconColorClass="text-emerald-700"
        />

        <StatCard
          title="Purchase Contracts"
          value={`${activeRequestsCount} Active`}
          trendText={agreementProposedReq ? "1 Action Needed" : "All Processed"}
          trendColor={agreementProposedReq ? "red" : "emerald"}
          icon={FileCheck}
          iconBgClass="bg-blue-100/80"
          iconColorClass="text-blue-700"
        />

        <StatCard
          title="Active Logistics Dispatch"
          value={inTransitReq ? "1 In Transit" : "0 Dispatches"}
          trendText={inTransitReq ? (inTransitReq.deliveryOtp ? `OTP: ${inTransitReq.deliveryOtp}` : "In Transit") : "No active loads"}
          trendColor="emerald"
          icon={Truck}
          iconBgClass="bg-amber-100/80"
          iconColorClass="text-amber-700"
        />

        <StatCard
          title="Finished Goods Yield"
          value={estimatedYieldKg > 0 ? `${estimatedYieldKg.toLocaleString()} kg` : "0 kg"}
          trendText={totalRawProcuredKg > 0 ? "Estimated 90% Milling Yield" : "No processed batches"}
          trendColor={totalRawProcuredKg > 0 ? "emerald" : "slate"}
          icon={TrendingUp}
          iconBgClass="bg-purple-100/80"
          iconColorClass="text-purple-700"
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase Requests & Negotiation Queue */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-700" /> Raw Millet Purchase Requests
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Track procurement negotiations with FPOs and legal purchase agreements.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/purchase-requests")}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50 h-8"
              >
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.slice(0, 4).map((req) => {
                  const isProposed = req.status === "AGREEMENT_PROPOSED";
                  const isPaid = req.status === "PAID" || req.status === "DELIVERED";

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
                          <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            {req.lotId}
                          </span>
                          <Badge
                            className={`text-[10px] font-bold ${
                              isProposed
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : isPaid
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : req.status === "UNDER_NEGOTIATION"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : req.status === "REJECTED"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {req.status?.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {req.milletType} — {req.requestedQuantityKg?.toLocaleString()} kg @ ₹{req.indicativePricePerKg?.toFixed(2)}/kg
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Producer: {req.fpoName} • Submitted {new Date(req.submittedDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isProposed ? (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/purchase-payment/${req.agreementId || req.id}`)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-8 px-3 shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5 mr-1" /> Agree &amp; Pay
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

          {/* Value Addition & Production Batches (Milling Queue) */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" /> Value Addition &amp; Processing Batches
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Track raw millet conversion into flour, baked cookies, and packaged food items.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/marketplace/create")}
                className="text-xs font-bold h-8 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Convert Inventory
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5">
              {/* Batch 1 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                      BATCH: PI-2026-001
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                      Yield: 90%
                    </Badge>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Raw Source: LOT-2026-004</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Raw Input</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">500 kg Pearl Millet</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Output Product</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">450 kg Millet Flour</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Processing Loss</span>
                    <span className="font-medium text-slate-500">50 kg (10%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800 text-slate-500">
                  <span>Product: Premium Pearl Millet Flour (1kg Pouches)</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Market Value: ₹81,000</span>
                </div>
              </div>

              {/* Batch 2 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                      BATCH: PI-2026-002
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                      Yield: 93.3%
                    </Badge>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Raw Source: LOT-2026-008</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Raw Input</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">300 kg Finger Millet</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Output Product</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">280 kg Ragi Cookies</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Processing Loss</span>
                    <span className="font-medium text-slate-500">20 kg (6.7%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800 text-slate-500">
                  <span>Product: Handmade Ragi &amp; Jaggery Cookies (250g Box)</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Market Value: ₹1,34,400</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col on lg) */}
        <div className="space-y-6">
          {/* Live In-Transit Driver & OTP Tracking Card */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-700" /> Active Delivery Dispatch
                </CardTitle>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                  EN ROUTE
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Official delivery challan issued for warehouse dispatch.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              {/* Delivery OTP Box */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5" /> Recipient Verification OTP
                </div>
                {inTransitReq?.deliveryOtp ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-2xl font-black tracking-widest text-emerald-900 dark:text-emerald-200 bg-white dark:bg-slate-900 px-4 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                      {inTransitReq.deliveryOtp}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopyOtp(inTransitReq.deliveryOtp)}
                      className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                      title="Copy OTP"
                    >
                      {copiedOtp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ) : (
                  <p className="font-mono text-sm text-slate-500 py-1">Generated upon dispatch</p>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Provide this verification OTP to the driver upon unloading inspection.
                </p>
              </div>

              {/* Driver & Shipment Details */}
              <div className="space-y-2 text-slate-600 dark:text-slate-400 text-xs">
                <div className="flex justify-between">
                  <span>Dispatch Code</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {inTransitReq?.dispatchCode || inTransitReq?.id?.slice(0, 8) || "None active"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Challan</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {inTransitReq?.deliveryChallanNumber || "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Driver</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {inTransitReq?.driverName || "Pending Assignment"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicle Number</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {inTransitReq?.vehicleNumber || "Pending Vehicle"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cargo</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {inTransitReq
                      ? `${(inTransitReq.agreedQuantityKg || inTransitReq.requestedQuantityKg || 0).toLocaleString()} kg ${inTransitReq.milletType || "Millet"}`
                      : "No active cargo"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => inTransitReq?.shipmentId ? navigate(`/logistics/${inTransitReq.shipmentId}`) : navigate("/purchase-requests")}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-9 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" /> View Shipment &amp; Challan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Raw Material Inventory by Variety */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-emerald-700" /> Facility Raw Grain Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span>Pearl Millet (Bajra)</span>
                  <span className="font-bold text-slate-900 dark:text-white">1,250 kg</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: "65%" }} />
                </div>
                <span className="text-[10px] text-slate-400">Origin: Mandya FPO Central Silo</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span>Finger Millet (Ragi)</span>
                  <span className="font-bold text-slate-900 dark:text-white">800 kg</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "45%" }} />
                </div>
                <span className="text-[10px] text-slate-400">Origin: Hassan FPO Warehouse</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span>Foxtail Millet (Kangni)</span>
                  <span className="font-bold text-slate-900 dark:text-white">500 kg</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: "28%" }} />
                </div>
                <span className="text-[10px] text-slate-400">Origin: Mysore Agro Hub</span>
              </div>
            </CardContent>
          </Card>

          {/* Consumer Marketplace Products Card */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-700" /> Consumer Products
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/marketplace")}
                className="text-xs font-bold text-emerald-800 h-7 px-2"
              >
                Store <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Pearl Millet Flour</p>
                  <p className="text-[10px] text-slate-400">450 kg in stock • ₹180 / kg</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Certified
                </Badge>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Handmade Ragi Cookies</p>
                  <p className="text-[10px] text-slate-400">320 boxes • ₹120 / 250g</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
