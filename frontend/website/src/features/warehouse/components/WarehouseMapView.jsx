import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Building2, MapPin, Phone, User, Package } from "lucide-react";

function WarehouseMapView({ warehouses = [], onSelectWarehouse }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center map over Gujarat region
      const map = L.map(mapContainerRef.current).setView([22.2587, 71.1924], 7);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const bounds = [];

    warehouses.forEach((w) => {
      const lat = w.latitude ? Number(w.latitude) : null;
      const lng = w.longitude ? Number(w.longitude) : null;

      if (lat && lng) {
        bounds.push([lat, lng]);

        const customIcon = L.divIcon({
          className: "custom-warehouse-marker",
          html: `<div style="background-color: #047857; width: 32px; height: 32px; border-radius: 8px; border: 2.5px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const popupHtml = `
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
            <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${w.name}</div>
            <div style="color: #047857; font-weight: 700; font-size: 11px; font-family: monospace;">${w.code}</div>
            <div style="color: #475569; font-size: 11px; margin-top: 4px;">📍 ${w.location}</div>
            <div style="color: #334155; font-size: 11px; margin-top: 2px;">👤 Manager: <b>${w.manager}</b></div>
            <div style="color: #334155; font-size: 11px;">📦 Capacity: <b>${w.capacity}</b> (${w.utilized} Used)</div>
            <div style="margin-top: 6px; padding: 3px 6px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; color: #047857; font-size: 10px; font-weight: 700;">
              ${w.storageCondition || "Active Warehouse"}
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupHtml);

        if (onSelectWarehouse) {
          marker.on("click", () => onSelectWarehouse(w));
        }

        markersGroup.addLayer(marker);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }
  }, [warehouses, onSelectWarehouse]);

  return (
    <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
      <div ref={mapContainerRef} className="h-[450px] w-full z-0" />
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow border border-slate-200 text-xs font-bold text-slate-800 z-10 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-emerald-700" />
        <span>Gujarat Warehouse Network ({warehouses.length} Active Locations)</span>
      </div>
    </div>
  );
}

export default WarehouseMapView;
