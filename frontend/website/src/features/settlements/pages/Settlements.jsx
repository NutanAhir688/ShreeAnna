import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SettlementStats from "../components/SettlementStats";
import SettlementFilters from "../components/SettlementFilters";
import SettlementTable from "../components/SettlementTable";

import { settlementsApi } from "@/services/api";

function Settlements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get("status") || "All";

  const [settlementData, setSettlementData] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(urlStatus);
  const [loading, setLoading] = useState(true);

  // Sync internal status with URL query params when URL changes
  useEffect(() => {
    if (urlStatus && urlStatus !== status) {
      setStatus(urlStatus);
    }
  }, [urlStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        settlementsApi.getAll(),
        settlementsApi.getStats(),
      ]);

      if (Array.isArray(data)) {
        setSettlementData(data);
      } else {
        setSettlementData([]);
      }

      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.error("Error loading settlements:", err);
      setSettlementData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === "All") {
      searchParams.delete("status");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ status: newStatus });
    }
  };

  const filteredSettlements = useMemo(() => {
    const query = search.toLowerCase().trim();

    return settlementData.filter((item) => {
      const matchesSearch =
        !query ||
        (item.id && String(item.id).toLowerCase().includes(query)) ||
        (item.settlementCode && item.settlementCode.toLowerCase().includes(query)) ||
        (item.orderId && item.orderId.toLowerCase().includes(query)) ||
        (item.buyerName && item.buyerName.toLowerCase().includes(query)) ||
        (item.farmerName && item.farmerName.toLowerCase().includes(query)) ||
        (item.lotId && String(item.lotId).toLowerCase().includes(query));

      let matchesStatus = true;
      if (status !== "All") {
        const itemStatus = String(item.status || "").toLowerCase();
        const filterStatus = status.toLowerCase();

        if (filterStatus === "pending") {
          matchesStatus =
            itemStatus.includes("pending") || itemStatus.includes("awaiting");
        } else if (filterStatus === "paid" || filterStatus === "completed") {
          matchesStatus =
            itemStatus.includes("paid") || itemStatus.includes("completed");
        } else {
          matchesStatus = itemStatus === filterStatus;
        }
      }

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

      <SettlementStats stats={stats} />

      <SettlementFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={handleStatusChange}
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-xl border bg-white">
          <div className="text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <p className="mt-2 text-xs text-muted-foreground">Loading settlements...</p>
          </div>
        </div>
      ) : (
        <SettlementTable
          settlements={filteredSettlements}
          onPaymentSuccess={() => loadData()}
        />
      )}
    </div>
  );
}

export default Settlements;