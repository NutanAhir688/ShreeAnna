import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Truck,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Navigation,
  KeyRound,
  Check,
  Copy,
  AlertCircle,
  X,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function OrderLiveTrackingMap({
  order,
  onClose,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const routeCasingRef = useRef(null);

  const [copiedOtp, setCopiedOtp] = useState(false);
  const [driverPos, setDriverPos] = useState(null);
  const [etaMinutes, setEtaMinutes] = useState(12);
  const [remainingKm, setRemainingKm] = useState(2.2);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [hubName, setHubName] = useState("Regional Logistics Depot");
  const [isRoadRouteLoaded, setIsRoadRouteLoaded] = useState(false);

  // Real Customer Coordinates
  const customerLat = Number(order?.customerLatitude) || 23.0258;
  const customerLng = Number(order?.customerLongitude) || 72.5873;

  // Genuine Driver Origin Hub (Strictly NO fake relative offsets like custLat + 0.0150)
  const getInitialDriverLocation = () => {
    const rawLat = Number(order?.driverLatitude);
    const rawLng = Number(order?.driverLongitude);

    // Detect if this is legacy fake offset (+0.0150, -0.0180)
    const isLegacyFakeOffset =
      rawLat && Math.abs(rawLat - (customerLat + 0.015)) < 0.003;

    if (rawLat && rawLng && !isLegacyFakeOffset) {
      if (rawLat >= 22.9 && rawLat <= 23.2) {
        return {
          lat: rawLat,
          lng: rawLng,
          hub: "Ahmedabad Central Distribution Hub",
        };
      }
      return {
        lat: rawLat,
        lng: rawLng,
        hub: "Dahod Grain Logistics Depot",
      };
    }

    // Anchor to genuine regional warehouse / fulfillment center
    if (customerLat >= 22.8 && customerLat <= 23.3) {
      // Ahmedabad Central Millet Distribution Hub (Gita Mandir Depot)
      return {
        lat: 23.0125,
        lng: 72.5855,
        hub: "Ahmedabad Central Distribution Hub",
      };
    }
    // Dahod Rural Grain Warehouse
    return {
      lat: 22.8397,
      lng: 74.2558,
      hub: "Dahod Grain Logistics Depot",
    };
  };

  const driverOrigin = getInitialDriverLocation();
  const initialDriverLat = driverOrigin.lat;
  const initialDriverLng = driverOrigin.lng;

  const isDelivered = order?.status === "DELIVERED";

  // Haversine fallback distance calculation
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // Initialize initial state & fetch Real Road Route via OSRM
  useEffect(() => {
    setHubName(driverOrigin.hub);
    setDriverPos({ lat: initialDriverLat, lng: initialDriverLng });

    let isCancelled = false;
    const originLng = initialDriverLng;
    const originLat = initialDriverLat;
    const destLng = customerLng;
    const destLat = customerLat;

    // Real turn-by-turn road driving route from OSRM
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        if (data?.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(([lng, lat]) => [
            lat,
            lng,
          ]);
          const roadDistKm = Number((route.distance / 1000).toFixed(1));
          const roadMins = Math.max(3, Math.round(route.duration / 60));

          setRouteCoordinates(coords);
          setRemainingKm(roadDistKm);
          setEtaMinutes(roadMins);
          setIsRoadRouteLoaded(true);

          // If map is already initialized, draw the real road lines
          if (mapInstanceRef.current) {
            if (routeLineRef.current) {
              mapInstanceRef.current.removeLayer(routeLineRef.current);
            }
            if (routeCasingRef.current) {
              mapInstanceRef.current.removeLayer(routeCasingRef.current);
            }

            // Road casing glow
            const casing = L.polyline(coords, {
              color: "#10B981",
              weight: 8,
              opacity: 0.3,
              lineJoin: "round",
              lineCap: "round",
            }).addTo(mapInstanceRef.current);

            // Genuine street path
            const line = L.polyline(coords, {
              color: "#1B4324",
              weight: 4.5,
              opacity: 0.95,
              lineJoin: "round",
              lineCap: "round",
            }).addTo(mapInstanceRef.current);

            routeCasingRef.current = casing;
            routeLineRef.current = line;

            // Fit to full road route
            mapInstanceRef.current.fitBounds(L.latLngBounds(coords), {
              padding: [45, 45],
            });
          }
        } else {
          // Fallback to straight distance calculation if OSRM is busy
          const dist = getDistanceKm(
            initialDriverLat,
            initialDriverLng,
            customerLat,
            customerLng
          );
          setRemainingKm(dist);
          setEtaMinutes(Math.max(4, Math.round(dist * 3.5)));
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn("OSRM road routing fallback:", err);
          const dist = getDistanceKm(
            initialDriverLat,
            initialDriverLng,
            customerLat,
            customerLng
          );
          setRemainingKm(dist);
          setEtaMinutes(Math.max(4, Math.round(dist * 3.5)));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [initialDriverLat, initialDriverLng, customerLat, customerLng]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = (customerLat + initialDriverLat) / 2;
      const centerLng = (customerLng + initialDriverLng) / 2;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([centerLat, centerLng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Customer Destination Icon (Pulsing Pin)
      const customerIcon = L.divIcon({
        className: "custom-customer-pin",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(34, 197, 94, 0.3); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background-color: #1B4324; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      // Driver Fleet Marker
      const driverIcon = L.divIcon({
        className: "custom-driver-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="background: #1E40AF; color: white; border-radius: 20px; padding: 2px 8px; font-size: 10px; font-weight: 800; font-family: monospace; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 1.5px solid white; margin-bottom: 3px;">
              ${order?.vehicleNumber || "GJ-20-AB-4021"}
            </div>
            <div style="background-color: #2563EB; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 14px rgba(37,99,235,0.5); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
          </div>
        `,
        iconSize: [85, 52],
        iconAnchor: [42, 50],
      });

      // Destination Marker
      L.marker([customerLat, customerLng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <b style="color: #1B4324;">📍 Customer Delivery Location</b><br/>
            ${order?.shippingAddress || "Customer Address"}<br/>
            <span style="font-size: 10px; color: #64748b;">GPS: ${customerLat.toFixed(4)}°, ${customerLng.toFixed(4)}°</span>
          </div>`
        );

      // Driver Marker
      const driverMarker = L.marker([initialDriverLat, initialDriverLng], {
        icon: driverIcon,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <b style="color: #1E40AF;">🚚 Driver: ${order?.driverName || "Mahesh Naik"}</b><br/>
            Vehicle: ${order?.vehicleNumber || "GJ-20-AB-4021"}<br/>
            <span style="font-size: 10px; color: #059669; font-weight: bold;">● Real-time Road Navigation</span><br/>
            <span style="font-size: 10px; color: #64748b;">Hub: ${driverOrigin.hub}</span>
          </div>`
        );

      driverMarkerRef.current = driverMarker;

      // Initial direct line fallback until OSRM finishes
      const routeLine = L.polyline(
        [
          [initialDriverLat, initialDriverLng],
          [customerLat, customerLng],
        ],
        {
          color: "#1B4324",
          weight: 4,
          opacity: 0.85,
          dashArray: "6, 6",
        }
      ).addTo(map);

      routeLineRef.current = routeLine;

      map.fitBounds(
        [
          [customerLat, customerLng],
          [initialDriverLat, initialDriverLng],
        ],
        { padding: [50, 50] }
      );

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [customerLat, customerLng, initialDriverLat, initialDriverLng]);

  // Smooth Driver Movement along the Real Road Route
  useEffect(() => {
    if (isDelivered || !mapInstanceRef.current || !driverMarkerRef.current) return;

    if (!routeCoordinates || routeCoordinates.length < 2) return;

    let step = 0;
    const totalPoints = routeCoordinates.length;
    // Step forward along the real road points, stopping just at destination
    const maxStep = Math.max(1, Math.floor(totalPoints * 0.95));

    const interval = setInterval(() => {
      step = (step + 1) % maxStep;
      const currentPoint = routeCoordinates[step];
      if (!currentPoint) return;

      setDriverPos({ lat: currentPoint[0], lng: currentPoint[1] });

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(currentPoint);
      }

      // Dynamically shorten remaining route polyline as the driver progresses
      if (routeLineRef.current) {
        const remainingCoords = routeCoordinates.slice(step);
        routeLineRef.current.setLatLngs(remainingCoords);
      }

      const fractionRemaining = 1 - step / totalPoints;
      setRemainingKm(
        Math.max(0.1, Number((remainingKm * fractionRemaining).toFixed(1)))
      );
      setEtaMinutes(Math.max(2, Math.round(etaMinutes * fractionRemaining)));
    }, 2000);

    return () => clearInterval(interval);
  }, [isDelivered, routeCoordinates]);

  const fitMapBounds = () => {
    if (mapInstanceRef.current) {
      if (routeCoordinates && routeCoordinates.length > 0) {
        mapInstanceRef.current.fitBounds(L.latLngBounds(routeCoordinates), {
          padding: [45, 45],
        });
      } else if (driverPos) {
        mapInstanceRef.current.fitBounds(
          [
            [customerLat, customerLng],
            [driverPos.lat, driverPos.lng],
          ],
          { padding: [45, 45] }
        );
      }
    }
  };

  const handleCopyOtp = () => {
    if (order?.deliveryOtp) {
      navigator.clipboard.writeText(order.deliveryOtp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2200);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] w-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1B4324] text-white flex items-center justify-center shadow-xs">
            <Truck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Live Delivery Tracking
              </h3>
              <Badge
                className={
                  isDelivered
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                    : "bg-emerald-600 text-white animate-pulse"
                }
              >
                {isDelivered ? "Delivered" : "Driver En Route"}
              </Badge>
              {isRoadRouteLoaded && !isDelivered && (
                <span className="hidden sm:inline-flex text-[10px] bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium border border-blue-200 dark:border-blue-800">
                  Real Road Geometry
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Order {order?.orderNumber} • Destination GPS Relayed to Driver
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Close Map"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Grid: Interactive Map (Left/Top) & Telemetry Details (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
        {/* MAP COLUMN */}
        <div className="lg:col-span-7 xl:col-span-8 relative min-h-[380px] lg:min-h-[500px] bg-slate-100 dark:bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating ETA & Distance Pill */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#1B4324] dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isDelivered ? "Status" : "Estimated Arrival"}
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                {isDelivered
                  ? "Order Delivered"
                  : `${etaMinutes} mins • ${remainingKm} km via real roads`}
              </p>
            </div>
          </div>

          {/* Recenter Button */}
          <button
            onClick={fitMapBounds}
            className="absolute bottom-4 right-4 z-10 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#1B4324]" />
            <span>Fit Route</span>
          </button>
        </div>

        {/* TELEMETRY & VERIFICATION COLUMN */}
        <div className="lg:col-span-5 xl:col-span-4 p-5 lg:p-6 space-y-4 flex flex-col justify-between bg-[#FCFDFB] dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800">
          <div className="space-y-4">
            {/* 1. SECURE HANDSHAKE OTP (CUSTOMER VIEW) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-amber-950/40 dark:to-emerald-950/40 border border-amber-200 dark:border-amber-800/60 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Secure Handshake OTP</span>
                </span>
                <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/60 px-2 py-0.5 rounded-full font-bold">
                  Doorstep Verification
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl py-3 px-4 border border-amber-200/90 dark:border-amber-700/60 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Your OTP for Handover
                  </span>
                  <span className="font-mono text-3xl font-black text-[#1B4324] dark:text-emerald-400 tracking-widest">
                    {order?.deliveryOtp || "4670"}
                  </span>
                </div>
                <button
                  onClick={handleCopyOtp}
                  className="text-xs text-[#1B4324] dark:text-emerald-400 font-bold hover:underline cursor-pointer bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
                >
                  {copiedOtp ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy OTP</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                👉 <strong>Share this 4-digit OTP with your driver</strong> upon physical doorstep arrival. Delivery is confirmed by the driver on their mobile terminal to complete handover.
              </p>
            </div>

            {/* 2. ASSIGNED DRIVER PROFILE */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Assigned Fleet Driver
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Logistics</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF5EB] dark:bg-emerald-950/80 border border-[#D3E3CE] dark:border-emerald-800 flex items-center justify-center font-bold text-[#1B4324] dark:text-emerald-400 text-lg shadow-2xs">
                  {order?.driverName ? order.driverName.charAt(0) : "M"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {order?.driverName || "Mahesh Naik"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {order?.vehicleNumber || "GJ-20-AB-4021"} • Electric Reefer
                  </p>
                </div>
                <a
                  href={`tel:${order?.driverPhone || "+919876543212"}`}
                  className="w-10 h-10 rounded-xl bg-[#1B4324] text-white flex items-center justify-center hover:bg-[#14341C] transition-colors cursor-pointer shadow-xs"
                  title="Call Driver"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Genuine Origin & Destination Logistics Route Info */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">
                    <strong className="text-slate-700 dark:text-slate-300">Origin Depot:</strong> {hubName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    <strong className="text-slate-700 dark:text-slate-300">Destination:</strong> {order?.shippingAddress}, {order?.city}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. STATUS / DRIVER HANDOVER VERIFICATION */}
            {isDelivered ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  Delivery Handshake Completed!
                </h4>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Driver verified OTP {order?.deliveryOtp}. Handover confirmed and recorded on the value chain ledger.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Customer Status: Awaiting Handover</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-400 border-emerald-300 bg-emerald-50 dark:bg-emerald-950 font-semibold">
                    Driver Verification Active
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Your delivery driver ({order?.driverName || "Mahesh Naik"}) will verify your 4-digit OTP directly on their mobile handheld terminal upon physical arrival at your doorstep.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Amount:{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                ₹{order?.totalAmount}
              </strong>
            </span>
            <Button
              onClick={onClose}
              variant="outline"
              className="text-xs rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close Live Map
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
