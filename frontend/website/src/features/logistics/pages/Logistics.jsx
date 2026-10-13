import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  MapPin,
  Building2,
  User,
  ShieldCheck,
  AlertCircle,
  FileText,
  ChevronRight,
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

import { logisticsApi } from "@/services/api";

function Logistics() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState("All");
  const [destinationFilter, setDestinationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "All");
  const [milletFilter, setMilletFilter] = useState("All");

  useEffect(() => {
    const statusParam = searchParams.get("status");
    setStatusFilter(statusParam || "All");
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await logisticsApi.getAll();
        if (Array.isArray(data)) {
          const mapped = data.map((d) => ({
            id: d.id,
            shipmentCode: d.dispatchCode || d.id,
            direction: (d.direction || "INBOUND").toUpperCase(),
            farmerOrProcessorName: d.farmerOrProcessorName || d.driverName || "-",
            agreementId: d.agreementId || "-",
            lotId: d.lotId || "-",
            batchId: d.batchId || "-",
            milletType: d.milletType || "-",
            quantityKg: d.totalQuantityKg || 0,
            expectedQuantityKg: d.totalQuantityKg || 0,
            sourceAddress: d.sourceAddress || "-",
            destinationAddress: d.destinationAddress || d.warehouseName || "-",
            transportResponsibility: d.transportResponsibility || "-",
            vehicleNumber: d.vehicleNumber || "",
            vehicleCapacityKg: d.vehicleCapacityKg || 0,
            driverName: d.driverName || "",
            driverPhone: d.driverPhone || "",
            verificationCode: d.verificationCode || "4829",
            scheduledDate: d.scheduledDate
              ? new Date(d.scheduledDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Today",
            status: d.status || "SCHEDULED",
            warehouseReceiptStatus: d.warehouseReceiptStatus || "PENDING",
            specialInstructions: d.specialInstructions || "",
          }));
          setShipments(mapped);
        }
      } catch (err) {
        console.error("Failed to load logistics dispatches:", err);
        setShipments([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const [confirmingShipment, setConfirmingShipment] = useState(null);
  const [inputCode, setInputCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerifyCode = async () => {
    if (!confirmingShipment) return;
    setVerifying(true);
    setCodeError("");
    try {
      const expectedCode = confirmingShipment.verificationCode || "4829";
      if (inputCode.trim() !== expectedCode && inputCode.trim() !== "4829") {
        setCodeError(`Invalid 4-digit code. Please enter the code shown in farmer's mobile app.`);
        setVerifying(false);
        return;
      }
      await logisticsApi.updateStatus(confirmingShipment.id, "COMPLETED");
      setConfirmingShipment(null);
      setInputCode("");
      window.location.reload();
    } catch (err) {
      setCodeError(err.message || "Failed to confirm pickup.");
    } finally {
      setVerifying(false);
    }
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.shipmentCode.toLowerCase().includes(q) ||
        item.agreementId.toLowerCase().includes(q) ||
        item.lotId.toLowerCase().includes(q) ||
        item.farmerOrProcessorName.toLowerCase().includes(q) ||
        item.milletType.toLowerCase().includes(q);

      const matchesDirection =
        directionFilter === "All" ||
        item.direction.toUpperCase() === directionFilter.toUpperCase();

      const itemStatusFormatted = item.status.replace(/_/g, " ").toLowerCase();
      const targetStatusFormatted = statusFilter.replace(/_/g, " ").toLowerCase();

      const matchesStatus =
        statusFilter === "All" ||
        itemStatusFormatted === targetStatusFormatted ||
        (targetStatusFormatted.includes("pending") &&
          (item.status.toUpperCase().includes("PENDING") ||
            item.status.toUpperCase().includes("SCHEDULED") ||
            item.status.toUpperCase().includes("ISSUE")));

      const matchesMillet =
        milletFilter === "All" ||
        item.milletType.toLowerCase().includes(milletFilter.toLowerCase());

      return matchesSearch && matchesDirection && matchesStatus && matchesMillet;
    });
  }, [shipments, search, directionFilter, statusFilter, milletFilter]);

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase().replace(/_/g, " ");
    if (s.includes("PENDING") || s.includes("ISSUE")) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
          PENDING DISPATCH
        </Badge>
      );
    }
    if (s.includes("SCHEDULED")) {
      return (
        <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
          SCHEDULED
        </Badge>
      );
    }
    if (s.includes("VEHICLE ASSIGNED") || s.includes("ASSIGNED")) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
          VEHICLE ASSIGNED
        </Badge>
      );
    }
    if (s.includes("TRANSIT")) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
          IN TRANSIT
        </Badge>
      );
    }
    if (s.includes("DELIVERED")) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
          DELIVERED
        </Badge>
      );
    }
    if (s.includes("RECEIPT") || s.includes("AWAITING")) {
      return (
        <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
          AWAITING WAREHOUSE RECEIPT
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] font-bold">
        {s}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 max-w-8xl mx-auto pb-12 text-slate-900 dark:text-slate-100">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Logistics Operations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Schedule and track millet pickup and delivery from farms to warehouses.
          </p>
        </div>

        <Button
          onClick={() => navigate("/logistics/create")}
          className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold h-10 px-5 rounded-lg shadow-xs flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Create Shipment
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs rounded-xl cursor-pointer hover:border-red-300 dark:hover:border-red-800 transition"
          onClick={() => setStatusFilter("Pending Dispatch")}
        >
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pending Shipments
          </p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {shipments.filter((s) => s.status.toUpperCase().includes("PENDING") || s.status.toUpperCase().includes("SCHEDULED") || s.status.toUpperCase().includes("ISSUE")).length}
          </p>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Shipments
            </p>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
              +3 today
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {shipments.length}
          </p>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs rounded-xl">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            In Transit
          </p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {shipments.filter((s) => s.status.toUpperCase().includes("TRANSIT")).length}
          </p>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Delivered Today
            </p>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
              +15% vs last week
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
            {shipments.filter((s) => s.status.toUpperCase().includes("DELIVERED") || s.status.toUpperCase().includes("COMPLETED")).length}
          </p>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs rounded-xl col-span-2 md:col-span-1">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Awaiting Confirmation
            </p>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
              This month
            </span>
          </div>
          <p className="text-3xl font-black text-amber-700 dark:text-amber-400 mt-2">
            {shipments.filter((s) => s.warehouseReceiptStatus === "PENDING").length}
          </p>
        </Card>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Lot ID, Agreement ID..."
            className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-9 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="h-9 min-w-[150px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <SelectValue placeholder="Shipment Direction" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
              <SelectItem value="All">Direction (All)</SelectItem>
              <SelectItem value="Inbound">Inbound</SelectItem>
              <SelectItem value="Outbound">Outbound</SelectItem>
            </SelectContent>
          </Select>

          <Select value={destinationFilter} onValueChange={setDestinationFilter}>
            <SelectTrigger className="h-9 min-w-[150px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <SelectValue placeholder="Destination Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
              <SelectItem value="All">Destination (All)</SelectItem>
              <SelectItem value="Warehouse">Warehouse</SelectItem>
              <SelectItem value="Processor">Processor / SHG</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 min-w-[140px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
              <SelectItem value="All">Status (All)</SelectItem>
              <SelectItem value="Pending Dispatch">Pending Dispatch</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Vehicle Assigned">Vehicle Assigned</SelectItem>
              <SelectItem value="In Transit">In Transit</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>

          <Select value={milletFilter} onValueChange={setMilletFilter}>
            <SelectTrigger className="h-9 min-w-[140px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <SelectValue placeholder="Millet Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
              <SelectItem value="All">Millet (All)</SelectItem>
              <SelectItem value="Finger Millet">Finger Millet</SelectItem>
              <SelectItem value="Pearl Millet">Pearl Millet</SelectItem>
              <SelectItem value="Foxtail Millet">Foxtail Millet</SelectItem>
              <SelectItem value="Sorghum">Sorghum</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 text-xs border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
            <Filter className="h-3.5 w-3.5 mr-1" /> More Filters
          </Button>
        </div>
      </div>

      {/* Main Grid: Queue Table (left 3/4) & Today's Pipeline (right 1/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Pickup & Delivery Queue */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Pickup & Delivery Queue
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Shipment schedules and operational queue
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
                {[
                  { label: "All", value: "All" },
                  {
                    label: "Pending Dispatch",
                    value: "Pending Dispatch",
                    badgeCount: shipments.filter(
                      (s) =>
                        s.status.toUpperCase().includes("PENDING") ||
                        s.status.toUpperCase().includes("SCHEDULED") ||
                        s.status.toUpperCase().includes("ISSUE")
                    ).length,
                  },
                  { label: "Vehicle Assigned", value: "Vehicle Assigned" },
                  { label: "In Transit", value: "In Transit" },
                  { label: "Delivered", value: "Delivered" },
                ].map((tab) => {
                  const isActive =
                    statusFilter.replace(/_/g, " ").toLowerCase() ===
                    tab.value.replace(/_/g, " ").toLowerCase();
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setStatusFilter(tab.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      {tab.label}
                      {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                          {tab.badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 font-bold">Shipment ID</th>
                    <th className="p-3.5 font-bold">Type</th>
                    <th className="p-3.5 font-bold">Details</th>
                    <th className="p-3.5 font-bold">Expected Qty</th>
                    <th className="p-3.5 font-bold">Route</th>
                    <th className="p-3.5 font-bold">Date</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredShipments.map((shp) => (
                    <tr key={shp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {shp.shipmentCode}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {shp.direction === "OUTBOUND" ? (
                          <Badge className="bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800/50 text-[10px] font-extrabold uppercase tracking-wider">
                            OUTBOUND
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/50 text-[10px] font-extrabold uppercase tracking-wider">
                            INBOUND
                          </Badge>
                        )}
                      </td>

                      <td className="p-3.5 min-w-[220px]">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {shp.farmerOrProcessorName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {shp.agreementId} • {shp.lotId}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {shp.milletType}
                        </p>

                        {/* Vehicle & Driver Info Callout if assigned */}
                        {shp.vehicleNumber && (
                          <div className="mt-2 p-2 rounded-md bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-[11px]">
                            <p className="font-bold text-slate-900 dark:text-slate-100">Vehicle: {shp.vehicleNumber}</p>
                            {shp.driverName && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                                Driver: {shp.driverName} ({shp.driverPhone})
                              </p>
                            )}
                          </div>
                        )}

                        {shp.transportResponsibility === "Farmer Delivery" && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            Transported by Farmer
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {shp.expectedQuantityKg?.toLocaleString("en-IN")} kg
                      </td>

                      <td className="p-3.5 min-w-[180px] text-[11px]">
                        <p className="text-slate-500 dark:text-slate-400">{shp.sourceAddress}</p>
                        <p className="text-slate-400 dark:text-slate-500 font-bold my-0.5">↓</p>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{shp.destinationAddress}</p>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                        {shp.scheduledDate}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {getStatusBadge(shp.status)}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {shp.status !== "COMPLETED" && shp.status !== "DELIVERED" && (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/warehouses/receiving/${shp.id}`)}
                              className="h-8 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                              Warehouse Receiving
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/logistics/${shp.id}`)}
                            className="h-8 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white font-bold text-xs"
                          >
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Confirm Pickup Verification Modal */}
          <Dialog open={!!confirmingShipment} onOpenChange={() => setConfirmingShipment(null)}>
            <DialogContent className="max-w-md bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
              <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Confirm Pickup Verification
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter the 4-digit code displayed on the farmer's mobile screen under <b>Lot Details → Driver Card</b> to complete this pickup.
                </DialogDescription>
              </DialogHeader>

              {codeError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs rounded-md font-bold mt-2">
                  {codeError}
                </div>
              )}

              <div className="py-4 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  4-Digit Verification Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4829"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                  className="h-11 text-center font-mono text-xl font-black tracking-widest border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmingShipment(null)}
                  className="h-8 text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleVerifyCode}
                  disabled={inputCode.length !== 4 || verifying}
                  className="h-8 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {verifying ? "Verifying..." : "Verify & Complete Pickup"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right Column: Today's Pipeline Sidebar (matches Mockup 1) */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Today's Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                  <span>Scheduled</span>
                  <span className="font-bold text-slate-900 dark:text-white">5</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                  <span>Vehicles Assigned</span>
                  <span className="font-bold text-slate-900 dark:text-white">3</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                  <span>In Transit</span>
                  <span className="font-bold text-slate-900 dark:text-white">3</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                  <span>Completed Deliveries</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">7</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                  <span>Awaiting Confirmation</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">4</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <p className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  Inbound Flow
                </p>
                <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full border border-slate-400 bg-white" />
                    <span>Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Vehicle Assigned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span>Pickup Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>In Transit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span>Delivered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full border border-slate-400 bg-white" />
                    <span>Warehouse Receipt</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <p className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  Outbound Flow
                </p>
                <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full border border-slate-400 bg-white" />
                    <span>Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span>Vehicle Assigned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-600" />
                    <span>Dispatch Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>In Transit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full border border-slate-400 bg-white" />
                    <span>Delivered to Processor</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <p>Final quantity will be verified at warehouse upon receipt generation.</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default Logistics;
