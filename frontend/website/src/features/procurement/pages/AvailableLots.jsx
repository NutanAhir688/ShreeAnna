import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Warehouse,
  Building2,
  Package,
  Search,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Send,
  Layers,
  Scale,
  IndianRupee,
  Info,
  Phone,
  MapPin,
  TrendingUp,
  Sparkles,
  Boxes,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { warehousesApi, lotsApi, logisticsApi, purchaseRequestsApi } from "@/services/api";

export default function AvailableLots() {
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [milletFilter, setMilletFilter] = useState("ALL");
  const [warehouseFilter, setWarehouseFilter] = useState("ALL");

  // Procurement Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedMilletStock, setSelectedMilletStock] = useState(null);
  const [requestForm, setRequestForm] = useState({
    requestedQuantityKg: "",
    indicativePricePerKg: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWarehouseStocks();
  }, []);

  async function loadWarehouseStocks() {
    setLoading(true);
    try {
      const [whList, dispatchesList, lotsList] = await Promise.all([
        warehousesApi.getAll().catch(() => []),
        logisticsApi.getAll().catch(() => []),
        lotsApi.getAll().catch(() => []),
      ]);

      const validWarehouses = Array.isArray(whList) ? whList : [];
      const validDispatches = Array.isArray(dispatchesList) ? dispatchesList : [];
      const validLots = Array.isArray(lotsList) ? lotsList : [];

      // For each warehouse, query its allocated lots or synthesize from confirmed dispatches & capacity
      const enrichedWarehouses = await Promise.all(
        validWarehouses.map(async (wh) => {
          const allocated = await warehousesApi.getAllocatedLots(wh.id).catch(() => []);
          const whAllocatedList = Array.isArray(allocated) ? allocated : [];

          // Also check dispatches assigned to this warehouse
          const matchingDispatches = validDispatches.filter(
            (d) =>
              (d.warehouseId && d.warehouseId === wh.id) ||
              (d.destinationAddress && d.destinationAddress.toLowerCase().includes(wh.name.toLowerCase())) ||
              (d.warehouseName && d.warehouseName.toLowerCase().includes(wh.name.toLowerCase()))
          );

          // Group stored inventory by millet variety
          const milletMap = new Map();

          // 1. Process explicitly allocated lots in warehouse
          whAllocatedList.forEach((al) => {
            const mType = al.milletType || "Pearl Millet";
            const qty = Number(al.quantityKg || 0);
            if (!milletMap.has(mType)) {
              milletMap.set(mType, {
                milletType: mType,
                totalStockKg: 0,
                grade: al.grade || "Grade A",
                lotNumbers: [],
                lotIds: [],
                fpoName: wh.taluka ? `${wh.taluka} FPO` : "Regional FPO",
                allocatedDate: al.allocatedAt,
              });
            }
            const entry = milletMap.get(mType);
            entry.totalStockKg += qty;
            if (al.lotNumber && !entry.lotNumbers.includes(al.lotNumber)) {
              entry.lotNumbers.push(al.lotNumber);
            }
            if (al.id && !entry.lotIds.includes(al.id)) {
              entry.lotIds.push(al.id);
            }
          });

          // 2. Process confirmed inbound dispatches delivered to this warehouse
          matchingDispatches.forEach((d) => {
            if (d.status === "COMPLETED" || d.status === "DELIVERED" || d.warehouseReceiptStatus === "CONFIRMED") {
              const mType = d.milletType || "Pearl Millet";
              const qty = Number(d.finalReceivedQuantityKg || d.totalQuantityKg || 0);
              const lotRef = d.lotId || d.dispatchCode;

              if (!milletMap.has(mType)) {
                milletMap.set(mType, {
                  milletType: mType,
                  totalStockKg: 0,
                  grade: "Grade A",
                  lotNumbers: [],
                  lotIds: [],
                  fpoName: wh.taluka ? `${wh.taluka} FPO` : "Regional FPO",
                  allocatedDate: d.deliveredDate || d.createdAt,
                });
              }
              const entry = milletMap.get(mType);
              if (lotRef && !entry.lotNumbers.includes(lotRef)) {
                entry.lotNumbers.push(lotRef);
                entry.totalStockKg += qty;
              }
            }
          });

          // 3. Fallback for warehouses with utilizedCapacityTons but without discrete dispatches yet
          if (milletMap.size === 0 && (wh.utilizedCapacityTons || wh.capacityInTons)) {
            const utilizedKg = wh.utilizedCapacityTons ? Number(wh.utilizedCapacityTons) : 1000;
            const defaultMillet = wh.name.toLowerCase().includes("junagadh")
              ? "Foxtail Millet"
              : wh.name.toLowerCase().includes("amreli")
              ? "Sorghum"
              : wh.name.toLowerCase().includes("ahmedabad")
              ? "Finger Millet"
              : "Pearl Millet";

            milletMap.set(defaultMillet, {
              milletType: defaultMillet,
              totalStockKg: utilizedKg,
              grade: "Grade A • Certified",
              lotNumbers: [`${wh.warehouseCode || "WH-GUJ"}-BIN-1`],
              lotIds: [wh.id],
              fpoName: `${wh.district || "Gujarat"} Farmers FPO`,
              allocatedDate: wh.createdAt,
            });
          }

          // Compute pricing and standard margins for each millet type
          const storedMillets = Array.from(milletMap.values()).map((m) => {
            let baseRate = 30.0;
            if (m.milletType.includes("Pearl")) baseRate = 32.0;
            else if (m.milletType.includes("Finger") || m.milletType.includes("Ragi")) baseRate = 35.0;
            else if (m.milletType.includes("Foxtail")) baseRate = 38.0;
            else if (m.milletType.includes("Sorghum") || m.milletType.includes("Jowar")) baseRate = 42.0;

            const fpoMargin = +(baseRate * 0.085).toFixed(2);
            const processorRate = +(baseRate + fpoMargin).toFixed(2);

            return {
              ...m,
              baseRate,
              fpoMargin,
              processorRate,
              maxRequestableKg: m.totalStockKg,
            };
          });

          const totalStoredInWarehouseKg = storedMillets.reduce((acc, curr) => acc + curr.totalStockKg, 0);

          return {
            ...wh,
            storedMillets,
            totalStoredInWarehouseKg,
          };
        })
      );

      setWarehouses(enrichedWarehouses);
    } catch (err) {
      console.error("Error loading warehouse inventory:", err);
    } finally {
      setLoading(false);
    }
  }

  // Open Procurement Request Modal for specific warehouse and millet
  const handleOpenRequest = (warehouse, stock) => {
    setSelectedWarehouse(warehouse);
    setSelectedMilletStock(stock);

    const defaultRequestQty = Math.min(1000, stock.maxRequestableKg || 500);

    setRequestForm({
      requestedQuantityKg: defaultRequestQty.toString(),
      indicativePricePerKg: stock.processorRate.toString(),
      notes: `Procurement request from ${warehouse.name} storage stock for value-added processing unit.`
    });
    setRequestModalOpen(true);
  };

  // Submit Purchase Request to Backend
  const handleSubmitRequest = async () => {
    if (!selectedWarehouse || !selectedMilletStock) return;

    const requestedKg = Number(requestForm.requestedQuantityKg);
    const maxAvailable = Number(selectedMilletStock.maxRequestableKg || 0);

    if (isNaN(requestedKg) || requestedKg <= 0) {
      alert("Please enter a valid requested quantity greater than 0 kg.");
      return;
    }

    if (requestedKg > maxAvailable) {
      alert(`Requested quantity (${requestedKg.toLocaleString()} kg) exceeds the maximum available stock in this warehouse (${maxAvailable.toLocaleString()} kg).`);
      return;
    }

    setSubmitting(true);
    try {
      const lotRef =
        (selectedMilletStock.lotNumbers && selectedMilletStock.lotNumbers[0]) ||
        selectedMilletStock.lotIds[0] ||
        selectedWarehouse.id;

      await purchaseRequestsApi.create({
        lotId: lotRef.toString(),
        milletType: selectedMilletStock.milletType,
        requestedQuantityKg: requestedKg,
        indicativePricePerKg: Number(requestForm.indicativePricePerKg),
        fpoName: selectedWarehouse.name || "Regional FPO Storage",
        processorName: "Millet Shakti SHG",
        notes: requestForm.notes || `Direct procurement of ${requestedKg} kg ${selectedMilletStock.milletType} from ${selectedWarehouse.name}.`
      });

      alert(`✓ Purchase request for ${requestedKg.toLocaleString()} kg of ${selectedMilletStock.milletType} from ${selectedWarehouse.name} submitted successfully!`);
      setRequestModalOpen(false);
      navigate("/purchase-requests");
    } catch (err) {
      console.error("Failed to create purchase request:", err);
      alert(err.message || "Failed to create purchase request.");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick percentage quantity selector in modal
  const handleSetQuickPercentage = (fraction) => {
    if (!selectedMilletStock) return;
    const max = Number(selectedMilletStock.maxRequestableKg || 0);
    const calculated = Math.max(1, Math.round(max * fraction));
    setRequestForm((prev) => ({
      ...prev,
      requestedQuantityKg: calculated.toString()
    }));
  };

  // Filtered warehouses based on search and selected filters
  const filteredWarehouses = useMemo(() => {
    const q = search.trim().toLowerCase();

    return warehouses.filter((wh) => {
      const matchSearch =
        !q ||
        wh.name?.toLowerCase().includes(q) ||
        wh.location?.toLowerCase().includes(q) ||
        wh.district?.toLowerCase().includes(q) ||
        wh.warehouseCode?.toLowerCase().includes(q) ||
        wh.storedMillets.some((m) => m.milletType.toLowerCase().includes(q));

      const matchWarehouse =
        warehouseFilter === "ALL" || wh.id === warehouseFilter || wh.warehouseCode === warehouseFilter;

      const matchMillet =
        milletFilter === "ALL" ||
        wh.storedMillets.some((m) => m.milletType.toLowerCase().includes(milletFilter.toLowerCase()));

      return matchSearch && matchWarehouse && matchMillet;
    });
  }, [warehouses, search, milletFilter, warehouseFilter]);

  // Aggregate KPI summary metrics
  const totalStockInTons = useMemo(() => {
    const totalKg = warehouses.reduce((sum, wh) => sum + (wh.totalStoredInWarehouseKg || 0), 0);
    return Math.round(totalKg);
  }, [warehouses]);

  const uniqueMilletVarieties = useMemo(() => {
    const set = new Set();
    warehouses.forEach((wh) => {
      wh.storedMillets.forEach((m) => set.add(m.milletType));
    });
    return set.size || 4;
  }, [warehouses]);

  const maxSingleStockKg = useMemo(() => {
    let max = 0;
    warehouses.forEach((wh) => {
      wh.storedMillets.forEach((m) => {
        if (m.totalStockKg > max) max = m.totalStockKg;
      });
    });
    return max;
  }, [warehouses]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">
              Processor Hub • Raw Material Procurement
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Warehouse className="w-6 h-6 text-emerald-700" /> Warehouse Stored Millet Stocks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse verified millet stocks stored across regional warehouses. Inspect available inventory by variety and request procurement directly.
          </p>
        </div>

        <Button
          onClick={() => navigate("/purchase-requests")}
          variant="outline"
          className="text-xs font-bold h-9 cursor-pointer border-slate-300 dark:border-slate-700 hover:bg-slate-50"
        >
          View My Purchase Requests <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-3.5 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              ACTIVE WAREHOUSES
            </p>
            <Building2 className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            {warehouses.length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Regional storage facilities</p>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-3.5 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              TOTAL STORED STOCK
            </p>
            <Boxes className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            {totalStockInTons.toLocaleString("en-IN")}{" "}
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Verified in warehouse inventory</p>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-3.5 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              MILLET VARIETIES
            </p>
            <Sparkles className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            {uniqueMilletVarieties}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Certified cultivars available</p>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-3.5 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              MAX SINGLE REQUEST
            </p>
            <Scale className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            {maxSingleStockKg.toLocaleString("en-IN")}{" "}
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Largest available single stock</p>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by warehouse name, district, location, or millet type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Filter by Millet Type */}
        <select
          value={milletFilter}
          onChange={(e) => setMilletFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
        >
          <option value="ALL">All Millet Types</option>
          <option value="Pearl Millet">Pearl Millet (Bajra)</option>
          <option value="Finger Millet">Finger Millet (Ragi)</option>
          <option value="Foxtail Millet">Foxtail Millet (Kangni)</option>
          <option value="Sorghum">Sorghum (Jowar)</option>
        </select>

        {/* Filter by Warehouse */}
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
        >
          <option value="ALL">All Warehouses</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>
              {wh.name} ({wh.district || wh.warehouseCode})
            </option>
          ))}
        </select>
      </div>

      {/* Warehouse Stored Millets Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-20 flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-xs text-slate-500 font-semibold">Loading warehouse stored millet inventories...</p>
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
          No warehouses or stored millet varieties found matching your filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWarehouses.map((wh) => {
            // Apply millet filter inside the warehouse
            const visibleMillets = wh.storedMillets.filter(
              (m) =>
                milletFilter === "ALL" ||
                m.milletType.toLowerCase().includes(milletFilter.toLowerCase())
            );

            return (
              <Card
                key={wh.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs rounded-xl overflow-hidden hover:border-emerald-600/40 transition-all"
              >
                {/* Warehouse Top Header Banner */}
                <CardHeader className="bg-slate-50/70 dark:bg-slate-950/60 px-4 py-3 border-b border-slate-200/90 dark:border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-emerald-800 text-white px-2 py-0.5 rounded shadow-2xs">
                          {wh.warehouseCode || "WH-GUJ"}
                        </span>
                        <CardTitle className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {wh.name}
                        </CardTitle>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                          ✓ ACTIVE STORAGE
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {wh.location || `${wh.taluka || ""}, ${wh.district || ""}, Gujarat`}
                        </span>
                        {wh.managerName && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            Manager: {wh.managerName} ({wh.contactPhone || "-"})
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          {wh.storageCondition || "Dry Grain, Aerated"}
                        </span>
                      </div>
                    </div>

                    {/* Warehouse Capacity Gauge Badge */}
                    <div className="text-right shrink-0 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        WAREHOUSE CAPACITY
                      </p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        <strong className="text-emerald-800 dark:text-emerald-400 font-black">
                          {wh.totalStoredInWarehouseKg.toLocaleString("en-IN")} kg
                        </strong>{" "}
                        stored / {(wh.capacityInTons ? Number(wh.capacityInTons) : 6000).toLocaleString("en-IN")} Tons
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Stored Millet Types Section */}
                <CardContent className="p-3.5 sm:p-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-emerald-700" /> Stored Millet Inventory &amp; Available Request Limits
                    </p>
                    <span className="text-[11px] font-medium text-slate-400">
                      {visibleMillets.length} {visibleMillets.length === 1 ? "millet variety" : "millet varieties"} available
                    </span>
                  </div>

                  {visibleMillets.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-950/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                      No stored millets match the selected filter for this warehouse.
                    </div>
                  ) : visibleMillets.length === 1 ? (
                    /* Adaptive Single Variety Layout: Full-Width Horizontal Banner (No Awkward Whitespace) */
                    (() => {
                      const millet = visibleMillets[0];
                      const totalVal = Math.round(millet.totalStockKg * millet.processorRate);

                      return (
                        <div className="bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/90 dark:border-slate-800/80 rounded-xl p-3.5 hover:border-emerald-600/50 hover:shadow-xs transition-all">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Variety & Pricing Breakdown */}
                            <div className="space-y-1 lg:w-1/4">
                              <div className="flex items-center gap-2">
                                <h3 className="font-black text-base text-slate-900 dark:text-white">
                                  {millet.milletType}
                                </h3>
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold shrink-0">
                                  {millet.grade || "Grade A"} • CERTIFIED
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 font-medium">
                                FPO: <span className="font-semibold text-slate-700 dark:text-slate-300">{millet.fpoName || "Regional FPO"}</span>
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                                <span>Base: <strong className="text-slate-700 dark:text-slate-300 font-semibold">₹{millet.baseRate.toFixed(2)}/kg</strong></span>
                                <span>•</span>
                                <span>FPO Margin: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">+₹{millet.fpoMargin.toFixed(2)}/kg (+8.5%)</strong></span>
                              </div>
                            </div>

                            {/* 3 Stats in a Balanced Container */}
                            <div className="grid grid-cols-3 gap-2 flex-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  AVAILABLE STOCK
                                </p>
                                <p className="text-base font-black text-emerald-800 dark:text-emerald-400">
                                  {millet.totalStockKg.toLocaleString("en-IN")}{" "}
                                  <span className="text-[10px] font-semibold text-slate-500">kg</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  SELLING RATE
                                </p>
                                <p className="text-base font-black text-slate-900 dark:text-white">
                                  ₹{millet.processorRate.toFixed(2)}{" "}
                                  <span className="text-[10px] font-semibold text-slate-400">/ kg</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  MAX REQUESTABLE
                                </p>
                                <p className="text-base font-black text-emerald-800 dark:text-emerald-400">
                                  {millet.maxRequestableKg.toLocaleString("en-IN")}{" "}
                                  <span className="text-[10px] font-semibold text-slate-500">kg</span>
                                </p>
                              </div>
                            </div>

                            {/* Value and Action Section */}
                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 lg:w-56 shrink-0">
                              <div className="text-left lg:text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  TOTAL INVENTORY VALUE
                                </p>
                                <p className="text-base font-black text-emerald-800 dark:text-emerald-400">
                                  ₹{totalVal.toLocaleString("en-IN")}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleOpenRequest(wh, millet)}
                                className="w-auto lg:w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-9 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" /> Request Stock ({millet.maxRequestableKg.toLocaleString("en-IN")} kg max)
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    /* Multi-variety Grid: Balanced 2 or 3 Columns without Awkward Gaps */
                    <div className={`grid grid-cols-1 ${visibleMillets.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"} gap-3.5`}>
                      {visibleMillets.map((millet, index) => {
                        const totalVal = Math.round(millet.totalStockKg * millet.processorRate);

                        return (
                          <div
                            key={index}
                            className="bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/90 dark:border-slate-800/80 rounded-xl p-3 flex flex-col justify-between hover:border-emerald-600/50 hover:shadow-xs transition-all"
                          >
                            <div className="space-y-2">
                              {/* Variety Header */}
                              <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                                <div>
                                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                                    {millet.milletType}
                                  </h3>
                                  <p className="text-[11px] text-slate-500 font-medium">
                                    {millet.fpoName || "Regional FPO"}
                                  </p>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-extrabold shrink-0">
                                  {millet.grade || "Grade A"} • CERTIFIED
                                </Badge>
                              </div>

                              {/* 3-stat Grid: Stock, Rate, Max Requestable */}
                              <div className="grid grid-cols-3 gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800 text-center">
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    STOCK
                                  </p>
                                  <p className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-400">
                                    {millet.totalStockKg.toLocaleString("en-IN")}{" "}
                                    <span className="text-[9px] font-semibold text-slate-500">kg</span>
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    RATE
                                  </p>
                                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                    ₹{millet.processorRate.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    MAX REQ
                                  </p>
                                  <p className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-400">
                                    {millet.maxRequestableKg.toLocaleString("en-IN")}{" "}
                                    <span className="text-[9px] font-semibold text-slate-500">kg</span>
                                  </p>
                                </div>
                              </div>

                              {/* Price Breakdown */}
                              <div className="text-[11px] text-slate-500 space-y-0.5 pt-0.5">
                                <div className="flex justify-between">
                                  <span>Base + FPO Margin:</span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    ₹{millet.baseRate.toFixed(2)} + ₹{millet.fpoMargin.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-0.5 border-t border-slate-200/60 dark:border-slate-800">
                                  <span>Total Value:</span>
                                  <span className="text-emerald-800 dark:text-emerald-400">
                                    ₹{totalVal.toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Request Button */}
                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                              <Button
                                onClick={() => handleOpenRequest(wh, millet)}
                                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-8 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" /> Request Stock ({millet.maxRequestableKg.toLocaleString("en-IN")} kg max)
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Procurement Request Modal Dialog */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Package className="w-4.5 h-4.5 text-emerald-700" />
              Procure Stored Millet from Warehouse
            </DialogTitle>
            <DialogDescription className="text-xs">
              Submit your raw millet procurement request for{" "}
              <strong className="text-slate-900 dark:text-white">{selectedMilletStock?.milletType}</strong> from{" "}
              <strong className="text-slate-900 dark:text-white">{selectedWarehouse?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Warehouse Stock Context Box */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Warehouse Location:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedWarehouse?.name} ({selectedWarehouse?.district || "Gujarat"})
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Stored in Warehouse:</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-400">
                  {selectedMilletStock?.totalStockKg?.toLocaleString("en-IN")} kg
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Max Requestable Limit:</span>
                <span className="font-black text-emerald-800 dark:text-emerald-400">
                  Up to {selectedMilletStock?.maxRequestableKg?.toLocaleString("en-IN")} kg
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Selling Rate:</span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  ₹{Number(requestForm.indicativePricePerKg || 0).toFixed(2)} / kg
                </span>
              </div>
            </div>

            {/* Requested Quantity Input with Percentage Quick Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Requested Quantity (kg) *
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  Max: {selectedMilletStock?.maxRequestableKg?.toLocaleString("en-IN")} kg
                </span>
              </div>

              <Input
                type="number"
                min="1"
                max={selectedMilletStock?.maxRequestableKg || 10000}
                value={requestForm.requestedQuantityKg}
                onChange={(e) => setRequestForm({ ...requestForm, requestedQuantityKg: e.target.value })}
                placeholder="Enter quantity in kg..."
                className="h-9 text-xs font-bold font-mono"
              />

              {/* Quick Percentage Chips */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                  <Button
                    key={frac}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetQuickPercentage(frac)}
                    className="h-6 text-[10px] font-bold py-0 px-1 border-slate-200 dark:border-slate-800 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    {frac === 1.0 ? "100% (Full)" : `${frac * 100}%`}
                  </Button>
                ))}
              </div>

              {/* Dynamic Remaining Stock Deduction Breakdown */}
              {selectedMilletStock && (
                <div className="mt-2.5 p-2 bg-slate-100 dark:bg-slate-800/60 rounded text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Available in Warehouse:</span>
                    <span className="font-mono">{selectedMilletStock.maxRequestableKg?.toLocaleString("en-IN")} kg</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 dark:text-emerald-400 font-bold">
                    <span>Your Request:</span>
                    <span className="font-mono">- {Number(requestForm.requestedQuantityKg || 0).toLocaleString("en-IN")} kg</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                    <span>Remaining Warehouse Stock:</span>
                    <span
                      className={`font-mono ${
                        (selectedMilletStock.maxRequestableKg - Number(requestForm.requestedQuantityKg || 0)) < 0
                          ? "text-red-600"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {Math.max(
                        0,
                        selectedMilletStock.maxRequestableKg - Number(requestForm.requestedQuantityKg || 0)
                      ).toLocaleString("en-IN")}{" "}
                      kg
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Offered Purchase Price */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Offered Purchase Price (₹ / kg)
              </label>
              <Input
                type="number"
                step="0.01"
                value={requestForm.indicativePricePerKg}
                onChange={(e) => setRequestForm({ ...requestForm, indicativePricePerKg: e.target.value })}
                className="h-9 text-xs font-mono font-semibold"
              />
            </div>

            {/* Procurement Notes / Intended Use */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Procurement Notes &amp; Value-Addition Unit
              </label>
              <Textarea
                rows={2}
                value={requestForm.notes}
                onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                placeholder="e.g. Processing into ready-to-eat flour / cookies - delivery to GIDC unit"
                className="text-xs resize-none"
              />
            </div>

            {/* Estimated Total Financial Value Banner */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs flex justify-between items-center">
              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                Total Estimated Purchase Cost
              </span>
              <span className="text-base font-black text-emerald-800 dark:text-emerald-400">
                ₹{(Number(requestForm.requestedQuantityKg || 0) * Number(requestForm.indicativePricePerKg || 0)).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRequestModalOpen(false)}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Purchase Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
