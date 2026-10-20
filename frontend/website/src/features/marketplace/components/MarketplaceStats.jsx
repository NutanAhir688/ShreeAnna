import {
  Package,
  ShoppingBag,
  Wheat,
  IndianRupee,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

function MarketplaceStats({ listings = [] }) {
  const safeListings = Array.isArray(listings) ? listings : [];

  const availableListings = safeListings.filter(
    (item) => (item.availableQuantity ?? item.quantityKg ?? 0) > 0
  );

  const totalAvailable = availableListings.reduce(
    (sum, item) => sum + (item.availableQuantity ?? item.quantityKg ?? 0),
    0
  );

  const totalValue = availableListings.reduce(
    (sum, item) =>
      sum + (item.availableQuantity ?? item.quantityKg ?? 0) * (item.pricePerKg || 0),
    0
  );

  const soldOut = safeListings.filter(
    (item) => item.status === "Sold Out"
  ).length;

  const stats = [
    {
      title: "Active Listings",
      value: availableListings.length,
      icon: ShoppingBag,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Available Stock",
      value: `${totalAvailable.toLocaleString()} kg`,
      icon: Wheat,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Stock Value",
      value: `₹${totalValue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Sold Out",
      value: soldOut,
      icon: Package,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.title}
            className="border-slate-200/80 shadow-xs"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.iconBg}`}
              >
                <Icon
                  className={`h-5 w-5 ${stat.iconColor}`}
                />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default MarketplaceStats;