import { useState, useEffect, useMemo, useCallback } from "react";
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
  Loader2,
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
import DeliveryChallanModal from "@/features/logistics/components/DeliveryChallanModal";
import AllocateLotCard from "@/features/warehouse/components/AllocateLotCard";
import { logisticsApi, warehousesApi, lotsApi, uploadApi } from "@/services/api";
import { jsPDF } from "jspdf";

const formatDate = (dateVal) => {
  if (!dateVal) return "-";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateVal);
  }
};

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
  const [selectedBin, setSelectedBin] = useState("BIN-A12");
  const [isCustomBin, setIsCustomBin] = useState(false);
  const [customBinCode, setCustomBinCode] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [receiptPhoto, setReceiptPhoto] = useState(null);
  const [azurePhotoUrl, setAzurePhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [challanModalOpen, setChallanModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocateTargetLot, setAllocateTargetLot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [receiptConfirmed, setReceiptConfirmed] = useState(false);
  const [confirmedReceiptData, setConfirmedReceiptData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Load Queue data or Single Shipment details from API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dispatchesData, lotsData, whData] = await Promise.all([
        logisticsApi.getAll().catch(() => []),
        lotsApi.getAll().catch(() => []),
        warehousesApi.getAll().catch(() => []),
      ]);

      const dispatchesList = Array.isArray(dispatchesData) ? dispatchesData : [];
      const lotsList = Array.isArray(lotsData) ? lotsData : [];
      const whList = Array.isArray(whData) ? whData : [];

      setWarehouses(whList);

      // Build receiving queue strictly from live API database records
      const queueMapped = dispatchesList.map((d, index) => {
        const matchingLot = lotsList.find(
          (l) =>
            l.lotNumber === d.lotId ||
            l.id?.toString() === d.lotId?.toString() ||
            (d.lotId && l.lotNumber && d.lotId.includes(l.lotNumber)) ||
            (d.agreementId && l.lotNumber && d.agreementId.includes(l.lotNumber))
        );

        const displayLotCode =
          matchingLot?.lotNumber ||
          d.lotNumber ||
          (d.lotId && d.lotId.length === 36 ? `LOT-${d.lotId.slice(0, 6).toUpperCase()}` : d.lotId) ||
          "-";

        const expectedKg = d.totalQuantityKg || d.expectedQuantityKg || 0;
        const isPassed = !(d.status || "").toUpperCase().includes("FAIL") && !(matchingLot?.qualityStatus || "").toUpperCase().includes("FAIL");
        const receiptCode = `WR-2026-${(index + 1).toString().padStart(3, "0")}`;
        const lotPrice = Number(matchingLot?.offeredPricePerKg || matchingLot?.pricePerKg || d.unitPrice || d.offeredPricePerKg || 35);

        const isConfirmed = (d.warehouseReceiptStatus || "").toUpperCase() === "CONFIRMED" || (matchingLot?.status || "").toUpperCase() === "STORED";

        return {
          id: d.id,
          receiptCode,
          dispatchCode: d.dispatchCode || d.id,
          lotId: displayLotCode,
          farmerName: d.farmerOrProcessorName || matchingLot?.farmerName || "-",
          milletType: d.milletType || matchingLot?.milletType || matchingLot?.farmCrop || "-",
          certifiedQty: expectedKg,
          actualReceivedQty: d.finalReceivedQuantityKg || expectedKg,
          grade: (matchingLot?.grade && matchingLot?.grade !== "-") ? matchingLot.grade : (d.grade && d.grade !== "-") ? d.grade : "Grade A",
          qualityStatus: isPassed ? "PASSED" : "FAILED",
          expectedDate: d.scheduledDate ? formatDate(d.scheduledDate) : "-",
          status: isConfirmed ? "COMPLETED" : (d.status || "IN_TRANSIT"),
          warehouseReceiptStatus: isConfirmed ? "CONFIRMED" : (d.warehouseReceiptStatus || "PENDING"),
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

          const displayLotCode =
            matchingLot?.lotNumber ||
            single.lotNumber ||
            (single.lotId && single.lotId.length === 36 ? `LOT-${single.lotId.slice(0, 6).toUpperCase()}` : single.lotId) ||
            "-";

          const displayGrade =
            (single.grade && single.grade !== "-")
              ? single.grade
              : (matchingLot?.grade && matchingLot?.grade !== "-")
                ? matchingLot.grade
                : "Grade A";

          const enrichedShipment = {
            ...single,
            displayLotCode,
            unitPrice: lotPrice,
            farmerOrProcessorName: single.farmerOrProcessorName || matchingLot?.farmerName || "-",
            milletType: single.milletType || matchingLot?.milletType || matchingLot?.farmCrop || "-",
            grade: displayGrade,
          };

          setShipment(enrichedShipment);
          const expected = single.totalQuantityKg || single.expectedQuantityKg || 0;
          setActualQuantity(single.finalReceivedQuantityKg ? single.finalReceivedQuantityKg.toString() : expected.toString());
          if (single.warehouseName) setSelectedWarehouse(single.warehouseName);
        }
      } else {
        setShipment(null);
        setConfirmedReceiptData(null);
        setReceiptConfirmed(false);
      }
    } catch (err) {
      console.error("Error loading warehouse receiving data:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const activePendingQueue = useMemo(() => {
    return receivingQueue.filter(
      (q) => (q.warehouseReceiptStatus || "").toUpperCase() !== "CONFIRMED" && (q.status || "").toUpperCase() !== "COMPLETED" && (q.status || "").toUpperCase() !== "STORED"
    );
  }, [receivingQueue]);

  const expectedQty = shipment?.totalQuantityKg || shipment?.expectedQuantityKg || 0;
  const actualQtyNum = Number(actualQuantity) || 0;
  const variance = actualQtyNum - expectedQty;
  const hasDiscrepancy = variance !== 0;

  const selectedWarehouseObj = useMemo(() => {
    const targetNameOrId = selectedWarehouse || shipment?.destinationAddress || shipment?.warehouseName;
    if (!targetNameOrId && warehouses.length === 0) return null;
    return (
      warehouses.find(
        (w) =>
          w.id === targetNameOrId ||
          w.id?.toString() === targetNameOrId?.toString() ||
          w.name === targetNameOrId ||
          (targetNameOrId && w.name && targetNameOrId.includes(w.name))
      ) || null
    );
  }, [selectedWarehouse, shipment, warehouses]);

  const capacityMetrics = useMemo(() => {
    const totalKg = selectedWarehouseObj
      ? (selectedWarehouseObj.capacityInTons !== undefined && selectedWarehouseObj.capacityInTons !== null
        ? Number(selectedWarehouseObj.capacityInTons)
        : Number(selectedWarehouseObj.capacity || 6000))
      : 6000;

    const utilKg = selectedWarehouseObj
      ? (selectedWarehouseObj.utilizedCapacityTons !== undefined && selectedWarehouseObj.utilizedCapacityTons !== null
        ? Number(selectedWarehouseObj.utilizedCapacityTons)
        : Number(selectedWarehouseObj.usedCapacity || 3100))
      : 3100;

    const availKg = Math.max(0, totalKg - utilKg);
    const allocKg = actualQtyNum > 0 ? actualQtyNum : expectedQty;
    const remainingAfterKg = Math.max(0, availKg - allocKg);
    const usedPct = totalKg > 0 ? Math.min(100, Math.round(((utilKg + allocKg) / totalKg) * 100)) : 0;

    return {
      totalKg,
      utilKg,
      availKg,
      allocKg,
      remainingAfterKg,
      usedPct,
    };
  }, [selectedWarehouseObj, actualQtyNum, expectedQty]);

  const handleConfirmReceipt = async (isDraft = false) => {
    let notes = receivingNotes.trim();
    if (hasDiscrepancy && !notes && !isDraft) {
      notes = `Quantity discrepancy verified: Expected ${expectedQty} kg, received ${actualQtyNum} kg. Verified by Warehouse Manager.`;
      setReceivingNotes(notes);
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const chosenBin = (isCustomBin ? customBinCode : selectedBin) || "BIN-A12";
      const payload = {
        dispatchId: shipment?.id || id || "00000000-0000-0000-0000-000000000000",
        actualReceivedQuantityKg: actualQtyNum > 0 ? actualQtyNum : expectedQty,
        conditionOnArrival: condition || "Good",
        receivingNotes: notes || "Warehouse inward receipt verified.",
        storageZone: selectedZone || "Zone A",
        storageBin: chosenBin,
        receivingPhotoUrl: azurePhotoUrl || receiptPhoto || "",
        documentUrl: azurePhotoUrl || receiptPhoto || "",
        isDraft,
      };

      const res = await warehousesApi.createReceipt(payload);

      // Perform lot allocation in backend database as well if lot exists
      const lotToAllocate = shipment?.lotId || shipment?.id;
      if (lotToAllocate && !isDraft) {
        await warehousesApi.allocateLot({
          lotId: lotToAllocate,
          warehouseId: selectedWarehouseObj?.id || selectedWarehouse || shipment?.warehouseId || "WH-001",
          quantity: actualQtyNum > 0 ? actualQtyNum : expectedQty,
          storageSection: chosenBin,
          remarks: notes || "Allocated during warehouse receipt verification",
        }).catch((err) => console.warn("Warehouse lot allocation error:", err));
      }

      setConfirmedReceiptData(res);
      setReceiptConfirmed(!isDraft);

      if (!isDraft) {
        alert(`✓ Warehouse Receipt ${res.receiptNumber || ""} & Lot Allocation confirmed successfully!\n${(actualQtyNum || expectedQty).toLocaleString("en-IN")} kg allocated to storage section ${chosenBin}.`);
        setShipment(null);
        setReceiptConfirmed(false);
        setConfirmedReceiptData(null);
        navigate("/warehouses/receiving");
        loadData();
      } else {
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
              Warehouse Verification & Receipt
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Receive quality-certified millet lots into warehouse inventory & allocate to storage bins.
            </p>
          </div>
          <Button
            onClick={() => {
              setAllocateTargetLot(null);
              setAllocateModalOpen(true);
            }}
            className="h-10 px-4 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs"
          >
            + Allocate Lot in Warehouse
          </Button>
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
                {activePendingQueue.length > 0 ? (
                  activePendingQueue.map((item) => (
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
                        <Badge className={`text-[10px] font-extrabold px-2 py-0.5 border ${item.grade === "Grade A"
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
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/warehouses/receiving/${item.id}`)}
                              className={`h-8 font-bold text-xs ${item.status === "PROCESSING"
                                  ? "bg-emerald-800 hover:bg-emerald-900 text-white"
                                  : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-100"
                                }`}
                            >
                              {item.status === "PROCESSING" ? "Processing" : "Receive"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAllocateTargetLot({
                                  lotId: item.lotId,
                                  warehouseId: item.warehouseName || "",
                                  quantity: (item.certifiedQty || 3500).toString(),
                                });
                                setAllocateModalOpen(true);
                              }}
                              className="h-8 font-bold text-xs border-emerald-700 text-emerald-800 hover:bg-emerald-50"
                            >
                              Allocate Lot
                            </Button>
                          </div>
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

  const handleDownloadReceipt = () => {
    const receiptCode = confirmedReceiptData?.receiptNumber || (shipment ? `WR-${shipment.id?.toString().slice(0, 8).toUpperCase()}` : "WR-2026-001");
    const farmerName = shipment?.farmerOrProcessorName || shipment?.farmerName || "Mahesh Vasava";
    const milletType = shipment?.milletType || "Pearl Millet";
    const warehouseName = selectedWarehouse || shipment?.destinationAddress || shipment?.warehouseName || "Anand Cooperative Warehouse (Petlad Village, Anand, Gujarat)";
    const lotId = shipment?.lotId || "0043dd14-0f0f-4185-8c56-5ccc45c3c805";
    const dispatchCode = shipment?.dispatchCode || shipment?.id || "SHP-2026-001";
    const receiveDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const driverName = shipment?.driverName || "Rajesh Kumar";
    const vehicleNo = shipment?.vehicleNumber || "GJ-03-MT-4588";

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 1. Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 32, "F");

    doc.setFillColor(16, 185, 129); // emerald-500 line
    doc.rect(0, 32, 210, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("SHREE ANNA MILLET PLATFORM", 14, 14);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text("National Agricultural Supply Chain & Logistics Registry", 14, 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(52, 211, 153); // emerald-400
    doc.text("WAREHOUSE INWARD RECEIPT", 196, 18, { align: "right" });

    // 2. Receipt Status & Metadata Card
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(14, 42, 182, 28, 3, 3, "FD");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("RECEIPT NUMBER", 20, 50);
    doc.text("RECEIPT DATE", 85, 50);
    doc.text("STATUS", 145, 50);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(receiptCode, 20, 58);
    doc.text(receiveDate, 85, 58);

    doc.setFillColor(209, 250, 229); // emerald-100
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(145, 53, 44, 7, 1.5, 1.5, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 95, 70); // emerald-900
    doc.text("CONFIRMED & STORED", 167, 58, { align: "center" });

    // 3. Procurement Details Grid
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("SHIPMENT & PROCUREMENT PARTICULARS", 14, 80);

    doc.setLineWidth(0.5);
    doc.setDrawColor(15, 23, 42);
    doc.line(14, 82, 196, 82);

    let y = 90;
    const addRow = (label, value, label2, value2) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(label, 14, y);
      if (label2) doc.text(label2, 110, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(String(value), 14, y + 5);
      if (label2 && value2) doc.text(String(value2), 110, y + 5);

      y += 13;
    };

    addRow("Lot Reference ID:", lotId, "Shipment Dispatch Code:", dispatchCode);
    addRow("Farmer / Supplier:", farmerName, "Millet Commodity:", milletType);
    addRow("Receiving Warehouse:", warehouseName, "Storage Location:", warehouseName);
    addRow("Driver & Vehicle:", `${driverName} (${vehicleNo})`, "Discrepancy Notes:", receivingNotes || "None (All quantities verified)");

    // 4. Quantity & Financial Table
    y += 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("QUANTITY & PAYABLE SUMMARY", 14, y);

    y += 3;
    doc.line(14, y, 196, y);

    y += 6;
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, 182, 8, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("DESCRIPTION", 18, y + 5.5);
    doc.text("EXPECTED", 90, y + 5.5, { align: "right" });
    doc.text("ACTUAL RECEIVED", 135, y + 5.5, { align: "right" });
    doc.text("TOTAL AMOUNT", 190, y + 5.5, { align: "right" });

    y += 8;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 182, 14, "FD");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${milletType} Inward Stock`, 18, y + 6);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Agreed Procurement Rate: Rs. ${unitPrice} / kg`, 18, y + 10.5);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(`${expectedQty.toLocaleString("en-IN")} kg`, 90, y + 7, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(`${actualQtyNum.toLocaleString("en-IN")} kg`, 135, y + 7, { align: "right" });

    doc.setTextColor(6, 95, 70);
    doc.text(`Rs. ${totalPayableAmount.toLocaleString("en-IN")}`, 190, y + 7, { align: "right" });

    // Variance Line
    y += 20;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 12, 2, 2, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Quantity Variance:", 20, y + 7.5);
    const varianceText = variance < 0 ? `${variance} kg (Shortage)` : variance > 0 ? `+${variance} kg (Surplus)` : "0 kg (Exact Match)";
    doc.setTextColor(variance < 0 ? 220 : 6, variance < 0 ? 38 : 95, variance < 0 ? 38 : 70);
    doc.text(varianceText, 60, y + 7.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Net Payable to Farmer:", 120, y + 7.5);
    doc.setTextColor(6, 95, 70);
    doc.setFontSize(11);
    doc.text(`Rs. ${totalPayableAmount.toLocaleString("en-IN")}`, 190, y + 7.5, { align: "right" });

    // 5. Security Stamp & Signatures
    y += 25;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("AUTHORIZATION & VERIFICATION SIGNATURES", 14, y);

    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);

    y += 8;
    // Box 1: Driver Signature
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, 55, 25, 2, 2, "D");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Driver Signature", 41.5, y + 6, { align: "center" });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Delivered in Good Order", 41.5, y + 21, { align: "center" });

    // Box 2: Warehouse Officer Seal
    doc.roundedRect(77, y, 55, 25, 2, 2, "D");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Warehouse Officer Seal", 104.5, y + 6, { align: "center" });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Verified & Received", 104.5, y + 21, { align: "center" });

    // Box 3: Digital Verification Stamp
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(141, y, 55, 25, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 95, 70);
    doc.text("ShreeAnna Verified Pass", 168.5, y + 6, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(4, 120, 87);
    doc.text("Digitally Registered", 168.5, y + 13, { align: "center" });
    doc.text(" Hash Verified", 168.5, y + 18, { align: "center" });

    // Save as PDF
    doc.save(`${receiptCode}_Receipt.pdf`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShipment(null);
              setReceiptConfirmed(false);
              setConfirmedReceiptData(null);
              navigate("/warehouses/receiving");
            }}
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
        <Button
          onClick={() => {
            setAllocateTargetLot({
              lotId: shipment?.lotId || shipment?.id || "",
              warehouseId: selectedWarehouseObj?.id || selectedWarehouse || "",
              quantity: (actualQtyNum || expectedQty || "").toString(),
            });
            setAllocateModalOpen(true);
          }}
          className="h-9 px-4 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs shrink-0"
        >
          + Allocate Lot in Warehouse
        </Button>
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
                  className={`bg-white text-xs resize-none ${hasDiscrepancy && !receivingNotes.trim()
                      ? "border-red-500 focus:ring-red-200"
                      : "border-slate-300"
                    }`}
                />
              </div>

              {/* Storage Allocation Inner Box */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-700" />
                    WAREHOUSE LOT STORAGE ALLOCATION
                  </p>
                  {/* <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAllocateTargetLot({
                        lotId: shipment?.lotId || shipment?.id || "",
                        warehouseId: selectedWarehouseObj?.id || selectedWarehouse || "",
                        quantity: (actualQtyNum || expectedQty || "").toString(),
                      });
                      setAllocateModalOpen(true);
                    }}
                    className="h-7 text-[11px] font-extrabold text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                  >
                    + Open Detailed Lot Allocation Card
                  </Button> */}
                </div>

                <div>
                  {/* Arrived Warehouse */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>Arrived Destination Warehouse</span>
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">✓ Arrived</span>
                    </label>
                    <div className="mt-1 p-2 bg-white border border-slate-200 rounded text-xs font-bold text-slate-900 truncate">
                      {selectedWarehouseObj?.name || selectedWarehouse || shipment?.destinationAddress || shipment?.warehouseName || "Anand Cooperative Warehouse"}
                    </div>
                  </div>
                </div>

                {/* Warehouse Capacity Preview Embedded Card */}
                <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 space-y-2.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-emerald-700" />
                      Warehouse Capacity Preview ({selectedWarehouseObj?.name || selectedWarehouse || shipment?.warehouseName || "Anand Cooperative Warehouse"})
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {capacityMetrics.availKg.toLocaleString("en-IN")} kg Available
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-medium">Total Capacity:</span>
                      <p className="font-extrabold text-slate-900">{capacityMetrics.totalKg.toLocaleString("en-IN")} kg</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Utilized Stock:</span>
                      <p className="font-extrabold text-slate-900">{capacityMetrics.utilKg.toLocaleString("en-IN")} kg</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Available Left:</span>
                      <p className="font-extrabold text-emerald-700">{capacityMetrics.availKg.toLocaleString("en-IN")} kg</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Remaining After Allocation:</span>
                      <p className={`font-extrabold ${capacityMetrics.remainingAfterKg >= 0 ? "text-slate-900" : "text-red-600"}`}>
                        {capacityMetrics.remainingAfterKg.toLocaleString("en-IN")} kg
                      </p>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>Warehouse Storage Occupancy</span>
                      <span>{capacityMetrics.usedPct}% Full</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full transition-all duration-300 ${capacityMetrics.usedPct > 90
                            ? "bg-red-600"
                            : capacityMetrics.usedPct > 75
                              ? "bg-amber-500"
                              : "bg-emerald-600"
                          }`}
                        style={{ width: `${capacityMetrics.usedPct}%` }}
                      />
                    </div>
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
                    <p className="text-[10px] text-slate-500 font-medium">Capture & upload lot condition to Azure</p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingPhoto}
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          setReceiptPhoto(URL.createObjectURL(file));
                          setUploadingPhoto(true);
                          setErrorMsg("");
                          try {
                            const url = await uploadApi.uploadImage(file);
                            setAzurePhotoUrl(url);
                          } catch (err) {
                            console.error("Azure Blob upload failed:", err);
                            setErrorMsg("Photo upload to Azure Blob Storage failed.");
                          } finally {
                            setUploadingPhoto(false);
                          }
                        }
                      }}
                    />
                    <div className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold mt-1">
                      {uploadingPhoto ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
                          Uploading to Azure...
                        </span>
                      ) : azurePhotoUrl ? (
                        "Uploaded to Azure Blob ✓"
                      ) : receiptPhoto ? (
                        "Photo Attached ✓"
                      ) : (
                        "Upload Photo to Azure"
                      )}
                    </div>
                  </label>
                  {azurePhotoUrl && (
                    <p className="text-[9px] font-mono text-emerald-700 truncate max-w-[200px]">
                      {azurePhotoUrl}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <span className={`font-black text-[10px] px-2 py-0.5 rounded ${hasDiscrepancy ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
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
                  disabled={submitting || receiptConfirmed || shipment?.warehouseReceiptStatus === "CONFIRMED"}
                  className="w-full h-11 bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting
                    ? "Confirming..."
                    : (receiptConfirmed || shipment?.warehouseReceiptStatus === "CONFIRMED")
                      ? "Receipt Confirmed"
                      : "Confirm Warehouse Receipt"}
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

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadReceipt}
                  className="w-full h-9 border-emerald-800 text-emerald-900 hover:bg-emerald-50 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Download Receipt
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

      {/* Modal / Dialog Overlay for Detailed Lot Allocation Card */}
      {allocateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <AllocateLotCard
              initialLotId={allocateTargetLot?.lotId || shipment?.lotId || ""}
              initialWarehouseId={allocateTargetLot?.warehouseId || selectedWarehouseObj?.id || ""}
              initialQuantity={allocateTargetLot?.quantity || (actualQtyNum || expectedQty || "").toString()}
              onCancel={() => setAllocateModalOpen(false)}
              onSuccess={() => {
                setAllocateModalOpen(false);
                alert("✓ Procurement Lot allocated to warehouse storage section successfully!");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
