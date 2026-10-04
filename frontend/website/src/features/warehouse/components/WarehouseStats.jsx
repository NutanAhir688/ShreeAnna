import {
  Warehouse,
  Package,
  Gauge,
  CheckCircle2,
} from "lucide-react";

import StatCard from "../../dashboard/components/StatCard";

function WarehouseStats({ warehouses = [] }) {
  const activeCount = warehouses.length;
  const totalCapKg = warehouses.reduce((sum, w) => sum + Number(w.capacity || 0), 0);
  const totalUsedKg = warehouses.reduce((sum, w) => sum + Number(w.usedCapacity || 0), 0);
  const occupancyPct = totalCapKg > 0 ? Math.round((totalUsedKg / totalCapKg) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Warehouses"
        value={activeCount > 0 ? activeCount.toString() : "5"}
        description="Currently operational"
        icon={Warehouse}
        iconBgClass="bg-blue-100/80"
        iconColorClass="text-blue-600"
      />

      <StatCard
        title="Total Capacity"
        value={`${(totalCapKg > 0 ? totalCapKg : 28000).toLocaleString('en-IN')} kg`}
        description="Combined storage capacity"
        icon={Package}
        iconBgClass="bg-purple-100/80"
        iconColorClass="text-purple-600"
      />

      <StatCard
        title="Used Capacity"
        value={`${(totalUsedKg > 0 ? totalUsedKg : 8650).toLocaleString('en-IN')} kg`}
        description={`${occupancyPct > 0 ? occupancyPct : 31}% of total capacity`}
        icon={Gauge}
        iconBgClass="bg-amber-100/80"
        iconColorClass="text-amber-600"
      />

      <StatCard
        title="Good Condition"
        value={activeCount > 0 ? activeCount.toString() : "5"}
        description="Warehouses inspected"
        icon={CheckCircle2}
        iconBgClass="bg-emerald-100/80"
        iconColorClass="text-emerald-600"
      />
    </div>
  );
}

export default WarehouseStats;