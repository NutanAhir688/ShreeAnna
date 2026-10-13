import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  Clock3,
  CheckCircle2,
  Wallet,
} from "lucide-react";

import StatCard from "../../dashboard/components/StatCard";
import { settlementsApi } from "@/services/api";

function SettlementStats({ stats: initialStats }) {
  const [stats, setStats] = useState(initialStats || null);

  useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
      return;
    }
    let isMounted = true;
    async function loadStats() {
      try {
        const data = await settlementsApi.getStats();
        if (isMounted && data) setStats(data);
      } catch (err) {
        console.error("Failed to fetch settlement stats:", err);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [initialStats]);

  const totalValue = stats?.totalSettlementValue ?? 0;
  const pendingValue = stats?.pendingSettlementValue ?? 0;
  const paidValue = stats?.paidSettlementValue ?? 0;
  const fpoMargin = stats?.fpoMargin ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Settlement Value"
        value={`₹${Math.round(totalValue).toLocaleString("en-IN")}`}
        description={`${stats?.totalCount ?? 0} total transactions`}
        icon={CircleDollarSign}
        iconBgClass="bg-blue-100/80"
        iconColorClass="text-blue-600"
      />

      <StatCard
        title="Pending Settlement"
        value={`₹${Math.round(pendingValue).toLocaleString("en-IN")}`}
        description={`${stats?.pendingCount ?? 0} awaiting payout`}
        icon={Clock3}
        iconBgClass="bg-amber-100/80"
        iconColorClass="text-amber-600"
      />

      <StatCard
        title="Paid"
        value={`₹${Math.round(paidValue).toLocaleString("en-IN")}`}
        description={`${stats?.paidCount ?? 0} successfully settled`}
        icon={CheckCircle2}
        iconBgClass="bg-emerald-100/80"
        iconColorClass="text-emerald-600"
      />

      <StatCard
        title="FPO Margin"
        value={`₹${Math.round(fpoMargin).toLocaleString("en-IN")}`}
        description="FPO facilitation fee"
        icon={Wallet}
        iconBgClass="bg-purple-100/80"
        iconColorClass="text-purple-600"
      />
    </div>
  );
}

export default SettlementStats;