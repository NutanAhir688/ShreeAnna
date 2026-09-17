import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SubmittedFarmDetails({ farm }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted Farm Details</CardTitle>
      </CardHeader>

      <CardContent>

        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">

          <DetailItem
            label="Farm ID"
            value={farm.id}
          />

          <DetailItem
            label="Farm Name"
            value={farm.farmName}
          />

          <DetailItem
            label="Area"
            value={`${farm.area} acres`}
          />

          <DetailItem
            label="Soil Type"
            value={farm.soilType}
          />

          <DetailItem
            label="District"
            value={farm.district}
          />

          <DetailItem
            label="Taluka"
            value={farm.taluka}
          />

          <DetailItem
            label="Village"
            value={farm.village}
          />

          <DetailItem
            label="Survey Number"
            value={farm.surveyNumber}
          />

          <DetailItem
            label="Submitted On"
            value={farm.submittedAt}
          />

        </div>


        {/* Location / photo section */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">

          <div className="rounded-lg border p-5">
            <p className="text-sm font-medium">
              Farm Location Coordinates
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              GPS location captured from mobile submission.
            </p>

            <div className="mt-4 flex h-32 flex-col items-center justify-center rounded-md bg-slate-900 text-white p-3 font-mono text-xs">
              {farm.latitude && farm.longitude ? (
                <>
                  <p>Latitude: {farm.latitude}</p>
                  <p>Longitude: {farm.longitude}</p>
                  <p className="mt-2 text-[10px] text-emerald-400">GPS Location Verified</p>
                </>
              ) : (
                <p className="text-slate-400">Coordinates not captured</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border p-5">
            <p className="text-sm font-medium">
              Farm Photo
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Photo submitted by the farmer.
            </p>

            <div className="mt-4 flex h-32 items-center justify-center rounded-md bg-slate-100 overflow-hidden">
              {farm.imageUrl ? (
                <img
                  src={farm.imageUrl}
                  alt={farm.farmName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                    e.target.parentElement.innerHTML = "<span class='text-xs text-slate-400 p-2 text-center'>Image preview unavailable</span>";
                  }}
                />
              ) : (
                <p className="text-xs text-slate-400">No photo uploaded</p>
              )}
            </div>
          </div>

        </div>

      </CardContent>
    </Card>
  );
}

export default SubmittedFarmDetails;