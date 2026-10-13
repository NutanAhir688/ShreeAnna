import { useEffect, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  TrendingUp,
  CircleDollarSign,
  ArrowUpRight,
} from "lucide-react";

import StatCard from "../components/StatCard";
import SettlementQueue from "../components/SettlementQueue";
import RevenueChart from "../components/RevenueChart";
import RecentTransactions from "../components/RecentTransactions";
import RevenueByMillet from "../components/RevenueByMillet";

import { settlementsApi } from "@/services/api";

export default function AccountantDashboard() {
  const [stats, setStats] = useState({
    totalSettlementValue: 0,
    paidSettlementValue: 0,
    pendingSettlementValue: 0,
    fpoMargin: 0,
    totalCount: 0,
    pendingCount: 0,
    paidCount: 0,
  });
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, listData] = await Promise.all([
        settlementsApi.getStats().catch(() => null),
        settlementsApi.getAll().catch(() => []),
      ]);

      if (statsData) {
        setStats(statsData);
      }
      if (Array.isArray(listData)) {
        setSettlements(listData);
      }
    } catch (err) {
      console.error("Failed to load accountant dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDataChange = () => {
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Financial Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Settlement Volume"
          value={`₹${Number(stats.totalSettlementValue || 0).toLocaleString("en-IN")}`}
          trendText={`${stats.totalCount || 0} Total Lots`}
          trendColor="emerald"
          icon={CircleDollarSign}
          iconBgClass="bg-blue-100/80"
          iconColorClass="text-blue-600"
        />

        <StatCard
          title="Disbursed Payouts"
          value={`₹${Number(stats.paidSettlementValue || 0).toLocaleString("en-IN")}`}
          trendText={`${stats.paidCount || 0} Paid via DBT`}
          trendColor="emerald"
          icon={CheckCircle2}
          iconBgClass="bg-emerald-100/80"
          iconColorClass="text-emerald-600"
        />

        <StatCard
          title="Pending Settlements"
          value={`₹${Number(stats.pendingSettlementValue || 0).toLocaleString("en-IN")}`}
          trendText={stats.pendingCount > 0 ? `${stats.pendingCount} Action Needed` : "All Clear"}
          trendColor={stats.pendingCount > 0 ? "red" : "emerald"}
          icon={Clock}
          iconBgClass={stats.pendingCount > 0 ? "bg-amber-100/80" : "bg-emerald-100/80"}
          iconColorClass={stats.pendingCount > 0 ? "text-amber-600" : "text-emerald-600"}
        />

        <StatCard
          title="FPO Margin Revenue"
          value={`₹${Number(stats.fpoMargin || 0).toLocaleString("en-IN")}`}
          trendText="5% Facilitation Fee"
          trendColor="emerald"
          icon={TrendingUp}
          iconBgClass="bg-cyan-100/80"
          iconColorClass="text-cyan-600"
        />
      </div>

      {/* Main Grid: Settlement Queue + Revenue Donut Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SettlementQueue onDataChange={handleDataChange} />
        </div>

        <div className="lg:col-span-1">
          <RevenueChart statsProp={stats} />
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions + Revenue by Millet */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions settlementsProp={settlements} />
        <RevenueByMillet settlementsProp={settlements} />
      </div>
    </div>
  );
}
