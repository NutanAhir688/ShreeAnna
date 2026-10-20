import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  User,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ListingSource({ listing }) {
  return (
    <Card className="border-slate-200/80 shadow-xs">
      <CardHeader>
        <CardTitle className="text-base">
          Source & Traceability
        </CardTitle>

        <p className="text-sm text-slate-500">
          Track this marketplace stock back to its source.
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Farmer */}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                FARMER
              </span>

              <User className="h-4 w-4 text-slate-400" />
            </div>

            <p className="font-medium text-slate-900">
              {listing?.farmerName || listing?.brand || "Verified Producer"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {listing?.farmerId || "FARMER-IND"}
            </p>
          </div>

          {/* Farm */}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                FARM
              </span>

              <MapPin className="h-4 w-4 text-slate-400" />
            </div>

            <p className="font-medium text-slate-900">
              {listing?.farmName || "Direct Farm / FPO Sourced"}
            </p>

            <p className="mt-1 flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </p>
          </div>

          {/* Procurement */}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                PROCUREMENT
              </span>

              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>

            <p className="font-medium text-slate-900">
              {listing?.lotId || "LOT-ORIGIN"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {(listing?.quantity ?? listing?.quantityKg ?? listing?.availableQuantity ?? 0).toLocaleString()}{" "}
              {listing?.unit || "kg"} procured
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ListingSource;