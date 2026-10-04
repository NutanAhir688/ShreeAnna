import { useEffect, useMemo, useState } from "react";

import WarehouseStats from "../components/WarehouseStats";
import WarehouseFilters from "../components/WarehouseFilters";
import WarehouseTable from "../components/WarehouseTable";

import { warehousesApi } from "@/services/api";

function Warehouses() {
  const [warehouseList, setWarehouseList] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const data = await warehousesApi.getAll();
        if (Array.isArray(data)) {
          const mapped = data.map((w) => ({
            id: w.id,
            code: w.warehouseCode || w.id,
            name: w.name,
            location: w.location,
            manager: w.managerName || "Manager",
            capacity: `${w.capacityInTons || 0} Tons`,
            utilized: `${w.utilizedCapacityTons || 0} Tons`,
            status: w.status === "ACTIVE" ? "Active" : w.status || "Active",
          }));
          setWarehouseList(mapped);
        }
      } catch (err) {
        console.error("Error loading warehouses:", err);
        setWarehouseList([]);
      }
    }
    loadWarehouses();
  }, []);

  const filteredWarehouses = useMemo(() => {
    const query = search.toLowerCase();

    return warehouseList.filter((warehouse) => {
      const matchesSearch =
        warehouse.name.toLowerCase().includes(query) ||
        warehouse.location.toLowerCase().includes(query) ||
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Warehouse Management
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage storage locations, capacity and warehouse conditions.
        </p>
      </div>

      <WarehouseStats />

      <WarehouseFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />

      <WarehouseTable
        warehouses={filteredWarehouses}
      />
    </div>
  );
}

export default Warehouses;