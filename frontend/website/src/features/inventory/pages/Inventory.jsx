import { useEffect, useMemo, useState } from "react";

import InventoryStats from "../components/InventoryStats";
import InventoryFilters from "../components/InventoryFilters";
import InventoryTable from "../components/InventoryTable";

import { inventory as initialMockInventory } from "../data/inventory";
import { inventoryApi } from "@/services/api";

function Inventory() {
  const [inventoryList, setInventoryList] = useState(initialMockInventory);
  const [search, setSearch] = useState("");
  const [millet, setMillet] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    async function loadInventory() {
      try {
        const data = await inventoryApi.getBatches();
        if (data && data.length > 0) {
          const mapped = data.map((b) => ({
            id: b.batchCode || b.id,
            lotId: b.lotNumber || "LOT",
            farmerName: b.warehouseName,
            millet: b.milletType,
            quantity: `${b.quantityInKg} kg`,
            grade: b.grade,
            warehouse: b.warehouseName,
            status: b.status === "IN_STOCK" ? "In Stock" : b.status,
            date: b.receivedDate ? new Date(b.receivedDate).toLocaleDateString() : "Recent",
          }));
          setInventoryList(mapped);
        }
      } catch (err) {
        console.warn("Using local inventory mock data:", err.message);
      }
    }
    loadInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    return inventoryList.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.id.toLowerCase().includes(query) ||
        (item.lotId && item.lotId.toLowerCase().includes(query)) ||
        (item.farmerName && item.farmerName.toLowerCase().includes(query)) ||
        (item.warehouse && item.warehouse.toLowerCase().includes(query));

      const matchesMillet =
        millet === "All" || item.millet.toLowerCase().includes(millet.toLowerCase());

      const matchesStatus =
        status === "All" || item.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesMillet && matchesStatus;
    });
  }, [inventoryList, search, millet, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Warehouse & Inventory
        </h1>

        <p className="text-sm text-muted-foreground">
          Track millet stock, warehouse storage and reserved quantities.
        </p>
      </div>

      <InventoryStats />

      <InventoryFilters
        search={search}
        setSearch={setSearch}
        millet={millet}
        setMillet={setMillet}
        status={status}
        setStatus={setStatus}
      />

      <InventoryTable inventory={filteredInventory} />
    </div>
  );
}

export default Inventory;