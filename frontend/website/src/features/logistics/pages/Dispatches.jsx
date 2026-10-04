import { useEffect, useMemo, useState } from "react";

import DispatchStats from "../components/DispatchStats";
import DispatchFilters from "../components/DispatchFilters";
import DispatchTable from "../components/DispatchTable";

import { logisticsApi } from "@/services/api";

function Dispatches() {
  const [dispatchList, setDispatchList] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    async function loadDispatches() {
      try {
        const data = await logisticsApi.getAll();
        if (Array.isArray(data)) {
          const mapped = data.map((d) => {
            let displayStatus = "Scheduled";
            const upperStatus = (d.status || "").toUpperCase();
            if (upperStatus.includes("PENDING") || upperStatus.includes("ISSUE")) {
              displayStatus = "Pending Dispatch";
            } else if (upperStatus.includes("DELIVERED") || upperStatus.includes("COMPLETED")) {
              displayStatus = "Delivered";
            } else if (upperStatus.includes("TRANSIT")) {
              displayStatus = "In Transit";
            } else if (upperStatus.includes("ASSIGNED")) {
              displayStatus = "Vehicle Assigned";
            }
            return {
              id: d.dispatchCode || d.id,
              orderId: d.dispatchCode,
              buyerName: d.farmerOrProcessorName || d.warehouseName || "Pending Assignment",
              destination: d.destinationAddress,
              driver: d.driverName || "Unassigned",
              vehicle: d.vehicleNumber || "Unassigned",
              millet: d.milletType || "Finger Millet",
              unit: "kg",
              quantity: `${d.totalQuantityKg} kg`,
              status: displayStatus,
              scheduledDate: d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString() : "Today",
            };
          });
          setDispatchList(mapped);
        }
      } catch (err) {
        console.error("Error loading dispatches:", err);
        setDispatchList([]);
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