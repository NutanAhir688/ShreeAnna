import {
  ArrowLeft,
  Boxes,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Package,
  Plus,
  Search,
  Thermometer,
  Trash2,
  Truck,
  User,
  Warehouse as WarehouseIcon,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import AllocateLotCard from "../components/AllocateLotCard";
import { inventoryApi, logisticsApi, lotsApi, warehousesApi } from "@/services/api";

const STATUS_STYLES = {
  SUBMITTED: "bg-slate-100 text-slate-700 border-slate-300",
  QUALITY_INSPECTION: "bg-amber-100 text-amber-800 border-amber-300",
  QUALITY_CERTIFIED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  QUALITY_CERTIFICATE: "bg-emerald-100 text-emerald-800 border-emerald-300",
  PROCUREMENT_AGREEMENT: "bg-blue-100 text-blue-800 border-blue-300",
  AGREEMENT_PENDING: "bg-blue-100 text-blue-800 border-blue-300",
  AGREEMENT_ACCEPTED: "bg-blue-100 text-blue-800 border-blue-300",
  PICKUP: "bg-purple-100 text-purple-800 border-purple-300",
  PICKUP_RESCHEDULED: "bg-orange-100 text-orange-800 border-orange-300",
  WAREHOUSE_RECEIVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  DELIVERED: "bg-purple-100 text-purple-800 border-purple-300",
  STORED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  PAYMENT: "bg-indigo-100 text-indigo-800 border-indigo-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  QUALITY_FAILED: "bg-red-100 text-red-800 border-red-300",
};

function formatStatus(status) {
  const raw = String(status || "SUBMITTED").toUpperCase();
  const labels = {
    QUALITY_CERTIFIED: "Certified",
    QUALITY_CERTIFICATE: "Certified",
    QUALITY_INSPECTION: "Quality Inspection",
    PROCUREMENT_AGREEMENT: "Agreement Pending",
    AGREEMENT_PENDING: "Agreement Pending",
    AGREEMENT_ACCEPTED: "Agreement Accepted",
    WAREHOUSE_RECEIVED: "Warehouse Received",
    PICKUP_RESCHEDULED: "Pickup Rescheduled",
    DELIVERED: "Delivered",
    STORED: "Stored in Warehouse",
    COMPLETED: "Completed & Stored",
  };

  if (labels[raw]) return labels[raw];

  return raw
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function WarehouseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProcessor = user?.role === "Processor";

  const [warehouse, setWarehouse] = useState(null);
  const [allocatedLots, setAllocatedLots] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [showAllocateModal, setShowAllocateModal] = useState(false);

  const loadWarehouseData = async () => {
    try {
      setLoading(true);
      const [whData, lotsData, dispatchesData, movementsData, serverLots] = await Promise.all([
        warehousesApi.getById(id).catch(() => null),
        lotsApi.getAll().catch(() => []),
        logisticsApi.getAll().catch(() => []),
        inventoryApi.getMovements().catch(() => []),
        warehousesApi.getAllocatedLots(id).catch(() => []),
      ]);

      const fallbackWh = (id === "shg-processor-wh-01" || (!whData && isProcessor)) ? {
        id: "shg-processor-wh-01",
        warehouseCode: "PROC-WH-001",
        name: user?.memberName ? `${user.memberName} SHG Processing Hub` : "Mahila SHG Processing & Storage Hub",
        location: "Anand Food Processing Cluster, Anand, Gujarat",
        district: "Anand",
        taluka: "Anand",
        village: "Anand City",
        managerName: user?.memberName || "SHG Unit Incharge",
        contactPhone: user?.phone || "+91 98765 44321",
        capacityInTons: 10,
        utilizedCapacityTons: 0,
        storageCondition: "Clean Processing Floor & Dry Storage",
        status: "ACTIVE",
      } : null;

      const activeWh = whData || fallbackWh;
      if (activeWh) setWarehouse(activeWh);

      const allLots = Array.isArray(lotsData) ? lotsData : [];
      const allDispatches = Array.isArray(dispatchesData) ? dispatchesData : [];
      const allMovs = Array.isArray(movementsData) ? movementsData : [];
      setStockMovements(allMovs);

      const matched = [];
      const seenIds = new Set();

      // 1. Lots returned directly by backend allocation endpoint
      if (Array.isArray(serverLots) && serverLots.length > 0) {
        for (const lot of serverLots) {
          const key = String(lot.id || lot.lotNumber).toLowerCase();
          if (!seenIds.has(key)) {
            seenIds.add(key);
            matched.push({
              id: lot.id,
              lotNumber: lot.lotNumber,
              farmerName: lot.farmerName || "Farmer",
              farmName: lot.farmName || "Farm",
              millet: lot.milletType || lot.millet || "Millet",
              grade: lot.grade || "Grade A",
              quantityKg: Number(lot.quantityKg || lot.actualQuantityKg || 0),
              status: lot.status || "STORED",
              dispatchCode: lot.dispatchCode,
            });
          }
        }
      }

      // 2. Dispatches assigned or delivered to this warehouse
      const whDispatches = allDispatches.filter((d) => {
        const targetName = activeWh?.name ? activeWh.name.toLowerCase().trim() : "";
        const matchesId = id && String(d.warehouseId).toLowerCase() === String(id).toLowerCase();
        const matchesName = targetName && d.warehouseName &&
          d.warehouseName.toLowerCase().trim().includes(targetName);
        const matchesDest = targetName && d.destinationAddress &&
          d.destinationAddress.toLowerCase().trim().includes(targetName);
        return matchesId || matchesName || matchesDest;
      });

      for (const d of whDispatches) {
        const foundLot = allLots.find(
          (l) => l.id === d.lotId || l.lotNumber === d.lotId || String(l.id).toLowerCase() === String(d.lotId).toLowerCase()
        );

        const lotKey = String(foundLot?.id || d.lotId || d.id).toLowerCase();
        if (!seenIds.has(lotKey)) {
          seenIds.add(lotKey);
          matched.push({
            id: foundLot?.id || d.lotId || d.id,
            lotNumber: foundLot?.lotNumber || (d.lotId ? `LOT-${d.lotId.slice(0, 8).toUpperCase()}` : d.dispatchCode || "LOT-ALLOCATED"),
            farmerName: d.farmerOrProcessorName || foundLot?.farmerName || "Farmer",
            farmName: foundLot?.farmName || d.sourceAddress || "Registered Farm",
            millet: d.milletType || foundLot?.milletType || foundLot?.farmCrop || "Millet",
            grade: foundLot?.farmCrop || foundLot?.grade || "Grade A",
            quantityKg: Number(d.finalReceivedQuantityKg || d.totalQuantityKg || foundLot?.actualQuantityKg || foundLot?.estimatedQuantityKg || 0),
            status: d.status === "COMPLETED" || foundLot?.status === "STORED" ? "STORED" : (d.status || foundLot?.status || "STORED"),
            dispatchCode: d.dispatchCode,
          });
        }
      }

      // 3. Any lots directly matched by warehouseId or warehouseName
      for (const lot of allLots) {
        const lotKey = String(lot.id).toLowerCase();
        if (seenIds.has(lotKey)) continue;

        const matchesWh =
          (lot.warehouseId && id && String(lot.warehouseId).toLowerCase() === String(id).toLowerCase()) ||
          (lot.warehouseName && whData?.name && lot.warehouseName.toLowerCase().includes(whData.name.toLowerCase()));

        if (matchesWh) {
          seenIds.add(lotKey);
          matched.push({
            id: lot.id,
            lotNumber: lot.lotNumber,
            farmerName: lot.farmerName || "Farmer",
            farmName: lot.farmName || "Farm",
            millet: lot.milletType || lot.farmCrop || "Millet",
            grade: lot.grade || lot.farmCrop || "Grade A",
            quantityKg: Number(lot.actualQuantityKg ?? lot.agreedQuantityKg ?? lot.estimatedQuantityKg ?? 0),
            status: lot.status || "STORED",
            dispatchCode: null,
          });
        }
      }

      setAllocatedLots(matched);
    } catch (err) {
      console.error("Failed to fetch warehouse details & allocated lots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouseData();
  }, [id]);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${warehouse?.name || "this warehouse"}"? This will soft delete the warehouse record.`
      )
    ) {
      setDeleting(true);
      try {
        await warehousesApi.delete(id);
        navigate("/warehouses");
      } catch (err) {
        console.error("Failed to delete warehouse:", err);
        alert(err.message || "Failed to delete warehouse.");
      } finally {
        setDeleting(false);
      }
    }
  };

  const processedLots = useMemo(() => {
    return allocatedLots.map((lot) => {
      const lotNumber =
        lot.lotNumber ||
        (lot.id ? `LOT-${lot.id.slice(0, 8).toUpperCase()}` : "LOT-UNKNOWN");
      const farmerName = lot.farmerName || "Ramesh Patel";
      const farmName = lot.farmName || "Primary Farm";
      const millet = lot.milletType || lot.millet || "Pearl Millet";
      const grade = lot.farmCrop || lot.grade || "Grade A";
      const quantityKg = Number(
        lot.actualQuantityKg ?? lot.quantityKg ?? lot.estimatedQuantityKg ?? lot.quantity ?? 0
      );
      const statusRaw = String(lot.status || "STORED").toUpperCase();

      return {
        ...lot,
        lotNumber,
        farmerName,
        farmName,
        millet,
        grade,
        quantityKg,
        statusRaw,
      };
    });
  }, [allocatedLots]);

  const filteredLots = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return processedLots;

    return processedLots.filter(
      (lot) =>
        (lot.lotNumber && lot.lotNumber.toLowerCase().includes(query)) ||
        (lot.dispatchCode && lot.dispatchCode.toLowerCase().includes(query)) ||
        (lot.sourceFpo && lot.sourceFpo.toLowerCase().includes(query)) ||
        (lot.farmerName && lot.farmerName.toLowerCase().includes(query)) ||
        (lot.millet && lot.millet.toLowerCase().includes(query))
    );
  }, [processedLots, search]);

  const totalAllocatedKg = useMemo(() => {
    return processedLots.reduce(
      (sum, lot) => sum + (Number(lot.quantityKg) || 0),
      0
    );
  }, [processedLots]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-800" />
        <span className="text-sm font-semibold text-slate-600">
          Loading warehouse details & inventory...
        </span>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-xs">
        <h2 className="font-semibold text-slate-900 text-lg">
          Warehouse not found
        </h2>

        <button
          onClick={() => navigate("/warehouses")}
          className="mt-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 text-xs transition"
        >
          Back to Warehouses
        </button>
      </div>
    );
  }

  const rawCap =
    warehouse.capacityInTons !== undefined && warehouse.capacityInTons !== null
      ? Number(warehouse.capacityInTons)
      : warehouse.capacity !== undefined && warehouse.capacity !== null && Number(warehouse.capacity) > 0
      ? Number(warehouse.capacity)
      : 5000;

  const rawUsed =
    warehouse.utilizedCapacityTons !== undefined &&
    warehouse.utilizedCapacityTons !== null
      ? Number(warehouse.utilizedCapacityTons)
      : warehouse.usedCapacity !== undefined && warehouse.usedCapacity !== null
      ? Number(warehouse.usedCapacity)
      : 0;

  const capKg = rawCap > 0 ? rawCap : 5000;
  const usedKg = totalAllocatedKg > 0 ? totalAllocatedKg : rawUsed;
  const availKg = Math.max(0, capKg - usedKg);
  const utilization = capKg > 0 ? Math.round((usedKg / capKg) * 100) : 0;
  const stockLotsCount = processedLots.length > 0 ? processedLots.length : (usedKg > 0 ? Math.ceil(usedKg / 450) : 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Navigation Top Bar */}
      <button
        onClick={() => navigate("/warehouses")}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Warehouses
      </button>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {warehouse.name || warehouse.Name || "Warehouse Details"}
            </h1>
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
              {warehouse.status || "ACTIVE"}
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium mt-1">
            {warehouse.code || warehouse.warehouseCode || "WH-GUJ-001"} ·{" "}
            {warehouse.location ||
              `${warehouse.district || "District"}, Gujarat`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isProcessor ? (
            <button
              onClick={() => navigate("/available-lots")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 px-4 py-2 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              Procure from FPO
            </button>
          ) : (
            <button
              onClick={() => setShowAllocateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 px-4 py-2 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              Allocate Lot to Warehouse
            </button>
          )}
          {!isProcessor && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-xs cursor-pointer"
            >
              <Trash2 size={15} />
              {deleting ? "Deleting..." : "Delete Warehouse"}
            </button>
          )}
        </div>
      </div>

      {/* Capacity Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2.5">
              <Package size={20} className="text-emerald-800" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                Storage Capacity & Inventory Utilization
              </h2>

              <p className="text-xs text-slate-500 font-medium">
                {isProcessor
                  ? "Live storage capacity occupied by raw millets procured directly from FPO"
                  : "Live warehouse capacity allocated to certified procurement lots"}
              </p>
            </div>
          </div>

          <span className="text-2xl font-black text-slate-900">
            {utilization}%
          </span>
        </div>

        <div className="mt-4 h-3.5 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              utilization > 90
                ? "bg-red-600"
                : utilization > 75
                ? "bg-amber-500"
                : "bg-emerald-700"
            }`}
            style={{
              width: `${utilization}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs font-semibold">
          <span className="text-slate-800">
            Occupied Stock:{" "}
            <strong className="text-slate-900 font-black">
              {usedKg.toLocaleString("en-IN")} kg
            </strong>
          </span>

          <span className="text-emerald-700">
            Available Capacity:{" "}
            <strong className="font-extrabold">
              {availKg.toLocaleString("en-IN")} kg
            </strong>
          </span>
        </div>
      </div>

      {/* Info Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-800" />
            Warehouse Location & Manager Info
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 pt-1">
            <InfoItem
              icon={WarehouseIcon}
              label="Warehouse Name"
              value={warehouse.name || warehouse.Name}
            />

            <InfoItem
              icon={Boxes}
              label={isProcessor ? "Inward Millet Batches" : "Allocated Stock Lots"}
              value={isProcessor ? `${stockLotsCount} Inward Batches` : `${stockLotsCount} Certified Lots`}
            />

            <InfoItem
              icon={MapPin}
              label="District / Region"
              value={
                warehouse.location ||
                `${warehouse.district || warehouse.District || ""}, Gujarat`
              }
            />

            <InfoItem
              icon={MapPin}
              label="Full Address"
              value={
                warehouse.address ||
                warehouse.location ||
                `${warehouse.village || ""}, ${warehouse.district || ""}`
              }
            />

            <InfoItem
              icon={User}
              label="Warehouse Manager"
              value={warehouse.managerName || warehouse.manager || "N/A"}
            />

            <InfoItem
              icon={User}
              label="Contact Number"
              value={warehouse.contactPhone || warehouse.contact || "N/A"}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-emerald-800" />
            Storage Conditions & Supported Grains
          </h2>

          <div className="space-y-4 pt-1">
            <InfoItem
              icon={Thermometer}
              label="Storage Condition"
              value={warehouse.storageCondition || "Dry Grain, Aerated & Fumigated"}
            />

            <InfoItem
              icon={Package}
              label="Supported Millet Types"
              value={
                Array.isArray(warehouse.milletTypes)
                  ? warehouse.milletTypes.join(", ")
                  : warehouse.milletTypes ||
                    "Pearl Millet (Bajra), Sorghum (Jowar), Finger Millet (Ragi)"
              }
            />

            <InfoItem
              icon={Package}
              label="Total Capacity Limit"
              value={`${capKg.toLocaleString("en-IN")} kg`}
            />
          </div>
        </div>
      </div>

      {/* ALLOCATED / INWARD STOCK TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Boxes className="h-5 w-5 text-emerald-800" />
              {isProcessor ? "Inward Raw Millet Inventory from FPO" : "Allocated Procurement Lots in Warehouse"}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isProcessor
                ? "Verified raw millet stock procured directly from regional FPO warehouses and received at this processing facility."
                : "Certified procurement lots assigned and stored in this warehouse facility."}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={isProcessor ? "Search shipment or millet variety..." : "Search lot or farmer..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">{isProcessor ? "Shipment Ref" : "Lot ID"}</th>
                <th className="p-3">{isProcessor ? "Source FPO Storage" : "Farmer / Farm"}</th>
                <th className="p-3">Millet Commodity</th>
                <th className="p-3">{isProcessor ? "Received Qty" : "Allocated Qty"}</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLots.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-slate-500 font-medium"
                  >
                    {isProcessor
                      ? "No inward raw millet shipments currently received at this facility."
                      : "No procurement lots currently allocated to this warehouse."}
                  </td>
                </tr>
              ) : (
                filteredLots.map((lot) => (
                  <tr
                    key={lot.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {isProcessor ? (
                      <td className="p-3 font-semibold text-slate-900">
                        <div className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400">
                          {lot.dispatchCode || `DSP-${String(lot.id).slice(0, 8).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          Direct FPO Purchase
                        </div>
                      </td>
                    ) : (
                      <td className="p-3 font-semibold text-slate-900">
                        <div>{lot.lotNumber}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                          {lot.id}
                        </div>
                      </td>
                    )}

                    {isProcessor ? (
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {lot.sourceFpo || "Gujarat FPO Central Storage, Anand"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Regional FPO Warehouse Dispatch
                        </div>
                      </td>
                    ) : (
                      <td className="p-3">
                        <div className="font-bold text-slate-900">
                          {lot.farmerName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {lot.farmName}
                        </div>
                      </td>
                    )}

                    <td className="p-3">
                      <div className="font-medium text-slate-800">
                        {lot.millet}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lot.grade}
                      </div>
                    </td>

                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                      {lot.quantityKg.toLocaleString("en-IN")} kg
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                          STATUS_STYLES[lot.statusRaw] ||
                          "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}
                      >
                        {formatStatus(lot.statusRaw)}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      {isProcessor ? (
                        <button
                          onClick={() => navigate(lot.dispatchId ? `/dispatches/${lot.dispatchId}` : "/dispatches")}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
                        >
                          <Truck size={13} className="text-emerald-700" />
                          View Shipment
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/procurement-lots/${lot.id}`)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition shadow-2xs"
                        >
                          <FileText size={13} />
                          View Lot
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate Lot Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <AllocateLotCard
              initialWarehouseId={id}
              onCancel={() => setShowAllocateModal(false)}
              onSuccess={() => {
                setShowAllocateModal(false);
                loadWarehouseData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="rounded-lg bg-slate-100 p-2 text-slate-600 shrink-0">
        <Icon size={16} />
      </div>

      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </p>

        <p className="mt-0.5 text-xs font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default WarehouseDetails;