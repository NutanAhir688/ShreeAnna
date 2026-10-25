import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import WarehouseStats from "../components/WarehouseStats";
import WarehouseFilters from "../components/WarehouseFilters";
import WarehouseTable from "../components/WarehouseTable";
import WarehouseMapView from "../components/WarehouseMapView";
import AddWarehouseModal from "../components/AddWarehouseModal";

import { lotsApi, warehousesApi, logisticsApi } from "@/services/api";

function Warehouses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || "FpoManager";
  const isProcessor = userRole === "Processor";

  const [warehouseList, setWarehouseList] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // "table" | "map"
  const [showAddModal, setShowAddModal] = useState(false);

  const loadWarehouses = async () => {
    try {
      if (isProcessor) {
        // For SHG/Processor role: Display their dedicated facility unit with inward stock tracking
        const dispatchesData = await logisticsApi.getAll().catch(() => []);
        const dispatchesList = Array.isArray(dispatchesData) ? dispatchesData : [];
        const deliveredToProcessor = dispatchesList.filter((d) => {
          const isCompleted = d.status === "COMPLETED" || d.status === "DELIVERED" || d.warehouseReceiptStatus === "CONFIRMED";
          const dest = String(d.destinationAddress || "").toLowerCase();
          const bName = String(d.buyerName || "").toLowerCase();
          const uEmail = String(user?.email || "").toLowerCase();
          return isCompleted && (dest.includes("processor") || dest.includes("shg") || bName.includes("processor") || (user?.email && dest.includes(uEmail)));
        });

        const totalReceivedKg = deliveredToProcessor.reduce(
          (sum, d) => sum + Number(d.finalReceivedQuantityKg || d.totalQuantityKg || 0),
          0
        );
        const stockLotsCount = deliveredToProcessor.length;

        const processorWh = {
          id: "shg-processor-wh-01",
          code: "PROC-WH-001",
          name: user?.memberName ? `${user.memberName} SHG Processing Hub` : "Mahila SHG Processing & Storage Hub",
          location: "Anand Food Processing Cluster, Anand, Gujarat",
          district: "Anand",
          taluka: "Anand",
          village: "Anand City",
          manager: user?.memberName || "SHG Unit Incharge",
          contact: user?.phone || "+91 98765 44321",
          capacityNum: 10000,
          utilizedNum: totalReceivedKg,
          capacity: 10000,
          utilized: totalReceivedKg,
          usedCapacity: totalReceivedKg,
          capacityInKg: 10000,
          latitude: 22.5645,
          longitude: 72.9289,
          storageCondition: "Clean Processing Floor & Dry Storage",
          status: "Active",
          stockLots: stockLotsCount,
          isProcessorUnit: true,
        };

        setWarehouseList([processorWh]);
        return;
      }

      // For FPO, Warehouse Managers, etc: Display regional storage network
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
            isProcessorUnit: false,
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
  }, [user?.role]);

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isProcessor ? "SHG Processing Facility & Inventory Hub" : "Warehouse Operations & Storage Hubs"}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {isProcessor
              ? "Manage value-addition processing facility, raw millet inward stock from FPO procurements & product inventory."
              : "Manage rural Gujarat millet warehouses, capacity allocation & coordinates."}
          </p>
        </div>
      </div>

      <WarehouseStats warehouses={warehouseList} isProcessor={isProcessor} />

      {/* Helpful Guidance when Processor facility has 0 inventory */}
      {isProcessor && Number(warehouseList[0]?.usedCapacity || 0) === 0 && (
        <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                SHG Processing Facility Inventory is Currently Empty (0 kg)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                You are viewing your dedicated processor facility storage. To receive raw millets into this facility, place a procurement request from verified FPO regional warehouses.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/available-lots")}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold h-9 px-3.5 shrink-0 cursor-pointer shadow-xs"
          >
            Browse Warehouse Stored Millets <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      )}

      <WarehouseFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenAddModal={() => setShowAddModal(true)}
        addLabel={isProcessor ? "Add Storage Unit" : "Add Warehouse"}
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