import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";

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

function FullscreenPhotoViewer({ src, alt, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") handleReset();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(Number((s + 0.5).toFixed(2)), 5));
  const handleZoomOut = () =>
    setScale((s) => {
      const next = Math.max(Number((s - 0.5).toFixed(2)), 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((s) => {
      const next = Math.min(Math.max(Number((s + delta).toFixed(2)), 0.5), 5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDoubleClick = () => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.5);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-white select-none backdrop-blur-md"
      onMouseUp={handleMouseUp}
    >
      {/* Top Header */}
      <div className="flex h-14 items-center justify-between px-6 border-b border-slate-800 bg-slate-900/60 z-10">
        <div>
          <h3 className="font-semibold text-sm text-slate-100">{alt || "Farm Photo"}</h3>
          <p className="text-xs text-slate-400">Click & drag to pan • Scroll or click to zoom • Double click to toggle</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close (Esc)"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Viewport */}
      <div
        className={`relative flex-1 overflow-hidden flex items-center justify-center ${
          isDragging ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : "cursor-zoom-in"
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          className="max-h-[82vh] max-w-[90vw] object-contain rounded shadow-2xl pointer-events-none select-none"
        />
      </div>

      {/* Floating Bottom Toolbar */}
      <div className="flex items-center justify-center gap-3 py-3 border-t border-slate-800 bg-slate-900/80 z-10">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className="rounded-md p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <span className="min-w-[50px] text-center text-xs font-mono font-semibold text-slate-300">
          {Math.round(scale * 100)}%
        </span>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={scale >= 5}
          className="rounded-md p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          title="Reset Zoom & Pan (0)"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

function SubmittedFarmDetails({ farm }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Farm Photo
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Photo submitted by the farmer.
                </p>
              </div>

              {farm.imageUrl && (
                <button
                  type="button"
                  onClick={() => setIsViewerOpen(true)}
                  className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Full Screen
                </button>
              )}
            </div>

            <div
              className={`mt-4 flex h-32 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden relative group ${
                farm.imageUrl ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (farm.imageUrl) setIsViewerOpen(true);
              }}
              title={farm.imageUrl ? "Click to view full screen" : undefined}
            >
              {farm.imageUrl ? (
                <>
                  <img
                    src={farm.imageUrl}
                    alt={farm.farmName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "";
                      e.target.parentElement.innerHTML = "<span class='text-xs text-slate-400 p-2 text-center'>Image preview unavailable</span>";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs">
                    <Maximize2 className="h-4 w-4" />
                    <span>Click to pan & zoom in full screen</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400">No photo uploaded</p>
              )}
            </div>
          </div>

        </div>

      </CardContent>

      {isViewerOpen && farm.imageUrl && (
        <FullscreenPhotoViewer
          src={farm.imageUrl}
          alt={farm.farmName}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </Card>
  );
}

export default SubmittedFarmDetails;