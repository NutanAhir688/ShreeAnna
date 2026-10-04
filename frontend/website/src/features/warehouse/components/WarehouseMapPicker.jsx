import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Building2 } from "lucide-react";

// Preset village areas in Gujarat for fast selection
export const GUJARAT_PRESETS = [
  { name: "Dahod (Bordi Village)", lat: 22.8397, lng: 74.2558, district: "Dahod", taluka: "Dahod", village: "Bordi" },
  { name: "Bharuch (Nabipur Village)", lat: 21.7051, lng: 72.9959, district: "Bharuch", taluka: "Nabipur", village: "Nabipur" },
  { name: "Amreli (Dhari Village)", lat: 21.6032, lng: 71.2221, district: "Amreli", taluka: "Dhari", village: "Dhari" },
  { name: "Anand (Petlad Village)", lat: 22.5645, lng: 72.9289, district: "Anand", taluka: "Petlad", village: "Petlad" },
  { name: "Junagadh (Keshod Village)", lat: 21.5222, lng: 70.4579, district: "Junagadh", taluka: "Keshod", village: "Keshod" },
];

function WarehouseMapPicker({ latitude, longitude, onLocationSelect, onPresetSelect }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const currentLat = latitude ? Number(latitude) : 22.8397;
  const currentLng = longitude ? Number(longitude) : 74.2558;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([currentLat, currentLng], 9);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `<div style="background-color: #059669; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([currentLat, currentLng], { icon: customIcon, draggable: true }).addTo(map);

      marker.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        onLocationSelect(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
      });

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLocationSelect(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([currentLat, currentLng], 9);
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLng]);
      }
    }
  }, [currentLat, currentLng, onLocationSelect]);

  const handleSelectPreset = (preset) => {
    if (onPresetSelect) {
      onPresetSelect(preset);
    } else {
      onLocationSelect(preset.lat, preset.lng);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-bold text-slate-700 flex items-center gap-1 mr-1">
          <Navigation className="h-3.5 w-3.5 text-emerald-700" /> Gujarat Presets:
        </span>
        {GUJARAT_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => handleSelectPreset(p)}
            className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold transition text-[11px]"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="relative rounded-xl border border-slate-200 overflow-hidden shadow-inner">
        <div ref={mapContainerRef} className="h-56 w-full z-0" />
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md shadow border border-slate-200 text-[11px] font-mono font-bold text-slate-700 z-10 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
        </div>
      </div>
      <p className="text-[11px] text-slate-500 italic">
        💡 Click anywhere on the map or drag the pin to set the exact warehouse location coordinates.
      </p>
    </div>
  );
}

export default WarehouseMapPicker;
