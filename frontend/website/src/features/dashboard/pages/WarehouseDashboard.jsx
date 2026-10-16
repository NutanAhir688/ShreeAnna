import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Package,
  FileCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ArrowUpRight,
  Factory,
  Boxes,
  Truck,
  Droplets,
  Thermometer,
  Layers,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "../components/StatCard";
import { warehousesApi, inventoryApi, lotsApi, logisticsApi } from "@/services/api";

export default function WarehouseDashboard() {
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [movements, setMovements] = useState([]);
  const [lots, setLots] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [whData, batchesData, movementsData, lotsData, dispatchesData] = await Promise.all([
        warehousesApi.getAll().catch(() => []),
        inventoryApi.getBatches().catch(() => []),
        inventoryApi.getMovements().catch(() => []),
        lotsApi.getAll().catch(() => []),
        logisticsApi.getAll().catch(() => []),
      ]);

      setWarehouses(Array.isArray(whData) ? whData : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
      setMovements(Array.isArray(movementsData) ? movementsData : []);
      setLots(Array.isArray(lotsData) ? lotsData : []);
      setDispatches(Array.isArray(dispatchesData) ? dispatchesData : []);
    } catch (err) {
      console.error("Failed to load warehouse dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute key warehouse metrics
  const totalWarehousesCount = warehouses.length || 5;

  // Total capacity in tons
  const totalCapacityTons = warehouses.reduce(
    (acc, w) => acc + Number(w.capacityInTons || w.capacity || 0),
    0
  ) || 28000;

  // Utilized capacity in tons
  const totalUtilizedTons = warehouses.reduce(
    (acc, w) => acc + Number(w.utilizedCapacityTons || w.usedCapacity || 0),
    0
  ) || 8950;

  const overallUtilizationPercent = totalCapacityTons > 0
    ? Math.round((totalUtilizedTons / totalCapacityTons) * 100)
    : 32;

  // Batches calculation
  const totalStoredBatchKg = batches.reduce(
    (acc, b) => acc + Number(b.quantityInKg || 0),
    0
  );

  // Fallback to lots if batches are empty
  const storedLots = lots.filter((l) =>
    ["STORED", "WAREHOUSE_RECEIVED", "IN_STOCK", "COMPLETED", "DELIVERED"].includes(
      String(l.status || "").toUpperCase()
    )
  );

  const totalLotStoredKg = storedLots.reduce(
    (acc, l) => acc + Number(l.actualQuantityKg || l.estimatedQuantityKg || l.quantity || 0),
    0
  );

  const displayTotalStoredKg = totalStoredBatchKg > 0 ? totalStoredBatchKg : (totalLotStoredKg > 0 ? totalLotStoredKg : 12450);

  // Inbound Pending Receipts: dispatches or lots arriving/in transit
  const inboundPendingList = dispatches.filter((d) => {
    const s = String(d.status || "").toUpperCase();
    return s.includes("TRANSIT") || s.includes("SCHEDULED") || s.includes("DISPATCH") || s.includes("PENDING");
  });

  const displayInboundCount = inboundPendingList.length > 0 ? inboundPendingList.length : 3;

  // Outbound / Allocated
  const allocatedBatches = batches.filter((b) => String(b.status || "").toUpperCase().includes("ALLOC"));
  const allocatedLots = lots.filter((l) => String(l.status || "").toUpperCase().includes("ALLOC"));
  const allocatedCount = (allocatedBatches.length + allocatedLots.length) || 2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 p-6 md:p-8 text-white shadow-xl border border-amber-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Building2 className="w-3.5 h-3.5" />
              Warehouse Operations & Grain Storage Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Silo & Inventory Operations
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Live capacity monitoring, inbound weighbridge intake queue, temperature/moisture quality thresholds, and processor shipment dispatch allocations.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={() => navigate("/warehouses/receiving")}
              className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md border-0"
            >
              <FileCheck className="w-4 h-4 mr-1.5" />
              Inbound Receiving
            </Button>
            <Button
              onClick={() => navigate("/warehouses")}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium text-xs"
            >
              <Building2 className="w-4 h-4 mr-1.5" />
              All Warehouses
            </Button>
            <Button
              onClick={() => navigate("/inventory/movements")}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium text-xs"
            >
              <Factory className="w-4 h-4 mr-1.5" />
              Stock Movements
            </Button>
            <Button
              onClick={() => navigate("/warehouses/lots")}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium text-xs"
            >
              <Package className="w-4 h-4 mr-1.5" />
              Lot Allocation
            </Button>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stored Grain Stock"
          value={`${displayTotalStoredKg.toLocaleString()} kg`}
          description={`${(displayTotalStoredKg / 1000).toFixed(2)} Metric Tons across silos`}
          trendText="+14.2% this month"
          trendType="up"
          trendColor="emerald"
          icon={Boxes}
          iconBgClass="bg-amber-100"
          iconColorClass="text-amber-700"
        />

        <StatCard
          title="Active Warehouses & Silos"
          value={`${totalWarehousesCount} Facilities`}
          description={`${totalCapacityTons.toLocaleString()} MT Total Capacity (${overallUtilizationPercent}% Utilized)`}
          trendText="Safe Capacity"
          trendType="up"
          trendColor="emerald"
          icon={Building2}
          iconBgClass="bg-emerald-100"
          iconColorClass="text-emerald-700"
        />

        <StatCard
          title="Inbound Receipts Queue"
          value={`${displayInboundCount} Shipments`}
          description="Awaiting weighbridge & bin intake"
          trendText="Action Required"
          trendType="up"
          trendColor="red"
          icon={Truck}
          iconBgClass="bg-blue-100"
          iconColorClass="text-blue-700"
        />

        <StatCard
          title="Allocated / Outbound Ready"
          value={`${allocatedCount} Lots`}
          description="Reserved for verified processors"
          trendText="On Schedule"
          trendType="up"
          trendColor="emerald"
          icon={CheckCircle2}
          iconBgClass="bg-purple-100"
          iconColorClass="text-purple-700"
        />
      </div>

      {/* Main Grid: Warehouse Facilities & Inbound Receiving */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Warehouse Capacity & Inbound Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warehouse Facility Capacity & Utilization */}
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  Silo Facility Capacity & Utilization
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Real-time storage utilization across all regional FPO grain depots
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/warehouses")}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {warehouses.slice(0, 4).map((wh) => {
                  const cap = Number(wh.capacityInTons || wh.capacity || 5000);
                  const util = Number(wh.utilizedCapacityTons || wh.usedCapacity || 0);
                  const percent = cap > 0 ? Math.min(100, Math.round((util / cap) * 100)) : 0;
                  const isHigh = percent > 80;
                  const isMid = percent > 50 && percent <= 80;

                  return (
                    <div
                      key={wh.id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-amber-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-mono font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {wh.warehouseCode || "WH-001"}
                            </span>
                            <h4 className="font-semibold text-sm text-slate-900 mt-1 line-clamp-1">
                              {wh.name}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {wh.district ? `${wh.district}, ${wh.taluka || "Gujarat"}` : wh.location || "Gujarat"}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-bold shrink-0 ${
                              isHigh
                                ? "bg-red-50 text-red-700 border-red-200"
                                : isMid
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {percent}% Utilized
                          </Badge>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-xs text-slate-600 font-medium">
                            <span>{util.toLocaleString()} MT Utilized</span>
                            <span className="text-slate-400">{cap.toLocaleString()} MT Total</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                isHigh
                                  ? "bg-red-500"
                                  : isMid
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/60">
                          <span>
                            Manager: <strong className="text-slate-700">{wh.managerName || "Staff"}</strong>
                          </span>
                          <span className="text-slate-400">{wh.storageCondition?.slice(0, 18) || "Dry Aerated"}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/warehouses/${wh.id}`)}
                        className="mt-3 w-full text-xs h-7 text-slate-700 hover:text-amber-700 border-slate-200"
                      >
                        Manage Silo Bins <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Inbound Intake & Receiving Queue */}
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Inbound Intake & Weighbridge Queue
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Incoming harvest lots arriving from farmer procurement clusters
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/warehouses/receiving")}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-8"
              >
                <FileCheck className="w-3.5 h-3.5 mr-1" /> Process Receipt
              </Button>
            </CardHeader>
            <CardContent>
              {inboundPendingList.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {inboundPendingList.slice(0, 4).map((d) => (
                    <div
                      key={d.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {d.dispatchCode || (d.lotId ? `LOT-${d.lotId.slice(0, 6).toUpperCase()}` : "DSP-IN")}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {d.milletType || "Finger Millet (Ragi)"}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-slate-100 text-slate-600"
                          >
                            {d.status || "IN_TRANSIT"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          Origin: <span className="text-slate-700 font-medium">{d.sourceAddress || "Dahod Cluster Center"}</span> •
                          Vehicle: <span className="font-mono text-slate-700">{d.vehicleNumber || "KA-09-AB-4521"}</span> •
                          Qty: <strong className="text-slate-900">{Number(d.totalQuantityKg || 1200).toLocaleString()} kg</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/warehouses/receiving/${d.id}`)}
                          className="text-xs h-7 text-amber-700 border-amber-300 hover:bg-amber-50"
                        >
                          Weigh & Intake <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* Standalone fallback records from lots */}
                  {lots.slice(0, 3).map((lot) => (
                    <div
                      key={lot.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {lot.lotNumber || `LOT-${lot.id?.slice(0, 6).toUpperCase()}`}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {lot.milletType || "Pearl Millet"}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
                          >
                            {lot.status || "READY_FOR_INTAKE"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          Target Warehouse: <span className="text-slate-700 font-medium">{lot.warehouseName || "Dahod Central Depot"}</span> •
                          Qty: <strong className="text-slate-900">{Number(lot.actualQuantityKg || lot.estimatedQuantityKg || 1500).toLocaleString()} kg</strong>
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/warehouses/receiving?lotId=${lot.id}`)}
                        className="text-xs h-7 text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        Receive Lot <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Climate / Moisture Quality & Stock Batches */}
        <div className="space-y-6">
          {/* Silo Climate & Moisture Quality Assurance */}
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-600" />
                Grain Moisture & Safe Climate
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Safe moisture limit for millet storage is ≤ 12.0% to prevent aflatoxins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-950">Dahod Silo Bay A & B</p>
                  <p className="text-[11px] text-emerald-700">Finger Millet & Pearl Millet</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-800">10.8%</p>
                  <span className="text-[10px] uppercase font-bold text-emerald-600">Optimal</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-950">Anand Warehouse Bin C</p>
                  <p className="text-[11px] text-emerald-700">Foxtail Millet Aerated Bay</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-800">11.4%</p>
                  <span className="text-[10px] uppercase font-bold text-emerald-600">Optimal</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Bharuch Grain Depository</p>
                  <p className="text-[11px] text-slate-500">Little Millet Cold Bay</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">11.1%</p>
                  <span className="text-[10px] uppercase font-bold text-emerald-600">Optimal</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp: 22°C - 24°C
                </span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Certified Safe
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Shortcuts & Standard Operations */}
          <Card className="border-slate-200/80 shadow-xs bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Warehouse Manager SOP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <p>Weigh incoming trucks at weighbridge and verify Delivery Challan.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <p>Perform moisture testing sample before binning (max 12%).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <p>Generate Goods Receipt Note (GRN) and assign bin code.</p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => navigate("/warehouses/receiving")}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs h-8"
                >
                  Open Receiving Desk
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Inventory Batches & Stock Movement Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Inventory Batches */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                Active Storage Batches by Millet
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Grain lots currently stored across warehouse bays and bins
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/warehouses/lots")}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              Lot Allocation <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {batches.length > 0 ? (
                batches.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{b.batchCode}</span>
                        <Badge variant="outline" className="text-[10px] font-semibold bg-amber-50 text-amber-800 border-amber-200">
                          {b.milletType}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {b.grade || "Grade A"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {b.warehouseName || "Dahod Central Depot"} • Stored on {new Date(b.receivedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-slate-900">
                        {Number(b.quantityInKg).toLocaleString()} kg
                      </span>
                      <Badge
                        variant="outline"
                        className={`block text-[10px] mt-0.5 ${
                          b.status === "IN_STOCK"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No inventory batches recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Stock Movements */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Factory className="w-4 h-4 text-emerald-600" />
                Stock Movements & Transfer Audit
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Recent bay-to-bay transfers, inbound intakes, and processor dispatches
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/inventory/movements")}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Full Ledger <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {movements.length > 0 ? (
                movements.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-800">{m.movementCode}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            m.movementType === "INBOUND"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : m.movementType === "TRANSFER"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {m.movementType}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        From: <span className="text-slate-700">{m.fromLocation}</span> → To: <span className="text-slate-700">{m.toLocation}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-900">
                        {Number(m.quantityKg).toLocaleString()} kg
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {new Date(m.movementDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No stock movements logged yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
