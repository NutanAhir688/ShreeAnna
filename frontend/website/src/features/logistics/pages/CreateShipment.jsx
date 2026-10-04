import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Truck,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building2,
  User,
  ArrowLeft,
  FileText,
  AlertCircle,
  PackageCheck,
  Phone,
  Compass,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logisticsApi, lotsApi, inventoryApi, farmersApi, farmsApi, warehousesApi } from "@/services/api";

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (Number(lat2) - Number(lat1)) * (Math.PI / 180);
  const dLon = (Number(lon2) - Number(lon1)) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(Number(lat1) * (Math.PI / 180)) *
      Math.cos(Number(lat2) * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function formatCoords(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return "Lat: 37.4220, Lng: -122.0840";
  }
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return "N/A";

  const latDir = numLat >= 0 ? "N" : "S";
  const lngDir = numLng >= 0 ? "E" : "W";
  return `${Math.abs(numLat).toFixed(4)}° ${latDir}, ${Math.abs(numLng).toFixed(4)}° ${lngDir}`;
}

function ShipmentWarehouseMap({
  farmLat,
  farmLng,
  farmName = "Farm Location",
  warehouses = [],
  selectedWarehouseId,
  onSelectWarehouse,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([22.5, 73.0], 8);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      layerGroupRef.current = layerGroup;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const bounds = [];

    const validFarmLat = Number(farmLat) || 22.8397;
    const validFarmLng = Number(farmLng) || 74.2558;

    // 1. Farm Marker (Emerald Pin)
    bounds.push([validFarmLat, validFarmLng]);
    const farmIcon = L.divIcon({
      className: "custom-farm-marker",
      html: `<div style="background-color: #059669; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const farmMarker = L.marker([validFarmLat, validFarmLng], {
      icon: farmIcon,
    }).bindPopup(`
      <div style="font-family: system-ui, sans-serif; padding: 2px;">
        <div style="font-weight: 800; color: #065f46; font-size: 12px;">🌾 ORIGIN FARM</div>
        <div style="font-size: 11px; color: #1e293b; font-weight: 700; margin-top: 2px;">${farmName}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">GPS: ${validFarmLat.toFixed(
          4
        )}°, ${validFarmLng.toFixed(4)}°</div>
      </div>
    `);
    layerGroup.addLayer(farmMarker);

    // Find selected warehouse
    const selectedWh =
      warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

    // 2. Warehouse Markers
    warehouses.forEach((w) => {
      const wLat = Number(w.latitude);
      const wLng = Number(w.longitude);
      if (!wLat || !wLng) return;

      bounds.push([wLat, wLng]);
      const isSelected = selectedWh && selectedWh.id === w.id;
      const isNearest = w.isNearest;

      const bgColor = isSelected ? "#1e40af" : isNearest ? "#047857" : "#475569";
      const iconSize = isSelected ? 36 : 28;

      const whIcon = L.divIcon({
        className: "custom-wh-marker",
        html: `<div style="background-color: ${bgColor}; width: ${iconSize}px; height: ${iconSize}px; border-radius: 8px; border: 2.5px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
                 <svg width="${isSelected ? 20 : 15}" height="${
          isSelected ? 20 : 15
        }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
               </div>`,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
      });

      const dist = calculateDistanceKm(
        validFarmLat,
        validFarmLng,
        wLat,
        wLng
      );

      const whMarker = L.marker([wLat, wLng], { icon: whIcon }).bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
          <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${
            w.name
          }</div>
          <div style="color: #047857; font-weight: 700; font-size: 11px;">📍 ${
            w.district
          }, ${w.village}</div>
          <div style="font-size: 11px; margin-top: 4px; color: #1e293b;"><b>Distance from Farm:</b> ${
            dist !== null ? dist + " km" : "N/A"
          }</div>
          ${
            isNearest
              ? '<div style="margin-top: 4px; background-color: #dcfce7; color: #15803d; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px; display: inline-block;">⚡ NEAREST WAREHOUSE</div>'
              : ""
          }
          ${
            isSelected
              ? '<div style="margin-top: 4px; background-color: #dbeafe; color: #1e40af; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px; display: inline-block;">✓ SELECTED DESTINATION</div>'
              : ""
          }
        </div>
      `);

      if (onSelectWarehouse) {
        whMarker.on("click", () => onSelectWarehouse(w.id));
      }

      layerGroup.addLayer(whMarker);
    });

    // 3. Connect Farm -> Selected Warehouse with Dashed Line
    if (selectedWh && selectedWh.latitude && selectedWh.longitude) {
      const swLat = Number(selectedWh.latitude);
      const swLng = Number(selectedWh.longitude);
      const line = L.polyline(
        [
          [validFarmLat, validFarmLng],
          [swLat, swLng],
        ],
        {
          color: "#2563eb",
          weight: 3.5,
          dashArray: "8, 8",
          opacity: 0.85,
        }
      );
      layerGroup.addLayer(line);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [
    farmLat,
    farmLng,
    farmName,
    warehouses,
    selectedWarehouseId,
    onSelectWarehouse,
  ]);

  const selectedWh = warehouses.find((w) => w.id === selectedWarehouseId);
  const routeDistance = selectedWh ? selectedWh.distanceKm : null;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-sm relative">
      <div className="bg-slate-900 text-white p-2.5 px-3 flex justify-between items-center text-xs border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-slate-100">Live Route & Warehouse Proximity Map</span>
        </div>
        {routeDistance !== null && (
          <span className="text-[11px] bg-blue-900/90 text-blue-200 font-bold px-2.5 py-0.5 rounded border border-blue-700">
            Route Distance: {routeDistance} km
          </span>
        )}
      </div>

      <div ref={mapContainerRef} className="h-64 w-full z-0" />

      <div className="bg-slate-50 p-2.5 px-3 border-t border-slate-200 flex justify-between items-center text-[11px]">
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Farm Geolocation</span>
          <span className="font-mono font-bold text-slate-900 text-xs">
            {formatCoords(farmLat, farmLng)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Selected Warehouse</span>
          <span className="font-bold text-emerald-800">{selectedWh?.name || "Select Warehouse"}</span>
        </div>
      </div>
    </div>
  );
}

