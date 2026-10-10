import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

function FarmLocationMap({ latitude, longitude, farmName }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const lat = latitude ? Number(latitude) : null;
  const lng = longitude ? Number(longitude) : null;
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  useEffect(() => {
    if (!mapContainerRef.current || !hasCoordinates) return undefined;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 2px 4px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 12px;">${farmName || "Farm Location"}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">Latitude: ${lat.toFixed(6)}</div>
          <div style="font-size: 11px; color: #475569;">Longitude: ${lng.toFixed(6)}</div>
        </div>
      `);

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [farmName, hasCoordinates, lat, lng]);

  return (
    <div className="mt-4 overflow-hidden rounded-md border bg-slate-100">
      {hasCoordinates ? (
        <div ref={mapContainerRef} className="h-56 w-full" />
      ) : (
        <div className="flex h-56 items-center justify-center px-4 text-center">
          <p className="text-sm text-slate-500">Coordinates not captured</p>
        </div>
      )}
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

            <FarmLocationMap
              latitude={farm.latitude}
              longitude={farm.longitude}
              farmName={farm.farmName}
            />
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