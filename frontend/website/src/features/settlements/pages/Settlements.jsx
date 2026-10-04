import { useEffect, useMemo, useState } from "react";

import SettlementStats from "../components/SettlementStats";
import SettlementFilters from "../components/SettlementFilters";
import SettlementTable from "../components/SettlementTable";

import { settlementsApi } from "@/services/api";

function Settlements() {
  const [settlementData, setSettlementData] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    async function loadSettlements() {
      try {
        const data = await settlementsApi.getAll();
        if (Array.isArray(data)) setSettlementData(data);
      } catch (err) {
        console.error("Error loading settlements:", err);
        setSettlementData([]);
      }
    }
    loadSettlements();
  }, []);

  const filteredSettlements = useMemo(() => {
    const query = search.toLowerCase();

    return settlementData.filter((item) => {
      const matchesSearch =
        (item.id && item.id.toLowerCase().includes(query)) ||
        (item.orderId && item.orderId.toLowerCase().includes(query)) ||
        (item.buyerName && item.buyerName.toLowerCase().includes(query)) ||
        (item.lotId && item.lotId.toLowerCase().includes(query));

      const matchesStatus = status === "All" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [settlementData, search, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Settlement & Payments
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage buyer settlements, FPO margins and payment completion.
        </p>
      </div>

      <SettlementStats />

      <SettlementFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />

      <SettlementTable
        settlements={filteredSettlements}
      />
    </div>
  );
}

export default Settlements;