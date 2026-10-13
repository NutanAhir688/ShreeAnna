import { useEffect, useMemo, useState } from "react";

import WarehouseStats from "../components/WarehouseStats";
import WarehouseFilters from "../components/WarehouseFilters";
import WarehouseTable from "../components/WarehouseTable";
import WarehouseMapView from "../components/WarehouseMapView";
import AddWarehouseModal from "../components/AddWarehouseModal";

import { lotsApi, warehousesApi } from "@/services/api";

function Warehouses() {
  const [warehouseList, setWarehouseList] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // "table" | "map"
  const [showAddModal, setShowAddModal] = useState(false);

  const loadWarehouses = async () => {
    try {
      const [data, lotsData] = await Promise.all([
        warehousesApi.getAll().catch(() => []),
        lotsApi.getAll().catch(() => []),
      ]);

      const lotsList = Array.isArray(lotsData) ? lotsData : [];

      if (Array.isArray(data)) {
        const mapped = data.map((w) => {
          const cap =
            w.capacityInTons !== undefined && w.capacityInTons !== null
              ? Number(w.capacityInTons)
              : w.capacity !== undefined && w.capacity !== null
              ? Number(w.capacity)
              : 5000;

          const dbUtilized =
            w.utilizedCapacityTons !== undefined && w.utilizedCapacityTons !== null
              ? Number(w.utilizedCapacityTons)
              : w.usedCapacity !== undefined && w.usedCapacity !== null
              ? Number(w.usedCapacity)
              : 0;

          // Calculate total allocated kg for this specific warehouse from live lots
          const allocatedForWh = lotsList.filter((l) => {
            const s = String(l.status || "").toUpperCase();

            // 1. Direct ID match
            if (
              l.warehouseId &&
              w.id &&
              String(l.warehouseId).toLowerCase() === String(w.id).toLowerCase()
            ) {
              return true;
            }

            // 2. Code match
            if (
              l.warehouseCode &&
              w.warehouseCode &&
              String(l.warehouseCode).toLowerCase() === String(w.warehouseCode).toLowerCase()
            ) {
              return true;
            }

            // 3. Name match
            if (l.warehouseName && w.name) {
              const lWh = l.warehouseName.toLowerCase().trim();
              const wName = w.name.toLowerCase().trim();
              if (lWh.includes(wName) || wName.includes(lWh)) {
                return true;
              }
            }

            // 4. Fallback: Assign unassigned stored lots ONLY to the primary warehouse (WH-GUJ-001 / Dahod)
            const isStored = [
              "STORED",
              "WAREHOUSE_RECEIVED",
              "COMPLETED",
              "DELIVERED",
            ].includes(s);

            const isPrimaryWh =
              w.warehouseCode === "WH-GUJ-001" ||
              (w.name && w.name.toLowerCase().includes("dahod")) ||
              w.id === "wh-1" ||
              w.id === "1" ||
              w.id === "aa000001-1111-1111-1111-111111111111";

            if (isStored && !l.warehouseId && !l.warehouseName && isPrimaryWh) {
              return true;
            }

            return false;
          });

          const sumKg = allocatedForWh.reduce(
            (sum, l) =>
              sum +
              Number(l.actualQuantityKg ?? l.estimatedQuantityKg ?? l.quantity ?? 0),
            0
          );

          const uti = sumKg > 0 ? sumKg : dbUtilized;
          const lotCount = allocatedForWh.length > 0 ? allocatedForWh.length : (uti > 0 ? Math.ceil(uti / 450) : 0);

          return {
            id: w.id,
            code: w.warehouseCode || w.id,
            name: w.name,
            location: w.location || `${w.village || ""}, ${w.district || ""}`,
            district: w.district || "Gujarat",
            taluka: w.taluka || "",
            village: w.village || "",
            manager: w.managerName || "Warehouse Manager",
            contact: w.contactPhone || "+91 98765 00000",
            capacityNum: cap,
            utilizedNum: uti,
            capacity: cap,
            utilized: uti,
            usedCapacity: uti,
            capacityInKg: cap,
            latitude: w.latitude,
            longitude: w.longitude,
            storageCondition: w.storageCondition || "Dry Grain, Aerated",
            status: w.status === "ACTIVE" ? "Active" : w.status || "Active",
            stockLots: lotCount,
          };
        });
        setWarehouseList(mapped);
      }
    } catch (err) {
      console.error("Error loading warehouses:", err);
      setWarehouseList([]);
    }
  };

  const handleDeleteWarehouse = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name || 'this warehouse'}"? This will soft delete the warehouse record.`)) {
      try {
        await warehousesApi.delete(id);
        loadWarehouses();
      } catch (err) {
        console.error("Failed to delete warehouse:", err);
        alert(err.message || "Failed to delete warehouse.");
      }
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const filteredWarehouses = useMemo(() => {
    const query = search.toLowerCase();

    return warehouseList.filter((warehouse) => {
      const matchesSearch =
        warehouse.name.toLowerCase().includes(query) ||
        warehouse.location.toLowerCase().includes(query) ||
        warehouse.district.toLowerCase().includes(query) ||
        warehouse.village.toLowerCase().includes(query) ||
        warehouse.code.toLowerCase().includes(query) ||
        warehouse.manager.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" ||
        warehouse.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [warehouseList, search, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Warehouse Operations & Storage Hubs
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage rural Gujarat millet warehouses, capacity allocation & coordinates.
          </p>
        </div>
      </div>

      <WarehouseStats warehouses={warehouseList} />

      <WarehouseFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      {viewMode === "table" ? (
        <WarehouseTable warehouses={filteredWarehouses} onDeleteWarehouse={handleDeleteWarehouse} />
      ) : (
        <WarehouseMapView warehouses={filteredWarehouses} />
      )}

      <AddWarehouseModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={loadWarehouses}
      />
    </div>
  );
}

export default Warehouses;