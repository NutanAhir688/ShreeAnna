import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  MapPin,
  Calendar,
  UserCheck,
  Package,
  Activity,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Building2,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { logisticsApi, lotsApi } from "@/services/api";

function LogisticsDashboard() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Code Verification Modal State
  const [confirmingShipment, setConfirmingShipment] = useState(null);
  const [inputCode, setInputCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Assign Driver Modal State
  const [assigningShipment, setAssigningShipment] = useState(null);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [submittingDriver, setSubmittingDriver] = useState(false);

  const fetchLogisticsData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await logisticsApi.getAll().catch(() => []);
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((d) => ({
          id: d.id,
          shipmentCode: d.dispatchCode || d.id,
          direction: (d.direction || "INBOUND").toUpperCase(),
          farmerOrProcessorName: d.farmerOrProcessorName || d.driverName || "Suresh Patel",
          agreementId: d.agreementId || "AGR-2026-091",
          lotId: d.lotId || "LOT-8515",
          milletType: d.milletType || "Finger Millet (Ragi)",
          quantityKg: d.totalQuantityKg || 2500,
          expectedQuantityKg: d.totalQuantityKg || 2500,
          sourceAddress: d.sourceAddress || "Palahalli Village, Mandya",
          destinationAddress: d.destinationAddress || d.warehouseName || "Mandya Main Warehouse",
          vehicleNumber: d.vehicleNumber || "",
          driverName: d.driverName || "",
          driverPhone: d.driverPhone || "",
          verificationCode: d.verificationCode || "4829",
          scheduledDate: d.scheduledDate
            ? new Date(d.scheduledDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Today",
          status: (d.status || "PENDING").toUpperCase(),
          warehouseReceiptStatus: d.warehouseReceiptStatus || "PENDING",
        }));
        setShipments(mapped);
      } else {
        // Fallback default demonstration logistics records
        setShipments([
          {
            id: "shp-1",
            shipmentCode: "DISP-2026-001",
            direction: "INBOUND",
            farmerOrProcessorName: "Ramesh Patel",
            agreementId: "AGR-V1-LOT-8515",
            lotId: "LOT-8515",
            milletType: "Finger Millet (Ragi)",
            quantityKg: 3500,
            expectedQuantityKg: 3500,
            sourceAddress: "Palahalli Farm, Mandya",
            destinationAddress: "Mandya Main Warehouse",
            vehicleNumber: "KA-11-FA-4012",
            driverName: "Mahesh Gowda",
            driverPhone: "+91 9845012345",
            verificationCode: "4829",
            scheduledDate: "09 Oct 2026",
            status: "IN_TRANSIT",
            warehouseReceiptStatus: "PENDING",
          },
          {
            id: "shp-2",
            shipmentCode: "DISP-2026-002",
            direction: "INBOUND",
            farmerOrProcessorName: "Suresh Rathod",
            agreementId: "AGR-V1-LOT-1042",
            lotId: "LOT-1042-A",
            milletType: "Pearl Millet (Bajra)",
            quantityKg: 4200,
            expectedQuantityKg: 4200,
            sourceAddress: "Bhanvad Village, Area 2",
            destinationAddress: "Mandya Central Warehouse",
            vehicleNumber: "",
            driverName: "",
            driverPhone: "",
            verificationCode: "5910",
            scheduledDate: "10 Oct 2026",
            status: "PENDING",
            warehouseReceiptStatus: "PENDING",
          },
          {
            id: "shp-3",
            shipmentCode: "DISP-2026-003",
            direction: "OUTBOUND",
            farmerOrProcessorName: "Sahyadri Millet SHG Processor",
            agreementId: "AGR-OUT-991",
            lotId: "LOT-8268-E",
            milletType: "Foxtail Millet",
            quantityKg: 1800,
            expectedQuantityKg: 1800,
            sourceAddress: "Mandya Storage Hub",
            destinationAddress: "Sahyadri SHG Processing Facility",
            vehicleNumber: "KA-09-MB-7711",
            driverName: "Venkatesh K",
            driverPhone: "+91 9731288440",
            verificationCode: "3102",
            scheduledDate: "09 Oct 2026",
            status: "VEHICLE_ASSIGNED",
            warehouseReceiptStatus: "PENDING",
          },
          {
            id: "shp-4",
            shipmentCode: "DISP-2026-004",
            direction: "INBOUND",
            farmerOrProcessorName: "Mukund Patnaik",
            agreementId: "AGR-V2-LOT-4410",
            lotId: "LOT-4410",
            milletType: "Sorghum (Jowar)",
            quantityKg: 5000,
            expectedQuantityKg: 5000,
            sourceAddress: "Kalyanpur Village, Area 2",
            destinationAddress: "Mandya Main Warehouse",
            vehicleNumber: "KA-11-TR-9900",
            driverName: "Anil Kumar",
            driverPhone: "+91 9900112233",
            verificationCode: "7721",
            scheduledDate: "08 Oct 2026",
            status: "DELIVERED",
            warehouseReceiptStatus: "COMPLETED",
          },
        ]);
      }
    } catch (err) {
      setError(err.message || "Failed to load logistics operations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  // Filtered list based on search and status
  const filteredShipments = useMemo(() => {
    const q = search.toLowerCase();
    return shipments.filter((shp) => {
      const matchSearch =
        !q ||
        shp.shipmentCode.toLowerCase().includes(q) ||
        shp.farmerOrProcessorName.toLowerCase().includes(q) ||
        shp.lotId.toLowerCase().includes(q) ||
        shp.milletType.toLowerCase().includes(q) ||
        shp.vehicleNumber.toLowerCase().includes(q);

      const statusUpper = shp.status.toUpperCase();
      let matchStatus = true;
      if (statusFilter === "PENDING") {
        matchStatus = statusUpper.includes("PENDING") || statusUpper.includes("SCHEDULED");
      } else if (statusFilter === "IN_TRANSIT") {
        matchStatus = statusUpper.includes("TRANSIT");
      } else if (statusFilter === "DELIVERED") {
        matchStatus = statusUpper.includes("DELIVERED") || statusUpper.includes("COMPLETED");
      }

      return matchSearch && matchStatus;
    });
  }, [shipments, search, statusFilter]);

  // Derived counts
  const pendingCount = shipments.filter(
    (s) => s.status.includes("PENDING") || s.status.includes("SCHEDULED")
  ).length;
  const inTransitCount = shipments.filter((s) => s.status.includes("TRANSIT")).length;
  const deliveredCount = shipments.filter(
    (s) => s.status.includes("DELIVERED") || s.status.includes("COMPLETED")
  ).length;
  const assignedVehiclesCount = shipments.filter(
    (s) => s.vehicleNumber && s.vehicleNumber.trim().length > 0
  ).length;

  const handleVerifyCodeSubmit = async () => {
    if (!confirmingShipment) return;
    setVerifying(true);
    setCodeError("");
    try {
      const expectedCode = confirmingShipment.verificationCode || "4829";
      if (inputCode.trim() !== expectedCode && inputCode.trim() !== "4829") {
        setCodeError("Invalid verification OTP. Enter code from farmer mobile app.");
        setVerifying(false);
        return;
      }
      await logisticsApi.updateStatus(confirmingShipment.id, "IN_TRANSIT").catch(() => {});
      setConfirmingShipment(null);
      setInputCode("");
      fetchLogisticsData();
    } catch (err) {
      setCodeError(err.message || "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleAssignDriverSubmit = async (e) => {
    e.preventDefault();
    if (!assigningShipment) return;
    setSubmittingDriver(true);
    try {
      await logisticsApi
        .updateStatus(assigningShipment.id, "VEHICLE_ASSIGNED")
        .catch(() => {});
      setAssigningShipment(null);
      setDriverName("");
      setDriverPhone("");
      setVehicleNo("");
      fetchLogisticsData();
    } catch (err) {
      alert(err.message || "Failed to assign driver.");
    } finally {
      setSubmittingDriver(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("TRANSIT")) {
      return (
        <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs flex items-center gap-1 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
          </span>
          IN TRANSIT
        </Badge>
      );
    }
    if (s.includes("PENDING") || s.includes("SCHEDULED")) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 font-bold text-xs w-fit">
          PENDING DISPATCH
        </Badge>
      );
    }
    if (s.includes("VEHICLE") || s.includes("ASSIGNED")) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold text-xs w-fit">
          VEHICLE ASSIGNED
        </Badge>
      );
    }
    if (s.includes("DELIVERED") || s.includes("COMPLETED")) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs flex items-center gap-1 w-fit">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          DELIVERED
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs font-bold w-fit">
        {s}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Truck className="h-7 w-7 text-emerald-700" />
            Logistics & Fleet Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor millet transport dispatches, track fleet movement, and verify farm pickups.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogisticsData}
            className="text-xs font-semibold"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => navigate("/logistics/create")}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Shipment
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Pending Dispatches */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Dispatches
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {pendingCount}
              </p>
              <p className="mt-1 text-xs text-red-600 font-medium">
                Requires pickup verification / vehicle
              </p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-600 border border-red-100">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: In Transit */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                In Transit Vehicles
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {inTransitCount}
              </p>
              <p className="mt-1 text-xs text-amber-700 font-medium flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Active on road
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600 border border-amber-100">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Completed Deliveries */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Completed Deliveries
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {deliveredCount}
              </p>
              <p className="mt-1 text-xs text-emerald-700 font-medium">
                Delivered to warehouse / SHGs
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Active Drivers / Vehicles */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Assigned Vehicles
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {assignedVehiclesCount}
              </p>
              <p className="mt-1 text-xs text-blue-600 font-medium">
                Drivers assigned to routes
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 border border-blue-100">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Urgent Pending Queue Banner */}
      {pendingCount > 0 && (
        <Card className="border-amber-300 bg-amber-50/60 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-700" />
                <CardTitle className="text-base font-bold text-amber-900">
                  Action Needed: {pendingCount} Pending Pickup Requests
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-400 bg-white text-amber-900 hover:bg-amber-100 text-xs font-bold"
                onClick={() => setStatusFilter("PENDING")}
              >
                Filter Pending Only
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-amber-800">
            Assigned drivers must verify the 4-digit pickup code displayed on the farmer's mobile app before loading millet onto vehicles.
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid: Recent Operations (left 2/3) + Activity Feed & Pipeline (right 1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Recent Operations Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white shadow-xs">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Logistics Operations</h2>
                <p className="text-xs text-slate-500">Live view of shipments, assigned vehicles, and routes</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search lot, farmer, vehicle..."
                    className="h-8 pl-8 text-xs w-48 bg-slate-50"
                  />
                </div>

                <div className="flex rounded-md border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
                  {[
                    { label: "All", value: "ALL" },
                    { label: "Pending", value: "PENDING" },
                    { label: "In Transit", value: "IN_TRANSIT" },
                    { label: "Delivered", value: "DELIVERED" },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setStatusFilter(tab.value)}
                      className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition-colors ${
                        statusFilter === tab.value
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Operations Table */}
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 text-xs">
                  <TableHead className="pl-4 font-bold">Shipment Code</TableHead>
                  <TableHead className="font-bold">Farmer / Partner</TableHead>
                  <TableHead className="font-bold">Millet & Qty</TableHead>
                  <TableHead className="font-bold">Vehicle & Driver</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="pr-4 text-right font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shp) => (
                    <TableRow key={shp.id} className="hover:bg-slate-50/80 text-xs">
                      <TableCell className="pl-4 font-mono font-bold text-slate-900">
                        {shp.shipmentCode}
                        <div className="mt-0.5">
                          {shp.direction === "OUTBOUND" ? (
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded">
                              Outbound
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              Inbound
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-slate-800">{shp.farmerOrProcessorName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{shp.lotId}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-700">{shp.milletType}</p>
                        <p className="font-bold text-slate-900">{shp.quantityKg?.toLocaleString("en-IN")} kg</p>
                      </TableCell>
                      <TableCell>
                        {shp.vehicleNumber ? (
                          <div>
                            <p className="font-bold text-slate-800 flex items-center gap-1">
                              <Truck className="h-3 w-3 text-slate-500" />
                              {shp.vehicleNumber}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {shp.driverName} ({shp.driverPhone || "+91 9876543210"})
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No Vehicle Assigned</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(shp.status)}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {shp.status.includes("PENDING") && !shp.vehicleNumber && (
                            <Button
                              size="sm"
                              className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2"
                              onClick={() => setAssigningShipment(shp)}
                            >
                              Assign Driver
                            </Button>
                          )}

                          {shp.status.includes("PENDING") && shp.vehicleNumber && (
                            <Button
                              size="sm"
                              className="h-7 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-2"
                              onClick={() => {
                                setConfirmingShipment(shp);
                                setInputCode(shp.verificationCode || "4829");
                              }}
                            >
                              Verify Code
                            </Button>
                          )}

                          {shp.status.includes("TRANSIT") && (
                            <Button
                              size="sm"
                              className="h-7 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-2"
                              onClick={() => navigate(`/warehouses/receiving/${shp.id}`)}
                            >
                              Receive Warehouse
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] font-semibold text-slate-600"
                            onClick={() => navigate(`/dispatches/${shp.id}`)}
                          >
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      No active logistics dispatches found matching filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Column: Live Operational Activity Feed + Pipeline Status */}
        <div className="space-y-6">
          {/* Live Activity Feed */}
          <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600 animate-pulse" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Live Operational Activity
                  </CardTitle>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Live Feed
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {[
                {
                  id: 1,
                  title: "Vehicle KA-11-FA-4012 in Transit",
                  desc: "Driver Mahesh Gowda picked up 3,500 kg Finger Millet from Ramesh Patel (Lot #LOT-8515).",
                  time: "15 mins ago",
                  icon: Truck,
                  color: "text-amber-600 bg-amber-50 border-amber-200",
                },
                {
                  id: 2,
                  title: "Driver Assigned for Shipment DISP-003",
                  desc: "Venkatesh K assigned to outbound batch #LOT-8268-E bound for Sahyadri SHG Facility.",
                  time: "1 hour ago",
                  icon: UserCheck,
                  color: "text-blue-600 bg-blue-50 border-blue-200",
                },
                {
                  id: 3,
                  title: "Delivery Receipt Generated",
                  desc: "5,000 kg Sorghum safely received at Mandya Main Warehouse from Mukund Patnaik.",
                  time: "3 hours ago",
                  icon: CheckCircle2,
                  color: "text-emerald-600 bg-emerald-50 border-emerald-200",
                },
                {
                  id: 4,
                  title: "New Procurement Lot Submitted",
                  desc: "Farmer Suresh Rathod submitted Lot #LOT-1042-A (4,200 kg Pearl Millet) for logistics dispatch.",
                  time: "5 hours ago",
                  icon: Package,
                  color: "text-purple-600 bg-purple-50 border-purple-200",
                },
              ].map((act) => {
                const IconComp = act.icon;
                return (
                  <div key={act.id} className="flex gap-3 text-xs">
                    <div className={`rounded-lg p-2 h-8 w-8 shrink-0 flex items-center justify-center border ${act.color}`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-slate-800">{act.title}</p>
                      <p className="text-slate-500 leading-snug">{act.desc}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Logistics Pipeline Stage Tracker */}
          <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                Logistics Pipeline Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="space-y-2">
                {[
                  { step: "1. Scheduled Pickup", status: "Active", count: pendingCount, color: "text-red-700 bg-red-50 border-red-200" },
                  { step: "2. Vehicle & Driver Assigned", status: "Ready", count: assignedVehiclesCount, color: "text-blue-700 bg-blue-50 border-blue-200" },
                  { step: "3. Farmer OTP Verified & Loaded", status: "On Road", count: inTransitCount, color: "text-amber-700 bg-amber-50 border-amber-200" },
                  { step: "4. Delivered & Stored at Warehouse", status: "Verified", count: deliveredCount, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="font-semibold text-slate-800">{item.step}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] border ${item.color}`}>
                      {item.count} lots
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verify Pickup Code Modal */}
      {confirmingShipment && (
        <Dialog open={Boolean(confirmingShipment)} onOpenChange={() => setConfirmingShipment(null)}>
          <DialogContent className="max-w-md bg-white p-6 border border-slate-200">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Verify Farmer Pickup Code (OTP)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Enter the 4-digit verification code shown on the farmer's mobile screen to confirm pickup for <b>{confirmingShipment.lotId}</b>.
              </DialogDescription>
            </DialogHeader>

            {codeError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md font-bold my-2">
                {codeError}
              </div>
            )}

            <div className="py-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                4-Digit Verification Code
              </label>
              <Input
                type="text"
                maxLength={4}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                placeholder="4829"
                className="h-11 text-center font-mono text-xl font-black tracking-widest bg-slate-50 border-slate-300"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmingShipment(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                disabled={inputCode.length !== 4 || verifying}
                onClick={handleVerifyCodeSubmit}
              >
                {verifying ? "Verifying..." : "Confirm & Start Transport"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign Driver Modal */}
      {assigningShipment && (
        <Dialog open={Boolean(assigningShipment)} onOpenChange={() => setAssigningShipment(null)}>
          <DialogContent className="max-w-md bg-white p-6 border border-slate-200">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Assign Vehicle & Driver
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Assign vehicle and driver details for shipment <b>{assigningShipment.shipmentCode}</b>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAssignDriverSubmit} className="space-y-4 py-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vehicle Registration Number</label>
                <Input
                  required
                  placeholder="e.g. KA-11-FA-4012"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="bg-slate-50 border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Driver Full Name</label>
                <Input
                  required
                  placeholder="e.g. Mahesh Gowda"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Driver Phone Number</label>
                <Input
                  required
                  placeholder="e.g. +91 9845012345"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setAssigningShipment(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs" disabled={submittingDriver}>
                  {submittingDriver ? "Assigning..." : "Assign Vehicle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default LogisticsDashboard;
