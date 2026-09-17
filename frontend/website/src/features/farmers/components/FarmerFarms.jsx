import {
  ArrowRight,
  MapPin,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import FarmVerificationStatus from "./FarmVerificationStatus";

function FarmerFarms({ farmer, onFarmClick }) {
  return (
    <Card className="border-slate-200/80 shadow-xs">

      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Farms
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {farmer?.farms && farmer.farms.length > 0 ? (
          farmer.farms.map((farm) => (
            <div
              key={farm.id}
              className="rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
            >

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-3">

                  <div className="rounded-lg bg-slate-100 p-2">
                    <MapPin className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="font-semibold text-slate-900">
                        {farm.name || farm.farmName}
                      </p>

                      <FarmVerificationStatus
                        status={farm.status}
                      />

                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {farm.id} · Survey No. {farm.surveyNumber}
                    </p>

                  </div>

                </div>


                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFarmClick?.(farm)}
                >
                  View Farm
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

              </div>


              <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-3">

                <div>
                  <p className="text-xs text-muted-foreground">
                    Area
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {farm.area} acres
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Soil Type
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {farm.soilType || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Current Crop
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {farm.currentCrop || "-"}
                  </p>
                </div>

              </div>

            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No registered farms for this farmer.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default FarmerFarms;