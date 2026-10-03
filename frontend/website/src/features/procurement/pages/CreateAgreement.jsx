import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  FileSpreadsheet,
  TrendingUp,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Loader2,
  FileCheck,
  ShieldCheck,
  History,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { agreementsApi, qualityApi } from "@/services/api";

const MSP_RATES = {
  "Finger Millet (Ragi)": 42.90,
  "Pearl Millet (Bajra)": 26.25,
  "Foxtail Millet": 38.50,
  "Sorghum (Jowar)": 31.80,
  "Little Millet": 40.00,
  "Barnyard Millet": 39.00,
};

function CreateAgreement() {
  const navigate = useNavigate();
  const { lotId: paramLotId } = useParams();
  const [searchParams] = useSearchParams();
  const targetLotId = paramLotId || searchParams.get("lotId") || "";

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [selectedLot, setSelectedLot] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);

  // Form state
  const [agreedQty, setAgreedQty] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [logisticsType, setLogisticsType] = useState("pickup");
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [otherAdjustments, setOtherAdjustments] = useState(0);
  const [remarks, setRemarks] = useState("");

  // Load lots from server
  useEffect(() => {
    const fetchLots = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await agreementsApi.getAll();
        const list = Array.isArray(data) ? data : [];
        setLots(list);

        let initial = list.find((l) => l.id === targetLotId);
        if (!initial && list.length > 0) {
          initial = list[0];
        }

        if (initial) {
          applyLot(initial);
        }
      } catch (err) {
        setError(err.message || "Failed to load procurement lots.");
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, [targetLotId]);

  const applyLot = async (lot) => {
    setSelectedLot(lot);
    const msp = MSP_RATES[lot?.milletType] || 0;
    setAgreedQty(lot?.actualQuantityKg || lot?.estimatedQuantityKg || "");
    setUnitPrice(lot?.offeredPricePerKg || msp || "");
    setLogisticsType("pickup");
    setLogisticsCost(0);
    setOtherAdjustments(0);
    setRemarks("");

    if (lot?.id) {
      try {
        const insp = await qualityApi.getByLot(lot.id);
        setInspectionData(insp);
      } catch {
        try {
          const cert = await qualityApi.getCertificate(lot.id);
          setInspectionData(cert);
        } catch {
          setInspectionData(null);
        }
      }
    } else {
      setInspectionData(null);
    }
  };

  const handleLotChange = (val) => {
    const found = lots.find((l) => l.id === val);
    if (found) {
      applyLot(found);
    }
  };

  const currentVersion = useMemo(() => {
    if (!selectedLot) return "v1.0";
    const status = (selectedLot.status || "").toUpperCase();
    const ver = selectedLot.agreementVersion || "v1.0";
    if (status.includes("REJECTED")) {
      if (ver === "v1.0") return "v2.0";
      if (ver === "v2.0") return "v3.0";
      const num = parseInt(ver.replace("v", "").split(".")[0], 10);
      return !isNaN(num) ? `v${num + 1}.0` : "v2.0";
    }
    return ver;
  }, [selectedLot]);

  const pastVersions = useMemo(() => {
    if (!selectedLot) return [];
    const status = (selectedLot.status || "").toUpperCase();
    const ver = selectedLot.agreementVersion || "v1.0";
    let num = 1;
    if (ver.startsWith("v")) {
      const parsed = parseInt(ver.replace("v", "").split(".")[0], 10);
      if (!isNaN(parsed)) num = parsed;
    }
    const list = [];
    for (let i = 1; i <= num; i++) {
      if (status.includes("REJECTED") || i < num) {
        list.push({
          ver: `v${i}.0`,
          price: i === num && selectedLot.offeredPricePerKg ? selectedLot.offeredPricePerKg : (MSP_RATES[selectedLot.milletType] || 38.50),
          qty: selectedLot.agreedQuantityKg || selectedLot.actualQuantityKg || selectedLot.estimatedQuantityKg || 450,
          remarks: selectedLot.negotiationRemarks || "Farmer requested higher unit price and revised commercial terms.",
        });
      }
    }
    return list;
  }, [selectedLot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLot) return;

    setSubmitting(true);
    try {
      await agreementsApi.create(selectedLot.id, {
        agreedQuantityKg: Number(agreedQty) || 0,
        unitPrice: Number(unitPrice) || 0,
        logisticsType,
        logisticsCost: Number(logisticsCost) || 0,
        otherAdjustments: Number(otherAdjustments) || 0,
        remarks,
      });
      navigate("/agreements");
    } catch (err) {
      alert(err.message || "Failed to create procurement agreement.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const subtotal = (Number(agreedQty) || 0) * (Number(unitPrice) || 0);
  const totalLogistics = logisticsType === "pickup" ? (Number(logisticsCost) || 0) : 0;
  const totalAdjustments = Number(otherAdjustments) || 0;
  const netPayable = subtotal + totalLogistics + totalAdjustments;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/agreements")}
          className="text-slate-600 hover:text-slate-900 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agreements
        </Button>

        <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs bg-emerald-100/80 px-3 py-1.5 rounded-full border border-emerald-300">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          ShreeAnna Procurement Contract Generator
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Procurement Negotiation & Commercial Terms
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">
            Farmer Purchase Agreement Formulation
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Define commercial terms, pricing, logistics responsibility, and generate a legally binding contract.
          </p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-3 py-1 font-mono self-start md:self-auto flex items-center gap-1.5">
          <span>STATUS: FORMULATION DRAFT</span>
          <span className="bg-amber-400/30 text-amber-200 px-1.5 py-0.5 rounded text-[10px]">{currentVersion}</span>
        </Badge>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500 font-medium">Loading lot particulars...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/agreements")}>
            Return to Agreements List
          </Button>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Commercial Terms (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200/90 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
                  <CardTitle className="text-base font-bold text-slate-900">Commercial Terms Formulation</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 font-mono">
                  Version {currentVersion.replace('v', '')}
                </Badge>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                
                {/* Lot Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">
                    SELECT PROCUREMENT LOT
                  </label>
                  <Select
                    value={selectedLot?.id || ""}
                    onValueChange={handleLotChange}
                  >
                    <SelectTrigger className="w-full bg-white h-11 border-slate-300 font-medium">
                      <SelectValue placeholder="Choose a procurement lot..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lots.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          Lot #{l.lotNumber || l.id.slice(0, 6)} - {l.farmerName || "Farmer"} ({l.milletType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity & Unit Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                      AGREED QUANTITY (KG)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={agreedQty}
                        onChange={(e) => setAgreedQty(e.target.value)}
                        className="pr-24 font-bold bg-white h-11 text-base"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        / {selectedLot?.estimatedQuantityKg ? `${selectedLot.estimatedQuantityKg.toLocaleString("en-IN")} Max` : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                      UNIT PRICE (₹ / KG)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">₹</span>
                      <Input
                        type="number"
                        step="0.5"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        className="pl-7 font-bold bg-white h-11 text-base"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      Govt MSP Rate: {MSP_RATES[selectedLot?.milletType] ? `₹${MSP_RATES[selectedLot.milletType]}/kg` : "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Logistics Responsibility */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                    LOGISTICS RESPONSIBILITY
                  </label>
                  <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setLogisticsType("pickup")}
                      className={`py-2.5 px-3 text-xs font-bold rounded-lg transition ${
                        logisticsType === "pickup"
                          ? "bg-white text-emerald-900 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      FPO Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogisticsType("delivery")}
                      className={`py-2.5 px-3 text-xs font-bold rounded-lg transition ${
                        logisticsType === "delivery"
                          ? "bg-white text-emerald-900 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Farmer Delivery
                    </button>
                  </div>
                </div>

                {/* Logistics Cost & Other Adjustments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                      LOGISTICS COST (INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                      <Input
                        type="number"
                        value={logisticsCost}
                        onChange={(e) => setLogisticsCost(e.target.value)}
                        disabled={logisticsType !== "pickup"}
                        className="pl-7 bg-white font-semibold disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                      OTHER ADJUSTMENTS (CLEANING/BAGGING)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                      <Input
                        type="number"
                        value={otherAdjustments}
                        onChange={(e) => setOtherAdjustments(e.target.value)}
                        className="pl-7 bg-white font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Negotiation Remarks */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                    NEGOTIATION REMARKS (OPTIONAL)
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter justification for pricing deviation or special contractual terms..."
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Net Payable Banner */}
            <div className="rounded-2xl bg-[#064e3b] p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-emerald-800">
              <div className="space-y-1 text-xs">
                <p className="text-emerald-200">
                  Subtotal ({agreedQty} kg × ₹{unitPrice}) ={" "}
                  <span className="font-semibold text-white">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </p>
                <p className="text-emerald-200">
                  Logistics Cost:{" "}
                  <span className="font-semibold text-white">
                    + ₹{totalLogistics.toLocaleString("en-IN")}
                  </span>
                </p>
                <p className="text-emerald-200">
                  Other Adjustments:{" "}
                  <span className="font-semibold text-white">
                    ₹{totalAdjustments.toLocaleString("en-IN")}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                    NET FARMER PAYABLE
                  </p>
                  <p className="text-3xl font-black text-white">
                    ₹{netPayable.toLocaleString("en-IN")}
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting || !selectedLot}
                  className="bg-white text-emerald-950 hover:bg-emerald-50 font-extrabold shadow-lg h-12 px-6"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <FileCheck className="mr-2 h-5 w-5 text-emerald-800" />
                  )}
                  CREATE AGREEMENT
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Entity Context & History (1 col) */}
          <div className="space-y-6">
            {/* Entity Context Card */}
            <Card className="border-slate-200/90 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" /> Entity Context
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-md">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedLot?.farmerName || "Registered Farmer"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedLot?.farmName ? `Farm: ${selectedLot.farmName}` : "Verified Member Farm"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    LOT IDENTIFIER
                  </p>
                  <div className="p-2.5 rounded-md bg-slate-100 font-mono font-bold text-xs text-slate-800 border border-slate-200">
                    Lot #{selectedLot?.lotNumber || selectedLot?.id?.slice(0, 6)} ({selectedLot?.milletType || "Finger Millet"})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">QUALITY GRADE</p>
                    <p className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {inspectionData?.grade || selectedLot?.grade || "Pending QA"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">MOISTURE</p>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {inspectionData?.moisturePercentage !== null && inspectionData?.moisturePercentage !== undefined
                        ? `${inspectionData.moisturePercentage}%`
                        : (selectedLot?.moisturePercentage ? `${selectedLot.moisturePercentage}%` : "N/A")}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">PURITY / CLEANLINESS</p>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {inspectionData?.purityPercentage !== null && inspectionData?.purityPercentage !== undefined
                        ? `${inspectionData.purityPercentage}%`
                        : (selectedLot?.purityPercentage ? `${selectedLot.purityPercentage}%` : "N/A")}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">GOVT MSP</p>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {MSP_RATES[selectedLot?.milletType] ? `₹${MSP_RATES[selectedLot.milletType]}/kg` : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agreement Version History Card */}
            <Card className="border-slate-200/90 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <History className="h-4 w-4 text-amber-600" /> Version History & Negotiation
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-amber-300 bg-amber-50 text-amber-800 font-bold">
                  {currentVersion} Draft
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {pastVersions.length > 0 ? (
                  pastVersions.map((v) => (
                    <div key={v.ver} className="p-3 rounded-lg bg-red-50/80 border border-red-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-red-900 bg-red-100 px-1.5 py-0.5 rounded text-[10px]">
                          {v.ver} — REJECTED BY FARMER
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Previous Offer</span>
                      </div>
                      <div className="flex justify-between text-slate-800 font-bold pt-1 text-xs">
                        <span>Offered Rate: ₹{v.price}/kg</span>
                        <span>Qty: {v.qty} kg</span>
                      </div>
                      {v.remarks && (
                        <p className="text-[11px] text-slate-600 italic bg-white/90 p-2 rounded border border-red-100 mt-1">
                          "{v.remarks}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    No past rejections. Initial contract version v1.0.
                  </div>
                )}

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span>{currentVersion} Active Formulation</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono">Current Form</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Formulating revised commercial terms for farmer signature & digital consent.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contract Workflow Card */}
            <Card className="border-slate-200/90 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" /> Procurement Contract Lifecycle
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  
                  {/* Step 1 */}
                  <div className="relative">
                    <CheckCircle2 className="absolute -left-6 top-0.5 h-4 w-4 text-emerald-600 bg-white rounded-full" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">Quality Inspection & Grading</p>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Completed</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Grade {inspectionData?.grade || selectedLot?.grade || "A"} rating verified by lab inspector.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <CheckCircle2 className="absolute -left-6 top-0.5 h-4 w-4 text-emerald-600 bg-white rounded-full" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">Commercial Terms Formulation ({currentVersion})</p>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Completed</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Formulated binding contract for Lot #{selectedLot?.lotNumber || selectedLot?.id?.slice(0, 6)}.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    {selectedLot?.status?.toUpperCase().includes("REJECTED") ? (
                      <XCircle className="absolute -left-6 top-0.5 h-4 w-4 text-red-600 bg-white rounded-full" />
                    ) : selectedLot?.status?.toUpperCase().includes("ACCEPTED") ? (
                      <CheckCircle2 className="absolute -left-6 top-0.5 h-4 w-4 text-emerald-600 bg-white rounded-full" />
                    ) : (
                      <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                    )}
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${selectedLot?.status?.toUpperCase().includes("REJECTED") ? "text-red-600" : "text-slate-900"}`}>
                        Farmer Digital Consent & Signature
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        selectedLot?.status?.toUpperCase().includes("REJECTED")
                          ? "bg-red-50 text-red-700 border-red-200"
                          : selectedLot?.status?.toUpperCase().includes("ACCEPTED")
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {selectedLot?.status?.toUpperCase().includes("REJECTED")
                          ? `${selectedLot?.agreementVersion || 'v1.0'} Rejected`
                          : selectedLot?.status?.toUpperCase().includes("ACCEPTED")
                            ? `${currentVersion} Signed`
                            : `${currentVersion} Pending`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedLot?.status?.toUpperCase().includes("REJECTED")
                        ? `Agreement Rejected (${selectedLot?.agreementVersion || 'v1.0'}). Re-negotiating ${currentVersion}.`
                        : selectedLot?.status?.toUpperCase().includes("ACCEPTED")
                          ? `Contract version ${currentVersion} accepted and signed.`
                          : `Contract sent for FPO Officer & Farmer digital signature.`}
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-400">Scheduled Pickup & Logistics</p>
                      <span className="text-[10px] text-slate-400">Next Step</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Logistics team assigned for farmgate pickup.
                    </p>
                  </div>

                  {/* Step 5 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-400">Direct Payment Disbursement</p>
                      <span className="text-[10px] text-slate-400">Final Step</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Funds credited directly to farmer bank account within 48h.
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateAgreement;
