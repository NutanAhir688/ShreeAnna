import {
  IndianRupee,
  Package,
  Scale,
  Wheat,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

function ListingOverview({ listing }) {
  const getStatusClass = (status) => {
    if (status === "Available") {
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    }

    if (status === "Partially Sold") {
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    }

    return "bg-slate-100 text-slate-600 hover:bg-slate-100";
  };

  const qty = listing?.availableQuantity ?? listing?.quantityKg ?? listing?.quantity ?? 0;
  const unit = listing?.unit || "kg";
  const price = listing?.pricePerKg ?? 0;
  const milletName = listing?.millet || listing?.milletType || "—";

  const items = [
    {
      label: "Available Quantity",
      value: `${qty.toLocaleString()} ${unit}`,
      icon: Scale,
    },
    {
      label: "Price per kg",
      value: `₹${price}`,
      icon: IndianRupee,
    },
    {
      label: "Millet",
      value: milletName,
      icon: Wheat,
    },
    {
      label: "Source Lot",
      value: listing?.lotId || "—",
      icon: Package,
    },
  ];

  return (
    <Card className="border-slate-200/80 shadow-xs">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Marketplace Listing
            </p>

            <CardTitle className="mt-1 text-xl">
              {listing?.title || listing?.id}
            </CardTitle>
          </div>

          <Badge className={getStatusClass(listing?.status)}>
            {listing?.status || "Active"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="mb-6 max-w-3xl text-sm leading-6 text-slate-600">
          {listing.description}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="mb-2 flex items-center gap-2 text-slate-500">
                  <Icon className="h-4 w-4" />

                  <span className="text-xs">
                    {item.label}
                  </span>
                </div>

                <p className="font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default ListingOverview;