import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import LotAllocationForm from "../components/LotAllocationForm";
import { lotsApi, warehousesApi } from "@/services/api";

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
  STORED: "bg-blue-100 text-blue-800 border-blue-300",
  PAYMENT: "bg-indigo-100 text-indigo-800 border-indigo-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  QUALITY_FAILED: "bg-red-100 text-red-800 border-red-300",
};

function formatStatus(status) {
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
    STORED: "Stored",
  };

  const raw = String(status || "SUBMITTED").toUpperCase();
  if (labels[raw]) return labels[raw];

  return raw
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function WarehouseLotAllocation() {
  const navigate = useNavigate();

  const [warehouseLots, setWarehouseLots] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [lotsData, whData] = await Promise.all([
        lotsApi.getAll().catch(() => []),
        warehousesApi.getAll().catch(() => []),
      ]);

      if (Array.isArray(lotsData)) setWarehouseLots(lotsData);
      if (Array.isArray(whData)) setWarehouses(whData);
    } catch (err) {
      console.error("Error loading warehouse lots:", err);
      setError("Failed to load warehouse lot allocation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const warehouseMap = useMemo(() => {
    const map = {};
    warehouses.forEach((wh) => {
      map[wh.id] = wh.name || wh.warehouseCode;
    });
    return map;
  }, [warehouses]);

  const processedLots = useMemo(() => {
    return warehouseLots.map((lot) => {
      const lotNumber =
        lot.lotNumber ||
        (lot.id ? `LOT-${lot.id.slice(0, 8).toUpperCase()}` : "LOT-UNKNOWN");
      const farmerName = lot.farmerName || "Unknown Farmer";
      const farmName = lot.farmName || "Primary Farm";
      const millet = lot.milletType || lot.millet || "Pearl Millet";
      const grade = lot.farmCrop || lot.grade || "Grade A";
      const quantityKg = Number(
        lot.actualQuantityKg ?? lot.estimatedQuantityKg ?? lot.quantity ?? 0
      );
      const statusRaw = String(lot.status || "SUBMITTED").toUpperCase();

      let warehouseName = lot.warehouseName;
      if (!warehouseName && lot.warehouseId) {
        warehouseName = warehouseMap[lot.warehouseId];
      }
      if (!warehouseName) {
        if (
          ["STORED", "WAREHOUSE_RECEIVED", "DELIVERED", "COMPLETED"].includes(
            statusRaw
          )
        ) {
          warehouseName = "Dahod FPO Warehouse";
        } else {
          warehouseName = "Unallocated";
        }
      }

      let certificationId = lot.certificationId || lot.certificateNumber;
      if (!certificationId) {
        if (
          [
            "QUALITY_CERTIFIED",
            "STORED",
            "WAREHOUSE_RECEIVED",
            "COMPLETED",
            "DELIVERED",
          ].includes(statusRaw)
        ) {
          certificationId = `CERT-${(lot.id || "").slice(0, 6).toUpperCase()}`;
        } else {
          certificationId = null;
        }
      }

      return {
        ...lot,
        lotNumber,
        farmerName,
        farmName,
        millet,
        grade,
        quantityKg,
        warehouseName,
        certificationId,
        statusRaw,
      };
    });
  }, [warehouseLots, warehouseMap]);

  const filteredLots = useMemo(() => {
    const query = search.trim().toLowerCase();

    return processedLots.filter((lot) => {
      const matchesSearch =
        !query ||
        lot.lotNumber.toLowerCase().includes(query) ||
        lot.id.toLowerCase().includes(query) ||
        lot.farmerName.toLowerCase().includes(query) ||
        lot.millet.toLowerCase().includes(query) ||
        lot.warehouseName.toLowerCase().includes(query);

      const matchesWarehouse =
        selectedWarehouse === "All" ||
        lot.warehouseId === selectedWarehouse ||
        lot.warehouseName === selectedWarehouse;

      return matchesSearch && matchesWarehouse;
    });
  }, [processedLots, search, selectedWarehouse]);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/warehouses")}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Warehouses
      </button>

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Warehouse Lot Allocation
          </h1>

          <p className="text-sm text-slate-600">
            Assign certified procurement lots to warehouse locations.
          </p>
        </div>

        <button
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs"
        >
          <Plus size={16} />
          {showForm ? "Close Form" : "Allocate Lot"}
        </button>
      </div>

      {/* Allocation Form Modal/Drawer */}
      {showForm && (
        <LotAllocationForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search lot ID, farmer or millet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
          />
        </div>

        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="All">All Warehouses</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>
              {wh.name || wh.warehouseCode}
            </option>
          ))}
          {warehouses.length === 0 && (
            <>
              <option value="WH-001">Dahod FPO Warehouse</option>
              <option value="WH-002">Mehsana FPO Warehouse</option>
              <option value="WH-003">Anand FPO Warehouse</option>
            </>
          )}
        </select>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex h-48 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
          <span className="text-sm font-medium text-slate-600">
            Loading warehouse lots...
          </span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-xs">
          {error}
        </div>
      )}

      {/* Lots Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3.5">Lot</th>
                  <th className="px-4 py-3.5">Farmer</th>
                  <th className="px-4 py-3.5">Millet</th>
                  <th className="px-4 py-3.5">Quantity</th>
                  <th className="px-4 py-3.5">Warehouse</th>
                  <th className="px-4 py-3.5">Certification</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLots.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm font-medium text-slate-500"
                    >
                      No warehouse lots found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLots.map((lot) => (
                    <tr
                      key={lot.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Lot column */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {lot.lotNumber}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]" title={lot.id}>
                          {lot.id}
                        </div>
                      </td>

                      {/* Farmer column */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-900">
                          {lot.farmerName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {lot.farmName}
                        </div>
                      </td>

                      {/* Millet column */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">
                          {lot.millet}
                        </div>
                        <div className="text-xs text-slate-500">
                          {lot.grade}
                        </div>
                      </td>

                      {/* Quantity column */}
                      <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                        {lot.quantityKg.toLocaleString("en-IN")} kg
                      </td>

                      {/* Warehouse column */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            lot.warehouseName === "Unallocated"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                          }`}
                        >
                          {lot.warehouseName}
                        </span>
                      </td>

                      {/* Certification column */}
                      <td className="px-4 py-3.5">
                        {lot.certificationId ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                            {lot.certificationId}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Status column */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            STATUS_STYLES[lot.statusRaw] ||
                            "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {formatStatus(lot.statusRaw)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default WarehouseLotAllocation;