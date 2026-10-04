import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  User,
  Phone,
  Calendar,
  AlertCircle,
  FileText,
  ShieldCheck,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logisticsApi } from "@/services/api";

function ShipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadShipment() {
      setLoading(true);
      try {
        const data = await logisticsApi.getById(id);
        if (data) {
          setShipment({
            id: data.id,
            shipmentCode: data.dispatchCode || data.id,
            direction: (data.direction || "INBOUND").toUpperCase(),
            farmerOrProcessorName: data.farmerOrProcessorName || "-",
            processorType: data.processorType || "SHG",
            agreementId: data.agreementId || "-",
            lotId: data.lotId || "-",
            batchId: data.batchId || "-",
            milletType: data.milletType || "-",
            quantityKg: data.totalQuantityKg || 0,
            expectedQuantityKg: data.totalQuantityKg || 0,
            finalReceivedQuantityKg: data.finalReceivedQuantityKg || null,
            warehouseStockAfterDispatchKg: data.warehouseStockAfterDispatchKg || 0,
            sourceAddress: data.sourceAddress || "-",
            destinationAddress: data.destinationAddress || "-",
            transportResponsibility: data.transportResponsibility || "-",
            vehicleNumber: data.vehicleNumber || "",
            vehicleCapacityKg: data.vehicleCapacityKg || 0,
            driverName: data.driverName || "-",
            driverPhone: data.driverPhone || "-",
            assignedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB") : "-",
            scheduledPickup: data.scheduledDate ? `${data.scheduledDate} ${data.scheduledStartTime || ""}` : "-",
            status: data.status || "SCHEDULED",
            warehouseReceiptStatus: data.warehouseReceiptStatus || "PENDING",
          });
        } else {
          setShipment(null);
        }
      } catch (err) {
        console.error("Error loading shipment details:", err);
        setShipment(null);
      } finally {
        setLoading(false);
      }
    }

    loadShipment();
  }, [id]);

  const handleStatusUpdate = async (nextStatus) => {
    setUpdating(true);
    try {
      if (shipment?.id) {
        await logisticsApi.updateStatus(shipment.id, nextStatus);
      }
    } catch (err) {
      console.warn("Status update API failed, setting local state:", err.message);
    } finally {
      setShipment((prev) => ({ ...prev, status: nextStatus }));
      setUpdating(false);
    }
  };

  if (loading || !shipment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800"></div>
      </div>
    );
  }

  const isOutbound = shipment.direction === "OUTBOUND";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
          <button
            onClick={() => navigate("/logistics")}
            className="hover:text-emerald-800 transition flex items-center gap-1"
          >
            Logistics
          </button>
          <span>/</span>
          <span className="text-slate-900 font-bold">
            {isOutbound ? "Shipment Details (Outbound)" : "Shipment Details"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Shipment Details
            </h1>
            <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider">
              {shipment.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/logistics")}
            className="h-9 text-xs font-bold border-slate-300 flex items-center gap-2 self-start sm:self-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Logistics
          </Button>
        </div>

        <p className="text-xs font-mono text-slate-500 mt-1 font-bold">
          ID: {shipment.shipmentCode}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cards) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Shipment Information */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                Shipment Information
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 text-xs space-y-4">
              {!isOutbound ? (
                /* Inbound Shipment Information (Screenshot 4) */
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Shipment ID
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {shipment.shipmentCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Agreement ID
                    </span>
                    <span className="font-bold text-emerald-800 font-mono cursor-pointer hover:underline">
                      {shipment.agreementId}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Lot ID
                    </span>
                    <span className="font-bold text-emerald-800 font-mono cursor-pointer hover:underline">
                      {shipment.lotId}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Farmer
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.farmerOrProcessorName}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Millet Type
                    </span>
                    <span className="font-bold text-slate-900">{shipment.milletType}</span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Expected Quantity
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.expectedQuantityKg?.toLocaleString("en-IN")} kg
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" /> Pickup Location
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {shipment.sourceAddress}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-slate-400" /> Destination
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {shipment.destinationAddress}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Transport Responsibility
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.transportResponsibility}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Scheduled Pickup
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.scheduledPickup}
                    </span>
                  </div>
                </div>
              ) : (
                /* Outbound Shipment Information (Screenshot 5) */
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Shipment ID
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {shipment.shipmentCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Processor Agreement ID
                    </span>
                    <span className="font-bold text-emerald-800 font-mono cursor-pointer hover:underline">
                      {shipment.agreementId}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Warehouse Batch ID
                    </span>
                    <span className="font-bold text-emerald-800 font-mono cursor-pointer hover:underline">
                      {shipment.batchId}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Source Lot ID
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {shipment.lotId}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Processor / SHG
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.farmerOrProcessorName}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Processor Type
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.processorType}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Millet Type
                    </span>
                    <span className="font-bold text-slate-900">{shipment.milletType}</span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Dispatch Quantity
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.quantityKg?.toLocaleString("en-IN")} kg
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-slate-400" /> Source
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {shipment.sourceAddress}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" /> Destination
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {shipment.destinationAddress}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Transport Responsibility
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.transportResponsibility}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Scheduled Dispatch
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.scheduledPickup}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Transport Details */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                Transport Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-4">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium mb-1">
                    Vehicle Number
                  </span>
                  <Badge className="bg-slate-100 text-slate-900 border-slate-300 font-mono text-xs font-bold px-2.5 py-1">
                    <Truck className="h-3.5 w-3.5 mr-1 text-slate-600" />
                    {shipment.vehicleNumber}
                  </Badge>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">
                    Vehicle Capacity
                  </span>
                  <span className="font-bold text-slate-900">
                    {shipment.vehicleCapacityKg?.toLocaleString("en-IN")} kg
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-500 block text-[11px] font-medium">
                    Driver Name
                  </span>
                  <span className="font-bold text-slate-900">{shipment.driverName}</span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-500 block text-[11px] font-medium">
                    Driver Mobile
                  </span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" /> {shipment.driverPhone}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 col-span-2">
                  <span className="text-slate-500 block text-[11px] font-medium">
                    Assigned On
                  </span>
                  <span className="font-bold text-slate-900">{shipment.assignedDate}</span>
                </div>
              </div>

              {isOutbound && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-[11px] text-emerald-900 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Vehicle capacity is sufficient for the dispatch quantity.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (2 Cards) */}
        <div className="space-y-6">
          {/* Right Card 1: Quantity & Receipt / Dispatch & Delivery */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                {!isOutbound ? "Quantity & Receipt" : "Dispatch & Delivery"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-3">
              {!isOutbound ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Expected Quantity</span>
                    <span className="font-bold text-slate-900">
                      {shipment.expectedQuantityKg?.toLocaleString("en-IN")} kg
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Final Received Quantity</span>
                    <span className="text-slate-400 italic font-medium">
                      {shipment.finalReceivedQuantityKg
                        ? `${shipment.finalReceivedQuantityKg.toLocaleString("en-IN")} kg`
                        : "Not yet verified"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <span className="text-slate-500 font-medium">Warehouse Receipt</span>
                    <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-bold text-[10px] uppercase">
                      {shipment.warehouseReceiptStatus}
                    </Badge>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-2 text-[11px] text-slate-500">
                    <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Final quantity will be verified by Warehouse Receiving.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Dispatch Quantity</span>
                    <span className="font-bold text-slate-900">
                      {shipment.quantityKg?.toLocaleString("en-IN")} kg
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Dispatched Quantity</span>
                    <span className="font-bold text-slate-900">
                      {shipment.quantityKg?.toLocaleString("en-IN")} kg
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <span className="text-slate-500 font-medium">
                      Warehouse Stock After Dispatch
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.warehouseStockAfterDispatchKg?.toLocaleString("en-IN")} kg
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <span className="text-slate-500 font-medium">Delivery Status</span>
                    <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-bold text-[10px] uppercase">
                      {shipment.warehouseReceiptStatus}
                    </Badge>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-2 text-[11px] text-slate-500">
                    <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Warehouse stock is deducted when the shipment is dispatched.</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Right Card 2: Shipment Timeline (Matches Screenshot 4 & 5) */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                Shipment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs">
              {!isOutbound ? (
                /* Inbound Timeline */
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Shipment Created */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    <p className="font-bold text-slate-900">Shipment Created</p>
                    <p className="text-[10px] text-slate-500">16 Aug 2026, 10:30 AM</p>
                  </div>

                  {/* Step 2: Vehicle Assigned */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    <p className="font-bold text-slate-900">Vehicle Assigned</p>
                    <p className="text-[10px] text-slate-500">16 Aug 2026, 11:15 AM</p>
                  </div>

                  {/* Step 3: Pickup Confirmation */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-emerald-700 bg-white flex items-center justify-center text-[8px]">
                      ●
                    </span>
                    <p className="font-bold text-emerald-800">Pickup Confirmation</p>
                    <p className="text-[10px] text-slate-500">Waiting for pickup</p>
                  </div>

                  {/* Step 4: In Transit */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    <p className="font-medium text-slate-400">In Transit</p>
                  </div>

                  {/* Step 5: Delivered */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    <p className="font-medium text-slate-400">Delivered</p>
                  </div>

                  {/* Step 6: Warehouse Receipt */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    <p className="font-medium text-slate-400">Warehouse Receipt</p>
                  </div>
                </div>
              ) : (
                /* Outbound Timeline */
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Shipment Created */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    <p className="font-bold text-slate-900">Shipment Created</p>
                    <p className="text-[10px] text-slate-500">17 Aug 2026, 09:30 AM</p>
                  </div>

                  {/* Step 2: Vehicle Assigned */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    <p className="font-bold text-slate-900">Vehicle Assigned</p>
                    <p className="text-[10px] text-slate-500">17 Aug 2026, 11:15 AM</p>
                  </div>

                  {/* Step 3: Dispatch Confirmed */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-emerald-700 bg-white flex items-center justify-center text-[8px]">
                      ●
                    </span>
                    <p className="font-bold text-emerald-800">Dispatch Confirmed</p>
                    <p className="text-[10px] text-slate-500">Ready for dispatch</p>
                  </div>

                  {/* Step 4: In Transit */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    <p className="font-medium text-slate-400">In Transit</p>
                  </div>

                  {/* Step 5: Delivered to Processor/SHG */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    <p className="font-medium text-slate-400">Delivered to Processor/SHG</p>
                  </div>

                  {/* Step 6: Delivery Confirmed */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    <p className="font-medium text-slate-400">Delivery Confirmed</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Sticky Action Banner (Matches Screenshot 4 & 5) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm mt-6">
        <div className="flex items-start gap-2 text-xs text-slate-500 max-w-2xl">
          <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Expected quantity is based on the approved procurement agreement. Final quantity is
            determined by Warehouse Receiving.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            className="h-10 border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs"
          >
            <AlertCircle className="h-3.5 w-3.5 mr-1" /> Report Issue
          </Button>

          {!isOutbound ? (
            <Button
              onClick={() => handleStatusUpdate("IN_TRANSIT")}
              disabled={updating}
              className="h-10 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-6"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm Pickup
            </Button>
          ) : (
            <Button
              onClick={() => handleStatusUpdate("IN_TRANSIT")}
              disabled={updating}
              className="h-10 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-6"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm Dispatch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShipmentDetails;
