import {
  Users,
  UserCheck,
  CheckCircle2,
  LandPlot,
  Clock3,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

function FarmerStats({ farmer, farmers }) {
  // Mode 1: Single farmer details page
  if (farmer) {
    const farmsList = farmer.farms || [];
    const farmCount = farmsList.length || farmer.farmCount || 0;
    const totalLand = farmsList.reduce((sum, f) => sum + (f.area || f.areaInAcres || 0), 0)
      || farmer.totalLand
      || 0;
    const verifiedFarms = farmsList.filter((farm) => farm.status === "Verified").length;
    const pendingFarms = farmsList.filter(
      (farm) =>
        farm.status === "Pending Verification" ||
        farm.status === "Under Review"
    ).length;

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          title="Total Farms"
          value={farmCount}
          icon={LandPlot}
        />

        <Stat
          title="Total Land"
          value={totalLand > 0 ? `${totalLand} acres` : `${farmCount} farm${farmCount !== 1 ? "s" : ""}`}
          icon={LandPlot}
        />

        <Stat
          title="Verified Farms"
          value={verifiedFarms}
          icon={CheckCircle2}
        />

        <Stat
          title="Pending Verification"
          value={pendingFarms}
          icon={Clock3}
        />
      </div>
    );
  }

  // Mode 2: All farmers list page
  const farmerList = Array.isArray(farmers) ? farmers : [];
  const totalFarmers = farmerList.length;
  const activeFarmers = farmerList.filter((f) => f.status === "Active").length;

  // The list endpoint returns farmCount (int) per farmer, not farms[].
  // Sum farmCount directly; fall back to farms[] length for detail-loaded data.
  const totalFarms = farmerList.reduce(
    (sum, f) => sum + (f.farmCount ?? f.farms?.length ?? 0),
    0
  );
  const verifiedFarms = farmerList.flatMap((f) => f.farms || []).filter(
    (farm) => farm.status === "Verified"
  ).length;
  const pendingFarms = farmerList.flatMap((f) => f.farms || []).filter(
    (farm) => farm.status === "Pending Verification" || farm.status === "Under Review"
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        title="Total Farmers"
        value={totalFarmers}
        icon={Users}
      />

      <Stat
        title="Active Farmers"
        value={activeFarmers}
        icon={UserCheck}
      />

      <Stat
        title="Total Farms"
        value={totalFarms}
        icon={LandPlot}
      />

      <Stat
        title="Pending Verification"
        value={pendingFarms}
        icon={Clock3}
      />
    </div>
  );
}

function Stat({ title, value, icon: Icon }) {
  return (
    <Card className="border-slate-200/80 shadow-xs">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        {Icon && (
          <div className="rounded-lg bg-slate-100 p-3">
            <Icon className="h-5 w-5 text-slate-600" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FarmerStats;