import { useEffect, useMemo, useState } from "react";

import DispatchStats from "../components/DispatchStats";
import DispatchFilters from "../components/DispatchFilters";
import DispatchTable from "../components/DispatchTable";

import { dispatches as initialMockDispatches } from "../data/dispatches";
import { logisticsApi } from "@/services/api";

function Dispatches() {
  const [dispatchList, setDispatchList] = useState(initialMockDispatches);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    async function loadDispatches() {
      try {
        const data = await logisticsApi.getAll();
        if (data && data.length > 0) {
          const mapped = data.map((d) => ({
            id: d.dispatchCode || d.id,
            orderId: d.dispatchCode,
            buyerName: d.driverName ? `${d.driverName} (${d.vehicleNumber})` : d.warehouseName,
            destination: d.destinationAddress,
            driver: d.driverName,
            vehicle: d.vehicleNumber,
            quantity: `${d.totalQuantityKg} kg`,
            status: d.status === "PENDING" ? "Scheduled" : d.status === "DELIVERED" ? "Delivered" : "In Transit",
            scheduledDate: d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString() : "Today",
          }));
          setDispatchList(mapped);
        }
      } catch (err) {
        console.warn("Using local dispatch mock data:", err.message);
      }
    }
    loadDispatches();
  }, []);

  const filteredDispatches = useMemo(() => {
    return dispatchList.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        (item.orderId && item.orderId.toLowerCase().includes(search.toLowerCase())) ||
        (item.buyerName && item.buyerName.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        status === "All" || item.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [dispatchList, search, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dispatch & Logistics
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage shipment preparation, dispatch and delivery tracking.
        </p>
      </div>

      <DispatchStats />

      <DispatchFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />

      <DispatchTable dispatches={filteredDispatches} />
    </div>
  );
}

export default Dispatches;