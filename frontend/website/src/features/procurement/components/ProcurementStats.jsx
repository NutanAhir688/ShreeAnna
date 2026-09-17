import {
  CheckCircle2,
  Clock3,
  Package,
  IndianRupee,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

function ProcurementStats({ lots = [] }) {
  const totalQuantity = lots.reduce(
    (total, lot) => total + (lot.quantity || 0),
    0
  );

  const completedLots = lots.filter(
    (lot) =>
      lot.status === "Completed" ||
      lot.status === "COMPLETED" ||
      lot.status === "QUALITY_CERTIFIED"
  ).length;

  const pendingLots = lots.filter(
    (lot) =>
      lot.status === "Pending Inspection" ||
      lot.status === "Quality Inspection" ||
      lot.status === "SUBMITTED" ||
      lot.status === "QUALITY_INSPECTION"
  ).length;

  const totalValue = lots.reduce(
    (total, lot) => total + (lot.totalValue || 0),
    0
  );

  const stats = [
    {
      title: "Total Lots",
      value: lots.length,
      icon: Package,
    },
    {
      title: "Total Quantity",
      value: `${(totalQuantity / 1000).toFixed(2)} MT`,
      icon: Package,
    },
    {
      title: "Completed Lots",
      value: completedLots,
      icon: CheckCircle2,
    },
    {
      title: "Procurement Value",
      value: totalValue > 0 ? `₹${totalValue.toLocaleString("en-IN")}` : "—",
      icon: IndianRupee,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.title}
            className="border-slate-200/80 bg-white shadow-xs"
          >
            <CardContent className="flex items-center justify-between p-5">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 p-3">
                <Icon className="h-5 w-5 text-slate-600" />
              </div>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default ProcurementStats;