import { useEffect, useState } from "react";
import ReportStats from "../components/ReportStats";
import ReportFilters from "../components/ReportFilters";
import ProcurementOverview from "../components/ProcurementOverview";
import SalesOverview from "../components/SalesOverview";
import InventoryOverview from "../components/InventoryOverview";
import BuyerPerformance from "../components/BuyerPerformance";

import { reportsApi } from "@/services/api";

function Reports() {
  const [stats, setStats] = useState({
    totalProcurementKg: 0,
    totalSalesAmount: 0,
    activeListings: 0,
    completedDispatches: 0,
  });
  const [procurementByMillet, setProcurementByMillet] = useState([]);
  const [salesByMillet, setSalesByMillet] = useState([]);
  const [inventoryOverview, setInventoryOverview] = useState([]);
  const [buyerPerformance, setBuyerPerformance] = useState([]);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await reportsApi.getSummary();
        if (data) {
          if (data.stats) setStats(data.stats);
          if (data.procurementByMillet) setProcurementByMillet(data.procurementByMillet);
          if (data.salesByMillet) setSalesByMillet(data.salesByMillet);
          if (data.inventoryOverview) setInventoryOverview(data.inventoryOverview);
          if (data.buyerPerformance) setBuyerPerformance(data.buyerPerformance);
        }
      } catch (err) {
        console.error("Error loading reports:", err);
      }
    }
    loadReports();
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Reports & Analytics
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor procurement, sales, inventory, buyers, and FPO
          financial performance.
        </p>
      </div>

      {/* Filters */}
      <ReportFilters />

      {/* Stats */}
      <ReportStats stats={stats} />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProcurementOverview data={procurementByMillet} />

        <SalesOverview data={salesByMillet} />
      </div>

      {/* Inventory + Buyers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <InventoryOverview data={inventoryOverview} />

        <BuyerPerformance data={buyerPerformance} />
      </div>
    </div>
  );
}

export default Reports;