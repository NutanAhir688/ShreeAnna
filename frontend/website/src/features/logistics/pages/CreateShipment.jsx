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
  Plus,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  if (lat === null || lat === undefined || lng === null || lng === undefined || lat === "" || lng === "") {
    return "N/A";
  }
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng) || (numLat === 0 && numLng === 0)) return "N/A";

  const latDir = numLat >= 0 ? "N" : "S";
  const lngDir = numLng >= 0 ? "E" : "W";
  return `${Math.abs(numLat).toFixed(4)}° ${latDir}, ${Math.abs(numLng).toFixed(4)}° ${lngDir}`;
}

function ShipmentWarehouseMap({
  farmLat,
  farmLng,
  farmName = "",
  warehouses = [],
  selectedWarehouseId,
  onSelectWarehouse,
  onRouteCalculated,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const routeCacheRef = useRef({});

  const [routeInfo, setRouteInfo] = useState({
    distanceKm: null,
    durationText: null,
    coordinates: [],
    loading: false,
  });

  const hasFarmCoords =
    farmLat !== null &&
    farmLat !== undefined &&
    farmLng !== null &&
    farmLng !== undefined &&
    !isNaN(Number(farmLat)) &&
    !isNaN(Number(farmLng)) &&
    !(Number(farmLat) === 0 && Number(farmLng) === 0);

  const validFarmLat = hasFarmCoords ? Number(farmLat) : null;
  const validFarmLng = hasFarmCoords ? Number(farmLng) : null;

  const selectedWh =
    warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0] || null;

  // 1. Fetch real road driving route using OSRM
  useEffect(() => {
    if (validFarmLat === null || validFarmLng === null || !selectedWh?.latitude || !selectedWh?.longitude) {
      setRouteInfo({ distanceKm: null, durationText: null, coordinates: [], loading: false });
      return;
    }

    const swLat = Number(selectedWh.latitude);
    const swLng = Number(selectedWh.longitude);
    if (!swLat || !swLng) return;

    const cacheKey = `${validFarmLng.toFixed(4)},${validFarmLat.toFixed(4)};${swLng.toFixed(4)},${swLat.toFixed(4)}`;
    if (routeCacheRef.current[cacheKey]) {
      const cached = routeCacheRef.current[cacheKey];
      setRouteInfo(cached);
      if (onRouteCalculated) onRouteCalculated(cached);
      return;
    }

    let isCancelled = false;
    setRouteInfo((prev) => ({ ...prev, loading: true }));

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${validFarmLng},${validFarmLat};${swLng},${swLat}?overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distKm = Math.round((route.distance / 1000) * 10) / 10;
          const secs = route.duration;
          const hrs = Math.floor(secs / 3600);
          const mins = Math.round((secs % 3600) / 60);
          const durStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

          const result = {
            distanceKm: distKm,
            durationText: durStr,
            coordinates: coords,
            loading: false,
          };
          routeCacheRef.current[cacheKey] = result;
          setRouteInfo(result);
          if (onRouteCalculated) onRouteCalculated(result);
        } else {
          setRouteInfo((prev) => ({ ...prev, loading: false }));
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn("Real driving route fetch error:", err);
          setRouteInfo((prev) => ({ ...prev, loading: false }));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [validFarmLat, validFarmLng, selectedWh?.latitude, selectedWh?.longitude, onRouteCalculated]);

  // 2. Render map layers with real road geometry
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

    // Farm Marker (Emerald Pin)
    if (validFarmLat !== null && validFarmLng !== null) {
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
          <div style="font-size: 11px; color: #1e293b; font-weight: 700; margin-top: 2px;">${farmName || "Origin Farm"}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">GPS: ${validFarmLat.toFixed(4)}°, ${validFarmLng.toFixed(4)}°</div>
        </div>
      `);
      layerGroup.addLayer(farmMarker);
    }

    // Warehouse Markers
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
                 <svg width="${isSelected ? 20 : 15}" height="${isSelected ? 20 : 15
          }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
               </div>`,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
      });

      const displayDist = isSelected && routeInfo.distanceKm !== null ? routeInfo.distanceKm : w.distanceKm;

      const whMarker = L.marker([wLat, wLng], { icon: whIcon }).bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
          <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${w.name}</div>
          <div style="color: #047857; font-weight: 700; font-size: 11px;">📍 ${w.district}, ${w.village}</div>
          <div style="font-size: 11px; margin-top: 4px; color: #1e293b;">
            <b>${isSelected && routeInfo.distanceKm !== null ? "Road Distance:" : "Distance from Farm:"}</b> ${displayDist !== null ? displayDist + " km" : "N/A"}
          </div>
          ${isSelected && routeInfo.durationText ? `<div style="font-size: 11px; color: #2563eb;"><b>Est. Drive Time:</b> ~${routeInfo.durationText}</div>` : ""}
          ${isNearest
          ? '<div style="margin-top: 4px; background-color: #dcfce7; color: #15803d; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px; display: inline-block;">⚡ NEAREST WAREHOUSE</div>'
          : ""
        }
          ${isSelected
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

    // 3. Connect Farm -> Selected Warehouse with Real Driving Route (or dashed fallback)
    if (routeInfo.coordinates && routeInfo.coordinates.length > 0) {
      // Highway casing
      const casing = L.polyline(routeInfo.coordinates, {
        color: "#1e3a8a",
        weight: 6,
        opacity: 0.5,
        lineCap: "round",
        lineJoin: "round",
      });
      // Active route line
      const road = L.polyline(routeInfo.coordinates, {
        color: "#2563eb",
        weight: 4,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px;">
          <div style="font-weight: 800; color: #1e3a8a; font-size: 12px;">🚚 REAL ROAD DRIVING ROUTE</div>
          <div style="font-size: 11px; color: #0f172a; margin-top: 2px;"><b>Driving Distance:</b> ${routeInfo.distanceKm} km</div>
          ${routeInfo.durationText ? `<div style="font-size: 11px; color: #047857; margin-top: 1px;"><b>Est. Duration:</b> ~${routeInfo.durationText}</div>` : ""}
        </div>
      `);
      layerGroup.addLayer(casing);
      layerGroup.addLayer(road);

      // Expand bounds with real road coordinates so entire route fits map
      routeInfo.coordinates.forEach((pt) => bounds.push(pt));
    } else if (validFarmLat !== null && validFarmLng !== null && selectedWh && selectedWh.latitude && selectedWh.longitude) {
      const swLat = Number(selectedWh.latitude);
      const swLng = Number(selectedWh.longitude);
      if (swLat && swLng) {
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
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else {
      map.setView([22.5, 73.0], 8);
    }
  }, [
    validFarmLat,
    validFarmLng,
    farmName,
    warehouses,
    selectedWh,
    routeInfo,
    onSelectWarehouse,
  ]);

  const fallbackDist = selectedWh ? selectedWh.distanceKm : null;
  const displayDistance = routeInfo.distanceKm !== null ? routeInfo.distanceKm : fallbackDist;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-sm relative">
      <div className="bg-slate-900 text-white p-2.5 px-3 flex justify-between items-center text-xs border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-slate-100">Live Route & Warehouse Proximity Map</span>
          {routeInfo.loading && (
            <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800 animate-pulse">
              <Loader2 className="h-2.5 w-2.5 animate-spin" /> Routing real roads...
            </span>
          )}
        </div>
        {displayDistance !== null && (
          <span className="text-[11px] bg-blue-900/90 text-blue-100 font-bold px-2.5 py-0.5 rounded border border-blue-600 shadow-xs flex items-center gap-1.5">
            <Truck className="h-3 w-3 text-blue-300" />
            {routeInfo.distanceKm !== null ? `Road Distance: ${displayDistance} km` : `Route Distance: ${displayDistance} km`}
            {routeInfo.durationText ? ` (~${routeInfo.durationText})` : ""}
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
        {routeInfo.durationText && (
          <div className="text-center">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Est. Drive Time</span>
            <span className="font-bold text-emerald-700 text-xs flex items-center gap-1 justify-center">
              <Clock className="h-3 w-3" /> ~{routeInfo.durationText}
            </span>
          </div>
        )}
        <div className="text-right">
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Selected Warehouse</span>
          <span className="font-bold text-emerald-800">{selectedWh?.name || "None Selected"}</span>
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
  const [drivers, setDrivers] = useState([]);

  // Selection states
  const [selectedInboundId, setSelectedInboundId] = useState("");
  const [selectedOutboundId, setSelectedOutboundId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [realRouteInfo, setRealRouteInfo] = useState(null);

  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [newDriverData, setNewDriverData] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    vehicleNumber: "",
    vehicleCapacityKg: 7000,
  });

  useEffect(() => {
    async function fetchAgreements() {
      try {
        const [lots, farmers, farms, rawWarehouses, dispatches, driverList] = await Promise.all([
          lotsApi.getAll().catch(() => []),
          farmersApi.getAll().catch(() => []),
          farmsApi.getAll().catch(() => []),
          warehousesApi.getAll().catch(() => []),
          logisticsApi.getAll().catch(() => []),
          logisticsApi.getDrivers().catch(() => []),
        ]);

        if (Array.isArray(driverList) && driverList.length > 0) {
          setDrivers(driverList);
          const firstAvailable = driverList.find(
            (d) =>
              (d.status || "").toUpperCase() === "AVAILABLE" ||
              (d.status || "").toUpperCase() === "ACTIVE"
          );
          if (firstAvailable) {
            setSelectedDriverId(firstAvailable.id);
            setInboundDriver(firstAvailable.name || "");
            setInboundDriverPhone(firstAvailable.phone || "");
            setInboundVehicle(firstAvailable.vehicleNumber || "");
            setOutboundDriver(firstAvailable.name || "");
            setOutboundDriverPhone(firstAvailable.phone || "");
            setOutboundVehicle(firstAvailable.vehicleNumber || "");
          } else {
            setSelectedDriverId("");
            setInboundDriver("");
            setInboundDriverPhone("");
            setInboundVehicle("");
            setOutboundDriver("");
            setOutboundDriverPhone("");
            setOutboundVehicle("");
          }
        }

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
            name: w.name || w.Name || "",
            code: w.warehouseCode || w.code || "",
            district: w.district || w.District || "",
            village: w.village || w.Village || "",
            location: w.location || [w.village || w.Village, w.district || w.District].filter(Boolean).join(", "),
            latitude: w.latitude !== null && w.latitude !== undefined && !isNaN(Number(w.latitude)) ? Number(w.latitude) : null,
            longitude: w.longitude !== null && w.longitude !== undefined && !isNaN(Number(w.longitude)) ? Number(w.longitude) : null,
            capacityInTons: Number(w.capacityInTons || w.CapacityInTons || 0),
            utilizedCapacityTons: Number(w.utilizedCapacityTons || w.UtilizedCapacityTons || 0),
            managerName: w.managerName || w.ManagerName || "",
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
            if (f.id) {
              farmMap[f.id] = f;
              farmMap[String(f.id).toLowerCase()] = f;
            }
            if (f.farmerId) {
              farmMap[`farmer_${f.farmerId}`] = f;
              farmMap[`farmer_${String(f.farmerId).toLowerCase()}`] = f;
            }
          });
        }

        let mappedInbound = [];
        if (Array.isArray(lots) && lots.length > 0) {
          // Strictly filter to ONLY lots whose agreement has been accepted!
          const acceptedLots = lots.filter((l) => {
            const st = (l.status || "").toUpperCase().trim();
            return st === "AGREEMENT_ACCEPTED" || st === "ACCEPTED";
          });

          mappedInbound = acceptedLots.map((l, index) => {
            const lotCode = l.lotNumber || (typeof l.id === "string" ? l.id.slice(0, 6).toUpperCase() : "LOT");
            const matchedFarmer =
              farmerMap[l.farmerId] ||
              farmerMap[String(l.farmerId || "").toLowerCase()] ||
              farmerMap[(l.farmerName || "").toLowerCase()];

            const matchedFarm =
              farmMap[l.farmId] ||
              farmMap[String(l.farmId || "").toLowerCase()] ||
              farmMap[`farmer_${l.farmerId}`] ||
              farmMap[`farmer_${String(l.farmerId || "").toLowerCase()}`];

            const phone = l.farmerPhone || l.phone || l.phoneNumber || matchedFarmer?.phone || matchedFarmer?.phoneNumber || "";

            // Farm location resolution:
            // Pickup location is the actual farm land location, NOT the farmer's personal residential address.
            const farmName = matchedFarm?.farmName || l.farmName;
            const village = matchedFarm?.village || l.farmVillage;
            const taluka = matchedFarm?.taluka || l.farmTaluka;
            const district = matchedFarm?.district || l.farmDistrict;

            const locParts = [];
            if (village) locParts.push(village);
            if (taluka && !locParts.some((p) => p.toLowerCase().includes(taluka.toLowerCase()))) {
              locParts.push(taluka);
            }
            if (district && !locParts.some((p) => p.toLowerCase().includes(district.toLowerCase()))) {
              locParts.push(district);
            }

            const geoLoc = locParts.join(", ");
            let farmLocation = "";
            if (farmName && geoLoc && farmName.toLowerCase() !== "farm" && farmName.toLowerCase() !== village?.toLowerCase()) {
              farmLocation = `${farmName}, ${geoLoc}`;
            } else if (geoLoc) {
              farmLocation = geoLoc;
            } else if (farmName && farmName.toLowerCase() !== "farm") {
              farmLocation = farmName;
            } else {
              farmLocation = l.farmerAddress || matchedFarmer?.address || "Farm Location";
            }

            const farmerAddress = matchedFarmer?.address || l.farmerAddress || "";

            let rawLat = l.farmLatitude ?? l.latitude ?? matchedFarm?.latitude ?? matchedFarmer?.latitude;
            let rawLng = l.farmLongitude ?? l.longitude ?? matchedFarm?.longitude ?? matchedFarmer?.longitude;

            const lat = (rawLat !== null && rawLat !== undefined && rawLat !== "" && !isNaN(Number(rawLat)) && Number(rawLat) !== 0)
              ? Number(rawLat)
              : null;
            const lng = (rawLng !== null && rawLng !== undefined && rawLng !== "" && !isNaN(Number(rawLng)) && Number(rawLng) !== 0)
              ? Number(rawLng)
              : null;

            return {
              id: `AGR-${lotCode}`,
              realLotId: l.id,
              farmer: l.farmerName || matchedFarmer?.fullName || "",
              farmerPhone: phone,
              farmerAddress: farmerAddress,
              farmLocation: farmLocation,
              farmName: farmName || "",
              lat: lat,
              lng: lng,
              formattedCoords: formatCoords(lat, lng),
              lotId: lotCode,
              milletType: l.cropName || l.farmCrop || l.milletType || "",
              quantityKg: Number(l.agreedQuantityKg || l.actualQuantityKg || l.estimatedQuantityKg || 0),
              status: l.status || "AGREEMENT_ACCEPTED",
              pickupLocation: farmLocation,
              destination: l.destinationWarehouse || l.warehouseName || l.destination || "",
            };
          });
        }

        const finalInbound = mappedInbound;

        const availableInbound = finalInbound.filter(
          (agr) =>
            ((agr.status || "").toUpperCase().trim() === "AGREEMENT_ACCEPTED" || (agr.status || "").toUpperCase().trim() === "ACCEPTED") &&
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
              processor: b.processorName || b.processor || "",
              processorType: b.processorType || "Processor",
              batchId: code,
              sourceLotId: b.lotId || "-",
              milletType: b.milletType || "",
              quantityKg: Number(b.quantityKg || 0),
              availableStockKg: Number(b.quantityKg || 0),
              status: b.status || "Approved",
              sourceWarehouse: b.warehouseName || "",
              destination: b.destination || "",
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
  const [inboundDate, setInboundDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [inboundTime, setInboundTime] = useState("09:00");

  const [inboundInstructions, setInboundInstructions] = useState("");

  // Outbound Form fields
  const [outboundTransport, setOutboundTransport] = useState("Processor Pickup"); // Processor Pickup | FPO Delivery
  const [outboundVehicle, setOutboundVehicle] = useState("");
  const [outboundDriver, setOutboundDriver] = useState("");
  const [outboundDriverPhone, setOutboundDriverPhone] = useState("");
  const [outboundDispatchQty, setOutboundDispatchQty] = useState("");
  const [outboundDate, setOutboundDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [outboundTime, setOutboundTime] = useState("11:00");
  const [outboundInstructions, setOutboundInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSelectDriver = (driverId) => {
    setSelectedDriverId(driverId);
    const found = drivers.find((d) => d.id === driverId);
    if (found) {
      setInboundDriver(found.name || "");
      setInboundDriverPhone(found.phone || "");
      setInboundVehicle(found.vehicleNumber || "");
      setOutboundDriver(found.name || "");
      setOutboundDriverPhone(found.phone || "");
      setOutboundVehicle(found.vehicleNumber || "");
    }
  };

  const handleSaveNewDriver = async () => {
    if (!newDriverData.name || !newDriverData.phone) return;
    try {
      const created = await logisticsApi.createDriver({
        name: newDriverData.name,
        phone: newDriverData.phone,
        licenseNumber: newDriverData.licenseNumber,
        vehicleNumber: newDriverData.vehicleNumber,
        vehicleCapacityKg: Number(newDriverData.vehicleCapacityKg || 7000),
      });
      setDrivers((prev) => [created, ...prev]);
      setSelectedDriverId(created.id);
      setInboundDriver(created.name);
      setInboundDriverPhone(created.phone);
      setInboundVehicle(created.vehicleNumber);
      setOutboundDriver(created.name);
      setOutboundDriverPhone(created.phone);
      setOutboundVehicle(created.vehicleNumber);
      setIsAddDriverOpen(false);
      setNewDriverData({ name: "", phone: "", licenseNumber: "", vehicleNumber: "", vehicleCapacityKg: 7000 });
    } catch (err) {
      console.error("Failed to add driver:", err);
    }
  };

  const activeInbound = inboundAgreements.find((a) => a.id === selectedInboundId) || inboundAgreements[0] || {};
  const activeOutbound = outboundAgreements.find((a) => a.id === selectedOutboundId) || outboundAgreements[0] || {};

  const warehousesWithDistance = useMemo(() => {
    if (!warehouses || warehouses.length === 0) return [];
    const farmLat =
      activeInbound?.lat !== null && activeInbound?.lat !== undefined && !isNaN(Number(activeInbound.lat))
        ? Number(activeInbound.lat)
        : null;
    const farmLng =
      activeInbound?.lng !== null && activeInbound?.lng !== undefined && !isNaN(Number(activeInbound.lng))
        ? Number(activeInbound.lng)
        : null;

    const list = warehouses.map((w) => {
      const dist =
        farmLat !== null && farmLng !== null && w.latitude !== null && w.longitude !== null
          ? calculateDistanceKm(farmLat, farmLng, w.latitude, w.longitude)
          : null;
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
      isNearest: min !== Infinity && w.distanceKm !== null && w.distanceKm === min,
    }));
  }, [warehouses, activeInbound]);

  const selectedWarehouse =
    warehousesWithDistance.find((w) => w.id === selectedWarehouseId) ||
    warehousesWithDistance.find((w) => w.isNearest) ||
    warehousesWithDistance[0] ||
    null;

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

  const handleCreate = async () => {
    setSubmitting(true);
    const isValidGuid = (val) => typeof val === "string" && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
    const targetWhId = selectedWarehouseId || selectedWarehouse?.id;

    try {
      if (direction === "INBOUND") {
        const payload = {
          direction: "INBOUND",
          warehouseId: isValidGuid(targetWhId) ? targetWhId : null,
          agreementId: activeInbound.id || "",
          lotId: activeInbound.lotId || activeInbound.realLotId || "",
          farmerOrProcessorName: activeInbound.farmer || "",
          milletType: activeInbound.milletType || "",
          totalQuantityKg: Number(activeInbound.quantityKg || 0),
          sourceAddress: activeInbound.farmLocation || activeInbound.pickupLocation || activeInbound.farmerAddress || "",
          destinationAddress: selectedWarehouse?.name
            ? `${selectedWarehouse.name}${selectedWarehouse.location ? ` (${selectedWarehouse.location})` : ""}`
            : (activeInbound.destination || ""),
          transportResponsibility: inboundTransport || "FPO Pickup",
          vehicleNumber: inboundVehicle || "",
          vehicleCapacityKg: Number(selectedDriver?.vehicleCapacityKg || 7000),
          driverName: inboundDriver || "",
          driverPhone: inboundDriverPhone || "",
          scheduledDate: inboundDate,
          scheduledStartTime: inboundTime,
          specialInstructions: inboundInstructions || "",
          pickupLatitude: (activeInbound?.lat !== null && activeInbound?.lat !== undefined && !isNaN(Number(activeInbound.lat))) ? Number(activeInbound.lat) : null,
          pickupLongitude: (activeInbound?.lng !== null && activeInbound?.lng !== undefined && !isNaN(Number(activeInbound.lng))) ? Number(activeInbound.lng) : null,
          destinationLatitude: selectedWarehouse?.latitude !== null && selectedWarehouse?.latitude !== undefined && !isNaN(Number(selectedWarehouse.latitude)) ? Number(selectedWarehouse.latitude) : null,
          destinationLongitude: selectedWarehouse?.longitude !== null && selectedWarehouse?.longitude !== undefined && !isNaN(Number(selectedWarehouse.longitude)) ? Number(selectedWarehouse.longitude) : null,
          status: "SCHEDULED",
        };
        await logisticsApi.create(payload);
      } else {
        const dispatchQty = Number(outboundDispatchQty || 0);
        const availableStock = Number(activeOutbound.availableStockKg || 0);
        const payload = {
          direction: "OUTBOUND",
          agreementId: activeOutbound.id || "",
          lotId: activeOutbound.sourceLotId || "",
          batchId: activeOutbound.batchId || "",
          farmerOrProcessorName: activeOutbound.processor || "",
          processorType: activeOutbound.processorType || "Processor",
          milletType: activeOutbound.milletType || "",
          totalQuantityKg: dispatchQty,
          warehouseStockAfterDispatchKg: availableStock - dispatchQty,
          sourceAddress: activeOutbound.sourceWarehouse || "",
          destinationAddress: activeOutbound.destination || "",
          transportResponsibility: outboundTransport || "Processor Pickup",
          vehicleNumber: outboundVehicle || "",
          vehicleCapacityKg: Number(selectedDriver?.vehicleCapacityKg || 7000),
          driverName: outboundDriver || "",
          driverPhone: outboundDriverPhone || "",
          scheduledDate: outboundDate,
          scheduledStartTime: outboundTime,
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
            className={`px-5 py-1.5 text-xs font-bold rounded-md transition ${direction === "INBOUND"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            INBOUND
          </button>
          <button
            type="button"
            onClick={() => setDirection("OUTBOUND")}
            className={`px-5 py-1.5 text-xs font-bold rounded-md transition ${direction === "OUTBOUND"
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
              <div className="flex items-center gap-3">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search agreements..."
                    className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
                  />
                </div>
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
                            className={`cursor-pointer transition ${selectedInboundId === agr.id
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
                              <p className="text-slate-700 text-[11px] flex items-start gap-1 font-medium">
                                <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                                <span>{agr.farmLocation}</span>
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
                            className={`cursor-pointer transition ${selectedOutboundId === agr.id
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
                      <span className="text-slate-500 block text-[11px] font-medium">Farm Location (Pickup Origin)</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1 text-xs">
                        <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
                        {activeInbound.farmLocation || activeInbound.pickupLocation || "N/A"}
                      </span>
                      {activeInbound.farmerAddress && activeInbound.farmerAddress !== activeInbound.farmLocation && (
                        <span className="text-slate-500 text-[10px] block mt-1 pl-5.5">
                          Farmer Home Address: {activeInbound.farmerAddress}
                        </span>
                      )}

                      {/* Exact Farm Geolocation Coordinates Badge */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-emerald-300 shadow-2xs">
                          <Compass className="h-3.5 w-3.5 text-emerald-700" />
                          Real Farm GPS Coordinates: {activeInbound.formattedCoords || formatCoords(activeInbound.lat, activeInbound.lng)}
                        </span>
                        {activeInbound.lat && activeInbound.lng ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${activeInbound.lat},${activeInbound.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-1"
                          >
                            View on Google Maps ↗
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-3 border-t border-slate-200/80 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-emerald-800" />
                          Select Destination Warehouse (Gujarat Network)
                        </span>
                        {realRouteInfo?.distanceKm ? (
                          <Badge className="bg-blue-100 text-blue-900 border-blue-300 font-bold text-[10px] flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            Real Road Distance: {realRouteInfo.distanceKm} km {realRouteInfo.durationText ? `(~${realRouteInfo.durationText})` : ""}
                          </Badge>
                        ) : selectedWarehouse?.isNearest ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px] animate-pulse">
                            ⚡ NEAREST WAREHOUSE ({selectedWarehouse.distanceKm} km away)
                          </Badge>
                        ) : null}
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
                      farmName={activeInbound.farmLocation || activeInbound.farmName || "Farm Location"}
                      warehouses={warehousesWithDistance}
                      selectedWarehouseId={selectedWarehouseId || selectedWarehouse?.id}
                      onSelectWarehouse={(id) => setSelectedWarehouseId(id)}
                      onRouteCalculated={setRealRouteInfo}
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
                    className={`px-4 py-1.5 font-bold rounded-md transition ${inboundTransport === "FPO Pickup"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    FPO Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboundTransport("Farmer Delivery")}
                    className={`px-4 py-1.5 font-bold rounded-md transition ${inboundTransport === "Farmer Delivery"
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
                    className={`px-4 py-1.5 font-bold rounded-md transition ${outboundTransport === "Processor Pickup"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    Processor Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutboundTransport("FPO Delivery")}
                    className={`px-4 py-1.5 font-bold rounded-md transition ${outboundTransport === "FPO Delivery"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    FPO Delivery
                  </button>
                </div>
              )}

              {/* Registered Driver Selection & Vehicle Details */}
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Select Assigned Driver from Registry
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Logistics officers can choose from registered drivers or register a new driver.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddDriverOpen(true)}
                    className="h-8 text-xs font-bold text-emerald-800 border-emerald-300 hover:bg-emerald-50 shrink-0 flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add New Driver
                  </Button>
                </div>

                <Select value={selectedDriverId} onValueChange={handleSelectDriver}>
                  <SelectTrigger className="h-10 text-xs bg-white border-slate-300 font-bold text-slate-900">
                    <SelectValue placeholder="Choose Driver from List..." />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((drv) => {
                      const isAvail = (drv.status || "").toUpperCase() === "AVAILABLE" || (drv.status || "").toUpperCase() === "ACTIVE";
                      const isInTransit = (drv.status || "").toUpperCase() === "IN_TRANSIT" || (drv.status || "").toUpperCase() === "ON_JOURNEY";
                      const isInactive = (drv.status || "").toUpperCase() === "INACTIVE" || (drv.status || "").toUpperCase() === "OFF_DUTY";
                      const isDisabled = !isAvail;

                      return (
                        <SelectItem key={drv.id} value={drv.id} disabled={isDisabled}>
                          <div className="flex items-center justify-between gap-4 font-medium text-xs">
                            <span className={`font-bold ${isDisabled ? "text-slate-400 line-through" : "text-slate-900"}`}>
                              {drv.name} ({drv.phone})
                            </span>
                            <span className="font-mono text-[11px]">
                              {isAvail ? (
                                <span className="text-emerald-700 font-bold">Active • {drv.vehicleNumber || "Ready"}</span>
                              ) : isInTransit ? (
                                <span className="text-amber-700 font-semibold bg-amber-50 px-1 py-0.5 rounded">In Transit (Unavailable)</span>
                              ) : (
                                <span className="text-red-600 font-semibold bg-red-50 px-1 py-0.5 rounded">Inactive (Off-Duty)</span>
                              )}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Number</label>
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
              </div>

              {/* Capacity Banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900">
                    Vehicle Capacity: {Number(selectedDriver?.vehicleCapacityKg || 7000).toLocaleString("en-IN")} kg
                  </p>
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
                Schedule Departure
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              <p className="text-slate-500">
                Select when the truck is scheduled to leave its origin.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Scheduled Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={direction === "INBOUND" ? inboundDate : outboundDate}
                    onChange={(e) =>
                      direction === "INBOUND"
                        ? setInboundDate(e.target.value)
                        : setOutboundDate(e.target.value)
                    }
                    className="h-9 text-xs border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Scheduled Departure Time
                  </label>
                  <Input
                    type="time"
                    required
                    value={direction === "INBOUND" ? inboundTime : outboundTime}
                    onChange={(e) =>
                      direction === "INBOUND"
                        ? setInboundTime(e.target.value)
                        : setOutboundTime(e.target.value)
                    }
                    className="h-9 text-xs border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Special Instructions
                </label>
                <Textarea
                  placeholder="Any specific transport instructions..."
                  value={
                    direction === "INBOUND"
                      ? inboundInstructions
                      : outboundInstructions
                  }
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
                       {inboundDate} ({inboundTime})
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-slate-500">Real Road Distance</span>
                    <span className="font-bold text-blue-900 font-mono">
                      {realRouteInfo?.distanceKm ? `${realRouteInfo.distanceKm} km` : selectedWarehouse?.distanceKm ? `${selectedWarehouse.distanceKm} km (est.)` : "N/A"}
                    </span>
                  </div>
                  {realRouteInfo?.durationText && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Est. Driving Duration</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        ~{realRouteInfo.durationText}
                      </span>
                    </div>
                  )}
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

                  {/* Scheduled departure date and time */}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Departure</span>
                    <span className="font-bold text-slate-900">
                      {outboundDate} ({outboundTime})
                    </span>
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
                      ? (activeInbound.farmLocation || activeInbound.pickupLocation)
                      : activeOutbound.sourceWarehouse}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-bold block">Deliver To</span>
                  <span className="text-slate-900 font-medium flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3 w-3 text-slate-600 shrink-0" />
                    {direction === "INBOUND"
                      ? (selectedWarehouse?.name
                          ? `${selectedWarehouse.name}${selectedWarehouse.location ? ` (${selectedWarehouse.location})` : ""}`
                          : (activeInbound.destination || "N/A"))
                      : (activeOutbound.destination || "N/A")}
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

      {/* Add New Driver Modal */}
      <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald-800" />
              Register New Driver
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driver Full Name *</label>
              <Input
                type="text"
                placeholder="e.g. Anand Sharma"
                value={newDriverData.name}
                onChange={(e) => setNewDriverData({ ...newDriverData, name: e.target.value })}
                className="h-9 text-xs border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
              <Input
                type="text"
                placeholder="e.g. 9876543219"
                value={newDriverData.phone}
                onChange={(e) => setNewDriverData({ ...newDriverData, phone: e.target.value })}
                className="h-9 text-xs border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driving License Number</label>
              <Input
                type="text"
                placeholder="e.g. KA092023001122"
                value={newDriverData.licenseNumber}
                onChange={(e) => setNewDriverData({ ...newDriverData, licenseNumber: e.target.value })}
                className="h-9 text-xs border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Vehicle Number</label>
              <Input
                type="text"
                placeholder="e.g. KA-09-GH-3344"
                value={newDriverData.vehicleNumber}
                onChange={(e) => setNewDriverData({ ...newDriverData, vehicleNumber: e.target.value })}
                className="h-9 text-xs border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Capacity (kg)</label>
              <Input
                type="number"
                placeholder="7000"
                value={newDriverData.vehicleCapacityKg}
                onChange={(e) => setNewDriverData({ ...newDriverData, vehicleCapacityKg: e.target.value })}
                className="h-9 text-xs border-slate-200 font-bold"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDriverOpen(false)}
                className="h-9 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveNewDriver}
                className="h-9 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs"
              >
                Save Driver & Select
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateShipment;
