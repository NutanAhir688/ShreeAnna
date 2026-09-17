import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Mountain,
  Clock,
} from "lucide-react";

import StatCard from "../components/StatCard";
import FarmVerificationQueue from "../components/FarmVerificationQueue";
import VerificationStatusChart from "../components/VerificationStatusChart";
import RecentActivity from "../components/RecentActivity";
import FarmsByDistrict from "../components/FarmsByDistrict";

import { farmersApi, farmsApi } from "@/services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalFarmers: "5",
    activeFarmers: "4",
    verifiedFarms: "3",
    pendingFarms: "2",
  });

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const [farmersData, farmsData] = await Promise.all([
          farmersApi.getAll().catch(() => null),
          farmsApi.getAll().catch(() => null),
        ]);

        if (farmersData && farmersData.length > 0) {
          const active = farmersData.filter((f) => f.status?.toLowerCase() === "active").length;
          setStats((prev) => ({
            ...prev,
            totalFarmers: farmersData.length.toString(),
            activeFarmers: active.toString(),
          }));
        }

        if (farmsData && farmsData.length > 0) {
          const verified = farmsData.filter((f) => f.status?.toLowerCase().includes("verified")).length;
          const pending = farmsData.filter((f) => f.status?.toLowerCase().includes("pending")).length;
          setStats((prev) => ({
            ...prev,
            verifiedFarms: verified.toString(),
            pendingFarms: pending.toString(),
          }));
        }
      } catch (err) {
        console.warn("Using fallback dashboard stats:", err.message);
      }
    }
    loadDashboardStats();
  }, []);

  return (
    <div className="space-y-6">

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Farmers"
          value={stats.totalFarmers}
          trendText="Registered in FPO"
          trendColor="emerald"
          icon={Users}
          iconBgClass="bg-blue-100/80"
          iconColorClass="text-blue-600"
        />

        <StatCard
          title="Active Farmers"
          value={stats.activeFarmers}
          description="Active contributors"
          icon={UserCheck}
          iconBgClass="bg-emerald-100/80"
          iconColorClass="text-emerald-600"
        />

        <StatCard
          title="Verified Farms"
          value={stats.verifiedFarms}
          description="Verified land parcels"
          icon={Mountain}
          iconBgClass="bg-amber-100/80"
          iconColorClass="text-amber-600"
        />

        <StatCard
          title="Pending Verification"
          value={stats.pendingFarms}
          trendText="Action needed"
          trendColor="red"
          icon={Clock}
          iconBgClass="bg-amber-100/80"
          iconColorClass="text-amber-600"
        />

      </div>


      {/* Queue + Verification Donut Chart */}
      <div className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">
          <FarmVerificationQueue />
        </div>

        <div className="lg:col-span-1">
          <VerificationStatusChart />
        </div>

      </div>


      {/* Recent Activity + Farms by District */}
      <div className="grid gap-6 lg:grid-cols-2">

        <RecentActivity />

        <FarmsByDistrict />

      </div>

    </div>
  );
}

export default Dashboard;