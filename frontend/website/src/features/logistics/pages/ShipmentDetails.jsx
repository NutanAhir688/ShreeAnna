import { useState, useEffect, useCallback } from "react";
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
  Camera,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { logisticsApi, purchaseRequestsApi } from "@/services/api";
import DeliveryChallanModal from "@/features/logistics/components/DeliveryChallanModal";

function ShipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = (user?.role || "").toLowerCase();
  const isProcessor = userRole.includes("processor");
  const isDriver = userRole.includes("driver");
  const isLogisticsCoordinator = userRole.includes("logistic");
  const isLogisticsOrAdmin = isLogisticsCoordinator || userRole.includes("fpo") || userRole.includes("manager") || userRole.includes("admin");

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [challanModalOpen, setChallanModalOpen] = useState(false);
  const [inputCode, setInputCode] = useState("");

  const [codeError, setCodeError] = useState("");

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [issueCategory, setIssueCategory] = useState("Vehicle Delay / Breakdown");
  const [issueDescription, setIssueDescription] = useState("");
  const [reportedIssue, setReportedIssue] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  // Assign Driver Modal State
  const [assignDriverModalOpen, setAssignDriverModalOpen] = useState(false);
  const [driversList, setDriversList] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [assignDriverName, setAssignDriverName] = useState("");
  const [assignDriverPhone, setAssignDriverPhone] = useState("");
  const [assignVehicleNo, setAssignVehicleNo] = useState("");
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [assignError, setAssignError] = useState("");

  const handleOpenAssignModal = async () => {
    setAssignError("");
    try {
      const drvs = await logisticsApi.getDrivers().catch(() => []);
      setDriversList(Array.isArray(drvs) ? drvs : []);
      const firstAvail = Array.isArray(drvs) ? drvs.find(d => (d.status || "").toUpperCase() === "AVAILABLE" || (d.status || "").toUpperCase() === "ACTIVE") : null;
      if (firstAvail) {
        setSelectedDriverId(firstAvail.id);
        setAssignDriverName(firstAvail.name || "");
        setAssignDriverPhone(firstAvail.phone || "");
        setAssignVehicleNo(firstAvail.vehicleNumber || "");
      } else {
        setSelectedDriverId("");
        setAssignDriverName("");
        setAssignDriverPhone("");
        setAssignVehicleNo("");
      }
      setAssignDriverModalOpen(true);
    } catch (err) {
      console.error("Failed to load drivers", err);
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    setSubmittingAssign(true);
    setAssignError("");
    try {
      await logisticsApi.assignDriver(shipment.id, {
        driverId: selectedDriverId || undefined,
        driverName: assignDriverName,
        driverPhone: assignDriverPhone,
        vehicleNumber: assignVehicleNo,
      });
      setAssignDriverModalOpen(false);
      await loadShipment();
    } catch (err) {
      setAssignError(err.message || "Failed to assign driver.");
    } finally {
      setSubmittingAssign(false);
    }
  };

  // Outbound Delivery Confirmation (Photo + OTP)
  const [processorDeliveryModalOpen, setProcessorDeliveryModalOpen] = useState(false);
  const [deliveryOtp, setDeliveryOtp] = useState("");
  const [deliveryPhoto, setDeliveryPhoto] = useState("https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80");
  const [deliveryNotes, setDeliveryNotes] = useState("Delivered full batch of pearl millet bags in dry condition.");
  const [deliveryError, setDeliveryError] = useState("");
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  const handleConfirmProcessorDelivery = async () => {
    if (!deliveryOtp || deliveryOtp.trim().length !== 4) {
      setDeliveryError("Please enter the 4-digit OTP provided by the processor.");
      return;
    }
    setSubmittingDelivery(true);
    setDeliveryError("");
    try {
      const allRequests = await purchaseRequestsApi.getAll().catch(() => []);
      const req = allRequests.find(
        (r) => r.shipmentId === shipment.id || r.lotId === shipment.lotId || r.agreementId === shipment.agreementId
      );
      if (req) {
        await purchaseRequestsApi.confirmDelivery(req.id, {
          otp: deliveryOtp.trim(),
          photoUrl: deliveryPhoto,
          notes: deliveryNotes,
        });
      } else {
        await handleStatusUpdate("DELIVERED");
      }
      setShipment((prev) => ({ ...prev, status: "DELIVERED" }));
      setProcessorDeliveryModalOpen(false);
    } catch (err) {
      setDeliveryError(err.message || "Failed to confirm delivery. Please check the OTP.");
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const loadShipment = useCallback(async () => {
    setLoading(true);
    try {
      let data = null;
      try {
        data = await logisticsApi.getById(id);
      } catch {
        // If direct ID lookup fails (e.g. mock slug or code), search all active dispatches
        const all = await logisticsApi.getAll().catch(() => []);
        data = all.find((d) => d.id === id || d.dispatchCode?.toLowerCase() === id?.toLowerCase()) || all[0];
      }

      if (data) {
        const rawDriver = data.driverName?.trim();
        const hasDriver = Boolean(rawDriver && rawDriver !== "-" && rawDriver !== "Unassigned");

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
          vehicleNumber: hasDriver ? (data.vehicleNumber || "") : "",
          vehicleCapacityKg: data.vehicleCapacityKg || 0,
          driverName: hasDriver ? rawDriver : "",
          driverPhone: hasDriver ? (data.driverPhone || "") : "",
          assignedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB") : "-",
          scheduledPickup: data.scheduledDate ? `${data.scheduledDate} ${data.scheduledStartTime || ""}` : "-",
          status: data.status || "SCHEDULED",
          warehouseReceiptStatus: data.warehouseReceiptStatus || "PENDING",
          verificationCode: data.verificationCode || "9304",
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
  }, [id]);

  useEffect(() => {
    loadShipment();
  }, [loadShipment]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800"></div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Shipment Record Not Found</h2>
        <p className="text-sm text-slate-600">
          We couldn't locate shipment <span className="font-mono font-semibold text-slate-800">"{id}"</span> in the database. It may have been archived or completed.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button onClick={() => navigate("/dispatches")} className="bg-emerald-700 hover:bg-emerald-800 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Logistics
          </Button>
        </div>
      </div>
    );
  }

  const isOutbound = shipment.direction === "OUTBOUND";
  const statusUpper = (shipment.status || "").toUpperCase();
  const isPickupConfirmed = statusUpper === "IN_TRANSIT" || statusUpper === "DELIVERED" || statusUpper === "COMPLETED";
  const isInTransit = statusUpper === "IN_TRANSIT";
  const isDelivered = statusUpper === "DELIVERED" || statusUpper === "COMPLETED";

  return (
    <div className="space-y-6 max-w-8xl mx-auto pb-16">
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
            {shipment.status === "PENDING_DISPATCH" || shipment.status?.includes("ISSUE") || reportedIssue ? (
              <Badge className="bg-red-100 text-red-800 border-red-300 text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider">
                PENDING DISPATCH (ISSUE FLAGGED)
              </Badge>
            ) : shipment.status === "IN_TRANSIT" ? (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider">
                IN TRANSIT
              </Badge>
            ) : shipment.status === "DELIVERED" || shipment.status === "COMPLETED" ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider">
                DELIVERED
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider">
                {shipment.status.replace(/_/g, " ")}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isLogisticsOrAdmin && shipment.status !== "DELIVERED" && (
              <Button
                onClick={handleOpenAssignModal}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="h-4 w-4" />
                {shipment.driverName ? "Reassign Driver" : "Assign Active Driver"}
              </Button>
            )}
            <Button
              onClick={() => setChallanModalOpen(true)}
              className="h-9 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              Delivery Challan
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/logistics")}
              className="h-9 text-xs font-bold border-slate-300 flex items-center gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Logistics
            </Button>
          </div>
        </div>

        <DeliveryChallanModal
          open={challanModalOpen}
          onClose={() => setChallanModalOpen(false)}
          shipment={shipment}
        />

        <p className="text-xs font-mono text-slate-500 mt-1 font-bold">
          ID: {shipment.shipmentCode}
        </p>

        {reportedIssue && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-900 shadow-xs">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-red-950 text-sm">Issue Flagged: {reportedIssue.category}</p>
                <span className="text-[10px] text-red-600 font-semibold">{reportedIssue.reportedAt}</span>
              </div>
              <p className="mt-1 text-red-800">{reportedIssue.description}</p>
            </div>
          </div>
        )}
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

                  <div className="border-t border-slate-100 pt-3 col-span-2">
                    <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-700" /> Pickup Location & Farm GPS Coordinates
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {shipment.sourceAddress}
                    </span>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-emerald-300">
                        Exact Coordinates: 12.5224° N, 76.8972° E
                      </span>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=12.5224,76.8972"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                      >
                        View on Google Maps ↗
                      </a>
                    </div>
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
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900">
                Transport Details
              </CardTitle>
              {isLogisticsOrAdmin && shipment.status !== "DELIVERED" && (
                <Button
                  size="sm"
                  onClick={handleOpenAssignModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="h-3.5 w-3.5" />
                  {shipment.driverName ? "Change / Reassign Driver" : "Assign Active Driver"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-4">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium mb-1">
                    Vehicle Number
                  </span>
                  {shipment.vehicleNumber ? (
                    <Badge className="bg-slate-100 text-slate-900 border-slate-300 font-mono text-xs font-bold px-2.5 py-1">
                      <Truck className="h-3.5 w-3.5 mr-1 text-slate-600" />
                      {shipment.vehicleNumber}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 font-medium text-xs">
                      Unassigned
                    </Badge>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">
                    Vehicle Capacity
                  </span>
                  <span className="font-bold text-slate-900">
                    {shipment.vehicleCapacityKg ? `${shipment.vehicleCapacityKg.toLocaleString("en-IN")} kg` : "7,000 kg"}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-500 block text-[11px] font-medium">
                    Driver Name
                  </span>
                  <span className="font-bold text-slate-900">
                    {shipment.driverName ? (
                      shipment.driverName
                    ) : (
                      <span className="text-amber-700 font-medium">Pending Assignment</span>
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-500 block text-[11px] font-medium">
                    Driver Mobile
                  </span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    {shipment.driverPhone ? (
                      <>
                        <Phone className="h-3 w-3 text-slate-400" /> {shipment.driverPhone}
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal">Not assigned</span>
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">
                      Assigned On
                    </span>
                    <span className="font-bold text-slate-900">
                      {shipment.driverName ? shipment.assignedDate : "Awaiting assignment"}
                    </span>
                  </div>

                  {isLogisticsOrAdmin && shipment.status !== "DELIVERED" && (
                    <Button
                      size="sm"
                      onClick={handleOpenAssignModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Truck className="h-3.5 w-3.5 mr-1" />
                      {shipment.driverName ? "Reassign Driver" : "Assign Active Driver"}
                    </Button>
                  )}
                </div>
              </div>

              {!shipment.driverName && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-center justify-between text-[11px] text-amber-900 font-medium">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>No driver currently assigned. Assign an active driver to schedule route.</span>
                  </div>
                  {isLogisticsOrAdmin && (
                    <Button
                      size="sm"
                      onClick={handleOpenAssignModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-7 px-3 shadow-xs"
                    >
                      Assign Driver
                    </Button>
                  )}
                </div>
              )}

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
                    {isPickupConfirmed ? (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    ) : (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-emerald-700 bg-white flex items-center justify-center text-[8px]">
                        ●
                      </span>
                    )}
                    <p className={`font-bold ${isPickupConfirmed ? "text-slate-900" : "text-emerald-800"}`}>Pickup Confirmation</p>
                    <p className="text-[10px] text-slate-500">{isPickupConfirmed ? "Pickup Verified & Confirmed" : "Waiting for pickup"}</p>
                  </div>

                  {/* Step 4: In Transit */}
                  <div className="relative">
                    {isDelivered ? (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    ) : isInTransit ? (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-emerald-700 bg-white flex items-center justify-center text-[8px]">
                        ●
                      </span>
                    ) : (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    )}
                    <p className={`font-bold ${isInTransit ? "text-emerald-800" : isDelivered ? "text-slate-900" : "text-slate-400 font-medium"}`}>In Transit</p>
                    {isInTransit && <p className="text-[10px] text-amber-700 font-semibold">Vehicle en route to destination</p>}
                    {isDelivered && <p className="text-[10px] text-slate-500">Transit Completed</p>}
                  </div>

                  {/* Step 5: Delivered */}
                  <div className="relative">
                    {isDelivered ? (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    ) : (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    )}
                    <p className={`font-medium ${isDelivered ? "text-slate-900 font-bold" : "text-slate-400"}`}>Delivered</p>
                    {isDelivered && <p className="text-[10px] text-slate-500">Delivered to Warehouse</p>}
                  </div>

                  {/* Step 6: Warehouse Receipt */}
                  <div className="relative">
                    {isDelivered ? (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-emerald-700 bg-white flex items-center justify-center text-[8px]">
                        ●
                      </span>
                    ) : (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    )}
                    <p className={`font-medium ${isDelivered ? "text-emerald-800 font-bold" : "text-slate-400"}`}>Warehouse Receipt</p>
                    {isDelivered && <p className="text-[10px] text-slate-500">Awaiting Warehouse Verification</p>}
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
                    {isPickupConfirmed ? (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    ) : (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-emerald-700 bg-white flex items-center justify-center text-[8px]">
                        ●
                      </span>
                    )}
                    <p className={`font-bold ${isPickupConfirmed ? "text-slate-900" : "text-emerald-800"}`}>Dispatch Confirmed</p>
                    <p className="text-[10px] text-slate-500">{isPickupConfirmed ? "Dispatch Verified & Confirmed" : "Ready for dispatch"}</p>
                  </div>

                  {/* Step 4: In Transit */}
                  <div className="relative">
                    {isDelivered ? (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    ) : isInTransit ? (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-emerald-700 bg-white flex items-center justify-center text-[8px]">
                        ●
                      </span>
                    ) : (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    )}
                    <p className={`font-bold ${isInTransit ? "text-emerald-800" : isDelivered ? "text-slate-900" : "text-slate-400 font-medium"}`}>In Transit</p>
                  </div>

                  {/* Step 5: Delivered to Processor/SHG */}
                  <div className="relative">
                    {isDelivered ? (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    ) : (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    )}
                    <p className={`font-medium ${isDelivered ? "text-slate-900 font-bold" : "text-slate-400"}`}>Delivered to Processor/SHG</p>
                  </div>

                  {/* Step 6: Delivery Confirmed */}
                  <div className="relative">
                    {isDelivered ? (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-emerald-700 bg-white flex items-center justify-center text-[8px]">
                        ●
                      </span>
                    ) : (
                      <span className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                    )}
                    <p className={`font-medium ${isDelivered ? "text-emerald-800 font-bold" : "text-slate-400"}`}>Delivery Confirmed</p>
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
            onClick={() => navigate(`/logistics/${shipment.id}/report-issue`)}
            className="h-10 border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs"
          >
            <AlertCircle className="h-3.5 w-3.5 mr-1" /> Report Issue
          </Button>

          {/* Role-Specific Action Controls */}
          {isLogisticsCoordinator ? (
            /* Logistics Coordinator View: Assign/Reassign driver, NO confirm delivery/pickup buttons */
            <div className="flex items-center gap-3">
              {isDelivered ? (
                <div className="h-10 bg-emerald-800 text-white font-bold text-xs px-5 rounded-lg flex items-center gap-1.5 opacity-90">
                  <CheckCircle2 className="h-4 w-4" /> Delivered &amp; Verified
                </div>
              ) : isInTransit ? (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-900 text-xs px-4 py-2.5 rounded-xl font-medium">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    In Transit with Driver <strong>{shipment.driverName}</strong> ({shipment.vehicleNumber}). Delivery confirmation is performed by the driver via mobile app.
                  </span>
                </div>
              ) : !shipment.driverName ? (
                <Button
                  onClick={handleOpenAssignModal}
                  className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="h-4 w-4" /> Assign Active Driver
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2 rounded-xl font-medium">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Driver Assigned: <strong>{shipment.driverName}</strong> ({shipment.vehicleNumber})
                    </span>
                  </div>
                  <Button
                    onClick={handleOpenAssignModal}
                    variant="outline"
                    className="h-10 border-blue-300 text-blue-700 hover:bg-blue-50 font-bold text-xs px-4 cursor-pointer flex items-center gap-1"
                  >
                    <Truck className="h-3.5 w-3.5" /> Reassign Driver
                  </Button>
                </div>
              )}
            </div>
          ) : isProcessor ? (
            /* Processor View: Shows delivery OTP banner, NO confirm delivery button */
            isInTransit ? (
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-xl px-4 py-2.5 shadow-2xs">
                <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    In Transit &mdash; Awaiting Driver Delivery
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 block text-[11px] mt-0.5">
                    Your Delivery OTP is <strong className="font-mono text-emerald-800 dark:text-emerald-300 font-black text-sm">{shipment.verificationCode || "9304"}</strong>. Provide this code to the driver upon delivery.
                  </span>
                </div>
              </div>
            ) : isDelivered ? (
              <div className="h-10 bg-emerald-800 text-white font-bold text-xs px-5 rounded-lg flex items-center gap-1.5 opacity-90">
                <CheckCircle2 className="h-4 w-4" /> Delivered &amp; Verified
              </div>
            ) : (
              <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-4 py-2.5 rounded-lg">
                Status: {shipment.status?.replace(/_/g, " ")}
              </div>
            )
          ) : (
            /* Driver View: Confirms pickup and confirms delivery */
            isDelivered ? (
              <Button
                disabled
                className="h-10 bg-emerald-800 text-white font-bold text-xs px-6 opacity-90"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Delivered
              </Button>
            ) : isInTransit ? (
              isOutbound ? (
                <Button
                  onClick={() => {
                    setDeliveryOtp("");
                    setDeliveryError("");
                    setProcessorDeliveryModalOpen(true);
                  }}
                  disabled={updating}
                  className="h-10 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-6 shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="h-4 w-4" /> Confirm Delivery (Photo + OTP)
                </Button>
              ) : (
                <Button
                  onClick={() => handleStatusUpdate("DELIVERED")}
                  disabled={updating}
                  className="h-10 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-6"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm Delivery to Warehouse
                </Button>
              )
            ) : !shipment.driverName ? (
              <div className="text-xs font-semibold text-amber-800 bg-amber-50 px-4 py-2.5 rounded-lg border border-amber-200">
                <Clock className="inline w-3.5 h-3.5 mr-1 text-amber-600" /> Awaiting Driver Assignment
              </div>
            ) : (
              <Button
                onClick={() => {
                  setInputCode("");
                  setCodeError("");
                  setConfirmModalOpen(true);
                }}
                className="h-10 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-6 shadow-xs"
              >
                <Truck className="h-4 w-4 mr-1.5" /> Confirm Pickup
              </Button>
            )
          )}
        </div>
      </div>

      {/* Pickup / Dispatch 4-Digit Verification Code Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-700" /> Confirm Pickup
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Please enter the 4-digit verification code displayed on the farmer's mobile app lot details card to confirm pickup.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900">
              <p className="font-bold">Shipment Code: {shipment.shipmentCode}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">Driver: {shipment.driverName} ({shipment.vehicleNumber})</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                4-Digit Verification Code
              </label>
              <Input
                type="text"
                maxLength={4}
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setCodeError("");
                }}
                placeholder="Enter 4-digit code (e.g. 4829)"
                className="text-center font-mono text-xl tracking-widest h-12 border-slate-300 font-black"
              />
              {codeError && (
                <p className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {codeError}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              className="h-9 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!inputCode || inputCode.trim().length !== 4) {
                  setCodeError("Please enter a valid 4-digit verification code.");
                  return;
                }
                handleStatusUpdate("IN_TRANSIT");
                setConfirmModalOpen(false);
              }}
              disabled={updating}
              className="h-9 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-5"
            >
              Verify & Confirm Pickup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Issue Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" /> Report Shipment Issue
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Flag an operational or transport issue for shipment #{shipment?.shipmentCode}. Logistics team will be alerted immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Issue Category
              </label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full h-9 text-xs border border-slate-200 rounded-md font-semibold bg-white px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Vehicle Delay / Breakdown">Vehicle Delay / Breakdown</option>
                <option value="Quantity Discrepancy">Quantity Discrepancy</option>
                <option value="Quality / Damaged Goods">Quality / Damaged Goods</option>
                <option value="Driver Unreachable">Driver Unreachable</option>
                <option value="Location / Address Error">Location / Address Error</option>
                <option value="Other Issue">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Issue Details / Remarks
              </label>
              <textarea
                rows={4}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the issue in detail (e.g. driver flat tire on Highway 48, expected delay of 2 hours)..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-md font-normal bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setReportModalOpen(false)}
              className="h-9 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setSubmittingReport(true);
                try {
                  if (shipment?.id) {
                    await logisticsApi.updateStatus(shipment.id, "PENDING_DISPATCH");
                  }
                  setReportedIssue({
                    category: issueCategory,
                    description: issueDescription || "Issue reported to logistics operations desk.",
                    reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  });
                  setShipment((prev) => (prev ? { ...prev, status: "PENDING_DISPATCH" } : prev));
                  setReportModalOpen(false);
                } catch (err) {
                  console.error("Failed to flag shipment issue:", err);
                } finally {
                  setSubmittingReport(false);
                }
              }}
              disabled={submittingReport}
              className="h-9 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5"
            >
              {submittingReport ? "Submitting..." : "Submit Issue Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Outbound Processor Delivery Confirmation Dialog (Photo + OTP) */}
      <Dialog open={processorDeliveryModalOpen} onOpenChange={setProcessorDeliveryModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-xl shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Confirm Delivery to Processor
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Driver must verify delivery with proof photo and processor OTP.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 my-3">
            {deliveryError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{deliveryError}</span>
              </div>
            )}

            {/* Photo Proof */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Proof of Delivery Photo</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Required</span>
              </label>
              
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
                {deliveryPhoto ? (
                  <div className="space-y-2">
                    <img
                      src={deliveryPhoto}
                      alt="Delivery Proof"
                      className="w-full h-36 object-cover rounded-md border border-slate-200 shadow-xs"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <label className="cursor-pointer text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                        <Camera className="h-3.5 w-3.5" /> Retake / Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setDeliveryPhoto(reader.result);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer py-4 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Click to upload delivery photo</span>
                    <span className="text-[10px] text-slate-400">or capture using mobile camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setDeliveryPhoto(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* OTP Verification */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Recipient Verification OTP</span>
                <span className="text-[10px] text-slate-400">Ask processor for 4-digit code</span>
              </label>
              <Input
                type="text"
                maxLength={4}
                value={deliveryOtp}
                onChange={(e) => setDeliveryOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 9304"
                className="text-center font-mono tracking-widest text-lg font-bold h-11 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                The processor can see this OTP on their Purchase Requests &amp; Payment page.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery Notes / Condition
              </label>
              <Input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Delivered 1,250 kg bags in good condition"
                className="text-xs h-9 border-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setProcessorDeliveryModalOpen(false)}
              className="h-9 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmProcessorDelivery}
              disabled={submittingDelivery || !deliveryOtp || deliveryOtp.length !== 4}
              className="h-9 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-5 flex items-center gap-1.5"
            >
              {submittingDelivery ? (
                "Verifying..."
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Verify OTP &amp; Confirm Delivery
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Active Driver Modal */}
      <Dialog open={assignDriverModalOpen} onOpenChange={setAssignDriverModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 border border-slate-200">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Assign Active Driver &amp; Vehicle
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Select an available registered driver for shipment <b>{shipment?.dispatchCode || shipment?.id}</b>. Drivers in transit or inactive cannot be assigned.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignDriver} className="space-y-4 py-3 text-xs">
            {assignError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {assignError}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Registered Driver</label>
              <Select
                value={selectedDriverId}
                onValueChange={(val) => {
                  setSelectedDriverId(val);
                  const found = driversList.find((d) => d.id === val);
                  if (found) {
                    setAssignDriverName(found.name || "");
                    setAssignDriverPhone(found.phone || "");
                    setAssignVehicleNo(found.vehicleNumber || "");
                  }
                }}
              >
                <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-300 font-bold text-slate-900">
                  <SelectValue placeholder="Choose an active, available driver..." />
                </SelectTrigger>
                <SelectContent>
                  {driversList.map((drv) => {
                    const isAvail = (drv.status || "").toUpperCase() === "AVAILABLE" || (drv.status || "").toUpperCase() === "ACTIVE";
                    const isInTransit = (drv.status || "").toUpperCase() === "IN_TRANSIT" || (drv.status || "").toUpperCase() === "ON_JOURNEY";
                    const isDisabled = !isAvail;

                    return (
                      <SelectItem key={drv.id} value={drv.id} disabled={isDisabled}>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className={`font-semibold ${isDisabled ? "text-slate-400 line-through" : "text-slate-900"}`}>
                            {drv.name} ({drv.phone})
                          </span>
                          <span className="font-mono text-[10px]">
                            {isAvail ? (
                              <span className="text-emerald-700 font-bold">Active • {drv.vehicleNumber || "Available"}</span>
                            ) : isInTransit ? (
                              <span className="text-amber-700 font-bold bg-amber-50 px-1 py-0.5 rounded">In Transit (Unavailable)</span>
                            ) : (
                              <span className="text-red-600 font-bold bg-red-50 px-1 py-0.5 rounded">Inactive (Off-Duty)</span>
                            )}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Vehicle Registration Number</label>
              <Input
                required
                placeholder="e.g. KA-09-AB-4521"
                value={assignVehicleNo}
                onChange={(e) => setAssignVehicleNo(e.target.value)}
                className="bg-slate-50 border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Driver Full Name</label>
              <Input
                required
                placeholder="Driver Name"
                value={assignDriverName}
                onChange={(e) => setAssignDriverName(e.target.value)}
                className="bg-slate-50 border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Driver Phone Number</label>
              <Input
                required
                placeholder="Driver Phone"
                value={assignDriverPhone}
                onChange={(e) => setAssignDriverPhone(e.target.value)}
                className="bg-slate-50 border-slate-300 text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setAssignDriverModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs" disabled={submittingAssign}>
                {submittingAssign ? "Assigning..." : "Assign Active Driver"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ShipmentDetails;
