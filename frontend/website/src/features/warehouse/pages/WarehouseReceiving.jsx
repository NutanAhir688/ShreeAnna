import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Package,
  Truck,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  Info,
  Clock,
  IndianRupee,
  Filter,
  MoreVertical,
  Layers,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AllocateLotCard from "../components/AllocateLotCard";
import DeliveryChallanModal from "@/features/logistics/components/DeliveryChallanModal";
import { logisticsApi, warehousesApi, lotsApi } from "@/services/api";

export default function WarehouseReceiving() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [receivingQueue, setReceivingQueue] = useState([]);
  const [shipment, setShipment] = useState(null);

  // Form State for Receipt Details verification view
  const [actualQuantity, setActualQuantity] = useState("");
  const [condition, setCondition] = useState("Good");
  const [receivingNotes, setReceivingNotes] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedBin, setSelectedBin] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState(null);

  const [challanModalOpen, setChallanModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receiptConfirmed, setReceiptConfirmed] = useState(false);
  const [confirmedReceiptData, setConfirmedReceiptData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Load Queue data or Single Shipment details from API
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dispatchesData, lotsData] = await Promise.all([
          logisticsApi.getAll().catch(() => []),
          lotsApi.getAll().catch(() => []),
        ]);

        const dispatchesList = Array.isArray(dispatchesData) ? dispatchesData : [];
        const lotsList = Array.isArray(lotsData) ? lotsData : [];

        // Build receiving queue strictly from live API database records
        const queueMapped = dispatchesList.map((d, index) => {
          const matchingLot = lotsList.find(
            (l) =>
              l.lotNumber === d.lotId ||
              l.id?.toString() === d.lotId?.toString() ||
              (d.lotId && l.lotNumber && d.lotId.includes(l.lotNumber)) ||
              (d.agreementId && l.lotNumber && d.agreementId.includes(l.lotNumber))
          );

          const expectedKg = d.totalQuantityKg || d.expectedQuantityKg || 0;
          const isPassed = !(d.status || "").toUpperCase().includes("FAIL") && !(matchingLot?.qualityStatus || "").toUpperCase().includes("FAIL");
          const receiptCode = `WR-2026-${(index + 1).toString().padStart(3, "0")}`;
          const lotPrice = Number(matchingLot?.offeredPricePerKg || matchingLot?.pricePerKg || d.unitPrice || d.offeredPricePerKg || 35);

          return {
            id: d.id,
            receiptCode,
            dispatchCode: d.dispatchCode || d.id,
            lotId: d.lotId || "-",
            farmerName: d.farmerOrProcessorName || matchingLot?.farmerName || "-",
            milletType: d.milletType || matchingLot?.milletType || matchingLot?.farmCrop || "-",
            certifiedQty: expectedKg,
            actualReceivedQty: d.finalReceivedQuantityKg || expectedKg,
            grade: matchingLot?.grade || d.grade || "Grade A",
            qualityStatus: isPassed ? "PASSED" : "FAILED",
            expectedDate: d.scheduledDate
              ? new Date(d.scheduledDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-",
            status: d.status || "IN_TRANSIT",
            warehouseName: d.warehouseName || "-",
            unitPrice: lotPrice,
          };
        });

        setReceivingQueue(queueMapped);

        // If ID passed, load single shipment details
        if (id) {
          const single = dispatchesList.find((d) => d.id?.toString() === id.toString()) || (await logisticsApi.getById(id).catch(() => null));
          if (single) {
            let matchingLot = lotsList.find(
              (l) =>
                l.lotNumber === single.lotId ||
                l.id?.toString() === single.lotId?.toString() ||
                (single.lotId && l.lotNumber && single.lotId.includes(l.lotNumber)) ||
                (single.agreementId && l.lotNumber && single.agreementId.includes(l.lotNumber))
            );

            if (!matchingLot && single.lotId) {
              matchingLot = await lotsApi.getById(single.lotId).catch(() => null);
            }

            const lotPrice = Number(
              single.unitPrice ||
              single.offeredPricePerKg ||
              single.pricePerKg ||
              matchingLot?.offeredPricePerKg ||
              matchingLot?.pricePerKg ||
              matchingLot?.ratePerKg ||
              matchingLot?.agreedPrice ||
              35
            );

            const enrichedShipment = {
              ...single,
              unitPrice: lotPrice,
              farmerOrProcessorName: single.farmerOrProcessorName || matchingLot?.farmerName || "-",
              milletType: single.milletType || matchingLot?.milletType || matchingLot?.farmCrop || "-",
              grade: single.grade || matchingLot?.grade || "-",
            };

            setShipment(enrichedShipment);
            const expected = single.totalQuantityKg || single.expectedQuantityKg || 0;
            setActualQuantity(single.finalReceivedQuantityKg ? single.finalReceivedQuantityKg.toString() : expected.toString());
            if (single.warehouseName) setSelectedWarehouse(single.warehouseName);
          }
        }
      } catch (err) {
        console.error("Error loading warehouse receiving data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // KPI Card calculations strictly from live queue
  const pendingCount = useMemo(() => {
    return receivingQueue.filter((q) => q.qualityStatus === "PASSED" && q.status !== "COMPLETED" && q.status !== "DELIVERED").length;
  }, [receivingQueue]);

  const todayReceiptsCount = useMemo(() => {
    return receivingQueue.filter((q) => q.status === "DELIVERED" || q.status === "COMPLETED" || q.status === "PROCESSING").length;
  }, [receivingQueue]);

  const receivedTodayKg = useMemo(() => {
    return receivingQueue
      .filter((q) => q.status === "DELIVERED" || q.status === "COMPLETED" || q.status === "PROCESSING")
      .reduce((sum, item) => sum + (item.actualReceivedQty || item.certifiedQty || 0), 0);
  }, [receivingQueue]);

  const exceptionsCount = useMemo(() => {
    return receivingQueue.filter((q) => q.qualityStatus === "FAILED" || q.status === "REJECTED").length;
  }, [receivingQueue]);

  const expectedQty = shipment?.totalQuantityKg || shipment?.expectedQuantityKg || 0;
  const actualQtyNum = Number(actualQuantity) || 0;
  const variance = actualQtyNum - expectedQty;
  const hasDiscrepancy = variance !== 0;

  const handleConfirmReceipt = async (isDraft = false) => {
    if (hasDiscrepancy && !receivingNotes.trim() && !isDraft) {
      setErrorMsg("Receiving notes are mandatory when a quantity discrepancy is detected.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        dispatchId: shipment?.id || id || "00000000-0000-0000-0000-000000000000",
        actualReceivedQuantityKg: actualQtyNum,
        conditionOnArrival: condition,
        receivingNotes: receivingNotes,
        storageZone: selectedZone,
        storageBin: selectedBin,
        isDraft,
      };

      const res = await warehousesApi.createReceipt(payload);
      setConfirmedReceiptData(res);
      setReceiptConfirmed(!isDraft);
      if (isDraft) {
        alert("Receipt saved as draft.");
      }
    } catch (err) {
      console.error("Failed to confirm warehouse receipt:", err);
      setErrorMsg(err.message || "Failed to confirm warehouse receipt.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-800"></div>
        <span>Loading warehouse receiving queue...</span>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW A: Receiving Queue Page (When no shipment ID is selected)
  // --------------------------------------------------------------------------
  if (!id && !shipment) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Warehouse Receiving
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Receive quality-certified millet lots into warehouse inventory.
            </p>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-slate-200/90 bg-white shadow-2xs p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                PENDING RECEIPTS
              </p>
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3">{pendingCount}</p>
          </Card>

          <Card className="border border-slate-200/90 bg-white shadow-2xs p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                TODAY'S RECEIPTS
              </p>
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3">{todayReceiptsCount}</p>
          </Card>

          <Card className="border border-slate-200/90 bg-white shadow-2xs p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                RECEIVED TODAY
              </p>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3 flex items-baseline gap-1">
              {receivedTodayKg.toLocaleString("en-IN")}{" "}
              <span className="text-sm font-semibold text-slate-500">kg</span>
            </p>
          </Card>

          <Card className="border border-slate-200/90 bg-white shadow-2xs p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                EXCEPTIONS
              </p>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-3xl font-black text-red-600 mt-3">{exceptionsCount}</p>
          </Card>
        </div>

        {/* Receiving Queue Table Card */}
        <Card className="border border-slate-200/90 bg-white shadow-xs rounded-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">
              Receiving Queue
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Receipt ID</th>
                  <th className="p-3.5">Lot ID</th>
                  <th className="p-3.5">Farmer</th>
                  <th className="p-3.5">Millet Type</th>
                  <th className="p-3.5 text-right">Certified Qty</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Expected</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receivingQueue.length > 0 ? (
                  receivingQueue.map((item) => (
                    <tr key={item.id || item.receiptCode} className="hover:bg-slate-50/80 transition">
                      <td
                        className="p-3.5 font-mono font-bold text-emerald-800 cursor-pointer hover:underline"
                        onClick={() => navigate(`/warehouses/receiving/${item.id}`)}
                      >
                        {item.receiptCode}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {item.lotId}
                      </td>

                      <td className="p-3.5 font-bold text-slate-900">
                        {item.farmerName}
                      </td>

                      <td className="p-3.5 font-medium text-slate-700">
                        {item.milletType}
                      </td>

                      <td className="p-3.5 text-right font-bold text-slate-900">
                        {item.certifiedQty?.toLocaleString("en-IN")} kg
                      </td>

                      <td className="p-3.5">
                        <Badge className={`text-[10px] font-extrabold px-2 py-0.5 border ${
                          item.grade === "Grade A"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : item.grade === "Grade B"
                            ? "bg-purple-100 text-purple-800 border-purple-300"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}>
                          {item.grade}
                        </Badge>
                      </td>

                      <td className="p-3.5">
                        {item.qualityStatus === "PASSED" ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-extrabold">
                            PASSED
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-300 text-[10px] font-extrabold">
                            FAILED
                          </Badge>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-600 font-medium">
                        {item.expectedDate}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        {item.qualityStatus === "PASSED" ? (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/warehouses/receiving/${item.id}`)}
                            className={`h-8 font-bold text-xs ${
                              item.status === "PROCESSING"
                                ? "bg-emerald-800 hover:bg-emerald-900 text-white"
                                : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            {item.status === "PROCESSING" ? "Processing" : "Receive"}
                          </Button>
                        ) : (
                          <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                            REJECTED — CANNOT RECEIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 font-medium">
                      No dispatches currently in receiving queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW B: Receipt Details Verification View (When a shipment ID is loaded)
  // --------------------------------------------------------------------------
  const unitPrice = Number(shipment?.unitPrice || shipment?.offeredPricePerKg || shipment?.pricePerKg || 35);
  const totalPayableAmount = actualQtyNum * unitPrice;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/warehouses/receiving")}
            className="h-9 text-xs font-bold border-slate-300"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Queue
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Warehouse Verification & Receipt
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Lot #{shipment?.lotId || "-"} · Shipment #{shipment?.dispatchCode || shipment?.id}
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Delivery Challan Document Modal */}
      <DeliveryChallanModal
        open={challanModalOpen}
        onClose={() => setChallanModalOpen(false)}
        shipment={shipment}
      />

      {/* Main Grid: Left Receiving Details & Right Receipt Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Delivery Handoff Summary */}
          <Card className="border border-slate-200 bg-white shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-700" />
                Delivery Handoff Summary
              </CardTitle>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
                {shipment?.status || "DELIVERED"}
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Shipment ID</p>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    {shipment?.dispatchCode || shipment?.shipmentCode || shipment?.id || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Lot ID</p>
                  <p className="font-mono font-bold text-emerald-700 mt-0.5">
                    {shipment?.lotId || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Farmer / Supplier</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900">
                      {shipment?.farmerOrProcessorName || shipment?.farmerName || "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Millet Type & Grade</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-bold text-slate-900">
                      {shipment?.milletType || "-"}
                    </span>
                    {shipment?.grade && (
                      <Badge variant="secondary" className="text-[10px] font-bold bg-slate-100 text-slate-700 border-slate-300">
                        {shipment.grade}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Expected Quantity</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {expectedQty.toLocaleString("en-IN")} kg
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-slate-500 font-medium text-[11px]">Destination</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selectedWarehouse || shipment?.destinationAddress || shipment?.warehouseName || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Delivery Date</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {shipment?.scheduledDate || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Driver</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {shipment?.driverName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-[11px]">Vehicle</p>
                  <span className="inline-block bg-slate-100 font-mono font-bold text-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-200 mt-0.5">
                    {shipment?.vehicleNumber || "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Receiving Verification */}
          <Card className="border border-slate-200 bg-white shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                Receiving Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Expected Box */}
                <div className="flex-1 w-full bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-center md:text-left">
                  <p className="text-[11px] font-bold text-slate-500">Expected Quantity</p>
                  <p className="text-lg font-black text-slate-900 mt-1">
                    {expectedQty.toLocaleString("en-IN")} <span className="text-xs font-medium text-slate-500">kg</span>
                  </p>
                </div>

                <ArrowRight className="h-5 w-5 text-slate-400 shrink-0 hidden md:block" />

                {/* Actual Received Input Box */}
                <div className="flex-1 w-full space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    Actual Received Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={actualQuantity}
                      onChange={(e) => setActualQuantity(e.target.value)}
                      placeholder="Enter received kg"
                      className="bg-white border-slate-300 font-black text-base h-11 pr-10 text-slate-900 focus:border-emerald-600 focus:ring-emerald-600/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Discrepancy Warning Banner */}
              {hasDiscrepancy && (
                <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-900 font-medium">
                    <span className="font-bold">Discrepancy Detected:</span> Received quantity differs from the approved quantity by{" "}
                    <span className="font-bold underline">{Math.abs(variance)} kg</span>. Please record the reason for the discrepancy below.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Condition & Storage */}
          <Card className="border border-slate-200 bg-white shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-700" />
                Condition & Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5 text-xs">
              {/* Radio Group for Condition */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800">Condition on Arrival</label>
                <div className="flex flex-wrap items-center gap-4">
                  {["Good", "Damaged", "Wet", "Other"].map((cond) => (
                    <label key={cond} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="condition"
                        value={cond}
                        checked={condition === cond}
                        onChange={(e) => setCondition(e.target.value)}
                        className="h-4 w-4 text-emerald-800 focus:ring-emerald-600 border-slate-300"
                      />
                      <span>{cond}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes Textarea */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>
                    Receiving Notes{" "}
                    {hasDiscrepancy && (
                      <span className="text-red-600 font-bold">(Mandatory due to discrepancy)</span>
                    )}
                  </span>
                </label>
                <Textarea
                  rows={3}
                  value={receivingNotes}
                  onChange={(e) => setReceivingNotes(e.target.value)}
                  placeholder="Record condition details or reason for quantity discrepancy..."
                  className={`bg-white text-xs resize-none ${
                    hasDiscrepancy && !receivingNotes.trim()
                      ? "border-red-500 focus:ring-red-200"
                      : "border-slate-300"
                  }`}
                />
              </div>

              {/* Storage Allocation Inner Box */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                  Storage Allocation
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Warehouse</label>
                    <div className="mt-1 p-2 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800">
                      {selectedWarehouse || shipment?.destinationAddress || shipment?.warehouseName || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Storage Zone</label>
                    <Select value={selectedZone} onValueChange={setSelectedZone}>
                      <SelectTrigger className="bg-white border-slate-200 h-9 text-xs font-semibold mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Zone A">Zone A</SelectItem>
                        <SelectItem value="Zone B">Zone B</SelectItem>
                        <SelectItem value="Zone C">Zone C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Storage Bin</label>
                    <Select value={selectedBin} onValueChange={setSelectedBin}>
                      <SelectTrigger className="bg-white border-slate-200 h-9 text-xs font-semibold mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BIN-A12">BIN-A12</SelectItem>
                        <SelectItem value="BIN-A13">BIN-A13</SelectItem>
                        <SelectItem value="BIN-B04">BIN-B04</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Documentation */}
          <Card className="border border-slate-200 bg-white shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-700" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Delivery Challan */}
                <div className="border border-dashed border-slate-300 p-4 rounded-xl text-center bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                  <FileText className="h-6 w-6 text-emerald-700" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Delivery Challan</p>
                    <p className="text-[10px] text-slate-500 font-medium">Generated on Driver Assignment</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs font-bold mt-1"
                    onClick={() => setChallanModalOpen(true)}
                  >
                    View Document
                  </Button>
                </div>

                {/* Receiving Photo */}
                <div className="border border-dashed border-slate-300 p-4 rounded-xl text-center bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                  <Upload className="h-6 w-6 text-slate-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Receiving Photo</p>
                    <p className="text-[10px] text-slate-500 font-medium">Capture lot condition</p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setReceiptPhoto(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                    />
                    <div className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold mt-1">
                      {receiptPhoto ? "Photo Attached ✓" : "Upload Photo"}
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Allocation Lot Card */}
          <div className="pt-2 space-y-3">
            {receiptConfirmed && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-bold flex items-center justify-between">
                <span>✓ Warehouse Receipt Confirmed! Stock is ready to allocate into warehouse storage sections.</span>
              </div>
            )}
            <AllocateLotCard
              initialLotId={shipment?.lotId || shipment?.lotNumber || ""}
              initialWarehouseId={shipment?.warehouseId || ""}
              initialQuantity={actualQuantity}
              onSuccess={() => {
                alert("Stock lot allocated successfully!");
              }}
            />
          </div>
        </div>

        {/* Right Sidebar: Receipt Preview & Farmer Mobile Bill Summary */}
        <div className="space-y-4">
          <Card className="border border-slate-200 bg-white shadow-xs rounded-xl overflow-hidden sticky top-6">
            {/* Header banner */}
            <div className="bg-emerald-900 text-white p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold tracking-tight">Receipt Preview</h3>
                <span className="text-[10px] font-bold bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/50">
                  {receiptConfirmed ? "Confirmed state" : "Draft state"}
                </span>
              </div>
            </div>

            <CardContent className="p-4 space-y-4 text-xs">
              {/* Receipt ID Box */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Receipt ID</p>
                <p className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {confirmedReceiptData?.receiptNumber || (shipment ? `WR-${shipment.id?.toString().slice(0, 8).toUpperCase()}` : "-")}
                </p>
              </div>

              {/* Source Shipment */}
              <div>
                <p className="text-slate-500 font-medium text-[11px]">Source Shipment</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {shipment?.dispatchCode || shipment?.shipmentCode || shipment?.id || "-"}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="font-bold text-slate-900 text-xs">Measurement Summary</p>
                <div className="space-y-1.5 text-slate-700 font-medium">
                  <div className="flex justify-between">
                    <span>Expected:</span>
                    <span className="font-bold">{expectedQty.toLocaleString("en-IN")} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Received:</span>
                    <span className="font-bold">{actualQtyNum.toLocaleString("en-IN")} kg</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                    <span>Variance:</span>
                    <span className={variance < 0 ? "text-red-600" : "text-emerald-700"}>
                      {variance < 0 ? `${variance} kg SHORT` : variance > 0 ? `+${variance} kg SURPLUS` : "0 kg MATCH"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px]">Receipt Status:</span>
                    <span className={`font-black text-[10px] px-2 py-0.5 rounded ${
                      hasDiscrepancy ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {hasDiscrepancy ? "RECEIVED WITH VARIANCE" : "FULLY RECEIVED"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Procurement Bill Preview Box */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <IndianRupee className="h-4 w-4" />
                    Farmer Generated Bill
                  </span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                    Awaiting Account Approval
                  </span>
                </div>
                <div className="text-[11px] space-y-1 text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Received Net Weight:</span>
                    <span className="font-bold text-white">{actualQtyNum.toLocaleString("en-IN")} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agreed Rate / kg:</span>
                    <span className="font-bold text-white">₹{unitPrice} / kg</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1 text-xs font-bold text-emerald-400">
                    <span>Final Payable Bill:</span>
                    <span>₹{totalPayableAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-medium leading-tight pt-0.5">
                  📲 Synced to Farmer Mobile Journey. Final price credited upon FPO Account Officer approval.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <Button
                  onClick={() => handleConfirmReceipt(false)}
                  disabled={submitting}
                  className="w-full h-11 bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? "Confirming..." : "Confirm Warehouse Receipt"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleConfirmReceipt(true)}
                  disabled={submitting}
                  className="w-full h-9 border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Save as Draft
                </Button>
              </div>

              {/* Info Notice Box */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-start gap-2 text-[11px] text-emerald-900 font-medium">
                <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Confirming this receipt will add <strong className="font-bold">{actualQtyNum.toLocaleString("en-IN")} kg</strong> to warehouse inventory and trigger farmer bill generation for account approval.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