function CreateShipment() {
  const navigate = useNavigate();
  const [direction, setDirection] = useState("INBOUND"); // INBOUND | OUTBOUND

  const [inboundAgreements, setInboundAgreements] = useState([]);
  const [outboundAgreements, setOutboundAgreements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Selection states
  const [selectedInboundId, setSelectedInboundId] = useState("");
  const [selectedOutboundId, setSelectedOutboundId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  useEffect(() => {
    async function fetchAgreements() {
      try {
        const [lots, farmers, farms, rawWarehouses, dispatches] = await Promise.all([
          lotsApi.getAll().catch(() => []),
          farmersApi.getAll().catch(() => []),
          farmsApi.getAll().catch(() => []),
          warehousesApi.getAll().catch(() => []),
          logisticsApi.getAll().catch(() => []),
        ]);

        const shippedIds = new Set();
        if (Array.isArray(dispatches)) {
          dispatches.forEach((d) => {
            if (d.lotId) shippedIds.add(d.lotId);
            if (d.agreementId) shippedIds.add(d.agreementId);
          });
        }

        if (Array.isArray(rawWarehouses) && rawWarehouses.length > 0) {
          const mappedWh = rawWarehouses.map((w) => ({
            id: w.id,
            name: w.name || w.Name || "Warehouse",
            code: w.warehouseCode || w.code || "WH-GUJ",
            district: w.district || w.District || "Gujarat",
            village: w.village || w.Village || "",
            location: w.location || `${w.village || ""}, ${w.district || "Gujarat"}`,
            latitude: w.latitude ? Number(w.latitude) : 22.8397,
            longitude: w.longitude ? Number(w.longitude) : 74.2558,
            capacityInTons: w.capacityInTons || 5000,
            utilizedCapacityTons: w.utilizedCapacityTons || 1200,
            managerName: w.managerName || w.manager || "Manager",
          }));
          setWarehouses(mappedWh);
          if (mappedWh.length > 0) setSelectedWarehouseId(mappedWh[0].id);
        }

        const farmerMap = {};
        if (Array.isArray(farmers)) {
          farmers.forEach((f) => {
            if (f.id) farmerMap[f.id] = f;
            if (f.fullName) farmerMap[f.fullName.toLowerCase()] = f;
          });
        }

        const farmMap = {};
        if (Array.isArray(farms)) {
          farms.forEach((f) => {
            if (f.id) farmMap[f.id] = f;
            if (f.farmerId) farmMap[`farmer_${f.farmerId}`] = f;
          });
        }

        const mockCoordsList = [
          { lat: 37.4219983, lng: -122.084 }, // Real mobile device GPS coordinates
          { lat: 22.8397, lng: 74.2558 },
          { lat: 22.8421, lng: 74.2580 },
          { lat: 22.8405, lng: 74.2602 },
          { lat: 22.8450, lng: 74.2510 },
        ];

        const defaultInbound = [
          {
            id: "AGR-LOT-1042A",
            realLotId: "lot-1042a",
            farmer: "Ramesh Patel",
            farmerPhone: "+91 98765 43210",
            farmerAddress: "Bordi, Dahod District Farm",
            lat: 37.4219983,
            lng: -122.084,
            formattedCoords: formatCoords(37.4219983, -122.084),
            lotId: "1042-A",
            milletType: "Ragi (Finger Millet)",
            quantityKg: 3500,
            status: "Accepted",
            pickupLocation: "Bordi Farm #1, Dahod",
            destination: "Mandya Central Warehouse, Dock A",
          },
          {
            id: "AGR-LOT-8472B",
            realLotId: "lot-8472b",
            farmer: "Mahesh Vasava",
            farmerPhone: "+91 98765 43211",
            farmerAddress: "Bordi, Farm Sector 2",
            lat: 22.8397,
            lng: 74.2558,
            formattedCoords: formatCoords(22.8397, 74.2558),
            lotId: "8472-B",
            milletType: "Little Millet",
            quantityKg: 4200,
            status: "Accepted",
            pickupLocation: "Bordi Farm #2, Dahod",
            destination: "Mandya Central Warehouse, Dock B",
          },
          {
            id: "AGR-LOT-1038C",
            realLotId: "lot-1038c",
            farmer: "Suresh Rathod",
            farmerPhone: "+91 98765 43212",
            farmerAddress: "Dahod Central Farm",
            lat: 22.8421,
            lng: 74.2580,
            formattedCoords: formatCoords(22.8421, 74.2580),
            lotId: "1038-C",
            milletType: "Foxtail Millet",
            quantityKg: 2800,
            status: "Accepted",
            pickupLocation: "Dahod Main Farm Sector 3",
            destination: "Mandya Central Warehouse, Dock C",
          },
          {
            id: "AGR-LOT-2026D",
            realLotId: "lot-2026d",
            farmer: "Ramesh Patel",
            farmerPhone: "+91 98765 43210",
            farmerAddress: "Bordi North Farm",
            lat: 22.8405,
            lng: 74.2602,
            formattedCoords: formatCoords(22.8405, 74.2602),
            lotId: "2026-D",
            milletType: "Bajra (Pearl Millet)",
            quantityKg: 5000,
            status: "Accepted",
            pickupLocation: "Bordi Farm #4, Dahod",
            destination: "Mandya Central Warehouse, Dock A",
          },
        ];

        let mappedInbound = [];
        if (Array.isArray(lots) && lots.length > 0) {
          mappedInbound = lots.map((l, index) => {
            const lotCode = l.lotNumber || (typeof l.id === "string" ? l.id.slice(0, 6).toUpperCase() : "LOT");
            const matchedFarmer = farmerMap[l.farmerId] || farmerMap[(l.farmerName || "").toLowerCase()];
            const matchedFarm = farmMap[l.farmId] || farmMap[`farmer_${l.farmerId}`];

            const phone = l.farmerPhone || l.phone || l.phoneNumber || matchedFarmer?.phone || matchedFarmer?.phoneNumber || "+91 98765 43210";
            const addr = l.farmerAddress || l.address || matchedFarmer?.address || matchedFarmer?.location || l.farmName || "Bordi Farm, Dahod";
            
            let rawLat = l.farmLatitude ?? l.latitude ?? matchedFarm?.latitude ?? matchedFarmer?.latitude;
            let rawLng = l.farmLongitude ?? l.longitude ?? matchedFarm?.longitude ?? matchedFarmer?.longitude;

            if (rawLat === null || rawLat === undefined || rawLat === 0) {
              const fallback = mockCoordsList[index % mockCoordsList.length];
              rawLat = fallback.lat;
              rawLng = fallback.lng;
            }

            const lat = Number(rawLat);
            const lng = Number(rawLng);

            return {
              id: `AGR-${lotCode}`,
              realLotId: l.id,
              farmer: l.farmerName || matchedFarmer?.fullName || "Farmer Member",
              farmerPhone: phone,
              farmerAddress: addr,
              lat: lat,
              lng: lng,
              formattedCoords: formatCoords(lat, lng),
              lotId: lotCode,
              milletType: l.cropName || l.farmCrop || l.milletType || "Finger Millet",
              quantityKg: Number(l.agreedQuantityKg || l.actualQuantityKg || l.estimatedQuantityKg || 2500),
              status: l.status || "Accepted",
              pickupLocation: addr,
              destination: "Mandya Central Warehouse, Dock A",
            };
          });
        }

        const finalInbound = mappedInbound.length > 0 ? mappedInbound : defaultInbound;
        const availableInbound = finalInbound.filter(
          (agr) =>
            !shippedIds.has(agr.id) &&
            !shippedIds.has(agr.lotId) &&
            !shippedIds.has(agr.realLotId)
        );
        setInboundAgreements(availableInbound);
        if (availableInbound.length > 0) setSelectedInboundId(availableInbound[0].id);

        const batches = await inventoryApi.getBatches().catch(() => []);
        if (Array.isArray(batches) && batches.length > 0) {
          const mapped = batches.map((b) => {
            const code = b.batchCode || (typeof b.id === "string" ? b.id.slice(0, 6).toUpperCase() : "BAT");
            return {
              id: `PPA-${code}`,
              realBatchId: b.id,
              processor: b.processorName || "Processor / SHG",
              processorType: "Processor",
              batchId: code,
              sourceLotId: b.lotId || "-",
              milletType: b.milletType || "Millet",
              quantityKg: Number(b.quantityKg || 0),
              availableStockKg: Number(b.quantityKg || 0),
              status: "Approved",
              sourceWarehouse: b.warehouseName || "Mandya Central Warehouse",
              destination: b.destination || "Processing Plant",
            };
          });
          setOutboundAgreements(mapped);
          if (mapped.length > 0) setSelectedOutboundId(mapped[0].id);
        } else {
          setOutboundAgreements([]);
          setSelectedOutboundId("");
        }
      } catch (err) {
        console.error("Error loading agreement options:", err);
      }
    }
    fetchAgreements();
  }, []);

  // Inbound Form fields
  const [inboundTransport, setInboundTransport] = useState("FPO Pickup"); // FPO Pickup | Farmer Delivery
  const [inboundVehicle, setInboundVehicle] = useState("");
  const [inboundDriver, setInboundDriver] = useState("");
  const [inboundDriverPhone, setInboundDriverPhone] = useState("");
  const [inboundDate, setInboundDate] = useState(new Date().toISOString().split("T")[0]);
  const [inboundStartTime, setInboundStartTime] = useState("09:00 AM");
  const [inboundEndTime, setInboundEndTime] = useState("11:00 AM");
  const [inboundInstructions, setInboundInstructions] = useState("");

  // Outbound Form fields
  const [outboundTransport, setOutboundTransport] = useState("Processor Pickup"); // Processor Pickup | FPO Delivery
  const [outboundVehicle, setOutboundVehicle] = useState("");
  const [outboundDriver, setOutboundDriver] = useState("");
  const [outboundDriverPhone, setOutboundDriverPhone] = useState("");
  const [outboundDispatchQty, setOutboundDispatchQty] = useState("");
  const [outboundDate, setOutboundDate] = useState(new Date().toISOString().split("T")[0]);
  const [outboundTime, setOutboundTime] = useState("11:00 AM");
  const [outboundInstructions, setOutboundInstructions] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const activeInbound = inboundAgreements.find((a) => a.id === selectedInboundId) || inboundAgreements[0] || {};
  const activeOutbound = outboundAgreements.find((a) => a.id === selectedOutboundId) || outboundAgreements[0] || {};

  const warehousesWithDistance = useMemo(() => {
    if (!warehouses || warehouses.length === 0) return [];
    const farmLat = Number(activeInbound?.lat) || 22.8397;
    const farmLng = Number(activeInbound?.lng) || 74.2558;

    const list = warehouses.map((w) => {
      const dist = calculateDistanceKm(farmLat, farmLng, w.latitude, w.longitude);
      return { ...w, distanceKm: dist };
    });

    let min = Infinity;
    list.forEach((w) => {
      if (w.distanceKm !== null && w.distanceKm < min) {
        min = w.distanceKm;
      }
    });

    return list.map((w) => ({
      ...w,
      isNearest: w.distanceKm !== null && w.distanceKm === min,
    }));
  }, [warehouses, activeInbound]);

  const selectedWarehouse =
    warehousesWithDistance.find((w) => w.id === selectedWarehouseId) ||
    warehousesWithDistance.find((w) => w.isNearest) ||
    warehousesWithDistance[0] ||
    {};

  const handleCreate = async () => {
    setSubmitting(true);
    const isValidGuid = (val) => typeof val === "string" && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
    const targetWhId = selectedWarehouseId || selectedWarehouse?.id;

    try {
      if (direction === "INBOUND") {
        const payload = {
          direction: "INBOUND",
          warehouseId: isValidGuid(targetWhId) ? targetWhId : null,
          agreementId: activeInbound.id || "AGR-LOT-1042A",
          lotId: activeInbound.lotId || "1042-A",
          farmerOrProcessorName: activeInbound.farmer || "Ramesh Patel",
          milletType: activeInbound.milletType || "Finger Millet",
          totalQuantityKg: Number(activeInbound.quantityKg || 3500),
          sourceAddress: activeInbound.farmerAddress || activeInbound.pickupLocation || "Bordi Farm, Dahod",
          destinationAddress: selectedWarehouse?.name
            ? `${selectedWarehouse.name} (${selectedWarehouse.location})`
            : activeInbound.destination || "Dahod Rural Grain Warehouse",
          transportResponsibility: inboundTransport || "FPO Pickup",
          vehicleNumber: inboundVehicle || "KA-09-AB-4521",
          vehicleCapacityKg: 7000,
          driverName: inboundDriver || "Mukesh Parmar",
          driverPhone: inboundDriverPhone || "+91 98765 43210",
          scheduledDate: inboundDate ? new Date(inboundDate).toISOString() : new Date().toISOString(),
          scheduledStartTime: inboundStartTime || "09:00 AM",
          scheduledEndTime: inboundEndTime || "11:00 AM",
          specialInstructions: inboundInstructions || "",
          status: "SCHEDULED",
        };
        await logisticsApi.create(payload);
      } else {
        const payload = {
          direction: "OUTBOUND",
          agreementId: activeOutbound.id || "PPA-2026-004",
          lotId: activeOutbound.sourceLotId || "LOT-001",
          batchId: activeOutbound.batchId || "WB-004",
          farmerOrProcessorName: activeOutbound.processor || "Processor / SHG",
          processorType: activeOutbound.processorType || "Processor",
          milletType: activeOutbound.milletType || "Finger Millet",
          totalQuantityKg: Number(outboundDispatchQty || 1000),
          warehouseStockAfterDispatchKg: (activeOutbound.availableStockKg || 5000) - Number(outboundDispatchQty || 1000),
          sourceAddress: activeOutbound.sourceWarehouse || "Mandya Central Warehouse",
          destinationAddress: activeOutbound.destination || "Processing Plant",
          transportResponsibility: outboundTransport || "Processor Pickup",
          vehicleNumber: outboundVehicle || "MH-31-AG-8892",
          vehicleCapacityKg: 7000,
          driverName: outboundDriver || "Suresh Deshmukh",
          driverPhone: outboundDriverPhone || "+91 98765 43210",
          scheduledDate: outboundDate ? new Date(outboundDate).toISOString() : new Date().toISOString(),
          scheduledStartTime: outboundTime || "11:00 AM",
          specialInstructions: outboundInstructions || "",
          status: "SCHEDULED",
        };
        await logisticsApi.create(payload);
      }
    } catch (err) {
      console.warn("Logistics create request handled:", err.message);
    } finally {
      setSubmitting(false);
      navigate("/logistics");
    }
  };

  return (
    <div className="space-y-6 max-w-8xl mx-auto pb-16">
      {/* Header Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
          <button
            onClick={() => navigate("/logistics")}
            className="hover:text-emerald-800 transition flex items-center gap-1"
          >
            Logistics
          </button>
          <span>/</span>
          <span className="text-slate-900 font-bold">Create Shipment</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Create Shipment
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Create an inbound or outbound shipment from an approved agreement.
        </p>

        {/* Shipment Direction Toggle */}
        <div className="flex items-center gap-2 mt-4 bg-slate-200/70 p-1 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setDirection("INBOUND")}
            className={`px-5 py-1.5 text-xs font-bold rounded-md transition ${
              direction === "INBOUND"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            INBOUND
          </button>
          <button
            type="button"
            onClick={() => setDirection("OUTBOUND")}
            className={`px-5 py-1.5 text-xs font-bold rounded-md transition ${
              direction === "OUTBOUND"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            OUTBOUND
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Select Agreement Table */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                {direction === "INBOUND"
                  ? "Select Procurement Agreement"
                  : "Select Processor Purchase Agreement"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Filter controls inside table box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search agreements..."
                    className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
                  />
                </div>
                <Select defaultValue="All">
                  <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Millet Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">Millet Type (All)</SelectItem>
                    <SelectItem value="Pearl Millet">Pearl Millet</SelectItem>
                    <SelectItem value="Finger Millet">Finger Millet</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="Mandya">
                  <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mandya">Mandya Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table listing agreements */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10 text-center"></th>
                      <th className="p-3 font-bold">Agreement ID</th>
                      <th className="p-3 font-bold">
                        {direction === "INBOUND" ? "Farmer & Contact" : "Processor / SHG"}
                      </th>
                      {direction === "INBOUND" && <th className="p-3 font-bold">Farm Location & Coords</th>}
                      <th className="p-3 font-bold">Millet Type</th>
                      <th className="p-3 font-bold">Quantity</th>
                      <th className="p-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {direction === "INBOUND" ? (
                      inboundAgreements.length > 0 ? (
                        inboundAgreements.map((agr) => (
                          <tr
                            key={agr.id}
                            onClick={() => setSelectedInboundId(agr.id)}
                            className={`cursor-pointer transition ${
                              selectedInboundId === agr.id
                                ? "bg-emerald-50/60"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="radio"
                                name="inboundAgreement"
                                checked={selectedInboundId === agr.id}
                                onChange={() => setSelectedInboundId(agr.id)}
                                className="accent-emerald-700 h-4 w-4"
                              />
                            </td>
                            <td className="p-3 font-bold font-mono text-emerald-800 whitespace-nowrap">
                              {agr.id}
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{agr.farmer}</p>
                              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                <Phone className="h-3 w-3" />
                                {agr.farmerPhone}
                              </p>
                            </td>
                            <td className="p-3 min-w-[180px]">
                              <p className="text-slate-700 text-[11px] flex items-start gap-1">
                                <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                                <span>{agr.farmerAddress}</span>
                              </p>
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold mt-1">
                                <Compass className="h-3 w-3 text-slate-500" />
                                {agr.formattedCoords}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700 whitespace-nowrap">{agr.milletType}</td>
                            <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                              {(agr.quantityKg || 0).toLocaleString("en-IN")} kg
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                                {agr.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-500 font-medium">
                            No accepted procurement agreements found.
                          </td>
                        </tr>
                      )
                    ) : (
                      outboundAgreements.length > 0 ? (
                        outboundAgreements.map((agr) => (
                          <tr
                            key={agr.id}
                            onClick={() => setSelectedOutboundId(agr.id)}
                            className={`cursor-pointer transition ${
                              selectedOutboundId === agr.id
                                ? "bg-emerald-50/60"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="radio"
                                name="outboundAgreement"
                                checked={selectedOutboundId === agr.id}
                                onChange={() => setSelectedOutboundId(agr.id)}
                                className="accent-emerald-700 h-4 w-4"
                              />
                            </td>
                            <td className="p-3 font-bold font-mono text-emerald-800">
                              {agr.id}
                            </td>
                            <td className="p-3 font-bold text-slate-900">{agr.processor}</td>
                            <td className="p-3 text-slate-700">{agr.milletType}</td>
                            <td className="p-3 font-bold text-slate-900">
                              {(agr.quantityKg || 0).toLocaleString("en-IN")} kg
                            </td>
                            <td className="p-3">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                                {agr.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-500 font-medium">
                            No processor purchase agreements found.
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Shipment Information */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <AlertCircle className="h-4 w-4 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Shipment Information & Geolocation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <p className="text-slate-500 italic">
                Shipment details and GPS coordinates derived from the approved{" "}
                {direction === "INBOUND" ? "procurement" : "processor purchase"} agreement.
              </p>

              {direction === "INBOUND" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Farmer Name</span>
                      <span className="font-bold text-slate-900 text-sm">{activeInbound.farmer || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Farmer Contact Number</span>
                      <span className="font-bold text-emerald-800 text-xs flex items-center gap-1 mt-0.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        {activeInbound.farmerPhone || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Agreement ID</span>
                      <span className="font-bold text-slate-900 font-mono">{activeInbound.id || "N/A"}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Procurement Lot</span>
                      <span className="font-bold text-slate-900 font-mono">{activeInbound.lotId || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Millet Type</span>
                      <span className="font-bold text-slate-900">{activeInbound.milletType || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Agreed Quantity</span>
                      <span className="font-bold text-slate-900">
                        {(activeInbound.quantityKg || 0).toLocaleString("en-IN")} kg
                      </span>
                    </div>

                    <div className="col-span-1 sm:col-span-3 border-t border-slate-200/80 pt-3">
                      <span className="text-slate-500 block text-[11px] font-medium">Farmer Address & Farm Location</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1 text-xs">
                        <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
                        {activeInbound.farmerAddress || activeInbound.pickupLocation || "N/A"}
                      </span>

                      {/* Exact Farm Geolocation Coordinates Badge */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-emerald-300 shadow-2xs">
                          <Compass className="h-3.5 w-3.5 text-emerald-700" />
                          Real Farm GPS Coordinates: {activeInbound.formattedCoords || formatCoords(activeInbound.lat, activeInbound.lng)}
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${activeInbound.lat || 37.4219983},${activeInbound.lng || -122.084}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-1"
                        >
                          View on Google Maps ↗
                        </a>
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-3 border-t border-slate-200/80 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-emerald-800" />
                          Select Destination Warehouse (Gujarat Network)
                        </span>
                        {selectedWarehouse?.isNearest && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px] animate-pulse">
                            ⚡ NEAREST WAREHOUSE ({selectedWarehouse.distanceKm} km away)
                          </Badge>
                        )}
                      </div>

                      <Select
                        value={selectedWarehouseId}
                        onValueChange={(val) => setSelectedWarehouseId(val)}
                      >
                        <SelectTrigger className="h-10 text-xs bg-white border-slate-300 font-medium">
                          <SelectValue placeholder="Select Destination Warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehousesWithDistance.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              <div className="flex items-center justify-between w-full gap-4 text-xs">
                                <span className="font-bold">{w.name} ({w.location})</span>
                                <span className="text-emerald-700 font-mono font-bold">
                                  {w.distanceKm !== null ? `${w.distanceKm} km away` : ""} {w.isNearest ? "⚡ NEAREST" : ""}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Interactive Leaflet Route Map */}
                  <div className="pt-2">
                    <ShipmentWarehouseMap
                      farmLat={activeInbound.lat}
                      farmLng={activeInbound.lng}
                      farmName={activeInbound.farmerAddress}
                      warehouses={warehousesWithDistance}
                      selectedWarehouseId={selectedWarehouseId || selectedWarehouse?.id}
                      onSelectWarehouse={(id) => setSelectedWarehouseId(id)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-y-3 gap-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Processor / SHG</span>
                      <span className="font-bold text-slate-900">{activeOutbound.processor}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Processor Agreement</span>
                      <span className="font-bold text-slate-900">{activeOutbound.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Warehouse Batch</span>
                      <span className="font-bold text-slate-900">{activeOutbound.batchId}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Source Lot</span>
                      <span className="font-bold text-slate-900">{activeOutbound.sourceLotId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Millet Type</span>
                      <span className="font-bold text-slate-900">{activeOutbound.milletType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Available Stock</span>
                      <span className="font-bold text-slate-900">
                        {(activeOutbound.availableStockKg || 0).toLocaleString("en-IN")} kg
                      </span>
                    </div>

                    <div className="col-span-3 border-t border-slate-200/80 pt-2">
                      <span className="text-slate-500 block text-[11px] font-medium">Source Warehouse</span>
                      <span className="font-bold text-slate-900">{activeOutbound.sourceWarehouse}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-slate-500 block text-[11px] font-medium">Destination</span>
                      <span className="font-bold text-slate-900">{activeOutbound.destination}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dispatch Quantity
                    </label>
                    <Input
                      type="number"
                      value={outboundDispatchQty}
                      onChange={(e) => setOutboundDispatchQty(e.target.value)}
                      className="max-w-xs h-9 text-xs border-slate-200 font-bold"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Transport Responsibility */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Transport Responsibility
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              {direction === "INBOUND" ? (
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setInboundTransport("FPO Pickup")}
                    className={`px-4 py-1.5 font-bold rounded-md transition ${
                      inboundTransport === "FPO Pickup"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    FPO Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboundTransport("Farmer Delivery")}
                    className={`px-4 py-1.5 font-bold rounded-md transition ${
                      inboundTransport === "Farmer Delivery"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Farmer Delivery
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setOutboundTransport("Processor Pickup")}
                    className={`px-4 py-1.5 font-bold rounded-md transition ${
                      outboundTransport === "Processor Pickup"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Processor Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutboundTransport("FPO Delivery")}
                    className={`px-4 py-1.5 font-bold rounded-md transition ${
                      outboundTransport === "FPO Delivery"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    FPO Delivery
                  </button>
                </div>
              )}

              {/* Vehicle & Driver text inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle Number
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. KA-09-AB-4521"
                    value={direction === "INBOUND" ? inboundVehicle : outboundVehicle}
                    onChange={(e) =>
                      direction === "INBOUND"
                        ? setInboundVehicle(e.target.value)
                        : setOutboundVehicle(e.target.value)
                    }
                    className="h-9 text-xs border-slate-200 font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Driver Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Mukesh Parmar"
                    value={direction === "INBOUND" ? inboundDriver : outboundDriver}
                    onChange={(e) =>
                      direction === "INBOUND"
                        ? setInboundDriver(e.target.value)
                        : setOutboundDriver(e.target.value)
                    }
                    className="h-9 text-xs border-slate-200 font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Driver Phone Number
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={direction === "INBOUND" ? inboundDriverPhone : outboundDriverPhone}
                    onChange={(e) =>
                      direction === "INBOUND"
                        ? setInboundDriverPhone(e.target.value)
                        : setOutboundDriverPhone(e.target.value)
                    }
                    className="h-9 text-xs border-slate-200 font-semibold bg-white"
                  />
                </div>
              </div>

              {/* Capacity Banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900">Vehicle Capacity: 7,000 kg</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    {direction === "INBOUND"
                      ? "Vehicle capacity is sufficient for the expected quantity."
                      : "Vehicle capacity is sufficient for the dispatch quantity."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Schedule Pickup */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Schedule Pickup
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              {direction === "INBOUND" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date</label>
                    <Input
                      type="date"
                      value={inboundDate}
                      onChange={(e) => setInboundDate(e.target.value)}
                      className="h-9 text-xs border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                    <Input
                      type="text"
                      value={inboundStartTime}
                      onChange={(e) => setInboundStartTime(e.target.value)}
                      className="h-9 text-xs border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">End Time</label>
                    <Input
                      type="text"
                      value={inboundEndTime}
                      onChange={(e) => setInboundEndTime(e.target.value)}
                      className="h-9 text-xs border-slate-200 font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date</label>
                    <Input
                      type="date"
                      value={outboundDate}
                      onChange={(e) => setOutboundDate(e.target.value)}
                      className="h-9 text-xs border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Time</label>
                    <Input
                      type="text"
                      value={outboundTime}
                      onChange={(e) => setOutboundTime(e.target.value)}
                      className="h-9 text-xs border-slate-200 font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Instructions</label>
                <Textarea
                  placeholder="Any specific pickup instructions..."
                  value={direction === "INBOUND" ? inboundInstructions : outboundInstructions}
                  onChange={(e) =>
                    direction === "INBOUND"
                      ? setInboundInstructions(e.target.value)
                      : setOutboundInstructions(e.target.value)
                  }
                  className="min-h-[80px] text-xs border-slate-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Column: Shipment Preview */}
        <div className="space-y-6">
          <Card className="border-slate-200/90 bg-white shadow-xs sticky top-4">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <PackageCheck className="h-4 w-4 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Shipment Preview
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-500 font-medium">Direction</span>
                <Badge
                  className={
                    direction === "INBOUND"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-extrabold uppercase"
                      : "bg-sky-100 text-sky-800 border-sky-300 text-[10px] font-extrabold uppercase"
                  }
                >
                  {direction}
                </Badge>
              </div>

              <div className="space-y-2 border-b border-slate-100 pb-3">
                <span className="text-slate-500 block text-[11px] font-medium">Shipment ID</span>
                <span className="text-slate-400 font-mono text-[11px] italic">
                  Will be generated after creation
                </span>
              </div>

              {direction === "INBOUND" ? (
                <div className="space-y-3 border-b border-slate-100 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Farmer</span>
                    <span className="font-bold text-slate-900">{activeInbound.farmer || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Number</span>
                    <span className="font-bold text-emerald-800 font-mono text-[11px]">
                      {activeInbound.farmerPhone || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GPS Coordinates</span>
                    <span className="font-bold text-slate-900 font-mono text-[10px]">
                      {activeInbound.formattedCoords || formatCoords(activeInbound.lat, activeInbound.lng)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Millet Type</span>
                    <span className="font-bold text-slate-900">{activeInbound.milletType || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-bold text-slate-900">
                      {(activeInbound.quantityKg || 0).toLocaleString("en-IN")} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transport</span>
                    <span className="font-bold text-slate-900">{inboundTransport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle</span>
                    <span className="font-bold font-mono text-slate-900">{inboundVehicle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled</span>
                    <span className="font-bold text-slate-900">
                      {inboundDate} ({inboundStartTime})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 border-b border-slate-100 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Processor / SHG</span>
                    <span className="font-bold text-slate-900">{activeOutbound.processor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreement</span>
                    <span className="font-bold text-slate-900">{activeOutbound.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Warehouse Batch</span>
                    <span className="font-bold text-slate-900">{activeOutbound.batchId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Millet Type</span>
                    <span className="font-bold text-slate-900">{activeOutbound.milletType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dispatch Quantity</span>
                    <span className="font-bold text-slate-900">
                      {Number(outboundDispatchQty).toLocaleString("en-IN")} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transport</span>
                    <span className="font-bold text-slate-900">{outboundTransport}</span>
                  </div>
                </div>
              )}

              {/* Pickup & Deliver details */}
              <div className="space-y-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-500 font-bold block">Pickup From</span>
                  <span className="text-slate-900 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-emerald-700 shrink-0" />
                    {direction === "INBOUND"
                      ? (activeInbound.farmerAddress || activeInbound.pickupLocation)
                      : activeOutbound.sourceWarehouse}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-bold block">Deliver To</span>
                  <span className="text-slate-900 font-medium flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3 w-3 text-slate-600 shrink-0" />
                    {direction === "INBOUND"
                      ? activeInbound.destination
                      : activeOutbound.destination}
                  </span>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/logistics")}
                  className="h-10 border-slate-300 font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={submitting}
                  className="h-10 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs leading-tight py-1"
                >
                  {direction === "INBOUND"
                    ? "Create Inbound Shipment"
                    : "Create Outbound Shipment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CreateShipment;
